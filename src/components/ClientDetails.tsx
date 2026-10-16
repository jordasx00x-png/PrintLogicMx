import React from 'react';
import { CheckIn, Sale, Client } from '../types';
import { ArrowLeft, User, Printer, Package, DollarSign, Calendar } from 'lucide-react';
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

  const clientName = client.name.trim().toLowerCase();
  
  const clientCheckIns = checkIns.filter(c => 
    (c.clientId === client.id || c.client?.id === client.id) ||
    (c.client?.name?.trim().toLowerCase() === clientName)
  );
  
  const clientSales = sales.filter(s => 
    (s.clientId === client.id || s.client?.id === client.id) ||
    (s.client?.name?.trim().toLowerCase() === clientName)
  );

  const sortedCheckIns = [...clientCheckIns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedSales = [...clientSales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{client.name}</h1>
          <p className="text-slate-500 font-medium">{client.phone} • {client.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Historial de Ingresos */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            Ingresos de Equipos ({sortedCheckIns.length})
          </h2>
          <div className="space-y-4">
            {sortedCheckIns.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{c.printer.brand} {c.printer.model}</p>
                  <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()} • S/N: {c.printer.serialNumber || 'N/A'}</p>
                </div>
                <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">{c.printer.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de Ventas */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Ventas Realizadas ({sortedSales.length})
          </h2>
          <div className="space-y-4">
            {sortedSales.map(s => (
              <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">${s.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString()} • {s.items.length} items</p>
                </div>
                <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">Pagado</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
