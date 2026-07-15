import { addToCart } from './cart.js';
import { showToast } from './toast.js';

// Default Stripe Payment Link — replace with per-product links later
const STRIPE_LINK = 'https://buy.stripe.com/test_3cI28qbCXerz9Gn1Kw8bS00';

const PEXELS_NEON = [
  { id: 1, name: 'Open Sign', category: 'business', color: '#FF006B', colors: ['#FF006B', '#FFFFFF'], price: 26, img: '/images/a.jpeg', badge: 'Best Seller', stripeLink: 'https://buy.stripe.com/14A00lc4z8gbezO7D69Ve03' },
  { id: 2, name: 'Good Vibes', category: 'home', color: '#00EEFF', colors: ['#00EEFF', '#FF006B'], price: 26, img: '/images/b.jpeg', badge: 'Popular', stripeLink: 'https://buy.stripe.com/fZu3cxfgL2VRdvK3mQ9Ve02' },
  { id: 3, name: 'Love Sign', category: 'wedding', color: '#FF006B', colors: ['#FF006B', '#FFFFFF', '#FF6600'], price: 26, img: '/images/c.jpeg', badge: '', stripeLink: 'https://buy.stripe.com/28EbJ39Wrbsn9fu0aE9Ve01' },
  { id: 4, name: 'Mr & Mrs', category: 'wedding', color: '#FFFFFF', colors: ['#FFFFFF', '#FF006B'], price: 26, img: '/images/f.jpeg', badge: 'Wedding', stripeLink: 'https://buy.stripe.com/8x23cxgkPdAv4Ze4qU9Ve00' },
  // { id: 5, name: 'Bar Open', category: 'bar', color: '#FFE600', colors: ['#FFE600', '#FF6600'], price: 159, img: '/images/e.jpeg', badge: '', stripeLink: STRIPE_LINK },
  // { id: 6, name: 'Cocktails', category: 'bar', color: '#00FF88', colors: ['#00FF88', '#00EEFF'], price: 189, img: '/images/f.jpeg', badge: '', stripeLink: STRIPE_LINK },
  // { id: 7, name: 'Dream Big', category: 'home', color: '#BF5FFF', colors: ['#BF5FFF', '#FF006B'], price: 139, img: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 8, name: 'Coffee Sign', category: 'business', color: '#FF6600', colors: ['#FF6600', '#FFFFFF'], price: 159, img: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: 'New', stripeLink: STRIPE_LINK },
  // { id: 9, name: 'Game Zone', category: 'home', color: '#00EEFF', colors: ['#00EEFF', '#00FF88'], price: 159, img: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 10, name: 'Just Married', category: 'wedding', color: '#FFFFFF', colors: ['#FFFFFF', '#FFE600'], price: 199, img: 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: 'Wedding', stripeLink: STRIPE_LINK },
  // { id: 11, name: 'No Bad Days', category: 'quotes', color: '#FF006B', colors: ['#FF006B'], price: 139, img: 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 12, name: 'Hustle Hard', category: 'quotes', color: '#FFE600', colors: ['#FFE600', '#FF6600'], price: 139, img: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 13, name: 'Custom Logo', category: 'business', color: '#00EEFF', colors: ['#00EEFF', '#FFFFFF', '#FF006B'], price: 199, img: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: 'Custom', stripeLink: STRIPE_LINK },
  // { id: 14, name: 'Party Time', category: 'home', color: '#FF006B', colors: ['#FF006B', '#FFE600', '#00EEFF'], price: 139, img: 'https://images.pexels.com/photos/2072181/pexels-photo-2072181.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 15, name: 'Stay Positive', category: 'quotes', color: '#00FF88', colors: ['#00FF88', '#00EEFF'], price: 139, img: 'https://images.pexels.com/photos/3408743/pexels-photo-3408743.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 16, name: 'Eat Sleep Rave', category: 'bar', color: '#BF5FFF', colors: ['#BF5FFF', '#00EEFF'], price: 189, img: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 17, name: 'Be Happy', category: 'home', color: '#FFE600', colors: ['#FFE600'], price: 109, img: 'https://images.pexels.com/photos/3972783/pexels-photo-3972783.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 18, name: 'Sport Bar', category: 'bar', color: '#FF3333', colors: ['#FF3333', '#FFFFFF'], price: 159, img: 'https://images.pexels.com/photos/3059748/pexels-photo-3059748.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 19, name: 'Happy Place', category: 'home', color: '#FF006B', colors: ['#FF006B', '#FFFFFF'], price: 139, img: 'https://images.pexels.com/photos/3618545/pexels-photo-3618545.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 20, name: 'Victory', category: 'sports', color: '#FFE600', colors: ['#FFE600', '#FF3333'], price: 159, img: 'https://images.pexels.com/photos/3621090/pexels-photo-3621090.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 21, name: 'Make Waves', category: 'quotes', color: '#00EEFF', colors: ['#00EEFF'], price: 139, img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 22, name: 'Pizza Sign', category: 'business', color: '#FF6600', colors: ['#FF6600', '#FFE600'], price: 199, img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: 'Custom', stripeLink: STRIPE_LINK },
  // { id: 23, name: 'Cheers!', category: 'bar', color: '#FFE600', colors: ['#FFE600', '#FF006B'], price: 139, img: 'https://images.pexels.com/photos/1618221/pexels-photo-1618221.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: '', stripeLink: STRIPE_LINK },
  // { id: 24, name: 'Boss Babe', category: 'quotes', color: '#FF006B', colors: ['#FF006B', '#BF5FFF'], price: 139, img: 'https://images.pexels.com/photos/3768005/pexels-photo-3768005.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', badge: 'New', stripeLink: STRIPE_LINK },
];

