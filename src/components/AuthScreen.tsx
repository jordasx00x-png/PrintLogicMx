import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  Smartphone,
  FileText,
  Shield,
  Zap,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GoogleAuthResult, activeConfig } from '../lib/firebase';

interface AuthScreenProps {
  onLoginGoogle: () => Promise<GoogleAuthResult>;
  onLoginGoogleToken?: (idToken: string) => Promise<GoogleAuthResult>;
}

export function AuthScreen({ 
  onLoginGoogle, 
  onLoginGoogleToken
}: AuthScreenProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const gsiContainerRef = useRef<HTMLDivElement>(null);

  const featureTabs = [
    {
      icon: Zap,
      title: 'Diagnóstico & Recepción Express',
      desc: 'Registra marca, serie, fallas y fotos del equipo en menos de 30 segundos.',
      tag: 'Recepción Rápida',
      stat: '03 min',
      statLabel: 'Tiempo promedio de ingreso'
    },
    {
      icon: FileText,
      title: 'Cotizaciones A/B con WhatsApp',
      desc: 'Genera propuestas estándar y premium con desglose de refacciones y mano de obra.',
      tag: 'Presupuestos PDF',
      stat: '100%',
      statLabel: 'Control de garantías'
    },
    {
      icon: Smartphone,
      title: 'Notificaciones Móvil en Tiempo Real',
      desc: 'Recibe alertas sonoras en tu celular bloqueado cuando el cliente apruebe la reparación.',
      tag: 'PWA Multi-dispositivo',
      stat: 'En vivo',
      statLabel: 'Sincronización PC y Móvil'
    }
  ];

  // Auto-cycle through features every 5 seconds if idle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureTab((prev) => (prev + 1) % featureTabs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featureTabs.length]);

  // Track mouse for dynamic ambient glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Initialize Google Identity Services (GIS) if available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && activeConfig?.oAuthClientId) {
        try {
          google.accounts.id.initialize({
            client_id: activeConfig.oAuthClientId,
            callback: async (response: any) => {
              if (response?.credential && onLoginGoogleToken) {
                setIsGoogleLoading(true);
                setErrorMessage(null);
                try {
                  const res = await onLoginGoogleToken(response.credential);
                  if (!res.success) {
                    setErrorMessage(res.error || 'No se pudo validar la cuenta de Google.');
                  }
                } catch (err: any) {
                  setErrorMessage(err.message || 'Error al iniciar sesión con Google.');
                } finally {
                  setIsGoogleLoading(false);
                }
              }
            }
          });

          if (gsiContainerRef.current) {
            google.accounts.id.renderButton(gsiContainerRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'pill',
              width: 320
            });
          }
        } catch (e) {
          console.warn('GIS notice:', e);
        }
      }
    };

    const timer = setTimeout(checkGsi, 400);
    return () => clearTimeout(timer);
  }, [onLoginGoogleToken]);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const result = await onLoginGoogle();
      if (!result.success) {
        setErrorMessage(result.error || 'No se pudo iniciar sesión con Google. Por favor, reintenta.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al conectar con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const currentTab = featureTabs[activeFeatureTab];
  const CurrentIcon = currentTab.icon;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden selection:bg-blue-500/30 selection:text-white"
    >
      {/* Dynamic Interactive Ambient Mesh Background */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `
            radial-gradient(circle 800px at ${mousePos.x}% ${mousePos.y}%, rgba(37, 99, 235, 0.12), transparent 80%),
            radial-gradient(circle 600px at 80% 20%, rgba(14, 165, 233, 0.08), transparent 70%),
            radial-gradient(circle 700px at 15% 85%, rgba(99, 102, 241, 0.08), transparent 70%)
          `
        }}
      />

      {/* Subtle blueprint grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Dynamic Feature Showcase (Visible on all, expanded on desktop) */}
        <div className="lg:col-span-7 space-y-6 lg:pr-4">
          
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-300 font-mono tracking-wide">
              PrintFix OS v2.4 • Taller Inteligente
            </span>
          </div>

          {/* Hero Headings */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display leading-[1.15]">
              Gestión total para tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                taller de impresoras.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
              Controla ingresos, diagnósticos de inyectores, presupuestos con WhatsApp y refacciones desde un solo lugar.
            </p>
          </div>

          {/* Interactive Feature Carousel Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/15 transition-all" />
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                  <CurrentIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">
                    {currentTab.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {currentTab.title}
                  </h3>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {currentTab.stat}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">{currentTab.statLabel}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentTab.desc}
            </p>

            {/* Interactive Feature Selectors */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/60">
              {featureTabs.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFeatureTab(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                    activeFeatureTab === idx
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Paso {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Supported Printer Brands Marquee */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Compatible:</span>
            {['Epson EcoTank', 'Brother InkBenefit', 'HP Smart Tank', 'Canon MegaTank', 'Kyocera'].map((brand, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400"
              >
                {brand}
              </span>
            ))}
          </div>

        </div>

        {/* Right Side: Ultra-Modern Interactive Google Auth Card */}
        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-3xl bg-slate-900/85 border border-slate-800 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:border-slate-700/80">
            
            {/* Top corner subtle glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Brand Header */}
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Printer className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white font-display">
                  Print<span className="text-blue-400">Fix</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Sistema de Taller y Reparaciones</p>
              </div>
            </div>

            {/* Login Prompt Title */}
            <div className="space-y-1.5 mb-7">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                Iniciar Sesión
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Accede de forma rápida y segura con tu cuenta de Google para entrar al taller.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Primary Google Login Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="group relative w-full py-4 px-6 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 text-sm font-bold rounded-2xl shadow-xl shadow-white/5 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer border border-slate-200 overflow-hidden"
              >
                {/* Subtle shine hover effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="font-bold">Iniciando sesión con Google...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google G Logo */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="font-extrabold tracking-tight">Continuar con cuenta Google</span>
                  </>
                )}
              </button>

              {/* GIS One-Tap Container */}
              <div ref={gsiContainerRef} className="flex justify-center empty:hidden" />

              {/* Retry Button if an error was encountered */}
              {errorMessage && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reintentar inicio con Google</span>
                </button>
              )}
            </div>

            {/* Trust and Feature Bullets */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sincronización en la nube multi-dispositivo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Órdenes de servicio, clientes y refacciones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cotizaciones con envío directo a WhatsApp</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-6">
              PrintFix © 2026 • Plataforma Profesional de Gestión
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
