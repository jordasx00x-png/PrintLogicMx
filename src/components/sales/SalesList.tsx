import React, { useState } from 'react';
import { Sale, Product, Client } from '../../types';
import { Plus, Search, ShoppingCart, FileText, CheckCircle, XCircle, Clock, ArrowRight, Printer } from 'lucide-react';
import { SaleSheet } from './SaleSheet';

interface SalesListProps {
  sales: Sale[];
  onNewSale: () => void;
  onViewSale: (sale: Sale) => void;
}

export function SalesList({ sales, onNewSale, onViewSale }: SalesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Sale['status'] | 'all'>('all');
  const [sheetSale, setSheetSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.client.phone.includes(searchTerm) ||
      (sale.client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: Sale['status']) => {
    switch (status) {
      case 'draft': return { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Borrador' };
      case 'sent': return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Enviada' };
      case 'accepted': return { icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Aceptada' };
      case 'completed': return { icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-100', label: 'Completada' };
      case 'cancelled': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Cancelada' };
    }
  };

  return (
    <div className="space-y-6">
      {sheetSale && (
        <SaleSheet sale={sheetSale} onClose={() => setSheetSale(null)} />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">Ventas y Cotizaciones</h1>
          <p className="text-sm text-slate-500 font-medium">Gestiona e imprime cotizaciones y notas de venta de piezas y refacciones</p>
        </div>
        <button
          onClick={onNewSale}
          className="btn-tactile flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 w-full sm:w-auto justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Venta / Cotización</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono, folio o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="sent">Enviada</option>
          <option value="accepted">Aceptada</option>
          <option value="completed">Completada (Vendida)</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div className="grid gap-3.5">
        {filteredSales.map((sale) => {
          const statusConfig = getStatusConfig(sale.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={sale.id}
              onClick={() => onViewSale(sale)}
              className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md active:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${statusConfig.bg}`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{sale.client.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                      <span className="font-semibold text-slate-600">#{sale.id.substring(0, 8).toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(sale.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                      <span>•</span>
                      <span>{sale.items.length} {sale.items.length === 1 ? 'concepto' : 'conceptos'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                    <p className="text-base sm:text-lg font-black text-indigo-600 font-mono">${sale.total.toFixed(2)}</p>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSale(sale);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    title="Ver / Imprimir Hoja de Cotización o Venta"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors hidden sm:block" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredSales.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No hay ventas o cotizaciones</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron resultados para los filtros aplicados.'
                  : 'Crea una nueva cotización o venta de refacciones con el botón superior.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
