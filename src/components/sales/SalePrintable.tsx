import React from 'react';
import { Sale } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface SalePrintableProps {
  sale: Sale;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export function SalePrintable({ sale, printRef }: SalePrintableProps) {
  const { settings } = useSettings();
  
  const isCompleted = sale.status === 'completed' || sale.status === 'accepted';
  const documentTitle = isCompleted ? 'NOTA DE VENTA / REMISIÓN' : 'COTIZACIÓN DE REFACCIONES';
  const folioPrefix = isCompleted ? 'VTA' : 'COT';

  const subtotal = sale.subtotal || sale.items.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const discount = sale.discount || 0;
  const taxableBase = Math.max(0, subtotal - discount);
  const taxRate = sale.taxRate || 0;
  const taxAmount = sale.taxAmount ?? ((taxableBase * taxRate) / 100);
  const total = sale.total || (taxableBase + taxAmount);

  return (
    <div 
      ref={printRef} 
      className="p-12 bg-white w-[800px] min-h-[1100px] flex flex-col" 
      style={{ backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'sans-serif' }}
    >
      {/* Decorative Top Accent Bar */}
      <div className="h-2.5 w-full mb-8 rounded-full" style={{ backgroundColor: '#4f46e5' }} />

      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-5">
          {settings.logo ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-slate-200">
              <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="p-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#4f46e5' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none mb-1" style={{ color: '#0f172a' }}>
              {settings.name || 'PrintLogicMx'}
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>
              Venta de Refacciones y Servicios
            </p>
            {(settings.phone || settings.email || settings.address) && (
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                {settings.phone && <p>Tel / WhatsApp: {settings.phone}</p>}
                {settings.email && <p>Correo: {settings.email}</p>}
                {settings.address && <p>Dirección: {settings.address}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div 
            className="inline-block px-4 py-1.5 rounded-full mb-3 border" 
            style={{ 
              backgroundColor: isCompleted ? '#ecfdf5' : '#eef2ff', 
              borderColor: isCompleted ? '#a7f3d0' : '#c7d2fe' 
            }}
          >
            <h2 
              className="text-xs font-black uppercase tracking-widest" 
              style={{ color: isCompleted ? '#065f46' : '#3730a3' }}
            >
              {documentTitle}
            </h2>
          </div>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: '#64748b' }}>
              <span className="font-bold" style={{ color: '#0f172a' }}>FOLIO:</span> #{folioPrefix}-{sale.id.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-sm" style={{ color: '#64748b' }}>
              <span className="font-bold" style={{ color: '#0f172a' }}>FECHA:</span> {new Date(sale.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              ESTADO: <span className="font-bold uppercase" style={{ color: '#334155' }}>{sale.status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full mb-8" style={{ backgroundColor: '#e2e8f0' }} />

      {/* Client Information Card */}
      <div className="mb-8 p-6 rounded-2xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
        <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#4f46e5' }}>
          Información del Cliente
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-base font-black" style={{ color: '#0f172a' }}>{sale.client?.name || 'Público en General'}</p>
            {sale.client?.address && (
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-semibold">Dir:</span> {sale.client.address}
              </p>
            )}
          </div>
          <div className="space-y-1 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Teléfono:</span> {sale.client?.phone || 'No registrado'}
            </p>
            {sale.client?.email && (
              <p>
                <span className="font-semibold text-slate-800">Correo:</span> {sale.client.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#1e293b' }}>
              <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-widest rounded-tl-xl" style={{ color: '#ffffff' }}>Cant.</th>
              <th className="py-3.5 px-6 font-bold text-xs uppercase tracking-widest" style={{ color: '#ffffff' }}>Descripción del Concepto / Refacción</th>
              <th className="py-3.5 px-4 font-bold text-xs uppercase tracking-widest text-right" style={{ color: '#ffffff' }}>P. Unitario</th>
              <th className="py-3.5 px-6 font-bold text-xs uppercase tracking-widest text-right rounded-tr-xl" style={{ color: '#ffffff' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(sale.items || []).map((item, index) => (
              <tr key={item.productId || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <td className="py-4 px-4 text-xs font-bold border-b text-center" style={{ color: '#0f172a', borderColor: '#f1f5f9' }}>
                  {item.quantity}
                </td>
                <td className="py-4 px-6 text-sm font-medium border-b" style={{ color: '#334155', borderColor: '#f1f5f9' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{item.name || 'Sin descripción'}</span>
                    {item.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {item.notes}
                    </p>
                  )}
                </td>
                <td className="py-4 px-4 text-xs font-mono font-bold text-right border-b" style={{ color: '#475569', borderColor: '#f1f5f9' }}>
                  ${(Number(item.unitPrice) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-6 text-sm font-mono font-black text-right border-b" style={{ color: '#0f172a', borderColor: '#f1f5f9' }}>
                  ${(Number(item.total) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-between items-start mt-8 gap-8">
          {/* Notes / Warranty Left Box */}
          <div className="flex-1 p-4 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Notas y Condiciones:</h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              {sale.notes || 'Piezas y refacciones sujetas a garantía contra defectos de fábrica. No aplica en caso de mal uso o descargas eléctricas.'}
            </p>
          </div>

          {/* Numerical Totals Box */}
          <div className="w-72 space-y-2.5">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Subtotal</span>
              <span className="text-sm font-bold font-mono" style={{ color: '#1e293b' }}>
                ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Descuento</span>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  -${discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
                IVA ({taxRate}%)
              </span>
              <span className="text-sm font-bold font-mono" style={{ color: '#1e293b' }}>
                ${taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-px w-full" style={{ backgroundColor: '#e2e8f0' }} />

            <div className="flex justify-between items-center p-4 rounded-xl" style={{ backgroundColor: '#4f46e5' }}>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#ffffff' }}>Total Final</span>
              <span className="text-xl font-black font-mono" style={{ color: '#ffffff' }}>
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signature & Confirmation Section */}
      <div className="grid grid-cols-2 gap-16 mt-14 pt-6">
        <div className="text-center">
          <div className="h-px w-full mb-2" style={{ backgroundColor: '#cbd5e1' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Firma del Vendedor / Autorizado</p>
        </div>
        <div className="text-center">
          <div className="h-px w-full mb-2" style={{ backgroundColor: '#cbd5e1' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Firma / Conformidad del Cliente</p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-[10px] font-bold tracking-wider uppercase" style={{ color: '#94a3b8' }}>
        Gracias por su preferencia • Documento generado por {settings.name || 'PrintLogicMx'}
      </div>
    </div>
  );
}
