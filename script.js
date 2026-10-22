/* ====================================================================
   RASA — Indian Kitchen & Bar
   No frameworks. No API keys. Suitable for GitHub Pages.

   IMPORTANT: set your real contact and maps links before publishing.
   The reservation section has been removed as requested.
   ==================================================================== */
const RASA_CONFIG = {
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
  const site = $('#site');
  const skipButton = $('#skipIntro');
  const flash = $('#transitionFlash');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeTimers = [];
  let experienceState = 'waiting';

  function later(fn, ms) {
    const timer = window.setTimeout(fn, ms);
    activeTimers.push(timer);
    return timer;
  }
  function clearSequence() {
    for (const timer of activeTimers) window.clearTimeout(timer);
    activeTimers = [];
  }

  // ---------------------- Gold logo reveal -------------------------
  // No video and no canvas: logo, letters and subtle glints animate with CSS.
  const starField = $('#introStars');
  // Seeded positions keep the elegant starfield consistent between visits.
  let starSeed = 93721;
  function randomStar() {
    starSeed = (Math.imul(1664525, starSeed) + 1013904223) >>> 0;
    return starSeed / 4294967296;
  }
  for (let i = 0; i < 85; i++) {
    const star = document.createElement('i');
    star.className = 'intro-star';
    star.style.left = `${(randomStar() * 100).toFixed(2)}%`;
    star.style.top = `${(randomStar() * 100).toFixed(2)}%`;
    star.style.setProperty('--star-delay', `${(-randomStar() * 8).toFixed(2)}s`);
    star.style.setProperty('--star-duration', `${(2.8 + randomStar() * 5).toFixed(2)}s`);
    star.style.setProperty('--star-size', `${(randomStar() > .85 ? 2 : 1)}px`);
    starField.appendChild(star);
  }

  function revealSite() {
    if (experienceState === 'complete') return;
    experienceState = 'complete';
    clearSequence();
    experience.classList.add('is-gone');
    scene.classList.remove('is-visible', 'is-revealed', 'is-zooming');
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
    later(() => scene.classList.add('is-visible'), 900);
    later(() => {
      experience.classList.add('is-gone');
      scene.classList.add('is-revealed');
    }, 1380);
    later(() => {
      scene.classList.add('is-zooming');
      flash.classList.add('flash');
    }, 4750);
    later(() => flash.classList.remove('flash'), 5090);
    later(revealSite, 5900);
  }
  doorTrigger.addEventListener('click', enterRasa);
  doorTrigger.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); enterRasa(); }
  });
  skipButton.addEventListener('click', (ev) => { ev.stopPropagation(); revealSite(); });
  let introPreviouslySeen = false;
  try { introPreviouslySeen = sessionStorage.getItem('rasa-intro-played') === 'yes'; } catch (_) {}
  if (new URLSearchParams(location.search).get('preview') === '1' ||
      (!RASA_CONFIG.replayIntroOnEveryVisit && introPreviouslySeen)) {
    revealSite();
  } else {
    doorTrigger.addEventListener('click', () => {
      try { sessionStorage.setItem('rasa-intro-played', 'yes'); } catch (_) {}
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

  // -------------------- Orbiting golden image frames --------------------
  // This is the static HTML equivalent of the supplied React "Neon Border".
  // Two luminous arcs continuously travel around each image's real perimeter.
  // SVG (rather than a rotating box) keeps highlights on the arched outlines.
  function initRasaGoldBorders() {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const frames = $$('[data-rasa-border]');
    const reduceBorders = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function makeSvgEl(tag, attributes) {
      const element = document.createElementNS(SVG_NS, tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
      return element;
    }

    // Elliptical arch close to the 47%-wide / 35%-tall radius of RASA's hero.
    function archOutline(width, height, inset, isStory) {
      const l = inset, t = inset, r = width - inset, b = height - inset;
      const w = r - l, h = b - t;
      const rx = w * (isStory ? .49 : .47);
      const ry = h * (isStory ? .31 : .35);
      const k = .55228475; // cubic Bezier control constant for a quarter ellipse
      const corner = isStory ? 0 : 4;
      const q = corner;
      return [
        `M ${l} ${t + ry}`,
        `C ${l} ${t + ry*(1-k)} ${l + rx*(1-k)} ${t} ${l+rx} ${t}`,
        `L ${r-rx} ${t}`,
        `C ${r-rx + rx*k} ${t} ${r} ${t+ry*(1-k)} ${r} ${t+ry}`,
        `L ${r} ${b-q}`,
        q ? `Q ${r} ${b} ${r-q} ${b}` : `L ${r} ${b}`,
        `L ${l+q} ${b}`,
        q ? `Q ${l} ${b} ${l} ${b-q}` : `L ${l} ${b}`,
        'Z'
      ].join(' ');
    }

    function roundedOutline(width, height, inset, radius) {
      const l = inset, t = inset, r = width - inset, b = height - inset;
      const cr = Math.max(0, Math.min(radius, (r-l)/2, (b-t)/2));
      return [
        `M ${l+cr} ${t}`, `L ${r-cr} ${t}`, `Q ${r} ${t} ${r} ${t+cr}`,
        `L ${r} ${b-cr}`, `Q ${r} ${b} ${r-cr} ${b}`,
        `L ${l+cr} ${b}`, `Q ${l} ${b} ${l} ${b-cr}`,
        `L ${l} ${t+cr}`, `Q ${l} ${t} ${l+cr} ${t}`, 'Z'
      ].join(' ');
    }

    function drawFrame(frame, svg) {
      const w = frame.clientWidth, h = frame.clientHeight;
      if (w < 2 || h < 2) return;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const style = getComputedStyle(frame);
      const inset = frame.classList.contains('hero-visual-arch') ? 6 :
                    (frame.classList.contains('story-small-photo') || frame.classList.contains('kitchen-photo-side') ? 12 : 3);
      const shape = frame.dataset.rasaBorder === 'arch'
        ? archOutline(w,h,inset,frame.classList.contains('story-arch-photo'))
        : roundedOutline(w,h,inset,parseFloat(style.borderTopLeftRadius) || 0);
      svg.querySelectorAll('path').forEach(path => path.setAttribute('d',shape));
    }

    const installed = [];
    frames.forEach((frame,index) => {
      // A frame is visual decoration, never an extra button or clickable layer.
      if (frame.querySelector('.rasa-orbit-frame')) return;
      const svg = makeSvgEl('svg',{
        class:'rasa-orbit-frame', 'aria-hidden':'true',focusable:'false',preserveAspectRatio:'none'
      });
      ['orbit-track','orbit-aura','orbit-bloom','orbit-highlight','orbit-core'].forEach(name => {
        const path = makeSvgEl('path',{class:name,pathLength:1000});
        svg.appendChild(path);
      });
      frame.appendChild(svg);
      // Deliberately stagger phases so the entire gallery doesn't pulse in unison.
      frame.style.setProperty('--rasa-orbit-delay',`${-(index*1.7).toFixed(2)}s`);
      frame.style.setProperty('--rasa-orbit-time',`${(10.8+(index%4)*.9).toFixed(1)}s`);
      installed.push([frame,svg]);
      drawFrame(frame,svg);
    });

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const frame = entry.target;
          const svg = frame.querySelector('.rasa-orbit-frame');
          if (svg) drawFrame(frame,svg);
        }
      });
      installed.forEach(([frame]) => resizeObserver.observe(frame));
    } else {
      window.addEventListener('resize',() => {
        installed.forEach(([frame,svg])=>drawFrame(frame,svg));
      },{passive:true});
    }

    if (reduceBorders || !('IntersectionObserver' in window)) {
      installed.forEach(([frame]) => frame.classList.add('rasa-border--playing'));
    } else {
      const visible = new IntersectionObserver(entries => {
        for (const entry of entries) {
          entry.target.classList.toggle('rasa-border--playing',entry.isIntersecting);
        }
      },{rootMargin:'80px 0px 80px 0px',threshold:0});
      installed.forEach(([frame])=>visible.observe(frame));
    }
  }
  initRasaGoldBorders();

})();
