import { showToast } from './toast.js';

const STORAGE_KEY = 'neuneon_cart';

let cart = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function getCart() { return [...cart]; }

export function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function addToCart(item) {
  const existing = cart.find(i =>
    i.text === item.text &&
    i.color === item.color &&
    i.font === item.font &&
    i.size === item.size
  );

  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      ...item,
      quantity: item.quantity || 1,
    });
  }

  saveCart();
  updateCartUI();
  showToast('success', 'Added to cart!', `${item.text || 'Custom sign'} — ${item.size}`);
}

export function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

export function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

export function updateQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart();
  updateCartUI();
}

export function updateCartUI() {
  const count = getCartCount();
  const total = getCartTotal();

  // Badge
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? 'flex' : 'none';
  }

  // Subtotal
  const subtotalEl = document.getElementById('cartSubtotal');
  if (subtotalEl) subtotalEl.textContent = `£${total.toFixed(2)}`;

  // Empty state / items
  const cartEmpty = document.getElementById('cartEmpty');
  const cartItemsEl = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');

  if (!cartItemsEl) return;

  if (count === 0) {
    cartEmpty && (cartEmpty.style.display = 'flex');
    cartItemsEl.style.display = 'none';
    cartFooter && (cartFooter.style.display = 'none');
  } else {
    cartEmpty && (cartEmpty.style.display = 'none');
    cartItemsEl.style.display = 'flex';
    cartFooter && (cartFooter.style.display = 'block');

    cartItemsEl.innerHTML = cart.map(item => `
      <li class="cart-item" data-id="${item.id}">
        <div class="cart-item-thumb">
          <canvas class="cart-thumb-canvas" data-text="${escapeAttr(item.text || '')}" data-color="${escapeAttr(item.color)}" data-font="${escapeAttr(item.font)}" width="72" height="72"></canvas>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.text || 'Custom Sign')}</div>
          <div class="cart-item-details">${item.size} · ${item.font} · <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${escapeAttr(item.color)};vertical-align:middle;margin-right:3px;"></span></div>
          <div class="cart-item-controls">
            <div class="cart-item-qty">
              <button class="cart-qty-btn" data-id="${item.id}" data-action="dec" aria-label="Decrease">−</button>
              <span class="cart-qty-num">${item.quantity}</span>
              <button class="cart-qty-btn" data-id="${item.id}" data-action="inc" aria-label="Increase">+</button>
            </div>
            <span class="cart-item-price">£${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">Remove</button>
        </div>
      </li>
    `).join('');

    // Render thumbnails
    cartItemsEl.querySelectorAll('.cart-thumb-canvas').forEach(canvas => {
      renderThumbnail(canvas, canvas.dataset.text, canvas.dataset.color, canvas.dataset.font);
    });

    // Event delegation on items
    cartItemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        updateQuantity(btn.dataset.id, delta);
      });
    });

    cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
  }
}

function renderThumbnail(canvas, text, color, fontFamily) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  if (!text) return;

  const fontSize = Math.min(w / (text.length * 0.6 + 0.5), h * 0.5);
  ctx.font = `bold ${fontSize}px "${fontFamily || 'Dancing Script'}", cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = color || '#FF006B';
  ctx.shadowBlur = 15;
  ctx.fillStyle = color || '#FF006B';
  ctx.fillText(text, w / 2, h / 2);

  ctx.shadowBlur = 6;
  ctx.fillStyle = '#fff';
  ctx.fillText(text, w / 2, h / 2);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

export function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

export function initCart() {
  updateCartUI();

  document.getElementById('cartToggle')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  document.getElementById('continueShoppingBtn')?.addEventListener('click', closeCart);

  document.getElementById('cartEmptyDesignBtn')?.addEventListener('click', closeCart);

  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (getCartCount() === 0) return;
    closeCart();
    document.dispatchEvent(new CustomEvent('neuneon:checkout'));
  });
}
