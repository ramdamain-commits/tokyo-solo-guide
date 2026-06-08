# tokyo-solo-guide 観点拡張 設計書

- 作成日: 2026-06-08
- 対象リポ: tokyo-solo-guide（public・GitHub Pages）
- 目的: 「一人で行ける」恒常・期間限定の遊びを、既存5カテゴリ＋美術企画展に偏った構成へ別観点から補完する

## 背景

現状の常設は「歴史・博物館／スポーツ観戦／自然・庭園／グルメ・酒／体験・建築・夜景」の5カテゴリ。月次は `exhibitions`（美術企画展）・`seasonal`（季節の花）・`closures`（休館）の3配列。月次が事実上「美術企画展」に偏り、生の舞台・くつろぎ系・美術以外の季節イベントが死角になっている。本拡張で「他の観点」を、いずれも一人で完結できる範囲に限って足す。

## スコープ

### やること

1. 常設カテゴリを2つ追加（`data/evergreen.json`）
   - **伝統芸能・寄席・演芸**: 生の舞台を一人・当日・短時間で観る軸。
   - **銭湯・サウナ・温泉**: 既存にない「くつろぐ／整う」モード。完全ソロ・雨天夜間でも成立。
2. 月次に「歳時・社寺行事・祭り」イベントを足すための新配列 `events` を `data/monthly.json` に新設。
   - ほおずき市・朝顔市・酉の市・盆踊り等の美術以外の季節興行を収める。
   - 現在 `exhibitions` に紛れて入っている「山王祭」を `events` へ移設する。
3. フロント（`app.js`）に `events` 表示セクションを1つ追加。`exhibitions` と同じ「会期末日で自動薄表示＋終了を末尾ソート」を再利用する。

### やらないこと（今回見送り・将来枠）

- 大相撲（ユーザー指示でカット）
- 花火大会（ユーザー指示でカット）
- 名画座・ミニシアター／工場見学・社会科見学（次点。将来の常設追加候補として温存）
- 動植物園・水族館／図書館・書店街／市場・問屋街／水上交通（同上）

## データ構造

### evergreen.json（常設・追加2カテゴリ）

既存 `categories[]` に同形式のオブジェクトを2件追加するだけ。フロントは `categories` をループ描画するため自動表示される。各 item フィールドは既存と同一: `name / area / desc / fee / closed / source`。

```jsonc
{
  "id": "performing-arts",
  "label": "伝統芸能・寄席・演芸",
  "items": [
    { "name": "...", "area": "...", "desc": "...", "fee": "...", "closed": "...", "source": "https://..." }
  ]
}
```

候補施設（精査時に当日席運用・料金・休演を要確認）:
- 伝統芸能・寄席: 歌舞伎座（一幕見席）／新宿末廣亭／鈴本演芸場／浅草演芸ホール／能楽堂（観世・宝生 等）
- ※国立演芸場は建替で閉場中につき除外する
- 銭湯・サウナ・温泉: レトロ銭湯の代表／都市型サウナの代表／日帰り温泉施設

### monthly.json（期間限定・新配列 events）

`exhibitions` と同じスキーマに揃え、会期末日判定（`period` 末尾の `YYYY-MM-DD`）を共用する。

```jsonc
"events": [
  {
    "title": "ほおずき市",
    "venue": "浅草寺",
    "area": "浅草",
    "period": "2026-07-09〜2026-07-10",   // 末尾は必ず YYYY-MM-DD（自動薄表示の前提）
    "note": "...",
    "source": "https://..."
  }
]
```

- `period` の末尾は必ず `YYYY-MM-DD`（既存ルール踏襲。会期終了の自動判定の前提）。
- 「山王祭」エントリを `exhibitions` から `events` へ移動する。

## フロント実装（app.js）

`exhibitions` 描画ブロック（80-93行）と同型の `events` ブロックを追加する。

- 配置: `exhibitions` の直後、`seasonal` の前。
- セクション: `id="events"` / 見出し「今月の歳時・祭り」。
- 終了済みは `isEnded(period)` で薄表示クラスを付け、`ended` で末尾ソート（`exhibitions` と同じ）。
- `renderItem` への渡し方も `exhibitions` と同じ（`name: x.title`、`desc: [venue, period, note].join("｜")`、`mapQuery: x.venue`）。
- `events` 配列が空/未定義なら `if (monthly.events?.length)` でセクションごと出さない（既存3配列と同じガード）。

既存ロジック（`renderItem` / `addSection` / `parseEndDate` / `isEnded`）は変更しない。再利用のみ。

## 検証

- `node --check app.js` で構文確認。
- ローカル preview で `data/monthly.json` を読み込み、`events` セクションが描画されること、会期末日が過去の擬似データで「終了」バッジ＋薄表示＋末尾ソートになることを確認（ソース編集後は `location.reload()` 必須。screenshot タイムアウト時は snapshot 代替）。
- `node -e` でファイルパスを渡す場合は `C:/Users/...` 形式。

## 出典・リーク・運用上の注意

- 全 item / event に一次情報（公式サイト）の `source` を付ける。wiki 由来の値は最低1件スクリプトor公式で裏取りする。
- 公開リポのため、台帳（decisions/changelog/note）に居住エリア・年収等の固有値を直接書かない（抽象表現）。export 後は `life-ops-export.json` を機微語で grep してリークチェック。
- 個人版メモ `reference_tokyo_solo_play.md`（非公開）からは汎用情報のみ抽出し、個人属性は構造的に載せない。
- 反映後の運用順: projects.json → MEMORY → TASKS → changelog → export(-SkipOpen)。CHANGELOG 追記。
- 実データ（具体施設・会期）の収集は researcher へ委任し、出典URL付き JSON を `~/.claude/_backups/` に直書きさせる（メイン側で整形し直さない）。

## テスト観点まとめ

| 観点 | 方法 |
|------|------|
| JSON 妥当性 | `node --check` ＋ `JSON.parse` |
| events 描画 | preview で events セクション表示確認 |
| 自動薄表示 | 過去日 period の擬似データで「終了」バッジ・末尾ソート確認 |
| 既存非破壊 | exhibitions/seasonal/closures/常設カテゴリが従来通り出ること |
| 出典 | 全エントリに source（公式）あり |
