# CHANGELOG

## 2026-06-07
- リポ初期化（README/CHANGELOG/gitignore）。
- 常設スポットデータ `data/evergreen.json` 追加（歴史・観戦・自然・グルメ・体験の5カテゴリ16施設、各出典URL実在確認済）。
- 検索ソース承認レジストリ `data/sources.json` 追加（Tokyo Art Beat / Go Tokyo / 各館公式）。
- 月次データ `data/monthly.json` 追加（2026-06：企画展13件／季節1件／休館1件）。
- サイト本体 `index.html` + `app.js` 追加（JSON 駆動描画・portal デザイントークン流用）。
- 月次更新手順 `docs/UPDATING.md` 追加（検索の仕方・ソース追加削除・棚卸し方針）。
- GitHub Pages 公開（https://ramdamain-commits.github.io/tokyo-solo-guide/ ）。公開前に禁止語スキャン0件で確認。
- OGP / Twitter Card / canonical メタタグと絵文字SVG favicon を追加（SNS 共有時のプレビュー・SEO 改善）。
- 企画展の会期終了を自動判定し、終了済みは薄表示＋「終了」バッジ付きで末尾に移動（`period` 末尾の YYYY-MM-DD を基準に判定）。
