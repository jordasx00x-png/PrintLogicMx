import React from 'react';
import { CheckIn } from '../types';
import { useSettings } from '../hooks/useSettings';

interface QuotePrintableProps {
  checkIn: CheckIn;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export function QuotePrintable({ checkIn, printRef }: QuotePrintableProps) {
  const { settings } = useSettings();
  
  if (!checkIn.quote) return null;

  return (
    <div ref={printRef} className="p-12 bg-white w-[800px] min-h-[1100px] flex flex-col" style={{ backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'sans-serif' }}>
      {/* Decorative Top Bar */}
      <div className="h-2 w-full mb-8" style={{ backgroundColor: '#4f46e5' }}></div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-5">
          {settings.logo ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-slate-100">
              <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="p-4 rounded-2xl" style={{ backgroundColor: '#4f46e5' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect width="12" height="8" x="6" y="14"></rect>
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none mb-1" style={{ color: '#0f172a' }}>{settings.name || 'PrintLogicMx'}</h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>Soluciones de Impresión</p>
            {(settings.phone || settings.email) && (
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                {settings.phone && <p>{settings.phone}</p>}
                {settings.email && <p>{settings.email}</p>}
                {settings.website && <p>{settings.website}</p>}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-4 py-1 rounded-full mb-3" style={{ backgroundColor: '#f1f5f9' }}>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: '#475569' }}>Cotización</h2>
          </div>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: '#64748b' }}>
              <span className="font-bold" style={{ color: '#0f172a' }}>FOLIO:</span> #{checkIn.quote.id.split('-')[0].toUpperCase()}
            </p>
            <p className="text-sm" style={{ color: '#64748b' }}>
              <span className="font-bold" style={{ color: '#0f172a' }}>FECHA:</span> {new Date(checkIn.quote.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full mb-10" style={{ backgroundColor: '#e2e8f0' }}></div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1" style={{ backgroundColor: '#4f46e5' }}></div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#64748b' }}>Información del Cliente</h3>
          <div className="space-y-1.5">
            <p className="text-lg font-bold" style={{ color: '#0f172a' }}>{checkIn.client?.name || 'N/A'}</p>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
              <span className="font-semibold">Tel:</span> {checkIn.client?.phone || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
              <span className="font-semibold">Email:</span> {checkIn.client?.email || 'N/A'}
            </div>
            {checkIn.client?.address && (
              <div className="flex items-start gap-2 text-sm mt-2" style={{ color: '#475569' }}>
                <span className="font-semibold">Dir:</span> <span>{checkIn.client.address}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#64748b' }}>Detalles del Equipo</h3>
          <div className="bg-slate-50 rounded-2xl p-5 border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>Marca</p>
                <p className="text-sm font-bold" style={{ color: '#1e293b' }}>{checkIn.printer?.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>Modelo</p>
                <p className="text-sm font-bold" style={{ color: '#1e293b' }}>{checkIn.printer?.model || 'N/A'}</p>
              </div>
            </div>
            {checkIn.printer?.serialNumber && (
              <div className="mb-3 pt-2 border-t border-slate-200/60">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>Número de Serie (S/N)</p>
                <p className="text-xs font-mono font-bold tracking-wider" style={{ color: '#0f172a' }}>{checkIn.printer.serialNumber}</p>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200/60">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Problema Reportado</p>
              <p className="text-xs italic leading-relaxed" style={{ color: '#475569' }}>
                "{checkIn.printer?.problem || 'No especificado'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#1e293b' }}>
              <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest rounded-tl-xl" style={{ color: '#ffffff' }}>Descripción del Servicio / Refacción</th>
              <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-right w-40 rounded-tr-xl" style={{ color: '#ffffff' }}>Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
            {(checkIn.quote?.items || []).map((item, index) => (
              <tr key={item.id || Math.random()} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <td className="py-5 px-6 text-sm font-medium border-b" style={{ color: '#334155', borderColor: '#f1f5f9' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{item.description || 'Sin descripción'}</span>
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
                <td className="py-5 px-6 text-sm font-bold text-right border-b" style={{ color: '#0f172a', borderColor: '#f1f5f9' }}>
                  $ {(Number(item.price) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        {(() => {
          const quote = checkIn.quote;
          const subtotal = quote.subtotal ?? quote.items.reduce((s, i) => s + (Number(i.price) || 0), 0);
          const taxRate = quote.taxRate || 0;
          const taxAmount = quote.taxAmount ?? ((subtotal * taxRate) / 100);
          const finalTotal = quote.total;

          return (
            <div className="flex justify-end mt-6">
              <div className="w-72 space-y-2.5">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Subtotal</span>
                  <span className="text-sm font-bold font-mono" style={{ color: '#1e293b' }}>
                    $ {subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
                    IVA ({taxRate}%)
                  </span>
                  <span className="text-sm font-bold font-mono" style={{ color: '#1e293b' }}>
                    $ {taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="h-px w-full" style={{ backgroundColor: '#e2e8f0' }}></div>
                <div className="flex justify-between items-center p-4 rounded-xl" style={{ backgroundColor: '#4f46e5' }}>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#ffffff' }}>Total Final</span>
                  <span className="text-xl font-black font-mono" style={{ color: '#ffffff' }}>
                    $ {finalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-20 mt-16 mb-12">
        <div className="text-center">
          <div className="h-px w-full mb-3" style={{ backgroundColor: '#94a3b8' }}></div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Firma del Técnico</p>
        </div>
        <div className="text-center">
          <div className="h-px w-full mb-3" style={{ backgroundColor: '#94a3b8' }}></div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Aceptación del Cliente</p>
        </div>
      </div>

      {/* Footer / Terms */}
      <div className="pt-8 border-t" style={{ borderColor: '#f1f5f9' }}>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Términos y Condiciones</h4>
            <ul className="text-[9px] leading-relaxed space-y-1" style={{ color: '#94a3b8' }}>
              <li>• Esta cotización tiene una validez de 15 días naturales.</li>
              <li>• Los precios incluyen mano de obra y refacciones especificadas.</li>
              <li>• Garantía de 30 días en mano de obra sobre la falla reportada.</li>
              <li>• No nos hacemos responsables por equipos olvidados después de 30 días.</li>
            </ul>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-[10px] font-bold" style={{ color: '#475569' }}>¡Gracias por su confianza!</p>
            <p className="text-[9px]" style={{ color: '#94a3b8' }}>
              {settings.website ? settings.website : 'www.printlogicmx.com'} | {settings.email ? settings.email : 'contacto@printlogicmx.com'}
            </p>
            {settings.address && (
              <p className="text-[9px] mt-1" style={{ color: '#94a3b8' }}>{settings.address}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
