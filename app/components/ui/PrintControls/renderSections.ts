import { PDFDocument, PDFFont, PDFPage, PDFRef } from 'pdf-lib';
import { CVData } from './types';
import { PDF_CONFIG, getContentWidth } from './constants';
import { checkNewPage, wrapText, drawTextWithGreenBullets, renderSectionHeader } from './pdfHelpers';

export const renderHighlights = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  cvData: CVData,
  helveticaBold: PDFFont,
  helveticaFont: PDFFont,
  y: number,
  pageAnnotations: PDFRef[]
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } => {
  if (!cvData.about) {
    return { newPage: page, newY: y, newAnnotations: pageAnnotations };
  }

  let currentPage = page;
  let currentY = y;
  let annotations = [...pageAnnotations];
  const { MARGIN, PAGE_WIDTH, COLORS, LINE_HEIGHT } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  const result = checkNewPage(currentY, 40, currentPage, annotations, pdfDoc);
  currentPage = result.newPage;
  currentY = result.newY - 10;
  annotations = result.newAnnotations;

  currentY = renderSectionHeader(currentPage, 'HIGHLIGHTS', currentY, helveticaBold);

  // Parse and render highlights
  const highlights = cvData.about
    .split('\n')
    .filter((line: string) => {
      const trimmed = line.trim();
      return trimmed && (trimmed.startsWith('•') || trimmed.startsWith('-'));
    });

  for (const highlight of highlights) {
    const result = checkNewPage(currentY, 30, currentPage, annotations, pdfDoc);
    currentPage = result.newPage;
    currentY = result.newY;
    annotations = result.newAnnotations;

    const text = highlight.replace(/^[•\-]\s*/, '');
    const lines = wrapText(text, contentWidth - 15, 10, helveticaFont);

    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        const result = checkNewPage(
          currentY,
          LINE_HEIGHT,
          currentPage,
          annotations,
          pdfDoc
        );
        currentPage = result.newPage;
        currentY = result.newY;
        annotations = result.newAnnotations;
      }

      // Draw bullet only for first line
      if (i === 0) {
        currentPage.drawCircle({
          x: MARGIN + 3,
          y: currentY + 10 * 0.3,
          size: 2,
          color: COLORS.GREEN,
        });
      }

      currentPage.drawText(lines[i], {
        x: MARGIN + 10,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.GRAY,
      });
      currentY -= LINE_HEIGHT;
    }
    currentY -= 3;
  }

  return { newPage: currentPage, newY: currentY, newAnnotations: annotations };
};

export const renderWorkExperience = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  cvData: CVData,
  helveticaBold: PDFFont,
  helveticaFont: PDFFont,
  y: number,
  pageAnnotations: PDFRef[]
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } => {
  if (!cvData.experience?.length) {
    return { newPage: page, newY: y, newAnnotations: pageAnnotations };
  }

  let currentPage = page;
  let currentY = y;
  let annotations = [...pageAnnotations];
  const { MARGIN, PAGE_WIDTH, COLORS, LINE_HEIGHT } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  // Check space for section header
  const result = checkNewPage(currentY, 40, currentPage, annotations, pdfDoc);
  currentPage = result.newPage;
  currentY = result.newY - 10;
  annotations = result.newAnnotations;

  currentY = renderSectionHeader(currentPage, 'WORK EXPERIENCE', currentY, helveticaBold);

  // Render each experience
  for (const exp of cvData.experience) {
    const result = checkNewPage(currentY, 60, currentPage, annotations, pdfDoc);
    currentPage = result.newPage;
    currentY = result.newY;
    annotations = result.newAnnotations;

    // Job title
    currentPage.drawText(exp.title, {
      x: MARGIN,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: COLORS.GREEN,
    });
    currentY -= 16;

    // Company
    drawTextWithGreenBullets(
      currentPage,
      exp.company,
      MARGIN,
      currentY,
      10,
      helveticaBold,
      COLORS.GRAY
    );
    currentY -= 14;

    // Period
    const period = exp.period + (exp.current ? ' (Current)' : '');
    drawTextWithGreenBullets(
      currentPage,
      period,
      MARGIN,
      currentY,
      8,
      helveticaFont,
      COLORS.LIGHT_GRAY
    );
    currentY -= 16;

    // Description
    const descLines = wrapText(exp.description, contentWidth, 10, helveticaFont);
    for (const line of descLines) {
      const result = checkNewPage(
        currentY,
        LINE_HEIGHT + 2,
        currentPage,
        annotations,
        pdfDoc
      );
      currentPage = result.newPage;
      currentY = result.newY;
      annotations = result.newAnnotations;

      currentPage.drawText(line, {
        x: MARGIN,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.GRAY,
      });
      currentY -= LINE_HEIGHT + 2;
    }
    currentY -= 8;
  }

  return { newPage: currentPage, newY: currentY, newAnnotations: annotations };
};

