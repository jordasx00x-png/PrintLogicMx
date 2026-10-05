import React, { useState, useRef } from 'react';
import { CheckIn, Quote, QuoteItem, Product } from '../types';
import { ArrowLeft, Printer, User, FileText, Plus, Trash2, Send, CheckCircle2, Edit2, Save, History, Lock, Unlock, Clock, Search, AlertCircle, Download, QrCode } from 'lucide-react';
import { QuoteSheet } from './QuoteSheet';
import { QuotePrintable } from './QuotePrintable';
import { QuoteQRModal } from './QuoteQRModal';
import { generateQuotePDF } from '../utils/pdfGenerator';

interface CheckInDetailsProps {
  checkIn: CheckIn;
  checkIns?: CheckIn[];
  products?: Product[];
  onBack: () => void;
  onAddQuote: (checkInId: string, quote: Omit<Quote, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateQuote: (checkInId: string, quote: Quote) => void;
  onMarkQuoteAsSent: (checkInId: string) => void;
  onUnlockQuote: (checkInId: string) => void;
  onUpdateStatus: (id: string, status: CheckIn['printer']['status']) => void;
  onUpdateClient: (id: string, client: CheckIn['client']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

export function CheckInDetails({ checkIn, checkIns = [], products = [], onBack, onAddQuote, onUpdateQuote, onMarkQuoteAsSent, onUnlockQuote, onUpdateStatus, onUpdateClient, onUpdateNotes, onDelete }: CheckInDetailsProps) {
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showQuoteSheet, setShowQuoteSheet] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [editClientForm, setEditClientForm] = useState(checkIn.client || { name: '', phone: '', email: '', address: '' });
  const [notes, setNotes] = useState(checkIn.notes || '');
  const [quoteItems, setQuoteItems] = useState<Omit<QuoteItem, 'id'>[]>([
    { description: '', price: 0 }
  ]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAddProductToQuote = (product: Product) => {
    // If the last item is empty, use it. Otherwise add a new one.
    const lastItem = quoteItems[quoteItems.length - 1];
    if (quoteItems.length === 1 && !lastItem.description && lastItem.price === 0) {
      const newItems = [...quoteItems];
      newItems[0] = { description: product.name, price: product.price };
      setQuoteItems(newItems);
    } else {
      setQuoteItems([...quoteItems, { description: product.name, price: product.price }]);
    }
    setShowProductPicker(false);
    setProductSearch('');
  };

  const handleAddQuoteItem = () => {
    setQuoteItems([...quoteItems, { description: '', price: 0 }]);
  };

  const handleRemoveQuoteItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const handleQuoteItemChange = (index: number, field: keyof Omit<QuoteItem, 'id'>, value: string | number) => {
    const newItems = [...quoteItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setQuoteItems(newItems);
  };

  const handleUpdateQuoteItem = (index: number, updates: Partial<Omit<QuoteItem, 'id'>>) => {
    const newItems = [...quoteItems];
    newItems[index] = { ...newItems[index], ...updates };
    setQuoteItems(newItems);
  };

  const totalQuote = quoteItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleEditQuote = () => {
    if (checkIn.quote?.items && Array.isArray(checkIn.quote.items)) {
      // Ensure we have a clean copy of the items with all required fields
      const itemsCopy = checkIn.quote.items.map(item => ({
        id: item.id || Math.random().toString(36).substring(2, 15),
        description: item.description || '',
        price: Number(item.price) || 0
      }));
      setQuoteItems(itemsCopy);
      setIsEditingQuote(true);
    }
  };

  const handleSaveQuote = () => {
    try {
      // Clean and validate items
      const validItems = quoteItems
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          description: (item.description || '').trim(),
          price: Number(item.price) || 0
        }))
        .filter(item => item.description !== '' && item.price > 0);

      if (validItems.length === 0) {
        alert('Por favor, agrega al menos un ítem con descripción y precio válido antes de guardar.');
        return;
      }

      const total = validItems.reduce((sum, item) => sum + item.price, 0);

      if (isEditingQuote && checkIn?.quote) {
        onUpdateQuote(checkIn.id, {
          ...checkIn.quote,
          items: validItems.map(item => ({
            id: Math.random().toString(36).substring(2, 15),
            ...item
          })) as QuoteItem[],
          total
        });
        setIsEditingQuote(false);
      } else {
        onAddQuote(checkIn.id, {
          items: validItems.map(item => ({
            id: Math.random().toString(36).substring(2, 15),
            ...item
          })) as QuoteItem[],
          total
        });
        setIsCreatingQuote(false);
      }
      
      // Reset state
      setQuoteItems([{ description: '', price: 0 }]);
      
      // Visual confirmation
      console.log('Cotización guardada exitosamente');
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error crítico al guardar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleSaveClient = () => {
    onUpdateClient(checkIn.id, editClientForm);
    setIsEditingClient(false);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    onDelete(checkIn.id);
    onBack();
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const hiddenPrintRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!checkIn.quote || !hiddenPrintRef.current) return;
    try {
      setIsGeneratingPdf(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      await generateQuotePDF(hiddenPrintRef.current, checkIn);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al generar el PDF: ${errorMsg}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!checkIn.quote || !hiddenPrintRef.current) return;

    try {
      setIsGeneratingPdf(true);
      
      // Small delay to ensure hidden area is rendered and layout is stable
      await new Promise(resolve => setTimeout(resolve, 300));

      // 1. Generate and download PDF
      if (!hiddenPrintRef.current) throw new Error('El área de impresión no está lista');
      await generateQuotePDF(hiddenPrintRef.current, checkIn);
      
      // 2. Mark as sent
      if (checkIn.quote.status !== 'sent') {
        onMarkQuoteAsSent(checkIn.id);
      }

      // 3. Open WhatsApp with instructions
      const phone = (checkIn.client?.phone || '').replace(/\D/g, '');
      const message = `Hola ${checkIn.client?.name || ''},%0A%0A` +
        `Le adjunto la cotización PDF para la reparación de su impresora ${checkIn.printer?.brand || ''} ${checkIn.printer?.model || ''}.%0A%0A` +
        `*Por favor, adjunte el archivo PDF que se acaba de descargar en este chat.*%0A%0A` +
        `Quedamos a su disposición para cualquier consulta.`;

      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      
      alert('Se ha descargado la cotización en PDF. Por favor, adjúntala manualmente en el chat de WhatsApp que se ha abierto.');
    } catch (error) {
      console.error('Error sending WhatsApp PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al generar el PDF para WhatsApp: ${errorMsg}\n\nPor favor, intenta descargar el PDF manualmente desde la "Hoja de Cotización" e intenta de nuevo.`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

  // Find previous quotes for this printer (same brand and model, different check-in ID)
  const previousQuotes = checkIns
    .filter(c => 
      c.id !== checkIn.id && 
      (c.printer?.brand || '').toLowerCase() === (checkIn.printer?.brand || '').toLowerCase() && 
      (c.printer?.model || '').toLowerCase() === (checkIn.printer?.model || '').toLowerCase() &&
      c.quote
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 pb-20 print:max-w-none print:space-y-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Detalles del Ingreso</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">ID: {checkIn.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <select
              value={checkIn.printer?.status || 'Ingresado'}
              onChange={(e) => onUpdateStatus(checkIn.id, e.target.value as any)}
              className={`text-xs font-black uppercase tracking-widest rounded-2xl px-5 py-3 border ring-1 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all pr-10 ${getStatusStyles(checkIn.printer?.status || 'Ingresado')}`}
            >
              <option value="Ingresado">Ingresado</option>
              <option value="Cotizado">Cotizado</option>
              <option value="Aceptado">Aceptado</option>
              <option value="Reparado">Reparado</option>
              <option value="Entregado">Entregado</option>
            </select>
            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none" />
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-3 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl transition-all"
            title="Eliminar ingreso"
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
              <h3 className="text-xl font-black text-slate-900">¿Eliminar ingreso?</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Estás a punto de eliminar este ingreso del sistema. Esta acción se sincronizará en todos tus dispositivos.
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
                onClick={handleDelete}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 print:hidden">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          {/* Client Info */}
          <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Información del Cliente</h2>
              </div>
              {!isEditingClient && (
                <button
                  onClick={() => {
                    setEditClientForm(checkIn.client);
                    setIsEditingClient(true);
                  }}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                  title="Editar cliente"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {isEditingClient ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre</label>
                    <input
                      type="text"
                      value={editClientForm.name}
                      onChange={e => setEditClientForm({...editClientForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
                    <input
                      type="text"
                      value={editClientForm.phone}
                      onChange={e => setEditClientForm({...editClientForm, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo</label>
                    <input
                      type="email"
                      value={editClientForm.email}
                      onChange={e => setEditClientForm({...editClientForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dirección</label>
                    <input
                      type="text"
                      value={editClientForm.address || ''}
                      onChange={e => setEditClientForm({...editClientForm, address: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsEditingClient(false)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveClient}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-100 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nombre del Cliente</p>
                  <p className="text-lg font-black text-slate-900">{checkIn.client?.name || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contacto Directo</p>
                  <p className="text-lg font-black text-slate-900">{checkIn.client?.phone || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</p>
                  <p className="text-sm font-bold text-slate-600 truncate">{checkIn.client?.email || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ubicación</p>
                  <p className="text-sm font-bold text-slate-600">{checkIn.client?.address || 'No especificada'}</p>
                </div>
              </div>
            )}
          </section>

          {/* Printer Info */}
          <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Detalles del Equipo</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Marca</p>
                <p className="text-lg font-black text-slate-900">{checkIn.printer?.brand || 'N/A'}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Modelo</p>
                <p className="text-lg font-black text-slate-900">{checkIn.printer?.model || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Falla Reportada</p>
              </div>
              <div className="bg-slate-900 rounded-[2rem] p-8 text-slate-300 text-sm font-medium leading-relaxed shadow-xl">
                {checkIn.printer?.problem || 'No especificado'}
              </div>
            </div>
          </section>

          {/* Internal Notes */}
          <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <History className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Notas de Seguimiento</h2>
              </div>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="space-y-6">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none h-40 resize-none transition-all"
                  placeholder="Agrega notas sobre el progreso de la reparación..."
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setNotes(checkIn.notes || '');
                      setIsEditingNotes(false);
                    }}
                    className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onUpdateNotes(checkIn.id, notes);
                      setIsEditingNotes(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-100 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Notas
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-[2rem] p-8 text-sm text-slate-600 font-medium border border-slate-100 min-h-[120px] leading-relaxed">
                {checkIn.notes ? (
                  <p className="whitespace-pre-wrap">{checkIn.notes}</p>
                ) : (
                  <p className="text-slate-400 italic">No hay notas registradas para este equipo.</p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Quote */}
        <div className="space-y-6 md:space-y-10">
          <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Cotización</h2>
            </div>

            {checkIn.quote && !isEditingQuote ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${checkIn.quote.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {checkIn.quote.status === 'sent' ? 'Enviada' : 'Borrador'}
                    </span>
                    {checkIn.quote.status === 'sent' && (
                      <button
                        onClick={() => onUnlockQuote(checkIn.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                        title="Desbloquear cotización"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {checkIn.quote.status !== 'sent' && (
                    <button
                      onClick={handleEditQuote}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(checkIn.quote?.items || []).map((item, idx) => (
                    <div key={item.id || idx} className="flex justify-between items-start text-sm pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                      <span className="text-slate-600 font-bold pr-4">{item.description || 'Sin descripción'}</span>
                      <span className="font-black text-slate-900 whitespace-nowrap">${(Number(item.price) || 0).toLocaleString('es-MX')}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Total</span>
                  <span className="text-3xl font-black text-indigo-600 tracking-tighter">${checkIn.quote.total.toLocaleString('es-MX')}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowQuoteSheet(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-xs font-black rounded-2xl shadow-sm transition-all"
                    >
                      <Printer className="w-4 h-4 text-indigo-600" />
                      Imprimir / Ver
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-purple-100 transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      Código QR
                    </button>
                    <button
                      onClick={handleSendWhatsApp}
                      disabled={isGeneratingPdf}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>

                  {checkIn.quote.status !== 'sent' && (
                    <button
                      onClick={() => onMarkQuoteAsSent(checkIn.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-xl transition-all mt-1"
                    >
                      <Lock className="w-4 h-4" />
                      Bloquear para Envío
                    </button>
                  )}
                </div>
              </div>
            ) : isCreatingQuote || isEditingQuote ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  {(quoteItems || []).map((item, index) => (
                    <div key={index} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative group">
                      <button
                        onClick={() => handleRemoveQuoteItem(index)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">
                            Cargar desde Catálogo (Opcional)
                          </label>
                          <select
                            value=""
                            onChange={(e) => {
                              const product = products.find(p => p.id === e.target.value);
                              if (product) {
                                handleUpdateQuoteItem(index, {
                                  description: product.name,
                                  price: product.price
                                });
                              }
                            }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none transition-all cursor-pointer hover:bg-slate-100"
                          >
                            <option value="" disabled>Seleccionar artículo...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} - ${p.price}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-[38px] pointer-events-none">
                            <Search className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Descripción del Servicio / Producto
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Mantenimiento Preventivo"
                            value={item?.description || ''}
                            onChange={(e) => handleQuoteItemChange(index, 'description', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Precio Unitario
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={item?.price || ''}
                              onChange={(e) => handleQuoteItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddQuoteItem}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl text-xs font-black transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Manual
                  </button>
                  <button
                    onClick={() => setShowProductPicker(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl text-xs font-black transition-all border border-indigo-100"
                  >
                    <Search className="w-4 h-4" />
                    Catálogo
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Total</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">${totalQuote.toLocaleString('es-MX')}</span>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleSaveQuote}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    Guardar Cotización
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingQuote(false);
                      setIsEditingQuote(false);
                    }}
                    className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-900">Sin Cotización</p>
                  <p className="text-xs text-slate-400 font-medium px-6">Genera un presupuesto detallado para que el cliente lo apruebe.</p>
                </div>
                <button
                  onClick={() => setIsCreatingQuote(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Crear Ahora
                </button>
              </div>
            )}
          </section>

          {/* Previous Quotes History */}
          {previousQuotes.length > 0 && (
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <History className="w-6 h-6 text-slate-400" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Historial</h2>
              </div>
              <div className="space-y-4">
                {previousQuotes.map(prevCheckIn => (
                  <div key={prevCheckIn.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {new Date(prevCheckIn.quote!.createdAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {prevCheckIn.quote!.items.length} Conceptos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600 tracking-tighter">
                        ${prevCheckIn.quote!.total.toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {showQuoteSheet && (
        <QuoteSheet checkIn={checkIn} onClose={() => setShowQuoteSheet(false)} />
      )}

      {showQRModal && (
        <QuoteQRModal checkIn={checkIn} onClose={() => setShowQRModal(false)} />
      )}

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900">Seleccionar del Catálogo</h3>
              <button onClick={() => setShowProductPicker(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar producto o servicio..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProductToQuote(product)}
                    className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No se encontraron productos en el catálogo.
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowProductPicker(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden printable area for PDF generation */}
      <div id="pdf-capture-area" style={{ position: 'absolute', left: '-2000px', top: '0', width: '800px', zIndex: -100, pointerEvents: 'none' }}>
        <QuotePrintable checkIn={checkIn} printRef={hiddenPrintRef} />
      </div>
    </div>
  );
}
