// w-tabs6 — созвон 04.11, блок 6 «Новые вкладки» (дирижёр 04.11: «давай 6 задачу сделаем» — 6 · Новые вкладки).
// 6.1 «Золото» и 6.2 «Драфт» — не табами серии, а видами карты: переключатель «График · Золото · Драфт» в контролах графика, рядом с + / − (начальник 1·22:12: «пусть этот control будет в контролах на графике»).
// Золото (1·21:08–22:04): столбцы — позиция против позиции (5 зелёных Radiant, 5 красных Dire), круговая — доля золота сторон, донат — доля каждого из 10 игроков; «пока без людей, собрать картинку».
// Драфт (1·19:11): порядок пиков и банов на сыгранной карте — виджет w-draft в виде, выбранном 27.10 (как Cyberscore).
// Данные — нетворс по минутам (nw_t) на минуту, которая сейчас на графике; позиции, герои, команды — из нижней строки страницы (что видно — то и тут).
(() => {
  // дирижёр 04.11: «логотипы мигают» — каждые 2 с всё перерисовывалось заново, картинки перезагружались; теперь обновляем по узлам (как надписи у графика)
  const morph = (host, html) => { const t = document.createElement('template'); t.innerHTML = html; sync(host, t.content); };
  const sync = (a, b) => { const A = [...a.childNodes], B = [...b.childNodes];
    B.forEach((nb, i) => { const na = A[i]; if (!na) { a.appendChild(nb.cloneNode(true)); return; }
      if (na.nodeType !== nb.nodeType || na.nodeName !== nb.nodeName) { a.replaceChild(nb.cloneNode(true), na); return; }
      if (nb.nodeType === 3) { if (na.nodeValue !== nb.nodeValue) na.nodeValue = nb.nodeValue; return; } if (nb.nodeType !== 1) return;
      [...na.attributes].forEach(x => { if (!nb.hasAttribute(x.name)) na.removeAttribute(x.name); }); [...nb.attributes].forEach(x => { if (na.getAttribute(x.name) !== x.value) na.setAttribute(x.name, x.value); });
      sync(na, nb); });
    for (let i = A.length - 1; i >= B.length; i--) a.removeChild(A[i]); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const k = v => (v / 1000).toFixed(1) + 'k';
  const S = new WeakMap(); // [data-wd="gold"] → { v: 'g' | 'gold' | 'draft' }
  // WV_MODE (дирижёр 04.11: «одну версию — переключатель, одну — виджет, одну — как отдельный таб»): sw — на графике у + / − (v2–v3) · row — строкой табов над картой (v5) · widget — под окном матча отдельным виджетом «Золото · Драфт», график не трогаем (v4)
  // v10 (дирижёр 04.11: «это убери» — строку «График · Золото · Драфт» над картой): WV_MODE = 'none' — переключателя у карты нет, золото и драфт — только табами серии
  // WV_DIV (дирижёр 04.11: «дивайдеры между картами и другими вариантами»): тонкая черта в строке серии между «Драфтом» и Map 1
  const MODE = window.WV_MODE || 'sw', VIEWS = [['g', 'График'], ['gold', 'Золото'], ['draft', 'Драфт']];
  if (MODE !== 'sw') document.documentElement.classList.add('wv-' + MODE);
  // дирижёр 04.11 (скрин эфира: «этот виджет убери»; созвон 4.11): WV_NOTV — эфира (Twitch + сторис) в правой колонке нет
  if (window.WV_NOTV) document.documentElement.classList.add('wv-notv');
  // v11 (дирижёр 04.11: «убрать дивайдер у хедера»): WV_NOHB — у шапки сайта (GoatScout · Матчи …) нет черты снизу
  if (window.WV_NOHB) document.documentElement.classList.add('wv-nohb');

  // кто на какой позиции — как в нижней строке
  const lineup = (wd, m) => { const bw = wd.closest('.bw') || document, out = [];
    bw.querySelectorAll('.d3-five .d3-h[data-hc]').forEach(h => { const acc = +h.dataset.hc.split('|')[1], p = m.players.find(q => q.account_id === acc); if (!p) return;
      out.push({ p, rad: h.closest('.d3-five').classList.contains('a') ? p.isRadiant : p.isRadiant, pos: +(h.querySelector('.d3-i b') || {}).textContent, img: (h.querySelector('.d3-i img') || {}).src || '', name: (h.title || '').split(' · ')[0] }); });
    const tm = side => { const t = bw.querySelector(`.d3-five.${side} .d3-tm`); return { name: t ? t.title : '', logo: t && t.querySelector('img') ? t.querySelector('img').src : '' }; };
    return { ps: out, A: tm('a'), B: tm('b') }; };
  const nwAt = (p, t) => { const a = p.nw_t || []; if (!a.length) return p.net_worth || 0; return a[Math.max(0, Math.min(a.length - 1, Math.floor(t / 60)))] || 0; };

  const arc = (cx, cy, r, a0, a1, r0) => { const p = (a, rr) => [cx + rr * Math.sin(a), cy - rr * Math.cos(a)], big = a1 - a0 > Math.PI ? 1 : 0, [x0, y0] = p(a0, r), [x1, y1] = p(a1, r);
    if (!r0) return `M${cx},${cy}L${x0},${y0}A${r},${r} 0 ${big} 1 ${x1},${y1}Z`; const [x2, y2] = p(a1, r0), [x3, y3] = p(a0, r0); return `M${x0},${y0}A${r},${r} 0 ${big} 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 ${big} 0 ${x3},${y3}Z`; };

  function gold(wd) { const g = wd._g2; if (!g) return ''; const o = g.o, m = o.m, t = o.state === 'post' ? m.duration : Math.min(o.t, m.duration), L = lineup(wd, m);
    const radIsA = L.ps.length && L.ps[0].rad; // a — команда слева в нижней строке
    return goldHtml(m, t, o.n, L.ps, radIsA ? L.A : L.B, radIsA ? L.B : L.A); }
  function goldHtml(m, t, n0, ps, TR, TD, bare) { const L = { ps }, o = { n: n0 };
    const sideOf = rad => L.ps.filter(x => x.rad === rad), R = sideOf(true), D = sideOf(false), by = (arr, n) => arr.find(x => x.pos === n);
    const sumR = R.reduce((s, x) => s + nwAt(x.p, t), 0), sumD = D.reduce((s, x) => s + nwAt(x.p, t), 0), all = sumR + sumD || 1;
    // столбцы: 5 пар по позициям
    const mx = Math.max(1, ...L.ps.map(x => nwAt(x.p, t))), W = 520, H = 300, b0 = 250, bw = 30;
    const bars = [1, 2, 3, 4, 5].map((n, i) => { const r = by(R, n), d = by(D, n), cx = 52 + i * 100, hr = r ? nwAt(r.p, t) / mx * 210 : 0, hd = d ? nwAt(d.p, t) / mx * 210 : 0;
      return `<rect x="${cx - bw - 2}" y="${b0 - hr}" width="${bw}" height="${hr}" rx="4" fill="var(--up)"/><rect x="${cx + 2}" y="${b0 - hd}" width="${bw}" height="${hd}" rx="4" fill="var(--dn)"/>
        <text x="${cx - bw / 2 - 2}" y="${b0 - hr - 6}" class="wv-v">${r ? k(nwAt(r.p, t)) : ''}</text><text x="${cx + bw / 2 + 2}" y="${b0 - hd - 6}" class="wv-v">${d ? k(nwAt(d.p, t)) : ''}</text>
        ${r ? `<image href="${esc(r.img)}" x="${cx - bw - 2 + 3}" y="${b0 + 8}" width="24" height="24" clip-path="inset(0 round 5px)"/>` : ''}${d ? `<image href="${esc(d.img)}" x="${cx + 5}" y="${b0 + 8}" width="24" height="24" clip-path="inset(0 round 5px)"/>` : ''}
        <text x="${cx}" y="${b0 + 48}" class="wv-pos">поз. ${n}</text>`; }).join('');
    // круговая: стороны; донат: 10 игроков
    const aR = sumR / all * 2 * Math.PI, pie = `<path d="${arc(80, 80, 72, 0, aR)}" fill="var(--up)"/><path d="${arc(80, 80, 72, aR, 2 * Math.PI - 1e-6)}" fill="var(--dn)"/>`;
    let a = 0; const ring = [...R.sort((x, y) => x.pos - y.pos), ...D.sort((x, y) => x.pos - y.pos)].map(x => { const v = nwAt(x.p, t) / all * 2 * Math.PI, s = `<path d="${arc(80, 80, 72, a, a + v - .01, 46)}" fill="${x.rad ? 'var(--up)' : 'var(--dn)'}" fill-opacity="${1 - (x.pos - 1) * .15}"><title>${esc(x.name)} · поз. ${x.pos} · ${k(nwAt(x.p, t))}</title></path>`; a += v; return s; }).join('');
    const pc = v => Math.round(v / all * 100) + '%', mm = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    return `<div class="wv-gold">${bare ? '' : `<div class="wv-hd"><b>Золото · карта ${o.n} · ${mm}</b>`}${bare ? '' : `<span class="wv-lg"><i class="up"></i>${esc(TR.name)} · Radiant<i class="dn"></i>${esc(TD.name)} · Dire</span></div>`}
      <div class="wv-grid"><figure class="wv-c wv-bars"><figcaption>Позиция против позиции</figcaption><svg viewBox="0 0 ${W} ${H}">${bars}</svg></figure>
      <figure class="wv-c"><figcaption>Доля золота сторон</figcaption><svg viewBox="0 0 160 160">${pie}</svg><div class="wv-sum"><span class="up">${pc(sumR)} · ${k(sumR)}</span><span class="dn">${pc(sumD)} · ${k(sumD)}</span></div></figure>
      <figure class="wv-c"><figcaption>Доля каждого игрока</figcaption><svg viewBox="0 0 160 160">${ring}<text x="80" y="76" class="wv-ct">${k(all)}</text><text x="80" y="94" class="wv-cs">всего</text></svg><div class="wv-sum"><span>чем бледнее — тем дальше позиция (1 → 5)</span></div></figure></div></div>`; }

  function paint(wd) { if (MODE === 'none') return; if (MODE === 'widget' || MODE === 'side') return widget(wd); const st = S.get(wd) || { v: 'g' }; let sw = wd.querySelector(':scope > .wv-sw'), pn = wd.querySelector(':scope > .wv-pn');
    if (!sw) { sw = document.createElement('div'); sw.className = 'wv-sw'; MODE === 'row' ? wd.prepend(sw) : wd.append(sw); }
    const swH = VIEWS.map(([v, l]) => `<button data-wv="${v}" class="${st.v === v ? 'on' : ''}">${l}</button>`).join(''); if (sw._h !== swH) { sw.innerHTML = swH; sw._h = swH; }
    wd.classList.toggle('wv-alt', st.v !== 'g');
    if (st.v === 'g') { if (pn) pn.remove(); return; }
    if (!pn) { pn = document.createElement('div'); pn.className = 'wv-pn'; wd.append(pn); }
    if (st.v === 'gold') { const h = gold(wd); if (pn._h !== h) { pn._v === 'gold' ? morph(pn, h) : (pn.innerHTML = h); pn._h = h; } }
    if (st.v === 'draft' && pn._v !== 'draft' && window.WDRAFT && wd._g2) { pn.innerHTML = '<div class="wv-dr" data-wd="draft"></div>'; pn._h = ''; WDRAFT.render(pn.firstChild, { m: wd._g2.o.m, n: wd._g2.o.n, state: 'after', look: 'cs' }); }
    pn._v = st.v; }

  // v4 — виджет под окном матча: свои табы «Золото · Драфт», данные — карты, открытой сейчас в окне
  let WV = 'gold';
  // v6 (дирижёр 04.11: «в правую колонку сделай»): WV_MODE = 'side' — тот же виджет последним в правой колонке
  function widget(wd) { const bw = wd.closest('.bw'); if (!bw) return; let box;
    if (MODE === 'side') { const side = (wd.closest('.gm') || document).querySelector('aside.gm-side'); if (!side) return; box = side.querySelector(':scope > .wv-wd');
      if (!box) { box = document.createElement('section'); box.className = 'wv-wd wv-wd--side'; side.append(box); } box._wd = wd; }
    else { box = bw.nextElementSibling && bw.nextElementSibling.classList.contains('wv-wd') ? bw.nextElementSibling : null;
      if (!box) { box = document.createElement('section'); box.className = 'wv-wd'; bw.after(box); } }
    const tabs = `<div class="wv-wd-hd"><div class="wv-sw">${[['gold', 'Золото'], ['draft', 'Драфт']].map(([v, l]) => `<button data-wvw="${v}" class="${WV === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>`;
    if (WV === 'gold') { const h = tabs + `<div class="wv-pn">${gold(wd)}</div>`; if (box._h !== h) { box._v === 'gold' ? morph(box, h) : (box.innerHTML = h); box._h = h; } }
    else if (box._v !== 'draft' + wd._g2.o.n && window.WDRAFT) { box.innerHTML = tabs + '<div class="wv-pn"><div class="wv-dr" data-wd="draft"></div></div>'; box._h = ''; WDRAFT.render(box.querySelector('.wv-dr'), { m: wd._g2.o.m, n: wd._g2.o.n, state: 'after', look: 'cs' }); }
    box._v = WV === 'draft' ? 'draft' + wd._g2.o.n : 'gold'; }
  document.addEventListener('click', e => { const w = e.target.closest && e.target.closest('[data-wvw]'); if (w) { e.preventDefault(); WV = w.dataset.wvw; const bx = w.closest('.wv-wd'), bw = bx.previousElementSibling, wd = bx._wd || (bw && bw.querySelector('[data-wd="gold"]')); if (wd) widget(wd); return; }
    const b = e.target.closest && e.target.closest('[data-wv]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const wd = b.closest('[data-wd="gold"]'); S.set(wd, { v: b.dataset.wv }); paint(wd); }, true);
  const all = () => document.querySelectorAll('[data-wd="gold"]').forEach(wd => { if (wd._g2 && !wd.closest('.wl-pre')) paint(wd); });
  let q = 0; new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; all(); }); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(() => document.querySelectorAll(MODE === 'widget' || MODE === 'side' ? '[data-wd="gold"]' : '[data-wd="gold"].wv-alt').forEach(wd => { if (!wd.closest('.wl-pre')) paint(wd); }), 2000); // идёт карта — золото на текущую минуту

  // 6.3 «Новости» (начальник 2·02:51–03:07: «отдельно новости по этим командам… новости по турниру и новости по командам»): вместо заглушки в табе — лента из общей базы:
  // «Обе команды» (= счётчик на табе), по каждой команде, «Турнир»; новые сверху. Команды — как в нижней строке страницы (база имён)
  let NF = 'both';
  const when = t => { const d = new Date(t); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const news = ph => { const D = window.DB; if (!D || !D.news) return ''; const bw = ph.closest('.bw') || document;
    const tm = side => { const t = bw.querySelector(`.d3-five.${side} .d3-tm:not(.wl-tm)`) || bw.querySelector(`.d3-five.${side} .d3-tm`); return t ? { name: t.title, logo: t.querySelector('img') ? t.querySelector('img').src : '' } : null; };
    const A = tm('a'), B = tm('b'), tour = (window.GS_TOURNAMENT && GS_TOURNAMENT.league) || '';
    // команда в базе — по номеру из лого (img/teams/<id>.png): имя на странице из базы имён (TEAM VISION) может не совпадать с базой новостей (PARIVISION)
    const dbT = T => T && (D.team(+((T.logo.match(/teams\/(\d+)\./) || [])[1])) || D.team(T.name)), ofT = T => { const x = dbT(T); return x ? D.news({ team: x.id }) : []; };
    const nA = ofT(A), nB = ofT(B), both = [...new Map([...nA, ...nB].map(n => [n.id, n])).values()].sort((x, y) => (Date.parse(y.t) || 0) - (Date.parse(x.t) || 0)), nT = tour ? D.news({ tour }) : [];
    const F = [['both', 'Обе команды', both], ['a', A ? A.name : '', nA], ['b', B ? B.name : '', nB], ['tour', 'Турнир', nT]].filter(f => f[1]);
    const cur = F.find(f => f[0] === NF) || F[0], idA = dbT(A) && dbT(A).id, idB = dbT(B) && dbT(B).id;
    const lg = n => [[idA, A], [idB, B]].filter(([id]) => id && n.teams.includes(id)).map(([, T]) => T.logo ? `<img src="${esc(T.logo)}" alt="" title="${esc(T.name)}">` : '').join('');
    const rows = cur[2].slice(0, 40).map(n => `<a class="wn-r" href="${esc(n.url || '#')}" target="_blank" rel="noopener">${n.img ? `<img class="wn-im" src="../${esc(n.img)}" alt="" loading="lazy">` : ''}<span class="wn-b"><span class="wn-t">${esc(n.title)}</span>
      <span class="wn-m"><span class="wn-lg">${lg(n)}</span><span>${esc(n.src || '')}</span><time>${when(n.t)}</time>${n.views ? `<span>${n.views >= 1000 ? (n.views / 1000).toFixed(1).replace('.', ',') + 'k' : n.views} просмотров</span>` : ''}</span></span></a>`).join('');
    return `<div class="wn"><div class="wn-f">${F.map(f => `<button data-wn="${f[0]}" class="${f === cur ? 'on' : ''}">${esc(f[1])}<small>${f[2].length}</small></button>`).join('')}</div>
      <div class="wn-l">${rows || '<p class="wn-0">Новостей нет</p>'}</div>${cur[2].length > 40 ? `<p class="wn-0">Показаны 40 из ${cur[2].length}</p>` : ''}</div>`; };
  const nPaint = () => { if (!window.WV_NEWS) return; document.querySelectorAll('.ws-ph').forEach(ph => { const h = news(ph); if (h && ph._h !== h) { ph.innerHTML = h; ph._h = h; ph.classList.add('wn-on'); } }); };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wn]'); if (!b) return; e.preventDefault(); NF = b.dataset.wn; nPaint(); }, true);
  let q2 = 0; new MutationObserver(() => { if (!q2) q2 = requestAnimationFrame(() => { q2 = 0; nPaint(); }); }).observe(document.documentElement, { childList: true, subtree: true });

  // v7 (дирижёр 04.11: «новую штуку сразу по трём картам добавь сюда» — в строку табов серии): WV_SER — табы «Золото» и «Драфт» после «Статистики»;
  // в них — все карты серии подряд: сыгранные — на конец карты, идущая — на сейчас, не начатые — «ещё не сыграна». Позиции — как в нижней строке (по нетворсу и линии)
  const GD = window.GS_DATA, NMS = (window.GS_NAMES && GS_NAMES.NAME) || {};
  const posOf = ps => { const by = [...ps].sort((a, b) => b.net_worth - a.net_worth), out = new Map(), cores = by.slice(0, 3), sups = by.slice(3), free = [1, 2, 3];
    [2, 1, 3].forEach(r => { const c = cores.find(q => q.lane_role === r && !out.has(q)); if (c && free.includes(r)) { out.set(c, r); free.splice(free.indexOf(r), 1); } });
    cores.filter(q => !out.has(q)).forEach(q => out.set(q, free.shift())); sups.forEach((q, i) => out.set(q, 4 + i)); return out; };
  const teamOf = id => ({ name: (window.GS_TOURNAMENT && GS_TOURNAMENT.names && GS_TOURNAMENT.names[id] || '').trim() || NMS[id] || String(id), /* как на странице (TEAM VISION) */ logo: `img/teams/${id}.png` });
  const seriesOf = () => { const h = document.querySelector('.d3-h[data-hc]'); const mid = h ? +h.dataset.hc.split('|')[0] : 0; return GD && GD.series.find(x => x.maps.some(m => m.match_id === mid)); };
  const mapT = m => { const live = [...document.querySelectorAll('[data-wd="gold"]')].find(w => w._g2 && w._g2.o.m.match_id === m.match_id); if (live) { const o = live._g2.o; return o.state === 'post' ? m.duration : Math.min(o.t, m.duration); }
    const now = window.GS_NOW || 0; return now >= m.start_time + m.duration ? m.duration : now >= m.start_time ? now - m.start_time : -1; };
  const serHtml = kind => { const S = seriesOf(); if (!S) return ''; return `<div class="wv-ser">${S.maps.map((m, i) => { const t = mapT(m), A = teamOf(m.radiant_team_id), B = teamOf(m.dire_team_id);
      const st = t < 0 ? 'ещё не сыграна' : t >= m.duration ? `победа ${esc((m.radiant_win ? A : B).name)} · ${Math.floor(m.duration / 60)}:${String(m.duration % 60).padStart(2, '0')}` : `идёт · ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
      const hd = `<div class="wv-mh"><b>Карта ${i + 1}</b><span>${st}</span><span class="wv-lg"><i class="up"></i>${esc(A.name)} · Radiant<i class="dn"></i>${esc(B.name)} · Dire</span></div>`;
      if (t < 0) return `<section class="wv-map is-off">${hd}</section>`;
      if (kind === 'draft') return `<section class="wv-map">${hd}<div class="wv-dr" data-wd="draft" data-wvm="${m.match_id}"></div></section>`;
      const P = new Map([...posOf(m.players.filter(p => p.isRadiant)), ...posOf(m.players.filter(p => !p.isRadiant))]) /* позиции — внутри своей команды */, ps = m.players.map(p => { const h = GD.heroes[p.hero_id] || {}; return { p, rad: p.isRadiant, pos: P.get(p), img: h.icon || '', name: h.name || '' }; });
      return `<section class="wv-map">${hd}${goldHtml(m, t, i + 1, ps, A, B, true)}</section>`; }).join('')}</div>`; };
  let SER = null; // 'gold' | 'draft' | null
  const serThumb = (nav, tb) => { const th = nav.querySelector('.h3-thumb'); if (th && tb) { th.style.width = tb.offsetWidth + 'px'; th.style.transform = `translateX(${tb.offsetLeft}px)`; } };
  const serPaint = () => { if (!window.WV_SER) return; document.querySelectorAll('.ws-h .ws-tabs').forEach(nav => { const bw = nav.closest('.bw'), pg = bw && bw.querySelector('.bw-page'); if (!pg) return;
      if (!nav.querySelector('[data-wvt]')) { const st = nav.querySelector('.h3-tab[data-a="mseg"][data-v="0"]'); if (!st) return;
        st.insertAdjacentHTML('afterend', `<button class="h3-tab ws-t" data-wvt="gold"><span>Золото</span></button><button class="h3-tab ws-t${window.WV_DIV ? ' wv-dv' : ''}" data-wvt="draft"><span>Драфт</span></button>`); } // черта — псевдоэлементом у «Драфта»: строка табов — сетка, отдельный элемент занимал целую ячейку (дирижёр: «че за отступ»)
      let box = pg.querySelector(':scope > .wv-serbox');
      if (!SER) { if (box) box.remove(); pg.classList.remove('wv-hide'); nav.querySelectorAll('[data-wvt]').forEach(b => b.classList.remove('on')); return; }
      nav.querySelectorAll('.h3-tab').forEach(b => b.classList.toggle('on', b.dataset.wvt === SER)); serThumb(nav, nav.querySelector(`[data-wvt="${SER}"]`)); pg.classList.add('wv-hide');
      if (!box) { box = document.createElement('section'); box.className = 'cd wv-serbox'; pg.prepend(box); }
      const h = serHtml(SER); if (box._h !== h) { const same = box._k === SER; box._k = SER; if (same && SER === 'gold') { morph(box, h); box._h = h; return; } box.innerHTML = h; box._h = h; if (SER === 'draft' && window.WDRAFT) { const S = seriesOf(); box.querySelectorAll('[data-wvm]').forEach(el => { const i = S.maps.findIndex(m => m.match_id === +el.dataset.wvm); WDRAFT.render(el, { m: S.maps[i], n: i + 1, state: 'after', look: 'cs' }); }); } } }); };
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.ws-tabs .h3-tab'); if (!t || !window.WV_SER) return;
    if (t.dataset.wvt) { e.preventDefault(); e.stopPropagation(); SER = t.dataset.wvt; serPaint(); return; }
    if (SER) { SER = null; const nav = t.closest('.ws-tabs'); nav.querySelectorAll('.h3-tab').forEach(x => x.classList.toggle('on', x === t)); serPaint(); requestAnimationFrame(() => serThumb(nav, nav.querySelector('.h3-tab.on'))); } }, true);
  let q3 = 0; new MutationObserver(() => { if (!q3) q3 = requestAnimationFrame(() => { q3 = 0; serPaint(); }); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(() => { if (SER === 'gold') serPaint(); }, 2000);
})();

