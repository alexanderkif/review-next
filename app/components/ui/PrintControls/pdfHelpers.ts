import { PDFFont, PDFPage, PDFDocument, PDFRef, rgb } from 'pdf-lib';
import { PDF_CONFIG } from './constants';

/**
 * Characters commonly found in user content that pdf-lib's WinAnsi (CP1252)
 * standard fonts cannot encode. They are mapped to a visually similar
 * encodable character instead of being dropped.
 */
const WIN_ANSI_REPLACEMENTS: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201A': ',',
  '\u201B': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u201E': '"',
  '\u201F': '"',
  '\u2013': '-',
  '\u2014': '-',
  '\u2015': '-',
  '\u2026': '...',
  '\u00A0': ' ',
  '\u2007': ' ',
  '\u2009': ' ',
  '\u200A': ' ',
  '\u202F': ' ',
  '\u200B': '',
  '\u200C': '',
  '\u200D': '',
  '\uFEFF': '',
  '\u2192': '->',
  '\u2190': '<-',
};

const isWinAnsiEncodable = (char: string): boolean => {
  const code = char.codePointAt(0) ?? 0;
  // Printable ASCII and Latin-1 supplement map 1:1 to WinAnsi.
  if (code >= 0x20 && code <= 0x7e) return true;
  if (code >= 0xa0 && code <= 0xff) return true;
  // The bullet is used internally as a separator and encodes as 0x95 in WinAnsi.
  return char === '\u2022';
};

/**
 * Makes arbitrary (untrusted) text safe to measure and draw with pdf-lib's
 * standard fonts: line breaks and tabs are collapsed to spaces and characters
 * outside WinAnsi (emoji, Cyrillic, CJK, ...) are removed. Without this,
 * `widthOfTextAtSize`/`drawText` throw e.g. `WinAnsi cannot encode "\n"`.
 */
export const sanitizeText = (text: string): string => {
  let result = '';
  for (const char of text) {
    const replacement = WIN_ANSI_REPLACEMENTS[char];
    if (replacement !== undefined) {
      result += replacement;
      continue;
    }
    if (char === '\n' || char === '\r' || char === '\t' || char === '\v' || char === '\f') {
      result += ' ';
      continue;
    }
    if (isWinAnsiEncodable(char)) {
      result += char;
    }
  }
  return result;
};

export const checkNewPage = (
  y: number,
  requiredSpace: number,
  page: PDFPage,
  pageAnnotations: PDFRef[],
  pdfDoc: PDFDocument,
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } => {
  if (y - requiredSpace < PDF_CONFIG.MARGIN) {
    // Set annotations for current page before creating new one
    if (pageAnnotations.length > 0) {
      page.node.set(page.doc.context.obj('Annots'), page.doc.context.obj(pageAnnotations));
    }
    const newPage = pdfDoc.addPage([PDF_CONFIG.PAGE_WIDTH, PDF_CONFIG.PAGE_HEIGHT]);
    return {
      newPage,
      newY: PDF_CONFIG.PAGE_HEIGHT - PDF_CONFIG.MARGIN,
      newAnnotations: [],
    };
  }
  return { newPage: page, newY: y, newAnnotations: pageAnnotations };
};

/**
 * Splits a single unbreakable token (e.g. a long URL) into pieces that each fit
 * within `maxWidth`, so it can be wrapped instead of overflowing the page.
 */
export const breakLongWord = (
  word: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
): string[] => {
  const chunks: string[] = [];
  let current = '';

  for (const char of word) {
    const test = current + char;
    if (current && font.widthOfTextAtSize(test, fontSize) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = test;
    }
  }

  if (current) chunks.push(current);
  return chunks;
};

export const wrapText = (
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
): string[] => {
  const words = sanitizeText(text).split(' ');
  const lines: string[] = [];
  let currentLine = '';

  const flush = () => {
    if (currentLine) lines.push(currentLine);
    currentLine = '';
  };

  for (const word of words) {
    // Break words that are wider than a whole line (e.g. URLs) instead of
    // letting them overflow the page.
    if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
      flush();
      const chunks = breakLongWord(word, maxWidth, fontSize, font);
      for (let i = 0; i < chunks.length - 1; i++) lines.push(chunks[i]);
      currentLine = chunks[chunks.length - 1] ?? '';
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      flush();
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  flush();
  return lines;
};

/**
 * Draws a green link segment and registers a link annotation covering it.
 */
export const drawLinkText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  font: PDFFont,
  href: string,
  annotations: PDFRef[],
): void => {
  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: PDF_CONFIG.COLORS.GREEN,
  });

  const width = font.widthOfTextAtSize(text, fontSize);
  const linkAnnotation = page.doc.context.register(
    page.doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x, y - 2, x + width, y + 9],
      Border: [0, 0, 0],
      C: [0, 0, 0],
      A: page.doc.context.obj({
        Type: 'Action',
        S: 'URI',
        URI: page.doc.context.obj(href),
      }),
    }),
  );
  annotations.push(linkAnnotation);
};

export const drawTextWithGreenBullets = (
  page: PDFPage,
  text: string,
  x: number,
  yPos: number,
  fontSize: number,
  font: PDFFont,
  defaultColor: ReturnType<typeof rgb>,
) => {
  const textWithBullets = sanitizeText(text).replace(/\s-\s/g, ' • ');
  const parts = textWithBullets.split('•');
  let currentX = x;
  const bulletColor = PDF_CONFIG.COLORS.GREEN;

  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      const spaceWidth = font.widthOfTextAtSize(' ', fontSize);
      currentX += spaceWidth;

      const bulletY = yPos + fontSize * 0.3;
      const bulletSize = fontSize <= 8 ? 1.5 : 2;
      page.drawCircle({
        x: currentX + fontSize * 0.15,
        y: bulletY,
        size: bulletSize,
        color: bulletColor,
      });
      currentX += font.widthOfTextAtSize('•', fontSize) + spaceWidth;
    }

    if (parts[i]) {
      page.drawText(parts[i], {
        x: currentX,
        y: yPos,
        size: fontSize,
        font: font,
        color: defaultColor,
      });
      currentX += font.widthOfTextAtSize(parts[i], fontSize);
    }
  }
};

export const renderSectionHeader = (
  page: PDFPage,
  title: string,
  y: number,
  helveticaBold: PDFFont,
): number => {
  const { MARGIN, PAGE_WIDTH, COLORS, LINE_HEIGHT } = PDF_CONFIG;
  let currentY = y;

  // Section title
  page.drawText(title, {
    x: MARGIN,
    y: currentY,
    size: 11,
    font: helveticaBold,
    color: COLORS.GREEN,
  });
  currentY -= 5;

  // Line under heading
  page.drawLine({
    start: { x: MARGIN, y: currentY },
    end: { x: PAGE_WIDTH - MARGIN, y: currentY },
    thickness: 0.5,
    color: COLORS.GREEN,
  });
  currentY -= LINE_HEIGHT + 10;

  return currentY;
};
