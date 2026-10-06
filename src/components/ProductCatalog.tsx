import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Tag, 
  Sparkles, 
  Save, 
  ChevronRight,
  DollarSign,
  AlertTriangle,
  FolderOpen,
  Lock,
  EyeOff,
  TrendingUp,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteAllProducts?: () => void;
}

export function ProductCatalog({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onDeleteAllProducts 
}: ProductCatalogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    category: 'Repuesto',
    stock: 0
  });

  const categories = ['Todos', 'Repuesto', 'Servicio', 'Reparación', 'Consumible', 'Otro'];

  const categoryStats = {
    total: products.length,
    repuestos: products.filter(p => p.category === 'Repuesto').length,
    servicios: products.filter(p => p.category === 'Servicio').length,
    reparaciones: products.filter(p => p.category === 'Reparación' || p.category === 'Reparacion').length,
    consumibles: products.filter(p => p.category === 'Consumible').length,
    otros: products.filter(p => p.category === 'Otro').length,
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateProduct(editingId, { ...formData, id: editingId });
      setEditingId(null);
    } else {
      onAddProduct(formData);
    }
    setIsAdding(false);
    setFormData({ name: '', description: '', price: 0, cost: 0, category: 'Repuesto', stock: 0 });
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      cost: product.cost || 0,
      category: product.category || 'Repuesto',
      stock: product.stock || 0
    });
    setEditingId(product.id);
    setIsAdding(true);
  };

  // Profit Margin Calculator
  const estimatedProfit = Math.max(0, (formData.price || 0) - (formData.cost || 0));
  const profitMarginPercent = formData.price > 0 ? ((estimatedProfit / formData.price) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
            Catálogo de Refacciones
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {products.length}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {products.length > 0 && onDeleteAllProducts && (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              Vaciar
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({ name: '', description: '', price: 0, cost: 0, category: 'Repuesto', stock: 0 });
            }}
            className="btn-tactile px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Quick Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const count = cat === 'Todos' ? categoryStats.total :
            cat === 'Repuesto' ? categoryStats.repuestos :
            cat === 'Servicio' ? categoryStats.servicios :
            cat === 'Reparación' ? categoryStats.reparaciones :
            cat === 'Consumible' ? categoryStats.consumibles : categoryStats.otros;

          const isActive = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`p-4 rounded-2xl font-black text-xs flex flex-col justify-between gap-2 border transition-all duration-300 text-left group active:scale-[0.96] hover:scale-[1.02] transform cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10'
                  : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[10px] uppercase font-black tracking-wider ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                {cat}
              </span>
              <div className="flex items-center justify-between w-full">
                <span className="text-base font-black">{cat}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                }`}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add / Edit Form Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8 relative"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingId ? 'Editar Item del Catálogo' : 'Crear Nuevo Item en Catálogo'}
                </h2>
                <p className="text-xs text-slate-400 font-medium">Configura el costo privado de compra y el precio final al cliente</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Producto o Servicio *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    placeholder="Ej: Cabezal de Impresión Epson L3110"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="Repuesto">Repuesto</option>
                    <option value="Servicio">Servicio</option>
                    <option value="Reparación">Reparación</option>
                    <option value="Consumible">Consumible</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Internal Cost Field */}
                <div className="space-y-2 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Costo Interno de Compra ($ MXN)
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">🔒 Solo visible en catálogo</span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost || ''}
                      onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700"
                      placeholder="0.00 (Tu costo de adquisición)"
                    />
                  </div>
                </div>

                {/* Public Sale Price Field */}
                <div className="space-y-2 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1 flex items-center gap-1">
                      Precio de Venta al Cliente ($ MXN) *
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600">Aparecerá en Cotizaciones</span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-5 py-4 bg-indigo-50/40 border border-indigo-200/80 rounded-2xl text-sm font-black text-indigo-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="0.00 (Precio final público)"
                    />
                  </div>
                </div>

                {/* Profit Margin Preview Helper */}
                {formData.price > 0 && (
                  <div className="lg:col-span-4 bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ganancia Neta Estimada por Unidad:</span>
                      <span className="font-black text-sm text-emerald-700">+${estimatedProfit.toFixed(2)} MXN</span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-xl text-[11px] font-black shrink-0">
                      <Percent className="w-3 h-3" /> Margen: {profitMarginPercent}%
                    </div>
                  </div>
                )}

                <div className="space-y-2 lg:col-span-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción (Opcional)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                    placeholder="Detalles sobre compatibilidad, garantía o notas del servicio..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Guardar Cambios' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Search & Action Bar */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o descripción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-bold text-slate-400">
              {filteredProducts.length} de {products.length} productos
            </span>
          </div>
        </div>

        {/* Product List: Mobile Cards (md:hidden) + Desktop Table (hidden md:block) */}
        {filteredProducts.length > 0 ? (
          <>
            {/* Mobile Card Feed */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedProducts.map((product) => {
                const pCost = product.cost || 0;
                const pPrice = product.price || 0;
                const pProfit = Math.max(0, pPrice - pCost);
                const pMargin = pPrice > 0 ? ((pProfit / pPrice) * 100).toFixed(0) : '0';

                return (
                  <div key={product.id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Tag className="w-2.5 h-2.5" />
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mt-1 truncate">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Touch Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="min-h-[42px] min-w-[42px] flex items-center justify-center p-2 text-slate-500 hover:text-indigo-600 active:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(product)}
                          className="min-h-[42px] min-w-[42px] flex items-center justify-center p-2 text-slate-500 hover:text-red-600 active:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Pricing & Margins Card */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Costo Interno
                        </span>
                        <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                          ${pCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Precio Venta
                        </span>
                        <p className="text-sm font-mono font-black text-slate-900 mt-0.5">
                          ${pPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Margen estimado:</span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          +${pProfit.toFixed(2)} ({pMargin}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Item</th>
                  <th className="px-8 py-5">Categoría</th>
                  <th className="px-8 py-5">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-3 h-3" /> Costo Interno
                    </span>
                  </th>
                  <th className="px-8 py-5">Precio Cotización</th>
                  <th className="px-8 py-5">Margen</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map(product => {
                  const pCost = product.cost || 0;
                  const pPrice = product.price || 0;
                  const pProfit = Math.max(0, pPrice - pCost);
                  const pMargin = pPrice > 0 ? ((pProfit / pPrice) * 100).toFixed(0) : '0';

                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-2xl flex items-center justify-center text-slate-400 transition-colors shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-xs text-slate-400 font-medium truncate max-w-xs">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100/60">
                          <Tag className="w-3 h-3" />
                          {product.category}
                        </span>
                      </td>

                      {/* Costo Interno Column (Private) */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <p className="text-sm font-bold text-slate-500">
                            ${pCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium">Privado del taller</span>
                      </td>

                      {/* Precio Público Cotización Column */}
                      <td className="px-8 py-5">
                        <p className="text-base font-black text-slate-900 tracking-tight">
                          ${pPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="text-[9px] text-indigo-600 font-bold">Ver en cotización</span>
                      </td>

                      {/* Profit Margin Column */}
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          +${pProfit.toFixed(2)} ({pMargin}%)
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(product)}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        ) : (
          /* High-Craft Professional Empty State */
          <div className="p-16 text-center space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-600 shadow-lg shadow-indigo-100">
              <FolderOpen className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {products.length === 0 ? 'Catálogo Vacío' : 'Sin Resultados'}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {products.length === 0 
                  ? 'Agrega tus repuestos o servicios registrando su costo de adquisición y el precio final para el cliente.'
                  : `No se encontraron items coincidentes con "${searchTerm}".`}
              </p>
            </div>
            {products.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsAdding(true);
                  setEditingId(null);
                  setFormData({ name: '', description: '', price: 0, cost: 0, category: 'Repuesto', stock: 0 });
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Agregar Primer Producto
              </button>
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs font-bold text-slate-400">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Single Product Confirmation Modal */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">¿Eliminar producto?</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                  Estás a punto de eliminar <span className="font-black text-slate-800">"{deletingProduct.name}"</span> del catálogo.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteProduct(deletingProduct.id);
                    setDeletingProduct(null);
                  }}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Products Confirmation Modal */}
      <AnimatePresence>
        {showClearAllModal && onDeleteAllProducts && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 lg:p-10 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">¿Vaciar catálogo completo?</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                  Esta acción eliminará <span className="font-black text-red-600">{products.length} productos</span> del catálogo. Se sincronizará en todos los dispositivos conectados.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearAllModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteAllProducts();
                    setShowClearAllModal(false);
                  }}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-2xl shadow-xl shadow-red-200 transition-all active:scale-95"
                >
                  Vaciar Todo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
