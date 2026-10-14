import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  Cpu,
  Layers,
  Smartphone,
  FileText
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
  const [activeTab, setActiveTab] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const gsiContainerRef = useRef<HTMLDivElement>(null);

  const highlights = [
    {
      title: 'Recepción & Diagnóstico en 30s',
      desc: 'Registra marca, número de serie, accesorios y fallas con captura fotográfica instantánea.',
      badge: 'Velocidad Óptima',
      metric: '0.5m',
      metricLabel: 'Por ticket'
    },
    {
      title: 'Cotizaciones con Envío a WhatsApp',
      desc: 'Envía propuestas profesionales con desglose de refacciones y mano de obra directamente al celular del cliente.',
      badge: 'Conversión +45%',
      metric: '1-Click',
      metricLabel: 'Envío directo'
    },
    {
      title: 'Sincronización Cloud Multi-dispositivo',
      desc: 'Accede desde tu computadora de mostrador o tu teléfono celular con sincronización en tiempo real.',
      badge: 'PWA Multiplataforma',
      metric: '100%',
      metricLabel: 'En tiempo real'
    }
  ];

  // Auto-advance highlight tabs
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % highlights.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [highlights.length]);

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
              theme: 'filled_black',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'pill',
              width: 340
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

  const currentHighlight = highlights[activeTab];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-blue-500/30 selection:text-white"
    >
      {/* Dynamic Ambient Mesh Glow following mouse */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `
            radial-gradient(circle 700px at ${mousePos.x}% ${mousePos.y}%, rgba(37, 99, 235, 0.15), transparent 70%),
            radial-gradient(circle 600px at 90% 10%, rgba(56, 189, 248, 0.1), transparent 60%),
            radial-gradient(circle 800px at 10% 90%, rgba(99, 102, 241, 0.1), transparent 70%)
          `
        }}
      />

      {/* Subtle Matrix Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Layout Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Dynamic Interactive Showcase */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-200 tracking-wide font-mono">
              PrintFix OS • Sistema de Taller Inteligente v2.4
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.1] font-display">
              La evolución digital para tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                taller de impresoras.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Controla cada equipo que ingresa, automatiza cotizaciones con WhatsApp, lleva el inventario de refacciones y administra tus notas de entrega en segundos.
            </p>
          </div>

          {/* Interactive Feature Card */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/25 transition-all duration-500" />
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">
                    {currentHighlight.badge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {currentHighlight.title}
                  </h3>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 shadow-inner">
                  {currentHighlight.metric}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{currentHighlight.metricLabel}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentHighlight.desc}
            </p>

            {/* Interactive Tab Selectors */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
              {highlights.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === idx
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>Módulo {idx + 1}</span>
                  {activeTab === idx && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          {/* Printer Brands pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400 font-medium">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Compatible con:</span>
            {['Epson EcoTank', 'Brother InkBenefit', 'HP Smart Tank', 'Canon MegaTank', 'Kyocera'].map((b, i) => (
              <span key={i} className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 shadow-sm">
                {b}
              </span>
            ))}
          </div>

        </div>

        {/* Right Column: Modern Dynamic Login Card */}
        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-3xl bg-slate-900/85 border border-slate-800 p-8 sm:p-10 shadow-2xl backdrop-blur-3xl overflow-hidden transition-all duration-300 hover:border-slate-700/80">
            
            {/* Top Corner Glowing Orb */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header Brand */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-xl shadow-blue-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Printer className="w-7 h-7 text-blue-400" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white font-display">
                  Print<span className="text-blue-400">Fix</span>
                </span>
                <p className="text-xs text-slate-400 font-medium">Sistema de Gestión de Taller</p>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-black tracking-tight text-white font-display">
                Bienvenido al Taller
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Inicia sesión de forma instantánea y segura con tu cuenta de Google.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl flex items-start gap-3 text-xs font-semibold mb-6 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Primary Login Actions */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="group relative w-full py-4 px-6 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 text-sm font-bold rounded-2xl shadow-xl shadow-white/5 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer border border-slate-200 overflow-hidden"
              >
                {/* Hover shine effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Conectando con Google...</span>
                  </>
                ) : (
                  <>
                    {/* Google SVG Logo */}
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

              {/* GIS One Tap Container */}
              <div ref={gsiContainerRef} className="flex justify-center empty:hidden" />

              {errorMessage && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar inicio con Google</span>
                </button>
              )}
            </div>

            {/* Security checklist */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3 text-slate-400 text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sincronización multi-dispositivo en tiempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Control de equipos, refacciones y clientes</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cotizaciones con botón directo a WhatsApp</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-8 font-medium">
              PrintFix © 2026 • Plataforma de Gestión de Talleres
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
