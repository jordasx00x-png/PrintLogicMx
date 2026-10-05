import React, { useState, useMemo } from 'react';
import { DollarSign, Calendar, Printer, User, ArrowUpRight, Download, TrendingUp, Package, Sparkles, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { CheckIn, Sale } from '../types';

interface SalesSummaryProps {
  checkIns: CheckIn[];
  sales: Sale[];
}

export function SalesSummary({ checkIns, sales }: SalesSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { repairedPrinters, partsSales, totalRevenue, averageTicket } = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    // Filter repaired printers for the selected month
    const filteredPrinters = checkIns
      .filter(c => {
        if (c.printer.status !== 'Entregado' || !c.quote) return false;
        const date = new Date(c.createdAt);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filter parts sales for the selected month
    const filteredSales = sales
      .filter(s => {
        if (s.status !== 'completed') return false;
        const date = new Date(s.createdAt);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const printersRevenue = filteredPrinters.reduce((sum, c) => sum + (c.quote?.total || 0), 0);
    const partsRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const total = printersRevenue + partsRevenue;
    
    const totalTransactions = filteredPrinters.length + filteredSales.length;
    const avg = totalTransactions > 0 ? total / totalTransactions : 0;

    return {
      repairedPrinters: filteredPrinters,
      partsSales: filteredSales,
      totalRevenue: total,
      averageTicket: avg,
      printersRevenue,
      partsRevenue
    };
  }, [checkIns, sales, selectedMonth]);

  // Generate last 12 months for the selector
  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
      result.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return result;
  }, []);

  const allTransactions = useMemo(() => {
    const transactions = [
      ...repairedPrinters.map(p => ({
        id: p.id,
        type: 'printer' as const,
        date: p.createdAt,
        client: p.client.name,
        description: `Reparación: ${p.printer.brand} ${p.printer.model}`,
        items: p.quote?.items.length || 0,
        total: p.quote?.total || 0
      })),
      ...partsSales.map(s => ({
        id: s.id,
        type: 'sale' as const,
        date: s.createdAt,
        client: s.client.name,
        description: 'Venta de Refacciones',
        items: s.items.length,
        total: s.total
      }))
    ];
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [repairedPrinters, partsSales]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Reporte de Ganancias</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">Análisis detallado de reparaciones y ventas de refacciones.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-100 hover:bg-slate-50 text-slate-900 text-sm font-black rounded-2xl shadow-sm transition-all active:scale-95">
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-indigo-600 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Ingresos Totales del Mes</p>
            </div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
              ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-8 text-indigo-100 text-sm font-bold">
              <div>
                <span className="opacity-70 block text-xs uppercase tracking-wider mb-1">Reparaciones</span>
                <span className="text-white text-lg">${repairedPrinters.reduce((sum, c) => sum + (c.quote?.total || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="opacity-70 block text-xs uppercase tracking-wider mb-1">Refacciones</span>
                <span className="text-white text-lg">${partsSales.reduce((sum, s) => sum + s.total, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 group"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
              <Printer className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-500" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Reparadas</p>
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
            {repairedPrinters.length}
          </h3>
          <p className="text-slate-400 text-xs font-bold mt-4 italic">Equipos entregados</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 group"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500">
              <ShoppingCart className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-500" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ventas</p>
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{partsSales.length}</h3>
          <p className="text-slate-400 text-xs font-bold mt-4 italic">Ventas de refacciones</p>
        </motion.div>
      </div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Historial del Mes</h2>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <TrendingUp className="w-3 h-3" />
            {allTransactions.length} Transacciones
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Fecha</th>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Tipo / Detalle</th>
                <th className="px-8 py-6">Artículos</th>
                <th className="px-8 py-6 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allTransactions.length > 0 ? (
                allTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {new Date(transaction.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-sm font-black text-slate-900">{transaction.client}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === 'printer' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {transaction.type === 'printer' ? <Printer className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </div>
                        <p className="text-sm font-bold text-slate-900">{transaction.description}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3 text-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {transaction.items} {transaction.items === 1 ? 'ítem' : 'ítems'}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-lg font-black text-slate-900 tracking-tighter">
                        ${transaction.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                        <DollarSign className="w-10 h-10 text-slate-200" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Sin transacciones en este mes</h3>
                      <p className="text-slate-400 font-medium">Las reparaciones entregadas y ventas completadas aparecerán aquí.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
