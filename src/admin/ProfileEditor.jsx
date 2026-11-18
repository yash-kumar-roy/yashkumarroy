import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useSite } from '../lib/SiteContext.jsx';
import { Field, ImageField, ListField, Notice, TextArea, UploadButton } from './fields.jsx';

const blankJob = { role: '', org: '', start: '', end: '', summary: '', bullets: [], tags: [] };
const blankEdu = { degree: '', org: '', start: '', end: '' };
const blankSkill = { group: '', items: [] };

function Repeater({ title, items, blank, onChange, render, addLabel }) {
  // Bumped on reorder/remove so rows remount and list fields don't keep stale text.
  const [rev, setRev] = useState(0);
  const update = (i, patch) => onChange(items.map((item, k) => (k === i ? { ...item, ...patch } : item)));
  const move = (i, d) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setRev((r) => r + 1);
    onChange(next);
  };
  const remove = (i) => {
    setRev((r) => r + 1);
    onChange(items.filter((_, k) => k !== i));
  };
  return (
    <fieldset className="a-card">
      <legend>{title}</legend>
      {items.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="a-repeat" key={`${rev}-${i}`}>
          <div className="a-repeat-tools">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
            <button type="button" onClick={() => remove(i)} aria-label="Remove">✕</button>
          </div>
          {render(item, (patch) => update(i, patch))}
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost" onClick={() => onChange([...items, { ...blank }])}>
        {addLabel}
      </button>
    </fieldset>
  );
}

