/* ========================================
   CODEMATRIX — MAIN JAVASCRIPT
   Features:
   - Page loader
   - Navbar scroll behavior & mobile menu
   - Scroll-based animations (IntersectionObserver)
   - Animated stat counters
   - Contact form validation
   - Button ripple effects
   - Active nav highlighting
   - Smooth anchor navigation
   ======================================== */

'use strict';

/* ── UTILITIES ── */

/**
 * Simple query selector shorthand
 */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/**
 * Debounce function to limit rapid event calls
 */
function debounce(fn, ms = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Clamp a value between min and max
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ── PAGE LOADER ── */

function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  // Add loading class to prevent scroll
  document.body.classList.add('loading');

  // Wait for progress animation then hide loader
  const hideLoader = () => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
  };

  // Hide after animation completes (1.2s) + small buffer
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 1400);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 800));
  }
}

/* ── NAVBAR ── */

function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  // Scroll detection — add 'scrolled' class after threshold
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run on init
}

/* ── MOBILE MENU ── */

function initMobileMenu() {
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  if (!hamburger || !navLinks) return;

  // Toggle menu open/closed
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on nav link click
  $$('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

/* ── SCROLL ANIMATIONS ── */

function initScrollAnimations() {
  const animatedEls = $$('[data-animate]');
  if (!animatedEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Unobserve after animating to save resources
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  animatedEls.forEach(el => observer.observe(el));
}

/* ── ANIMATED COUNTERS ── */

function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  /**
   * Eased counting animation
   */
  function animateCounter(el, target, duration = 2000) {
    const start = performance.now();

    function update(timestamp) {
      const elapsed = timestamp - start;
      const progress = clamp(elapsed / duration, 0, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}

/* ── BUTTON RIPPLE EFFECT ── */

function initRippleEffects() {
  const buttons = $$('.btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;

      btn.appendChild(ripple);

      // Remove ripple after animation completes
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ── CONTACT FORM VALIDATION ── */

function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const submitBtn = $('#submitBtn', form);
  const formSuccess = $('#formSuccess');

  /**
   * Validate email format
   */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /**
   * Show or hide field error
   */
  function setError(fieldId, errorId, message) {
    const field = $(`#${fieldId}`);
    const errorEl = $(`#${errorId}`);
    if (!field || !errorEl) return;

    if (message) {
      field.closest('.form-group').classList.add('has-error');
      errorEl.textContent = message;
      errorEl.classList.add('show');
    } else {
      field.closest('.form-group').classList.remove('has-error');
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }
  }

  /**
   * Validate a single field on blur
   */
  function validateField(field) {
    const id = field.id;
    const val = field.value.trim();

    if (id === 'firstName' || id === 'lastName') {
      setError(id, `${id}Error`, val ? '' : 'This field is required.');
    }
    if (id === 'email') {
      if (!val) setError('email', 'emailError', 'Email is required.');
      else if (!isValidEmail(val)) setError('email', 'emailError', 'Please enter a valid email address.');
      else setError('email', 'emailError', '');
    }
    if (id === 'message') {
      if (!val) setError('message', 'messageError', 'Please enter your message.');
      else if (val.length < 20) setError('message', 'messageError', 'Message must be at least 20 characters.');
      else setError('message', 'messageError', '');
    }
  }

  // Validate on blur for each field
  $$('input, textarea', form).forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      // Clear error on typing
      if (field.closest('.form-group').classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  /**
   * Full form validation before submit
   */
  function validateForm() {
    let valid = true;

    const firstName = $('#firstName');
    const lastName  = $('#lastName');
    const email     = $('#email');
    const message   = $('#message');

    if (!firstName.value.trim()) {
      setError('firstName', 'firstNameError', 'First name is required.');
      valid = false;
    }
    if (!lastName.value.trim()) {
      setError('lastName', 'lastNameError', 'Last name is required.');
      valid = false;
    }
    if (!email.value.trim()) {
      setError('email', 'emailError', 'Email is required.');
      valid = false;
    } else if (!isValidEmail(email.value.trim())) {
      setError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    }
    if (!message.value.trim()) {
      setError('message', 'messageError', 'Please enter your message.');
      valid = false;
    } else if (message.value.trim().length < 20) {
      setError('message', 'messageError', 'Message must be at least 20 characters.');
      valid = false;
    }

    return valid;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Simulate async form submission
    const btnText   = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    // Simulate network request (replace with actual fetch in production)
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Show success message
    submitBtn.style.display = 'none';
    if (formSuccess) {
      formSuccess.style.display = 'flex';
    }

    // Reset form fields
    form.reset();
  });
}

/* ── PRIVACY PAGE: TOC ACTIVE LINK ── */

function initPrivacyTOC() {
  const tocLinks = $$('.toc-card a');
  if (!tocLinks.length) return;

  const sections = tocLinks.map(link => {
    const id = link.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--color-accent)'
              : '';
          });
        }
      });
    },
    {
      threshold: 0.4,
      rootMargin: `-${72}px 0px -50% 0px`
    }
  );

  sections.forEach(section => observer.observe(section));
}

