import React, { useState } from 'react';
import { Printer, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthScreenProps {
  onLogin: ReturnType<typeof useAuth>['login'];
  onGoogleLogin: ReturnType<typeof useAuth>['loginWithGoogle'];
}

export function AuthScreen({ onLogin, onGoogleLogin }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleGoogleSubmit = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const result = await onGoogleLogin();
      if (!result.success && result.error) {
        if (result.error.includes('unauthorized-domain')) {
          setError(`El dominio (${window.location.hostname}) no está autorizado en Firebase. Para solucionarlo, agrégalo en la Consola de Firebase > Authentication > Settings > Authorized domains.`);
        } else {
          setError(result.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPasswordLoading(true);

    try {
      const result = await onLogin('admin@printfix.com', formData.password.trim());
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Left Side: Professional Workshop Brand */}
        <div className="p-8 md:p-12 bg-slate-900 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                <Printer className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight font-display text-white">
                  Print<span className="text-blue-400">Fix</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Gestión de Taller</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-display mb-4 leading-tight">
              Control Técnico y Cotizaciones.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Plataforma para el ingreso de equipos, seguimiento por número de serie, control de garantías y envío de cotizaciones digitales.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sincronización en la nube con Firestore y autenticación Google.</span>
          </div>
        </div>

        {/* Right Side: Login Actions */}
        <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Accede con tu cuenta autorizada para sincronizar el taller.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Primary Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isGoogleLoading || isPasswordLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Conectando con Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.91H1.21v3.15C3.21 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.32 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.21C.44 8.1 0 9.99 0 12s.44 3.9 1.21 5.44l4.11-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.21 2.64 1.21 6.56l4.11 3.15c.94-2.82 3.58-4.96 6.68-4.96z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-2.5 text-slate-400 font-bold">o acceso local</span>
                </div>
              </div>

              {!showPasswordForm ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors text-center cursor-pointer"
                >
                  Ingresar con contraseña local
                </button>
              ) : (
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contraseña Local</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPasswordLoading || isGoogleLoading}
                    className="btn-tactile w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Ingresar</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
