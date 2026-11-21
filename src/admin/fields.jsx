import { useId, useRef, useState } from 'react';
import { uploadFile } from '../lib/api.js';

export function Field({ label, hint, value, onChange, type = 'text', ...rest }) {
  const id = useId();
  return (
    <div className="a-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint && <p className="a-hint">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 4, ...rest }) {
  const id = useId();
  return (
    <div className="a-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint && <p className="a-hint">{hint}</p>}
    </div>
  );
}

export function Check({ label, checked, onChange, hint }) {
  const id = useId();
  return (
    <div className="a-check">
      <input id={id} type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>
        {label}
        {hint && <span className="a-hint">{hint}</span>}
      </label>
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div className="a-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Comma-separated list <-> array. Keeps the raw text while typing so commas aren't swallowed. */
export function ListField({ label, hint, value = [], onChange, separator = ',', rows }) {
  const [text, setText] = useState(() => (value || []).join(separator === '\n' ? '\n' : ', '));
  const parse = (t) => t.split(separator).map((s) => s.trim()).filter(Boolean);
  const common = {
    value: text,
    onChange: (t) => {
      setText(t);
      onChange(parse(t));
    },
    hint
  };
  return separator === '\n' ? <TextArea label={label} rows={rows || 4} {...common} /> : <Field label={label} {...common} />;
}

/** Upload one or more files to /api/media and return their URLs. */
export function UploadButton({ onUploaded, accept = 'image/*', multiple = false, children = 'Upload image' }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle(e) {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      const urls = [];
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const media = await uploadFile(file);
        urls.push(media.url);
      }
      onUploaded(urls);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="a-upload">
      <input ref={ref} type="file" accept={accept} multiple={multiple} onChange={handle} hidden />
      <button type="button" className="a-btn a-btn-ghost" onClick={() => ref.current.click()} disabled={busy}>
        {busy ? 'Uploading…' : children}
      </button>
      {error && <span className="a-error-inline">{error}</span>}
    </span>
  );
}

export function ImageField({ label, hint, value, onChange }) {
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="a-image-field">
        {value ? <img src={value} alt="" /> : <span className="a-image-empty">No image</span>}
        <div className="a-image-actions">
          <UploadButton onUploaded={([url]) => onChange(url)}>{value ? 'Replace' : 'Upload image'}</UploadButton>
          {value && (
            <button type="button" className="a-btn a-btn-text" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input className="a-url-input" aria-label={`${label} URL`} value={value || ''} placeholder="…or paste an image URL" onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="a-hint">{hint}</p>}
    </div>
  );
}

/** Ordered image list with upload, reorder and remove. */
export function GalleryField({ value = [], onChange }) {
  const move = (i, d) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="a-field">
      <span className="a-label">Images</span>
      <p className="a-hint">The first image is the cover shown on the home page. Up to 4 MB each.</p>
      {value.length > 0 && (
        <ul className="a-gallery">
          {value.map((src, i) => (
            <li key={src}>
              <img src={src} alt="" />
              {i === 0 && <span className="a-cover-badge">Cover</span>}
              <div className="a-gallery-actions">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">←</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move later">→</button>
                <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove image">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <UploadButton multiple onUploaded={(urls) => onChange([...value, ...urls])}>
        Add images
      </UploadButton>
    </div>
  );
}

export function Notice({ notice }) {
  if (!notice?.text) return null;
  return (
    <p className={`a-notice is-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
      {notice.text}
    </p>
  );
}
