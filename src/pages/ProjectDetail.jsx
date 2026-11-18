import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSite } from '../lib/SiteContext.jsx';
import ProjectActions, { isDemo } from '../components/ProjectActions.jsx';
import Markdown from '../components/Markdown.jsx';
import { ArrowIcon, ExternalIcon } from '../components/Icons.jsx';
import NotFound from './NotFound.jsx';

function Gallery({ images, title }) {
  const [index, setIndex] = useState(null);

  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length]);

  return (
    <>
      <div className={`gallery gallery-${Math.min(images.length, 3)}`}>
        {images.map((src, i) => (
          <button key={src} type="button" className="gallery-item" onClick={() => setIndex(i)} aria-label={`Enlarge image ${i + 1} of ${images.length}`}>
            <img src={src} alt={`${title}, image ${i + 1}`} loading={i ? 'lazy' : 'eager'} />
          </button>
        ))}
      </div>
      {index !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} image viewer`} onClick={() => setIndex(null)}>
          <img src={images[index]} alt={`${title}, image ${index + 1}`} onClick={(e) => e.stopPropagation()} />
          <p className="lightbox-count">
            {index + 1} / {images.length}
          </p>
          <button className="icon-btn lightbox-close" onClick={() => setIndex(null)} aria-label="Close image viewer">
            ✕
          </button>
        </div>
      )}
    </>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const { projects } = useSite();
  const i = projects.findIndex((p) => p.slug === slug);
  const project = projects[i];

  useEffect(() => {
    if (project) document.title = `${project.title} | Yash Kumar Roy`;
    return () => {
      document.title = 'Yash Kumar Roy | Data Science & Full-Stack';
    };
  }, [project]);

  if (!project) return <NotFound what="project" />;

  const next = projects[(i + 1) % projects.length];
  const images = project.images || [];

  return (
    <article className="detail">
      <div className="wrap detail-wrap">
        <Link to="/#all-projects" className="back-link">
          ← All projects
        </Link>

        <header className="detail-head">
          <p className="feature-meta">
            {project.category}
            {project.year && <span>{project.year}</span>}
          </p>
          <h1>{project.title}</h1>
          {project.result && <p className="feature-result detail-result">{project.result}</p>}
          <p className="detail-lead">{project.description}</p>
          <ProjectActions project={project} showDetails={false} />
        </header>

        {images.length > 0 ? (
          <Gallery images={images} title={project.title} />
        ) : (
          isDemo(project) && (
            <div className="embed">
              <div className="embed-bar">
                <span>Live demo</span>
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  Full window <ExternalIcon />
                </a>
              </div>
              <iframe
                src={project.liveUrl}
                title={`${project.title} demo`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
              />
            </div>
          )
        )}

        <div className="detail-body">
          <div className="detail-main">
            <h2>Overview</h2>
            <Markdown source={project.details} />
            {project.highlights?.length > 0 && (
              <>
                <h2>Highlights</h2>
                <ul className="bullets">
                  {project.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <aside className="detail-aside">
            <h2>Built with</h2>
            <ul className="tags">
              {(project.stack || []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
        </div>

        {next && next.slug !== project.slug && (
          <Link to={`/projects/${next.slug}`} className="next-project">
            <span>Next project</span>
            <strong>
              {next.title} <ArrowIcon />
            </strong>
          </Link>
        )}
      </div>
    </article>
  );
}
