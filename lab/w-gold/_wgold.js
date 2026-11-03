// w-gold — виджет «Перевес по золоту» (задачи созвона 26.10 §1, образец из Телеграма; дирижёр 26.10: «можно переносить в виджет, страница собирается только из виджетов»).
// Один код и для лабы w-gold, и для страницы матча (gs-match, data-wd="gold"): WGOLD.render(el, opts) — рисует в el под его ширину и перерисовывает при изменении ширины;
// WGOLD.set(el, { t }) — сдвинуть время (лаба: линия ползёт). opts: m — карта (OpenDota), t — секунда, state live / post / nodata, n — номер карты, base — путь к img/ (от страницы).
// Сверху всегда Radiant (зелёный, «+»), снизу Dire (красный). Внутри — колонка кнопок: события вкл/выкл, трансляция — мини-окно в углу без звука.
(() => {
  const D = window.GS_DATA;
  const HERO = Object.fromEntries(Object.entries(D.heroes).map(([id, h]) => [h.short, { ...h, id: +id }]));
  const hero = key => HERO[key.replace('npc_dota_hero_', '')] || { name: key, img: '' };
  // названия команд — из общей базы страницы GS_NAMES (gs-match/_wfit.js: NAME — как пишет команда, SHORT — коротко), не сырые OpenDota (там «TEAM VISION» капсом); решение дирижёра 30.10
  const team = id => { const t = D.teams[id] || { name: '—', tag: '—', logo: '' }, N = window.GS_NAMES; return N && N.NAME[id] ? { ...t, name: N.NAME[id], tag: N.SHORT[id] || t.tag } : t; };
  const k = v => (v < 0 ? '−' : '+') + (Math.abs(v) / 1000).toFixed(1) + 'k';
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  // перевес на секунду s: между минутными отметками — по прямой (так линия «ползёт»)
  const at = (m, s) => { const a = m.radiant_gold_adv, i = Math.min(Math.floor(s / 60), a.length - 1), f = s / 60 - i; return a[i] + ((a[i + 1] ?? a[i]) - a[i]) * Math.min(1, f); };
  // смерти: у каждого убийцы kills_log — время и герой-жертва; жертва — с другой стороны
  const deathsOf = m => { const by = Object.fromEntries(m.players.map(p => [p.hero_id, p]));
    return m.players.flatMap(p => p.kills_log.map(l => { const h = hero(l.key), v = by[h.id]; return { t: l.time, h, v, rad: v ? v.isRadiant : !p.isRadiant }; })).sort((a, b) => a.t - b.t); };
  // драки — смерти не дальше 25 с друг от друга → один ромб с числом
  const fights = (ds, now) => { const out = []; for (const d of ds.filter(d => d.t <= now)) { const f = out[out.length - 1]; if (f && d.t - f.last <= 25) { f.ds.push(d); f.last = d.t; } else out.push({ ds: [d], last: d.t }); } return out; };
  const objs = (m, now) => m.objectives.filter(o => o.time <= now && (o.type === 'CHAT_MESSAGE_ROSHAN_KILL' || (o.type === 'building_kill' && /tower|rax/.test(o.key))));

  const ICON = {
    gold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1 0-2-.5-2.5-1.5M12 6.5v11"/></svg>',
    ev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="13" rx="2"/><rect x="12" y="11" width="7" height="5" rx="1" fill="currentColor"/></svg>',
  };
  const tower = (x, y, c) => `<path d="M${x - 5} ${y + 6}h10v-8h-2v2h-2v-2h-2v2h-2v-2h-2z" fill="${c}"/>`;
  const rosh = (x, y) => `<circle cx="${x}" cy="${y + 1}" r="5" fill="#eab308"/><circle cx="${x - 2}" cy="${y}" r="1" fill="#000"/><circle cx="${x + 2}" cy="${y}" r="1" fill="#000"/>`;
  let uid = 0;

  function draw(el) {
    const S = el._wg, o = S.o, m = o.m, box = el.querySelector('.gw-plot'); if (!box) return;
    const W = box.clientWidth; if (!W) return;
    // gs-match-2 шаг 3: o.h — высота графика (функция от ширины), иначе как было
    const H = o.h ? o.h(W) : W >= 600 ? 300 : 210, now = o.state === 'post' ? m.duration : Math.min(o.t, m.duration), nd = o.state === 'nodata', IMG = o.base || '';
    const L = 36, R = 4, top = 26, evH = S.ev && !nd ? 22 : 0, plotB = H - 22 - evH, xl = H - 6;
    // лаба w-gold-2 (зум): o.win = { span, end } — видно span секунд до секунды end (end null — живой край, едет за «сейчас»); без o.win — вся карта, как было
    const wn = o.win && !nd ? o.win : null, bE = wn && wn.end != null ? Math.min(now, Math.max(wn.span, wn.end)) : now, a0 = wn ? Math.max(0, bE - wn.span) : 0, live = bE === now;
    const X = s => L + ((s - a0) / (bE - a0)) * (W - L - R);
    const secs = [a0]; for (let s = Math.floor(a0 / 60) * 60 + 60; s < bE; s += 60) secs.push(s); secs.push(bE);
    const vals = nd ? [0] : secs.map(s => at(m, s)), rng = Math.max(...vals.map(Math.abs));
    const step = !wn || rng > 12000 ? 5000 : rng > 5000 ? 2000 : 1000, hi = Math.max(step, Math.ceil(Math.max(...vals) / step) * step), lo = Math.min(-step, Math.floor(Math.min(...vals) / step) * step);
    const Y = v => top + (hi - v) / (hi - lo) * (plotB - top);
    let g = '';
    // сетка: по 5k и по 10 мин; последняя отметка — текущее время (при зуме — шаг мельче: 2k / 1k и 5 / 2 / 1 мин)
    for (let v = lo; v <= hi; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v ? 'var(--grid)' : '#3f3f46'}" ${v ? '' : 'stroke-dasharray="3 3"'}/>`
      + (v === hi || v === lo || v === 0 || (wn && W >= 600) ? `<text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${v ? (v > 0 ? '+' : '−') + Math.abs(v / 1000) + 'k' : '0'}</text>` : '');
    const tk = !wn ? 10 : [10, 5, 2, 1].find(t => (bE - a0) / (t * 60) <= (W >= 600 ? 9 : 5)) || 1;
    for (let mi = Math.floor(a0 / 60 / tk) * tk + tk; mi * 60 < bE; mi += tk) { const x = X(mi * 60); g += `<line x1="${x}" x2="${x}" y1="${top}" y2="${plotB}" stroke="var(--grid)"/>`;
      if (W - R - x > 44 && x - L > 12) g += `<text x="${x}" y="${xl}" text-anchor="middle">${mi}'</text>`; }
    g += `<line x1="${W - R}" x2="${W - R}" y1="${top}" y2="${plotB}" stroke="var(--grid)"/><text class="tx-now num" x="${W - R}" y="${xl}" text-anchor="end">${mmss(bE)}</text>`;
    let end = '';
    if (!nd) {
      const p = secs.map(s => `${X(s).toFixed(1)},${Y(at(m, s)).toFixed(1)}`), z = Y(0), area = `M${X(a0)},${z}L${p.join('L')}L${X(bE)},${z}Z`, id = S.id;
      const inW = t => t >= a0 && t <= bE;
      g += `<defs><clipPath id="u${id}"><rect x="0" y="0" width="${W}" height="${z}"/></clipPath><clipPath id="d${id}"><rect x="0" y="${z}" width="${W}" height="${H}"/></clipPath></defs>
        <path d="${area}" fill="var(--up-f)" clip-path="url(#u${id})"/><path d="${area}" fill="var(--dn-f)" clip-path="url(#d${id})"/>
        <path d="M${p.join('L')}" fill="none" stroke="#d4d4d8" stroke-width="1.6" stroke-linejoin="round"/>
        ${live ? `<circle cx="${X(now)}" cy="${Y(at(m, now))}" r="4" fill="#fff" class="${o.state === 'live' ? 'dot-live' : ''}"/>` : ''}`;
      // события: башни и Рошан — над нижней границей; драки — ромбами под графиком
      if (S.ev) {
        for (const ob of objs(m, now).filter(ob => inW(ob.time))) { const x = X(ob.time), y = plotB - 10;
          g += ob.type === 'building_kill' ? tower(x, y, /goodguys/.test(ob.key) ? 'var(--dn)' : 'var(--up)') : rosh(x, y); }
        fights(S.ds, now).forEach((f, i) => { if (!inW(f.ds[0].t)) return; const x = X(f.ds[0].t), y = plotB + 12, n = f.ds.length, a = f.ds.filter(d => !d.rad).length >= n / 2;
          g += `<g class="dm${S.pop === i ? ' on' : ''}" data-f="${i}">${o.zoom ? `<circle cx="${x}" cy="${y}" r="16" fill="transparent"/>` : ''}<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="2" transform="rotate(45 ${x} ${y})" fill="${a ? '#14532d' : '#7f1d1d'}" stroke="${a ? '#16a34a' : '#b91c1c'}"/>
            <text x="${x}" y="${y + 4}" text-anchor="middle" style="fill:#fff;font-size:${n > 9 ? 9 : 10}px;font-weight:600">${n}</text></g>`; });
      }
      const v = at(m, now), ey = Math.max(top + 11, Math.min(plotB - 11, Y(v)));
      if (live) end = `<div class="end num" style="left:${X(now)}px;top:${ey}px"><span>${mmss(now)}</span><b class="${v >= 0 ? 'up' : 'dn'}">${k(v)}</b></div>`;
    }
    S.geo = { L, R, W, H, top, plotB, a: a0, b: bE, now, X, Y };
    const a = team(m.radiant_team_id), b = team(m.dire_team_id);
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}">${g}</svg>
      <div class="tm tm--a"><i></i><img src="${IMG + a.logo}" alt="">${a.name}</div>
      <div class="tm tm--b" style="top:${plotB - 22}px"><i></i><img src="${IMG + b.logo}" alt="">${b.name}</div>
      <div class="cap">Золото · карта ${o.n}</div>${end}${nd ? '<div class="empty">Нет данных о золоте — карта идёт</div>' : ''}${S.pop != null ? pop(S, X, W, now) : ''}`;
    if (o.zoom) {
      // лаба w-gold-2 (телефон): ромб по нажатию открывает / закрывает список, нажатие мимо — закрывает; мышью — как было, наведением
      box.querySelectorAll('.dm').forEach(d => { const i = +d.dataset.f;
        d.onpointerenter = e => { if (e.pointerType === 'mouse') { S.pop = i; draw(el); } };
      });
      // нажатие ловим на всём графике: «идёт» перерисовывает его каждые 250 мс, и ромб под пальцем успевает смениться
      box.onclick = e => { if (e.target.closest('.pop')) return;
        const d = e.target.closest('.dm') || document.elementFromPoint(e.clientX, e.clientY)?.closest('.dm'), i = d ? +d.dataset.f : null;
        const nx = i == null ? null : S.pop === i && e.pointerType !== 'mouse' ? null : i; if (nx !== S.pop) { S.pop = nx; draw(el); } };
      box.onpointerleave = e => { if (e.pointerType === 'mouse' && S.pop != null) { S.pop = null; draw(el); } };
      o.after && o.after(el, S);
    } else {
      box.querySelectorAll('.dm').forEach(d => { d.onmouseenter = d.onclick = () => { S.pop = +d.dataset.f; draw(el); }; });
      box.onmouseleave = () => { if (S.pop != null) { S.pop = null; draw(el); } };
    }
  }

  // список смертей ромба: время, герой, игрок; полоска — сторона погибшего
  function pop(S, X, W, now) {
    const f = fights(S.ds, now)[S.pop]; if (!f) return '';
    const x = Math.max(0, Math.min(W - 240, X(f.ds[0].t) - 120)), IMG = S.o.base || '';
    return `<div class="pop" style="left:${x}px;bottom:-8px;transform:translateY(100%)"><b>${f.ds.length} ${f.ds.length === 1 ? 'смерть' : f.ds.length < 5 ? 'смерти' : 'смертей'} · ${mmss(f.ds[0].t)}</b>
      ${f.ds.map(d => `<div class="r ${d.rad ? 'a' : 'b'}"><small class="num">${mmss(d.t)}</small><img src="${IMG + d.h.img}" alt="">${(d.v && D.players[d.v.account_id]?.name) || d.h.name}</div>`).join('')}</div>`;
  }

  // каркас: колонка кнопок + место под график; трансляция — одно окно на страницу, в углу
  function shell(el) {
    const S = el._wg, a = team(S.o.m.radiant_team_id), b = team(S.o.m.dire_team_id);
    // gs-match-2 шаг 3: o.rail === 'top' — кнопки не колонкой слева, а маленькой группой справа сверху (нажимают редко)
    el.innerHTML = `<div class="gw${S.o.rail === 'top' ? ' gw--top' : ''}"><div class="gw-rail"><button class="on" title="Перевес по золоту">${ICON.gold}</button>
      <button data-g="ev" class="${S.ev ? 'on' : ''}" title="События на графике: башни, Рошан, драки">${ICON.ev}</button>
      <button data-g="tv" class="${S.pip ? 'on' : ''}" title="Трансляция — маленьким окном, без звука">${ICON.tv}</button></div><div class="gw-plot"></div></div>`;
    el.querySelector('[data-g="ev"]').onclick = () => { S.ev = !S.ev; shell(el); };
    el.querySelector('[data-g="tv"]').onclick = () => { S.pip = !S.pip; shell(el); };
    document.querySelectorAll('.wg-pip').forEach(p => p.remove());
    if (S.pip) { const p = document.createElement('div'); p.className = 'wg-pip'; p.innerHTML = `<span>${a.tag} — ${b.tag} · без звука</span><button title="Закрыть">×</button>`;
      p.querySelector('button').onclick = () => { S.pip = false; shell(el); }; document.body.append(p); }
    draw(el);
  }

  window.WGOLD = {
    render(el, o) {
      const S = el._wg || (el._wg = { id: 'wg' + ++uid, ev: true, pip: false, pop: null });
      S.o = o; S.ds = deathsOf(o.m); S.pop = null;
      if (!S.ro && window.ResizeObserver) { S.ro = new ResizeObserver(() => draw(el)); S.ro.observe(el); }
      shell(el);
    },
    set(el, patch) { const S = el._wg; if (!S) return; Object.assign(S.o, patch); draw(el); },
  };
})();
