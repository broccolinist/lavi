/* ==========================================================
   共通スクリプト（全ページで読む）
   1. 設定と共通の道具
   2. ヘッダー・フッター
   3. 楽曲（カード・配信ボタン・詳細の窓・データの読み込み）
   4. ニュース
   5. 演出（スクロールで表示・奥行きと区切り）
   6. 隠し要素（気配・隠れキャラ・歩くラヴィ）
   7. 画像の保存対策
   8. 起動
   ========================================================== */


/* ==========================================================
   1. 設定と共通の道具
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
  ext: '<i class="fas fa-arrow-up-right-from-square"></i>'
};

// ドット絵のラヴィの表情
const FACES = { normal: 'img/sprite/lavi_pixel_normal.png', happy: 'img/sprite/lavi_pixel_happy.png' };

// ラヴィのひとこと。トップでラヴィを押したときに順に話す。walk＝歩くラヴィも話す
const LAVI_LINES = [
  { text: '……見つかっちゃった。', mood: 'normal', walk: true },
  { text: 'ここ、けっこう静かでしょ？', mood: 'normal', walk: true },
  { text: 'くすぐったいぴょん。', mood: 'happy' },
  { text: 'きみの声、ちゃんと届いてるよ。', mood: 'happy', walk: true },
  { text: 'データの海って、夜はきれいなんだ。', mood: 'normal', walk: true },
  { text: '……もう少しだけ、いてくれる？', mood: 'normal' }
];

// 事務的なページには、キャラの仕掛けを出さない
const QUIET_PAGES = ['contact.html', 'privacy.html'];

const currentPage = location.pathname.split('/').pop() || 'index.html';
const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;   // 動きを減らす設定の人には、演出を出さない
const HAS_IO = 'IntersectionObserver' in window;
const NEW_TAB = 'target="_blank" rel="noopener"';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 作品名の表記ゆれ（全角・半角、記号、大文字小文字）を無視して比べるための形にする
const titleKey = s => (s || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// '2026.10.17' のような日付から、今日まで何日たったか
const daysSince = date => (Date.now() - new Date(date.replace(/\./g, '-'))) / 86400000;

// YouTube をその場で再生する埋め込み
const youtubeEmbed = id => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;

// YouTube のサムネイルが無いとき（小さな灰色の画像が返る）、横長の版に差し替える。img の onload に入れる
const ytThumbFallback = id => `onload="if (this.naturalWidth <= 120 && !this.dataset.fb) { this.dataset.fb = 1; this.src = 'https://i.ytimg.com/vi/${id}/hqdefault.jpg'; }"`;


/* ==========================================================
   2. ヘッダー・フッター
   ========================================================== */

function snsLinks() {
  return `
    <a href="${LINKS.spotify}" ${NEW_TAB} aria-label="Spotify">${ICON.spotify}</a>
    <a href="${LINKS.apple}" ${NEW_TAB} aria-label="Apple Music">${ICON.apple}</a>
    <a href="${LINKS.youtube}" ${NEW_TAB} aria-label="YouTube">${ICON.youtube}</a>`;
}

