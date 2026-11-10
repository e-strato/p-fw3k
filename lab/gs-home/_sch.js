// Расписание 5 игр — общий слой для главной (gs-home) и «Все турниры» (gs-tours). Дирижёр 10.11.
// Dota 2 — настоящее из ../_db (TI 2026 и турниры на «сейчас» 21.08.2026 16:08 мск). CS2, LoL, Valorant, MLBB — ‼️ ПРИМЕР:
// турниры и команды по памяти, матчи и счёт выдуманы (в базе этих игр нет). Помечаем в подписи лабы.
window.SCH = (() => {
  const DB = window.DB, NOW = DB ? DB.now() : Date.parse('2026-08-21T16:08:00+03:00')
  const GAMES = [
    { id: 'dota2', name: 'Dota 2', short: 'Dota 2', icon: '../portal-header/games/dota.svg' },
    { id: 'cs2', name: 'Counter-Strike 2', short: 'CS2', icon: '../portal-header/games/cs.svg' },
    { id: 'lol', name: 'League of Legends', short: 'LoL', icon: '../portal-header/games/lol.svg' },
    { id: 'val', name: 'Valorant', short: 'Valorant', icon: '../portal-header/games/val.svg' },
    { id: 'mlbb', name: 'Mobile Legends', short: 'MLBB', icon: '../portal-header/games/mlbb.jpg' },
  ]
  const G = Object.fromEntries(GAMES.map((g) => [g.id, g]))
  // тир: S → 1, A → 2, B → 3 (как в виджете турниров: T1 · T2 · T3)
  const TIER = { S: 1, A: 2, B: 3 }

  // ── команды-пример (не Dota): имя, тег, цвет заглушки-лого
  const FT = {}
  const ft = (game, id, name, tag, c) => (FT[id] = { id, game, name, mid: name.replace(/^Team /, ''), tag, color: c, stub: true })
  ;[['vitality', 'Team Vitality', 'VIT', '#f5c400'], ['mouz', 'MOUZ', 'MOUZ', '#e63946'], ['spirit-cs', 'Team Spirit', 'Spirit', '#c9ccd1'], ['navi', 'Natus Vincere', 'NAVI', '#f2d600'],
    ['faze', 'FaZe Clan', 'FaZe', '#e3343a'], ['g2', 'G2 Esports', 'G2', '#d0d3d8'], ['mongolz', 'The MongolZ', 'MGLZ', '#e8b04a'], ['falcons-cs', 'Team Falcons', 'Falcons', '#2bb673'],
    ['big', 'BIG', 'BIG', '#ffffff'], ['ence', 'ENCE', 'ENCE', '#2a7de1'], ['9ine', '9INE', '9INE', '#c7a45a'], ['sashi', 'Sashi Esport', 'Sashi', '#ff6a3d'],
  ].forEach((x) => ft('cs2', ...x))
  ;[['t1', 'T1', 'T1', '#e2012d'], ['geng', 'Gen.G', 'GEN', '#aa8a00'], ['hle', 'Hanwha Life Esports', 'HLE', '#f47b20'], ['dk', 'Dplus KIA', 'DK', '#1fb7a6'],
    ['g2-lol', 'G2 Esports', 'G2', '#d0d3d8'], ['fnc', 'Fnatic', 'FNC', '#ff5900'], ['kc', 'Karmine Corp', 'KC', '#1a6bff'], ['bds', 'Team BDS', 'BDS', '#e5007e'],
  ].forEach((x) => ft('lol', ...x))
  ;[['prx', 'Paper Rex', 'PRX', '#e94e77'], ['sen', 'Sentinels', 'SEN', '#e3102b'], ['fnc-val', 'Fnatic', 'FNC', '#ff5900'], ['edg', 'EDward Gaming', 'EDG', '#b0b5bb'],
    ['th', 'Team Heretics', 'TH', '#f2c230'], ['geng-val', 'Gen.G', 'GEN', '#aa8a00'],
  ].forEach((x) => ft('val', ...x))
  ;[['onic', 'ONIC Esports', 'ONIC', '#f6d10a'], ['rrq', 'RRQ Hoshi', 'RRQ', '#f39c12'], ['evos', 'EVOS Glory', 'EVOS', '#1e88e5'], ['ae', 'Alter Ego', 'AE', '#e0e0e0'],
    ['btr', 'Bigetron Alpha', 'BTR', '#e53935'], ['gf', 'Geek Fam ID', 'GEEK', '#8e44ad'], ['tlid', 'Team Liquid ID', 'TLID', '#3b82f6'], ['dewa', 'Dewa United', 'DEWA', '#c0392b'],
  ].forEach((x) => ft('mlbb', ...x))

  // ── турниры: Dota — из базы; остальные — пример
  const T = {}
  const DBT = DB ? DB.tours() : []
  DBT.forEach((t) => (T[t.id] = { id: t.id, game: 'dota2', name: t.name, short: t.short || t.name, tier: TIER[t.tier] || 3, state: t.state, from: t.from, to: t.to,
    prize: t.prize, stage: t.state === 'live' ? (t.stage || '') : '', logo: t.logo ? '../' + t.logo : '', teams: (t.teams || []).length || null, // участники «скоро» в базе неизвестны
    format: t.id === 'ti-2026' ? 'Швейцарка → плей-офф' : { groups: 'Группы', bracket: 'Сетка' }[typeof t.format === 'string' ? t.format : 'groups'] || '', where: t.id === 'ti-2026' ? 'Шанхай · LAN' : '', // город TI — src/web/ti-2026.json
    winner: t.id === 'universe-ep7' ? 'heroic' : null, real: true }))
  const ftour = (o) => (T[o.id] = { stage: '', logo: '', teams: 8, where: 'LAN', winner: null, ...o })
  ftour({ id: 'iem-cologne-26', game: 'cs2', name: 'IEM Cologne 2026', tier: 1, state: 'live', from: '2026-08-12', to: '2026-08-24', prize: '$1 000 000', stage: 'Плей-офф · четвертьфинал', teams: 24, format: 'Группы → плей-офф', where: 'Кёльн · LAN' })
  ftour({ id: 'cct-eu-5', game: 'cs2', name: 'CCT Europe Series 5', tier: 3, state: 'live', from: '2026-08-18', to: '2026-08-30', prize: '$50 000', stage: 'Группы · день 4', teams: 16, format: 'Группы → плей-офф', where: 'Онлайн' })
  ftour({ id: 'blast-open-fall', game: 'cs2', name: 'BLAST Open Fall 2026', tier: 1, state: 'soon', from: '2026-09-09', to: '2026-09-20', prize: '$400 000', teams: 16, format: 'Группы → плей-офф', where: 'Лиссабон · LAN' })
  ftour({ id: 'blast-open-q', game: 'cs2', name: 'BLAST Open Fall: Closed Qualifier', tier: 3, state: 'soon', from: '2026-08-22', to: '2026-08-25', prize: '—', teams: 16, format: 'Double elimination', where: 'Онлайн' })
  ftour({ id: 'esl-pl-23', game: 'cs2', name: 'ESL Pro League Season 23', tier: 1, state: 'done', from: '2026-07-01', to: '2026-07-20', prize: '$850 000', teams: 32, format: 'Группы → плей-офф', where: 'Мальта · LAN', winner: 'vitality' })
  ftour({ id: 'lck-summer', game: 'lol', name: 'LCK Summer 2026', tier: 1, state: 'live', from: '2026-06-17', to: '2026-08-30', prize: '₩300 000 000', stage: 'Плей-офф · раунд 2', teams: 10, format: 'Лига → плей-офф', where: 'Сеул · LAN' })
  ftour({ id: 'lec-summer', game: 'lol', name: 'LEC Summer 2026', tier: 1, state: 'live', from: '2026-06-14', to: '2026-08-31', prize: '€80 000', stage: 'Плей-офф · верхняя сетка', teams: 10, format: 'Лига → плей-офф', where: 'Берлин · LAN' })
  ftour({ id: 'worlds-26', game: 'lol', name: 'LoL Worlds 2026', tier: 1, state: 'soon', from: '2026-09-29', to: '2026-11-07', prize: '$5 000 000', teams: 20, format: 'Швейцарка → плей-офф', where: 'США · LAN' })
  ftour({ id: 'msi-26', game: 'lol', name: 'MSI 2026', tier: 1, state: 'done', from: '2026-06-27', to: '2026-07-12', prize: '$2 000 000', teams: 10, format: 'Плей-офф', where: 'Ванкувер · LAN', winner: 'geng' })
  ftour({ id: 'vct-champions', game: 'val', name: 'VCT Champions 2026', tier: 1, state: 'live', from: '2026-08-06', to: '2026-08-30', prize: '$2 250 000', stage: 'Плей-офф · верхняя сетка', teams: 16, format: 'Группы → плей-офф', where: 'Париж · LAN' })
  ftour({ id: 'vct-masters', game: 'val', name: 'VCT Masters Toronto 2026', tier: 1, state: 'done', from: '2026-06-07', to: '2026-06-22', prize: '$1 000 000', teams: 12, format: 'Швейцарка → плей-офф', where: 'Торонто · LAN', winner: 'prx' })
  ftour({ id: 'mpl-id-18', game: 'mlbb', name: 'MPL ID Season 18', tier: 2, state: 'live', from: '2026-07-26', to: '2026-09-28', prize: '$300 000', stage: 'Регулярный сезон · неделя 4', teams: 9, format: 'Лига → плей-офф', where: 'Джакарта · LAN' })
  ftour({ id: 'm7-world', game: 'mlbb', name: 'M7 World Championship', tier: 1, state: 'soon', from: '2026-12-01', to: '2026-12-20', prize: '$1 000 000', teams: 22, format: 'Группы → плей-офф', where: 'Онлайн → LAN' })
  ftour({ id: 'msc-26', game: 'mlbb', name: 'MSC 2026', tier: 1, state: 'done', from: '2026-07-08', to: '2026-07-20', prize: '$3 000 000', teams: 16, format: 'Группы → плей-офф', where: 'Эр-Рияд · LAN', winner: 'onic' })

  // ── матчи. state: soon · draft · live · pause · break · done · delayed · moved · cancel · tba (дата без времени)
  const M = []
  const day = (d, hm) => `2026-08-${d}T${hm}+03:00`
  const fm = (o) => M.push({ bo: 3, score: null, ...o, ex: true })
  // Dota — из базы: TI 20–21.08 + следующий известный матч
  if (DB) DB.matches({ tour: 'ti-2026' }).filter((m) => m.start >= '2026-08-20').forEach((m) => M.push({ id: m.id, game: 'dota2', tour: 'ti-2026', a: m.a, b: m.b, bo: m.bo, score: m.score, start: m.start,
    state: m.state, map: m.state === 'live' ? 3 : null, clock: m.state === 'live' ? '33′' : null, stage: m.stage, href: m.state === 'live' ? '../gs-match-2/v85-predict.html' : null, chance: m.state === 'live' ? [42, 58] : m.state === 'soon' ? [55, 45] : null, real: true }))
  // CS2
  fm({ id: 'c1', game: 'cs2', tour: 'iem-cologne-26', a: 'faze', b: 'g2', start: day(21, '12:30'), state: 'done', score: [2, 0], stage: 'Четвертьфинал' })
  fm({ id: 'c2', game: 'cs2', tour: 'iem-cologne-26', a: 'vitality', b: 'mouz', start: day(21, '15:30'), state: 'live', score: [0, 0], map: 1, rounds: [11, 8], stage: 'Четвертьфинал', chance: [64, 36] })
  fm({ id: 'c3', game: 'cs2', tour: 'iem-cologne-26', a: 'spirit-cs', b: 'navi', start: day(22, '15:00'), state: 'soon', stage: 'Четвертьфинал', chance: [57, 43] })
  fm({ id: 'c4', game: 'cs2', tour: 'iem-cologne-26', a: 'mongolz', b: 'falcons-cs', start: day(22, '18:30'), state: 'soon', stage: 'Четвертьфинал', chance: [48, 52] })
  fm({ id: 'c5', game: 'cs2', tour: 'iem-cologne-26', a: 'vitality', b: 'faze', start: day(20, '18:00'), state: 'done', score: [2, 1], stage: 'Группа A · финал' })
  fm({ id: 'c6', game: 'cs2', tour: 'cct-eu-5', a: 'big', b: 'ence', start: day(21, '14:30'), state: 'pause', score: [1, 0], map: 2, rounds: [6, 9], stage: 'Группа B', bo: 3 })
  fm({ id: 'c7', game: 'cs2', tour: 'cct-eu-5', a: '9ine', b: 'sashi', start: day(21, '17:30'), state: 'moved', to: day(22, '13:00'), stage: 'Группа B' })
  fm({ id: 'c8', game: 'cs2', tour: 'blast-open-q', a: 'ence', b: 'sashi', start: '2026-08-22', state: 'tba', stage: 'Верхняя сетка · раунд 1', bo: 1 })
  fm({ id: 'c9', game: 'cs2', tour: 'blast-open-q', a: 'big', b: '9ine', start: '2026-08-22', state: 'tba', stage: 'Верхняя сетка · раунд 1', bo: 1 })
  // LoL
  fm({ id: 'l1', game: 'lol', tour: 'lck-summer', a: 'geng', b: 't1', start: day(21, '11:00'), state: 'done', score: [1, 3], bo: 5, stage: 'Плей-офф · раунд 2' })
  fm({ id: 'l2', game: 'lol', tour: 'lck-summer', a: 'hle', b: 'dk', start: day(21, '16:00'), state: 'draft', score: [0, 0], map: 1, bo: 5, stage: 'Плей-офф · раунд 2', chance: [61, 39] })
  fm({ id: 'l3', game: 'lol', tour: 'lec-summer', a: 'g2-lol', b: 'fnc', start: day(21, '19:00'), state: 'soon', bo: 5, stage: 'Верхняя сетка · полуфинал', chance: [58, 42] })
  fm({ id: 'l4', game: 'lol', tour: 'lec-summer', a: 'kc', b: 'bds', start: day(22, '19:00'), state: 'soon', bo: 5, stage: 'Нижняя сетка · раунд 2', chance: [66, 34] })
  fm({ id: 'l5', game: 'lol', tour: 'lck-summer', a: 't1', b: 'hle', start: day(23, '11:00'), state: 'soon', bo: 5, stage: 'Финал верхней сетки' })
  // Valorant
  fm({ id: 'v1', game: 'val', tour: 'vct-champions', a: 'prx', b: 'sen', start: day(21, '15:00'), state: 'live', score: [1, 0], map: 2, rounds: [9, 7], stage: 'Верхняя сетка · полуфинал', chance: [70, 30] })
  fm({ id: 'v2', game: 'val', tour: 'vct-champions', a: 'fnc-val', b: 'edg', start: day(21, '14:00'), state: 'break', score: [1, 1], map: 3, inMin: 6, stage: 'Нижняя сетка · раунд 3', chance: [52, 48] })
  fm({ id: 'v3', game: 'val', tour: 'vct-champions', a: 'th', b: 'geng-val', start: day(21, '18:00'), state: 'soon', stage: 'Нижняя сетка · раунд 3', chance: [45, 55] })
  fm({ id: 'v4', game: 'val', tour: 'vct-champions', a: 'edg', b: 'th', start: day(20, '18:00'), state: 'done', score: [2, 1], stage: 'Нижняя сетка · раунд 2' })
  // MLBB
  fm({ id: 'm1', game: 'mlbb', tour: 'mpl-id-18', a: 'onic', b: 'rrq', start: day(21, '13:00'), state: 'done', score: [2, 1], stage: 'Неделя 4' })
  fm({ id: 'm2', game: 'mlbb', tour: 'mpl-id-18', a: 'btr', b: 'gf', start: day(21, '15:30'), state: 'delayed', delay: 60, stage: 'Неделя 4' })
  fm({ id: 'm3', game: 'mlbb', tour: 'mpl-id-18', a: 'evos', b: 'ae', start: day(21, '18:30'), state: 'soon', stage: 'Неделя 4', chance: [53, 47] })
  fm({ id: 'm4', game: 'mlbb', tour: 'mpl-id-18', a: 'tlid', b: 'dewa', start: day(21, '20:30'), state: 'cancel', stage: 'Неделя 4' })
  fm({ id: 'm5', game: 'mlbb', tour: 'mpl-id-18', a: 'rrq', b: 'evos', start: day(22, '16:00'), state: 'soon', stage: 'Неделя 4' })
  fm({ id: 'm6', game: 'mlbb', tour: 'mpl-id-18', a: 'ae', b: 'onic', start: day(20, '17:00'), state: 'done', score: [0, 2], stage: 'Неделя 4' })

  // ── вид команды: имя по месту, лого или заглушка с тегом
  const team = (id) => FT[id] || (DB && DB.team(id)) || { id, name: id, mid: id, tag: id }
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const logo = (id, s = 20) => { const t = team(id); if (t.logo) return `<img class="sc-lg" style="width:${s}px;height:${s}px" src="../${esc(t.logo)}" alt="">`
    const c = t.color || '#71717a'; return `<span class="sc-lg sc-lg--stub" style="width:${s}px;height:${s}px;--c:${c};font-size:${Math.round(s * 0.36)}px">${esc((t.tag || '?').slice(0, 4))}</span>` }
  const name = (id, k = 'name') => esc(team(id)[k] || team(id).name)
  const gameIc = (g, s = 16) => `<img class="sc-gi" style="width:${s}px;height:${s}px" src="${G[g].icon}" alt="${esc(G[g].short)}" title="${esc(G[g].name)}">`
  const tourLogo = (t, s = 20) => t.logo ? `<img class="sc-tl" style="width:${s}px;height:${s}px" src="${esc(t.logo)}" alt="">` : `<span class="sc-tl sc-tl--stub" style="width:${s}px;height:${s}px">${esc(t.name.replace(/[^A-ZА-Я0-9]/g, '').slice(0, 3) || t.name[0])}</span>`
  const tierTag = (n) => `<span class="sc-tier sc-tier--${n}">Tier ${n}</span>`
  const hm = (iso) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' })
  const ymd = (iso) => (iso.length === 10 ? iso : new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' }))
  const TODAY = ymd(new Date(NOW).toISOString())
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const MONN = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  const WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
  const dayDiff = (d) => Math.round((Date.parse(d + 'T12:00:00Z') - Date.parse(TODAY + 'T12:00:00Z')) / 864e5)
  const dayName = (d) => { const k = dayDiff(d), x = new Date(d + 'T12:00:00Z'); const w = k === 0 ? 'Сегодня' : k === 1 ? 'Завтра' : k === -1 ? 'Вчера' : WD[x.getUTCDay()][0].toUpperCase() + WD[x.getUTCDay()].slice(1); return `${w} · ${x.getUTCDate()} ${MON[x.getUTCMonth()]}` }
  const dm = (d) => `${d.slice(8, 10)}.${d.slice(5, 7)}`
  const LIVE = ['live', 'draft', 'pause', 'break']
  return { GAMES, G, T, M, NOW, TODAY, team, logo, name, gameIc, tourLogo, tierTag, hm, ymd, dayName, dayDiff, dm, MONN, MON, esc, LIVE }
})()