/* ── HERO PARALLAX (subtle) ── */

function initHeroParallax() {
  const heroGlows = $$('.hero-glow');
  if (!heroGlows.length) return;

  let ticking = false;

  window.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const xFactor = (e.clientX / window.innerWidth - 0.5) * 20;
      const yFactor = (e.clientY / window.innerHeight - 0.5) * 20;

      heroGlows.forEach((glow, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        glow.style.transform = `translate(${xFactor * dir}px, ${yFactor * dir}px)`;
      });
      ticking = false;
    });
  });
}

/* ── ACTIVE NAV LINK ON SCROLL (single-page) ── */

function initActiveNavOnScroll() {
  // Only relevant if sections with IDs exist on page
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const onScroll = debounce(() => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('#') && href.includes(current)) {
        link.classList.add('active');
      }
    });
  }, 50);

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── CODE CARD TYPING ANIMATION ── */

function initCodeTyping() {
  // Already handled via CSS cursor blink
  // This is a placeholder for future typing animations
}

/* ── TECH TAGS STAGGER (About page) ── */

function initTechTagStagger() {
  const techGrid = $('.tech-grid');
  if (!techGrid) return;

  const tags = $$('.tech-tag', techGrid);
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        tags.forEach((tag, i) => {
          setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
          }, i * 40);
        });
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  // Set initial state
  tags.forEach(tag => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(12px)';
    tag.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  });

  observer.observe(techGrid);
}

/* ── SERVICE CARD HOVER GLOW ── */

function initCardGlowTracking() {
  const cards = $$('.service-card, .svc-card, .team-card, .mv-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── NAVBAR HIGHLIGHT FOR CURRENT PAGE ── */

function initCurrentPageNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = $$('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── FOOTER: CURRENT YEAR ── */

function initCurrentYear() {
  const yearEls = $$('.footer-year');
  yearEls.forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ── INITIALIZE ALL ── */

document.addEventListener('DOMContentLoaded', () => {
  // Core UI
  initLoader();
  initNavbar();
  initMobileMenu();
  initCurrentPageNav();

  // Animations & interactions
  initScrollAnimations();
  initCounters();
  initRippleEffects();
  initHeroParallax();
  initCardGlowTracking();
  initTechTagStagger();

  // Navigation
  initSmoothScroll();
  initActiveNavOnScroll();

  // Page-specific
  initContactForm();
  initPrivacyTOC();
  initCurrentYear();
  initCodeTyping();

  // Accessibility: focus ring management
  document.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.remove('using-mouse');
  });
});

/* ── PERFORMANCE: Preload next pages on hover ── */

function initPrefetch() {
  const navLinks = $$('.nav-link, .btn');
  const prefetched = new Set();

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return;
      if (prefetched.has(href)) return;
      prefetched.add(href);

      const prefetchLink = document.createElement('link');
      prefetchLink.rel  = 'prefetch';
      prefetchLink.href = href;
      document.head.appendChild(prefetchLink);
    });
  });
}

// Run prefetch after initial load
window.addEventListener('load', initPrefetch);