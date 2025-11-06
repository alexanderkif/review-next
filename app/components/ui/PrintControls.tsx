'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFRef } from 'pdf-lib';
import { useToast } from './ToastContainer';

interface PrintControlsProps {
  className?: string;
}

const PrintControls = ({ className = '' }: PrintControlsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  const generatePDF = async () => {
    try {
      // Fetch CV data
      const response = await fetch('/api/cv-data');
      if (!response.ok) throw new Error('Failed to fetch CV data');
      const cvData = await response.json();

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Embed fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Colors
      const greenColor = rgb(0.02, 0.59, 0.41); // #059669
      const grayColor = rgb(0.28, 0.33, 0.42); // #475569
      const lightGrayColor = rgb(0.58, 0.64, 0.72); // #94a3b8
      
      // Page setup
      let page = pdfDoc.addPage([595, 842]); // A4 size
      const margin = 60;
      let y = 842 - margin;
      const pageWidth = 595;
      const contentWidth = pageWidth - (margin * 2);
      const lineHeight = 12;
      let pageAnnotations: PDFRef[] = []; // Collect PDF annotation references for current page
      
      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (y - requiredSpace < margin) {
          // Set annotations for current page before creating new one
          if (pageAnnotations.length > 0) {
            page.node.set(page.doc.context.obj('Annots'), page.doc.context.obj(pageAnnotations));
            pageAnnotations = [];
          }
          page = pdfDoc.addPage([595, 842]);
          y = 842 - margin;
          return true;
        }
        return false;
      };
      
      // Helper function to wrap text
      const wrapText = (text: string, maxWidth: number, fontSize: number, font: PDFFont) => {
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
      
      // Helper function to wrap text with bullets accounting for extra spacing
      const wrapTextWithBullets = (text: string, maxWidth: number, fontSize: number, font: PDFFont) => {
        const items = text.split(' \u2022 ');
        const lines: string[] = [];
        let currentLine = '';
        const doubleSpaceWidth = font.widthOfTextAtSize('  ', fontSize);
        const bulletWidth = font.widthOfTextAtSize('\u2022', fontSize);
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemWidth = font.widthOfTextAtSize(item, fontSize);
          
          // Calculate width with bullet spacing (double space before + bullet + double space after)
          const itemWithBulletWidth = i > 0 
            ? itemWidth + doubleSpaceWidth + bulletWidth + doubleSpaceWidth
            : itemWidth;
          
          if (currentLine === '') {
            currentLine = item;
          } else {
            const currentWidth = font.widthOfTextAtSize(currentLine.replace(/\u2022/g, '\u2022'), fontSize);
            const bulletCount = (currentLine.match(/\u2022/g) || []).length;
            const currentLineWithSpacing = currentWidth + (bulletCount * (doubleSpaceWidth * 2 + bulletWidth));
            
            if (currentLineWithSpacing + itemWithBulletWidth > maxWidth) {
              lines.push(currentLine);
              currentLine = item;
            } else {
              currentLine += ' \u2022 ' + item;
            }
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };
      
      // Helper function to draw text with green bullets
      const drawTextWithGreenBullets = (text: string, x: number, yPos: number, fontSize: number, font: PDFFont, defaultColor: ReturnType<typeof rgb>) => {
        // Replace dashes with bullets in date ranges
        const textWithBullets = text.replace(/\s-\s/g, ' • ');
        const parts = textWithBullets.split('•');
        let currentX = x;
        
        // Use green color for bullets
        const bulletColor = greenColor;
        
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) {
            // Add space before bullet
            const spaceWidth = font.widthOfTextAtSize(' ', fontSize);
            currentX += spaceWidth;
            
            // Draw bullet as circle aligned with text
            // Text baseline is at yPos, bullet center should be at middle of text height
            const bulletY = yPos + (fontSize * 0.3); // Adjust to align with middle of lowercase letters
            // Adaptive bullet size based on font size
            const bulletSize = fontSize <= 8 ? 1.5 : 2;
            page.drawCircle({
              x: currentX + (fontSize * 0.15),
              y: bulletY,
              size: bulletSize,
              color: bulletColor,
            });
            // Add bullet width + space after bullet
            currentX += font.widthOfTextAtSize('•', fontSize) + spaceWidth;
          }
          
          // Draw text part
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
      
      // Header
      const name = cvData.personalInfo?.name || 'Aleksandr Nikiforov';
      page.drawText(name, {
        x: margin,
        y,
        size: 20,
        font: helveticaBold,
        color: greenColor,
      });
      y -= 25;
      
      // Title
      const title = cvData.personalInfo?.title || 'Software Developer';
      page.drawText(title, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
        color: grayColor,
      });
      y -= 18;
      
      // Contact info - email
      let contactX = margin;
      if (cvData.personalInfo?.email) {
        const emailText = cvData.personalInfo.email;
        const emailWidth = helveticaFont.widthOfTextAtSize(emailText, 10);
        
        // Check if we need a new line
        if (contactX + emailWidth > pageWidth - margin) {
          y -= 12;
          contactX = margin;
        }
        
        page.drawText(emailText, {
          x: contactX,
          y,
          size: 10,
          font: helveticaFont,
          color: greenColor,
        });
        
        const linkAnnotation = page.doc.context.register(
          page.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [contactX, y - 2, contactX + emailWidth, y + 9],
            Border: [0, 0, 0],
            C: [0, 0, 0],
            A: page.doc.context.obj({
              Type: 'Action',
              S: 'URI',
              URI: page.doc.context.obj(`mailto:${emailText}`),
            }),
          })
        );
        
        pageAnnotations.push(linkAnnotation);
        
        contactX += emailWidth + 5;
        
        // Check if bullet fits
        const bulletWidth = helveticaFont.widthOfTextAtSize('•', 10);
        if (contactX + bulletWidth + 5 > pageWidth - margin) {
          y -= 12;
          contactX = margin;
        } else {
          page.drawText('•', { x: contactX, y, size: 10, font: helveticaFont, color: greenColor });
          contactX += bulletWidth + 5;
        }
      }
      
      // Phone
      if (cvData.personalInfo?.phone) {
        const phone = cvData.personalInfo.phone;
        const isPhoneLink = phone.match(/^https?:\/\//);
        const phoneWidth = helveticaFont.widthOfTextAtSize(phone, 10);
        
        // Check if we need a new line
        if (contactX + phoneWidth > pageWidth - margin) {
          y -= 12;
          contactX = margin;
        }
        
        page.drawText(phone, {
          x: contactX,
          y,
          size: 10,
          font: helveticaFont,
          color: isPhoneLink ? greenColor : grayColor,
        });
        
        if (isPhoneLink) {
          const linkAnnotation = page.doc.context.register(
            page.doc.context.obj({
              Type: 'Annot',
              Subtype: 'Link',
              Rect: [contactX, y - 2, contactX + phoneWidth, y + 9],
              Border: [0, 0, 0],
              C: [0, 0, 0],
              A: page.doc.context.obj({
                Type: 'Action',
                S: 'URI',
                URI: page.doc.context.obj(phone),
              }),
            })
          );
          
          pageAnnotations.push(linkAnnotation);
        }
        
        contactX += phoneWidth + 5;
        
        // Check if bullet fits
        const bulletWidth = helveticaFont.widthOfTextAtSize('•', 10);
        if (contactX + bulletWidth + 5 > pageWidth - margin) {
          y -= 12;
          contactX = margin;
        } else {
          page.drawText('•', { x: contactX, y, size: 10, font: helveticaFont, color: greenColor });
          contactX += bulletWidth + 5;
        }
      }
      
      // Location
      if (cvData.personalInfo?.location) {
        const locationWidth = helveticaFont.widthOfTextAtSize(cvData.personalInfo.location, 10);
        
        // Check if we need a new line
        if (contactX + locationWidth > pageWidth - margin) {
          y -= 12;
          contactX = margin;
        }
        
        page.drawText(cvData.personalInfo.location, {
          x: contactX,
          y,
          size: 10,
          font: helveticaFont,
          color: grayColor,
        });
      }
      y -= 12;
      
      // Links row
      let linksX = margin;
      if (cvData.personalInfo?.website) {
        const websiteText = cvData.personalInfo.website;
        const websiteWidth = helveticaFont.widthOfTextAtSize(websiteText, 10);
        
        // Check if we need a new line
        if (linksX + websiteWidth > pageWidth - margin) {
          y -= 12;
          linksX = margin;
        }
        
        page.drawText(websiteText, {
          x: linksX,
          y,
          size: 10,
          font: helveticaFont,
          color: greenColor,
        });
        
        const linkAnnotation = page.doc.context.register(
          page.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [linksX, y - 2, linksX + websiteWidth, y + 9],
            Border: [0, 0, 0],
            C: [0, 0, 0],
            A: page.doc.context.obj({
              Type: 'Action',
              S: 'URI',
              URI: page.doc.context.obj(websiteText.startsWith('http') ? websiteText : `https://${websiteText}`),
            }),
          })
        );
        
        pageAnnotations.push(linkAnnotation);
        
        linksX += websiteWidth + 5;
        
        // Check if bullet fits
        const bulletWidth = helveticaFont.widthOfTextAtSize('•', 10);
        if (linksX + bulletWidth + 5 > pageWidth - margin) {
          y -= 12;
          linksX = margin;
        } else {
          page.drawText('•', { x: linksX, y, size: 10, font: helveticaFont, color: greenColor });
          linksX += bulletWidth + 5;
        }
      }
      
      if (cvData.personalInfo?.github) {
        const githubText = cvData.personalInfo.github;
        const githubWidth = helveticaFont.widthOfTextAtSize(githubText, 10);
        
        // Check if we need a new line
        if (linksX + githubWidth > pageWidth - margin) {
          y -= 12;
          linksX = margin;
        }
        
        page.drawText(githubText, {
          x: linksX,
          y,
          size: 10,
          font: helveticaFont,
          color: greenColor,
        });
        
        const linkAnnotation = page.doc.context.register(
          page.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [linksX, y - 2, linksX + githubWidth, y + 9],
            Border: [0, 0, 0],
            C: [0, 0, 0],
            A: page.doc.context.obj({
              Type: 'Action',
              S: 'URI',
              URI: page.doc.context.obj(githubText.startsWith('http') ? githubText : `https://${githubText}`),
            }),
          })
        );
        
        pageAnnotations.push(linkAnnotation);
      }
      
      if (cvData.personalInfo?.website || cvData.personalInfo?.github) {
        y -= 12;
      }
      
      // LinkedIn on third line
      if (cvData.personalInfo?.linkedin) {
        const linkedinText = cvData.personalInfo.linkedin;
        const linkedinWidth = helveticaFont.widthOfTextAtSize(linkedinText, 10);
        
        // Check if we need a new line
        if (margin + linkedinWidth > pageWidth - margin) {
          y -= 12;
        }
        
        page.drawText(linkedinText, {
          x: margin,
          y,
          size: 10,
          font: helveticaFont,
          color: greenColor,
        });
        
        const linkAnnotation = page.doc.context.register(
          page.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [margin, y - 2, margin + linkedinWidth, y + 9],
            Border: [0, 0, 0],
            C: [0, 0, 0],
            A: page.doc.context.obj({
              Type: 'Action',
              S: 'URI',
              URI: page.doc.context.obj(linkedinText.startsWith('http') ? linkedinText : `https://${linkedinText}`),
            }),
          })
        );
        
        pageAnnotations.push(linkAnnotation);
        
        y -= 12;
      } else if (cvData.personalInfo?.website || cvData.personalInfo?.github || cvData.personalInfo?.linkedin) {
        y -= 6;
      }
      
      // Highlights section
      if (cvData.about) {
        y -= 15;
        page.drawText('HIGHLIGHTS', {
          x: margin,
          y,
          size: 11,
          font: helveticaBold,
          color: greenColor,
        });
        y -= 5;
        page.drawLine({
          start: { x: margin, y },
          end: { x: pageWidth - margin, y },
          thickness: 0.5,
          color: greenColor,
        });
        y -= lineHeight;
        y -= 10;
        
        const highlights = cvData.about.split('\n').filter((line: string) => {
          const trimmed = line.trim();
          return trimmed && (trimmed.startsWith('•') || trimmed.startsWith('-'));
        });
        
        for (const highlight of highlights) {
          checkNewPage(30);
          const text = highlight.replace(/^[•\-]\s*/, '');
          const lines = wrapText(text, contentWidth - 15, 10, helveticaFont);
          
          for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
              checkNewPage(lineHeight);
            }
            
            // Draw bullet only for first line with fixed offset from top of text
            if (i === 0) {
              // Text baseline is at y, bullet center should be at middle of text height
              // For 10pt font, adjust bullet to align with middle of lowercase letters
              page.drawCircle({
                x: margin + 3,
                y: y + (10 * 0.3),
                size: 2,
                color: greenColor,
              });
            }
            
            page.drawText(lines[i], {
              x: margin + 10,
              y,
              size: 10,
              font: helveticaFont,
              color: grayColor,
            });
            y -= lineHeight;
          }
          y -= 3;
        }
      }
      
      // Work Experience
      if (cvData.experience?.length) {
        checkNewPage(40);
        y -= 15;
        page.drawText('WORK EXPERIENCE', {
          x: margin,
          y,
          size: 11,
          font: helveticaBold,
          color: greenColor,
        });
        y -= 5;
        page.drawLine({
          start: { x: margin, y },
          end: { x: pageWidth - margin, y },
          thickness: 0.5,
          color: greenColor,
        });
        y -= lineHeight;
        y -= 10;
        
        for (const exp of cvData.experience) {
          checkNewPage(60);
          
          // Job title
          page.drawText(exp.title, {
            x: margin,
            y,
            size: 10,
            font: helveticaBold,
            color: greenColor,
          });
          y -= 16;
          
          // Company
          drawTextWithGreenBullets(exp.company, margin, y, 10, helveticaBold, grayColor);
          y -= 14;
          
          // Period
          const period = exp.period + (exp.current ? ' (Current)' : '');
          drawTextWithGreenBullets(period, margin, y, 8, helveticaFont, lightGrayColor);
          y -= 16;
          
          // Description
          const descLines = wrapText(exp.description, contentWidth, 10, helveticaFont);
          for (const line of descLines) {
            checkNewPage(lineHeight + 2);
            page.drawText(line, {
              x: margin,
              y,
              size: 10,
              font: helveticaFont,
              color: grayColor,
            });
            y -= lineHeight + 2;
          }
          y -= 8;
        }
      }
      
      // Technical Skills - force new page
      if (cvData.skills && (cvData.skills.frontend?.length || cvData.skills.tools?.length || cvData.skills.backend?.length)) {
        // Set annotations for current page before creating new one
        if (pageAnnotations.length > 0) {
          page.node.set(page.doc.context.obj('Annots'), page.doc.context.obj(pageAnnotations));
          pageAnnotations = [];
        }
        // Force new page for Technical Skills
        page = pdfDoc.addPage([595, 842]);
        y = 842 - margin;
        page.drawText('TECHNICAL SKILLS', {
          x: margin,
          y,
          size: 11,
          font: helveticaBold,
          color: greenColor,
        });
        y -= 5;
        page.drawLine({
          start: { x: margin, y },
          end: { x: pageWidth - margin, y },
          thickness: 0.5,
          color: greenColor,
        });
        y -= lineHeight;
        y -= 10;
        
        if (cvData.skills.frontend?.length) {
          checkNewPage(30);
          page.drawText('Technologies', {
            x: margin,
            y,
            size: 10,
            font: helveticaBold,
            color: grayColor,
          });
          y -= 14;
          
          const skillsText = cvData.skills.frontend.join(' • ');
          const skillLines = wrapTextWithBullets(skillsText, contentWidth, 10, helveticaFont);
          for (const line of skillLines) {
            checkNewPage(lineHeight + 2);
            // Draw each line part by part with bullets
            const lineParts = line.split('•').map(part => part.trim()).filter(part => part);
            let lineX = margin;
            for (let i = 0; i < lineParts.length; i++) {
              if (i > 0) {
                // Add double space before bullet for better visual separation
                const doubleSpaceWidth = helveticaFont.widthOfTextAtSize('  ', 10);
                lineX += doubleSpaceWidth;
                // Draw bullet
                const bulletY = y + (10 * 0.3);
                page.drawCircle({
                  x: lineX + (10 * 0.15),
                  y: bulletY,
                  size: 2,
                  color: greenColor,
                });
                // Add bullet width + double space after bullet
                lineX += helveticaFont.widthOfTextAtSize('•', 10) + doubleSpaceWidth;
              }
              // Draw text part
              page.drawText(lineParts[i], {
                x: lineX,
                y,
                size: 10,
                font: helveticaFont,
                color: grayColor,
              });
              lineX += helveticaFont.widthOfTextAtSize(lineParts[i], 10);
            }
            y -= lineHeight + 2;
          }
          y -= 8;
        }
        
        if (cvData.skills.tools?.length) {
          checkNewPage(30);
          page.drawText('Tools', {
            x: margin,
            y,
            size: 10,
            font: helveticaBold,
            color: grayColor,
          });
          y -= 14;
          
          const toolsText = cvData.skills.tools.join(' • ');
          const toolLines = wrapTextWithBullets(toolsText, contentWidth, 10, helveticaFont);
          for (const line of toolLines) {
            checkNewPage(lineHeight + 2);
            // Draw each line part by part with bullets
            const lineParts = line.split('•').map(part => part.trim()).filter(part => part);
            let lineX = margin;
            for (let i = 0; i < lineParts.length; i++) {
              if (i > 0) {
                // Add double space before bullet for better visual separation
                const doubleSpaceWidth = helveticaFont.widthOfTextAtSize('  ', 10);
                lineX += doubleSpaceWidth;
                // Draw bullet
                const bulletY = y + (10 * 0.3);
                page.drawCircle({
                  x: lineX + (10 * 0.15),
                  y: bulletY,
                  size: 2,
                  color: greenColor,
                });
                // Add bullet width + double space after bullet
                lineX += helveticaFont.widthOfTextAtSize('•', 10) + doubleSpaceWidth;
              }
              // Draw text part
              page.drawText(lineParts[i], {
                x: lineX,
                y,
                size: 10,
                font: helveticaFont,
                color: grayColor,
              });
              lineX += helveticaFont.widthOfTextAtSize(lineParts[i], 10);
            }
            y -= lineHeight + 2;
          }
          y -= 8;
        }
        
        if (cvData.skills.backend?.length) {
          checkNewPage(30);
          page.drawText('Methodologies/Practices', {
            x: margin,
            y,
            size: 10,
            font: helveticaBold,
            color: grayColor,
          });
          y -= 14;
          
          const methodsText = cvData.skills.backend.join(' • ');
          const methodLines = wrapTextWithBullets(methodsText, contentWidth, 10, helveticaFont);
          for (const line of methodLines) {
            checkNewPage(lineHeight + 2);
            // Draw each line part by part with bullets
            const lineParts = line.split('•').map(part => part.trim()).filter(part => part);
            let lineX = margin;
            for (let i = 0; i < lineParts.length; i++) {
              if (i > 0) {
                // Add double space before bullet for better visual separation
                const doubleSpaceWidth = helveticaFont.widthOfTextAtSize('  ', 10);
                lineX += doubleSpaceWidth;
                // Draw bullet
                const bulletY = y + (10 * 0.3);
                page.drawCircle({
                  x: lineX + (10 * 0.15),
                  y: bulletY,
                  size: 2,
                  color: greenColor,
                });
                // Add bullet width + double space after bullet
                lineX += helveticaFont.widthOfTextAtSize('•', 10) + doubleSpaceWidth;
              }
              // Draw text part
              page.drawText(lineParts[i], {
                x: lineX,
                y,
                size: 10,
                font: helveticaFont,
                color: grayColor,
              });
              lineX += helveticaFont.widthOfTextAtSize(lineParts[i], 10);
            }
            y -= lineHeight + 2;
          }
          y -= 8;
        }
      }
      
      // Education
      if (cvData.education?.length) {
        checkNewPage(40);
        y -= 15;
        page.drawText('EDUCATION', {
          x: margin,
          y,
          size: 11,
          font: helveticaBold,
          color: greenColor,
        });
        y -= 5;
        page.drawLine({
          start: { x: margin, y },
          end: { x: pageWidth - margin, y },
          thickness: 0.5,
          color: greenColor,
        });
        y -= lineHeight;
        y -= 10;
        
        for (const edu of cvData.education) {
          checkNewPage(50);
          
          page.drawText(edu.degree, {
            x: margin,
            y,
            size: 10,
            font: helveticaBold,
            color: greenColor,
          });
          y -= 16;
          
          drawTextWithGreenBullets(edu.institution, margin, y, 10, helveticaBold, grayColor);
          y -= 14;
          
          drawTextWithGreenBullets(edu.period, margin, y, 8, helveticaFont, lightGrayColor);
          y -= 16;
          
          if (edu.description) {
            checkNewPage(lineHeight);
            // Parse URLs from description and keep text and URL on the same line
            const urlPattern = /(https?:\/\/[^\s]+)/g;
            const parts: Array<{text: string, isUrl: boolean, url?: string}> = [];
            let lastIndex = 0;
            let match;
            
            while ((match = urlPattern.exec(edu.description)) !== null) {
              if (match.index > lastIndex) {
                parts.push({text: edu.description.substring(lastIndex, match.index), isUrl: false});
              }
              parts.push({text: match[0], isUrl: true, url: match[0]});
              lastIndex = match.index + match[0].length;
            }
            if (lastIndex < edu.description.length) {
              parts.push({text: edu.description.substring(lastIndex), isUrl: false});
            }
            
            // Draw all parts on the same line
            let currentX = margin;
            for (const part of parts) {
              const textWidth = helveticaFont.widthOfTextAtSize(part.text, 10);
              
              page.drawText(part.text, {
                x: currentX,
                y,
                size: 10,
                font: helveticaFont,
                color: part.isUrl ? greenColor : grayColor,
              });
              
              if (part.isUrl && part.url) {
                const linkAnnotation = page.doc.context.register(
                  page.doc.context.obj({
                    Type: 'Annot',
                    Subtype: 'Link',
                    Rect: [currentX, y - 2, currentX + textWidth, y + 9],
                    Border: [0, 0, 0],
                    C: [0, 0, 0],
                    A: page.doc.context.obj({
                      Type: 'Action',
                      S: 'URI',
                      URI: page.doc.context.obj(part.url),
                    }),
                  })
                );
                pageAnnotations.push(linkAnnotation);
              }
              
              currentX += textWidth;
            }
            y -= lineHeight;
            y -= 6; // Extra spacing after description
          }
          y -= 6;
        }
      }
      
      // Languages
      if (cvData.languages?.length) {
        checkNewPage(40);
        y -= 15;
        page.drawText('LANGUAGES', {
          x: margin,
          y,
          size: 11,
          font: helveticaBold,
          color: greenColor,
        });
        y -= 5;
        page.drawLine({
          start: { x: margin, y },
          end: { x: pageWidth - margin, y },
          thickness: 0.5,
          color: greenColor,
        });
        y -= lineHeight;
        y -= 10;
        
        for (const lang of cvData.languages) {
          checkNewPage(15);
          drawTextWithGreenBullets(`${lang.language} • ${lang.level}`, margin, y, 10, helveticaFont, grayColor);
          y -= 15;
        }
      }
      
      // Featured Projects - two columns
      if (cvData.projects?.length) {
        checkNewPage(40);
        y -= 15;
        page.drawText('FEATURED PROJECTS', {
          x: margin,
          y,
          size: 11,
          font: helveticaBold,
          color: greenColor,
        });
        y -= 5;
        page.drawLine({
          start: { x: margin, y },
          end: { x: pageWidth - margin, y },
          thickness: 0.5,
          color: greenColor,
        });
        y -= lineHeight;
        y -= 10;
        
        const columnWidth = (contentWidth - 15) / 2;
        const leftColumnX = margin;
        const rightColumnX = margin + columnWidth + 15;
        
        let leftY = y;
        let rightY = y;
        let currentColumn = 'left';
        
        for (let i = 0; i < cvData.projects.length; i++) {
          const project = cvData.projects[i];
          const columnX = currentColumn === 'left' ? leftColumnX : rightColumnX;
          let projectY = currentColumn === 'left' ? leftY : rightY;
          
          // Calculate space needed for this project
          const projectDesc = project.short_description || project.description;
          const projectLines = wrapText(projectDesc, columnWidth, 10, helveticaFont);
          const projectHeight = 14 + (projectLines.length * lineHeight) + 12 + 12 + 8;
          
          // Check if we need a new page
          if (projectY - projectHeight < margin) {
            if (currentColumn === 'left') {
              // Try right column first
              if (rightY - projectHeight >= margin) {
                currentColumn = 'right';
                projectY = rightY;
              } else {
                // Both columns full, new page
                page = pdfDoc.addPage([595, 842]);
                leftY = 842 - margin;
                rightY = 842 - margin;
                projectY = leftY;
                currentColumn = 'left';
              }
            } else {
              // Right column full, new page
              page = pdfDoc.addPage([595, 842]);
              leftY = 842 - margin;
              rightY = 842 - margin;
              projectY = leftY;
              currentColumn = 'left';
            }
          }
          
          // Draw project title
          page.drawText(project.title, {
            x: columnX,
            y: projectY,
            size: 10,
            font: helveticaBold,
            color: greenColor,
          });
          projectY -= 16;
          
          // Draw description
          for (const line of projectLines) {
            page.drawText(line, {
              x: columnX,
              y: projectY,
              size: 10,
              font: helveticaFont,
              color: grayColor,
            });
            projectY -= lineHeight;
          }
          
          // Draw year and status
          const statusLabel = project.status === 'completed' ? 'Completed' : 
                            project.status === 'in-progress' ? 'In Progress' : 
                            project.status === 'archived' ? 'Archived' : project.status;
          
          drawTextWithGreenBullets(`${project.year} • ${statusLabel}`, columnX, projectY, 8, helveticaFont, lightGrayColor);
          projectY -= 14;
          
          // Draw links
          let projectLinksX = columnX;
          
          if (project.github_url) {
            const githubLinkWidth = helveticaFont.widthOfTextAtSize('GitHub', 9);
            
            page.drawText('GitHub', {
              x: projectLinksX,
              y: projectY,
              size: 9,
              font: helveticaFont,
              color: greenColor,
            });
            
            const linkAnnotation = page.doc.context.register(
              page.doc.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [projectLinksX, projectY - 2, projectLinksX + githubLinkWidth, projectY + 8],
                Border: [0, 0, 0],
                C: [0, 0, 0],
                A: page.doc.context.obj({
                  Type: 'Action',
                  S: 'URI',
                  URI: page.doc.context.obj(project.github_url),
                }),
              })
            );
            
            pageAnnotations.push(linkAnnotation);
            
            projectLinksX += githubLinkWidth;
            
            if (project.demo_url) {
              // Add larger space before bullet (matching project status spacing)
              const spaceWidth = helveticaFont.widthOfTextAtSize('  ', 9); // Double space for visual consistency
              projectLinksX += spaceWidth;
              
              // Draw bullet as circle
              const bulletY = projectY + (9 * 0.3);
              page.drawCircle({
                x: projectLinksX + (9 * 0.15),
                y: bulletY,
                size: 1.5,
                color: greenColor,
              });
              // Add bullet width + larger space after bullet
              projectLinksX += helveticaFont.widthOfTextAtSize('•', 9) + spaceWidth;
            }
          }
          
          if (project.demo_url) {
            const demoLinkWidth = helveticaFont.widthOfTextAtSize('Demo', 9);
            
            page.drawText('Demo', {
              x: projectLinksX,
              y: projectY,
              size: 9,
              font: helveticaFont,
              color: greenColor,
            });
            
            const linkAnnotation = page.doc.context.register(
              page.doc.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [projectLinksX, projectY - 2, projectLinksX + demoLinkWidth, projectY + 8],
                Border: [0, 0, 0],
                C: [0, 0, 0],
                A: page.doc.context.obj({
                  Type: 'Action',
                  S: 'URI',
                  URI: page.doc.context.obj(project.demo_url),
                }),
              })
            );
            
            pageAnnotations.push(linkAnnotation);
          }
          
          projectY -= 25;
          
          // Update column Y position
          if (currentColumn === 'left') {
            leftY = projectY;
            currentColumn = 'right';
          } else {
            rightY = projectY;
            currentColumn = 'left';
          }
        }
      }
      
      // Set final page annotations
      if (pageAnnotations.length > 0) {
        page.node.set(page.doc.context.obj('Annots'), page.doc.context.obj(pageAnnotations));
      }
      
      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      await generatePDF();
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1),_inset_-2px_-2px_1px_rgba(0,0,0,0.3)] transition-all duration-200 will-change-auto disabled:opacity-75 disabled:cursor-wait cursor-pointer hover:[background:linear-gradient(90deg,#10b981_0%,#3b82f6_100%)]`}
        title="Save as PDF"
        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span className="relative z-10">Generating...</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span className="relative z-10">Save as PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PrintControls;

