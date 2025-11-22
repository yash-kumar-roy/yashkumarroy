/* Helpers */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* Sticky header */
const header = document.querySelector('[data-header]');
const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 10);
onScrollHeader();
addEventListener('scroll', onScrollHeader, { passive: true });

/* Mobile nav */
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false');
  }));
}

/* Theme toggle */
(function themeInit() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') document.documentElement.setAttribute('data-theme', stored);
  else document.documentElement.setAttribute('data-theme', 'auto');
})();
const themeBtn = document.querySelector('[data-theme-toggle]');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeBtn.querySelector('.theme-label').textContent = next[0].toUpperCase() + next.slice(1);
  });
}

/* Animate on scroll */
const animated = $$('[data-animate]');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.2 });
animated.forEach(el => io.observe(el));

/* Filter for Project cards */
(function projectFilter() {
  const chips = $$('.projects-filter .chip');
  const grid = $('#projectGrid');
  if (!chips.length || !grid) return;
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const tag = chip.dataset.filter;
    $$('.project', grid).forEach(card => {
      const show = tag === 'all' || card.dataset.category === tag;
      card.style.display = show ? '' : 'none';
    });
  }));
})();

/* Case Study Modal */
(function caseStudyModal() {
  const modal = $('#caseModal');
  const body = $('#caseBody');
  const title = $('#caseTitle');

  function close() { modal.hidden = true; body.innerHTML = ''; }
  document.addEventListener('click', (e) => {
    console.log('Click detected on:', e.target);
    const openBtn = e.target.closest('[data-open-case]');
    if (openBtn) {
      console.log('Open button found:', openBtn);
      let data;
      try {
        data = JSON.parse(openBtn.getAttribute('data-open-case'));
      } catch (err) {
        console.error('Failed to parse case study data:', err);
        return;
      }
      title.textContent = data.title || 'Case Study';
      body.innerHTML = `
        <article class="post">
          <h4>Problem</h4><p>${escapeHTML(data.problem || '')}</p>
          <h4>Tech stack</h4><p>${(data.tech || []).map(badge).join(' ')}</p>
          <h4>Key challenges</h4>${ul(data.challenges || [])}
          <h4>Solutions</h4>${ul(data.solutions || [])}
          <h4>Achievements</h4>${ul(data.achievements || [])}
        </article>`;
      modal.hidden = false;
      modal.querySelector('[data-close-modal]').focus();
      track('case_open', { title: data.title });
    }
    if (e.target.matches('.modal-backdrop,[data-close-modal]')) close();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) { e.preventDefault(); close(); } });

  function ul(arr) { return `<ul class="highlights">${arr.map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ul>`; }
  function badge(t) { return `<span class="badge" style="font-size:.72rem">${escapeHTML(t)}</span>`; }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
})();

/* Blog: simple Markdown → HTML */
function mdToHtml(md) {
  let lines = md.replace(/\r\n?/g, '\n').split('\n');
  let html = '', inList = false;
  const flush = () => { if (inList) { html += '</ul>'; inList = false; } };
  for (const raw of lines) {
    const line = raw.trimRight();
    if (/^#{1,6}\s/.test(line)) { flush(); const lvl = line.match(/^#{1,6}/)[0].length; const t = line.replace(/^#{1,6}\s*/, ''); html += `<h${lvl}>${inline(t)}</h${lvl}>`; continue; }
    if (/^-\s+/.test(line)) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inline(line.replace(/^-+\s*/, ''))}</li>`; continue; }
    if (line === '') { flush(); html += '<p></p>'; continue; }
    flush(); html += `<p>${inline(line)}</p>`;
  } flush(); return html;
  function inline(s) { return s.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHTML(c)}</code>`).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/_([^_]+)_/g, '<em>$1</em>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>'); }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
}

const defaultPosts = [
  {
    title: 'The Future of AutoML',
    slug: 'automl-future',
    md: `# The Future of AutoML
AutoML is democratizing data science, but does it replace the expert?
- **Efficiency**: Rapid prototyping of baseline models.
- **Customization**: Why domain knowledge still rules.
- **Tools**: A look at TPOT, H2O, and AutoKeras.`
  },
  {
    title: 'Scaling ML Pipelines',
    slug: 'scaling-ml',
    md: `# Scaling ML Pipelines
Moving from notebook to production requires a shift in mindset.
- **Reproducibility**: Docker containers and versioning.
- **Monitoring**: Drift detection with evidently.ai.
- **Orchestration**: Airflow vs. Prefect.`
  },
  {
    title: 'Understanding Transformers',
    slug: 'transformers',
    md: `# Understanding Transformers
Attention is all you need, but how does it actually work?
- **Self-Attention**: The core mechanism explained.
- **Positional Encoding**: Giving order to sequences.
- **Applications**: Beyond NLP—Vision Transformers (ViT).`
  }
];

(function blogInit() {
  const grid = $('#blogGrid'); if (!grid) return;
  grid.innerHTML = defaultPosts.map(p => `
    <article class="card post" data-animate>
      <h3>${p.title}</h3>
      <p class="meta">${new Date().toLocaleDateString()}</p>
      <div class="content">${mdToHtml(p.md)}</div>
    </article>`).join('');
  $$('[data-animate]', grid).forEach(el => io.observe(el));
})();

/* -------- Analytics helper (works for GA4 or Plausible if added in head) -------- */
function track(eventName, params = {}) {
  if (window.gtag) gtag('event', eventName, params);
  if (window.plausible) plausible(eventName, { props: params });
}

/* Mark resume downloads as events */
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-track]');
  if (a) track(a.dataset.track, { href: a.href });
});

/* Footer year */
$('#year').textContent = String(new Date().getFullYear());

/* Typing Animation */
(function typingEffect() {
  const textElement = document.getElementById('typing-text');
  if (!textElement) return;

  const roles = ["Data Science Associate", "Machine Learning Engineer", "Web Developer", "Python Enthusiast"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      textElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      textElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500; // Pause before new word
    }

    setTimeout(type, typeSpeed);
  }

  type();
})();
