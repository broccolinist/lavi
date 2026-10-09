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
  // 配信サービスのマークは各社の公式素材だけを使う（形・色を変えない）→ Knowledge/apple-music-badge-guidelines
  spotify: '<img class="brand-icon" src="img/brand/spotify-icon-white.svg" alt="">',
  apple: '<img class="brand-icon" src="img/brand/apple-music-icon-white.svg" alt="">',
  youtube: '<img class="brand-icon is-wide" src="img/brand/youtube-icon-white.png" alt="">',
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
        <img src="img/logo/logo-horizontal-600.png" alt="Bug&amp;Lavi Project" class="logo-img" width="600" height="200">
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
    <button class="peek" aria-label="ラヴィ"><img src="img/sprite/lavi_pixel_normal.png" alt=""></button>
    <div class="footer-marquee" aria-hidden="true"><div>
      ${'<span>BUG&amp;LAVI PROJECT</span><span class="dot">✦</span><span>YOUR GATEWAY TO BUG&amp;LAVI WORLD</span><span class="dot">✦</span>'.repeat(6)}
    </div></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="img/logo/logo-horizontal-1200.png" alt="Bug&amp;Lavi Project" class="footer-logo" width="1200" height="400">
        <p class="footer-copy" aria-live="polite">データの中に住む存在、ラヴィの世界へ。</p>
      </div>
      <ul class="footer-nav">
        ${NAV.map(n => `<li><a href="${n.href}" ${n.ext ? 'target="_blank" rel="noopener"' : ''}>${n.en}${n.ext ? ' ' + ICON.ext : ''}</a></li>`).join('')}
        <li><a href="privacy.html">PRIVACY POLICY</a></li>
      </ul>
      <div class="footer-sns">${snsLinks()}</div>
    </div>
    <p class="copyright">© Bug&amp;Lavi Project. All Rights Reserved.<small>Apple and Apple Music are trademarks of Apple Inc., registered in the U.S. and other countries</small></p>`;

  // 隠し要素：フッターのふちから小さなラヴィがのぞいている。
  // フッターにたどりついたとき／ラヴィを押したとき、キャッチコピーが一瞬乱れてラヴィの言葉に変わる
  const peek = el.querySelector('.peek');
  const copy = el.querySelector('.footer-copy');
  const COPY = copy.textContent;
  const peekLines = ['ここまで見てくれたんだ。', 'えへへ、見つかっちゃった。', 'またね。'];
  const NOISE = 'アイウエオカキクケコサシスセソ01█▓▒░#@*';
  let k = 0;

  // 文字を左から順に、乱れた文字を経由して別の文に置き換える
  const scramble = (to, done) => {
    clearInterval(copy.t);
    const from = copy.textContent;
    const len = Math.max(from.length, to.length);
    let frame = 0;
    copy.t = setInterval(() => {
      frame++;
      let out = '';
      for (let i = 0; i < len; i++) {
        const settle = i * 1.2 + 6;
        if (frame >= settle) out += to[i] || '';
        else if (frame >= settle - 6) out += NOISE[Math.floor(Math.random() * NOISE.length)];
        else out += from[i] || '';
      }
      copy.textContent = out;
      if (frame >= len * 1.2 + 6) { clearInterval(copy.t); copy.textContent = to; done && done(); }
    }, 40);
  };

  const talk = () => {
    peek.querySelector('img').src = FACES.happy;
    peek.classList.add('is-talking');
    copy.classList.add('is-lavi');
    clearTimeout(peek.t);
    // 言葉が出そろってから3秒見せて、元のキャッチコピーに戻す
    scramble(peekLines[k++ % peekLines.length], () => {
      peek.t = setTimeout(() => {
        scramble(COPY, () => copy.classList.remove('is-lavi'));
        peek.classList.remove('is-talking');
        peek.querySelector('img').src = FACES.normal;
      }, 3000);
    });
  };
  peek.addEventListener('click', talk);

  // フッターに最初にたどりついたとき、一度だけ
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { io.disconnect(); setTimeout(talk, 900); }
    }, { threshold: 0.6 });
    io.observe(copy);
  }
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
        <span class="release-type">${r.tracks} TRACK${r.tracks > 1 ? 'S' : ''}</span>
        <span class="release-date">${r.date}</span>
      </div>
      <h3 class="release-title">${esc(r.title)}</h3>
      ${r.sub ? `<p class="release-sub">${esc(r.sub)}</p>` : ''}
    </button>`;
}