function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const links = NAV.map(item => `
    <li><a href="${item.href}" ${item.ext ? NEW_TAB : ''} class="${item.href === currentPage ? 'is-current' : ''}">
      <span class="en">${item.en}${item.ext ? ' ' + ICON.ext : ''}</span><span class="ja">${item.ja}</span>
    </a></li>`).join('');

  header.innerHTML = `
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
  header.after(drawer);

  const toggle = header.querySelector('.menu-toggle');
  const setOpen = open => {
    document.documentElement.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  toggle.addEventListener('click', () => setOpen(!document.documentElement.classList.contains('menu-open')));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setOpen(false); });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML = `
    <button class="peek" aria-label="ラヴィ"><img src="${FACES.normal}" alt=""></button>
    <div class="footer-marquee" aria-hidden="true"><div>
      ${'<span>BUG&amp;LAVI PROJECT</span><span class="dot">✦</span><span>YOUR GATEWAY TO BUG&amp;LAVI WORLD</span><span class="dot">✦</span>'.repeat(6)}
    </div></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="img/logo/logo-horizontal-1200.png" alt="Bug&amp;Lavi Project" class="footer-logo" width="1200" height="400">
        <p class="footer-copy" aria-live="polite">データの中に住む存在、ラヴィの世界へ。</p>
      </div>
      <ul class="footer-nav">
        ${NAV.map(item => `<li><a href="${item.href}" ${item.ext ? NEW_TAB : ''}>${item.en}${item.ext ? ' ' + ICON.ext : ''}</a></li>`).join('')}
        <li><a href="privacy.html">PRIVACY POLICY</a></li>
      </ul>
      <div class="footer-sns">${snsLinks()}</div>
    </div>
    <p class="copyright">© Bug&amp;Lavi Project. All Rights Reserved.<small>Apple and Apple Music are trademarks of Apple Inc., registered in the U.S. and other countries</small></p>`;

  setupFooterPeek(footer);
}

// 隠し要素：フッターのふちから小さなラヴィがのぞいている。
// フッターにたどりついたとき／ラヴィを押したとき、キャッチコピーが一瞬乱れてラヴィの言葉に変わる
function setupFooterPeek(footer) {
  const peek = footer.querySelector('.peek');
  const face = peek.querySelector('img');
  const copy = footer.querySelector('.footer-copy');
  const catchphrase = copy.textContent;
  const PEEK_LINES = ['ここまで見てくれたんだ。', 'えへへ、見つかっちゃった。', 'またね。'];
  const NOISE = 'アイウエオカキクケコサシスセソ01█▓▒░#@*';
  const FRAME_MS = 40;      // 文字を入れ替える間隔
  const NOISE_FRAMES = 6;   // 1文字が乱れている長さ（コマ数）
  const SHOW_MS = 3000;     // 言葉が出そろってから、元に戻すまで
  let lineIndex = 0, scrambleTimer, backTimer;

  // 文字を左から順に、乱れた文字を経由して別の文に置き換える
  const scramble = (to, done) => {
    clearInterval(scrambleTimer);
    const from = copy.textContent;
    const len = Math.max(from.length, to.length);
    let frame = 0;
    scrambleTimer = setInterval(() => {
      frame++;
      let out = '';
      for (let i = 0; i < len; i++) {
        const settle = i * 1.2 + NOISE_FRAMES;   // この文字が新しい文字に落ち着くコマ
        if (frame >= settle) out += to[i] || '';
        else if (frame >= settle - NOISE_FRAMES) out += NOISE[Math.floor(Math.random() * NOISE.length)];
        else out += from[i] || '';
      }
      copy.textContent = out;
      if (frame >= len * 1.2 + NOISE_FRAMES) {
        clearInterval(scrambleTimer);
        copy.textContent = to;
        if (done) done();
      }
    }, FRAME_MS);
  };

  const talk = () => {
    face.src = FACES.happy;
    peek.classList.add('is-talking');
    copy.classList.add('is-lavi');
    clearTimeout(backTimer);
    scramble(PEEK_LINES[lineIndex++ % PEEK_LINES.length], () => {
      backTimer = setTimeout(() => {
        scramble(catchphrase, () => copy.classList.remove('is-lavi'));
        peek.classList.remove('is-talking');
        face.src = FACES.normal;
      }, SHOW_MS);
    });
  };
  peek.addEventListener('click', talk);

  // フッターに最初にたどりついたとき、一度だけ
  if (HAS_IO && !REDUCE_MOTION) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { io.disconnect(); setTimeout(talk, 900); }
    }, { threshold: 0.6 });
    io.observe(copy);
  }
}


/* ==========================================================
   3. 楽曲
   ========================================================== */

function releaseCard(release, index = 0) {
  return `
    <button class="release-card reveal" style="--d:${(index % 4) * 0.08}s" data-release="${release.id}" aria-label="${esc(release.title)} の詳細">
      <div class="release-jacket">
        <img src="${release.jacket}" alt="${esc(release.title)}" loading="lazy">
        <span class="release-play"><i class="fas fa-play"></i></span>
      </div>
      <div class="release-meta">
        <span class="release-type">${release.tracks} TRACK${release.tracks > 1 ? 'S' : ''}</span>
        <span class="release-date">${release.date}</span>
      </div>
      <h3 class="release-title">${esc(release.title)}</h3>
      ${release.sub ? `<p class="release-sub">${esc(release.sub)}</p>` : ''}
    </button>`;
}

// 配信ボタン：Apple は公式バッジ。Spotify・YouTube は公式アイコン（カラー）を黒地に置き、Apple のバッジと体裁をそろえる
const BADGE = {
  spotify: url => `<a class="listen-badge" href="${url}" ${NEW_TAB}><img src="img/brand/spotify-icon-green.svg" alt="" class="lb-icon"><span class="lb-text"><b>Spotify</b><small>で聴く</small></span></a>`,
  apple: url => `<a class="am-badge" href="${url}" ${NEW_TAB}><img src="img/brand/apple-music-badge-ja.svg" alt="Apple Music で聴く" width="140" height="40"></a>`,
  youtube: url => `<a class="listen-badge" href="${url}" ${NEW_TAB}><img src="img/brand/youtube-icon-red.png" alt="" class="lb-icon is-wide"><span class="lb-text"><b>YouTube</b><small>で聴く</small></span></a>`
};

// 並び順は Apple Music を先頭に（Apple のガイドライン 1.3）
function streamButtons(release) {
  return `
    ${release.apple ? BADGE.apple(release.apple) : ''}
    ${release.spotify ? BADGE.spotify(release.spotify) : ''}
    ${release.youtube ? BADGE.youtube(`https://youtu.be/${release.youtube}`) : ''}`;
}

// 楽曲カードを押すと開く、詳細の窓。URL の #作品id でも開く
function setupReleaseModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="modal-bg" data-close></div><div class="modal-panel"><button class="modal-close" data-close aria-label="閉じる"><span></span><span></span></button><div class="modal-body"></div></div>`;
  document.body.appendChild(modal);
  const body = modal.querySelector('.modal-body');

  const open = id => {
    const release = RELEASES.find(r => r.id === id);
    if (!release) return;
    // CSS 変数で渡す画像は、css/ から見た場所と取り違えないよう、完全な URL にする
    body.innerHTML = `
      <div class="modal-jacket" style="--bg:url('${new URL(release.jacket, location.href).href}')"><img src="${release.jacket}" alt="${esc(release.title)}"></div>
      <div class="modal-info">
        <p class="modal-label">${release.date} Release ／ ${release.tracks}曲</p>
        <h2 class="modal-title">${esc(release.title)}</h2>
        ${release.sub ? `<p class="modal-sub">${esc(release.sub)}</p>` : ''}
        <p class="modal-artist">Lavi AI singer-songwriter</p>
        <div class="stream-list">${streamButtons(release)}</div>
      </div>`;
    modal.classList.add('is-open');
    document.body.classList.add('modal-lock');
    history.replaceState(null, '', '#' + id);
  };
  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-lock');
    setTimeout(() => { body.innerHTML = ''; }, 400);   // 閉じる動きが終わってから中身を消す
    history.replaceState(null, '', location.pathname);
  };

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-release]');
    if (card) { e.preventDefault(); open(card.dataset.release); return; }
    if (e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });

  const hash = location.hash.slice(1);
  if (hash && RELEASES.some(r => r.id === hash)) open(hash);
}