export const renderEducation = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  cvData: CVData,
  helveticaBold: PDFFont,
  helveticaFont: PDFFont,
  y: number,
  pageAnnotations: PDFRef[]
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } => {
  if (!cvData.education?.length) {
    return { newPage: page, newY: y, newAnnotations: pageAnnotations };
  }

  let currentPage = page;
  let currentY = y;
  let annotations = [...pageAnnotations];
  const { MARGIN, PAGE_WIDTH, COLORS, LINE_HEIGHT } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  const result = checkNewPage(currentY, 40, currentPage, annotations, pdfDoc);
  currentPage = result.newPage;
  currentY = result.newY - 10;
  annotations = result.newAnnotations;

  currentY = renderSectionHeader(currentPage, 'EDUCATION', currentY, helveticaBold);

  for (const edu of cvData.education) {
    const result = checkNewPage(currentY, 60, currentPage, annotations, pdfDoc);
    currentPage = result.newPage;
    currentY = result.newY;
    annotations = result.newAnnotations;

    currentPage.drawText(edu.degree, {
      x: MARGIN,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: COLORS.GREEN,
    });
    currentY -= 16;

    drawTextWithGreenBullets(
      currentPage,
      edu.institution,
      MARGIN,
      currentY,
      10,
      helveticaBold,
      COLORS.GRAY
    );
    currentY -= 14;

    drawTextWithGreenBullets(
      currentPage,
      edu.period,
      MARGIN,
      currentY,
      8,
      helveticaFont,
      COLORS.LIGHT_GRAY
    );
    currentY -= 16;

    if (edu.description) {
      // Check if description contains URL
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = urlRegex.exec(edu.description);
      
      if (match) {
        // Has URL - render prefix text and URL on same line
        const url = match[0];
        const prefix = edu.description.substring(0, match.index);
        
        const result = checkNewPage(
          currentY,
          LINE_HEIGHT + 2,
          currentPage,
          annotations,
          pdfDoc
        );
        currentPage = result.newPage;
        currentY = result.newY;
        annotations = result.newAnnotations;

        let lineX = MARGIN;
        
        // Draw prefix (e.g., "WES: ")
        if (prefix) {
          currentPage.drawText(prefix, {
            x: lineX,
            y: currentY,
            size: 10,
            font: helveticaFont,
            color: COLORS.GRAY,
          });
          lineX += helveticaFont.widthOfTextAtSize(prefix, 10);
        }
        
        // Draw URL in green
        const urlWidth = helveticaFont.widthOfTextAtSize(url, 10);
        currentPage.drawText(url, {
          x: lineX,
          y: currentY,
          size: 10,
          font: helveticaFont,
          color: COLORS.GREEN,
        });
        
        // Add link annotation
        const linkAnnotation = currentPage.doc.context.register(
          currentPage.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [lineX, currentY - 2, lineX + urlWidth, currentY + 9],
            Border: [0, 0, 0],
            C: [0, 0, 0],
            A: currentPage.doc.context.obj({
              Type: 'Action',
              S: 'URI',
              URI: currentPage.doc.context.obj(url),
            }),
          })
        );
        annotations.push(linkAnnotation);
        
        currentY -= LINE_HEIGHT + 2;
      } else {
        // No URL - render normally
        const descLines = wrapText(edu.description, contentWidth, 10, helveticaFont);
        for (const line of descLines) {
          const result = checkNewPage(
            currentY,
            LINE_HEIGHT + 2,
            currentPage,
            annotations,
            pdfDoc
          );
          currentPage = result.newPage;
          currentY = result.newY;
          annotations = result.newAnnotations;

          currentPage.drawText(line, {
            x: MARGIN,
            y: currentY,
            size: 10,
            font: helveticaFont,
            color: COLORS.GRAY,
          });
          currentY -= LINE_HEIGHT + 2;
        }
      }
    }
    currentY -= 8;
  }

  return { newPage: currentPage, newY: currentY, newAnnotations: annotations };
};

