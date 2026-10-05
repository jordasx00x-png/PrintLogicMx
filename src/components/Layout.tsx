import React from 'react';
import { Printer, Users, FileText, Settings, Menu, X, LogOut, User, LayoutDashboard, Package, DollarSign, ChevronRight, Sparkles, ChevronLeft, ShoppingCart, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: { name: string; email: string; photoURL?: string };
}

export function Layout({ children, currentView, onNavigate, onLogout, user }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, description: 'Resumen y estadísticas' },
    { id: 'new', label: 'Nuevo Ingreso', icon: FileText, description: 'Registrar equipo' },
    { id: 'list', label: 'Ingresos', icon: Printer, description: 'Gestión de reparaciones' },
    { id: 'products', label: 'Catálogo', icon: Package, description: 'Refacciones y servicios' },
    { id: 'clients', label: 'Clientes', icon: Users, description: 'Directorio de contactos' },
    { id: 'sales', label: 'Ventas y Cotizaciones', icon: ShoppingCart, description: 'Gestión de ventas' },
    { id: 'reports', label: 'Reporte de Ganancias', icon: BarChart3, description: 'Análisis financiero' },
    { id: 'settings', label: 'Configuración', icon: Settings, description: 'Perfil de empresa' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar for Desktop */}
      <motion.aside 
        initial={{ width: 320 }}
        animate={{ width: isSidebarCollapsed ? 100 : 320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col bg-white border-r border-slate-100 print:hidden shadow-2xl shadow-slate-200/50 z-30 relative"
      >
        <div className={clsx("p-8 flex items-center gap-4", isSidebarCollapsed ? "justify-center" : "")}>
          <div className="w-12 h-12 rounded-2xl shadow-lg shadow-indigo-200 ring-4 ring-indigo-50 shrink-0 overflow-hidden bg-white flex items-center justify-center">
            <img src="/logo.png" alt="PrintLogicMx" className="w-full h-full object-contain p-1" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <span className="text-2xl font-black text-slate-900 tracking-tighter block leading-none">PrintLogic</span>
              <span className="text-indigo-600 font-black text-sm tracking-widest uppercase">Mx</span>
            </motion.div>
          )}
        </div>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-12 bg-white border border-slate-100 rounded-full p-1.5 shadow-sm hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors z-50"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {!isSidebarCollapsed && (
            <p className="px-4 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Navegación</p>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={twMerge(
                "w-full group flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all duration-300 relative overflow-hidden",
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02]',
                isSidebarCollapsed ? "justify-center px-0" : ""
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {currentView === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-600 rounded-[1.5rem] -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={clsx("w-5 h-5 transition-transform duration-300 shrink-0", currentView === item.id ? 'scale-110' : 'group-hover:scale-110')} />
              {!isSidebarCollapsed && (
                <div className="flex-1 text-left z-10 min-w-0">
                  <p className={clsx("text-sm font-bold leading-none truncate", currentView === item.id ? 'text-white' : 'text-slate-700')}>{item.label}</p>
                  {currentView !== item.id && (
                    <p className="text-[10px] opacity-50 mt-1.5 font-medium truncate">{item.description}</p>
                  )}
                </div>
              )}
              {!isSidebarCollapsed && currentView === item.id && <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />}
            </button>
          ))}
        </nav>

        <div className={clsx("m-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group transition-all", isSidebarCollapsed ? "p-4" : "p-6")}>
          {!isSidebarCollapsed && (
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-indigo-600 rotate-12" />
            </div>
          )}
          <div className={clsx("flex items-center gap-4 mb-4 relative z-10", isSidebarCollapsed ? "justify-center mb-0" : "")}>
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-wider">Administrador</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black text-red-500 hover:bg-white hover:shadow-sm hover:text-red-600 transition-all relative z-10"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
            <img src="/logo.png" alt="PrintLogicMx" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">PrintLogic<span className="text-indigo-600">Mx</span></span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 bg-slate-50 rounded-xl"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 bg-white z-40 p-6 flex flex-col"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                    currentView === item.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={`text-[10px] ${currentView === item.id ? 'text-white/70' : 'text-slate-400'}`}>{item.description}</p>
                  </div>
                </button>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4 px-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 print:pt-0">
        <div className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
