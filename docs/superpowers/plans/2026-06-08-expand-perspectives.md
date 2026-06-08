# 観点拡張（伝統芸能・銭湯/サウナ＋月次events） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** tokyo-solo-guide に常設2カテゴリ（伝統芸能・寄席／銭湯・サウナ・温泉）と月次 `events` 配列（歳時・社寺行事・祭り）を追加し、関東日帰り圏も対象に含める。

**Architecture:** 静的サイト。`data/*.json` をフロント `app.js` が fetch して描画。`events` は既存 `exhibitions` と同型スキーマで、会期末日（`period` 末尾 `YYYY-MM-DD`）による自動「終了」薄表示・末尾ソートを再利用する。常設カテゴリは `categories[]` のループ描画で自動表示。

**Tech Stack:** Vanilla JS / JSON データ / python http.server（preview）/ node（構文・JSON検証）。

**正本spec:** `docs/superpowers/specs/2026-06-08-expand-perspectives-design.md`

---

## ファイル構成

| ファイル | 役割 | 変更 |
|----------|------|------|
| `~/.claude/_backups/tokyo-perspectives-202606.json` | researcher が収集する実データ（常設2カテゴリ＋events） | Create（一時） |
| `data/evergreen.json` | 常設カテゴリ。`performing-arts`・`sento-sauna` を追加 | Modify |
| `data/monthly.json` | `events` 配列新設＋山王祭を `exhibitions` から移設 | Modify |
| `app.js` | `events` 表示セクションを1つ追加（exhibitions の直後） | Modify |
| `CHANGELOG.md` | 変更履歴追記 | Modify |

---

## Task 1: 実データ収集（researcher 委任）

**Files:**
- Create: `~/.claude/_backups/tokyo-perspectives-202606.json`

- [ ] **Step 1: researcher に収集を委任**

researcher サブエージェントへ以下を指示する（プロンプト要点）:

```
東京＋関東日帰り圏で「一人で予約・入場・利用が完結する」次の3群を、出典URL（公式サイト）付きで調べ、
結果を C:/Users/ramda/.claude/_backups/tokyo-perspectives-202606.json に直書きせよ（メイン側で整形しない）。

【群A: 伝統芸能・寄席・演芸（常設）】4〜6件
歌舞伎座(一幕見席)/新宿末廣亭/鈴本演芸場/浅草演芸ホール/能楽堂(観世・宝生 等)。
※国立演芸場は建替閉場中につき除外。各 当日席/一幕見の運用・料金・休演日を確認。

【群B: 銭湯・サウナ・温泉（常設）】4〜6件
レトロ銭湯/都市型サウナ/日帰り温泉(箱根・鎌倉等の日帰り圏可)。一人利用可・料金・定休を確認。

【群C: 2026年7月の歳時・社寺行事・祭り（期間限定）】4〜8件
ほおずき市/朝顔市/各社寺の夏の歳時/盆踊り等。花火・相撲は除外。会期に開始終了日があるもの。

出力JSON形式:
{
  "evergreen_performing_arts": [
    {"name":"","area":"","desc":"","fee":"","closed":"","source":"https://"}
  ],
  "evergreen_sento_sauna": [
    {"name":"","area":"","desc":"","fee":"","closed":"","source":"https://"}
  ],
  "events_202607": [
    {"title":"","venue":"","area":"","period":"YYYY-MM-DD〜YYYY-MM-DD","note":"","source":"https://"}
  ]
}

制約:
- period の末尾は必ず YYYY-MM-DD（会期終了の自動判定の前提）。単日開催は同日を開始終了に入れる。
- 都外の area は県名併記（例「鎌倉（神奈川）」）。語順ゆれ禁止。
- fee は群A/Bのみ。群Cは fee を持たず料金は note に文章で含める。
- グループ専用・要同伴・宿泊前提・遠方は除外。
- 各エントリに公式の source 必須。wiki由来の値は公式で裏取り。
完了報告は件数と概要200字程度のみ返せ（全文転記不要）。
```

