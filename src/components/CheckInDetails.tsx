import React, { useState, useRef } from 'react';
import { CheckIn, Quote, QuoteItem, Product } from '../types';
import { ArrowLeft, Printer, User, FileText, Plus, Trash2, Send, CheckCircle2, Edit2, Save, History, Lock, Unlock, Clock, Search, AlertCircle, Download, QrCode, Barcode, ShieldCheck, X } from 'lucide-react';
import { QuoteSheet } from './QuoteSheet';
import { QuotePrintable } from './QuotePrintable';
import { QuoteQRModal } from './QuoteQRModal';
import { generateQuotePDF } from '../utils/pdfGenerator';

interface CheckInDetailsProps {
  checkIn: CheckIn;
  checkIns?: CheckIn[];
  products?: Product[];
  onBack: () => void;
  onAddQuote: (checkInId: string, quote: Omit<Quote, 'id' | 'createdAt' | 'status'>, optionKey: 'quote' | 'quoteB') => void;
  onUpdateQuote: (checkInId: string, quote: Quote, optionKey: 'quote' | 'quoteB') => void;
  onMarkQuoteAsSent: (checkInId: string, optionKey: 'quote' | 'quoteB') => void;
  onUnlockQuote: (checkInId: string, optionKey: 'quote' | 'quoteB') => void;
  onDeleteQuote?: (checkInId: string, optionKey: 'quote' | 'quoteB') => void;
  onUpdateStatus: (id: string, status: CheckIn['printer']['status']) => void;
  onUpdateClient: (id: string, client: CheckIn['client']) => void;
  onUpdatePrinter: (id: string, printer: CheckIn['printer']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
  onAddProduct?: (product: Omit<Product, 'id'>) => Promise<void> | void;
}

export function CheckInDetails({ checkIn, checkIns = [], products = [], onBack, onAddQuote, onUpdateQuote, onMarkQuoteAsSent, onUnlockQuote, onDeleteQuote, onUpdateStatus, onUpdateClient, onUpdatePrinter, onUpdateNotes, onDelete, onAddProduct }: CheckInDetailsProps) {
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingPrinter, setIsEditingPrinter] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showQuoteSheet, setShowQuoteSheet] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteQuoteModal, setShowDeleteQuoteModal] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [editClientForm, setEditClientForm] = useState(checkIn.client || { name: '', phone: '', email: '', address: '' });
  const [editPrinterForm, setEditPrinterForm] = useState(checkIn.printer || { brand: '', model: '', serialNumber: '', problem: '', status: 'Ingresado' });
  const [notes, setNotes] = useState(checkIn.notes || '');
  const [quoteItems, setQuoteItems] = useState<Omit<QuoteItem, 'id'>[]>([
    { description: '', price: 0, cost: 0, category: 'Servicio', notes: '' }
  ]);
  const [quoteTaxRate, setQuoteTaxRate] = useState<number>(0);
  const [isCustomQuoteTax, setIsCustomQuoteTax] = useState<boolean>(false);
  const [activeQuoteOption, setActiveQuoteOption] = useState<'quote' | 'quoteB'>('quote');
  const [activeShareQuote, setActiveShareQuote] = useState<'quote' | 'quoteB'>('quote');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.compatibleModels || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAddProductToQuote = (product: Product) => {
    const newItem: Omit<QuoteItem, 'id'> = {
      description: product.name,
      price: product.price,
      cost: product.cost || 0,
      category: product.category || 'Refacción',
      notes: product.compatibleModels ? `Modelos: ${product.compatibleModels}` : (product.description || '')
    };

    // If the last item is empty, use it. Otherwise add a new one.
    const lastItem = quoteItems[quoteItems.length - 1];
    if (quoteItems.length === 1 && !lastItem.description && lastItem.price === 0) {
      setQuoteItems([newItem]);
    } else {
      setQuoteItems([...quoteItems, newItem]);
    }
    setShowProductPicker(false);
    setProductSearch('');
  };

  const handleAddQuoteItem = () => {
    setQuoteItems([...quoteItems, { description: '', price: 0, cost: 0, category: 'Servicio', notes: '' }]);
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

  const quoteSubtotal = quoteItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const quoteTaxAmount = (quoteSubtotal * (quoteTaxRate || 0)) / 100;
  const totalQuote = quoteSubtotal + quoteTaxAmount;

  const handleEditQuote = (optionKey: 'quote' | 'quoteB' = 'quote') => {
    const targetQuote = checkIn[optionKey];
    if (targetQuote?.items && Array.isArray(targetQuote.items)) {
      const itemsCopy = targetQuote.items.map(item => ({
        id: item.id || Math.random().toString(36).substring(2, 15),
        description: item.description || '',
        price: Number(item.price) || 0,
        cost: Number(item.cost) || 0,
        category: item.category || 'Servicio',
        notes: item.notes || ''
      }));
      setQuoteItems(itemsCopy);
      setQuoteTaxRate(targetQuote.taxRate || 0);
      setIsCustomQuoteTax(targetQuote.taxRate !== undefined && targetQuote.taxRate !== 0 && targetQuote.taxRate !== 8 && targetQuote.taxRate !== 16);
      setActiveQuoteOption(optionKey);
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
          price: Number(item.price) || 0,
          cost: Number(item.cost) || 0,
          category: item.category || 'Servicio',
          notes: (item.notes || '').trim()
        }))
        .filter(item => item.description !== '' && item.price > 0);

      if (validItems.length === 0) {
        alert('Por favor, agrega al menos un ítem con descripción y precio válido antes de guardar.');
        return;
      }

      // Check if products should be auto-saved to catalog
      validItems.forEach(async (item) => {
        const itemLower = item.description.trim().toLowerCase();
        const exists = products.some(p => p.name.trim().toLowerCase() === itemLower);
        if (!exists && onAddProduct) {
          try {
            await onAddProduct({
              name: item.description.trim(),
              price: item.price,
              cost: item.cost,
              category: item.category || 'Servicio',
              description: item.notes ? item.notes.trim() : 'Auto-guardado desde cotización',
              compatibleModels: item.notes ? item.notes.trim() : ''
            });
            console.log(`Auto-guardado en catálogo: ${item.description}`);
          } catch (e) {
            console.error('Error auto-saving item to product catalog:', e);
          }
        }
      });

      const subtotal = validItems.reduce((sum, item) => sum + item.price, 0);
      const taxAmount = (subtotal * (quoteTaxRate || 0)) / 100;
      const total = subtotal + taxAmount;
      const targetQuote = checkIn[activeQuoteOption];

      const quoteData: Quote = {
        id: (isEditingQuote && targetQuote?.id) ? targetQuote.id : Math.random().toString(36).substring(2, 15),
        items: validItems.map(item => ({
          id: Math.random().toString(36).substring(2, 15),
          ...item
        })) as QuoteItem[],
        subtotal,
        taxRate: quoteTaxRate,
        taxAmount,
        total,
        createdAt: (isEditingQuote && targetQuote?.createdAt) ? targetQuote.createdAt : new Date().toISOString(),
        status: targetQuote?.status || 'draft'
      };

      if (isEditingQuote && targetQuote) {
        onUpdateQuote(checkIn.id, quoteData, activeQuoteOption);
        setIsEditingQuote(false);
      } else {
        onAddQuote(checkIn.id, quoteData, activeQuoteOption);
        setIsCreatingQuote(false);
      }
      
      // Reset state
      setQuoteItems([{ description: '', price: 0, cost: 0, category: 'Servicio', notes: '' }]);
      setQuoteTaxRate(0);
      setIsCustomQuoteTax(false);
      
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

  const handleSavePrinter = () => {
    onUpdatePrinter(checkIn.id, editPrinterForm);
    setIsEditingPrinter(false);
  };

  React.useEffect(() => {
    setEditClientForm(checkIn.client || { name: '', phone: '', email: '', address: '' });
    setEditPrinterForm(checkIn.printer || { brand: '', model: '', serialNumber: '', problem: '', status: 'Ingresado' });
    setNotes(checkIn.notes || '');
  }, [checkIn]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    onDelete(checkIn.id);
    onBack();
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const hiddenPrintRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async (optionKey: 'quote' | 'quoteB' = 'quote') => {
    const targetQuote = checkIn[optionKey];
    if (!targetQuote || !hiddenPrintRef.current) return;
    try {
      setIsGeneratingPdf(true);
      setActiveShareQuote(optionKey);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const checkInForPrinting = {
        ...checkIn,
        quote: targetQuote
      };
      await generateQuotePDF(hiddenPrintRef.current, checkInForPrinting);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al generar el PDF: ${errorMsg}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendWhatsApp = async (optionKey: 'quote' | 'quoteB' = 'quote') => {
    const targetQuote = checkIn[optionKey];
    if (!targetQuote || !hiddenPrintRef.current) return;

    try {
      setIsGeneratingPdf(true);
      setActiveShareQuote(optionKey);
      await new Promise(resolve => setTimeout(resolve, 300));

      const checkInForPrinting = {
        ...checkIn,
        quote: targetQuote
      };
      if (!hiddenPrintRef.current) throw new Error('El área de impresión no está lista');
      await generateQuotePDF(hiddenPrintRef.current, checkInForPrinting);
      
      if (targetQuote.status !== 'sent') {
        onMarkQuoteAsSent(checkIn.id, optionKey);
      }

      const phone = (checkIn.client?.phone || '').replace(/\D/g, '');
      const optionLabel = optionKey === 'quote' ? 'A (Económica / Estándar)' : 'B (Alternativa / Premium)';
      const message = `Hola ${checkIn.client?.name || ''},%0A%0A` +
        `Le adjunto la cotización para la opción ${optionLabel} de la reparación de su impresora ${checkIn.printer?.brand || ''} ${checkIn.printer?.model || ''}.%0A%0A` +
        `*Por favor, adjunte el archivo PDF que se acaba de descargar en este chat.*%0A%0A` +
        `Quedamos a su disposición para cualquier consulta.`;

      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      
      alert('Se ha descargado la cotización en PDF. Por favor, adjúntala manualmente en el chat de WhatsApp que se ha abierto.');
    } catch (error) {
      console.error('Error sending WhatsApp PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al generar el PDF para WhatsApp: ${errorMsg}\n\nPor favor, intenta descargar el PDF manualmente e intenta de nuevo.`);
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

  // Find other check-ins with matching serial number
  const serialHistory = checkIns
    .filter(c => 
      c.id !== checkIn.id && 
      checkIn.printer?.serialNumber &&
      c.printer?.serialNumber && 
      c.printer.serialNumber.trim().toLowerCase() === checkIn.printer.serialNumber.trim().toLowerCase()
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isCreatingQuote || isEditingQuote) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 pb-20 animate-in fade-in zoom-in-95 duration-200">
        {/* Compact Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 px-5 py-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsCreatingQuote(false);
                setIsEditingQuote(false);
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                Nueva Pantalla de Trabajo
              </span>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-1">
                {isEditingQuote ? 'Editar' : 'Crear'} Cotización de Servicio
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Cliente: <span className="font-bold text-slate-700">{checkIn.client?.name}</span> | Equipo: <span className="font-bold text-slate-700">{checkIn.printer?.brand} {checkIn.printer?.model}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => {
                setIsCreatingQuote(false);
                setIsEditingQuote(false);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveQuote}
              className="btn-tactile px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cotización</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Items List (Spans 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Conceptos y Precios de la Cotización</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuoteItem}
                  className="btn-tactile px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Concepto</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {quoteItems.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3 relative group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-mono font-black flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Concepto #{index + 1}</span>
                      </div>

                      {quoteItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuoteItem(index)}
                          className="px-2 py-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Eliminar concepto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="text-[10px]">Eliminar</span>
                        </button>
                      )}
                    </div>

                    {/* Row 1: Description & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Descripción o Nombre del Concepto *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description || ''}
                          onChange={(e) => handleQuoteItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Ej. Cambio de almohadillas, Servicio de mantenimiento general..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Tipo / Categoría
                        </label>
                        <select
                          value={item.category || 'Servicio'}
                          onChange={(e) => handleQuoteItemChange(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                          <option value="Servicio">Servicio</option>
                          <option value="Refacción">Refacción</option>
                          <option value="Reparación">Reparación</option>
                          <option value="Consumible">Consumible</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Note / Compatible Models & Cost / Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Nota / Modelos Compatibles (Opcional)
                        </label>
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => handleQuoteItemChange(index, 'notes', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Ej. Compatible con L3110, L3150 / Garantía 30 días"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Costo para Mí
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cost || ''}
                            onChange={(e) => handleQuoteItemChange(index, 'cost', parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-right text-emerald-600 font-mono"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          Precio al Cliente *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 text-xs font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={item.price || ''}
                            onChange={(e) => handleQuoteItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-indigo-50/30 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-right font-mono"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & IVA Box */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                {/* IVA Selector Row */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">¿Añadir IVA?</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {quoteTaxRate}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => { setQuoteTaxRate(0); setIsCustomQuoteTax(false); }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        quoteTaxRate === 0 && !isCustomQuoteTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => { setQuoteTaxRate(8); setIsCustomQuoteTax(false); }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        quoteTaxRate === 8 && !isCustomQuoteTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      8% (Frontera)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setQuoteTaxRate(16); setIsCustomQuoteTax(false); }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        quoteTaxRate === 16 && !isCustomQuoteTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      16% (Estándar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomQuoteTax(true)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        isCustomQuoteTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Otro %
                    </button>
                  </div>
                </div>

                {isCustomQuoteTax && (
                  <div className="flex items-center justify-end gap-2 pr-1">
                    <span className="text-xs text-slate-500 font-bold">Porcentaje IVA:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={quoteTaxRate || ''}
                        onChange={(e) => setQuoteTaxRate(parseFloat(e.target.value) || 0)}
                        placeholder="%"
                        className="w-full px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-900 text-right pr-6 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                )}

                {/* Subtotal and Total Summary */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    {quoteTaxRate > 0 && (
                      <p className="text-xs text-slate-500 font-medium">
                        Subtotal: <span className="font-bold font-mono text-slate-700">${quoteSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span> + IVA ({quoteTaxRate}%): <span className="font-bold font-mono text-indigo-600">${quoteTaxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </p>
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Final Cotizado</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">
                      ${totalQuote.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Catalog Quick Finder (Spans 1) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 max-h-[600px] flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
                <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">Agregar del Catálogo</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Toque para agregar instantáneamente</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar refacciones o servicios..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Catalog Items list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProductToQuote(product)}
                      className="w-full p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/80 active:scale-98 transition-all text-left flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">
                          {product.category}
                        </p>
                        {product.compatibleModels && (
                          <p className="text-[9px] text-indigo-600 font-bold truncate mt-0.5" title={product.compatibleModels}>
                            Compatibilidad: {product.compatibleModels}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-indigo-600">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400">Stock: {product.stock}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Barcode className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-[11px] font-bold">No se encontraron refacciones</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16 print:max-w-none print:space-y-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-white rounded-2xl border border-slate-200/80 px-5 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate leading-tight">
              {checkIn.printer?.brand} {checkIn.printer?.model}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono font-bold leading-none mt-0.5">
              Folio: #{checkIn.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          {/* Quick Call & WhatsApp if client has phone */}
          {checkIn.client?.phone && (
            <div className="flex items-center gap-1.5 sm:hidden">
              <a
                href={`tel:${checkIn.client.phone.replace(/\s+/g, '')}`}
                className="min-h-[38px] px-3 bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200/60 rounded-xl flex items-center justify-center transition-all text-xs font-bold"
                title="Llamar"
              >
                Llamar
              </a>
              <a
                href={`https://wa.me/${checkIn.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${checkIn.client.name}, le contactamos de PrintFix sobre su equipo ${checkIn.printer.brand} ${checkIn.printer.model} (Folio #${checkIn.id.slice(0, 8).toUpperCase()}).`)}`}
                target="_blank"
                rel="noreferrer"
                className="min-h-[38px] px-3 bg-emerald-50 active:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1 transition-all"
                title="WhatsApp"
              >
                WhatsApp
              </a>
            </div>
          )}

          <div className="relative flex-1 sm:flex-initial">
            <select
              value={checkIn.printer?.status || 'Ingresado'}
              onChange={(e) => onUpdateStatus(checkIn.id, e.target.value as any)}
              className={`w-full sm:w-auto min-h-[38px] text-xs font-black uppercase tracking-wider rounded-xl px-4 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all pr-8 ${getStatusStyles(checkIn.printer?.status || 'Ingresado')}`}
            >
              <option value="Ingresado">Ingresado</option>
              <option value="Cotizado">Cotizado</option>
              <option value="Aceptado">Aceptado</option>
              <option value="Reparado">Reparado</option>
              <option value="Entregado">Entregado</option>
            </select>
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="min-h-[38px] px-3.5 flex items-center justify-center gap-1.5 text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 border border-red-200 rounded-xl transition-all cursor-pointer shrink-0 text-xs font-bold"
            title="Eliminar ingreso"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eliminar</span>
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

      {/* Main Grid: Multi-panel compact view to see everything on screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch print:hidden">
        {/* Left Columns: General Info (Client & Printer Details, Notes, and History) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          
          {/* Card 1: Integrated Client & Equipment Specs Side-By-Side */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Side: Client Info */}
              <div className="space-y-4 pr-0 md:pr-4 md:border-r border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-black text-slate-900 tracking-tight text-sm">Información del Cliente</h3>
                  </div>
                  {!isEditingClient && (
                    <button
                      onClick={() => {
                        setEditClientForm(checkIn.client);
                        setIsEditingClient(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-lg flex items-center gap-1 transition-all cursor-pointer min-h-[32px]"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {isEditingClient ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre</label>
                      <input
                        type="text"
                        value={editClientForm.name}
                        onChange={e => setEditClientForm({...editClientForm, name: e.target.value})}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
                        <input
                          type="text"
                          value={editClientForm.phone}
                          onChange={e => setEditClientForm({...editClientForm, phone: e.target.value})}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo (Opcional)</label>
                        <input
                          type="email"
                          value={editClientForm.email || ''}
                          onChange={e => setEditClientForm({...editClientForm, email: e.target.value})}
                          placeholder="juan@correo.com (Opcional)"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Dirección</label>
                      <input
                        type="text"
                        value={editClientForm.address || ''}
                        onChange={e => setEditClientForm({...editClientForm, address: e.target.value})}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsEditingClient(false)}
                        className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveClient}
                        className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Nombre del Cliente</p>
                        <p className="text-sm font-black text-slate-900">{checkIn.client?.name || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Contacto Directo</p>
                          <p className="text-xs font-black text-slate-900">{checkIn.client?.phone || 'N/A'}</p>
                        </div>
                        {checkIn.client?.phone && (
                          <div className="flex gap-1 mt-2">
                            <a
                              href={`tel:${checkIn.client.phone.replace(/\s+/g, '')}`}
                              className="px-2 py-0.5 bg-slate-200/70 hover:bg-slate-200 text-slate-700 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all"
                            >
                              Llamar
                            </a>
                            <a
                              href={`https://wa.me/${checkIn.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${checkIn.client.name}, le contactamos de PrintFix sobre su equipo ${checkIn.printer.brand} ${checkIn.printer.model} (Folio #${checkIn.id.slice(0, 8).toUpperCase()}).`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[9px] font-black flex items-center gap-1 transition-all"
                            >
                              WA
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
                        <p className="text-xs font-bold text-slate-600 truncate">{checkIn.client?.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Ubicación</p>
                      <p className="text-xs font-bold text-slate-600 truncate">{checkIn.client?.address || 'No registrada'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Equipment Info */}
              <div className="space-y-4 pl-0 md:pl-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Printer className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-black text-slate-900 tracking-tight text-sm">Detalles del Equipo</h3>
                  </div>
                  {!isEditingPrinter && (
                    <button
                      onClick={() => {
                        setEditPrinterForm(checkIn.printer);
                        setIsEditingPrinter(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-lg flex items-center gap-1 transition-all cursor-pointer min-h-[32px]"
                      title="Editar equipo"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {isEditingPrinter ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Marca</label>
                        <input
                          type="text"
                          value={editPrinterForm.brand}
                          onChange={e => setEditPrinterForm({...editPrinterForm, brand: e.target.value})}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Modelo</label>
                        <input
                          type="text"
                          value={editPrinterForm.model}
                          onChange={e => setEditPrinterForm({...editPrinterForm, model: e.target.value})}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Número de Serie</label>
                      <input
                        type="text"
                        value={editPrinterForm.serialNumber || ''}
                        onChange={e => setEditPrinterForm({...editPrinterForm, serialNumber: e.target.value})}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all uppercase"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsEditingPrinter(false)}
                        className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSavePrinter}
                        className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Marca / Modelo</p>
                        <p className="text-xs font-black text-slate-900 truncate">{checkIn.printer?.brand} {checkIn.printer?.model}</p>
                      </div>
                      <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Número de Serie</p>
                        <p className="text-xs font-black text-slate-900 font-mono truncate uppercase">
                          {checkIn.printer?.serialNumber || 'Sin Registrar'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[96px]">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Problema Reportado</p>
                          <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Activo</span>
                        </div>
                        <p className="text-xs font-medium text-slate-200 leading-relaxed italic line-clamp-3">
                          "{checkIn.printer?.problem || 'No especificado'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Card 2: Tracking Notes & Serial Re-entry History Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tracking Notes */}
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                    <History className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h3 className="font-black text-slate-900 tracking-tight text-xs">Notas de Seguimiento Internas</h3>
                </div>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2 flex-1 flex flex-col">
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none h-20 resize-none transition-all flex-1"
                    placeholder="Agrega notas sobre el progreso..."
                  />
                  <div className="flex justify-end gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setNotes(checkIn.notes || '');
                        setIsEditingNotes(false);
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        onUpdateNotes(checkIn.id, notes);
                        setIsEditingNotes(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/70 rounded-xl p-3 text-xs text-slate-600 font-medium border border-slate-100 flex-1 min-h-[84px] max-h-[110px] overflow-y-auto leading-relaxed scrollbar-thin">
                  {checkIn.notes ? (
                    <p className="whitespace-pre-wrap">{checkIn.notes}</p>
                  ) : (
                    <p className="text-slate-400 italic">No hay notas registradas para este equipo.</p>
                  )}
                </div>
              )}
            </section>

            {/* Serial Number Re-entry History */}
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <h3 className="font-black text-slate-900 tracking-tight text-xs">Historial por Número de Serie</h3>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                  {serialHistory.length} Reingreso{serialHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex-1 min-h-[84px] max-h-[110px] overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin">
                {serialHistory.length > 0 ? (
                  serialHistory.map((past, idx) => (
                    <div key={past.id || idx} className="p-2 bg-slate-50/70 rounded-xl border border-slate-100/80 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-[11px] truncate">
                          Fecha: {new Date(past.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate italic">
                          Falla: "{past.printer.problem}"
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border shrink-0 ${getStatusStyles(past.printer.status)}`}>
                        {past.printer.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-3 italic text-center text-[11px]">
                    <p>No se registran reingresos anteriores para este número de serie.</p>
                  </div>
                )}
              </div>
            </section>

          </div>

        </div>

        {/* Right Column: Quotes Options A and B (Two Pricing Schemes) */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight text-xs sm:text-sm">Opciones de Cotización</h3>
                  <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">Ofrece hasta 2 alternativas al cliente</p>
                </div>
              </div>

              {/* Dynamic Option Selector A and B Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/40 mb-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveQuoteOption('quote')}
                  className={`py-2 px-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[46px] ${
                    activeQuoteOption === 'quote'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  <span className="flex items-center gap-1 leading-none text-center">
                    Opción A (Estándar)
                    {checkIn.quote && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                    )}
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold leading-none">
                    {checkIn.quote ? `$${checkIn.quote.total.toLocaleString('es-MX')}` : 'Vacía'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuoteOption('quoteB')}
                  className={`py-2 px-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[46px] ${
                    activeQuoteOption === 'quoteB'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  <span className="flex items-center gap-1 leading-none text-center">
                    Opción B (Premium)
                    {checkIn.quoteB && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                    )}
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold leading-none">
                    {checkIn.quoteB ? `$${checkIn.quoteB.total.toLocaleString('es-MX')}` : 'Vacía'}
                  </span>
                </button>
              </div>

              {/* Selected Option Content */}
              {checkIn[activeQuoteOption] ? (
                <div className="space-y-4 flex flex-col">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        checkIn[activeQuoteOption]!.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {checkIn[activeQuoteOption]!.status === 'sent' ? 'Enviada' : 'Borrador'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {checkIn[activeQuoteOption]!.status === 'sent' ? (
                          <button
                            onClick={() => onUnlockQuote(checkIn.id, activeQuoteOption)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                            title="Desbloquear cotización"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditQuote(activeQuoteOption)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              Editar
                            </button>
                            {onDeleteQuote && (
                              <button
                                onClick={() => setShowDeleteQuoteModal(true)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                title="Eliminar cotización"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compact Itemized Table */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-xs border-b border-slate-150 pb-2 scrollbar-thin">
                      {(checkIn[activeQuoteOption]!.items || []).map((item, idx) => (
                        <div key={item.id || idx} className="flex justify-between items-start gap-2 text-xs pb-1.5 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="min-w-0 pr-1 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-800 font-bold truncate max-w-[180px]">{item.description}</span>
                              {item.category && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-black text-slate-900 shrink-0 font-mono">${(Number(item.price) || 0).toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2.5 space-y-1">
                      {((checkIn[activeQuoteOption]!.taxRate && checkIn[activeQuoteOption]!.taxRate! > 0) || (checkIn[activeQuoteOption]!.subtotal && checkIn[activeQuoteOption]!.subtotal !== checkIn[activeQuoteOption]!.total)) && (
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>Subtotal: ${(checkIn[activeQuoteOption]!.subtotal ?? checkIn[activeQuoteOption]!.items.reduce((s, i) => s + (Number(i.price) || 0), 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          <span className="text-indigo-600 font-bold">+ IVA ({checkIn[activeQuoteOption]!.taxRate || 0}%): ${(checkIn[activeQuoteOption]!.taxAmount ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Total Opción</span>
                        <span className="text-2xl font-black text-indigo-600 font-mono tracking-tighter">${checkIn[activeQuoteOption]!.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="space-y-2 pt-2 shrink-0 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveShareQuote(activeQuoteOption);
                        setShowQuoteSheet(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer min-h-[38px]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Hoja de Cotización (Imprimir / PDF)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSendWhatsApp(activeQuoteOption)}
                        disabled={isGeneratingPdf}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#128C7E] active:scale-98 text-white text-[11px] font-black rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer min-h-[36px]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveShareQuote(activeQuoteOption);
                          setShowQRModal(true);
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-[11px] font-black rounded-xl shadow-xs transition-all cursor-pointer min-h-[36px]"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Código QR</span>
                      </button>
                    </div>

                    {checkIn[activeQuoteOption]!.status !== 'sent' && (
                      <button
                        onClick={() => onMarkQuoteAsSent(checkIn.id, activeQuoteOption)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-xl shadow-xs transition-all cursor-pointer min-h-[36px]"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Bloquear para Envío
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4 flex flex-col justify-center flex-1">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                    <FileText className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800">Esta opción no ha sido cotizada</p>
                    <p className="text-[10px] text-slate-400 font-medium px-4">Proporciona un presupuesto alternativo o premium para dar opciones al cliente.</p>
                  </div>
                  <button
                    onClick={() => {
                      setQuoteItems([{ description: '', price: 0, cost: 0 }]);
                      setIsCreatingQuote(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer mx-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cotizar Opción {activeQuoteOption === 'quote' ? 'A (Estándar)' : 'B (Premium)'}</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showQuoteSheet && (
        <QuoteSheet 
          checkIn={{
            ...checkIn,
            quote: activeShareQuote === 'quoteB' ? checkIn.quoteB : checkIn.quote
          }} 
          onClose={() => setShowQuoteSheet(false)} 
        />
      )}

      {showQRModal && (
        <QuoteQRModal 
          checkIn={{
            ...checkIn,
            quote: activeShareQuote === 'quoteB' ? checkIn.quoteB : checkIn.quote
          }} 
          onClose={() => setShowQRModal(false)} 
        />
      )}

      {/* Delete Quote Confirmation Modal */}
      {showDeleteQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                ¿Eliminar Cotización ({activeQuoteOption === 'quote' ? 'Opción A' : 'Opción B'})?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                Se borrarán los conceptos y el cálculo de esta alternativa. Podrás crear una nueva cotización cuando lo desees.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteQuoteModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteQuote) {
                    onDeleteQuote(checkIn.id, activeQuoteOption);
                  }
                  setShowDeleteQuoteModal(false);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Seleccionar del Catálogo</h3>
              <button onClick={() => setShowProductPicker(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProductToQuote(product)}
                    className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">{product.name}</p>
                      <p className="text-[10px] text-slate-500">{product.category}</p>
                      {product.compatibleModels && (
                        <p className="text-[9px] text-indigo-600 font-bold mt-0.5 truncate max-w-sm">
                          Compatibilidad: {product.compatibleModels}
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-black text-indigo-600">${product.price.toFixed(2)}</p>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No se encontraron productos en el catálogo.
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowProductPicker(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden printable area for PDF generation */}
      <div id="pdf-capture-area" style={{ position: 'absolute', left: '-2000px', top: '0', width: '800px', zIndex: -100, pointerEvents: 'none' }}>
        <QuotePrintable 
          checkIn={{
            ...checkIn,
            quote: activeShareQuote === 'quoteB' ? checkIn.quoteB : checkIn.quote
          }} 
          printRef={hiddenPrintRef} 
        />
      </div>
    </div>
  );
}
