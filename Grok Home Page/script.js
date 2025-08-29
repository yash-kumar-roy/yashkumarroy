/* ===== Grok-ish interactions ===== */

// Starfield
(() => {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, stars;

  function resize() {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
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

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      // parallax speed
      s.x += s.vx * s.z;
      s.y += s.vy * s.z;

      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      if (s.y < -10) s.y = h + 10;
      if (s.y > h + 10) s.y = -10;

      const size = (1.2 + s.z * 1.8) * devicePixelRatio;
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
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  tick();
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

// Spacebar to scramble the grid slightly
(() => {
  let t;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      document.body.classList.add('scramble');
      clearTimeout(t);
      t = setTimeout(() => document.body.classList.remove('scramble'), 400);
    }
  }, { passive: false });
})();

// Simple prompt runner (mock)
(() => {
  const form = document.querySelector('.prompt-row');
  const input = document.getElementById('prompt');
  const out = document.getElementById('outputInner');

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
    setTimeout(() => print(answer), 300 + Math.random() * 500);
    input.value = '';
  });
})();

// Mobile nav
(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
