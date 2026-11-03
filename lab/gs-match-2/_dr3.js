// Шаг 3 лабы gs-match-2: первый экран «график + пики» (созвон 28.10, созвон-2-матч.html §2.1–2.7).
// Хозяин — ../gs-match/_gs.js (withDraft): GS_DR3(x, s, g, desk) → HTML; x — карта, s — snap (убийства, золото, KDA на момент t), g — график (виджет w-gold).
// Пики без банов: мини-иконка героя, позиция 1–5 на ней, короткий ник, KDA; между пятёрками — счёт по убийствам и перевес по золоту.
// Варианты — window.DR3: below — пятёрки строкой под графиком · sides — колонками слева и справа от графика (на телефоне — как below) · top — мелко строкой над графиком.
// ‼️ Позиция — оценка: на команду три самых богатых — керри (линия 1), мид (2), хард (3), остальные — 4 и 5 по деньгам (в данных OpenDota позиций нет).
(() => {
  const D = window.GS_DATA;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const k = v => (v < 0 ? '−' : '+') + (Math.abs(v) / 1000).toFixed(1) + 'k';
  const nick = p => (D.players[p.account_id] && D.players[p.account_id].name) || D.heroes[p.hero_id].name;
  const team = id => D.teams[id] || { name: '—', tag: '—', logo: '' };
  const pos = ps => {
    const by = [...ps].sort((a, b) => b.p.net_worth - a.p.net_worth), out = new Map(), cores = by.slice(0, 3), sups = by.slice(3);
    const free = [1, 2, 3];
    [2, 1, 3].forEach(r => { const c = cores.find(q => q.p.lane_role === r && !out.has(q)); if (c && free.includes(r)) { out.set(c, r); free.splice(free.indexOf(r), 1); } });
    cores.filter(q => !out.has(q)).forEach(q => out.set(q, free.shift()));
    sups.forEach((q, i) => out.set(q, 4 + i));
    return [...out.entries()].sort((a, b) => a[1] - b[1]);
  };
  // DR3_KDA = 'color' (дирижёр 28.10: «зелёные, красные — три числа»): убийства зелёным, смерти красным, помощь серым
  const kda = q => window.DR3_KDA === 'color' ? `<i class="kk">${q.kills}</i><i class="kd">${q.deaths}</i><i class="ka">${q.assists == null ? '—' : q.assists}</i>` : `${q.kills}/${q.deaths}/${q.assists == null ? '—' : q.assists}`;
  // DR3_PL (созвон 28.10 §2.9: «клик по игроку → панель с подробностями»): герой — кнопка, открывает ту же панель игрока, что старый драфт (data-a="pl" в ../gs-match/_gs.js)
  // DR3_PL = 'hover' (дирижёр 29.10: «почему клик? при наведении должна быть панель»): на ПК панель — при наведении (карточка у героя), на телефоне (нет наведения) — по нажатию, как v31
  const HOV = () => window.DR3_PL === 'hover' && matchMedia('(hover: hover)').matches;
  const plA = (q, x) => !window.DR3_PL || !x ? '' : HOV() ? ` data-hc="${x.m.match_id}|${q.p.account_id}"` : ` data-a="pl" data-v="${x.m.match_id}|${q.p.account_id}" role="button" tabindex="0"`;
  const SN = new Map(); // match_id|account_id → { x, q } — для карточки при наведении
  const hero = ([q, n], cls = '', x) => (x && SN.set(`${x.m.match_id}|${q.p.account_id}`, { x, q }), '') + `<div class="d3-h ${cls}${plA(q, x) ? ' is-pl' : ''}"${plA(q, x)} title="${esc(D.heroes[q.p.hero_id].name)} · ${esc(nick(q.p))}"><span class="d3-i"><img src="${esc(D.heroes[q.p.hero_id].icon)}" alt="" /><b>${n}</b></span>
    <span class="d3-n">${esc(nick(q.p))}</span><span class="d3-k num">${kda(q)}</span></div>`;
  const five = (s, rad) => pos(s.players.filter(q => q.p.isRadiant === rad));
    // названия команд — на графике (созвон 28.10, 08:52: «дублируются»), у пятёрок — только лого, чтобы видно, где чья
  const tm = (id, rad) => { const t = team(id); return `<span class="d3-tm ${rad ? 'a' : 'b'}" title="${esc(t.name)}">${t.logo ? `<img src="${esc(t.logo)}" alt="" />` : esc(t.tag)}</span>`; };
  // перевес на секунду t — как на графике (w-gold): между минутными отметками по прямой, иначе цифра расходится с подписью на графике
  const at = (m, t) => { const a = m.radiant_gold_adv || [0], i = Math.min(Math.floor(t / 60), a.length - 1), f = t / 60 - i; return a[i] + ((a[i + 1] ?? a[i]) - a[i]) * Math.min(1, f); };
  const mid = (x, s) => { const gv = at(x.m, x.st === 'done' ? x.m.duration : x.t), lead = gv >= 0 ? x.m.radiant_team_id : x.m.dire_team_id, lt = team(lead);
    return `<div class="d3-mid"><div class="d3-sc num"><b>${s.kr}</b><i>:</i><b>${s.kd}</b></div><small>убийства</small>
      <div class="d3-gd num ${gv >= 0 ? 'a' : 'b'}">${lt.logo ? `<img src="${esc(lt.logo)}" alt="" />` : ''}${k(Math.abs(gv))}</div><small>золото</small></div>`; };

  // «Стакан» (дирижёр 28.10: «график золота не вверх-вниз, а как стакан — влево-вправо, тогда пики под ним понятно к какой команде»):
  // время идёт сверху вниз, перевес — влево (Radiant, левая пятёрка) или вправо (Dire, правая); внизу — сейчас, с цифрой
  const stakan = (x, s, desk) => {
    const m = x.m, now = x.st === 'done' ? m.duration : x.t, mins = Math.floor(now / 60), W = desk ? 640 : 340, rowH = desk ? 9 : 7, H = (mins + 1) * rowH + 8;
    const pts = []; for (let i = 0; i <= mins; i++) pts.push([i, at(m, Math.min(i * 60, now))]); pts.push([now / 60, at(m, now)]);
    const mx = Math.max(5000, ...pts.map(p => Math.abs(p[1]))) * 1.1, cx = W / 2, X = v => cx - (v / mx) * (W / 2 - 8), Y = t => 4 + t * rowH;
    const line = pts.map(([t, v]) => `${X(v).toFixed(1)},${Y(t).toFixed(1)}`).join(' ');
    const area = `${cx},${Y(0)} ${line} ${cx},${Y(now / 60)}`;
    const a = team(m.radiant_team_id), b = team(m.dire_team_id), v = at(m, now), end = pts[pts.length - 1];
    const grid = [-10000, -5000, 5000, 10000].filter(g => Math.abs(g) < mx).map(g => `<line x1="${X(g)}" y1="0" x2="${X(g)}" y2="${H}" class="sk-g"/><text x="${X(g)}" y="${H + 12}" class="sk-t">${Math.abs(g / 1000)}k</text>`).join('');
    const ticks = [10, 20, 30, 40].filter(t => t < now / 60).map(t => `<text x="4" y="${Y(t) + 3}" class="sk-t">${t}'</text>`).join('');
    return `<div class="sk"><div class="sk-hd"><span class="sk-tm a">${a.logo ? `<img src="${esc(a.logo)}" alt="" />` : ''}${esc(a.name)}</span><span class="sk-cap">Золото · карта ${x.i + 1}</span><span class="sk-tm b">${esc(b.name)}${b.logo ? `<img src="${esc(b.logo)}" alt="" />` : ''}</span></div>
      <svg viewBox="0 0 ${W} ${H + 16}" width="100%" preserveAspectRatio="none" class="sk-svg"><defs><clipPath id="skl${x.m.match_id}"><rect x="0" y="0" width="${cx}" height="${H}"/></clipPath><clipPath id="skr${x.m.match_id}"><rect x="${cx}" y="0" width="${cx}" height="${H}"/></clipPath></defs>
        ${grid}<line x1="${cx}" y1="0" x2="${cx}" y2="${H}" class="sk-0"/>${ticks}
        <polygon points="${area}" class="sk-a" clip-path="url(#skl${x.m.match_id})"/><polygon points="${area}" class="sk-b" clip-path="url(#skr${x.m.match_id})"/>
        <polyline points="${line}" class="sk-l"/><circle cx="${X(end[1])}" cy="${Y(end[0])}" r="4" class="sk-dot"/></svg>
      <div class="sk-now num"><span>${Math.floor(now / 60)}:${String(Math.floor(now % 60)).padStart(2, '0')}</span><b class="${v >= 0 ? 'a' : 'b'}">${v >= 0 ? '◀ ' : ''}${k(Math.abs(v)).slice(1)}${v < 0 ? ' ▶' : ''}</b></div></div>`;
  };

  // Карточка при наведении: то же, что в панели игрока (../gs-match/_gs.js openPlayer) — игрок, команда, герой, K / D / A / золото, предметы после карты
  const card = ({ x, q }) => { const p = q.p, h = D.heroes[p.hero_id], t = team(p.isRadiant ? x.m.radiant_team_id : x.m.dire_team_id), full = x.st === 'done', av = (D.players[p.account_id] || {}).avatar;
    const it = full ? [...(p.items || []), p.neutral].filter(Boolean).map(i => (D.items || {})[i]).filter(Boolean) : [];
    return `<div class="hc-hd">${av ? `<img class="hc-av" src="${esc(av)}" alt="" />` : ''}<div><b>${esc(nick(p))}</b><small>${t.logo ? `<img src="${esc(t.logo)}" alt="" />` : ''}${esc(t.name)}</small></div></div>
      <div class="hc-hero"><img src="${esc(h.img || h.icon)}" alt="" /><div><b>${esc(h.name)}</b><small>Карта ${x.i + 1} · ${full ? 'итог' : 'идёт'}</small></div></div>
      <div class="hc-st num"><div><b class="kk">${q.kills}</b><small>убийства</small></div><div><b class="kd">${q.deaths}</b><small>смерти</small></div><div><b>${q.assists ?? '—'}</b><small>ассисты</small></div><div><b>${k(q.nw).slice(1)}</b><small>золото</small></div></div>
      ${it.length ? `<div class="hc-it">${it.map(i => `<img src="${esc(i.img)}" alt="" title="${esc(i.name)}" />`).join('')}</div>` : ''}`; };
  let pop;
  document.addEventListener('mouseover', e => {
    const el = e.target.closest && e.target.closest('[data-hc]');
    if (!el) { pop && pop.classList.remove('on'); return; }
    const d = SN.get(el.dataset.hc); if (!d) return;
    pop = pop || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'd3-hc' }));
    pop.innerHTML = card(d); pop.classList.add('on');
    const r = el.getBoundingClientRect(), w = pop.offsetWidth, hgt = pop.offsetHeight;
    const left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)), top = r.top - hgt - 8 > 8 ? r.top - hgt - 8 : r.bottom + 8;
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  });
  addEventListener('scroll', () => pop && pop.classList.remove('on'), { passive: true });

  window.GS_DR3 = (x, s, g, desk) => {
    const v = window.DR3 || 'below', m = x.m;
    const A = five(s, true), B = five(s, false);
    // v24 (around): пятёрка Radiant — над графиком (там название её команды), Dire — под ним; счёт и золото — справа от пятёрок
    if (v === 'around') return `<div class="d3 d3--around"><div class="d3-row d3-row--top"><div class="d3-five a">${tm(m.radiant_team_id, true)}<div class="d3-hs">${A.map(h => hero(h)).join('')}</div></div>${mid(x, s)}</div>
      ${g}<div class="d3-row"><div class="d3-five a">${tm(m.dire_team_id, false)}<div class="d3-hs">${B.map(h => hero(h)).join('')}</div></div><div class="d3-mid d3-mid--ghost"></div></div></div>`;
    // v25 (stakan): график-стакан, под ним пятёрки — левая к левой стороне, правая к правой
    if (v === 'stakan') return `<div class="d3 d3--stakan">${stakan(x, s, desk)}<div class="d3-row"><div class="d3-five a">${tm(m.radiant_team_id, true)}<div class="d3-hs">${A.map(h => hero(h)).join('')}</div></div>${mid(x, s)}
      <div class="d3-five b"><div class="d3-hs">${B.map(h => hero(h)).join('')}</div>${tm(m.dire_team_id, false)}</div></div></div>`;
    if (v === 'sides' && desk) return `<div class="d3 d3--sides"><div class="d3-col a">${tm(m.radiant_team_id, true)}${A.map(h => hero(h)).join('')}</div>
      <div class="d3-g">${g}</div><div class="d3-col b">${tm(m.dire_team_id, false)}${B.map(h => hero(h, 'r')).join('')}</div></div><div class="d3-under">${mid(x, s)}</div>`;
    if (v === 'top') return `<div class="d3 d3--top"><div class="d3-row"><div class="d3-five a">${tm(m.radiant_team_id, true)}${A.map(h => hero(h, 'sm')).join('')}</div>${mid(x, s)}
      <div class="d3-five b">${B.map(h => hero(h, 'sm')).join('')}${tm(m.dire_team_id, false)}</div></div>${g}</div>`;
    return `<div class="d3 d3--below">${g}<div class="d3-row"><div class="d3-five a">${tm(m.radiant_team_id, true)}<div class="d3-hs">${A.map(h => hero(h, '', x)).join('')}</div></div>${mid(x, s)}
      <div class="d3-five b"><div class="d3-hs">${B.map(h => hero(h, '', x)).join('')}</div>${tm(m.dire_team_id, false)}</div></div></div>`;
  };
})();