- [ ] **Step 2: 収集結果を確認**

Run: `node -e "const d=require('C:/Users/ramda/.claude/_backups/tokyo-perspectives-202606.json'); console.log(Object.fromEntries(Object.entries(d).map(([k,v])=>[k,v.length])))"`
Expected: 3キーそれぞれに件数が表示され、群A/B 4件以上・群C 4件以上。

- [ ] **Step 3: period 末尾日付・source の妥当性を目視確認**

`events_202607` の各 `period` が `…YYYY-MM-DD` で終わること、全エントリに `source`（https）があることを確認。
不備があれば researcher に再委任。コミットは不要（一時ファイル）。

---

## Task 2: evergreen.json に常設2カテゴリ追加

**Files:**
- Modify: `data/evergreen.json`

- [ ] **Step 1: `categories[]` 末尾に2カテゴリを追加**

`experience` カテゴリのオブジェクトの後（`categories` 配列の末尾）に、Task 1 の `evergreen_performing_arts` / `evergreen_sento_sauna` を流し込んだ次の2オブジェクトを追加する（`items` は実データで置換）:

```json
,
    {
      "id": "performing-arts",
      "label": "伝統芸能・寄席・演芸",
      "items": [
        { "name": "（Task1 群A の実データ）", "area": "", "desc": "", "fee": "", "closed": "", "source": "https://" }
      ]
    },
    {
      "id": "sento-sauna",
      "label": "銭湯・サウナ・温泉",
      "items": [
        { "name": "（Task1 群B の実データ）", "area": "", "desc": "", "fee": "", "closed": "", "source": "https://" }
      ]
    }
```

注意: 直前の `experience` オブジェクトの閉じ `}` の後にカンマを足してから追記する（JSON 構文）。都外 `area` は県名併記。

- [ ] **Step 2: JSON 妥当性を検証**

Run: `node -e "JSON.parse(require('fs').readFileSync('C:/Users/ramda/projects/tokyo-solo-guide/data/evergreen.json','utf8')); console.log('OK')"`
Expected: `OK`（パースエラーが出ないこと）

- [ ] **Step 3: コミット**

```bash
cd /c/Users/ramda/projects/tokyo-solo-guide
git add data/evergreen.json
git commit -m "feat: 常設に伝統芸能・寄席/銭湯・サウナの2カテゴリを追加"
```

---

## Task 3: monthly.json に events 追加＋山王祭移設

**Files:**
- Modify: `data/monthly.json`

- [ ] **Step 1: 山王祭エントリを `exhibitions` から削除**

`exhibitions` 配列内の「山王祭（江戸三大祭・本祭）」オブジェクト（`venue: "日枝神社"`）を1件まるごと削除する。直前エントリの末尾カンマも調整し、配列が閉じカッコ直前で正しく終わるようにする。

- [ ] **Step 2: `closures` 配列の直後に `events` 配列を追加**

`monthly.json` 末尾、`closures` 配列の後に `events` を追加する。山王祭（Step 1 で削除したもの）＋ Task 1 の `events_202607` を収める:

```json
,
  "events": [
    {
      "title": "山王祭（江戸三大祭・本祭）",
      "venue": "日枝神社",
      "area": "赤坂",
      "period": "2026-06-07〜2026-06-17",
      "note": "2年に1度の本祭。6/12（金）神幸祭は約500名の行列が都心約23kmを巡行。観覧無料（一部有料）。",
      "source": "https://www.tenkamatsuri.jp/"
    }
  ]
```

`events` の `[...]` 内に Task 1 の `events_202607` 全件を続けて追加する（各エントリ間カンマ必須）。`fee` フィールドは持たせない（料金は `note`）。

- [ ] **Step 3: `updated` / `month` を更新**

