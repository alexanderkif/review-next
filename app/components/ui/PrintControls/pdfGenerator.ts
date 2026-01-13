import { PDFDocument, PDFFont, PDFRef } from 'pdf-lib';
import { CVData } from './types';
import { PDF_CONFIG } from './constants';
import { renderHeader, renderContactInfo } from './renderHeader';
import {
  renderHighlights,
  renderWorkExperience,
  renderEducation,
  renderLanguages,
  renderTechnicalSkills,
  renderFeaturedProjects,
} from './renderSections';

export const generateCompletePDF = async (
  pdfDoc: PDFDocument,
  cvData: CVData,
  helveticaFont: PDFFont,
  helveticaBold: PDFFont,
): Promise<void> => {
  const { PAGE_WIDTH, PAGE_HEIGHT, MARGIN } = PDF_CONFIG;

  // Create first page
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageAnnotations: PDFRef[] = [];

  // Render header (name, title)
  y = renderHeader(page, cvData, helveticaBold, helveticaFont, y);

  // Render contact info
  const contactResult = renderContactInfo(page, cvData, helveticaFont, y, pageAnnotations);
  y = contactResult.newY;
  pageAnnotations = contactResult.annotations;

  // Render highlights
  const highlightsResult = renderHighlights(
    page,
    pdfDoc,
    cvData,
    helveticaBold,
    helveticaFont,
    y,
    pageAnnotations,
  );
  page = highlightsResult.newPage;
  y = highlightsResult.newY;
  pageAnnotations = highlightsResult.newAnnotations;

  // Render work experience
  const experienceResult = renderWorkExperience(
    page,
    pdfDoc,
    cvData,
    helveticaBold,
    helveticaFont,
    y,
    pageAnnotations,
  );
  page = experienceResult.newPage;
  y = experienceResult.newY;
  pageAnnotations = experienceResult.newAnnotations;

  // Render technical skills (new page)
  const skillsResult = renderTechnicalSkills(
    page,
    pdfDoc,
    cvData,
    helveticaBold,
    helveticaFont,
    y,
    pageAnnotations,
  );
  page = skillsResult.newPage;
  y = skillsResult.newY;
  pageAnnotations = skillsResult.newAnnotations;

  // Render education
  const educationResult = renderEducation(
    page,
    pdfDoc,
    cvData,
    helveticaBold,
    helveticaFont,
    y,
    pageAnnotations,
  );
  page = educationResult.newPage;
  y = educationResult.newY;
  pageAnnotations = educationResult.newAnnotations;

  // Render languages
  const languagesResult = renderLanguages(
    page,
    pdfDoc,
    cvData,
    helveticaBold,
    helveticaFont,
    y,
    pageAnnotations,
  );
  page = languagesResult.newPage;
  y = languagesResult.newY;
  pageAnnotations = languagesResult.newAnnotations;

  // Render featured projects
  const projectsResult = renderFeaturedProjects(
    page,
    pdfDoc,
    cvData,
    helveticaBold,
    helveticaFont,
    y,
    pageAnnotations,
  );
  page = projectsResult.newPage;
  y = projectsResult.newY;
  pageAnnotations = projectsResult.newAnnotations;

  // Set final page annotations
  if (pageAnnotations.length > 0) {
    page.node.set(page.doc.context.obj('Annots'), page.doc.context.obj(pageAnnotations));
  }
};
