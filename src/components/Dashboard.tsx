import { useState, useMemo } from 'react';
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Package, 
  Plus, 
  Barcode, 
  ChevronRight, 
  Printer, 
  ShoppingBag,
  ShieldCheck,
  ArrowUpRight,
  FileCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { CheckIn } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

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
  const [quickSerialQuery, setQuickSerialQuery] = useState('');
  const recentCheckIns = checkIns.slice(0, 5);

  // Status breakdown counts
  const statusCounts = useMemo(() => {
    return {
      Ingresado: checkIns.filter(c => c.printer?.status === 'Ingresado').length,
      Cotizado: checkIns.filter(c => c.printer?.status === 'Cotizado').length,
      Aceptado: checkIns.filter(c => c.printer?.status === 'Aceptado').length,
      Reparado: checkIns.filter(c => c.printer?.status === 'Reparado').length,
      Entregado: checkIns.filter(c => c.printer?.status === 'Entregado').length,
    };
  }, [checkIns]);

  // Live Serial Number Quick Lookup
  const matchedSerialResults = useMemo(() => {
    if (!quickSerialQuery.trim() || quickSerialQuery.trim().length < 2) return [];
    const q = quickSerialQuery.trim().toLowerCase();
    return checkIns.filter(c => 
      c.printer?.serialNumber && c.printer.serialNumber.toLowerCase().includes(q)
    );
  }, [checkIns, quickSerialQuery]);

  // Generate monthly trend from checkIns
  const chartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonthIdx = new Date().getMonth();
    
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

  const kpis = [
    { 
      label: 'Ingresos Totales', 
      value: `$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      glow: 'hover:shadow-blue-500/10',
      route: 'sales'
    },
    { 
      label: 'En Taller Activos', 
      value: stats.pendingRepairs, 
      icon: Clock, 
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      glow: 'hover:shadow-amber-500/10',
      route: 'list'
    },
    { 
      label: 'Listos / Reparados', 
      value: stats.repairedToday, 
      icon: CheckCircle2, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      glow: 'hover:shadow-emerald-500/10',
      route: 'list'
    },
    { 
      label: 'Clientes en Cartera', 
      value: stats.totalClients, 
      icon: Users, 
      color: 'text-violet-600 bg-violet-50 border-violet-100',
      glow: 'hover:shadow-violet-500/10',
      route: 'clients'
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-12">
      {/* KPI Metric Grid with dynamic micro-interactions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(stat.route)}
            className={`card-premium p-4 cursor-pointer select-none flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all ${stat.glow}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-0.5 truncate">{stat.label}</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums truncate">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Status Flow Ticker */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Estado del Flujo de Trabajo
          </span>
          <button 
            onClick={() => onNavigate('list')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
          >
            Ver Taller <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'Ingresados', count: statusCounts.Ingresado, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Cotizados', count: statusCounts.Cotizado, color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { label: 'Aceptados', count: statusCounts.Aceptado, color: 'text-violet-700 bg-violet-50 border-violet-200' },
            { label: 'Reparados', count: statusCounts.Reparado, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { label: 'Entregados', count: statusCounts.Entregado, color: 'text-slate-700 bg-slate-100 border-slate-200' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('list')}
              className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all hover:scale-102 active:scale-95 cursor-pointer ${item.color}`}
            >
              <span className="text-[11px] font-bold truncate">{item.label}</span>
              <span className="text-xs font-black font-mono ml-1">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Warranty / S/N Live Lookup */}
      <div className="bg-slate-950 text-white rounded-2xl p-4 md:p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-white">Consulta Rápida de Garantía o Serie</h4>
              <p className="text-[10px] text-slate-400">Verifica historial y fecha de ingreso en tiempo real</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Escribe número de serie..."
              value={quickSerialQuery}
              onChange={(e) => setQuickSerialQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>
        </div>

        {/* Search Match Dropdown / List */}
        {quickSerialQuery.trim().length >= 2 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
            {matchedSerialResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-1 font-mono">
                No hay ingresos registrados con el número de serie "{quickSerialQuery}".
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {matchedSerialResults.map((match) => {
                  const daysAgo = Math.floor((Date.now() - new Date(match.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  const isRecent = daysAgo <= 90;
                  return (
                    <motion.div
                      key={match.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onViewDetails(match.id)}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-400">{match.printer.serialNumber}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isRecent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isRecent ? `Garantía (${daysAgo}d)` : `${daysAgo}d`}
                        </span>
                      </div>
                      <p className="font-bold text-white truncate">{match.printer.brand} {match.printer.model}</p>
                      <p className="text-[11px] text-slate-400 truncate">Cliente: {match.client?.name || 'S/N'}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Recent Activity Stream & Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Activity Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ingresos Recientes</h2>
            </div>
            <button 
              onClick={() => onNavigate('list')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onViewDetails(c.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-left cursor-pointer transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 group-hover:text-blue-600 transition-colors">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {c.client?.name || 'Cliente sin nombre'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {c.printer?.brand} {c.printer?.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {c.printer?.status || 'Ingresado'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <ClipboardList className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">No hay ingresos registrados aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Chart & Direct Interactive Shortcuts */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Volumen Mensual</h3>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="h-32 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="reparaciones" stroke="#2563eb" strokeWidth={2} fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onNavigate('new')}
              className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl cursor-pointer text-left flex items-center gap-2 transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Nuevo Ingreso</span>
            </button>

            <button 
              onClick={() => onNavigate('sales')}
              className="p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-xl cursor-pointer text-left flex items-center gap-2 transition-all active:scale-95 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold">Nueva Venta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
