import { useEffect, useState } from 'react';
import { api, formatDate } from '../lib/api.js';
import { useSite } from '../lib/SiteContext.jsx';
import Markdown from '../components/Markdown.jsx';
import { Check, Field, ImageField, ListField, Notice, TextArea, UploadButton } from './fields.jsx';

const blank = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: [], published: false };

function PostForm({ initial, onSaved, onDeleted, onAuthError }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [preview, setPreview] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isNew = !form._id;

  async function save(publish) {
    setBusy(true);
    setNotice(null);
    const body = { ...form, published: publish ?? form.published };
    try {
      const r = isNew
        ? await api('/api/blogs', { method: 'POST', body, auth: true })
        : await api(`/api/blogs/${form._id}`, { method: 'PUT', body, auth: true });
      setForm(r.data);
      setNotice({ type: 'success', text: r.data.published ? 'Post published.' : 'Draft saved.' });
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
      await api(`/api/blogs/${form._id}`, { method: 'DELETE', auth: true });
      onDeleted();
    } catch (err) {
      onAuthError(err);
      setNotice({ type: 'error', text: err.message });
      setBusy(false);
    }
  }

  return (
    <form
      className="a-form"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <header className="a-page-head">
        <div>
          <h1>{isNew ? 'New post' : form.title || 'Untitled post'}</h1>
          <p className="a-muted">
            {form.published ? `Published ${formatDate(form.publishedAt)}` : 'Draft, not visible on the site'}
            {!isNew && (
              <>
                {' '}
                <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer">View ↗</a>
              </>
            )}
          </p>
        </div>
        <div className="a-row">
          {!isNew && (
            <button type="button" className="a-btn a-btn-danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
          {form.published ? (
            <button type="button" className="a-btn a-btn-ghost" onClick={() => save(false)} disabled={busy}>
              Unpublish
            </button>
          ) : (
            <button type="button" className="a-btn a-btn-ghost" onClick={() => save(true)} disabled={busy || !form.title}>
              Publish
            </button>
          )}
          <button className="a-btn" disabled={busy || !form.title}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </header>
      <Notice notice={notice} />

      <fieldset className="a-card">
        <legend>Post details</legend>
        <div className="a-grid-2">
          <Field label="Title" value={form.title} onChange={(v) => set({ title: v })} required />
          <Field label="URL slug" value={form.slug} onChange={(v) => set({ slug: v })} hint="Leave blank to generate from the title." />
        </div>
        <TextArea label="Excerpt" rows={2} value={form.excerpt} onChange={(v) => set({ excerpt: v })} hint="Shown in post lists. One or two sentences." />
        <ListField label="Tags" value={form.tags} onChange={(v) => set({ tags: v })} hint="Comma-separated" />
        <ImageField label="Cover image" value={form.coverImage} onChange={(v) => set({ coverImage: v })} />
      </fieldset>

      <fieldset className="a-card">
        <legend>Content</legend>
        <div className="a-editor-bar">
          <div className="a-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={!preview} onClick={() => setPreview(false)}>Write</button>
            <button type="button" role="tab" aria-selected={preview} onClick={() => setPreview(true)}>Preview</button>
          </div>
          <UploadButton onUploaded={([url]) => set({ content: `${form.content}\n\n![Image description](${url})\n` })}>
            Insert image
          </UploadButton>
        </div>
        {preview ? (
          <div className="a-preview">
            <Markdown source={form.content || '_Nothing to preview yet._'} className="prose prose-article" />
          </div>
        ) : (
          <TextArea
            label="Markdown"
            rows={20}
            value={form.content}
            onChange={(v) => set({ content: v })}
            hint="## Heading, **bold**, *italic*, [link](https://…), - list item, ```code```"
            className="a-mono"
          />
        )}
      </fieldset>
      <Check label="Published" checked={form.published} onChange={(v) => set({ published: v })} hint="Unpublished posts are only visible to you." />
    </form>
  );
}

export default function BlogEditor({ onAuthError }) {
  const { refresh } = useSite();
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  async function load(selectId) {
    try {
      const r = await api('/api/blogs?all=true', { auth: true });
      setPosts(r.data);
      if (selectId) {
        // list omits content, so fetch the full post
        const saved = r.data.find((p) => p._id === selectId);
        if (saved) setSelected((await api(`/api/blogs/${saved.slug}`, { auth: true })).data);
      }
    } catch (e) {
      onAuthError(e);
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function open(post) {
    try {
      setSelected((await api(`/api/blogs/${post.slug}`, { auth: true })).data);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="a-split">
      <div className="a-list">
        <div className="a-list-head">
          <h2>Blog posts</h2>
          <button type="button" className="a-btn a-btn-small" onClick={() => setSelected('new')}>
            New post
          </button>
        </div>
        {error && <p className="a-notice is-error">{error}</p>}
        {posts.length === 0 && !error && <p className="a-muted a-pad">No posts yet. Your first one will appear in a Writing section on the home page.</p>}
        <ul>
          {posts.map((p) => (
            <li key={p._id}>
              <button type="button" className={selected?._id === p._id ? 'is-active' : ''} onClick={() => open(p)}>
                <span className="a-list-text">
                  <strong>{p.title}</strong>
                  <small>
                    {p.published ? formatDate(p.publishedAt) : <em className="a-badge a-badge-soft">Draft</em>}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="a-detail">
        {selected ? (
          <PostForm
            key={selected === 'new' ? 'new' : selected._id}
            initial={selected === 'new' ? blank : selected}
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
            <p>Pick a post to edit, or start a new one.</p>
            <button type="button" className="a-btn" onClick={() => setSelected('new')}>
              New post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
