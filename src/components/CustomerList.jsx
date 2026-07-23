import { useState } from 'react';

export default function CustomerList({ customers, onSelect, onAddCustomer }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const totalOwed = customers.reduce((sum, c) => sum + c.balance, 0);
  const sorted = [...customers].sort((a, b) => b.balance - a.balance);

  function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCustomer(newName.trim());
    setNewName('');
    setShowAdd(false);
  }

  return (
    <div className="screen">
      <div className="summary-card">
        <span className="summary-label">Kabuuang Utang</span>
        <span className="summary-amount">₱{totalOwed.toFixed(2)}</span>
      </div>

      <div className="list-header">
        <h2>Mga Suki</h2>
        <button className="btn-round" onClick={() => setShowAdd(true)}>+</button>
      </div>

      {sorted.length === 0 && (
        <p className="empty-state">Wala pang customer. I-tap ang + para magdagdag.</p>
      )}

      <ul className="customer-list">
        {sorted.map((c) => (
          <li key={c.id} className="customer-row" onClick={() => onSelect(c.id)}>
            <span className="customer-name">{c.name}</span>
            <span className={`customer-balance ${c.balance === 0 ? 'zero' : ''}`}>
              {c.balance === 0 ? 'Bayad na' : `₱${c.balance.toFixed(2)}`}
            </span>
          </li>
        ))}
      </ul>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleAdd}>
            <h3>Bagong Suki</h3>
            <input
              autoFocus
              type="text"
              placeholder="Pangalan ng customer"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Kanselahin</button>
              <button type="submit" className="btn-primary">Idagdag</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
