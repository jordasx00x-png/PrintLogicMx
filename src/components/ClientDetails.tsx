import React from 'react';
import { CheckIn, Sale, Client } from '../types';
import { ArrowLeft, User, Printer, Package, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { scrollToTop } from '../lib/scrollUtils';

interface ClientDetailsProps {
  client: Client;
  checkIns: CheckIn[];
  sales: Sale[];
  onBack: () => void;
}

export function ClientDetails({ client, checkIns, sales, onBack }: ClientDetailsProps) {
  React.useEffect(() => {
    scrollToTop();
  }, []);

  const clientName = (client.name || '').trim().toLowerCase();
  const clientPhone = (client.phone || '').trim();
  const clientEmail = (client.email || '').trim().toLowerCase();

  const clientCheckIns = checkIns.filter(c => {
    const cId = c.clientId || c.client?.id;
    const cName = (c.client?.name || '').trim().toLowerCase();
    const cPhone = (c.client?.phone || '').trim();
    const cEmail = (c.client?.email || '').trim().toLowerCase();

    if (client.id && cId && cId === client.id) return true;
    if (clientName && cName && cName === clientName) return true;
    if (clientPhone && cPhone && cPhone === clientPhone) return true;
    if (clientEmail && cEmail && cEmail === clientEmail) return true;
    return false;
  });

  const clientSales = sales.filter(s => {
    const sId = s.clientId || s.client?.id;
    const sName = (s.client?.name || '').trim().toLowerCase();
    const sPhone = (s.client?.phone || '').trim();
    const sEmail = (s.client?.email || '').trim().toLowerCase();

    if (client.id && sId && sId === client.id) return true;
    if (clientName && sName && sName === clientName) return true;
    if (clientPhone && sPhone && sPhone === clientPhone) return true;
    if (clientEmail && sEmail && sEmail === clientEmail) return true;
    return false;
  });

  const sortedCheckIns = [...clientCheckIns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedSales = [...clientSales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-4 sm:p-6">
      <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <button
          onClick={onBack}
          className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
          title="Regresar"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{client.name}</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {client.phone ? `Tel: ${client.phone}` : 'Sin teléfono'} {client.email ? `• ${client.email}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Historial de Ingresos / Equipos en Taller */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <span>Ingresos de Equipos</span>
            </h2>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl">
              {sortedCheckIns.length} {sortedCheckIns.length === 1 ? 'Ingreso' : 'Ingresos'}
            </span>
          </div>

          <div className="space-y-4">
            {sortedCheckIns.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No hay ingresos registrados para este cliente.
              </div>
            ) : (
              sortedCheckIns.map(c => (
                <div key={c.id} className="p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/60 transition-all rounded-2xl border border-slate-200/60 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase font-mono text-slate-500">
                        ID: #{c.id?.substring(0, 6)} • {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5">
                        {c.printer.brand} {c.printer.model}
                      </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-xl shrink-0">
                      {c.printer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Nº de Serie:</span>
                      <span className="font-mono font-bold text-slate-900">{c.printer.serialNumber || 'No especificado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Cotizado:</span>
                      <span className="font-bold text-emerald-600">${(c.quote?.total || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {c.printer.problemDescription && (
                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Falla reportada:</span>
                      <p className="italic text-slate-800">"{c.printer.problemDescription}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historial de Ventas */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <span>Ventas Realizadas</span>
            </h2>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl">
              {sortedSales.length} {sortedSales.length === 1 ? 'Venta' : 'Ventas'}
            </span>
          </div>

          <div className="space-y-4">
            {sortedSales.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No hay ventas registradas para este cliente.
              </div>
            ) : (
              sortedSales.map(s => (
                <div key={s.id} className="p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/60 transition-all rounded-2xl border border-slate-200/60 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase font-mono text-slate-500">
                        Venta #{s.id?.substring(0, 6)} • {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h3 className="font-black text-slate-900 text-lg mt-0.5">
                        ${s.total.toFixed(2)} <span className="text-xs font-normal text-slate-500">({s.paymentMethod || 'Efectivo'})</span>
                      </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-xl shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Pagado
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Productos / Artículos:</span>
                    <div className="space-y-1">
                      {s.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-slate-200/60">
                          <span className="font-bold text-slate-800 truncate mr-2">{item.name} <span className="text-slate-400 font-normal">x{item.quantity}</span></span>
                          <span className="font-mono font-bold text-slate-700">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
