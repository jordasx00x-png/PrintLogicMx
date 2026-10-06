import React, { useState } from 'react';
import { Printer, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, UserPlus, LogIn, Mail, User, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthScreenProps {
  onLogin: ReturnType<typeof useAuth>['login'];
  onGoogleLogin: ReturnType<typeof useAuth>['loginWithGoogle'];
  onRegister: ReturnType<typeof useAuth>['register'];
}

export function AuthScreen({ onLogin, onGoogleLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: 'admin@printfix.com',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHostname = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoogleSubmit = async () => {
    setError(null);
    setErrorCode(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);
    try {
      const result = await onGoogleLogin();
      if (!result.success) {
        if (result.errorCode === 'auth/unauthorized-domain' || result.error?.includes('unauthorized-domain')) {
          setErrorCode('auth/unauthorized-domain');
          setError(`El dominio '${currentHostname}' no está autorizado en la Consola de Firebase para inicio de sesión con Google.`);
        } else if (result.errorCode === 'auth/popup-blocked') {
          setErrorCode('auth/popup-blocked');
          setError('El navegador bloqueó la ventana emergente de Google. Por favor activa las ventanas emergentes o usa correo/contraseña.');
        } else {
          setError(result.error || 'Error al conectar con Google');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDirectAdminLogin = async (emailToUse?: string) => {
    setError(null);
    setErrorCode(null);
    setIsLoading(true);

    const targetEmail = emailToUse || loginData.email || 'jordasx00x@gmail.com';
    const targetPassword = targetEmail === 'jordasx00x@gmail.com' ? 'PrintLogic2026*' : (loginData.password || 'PrintLogic2026*');

    try {
      const result = await onLogin(targetEmail.trim(), targetPassword.trim());
      if (!result.success) {
        // Fallback to register if not existing
        const regRes = await onRegister('Administrador', targetEmail.trim(), targetPassword.trim());
        if (!regRes.success) {
          setError(regRes.error || 'No se pudo iniciar sesión.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const result = await onLogin(loginData.email.trim(), loginData.password.trim());
      if (!result.success) {
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setSuccessMsg(null);

    if (!registerData.name.trim() || !registerData.email.trim() || !registerData.password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (registerData.password.trim().length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await onRegister(
        registerData.name.trim(),
        registerData.email.trim(),
        registerData.password.trim()
      );
      if (result.success) {
        setSuccessMsg('¡Cuenta creada correctamente! Iniciando sesión...');
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaultAdmin = () => {
    setLoginData({
      email: 'admin@printfix.com',
      password: 'PrintLogic2026*',
    });
    setError(null);
    setErrorCode(null);
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
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6">
              Plataforma para el ingreso de equipos, seguimiento por número de serie, control de garantías y envío de cotizaciones digitales.
            </p>

            {/* Quick Demo Credentials Banner */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                Cuentas de Acceso Administrador
              </p>
              <div className="bg-slate-900/80 p-2.5 rounded-xl font-mono text-[11px] text-slate-300 space-y-1.5 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span><span className="text-slate-500">Email:</span> jordasx00x@gmail.com</span>
                  <button
                    type="button"
                    onClick={() => handleDirectAdminLogin('jordasx00x@gmail.com')}
                    className="text-[10px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 px-2 py-0.5 rounded font-sans font-bold cursor-pointer"
                  >
                    Entrar
                  </button>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span><span className="text-slate-500">Email:</span> admin@printfix.com</span>
                  <button
                    type="button"
                    onClick={() => handleDirectAdminLogin('admin@printfix.com')}
                    className="text-[10px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 px-2 py-0.5 rounded font-sans font-bold cursor-pointer"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sincronización en la nube con Firestore e inicio directo.</span>
          </div>
        </div>

        {/* Right Side: Login / Register Actions */}
        <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-6">
            
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setErrorCode(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); setErrorCode(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">
                {mode === 'login' ? 'Acceso al Sistema' : 'Crear Cuenta de Administrador'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login' 
                  ? 'Ingresa tus credenciales para administrar el taller.' 
                  : 'Crea tu propio usuario con privilegios de administrador.'}
              </p>
            </div>

            {/* GitHub Pages / Firebase Unauthorized Domain Warning Box */}
            {errorCode === 'auth/unauthorized-domain' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900 mb-1">
                      Inicio con Google en GitHub Pages
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Para habilitar el botón emergente de Google en tu dominio (<span className="font-mono font-bold">{currentHostname}</span>):
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 font-mono text-[11px] flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-slate-800">{currentHostname}</span>
                  <button
                    type="button"
                    onClick={handleCopyHostname}
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <ol className="list-decimal list-inside text-[11px] text-amber-800 space-y-1 pl-1">
                  <li>Ve a <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">Consola de Firebase <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Selecciona <b>Authentication</b> &gt; <b>Settings</b> &gt; <b>Authorized domains</b></li>
                  <li>Haz clic en <b>Add Domain</b> y pega <span className="font-mono font-bold">{currentHostname}</span></li>
                </ol>

                <div className="pt-2 border-t border-amber-200/80">
                  <p className="text-[11px] font-bold text-amber-900 mb-2">
                    ¿Quieres entrar ya sin esperar a configurar Firebase?
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDirectAdminLogin('jordasx00x@gmail.com')}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Entrar como Administrador Principal (jordasx00x@gmail.com)</span>
                  </button>
                </div>
              </div>
            )}

            {error && errorCode !== 'auth/unauthorized-domain' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'login' ? (
              <div className="space-y-4">
                {/* Primary Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleSubmit}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-white px-2.5 text-slate-400 font-bold">o correo y contraseña</span>
                  </div>
                </div>

                <form className="space-y-3.5" onSubmit={handleLoginSubmit}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        placeholder="tu_correo@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contraseña</label>
                      <button
                        type="button"
                        onClick={fillDefaultAdmin}
                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Auto-llenar clave
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
                    disabled={isLoading || isGoogleLoading}
                    className="btn-tactile w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Ingresar al Taller</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Register Form */
              <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="mi_cuenta@taller.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Mínimo 4 caracteres"
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
                  disabled={isLoading}
                  className="btn-tactile w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Crear e Iniciar Sesión</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
