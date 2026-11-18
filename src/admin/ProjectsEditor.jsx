import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useSite } from '../lib/SiteContext.jsx';
import { Check, Field, GalleryField, ListField, Notice, Select, TextArea } from './fields.jsx';

const blank = {
  title: '', slug: '', category: '', description: '', details: '', result: '', year: '',
  stack: [], highlights: [], images: [], liveUrl: '', githubUrl: '', demoType: 'external',
  featured: false, order: 100, icon: '💻'
};

function ProjectForm({ initial, categories, onSaved, onDeleted, onAuthError }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isNew = !form._id;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const r = isNew
        ? await api('/api/projects', { method: 'POST', body: form, auth: true })
        : await api(`/api/projects/${form._id}`, { method: 'PUT', body: form, auth: true });
      setForm(r.data);
      setNotice({ type: 'success', text: isNew ? 'Project created.' : 'Project saved.' });
      onSaved(r.data);
    } catch (err) {
      onAuthError(err);
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${form.title}”? This can’t be undone.`)) return;
    setBusy(true);
    try {
      await api(`/api/projects/${form._id}`, { method: 'DELETE', auth: true });
      onDeleted(form._id);
    } catch (err) {
      onAuthError(err);
      setNotice({ type: 'error', text: err.message });
      setBusy(false);
    }
  }

  return (
    <form className="a-form" onSubmit={save}>
      <header className="a-page-head">
        <div>
          <h1>{isNew ? 'New project' : form.title}</h1>
          {!isNew && (
            <a className="a-muted" href={`/projects/${form.slug}`} target="_blank" rel="noreferrer">
              /projects/{form.slug} ↗
            </a>
          )}
        </div>
        <div className="a-row">
          {!isNew && (
            <button type="button" className="a-btn a-btn-danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
          <button className="a-btn" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Create project' : 'Save project'}</button>
        </div>
      </header>
      <Notice notice={notice} />

      <fieldset className="a-card">
        <legend>Basics</legend>
        <div className="a-grid-2">
          <Field label="Title" value={form.title} onChange={(v) => set({ title: v })} required />
          <Field label="URL slug" value={form.slug} onChange={(v) => set({ slug: v })} hint="Leave blank to generate from the title." />
          <Field label="Category" value={form.category} onChange={(v) => set({ category: v })} list="categories" required />
          <Field label="Year" value={form.year} onChange={(v) => set({ year: v })} placeholder="2025" />
        </div>
        <datalist id="categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <TextArea label="Short description" rows={2} value={form.description} onChange={(v) => set({ description: v })} required hint="One or two sentences for cards and the project list." />
        <Field label="Headline result" value={form.result} onChange={(v) => set({ result: v })} hint="A measurable outcome, e.g. “ROC-AUC 0.89 on holdout data”. Shown with a yellow marker." />
        <div className="a-grid-2">
          <Field label="Icon (emoji)" value={form.icon} onChange={(v) => set({ icon: v })} />
          <Field label="Sort order" type="number" value={form.order} onChange={(v) => set({ order: v })} hint="Lower numbers appear first." />
        </div>
        <Check label="Feature on the home page" checked={form.featured} onChange={(v) => set({ featured: v })} hint="Featured projects get a large case-study row." />
      </fieldset>

      <fieldset className="a-card">
        <legend>Images</legend>
        <GalleryField value={form.images} onChange={(images) => set({ images })} />
      </fieldset>

      <fieldset className="a-card">
        <legend>Case study</legend>
        <TextArea label="Overview" rows={8} value={form.details} onChange={(v) => set({ details: v })} hint="Markdown is supported: **bold**, lists, links, ## headings." />
        <ListField label="Highlights" separator={'\n'} value={form.highlights} onChange={(v) => set({ highlights: v })} hint="One per line." />
        <ListField label="Tech stack" value={form.stack} onChange={(v) => set({ stack: v })} hint="Comma-separated, e.g. Python, XGBoost, Streamlit" />
      </fieldset>

      <fieldset className="a-card">
        <legend>Links</legend>
        <div className="a-grid-2">
          <Select
            label="Live link type"
            value={form.demoType}
            onChange={(v) => set({ demoType: v })}
            options={[
              ['external', 'Hosted app (opens in a new tab)'],
              ['interactive', 'Built-in demo (opens in a pop-up)'],
              ['code', 'Code only']
            ]}
          />
          <Field label="Live URL" value={form.liveUrl} onChange={(v) => set({ liveUrl: v })} placeholder="https://… or /demos/name/index.html" />
          <Field label="Source code URL" type="url" value={form.githubUrl} onChange={(v) => set({ githubUrl: v })} />
        </div>
      </fieldset>
    </form>
  );
}

export default function ProjectsEditor({ onAuthError }) {
  const { refresh } = useSite();
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null); // project object or 'new'
  const [error, setError] = useState('');

  async function load(selectId) {
    try {
      const r = await api('/api/projects');
      setProjects(r.data);
      if (selectId) setSelected(r.data.find((p) => p._id === selectId) || null);
      if (r.source !== 'mongodb') setError('These are the built-in projects. Connect MongoDB to edit them.');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];

  return (
    <div className="a-split">
      <div className="a-list">
        <div className="a-list-head">
          <h2>Projects</h2>
          <button type="button" className="a-btn a-btn-small" onClick={() => setSelected('new')}>
            New project
          </button>
        </div>
        {error && <p className="a-notice is-error">{error}</p>}
        <ul>
          {projects.map((p) => (
            <li key={p._id || p.slug}>
              <button type="button" className={selected?._id && selected._id === p._id ? 'is-active' : ''} onClick={() => setSelected(p)}>
                <span className="a-list-icon">{p.icon}</span>
                <span className="a-list-text">
                  <strong>{p.title}</strong>
                  <small>
                    {p.category}
                    {p.featured && <em className="a-badge">Featured</em>}
                    {p.images?.length > 0 && <em className="a-badge a-badge-soft">{p.images.length} img</em>}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="a-detail">
        {selected ? (
          <ProjectForm
            key={selected === 'new' ? 'new' : selected._id || selected.slug}
            initial={selected === 'new' ? blank : selected}
            categories={categories}
            onAuthError={onAuthError}
            onSaved={(saved) => {
              load(saved._id);
              refresh();
            }}
            onDeleted={() => {
              setSelected(null);
              load();
              refresh();
            }}
          />
        ) : (
          <div className="a-empty">
            <p>Pick a project on the left to edit it, or add a new one.</p>
            <button type="button" className="a-btn" onClick={() => setSelected('new')}>
              New project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
