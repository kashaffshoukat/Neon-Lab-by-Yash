import { getCart, getCartTotal, clearCart } from './cart.js';
import { showToast } from './toast.js';
import { fetchOrder } from './supabase.js';

// Formspree endpoint — owner receives order notification email
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnnvkqra';
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_3cI28qbCXerz9Gn1Kw8bS00';
const OWNER_EMAIL = 'Sabashoukat2149@gmail.com';
const WHATSAPP_NUMBER = '923087441026';

let checkoutState = {
  step: 1,
  contact: { firstName: '', lastName: '', email: '', phone: '', notes: '' },
  address: { line1: '', line2: '', city: '', postcode: '', country: 'GB' },
  loading: false,
};

// ── Open / Close ───────────────────────────────────────────────
export function openCheckout() {
  checkoutState.step = 1;
  checkoutState.loading = false;
  renderCheckoutModal();
  document.getElementById('checkoutModal')?.classList.add('open');
  document.getElementById('checkoutOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeCheckout() {
  document.getElementById('checkoutModal')?.classList.remove('open');
  document.getElementById('checkoutOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Render ─────────────────────────────────────────────────────
function renderCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="co-header">
      <div class="co-logo">neu<span class="logo-n">N</span>eon</div>
      <div class="co-steps">
        <div class="co-step ${checkoutState.step >= 1 ? 'active' : ''} ${checkoutState.step > 1 ? 'done' : ''}">
          <span class="co-step-num">1</span><span class="co-step-label">Contact</span>
        </div>
        <div class="co-step-line"></div>
        <div class="co-step ${checkoutState.step >= 2 ? 'active' : ''} ${checkoutState.step > 2 ? 'done' : ''}">
          <span class="co-step-num">2</span><span class="co-step-label">Delivery</span>
        </div>
        <div class="co-step-line"></div>
        <div class="co-step ${checkoutState.step >= 3 ? 'active' : ''}">
          <span class="co-step-num">3</span><span class="co-step-label">Payment</span>
        </div>
      </div>
      <button class="co-close" id="coClose" aria-label="Close checkout">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="co-body">
      <div class="co-main">
        ${checkoutState.step === 1 ? renderContactStep() : ''}
        ${checkoutState.step === 2 ? renderAddressStep() : ''}
        ${checkoutState.step === 3 ? renderPaymentStep() : ''}
      </div>
      <aside class="co-sidebar">
        ${renderOrderSummary()}
      </aside>
    </div>
  `;

  document.getElementById('coClose')?.addEventListener('click', closeCheckout);
  bindStepHandlers();
}

function renderContactStep() {
  const c = checkoutState.contact;
  return `
    <div class="co-form-section">
      <h2 class="co-form-title">Contact Information</h2>
      <p class="co-form-hint">We'll send your order confirmation and design proof to this address.</p>
      <form class="co-form" id="contactForm" novalidate>
        <div class="co-row">
          <div class="co-field">
            <label for="co-firstName">First Name <span class="required">*</span></label>
            <input type="text" id="co-firstName" name="firstName" value="${escHtml(c.firstName)}" placeholder="Jane" required autocomplete="given-name" />
          </div>
          <div class="co-field">
            <label for="co-lastName">Last Name <span class="required">*</span></label>
            <input type="text" id="co-lastName" name="lastName" value="${escHtml(c.lastName)}" placeholder="Smith" required autocomplete="family-name" />
          </div>
        </div>
        <div class="co-field">
          <label for="co-email">Email Address <span class="required">*</span></label>
          <input type="email" id="co-email" name="email" value="${escHtml(c.email)}" placeholder="jane@example.com" required autocomplete="email" />
        </div>
        <div class="co-field">
          <label for="co-phone">Phone Number <span class="optional">(optional)</span></label>
          <input type="tel" id="co-phone" name="phone" value="${escHtml(c.phone)}" placeholder="+44 7700 900123" autocomplete="tel" />
        </div>
        <div class="co-field">
          <label for="co-notes">Design Notes <span class="optional">(optional)</span></label>
          <textarea id="co-notes" name="notes" rows="3" placeholder="Any special instructions for our design team...">${escHtml(c.notes)}</textarea>
        </div>
        <div class="co-error" id="contactError" style="display:none"></div>
        <div class="co-actions">
          <button type="submit" class="btn btn-primary btn-full btn-lg">
            Continue to Delivery
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderAddressStep() {
  const a = checkoutState.address;
  const countries = [
    ['GB', 'United Kingdom'], ['US', 'United States'], ['CA', 'Canada'],
    ['AU', 'Australia'], ['IE', 'Ireland'], ['FR', 'France'],
    ['DE', 'Germany'], ['NL', 'Netherlands'], ['BE', 'Belgium'],
    ['ES', 'Spain'], ['IT', 'Italy'], ['PT', 'Portugal'],
  ];

  return `
    <div class="co-form-section">
      <button class="co-back" id="coBack" type="button">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>
      <h2 class="co-form-title">Delivery Address</h2>
      <form class="co-form" id="addressForm" novalidate>
        <div class="co-field">
          <label for="co-line1">Address Line 1 <span class="required">*</span></label>
          <input type="text" id="co-line1" name="line1" value="${escHtml(a.line1)}" placeholder="123 High Street" required autocomplete="address-line1" />
        </div>
        <div class="co-field">
          <label for="co-line2">Address Line 2 <span class="optional">(optional)</span></label>
          <input type="text" id="co-line2" name="line2" value="${escHtml(a.line2)}" placeholder="Flat 4, Building Name" autocomplete="address-line2" />
        </div>
        <div class="co-row">
          <div class="co-field">
            <label for="co-city">City <span class="required">*</span></label>
            <input type="text" id="co-city" name="city" value="${escHtml(a.city)}" placeholder="London" required autocomplete="address-level2" />
          </div>
          <div class="co-field">
            <label for="co-postcode">Postcode <span class="required">*</span></label>
            <input type="text" id="co-postcode" name="postcode" value="${escHtml(a.postcode)}" placeholder="SW1A 1AA" required autocomplete="postal-code" />
          </div>
        </div>
        <div class="co-field">
          <label for="co-country">Country <span class="required">*</span></label>
          <select id="co-country" name="country" required autocomplete="country">
            ${countries.map(([code, name]) => `<option value="${code}" ${a.country === code ? 'selected' : ''}>${name}</option>`).join('')}
          </select>
        </div>
        <div class="co-error" id="addressError" style="display:none"></div>
        <div class="co-actions">
          <button type="submit" class="btn btn-primary btn-full btn-lg">
            Review &amp; Pay
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderPaymentStep() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 99 ? 0 : 9.99;
  const total = subtotal + shipping;
  const c = checkoutState.contact;
  const a = checkoutState.address;

  return `
    <div class="co-form-section">
      <button class="co-back" id="coBack" type="button">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>
      <h2 class="co-form-title">Review &amp; Place Order</h2>

      <div class="co-review-block">
        <div class="co-review-header">
          <span>Contact</span>
          <button class="co-review-edit" data-step="1">Edit</button>
        </div>
        <p>${escHtml(c.firstName)} ${escHtml(c.lastName)}</p>
        <p>${escHtml(c.email)}${c.phone ? ` · ${escHtml(c.phone)}` : ''}</p>
      </div>

      <div class="co-review-block">
        <div class="co-review-header">
          <span>Delivery Address</span>
          <button class="co-review-edit" data-step="2">Edit</button>
        </div>
        <p>${escHtml(a.line1)}${a.line2 ? `, ${escHtml(a.line2)}` : ''}</p>
        <p>${escHtml(a.city)}, ${escHtml(a.postcode)}</p>
        <p>${a.country === 'GB' ? 'United Kingdom' : escHtml(a.country)}</p>
      </div>

      

      <div class="co-total-row">
        <span>Subtotal</span><span>£${subtotal.toFixed(2)}</span>
      </div>
      <div class="co-total-row">
        <span>Delivery</span>
        <span>${shipping === 0 ? '<span class="free-label">FREE</span>' : `£${shipping.toFixed(2)}`}</span>
      </div>
      <div class="co-total-row co-total-grand">
        <span>Total (GBP)</span><span>£${total.toFixed(2)}</span>
      </div>

      <div class="co-error" id="paymentError" style="display:none"></div>

      <button class="btn btn-primary btn-full btn-lg co-pay-btn" id="coPayBtn" type="button">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Pay with Stripe — £${total.toFixed(2)}
      </button>
      <p class="co-pay-note">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        Secure payment via Stripe &middot; We'll email your confirmation &amp; design proof within 24h
      </p>
    </div>
  `;
}

function renderOrderSummary() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 99 ? 0 : 9.99;
  const total = subtotal + shipping;

  return `
    <div class="co-summary">
      <h3 class="co-summary-title">Order Summary</h3>
      <ul class="co-summary-items">
        ${cart.map(item => `
          <li class="co-summary-item">
            <div class="co-summary-thumb" style="background:#000;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
              <canvas class="co-thumb-canvas" width="56" height="56"
                data-text="${escAttr(item.text || '')}"
                data-color="${escAttr(item.color)}"
                data-font="${escAttr(item.font)}"></canvas>
            </div>
            <div class="co-summary-info">
              <div class="co-summary-name">${escHtml(item.text || 'Custom Sign')}</div>
              <div class="co-summary-meta">${escHtml(item.size)} · Qty ${item.quantity}</div>
            </div>
            <div class="co-summary-price">£${(item.price * item.quantity).toFixed(2)}</div>
          </li>
        `).join('')}
      </ul>
      <div class="co-summary-totals">
        <div class="co-total-row"><span>Subtotal</span><span>£${subtotal.toFixed(2)}</span></div>
        <div class="co-total-row"><span>Delivery</span><span>${shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}</span></div>
        ${shipping === 0 ? '' : '<p class="co-free-shipping-hint">Add £' + (99 - subtotal).toFixed(2) + ' more for free delivery</p>'}
        <div class="co-total-row co-total-grand"><span>Total</span><span>£${total.toFixed(2)}</span></div>
      </div>
      <div class="co-summary-badges">
        <span><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 24-month warranty</span>
        <span><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 3–4 day dispatch</span>
        <span><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> Free proof included</span>
      </div>
    </div>
  `;
}

// ── Event binding ──────────────────────────────────────────────
function bindStepHandlers() {
  document.getElementById('coBack')?.addEventListener('click', () => {
    checkoutState.step = Math.max(1, checkoutState.step - 1);
    renderCheckoutModal();
  });

  document.querySelectorAll('.co-review-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      checkoutState.step = parseInt(btn.dataset.step);
      renderCheckoutModal();
    });
  });

  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const el = id => document.getElementById(id);
    const firstName = el('co-firstName').value.trim();
    const lastName = el('co-lastName').value.trim();
    const email = el('co-email').value.trim();
    const phone = el('co-phone')?.value.trim() || '';
    const notes = el('co-notes')?.value.trim() || '';

    if (!firstName || !lastName) { showFieldError('contactError', 'Please enter your full name.'); return; }
    if (!email || !email.includes('@')) { showFieldError('contactError', 'Please enter a valid email address.'); return; }

    checkoutState.contact = { firstName, lastName, email, phone, notes };
    checkoutState.step = 2;
    renderCheckoutModal();
  });

  document.getElementById('addressForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const el = id => document.getElementById(id);
    const line1 = el('co-line1').value.trim();
    const line2 = el('co-line2')?.value.trim() || '';
    const city = el('co-city').value.trim();
    const postcode = el('co-postcode').value.trim();
    const country = el('co-country').value;

    if (!line1) { showFieldError('addressError', 'Please enter your street address.'); return; }
    if (!city) { showFieldError('addressError', 'Please enter your city.'); return; }
    if (!postcode) { showFieldError('addressError', 'Please enter your postcode.'); return; }

    checkoutState.address = { line1, line2, city, postcode, country };
    checkoutState.step = 3;
    renderCheckoutModal();
    renderThumbCanvases();
  });

  document.getElementById('coPayBtn')?.addEventListener('click', handlePlaceOrder);

  document.querySelectorAll('.co-bank-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      navigator.clipboard?.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      }).catch(() => {
        showToast('info', 'Copy', `Account detail: ${text}`);
      });
    });
  });

  renderThumbCanvases();
}

async function handlePlaceOrder() {
  if (checkoutState.loading) return;

  const btn = document.getElementById('coPayBtn');
  const errorEl = document.getElementById('paymentError');
  if (errorEl) errorEl.style.display = 'none';

  const cart = getCart();
  if (!cart.length) { showFieldError('paymentError', 'Your cart is empty.'); return; }

  checkoutState.loading = true;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="co-spinner"></span> Redirecting to payment...`;
  }

  // ... (Keep your existing Formspree logic here) ...

  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(emailBody),
    });
  } catch (err) {
    // Non-blocking
  }

  // Clear cart and redirect immediately
  clearCart();
  
  // REMOVE: closeCheckout();
  // REMOVE: showOrderSuccess(orderNum, total, c);

  // Redirect directly to Stripe
  window.location.href = STRIPE_PAYMENT_LINK;
}

