import React, { useState } from 'react';
import { Sale, Client, Product, SaleItem } from '../../types';
import { Save, Search, ArrowLeft, Plus, Trash2, User, Phone, Mail, MapPin } from 'lucide-react';

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

  const [items, setItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    
    const client = clients.find(c => c.id === selectedId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.name,
        clientPhone: client.phone,
        clientEmail: client.email || '',
        clientAddress: client.address || '',
      }));
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
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onCancel}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all"
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
                
                {clients.length > 0 && (
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Nombre Completo *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      name="clientName"
                      required
                      value={formData.clientName}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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

            {/* Items */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Artículos</h2>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
                
                {searchTerm && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addItem(product)}
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{product.name}</p>
                          </div>
                          <p className="font-black text-indigo-600">${product.price.toFixed(2)}</p>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        No se encontraron productos
                      </div>
                    )}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-bold uppercase">Cant.</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-center focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-bold uppercase">Precio</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-right focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="w-24 text-right">
                          <p className="font-black text-slate-900">${item.total.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Resumen</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Descuento</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-right font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-900 font-black">Total</span>
                  <span className="text-2xl font-black text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={isSaving || items.length === 0}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 group disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar Cotización'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full mt-4 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Notas adicionales</h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                placeholder="Notas internas o comentarios para el cliente..."
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
