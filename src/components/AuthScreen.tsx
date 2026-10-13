import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  KeyRound, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';
import { GoogleAuthResult, activeConfig } from '../lib/firebase';

interface AuthScreenProps {
  onLoginGoogle: () => Promise<GoogleAuthResult>;
  onLoginPassword?: (password?: string) => Promise<{ success: boolean; error?: string }>;
  onLoginDirectAdmin?: (email?: string, name?: string) => Promise<{ success: boolean }>;
  onLoginGoogleToken?: (idToken: string) => Promise<GoogleAuthResult>;
}

export function AuthScreen({ 
  onLoginGoogle, 
  onLoginPassword,
  onLoginDirectAdmin,
  onLoginGoogleToken
}: AuthScreenProps) {
  const [password, setPassword] = useState('');
  const [errorInfo, setErrorInfo] = useState<GoogleAuthResult | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const gsiContainerRef = useRef<HTMLDivElement>(null);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentProjectId = activeConfig.projectId || 'mudix-489022';

  // Handle Google Identity Services (GIS) if loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && activeConfig.oAuthClientId) {
        try {
          google.accounts.id.initialize({
            client_id: activeConfig.oAuthClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setIsGoogleLoading(true);
                setErrorInfo(null);
                setGeneralError(null);
                try {
                  if (onLoginGoogleToken) {
                    const res = await onLoginGoogleToken(response.credential);
                    if (!res.success) {
                      setErrorInfo(res);
                      setGeneralError(res.error || 'No se pudo validar credencial de Google.');
                    }
                  } else if (onLoginDirectAdmin) {
                    await onLoginDirectAdmin('jordasx00x@gmail.com', 'Administrador Principal');
                  }
                } catch (err: any) {
                  setGeneralError(err.message || 'Error con cuenta Google');
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
          console.warn('Google Identity Services init notice:', e);
        }
      }
    };

    const timer = setTimeout(checkGsi, 500);
    return () => clearTimeout(timer);
  }, [onLoginGoogleToken, onLoginDirectAdmin]);

  const handleGoogleLogin = async () => {
    setErrorInfo(null);
    setGeneralError(null);
    setIsGoogleLoading(true);

    try {
      const result = await onLoginGoogle();
      if (!result.success) {
        setErrorInfo(result);
        setGeneralError(result.error || 'No se pudo iniciar sesión con Google.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Error al conectar con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDirectAdminLogin = async () => {
    if (!onLoginDirectAdmin) return;
    setGeneralError(null);
    setErrorInfo(null);
    setIsDirectLoading(true);
    try {
      await onLoginDirectAdmin('jordasx00x@gmail.com', 'Administrador Principal');
    } catch (err: any) {
      setGeneralError(err?.message || 'Error al ingresar');
    } finally {
      setIsDirectLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLoginPassword) return;

    setGeneralError(null);
    setErrorInfo(null);
    setIsPasswordLoading(true);

    try {
      const result = await onLoginPassword(password);
      if (!result.success) {
        setGeneralError(result.error || 'Contraseña de taller incorrecta');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Error al ingresar con contraseña');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative selection:bg-blue-500/30 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-10 text-white relative z-10">
        
        {/* Header Brand */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white shadow-md">
            <Printer className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight font-display text-white">
              Print<span className="text-blue-400">Fix</span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Taller Profesional de Impresoras</p>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display text-white">
            Iniciar Sesión
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Accede con tu cuenta de Google o perfil de administrador para sincronizar órdenes, clientes, garantías y presupuestos.
          </p>
        </div>

        {/* Detailed Firebase Guidance Card when unauthorized-domain happens */}
        {errorInfo?.errorCode === 'auth/unauthorized-domain' && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-2xl mb-6 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Paso necesario en Firebase Console:</p>
                <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                  El proyecto <strong>{currentProjectId}</strong> requiere autorizar este dominio en su consola de Firebase para permitir el inicio de sesión con ventana de Google.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-slate-300 truncate select-all">
                {currentDomain}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(currentDomain)}
                className="shrink-0 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedDomain ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Dominio</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={`https://console.firebase.google.com/project/${currentProjectId}/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Abrir Dominios Autorizados en Firebase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[10px] text-amber-300/80 leading-normal">
              1. Pega el dominio en <em>Dominios autorizados</em> y guarda.<br />
              2. Vuelve aquí y pulsa nuevamente <em>"Continuar con Google"</em>.
            </p>
          </div>
        )}

        {/* Detailed Firebase Guidance Card when operation-not-allowed happens */}
        {errorInfo?.errorCode === 'auth/operation-not-allowed' && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-2xl mb-6 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Habilitar Google en Firebase Console:</p>
                <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                  En el proyecto <strong>{currentProjectId}</strong>, ve a Authentication &gt; Métodos de inicio de sesión y habilita <strong>Google</strong>.
                </p>
              </div>
            </div>

            <a
              href={`https://console.firebase.google.com/project/${currentProjectId}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-center transition-colors shadow-sm"
            >
              Habilitar Proveedor Google en Firebase ↗
            </a>
          </div>
        )}

        {/* General Error Notification */}
        {generalError && errorInfo?.errorCode !== 'auth/unauthorized-domain' && errorInfo?.errorCode !== 'auth/operation-not-allowed' && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span>{generalError}</span>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="space-y-4">
          
          {/* Main Action: Google Sign-In with official Branding */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isPasswordLoading || isDirectLoading}
            className="w-full py-4 px-6 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 text-sm font-bold rounded-2xl shadow-lg shadow-white/5 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer border border-slate-200"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Conectando con Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Logo SVG */}
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

          {/* Optional GIS Button container placeholder if rendered by Google script */}
          <div ref={gsiContainerRef} className="flex justify-center empty:hidden" />

          {/* Instant 1-Click Access for jordasx00x@gmail.com */}
          {onLoginDirectAdmin && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDirectAdminLogin}
                disabled={isDirectLoading || isGoogleLoading || isPasswordLoading}
                className="w-full py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 hover:text-white text-xs font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isDirectLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>Entrar como jordasx00x@gmail.com (Administrador)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Badges */}
          <div className="pt-1 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Proyecto: {currentProjectId}
            </span>
            <span className="text-slate-700">•</span>
            <span>Sincronización en la Nube</span>
          </div>

          {/* Workshop Key / Password Fallback */}
          {onLoginPassword && (
            <div className="pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowPasswordFallback(!showPasswordFallback)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>¿Ingresar con clave de taller?</span>
                {showPasswordFallback ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {showPasswordFallback && (
                <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Clave de taller (ej. PrintLogic2026*)"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPasswordLoading || isGoogleLoading || isDirectLoading}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPasswordLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Ingresar con Clave</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-[10px] text-slate-500 text-center mt-6">
          PrintFix © 2026 • Sistema Profesional de Gestión y Reparaciones
        </p>

      </div>
    </div>
  );
}
