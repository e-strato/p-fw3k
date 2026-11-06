// w-stats-2 — созвон 05.11, задача 7 «Золото и драфт» (дирижёр 05.11: «давай — золото и драфт в „Статистике“»).
// Не табами и не в колонке — во вкладке «Статистика», после «Составов», с переключателем карт (7.1). Карта по умолчанию — идущая (или последняя сыгранная).
// Золото (7.2): не по времени, а «сейчас против обычного» — у каждого игрока и у команды: тусклая полоса — обычно к этой минуте, яркая поверх — сейчас.
//   «Обычно» = средний GPM игрока на TI 2026 (общая база) × минута карты. «Сейчас» — нетворс на минуту (nw_t), идущая карта — на время графика.
// Драфт (7.3): как макет Figma «eS — Drafts» (кадры 05.11/кадры/figma/f2, f3), в нашем тёмном стиле: полоса шансов драфта, 5 пиков стороны с номером пика и «ценностью» героя,
//   в центре команды; ниже — баны серыми с номерами; ниже — таблица героев: ценность, герой, игрок и позиция, побед на TI, пиков, банов.
//   ‼️ Ценность героя и шанс драфта — оценка из побед героя на TI 2026 (общая база, heroStats), настоящая механика у них своя («в продукте встанет их рабочая механика»).
(() => {
  const GD = window.GS_DATA, esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const NMS = (window.GS_NAMES && GS_NAMES.NAME) || {};
  const teamOf = id => ({ name: (window.GS_TOURNAMENT && GS_TOURNAMENT.names && GS_TOURNAMENT.names[id] || '').trim() || NMS[id] || String(id), logo: `img/teams/${id}.png` });
  const k1 = v => v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : String(Math.round(v));
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  // серия — по табам серии (data-k = series_id): во вкладке «Статистика» нижней строки с игроками нет
  const seriesOf = () => { const n = document.querySelector('.ws-tabs[data-k]'), k = n ? parseInt(n.dataset.k, 10) : 0, h = document.querySelector('.d3-h[data-hc]'), mid = h ? +h.dataset.hc.split('|')[0] : 0;
    return GD && (GD.series.find(x => x.series_id === k) || GD.series.find(x => x.maps.some(m => m.match_id === mid))); };
  // время карты: сыгранная — длина; идущая — время графика (как w-tabs6); не начата — -1
  const mapT = m => { const live = [...document.querySelectorAll('[data-wd="gold"]')].find(w => w._g2 && w._g2.o.m.match_id === m.match_id); if (live) { const o = live._g2.o; return o.state === 'post' ? m.duration : Math.min(o.t, m.duration); }
    const now = window.GS_NOW || 0; return now >= m.start_time + m.duration ? m.duration : now >= m.start_time ? now - m.start_time : -1; };
  // позиции внутри команды — как нижняя строка (по нетворсу и линии)
  const posOf = ps => { const by = [...ps].sort((a, b) => b.net_worth - a.net_worth), out = new Map(), cores = by.slice(0, 3), sups = by.slice(3), free = [1, 2, 3];
    [2, 1, 3].forEach(r => { const c = cores.find(q => q.lane_role === r && !out.has(q)); if (c && free.includes(r)) { out.set(c, r); free.splice(free.indexOf(r), 1); } });
    cores.filter(q => !out.has(q)).forEach(q => out.set(q, free.shift())); sups.forEach((q, i) => out.set(q, 4 + i)); return out; };
  const nwAt = (p, t) => { const a = p.nw_t || []; if (!a.length) return p.net_worth || 0; return a[Math.max(0, Math.min(a.length - 1, Math.floor(t / 60)))] || 0; };
  const stats = () => { const D = window.DB; if (!D || !D.playerStats) return new Map(); return new Map(D.playerStats('ti-2026').map(x => [x.player, x])); };
  const heroBy = () => { const H = new Map(); Object.entries(GD.heroes).forEach(([id, h]) => H.set(+id, h)); return H; };
  const hs = () => { const D = window.DB, h = D && D.heroStats && D.heroStats('ti-2026'); return new Map(h ? h.list.map(x => [x.hero, x]) : []); };
  let SEL = null; // match_id выбранной карты

  // поправка: GPM считают по всей карте (с покупками и концовкой), нетворс к минуте ниже — без неё «обычно» у всех выше на ~20 %.
  //   K(мин) — средняя доля «нетворс к минуте / (GPM карты × минута)» по всем картам в данных страницы (GS_DATA)
  const KC = new Map(), K = min => { const k = Math.max(1, Math.round(min)); if (KC.has(k)) return KC.get(k); let a = 0, n = 0;
    GD.series.forEach(S => S.maps.forEach(m => m.players.forEach(p => { const v = (p.nw_t || [])[k]; if (v && p.gold_per_min && m.duration / 60 > k) { a += v / (p.gold_per_min * k); n++; } })));
    const r = n ? a / n : 1; KC.set(k, r); return r; };
  const gold = (m, t, H, ST) => { const min = t / 60, kk = K(min), side = rad => { const ps = m.players.filter(p => p.isRadiant === rad), P = posOf(ps);
      const rows = ps.map(p => { const pl = window.DB && DB.player(p.account_id), st = pl && ST.get(pl.id), avg = st ? st.gpm * min * kk : null, now = nwAt(p, t), h = H.get(p.hero_id) || {};
        return { p, pos: P.get(p), nick: pl ? pl.nick : String(p.account_id), icon: h.icon || '', hero: h.name || '', now, avg }; }).sort((a, b) => a.pos - b.pos);
      const T = teamOf(rad ? m.radiant_team_id : m.dire_team_id), now = rows.reduce((a, r) => a + r.now, 0), avg = rows.every(r => r.avg != null) ? rows.reduce((a, r) => a + r.avg, 0) : null;
      return { T, rows, now, avg }; };
    const A = side(true), B = side(false), max = Math.max(...[...A.rows, ...B.rows].flatMap(r => [r.now, r.avg || 0]), 1), tmax = Math.max(A.now, B.now, A.avg || 0, B.avg || 0, 1);
    const d = (now, avg) => avg ? Math.round((now / avg - 1) * 100) : null, sg = v => v == null ? '' : `<em class="wsg-d ${v >= 0 ? 'up' : 'dn'}">${v >= 0 ? '+' : '−'}${Math.abs(v)}%</em>`;
    const bar = (now, avg, mx) => `<span class="wsg-bar">${avg ? `<i class="wsg-avg" style="width:${(avg / mx * 100).toFixed(1)}%"></i>` : ''}<i class="wsg-now${avg && now < avg ? ' is-lo' : ''}" style="width:${(now / mx * 100).toFixed(1)}%"></i>${avg ? `<i class="wsg-tick" style="left:${(avg / mx * 100).toFixed(1)}%"></i>` : ''}</span>`;
    const col = S => `<div class="wsg-col"><div class="wsg-th"><img src="${esc(S.T.logo)}" alt=""><b>${esc(S.T.name)}</b><span class="wsg-tn"><b class="num">${k1(S.now)}</b>${sg(d(S.now, S.avg))}</span></div>
      <div class="wsg-tb">${bar(S.now, S.avg, tmax)}<small>Обычно к ${mmss(t)} — <span class="num">${S.avg ? k1(S.avg) : '—'}</span></small></div>
      ${S.rows.map(r => `<div class="wsg-r"><span class="wsg-h"><img src="${esc(r.icon)}" alt="" title="${esc(r.hero)}"><b class="num">${r.pos}</b></span><span class="wsg-n">${esc(r.nick)}</span>${bar(r.now, r.avg, max)}<span class="wsg-v"><b class="num">${k1(r.now)}</b><small class="num">${r.avg ? k1(r.avg) : '—'}</small></span></div>`).join('')}</div>`;
    return `<div class="wsg-g">${col(A)}${col(B)}</div><p class="wsg-note">Яркая полоса — нетворс сейчас, тусклая и черта — обычно к этой минуте: средний GPM игрока на TI 2026 × ${Math.round(min)} мин, с поправкой на то, какая часть золота к этой минуте обычно в нетворсе</p>`; };

  const draft = (m, H, HS) => { const pb = (m.picks_bans || []).slice().sort((a, b) => a.order - b.order);
    const val = id => { const h = H.get(id), s = h && HS.get(h.short); return s && s.picks ? (s.pickWins / s.picks - .5) * 100 : 0; };
    const sideP = r => pb.filter(x => x.is_pick && x.team === (r ? 0 : 1)), sideB = r => pb.filter(x => !x.is_pick && x.team === (r ? 0 : 1));
    const wr = r => sideP(r).reduce((a, x) => a + val(x.hero_id), 0), a = wr(true), b = wr(false), pa = Math.max(5, Math.min(95, 50 + (a - b) / 4));
    const A = teamOf(m.radiant_team_id), B = teamOf(m.dire_team_id), pc = v => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}%`;
    const pick = x => { const h = H.get(x.hero_id) || {}, v = val(x.hero_id); return `<span class="wsg-pk" title="${esc(h.name || '')}"><img src="${esc(h.img || '')}" alt=""><em class="wsg-pv ${v >= 0 ? 'up' : 'dn'}">${pc(v)}</em><b class="num">${x.order + 1}</b></span>`; };
    const ban = x => { const h = H.get(x.hero_id) || {}; return `<span class="wsg-bn" title="${esc(h.name || '')}"><img src="${esc(h.img || '')}" alt=""><b class="num">${x.order + 1}</b></span>`; };
    const ps = new Map(m.players.map(p => [p.hero_id, p])), P = new Map([...posOf(m.players.filter(p => p.isRadiant)), ...posOf(m.players.filter(p => !p.isRadiant))]);
    const rows = [...sideP(true), ...sideP(false)].map(x => { const h = H.get(x.hero_id) || {}, s = HS.get(h.short) || {}, p = ps.get(x.hero_id), pl = p && window.DB && DB.player(p.account_id), v = val(x.hero_id);
      return `<tr><td class="wsg-dv ${v >= 0 ? 'up' : 'dn'} num">${pc(v)}</td><td class="wsg-hh"><img src="${esc(h.img || '')}" alt=""><span>${esc(h.name || '')}</span></td>
        <td><span class="wsg-pl"><img src="${esc((x.team ? B : A).logo)}" alt="">${esc(pl ? pl.nick : '—')}</span><small>${p ? 'Позиция ' + P.get(p) : ''}</small></td>
        <td class="num">${s.picks ? Math.round(s.pickWins / s.picks * 100) + '%' : '—'}<small>${s.picks ? s.pickWins + ' из ' + s.picks : ''}</small></td><td class="num">${s.picks ?? '—'}</td><td class="num">${s.bans ?? '—'}</td></tr>`; }).join('');
    return `<div class="wsg-dr"><div class="wsg-pb"><span style="width:${pa.toFixed(2)}%"><b class="num">${pa.toFixed(2).replace('.', ',')}%</b></span><span><b class="num">${(100 - pa).toFixed(2).replace('.', ',')}%</b></span></div>
      <div class="wsg-pr"><div class="wsg-ps">${sideP(true).map(pick).join('')}</div><div class="wsg-vs"><span><small>Radiant</small><img src="${esc(A.logo)}" alt=""><b>${esc(A.name)}</b></span><i>›</i><span><small>Dire</small><img src="${esc(B.logo)}" alt=""><b>${esc(B.name)}</b></span></div><div class="wsg-ps">${sideP(false).map(pick).join('')}</div></div>
      <div class="wsg-br"><div class="wsg-bs">${sideB(true).map(ban).join('')}</div><span class="wsg-bl">Баны</span><div class="wsg-bs">${sideB(false).map(ban).join('')}</div></div></div>
      <table class="wsg-t"><thead><tr><th>Ценность<br>драфта</th><th>Герой</th><th>Игрок</th><th>Побед на TI</th><th>Пиков</th><th>Банов</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="wsg-note">‼️ Ценность героя и шанс драфта — пример: из побед героя на TI 2026; в продукте — их механика</p>`; };

  // v2 past (дирижёр 05.11: «как статистика прошлых карт, не текущей — золото текущей и так на графике; драфт — баны и всё такое, вещь эстетическая;
  //   переключатель не нужен, компактнее — в две колонки: золото и драфты, и повыше»): блок «Сыгранные карты» сразу после «О матче» (над «Составами»),
  //   строка на сыгранную карту, идущая не показывается; слева — золото команд на конец карты против обычного за такую длину, справа — драфт: пики и баны обеих сторон
  // 05.11: префикс wpm-, не wsp- — .wsp занят шторкой w-social (position: fixed), блок улетал поверх страницы
  const past = () => { const S = seriesOf(); if (!S) return ''; const H = heroBy(), ST = stats(), HS = hs(), L = S.maps.map((m, i) => ({ m, i, t: mapT(m) })).filter(x => x.t >= x.m.duration);
    if (!L.length) return '';
    const row = ({ m, i }) => { const t = m.duration, kk = K(t / 60), W = teamOf(m.radiant_win ? m.radiant_team_id : m.dire_team_id);
      const side = rad => { const ps = m.players.filter(p => p.isRadiant === rad), T = teamOf(rad ? m.radiant_team_id : m.dire_team_id), now = ps.reduce((a, p) => a + nwAt(p, t), 0);
        const av = ps.map(p => { const pl = window.DB && DB.player(p.account_id), st = pl && ST.get(pl.id); return st ? st.gpm * (t / 60) * kk : null; }), avg = av.every(v => v != null) ? av.reduce((a, v) => a + v, 0) : null;
        return { T, now, avg, win: rad === m.radiant_win, rad }; };
      const A = side(true), B = side(false), mx = Math.max(A.now, B.now, A.avg || 0, B.avg || 0, 1), d = (n, a) => a ? Math.round((n / a - 1) * 100) : null;
      const bar = (now, avg) => `<span class="wsg-bar">${avg ? `<i class="wsg-avg" style="width:${(avg / mx * 100).toFixed(1)}%"></i>` : ''}<i class="wsg-now${avg && now < avg ? ' is-lo' : ''}" style="width:${(now / mx * 100).toFixed(1)}%"></i>${avg ? `<i class="wsg-tick" style="left:${(avg / mx * 100).toFixed(1)}%"></i>` : ''}</span>`;
      const gr = X => { const v = d(X.now, X.avg); return `<div class="wpm-gr${X.win ? ' is-win' : ''}"><img src="${esc(X.T.logo)}" alt=""><span class="wpm-tn">${esc(X.T.name)}</span>${bar(X.now, X.avg)}<b class="num">${k1(X.now)}</b><em class="wsg-d ${v == null ? '' : v >= 0 ? 'up' : 'dn'}">${v == null ? '' : (v >= 0 ? '+' : '−') + Math.abs(v) + '%'}</em></div>`; };
      const pb = (m.picks_bans || []).slice().sort((a, b) => a.order - b.order), hi = x => { const h = H.get(x.hero_id) || {}; return `<span class="${x.is_pick ? 'wpm-pk' : 'wpm-bn'}" title="${esc(h.name || '')}"><img src="${esc(h.img || '')}" alt=""><b class="num">${x.order + 1}</b></span>`; };
      const dr = X => `<div class="wpm-dr${X.win ? ' is-win' : ''}"><img class="wpm-lg" src="${esc(X.T.logo)}" alt="" title="${esc(X.T.name)}"><span class="wpm-pks">${pb.filter(x => x.is_pick && x.team === (X.rad ? 0 : 1)).map(hi).join('')}</span><span class="wpm-bns">${pb.filter(x => !x.is_pick && x.team === (X.rad ? 0 : 1)).map(hi).join('')}</span></div>`;
      return `<div class="wpm-m"><div class="wpm-mh"><b>Map ${i + 1}</b><small>Win ${esc(W.name)} · ${mmss(t)}</small></div>
        <div class="wpm-c"><div class="wpm-g">${gr(A)}${gr(B)}</div><div class="wpm-d">${dr(A)}${dr(B)}</div></div></div>`; };
    return `<section class="cd wsg wpm"><div class="wpm-hd"><b>Сыгранные карты</b><span class="wpm-cols"><small>Золото на конец карты · черта — обычно за такую длину</small><small>Драфт · пики и баны, цифра — очерёдность</small></span></div>${L.map(row).join('')}</section>`; };

  const build = () => { const S = seriesOf(); if (!S) return ''; const H = heroBy(), ST = stats(), HS = hs();
    const L = S.maps.map((m, i) => ({ m, i, t: mapT(m) })), played = L.filter(x => x.t >= 0), cur = L.find(x => x.m.match_id === SEL && x.t >= 0) || played.find(x => x.t < x.m.duration) || played[played.length - 1];
    if (!cur) return ''; const seg = `<div class="wsg-seg">${L.map(x => `<button data-wsg="${x.m.match_id}" class="${x === cur ? 'on' : ''}"${x.t < 0 ? ' disabled' : ''}>Map ${x.i + 1}${x.t < 0 ? '' : x.t < x.m.duration ? ' <i class="wsg-live"></i>' : ''}</button>`).join('')}</div>`;
    const st = cur.t < cur.m.duration ? `идёт · ${mmss(cur.t)}` : `итог · ${mmss(cur.m.duration)}`;
    return `<section class="cd wsg"><div class="wsg-hd"><b>Map ${cur.i + 1}</b><small>${st}</small>${seg}</div>
      <div class="wsg-sec"><h4>Золото</h4>${gold(cur.m, cur.t, H, ST)}</div>
      <div class="wsg-sec"><h4>Драфт</h4>${draft(cur.m, H, HS)}</div></section>`; };

  // перерисовка — только если разметка изменилась (сравниваем со строкой прошлой отрисовки, не с outerHTML — иначе наблюдатель зациклится)
  let LAST = '';
  // v3 maps (дирижёр 05.11: «v2 некрасиво, v1 было красивее; тяжело — поставь в самый верх; по картам — Map 1, Map 2, Map 3; у идущей — пустое место „карта ещё не закончилась“;
  //   а та статистика (что была) — это прошлые матчи, так и назвать»): «По картам» — первым во вкладке, три колонки (карта на колонку), в духе v1:
  //   шапка карты, драфт — полоса шансов, у каждой стороны лого и 5 пиков, под ними баны серыми; золото — у команды полоса «сейчас / обычно» и ±%.
  //   Идущая карта: драфт есть, на месте золота — «Карта ещё не закончилась»; не начатая — вся колонка «Ещё не сыграна». Ниже «О матче» и остальное — под заголовком «Прошлые матчи»
  const cols3 = () => { const S = seriesOf(); if (!S) return ''; const H = heroBy(), ST = stats(), HS = hs();
    const one = (m, i) => { const t = mapT(m), done = t >= m.duration, live = t >= 0 && !done;
      if (t < 0) return `<div class="wmc is-off"><div class="wmc-h"><b>Map ${i + 1}</b><small>Не начата</small></div><div class="wmc-0">Ещё не сыграна</div></div>`;
      const W = teamOf(m.radiant_win ? m.radiant_team_id : m.dire_team_id), pb = (m.picks_bans || []).slice().sort((a, b) => a.order - b.order);
      const val = id => { const h = H.get(id), st = h && HS.get(h.short); return st && st.picks ? (st.pickWins / st.picks - .5) * 100 : 0; };
      const sd = rad => ({ rad, T: teamOf(rad ? m.radiant_team_id : m.dire_team_id), win: done && rad === m.radiant_win, P: pb.filter(x => x.is_pick && x.team === (rad ? 0 : 1)), B: pb.filter(x => !x.is_pick && x.team === (rad ? 0 : 1)) });
      const A = sd(true), B = sd(false), va = A.P.reduce((a, x) => a + val(x.hero_id), 0), vb = B.P.reduce((a, x) => a + val(x.hero_id), 0), pa = Math.max(5, Math.min(95, 50 + (va - vb) / 4));
      const hi = (x, cls) => { const h = H.get(x.hero_id) || {}; return `<span class="${cls}" title="${esc(h.name || '')}"><img src="${esc(h.img || '')}" alt=""><b class="num">${x.order + 1}</b></span>`; };
      const dside = X => `<div class="wmc-ds${X.win ? ' is-win' : ''}"><span class="wmc-tm"><img src="${esc(X.T.logo)}" alt=""><b>${esc(X.T.name)}</b>${X.win ? '<em>Win</em>' : ''}</span><div class="wmc-pk">${X.P.map(x => hi(x, 'wmc-p')).join('')}</div><div class="wmc-bn">${X.B.map(x => hi(x, 'wmc-b')).join('')}</div></div>`;
      let gold = '<div class="wmc-0">Карта ещё не закончилась</div>';
      if (done) { const kk = K(m.duration / 60), gs = X => { const ps = m.players.filter(p => p.isRadiant === X.rad), now = ps.reduce((a, p) => a + nwAt(p, m.duration), 0);
          const av = ps.map(p => { const pl = window.DB && DB.player(p.account_id), st = pl && ST.get(pl.id); return st ? st.gpm * (m.duration / 60) * kk : null; }), avg = av.every(v => v != null) ? av.reduce((a, v) => a + v, 0) : null; return { ...X, now, avg }; };
        const GA = gs(A), GB = gs(B), mx = Math.max(GA.now, GB.now, GA.avg || 0, GB.avg || 0, 1);
        const g = X => { const v = X.avg ? Math.round((X.now / X.avg - 1) * 100) : null; return `<div class="wmc-g${X.win ? ' is-win' : ''}"><span class="wmc-gt"><img src="${esc(X.T.logo)}" alt=""><b class="num">${k1(X.now)}</b>${v == null ? '' : `<em class="wsg-d ${v >= 0 ? 'up' : 'dn'}">${v >= 0 ? '+' : '−'}${Math.abs(v)}%</em>`}<small class="num">Обычно ${X.avg ? k1(X.avg) : '—'}</small></span>
          <span class="wsg-bar">${X.avg ? `<i class="wsg-avg" style="width:${(X.avg / mx * 100).toFixed(1)}%"></i>` : ''}<i class="wsg-now${X.avg && X.now < X.avg ? ' is-lo' : ''}" style="width:${(X.now / mx * 100).toFixed(1)}%"></i>${X.avg ? `<i class="wsg-tick" style="left:${(X.avg / mx * 100).toFixed(1)}%"></i>` : ''}</span></div>`; };
        gold = g(GA) + g(GB); }
      return `<div class="wmc${live ? ' is-live' : ''}"><div class="wmc-h"><b>Map ${i + 1}</b><small>${live ? `<i class="wsg-live"></i>Идёт · ${mmss(t)}` : `Win ${esc(W.name)} · ${mmss(m.duration)}`}</small></div>
        <div class="wmc-sec"><h5>Драфт</h5>${pb.length ? `<div class="wsg-pb wmc-pb"><span style="width:${pa.toFixed(1)}%"><b class="num">${Math.round(pa)}%</b></span><span><b class="num">${100 - Math.round(pa)}%</b></span></div>${dside(A)}${dside(B)}` : '<div class="wmc-0">Драфт ещё идёт</div>'}</div>
        <div class="wmc-sec"><h5>Золото на конец карты</h5>${gold}</div></div>`; };
    return `<section class="cd wsg wmp"><div class="wmp-hd"><b>${HIER ? 'Эта серия' : 'По картам'}</b><small>${HIER ? `${S.maps.length} ${S.maps.length > 4 ? 'карт' : 'карты'} · драфт и золото по каждой · шанс и ценность — пример` : 'шанс драфта и ценность — пример · черта у золота — обычно за такую длину'}</small></div><div class="wmp-g">${S.maps.map(one).join('')}</div></section>`; };
  // v4 (дирижёр 05.11: «заголовки чуть побольше на десктопе»): WSG_H — заголовки секций вкладки («По картам», «Прошлые матчи», «О матче», «Составы», «Статистика к матчу») 16 px на компьютере
  // класс wsg-h16, не wsg-h: .wsg-h — обёртка иконки героя (32 × 32), на <html> она сжимала всю страницу
  // v5 (дирижёр 05.11: «глупо — „Прошлые матчи“, а под ним „О матче“, „Составы“ вперемешку; логично: заголовки второго порядка, тонкие разделители, чтобы не было единообразно»): WSG_HIER —
  //   два раздела первого уровня: «Эта серия» (карты) и «До серии» (статистика команд на турнире); внутри «До серии» — заголовки второго уровня:
  //   «Шансы» (было «О матче»), «Составы», «На турнире» (было «Статистика к матчу»); между подблоками — тонкая черта, между разделами — отступ и черта во всю ширину
  const HIER = !!window.WSG_HIER; if (HIER) document.documentElement.classList.add('wsg-hier');
  const rename = () => { if (!HIER) return; [['.wstA-hd b', 'О матче', 'Шансы'], ['.ws7-top b', 'Статистика к матчу', 'На турнире']].forEach(([q, a, b]) => document.querySelectorAll(q).forEach(x => { if (x.textContent.trim() === a) x.textContent = b; })); };
  if (window.WSG_H) document.documentElement.classList.add('wsg-h16');
  // v6–v9 (дирижёр 05.11: «нужны самые разные версии блока карт — золото, драфт, баны, пики — визуально разные, эта не очень нравится»): WSG_V — вид «Этой серии»
  //   rows — строка на карту во всю ширину: слева карта, по центру драфт двумя дорожками (пики крупно, баны мелко), справа золото — перетягивание одной полосой
  //   vs — карточки «versus»: пики сторон — столбиками зеркально, по центру карта, счёт золота и кто взял; баны — полоской снизу
  //   order — драфт по очереди, как в игре: все 24 шага в линию, Radiant сверху, Dire снизу, баны мелко и серо, пики крупно; золото — строкой с разницей
  //   poster — крупно: пики большими портретами, у победителя — ярко, у проигравшего — приглушённо; золото — два больших числа; баны — точками-иконками
  const SV = window.WSG_V || '';
  const WSG_LM = window.WSG_LM || '';
  // v9 (дирижёр 05.11: «карту поменьше»): WSG_LM_SM — в v8 карта 220 px вместо 300
  if (window.WSG_LM_SM) document.documentElement.classList.add('wl2-sm');
  // v13 (дирижёр 05.11: «v10 норм, но карту — на максимально возможную высоту, пики пусть станут чуть меньше; пустого места не оставлять»): WSG_LM_BIG — в v10 карта 280 (высота двух команд), полоса золота уже, пики сжимаются по ширине
  if (window.WSG_LM_BIG) document.documentElement.classList.add('wz-big');
  // v14 (дирижёр 05.11: «v13, но чтобы золото было золотом — и значок золота, как у Claude-A»): WSG_GOLD — у чисел значок золота из Доты (w-bottom-2/gold.png, Steam CDN), числа и полоса — золотые
  const GOLD = !!window.WSG_GOLD, GC = GOLD ? '<img class="wg-coin" src="../w-bottom-2/gold.png" alt="">' : '';
  if (GOLD) document.documentElement.classList.add('wsg-gold');
  // v15 (дирижёр 05.11: «тонкую линию середины, чтобы понятно, кто её пересёк»): WSG_MID — черта 50 % на полосе золота
  if (window.WSG_MID) document.documentElement.classList.add('wsg-mid');
  const md = (m, i, H, ST, HS) => { const t = mapT(m), done = t >= m.duration, live = t >= 0 && !done, pb = (m.picks_bans || []).slice().sort((a, b) => a.order - b.order);
    const val = id => { const h = H.get(id), st = h && HS.get(h.short); return st && st.picks ? (st.pickWins / st.picks - .5) * 100 : 0; };
    const kk = done ? K(m.duration / 60) : 1;
    const sd = rad => { const ps = m.players.filter(p => p.isRadiant === rad), now = done ? ps.reduce((a, p) => a + nwAt(p, m.duration), 0) : null;
      const av = ps.map(p => { const pl = window.DB && DB.player(p.account_id), st = pl && ST.get(pl.id); return st ? st.gpm * (m.duration / 60) * kk : null; }), avg = done && av.every(v => v != null) ? av.reduce((a, v) => a + v, 0) : null;
      return { rad, T: teamOf(rad ? m.radiant_team_id : m.dire_team_id), win: done && rad === m.radiant_win, P: pb.filter(x => x.is_pick && x.team === (rad ? 0 : 1)), B: pb.filter(x => !x.is_pick && x.team === (rad ? 0 : 1)), now, avg }; };
    const A = sd(true), B = sd(false), va = A.P.reduce((a, x) => a + val(x.hero_id), 0), vb = B.P.reduce((a, x) => a + val(x.hero_id), 0);
    return { m, i, t, done, live, off: t < 0, pb, A, B, pa: Math.max(5, Math.min(95, 50 + (va - vb) / 4)), W: done ? (m.radiant_win ? A : B) : null }; };
  // v14 (дирижёр 05.11: «маленькие иконки с мини-карты — в уголок, хотя бы у выбранных; будет связь с картой»): WSG_PKI — у пика в левом нижнем углу иконка героя с мини-карты (как на карте линий)
  // v15 WSG_PKI = 'big' — иконка в углу крупнее · v16 WSG_PKO — пики только иконками мини-карты (без портретов), баны как были
  if (window.WSG_PKI === 'big') document.documentElement.classList.add('wpi-big');
  if (window.WSG_PKO) document.documentElement.classList.add('wpi-only');
  // v17 (дирижёр 05.11: «баны тоже этими же — в v16»): WSG_PKO = 'all' — и баны иконками мини-карты, серыми
  if (window.WSG_PKO === 'all') document.documentElement.classList.add('wpi-all');
  const himg = (H, x, cls, big) => { const h = H.get(x.hero_id) || {}; return `<span class="${cls}" title="${esc(h.name || '')}"><img src="${esc((big ? h.img : h.img) || '')}" alt=""><b class="num">${x.order + 1}</b>${(window.WSG_PKI || window.WSG_PKO) && (x.is_pick || window.WSG_PKO === 'all') && h.icon ? `<i class="wpi"><img src="${esc(h.icon)}" alt=""></i>` : ''}</span>`; };
  const pct = (X, Y) => X.now && Y.now ? Math.round(X.now / (X.now + Y.now) * 100) : 50;
  const dv = X => X.avg ? Math.round((X.now / X.avg - 1) * 100) : null, dvs = v => v == null ? '' : `<em class="wsg-d ${v >= 0 ? 'up' : 'dn'}">${v >= 0 ? '+' : '−'}${Math.abs(v)}%</em>`;
  // 05.11 (дирижёр: «в сегменте Map, а тут Карта; ничего с маленькой буквы; победа — Win, как решали»): Map N, подписи с большой буквы, победа — Win
  const mstate = d => d.off ? 'Не начата' : d.live ? `<i class="wsg-live"></i>Идёт · ${mmss(d.t)}` : `${mmss(d.m.duration)}`;
  const variant = () => { const S = seriesOf(); if (!S) return ''; const H = heroBy(), ST = stats(), HS = hs(), L = S.maps.map((m, i) => md(m, i, H, ST, HS));
    const head = `<div class="wmp-hd"><b>${HIER ? 'Эта серия' : 'По картам'}</b><small>${L.length} ${L.length > 4 ? 'карт' : 'карты'} · драфт и золото по каждой · шанс и ценность — пример</small></div>`;
    let body = '';
    if (SV === 'rows') body = L.map(d => { if (d.off) return `<div class="wr-r is-off"><div class="wr-m"><b>Map ${d.i + 1}</b><small>Не начата</small></div><div class="wr-0">Ещё не сыграна</div></div>`;
      const lane = X => `<div class="wr-l${X.win ? ' is-win' : ''}"><img class="wr-lg" src="${esc(X.T.logo)}" alt="" title="${esc(X.T.name)}"><span class="wr-p">${X.P.map(x => himg(H, x, 'wr-pk')).join('')}</span><span class="wr-b">${X.B.map(x => himg(H, x, 'wr-bn')).join('')}</span></div>`;
      const g = d.done ? (() => { const p = pct(d.A, d.B); return `<div class="wr-g"><div class="wr-gn"><span><img src="${esc(d.A.T.logo)}" alt=""><b class="num">${k1(d.A.now)}</b>${dvs(dv(d.A))}</span><span>${dvs(dv(d.B))}<b class="num">${k1(d.B.now)}</b><img src="${esc(d.B.T.logo)}" alt=""></span></div><div class="wr-tug"><i style="width:${p}%"></i><i></i></div><small>Золото на конец · ±% к обычному</small></div>`; })() : '<div class="wr-g wr-0">Карта ещё не закончилась</div>';
      return `<div class="wr-r${d.live ? ' is-live' : ''}"><div class="wr-m"><b>Map ${d.i + 1}</b><small>${mstate(d)}</small>${d.W ? `<span class="wr-w"><img src="${esc(d.W.T.logo)}" alt="">Win</span>` : ''}</div><div class="wr-d">${lane(d.A)}${lane(d.B)}</div>${g}</div>`; }).join('');
    // v10–v13 (дирижёр 05.11: «v6 больше всего понравилась — на её основе несколько кардинально разных»):
    //   lanes — золото не отдельной колонкой, а в конце дорожки каждой команды; дорожка победителя подсвечена фоном
    //   spark — как v6, но справа не полоса, а ход карты: график разницы в золоте по минутам (radiant_gold_adv), итог числом
    //   big — как v6, но пики крупно 3 : 4, баны под пиками рядком, золото — столбиком справа крупными числами
    //   mirror — одна строка на карту зеркально: лого, пики и баны первой команды · по центру золото и полоса · баны, пики и лого второй
    else if (['lanes', 'spark', 'big', 'mirror'].includes(SV)) body = L.map(d => { const mh = `<div class="wr-m"><b>Map ${d.i + 1}</b><small>${mstate(d)}</small>${d.W ? `<span class="wr-w"><img src="${esc(d.W.T.logo)}" alt="">Win</span>` : ''}</div>`;
      if (d.off) return `<div class="wr-r wx--${SV} is-off">${mh}<div class="wr-0">Ещё не сыграна</div></div>`;
      // w-gold-pl v1 (созвон 06.11 §3.5, дирижёр: «золото у каждого игрока — в статистике»): WSG_PGOLD — под каждым пиком сыгранной карты нетворс игрока на конец карты; идущая карта — без чисел
      const nwOf = x => (d.m.players.find(q => q.hero_id === x.hero_id) || {}).net_worth || 0, mx = d.done ? Math.max(...d.m.players.map(q => q.net_worth || 0), 1) : 1;
      const nkOf = x => { const a = (d.m.players.find(q => q.hero_id === x.hero_id) || {}).account_id, p = a && window.DB && DB.players().find(y => y.steam === a); return p ? esc(p.nick) : ''; }; // w-gold-pl v3 (дирижёр 06.11: «ник мелким серым»): WSG_PNICK — под пиком ник серым, рядом золото; идущая карта — только ник
      const P = (X, cls) => X.P.map(x => window.WSG_PNICK ? `<span class="wpg wpg--nk">${himg(H, x, cls)}<span><small>${nkOf(x)}</small>${d.done ? `<b class="num${nwOf(x) === mx ? ' is-top' : ''}">${k1(nwOf(x))}</b>` : ''}</span></span>` : window.WSG_PGOLD && d.done ? `<span class="wpg">${himg(H, x, cls)}<b class="num${nwOf(x) === mx ? ' is-top' : ''}">${k1(nwOf(x))}</b></span>` : himg(H, x, cls)).join(''), Bn = (X, cls) => X.B.map(x => himg(H, x, cls)).join('');
      if (SV === 'lanes') { const lane = X => `<div class="wq-l${X.win ? ' is-win' : ''}"><img class="wr-lg" src="${esc(X.T.logo)}" alt=""><span class="wq-n">${esc(X.T.name)}</span><span class="wr-p">${P(X, 'wr-pk')}</span><span class="wr-b">${Bn(X, 'wr-bn')}</span><span class="wq-g">${d.done ? `<b class="num">${k1(X.now)}</b>${dvs(dv(X))}` : '<small>—</small>'}</span></div>`;
        return `<div class="wr-r wx--lanes${d.live ? ' is-live' : ''}">${mh}<div class="wr-d">${lane(d.A)}${lane(d.B)}${d.live ? '<small class="wq-wait">Золото — после карты</small>' : ''}</div></div>`; }
      if (SV === 'spark') { const adv = d.m.radiant_gold_adv || [], T = d.done ? adv : adv.slice(0, Math.floor(d.t / 60) + 1), mx = Math.max(1000, ...T.map(Math.abs)), w = 240, h = 56, x = j => (j / Math.max(1, T.length - 1) * w).toFixed(1), y = v => (h / 2 - v / mx * (h / 2 - 3)).toFixed(1);
          const path = T.map((v, j) => `${j ? 'L' : 'M'}${x(j)},${y(v)}`).join(''), last = T[T.length - 1] || 0, lead = last >= 0 ? d.A : d.B;
          const g = T.length > 1 ? `<div class="ws-sp"><div class="ws-sph"><span><img src="${esc(d.A.T.logo)}" alt="">Сверху</span><b class="num">${last >= 0 ? '+' : '−'}${k1(Math.abs(last))}</b><span>Снизу<img src="${esc(d.B.T.logo)}" alt=""></span></div>
            <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="0" x2="${w}" y1="${h / 2}" y2="${h / 2}"/><path d="${path}L${w},${h / 2}L0,${h / 2}Z" class="a"/><path d="${path}" class="l"/></svg><small>Разница в золоте по минутам${d.live ? ' · идёт' : ''} · впереди ${esc(lead.T.name)}</small></div>` : '<div class="wr-g wr-0">Нет данных</div>';
          const lane = X => `<div class="wr-l${X.win ? ' is-win' : ''}"><img class="wr-lg" src="${esc(X.T.logo)}" alt="" title="${esc(X.T.name)}"><span class="wr-p">${P(X, 'wr-pk')}</span><span class="wr-b">${Bn(X, 'wr-bn')}</span></div>`;
          return `<div class="wr-r wx--spark${d.live ? ' is-live' : ''}">${mh}<div class="wr-d">${lane(d.A)}${lane(d.B)}</div>${g}</div>`; }
      if (SV === 'big') { const lane = X => `<div class="wb-l${X.win ? ' is-win' : ''}"><span class="wb-pk">${P(X, 'wb-p')}</span><span class="wb-bn">${Bn(X, 'wr-bn')}</span></div>`;
        const gc = X => `<div class="wb-g${X.win ? ' is-win' : ''}"><img src="${esc(X.T.logo)}" alt=""><span><b class="num">${d.done ? k1(X.now) : '—'}</b>${d.done ? dvs(dv(X)) : ''}</span><small>${esc(X.T.name)}</small></div>`;
        return `<div class="wr-r wx--big${d.live ? ' is-live' : ''}">${mh}<div class="wb-d">${lane(d.A)}${lane(d.B)}</div><div class="wb-gc">${gc(d.A)}${gc(d.B)}${d.live ? '<small class="wq-wait">Золото — после карты</small>' : ''}</div></div>`; }
      const p = d.done ? pct(d.A, d.B) : 50;
      // v4–v6 w-lanemap (WSG_LM): карта линий — в строке пиков. mini — маленькая карта справа от строки · strip — под строкой три линии с героями и перевесом ·
      //   lane — пики сторон сгруппированы по линиям (Верх / Центр / Низ подписью над группой), по центру под золотом — перевес каждой линии
      const LMm = window.LMAP && WSG_LM, LT = d.done ? d.m.duration : d.t, LD = LMm ? LMAP.lanes(d.m, LT) : null;
      const byLane = X => { const O = new Map(d.pb.filter(x => x.is_pick).map(x => [x.hero_id, x])), side = X.rad ? 'r' : 'd', ks = X.rad ? ['top', 'mid', 'bot'] : ['top', 'mid', 'bot'];
        return ks.map(k => `<span class="wl2-g"><small>${LMAP.NAME[k]}</small><span>${LD.out[k][side].map(h => { const x = O.get(h.p.hero_id); return x ? himg(H, x, 'wr-pk') : ''; }).join('')}</span></span>`).join(''); };
      const picks = X => WSG_LM === 'lane' ? `<span class="wr-p wl2-p">${byLane(X)}</span>` : `<span class="wr-p">${P(X, 'wr-pk')}</span>`;
      const ladv = WSG_LM === 'lane' ? `<div class="wl2-adv">${['top', 'mid', 'bot'].map(k => { const v = LD.out[k].adv, r = v >= 0, eq = Math.abs(v) < 50; return `<span><b class="num ${eq ? '' : r ? 'is-r' : 'is-d'}">${eq ? '0' : (r ? '◂ +' : '+') + LMAP.k1(v) + (r ? '' : ' ▸')}</b><small>${LMAP.NAME[k]}</small></span>`; }).join('')}<i>Линии ${LT < 600 ? 'на ' + Math.floor(LT / 60) + '′' : 'к 10′'}</i></div>` : '';
      const row = `<div class="wm-row"><div class="wm-s${d.A.win ? ' is-win' : ''}"><img class="wr-lg" src="${esc(d.A.T.logo)}" alt="" title="${esc(d.A.T.name)}"><span class="wm-tn">${esc(d.A.T.name)}</span>${picks(d.A)}<span class="wm-b">${Bn(d.A, 'wr-bn')}</span></div>
        <div class="wm-mid">${d.done ? `<span class="wm-n"><b class="num${d.A.now > d.B.now ? ' on' : ''}">${GC}${k1(d.A.now)}</b><small>Золото</small><b class="num${d.B.now > d.A.now ? ' on' : ''}">${GC}${k1(d.B.now)}</b></span><div class="wr-tug"><i style="width:${p}%"></i><i></i></div>` : '<small class="wq-wait">Золото — после карты</small>'}${ladv}</div>
        <div class="wm-s is-r${d.B.win ? ' is-win' : ''}"><span class="wm-b">${Bn(d.B, 'wr-bn')}</span>${picks(d.B)}<img class="wr-lg" src="${esc(d.B.T.logo)}" alt="" title="${esc(d.B.T.name)}"><span class="wm-tn">${esc(d.B.T.name)}</span></div></div>`;
      // v7 full (дирижёр 05.11: «полноценную карту, может, связанную с золотом — показать, как персонажи расположены»): по центру строки — карта во всю колонку:
      //   герои на своих линиях, у каждого — его нетворс на конец карты (идущая — на сейчас), у линии — перевес к 10′; над картой — золото команд и полоса, как было
      // v8 split (дирижёр 05.11: «полностью перестроим: пики слева, карта справа, золото между ними — вертикальной полосой»):
      //   слева обе команды строками (лого, имя, 5 пиков, баны), по центру — вертикальная полоса золота (сверху число первой команды, снизу второй, черта середины), справа — карта линий с нетворсом героев
      // v10–v12 (дирижёр 05.11: «v9 интересная — ещё варианты, как расположить: встроить карту, перестроить пики и золото; без пустого места слева, чтобы не росло в высоту, всё видно и красиво»):
      //   top — шапка карты строкой сверху (Map · время · Win), ниже на всю ширину: две команды строками | вертикальная полоса золота | карта 200
      //   mid — карта посередине между командами: слева столбиком 5 пиков первой команды и её баны, справа — второй; шапка и золото — одной строкой над ними
      //   card — карточки по две в ряд: в карточке слева карта 180, справа две команды строками и между ними полоса золота
      const LTXT = `${LT < 600 ? 'на ' + Math.floor(LT / 60) + '′' : 'к 10′'}`, MAP = () => LMAP.map(d.m, LT, d.done ? d.m.duration : window.WSG_PGOLD === 2 ? null : d.t); // w-gold-pl v2: на идущей карте — только расстановка, золото после карты
      const hline = (gold) => `<div class="wz-h"><b>Map ${d.i + 1}</b><small>${mstate(d)}</small>${d.W ? `<span class="wr-w"><img src="${esc(d.W.T.logo)}" alt="">Win</span>` : ''}${gold || ''}</div>`;
      const tugH = d.done ? `<span class="wz-gold"><b class="num${d.A.now > d.B.now ? ' on' : ''}">${GC}${k1(d.A.now)}</b><span class="wr-tug"><i style="width:${p}%"></i><i></i></span><b class="num${d.B.now > d.A.now ? ' on' : ''}">${GC}${k1(d.B.now)}</b></span>` : '<span class="wz-gold is-wait">Золото — после карты</span>';
      const tugV = d.done ? `<div class="wsx-g"><b class="num${d.A.now > d.B.now ? ' on' : ''}">${GC}${k1(d.A.now)}</b><span class="wsx-bar"><i style="height:${p}%;--h:${p}%"></i></span><b class="num${d.B.now > d.A.now ? ' on' : ''}">${GC}${k1(d.B.now)}</b></div>` : '<div class="wsx-g is-wait"><span class="wsx-bar"></span><small>Золото — после карты</small></div>';
      const team = X => `<div class="wsx-s${X.win ? ' is-win' : ''}"><div class="wsx-th"><img src="${esc(X.T.logo)}" alt=""><b>${esc(X.T.name)}</b>${window.WSG_SIDE ? `<small class="wsx-sd is-${X.rad ? 'r' : 'd'}">${X.rad ? 'Radiant' : 'Dire'}</small>` : ''}</div><span class="wr-p">${P(X, 'wr-pk')}</span><span class="wsx-bn">${Bn(X, 'wr-bn')}</span></div>`;
      if (WSG_LM === 'top') return `<div class="wr-r wz wz--top${d.live ? ' is-live' : ''}">${hline()}<div class="wz-row"><div class="wsx-p">${team(d.A)}${team(d.B)}</div>${tugV}<div class="wz-map">${MAP()}</div></div></div>`;
      if (WSG_LM === 'mid') { const col = (X, r) => `<div class="wz-col${r ? ' is-r' : ''}${X.win ? ' is-win' : ''}"><div class="wsx-th"><img src="${esc(X.T.logo)}" alt=""><b>${esc(X.T.name)}</b></div><div class="wz-cp"><span class="wz-pk">${P(X, 'wr-pk')}</span><span class="wz-bn">${Bn(X, 'wr-bn')}</span></div></div>`;
        return `<div class="wr-r wz wz--mid${d.live ? ' is-live' : ''}">${hline(tugH)}<div class="wz-row">${col(d.A, false)}<div class="wz-map">${MAP()}</div>${col(d.B, true)}</div></div>`; }
      if (WSG_LM === 'card') return `<div class="wz-card${d.live ? ' is-live' : ''}">${hline()}<div class="wz-row"><div class="wz-map">${MAP()}</div><div class="wz-tm">${team(d.A)}${tugH}${team(d.B)}</div></div></div>`;
      if (WSG_LM === 'split') { const side = X => `<div class="wsx-s${X.win ? ' is-win' : ''}"><div class="wsx-th"><img src="${esc(X.T.logo)}" alt=""><b>${esc(X.T.name)}</b>${X.win ? '<em>Win</em>' : ''}</div><span class="wr-p">${P(X, 'wr-pk')}</span><span class="wsx-bn">${Bn(X, 'wr-bn')}</span></div>`;
        const gv = d.done ? `<div class="wsx-g"><b class="num${d.A.now > d.B.now ? ' on' : ''}">${GC}${k1(d.A.now)}</b><span class="wsx-bar"><i style="height:${p}%;--h:${p}%"></i></span><b class="num${d.B.now > d.A.now ? ' on' : ''}">${GC}${k1(d.B.now)}</b><small>Золото</small></div>` : '<div class="wsx-g is-wait"><span class="wsx-bar"></span><small>Золото — после карты</small></div>';
        return `<div class="wr-r wl2--split${d.live ? ' is-live' : ''}">${mh}<div class="wsx-row"><div class="wsx-p">${side(d.A)}${side(d.B)}</div>${gv}<div class="wl2-fm">${LMAP.map(d.m, LT, d.done ? d.m.duration : d.t)}<small>У героя — нетворс ${d.done ? 'на конец карты' : 'сейчас'} · у линии — перевес ${LT < 600 ? 'на ' + Math.floor(LT / 60) + '′' : 'к 10′'}</small></div></div></div>`; }
      if (WSG_LM === 'full') return `<div class="wr-r wx--mirror wl2--full${d.live ? ' is-live' : ''}">${mh}${row.replace('<div class="wm-mid">', `<div class="wm-mid">`).replace(/(<div class="wm-mid">[\s\S]*?)(<\/div>\s*<div class="wm-s is-r)/, (x, a, b) => `${a}<div class="wl2-fm">${LMAP.map(d.m, LT, d.done ? d.m.duration : d.t)}<small>Герои по линиям · у героя — нетворс ${d.done ? 'на конец карты' : 'сейчас'} · у линии — перевес ${LT < 600 ? 'на ' + Math.floor(LT / 60) + '′' : 'к 10′'}</small></div>${b}`)}</div>`;
      if (WSG_LM === 'mini') return `<div class="wr-r wx--mirror wl2--mini${d.live ? ' is-live' : ''}">${mh}${row}<div class="wl2-map">${LMAP.map(d.m, LT)}<small>Линии ${LT < 600 ? 'на ' + Math.floor(LT / 60) + '′' : 'к 10′'}</small></div></div>`;
      if (WSG_LM === 'strip') return `<div class="wr-r wx--mirror wl2--strip${d.live ? ' is-live' : ''}">${mh}<div class="wl2-col">${row}<div class="wl2-st"><span class="wl2-sh">Линии ${LT < 600 ? 'на ' + Math.floor(LT / 60) + '′' : 'к 10′'}</span>${LMAP.list(d.m, LT)}</div></div></div>`;
      return `<div class="wr-r wx--mirror${WSG_LM === 'lane' ? ' wl2--lane' : ''}${d.live ? ' is-live' : ''}">${mh}${row}</div>`; }).join('');
    else if (SV === 'vs') body = `<div class="wv-g">${L.map(d => { if (d.off) return `<div class="wv-c is-off"><b>Map ${d.i + 1}</b><span>Ещё не сыграна</span></div>`;
      const col = X => `<div class="wv-col${X.win ? ' is-win' : ''}">${X.P.map(x => himg(H, x, 'wv-pk')).join('')}</div>`;
      const mid = `<div class="wv-mid"><b>Map ${d.i + 1}</b><small>${mstate(d)}</small><span class="wv-tm"><img src="${esc(d.A.T.logo)}" alt=""><i>vs</i><img src="${esc(d.B.T.logo)}" alt=""></span>${d.done ? `<span class="wv-gold"><b class="num${d.A.now > d.B.now ? ' on' : ''}">${k1(d.A.now)}</b><small>Золото</small><b class="num${d.B.now > d.A.now ? ' on' : ''}">${k1(d.B.now)}</b></span><span class="wv-win">Win ${esc(d.W.T.name)}</span>` : '<span class="wv-wait">Идёт — золото после карты</span>'}</div>`;
      return `<div class="wv-c${d.live ? ' is-live' : ''}"><div class="wv-top">${col(d.A)}${mid}${col(d.B)}</div><div class="wv-bans"><span>${d.A.B.map(x => himg(H, x, 'wv-bn')).join('')}</span><small>Баны</small><span>${d.B.B.map(x => himg(H, x, 'wv-bn')).join('')}</span></div></div>`; }).join('')}</div>`;
    else if (SV === 'order') body = L.map(d => { if (d.off) return `<div class="wo-r is-off"><div class="wo-h"><b>Map ${d.i + 1}</b><small>Не начата</small></div></div>`;
      const step = x => { const h = H.get(x.hero_id) || {}; return `<span class="wo-s ${x.team ? 'b' : 'a'}${x.is_pick ? ' pk' : ' bn'}" title="${esc((x.is_pick ? 'пик · ' : 'бан · ') + (h.name || ''))}"><img src="${esc(h.img || '')}" alt=""><b class="num">${x.order + 1}</b></span>`; };
      const g = d.done ? `<span class="wo-g"><img src="${esc(d.A.T.logo)}" alt=""><b class="num${d.A.now > d.B.now ? ' on' : ''}">${k1(d.A.now)}</b>${dvs(dv(d.A))}<i>·</i><img src="${esc(d.B.T.logo)}" alt=""><b class="num${d.B.now > d.A.now ? ' on' : ''}">${k1(d.B.now)}</b>${dvs(dv(d.B))}</span>` : '<span class="wo-g wo-wait">Золото — после карты</span>';
      return `<div class="wo-r${d.live ? ' is-live' : ''}"><div class="wo-h"><b>Map ${d.i + 1}</b><small>${mstate(d)}${d.W ? ` · Win ${esc(d.W.T.name)}` : ''}</small>${g}</div>
        <div class="wo-tr"><span class="wo-side"><img src="${esc(d.A.T.logo)}" alt=""></span><div class="wo-line">${d.pb.map(x => x.team ? '<i class="wo-gap"></i>' : step(x)).join('')}</div><span class="wo-side"><img src="${esc(d.B.T.logo)}" alt=""></span><div class="wo-line">${d.pb.map(x => x.team ? step(x) : '<i class="wo-gap"></i>').join('')}</div></div></div>`; }).join('');
    else if (SV === 'poster') body = L.map(d => { if (d.off) return `<div class="wp-r is-off"><b>Map ${d.i + 1}</b><span>Ещё не сыграна</span></div>`;
      const side = X => `<div class="wp-s${X.win ? ' is-win' : d.done ? ' is-lose' : ''}"><div class="wp-th"><img src="${esc(X.T.logo)}" alt=""><b>${esc(X.T.name)}</b>${X.win ? '<em>Win</em>' : ''}${d.done ? `<span class="wp-gold"><b class="num">${k1(X.now)}</b>${dvs(dv(X))}</span>` : ''}</div>
        <div class="wp-pk">${X.P.map(x => himg(H, x, 'wp-p')).join('')}</div><div class="wp-bn">${X.B.map(x => { const h = H.get(x.hero_id) || {}; return `<img src="${esc(h.icon || '')}" alt="" title="бан · ${esc(h.name || '')}">`; }).join('')}</div></div>`;
      return `<div class="wp-r${d.live ? ' is-live' : ''}"><div class="wp-h"><b>Map ${d.i + 1}</b><small>${mstate(d)}${d.live ? ' · золото после карты' : ''}</small></div><div class="wp-sides">${side(d.A)}${side(d.B)}</div></div>`; }).join('');
    if (WSG_LM === 'card') body = `<div class="wz-cards">${body}</div>`;
    return `<section class="cd wsg wmp wmv wmv--${SV}">${head}${body}</section>`; };
  // w-stats-3 v1 (созвон 06.11 §3.1–3.3, дирижёр: «сделать как в задаче»): WSG_ST — вкладка по состоянию матча (состояние — data-st у секции матча, _gs.js):
  //   до матча (и анонс, лента, нет данных) — «Этой серии» нет, «До серии» без своего заголовка: «Шансы», «Составы», «На турнире»;
  //   начался (live, пауза) — только «Эта серия», «До серии» целиком нет (шансы — прогноз, нужен только до начала);
  //   v2 (WSG_ST = 2): начался — из «До серии» убираем только «Шансы», «Составы» и «На турнире» остаются;
  //   после — сверху «MVP серии» (по всем картам серии: (убийства + помощь) / смерти, из победившей команды), ниже «Эта серия»
  const ST = !!window.WSG_ST, ON = st => ['live', 'pause', 'post'].includes(st);
  const mvpS = S => { if (!S) return ''; const H = heroBy(), acc = new Map(), wins = {};
    S.maps.forEach(m => { const w = m.radiant_win ? m.radiant_team_id : m.dire_team_id; wins[w] = (wins[w] || 0) + 1;
      m.players.forEach(p => { const tm = p.isRadiant ? m.radiant_team_id : m.dire_team_id, a = acc.get(p.account_id) || { id: p.account_id, tm, k: 0, d: 0, a: 0, gpm: 0, dmg: 0, n: 0, heroes: [] };
        a.k += p.kills; a.d += p.deaths; a.a += p.assists; a.gpm += p.gold_per_min; a.dmg += p.hero_damage || 0; a.n++; a.heroes.push(p.hero_id); acc.set(p.account_id, a); }); });
    const W = +Object.entries(wins).sort((x, y) => y[1] - x[1])[0][0], L = [...acc.values()].filter(x => x.tm === W).sort((x, y) => (y.k + y.a) / Math.max(1, y.d) - (x.k + x.a) / Math.max(1, x.d));
    const x = L[0]; if (!x) return ''; const pl = window.DB && DB.player(x.id), T = teamOf(W), ph = pl && pl.photo && DB.url(pl.photo), kda = ((x.k + x.a) / Math.max(1, x.d)).toFixed(1).replace('.', ',');
    return `<section class="cd wsg-mvp"><div class="wmp-hd"><b>MVP серии</b><small>по всем ${S.maps.length} ${S.maps.length > 4 ? 'картам' : 'картам'} серии · (убийства + помощь) / смерти</small></div>
      <div class="wsm-r">${ph ? `<img class="wsm-ph" src="${esc(ph)}" alt="">` : '<span class="wsm-ph"></span>'}<div class="wsm-n"><b>${esc(pl ? pl.nick : x.id)}</b><span><img src="${esc(T.logo)}" alt="">${esc(T.name)}</span></div>
      <div class="wsm-s"><span><b class="num">${x.k}/${x.d}/${x.a}</b><small>У / С / П</small></span><span><b class="num">${kda}</b><small>KDA</small></span><span><b class="num">${Math.round(x.gpm / x.n)}</b><small>GPM</small></span><span><b class="num">${k1(x.dmg)}</b><small>Урон героям</small></span></div>
      <div class="wsm-h">${x.heroes.map((h, i) => { const hh = H.get(h) || {}; return `<span><img src="${esc(hh.img || hh.icon || '')}" alt="" title="${esc(hh.name || '')}"><small>Map ${i + 1}</small></span>`; }).join('')}</div></div></section>`; };
  const stPaint = lu => { if (!ST) return; const pg = lu.parentElement, sec = lu.closest('[data-st]'), st = sec ? sec.dataset.st : 'live', on = ON(st);
    pg.classList.toggle('wsg-st-pre', !on); pg.classList.toggle('wsg-st-on', on); pg.classList.toggle('wsg-st-on2', on && window.WSG_ST === 2);
    const mv = pg.querySelector(':scope > .wsg-mvp');
    if (st === 'post') { const h = mvpS(seriesOf()); if (!mv && h) pg.insertAdjacentHTML('afterbegin', h); else if (mv && h && mv._h !== h) mv.outerHTML = h; const m2 = pg.querySelector(':scope > .wsg-mvp'); if (m2) { m2._h = h; if (pg.firstElementChild !== m2) pg.prepend(m2); } }
    else if (mv) mv.remove(); };
  const COLS = window.WSG === 'cols';
  const PAST = window.WSG === 'past';
  const paint = (force) => { if (window.WSG === 'none') return; /* оригинал в лабе — только открыть вкладку */ const lu = document.querySelector('section.cd.ws24-cd'); if (!lu) return;
    const box = lu.parentElement.querySelector(':scope > section.wsg'); rename(); stPaint(lu); const h = COLS ? (SV ? variant() : cols3()) : PAST ? past() : build(); if (!h) { if (box) box.remove(); LAST = ''; return; }
    if (COLS) { const pg = lu.parentElement, top = pg.firstElementChild; if (!box) { LAST = h; const mv = pg.querySelector(':scope > .wsg-mvp'); mv ? mv.insertAdjacentHTML('afterend', h) : pg.insertAdjacentHTML('afterbegin', h); } else if (force || h !== LAST) { LAST = h; box.outerHTML = h; }
      const about = pg.querySelector(':scope > .wstA') || pg.querySelector(':scope > .wst-about'); if (about && !pg.querySelector(':scope > .wmp-past')) about.insertAdjacentHTML('beforebegin', `<section class="cd wmp-past"><div class="wmp-ph"><b>${HIER ? 'До серии' : 'Прошлые матчи'}</b><small>${HIER ? 'Команды на The International 2026 до этого матча' : 'до этой серии · The International 2026'}</small></div></section>`); return; }
    if (!box) { LAST = h; lu.insertAdjacentHTML(PAST ? 'beforebegin' : 'afterend', h); return; } if (force || h !== LAST) { LAST = h; box.outerHTML = h; } };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wsg]'); if (!b) return; e.preventDefault(); SEL = +b.dataset.wsg; paint(true); }, true);
  // в лабе (WSG_OPEN) — сразу вкладка «Статистика»
  let opened = !window.WSG_OPEN; const open = () => { if (opened) return; const t = [...document.querySelectorAll('.ws-tabs .h3-tab')].find(x => x.textContent.trim() === 'Статистика'); if (t) { opened = true; t.click(); } };
  new MutationObserver(() => { open(); paint(); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(paint, 2000); // идущая карта — минута двигается
})();
