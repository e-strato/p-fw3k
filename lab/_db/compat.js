// Переходник: старые глобалы виджетов собираются ИЗ общей базы (window.DB) — виджеты не переписываем, данные берут из одного места.
// Подключать после _db.js (+ _fake.js) + db.js и ВМЕСТО старых файлов данных (widget-tournament-4/_data.js + _logos.js, widget-transfers/_data.js + _paths.js + _mix.js,
// widget-mvp/_data.js, widget-subs-2/_data.js, widget-participants/_data.js, gs-tournament/_heroes-full.js, news/_feed.js).
// Пути — уже от страницы лабы ('../…'), префиксы-переписчики (_logos.js, _paths.js) не нужны.
(() => {
  const DB = window.DB, D = DB.data, T = D.teams, P = D.players, url = DB.url
  const DAY = D.now.slice(0, 10), [y, m, d] = DAY.split('-'), dm = (s) => (s ? s.slice(8, 10) + '.' + s.slice(5, 7) : '')
  const hhmm = (s) => s.slice(11, 16), name = (id) => T[id]?.name ?? null
  const teamsMap = Object.fromEntries(Object.values(T).map((t) => [t.name, { logo: url(t.logo) }]))
  const ti = D.tours['ti-2026']
  // турнир страницы турнира (переключатель v44: ?tour=ep7) — участники, статистика героев — по нему; по умолчанию TI
  const TT = window.DB_TOUR || 'ti-2026', tt = D.tours[TT]

  // ── GS_NAMES (страница матча, gs-match/_wfit.js): имена команд — как в базе (PARIVISION, а не Team Vision), коротко — среднее имя ──
  if (window.GS_NAMES) for (const id of Object.keys(window.GS_NAMES.NAME)) { const t = DB.team(+id); if (t) { window.GS_NAMES.NAME[id] = t.name; window.GS_NAMES.SHORT[id] = t.mid } }

  // ── T4_DATA: турниры (виджет «Турниры», T6) ──
  const st = ti.standings.slice().sort((a, b) => a.place - b.place)
  const tourMatches = (tid) => DB.matches({ tour: tid, state: ['live', 'soon'] }).map((x) => ({ a: name(x.a), b: name(x.b), when: x.state === 'live' ? 'live' : (x.start.slice(0, 10) === DAY ? 'Сегодня, ' : dm(x.start) + ', ') + hhmm(x.start), stage: `${x.stage} · Bo${x.bo}` }))
  window.T4_DATA = {
    asOf: `${d}.${m}.${y}`, game: { name: 'Dota 2', logo: url('widget-tournament-4/logos/dota2.png') }, teams: teamsMap,
    tours: [
      { id: 'ti-2026', name: ti.name, logo: url(ti.logo), st: 'live', tier: 'S', dates: `${dm(ti.from)} – ${dm(ti.to)}`, prize: ti.prize, stage: ti.stage, fmt: 'groups',
        rule: 'Групповой этап — швейцарская система, Bo3; 1–3 места — сразу в плей-офф, 4–13 — раунд на вылет', src: 'hawk.live, OpenDota',
        groups: { A: st.map((x) => [name(x.team), +x.wl.split('-')[0], +x.wl.split('-')[1]]) }, zones: { up: [1, 2, 3], down: [14, 15, 16] },
        matches: tourMatches('ti-2026'), note: `Призовой на 21.08 — ${ti.prize}. ${ti.city}, ${ti.venue?.split(' —')[0] || ''}` },
      ...Object.values(D.tours).filter((t) => t.id !== 'ti-2026').map((t) => ({ id: t.id, name: t.name, logo: url(t.logo), st: t.state, tier: t.tier, dates: `${dm(t.from)} – ${dm(t.to)}`, prize: t.prize, stage: t.stage || 'Скоро', fmt: t.format || 'groups', rule: '', teams: t.teams.map(name), src: t.src })),
    ],
  }

  // ── TR_DATA: трансферы ──
  const RU = { RU: 'Россия', UA: 'Украина', BY: 'Беларусь', KZ: 'Казахстан', FI: 'Финляндия', SE: 'Швеция', DK: 'Дания', DE: 'Германия', PE: 'Перу', PH: 'Филиппины', MY: 'Малайзия', JO: 'Иордания', PK: 'Пакистан', CN: 'Китай', US: 'США', CA: 'Канада', BG: 'Болгария', IL: 'Израиль', MK: 'Македония', ID: 'Индонезия', GB: 'Великобритания', EE: 'Эстония', BR: 'Бразилия', AR: 'Аргентина', CL: 'Чили', UZ: 'Узбекистан', KG: 'Киргизия', PL: 'Польша', RS: 'Сербия', RO: 'Румыния', MD: 'Молдавия' }
  const KIND = { join: 'move', loan: 'loan', standin: 'move', coach: 'move', leave: 'free', inactive: 'free', retire: 'free' }
  window.TR_DATA = {
    asOf: `${d}.${m}.${y}`, game: { name: 'Dota 2', logo: url('widget-transfers/logos/dota2.png') }, games: D.games.map((g) => ({ ...g, logo: url(g.logo) })), teams: teamsMap,
    list: DB.transfers({ game: null }).map((x) => { const p = P[x.player] || {}
      return { date: x.date, nick: x.nick, name: p.name || null, pos: p.role === 'coach' ? null : p.role ?? null, role: p.role === 'coach' ? 'тренер' : undefined, country: RU[p.country] || p.country || null, age: p.age ?? null,
        earn: p.earn ? '$' + Math.round(p.earn).toLocaleString('ru-RU') : null, photo: url(p.photo), from: name(x.from), to: name(x.to), kind: KIND[x.kind] || 'move', game: x.game, src: x.src, path: [] } }),
  }

  // ── MVP_DATA: лучшие игроки (очки — из настоящей статистики TI, формула MVP) ──
  const PS = DB.playerStats('ti-2026'), ROLE = { 1: 'керри', 2: 'мидер', 3: 'офлейнер', 4: 'саппорт', 5: 'саппорт' }
  window.MVP_DATA = {
    games: D.games.map((g) => ({ ...g, logo: url(g.logo) })), teams: Object.fromEntries(Object.values(T).map((t) => [t.name, url(t.logo)])),
    list: PS.map((x) => { const p = P[x.player], h = D.heroes[x.heroes[0]?.hero]
      return { game: 'dota2', nick: p.nick, team: name(x.team), role: ROLE[p.role] || '', photo: url(p.photo), hq: url(p.photo), hero: url(h?.img),
        week: { pts: x.week, prev: x.prevRank, m: x.weekMaps, kda: x.kda }, month: { pts: x.pts, prev: x.prevRank, m: x.maps, kda: x.kda } } }),
  }

  // ── PU_TEAMS: участники турнира со составами (виджет «Участники», «Игроки по позициям») ──
  const FLAG = (c) => (c ? `../widget-participants/img/flag-${c.toLowerCase()}.png` : null)
  const puRows = TT === 'ti-2026' ? st.map((x) => ({ team: x.team, st: x.out ? `Выбыли · ${x.out.place} место` : 'Плей-офф', q: [x.qualification, `швейцарка ${x.wl}`] }))
    : tt.teams.map((id) => { const p = tt.standings.find((x) => x.team === id), g = tt.groups.find((g) => g.rows.some((r) => r.team === id)), r = g?.rows.find((r) => r.team === id)
      return { team: id, place: parseInt(p?.place) || 99, st: p ? `${p.place} место${p.prize ? ' · ' + p.prize : ''}` : '', q: g ? [g.name, r.record] : ['Приглашены в плей-офф', ''] } }).sort((a, b) => a.place - b.place)
  window.PU_TEAMS = puRows.map((x) => ({ name: name(x.team), logo: url(T[x.team].logo), st: x.st, q: x.q, dbId: x.team,
    // основа — 5 игроков с наибольшим числом карт на турнире, остальные — «Запас»; позиция — на этом турнире (roleAt), иначе общая
    tabs: (() => { const all = Object.values(P).filter((p) => p.teamAt?.[TT] === x.team).sort((a, b) => (b.mapsAt?.[TT] ?? 9) - (a.mapsAt?.[TT] ?? 9)), main = all.slice(0, 5), subs = all.slice(5)
      const rl = (p) => p.roleAt?.[TT] ?? p.role, m = (p) => ({ flag: p.country, fsrc: url(p.flag), nick: p.nick, role: String(rl(p) ?? ''), team: null })
      // тренер (виджет «Участники» без него не рисует строку): TI — из переходов до 21.08, иначе из состава Liquipedia (28.10); не нашли — «не указан»
      const co = TT === 'ti-2026' ? (DB.transfers().find((t) => t.kind === 'coach' && t.to === x.team) ? P[DB.transfers().find((t) => t.kind === 'coach' && t.to === x.team).player] : Object.values(P).find((p) => p.role === 'coach' && p.team === x.team)) : null
      const coach = co ? { flag: co.country, fsrc: url(co.flag), nick: co.nick, role: 'Coach', team: null } : { flag: null, fsrc: null, nick: 'не указан', role: 'Coach', team: null }
      return [{ tab: 'Main', m: [...main.sort((a, b) => (rl(a) || 9) - (rl(b) || 9)).map(m), coach] }, ...(subs.length ? [{ tab: 'Subs', m: subs.map(m) }] : [])] })() }))

  // ── TN_HEROES: статистика героев турнира ──
  const HS = DB.heroStats(TT)
  // поля как в gs-tournament/_heroes-full.js: p — пики, pw — победы, rd / dr — [игр, W, L], b — баны, pb — пик + бан (число)
  window.TN_HEROES = { games: HS.games, sub: HS.sub, list: HS.list.map((h) => ({ n: D.heroes[h.hero]?.name || h.hero, k: h.hero, p: h.picks, pw: h.pickWins,
    rd: [h.radiant[0], h.radiant[1], h.radiant[0] - h.radiant[1]], dr: [h.dire[0], h.dire[1], h.dire[0] - h.dire[1]], b: h.bans, pb: h.picks + h.bans })) }

  // ── NEWS_FEED: лента новостей (t — местное время без пояса, как было) ──
  // лента новостей — последние 12 дней до «сейчас» (архив Universe Ep. 7 — только на странице турнира)
  const FROM = DB.now() - 12 * 86400000
  window.NEWS_FEED = D.news.filter((n) => new Date(n.t).getTime() >= FROM).map((n) => ({ t: n.t.slice(0, 16), title: n.title, views: n.views, com: n.com, img: url(n.img) || '', url: n.url, lede: n.lede || '', db: n.id }))

  // ── SUBS2: замены (виджет «Замены», widget-subs-3) — DB_FAKE.subs (Topson — настоящая, остальное выдумано) на настоящих матчах и составах TI ──
  const F = DB.fake
  if (F.subs) { const roster = (id) => Object.values(P).filter((p) => p.teamAt?.['ti-2026'] === id).sort((a, b) => (a.role || 9) - (b.role || 9))
    const mOf = (x) => x.match ? D.matches.find((m) => m.id === x.match) : DB.matches({ tour: 'ti-2026', team: x.team })[0]
    const used = [...new Set(F.subs.map((x) => mOf(x)?.id).filter(Boolean))].map((id) => D.matches.find((m) => m.id === id))
    const dg = { name: 'Dota 2', logo: url('widget-transfers/logos/dota2.png'), icon: url('widget-transfers/logos/dota2.png'), roles: ['Carry', 'Mid', 'Offlane', 'Support', 'Hard Sup'] }
    window.SUBS2 = { asOf: `${d}.${m}`, pos: ['Керри', 'Мид', 'Оффлейн', 'Поддержка 4', 'Поддержка 5'], games: { dota2: dg },
      rosters: Object.fromEntries(st.map((x) => [name(x.team), roster(x.team).map((p) => [p.nick, String(p.steam || '')])])),
      base: F.subs.map((x) => P[x.in]).filter(Boolean).map((p) => [p.nick, name(p.team) || '', typeof p.role === 'number' ? p.role : 1, String(p.steam || '')]),
      matches: used.map((x) => ({ id: x.id, a: name(x.a), b: name(x.b), tour: 'TI 2026', when: x.state === 'live' ? 'live' : `${dm(x.start)}, ${hhmm(x.start)}`, done: x.state === 'done' ? `${x.score[0]}:${x.score[1]}` : undefined, bo: x.bo, map: x.state === 'live' ? x.maps.length + 1 : undefined })),
      subs: F.subs.map((x) => { const o = P[x.out], i = P[x.in], mm = mOf(x)
        return x.real ? { id: x.id, m: mm.id, team: name(x.team), pos: o?.role ?? 2, out: o?.nick || null, kind: 'news', in: i?.nick || null, date: '09.08', note: x.reason, term: 'event', real: true }
          : { id: x.id, m: mm.id, team: name(x.team), pos: typeof o?.role === 'number' ? o.role : 1, out: o?.nick || null, kind: 'ids', seen: String(i?.steam || ''), in: i?.nick || null, map: x.map, term: x.term === 'tournament' ? 'event' : x.term } }) } }
})()
