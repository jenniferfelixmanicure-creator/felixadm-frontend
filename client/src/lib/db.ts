// IndexedDB wrapper for local storage
const DB_NAME = 'FelixADM';
const DB_VERSION = 1;

export interface Client {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Product {
  id?: number;
  name: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  createdAt: string;
}

export interface SaleItem {
  id?: number;
  productId: number;
  productName: string;
  productBrand: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discount: number;
}

export interface Installment {
  id?: number;
  saleId: number;
  clientId: number;
  clientName: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
}

export interface Sale {
  id?: number;
  clientId: number;
  clientName: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  amountPaid: number;
  paymentType: 'cash' | 'card' | 'installments';
  installmentsCount: number;
  status: 'pending' | 'partiallyPaid' | 'paid';
  saleDate: string;
  notes?: string;
  items?: SaleItem[];
  createdAt: string;
}

export interface Payment {
  id?: number;
  saleId: number;
  installmentId?: number;
  clientId: number;
  clientName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  createdAt: string;
}

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('installments')) {
        db.createObjectStore('installments', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('payments')) {
        db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('saleItems')) {
        db.createObjectStore('saleItems', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    db = await initDB();
  }
  return db;
}

// Clients
export async function addClient(client: Omit<Client, 'id'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    const request = store.add(client);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getClients(): Promise<Client[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readonly');
    const store = transaction.objectStore('clients');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getClient(id: number): Promise<Client | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readonly');
    const store = transaction.objectStore('clients');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateClient(id: number, client: Partial<Client>): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    const existing = store.get(id);
    existing.onsuccess = () => {
      const updated = { ...existing.result, ...client, id };
      const request = store.put(updated);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    };
  });
}

export async function deleteClient(id: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Products
export async function addProduct(product: Omit<Product, 'id'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    const request = store.add(product);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    const existing = store.get(id);
    existing.onsuccess = () => {
      const updated = { ...existing.result, ...product, id };
      const request = store.put(updated);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    };
  });
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Sales
export async function addSale(sale: Omit<Sale, 'id'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales', 'saleItems'], 'readwrite');
    const saleStore = transaction.objectStore('sales');
    const itemsStore = transaction.objectStore('saleItems');
    
    const items = sale.items || [];
    const saleWithoutItems = { ...sale };
    delete (saleWithoutItems as any).items;
    
    const saleRequest = saleStore.add(saleWithoutItems);
    
    saleRequest.onsuccess = () => {
      const saleId = saleRequest.result as number;
      
      items.forEach(item => {
        itemsStore.add({ ...item, saleId });
      });
      
      resolve(saleId);
    };
    
    saleRequest.onerror = () => reject(saleRequest.error);
  });
}

export async function getSales(): Promise<Sale[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales', 'saleItems'], 'readonly');
    const saleStore = transaction.objectStore('sales');
    const itemsStore = transaction.objectStore('saleItems');
    
    const saleRequest = saleStore.getAll();
    
    saleRequest.onsuccess = () => {
      const sales = saleRequest.result;
      const itemsRequest = itemsStore.getAll();
      
      itemsRequest.onsuccess = () => {
        const items = itemsRequest.result;
        const result = sales.map(sale => ({
          ...sale,
          items: items.filter(item => item.saleId === sale.id)
        }));
        resolve(result);
      };
    };
    
    saleRequest.onerror = () => reject(saleRequest.error);
  });
}

export async function getSale(id: number): Promise<Sale | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales', 'saleItems'], 'readonly');
    const saleStore = transaction.objectStore('sales');
    const itemsStore = transaction.objectStore('saleItems');
    
    const saleRequest = saleStore.get(id);
    
    saleRequest.onsuccess = () => {
      const sale = saleRequest.result;
      if (!sale) {
        resolve(undefined);
        return;
      }
      
      const itemsRequest = itemsStore.getAll();
      itemsRequest.onsuccess = () => {
        const items = itemsRequest.result;
        resolve({
          ...sale,
          items: items.filter(item => item.saleId === sale.id)
        });
      };
    };
    
    saleRequest.onerror = () => reject(saleRequest.error);
  });
}

export async function updateSale(id: number, sale: Partial<Sale>): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales'], 'readwrite');
    const store = transaction.objectStore('sales');
    const existing = store.get(id);
    existing.onsuccess = () => {
      const updated = { ...existing.result, ...sale, id };
      delete (updated as any).items;
      const request = store.put(updated);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    };
  });
}

// Installments
export async function addInstallment(installment: Omit<Installment, 'id'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['installments'], 'readwrite');
    const store = transaction.objectStore('installments');
    const request = store.add(installment);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getInstallments(): Promise<Installment[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['installments'], 'readonly');
    const store = transaction.objectStore('installments');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getInstallmentsBySale(saleId: number): Promise<Installment[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['installments'], 'readonly');
    const store = transaction.objectStore('installments');
    const request = store.getAll();
    request.onsuccess = () => {
      const result = request.result.filter(inst => inst.saleId === saleId);
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateInstallment(id: number, installment: Partial<Installment>): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['installments'], 'readwrite');
    const store = transaction.objectStore('installments');
    const existing = store.get(id);
    existing.onsuccess = () => {
      const updated = { ...existing.result, ...installment, id };
      const request = store.put(updated);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    };
  });
}

// Payments
export async function addPayment(payment: Omit<Payment, 'id'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');
    const request = store.add(payment);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getPayments(): Promise<Payment[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readonly');
    const store = transaction.objectStore('payments');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getPaymentsBySale(saleId: number): Promise<Payment[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readonly');
    const store = transaction.objectStore('payments');
    const request = store.getAll();
    request.onsuccess = () => {
      const result = request.result.filter(payment => payment.saleId === saleId);
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}
