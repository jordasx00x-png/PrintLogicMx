import React, { useState, useRef } from 'react';
import { Sale } from '../../types';
import { Printer, X, Download, FileText, Share2, MessageCircle } from 'lucide-react';
import { generateSalePDF } from '../../utils/pdfGenerator';
import { SalePrintable } from './SalePrintable';
import { motion } from 'motion/react';

interface SaleSheetProps {
  sale: Sale;
  onClose: () => void;
}

export function SaleSheet({ sale, onClose }: SaleSheetProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const isCompleted = sale.status === 'completed' || sale.status === 'accepted';
  const docTitle = isCompleted ? 'Nota de Venta' : 'Cotización de Refacciones';

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error('Print error:', e);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGeneratingPdf(true);
      await generateSalePDF(printRef.current, sale);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al generar el PDF: ${errorMsg}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppShare = () => {
    const phone = sale.client.phone ? sale.client.phone.replace(/\D/g, '') : '';
    const itemsSummary = sale.items.map(i => `• ${i.quantity}x ${i.name} ($${i.total.toFixed(2)})`).join('%0A');
    const message = `Hola *${sale.client.name}*, le compartimos su ${docTitle} #VTA-${sale.id.substring(0, 8).toUpperCase()}:%0A%0A*Detalle:*%0A${itemsSummary}%0A%0A*Total:* $${sale.total.toFixed(2)} MXN%0A%0AGracias por su preferencia.`;
    
    const url = phone 
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:static print:p-0 print:bg-white overflow-y-auto print:overflow-visible print:block">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-4xl my-auto print:shadow-none print:rounded-none print:max-w-none print:w-full print:m-0 relative overflow-hidden border border-slate-100"
      >
        {/* Actions Bar - Hidden on print */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-6 gap-4 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {docTitle}
                </h2>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vista Previa & Exportación
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 active:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              title="Compartir por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="hidden md:flex min-h-[38px] min-w-[38px] items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Render Area */}
        <div className="p-4 sm:p-8 overflow-x-auto flex justify-center bg-slate-100/60 print:bg-white print:p-0 print:overflow-visible">
          <div className="shadow-lg print:shadow-none bg-white rounded-lg print:rounded-none">
            <SalePrintable sale={sale} printRef={printRef} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
