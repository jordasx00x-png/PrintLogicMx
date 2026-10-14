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
  Barcode, 
  ShieldCheck, 
  X,
  Wrench,
  Tag,
  CheckCircle2,
  DollarSign,
  UserCheck,
  AlertCircle,
  FileText
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
const TECHNICIANS = ['Técnico en Turno', 'Carlos Martínez', 'Roberto Gómez', 'Ing. Alejandro Ramírez', 'Miguel Ángel Torres'];
const PRIORITIES = [
  { id: 'Normal', label: 'Normal (3-5 días)', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Urgente / Express', label: 'Urgente / Express (24 hrs)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'Garantía', label: 'Garantía de Taller', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

const COMMON_PROBLEMS = [
  'No enciende / Corto eléctrico',
  'Atasco de papel frecuente / Rodillos',
  'Almohadillas llenas / Reset necesario',
  'No jala papel / Patín de toma gastado',
  'Líneas blancas / Rayas en impresión',
  'No reconoce cartuchos / tóner / chip',
  'Mantenimiento preventivo completo',
  'Derrame de tinta / Limpieza de cabezales'
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
    advanceDeposit: '',
    assignedTechnician: 'Técnico en Turno',
    priority: 'Normal' as 'Normal' | 'Urgente / Express' | 'Garantía',
    internalNotes: '',
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        assignedTechnician: formData.assignedTechnician,
        priority: formData.priority,
        advanceDeposit: formData.advanceDeposit ? parseFloat(formData.advanceDeposit) : undefined,
      },
      internalNotes: formData.internalNotes.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 font-sans">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Professional Header Bar */}
        <div className="bg-slate-900 text-white rounded-2xl px-6 py-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={onCancel}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-700"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Estación de Recepción Pro
                </span>
                <span className="text-xs text-slate-400 font-mono">TICKET-INTAKE</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display mt-0.5">
                Ingreso de Impresora al Taller
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="btn-tactile px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-blue-400/30"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-white" />
              )}
              <span>{isSaving ? 'Guardando Registro...' : 'Guardar e Imprimir Orden'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Professional Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section 1: Datos del Propietario */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-bold border border-slate-200">
                    <User className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paso 01</span>
                    <h2 className="text-sm font-bold text-slate-900">Información del Propietario</h2>
                  </div>
                </div>

                {selectedClient ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Vinculado</span>
                    <button
                      type="button"
                      onClick={handleClearClient}
                      className="ml-1 text-emerald-700 hover:text-emerald-950 p-0.5 rounded cursor-pointer"
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
                    className="text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10 max-w-[190px] truncate"
                  >
                    <option value="">Directorio de clientes...</option>
                    {uniqueClients.map((client, idx) => (
                      <option key={client.id || idx} value={client.id || client.email || client.phone || client.name}>
                        {client.name} {client.phone ? `(${client.phone})` : ''}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              {/* Fields */}
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label htmlFor="clientName" className="block text-xs font-bold text-slate-700">
                      Nombre Completo o Razón Social <span className="text-rose-500">*</span>
                    </label>
                    {matchingClients.length > 0 && showSuggestions && (
                      <span className="text-[11px] font-semibold text-blue-600">
                        {matchingClients.length} cliente{matchingClients.length > 1 ? 's' : ''} sugerido{matchingClients.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      ref={clientNameInputRef}
                      type="text"
                      id="clientName"
                      name="clientName"
                      required
                      autoComplete="off"
                      value={formData.clientName}
                      onChange={handleChange}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                      placeholder="Ej. Juan Pérez / Empresa S.A."
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && matchingClients.length > 0 && !selectedClient && (
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden p-1.5 space-y-1"
                      >
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          Seleccionar cliente existente
                        </div>
                        {matchingClients.map((client, idx) => (
                          <div
                            key={client.id || idx}
                            onClick={() => selectClient(client)}
                            className="p-2.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">{client.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{client.phone} {client.email ? `• ${client.email}` : ''}</p>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded-md">Vincular</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="clientPhone" className="block text-xs font-bold text-slate-700">
                      Teléfono / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        id="clientPhone"
                        name="clientPhone"
                        required
                        value={formData.clientPhone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        placeholder="Ej. 55 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="clientEmail" className="block text-xs font-bold text-slate-700">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        id="clientEmail"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="clientAddress" className="block text-xs font-bold text-slate-700">
                    Dirección (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="clientAddress"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Calle, Número, Colonia, Ciudad"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Registro automático en directorio
              </span>
              <span className="font-mono text-[11px] text-slate-400">CRM v2</span>
            </div>
          </div>

          {/* Section 2: Datos del Equipo e Impresora */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-bold border border-slate-200">
                    <Printer className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paso 02</span>
                    <h2 className="text-sm font-bold text-slate-900">Especificaciones de la Impresora</h2>
                  </div>
                </div>
              </div>

              {/* Marcas Frecuentes */}
              <div className="pt-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Selección Rápida de Marca
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_BRANDS.map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => handleSelectBrand(brand)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        formData.printerBrand.toLowerCase() === brand.toLowerCase()
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="printerBrand" className="block text-xs font-bold text-slate-700">
                      Marca <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="printerBrand"
                      name="printerBrand"
                      required
                      value={formData.printerBrand}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Ej. Epson, HP, Canon"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="printerModel" className="block text-xs font-bold text-slate-700">
                      Modelo Exacto <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="printerModel"
                      name="printerModel"
                      required
                      value={formData.printerModel}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Ej. L3150, EcoTank, LaserJet"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="printerSerialNumber" className="block text-xs font-bold text-slate-700">
                      Número de Serie / S/N
                    </label>
                    <div className="relative">
                      <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        id="printerSerialNumber"
                        name="printerSerialNumber"
                        value={formData.printerSerialNumber}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 uppercase"
                        placeholder="Ej. X7Y908"
                      />
                    </div>
                  </div>

                  {/* Técnico Asignado */}
                  <div className="space-y-1.5">
                    <label htmlFor="assignedTechnician" className="block text-xs font-bold text-slate-700">
                      Técnico Responsable
                    </label>
                    <div className="relative">
                      <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        id="assignedTechnician"
                        name="assignedTechnician"
                        value={formData.assignedTechnician}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                      >
                        {TECHNICIANS.map(tech => (
                          <option key={tech} value={tech}>{tech}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* S/N Previous History Alert */}
                {latestSerialCheckIn && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">
                          Equipo registrado ({daysSinceLastDelivery === 0 ? 'hoy' : `hace ${daysSinceLastDelivery} días`})
                        </p>
                        <p className="text-[11px] text-amber-700 truncate">
                          Anterior: {latestSerialCheckIn.client?.name} • Estado: {latestSerialCheckIn.printer.status}
                        </p>
                      </div>
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
                      className="text-[11px] font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 cursor-pointer shrink-0"
                    >
                      Autocompletar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Validación de número de serie</span>
              <span className="font-mono text-[11px] text-slate-400">Hardware ID</span>
            </div>
          </div>

        </div>

        {/* Section 3: Diagnóstico, Prioridad y Anticipo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-bold border border-slate-200">
                <Wrench className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paso 03</span>
                <h2 className="text-sm font-bold text-slate-900">Diagnóstico, Prioridad y Anticipo</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Prioridad */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Prioridad:</span>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="Normal">Normal (3-5 días)</option>
                  <option value="Urgente / Express">Urgente / Express (24h)</option>
                  <option value="Garantía">Garantía de Taller</option>
                </select>
              </div>

              {/* Anticipo */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Anticipo ($):</span>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    name="advanceDeposit"
                    value={formData.advanceDeposit}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-32 pl-8 pr-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Problem Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Síntomas Frecuentes (Clic para agregar al reporte)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_PROBLEMS.map(prob => {
                const isSelected = formData.printerProblem.includes(prob);
                return (
                  <button
                    key={prob}
                    type="button"
                    onClick={() => handleAddProblemTag(prob)}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prob}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="printerProblem" className="block text-xs font-bold text-slate-700">
                Falla Reportada por el Cliente <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="printerProblem"
                name="printerProblem"
                required
                rows={3}
                value={formData.printerProblem}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                placeholder="Describa detalladamente el problema reportado..."
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="internalNotes" className="block text-xs font-bold text-slate-700">
                Notas Internas del Taller (Privadas / Técnicas)
              </label>
              <textarea
                id="internalNotes"
                name="internalNotes"
                rows={3}
                value={formData.internalNotes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 resize-none"
                placeholder="Notas exclusivas para técnicos (ej. estado de cartuchos, cables dejados, claves...)"
              />
            </div>
          </div>
        </div>

        {/* Bottom Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="btn-tactile px-8 py-3 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isSaving ? 'Guardando Registro...' : 'Guardar y Generar Orden de Servicio'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