/* 楽曲データの読み込み
   js/releases.json（GitHub Actions が毎日 Apple Music と YouTube の公開フィードから更新）に、
   data.js の RELEASES に手で書いた情報（Spotify のリンクなど）を上書きで重ねる。
   読めなければ data.js の RELEASES をそのまま使う */
async function loadReleases() {
  try {
    const res = await fetch(`js/releases.json?t=${Date.now()}`);
    if (!res.ok) return;
    const auto = await res.json();
    const appleId = url => (url || '').match(/(\d+)\/?$/)?.[1];
    // 自動の1件に対応する、手書きの1件（Apple Music の番号で、なければ作品名で照らし合わせる）
    const manualFor = a => RELEASES.find(m => appleId(m.apple) && appleId(m.apple) === appleId(a.apple))
      || RELEASES.find(m => titleKey(m.title) === titleKey(a.title)) || {};
    if (auto.length) RELEASES = auto.map(a => ({ ...a, ...manualFor(a) }));
  } catch { /* 予備の RELEASES を使う */ }
}


/* ==========================================================
   4. ニュース（記事は js/news.js）
   ========================================================== */

// 表示用に整えた記事の一覧。limit を渡すと、新しいものからその件数だけ
function loadNews(limit) {
  const list = limit ? NEWS.slice(0, limit) : NEWS;
  return list.map(item => {
    const release = item.release && RELEASES.find(r => titleKey(r.title) === titleKey(item.release));
    const links = release ? `<div class="stream-list">${streamButtons(release)}</div>` : '';
    // 楽曲の記事で画像が空なら、その作品のジャケットを自動で使う
    const image = item.image || (release && release.jacket) || '';
    return { ...item, image, category: item.category || 'INFO', body: `<p>${item.body.trim().replace(/\n/g, '<br>')}</p>${links}` };
  });
}