// 配信ボタン：Apple は公式バッジ。Spotify・YouTube は公式アイコン（カラー）を黒地に置き、Apple のバッジと体裁をそろえる
const BADGE = {
  spotify: url => `<a class="listen-badge" href="${url}" target="_blank" rel="noopener"><img src="img/brand/spotify-icon-green.svg" alt="" class="lb-icon"><span class="lb-text"><b>Spotify</b><small>で聴く</small></span></a>`,
  apple: url => `<a class="am-badge" href="${url}" target="_blank" rel="noopener"><img src="img/brand/apple-music-badge-ja.svg" alt="Apple Music で聴く" width="140" height="40"></a>`,
  youtube: url => `<a class="listen-badge" href="${url}" target="_blank" rel="noopener"><img src="img/brand/youtube-icon-red.png" alt="" class="lb-icon is-wide"><span class="lb-text"><b>YouTube</b><small>で聴く</small></span></a>`
};

// 並び順は Apple Music を先頭に（Apple のガイドライン 1.3）
function streamButtons(r) {
  return `
    ${r.apple ? BADGE.apple(r.apple) : ''}
    ${r.spotify ? BADGE.spotify(r.spotify) : ''}
    ${r.youtube ? BADGE.youtube(`https://youtu.be/${r.youtube}`) : ''}`;
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
        <p class="modal-label">${r.date} Release ／ ${r.tracks}曲</p>
        <h2 class="modal-title">${esc(r.title)}</h2>
        ${r.sub ? `<p class="modal-sub">${esc(r.sub)}</p>` : ''}
        <p class="modal-artist">Lavi AI singer-songwriter</p>
        <div class="stream-list">${streamButtons(r)}</div>
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

/* ---------- 楽曲データの読み込み ----------
   js/releases.json（GitHub Actions が毎日 Apple Music と YouTube の公開フィードから更新）に、
   data.js の RELEASES に手で書いた情報（Spotify のリンクなど）を上書きで重ねる。
   読めなければ data.js の RELEASES をそのまま使う */
async function loadReleases() {
  try {
    const res = await fetch(`js/releases.json?t=${Date.now()}`);
    if (!res.ok) return;
    const auto = await res.json();
    const appleId = url => (url || '').match(/(\d+)\/?$/)?.[1];
    const manual = a => RELEASES.find(m => appleId(m.apple) && appleId(m.apple) === appleId(a.apple))
      || RELEASES.find(m => newsKey(m.title) === newsKey(a.title)) || {};
    if (auto.length) RELEASES = auto.map(a => ({ ...a, ...manual(a) }));
  } catch { /* 予備の RELEASES を使う */ }
}

/* ---------- ニュース（js/news.js） ---------- */
// 作品名の表記ゆれ（全角・半角、記号、大文字小文字）を無視して比べる
function newsKey(s) { return (s || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''); }

async function loadNews(limit) {
  const list = limit ? NEWS.slice(0, limit) : NEWS;
  return list.map(n => {
    const r = n.release && RELEASES.find(x => newsKey(x.title) === newsKey(n.release));
    const links = r ? `<div class="stream-list">${streamButtons(r)}</div>` : '';
    // 楽曲の記事で画像が空なら、その作品のジャケットを自動で使う
    const image = n.image || (r && r.jacket) || '';
    return { ...n, image, category: n.category || 'INFO', body: `<p>${n.body.trim().replace(/\n/g, '<br>')}</p>${links}` };
  });
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

  // 吹き出しの位置：キービジュアルの中の、ラヴィの肩の少し上（画像に対する割合）
  const KV_MOUTH = { x: 0.715, y: 0.58 }; // 肩の少し上
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
  // 狭い画面：バナーのすぐ下の会話欄（ラヴィを押したときだけ開く）
  const placeSlot = () => { if (box.parentElement !== slot) { reset(box); slot.appendChild(box); } box.classList.add('is-slot'); };
  // 広い画面でバナーが見えていないとき：画面下に一時的に出す
  const placeFloat = () => { reset(box); document.body.appendChild(box); };

  const layout = () => {
    slot.classList.remove('is-open'); box.classList.remove('is-on');
    if (wide.matches) placeFloat();
    else placeSlot();
  };
  wide.addEventListener('change', layout);
  layout();

  // mood: 'normal'（すまし顔）／'happy'（笑顔）
  // auto: 押されていないのに話す台詞。狭い画面では会話欄を勝手に開かないよう、出さない
  const say = (text, mood = 'normal', { auto = false, ms = 4200 } = {}) => {
    if (auto && !wide.matches) return;
    if (wide.matches) { if (!placeBubble()) placeFloat(); } else { placeSlot(); slot.classList.add('is-open'); }
    face.src = FACES[mood];
    textEl.textContent = '';
    box.classList.add('is-on');
    let i = 0;
    clearInterval(say.t); clearTimeout(say.h);
    say.t = setInterval(() => {
      textEl.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(say.t);
        say.h = setTimeout(() => { box.classList.remove('is-on'); slot.classList.remove('is-open'); }, ms);
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
  if (visits > 0) setTimeout(() => say(visits > 4 ? 'いつも来てくれて、ありがと。' : 'また来てくれたんだ。', 'happy', { auto: true }), 3200);

  // しばらく何もしないと
  let idle;
  const resetIdle = () => { clearTimeout(idle); idle = setTimeout(() => { flicker(); say('……まだ、いる？', 'normal', { auto: true }); }, 30000); };
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

/* ---------- 奥行きと区切り（トップ） ----------
   区画（data-world と STORY）に、背景・巨大な英字・切り替わりの帯・漂う粒を足す。見た目は style.css の「奥行きと区切り」 */
// 帯に流す文字：ラヴィが言いそうなことを、プログラムの形で書いたもの（区画ごとに3つ。文を変えるときはここだけ直す）
const BAND_CODES = {
  music: ['lavi.sing("きみに届くまで");', 'while (listening) { 歌う(); }', 'volume = "ちょうどいい";'],
  story: ['if (world.isEmpty) { lavi.wakeUp(); }', 'lavi.status = "UNRELEASED";  // それでも、ここにいる', 'return "ただいま";'],
  video: ['screen.on();  // ちゃんと見えてる？', 'lavi.show(きみ);', 'await 目が合うまで();'],
  shorts: ['for (ちょっとだけ) { lavi.peek(); }', 'sleep(0);  // まだ起きてるよ', 'lavi.wave("またね");'],
};

function setupDepth() {
  /* ---------- 区画に部品を足す（背景・巨大な英字・切り替わりの帯） ---------- */
  const worlds = [...document.querySelectorAll('[data-world], .home .story')];
  if (!worlds.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  worlds.forEach(sec => {
    const en = sec.querySelector('.section-title .en')?.textContent.trim() || '';
    const num = sec.querySelector('.section-title .num')?.textContent.trim() || '';

    const ghost = document.createElement('p');
    ghost.className = 'dp-ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.textContent = en;
    if (sec.matches('.story')) sec.prepend(ghost);   // STORY はもとから背景の絵を持っているので、英字だけ足す
    else {
      const bg = document.createElement('div');
      bg.className = 'dp-bg'; bg.append(ghost); sec.prepend(bg);
    }

    // NEWS の上には、もとから流れる文字（ティッカー）があるので帯は足さない
    if (sec.dataset.world !== 'news') {
      const band = document.createElement('div');
      band.className = 'dp-band'; band.setAttribute('aria-hidden', 'true');
      const codes = BAND_CODES[sec.dataset.world || 'story'] || [];
      const line = `<span>// <b>${num}</b> ${en}</span><span>✦</span>` + codes.map(c => `<span>${esc(c)}</span><span>✦</span>`).join('');
      band.innerHTML = `<div class="dp-band-track">${line.repeat(8)}</div>`;
      sec.before(band);
    }
  });

  /* ---------- 区画に入った瞬間の「切り替わり」 ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.remove('is-cut');
      void en.target.offsetWidth;                    // 何度でも再生できるように、いったん外してから付け直す
      en.target.classList.add('is-cut');
    }), { rootMargin: '0px 0px -55% 0px' });
    worlds.forEach(sec => io.observe(sec));
  }

  /* ---------- スクロールに合わせた速度差（巨大な英字・トップの絵） ---------- */
  const kv = document.querySelector('.kv');
  let ticking = false;
  function update() {
    ticking = false;
    if (reduce) return;
    const vh = innerHeight;
    worlds.forEach(sec => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const off = (r.top + r.height / 2) - vh / 2;   // 区画の中心が、画面の中心からどれだけずれているか
      sec.style.setProperty('--py', `${(off * -0.22).toFixed(1)}px`);
    });
    if (kv) {
      const y = Math.min(scrollY, kv.offsetHeight);
      kv.style.setProperty('--kv-y', `${(y * 0.28).toFixed(1)}px`);
      kv.style.setProperty('--kv-s', (1 + y * 0.00018).toFixed(4));
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);

  /* ---------- ページ全体に漂う粒（奥・中・手前の3層。スクロールすると層ごとに違う速さで流れる） ---------- */
  const canvas = document.createElement('canvas');
  canvas.id = 'dp-dust'; canvas.setAttribute('aria-hidden', 'true');
  if (!reduce) {
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const LAYERS = [                                  // 奥ほど小さく・遅く・薄い
      { size: [0.6, 1.2], speed: 0.06, scroll: 0.05, alpha: 0.30 },
      { size: [1.0, 2.0], speed: 0.14, scroll: 0.14, alpha: 0.45 },
      { size: [1.8, 3.4], speed: 0.26, scroll: 0.30, alpha: 0.55 },
    ];
    let w, h, dots = [];
    const rand = (a, b) => a + Math.random() * (b - a);
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(w * h / 16000, w < 761 ? 34 : 90));   // スマホは数を減らす
      dots = Array.from({ length: n }, (_, i) => {
        const L = LAYERS[i % 3];
        return { L, x: rand(0, w), y: rand(0, h), s: rand(...L.size), t: rand(0, 6.28), sq: Math.random() < 0.4, pink: Math.random() < 0.4 };
      });
    };
    const tick = () => {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= d.L.speed; d.t += 0.01;
        d.x += Math.sin(d.t) * 0.12;
        const y = (((d.y - scrollY * d.L.scroll) % (h + 20)) + h + 20) % (h + 20) - 10;
        const a = d.L.alpha * (0.6 + Math.sin(d.t * 1.7) * 0.4);
        ctx.fillStyle = d.pink ? `rgba(255,200,230,${a})` : `rgba(170,220,255,${a})`;
        if (d.sq) ctx.fillRect(d.x, y, d.s * 1.5, d.s * 1.5);
        else { ctx.beginPath(); ctx.arc(d.x, y, d.s, 0, 6.283); ctx.fill(); }
      }
    };
    resize(); tick();
    addEventListener('resize', resize);
  }
  update();
}

/* ---------- 隠れキャラ集め ----------
   ノベルの登場人物4人が、ページごとに1人ずつ、部品のふちの向こうから頭だけのぞいている。
   押すと「！」が出て引っ込み、見つけた数（左下。最初の1人を見つけるまでは出さない）に入る。4人そろうとラヴィから一言。
   名前はサイトに出さない決まりなので、番号（1〜4）だけで扱う。見つけた番号は、その人のブラウザに覚えておく */
const FRIENDS = [   // anchor＝この部品の上のふちからのぞく。pos＝左右の位置。inside＝部品の中の先頭に置く（部品の上に余白があるとき）
  { id: 1, page: 'index.html', anchor: '.ticker', pos: 'right:8%' },
  { id: 2, page: 'about.html', anchor: '.qa-list', pos: 'right:4%' },
  { id: 3, page: 'music.html', anchor: '.site-footer', pos: 'left:8%', inside: true },
  { id: 4, page: 'news.html', anchor: '#news-container', pos: 'right:4%' },
];
const QUIET_PAGES = ['contact.html', 'privacy.html'];   // 事務的なページには、キャラの仕掛けを出さない

function setupFriends() {
  if (QUIET_PAGES.includes(currentPage)) return;
  const KEY = 'lavi-friends';
  let found = [];
  try { found = JSON.parse(localStorage.getItem(KEY) || '[]').filter(n => FRIENDS.some(f => f.id === n)); } catch { }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(found)); } catch { } };

  // 見つけた数
  const chip = document.createElement('button');
  chip.type = 'button'; chip.className = 'g-chip'; chip.setAttribute('aria-label', '見つけた数');
  const hint = document.createElement('p');
  hint.className = 'g-hint'; hint.setAttribute('aria-live', 'polite');
  document.body.append(chip, hint);
  const renderChip = justFound => {
    chip.innerHTML = `<span class="g-slots">${FRIENDS.map(f => found.includes(f.id)
      ? `<span class="g-slot${f.id === justFound ? ' is-new' : ''}"><img src="img/sprite/friend_${f.id}_face.png" alt=""></span>`   // 顔の大きさと位置をそろえた、顔だけの画像
      : '<span class="g-slot">?</span>').join('')}</span><span>${found.length} / ${FRIENDS.length}</span>`;
    chip.classList.toggle('is-on', found.length > 0);
    chip.classList.toggle('is-all', found.length === FRIENDS.length);
  };
  let hintTimer;
  const showHint = text => {
    hint.textContent = text; hint.classList.add('is-on');
    clearTimeout(hintTimer); hintTimer = setTimeout(() => hint.classList.remove('is-on'), 3600);
  };

  // 4人そろったとき：ラヴィからの一言
  const clear = document.createElement('div');
  clear.className = 'g-clear'; clear.setAttribute('role', 'dialog'); clear.setAttribute('aria-label', 'ぜんぶ見つけた');
  clear.innerHTML = `
    <div class="g-clear-card">
      <p class="g-clear-label">ALL FOUND</p>
      <div class="g-clear-friends">
        <img src="img/sprite/friend_1.png" alt="" loading="lazy"><img src="img/sprite/friend_2.png" alt="" loading="lazy">
        <img src="img/sprite/lavi_full.png" alt="" class="is-lavi" loading="lazy">
        <img src="img/sprite/friend_3.png" alt="" loading="lazy"><img src="img/sprite/friend_4.png" alt="" loading="lazy">
      </div>
      <p class="g-clear-text">……ぜんぶ、見つけてくれたんだね。<br>ありがとう。</p>
      <button type="button" class="g-clear-close">CLOSE</button>
    </div>`;
  document.body.append(clear);
  const showClear = () => clear.classList.add('is-on');
  clear.addEventListener('click', e => { if (e.target === clear || e.target.closest('.g-clear-close')) clear.classList.remove('is-on'); });
  addEventListener('keydown', e => { if (e.key === 'Escape') clear.classList.remove('is-on'); });
  chip.addEventListener('click', () => {
    if (found.length === FRIENDS.length) showClear();
    else showHint(`あと${FRIENDS.length - found.length}人、どこかに隠れているみたい。ほかのページも探してみてね。`);
  });
  renderChip();

  // このページに隠れているキャラを置く
  const f = FRIENDS.find(x => x.page === currentPage);
  const anchor = f && document.querySelector(f.anchor);
  if (!anchor) return;
  const host = document.createElement('div');
  host.className = 'g-peek-host';
  host.innerHTML = `
    <div class="g-peek-wrap" style="${f.pos}">
      <button type="button" class="g-peek" aria-label="なにかがのぞいている"><img src="img/sprite/friend_${f.id}.png" alt="" draggable="false"></button>
      <span class="g-bang" aria-hidden="true">!</span>
    </div>`;
  if (f.inside) anchor.prepend(host); else anchor.before(host);
  const peek = host.querySelector('.g-peek'), bang = host.querySelector('.g-bang');
  let busy = false;
  peek.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    peek.classList.add('is-found'); bang.classList.add('is-on');
    const isNew = !found.includes(f.id);
    if (isNew) { found.push(f.id); save(); }
    setTimeout(() => {
      renderChip(isNew ? f.id : null);
      if (isNew && found.length === FRIENDS.length) setTimeout(showClear, 900);
      else if (isNew) showHint(found.length === 1 ? '……だれか、いたみたい。' : `${found.length}人目を見つけた。`);
    }, 700);
    // しばらくすると、また同じ場所からのぞく
    setTimeout(() => { peek.classList.replace('is-found', 'is-away'); bang.classList.remove('is-on'); }, 1000);
    setTimeout(() => { peek.classList.remove('is-away'); busy = false; }, 25000);
  });
}

