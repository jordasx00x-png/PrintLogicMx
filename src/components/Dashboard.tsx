import { useState, useMemo } from 'react';
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Wrench, 
  ShoppingBag, 
  Layers, 
  CalendarDays,
  Plus,
  Barcode,
  Search,
  ChevronRight,
  Printer
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
  const [quickSerialQuery, setQuickSerialQuery] = useState('');
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

  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 md:space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-slate-300" />
              <span className="capitalize">{todayFormatted}</span>
              <span aria-hidden="true">·</span>
              <span>Taller Activo</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight font-display">
              Panel Operativo PrintFix
            </h1>

            <p className="text-slate-300 text-xs md:text-sm font-normal leading-relaxed">
              Actualmente hay <span className="text-white font-bold font-mono tabular-nums">{stats.pendingRepairs} equipos</span> en flujo activo de diagnóstico y servicio técnico.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigate('new')}
              className="btn-tactile bg-white hover:bg-slate-100 text-slate-950 px-3.5 sm:px-4 py-3 sm:py-2.5 rounded-xl font-bold text-xs gap-1.5 sm:gap-2 shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>Nuevo Ingreso</span>
            </button>

            <button
              onClick={() => onNavigate('sales')}
              className="btn-tactile bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 px-3.5 sm:px-4 py-3 sm:py-2.5 rounded-xl font-bold text-xs gap-1.5 sm:gap-2 cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Nueva Venta</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Bento Grid (2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { 
            label: 'Ingresos Totales', 
            value: `$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
            icon: DollarSign, 
            badge: 'Facturado',
            color: 'text-blue-600 bg-blue-50 border-blue-100',
            route: 'sales'
          },
          { 
            label: 'En Taller', 
            value: stats.pendingRepairs, 
            icon: Clock, 
            badge: 'En Proceso',
            color: 'text-amber-600 bg-amber-50 border-amber-100',
            route: 'list'
          },
          { 
            label: 'Reparados Hoy', 
            value: stats.repairedToday, 
            icon: CheckCircle2, 
            badge: 'Listos',
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            route: 'list'
          },
          { 
            label: 'Clientes Activos', 
            value: stats.totalClients, 
            icon: Users, 
            badge: 'Directorio',
            color: 'text-slate-600 bg-slate-100 border-slate-200',
            route: 'clients'
          },
        ].map((stat, idx) => (
          <div 
            key={idx}
            onClick={() => onNavigate(stat.route)}
            className="card-premium p-3.5 sm:p-5 cursor-pointer group select-none flex flex-col justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${stat.color} transition-transform group-hover:scale-105 duration-150`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {stat.badge}
              </span>
            </div>

            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-0.5 truncate">{stat.label}</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums truncate">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Workshop Pipeline Stage Flow */}
      <div className="card-premium p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Flujo de Reparaciones en Taller</h2>
              <p className="text-[11px] text-slate-500">Selecciona cualquier estado para ver los equipos correspondientes</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('list')}
            className="btn-tactile text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver listado completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { status: 'Ingresados', key: 'Ingresado', count: pipelineStats.ingresado, dot: 'bg-amber-500' },
            { status: 'Cotizados', key: 'Cotizado', count: pipelineStats.cotizado, dot: 'bg-blue-500' },
            { status: 'Aceptados', key: 'Aceptado', count: pipelineStats.aceptado, dot: 'bg-violet-500' },
            { status: 'Reparados', key: 'Reparado', count: pipelineStats.reparado, dot: 'bg-emerald-500' },
            { status: 'Entregados', key: 'Entregado', count: pipelineStats.entregado, dot: 'bg-slate-500' },
          ].map((stage, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('list')}
              className="btn-tactile p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 flex flex-col justify-between gap-2 text-left cursor-pointer transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className="text-[11px] font-bold text-slate-700">{stage.status}</span>
              </div>
              <div className="flex items-baseline justify-between w-full">
                <span className="text-xl font-black font-mono tabular-nums text-slate-900">{stage.count}</span>
                <span className="text-[10px] text-slate-400 font-medium">equipos</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Quick Warranty / S/N Lookup Widget */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Consulta Rápida de Garantía y Serie</h2>
            </div>
            <p className="text-xs text-slate-400">
              Ingresa el número de serie (S/N) de cualquier impresora para verificar si ya fue reparada o si tiene garantía activa.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Ej: SN-48192 o modelo..."
              value={quickSerialQuery}
              onChange={(e) => setQuickSerialQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 uppercase"
            />
          </div>
        </div>

        {/* Live Search Match Dropdown / List */}
        {quickSerialQuery.trim().length >= 2 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            {matchedSerialResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-1 font-mono">
                No hay ingresos previos registrados con el número de serie "{quickSerialQuery}". Este equipo ingresaría como nuevo.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {matchedSerialResults.map((match) => {
                  const daysAgo = Math.floor((Date.now() - new Date(match.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  const isRecent = daysAgo <= 90;
                  return (
                    <div
                      key={match.id}
                      onClick={() => onViewDetails(match.id)}
                      className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-400">{match.printer.serialNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isRecent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {isRecent ? `En garantía (${daysAgo}d)` : `Hace ${daysAgo}d`}
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
        <div className="lg:col-span-2 card-premium p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ingresos Recientes en Taller</h2>
              <p className="text-xs text-slate-400">Últimos equipos recepcionados</p>
            </div>
            <button 
              onClick={() => onNavigate('list')}
              className="btn-tactile text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
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
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 text-left cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 group-hover:text-blue-600">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {c.client?.name || 'Cliente sin nombre'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {c.printer?.brand} {c.printer?.model} · <span className="text-slate-400">{c.printer?.problem}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    {c.printer?.serialNumber && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        <Barcode className="w-3 h-3 text-slate-400" />
                        {c.printer.serialNumber}
                      </span>
                    )}

                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {c.printer?.status || 'Ingresado'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <ClipboardList className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">No hay ingresos registrados aún</p>
                <button
                  onClick={() => onNavigate('new')}
                  className="btn-tactile-primary px-3.5 py-1.5 text-xs rounded-lg mt-2"
                >
                  Registrar Primer Equipo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Trend & Shortcuts */}
        <div className="space-y-6">
          {/* Chart Section */}
          <div className="card-premium p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Volumen Mensual</h3>
                <p className="text-[11px] text-slate-400">Tendencia de reparaciones</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="h-40 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.05)', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="reparaciones" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="card-premium p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">Accesos Rápidos</h3>
            
            <button 
              onClick={() => onNavigate('new')}
              className="btn-tactile w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-white" />
                <div>
                  <p className="text-xs font-bold">Nuevo Ingreso</p>
                  <p className="text-[10px] text-slate-400">Recepción de impresora</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button 
              onClick={() => onNavigate('products')}
              className="btn-tactile w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-bold">Catálogo de Refacciones</p>
                  <p className="text-[10px] text-slate-400">Gestión de costos y precios</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
