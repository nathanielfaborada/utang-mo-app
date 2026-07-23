import { useEffect, useState } from 'react';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import {
  getCustomers,
  addCustomer,
  addEntry,
  getEntriesForCustomer,
  deleteCustomer,
  exportAllData,
  downloadJSON,
} from './db/db';
import './App.css';

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshCustomers();
  }, []);

  useEffect(() => {
    if (selectedId != null) {
      getEntriesForCustomer(selectedId).then(setEntries);
    }
  }, [selectedId, customers]);

  async function refreshCustomers() {
    const list = await getCustomers();
    setCustomers(list);
    setLoading(false);
  }

  async function handleAddCustomer(name) {
    await addCustomer(name);
    await refreshCustomers();
  }

  async function handleAddEntry(customerId, type, amount, note) {
    await addEntry(customerId, type, amount, note);
    await refreshCustomers();
  }

  async function handleDelete(customerId) {
    if (!confirm('Sigurado kang tatanggalin ang customer na ito?')) return;
    await deleteCustomer(customerId);
    setSelectedId(null);
    await refreshCustomers();
  }

  async function handleExport() {
    const data = await exportAllData();
    downloadJSON(data);
  }

  const selectedCustomer = customers.find((c) => c.id === selectedId);

  if (loading) {
    return <div className="screen center-text">Loading...</div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">
          <span className="logo-badge">U</span>Utang Mo
        </span>
        {!selectedCustomer && (
          <button className="export-btn" onClick={handleExport}>Export</button>
        )}
      </header>

      {selectedCustomer ? (
        <CustomerDetail
          customer={selectedCustomer}
          entries={entries}
          onBack={() => setSelectedId(null)}
          onAddEntry={handleAddEntry}
          onDelete={handleDelete}
        />
      ) : (
        <CustomerList
          customers={customers}
          onSelect={setSelectedId}
          onAddCustomer={handleAddCustomer}
        />
      )}
    </div>
  );
}
