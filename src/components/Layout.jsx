import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSite } from '../lib/SiteContext.jsx';
import { DownloadIcon, socialIcons, socialLabels } from './Icons.jsx';
import ChatWidget from './ChatWidget.jsx';

export function SocialLinks({ socials, className = 'socials' }) {
  return (
    <ul className={className}>
      {Object.entries(socials || {})
        .filter(([key, url]) => url && socialIcons[key])
        .map(([key, url]) => {
          const Icon = socialIcons[key];
          return (
            <li key={key}>
              <a href={url} target="_blank" rel="noreferrer" aria-label={socialLabels[key]} title={socialLabels[key]}>
                <Icon />
              </a>
            </li>
          );
        })}
    </ul>
  );
}

export default function Layout() {
  const { profile, posts, resumeUrl } = useSite();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu and handle #hash scrolling on navigation.
  useEffect(() => {
    setOpen(false);
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  const nav = [
    ['/#work', 'Work'],
    ['/#experience', 'Experience'],
    ['/#skills', 'Skills'],
    ...(posts.length ? [['/blog', 'Writing']] : []),
    ['/#contact', 'Contact']
  ];

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="wrap header-inner">
          <Link to="/" className="wordmark" aria-label={`${profile.name}, home`}>
            {profile.name}
          </Link>

          <button
            className="menu-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-nav"
          >
            <span className="sr-only">Menu</span>
            <span className={`burger ${open ? 'is-open' : ''}`} aria-hidden="true" />
          </button>

          <nav id="site-nav" className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Main">
            {nav.map(([to, label]) => (
              <Link key={to} to={to} className="nav-link">
                {label}
              </Link>
            ))}
            <a className="btn btn-small btn-ink" href={resumeUrl} target="_blank" rel="noreferrer">
              <DownloadIcon /> Résumé
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div>
            <p className="footer-name">{profile.name}</p>
            <p className="footer-role">{profile.role}</p>
          </div>
          <SocialLinks socials={profile.socials} />
          <p className="footer-meta">
            © {new Date().getFullYear()} {profile.name}. Built with MongoDB, Express, React and Node.js.
          </p>
        </div>
      </footer>

      <ChatWidget />
    </>
  );
}
