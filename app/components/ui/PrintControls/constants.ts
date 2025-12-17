import { rgb } from 'pdf-lib';

export const PDF_CONFIG = {
  PAGE_WIDTH: 595,
  PAGE_HEIGHT: 842,
  MARGIN: 60,
  LINE_HEIGHT: 12,
  
  // Font sizes
  FONT_SIZE: {
    TITLE: 20,
    SUBTITLE: 12,
  },
  
  // Colors
  COLORS: {
    GREEN: rgb(0.02, 0.59, 0.41), // #059669
    GRAY: rgb(0.28, 0.33, 0.42), // #475569
    LIGHT_GRAY: rgb(0.58, 0.64, 0.72), // #94a3b8
  },
};

export const getContentWidth = () => 
  PDF_CONFIG.PAGE_WIDTH - (PDF_CONFIG.MARGIN * 2);
