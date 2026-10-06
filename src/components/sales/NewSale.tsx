import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sale, Client, Product, SaleItem } from '../../types';
import { Save, Search, ArrowLeft, Plus, Trash2, User, Phone, Mail, MapPin, UserPlus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewSaleProps {
  onSave: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  clients: Client[];
  products: Product[];
  isSaving: boolean;
}

export function NewSale({ onSave, onCancel, clients, products, isSaving }: NewSaleProps) {
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
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

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
        total: product.price
      }];
    });
    setSearchTerm('');
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

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Debes agregar al menos un artículo a la cotización.');
      return;
    }

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
      discount,
      total,
      status: 'draft',
      notes: formData.notes,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 pb-36 md:pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onCancel}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Nueva Venta / Cotización</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">Registra una venta de piezas o refacciones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          <div className="lg:col-span-2 space-y-6 md:space-y-10">
            {/* Client Data */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Datos del Cliente</h2>
                </div>
                
                {selectedClient ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cliente Añadido</span>
                  </div>
                ) : clients.length > 0 && (
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <select 
                      onChange={handleClientSelect}
                      className="w-full sm:w-80 pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer transition-all text-slate-600"
                      defaultValue=""
                    >
                      <option value="" disabled>Buscar cliente frecuente...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} — {client.email || client.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                {/* Nombre Completo with Autocomplete Box */}
                <div className="space-y-2 sm:col-span-2 relative">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Nombre Completo *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      name="clientName"
                      required
                      autoComplete="off"
                      value={formData.clientName}
                      onChange={handleChange}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Escribe el nombre del cliente..."
                    />
                  </div>

                  {/* Autocomplete Suggestions Dropdown Box */}
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
                          <span className="text-[10px] text-indigo-600 font-semibold">Toca para añadir</span>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-50">
                          {matchingClients.map((client, idx) => (
                            <div
                              key={client.id || idx}
                              onClick={() => selectClient(client)}
                              className="p-2.5 rounded-xl hover:bg-indigo-50/80 active:bg-indigo-100/80 cursor-pointer transition-all flex items-center justify-between gap-3 group border border-transparent hover:border-indigo-100"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                  {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                                    {client.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                    {client.phone && (
                                      <span className="flex items-center gap-1 font-mono">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        {client.phone}
                                      </span>
                                    )}
                                    {client.email && (
                                      <span className="hidden sm:inline truncate max-w-[140px] text-slate-400">
                                        {client.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectClient(client);
                                }}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-transform"
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

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. +52 123 456 7890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. juan@correo.com"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Dirección (Opcional)
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. Calle Principal 123"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Product Selector */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 space-y-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Agregar Refacciones / Servicios</h2>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo de refacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>

              {searchTerm && (
                <div className="border border-slate-100 rounded-2xl p-2 space-y-1">
                  {filteredProducts.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-400 font-medium">No se encontraron refacciones</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => addItem(p)}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{p.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900">${p.price}</span>
                          <button type="button" className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Items Table */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Artículos en la Venta</h3>
                {items.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-sm text-slate-400 font-medium">No hay refacciones agregadas a esta venta.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Cant:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Precio:</span>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                            />
                          </div>
                          <span className="text-sm font-black text-slate-900 w-20 text-right">
                            ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Totals & Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-xl sticky top-24">
              <h3 className="text-lg font-black tracking-tight">Resumen de Cuenta</h3>
              
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Descuento</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-right text-white"
                  />
                </div>

                <div className="flex justify-between text-lg font-black pt-4 border-t border-slate-800 text-emerald-400">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles sobre la garantía, entrega, etc."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || items.length === 0}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Venta'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
