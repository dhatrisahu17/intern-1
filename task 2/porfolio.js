/**
 * portfolio.js — Shared interaction layer
 * ─────────────────────────────────────────
 * 1. Theme Toggle (dark / light)
 * 2. Mobile Navigation
 * 3. Header scroll-state class
 * 4. Scroll-reveal animations (IntersectionObserver)
 * 5. Contact form accessible validation
 *
 * Accessibility notes inline below.
 */

'use strict';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. THEME TOGGLE
   Persists to localStorage; respects prefers-color-scheme
   as the initial fallback.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initTheme() {
  const STORAGE_KEY = 'ar-theme';
  const html        = document.documentElement;
  const btn         = document.getElementById('theme-toggle');

  /** Determine starting theme */
  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (btn) {
      const isDark = theme === 'dark';
      // ACCESSIBILITY: Update aria-label to describe the *action*, not the state.
      // "Switch to light mode" when currently dark; user knows current state.
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  // Apply immediately (before paint) to prevent flash
  applyTheme(getPreferred());

  // Toggle on click
  if (btn) {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Sync when OS preference changes (e.g. auto dark mode at sunset)
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      // Only follow OS if user hasn't set an explicit preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. MOBILE NAVIGATION
   Handles: toggle open/close, Escape key, outside-click,
   and focus management.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initNav() {
  const toggle  = document.querySelector('.nav-toggle');
  const navWrap = document.getElementById('primary-nav');
  if (!toggle || !navWrap) return;

  const navList = navWrap.querySelector('.primary-nav');

  function openNav() {
    navList.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close site navigation');
    toggle.textContent = '✕ Close';
    // Move focus to first link
    const first = navList.querySelector('a');
    if (first) first.focus();
  }

  function closeNav() {
    navList.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open site navigation');
    toggle.textContent = '☰ Menu';
  }

  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.contains('is-open');
    isOpen ? closeNav() : openNav();
  });

  // Escape closes the nav and returns focus to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('is-open')) {
      closeNav();
      toggle.focus();
    }
  });

  // Click outside closes
  document.addEventListener('click', (e) => {
    if (
      navList.classList.contains('is-open') &&
      !navWrap.contains(e.target) &&
      e.target !== toggle
    ) {
      closeNav();
    }
  });
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. HEADER SCROLL STATE
   Adds .scrolled class for enhanced shadow when user scrolls
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const io = new IntersectionObserver(
    ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
    { threshold: 0 }
  );

  // Watch a sentinel pixel at top of page
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
  sentinel.setAttribute('aria-hidden', 'true');
  document.body.prepend(sentinel);
  io.observe(sentinel);
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. SCROLL-REVEAL ANIMATIONS
   Uses IntersectionObserver — no scroll event listeners.
   Respects prefers-reduced-motion (CSS handles the disable).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initReveal() {
  // Don't animate if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealEls = document.querySelectorAll(
    '.section-header, .project-card, .skill-card, .timeline-item, ' +
    '.education-item, .social-link-item, .contact-form, .contact-info, .cta-box'
  );

  if (!revealEls.length) return;

  // Add reveal class
  revealEls.forEach((el) => el.classList.add('reveal'));

  // Also add stagger to grids
  document.querySelectorAll('.skills-grid, .projects-grid').forEach((grid) => {
    grid.classList.add('reveal-stagger');
    // Remove individual reveals from children since stagger handles them
    grid.querySelectorAll('.reveal').forEach((child) => child.classList.remove('reveal'));
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target); // Only animate once
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => io.observe(el));
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   5. CONTACT FORM — ACCESSIBLE VALIDATION
   ─────────────────────────────────────────────────────────
   ACCESSIBILITY PRINCIPLES:
   - On submit: validate all fields; if errors, announce count via live region,
     move focus to first invalid field.
   - Per field: set aria-invalid="true" + aria-describedby pointing to error msg.
   - On correction: clear aria-invalid, remove error message.
   - Success: show success message in aria-live region, reset form.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initForm() {
  const form       = document.getElementById('contact-form');
  const successEl  = document.getElementById('form-success');
  const submitBtn  = document.getElementById('submit-btn');
  if (!form) return;

  /** Mark a field as invalid with an error message */
  function setError(input, message) {
    const errorId = input.id + '-error';
    input.setAttribute('aria-invalid', 'true');

    // Extend aria-describedby to include error
    const existing = input.getAttribute('aria-describedby') || '';
    if (!existing.includes(errorId)) {
      input.setAttribute('aria-describedby', (existing + ' ' + errorId).trim());
    }

    // Create or update error element
    let errorEl = document.getElementById(errorId);
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.id   = errorId;
      errorEl.className = 'form-error';
      errorEl.setAttribute('role', 'alert');
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = '⚠ ' + message;
  }

  /** Clear error state from a field */
  function clearError(input) {
    const errorId  = input.id + '-error';
    const errorEl  = document.getElementById(errorId);
    input.removeAttribute('aria-invalid');

    // Remove error id from aria-describedby
    const desc = (input.getAttribute('aria-describedby') || '')
      .split(' ')
      .filter((id) => id !== errorId)
      .join(' ');
    if (desc) input.setAttribute('aria-describedby', desc);
    else input.removeAttribute('aria-describedby');

    if (errorEl) errorEl.remove();
  }

  /** Validate a single field — returns true if valid */
  function validateField(input) {
    clearError(input);
    const val = input.value.trim();

    if (input.required && !val) {
      setError(input, 'This field is required.');
      return false;
    }

    if (input.type === 'email' && val) {
      // Simple email pattern
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) {
        setError(input, 'Please enter a valid email address, e.g. jane@example.com');
        return false;
      }
    }

    if (input.id === 'message' && val && val.length < 20) {
      setError(input, 'Please write at least 20 characters so I can help you better.');
      return false;
    }

    return true;
  }

  // Live validation on blur (after first touch)
  form.querySelectorAll('input, textarea, select').forEach((field) => {
    let touched = false;
    field.addEventListener('blur', () => {
      touched = true;
      if (field.required || field.id === 'message') validateField(field);
    });
    field.addEventListener('input', () => {
      if (touched) validateField(field);
    });
  });

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields   = [...form.querySelectorAll('input[required], textarea[required], select[required]')];
    const invalid  = fields.filter((f) => !validateField(f));

    if (invalid.length) {
      // ACCESSIBILITY: Announce error count via role="alert" so AT reads it.
      const summary = document.createElement('p');
      summary.setAttribute('role', 'alert');
      summary.className = 'form-error';
      summary.textContent = `Please fix ${invalid.length} error${invalid.length > 1 ? 's' : ''} before submitting.`;
      // Insert before form
      const existing = form.previousElementSibling?.querySelector('.form-error[role="alert"]');
      if (existing) existing.remove();
      form.insertAdjacentElement('beforebegin', summary);

      // Move focus to first invalid field
      invalid[0].focus();
      return;
    }

    // Simulate async submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      form.style.display = 'none';

      if (successEl) {
        successEl.style.display = 'block';
        // ACCESSIBILITY: Move focus to success message so AT reads it
        successEl.setAttribute('tabindex', '-1');
        successEl.focus();
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }, 1200);
  });
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   6. PROJECT FILTER (projects.html only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initFilter() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const cards       = document.querySelectorAll('.project-card');
  const statusEl    = document.getElementById('filter-status');
  const noResultsEl = document.getElementById('no-results');
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');

      let count = 0;
      cards.forEach((card) => {
        const tags = card.dataset.tags || '';
        const show = filter === 'all' || tags.split(' ').includes(filter);
        card.hidden = !show;
        if (show) count++;
      });

      if (statusEl) statusEl.textContent = `Showing ${count} project${count !== 1 ? 's' : ''}`;
      if (noResultsEl) noResultsEl.hidden = count > 0;
    });
  });
})();