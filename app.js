/* ══════════════════════════════════════════════════════
   FANTASY FEAST — app.js
   SPA Router · Canvas Background · All Interactivity
══════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   1.  SPA PAGE ROUTER
────────────────────────────────────────────────────── */
const PAGES  = ['home','games','books','ideas','snacks','beasts','membership'];
let currentPage = 'home';
let transitioning = false;

function navigateTo(pageId) {
  if (!PAGES.includes(pageId) || pageId === currentPage || transitioning) return;
  transitioning = true;

  const overlay = document.getElementById('pageTransition');
  overlay.classList.add('show');

  setTimeout(() => {
    // Hide current
    const prev = document.getElementById(`page-${currentPage}`);
    prev.classList.remove('active');

    // Show next
    const next = document.getElementById(`page-${pageId}`);
    next.classList.add('active');
    next.scrollTop = 0;
    window.scrollTo(0, 0);

    currentPage = pageId;
    updateNavActive(pageId);
    updateMobileActive(pageId);

    // Trigger card animations again
    next.querySelectorAll('.card, .clan-card, .rank-item').forEach((el, i) => {
      el.style.animation = 'none';
      // Force reflow
      void el.offsetWidth;
      el.style.animation = '';
    });

    // Close mobile drawer
    document.getElementById('mobileDrawer').classList.remove('open');

    overlay.classList.remove('show');
    transitioning = false;
  }, 320);
}

function updateNavActive(pageId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
}

function updateMobileActive(pageId) {
  document.querySelectorAll('.mob-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
}

/* Wire up all navigation triggers */
function initRouter() {
  // Desktop nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Mobile nav buttons
  document.querySelectorAll('.mob-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Brand → home
  document.querySelectorAll('[data-page]').forEach(el => {
    if (el.classList.contains('nav-btn') || el.classList.contains('mob-btn')) return;
    el.addEventListener('click', () => navigateTo(el.dataset.page));
  });
}

/* ──────────────────────────────────────────────────────
   2.  HAMBURGER MENU
────────────────────────────────────────────────────── */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobileDrawer');

  hamburger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    hamburger.querySelectorAll('span').forEach((s, i) => {
      s.style.transform = open
        ? i === 0 ? 'translateY(7px) rotate(45deg)'
        : i === 1 ? 'scaleX(0)'
        : 'translateY(-7px) rotate(-45deg)'
        : '';
      s.style.opacity = (open && i === 1) ? '0' : '1';
    });
  });
}

/* ──────────────────────────────────────────────────────
   3.  CANVAS STARFIELD & PARTICLES BACKGROUND
────────────────────────────────────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H;
  const stars = [];
  const NUM_STARS = 180;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = document.documentElement.scrollHeight;
  }

  function createStars() {
    stars.length = 0;
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.2,
        alpha: Math.random() * 0.7 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.005,
        color: starColor()
      });
    }
  }

  function starColor() {
    const roll = Math.random();
    if (roll < 0.5)  return `rgba(232,217,184,`;   // warm white
    if (roll < 0.75) return `rgba(201,162,39,`;     // gold
    if (roll < 0.9)  return `rgba(74,158,255,`;     // blue
    return `rgba(139,92,246,`;                       // purple
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    // Draw a subtle vignette gradient
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.7);
    vig.addColorStop(0, 'rgba(10,8,25,0)');
    vig.addColorStop(1, 'rgba(4,2,12,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Draw stars
    stars.forEach(s => {
      s.pulse += s.speed;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + a + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createStars(); });
  resize();
  createStars();
  requestAnimationFrame(draw);
}

/* ──────────────────────────────────────────────────────
   4.  HERO FLOATING PARTICLES (HOME PAGE)
────────────────────────────────────────────────────── */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  const NUM = 30;
  const COLORS = [
    'rgba(201,162,39,',
    'rgba(74,158,255,',
    'rgba(139,92,246,',
    'rgba(255,107,53,',
    'rgba(255,255,255,'
  ];

  for (let i = 0; i < NUM; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 1.5;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const dur = Math.random() * 14 + 8;
    const delay = Math.random() * 10;
    const left = Math.random() * 100;

    p.style.cssText = `
      position: absolute;
      left: ${left}%;
      bottom: -10px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color}0.8);
      box-shadow: 0 0 ${size * 3}px ${color}0.5);
      pointer-events: none;
      opacity: 0;
      animation: particleRise ${dur}s ${delay}s linear infinite;
    `;
    container.appendChild(p);
  }

  // Inject keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleRise {
      0%   { transform: translateY(0) scale(0);   opacity: 0; }
      5%   { opacity: 1; }
      90%  { opacity: 0.7; }
      100% { transform: translateY(-100vh) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────────────────────────────────────
   5.  CURSOR GLOW
────────────────────────────────────────────────────── */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  window.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
  });

  (function lerp() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(lerp);
  })();
}

