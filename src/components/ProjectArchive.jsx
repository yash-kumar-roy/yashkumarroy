import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOpenDemo } from './DemoModal.jsx';
import { isDemo, isExternalApp } from './ProjectActions.jsx';
import { ExternalIcon, GitHubIcon, PlayIcon } from './Icons.jsx';

export function matchesQuery(project, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [project.title, project.description, project.category, ...(project.stack || [])]
    .filter(Boolean)
    .some((v) => v.toLowerCase().includes(needle));
}

export default function ProjectArchive({ projects, query, onQueryChange }) {
  const openDemo = useOpenDemo();
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);

  const rows = projects.filter((p) => (category === 'All' || p.category === category) && matchesQuery(p, query.trim()));

  return (
    <div className="archive">
      <div className="archive-controls">
        <label className="search">
          <span className="sr-only">Search projects</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search, e.g. Python or React"
          />
        </label>
        <div className="chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="archive-count" aria-live="polite">
        {rows.length === projects.length ? `${projects.length} projects` : `${rows.length} of ${projects.length} projects`}
        {(query || category !== 'All') && (
          <button
            type="button"
            className="link-button"
            onClick={() => {
              onQueryChange('');
              setCategory('All');
            }}
          >
            Clear filters
          </button>
        )}
      </p>

      {rows.length === 0 ? (
        <div className="empty">
          <p>Nothing matches “{query}” {category !== 'All' && `in ${category}`}. Try a simpler word like “Python”.</p>
        </div>
      ) : (
        <ul className="archive-list">
          {rows.map((p) => (
            <li key={p.slug} className="archive-row">
              <span className="archive-icon" aria-hidden="true">{p.icon || '◆'}</span>
              <div className="archive-main">
                <Link to={`/projects/${p.slug}`} className="archive-title">
                  {p.title}
                </Link>
                <p className="archive-desc">{p.description}</p>
              </div>
              <span className="archive-cat">{p.category}</span>
              <span className="archive-stack">{(p.stack || []).slice(0, 3).join(', ')}</span>
              <span className="archive-links">
                {isDemo(p) && (
                  <button type="button" className="icon-btn" onClick={() => openDemo(p)} aria-label={`Try the ${p.title} demo`} title="Try the demo">
                    <PlayIcon />
                  </button>
                )}
                {isExternalApp(p) && (
                  <a className="icon-btn" href={p.liveUrl} target="_blank" rel="noreferrer" aria-label={`Open ${p.title}`} title="Open the app">
                    <ExternalIcon />
                  </a>
                )}
                {p.githubUrl && (
                  <a className="icon-btn" href={p.githubUrl} target="_blank" rel="noreferrer" aria-label={`${p.title} source code`} title="Source code">
                    <GitHubIcon width="15" height="15" />
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
