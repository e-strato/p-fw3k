// w-gold-2 — зум графика «Перевес по золоту» на телефоне (З3; дирижёр 30.10: «все три сразу»). Подключается к WGOLD (../w-gold/_wgold.js) опциями
// o.zoom + o.after(el, S): после каждой перерисовки дорисовывает свои кнопки и курсор. Окно — o.win = { span, end } (end null — живой край).
//   chips — кнопки «10′ · 20′ · Карта» у кнопок графика; окно всегда у живого края.
//   pinch — щипок двумя пальцами, сдвиг одним, двойной тап — приблизить / вся карта; мышью — Ctrl + колесо (щипок на тачпаде), тащить, двойной клик.
//   both — щипок + ведение пальцем только при нажатии (v5).
//   scrub — без зума: ведёшь пальцем (или мышью) по графику — минута, перевес и что было рядом (смерти, башни, Рошан).
(() => {
  const D = window.GS_DATA;
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const k = v => (v < 0 ? '−' : '+') + (Math.abs(v) / 1000).toFixed(1) + 'k';
  const at = (m, s) => { const a = m.radiant_gold_adv, i = Math.min(Math.floor(s / 60), a.length - 1), f = s / 60 - i; return a[i] + ((a[i + 1] ?? a[i]) - a[i]) * Math.min(1, f); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const MIN = 180; // ближе 3 минут не приближаем: данные поминутные
  const tOf = (G, x) => clamp(G.a + (x - G.L) / (G.W - G.L - G.R) * (G.b - G.a), 0, G.now);
  const xIn = (box, e) => e.clientX - box.getBoundingClientRect().left;

  // окно: начало a, ширина span; правый край у «сейчас» — прилипает к живому краю
  function setWin(el, a, span) {
    const G = el._wg.geo; span = clamp(span, MIN, G.now);
    if (span >= G.now - 1) return WGOLD.set(el, { win: null });
    a = clamp(a, 0, G.now - span); const end = a + span;
    WGOLD.set(el, { win: { span, end: end >= G.now - 2 ? null : end } });
  }

  // свои кнопки — в группу кнопок графика справа сверху, перед значками
  function rail(el, html) {
    const r = el.querySelector('.gw-rail'); if (!r) return;
    let z = r.querySelector('.gz'); if (!z) { z = document.createElement('div'); z.className = 'gz'; r.prepend(z); }
    if (z.innerHTML !== html) z.innerHTML = html;
    el.querySelector('.gw').classList.toggle('gz-on', !!html);
    return z;
  }

  // ── chips: 10′ · 20′ · Карта ─────────────────────────────────────────────
  function chips(el, S) {
    const G = S.geo, cur = S.o.win ? S.o.win.span : 0;
    const opts = [[600, '10′'], [1200, '20′']].filter(([s]) => s < G.now).concat([[0, 'Карта']]);
    const z = rail(el, opts.map(([s, t]) => `<button class="gz-b${s === cur ? ' on' : ''}" data-s="${s}">${t}</button>`).join('') + '<i class="gz-sep"></i>');
    z.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => WGOLD.set(el, { win: +b.dataset.s ? { span: +b.dataset.s, end: null } : null }); });
  }

  // ── pinch: щипок, сдвиг, двойной тап ────────────────────────────────────
  function zoomRail(el, S) {
    const w = S.o.win, live = S.o.state === 'live';
    const z = rail(el, w ? `<button class="gz-b" data-z="all">Вся карта</button>${w.end != null && live ? '<button class="gz-b gz-live" data-z="now">Сейчас</button>' : ''}<i class="gz-sep"></i>` : '');
    if (z) { const a = z.querySelector('[data-z="all"]'), n = z.querySelector('[data-z="now"]');
      if (a) a.onclick = () => WGOLD.set(el, { win: null });
      if (n) n.onclick = () => WGOLD.set(el, { win: { span: w.span, end: null } }); }
  }
  function pinch(el, S) {
    zoomRail(el, S);
    const box = el.querySelector('.gw-plot'); if (box._z) return; box._z = 1; box.style.touchAction = 'pan-y';
    const P = new Map(); let two = null, drag = null, moved = false, tap = { t: 0, x: 0 }, kind = 'mouse';
    const G = () => el._wg.geo, frac = x => clamp((x - G().L) / (G().W - G().L - G().R), 0, 1);
    const dbl = x => { const g = G(); if (el._wg.o.win) return WGOLD.set(el, { win: null });
      const span = Math.max(MIN, g.now / 3), t = tOf(g, x); setWin(el, t - frac(x) * span, span); };
    box.addEventListener('pointerdown', e => {
      P.set(e.pointerId, xIn(box, e)); kind = e.pointerType;
      const g = G(), xs = [...P.values()];
      if (P.size === 2) { [...P.keys()].forEach(id => box.hasPointerCapture(id) || box.setPointerCapture(id)); const cx = (xs[0] + xs[1]) / 2; two = { d: Math.abs(xs[0] - xs[1]) || 1, span: g.b - g.a, t: tOf(g, cx) }; drag = null; }
      else if (P.size === 1) { drag = { x: xs[0], a: g.a, span: g.b - g.a }; moved = false; }
    });
    box.addEventListener('pointermove', e => {
      if (!P.has(e.pointerId)) return; P.set(e.pointerId, xIn(box, e)); const xs = [...P.values()];
      if (two && P.size === 2) { const cx = (xs[0] + xs[1]) / 2, span = two.span * two.d / (Math.abs(xs[0] - xs[1]) || 1);
        moved = true; setWin(el, two.t - frac(cx) * span, span); }
      else if (drag && el._wg.o.win) { const dx = xs[0] - drag.x, g = G(); if (!moved && Math.abs(dx) > 6) { moved = true; box.setPointerCapture(e.pointerId); }
        if (moved) setWin(el, drag.a - dx / (g.W - g.L - g.R) * drag.span, drag.span); }
    });
    const up = e => { if (!P.has(e.pointerId)) return; const x = P.get(e.pointerId); P.delete(e.pointerId);
      if (P.size < 2) two = null;
      if (P.size === 0) { drag = null;
        if (!moved && e.type === 'pointerup' && e.pointerType !== 'mouse') { const n = Date.now();
          if (n - tap.t < 300 && Math.abs(x - tap.x) < 30) { dbl(x); tap.t = 0; } else tap = { t: n, x }; } } };
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.addEventListener('click', e => { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true); // после сдвига ромб не открываем
    box.addEventListener('dblclick', e => { if (kind === 'mouse') dbl(xIn(box, e)); }); // на телефоне двойной тап ловим сами
    box.addEventListener('wheel', e => { const g = G(), span = g.b - g.a, x = xIn(box, e);
      if (e.ctrlKey) { e.preventDefault(); const s = span * Math.exp(e.deltaY * 0.01); setWin(el, tOf(g, x) - frac(x) * s, s); }
      else if (el._wg.o.win && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); setWin(el, g.a + e.deltaX / (g.W - g.L - g.R) * span, span); }
    }, { passive: false });
  }

  // ── scrub: ведение пальцем — минута, перевес, события рядом ──────────────
  const LANE = { top: 'верх', mid: 'мид', bot: 'низ' };
  function near(S, t) {
    const m = S.o.m, IMG = S.o.base || '', tm = id => D.teams[id] || { tag: '—' };
    const ev = S.ev ? m.objectives.filter(o => Math.abs(o.time - t) <= 30 && (o.type === 'CHAT_MESSAGE_ROSHAN_KILL' || (o.type === 'building_kill' && /tower|rax/.test(o.key)))).map(o => {
      if (o.type !== 'building_kill') return { t: o.time, h: '<i class="gz-ic gz-rosh"></i>Рошан' };
      const rad = /goodguys/.test(o.key), [, kind, n, lane] = o.key.match(/(tower|rax)(\d?)_?(\w*)/) || [];
      const what = kind === 'rax' ? 'Казармы' : n === '4' ? 'Башня на базе' : `Башня · ${LANE[lane] || lane} ${n}`;
      return { t: o.time, s: rad ? 'a' : 'b', h: `<i class="gz-ic gz-tw"></i>${what} — ${tm(rad ? m.radiant_team_id : m.dire_team_id).tag}` };
    }) : [];
    const ds = S.ev ? S.ds.filter(d => Math.abs(d.t - t) <= 30).map(d => ({ t: d.t, s: d.rad ? 'a' : 'b',
      h: `<img src="${IMG + d.h.img}" alt="">${(d.v && D.players[d.v.account_id]?.name) || d.h.name}` })) : [];
    return ds.concat(ev).filter(e => e.t <= S.geo.now).sort((a, b) => a.t - b.t);
  }
  // линия под пальцем, точка на линии, карточка минуты — рисуется после каждой перерисовки графика, пока S.sc задан
  function cursor(el, S) {
    const box = el.querySelector('.gw-plot'), G = S.geo;
    if (S.sc != null && S.sc <= G.now && G.W) {
      const t = S.sc, x = G.X(t), v = at(S.o.m, t), lead = D.teams[v >= 0 ? S.o.m.radiant_team_id : S.o.m.dire_team_id];
      const ev = near(S, t), cw = 216, left = x > G.W / 2 ? x - cw - 10 : x + 10;
      box.insertAdjacentHTML('beforeend', `<div class="gz-cur" style="left:${x}px;top:${G.top}px;height:${G.plotB - G.top}px"></div>
        <div class="gz-dot" style="left:${x}px;top:${G.Y(v)}px"></div>
        <div class="gz-card" style="left:${clamp(left, 0, G.W - cw)}px;top:${G.top}px;width:${cw}px">
          <div class="gz-h num"><span>${mmss(t)}</span><b class="${v >= 0 ? 'up' : 'dn'}">${k(v)}</b><small>${Math.abs(v) < 500 ? 'поровну' : 'ведёт ' + (lead?.name || '')}</small></div>
          ${ev.slice(0, 5).map(e => `<div class="gz-r ${e.s || ''}"><small class="num">${mmss(e.t)}</small>${e.h}</div>`).join('')}${ev.length > 5 ? `<div class="gz-more">ещё ${ev.length - 5}</div>` : ''}</div>`);
    }
  }
  function scrub(el, S) {
    cursor(el, S); const box = el.querySelector('.gw-plot');
    if (box._z) return; box._z = 1; box.style.touchAction = 'pan-y';
    let down = false;
    const set = e => { const S = el._wg; if (!S.geo) return; S.sc = tOf(S.geo, xIn(box, e)); WGOLD.set(el, {}); };
    const clear = () => { if (el._wg.sc != null) { el._wg.sc = null; WGOLD.set(el, {}); } };
    box.addEventListener('pointerdown', e => { if (e.target.closest('.dm, .pop')) return; down = true; box.setPointerCapture(e.pointerId); set(e); });
    box.addEventListener('pointermove', e => { if (down || e.pointerType === 'mouse') set(e); });
    box.addEventListener('pointerup', () => { down = false; });
    box.addEventListener('pointercancel', () => { down = false; clear(); }); // палец пошёл вверх-вниз — это прокрутка страницы
    box.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !down) clear(); });
    if (!el._zDoc) { el._zDoc = 1; document.addEventListener('pointerdown', e => { if (!el.contains(e.target)) clear(); }); }
  }

  // ── both: щипок + ведение пальцем (дирижёр 30.10: «совместим»). Карточка — только пока палец (кнопка мыши) прижат, наведением — нет.
  //   один палец / мышь с нажатием — ведение; два пальца — щипок, сдвиг — двумя пальцами; двойной тап (клик) — приблизить / вся карта; Ctrl + колесо — зум.
  function both(el, S) {
    zoomRail(el, S); cursor(el, S);
    const box = el.querySelector('.gw-plot'); if (box._z) return; box._z = 1; box.style.touchAction = 'pan-y';
    const P = new Map(); let two = null, one = null, moved = false, tap = { t: 0, x: 0 }, kind = 'mouse';
    const G = () => el._wg.geo, frac = x => clamp((x - G().L) / (G().W - G().L - G().R), 0, 1);
    const sc = x => { el._wg.sc = x == null ? null : tOf(G(), x); WGOLD.set(el, {}); };
    const dbl = x => { const g = G(); if (el._wg.o.win) return WGOLD.set(el, { win: null });
      const span = Math.max(MIN, g.now / 3), t = tOf(g, x); setWin(el, t - frac(x) * span, span); };
    box.addEventListener('pointerdown', e => {
      if (e.target.closest('.dm, .pop') || (e.pointerType === 'mouse' && e.button)) return;
      P.set(e.pointerId, xIn(box, e)); kind = e.pointerType; box.setPointerCapture(e.pointerId);
      const g = G(), xs = [...P.values()];
      if (P.size === 2) { one = null; el._wg.sc = null; moved = true; const cx = (xs[0] + xs[1]) / 2; two = { d: Math.abs(xs[0] - xs[1]) || 1, span: g.b - g.a, t: tOf(g, cx) }; }
      else if (P.size === 1) { one = xs[0]; moved = false; sc(xs[0]); }
    });
    box.addEventListener('pointermove', e => {
      if (!P.has(e.pointerId)) return; P.set(e.pointerId, xIn(box, e)); const xs = [...P.values()];
      if (two && P.size === 2) { const cx = (xs[0] + xs[1]) / 2, span = two.span * two.d / (Math.abs(xs[0] - xs[1]) || 1); setWin(el, two.t - frac(cx) * span, span); }
      else if (one != null && P.size === 1) { if (Math.abs(xs[0] - one) > 6) moved = true; sc(xs[0]); }
    });
    const up = e => { if (!P.has(e.pointerId)) return; const x = P.get(e.pointerId); P.delete(e.pointerId);
      if (P.size < 2) two = null;
      if (P.size === 0) { one = null; sc(null);
        if (!moved && e.type === 'pointerup' && e.pointerType !== 'mouse') { const n = Date.now();
          if (n - tap.t < 300 && Math.abs(x - tap.x) < 30) { dbl(x); tap.t = 0; } else tap = { t: n, x }; } } };
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up); // палец пошёл вверх-вниз — прокрутка страницы, карточка гаснет
    box.addEventListener('dblclick', e => { if (kind === 'mouse') dbl(xIn(box, e)); });
    box.addEventListener('wheel', e => { const g = G(), span = g.b - g.a, x = xIn(box, e);
      if (e.ctrlKey) { e.preventDefault(); const s = span * Math.exp(e.deltaY * 0.01); setWin(el, tOf(g, x) - frac(x) * s, s); }
      else if (el._wg.o.win && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); setWin(el, g.a + e.deltaX / (g.W - g.L - g.R) * span, span); }
    }, { passive: false });
  }

  const MODES = { chips, pinch, scrub, both };
  window.WGZOOM = mode => ({ zoom: mode, after: (el, S) => MODES[mode] && MODES[mode](el, S) });
})();
