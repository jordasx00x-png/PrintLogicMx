import React, { useState } from 'react';
import { CheckIn } from '../types';
import { QrCode, X, Copy, Check, Download, ExternalLink, Sparkles, Printer } from 'lucide-react';
import { motion } from 'motion/react';

interface QuoteQRModalProps {
  checkIn: CheckIn;
  onClose: () => void;
}

export function QuoteQRModal({ checkIn, onClose }: QuoteQRModalProps) {
  const [copied, setCopied] = useState(false);

  if (!checkIn.quote) return null;

  const quoteUrl = `${window.location.origin}?checkInId=${checkIn.id}&view=quote`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(quoteUrl)}&format=png&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_Cotizacion_${checkIn.client?.name || 'Cliente'}_${checkIn.id.substring(0, 6)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md my-auto relative overflow-hidden border border-slate-100 p-8 space-y-6 text-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Código QR de Cotización</h3>
              <p className="text-[11px] font-bold text-slate-400">Acceso digital instantáneo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Frame */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center relative group">
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100">
            <img 
              src={qrImageUrl} 
              alt="Código QR de Cotización" 
              className="w-56 h-56 object-contain rounded-lg"
            />
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Escanea con cualquier cámara de smartphone
          </p>
        </div>

        {/* Info Badge */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Cliente</span>
            <span className="font-black text-slate-800">{checkIn.client?.name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Equipo</span>
            <span className="font-bold text-slate-700">{checkIn.printer?.brand} {checkIn.printer?.model}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
            <span className="text-slate-500 font-bold">Total Cotizado</span>
            <span className="font-black text-indigo-600 text-base">${checkIn.quote.total.toLocaleString('es-MX')} MXN</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Enlace Copiado!' : 'Copiar Enlace de Cotización'}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              <Download className="w-4 h-4" />
              Guardar QR
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
