import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ExternalIcon } from './Icons.jsx';

const DemoContext = createContext(() => {});
export const useOpenDemo = () => useContext(DemoContext);

export function DemoProvider({ children }) {
  const [project, setProject] = useState(null);
  const open = useCallback((p) => setProject(p), []);
  return (
    <DemoContext.Provider value={open}>
      {children}
      {project && <DemoModal project={project} onClose={() => setProject(null)} />}
    </DemoContext.Provider>
  );
}

function DemoModal({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-bar">
          <div>
            <h2 id="demo-title">{project.title}</h2>
            <p>{project.category}</p>
          </div>
          <div className="modal-actions">
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn btn-small btn-ghost">
              Open in new tab <ExternalIcon />
            </a>
            <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close demo">
              ✕
            </button>
          </div>
        </div>
        <iframe
          src={project.liveUrl}
          title={`${project.title} demo`}
          className="modal-frame"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
        />
      </div>
    </div>
  );
}