function showOrderSuccess(orderNum, total, contact) {
  const overlay = document.getElementById('successOverlay');
  const modal = document.getElementById('successModal');
  if (!overlay || !modal) return;

  const orderNumEl = document.getElementById('successOrderNum');
  if (orderNumEl) orderNumEl.textContent = `#${orderNum}`;

  const emailEl = document.getElementById('successEmail');
  if (emailEl) emailEl.textContent = contact.email;

  const totalEl = document.getElementById('successTotal');
  if (totalEl) totalEl.textContent = `£${total.toFixed(2)}`;

  overlay.classList.add('active');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  showToast('success', 'Order placed!', `Order #${orderNum} confirmed. Redirecting to Stripe for payment...`);
}

// ── Init ───────────────────────────────────────────────────────
export function initCheckout() {
  document.getElementById('checkoutOverlay')?.addEventListener('click', closeCheckout);
  document.getElementById('successOverlay')?.addEventListener('click', closeSuccess);
  document.getElementById('successCloseBtn')?.addEventListener('click', closeSuccess);
  document.getElementById('successPayBtn')?.addEventListener('click', () => {
    // Link already opens in new tab via target="_blank"
  });
}

export function closeSuccess() {
  document.getElementById('successOverlay')?.classList.remove('active');
  document.getElementById('successModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// Legacy compat — no longer used (no Stripe redirect)
export async function handlePostPaymentRedirect() {}

// ── Helpers ────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escAttr(str) { return String(str).replace(/"/g, '&quot;'); }

function renderThumbCanvases() {
  document.querySelectorAll('.co-thumb-canvas').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    const text = canvas.dataset.text;
    const color = canvas.dataset.color || '#FF0090';
    const font = canvas.dataset.font || 'Dancing Script';
    if (!text) return;
    const fontSize = Math.min(w / (text.length * 0.65 + 0.5), h * 0.5);
    ctx.font = `bold ${fontSize}px "${font}", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.fillText(text, w / 2, h / 2);
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, w / 2, h / 2);
  });
}