`monthly.json` 先頭の `"updated"` を作業日（例 `"2026-07-01"`）に、`"month"` を対象月（7月分込みなら `"2026-07"`）に更新する。6月内の追補なら `updated` のみ当日に更新し `month` は `"2026-06"` のままでよい。

- [ ] **Step 4: JSON 妥当性を検証**

Run: `node -e "const d=JSON.parse(require('fs').readFileSync('C:/Users/ramda/projects/tokyo-solo-guide/data/monthly.json','utf8')); console.log('exhibitions',d.exhibitions.length,'events',d.events.length); console.log('山王祭 in exhibitions:', d.exhibitions.some(x=>x.venue==='日枝神社')); console.log('山王祭 in events:', d.events.filter(x=>x.venue==='日枝神社').length)"`
Expected: `events` が1件以上、`山王祭 in exhibitions: false`、`山王祭 in events: 1`

- [ ] **Step 5: 全 events の period 末尾日付を検証**

Run: `node -e "const d=JSON.parse(require('fs').readFileSync('C:/Users/ramda/projects/tokyo-solo-guide/data/monthly.json','utf8')); const bad=d.events.filter(x=>!/\d{4}-\d{2}-\d{2}$/.test(x.period)); console.log(bad.length===0?'OK':JSON.stringify(bad.map(x=>x.title)))"`
Expected: `OK`（末尾が `YYYY-MM-DD` でないものが無いこと）

- [ ] **Step 6: コミット**

```bash
cd /c/Users/ramda/projects/tokyo-solo-guide
git add data/monthly.json
git commit -m "feat: 月次に events配列(歳時・祭り)を新設し山王祭を移設"
```

---

## Task 4: app.js に events 表示セクションを追加

**Files:**
- Modify: `app.js`（`exhibitions` ブロックの直後、`seasonal` ブロックの前）

- [ ] **Step 1: events 描画ブロックを挿入**

`app.js` の `exhibitions` ブロック（`if (monthly.exhibitions?.length) { ... }` の閉じ `}`）の直後、`if (monthly.seasonal?.length) {` の直前に以下を挿入する:

```js
  if (monthly.events?.length) {
    // 会期終了済みは末尾へ（開催中の並びは維持）。exhibitions と同じロジック。
    const events = monthly.events
      .map((x) => ({ ...x, ended: isEnded(x.period) }))
      .sort((a, b) => Number(a.ended) - Number(b.ended));
    addSection(content, nav, "events", "今月の歳時・祭り", (sec) => {
      events.forEach((x) =>
        sec.appendChild(renderItem({
          name: x.title, area: x.area,
          desc: [x.venue, x.period, x.note].filter(Boolean).join("｜"),
          source: x.source, ended: x.ended, mapQuery: x.venue,
        })));
    });
  }
```

- [ ] **Step 2: JS 構文を検証**

Run: `cd /c/Users/ramda/projects/tokyo-solo-guide && node --check app.js`
Expected: 出力なし（構文OK・終了コード0）

- [ ] **Step 3: コミット**

```bash
cd /c/Users/ramda/projects/tokyo-solo-guide
git add app.js
git commit -m "feat: events(歳時・祭り)セクションをフロントに追加"
```

---

## Task 5: preview で描画・自動薄表示・既存非破壊を検証

**Files:** （検証のみ・変更なし）

- [ ] **Step 1: preview 起動**

root の `.claude/launch.json` の tokyo-solo-guide エントリで `preview_start`（既存設定。`http.server ... -d tokyo-solo-guide`）。

- [ ] **Step 2: リロードして描画確認**

`preview_eval` で `location.reload()`（静的サイトは HMR 無効）。
`preview_snapshot` で「今月の歳時・祭り」セクションが描画され、events 各件が表示されること、ナビに `events` リンクが出ることを確認。screenshot がタイムアウトする場合は snapshot で代替。

- [ ] **Step 3: 自動薄表示を擬似データで確認**

