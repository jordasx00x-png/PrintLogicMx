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
  ShieldCheck
} from 'lucide-react';
import { CheckIn } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  const recentCheckIns = checkIns.slice(0, 6);

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

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { 
            label: 'Ingresos Totales', 
            value: `$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
            icon: DollarSign, 
            color: 'text-blue-600 bg-blue-50 border-blue-100',
            route: 'sales'
          },
          { 
            label: 'En Taller', 
            value: stats.pendingRepairs, 
            icon: Clock, 
            color: 'text-amber-600 bg-amber-50 border-amber-100',
            route: 'list'
          },
          { 
            label: 'Reparados Hoy', 
            value: stats.repairedToday, 
            icon: CheckCircle2, 
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            route: 'list'
          },
          { 
            label: 'Clientes', 
            value: stats.totalClients, 
            icon: Users, 
            color: 'text-slate-600 bg-slate-100 border-slate-200',
            route: 'clients'
          },
        ].map((stat, idx) => (
          <div 
            key={idx}
            onClick={() => onNavigate(stat.route)}
            className="card-premium p-4 cursor-pointer select-none flex flex-col justify-between active:scale-[0.98] transition-all bg-white rounded-2xl border border-slate-200/90 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5 truncate">{stat.label}</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums truncate">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Warranty / S/N Lookup */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-white">Buscar Garantía o Número de Serie</span>
          </div>

          <div className="relative w-full md:w-72">
            <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Ingresa número de serie..."
              value={quickSerialQuery}
              onChange={(e) => setQuickSerialQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>
        </div>

        {/* Search Match Dropdown / List */}
        {quickSerialQuery.trim().length >= 2 && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
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
                    <div
                      key={match.id}
                      onClick={() => onViewDetails(match.id)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-400">{match.printer.serialNumber}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isRecent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {isRecent ? `Garantía (${daysAgo}d)` : `${daysAgo}d`}
                        </span>
                      </div>
                      <p className="font-bold text-white truncate">{match.printer.brand} {match.printer.model}</p>
                      <p className="text-[11px] text-slate-400 truncate">Cliente: {match.client?.name || 'S/N'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Recent Activity Stream & Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-4">
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
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-left cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
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

        {/* Analytics Chart & Shortcuts */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Volumen Mensual</h3>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="h-36 w-full pt-1">
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

          {/* Clean Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onNavigate('new')}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer text-left flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-xs font-bold">Nuevo Ingreso</span>
            </button>

            <button 
              onClick={() => onNavigate('sales')}
              className="p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl cursor-pointer text-left flex items-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold">Nueva Venta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
