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
      // Fetch CV data and projects
      const [cvResponse, projectsResponse] = await Promise.all([
        fetch('/api/cv-data'),
        fetch('/api/admin/projects'),
      ]);

      if (!cvResponse.ok) throw new Error('Failed to fetch CV data');
      const cvData: CVData = await cvResponse.json();

      // Add projects to CV data if available
      if (projectsResponse.ok) {
        const projects = await projectsResponse.json();
        cvData.projects = projects;
      }

      // Create PDF document
      const pdfDoc = await PDFDocument.create();

      // Embed fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Generate PDF content
      await generateCompletePDF(pdfDoc, cvData, helveticaFont, helveticaBold);

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
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1),_inset_-2px_-2px_1px_rgba(0,0,0,0.3)] transition-all duration-200 will-change-auto hover:text-white hover:[background:linear-gradient(90deg,#10b981_0%,#3b82f6_100%)] disabled:cursor-wait disabled:opacity-75`}
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
      </Tooltip>
    </div>
  );
};

export default PrintControls;