// 30日以内の記事に「NEW」を付ける
function isNew(date) {
  const days = daysSince(date);
  return days >= 0 && days <= 30;
}


/* ==========================================================
   5. 演出
   ========================================================== */

/* ---------- スクロールで表示 ---------- */
function setupReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!HAS_IO) { targets.forEach(t => t.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));
}

/* ---------- 奥行きと区切り（トップ） ----------
   区画（data-world と STORY）に、背景・巨大な英字・区切りの帯を足し、スクロールに合わせて動かす。
   見た目は css/style.css の「8. 奥行きと区切り」 */
function setupDepth() {
  const worlds = [...document.querySelectorAll('[data-world], .home .story')];
  if (!worlds.length) return;
  addWorldParts(worlds);
  setupWaveLight();
  setupWorldCut(worlds);
  setupParallax(worlds);
  setupDust();
}

// 区画ごとに、背景・巨大な英字・区切りの帯（声の波形）を足す
function addWorldParts(worlds) {
  worlds.forEach(sec => {
    const en = sec.querySelector('.section-title .en')?.textContent.trim() || '';

    const ghost = document.createElement('p');
    ghost.className = 'dp-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = en;
    if (sec.matches('.story')) {
      sec.prepend(ghost);   // STORY はもとから背景の絵を持っているので、英字だけ足す
    } else {
      const bg = document.createElement('div');
      bg.className = 'dp-bg';
      bg.append(ghost);
      sec.prepend(bg);
    }

    // NEWS の上には、もとから流れる文字（ティッカー）があるので帯は足さない
    if (sec.dataset.world !== 'news') {
      const band = document.createElement('div');
      band.className = 'dp-band';
      band.setAttribute('aria-hidden', 'true');
      band.innerHTML = waveSvg();
      sec.before(band);
    }
  });
}

// 声の波形：細い縦線の高さを少しずつ変え、中央が高く、両端は消える（毎回同じ形）
function waveSvg() {
  const COUNT = 240, GAP = 5, MID = 10;   // 線の本数・間隔・中心の高さ（viewBox 1200×20 の中で）
  let lines = '';
  for (let i = 0; i < COUNT; i++) {
    const envelope = Math.sin(Math.PI * i / (COUNT - 1));   // 両端で 0、中央で 1
    const half = Math.max(.5, envelope * (4 + 6 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .53))));
    const x = i * GAP + 2;
    lines += `<line x1="${x}" x2="${x}" y1="${(MID - half).toFixed(2)}" y2="${(MID + half).toFixed(2)}"/>`;
  }
  return `<svg viewBox="0 0 1200 20" preserveAspectRatio="none">${lines}</svg>`;
}

