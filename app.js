/* ═══════════════════════════════════════════════════════════════
   FANTASY FEAST — app.js
   Complete SPA Logic: Router · Canvas · ID Generator · Cart ·
   Ideas · Forms · Search · Animations · Ticker
═══════════════════════════════════════════════════════════════ */

'use strict';

const App = (() => {

  /* ── STATE ──────────────────────────────────────────────── */
  let currentPage  = 'home';
  let transitioning = false;
  let activeClan   = {};
  let cart         = [];
  let ideasData    = [];
  let toastTimer   = null;
  let tickerPos    = 0;
  let countAnimated = false;

  const PAGES = ['home','games','realgames','library','ideas','snacks','beasts','membership'];

  /* ═══════════════════════════════════════════════════════════
     1. SPA ROUTER
  ═══════════════════════════════════════════════════════════ */
  function go(pageId) {
    if (!PAGES.includes(pageId) || pageId === currentPage || transitioning) return;
    transitioning = true;

    const veil = document.getElementById('pageVeil');
    veil.classList.add('show');

    setTimeout(() => {
      // Hide old
      const prev = document.getElementById('page-' + currentPage);
      if (prev) { prev.classList.remove('active'); }

      // Show new
      const next = document.getElementById('page-' + pageId);
      if (next) {
        next.classList.add('active');
        // Re-trigger animations
        next.querySelectorAll('.game-card,.book-card,.snack-card,.clan-card,.rg-card,.rank-row,.idea-card').forEach(el => {
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        });
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
      currentPage = pageId;
      updateNavActive(pageId);
      closeMobileDrawer();

      veil.classList.remove('show');
      transitioning = false;

      // Page-specific init
      if (pageId === 'beasts') animateClanBars();
    }, 290);
  }

  function updateNavActive(pageId) {
    document.querySelectorAll('.nav-link, .mob-link').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2. NAVIGATION WIRING
  ═══════════════════════════════════════════════════════════ */
  function initNav() {
    // Desktop nav
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', () => go(btn.dataset.page));
    });

    // Mobile nav
    document.querySelectorAll('.mob-link').forEach(btn => {
      btn.addEventListener('click', () => go(btn.dataset.page));
    });

    // Hamburger
    const hbg = document.getElementById('hamburger');
    const drawer = document.getElementById('mobileDrawer');
    if (hbg) {
      hbg.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        hbg.classList.toggle('open', open);
        hbg.setAttribute('aria-expanded', open);
      });
    }

    // Scroll shadow on nav
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  function closeMobileDrawer() {
    const d = document.getElementById('mobileDrawer');
    const h = document.getElementById('hamburger');
    if (d) d.classList.remove('open');
    if (h) { h.classList.remove('open'); h.setAttribute('aria-expanded', 'false'); }
  }

  /* ═══════════════════════════════════════════════════════════
     3. CANVAS STARFIELD
  ═══════════════════════════════════════════════════════════ */
  function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      makeStars();
    }

    function makeStars() {
      stars = [];
      for (let i = 0; i < 170; i++) {
        const roll = Math.random();
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.5 + 0.2,
          a: Math.random() * 0.68 + 0.1,
          p: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.012 + 0.003,
          c: roll < .5 ? '232,217,184' : roll < .75 ? '201,162,39' : roll < .9 ? '74,158,255' : '139,92,246'
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.p += s.sp;
        const a = s.a * (0.58 + 0.42 * Math.sin(s.p));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.c},${a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    draw();
  }

  /* ═══════════════════════════════════════════════════════════
     4. HERO FLOATING PARTICLES
  ═══════════════════════════════════════════════════════════ */
  function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes pRise {
        0%   { transform:translateY(0) scale(0); opacity:0; }
        6%   { opacity:1; }
        90%  { opacity:.7; }
        100% { transform:translateY(-110vh) scale(1.1); opacity:0; }
      }
    `;
    document.head.appendChild(style);

    const cols = ['rgba(201,162,39,','rgba(74,158,255,','rgba(139,92,246,','rgba(255,107,53,','rgba(255,255,255,'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      const sz  = Math.random() * 4 + 1.5;
      const col = cols[Math.floor(Math.random() * cols.length)];
      p.style.cssText = `
        position:absolute;left:${Math.random()*100}%;bottom:-10px;
        width:${sz}px;height:${sz}px;border-radius:50%;
        background:${col}.8);box-shadow:0 0 ${sz*3}px ${col}.4);
        pointer-events:none;opacity:0;
        animation:pRise ${Math.random()*14+8}s ${Math.random()*10}s linear infinite
      `;
      container.appendChild(p);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     5. CURSOR ORB
  ═══════════════════════════════════════════════════════════ */
  function initCursorOrb() {
    const orb = document.getElementById('cursorOrb');
    if (!orb || window.matchMedia('(pointer:coarse)').matches) return;
    let mx = -999, my = -999, cx = -999, cy = -999;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; orb.style.opacity = '1'; }, { passive: true });
    window.addEventListener('mouseleave', () => orb.style.opacity = '0');
    (function move() {
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      orb.style.left = cx + 'px';
      orb.style.top  = cy + 'px';
      requestAnimationFrame(move);
    })();
  }

  /* ═══════════════════════════════════════════════════════════
     6. CARD 3D TILT
  ═══════════════════════════════════════════════════════════ */
  function initTilt() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    let hoveredCard = null;

    document.addEventListener('mousemove', e => {
      const card = e.target.closest('.game-card,.book-card,.clan-card,.snack-card,.portal-card,.rg-card');
      if (!card) return;
      hoveredCard = card;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) scale(1.015) rotateX(${-y*7}deg) rotateY(${x*7}deg)`;
    });

    document.addEventListener('mouseleave', e => {
      const card = e.target.closest('.game-card,.book-card,.clan-card,.snack-card,.portal-card,.rg-card');
      if (card) { card.style.transform = ''; hoveredCard = null; }
    }, true);
  }

  /* ═══════════════════════════════════════════════════════════
     7. TOAST NOTIFICATION
  ═══════════════════════════════════════════════════════════ */
  function toast(icon, msg, title = '') {
    clearTimeout(toastTimer);
    const el    = document.getElementById('toast');
    const ico   = document.getElementById('toastIcon');
    const ttl   = document.getElementById('toastTitle');
    const txt   = document.getElementById('toastMsg');
    el.classList.remove('show');
    void el.offsetWidth;
    ico.textContent = icon;
    ttl.textContent = title || 'Fantasy Feast';
    txt.textContent = msg;
    el.classList.add('show');
    toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
  }

  /* ═══════════════════════════════════════════════════════════
     8. SEARCH
  ═══════════════════════════════════════════════════════════ */
  const SEARCH_INDEX = [
    { label: 'Dragon Slayer Quest', page: 'games', icon: '🐉' },
    { label: 'Dungeon Escape', page: 'games', icon: '🗝️' },
    { label: 'Wizard Puzzle', page: 'games', icon: '🔮' },
    { label: 'Mystic Kingdom', page: 'games', icon: '🏰' },
    { label: 'Genshin Impact', page: 'realgames', icon: '🌟' },
    { label: 'Elden Ring', page: 'realgames', icon: '⚔️' },
    { label: 'Honkai: Star Rail', page: 'realgames', icon: '🔮' },
    { label: 'Raid: Shadow Legends', page: 'realgames', icon: '🛡️' },
    { label: 'The Elder Scrolls: Blades', page: 'realgames', icon: '🌿' },
    { label: 'The Dragon Kingdom', page: 'library', icon: '📖' },
    { label: 'Wizard Chronicles', page: 'library', icon: '🧙' },
    { label: 'Forest of Spirits', page: 'library', icon: '🌿' },
    { label: 'Tales of the Phoenix', page: 'library', icon: '🔥' },
    { label: 'Dragon Clan', page: 'beasts', icon: '🐉' },
    { label: 'Unicorn Clan', page: 'beasts', icon: '🦄' },
    { label: 'Wolf Clan', page: 'beasts', icon: '🐺' },
    { label: 'Griffin Clan', page: 'beasts', icon: '🦅' },
    { label: 'Dragon Fire Chips', page: 'snacks', icon: '🌶️' },
    { label: 'Phoenix Wings', page: 'snacks', icon: '🔥' },
    { label: 'Elf Berry Juice', page: 'snacks', icon: '🫐' },
    { label: 'Join the Guild', page: 'membership', icon: '⚜' },
    { label: 'Ideas Chamber', page: 'ideas', icon: '💡' },
  ];

  function toggleSearch() {
    const bar = document.getElementById('searchBar');
    const isHidden = bar.style.display === 'none';
    bar.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      setTimeout(() => document.getElementById('searchInput').focus(), 100);
    }
  }

  function closeSearch() {
    const bar = document.getElementById('searchBar');
    bar.style.display = 'none';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
  }

  function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const res = document.getElementById('searchResults');
      if (!q) { res.innerHTML = ''; return; }
      const matches = SEARCH_INDEX.filter(item => item.label.toLowerCase().includes(q)).slice(0, 8);
      res.innerHTML = matches.map(m =>
        `<button class="sr-item" onclick="App.go('${m.page}');App.closeSearch()">${m.icon} ${m.label}</button>`
      ).join('');
    });
    input.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  }

  /* ═══════════════════════════════════════════════════════════
     9. GAME FILTER TABS
  ═══════════════════════════════════════════════════════════ */
  function initGameFilters() {
    document.addEventListener('click', e => {
      if (!e.target.classList.contains('filter-btn')) return;
      const bar = e.target.closest('.filter-bar');
      if (!bar) return;
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.dataset.filter;
      const grid = document.getElementById('gamesGrid');
      if (!grid) return;
      grid.querySelectorAll('.game-card').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
        if (show) { card.style.animation = 'none'; void card.offsetWidth; card.style.animation = ''; }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     10. IDEAS BOARD
  ═══════════════════════════════════════════════════════════ */
  const CAT_EMOJI = {
    'Story Idea': '📜', 'Character Design': '⚔', 'World Building': '🌍',
    'Creature Concept': '🐉', 'Magical Item': '🔮'
  };

  function postIdea() {
    const author = esc(document.getElementById('ideaAuthor').value.trim()) || 'Anonymous Adventurer';
    const text   = document.getElementById('ideaText').value.trim();
    const cat    = document.getElementById('ideaCategory').value;
    if (!text) { toast('⚠', 'Please write your idea first!'); return; }

    const ts = Date.now();
    ideasData.unshift({ author, text: esc(text), cat, ts, likes: 0 });

    renderNewIdea({ author, text: esc(text), cat, ts, likes: 0 }, true);

    const ct = document.getElementById('ideaCount');
    ct.textContent = (parseInt(ct.textContent) || 3) + 1 + ' ideas';

    document.getElementById('ideaText').value   = '';
    document.getElementById('ideaAuthor').value = '';
    document.getElementById('ideaCharCount').textContent = '0';
    toast('✨', 'Your idea has been posted to the Guild Board!', 'Posted!');
  }

  function renderNewIdea(idea, prepend = false) {
    const feed = document.getElementById('ideasFeed');
    const card = document.createElement('div');
    card.className = 'idea-card';
    const catName = idea.cat.replace(/^[^\s]+\s/, '');
    card.innerHTML = `
      <div class="ic-header">
        <span class="ic-author">✨ ${idea.author}</span>
        <span class="ic-rank">Adventurer</span>
      </div>
      <p class="ic-text">"${idea.text}"</p>
      <div class="ic-footer">
        <span class="ic-tag">${CAT_EMOJI[idea.cat] || '📜'} ${catName}</span>
        <button class="like-btn" onclick="App.likeIdea(this)">♡ 0</button>
      </div>
    `;
    if (prepend) feed.insertBefore(card, feed.firstChild);
    else         feed.appendChild(card);
  }

  function sortIdeas(order) {
    const feed = document.getElementById('ideasFeed');
    const cards = Array.from(feed.querySelectorAll('.idea-card'));
    if (order === 'oldest') cards.reverse();
    cards.forEach(c => feed.appendChild(c));
  }

  function likeIdea(btn) {
    const liked = btn.classList.toggle('liked');
    const match = btn.textContent.match(/\d+/);
    const n = match ? parseInt(match[0]) : 0;
    btn.textContent = (liked ? '♥' : '♡') + ' ' + (liked ? n + 1 : Math.max(0, n - 1));
  }

  function initCharCounter() {
    const ta = document.getElementById('ideaText');
    const ct = document.getElementById('ideaCharCount');
    if (ta && ct) ta.addEventListener('input', () => ct.textContent = ta.value.length);
  }

  /* ═══════════════════════════════════════════════════════════
     11. SNACK CART
  ═══════════════════════════════════════════════════════════ */
  function addToCart(name, price) {
    cart.push({ name, price });
    updateCartBar();
    toast('🛒', `${name} added to your pouch!`, 'Added!');
  }

  function updateCartBar() {
    const bar   = document.getElementById('cartBar');
    const count = document.getElementById('cartCount');
    const total = document.getElementById('cartTotal');
    if (!bar) return;
    bar.style.display = cart.length > 0 ? 'flex' : 'none';
    count.textContent = cart.length + (cart.length === 1 ? ' item' : ' items');
    total.textContent = cart.reduce((a, b) => a + b.price, 0) + ' Gold Coins';
  }

  function checkout() {
    if (cart.length === 0) return;
    const total = cart.reduce((a, b) => a + b.price, 0);
    toast('⚜', `Order placed! ${total} Gold Coins charged. Bon appétit, adventurer!`, 'Order Confirmed!');
    cart = [];
    updateCartBar();
  }

  /* ═══════════════════════════════════════════════════════════
     12. BEAST CLAN — ID MODAL
  ═══════════════════════════════════════════════════════════ */
  function openClanModal(clanName, logo, color, border) {
    activeClan = { clanName, logo, color, border };
    document.getElementById('modalHeading').textContent = `${logo} Join ${clanName} Clan`;
    document.getElementById('clanNameInput').value = '';
    document.getElementById('modalStep1').classList.remove('hidden');
    document.getElementById('modalStep2').classList.add('hidden');
    document.getElementById('clanModalBg').classList.add('open');
    setTimeout(() => document.getElementById('clanNameInput').focus(), 380);
  }

  function closeClanModal() {
    document.getElementById('clanModalBg').classList.remove('open');
  }

  function generateClanId() {
    const name = document.getElementById('clanNameInput').value.trim();
    if (!name) { toast('⚠', 'Please enter your adventurer name!'); return; }

    const { clanName, logo, color, border } = activeClan;
    const idNum = 'FF-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + (Math.floor(Math.random() * 9000) + 1000);
    const date  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const rankMap = { Dragon: 'Dragon Master Initiate', Unicorn: 'Enchanter Novice', Wolf: 'Pack Scout', Griffin: 'Sentinel Cadet' };
    const rank = rankMap[clanName] || 'Adventurer';

    const cardEl = document.getElementById('clanIdCard');
    cardEl.innerHTML = `
      <div class="id-card" style="border-color:${border}" id="theIdCard">
        <div class="id-shine"></div>
        <div class="id-banner" style="background:${color}22;color:${color};border:1px solid ${border}">
          ✦ FANTASY BEAST CLUB ✦
        </div>
        <span class="id-logo">${logo}</span>
        <div class="id-clan-name" style="color:${color};text-shadow:0 0 14px ${color}88">${clanName} Clan</div>
        <div class="id-member-name">${esc(name)}</div>
        <div class="id-number">ID: ${idNum}</div>
        <div class="id-rank" style="background:${color}22;color:${color};border:1px solid ${border}">${rank}</div>
        <div class="id-guild-mark">⚜</div>
        <div class="id-footer">Fantasy Feast Guild &nbsp;·&nbsp; <span>Joined ${date}</span></div>
      </div>
    `;

    document.getElementById('modalStep1').classList.add('hidden');
    document.getElementById('modalStep2').classList.remove('hidden');
    toast(logo, `Welcome to the ${clanName} Clan, ${esc(name)}!`, 'ID Generated!');

    // Auto-fill membership form clan
    const regClan = document.getElementById('regClan');
    if (regClan) regClan.value = clanName;
  }

  function printClanId() {
    const card = document.getElementById('theIdCard');
    if (!card) return;
    const w = window.open('', '_blank', 'width=520,height=680');
    w.document.write(`<!DOCTYPE html><html><head><title>Fantasy Beast Club ID</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700&display=swap" rel="stylesheet">
      <style>
        body{margin:0;padding:3rem;background:#060410;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Cinzel',serif}
        *{box-sizing:border-box}
        .id-card{background:linear-gradient(135deg,#0d0825,#1a1042,#0a0d22);border:2px solid;border-radius:16px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden;max-width:380px;width:100%}
        .id-card::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,.012) 10px,rgba(255,255,255,.012) 11px)}
        .id-banner{display:inline-block;font-size:.6rem;font-weight:700;letter-spacing:.28em;padding:.25rem .9rem;border-radius:20px;margin-bottom:1rem;position:relative;z-index:1}
        .id-logo{display:block;font-size:4rem;margin-bottom:.5rem;position:relative;z-index:1}
        .id-clan-name{font-family:'Cinzel Decorative',cursive;font-size:1.1rem;margin-bottom:.3rem;position:relative;z-index:1}
        .id-member-name{font-family:'Cinzel',serif;font-size:1.5rem;font-weight:700;color:#f0c842;letter-spacing:.06em;margin-bottom:.4rem;text-shadow:0 0 12px rgba(240,200,66,.45);position:relative;z-index:1}
        .id-number{font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.22em;color:#5a4a30;margin-bottom:.85rem;position:relative;z-index:1}
        .id-rank{display:inline-block;font-family:'Cinzel',serif;font-size:.62rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;padding:.25rem .85rem;border-radius:4px;margin-bottom:1rem;position:relative;z-index:1}
        .id-guild-mark{font-size:1.8rem;margin-bottom:.6rem;position:relative;z-index:1}
        .id-footer{font-family:'Cinzel',serif;font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:#5a4a30;position:relative;z-index:1}
        @media print{body{background:#fff;padding:1rem}.id-card{border-color:#000!important;background:#fff!important}.id-member-name,.id-clan-name{color:#000!important;text-shadow:none!important}}
      </style>
    </head><body>${card.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }

  /* ═══════════════════════════════════════════════════════════
     13. GUILD REGISTRATION FORM
  ═══════════════════════════════════════════════════════════ */
  function registerGuild() {
    const user     = document.getElementById('regUser').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const clan     = document.getElementById('regClan').value;
    const pass     = document.getElementById('regPass').value;

    if (!user)                         { toast('⚠', 'Please enter your adventurer name!');       return; }
    if (!email || !email.includes('@')){ toast('⚠', 'Please enter a valid email address!');      return; }
    if (!clan)                         { toast('⚠', 'Please choose your beast clan!');           return; }
    if (pass.length < 8)               { toast('⚠', 'Passphrase must be at least 8 characters!'); return; }

    const icons = { Dragon: '🐉', Unicorn: '🦄', Wolf: '🐺', Griffin: '🦅' };
    toast(icons[clan] || '⚜', `Welcome to the Guild, ${esc(user)}! Rank: Adventurer ✦ Clan: ${clan}`, '⚜ Registered!');

    // Show user in nav
    const navUser = document.getElementById('navUser');
    const navAvatar = document.getElementById('navAvatar');
    const navUserName = document.getElementById('navUserName');
    if (navUser) {
      navAvatar.textContent  = user.charAt(0).toUpperCase();
      navUserName.textContent = user;
      navUser.style.display = 'flex';
    }

    // Clear form
    ['regUser', 'regEmail', 'regCreature', 'regPass'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('regClan').value = '';
    document.getElementById('strengthFill').style.width = '0';
    document.getElementById('strengthLabel').textContent = '';
  }

  /* ═══════════════════════════════════════════════════════════
     14. PASSWORD STRENGTH METER
  ═══════════════════════════════════════════════════════════ */
  function togglePass() {
    const input = document.getElementById('regPass');
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  }

  function initPasswordStrength() {
    const input = document.getElementById('regPass');
    if (!input) return;
    input.addEventListener('input', () => {
      const v = input.value;
      const fill  = document.getElementById('strengthFill');
      const label = document.getElementById('strengthLabel');
      if (!fill || !label) return;
      let score = 0;
      if (v.length >= 8)  score++;
      if (v.length >= 12) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const configs = [
        { w: '0%',   bg: 'transparent', text: '' },
        { w: '25%',  bg: '#cc3a00',     text: 'Weak' },
        { w: '50%',  bg: '#cc8a00',     text: 'Fair' },
        { w: '75%',  bg: '#4a9eff',     text: 'Good' },
        { w: '100%', bg: '#4aca64',     text: 'Strong ✓' },
      ];
      const cfg = configs[Math.min(score, 4)];
      fill.style.width = v.length > 0 ? cfg.w : '0%';
      fill.style.background = cfg.bg;
      label.textContent = v.length > 0 ? cfg.text : '';
    });
  }

  /* ═══════════════════════════════════════════════════════════
     15. CLAN STAT BARS ANIMATION
  ═══════════════════════════════════════════════════════════ */
  function animateClanBars() {
    document.querySelectorAll('.cs-fill').forEach(fill => {
      const target = fill.style.width;
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = target; }, 300);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     16. COUNTER ANIMATION (Home stats)
  ═══════════════════════════════════════════════════════════ */
  function animateCounters() {
    if (countAnimated) return;
    countAnimated = true;
    document.querySelectorAll('.hs-num[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 1800;
      const steps = 60;
      const step = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current >= target) clearInterval(timer);
      }, duration / steps);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     17. NEWS TICKER
  ═══════════════════════════════════════════════════════════ */
  function initTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    // Duplicate items for seamless loop
    const clone = track.innerHTML + track.innerHTML;
    track.innerHTML = clone;
  }

  /* ═══════════════════════════════════════════════════════════
     18. MODAL CLOSE ON BACKDROP CLICK + ESCAPE
  ═══════════════════════════════════════════════════════════ */
  function initModalClose() {
    const bg = document.getElementById('clanModalBg');
    if (bg) bg.addEventListener('click', e => { if (e.target === bg) closeClanModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeClanModal();
        closeSearch();
      }
    });
    // Enter key in clan name input
    const cni = document.getElementById('clanNameInput');
    if (cni) cni.addEventListener('keydown', e => { if (e.key === 'Enter') generateClanId(); });
  }

  /* ═══════════════════════════════════════════════════════════
     19. INTERSECTION OBSERVER — trigger counter on home view
  ═══════════════════════════════════════════════════════════ */
  function initObservers() {
    const stats = document.querySelector('.hero-stats');
    if (!stats) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) animateCounters();
    }, { threshold: 0.5 });
    obs.observe(stats);
  }

  /* ═══════════════════════════════════════════════════════════
     UTILITY
  ═══════════════════════════════════════════════════════════ */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ═══════════════════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initCanvas();
    initHeroParticles();
    initCursorOrb();
    initTilt();
    initSearch();
    initGameFilters();
    initCharCounter();
    initPasswordStrength();
    initModalClose();
    initObservers();
    initTicker();

    // Ensure home is active
    const home = document.getElementById('page-home');
    if (home) { home.style.display = 'flex'; home.style.opacity = '1'; home.style.transform = 'none'; }

    // Animate counters if visible immediately
    setTimeout(animateCounters, 600);

    console.log('%c⚜ Fantasy Feast Loaded ⚜', 'color:#f0c842;font-family:serif;font-size:16px;font-weight:bold;text-shadow:0 0 8px rgba(240,200,66,.6)');
  });

  /* Public API */
  return { go, toast, toggleSearch, closeSearch, postIdea, sortIdeas, likeIdea, addToCart, checkout, openClanModal, closeClanModal, generateClanId, printClanId, registerGuild, togglePass };

})();
