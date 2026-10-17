import { PDFDocument, PDFFont, PDFPage, PDFRef, rgb } from 'pdf-lib';
import type { MarkdownBlock, MarkdownInline } from '@/lib/markdown';
import { PDF_CONFIG } from './constants';
import { checkNewPage, drawLinkText, sanitizeText } from './pdfHelpers';

export interface MarkdownFonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
}

type Color = ReturnType<typeof rgb>;

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
}

interface Piece {
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
}

interface Word {
  pieces: Piece[];
  width: number;
  /** True when this is a continuation of a word that was split to fit a line. */
  glue?: boolean;
}

function fontFor(piece: Piece, fonts: MarkdownFonts): PDFFont {
  if (piece.bold && piece.italic) return fonts.boldItalic;
  if (piece.bold) return fonts.bold;
  if (piece.italic) return fonts.italic;
  return fonts.regular;
}

function sameStyle(a: Piece, b: Piece): boolean {
  return a.bold === b.bold && a.italic === b.italic && a.href === b.href;
}

function flatten(
  nodes: MarkdownInline[],
  inherited: { bold?: boolean; italic?: boolean; href?: string } = {},
): Run[] {
  const runs: Run[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        if (node.value) {
          runs.push({
            text: node.value,
            bold: inherited.bold ?? false,
            italic: inherited.italic ?? false,
            href: inherited.href,
          });
        }
        break;
      case 'strong':
        runs.push(...flatten(node.children, { ...inherited, bold: true }));
        break;
      case 'em':
        runs.push(...flatten(node.children, { ...inherited, italic: true }));
        break;
      case 'strongEm':
        runs.push(...flatten(node.children, { ...inherited, bold: true, italic: true }));
        break;
      case 'link':
        runs.push(...flatten(node.children, { ...inherited, href: node.href }));
        break;
    }
  }

  return runs;
}

function buildWords(runs: Run[], fontSize: number, fonts: MarkdownFonts): Word[] {
  const words: Word[] = [];
  let pieces: Piece[] = [];

  const flush = () => {
    if (!pieces.length) return;
    const width = pieces.reduce(
      (sum, piece) => sum + fontFor(piece, fonts).widthOfTextAtSize(piece.text, fontSize),
      0,
    );
    words.push({ pieces, width });
    pieces = [];
  };

  for (const run of runs) {
    for (const char of sanitizeText(run.text)) {
      if (/\s/.test(char)) {
        flush();
        continue;
      }

      const last = pieces[pieces.length - 1];
      if (last && sameStyle(last, run)) {
        last.text += char;
      } else {
        pieces.push({ text: char, bold: run.bold, italic: run.italic, href: run.href });
      }
    }
  }

  flush();
  return words;
}

function breakWord(word: Word, maxWidth: number, fontSize: number, fonts: MarkdownFonts): Word[] {
  const chunks: Word[] = [];
  let pieces: Piece[] = [];
  let width = 0;

  const flush = () => {
    if (!pieces.length) return;
    chunks.push({ pieces, width });
    pieces = [];
    width = 0;
  };

  for (const piece of word.pieces) {
    for (const char of piece.text) {
      const charWidth = fontFor(piece, fonts).widthOfTextAtSize(char, fontSize);
      if (pieces.length && width + charWidth > maxWidth) flush();

      const last = pieces[pieces.length - 1];
      if (last && sameStyle(last, piece)) {
        last.text += char;
      } else {
        pieces.push({ text: char, bold: piece.bold, italic: piece.italic, href: piece.href });
      }
      width += charWidth;
    }
  }

  flush();

  return chunks.map((chunk, index) => (index === 0 ? chunk : { ...chunk, glue: true }));
}

function wrapWords(
  words: Word[],
  maxWidth: number,
  fontSize: number,
  fonts: MarkdownFonts,
  spaceWidth: number,
): Word[][] {
  const lines: Word[][] = [];
  let current: Word[] = [];
  let currentWidth = 0;

  const pushLine = () => {
    if (current.length) lines.push(current);
    current = [];
    currentWidth = 0;
  };

  for (const original of words) {
    const candidates =
      original.width > maxWidth ? breakWord(original, maxWidth, fontSize, fonts) : [original];

    for (const word of candidates) {
      const gap = current.length && !word.glue ? spaceWidth : 0;

      if (current.length && currentWidth + gap + word.width > maxWidth) {
        pushLine();
      }

      const actualGap = current.length && !word.glue ? spaceWidth : 0;
      current.push(word);
      currentWidth += actualGap + word.width;
    }
  }

  pushLine();
  return lines;
}

export interface RenderMarkdownOptions {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  lineHeight: number;
  color: Color;
  fonts: MarkdownFonts;
  bulletIndent?: number;
  paragraphSpacing?: number;
}

/**
 * Draws Markdown blocks with inline bold/italic/link styling. Wrapping and page
 * breaks are handled here so every call site behaves consistently.
 */
export function renderMarkdown(
  page: PDFPage,
  pdfDoc: PDFDocument,
  blocks: MarkdownBlock[],
  options: RenderMarkdownOptions,
  pageAnnotations: PDFRef[],
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } {
  const { x, maxWidth, fontSize, lineHeight, color, fonts } = options;
  const bulletIndent = options.bulletIndent ?? 10;
  const paragraphSpacing = options.paragraphSpacing ?? 6;
  const spaceWidth = fonts.regular.widthOfTextAtSize(' ', fontSize);

  let currentPage = page;
  let currentY = options.y;
  let annotations = [...pageAnnotations];

  for (const block of blocks) {
    for (const line of block.lines) {
      const words = buildWords(flatten(line.children), fontSize, fonts);
      if (!words.length) continue;

      const indent = line.bullet ? bulletIndent : 0;
      const visualLines = wrapWords(words, maxWidth - indent, fontSize, fonts, spaceWidth);

      visualLines.forEach((visualWords, visualIndex) => {
        const result = checkNewPage(currentY, lineHeight, currentPage, annotations, pdfDoc);
        currentPage = result.newPage;
        currentY = result.newY;
        annotations = result.newAnnotations;

        if (line.bullet && visualIndex === 0) {
          currentPage.drawCircle({
            x: x + 3,
            y: currentY + fontSize * 0.3,
            size: 2,
            color: PDF_CONFIG.COLORS.GREEN,
          });
        }

        let cursorX = x + indent;

        visualWords.forEach((word, wordIndex) => {
          if (wordIndex > 0 && !word.glue) cursorX += spaceWidth;

          for (const piece of word.pieces) {
            const font = fontFor(piece, fonts);

            if (piece.href) {
              drawLinkText(
                currentPage,
                piece.text,
                cursorX,
                currentY,
                fontSize,
                font,
                piece.href,
                annotations,
              );
            } else {
              currentPage.drawText(piece.text, {
                x: cursorX,
                y: currentY,
                size: fontSize,
                font,
                color,
              });
            }

            cursorX += font.widthOfTextAtSize(piece.text, fontSize);
          }
        });

        currentY -= lineHeight;
      });
    }

    currentY -= paragraphSpacing;
  }

  return { newPage: currentPage, newY: currentY, newAnnotations: annotations };
}
