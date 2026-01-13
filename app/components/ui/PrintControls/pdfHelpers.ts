import { PDFFont, PDFPage, PDFDocument, PDFRef, rgb } from 'pdf-lib';
import { PDF_CONFIG } from './constants';

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

export const wrapText = (
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
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
  const textWithBullets = text.replace(/\s-\s/g, ' • ');
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
