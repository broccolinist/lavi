"""YouTube チャンネルの公開フィードから、最新の横動画（ショートを除く）を js/videos.json に書き出す。

使い方：python scripts/update_videos.py
GitHub Actions（.github/workflows/update-videos.yml）が毎日自動で実行する。
追加のライブラリは不要（Python 標準機能のみ）。
"""
import json
import pathlib
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


def main():
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as res:
        root = ET.fromstring(res.read())

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
        raise SystemExit("動画が1本も取得できなかったため、既存のファイルを残します")

    OUT.write_text(json.dumps(videos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT} に {len(videos)} 本を書き出しました")


if __name__ == "__main__":
    main()
