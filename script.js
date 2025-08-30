/* Helpers */
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

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
(function themeInit(){
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') document.documentElement.setAttribute('data-theme', stored);
  else document.documentElement.setAttribute('data-theme', 'auto');
})();
const themeBtn = document.querySelector('[data-theme-toggle]');
if (themeBtn){
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : current === 'light' ? 'auto' : 'dark';
    html.setAttribute('data-theme', next);
    if (next === 'auto') localStorage.removeItem('theme'); else localStorage.setItem('theme', next);
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
(function projectFilter(){
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
(function caseStudyModal(){
  const modal = $('#caseModal');
  const body = $('#caseBody');
  const title = $('#caseTitle');

  function close(){ modal.hidden = true; body.innerHTML = ''; }
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open-case]');
    if (openBtn) {
      const data = JSON.parse(openBtn.getAttribute('data-open-case'));
      title.textContent = data.title || 'Case Study';
      body.innerHTML = `
        <article class="post">
          <h4>Problem</h4><p>${escapeHTML(data.problem||'')}</p>
          <h4>Tech stack</h4><p>${(data.tech||[]).map(badge).join(' ')}</p>
          <h4>Key challenges</h4>${ul(data.challenges||[])}
          <h4>Solutions</h4>${ul(data.solutions||[])}
          <h4>Achievements</h4>${ul(data.achievements||[])}
        </article>`;
      modal.hidden = false;
      modal.querySelector('[data-close-modal]').focus();
      track('case_open', { title: data.title });
    }
    if (e.target.matches('.modal-backdrop,[data-close-modal]')) close();
  });
  addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !modal.hidden){ e.preventDefault(); close(); } });

  function ul(arr){ return `<ul class="highlights">${arr.map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>`; }
  function badge(t){ return `<span class="badge" style="font-size:.72rem">${escapeHTML(t)}</span>`; }
  function escapeHTML(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();

/* Blog: simple Markdown → HTML (composer removed; still renders a seed post) */
function mdToHtml(md){
  let lines = md.replace(/\r\n?/g,'\n').split('\n');
  let html='', inList=false;
  const flush=()=>{ if(inList){ html+='</ul>'; inList=false; } };
  for(const raw of lines){
    const line = raw.trimRight();
    if(/^#{1,6}\s/.test(line)){ flush(); const lvl=line.match(/^#{1,6}/)[0].length; const t=line.replace(/^#{1,6}\s*/,''); html+=`<h${lvl}>${inline(t)}</h${lvl}>`; continue; }
    if(/^-\s+/.test(line)){ if(!inList){ html+='<ul>'; inList=true; } html+=`<li>${inline(line.replace(/^-+\s*/,''))}</li>`; continue; }
    if(line===''){ flush(); html+='<p></p>'; continue; }
    flush(); html+=`<p>${inline(line)}</p>`;
  } flush(); return html;
  function inline(s){ return s.replace(/`([^`]+)`/g,(_,c)=>`<code>${escapeHTML(c)}</code>`).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/_([^_]+)_/g,'<em>$1</em>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>'); }
  function escapeHTML(s){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
}
const defaultPosts=[{title:'Evaluating Classification Models',slug:'evaluating-classifiers',md:`# Evaluating Models
When accuracy isn't enough, try **AUC**, *log-loss*, and **Lift@K**.
- Calibrate probabilities for ranking quality
- Prefer stratified CV for imbalanced sets
See also: [scikit-learn metrics](https://scikit-learn.org/stable/modules/model_evaluation.html).`}];
(function blogInit(){
  const grid = $('#blogGrid'); if(!grid) return;
  grid.innerHTML = defaultPosts.map(p=>`
    <article class="card post" data-animate>
      <h3>${p.title}</h3>
      <p class="meta">${new Date().toLocaleDateString()}</p>
      <div class="content">${mdToHtml(p.md)}</div>
    </article>`).join('');
  $$('[data-animate]', grid).forEach(el=>io.observe(el));
})();

/* -------- Analytics helper (works for GA4 or Plausible if added in head) -------- */
function track(eventName, params = {}) {
  if (window.gtag) gtag('event', eventName, params);
  if (window.plausible) plausible(eventName, { props: params });
}

/* -------- Forms validation + EmailJS with graceful fallback -------- */
function validateField(field){
  const error = field.parentElement.querySelector('.error');
  let msg='';
  if(field.validity.valueMissing) msg='This field is required.';
  else if(field.type==='email' && field.validity.typeMismatch) msg='Please enter a valid email.';
  error.textContent = msg; return !msg;
}
function wireForm(form, onOk){
  if(!form) return;
  const fields = $$('input, textarea', form);
  fields.forEach(f=>f.addEventListener('blur', ()=>validateField(f)));
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const ok = fields.every(validateField);
    if(!ok) return;
    await onOk?.();
  });
}
const contactForm = $('#contactForm');
wireForm(contactForm, async ()=>{
  const success = $('.form-success', contactForm);
  const fail = $('.form-fail', contactForm);

  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const msg = contactForm.message.value.trim();

  // Change these three to your actual EmailJS values to enable direct sending
  const EMAILJS_PUBLIC_KEY='BdYe8tQLJJ9D6NYym';
  const EMAILJS_SERVICE_ID='service_naou89f';
  const EMAILJS_TEMPLATE_ID='template_9upsyhp';

  let sent = false;
  try{
    if(window.emailjs && EMAILJS_PUBLIC_KEY !== 'BdYe8tQLJJ9D6NYym'){
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: name, reply_to: email, message: msg
      });
      sent = true;
      track('contact_submit', { method: 'emailjs' });
    }
  }catch(err){ console.error('EmailJS error:', err); }

  if (sent){
    success.hidden=false; fail.hidden=true; contactForm.reset();
    setTimeout(()=>success.hidden=true, 5000);
  } else {
    // Fallback: open user's mail app prefilled
    const subject = encodeURIComponent('Portfolio contact');
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    window.location.href = `mailto:yashkumarroy164@gmail.com?subject=${subject}&body=${body}`;
    fail.hidden=false; success.hidden=true;
    setTimeout(()=>fail.hidden=true, 4000);
    track('contact_submit', { method: 'mailto_fallback' });
  }
});

/* Mark resume downloads as events */
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-track]');
  if (a) track(a.dataset.track, { href: a.href });
});

/* Footer year */
$('#year').textContent = String(new Date().getFullYear());
