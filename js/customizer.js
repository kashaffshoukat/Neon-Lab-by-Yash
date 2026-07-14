import { addToCart } from './cart.js';
import { showToast } from './toast.js';

const ENV_BACKGROUNDS = {
  studio: '#000000',
  bedroom: '#0D0020',
  bar: '#0A0505',
};

const PRICES = { small: 89, medium: 139, large: 199, xl: 269 };
const SIZE_LABELS = { small: 'Small (~30cm)', medium: 'Medium (~50cm)', large: 'Large (~80cm)', xl: 'XL (~100cm+)' };

let state = {
  text: 'Good Vibes',
  color: '#FF006B',
  font: 'Dancing Script',
  backing: 'clear',
  size: 'medium',
  quantity: 1,
  tab: 'text',
  env: 'studio',
  uploadedFile: null,
};

let animFrame = null;
let animTime = 0;
let animRunning = false;

export function initCustomizer() {
  const canvas = document.getElementById('customizerCanvas');
  if (!canvas) return;

  setupCanvas(canvas);
  bindControls(canvas);
  renderCanvas(canvas);
  startFlicker(canvas);
}

function setupCanvas(canvas) {
  const resize = () => {
    const container = canvas.parentElement;
    if (!container) return;
    const w = container.clientWidth;
    canvas.width = w;
    canvas.height = Math.round(w * 0.55);
    renderCanvas(canvas);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
}

function bindControls(canvas) {
  const re = () => renderCanvas(canvas);

  // Text input
  const textInput = document.getElementById('neonText');
  const charCount = document.getElementById('textCharCount');
  textInput?.addEventListener('input', () => {
    state.text = textInput.value;
    if (charCount) charCount.textContent = `${textInput.value.length} / 40 characters`;
    re();
  });

  // Font picker
  document.querySelectorAll('.font-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.font-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.font = btn.dataset.font;
      re();
    });
  });

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.color = btn.dataset.color;
      re();
    });
  });

  // Custom color
  const customColorInput = document.getElementById('customColor');
  customColorInput?.addEventListener('input', () => {
    state.color = customColorInput.value;
    document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
    re();
  });

  // Backing
  document.querySelectorAll('.backing-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.backing-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.backing = btn.dataset.backing;
      re();
    });
  });

  // Size
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.size = btn.dataset.size;
      updatePrice();
      re();
    });
  });

  // Quantity
  const qtyValue = document.getElementById('qtyValue');
  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    state.quantity = Math.max(1, state.quantity - 1);
    if (qtyValue) qtyValue.textContent = state.quantity;
    updatePrice();
  });
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    state.quantity = Math.min(99, state.quantity + 1);
    if (qtyValue) qtyValue.textContent = state.quantity;
    updatePrice();
  });

  // Preview environments
  document.querySelectorAll('.preview-env').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preview-env').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.env = btn.dataset.env;
      re();
    });
  });

  // Fullscreen
  document.getElementById('previewFullscreen')?.addEventListener('click', () => {
    const container = document.getElementById('canvasContainer');
    if (!document.fullscreenElement) {
      container?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  // Tabs
  document.querySelectorAll('[data-customizer-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.customizerTab;
      document.querySelectorAll('.customizer-tab').forEach(t => t.classList.toggle('active', t.dataset.customizerTab === target));
      document.querySelectorAll('.customizer-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${target}`));
      state.tab = target;
      re();
    });
  });

  // Upload zone
  initUploadZone(canvas);

  // Add to cart
  document.getElementById('addToCartBtn')?.addEventListener('click', handleAddToCart);
}

function initUploadZone(canvas) {
  const zone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const browse = document.getElementById('uploadBrowse');
  const preview = document.getElementById('uploadPreview');
  const previewImg = document.getElementById('uploadPreviewImg');
  const removeBtn = document.getElementById('uploadRemove');
  const inner = document.getElementById('uploadZoneInner');

  if (!zone) return;

  browse?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', e => handleFile(e.target.files[0]));

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });

  removeBtn?.addEventListener('click', () => {
    state.uploadedFile = null;
    if (previewImg) previewImg.src = '';
    if (preview) preview.style.display = 'none';
    if (inner) inner.style.display = 'flex';
    if (fileInput) fileInput.value = '';
    renderCanvas(canvas);
  });

  function handleFile(file) {
    if (!file) return;
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) { showToast('error', 'File too large', 'Maximum file size is 20MB.'); return; }

    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
    const isImage = allowed.includes(file.type) || file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i);

    state.uploadedFile = file;

    if (isImage && previewImg) {
      const reader = new FileReader();
      reader.onload = e => {
        previewImg.src = e.target.result;
        if (preview) preview.style.display = 'block';
        if (inner) inner.style.display = 'none';
      };
      reader.readAsDataURL(file);
    } else {
      if (inner) inner.innerHTML = `<svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p><strong>${escapeHtml(file.name)}</strong><br/>${(file.size / 1024).toFixed(0)} KB</p>`;
    }
  }
}

function updatePrice() {
  const base = PRICES[state.size] || 139;
  const total = base * state.quantity;
  const el = document.getElementById('priceDisplay');
  if (el) el.textContent = total;
}

