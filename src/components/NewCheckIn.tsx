import React, { useState, useMemo } from 'react';
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
  Barcode, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  X,
  AlertCircle
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
    printerSerialNumber: '',
    printerProblem: '',
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
        serialNumber: formData.printerSerialNumber.trim(),
        problem: formData.printerProblem,
        status: 'Ingresado',
      },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-16 md:pb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Compact Header Bar with Direct Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
                Nuevo Ingreso de Equipo
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">Completa los datos del cliente e impresora para registrar el ingreso al taller.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="hidden sm:block px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-tactile px-5 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Guardando...' : 'Guardar Ingreso'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Full Screen Grid: Cliente (Col 1) & Equipo (Col 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Card 1: Datos del Cliente */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">1. Datos del Cliente</h2>
                </div>

                {selectedClient ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-200">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cargado</span>
                    <button
                      type="button"
                      onClick={handleClearClient}
                      className="ml-1 text-emerald-700 hover:text-emerald-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : uniqueClients.length > 0 ? (
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const found = uniqueClients.find(c => (c.id || c.email || c.phone) === val);
                      if (found) selectClient(found);
                    }}
                    value=""
                    className="text-[11px] font-bold px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 max-w-[200px] truncate"
                  >
                    <option value="">👤 Cliente frecuente...</option>
                    {uniqueClients.map((client, idx) => (
                      <option key={client.id || idx} value={client.id || client.email || client.phone}>
                        {client.name} {client.phone ? `(${client.phone})` : ''}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              {/* Client Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div className="space-y-1">
                  <label htmlFor="clientName" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      required
                      value={formData.clientName}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
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
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Ej. 55 1234 5678"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="clientEmail" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      id="clientEmail"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
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
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Calle, Número, Colonia"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>El cliente se guarda automáticamente en el directorio al registrar el ingreso.</span>
            </div>
          </div>

          {/* Card 2: Datos del Equipo */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                    <Printer className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">2. Datos del Equipo e Impresora</h2>
                </div>
              </div>

              {/* Printer Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Ej. Epson, HP, Canon, Brother"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 uppercase"
                      placeholder="Ej. X7Y908123456"
                    />
                  </div>
                </div>

                {/* S/N Previous History Banner if match */}
                {latestSerialCheckIn && (
                  <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-bold">
                        Equipo registrado anteriormente ({daysSinceLastDelivery === 0 ? 'hoy' : `hace ${daysSinceLastDelivery}d`})
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
                      className="text-[10px] font-bold bg-amber-600 text-white px-2 py-1 rounded-lg hover:bg-amber-700 cursor-pointer shrink-0"
                    >
                      Autocompletar
                    </button>
                  </div>
                )}

                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="printerProblem" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Falla / Diagnóstico Inicial *
                  </label>
                  <textarea
                    id="printerProblem"
                    name="printerProblem"
                    required
                    rows={2}
                    value={formData.printerProblem}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                    placeholder="Describe la falla o motivo del ingreso (ej. No enciende, atasco de papel, etc.)..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Guardando...' : 'Registrar Ingreso de Equipo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Action Bar */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-30 flex items-center gap-2 shadow-lg">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-4 rounded-xl text-slate-500 font-bold text-xs flex items-center justify-center active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 h-11 bg-slate-950 active:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 shadow-sm transition-all cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar Ingreso'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
