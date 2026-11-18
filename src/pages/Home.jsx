import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../lib/SiteContext.jsx';
import { useReveal } from '../lib/useReveal.js';
import { formatDate } from '../lib/api.js';
import RocCurve from '../components/RocCurve.jsx';
import FeaturedProject from '../components/FeaturedProject.jsx';
import ProjectArchive from '../components/ProjectArchive.jsx';
import Experience from '../components/Experience.jsx';
import Skills from '../components/Skills.jsx';
import ContactSection from '../components/ContactSection.jsx';
import { SocialLinks } from '../components/Layout.jsx';
import { ArrowIcon, DownloadIcon } from '../components/Icons.jsx';

function SectionHead({ id, title, children }) {
  return (
    <header className="section-head" data-reveal>
      <h2 id={id}>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}

export default function Home() {
  const { profile, projects, posts, resumeUrl } = useSite();
  const [query, setQuery] = useState('');
  const featured = projects.filter((p) => p.featured);
  const demos = projects.filter((p) => p.demoType === 'interactive').length;
  useReveal([projects.length, posts.length, profile]);

  function pickSkill(skill) {
    setQuery(skill);
    document.getElementById('all-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="hero-name">{profile.name}</p>
            {/* non-breaking hyphens so "Full-Stack" never splits across lines */}
            <h1>{profile.role.replace(/-/g, '‑')}</h1>
            <p className="hero-tagline">{profile.tagline}</p>
            {profile.availability && (
              <p className="hero-status">
                <span className="pulse" aria-hidden="true" />
                {profile.availability}
                {profile.location && `, based in ${profile.location}`}
              </p>
            )}
            <div className="hero-actions">
              <a className="btn btn-ink" href="#work">
                See my work
              </a>
              <a className="btn btn-ghost" href={resumeUrl} target="_blank" rel="noreferrer">
                <DownloadIcon /> Résumé (PDF)
              </a>
            </div>
            <SocialLinks socials={profile.socials} />
          </div>

          <div className="hero-figure">
            <RocCurve
              auc={profile.heroMetric?.value}
              label={profile.heroMetric?.label}
              projectSlug={profile.heroMetric?.projectSlug}
            />
          </div>
        </div>

        <div className="wrap">
          <dl className="facts">
            <div>
              <dt>Projects</dt>
              <dd>{projects.length}</dd>
            </div>
            <div>
              <dt>Live demos</dt>
              <dd>{demos}</dd>
            </div>
            <div>
              <dt>Current role</dt>
              <dd className="facts-text">{profile.experience?.[0]?.org || '—'}</dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd className="facts-text">{profile.education?.[0]?.degree || '—'}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="work">
        <div className="wrap">
          <SectionHead id="work" title="Selected work">
            Projects with real, measurable results.
          </SectionHead>
          <div className="features">
            {featured.map((p, i) => (
              <FeaturedProject key={p.slug} project={p} flip={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="all-projects">
        <div className="wrap">
          <SectionHead id="all-projects" title="All projects">
            Search or filter. Press play to try a demo right here.
          </SectionHead>
          <ProjectArchive projects={projects} query={query} onQueryChange={setQuery} />
        </div>
      </section>

      <section className="section" aria-labelledby="experience">
        <div className="wrap">
          <SectionHead id="experience" title="Experience" />
          <Experience experience={profile.experience} education={profile.education} />
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="skills">
        <div className="wrap">
          <SectionHead id="skills" title="Skills">
            The number shows how many projects use each skill. Click one to see them.
          </SectionHead>
          <Skills skills={profile.skills} projects={projects} onPick={pickSkill} />
        </div>
      </section>

      <section className="section" aria-labelledby="about">
        <div className="wrap about">
          <div className="about-portrait" data-reveal>
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} />
            ) : (
              <span aria-hidden="true">{profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
            )}
          </div>
          <div className="about-text" data-reveal>
            <h2 id="about">About me</h2>
            {(profile.about || []).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section section-tint" aria-labelledby="writing">
          <div className="wrap">
            <SectionHead id="writing" title="Writing">
              Notes on what I build and learn.
            </SectionHead>
            <ul className="post-list">
              {posts.slice(0, 3).map((post) => (
                <li key={post.slug} data-reveal>
                  <Link to={`/blog/${post.slug}`} className="post-row">
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt || post.createdAt)}</time>
                    <span className="post-row-title">{post.title}</span>
                    {post.excerpt && <span className="post-row-excerpt">{post.excerpt}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            {posts.length > 3 && (
              <Link className="link-arrow" to="/blog">
                All {posts.length} posts <ArrowIcon />
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="section section-ink" aria-labelledby="contact">
        <div className="wrap">
          <SectionHead id="contact" title="Let’s talk" />
          <ContactSection profile={profile} />
        </div>
      </section>
    </>
  );
}
