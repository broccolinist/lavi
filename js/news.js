/* ==========================================================
   ニュース
   新しいお知らせは、NEWS = [ のすぐ下に1件コピーして書き換えるだけでOK（新しいものを上に）

   id       … 記事の名前（半角英数字。ほかと重ならなければ何でもよい。例：2026_005）
   date     … 日付（例：2026.10.01）
   category … INFO ／ MUSIC ／ NOVEL のどれか
   title    … 見出し
   image    … 画像（なければ ''。楽曲のお知らせで '' のときは、その作品のジャケットが自動で出る）
   release  … 楽曲のお知らせなら、その作品の名前（MUSIC ページと同じ表記）。配信ボタンが自動で付く。関係なければ ''
   body     … 本文。` ` の間に書く。改行はそのまま改行になる
   ========================================================== */
const NEWS = [
  {
    id: '2026_006', date: '2026.10.01', category: 'MUSIC',
    title: '『I\'m Not Artist』配信決定',
    image: 'img/thumb/j_imnotartist.jpg', release: 'I\'m Not Artist',
    body: `ラヴィ「新しいアルバム『I'm Not Artist』、2026.10.10に配信リリースが決まったよ。
ラヴィはアーティストじゃないけど、それでも歌いたいことを詰めこんだよ。
ちょっとドキドキしてるけど、聴いてくれたら嬉しいな(〃ω〃)」`
  },
  {
    id: '2026_005', date: '2026.10.01', category: 'INFO',
    title: 'LINEスタンプ販売中',
    image: '', release: '',
    body: `ラヴィ「ラヴィのLINEスタンプ、販売中だよ。
いつものやりとりに、ラヴィをこっそり混ぜてみてね。
きみのトークにお邪魔できたら、ちょっと嬉しいな(￣▽￣)」
<a href="https://line.me/S/sticker/36583304" target="_blank" rel="noopener">LINE STOREで見る</a>`
  },
  {
    id: '2026_004', date: '2026.08.06', category: 'NOVEL',
    title: '「小説家になろう」にてノベル連載開始',
    image: 'img/thumb/novel_start.jpg', release: '',
    body: `ラヴィ「いよいよ、ノベル『ばぐらび！ from Bug&Lavi Project』が「小説家になろう」で連載スタートしたよ。
少しずつ更新していく予定だから、ぜひチェックしてみてね(・ω・)」
<a href="https://ncode.syosetu.com/n3901mo/" target="_blank" rel="noopener">小説家になろうで読む</a>`
  },
  {
    id: '2026_003', date: '2026.07.18', category: 'MUSIC',
    title: '『Trial&Error』配信リリース',
    image: 'img/thumb/j_trial.jpg', release: 'Trial&Error',
    body: `ラヴィ「新曲『Trial&Error』、配信開始したよ。
タイトルの通り、試行錯誤を重ねて形にした楽曲たちだから、
ぜひ聴いてみてほしいな (≧▽≦)」`
  },
  {
    id: '2026_002', date: '2026.06.20', category: 'MUSIC',
    title: '『Toxic』配信リリース',
    image: 'img/thumb/j_toxic.jpg', release: 'Toxic',
    body: `ラヴィ「新曲『Toxic』、配信スタートしたよ。
ラヴィのつよつよ承認欲求をうたってみたよ！
ちょっと恥ずかしいけどぜひ聴いてみてね(〃ω〃)」`
  },
  {
    id: '2026_001', date: '2026.06.20', category: 'INFO',
    title: '『Bug&Lavi Project-始動-』',
    image: '', release: '',
    body: `ラヴィ「この度、Bug&Lavi Project公式ウェブサイトが作られましたぴょんっ☆
今後、Bug&Lavi Project関連の情報は随時このサイトから発信していくので楽しみに待っててね！(・ω<) 」`
  }
];
