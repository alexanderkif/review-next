import { PDFPage, PDFFont, PDFRef } from 'pdf-lib';
import { PDF_CONFIG } from './constants';
import { CVData } from './types';

export const renderHeader = (
  page: PDFPage,
  cvData: CVData,
  helveticaBold: PDFFont,
  helveticaFont: PDFFont,
  y: number
): number => {
  let currentY = y;
  const { MARGIN, COLORS, FONT_SIZE } = PDF_CONFIG;

  // Name
  const name = cvData.personalInfo?.name || 'Name';
  page.drawText(name, {
    x: MARGIN,
    y: currentY,
    size: FONT_SIZE.TITLE,
    font: helveticaBold,
    color: COLORS.GREEN,
  });
  currentY -= 25;

  // Title
  const title = cvData.personalInfo?.title || 'Title';
  page.drawText(title, {
    x: MARGIN,
    y: currentY,
    size: FONT_SIZE.SUBTITLE,
    font: helveticaFont,
    color: COLORS.GRAY,
  });
  currentY -= 18;

  return currentY;
};

export const renderContactInfo = (
  page: PDFPage,
  cvData: CVData,
  helveticaFont: PDFFont,
  y: number,
  pageAnnotations: PDFRef[]
): { newY: number; annotations: PDFRef[] } => {
  let currentY = y;
  let contactX = PDF_CONFIG.MARGIN;
  const { PAGE_WIDTH, MARGIN, COLORS } = PDF_CONFIG;
  const newAnnotations = [...pageAnnotations];

  // Email
  if (cvData.personalInfo?.email) {
    const emailText = cvData.personalInfo.email;
    const emailWidth = helveticaFont.widthOfTextAtSize(emailText, 10);

    if (contactX + emailWidth > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    }

    page.drawText(emailText, {
      x: contactX,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: COLORS.GREEN,
    });

    const linkAnnotation = page.doc.context.register(
      page.doc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [contactX, currentY - 2, contactX + emailWidth, currentY + 9],
        Border: [0, 0, 0],
        C: [0, 0, 0],
        A: page.doc.context.obj({
          Type: 'Action',
          S: 'URI',
          URI: page.doc.context.obj(`mailto:${emailText}`),
        }),
      })
    );

    newAnnotations.push(linkAnnotation);
    contactX += emailWidth + 5;

    const bulletWidth = helveticaFont.widthOfTextAtSize('•', 10);
    if (contactX + bulletWidth + 5 > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    } else {
      page.drawText('•', {
        x: contactX,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.GREEN,
      });
      contactX += bulletWidth + 5;
    }
  }

  // Phone
  if (cvData.personalInfo?.phone) {
    const phone = cvData.personalInfo.phone;
    const isPhoneLink = phone.match(/^https?:\/\//);
    const phoneWidth = helveticaFont.widthOfTextAtSize(phone, 10);

    if (contactX + phoneWidth > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    }

    page.drawText(phone, {
      x: contactX,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: isPhoneLink ? COLORS.GREEN : COLORS.GRAY,
    });

    if (isPhoneLink) {
      const linkAnnotation = page.doc.context.register(
        page.doc.context.obj({
          Type: 'Annot',
          Subtype: 'Link',
          Rect: [contactX, currentY - 2, contactX + phoneWidth, currentY + 9],
          Border: [0, 0, 0],
          C: [0, 0, 0],
          A: page.doc.context.obj({
            Type: 'Action',
            S: 'URI',
            URI: page.doc.context.obj(phone),
          }),
        })
      );
      newAnnotations.push(linkAnnotation);
    }

    contactX += phoneWidth + 5;

    const bulletWidth = helveticaFont.widthOfTextAtSize('•', 10);
    if (contactX + bulletWidth + 5 > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    } else {
      page.drawText('•', {
        x: contactX,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.GREEN,
      });
      contactX += bulletWidth + 5;
    }
  }

  // Location
  if (cvData.personalInfo?.location) {
    const locationWidth = helveticaFont.widthOfTextAtSize(
      cvData.personalInfo.location,
      10
    );

    if (contactX + locationWidth > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    }

    page.drawText(cvData.personalInfo.location, {
      x: contactX,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: COLORS.GRAY,
    });
  }

  currentY -= 12;
  contactX = MARGIN;

  // Website link
  if (cvData.personalInfo?.website) {
    const websiteText = cvData.personalInfo.website;
    const websiteWidth = helveticaFont.widthOfTextAtSize(websiteText, 10);

    if (contactX + websiteWidth > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    }

    page.drawText(websiteText, {
      x: contactX,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: COLORS.GREEN,
    });

    const linkAnnotation = page.doc.context.register(
      page.doc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [contactX, currentY - 2, contactX + websiteWidth, currentY + 9],
        Border: [0, 0, 0],
        C: [0, 0, 0],
        A: page.doc.context.obj({
          Type: 'Action',
          S: 'URI',
          URI: page.doc.context.obj(websiteText),
        }),
      })
    );

    newAnnotations.push(linkAnnotation);
    contactX += websiteWidth + 5;

    const bulletWidth = helveticaFont.widthOfTextAtSize('•', 10);
    if (contactX + bulletWidth + 5 > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    } else {
      page.drawText('•', {
        x: contactX,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.GREEN,
      });
      contactX += bulletWidth + 5;
    }
  }

  // GitHub link
  if (cvData.personalInfo?.github) {
    const githubText = cvData.personalInfo.github;
    const githubWidth = helveticaFont.widthOfTextAtSize(githubText, 10);

    if (contactX + githubWidth > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    }

    page.drawText(githubText, {
      x: contactX,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: COLORS.GREEN,
    });

    const linkAnnotation = page.doc.context.register(
      page.doc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [contactX, currentY - 2, contactX + githubWidth, currentY + 9],
        Border: [0, 0, 0],
        C: [0, 0, 0],
        A: page.doc.context.obj({
          Type: 'Action',
          S: 'URI',
          URI: page.doc.context.obj(githubText),
        }),
      })
    );

    newAnnotations.push(linkAnnotation);
    contactX += githubWidth;
  }

  currentY -= 12;
  contactX = MARGIN;

  // LinkedIn link
  if (cvData.personalInfo?.linkedin) {
    const linkedinText = cvData.personalInfo.linkedin;
    const linkedinWidth = helveticaFont.widthOfTextAtSize(linkedinText, 10);

    if (contactX + linkedinWidth > PAGE_WIDTH - MARGIN) {
      currentY -= 12;
      contactX = MARGIN;
    }

    page.drawText(linkedinText, {
      x: contactX,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: COLORS.GREEN,
    });

    const linkAnnotation = page.doc.context.register(
      page.doc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [contactX, currentY - 2, contactX + linkedinWidth, currentY + 9],
        Border: [0, 0, 0],
        C: [0, 0, 0],
        A: page.doc.context.obj({
          Type: 'Action',
          S: 'URI',
          URI: page.doc.context.obj(linkedinText),
        }),
      })
    );

    newAnnotations.push(linkAnnotation);
  }

  currentY -= 12;
  return { newY: currentY, annotations: newAnnotations };
};
