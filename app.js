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

function renderItem({ name, area, desc, fee, closed, source }) {
  const wrap = el("div", "item");
  const meta = [area, fee, closed && `休: ${closed}`].filter(Boolean).join(" / ");
  wrap.innerHTML =
    `<div class="item__head"><span class="item__name">${name}</span>` +
    `<span class="item__meta">${meta}</span></div>` +
    (desc ? `<div class="item__desc">${desc}</div>` : "") +
    srcLink(source);
  return wrap;
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
    addSection(content, nav, "exhibitions", "今月の企画展", (sec) => {
      monthly.exhibitions.forEach((x) =>
        sec.appendChild(renderItem({
          name: x.title, area: x.area,
          desc: [x.venue, x.period, x.note].filter(Boolean).join("｜"),
          source: x.source,
        })));
    });
  }
  if (monthly.seasonal?.length) {
    addSection(content, nav, "seasonal", "季節の見頃", (sec) => {
      monthly.seasonal.forEach((x) =>
        sec.appendChild(renderItem({ name: x.title, area: x.spot, desc: `見頃: ${x.peak}`, source: x.source })));
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
