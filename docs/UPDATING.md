# 月次更新の手順

完全手動運用。月初に依頼ベースで実行する（自動実行なし）。

## 1. 検索ソース（data/sources.json）
調査は `data/sources.json` の承認済みソースを起点にする。priority 1 を第1ソース、type:reference は裏取り専用。

## 2. 検索の仕方（researcher プロンプト雛形）
researcher サブエージェントに以下を委任する:

> 東京で一人で楽しめる **今月（YYYY-MM）** の情報を調べ、出典URL付きで
> **`data/monthly.json` と同じスキーマの JSON** を `~/.claude/_backups/tokyo-monthly-YYYYMM.json` に直接書いてください（中間整形不要・JSONのみ）。
> 起点ソース: data/sources.json の priority 1〜2（Tokyo Art Beat / Go Tokyo / 各館公式）。
> スキーマ:
> - exhibitions: `[{title, venue, area, period, note, source}]`（会期中の企画展・特別展）
> - seasonal: `[{title, spot, peak, source}]`（今月の花・自然の見頃）
> - closures: `[{venue, period, source}]`（主要館の休館・展示替・リニューアル）
> 各項目は必ず公式または Tokyo Art Beat の URL を `source` に入れる。
> wiki・個人ブログは裏取りのみで、`source` には使わない。
> **居住地・個人属性・所要時間は一切書かない（汎用情報のみ）。**

メイン側は出力 JSON の妥当性を確認し、`data/monthly.json` の各配列にそのまま差し込む（手コピペ整形しない）。`updated` と `month` を更新する。

## 3. 反映
1. `node -e "JSON.parse(require('fs').readFileSync('data/monthly.json','utf8'))"` で妥当性確認
2. `git add data/monthly.json && git commit -m "data: YYYY-MM 月次更新"`
3. `git push`（GitHub Pages に即反映）
4. CHANGELOG.md に1行追記（フォーマット例: `## YYYY-MM-DD` セクションを足し `- YYYY-MM 月次更新（企画展N件/季節N件/休館N件）。`）

## 4. 検索ソースの追加・削除
`data/sources.json` は「**調査の起点レジストリ**」であり、各スポットの `source`（evergreen.json / monthly.json の item に直書きされた出典URL）とは独立している。sources.json からソースを削除しても item の `source` は残るので、削除時は item 側の出典も陳腐化していないか別途確認する。
- **追加**: 新しい公式/横断サイトを見つけたら sources オブジェクトを追記（id 一意・priority・covers・type を設定）。URL は WebFetch で 200 を確認してから追加。
- **削除**: 閉鎖・更新停止・情報が古いソースは該当オブジェクトを削除。
- **棚卸し**: 半年に一度、全 source の URL 生存と情報鮮度を確認し、priority を見直して `updated` を更新する。**棚卸しを忘れないよう、次回棚卸し予定（YYYY-MM）を TASKS.md の tokyo-solo-guide 行に記録する。**
- 個人ブログ・SNS は原則 sources に入れない（裏取り用に留める）。

## 5. 常設データ（evergreen.json）
常設は随時。施設の閉館・移転・料金改定を見つけたら該当 item を修正。新カテゴリ追加時は app.js は変更不要（categories 配列を増やすだけで描画される）。
