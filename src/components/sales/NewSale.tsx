import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sale, Client, Product, SaleItem } from '../../types';
import { Save, Search, ArrowLeft, Plus, Trash2, User, Phone, Mail, MapPin, UserPlus, CheckCircle2, Percent, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewSaleProps {
  onSave: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  clients: Client[];
  products: Product[];
  isSaving: boolean;
  onAddProduct?: (product: Omit<Product, 'id'>) => Promise<void> | void;
}

export function NewSale({ onSave, onCancel, clients, products, isSaving, onAddProduct }: NewSaleProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    notes: '',
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isCustomTax, setIsCustomTax] = useState<boolean>(false);

  const matchingClients = useMemo(() => {
    const term = formData.clientName.trim().toLowerCase();
    if (!term || term.length < 1 || selectedClient) return [];

    return clients.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(term);
      const phoneMatch = (c.phone || '').includes(term);
      const emailMatch = (c.email || '').toLowerCase().includes(term);
      return nameMatch || phoneMatch || emailMatch;
    }).slice(0, 5);
  }, [formData.clientName, clients, selectedClient]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.compatibleModels || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (selectedClient && name.startsWith('client')) {
      setSelectedClient(null);
    }
    if (name === 'clientName') {
      setShowSuggestions(true);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientName: client.name || '',
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
      clientAddress: client.address || '',
    }));
    setShowSuggestions(false);
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    
    const client = clients.find(c => c.id === selectedId);
    if (client) {
      selectClient(client);
    }
  };

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
          : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
        cost: product.cost || 0,
        category: product.category || 'Refacción',
        notes: product.compatibleModels || product.description || ''
      }];
    });
    setSearchTerm('');
  };

  const addCustomItem = (name: string) => {
    const customId = `custom-${Math.random().toString(36).substring(2, 11)}`;
    setItems(prev => [
      ...prev,
      {
        productId: customId,
        name: name.trim(),
        quantity: 1,
        unitPrice: 0,
        total: 0,
        cost: 0,
        category: 'Refacción',
        notes: ''
      }
    ]);
    setSearchTerm('');
  };

  const updateName = (index: number, name: string) => {
    setItems(prev => prev.map((item, i) => i === index 
      ? { ...item, name }
      : item
    ));
  };

  const updateCategory = (index: number, category: string) => {
    setItems(prev => prev.map((item, i) => i === index 
      ? { ...item, category }
      : item
    ));
  };

  const updateNotes = (index: number, notes: string) => {
    setItems(prev => prev.map((item, i) => i === index 
      ? { ...item, notes }
      : item
    ));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map((item, i) => i === index 
      ? { ...item, quantity, total: quantity * item.unitPrice }
      : item
    ));
  };

  const updatePrice = (index: number, unitPrice: number) => {
    if (unitPrice < 0) return;
    setItems(prev => prev.map((item, i) => i === index 
      ? { ...item, unitPrice, total: item.quantity * unitPrice }
      : item
    ));
  };

  const updateCost = (index: number, cost: number) => {
    if (cost < 0) return;
    setItems(prev => prev.map((item, i) => i === index 
      ? { ...item, cost }
      : item
    ));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Financial calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = Math.min(subtotal, Math.max(0, discount || 0));
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableBase * (taxRate || 0)) / 100;
  const total = taxableBase + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Debes agregar al menos un artículo a la cotización.');
      return;
    }

    // Auto-save custom items to catalog if onAddProduct is available
    items.forEach(async (item) => {
      if (item.productId.startsWith('custom-') && onAddProduct) {
        try {
          await onAddProduct({
            name: item.name,
            price: item.unitPrice,
            cost: item.cost || 0,
            category: item.category || 'Refacción',
            description: item.notes || 'Auto-guardado desde venta directa',
            compatibleModels: item.notes || ''
          });
          console.log(`Auto-guardado en catálogo de repuestos: ${item.name}`);
        } catch (e) {
          console.error('Error auto-saving item to product catalog from sales:', e);
        }
      }
    });

    onSave({
      client: {
        id: selectedClient?.id,
        name: formData.clientName,
        phone: formData.clientPhone,
        email: formData.clientEmail,
        address: formData.clientAddress,
      },
      items,
      subtotal,
      discount: discountAmount,
      taxRate,
      taxAmount,
      total,
      status: 'draft',
      notes: formData.notes,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-28 px-2 sm:px-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="p-3 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Nueva Venta / Cotización
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Registra una cotización o venta de piezas, refacciones y servicios
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl">
            <span className="text-xs font-bold text-indigo-700">Artículos: {items.length}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-sm font-black text-indigo-900 font-mono">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Left Workspace: (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Box 1: Datos del Cliente (Spacious, Clear, Full Width) */}
            <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Datos del Cliente</h2>
                    <p className="text-xs text-slate-400 font-medium">Información para la cotización o venta</p>
                  </div>
                </div>

                {/* Quick Client Select from Directory */}
                {clients.length > 0 && (
                  <div className="w-full sm:w-64">
                    <select
                      onChange={handleClientSelect}
                      value={selectedClient?.id || ''}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                      <option value="">Buscar cliente frecuente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedClient && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-xs text-indigo-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Cliente frecuente seleccionado: <strong>{selectedClient.name}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setFormData(prev => ({ ...prev, clientName: '', clientPhone: '', clientEmail: '', clientAddress: '' }));
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {/* Client Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Nombre Completo */}
                <div className="md:col-span-2 space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Nombre Completo *
                    </label>
                    {matchingClients.length > 0 && showSuggestions && (
                      <span className="text-[10px] font-bold text-indigo-600 animate-pulse">
                        {matchingClients.length} registrado{matchingClients.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      name="clientName"
                      required
                      value={formData.clientName}
                      onChange={handleChange}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="Ej. Público en General, Empresa SA de CV..."
                    />
                  </div>

                  {/* Autocomplete Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && matchingClients.length > 0 && !selectedClient && (
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-2 space-y-1.5"
                      >
                        <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Clientes Registrados Encontrados
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold">Toca para seleccionar</span>
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1">
                          {matchingClients.map((client, idx) => (
                            <div
                              key={client.id || idx}
                              onClick={() => selectClient(client)}
                              className="p-2.5 rounded-xl hover:bg-indigo-50/80 active:bg-indigo-100 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                  {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                                    {client.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium truncate">
                                    {client.phone || client.email || 'Sin contacto'}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectClient(client);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>Añadir</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="Ej. +52 123 456 7890"
                    />
                  </div>
                </div>

                {/* Correo Electrónico (Opcional) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Correo Electrónico (Opcional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="correo@ejemplo.com (Opcional)"
                    />
                  </div>
                </div>

                {/* Dirección (Opcional) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Dirección (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="Calle, Número, Colonia, Ciudad..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Box 2: Agregar Refacciones / Servicios (Wide, Comfortable, Clean) */}
            <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Agregar Refacciones / Servicios</h2>
                    <p className="text-xs text-slate-400 font-medium">Busca en el catálogo o agrega conceptos personalizados</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addCustomItem('')}
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Concepto</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar refacción o servicio en el catálogo por nombre o modelo compatible..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Search Results Drawer */}
              {searchTerm && (
                <div className="border border-slate-200 rounded-2xl p-2.5 space-y-1.5 bg-slate-50/50">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                      No se encontraron coincidencias exactas en el catálogo.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredProducts.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => addItem(p)}
                          className="flex items-center justify-between p-3 bg-white hover:bg-indigo-50/80 border border-slate-200/80 rounded-xl cursor-pointer transition-all hover:border-indigo-200 shadow-2xs group"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{p.category} {p.compatibleModels ? `• ${p.compatibleModels}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black text-indigo-600 font-mono">${p.price.toLocaleString('es-MX')}</span>
                            <span className="p-1.5 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 rounded-lg transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Custom Item Add Trigger */}
                  <div 
                    onClick={() => addCustomItem(searchTerm)}
                    className="p-3 bg-indigo-50/60 hover:bg-indigo-50 border border-dashed border-indigo-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-[10px] font-black text-indigo-900 uppercase tracking-wider">¿No está en el catálogo?</p>
                      <p className="text-xs text-indigo-700 font-bold mt-0.5">Crear concepto personalizado: "{searchTerm}"</p>
                    </div>
                    <span className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs shrink-0">
                      Agregar +
                    </span>
                  </div>
                </div>
              )}

              {/* Items List Table */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Artículos en la Venta ({items.length})
                  </h3>
                </div>

                {items.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 space-y-1">
                    <p className="text-sm text-slate-600 font-bold">No hay artículos agregados todavía</p>
                    <p className="text-xs text-slate-400">Busca en el catálogo arriba o haz clic en "Nuevo Concepto"</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
                        
                        {/* Upper Row: Item Name & Category Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            {item.productId.startsWith('custom-') ? (
                              <div className="space-y-1">
                                <label className="block text-[9px] font-black uppercase tracking-wider text-indigo-600">
                                  Nombre del Concepto *
                                </label>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateName(index, e.target.value)}
                                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                  placeholder="Ej. Cambio de fusible, Rodillo de arrastre..."
                                  required
                                />
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Concepto Seleccionado</span>
                                <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate">{item.name}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                              Tipo / Categoría
                            </label>
                            <select
                              value={item.category || 'Refacción'}
                              onChange={(e) => updateCategory(index, e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                              <option value="Refacción">Refacción</option>
                              <option value="Servicio">Servicio</option>
                              <option value="Reparación">Reparación</option>
                              <option value="Consumible">Consumible</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                        </div>

                        {/* Middle Row: Note / Modelos Compatibles */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Nota / Modelos Compatibles (Opcional)
                          </label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => updateNotes(index, e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400"
                            placeholder="Ej. Compatible con Epson L3110, HP M402 / Garantía 30 días..."
                          />
                        </div>

                        {/* Lower Row: Aligned inputs and metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center pt-2.5 border-t border-slate-200/60">
                          {/* Quantity */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>

                          {/* Cost */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Costo para Mí</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.cost || ''}
                                onChange={(e) => updateCost(index, parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 font-mono text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Price */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-black uppercase tracking-wider text-indigo-600">Precio al Cliente</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500 text-xs font-bold">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-2.5 py-2 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 font-mono text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              />
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="space-y-1 text-right sm:text-center">
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Total Fila</label>
                            <p className="text-xs sm:text-sm font-mono font-black text-slate-900 py-2 leading-none">
                              ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-4">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="px-3 py-1.5 text-red-500 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                              title="Eliminar artículo"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Panel: Resumen de Cuenta & IVA Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-7 space-y-6 shadow-xl sticky top-20 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  Resumen de Cuenta
                </h3>
                <span className="text-xs font-bold text-slate-400">{items.length} {items.length === 1 ? 'ítem' : 'ítems'}</span>
              </div>
              
              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-sm text-slate-300">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold font-mono text-white">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {/* Descuento */}
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="font-semibold">Descuento ($)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-28 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold font-mono text-right text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* IVA / Impuestos Section */}
                <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-indigo-400" />
                      ¿Añadir IVA?
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 font-mono">
                      {taxRate}%
                    </span>
                  </div>

                  {/* IVA Presets Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => { setTaxRate(0); setIsCustomTax(false); }}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        taxRate === 0 && !isCustomTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-700/70 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTaxRate(8); setIsCustomTax(false); }}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        taxRate === 8 && !isCustomTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-700/70 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      8%
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTaxRate(16); setIsCustomTax(false); }}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        taxRate === 16 && !isCustomTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-700/70 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      16%
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomTax(true)}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        isCustomTax
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-700/70 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      Otro
                    </button>
                  </div>

                  {/* Custom IVA input */}
                  {isCustomTax && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-400 font-medium">Porcentaje IVA:</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={taxRate || ''}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          placeholder="%"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-xl text-xs font-bold font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none text-right pr-6"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                  )}

                  {/* Calculated IVA row */}
                  <div className="flex justify-between text-xs font-medium text-slate-300 pt-1 border-t border-slate-700/50">
                    <span>Monto IVA ({taxRate}%):</span>
                    <span className="font-bold font-mono text-indigo-300">+${taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Total Final */}
                <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Total Final</span>
                    {taxRate > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">Incluye {taxRate}% de IVA</span>
                    )}
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Notas / Observaciones */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles sobre garantía, entrega o condiciones..."
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving || items.length === 0}
                className="btn-tactile w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Venta'}</span>
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
