// gs-upgrade v1 — страница матча глубже, как у аналитиков (D2PT, OpenDota, STRATZ; разбор: figma-разбор/14-аналитика/analysis/match.md, «Что добавить»).
// Поверх v85: чужие файлы не трогаем — читаем их состояние (график: host._g2, нижняя строка: .d3-row) и дорисовываем своё рядом.
//  1. Шанс победы: линия шанса на графике (фиолетовая, 100% Radiant — верх, 100% Dire — низ), метка «после драфта», плашка с цифрой.
//  2. Итог линий на 10′: в live / post после 10′ под игроком «выиграл / ничья / проиграл ±золото» вместо прогноза easy / hard.
//  3. Предметы игрока с минутой покупки — подсказка при наведении на игрока в нижней строке (компьютер).
//  4. Телефон: строка «шанс · линии · золото» над графиком.
//  5. «Итог карты» (после карты): кто кого убил и драки — те же, что ромбы графика.
//  6. «Статистика» → карта линий: здания и контроль карты.
//  7. «Опыт» — второй линией к золоту, переключатель на графике.
//  8. «История» — карта текстом из событий, строками как в новостях.
//  Баги: цифры золота в нижней строке во время наведения на график («74. k») · телефон, «О матче» (в _upm.css).
// Данные карт — настоящие (GS_DATA, OpenDota). ‼️ Пример (своей модели нет): шанс победы, минута покупки у части предметов, контроль карты.
(() => {
  const D = window.GS_DATA; if (!D) return;
  const NM = window.GS_NAMES || { NAME: {}, SHORT: {} };
  const ICONS = window.UPM_ICONS || new Set(), SKIP = window.UPM_SKIP || new Set(), BLD = window.UPM_BLD || {};
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const plural = (n, a, b, c) => { const d = n % 10, h = n % 100; return d === 1 && h !== 11 ? a : d >= 2 && d <= 4 && (h < 12 || h > 14) ? b : c; };
  const k1 = v => (Math.abs(v) / 1000).toFixed(1) + 'k';
  const sg = v => (v < 0 ? '−' : '+') + k1(v);
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const desk = () => document.body.classList.contains('is-desk');
  // команды — только из общей базы страницы (GS_NAMES), лого — из репо
  const tName = id => NM.NAME[id] || (D.teams[id] || {}).name || '—';
  const tShort = id => NM.SHORT[id] || tName(id);
  const logo = id => `img/teams/${id}.png`;
  const hero = id => D.heroes[id] || { name: '—', icon: '', img: '' };
  const HSHORT = Object.fromEntries(Object.entries(D.heroes).map(([id, h]) => [h.short, +id]));
  const nick = p => { const r = window.DB && DB.player && DB.player(p.account_id); return (r && r.nick) || hero(p.hero_id).name; };
  const advAt = (a, t) => { if (!a || !a.length) return 0; const i = clamp(Math.floor(t / 60), 0, a.length - 1), f = t / 60 - i; return a[i] + ((a[i + 1] ?? a[i]) - a[i]) * clamp(f, 0, 1); };
  const findMap = id => { for (const s of D.series) for (const m of s.maps) if (m.match_id === id) return m; return null; };

  // ── график: состояние w-gold-2 (видимый виджет золота)
  const gInfo = () => {
    const h = [...document.querySelectorAll('.bw [data-wd="gold"]')].find(x => x._g2 && x.offsetParent); if (!h) return null;
    const S = h._g2, o = S.o; if (!o || !o.m) return null;
    const now = o.state === 'post' ? o.m.duration : Math.min(o.t || 0, o.m.duration);
    return { h, S, o, m: o.m, now, sc: S.sc != null && S.sc <= now ? S.sc : null, st: o.state, live: o.state === 'live' };
  };

  // ── 1. шанс победы
  // после драфта — та же формула, что у экрана драфта (w-draft/_wdraft.js, chance): ‼️ пример, модели по героям нет
  const DP = new Map();
  const draftP = m => { if (DP.has(m)) return DP.get(m); let v = 50;
    [...m.picks_bans].sort((a, b) => a.order - b.order).forEach(x => { const h = ((x.hero_id * 37) % 11) - 5, k = x.is_pick ? 1.6 : .5; v = clamp(v + (x.team === 0 ? 1 : -1) * h * k, 18, 82); });
    DP.set(m, Math.round(v)); return Math.round(v); };
  // ‼️ пример: лайв-модели нет. Шанс Radiant = драфт (к 40′ почти забыт) + перевес золота и опыта относительно минуты
  const winP = (m, t, g = advAt(m.radiant_gold_adv, t), x = advAt(m.radiant_xp_adv, t)) => { const p0 = draftP(m) / 100, L0 = Math.log(p0 / (1 - p0));
    const z = L0 * Math.max(.15, 1 - t / 2400) + 2.2 * g / (8000 + 3.2 * t) + .8 * x / (10000 + 4 * t);
    return clamp(100 / (1 + Math.exp(-z)), 3, 97); };

  // ── 2. линии к 10′ — как карта линий (w-lanemap): сумма нетворса героев линии на 10-й минуте, Radiant минус Dire
  const laneOf = p => p.lane_role === 2 ? 'mid' : (p.lane_role === 1) === p.isRadiant ? 'bot' : 'top';
  const LNAME = { top: 'верх', mid: 'центр', bot: 'низ' };
  const nw10 = p => { const a = p.nw_t || []; return a.length ? a[Math.min(a.length - 1, 10)] || 0 : 0; };
  const DRAW = 400; // меньше 400 золота на линию — ничья
  const lanes10 = m => { const L = { top: 0, mid: 0, bot: 0 }; m.players.forEach(p => { L[laneOf(p)] += (p.isRadiant ? 1 : -1) * nw10(p); });
    let r = 0, d = 0; Object.values(L).forEach(v => { if (v >= DRAW) r++; else if (v <= -DRAW) d++; }); return { L, r, d }; };

  function lanesRow(gi) {
    document.querySelectorAll('.d3-row .d3-h[data-hc]').forEach(h => {
      const ln = h.querySelector('.wb-ln'); if (!ln) return;
      const [mid, acc] = h.dataset.hc.split('|'), m = findMap(+mid), p = m && m.players.find(q => String(q.account_id) === acc);
      const on = !!(p && gi && gi.m === m && gi.st !== 'pre' && gi.now >= 600);
      if (!on) { if (ln.dataset.upm0 != null) { ln.textContent = ln.dataset.upm0; ln.className = ln.dataset.upmC; ln.title = ln.dataset.upmT; delete ln.dataset.upm0; } return; }
      if (ln.dataset.upm0 == null) { ln.dataset.upm0 = ln.textContent; ln.dataset.upmC = ln.className; ln.dataset.upmT = ln.title; }
      const lane = laneOf(p), v = lanes10(m).L[lane] * (p.isRadiant ? 1 : -1), c = v >= DRAW ? 'up' : v <= -DRAW ? 'dn' : 'eq';
      const tx = desk() ? (c === 'up' ? `выиграл ${sg(v)}` : c === 'dn' ? `проиграл ${sg(v)}` : `ничья ${sg(v)}`) : (c === 'up' ? '▲ ' : c === 'dn' ? '▼ ' : '= ') + sg(v);
      if (ln.textContent !== tx) ln.textContent = tx;
      const cl = `wb-ln upm-ln ${c}`; if (ln.className !== cl) ln.className = cl;
      ln.title = `Линия «${LNAME[lane]}» к 10′: ${c === 'up' ? 'выиграна' : c === 'dn' ? 'проиграна' : 'ничья'}, ${sg(v)} по нетворсу героев линии`;
    });
  }

  // ── 3. предметы с минутой покупки
  // минута — из purchase_log (OpenDota пишет туда только ключевые покупки); ‼️ пример — у остальных предметов минута оценочная (стабильная, не случайная)
  const itemTime = (p, key, m) => {
    const pl = (p.purchase_log || []).find(x => x.key === key); if (pl) return pl.time;
    const h = [...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, p.hero_id * 7);
    let t = /^(boots|phase_boots|power_treads|arcane_boots|tranquil_boots)$/.test(key) ? 300 + h % 240
      : /^(magic_wand|magic_stick|bracer|null_talisman|wraith_band|bottle|quelling_blade|ring_of_basilius|soul_ring|orb_of_corrosion|falcon_blade)$/.test(key) ? 200 + h % 300
      : /^travel_boots/.test(key) ? m.duration * .78 : 720 + (h % 1000) / 1000 * Math.max(60, m.duration * .85 - 720);
    const bl = (p.purchase_log || []).find(x => x.key === 'blink'); if (bl && /_blink$/.test(key)) t = Math.max(t, bl.time + 360); // улучшенный блинк — позже обычного
    return Math.round(Math.min(t, m.duration - 30));
  };
  const itemsOf = (p, m, now) => [...new Set([...(p.purchase_log || []).map(x => x.key), ...(p.items || [])])].filter(k => k && !SKIP.has(k))
    .map(k => ({ k, t: itemTime(p, k, m) })).filter(x => x.t <= now).sort((a, b) => a.t - b.t);
  const itemIc = k => { const nm = (D.items[k] || {}).name || k.replace(/_/g, ' ');
    return ICONS.has(k) ? `<img src="img/items/${esc(k)}.png" alt="">` : `<i class="upm-it0">${esc(nm.replace(/[^A-Za-zА-Яа-я]/g, '').slice(0, 2))}</i>`; };
  let tip = null, tipH = null;
  function tipShow(h) {
    const gi = gInfo(), [mid, acc] = h.dataset.hc.split('|'), m = findMap(+mid), p = m && m.players.find(q => String(q.account_id) === acc); if (!p) return;
    const now = gi && gi.m === m ? (gi.sc ?? gi.now) : m.duration, pre = gi && gi.m === m && gi.st === 'pre';
    const its = pre ? [] : itemsOf(p, m, now), H = hero(p.hero_id), when = pre ? 'карта не началась' : gi && gi.m === m && gi.st !== 'post' || (gi && gi.sc != null) ? `к ${mmss(now)}` : 'итог карты';
    if (!tip) { tip = document.createElement('div'); tip.className = 'upm-tip'; document.body.appendChild(tip); }
    tip.innerHTML = `<div class="upm-tip-hd"><img src="${esc(H.icon)}" alt=""><b>${esc(nick(p))}</b><small>${esc(H.name)}</small><em class="num">${when}</em></div>
      ${its.length ? `<div class="upm-tip-it">${its.map(x => `<span class="upm-it" title="${esc((D.items[x.k] || {}).name || x.k)} · ${mmss(x.t)}">${itemIc(x.k)}<em class="num">${Math.floor(x.t / 60)}′</em></span>`).join('')}</div>`
        : `<div class="upm-tip-0">${pre ? 'Предметы появятся с началом карты' : 'Больших покупок пока нет'}</div>`}
      <div class="upm-tip-ft">Предметы · минута покупки</div>`;
    if (h.title) { h.dataset.upmTitle = h.title; h.removeAttribute('title'); }
    tipH = h; tip.classList.add('on'); tipPos();
  }
  function tipPos() { if (!tip || !tipH) return; const r = tipH.getBoundingClientRect(), w = tip.offsetWidth, hh = tip.offsetHeight;
    tip.style.left = clamp(r.left + r.width / 2 - w / 2, 8, innerWidth - w - 8) + 'px'; tip.style.top = Math.max(8, r.top - hh - 8) + 'px'; }
  function tipHide() { if (tipH && tipH.dataset.upmTitle) { tipH.title = tipH.dataset.upmTitle; delete tipH.dataset.upmTitle; } tipH = null; if (tip) tip.classList.remove('on'); }
  document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse' || !desk()) return; const h = e.target.closest && e.target.closest('.d3-row .d3-h[data-hc]'); if (h && h !== tipH) tipShow(h); }, true);
  document.addEventListener('pointerout', e => { if (!tipH) return; const to = e.relatedTarget; if (!to || !tipH.contains(to)) { if (e.target === tipH || tipH.contains(e.target)) tipHide(); } }, true);
  addEventListener('scroll', tipHide, true);

  // ── 4. телефон: суть над графиком
  function phoneSum(gi) {
    const d3 = gi && gi.h.parentElement; let el = document.querySelector('.upm-sum');
    if (!gi || desk() || gi.st === 'pre' || gi.st === 'nodata') { if (el) el.remove(); return; }
    if (!el || el.nextElementSibling !== gi.h) { if (el) el.remove(); el = document.createElement('div'); el.className = 'upm-sum'; d3.insertBefore(el, gi.h); }
    const m = gi.m, t = gi.sc ?? gi.now, R = m.radiant_team_id, Di = m.dire_team_id, p = winP(m, t), g = advAt(m.radiant_gold_adv, t), Ls = lanes10(m);
    const lw = Ls.r === Ls.d ? '' : `<img src="${logo(Ls.r > Ls.d ? R : Di)}" alt="">`;
    const html = `<span class="upm-s"><img src="${logo(p >= 50 ? R : Di)}" alt=""><b class="num">${Math.round(Math.max(p, 100 - p))}%</b><small>шанс</small></span><i></i>`
      + (gi.now >= 600 ? `<span class="upm-s">${lw}<b class="num">${Math.max(Ls.r, Ls.d)}–${Math.min(Ls.r, Ls.d)}</b><small>линии</small></span>` : '<span class="upm-s"><small>линии — к 10′</small></span>') + '<i></i>'
      + `<span class="upm-s ${Math.abs(g) < 50 ? '' : g > 0 ? 'is-r' : 'is-d'}"><img src="${logo(g >= 0 ? R : Di)}" alt=""><b class="num">+${k1(g)}</b><small>золото</small></span>`
      + (gi.sc != null ? `<em class="num">${mmss(t)}</em>` : '');
    if (el._h !== html) { el.innerHTML = html; el._h = html; }
  }

  // ── график: линия шанса, опыт, кнопки, панели
  const UI = { xp: false, pn: '', wp: true }; // pn: '' | 'sum' | 'story'
  // v26 (window.UPM_OPT.v26, дирижёр 10.11): «Историю убираем»; шанс включается там же, где опыт; кнопки — значками, одним рядом с «+ − ↔» графика
  const V26 = !!(window.UPM_OPT || {}).v26
  // v27 (UPM_OPT.fc = 300, дирижёр 10.11: «прогнозирование должно строиться наперёд, хотя бы минут на пять»): в live линия шанса идёт дальше «сейчас» на 5′.
  // ‼️ пример: перевес золота и опыта продолжаем по наклону последних 3′ (с затуханием), коридор неуверенности расширяется к концу
  const FCS = (window.UPM_OPT || {}).fc || 0
  // v28–v30 (UPM_OPT.fcv, дирижёр 11.11: «прогноз строится от реальной линии»): пунктир на 5′ вперёд идёт от конца линии золота, вокруг — коридор (веер);
  //   линия шанса кончается на «сейчас», «через 5′» в плашке считается из прогнозного золота. fan — пунктир и два коридора (50% и 80%) · cone — только коридор 80% · marks — пунктир, коридор и точки +1′ / +3′ / +5′ с числами
  // ‼️ пример: середина — наклон последних 3′ с затуханием; ширина коридора растёт как √времени (≈ ±1.1k золота за минуту в 80%)
  const FCV = (window.UPM_OPT || {}).fcv || ''
  const gFc = (m, now, t) => { const d = t - now, sl = (advAt(m.radiant_gold_adv, now) - advAt(m.radiant_gold_adv, Math.max(0, now - 180))) / Math.min(180, Math.max(1, now)), c = advAt(m.radiant_gold_adv, now) + sl * d * (1 - d / 1200), s = 860 * Math.sqrt(d / 60); return { c, s50: s * 0.67, s80: s * 1.28 } }
  const fcAt = (m, now, t) => { const d = t - now, sl = (a) => (advAt(a, now) - advAt(a, Math.max(0, now - 180))) / Math.min(180, Math.max(1, now)), k = d * (1 - d / (2 * 600))
    const p = winP(m, t, advAt(m.radiant_gold_adv, now) + sl(m.radiant_gold_adv) * k, advAt(m.radiant_xp_adv, now) + sl(m.radiant_xp_adv) * k), u = 3 + 12 * (d / FCS)
    return [p, clamp(p - u, 2, 98), clamp(p + u, 2, 98)] }
  const IC = { wp: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 12 12 4"/><circle cx="4.5" cy="4.5" r="1.8"/><circle cx="11.5" cy="11.5" r="1.8"/></svg>',
    xp: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 8 4-4 4 4"/><path d="m4 12.5 4-4 4 4"/></svg>' }
  // кнопки и панели лежат в поле графика: наведение, нажатие и колесо над ними не должны вести курсор графика и приближать
  const shield = el => ['pointerdown', 'pointermove', 'wheel', 'touchstart'].forEach(t => el.addEventListener(t, e => e.stopPropagation(), { passive: true }));
  function yGold(svg, G) { // шкала золота — по подписям оси графика (у w-gold-2 своя Y внутри draw)
    const xs = G.W - G.R + 8, ts = [...svg.querySelectorAll(':scope > text')].filter(t => Math.abs(+t.getAttribute('x') - xs) < .6).map(t => ({ y: +t.getAttribute('y') - 4, s: t.textContent.trim() }));
    const z = ts.find(t => t.s === '0'), o = ts.find(t => t.s !== '0'); if (!z || !o) return null;
    let v = parseFloat(o.s.replace(/[^\d.]/g, '')) * 1000; if (!v) return null;
    if (o.s[0] === '−' || o.s[0] === '-' || (o.s[0] !== '+' && o.y > z.y)) v = -v;
    const s = (z.y - o.y) / v; return x => z.y - x * s;
  }
  function graph(gi) {
    const box = gi && gi.h.querySelector('.g2-plot'), svg = box && box.querySelector(':scope > svg'), G = gi && gi.S.geo;
    const off = !gi || !svg || !G || gi.st === 'pre' || gi.st === 'nodata';
    document.querySelectorAll('.upm-ov, .upm-wp, .upm-ctl, .upm-pn').forEach(e => { if (off || !box.contains(e)) e.remove(); });
    if (off) return;
    const m = gi.m, W = G.W, H = +svg.getAttribute('height') || box.clientHeight, plotB = gi.S.plotB || H - 40, top = 6;
    const X = t => G.L + (t - G.a) / (G.b - G.a) * (W - G.L - G.R), YP = p => top + (100 - p) / 100 * (plotB - top - 4);
    const tEnd = Math.min(gi.now, G.b), tA = Math.max(0, G.a), R = m.radiant_team_id, Di = m.dire_team_id;
    // линия шанса и опыт — своим svg поверх графика
    let ov = box.querySelector(':scope > .upm-ov');
    if (!ov) { ov = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); ov.setAttribute('class', 'upm-ov'); svg.after(ov); }
    if (FCS) { const f = gi.live && (FCV || UI.wp) ? FCS : 0; if ((gi.o.fwd || 0) !== f && window.WG2) { WG2.set(gi.h, { fwd: f }); return } }
    // прогноз золота — в шкалу графика (иначе коридор и пунктир уходят ниже поля): края коридора на +5′, округлённые до 1k
    // и опыт (дирижёр 11.11: «чтобы все графики были внутри»): включён — его min / max на видимом участке тоже в шкалу
    if (FCV && window.WG2) { let ya = []; if (gi.live) { const q = gFc(m, gi.now, gi.now + FCS); ya = [Math.floor((q.c - q.s80) / 1000) * 1000, Math.ceil((q.c + q.s80) / 1000) * 1000] }
      if (UI.xp) { const xs = []; for (let t = Math.max(0, G.a); t <= Math.min(gi.now, G.b); t += 30) xs.push(advAt(m.radiant_xp_adv, t)); if (xs.length) ya.push(Math.floor(Math.min(...xs) / 1000) * 1000, Math.ceil(Math.max(...xs) / 1000) * 1000) }
      if (String(gi.o.yAdd || []) !== String(ya)) { WG2.set(gi.h, { yAdd: ya }); return } }
    const sig = [W, H, G.a, G.b, Math.round(gi.now), gi.sc, UI.xp, UI.pn, UI.wp].join('|');
    if (ov._sig !== sig) { ov._sig = sig;
      ov.setAttribute('viewBox', `0 0 ${W} ${H}`); ov.setAttribute('width', W); ov.setAttribute('height', H);
      const ts = []; for (let t = tA; t < tEnd; t += 20) ts.push(t); ts.push(tEnd);
      let g = '';
      if (UI.xp) { const Y = yGold(svg, G); if (Y) { g += `<defs><clipPath id="upmc"><rect x="0" y="0" width="${W - G.R}" height="${plotB}"/></clipPath></defs>`;
        g += `<path class="upm-xp" clip-path="url(#upmc)" d="M${ts.map(t => `${X(t).toFixed(1)},${Y(advAt(m.radiant_xp_adv, t)).toFixed(1)}`).join('L')}"/>`;
        if (gi.sc != null) g += `<circle class="upm-xpd" cx="${X(gi.sc)}" cy="${clamp(Y(advAt(m.radiant_xp_adv, gi.sc)), 0, plotB)}" r="3.5"/>`; } }
      if (UI.wp) {
      g += `<path class="upm-wl" d="M${ts.map(t => `${X(t).toFixed(1)},${YP(winP(m, t)).toFixed(1)}`).join('L')}"/>`;
      if (G.a <= 0) { const p0 = draftP(m), y0 = YP(p0), x0 = X(0); // метка «после драфта» — в начале линии
        g += `<circle class="upm-wd" cx="${x0 + 3}" cy="${y0}" r="3.5"/><text class="upm-wt" x="${x0 + 11}" y="${y0 - 7}">после драфта ${Math.max(p0, 100 - p0)}%</text>`; }
      if (gi.sc != null) g += `<circle class="upm-wdot" cx="${X(gi.sc)}" cy="${YP(winP(m, gi.sc))}" r="4"/>`;
      else if (tEnd >= gi.now - 1) { const pe = winP(m, tEnd); g += `<text class="upm-wt upm-wt--e" x="${X(tEnd) - 8}" y="${YP(pe) - 7}" text-anchor="end">${Math.round(Math.max(pe, 100 - pe))}%</text>`; }
      }
      if (FCV && gi.live && tEnd >= gi.now - 1) { const Y = yGold(svg, G); if (Y) { const F = []; for (let t = gi.now; t <= gi.now + FCS; t += 10) F.push([t, gFc(m, gi.now, t)])
        const P = (f) => F.map(([t, q]) => `${X(t).toFixed(1)},${Y(f(q)).toFixed(1)}`), band = (k, c) => `<path class="${c}" clip-path="url(#upmf)" d="M${P((q) => q.c + q[k]).join('L')}L${P((q) => q.c - q[k]).reverse().join('L')}Z"/>`
        const xN = X(gi.now), xE = X(gi.now + FCS), q5 = F[F.length - 1][1], cl = q5.c >= 0 ? 'is-up' : 'is-dn', sg = (v) => (v >= 0 ? '+' : '−') + k1(v)
        g += `<defs><clipPath id="upmf"><rect x="${xN}" y="${top}" width="${xE - xN + 2}" height="${plotB - top}"/></clipPath></defs><rect class="upm-fz" x="${xN}" y="${top}" width="${xE - xN}" height="${plotB - top}"/><g class="upm-gf ${cl}">`
        if (FCV === 'fan') g += band('s80', 'upm-gb upm-gb--80') + band('s50', 'upm-gb upm-gb--50')
        else g += band('s80', 'upm-gb upm-gb--80')
        if (FCV === 'cone') g += [1, -1].map((z) => `<path class="upm-ge" clip-path="url(#upmf)" d="M${P((q) => q.c + z * q.s80).join('L')}"/>`).join('')
        else g += `<path class="upm-gl" clip-path="url(#upmf)" d="M${P((q) => q.c).join('L')}"/>`
        if (FCV === 'marks') g += [60, 180, 300].map((d) => { const q = gFc(m, gi.now, gi.now + d), x = X(gi.now + d), y = clamp(Y(q.c), top + 14, plotB - 6); return `<circle class="upm-gd" cx="${x}" cy="${y}" r="3.5"/><text class="upm-gt" x="${x}" y="${y - 9}" text-anchor="middle">${sg(q.c)}</text><text class="upm-ft" x="${x}" y="${plotB - 8}" text-anchor="middle">+${d / 60}′</text>` }).join('')
        else g += `<text class="upm-gt" x="${xE - 6}" y="${clamp(Y(q5.c), top + 14, plotB - 6) - 9}" text-anchor="end">через 5′ · ${sg(q5.c)}</text><text class="upm-ft" x="${xN + 8}" y="${plotB - 8}">прогноз${FCV === 'cone' ? ' · коридор 80%' : ''}</text>`
        g += '</g>' } }
      else if (FCS && UI.wp && gi.live && tEnd >= gi.now - 1) { const F = []; for (let t = gi.now; t <= gi.now + FCS; t += 15) F.push([t, ...fcAt(m, gi.now, t)])
        const P = (i) => F.map((f) => `${X(f[0]).toFixed(1)},${YP(f[i]).toFixed(1)}`), fe = F[F.length - 1], xN = X(gi.now), xE = X(fe[0])
        g += `<rect class="upm-fz" x="${xN}" y="${top}" width="${xE - xN}" height="${plotB - top}"/><path class="upm-fb" d="M${P(2).join('L')}L${P(3).reverse().join('L')}Z"/><path class="upm-fl" d="M${P(1).join('L')}"/>`
        g += `<circle class="upm-wd" cx="${xE}" cy="${YP(fe[1])}" r="3.5"/><text class="upm-wt upm-wt--e" x="${xE - 8}" y="${YP(fe[1]) - 9}" text-anchor="end">через 5′ · ${Math.round(Math.max(fe[1], 100 - fe[1]))}%</text><text class="upm-ft" x="${xN + 8}" y="${plotB - 8}">прогноз</text>` }
      ov.innerHTML = g; }
    // плашка шанса (компьютер; на телефоне — строка над графиком)
    let wp = box.querySelector(':scope > .upm-wp');
    if (desk()) { if (!wp) { wp = document.createElement('div'); wp.className = 'upm-wp'; box.appendChild(wp); }
      const t = gi.sc ?? gi.now, p = winP(m, t), lead = p >= 50 ? R : Di, p0 = draftP(m), d0 = p0 >= 50 ? R : Di;
      const html = (!UI.wp ? '' : `<span class="upm-wp-k"><i class="upm-sw"></i>шанс${gi.sc != null ? ` на ${mmss(t)}` : gi.live ? '' : ' к концу'}</span><img src="${logo(lead)}" alt=""><b>${esc(tShort(lead))}</b><b class="num upm-wp-v">${Math.round(Math.max(p, 100 - p))}%</b>`
        + `<i class="upm-wp-s"></i><span class="upm-wp-k">после драфта</span><img src="${logo(d0)}" alt=""><b class="num">${Math.max(p0, 100 - p0)}%</b>` + (FCS && gi.live && gi.sc == null ? (() => { const f = FCV ? (() => { const q = gFc(m, gi.now, gi.now + FCS); return winP(m, gi.now + FCS, q.c, advAt(m.radiant_xp_adv, gi.now)) })() : fcAt(m, gi.now, gi.now + FCS)[0], l = f >= 50 ? R : Di; return `<i class="upm-wp-s"></i><span class="upm-wp-k"><i class="upm-sw upm-sw--f"></i>через 5′</span><img src="${logo(l)}" alt=""><b class="num">${Math.round(Math.max(f, 100 - f))}%</b>` })() : ''))
        + (UI.xp ? `${UI.wp ? '<i class="upm-wp-s"></i>' : ''}<span class="upm-wp-k"><i class="upm-sw upm-sw--g"></i>золото</span><span class="upm-wp-k"><i class="upm-sw upm-sw--x"></i>опыт</span>` : '');
      if (wp._h !== html) { wp.innerHTML = html; wp._h = html; } wp.hidden = !html
      // угол — где линии золота и шанса меньше заходят под плашку: сверху слева или сверху справа (у шкалы)
      if (!(performance.now() - (wp._ct || 0) < 500)) { wp._ct = performance.now(); const Y = yGold(svg, G), w = wp.offsetWidth + 8, hit = (x0, x1) => { let n = 0;
          for (let t = tA; t <= tEnd; t += 15) { const x = X(t); if (x < x0 || x > x1) continue; if (Y && Y(advAt(m.radiant_gold_adv, t)) < 46) n++; if (YP(winP(m, t)) < 46) n++; } return n; };
        const hr = hit(W - G.R - w - 8, W - G.R), hl = hit(0, w + 8), right = wp._r ? hr <= hl + 3 : hr + 3 < hl; wp._r = right;
        wp.style.left = right ? 'auto' : ''; wp.style.right = right ? (G.R + 8) + 'px' : ''; } }
    else if (wp) wp.remove();
    // кнопки: на компьютере — в ряд с «+ −» графика, на телефоне — сверху слева
    let ctl = box.querySelector(':scope > .upm-ctl');
    if (!ctl) { ctl = document.createElement('div'); ctl.className = 'upm-ctl'; box.appendChild(ctl);
      shield(ctl); ctl.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-upm]'); if (!b) return; const k = b.dataset.upm;
        if (k === 'xp') UI.xp = !UI.xp; else if (k === 'wp') UI.wp = !UI.wp; else UI.pn = UI.pn === k ? '' : k; tick(true); }); }
    const post = gi.st === 'post';
    if (UI.pn === 'sum' && !post) UI.pn = ''; if (V26 && UI.pn === 'story') UI.pn = '';
    const ch = V26 ? `<button data-upm="wp" class="upm-ib${UI.wp ? ' on' : ''}" aria-pressed="${UI.wp}" title="Шанс победы">${IC.wp}${FCS && desk() ? '<span>Шанс</span>' : ''}</button><button data-upm="xp" class="upm-ib${UI.xp ? ' on' : ''}" aria-pressed="${UI.xp}" title="Опыт">${IC.xp}${FCS && desk() ? '<span>Опыт</span>' : ''}</button>`
      + (post ? `<button data-upm="sum" class="${UI.pn === 'sum' ? 'on' : ''}">Итог карты</button>` : '') : `<button data-upm="xp" class="${UI.xp ? 'on' : ''}" aria-pressed="${UI.xp}"><i class="upm-sw upm-sw--x"></i>Опыт</button>`
      + (post ? `<button data-upm="sum" class="${UI.pn === 'sum' ? 'on' : ''}">Итог карты</button>` : '')
      + `<button data-upm="story" class="${UI.pn === 'story' ? 'on' : ''}">История</button>`;
    if (ctl._h !== ch) { ctl.innerHTML = ch; ctl._h = ch; }
    const zc = box.querySelector('.g2-zc'), br = box.getBoundingClientRect();
    if (desk() && zc && zc.offsetWidth > zc.offsetHeight) { const z = zc.getBoundingClientRect(); ctl.style.left = (z.right - br.left + (V26 ? 0 : 8)) + 'px'; ctl.style.top = (z.top - br.top) + 'px'; ctl.classList.remove('is-ph')
      if (V26) { ctl.classList.add('is-join'); zc.classList.add('upm-zj'); ctl.style.setProperty('--upm-h', z.height + 'px') } }
    else { ctl.style.left = ''; ctl.style.top = ''; ctl.classList.add('is-ph'); }
    // панели «Итог карты» и «История» — поверх поля графика, над рядом кнопок
    let pn = box.querySelector(':scope > .upm-pn');
    if (!UI.pn) { if (pn) pn.remove(); return; }
    if (!pn) { pn = document.createElement('div'); pn.className = 'upm-pn'; box.appendChild(pn); shield(pn); pn.addEventListener('click', e => { e.stopPropagation(); if (e.target.closest('[data-upm-x]')) { UI.pn = ''; tick(true); } }); }
    const ct = ctl.getBoundingClientRect();
    if (desk()) { pn.style.top = '6px'; pn.style.height = Math.max(160, ct.top - br.top - 10 - 6) + 'px'; }
    else { pn.style.top = (ct.bottom - br.top + 6) + 'px'; pn.style.height = Math.max(160, plotB - (ct.bottom - br.top) - 6) + 'px'; }
    const key = UI.pn + '|' + m.match_id + '|' + (UI.pn === 'story' ? Math.floor(gi.now / 30) : '') + '|' + desk();
    if (pn._k !== key) { pn._k = key; const sc = pn.querySelector('.upm-pn-bd')?.scrollTop || 0; pn.innerHTML = UI.pn === 'sum' ? sumHtml(m) : storyHtml(m, gi.now, post); const bd = pn.querySelector('.upm-pn-bd'); if (bd) bd.scrollTop = sc; }
  }

  // ── 5. итог карты: кто кого убил + драки (группировка как у ромбов графика: смерти ближе 25 с — одна драка)
  const deaths = m => { const by = Object.fromEntries(m.players.map(p => [p.hero_id, p]));
    return m.players.flatMap(p => (p.kills_log || []).map(l => { const v = by[HSHORT[l.key.replace('npc_dota_hero_', '')]]; return { t: l.time, k: p, v }; })).filter(d => d.v).sort((a, b) => a.t - b.t); };
  const fightsOf = (m, now) => { const out = []; for (const d of deaths(m).filter(d => d.t <= now)) { const f = out[out.length - 1]; if (f && d.t - f.last <= 25) { f.ds.push(d); f.last = d.t; } else out.push({ ds: [d], t: d.t, last: d.t }); } return out; };
  const pnHd = (t, s) => `<div class="upm-pn-hd"><b>${t}</b><small>${s}</small><button data-upm-x title="Закрыть">×</button></div>`;
  function sumHtml(m) {
    const R = m.radiant_team_id, Di = m.dire_team_id, rp = m.players.filter(p => p.isRadiant), dp = m.players.filter(p => !p.isRadiant), ds = deaths(m);
    const kk = (a, b) => ds.filter(d => d.k === a && d.v === b).length;
    const hi = p => `<img src="${esc(hero(p.hero_id).icon)}" alt="" title="${esc(hero(p.hero_id).name)} · ${esc(nick(p))}">`;
    const mx = `<table class="upm-km num"><thead><tr><th><img class="upm-tl" src="${logo(R)}" alt=""><span>↓ ${esc(tShort(R))}</span></th>${dp.map(p => `<th>${hi(p)}</th>`).join('')}<th>у–с</th></tr></thead><tbody>`
      + rp.map(a => `<tr><th>${hi(a)}</th>${dp.map(b => { const x = kk(a, b), y = kk(b, a); return `<td${x + y ? '' : ' class="z"'}>${x + y ? `<b class="r">${x}</b><i>–</i><b class="d">${y}</b>` : '·'}</td>`; }).join('')}<td class="t">${a.kills}–${a.deaths}</td></tr>`).join('')
      + `<tr class="t"><th>у–с</th>${dp.map(b => `<td>${b.kills}–${b.deaths}</td>`).join('')}<td></td></tr></tbody></table>`;
    const fs = fightsOf(m, m.duration).filter(f => f.ds.length >= 2);
    const fl = fs.map(f => { const kr = f.ds.filter(d => !d.v.isRadiant).length, kd = f.ds.length - kr, sw = advAt(m.radiant_gold_adv, f.last + 40) - advAt(m.radiant_gold_adv, f.t - 20), w = kr === kd ? 0 : kr > kd ? R : Di;
      return `<div class="upm-fr"><time class="num">${mmss(f.t)}</time><span class="upm-fd">${f.ds.map(d => `<img class="${d.v.isRadiant ? 'r' : 'd'}" src="${esc(hero(d.v.hero_id).icon)}" alt="" title="${esc(hero(d.v.hero_id).name)} погиб">`).join('')}</span>`
        + `<b class="num ${w === R ? 'is-r' : w === Di ? 'is-d' : ''}">${kr}–${kd}</b><span class="upm-fg num ${Math.abs(sw) < 150 ? '' : sw > 0 ? 'is-r' : 'is-d'}">${Math.abs(sw) < 150 ? '≈0' : `<img src="${logo(sw > 0 ? R : Di)}" alt="">+${k1(sw)}`}</span></div>`; }).join('');
    return pnHd('Итог карты', `${esc(tShort(R))} ${m.radiant_score} : ${m.dire_score} ${esc(tShort(Di))} · ${mmss(m.duration)}`)
      + `<div class="upm-pn-bd upm-sum2"><section><h4>Кто кого убил</h4><p class="upm-mu">строка — ${esc(tName(R))}, столбец — ${esc(tName(Di))}; первое число — убил строку на столбец</p>${mx}</section>`
      + `<section><h4>Драки <small>${fs.length}</small></h4><div class="upm-fh"><span>время</span><span>кто погиб</span><span>счёт</span><span>золото</span></div>${fl || '<p class="upm-mu">Драк не было</p>'}</section></div>`;
  }

  // ── 8. история карты текстом — строками, как лента новостей (время · заголовок · подробность)
  function storyHtml(m, now, post) {
    const R = m.radiant_team_id, Di = m.dire_team_id, ev = [], side = rad => rad ? R : Di, TN = id => `<b>${esc(tName(id))}</b>`;
    const p0 = draftP(m), fav = p0 >= 50 ? R : Di;
    ev.push({ t: 0, id: fav, h: 'Начало карты', s: `${TN(R)} — Radiant, ${TN(Di)} — Dire. По драфту шанс у ${TN(fav)} ${Math.max(p0, 100 - p0)}%` });
    const ds = deaths(m).filter(d => d.t <= now);
    if (ds[0]) { const d = ds[0]; ev.push({ t: d.t, id: side(d.k.isRadiant), h: 'Первая кровь', s: `${esc(nick(d.k))} (${esc(hero(d.k.hero_id).name)}) убивает ${esc(nick(d.v))} (${esc(hero(d.v.hero_id).name)})` }); }
    if (now >= 600) { const Ls = lanes10(m), w = Ls.r === Ls.d ? 0 : Ls.r > Ls.d ? R : Di;
      ev.push({ t: 600, id: w || R, h: w ? `Линии за ${esc(tName(w))}: ${Math.max(Ls.r, Ls.d)}–${Math.min(Ls.r, Ls.d)}` : `Линии поровну: ${Ls.r}–${Ls.d}`,
        s: ['top', 'mid', 'bot'].map(k => { const v = Ls.L[k]; return `${LNAME[k]} — ${Math.abs(v) < DRAW ? 'ничья' : esc(tShort(v > 0 ? R : Di)) + ' ' + '+' + k1(v)}`; }).join(' · ') }); }
    const bk = m.objectives.filter(o => o.type === 'building_kill' && o.time <= now && /tower|rax/.test(o.key));
    const ft = bk.find(o => /tower/.test(o.key)); if (ft) { const lost = /goodguys/.test(ft.key); ev.push({ t: ft.time, id: lost ? Di : R, h: 'Первая башня', s: `${TN(lost ? Di : R)} ломают башню на линии «${LNAME[(ft.key.match(/_(top|mid|bot)$/) || [])[1]] || '—'}»` }); }
    const fr = bk.find(o => /rax/.test(o.key)); if (fr) { const lost = /goodguys/.test(fr.key); ev.push({ t: fr.time, id: lost ? Di : R, h: 'Первые казармы', s: `${TN(lost ? Di : R)} заходят на базу: казармы на линии «${LNAME[(fr.key.match(/_(top|mid|bot)$/) || [])[1]] || '—'}»` }); }
    m.objectives.filter(o => o.type === 'CHAT_MESSAGE_ROSHAN_KILL' && o.time <= now).forEach((o, i) => { const id = o.team === 2 ? R : Di;
      const st = m.objectives.find(x => x.time === o.time && x.type === 'CHAT_MESSAGE_AEGIS_STOLEN');
      ev.push({ t: o.time, id, h: `Рошан ${i + 1}-й раз`, s: `${TN(id)} убивают Рошана${st ? ', но аегис крадут соперники' : ', аегис у них'}` }); });
    // крупные драки — три самые большие из ромбов графика
    fightsOf(m, now).filter(f => f.ds.length >= 3).sort((a, b) => b.ds.length - a.ds.length).slice(0, 3).forEach(f => { const kr = f.ds.filter(d => !d.v.isRadiant).length, kd = f.ds.length - kr, w = kr >= kd ? R : Di, sw = advAt(m.radiant_gold_adv, f.last + 40) - advAt(m.radiant_gold_adv, f.t - 20);
      ev.push({ t: f.t, id: w, h: kr === kd ? `Размен ${kr}–${kd}` : `Драка ${Math.max(kr, kd)}–${Math.min(kr, kd)} за ${esc(tName(w))}`, s: `${f.ds.length} ${plural(f.ds.length, 'смерть', 'смерти', 'смертей')} за ${Math.max(1, Math.round(f.last - f.t))} с, золото ${sw >= 0 ? esc(tShort(R)) : esc(tShort(Di))} +${k1(sw)}` }); });
    // смена лидера по золоту (после 5′, перевес от 1k) и самый большой перевес
    let ld = 0; for (let i = 5; i * 60 <= now && i < m.radiant_gold_adv.length; i++) { const v = m.radiant_gold_adv[i], s = v >= 1000 ? 1 : v <= -1000 ? -1 : 0;
      if (s && s !== ld) { if (ld) ev.push({ t: i * 60, id: s > 0 ? R : Di, h: `${esc(tName(s > 0 ? R : Di))} выходят вперёд`, s: `Перевес по золоту ${k1(v)} на ${i}′` }); ld = s; } }
    const ga = m.radiant_gold_adv.slice(0, Math.floor(now / 60) + 1); if (ga.length > 5) { const im = ga.reduce((b, v, i) => Math.abs(v) > Math.abs(ga[b]) ? i : b, 0), v = ga[im];
      ev.push({ t: im * 60, id: v > 0 ? R : Di, h: 'Самый большой перевес', s: `${TN(v > 0 ? R : Di)} +${k1(v)} на ${im}′` }); }
    if (post) { const w = m.radiant_win ? R : Di; ev.push({ t: m.duration, id: w, h: `${esc(tName(w))} побеждают`, s: `Карта за ${mmss(m.duration)}, убийства ${m.radiant_score} : ${m.dire_score}`, end: true }); }
    ev.sort((a, b) => a.t - b.t);
    return pnHd('История', post ? `карта целиком · ${ev.length} событий` : `пока идёт · к ${mmss(now)}`)
      + `<div class="upm-pn-bd upm-st">${ev.map(e => `<div class="upm-sr${e.end ? ' is-end' : ''}"><time class="num">${mmss(e.t)}</time><img src="${logo(e.id)}" alt=""><div><b>${e.h}</b><span>${e.s}</span></div></div>`).join('')}</div>`;
  }

  // ── 6. «Статистика»: здания на карте линий и контроль карты
  const LSW = { top: 'bot', bot: 'top', mid: 'mid' };
  function stats() {
    const bar = document.querySelector('.bw-bar[data-ws-k]'), s = bar && D.series.find(x => String(x.series_id) === bar.dataset.wsK); if (!s) return;
    document.querySelectorAll('.wz').forEach(row => {
      const map = row.querySelector('.lm-map'), hb = row.querySelector('.wz-h b'); if (!map || !hb) return;
      const n = parseInt(hb.textContent.replace(/\D/g, ''), 10), m = s.maps[n - 1]; if (!m) return;
      const tab = document.querySelector(`.ws-tabs .h3-tab[data-v="${n}"]`), lv = tab && tab.classList.contains('is-live'), t = lv ? (parseInt((tab.querySelector('small') || {}).textContent, 10) || 0) * 60 || m.duration : m.duration;
      const key = m.match_id + '|' + t; if (map.dataset.upm === key) return; map.dataset.upm = key;
      map.querySelectorAll('.upm-b').forEach(e => e.remove()); row.querySelectorAll('.upm-mc').forEach(e => e.remove());
      const dead = {}, cnt = {}; m.objectives.filter(o => o.type === 'building_kill' && o.time <= t).forEach(o => { const sd = /goodguys/.test(o.key) ? 'r' : 'd'; let k = o.key.replace(/^npc_dota_(good|bad)guys_/, '');
        if (k === 'tower4') { cnt[sd] = (cnt[sd] || 0) + 1; k = cnt[sd] === 1 ? 'tower4a' : 'tower4b'; } dead[sd + k] = o.time; });
      let html = '', alive = { r: 0, d: 0 };
      ['r', 'd'].forEach(sd => Object.keys(BLD).forEach(k => { const lane = (k.match(/_(top|mid|bot)$/) || [])[1], src = sd === 'r' ? k : lane ? k.replace(/_(top|mid|bot)$/, '_' + LSW[lane]) : k, xy = BLD[src]; if (!xy) return;
        const [x, y] = sd === 'r' ? xy : [1 - xy[0], 1 - xy[1]], dt = dead[sd + k], tw = /^tower/.test(k), ty = tw ? 't' : k === 'fort' ? 'f' : 'x';
        if (tw && dt == null) alive[sd]++;
        const nm = tw ? `Башня ${k[5] === '4' ? '4' : k[5]}${lane ? ' · ' + LNAME[lane] : ''}` : k === 'fort' ? 'Трон' : `Казармы${lane ? ' · ' + LNAME[lane] : ''}`;
        html += `<i class="upm-b upm-b--${sd} upm-b--${ty}${dt != null ? ' is-dead' : ''}" style="left:${(x * 100).toFixed(1)}%;top:${(y * 100).toFixed(1)}%" title="${nm} · ${sd === 'r' ? 'Radiant' : 'Dire'}${dt != null ? ' · сломана на ' + mmss(dt) : ' · стоит'}"></i>`; }));
      map.querySelector('.lm-bg').insertAdjacentHTML('afterend', html);
      // ‼️ пример: контроль карты — оценка по живым башням и перевесу золота (данных о вижне и позициях нет)
      const g = advAt(m.radiant_gold_adv, t), c = Math.round(Math.max(5, 14 - Math.abs(g) / 2500)), sh = clamp(50 + (alive.r - alive.d) * 2.5 + clamp(g / 1000 * 1.6, -28, 28), 5, 95);
      const r = Math.round((100 - c) * sh / 100), d = 100 - c - r, R = m.radiant_team_id, Di = m.dire_team_id;
      (row.querySelector('.wz-map') || map.parentElement).insertAdjacentHTML('beforeend', `<div class="upm-mc"><div class="upm-mc-t"><b>Контроль карты</b><small class="num">${lv ? 'сейчас' : 'к концу карты'} · башни ${alive.r} : ${alive.d}</small></div>
        <div class="upm-mc-bar"><i class="r" style="width:${r}%"></i><i class="c" style="width:${c}%"></i><i class="d" style="width:${d}%"></i></div>
        <div class="upm-mc-l num"><span class="r"><img src="${logo(R)}" alt="">${esc(tShort(R))} ${r}%</span><span class="c">спорно ${c}%</span><span class="d">${esc(tShort(Di))} ${d}%<img src="${logo(Di)}" alt=""></span></div></div>`);
    });
  }

  // ── баг: цифры «табло» в нижней строке (w-bottom-2, WB2_ANIM = 'odo') ломались — «74. k», «+8. k».
  // Разряд крутится барабаном 220 мс; при наведении на ромб / ведении по графику и в лайве число меняется чаще — барабан
  // перезапускается с нижнего края, и разряд пустой. Чиним без правки чужого файла: пока водят по графику или число
  // сменилось меньше чем за 320 мс до этого — разряд встаёт сразу, без прокрутки.
  let gT = 0; const LAST = new WeakMap();
  document.addEventListener('pointermove', e => { if (e.target.closest && e.target.closest('.g2-plot')) gT = performance.now(); }, true);
  document.addEventListener('pointerout', e => { if (e.target.closest && e.target.closest('.g2-plot')) gT = performance.now(); }, true);
  const anim0 = Element.prototype.animate;
  Element.prototype.animate = function (kf, op) {
    const od = this.parentElement && this.parentElement.classList.contains('wb2-od') ? this.parentElement.parentElement : null;
    if (od) { const n = performance.now(), l = LAST.get(od) || 0; LAST.set(od, n); if (n - gT < 600 || n - l < 320) op = Object.assign({}, typeof op === 'number' ? { duration: op } : op, { duration: 0 }); }
    return anim0.call(this, kf, op);
  };

  // ── цикл: график — каждый кадр (live дорисовывается), строка и «Статистика» — 4 раза в секунду
  let last = 0;
  function tick(force) {
    const gi = gInfo();
    try { graph(gi); } catch (e) { console.error('upm graph', e); }
    const n = performance.now(); if (!force && n - last < 250) return; last = n;
    try { lanesRow(gi); phoneSum(gi); stats(); if (tipH && !tipH.isConnected) tipHide(); } catch (e) { console.error('upm', e); }
  }
  const loop = () => { tick(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();
