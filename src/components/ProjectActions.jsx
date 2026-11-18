import { Link } from 'react-router-dom';
import { useOpenDemo } from './DemoModal.jsx';
import { ArrowIcon, ExternalIcon, GitHubIcon, PlayIcon } from './Icons.jsx';

export const isDemo = (p) => p.demoType === 'interactive' && Boolean(p.liveUrl);
export const isExternalApp = (p) => p.demoType === 'external' && Boolean(p.liveUrl);

export default function ProjectActions({ project, showDetails = true, size = '' }) {
  const openDemo = useOpenDemo();
  const sm = size === 'small' ? 'btn-small' : '';

  return (
    <div className="project-actions">
      {isDemo(project) && (
        <button type="button" className={`btn btn-teal ${sm}`} onClick={() => openDemo(project)}>
          <PlayIcon /> Try the demo
        </button>
      )}
      {isExternalApp(project) && (
        <a className={`btn btn-teal ${sm}`} href={project.liveUrl} target="_blank" rel="noreferrer">
          Open the app <ExternalIcon />
        </a>
      )}
      {project.githubUrl && (
        <a className={`btn btn-ghost ${sm}`} href={project.githubUrl} target="_blank" rel="noreferrer">
          <GitHubIcon width="16" height="16" /> Source
        </a>
      )}
      {showDetails && (
        <Link className="link-arrow" to={`/projects/${project.slug}`}>
          Details <ArrowIcon />
        </Link>
      )}
    </div>
  );
}
