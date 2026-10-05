import React from 'react';
import { CheckIn } from '../types';
import { FileText, MoreVertical, Search, MessageCircle, Trash2, Filter, ChevronRight, Calendar, User, Printer as PrinterIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckInListProps {
  checkIns: CheckIn[];
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CheckInList({ checkIns, onViewDetails, onDelete }: CheckInListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'todo' | 'hechos' | 'aceptado' | 'reparado' | 'entregado'>('todo');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredCheckIns = checkIns.filter(
    (c) => {
      const matchesSearch = 
        (c.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.printer?.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.printer?.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeTab === 'todo') return c.printer.status === 'Ingresado';
      if (activeTab === 'hechos') return c.printer.status === 'Cotizado';
      if (activeTab === 'aceptado') return c.printer.status === 'Aceptado';
      if (activeTab === 'reparado') return c.printer.status === 'Reparado';
      if (activeTab === 'entregado') return c.printer.status === 'Entregado';
      
      return true;
    }
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredCheckIns.length / itemsPerPage);
  const paginatedCheckIns = filteredCheckIns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Ingresado': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
      case 'Cotizado': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10';
      case 'Aceptado': return 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-500/10';
      case 'Reparado': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
      case 'Entregado': return 'bg-slate-50 text-slate-700 border-slate-100 ring-slate-500/10';
      default: return 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10';
    }
  };

  const tabs = [
    { id: 'todo', label: 'Por Cotizar', count: checkIns.filter(c => c.printer.status === 'Ingresado').length, color: 'amber' },
    { id: 'hechos', label: 'Cotizados', count: checkIns.filter(c => c.printer.status === 'Cotizado').length, color: 'blue' },
    { id: 'aceptado', label: 'Aceptados', count: checkIns.filter(c => c.printer.status === 'Aceptado').length, color: 'indigo' },
    { id: 'reparado', label: 'Reparados', count: checkIns.filter(c => c.printer.status === 'Reparado').length, color: 'emerald' },
    { id: 'entregado', label: 'Entregados', count: checkIns.filter(c => c.printer.status === 'Entregado').length, color: 'slate' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestión de Ingresos</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Administra el flujo de trabajo de tu taller</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por cliente o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 text-[10px] rounded-lg ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100">Cliente</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100">Equipo</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100">Fecha de Ingreso</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100">Estado</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredCheckIns.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                          <Filter className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold">No se encontraron resultados en esta categoría</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  paginatedCheckIns.map((checkIn) => (
                    <motion.tr
                      key={checkIn.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                      onClick={() => onViewDetails(checkIn.id)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{checkIn.client?.name || 'N/A'}</div>
                            <div className="text-slate-400 text-xs font-medium mt-0.5">{checkIn.client?.phone || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                            <PrinterIcon className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{checkIn.printer?.brand || ''} {checkIn.printer?.model || ''}</div>
                            <div className="text-slate-400 text-xs font-medium mt-0.5 truncate max-w-[180px]" title={checkIn.printer?.problem || ''}>
                              {checkIn.printer?.problem || 'No especificado'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          {new Date(checkIn.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ring-1 ${getStatusStyles(
                            checkIn.printer.status
                          )}`}
                        >
                          {checkIn.printer.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(checkIn.id);
                            }}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all rounded-xl hover:bg-white hover:shadow-md"
                            title="Ver detalles"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
                                onDelete(checkIn.id);
                              }
                            }}
                            className="p-2.5 text-slate-400 hover:text-red-600 transition-all rounded-xl hover:bg-white hover:shadow-md"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="p-2.5 text-slate-300">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-xs font-bold text-slate-400">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCheckIns.length)} de {filteredCheckIns.length} resultados
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-500"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'text-slate-500 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
