"""YouTube チャンネルの最新の横動画を js/videos.json に、最新のショートを js/shorts.json に書き出す。

取得のしかたは scripts/yt.py（YouTube 公式の API。キーがなければ公開フィード）。

使い方：python scripts/update_videos.py
GitHub Actions（.github/workflows/update-videos.yml）が毎日自動で実行する。
追加のライブラリは不要（Python 標準機能のみ）。
"""
import json
import pathlib

from yt import latest_shorts, latest_videos

JS = pathlib.Path(__file__).resolve().parent.parent / "js"


def update(name, fetch, count, out):
    try:
        videos = fetch(count)
    except Exception as e:
        # 取れなくてもエラー終了にはしない（サイトは前回のファイルのまま表示される）
        print(f"::warning::YouTube の{name}の一覧を取得できなかったため、{name}は前回のままにします（{e}）")
        return

    if not videos:
        print(f"::warning::{name}が1本も取得できなかったため、既存のファイルを残します")
        return

    out.write_text(json.dumps(videos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{out} に {len(videos)} 本を書き出しました")


def main():
    update("動画", latest_videos, 3, JS / "videos.json")
    update("ショート", latest_shorts, 4, JS / "shorts.json")


if __name__ == "__main__":
    main()
