import { useEffect, useRef, useState } from 'react';

/**
 * The picture for a project, in order of preference:
 *  1. an uploaded cover image,
 *  2. a live, non-interactive preview of a built-in demo (loaded only when scrolled near),
 *  3. a typographic placeholder built from the project's category and stack.
 */
export default function ProjectVisual({ project, live = true }) {
  const cover = project.images?.[0];
  const canPreview = live && !cover && project.demoType === 'interactive' && project.liveUrl?.startsWith('/demos/');
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!canPreview || !ref.current) return undefined;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '300px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [canPreview]);

  if (cover) {
    return (
      <div className="visual">
        <img src={cover} alt={`${project.title} screenshot`} loading="lazy" decoding="async" />
      </div>
    );
  }

  if (canPreview) {
    return (
      <div className="visual visual-live" ref={ref}>
        {near && (
          <iframe
            src={project.liveUrl}
            title={`${project.title} preview`}
            tabIndex={-1}
            aria-hidden="true"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        <span className="visual-badge">Live preview</span>
      </div>
    );
  }

  return (
    <div className="visual visual-type" aria-hidden="true">
      <span className="visual-type-top">
        <span className="visual-type-icon">{project.icon || '◆'}</span>
        {project.category}
      </span>
      <span className="visual-type-title">{project.title}</span>
      <span className="visual-type-foot">
        {project.result && <span className="visual-type-result">{project.result}</span>}
        <span className="visual-type-stack">{(project.stack || []).slice(0, 4).join(', ')}</span>
      </span>
    </div>
  );
}
