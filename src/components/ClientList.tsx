import React, { useState } from 'react';
import { CheckIn, Client } from '../types';
import { User, Phone, Mail, MapPin, Search, Calendar, Sparkles, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ClientListProps {
  checkIns: CheckIn[];
  clients: Client[];
  onAddClient: (client: Client) => Promise<void>;
  onUpdateClient: (id: string, client: Client) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}

export function ClientList({ checkIns, clients, onAddClient, onUpdateClient, onDeleteClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Merge registered clients with check-in history
  const clientsWithStats = clients.map(client => {
    const clientCheckIns = checkIns.filter(c => 
      (c.client.id && c.client.id === client.id) ||
      (c.client.email && c.client.email === client.email) || 
      (c.client.phone && c.client.phone === client.phone)
    );
    
    const lastCheckIn = clientCheckIns.length > 0 
      ? clientCheckIns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : null;

    return {
      ...client,
      checkInCount: clientCheckIns.length,
      lastCheckIn
    };
  });

  // Also include clients from check-ins that are NOT in the registered list (legacy support)
  const registeredEmails = new Set(clients.map(c => c.email).filter(Boolean));
  const registeredPhones = new Set(clients.map(c => c.phone).filter(Boolean));

  const unregisteredClientsMap = new Map<string, Client & { checkInCount: number, lastCheckIn: string }>();

  checkIns.forEach(checkIn => {
    const email = checkIn.client.email;
    const phone = checkIn.client.phone;
    
    if ((email && registeredEmails.has(email)) || (phone && registeredPhones.has(phone))) {
      return; // Already registered
    }

    const key = email || phone;
    if (!key) return;

    if (unregisteredClientsMap.has(key)) {
      const existing = unregisteredClientsMap.get(key)!;
      existing.checkInCount += 1;
      if (new Date(checkIn.createdAt) > new Date(existing.lastCheckIn)) {
        existing.lastCheckIn = checkIn.createdAt;
      }
    } else {
      unregisteredClientsMap.set(key, {
        ...checkIn.client,
        checkInCount: 1,
        lastCheckIn: checkIn.createdAt
      });
    }
  });

  const allClients = [
    ...clientsWithStats,
    ...Array.from(unregisteredClientsMap.values()).map(c => ({ ...c, isUnregistered: true }))
  ].sort((a, b) => {
    const dateA = a.lastCheckIn ? new Date(a.lastCheckIn).getTime() : 0;
    const dateB = b.lastCheckIn ? new Date(b.lastCheckIn).getTime() : 0;
    return dateB - dateA;
  });

  const filteredClients = allClients.filter(client => 
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone || '').includes(searchTerm)
  );

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const clientData: Client = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };

    if (editingClient && editingClient.id) {
      await onUpdateClient(editingClient.id, clientData);
    } else {
      await onAddClient(clientData);
    }
    
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Directorio Maestro</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">Gestiona tu base de clientes y su historial de servicios.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 transition-all group relative"
          >
            {/* Actions */}
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingClient(client);
                  setIsModalOpen(true);
                }}
                className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              {client.id && (
                <button 
                  onClick={() => setDeletingClient(client)}
                  className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-start gap-5 mb-8">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-colors duration-500 ${
                // @ts-ignore
                client.isUnregistered ? 'bg-slate-100' : 'bg-indigo-50 group-hover:bg-indigo-600'
              }`}>
                <User className={`w-8 h-8 transition-colors duration-500 ${
                  // @ts-ignore
                  client.isUnregistered ? 'text-slate-400' : 'text-indigo-600 group-hover:text-white'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{client.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                    <Calendar className="w-3 h-3" />
                    {client.checkInCount} {client.checkInCount === 1 ? 'ingreso' : 'ingresos'}
                  </div>
                  {/* @ts-ignore */}
                  {client.isUnregistered && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1.5 rounded-xl border border-amber-100">
                      No registrado
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-600">{client.phone}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-600 truncate">{client.email}</span>
              </div>
              {client.address && (
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 line-clamp-2">{client.address}</span>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Última Visita</p>
              <p className="text-xs font-bold text-slate-500">
                {client.lastCheckIn 
                  ? new Date(client.lastCheckIn).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Nunca'}
              </p>
            </div>
          </motion.div>
        ))}
        
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No se encontraron clientes</h3>
            <p className="text-slate-400 font-medium mt-2">Intenta con otros términos de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className="text-slate-500 font-medium mb-8">
                {editingClient ? 'Actualiza la información del cliente.' : 'Registra un nuevo cliente en el sistema.'}
              </p>

              <form onSubmit={handleSaveClient} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo *</label>
                  <input
                    name="name"
                    defaultValue={editingClient?.name}
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono (Opcional)</label>
                    <input
                      name="phone"
                      defaultValue={editingClient?.phone}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="55 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email (Opcional)</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingClient?.email}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Dirección</label>
                  <textarea
                    name="address"
                    defaultValue={editingClient?.address}
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                    placeholder="Calle, Número, Colonia..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      {/* Delete Modal */}
      {deletingClient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">¿Eliminar cliente?</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Estás a punto de eliminar a <span className="font-black text-slate-800">"{deletingClient.name}"</span> del directorio.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingClient.id) {
                    onDeleteClient(deletingClient.id);
                  }
                  setDeletingClient(null);
                }}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
