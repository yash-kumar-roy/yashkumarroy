/* ===== Grok-ish interactions ===== */

// Starfield
(() => {
  const canvas = document.getElementById('stars');
  const ctx = canvas && canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, stars, dpr = 1, lastW = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Ignore small height-only changes (mobile URL bar) so stars don't regenerate while scrolling
    if (stars && window.innerWidth === lastW && Math.abs(window.innerHeight * dpr - h) < 120 * dpr) return;
    lastW = window.innerWidth;
    w = canvas.width = Math.round(window.innerWidth * dpr);
    h = canvas.height = Math.round(window.innerHeight * dpr);
    // Generate stars proportional to area
    const count = Math.min(450, Math.floor((w*h) / (1400*1400) * 350) + 120);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 0.9 + 0.1, // depth 0..1
      vx: (Math.random() * 0.3 + 0.05) * (Math.random() < 0.5 ? -1 : 1),
      vy: (Math.random() * 0.25 + 0.05) * (Math.random() < 0.5 ? -1 : 1)
    }));
  }

  function draw(move) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      // parallax speed
      if (move) {
        s.x += s.vx * s.z;
        s.y += s.vy * s.z;
      }

      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      if (s.y < -10) s.y = h + 10;
      if (s.y > h + 10) s.y = -10;

      const size = (1.2 + s.z * 1.8) * dpr;
      const alpha = 0.35 + s.z * 0.6;
      // purple → cyan hue drift
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, size);
      grad.addColorStop(0, `rgba(122,92,255,${alpha})`);
      grad.addColorStop(1, `rgba(47,216,255,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick() {
    draw(true);
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); if (reduceMotion) draw(false); }, { passive: true });
  resize();
  if (reduceMotion) draw(false);
  else requestAnimationFrame(tick);
})();

// Typewriter for "Yash"
(() => {
  const el = document.getElementById('type-target');
  const fullText = 'Yash';
  let i = 1;
  const speed = 110;
  function type() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      i++;
      setTimeout(type, speed);
    }
  }
  // Start typing after a tiny delay
  setTimeout(type, 220);
})();

// Spacebar to scramble the grid slightly (or click/tap the Space key in the log)
(() => {
  let t;
  function scramble() {
    document.body.classList.add('scramble');
    clearTimeout(t);
    t = setTimeout(() => document.body.classList.remove('scramble'), 400);
  }
  // Don't hijack Space while the user is typing or activating a control
  function isInteractive(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.classList && el.classList.contains('scramble-key')) return false;
    const tag = el.tagName;
    return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'SUMMARY'].includes(tag);
  }
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.key === ' ') && !e.ctrlKey && !e.metaKey && !e.altKey && !isInteractive(e.target)) {
      e.preventDefault();
      if (!e.repeat) scramble();
    }
  });
  const key = document.querySelector('.scramble-key');
  if (key) {
    key.addEventListener('click', scramble);
    key.addEventListener('keydown', (e) => { if (e.key === 'Enter') scramble(); });
  }
})();

// Simple prompt runner (mock)
(() => {
  const form = document.querySelector('.prompt-row');
  const input = document.getElementById('prompt');
  const out = document.getElementById('outputInner');
  const pending = new Set();

  function print(line = '') {
    const div = document.createElement('div');
    div.textContent = line;
    out.appendChild(div);
    out.parentElement.scrollTop = out.parentElement.scrollHeight;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) return;

    if (q === '/clear') {
      pending.forEach(clearTimeout);
      pending.clear();
      out.textContent = '';
      input.value = '';
      print('[cleared]');
      return;
    }

    print('> ' + q);
    // playful fake answer
    const replies = [
      "Parsing your request… deploying sarcasm subroutine.",
      "Answer: 42. (Refine your priors.)",
      "Fetching from the void… got it.",
      "Rewriting reality… success.",
      "I would, but the cat is on the keyboard."
    ];
    const answer = replies[Math.floor(Math.random() * replies.length)];
    const id = setTimeout(() => { pending.delete(id); print(answer); }, 300 + Math.random() * 500);
    pending.add(id);
    input.value = '';
  });
})();

// Mobile nav
(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });
  // Close after choosing a link, clicking outside, or pressing Escape
  nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => { if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
  window.addEventListener('resize', () => { if (window.innerWidth > 860) setOpen(false); }, { passive: true });
})();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
