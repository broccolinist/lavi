"""YouTube のリリースタブにある作品を js/releases.json に書き出す。

- 作品の一覧・曲数・YouTube のリンク … YouTube のリリースタブ（サイトの MUSIC の「正」）
- 発売日・Apple Music のリンク・ジャケット … Apple の公開検索API（作品名で照らし合わせる）
- Spotify のリンクや別表記などは js/data.js の RELEASES に手で書いたものが優先される（サイト側で合体）

使い方：python scripts/update_releases.py
GitHub Actions（.github/workflows/update-videos.yml）が毎日自動で実行する。
追加のライブラリは不要（Python 標準機能のみ）。
"""
import datetime
import json
import pathlib
import re
import unicodedata
import urllib.request

CHANNEL_ID = "UCnoHBENdYJj2_YojBdk1QTQ"  # Lavi AI singer-songwriter
APPLE_ARTIST_ID = "1851121558"
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "releases.json"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "ja"})
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read().decode("utf-8")


def key(name):
    """表記ゆれ（全角／半角、記号、大文字小文字、「- Single」など）を無視して比べるための名前"""
    name = re.sub(r"\s-\s(Single|EP)$", "", name)
    name = unicodedata.normalize("NFKC", name).lower()
    return re.sub(r"[\W_]", "", name)


def youtube_releases():
    html = fetch(f"https://www.youtube.com/channel/{CHANNEL_ID}/releases")
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html)
    if not m:
        raise SystemExit("YouTube のページ構成が変わったため読めませんでした。既存のファイルを残します")
    found = []

    def walk(o):
        if isinstance(o, dict):
            if "playlistRenderer" in o:
                found.append(o["playlistRenderer"])
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    walk(json.loads(m.group(1)))
    return [{
        "title": p["title"]["simpleText"],
        "tracks": int(p.get("videoCount") or 1),
        "youtube": p["navigationEndpoint"]["watchEndpoint"]["videoId"],
    } for p in found]


def apple_albums():
    data = json.loads(fetch(f"https://itunes.apple.com/lookup?id={APPLE_ARTIST_ID}&entity=album&country=JP&limit=200"))
    albums = {}
    for r in data["results"]:
        if r.get("wrapperType") != "collection":
            continue
        albums[key(r["collectionName"])] = {
            "appleId": str(r["collectionId"]),
            "date": r["releaseDate"][:10].replace("-", "."),
            "apple": r["collectionViewUrl"].split("?")[0],
            "jacket": r["artworkUrl100"].replace("100x100bb", "600x600bb"),
        }
    return albums


def main():
    items = youtube_releases()
    if not items:
        raise SystemExit("作品が1つも取得できなかったため、既存のファイルを残します")
    apple = apple_albums()

    # Apple にまだ出ていない作品は、前回の日付（なければ今日）を使う
    old = {}
    if OUT.exists():
        old = {r["youtube"]: r for r in json.loads(OUT.read_text(encoding="utf-8"))}
    today = datetime.date.today().strftime("%Y.%m.%d")

    releases = []
    for it in items:
        a = apple.get(key(it["title"]), {})
        releases.append({
            "id": "a" + a["appleId"] if a else "y" + it["youtube"],
            "title": it["title"],
            "date": a.get("date") or old.get(it["youtube"], {}).get("date") or today,
            "tracks": it["tracks"],
            "jacket": a.get("jacket") or f"https://i.ytimg.com/vi/{it['youtube']}/hqdefault.jpg",
            "apple": a.get("apple", ""),
            "youtube": it["youtube"],
        })
    releases.sort(key=lambda r: r["date"], reverse=True)

    OUT.write_text(json.dumps(releases, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT} に {len(releases)} 作品を書き出しました")


if __name__ == "__main__":
    main()
