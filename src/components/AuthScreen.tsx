import React, { useState } from 'react';
import { Printer, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
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
        setError(result.error);
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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative z-10">
        {/* Left Side: Branding/Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-10">
            <Printer className="w-64 h-64 rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Printer className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tighter">PrintLogicMx</span>
            </div>
            
            <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-8">
              Gestión <br /> <span className="text-indigo-200">Inteligente</span> <br /> de Taller.
            </h1>
            <p className="text-indigo-100/70 font-medium max-w-xs">
              La plataforma definitiva para el control de ingresos, cotizaciones y entregas de equipos de impresión.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[10px] font-black">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-indigo-100/50 uppercase tracking-widest">Confiado por expertos</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-16 lg:p-20 bg-white flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                Bienvenido.
              </h2>
              <p className="text-slate-400 font-medium">
                Inicia sesión en tu cuenta para acceder al sistema.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Primary Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isGoogleLoading || isPasswordLoading}
                className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span>Conectando con Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                    <span className="font-extrabold text-slate-800">Iniciar sesión con Google</span>
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-white px-3 text-slate-400 font-extrabold">o acceso de administrador</span>
                </div>
              </div>

              {!showPasswordForm ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors text-center block"
                >
                  Ingresar con Contraseña Maestra
                </button>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña Maestra</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="w-full pl-14 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPasswordLoading || isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Ingresar al Sistema
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
