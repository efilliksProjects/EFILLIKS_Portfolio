/* ============================================================
   Efilliks — main.js
   Loader → Cursor → Canvas → Navbar → Reveal → Counters →
   Tabs → Portfolio Filter → Modal → Form → Misc →
   AOS → Typed → Swiper → GSAP animations
   ============================================================ */

'use strict';

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ── 1. PAGE LOADER ───────────────────────────────────────── */
(function initLoader() {
  const loader = $('#pageLoader');
  const bar    = $('#loaderBar');
  const pct    = $('#loaderPct');
  if (!loader) return;

  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.add('loaded');
        startHeroAnimations();
      }, 300);
    }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 60);
})();

/* ── 2. CUSTOM CURSOR ─────────────────────────────────────── */
(function initCursor() {
  const cursor = $('#cursor');
  const trail  = $('#cursorTrail');
  if (!cursor || !trail) return;

  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    trail.style.display  = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mx = -100, my = -100, tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  const interactives = 'a, button, .svc-tab, .pf-filter, .svc-card, .pf-item, .why-card, .testi-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) trail.classList.add('hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactives)) trail.classList.remove('hovering');
  });
})();

/* ── 3. HERO CANVAS (particle mesh — light mode) ──────────── */
class ParticleCanvas {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx    = canvasEl.getContext('2d');
    this.pts    = [];
    this.mouse  = { x: -999, y: -999 };
    this.raf    = null;
    this.resize();
    this.spawn();
    window.addEventListener('resize', () => { this.resize(); this.pts = []; this.spawn(); });
    window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawn() {
    const n = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 14000), 80);
    for (let i = 0; i < n; i++) {
      this.pts.push({
        x:  Math.random() * this.canvas.width,
        y:  Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r:  Math.random() * 1.5 + 0.5,
        a:  Math.random() * 0.25 + 0.06,
        c:  Math.random() > 0.5 ? '124,58,237' : '6,182,212',
      });
    }
  }

  update() {
    const W = this.canvas.width, H = this.canvas.height;
    this.pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 8000) {
        const f = 0.01 / Math.sqrt(d2 + 1);
        p.vx += dx * f; p.vy += dy * f;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 1.2) { p.vx = (p.vx / spd) * 1.2; p.vy = (p.vy / spd) * 1.2; }
      }
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.pts.length; i++) {
      for (let j = i + 1; j < this.pts.length; j++) {
        const dx = this.pts[i].x - this.pts[j].x;
        const dy = this.pts[i].y - this.pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${(1 - d / 120) * 0.07})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(this.pts[i].x, this.pts[i].y);
          ctx.lineTo(this.pts[j].x, this.pts[j].y);
          ctx.stroke();
        }
      }
    }

    this.pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
    });
  }

  loop() { this.update(); this.draw(); this.raf = requestAnimationFrame(() => this.loop()); }
  start() { if (!this.raf) this.loop(); }
  stop()  { cancelAnimationFrame(this.raf); this.raf = null; }
}

let heroCanvas = null;

function startHeroAnimations() {
  const canvasEl = $('#heroCanvas');
  if (canvasEl) {
    heroCanvas = new ParticleCanvas(canvasEl);
    heroCanvas.start();
  }

  const heroReveal = $$('.hero .reveal-fade-up');
  heroReveal.forEach(el => {
    const d = parseFloat(el.dataset.delay || 0) * 1000;
    setTimeout(() => el.classList.add('visible'), d);
  });

  // Typed.js hero badge
  if (typeof Typed !== 'undefined' && $('#typed-hero')) {
    new Typed('#typed-hero', {
      strings: [
        'AI-Powered Solutions',
        'Full-Stack Development',
        'IoT Engineering',
        'Cloud Architecture',
        'Modern Enterprise Tech',
      ],
      typeSpeed: 55,
      backSpeed: 35,
      backDelay: 2200,
      loop: true,
      smartBackspace: true,
    });
  }
}

/* ── 4. AOS INIT ──────────────────────────────────────────── */
(function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 750,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });
})();

/* ── 5. SWIPER TESTIMONIALS ───────────────────────────────── */
(function initSwiper() {
  if (typeof Swiper === 'undefined') return;
  new Swiper('.testiSwiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      640:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
    grabCursor: true,
  });
})();

