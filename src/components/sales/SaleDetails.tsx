import React, { useState } from 'react';
import { Sale, Client } from '../../types';
import { ArrowLeft, CheckCircle, Clock, FileText, ShoppingCart, XCircle, Printer, Send, Trash2, Download } from 'lucide-react';
import { SaleSheet } from './SaleSheet';

interface SaleDetailsProps {
  sale: Sale;
  onBack: () => void;
  onUpdateStatus: (id: string, status: Sale['status']) => void;
  onDelete: (id: string) => void;
}

export function SaleDetails({ sale, onBack, onUpdateStatus, onDelete }: SaleDetailsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaleSheet, setShowSaleSheet] = useState(false);

  const getStatusConfig = (status: Sale['status']) => {
    switch (status) {
      case 'draft': return { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Borrador' };
      case 'sent': return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Enviada' };
      case 'accepted': return { icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Aceptada' };
      case 'completed': return { icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-100', label: 'Completada' };
      case 'cancelled': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Cancelada' };
    }
  };

  const statusConfig = getStatusConfig(sale.status);
  const StatusIcon = statusConfig.icon;

  const confirmDelete = () => {
    onDelete(sale.id);
    onBack();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-32 md:pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">
              Detalles de Venta / Cotización
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Folio: #{sale.id.substring(0, 8).toUpperCase()} • Fecha: {new Date(sale.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowSaleSheet(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Ver / Imprimir Hoja</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-3 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all cursor-pointer"
            title="Eliminar registro"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">¿Eliminar registro?</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Estás a punto de eliminar esta venta/cotización. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Sheet (Printable & PDF Export Modal) */}
      {showSaleSheet && (
        <SaleSheet sale={sale} onClose={() => setShowSaleSheet(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Items and Notes */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Artículos y Conceptos</h2>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${statusConfig.bg} ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </div>
            </div>

            <div className="space-y-3">
              {sale.items.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        {item.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{item.notes}</p>
                      )}
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-900 text-base font-mono">${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals Breakdown */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-bold font-mono">${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Descuento</span>
                  <span className="text-emerald-600 font-bold font-mono">-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              {sale.taxRate !== undefined && sale.taxRate > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">IVA ({sale.taxRate}%)</span>
                  <span className="text-indigo-600 font-bold font-mono">+${(sale.taxAmount ?? ((Math.max(0, sale.subtotal - sale.discount) * sale.taxRate) / 100)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-slate-900 font-black">Total Final</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">${sale.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {sale.notes && (
            <section className="bg-amber-50/70 rounded-3xl border border-amber-200/80 p-6 space-y-2">
              <h3 className="text-xs font-black text-amber-900 tracking-tight uppercase">Notas / Observaciones</h3>
              <p className="text-xs sm:text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{sale.notes}</p>
            </section>
          )}
        </div>

        {/* Right Column: Actions & Client Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Cambiar Estado</h3>
            
            <div className="space-y-2.5">
              {sale.status === 'draft' && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'sent')}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Marcar como Enviada</span>
                </button>
              )}
              
              {(sale.status === 'draft' || sale.status === 'sent') && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'accepted')}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Marcar como Aceptada</span>
                </button>
              )}

              {sale.status === 'accepted' && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'completed')}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Completar Venta</span>
                </button>
              )}

              {sale.status !== 'completed' && sale.status !== 'cancelled' && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'cancelled')}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-black rounded-2xl transition-all active:scale-95 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Datos del Cliente</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nombre</p>
                <p className="font-bold text-slate-900 text-sm">{sale.client.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Teléfono</p>
                <p className="font-bold text-slate-900">{sale.client.phone || 'No registrado'}</p>
              </div>
              {sale.client.email && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="font-bold text-slate-900 truncate">{sale.client.email}</p>
                </div>
              )}
              {sale.client.address && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dirección</p>
                  <p className="font-bold text-slate-900">{sale.client.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