// 帯が画面の中ほどを横切ったときだけ、波形の上を光が通る（下へ進む＝左から右、上へ戻る＝右から左）
function setupWaveLight() {
  if (REDUCE_MOTION || !HAS_IO) return;
  const SWEEP_MS = 900;    // 光が端から端まで通る時間
  const LIT_LINES = 14;    // 同時に光っている線の本数

  let lastY = scrollY, direction = 1;
  addEventListener('scroll', () => {
    if (scrollY !== lastY) direction = scrollY > lastY ? 1 : -1;
    lastY = scrollY;
  }, { passive: true });

  const sweep = band => {
    if (band.dataset.run) return;
    band.dataset.run = '1';
    const lines = [...band.querySelectorAll('line')];
    if (direction < 0) lines.reverse();
    const total = lines.length + LIT_LINES, start = performance.now();
    const step = now => {
      const head = Math.floor((now - start) / SWEEP_MS * total);
      lines.forEach((line, i) => line.classList.toggle('is-lit', i <= head && i > head - LIT_LINES));
      if (head < total) requestAnimationFrame(step);
      else delete band.dataset.run;
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) sweep(e.target); }),
    { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('.dp-band').forEach(band => io.observe(band));
}

// 区画に入った瞬間の「切り替わり」
function setupWorldCut(worlds) {
  if (!HAS_IO || REDUCE_MOTION) return;
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.remove('is-cut');
    void e.target.offsetWidth;   // 何度でも再生できるように、いったん外してから付け直す
    e.target.classList.add('is-cut');
  }), { rootMargin: '0px 0px -55% 0px' });
  worlds.forEach(sec => io.observe(sec));
}

// スクロールに合わせた速度差（巨大な英字・トップの絵）
function setupParallax(worlds) {
  if (REDUCE_MOTION) return;
  const kv = document.querySelector('.kv');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    worlds.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;   // 画面から遠い区画は動かさない
      const offset = (rect.top + rect.height / 2) - vh / 2;     // 区画の中心が、画面の中心からどれだけずれているか
      sec.style.setProperty('--py', `${(offset * -0.22).toFixed(1)}px`);
    });
    if (kv) {
      const y = Math.min(scrollY, kv.offsetHeight);
      kv.style.setProperty('--kv-y', `${(y * 0.28).toFixed(1)}px`);
      kv.style.setProperty('--kv-s', (1 + y * 0.00018).toFixed(4));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

// ページ全体に漂う粒（奥・中・手前の3層。スクロールすると層ごとに違う速さで流れる）
function setupDust() {
  if (REDUCE_MOTION) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'dp-dust';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const LAYERS = [   // 奥ほど小さく・遅く・薄い
    { size: [0.6, 1.2], speed: 0.06, scroll: 0.05, alpha: 0.30 },
    { size: [1.0, 2.0], speed: 0.14, scroll: 0.14, alpha: 0.45 },
    { size: [1.8, 3.4], speed: 0.26, scroll: 0.30, alpha: 0.55 },
  ];
  const rand = (min, max) => min + Math.random() * (max - min);
  let width, height, dots = [];

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth; height = innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(width * height / 16000, width < 761 ? 34 : 90));   // スマホは数を減らす
    dots = Array.from({ length: count }, (_, i) => {
      const layer = LAYERS[i % 3];
      return {
        layer, x: rand(0, width), y: rand(0, height), size: rand(...layer.size), phase: rand(0, 6.28),
        square: Math.random() < 0.4, pink: Math.random() < 0.4
      };
    });
  };

  const tick = () => {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    ctx.clearRect(0, 0, width, height);
    const loopH = height + 20;   // 上へ抜けた粒は下から戻ってくる
    for (const d of dots) {
      d.y -= d.layer.speed;
      d.phase += 0.01;
      d.x += Math.sin(d.phase) * 0.12;
      const y = (((d.y - scrollY * d.layer.scroll) % loopH) + loopH) % loopH - 10;
      const alpha = d.layer.alpha * (0.6 + Math.sin(d.phase * 1.7) * 0.4);
      ctx.fillStyle = d.pink ? `rgba(255,200,230,${alpha})` : `rgba(170,220,255,${alpha})`;
      if (d.square) ctx.fillRect(d.x, y, d.size * 1.5, d.size * 1.5);
      else { ctx.beginPath(); ctx.arc(d.x, y, d.size, 0, 6.283); ctx.fill(); }
    }
  };

  resize();
  tick();
  addEventListener('resize', resize);
}

