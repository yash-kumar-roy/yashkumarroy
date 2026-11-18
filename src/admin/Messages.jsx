import { useEffect, useState } from 'react';
import { api, formatDate } from '../lib/api.js';

export default function Messages({ onAuthError }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/contact', { auth: true })
      .then((r) => setItems(r.data))
      .catch((e) => {
        onAuthError(e);
        setError(e.message);
        setItems([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(id) {
    if (!window.confirm('Delete this message? This can’t be undone.')) return;
    try {
      await api(`/api/contact/${id}`, { method: 'DELETE', auth: true });
      setItems((list) => list.filter((m) => m._id !== id));
    } catch (e) {
      onAuthError(e);
      setError(e.message);
    }
  }

  return (
    <div className="a-form">
      <header className="a-page-head">
        <div>
          <h1>Messages</h1>
          <p className="a-muted">The 50 most recent messages sent through the contact form.</p>
        </div>
      </header>
      {error && <p className="a-notice is-error">{error}</p>}
      {items === null && <p className="a-muted">Loading messages…</p>}
      {items?.length === 0 && !error && <p className="a-empty">No messages yet.</p>}
      <ul className="a-messages">
        {items?.map((m) => (
          <li key={m._id} className="a-card">
            <div className="a-message-head">
              <div>
                <strong>{m.name}</strong>{' '}
                <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}`}>{m.email}</a>
                {m.phone && <span className="a-muted"> · {m.phone}</span>}
              </div>
              <div className="a-row">
                <time className="a-muted">{formatDate(m.createdAt)}</time>
                <button type="button" className="a-btn a-btn-text" onClick={() => remove(m._id)}>
                  Delete
                </button>
              </div>
            </div>
            <p className="a-message-body">{m.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
