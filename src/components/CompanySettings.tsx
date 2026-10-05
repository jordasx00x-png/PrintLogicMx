import React, { useState, useEffect } from 'react';
import { Save, Upload, Building, Phone, Mail, Globe, Image as ImageIcon } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../hooks/useToast';

export function CompanySettings() {
  const { settings, updateSettings, loading } = useSettings();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting settings form:', formData);
    setIsSaving(true);
    try {
      const success = await updateSettings(formData);
      console.log('Update result:', success);
      if (success) {
        addToast('Configuración guardada correctamente', 'success');
      } else {
        addToast('Error al guardar la configuración', 'error');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      addToast('Error al guardar la configuración', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando configuración...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Building className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Perfil de Empresa</h1>
          <p className="text-sm text-slate-500 font-medium">Personaliza la información que aparecerá en tus cotizaciones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-slate-400" />
            Logotipo
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <ImageIcon className="w-10 h-10 text-slate-300" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-bold">Cambiar</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
            
            <div className="flex-1 space-y-2 text-center md:text-left">
              <p className="text-sm font-bold text-slate-900">Sube tu logo empresarial</p>
              <p className="text-xs text-slate-500">Recomendado: PNG o JPG, fondo transparente. Máximo 2MB.</p>
              <div className="relative inline-block mt-2">
                <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl transition-colors flex items-center gap-2 pointer-events-none">
                  <Upload className="w-3 h-3" />
                  Seleccionar Archivo
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-400" />
            Información General
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre de la Empresa</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Ej. PrintLogic Soluciones"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="Ej. +52 55 1234 5678"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="contacto@empresa.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sitio Web</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  placeholder="www.tuempresa.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dirección Física</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Calle, Número, Colonia, Ciudad, Estado"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
