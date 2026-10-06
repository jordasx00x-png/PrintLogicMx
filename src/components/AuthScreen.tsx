import React, { useState } from 'react';
import { Printer, Lock, AlertCircle, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth, MASTER_USER } from '../hooks/useAuth';

interface AuthScreenProps {
  onLogin: ReturnType<typeof useAuth>['login'];
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await onLogin(password);
      if (!result.success) {
        setError(result.error || 'Contraseña incorrecta');
      }
    } catch (err: any) {
      setError(err.message || 'Error al ingresar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onLogin();
    } catch (err: any) {
      setError('Error al ingresar al taller');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative">
      <div className="w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-8 md:p-12 text-white">
        
        {/* Header Logo */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg">
            <Printer className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight font-display text-white">
              Print<span className="text-blue-400">Fix</span>
            </span>
            <p className="text-xs text-slate-400 font-medium">Gestión Unificada de Taller</p>
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-display text-white">
            Cuenta Única del Sistema
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Acceso unificado para el registro de impresoras, clientes, cotizaciones y ventas. Todos los datos se guardan y sincronizan automáticamente.
          </p>
        </div>

        {/* Master Account Info Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              Cuenta Maestro Activa
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-mono border border-emerald-500/30">
              Persistencia Cloud + SQLite
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-white">{MASTER_USER.name}</p>
              <p className="text-xs text-slate-400 font-mono">{MASTER_USER.email}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Access Action */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={isLoading}
            className="btn-tactile w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Ingresar al Sistema del Taller</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Optional PIN Unlock Form */}
          <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800 space-y-3">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Clave opcional de bloqueo (ej. PrintLogic2026*)"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
            </div>
          </form>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-6">
          PrintFix © 2026 • Sincronización continua de datos en la nube.
        </p>

      </div>
    </div>
  );
}