/* ──────────────────────────────────────────────────────
   6.  TOAST NOTIFICATION
────────────────────────────────────────────────────── */
let toastTimer = null;

window.notify = function(icon, msg) {
  const toast    = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMsg  = document.getElementById('toastMsg');

  clearTimeout(toastTimer);
  toast.classList.remove('show');

  // Force reflow for re-animation
  void toast.offsetWidth;

  toastIcon.textContent = icon;
  toastMsg.textContent  = msg;
  toast.classList.add('show');

  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
};

/* ──────────────────────────────────────────────────────
   7.  IDEAS – POST SYSTEM
────────────────────────────────────────────────────── */
const CAT_EMOJI = {
  'Story Idea'      : '📜',
  'Character Design': '⚔',
  'World Building'  : '🌍',
  'Creature Concept': '🐉',
  'Magical Item'    : '🔮'
};

window.postIdea = function() {
  const author   = document.getElementById('ideaAuthor').value.trim() || 'Anonymous Adventurer';
  const text     = document.getElementById('ideaText').value.trim();
  const category = document.getElementById('ideaCategory').value;

  if (!text) {
    notify('⚠', 'Please write your idea first!');
    return;
  }

  const feed = document.getElementById('ideasFeed');
  const count = parseInt(document.getElementById('boardCount').textContent) || 0;

  const card = document.createElement('div');
  card.className = 'idea-card';
  card.innerHTML = `
    <div class="idea-meta">
      <span class="idea-author">✨ ${escapeHtml(author)}</span>
      <span class="idea-rank">Adventurer</span>
    </div>
    <p class="idea-text">"${escapeHtml(text)}"</p>
    <span class="idea-tag">${CAT_EMOJI[category] || '📜'} ${category}</span>
  `;

  feed.insertBefore(card, feed.firstChild);
  document.getElementById('boardCount').textContent = `${count + 1} ideas`;

  document.getElementById('ideaText').value   = '';
  document.getElementById('ideaAuthor').value = '';

  notify('✨', 'Your idea has been posted to the Guild Board!');
};

function escapeHtml(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ──────────────────────────────────────────────────────
   8.  BEAST CLAN JOIN
────────────────────────────────────────────────────── */
window.joinClan = function(clan, icon) {
  const select = document.getElementById('regClan');
  if (select) select.value = clan;
  notify(icon, `Welcome to the ${clan} Clan, brave soul!`);
};

/* ──────────────────────────────────────────────────────
   9.  GUILD REGISTRATION FORM
────────────────────────────────────────────────────── */
window.registerGuild = function() {
  const user     = document.getElementById('regUser').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const clan     = document.getElementById('regClan').value;
  const pass     = document.getElementById('regPass').value;

  if (!user)                         { notify('⚠', 'Please enter your adventurer name!');       return; }
  if (!email || !email.includes('@')){ notify('⚠', 'Please enter a valid email address!');      return; }
  if (!clan)                         { notify('⚠', 'Please choose your beast clan!');           return; }
  if (pass.length < 8)               { notify('⚠', 'Passphrase must be at least 8 characters!'); return; }

  const clanIcons = { Dragon:'🐉', Unicorn:'🦄', Wolf:'🐺', Griffin:'🦅' };
  notify(clanIcons[clan] || '⚜', `Welcome to the Guild, ${user}! Your legend begins now!`);

  ['regUser','regEmail','regCreature','regPass'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('regClan').value = '';
};

/* ──────────────────────────────────────────────────────
   10. CARD HOVER TILT EFFECT
────────────────────────────────────────────────────── */
function initCardTilt() {
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.card, .clan-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    card.style.transform = `
      translateY(-8px) scale(1.01)
      rotateX(${-y * 8}deg)
      rotateY(${x * 8}deg)
    `;
  });

  document.addEventListener('mouseleave', e => {
    const card = e.target.closest('.card, .clan-card');
    if (!card) return;
    card.style.transform = '';
  }, true);
}

/* ──────────────────────────────────────────────────────
   11. SCROLL-LINKED NAV SHADOW
────────────────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20
      ? '0 4px 40px rgba(0,0,0,.6)'
      : 'none';
  }, { passive: true });
}

/* ──────────────────────────────────────────────────────
   12.  BOOT
────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initHamburger();
  initCanvas();
  initHeroParticles();
  initCursorGlow();
  initCardTilt();
  initNavScroll();

  // Ensure home page is active on load
  const home = document.getElementById('page-home');
  home.style.display = 'flex';
  home.style.opacity = '1';
  home.style.transform = 'none';
});
