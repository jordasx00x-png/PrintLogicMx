import React, { useState } from 'react';
import { Printer, Lock, AlertCircle, ArrowRight, Loader2, ShieldCheck, KeyRound, ChevronDown, ChevronUp } from 'lucide-react';
import { MASTER_USER } from '../hooks/useAuth';

interface AuthScreenProps {
  onLoginGoogle: () => Promise<{ success: boolean; error?: string }>;
  onLoginPassword?: (password?: string) => Promise<{ success: boolean; error?: string }>;
}

export function AuthScreen({ onLoginGoogle, onLoginPassword }: AuthScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const result = await onLoginGoogle();
      if (!result.success) {
        setError(result.error || 'No se pudo iniciar sesión con Google.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLoginPassword) return;

    setError(null);
    setIsPasswordLoading(true);

    try {
      const result = await onLoginPassword(password);
      if (!result.success) {
        setError(result.error || 'Contraseña de taller incorrecta');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al ingresar con contraseña');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative selection:bg-blue-500/30 selection:text-white">
      {/* Background radial gradient glow */}
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
            Accede con tu cuenta de Google para sincronizar órdenes, clientes, garantías y presupuestos del taller.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Main Action: Google Sign-In */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isPasswordLoading}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 text-sm font-bold rounded-2xl shadow-lg shadow-white/5 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer border border-slate-200"
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

          {/* Secure & Cloud Sync Highlights */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Autenticación segura
            </span>
            <span className="text-slate-700">•</span>
            <span>Sincronización Cloud</span>
          </div>

          {/* Fallback Option Toggle: Workshop Key / Admin */}
          {onLoginPassword && (
            <div className="pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowPasswordFallback(!showPasswordFallback)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>¿Ingresar con contraseña de taller?</span>
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
                    disabled={isPasswordLoading || isGoogleLoading}
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
