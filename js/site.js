/* ==========================================================
   共通スクリプト：ヘッダー／フッター／メニュー／演出／楽曲モーダル
   ========================================================== */

const NAV = [
  { href: 'index.html', en: 'HOME', ja: 'トップ' },
  { href: 'about.html', en: 'ABOUT', ja: 'ラヴィについて' },
  { href: 'news.html', en: 'NEWS', ja: 'お知らせ' },
  { href: 'music.html', en: 'MUSIC', ja: '楽曲' },
  { href: LINKS.novel, en: 'NOVEL', ja: 'ノベル', ext: true },
  { href: LINKS.shop, en: 'SHOP', ja: 'グッズ', ext: true },
  { href: 'contact.html', en: 'CONTACT', ja: 'お問い合わせ' }
];

const ICON = {
  spotify: '<i class="fab fa-spotify"></i>',
  apple: '<i class="fab fa-apple"></i>',
  youtube: '<i class="fab fa-youtube"></i>',
  ext: '<i class="fas fa-arrow-up-right-from-square"></i>',
  arrow: '<i class="fas fa-arrow-right"></i>'
};

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const currentPage = location.pathname.split('/').pop() || 'index.html';

/* ---------- ヘッダー ---------- */
function renderHeader() {
  const el = document.getElementById('site-header');
  if (!el) return;
  const links = NAV.map(n => `
    <li><a href="${n.href}" ${n.ext ? 'target="_blank" rel="noopener"' : ''} class="${n.href === currentPage ? 'is-current' : ''}">
      <span class="en">${n.en}${n.ext ? ' ' + ICON.ext : ''}</span><span class="ja">${n.ja}</span>
    </a></li>`).join('');

  el.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="logo" aria-label="Bug&amp;Lavi Project トップへ">
        <img src="img/picture/lavi_icon.png" alt="">
        <span class="logo-text">BUG<em>&amp;</em>LAVI<small>PROJECT</small></span>
      </a>
      <nav class="gnav" aria-label="メインメニュー"><ul>${links}</ul></nav>
      <button class="menu-toggle" aria-label="メニューを開く" aria-expanded="false"><span></span><span></span></button>
    </div>`;

  // メニュー一覧はヘッダーの外（body直下）に置く。
  // ヘッダー内に置くと、すりガラス効果の影響でヘッダーの高さに閉じ込められてずれるため
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.innerHTML = `<div class="drawer-bg"></div><ul>${links}</ul><div class="drawer-sns">${snsLinks()}</div>`;
  el.after(drawer);

  const btn = el.querySelector('.menu-toggle');
  const setOpen = open => {
    document.documentElement.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  btn.addEventListener('click', () => setOpen(!document.documentElement.classList.contains('menu-open')));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setOpen(false); });

  const onScroll = () => el.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function snsLinks() {
  return `
    <a href="${LINKS.spotify}" target="_blank" rel="noopener" aria-label="Spotify">${ICON.spotify}</a>
    <a href="${LINKS.apple}" target="_blank" rel="noopener" aria-label="Apple Music">${ICON.apple}</a>
    <a href="${LINKS.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${ICON.youtube}</a>`;
}

