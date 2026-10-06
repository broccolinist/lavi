"""YouTube チャンネルの最新の横動画（ショートを除く）を js/videos.json に書き出す。

取得のしかたは scripts/yt.py（YouTube 公式の API。キーがなければ公開フィード）。

使い方：python scripts/update_videos.py
GitHub Actions（.github/workflows/update-videos.yml）が毎日自動で実行する。
追加のライブラリは不要（Python 標準機能のみ）。
"""
import json
import pathlib

from yt import latest_videos

COUNT = 3
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "videos.json"


def main():
    try:
        videos = latest_videos(COUNT)
    except Exception as e:
        # 取れなくてもエラー終了にはしない（サイトは前回の videos.json のまま表示される）
        print(f"::warning::YouTube の動画一覧を取得できなかったため、動画は前回のままにします（{e}）")
        return

    if not videos:
        print("::warning::動画が1本も取得できなかったため、既存のファイルを残します")
        return

    OUT.write_text(json.dumps(videos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT} に {len(videos)} 本を書き出しました")


if __name__ == "__main__":
    main()