let wishlist = new Set(JSON.parse(localStorage.getItem('neuneon_wishlist') || '[]'));
let currentFilter = 'all';
let browseOffset = 0;
const PAGE_SIZE = 12;

function saveWishlist() {
  localStorage.setItem('neuneon_wishlist', JSON.stringify([...wishlist]));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const el = document.getElementById('wishlistCount');
  if (!el) return;
  el.textContent = wishlist.size;
  el.style.display = wishlist.size > 0 ? 'flex' : 'none';
}

export function initGalleryPreview() {
  const grid = document.getElementById('galleryPreviewGrid');
  if (!grid) return;

  const previewItems = PEXELS_NEON.slice(0, 8);
  renderGalleryItems(grid, previewItems);
  updateWishlistBadge();

  // Filter buttons
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      currentFilter = filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
      const filtered = filter === 'all' ? PEXELS_NEON.slice(0, 8) : PEXELS_NEON.filter(p => p.category === filter).slice(0, 8);
      grid.innerHTML = '';
      renderGalleryItems(grid, filtered);
    });
  });
}

export function initBrowseGrid() {
  const grid = document.getElementById('browseGrid');
  if (!grid) return;

  browseOffset = 0;
  renderProductCards(grid, getFiltered(), 0, PAGE_SIZE);
  browseOffset = PAGE_SIZE;

  updateBrowseCount();
  updateWishlistBadge();

  document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    const items = getFiltered();
    if (browseOffset >= items.length) {
      showToast('info', 'All caught up!', 'No more designs to show.');
      return;
    }
    renderProductCards(grid, items, browseOffset, PAGE_SIZE, true);
    browseOffset += PAGE_SIZE;
    if (browseOffset >= items.length) {
      document.getElementById('loadMoreBtn').textContent = 'No more designs';
      document.getElementById('loadMoreBtn').disabled = true;
    }
    updateBrowseCount();
  });

  // Sort
  document.getElementById('sortSelect')?.addEventListener('change', e => {
    grid.innerHTML = '';
    browseOffset = 0;
    renderProductCards(grid, getSorted(getFiltered(), e.target.value), 0, PAGE_SIZE);
    browseOffset = PAGE_SIZE;
    updateBrowseCount();
  });
}

function getFiltered() {
  return PEXELS_NEON.filter(() => true);
}

function getSorted(items, sort) {
  const arr = [...items];
  switch (sort) {
    case 'price-asc': return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
    case 'newest': return arr.reverse();
    default: return arr;
  }
}

function updateBrowseCount() {
  const el = document.getElementById('browseCount');
  if (el) el.textContent = `Showing ${Math.min(browseOffset, PEXELS_NEON.length)} of ${PEXELS_NEON.length} designs`;
}

function renderGalleryItems(grid, items) {
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.innerHTML = `
      <img src="${item.img}" alt="${escapeHtml(item.name)} neon sign" loading="lazy" />
      <div class="gallery-item-overlay">
        <div class="gallery-item-name">${escapeHtml(item.name)}</div>
        <div class="gallery-item-price">from £${item.price}</div>
        <div class="gallery-item-actions">
          <button class="gallery-item-btn" data-id="${item.id}">Add to Cart</button>
        </div>
      </div>
    `;
    el.querySelector('.gallery-item-btn').addEventListener('click', e => {
      e.stopPropagation();
      addToCart({ text: item.name, color: item.color, font: 'Dancing Script', backing: 'clear', size: 'Medium (~50cm)', price: item.price, quantity: 1 });
    });
    grid.appendChild(el);
  });
}

function renderProductCards(grid, items, offset, limit, append = false) {
  if (!append) grid.innerHTML = '';
  const slice = items.slice(offset, offset + limit);

  slice.forEach(item => {
    const inWishlist = wishlist.has(item.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-card-img">
        <img src="${item.img}" alt="${escapeHtml(item.name)} neon sign" loading="lazy" />
        ${item.badge ? `<span class="product-badge">${escapeHtml(item.badge)}</span>` : ''}
        <button class="product-wishlist-btn ${inWishlist ? 'active' : ''}" data-id="${item.id}" aria-label="Add to wishlist" aria-pressed="${inWishlist}">
          <svg width="16" height="16" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>
      <div class="product-card-body">
        <div class="product-card-name">${escapeHtml(item.name)}</div>
        <div class="product-card-colors">
          ${item.colors.map(c => `<span class="product-color-dot" style="background:${c}" title="${c}"></span>`).join('')}
        </div>
        <div class="product-card-footer">
          <span class="product-card-price">£${item.price}</span>
          <div class="product-card-btns">
            <button class="product-card-add" data-id="${item.id}">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          </div>
        </div>
      </div>
    `;

    card.querySelector('.product-card-add').addEventListener('click', () => {
      addToCart({ text: item.name, color: item.color, font: 'Dancing Script', backing: 'clear', size: 'Medium (~50cm)', price: item.price, quantity: 1 });
    });

    card.querySelector('.product-wishlist-btn').addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.currentTarget;
      const id = parseInt(btn.dataset.id);
      if (wishlist.has(id)) {
        wishlist.delete(id);
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        btn.querySelector('svg').setAttribute('fill', 'none');
        showToast('info', 'Removed from wishlist', item.name);
      } else {
        wishlist.add(id);
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        showToast('success', 'Added to wishlist!', item.name);
      }
      saveWishlist();
    });

    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export { updateWishlistBadge };
