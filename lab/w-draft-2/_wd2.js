// w-draft-2 — ход драфта в центре вместо графика (созвон 06.11 §4.2, дирижёр 06.11: «в состоянии драфта показать, как идёт драфт;
// график появляется, когда драфт прошёл и матч начался»). Ставится после _gs.js. Работает только в состоянии «Драфт» (WLS_ST = draft).
// WD2 — вид: dota (как в Доте) · cm (таймлайн ходов сверху вниз) · live (пятёрки растут) · phase (по фазам). Код видов — ../w-draft/_wdraft.js.
// Драфт кладём поверх места графика (график под ним скрыт и не трогается) — высота та же, строка команд внизу остаётся.
(() => { const PRE = !!window.WD2_PRE && window.WLS_ST === 'pre';
  // WD2_PRE (страница v80): состояние «Пики готовы» открыто сразу — итог шанса по драфту уже стоит внизу графика, без анимаций; пики внизу — как у страницы
  if (PRE) { window.WDR_START = 24; window.WD2_FILL = false; window.WD2_NOW = false; window.WD2_NODATA = false; window.WD2_GO = false; document.documentElement.classList.add('wd2-instant'); }
  if (!window.WD2 || (window.WLS_ST !== 'draft' && !PRE)) return;
  document.documentElement.classList.add('wd2');
  if (window.WD2_SKIN) document.documentElement.classList.add('wd2-skin', 'wd2-skin--' + window.WD2_SKIN);
  if (window.WD2_SOFT) document.documentElement.classList.add('wd2-soft');
  if (window.WD2_NOPH) document.documentElement.classList.add('wd2-noph');   // без подписей фаз и линий — только график   // v12+: вид без фиолетового (panel · quiet · card)
  // v9 (WD2_NODATA): в нижней панели всё на месте, но данных ещё нет — золото, перевес, K/D/A, счёт и время — «—»
  if (window.WD2_NODATA) { document.documentElement.classList.add('wd2-nodata'); setInterval(() => { if (!document.documentElement.classList.contains('wd2-nodata')) return; const r = document.querySelector('.wl-pre .d3-row'); if (!r) return; r.querySelectorAll('.wb2-at, .wb2-nt, .wb2-cd b, .d3-sc b, .d3-k').forEach(e => { if (e.textContent !== '—') { if (e.__orig == null) e.__orig = e.innerHTML; e.textContent = '—'; } }); }, 300); }
  // v10 (WD2_END, дирижёр 06.11: «финальное состояние — не начинать сначала, а показать график до 12′, когда матч ещё не начался»): драфт прошёл один раз —
  // через 1,5 с драфт в центре гаснет, под ним — график с прогнозом до 12′ («Пики готовы»); внизу пики остаются, «—» сменяются на 0.0k и 0 : 0
  if (window.WD2_END) { window.WDR_ONCE = true; let t0 = 0; setInterval(() => { const H = document.documentElement; if (H.classList.contains('wd2-done') || !window.WDRAFT || WDRAFT.step() < 24) return; if (!t0) t0 = Date.now(); if (Date.now() - t0 > 2000) H.classList.add('wd2-fin-in'); /* итог проявился — снимаем его анимацию заранее, иначе съезд не анимируется */ if (!PRE && Date.now() - t0 < (window.WD2_FIN ? 5000 : 1500)) return;
    // v18+ (WD2_DOCK, дирижёр 06.11: «шансы по драфту до начала матча — уходят вниз графика, на место ромбиков»): итог не гаснет, а уменьшается и съезжает к низу графика и остаётся там
    if (window.WD2_DOCK) { const bx = document.querySelector('.wd2-box'), f = bx && bx.querySelector('.c9-fin'); if (f) { const b = bx.getBoundingClientRect(), r = f.getBoundingClientRect(); bx.style.setProperty('--dy', (b.bottom - 64 - (r.top + r.height / 2)) + 'px'); } H.classList.add('wd2-dock'); }
    H.classList.add('wd2-done'); H.classList.remove('wd2-nodata');
    // v18+ (WD2_GO, дирижёр 06.11: «увидеть, как пропадает, когда матч начинается — растворяться плавно»): через 6 с после того, как итог съехал вниз, — «матч начался»: итог растворяется
    if (window.WD2_GO) setTimeout(() => H.classList.add('wd2-go'), 6000); document.querySelectorAll('.wl-pre .d3-row *').forEach(e => { if (e.__orig != null) { e.innerHTML = e.__orig; e.__orig = null; } }); }, 250); }
  const tick = () => { const box = document.querySelector('.wl-pre'), g = box && box.querySelector('[data-wd="gold"]'); if (!g || !g._g2 || !window.WDRAFT) return;
    const par = g.parentElement; let d = par.querySelector(':scope > .wd2-box');
    if (!d) { d = document.createElement('div'); d.className = 'wd2-box'; d.setAttribute('data-wd', 'draft'); par.appendChild(d);
      WDRAFT.render(d, { m: g._g2.o.m, n: g._g2.o.n || 1, state: 'draft', look: window.WD2 }); }
    const st = `top:${g.offsetTop}px;height:${g.offsetHeight}px`; if (d.__st !== st) { d.__st = st; d.style.cssText = st; }
    // v5–v7 (WD2_FILL): сделанные пики встают в строку игроков под центром — портрет героя в слот игрока (по нику, иначе по порядку пиков стороны)
    if (window.WD2_FILL) { const m = g._g2.o.m, st = WDRAFT.step(), PB = WDRAFT.order(m), row = box.querySelector('.d3-row'); if (!row) return;
      for (const [side, t] of [['a', 0], ['b', 1]]) { const sl = [...row.querySelectorAll(`.d3-five.${side} .wl-slot`)]; if (!sl.length) continue;
        const picks = PB.map((x, i) => [x, i]).filter(([x, i]) => x.team === t && x.is_pick && i < st).map(([x]) => x), used = new Set();
        const place = (x) => { const nk = WDRAFT.nick(m, x.hero_id); let k = sl.findIndex((el, j) => !used.has(j) && (el.querySelector('.d3-n') || {}).textContent === nk); if (k < 0) k = sl.findIndex((el, j) => !used.has(j)); if (k >= 0) used.add(k); return k; };
        const want = new Map(); picks.forEach(x => { const k = place(x); if (k >= 0) want.set(k, x); });
        // v9 (WD2_NOW): текущий пик этой стороны — слот, куда он встанет, светится
        const cx = PB[st], nk = cx && cx.is_pick && cx.team === t ? place(cx) : -1;
        sl.forEach((el, j) => el.classList.toggle('wd2-now', j === nk && !!window.WD2_NOW));
        // единый источник (дирижёр 06.11): герой в слоте — тот же, что в «Составах» и в «Пики готовы» (ряд игрока в .ws28, как берёт ../w-lane-2/_wls.js); нет — из драфта карты
        const col = document.querySelectorAll('.ws28 > div')[t], rows = col ? [...col.querySelectorAll('.ws37-r')] : [];
        const sost = j => { const r = rows[j], im = r && r.querySelector('.ws24-h'); return im ? im.getAttribute('src').replace('/icon/', '/') : ''; };
        sl.forEach((el, j) => { const i = el.querySelector('.d3-i > i'); if (!i) return; const x = want.get(j), src = x ? (window.WD2_ONE && sost(j) || WDRAFT.hero(x.hero_id).img) : '';
          if (i.__src !== src) { i.__src = src; i.style.cssText = src ? `background:url(${src}) center/cover;` : ''; el.classList.toggle('wd2-in', !!src); if (src) el.animate([{ transform: 'scale(1.15)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' }); } }); } } };
  setInterval(tick, 250); document.addEventListener('DOMContentLoaded', tick);
})();
