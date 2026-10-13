import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Upload, 
  Check, 
  Sparkles, 
  Printer, 
  FileText,
  Trash2,
  Loader2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompanySettings } from '../types';

interface WorkshopOnboardingModalProps {
  initialSettings: CompanySettings;
  onSave: (settings: CompanySettings) => Promise<boolean>;
  onClose: () => void;
  isInitialSetup?: boolean;
}

export function WorkshopOnboardingModal({
  initialSettings,
  onSave,
  onClose,
  isInitialSetup = true
}: WorkshopOnboardingModalProps) {
  const [formData, setFormData] = useState<CompanySettings>({
    name: initialSettings.name || 'Mi Taller de Impresoras',
    phone: initialSettings.phone || '',
    email: initialSettings.email || '',
    address: initialSettings.address || '',
    logo: initialSettings.logo || '',
    website: initialSettings.website || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          handleInputChange('logo', compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const success = await onSave(formData);
      if (success !== false) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        localStorage.setItem('printfix_workshop_onboarding_done', 'true');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error('Error saving workshop onboarding settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('printfix_workshop_onboarding_done', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Top Header Banner */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-800/80 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
                <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {isInitialSetup ? '¡Bienvenido a tu Taller!' : 'Configuración de Identidad'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Personaliza el nombre y datos de contacto que aparecerán en tus notas y tickets de entrega.
                </p>
              </div>
            </div>

            {!isInitialSetup && (
              <button 
                type="button" 
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeStep === 1 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>1. Datos del Taller</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeStep === 2 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>2. Logotipo & Vista Previa</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Workshop Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Nombre del Taller / Negocio *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej. PrintFix Taller, Soluciones Epson & Brother"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400">
                  Este nombre se imprimirá en grande en todos los comprobantes y presupuestos.
                </p>
              </div>

              {/* Phone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Teléfono o WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Ej. (55) 1234-5678"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Correo de Atención</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contacto@taller.com"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Dirección Física del Taller</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Calle, número, colonia, código postal y ciudad"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Website / Social */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Sitio Web o Redes (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="facebook.com/mitaller o www.mitaller.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Logo Upload Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Logotipo del Taller</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt="Logo taller" 
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Printer className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-slate-300 font-medium">
                      Sube una imagen cuadrada o rectangular en formato PNG o JPG.
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.logo ? 'Cambiar Logo' : 'Seleccionar Imagen'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          className="hidden" 
                        />
                      </label>

                      {formData.logo && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('logo', '')}
                          className="px-3 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Quitar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Ticket Header Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Vista previa del encabezado de tus notas de servicio:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
                    En vivo
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md font-sans">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      {formData.logo ? (
                        <img 
                          src={formData.logo} 
                          alt="Logo" 
                          className="w-12 h-12 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                          {formData.name.slice(0, 2).toUpperCase() || 'PF'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-black tracking-tight text-slate-900">
                          {formData.name || 'Nombre del Taller'}
                        </h3>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {formData.address || 'Dirección de taller'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500">
                      {formData.phone && <p className="font-semibold text-slate-800">Tel: {formData.phone}</p>}
                      {formData.email && <p>{formData.email}</p>}
                    </div>
                  </div>

                  <div className="pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>ORDEN DE SERVICIO #2026-001</span>
                    <span className="font-semibold text-emerald-700">GARANTÍA INCLUIDA</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {isInitialSetup ? (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-slate-500 hover:text-slate-300 font-semibold px-3 py-2 transition-colors order-2 sm:order-1"
              >
                Configurar más tarde
              </button>
            ) : <div className="order-2 sm:order-1" />}

            <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
              {activeStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Siguiente: Logotipo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Volver
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving || !formData.name.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando taller...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardar y Entrar al Taller</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