/* ── 6. NAVBAR SCROLL BEHAVIOUR ──────────────────────────── */
(function initNavbar() {
  const navbar = $('#navbar');
  const toggle = $('#navToggle');
  const links  = $('#navLinks');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    const bt = $('#backTop');
    if (bt) bt.hidden = window.scrollY < 500;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    $$('[data-nav]').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  const sections = $$('section[id], div[id]');
  const navLinks  = $$('.nav-link[data-nav]');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ── 7. SCROLL REVEAL ─────────────────────────────────────── */
(function initReveal() {
  const revealEls = $$('.reveal-fade-up, .reveal-fade-right, .reveal-fade-left');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseFloat(entry.target.dataset.delay || 0) * 1000;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => {
    if (el.closest('.hero')) return;
    io.observe(el);
  });
})();

/* ── 8. STAT COUNTERS ─────────────────────────────────────── */
(function initCounters() {
  const counters = $$('.counter[data-target]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1800;
      const start  = performance.now();

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* ── 9. SERVICE TABS ──────────────────────────────────────── */
(function initTabs() {
  const tabs   = $$('.svc-tab');
  const panels = $$('.svc-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t   => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = $('#' + tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });
})();

/* ── 10. PORTFOLIO FILTER ─────────────────────────────────── */
(function initPortfolioFilter() {
  const filters = $$('.pf-filter');
  const items   = $$('.pf-item');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const cats = (item.dataset.cats || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        if (show) {
          item.classList.remove('filtered-out');
          item.style.animation = 'fade-in-up 0.4s var(--ease) both';
        } else {
          item.classList.add('filtered-out');
          item.style.animation = '';
        }
      });
    });
  });
})();

/* ── 11. DEMO MODAL ───────────────────────────────────────── */
(function initModal() {
  const modal    = $('#demoModal');
  const backdrop = $('#modalBackdrop');
  const closeBtn = $('#modalClose');
  if (!modal) return;

  function open() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  ['openDemoModal', 'openScheduleModal'].forEach(id => {
    const btn = $('#' + id);
    if (btn) btn.addEventListener('click', open);
  });

  closeBtn  && closeBtn.addEventListener('click', close);
  backdrop  && backdrop.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = $$('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])', modal);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

/* ── 12. CONTACT FORM ─────────────────────────────────────── */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const submitBtn  = $('#submitBtn');
  const successMsg = $('#formSuccess');

  function setErr(fieldId, msg) {
    const el = form.querySelector('#err-' + fieldId);
    if (el) el.textContent = msg;
    const input = form.querySelector('#' + fieldId);
    if (input) input.classList.toggle('invalid', !!msg);
  }

  function clearErrs() {
    $$('.form-err', form).forEach(e => e.textContent = '');
    $$('.invalid', form).forEach(e => e.classList.remove('invalid'));
  }

  function validate() {
    clearErrs();
    let ok = true;
    const v = f => form.querySelector('#' + f)?.value.trim();

    if (!v('firstName')) { setErr('firstName', 'First name is required.'); ok = false; }
    if (!v('lastName'))  { setErr('lastName',  'Last name is required.');  ok = false; }

    const email = v('email');
    if (!email) { setErr('email', 'Email is required.'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'Please enter a valid email.'); ok = false; }

    if (!v('message')) { setErr('message', 'Please tell us about your project.'); ok = false; }


    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const defaultText = submitBtn.querySelector('.btn-default-text');
    const loadingText = submitBtn.querySelector('.btn-loading-text');
    submitBtn.disabled = true;
    if (defaultText) defaultText.hidden = true;
    if (loadingText) loadingText.hidden = false;

    /*
      WEB3FORMS INTEGRATION
    */
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });

      const result = await response.json();

      if (result.success) {
        form.reset();
        // Hide all form children except success message
        Array.from(form.children).forEach(child => {
          if (child !== successMsg) child.style.display = 'none';
        });
        if (successMsg) successMsg.hidden = false;
        
        // Optionally show form again after delay
        setTimeout(() => {
          if (successMsg) successMsg.hidden = true;
          Array.from(form.children).forEach(child => {
            if (child !== successMsg) child.style.display = '';
          });
        }, 8000);
      } else {
        alert('Something went wrong. Please try again or email us directly.');
      }
    } catch (error) {
      console.error('Form Error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      if (defaultText) defaultText.hidden = false;
      if (loadingText) loadingText.hidden = true;
    }
  });
})();

