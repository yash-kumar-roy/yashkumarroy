import { useState } from 'react';
import { api } from '../lib/api.js';
import { SocialLinks } from './Layout.jsx';
import { MailIcon } from './Icons.jsx';

export default function ContactSection({ profile }) {
  const [state, setState] = useState({ busy: false, type: '', message: '' });
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget; // captured before await: React clears currentTarget afterwards
    setState({ busy: true, type: '', message: '' });
    try {
      const result = await api('/api/contact', { method: 'POST', body: Object.fromEntries(new FormData(form)) });
      setState({ busy: false, type: 'success', message: result.message || 'Message sent. I’ll reply by email.' });
      form.reset();
    } catch (error) {
      setState({ busy: false, type: 'error', message: error.message });
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the mailto link still works */
    }
  }

  return (
    <div className="contact">
      <div className="contact-intro" data-reveal>
        <p className="contact-lead">
          Hiring, or have a project in mind? Send me a message. I usually reply within two days.
        </p>
        {profile.email && (
          <div className="contact-email">
            <a href={`mailto:${profile.email}`}>
              <MailIcon /> {profile.email}
            </a>
            <button type="button" className="link-button" onClick={copyEmail} aria-live="polite">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
        {profile.location && <p className="contact-meta">Based in {profile.location}. {profile.availability}.</p>}
        <SocialLinks socials={profile.socials} className="socials socials-large" />
      </div>

      <form className="contact-form" onSubmit={handleSubmit} data-reveal>
        <label>
          Name
          <input required name="name" autoComplete="name" maxLength={120} />
        </label>
        <label>
          Email
          <input required type="email" name="email" autoComplete="email" maxLength={254} />
        </label>
        <label className="span-2">
          <span>
            Company or phone <small>(optional)</small>
          </span>
          <input name="phone" maxLength={40} />
        </label>
        <label className="span-2">
          Message
          <textarea required name="message" rows={5} maxLength={5000} placeholder="What would you like to talk about?" />
        </label>
        <div className="span-2 form-footer">
          <button className="btn btn-ink" disabled={state.busy} type="submit">
            {state.busy ? 'Sending…' : 'Send message'}
          </button>
          {state.message && (
            <p className={`form-status is-${state.type}`} role="status">
              {state.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
