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
  Camera,
  ScanLine,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Trash2,
  FlipHorizontal,
  Loader2
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

  // Photo & AI Serial Scanning States
  const [serialPhoto, setSerialPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Camera Management
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    stopCamera();
    setScanError(null);
    setScanMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Direct camera stream error:', err);
      setScanError('No se pudo acceder a la cámara en vivo. Puedes subir una foto desde tus archivos o galería.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleOpenScanner = () => {
    setIsCameraOpen(true);
    setScanError(null);
    setScanMessage(null);
    startCamera(cameraFacing);
  };

  const handleCloseScanner = () => {
    stopCamera();
    setIsCameraOpen(false);
    setIsScanning(false);
    setScanError(null);
    setScanMessage(null);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Process and analyze image with AI / Barcode
  const processImageForSerial = async (base64Image: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanMessage('Analizando fotografía con IA y extrayendo número de serie...');

    try {
      // 1. Try Client-side BarcodeDetector if supported
      let detectedBarcodeText = '';
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'data_matrix']
          });
          const img = new Image();
          img.src = base64Image;
          await new Promise(r => { img.onload = r; });
          const barcodes = await barcodeDetector.detect(img);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            detectedBarcodeText = barcodes[0].rawValue.trim();
            console.log('Client-side barcode detected:', detectedBarcodeText);
          }
        } catch (be) {
          console.warn('BarcodeDetector error:', be);
        }
      }

      // 2. Call server-side Gemini OCR endpoint
      const response = await fetch('/api/scan-serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg'
        })
      });

      const data = await response.json();

      let extractedSerial = '';
      let extractedBrand = '';
      let extractedModel = '';

      if (data.success && data.serialNumber) {
        extractedSerial = data.serialNumber;
        extractedBrand = data.brand || '';
        extractedModel = data.model || '';
      } else if (detectedBarcodeText) {
        extractedSerial = detectedBarcodeText;
      }

      if (!extractedSerial) {
        throw new Error(data.error || 'No se pudo identificar el número de serie en la fotografía. Intenta enfocar más cerca la etiqueta blanca o código de barras.');
      }

      // Automatically fill the serial number!
      setFormData(prev => ({
        ...prev,
        printerSerialNumber: extractedSerial,
        printerBrand: (!prev.printerBrand && extractedBrand) ? extractedBrand : prev.printerBrand,
        printerModel: (!prev.printerModel && extractedModel) ? extractedModel : prev.printerModel,
      }));

      // Automatically save the serial photo!
      setSerialPhoto(base64Image);

      setScanMessage(`¡Número de serie guardado en automático: ${extractedSerial}!`);
      
      // Auto close camera after brief confirmation
      setTimeout(() => {
        handleCloseScanner();
      }, 1200);

    } catch (err: any) {
      console.error('Scan processing error:', err);
      setScanError(err.message || 'Error al procesar la fotografía.');
      setIsScanning(false);
    }
  };

  // Capture frame from active video
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.92);
      
      // Freeze stream while processing
      stopCamera();
      processImageForSerial(base64);
    } catch (e: any) {
      console.error('Snapshot capture error:', e);
      setScanError('Error al capturar la imagen de la cámara.');
    }
  };

  // Handle file capture (e.g. from gallery or native camera picker)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (isCameraOpen) {
        stopCamera();
      } else {
        setIsCameraOpen(true);
      }
      processImageForSerial(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
        serialPhoto: serialPhoto || undefined,
      },
      internalNotes: formData.internalNotes.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 font-sans">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Hidden File Picker for native camera capture */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileInputChange}
        />

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

                {/* Número de Serie con Botón de Foto y Escaneo Automático */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="printerSerialNumber" className="block text-xs font-bold text-slate-700">
                      Número de Serie / S/N
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenScanner}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95 px-2.5 py-1 rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs"
                        title="Tomar foto de la etiqueta o código de barras para guardar la serie en automático"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tomar Foto / Escanear</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="printerSerialNumber"
                      name="printerSerialNumber"
                      value={formData.printerSerialNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-28 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 uppercase"
                      placeholder="Ej. X7Y9081234"
                    />

                    {/* Quick Button inside input */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        title="Subir imagen desde galería o archivos"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenScanner}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        title="Abrir cámara y escanear"
                      >
                        <ScanLine className="w-3 h-3 text-blue-400" />
                        <span>Foto</span>
                      </button>
                    </div>
                  </div>

                  {/* Attached Serial Photo Preview Card */}
                  {serialPhoto && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={serialPhoto} 
                          alt="Foto de la etiqueta" 
                          className="w-10 h-10 object-cover rounded-lg border border-emerald-300 shrink-0 cursor-pointer hover:opacity-90"
                          onClick={() => setShowPhotoPreview(true)}
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Foto de etiqueta adjunta
                          </p>
                          <p className="text-[10px] text-emerald-700 font-mono truncate">
                            Serie: {formData.printerSerialNumber || 'Detectada'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowPhotoPreview(true)}
                          className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Ver foto ampliada"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenScanner}
                          className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Volver a tomar foto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSerialPhoto(null)}
                          className="p-1 text-emerald-700 hover:text-rose-600 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Quitar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
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
              <span className="font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                OCR Inteligente con detección automática
              </span>
              <span className="font-mono text-[11px] text-slate-400">Gemini 3.8</span>
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

      {/* Interactive Camera & OCR Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-white"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Escanear Serie de Impresora</h3>
                    <p className="text-[10px] text-slate-400">Captura la etiqueta o código de barras del equipo</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseScanner}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Viewfinder Area */}
              <div className="relative aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Laser Overlay Scanner Frame */}
                {!isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="w-4/5 h-2/3 border-2 border-blue-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-blue-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-blue-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-blue-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-blue-400" />

                      {/* Moving laser scan line */}
                      <motion.div
                        animate={{ top: ['5%', '90%', '5%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-2 right-2 h-0.5 bg-blue-400 shadow-[0_0_8px_#60a5fa]"
                      />

                      <div className="absolute inset-x-0 bottom-3 text-center">
                        <span className="text-[10px] font-bold bg-slate-900/80 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
                          Enfoca la etiqueta con S/N o código de barras
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Extrayendo Número de Serie...</p>
                      <p className="text-xs text-slate-400 mt-1">{scanMessage || 'Analizando caracteres y códigos con IA'}</p>
                    </div>
                  </div>
                )}

                {/* Success Message Banner */}
                {scanMessage && !isScanning && (
                  <div className="absolute inset-x-4 top-4 bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{scanMessage}</span>
                  </div>
                )}

                {/* Error Banner */}
                {scanError && !isScanning && (
                  <div className="absolute inset-x-4 bottom-4 bg-rose-600/90 text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-2.5 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-white mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">No se pudo leer la serie</p>
                      <p className="text-[11px] text-rose-100">{scanError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  disabled={isScanning}
                  className="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-2xl transition-all cursor-pointer border border-slate-700"
                  title="Cambiar cámara frontal / trasera"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </button>

                {/* Big Shutter Capture Button */}
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={handleCaptureSnapshot}
                  className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-xs sm:text-sm">Tomar Foto y Extraer Serie</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-2xl transition-all cursor-pointer border border-slate-700"
                  title="Elegir foto de la galería"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Photo Preview Modal */}
      <AnimatePresence>
        {showPhotoPreview && serialPhoto && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Foto de Placa / Etiqueta</h3>
                  <p className="text-xs font-mono text-emerald-400">S/N: {formData.printerSerialNumber || 'Sin serie'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoPreview(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
                <img
                  src={serialPhoto}
                  alt="Etiqueta del equipo"
                  className="max-h-[60vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoPreview(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
