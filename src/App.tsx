import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { Layout } from './components/Layout';
import { CheckInList } from './components/CheckInList';
import { NewCheckIn } from './components/NewCheckIn';
import { CheckInDetails } from './components/CheckInDetails';
import { ClientList } from './components/ClientList';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { ProductCatalog } from './components/ProductCatalog';
import { SalesSummary } from './components/SalesSummary';
import { CompanySettings } from './components/CompanySettings';
import { SalesList } from './components/sales/SalesList';
import { NewSale } from './components/sales/NewSale';
import { SaleDetails } from './components/sales/SaleDetails';
import { ToastContainer } from './components/Toast';
import { useStore } from './hooks/useStore';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { Sale } from './types';

export default function App() {
  const { user, login, loginWithGoogle, register, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();
  const { 
    checkIns, 
    sales,
    products,
    clients,
    stats,
    addCheckIn, 
    updateCheckInStatus, 
    addQuote, 
    updateQuote, 
    markQuoteAsSent, 
    unlockQuote, 
    updateClient, 
    deleteCheckIn,
    updateNotes,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    addClient,
    updateClientData,
    deleteClient,
    addSale,
    updateSale,
    deleteSale
  } = useStore();

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'details') {
      setSelectedCheckInId(null);
    }
    if (view !== 'sale-details') {
      setSelectedSaleId(null);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedCheckInId(id);
    setCurrentView('details');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCheckIn = async (checkIn: any) => {
    setIsSaving(true);
    try {
      const cleanEmail = checkIn.client.email?.trim().toLowerCase();
      const cleanPhone = checkIn.client.phone?.trim();
      const cleanName = checkIn.client.name?.trim().toLowerCase();
      
      // Find existing client safely without false matches on empty strings
      const existingClient = clients.find(c => {
        if (cleanEmail && c.email && c.email.trim().toLowerCase() === cleanEmail) return true;
        if (cleanPhone && c.phone && c.phone.trim() === cleanPhone) return true;
        if (cleanName && c.name && c.name.trim().toLowerCase() === cleanName) return true;
        return false;
      });

      if (!existingClient) {
        try {
          const newClientData = {
            name: checkIn.client.name?.trim() || 'Cliente Sin Nombre',
            phone: checkIn.client.phone?.trim() || '',
            email: checkIn.client.email?.trim() || '',
            address: checkIn.client.address?.trim() || '',
          };
          const newClient = await addClient(newClientData);
          checkIn.client.id = newClient.id;
          checkIn.clientId = newClient.id;
          addToast('Cliente guardado en el directorio', 'success');
        } catch (e) {
          console.error('Error auto-registering client', e);
        }
      } else {
        checkIn.client.id = existingClient.id;
        checkIn.clientId = existingClient.id;
        
        const hasChanges = 
          existingClient.name !== checkIn.client.name ||
          existingClient.address !== checkIn.client.address ||
          existingClient.phone !== checkIn.client.phone ||
          existingClient.email !== checkIn.client.email;
          
        if (hasChanges) {
          await updateClientData(existingClient.id, { 
            ...existingClient, 
            name: checkIn.client.name || existingClient.name,
            phone: checkIn.client.phone || existingClient.phone,
            email: checkIn.client.email || existingClient.email,
            address: checkIn.client.address || existingClient.address,
          });
        }
      }

      await addCheckIn(checkIn);
      addToast('Ingreso registrado correctamente', 'success');
      setCurrentView('list');
    } catch (error) {
      console.error(error);
      addToast('Error al registrar el ingreso. Verifica tu conexión.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuote = async (checkInId: string, quote: any) => {
    try {
      await addQuote(checkInId, quote);
      addToast('Cotización creada correctamente', 'success');
    } catch (error) {
      addToast('Error al crear la cotización', 'error');
    }
  };

  const handleUpdateQuote = async (checkInId: string, quote: any) => {
    try {
      await updateQuote(checkInId, quote);
      addToast('Cotización actualizada', 'success');
    } catch (error) {
      addToast('Error al actualizar la cotización', 'error');
    }
  };

  const handleMarkQuoteAsSent = async (checkInId: string) => {
    try {
      await markQuoteAsSent(checkInId);
      addToast('Cotización marcada como enviada', 'success');
    } catch (error) {
      addToast('Error al actualizar estado', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await updateCheckInStatus(id, status);
      addToast(`Estado actualizado a ${status}`, 'success');
    } catch (error) {
      addToast('Error al actualizar estado', 'error');
    }
  };

  const handleUpdateClient = async (id: string, client: any) => {
    try {
      await updateClient(id, client);
      
      const checkIn = checkIns.find(c => c.id === id);
      
      // Also update the client in the clients table if it exists
      const existingClient = checkIn?.clientId 
        ? clients.find(c => c.id === checkIn.clientId)
        : clients.find(c => 
            (c.email && c.email === client.email) || 
            (c.phone && c.phone === client.phone)
          );
      
      if (existingClient && existingClient.id) {
        await updateClientData(existingClient.id, { ...existingClient, ...client });
      } else {
        const newClient = await addClient(client);
        // Link the new client to the check-in
        await updateClient(id, { ...client, id: newClient.id });
      }
      
      addToast('Cliente actualizado', 'success');
    } catch (error) {
      addToast('Error al actualizar cliente', 'error');
    }
  };

  const handleDeleteCheckIn = async (id: string) => {
    try {
      await deleteCheckIn(id);
      addToast('Ingreso eliminado', 'success');
      if (selectedCheckInId === id) {
        setCurrentView('list');
        setSelectedCheckInId(null);
      }
    } catch (error) {
      addToast('Error al eliminar ingreso', 'error');
    }
  };

  const handleAddProduct = async (product: any) => {
    try {
      await addProduct(product);
      addToast('Producto agregado', 'success');
    } catch (error) {
      addToast('Error al agregar producto', 'error');
    }
  };

  const handleUpdateProduct = async (id: string, product: any) => {
    try {
      await updateProduct(id, product);
      addToast('Producto actualizado', 'success');
    } catch (error) {
      addToast('Error al actualizar producto', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      addToast('Producto eliminado', 'success');
    } catch (error) {
      addToast('Error al eliminar producto', 'error');
    }
  };

  const handleDeleteAllProducts = async () => {
    try {
      await deleteAllProducts();
      addToast('Catálogo vaciado correctamente', 'success');
    } catch (error) {
      addToast('Error al vaciar catálogo', 'error');
    }
  };

  const handleAddClient = async (client: any) => {
    try {
      await addClient(client);
      addToast('Cliente registrado', 'success');
    } catch (error) {
      addToast('Error al registrar cliente', 'error');
    }
  };

  const handleUpdateClientData = async (id: string, client: any) => {
    try {
      await updateClientData(id, client);
      addToast('Cliente actualizado', 'success');
    } catch (error) {
      addToast('Error al actualizar cliente', 'error');
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      addToast('Cliente eliminado', 'success');
    } catch (error) {
      addToast('Error al eliminar cliente', 'error');
    }
  };

  const handleSaveSale = async (sale: any) => {
    setIsSaving(true);
    try {
      // Auto-register client if not exists
      const clientEmail = sale.client.email;
      const clientPhone = sale.client.phone;
      
      const existingClient = clients.find(c => 
        (c.email && c.email === clientEmail) || 
        (c.phone && c.phone === clientPhone)
      );

      if (!existingClient) {
        try {
          const newClient = await addClient(sale.client);
          sale.client.id = newClient.id;
          sale.clientId = newClient.id;
          addToast('Cliente registrado automáticamente', 'success');
        } catch (e) {
          console.error('Error auto-registering client', e);
        }
      } else {
        sale.client.id = existingClient.id;
        sale.clientId = existingClient.id;
        // Update existing client with potentially new info
        const hasChanges = 
          existingClient.name !== sale.client.name ||
          existingClient.address !== sale.client.address ||
          existingClient.phone !== sale.client.phone ||
          existingClient.email !== sale.client.email;
          
        if (hasChanges) {
          await updateClientData(existingClient.id, { ...existingClient, ...sale.client });
        }
      }

      await addSale(sale);
      handleNavigate('sales');
      addToast('Venta/Cotización guardada exitosamente', 'success');
    } catch (error) {
      addToast('Error al guardar la venta/cotización', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSaleStatus = async (id: string, status: Sale['status']) => {
    try {
      const sale = sales.find(s => s.id === id);
      if (sale) {
        await updateSale(id, { ...sale, status });
        addToast('Estado actualizado', 'success');
      }
    } catch (error) {
      addToast('Error al actualizar estado', 'error');
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await deleteSale(id);
      addToast('Venta/Cotización eliminada', 'success');
      handleNavigate('sales');
    } catch (error) {
      addToast('Error al eliminar', 'error');
    }
  };

  const selectedCheckIn = checkIns.find(c => c.id === selectedCheckInId);

  if (!user) {
    return <AuthScreen onLogin={login} onGoogleLogin={loginWithGoogle} />;
  }

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate} onLogout={logout} user={user}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {currentView === 'dashboard' && (
        <Dashboard stats={stats} checkIns={checkIns} onViewDetails={handleViewDetails} onNavigate={handleNavigate} />
      )}
      {currentView === 'list' && (
        <CheckInList checkIns={checkIns} onViewDetails={handleViewDetails} onDelete={handleDeleteCheckIn} />
      )}
      {currentView === 'new' && (
        <NewCheckIn 
          onSave={handleSaveCheckIn} 
          onCancel={() => handleNavigate('list')} 
          checkIns={checkIns} 
          clients={clients}
          isSaving={isSaving}
        />
      )}
      {currentView === 'products' && (
        <ProductCatalog 
          products={products} 
          onAddProduct={handleAddProduct} 
          onUpdateProduct={handleUpdateProduct} 
          onDeleteProduct={handleDeleteProduct} 
          onDeleteAllProducts={handleDeleteAllProducts}
        />
      )}
      {currentView === 'clients' && (
        <ClientList 
          checkIns={checkIns} 
          clients={clients}
          onAddClient={handleAddClient}
          onUpdateClient={handleUpdateClientData}
          onDeleteClient={handleDeleteClient}
        />
      )}
      {currentView === 'sales' && (
        <SalesList
          sales={sales}
          onNewSale={() => handleNavigate('new-sale')}
          onViewSale={(sale) => {
            setSelectedSaleId(sale.id);
            handleNavigate('sale-details');
          }}
        />
      )}
      {currentView === 'new-sale' && (
        <NewSale
          onSave={handleSaveSale}
          onCancel={() => handleNavigate('sales')}
          clients={clients}
          products={products}
          isSaving={isSaving}
        />
      )}
      {currentView === 'sale-details' && selectedSaleId && (
        <SaleDetails
          sale={sales.find(s => s.id === selectedSaleId)!}
          onBack={() => handleNavigate('sales')}
          onUpdateStatus={handleUpdateSaleStatus}
          onDelete={handleDeleteSale}
        />
      )}
      {currentView === 'reports' && (
        <SalesSummary checkIns={checkIns} sales={sales} />
      )}
      {currentView === 'settings' && (
        <CompanySettings />
      )}
      {currentView === 'details' && selectedCheckIn && (
        <CheckInDetails
          checkIn={selectedCheckIn}
          checkIns={checkIns}
          products={products}
          onBack={() => handleNavigate('list')}
          onAddQuote={handleAddQuote}
          onUpdateQuote={handleUpdateQuote}
          onMarkQuoteAsSent={handleMarkQuoteAsSent}
          onUnlockQuote={unlockQuote}
          onUpdateStatus={handleUpdateStatus}
          onUpdateClient={handleUpdateClient}
          onUpdateNotes={updateNotes}
          onDelete={handleDeleteCheckIn}
        />
      )}
      {currentView === 'details' && !selectedCheckIn && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Ingreso no encontrado</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-md">
            El ingreso que buscas no existe o ha sido eliminado. Por favor verifica la información e intenta nuevamente.
          </p>
          <button
            onClick={() => handleNavigate('list')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Volver al Listado
          </button>
        </div>
      )}
    </Layout>
  );
}
