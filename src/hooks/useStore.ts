import { useState, useEffect, useCallback } from 'react';
import { CheckIn, Quote, Product, Client, Sale } from '../types';
import { 
  subscribeCheckIns, 
  subscribeProducts, 
  subscribeClients, 
  subscribeSales,
  saveCheckInToFirestore,
  deleteCheckInFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  clearAllProductsFromFirestore,
  saveClientToFirestore,
  deleteClientFromFirestore,
  saveSaleToFirestore,
  deleteSaleFromFirestore,
  seedServerDataToFirestore
} from '../lib/firestoreService';

export function useStore() {
  const [rawCheckIns, setRawCheckIns] = useState<CheckIn[]>([]);
  const [rawSales, setRawSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Dynamically link clients to check-ins so they are always in sync
  const checkIns = rawCheckIns.map(checkIn => {
    const linkedClient = checkIn.clientId 
      ? clients.find(c => c.id === checkIn.clientId)
      : clients.find(c => 
          (c.email && c.email === checkIn.client?.email) || 
          (c.phone && c.phone === checkIn.client?.phone)
        );
        
    return {
      ...checkIn,
      client: linkedClient || checkIn.client
    };
  });

  // Dynamically link clients to sales
  const sales = rawSales.map(sale => {
    const linkedClient = sale.clientId 
      ? clients.find(c => c.id === sale.clientId)
      : clients.find(c => 
          (c.email && c.email === sale.client?.email) || 
          (c.phone && c.phone === sale.client?.phone)
        );
        
    return {
      ...sale,
      client: linkedClient || sale.client
    };
  });

  // 1. Initial REST fetch & seed to Firestore
  const fetchData = useCallback(async () => {
    try {
      const [checkInsRes, productsRes, clientsRes, salesRes] = await Promise.all([
        fetch('/api/checkins'),
        fetch('/api/products'),
        fetch('/api/clients'),
        fetch('/api/sales')
      ]);
      
      if (checkInsRes.ok && productsRes.ok && clientsRes.ok && salesRes.ok) {
        const checkInsData = await checkInsRes.json();
        const productsData = await productsRes.json();
        const clientsData = await clientsRes.json();
        const salesData = await salesRes.json();
        
        setRawCheckIns(checkInsData);
        setProducts(productsData);
        setClients(clientsData);
        setRawSales(salesData);
      }
    } catch (error) {
      console.error('Error fetching data from local backend:', error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch from backend
    fetchData().then(() => {
      // Seed to Firestore if Firestore is empty
      seedServerDataToFirestore();
    });

    // Subscribe to Firestore Real-Time updates across devices
    const unsubCheckIns = subscribeCheckIns((data) => setRawCheckIns(data));
    const unsubProducts = subscribeProducts((data) => setProducts(data));
    const unsubClients = subscribeClients((data) => setClients(data));
    const unsubSales = subscribeSales((data) => setRawSales(data));

    return () => {
      unsubCheckIns();
      unsubProducts();
      unsubClients();
      unsubSales();
    };
  }, [fetchData]);

  // CRUD Methods with dual local + Firestore persistence
  const addClient = async (client: Client) => {
    const newClient = { ...client, id: client.id || Math.random().toString(36).substring(2, 15) };
    setClients(prev => [...prev.filter(c => c.id !== newClient.id), newClient]);

    // Local DB
    fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient),
    }).catch(e => console.error('Error saving client to local DB:', e));

    // Firestore Sync
    await saveClientToFirestore(newClient);
    return newClient;
  };

  const updateClientData = async (id: string, client: Client) => {
    setClients(prev => prev.map(c => c.id === id ? client : c));

    // Local DB
    fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    }).catch(e => console.error('Error updating client in local DB:', e));

    // Firestore Sync
    await saveClientToFirestore(client);
  };

  const deleteClient = async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));

    // Local DB
    fetch(`/api/clients/${id}`, { method: 'DELETE' }).catch(e => console.error(e));

    // Firestore Sync
    await deleteClientFromFirestore(id);
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    };
    
    setRawSales(prev => [newSale, ...prev]);

    // Local DB
    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSale),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveSaleToFirestore(newSale);
  };

  const updateSale = async (id: string, sale: Sale) => {
    setRawSales(prev => prev.map(s => s.id === id ? sale : s));

    // Local DB
    fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveSaleToFirestore(sale);
  };

  const deleteSale = async (id: string) => {
    setRawSales(prev => prev.filter(s => s.id !== id));

    // Local DB
    fetch(`/api/sales/${id}`, { method: 'DELETE' }).catch(e => console.error(e));

    // Firestore Sync
    await deleteSaleFromFirestore(id);
  };

  const addCheckIn = async (checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => {
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: checkIn.printer.status, date: new Date().toISOString() }],
    };
    
    setRawCheckIns(prev => [newCheckIn, ...prev]);

    // Local DB
    fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(newCheckIn);
  };

  const updateCheckInStatus = async (id: string, status: CheckIn['printer']['status']) => {
    const checkInToUpdate = checkIns.find(c => c.id === id);
    if (!checkInToUpdate || checkInToUpdate.printer.status === status) return;

    const history = checkInToUpdate.statusHistory || [];
    const updatedCheckIn: CheckIn = { 
      ...checkInToUpdate, 
      printer: { ...checkInToUpdate.printer, status },
      statusHistory: [...history, { status, date: new Date().toISOString() }]
    };

    setRawCheckIns(prev => prev.map(c => c.id === id ? updatedCheckIn : c));

    // Local DB
    fetch(`/api/checkins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(updatedCheckIn);
  };

  const addQuote = async (checkInId: string, quote: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const checkInToUpdate = checkIns.find(c => c.id === checkInId);
    if (!checkInToUpdate) return;

    const newQuote: Quote = {
      ...quote,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    const history = checkInToUpdate.statusHistory || [];
    const newStatusHistory = checkInToUpdate.printer.status !== 'Cotizado' 
      ? [...history, { status: 'Cotizado', date: new Date().toISOString() }]
      : history;

    const updatedCheckIn: CheckIn = { 
      ...checkInToUpdate, 
      quote: newQuote, 
      printer: { ...checkInToUpdate.printer, status: 'Cotizado' },
      statusHistory: newStatusHistory
    };

    setRawCheckIns(prev => prev.map(c => c.id === checkInId ? updatedCheckIn : c));

    // Local DB
    fetch(`/api/checkins/${checkInId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(updatedCheckIn);
  };

  const updateQuote = async (checkInId: string, quote: Quote) => {
    const checkInToUpdate = checkIns.find(c => c.id === checkInId);
    if (!checkInToUpdate) return;

    const updatedCheckIn: CheckIn = { ...checkInToUpdate, quote };

    setRawCheckIns(prev => prev.map(c => c.id === checkInId ? updatedCheckIn : c));

    // Local DB
    fetch(`/api/checkins/${checkInId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(updatedCheckIn);
  };

  const markQuoteAsSent = async (checkInId: string) => {
    const checkInToUpdate = checkIns.find(c => c.id === checkInId);
    if (!checkInToUpdate || !checkInToUpdate.quote) return;

    const updatedCheckIn: CheckIn = { ...checkInToUpdate, quote: { ...checkInToUpdate.quote, status: 'sent' } };

    setRawCheckIns(prev => prev.map(c => c.id === checkInId ? updatedCheckIn : c));

    // Local DB
    fetch(`/api/checkins/${checkInId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(updatedCheckIn);
  };

  const unlockQuote = async (checkInId: string) => {
    const checkInToUpdate = checkIns.find(c => c.id === checkInId);
    if (!checkInToUpdate || !checkInToUpdate.quote) return;

    const updatedCheckIn: CheckIn = { ...checkInToUpdate, quote: { ...checkInToUpdate.quote, status: 'draft' } };

    setRawCheckIns(prev => prev.map(c => c.id === checkInId ? updatedCheckIn : c));

    // Local DB
    fetch(`/api/checkins/${checkInId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(updatedCheckIn);
  };

  const updateClient = async (id: string, client: CheckIn['client']) => {
    const checkInToUpdate = checkIns.find(c => c.id === id);
    if (!checkInToUpdate) return;

    const updatedCheckIn: CheckIn = { 
      ...checkInToUpdate, 
      client,
      clientId: client.id || checkInToUpdate.clientId 
    };

    setRawCheckIns(prev => prev.map(c => c.id === id ? updatedCheckIn : c));

    // Local DB
    fetch(`/api/checkins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(updatedCheckIn);
  };

  const deleteCheckIn = async (id: string) => {
    setRawCheckIns(prev => prev.filter(c => c.id !== id));

    // Local DB
    fetch(`/api/checkins/${id}`, { method: 'DELETE' }).catch(e => console.error(e));

    // Firestore Sync
    await deleteCheckInFromFirestore(id);
  };

  const updateNotes = async (id: string, notes: string) => {
    const checkInToUpdate = checkIns.find(c => c.id === id);
    if (!checkInToUpdate) return;

    const updatedCheckIn: CheckIn = { ...checkInToUpdate, notes };

    setRawCheckIns(prev => prev.map(c => c.id === id ? updatedCheckIn : c));

    // Local DB
    fetch(`/api/checkins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCheckIn),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveCheckInToFirestore(updatedCheckIn);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substring(2, 15),
    };
    setProducts(prev => [...prev, newProduct]);

    // Local DB
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveProductToFirestore(newProduct);
  };

  const updateProduct = async (id: string, product: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? product : p));

    // Local DB
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    }).catch(e => console.error(e));

    // Firestore Sync
    await saveProductToFirestore(product);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    // Local DB
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(e => console.error(e));

    // Firestore Sync
    await deleteProductFromFirestore(id);
  };

  const deleteAllProducts = async () => {
    setProducts([]);

    // Local DB
    fetch('/api/products', { method: 'DELETE' }).catch(e => console.error(e));

    // Firestore Sync
    await clearAllProductsFromFirestore();
  };

  const stats = {
    totalSales: checkIns
      .filter(c => c.printer.status === 'Entregado' && c.quote)
      .reduce((sum, c) => sum + (c.quote?.total || 0), 0) + 
      sales
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.total, 0),
    pendingRepairs: checkIns.filter(c => ['Ingresado', 'Cotizado', 'Aceptado'].includes(c.printer.status)).length,
    repairedToday: checkIns.filter(c => c.printer.status === 'Reparado').length,
    totalClients: new Set([
      ...checkIns.map(c => c.client.email || c.client.phone),
      ...sales.map(s => s.client.email || s.client.phone),
      ...clients.map(c => c.email || c.phone)
    ].filter(Boolean)).size,
  };

  return { 
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
  };
}
