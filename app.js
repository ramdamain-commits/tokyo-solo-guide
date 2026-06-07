async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`fetch failed: ${path}`);
  return res.json();
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function srcLink(url) {
  return url ? `<span class="item__src">出典: <a href="${url}" target="_blank" rel="noopener">公式</a></span>` : "";
}

// 施設名で Google マップ検索リンクを生成（クリックで地図と住所が開く）。
function mapLink(query) {
  if (!query) return "";
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return `<span class="item__map">📍 <a href="${url}" target="_blank" rel="noopener">地図</a></span>`;
}

function renderItem({ name, area, desc, fee, closed, source, ended, mapQuery }) {
  const wrap = el("div", ended ? "item item--ended" : "item");
  const meta = [area, fee, closed && `休: ${closed}`].filter(Boolean).join(" / ");
  const badge = ended ? `<span class="item__badge">終了</span>` : "";
  const links = [srcLink(source), mapLink(mapQuery || name)].filter(Boolean).join(" ・ ");
  wrap.innerHTML =
    `<div class="item__head"><span class="item__name">${badge}${name}</span>` +
    `<span class="item__meta">${meta}</span></div>` +
    (desc ? `<div class="item__desc">${desc}</div>` : "") +
    (links ? `<div class="item__links">${links}</div>` : "");
  return wrap;
}

// period 文字列から会期末日を取り出す。最後の YYYY-MM-DD を採用。
// JST ズレ回避のため new Date(y, m-1, d)（ローカル）で生成する。
function parseEndDate(period) {
  if (!period) return null;
  const matches = period.match(/\d{4}-\d{2}-\d{2}/g);
  if (!matches || !matches.length) return null;
  const [y, m, d] = matches[matches.length - 1].split("-").map(Number);
  return new Date(y, m - 1, d);
}

// 会期末日が今日より前なら終了済み（当日はまだ開催中扱い）。
function isEnded(period) {
  const end = parseEndDate(period);
  if (!end) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return end < today;
}

function addSection(parent, nav, id, label, render) {
  const sec = el("section");
  sec.id = id;
  sec.appendChild(el("h2", null, label));
  render(sec);
  parent.appendChild(sec);
  const a = el("a", null, label);
  a.href = `#${id}`;
  nav.appendChild(a);
}

async function main() {
  const content = document.getElementById("content");
  const nav = document.getElementById("nav");
  const [evergreen, monthly] = await Promise.all([
    loadJSON("data/evergreen.json"),
    loadJSON("data/monthly.json"),
  ]);

  document.getElementById("updated").textContent =
    `今月のデータ更新: ${monthly.updated}（${monthly.month}）`;

  // 月次セクション（先頭）
  if (monthly.exhibitions?.length) {
    // 会期終了済みは末尾へ（開催中の並びは維持）。
    const exhibitions = monthly.exhibitions
      .map((x) => ({ ...x, ended: isEnded(x.period) }))
      .sort((a, b) => Number(a.ended) - Number(b.ended));
    addSection(content, nav, "exhibitions", "今月の企画展", (sec) => {
      exhibitions.forEach((x) =>
        sec.appendChild(renderItem({
          name: x.title, area: x.area,
          desc: [x.venue, x.period, x.note].filter(Boolean).join("｜"),
          source: x.source, ended: x.ended, mapQuery: x.venue,
        })));
    });
  }
  if (monthly.seasonal?.length) {
    addSection(content, nav, "seasonal", "季節の見頃", (sec) => {
      monthly.seasonal.forEach((x) =>
        sec.appendChild(renderItem({ name: x.title, area: x.spot, desc: `見頃: ${x.peak}`, source: x.source, mapQuery: x.spot })));
    });
  }
  if (monthly.closures?.length) {
    addSection(content, nav, "closures", "休館・展示替", (sec) => {
      monthly.closures.forEach((x) =>
        sec.appendChild(renderItem({ name: x.venue, desc: x.period, source: x.source })));
    });
  }

  // 常設セクション
  evergreen.categories.forEach((cat) => {
    addSection(content, nav, cat.id, cat.label, (sec) => {
      cat.items.forEach((it) => sec.appendChild(renderItem(it)));
    });
  });
}

main().catch((e) => {
  document.getElementById("content").innerHTML =
    `<p style="color:#f87171">読み込みエラー: ${e.message}</p>`;
});
