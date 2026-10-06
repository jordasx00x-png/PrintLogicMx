import React from 'react';
import { Sale, Client } from '../../types';
import { ArrowLeft, CheckCircle, Clock, FileText, ShoppingCart, XCircle, Printer, Send, Trash2 } from 'lucide-react';

interface SaleDetailsProps {
  sale: Sale;
  onBack: () => void;
  onUpdateStatus: (id: string, status: Sale['status']) => void;
  onDelete: (id: string) => void;
}

export function SaleDetails({ sale, onBack, onUpdateStatus, onDelete }: SaleDetailsProps) {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const confirmDelete = () => {
    onDelete(sale.id);
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 pb-32 md:pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Detalles de Venta</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Ref: {sale.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-bold rounded-2xl transition-all"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-3 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all"
            title="Eliminar registro"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Artículos</h2>
              <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${statusConfig.bg} ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </div>
            </div>

            <div className="space-y-4">
              {sale.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">${item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-bold">${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Descuento</span>
                  <span className="text-emerald-600 font-bold">-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-slate-900 font-black">Total</span>
                <span className="text-2xl font-black text-indigo-600">${sale.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {sale.notes && (
            <section className="bg-amber-50 rounded-[2rem] md:rounded-[2.5rem] border border-amber-100 p-6 md:p-10 space-y-4">
              <h3 className="text-sm font-black text-amber-900 tracking-tight uppercase">Notas</h3>
              <p className="text-amber-800 whitespace-pre-wrap">{sale.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Acciones</h3>
            
            <div className="space-y-3">
              {sale.status === 'draft' && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'sent')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  <Send className="w-5 h-5" />
                  Marcar como Enviada
                </button>
              )}
              
              {(sale.status === 'draft' || sale.status === 'sent') && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'accepted')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marcar como Aceptada
                </button>
              )}

              {sale.status === 'accepted' && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'completed')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Completar Venta
                </button>
              )}

              {sale.status !== 'completed' && sale.status !== 'cancelled' && (
                <button
                  onClick={() => onUpdateStatus(sale.id, 'cancelled')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-black rounded-2xl transition-all active:scale-95"
                >
                  <XCircle className="w-5 h-5" />
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Cliente</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre</p>
                <p className="font-bold text-slate-900">{sale.client.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Teléfono</p>
                <p className="font-bold text-slate-900">{sale.client.phone}</p>
              </div>
              {sale.client.email && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="font-bold text-slate-900">{sale.client.email}</p>
                </div>
              )}
              {sale.client.address && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dirección</p>
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