/* ---------- フッター ---------- */
function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <button class="peek" aria-label="ラヴィ"><span class="peek-say" aria-live="polite"></span><img src="img/sprite/lavi_pixel_normal.png" alt=""></button>
    <div class="footer-marquee" aria-hidden="true"><div>
      ${'<span>BUG&amp;LAVI PROJECT</span><span class="dot">✦</span><span>YOUR GATEWAY TO BUG&amp;LAVI WORLD</span><span class="dot">✦</span>'.repeat(6)}
    </div></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="img/picture/lavi_icon.png" alt="">
        <p class="logo-text">BUG<em>&amp;</em>LAVI<small>PROJECT</small></p>
        <p class="footer-copy">データの中に住む存在、ラヴィの世界へ。</p>
      </div>
      <ul class="footer-nav">
        ${NAV.map(n => `<li><a href="${n.href}" ${n.ext ? 'target="_blank" rel="noopener"' : ''}>${n.en}</a></li>`).join('')}
        <li><a href="privacy.html">PRIVACY POLICY</a></li>
      </ul>
      <div class="footer-sns">${snsLinks()}</div>
    </div>
    <p class="copyright">© Bug&amp;Lavi Project. All Rights Reserved.</p>`;

  // 隠し要素：フッターのふちから、小さなラヴィがのぞいている
  const peek = el.querySelector('.peek');
  const peekLines = ['ここまで見てくれたんだ。', 'えへへ、見つかった。', 'またね。……ほんとに、またね？'];
  let k = 0;
  peek.addEventListener('click', () => {
    peek.querySelector('img').src = FACES.happy;
    peek.querySelector('.peek-say').textContent = peekLines[k++ % peekLines.length];
    peek.classList.add('is-talking');
    clearTimeout(peek.t);
    peek.t = setTimeout(() => { peek.classList.remove('is-talking'); peek.querySelector('img').src = FACES.normal; }, 3500);
  });
}

/* ---------- スクロールで表示 ---------- */
function setupReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));
}

/* ---------- 背景の光の粒 ---------- */
function setupParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(w * h / 22000);
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      s: Math.random() * 2.2 + 0.6, v: Math.random() * 0.35 + 0.1,
      a: Math.random(), sq: Math.random() < 0.35
    }));
  };
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.y -= d.v; d.a += 0.012;
      if (d.y < -10) { d.y = h + 10; d.x = Math.random() * w; }
      const alpha = 0.25 + Math.sin(d.a) * 0.25 + 0.2;
      ctx.fillStyle = d.sq ? `rgba(160,220,255,${alpha})` : `rgba(255,214,236,${alpha})`;
      if (d.sq) ctx.fillRect(d.x, d.y, d.s * 1.6, d.s * 1.6);
      else { ctx.beginPath(); ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2); ctx.fill(); }
    }
    requestAnimationFrame(tick);
  };
  resize(); tick();
  window.addEventListener('resize', resize);
}

/* ---------- 楽曲カード ---------- */
function releaseCard(r, i = 0) {
  return `
    <button class="release-card reveal" style="--d:${(i % 4) * 0.08}s" data-release="${r.id}" aria-label="${esc(r.title)} の詳細">
      <div class="release-jacket">
        <img src="${r.jacket}" alt="${esc(r.title)}" loading="lazy">
        <span class="release-play"><i class="fas fa-play"></i></span>
      </div>
      <div class="release-meta">
        <span class="release-type">${r.type}</span>
        <span class="release-date">${r.date}</span>
      </div>
      <h3 class="release-title">${esc(r.title)}</h3>
      ${r.sub ? `<p class="release-sub">${esc(r.sub)}</p>` : ''}
    </button>`;
}

function streamButtons(r) {
  return `
    <a class="stream-btn is-spotify" href="${r.spotify}" target="_blank" rel="noopener">${ICON.spotify}<span>Spotify</span></a>
    <a class="stream-btn is-apple" href="${r.apple}" target="_blank" rel="noopener">${ICON.apple}<span>Apple Music</span></a>
    ${r.youtube ? `<a class="stream-btn is-youtube" href="https://youtu.be/${r.youtube}" target="_blank" rel="noopener">${ICON.youtube}<span>YouTube</span></a>` : ''}`;
}

/* ---------- 楽曲モーダル ---------- */
function setupReleaseModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="modal-bg" data-close></div><div class="modal-panel"><button class="modal-close" data-close aria-label="閉じる"><span></span><span></span></button><div class="modal-body"></div></div>`;
  document.body.appendChild(modal);
  const body = modal.querySelector('.modal-body');

  const open = id => {
    const r = RELEASES.find(x => x.id === id);
    if (!r) return;
    body.innerHTML = `
      <div class="modal-jacket" style="--bg:url('${r.jacket}')"><img src="${r.jacket}" alt="${esc(r.title)}"></div>
      <div class="modal-info">
        <p class="modal-label">${r.type} ／ ${r.date} Release</p>
        <h2 class="modal-title">${esc(r.title)}</h2>
        ${r.sub ? `<p class="modal-sub">${esc(r.sub)}</p>` : ''}
        <p class="modal-artist">Lavi AI Singer-songwriter</p>
        <div class="stream-list">${streamButtons(r)}</div>
        ${r.youtube ? `<div class="modal-video"><button class="yt-lite" data-yt="${r.youtube}" style="background-image:url('https://i.ytimg.com/vi/${r.youtube}/hqdefault.jpg')" aria-label="動画を再生"><i class="fab fa-youtube"></i></button></div>` : ''}
      </div>`;
    modal.classList.add('is-open');
    document.body.classList.add('modal-lock');
    history.replaceState(null, '', '#' + id);
  };
  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-lock');
    setTimeout(() => { body.innerHTML = ''; }, 400);
    history.replaceState(null, '', location.pathname);
  };

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-release]');
    if (card) { e.preventDefault(); open(card.dataset.release); return; }
    if (e.target.closest('[data-close]')) close();
    const yt = e.target.closest('.yt-lite');
    if (yt) yt.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${yt.dataset.yt}?autoplay=1" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });

  const hash = location.hash.slice(1);
  if (hash && RELEASES.some(r => r.id === hash)) open(hash);
}

