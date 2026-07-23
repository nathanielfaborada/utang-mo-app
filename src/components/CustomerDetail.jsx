import { useState } from 'react';

export default function CustomerDetail({ customer, entries, onBack, onAddEntry, onDelete }) {
  const [type, setType] = useState('utang');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    onAddEntry(customer.id, type, value, note.trim());
    setAmount('');
    setNote('');
  }

  return (
    <div className="screen">
      <button className="back-btn" onClick={onBack}>‹ Balik</button>

      <div className="detail-header">
        <h2>{customer.name}</h2>
        <span className={`customer-balance large ${customer.balance === 0 ? 'zero' : ''}`}>
          {customer.balance === 0 ? 'Bayad na' : `₱${customer.balance.toFixed(2)}`}
        </span>
      </div>

      <form className="entry-form" onSubmit={handleSubmit}>
        <div className="type-toggle">
          <button
            type="button"
            className={type === 'utang' ? 'active utang' : ''}
            onClick={() => setType('utang')}
          >
            + Utang
          </button>
          <button
            type="button"
            className={type === 'bayad' ? 'active bayad' : ''}
            onClick={() => setType('bayad')}
          >
            − Bayad
          </button>
        </div>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Halaga"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Note (optional) — hal. bigas, sardinas"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className="btn-primary full">
          {type === 'utang' ? 'Idagdag na Utang' : 'I-log na Bayad'}
        </button>
      </form>

      <h3 className="history-title">Kasaysayan</h3>
      {entries.length === 0 && <p className="empty-state">Wala pang record.</p>}
      <ul className="history-list">
        {entries.map((e) => (
          <li key={e.id} className={`history-row ${e.type}`}>
            <div>
              <span className="history-type">{e.type === 'utang' ? 'Utang' : 'Bayad'}</span>
              {e.note && <span className="history-note">{e.note}</span>}
            </div>
            <div className="history-right">
              <span className="history-amount">
                {e.type === 'utang' ? '+' : '−'}₱{e.amount.toFixed(2)}
              </span>
              <span className="history-date">
                {new Date(e.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <button className="btn-danger" onClick={() => onDelete(customer.id)}>
        Tanggalin ang Customer
      </button>
    </div>
  );
}