export const renderLanguages = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  cvData: CVData,
  helveticaBold: PDFFont,
  helveticaFont: PDFFont,
  y: number,
  pageAnnotations: PDFRef[]
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } => {
  if (!cvData.languages?.length) {
    return { newPage: page, newY: y, newAnnotations: pageAnnotations };
  }

  let currentPage = page;
  let currentY = y;
  let annotations = [...pageAnnotations];
  const { MARGIN, PAGE_WIDTH, COLORS, LINE_HEIGHT } = PDF_CONFIG;

  const result = checkNewPage(currentY, 40, currentPage, annotations, pdfDoc);
  currentPage = result.newPage;
  currentY = result.newY - 10;
  annotations = result.newAnnotations;

  currentY = renderSectionHeader(currentPage, 'LANGUAGES', currentY, helveticaBold);

  // Two-column layout
  const columnWidth = (PAGE_WIDTH - 3 * MARGIN) / 2;
  const leftColumnX = MARGIN;
  const rightColumnX = MARGIN + columnWidth + MARGIN;
  
  let leftY = currentY;
  let rightY = currentY;
  let currentColumn: 'left' | 'right' = 'left';

  for (const lang of cvData.languages) {
    const columnX = currentColumn === 'left' ? leftColumnX : rightColumnX;
    const columnY = currentColumn === 'left' ? leftY : rightY;
    
    // Check if language fits in current column
    if (columnY - 16 < MARGIN) {
      if (currentColumn === 'left') {
        // Try right column
        if (rightY - 16 >= MARGIN) {
          currentColumn = 'right';
        } else {
          // Both columns full, new page
          const result = checkNewPage(columnY, 16, currentPage, annotations, pdfDoc);
          currentPage = result.newPage;
          currentY = result.newY;
          annotations = result.newAnnotations;
          leftY = currentY;
          rightY = currentY;
          currentColumn = 'left';
        }
      } else {
        // Right column full, new page
        const result = checkNewPage(columnY, 16, currentPage, annotations, pdfDoc);
        currentPage = result.newPage;
        currentY = result.newY;
        annotations = result.newAnnotations;
        leftY = currentY;
        rightY = currentY;
        currentColumn = 'left';
      }
    }
    
    const finalColumnX = currentColumn === 'left' ? leftColumnX : rightColumnX;
    const finalColumnY = currentColumn === 'left' ? leftY : rightY;

    const langText = `${lang.language} - ${lang.level}`;
    drawTextWithGreenBullets(
      currentPage,
      langText,
      finalColumnX,
      finalColumnY,
      10,
      helveticaFont,
      COLORS.GRAY
    );

    if (currentColumn === 'left') {
      leftY -= 16;
      currentColumn = 'right';
    } else {
      rightY -= 16;
      currentColumn = 'left';
    }
  }

  return { newPage: currentPage, newY: Math.min(leftY, rightY), newAnnotations: annotations };
};

