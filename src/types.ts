export interface Client {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Printer {
  brand: string;
  model: string;
  serialNumber?: string;
  problem: string;
  status: 'Ingresado' | 'Cotizado' | 'Aceptado' | 'Reparado' | 'Entregado';
}

export interface QuoteItem {
  id: string;
  description: string;
  price: number;
  cost?: number;
  category?: string;
  notes?: string;
}

export interface Quote {
  id: string;
  items: QuoteItem[];
  subtotal?: number;
  taxRate?: number; // Percentage (e.g. 0, 8, 16)
  taxAmount?: number;
  total: number;
  createdAt: string;
  status?: 'draft' | 'sent';
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  cost?: number;
  category?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  clientId?: string;
  client: Client;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxRate?: number; // Percentage (e.g. 0, 8, 16)
  taxAmount?: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  category: string;
  stock?: number;
  compatibleModels?: string;
}

export interface CheckIn {
  id: string;
  clientId?: string;
  client: Client;
  printer: Printer;
  quote?: Quote;
  quoteB?: Quote;
  notes?: string;
  statusHistory?: { status: string; date: string }[];
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  logo: string;
  email: string;
  website: string;
}
