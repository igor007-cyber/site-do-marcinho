/* Corra Sem Limites — Vanilla JS interactions. GSAP enhances, never blocks functionality. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced = () => mediaReduce.matches;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const safeCallback = (fn) => typeof fn === 'function' && fn();

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Make sure local artwork is displayed if a remote illustration/photo fails.
  $$('img[data-fallback]').forEach((img) => {
    const fallback = img.dataset.fallback;
    const useFallback = () => {
      if (!img.dataset.fallbackApplied && fallback) {
        img.dataset.fallbackApplied = 'true';
        img.src = fallback;
      }
    };
    img.addEventListener('error', useFallback, { once: true });
    if (img.complete && !img.naturalWidth) useFallback();
  });

  // Accessible off-canvas navigation; no dependency on third-party libraries.
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  let lastFocused = null;

  function setMenu(open, restoreFocus = false) {
    if (!menuToggle || !mobileMenu) return;
    const wasOpen = document.body.classList.contains('menu-open');
    if (open === wasOpen) return;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    mobileMenu.inert = !open;
    if (open) {
      lastFocused = document.activeElement;
      const firstLink = $('a', mobileMenu);
      requestAnimationFrame(() => firstLink?.focus({ preventScroll: true }));
    } else if (restoreFocus) {
      requestAnimationFrame(() => (lastFocused || menuToggle).focus({ preventScroll: true }));
    }
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(!document.body.classList.contains('menu-open'), true);
  });
  $$('#mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false, true);
    if (e.key !== 'Tab' || !document.body.classList.contains('menu-open')) return;
    const focusable = $$('a, button:not([disabled])', $('.site-header')).filter((el) =>
      el.getClientRects().length && !el.closest('[inert]')
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first?.focus();
    }
  });
  document.addEventListener('pointerdown', (e) => {
    if (!document.body.classList.contains('menu-open')) return;
    if (!e.target.closest('.site-header')) setMenu(false);
  });
  window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  // Navigation scroll progress, sticky header state, and return-to-top button.
  const header = $('.site-header');
  const progress = $('#scroll-progress');
  const toTop = $('#back-to-top');
  let scrollTicking = false;

  function updateScrollUI() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const top = Math.max(0, window.scrollY || window.pageYOffset);
    if (progress) progress.style.width = `${clamp(top / maxScroll, 0, 1) * 100}%`;
    header?.classList.toggle('is-scrolled', top > 24);
    toTop?.classList.toggle('is-visible', top > 730);
    scrollTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  window.addEventListener('resize', () => window.requestAnimationFrame(updateScrollUI), { passive: true });
  updateScrollUI();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: isReduced() ? 'instant' : 'smooth' });
  });

  // Mark the active desktop section link.
  const navLinks = $$('a[data-nav]');
  const navTargets = navLinks.map((link) => document.getElementById(link.dataset.nav)).filter(Boolean);
  if ('IntersectionObserver' in window && navTargets.length) {
    const navObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === entry.target.id));
      }
    }, { rootMargin: '-26% 0px -62% 0px', threshold: 0 });
    navTargets.forEach((section) => navObserver.observe(section));
  }

  // FAQ: semantic buttons, one expanded panel at a time, smooth height changes.
  const faqItems = $$('.faq-item');
  const faqTimers = new WeakMap();
  function faqSetOpen(item, open, instant = false) {
    const button = $('.faq-question', item);
    const panel = $('.faq-answer', item);
    if (!button || !panel) return;
    const existing = faqTimers.get(panel);
    if (existing) window.clearTimeout(existing);
    item.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    if (isReduced() || instant) {
      panel.hidden = !open;
      panel.style.height = '';
      panel.style.transition = '';
      return;
    }
    panel.style.overflow = 'hidden';
    panel.style.transition = 'height 330ms cubic-bezier(.22,.9,.3,1)';
    const naturalHeight = () => $('.faq-answer-content', panel)?.getBoundingClientRect().height || 0;
    if (open) {
      panel.hidden = false;
      panel.style.height = '0px';
      void panel.offsetHeight;
      panel.style.height = `${naturalHeight()}px`;
      faqTimers.set(panel, window.setTimeout(() => { panel.style.height = ''; panel.style.transition = ''; }, 345));
    } else {
      panel.style.height = `${panel.getBoundingClientRect().height}px`;
      void panel.offsetHeight;
      panel.style.height = '0px';
      faqTimers.set(panel, window.setTimeout(() => { panel.hidden = true; panel.style.height = ''; panel.style.transition = ''; }, 345));
    }
  }
  faqItems.forEach((item) => {
    const button = $('.faq-question', item);
    button?.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) faqSetOpen(other, false);
      });
      faqSetOpen(item, shouldOpen);
    });
  });

  // Responsive carousel with keyboard and touch/drag navigation.
  const viewport = $('#testimonial-viewport');
  const track = $('#testimonial-track');
  const prev = $('#testimonial-prev');
  const next = $('#testimonial-next');
  const progressBar = $('#carousel-progress-bar');
  const carouselLive = $('#carousel-live');
  const carouselCards = track ? $$('.testimonial-card', track) : [];
  let carouselIndex = 0;
  let maxIndex = 0;
  let visibleCards = 1;
  let cardStep = 0;
  let dragStartX = null;
  let dragStartY = null;

  function measureCarousel() {
    if (!viewport || !track || !carouselCards.length) return;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    const cardWidth = carouselCards[0].getBoundingClientRect().width;
    cardStep = cardWidth + gap;
    visibleCards = clamp(Math.round((viewport.getBoundingClientRect().width + gap) / Math.max(1,cardStep)), 1, carouselCards.length);
    maxIndex = Math.max(0, carouselCards.length - visibleCards);
    carouselIndex = clamp(carouselIndex, 0, maxIndex);
    paintCarousel();
  }

  function paintCarousel() {
    if (!track || !carouselCards.length) return;
    track.style.transform = `translate3d(${-carouselIndex * cardStep}px,0,0)`;
    if (prev) prev.disabled = carouselIndex === 0;
    if (next) next.disabled = carouselIndex >= maxIndex;
    if (progressBar) progressBar.style.width = `${Math.round((carouselIndex + visibleCards) / carouselCards.length * 100)}%`;
    if (carouselLive) carouselLive.textContent = `Mostrando depoimentos ${carouselIndex + 1} a ${Math.min(carouselCards.length, carouselIndex + visibleCards)} de ${carouselCards.length}.`;
  }

  function moveCarousel(direction) {
    if (!track || !cardStep) return;
    carouselIndex = clamp(carouselIndex + direction, 0, maxIndex);
    paintCarousel();
  }

  prev?.addEventListener('click', () => moveCarousel(-1));
  next?.addEventListener('click', () => moveCarousel(1));
  viewport?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); moveCarousel(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveCarousel(-1); }
  });
  viewport?.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
  });
  viewport?.addEventListener('pointerup', (event) => {
    if (dragStartX === null) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) moveCarousel(dx < 0 ? 1 : -1);
    dragStartX = null;
    dragStartY = null;
  });
  viewport?.addEventListener('pointercancel', () => { dragStartX = null; dragStartY = null; });
  if ('ResizeObserver' in window && viewport) {
    new ResizeObserver(() => requestAnimationFrame(measureCarousel)).observe(viewport);
  } else {
    window.addEventListener('resize', measureCarousel, { passive: true });
  }
  measureCarousel();

  // Small, accessible numeral animation (runs only once, respects reduced motion).
  function animateNumber(el) {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = '1';
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || isReduced()) return;
    const duration = 900;
    const start = performance.now();
    function frame(now) {
      const portion = clamp((now - start) / duration, 0, 1);
      const easing = 1 - Math.pow(1 - portion, 3);
      el.textContent = String(Math.round(target * easing));
      if (portion < 1) requestAnimationFrame(frame);
    }
    el.textContent = '0';
    requestAnimationFrame(frame);
  }
  const numbers = $$('.count-number[data-count]');
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries, obs) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateNumber(entry.target);
      obs.unobserve(entry.target);
    }), { threshold: .4 });
    numbers.forEach((el) => countObserver.observe(el));
  } else {
    numbers.forEach(animateNumber);
  }

  // Progressive motion: ScrollTrigger when available, IntersectionObserver fallback.
  const revealItems = $$('[data-reveal]');
  function activateFallbackReveal() {
    if (!revealItems.length) return;
    if (isReduced() || !('IntersectionObserver' in window)) {
      revealItems.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: .05 });
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  document.documentElement.classList.add('js-ready');
  const gsapAvailable = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!isReduced() && gsapAvailable) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    revealItems.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: .85, ease: 'power3.out', clearProps: 'opacity,transform',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true,
          onEnter: () => el.classList.add('in-view') }
      });
    });
    gsap.fromTo('.hero-line > span', { opacity: 0, yPercent: 115 }, { opacity: 1, yPercent: 0, duration: 1.05, stagger: .10, delay: .12, ease: 'power4.out' });
    gsap.fromTo('.hero-eyebrow', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: .65, delay: .15 });
    gsap.fromTo('.hero-quote, .hero-support, .hero-actions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: .12, duration: .8, delay: .7, ease: 'power2.out' });
    gsap.fromTo('.hero-bottom .hero-stat', { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: .12, duration: .75, delay: .85 });
    if (window.matchMedia('(min-width: 769px)').matches) {
      gsap.to('.hero-photo img', { yPercent: 8, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.image-break-bg img', { yPercent: -10, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.image-break', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.hero-halo', { rotate: 15, scale: 1.13, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    const cards = $$('.method-step');
    cards.forEach((el) => {
      gsap.fromTo($('.method-step-icon', el), { rotate: -30, scale: .7, opacity: .2 }, {
        rotate: 0, scale: 1, opacity: 1, ease: 'back.out(1.4)', duration: .9,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    window.addEventListener('load', () => safeCallback(() => window.ScrollTrigger.refresh()), { once: true });
  } else {
    activateFallbackReveal();
  }

  // Safety net for any reveal content when third-party animation is interrupted.
  window.setTimeout(() => {
    if (!gsapAvailable || isReduced()) revealItems.forEach((el) => el.classList.add('in-view'));
  }, 1800);

  // Re-evaluate user preference if reduced motion is changed while viewing.
  mediaReduce.addEventListener('change', (event) => {
    if (event.matches) {
      revealItems.forEach((el) => {
        el.classList.add('in-view');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  });
})();
