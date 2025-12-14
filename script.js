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
- "Efficiency": Rapid prototyping of baseline models.
- "Customization": Why domain knowledge still rules.
- "Tools": A look at TPOT, H2O, and AutoKeras.`
  },
  {
    title: 'Scaling ML Pipelines',
    slug: 'scaling-ml',
    md: `# Scaling ML Pipelines
Moving from notebook to production requires a shift in mindset.
- "Reproducibility": Docker containers and versioning.
- "Monitoring": Drift detection with evidently.ai.
- "Orchestration": Airflow vs. Prefect.`
  },
  {
    title: 'Understanding Transformers',
    slug: 'transformers',
    md: `# Understanding Transformers
Attention is all you need, but how does it actually work?
- "Self-Attention": The core mechanism explained.
- "Positional Encoding": Giving order to sequences.
- "Applications": Beyond NLP—Vision Transformers (ViT).`
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

  const roles = ["Data Science Associate", "Machine Learning Engineer", "AI Engineer", "Python Enthusiast", "ML Engineer"];
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

/* Contact Form Handler */
(function contactFormInit() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');

  if (!form) return;

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.getAttribute('action').includes('YOUR_FORM_ID')) {
      status.textContent = "Please configure your Formspree ID in the HTML.";
      status.className = "status-msg error";
      alert("Formspree ID not configured. Please update the form's action attribute.");
      return; // Exit early if Formspree ID is not configured
    }

    status.textContent = "Sending...";
    status.className = "status-msg";

    const data = new FormData(event.target);
    try {
      const response = await fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        status.textContent = "Thanks! Message sent successfully.";
        status.className = "status-msg success";
        form.reset();
      } else {
        const jsonData = await response.json();
        let errorMessage = "Oops! There was a problem submitting your form";
        if (Object.hasOwn(jsonData, 'errors')) {
          errorMessage = jsonData.errors.map(error => error.message).join(", ");
        }
        status.textContent = errorMessage;
        status.className = "status-msg error";
        alert(`Submission Error: ${errorMessage}`);
      }
    } catch (error) {
      status.textContent = "Oops! There was a problem submitting your form";
      status.className = "status-msg error";
      alert(`Network Error: ${error.message}`);
    }
  }

  form.addEventListener("submit", handleSubmit);
})();

/* =========================================
   Chatbot Integration
   ========================================= */
(function () {
  const toggleBtn = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const messagesContainer = document.getElementById('chatMessages');
  const suggestionChips = document.querySelectorAll('.suggestions .chip');

  // Toggle Chat
  function toggleChat() {
    const isHidden = chatWindow.hidden;
    if (isHidden) {
      chatWindow.hidden = false;
      chatInput.focus();
    } else {
      chatWindow.hidden = true;
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggleChat);
  if (closeBtn) closeBtn.addEventListener('click', toggleChat);

  // Quick Questions
  if (suggestionChips) {
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.textContent;
        chatInput.value = text;
        handleSubmit({ preventDefault: () => { } });
      });
    });
  }

  // System Prompt (Context about Yash)
  const systemPrompt = `
  You are an AI assistant for Yash Kumar Roy's portfolio website.
  Your goal is to answer questions about functionality, skills, and projects based on this context:

  **Profile**: Data Science Associate & Developer. 2+ years experience.
  **Focus**: ML, Analytics, Modern Web Apps.
  **Contact**: Email via form, LinkedIn (https://linkedin.com/in/yash-kumar-roy), Github (https://github.com/yash-kumar-roy).

  **Skills**:
  - Languages: Python, JavaScript/TypeScript, SQL, HTML/CSS.
  - ML/AI: TensorFlow, Keras, Scikit-learn, Pandas, NumPy, OpenCV.
  - Web: React, Node.js, Streamlit, Flask.
  - Tools: Git, Docker, SAW, AWS.

  **Featured Projects**:
  1. **Telecom Churn Prediction**: ML model (AUC 0.89) to identify at-risk customers. Used SMOTE, Streamlit.
  2. **Medical Cost Prediction**: Regression model (XGBoost) for insurance premiums. Used SHAP for explainability.
  3. **Style Transfer (GAN)**: Custom GAN for artistic photo styling. WGAN-GP, Instance Norm.

  **Tone**: Professional, enthusiastic, helpful. Keep answers concise (under 3 sentences usually).
  If asked about something not in the portfolio, say you don't have that info but suggest contacting Yash.
  `;

  // Add Message to UI
  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Handle Submission
  async function handleSubmit(e) {
    e && e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // User Message
    addMessage(text, 'user');
    chatInput.value = '';

    // Typing Indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = `<p>Thinking...</p>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      let apiKey = (typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY) ? CONFIG.OPENAI_API_KEY : '';

      // Fallback: Try fetching .env if config.js missing/empty
      if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
        try {
          const envResponse = await fetch('.env');
          if (envResponse.ok) {
            const envText = await envResponse.text();
            const match = envText.match(/OPENAI_API_KEY=(.*)/);
            if (match) {
              apiKey = match[1].trim();
            }
          }
        } catch (err) {
          console.warn("Could not load .env file", err);
        }
      }

      if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
        throw new Error("Please Configure API Key in .env or config.js");
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          max_tokens: 150
        })
      });

      const data = await response.json();

      // Remove Typing
      if (messagesContainer.contains(typingDiv)) {
        messagesContainer.removeChild(typingDiv);
      }

      if (data.error) {
        console.error("OpenAI Error:", data.error);
        addMessage(`Error: ${data.error.message}`, 'bot');
        alert(`OpenAI Error: ${data.error.message}`);
      } else {
        const reply = data.choices[0].message.content;
        addMessage(reply, 'bot');
      }

    } catch (err) {
      console.error("Chatbot Error:", err);
      if (messagesContainer.contains(typingDiv)) {
        messagesContainer.removeChild(typingDiv);
      }
      addMessage(`System: ${err.message}`, 'bot');
      // Alert the user for visibility
      alert(`Chatbot Error: ${err.message}`);
    }
  }

  if (chatForm) chatForm.addEventListener('submit', handleSubmit);

})();