/* ── 13. NEWSLETTER FORM ──────────────────────────────────── */
(function initNewsletter() {
  const form = $('#nlForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value) return;

    // Replace with your newsletter provider (Mailchimp, ConvertKit, etc.)
    const btn = form.querySelector('button');
    if (btn) { btn.innerHTML = '<i class="fas fa-check"></i>'; btn.style.background = '#22c55e'; }

    setTimeout(() => {
      if (btn) { btn.innerHTML = '<i class="fas fa-arrow-right"></i>'; btn.style.background = ''; }
      form.reset();
    }, 3000);
  });
})();

/* ── 14. MAGNETIC BUTTONS ─────────────────────────────────── */
(function initMagnetic() {
  if (window.matchMedia('(hover: none)').matches) return;

  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) * 0.35;
      const dy = (e.clientY - rect.top  - rect.height / 2) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ── 15. BACK TO TOP ──────────────────────────────────────── */
(function initBackTop() {
  const btn = $('#backTop');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 16. SMOOTH SCROLL ────────────────────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

/* ── 17. COPYRIGHT YEAR ───────────────────────────────────── */
(function updateYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── 18. GSAP ENHANCED ANIMATIONS ────────────────────────── */
(function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Stats strip — stagger
  gsap.from('.stat-item', {
    scrollTrigger: { trigger: '.stats-strip', start: 'top 80%' },
    y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
  });

  // Why cards — stagger
  gsap.from('.why-card', {
    scrollTrigger: { trigger: '.why-section', start: 'top 75%' },
    y: 50, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
  });

  // Service cards — 3D tilt on hover
  $$('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * -8;
      gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.3, ease: 'power1.out', transformPerspective: 900 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
    });
  });

  // Why cards — same 3D tilt
  $$('.why-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * -6;
      gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.3, ease: 'power1.out', transformPerspective: 800 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
    });
  });

  // Platform mockup — reveal
  gsap.from('.platform-mockup', {
    scrollTrigger: { trigger: '.platform-section', start: 'top 72%' },
    x: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
  });

  // Hero float cards — spring entrance
  gsap.fromTo('.float-card', {
    opacity: 0, scale: 0.7, y: 30,
  }, {
    opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'back.out(1.6)',
    delay: 1.2,
  });

  // Hero title lines
  gsap.from('.ht-line', {
    y: 70, opacity: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out', delay: 0.5,
  });

  // About visual rings — spin subtly on scroll
  gsap.to('.ring-2', {
    scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: 1 },
    rotation: 20, ease: 'none',
  });

  gsap.to('.ring-3', {
    scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: 1 },
    rotation: -15, ease: 'none',
  });

  // Horizontal skill pills on scroll in about
  gsap.from('.av-skill', {
    scrollTrigger: { trigger: '.about-section', start: 'top 70%' },
    opacity: 0, scale: 0.6, duration: 0.5, stagger: 0.08, ease: 'back.out(2)',
    delay: 0.3,
  });

  // Portfolio items — scale in
  gsap.from('.pf-item', {
    scrollTrigger: { trigger: '.pf-grid', start: 'top 80%' },
    scale: 0.9, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
  });

  // Pinned horizontal scroll hint on ticker
  gsap.to('.ticker-wrap', {
    scrollTrigger: { trigger: '.ticker-wrap', start: 'top 95%', toggleActions: 'play none none reverse' },
    opacity: 1, duration: 0.4,
  });

})();

/* ── 19. REDUCED MOTION ───────────────────────────────────── */
(function respectReducedMotion() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function apply() {
    const track = $('.ticker-track');
    if (track) track.style.animationPlayState = mq.matches ? 'paused' : 'running';
    if (heroCanvas && mq.matches) heroCanvas.stop();
  }
  apply();
  mq.addEventListener('change', apply);
})();