export default function ProfileEditor({ onAuthError }) {
  const { refresh } = useSite();
  const [form, setForm] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0); // remounts list fields after a reload

  useEffect(() => {
    api('/api/profile').then((r) => setForm(r.data)).catch((e) => setNotice({ type: 'error', text: e.message }));
  }, []);

  if (!form) return <p className="a-muted">Loading profile…</p>;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setSocial = (key, url) => set({ socials: { ...form.socials, [key]: url } });
  const setMetric = (patch) => set({ heroMetric: { ...form.heroMetric, ...patch } });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const r = await api('/api/profile', { method: 'PUT', body: form, auth: true });
      setForm(r.data);
      setVersion((v) => v + 1);
      setNotice({ type: 'success', text: 'Profile saved. The site now shows your changes.' });
      refresh();
    } catch (err) {
      onAuthError(err);
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="a-form" key={version}>
      <header className="a-page-head">
        <div>
          <h1>Profile</h1>
          <p className="a-muted">Your name, intro, experience and skills as they appear on the home page.</p>
        </div>
        <button className="a-btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </header>
      <Notice notice={notice} />

      <fieldset className="a-card">
        <legend>Introduction</legend>
        <div className="a-grid-2">
          <Field label="Name" value={form.name} onChange={(v) => set({ name: v })} required />
          <Field label="Role headline" value={form.role} onChange={(v) => set({ role: v })} hint="The large headline at the top of the page." />
        </div>
        <TextArea label="One-line summary" rows={2} value={form.tagline} onChange={(v) => set({ tagline: v })} />
        <div className="a-grid-2">
          <Field label="Availability" value={form.availability} onChange={(v) => set({ availability: v })} hint="e.g. Open to data science and full-stack roles" />
          <Field label="Location" value={form.location} onChange={(v) => set({ location: v })} />
        </div>
        <TextArea
          label="About me"
          rows={8}
          value={(form.about || []).join('\n\n')}
          onChange={(v) => set({ about: v.split(/\n\s*\n/) })}
          hint="Leave a blank line between paragraphs. The first paragraph is shown slightly larger."
        />
      </fieldset>

      <fieldset className="a-card">
        <legend>Photo, résumé and contact</legend>
        <div className="a-grid-2">
          <ImageField label="Portrait" value={form.avatar} onChange={(v) => set({ avatar: v })} hint="Shown in the About section. A 4:5 portrait works best." />
          <div className="a-field">
            <span className="a-label">Résumé PDF</span>
            <p className="a-hint">{form.resumeUrl ? 'Using your uploaded résumé.' : 'Using the résumé.pdf bundled with the site.'}</p>
            <div className="a-image-actions">
              <UploadButton accept="application/pdf" onUploaded={([url]) => set({ resumeUrl: url })}>
                {form.resumeUrl ? 'Replace PDF' : 'Upload PDF'}
              </UploadButton>
              {form.resumeUrl && (
                <>
                  <a href={form.resumeUrl} target="_blank" rel="noreferrer">Open</a>
                  <button type="button" className="a-btn a-btn-text" onClick={() => set({ resumeUrl: '' })}>Use bundled file</button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="a-grid-2">
          <Field label="Email" type="email" value={form.email} onChange={(v) => set({ email: v })} />
          <Field label="GitHub URL" type="url" value={form.socials?.github} onChange={(v) => setSocial('github', v)} />
          <Field label="LinkedIn URL" type="url" value={form.socials?.linkedin} onChange={(v) => setSocial('linkedin', v)} />
          <Field label="Kaggle URL" type="url" value={form.socials?.kaggle} onChange={(v) => setSocial('kaggle', v)} />
          <Field label="Instagram URL" type="url" value={form.socials?.instagram} onChange={(v) => setSocial('instagram', v)} />
        </div>
      </fieldset>

      <fieldset className="a-card">
        <legend>Hero chart</legend>
        <p className="a-hint">The ROC curve at the top of the page is drawn to match this score.</p>
        <div className="a-grid-3">
          <Field label="ROC-AUC score" type="number" step="0.01" min="0.5" max="0.99" value={form.heroMetric?.value} onChange={(v) => setMetric({ value: v })} />
          <Field label="Caption" value={form.heroMetric?.label} onChange={(v) => setMetric({ label: v })} />
          <Field label="Linked project slug" value={form.heroMetric?.projectSlug} onChange={(v) => setMetric({ projectSlug: v })} hint="e.g. telecom-churn-prediction" />
        </div>
      </fieldset>

      <Repeater
        title="Work experience"
        items={form.experience || []}
        blank={blankJob}
        addLabel="Add a role"
        onChange={(experience) => set({ experience })}
        render={(job, update) => (
          <>
            <div className="a-grid-2">
              <Field label="Role" value={job.role} onChange={(v) => update({ role: v })} />
              <Field label="Company" value={job.org} onChange={(v) => update({ org: v })} />
              <Field label="Start" value={job.start} onChange={(v) => update({ start: v })} placeholder="2025" />
              <Field label="End" value={job.end} onChange={(v) => update({ end: v })} placeholder="Present" />
            </div>
            <TextArea label="Summary" rows={2} value={job.summary} onChange={(v) => update({ summary: v })} />
            <ListField label="Achievements" separator={'\n'} rows={3} value={job.bullets} onChange={(v) => update({ bullets: v })} hint="One per line. Lead with the result, e.g. “Cut report time from 2 days to 2 hours”." />
            <ListField label="Tools" value={job.tags} onChange={(v) => update({ tags: v })} hint="Comma-separated" />
          </>
        )}
      />

      <Repeater
        title="Education"
        items={form.education || []}
        blank={blankEdu}
        addLabel="Add education"
        onChange={(education) => set({ education })}
        render={(ed, update) => (
          <div className="a-grid-2">
            <Field label="Degree" value={ed.degree} onChange={(v) => update({ degree: v })} />
            <Field label="Institution" value={ed.org} onChange={(v) => update({ org: v })} />
            <Field label="Start" value={ed.start} onChange={(v) => update({ start: v })} />
            <Field label="End" value={ed.end} onChange={(v) => update({ end: v })} />
          </div>
        )}
      />

      <Repeater
        title="Skills"
        items={form.skills || []}
        blank={blankSkill}
        addLabel="Add a skill group"
        onChange={(skills) => set({ skills })}
        render={(group, update) => (
          <div className="a-grid-2-1">
            <Field label="Group name" value={group.group} onChange={(v) => update({ group: v })} />
            <ListField label="Skills" value={group.items} onChange={(v) => update({ items: v })} hint="Comma-separated" />
          </div>
        )}
      />

      <div className="a-sticky-save">
        <Notice notice={notice} />
        <button className="a-btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </div>
    </form>
  );
}