/* 遠くの背景はゆっくり動く／入ってくる区画のピントが合う（トップだけ） */
function setupFocusDepth() {
  if (!document.body.classList.contains('home') || REDUCE_MOTION) return;
  const worlds = [...document.querySelectorAll('[data-world]')];
  const clamp = (v, max) => Math.max(-max, Math.min(max, v));
  const onScroll = () => worlds.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const offset = rect.top + rect.height / 2 - innerHeight / 2;
    sec.style.setProperty('--bgy', clamp(offset * -0.18, 60).toFixed(1));
    sec.style.setProperty('--pt', clamp(offset * 0.02, 20).toFixed(1));
  });
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!HAS_IO) return;
  const io = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('is-blur', !e.isIntersecting)),
    { rootMargin: '-5% 0px -5% 0px' });
  document.querySelectorAll('.section, .story').forEach(sec => io.observe(sec));
}


/* ==========================================================
   6. 隠し要素
   ========================================================== */

/* ---------- タブのひとこと（全ページ） ----------
   タブを離れると、タイトルがラヴィのひとことに変わる */
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

/* ---------- 気配（トップ） ----------
   ラヴィに触れる／しばらく放っておく／また来る と、小さく反応する */
function setupPresence() {
  const chara = document.getElementById('hero-chara');
  const box = document.getElementById('whisper');
  const textEl = document.getElementById('whisper-text');
  const face = document.getElementById('whisper-face');
  if (!chara || !box) return;
  const slot = document.getElementById('whisper-slot');
  new Image().src = FACES.happy;   // 笑顔を先に読んでおく

  // 吹き出しの位置：キービジュアルの中の、ラヴィの肩の少し上（画像に対する割合）
  const KV_MOUTH = { x: 0.715, y: 0.58 };
  const KV_SIZE = { w: 1731, h: 909 };
  const KV_POS = { x: 0.30, y: 0.35 };   // CSS の object-position と同じ値
  const kv = document.querySelector('.kv');
  const wide = matchMedia('(min-width: 1100px)');   // CSS の会話欄の切り替え幅と同じ

  const reset = el => { el.classList.remove('is-bubble', 'is-slot'); el.style.left = el.style.top = el.style.translate = ''; };

  // 広い画面：バナーが見えていれば、顔の横の吹き出し
  const placeBubble = () => {
    const rect = kv.getBoundingClientRect();
    if (rect.bottom < rect.height * 0.6 || rect.top > innerHeight * 0.5) return false;
    const scale = Math.max(rect.width / KV_SIZE.w, rect.height / KV_SIZE.h);
    const drawW = KV_SIZE.w * scale, drawH = KV_SIZE.h * scale;
    const x = (rect.width - drawW) * KV_POS.x + drawW * KV_MOUTH.x;
    const y = (rect.height - drawH) * KV_POS.y + drawH * KV_MOUTH.y;
    if (rect.width - x < 300) return false;   // 右に吹き出しを置く余白がない
    reset(box);
    kv.appendChild(box);
    box.classList.add('is-bubble');
    box.style.left = `${x + 18}px`;
    box.style.top = `${y}px`;
    box.style.translate = '0 -100%';
    return true;
  };
  // 狭い画面：バナーのすぐ下の会話欄（ラヴィを押したときだけ開く）
  const placeSlot = () => {
    if (box.parentElement !== slot) { reset(box); slot.appendChild(box); }
    box.classList.add('is-slot');
  };
  // 広い画面でバナーが見えていないとき：画面下に一時的に出す
  const placeFloat = () => { reset(box); document.body.appendChild(box); };

  const layout = () => {
    slot.classList.remove('is-open');
    box.classList.remove('is-on');
    if (wide.matches) placeFloat();
    else placeSlot();
  };
  wide.addEventListener('change', layout);
  layout();

  // mood: 'normal'（すまし顔）／'happy'（笑顔）
  // auto: 押されていないのに話す台詞。狭い画面では会話欄を勝手に開かないよう、出さない
  let typeTimer, hideTimer;
  const say = (text, mood = 'normal', { auto = false, ms = 4200 } = {}) => {
    if (auto && !wide.matches) return;
    if (wide.matches) { if (!placeBubble()) placeFloat(); }
    else { placeSlot(); slot.classList.add('is-open'); }
    face.src = FACES[mood];
    textEl.textContent = '';
    box.classList.add('is-on');
    let shown = 0;
    clearInterval(typeTimer);
    clearTimeout(hideTimer);
    typeTimer = setInterval(() => {   // 1文字ずつ出す
      textEl.textContent = text.slice(0, ++shown);
      if (shown >= text.length) {
        clearInterval(typeTimer);
        hideTimer = setTimeout(() => { box.classList.remove('is-on'); slot.classList.remove('is-open'); }, ms);
      }
    }, 70);
  };
  const flicker = () => {
    chara.classList.remove('is-flicker');
    void chara.offsetWidth;   // 何度でも再生できるように、いったん外してから付け直す
    chara.classList.add('is-flicker');
  };

  let lineIndex = 0;
  chara.style.cursor = 'pointer';
  chara.addEventListener('click', () => {
    const line = LAVI_LINES[lineIndex++ % LAVI_LINES.length];
    flicker();
    say(line.text, line.mood);
  });

  // また来てくれた人へ
  let visits = 0;
  try { visits = +localStorage.getItem('lavi-visits') || 0; localStorage.setItem('lavi-visits', visits + 1); } catch { }
  if (visits > 0) setTimeout(() => say(visits > 4 ? 'いつも来てくれて、ありがと。' : 'また来てくれたんだ。', 'happy', { auto: true }), 3200);

  // しばらく何もしないと
  let idleTimer;
  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { flicker(); say('……まだ、いる？', 'normal', { auto: true }); }, 30000);
  };
  ['mousemove', 'scroll', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();

  // ときどき、ほんの一瞬だけ乱れる（9〜21秒おき）
  const flickerLater = () => setTimeout(() => {
    if (!document.hidden && scrollY < innerHeight) flicker();
    flickerLater();
  }, 9000 + Math.random() * 12000);
  if (!REDUCE_MOTION) flickerLater();
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

function setupFriends() {
  if (QUIET_PAGES.includes(currentPage)) return;
  const STORE_KEY = 'lavi-friends';
  let found = [];
  try { found = JSON.parse(localStorage.getItem(STORE_KEY) || '[]').filter(id => FRIENDS.some(f => f.id === id)); } catch { }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(found)); } catch { } };
  const allFound = () => found.length === FRIENDS.length;

  // 見つけた数
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'g-chip';
  chip.setAttribute('aria-label', '見つけた数');
  const hint = document.createElement('p');
  hint.className = 'g-hint';
  hint.setAttribute('aria-live', 'polite');
  document.body.append(chip, hint);

  const renderChip = justFoundId => {
    const slots = FRIENDS.map(f => found.includes(f.id)
      ? `<span class="g-slot${f.id === justFoundId ? ' is-new' : ''}"><img src="img/sprite/friend_${f.id}_face.png" alt=""></span>`   // 顔の大きさと位置をそろえた、顔だけの画像
      : '<span class="g-slot">?</span>').join('');
    chip.innerHTML = `<span class="g-slots">${slots}</span><span>${found.length} / ${FRIENDS.length}</span>`;
    chip.classList.toggle('is-on', found.length > 0);
    chip.classList.toggle('is-all', allFound());
  };
  let hintTimer;
  const showHint = text => {
    hint.textContent = text;
    hint.classList.add('is-on');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hint.classList.remove('is-on'), 3600);
  };

  // 4人そろったとき：ラヴィからの一言
  const clear = document.createElement('div');
  clear.className = 'g-clear';
  clear.setAttribute('role', 'dialog');
  clear.setAttribute('aria-label', 'ぜんぶ見つけた');
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
    if (allFound()) showClear();
    else showHint(`あと${FRIENDS.length - found.length}人、どこかに隠れているみたい。ほかのページも探してみてね。`);
  });
  renderChip();

  // このページに隠れているキャラを置く
  const friend = FRIENDS.find(f => f.page === currentPage);
  const anchor = friend && document.querySelector(friend.anchor);
  if (!anchor) return;
  const host = document.createElement('div');
  host.className = 'g-peek-host';
  host.innerHTML = `
    <div class="g-peek-wrap" style="${friend.pos}">
      <button type="button" class="g-peek" aria-label="なにかがのぞいている"><img src="img/sprite/friend_${friend.id}.png" alt="" draggable="false"></button>
      <span class="g-bang" aria-hidden="true">!</span>
    </div>`;
  if (friend.inside) anchor.prepend(host);
  else anchor.before(host);

  const peek = host.querySelector('.g-peek');
  const bang = host.querySelector('.g-bang');
  let busy = false;
  peek.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    peek.classList.add('is-found');
    bang.classList.add('is-on');
    const firstTime = !found.includes(friend.id);
    if (firstTime) { found.push(friend.id); save(); }
    setTimeout(() => {
      renderChip(firstTime ? friend.id : null);
      if (firstTime && allFound()) setTimeout(showClear, 900);
      else if (firstTime) showHint(found.length === 1 ? '……だれか、いたみたい。' : `${found.length}人目を見つけた。`);
    }, 700);
    // 引っ込んで、しばらくすると、また同じ場所からのぞく
    setTimeout(() => { peek.classList.replace('is-found', 'is-away'); bang.classList.remove('is-on'); }, 1000);
    setTimeout(() => { peek.classList.remove('is-away'); busy = false; }, 25000);
  });
}

