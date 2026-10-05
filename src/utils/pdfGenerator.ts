import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CheckIn } from '../types';

export const generateQuotePDF = async (element: HTMLElement, checkIn: CheckIn): Promise<string> => {
  if (!checkIn.quote) throw new Error('No se encontró la cotización');
  
  try {
    // 1. Prepare element for capture
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });

    if (!dataUrl) {
      throw new Error('No se pudo capturar el contenido de la cotización');
    }

    // 2. Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // We need to know the aspect ratio of the captured image
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Calculate dimensions to fit A4
    const imgWidth = pageWidth;
    const imgHeight = (img.height * pageWidth) / img.width;
    
    pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    
    const fileName = `Cotizacion-${checkIn.quote.id.split('-')[0].toUpperCase()}.pdf`;
    
    // 3. Save/Download
    pdf.save(fileName);
    
    return fileName;
  } catch (err) {
    console.error('Critical PDF Generation Error:', err);
    throw new Error(err instanceof Error ? err.message : 'Error desconocido al generar el PDF');
  }
};
