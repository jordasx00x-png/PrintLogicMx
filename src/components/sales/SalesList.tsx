import React, { useState } from 'react';
import { Sale, Product, Client } from '../../types';
import { Plus, Search, ShoppingCart, FileText, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

interface SalesListProps {
  sales: Sale[];
  onNewSale: () => void;
  onViewSale: (sale: Sale) => void;
}

export function SalesList({ sales, onNewSale, onViewSale }: SalesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Sale['status'] | 'all'>('all');

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.client.phone.includes(searchTerm) ||
      sale.client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ventas y Cotizaciones</h1>
          <p className="text-sm text-slate-500 font-medium">Gestiona cotizaciones y ventas de piezas y refacciones</p>
        </div>
        <button
          onClick={onNewSale}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Nueva Venta / Cotización
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="sent">Enviada</option>
          <option value="accepted">Aceptada</option>
          <option value="completed">Completada (Vendida)</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredSales.map((sale) => {
          const statusConfig = getStatusConfig(sale.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={sale.id}
              onClick={() => onViewSale(sale)}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusConfig.bg}`}>
                    <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{sale.client.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{sale.items.length} artículo(s)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-500 font-medium">Total</p>
                    <p className="text-lg font-black text-slate-900">${sale.total.toFixed(2)}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors hidden md:block" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredSales.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No hay ventas o cotizaciones</h3>
            <p className="text-slate-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No se encontraron resultados para tu búsqueda.'
                : 'Comienza creando una nueva cotización o venta.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