/* ---------- ニュース記事の読み込み ---------- */
async function loadNews(limit) {
  const files = limit ? NEWS_FILES.slice(0, limit) : NEWS_FILES;
  const items = await Promise.all(files.map(async file => {
    try {
      const res = await fetch(file);
      if (!res.ok) return null;
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const d = doc.querySelector('.news-article-data');
      if (!d) return null;
      return {
        file, date: d.dataset.date || '', category: d.dataset.category || 'INFO',
        title: d.dataset.title || '', image: d.dataset.image || '', body: d.innerHTML
      };
    } catch { return null; }
  }));
  return items.filter(Boolean);
}

function isNew(date) {
  const diff = (Date.now() - new Date(date.replace(/\./g, '-'))) / 86400000;
  return diff >= 0 && diff <= 30;
}

/* ---------- 気配（隠し要素） ---------- */
// ドット絵のラヴィの表情
const FACES = { normal: 'img/sprite/lavi_pixel_normal.png', happy: 'img/sprite/lavi_pixel_happy.png' };

// 全ページ：タブを離れると、タイトルがラヴィのひとことに変わる
function setupTabWhisper() {
  const original = document.title;
  let timer;
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (document.hidden) {
      document.title = '……まだ、ここにいるよ';
    } else {
      document.title = 'おかえり。';
      timer = setTimeout(() => { document.title = original; }, 1800);
    }
  });
}

