import React, { useState, useRef } from 'react';
import { CheckIn } from '../types';
import { Printer, X, AlertCircle, Download, FileText, QrCode } from 'lucide-react';
import { generateQuotePDF } from '../utils/pdfGenerator';
import { QuotePrintable } from './QuotePrintable';
import { QuoteQRModal } from './QuoteQRModal';
import { motion, AnimatePresence } from 'motion/react';

interface QuoteSheetProps {
  checkIn: CheckIn;
  onClose: () => void;
}

export function QuoteSheet({ checkIn, onClose }: QuoteSheetProps) {
  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!checkIn.quote) return null;

  const handlePrint = () => {
    try {
      if (window !== window.top) {
        setShowPrintWarning(true);
        return;
      }
      window.print();
    } catch (e) {
      setShowPrintWarning(true);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGeneratingPdf(true);
      await generateQuotePDF(printRef.current, checkIn);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al generar el PDF: ${errorMsg}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:static print:p-0 print:bg-white overflow-y-auto print:overflow-visible print:block">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl my-auto print:shadow-none print:rounded-none print:max-w-none print:w-full print:m-0 relative overflow-hidden border border-slate-100"
      >
        {/* Actions - Hidden on print */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Hoja de Cotización</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vista Previa & Exportación</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-purple-100 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              Código QR
            </button>
            <div className="hidden md:block w-px h-8 bg-slate-200 mx-1" />
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors ml-auto md:ml-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {showPrintWarning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-6 pt-6 print:hidden"
          >
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-900">Impresión directa restringida</h3>
                <p className="text-sm font-medium text-amber-700 mt-1 leading-relaxed">
                  Parece que estás en un entorno donde la impresión directa no está disponible. 
                  Puedes descargar la cotización como PDF para imprimirla o enviarla.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Printable Content */}
        <div className="print:p-0 bg-slate-50/30 min-h-[600px] flex justify-center p-4 md:p-8 overflow-x-auto">
          <div className="bg-white shadow-xl shadow-slate-200/50 print:shadow-none w-[21cm] min-w-[21cm] md:w-full md:min-w-0 md:max-w-[21cm] min-h-[29.7cm] mx-auto transition-transform origin-top">
            <QuotePrintable checkIn={checkIn} printRef={printRef} />
          </div>
        </div>

        {showQRModal && (
          <QuoteQRModal checkIn={checkIn} onClose={() => setShowQRModal(false)} />
        )}
      </motion.div>
    </div>
  );
}
