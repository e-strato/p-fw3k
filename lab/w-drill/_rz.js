// Лаба w-drill v3 — «Разбор» с нуля (дирижёр 02.11: «заберём 1.1, с нуля попробуем»). Созвон 02.11 §1.1:
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
  const go = (to, push = true) => { const [k, v] = to.split(':'); if (push) S.back.push({ tab: S.tab, p: S.p, h: S.h, t: S.t });
    if (S.back.length > 12) S.back.shift();
    if (k === 'p') { S.tab = 'p'; S.p = +v; } if (k === 'h') { S.tab = 'h'; S.h = +v; } if (k === 't') { S.tab = 't'; S.t = +v; } if (k === 'q') S.tab = 'q'; };

  // ——— кусочки ———
  const lnk = (to, html, cls = '') => to ? `<button class="rz-a ${cls}" data-go="${to}">${html}</button>` : `<span class="${cls}">${html}</span>`;
  const himg = (id, cls = 'rz-hi') => `<img class="${cls}" src="${HERO(id).img}" alt="" loading="lazy">`;
  const tlogo = id => `<img class="rz-tl" src="${LOGO(id)}" alt="">`;
  const kv = (k, v, cls = '') => `<div class="rz-kv ${cls}"><b class="num">${v}</b><span>${k}</span></div>`;
  const sec = (t, body, aside = '') => `<div class="rz-sec"><div class="rz-sh"><span>${t}</span>${aside}</div>${body}</div>`;

  // выбор внутри вкладки: две пятёрки героев · две команды
  const pick10 = (c, on, key) => { const side = r => c.m.players.filter(p => p.isRadiant === r).map(p => {
      const id = key === 'p' ? p.account_id : p.hero_id; return `<button class="rz-pk${on === id ? ' is-on' : ''}" data-go="${key}:${id}" title="${esc(HERO(p.hero_id).name)} · ${esc(nick(p))}">${himg(p.hero_id, '')}</button>`; }).join('');
    return `<div class="rz-pick"><span class="rz-pt">${tlogo(c.m.radiant_team_id)}</span>${side(true)}<i></i>${side(false)}<span class="rz-pt">${tlogo(c.m.dire_team_id)}</span></div>`; };

  // ——— Прогнозы ———
  function vQ(c) {
    const L = Q(c), all = L.reduce((n, q) => n + q.n, 0), hot = [...L].sort((a, b) => b.d / b.n - a.d / a.n)[0];
    const row = q => { const lead = Math.max(...q.o.map(o => o.v));
      return `<div class="rz-q"><div class="rz-qh"><span>${esc(q.q)}</span><small class="num">${sp(q.n)}</small></div>
        <div class="rz-bar">${q.o.map(o => `<i class="c-${o.c}${o.v === lead ? ' is-lead' : ''}" style="flex:${o.v}"></i>`).join('')}</div>
        <div class="rz-qo">${q.o.map(o => `<span class="${o.v === lead ? 'is-lead' : ''}">${lnk(o.go, `${o.h ? himg(o.h, 'rz-hs') : ''}${esc(o.t)}`, 'c-' + o.c)}<b class="num">${o.v}%</b><small class="num">${sp(Math.round(q.n * o.v / 100))}</small></span>`).join('')}</div></div>`; };
    return `<div class="rz-sum">${kv('голосов', sp(all))}${kv('прогнозов', L.length)}${kv('за 5 мин', '+' + sp(L.reduce((n, q) => n + q.d, 0)), 'up')}</div>
      <div class="rz-hot"><span class="rz-dot"></span>Быстрее всего растёт: <b>${esc(hot.q)}</b> <span class="num up">+${sp(hot.d)}</span></div>
      ${L.map(row).join('')}`;
  }

  // ——— Игрок ———
  function vP(c) {
    const p = c.m.players.find(x => x.account_id === S.p) || c.m.players[0], s = stat(c.m, p, c.t), T0 = tid(c.m, p), info = D.players[p.account_id] || {};
    const mates = c.m.players.filter(q => q.isRadiant === p.isRadiant), place = [...mates].sort((a, b) => stat(c.m, b, c.t).nw - stat(c.m, a, c.t).nw).indexOf(p) + 1;
    const P = past(c).flatMap(m => m.players.filter(q => q.account_id === p.account_id).map(q => ({ m, q, w: q.isRadiant === m.radiant_win })));
    const hs = {}; P.forEach(({ q, w }) => { const h = hs[q.hero_id] ||= { n: 0, w: 0 }; h.n++; h.w += w; });
    const sum = f => P.reduce((n, x) => n + f(x.q), 0);
    return pick10(c, p.account_id, 'p') + `<div class="rz-card">
        <img class="rz-av" src="${info.avatar || ''}" alt="" onerror="this.style.visibility='hidden'">
        <div class="rz-ct"><b>${esc(nick(p))}</b><span>${lnk('t:' + T0, `${tlogo(T0)}${esc(NM(T0))}`)}${info.country ? ` · ${esc(info.country)}` : ''}</span></div>
        ${lnk('h:' + p.hero_id, `${himg(p.hero_id, 'rz-hb')}<small>${esc(HERO(p.hero_id).name)}</small>`, 'rz-hero')}</div>
      ${sec(`Map ${c.n} · ${c.live ? 'на ' + mmss(c.t) : 'итог'}`, `<div class="rz-grid">${kv('убийства', s.K)}${kv('смерти', s.D)}${kv('ассисты', s.A ?? '—')}${kv('состояние', kk(s.nw))}${kv('в команде', place + '-й')}${kv('GPM к этой минуте', Math.round(s.nw / Math.max(1, c.t / 60)))}</div>
        ${s.items.length ? `<div class="rz-items">${s.items.map(it => `<img src="${D.items[it].img}" alt="" title="${esc(D.items[it].name)}">`).join('')}</div>` : ''}`)}
      ${sec('Турнир · до этой карты', P.length ? `<div class="rz-grid">${kv(pl3(P.length, 'карта', 'карты', 'карт'), P.length)}${kv('побед', P.filter(x => x.w).length)}${kv('K / D / A', `${(sum(q => q.kills) / P.length).toFixed(1)} / ${(sum(q => q.deaths) / P.length).toFixed(1)} / ${(sum(q => q.assists) / P.length).toFixed(1)}`, 'wide')}</div>
        <div class="rz-list">${Object.entries(hs).sort((a, b) => b[1].n - a[1].n).map(([id, h]) => `<div class="rz-li">${lnk('h:' + id, `${himg(+id)}<span>${esc(HERO(id).name)}</span>`)}<small class="num">${h.n} ${pl3(h.n, 'карта', 'карты', 'карт')}</small><b class="num ${h.w / h.n >= .5 ? 'up' : 'dn'}">${Math.round(h.w / h.n * 100)}%</b></div>`).join('')}</div>` : '<div class="rz-none">Других карт в базе нет</div>')}`;
  }

  // ——— Герой ———
  function vH(c) {
    const id = S.h || c.m.players[0].hero_id, h = HERO(id), p = c.m.players.find(x => x.hero_id === id);
    const L = past(c), pk = [], bans = L.filter(m => m.picks_bans.some(b => !b.is_pick && b.hero_id === id)).length;
    L.forEach(m => m.players.filter(q => q.hero_id === id).forEach(q => pk.push({ m, q, w: q.isRadiant === m.radiant_win })));
    const s = p ? stat(c.m, p, c.t) : null, w = pk.filter(x => x.w).length;
    const attr = { str: 'Сила', agi: 'Ловкость', int: 'Интеллект', all: 'Универсал' }[h.attr] || '';
    return (p ? pick10(c, id, 'h') : '') + `<div class="rz-card rz-card--h"><img class="rz-hw" src="${h.img}" alt="">
        <div class="rz-ct"><b>${esc(h.name)}</b><span>${attr}${h.roles ? ' · ' + h.roles.slice(0, 3).join(', ') : ''}</span></div></div>
      ${p ? sec(`Map ${c.n} · ${c.live ? 'на ' + mmss(c.t) : 'итог'}`, `<div class="rz-li rz-li--big">${lnk('p:' + p.account_id, `<span>${esc(nick(p))}</span>`)}${lnk('t:' + tid(c.m, p), tlogo(tid(c.m, p)))}<b class="num">${s.K} / ${s.D}${s.A != null ? ' / ' + s.A : ''}</b><small class="num">${kk(s.nw)}</small></div>
        ${s.items.length ? `<div class="rz-items">${s.items.map(it => `<img src="${D.items[it].img}" alt="" title="${esc(D.items[it].name)}">`).join('')}</div>` : ''}`) : ''}
      ${sec('Турнир · до этой карты', `<div class="rz-grid">${kv('пиков', pk.length)}${kv('побед', pk.length ? Math.round(w / pk.length * 100) + '%' : '—', pk.length ? (w / pk.length >= .5 ? 'up' : 'dn') : '')}${kv('банов', bans)}</div>
        ${pk.length ? `<div class="rz-list">${pk.map(x => { const T0 = tid(x.m, x.q); return `<div class="rz-li">${lnk('p:' + x.q.account_id, `<span>${esc(nick(x.q))}</span>`)}${lnk('t:' + T0, tlogo(T0))}<small class="num">${x.q.kills}/${x.q.deaths}/${x.q.assists}</small><b class="num ${x.w ? 'up' : 'dn'}">${x.w ? 'W' : 'L'}</b></div>`; }).join('')}</div>` : ''}`)}`;
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

  // ——— рисуем ———
  const TABS = [['q', 'Прогнозы'], ['p', 'Игрок'], ['h', 'Герой'], ['t', 'Команда']];
  function draw() {
    if (!host || !M) return; const c = cur(), box = host.querySelector('.rz-body'), y = box ? box.scrollTop : 0, same = host.dataset.tab === S.tab;
    if (S.p == null) S.p = (c.m.players.find(p => p.isRadiant) || c.m.players[0]).account_id;
    if (S.h == null) S.h = c.m.players[0].hero_id; if (S.t == null) S.t = c.m.radiant_team_id;
    host.innerHTML = `<div class="w rz"><div class="w-hd rz-hd">${S.back.length ? '<button class="rz-back" data-back aria-label="Назад"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg></button>' : ''}<span class="w-hd__t">Разбор</span>${c.live ? `<span class="rz-live"><i></i>Map ${c.n} · ${mmss(c.t)}</span>` : `<span class="rz-live is-off">Map ${c.n}</span>`}</div>
      <div class="rz-tabs" role="tablist">${TABS.map(([k, n]) => `<button role="tab" data-go="${k}:" class="${S.tab === k ? 'is-on' : ''}">${n}</button>`).join('')}</div>
      <div class="rz-body">${{ q: vQ, p: vP, h: vH, t: vT }[S.tab](c)}</div></div>`;
    host.dataset.tab = S.tab; const nb = host.querySelector('.rz-body'); if (same) nb.scrollTop = y;
  }
  document.addEventListener('click', e => {
    if (!host) return;
    if (host.contains(e.target)) {
      const b = e.target.closest('[data-back]'); if (b) { const s = S.back.pop(); if (s) Object.assign(S, s); return draw(); }
      const g = e.target.closest('[data-go]'); if (!g) return; const v = g.dataset.go, [k] = v.split(':');
      if (v.endsWith(':')) { if (S.tab !== k) go(k + ':'); } else go(v); return draw();
    }
    // герой в пиках под графиком (data-hc / data-v = «match|account») → «Игрок»
    const h = e.target.closest('.d3-h[data-hc], .d3-h[data-v]'); if (!h) return;
    const acc = +((h.dataset.hc || h.dataset.v || '').split('|')[1]); if (!acc) return;
    go('p:' + acc); draw(); host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  // идущая карта: страница сама перерисовывает виджеты по ходу — подхватываем новую секунду
  window.GS_ACT = (el, m) => { host = el; M = m; el.classList.add('rz-host'); el.dataset.pre = m && m.state === 'pre' ? '1' : '0'; draw(); };
})();
