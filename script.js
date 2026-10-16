
/* ====================================================================
   RASA — Indian Kitchen & Bar
   No frameworks. No API keys. Suitable for GitHub Pages.

   IMPORTANT: add real contact details here before publishing.
   WhatsApp country code + number, with no + or spaces, e.g. 3712XXXXXXX.
   If both are provided, WhatsApp is used for table enquiries.
   A table enquiry is NOT an automatic booking confirmation.
   ==================================================================== */
const RASA_CONFIG = {
  whatsappNumber: '',       // e.g. '37120000000' (replace with ACTUAL number)
  bookingEmail: '',         // e.g. 'reservations@your-real-domain.lv'
  phoneNumber: '',          // e.g. '+371 2000 0000'
  googleMapsUrl: '',        // full link to RASA's correct Google Maps place
  instagramUrl: '',         // e.g. 'https://www.instagram.com/youraccount/'
  replayIntroOnEveryVisit: true
};

(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const experience = $('#experience');
  const doorTrigger = $('#doorTrigger');
  const scene = $('#particleScene');
  const canvas = $('#particleCanvas');
  const site = $('#site');
  const skipButton = $('#skipIntro');
  const flash = $('#transitionFlash');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animationFrame = 0;
  let activeTimers = [];
  let experienceState = 'waiting';
  let particleAnimation = null;

  function later(fn, ms) {
    const timer = window.setTimeout(fn, ms);
    activeTimers.push(timer);
    return timer;
  }
  function clearSequence() {
    for (const timer of activeTimers) window.clearTimeout(timer);
    activeTimers = [];
    window.cancelAnimationFrame(animationFrame);
  }

  // ------ Particle logo: draw our own gold mark + RASA letters into a
  //       hidden canvas, sample pixels, then form them from moving dust. -----
  class GoldParticles {
    constructor(element) {
      this.canvas = element;
      this.ctx = element.getContext('2d', { alpha: false });
      this.particles = [];
      this.start = 0;
      this.running = false;
      this.w = 0;
      this.h = 0;
      this.mx = -9999;
      this.my = -9999;
      this.onMove = (ev) => { this.mx = ev.clientX; this.my = ev.clientY; };
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('resize', () => {
        if (this.running) this.buildParticles();
      }, { passive: true });
    }

    drawMark(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#fff';
      ctx.fillStyle = '#fff';
      ctx.lineWidth = 6.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const paths = [
        'M150 16c-17 15-28 32-27 51m27-51c17 15 28 32 27 51',
        'M150 65c-31-7-52 3-67 22-27-20-53-7-60 18-10 32 11 64 36 66 14 2 26-7 32-18 11 23 22 37 43 46',
        'M150 65c31-7 52 3 67 22 27-20 53-7 60 18-10 32 11 64-36 66-14 2-26-7-32-18-11 23-22 37-43 46',
        'M150 107c3 30 7 65 6 97-1 29-9 47-28 56-20 10-46-1-44-22 2-16 20-25 34-16 8 5 9 16 3 21',
        'M136 112l-12-4m40 4 12-4m-8 37 16 23'
      ];
      for (const p of paths) ctx.stroke(new Path2D(p));
      for (const [cx, cy, r] of [[150, 83, 6], [150, 8, 4]]) {
        ctx.beginPath();ctx.arc(cx, cy, r, 0, Math.PI * 2);ctx.fill();
      }
      ctx.restore();
    }

    buildParticles() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.65);
      const w = this.w = Math.max(320, window.innerWidth);
      const h = this.h = Math.max(400, window.innerHeight);
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const imageCanvas = document.createElement('canvas');
      imageCanvas.width = 650;
      imageCanvas.height = 500;
      const c = imageCanvas.getContext('2d', { willReadFrequently: true });
      c.clearRect(0, 0, 650, 500);
      this.drawMark(c, 223, 30, .68);
      c.fillStyle = 'white';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.font = 'normal 116px "Forum", Georgia, serif';
      const letters = 'RASA';
      const step = 106;
      for (let i = 0; i < letters.length; i++) {
        c.fillText(letters[i], 325 + (i - 1.5) * step, 375);
      }
      const rgba = c.getImageData(0, 0, 650, 500).data;
      const positions = [];
      // Iterate every 3 pixels so each target is a distinct luminous point.
      for (let y = 15; y < 475; y += 3) {
        for (let x = 10; x < 640; x += 3) {
          if (rgba[(y * 650 + x) * 4 + 3] > 95 && Math.random() > .19) {
            positions.push([x, y]);
          }
        }
      }
      const limit = w < 580 ? 1250 : 2200;
      // Fisher-Yates selection preserves balanced coverage of the mask.
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }
      positions.length = Math.min(positions.length, limit);
      const scale = Math.min((w - 30) / 710, (h - 80) / 615, 1.18);
      const ox = w / 2 - 325 * scale;
      const oy = h / 2 - 225 * scale;
      this.particles = positions.map(([x, y], i) => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(w, h) * (.24 + Math.random() * .8);
        return {
          tx: ox + x * scale,
          ty: oy + y * scale,
          x: w / 2 + Math.cos(a) * r,
          y: h / 2 + Math.sin(a) * r,
          a, r, seed: Math.random() * 999,
          size: .7 + Math.random() * 1.75,
          opacity: .45 + Math.random() * .55,
          flicker: Math.random() * 6.28,
          warm: i % 11 === 0
        };
      });
      // Free floating sparks complement the logo silhouette.
      this.stars = Array.from({ length: w < 580 ? 65 : 160 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.2, a: .12 + Math.random() * .35,
        speed: .1 + Math.random() * .5
      }));
    }

    startAnimation() {
      this.buildParticles();
      this.start = performance.now();
      this.running = true;
      const draw = (t) => {
        if (!this.running) return;
        this.render(t);
        animationFrame = window.requestAnimationFrame(draw);
      };
      animationFrame = window.requestAnimationFrame(draw);
    }

    render(time) {
      const ctx = this.ctx;
      const seconds = (time - this.start) / 1000;
      ctx.fillStyle = '#060503';
      ctx.fillRect(0, 0, this.w, this.h);
      const convergence = Math.min(1, Math.max(0, (seconds - .13) / 2.25));
      const eased = 1 - Math.pow(1 - convergence, 3.2);
      const floatFactor = (1 - eased) * 9 + 1.35;
      for (const star of this.stars) {
        ctx.fillStyle = `rgba(215,169,87,${star.a * (1 + .24 * Math.sin(time / 780 + star.x))})`;
        ctx.fillRect(star.x, (star.y + seconds * star.speed * 19) % this.h, star.r, star.r);
      }
      // Large, faint orbit lines during the initial swirl.
      if (seconds < 2.7) {
        ctx.save();
        ctx.globalAlpha = .095 * (1 - convergence);
        ctx.strokeStyle = '#bb863d';
        ctx.lineWidth = .7;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(this.w / 2, this.h / 2, this.w * (.17 + i * .13), this.h * (.12 + i * .12), -.38 + seconds * .15, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
      for (const p of this.particles) {
        const orbitalAngle = p.a + seconds * (.6 + (p.seed % 7) / 30);
        const radius = p.r * (1 - eased);
        const spiralX = this.w / 2 + Math.cos(orbitalAngle) * radius;
        const spiralY = this.h / 2 + Math.sin(orbitalAngle) * radius * .62;
        const driftX = Math.sin(seconds * 1.2 + p.seed) * floatFactor;
        const driftY = Math.cos(seconds * 1.04 + p.seed) * floatFactor;
        const x = spiralX * (1 - eased) + p.tx * eased + driftX;
        const y = spiralY * (1 - eased) + p.ty * eased + driftY;
        const shimmer = .68 + .32 * Math.sin(seconds * 3.1 + p.flicker);
        const alpha = Math.max(.12, p.opacity * shimmer * (.55 + eased * .45));
        ctx.fillStyle = p.warm ? `rgba(252,227,150,${alpha})` : `rgba(222,172,75,${alpha})`;
        const size = p.size * (.72 + eased * .28);
        ctx.fillRect(x, y, size, size);
        if (p.warm && eased > .7) {
          ctx.fillStyle = `rgba(233,175,78,${alpha * .075})`;
          ctx.beginPath();ctx.arc(x, y, 5.3, 0, Math.PI * 2);ctx.fill();
        }
      }
      if (convergence >= .98) scene.classList.add('has-formed');
    }

    stop() {
      this.running = false;
      window.cancelAnimationFrame(animationFrame);
    }
  }

  function revealSite() {
    if (experienceState === 'complete') return;
    experienceState = 'complete';
    clearSequence();
    if (particleAnimation) particleAnimation.stop();
    experience.classList.add('is-gone');
    scene.classList.remove('is-visible');
    scene.classList.remove('is-zooming');
    scene.style.visibility = 'hidden';
    site.inert = false;
    site.classList.add('is-visible');
    document.body.classList.remove('intro-active');
    window.scrollTo(0, 0);
    revealVisibleItems();
  }

  function enterRasa() {
    if (experienceState !== 'waiting') return;
    if (reduceMotion) return revealSite();
    experienceState = 'opening';
    doorTrigger.setAttribute('aria-disabled', 'true');
    experience.classList.add('is-opening');
    later(() => {
      scene.classList.add('is-visible');
      particleAnimation = new GoldParticles(canvas);
      particleAnimation.startAnimation();
    }, 850);
    later(() => {
      experience.classList.add('is-gone');
    }, 1450);
    later(() => {
      scene.classList.add('is-zooming');
      flash.classList.add('flash');
    }, 4650);
    later(() => flash.classList.remove('flash'), 4900);
    later(revealSite, 5750);
  }
  doorTrigger.addEventListener('click', enterRasa);
  doorTrigger.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); enterRasa(); }
  });
  skipButton.addEventListener('click', (ev) => {ev.stopPropagation(); revealSite();});
  if (new URLSearchParams(location.search).get('preview') === '1' ||
      (!RASA_CONFIG.replayIntroOnEveryVisit && sessionStorage.getItem('rasa-intro-played'))) {
    revealSite();
  } else {
    // Save intent, not an assumed completed booking or completed intro.
    doorTrigger.addEventListener('click', () => {
      try { sessionStorage.setItem('rasa-intro-played', 'yes'); } catch (_) { /* private browsing */ }
    }, { once: true });
  }

  // ------------------------- Navigation -----------------------------
  const toggle = $('#menuToggle');
  const nav = $('#primaryNav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#primaryNav a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }));

  // ------------------- Scroll reveal animation ----------------------
  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .10, rootMargin: '0px 0px -18px 0px' });
    $$('.reveal').forEach((node) => observer.observe(node));
  } else {
    $$('.reveal').forEach((node) => node.classList.add('in-view'));
  }
  function revealVisibleItems() {
    $$('.reveal').forEach((node) => {
      const r = node.getBoundingClientRect();
      if (r.top < window.innerHeight + 70 && r.bottom > -20) node.classList.add('in-view');
    });
  }

  // -------------------------- Menu filter ---------------------------
  const filterButtons = $$('.filter-btn');
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((b) => {
      const selected = b === button;
      b.classList.toggle('active', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    $$('.dish-card').forEach((dish) => {
      const show = filter === 'all' || dish.dataset.category.split(' ').includes(filter);
      dish.classList.toggle('is-hidden', !show);
      dish.setAttribute('aria-hidden', String(!show));
    });
  }));

  // ----------------------------- Gallery ----------------------------
  const galleryDialog = $('#galleryDialog');
  const lightboxImage = $('#lightboxImage');
  $$('.gallery-item').forEach((button) => button.addEventListener('click', () => {
    lightboxImage.src = button.dataset.image;
    lightboxImage.alt = $('img', button).alt;
    $('#lightboxCaption').textContent = button.dataset.caption;
    if (typeof galleryDialog.showModal === 'function') galleryDialog.showModal();
    else galleryDialog.setAttribute('open', '');
  }));
  $('#lightboxClose').addEventListener('click', () => galleryDialog.close());
  galleryDialog.addEventListener('click', (event) => {
    if (event.target === galleryDialog) galleryDialog.close();
  });

  // Fail gracefully if a remote demo image cannot be loaded.
  // The supplied SVG fallback is part of the project and does not need internet.
  $$('img[src^="https://images.unsplash.com/"]').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = 'true';
      img.src = 'assets/photo-fallback.svg';
    });
  });
  lightboxImage.addEventListener('error', () => { lightboxImage.src = 'assets/photo-fallback.svg'; });

  // ---------------------------- Contacts ----------------------------
  function setupLink(id, value, href, text) {
    const el = $(`#${id}`);
    if (!value || !el) return;
    el.hidden = false;
    el.href = href;
    if (text) el.textContent = text;
  }
  setupLink('addressLink', RASA_CONFIG.googleMapsUrl, RASA_CONFIG.googleMapsUrl, 'GET DIRECTIONS ↗');
  setupLink('phoneLink', RASA_CONFIG.phoneNumber, `tel:${RASA_CONFIG.phoneNumber.replace(/[\s()-]/g, '')}`, `CALL ${RASA_CONFIG.phoneNumber} ↗`);
  setupLink('instagramLink', RASA_CONFIG.instagramUrl, RASA_CONFIG.instagramUrl, 'FOLLOW ON INSTAGRAM ↗');
  $('#currentYear').textContent = String(new Date().getFullYear());

  // -------------------------- Table enquiry -------------------------
  // Browser-only websites cannot save reservations to a server.
  // This form opens WhatsApp or an email draft for the restaurant to confirm.
  const reservation = $('#reservationForm');
  const feedback = $('#formFeedback');
  const dateInput = $('#bookingDate');
  const pad = (v) => String(v).padStart(2, '0');
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  reservation.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = $('#guestName').value.trim();
    const guests = $('#guestCount').value;
    const date = dateInput.value;
    const time = $('#bookingTime').value;
    const note = $('#bookingMessage').value.trim();
    if (!name || !date || !time) {
      feedback.textContent = 'Please enter your name, preferred date and time.';
      return;
    }
    const [yy, mm, dd] = date.split('-').map(Number);
    const day = new Date(yy, mm - 1, dd).getDay();
    if (day === 0 && time >= '22:00') {
      feedback.textContent = 'On Sundays RASA closes at 22:00. Please choose an earlier time.';
      return;
    }
    const message = [
      'Hello RASA! I would like to enquire about a table.',
      `Name: ${name}`,
      `Guests: ${guests}`,
      `Date: ${date}`,
      `Preferred time: ${time}`,
      note ? `Message: ${note}` : '',
      'Please confirm if a table is available. Thank you!'
    ].filter(Boolean).join('\n');
    if (RASA_CONFIG.whatsappNumber.trim()) {
      const number = RASA_CONFIG.whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      feedback.textContent = 'WhatsApp is opening. Your request is not confirmed until RASA replies.';
    } else if (RASA_CONFIG.bookingEmail.trim()) {
      window.location.href = `mailto:${encodeURIComponent(RASA_CONFIG.bookingEmail)}?subject=${encodeURIComponent('RASA table enquiry')}&body=${encodeURIComponent(message)}`;
      feedback.textContent = 'Your email app is opening. Your request is not confirmed until RASA replies.';
    } else {
      feedback.textContent = 'Table enquiries are not connected yet. Please ask RASA for a booking contact, or add the restaurant WhatsApp/email in script.js.';
    }
  });
})();
