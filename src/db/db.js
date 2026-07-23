// Simple IndexedDB wrapper — offline-first, no server needed.
// Two stores: "customers" (name + running balance) and "entries" (utang/bayad log per customer).

const DB_NAME = 'utang-mo-db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('customers')) {
        const store = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains('entries')) {
        const store = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
        store.createIndex('customerId', 'customerId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(storeName, mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------- Customers ----------

export async function addCustomer(name) {
  const db = await openDB();
  const tx = db.transaction('customers', 'readwrite');
  const store = tx.objectStore('customers');
  const id = await requestToPromise(store.add({ name, balance: 0, createdAt: Date.now() }));
  return id;
}

export async function getCustomers() {
  const db = await openDB();
  const tx = db.transaction('customers', 'readonly');
  const store = tx.objectStore('customers');
  return requestToPromise(store.getAll());
}

export async function getCustomer(id) {
  const db = await openDB();
  const tx = db.transaction('customers', 'readonly');
  const store = tx.objectStore('customers');
  return requestToPromise(store.get(id));
}

async function updateCustomerBalance(store, customerId, delta) {
  const customer = await requestToPromise(store.get(customerId));
  if (!customer) throw new Error('Customer not found');
  customer.balance += delta;
  await requestToPromise(store.put(customer));
  return customer;
}

export async function deleteCustomer(id) {
  const db = await openDB();
  const tx = db.transaction(['customers', 'entries'], 'readwrite');
  const customerStore = tx.objectStore('customers');
  const entryStore = tx.objectStore('entries');
  const index = entryStore.index('customerId');
  const entries = await requestToPromise(index.getAll(id));
  for (const entry of entries) {
    await requestToPromise(entryStore.delete(entry.id));
  }
  await requestToPromise(customerStore.delete(id));
}

// ---------- Entries (utang / bayad) ----------

// type: 'utang' (adds to balance) or 'bayad' (subtracts from balance)
export async function addEntry(customerId, type, amount, note = '') {
  const db = await openDB();
  const tx = db.transaction(['customers', 'entries'], 'readwrite');
  const customerStore = tx.objectStore('customers');
  const entryStore = tx.objectStore('entries');

  const delta = type === 'utang' ? amount : -amount;
  await updateCustomerBalance(customerStore, customerId, delta);

  const entryId = await requestToPromise(
    entryStore.add({ customerId, type, amount, note, date: Date.now() })
  );
  return entryId;
}

export async function getEntriesForCustomer(customerId) {
  const db = await openDB();
  const tx = db.transaction('entries', 'readonly');
  const store = tx.objectStore('entries');
  const index = store.index('customerId');
  const entries = await requestToPromise(index.getAll(customerId));
  return entries.sort((a, b) => b.date - a.date);
}

// ---------- Export (backup) ----------

export async function exportAllData() {
  const customers = await getCustomers();
  const db = await openDB();
  const tx = db.transaction('entries', 'readonly');
  const store = tx.objectStore('entries');
  const entries = await requestToPromise(store.getAll());
  return { customers, entries, exportedAt: new Date().toISOString() };
}

export function downloadJSON(data, filename = 'utang-mo-backup.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
