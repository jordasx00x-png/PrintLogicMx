import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Package, 
  Plus,
  ChevronRight, 
  ChevronLeft, 
  ShoppingCart, 
  BarChart3,
  Search,
  Command,
  ArrowRight,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OfflineIndicator } from './OfflineIndicator';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: { name: string; email: string; photoURL?: string };
}

export function Layout({ children, currentView, onNavigate, onLogout, user }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { permission, requestPermission } = useNotifications();

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'new', label: 'Nuevo Ingreso', icon: Plus },
    { id: 'list', label: 'Ingresos y Taller', icon: Printer },
    { id: 'products', label: 'Catálogo Refacciones', icon: Package },
    { id: 'clients', label: 'Directorio Clientes', icon: Users },
    { id: 'sales', label: 'Ventas y Cotizaciones', icon: ShoppingCart },
    { id: 'reports', label: 'Reportes y Balance', icon: BarChart3 },
    { id: 'settings', label: 'Configuración Taller', icon: Settings },
  ];

  // Mobile bottom tab bar items (thumb-zone natural reach)
  const mobileBottomTabs = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'new', label: 'Nuevo', icon: Plus },
    { id: 'list', label: 'Ingresos', icon: Printer },
    { id: 'products', label: 'Catálogo', icon: Package },
  ];

  const currentViewTitle = navItems.find(i => i.id === currentView)?.label || 'Panel de Control';

  // Global Keyboard Shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredNavItems = searchQuery.trim()
    ? navItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : navItems;

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex font-sans selection:bg-slate-900 selection:text-white">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ width: 260 }}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="hidden md:flex flex-col bg-slate-950 text-slate-300 print:hidden z-30 relative border-r border-slate-900 shadow-xl"
      >
        {/* Brand Header */}
        <div className={clsx("p-5 flex items-center gap-3 border-b border-slate-900", isSidebarCollapsed ? "justify-center" : "")}>
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="min-w-0"
            >
              <span className="text-base font-black text-white tracking-tight font-display">
                Print<span className="text-blue-500">Fix</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Taller Profesional</p>
            </motion.div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-full p-1 shadow-sm transition-all active:scale-90 z-50 cursor-pointer"
          title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isSidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">Navegación</p>
          )}
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={twMerge(
                  "w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer select-none text-left",
                  isActive
                    ? 'bg-slate-900 text-white font-bold border border-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 font-medium',
                  isSidebarCollapsed ? "justify-center px-0" : ""
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={clsx("w-4 h-4 shrink-0 transition-transform", isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                
                {!isSidebarCollapsed && (
                  <span className="text-xs truncate font-medium flex-1">{item.label}</span>
                )}

                {!isSidebarCollapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-900 bg-slate-950">
          <div className={clsx("p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5", isSidebarCollapsed ? "justify-center p-2" : "")}>
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-white">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-mono">{user.email}</p>
              </div>
            )}

            {!isSidebarCollapsed && (
              <button
                onClick={onLogout}
                className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Modern Top Header Bar - Solid, Crisp, Notch-Aware */}
        <header className="bg-white border-b border-slate-200 shadow-xs shrink-0 z-30 print:hidden select-none">
          {/* Safe Area Notch Spacer for iPhone / Android PWA */}
          <div className="h-[env(safe-area-inset-top,0px)] bg-white w-full shrink-0" />
          
          <div className="h-14 px-3 md:px-8 flex items-center justify-between gap-2">
            {/* Left: Brand mark on mobile & Breadcrumbs */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-800 hover:text-slate-950 active:scale-95 rounded-xl cursor-pointer"
                title="Menú"
              >
                <Menu className="w-5 h-5 text-slate-900 stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                <span className="hidden sm:inline hover:text-slate-900 cursor-pointer font-semibold" onClick={() => onNavigate('dashboard')}>
                  Taller
                </span>
                <span className="hidden sm:inline text-slate-300">/</span>
                <span className="font-extrabold text-slate-950 text-sm sm:text-xs truncate">
                  {currentViewTitle}
                </span>
              </div>
            </div>

            {/* Center: Quick Search Trigger Button (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center flex-1 max-w-sm mx-2">
              <button
                onClick={() => setIsQuickSearchOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200/80 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Navegación rápida...</span>
                </div>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </button>
            </div>

            {/* Right: Quick Action Buttons & Search Icon on Mobile */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Notification Status / Settings Bell Button */}
              <button
                onClick={async () => {
                  if (permission !== 'granted') {
                    const res = await requestPermission();
                    if (res === 'granted') return;
                  }
                  onNavigate('settings');
                }}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-100 active:scale-95 rounded-xl transition-colors cursor-pointer"
                title={permission === 'granted' ? 'Notificaciones Activadas (Configurar)' : 'Activar Notificaciones de Celular'}
              >
                <Bell className="w-4 h-4 text-slate-900 stroke-[2.2]" />
                {permission === 'granted' ? (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                ) : (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse ring-2 ring-white" />
                )}
              </button>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsQuickSearchOpen(true)}
                className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-800 hover:text-slate-950 active:scale-95 rounded-xl cursor-pointer"
                title="Buscar"
              >
                <Search className="w-4 h-4 text-slate-900 stroke-[2.2]" />
              </button>

              {currentView !== 'new' && (
                <button
                  onClick={() => onNavigate('new')}
                  className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Nuevo Ingreso</span>
                  <span className="sm:hidden font-bold">Nuevo</span>
                </button>
              )}

              {currentView !== 'sales' && (
                <button
                  onClick={() => onNavigate('sales')}
                  className="hidden md:inline-flex bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ventas</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area - Extra padding on mobile to never clip behind bottom navigation */}
        <main className="flex-1 p-3 md:p-6 lg:p-8 pb-28 md:pb-8 overflow-y-auto print:p-0">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
            <OfflineIndicator />
          </div>
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone) */}
        <nav 
          aria-label="Navegación móvil"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 grid grid-cols-5 items-center px-1 min-h-[60px] pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1 shadow-lg shadow-slate-900/10 select-none"
        >
          {mobileBottomTabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={clsx(
                  "min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-90 cursor-pointer select-none",
                  isActive ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={clsx("p-1.5 rounded-xl transition-all", isActive ? "bg-slate-900 text-white shadow-xs" : "text-slate-500")}>
                  <tab.icon className="w-4 h-4" />
                </div>
                <span className={clsx("text-[10px] tracking-tight leading-none", isActive ? "font-bold text-slate-900" : "font-medium text-slate-500")}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Tab 5: "Más" Button to open drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="min-h-[48px] flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 transition-all active:scale-90 cursor-pointer select-none"
          >
            <div className="p-1.5 rounded-xl text-slate-500">
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 tracking-tight leading-none">
              Más
            </span>
          </button>
        </nav>
      </div>

      {/* Global Command Palette / Quick Search Modal */}
      <AnimatePresence>
        {isQuickSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickSearchOpen(false)}
              className="fixed inset-0 bg-slate-950/60"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10"
            >
              <div className="p-3 border-b border-slate-100 flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Ir a sección o buscar función..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-xs font-medium focus:outline-none py-1.5"
                />
                <button
                  onClick={() => setIsQuickSearchOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                {filteredNavItems.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No se encontraron opciones</p>
                ) : (
                  filteredNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsQuickSearchOpen(false);
                      }}
                      className="w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left text-xs text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70"
            />

            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="relative w-72 max-w-[85vw] bg-slate-950 text-slate-200 flex flex-col p-5 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-base font-black text-white font-display">PrintFix</span>
                    <p className="text-[10px] text-slate-500 font-medium">Taller Profesional</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Secciones</p>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={twMerge(
                      "w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer",
                      currentView === item.id 
                        ? 'bg-slate-900 text-white border border-slate-800 shadow-xs' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate font-mono">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
