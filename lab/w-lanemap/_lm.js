// w-lanemap — созвон 05.11, задача 10 «Карта линий» (дирижёр 05.11: «забрать карту линий из Figma „eS — Drafts“ (Widget:Map) и перерисовать под наш стиль:
// герои по линиям, перевес „+2.8“ на пару; новый мини-виджет, НЕ в правой колонке»). Подложка 400 × 400 и 5 иконок ролей — из Figma (05.11/figma-карта/), герои — наши иконки мини-карты.
// Иконки ролей сверены с данными (и с расстановкой в Figma): 1 меч — керри (поз. 1) · 2 лук — мид (2) · 3 щит с молнией — оффлейн (3) · 4 рука с огнём — поз. 4 · 5 рука с искрами — поз. 5.
// Линия игрока — lane_role из OpenDota (1 лёгкая, 2 центр, 3 сложная; у саппортов — линия, где стояли); позиция — как в нижней строке (по нетворсу и линии).
// Radiant: лёгкая — низ, сложная — верх; Dire — наоборот. Перевес пары — разница нетворса героев линии к 10-й минуте (на идущей карте раньше 10′ — на сейчас), в тысячах.
// Карта — та, что открыта (виджет графика на странице); во вкладках «Статистика» и «Новости» виджета нет.
// LM — вид: map — карта + список линий справа · list — без карты: три строки линий с перевесом полосой · big — только карта, крупно, перевес на карте
(() => {
  const GD = window.GS_DATA, LM = window.LM || 'map', esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const NMS = (window.GS_NAMES && GS_NAMES.NAME) || {};
  const teamOf = id => ({ name: (window.GS_TOURNAMENT && GS_TOURNAMENT.names && GS_TOURNAMENT.names[id] || '').trim() || NMS[id] || String(id), logo: `img/teams/${id}.png` });
  const posOf = ps => { const by = [...ps].sort((a, b) => b.net_worth - a.net_worth), out = new Map(), cores = by.slice(0, 3), sups = by.slice(3), free = [1, 2, 3];
    [2, 1, 3].forEach(r => { const c = cores.find(q => q.lane_role === r && !out.has(q)); if (c && free.includes(r)) { out.set(c, r); free.splice(free.indexOf(r), 1); } });
    cores.filter(q => !out.has(q)).forEach(q => out.set(q, free.shift())); sups.forEach((q, i) => out.set(q, 4 + i)); return out; };
  const nwAt = (p, t) => { const a = p.nw_t || []; if (!a.length) return p.net_worth || 0; return a[Math.max(0, Math.min(a.length - 1, Math.floor(t / 60)))] || 0; };
  const k1 = v => (Math.abs(v) / 1000).toFixed(1).replace('.', ',') + 'k';
  const ROLE = ['', 'Керри', 'Мид', 'Оффлейн', 'Поз. 4', 'Поз. 5'];
  // точки на карте (доли 0–1), по расстановке Figma: [линия][сторона] → две точки (керри / оффлейнер первым, саппорт вторым)
  const SPOT = { top: { r: [[.13, .42], [.24, .42]], d: [[.24, .16], [.35, .16]] }, mid: { r: [[.43, .57]], d: [[.56, .46]] }, bot: { r: [[.56, .81], [.68, .81]], d: [[.75, .57], [.86, .57]] } };
  const LBL = { top: [.2, .29], mid: [.62, .63], bot: [.8, .7] }, NAME = { top: 'Верх', mid: 'Центр', bot: 'Низ' };
  const laneOf = (p, rad) => p.lane_role === 2 ? 'mid' : (p.lane_role === 1) === rad ? 'bot' : 'top';

  const cur = () => { const w = [...document.querySelectorAll('.bw [data-wd="gold"]')].find(x => x._g2 && x.offsetParent); if (!w) return null; const o = w._g2.o; return { m: o.m, t: o.state === 'post' ? o.m.duration : Math.min(o.t, o.m.duration), bw: w.closest('.bw') }; };
  const lanes = (m, t) => { const at = Math.min(t, 600), out = { top: { r: [], d: [] }, mid: { r: [], d: [] }, bot: { r: [], d: [] } };
    [true, false].forEach(rad => { const ps = m.players.filter(p => p.isRadiant === rad), P = posOf(ps); ps.forEach(p => { const h = GD.heroes[p.hero_id] || {}, pl = window.DB && DB.player(p.account_id);
      out[laneOf(p, rad)][rad ? 'r' : 'd'].push({ p, pos: P.get(p), icon: h.icon || '', hero: h.name || '', nick: pl ? pl.nick : '', nw: nwAt(p, at) }); }); });
    Object.values(out).forEach(L => ['r', 'd'].forEach(s => L[s].sort((a, b) => a.pos - b.pos))); // керри / мид / оффлейн раньше саппорта
    Object.entries(out).forEach(([k, L]) => { L.adv = L.r.reduce((a, x) => a + x.nw, 0) - L.d.reduce((a, x) => a + x.nw, 0); });
    return { out, at }; };
  const role = n => `<i class="lm-role" style="-webkit-mask-image:url(../w-lanemap/role${n}.svg);mask-image:url(../w-lanemap/role${n}.svg)" title="${ROLE[n]}"></i>`;
  // nwT — у героя подпись: его нетворс на эту секунду (v7: карта «связана с золотом»)
  const dot = (x, side, xy, nwT) => `<span class="lm-h lm-h--${side}" style="left:${(xy[0] * 100).toFixed(1)}%;top:${(xy[1] * 100).toFixed(1)}%" title="${esc(x.hero)}${x.nick ? ' · ' + esc(x.nick) : ''} · ${ROLE[x.pos]}"><img src="${esc(x.icon)}" alt="">${role(x.pos)}${nwT != null ? `<em class="lm-nw num">${k1(nwAt(x.p, nwT))}</em>` : ''}</span>`;
  const adv = (k, L, A, B) => { if (Math.abs(L.adv) < 50) return `<span class="lm-adv is-eq" style="left:${LBL[k][0] * 100}%;top:${LBL[k][1] * 100}%">0</span>`;
    const r = L.adv > 0; return `<span class="lm-adv ${r ? 'is-r' : 'is-d'}" style="left:${LBL[k][0] * 100}%;top:${LBL[k][1] * 100}%" title="${esc((r ? A : B).name)} впереди на линии">+${k1(L.adv)}</span>`; };
  // лишний герой на линии (например, двое в центре — роумер) — рядом с последней точкой, правее
  const sp = (S, i) => S[i] || [S[S.length - 1][0] + .11 * (i - S.length + 1), S[S.length - 1][1]];
  const mapHtml = (D, A, B, nwT) => `<div class="lm-map${nwT != null ? ' has-nw' : ''}"><img class="lm-bg" src="../w-lanemap/map.png" alt="">${['top', 'mid', 'bot'].map(k => { const L = D.out[k]; return L.r.map((x, i) => dot(x, 'r', sp(SPOT[k].r, i), nwT)).join('') + L.d.map((x, i) => dot(x, 'd', sp(SPOT[k].d, i), nwT)).join('') + adv(k, L, A, B); }).join('')}</div>`;
  const listHtml = (D, A, B, bar) => `<div class="lm-ls">${['top', 'mid', 'bot'].map(k => { const L = D.out[k], tot = Math.max(1, L.r.reduce((a, x) => a + x.nw, 0) + L.d.reduce((a, x) => a + x.nw, 0)), p = L.r.reduce((a, x) => a + x.nw, 0) / tot * 100, r = L.adv >= 0;
      const hs = (xs, side) => xs.map(x => `<span class="lm-li lm-h--${side}" title="${esc(x.hero)}${x.nick ? ' · ' + esc(x.nick) : ''}"><img src="${esc(x.icon)}" alt="">${role(x.pos)}</span>`).join('');
      return `<div class="lm-row"><span class="lm-k">${NAME[k]}</span><span class="lm-side">${hs(L.r, 'r')}</span>${bar ? `<span class="lm-bar"><i style="width:${p.toFixed(1)}%"></i></span>` : ''}<b class="lm-v num ${Math.abs(L.adv) < 50 ? '' : r ? 'is-r' : 'is-d'}">${Math.abs(L.adv) < 50 ? '0' : (r ? '◂ ' : '') + '+' + k1(L.adv) + (r ? '' : ' ▸')}</b><span class="lm-side is-r">${hs(L.d, 'd')}</span></div>`; }).join('')}</div>`;

  const build = () => { const c = cur(); if (!c) return ''; const D = lanes(c.m, c.t), A = teamOf(c.m.radiant_team_id), B = teamOf(c.m.dire_team_id), mm = Math.floor(D.at / 60);
    const hd = `<div class="lm-hd"><b>Линии</b><small>перевес по нетворсу ${c.t < 600 ? `на ${mm}′` : 'к 10′'} · <span class="lm-tm is-r"><img src="${esc(A.logo)}" alt="">${esc(A.name)}</span> · <span class="lm-tm is-d"><img src="${esc(B.logo)}" alt="">${esc(B.name)}</span></small></div>`;
    const body = LM === 'list' ? listHtml(D, A, B, true) : LM === 'big' ? mapHtml(D, A, B) : `<div class="lm-two">${mapHtml(D, A, B)}${listHtml(D, A, B, false)}</div>`;
    return `<section class="lm lm--${LM}">${hd}${body}</section>`; };
  // v4–v6 (дирижёр 05.11: «я думал её вставить в пики — попробуй несколько версий, чтобы она учитывалась в пиках, на странице „Статистика“»):
  //   карту и линии отдаём наружу — их рисует «Эта серия» (w-stats-2, WSG_LM); отдельный виджет под блоком матча — только если задан LM
  window.LMAP = { lanes, teamOf, role, k1, NAME,
    map: (m, t, nwT) => mapHtml(lanes(m, t), teamOf(m.radiant_team_id), teamOf(m.dire_team_id), nwT),
    list: (m, t) => listHtml(lanes(m, t), teamOf(m.radiant_team_id), teamOf(m.dire_team_id), true) };
  if (!window.LM) return;
  let LAST = '';
  const paint = () => { const c = cur(), main = document.querySelector('.gm-main'), box = document.querySelector('section.lm');
    if (!c || !main) { if (box) box.remove(); LAST = ''; return; } const h = build(); if (!h) return;
    if (!box) { LAST = h; c.bw.insertAdjacentHTML('afterend', h); return; } if (h !== LAST) { LAST = h; box.outerHTML = h; } };
  // LM_OPEN (дирижёр 05.11: «открывай сразу тот сегмент, где она должна быть») — только в лабе: при загрузке жмём таб идущей карты (или последней Map)
  let opened = !window.LM_OPEN; const open = () => { if (opened) return; const ts = [...document.querySelectorAll('.ws-tabs .h3-tab[data-a="mseg"]')], t = ts.find(x => x.classList.contains('is-live')) || ts.filter(x => /Map/.test(x.textContent)).pop(); if (t) { opened = true; if (!t.classList.contains('on')) t.click(); } };
  new MutationObserver(() => { open(); paint(); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(paint, 1500);
})();
