import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { api, getToken, setToken } from '../lib/api.js';
import ProfileEditor from './ProfileEditor.jsx';
import ProjectsEditor from './ProjectsEditor.jsx';
import BlogEditor from './BlogEditor.jsx';
import Messages from './Messages.jsx';
import './admin.css';

function Login({ onLogin, configured }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api('/api/admin/login', { method: 'POST', body: { password } });
      setToken(token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-login">
      <form className="a-card a-login-card" onSubmit={submit}>
        <h1>Portfolio admin</h1>
        {configured === false ? (
          <p className="a-notice is-error">
            Admin login is turned off. Add <code>ADMIN_PASSWORD=your-password</code> to the <code>.env</code> file and restart the server.
          </p>
        ) : (
          <>
            <p className="a-muted">Log in to edit your profile, projects and blog posts.</p>
            <div className="a-field">
              <label htmlFor="pw">Password</label>
              <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            </div>
            {error && <p className="a-notice is-error">{error}</p>}
            <button className="a-btn" disabled={busy || !password}>
              {busy ? 'Logging in…' : 'Log in'}
            </button>
          </>
        )}
        <Link to="/" className="a-back">← Back to the site</Link>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [status, setStatus] = useState({ checked: false, authenticated: false, configured: null, database: true });

  async function check() {
    try {
      const me = await api('/api/admin/me', { auth: true });
      if (!me.authenticated && getToken()) setToken('');
      setStatus({ checked: true, ...me });
    } catch {
      setStatus({ checked: true, authenticated: false, configured: null, database: false });
    }
  }

  useEffect(() => {
    check();
    document.title = 'Admin | Portfolio';
  }, []);

  function logout() {
    setToken('');
    setStatus((s) => ({ ...s, authenticated: false }));
  }

  if (!status.checked) return <p className="admin-loading">Checking your session…</p>;
  if (!status.authenticated) return <Login onLogin={check} configured={status.configured} />;

  // Child editors call this when the API says the session expired.
  const onAuthError = (err) => {
    if (err?.status === 401) logout();
  };

  return (
    <div className="a-shell">
      <aside className="a-side">
        <p className="a-brand">Portfolio admin</p>
        <nav aria-label="Admin">
          <NavLink end to="/admin">Profile</NavLink>
          <NavLink to="/admin/projects">Projects</NavLink>
          <NavLink to="/admin/blog">Blog</NavLink>
          <NavLink to="/admin/messages">Messages</NavLink>
        </nav>
        <div className="a-side-foot">
          <a href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button type="button" className="a-btn a-btn-text" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="a-main">
        {!status.database && (
          <p className="a-notice is-error">
            MongoDB isn’t connected, so changes can’t be saved. Check <code>MONGODB_URI</code> in <code>.env</code> and restart the server.
          </p>
        )}
        <Routes>
          <Route index element={<ProfileEditor onAuthError={onAuthError} />} />
          <Route path="projects" element={<ProjectsEditor onAuthError={onAuthError} />} />
          <Route path="blog" element={<BlogEditor onAuthError={onAuthError} />} />
          <Route path="messages" element={<Messages onAuthError={onAuthError} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
