import { showToast } from './toast.js';

/**
 * Auth state — replace with Firebase Auth for production.
 * Structure here mirrors Firebase's currentUser shape.
 */
let currentUser = null;

// Restore persisted session
try {
  const stored = sessionStorage.getItem('neuneon_user');
  if (stored) currentUser = JSON.parse(stored);
} catch {
  currentUser = null;
}

const authListeners = [];

export function onAuthChange(fn) {
  authListeners.push(fn);
  fn(currentUser);
}

function notifyListeners() {
  authListeners.forEach(fn => fn(currentUser));
}

function setUser(user) {
  currentUser = user;
  if (user) {
    sessionStorage.setItem('neuneon_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('neuneon_user');
  }
  notifyListeners();
  updateAuthUI();
}

export function getUser() { return currentUser; }

export function isLoggedIn() { return currentUser !== null; }

async function signIn(email, password) {
  // Stub — wire to Firebase: signInWithEmailAndPassword(auth, email, password)
  await delay(600);
  if (!email || !password) throw new Error('Please fill in all fields.');
  if (password.length < 6) throw new Error('Invalid credentials.');

  const user = { uid: btoa(email), email, displayName: email.split('@')[0] };
  setUser(user);
  return user;
}

async function signUp(email, password, firstName, lastName) {
  await delay(600);
  if (!email || !password) throw new Error('Please fill in all fields.');
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');

  const user = { uid: btoa(email), email, displayName: `${firstName} ${lastName}`.trim() };
  setUser(user);
  return user;
}

export function signOut() {
  setUser(null);
  showToast('info', 'Signed out', 'See you next time!');
}

function updateAuthUI() {
  const label = document.getElementById('authLabel');
  const modalTitle = document.getElementById('authModalTitle');
  if (!label) return;

  if (currentUser) {
    label.textContent = currentUser.displayName || 'Account';
    if (modalTitle) modalTitle.textContent = 'My Account';
  } else {
    label.textContent = 'Sign In';
    if (modalTitle) modalTitle.textContent = 'Sign In';
  }
}

function openModal() {
  document.getElementById('authModal')?.classList.add('open');
  document.getElementById('authOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('authModal')?.classList.remove('open');
  document.getElementById('authOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

export function initAuth() {
  updateAuthUI();

  const authToggle = document.getElementById('authToggle');
  const authClose = document.getElementById('authClose');
  const authOverlay = document.getElementById('authOverlay');

  authToggle?.addEventListener('click', () => {
    if (currentUser) {
      // If logged in, show account options
      showToast('info', `Hi, ${currentUser.displayName}!`, 'Account management coming soon.');
    } else {
      openModal();
    }
  });

  authClose?.addEventListener('click', closeModal);
  authOverlay?.addEventListener('click', closeModal);

  // Tab switching
  document.querySelectorAll('[data-auth-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.authTab;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.authTab === target));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('active', f.dataset.authPanel === target));
      const title = document.getElementById('authModalTitle');
      if (title) title.textContent = target === 'signin' ? 'Sign In' : 'Create Account';
    });
  });

  // Sign In form
  document.getElementById('signinForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;
    const errorEl = document.getElementById('signinError');
    errorEl.style.display = 'none';

    const btn = e.target.querySelector('[type="submit"]');
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
      await signIn(email, password);
      closeModal();
      showToast('success', 'Welcome back!', `Signed in as ${email}`);
      e.target.reset();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    } finally {
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  });

  // Sign Up form
  document.getElementById('signupForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorEl = document.getElementById('signupError');
    errorEl.style.display = 'none';

    const btn = e.target.querySelector('[type="submit"]');
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
      await signUp(email, password, firstName, lastName);
      closeModal();
      showToast('success', 'Account created!', `Welcome, ${firstName}!`);
      e.target.reset();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    } finally {
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  });

  // Forgot password
  document.getElementById('forgotPassword')?.addEventListener('click', () => {
    const email = document.getElementById('signinEmail')?.value.trim();
    if (!email) {
      showToast('warning', 'Enter your email', 'Please enter your email address first.');
      return;
    }
    showToast('info', 'Reset link sent', `If an account exists for ${email}, you'll receive a reset email.`);
  });
}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
