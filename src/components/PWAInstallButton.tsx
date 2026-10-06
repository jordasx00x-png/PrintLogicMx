import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'drawer' | 'card' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on device, hide button
  if (isInstalled) {
    return null;
  }

  // Handle click for desktop/Android or show guide for iOS
  const handleClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // In browsers that don't support beforeinstallprompt yet or user already dismissed
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer active:scale-95 transition-all ${className}`}
          title="Instalar PrintFix como aplicación en tu dispositivo"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar App</span>
          <span className="sm:hidden">Instalar</span>
        </button>
      )}

      {variant === 'drawer' && (
        <button
          onClick={handleClick}
          className={`w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition-all active:scale-98 cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-blue-400" />
            <span>Instalar como App (PC/Móvil)</span>
          </div>
          <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">PWA</span>
        </button>
      )}

      {variant === 'card' && (
        <div className={`p-4 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 text-white flex items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Instalar PrintFix</h4>
              <p className="text-[11px] text-slate-400 truncate">Accede más rápido sin navegador</p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="btn-tactile bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0"
          >
            Instalar
          </button>
        </div>
      )}

      {/* iOS Safari & General Manual Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 font-display">Instalar PrintFix</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Puedes instalar PrintFix directamente como una aplicación independiente:
              </p>

              {/* iPhone / iPad */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>En iPhone o iPad (Safari):</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Toca el botón <strong>Compartir</strong> <Share2 className="w-3 h-3 inline text-blue-600" /> en la barra de Safari.</li>
                  <li>Desliza hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong> <PlusSquare className="w-3 h-3 inline text-slate-700" />.</li>
                  <li>Toca <strong>Agregar</strong> en la esquina superior derecha.</li>
                </ol>
              </div>

              {/* PC / Mac / Chrome / Edge */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                  <span>En PC / Laptop (Chrome / Edge):</span>
                </div>
                <p className="text-slate-600">
                  Haz clic en el icono de instalación <Download className="w-3 h-3 inline text-slate-700" /> ubicado en la barra de direcciones de tu navegador, o abre el menú ⋮ y elige <strong>"Instalar PrintFix"</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
