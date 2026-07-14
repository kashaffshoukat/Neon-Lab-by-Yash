const routes = ['home', 'customize', 'browse', 'about'];
let currentRoute = 'home';
const listeners = [];

export function onRouteChange(fn) {
  listeners.push(fn);
}

export function navigate(route, opts = {}) {
  if (!routes.includes(route)) route = 'home';

  currentRoute = route;

  // Show/hide pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.dataset.page === route);
  });

  // Update nav link active state
  document.querySelectorAll('[data-route]').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route && el.classList.contains('nav-link'));
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (opts.tab) {
    // Trigger tab in customizer
    const tabBtn = document.querySelector(`[data-customizer-tab="${opts.tab}"]`);
    tabBtn?.click();
  }

  if (opts.category) {
    // Set browse category
    setTimeout(() => {
      const catFilter = document.querySelector(`[data-category="${opts.category}"]`);
      catFilter?.click();
    }, 100);
  }

  listeners.forEach(fn => fn(route, opts));
}

export function getCurrentRoute() { return currentRoute; }

export function initRouter() {
  // Handle hash on load
  const hash = location.hash.replace('#', '') || 'home';
  navigate(hash);

  // Hash change
  window.addEventListener('hashchange', () => {
    const route = location.hash.replace('#', '') || 'home';
    navigate(route);
  });

  // Data-route clicks
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-route]');
    if (!el) return;

    const route = el.dataset.route;
    if (!route) return;

    e.preventDefault();
    history.pushState(null, '', `#${route}`);
    navigate(route, { tab: el.dataset.tab, category: el.dataset.category });

    // Close mobile nav if open
    closeMobileNav();
  });

  // Data-scroll clicks (smooth scroll to section)
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-scroll]');
    if (!el) return;
    e.preventDefault();
    const target = document.getElementById(el.dataset.scroll);
    if (target) {
      navigate('home');
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  });
}

function closeMobileNav() {
  document.getElementById('navLinks')?.classList.remove('mobile-open');
  document.getElementById('menuToggle')?.classList.remove('active');
  document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'false');
  document.getElementById('mobileNav')?.classList.remove('open');
}

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');

  // Sticky scroll effect
  const handleScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Mobile menu
  let mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  mobileNav.id = 'mobileNav';
  mobileNav.innerHTML = `
    <nav class="mobile-nav-links">
      <a href="#home" class="mobile-nav-link" data-route="home">Home</a>
      <a href="#customize" class="mobile-nav-link" data-route="customize">Design Your Own</a>
      <a href="#customize" class="mobile-nav-link" data-route="customize" data-tab="upload">Upload Design</a>
      <a href="#browse" class="mobile-nav-link" data-route="browse">Browse Signs</a>
      <a href="#about" class="mobile-nav-link" data-route="about">About</a>
      <a href="#faq" class="mobile-nav-link" data-scroll="faq">FAQ</a>
      <a href="#reviews" class="mobile-nav-link" data-scroll="reviews">Reviews</a>
    </nav>
  `;
  document.body.appendChild(mobileNav);

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}
