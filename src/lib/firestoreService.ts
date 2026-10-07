import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { CheckIn, Product, Client, Sale, CompanySettings } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collections references
const checkinsCol = collection(db, 'checkins');
const productsCol = collection(db, 'products');
const clientsCol = collection(db, 'clients');
const salesCol = collection(db, 'sales');
const settingsCol = collection(db, 'company_settings');

// Real-time Subscriptions
export function subscribeCheckIns(onUpdate: (data: CheckIn[]) => void) {
  return onSnapshot(
    checkinsCol,
    (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as CheckIn);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => handleFirestoreError(error, OperationType.GET, 'checkins')
  );
}

export function subscribeProducts(onUpdate: (data: Product[]) => void) {
  return onSnapshot(
    productsCol,
    (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as Product);
      onUpdate(list);
    },
    (error) => handleFirestoreError(error, OperationType.GET, 'products')
  );
}

export function subscribeClients(onUpdate: (data: Client[]) => void) {
  return onSnapshot(
    clientsCol,
    (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as Client);
      onUpdate(list);
    },
    (error) => handleFirestoreError(error, OperationType.GET, 'clients')
  );
}

export function subscribeSales(onUpdate: (data: Sale[]) => void) {
  return onSnapshot(
    salesCol,
    (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as Sale);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => handleFirestoreError(error, OperationType.GET, 'sales')
  );
}

export function subscribeSettings(onUpdate: (data: CompanySettings) => void) {
  return onSnapshot(
    doc(db, 'company_settings', 'default'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as CompanySettings);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, 'company_settings/default')
  );
}

// Firestore Operations

// CheckIns
export async function saveCheckInToFirestore(checkIn: CheckIn) {
  const path = `checkins/${checkIn.id}`;
  try {
    const cleanData = JSON.parse(JSON.stringify(checkIn));
    await setDoc(doc(db, 'checkins', checkIn.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCheckInFromFirestore(id: string) {
  const path = `checkins/${id}`;
  try {
    await deleteDoc(doc(db, 'checkins', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Products
export async function saveProductToFirestore(product: Product) {
  const path = `products/${product.id}`;
  try {
    const cleanData = JSON.parse(JSON.stringify(product));
    await setDoc(doc(db, 'products', product.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(id: string) {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllProductsFromFirestore() {
  try {
    const productsSnap = await getDocs(productsCol);
    for (const docSnap of productsSnap.docs) {
      await deleteDoc(doc(db, 'products', docSnap.id));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'products');
  }
}

// Clients
export async function saveClientToFirestore(client: Client) {
  const path = `clients/${client.id}`;
  try {
    const cleanData = JSON.parse(JSON.stringify(client));
    await setDoc(doc(db, 'clients', client.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClientFromFirestore(id: string) {
  const path = `clients/${id}`;
  try {
    await deleteDoc(doc(db, 'clients', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sales
export async function saveSaleToFirestore(sale: Sale) {
  const path = `sales/${sale.id}`;
  try {
    const cleanData = JSON.parse(JSON.stringify(sale));
    await setDoc(doc(db, 'sales', sale.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSaleFromFirestore(id: string) {
  const path = `sales/${id}`;
  try {
    await deleteDoc(doc(db, 'sales', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Settings
export async function saveSettingsToFirestore(settings: CompanySettings) {
  const path = 'company_settings/default';
  try {
    const cleanData = JSON.parse(JSON.stringify(settings));
    await setDoc(doc(db, 'company_settings', 'default'), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Push Subscriptions Sync
const pushCol = collection(db, 'push_subscriptions');

export async function savePushSubscriptionToFirestore(sub: any) {
  const path = 'push_subscriptions';
  try {
    const rawEndpoint = sub.endpoint || '';
    // Create a safe document ID from endpoint hash
    const safeDocId = btoa(rawEndpoint).replace(/[/+=]/g, '').substring(0, 60) || `sub_${Date.now()}`;
    const cleanData = JSON.parse(JSON.stringify({
      endpoint: sub.endpoint,
      keys: sub.keys,
      updatedAt: new Date().toISOString()
    }));
    await setDoc(doc(db, 'push_subscriptions', safeDocId), cleanData);
  } catch (error) {
    console.warn('Could not save push subscription to Firestore (continuing with SQLite):', error);
  }
}

// Migration / Seeding Helper: Syncs initial server data to Firestore if Firestore is empty
export async function seedServerDataToFirestore() {
  try {
    const checkinsSnap = await getDocs(checkinsCol);
    if (checkinsSnap.empty) {
      const res = await fetch('/api/checkins');
      if (res.ok) {
        const checkinsData: CheckIn[] = await res.json();
        for (const c of checkinsData) {
          await saveCheckInToFirestore(c);
        }
      }
    }

    const clientsSnap = await getDocs(clientsCol);
    if (clientsSnap.empty) {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const clientsData: Client[] = await res.json();
        for (const cl of clientsData) {
          await saveClientToFirestore(cl);
        }
      }
    }

    const salesSnap = await getDocs(salesCol);
    if (salesSnap.empty) {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const salesData: Sale[] = await res.json();
        for (const s of salesData) {
          await saveSaleToFirestore(s);
        }
      }
    }
  } catch (err) {
    console.error('Error seeding data to Firestore:', err);
  }
}