export const renderTechnicalSkills = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  cvData: CVData,
  helveticaBold: PDFFont,
  helveticaFont: PDFFont,
  y: number,
  pageAnnotations: PDFRef[]
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } => {
  if (!cvData.skills || (!cvData.skills.frontend?.length && !cvData.skills.tools?.length && !cvData.skills.backend?.length)) {
    return { newPage: page, newY: y, newAnnotations: pageAnnotations };
  }

  let currentPage = page;
  let currentY = y;
  let annotations = [...pageAnnotations];
  const { MARGIN, PAGE_WIDTH, PAGE_HEIGHT, COLORS, LINE_HEIGHT } = PDF_CONFIG;
  const contentWidth = getContentWidth();

  // Force new page for Technical Skills
  if (annotations.length > 0) {
    currentPage.node.set(currentPage.doc.context.obj('Annots'), currentPage.doc.context.obj(annotations));
    annotations = [];
  }
  currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  currentY = PAGE_HEIGHT - MARGIN;

  currentY = renderSectionHeader(currentPage, 'TECHNICAL SKILLS', currentY, helveticaBold);

  const renderSkillGroup = (title: string, skills: string[]) => {
    const result = checkNewPage(currentY, 30, currentPage, annotations, pdfDoc);
    currentPage = result.newPage;
    currentY = result.newY;
    annotations = result.newAnnotations;

    currentPage.drawText(title, {
      x: MARGIN,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: COLORS.GRAY,
    });
    currentY -= 14;

    // Flex-like layout with bullets: wrap skills to next line when needed
    let lineX = MARGIN;
    const spaceWidth = helveticaFont.widthOfTextAtSize(' ', 10);
    const bulletWidth = helveticaFont.widthOfTextAtSize('•', 10);
    const maxLineWidth = PAGE_WIDTH - 2 * MARGIN;
    
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const skillWidth = helveticaFont.widthOfTextAtSize(skill, 10);
      const needsBullet = i > 0;
      const bulletSpace = needsBullet ? (spaceWidth * 2 + bulletWidth + spaceWidth * 2) : 0;
      
      // Check if skill fits on current line
      if (lineX + bulletSpace + skillWidth > maxLineWidth && lineX > MARGIN) {
        // Move to next line
        currentY -= LINE_HEIGHT + 2;
        const result = checkNewPage(currentY, LINE_HEIGHT + 2, currentPage, annotations, pdfDoc);
        currentPage = result.newPage;
        currentY = result.newY;
        annotations = result.newAnnotations;
        lineX = MARGIN;
      } else if (needsBullet) {
        // Add spaces before bullet
        lineX += spaceWidth * 2;
        
        // Draw green bullet
        const bulletY = currentY + (10 * 0.3);
        currentPage.drawCircle({
          x: lineX + (10 * 0.15),
          y: bulletY,
          size: 2,
          color: COLORS.GREEN,
        });
        
        // Add bullet width and spaces after bullet
        lineX += bulletWidth + spaceWidth * 2;
      }
      
      currentPage.drawText(skill, {
        x: lineX,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.GRAY,
      });
      lineX += skillWidth;
    }
    
    currentY -= LINE_HEIGHT + 8;
  };

  if (cvData.skills.frontend?.length) {
    renderSkillGroup('Technologies', cvData.skills.frontend);
  }

  if (cvData.skills.tools?.length) {
    renderSkillGroup('Tools', cvData.skills.tools);
  }

  if (cvData.skills.backend?.length) {
    renderSkillGroup('Methodologies/Practices', cvData.skills.backend);
  }

  return { newPage: currentPage, newY: currentY, newAnnotations: annotations };
};

