import { Link } from 'react-router-dom';
import ProjectVisual from './ProjectVisual.jsx';
import ProjectActions from './ProjectActions.jsx';

export default function FeaturedProject({ project, flip }) {
  return (
    <article className={`feature ${flip ? 'is-flipped' : ''}`} data-reveal>
      <Link to={`/projects/${project.slug}`} className="feature-visual" tabIndex={-1} aria-hidden="true">
        <ProjectVisual project={project} />
      </Link>

      <div className="feature-body">
        <p className="feature-meta">
          {project.category}
          {project.year && <span>{project.year}</span>}
        </p>
        <h3 className="feature-title">
          <Link to={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        {project.result && <p className="feature-result">{project.result}</p>}
        <p className="feature-desc">{project.description}</p>
        <ul className="tags" aria-label="Built with">
          {(project.stack || []).slice(0, 6).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <ProjectActions project={project} />
      </div>
    </article>
  );
}
