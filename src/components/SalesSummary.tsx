import React, { useState, useMemo } from 'react';
import { DollarSign, Calendar, Printer, User, ArrowUpRight, Download, TrendingUp, Package, Sparkles, ShoppingCart, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { CheckIn, Sale, Product } from '../types';

interface SalesSummaryProps {
  checkIns: CheckIn[];
  sales: Sale[];
  products?: Product[];
}

export function SalesSummary({ checkIns, sales, products = [] }: SalesSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { repairedPrinters, partsSales, totalRevenue, averageTicket, printersRevenue, partsRevenue, printersCost, partsCost, totalCost, netProfit } = useMemo(() => {
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

    // Calculate Costs (investment in parts and labor)
    const printersCost = filteredPrinters.reduce((sum, c) => {
      const quoteCost = c.quote?.items.reduce((itemSum, item) => itemSum + (Number(item.cost) || 0), 0) || 0;
      return sum + quoteCost;
    }, 0);

    const partsCost = filteredSales.reduce((sum, s) => {
      const saleCost = s.items.reduce((itemSum, item) => {
        const matchedProduct = products.find(p => p.id === item.productId);
        const unitCost = matchedProduct ? (matchedProduct.cost || 0) : 0;
        return itemSum + (unitCost * item.quantity);
      }, 0);
      return sum + saleCost;
    }, 0);

    const totalC = printersCost + partsCost;
    const profit = total - totalC;
    
    const totalTransactions = filteredPrinters.length + filteredSales.length;
    const avg = totalTransactions > 0 ? total / totalTransactions : 0;

    return {
      repairedPrinters: filteredPrinters,
      partsSales: filteredSales,
      totalRevenue: total,
      averageTicket: avg,
      printersRevenue,
      partsRevenue,
      printersCost,
      partsCost,
      totalCost: totalC,
      netProfit: profit
    };
  }, [checkIns, sales, products, selectedMonth]);

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
      ...repairedPrinters.map(p => {
        const cost = p.quote?.items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
        return {
          id: p.id,
          type: 'printer' as const,
          date: p.createdAt,
          client: p.client.name,
          description: `Reparación: ${p.printer.brand} ${p.printer.model}`,
          items: p.quote?.items.length || 0,
          total: p.quote?.total || 0,
          cost
        };
      }),
      ...partsSales.map(s => {
        const cost = s.items.reduce((sum, item) => {
          const matchedProduct = products.find(p => p.id === item.productId);
          const unitCost = matchedProduct ? (matchedProduct.cost || 0) : 0;
          return sum + (unitCost * item.quantity);
        }, 0);
        return {
          id: s.id,
          type: 'sale' as const,
          date: s.createdAt,
          client: s.client.name,
          description: 'Venta de Refacciones',
          items: s.items.length,
          total: s.total,
          cost
        };
      })
    ];
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [repairedPrinters, partsSales, products]);

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

      {/* Row 1: Key Financial Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Total monthly gross billing (Indigo Theme) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-indigo-600 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-100/40 text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Facturación Bruta (Ingresos)</p>
            </div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter">
              ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-indigo-100 text-xs font-bold">
              <div>
                <span className="opacity-70 block mb-0.5">Por Reparaciones</span>
                <span className="text-white text-base font-black">${printersRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="opacity-70 block mb-0.5">Por Venta Directa</span>
                <span className="text-white text-base font-black">${partsRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Net Real Profit (Emerald Theme) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-emerald-100/40 text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-100">Ganancia Real Neta (Utilidad)</p>
            </div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter">
              ${netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-emerald-100 text-xs font-bold">
              <div>
                <span className="opacity-70 block mb-0.5">Inversión (Tu Costo)</span>
                <span className="text-white text-base font-black">${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="opacity-70 block mb-0.5">Margen de Retorno</span>
                <span className="text-white text-base font-black">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(0) : '0'}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Operational Volume Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Printer className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Servicios Reparados</p>
              <p className="text-slate-500 text-xs font-semibold">Equipos entregados este mes</p>
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{repairedPrinters.length}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Refacciones Vendidas</p>
              <p className="text-slate-500 text-xs font-semibold">Transacciones directas este mes</p>
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{partsSales.length}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Gastado en Refacciones</p>
              <p className="text-slate-500 text-[10px] font-medium leading-none mt-1">
                Taller: <span className="font-bold text-slate-800">${printersCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span> <br /> Ventas: <span className="font-bold text-slate-800">${partsCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          </div>
          <h3 className="text-xl font-mono font-black text-rose-600 tracking-tighter text-right">
            ${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h3>
        </motion.div>
      </div>

      {/* Monthly Itemized Financial Statement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Historial Financiero del Mes</h2>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <TrendingUp className="w-3 h-3" />
            {allTransactions.length} Transacciones
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Concepto / Detalle</th>
                <th className="px-6 py-4">Costo (Inversión)</th>
                <th className="px-6 py-4 text-right">Venta Bruta</th>
                <th className="px-6 py-4 text-right text-emerald-600">Utilidad Neta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allTransactions.length > 0 ? (
                allTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-slate-50/30 transition-all group text-xs">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(transaction.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {transaction.client}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${transaction.type === 'printer' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {transaction.type === 'printer' ? <Printer className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-bold text-slate-800 truncate max-w-[240px]">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">
                      ${transaction.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-900">
                      ${transaction.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-emerald-600 bg-emerald-50/20">
                      +${(transaction.total - transaction.cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-slate-200" />
                      </div>
                      <h3 className="text-sm font-black text-slate-800">Sin transacciones en este mes</h3>
                      <p className="text-xs text-slate-400 font-medium">Las reparaciones entregadas y ventas completadas aparecerán aquí.</p>
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
