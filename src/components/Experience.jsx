export default function Experience({ experience = [], education = [] }) {
  return (
    <div className="timeline-grid">
      <div>
        <h3 className="col-title">Work</h3>
        <ol className="timeline">
          {experience.map((job, i) => (
            <li key={`${job.role}-${job.org}-${i}`} className="timeline-item" data-reveal>
              <p className="timeline-date">
                {job.start}
                {job.end && ` – ${job.end}`}
              </p>
              <div>
                <h4>
                  {job.role}
                  <span className="timeline-org">{job.org}</span>
                </h4>
                {job.summary && <p>{job.summary}</p>}
                {job.bullets?.length > 0 && (
                  <ul className="bullets">
                    {job.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {job.tags?.length > 0 && (
                  <ul className="tags">
                    {job.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="col-title">Education</h3>
        <ol className="timeline timeline-compact">
          {education.map((ed, i) => (
            <li key={`${ed.degree}-${i}`} className="timeline-item" data-reveal>
              <p className="timeline-date">
                {ed.start}
                {ed.end && ` – ${ed.end}`}
              </p>
              <div>
                <h4>{ed.degree}</h4>
                <p className="timeline-org-line">{ed.org}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