/* ---------- 歩くドット絵ラヴィ ----------
   ときどき、画面の下を横切る。押すと立ち止まって一言。台詞はトップのひとことと同じもの */
function setupWalker() {
  if (QUIET_PAGES.includes(currentPage) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lines = ['……見つかっちゃった。', 'ここ、けっこう静かでしょ？', 'きみの声、ちゃんと届いてるよ。', 'データの海って、夜はきれいなんだ。'];
  let said = 0;
  const schedule = first => setTimeout(walk, first ? 9000 : 45000 + Math.random() * 40000);   // 最初は9秒後、そのあとは45〜85秒おき
  const walk = () => {
    if (document.hidden) { schedule(); return; }
    const toLeft = Math.random() < 0.5;
    const el = document.createElement('div');
    el.className = 'g-walker' + (toLeft ? ' is-left' : '');
    el.innerHTML = '<button type="button" class="g-walker-body" aria-label="ラヴィ"><span class="g-walker-say"></span><img src="img/sprite/lavi_full.png" alt="" draggable="false"></button>';
    document.body.append(el);
    const w = 100, from = toLeft ? innerWidth + 10 : -w - 10, to = toLeft ? -w - 10 : innerWidth + 10;
    const anim = el.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
      { duration: (innerWidth + w + 20) / 62 * 1000, easing: 'linear', fill: 'forwards' });   // 1秒に62pxほど
    el.querySelector('.g-walker-body').addEventListener('click', () => {
      if (el.classList.contains('is-stop')) return;
      anim.pause();
      el.querySelector('.g-walker-say').textContent = lines[said++ % lines.length];
      el.classList.add('is-stop');
      setTimeout(() => { el.classList.remove('is-stop'); anim.play(); }, 2600);
    });
    anim.finished.catch(() => { }).then(() => { el.remove(); schedule(); });
  };
  schedule(true);
}

/* ---------- 起動 ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  renderHeader();
  renderFooter();
  setupParticles();
  setupDepth();
  setupTabWhisper();
  setupImageGuard();
  await loadReleases();
  if (document.querySelector('[data-release], [data-has-releases]')) setupReleaseModal();
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  // ページごとの処理（各ページで window.pageInit を定義）
  Promise.resolve(window.pageInit ? window.pageInit() : null).then(setupReveal);
  setupFriends();
  setupWalker();
});
