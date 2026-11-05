// Лаба w-preview-2 — «Превью» (созвон 02.11 §1.7, задача 1.7). Подменяет window.WSTAT.render (было — ../w-preview/_wstat.js) при window.WS2.
//  1.7.3 «имя команды один раз; слева одна команда, справа другая» — шапка с двумя лого один раз, ниже строки «левое — показатель — правое»;
//        лучшее значение — белым и с подложкой. Последние 5 серий — зеркально под строками. Инсайты ✓/✗ убраны — они повторяли цифры.
//  1.7.2 новости — не здесь: дирижёр 02.11 «новости тут не нужны, они будут в правой колонке».
// window.WS2: rows (v2) — только цифры · bars (v3) — у каждой строки полоса «кто впереди», как в спортивной статистике.
// Цифры — из GS_TOURNAMENT до этой серии (как раньше). ‼️ Новости — общие из ленты (как на странице турнира), не про этот матч.
(() => {
  const K = window.WS2; if (!K || !window.WSTAT) return;
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const day = s => new Date(s * 1000).toLocaleDateString('ru', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'short' }).replace('.', '');
  const has = (s, id) => s.a === id || s.b === id;
  function form(before, id) { // то же, что в _wstat.js
    const ss = before.filter(s => has(s, id)).sort((x, y) => x.start - y.start);
    const won = s => s.maps.filter(m => m.win === id).length > s.maps.length / 2;
    const maps = ss.flatMap(s => s.maps), mw = maps.filter(m => m.win === id), res = ss.map(s => (won(s) ? 'W' : 'L')).join('');
    return { sw: ss.filter(won).length, sl: ss.filter(s => !won(s)).length, pct: maps.length ? Math.round(mw.length / maps.length * 100) : 0,
      avgW: mw.length ? Math.round(mw.reduce((n, m) => n + m.dur, 0) / mw.length) : 0, streak: res.length - res.lastIndexOf('L') - 1,
      last5: ss.slice(-5).reverse().map(s => { const w = s.maps.filter(m => m.win === id).length; return { opp: s.a === id ? s.b : s.a, w, l: s.maps.length - w, win: won(s), start: s.start }; }) };
  }
  function render(el, o) {
    const D = window.GS_DATA, T = window.GS_TOURNAMENT, { A, B } = o, before = T.series.filter(s => s.start < o.start);
    const nm = id => o.names[id] || (T.names[id] || '—').trim();
    const opp = id => { const n = (T.names[id] || '—').trim().replace(/^Team /i, '').replace(/ Team$/i, ''); return o.names[id] || (n === n.toUpperCase() ? n.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()) : n); };
    const lg = id => (D.teams[id] ? `<img class="ws2-lg" src="${D.teams[id].logo}" alt="">` : '');
    const a = form(before, A), b = form(before, B), wr = f => (f.sw + f.sl ? f.sw / (f.sw + f.sl) : 0);
    // [показатель, левое, правое, число для сравнения слева, справа, меньше — лучше]
    const R = [['Серии', `${a.sw}–${a.sl}`, `${b.sw}–${b.sl}`, wr(a), wr(b)], ['Карты выиграно', a.pct + '%', b.pct + '%', a.pct, b.pct],
      ['Средняя победа', a.avgW ? mmss(a.avgW) : '—', b.avgW ? mmss(b.avgW) : '—', a.avgW || 1e9, b.avgW || 1e9, true], ['Побед подряд', a.streak, b.streak, a.streak, b.streak]];
    if (window.WS2_RANK) { // v22: «Побед подряд» → место на турнире до этой серии (по сериям, потом по картам); стрик и так видно в плитках
      const ids = Object.keys(T.names).map(Number), st = ids.map(id => ({ id, f: form(before, id) })).sort((x, y) => y.f.sw - x.f.sw || x.f.sl - y.f.sl || y.f.pct - x.f.pct);
      const pl = id => st.findIndex(q => q.id === id) + 1, pa = pl(A), pb = pl(B);
      R[3] = ['Место на турнире', `${pa}<small class="ws22-of"> из ${ids.length}</small>`, `${pb}<small class="ws22-of"> из ${ids.length}</small>`, pa, pb, true]; }
    const row = ([t, l, r, x, y, low]) => { const best = x === y ? '' : (low ? x < y : x > y) ? 'a' : 'b';
      const pa = low ? (x + y ? y / (x + y) : .5) : (x + y ? x / (x + y) : .5); // доля левой команды «в её пользу»
      return `<div class="ws2-r"><b class="ws2-v num${best === 'a' ? ' is-best' : ''}">${l}</b><span class="ws2-k">${t}</span><b class="ws2-v ws2-v--b num${best === 'b' ? ' is-best' : ''}">${r}</b>
        ${K === 'bars' ? `<div class="ws2-bar"><span class="a"><i class="${best === 'a' ? 'is-best' : ''}" style="width:${Math.round(pa * 100)}%"></i></span><span class="b"><i class="${best === 'b' ? 'is-best' : ''}" style="width:${Math.round((1 - pa) * 100)}%"></i></span></div>` : ''}</div>`; };
    const bd = r => `<i class="${r.win ? 'W' : 'L'}">${r.win ? 'В' : 'П'}</i>`;
    const f5 = (f, side) => f.last5.map(r => side === 'a'
      ? `<div class="ws2-f a">${bd(r)}<span>${opp(r.opp)}</span><b class="num">${r.w}:${r.l}</b><small>${day(r.start)}</small></div>`
      : `<div class="ws2-f b"><small>${day(r.start)}</small><b class="num">${r.w}:${r.l}</b><span>${opp(r.opp)}</span>${bd(r)}</div>`).join('') || '<div class="ws2-f"><small>на турнире ещё не играли</small></div>';
    const LG = (id, c = '') => { const t = D.teams[id]; return t && t.logo ? `<img class="${c}" src="${t.logo}" alt="">` : `<span class="${c} ws2-ini">${opp(id).slice(0, 2)}</span>`; };
    const best = ([, , , x, y, low]) => x === y ? '' : (low ? x < y : x > y) ? 'a' : 'b';
    const share = ([, , , x, y, low]) => low ? (x + y ? y / (x + y) : .5) : (x + y ? x / (x + y) : .5);
    const dots = f => `<span class="ws2-dots">${[...f.last5].reverse().map(r => `<i class="${r.win ? 'W' : 'L'}" title="${opp(r.opp)} ${r.w}:${r.l}"></i>`).join('')}</span>`;
    // v4–v6 (дирижёр 02.11: «в две колонки — очень слабо, не наш уровень; больше разных вариантов»)
    // v7–v9 (дирижёр 03.11: «серьёзно выделить в разные колонки — полноценные разные колонки»): каждая команда — своя карточка, рядом, не зеркально
    if (K === 'cols' || K === 'cols-big' || K === 'cols-bar') {
      const me = (r, side) => ({ v: side === 'a' ? r[1] : r[2], best: best(r) === side, sh: side === 'a' ? share(r) : 1 - share(r) });
      const l5 = f => f.last5.map(r => `<div class="ws7-f">${LG(r.opp, 'ws7-fl')}<span>${opp(r.opp)}</span><small>${day(r.start)}</small><b class="num ${r.win ? 'W' : 'L'}">${r.w}:${r.l}</b></div>`).join('') || '<div class="ws7-f"><small>на турнире ещё не играли</small></div>';
      const chips = f => `<div class="ws8-cs">${[...f.last5].reverse().map(r => `<span class="ws8-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}">${LG(r.opp, 'ws8-cl')}<b class="num">${r.w}:${r.l}</b></span>`).join('') || '<small>ещё не играли</small>'}</div>`;
      // v10–v13 · последние 5 серий в v8 по-другому (дирижёр 03.11: «серию надо как-то по-другому»), window.WS2_L5; слева старые → справа свежие
      const old5 = f => [...f.last5].reverse(), none = '<div class="ws10-no">на турнире ещё не играли</div>';
      const L5 = {
        list: f => f.last5.length ? `<div class="ws10">${f.last5.map(r => `<div class="ws10-r"><small>${day(r.start)}</small>${LG(r.opp, 'ws10-lg')}<span>${opp(r.opp)}</span><b class="num">${r.w}:${r.l}</b><i class="${r.win ? 'W' : 'L'}">${r.win ? 'В' : 'П'}</i></div>`).join('')}</div>` : none,
        strip: f => f.last5.length ? `<div class="ws11">${old5(f).map(r => `<div class="ws11-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}">${LG(r.opp, 'ws11-lg')}<b class="num">${r.w}:${r.l}</b><small>${day(r.start)}</small></div>`).join('')}</div>` : none,
        line: f => f.last5.length ? `<div class="ws12">${old5(f).map(r => `<div class="ws12-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}">${LG(r.opp, 'ws12-lg')}<i></i><b class="num">${r.w}:${r.l}</b></div>`).join('')}</div>` : none,
        res: f => f.last5.length ? `<div class="ws13">${old5(f).map(r => `<div class="ws13-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}"><b>${r.win ? 'В' : 'П'}</b><small class="num">${r.w}:${r.l}</small><span>${opp(r.opp)}</span></div>`).join('')}</div>` : none,
        // v14–v16 — от v13 (дирижёр 03.11: «v13 лучше всех, но надо ещё подумать»)
        resLogo: f => f.last5.length ? `<div class="ws13 ws14">${old5(f).map(r => `<div class="ws13-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}">${LG(r.opp, 'ws14-lg')}<b>${r.win ? 'В' : 'П'}</b><small class="num">${r.w}:${r.l}</small></div>`).join('')}</div>` : none,
        resCalm: f => f.last5.length ? `<div class="ws13 ws15">${old5(f).map(r => `<div class="ws13-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}"><b>${r.win ? 'В' : 'П'}</b><small class="num">${r.w}:${r.l}</small><span>${opp(r.opp)}</span></div>`).join('')}</div>` : none,
        resSum: f => f.last5.length ? `<div class="ws16"><div class="ws16-s"><b class="num">${f.last5.filter(r => r.win).length}–${f.last5.filter(r => !r.win).length}</b><small>за ${f.last5.length}</small></div><div class="ws13 ws16-g">${old5(f).map(r => `<div class="ws13-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}"><b>${r.win ? 'В' : 'П'}</b><small class="num">${r.w}:${r.l}</small></div>`).join('')}</div></div>` : none,
        // v17–v18 — от v16 (дирижёр 03.11: «Win / Loss полностью по-английски; общий итог — самое важное»)
        resEn: f => f.last5.length ? `<div class="ws16"><div class="ws16-s"><b class="num">${f.last5.filter(r => r.win).length}–${f.last5.filter(r => !r.win).length}</b><small>за ${f.last5.length}</small></div><div class="ws13 ws16-g ws17">${old5(f).map(r => `<div class="ws13-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}"><b>${r.win ? 'Win' : 'Loss'}</b><small class="num">${r.w}:${r.l}</small></div>`).join('')}</div></div>` : none,
        resEnStreak: f => { if (!f.last5.length) return none; const o = old5(f), lw = o[o.length - 1].win; let n = 0; for (let i = o.length - 1; i >= 0 && o[i].win === lw; i--) n++;
          return `<div class="ws16"><div class="ws16-s"><b class="num">${f.last5.filter(r => r.win).length}–${f.last5.filter(r => !r.win).length}</b>${window.WS2_RANK ? '' : `<small class="${lw ? 'W' : 'L'}">${window.WS2_STK === 'streak' ? `${n} ${lw ? 'win' : 'loss'} streak` : window.WS2_STK === 'wl' ? `${lw ? 'W' : 'L'}${n}` : `${n} ${lw ? 'Win' : 'Loss'}${window.WS2_SHORT ? '' : ' подряд'}`}</small>`}</div><div class="ws13 ws16-g ws17">${o.map(r => `<div class="ws13-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}"><b>${r.win ? 'Win' : 'Loss'}</b><small class="num">${r.w}:${r.l}</small></div>`).join('')}</div></div>`; },
      };
      const body = side => K === 'cols-big'
        ? `<div class="ws8-g">${R.map(r => { const m = me(r, side); return `<div class="ws8-t${m.best ? ' is-best' : ''}"><b class="num">${m.v}</b><small>${r[0]}</small></div>`; }).join('')}</div>`
        : `<div class="ws7-rs">${R.map(r => { const m = me(r, side); return `<div class="ws7-r${m.best ? ' is-best' : ''}"><span>${r[0]}</span><b class="num">${m.v}</b>${K === 'cols-bar' ? `<i class="ws9-bar"><i style="width:${Math.round(m.sh * 100)}%"></i></i>` : ''}</div>`; }).join('')}</div>`;
      const col = (id, f, side) => `<section class="ws7-col">
          <div class="ws7-hd">${LG(id, 'ws7-lg')}<div class="ws7-nm"><b>${nm(id)}</b><small>${f.sw}–${f.sl} по сериям · ${T.league}</small></div>${K === 'cols-big' ? '' : dots(f)}</div>
          ${body(side)}
          ${window.WS2_SHORT ? '' : '<div class="ws7-l5h">Последние 5 серий</div>'}${K === 'cols-big' ? (L5[window.WS2_L5] || chips)(f) : `<div class="ws7-l5">${l5(f)}</div>`}
        </section>`;
      // v23+: очные — одной строкой над колонками; v24+: составы дуэлями по позициям; v25: в колонке — основные герои команды
      const X = window.WS2_X || '', h2h = before.filter(q => has(q, A) && has(q, B)).sort((x, y) => x.start - y.start);
      const h2hRow = !X ? '' : `<div class="ws23">${h2h.length ? `Очные на турнире: ${h2h.map(q => { const w = q.maps.filter(m => m.win === A).length; return `<b class="num">${w}:${q.maps.length - w}</b>`; }).join(' ')}` : 'На турнире ещё не встречались'}</div>`;
      const S = (D.series || []).find(q => { const m = q.maps[0]; return [m.radiant_team_id, m.dire_team_id].includes(A) && [m.radiant_team_id, m.dire_team_id].includes(B); });
      const hero = id => D.heroes[id] || (window.WS2_PRE && window.WS2_PRE.heroes[id] ? { name: window.WS2_PRE.heroes[id][1], img: `img/heroes/${window.WS2_PRE.heroes[id][0]}.png` } : { name: '', img: '' }), pnm = p => (D.players[p.account_id] || {}).name || (PR && PR.names[p.account_id]) || '—', pav = p => (D.players[p.account_id] || {}).avatar || '';
      // ‼️ пример: герои игрока ДО матча — придуманы стабильно от account_id (как в 2.4), а не из этой серии — [hero, карт, побед]
      const HH = Object.keys(D.heroes).map(Number), hh = x => { let v = 7; for (const ch of String(x)) v = (v * 31 + ch.charCodeAt(0)) >>> 0; return v; };
      const past = acc => { const used = new Set(); return [0, 1, 2].map(i => { let k = hh(acc + 'h' + i) % HH.length; while (used.has(k)) k = (k + 1) % HH.length; used.add(k); const n = 9 - i * 2 - hh(acc + 'n' + i) % 3; return [HH[k], n, Math.round(n * (35 + hh(acc + 'w' + i) % 50) / 100)]; }); };
      // v72 (дирижёр 03.11: «бери реальные данные»): WS2_REAL + ./_pre.js (OpenDota, все карты турнира) — состав и герои игроков ДО матча — настоящие
      const AV = p => pav(p) ? `<img class="ws27-av" src="${pav(p)}" alt="">` : `<span class="ws27-av ws72-av">${pnm(p).slice(0, 2)}</span>`;
      const PR = window.WS2_REAL && window.WS2_PRE, PRM = PR ? PR.maps.filter(m => m[1] < o.start) : [];
      const posOf = ps => { const by = [...ps].sort((x, y) => y.nw - x.nw), out = new Map(), cores = by.slice(0, 3), free = [1, 2, 3];
        [2, 1, 3].forEach(r => { const c = cores.find(q => q.lane === r && !out.has(q)); if (c && free.includes(r)) { out.set(c, r); free.splice(free.indexOf(r), 1); } });
        cores.filter(q => !out.has(q)).forEach(q => out.set(q, free.shift())); by.slice(3).forEach((q, i) => out.set(q, 4 + i)); return out; };
      const realPast = acc => { const c = {}; PRM.forEach(m => { const p = m[5].find(x => x[0] === acc); if (!p) return; const win = p[2] === m[4], e = c[p[1]] || (c[p[1]] = [p[1], 0, 0]); e[1]++; if (win) e[2]++; });
        return Object.values(c).sort((x, y) => y[1] - x[1] || y[2] - x[2]).slice(0, 3); };
      const realFive = id => { const last = [...PRM].reverse().find(m => m[2] === id || m[3] === id); if (!last) return [];
        const rad = last[2] === id ? 1 : 0, ps = last[5].filter(x => x[2] === rad).map(x => ({ acc: x[0], lane: x[3], nw: x[4] })), pm = posOf(ps);
        return [...pm.entries()].sort((x, y) => x[1] - y[1]).map(([q, n]) => ({ p: { account_id: q.acc, real: true }, n, hs: realPast(q.acc).map(x => x[0]) })); };
      const five0 = id => { if (!S) return []; const m = S.maps[0], rad = m.radiant_team_id === id, ps = m.players.filter(p => p.isRadiant === rad);
        const by = [...ps].sort((x, y) => y.net_worth - x.net_worth), out = new Map(), cores = by.slice(0, 3), free = [1, 2, 3];
        [2, 1, 3].forEach(r => { const c = cores.find(q => q.lane_role === r && !out.has(q)); if (c && free.includes(r)) { out.set(c, r); free.splice(free.indexOf(r), 1); } });
        cores.filter(q => !out.has(q)).forEach(q => out.set(q, free.shift())); by.slice(3).forEach((q, i) => out.set(q, 4 + i));
        return [...out.entries()].sort((x, y) => x[1] - y[1]).map(([p, n]) => ({ p, n, hs: past(p.account_id).map(x => x[0]) })); };
      const five = id => PR ? realFive(id) : five0(id);
      // w-stats v1 (созвон 04.11 §5.2–5.4; Claude-B): WS2_ST — герои иконками с мини-карты (gs-match/img/heroes/icon, нет иконки — портрет), игроки — фото из общей базы (нет фото — шаблон-силуэт), номер позиции — на фото
      const ST = !!window.WS2_ST, icn = id => hero(id).img.replace(/\/heroes\/([\w]+\.png)$/, '/heroes/icon/$1');
      const hic = id => ST ? `<img class="ws24-h wst-h" src="${icn(id)}" onerror="this.onerror=null;this.src='${hero(id).img}';this.classList.add('is-pt')" alt="" title="${hero(id).name}">` : `<img class="ws24-h" src="${hero(id).img}" alt="" title="${hero(id).name}">`;
      const photo = p => { const d = window.DB && DB.players && DB.players().find(x => x.steam === p.account_id); return d && d.photo ? DB.url(d.photo) : ''; };
      const SIL = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="12" r="6" fill="currentColor"/><path d="M4 31c1.5-7 6.3-10 12-10s10.5 3 12 10z" fill="currentColor"/></svg>';
      const PAV = (p, n) => `<span class="wst-pa">${photo(p) ? `<img src="${photo(p)}" alt="">` : `<span class="wst-sil">${SIL}</span>`}<i>${n}</i></span>`;
      const duel = () => { const fa = five(A), fb = five(B); if (!fa.length) return '';
        const pl = (q, side) => `<div class="ws24-p ${side}"><img class="ws24-av" src="${pav(q.p)}" alt=""><span class="ws24-nm"><b>${pnm(q.p)}</b><span class="ws24-hs">${q.hs.map(hic).join('')}</span></span></div>`;
        return `<div class="ws24"><div class="ws24-hd"><b>Составы</b><small>по позициям · герои — чаще всего на турнире</small></div>
          ${[1, 2, 3, 4, 5].map(n => { const x = fa.find(q => q.n === n), y = fb.find(q => q.n === n); return `<div class="ws24-r">${x ? pl(x, 'a') : '<div></div>'}<i class="ws24-n">${n}</i>${y ? pl(y, 'b') : '<div></div>'}</div>`; }).join('')}</div>`; };
      const topH = id => { if (!S) return ''; const m0 = S.maps[0], side = m0.radiant_team_id === id ? 0 : 1, cnt = {};
        S.maps.forEach(mm => { const sd = mm.radiant_team_id === id ? 0 : 1; mm.picks_bans.filter(b => b.is_pick && b.team === sd).forEach(b => { cnt[b.hero_id] = (cnt[b.hero_id] || 0) + 1; }); });
        return `<div class="ws25"><small>Основные герои</small><span>${Object.entries(cnt).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([h]) => hic(+h)).join('')}</span></div>`; };
      const col2 = (id, f, side) => X === 'heroes' ? col(id, f, side).replace('</section>', `${topH(id)}</section>`) : col(id, f, side);
      // v28–v30 (дирижёр 03.11: «составы — отдельный блок, разные его версии»): блок «Составы» на прежнем месте страницы, внутри — новый вид
      const POS = ['', 'Керри', 'Мид', 'Хард', 'Роумер', 'Саппорт'], tname = id => `${LG(id, 'ws28-lg')}<b>${nm(id)}</b>`;
      const lineup = () => { const fa = five(A), fb = five(B); if (!fa.length) return '';
        const hd = '<div class="ws24-hd"><b>Составы</b><small>ожидаемые · герои — чаще всего на турнире</small></div>';
        if (X === 'luCols') return `<div class="ws24">${hd}<div class="ws28">${[[A, fa], [B, fb]].map(([id, f5]) => `<div><div class="ws28-t">${tname(id)}</div>${f5.map(q => `<div class="ws27-r"><i class="ws24-n">${q.n}</i>${AV(q.p)}<b>${pnm(q.p)}</b><span class="ws24-hs">${q.hs.map(hic).join('')}</span></div>`).join('')}</div>`).join('')}</div></div>`;
        if (X === 'luStat') { // v31: v28 + статистика игрока за турнир (демо: карты из базы); лучшее в паре «та же позиция у соперника» — белым, как в статистике выше
          const ps = q => { const ms = (D.series || []).flatMap(z => z.maps).map(mm => mm.players.find(x => x.account_id === q.p.account_id)).filter(Boolean), n = ms.length || 1, av = f => ms.reduce((t, x) => t + (x[f] || 0), 0) / n;
            return { k: av('kills'), d: av('deaths'), a: av('assists'), gpm: Math.round(av('gold_per_min')), kda: (av('kills') + av('assists')) / Math.max(1, av('deaths')), n: ms.length }; };
          const row = (q, o) => { const x = ps(q), y = o ? ps(o) : null, bk = y && x.kda > y.kda, bg = y && x.gpm > y.gpm;
            if (window.WS2_V32) { // v32: как в сделанных виджетах — строка-кнопка (подсветка, стрелка .w-chev → страница игрока), позиция чёрным квадратиком на аватаре (как в пиках), У/С/П цветом (как в пиках), замена — как в виджете замен
              const sub = window.WS2_SUB && q.n === 4 && q.p.isRadiant === S.maps[0].players[0].isRadiant ? 'вместо Ghost · на этот матч' : '';
              return `<button class="ws32-r${sub ? ' is-sub' : ''}" data-a="toast" data-v="Страница игрока ${pnm(q.p)} (демо)"><span class="ws26-av ws32-av"><img src="${pav(q.p)}" alt=""><i>${q.n}</i></span><span class="ws31-nm"><b>${pnm(q.p)}</b>${sub ? `<small>${sub}</small>` : `<span class="ws24-hs">${q.hs.map(hic).join('')}</span>`}</span>
                <span class="ws31-v num${bk ? ' is-best' : ''}"><i class="k">${x.k.toFixed(1)}</i> <i class="d">${x.d.toFixed(1)}</i> <i class="a">${x.a.toFixed(1)}</i></span><span class="ws31-v num${bg ? ' is-best' : ''}">${x.gpm}</span>
                <svg class="w-chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`; }
            return `<div class="ws31-r"><i class="ws24-n">${q.n}</i>${AV(q.p)}<span class="ws31-nm"><b>${pnm(q.p)}</b><span class="ws24-hs">${q.hs.map(hic).join('')}</span></span>
              <span class="ws31-v num${bk ? ' is-best' : ''}"><i class="k">${x.k.toFixed(1)}</i>/<i class="d">${x.d.toFixed(1)}</i>/<i class="a">${x.a.toFixed(1)}</i></span><span class="ws31-v num${bg ? ' is-best' : ''}">${x.gpm}</span><span class="ws31-v ws31-m num">${x.n}</span></div>`; };
          return `<div class="ws24">${hd.replace('ожидаемые · герои — чаще всего на турнире', 'ожидаемые · за турнир, в среднем за карту')}<div class="ws28">${[[A, fa, fb], [B, fb, fa]].map(([id, f5, o5]) => `<div><div class="ws28-t ${window.WS2_V32 ? 'ws32-t' : 'ws31-t'}">${tname(id)}<small>У / С / П</small><small>ГПМ</small>${window.WS2_V32 ? '<span></span>' : '<small>Карт</small>'}</div>${f5.map(q => row(q, o5.find(z => z.n === q.n))).join('')}</div>`).join('')}</div></div>`; }
        // v33–v35 (дирижёр 03.11: «интереснее, чем статистика — про героев»): герои игрока по базе — [hero, карт, побед]; ‼️ демо — в базе только эта серия
        const hst = q => PR ? realPast(q.p.account_id) : past(q.p.account_id);
        const pl = (n, a, b, c) => n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c;
        if (X === 'luFact') { // v33: v28, но вместо иконок героев — один факт: главный герой и как на нём сыграл
          const fact = q => { const [h, n, w] = hst(q)[0] || []; return h ? `<span class="ws33-f">${hic(h)}<span>${hero(h).name} — ${n} ${pl(n, 'карта', 'карты', 'карт')}, ${w ? `${w} ${pl(w, 'победа', 'победы', 'побед')}` : 'без побед'}</span></span>` : '<span class="ws33-f"><span>на турнире ещё не играл</span></span>'; };
          return `<div class="ws24">${hd.replace(' · герои — чаще всего на турнире', '')}<div class="ws28">${[[A, fa], [B, fb]].map(([id, f5]) => `<div><div class="ws28-t">${tname(id)}</div>${f5.map(q => `<div class="ws27-r ws33-r"><i class="ws24-n">${q.n}</i>${AV(q.p)}<span class="ws31-nm"><b>${pnm(q.p)}</b>${fact(q)}</span></div>`).join('')}</div>`).join('')}</div></div>`; }
        if (X === 'luChip') { // v37: факт-плашка — главный герой и счёт на нём до матча
          const best = f5 => Math.max(...f5.map(q => { const [, n, w] = hst(q)[0]; return w / n; }));
          return `<div class="ws24">${hd.replace(' · герои — чаще всего на турнире', ST ? ' · главный герой до матча: побед из карт на нём' : ' · главный герой и счёт на нём до матча')}<div class="ws28">${[[A, fa], [B, fb]].map(([id, f5]) => { const bw = best(f5); return `<div><div class="ws28-t">${tname(id)}</div>${f5.map(q => { const [h, n, w] = hst(q)[0], top = w / n === bw;
            if (ST) return `<div class="ws27-r ws37-r wst-r" data-sbp="${q.p.account_id}">${PAV(q.p, q.n)}<b>${pnm(q.p)}</b><span class="ws37-c wst-c${top ? ' is-top' : ''}" title="${hero(h).name}: ${w} ${pl(w, 'победа', 'победы', 'побед')} из ${n} ${pl(n, 'карты', 'карт', 'карт')} до этого матча">${hic(h)}<span>${hero(h).name}</span><b class="num">${w} из ${n}</b></span></div>`; /* 5.5: «2–2» никто не понимает — «побед из карт» */
            return `<div class="ws27-r ws37-r" data-sbp="${q.p.account_id}"><i class="ws24-n">${q.n}</i>${AV(q.p)}<b>${pnm(q.p)}</b><span class="ws37-c${top ? ' is-top' : ''}" title="${hero(h).name}: ${w} ${pl(w, 'победа', 'победы', 'побед')} из ${n} до этого матча">${hic(h)}<span>${hero(h).name}</span><b class="num">${w}–${n - w}</b></span></div>`; }).join('')}</div>`; }).join('')}</div></div>`; }
        if (X === 'luPP' || X === 'luPPseg' || X === 'luPPslim') { // v34–v35: вид «Игроки по позициям» со страницы турнира (2.4, ../widget-positions/_pp.css): ник и команда, главные герои — имя, винрейт полоской и числом, карты
          const ROLE = ['', 'Керри', 'Мид', 'Оффлейн', 'Саппорт 4', 'Саппорт 5'];
          const hw = ([h, n, w]) => { const wr = Math.round(w / n * 100), c = wr >= 55 ? 'up' : wr < 45 ? 'dn' : ''; return `<span class="pp-hw"><img src="${hero(h).img}" alt=""><span class="t"><span class="nm">${hero(h).name}</span><span class="st"><u class="${c}"><b style="width:${wr}%"></b></u><b class="${c}">${wr}%</b><i>${n}<span> ${pl(n, 'карта', 'карты', 'карт')}</span></i></span></span></span>`; };
          const r = (q, id) => `<div class="pp-r"><span class="k">${q.n}</span><img class="f ws34-lg" src="${(D.teams[id] || {}).logo || ''}" alt=""><span class="n"><span class="nw"><span class="nk">${pnm(q.p)}</span><small>${nm(id)} · ${ROLE[q.n]}</small></span></span><span class="hs">${hst(q).slice(0, 3).map(hw).join('')}</span><span class="r"></span></div>`;
          const cur = window.WS2_POS || 1, pairs = [1, 2, 3, 4, 5].filter(n => X === 'luPP' || n === cur);
          el._ws2Seg = true;
          const hu = ([h, n, w]) => { const wr = Math.round(w / n * 100), c = wr >= 55 ? 'up' : wr < 45 ? 'dn' : ''; return `<span class="ws36-h" title="${hero(h).name} · ${wr}% · ${n} ${pl(n, 'карта', 'карты', 'карт')}"><img src="${hero(h).img}" alt=""><small><b class="${c}">${wr}%</b> ${n}</small></span>`; };
          if (X === 'luPPslim') return `<div class="w pp pp--wide ws34 ws36"><div class="w-hd"><span class="w-hd__t">Составы</span><small class="ws34-sub">ожидаемые · главные герои до матча: винрейт и карты</small></div>
            <div class="pp-list">${[1, 2, 3, 4, 5].map(n => [[A, fa], [B, fb]].map(([id, f5]) => { const q = f5.find(z => z.n === n); return q ? `<div class="pp-r"><span class="k">${n}</span><img class="f ws34-lg" src="${(D.teams[id] || {}).logo || ''}" alt=""><span class="n"><span class="nw"><span class="nk">${pnm(q.p)}</span><small>${ROLE[n]}</small></span></span><span class="hs">${hst(q).map(hu).join('')}</span><span class="r"></span></div>` : ''; }).join('')).join('')}</div></div>`;
          return `<div class="w pp pp--wide ws34"><div class="w-hd"><span class="w-hd__t">Составы</span><small class="ws34-sub">ожидаемые · главные герои на турнире</small></div>
            ${X === 'luPPseg' ? `<div class="pp-seg" role="tablist">${[1, 2, 3, 4, 5].map(n => `<button role="tab" data-ws2pos="${n}" class="${n === cur ? 'is-on' : ''}"><span>${n}</span> ${ROLE[n]}</button>`).join('')}</div>` : ''}
            <div class="pp-list">${pairs.map(n => [[A, fa], [B, fb]].map(([id, f5]) => { const q = f5.find(z => z.n === n); return q ? r(q, id) : ''; }).join('')).join('')}</div></div>`; }
        if (X === 'luRow') return `<div class="ws24">${hd}${[[A, fa], [B, fb]].map(([id, f5]) => `<div class="ws29"><div class="ws28-t">${tname(id)}</div><div class="ws26">${f5.map(q => `<div class="ws26-p"><span class="ws26-av"><img src="${pav(q.p)}" alt=""><i>${q.n}</i></span><b>${pnm(q.p)}</b></div>`).join('')}</div></div>`).join('')}</div>`;
        return `<div class="ws24">${hd}${[[A, fa], [B, fb]].map(([id, f5]) => `<div class="ws28-t ws30-t">${tname(id)}</div><div class="ws30">${f5.map(q => `<div class="ws30-c"><img class="ws30-av" src="${pav(q.p)}" alt=""><b>${pnm(q.p)}</b><small>${POS[q.n]}</small><span class="ws24-hs">${q.hs.map(hic).join('')}</span></div>`).join('')}</div>`).join('')}</div>`; };
      el.innerHTML = `<div class="ws2 ws7 ws7--${K}"><div class="ws7-top"><b>Статистика к матчу</b><small>${T.league} · до серии</small></div>${h2hRow}
        <div class="ws7-cols">${col2(A, a, 'a')}${col2(B, b, 'b')}</div></div>`;
      // лаба: блоки страницы, которые этот вариант заменяет, прячем («Очные и форма» — дубль плиток и строки очных, «Составы» — дуэли)
      if (X === 'luPPseg' && !window._ws2SegOn) { window._ws2SegOn = true; document.addEventListener('click', e => { const b = e.target.closest('[data-ws2pos]'); if (!b) return; window.WS2_POS = +b.dataset.ws2pos; const c = b.closest('.ws24-cd'); if (c) { c.innerHTML = window._ws2Lineup(); } }); }
      // v38–v40 (дирижёр 03.11: «идея хорошая — как начальник говорил»): блок «О матче» вместо «Формы на турнире» (дубль статистики) — что на кону + 3 факта из прошлого.
      // Факты — настоящие, из GS_TOURNAMENT до этой серии; «на кону» — место в таблице турнира после победы (по сериям, как «Место на турнире»).
      // v66 (дирижёр 03.11: «цвет — от логотипа команды»): средний цвет логотипа (насыщенные пиксели), кэш по команде → --ta / --tb на блоке
      const TC = window._ws2TC || (window._ws2TC = {});
      const logoColor = id => new Promise(res => { if (TC[id]) return res(TC[id]); const src = (D.teams[id] || {}).logo; if (!src) return res(null);
        const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 24);
          const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) { const R = d[i], G = d[i + 1], B = d[i + 2], A = d[i + 3], mx = Math.max(R, G, B), mn = Math.min(R, G, B); if (A < 128 || mx - mn < 40 || mx < 60) continue; r += R; g += G; b += B; n++; }
          TC[id] = n > 8 ? `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})` : '#a1a1aa'; } catch (e) { TC[id] = '#a1a1aa'; } res(TC[id]); }; im.onerror = () => res(null); im.src = src; });
      const logoTint = el2 => Promise.all([logoColor(A), logoColor(B)]).then(([ca, cb]) => { const r = el2.querySelector('.ws49') || el2; if (ca) r.style.setProperty('--ta', ca); if (cb) r.style.setProperty('--tb', cb); });
      const AB = window.WS2_ABOUT, about = () => {
        const ids = Object.keys(T.names).map(Number), rank = (bs, id) => ids.map(x => ({ x, f: form(bs, x) })).sort((p, q) => q.f.sw - p.f.sw || p.f.sl - q.f.sl || q.f.pct - p.f.pct).findIndex(q => q.x === id) + 1;
        const after = w => { const fake = { start: o.start, a: A, b: B, maps: [{ win: w, dur: 0 }, { win: w, dur: 0 }] }; return rank([...before, fake], w); };
        const stake = `Победа поднимет ${opp(A)} на ${after(A)}-е место, ${opp(B)} — на ${after(B)}-е`;
        const facts = id => { const f = form(before, id), ss = before.filter(q => has(q, id)).sort((x, y) => x.start - y.start), last = ss.slice(-4), out = [];
          const lost1 = last.filter(q => q.maps[0] && q.maps[0].win !== id).length, won = ss.flatMap(q => q.maps).filter(m => m.win === id).sort((x, y) => x.dur - y.dur)[0];
          if (f.streak >= 2) out.push([f.streak, `${pl(f.streak, 'серию', 'серии', 'серий')} подряд выиграла ${opp(id)}`, `${opp(id)} выиграла ${f.streak} ${pl(f.streak, 'серию', 'серии', 'серий')} подряд`]);
          else if (f.last5[0] && !f.last5[0].win) out.push(['−', `${opp(id)} проиграла прошлую серию`, `${opp(id)} проиграла прошлую серию — ${opp(f.last5[0].opp)}, ${f.last5[0].w}:${f.last5[0].l}`]);
          if (last.length >= 3 && lost1 >= 2) out.push([`${lost1} из ${last.length}`, `${opp(id)}: первая карта проиграна в последних сериях`, `${opp(id)} проиграла первую карту в ${lost1} из ${last.length} последних серий`]);
          if (won) out.push([mmss(won.dur), `самая быстрая победа ${opp(id)} на турнире`, `Самая быстрая победа ${opp(id)} на турнире — ${mmss(won.dur)}`]);
          out.push([f.pct + '%', `карт выиграла ${opp(id)} на турнире`, `${opp(id)} выиграла ${f.pct}% карт на турнире`]);
          return out; };
        const pl = (n, a, b, c) => n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c;
        const fa = facts(A), fb = facts(B), three = [fa[0], fb[0], fa[1] && fb[1] ? (fa[1][0].length <= fb[1][0].length ? fa[1] : fb[1]) : fa[1] || fb[1]].filter(Boolean), team3 = [A, B, fa[1] && fb[1] ? (fa[1][0].length <= fb[1][0].length ? A : B) : fa[1] ? A : B];
        const lastH = h2h[h2h.length - 1], h2hT = lastH ? (() => { const w = lastH.maps.filter(m => m.win === A).length; return `Последняя встреча — ${w}:${lastH.maps.length - w}, ${day(lastH.start)}`; })() : '';
        const hd = `<div class="ws24-hd"><b>О матче</b><small>${T.league} · по играм до матча</small></div>`;
        // v41–v43 (дирижёр 03.11: «больше как таблица, иконки, выделять — как другие виджеты; сложнее»)
        const IC = { fire: '<path d="M8 1.8c.4 2.2 3.7 3.6 3.7 7a3.7 3.7 0 0 1-7.4 0c0-1.6.8-2.6 1.6-3.3.1 1.2.7 2 1.4 2.3C7.1 6 7.2 3.8 8 1.8z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
          flag: '<path d="M4 14V2.5M4 3h7.5l-1.6 2.8 1.6 2.7H4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
          clock: '<circle cx="8" cy="8" r="5.8" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 4.8V8l2.2 1.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
          map: '<path d="M2.5 4l3.7-1.5 3.6 1.5 3.7-1.5v9.5l-3.7 1.5-3.6-1.5-3.7 1.5z M6.2 2.5v9.5 M9.8 4v9.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
          vs: '<path d="M3 3l6.5 6.5M13 3L6.5 9.5M2.5 10.5l3 3M13.5 10.5l-3 3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
          cup: '<path d="M5 2.5h6v3.5a3 3 0 0 1-6 0zM5 3.5H2.8c0 2 1 3 2.4 3.2M11 3.5h2.2c0 2-1 3-2.4 3.2M8 9v3M5.5 13.5h5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' };
        const ic = k => `<span class="ws41-ic"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${IC[k]}</svg></span>`;
        const st = id => { const f = form(before, id), r = f.last5[0]; let n = 0; for (const x of f.last5) { if (x.win === (r && r.win)) n++; else break; } return { win: r ? r.win : null, n }; };
        const fl = id => { const ss = before.filter(q => has(q, id)).sort((x, y) => x.start - y.start).slice(-4); return { w: ss.filter(q => q.maps[0] && q.maps[0].win === id).length, n: ss.length }; };
        const fast = id => { const m = before.filter(q => has(q, id)).flatMap(q => q.maps).filter(m => m.win === id).sort((x, y) => x.dur - y.dur)[0]; return m ? m.dur : 0; };
        const sa = st(A), sb = st(B), la = fl(A), lb = fl(B), ka = fast(A), kb = fast(B), ra = rank(before, A), rb = rank(before, B);
        const sc = x => x.win === null ? 0 : x.win ? x.n : -x.n;
        // [иконка, показатель, левое, правое, кто лучше 'a'/'b'/'']
        const ROWS = [
          ['fire', 'Серия сейчас', sa, sb, sc(sa) === sc(sb) ? '' : sc(sa) > sc(sb) ? 'a' : 'b'],
          ['flag', 'Выиграна первая карта · 4 последние', `${la.w} из ${la.n}`, `${lb.w} из ${lb.n}`, la.w === lb.w ? '' : la.w > lb.w ? 'a' : 'b'],
          ['clock', 'Самая быстрая победа', ka ? mmss(ka) : '—', kb ? mmss(kb) : '—', !ka || !kb || ka === kb ? '' : ka < kb ? 'a' : 'b'],
          ['map', 'Карт выиграно', a.pct + '%', b.pct + '%', a.pct === b.pct ? '' : a.pct > b.pct ? 'a' : 'b'] ];
        const strk = x => x.win === null ? '—' : `<span class="ws41-s ${x.win ? 'W' : 'L'}">${x.win ? 'W' : 'L'}${x.n}</span>`;
        const cell = (v, on) => `<span class="ws41-v num${on ? ' is-best' : ''}">${typeof v === 'object' ? strk(v) : v}</span>`;
        const thead = `<div class="ws41-r ws41-h"><span></span><span></span><span class="ws41-t">${LG(A, 'ws41-lg')}${opp(A)}</span><span class="ws41-t">${LG(B, 'ws41-lg')}${opp(B)}</span></div>`;
        const tbody = ROWS.map(([k, t, l, r, w]) => `<div class="ws41-r">${ic(k)}<span class="ws41-k">${t}</span>${cell(l, w === 'a')}${cell(r, w === 'b')}</div>`).join('');
        const stakeRow = `<div class="ws41-r ws41-stake">${ic('cup')}<span class="ws41-k">На кону · место после победы</span>${[ [ra, after(A)], [rb, after(B)] ].map(([x, y]) => `<span class="ws41-v num">${y < x ? `${x} <i>→</i> <b>${y}</b>` : `<b>${x}</b> <i>остаётся</i>`}</span>`).join('')}</div>`;
        const h2hRow = lastH ? `<div class="ws41-r">${ic('vs')}<span class="ws41-k">Последняя встреча · ${day(lastH.start)}</span>${(() => { const w = lastH.maps.filter(m => m.win === A).length, l = lastH.maps.length - w; return cell(w, w > l) + cell(l, l > w); })()}</div>` : `<div class="ws41-r">${ic('vs')}<span class="ws41-k">Очные</span><span class="ws41-v ws41-span">на турнире ещё не встречались</span></div>`;
        // v44–v46 (дирижёр 03.11: «надо ещё поискать») — другие идеи, не таблица фактов
        if (AB === 'path') { // путь к матчу: у каждой команды лента её серий на турнире (лого соперника, счёт, цвет), обе сходятся в этот матч
          const lane = id => before.filter(q => has(q, id)).sort((x, y) => x.start - y.start).map(q => { const w = q.maps.filter(m => m.win === id).length, l = q.maps.length - w, o2 = q.a === id ? q.b : q.a;
            return `<span class="ws44-s ${w > l ? 'W' : 'L'}" title="${opp(o2)} · ${day(q.start)}">${LG(o2, 'ws44-lg')}<b class="num">${w}:${l}</b></span>`; }).join('<i class="ws44-ln"></i>');
          return `<div class="ws38 ws44">${hd}${[[A, a, ra], [B, b, rb]].map(([id, f, r]) => `<div class="ws44-r"><div class="ws44-t">${LG(id, 'ws28-lg')}<b>${opp(id)}</b><small>${r}-е место · ${f.sw}–${f.sl}</small></div><div class="ws44-p">${lane(id)}<i class="ws44-ln"></i><span class="ws44-now">этот матч</span></div></div>`).join('')}
            <p class="ws44-st">${ic('cup')}<span><b>На кону:</b> ${after(A) < ra ? `${opp(A)} поднимется на ${after(A)}-е место` : `${opp(A)} останется ${ra}-й`}, ${after(B) < rb ? `${opp(B)} — на ${after(B)}-е` : `${opp(B)} останется ${rb}-й`}</span></p></div>`; }
        // v47–v49 (дирижёр 03.11: «шансы по статистике — интересно, но слабо; как блоки статистики, интереснее»)
        // Модель: 5 факторов, у каждого доля команды 0..1; разница A−B с весом → логит → шанс выиграть карту p; серию Bo3 — p² + 2p²(1−p). Вклад фактора — в процентных пунктах.
        const lastN = id => before.filter(q => has(q, id)).sort((x, y) => x.start - y.start).slice(-5);
        const fwin = id => { const ss = lastN(id); return ss.length ? ss.filter(q => q.maps.filter(m => m.win === id).length > q.maps.length / 2).length / ss.length : .5; };
        const FAC = [
          ['map', 'Карт выиграно на турнире', a.pct / 100, b.pct / 100, a.pct + '%', b.pct + '%', .35],
          ['fire', 'Форма · 5 последних серий', fwin(A), fwin(B), `${Math.round(fwin(A) * 5)}–${5 - Math.round(fwin(A) * 5)}`, `${Math.round(fwin(B) * 5)}–${5 - Math.round(fwin(B) * 5)}`, .25],
          ['flag', 'Выигрывает первую карту', window.WS2_LIN ? (la.w + 1) / (la.n + 2) : la.n ? la.w / la.n : .5, window.WS2_LIN ? (lb.w + 1) / (lb.n + 2) : lb.n ? lb.w / lb.n : .5, window.WS2_HV ? `${la.w}/${la.n}` : `${la.w} из ${la.n}`, window.WS2_HV ? `${lb.w}/${lb.n}` : `${lb.w} из ${lb.n}`, .15],
          ['cup', 'Серии на турнире', wr(a), wr(b), `${a.sw}–${a.sl}`, `${b.sw}–${b.sl}`, .15],
          ['clock', 'Средняя победа · быстрее — сильнее', a.avgW && b.avgW ? b.avgW / (a.avgW + b.avgW) : .5, a.avgW && b.avgW ? a.avgW / (a.avgW + b.avgW) : .5, a.avgW ? mmss(a.avgW) : '—', b.avgW ? mmss(b.avgW) : '—', .10] ];
        let lg0 = FAC.reduce((t, f) => t + f[6] * (f[2] - f[3]) * 4, 0), pm = 1 / (1 + Math.exp(-lg0)), ps = pm * pm + 2 * pm * pm * (1 - pm), PA = Math.round(ps * 100), PM = Math.round(pm * 100);
        // v69 (дирижёр 03.11: «чтобы цифры бились»): WS2_LIN — шанс = среднее долей пяти показателей (вес у всех равный); доля в плитке видна в плашке лидера — шанс сверху = среднее этих долей
        const shr = f => f[2] + f[3] ? f[2] / (f[2] + f[3]) : .5;
        if (window.WS2_LIN) { PA = Math.round(FAC.reduce((t, f) => t + shr(f), 0) / FAC.length * 100); PM = PA; }
        const TIE = window.WS2_LIN && (window.WS2_NOW ? PA === 50 : Math.abs(PA - 50) < 2); // v71: фаворит всегда, кроме ровно 50%
        const pp = f => Math.round(f[6] * (f[2] - f[3]) * 4 * 25); // вклад в п.п. шанса карты (≈ производная логиста в 0.5)
        const fav = PA >= 50 ? A : B, LIN = window.WS2_LIN, head = `<div class="ws47-top"><span class="ws45-t">${LG(A, 'ws7-lg')}<b>${opp(A)}</b></span><span class="ws47-big"><em class="num${PA >= 50 && !TIE ? ' is-best' : ''}">${PA}%</em><small>${LIN ? 'шанс · среднее 5 показателей' : 'шанс выиграть серию'}</small><em class="num${PA < 50 && !TIE ? ' is-best' : ''}">${100 - PA}%</em></span><span class="ws45-t b"><b>${opp(B)}</b>${LG(B, 'ws7-lg')}</span></div>
          <div class="ws45-bar"><i class="${PA >= 50 && !TIE ? 'is-best' : ''}" style="width:${PA}%"></i><i class="${PA < 50 && !TIE ? 'is-best' : ''}"></i></div>`;
        const sub = hd.replace('по играм до матча', 'шансы — модель по статистике турнира, не ставки');
        if (AB === 'factors') { // v47: строки-факторы как в статистике: значение A · показатель · значение B, под ними полоса от центра — куда тянет фактор и на сколько п.п.
          return `<div class="ws38 ws45 ws47">${sub}${head}<div class="ws47-fs">${FAC.map(f => { const d = pp(f), w = Math.min(50, Math.abs(d) * 4);
            return `<div class="ws47-f"><b class="num${d > 0 ? ' is-best' : ''}">${f[4]}</b><span class="ws47-k">${ic(f[0])}${f[1]}</span><b class="num${d < 0 ? ' is-best' : ''}">${f[5]}</b>
              <div class="ws47-bar"><span class="a">${d > 0 ? `<em class="num">+${d}</em><i style="width:${w * 2}%"></i>` : ''}</span><span class="b">${d < 0 ? `<i style="width:${w * 2}%"></i><em class="num">+${-d}</em>` : ''}</span></div></div>`; }).join('')}</div>
            <p class="ws47-n">Полоса — куда фактор тянет шанс выиграть карту и на сколько пунктов</p></div>`; }
        if (AB === 'score') { // v48: шансы на счёт серии — 2:0 · 2:1 · 1:2 · 0:2 столбиками + шанс на карту; ниже 3 главных фактора плашками
          const P = [['2:0', pm * pm], ['2:1', 2 * pm * pm * (1 - pm)], ['1:2', 2 * (1 - pm) * (1 - pm) * pm], ['0:2', (1 - pm) * (1 - pm)]], mx = Math.max(...P.map(x => x[1]));
          const top3 = [...FAC].sort((x, y) => Math.abs(pp(y)) - Math.abs(pp(x))).slice(0, 3);
          return `<div class="ws38 ws45 ws48">${sub}${head}<div class="ws48-g"><div class="ws48-sc">${P.map(([t, v], i) => `<div class="ws48-c${v === mx ? ' is-best' : ''}"><small class="num">${Math.round(v * 100)}%</small><i style="height:${Math.round(v / mx * 100)}%"></i><b class="num">${t}</b><span>${LG(i < 2 ? A : B, 'ws41-lg')}</span></div>`).join('')}</div>
            <div class="ws48-r"><div class="ws48-m"><small>Шанс выиграть карту</small><span><b class="num">${PM}%</b> ${opp(A)} · <b class="num">${100 - PM}%</b> ${opp(B)}</span></div>${top3.map(f => { const d = pp(f), w = d >= 0 ? A : B;
              return `<div class="ws45-w">${ic(f[0])}<span>${f[1]}</span>${LG(w, 'ws41-lg')}<b class="num">+${Math.abs(d)} п.</b></div>`; }).join('')}</div></div></div>`; }
        // v50–v52 (дирижёр 03.11: «+10 пунктов непонятно — перевес показать по-другому»): WS2_ADV — logo · diff · bar
        const ADV = window.WS2_ADV, DIFF = [ // разница в своих единицах: [A лучше, B лучше]
          () => `на ${Math.abs(a.pct - b.pct)}% больше`, () => { const x = Math.abs(Math.round(fwin(A) * 5) - Math.round(fwin(B) * 5)); return `на ${x} ${pl(x, 'победу', 'победы', 'побед')} больше`; },
          () => { const x = Math.abs(la.w - lb.w); return `на ${x} ${pl(x, 'раз', 'раза', 'раз')} чаще`; }, () => `на ${Math.abs(Math.round((wr(a) - wr(b)) * 100))}% больше побед`, () => `на ${mmss(Math.abs(a.avgW - b.avgW))} быстрее` ];
        const mid = (f, d) => { const k = FAC.indexOf(f), w = d > 0 ? A : B;
          // v70 (дирижёр 03.11: «поровну — тоже плашкой: процент и иконка»): нейтральная плашка «= Draw 50%»
          if (!d) return window.WS2_DRAW ? `<em class="ws50 ws70"><b class="num">= 50%</b></em>` : '<em class="ws49-d">поровну</em>';
          if (ADV === 'logo') return `<em class="ws50 ${d > 0 ? 'a' : 'b'}">${LG(w, 'ws41-lg')}${LIN ? `${window.WS2_NOW ? '' : '<span>Best</span>'}<b class="num">${Math.round((d > 0 ? shr(f) : 1 - shr(f)) * 100)}%</b>` : '<span>сильнее</span>'}</em>`;
          if (ADV === 'diff') return `<em class="ws51 ${d > 0 ? 'a' : 'b'}">${DIFF[k]()}</em>`;
          if (ADV === 'bar') return '';
          return `<em class="ws49-d num ${d > 0 ? 'a' : 'b'}">${d > 0 ? '←' : ''} +${Math.abs(d)} п. ${d < 0 ? '→' : ''}</em>`; };
        // v53–v55 (дирижёр 03.11: «дай разные варианты, а не одно и то же»): разные формы факторов, цвета команд как в графике золота
        const FV = window.WS2_FV;
        // v60–v62 (дирижёр 03.11: «цвет — из логики, как в виджетах страницы турнира; ёмко, иконки, меньше текста»):
        // язык страницы турнира — всё монохромное, цвет только по смыслу: ячейка-«тепло» как винрейт в «Статистике героев» (2.5) — w2/w1 зелёная, l1/l2 красная; лучшее в паре — зелёным, хуже — красным, сила — по отрыву
        if (AB === 'heat') {
          const SHORT = ['Карты', 'Форма', '1-я карта', 'Серии', 'Ср. победа'], TIP = ['% выигранных карт на турнире', '5 последних серий', 'выиграна первая карта, 4 последние серии', 'серии на турнире', 'средняя длина победы — быстрее лучше'];
          const heat = (f, side) => { const x = f[2] + f[3] ? f[2] / (f[2] + f[3]) : .5, m = side === 'a' ? x - .5 : .5 - x; return m > .08 ? 'w2' : m > .01 ? 'w1' : m < -.08 ? 'l2' : m < -.01 ? 'l1' : ''; };
          const odd = side => { const m = side === 'a' ? PA - 50 : 50 - PA; return m > 15 ? 'w2' : m > 2 ? 'w1' : m < -15 ? 'l2' : m < -2 ? 'l1' : ''; };
          const V = window.WS2_HV;
          if (V === 'tiles') // плитки v50, но без плашек и полос: иконка + короткое слово, два значения ячейками-теплом
            return `<div class="ws38 ws60">${hd.replace('по играм до матча', 'модель · не ставки')}<div class="ws60-top">${[[A, 'a', PA], [B, 'b', 100 - PA]].map(([id, sd, v]) => `<span class="ws60-o">${LG(id, 'ws7-lg')}<b>${opp(id)}</b><em class="wrh ${odd(sd)} num">${v}%</em></span>`).join('<i class="ws60-vs">шанс</i>')}</div>
              <div class="ws60-g">${FAC.map((f, k) => `<div class="ws60-c" title="${TIP[k]}"><div class="ws60-t">${ic(f[0])}<b>${SHORT[k]}</b></div><div class="ws60-v"><span class="wrh ${heat(f, 'a')} num">${f[4]}</span><span class="wrh ${heat(f, 'b')} num">${f[5]}</span></div></div>`).join('')}</div></div>`;
          // table: как таблица героев — строки команды, столбцы — факторы иконкой и словом; первым столбцом шанс
          const th = `<div class="ws61-r ws61-h"><span></span><span class="ws61-c" title="шанс выиграть серию · модель, не ставки">${ic('cup')}Шанс</span>${FAC.map((f, k) => `<span class="ws61-c" title="${TIP[k]}">${ic(f[0])}${SHORT[k]}</span>`).join('')}</div>`;
          const tr = (id, sd) => `<div class="ws61-r"><span class="ws61-n">${LG(id, 'ws41-lg')}<b>${opp(id)}</b></span><span class="ws61-c"><em class="wrh ${odd(sd)} num">${sd === 'a' ? PA : 100 - PA}%</em></span>${FAC.map(f => `<span class="ws61-c"><em class="wrh ${heat(f, sd)} num">${sd === 'a' ? f[4] : f[5]}</em></span>`).join('')}</div>`;
          if (V === 'table') return `<div class="ws38 ws61">${hd.replace('по играм до матча', 'модель · не ставки')}${th}${tr(A, 'a')}${tr(B, 'b')}</div>`;
          // rows: столбцы — команды, строки — факторы (вертикально; на узком читается лучше), сверху шанс крупно ячейкой
          return `<div class="ws38 ws62">${hd.replace('по играм до матча', 'модель · не ставки')}<div class="ws62-r ws62-h"><span></span>${[A, B].map(id => `<span class="ws62-tm">${LG(id, 'ws41-lg')}${opp(id)}</span>`).join('')}</div>
            <div class="ws62-r ws62-odd"><span class="ws61-c">${ic('cup')}Шанс</span><em class="wrh ${odd('a')} num">${PA}%</em><em class="wrh ${odd('b')} num">${100 - PA}%</em></div>
            ${FAC.map((f, k) => `<div class="ws62-r" title="${TIP[k]}"><span class="ws61-c">${ic(f[0])}${SHORT[k]}</span><em class="wrh ${heat(f, 'a')} num">${f[4]}</em><em class="wrh ${heat(f, 'b')} num">${f[5]}</em></div>`).join('')}</div>`; }
        if (AB === 'blocks' && FV) {
          const sh = f => f[2] + f[3] ? f[2] / (f[2] + f[3]) : .5, lead = f => { const d = pp(f); return d > 0 ? 'a' : d < 0 ? 'b' : ''; };
          let body = '';
          if (FV === 'tug') // перетягивание: дорожка от A к B, ползунок — где доля; по краям значения
            body = `<div class="ws53">${FAC.map(f => { const x = sh(f), l = lead(f); return `<div class="ws53-r"><span class="ws53-k">${ic(f[0])}${f[1]}</span><b class="num${l === 'a' ? ' is-a' : ''}">${f[4]}</b><span class="ws53-t"><i class="ws53-fa" style="width:${Math.round(x * 100)}%"></i><i class="ws53-fb"></i><i class="ws53-m"></i><i class="ws53-k2 ${l}" style="left:${Math.round(x * 100)}%"></i></span><b class="num${l === 'b' ? ' is-b' : ''}">${f[5]}</b></div>`; }).join('')}</div>`;
          if (FV === 'cols') // мини-диаграммы: в каждой плитке два столбика команд, высота — доля
            body = `<div class="ws54">${FAC.map(f => { const x = sh(f), l = lead(f), mx = Math.max(x, 1 - x); return `<div class="ws54-c"><div class="ws43-t">${ic(f[0])}<small>${f[1]}</small></div><div class="ws54-g"><span class="a${l === 'a' ? ' on' : ''}"><b class="num">${f[4]}</b><i style="height:${Math.round(x / mx * 100)}%"></i>${LG(A, 'ws41-lg')}</span><span class="b${l === 'b' ? ' on' : ''}"><b class="num">${f[5]}</b><i style="height:${Math.round((1 - x) / mx * 100)}%"></i>${LG(B, 'ws41-lg')}</span></div></div>`; }).join('')}</div>`;
          if (FV === 'rings') { // кольца, как у dltv: доля A синим, B янтарным, в центре лого лидера; под кольцом значения
            const R = 22, C = 2 * Math.PI * R;
            body = `<div class="ws55">${FAC.map(f => { const x = sh(f), l = lead(f);
              return `<div class="ws55-c"><svg viewBox="0 0 56 56" width="64" height="64"><circle cx="28" cy="28" r="${R}" class="b"/><circle cx="28" cy="28" r="${R}" class="a" stroke-dasharray="${(x * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 28 28)"/></svg><span class="ws55-in">${l ? LG(l === 'a' ? A : B, 'ws55-lg') : '='}</span>
                <small>${f[1]}</small><span class="ws55-v"><b class="num${l === 'a' ? ' is-a' : ''}">${f[4]}</b><i>·</i><b class="num${l === 'b' ? ' is-b' : ''}">${f[5]}</b></span></div>`; }).join('')}</div>`; }
          return `<div class="ws38 ws45 ws49 ws5x">${sub}${head}${body}<p class="ws53-sum">${ic('cup')}<span><b>${opp(fav)}</b> — фаворит: карта ${Math.max(PM, 100 - PM)}%, серия ${Math.max(PA, 100 - PA)}%</span></p></div>`; }
        if (AB === 'blocks') { // v49: шансы крупно + блоки-факторы 2×3 как плитки статистики: значения обеих, полоса долей, вклад
          return `<div class="ws38 ws45 ws49${ADV ? ' ws5x ws5x--' + ADV : ''}${window.WS2_SKIN ? ' ws5s--' + window.WS2_SKIN : ''}${ADV === 'bar' ? ' ws52' : ''}">${sub}${head}<div class="ws49-g">${FAC.map(f => { const d = pp(f) || Math.sign(Math.round((f[2] - f[3]) * 100)), sh = f[2] + f[3] ? f[2] / (f[2] + f[3]) : .5;
            return `<div class="ws49-c${d > 0 ? ' is-a' : d < 0 ? ' is-b' : ''}"><div class="ws43-t">${ic(f[0])}<small>${f[1]}</small></div><div class="ws43-v"><span class="${d > 0 ? 'is-best' : ''}"><b class="num">${f[4]}</b></span>${mid(f, d)}<span class="${d < 0 ? 'is-best' : ''}"><b class="num">${f[5]}</b></span></div>
              <div class="ws5-bar"><i style="width:${Math.round(sh * 100)}%" class="${d > 0 ? 'is-best' : ''}"></i><i class="${d < 0 ? 'is-best' : ''}"></i></div></div>`; }).join('')}${LIN ? `<div class="ws49-c ws49-sum">${window.WS2_FAVLG && !TIE ? `<img class="ws73-lg" src="${(D.teams[fav] || {}).logo || ''}" alt="">` : ''}<small>Итог · среднее 5 показателей</small><b>${TIE ? 'Шансы равные' : `${opp(fav)} — фаворит`}</b><span class="num">${TIE ? `${PA}% — ${100 - PA}%` : `${Math.max(PA, 100 - PA)}% против ${Math.min(PA, 100 - PA)}%`}</span></div>` : `<div class="ws49-c ws49-sum"><small>Итог модели</small><b>${opp(fav)} — фаворит</b><span class="num">карта ${Math.max(PM, 100 - PM)}% · серия ${Math.max(PA, 100 - PA)}%</span></div>`}</div></div>`; }
        if (AB === 'odds') { // шансы по статистике турнира: полоса A/B и 3 причины с иконкой — почему так
          const sA = a.pct / 100 * .5 + wr(a) * .3 + Math.min(1, Math.max(0, sc(sa) + 5) / 10) * .2, sB = b.pct / 100 * .5 + wr(b) * .3 + Math.min(1, Math.max(0, sc(sb) + 5) / 10) * .2, pA = Math.round(sA / (sA + sB) * 100);
          const why = ROWS.filter(r => r[4]).slice(0, 3).map(([k, t, l, r, w]) => `<div class="ws45-w">${ic(k)}<span>${t}</span>${LG(w === 'a' ? A : B, 'ws41-lg')}<b class="num">${typeof (w === 'a' ? l : r) === 'object' ? strk(w === 'a' ? l : r) : (w === 'a' ? l : r)}</b></div>`).join('');
          return `<div class="ws38 ws45">${hd.replace('по играм до матча', 'шансы — по статистике турнира, не ставки')}<div class="ws45-top"><span class="ws45-t">${LG(A, 'ws7-lg')}<b>${opp(A)}</b><em class="num">${pA}%</em></span><span class="ws45-t b"><em class="num">${100 - pA}%</em><b>${opp(B)}</b>${LG(B, 'ws7-lg')}</span></div>
            <div class="ws45-bar"><i class="${pA >= 50 ? 'is-best' : ''}" style="width:${pA}%"></i><i class="${pA < 50 ? 'is-best' : ''}"></i></div><div class="ws45-ws">${why}</div></div>`; }
        if (AB === 'mini') { // мини-таблица турнира с формой: места вокруг двух команд, у каждой — 5 последних серий точками и куда поднимет победа
          const tbl = ids.map(x => ({ x, f: form(before, x) })).sort((p, q) => q.f.sw - p.f.sw || p.f.sl - q.f.sl || q.f.pct - p.f.pct);
          const lo = Math.max(0, Math.min(ra, rb) - 2), hi = Math.min(tbl.length, Math.max(ra, rb) + 2), part = tbl.slice(lo, hi);
          return `<div class="ws38 ws46">${hd.replace('по играм до матча', 'таблица турнира до матча')}<div class="ws46-hd"><span>#</span><span>Команда</span><span>Серии</span><span>Карты</span><span>Форма</span><span>После победы</span></div>
            ${part.map((q, i) => { const me = q.x === A || q.x === B, pl0 = lo + i + 1; return `<div class="ws46-r${me ? ' is-me' : ''}"><span class="num">${pl0}</span><span class="ws42-n">${LG(q.x, 'ws41-lg')}<b>${opp(q.x)}</b>${me ? '<i class="ws46-tag">в этом матче</i>' : ''}</span><span class="num">${q.f.sw}–${q.f.sl}</span><span class="num">${q.f.pct}%</span><span>${dots(q.f)}</span><span class="num">${me ? (after(q.x) < pl0 ? `<i class="ws42-up">↑ ${after(q.x)}</i>` : '<i class="ws42-eq">остаётся</i>') : ''}</span></div>`; }).join('')}</div>`; }
        if (AB === 'table') return `<div class="ws38 ws41">${hd}${thead}${stakeRow}${tbody}${h2hRow}</div>`;
        if (AB === 'stand' || AB === 'tiles') {
          // кусок турнирной таблицы: места вокруг двух команд, у них — куда поднимет победа
          const tbl = ids.map(x => ({ x, f: form(before, x) })).sort((p, q) => q.f.sw - p.f.sw || p.f.sl - q.f.sl || q.f.pct - p.f.pct);
          const lo = Math.max(0, Math.min(ra, rb) - 2), hi = Math.min(tbl.length, Math.max(ra, rb) + 1), part = tbl.slice(lo, hi);
          const stand = `<div class="ws42"><div class="ws42-hd"><span>#</span><span>Команда</span><span>Серии</span><span>После победы</span></div>${part.map((q, i) => { const me = q.x === A || q.x === B;
            return `<div class="ws42-r${me ? ' is-me' : ''}"><span class="num">${lo + i + 1}</span><span class="ws42-n">${LG(q.x, 'ws41-lg')}<b>${opp(q.x)}</b></span><span class="num">${q.f.sw}–${q.f.sl}</span><span class="num">${me ? (after(q.x) < lo + i + 1 ? `<i class="ws42-up">↑ ${after(q.x)}</i>` : '<i class="ws42-eq">остаётся</i>') : ''}</span></div>`; }).join('')}</div>`;
          if (AB === 'stand') return `<div class="ws38 ws41">${hd}<div class="ws42-wrap">${stand}<div class="ws42-side">${thead}${tbody}</div></div></div>`;
          // tiles: 4 плитки с иконкой — показатель, два значения с лого, лучшее выделено
          return `<div class="ws38 ws41">${hd}<div class="ws43">${[...ROWS, ['cup', 'Место после победы', after(A) < ra ? `${ra} → ${after(A)}` : `${ra}`, after(B) < rb ? `${rb} → ${after(B)}` : `${rb}`, '']].map(([k, t, l, r, w]) => `<div class="ws43-c"><div class="ws43-t">${ic(k)}<small>${t}</small></div><div class="ws43-v"><span class="${w === 'a' ? 'is-best' : ''}">${LG(A, 'ws41-lg')}<b class="num">${typeof l === 'object' ? strk(l) : l}</b></span><span class="${w === 'b' ? 'is-best' : ''}"><b class="num">${typeof r === 'object' ? strk(r) : r}</b>${LG(B, 'ws41-lg')}</span></div></div>`).join('')}</div></div>`; }
        if (AB === 'list') return `<div class="ws38">${hd}<p class="ws38-st"><span>На кону</span>${stake}</p><ul class="ws38-l">${three.map((f, i) => `<li>${LG(team3[i], 'ws38-lg')}<span>${f[2]}</span></li>`).join('')}${h2hT ? `<li><span class="ws38-dot"></span><span>${h2hT}</span></li>` : ''}</ul></div>`;
        if (AB === 'cols') return `<div class="ws38">${hd}<p class="ws38-st"><span>На кону</span>${stake}</p><div class="ws39">${[[A, fa], [B, fb]].map(([id, fs]) => `<div><div class="ws28-t">${LG(id, 'ws28-lg')}<b>${nm(id)}</b></div><ul class="ws38-l">${fs.slice(0, 2).map(f => `<li><span>${f[2]}</span></li>`).join('')}</ul></div>`).join('')}</div>${h2hT ? `<p class="ws39-h">${h2hT}</p>` : ''}</div>`;
        return `<div class="ws38">${hd}<p class="ws38-st"><span>На кону</span>${stake}</p><div class="ws40">${three.map((f, i) => `<div class="ws40-c"><b class="num">${f[0]}</b><small>${f[1]}</small></div>`).join('')}</div>${h2hT ? `<p class="ws39-h">${h2hT}</p>` : ''}</div>`; };
      window._ws2Lineup = lineup; window._ws2About = AB ? about : null;
      if (X) requestAnimationFrame(() => { const g = el.closest('.gm') || document; g.querySelectorAll('section.cd').forEach(c => { const t = (c.querySelector('.cd-hd b') || {}).textContent;
        if (t === 'Очные и форма') { c.style.display = 'none'; return; }
        if (AB) { const g = [...c.querySelectorAll('.gr-lg')].find(x => /^Форма на турнире/.test(x.textContent)); if (g) { const bd = g.parentElement; bd.classList.add('ws2'); bd.innerHTML = about(); if (window.WS2_SKIN === 'trn4') logoTint(bd); } }
        // v24–v25: дуэли — на месте старого блока «Составы» (там же, где он стоит на странице), а не внутри статистики
        if (t === 'Составы' && X !== 'h2h') { const d = X === 'duel' || X === 'heroes' ? duel() : lineup(); if (d) { c.classList.add('ws2', 'ws24-cd'); c.innerHTML = d; } } });
        // w-stats v3 (дирижёр 04.11: «нет статистики»): WS2_ST_ABOUT — во вкладке «Статистика» идущего / сыгранного матча тоже «О матче» (шансы и плитки), первым, над «Составами»
        if (window.WS2_ST_ABOUT && AB && ![...g.querySelectorAll('.ws24-hd b')].some(b => b.textContent === 'О матче')) { const lu = g.querySelector('section.cd.ws24-cd'); if (lu) { lu.insertAdjacentHTML('beforebegin', `<section class="cd wst-about"><div class="cd-bd ws2">${about()}</div></section>`); if (window.WS2_SKIN === 'trn4') logoTint(lu.previousElementSibling.querySelector('.cd-bd')); } } });
      return; }
    if (K === 'board') { // табло сравнения: крупные лого, форма точками, строки с полосами от центра
      el.innerHTML = `<div class="ws2 ws4"><div class="ws4-hd">
          <div class="ws4-tm">${LG(A, 'ws4-lg')}<b>${nm(A)}</b>${dots(a)}</div>
          <div class="ws4-mid"><b>Статистика к матчу</b><small>${T.league} · до серии</small></div>
          <div class="ws4-tm">${LG(B, 'ws4-lg')}<b>${nm(B)}</b>${dots(b)}</div></div>
        <div class="ws4-rs">${R.map(r => { const w = best(r), pa = share(r);
          return `<div class="ws4-r"><b class="num${w === 'a' ? ' is-best' : ''}">${r[1]}</b><span>${r[0]}</span><b class="num${w === 'b' ? ' is-best' : ''}">${r[2]}</b>
            <div class="ws4-bar"><span class="a"><i class="${w === 'a' ? 'is-best' : ''}" style="width:${Math.round(pa * 100)}%"></i></span><span class="b"><i class="${w === 'b' ? 'is-best' : ''}" style="width:${Math.round((1 - pa) * 100)}%"></i></span></div></div>`; }).join('')}</div></div>`;
      return; }
    if (K === 'tiles') { // плитки-показатели 2×2 (на широком — 4 в ряд); ниже — последние 5 соперников логотипами
      const chip = r => `<span class="ws5-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)}">${LG(r.opp, 'ws5-cl')}<b class="num">${r.w}:${r.l}</b></span>`;
      el.innerHTML = `<div class="ws2 ws5"><div class="ws5-hd"><b>Статистика к матчу</b><small>${T.league} · до серии</small></div>
        <div class="ws5-g">${R.map(r => { const w = best(r), pa = share(r);
          return `<div class="ws5-t"><small>${r[0]}</small><div class="ws5-v"><span class="${w === 'a' ? 'is-best' : ''}">${LG(A, 'ws5-lg')}<b class="num">${r[1]}</b></span><span class="${w === 'b' ? 'is-best' : ''}"><b class="num">${r[2]}</b>${LG(B, 'ws5-lg')}</span></div>
            <div class="ws5-bar"><i style="width:${Math.round(pa * 100)}%" class="${w === 'a' ? 'is-best' : ''}"></i><i class="${w === 'b' ? 'is-best' : ''}"></i></div></div>`; }).join('')}</div>
        <div class="ws5-l5"><small>Последние 5 серий</small>${[[A, a], [B, b]].map(([id, f]) => `<div class="ws5-lr">${LG(id, 'ws5-lg')}<b>${nm(id)}</b><div class="ws5-cs">${f.last5.map(chip).join('') || '<small>ещё не играли</small>'}</div></div>`).join('')}</div></div>`;
      return; }
    if (K === 'form') { // форма лицом к лицу: по краям команды и сводка, по центру — две ленты последних 5 серий к матчу
      const lane = (f, side) => `<div class="ws6-ln ${side}">${[...f.last5].reverse().map(r => `<span class="ws6-c ${r.win ? 'W' : 'L'}" title="${opp(r.opp)} · ${day(r.start)}">${LG(r.opp, 'ws6-cl')}<b class="num">${r.w}:${r.l}</b></span>`).join('')}</div>`;
      const sum = (f, x, side) => `<div class="ws6-sum ${side}">${R.map(r => { const w = best(r); return `<div class="${w === side ? 'is-best' : ''}"><b class="num">${side === 'a' ? r[1] : r[2]}</b><small>${r[0]}</small></div>`; }).join('')}</div>`;
      el.innerHTML = `<div class="ws2 ws6"><div class="ws6-hd"><span class="ws6-tm">${LG(A, 'ws6-lg')}<b>${nm(A)}</b></span><small>Статистика к матчу · ${T.league}, до серии</small><span class="ws6-tm b"><b>${nm(B)}</b>${LG(B, 'ws6-lg')}</span></div>
        <div class="ws6-body">${sum(a, b, 'a')}<div class="ws6-mid"><small>Форма · последние 5 серий → к матчу</small>${lane(a, 'a')}<i class="ws6-vs">VS</i>${lane(b, 'b')}</div>${sum(b, a, 'b')}</div></div>`;
      return; }
    el.innerHTML = `<div class="ws2 ws2--${K}"><div class="ws2-hd"><span class="ws2-t">${lg(A)}<b>${nm(A)}</b></span><small>Статистика к матчу · ${T.league}, до серии</small><span class="ws2-t ws2-t--b"><b>${nm(B)}</b>${lg(B)}</span></div>
      <div class="ws2-rs">${R.map(row).join('')}</div>
      <div class="ws2-l5h"><span>Последние 5 серий</span></div><div class="ws2-l5"><div>${f5(a, 'a')}</div><div>${f5(b, 'b')}</div></div>
</div>`;
  }
  window.WSTAT = { render };
})();
