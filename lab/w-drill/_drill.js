// Лаба w-drill — виджет «Разбор» вместо «Пульса матча» (созвон 02.11 §1.1, задача 1.1).
// Начальник 02.11: медиа (эфиры, онлайн) и финансы не интересны; нужен виджет, который «включаю и смотрю сбоку» — drill-down по 4 видам:
// прогнозы · игрок · герой · команда, всё связано; по умолчанию — прогнозы (сколько голосов за одно и другое, соотношение, объём). К трансляции не привязан.
// Ставится на место «Пульса»: переопределяет window.GS_ACT (хозяин — ../gs-match/_gs.js, первым в правой колонке). Подключать после ../w-actions/_act3.js.
// Клик по герою в пиках под графиком (.d3-h) — открывает вкладку «Игрок» с этим игроком.
// Данные: игроки, герои, статистика карты и турнира — GS_DATA (OpenDota, TI 2026, 4 серии); ‼️ голоса прогнозов и форма команд — пример.
// Какие данные по игроку и герою нужны на самом деле — начальник пришлёт (созвон 02.11 §1.1.5); пока — что есть в OpenDota.
(() => {
  const D = window.GS_DATA; if (!D) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const k = n => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n);
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const TEAM = id => D.teams[id] || { name: '—', tag: '—' };
  const short = id => ({ 9572001: 'Vision', 7119388: 'Spirit' })[id] || TEAM(id).tag;
  const POS = ['', '1', '2', '3', '4', '5'];

  // Идущий матч — Vision — Spirit, карта 3 (как на странице)
  const S = D.series.find(s => s.maps.some(m => [m.radiant_team_id, m.dire_team_id].includes(7119388))) || D.series[0];
  const MAP = S.maps[S.maps.length - 1];
  const nick = p => (D.players[p.account_id] || {}).name || '—';
  const teamOf = p => p.isRadiant ? MAP.radiant_team_id : MAP.dire_team_id;
  // Пятёрки: позиция по lane_role и порядку в данных (1–5), как в пиках
  const five = rad => MAP.players.filter(p => p.isRadiant === rad).map((p, i) => ({ p, pos: i + 1 }));
  const ALL = [...five(true), ...five(false)];

  // Турнир — все карты в GS_DATA
  const MAPS = D.series.flatMap(s => s.maps);
  const won = (m, p) => p.isRadiant === m.radiant_win;
  const tourPlayer = id => { const r = MAPS.flatMap(m => m.players.filter(p => p.account_id === id).map(p => ({ m, p })));
    const kda = r.reduce((a, { p }) => a + (p.kills + p.assists) / Math.max(1, p.deaths), 0) / Math.max(1, r.length);
    const by = {}; r.forEach(({ p }) => by[p.hero_id] = (by[p.hero_id] || 0) + 1);
    const fav = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
    return { maps: r.length, wins: r.filter(({ m, p }) => won(m, p)).length, kda: kda.toFixed(1), gpm: Math.round(r.reduce((a, { p }) => a + p.gold_per_min, 0) / Math.max(1, r.length)), fav: fav && +fav[0] } };
  const tourHero = id => { const picks = MAPS.flatMap(m => m.players.filter(p => p.hero_id === id).map(p => ({ m, p })));
    const bans = MAPS.filter(m => (m.picks_bans || []).some(b => !b.is_pick && b.hero_id === id)).length;
    const best = picks.slice().sort((a, b) => (b.p.kills + b.p.assists) / Math.max(1, b.p.deaths) - (a.p.kills + a.p.assists) / Math.max(1, a.p.deaths))[0];
    return { picks: picks.length, bans, wins: picks.filter(({ m, p }) => won(m, p)).length, total: MAPS.length, best: best && { n: nick(best.p), kda: `${best.p.kills}/${best.p.deaths}/${best.p.assists}` } } };
  const tourTeam = id => { const ms = MAPS.filter(m => m.radiant_team_id === id || m.dire_team_id === id);
    const w = ms.filter(m => (m.radiant_team_id === id) === m.radiant_win).length;
    const dur = Math.round(ms.reduce((a, m) => a + m.duration, 0) / Math.max(1, ms.length));
    const kills = Math.round(ms.reduce((a, m) => a + (m.radiant_team_id === id ? m.radiant_score : m.dire_score), 0) / Math.max(1, ms.length));
    const by = {}; ms.forEach(m => m.players.filter(p => (p.isRadiant ? m.radiant_team_id : m.dire_team_id) === id).forEach(p => by[p.hero_id] = (by[p.hero_id] || 0) + 1));
    const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([h]) => +h);
    return { maps: ms.length, w, dur, kills, top } };

  // ‼️ Пример: голоса по прогнозам на карту 3 (33:30)
  const PROG = [
    { q: 'Кто возьмёт карту 3?', a: ['Vision', 'Spirit'], v: [1840, 1171], d: [+212, +96] },
    { q: 'Карта дольше 45 минут?', a: ['Да', 'Нет'], v: [702, 1288], d: [+41, +130] },
    { q: 'Следующий Рошан', a: ['Vision', 'Spirit'], v: [1312, 504], d: [+88, +19] },
  ];
  const FORM = { 9572001: 'wwwlw', 7119388: 'wlwww' }; // ‼️ пример

  const st = { tab: 'prog', who: 0, team: MAP.radiant_team_id };
  let host = null;
  const icon = id => (D.heroes[id] || {}).icon || '';
  const img = id => (D.heroes[id] || {}).img || icon(id);
  const hname = id => (D.heroes[id] || {}).name || '—';
  const cell = (n, l, c = '') => `<div class="rz-c"><b class="num ${c}">${n}</b><small>${l}</small></div>`;

  const picker = () => `<div class="rz-pick">${[true, false].map(rad => `<div class="rz-five">${ALL.filter(x => x.p.isRadiant === rad).map(x => { const i = ALL.indexOf(x);
    return `<button class="rz-ph${i === st.who ? ' on' : ''}" data-rz="who" data-v="${i}" title="${esc(hname(x.p.hero_id))} · ${esc(nick(x.p))}"><img src="${esc(icon(x.p.hero_id))}" alt="" /><i>${x.pos}</i></button>` }).join('')}</div>`).join('')}</div>`;

  const tabs = {
    prog: () => { const tot = PROG.reduce((a, p) => a + p.v[0] + p.v[1], 0), dlt = PROG.reduce((a, p) => a + p.d[0] + p.d[1], 0);
      return `<div class="rz-sum"><b class="num">${tot.toLocaleString('ru')}</b> голосов · <span class="up num">+${dlt}</span> за 5 мин</div>` +
        PROG.map(p => { const t = p.v[0] + p.v[1], a = pct(p.v[0], t);
          return `<div class="rz-q"><div class="rz-qh">${esc(p.q)}<small class="num">${k(t)}</small></div>
            <div class="rz-bar"><i style="width:${a}%"></i><s></s></div>
            <div class="rz-qa"><span><b class="num">${a}%</b> ${esc(p.a[0])} <em class="num">+${p.d[0]}</em></span><span><em class="num">+${p.d[1]}</em> ${esc(p.a[1])} <b class="num">${100 - a}%</b></span></div></div>` }).join('') },
    player: () => { const { p, pos } = ALL[st.who], t = tourPlayer(p.account_id), tm = teamOf(p);
      return picker() + `<div class="rz-hd"><img src="${esc(img(p.hero_id))}" alt="" /><div><b>${esc(nick(p))}</b><small>${esc(short(tm))} · позиция ${POS[pos]} · ${esc(hname(p.hero_id))}</small></div></div>
        <div class="rz-lb">Эта карта</div>
        <div class="rz-g">${cell(`${p.kills}/${p.deaths}/${p.assists}`, 'K / D / A')}${cell(p.gold_per_min, 'GPM')}${cell(p.xp_per_min, 'XPM')}${cell(k(p.hero_damage), 'урон')}${cell(p.last_hits, 'добивания')}${cell(k(p.net_worth), 'нетворс')}</div>
        <div class="rz-lb">На турнире</div>
        <div class="rz-g">${cell(t.maps, 'карт')}${cell(pct(t.wins, t.maps) + '%', 'побед')}${cell(t.kda, 'KDA')}${cell(t.gpm, 'GPM')}</div>
        ${t.fav ? `<div class="rz-row"><img src="${esc(icon(t.fav))}" alt="" />Чаще всего — ${esc(hname(t.fav))}</div>` : ''}` },
    hero: () => { const { p } = ALL[st.who], h = D.heroes[p.hero_id] || {}, t = tourHero(p.hero_id);
      return picker() + `<div class="rz-hd"><img src="${esc(img(p.hero_id))}" alt="" /><div><b>${esc(h.name || '—')}</b><small>${esc((h.roles || []).slice(0, 3).join(' · '))}</small></div></div>
        <div class="rz-lb">На турнире · ${t.total} карт</div>
        <div class="rz-g">${cell(t.picks, 'пиков')}${cell(t.bans, 'банов')}${cell(t.picks ? pct(t.wins, t.picks) + '%' : '—', 'побед', t.picks && t.wins * 2 >= t.picks ? 'up' : 'dn')}</div>
        ${t.best ? `<div class="rz-row">Лучше всех — <b>${esc(t.best.n)}</b> <span class="num">${t.best.kda}</span></div>` : ''}
        <div class="rz-row">Сейчас — <b>${esc(nick(p))}</b>, ${esc(short(teamOf(p)))}</div>` },
    team: () => { const id = st.team, t = tourTeam(id), f = FORM[id] || 'wlwlw';
      return `<div class="rz-seg">${[MAP.radiant_team_id, MAP.dire_team_id].map(x => `<button class="${x === id ? 'on' : ''}" data-rz="team" data-v="${x}"><img src="${esc(TEAM(x).logo || '')}" alt="" />${esc(short(x))}</button>`).join('')}</div>
        <div class="rz-hd rz-hd--t"><img src="${esc(TEAM(id).logo || '')}" alt="" /><div><b>${esc(TEAM(id).name)}</b><small class="rz-form">${[...f].map(c => `<i class="${c === 'w' ? 'w' : 'l'}"></i>`).join('')} форма</small></div></div>
        <div class="rz-lb">На турнире</div>
        <div class="rz-g">${cell(`${t.w}–${t.maps - t.w}`, 'карты')}${cell(mmss(t.dur), 'ср. длина')}${cell(t.kills, 'убийств за карту')}</div>
        <div class="rz-lb">Чаще пикают</div>
        <div class="rz-tops">${t.top.map(h => `<span><img src="${esc(icon(h))}" alt="" />${esc(hname(h))}</span>`).join('')}</div>` },
  };
  const NAMES = { prog: 'Прогнозы', player: 'Игрок', hero: 'Герой', team: 'Команда' };

  const draw = () => { if (!host) return;
    host.innerHTML = `<div class="rz"><div class="rz-top"><b>Разбор</b><small>Vision — Spirit · карта ${S.maps.length}</small></div>
      <div class="rz-tabs">${Object.keys(NAMES).map(t => `<button class="${t === st.tab ? 'on' : ''}" data-rz="tab" data-v="${t}">${NAMES[t]}</button>`).join('')}</div>
      <div class="rz-body">${tabs[st.tab]()}</div></div>` };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-rz]');
    if (b && host && host.contains(b)) { const { rz, v } = b.dataset;
      if (rz === 'tab') st.tab = v; if (rz === 'who') st.who = +v; if (rz === 'team') st.team = +v; draw(); return; }
    // Клик по герою в пиках под графиком → «Игрок»
    const h = e.target.closest('.d3-h'); if (!h || !host) return;
    const n = (h.getAttribute('title') || '').split(' · ').pop(), i = ALL.findIndex(x => nick(x.p) === n);
    if (i >= 0) { st.tab = 'player'; st.who = i; draw(); host.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  });

  window.GS_ACT = (el, M) => { host = el; el.classList.add('rz-host'); el.dataset.pre = M && M.state === 'pre' ? '1' : '0'; draw(); };
})();
