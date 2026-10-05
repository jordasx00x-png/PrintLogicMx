import React, { useState, useMemo } from 'react';
import { CheckIn, Client } from '../types';
import { 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Printer, 
  AlertCircle, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Info,
  CheckCircle2,
  XCircle,
  UserCheck
} from 'lucide-react';

interface NewCheckInProps {
  onSave: (checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  checkIns?: CheckIn[];
  clients?: Client[];
  isSaving?: boolean;
}

export function NewCheckIn({ onSave, onCancel, checkIns = [], clients = [], isSaving = false }: NewCheckInProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    printerBrand: '',
    printerModel: '',
    printerProblem: '',
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeFieldFocus, setActiveFieldFocus] = useState<string | null>(null);

  // Consolidate unique clients list
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map<string, Client>();
    
    // First priority: registered clients
    clients.forEach(c => {
      const key = (c.id || c.email || c.phone || c.name || '').toLowerCase().trim();
      if (key) clientsMap.set(key, c);
    });

    // Second priority: check-ins clients
    checkIns.forEach(c => {
      if (!c.client) return;
      const key = (c.client.id || c.client.email || c.client.phone || c.client.name || '').toLowerCase().trim();
      if (key && !clientsMap.has(key)) {
        clientsMap.set(key, c.client);
      }
    });

    return Array.from(clientsMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [clients, checkIns]);

  // Live filter matching clients based on current input values
  const matchingClients = useMemo(() => {
    const nameTerm = formData.clientName.trim().toLowerCase();
    const phoneTerm = formData.clientPhone.trim().toLowerCase();
    const emailTerm = formData.clientEmail.trim().toLowerCase();

    if (!nameTerm && !phoneTerm && !emailTerm) return [];

    return uniqueClients.filter(c => {
      const matchName = nameTerm && c.name?.toLowerCase().includes(nameTerm);
      const matchPhone = phoneTerm && c.phone?.toLowerCase().includes(phoneTerm);
      const matchEmail = emailTerm && c.email?.toLowerCase().includes(emailTerm);
      return matchName || matchPhone || matchEmail;
    }).slice(0, 5);
  }, [formData.clientName, formData.clientPhone, formData.clientEmail, uniqueClients]);

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientName: client.name || '',
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
      clientAddress: client.address || '',
    }));
    setActiveFieldFocus(null);
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
    if (selectedClient) {
      setSelectedClient(null); // User started editing or custom typing
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      client: {
        id: selectedClient?.id,
        name: formData.clientName,
        phone: formData.clientPhone,
        email: formData.clientEmail,
        address: formData.clientAddress,
      },
      printer: {
        brand: formData.printerBrand,
        model: formData.printerModel,
        problem: formData.printerProblem,
        status: 'Ingresado',
      },
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
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Nuevo Ingreso</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">Registra un equipo para diagnóstico técnico</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          <div className="lg:col-span-2 space-y-6 md:space-y-10">
            {/* Client Data Section */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 space-y-6 md:space-y-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Datos del Cliente</h2>
                    <p className="text-xs text-slate-400 font-medium">Selecciona un cliente frecuente o ingresa uno nuevo</p>
                  </div>
                </div>

                {selectedClient ? (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/60 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cliente Frecuente Cargado</span>
                    <button
                      type="button"
                      onClick={handleClearClient}
                      className="ml-1 text-emerald-600 hover:text-emerald-900 underline font-black text-[11px]"
                    >
                      Limpiar
                    </button>
                  </div>
                ) : uniqueClients.length > 0 ? (
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const found = uniqueClients.find(c => c.id === val || c.email === val || c.phone === val);
                        if (found) selectClient(found);
                      }}
                      value={selectedClient?.id || ''}
                      className="w-full sm:w-72 pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all appearance-none"
                    >
                      <option value="">🔍 Buscar cliente registrado ({uniqueClients.length})...</option>
                      {uniqueClients.map((client, idx) => (
                        <option key={client.id || idx} value={client.id || client.email || client.phone}>
                          {client.name} {client.phone ? `(${client.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
                {/* Name Input */}
                <div className="space-y-2.5 relative">
                  <label htmlFor="clientName" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Nombre Completo *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      required
                      value={formData.clientName}
                      onChange={handleChange}
                      onFocus={() => setActiveFieldFocus('clientName')}
                      onBlur={() => setTimeout(() => setActiveFieldFocus(null), 200)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="space-y-2.5 relative">
                  <label htmlFor="clientPhone" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="tel"
                      id="clientPhone"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      onFocus={() => setActiveFieldFocus('clientPhone')}
                      onBlur={() => setTimeout(() => setActiveFieldFocus(null), 200)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. +52 123 456 7890"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2.5 relative">
                  <label htmlFor="clientEmail" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="email"
                      id="clientEmail"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      onFocus={() => setActiveFieldFocus('clientEmail')}
                      onBlur={() => setTimeout(() => setActiveFieldFocus(null), 200)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. juan@correo.com"
                    />
                  </div>
                </div>

                {/* Address Input */}
                <div className="space-y-2.5">
                  <label htmlFor="clientAddress" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Dirección (Opcional)
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      id="clientAddress"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Ej. Calle Principal 123"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Autocomplete Suggestions Popover */}
              {activeFieldFocus && !selectedClient && matchingClients.length > 0 && (
                <div className="bg-white border-2 border-indigo-500/30 rounded-2xl shadow-xl p-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Clientes coincidentes encontrados ({matchingClients.length})
                    </p>
                    <span className="text-[10px] text-slate-400">Haz clic para cargar datos automáticamente</span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {matchingClients.map((client, idx) => (
                      <button
                        key={client.id || idx}
                        type="button"
                        onClick={() => selectClient(client)}
                        className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-800 group-hover:text-indigo-700">{client.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {[client.phone, client.email].filter(Boolean).join(' • ')}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white px-3 py-1 rounded-lg transition-colors">
                          Cargar Datos
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Printer Data */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Datos del Equipo</h2>
                  <p className="text-xs text-slate-400 font-medium">Especifica la marca, modelo y problema detectado</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label htmlFor="printerBrand" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    id="printerBrand"
                    name="printerBrand"
                    required
                    value={formData.printerBrand}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="Ej. Epson, HP, Canon"
                  />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="printerModel" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    id="printerModel"
                    name="printerModel"
                    required
                    value={formData.printerModel}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="Ej. L3150"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2.5">
                  <label htmlFor="printerProblem" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Descripción del Problema *
                  </label>
                  <div className="relative group">
                    <AlertCircle className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <textarea
                      id="printerProblem"
                      name="printerProblem"
                      required
                      rows={4}
                      value={formData.printerProblem}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Describe detalladamente el problema que presenta el equipo..."
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black leading-tight">Clientes Frecuentes</h3>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Al guardar este registro, los datos del cliente quedan guardados automáticamente en la base de datos para futuros ingresos.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Sincronizado con Google Cloud</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Resumen de Registro</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Estado inicial</span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-black text-[10px] uppercase tracking-widest">Ingresado</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Directorio</span>
                  <span className="text-slate-900 font-bold">{uniqueClients.length} clientes guardados</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 group disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar Ingreso'}
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
          </div>
        </div>
      </form>
    </div>
  );
}
