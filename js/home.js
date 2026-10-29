/* ==========================================================
   トップページ（index.html）だけで使うスクリプト
   site.js の起動処理が、window.pageInit を呼ぶ
   ========================================================== */

window.pageInit = async () => {
  const latest = RELEASES[0];
  const news = loadNews(4);

  renderTicker(latest);
  renderFeature(latest);
  document.getElementById('home-releases').innerHTML = RELEASES.slice(1, 9).map(releaseCard).join('');   // 過去作
  await renderVideos();
  await renderShorts();
  renderGate(latest, news[0]);
  setupPresence();
  renderHomeNews(news);
};

// ティッカー（いちばん上の流れる文字）
function renderTicker(latest) {
  const words = [`NEW RELEASE「${latest.title}」OUT NOW`, 'YOUR GATEWAY TO BUG&LAVI WORLD', 'NOVEL「ばぐらび！」完結', 'BUG&LAVI PROJECT'];
  const line = words.map(word => `<span>${esc(word)}</span><span class="dot">✦</span>`).join('');
  document.getElementById('ticker').innerHTML = line.repeat(4);
}

// 注目の1曲
function renderFeature(latest) {
  document.getElementById('music-feature').innerHTML = `
    <div class="feature-jacket" style="--bg:url('${new URL(latest.jacket, location.href).href}')">
      <div class="vinyl"></div>
      <img src="${latest.jacket}" alt="${esc(latest.title)}">
    </div>
    <div class="feature-info">
      <span class="label">LATEST RELEASE</span>
      <h3>${esc(latest.title)}</h3>
      <p class="meta">${latest.date} Release ／ Lavi AI singer-songwriter</p>
      <div class="stream-list">${streamButtons(latest)}</div>
      <button class="more-link" data-release="${latest.id}">DETAIL <i class="fas fa-arrow-right"></i></button>
    </div>`;
}

// 動画カードを押すと、その場で再生する
function playHere(e) {
  const card = e.target.closest('.video-card');
  if (!card || card.querySelector('iframe')) return;
  e.preventDefault();
  card.insertAdjacentHTML('beforeend', youtubeEmbed(card.dataset.yt));
}

// 動画：YouTube の最新の横動画3本（js/videos.json は GitHub Actions が毎日更新）。読めなければ data.js の VIDEOS を使う
async function renderVideos() {
  let videos = VIDEOS;
  try {
    const res = await fetch(`js/videos.json?t=${Date.now()}`);
    if (res.ok) videos = await res.json();
  } catch { }

  // スマホでは横スクロールの回転式（カルーセル）。端までいっても続けて回せるよう、前後に同じ並びの写し（is-clone）を置く。
  // 写しはパソコンでは非表示（style.css）
  const cardSet = isClone => videos.map((video, i) => `
    <a class="video-card${isClone ? ' is-clone' : i === 0 ? ' is-main' : ''}" href="https://youtu.be/${video.id}" data-yt="${video.id}" ${NEW_TAB}${isClone ? ' tabindex="-1" aria-hidden="true"' : ''}>
      <img src="https://i.ytimg.com/vi/${video.id}/${i === 0 ? 'maxresdefault' : 'hqdefault'}.jpg" alt="${esc(video.title)}" loading="lazy"
        ${ytThumbFallback(video.id)}>
      <span class="cap">${ICON.youtube}<span class="cap-text">${esc(video.title)}${video.published ? `<small>${video.published}</small>` : ''}</span></span>
    </a>`).join('');

  const grid = document.getElementById('home-videos');
  grid.innerHTML = cardSet(true) + cardSet(false) + cardSet(true);
  setupVideoCarousel(grid, videos.length);
  grid.addEventListener('click', playHere);
}

