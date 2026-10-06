import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CheckIn, Client } from '../types';
import { 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Printer, 
  ArrowLeft, 
  UserCheck, 
  UserPlus,
  Barcode, 
  ShieldCheck, 
  X,
  Sparkles,
  Wrench,
  Tag,
  CheckCircle2,
  ChevronDown,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewCheckInProps {
  onSave: (checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  checkIns?: CheckIn[];
  clients?: Client[];
  isSaving?: boolean;
}

const POPULAR_BRANDS = ['Epson', 'HP', 'Canon', 'Brother', 'Kyocera', 'Samsung', 'Zebra', 'Ricoh'];

const COMMON_PROBLEMS = [
  'No enciende',
  'Atasco de papel',
  'Almohadillas llenas / Reset',
  'No jala papel',
  'Líneas blancas / Rayas',
  'Error de carro / Atasco',
  'Mantenimiento preventivo',
  'Derrame de tinta'
];

export function NewCheckIn({ onSave, onCancel, checkIns = [], clients = [], isSaving = false }: NewCheckInProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    printerBrand: '',
    printerModel: '',
    printerSerialNumber: '',
    printerProblem: '',
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const clientNameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Consolidate unique clients list
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map<string, Client>();
    
    clients.forEach(c => {
      const key = (c.id || c.email || c.phone || c.name || '').toLowerCase().trim();
      if (key) clientsMap.set(key, c);
    });

    checkIns.forEach(c => {
      if (!c.client) return;
      const key = (c.client.id || c.client.email || c.client.phone || c.client.name || '').toLowerCase().trim();
      if (key && !clientsMap.has(key)) {
        clientsMap.set(key, c.client);
      }
    });

    return Array.from(clientsMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [clients, checkIns]);

  // Filter clients matching typed name / phone / email
  const matchingClients = useMemo(() => {
    const term = formData.clientName.trim().toLowerCase();
    if (!term || term.length < 1 || selectedClient) return [];

    return uniqueClients.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(term);
      const phoneMatch = (c.phone || '').includes(term);
      const emailMatch = (c.email || '').toLowerCase().includes(term);
      return nameMatch || phoneMatch || emailMatch;
    }).slice(0, 5);
  }, [formData.clientName, uniqueClients, selectedClient]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        clientNameInputRef.current &&
        !clientNameInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Serial number history matching
  const matchingSerialCheckIns = useMemo(() => {
    const serialTerm = (formData.printerSerialNumber || '').trim().toLowerCase();
    if (!serialTerm || serialTerm.length < 2) return [];

    return checkIns
      .filter(c => c.printer?.serialNumber && c.printer.serialNumber.trim().toLowerCase() === serialTerm)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [formData.printerSerialNumber, checkIns]);

  const latestSerialCheckIn = matchingSerialCheckIns[0];

  const daysSinceLastDelivery = useMemo(() => {
    if (!latestSerialCheckIn) return null;
    const pastDate = new Date(latestSerialCheckIn.createdAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - pastDate;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [latestSerialCheckIn]);

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

  const handleClearClient = () => {
    setSelectedClient(null);
    setFormData(prev => ({
      ...prev,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (selectedClient && name.startsWith('client')) {
      setSelectedClient(null);
    }
    if (name === 'clientName') {
      setShowSuggestions(true);
    }
  };

  const handleSelectBrand = (brand: string) => {
    setFormData(prev => ({ ...prev, printerBrand: brand }));
  };

  const handleAddProblemTag = (tag: string) => {
    setFormData(prev => {
      const current = prev.printerProblem.trim();
      if (!current) return { ...prev, printerProblem: tag };
      if (current.includes(tag)) return prev;
      return { ...prev, printerProblem: `${current}, ${tag}` };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      client: {
        id: selectedClient?.id,
        name: formData.clientName.trim(),
        phone: formData.clientPhone.trim(),
        email: formData.clientEmail.trim(),
        address: formData.clientAddress.trim(),
      },
      printer: {
        brand: formData.printerBrand.trim(),
        model: formData.printerModel.trim(),
        serialNumber: formData.printerSerialNumber.trim(),
        problem: formData.printerProblem.trim(),
        status: 'Ingresado',
      },
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-7xl mx-auto space-y-3 pb-8"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Compact Header Bar with SINGLE Unified Save Action */}
        <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button 
              type="button"
              onClick={onCancel}
              className="p-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl transition-all cursor-pointer shrink-0"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-display flex items-center gap-1.5 truncate">
                <span>Nuevo Ingreso al Taller</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                  <Sparkles className="w-3 h-3" /> En Vivo
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden md:block truncate">
                Registra los datos del cliente y del equipo en una sola vista.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="hidden sm:block px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            
            {/* The ONLY Save Button on the entire screen */}
            <button
              type="submit"
              disabled={isSaving}
              className="btn-tactile px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isSaving ? 'Guardando...' : 'Guardar Ingreso'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Full Screen Viewport-Optimized Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          
          {/* Card 1: Datos del Cliente */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between space-y-3 relative">
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">1. Datos del Cliente</h2>
                </div>

                {selectedClient ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-200 animate-in fade-in zoom-in-95 duration-150">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cliente Añadido</span>
                    <button
                      type="button"
                      onClick={handleClearClient}
                      className="ml-1 text-emerald-700 hover:text-emerald-950 p-0.5 rounded cursor-pointer"
                      title="Cambiar cliente"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : uniqueClients.length > 0 ? (
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const found = uniqueClients.find(c => (c.id || c.email || c.phone || c.name) === val);
                      if (found) selectClient(found);
                    }}
                    value=""
                    className="text-[11px] font-bold px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 max-w-[180px] sm:max-w-[210px] truncate"
                  >
                    <option value="">👤 Directorio clientes...</option>
                    {uniqueClients.map((client, idx) => (
                      <option key={client.id || idx} value={client.id || client.email || client.phone || client.name}>
                        {client.name} {client.phone ? `(${client.phone})` : ''}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              {/* Client Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5">
                
                {/* Nombre Completo with Interactive Autocomplete Dropdown */}
                <div className="space-y-1 relative sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="clientName" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Nombre Completo *
                    </label>
                    {matchingClients.length > 0 && showSuggestions && (
                      <span className="text-[10px] font-bold text-blue-600 animate-pulse">
                        {matchingClients.length} cliente{matchingClients.length > 1 ? 's' : ''} encontrado{matchingClients.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      ref={clientNameInputRef}
                      type="text"
                      id="clientName"
                      name="clientName"
                      required
                      autoComplete="off"
                      value={formData.clientName}
                      onChange={handleChange}
                      onFocus={() => {
                        setIsNameFocused(true);
                        setShowSuggestions(true);
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                          <span className="text-[10px] text-blue-600 font-semibold">Toca para añadir</span>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-50">
                          {matchingClients.map((client, idx) => (
                            <div
                              key={client.id || idx}
                              onClick={() => selectClient(client)}
                              className="p-2.5 rounded-xl hover:bg-blue-50/80 active:bg-blue-100/80 cursor-pointer transition-all flex items-center justify-between gap-3 group border border-transparent hover:border-blue-100"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
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
                                className="btn-tactile px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs group-hover:scale-102 transition-transform"
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

                <div className="space-y-1">
                  <label htmlFor="clientPhone" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      id="clientPhone"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Ej. 55 1234 5678"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="clientEmail" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Correo Electrónico (Opcional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      id="clientEmail"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="correo@ejemplo.com (Opcional)"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="clientAddress" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Dirección (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      id="clientAddress"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Calle, Número, Colonia"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Los datos del cliente se autocompletan y guardan en el directorio automáticamente.</span>
            </div>
          </div>

          {/* Card 2: Datos del Equipo e Impresora */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">2. Datos del Equipo e Impresora</h2>
                </div>
              </div>

              {/* Dynamic Quick Brand Chips */}
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Marca Rápida:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_BRANDS.map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => handleSelectBrand(brand)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        formData.printerBrand.toLowerCase() === brand.toLowerCase()
                          ? 'bg-slate-900 text-white shadow-xs scale-102'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Printer Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5">
                <div className="space-y-1">
                  <label htmlFor="printerBrand" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Marca *
                  </label>
                  <input
                    type="text"
                    id="printerBrand"
                    name="printerBrand"
                    required
                    value={formData.printerBrand}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ej. Epson, HP, Canon"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="printerModel" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    id="printerModel"
                    name="printerModel"
                    required
                    value={formData.printerModel}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ej. L3150, Smart Tank 515"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="printerSerialNumber" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Número de Serie / S/N
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600">Para control de garantía</span>
                  </div>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      id="printerSerialNumber"
                      name="printerSerialNumber"
                      value={formData.printerSerialNumber}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
                      placeholder="Ej. X7Y908123456"
                    />
                  </div>
                </div>

                {/* S/N Previous History Banner if match */}
                {latestSerialCheckIn && (
                  <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-2 text-xs text-amber-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[10px] font-bold truncate">
                        Equipo registrado ({daysSinceLastDelivery === 0 ? 'hoy' : `hace ${daysSinceLastDelivery}d`})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          printerBrand: latestSerialCheckIn.printer.brand || prev.printerBrand,
                          printerModel: latestSerialCheckIn.printer.model || prev.printerModel,
                          clientName: latestSerialCheckIn.client?.name || prev.clientName,
                          clientPhone: latestSerialCheckIn.client?.phone || prev.clientPhone,
                          clientEmail: latestSerialCheckIn.client?.email || prev.clientEmail,
                          clientAddress: latestSerialCheckIn.client?.address || prev.clientAddress,
                        }));
                      }}
                      className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-md hover:bg-amber-700 cursor-pointer shrink-0"
                    >
                      Autocompletar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic / Problem Card with Interactive Issue Chips */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">3. Falla y Diagnóstico Inicial</h2>
            </div>
            <span className="text-[10px] text-slate-400">Toca para agregar rápido</span>
          </div>

          {/* Interactive Common Problem Chips */}
          <div className="flex flex-wrap gap-1.5">
            {COMMON_PROBLEMS.map(prob => {
              const isSelected = formData.printerProblem.includes(prob);
              return (
                <button
                  key={prob}
                  type="button"
                  onClick={() => handleAddProblemTag(prob)}
                  className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span>{prob}</span>
                </button>
              );
            })}
          </div>

          <div>
            <textarea
              id="printerProblem"
              name="printerProblem"
              required
              rows={2}
              value={formData.printerProblem}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              placeholder="Describe detalladamente la falla o motivo del ingreso..."
            />
          </div>
        </div>

      </form>
    </motion.div>
  );
}