function handleAddToCart() {
  if (state.tab === 'upload') {
    if (!state.uploadedFile) { showToast('warning', 'No file uploaded', 'Please upload your design file first.'); return; }
    addToCart({
      text: state.uploadedFile.name.replace(/\.[^.]+$/, ''),
      color: '#FF006B',
      font: 'Poppins',
      backing: state.backing,
      size: SIZE_LABELS[state.size],
      price: PRICES[state.size],
      quantity: state.quantity,
      type: 'upload',
    });
  } else {
    if (!state.text.trim()) { showToast('warning', 'Enter some text', 'Please type the text for your neon sign.'); return; }
    addToCart({
      text: state.text,
      color: state.color,
      font: state.font,
      backing: state.backing,
      size: SIZE_LABELS[state.size],
      price: PRICES[state.size],
      quantity: state.quantity,
      type: 'text',
    });
  }
}

export function renderNeonText(canvas, text, color, fontFamily, backing, env) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background
  const bgColor = backing === 'clear'
    ? (ENV_BACKGROUNDS[env] || '#000')
    : backing === 'black'
      ? '#050505'
      : '#1a0800';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Backing texture for wood
  if (backing === 'wood') {
    ctx.save();
    for (let i = 0; i < w; i += 3) {
      ctx.fillStyle = `rgba(${100 + Math.sin(i * 0.5) * 20}, ${60 + Math.cos(i * 0.3) * 10}, ${20}, 0.15)`;
      ctx.fillRect(i, 0, 2, h);
    }
    ctx.restore();
  }

  if (!text) return;

  const lines = text.split('\n').filter(l => l.length > 0);
  const lineCount = lines.length;
  const maxLineLen = Math.max(...lines.map(l => l.length), 1);
  const fontSize = Math.min(
    w / (maxLineLen * 0.52 + 0.3),
    (h * 0.6) / lineCount,
    w * 0.2
  );

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lineHeight = fontSize * 1.3;
  const totalHeight = lineHeight * lineCount;
  const startY = h / 2 - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line, idx) => {
    const y = startY + idx * lineHeight;
    const x = w / 2;

    ctx.font = `bold ${fontSize}px "${fontFamily}", "Dancing Script", cursive`;

    // Outer ambient glow
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 80;
    ctx.fillStyle = hexWithAlpha(color, 0.1);
    for (let i = 0; i < 3; i++) ctx.fillText(line, x, y);
    ctx.restore();

    // Mid glow layer
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 40;
    ctx.fillStyle = hexWithAlpha(color, 0.5);
    ctx.fillText(line, x, y);
    ctx.restore();

    // Inner glow
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    ctx.fillText(line, x, y);
    ctx.restore();

    // Bright core
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.fillText(line, x, y);
    ctx.restore();
  });

  // Subtle vignette
  const vignette = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function renderCanvas(canvas) {
  renderNeonText(canvas, state.text, state.color, state.font, state.backing, state.env);
}

let flickerDir = 1;
let flickerAlpha = 1;

function startFlicker(canvas) {
  if (animRunning) return;
  animRunning = true;

  function tick() {
    animTime += 0.016;

    // Subtle flicker
    flickerAlpha += flickerDir * 0.008;
    if (flickerAlpha >= 1) { flickerAlpha = 1; flickerDir = -1; }
    if (flickerAlpha < 0.92) { flickerAlpha = 0.92; flickerDir = 1; }

    // Occasional random flicker
    if (Math.random() < 0.003) {
      flickerAlpha = 0.6 + Math.random() * 0.2;
      setTimeout(() => { flickerAlpha = 1; }, 80);
    }

    const ctx = canvas.getContext('2d');
    renderCanvas(canvas);
    ctx.globalAlpha = flickerAlpha;
    renderCanvas(canvas);
    ctx.globalAlpha = 1;

    animFrame = requestAnimationFrame(tick);
  }

  animFrame = requestAnimationFrame(tick);
}

export function initHeroNeonCanvas() {
  const canvas = document.getElementById('heroNeonCanvas');
  if (!canvas) return;

  const heroState = { text: 'Good Vibes', color: '#FF006B', font: 'Dancing Script' };

  const draw = () => {
    renderNeonText(canvas, heroState.text, heroState.color, heroState.font, 'clear', 'studio');
  };

  draw();

  document.querySelectorAll('.neon-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.neon-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      heroState.color = dot.dataset.color;
      draw();
    });
  });

  // Simple flicker for hero
  let hFlicker = 1;
  let hDir = -1;
  const heroTick = () => {
    hFlicker += hDir * 0.005;
    if (hFlicker <= 0.93) { hFlicker = 0.93; hDir = 1; }
    if (hFlicker >= 1) { hFlicker = 1; hDir = -1; }
    if (Math.random() < 0.002) { hFlicker = 0.7; setTimeout(() => { hFlicker = 1; }, 60); }
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = hFlicker;
    draw();
    ctx.globalAlpha = 1;
    requestAnimationFrame(heroTick);
  };
  requestAnimationFrame(heroTick);
}

function hexWithAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
