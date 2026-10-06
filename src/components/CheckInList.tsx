import React, { useState, useMemo } from 'react';
import { CheckIn } from '../types';
import { 
  FileText, 
  Search, 
  Trash2, 
  Calendar, 
  Printer as PrinterIcon,
  Barcode,
  X,
  Phone,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Download
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';

interface CheckInListProps {
  checkIns: CheckIn[];
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus?: (id: string, status: CheckIn['printer']['status']) => void;
}

type StatusType = CheckIn['printer']['status'];

export function CheckInList({ checkIns, onViewDetails, onDelete, onUpdateStatus }: CheckInListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | StatusType>('all');
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const statusConfig: Record<StatusType, { label: string; textClass: string; bgClass: string; borderClass: string; dotClass: string }> = {
    'Ingresado': {
      label: 'Ingresado',
      textClass: 'text-amber-800',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200/80',
      dotClass: 'bg-amber-500',
    },
    'Cotizado': {
      label: 'Cotizado',
      textClass: 'text-blue-800',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200/80',
      dotClass: 'bg-blue-500',
    },
    'Aceptado': {
      label: 'Aceptado',
      textClass: 'text-violet-800',
      bgClass: 'bg-violet-50',
      borderClass: 'border-violet-200/80',
      dotClass: 'bg-violet-500',
    },
    'Reparado': {
      label: 'Reparado',
      textClass: 'text-emerald-800',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200/80',
      dotClass: 'bg-emerald-500',
    },
    'Entregado': {
      label: 'Entregado',
      textClass: 'text-slate-800',
      bgClass: 'bg-slate-100',
      borderClass: 'border-slate-300',
      dotClass: 'bg-slate-500',
    },
  };

  const statusList: StatusType[] = ['Ingresado', 'Cotizado', 'Aceptado', 'Reparado', 'Entregado'];

  // Counts for each status
  const counts = useMemo(() => {
    return {
      all: checkIns.length,
      Ingresado: checkIns.filter(c => c.printer.status === 'Ingresado').length,
      Cotizado: checkIns.filter(c => c.printer.status === 'Cotizado').length,
      Aceptado: checkIns.filter(c => c.printer.status === 'Aceptado').length,
      Reparado: checkIns.filter(c => c.printer.status === 'Reparado').length,
      Entregado: checkIns.filter(c => c.printer.status === 'Entregado').length,
    };
  }, [checkIns]);

  // Filtered list
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((c) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = 
        !q ||
        (c.client?.name || '').toLowerCase().includes(q) ||
        (c.client?.phone || '').toLowerCase().includes(q) ||
        (c.printer?.model || '').toLowerCase().includes(q) ||
        (c.printer?.brand || '').toLowerCase().includes(q) ||
        (c.printer?.serialNumber || '').toLowerCase().includes(q) ||
        (c.printer?.problem || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (selectedStatusFilter === 'all') return true;
      return c.printer.status === selectedStatusFilter;
    });
  }, [checkIns, searchTerm, selectedStatusFilter]);

  // Reset page on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatusFilter]);

  // Copy serial number helper
  const handleCopySerial = (e: React.MouseEvent, serial: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(serial);
    setCopiedSerial(serial);
    setTimeout(() => {
      setCopiedSerial(null);
    }, 2000);
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = ['ID', 'Cliente', 'Teléfono', 'Marca', 'Modelo', 'Número de Serie', 'Falla', 'Estado', 'Fecha Ingreso', 'Monto Cotizado'];
    const rows = filteredCheckIns.map(c => [
      c.id,
      `"${c.client?.name || ''}"`,
      `"${c.client?.phone || ''}"`,
      `"${c.printer?.brand || ''}"`,
      `"${c.printer?.model || ''}"`,
      `"${c.printer?.serialNumber || ''}"`,
      `"${(c.printer?.problem || '').replace(/"/g, '""')}"`,
      c.printer?.status || 'Ingresado',
      new Date(c.createdAt).toLocaleDateString('es-MX'),
      c.quote?.total || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ingresos_taller_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(filteredCheckIns.length / itemsPerPage);
  const paginatedCheckIns = filteredCheckIns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Clean Header & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <PrinterIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
                Ingresos y Taller
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  {counts.all}
                </span>
              </h1>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Descargar reporte en Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, modelo o número de serie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                selectedStatusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              Todos <span className="font-mono tabular-nums opacity-80">({counts.all})</span>
            </button>
            {statusList.map((status) => {
              const cfg = statusConfig[status];
              const isSelected = selectedStatusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(isSelected ? 'all' : status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? `${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} ring-2 ring-slate-900/10 shadow-xs`
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                  <span>{status}</span>
                  <span className="font-mono tabular-nums opacity-75">({counts[status]})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Mobile Card Feed (md:hidden) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredCheckIns.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <PrinterIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-xs">No se encontraron ingresos</p>
              <p className="text-[11px] text-slate-400">Prueba con otro término de búsqueda.</p>
            </div>
          ) : (
            paginatedCheckIns.map((checkIn) => {
              const cfg = statusConfig[checkIn.printer.status || 'Ingresado'];
              return (
                <div
                  key={checkIn.id}
                  onClick={() => onViewDetails(checkIn.id)}
                  className="p-4 space-y-3 bg-white hover:bg-slate-50/80 active:bg-slate-100/80 transition-all cursor-pointer relative"
                >
                  {/* Top row: Client name + date + quick status dropdown */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {checkIn.client?.name || 'Cliente sin nombre'}
                        </p>
                        {checkIn.quote && (
                          <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ${(checkIn.quote.total || 0).toLocaleString('es-MX')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(checkIn.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </p>
                    </div>

                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                      {onUpdateStatus ? (
                        <select
                          value={checkIn.printer.status}
                          onChange={(e) => onUpdateStatus(checkIn.id, e.target.value as StatusType)}
                          className={`min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-xl border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} cursor-pointer focus:ring-2 focus:ring-slate-900/10 shadow-2xs`}
                        >
                          {statusList.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          {checkIn.printer.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Printer Brand & Model & Problem */}
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <PrinterIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{checkIn.printer.brand} {checkIn.printer.model}</span>
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {checkIn.printer.problem || 'Sin diagnóstico registrado'}
                    </p>
                  </div>

                  {/* Bottom Row: S/N + Actions (WhatsApp, Llamar & Ver Ficha) */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    {checkIn.printer.serialNumber ? (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-mono font-semibold text-slate-700 border border-slate-200/60"
                      >
                        <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[110px]">{checkIn.printer.serialNumber}</span>
                        <button
                          onClick={(e) => handleCopySerial(e, checkIn.printer.serialNumber!)}
                          className="p-1 hover:text-slate-900 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                          title="Copiar S/N"
                        >
                          {copiedSerial === checkIn.printer.serialNumber ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sin S/N</span>
                    )}

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {checkIn.client?.phone && (
                        <>
                          <a
                            href={`tel:${checkIn.client.phone.replace(/\s+/g, '')}`}
                            className="min-h-[40px] min-w-[40px] px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center active:scale-95 transition-all"
                            title="Llamar al cliente"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${checkIn.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${checkIn.client.name}, le contactamos del servicio técnico PrintFix sobre su equipo ${checkIn.printer.brand} ${checkIn.printer.model}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[40px] px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                            title="Abrir WhatsApp"
                          >
                            <span className="text-[11px] font-black">WA</span>
                          </a>
                        </>
                      )}

                      <button
                        onClick={() => onViewDetails(checkIn.id)}
                        className="min-h-[40px] px-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                      >
                        <span>Ver</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Equipo & Diagnóstico</th>
                <th className="px-5 py-3">Número de Serie</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredCheckIns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                        <PrinterIcon className="w-8 h-8 text-slate-300" />
                        <p className="font-bold text-slate-700 text-sm">No se encontraron ingresos</p>
                        <p className="text-xs text-slate-400">
                          {searchTerm 
                            ? 'No hay registros que coincidan con la búsqueda.' 
                            : 'No hay equipos registrados en el taller actualmente.'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                          >
                            Limpiar búsqueda
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCheckIns.map((checkIn) => {
                    const cfg = statusConfig[checkIn.printer.status || 'Ingresado'];

                    return (
                      <tr
                        key={checkIn.id}
                        onClick={() => onViewDetails(checkIn.id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Cliente */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                              {checkIn.client?.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {checkIn.client?.name || 'Cliente sin nombre'}
                              </p>
                              {checkIn.client?.phone && (
                                <a
                                  href={`https://wa.me/${checkIn.client.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] text-slate-500 hover:text-emerald-600 font-medium flex items-center gap-1 mt-0.5 transition-colors"
                                  title="Enviar WhatsApp"
                                >
                                  <Phone className="w-3 h-3 opacity-60" />
                                  <span>{checkIn.client.phone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Equipo & Falla */}
                        <td className="px-5 py-3.5">
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900">
                              {checkIn.printer.brand} {checkIn.printer.model}
                            </p>
                            <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                              {checkIn.printer.problem || 'Sin diagnóstico detallado'}
                            </p>
                          </div>
                        </td>

                        {/* Número de Serie */}
                        <td className="px-5 py-3.5">
                          {checkIn.printer.serialNumber ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/70 text-[11px] font-mono font-semibold text-slate-700">
                              <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{checkIn.printer.serialNumber}</span>
                              <button
                                onClick={(e) => handleCopySerial(e, checkIn.printer.serialNumber!)}
                                className="p-0.5 hover:text-slate-900 rounded cursor-pointer transition-colors"
                                title="Copiar número de serie"
                              >
                                {copiedSerial === checkIn.printer.serialNumber ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(checkIn.createdAt).toLocaleDateString('es-MX')}</span>
                          </div>
                        </td>

                        {/* Estado con Selector Rápido */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                            {onUpdateStatus ? (
                              <select
                                value={checkIn.printer.status}
                                onChange={(e) => onUpdateStatus(checkIn.id, e.target.value as StatusType)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                              >
                                {statusList.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                                <span>{checkIn.printer.status}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onViewDetails(checkIn.id)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Ver detalles y cotización"
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm('¿Seguro que deseas eliminar este ingreso?')) {
                                  onDelete(checkIn.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
            <span className="text-slate-500 font-mono">
              Página <span className="font-bold text-slate-900">{currentPage}</span> de <span className="font-bold text-slate-900">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