// スマホ用：動画の回転式の横スクロール。真ん中の1本がはっきり見え、両端に前後の動画が薄く見える
function setupVideoCarousel(grid, count) {
  const cards = [...grid.children];
  const phone = matchMedia('(max-width: 760px)');
  const scrollToCenter = card => card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2;
  const setWidth = () => cards[count].offsetLeft - cards[0].offsetLeft;   // 1セット分の幅
  const markActive = () => {
    const mid = grid.scrollLeft + grid.clientWidth / 2;
    cards.forEach(card => card.classList.toggle('is-active', Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid) < card.offsetWidth / 2));
  };
  const reset = () => { if (phone.matches) { grid.scrollLeft = scrollToCenter(cards[count]); markActive(); } };

  let timer;
  grid.addEventListener('scroll', () => {
    if (!phone.matches) return;
    markActive();
    clearTimeout(timer);
    // 止まったら、写しの位置から本物の同じ位置へこっそり戻す（再生中の動画があるときは動かさない）
    timer = setTimeout(() => {
      if (grid.querySelector('iframe')) return;
      const width = setWidth(), x = grid.scrollLeft - scrollToCenter(cards[0]);
      if (x < width - 1) grid.scrollLeft += width;
      else if (x > width * 2 - 1) grid.scrollLeft -= width;
    }, 140);
  }, { passive: true });
  phone.addEventListener('change', reset);
  window.addEventListener('resize', reset);
  reset();
}

// ショート：YouTube の最新のショート4本（js/shorts.json も GitHub Actions が毎日更新）。読めなければ欄ごと出さない
async function renderShorts() {
  let shorts = [];
  try {
    const res = await fetch(`js/shorts.json?t=${Date.now()}`);
    if (res.ok) shorts = await res.json();
  } catch { }
  if (!shorts.length) return;

  // 題名の後ろのハッシュタグは外す。画像は縦長の版（oardefault）、なければ横長の版の中央を使う
  const grid = document.getElementById('home-shorts');
  grid.innerHTML = shorts.map(video => {
    const title = video.title.replace(/\s*#\S+/g, '').trim() || video.title;
    return `
    <a class="video-card is-short" href="https://www.youtube.com/shorts/${video.id}" data-yt="${video.id}" ${NEW_TAB}>
      <img src="https://i.ytimg.com/vi/${video.id}/oardefault.jpg" alt="${esc(title)}" loading="lazy"
        ${ytThumbFallback(video.id)}>
      <span class="cap">${ICON.youtube}<span class="cap-text"><span class="cap-title">${esc(title)}</span>${video.published ? `<small>${video.published}</small>` : ''}</span></span>
    </a>`;
  }).join('');
  grid.addEventListener('click', playHere);
  document.getElementById('shorts-section').hidden = false;
}

// 入口カード（ニュース／音楽／ノベル）。発売から60日以内の曲には「NEW RELEASE」を付ける
function renderGate(latest, topNews) {
  const isRecent = daysSince(latest.date) <= 60;
  document.getElementById('gate').innerHTML = `
    ${topNews ? `<a class="gate-card is-news" href="news.html#${topNews.id}">
      <span class="gate-icon"><i class="fas fa-satellite-dish"></i></span>
      <span class="gate-text"><span class="gate-label">LATEST NEWS</span><span class="gate-title">${esc(topNews.title)}</span><span class="gate-sub">${topNews.date}</span></span>
      <i class="fas fa-chevron-right gate-go"></i></a>` : ''}
    <button class="gate-card is-music" data-release="${latest.id}">
      ${isRecent ? '<span class="gate-badge">NEW RELEASE</span>' : ''}
      <span class="gate-icon is-img"><img src="${latest.jacket}" alt=""></span>
      <span class="gate-text"><span class="gate-label">MUSIC</span><span class="gate-title">『${esc(latest.title)}』を聴く</span><span class="gate-sub">${latest.date} 配信中</span></span>
      <i class="fas fa-chevron-right gate-go"></i></button>
    <a class="gate-card is-novel" href="${LINKS.novel}" ${NEW_TAB}>
      <span class="gate-icon"><i class="fas fa-book-open"></i></span>
      <span class="gate-text"><span class="gate-label">NOVEL</span><span class="gate-title">『ばぐらび！』を読む</span><span class="gate-sub">小説家になろうで完結</span></span>
      <i class="fas fa-chevron-right gate-go"></i></a>`;
}

// ニュースの一覧（新しい4件）
function renderHomeNews(news) {
  document.getElementById('home-news').innerHTML = news.map(item => `
    <li><a class="news-row" href="news.html#${item.id}">
      <span class="date">${item.date}</span>
      <span class="cat cat-${item.category}">${item.category}</span>
      <span class="title">${esc(item.title)}${isNew(item.date) ? '<span class="badge-new">NEW</span>' : ''}</span>
      <i class="fas fa-arrow-right"></i>
    </a></li>`).join('') || '<li><p class="loading">NO DATA</p></li>';
}
