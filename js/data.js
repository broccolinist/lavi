/* ==========================================================
   サイト全体で使うデータ
   楽曲は js/releases.json（毎日自動更新）が元。ここには手で足したい情報だけ書く
   ニュースは js/news.js に書く
   ========================================================== */

/* ---- 楽曲の手書き情報 ----
   新曲は YouTube のリリースタブに出れば、翌朝までに自動で載る（作品名・発売日・曲数・ジャケット・Apple Music・YouTube）。
   Spotify のリンクを付けたいときや、自動の内容を変えたいときだけ、ここに1件足す（新しいものを上に）。
   作品は apple（なければ title）で照らし合わせ、ここに書いた項目が自動の内容より優先される。
   書かなかった項目は自動の内容のまま。releases.json が読めなかったときは、ここの一覧だけで表示する */
let RELEASES = [
  {
    id: 'mermaid', title: 'MERMAID', date: '2026.09.12', tracks: 1,
    jacket: 'img/thumb/j_mermaid.jpg',
    spotify: 'https://open.spotify.com/intl-ja/track/6c14Z1xozvzb0MG7Gs5FUC',
    apple: 'https://music.apple.com/jp/album/mermaid-single/6804711983',
    youtube: 'OjMnD6K5v0Y'
  },
  {
    id: 'trial', title: 'Trial&Error', date: '2026.07.18', tracks: 3,
    jacket: 'img/thumb/j_trial.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/1ZbLj0KsJY0HRnf18xW8aO',
    apple: 'https://music.apple.com/jp/album/trial-error-single/6788799142',
    youtube: 'OriJn37_AiE'
  },
  {
    id: 'toxic', title: 'Toxic', date: '2026.06.20', tracks: 4,
    jacket: 'img/thumb/j_toxic.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/55EYWUtpeJnNS6HLWSa3oH',
    apple: 'https://music.apple.com/jp/album/toxic-ep/6777734428',
    youtube: 'RU8LyEWK0xs'
  },
  {
    id: 'jidou', title: '自動相談所', sub: 'Automatic consultant', date: '2026.06.06', tracks: 1,
    jacket: 'img/thumb/j_jidou.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/5HPUW4ZAHCKFmfpmmq9fOo',
    apple: 'https://music.apple.com/jp/album/%E8%87%AA%E5%8B%95%E7%9B%B8%E8%AB%87%E6%89%80-automatic-consultant-single/6776125292',
    youtube: 'QrAAkCeQSu8'
  },
  {
    id: 'revolution', title: 'REVOLUTION', date: '2026.05.02', tracks: 10,
    jacket: 'img/thumb/j_revolution.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/65n4Rz93Juk52w0uX9e5Ui',
    apple: 'https://music.apple.com/jp/album/revolution/1892123353',
    youtube: 'cT8XWX024QM'
  },
  {
    id: 'kansoku', title: '観測者の恋', date: '2026.03.14', tracks: 4,
    jacket: 'img/thumb/j_kansoku.jpg',
    spotify: 'https://open.spotify.com/album/3RjHf7bjL3fQPTmkVQIouu',
    apple: 'https://music.apple.com/jp/album/%E8%A6%B3%E6%B8%AC%E8%80%85%E3%81%AE%E6%81%8B-ep/1882171348',
    youtube: 'Sa77oCTwjVc'
  },
  {
    id: 'aishitenai', title: '愛してないって言えなかった', date: '2026.02.14', tracks: 6,
    jacket: 'img/thumb/j_aishitenai.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/73un4z0kFna3eRzqqaQ5Ti',
    apple: 'https://music.apple.com/jp/album/%E6%84%9B%E3%81%97%E3%81%A6%E3%81%AA%E3%81%84%E3%81%A3%E3%81%A6%E8%A8%80%E3%81%88%E3%81%AA%E3%81%8B%E3%81%A3%E3%81%9F-ep/1872933457',
    youtube: 'UTxqbnbGkz0'
  },
  {
    id: 'singularity', title: 'Singularity', date: '2026.01.17', tracks: 6,
    jacket: 'img/thumb/j_singularity.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/6PSlC1vDeNUfFReX0rrIHM',
    apple: 'https://music.apple.com/jp/album/singularity-ep/1862286873',
    youtube: 'yQU50KMDMes'
  },
  {
    id: 'jackpot', title: 'JACKPOT！', date: '2025.12.27', tracks: 15,
    jacket: 'img/thumb/j_jackpot.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/3CuxzuKY9LlDlviUo5TUEY',
    apple: 'https://music.apple.com/jp/album/jackpot/1857450991',
    youtube: 'Th4a5Xoh_HU'
  },
  {
    id: 'christmas', title: 'クリスマスデートの夜', date: '2025.12.20', tracks: 3,
    jacket: 'img/thumb/j_christmas.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/4MDdB1926RSXOQ3xzb5WCR',
    apple: 'https://music.apple.com/jp/album/クリスマスデートの夜-single/1858020476',
    youtube: 'dy8UENm43Ko'
  },
  {
    id: 'dattomild', title: '脱兎マイルド', date: '2025.12.13', tracks: 7,
    jacket: 'img/thumb/j_dattomild.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/6EETEg9wILPwewpQmmuVDT',
    apple: 'https://music.apple.com/jp/album/脱兎マイルド/1853264563',
    youtube: 'W0IrXi9CZCQ'
  },
  {
    id: 'ahiru', title: 'みにくいアヒルの子', date: '2025.11.29', tracks: 3,
    jacket: 'img/thumb/j_ahiru.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/0XbHJlTIF5OH8xX7WilGh9',
    apple: 'https://music.apple.com/jp/album/みにくいアヒルの子-single/1855300560',
    youtube: 'RzQ49rFU3JQ'
  },
  {
    id: 'oiran', title: 'OIRAN.exeと百年後の花一匁', date: '2025.11.15', tracks: 3,
    jacket: 'img/thumb/j_oiran.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/4Q81qZM0xLXKUZj8Vd871T',
    apple: 'https://music.apple.com/jp/album/oiran-exeと百年後の花一匁-single/1852216814',
    youtube: 'qF7s_Gh7D4c'
  },
  {
    id: 'usagi', title: '電脳うさぎの見る夢', date: '2025.11.06', tracks: 6,
    jacket: 'img/thumb/j_usagi.jpg',
    spotify: 'https://open.spotify.com/intl-ja/album/0ZhDMDHrVFDASGYuZ61Kr7',
    apple: 'https://music.apple.com/jp/album/電脳うさぎの見る夢-ep/1852073259',
    youtube: 'ZWayi0C4XoU'
  }
];

/* ---- トップページの動画 ----
   ふだんは js/videos.json（GitHub Actions が毎日 YouTube から自動更新）を使う。
   これはそのファイルが読めなかったときの予備 */
const VIDEOS = [
  { id: 'jkhCRr3sRT8', title: 'Toxic / Lavi AI singer-songwriter【オリジナルMV】' },
  { id: '7JoiCClsIe4', title: 'Vivid Night Parade【オリジナルMV】' },
  { id: 'Ndn-5ial_xE', title: '不完全生命体 Lyric Video' }
];

const LINKS = {
  spotify: 'https://open.spotify.com/intl-ja/artist/19IjM1QzTxBX14RzfEIzNV',
  apple: 'https://music.apple.com/jp/artist/lavi-ai-singer-songwriter/1851121558',
  youtube: 'https://www.youtube.com/@LaviAIsinger-songwriter',
  novel: 'https://ncode.syosetu.com/n3901mo/',
  shop: 'https://bug-and-lavi.designstore.jp/'
};
