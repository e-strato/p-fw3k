// Лаба w-drill v4+ (Claude-A, 03.11) — «Разбор» по данным начальника 03.11: карточка игрока + 2 голосовых. Основа — v3 Claude-B (_rz.js), этот файл — его копия с изменениями:
//  · «сайдбар показывает сущности» — игрок · герой · команда · прогнозы, переключается по контексту (клик по герою / игроку / команде на странице);
//  · блоки — унифицированные (начальник: «чтобы не было сложности с кастомизацией»): таблица · показатель · два показателя · показатель с динамикой — у всех одна рамка;
//  · игрок: live на этой карте, рейтинг за период, «об игроке» (Liquipedia); герой: игрок на герое, мета, «сильнее / слабее против» (OpenDota).
// Было (v3): (дирижёр 02.11: «заберём 1.1, с нуля попробуем»). Созвон 02.11 §1.1:
//  · медиа (эфиры, онлайн) и деньги не нужны; к трансляции не привязан;
//  · 4 вида — Прогнозы · Игрок · Герой · Команда, всё связано; по умолчанию — Прогнозы (голоса, соотношение, объём).
// Логика: состояние виджета — { вкладка, кто выбран } + история переходов. Любое имя / герой / команда внутри — ссылка:
//  открывает свою вкладку с этим выбором, «‹» в шапке возвращает назад. Клик по герою в пиках под графиком (data-hc) — «Игрок».
//  Время — как у страницы: идущая карта на её секунде (x.t), иначе последняя сыгранная целиком.
// Ставится на место «Пульса»: window.GS_ACT (хозяин — ../gs-match/_gs.js, первым в правой колонке). Подключать после ../w-actions/_act3.js.
// Данные: GS_DATA (OpenDota, TI 2026, 4 серии · 12 карт), GS_TOURNAMENT (все серии турнира). ‼️ Голоса прогнозов — пример.
// Высота фиксированная, лишнее — скроллом внутри (виджет не прыгает).
(() => {
  const D = window.GS_DATA, T = window.GS_TOURNAMENT; if (!D) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const kk = n => (n / 1000).toFixed(1) + 'k';
  const pl3 = (n, a, b, c) => { const d = n % 10, h = n % 100; return d === 1 && h !== 11 ? a : d >= 2 && d <= 4 && (h < 12 || h > 14) ? b : c; };
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const HERO = id => D.heroes[id] || { name: '—', img: '', short: '' };
  const NM = id => (window.GS_NAMES && window.GS_NAMES.NAME[id]) || (D.teams[id] || {}).name || '—';
  const SH = id => (window.GS_NAMES && window.GS_NAMES.SHORT[id]) || (D.teams[id] || {}).tag || '—';
  const LOGO = id => (D.teams[id] || {}).logo || '';
  const nick = p => (D.players[p.account_id] || {}).name || '—';
  const ALLMAPS = D.series.flatMap(s => s.maps);
  const tid = (m, p) => (p.isRadiant ? m.radiant_team_id : m.dire_team_id);

  // ——— что сейчас: карта, секунда, игроки ———
  let M = null, host = null;
  const cur = () => { const L = M.maps.filter(x => x.m); const x = L.find(x => x.st === 'live') || [...L].reverse().find(x => x.st === 'done') || L[0];
    return { x, m: x.m, t: x.st === 'live' ? x.t : x.m.duration, live: x.st === 'live', n: x.i + 1 }; };
  // статистика игрока на секунду t (как w-players): K и D — по журналу убийств, NW — по минутам; A — только по итогу
  const stat = (m, p, t) => { const key = 'npc_dota_hero_' + HERO(p.hero_id).short, full = t >= m.duration;
    const K = p.kills_log.filter(l => l.time <= t).length;
    const Dd = full ? p.deaths : m.players.filter(q => q.isRadiant !== p.isRadiant).reduce((n, q) => n + q.kills_log.filter(l => l.time <= t && l.key === key).length, 0);
    const nw = full ? p.net_worth : p.nw_t[Math.min(Math.floor(t / 60), p.nw_t.length - 1)] || 0;
    const items = p.items.filter(it => it && D.items[it] && (full || p.purchase_log.some(l => l.key === it && l.time <= t)));
    return { K, D: Dd, A: full ? p.assists : null, nw, items }; };
  // карты турнира из базы до этой (у идущей карты — без неё)
  const past = c => ALLMAPS.filter(m => m.start_time < c.m.start_time);

  // ——— прогнозы: те же вопросы, что в «Прогнозах» (widget-predict), + объём. ‼️ пример ———
  const Q = c => { const A = c.m.radiant_team_id, B = c.m.dire_team_id, pl = n => c.m.players.find(p => nick(p) === n);
    const T2 = (a, b) => [{ t: SH(A), go: 't:' + A, c: 'a' }, { t: SH(B), go: 't:' + B, c: 'b' }].map((o, i) => ({ ...o, v: [a, b][i] }));
    return [
      { q: `Кто возьмёт Map ${c.n}?`, o: T2(39, 61), n: 18420, d: 640 },
      { q: 'Счёт серии', o: [{ t: `2:1 ${SH(B)}`, go: 't:' + B, c: 'b', v: 58 }, { t: `2:1 ${SH(A)}`, go: 't:' + A, c: 'a', v: 42 }], n: 15310, d: 410 },
      { q: 'Кто убьёт следующего Рошана?', o: T2(30, 70), n: 9870, d: 1220 },
      { q: `Больше всех убийств на Map ${c.n}`, o: [['Yatoro', 41], ['Satanic', 38]].map(([n, v]) => { const p = pl(n); return { t: n, go: p ? 'p:' + p.account_id : '', c: p && p.isRadiant ? 'a' : 'b', v, h: p && p.hero_id }; }).concat([{ t: 'Другой', c: 'n', v: 21 }]), n: 7140, d: 380 },
      { q: `Тотал убийств на Map ${c.n}`, o: [{ t: 'Больше 45,5', c: 'n', v: 54 }, { t: 'Меньше 45,5', c: 'n', v: 46 }], n: 6230, d: 150 },
      { q: 'Кто первым снесёт казармы?', o: T2(36, 64), n: 5480, d: 210 },
      { q: 'Будет Ultra Kill?', o: [{ t: 'Да', c: 'n', v: 27 }, { t: 'Нет', c: 'n', v: 73 }], n: 3910, d: 90 },
    ].sort((a, b) => b.n - a.n); };

  // ——— состояние ———
  const S = { tab: 'q', p: null, h: null, t: null, back: [] };
  // v36 (SB_QT11, дирижёр 03.11: «изначально должен быть свёрнут, разворачивать — когда что-то выбрали»): при загрузке свёрнут; любой выбор (полоса, вкладка, перенос со страницы) — разворачивает
  if (window.SB_QT11 && window._sbC === undefined) window._sbC = true
  const go = (to, push = true) => { if (window.SB_QT11) window._sbC = false; const [k, v] = to.split(':'); if (push) S.back.push({ tab: S.tab, p: S.p, h: S.h, t: S.t });
    if (S.back.length > 12) S.back.shift();
    if (k === 'p') { S.tab = 'p'; S.p = +v; } if (k === 'h') { S.tab = 'h'; S.h = +v; } if (k === 't') { S.tab = 't'; S.t = +v; } if (k === 'q') S.tab = 'q'; };

  // ——— кусочки ———
  // ——— унифицированные блоки (v4): рамка с заголовком и источником, внутри — один из 4 типов ———
  const blk = (t, src, body, cls = '') => `<div class="sb-b ${cls}"><div class="sb-bh"><span>${t}</span>${src ? `<small>${src}</small>` : ''}</div>${body}</div>`;
  const tbl = rows => `<div class="sb-t">${rows.filter(Boolean).map(([k, v, c = '']) => `<div class="sb-tr"><span>${k}</span><b class="num ${c}">${v}</b></div>`).join('')}</div>`;
  const one = (v, cap, c = '') => `<div class="sb-1"><b class="num ${c}">${v}</b><span>${cap}</span></div>`;
  const two = (a, b) => `<div class="sb-2">${[a, b].map(([k, v, c = '']) => `<div><b class="num ${c}">${v}</b><span>${k}</span></div>`).join('')}</div>`;
  const spark = ser => { if (ser.length < 2) return ''; const mx = Math.max(...ser), mn = Math.min(...ser), W = 120, H = 32, X = i => (i / (ser.length - 1) * W).toFixed(1), Y = v => (H - 2 - (v - mn) / Math.max(1, mx - mn) * (H - 4)).toFixed(1);
    return `<svg class="sb-sp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="M${ser.map((v, i) => `${X(i)},${Y(v)}`).join(' L')}"/></svg>`; };
  const dyn = (v, cap, ser, c = '') => `<div class="sb-d">${one(v, cap, c)}${spark(ser)}</div>`;
  const SB = window.SB_DATA || { lp: {}, meta: {}, mu: {} }, PRE = window.WS2_PRE;
  const hh = x => { let v = 7; for (const ch of String(x)) v = (v * 31 + ch.charCodeAt(0)) >>> 0; return v; };
  const ROLE = ['', 'керри', 'мид', 'оффлейн', 'саппорт 4', 'саппорт 5'];
  const posOf = (m, p) => { const ps = m.players.filter(q => q.isRadiant === p.isRadiant).sort((a, b) => b.net_worth - a.net_worth), out = new Map(), cores = ps.slice(0, 3), free = [1, 2, 3];
    [2, 1, 3].forEach(r => { const c = cores.find(q => q.lane_role === r && !out.has(q)); if (c && free.includes(r)) { out.set(c, r); free.splice(free.indexOf(r), 1); } });
    cores.filter(q => !out.has(q)).forEach(q => out.set(q, free.shift())); ps.slice(3).forEach((q, i) => out.set(q, 4 + i)); return out.get(p) || 0; };
  // карты игрока на турнире до этой (настоящие, OpenDota — ../w-preview-2/_pre.js): [hero, win]
  const preMaps = (acc, before) => PRE ? PRE.maps.filter(m => m[1] < before).flatMap(m => { const x = m[5].find(q => q[0] === acc); return x ? [[x[1], x[2] === m[4]]] : []; }) : [];
  const lnk = (to, html, cls = '') => to ? `<button class="rz-a ${cls}" data-go="${to}">${html}</button>` : `<span class="${cls}">${html}</span>`;
  const himg = (id, cls = 'rz-hi') => `<img class="${cls}" src="${HERO(id).img}" alt="" loading="lazy">`;
  const tlogo = id => `<img class="rz-tl" src="${LOGO(id)}" alt="">`;
  const kv = (k, v, cls = '') => `<div class="rz-kv ${cls}"><b class="num">${v}</b><span>${k}</span></div>`;
  const sec = (t, body, aside = '') => blk(t, aside, body); // v4: все разделы — та же рамка блока

  // выбор внутри вкладки: две пятёрки героев · две команды
  const pick10 = (c, on, key) => { const side = r => c.m.players.filter(p => p.isRadiant === r).map(p => {
      const id = key === 'p' ? p.account_id : p.hero_id; return `<button class="rz-pk${on === id ? ' is-on' : ''}" data-go="${key}:${id}" title="${esc(HERO(p.hero_id).name)} · ${esc(nick(p))}">${himg(p.hero_id, '')}</button>`; }).join('');
    return `<div class="rz-pick"><span class="rz-pt">${tlogo(c.m.radiant_team_id)}</span>${side(true)}<i></i>${side(false)}<span class="rz-pt">${tlogo(c.m.dire_team_id)}</span></div>`; };

  // ——— Прогнозы ———
  function vQ(c) {
    const L = Q(c), all = L.reduce((n, q) => n + q.n, 0), hot = [...L].sort((a, b) => b.d / b.n - a.d / a.n)[0];
    const row = q => { const lead = Math.max(...q.o.map(o => o.v));
      return blk(esc(q.q), `${sp(q.n)} голосов`, `
        <div class="rz-bar">${q.o.map(o => `<i class="c-${o.c}${o.v === lead ? ' is-lead' : ''}" style="flex:${o.v}"></i>`).join('')}</div>
        <div class="rz-qo">${q.o.map(o => `<span class="${o.v === lead ? 'is-lead' : ''}">${lnk(o.go, `${o.h ? himg(o.h, 'rz-hs') : ''}${esc(o.t)}`, 'c-' + o.c)}<b class="num">${o.v}%</b><small class="num">${sp(Math.round(q.n * o.v / 100))}</small></span>`).join('')}</div>`, 'sb-q'); };
    return `<div class="sb-bs">${blk('Прогнозы на матч', 'пример', `<div class="sb-3">${[['голосов', sp(all)], ['прогнозов', L.length], ['за 5 мин', '+' + sp(L.reduce((n, q) => n + q.d, 0))]].map(([t, v], i) => `<div><b class="num${i === 2 ? ' up' : ''}">${v}</b><span>${t}</span></div>`).join('')}</div>`)}
      ${L.map(row).join('')}</div>`;
  }

  // ——— v25 (дирижёр 03.11: «прогнозы — ближе к визуалу „О матче“»): каждый вопрос — плитка как в превью (w-preview-2 v73): значок и вопрос, слева и справа варианты,
  // посередине плашка лидера — лого / герой и доля, ячейка — цветом его логотипа; полоса долей — лидер цветом. Классы и стили — из ../w-preview-2/_ws2.css (ws49-c, ws50, ws5-bar)
  const TC = window._sbTC || (window._sbTC = {});
  const tint = src => { if (!src || TC[src] !== undefined) return TC[src] || ''; TC[src] = ''; const im = new Image(); im.onload = () => { try { const cv = document.createElement('canvas'); cv.width = cv.height = 24; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, 24, 24);
      const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) { const R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B); if (d[i + 3] < 128 || mx - mn < 40 || mx < 60) continue; r += R; g += G; b += B; n++; }
      TC[src] = n > 8 ? `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})` : '#a1a1aa'; draw(); } catch (e) { TC[src] = '#a1a1aa'; } }; im.src = src; return ''; };
  const QI = { map: '<path d="M2.5 4l3.7-1.5 3.6 1.5 3.7-1.5v9.5l-3.7 1.5-3.6-1.5-3.7 1.5z M6.2 2.5v9.5 M9.8 4v9.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
    cup: '<path d="M5 2.5h6v3.5a3 3 0 0 1-6 0zM5 3.5H2.8c0 2 1 3 2.4 3.2M11 3.5h2.2c0 2-1 3-2.4 3.2M8 9v3M5.5 13.5h5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
    kill: '<path d="M3 3l6.5 6.5M13 3L6.5 9.5M2.5 10.5l3 3M13.5 10.5l-3 3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    q: '<circle cx="8" cy="8" r="5.8" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6.4 6.3a1.7 1.7 0 1 1 2.4 1.6c-.5.3-.8.6-.8 1.2M8 11.2v.1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' };
  function vQT(c) {
    const L = Q(c), all = L.reduce((n, q) => n + q.n, 0), d5 = L.reduce((n, q) => n + q.d, 0);
    const icn = q => /Map|карт/i.test(q.q) && /возьм/i.test(q.q) ? 'map' : /Счёт|казарм/i.test(q.q) ? 'cup' : /убий|Рошан|Kill/i.test(q.q) ? 'kill' : 'q';
    const tile = q => { const [a, b] = q.o, lead = a.v === b.v ? null : a.v > b.v ? a : b, side = lead === a ? 'a' : 'b';
      const lg = o => o.go && o.go.startsWith('t:') ? LOGO(+o.go.slice(2)) : '', col = lead ? tint(lg(lead)) || '#a1a1aa' : '';
      const ic = o => o.h ? `<img class="ws41-lg sb-qh" src="${HERO(o.h).img}" alt="">` : lg(o) ? `<img class="ws41-lg" src="${lg(o)}" alt="">` : '';
      const pill = lead ? `<em class="ws50 ${side}">${ic(lead) || `<span class="sb-qt-t">${esc(lead.t)}</span>`}<b class="num">${lead.v}%</b></em>` : `<em class="ws50 ws70"><b class="num">=\u202f50%</b></em>`;
      return `<div class="ws49-c sb-qt-c${lead ? ' is-' + side : ''}" style="--ta:${col};--tb:${col}"><div class="ws43-t"><span class="ws41-ic"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${QI[icn(q)]}</svg></span><small>${esc(q.q)}</small><small class="sb-qt-n num">${sp(q.n)}</small></div>
        <div class="ws43-v"><span class="sb-qt-o${lead === a ? ' is-best' : ''}"><b class="num">${a.v}%</b><small>${esc(a.t)}</small></span>${pill}<span class="sb-qt-o${lead === b ? ' is-best' : ''}"><small>${esc(b.t)}</small><b class="num">${b.v}%</b></span></div>
        <div class="ws5-bar"><i style="width:${a.v}%" class="${lead === a ? 'is-best' : ''}"></i><i class="${lead === b ? 'is-best' : ''}"></i></div></div>`; };
    return `<div class="ws5x ws5s--trn4 sb-qt"><div class="ws49-c sb-qt-sum"><div class="sb-3">${[['голосов', sp(all)], ['прогнозов', L.length], ['за 5 мин', '+' + sp(d5)]].map(([t, v], i) => `<div><b class="num${i === 2 ? ' up' : ''}">${v}</b><span>${t}</span></div>`).join('')}</div></div>${L.map(tile).join('')}</div>`;
  }

  // ——— Игрок (v4): live на карте · динамика · рейтинг за период · об игроке ———
  function vP(c) {
    const p = c.m.players.find(x => x.account_id === S.p) || c.m.players[0], s = stat(c.m, p, c.t), T0 = tid(c.m, p), info = D.players[p.account_id] || {}, lp = SB.lp[p.account_id] || {};
    const pos = posOf(c.m, p), k = Math.min(1, c.t / c.m.duration), mins = Math.max(1, c.t / 60);
    const nwSer = p.nw_t.slice(0, Math.floor(c.t / 60) + 1), when = `Map ${c.n} · ${c.live ? mmss(c.t) : 'итог'}`;
    const kda = `<span class="up">${s.K}</span> / <span class="dn">${s.D}</span> / ${s.A ?? '—'}`;
    const live = blk('Live', when, tbl([['У / С / П', kda], ['Уровень', c.live ? Math.max(1, Math.round(p.level * Math.sqrt(k))) : p.level], ['Состояние', sp(s.nw)], ['GPM', Math.round(s.nw / mins)],
        ['Добито / не отдано', `${Math.round(p.last_hits * k)} / ${Math.round(p.denies * k)}`]]) + (s.items.length ? `<div class="rz-items">${s.items.map(it => `<img src="${D.items[it].img}" alt="" title="${esc(D.items[it].name)}">`).join('')}</div>` : ''));
    const dynB = blk('Состояние по минутам', when, dyn(kk(s.nw), c.live ? 'сейчас' : 'к концу карты', nwSer));
    // рейтинг за период — ‼️ пример: формула рейтинга у начальника; число карт — настоящее (OpenDota, турнир до этой карты)
    const pm = preMaps(p.account_id, c.m.start_time), r = n => 38 + hh(p.account_id + n) % 55, R = { FRM: r('f'), FGT: r('g'), POOL: r('p'), SUR: r('s'), OBJ: r('o'), FORM: r('m') };
    const all = Math.round((R.FRM + R.FGT + R.POOL + R.SUR + R.OBJ + R.FORM) / 6), tone = v => v >= 75 ? 'up' : v < 50 ? 'dn' : '';
    const rate = blk('Рейтинг за период', `${pm.length} ${pl3(pm.length, 'карта', 'карты', 'карт')} турнира · пример`, `<div class="sb-r">${one(all, ROLE[pos] || 'игрок')}<div class="sb-r6">${[['Фарм', R.FRM], ['Драки', R.FGT], ['Пул героев', R.POOL], ['Выживание', R.SUR], ['Объекты', R.OBJ], ['Форма', R.FORM]].map(([t, v]) => `<div><b class="num ${tone(v)}">${v}</b><span>${t}</span></div>`).join('')}</div></div>`);
    const age = lp.birth ? Math.floor((Date.now() / 1000 - Date.parse(lp.birth) / 1000) / 31557600) : null;
    const about = blk('Об игроке', lp.page ? `<a class="sb-src" href="https://liquipedia.net/dota2/${encodeURIComponent(lp.page)}" target="_blank" rel="noopener">Liquipedia ↗</a>` : 'Liquipedia', tbl([lp.name && ['Имя', esc(lp.name)], age && ['Возраст', age + ' ' + pl3(age, 'год', 'года', 'лет')], (lp.country || info.country) && ['Страна', esc(lp.country || info.country)],
      ['Команда', lnk('t:' + T0, `${tlogo(T0)}<span>${esc(NM(T0))}</span>`)], ['Позиция', pos ? `${pos} · ${ROLE[pos]}` : '—'], lp.since && ['В команде с', esc(lp.since)]]));
    return pick10(c, p.account_id, 'p') + `<div class="rz-card">
        <img class="rz-av" src="${info.avatar || ''}" alt="" onerror="this.style.visibility='hidden'">
        <div class="rz-ct"><b>${esc(nick(p))}</b><span>${lnk('t:' + T0, `${tlogo(T0)}<span>${esc(NM(T0))}</span>`)}${pos ? ` · pos ${pos}` : ''}</span></div>
        ${lnk('h:' + p.hero_id, `${himg(p.hero_id, 'rz-hb')}<small>${esc(HERO(p.hero_id).name)}</small>`, 'rz-hero')}</div>
      <div class="sb-bs">${live}${dynB}${rate}${about}</div>`;
  }

  // ——— Герой (v4): игрок на герое · мета героя · сильнее / слабее против ———
  function vH(c) {
    const id = S.h || c.m.players[0].hero_id, h = HERO(id), p = c.m.players.find(x => x.hero_id === id), me = SB.meta[id] || {}, mu = SB.mu[id] || { up: [], dn: [] };
    const attr = { str: 'Сила', agi: 'Ловкость', int: 'Интеллект', all: 'Универсал' }[h.attr] || '';
    const hn = x => (D.heroes[x] || (PRE && PRE.heroes[x] ? { name: PRE.heroes[x][1], img: `img/heroes/${PRE.heroes[x][0]}.png` } : { name: '—', img: '' }));
    const onHero = p ? (() => { const L = preMaps(p.account_id, c.m.start_time).filter(x => x[0] === id), w = L.filter(x => x[1]).length;
      return blk(`${esc(nick(p))} на ${esc(h.name)}`, 'турнир до этой карты', L.length ? two([pl3(L.length, 'карта', 'карты', 'карт'), L.length], ['побед', Math.round(w / L.length * 100) + '%', w / L.length >= .5 ? 'up' : 'dn']) : '<div class="rz-none">На турнире на этом герое ещё не играл</div>'); })() : '';
    const meta = blk('Мета героя', 'OpenDota · про-матчи', two(['винрейт', me.wr != null ? me.wr + '%' : '—', me.wr >= 52 ? 'up' : me.wr < 48 ? 'dn' : ''], ['пиков · банов', me.pick != null ? `${sp(me.pick)} · ${sp(me.ban)}` : '—']));
    const vs = (L, up) => L.length ? tbl(L.map(([x, d, g]) => [`<span class="sb-hn"><img src="${hn(x).img}" alt="">${esc(hn(x).name)}</span>`, `<span class="${up ? 'up' : 'dn'}">${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)} п.</span> <small>${g} игр</small>`])) : '<div class="rz-none">Мало игр</div>';
    return (p ? pick10(c, id, 'h') : '') + `<div class="rz-card rz-card--h"><img class="rz-hw" src="${h.img}" alt="">
        <div class="rz-ct"><b>${esc(h.name)}</b><span>${attr}${h.roles ? ' · ' + h.roles.slice(0, 3).join(', ') : ''}</span></div></div>
      <div class="sb-bs">${onHero}${meta}${blk('Сильнее против', `винрейт против героя − обычный · ≥${SB.minG || 30} игр`, vs(mu.up, true))}${blk('Слабее против', 'OpenDota · про-матчи', vs(mu.dn, false))}</div>`;
  }

  // ——— Команда ———
  function vT(c) {
    const A = c.m.radiant_team_id, B = c.m.dire_team_id, id = S.t || A, rad = id === A, now = window.GS_NOW || c.m.start_time + c.t;
    const sw = `<div class="rz-seg2">${[A, B].map(x => `<button data-go="t:${x}" class="${x === id ? 'is-on' : ''}">${tlogo(x)}${esc(SH(x))}</button>`).join('')}</div>`;
    const pl = c.m.players.filter(p => p.isRadiant === rad), st = pl.map(p => stat(c.m, p, c.t)), en = c.m.players.filter(p => p.isRadiant !== rad).map(p => stat(c.m, p, c.t));
    const adv = (c.m.radiant_gold_adv[Math.min(Math.floor(c.t / 60), c.m.radiant_gold_adv.length - 1)] || 0) * (rad ? 1 : -1);
    const S2 = (T ? T.series : []).filter(s => (s.a === id || s.b === id) && s.start + s.maps.reduce((n, m) => n + m.dur, 0) < now && s.start < c.m.start_time - 3600);
    const res = S2.map(s => { const me = s.maps.filter(m => m.win === id).length, op = s.maps.length - me; return { o: s.a === id ? s.b : s.a, me, op, w: me > op }; });
    const sumK = st.reduce((n, s) => n + s.K, 0), sumE = en.reduce((n, s) => n + s.K, 0);
    return sw + sec(`Map ${c.n} · ${c.live ? 'на ' + mmss(c.t) : 'итог'}`, `<div class="rz-grid">${kv('убийства', `${sumK}:${sumE}`)}${kv('золото', (adv >= 0 ? '+' : '−') + kk(Math.abs(adv)), adv >= 0 ? 'up' : 'dn')}${kv('состояние', kk(st.reduce((n, s) => n + s.nw, 0)))}</div>
        <div class="rz-list">${pl.map((p, i) => `<div class="rz-li">${lnk('h:' + p.hero_id, himg(p.hero_id))}${lnk('p:' + p.account_id, `<span>${esc(nick(p))}</span>`)}<small class="num">${st[i].K}/${st[i].D}</small><b class="num">${kk(st[i].nw)}</b></div>`).join('')}</div>`)
      + sec('Турнир · серии', res.length ? `<div class="rz-grid">${kv('серии', `${res.filter(r => r.w).length}–${res.filter(r => !r.w).length}`)}${kv('карты', `${res.reduce((n, r) => n + r.me, 0)}–${res.reduce((n, r) => n + r.op, 0)}`)}</div>
        <div class="rz-list">${res.slice().reverse().map(r => `<div class="rz-li">${tlogo(r.o)}<span>${esc(NM(r.o))}</span><b class="num ${r.w ? 'up' : 'dn'}">${r.me}:${r.op}</b></div>`).join('')}</div>` : '<div class="rz-none">Серий до этого матча нет</div>');
  }

  // ——— v5–v6 (дирижёр 03.11: «нужна точка входа, базовое состояние; „назад“ всегда — непонятно; визуально другое») ———
  // SB_MODE 'nav' (v5): базовое состояние «Обзор» — список сущностей матча строками (прогноз-лидер, 2 команды, 10 игроков); строка → карточка сущности; «‹» — только в карточке, ведёт в «Обзор».
  // SB_MODE 'strip' (v6): без «назад» и вкладок — сверху полоса выбора (Прогнозы · лого и 5 героев · лого и 5 героев), ниже — выбранная сущность; по умолчанию Прогнозы.
  const MODE = window.SB_MODE || '';
  const CH = '<svg class="w-chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const row = (to, html) => `<button class="sb-row" data-go="${to}">${html}${CH}</button>`;
  function vHome(c) {
    const L = Q(c), q = L[0], lead = Math.max(...q.o.map(o => o.v)), A = c.m.radiant_team_id, B = c.m.dire_team_id;
    const adv = c.m.radiant_gold_adv[Math.min(Math.floor(c.t / 60), c.m.radiant_gold_adv.length - 1)] || 0;
    const kills = r => c.m.players.filter(p => p.isRadiant === r).reduce((n, p) => n + stat(c.m, p, c.t).K, 0);
    const team = (id, r) => row('t:' + id, `${tlogo(id)}<span class="sb-rn">${esc(NM(id))}</span><small class="num">${kills(r)} убийств</small><b class="num ${(r ? adv : -adv) > 0 ? 'up' : ''}">${(r ? adv : -adv) > 0 ? '+' + kk(Math.abs(adv)) : ''}</b>`);
    const players = r => c.m.players.filter(p => p.isRadiant === r).map(p => { const s = stat(c.m, p, c.t);
      return row('p:' + p.account_id, `${himg(p.hero_id)}<span class="sb-rn">${esc(nick(p))}</span><small class="num">${s.K}/${s.D}${s.A != null ? '/' + s.A : ''}</small><b class="num">${kk(s.nw)}</b>`); }).join('');
    return `<div class="sb-sec"><div class="sb-sl">Прогнозы</div>
        <div class="sb-qq"><span>${esc(q.q)}</span><div class="rz-bar">${q.o.map(o => `<i class="c-${o.c}${o.v === lead ? ' is-lead' : ''}" style="flex:${o.v}"></i>`).join('')}</div>
        <div class="sb-qv">${q.o.map(o => `<span class="${o.v === lead ? 'is-lead' : ''}">${esc(o.t)} <b class="num">${o.v}%</b></span>`).join('')}</div></div>
        ${row('q:', `<span class="sb-rn">Все прогнозы</span><small class="num">${L.length} · ${sp(L.reduce((n, x) => n + x.n, 0))} голосов</small>`)}</div>
      <div class="sb-sec"><div class="sb-sl">Команды</div>${team(A, true)}${team(B, false)}</div>
      <div class="sb-sec"><div class="sb-sl">${tlogo(A)}${esc(SH(A))}</div>${players(true)}</div>
      <div class="sb-sec"><div class="sb-sl">${tlogo(B)}${esc(SH(B))}</div>${players(false)}</div>`;
  }
  // v7: в полосе подсвечен и игрок, когда открыт его герой; под полосой у выбранного — переключатель «Игрок · Герой»
  const V7 = window.SB_V7;
  const strip = c => { const on = k => (S.tab === k[0] && (k[0] === 'q' || (k[0] === 'p' && S.p === k[1]) || (k[0] === 't' && S.t === k[1])))
      || (V7 && k[0] === 'p' && S.tab === 'h' && (c.m.players.find(p => p.account_id === k[1]) || {}).hero_id === S.h);
    // v8 (дирижёр 03.11: «выбор подсвечиваем по кругу; переключатель игрок-герой меняет аватарку»): в режиме «Игрок» в полосе — фото игроков кружками, в «Герой» — герои; выбранный — кольцом
    const V8 = window.SB_V8, heroMode = S.tab === 'h', av = p => (D.players[p.account_id] || {}).avatar;
    // v30 (дирижёр 03.11): в кружке — и игрок, и герой (переворот карточкой), в углу маленький значок второго; режим — классом .sb-hm на корне, сегмент и все кружки переключаются вместе с анимацией
    const faceX = p => `<span class="sb-fc"><span class="sb-fc-f">${av(p) ? `<img src="${av(p)}" alt="">` : `<span class="sb-ini">${esc(nick(p).slice(0, 2))}</span>`}</span><span class="sb-fc-b">${himg(p.hero_id, '')}</span></span><span class="sb-bd"><span class="sb-bd-f">${himg(p.hero_id, '')}</span><span class="sb-bd-b">${av(p) ? `<img src="${av(p)}" alt="">` : `<span class="sb-ini">${esc(nick(p).slice(0, 2))}</span>`}</span></span>`;
    const face = p => window.SB_QT5 ? faceX(p) : V8 && !heroMode ? (av(p) ? `<img src="${av(p)}" alt="">` : `<span class="sb-ini">${esc(nick(p).slice(0, 2))}</span>`) : himg(p.hero_id, '');
    const side = r => c.m.players.filter(p => p.isRadiant === r).map(p => `<button class="sb-st${on(['p', p.account_id]) ? ' is-on' : ''}" data-go="${V8 && heroMode ? 'h:' + p.hero_id : 'p:' + p.account_id}" title="${esc(nick(p))} · ${esc(HERO(p.hero_id).name)}">${face(p)}</button>`).join('');
    const tb = id => `<button class="sb-st sb-st--t${on(['t', id]) ? ' is-on' : ''}" data-go="t:${id}" title="${esc(NM(id))}">${tlogo(id)}</button>`;
    const sel = S.tab === 'p' ? c.m.players.find(p => p.account_id === S.p) : S.tab === 'h' ? c.m.players.find(p => p.hero_id === S.h) : null;
    const qb = `<button class="sb-st sb-st--q${S.tab === 'q' ? ' is-on' : ''}" data-go="q:" title="Прогнозы"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 13V8M8 13V3M13 13V6"/></svg></button>`;
    // v10–v12 (дирижёр 03.11: «переключатель игрок / герой — возле аватарки, не в шапке; у команды его нет»): SB_TOG
    //  av — аватар и есть переключатель: фото игрока, на нём кружок героя; нажал на кружок — меняются местами
    //  seg — у имени маленький сегмент «Игрок · Герой», как сортировка в «Участниках»
    //  chips — две плашки рядом: [фото · ник] [герой · имя]; включённая — светлая
    const TG = window.SB_TOG, kda9 = p => { const st = stat(c.m, p, c.t); return `<span class="sb-tog-k"><b class="num"><i class="up">${st.K}</i> <i class="dn">${st.D}</i> <i>${st.A ?? '—'}</i></b><small class="num">${kk(st.nw)}</small></span>`; };
    const ph = p => av(p) ? `<img src="${av(p)}" alt="">` : `<span class="sb-ini">${esc(nick(p).slice(0, 2))}</span>`;
    const teamRow = S.tab === 't' ? `<div class="sb-tog sb-tog--t">${tlogo(S.t)}<b>${esc(NM(S.t))}</b></div>` : S.tab === 'q' ? `<div class="sb-tog sb-tog--t"><b>Прогнозы на матч</b></div>` : '';
    if (TG && !sel) return `<div class="sb-strip sb-strip--2">${qb}${tb(c.m.radiant_team_id)}${side(true)}${tb(c.m.dire_team_id)}${side(false)}</div>${teamRow}`;
    if (TG === 'av') { const hr = heroMode;
      const big = hr ? himg(sel.hero_id, '') : ph(sel), small = hr ? ph(sel) : himg(sel.hero_id, '');
      return `<div class="sb-strip sb-strip--2">${qb}${tb(c.m.radiant_team_id)}${side(true)}${tb(c.m.dire_team_id)}${side(false)}</div>
        <div class="sb-tog sb-tog--av"><span class="sb-av2"><span class="sb-av2-b">${big}</span><button class="sb-av2-s" data-go="${hr ? 'p:' + sel.account_id : 'h:' + sel.hero_id}" title="${hr ? 'Показать игрока' : 'Показать героя'}">${small}<i><svg viewBox="0 0 12 12" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5h7.5L7.5 2.5M10 7.5H2.5l2 2"/></svg></i></button></span>
          <span class="sb-tog-tx"><b>${hr ? esc(HERO(sel.hero_id).name) : esc(nick(sel))}</b><small>${hr ? esc(nick(sel)) : esc(HERO(sel.hero_id).name)}</small></span>${kda9(sel)}</div>`; }
    if (TG === 'seg') return `<div class="sb-strip sb-strip--2">${qb}${tb(c.m.radiant_team_id)}${side(true)}${tb(c.m.dire_team_id)}${side(false)}</div>
        <div class="sb-tog sb-tog--seg"><span class="sb-tog-av1">${heroMode ? himg(sel.hero_id, '') : ph(sel)}</span><span class="sb-tog-tx"><b>${esc(nick(sel))}</b>
          <span class="sb-mseg"><button data-go="p:${sel.account_id}" class="${!heroMode ? 'is-on' : ''}">Игрок</button><button data-go="h:${sel.hero_id}" class="${heroMode ? 'is-on' : ''}">${esc(HERO(sel.hero_id).name)}</button></span></span>${kda9(sel)}</div>`;
    if (TG === 'chips') return `<div class="sb-strip sb-strip--2">${qb}${tb(c.m.radiant_team_id)}${side(true)}${tb(c.m.dire_team_id)}${side(false)}</div>
        <div class="sb-tog sb-tog--ch">${window.SB_QT2 ? '<span class="sb-sg">' : ''}<button class="sb-chp${!heroMode ? ' is-on' : ''}" data-go="p:${sel.account_id}"><span class="sb-chp-i">${ph(sel)}</span><span><b>${esc(nick(sel))}</b>${window.SB_QT3 ? '<svg class="sb-sg-ic" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="6" cy="4" r="2.2"/><path d="M2 10.5c.6-2 2.1-3 4-3s3.4 1 4 3"/></svg>' : '<small>игрок</small>'}</span></button>
          <button class="sb-chp${heroMode ? ' is-on' : ''}" data-go="h:${sel.hero_id}"><span class="sb-chp-i sb-chp-i--h">${himg(sel.hero_id, '')}</span><span><b>${esc(HERO(sel.hero_id).name)}</b>${window.SB_QT3 ? '<svg class="sb-sg-ic" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L5 7M10 2H7.8M10 2v2.2M3.2 6.6l2.2 2.2M4.3 7.7L2.2 9.8"/></svg>' : '<small>герой</small>'}</span></button>${window.SB_QT2 ? '</span>' : ''}</div>`;
    const tog = V7 && sel ? `<div class="sb-tog"><span class="sb-tog-n">${V8 ? `<span class="sb-tog-h sb-tog-av">${heroMode ? himg(sel.hero_id, '') : av(sel) ? `<img src="${av(sel)}" alt="">` : `<span class="sb-ini">${esc(nick(sel).slice(0, 2))}</span>`}</span>` : himg(sel.hero_id, 'sb-tog-h')}<b>${esc(nick(sel))}</b><small>${esc(HERO(sel.hero_id).name)}</small></span>${window.SB_V9 ? (() => { const st = stat(c.m, sel, c.t); return `<span class="sb-tog-k"><b class="num"><i class="up">${st.K}</i> <i class="dn">${st.D}</i> <i>${st.A ?? '—'}</i></b><small class="num">${kk(st.nw)}</small></span>`; })() : ''}${window.SB_V9 ? '' : `<span class="sb-seg"><button data-go="p:${sel.account_id}" class="${S.tab === 'p' ? 'is-on' : ''}">Игрок</button><button data-go="h:${sel.hero_id}" class="${S.tab === 'h' ? 'is-on' : ''}">Герой</button></span>`}</div>` : '';
    // v7: полоса не влезала в колонку (выбранный уходил за край) — две строки, по команде на строку; прогнозы — слева на обе строки
    if (V7) return `<div class="sb-strip sb-strip--2">${qb}${tb(c.m.radiant_team_id)}${side(true)}${tb(c.m.dire_team_id)}${side(false)}</div>${tog}`;
    return `<div class="sb-strip">${qb}<i></i>${tb(c.m.radiant_team_id)}${side(true)}<i></i>${tb(c.m.dire_team_id)}${side(false)}</div>${tog}`; };
  const title = c => S.tab === 'q' ? 'Прогнозы' : S.tab === 't' ? esc(NM(S.t)) : S.tab === 'h' ? esc(HERO(S.h).name) : esc(nick(c.m.players.find(p => p.account_id === S.p) || c.m.players[0]));

  // ——— v23–v24 (дирижёр 03.11: «всё единообразно; размер виджета не прыгает — всегда один, внутри скролл») ———
  // У любой сущности — одни и те же 4 места в одном порядке: «Сейчас» · «Динамика» · «Турнир» · «Справка».
  // SB_UNI 'slots' — в местах разные типы блоков (таблица, линия, два числа); 'table' — везде только таблица «подпись — значение» (самый единообразный).
  const UNI = window.SB_UNI;
  function vUni(c) {
    const T = UNI === 'table', when = `Map ${c.n} · ${c.live ? mmss(c.t) : 'итог'}`, mins = Math.max(1, c.t / 60), k = Math.min(1, c.t / c.m.duration);
    const S4 = (now, dyn0, tour, ref) => `<div class="sb-bs">${blk('Сейчас', when, tbl(now))}${blk('Динамика', dyn0.src, T ? tbl(dyn0.rows) : dyn(dyn0.v, dyn0.cap, dyn0.ser, dyn0.c))}${blk('Турнир', tour.src, T || !tour.pair ? tbl(tour.rows) : two(...tour.pair) + (tour.rows.length ? tbl(tour.rows) : ''))}${ref ? blk('Справка', ref.src, tbl(ref.rows)) : ''}</div>`;
    const hn = x => (D.heroes[x] || (PRE && PRE.heroes[x] ? { name: PRE.heroes[x][1], img: `img/heroes/${PRE.heroes[x][0]}.png` } : { name: '—', img: '' }));
    if (S.tab === 'p' || S.tab === 'h') {
      const p = S.tab === 'p' ? (c.m.players.find(x => x.account_id === S.p) || c.m.players[0]) : (c.m.players.find(x => x.hero_id === S.h) || c.m.players[0]), s = stat(c.m, p, c.t), pos = posOf(c.m, p);
      const ser = p.nw_t.slice(0, Math.floor(c.t / 60) + 1), kda = `<span class="up">${s.K}</span> / <span class="dn">${s.D}</span> / ${s.A ?? '—'}`;
      const nowR = [['У / С / П', kda], ['Состояние', sp(s.nw)], ['GPM', Math.round(s.nw / mins)], ['Добито / не отдано', `${Math.round(p.last_hits * k)} / ${Math.round(p.denies * k)}`]];
      const dyn0 = { src: when, v: kk(s.nw), cap: 'состояние сейчас', ser, rows: [['Состояние сейчас', kk(s.nw)], ['10 минут назад', kk(ser[Math.max(0, ser.length - 11)] || 0)], ['Прирост за 10 мин', '+' + kk(Math.max(0, s.nw - (ser[Math.max(0, ser.length - 11)] || 0))), 'up']] };
      const pm = preMaps(p.account_id, c.m.start_time);
      if (S.tab === 'p') { const w = pm.filter(x => x[1]).length, lp = SB.lp[p.account_id] || {}, info = D.players[p.account_id] || {}, age = lp.birth ? Math.floor((Date.now() - Date.parse(lp.birth)) / 31557600000) : null;
        const tour = { src: 'до этой карты', pair: [[pl3(pm.length, 'карта', 'карты', 'карт'), pm.length], ['побед', pm.length ? Math.round(w / pm.length * 100) + '%' : '—', pm.length && w / pm.length >= .5 ? 'up' : 'dn']], rows: T ? [['Карт', pm.length], ['Побед', pm.length ? Math.round(w / pm.length * 100) + '%' : '—']] : [] };
        const ref = { src: 'Liquipedia', rows: [lp.name && ['Имя', esc(lp.name)], age && ['Возраст', age + ' ' + pl3(age, 'год', 'года', 'лет')], (lp.country || info.country) && ['Страна', esc(lp.country || info.country)], ['Позиция', pos ? `${pos} · ${ROLE[pos]}` : '—']] };
        return S4(nowR, dyn0, tour, ref); }
      const id = p.hero_id, me = SB.meta[id] || {}, mu = SB.mu[id] || { up: [], dn: [] }, L = pm.filter(x => x[0] === id), w = L.filter(x => x[1]).length;
      const tour = { src: `${esc(nick(p))} на герое · турнир`, pair: [[pl3(L.length, 'карта', 'карты', 'карт'), L.length], ['побед', L.length ? Math.round(w / L.length * 100) + '%' : '—']], rows: (T ? [['Карт на герое', L.length], ['Побед', L.length ? Math.round(w / L.length * 100) + '%' : '—']] : []).concat([['Винрейт героя · про', me.wr != null ? me.wr + '%' : '—'], ['Пиков · банов · про', me.pick != null ? `${sp(me.pick)} · ${sp(me.ban)}` : '—']]) };
      const vs = (x, up) => [`<span class="sb-hn"><img src="${hn(x[0]).img}" alt="">${esc(hn(x[0]).name)}</span>`, `<span class="${up ? 'up' : 'dn'}">${up ? '+' : '−'}${Math.abs(x[1]).toFixed(1)} п.</span>`];
      const ref = { src: 'сильнее ▲ · слабее ▼ · про-матчи', rows: [...mu.up.slice(0, 2).map(x => vs(x, true)), ...mu.dn.slice(0, 2).map(x => vs(x, false))] };
      return S4(nowR, dyn0, tour, ref);
    }
    if (S.tab === 't') { const id = S.t, rad = id === c.m.radiant_team_id, pl = c.m.players.filter(p => p.isRadiant === rad), st = pl.map(p => stat(c.m, p, c.t)), en = c.m.players.filter(p => p.isRadiant !== rad).map(p => stat(c.m, p, c.t));
      const advS = c.m.radiant_gold_adv.slice(0, Math.floor(c.t / 60) + 1).map(v => rad ? v : -v), adv = advS[advS.length - 1] || 0;
      const nowR = [['Убийства', `${st.reduce((n, x) => n + x.K, 0)} : ${en.reduce((n, x) => n + x.K, 0)}`], ['Перевес золота', `<span class="${adv >= 0 ? 'up' : 'dn'}">${adv >= 0 ? '+' : '−'}${kk(Math.abs(adv))}</span>`], ['Состояние команды', kk(st.reduce((n, x) => n + x.nw, 0))]];
      const dyn0 = { src: when, v: (adv >= 0 ? '+' : '−') + kk(Math.abs(adv)), cap: 'перевес золота', ser: advS, c: adv >= 0 ? 'up' : 'dn', rows: [['Перевес сейчас', (adv >= 0 ? '+' : '−') + kk(Math.abs(adv))], ['Лучший момент', '+' + kk(Math.max(0, ...advS))], ['Худший момент', '−' + kk(Math.abs(Math.min(0, ...advS)))]] };
      const now0 = window.GS_NOW || c.m.start_time + c.t, S2 = (window.GS_TOURNAMENT ? window.GS_TOURNAMENT.series : []).filter(s => (s.a === id || s.b === id) && s.start < c.m.start_time - 3600);
      const res = S2.map(s => { const me = s.maps.filter(m => m.win === id).length; return { w: me > s.maps.length - me, me, op: s.maps.length - me }; });
      const tour = { src: 'серии до матча', pair: [['серии', `${res.filter(r => r.w).length}–${res.filter(r => !r.w).length}`], ['карты', `${res.reduce((n, r) => n + r.me, 0)}–${res.reduce((n, r) => n + r.op, 0)}`]], rows: T ? [['Серии', `${res.filter(r => r.w).length}–${res.filter(r => !r.w).length}`], ['Карты', `${res.reduce((n, r) => n + r.me, 0)}–${res.reduce((n, r) => n + r.op, 0)}`]] : [] };
      const ref = { src: 'состав', rows: pl.map((p, i) => [`<span class="sb-hn"><img src="${HERO(p.hero_id).img}" alt="">${esc(nick(p))}</span>`, `${st[i].K}/${st[i].D} · ${kk(st[i].nw)}`]) };
      return S4(nowR, dyn0, tour, ref); }
    // прогнозы
    const L = Q(c), all = L.reduce((n, q) => n + q.n, 0), d5 = L.reduce((n, q) => n + q.d, 0), ser = Array.from({ length: 12 }, (_, i) => Math.round(all * (0.55 + i * 0.04) + (hh('q' + i) % 900)));
    const nowR = [['Голосов', sp(all)], ['Прогнозов', L.length], ['За 5 минут', `<span class="up">+${sp(d5)}</span>`]];
    const dyn0 = { src: 'голоса · пример', v: sp(all), cap: 'голосов за матч', ser, rows: [['Голосов сейчас', sp(all)], ['За 5 минут', '+' + sp(d5), 'up'], ['Быстрее всего растёт', esc([...L].sort((a, b) => b.d / b.n - a.d / a.n)[0].q)]] };
    const lead = q => q.o.reduce((a, b) => (b.v > a.v ? b : a));
    const tour = { src: 'лидер по каждому вопросу', rows: L.map(q => [esc(q.q), `${esc(lead(q).t)} · <b>${lead(q).v}%</b>`]) };
    return S4(nowR, dyn0, tour, null);
  }

  // ——— рисуем ———
  const TABS = [['q', 'Прогнозы'], ['p', 'Игрок'], ['h', 'Герой'], ['t', 'Команда']];
  const SB_ICOL = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2 6 4.5 8.5 2M3.5 10 6 7.5 8.5 10"/></svg>';
  const SB_IEXP = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 4.5 6 2 8.5 4.5M3.5 7.5 6 10 8.5 7.5"/></svg>';
  function draw() {
    if (!host || !M) return; const c = cur(), box = host.querySelector('.rz-body'), y = box ? box.scrollTop : 0, same = host.dataset.tab === S.tab;
    if (S.p == null) S.p = (c.m.players.find(p => p.isRadiant) || c.m.players[0]).account_id;
    if (S.h == null) S.h = c.m.players[0].hero_id; if (S.t == null) S.t = c.m.radiant_team_id;
    if (MODE === 'nav' && !S.init) { S.tab = 'home'; S.init = true; } // один раз за жизнь страницы — перерисовки по ходу карты состояние не сбрасывают
    const liveChip = c.live ? `<span class="rz-live"><i></i>Map ${c.n} · ${mmss(c.t)}</span>` : `<span class="rz-live is-off">Map ${c.n}</span>`;
    const BK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>';
    if (MODE === 'nav') { const home = S.tab === 'home';
      host.innerHTML = `<div class="w rz sb sb--flat"><div class="w-hd rz-hd">${home ? '<span class="w-hd__t">Разбор</span>' : `<button class="sb-bk" data-home>${BK}<span>Разбор</span></button><span class="sb-tt">${title(c)}</span>`}${liveChip}</div>
        <div class="rz-body sb-body">${home ? vHome(c) : { q: vQ, p: vP, h: vH, t: vT }[S.tab](c)}</div></div>`;
      host.dataset.tab = S.tab; const nb = host.querySelector('.rz-body'); if (same) nb.scrollTop = y; return; }
    if (MODE === 'strip') {
      // v9 (дирижёр 03.11: «визуал как „Участники“ — переключатели маленькие, плотно, больше иконок»): «Игрок · Герой» — значками в шапке (белый — включён), live — точкой со временем
      const V9 = window.SB_V9, sel9 = S.tab === 'p' ? c.m.players.find(p => p.account_id === S.p) : S.tab === 'h' ? c.m.players.find(p => p.hero_id === S.h) : null;
      const IC_P = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5.5" r="2.8"/><path d="M2.8 13.5c.8-2.6 2.9-4 5.2-4s4.4 1.4 5.2 4" stroke-linecap="round"/></svg>';
      const IC_H = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 2 3 4v4c0 3 2.2 5.2 5 6 2.8-.8 5-3 5-6V4z"/><path d="M8 5v6M5.8 7.5h4.4" stroke-linecap="round"/></svg>';
      const icSeg = V9 && sel9 && !window.SB_TOG ? `<span class="sb-ic"><button data-go="p:${sel9.account_id}" class="${S.tab === 'p' ? 'is-on' : ''}" title="Игрок">${IC_P}</button><button data-go="h:${sel9.hero_id}" class="${S.tab === 'h' ? 'is-on' : ''}" title="Герой">${IC_H}</button></span>` : '';
      host.innerHTML = `<div class="w rz sb sb--flat${V7 ? ' sb--v7' : ''}${window.SB_V8 ? ' sb--v8' : ''}${V9 ? ' sb--v9' : ''}${UNI || window.SB_QTC ? ' sb--uni sb--qt' : ''}${window.SB_QT2 ? ' sb--qt2' : ''}${window.SB_QT3 ? ' sb--qt3' : ''}${window.SB_QT4 ? ' sb--qt4' : ''}${window.SB_QT6 ? ' sb--qt6' : ''}${window.SB_QT7 ? ' sb--qt7' : ''}${window.SB_QT8 ? ' sb--qt8' : ''}${window.SB_QT10 ? ' sb--qt10' : ''}${window.SB_QT11 ? ' sb--qt11' : ''}${window.SB_QT9 ? ' sb--qt9' + (window._sbC ? ' sb-c' : '') : ''}${window.SB_QT5 ? ' sb--qt5' + (window._sbHM ? ' sb-hm' : '') : ''}"><div class="w-hd rz-hd"><span class="w-hd__t">Разбор</span>${V9 ? `<span class="sb-hdr">${liveChip}${icSeg}</span>` : liveChip}</div>${strip(c)}
        <div class="rz-body sb-body">${window.SB_QT && S.tab === 'q' ? vQT(c) : UNI ? vUni(c) : { q: vQ, p: vP, h: vH, t: vT }[S.tab](c)}</div></div>`;
      if (window.SB_QT8) { const rt = host.querySelector('.sb'), bd = host.querySelector('.rz-body'), upd = () => { rt.classList.toggle('sb-more', bd.scrollHeight - bd.clientHeight - bd.scrollTop > 2);
          if (window.SB_QT9) { rt.style.setProperty('--sb-bt', bd.offsetTop + 'px'); rt.classList.toggle('sb-top', bd.scrollTop > 2); }
          // v37 (дирижёр 06.11, как новости w-match-news v26): SB_FADEP — размытие 20, сила края плавно растёт за первые 32 px от границы; у верхней границы верхнего нет, у нижней — нижнего
          if (window.SB_FADEP) { const c = (v) => Math.max(0, Math.min(1, v / 32)).toFixed(2); rt.classList.add('sb--fadep'); rt.style.setProperty('--sb-to', c(bd.scrollTop - (window.SB_FADEP_LATE || 0))); rt.style.setProperty('--sb-bo', c(bd.scrollHeight - bd.clientHeight - bd.scrollTop - (window.SB_FADEP_LATE || 0))) } };
        bd.addEventListener('scroll', upd, { passive: true }); requestAnimationFrame(upd); }
      // v34 (дирижёр 03.11): свернуть / развернуть — значок в правом нижнем углу, как у соседей справа (widget-expand, WX_POS = 'peek2'); свёрнут — шапка, полоса и строка под ней
      if (window.SB_QT9) { const rt = host.querySelector('.sb'), b = document.createElement('button'), op = !window._sbC;
        b.className = 'wx-ic wx-fl2 sb-cb'; b.innerHTML = op ? SB_ICOL : SB_IEXP; b.dataset.tip = op ? 'Свернуть' : 'Развернуть'; b.setAttribute('aria-label', b.dataset.tip); rt.append(b);
        // v35 (дирижёр 03.11: «развёрнутый — тянется», как ручка чата widget-promo/_disc.js v45–v46): точки по центру нижней полосы, тянешь — высота 320–900, помним в _sbH
        if (window.SB_QT10 && op) { if (window._sbH) rt.style.height = window._sbH + 'px'; const g = document.createElement('div'); g.className = 'sb-gr'; g.innerHTML = '<button class="ch-grip ch-grip--dots" aria-label="Потянуть — высота">' + '<i></i>'.repeat(6) + '</button>'; rt.append(g);
          g.firstChild.onpointerdown = e => { e.preventDefault(); const y0 = e.clientY, h0 = rt.offsetHeight;
            const mv = ev => { window._sbH = Math.max(320, Math.min(900, h0 + ev.clientY - y0)); const r = host.querySelector('.sb'); if (r) r.style.height = window._sbH + 'px'; };
            const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); document.body.classList.remove('ch-drag'); };
            document.body.classList.add('ch-drag'); addEventListener('pointermove', mv); addEventListener('pointerup', up); }; }
        b.onclick = e => { e.stopPropagation(); if (window.SB_QT11) host = rt.parentElement; /* v36: кнопка — у своего виджета (на странице их бывает два) */ const h0 = rt.offsetHeight; window._sbC = !window._sbC; draw(); const r2 = host.querySelector('.sb'), h1 = r2.offsetHeight;
          r2.style.height = h0 + 'px'; r2.offsetHeight; r2.style.transition = 'height .28s cubic-bezier(.2,.7,.2,1)'; r2.style.height = h1 + 'px';
          setTimeout(() => { const r3 = host.querySelector('.sb'); if (r3) { r3.style.transition = ''; r3.style.height = !window._sbC && window.SB_QT10 && window._sbH ? window._sbH + 'px' : ''; } }, 300); }; }
      if (window.SB_QT5) { const hm = S.tab === 'h', rt = host.querySelector('.sb'); if (!!window._sbHM !== hm) { window._sbHM = hm; rt.offsetWidth; requestAnimationFrame(() => rt.classList.toggle('sb-hm', hm)); } }
      host.dataset.tab = S.tab; const nb = host.querySelector('.rz-body'); if (same) nb.scrollTop = y; return; }
    host.innerHTML = `<div class="w rz sb"><div class="w-hd rz-hd">${S.back.length ? '<button class="rz-back" data-back aria-label="Назад"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg></button>' : ''}<span class="w-hd__t">Разбор</span>${c.live ? `<span class="rz-live"><i></i>Map ${c.n} · ${mmss(c.t)}</span>` : `<span class="rz-live is-off">Map ${c.n}</span>`}</div>
      <div class="rz-tabs" role="tablist">${TABS.map(([k, n]) => `<button role="tab" data-go="${k}:" class="${S.tab === k ? 'is-on' : ''}">${n}</button>`).join('')}</div>
      <div class="rz-body sb-body">${{ q: vQ, p: vP, h: vH, t: vT }[S.tab](c)}</div></div>`;
    host.dataset.tab = S.tab; const nb = host.querySelector('.rz-body'); if (same) nb.scrollTop = y;
  }
  document.addEventListener('click', e => {
    if (window.SB_QT11) { const hh = e.target.closest('.rz-host'); if (hh) host = hh } // v36: клик — в тот «Разбор», где нажали
    if (!host) return;
    if (host.contains(e.target)) {
      if (e.target.closest('[data-home]')) { S.tab = 'home'; S.back = []; return draw(); }
      const b = e.target.closest('[data-back]'); if (b) { const s = S.back.pop(); if (s) Object.assign(S, s); return draw(); }
      const g = e.target.closest('[data-go]'); if (!g) return; const v = g.dataset.go, [k] = v.split(':');
      if (window.SB_QT11) window._sbC = false; // v36: любой выбор в свёрнутом — разворачивает (и нажатие на текущую вкладку)
      if (v.endsWith(':')) { if (S.tab !== k) go(k + ':'); } else go(v); return draw();
    }
    // герой в пиках под графиком (data-hc / data-v = «match|account») → «Игрок»
    if (window.SB_XFER) return; // v13+: обычный клик — ссылки страницы, в «Разбор» переносим иначе
    const h = e.target.closest('.d3-h[data-hc], .d3-h[data-v]'); if (!h) return;
    const acc = +((h.dataset.hc || h.dataset.v || '').split('|')[1]); if (!acc) return;
    go('p:' + acc); draw(); host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  // v7 (дирижёр 03.11: «клик по команде хотя бы переводил эту штуку»): клик по команде на странице (шапка матча, карточки статистики, составы) — «Разбор» открывает команду, а не уходит со страницы
  if (window.SB_V7 && !window.SB_XFER) document.addEventListener('click', e => {
    if (!host || !M || host.contains(e.target)) return;
    const el = e.target.closest('.h3-t, .ws7-hd, .ws28-t'); if (!el) return;
    const c = cur(), A = c.m.radiant_team_id, B = c.m.dire_team_id, im = el.querySelector('img'), mm = im && /(\d+)\.png/.exec(im.getAttribute('src') || '');
    const id = mm && [A, B].includes(+mm[1]) ? +mm[1] : el.classList.contains('h3-t--b') ? B : el.classList.contains('h3-t') ? A : null; if (!id) return;
    e.preventDefault(); e.stopPropagation(); go('t:' + id); draw(); host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, true);
  // ——— v13–v16 (дирижёр 03.11: «по клику должны открываться ссылки; перенос в „Разбор“ — как доп-меню»): SB_XFER ———
  //  hold — задержал мышь на игроке / команде: у курсора заполняется кружок (0,7 с) → переносится в «Разбор»
  //  key — при наведении подсказка «⌥ + клик — в Разбор»; Alt / Option + клик переносит (обычный клик — ссылка)
  //  btn — при наведении у элемента появляется маленькая кнопка «в Разбор»
  //  drag — игрока / команду можно перетащить на «Разбор»
  //  v17 space — при наведении подсказка «Пробел — в Разбор», нажал пробел (страница не прокручивается) — переносится; клик — ссылка
  //  v18 hold 3 с (дирижёр: «задержать подлиннее, секунды 3») · v19 menu — правый клик: своё маленькое меню «Открыть в Разборе · Открыть страницу»
  const XF = window.SB_XFER, HOLD = window.SB_HOLD || 700;
  // v21 (дирижёр 03.11: «задержание со значком i и правый клик — вместе»): SB_XFER 'both'
  const HOLDON = XF === 'hold' || XF === 'both', MENUON = XF === 'menu' || XF === 'both';
  if (XF) {
    document.documentElement.classList.add('sb-xf'); // подписи команд на графике «прозрачны» для мыши (pointer-events: none) — в режиме переноса их название и лого ловят наведение
    const target = el => { if (!el || !M || (host && host.contains(el))) return null; const c = cur();
      const h = el.closest('.d3-h[data-hc], .d3-h[data-v]'); if (h) { const acc = +((h.dataset.hc || h.dataset.v || '').split('|')[1]); const p = c.m.players.find(x => x.account_id === acc); return p ? { to: 'p:' + acc, el: h, name: nick(p) } : null; }
      // вкладка «Превью»: строки составов (w-preview-2, data-sbp — игрок) — тоже цель
      const pr = el.closest('[data-sbp]'); if (pr) { const acc = +pr.dataset.sbp, p = c.m.players.find(x => x.account_id === acc); return p ? { to: 'p:' + acc, el: pr, name: nick(p) } : null; }
      const t = el.closest('.h3-t'); if (t) { const id = t.classList.contains('h3-t--b') ? c.m.dire_team_id : c.m.radiant_team_id; return { to: 't:' + id, el: t, name: NM(id) }; }
      // v22 (дирижёр 03.11: «на название команды навёл — тоже так же»): любое название / лого команды этого матча на странице — по тексту или лого
      if (window.SB_ANYTEAM) { const ids = [c.m.radiant_team_id, c.m.dire_team_id], nm = id => [NM(id), SH(id), (D.teams[id] || {}).name, (D.teams[id] || {}).tag].filter(Boolean).map(x => x.trim().toLowerCase());
        let n = el; for (let k = 0; n && k < 3; k++, n = n.parentElement) { if (n.closest && n.closest('.rz-host')) return null;
          const tx = (n.textContent || '').trim().toLowerCase(), im = n.tagName === 'IMG' ? n : null, mm = im && /teams\/c?(\d+)\.png/.exec(im.getAttribute('src') || '');
          const id = mm && ids.includes(+mm[1]) ? +mm[1] : ids.find(i => tx && tx.length < 40 && nm(i).includes(tx)); if (id) return { to: 't:' + id, el: n, name: NM(id) }; } }
      return null; };
    const send = x => { go(x.to); draw(); if (!host) return; host.classList.remove('sb-flash'); void host.offsetWidth; host.classList.add('sb-flash'); host.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    const fl = document.createElement('div'); fl.className = 'sb-fl'; document.body.append(fl);
    let cur0 = null, tm = 0, lx = 0, ly = 0;
    const menuOpen = () => fl.classList.contains('sb-fl--menu');
    const place = (x, y) => { fl.style.left = x + 'px'; fl.style.top = y + 'px'; };
    const hide = () => { clearTimeout(tm); fl.className = 'sb-fl'; fl.innerHTML = ''; cur0 = null; };
    document.addEventListener('mousemove', e => { lx = e.clientX; ly = e.clientY; if (XF !== 'btn' && !menuOpen()) place(lx, ly); }, { passive: true }); // меню правого клика стоит на месте
    // нативная подсказка браузера (белая плашка macOS от title) мешает кружку — у целей переноса и внутри «Разбора» title убираем при наведении
    document.addEventListener('mouseover', e => { let n = e.target; for (let k = 0; n && n.removeAttribute && k < 4; k++, n = n.parentElement) if (n.hasAttribute('title') && (target(n) || (host && host.contains(n)))) { n.dataset.tip = n.getAttribute('title'); n.removeAttribute('title'); } }, true);
    document.addEventListener('mouseover', e => { if (menuOpen() || (MENUON && !HOLDON)) return; const x = target(e.target);
      if (!x) { if (cur0 && !(XF === 'btn' && fl.contains(e.target))) hide(); return; }
      if (cur0 && (cur0.el === x.el || cur0.to === x.to)) { cur0.el = x.el; return; } hide(); cur0 = x; // страница перерисовывает шапку по ходу — тот же объект, новый элемент: таймер не сбрасываем
      // v22: кружок появляется только через SB_WAIT (1 с) неподвижного наведения — просто водишь мышью, его нет; потом заливается за HOLD
      if (HOLDON && window.SB_WAIT) { tm = setTimeout(() => { if (cur0 !== x) return; fl.className = 'sb-fl sb-fl--ring'; fl.style.setProperty('--hold', HOLD + 'ms'); fl.innerHTML = '<span class="sb-fill"><i></i><b>i</b></span>'; place(lx, ly);
          requestAnimationFrame(() => requestAnimationFrame(() => fl.classList.add('is-run'))); tm = setTimeout(() => { send(x); hide(); }, HOLD); }, window.SB_WAIT); }
      else if (HOLDON) { fl.className = 'sb-fl sb-fl--ring'; fl.style.setProperty('--hold', HOLD + 'ms'); fl.innerHTML = window.SB_FILL ? '<span class="sb-fill"><i></i><b>i</b></span>' : '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="9" class="bg"/><circle cx="12" cy="12" r="9" class="fg"/></svg>'; place(lx, ly);
        requestAnimationFrame(() => fl.classList.add('is-run')); tm = setTimeout(() => { send(x); hide(); }, HOLD); }
      if (XF === 'space') { fl.className = 'sb-fl sb-fl--tip'; fl.innerHTML = `<kbd>Пробел</kbd> — ${esc(x.name)} в «Разбор»`; place(lx, ly); }
      if (XF === 'key') { fl.className = 'sb-fl sb-fl--tip'; fl.innerHTML = `<kbd>⌥</kbd> + клик — ${esc(x.name)} в «Разбор»`; place(lx, ly); }
      if (XF === 'btn') { const r = x.el.getBoundingClientRect(); fl.className = 'sb-fl sb-fl--btn'; fl.innerHTML = '<button type="button" title="Открыть в «Разборе»"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="M10 3v10"/></svg>В Разбор</button>'; place(r.right - 4, r.top - 4);
        fl.querySelector('button').onclick = ev => { ev.preventDefault(); ev.stopPropagation(); send(x); hide(); }; }
      if (XF === 'drag') { x.el.setAttribute('draggable', 'true'); x.el.ondragstart = ev => { ev.dataTransfer.setData('text/sb', x.to); ev.dataTransfer.effectAllowed = 'copy'; document.body.classList.add('sb-dragging'); };
        x.el.ondragend = () => document.body.classList.remove('sb-dragging'); fl.className = 'sb-fl sb-fl--tip'; fl.innerHTML = `Перетащите ${esc(x.name)} в «Разбор»`; place(lx, ly); }
    });
    document.addEventListener('mouseout', e => { if (!cur0 || menuOpen()) return; const to = e.relatedTarget; if (to && (cur0.el.contains(to) || fl.contains(to))) return;
      // ушли ли на самом деле: элемент могли просто заменить перерисовкой — проверяем, что под курсором через миг
      if (XF !== 'btn') { const was = cur0.to; setTimeout(() => { if (!cur0 || cur0.to !== was) return; const y = target(document.elementFromPoint(lx, ly)); if (y && y.to === was) { cur0.el = y.el; return; } hide(); }, 60); return; } if (XF === 'btn') { tm = setTimeout(hide, 250); return; } hide(); });
    if (XF === 'space') document.addEventListener('keydown', e => { if (e.code !== 'Space' || !cur0 || /input|textarea/i.test((e.target.tagName || ''))) return; e.preventDefault(); send(cur0); hide(); });
    if (MENUON) { document.addEventListener('contextmenu', e => { const x = target(e.target); if (!x) return; e.preventDefault(); hide(); cur0 = x;
        fl.className = 'sb-fl sb-fl--menu'; fl.innerHTML = `<button data-sb="go"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="M10 3v10"/></svg>Открыть в «Разборе»</button><button data-sb="page"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 3h4v4M13 3 7 9M11 9.5V13H3V5h3.5"/></svg>Открыть страницу</button>`; place(e.clientX, e.clientY);
        fl.onclick = ev => { const b = ev.target.closest('[data-sb]'); if (!b) return; if (b.dataset.sb === 'go') send(x); else x.el.click(); hide(); }; });
      document.addEventListener('mousedown', e => { if (fl.classList.contains('sb-fl--menu') && !fl.contains(e.target)) hide(); }); }
    if (XF === 'key') document.addEventListener('click', e => { if (!e.altKey) return; const x = target(e.target); if (!x) return; e.preventDefault(); e.stopPropagation(); send(x); hide(); }, true);
    if (XF === 'drag') { document.addEventListener('dragover', e => { if (host && host.contains(e.target)) { e.preventDefault(); host.classList.add('sb-drop'); } else if (host) host.classList.remove('sb-drop'); });
      document.addEventListener('drop', e => { if (!host || !host.contains(e.target)) return; e.preventDefault(); host.classList.remove('sb-drop'); document.body.classList.remove('sb-dragging'); const to = e.dataTransfer.getData('text/sb'); if (to) send({ to }); hide(); }); }
  }
  // идущая карта: страница сама перерисовывает виджеты по ходу — подхватываем новую секунду
  window.GS_ACT = (el, m) => { host = el; M = m; el.classList.add('rz-host'); el.dataset.pre = m && m.state === 'pre' ? '1' : '0'; draw(); };
})();