`preview_eval` で `data/monthly.json` を直接は書けないため、過去日 period を持つ既存 events（あれば）か、`exhibitions` の既存「終了」表示（チュルリョーニス展=6/14まで等、本日6/8時点では未終了）で `item--ended` 適用ロジックが生きていることを `preview_snapshot` のクラスで間接確認する。
※確実に確認するには monthly.json に一時的に過去日 period の events を1件足してリロード→「終了」バッジ＋末尾ソートを確認し、確認後に削除する（コミットしない）。

- [ ] **Step 4: 既存非破壊を確認**

`preview_snapshot` で exhibitions / seasonal / closures / 常設6カテゴリ（履歴・スポーツ・自然・グルメ・体験＋新規 performing-arts・sento-sauna）が従来通り出ていること、console にエラーが無いこと（`preview_console_logs`）を確認。

- [ ] **Step 5: preview 停止**

`preview_stop`。

---

## Task 6: CHANGELOG 追記とプッシュ

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: CHANGELOG に追記**

`CHANGELOG.md` の最新日付セクション（なければ新規 `## 2026-06-08`）に追記:

```markdown
## 2026-06-08
### Added
- 常設カテゴリ「伝統芸能・寄席・演芸」「銭湯・サウナ・温泉」を追加
- 月次に `events` 配列（歳時・社寺行事・祭り）を新設し、フロントに「今月の歳時・祭り」セクションを追加
- 対象エリアを東京中心＋関東日帰り圏に拡大（area に県名併記）
### Changed
- 「山王祭」を `exhibitions` から `events` へ移設
```

- [ ] **Step 2: コミットしてプッシュ**

```bash
cd /c/Users/ramda/projects/tokyo-solo-guide
git add CHANGELOG.md
git commit -m "docs: CHANGELOG に観点拡張(伝統芸能/銭湯/events)を追記"
git push
```

- [ ] **Step 3: 公開ページで反映確認**

push 後、GitHub Pages（https://ramdamain-commits.github.io/tokyo-solo-guide/ ）で「今月の歳時・祭り」「伝統芸能・寄席・演芸」「銭湯・サウナ・温泉」が表示されることを確認（反映に数分かかる場合あり）。

---

## Task 7: LifeOps 運用反映

**Files:**
- Modify: `setting/projects.json`、`MEMORY.md`、`TASKS.md`、`setting/changelog.json`

- [ ] **Step 1: 運用台帳を更新順に反映**

CLAUDE.md の更新順序に従う: `setting/projects.json`（tokyo-solo-guide の note/最終更新日）→ `MEMORY.md`（プロジェクトメモ tokyo_solo_guide 行）→ `TASKS.md`（次アクション）→ `setting/changelog.json` 追記。
公開PJのため台帳本文に居住エリア・個人属性等の固有値を書かない（抽象表現）。

- [ ] **Step 2: export 実行＋リークチェック**

```
/c/Program\ Files/PowerShell/7/pwsh.exe -NoProfile -ExecutionPolicy Bypass -File 'C:\Users\ramda\projects\setting\scripts\Invoke-LifeOpsConsole.ps1' -Action export -SkipOpen
```
その後 `life-ops-export.json` を機微語（居住エリア名・年収・偏差値・店名等）で grep し、リークが無いことを確認してから portal を push。

- [ ] **Step 3: setting / portal をコミット**

setting・portal 各repoで `git diff --stat` を確認し想定外の変更が無いことを見てからコミット＋push。

---

## 完了条件

- [ ] 常設に2カテゴリが表示される
- [ ] 「今月の歳時・祭り」セクションが表示され、会期終了で自動薄表示される
- [ ] 山王祭が events に1件のみ存在（exhibitions から消えている）
- [ ] 全 events の period 末尾が `YYYY-MM-DD`、全エントリに公式 source
- [ ] console エラーなし・既存セクション非破壊
- [ ] CHANGELOG 追記・push 済み・公開ページ反映
- [ ] LifeOps 台帳反映＋export リークチェック済み