/* ---------- 歩くドット絵ラヴィ ----------
   ときどき、画面の下を横切る。押すと立ち止まって一言 */
function setupWalker() {
  if (QUIET_PAGES.includes(currentPage) || REDUCE_MOTION) return;
  const lines = LAVI_LINES.filter(line => line.walk).map(line => line.text);
  const WIDTH = 100;         // ラヴィの横幅
  const SPEED = 62;          // 1秒に進む px
  const STOP_MS = 2600;      // 押されて立ち止まる時間
  let lineIndex = 0;

  // 最初は9秒後、そのあとは45〜85秒おき
  const schedule = first => setTimeout(walk, first ? 9000 : 45000 + Math.random() * 40000);
  const walk = () => {
    if (document.hidden) { schedule(); return; }
    const toLeft = Math.random() < 0.5;
    const el = document.createElement('div');
    el.className = 'g-walker' + (toLeft ? ' is-left' : '');
    el.innerHTML = '<button type="button" class="g-walker-body" aria-label="ラヴィ"><span class="g-walker-say"></span><img src="img/sprite/lavi_full.png" alt="" draggable="false"></button>';
    document.body.append(el);
    const left = -WIDTH - 10, right = innerWidth + 10;
    const anim = el.animate(
      [{ transform: `translateX(${toLeft ? right : left}px)` }, { transform: `translateX(${toLeft ? left : right}px)` }],
      { duration: (innerWidth + WIDTH + 20) / SPEED * 1000, easing: 'linear', fill: 'forwards' });
    el.querySelector('.g-walker-body').addEventListener('click', () => {
      if (el.classList.contains('is-stop')) return;
      anim.pause();
      el.querySelector('.g-walker-say').textContent = lines[lineIndex++ % lines.length];
      el.classList.add('is-stop');
      setTimeout(() => { el.classList.remove('is-stop'); anim.play(); }, STOP_MS);
    });
    anim.finished.catch(() => { }).then(() => { el.remove(); schedule(); });
  };
  schedule(true);
}


/* ==========================================================
   7. 画像の保存対策
   右クリック／長押しのメニューとドラッグを、画像の上でだけ止める（クリックはそのまま使える）。
   完全には防げない（開発者ツールやスクリーンショットでは取れる）ので、気軽な保存を防ぐためのもの
   ========================================================== */
function setupImageGuard() {
  const isImage = target => target instanceof Element && target.closest('img, .modal-jacket');
  document.addEventListener('contextmenu', e => { if (isImage(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', e => { if (isImage(e.target)) e.preventDefault(); });
}


/* ==========================================================
   8. 起動
   ========================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  renderHeader();
  renderFooter();
  setupDepth();
  setupFocusDepth();
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
