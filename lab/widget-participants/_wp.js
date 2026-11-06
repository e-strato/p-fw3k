// Виджет «Участники» (лаба widget-participants, v30; с флагом flt — v34: форма только в списке колонками, вид первым, на телефоне «Фильтры» → шторка) — модуль для лабы и страницы турнира: window.WP.mount(el, { who, phone }).
// Данные — _data.js (Liquipedia, PU_TEAMS); пути картинок — от window.WP_BASE. ‼️ Пример: рейтинги, форма, объявленные замены, тексты меток.
window.WP = (() => {
  const ID = { '1w Team': '1w', 'Astra Invicta': 'astra', 'BetBoom Team': 'bb', GamerLegion: 'gl', OG: 'og', PARIVISION: 'pv', 'Team Liquid': 'liq', 'Team Spirit': 'ts', 'Team Yandex': 'ya', LEGION: 'lg' }
  const B = window.WP_BASE || ''   // путь к папке виджета: картинки в _data.js — от неё (img/…)
  const TEAMS = PU_TEAMS.map((t) => ({ ...t, logo: B + t.logo, tabs: t.tabs.map((x) => ({ ...x, m: x.m.map((m) => ({ ...m, fsrc: m.fsrc && B + m.fsrc, team: m.team && [m.team[0], B + m.team[1]] })) })) })).map((t) => {
    const main = t.tabs[0].m, subs = t.tabs.find((x) => x.tab === 'Subs')?.m ?? []
    return { ...t, id: ID[t.name] || t.dbId, p: main.filter((x) => x.role !== 'Coach'), coach: main.find((x) => x.role === 'Coach'), subs }
  })
  // Типы замены (§2.5) — игровые термины по-английски (решение 34)
  const TYPES = [['map', 'Map'], ['series', 'Series'], ['day', 'Day'], ['tour', 'Tournament']]
  const ROLE = { 1: 'Pos 1 · Carry', 2: 'Pos 2 · Mid', 3: 'Pos 3 · Offlane', 4: 'Pos 4 · Soft support', 5: 'Pos 5 · Hard support' }
  const tl = (k) => TYPES.find((x) => x[0] === k)[1]
  // ‼️ пример: замены, уже объявленные на турнире
  // v44 (на странице есть window.DB — общая база _db, «сейчас» 21.08.2026, TI): замены — из выдуманной базы (Topson — настоящая), метки и «рассказ ростера» — из настоящих переходов,
  //   рейтинг — из очков игрока на TI (формула MVP, на карту), форма и серии — настоящие серии TI, частые пики и баны — настоящие (OpenDota)
  const DBM = !!window.DB, DBD = DBM ? window.DB.data : null
  const SUBS0 = DBM ? {} : { ya: [{ pos: 3, who: 'Xibbe', type: 'day', why: 'день 2' }], lg: [{ pos: 2, who: '4nalog', type: 'map', why: 'Map 2 против BB' }] }
  // Метки у игрока (§2.7, 2.8, 2.10) и «рассказ ростера» (§2.11, 2.12): auto — система, ed — редакция. ‼️ тексты — пример по словам начальника
  const MARK = { 'Save-': '4 → 2', swedenstrong: 'новый на 4', Batyuk: 'вернулся', m1CKe: 'пара · Boxi', Boxi: 'пара · m1CKe', Yuma: '1 мес. в команде', ATF: 'вместо DM' }
  const DTT = window.DB_TOUR || 'ti-2026' // v45: турнир страницы (переключатель); замены и переходы — только у TI (на 21.08), у Ep. 7 — стендин из источников
  if (DBM && DTT === 'ti-2026') { const TERM = { map: 'map', match: 'series', tournament: 'tour' }
    for (const x of window.DB.subs()) { const o = DBD.players[x.out]; if (!o) continue; (SUBS0[x.team] ||= []).push({ pos: typeof o.role === 'number' ? o.role : 1, who: DBD.players[x.in]?.nick, type: TERM[x.term] || 'map', why: x.real ? 'стендин на турнир' : x.reason }) } }
  const STORY = {
    astra: [['auto', 'OmaR и GH — долго в одной команде'], ['auto', 'lorenof играл с OmaR и GH один турнир']],
    bb: [['auto', 'Save- перешёл с 4 на 2, на 4 — swedenstrong']],
    gl: [['auto', '4 игрока вместе 3 турнира'], ['ed', 'Yuma пришёл месяц назад — с ним стали играть лучше']],
    liq: [['auto', 'm1CKe и Boxi — 500+ матчей вместе']],
    ts: [['auto', 'Batyuk вернулся: Spirit → академия → Spirit']],
    ya: [['auto', 'ATF вместо DM на 3 — рейтинг выше']],
    pv: [['auto', 'Новая команда — раньше вместе не играли']],
  }
  if (DBM && DTT !== 'ti-2026') { for (const k of Object.keys(MARK)) delete MARK[k]; for (const k of Object.keys(STORY)) delete STORY[k]
    for (const x of DBD.tours[DTT].standins || []) { const nk = (s) => (String(s || '').match(/"([^"]+)"/) || [])[1]; if (x.in && nk(x.in)) { MARK[nk(x.in)] = 'стендин'; (STORY[x.team] ||= []).push(['auto', `${nk(x.in)} — стендин вместо ${nk(x.out)}`]) } else if (x.note) (STORY[x.team] ||= []).push(['auto', x.note]) } }
  if (DBM && DTT === 'ti-2026') { for (const k of Object.keys(MARK)) delete MARK[k]; for (const k of Object.keys(STORY)) delete STORY[k]
    const dd = (s) => s.slice(8, 10) + '.' + s.slice(5, 7), nm = (id) => DBD.teams[id]?.name
    for (const x of window.DB.transfers().slice().reverse()) { const p = DBD.players[x.player]; if (!p) continue
      if (x.kind === 'join' && x.to) { MARK[p.nick] = `новый · ${dd(x.date)}`; (STORY[x.to] ||= []).push(['auto', `${p.nick} пришёл${x.from ? ' из ' + nm(x.from) : ''} — ${dd(x.date)}`]) }
      if (x.kind === 'standin' && x.to) { MARK[p.nick] = 'стендин'; (STORY[x.to] ||= []).push(['auto', `${p.nick} — стендин на TI с ${dd(x.date)}`]) }
      if (x.kind === 'coach' && x.to) (STORY[x.to] ||= []).push(['auto', `Тренер — ${p.nick}, с ${dd(x.date)}`])
      if ((x.kind === 'inactive' || x.kind === 'leave') && x.from) (STORY[x.from] ||= []).push(['auto', `${p.nick} ${x.kind === 'inactive' ? 'в инактиве' : 'ушёл'} — ${dd(x.date)}`]) } }
  // ‼️ пример: рейтинг на этот турнир (§2.14, 2.16) — устойчивое псевдослучайное от ника; базовый 60–94, производный ±6
  const h = (s) => { let x = 7; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x }
  const rate = (n) => { const b = 60 + h(n) % 35; return { b, d: b - 6 + h(n + '·') % 13 } }
  // DB: рейтинг 60–94 — по очкам за карту на TI среди всех игроков турнира; «производный» — по очкам за последнюю неделю
  const PSx = DBM ? Object.fromEntries(window.DB.playerStats(window.DB_TOUR || 'ti-2026').map((x) => [DBD.players[x.player].nick, x])) : {}
  const ppm = (x, w) => (w ? x.week / Math.max(1, x.weekMaps) : x.pts / Math.max(1, x.maps)), PV = Object.values(PSx), lo = Math.min(...PV.map((x) => ppm(x))), hi = Math.max(...PV.map((x) => ppm(x)))
  const sc = (v) => Math.round(60 + ((v - lo) / Math.max(1, hi - lo)) * 34)
  const rOf0 = (t, n) => (DBM ? (PSx[n] ? { b: sc(ppm(PSx[n])), d: sc(ppm(PSx[n], true)) } : { b: 60, d: 60 }) : rate(n.startsWith('Запасной') ? n + t.id : n))
  // v35 (r4, созвон 02.11 §2.3): рейтинг — четыре цифры, ближе к Elo / Glicko (1620–1860 у игроков); ‼️ пример — тот же расчёт, растянут
  const rOf = (t, n) => { const r = rOf0(t, n); return S.r4 ? { b: 1200 + r.b * 7 + h(n) % 7, d: 1200 + r.d * 7 + h(n + 'd') % 7 } : r }
  const dTeam = (t) => { if (DBM) { const s = window.DB.teamStats(window.DB_TOUR || 'ti-2026', t.id); return s ? (s.series[0] - s.series[1]) * 3 : 0 } return (h(t.id + 'Δ') % 31) - 12 }   // ‼️ пример: сдвиг рейтинга команды за турнир
  const HEROES = ['abyssal_underlord', 'alchemist', 'axe', 'bane', 'centaur', 'clinkz', 'crystal_maiden', 'dark_seer', 'dark_willow', 'dawnbreaker', 'dazzle', 'doom_bringer', 'earth_spirit', 'earthshaker', 'ember_spirit', 'enchantress', 'enigma', 'faceless_void', 'furion', 'grimstroke', 'hoodwink', 'invoker', 'kez', 'largo', 'life_stealer', 'lina', 'lion', 'lycan', 'mirana', 'monkey_king', 'nevermore', 'night_stalker', 'pangolier', 'phantom_lancer', 'primal_beast', 'puck', 'rattletrap', 'razor', 'ringmaster', 'rubick', 'sand_king', 'shadow_demon', 'shredder', 'slardar', 'snapfire', 'spirit_breaker', 'storm_spirit', 'templar_assassin', 'terrorblade', 'tidehunter', 'treant', 'tusk', 'undying', 'void_spirit', 'windrunner', 'winter_wyvern', 'wisp']
  // ‼️ пример: частые пики и баны команды на турнире — 5 героев и число матчей
  const draft = (t, salt) => { if (DBM) { const s = window.DB.teamStats(window.DB_TOUR || 'ti-2026', t.id); return (s?.[salt === 'p' ? 'picks' : 'bans'] || []).slice(0, 5) }
    const used = new Set(); return [...Array(5)].map((_, i) => { let k = h(t.id + salt + i) % HEROES.length; while (used.has(k)) k = (k + 1) % HEROES.length; used.add(k); return [HEROES[k], 9 - i - (h(t.id + salt + i) % 2)] }) }
  const FORM = (id) => (DBM ? (window.DB.teamStats(window.DB_TOUR || 'ti-2026', id)?.form || []).map((f) => (f.win ? 'W' : 'L')) : [...Array(5)].map((_, i) => (h(id + i) % 3 ? 'W' : 'L')))
  // v34: форма — серии со счётом (пример): [наши, их, соперник, дата]; цвет — как тепловая карта групповой
  const SER = (id) => DBM ? (window.DB.teamStats(window.DB_TOUR || 'ti-2026', id)?.form || []).map((f) => { const m = DBD.matches.find((x) => x.id === f.match); return [f.score[0], f.score[1], DBD.teams[f.vs].name, m.start.slice(8, 10) + '.' + m.start.slice(5, 7)] }) : FORM(id).map((r, i) => { const x = h(id + 'm' + i), o = TEAMS[x % TEAMS.length].id === id ? TEAMS[(x + 1) % TEAMS.length] : TEAMS[x % TEAMS.length], c = x % 2 ? 0 : 1
    return r === 'W' ? [2, c, o.name, (24 - i * 3) + '.10'] : [c, 2, o.name, (24 - i * 3) + '.10'] })
  const tone = (v) => v[0] > v[1] ? (v[1] === 0 ? 'w2' : 'w1') : (v[0] === 0 ? 'l2' : 'l1')
  const flagOf = (t, n) => [...t.p, ...t.subs, t.coach].find((x) => x?.nick === n)?.fsrc

  const WHO = [{ id: 'fan', name: 'Зритель' }, { id: 'ed', name: 'Редактор' }]
  const S = { colAll: false, open: {}, shut: {}, colMode: null, order: TEAMS.map((_, i) => i), sort: 'seed', story: {}, who: 'fan', dev: 0, view: 'teams', lm: 'info', sheet: false, flt: false, pos: 1, form: 'off', n16: 'off', col: {}, tab: {}, swap: structuredClone(SUBS0) }
  let w = null
  const chev = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const cur = (t) => t.p.map((x, i) => { const s = (S.swap[t.id] || []).find((y) => y.pos === i + 1); return s ? { nick: s.who, sub: s, was: x.nick } : { nick: x.nick } })
  const teamRate = (t) => Math.round(cur(t).reduce((a, x) => a + rOf(t, x.nick).b, 0) / 5)
  const fl = (src) => (src ? `<img class="f" src="${src}">` : '<img class="f" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">')
  // место среди игроков той же позиции на турнире (основа, с текущими заменами): топ-3 — hi, последние 3 — lo, остальные — mid
  const tier = (pos, b) => { const all = TEAMS.map((t) => rOf(t, cur(t)[pos - 1].nick).b).sort((x, y) => y - x); return b >= all[2] ? 'hi' : b <= all[all.length - 3] ? 'lo' : 'mid' }
  const rt = (r, d = '', pos) => `<span class="pt-rt"><b class="${pos && !S.r4 ? tier(pos, r.b) : ''}">${r.b}</b>${S.r5 && !S.r2 ? '' : `<i${S.r2 ? ` class="r2 r2s${S.r2ns ? ' r2ns' : ''}"` : ''}>${r.d}</i>`}${d}</span>`

  const POSI = (k) => `<span class="p" title="${ROLE[k]}">${k}</span>`
  // v39 (r8): линия слева — у игроков, которые давно играют вместе (созвон 02.11, 2·20:03: «пара Boxi — пара m1CKe, линию между ними слева»), а не у замены. ‼️ пример: позиции пары
  const PAIRS0 = { liq: [1, 4] }
  // v40 (r9): пар больше — по «рассказу ростера» и для показа. ‼️ пример: Liquid m1CKe + Boxi, Astra OmaR + GH, GamerLegion — 4 игрока вместе 3 турнира (поз. 2–5), Spirit Yatoro + Larl
  const PAIRS9 = { liq: [1, 4], astra: [4, 5], gl: [2, 5], ts: [1, 2] }
  // v41 (r10): у команды может быть несколько пар — каждая своей дорожкой слева, линии не накладываются. ‼️ пример: Liquid 1+4 и 2+5
  const PAIRS10 = { liq: [[1, 4], [2, 5]], astra: [[4, 5]], gl: [[2, 5]], ts: [[1, 2]] }
  const prs = (t, pos) => (PAIRS10[t.id] || []).map(([a, b], ln) => pos < a || pos > b ? '' : `<i class="pr ${pos === a ? 'pr-a' : pos === b ? 'pr-b' : 'pr-m'}" style="--ln:${ln}"></i>`).join('')
  // v42+ (o.pm): другие способы показать две пары в одной команде
  //   dots — цветная точка перед ником, у пары один цвет · sides — первая пара скобкой слева, вторая — справа · hover — линий нет, у ника значок связи; наведение — подсвечивается пара и её скобка · tag — буква пары «A» / «B» цветом после ника
  const PC = ['#a78bfa', '#38bdf8']
  const myPairs = (t, pos) => (PAIRS10[t.id] || []).map(([a, b], ln) => ({ a, b, ln, on: pos === a || pos === b, in: pos >= a && pos <= b })).filter((x) => x.in)
  const pmBefore = (t, pos) => { const m = myPairs(t, pos)
    if (S.pm === 'dots') return m.filter((x) => x.on).map((x) => `<i class="pdot" style="--pc:${PC[x.ln]}" title="Давно играют вместе"></i>`).join('')
    if (S.pm === 'sides') return m.map((x) => `<i class="pr ${pos === x.a ? 'pr-a' : pos === x.b ? 'pr-b' : 'pr-m'}${x.ln ? ' pr-r' : ''}" style="--ln:0;--pc:${PC[x.ln]}"></i>`).join('')
    if (S.pm === 'hover') return m.map((x) => `<i class="pr pr-h ${pos === x.a ? 'pr-a' : pos === x.b ? 'pr-b' : 'pr-m'}" data-ln="${x.ln}" style="--ln:0;--pc:${PC[x.ln]}"></i>`).join('')
    return '' }
  const pmAfter = (t, pos) => { const m = myPairs(t, pos).filter((x) => x.on)
    if (S.pm === 'tag') return m.map((x) => `<span class="ptag" style="--pc:${PC[x.ln]}" title="Пара ${'AB'[x.ln]} — давно играют вместе">${'AB'[x.ln]}</span>`).join('')
    if (S.pm === 'hover' && m.length) return `<span class="plink" title="Давно играют вместе"><svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 7 7 5M4.2 5.6 3 6.8a1.7 1.7 0 0 0 2.4 2.4l1.2-1.2M7.8 6.4 9 5.2a1.7 1.7 0 0 0-2.4-2.4L5.4 4"/></svg></span>`
    return '' }
  const pmData = (t, pos) => S.pm === 'hover' ? ` data-pg="${myPairs(t, pos).filter((x) => x.on).map((x) => x.ln).join(' ')}"` : ''
  const PAIRS = new Proxy({}, { get: (_, k) => (S.r9 ? PAIRS9 : PAIRS0)[k] })
  const pairCls = (t, pos) => { const p = S.r8 && PAIRS[t.id]; if (!p || pos < p[0] || pos > p[1]) return ''; return pos === p[0] ? ' pr-a' : pos === p[1] ? ' pr-b' : ' pr-m' }
  function main4(t, i) {
    return cur(t).map((x, k) => { const r = rOf(t, x.nick), ed = S.who === 'ed' ? ' is-btn' : ''
      const mk = !x.sub && MARK[x.nick] && !(S.r8 && MARK[x.nick].startsWith('пара')) ? `<span class="pt-mk">${MARK[x.nick]}</span>` : ''
      const one = (nick, extra, cls) => `<div${S.pm ? pmData(t, k + 1) : ''} class="pt-r${cls}${ed}${S.r10 ? '' : pairCls(t, k + 1)}"${S.r8 && pairCls(t, k + 1) ? ` title="${t.id === 'gl' ? '4 игрока вместе 3 турнира' : 'Давно играют вместе'}"` : ''} data-t="${i}" data-i="${k}">${S.r10 ? (S.pm ? pmBefore(t, k + 1) : prs(t, k + 1)) : ''}${S.r6 && !S.r7 ? '' : POSI(k + 1)}${fl(flagOf(t, nick))}<span class="n"><span>${nick}${S.pm ? pmAfter(t, k + 1) : ''}${extra}</span></span>${rt(rOf(t, nick), '', k + 1)}${S.r6 && !S.r7 ? POSI(k + 1) : ''}</div>`
      return x.sub && S.r8 ? one(x.nick, `<span class="pt-ty">${tl(x.sub.type)}</span><span class="pt-was">за ${x.was}</span>`, '') : x.sub ? `<div class="pt-sw" title="${x.sub.who} вместо ${x.was}${x.sub.why ? ' · ' + x.sub.why : ''}">${one(x.was, '', ' is-out')}${one(x.nick, `<span class="pt-ty">${tl(x.sub.type)}</span>`, ' is-in')}</div>` : one(x.nick, mk, '')
    }).join('') + (S.r5 ? `<div class="pt-r coach">${S.r6 && !S.r7 ? '' : `<span class="p p--co" ${S.r9 ? 'data-tip="Тренер"' : 'title="Coach · тренер"'}>${S.coMan ? COACH : S.r10 ? `<img src="${B}../gs-match/img/items/${S.coIt}.png" alt="">` : S.r7 ? CO_IC[S.coIc] : WHISTLE}</span>`}${fl(t.coach.fsrc)}<span class="n"><span>${t.coach.nick}</span></span>${S.r6 && !S.r7 ? `<span class="p p--co" title="Coach">${WHISTLE}</span>` : ''}</div>` : '') }
  function main(t, i) {
    if (S.r4) return main4(t, i)
    return cur(t).map((x, k) => {
      const r = rOf(t, x.nick); let d = ''
      const mk = !x.sub && MARK[x.nick] ? `<span class="pt-mk">${MARK[x.nick]}</span>` : ''
      return `<div class="pt-r${S.who === 'ed' ? ' is-btn' : ''}" data-t="${i}" data-i="${k}"${x.sub ? ` title="вместо ${x.was}${x.sub.why ? ' · ' + x.sub.why : ''}"` : ''}>${fl(flagOf(t, x.nick))}<span class="n"><span>${x.nick}${x.sub ? `<span class="pt-ty">${tl(x.sub.type)}</span><span class="pt-was">за ${x.was}</span>` : mk}</span></span>${rt(r, d, k + 1)}<span class="p" title="${ROLE[k + 1]}">${k + 1}</span></div>`
    }).join('') + `<div class="pt-r coach">${fl(t.coach.fsrc)}<span class="n"><span>${t.coach.nick}</span></span><span class="cz"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="7.2" r="2.8"/><path d="M6.8 5.6 11 3.5M7.3 7.2H11"/></svg>Coach</span></div>`
  }
  const subsList = (t) => t.subs.map((x) => S.r7 ? `<div class="pt-r">${POSI(+x.role)}${fl(x.fsrc)}<span class="n"><span>${x.nick}</span></span>${x.team ? `<span class="x"><img src="${x.team[1]}" title="${x.team[0]}"></span>` : ''}${rt(rOf(t, x.nick), '', +x.role)}</div>` : `<div class="pt-r">${fl(x.fsrc)}<span class="n"><span>${x.nick}</span></span>${x.team ? `<span class="x"><img src="${x.team[1]}" title="${x.team[0]}"></span>` : ''}${rt(rOf(t, x.nick), '', +x.role)}<span class="p" title="${ROLE[x.role]}">${x.role}</span></div>`).join('')

  // Сворачивание (дирижёр 28.10: «как на Liquipedia»): S.colAll — свернуть все; S.open / S.shut — исключения по одной команде
  //   colMode 'icon' — кнопка в шапке, свёрнутая команда показывает состав при наведении; 'switch' — тумблер «Составы», нажал на свёрнутую — раскрылась;
  //   'hover' — кнопка в шапке + стрелка у каждой команды (видна при наведении)
  const isCol = (i) => (S.colAll ? !S.open[i] : !!S.shut[i])
  const togCol = (i) => { if (S.colAll) S.open[i] = !S.open[i]; else S.shut[i] = !S.shut[i] }
  const CHV = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l3 3 3-3"/></svg>'
  const I_COL = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2 6 4.5 8.5 2M3.5 10 6 7.5 8.5 10"/></svg>'
  const I_EXP = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 4.5 6 2 8.5 4.5M3.5 7.5 6 10 8.5 7.5"/></svg>'
  const colCtl = () => S.colMode === 'switch'
    ? `<button class="pt-swt ${S.colAll ? '' : 'is-on'}" data-colall role="switch" aria-checked="${!S.colAll}"><i></i>Составы</button>`
    : `<div class="pt-ic"><button data-colall data-tip="${S.colAll ? 'Развернуть составы' : 'Свернуть составы'}" class="${S.colAll ? 'is-on' : ''}">${S.colAll ? I_EXP : I_COL}</button></div>`
  const WHISTLE = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="7.2" r="2.8"/><path d="M6.8 5.6 11 3.5M7.3 7.2H11"/></svg>'
  // v38: значок тренера — на выбор (в Доте своего значка тренера нет): доска с планом · гарнитура · буква C · свисток
  const CO_IC = {
    board: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="8" height="9" rx="1.2"/><path d="M4.5 1.5h3v1.5h-3zM4 6l1.2 1.2M5.2 6 4 7.2M7 5.5l1.5 2.5"/></svg>',
    headset: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.2 7V6a3.8 3.8 0 0 1 7.6 0v1"/><rect x="1.6" y="6.5" width="2" height="3" rx=".8"/><rect x="8.4" y="6.5" width="2" height="3" rx=".8"/><path d="M9.4 9.5c0 1-1 1.5-2.4 1.5"/></svg>',
    c: '<b style="font:700 10px/1 var(--w-font)">C</b>',
    whistle: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="7.2" r="2.8"/><path d="M6.8 5.6 11 3.5M7.3 7.2H11"/></svg>' }
  // v49: значок тренера — человек в кепке (в духе Material Symbols, залитый)
  const COACH = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2c-2.9 0-5.1 1.9-5.4 4.6H5.2a.9.9 0 0 0 0 1.8h1.5v.6c0 2.9 2.4 5.3 5.3 5.3s5.3-2.4 5.3-5.3V9.6H19a1 1 0 0 0 0-2h-1.6C17.1 5.1 14.9 3.2 12 3.2zm-3.5 6.4h7v.6a3.5 3.5 0 0 1-7 0zM12 16.6c-3.6 0-7.4 1.8-7.4 4v.6c0 .5.4.8.8.8h13.2c.4 0 .8-.3.8-.8v-.6c0-2.2-3.8-4-7.4-4z"/></svg>'
  const dots = (t) => `<span class="pt-dots" title="Форма: ${FORM(t.id).join(' ')}">${FORM(t.id).map((r) => `<i class="${r}"></i>`).join('')}</span>`
  const dlt = (t) => { const d = dTeam(t); return d ? `<em class="${d > 0 ? 'up' : 'dn'}" title="${d > 0 ? 'Рейтинг растёт' : 'Рейтинг падает'}">${d > 0 ? '▲' : '▼'}${S.r5 && !S.dnum ? '' : S.dnum ? `<small>${Math.abs(d)}</small>` : Math.abs(d)}</em>` : '' }
  const sub4 = (t) => S.r6 ? `${t.st}${t.q ? ` · ${t.q[0]} <i>${t.q[1]}</i>` : ''}` : S.r5 ? `<span class="pt-st5">${t.st}${t.q ? ` · ${t.q[0]}` : ''}</span><span class="pt-tr4">${teamRate(t)}${dlt(t)}</span>` : `${dots(t)}<span class="pt-tr4">${teamRate(t)}${dlt(t)}</span>`
  function team(t, i) {
    const col = isCol(i), tab = S.tab[i] ?? 0, sw = S.swap[t.id] || []
    return `<div class="pt-tm ${col ? 'is-col' : ''}${S.colMode === 'switch' && S.colAll ? ' is-tap' : ''}" data-drag="${i}">
      ${S.story[i] ? `<div class="pt-th"><button class="pt-back" data-story="${i}" aria-label="Назад к составу"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg></button><span class="nm"><b>Заметки · ${STORY[t.id].length}</b><small><img src="${t.logo}" alt="">${t.name}</small></span></div>` : `<div class="pt-th">${canDrag() ? `<span class="pt-grip" data-grip aria-label="Перетащить">${GRIP}</span>` : ''}<span class="pt-dh" data-dr="${i}"><img src="${t.logo}" alt=""><span class="nm"><b>${t.name}</b><small>${S.r4 ? sub4(t) : `${t.st}${t.q ? ` · ${t.q[0]} <i>${t.q[1]}</i>` : ''}`}</small></span></span>${sw.length && S.who === 'ed' ? `<button class="pt-reset" data-reset="${i}">Вернуть состав</button>` : ''}${S.r6 ? `<span class="tr pt-tr4" title="Рейтинг команды">${teamRate(t)}${dlt(t)}</span>` : S.r5 ? '' : S.r4 ? `<span class="pt-co" data-tip="Coach · ${t.coach.nick}">${WHISTLE}</span>` : `<span class="tr" title="Рейтинг команды">${teamRate(t)}</span>`}${S.colMode === 'hover' ? `<button class="pt-chv" data-colt="${i}" aria-label="${col ? 'Развернуть' : 'Свернуть'}">${CHV}</button>` : ''}</div>`}
      ${S.dm === 'strip' && !S.story[i] ? drStrip(t) : ''}
      ${S.form === 'on' && !S.flt ? `<div class="pt-fm"><span>Форма</span>${FORM(t.id).map((r) => `<i class="${r}">${r}</i>`).join('')}</div>` : ''}
      <div class="pt-bd">
        <div class="pt-list">${S.story[i] ? `<div class="pt-notes">${notes(t)}</div>` : tab === 2 ? drPanel(t) : tab ? subsList(t) : main(t, i)}</div>
        <div class="pt-foot"><div class="pt-ic"><button class="pt-nc${STORY[t.id]?.some((x) => x[0] === 'ed') ? ' is-ed' : ''} ${S.story[i] ? 'is-on' : ''}" data-story="${i}" data-tip="${S.story[i] ? 'Назад к составу' : STORY[t.id]?.length ? `Рассказ ростера · ${STORY[t.id].length} ${STORY[t.id].length === 1 ? 'заметка' : 'заметки'}` : 'Нет заметок'}" ${STORY[t.id]?.length ? '' : 'disabled'}>${STORY[t.id]?.length ? `<sup>${STORY[t.id].length}</sup>` : ''}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M2.5 3h7M2.5 6h7M2.5 9h4.5"/></svg></button></div>${S.who === 'ed' ? `<span class="pt-sq"><button class="pt-add" data-add="${i}" data-tip="Добавить заметку"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M6 2.5v7M2.5 6h7"/></svg></button></span>` : ''}${S.dm === 'tab' ? `<div class="pt-ic"><button data-tab="${i}:2" data-tip="Драфты на турнире" class="${!S.story[i] && tab === 2 ? 'is-on' : ''}">${I_DR}</button></div>` : ''}<span class="sp"></span><div class="pt-ic" role="group" aria-label="Состав"><button data-tab="${i}:0" data-tip="${t.subs.length ? 'Main — основной состав' : sw.length ? `Основной состав · ${sw.length} ${sw.length === 1 ? 'замена' : 'замены'}` : 'Основной состав без изменений'}" class="${!S.story[i] && !tab ? 'is-on' : ''} ${t.subs.length ? '' : 'is-only'}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M6 1.2 10 2.6v3.1c0 2.4-1.7 4.3-4 5.1-2.3-.8-4-2.7-4-5.1V2.6z"/></svg></button>${t.subs.length ? `<button data-tab="${i}:1" data-tip="Subs — запасные · ${t.subs.length}" class="${!S.story[i] && tab ? 'is-on' : ''}"><sup>${t.subs.length}</sup><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7l-2-2M10 8H3l2 2"/></svg></button>` : ''}</div></div>
      </div></div>`
  }

  function byPos() {
    const all = TEAMS.map((t) => { const x = cur(t)[S.pos - 1]; return { t, x, r: rOf(t, x.nick) } }).sort((a, b) => b.r.b - a.r.b)
    return `<div class="pt-pos"><div class="pt-seg">${[1, 2, 3, 4, 5].map((p) => `<button data-pos="${p}" class="${S.pos === p ? 'is-on' : ''}">Pos ${p}</button>`).join('')}</div>
      ${all.map((a, k) => `<div class="pt-r"><span class="k">${k + 1}</span>${fl(flagOf(a.t, a.x.nick))}<span class="n"><span>${a.x.nick}${a.x.sub ? `<span class="pt-ty">${tl(a.x.sub.type)}</span>` : ''}</span></span><span class="tm"><img src="${a.t.logo}"><span>${a.t.name}</span></span><span class="bar"><i style="width:${S.r4 ? (a.r.b - 1200) / 7 : a.r.b}%"></i></span>${rt(a.r, "", S.pos)}</div>`).join('')}</div>`
  }

  // Порядок: посев (S.order — задаёт редактор перетаскиванием), рейтинг команды, по алфавиту
  const SORTS = [['seed', 'Посев'], ['rate', 'Рейтинг'], ['az', 'А–Я']]
  const ordered = () => S.sort === 'seed' ? S.order : [...S.order].sort(S.sort === 'rate' ? (a, b) => teamRate(TEAMS[b]) - teamRate(TEAMS[a]) : (a, b) => TEAMS[a].name.localeCompare(TEAMS[b].name))
  const canDrag = () => S.who === 'ed' && S.sort === 'seed'
  const sortSeg = () => `<div class="pt-ic" role="group" aria-label="Порядок">${SORTS.map(([k, n]) => `<button class="pt-nb ${S.sort === k ? 'is-on' : ''}" data-sort="${k}" data-tip="Порядок: ${n.toLowerCase()}">${n}</button>`).join('')}</div>`
  const GRIP = '<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><circle cx="3" cy="3" r="1"/><circle cx="7" cy="3" r="1"/><circle cx="3" cy="6" r="1"/><circle cx="7" cy="6" r="1"/><circle cx="3" cy="9" r="1"/><circle cx="7" cy="9" r="1"/></svg>'
  function list() {
    if (!S.flt) return listOld()
    const hd = `<div class="pt-lh">${canDrag() ? '<span class="pd"></span>' : ''}<span class="pd">#</span><span class="pd pd--lg"></span><span class="nm">Команда</span><span class="pt-c pt-c--sw">Замены</span><span class="pt-c pt-c--sb">Subs</span><span class="pt-c pt-c--nt">Заметки</span><span class="pt-c pt-c--fm">Форма</span><span class="pt-c pt-c--tr">Рейтинг</span></div>`
    return `<div class="pt-lst pt-lst--${S.lm}">${hd}${ordered().map((i, k) => { const t = TEAMS[i], sw = S.swap[t.id] || [], n = STORY[t.id]?.length ?? 0
      return `<div class="pt-li" data-drag="${i}">${canDrag() ? `<span class="pt-grip" data-grip aria-label="Перетащить">${GRIP}</span>` : ''}<span class="sd">${k + 1}</span><img src="${t.logo}" alt="">
        <span class="nm"><b>${t.name}</b>${S.r4 ? '' : `<small>${t.st}${t.q ? ` · ${t.q[0]} <i>${t.q[1]}</i>` : ''}</small>`}</span>
        <span class="pt-c pt-c--sw">${sw.length ? `<span class="pt-ty">${sw.length} ${sw.length === 1 ? 'замена' : 'замены'}</span>` : '—'}</span>
        <span class="pt-c pt-c--sb">${t.subs.length || '—'}</span><span class="pt-c pt-c--nt">${n || '—'}</span>
        <span class="pt-c pt-c--fm">${SER(t.id).map((v) => `<span class="pt-hf ${tone(v)}" title="${t.name} — ${v[2]} · ${v[3]}">${v[0]}:${v[1]}</span>`).join('')}</span>
        <span class="tr">${teamRate(t)}${S.r4 ? dlt(t) : ''}</span></div>` }).join('')}</div>`
  }

  // v34 (flt): шторка фильтров на телефоне — отдельный слой на body, не перерисовывается с виджетом: сегмент переезжает (_cons.js), разделы раскрываются переходом
  const VIEWS = [['teams', 'Карточки'], ['list', 'Список'], ['pos', 'По позиции']]
  const seg = (arr, key) => `<div class="t5-seg">${arr.map(([k, n]) => `<button ${key}="${k}">${n}</button>`).join('')}</div>`
  const SX = [['view', 'Вид', VIEWS, 'data-view'], ['sort', 'Порядок', SORTS, 'data-sort'], ['lm', 'Колонки', [['info', 'Состав'], ['form', 'Форма']], 'data-lm'],
    ['pos', 'Позиция', [1, 2, 3, 4, 5].map((p) => [String(p), 'Pos ' + p]), 'data-pos']]
  const shown = (k) => k === 'view' || (k === 'sort' && S.view !== 'pos') || (k === 'lm' && S.view === 'list') || (k === 'pos' && S.view === 'pos')
  let SH = null
  function sheet() {
    if (!S.flt) return
    if (!SH) {
      SH = document.createElement('div'); SH.className = 'w pt-shost'
      SH.innerHTML = `<div class="pt-ov" data-sheet="0"></div><div class="pt-sh" role="dialog" aria-label="Фильтры"><div class="gr"></div><div class="hd">Фильтры</div>
        ${SX.map(([k, n, arr, key]) => `<div class="pt-sx" data-sx="${k}"><div><div><div class="lbl">${n}</div>${seg(arr, key)}</div></div></div>`).join('')}
        <button class="ok" data-sheet="0">Готово</button></div>`
      document.body.append(SH)
      SH.addEventListener('click', (e) => { const b = e.target.closest('[data-sheet], [data-view], [data-sort], [data-lm], [data-pos]'); if (!b) return
        if (b.dataset.sheet) S.sheet = false
        else if (b.dataset.view) S.view = b.dataset.view; else if (b.dataset.sort) S.sort = b.dataset.sort; else if (b.dataset.lm) S.lm = b.dataset.lm; else S.pos = +b.dataset.pos
        close(); render() })
    }
    SH.classList.toggle('is-open', S.sheet && S.phone)
    SX.forEach(([k, , , key]) => { const box = SH.querySelector(`[data-sx="${k}"]`), cur = String(S[k])
      box.classList.toggle('is-hide', !shown(k)); box.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', b.getAttribute(key) === cur)) })
  }
  let sortWas = true, colWas = true
  const colHx = () => S.colMode ? `<span class="pt-hx" data-hx="col"${colWas ? '' : ' data-off'}><span>${colCtl()}</span></span>` : ''
  const FLT = '<button class="pt-flt" data-sheet="1"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="2" width="10" height="1.5" rx=".75"/><rect x="3" y="5.25" width="6" height="1.5" rx=".75"/><rect x="5" y="8.5" width="2" height="1.5" rx=".75"/></svg>Фильтры</button>'

  function listOld() {
    return `<div class="pt-lst">${ordered().map((i, k) => { const t = TEAMS[i], sw = S.swap[t.id] || [], n = STORY[t.id]?.length ?? 0
      return `<div class="pt-li" data-drag="${i}">${canDrag() ? `<span class="pt-grip" data-grip aria-label="Перетащить">${GRIP}</span>` : ''}<span class="sd">${k + 1}</span><img src="${t.logo}" alt="">
        <span class="nm"><b>${t.name}</b><small>${t.st}${t.q ? ` · ${t.q[0]} <i>${t.q[1]}</i>` : ''}</small></span>
        <span class="mt">${sw.length ? `<span class="pt-ty">${sw.length} ${sw.length === 1 ? 'замена' : 'замены'}</span>` : ''}${t.subs.length ? `<span>Subs · ${t.subs.length}</span>` : ''}${n ? `<span>≡ ${n}</span>` : ''}</span>
        <span class="tr">${teamRate(t)}</span></div>` }).join('')}</div>`
  }

  function render() {
    // дирижёр 06.11 (финальная проверка): «на мобилке базово свёрнуто» — первый показ на телефоне: составы свёрнуты; дальше — как нажал
    if (S.phone && !S.phInit) { S.phInit = true; S.colAll = true; S.open = {}; S.shut = {} }
    w.classList.toggle('is-phone', !!S.phone)
    const n = S.n16 === 'on' ? 16 : TEAMS.length
    w.innerHTML = `<div class="w pt${S.fit ? ' pt--fit' : ''}${S.fit === 'w4' ? ' pt--fit4' : ''}${S.colMode === 'icon' ? ' pt--hov' : ''}${S.flt ? ' pt--flt' : ''}${S.r4 ? ' pt--r4' : ''}${S.r6 ? ' pt--r6' : ''}${S.r7 ? ' pt--r7' : ''}${S.r10 ? ' pt--r10' : ''}"><div class="w-hd"><span class="w-hd__t">Участники${S.flt ? '' : ` <span class="pt-who pt-who--${S.who}">${WHO.find((x) => x.id === S.who).name}</span>`}</span>${S.flt ? '' : `<span class="sub">${canDrag() && S.view !== 'pos' ? 'Тяни ⋮⋮ — задашь посев' : `${n} команд · рейтинг на этот турнир`}</span>`}${S.flt ? '' : `${S.colLeft && S.colMode && S.view === 'teams' ? colCtl() : ''}${S.view !== 'pos' ? sortSeg() : ''}${!S.colLeft && S.colMode && S.view === 'teams' ? colCtl() : ''}`}
        ${S.flt ? FLT : ''}<div class="pt-ic" role="group" aria-label="Вид"><button data-view="teams" title="Команды" class="${S.view === 'teams' ? 'is-on' : ''}"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="1" width="4" height="4" rx="1"/><rect x="7" y="1" width="4" height="4" rx="1"/><rect x="1" y="7" width="4" height="4" rx="1"/><rect x="7" y="7" width="4" height="4" rx="1"/></svg></button><button data-view="list" title="Список" class="${S.view === 'list' ? 'is-on' : ''}"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="2" width="10" height="2" rx="1"/><rect x="1" y="5" width="10" height="2" rx="1"/><rect x="1" y="8" width="10" height="2" rx="1"/></svg></button><button data-view="pos" title="По позиции" class="${S.view === 'pos' ? 'is-on' : ''}"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="1.5" width="2" height="2" rx=".5"/><rect x="4.5" y="1.5" width="6.5" height="2" rx="1"/><rect x="1" y="5" width="2" height="2" rx=".5"/><rect x="4.5" y="5" width="5" height="2" rx="1"/><rect x="1" y="8.5" width="2" height="2" rx=".5"/><rect x="4.5" y="8.5" width="3.5" height="2" rx="1"/></svg></button></div>${S.flt ? `${S.colLeft ? colHx() : ''}<span class="pt-hx" data-hx="sort"${sortWas ? '' : ' data-off'}><span>${sortSeg()}</span></span>${!S.colLeft ? colHx() : ''}` : ''}</div>
      ${S.view === 'list' ? list() : S.view === 'teams' ? `<div class="pt-grid">${ordered().map((i) => team(TEAMS[i], i)).join('')}${S.n16 === 'on' ? [...Array(16 - TEAMS.length)].map(() => '<div class="pt-tm slot">TBD · квалификация</div>').join('') : ''}</div>` : byPos()}</div>`
    if (S.flt) { // ПК: «Посев · Рейтинг · А–Я» уезжает / выезжает — рисуем в прошлом состоянии, в следующем кадре переключаем
      const on = { sort: S.view !== 'pos', col: S.view === 'teams' }; sortWas = on.sort; colWas = on.col
      w.querySelectorAll('[data-hx]').forEach((x) => x.classList.toggle('is-hide', x.hasAttribute('data-off')))
      requestAnimationFrame(() => requestAnimationFrame(() => w.querySelectorAll('[data-hx]').forEach((x) => x.classList.toggle('is-hide', !on[x.dataset.hx])))); sheet() }
  }

  let pop = null
  const close = () => { pop?.remove(); pop = null }
  function openPop(el, t, k) {
    close()
    const orig = t.p[k].nick, has = (S.swap[t.id] || []).find((x) => x.pos === k + 1)
    const cands = t.subs.length ? t.subs.map((x) => x.nick) : ['Запасной А']
    let type = has?.type || 'map'
    pop = document.createElement('div'); pop.className = 'pt-pop w'
    const draw = () => {
      pop.innerHTML = `<div class="t">Замена · ${orig} · Pos ${k + 1}</div><div class="lbl">Срок</div>
        <div class="pt-seg">${TYPES.map(([v, s]) => `<button data-type="${v}" class="${type === v ? 'is-on' : ''}">${s}</button>`).join('')}</div>
        <div class="lbl">Кто выходит</div>
        <div>${cands.map((n) => `<button class="opt" data-who="${n}">${fl(flagOf(t, n))}<span>${n}</span>${rt(rOf(t, n), "", k + 1)}</button>`).join('')}
        ${has ? `<button class="opt" data-who=""><span>Вернуть ${orig}</span></button>` : ''}</div>`
    }
    draw()
    pop.addEventListener('click', (e) => {
      e.stopPropagation()
      const ty = e.target.closest('[data-type]'); if (ty) { type = ty.dataset.type; return draw() }
      const o = e.target.closest('[data-who]'); if (!o) return
      const list = (S.swap[t.id] || []).filter((x) => x.pos !== k + 1)
      if (o.dataset.who) list.push({ pos: k + 1, who: o.dataset.who, type })
      S.swap[t.id] = list; close(); render()
    })
    document.body.append(pop)
    const b = el.getBoundingClientRect()
    pop.style.left = Math.max(8, Math.min(b.left, innerWidth - 268)) + 'px'
    pop.style.top = Math.max(8, Math.min(b.bottom + 4, innerHeight - pop.offsetHeight - 8)) + 'px'
  }

  const drNote = (t) => { const HB = B + '../gs-match/img/heroes/', row = (arr) => `<div class="pt-drr">${arr.map(([hh, n]) => `<span><img src="${HB}${hh}.png" alt=""><i>${n}</i></span>`).join('')}</div>`
    if (S.dn) { const nm = (hh) => hh.replace(/_/g, ' '), P = draft(t, 'p'), Bn = draft(t, 'b'), max = P[0][1]
      const img = (hh, ban) => `<img${ban ? ' class="ban"' : ''} src="${HB}${hh}.png" alt="">`
      const body = S.dn === 'tiles' ? `<div class="dl">Частые пики</div><div class="dt">${P.map(([hh, n]) => `<div title="${nm(hh)}">${img(hh)}<i>${n}</i></div>`).join('')}</div><div class="dl">Частые баны</div><div class="dt">${Bn.map(([hh, n]) => `<div title="${nm(hh)}">${img(hh, 1)}<i>${n}</i></div>`).join('')}</div>`
        : S.dn === 'list' ? `<div class="dl">Частые пики</div>${P.map(([hh, n]) => `<div class="dr-l">${img(hh)}<span>${nm(hh)}</span><u><b style="width:${n / max * 100}%"></b></u><i>${n}</i></div>`).join('')}<div class="dl">Частые баны</div>${Bn.slice(0, 3).map(([hh, n]) => `<div class="dr-l">${img(hh, 1)}<span>${nm(hh)}</span><u><b style="width:${n / max * 100}%"></b></u><i>${n}</i></div>`).join('')}`
        : S.dn === 'cols' ? `<div class="dc"><div><div class="dl">Пики</div>${P.map(([hh, n]) => `<div class="dc-r">${img(hh)}<i>${n}</i></div>`).join('')}</div><div><div class="dl">Баны</div>${Bn.map(([hh, n]) => `<div class="dc-r">${img(hh, 1)}<i>${n}</i></div>`).join('')}</div></div>`
        : `<div class="dline"><span class="dl">Пики</span>${P.map(([hh, n]) => `<span title="${nm(hh)} · ${n}">${img(hh)}</span>`).join('')}</div><div class="dline"><span class="dl">Баны</span>${Bn.slice(0, 4).map(([hh, n]) => `<span title="${nm(hh)} · ${n}">${img(hh, 1)}</span>`).join('')}</div>`
      return S.drIc ? `<div class="pt-nt dr3 dr3--${S.dn} dr3--ic"><span class="ico" data-tip="Драфты на турнире — частые пики и баны">${I_SW}</span><div class="db">${body}</div></div>`
        : `<div class="pt-nt dr3 dr3--${S.dn}"><span class="ico">${I_DR}</span><div class="db"><div class="dh">Драфты на турнире</div>${body}</div></div>` }
    if (S.drNote) { const tile = (arr, ban) => `<div class="pt-dn">${arr.map(([hh, n]) => `<span${ban ? ' class="ban"' : ''} title="${hh.replace(/_/g, ' ')} · ${n} матчей"><img src="${HB}${hh}.png" alt=""><i>${n}</i></span>`).join('')}</div>`
      return `<div class="pt-nt dr dr2"><span class="ico">${I_DR}</span><p><span class="pt-dnh">Драфты на турнире</span><span class="pt-dnl">Частые пики</span>${tile(draft(t, 'p'))}<span class="pt-dnl">Частые баны</span>${tile(draft(t, 'b'), true)}<small>Авто · по матчам турнира</small></p></div>` }
    return `<div class="pt-nt dr"><p><b class="pt-drh">Частые пики</b>${row(draft(t, 'p'))}<b class="pt-drh">Частые баны</b>${row(draft(t, 'b'))}<small>Авто · по матчам турнира</small></p></div>` }
  // v46+ (o.dm): где показать частые пики и баны — hover (наведение на команду) · strip (полоса под шапкой карточки) · tab (своя кнопка внизу, рядом с составом)
  const I_DR = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="2" width="4" height="8" rx="1"/><rect x="6.5" y="2" width="4" height="8" rx="1"/><path d="M7.3 3.2l2.4 5.6"/></svg>'
  const HBp = () => B + '../gs-match/img/heroes/'
  const drStrip = (t) => `<div class="pt-dst"><span class="l">Пики</span>${draft(t, 'p').map(([hh, n]) => `<img src="${HBp()}${hh}.png" alt="" title="${hh.replace(/_/g, ' ')} · ${n} матчей">`).join('')}<span class="l">Баны</span>${draft(t, 'b').slice(0, 3).map(([hh, n]) => `<img class="ban" src="${HBp()}${hh}.png" alt="" title="Бан: ${hh.replace(/_/g, ' ')} · ${n}">`).join('')}</div>`
  const drPanel = (t) => { const row = (arr, ban) => arr.map(([hh, n]) => `<div class="pt-dpr">${`<img${ban ? ' class="ban"' : ''} src="${HBp()}${hh}.png" alt="">`}<span>${hh.replace(/_/g, ' ')}</span><b>${n}</b></div>`).join('')
    return `<div class="pt-dp"><div class="lbl">Частые пики</div>${row(draft(t, 'p'))}<div class="lbl">Частые баны</div>${row(draft(t, 'b'), true)}</div>` }
  // v55: значок драфтов — скрещённые мечи (в духе Material «swords»), заголовка нет — подпись при наведении
  const I_SW = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6.9 2.5 3 2.6l.1 3.9 8.2 8.2-1.6 1.6 1.4 1.4 1.6-1.6 1.8 1.8-1.4 1.4 1.4 1.4 1.4-1.4 2.6 2.6 1.4-1.4-2.6-2.6 1.4-1.4-1.4-1.4-1.4 1.4-1.8-1.8 1.6-1.6-1.4-1.4-1.6 1.6zM17.1 2.5l-6 6 1.4 1.4 6-6 .1-1.4zM5.6 15.8l-1.4 1.4 1.4 1.4-2.6 2.6 1.4 1.4 2.6-2.6 1.4 1.4 1.4-1.4z"/></svg>'
  const notes = (t) => STORY[t.id].map(([k, s]) => k === 'dr' ? drNote(t) : ` <div class="pt-nt ${k}"><span class="ico"${S.srcIc ? ` data-tip="${k === 'ed' ? 'Редакция' : 'Авто — по данным матчей'}"` : ''}>${k === 'ed' ? '★' : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M6 1.5v2M6 8.5v2M1.5 6h2M8.5 6h2M3 3l1.2 1.2M7.8 7.8L9 9M9 3L7.8 4.2M4.2 7.8L3 9"/></svg>'}</span><p>${s}${S.srcIc ? '' : `<small>${k === 'ed' ? 'Редакция' : 'Авто · по данным матчей'}</small>`}</p></div>`).join('')
  function openAdd(el, t) {
    close()
    pop = document.createElement('div'); pop.className = 'pt-pop w'
    pop.innerHTML = `<div class="t">Заметка · ${t.name}</div><div class="lbl">★ Редакция — видят все</div>
      <textarea rows="3" placeholder="Например: Yuma пришёл месяц назад — с ним стали играть лучше" style="resize:none;background:var(--w-mid-bg);border:1px solid var(--w-border);border-radius:6px;color:var(--w-fg);font:var(--t-cell);padding:8px"></textarea>
      <button class="opt" data-save style="justify-content:center;background:var(--w-fg);color:var(--w-bg)">Добавить</button>`
    pop.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!e.target.closest('[data-save]')) return
      const v = pop.querySelector('textarea').value.trim(); if (!v) return
      ;(STORY[t.id] ||= []).push(['ed', v]); close(); render()
    })
    document.body.append(pop)
    const b = el.getBoundingClientRect()
    pop.style.left = Math.max(8, Math.min(b.left, innerWidth - 268)) + 'px'
    pop.style.top = Math.max(8, Math.min(b.bottom + 4, innerHeight - pop.offsetHeight - 8)) + 'px'
    pop.querySelector('textarea').focus()
  }
  function openStory(el, t) {
    close()
    pop = document.createElement('div'); pop.className = 'pt-pop w'
    pop.innerHTML = `<div class="t">${t.name} · рассказ ростера</div><div class="pt-st" style="margin:0;padding:0;border:0">${STORY[t.id].map(([k, s]) => `<div class="${k}"><em>${k === 'ed' ? '★ редакция' : 'авто'}</em>${s}</div>`).join('')}</div>`
    pop.addEventListener('click', (e) => e.stopPropagation())
    document.body.append(pop)
    const b = el.getBoundingClientRect()
    pop.style.left = Math.max(8, Math.min(b.left, innerWidth - 268)) + 'px'
    pop.style.top = Math.max(8, Math.min(b.bottom + 4, innerHeight - pop.offsetHeight - 8)) + 'px'
  }

  // v35: наведение на команду (лого и имя) — частые пики и баны на турнире (‼️ пример)
  let DR = null
  const drHide = () => { DR?.remove(); DR = null }
  function drShow(a, t) { drHide(); const HB = B + '../gs-match/img/heroes/'
    const row = (arr) => `<div class="pt-drr">${arr.map(([hh, n]) => `<span><img src="${HB}${hh}.png" alt=""><i>${n}</i></span>`).join('')}</div>`
    DR = document.createElement('div'); DR.className = 'pt-pop pt-drp w'
    DR.innerHTML = `<div class="t"><img src="${t.logo}" alt="">${t.name} · драфты на турнире</div><div class="lbl">Частые пики</div>${row(draft(t, 'p'))}<div class="lbl">Частые баны</div>${row(draft(t, 'b'))}`
    document.body.append(DR); const b = a.getBoundingClientRect()
    DR.style.left = Math.max(8, Math.min(b.left, innerWidth - 268)) + 'px'
    DR.style.top = (b.top - DR.offsetHeight - 6 > 8 ? b.top - DR.offsetHeight - 6 : b.bottom + 6) + 'px' }
  addEventListener('scroll', drHide, { passive: true })
  document.addEventListener('click', close)
  // перетаскивание за ручку (редактор, порядок «Посев»): указателем — мышь и палец. Призрак едет за курсором,
  // на месте — пунктир, соседи расступаются плавно (FLIP); отпустил — новый порядок в S.order

  function bind(el) {
  el.addEventListener('pointerover', (e) => { if (!S.r4 || (S.r7 && S.dm !== 'hover') || e.pointerType !== 'mouse') return; const a = e.target.closest('[data-dr]'); if (a && !a.contains(e.relatedTarget)) drShow(a, TEAMS[+a.dataset.dr]) })
  el.addEventListener('pointerover', (e) => { if (S.pm !== 'hover') return; const r = e.target.closest('[data-pg]'), card = e.target.closest('.pt-tm'); if (!card) return
    const ln = r && r.dataset.pg ? r.dataset.pg.split(' ')[0] : ''; if (card.dataset.hp === ln) return; card.dataset.hp = ln
    card.querySelectorAll('[data-pg]').forEach((x) => x.classList.toggle('is-pair', ln !== '' && x.dataset.pg.split(' ').includes(ln))) })
  el.addEventListener('pointerout', (e) => { const a = e.target.closest('[data-dr]'); if (a && !a.contains(e.relatedTarget)) drHide() })
  el.addEventListener('click', (e) => {
      e.stopPropagation()
      const v = e.target.closest('[data-view]'); if (v) { S.view = v.dataset.view; close(); return render() }
      const sh = e.target.closest('[data-sheet]'); if (sh) { S.sheet = sh.dataset.sheet === '1'; close(); return render() }
      const so = e.target.closest('[data-sort]'); if (so) { S.sort = so.dataset.sort; return render() }
      const p = e.target.closest('[data-pos]'); if (p) { S.pos = +p.dataset.pos; return render() }
      const tb = e.target.closest('[data-tab]'); if (tb) { const [i, k] = tb.dataset.tab.split(':'); S.tab[i] = +k; S.story[i] = false; return render() }
      const c = e.target.closest('[data-col]'); if (c) { const i = c.dataset.col; S.col[i] = !S.col[i]; return render() }
      const rs = e.target.closest('[data-reset]'); if (rs) { S.swap[TEAMS[+rs.dataset.reset].id] = []; return render() }
      const ad = e.target.closest('[data-add]'); if (ad) return openAdd(ad, TEAMS[+ad.dataset.add])
      const st = e.target.closest('[data-story]'); if (st && !st.disabled) { const i = st.dataset.story; S.story[i] = !S.story[i]; return render() }
      const ca = e.target.closest('[data-colall]'); if (ca) { S.colAll = !S.colAll; S.open = {}; S.shut = {}; return render() }
      const ct = e.target.closest('[data-colt]'); if (ct) { togCol(+ct.dataset.colt); return render() }
      const tap = e.target.closest('.pt-tm.is-tap .pt-th'); if (tap && !e.target.closest('button')) { togCol(+tap.closest('.pt-tm').dataset.drag); return render() }
      const r = e.target.closest('.pt-r[data-t]'); if (r && S.who === 'ed') openPop(r, TEAMS[+r.dataset.t], +r.dataset.i)
    })
    el.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('[data-grip]'); if (!g || !canDrag()) return
      e.preventDefault(); close()
      const item = g.closest('[data-drag]'), box = item.parentElement, r0 = item.getBoundingClientRect()
      const dx = e.clientX - r0.left, dy = e.clientY - r0.top
      const ghost = item.cloneNode(true); ghost.classList.add('pt-ghost', 'w'); ghost.style.width = r0.width + 'px'; ghost.style.height = r0.height + 'px'
      ghost.style.left = r0.left + 'px'; ghost.style.top = r0.top + 'px'; document.body.append(ghost)
      item.classList.add('is-ph'); document.body.classList.add('is-dragging')
      const items = () => [...box.querySelectorAll(':scope > [data-drag]')]
      const flip = (fn) => { const before = new Map(items().map((x) => [x, x.getBoundingClientRect()])); fn()
        items().forEach((x) => { if (x === item) return; const a = before.get(x), b = x.getBoundingClientRect(); if (!a) return
          const tx = a.left - b.left, ty = a.top - b.top; if (!tx && !ty) return
          x.style.transition = 'none'; x.style.transform = `translate(${tx}px, ${ty}px)`; x.getBoundingClientRect()
          x.style.transition = 'transform .18s ease'; x.style.transform = '' }) }
      const move = (ev) => {
        ghost.style.left = ev.clientX - dx + 'px'; ghost.style.top = ev.clientY - dy + 'px'
        const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-drag]')
        if (!over || over === item || over.parentElement !== box) return
        const list = items(), from = list.indexOf(item), to = list.indexOf(over)
        flip(() => box.insertBefore(item, from < to ? over.nextSibling : over))
      }
      const up = () => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up)
        document.body.classList.remove('is-dragging'); ghost.remove()
        S.order = items().map((x) => +x.dataset.drag); render()
      }
      addEventListener('pointermove', move); addEventListener('pointerup', up)
    })
  
    const OFFON = [{ v: 'off', label: 'Нет' }, { v: 'on', label: 'Да' }]
  }

  // WP.mount(el, { who: 'fan' | 'ed', phone, fit, flt }) — fit: колонки по ширине контейнера (_wp-fit.css; 'w4' — на 1440 четыре, пять — от 1200); colMode: 'icon' | 'switch' | 'hover' — сворачивание, colLeft — кнопка левее порядка — нарисовать виджет в el; состояние (замены, порядок, заметки) живёт в модуле, переживает перерисовку страницы
  function mount(el, o = {}) { if (o.who) S.who = o.who; S.phone = !!o.phone; S.fit = o.fit || false; if ('colMode' in o) S.colMode = o.colMode; S.colLeft = !!o.colLeft; S.flt = !!o.flt; S.r4 = !!o.r4 || !!o.r5; S.r5 = !!o.r5 || !!o.r6; S.r6 = !!o.r6 || !!o.r7 || !!o.r8 || !!o.r9 || !!o.r10; S.r7 = !!o.r7 || !!o.r8 || !!o.r9 || !!o.r10; S.r8 = !!o.r8 || !!o.r9 || !!o.r10; S.r9 = !!o.r9 || !!o.r10; S.r10 = !!o.r10; S.pm = o.pm || null; S.dm = o.dm || null; S.dnum = !!o.dnum; S.coMan = !!o.coMan; S.r2 = !!o.r2; S.drNote = !!o.drNote || !!o.dn; S.dn = o.dn || null; S.srcIc = !!o.srcIc; S.drIc = !!o.drIc; S.r2ns = !!o.r2ns; if (S.dm) TEAMS.forEach((t) => { if (STORY[t.id]) STORY[t.id] = STORY[t.id].filter((x) => x[0] !== 'dr') }); S.coIt = o.coIt || 'ward_observer'; S.coIc = o.coIc || 'board'; if (S.r6) { S.r4 = true; S.r5 = true }
    if (S.r7 && (!S.dm || S.drNote)) TEAMS.forEach((t) => { const a = (STORY[t.id] ||= []); if (!a.some((x) => x[0] === 'dr')) a.unshift(['dr', '']) }); w = el; if (!el._wp) { el._wp = true; bind(el) } render() }
  return { mount, set: (k, v) => { S[k] = v; if (w) render() }, get: (k) => S[k] }
})()