export const renderFeaturedProjects = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  cvData: CVData,
  helveticaBold: PDFFont,
  helveticaFont: PDFFont,
  y: number,
  pageAnnotations: PDFRef[]
): { newPage: PDFPage; newY: number; newAnnotations: PDFRef[] } => {
  const featuredProjects = cvData.projects?.filter(p => p.featured);
  if (!featuredProjects?.length) {
    return { newPage: page, newY: y, newAnnotations: pageAnnotations };
  }

  let currentPage = page;
  let currentY = y;
  let annotations = [...pageAnnotations];
  const { MARGIN, PAGE_WIDTH, PAGE_HEIGHT, COLORS, LINE_HEIGHT } = PDF_CONFIG;
  const contentWidth = getContentWidth();
  const columnWidth = (PAGE_WIDTH - 3 * MARGIN) / 2;

  const result = checkNewPage(currentY, 40, currentPage, annotations, pdfDoc);
  currentPage = result.newPage;
  currentY = result.newY - 10;
  annotations = result.newAnnotations;

  currentY = renderSectionHeader(currentPage, 'FEATURED PROJECTS', currentY, helveticaBold);

  let leftY = currentY;
  let rightY = currentY;
  let currentColumn: 'left' | 'right' = 'left';

  for (const project of featuredProjects) {
    const columnX = currentColumn === 'left' ? MARGIN : MARGIN + columnWidth + MARGIN;
    let projectY = currentColumn === 'left' ? leftY : rightY;

    const description = project.short_description || project.description;
    const projectLines = wrapText(description, columnWidth, 10, helveticaFont);
    const projectHeight = 14 + (projectLines.length * LINE_HEIGHT) + 12 + 21;

    if (projectY - projectHeight < MARGIN) {
      if (currentColumn === 'left') {
        if (rightY - projectHeight >= MARGIN) {
          currentColumn = 'right';
          projectY = rightY;
        } else {
          currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          leftY = PAGE_HEIGHT - MARGIN;
          rightY = PAGE_HEIGHT - MARGIN;
          projectY = leftY;
          currentColumn = 'left';
        }
      } else {
        currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        leftY = PAGE_HEIGHT - MARGIN;
        rightY = PAGE_HEIGHT - MARGIN;
        projectY = leftY;
        currentColumn = 'left';
      }
    }

    currentPage.drawText(project.title, {
      x: columnX,
      y: projectY,
      size: 10,
      font: helveticaBold,
      color: COLORS.GREEN,
    });
    projectY -= 14;

    for (const line of projectLines) {
      currentPage.drawText(line, {
        x: columnX,
        y: projectY,
        size: 10,
        font: helveticaFont,
        color: COLORS.GRAY,
      });
      projectY -= LINE_HEIGHT;
    }

    const statusLabel = project.status === 'completed' ? 'Completed' :
                       project.status === 'in-progress' ? 'In Progress' :
                       project.status === 'archived' ? 'Archived' : project.status;

    drawTextWithGreenBullets(
      currentPage,
      `${project.year} • ${statusLabel}`,
      columnX,
      projectY,
      8,
      helveticaFont,
      COLORS.LIGHT_GRAY
    );
    projectY -= 12;

    let projectLinksX = columnX;

    if (project.github_url) {
      const githubLinkWidth = helveticaFont.widthOfTextAtSize('GitHub', 9);

      currentPage.drawText('GitHub', {
        x: projectLinksX,
        y: projectY,
        size: 9,
        font: helveticaFont,
        color: COLORS.GREEN,
      });

      const linkAnnotation = currentPage.doc.context.register(
        currentPage.doc.context.obj({
          Type: 'Annot',
          Subtype: 'Link',
          Rect: [projectLinksX, projectY - 2, projectLinksX + githubLinkWidth, projectY + 8],
          Border: [0, 0, 0],
          C: [0, 0, 0],
          A: currentPage.doc.context.obj({
            Type: 'Action',
            S: 'URI',
            URI: currentPage.doc.context.obj(project.github_url),
          }),
        })
      );

      annotations.push(linkAnnotation);
      projectLinksX += githubLinkWidth;

      if (project.demo_url) {
        const spaceWidth = helveticaFont.widthOfTextAtSize('  ', 9);
        projectLinksX += spaceWidth;

        const bulletY = projectY + (9 * 0.3);
        currentPage.drawCircle({
          x: projectLinksX + (9 * 0.15),
          y: bulletY,
          size: 1.5,
          color: COLORS.GREEN,
        });
        projectLinksX += helveticaFont.widthOfTextAtSize('•', 9) + spaceWidth;
      }
    }

    if (project.demo_url) {
      const demoLinkWidth = helveticaFont.widthOfTextAtSize('Demo', 9);

      currentPage.drawText('Demo', {
        x: projectLinksX,
        y: projectY,
        size: 9,
        font: helveticaFont,
        color: COLORS.GREEN,
      });

      const linkAnnotation = currentPage.doc.context.register(
        currentPage.doc.context.obj({
          Type: 'Annot',
          Subtype: 'Link',
          Rect: [projectLinksX, projectY - 2, projectLinksX + demoLinkWidth, projectY + 8],
          Border: [0, 0, 0],
          C: [0, 0, 0],
          A: currentPage.doc.context.obj({
            Type: 'Action',
            S: 'URI',
            URI: currentPage.doc.context.obj(project.demo_url),
          }),
        })
      );

      annotations.push(linkAnnotation);
    }

    projectY -= 21;

    if (currentColumn === 'left') {
      leftY = projectY;
      currentColumn = 'right';
    } else {
      rightY = projectY;
      currentColumn = 'left';
    }
  }

  return { newPage: currentPage, newY: currentY, newAnnotations: annotations };
};
