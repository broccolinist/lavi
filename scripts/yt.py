"""YouTube の最新の横動画（ショートを除く）を取ってくる共通の部品。

- 環境変数 YOUTUBE_API_KEY があれば、YouTube 公式の API（YouTube Data API v3）を使う。
  GitHub Actions では、リポジトリの Secrets に登録したキーが渡される
- キーがなければ、公開フィードを使う（手元のパソコン用。GitHub のサーバーからは断られることが多い）
"""
import json
import os
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

CHANNEL_ID = "UCnoHBENdYJj2_YojBdk1QTQ"  # Lavi AI singer-songwriter


def _get(url):
    """一時的に断られることがあるので、間をあけて数回試す"""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "ja"})
    last = None
    for wait in (0, 10, 30):
        time.sleep(wait)
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return res.read()
        except Exception as e:  # 404・429・500 や接続切れなど
            last = e
            print(f"{url.split('?')[0]} の取得に失敗（{e}）")
    raise last


def _from_api(key, count):
    # 「UULF＋チャンネルIDのUC以降」は、そのチャンネルの横動画だけが新しい順に並ぶ再生リスト（ショートは入らない）
    params = urllib.parse.urlencode({
        "part": "snippet,contentDetails",
        "playlistId": "UULF" + CHANNEL_ID[2:],
        "maxResults": count,
        "key": key,
    })
    data = json.loads(_get("https://www.googleapis.com/youtube/v3/playlistItems?" + params))
    videos = []
    for item in data.get("items", []):
        published = item["contentDetails"].get("videoPublishedAt") or item["snippet"]["publishedAt"]
        videos.append({
            "id": item["contentDetails"]["videoId"],
            "title": item["snippet"]["title"],
            "published": published[:10].replace("-", "."),
        })
    return videos


def _from_feed(count):
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
    root = ET.fromstring(_get(f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"))
    videos = []
    for entry in root.findall("a:entry", ns):
        if "/shorts/" in entry.find("a:link", ns).get("href", ""):  # ショート動画は除外
            continue
        videos.append({
            "id": entry.find("yt:videoId", ns).text,
            "title": entry.find("a:title", ns).text,
            "published": entry.find("a:published", ns).text[:10].replace("-", "."),
        })
    return videos[:count]


def latest_videos(count=15):
    """新しい順の [{id, title, published}]。取れなければ例外を出す"""
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if key:
        print("YouTube 公式の API から取得します")
        return _from_api(key, count)
    print("API キーがないため、公開フィードから取得します")
    return _from_feed(count)
