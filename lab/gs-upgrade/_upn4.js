// gs-upgrade v4–v7 news — как v3 (_upn.js), по замечаниям дирижёра 10.11 (v3 и _upn.* не трогаем — отдельный файл):
//   «Итог в цифрах» — виджетом вверху правой колонки (не закреп-строка и не широкая карточка в ленте), разворот по клику остаётся
//   обложки из данных убраны — как в v62 (фото / лого-заглушка); сравнения с оригиналом нет (_cmp.js без data-old)
//   остальное из v3: тип новости вместо «Tier 1», вводки, комментарии, «Ещё по теме» у первой в ленте, телефонная строка «турнир · итог · трансферы»
//   блок фильтров — свой у каждой версии: window.UPN_OPT = { filters: 'center' (v4) | 'right' (v5) | 'row' (v6) | 'split' (v7) | 'scoped' (v8, v9 + one: true) }
// Данные — только общая база (window.DB) и детали матчей (window.GS_DATA). ‼️ Пример: вводки и тексты «Итогов» (_upn-data.js), тип — по словам в заголовке.
;(() => {
  const DB = window.DB, D = DB.data, U = window.UPN_DATA, G = window.GS_DATA || { series: [] }
  const FEED = window.NEWS_FEED, ALL = FEED.slice(1), BYURL = new Map(FEED.map((n) => [n.url, n]))
  const NB = Object.fromEntries(D.news.map((n) => [n.id, n])), nb = (n) => n.meta || NB[n.db] || { teams: [], players: [], tours: [] }
  const UP = { ty: 'all', rn: 16, dd: false, sheet: false, c8: 0 }
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
  const isDesk = () => document.body.classList.contains('is-desk')
  const nws = (k) => `${k} ${k % 10 === 1 && k % 100 !== 11 ? 'новость' : [2, 3, 4].includes(k % 10) && ![12, 13, 14].includes(k % 100) ? 'новости' : 'новостей'}`
  const fmt = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const dec = (x, k = 1) => x.toFixed(k).replace('.', ',')
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
  const NOWD = new Date(DB.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' }), TDN = +NOWD.slice(8, 10)
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'], MS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const dayName = (d) => { const x = new Date(d), n = x.getDate(); return (n === TDN ? 'Сегодня' : n === TDN - 1 ? 'Вчера' : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][x.getDay()]) + ` · ${n} ${MON[x.getMonth()]}` }
  const when = (t) => (t.startsWith(NOWD) ? t.slice(11, 16) : `${+t.slice(8, 10)} ${MS[+t.slice(5, 7) - 1]}`)
  const hImg = (id) => DB.url(D.heroes[id]?.img), hName = (id) => D.heroes[id]?.name || id
  const hIc = (id, cls = 'upn-h') => (id && hImg(id) ? `<img class="${cls}" src="${hImg(id)}" alt="" title="${esc(hName(id))}">` : '')
  const lg = (id, cls = 'upn-lg') => `<img class="${cls}" src="${DB.logo(id)}" alt="">`
  const TI = D.tours['ti-2026'], TIL = DB.url(TI.logo)

  // ── 1. Тип новости. ‼️ пример: тип — по словам в заголовке (в продукте — поле новости у редактора) ──
  const TY = [
    { id: 'match', name: 'Матч' }, { id: 'op', name: 'Мнение' }, { id: 'prog', name: 'Прогноз' }, { id: 'tr', name: 'Трансфер' },
    { id: 'patch', name: 'Патч' }, { id: 'rum', name: 'Слух' }, { id: 'scene', name: 'Сцена' }, { id: 'wrap', name: 'Итог в цифрах' },
  ]
  const RE = [
    ['rum', /слух|инсайд/i],
    ['op', /«/],
    ['tr', /трансфер|замен[аиуы]\b|перешел|перешёл|переход|подписал|присоедин|стенд-?ин|инактив|ростер|расформир|распуст|кикнул|вернул(ся|ась) в/i],
    ['patch', /патч|баг[иа]?\b|обновлени|матчмейкинг|MMR|нерф|бафф|Meepo|Steam|кастом|тирлист|Valve (исправ|удал|выпуст|добав)/i],
    ['prog', /прогноз|предсказ|выиграет|заберёт|заберет|победит|ставк|шансы|кто (выиграет|начн|первым)|сможет ли|переиграет/i],
    ['match', /обыграл|проиграл|победил|вылетел|прошл[аи]|выиграл|выбил|карт[уаеы]\b|сетк|финал|плей-офф|против|матч|сери[июя]|Rampage|рекорд|Рошан|Аегис|групп/i],
  ]
  const typeOf = (n) => n.wrap ? 'wrap' : (n.ty ||= (RE.find(([, r]) => r.test(n.title)) || ['scene'])[0])
  const tyName = (id) => TY.find((t) => t.id === id).name
  const tyPill = (n) => `<span class="upn-ty upn-ty--${typeOf(n)}">${tyName(typeOf(n))}</span>`
  // ── 5. Счётчик комментариев (настоящий, cybersport.ru) ──
  const CMI = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2.5 3.5h11v7.5h-6l-3 2.5v-2.5h-2z"/></svg>'
  const cm = (n) => (n.com ? `<span class="upn-cm" title="Комментарии">${CMI}${n.com}</span>` : '')

  // ── данные для обложек ──
  const PS = DB.playerStats('ti-2026'), psOf = (pid) => PS.find((x) => x.player === pid)
  const HS = DB.heroStats('ti-2026'), tsOf = (id) => DB.teamStats('ti-2026', id)
  const TIM = D.matches.filter((m) => m.tour === 'ti-2026' && m.state !== 'soon')
  const gsOf = (m) => G.series.find((s) => 'od-' + s.series_id === m.id)
  const ms = (t) => new Date(t).getTime()
  const matchOf = (a, b, t) => { const L = TIM.filter((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a)); if (!L.length) return null
    const before = L.filter((m) => ms(m.start) <= ms(t)); return (before.length ? before : L).sort((x, y) => ms(y.start) - ms(x.start))[0] }
  // пики команды на карте из деталей матча (OpenDota) — по id команды OpenDota
  const mapPicks = (mp, team) => { const rad = DB.team(mp.radiant_team_id)?.id === team; return mp.picks_bans.filter((p) => p.is_pick && p.team === (rad ? 0 : 1)).map((p) => DB.hero(p.hero_id)?.id).filter(Boolean) }
  const subjOf = (n) => { const P = nb(n).players.filter((id) => psOf(id)); if (!P.length) return null
    const m = n.title.match(/^\S+ о (\S+)/); if (m) { const q = DB.player(m[1].replace(/[~^:]+$/, '')); if (q && P.includes(q.id)) return q.id }
    return P[0] }
  const kindOf = (n) => { const T = nb(n).teams
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const m = matchOf(T[i], T[j], n.t); if (m) return { k: 'mt', m } }
    const p = subjOf(n); if (p) return { k: 'pl', p }
    const t = T.find((id) => tsOf(id)); if (t) return { k: 'tm', t }
    if (nb(n).tours.includes('ti-2026')) return { k: 'ti' }
    return null }
  const form = (id) => `<span class="upn-fm">${(tsOf(id)?.form || []).slice().reverse().map((f) => `<i class="${f.win ? 'is-w' : 'is-l'}" title="${f.win ? 'Победа' : 'Поражение'} ${f.score.join(':')} · ${esc(DB.name(f.vs))}"></i>`).join('')}</span>`
  // заглушка обложки — как в v62: лого команд «×» или лого турнира
  const ph = (n) => { const T = nb(n).teams.slice(0, 2), I = T.length ? T.map((id) => DB.logo(id)) : nb(n).tours.includes('ti-2026') ? [TIL] : []
    return `<span class="mn-bi mn-bv${I.length > 1 ? ' is-two' : ''}">${I.map((x) => `<img src="${x}" alt="">`).join('<i>×</i>')}</span>` }
  // ── 2. Вводка: своя у новости → пример (_upn-data.js) → из данных (серии/игрок) ──
  const lede = (n) => { if (n.lede) return n.lede.replace(/([A-Za-z0-9~^])([а-яё])/g, '$1 $2'); if (U.ledes[n.db]) return U.ledes[n.db]
    const K = kindOf(n); if (!K) return ''
    if (K.k === 'mt') { const m = K.m; return `${DB.name(m.a)} — ${DB.name(m.b)}: ${m.state === 'live' ? `идёт ${m.live.toLowerCase()}, счёт серии` : 'серия закончилась'} ${m.score[0]}:${m.score[1]} · ${m.stage}.` }
    if (K.k === 'pl') { const x = psOf(K.p); return `${D.players[K.p].nick} на TI 2026: ${x.maps} карт, K/D/A ${x.k}/${x.d}/${x.a}, GPM ${x.gpm}; чаще всего — ${hName(x.heroes[0]?.hero)}.` }
    if (K.k === 'tm') { const s = tsOf(K.t); return `${DB.name(K.t)} на TI 2026: серии ${s.series[0]}–${s.series[1]}, карты ${s.maps[0]}–${s.maps[1]}.` }
    return '' }

  // ── 5. «Ещё по теме»: та же команда (или пара команд матча), иначе игрок, иначе турнир ──
  const related = (n, k = 3) => { const M = nb(n), pool = ALL.filter((x) => x !== n && x.db !== n.db).sort((a, b) => (a.t < b.t ? 1 : -1)), out = [], why = []
    const add = (L, w) => { const f = L.filter((x) => !out.includes(x)).slice(0, k - out.length); if (f.length) { out.push(...f); why.push(w) } }
    if (M.teams.length) add(pool.filter((x) => nb(x).teams.includes(M.teams[0])), DB.name(M.teams[0]))
    if (out.length < k && M.players.length) add(pool.filter((x) => nb(x).players.includes(M.players[0])), D.players[M.players[0]]?.nick || '')
    if (out.length < k) add(pool.filter((x) => nb(x).tours.includes('ti-2026')), 'TI 2026')
    return { why: why.join(', '), L: out } }
  const relHtml = (n) => { const { why, L } = related(n); return L.length ? `<div class="upn-rel"><span class="upn-rel__h">Ещё по теме · ${esc(why)}</span>${L.map((x) => `<a href="${x.url}" target="_blank" rel="noopener"><time class="num">${when(x.t)}</time><span>${esc(x.title)}</span>${cm(x)}</a>`).join('')}</div>` : '' }

  // ── плашки команд и игроков в заголовке (как rChips в _np2.js) ──
  const chipT = (n) => { const W = []; nb(n).teams.forEach((id) => { const x = DB.team(id); if (!x) return; [x.name, x.mid, x.tag].filter((v, i, a) => v && v.length > 2 && a.indexOf(v) === i).forEach((w) => W.push([w, `<span class="mn-ch"><img src="${DB.logo(id)}" alt="">$&</span>`])) })
    nb(n).players.forEach((id) => { const q = DB.player(id); if (q && q.nick && q.nick.length > 2) W.push([q.nick, `<span class="mn-ch mn-ch--p">${q.photo ? `<img src="${DB.url(q.photo)}" alt="">` : ''}$&</span>`]) })
    const t = esc(n.title); if (!W.length) return t; W.sort((x, y) => y[0].length - x[0].length)
    const re = new RegExp(`(?<![\\wА-Яа-яЁё])(${W.map((w) => esc(w[0]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\wА-Яа-яЁё])`, 'g')
    return t.replace(re, (x) => { const w = W.find((q) => esc(q[0]) === x); return w ? w[1].replace('$&', x) : x }) }

  // ── 4. «Итог в цифрах» — считаем из базы ──
  const W = U.wraps
  const heroRows = () => HS.list.slice().sort((a, b) => b.pickBan - a.pickBan).slice(0, 8)
  const wrTop = () => HS.list.filter((h) => h.picks >= 10).sort((a, b) => b.pickWins / b.picks - a.pickWins / a.picks).slice(0, 5)
  const banTop = () => HS.list.slice().sort((a, b) => b.bans - a.bans).slice(0, 5)
  const allMaps = TIM.flatMap((m) => m.maps.map((x) => ({ ...x, m })))
  const mapLong = allMaps.reduce((a, b) => (b.dur > a.dur ? b : a)), mapShort = allMaps.reduce((a, b) => (b.dur < a.dur ? b : a))
  const avgDur = Math.round(allMaps.reduce((s, x) => s + x.dur, 0) / allMaps.length)
  const rec = (f, min = 0) => PS.filter((x) => x.maps >= min).reduce((a, b) => (f(b) > f(a) ? b : a))
  const serM = TIM.find((m) => m.id === W.ser.match), serG = gsOf(serM)
  const serPl = (() => { if (!serG) return []; const A = {}
    serG.maps.forEach((mp) => mp.players.forEach((p) => { const q = DB.player(p.account_id); const k = q?.id || p.account_id; const o = (A[k] ||= { q, k: 0, d: 0, a: 0, heroes: [] }); o.k += p.kills; o.d += p.deaths; o.a += p.assists; o.heroes.push(DB.hero(p.hero_id)?.id) }))
    return Object.values(A).filter((x) => x.q).sort((x, y) => y.k + y.a - (x.k + x.a)) })()
  const WRAPS = [
    { key: 'ti', d: W.ti, meta: { teams: [], players: [], tours: ['ti-2026'] },
      lede: () => { const h = heroRows()[0], w = wrTop()[0]; return `${HS.games} карт, Radiant ${HS.sub.replace(/.*Radiant /, '')}. Чаще всех в драфте — ${hName(h.hero)} (пик или бан в ${h.pickBan}% карт), лучший винрейт от 10 пиков — ${hName(w.hero)}, ${pct(w.pickWins, w.picks)}%.` } },
    { key: 'ser', d: W.ser, meta: { teams: [serM.a, serM.b], players: [], tours: ['ti-2026'] },
      lede: () => { const b = serPl[0]; return `${serM.stage}, ${serM.score[0]}:${serM.score[1]} за ${serM.maps.length} карты. Лучший игрок серии — ${b ? `${b.q.nick}: ${b.k}/${b.d}/${b.a}` : '—'}.` } },
    { key: 'pair', d: W.pair, meta: { teams: W.pair.teams, players: [], tours: ['ti-2026'] },
      lede: () => { const [a, b] = W.pair.teams, sa = tsOf(a), sb = tsOf(b); return `${DB.name(a, 'mid')}: серии ${sa.series[0]}–${sa.series[1]}, карты ${sa.maps[0]}–${sa.maps[1]} · ${DB.name(b, 'mid')}: серии ${sb.series[0]}–${sb.series[1]}, карты ${sb.maps[0]}–${sb.maps[1]}.` } },
  ].map((w) => ({ wrap: w.key, t: w.d.t, title: w.d.title, meta: w.meta, lede: '', _lede: w.lede, com: 0, url: '#' + w.key, db: 'wrap-' + w.key, read: w.d.read }))
  WRAPS.forEach((w) => { w.lede = w._lede() })
  const wOf = (k) => WRAPS.find((w) => w.wrap === k)
  // обложка «Итога»: мини-инфографика
  const wCover = (w) => { if (w.wrap === 'ti') { const L = heroRows().slice(0, 5); const mx = L[0].pickBan
      return `<span class="upn-wc"><span class="upn-wc__h"><img src="${TIL}" alt="">Пик + бан, % карт</span>${L.map((h) => `<span class="upn-wc__r">${hIc(h.hero)}<i style="--w:${pct(h.pickBan, mx)}%"></i><b class="num">${h.pickBan}%</b></span>`).join('')}</span>` }
    if (w.wrap === 'ser') return `<span class="upn-wc upn-wc--ser"><span class="upn-cv__sc">${lg(serM.a)}<b class="num">${serM.score[0]}:${serM.score[1]}</b>${lg(serM.b)}</span>${serG ? serG.maps.map((mp, i) => { const win = mp.radiant_win ? DB.team(mp.radiant_team_id)?.id : DB.team(mp.dire_team_id)?.id
      return `<span class="upn-wc__m"><small>Карта ${i + 1}</small><span>${mapPicks(mp, serM.a).map((h) => hIc(h)).join('')}</span><b class="num ${win === serM.a ? 'is-a' : 'is-b'}">${mmss(mp.duration)}</b></span>` }).join('') : ''}</span>`
    const [a, b] = W.pair.teams, sa = tsOf(a), sb = tsOf(b)
    return `<span class="upn-wc upn-wc--pair">${[[a, sa], [b, sb]].map(([t, s]) => `<span class="upn-wc__t">${lg(t)}<b>${esc(DB.name(t, 'mid'))}</b><span class="num">${s.series[0]}–${s.series[1]}</span>${form(t)}<span class="upn-cv__hs">${s.picks.slice(0, 3).map((h) => hIc(h[0])).join('')}</span></span>`).join('')}</span>` }

  // ── разворот «Итога» (статья) ──
  const sec = (t, body, sub = '') => `<section class="upn-a__s"><h3>${t}${sub ? `<small>${sub}</small>` : ''}</h3>${body}</section>`
  const kpi = (L) => `<div class="upn-kpi">${L.map(([v, k]) => `<div><b class="num">${v}</b><small>${k}</small></div>`).join('')}</div>`
  const P = (t) => `<p class="upn-a__p">${esc(t)}</p>`
  const plRow = (x, v) => { const p = D.players[x.player]; return `<div class="upn-rr">${p.photo ? `<img class="upn-rr__ph" src="${DB.url(p.photo)}" alt="">` : '<span class="upn-rr__ph"></span>'}<span class="upn-rr__n"><b>${esc(p.nick)}</b><small>${x.team ? lg(x.team, 'upn-lg upn-lg--s') + esc(DB.name(x.team, 'mid')) : ''}</small></span>${v}</div>` }
  const artBody = (w) => {
    const T = W[w.wrap].text
    if (w.wrap === 'ti') { const hr = heroRows(), mx = hr[0].pickBan
      const k = rec((x) => x.k), kda = rec((x) => x.kda, 8), gpm = rec((x) => x.gpm, 8), dmg = rec((x) => x.heroDmg, 8)
      const tb = Object.entries(D.teamStats['ti-2026']).map(([id, s]) => ({ id, ...s })).filter((s) => s.maps[0] + s.maps[1] >= 8).sort((a, b) => b.maps[0] / (b.maps[0] + b.maps[1]) - a.maps[0] / (a.maps[0] + a.maps[1])).slice(0, 3)
      return P(T[0]) + kpi([[HS.games, 'карт сыграно'], [HS.sub.replace(/.*Radiant /, ''), 'Radiant — Dire'], [mmss(avgDur), 'средняя карта'], [mmss(mapLong.dur), `самая длинная · ${DB.name(mapLong.m.a, 'mid')} — ${DB.name(mapLong.m.b, 'mid')}`], [mmss(mapShort.dur), `самая короткая · ${DB.name(mapShort.m.a, 'mid')} — ${DB.name(mapShort.m.b, 'mid')}`]])
        + sec('Герои турнира', `<div class="upn-tb"><div class="upn-tb__h"><span>Герой</span><span>Пик + бан</span><span class="num">Пики</span><span class="num">Баны</span><span class="num">Винрейт</span></div>${hr.map((h) => `<div class="upn-tb__r"><span>${hIc(h.hero)}${esc(hName(h.hero))}</span><span class="upn-bar"><i style="--w:${pct(h.pickBan, mx)}%"></i><b class="num">${h.pickBan}%</b></span><span class="num">${h.picks}</span><span class="num">${h.bans}</span><span class="num">${h.picks ? pct(h.pickWins, h.picks) + '%' : '—'}</span></div>`).join('')}</div>`, `по ${HS.games} картам`)
        + P(T[1])
        + `<div class="upn-two">${sec('Лучший винрейт', wrTop().map((h) => `<div class="upn-rr">${hIc(h.hero, 'upn-rr__ph')}<span class="upn-rr__n"><b>${esc(hName(h.hero))}</b><small>${h.pickWins} из ${h.picks} пиков</small></span><b class="num">${pct(h.pickWins, h.picks)}%</b></div>`).join(''), 'от 10 пиков')}
          ${sec('Чаще всех в бане', banTop().map((h) => `<div class="upn-rr">${hIc(h.hero, 'upn-rr__ph')}<span class="upn-rr__n"><b>${esc(hName(h.hero))}</b><small>${h.picks} пиков</small></span><b class="num">${h.bans}</b></div>`).join(''), 'банов')}</div>`
        + P(T[2])
        + sec('Рекорды игроков', `<div class="upn-recs">${[['Больше всех убийств', k, `${k.k}`], ['Лучший KDA', kda, dec(kda.kda)], ['Самый высокий GPM', gpm, `${gpm.gpm}`], ['Урон по героям за карту', dmg, fmt(dmg.heroDmg)]].map(([t, x, v]) => `<div class="upn-rec"><small>${t}</small>${plRow(x, `<b class="num">${v}</b>`)}</div>`).join('')}</div>`, 'от 8 карт')
        + sec('Команды: доля выигранных карт', tb.map((s) => `<div class="upn-rr">${lg(s.id, 'upn-rr__ph')}<span class="upn-rr__n"><b>${esc(DB.name(s.id))}</b><small>серии ${s.series[0]}–${s.series[1]}</small></span>${form(s.id)}<b class="num">${s.maps[0]}–${s.maps[1]}</b></div>`).join('')) }
    if (w.wrap === 'ser') { const m = serM
      const maps = serG ? serG.maps.map((mp, i) => { const ra = DB.team(mp.radiant_team_id)?.id, win = mp.radiant_win ? ra : DB.team(mp.dire_team_id)?.id, ka = ra === m.a ? mp.radiant_score : mp.dire_score, kb = ra === m.a ? mp.dire_score : mp.radiant_score
        const adv = mp.radiant_gold_adv || [], mxA = Math.max(...adv, 0), mxD = -Math.min(...adv, 0), big = mxA >= mxD ? [ra, mxA] : [ra === m.a ? m.b : m.a, mxD]
        return `<div class="upn-map"><div class="upn-map__h"><b>Карта ${i + 1}</b><span>${mmss(mp.duration)}</span><span class="upn-map__w">${lg(win, 'upn-lg upn-lg--s')}${esc(DB.name(win, 'mid'))} победа</span></div>
          <div class="upn-map__t">${lg(m.a, 'upn-lg upn-lg--s')}<span class="upn-map__p">${mapPicks(mp, m.a).map((h) => hIc(h)).join('')}</span><b class="num">${ka}</b></div>
          <div class="upn-map__t">${lg(m.b, 'upn-lg upn-lg--s')}<span class="upn-map__p">${mapPicks(mp, m.b).map((h) => hIc(h)).join('')}</span><b class="num">${kb}</b></div>
          <small class="upn-map__n">Самый большой перевес — ${esc(DB.name(big[0], 'mid'))}, +${dec(big[1] / 1000)}k золота</small></div>` }).join('') : ''
      return P(T[0]) + kpi([[`${m.score[0]}:${m.score[1]}`, m.stage], [mmss(m.maps.reduce((s, x) => s + x.dur, 0)), 'игрового времени'], [serG ? serG.maps.reduce((s, x) => s + x.radiant_score + x.dire_score, 0) : '—', 'убийств за серию']])
        + sec('Карта за картой', `<div class="upn-maps">${maps}</div>`, 'пики и убийства')
        + P(T[1]) + sec('Лучшие в серии', serPl.slice(0, 5).map((x) => `<div class="upn-rr">${x.q.photo ? `<img class="upn-rr__ph" src="${DB.url(x.q.photo)}" alt="">` : '<span class="upn-rr__ph"></span>'}<span class="upn-rr__n"><b>${esc(x.q.nick)}</b><small>${x.q.team ? lg(x.q.team, 'upn-lg upn-lg--s') + esc(DB.name(x.q.team, 'mid')) : ''}</small></span><span class="upn-rr__hs">${x.heroes.map((h) => hIc(h)).join('')}</span><b class="num">${x.k}/${x.d}/${x.a}</b></div>`).join(''), 'K/D/A за 3 карты') }
    const [a, b] = W.pair.teams, cur = TIM.find((m) => m.state === 'live' && [m.a, m.b].includes(a) && [m.a, m.b].includes(b)), prev = TIM.filter((m) => m !== cur && [m.a, m.b].includes(a) && [m.a, m.b].includes(b))
    const col = (t) => { const s = tsOf(t); return `<div class="upn-pc"><div class="upn-pc__h">${lg(t)}<b>${esc(DB.name(t))}</b></div>${kpi([[`${s.series[0]}–${s.series[1]}`, 'серии'], [`${s.maps[0]}–${s.maps[1]}`, 'карты']])}
      <div class="upn-pc__r"><small>Форма, 5 серий</small>${form(t)}</div><div class="upn-pc__r"><small>Любимые герои</small><span class="upn-cv__hs">${s.picks.slice(0, 5).map((h) => hIc(h[0])).join('')}</span></div>
      <div class="upn-pc__r"><small>Чаще банят</small><span class="upn-cv__hs">${s.bans.slice(0, 5).map((h) => hIc(h[0])).join('')}</span></div>
      ${DB.playerStats('ti-2026', { team: t }).sort((x, y) => y.pts - x.pts).slice(0, 5).map((x) => plRow(x, `<span class="upn-rr__hs">${hIc(x.heroes[0]?.hero)}</span><b class="num">${dec(x.kda)}</b>`)).join('')}</div>` }
    return P(T[0]) + `<div class="upn-pair">${col(a)}${col(b)}</div>` + P(T[1])
      + sec('Встречи на турнире', [...prev, cur].filter(Boolean).map((m) => `<div class="upn-rr">${lg(m.a, 'upn-rr__ph')}<span class="upn-rr__n"><b>${esc(DB.name(m.a, 'mid'))} <span class="num">${m.score[0]}:${m.score[1]}</span> ${esc(DB.name(m.b, 'mid'))}</b><small>${esc(m.stage)}${m.state === 'live' ? ' · идёт ' + m.live.toLowerCase() : ''}</small></span>${lg(m.b, 'upn-rr__ph')}</div>`).join('')) }
  const XI = '<svg width="14" height="14" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 2l6 6M8 2l-6 6"/></svg>'
  const openArt = (k) => { const w = wOf(k); if (!w) return; closeArt()
    const { why, L } = related(w, 4)
    const el = document.createElement('div'); el.className = 'upn-ov'; el.innerHTML = `<article class="upn-a" role="dialog" aria-label="${esc(w.title)}">
      <button class="upn-a__x" data-upx aria-label="Закрыть">${XI}</button>
      <div class="upn-a__m">${tyPill(w)}<time>${+w.t.slice(8, 10)} ${MON[+w.t.slice(5, 7) - 1]}, ${w.t.slice(11, 16)}</time><span>${esc(U.author)}</span><span>${w.read} мин чтения</span></div>
      <h2 class="upn-a__t">${esc(w.title)}</h2><p class="upn-a__l">${esc(w.lede)}</p>${artBody(w)}
      <p class="upn-a__src">Данные — OpenDota, Liquipedia, на 21.08.2026, 16:08. Текст — пример.</p>
      ${L.length ? `<section class="upn-a__s upn-a__more"><h3>Ещё по теме<small>${esc(why)}</small></h3><div class="upn-a__g">${L.map((x) => `<a href="${x.url}" target="_blank" rel="noopener">${x.img ? `<img src="${x.img}" alt="" loading="lazy">` : ph(x)}<span class="mn-wm"><time>${when(x.t)}</time>${tyPill(x)}${cm(x)}</span><span class="upn-a__gt">${chipT(x)}</span></a>`).join('')}</div></section>` : ''}</article>`
    document.body.append(el); document.body.classList.add('upn-lock'); el.querySelector('.upn-a__x').focus({ preventScroll: true }) }
  const closeArt = () => { document.querySelector('.upn-ov')?.remove(); document.body.classList.remove('upn-lock') }

  // ── область ленты: матч (чип матча), тема (чип темы), тип ──
  const scope = () => { const mm = document.querySelector('#main .n2-ch .n2-mc.is-on')?.dataset.mm, m = mm && D.matches.find((x) => x.id === mm), tp = document.querySelector('#main .n2-ch .n2-chip.is-on[data-top]')?.dataset.top
    return (n) => { const M = nb(n)
      if (m) return M.teams.includes(m.a) || M.teams.includes(m.b)
      if (tp === 'uni') return M.tours.includes('ti-2026') || /TI15|The International/i.test(n.title)
      if (tp && D.teams[tp]) return M.teams.includes(tp)
      return true } }
  // ── 1. сегмент «тип новости» ──
  const tfHtml = (S) => { const L = ALL.filter(S)
    return `<div class="upn-tf"><div class="mn-seg"><button class="${UP.ty === 'all' ? 'on' : ''}" data-upty="all">Все типы<small class="num">${L.length}</small></button>${TY.map((t) => [t, L.filter((n) => typeOf(n) === t.id).length]).filter(([t, k]) => k || t.id === UP.ty).map(([t, k]) => `<button class="${UP.ty === t.id ? 'on' : ''}" data-upty="${t.id}"><i class="upn-dot upn-ty--${t.id}"></i>${t.name}<small class="num">${k}</small></button>`).join('')}</div></div>` }
  // карточка ленты (как ряды _np2.js: mn-bc) — для отфильтрованной по типу ленты
  const card = (n) => `<a class="mn-bc" href="${n.url}" target="_blank" rel="noopener" data-upn="1">${n.img ? `<img class="mn-bi" src="${n.img}" alt="" loading="lazy">` : ph(n)}<span class="mn-bb"><span class="mn-wm"><time>${n.t.slice(11, 16)}</time>${tyPill(n)}${cm(n)}</span><span class="mn-bt">${chipT(n)}</span></span></a>`
  const feedHtml = (S) => { const L = ALL.filter((n) => S(n) && typeOf(n) === UP.ty).sort((a, b) => (a.t < b.t ? 1 : -1)), V = L.slice(0, UP.rn)
    if (!L.length) return `<div class="upn-feed upn-empty">Новостей этого типа нет — выберите другой тип или «Все типы».</div>`
    return `<div class="mn mn--big mn--row mn--row2 mn--row3 n2-rw upn-feed">${[...new Set(V.map((n) => n.t.slice(0, 10)))].map((d) => `<div class="n2-day__h"><b>${dayName(d)}</b><small>${nws(L.filter((n) => n.t.startsWith(d)).length)}</small></div><div class="mn-bg">${V.filter((n) => n.t.startsWith(d)).map(card).join('')}</div>`).join('')}
      ${L.length > V.length ? `<button class="mn-bmore" data-upmore>Показать ещё ${Math.min(16, L.length - V.length)} из ${L.length - V.length}</button>` : ''}</div>` }

  // ── лид: первая карточка ленты — широкая, обложка из данных, вводка, «Ещё по теме» ──
  const makeLead = (a) => { const n = BYURL.get(a.getAttribute('href')); if (!n || a.closest('.upn-lead')) return
    const ld = lede(n), box = document.createElement('div'); box.className = 'mn-bc upn-lead'
    a.classList.remove('mn-bc'); a.classList.add('upn-lead__a'); a.parentNode.insertBefore(box, a); box.append(a)
    if (ld && !a.querySelector('.upn-ld')) a.querySelector('.mn-bt').insertAdjacentHTML('afterend', `<span class="upn-ld">${esc(ld)}</span>`)
    box.insertAdjacentHTML('beforeend', relHtml(n)); box.parentNode.classList.add('has-lead') }

  // ── обработка одной карточки _np2.js: тип вместо Tier 1, комментарии, обложка из данных ──
  const deco = (a) => { if (a.dataset.upn) return; const n = BYURL.get(a.getAttribute('href')); if (!n) return; a.dataset.upn = '1'
    const m = a.querySelector('.np3-m, .mn-wm'); if (m) { m.querySelector('.t5-tier')?.remove(); const t = m.querySelector('time'); if (t) t.insertAdjacentHTML('afterend', tyPill(n)); else m.insertAdjacentHTML('afterbegin', tyPill(n)); m.insertAdjacentHTML('beforeend', cm(n)) }
  }

  // ══ v4–v7: блок фильтров — по варианту (window.UPN_OPT.filters) ══
  //   'center' (v4) — обе строки чипов шириной центральной колонки, с переносом · 'right' (v5) — виджет «Фильтры» справа, над лентой — строка выбранного
  //   'row' (v6) — одна строка: выпадашка «Матчи, команды, турниры ▾» + чип живого матча + табы типа · 'split' (v7) — в центре чип матча и табы, справа — команды и турниры
  // Состояние матча и темы хранит _np2.js: его ряд чипов .n2-ch рисуется всегда (в v5–v7 спрятан), наши кнопки несут те же data-mm / data-top / data-tall — их ловит _np2.js
  const FV = (window.UPN_OPT || {}).filters || 'center'
  // v9 (UPN_OPT.one, дирижёр 10.11): без «Все» — всегда выбран какой-то матч / команда / турнир; ряд в одну строку, справа кнопка «›» листает его; v10 — пролистал, слева появляется «‹» назад
  const ONE = !!(window.UPN_OPT || {}).one
  // v11 (дирижёр 10.11: «отступ на мобиле большой»): колонки блока матча листаются вбок, высота ряда — по самой длинной; держим высоту видимой колонки
  const swH = (L) => { const sp = L.querySelector('.n2-sp.is-sw'); if (!sp || isDesk()) return
    const fit = () => { const C = sp.children, c = C[Math.round(sp.scrollLeft / (sp.clientWidth || 1))] || C[0]; if (c) sp.style.height = c.offsetHeight + 'px' }; fit()
    if (!sp.upnH) { sp.upnH = 1; sp.addEventListener('scroll', fit, { passive: true }) } }
  const one = (ch) => { if (!ONE || !ch) return; document.body.classList.add('upn-one')
    if (!ch.querySelector('.n2-chip.is-on:not([data-tall])')) { setTimeout(() => document.querySelector('#main .n2-ch [data-mm]')?.click()); return }
    const box = ch.parentElement; if (!box.querySelector('.upn-chn')) box.insertAdjacentHTML('beforeend', '<button class="upn-chn upn-chn--l" data-upchn="-1" type="button" aria-label="Назад">‹</button><button class="upn-chn" data-upchn="1" type="button" aria-label="Дальше">›</button>')
    const end = () => { box.classList.toggle('is-end', ch.scrollLeft + ch.clientWidth >= ch.scrollWidth - 2); box.classList.toggle('is-start', ch.scrollLeft <= 2) }; end()
    if (!ch.upnOne) { ch.upnOne = 1; ch.addEventListener('scroll', end, { passive: true }) } }
  const live = D.matches.find((m) => m.state === 'live')
  const txt = (b) => [...b.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join('').trim()
  const chipsOf = () => { const c = document.querySelector('#main .n2-ch'); if (!c) return { mt: [], tours: [], teams: [] }
    const mt = [...c.querySelectorAll('[data-mm]')].map((b) => ({ m: D.matches.find((x) => x.id === b.dataset.mm), on: b.classList.contains('is-on'), k: +(b.querySelector('small')?.textContent || 0), html: b.outerHTML })).filter((x) => x.m)
    const tp = [...c.querySelectorAll('[data-top]')].map((b) => ({ id: b.dataset.top, name: txt(b), logo: b.querySelector('img')?.getAttribute('src'), on: b.classList.contains('is-on'), k: +(b.querySelector('small')?.textContent || 0) }))
    return { mt, tours: tp.filter((t) => t.id === 'uni'), teams: tp.filter((t) => D.teams[t.id]) } }
  const tyList = (S) => { const L = ALL.filter(S); return [{ id: 'all', name: 'Все', k: L.length }, ...TY.filter((t) => t.id !== 'wrap').map((t) => ({ ...t, k: L.filter((n) => typeOf(n) === t.id).length })).filter((t) => t.k || t.id === UP.ty)] }
  const mLab = (m) => `<span class="upn-ml">${lg(m.a, 'upn-lg upn-lg--s')}${esc(DB.name(m.a, 'mid'))}<b class="num">${m.state === 'live' ? `<i class="upn-lv"></i>${m.score[0]}:${m.score[1]}` : m.start.slice(11, 16)}</b>${esc(DB.name(m.b, 'mid'))}${lg(m.b, 'upn-lg upn-lg--s')}</span>`
  // строка списка-фильтра: имя, число, выбранная — с крестиком
  const fRow = (attr, inner, k, on) => `<button class="upn-fr${on ? ' is-on' : ''}" ${attr} type="button">${inner}<small class="num">${k}</small>${on ? `<span class="upn-fr__x">${XI}</span>` : ''}</button>`
  const fSec = (h, rows) => (rows ? `<div class="upn-fs"><span class="upn-fs__h">${h}</span>${rows}</div>` : '')
  const secMt = (L, h = 'Матчи') => fSec(h, L.map((x) => fRow(`data-mm="${x.m.id}"`, mLab(x.m), x.k, x.on)).join(''))
  const secTp = (L, h) => fSec(h, L.map((t) => fRow(`data-top="${t.id}"`, `<span class="upn-fr__n">${t.logo ? `<img class="upn-lg upn-lg--s" src="${t.logo}" alt="">` : ''}${esc(t.name)}</span>`, t.k, t.on)).join(''))
  const secTy = (S) => fSec('Тип новости', tyList(S).filter((t) => t.id !== 'all').map((t) => fRow(`data-upty="${t.id}"`, `<span class="upn-fr__n"><i class="upn-dot upn-ty--${t.id}"></i>${t.name}</span>`, t.k, UP.ty === t.id)).join(''))
  const anyOn = (c) => c.mt.some((x) => x.on) || c.tours.some((x) => x.on) || c.teams.some((x) => x.on) || UP.ty !== 'all'
  const fWidget = (title, body, c) => `<div class="w upn-fw upn-x"><div class="w-hd"><span class="w-hd__t">${title}</span>${anyOn(c) ? '<button class="upn-fw__rs" data-tall type="button">Сбросить</button>' : ''}</div><div class="upn-fw__b">${body}</div></div>`
  // выбранное — строка маленьких чипов с крестиками (v5; телефон v7)
  const selRow = (c, btn) => { const on = [...c.mt.filter((x) => x.on).map((x) => `<button class="upn-sel" data-mm="${x.m.id}" type="button">${mLab(x.m)}${XI}</button>`),
      ...[...c.tours, ...c.teams].filter((t) => t.on).map((t) => `<button class="upn-sel" data-top="${t.id}" type="button">${t.logo ? `<img class="upn-lg upn-lg--s" src="${t.logo}" alt="">` : ''}${esc(t.name)}${XI}</button>`),
      ...(UP.ty !== 'all' ? [`<button class="upn-sel" data-upty="all" type="button"><i class="upn-dot upn-ty--${UP.ty}"></i>${tyName(UP.ty)}${XI}</button>`] : [])]
    return on.length || btn ? `<div class="upn-selr upn-x">${btn || ''}${on.length ? on.join('') : ''}</div>` : '' }
  const FI = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3"/></svg>'
  const sheetBtn = (label, k) => `<button class="upn-shb" data-upsheet type="button">${FI}${label}${k ? `<small class="num">${k}</small>` : ''}</button>`
  const nOn = (c) => c.mt.filter((x) => x.on).length + [...c.tours, ...c.teams].filter((t) => t.on).length + (UP.ty !== 'all' ? 1 : 0)
  // табы типа (v6, v7)
  const tabs = (S) => `<div class="upn-tabs">${tyList(S).map((t) => `<button class="${UP.ty === t.id ? 'on' : ''}" data-upty="${t.id}" type="button">${t.name}<small class="num">${t.k}</small></button>`).join('')}</div>`
  // выпадашка «Матчи, команды, турниры ▾» (v6): подпись — выбранное
  const ddHtml = (c) => { const sm = c.mt.find((x) => x.on && x.m !== live), st = [...c.tours, ...c.teams].find((t) => t.on)
    const lab = sm ? mLab(sm.m) : st ? `${st.logo ? `<img class="upn-lg upn-lg--s" src="${st.logo}" alt="">` : ''}${esc(st.name)}` : 'Матчи, команды, турниры'
    return `<div class="upn-dd${UP.dd ? ' is-open' : ''}"><button class="upn-dd__b${sm || st ? ' is-on' : ''}" data-updd type="button">${lab}<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2.5 4l2.5 2.5L7.5 4"/></svg></button>
      ${UP.dd ? `<div class="upn-dd__m">${secMt(c.mt.filter((x) => x.m !== live), 'Матчи сегодня')}${secTp(c.tours, 'Турниры')}${secTp(c.teams, 'Команды')}</div>` : ''}</div>` }
  const liveChip = (c) => { const x = c.mt.find((y) => y.m === live); return x ? x.html : '' }

  // «Итог в цифрах» — виджет вверху правой колонки (дирижёр 10.11: «в правой колонке в самом верху отдельным виджетом»); в матче PARIVISION — Spirit первым — пара
  const wWidget = (c) => { const mm = c.mt.find((x) => x.on)?.m, pair = mm && W.pair.teams.every((t) => t === mm.a || t === mm.b), K = pair ? ['pair', 'ti', 'ser'] : ['ti', 'ser', 'pair'], f = wOf(K[0])
    // v12 (UPN_OPT.wOnly, дирижёр 10.11: «оставь только эту часть, на всю ширину колонки») — одна обложка-карточка, без шапки, заголовков и списка; клик — разворот
    if ((window.UPN_OPT || {}).wOnly) return `<button class="upn-wo upn-x" data-upw="${f.wrap}" type="button" aria-label="${esc(f.title)}">${wCover(f)}</button>`
    return `<div class="w upn-ww upn-x"><div class="w-hd"><span class="w-hd__t">Итог в цифрах</span><span class="upn-ww__s">${esc(U.author)}</span></div>
      <button class="upn-ww__m" data-upw="${f.wrap}" type="button">${wCover(f)}<b>${esc(f.title)}</b><span class="upn-ww__k">${when(f.t)} · ${f.read} мин</span></button>
      ${K.slice(1).map((k) => { const w = wOf(k); return `<button class="upn-ww__r" data-upw="${k}" type="button"><b>${esc(w.title)}</b><span class="upn-ww__k">${when(w.t)} · ${w.read} мин</span></button>` }).join('')}</div>` }

  // телефон: нижний лист с фильтрами (v5 — все, v7 — команды и турниры)
  const sheetBody = (c, S) => (FV === 'right' ? secMt(c.mt) + secTp(c.tours, 'Турниры') + secTp(c.teams, 'Команды') + secTy(S) : secMt(c.mt.filter((x) => x.m !== live), 'Матчи сегодня') + secTp(c.tours, 'Турниры') + secTp(c.teams, 'Команды'))
  const sheet = (c, S) => { let el = document.querySelector('.upn-sh'); if (!UP.sheet || isDesk()) { el?.remove(); document.body.classList.remove('upn-lock'); return }
    if (!el) { el = document.createElement('div'); el.className = 'upn-sh'; document.body.append(el) }
    el.innerHTML = `<div class="upn-sh__p"><div class="upn-sh__h"><b>${FV === 'right' ? 'Фильтры' : 'Команды и турниры'}</b>${anyOn(c) ? '<button class="upn-fw__rs" data-tall type="button">Сбросить</button>' : ''}<button class="upn-sh__ok" data-upsheet type="button">Готово</button></div><div class="upn-sh__b">${sheetBody(c, S)}</div></div>`
    document.body.classList.add('upn-lock') }

  // ══ v8 (filters: 'scoped', дирижёр 10.11: «фильтры относятся только к блоку с тремя штуками, под ними — нормальные табы со всеми остальными новостями») ══
  //   ряд выбора (матчи / турниры / команды, как в v4) управляет только верхним блоком: матч — три колонки _np2.js «Обе · команда · команда»;
  //   команда или турнир — свой блок той же формы: «Матчи и прогнозы · Мнения · Остальное» по этой команде / турниру; «Все» — «Главное» _np2.js.
  //   Под блоком — «Все новости»: табы типа (с «Итогом в цифрах») над общей лентой, верхний выбор на неё не влияет; шапка с табами липнет при прокрутке.
  const it8 = (n) => `<a class="np3-i" href="${n.url}" target="_blank" rel="noopener"><span class="np3-m"><time>${when(n.t)}</time></span><span class="np3-t">${chipT(n)}</span></a>`
  const block8 = (c) => { const t = [...c.tours, ...c.teams].find((x) => x.on); if (!t || c.mt.some((x) => x.on)) return ''
    const S = scope(), L = ALL.filter(S).sort((a, b) => (a.t < b.t ? 1 : -1)), hd = t.logo ? `<img class="n2-tl" src="${t.logo}" alt="">` : ''
    const cols = [['Матчи и прогнозы', (n) => ['match', 'prog'].includes(typeOf(n))], ['Мнения', (n) => typeOf(n) === 'op'], ['Остальное', (n) => !['match', 'prog', 'op'].includes(typeOf(n))]].map(([h, f]) => { const l = L.filter(f); return [h, l.slice(0, 6), l.length] })
    const PH = !isDesk(), j = Math.min(UP.c8, 2)
    return `${PH ? `<div class="mn-seg n2-sps upn-x">${cols.map(([h, , k], i) => `<button data-up8c="${i}" class="${i === j ? 'on' : ''}" type="button">${h}<small class="num">${k}</small></button>`).join('')}</div>` : ''}
      <section class="n2-sp upn-sp8 upn-x">${cols.map(([h, l, k], i) => (PH && i !== j ? '' : `<div class="n2-sp__c"><div class="n2-sp__h">${hd}${h}<small>${k}</small></div><div class="n2-sp__l">${l.map(it8).join('') || '<span class="upn-empty8">Пока нет новостей</span>'}</div></div>`)).join('')}</section>` }
  const wItem = (w) => `<button class="mn-bc upn-w8" data-upw="${w.wrap}" type="button"><span class="mn-bi mn-bv"><img src="${TIL}" alt=""></span><span class="mn-bb"><span class="mn-wm"><time>${w.t.slice(11, 16)}</time>${tyPill(w)}</span><span class="mn-bt">${esc(w.title)}</span></span></button>`
  const feed8 = () => { const A = [...ALL, ...WRAPS], T = [{ id: 'all', name: 'Все', k: ALL.length }, ...TY.map((t) => ({ ...t, k: A.filter((n) => typeOf(n) === t.id).length })).filter((t) => t.k)]
    const L = (UP.ty === 'all' ? ALL : A.filter((n) => typeOf(n) === UP.ty)).slice().sort((a, b) => (a.t < b.t ? 1 : -1)), V = L.slice(0, UP.rn)
    return `<div class="upn-f8 upn-x"><div class="upn-f8__h"><h2>Все новости</h2><div class="upn-tabs">${T.map((t) => `<button class="${UP.ty === t.id ? 'on' : ''}" data-upty="${t.id}" type="button">${t.id === 'all' ? '' : `<i class="upn-dot upn-ty--${t.id}"></i>`}${t.name}<small class="num">${t.k}</small></button>`).join('')}</div></div>
      <div class="mn mn--big mn--row mn--row2 mn--row3 n2-rw upn-feed">${[...new Set(V.map((n) => n.t.slice(0, 10)))].map((d) => `<div class="n2-day__h"><b>${dayName(d)}</b><small>${nws(L.filter((n) => n.t.startsWith(d)).length)}</small></div><div class="mn-bg">${V.filter((n) => n.t.startsWith(d)).map((n) => (n.wrap ? wItem(n) : card(n))).join('')}</div>`).join('')}
      ${L.length > V.length ? `<button class="mn-bmore" data-upmore>Показать ещё ${Math.min(16, L.length - V.length)} из ${L.length - V.length}</button>` : ''}</div></div>` }

  let busy = false, obs = null
  function run() { const M = document.getElementById('main'); if (!M || !M.querySelector('.top-l')) return; busy = true
    try {
      M.querySelectorAll('a[href]').forEach(deco)
      M.querySelectorAll('.n2-sl__s').forEach((s) => { const n = BYURL.get(s.getAttribute('href')); if (!n || s.querySelector('.n2-sl__l')) return; const ld = lede(n); if (ld) s.querySelector('.n2-sl__b b').insertAdjacentHTML('afterend', `<span class="n2-sl__l">${esc(ld)}</span>`) })
      const f0 = M.querySelector('.n2-sp__c .np3-i'); if (f0 && !f0.querySelector('.upn-ld')) { const n = BYURL.get(f0.getAttribute('href')), ld = n && lede(n); if (ld) f0.querySelector('.np3-t').insertAdjacentHTML('afterend', `<span class="upn-ld">${esc(ld)}</span>`) }
      const S = scope(), L = M.querySelector('.top-l'), side = M.querySelector('.n2-side'), c = chipsOf(), ch = M.querySelector('.n2-ch')
      M.querySelectorAll('.upn-x').forEach((e) => e.remove()); L.querySelector('.upn-feed')?.remove()
      document.body.classList.add('upn-f-' + FV); M.classList.toggle('upn-typed', UP.ty !== 'all' && FV !== 'scoped')
      side?.insertAdjacentHTML('afterbegin', wWidget(c))
      const top = (h) => L.insertAdjacentHTML('afterbegin', h)
      if (FV === 'center') { top(`<div class="upn-fc upn-x"><div class="upn-fc__ch"></div>${tfHtml(S)}</div>`); if (ch) L.querySelector('.upn-fc__ch').append(ch) }
      if (FV === 'right') { side?.querySelector('.upn-ww')?.insertAdjacentHTML('afterend', fWidget('Фильтры', secMt(c.mt) + secTp(c.tours, 'Турниры') + secTp(c.teams, 'Команды') + secTy(S), c))
        top(selRow(c, isDesk() ? '' : sheetBtn('Фильтры', nOn(c)))) }
      if (FV === 'row') top(`<div class="upn-r1 upn-x">${ddHtml(c)}${liveChip(c)}<i class="upn-r1__sep"></i>${tabs(S)}</div>`)
      if (FV === 'split') { top(`<div class="upn-r1 upn-x">${liveChip(c)}${isDesk() ? '' : sheetBtn('Команды и турниры', [...c.tours, ...c.teams].filter((t) => t.on).length + c.mt.filter((x) => x.on && x.m !== live).length)}<i class="upn-r1__sep"></i>${tabs(S)}</div>`)
        side?.querySelector('.upn-ww')?.insertAdjacentHTML('afterend', fWidget('Команды и турниры', secMt(c.mt.filter((x) => x.m !== live), 'Матчи сегодня') + secTp(c.tours, 'Турниры') + secTp(c.teams, 'Команды'), { ...c, mt: c.mt.filter((x) => x.m !== live) }))
        if (!isDesk()) { const sl = selRow({ ...c, mt: c.mt.filter((x) => x.m !== live) }); if (sl) L.querySelector('.upn-r1').insertAdjacentHTML('afterend', sl.replace(/<button class="upn-sel" data-upty="all"[\s\S]*?<\/button>/, '')) } }
      sheet(c, S)
      if (FV === 'scoped') { const b8 = block8(c); if (b8) { M.querySelector('.n2-top')?.classList.add('upn-hid'); top(b8) } top(`<div class="upn-fc upn-x"><div class="upn-fc__ch"></div></div>`); if (ch) L.querySelector('.upn-fc__ch').append(ch); one(ch); swH(L)
        L.insertAdjacentHTML('beforeend', feed8()); const f = L.querySelector('.upn-feed .mn-bg > a.mn-bc'); if (f) makeLead(f) }
      else if (UP.ty !== 'all') { L.insertAdjacentHTML('beforeend', feedHtml(S)); const f = L.querySelector('.upn-feed .mn-bg > a.mn-bc'); if (f) makeLead(f) }
      else { const rw = L.querySelector('.n2-rw:not(.upn-feed)'), f = rw?.querySelector('.mn-bg > a.mn-bc'); if (f && !rw.querySelector('.upn-lead')) makeLead(f) }
    } finally { obs?.takeRecords(); busy = false } }

  // телефон: турнир, «Итог в цифрах» и трансферы — короткой строкой под матчами (вне #main, рисуется один раз)
  const topBar = () => { const el = document.getElementById('upn-top'); if (!el) return; const w = wOf('ti'), tr = DB.transfers()[0], tp = tr && D.players[tr.player]
    el.innerHTML = `<div class="upn-qs"><button class="upn-q" data-upgo="np-t4" type="button"><img class="upn-lg" src="${TIL}" alt=""><span><b>The International 2026</b><small><span class="upn-lv"></span>${esc(TI.stage)} · до 23.08</small></span></button>
      <button class="upn-q" data-upw="ti" type="button"><span class="upn-q__ic upn-ty--wrap"></span><span><b>Итог в цифрах</b><small>${esc(w.title)}</small></span></button>
      ${tr ? `<button class="upn-q" data-upgo="np-tr" type="button">${tp?.photo ? `<img class="upn-q__ph" src="${DB.url(tp.photo)}" alt="">` : ''}<span><b>Трансферы</b><small>${esc(tr.nick)}: ${tr.from ? esc(DB.name(tr.from, 'mid')) : 'без команды'} → ${tr.to ? esc(DB.name(tr.to, 'mid')) : 'без команды'} · ${tr.date.slice(8, 10)}.${tr.date.slice(5, 7)}</small></span></button>` : ''}</div>` }

  const go = () => { if (busy) return; cancelAnimationFrame(go.r); go.r = requestAnimationFrame(run) }
  addEventListener('DOMContentLoaded', () => { topBar(); run(); (obs = new MutationObserver(go)).observe(document.getElementById('main'), { childList: true, subtree: true }) })
  // v9: выбранный чип и его крестик не снимают выбор (иначе вернётся «Все»); ловим раньше _np2.js
  addEventListener('click', (e) => { if (!ONE) return; const t = e.target.closest('#main .n2-ch [data-mx], #main .n2-ch .n2-chip.is-on'); if (t) { e.stopPropagation(); e.preventDefault() } }, true)
  document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s)
    const nx = q('[data-upchn]'); if (nx) { const c = nx.parentElement.querySelector('.n2-ch'); c?.scrollBy({ left: +nx.dataset.upchn * c.clientWidth * 0.7, behavior: 'smooth' }); return }
    const ty = q('[data-upty]'); if (ty) { UP.ty = UP.ty === ty.dataset.upty ? 'all' : ty.dataset.upty; UP.rn = 16; run(); if (FV === 'scoped') { const h = document.querySelector('.upn-f8'); if (h && h.getBoundingClientRect().top < 0) h.scrollIntoView({ block: 'start' }) } return }
    const c8 = q('[data-up8c]'); if (c8) { UP.c8 = +c8.dataset.up8c; run(); return }
    if (q('[data-upmore]')) { UP.rn += 16; run(); return }
    const w = q('[data-upw]'); if (w) { e.preventDefault(); openArt(w.dataset.upw); return }
    if (q('[data-upx]') || e.target.classList?.contains('upn-ov')) { closeArt(); return }
    if (q('[data-updd]')) { UP.dd = !UP.dd; run(); return }
    if (q('[data-upsheet]')) { UP.sheet = !UP.sheet; run(); return }
    if (e.target.classList?.contains('upn-sh')) { UP.sheet = false; run(); return }
    const g = q('[data-upgo]'); if (g) { document.getElementById(g.dataset.upgo)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    if (q('[data-tall]') && FV !== 'scoped') UP.ty = 'all' // «Сбросить» / «Все» — сбрасывает и тип; дальше — _np2.js
    if (q('.upn-dd [data-mm], .upn-dd [data-top]')) UP.dd = false
    else if (UP.dd && !q('.upn-dd')) { UP.dd = false; run() }
  }, true)
  addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (document.querySelector('.upn-ov')) { e.stopPropagation(); closeArt() } else if (UP.dd || UP.sheet) { UP.dd = UP.sheet = false; run() } }, true)
})()
