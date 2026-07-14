import './style.css';

import { initRouter, initNavbar } from './js/router.js';
import { initCart } from './js/cart.js';
import { initAuth } from './js/auth.js';
import { initCustomizer, initHeroNeonCanvas } from './js/customizer.js';
import { initGalleryPreview, initBrowseGrid } from './js/gallery.js';
import { initParticles } from './js/particles.js';
import { showToast } from './js/toast.js';
import { initCheckout, openCheckout } from './js/checkout.js';

function initApp() {
  initRouter();
  initNavbar();
  initCart();
  initAuth();
  initCheckout();
  initGalleryPreview();
  initBrowseGrid();
  initParticles();
  initHeroNeonCanvas();
  initCustomizer();
  initSearch();
  initFAQ();
  initNewsletter();
  initScrollAnimations();

  // Wire cart checkout button to open checkout modal
  document.addEventListener('neuneon:checkout', openCheckout);
}

// Search
function initSearch() {
  const toggle = document.getElementById('searchToggle');
  const bar = document.getElementById('searchBar');
  const close = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const suggestions = document.getElementById('searchSuggestions');

  const SUGGESTIONS = ['Open sign', 'Love sign', 'Good Vibes', 'Bar open', 'Cocktails', 'Mr & Mrs', 'Dream Big', 'Custom logo', 'Coffee sign', 'Game Zone', 'Just Married', 'No Bad Days'];

  toggle?.addEventListener('click', () => {
    const isOpen = bar?.classList.toggle('active');
    if (isOpen) input?.focus();
    else { if (suggestions) suggestions.innerHTML = ''; }
  });

  close?.addEventListener('click', () => {
    bar?.classList.remove('active');
    if (suggestions) suggestions.innerHTML = '';
  });

  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q || !suggestions) return;
    const matches = SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 5);
    suggestions.innerHTML = matches.map(s =>
      `<button class="search-suggestion-item" style="display:block;width:100%;text-align:left;padding:8px 16px;color:var(--text-secondary);background:none;border:none;cursor:pointer;font-size:0.9rem;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='rgba(255,0,107,0.08)'" onmouseout="this.style.background='none'">${s}</button>`
    ).join('');
    suggestions.querySelectorAll('.search-suggestion-item').forEach(btn => {
      btn.addEventListener('click', () => {
        bar?.classList.remove('active');
        suggestions.innerHTML = '';
        showToast('info', 'Search', `Showing results for "${btn.textContent}"`);
      });
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      bar?.classList.remove('active');
      if (suggestions) suggestions.innerHTML = '';
    }
  });
}

// FAQ accordion
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Close all others
      document.querySelectorAll('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const a = b.nextElementSibling;
        if (a) a.classList.remove('open');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer?.classList.add('open');
      }
    });
  });
}

// Newsletter forms
function initNewsletter() {
  const handler = e => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    if (!emailInput?.value?.trim()) return;
    showToast('success', 'Subscribed!',);
    e.target.reset();
  };

  document.getElementById('newsletterForm')?.addEventListener('submit', handler);
  document.getElementById('footerNewsletterForm')?.addEventListener('submit', handler);
}

// Intersection Observer for fade-in animations
function initScrollAnimations() {
  const els = document.querySelectorAll('.feature-card, .step, .testimonial-card, .faq-item, .gallery-item, .product-card');

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.style.opacity = '1');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
