'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { useToast } from '../ToastContainer';
import Tooltip from '../Tooltip';
import { CVData, PrintControlsProps } from './types';
import { generateCompletePDF } from './pdfGenerator';

const PrintControls = ({ className = '' }: PrintControlsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // The public endpoint already returns featured, non-hidden projects.
      const cvResponse = await fetch('/api/cv-data');

      if (!cvResponse.ok) throw new Error('Failed to fetch CV data');
      const cvData: CVData = await cvResponse.json();

      // Create PDF document
      const pdfDoc = await PDFDocument.create();

      // Embed fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

      // Generate PDF content
      await generateCompletePDF(
        pdfDoc,
        cvData,
        helveticaFont,
        helveticaBold,
        helveticaOblique,
        helveticaBoldOblique,
      );

      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cvData.personalInfo?.name || 'My'} Resume.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      showToast('PDF generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <Tooltip content="Save as PDF" position="top" variant="clay">
        <button onClick={generatePDF} disabled={isGenerating} className="btn btn-primary">
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Save as PDF</span>
            </>
          )}
        </button>
      </Tooltip>
    </div>
  );
};

export default PrintControls;
