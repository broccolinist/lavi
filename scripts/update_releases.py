"""Apple Music の作品一覧から js/releases.json を作る（自動で読み取ってよい公開の窓口だけを使う）。

- 作品名・発売日・曲数・Apple Music のリンク・ジャケット … Apple の公開検索API
- YouTube のリンク … 最新の横動画15本（scripts/yt.py。YouTube 公式の API、キーがなければ公開フィード）から、作品名を含む動画を探す。
  見つからなければ前回の値を残す。古い作品は js/data.js の RELEASES に手で書いた値が優先される
- Spotify のリンクや別表記なども js/data.js の RELEASES に手で書いたものが優先される（サイト側で合体）
※ YouTube のページ（リリースタブ）を直接読み取る方法は、YouTube の利用規約（自動での読み取りの禁止）に触れるため使わない

使い方：python scripts/update_releases.py
GitHub Actions（.github/workflows/update-videos.yml）が毎日自動で実行する。
追加のライブラリは不要（Python 標準機能のみ）。
"""
import json
import pathlib
import time
import re
import unicodedata
import urllib.request

from yt import latest_videos

APPLE_ARTIST_ID = "1851121558"
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "releases.json"


def fetch(url):
    """一時的に断られることがあるので、間をあけて数回試す"""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "ja"})
    for wait in (0, 10, 30):
        time.sleep(wait)
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return res.read().decode("utf-8")
        except Exception as e:
            last = e
            print(f"{url.split('?')[0]} の取得に失敗（{e}）")
    raise last


def key(name):
    """表記ゆれ（全角／半角、記号、大文字小文字、「- Single」など）を無視して比べるための名前"""
    name = re.sub(r"\s-\s(Single|EP)$", "", name)
    name = unicodedata.normalize("NFKC", name).lower()
    return re.sub(r"[\W_]", "", name)


def youtube_feed():
    """最新の横動画を [(タイトルの比較用の名前, 動画ID)] で返す。取れなければ空（YouTube のリンクは前回の値が残る）"""
    try:
        return [(key(v["title"]), v["id"]) for v in latest_videos(15)]
    except Exception as e:
        print(f"::warning::YouTube の動画一覧を取得できなかったため、YouTube のリンクは前回のままにします（{e}）")
        return []


def apple_albums():
    data = json.loads(fetch(f"https://itunes.apple.com/lookup?id={APPLE_ARTIST_ID}&entity=album&country=JP&limit=200"))
    albums = {}
    for r in data["results"]:
        if r.get("wrapperType") != "collection":
            continue
        albums[str(r["collectionId"])] = {
            "title": re.sub(r"\s-\s(Single|EP)$", "", r["collectionName"]),
            "tracks": r.get("trackCount", 1),
            "date": r["releaseDate"][:10].replace("-", "."),
            "apple": r["collectionViewUrl"].split("?")[0],
            "jacket": r["artworkUrl100"].replace("100x100bb", "600x600bb"),
        }
    return albums


def main():
    try:
        albums = apple_albums()
    except Exception as e:
        # 取れなくてもエラー終了にはしない（サイトは前回の releases.json のまま表示される）
        print(f"::warning::Apple Music の作品一覧を取得できなかったため、楽曲は前回のままにします（{e}）")
        return
    if not albums:
        print("::warning::作品が1つも取得できなかったため、既存のファイルを残します")
        return
    feed = youtube_feed()

    old = {}
    if OUT.exists():
        old = {r["id"]: r for r in json.loads(OUT.read_text(encoding="utf-8"))}

    releases = []
    for apple_id, a in albums.items():
        rid = "a" + apple_id
        k = key(a["title"])
        found = next((vid for title, vid in feed if k and k in title), "")
        releases.append({
            "id": rid,
            "title": a["title"],
            "date": a["date"],
            "tracks": a["tracks"],
            "jacket": a["jacket"],
            "apple": a["apple"],
            "youtube": found or old.get(rid, {}).get("youtube", ""),
        })
    releases.sort(key=lambda r: r["date"], reverse=True)

    OUT.write_text(json.dumps(releases, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT} に {len(releases)} 作品を書き出しました")


if __name__ == "__main__":
    main()
