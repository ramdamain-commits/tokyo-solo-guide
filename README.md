# 東京ひとり遊びガイド

東京で一人で楽しめる文化・歴史スポットと、今月の企画展・季節の見頃・休館情報をまとめた汎用ガイド。

🔗 公開URL: https://ramdamain-commits.github.io/tokyo-solo-guide/

## 構成
- `index.html` / `app.js` — サイト本体（JSON を読み込んで描画）
- `data/evergreen.json` — 常設スポット（歴史・観戦・自然・グルメ・体験）
- `data/monthly.json` — 今月の企画展・季節・休館（月次更新）
- `data/sources.json` — 調査に使う承認済みソース一覧
- `docs/UPDATING.md` — 月次更新の手順

## 更新方法
月初に `docs/UPDATING.md` の手順で `data/monthly.json` を差し替える。詳細は同ファイル参照。

## 方針
公開リポのため、居住地・予算・個人属性は一切含めない汎用情報のみを掲載する。
