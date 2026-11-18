import { matchesQuery } from './ProjectArchive.jsx';

/** Skill groups. Each skill shows how many projects use it; clicking filters the project list. */
export default function Skills({ skills = [], projects = [], onPick }) {
  // Same matching as the project search, so the count equals the rows shown after clicking.
  const usage = (skill) => projects.filter((p) => matchesQuery(p, skill)).length;

  return (
    <div className="skills">
      {skills.map((group) => (
        <div key={group.group} className="skill-group" data-reveal>
          <h3>{group.group}</h3>
          <ul>
            {group.items.map((skill) => {
              const n = usage(skill);
              return (
                <li key={skill}>
                  {n > 0 ? (
                    <button type="button" className="skill" onClick={() => onPick(skill)} title={n === 1 ? `Show the project that uses ${skill}` : `Show the ${n} projects that use ${skill}`}>
                      {skill}
                      <span className="skill-count">{n}</span>
                    </button>
                  ) : (
                    <span className="skill skill-static">{skill}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
