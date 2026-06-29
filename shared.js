/* SalwaDev Corporate — Updated Shared JS with Auth Integration */

/* ── Theme toggle (light / dark) ── */
(function () {
  const root = document.documentElement;
  let saved = 'dark';
  try { saved = localStorage.getItem('salwadev-theme') || 'dark'; } catch (e) {}
  root.setAttribute('data-theme', saved);

  window.toggleTheme = function () {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('salwadev-theme', next); } catch (e) {}
  };
})();

/* Topbar + nav scroll */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) nav?.classList.add('scrolled');
  else nav?.classList.remove('scrolled');
});

/* Mobile menu */
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger');
  m?.classList.toggle('open');
  hamburger?.classList.toggle('active');
}

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal, .stagger-child');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

/* Toast */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* Number counter animation */
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1600;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
    if (current >= target) clearInterval(timer);
  }, step);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCount(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

/* Update navigation based on auth status */
document.addEventListener('DOMContentLoaded', () => {
  // Check if auth.js is loaded
  if (typeof Auth !== 'undefined') {
    updateAuthNav();
  }
});

function updateAuthNav() {
  try {
    const user = Auth.getCurrentUser();
    const navList = document.querySelector('nav ul');
    
    if (!navList) return;

    // Find and remove existing auth button
    const existingBtn = navList.querySelector('.nav-btn-auth');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Add or update auth button
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    if (user) {
      // Create user menu
      const authBtn = document.createElement('button');
      authBtn.className = 'nav-btn-auth nav-btn';
      authBtn.innerHTML = `${user.name} ↓`;
      authBtn.style.marginLeft = '0.5rem';
      authBtn.onclick = () => {
        if (user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'client-management.html';
        }
      };
      
      navRight.insertBefore(authBtn, navRight.querySelector('.theme-toggle'));
    } else {
      // Create login button
      const loginBtn = document.createElement('a');
      loginBtn.href = 'login.html';
      loginBtn.className = 'nav-btn nav-btn-auth';
      loginBtn.textContent = 'Login';
      loginBtn.style.marginLeft = '0.5rem';
      
      navRight.insertBefore(loginBtn, navRight.querySelector('.theme-toggle'));
    }
  } catch (e) {
    console.log('Auth not available');
  }
}

/* Close mobile menu when link is clicked */
document.addEventListener('click', (e) => {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    if (!e.target.closest('nav') && e.target.tagName === 'A') {
      mobileMenu.classList.remove('open');
      const hamburger = document.querySelector('.hamburger');
      if (hamburger) hamburger.classList.remove('active');
    }
  }
});

/* Smooth scroll for anchor links */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* Add loading state to forms */
document.addEventListener('submit', (e) => {
  if (e.target.classList.contains('auto-submit')) {
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Loading...';
    }
  }
});

/* Responsive table */
if (window.innerWidth < 768) {
  document.querySelectorAll('table').forEach(table => {
    table.style.fontSize = '0.85rem';
  });
}

/* Dynamic year in footer */
document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.querySelector('footer [data-year]');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

/* Console welcome message */
console.log('%cSalwaDev', 'font-size: 24px; font-weight: bold; color: #c8ff00;');
console.log('%cPakistan\'s Enterprise Digital Agency', 'color: #8a8a8a; font-size: 14px;');
console.log('%cWe build web platforms, AI systems, and brands that scale.', 'color: #8a8a8a; font-size: 12px;');
