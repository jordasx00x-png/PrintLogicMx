import { useMemo } from 'react';
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Package, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Zap,
  Wrench,
  Sparkles,
  ShoppingBag,
  Layers,
  CalendarDays
} from 'lucide-react';
import { motion } from 'motion/react';
import { CheckIn } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: {
    totalSales: number;
    pendingRepairs: number;
    repairedToday: number;
    totalClients: number;
  };
  checkIns: CheckIn[];
  onViewDetails: (id: string) => void;
  onNavigate: (view: string) => void;
}

export function Dashboard({ stats, checkIns, onViewDetails, onNavigate }: DashboardProps) {
  const recentCheckIns = checkIns.slice(0, 6);

  // Compute live pipeline breakdown
  const pipelineStats = useMemo(() => {
    return {
      ingresado: checkIns.filter(c => c.printer.status === 'Ingresado').length,
      cotizado: checkIns.filter(c => c.printer.status === 'Cotizado').length,
      aceptado: checkIns.filter(c => c.printer.status === 'Aceptado').length,
      reparado: checkIns.filter(c => c.printer.status === 'Reparado').length,
      entregado: checkIns.filter(c => c.printer.status === 'Entregado').length,
    };
  }, [checkIns]);

  // Generate real monthly trend from checkIns
  const chartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonthIdx = new Date().getMonth();
    
    // Last 6 months
    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      lastSixMonths.push({ name: months[idx], idx, total: 0 });
    }

    checkIns.forEach(c => {
      const date = new Date(c.createdAt);
      const monthIdx = date.getMonth();
      const monthObj = lastSixMonths.find(m => m.idx === monthIdx);
      if (monthObj) {
        monthObj.total += 1;
      }
    });

    return lastSixMonths.map(m => ({ name: m.name, reparaciones: m.total }));
  }, [checkIns]);

  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 md:space-y-10 pb-16">
      {/* Executive Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-indigo-500/20">
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-100 border border-white/10">
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="capitalize">{todayFormatted}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Gestión Inteligente de Taller
          </h1>

          <p className="text-indigo-100 text-base md:text-lg font-medium leading-relaxed">
            Tienes <span className="text-white font-black underline decoration-indigo-300 decoration-2 underline-offset-4">{stats.pendingRepairs} equipos</span> en proceso de diagnóstico o reparación activa.
          </p>
        </div>

        {/* Live Metric Cards Stack */}
        <div className="relative z-10 flex flex-wrap sm:flex-nowrap gap-4">
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 flex flex-col items-center justify-center text-center w-36 shadow-lg">
            <p className="text-3xl font-black mb-1">{stats.repairedToday}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Listas hoy</p>
          </div>

          <div className="bg-white text-slate-900 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center w-36 shadow-2xl shrink-0">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 text-indigo-600">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-900">En Línea</p>
            <p className="text-[10px] font-bold text-slate-400">Sincronizado</p>
          </div>
        </div>

        {/* Decorative Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none"></div>
      </div>

      {/* Primary Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ingresos Totales', value: `$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'indigo', badge: 'Ventas + Reparaciones' },
          { label: 'En Diagnóstico / Proceso', value: stats.pendingRepairs, icon: Clock, color: 'amber', badge: 'Pendientes' },
          { label: 'Equipos Reparados', value: stats.repairedToday, icon: CheckCircle2, color: 'emerald', badge: 'Completados' },
          { label: 'Clientes Registrados', value: stats.totalClients, icon: Users, color: 'slate', badge: 'Directorio' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/70 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center text-indigo-600">
                <stat.icon className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-slate-100 text-slate-600 rounded-xl">
                {stat.badge}
              </span>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Pipeline Flow Tracker */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Estado de Reparaciones en Taller</h2>
              <p className="text-xs text-slate-400 font-medium">Flujo de trabajo en tiempo real</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('list')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 self-start sm:self-auto"
          >
            Ver todos los ingresos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { status: 'Por Cotizar', count: pipelineStats.ingresado, bg: 'bg-amber-50 text-amber-800 border-amber-200/60', iconColor: 'text-amber-600' },
            { status: 'Cotizados', count: pipelineStats.cotizado, bg: 'bg-blue-50 text-blue-800 border-blue-200/60', iconColor: 'text-blue-600' },
            { status: 'Aceptados', count: pipelineStats.aceptado, bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/60', iconColor: 'text-indigo-600' },
            { status: 'Reparados', count: pipelineStats.reparado, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60', iconColor: 'text-emerald-600' },
            { status: 'Entregados', count: pipelineStats.entregado, bg: 'bg-slate-50 text-slate-800 border-slate-200/60', iconColor: 'text-slate-600' },
          ].map((stage, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${stage.bg} flex flex-col justify-between gap-3`}>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{stage.status}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black">{stage.count}</span>
                <span className="text-xs font-bold opacity-60">equipos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Recent Activity Stream & Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Stream */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Ingresos Recientes</h2>
              <p className="text-xs text-slate-400 font-medium">Últimos equipos recibidos para diagnóstico</p>
            </div>
            <button 
              onClick={() => onNavigate('list')}
              className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
            >
              Ver Lista Completa <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onViewDetails(c.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 rounded-2xl transition-all text-left group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {c.client?.name || 'Cliente sin nombre'}
                      </p>
                      <p className="text-xs font-medium text-slate-400 truncate">
                        {c.printer?.brand} {c.printer?.model} — <span className="text-slate-500">{c.printer?.problem}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border ${
                      c.printer?.status === 'Ingresado' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                      c.printer?.status === 'Cotizado' ? 'bg-blue-50 text-blue-700 border-blue-200/60' :
                      c.printer?.status === 'Aceptado' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                      c.printer?.status === 'Reparado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {c.printer?.status || 'Ingresado'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <ClipboardList className="w-12 h-12 mx-auto text-slate-200" />
                <p className="text-sm font-bold">No hay ingresos registrados aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Chart & Quick Shortcuts */}
        <div className="space-y-8">
          {/* Chart Section */}
          <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Tendencia de Servicios</h3>
                <p className="text-xs text-slate-400 font-medium">Volumen mensual de reparaciones</p>
              </div>
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReparaciones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="reparaciones" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorReparaciones)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Quick Actions */}
          <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Acciones Frecuentes</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate('new')}
                className="w-full flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black">Nuevo Ingreso</p>
                    <p className="text-[10px] text-indigo-200 font-medium">Registrar Equipo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => onNavigate('sales')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl border border-slate-100 transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black">Ventas y Refacciones</p>
                    <p className="text-[10px] text-slate-400 font-medium">Crear Cotización / Venta</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
