// Общий слой данных — ЕДИНСТВЕННЫЙ вход для виджетов (опись 03.11: внутренняя документация/данные-опись.md, схема — _db/README.md).
// Подключать: <script src="../_db/_db.js"></script>[<script src="../_db/_fake.js"></script>]<script src="../_db/db.js"></script>.
// Две базы: DB_DATA — настоящее на 21.08.2026; DB_FAKE — выдуманное (чат, голоса, прогнозы толпы, эфиры, замены) — только через DB.fake Виджет берёт данные только через window.DB, своих списков не держит.
// Сейчас DB_DATA — собранные снимки (build.mjs); потом то же DB.* будет читать настоящий API, виджеты не меняются.
window.DB = (() => {
  const D = window.DB_DATA, T = D.teams, P = D.players, TR = D.tours
  // пути в данных — от папки lab/; страница лабы лежит на уровень ниже → '../'
  let base = '../'
  const url = (p) => (p ? base + p : null)
  const key = (s) => String(s).toLowerCase().replace(/[^a-z0-9а-я]/g, '')
  const idx = (o, f) => { const m = {}; for (const x of Object.values(o)) for (const s of f(x)) if (s != null) m[key(s)] ??= x; return m }
  const tN = idx(T, (t) => [t.id, t.name, t.mid, t.tag]), tOd = Object.fromEntries(Object.values(T).filter((t) => t.od).map((t) => [t.od, t]))
  const pN = idx(P, (p) => [p.id, p.nick]), pSt = Object.fromEntries(Object.values(P).filter((p) => p.steam).map((p) => [p.steam, p]))
  const trN = idx(TR, (t) => [t.id, t.name, t.short, ...t.aliases])
  const ts = (s) => (s ? new Date(s).getTime() : null)
  const byTime = (a, b) => (ts(a.start) ?? 0) - (ts(b.start) ?? 0)

  return {
    data: D,
    // ВЫДУМАННОЕ — отдельно; нет _fake.js на странице → пусто
    fake: window.DB_FAKE || {},
    // замены: настоящая (real: true) + выдуманные; { team }
    subs: ({ team } = {}) => { const c = team && DB.team(team)?.id; return (window.DB_FAKE?.subs || []).filter((x) => !c || x.team === c) },
    setBase: (b) => { base = b },
    url,
    // «сейчас» — одно на все страницы
    now: () => ts(D.now),
    // найти по чему угодно: id, полное/среднее имя, тег, id OpenDota (команда) / ник, Steam id (игрок) / любое написание турнира
    team: (x) => (x == null ? null : typeof x === 'number' ? tOd[x] : tN[key(x)]) || null,
    player: (x) => (x == null ? null : typeof x === 'number' ? pSt[x] : pN[key(x)]) || null,
    tour: (x) => (x == null ? null : trN[key(x)]) || null,
    hero: (x) => D.heroes[x] || Object.values(D.heroes).find((h) => h.od === +x || h.name === x) || null,
    teams: () => Object.values(T),
    players: ({ team } = {}) => Object.values(P).filter((p) => !team || p.team === (DB.team(team)?.id)),
    tours: ({ state } = {}) => Object.values(TR).filter((t) => !state || [].concat(state).includes(t.state)),
    // матчи: { tour, team, state: 'live' | 'soon' | 'done' | [..] } — по времени
    matches: ({ tour, team, state } = {}) => {
      const t = tour && DB.tour(tour)?.id, c = team && DB.team(team)?.id, s = state && [].concat(state)
      return D.matches.filter((m) => (!t || m.tour === t) && (!c || m.a === c || m.b === c) && (!s || s.includes(m.state))).sort(byTime)
    },
    // новости: { team, player, tour } — новые сверху
    news: ({ team, player, tour } = {}) => {
      const c = team && DB.team(team)?.id, p = player && DB.player(player)?.id, t = tour && DB.tour(tour)?.id
      return D.news.filter((n) => (!c || n.teams.includes(c)) && (!p || n.players.includes(p)) && (!t || n.tours.includes(t))).sort((a, b) => (ts(b.t) ?? 0) - (ts(a.t) ?? 0))
    },
    transfers: ({ game = 'dota2', team } = {}) => { const c = team && DB.team(team)?.id
      return D.transfers.filter((x) => (!game || x.game === game) && (!c || x.from === c || x.to === c)).sort((a, b) => (b.date > a.date ? 1 : -1)) },
    heroStats: (tour) => D.heroStats[DB.tour(tour)?.id] || null,
    // игроки турнира: очки, место (rank / prevRank — сутки назад), K/D/A, GPM, герои; { team } — только команда
    playerStats: (tour, { team } = {}) => { const s = D.playerStats[DB.tour(tour)?.id]; if (!s) return []; const c = team && DB.team(team)?.id; return s.list.filter((x) => !c || x.team === c) },
    // команда на турнире: серии [W, L], карты [W, L], форма — 5 последних серий (новые первыми)
    teamStats: (tour, team) => D.teamStats[DB.tour(tour)?.id]?.[DB.team(team)?.id] || null,
    // готовое для вида: имя по месту (полное · среднее · тег), лого
    name: (x, kind = 'name') => { const t = DB.team(x); return t ? t[kind] : String(x ?? '') },
    logo: (x) => url(DB.team(x)?.logo),
  }
})()
