"""YouTube チャンネルの公開フィードから、最新の横動画（ショートを除く）を js/videos.json に書き出す。

使い方：python scripts/update_videos.py
GitHub Actions（.github/workflows/update-videos.yml）が毎日自動で実行する。
追加のライブラリは不要（Python 標準機能のみ）。
"""
import json
import pathlib
import time
import urllib.request
import xml.etree.ElementTree as ET

CHANNEL_ID = "UCnoHBENdYJj2_YojBdk1QTQ"  # Lavi AI singer-songwriter
COUNT = 3
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "videos.json"

NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def fetch_feed():
    """YouTube の公開フィードを読む。GitHub のサーバーからだと一時的に断られることがあるので、間をあけて数回試す"""
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "ja"})
    last = None
    for wait in (0, 10, 30, 60):
        time.sleep(wait)
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return ET.fromstring(res.read())
        except Exception as e:  # 404・429・500 や接続切れなど
            last = e
            print(f"フィードの取得に失敗（{e}）。{'もう一度試します' if wait < 60 else 'あきらめます'}")
    raise last


def main():
    try:
        root = fetch_feed()
    except Exception as e:
        # 取れなくてもエラー終了にはしない（サイトは前回の videos.json のまま表示される）
        print(f"::warning::YouTube のフィードを取得できなかったため、動画は前回のままにします（{e}）")
        return

    videos = []
    for entry in root.findall("a:entry", NS):
        link = entry.find("a:link", NS).get("href", "")
        if "/shorts/" in link:  # ショート動画は除外
            continue
        videos.append({
            "id": entry.find("yt:videoId", NS).text,
            "title": entry.find("a:title", NS).text,
            "published": entry.find("a:published", NS).text[:10].replace("-", "."),
        })
        if len(videos) >= COUNT:
            break

    if not videos:
        print("::warning::動画が1本も取得できなかったため、既存のファイルを残します")
        return

    OUT.write_text(json.dumps(videos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT} に {len(videos)} 本を書き出しました")


if __name__ == "__main__":
    main()
