import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Upload, 
  Building, 
  Phone, 
  Mail, 
  Globe, 
  Image as ImageIcon, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2,
  Bell,
  Volume2,
  Vibrate,
  Sparkles,
  AlertCircle,
  Smartphone,
  Lock,
  Timer
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { 
  scheduleTestPushForLockScreen, 
  registerPushSubscription,
  getRegisteredDevicesCount,
  isIOSDevice,
  isStandalonePWA
} from '../utils/notificationService';

export function CompanySettings() {
  const { settings, updateSettings, loading } = useSettings();
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    permission,
    settings: notifSettings,
    supported: notifSupported,
    requestPermission,
    updateSettings: updateNotifSettings,
    triggerTestNotification
  } = useNotifications();

  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [lockTestCountdown, setLockTestCountdown] = useState<number | null>(null);
  const [activeDevices, setActiveDevices] = useState<number>(0);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    getRegisteredDevicesCount().then(setActiveDevices);
  }, [permission]);

  useEffect(() => {
    // Only update from background sync if the user is not actively editing
    if (settings && !isDirtyRef.current) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isDirtyRef.current = true;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      addToast('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize and compress on canvas to ensure <80KB size for fast storage & Firestore
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
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
          const compressedDataUrl = canvas.toDataURL('image/png', 0.85);
          isDirtyRef.current = true;
          setFormData(prev => ({ ...prev, logo: compressedDataUrl }));
          addToast('Logotipo cargado y optimizado correctamente', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    isDirtyRef.current = true;
    setFormData(prev => ({ ...prev, logo: '' }));
    addToast('Logotipo eliminado', 'info');
  };

  const handleEnableNotifications = async () => {
    try {
      const res = await requestPermission();
      if (res === 'granted') {
        const subResult = await registerPushSubscription();
        if (subResult.deviceCount !== undefined) {
          setActiveDevices(subResult.deviceCount);
        }
        if (subResult.success) {
          addToast('¡Notificaciones activadas y celular registrado con éxito!', 'success');
        } else {
          addToast(subResult.message, 'info');
        }
      } else if (res === 'denied') {
        addToast('Las notificaciones están bloqueadas en los ajustes del navegador de tu celular.', 'error');
      }
    } catch (e) {
      addToast('Error al solicitar permisos de notificación', 'error');
    }
  };

  const handleTestNotification = async () => {
    setIsTestingNotif(true);
    try {
      const ok = await triggerTestNotification();
      if (ok) {
        addToast('Notificación de prueba enviada con sonido y vibración 🔔', 'success');
      } else {
        if (permission === 'denied') {
          addToast('Debes habilitar los permisos de notificación en tu celular', 'error');
        } else {
          addToast('Notificación local ejecutada con sonido y vibración', 'info');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingNotif(false);
    }
  };

  const handleTestLockScreenPush = async () => {
    if (lockTestCountdown !== null) return;
    setIsTestingNotif(true);

    try {
      // 1. Permission check
      if (permission !== 'granted') {
        const res = await requestPermission();
        if (res !== 'granted') {
          addToast('Debes pulsar "Permitir" cuando el celular te pregunte por notificaciones.', 'error');
          return;
        }
      }

      // 2. iOS Safari check
      if (isIOSDevice() && !isStandalonePWA()) {
        addToast('En iPhone: Pulsa el botón Compartir (cuadrado con flecha) > "Añadir a pantalla de inicio" para recibir avisos con pantalla bloqueada.', 'info');
      }

      // 3. Register device with backend
      const subResult = await registerPushSubscription();
      if (subResult.deviceCount !== undefined) {
        setActiveDevices(subResult.deviceCount);
      }

      // 4. Schedule server push in 10 seconds
      const scheduleResult = await scheduleTestPushForLockScreen(10);

      if (!scheduleResult.success) {
        addToast(`Error al programar prueba: ${scheduleResult.message || 'Intenta nuevamente'}`, 'error');
        return;
      }

      setLockTestCountdown(10);
      addToast('📱 ¡Prueba iniciada! Bloquea la pantalla de tu celular ahora.', 'success');

      let remaining = 10;
      const interval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(interval);
          setLockTestCountdown(null);
        } else {
          setLockTestCountdown(remaining);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error in handleTestLockScreenPush:', err);
      addToast(`Error: ${err.message || 'No se pudo iniciar la prueba'}`, 'error');
    } finally {
      setIsTestingNotif(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const success = await updateSettings(formData);
      if (success) {
        isDirtyRef.current = false;
        setSavedSuccess(true);
        addToast('Configuración del taller guardada correctamente', 'success');
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        addToast('Error al guardar la configuración', 'error');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      addToast('Error al guardar la configuración', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando configuración...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-36 md:pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Building className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configuración del Taller y Empresa</h1>
          <p className="text-sm text-slate-500 font-medium">Personaliza los datos, logotipo y avisos automáticos para tu taller</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notifications for Accepted Equipment Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Avisos y Notificaciones en Celular (PWA)</h2>
                <p className="text-xs text-slate-500">Recibe una alerta sonora, vibración y aviso en pantalla cuando un cliente acepte un equipo</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeDevices > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                  <Smartphone className="w-3.5 h-3.5" />
                  {activeDevices} celular{activeDevices !== 1 ? 'es' : ''} registrado{activeDevices !== 1 ? 's' : ''}
                </span>
              )}
              {permission === 'granted' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Notificaciones Activadas
                </span>
              ) : permission === 'denied' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Bloqueadas en Navegador
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Activar en este Celular
                </button>
              )}
            </div>
          </div>

          {/* Quick Test & Status Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Aviso instantáneo de Equipos Aceptados
                </p>
                <p className="text-xs text-slate-500">
                  Cuando un equipo cambie a estado <strong>"Aceptado"</strong> (desde este celular o cualquier otra computadora del taller), sonará un timbre y se enviará la notificación Push en segundo plano a tu celular.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={isTestingNotif || lockTestCountdown !== null}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  {isTestingNotif ? 'Probando...' : '🔔 Probar en Pantalla'}
                </button>

                <button
                  type="button"
                  onClick={handleTestLockScreenPush}
                  disabled={isTestingNotif || lockTestCountdown !== null}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 touch-manipulation disabled:opacity-70"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  {isTestingNotif 
                    ? '⏳ Conectando...' 
                    : lockTestCountdown !== null 
                      ? `⏱️ Bloquea móvil (${lockTestCountdown}s)...` 
                      : '📱 Probar con Móvil Bloqueado (10s)'}
                </button>
              </div>
            </div>

            {/* Countdown Alert for Lock Screen Test */}
            {lockTestCountdown !== null && (
              <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-md animate-pulse">
                <Timer className="w-6 h-6 shrink-0" />
                <div className="text-xs space-y-0.5">
                  <span className="font-extrabold text-sm block">¡Bloquea la pantalla de tu celular ahora!</span>
                  <span>En <strong className="text-amber-200 text-sm">{lockTestCountdown} segundos</strong> se enviará la notificación Web Push a tu pantalla bloqueada.</span>
                </div>
              </div>
            )}

            {/* Mobile OS Instructions Info Box */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-indigo-950 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Instrucciones según tu teléfono:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li><strong>Android (Chrome / PWA):</strong> Pulsa "Activar en este Celular" y acepta el permiso. La notificación encenderá tu pantalla con sonido y vibración.</li>
                <li><strong>iPhone / iPad (iOS):</strong> Apple exige agregar la app a la pantalla de inicio (botón <strong>Compartir ⎋</strong> en Safari &gt; <strong>"Añadir a pantalla de inicio"</strong>) y abrirla desde el icono para recibir avisos bloqueado.</li>
              </ul>
            </div>

            {/* Notification Preferences Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={notifSettings.notifyOnAccepted}
                  onChange={(e) => updateNotifSettings({ notifyOnAccepted: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700">Avisar Equipos Aceptados</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={notifSettings.sound}
                  onChange={(e) => updateNotifSettings({ sound: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  Sonido / Timbre de Alerta
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={notifSettings.vibrate}
                  onChange={(e) => updateNotifSettings({ vibrate: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Vibrate className="w-3.5 h-3.5 text-slate-400" />
                  Vibración en Celular
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Logo Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-slate-400" />
            Logotipo del Taller
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-36 h-36 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group shadow-inner">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-300">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-[10px] font-bold">Sin logo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-bold">Cambiar</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
            
            <div className="flex-1 space-y-3 text-center md:text-left">
              <p className="text-sm font-bold text-slate-900">Sube el logo de tu taller o negocio</p>
              <p className="text-xs text-slate-500">Se optimiza automáticamente para documentos y cotizaciones en PDF e impresiones.</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                <label className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  Seleccionar Imagen
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
                    onClick={handleRemoveLogo}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-400" />
            Datos de Contacto del Taller
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Negocio / Taller</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Ej. PrintLogic Soluciones"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="Ej. +52 55 1234 5678"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="contacto@empresa.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sitio Web o Redes</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  placeholder="www.tuempresa.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dirección Física</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Calle, Número, Colonia, Ciudad, Estado"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Unified Sync Account Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Cuenta Única y Sincronización
            </h2>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              Sincronizado en Tiempo Real
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white font-black flex items-center justify-center text-base shadow-sm">
                PF
              </div>
              <div>
                <p className="text-base font-black text-slate-900">{user?.name || 'Administrador General'}</p>
                <p className="text-xs text-slate-500 font-medium font-mono">{user?.email || 'admin@printfix.com'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Todos los equipos, clientes, cotizaciones y ajustes de taller se guardan en la nube para todos los dispositivos.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-4">
          {savedSuccess && (
            <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              ¡Cambios guardados con éxito!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