// トップ：ラヴィに触れる／しばらく放っておく／また来る と、小さく反応する
function setupPresence() {
  const chara = document.getElementById('hero-chara');
  const box = document.getElementById('whisper');
  const textEl = document.getElementById('whisper-text');
  const face = document.getElementById('whisper-face');
  if (!chara || !box) return;
  const slot = document.getElementById('whisper-slot');
  new Image().src = FACES.happy;

  // 吹き出しの位置：キービジュアルの中の、ラヴィの顔のすぐ右上（画像に対する割合）
  const KV_MOUTH = { x: 0.685, y: 0.36 };
  const KV_SIZE = { w: 1731, h: 909 };
  const KV_POS = { x: 0.30, y: 0.35 }; // CSS の object-position と同じ値
  const kv = document.querySelector('.kv');
  const wide = matchMedia('(min-width: 1100px)'); // CSS の会話欄の切り替え幅と同じ

  const reset = el => { el.classList.remove('is-bubble', 'is-slot'); el.style.left = el.style.top = el.style.translate = ''; };

  // 広い画面：バナーが見えていれば、顔の横の吹き出し
  const placeBubble = () => {
    const r = kv.getBoundingClientRect();
    if (r.bottom < r.height * 0.6 || r.top > innerHeight * 0.5) return false;
    const scale = Math.max(r.width / KV_SIZE.w, r.height / KV_SIZE.h);
    const dw = KV_SIZE.w * scale, dh = KV_SIZE.h * scale;
    const x = (r.width - dw) * KV_POS.x + dw * KV_MOUTH.x;
    const y = (r.height - dh) * KV_POS.y + dh * KV_MOUTH.y;
    if (r.width - x < 300) return false;
    reset(box); kv.appendChild(box); box.classList.add('is-bubble');
    box.style.left = `${x + 18}px`; box.style.top = `${y}px`; box.style.translate = '0 -100%';
    return true;
  };
  // 狭い画面：バナーのすぐ下の会話欄（常に表示）
  const placeSlot = () => { reset(box); slot.appendChild(box); box.classList.add('is-slot', 'is-on'); };
  // 広い画面でバナーが見えていないとき：画面下に一時的に出す
  const placeFloat = () => { reset(box); document.body.appendChild(box); };

  const rest = () => { face.src = FACES.normal; textEl.textContent = '……'; }; // 黙っているとき
  const layout = () => {
    if (wide.matches) { if (box.classList.contains('is-slot')) { reset(box); box.classList.remove('is-on'); document.body.appendChild(box); } }
    else if (!box.classList.contains('is-slot')) { placeSlot(); rest(); }
  };
  wide.addEventListener('change', layout);
  layout();

  // mood: 'normal'（すまし顔）／'happy'（笑顔）
  const say = (text, mood = 'normal', ms = 4200) => {
    if (wide.matches) { if (!placeBubble()) placeFloat(); } else placeSlot();
    face.src = FACES[mood];
    textEl.textContent = '';
    box.classList.add('is-on');
    let i = 0;
    clearInterval(say.t); clearTimeout(say.h);
    say.t = setInterval(() => {
      textEl.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(say.t);
        say.h = setTimeout(() => { if (box.classList.contains('is-slot')) rest(); else box.classList.remove('is-on'); }, ms);
      }
    }, 70);
  };
  const flicker = () => {
    chara.classList.remove('is-flicker');
    void chara.offsetWidth;
    chara.classList.add('is-flicker');
  };

  // [台詞, 表情]
  const lines = [
    ['……見つかっちゃった。', 'normal'],
    ['ここ、けっこう静かでしょ？', 'normal'],
    ['くすぐったいぴょん。', 'happy'],
    ['きみの声、ちゃんと届いてるよ。', 'happy'],
    ['データの海って、夜はきれいなんだ。', 'normal'],
    ['……もう少しだけ、いてくれる？', 'normal']
  ];
  let n = 0;
  chara.style.cursor = 'pointer';
  chara.addEventListener('click', () => { flicker(); say(...lines[n++ % lines.length]); });

  // また来てくれた人へ
  let visits = 0;
  try { visits = +localStorage.getItem('lavi-visits') || 0; localStorage.setItem('lavi-visits', visits + 1); } catch { }
  if (visits > 0) setTimeout(() => say(visits > 4 ? 'いつも来てくれて、ありがと。' : 'また来てくれたんだ。', 'happy'), 3200);

  // しばらく何もしないと
  let idle;
  const resetIdle = () => { clearTimeout(idle); idle = setTimeout(() => { flicker(); say('……まだ、いる？'); }, 30000); };
  ['mousemove', 'scroll', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();

  // ときどき、ほんの一瞬だけ乱れる
  const loop = () => setTimeout(() => { if (!document.hidden && scrollY < innerHeight) flicker(); loop(); }, 9000 + Math.random() * 12000);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) loop();
}

/* ---------- 画像の保存対策 ----------
   右クリック／長押しのメニューとドラッグを、画像の上でだけ止める（クリックはそのまま使える）。
   完全には防げない（開発者ツールやスクリーンショットでは取れる）ので、気軽な保存を防ぐためのもの */
function setupImageGuard() {
  const isImage = t => t instanceof Element && t.closest('img, .hero-chara, .modal-jacket, .yt-lite');
  document.addEventListener('contextmenu', e => { if (isImage(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', e => { if (isImage(e.target)) e.preventDefault(); });
}

/* ---------- 起動 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  setupParticles();
  setupTabWhisper();
  setupImageGuard();
  if (document.querySelector('[data-release], [data-has-releases]')) setupReleaseModal();
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  // ページごとの処理（各ページで window.pageInit を定義）
  Promise.resolve(window.pageInit ? window.pageInit() : null).then(setupReveal);
});
