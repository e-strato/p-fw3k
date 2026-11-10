// gs-upgrade v3-news — улучшенная страница новостей (основа news-page v62) по сравнению с блогами аналитиков
// (внутренняя документация/figma-разбор/14-аналитика/analysis/news.md, «Что добавить» 1–7). Страницу рисует ../news-page/_np2.js (не трогаем) —
// этот файл ДОРИСОВЫВАЕТ поверх после каждой её отрисовки (MutationObserver на #main):
//   1 тип новости вместо «Tier 1» + сегмент «тип» под чипами (тематические чипы «Мнения / Трансферы / Игра и патч / Слухи / Сцена» убраны из ряда — это и есть типы)
//   2 вводка у главных: слайдер, первая в ленте, первая в «Обе команды» матча · 3 обложка из данных вместо лого-заглушки и чужих фото
//   4 свой тип «Итог в цифрах» (турнир / серия / пара перед матчем) — карточка в ленте и разворот-статья · 5 комментарии + «Ещё по теме»
//   6 закреп главного материала строкой под матч-баром · 7 телефон: турнир и трансферы короткой строкой под матчами
// Данные — только общая база (window.DB) и детали матчей (window.GS_DATA). ‼️ Пример: вводки и тексты «Итогов» (_upn-data.js), тип — по словам в заголовке.
;(() => {
  const DB = window.DB, D = DB.data, U = window.UPN_DATA, G = window.GS_DATA || { series: [] }
  const FEED = window.NEWS_FEED, ALL = FEED.slice(1), BYURL = new Map(FEED.map((n) => [n.url, n]))
  const NB = Object.fromEntries(D.news.map((n) => [n.id, n])), nb = (n) => n.meta || NB[n.db] || { teams: [], players: [], tours: [] }
  const UP = { ty: 'all', rn: 16, pinOff: false }
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
  // ── 3. Обложка из данных: серия (счёт, карты, пики) · игрок (K/D/A, герои) · команда (серии, форма, пики) · турнир (мета). Узкая — коротко, широкая (лид) — подробно ──
  const cover = (n) => { const K = kindOf(n); if (!K) return ''
    if (K.k === 'mt') { const m = K.m, s = gsOf(m), last = s?.maps[s.maps.length - 1]
      const pa = last ? mapPicks(last, m.a) : (tsOf(m.a)?.picks || []).map((x) => x[0]), pb = last ? mapPicks(last, m.b) : (tsOf(m.b)?.picks || []).map((x) => x[0])
      const st = m.state === 'live' ? `<span class="upn-lv"></span>Live · ${m.live.replace(/^Карта (\d+)/, 'карта $1')}` : m.stage
      return `<span class="mn-bi upn-cv upn-cv--mt"><span class="upn-cv__sc">${lg(m.a)}<b class="num">${m.score[0]}:${m.score[1]}</b>${lg(m.b)}</span><span class="upn-cv__s">${st}</span>
        <span class="upn-cv__maps">${m.maps.map((x, i) => `<span class="${x.win === m.a ? 'is-a' : 'is-b'}">${i + 1}<small>${mmss(x.dur)}</small></span>`).join('')}</span>
        <span class="upn-cv__pk"><span>${pa.slice(0, 5).map((h) => hIc(h)).join('')}</span><span>${pb.slice(0, 5).map((h) => hIc(h)).join('')}</span></span>
        <span class="upn-cv__f">${last ? `Пики карты ${s.maps.length}` : 'Чаще всего пикают на TI'}</span></span>` }
    if (K.k === 'pl') { const p = D.players[K.p], x = psOf(K.p)
      return `<span class="mn-bi upn-cv upn-cv--pl">${p.photo ? `<img class="upn-cv__ph" src="${DB.url(p.photo)}" alt="">` : `<span class="upn-cv__ph is-ini">${esc(p.nick.slice(0, 2))}</span>`}
        <span class="upn-cv__in"><b>${esc(p.nick)}</b><span class="upn-cv__s">${x.team ? lg(x.team, 'upn-lg upn-lg--s') + esc(DB.name(x.team, 'mid')) : ''}</span>
        <span class="upn-cv__k"><b class="num">${x.k}/${x.d}/${x.a}</b><small>K/D/A · ${x.maps} карт</small></span>
        <span class="upn-cv__x"><span>KDA <b class="num">${dec(x.kda)}</b></span><span>GPM <b class="num">${x.gpm}</b></span></span>
        <span class="upn-cv__hs">${x.heroes.slice(0, 3).map((h) => hIc(h.hero)).join('')}</span></span></span>` }
    if (K.k === 'tm') { const t = K.t, s = tsOf(t)
      return `<span class="mn-bi upn-cv upn-cv--tm">${lg(t, 'upn-lg upn-lg--b')}<span class="upn-cv__in"><b>${esc(DB.name(t))}</b>
        <span class="upn-cv__x"><span>Серии <b class="num">${s.series[0]}–${s.series[1]}</b></span><span>Карты <b class="num">${s.maps[0]}–${s.maps[1]}</b></span></span>${form(t)}
        <span class="upn-cv__hs">${s.picks.slice(0, 4).map((h) => hIc(h[0])).join('')}</span></span></span>` }
    const top = HS.list.slice().sort((a, b) => b.pickBan - a.pickBan).slice(0, 4)
    return `<span class="mn-bi upn-cv upn-cv--ti"><img class="upn-lg upn-lg--b" src="${TIL}" alt=""><span class="upn-cv__in"><b>TI 2026</b><span class="upn-cv__s">${esc(TI.stage)}</span>
      <span class="upn-cv__x"><span><b class="num">${HS.games}</b> карт</span><span>Radiant <b class="num">${HS.sub.replace(/.*Radiant /, '')}</b></span></span>
      <span class="upn-cv__hs">${top.map((h) => hIc(h.hero)).join('')}</span></span></span>` }

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
  const wCard = (w, lead) => `<button class="mn-bc upn-wcard${lead ? ' is-lead' : ''}" data-upw="${w.wrap}" type="button">${wCover(w)}<span class="mn-bb"><span class="mn-wm"><time>${when(w.t)}</time>${tyPill(w)}<span class="upn-own">GoatScout</span></span>
    <span class="mn-bt">${esc(w.title)}</span><span class="upn-ld">${esc(w.lede)}</span><span class="upn-go">Открыть разбор · ${w.read} мин ›</span></span></button>`

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
      ${L.length ? `<section class="upn-a__s upn-a__more"><h3>Ещё по теме<small>${esc(why)}</small></h3><div class="upn-a__g">${L.map((x) => `<a href="${x.url}" target="_blank" rel="noopener">${x.img ? `<img src="${x.img}" alt="" loading="lazy">` : cover(x) || ''}<span class="mn-wm"><time>${when(x.t)}</time>${tyPill(x)}${cm(x)}</span><span class="upn-a__gt">${chipT(x)}</span></a>`).join('')}</div></section>` : ''}</article>`
    document.body.append(el); document.body.classList.add('upn-lock'); el.querySelector('.upn-a__x').focus({ preventScroll: true }) }
  const closeArt = () => { document.querySelector('.upn-ov')?.remove(); document.body.classList.remove('upn-lock') }

  // ── область ленты: матч (чип матча), тема (чип темы), тип ──
  const scope = () => { const mm = document.querySelector('.n2-mc.is-on')?.dataset.mm, m = mm && D.matches.find((x) => x.id === mm), tp = document.querySelector('.n2-chip.is-on[data-top]')?.dataset.top
    return (n) => { const M = nb(n)
      if (m) return M.teams.includes(m.a) || M.teams.includes(m.b)
      if (tp === 'uni') return M.tours.includes('ti-2026') || /TI15|The International/i.test(n.title)
      if (tp && D.teams[tp]) return M.teams.includes(tp)
      return true } }
  // ── 1. сегмент «тип новости» ──
  const tfHtml = (S) => { const L = [...ALL, ...WRAPS].filter(S)
    return `<div class="upn-tf"><div class="mn-seg"><button class="${UP.ty === 'all' ? 'on' : ''}" data-upty="all">Все типы<small class="num">${L.length}</small></button>${TY.map((t) => [t, L.filter((n) => typeOf(n) === t.id).length]).filter(([t, k]) => k || t.id === UP.ty).map(([t, k]) => `<button class="${UP.ty === t.id ? 'on' : ''}" data-upty="${t.id}"><i class="upn-dot upn-ty--${t.id}"></i>${t.name}<small class="num">${k}</small></button>`).join('')}</div></div>` }
  // карточка ленты (как ряды _np2.js: mn-bc) — для отфильтрованной по типу ленты
  const card = (n) => n.wrap ? wCard(n) : `<a class="mn-bc" href="${n.url}" target="_blank" rel="noopener" data-upn="1">${n.img ? `<img class="mn-bi" src="${n.img}" alt="" loading="lazy">` : cover(n) || `<span class="mn-bi mn-bv"><img src="${TIL}" alt=""></span>`}<span class="mn-bb"><span class="mn-wm"><time>${n.t.slice(11, 16)}</time>${tyPill(n)}${cm(n)}</span><span class="mn-bt">${chipT(n)}</span></span></a>`
  const feedHtml = (S) => { const L = [...ALL, ...WRAPS].filter((n) => S(n) && typeOf(n) === UP.ty).sort((a, b) => (a.t < b.t ? 1 : -1)), V = L.slice(0, UP.rn)
    if (!L.length) return `<div class="upn-feed upn-empty">Новостей этого типа нет — выберите другой тип или «Все типы».</div>`
    return `<div class="mn mn--big mn--row mn--row2 mn--row3 n2-rw upn-feed">${[...new Set(V.map((n) => n.t.slice(0, 10)))].map((d) => `<div class="n2-day__h"><b>${dayName(d)}</b><small>${nws(L.filter((n) => n.t.startsWith(d)).length)}</small></div><div class="mn-bg">${V.filter((n) => n.t.startsWith(d)).map(card).join('')}</div>`).join('')}
      ${L.length > V.length ? `<button class="mn-bmore" data-upmore>Показать ещё ${Math.min(16, L.length - V.length)} из ${L.length - V.length}</button>` : ''}</div>` }

  // ── лид: первая карточка ленты — широкая, обложка из данных, вводка, «Ещё по теме» ──
  const makeLead = (a) => { const n = BYURL.get(a.getAttribute('href')); if (!n || a.closest('.upn-lead')) return
    const ld = lede(n), box = document.createElement('div'); box.className = 'mn-bc upn-lead'
    a.classList.remove('mn-bc'); a.classList.add('upn-lead__a'); a.parentNode.insertBefore(box, a); box.append(a)
    if (!n.img) { const c = cover(n); if (c) a.querySelector('.mn-bi').outerHTML = c }
    if (ld && !a.querySelector('.upn-ld')) a.querySelector('.mn-bt').insertAdjacentHTML('afterend', `<span class="upn-ld">${esc(ld)}</span>`)
    box.insertAdjacentHTML('beforeend', relHtml(n)); box.parentNode.classList.add('has-lead') }

  // ── обработка одной карточки _np2.js: тип вместо Tier 1, комментарии, обложка из данных ──
  const deco = (a) => { if (a.dataset.upn) return; const n = BYURL.get(a.getAttribute('href')); if (!n) return; a.dataset.upn = '1'
    const m = a.querySelector('.np3-m, .mn-wm'); if (m) { m.querySelector('.t5-tier')?.remove(); const t = m.querySelector('time'); if (t) t.insertAdjacentHTML('afterend', tyPill(n)); else m.insertAdjacentHTML('afterbegin', tyPill(n)); m.insertAdjacentHTML('beforeend', cm(n)) }
    if (a.classList.contains('mn-bc') && !n.img) { const c = cover(n), bi = a.querySelector('.mn-bi'); if (c && bi) bi.outerHTML = c } }

  let busy = false, obs = null
  function run() { const M = document.getElementById('main'); if (!M || !M.querySelector('.top-l')) return; busy = true
    try {
      M.querySelectorAll('a[href]').forEach(deco)
      // 2. вводки у слайдера «Главного»
      M.querySelectorAll('.n2-sl__s').forEach((s) => { const n = BYURL.get(s.getAttribute('href')); if (!n || s.querySelector('.n2-sl__l')) return; const ld = lede(n); if (ld) s.querySelector('.n2-sl__b b').insertAdjacentHTML('afterend', `<span class="n2-sl__l">${esc(ld)}</span>`) })
      // 2. вводка у первой новости матча («Обе команды»)
      const f0 = M.querySelector('.n2-sp__c .np3-i'); if (f0 && !f0.querySelector('.upn-ld')) { const n = BYURL.get(f0.getAttribute('href')), ld = n && lede(n); if (ld) { f0.querySelector('.np3-t').insertAdjacentHTML('afterend', `<span class="upn-ld">${esc(ld)}</span>`); f0.classList.add('upn-f0') } }
      const S = scope(), L = M.querySelector('.top-l')
      // 1. сегмент типов — под чипами
      M.querySelector('.upn-tf')?.remove(); M.querySelector('.n2-ch')?.insertAdjacentHTML('afterend', tfHtml(S))
      // фильтр по типу: «Главное» / колонки матча / ряды прячем, рисуем свою ленту
      L.querySelector('.upn-feed')?.remove(); M.classList.toggle('upn-typed', UP.ty !== 'all')
      if (UP.ty !== 'all') { L.insertAdjacentHTML('beforeend', feedHtml(S)); const f = L.querySelector('.upn-feed .mn-bg > a.mn-bc'); if (f && !L.querySelector('.upn-feed .mn-bg > .upn-wcard:first-child')) makeLead(f) }
      else { const rw = L.querySelector('.n2-rw:not(.upn-feed)'); if (rw) { const f = rw.querySelector('.mn-bg > a.mn-bc'); if (f && !rw.querySelector('.upn-lead')) makeLead(f)
        // 4. «Итог в цифрах» в ленте: без фильтра — разбор серии после лида; в матче — пара команд матча первой
        if (!rw.querySelector('.upn-wcard')) { const mm = document.querySelector('.n2-mc.is-on')?.dataset.mm, tp = document.querySelector('.n2-chip.is-on[data-top]')
          const lead = rw.querySelector('.upn-lead'), mt = mm && D.matches.find((x) => x.id === mm); if (mt && W.pair.teams.every((t) => t === mt.a || t === mt.b)) rw.querySelector('.mn-bg')?.insertAdjacentHTML('afterbegin', wCard(wOf('pair')))
          else if (!tp && lead) lead.insertAdjacentHTML('afterend', wCard(wOf('ser'))) } } }
    } finally { obs?.takeRecords(); busy = false } }

  // ── 6. закреп + 7. строка «турнир · трансферы» (телефон) — вне #main, рисуются один раз ──
  const topBar = () => { const el = document.getElementById('upn-top'); if (!el) return; const w = wOf('ti'), tr = DB.transfers()[0], tp = tr && D.players[tr.player]
    const PIN = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5h4l-.5 4 2.5 2.5H4l2.5-2.5zM8 9v4.5"/></svg>'
    el.innerHTML = `<div class="upn-qs"><button class="upn-q" data-upgo="np-t4" type="button"><img class="upn-lg" src="${TIL}" alt=""><span><b>The International 2026</b><small><span class="upn-lv"></span>${esc(TI.stage)} · до 23.08</small></span></button>
      ${tr ? `<button class="upn-q" data-upgo="np-tr" type="button">${tp?.photo ? `<img class="upn-q__ph" src="${DB.url(tp.photo)}" alt="">` : ''}<span><b>Трансферы</b><small>${esc(tr.nick)}: ${tr.from ? esc(DB.name(tr.from, 'mid')) : 'без команды'} → ${tr.to ? esc(DB.name(tr.to, 'mid')) : 'без команды'} · ${tr.date.slice(8, 10)}.${tr.date.slice(5, 7)}</small></span></button>` : ''}</div>
      ${UP.pinOff ? '' : `<div class="upn-pin"><button class="upn-pin__b" data-upw="ti" type="button"><span class="upn-pin__i">${PIN}</span>${tyPill(w)}<b>${esc(w.title)}</b><span class="upn-pin__m">${w.read} мин</span><span class="upn-pin__go">Открыть ›</span></button><button class="upn-pin__x" data-uppin aria-label="Скрыть закреп">${XI}</button></div>`}` }

  const go = () => { if (busy) return; cancelAnimationFrame(go.r); go.r = requestAnimationFrame(run) }
  addEventListener('DOMContentLoaded', () => { topBar(); run(); (obs = new MutationObserver(go)).observe(document.getElementById('main'), { childList: true, subtree: true }) })
  // клики: свои — раньше _np2.js (capture)
  document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s)
    const ty = q('[data-upty]'); if (ty) { UP.ty = ty.dataset.upty; UP.rn = 16; run(); return }
    if (q('[data-upmore]')) { UP.rn += 16; run(); return }
    const w = q('[data-upw]'); if (w) { e.preventDefault(); openArt(w.dataset.upw); return }
    if (q('[data-upx]') || e.target.classList?.contains('upn-ov')) { closeArt(); return }
    if (q('[data-uppin]')) { UP.pinOff = true; topBar(); return }
    const g = q('[data-upgo]'); if (g) { document.getElementById(g.dataset.upgo)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    if (q('[data-tall]')) UP.ty = 'all' // «Все» в чипах — сбрасывает и тип
  }, true)
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.querySelector('.upn-ov')) { e.stopPropagation(); closeArt() } }, true)
})()
