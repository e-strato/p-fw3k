// Главная v2 (лаба gs-home, дирижёр 10.11: «нужна реальная главная — блок матчей основной, но не всю страницу; чёрно-белое, фиолетовый — точечно»).
// Слева: «Матчи» — плитки в 2 колонки (сегодня / завтра, игры значками), 8 штук + «Всё расписание» (→ v1); ниже «Главное» — новости с фото из базы.
// Справа — готовые виджеты: Турниры (T4), Новости (NW2), Трансферы (TR2). Фиолетовый — только точка «идёт». Данные — _sch.js (Dota — база, остальное — пример).
// v3 (HOME2.mount({ v3: true }), дирижёр 10.11: «на главную — всё, что есть у 3 из 6 конкурентов и выше»): слева Матчи · Главное · Турниры (идут · скоро);
//   справа Рейтинг команд (‼️ пример — рейтинга в базе нет) и Трансферы (TR2). Тир — серым, Tier 1 — белым.
// v4 (HOME2.mount({ v3: true, v4: true }), дирижёр 10.11: «скудно» → + блоки 2 из 6): сверху крупно live-матч (база: PARIVISION — Team Spirit);
//   справа + «Топ игроков» (база: очки TI 2026) и «Стримы» (‼️ пример — DB.fake.streams).
// v5–v7 (HOME2.mount({ v3, v4, lay: 'cols' | 'bento' | 'feed' }), дирижёр 10.11: «много воздуха — на других страницах впихиваем всё, это наша фишка; нет футера;
//   три версии, кардинально по-другому, за основу v4»): те же блоки, плотнее (карточка 12, заголовок 16), три раскладки + футер.
//   cols — три колонки как HLTV: слева расписание строками · в центре live, новости, турниры · справа рейтинг, игроки, стримы, трансферы.
//   bento — сетка: live + стримы · новости 4 карточками в ряд · три колонки (матчи · турниры и рейтинг · игроки и трансферы).
// v8–v10 (lay: 'v1' | 'live' | 'games', дирижёр 10.11: «две колонки обязательно; матчи — первые и главные; отображение сложнее, как в старых версиях»):
//   две колонки (1fr + 360), сверху «Матчи» строками как в v1 (время · команды · счёт · шанс · Bo · ★), турниры группами; плотнее, футер.
//   v1 — главный live карточкой с листалкой + список live справа (как v1), ниже строки по турнирам · live — крупный матч из базы, ниже строки по турнирам · games — строки по играм.
// v11 (lay: 'v11', дирижёр 10.11, основа v9): сверху крупный блок новостей вместо live-матча; «Матчи» без общей карточки — группы турниров прямо на странице,
//   строка раскрывается на месте (как лаба row-expand v5 — выбор 08.10): мини-виджеты по состоянию (карты серии · шанс · форма · новость) и кнопки «Смотреть / Страница матча»;
//   сразу после матчей «Турниры» и «Главные турниры — скоро» карточками со страницы «Все турниры»; дальше новости как на странице новостей v62 (2 в ряд по дням) → «Читать все новости».
// v12–v14 (o.ex: 'cmp' | 'pl' | 'draft', дирижёр 11.11: «мини-виджеты в раскрытой строке — несколько вариантов, более статистические; как в старых версиях и на турнире у Claude-B»):
//   cmp — команды рядом (серии, карты, длина карты, очки игроков — полосы к центру) + форма 5 серий с соперниками + личные встречи;
//   pl — игроки обеих команд (фото, герой, K/D/A, GPM, очки; лучший — белым) + личные встречи; draft — пики и баны команд героями + мета турнира.
//   Dota — база (статистика TI 2026); остальные игры — ‼️ пример (cmp; pl и draft без данных — показывают cmp).
//   feed — лента: полоса матчей дня во всю ширину · слева турниры и рейтинг · в центре live и новости лентой · справа игроки, стримы, трансферы.
window.HOME2 = (() => {
  const S = window.SCH, { esc, logo, name, gameIc, hm, ymd, LIVE } = S
  const P = new URLSearchParams(location.search), FIT = P.has('fit'), fitView = () => (innerWidth < 800 ? 'phone' : 'desk')
  const CFG = { view: FIT ? fitView() : 'desk', game: 'all', day: 'today', spoil: false, state: 'ok', more: false, tt: 'live', rg: 'dota2', hero: 0, star: new Set(), rev: new Set() }
  let O = {}
  const MAX = 8
  const isLive = (m) => LIVE.includes(m.state)
  const ORD = { live: 0, draft: 0, pause: 0, break: 0, delayed: 1, soon: 2, tba: 3, moved: 4, cancel: 5, done: 6 }
  const pl = (n, a, b, c) => { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 12 || y > 14) ? b : c }
  const TOMORROW = (() => { const d = new Date(S.TODAY + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10) })()
  const all = () => (CFG.state === 'empty' ? [] : S.M.filter((m) => !(CFG.state === 'nolive' && isLive(m))))
  const ofDay = (A) => A.filter((m) => S.ymd(m.start) === (CFG.day === 'today' ? S.TODAY : TOMORROW))
  const list = () => ofDay(all()).filter((m) => CFG.game === 'all' || m.game === CFG.game)
    .sort((a, b) => (ORD[a.state] - ORD[b.state]) || (a.state === 'done' ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start)))
  const ARR = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>'

  // ── плитка матча: турнир и время / состояние сверху, две строки команд со счётом
  const mapLbl = (m) => (m.game === 'lol' || m.game === 'mlbb' ? 'Game' : 'Map') + ' ' + (m.map || 1)
  const when = (m) => {
    if (m.state === 'live') return `<span class="h2-st"><i class="sc-dot"></i>${mapLbl(m)}${m.clock ? ` · <span class="mono">${m.clock}</span>` : ''}</span>`
    if (m.state === 'draft') return `<span class="h2-st"><i class="sc-dot"></i>Драфт · ${mapLbl(m)}</span>`
    if (m.state === 'pause') return `<span class="h2-st">Пауза · ${mapLbl(m)}</span>`
    if (m.state === 'break') return `<span class="h2-st is-mut">Перерыв · <span class="mono">${m.inMin}′</span></span>`
    if (m.state === 'delayed') return `<span class="h2-st is-mut"><s class="mono">${hm(m.start)}</s> <span class="mono h2-w">~${hm(new Date(Date.parse(m.start) + m.delay * 60000).toISOString())}</span></span>`
    if (m.state === 'moved') return `<span class="h2-st is-mut">Перенос → <span class="mono">${S.dm(ymd(m.to))}</span></span>`
    if (m.state === 'cancel') return '<span class="h2-st is-mut">Отменён</span>'
    if (m.state === 'tba') return '<span class="h2-st is-mut">Время уточнят</span>'
    if (m.state === 'done') return '<span class="h2-st is-mut">Завершён</span>'
    const n = Math.round((Date.parse(m.start) - S.NOW) / 60000)
    return `<span class="h2-st"><span class="mono h2-w">${hm(m.start)}</span>${n > 0 && n < 60 ? `<span class="is-mut">через <span class="mono">${n}′</span></span>` : ''}</span>` }
  const tile = (m) => {
    const t = S.T[m.tour], done = m.state === 'done', hide = CFG.spoil && done, sc = m.score
    const w = done && sc && !hide ? (sc[0] > sc[1] ? 0 : 1) : -1, showSc = sc && (done || isLive(m)) && !hide
    const tm = (i) => `<div class="h2-tm${w === 1 - i ? ' is-lose' : ''}">${logo(m[i ? 'b' : 'a'], 20)}<span class="h2-tm__n">${name(m[i ? 'b' : 'a'], 'mid')}</span>
      <span class="h2-tm__s">${showSc ? sc[i] : hide ? '•' : ''}</span></div>`
    return `<div class="h2-m${isLive(m) ? ' is-live' : ''}${m.state === 'cancel' ? ' is-cancel' : ''}" data-m="${m.id}" role="link" tabindex="0">
      <div class="h2-m__top">${gameIc(m.game, 14)}<span class="h2-m__t">${esc(t.short || t.name)}</span>${when(m)}</div>
      ${tm(0)}${tm(1)}
      <div class="h2-m__ft"><span>${esc(m.stage || '')}</span><span class="mono">Bo${m.bo}</span></div></div>` }

  const games = (A) => { const D = ofDay(A), cnt = (g) => D.filter((m) => g === 'all' || m.game === g).length
    const b = (g, inner, ttl) => `<button class="${CFG.game === g ? 'is-on' : ''}" data-game="${g}" title="${ttl}">${inner}${CFG.view === 'desk' || g === 'all' ? `<small class="mono">${cnt(g)}</small>` : ''}</button>`
    return `<div class="h2-g">${b('all', 'Все', 'Все игры')}${S.GAMES.map((g) => b(g.id, gameIc(g.id, 16), g.name)).join('')}</div>` }

  const matches = () => {
    const A = all(), L = list(), lv = ofDay(A).filter(isLive).length
    const shown = CFG.more ? L : L.slice(0, MAX), rest = L.length - shown.length
    const head = `<div class="h2-h"><h2>Матчи</h2>${lv && CFG.day === 'today' ? `<span class="h2-lv"><i class="sc-dot"></i><b class="mono">${lv}</b> ${pl(lv, 'идёт', 'идут', 'идут')}</span>` : ''}
      <div class="h2-seg"><button class="${CFG.day === 'today' ? 'is-on' : ''}" data-day="today">Сегодня</button><button class="${CFG.day === 'tom' ? 'is-on' : ''}" data-day="tom">Завтра</button></div></div>`
    if (CFG.state === 'skel') return `<section class="h2-card">${head}<div class="h2-grid">${Array.from({ length: CFG.view === 'desk' ? 6 : 3 }, () => '<div class="h2-m"><span class="sk" style="width:50%;height:12px"></span><span class="sk" style="height:20px"></span><span class="sk" style="height:20px"></span></div>').join('')}</div></section>`
    const body = L.length ? `<div class="h2-grid">${shown.map(tile).join('')}</div>`
      : `<div class="h2-empty">${A.length ? `<b>${CFG.game === 'all' ? 'Матчей нет' : 'По этой игре матчей нет'}</b>${CFG.day === 'today' ? 'Посмотрите завтра' : 'Пары ещё объявят'}` : '<b>Матчей пока нет</b>Расписание обновится, как только турниры объявят пары'}</div>`
    return `<section class="h2-card">${head}${games(A)}${body}
      <div class="h2-ft">${rest > 0 ? `<button class="h2-ln" data-more>Ещё <span class="mono">${rest}</span></button>` : ''}<a class="h2-ln h2-ln--r" href="v1-schedule.html${FIT ? '?fit=1' : ''}">Всё расписание ${ARR}</a></div></section>` }

  // ── «Главное»: новости с фото из базы — одна крупная + 4 строками
  const ago = (iso) => { const n = Math.round((S.NOW - Date.parse(iso)) / 60000); return n < 60 ? `${Math.max(n, 1)} мин` : n < 1440 ? `${Math.floor(n / 60)} ч` : 'вчера' }
  const k1 = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : String(n))
  const EYE = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/></svg>'
  const meta = (n) => `<span class="h2-nm"><span class="mono">${ago(n.t)}</span>${n.views ? `<span>${EYE}<span class="mono">${k1(n.views)}</span></span>` : ''}</span>`
  const news = () => { if (!window.DB || CFG.state === 'skel') return ''
    const N = window.DB.news().filter((n) => n.img && Date.parse(n.t) <= S.NOW).slice(0, 5), u = (p) => window.DB.url(p)
    if (!N.length) return ''
    const [a, ...r] = N
    return `<section class="h2-card h2-news"><div class="h2-h"><h2>Главное</h2></div>
      <div class="h2-nw"><a class="h2-big" data-n="${a.id}" href="#"><span class="h2-big__img"><img src="${esc(u(a.img))}" alt=""></span><b>${esc(a.title)}</b>${a.lede ? `<span class="h2-big__l">${esc(a.lede)}</span>` : ''}${meta(a)}</a>
        <div class="h2-nl">${r.map((n) => `<a class="h2-n" data-n="${n.id}" href="#"><span class="h2-n__img"><img src="${esc(u(n.img))}" alt=""></span><span class="h2-n__b"><b>${esc(n.title)}</b>${meta(n)}</span></a>`).join('')}</div></div></section>` }

  // ── v3 «Турниры»: идут · скоро, 5 строк + «Все турниры» (как у Strafe и DLTV)
  const tierM = (n) => `<span class="h3-tier${n === 1 ? ' is-1' : ''}">Tier ${n}</span>`
  const tours = () => { if (CFG.state === 'skel') return ''
    const A = Object.values(S.T), L = A.filter((t) => t.state === (CFG.tt === 'live' ? 'live' : 'soon')).sort((a, b) => a.tier - b.tier || (CFG.tt === 'live' ? 0 : a.from.localeCompare(b.from))).slice(0, 5)
    const lvN = (t) => S.M.filter((m) => m.tour === t.id && isLive(m)).length
    const row = (t) => { const n = lvN(t)
      return `<div class="h3-t" data-tour="${t.id}" role="link" tabindex="0">${gameIc(t.game, 16)}${S.tourLogo(t, 28)}<span class="h3-t__n"><b>${esc(t.name)}</b><small>${CFG.tt === 'live' ? esc(t.stage || '') : `<span class="mono">${S.dm(t.from)} – ${S.dm(t.to)}</span>${t.where ? ' · ' + esc(t.where) : ''}`}</small></span>
        ${tierM(t.tier)}<span class="h3-t__p mono">${esc(t.prize)}</span><span class="h3-t__s">${CFG.tt === 'live' ? (n ? `<i class="sc-dot"></i><span class="mono">${n}</span> ${pl(n, 'матч', 'матча', 'матчей')}` : '') : (() => { const k = S.dayDiff(t.from); return `<span class="mono">${k === 1 ? 'завтра' : `через ${k} ${pl(k, 'день', 'дня', 'дней')}`}</span>` })()}</span></div>` }
    return `<section class="h2-card"><div class="h2-h"><h2>Турниры</h2><div class="h2-seg"><button class="${CFG.tt === 'live' ? 'is-on' : ''}" data-tt="live">Идут</button><button class="${CFG.tt === 'soon' ? 'is-on' : ''}" data-tt="soon">Скоро</button></div></div>
      <div class="h3-tl">${L.map(row).join('')}</div><div class="h2-ft"><a class="h2-ln h2-ln--r" href="../gs-tours/v4-gantt.html${FIT ? '?fit=1' : ''}">Все турниры ${ARR}</a></div></section>` }

  // ── v3 «Рейтинг команд»: топ-10 по игре. ‼️ пример: очки и движение придуманы (рейтинга в базе нет), команды Dota — участники TI 2026 из базы
  const RANK = (() => { const pts = [2840, 2615, 2390, 2210, 2045, 1890, 1760, 1620, 1505, 1390], dl = [0, 1, -1, 2, 0, -2, 3, 0, -1, 1]
    const by = { dota2: ['team-falcons', 'parivision', 'team-spirit', 'xtreme-gaming', 'team-liquid', 'betboom-team', 'team-yandex', 'nigma-galaxy', 'aurora-gaming', 'og'],
      cs2: ['vitality', 'mouz', 'spirit-cs', 'faze', 'navi', 'mongolz', 'falcons-cs', 'g2', 'big', 'ence'], lol: ['geng', 't1', 'hle', 'dk', 'g2-lol', 'fnc', 'kc', 'bds'],
      val: ['prx', 'sen', 'fnc-val', 'edg', 'th', 'geng-val'], mlbb: ['onic', 'rrq', 'evos', 'ae', 'btr', 'gf', 'tlid', 'dewa'] }
    return Object.fromEntries(Object.entries(by).map(([g, ids]) => [g, ids.map((id, i) => ({ id, pts: pts[i], d: dl[i] }))])) })()
  const UP = '<svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 1.5 7 6H1z" fill="currentColor"/></svg>', DN = '<svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 6.5 1 2h6z" fill="currentColor"/></svg>'
  const rating = () => { const R = RANK[CFG.rg] || []
    return `<section class="h2-card h3-rk"><div class="h2-h"><h2>Рейтинг команд</h2><span class="hm-ex">пример</span></div>
      <div class="h2-g">${S.GAMES.map((g) => `<button class="${CFG.rg === g.id ? 'is-on' : ''}" data-rg="${g.id}" title="${esc(g.name)}">${gameIc(g.id, 16)}</button>`).join('')}</div>
      <div class="h3-rl">${R.map((r, i) => `<div class="h3-r"><span class="h3-r__i mono">${i + 1}</span><span class="h3-r__d${r.d > 0 ? ' is-up' : r.d < 0 ? ' is-dn' : ''}">${r.d ? `${r.d > 0 ? UP : DN}<span class="mono">${Math.abs(r.d)}</span>` : '<span class="mono">—</span>'}</span>
        ${logo(r.id, 20)}<span class="h3-r__n">${name(r.id, 'mid')}</span><span class="h3-r__p mono">${r.pts}</span></div>`).join('')}</div></section>` }

  // ── v4 «Главный матч»: идущий матч из базы крупно — лого 56, счёт серии, карты (кто взял, длительность), «Смотреть матч»
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const liveBig = () => { if (!window.DB || ['skel', 'nolive', 'empty'].includes(CFG.state)) return ''
    const m = window.DB.matches({ state: 'live' })[0]; if (!m) return ''
    const t = window.DB.tour(m.tour), [lt, cl] = (m.live || '').split(' · ')
    const mp = [...(m.maps || []).map((x, i) => `<span class="h4-mp" title="${esc(name(x.win, 'mid'))}"><small>Карта ${i + 1}</small>${logo(x.win, 16)}<span class="mono">${mmss(x.dur)}</span></span>`),
      `<span class="h4-mp is-now"><small>Карта ${(m.maps || []).length + 1}</small><i class="sc-dot"></i><span class="mono">${esc(cl || '')}</span></span>`]
    const tm = (id) => `<div class="h4-tm">${logo(id, 56)}<b>${name(id, 'mid')}</b></div>`
    return `<section class="h2-card h4-lv" data-m="${m.id}" role="link" tabindex="0">
      <div class="h4-lv__top">${gameIc('dota2', 16)}<span class="h4-lv__t">${esc(t ? t.name : '')} · ${esc(m.stage || '')}</span><span class="h2-lv"><i class="sc-dot"></i>Идёт · ${esc(lt || '')}</span></div>
      <div class="h4-lv__sc">${tm(m.a)}<div class="h4-lv__n"><b class="mono">${m.score[0]} : ${m.score[1]}</b><small class="mono">Bo${m.bo}</small></div>${tm(m.b)}</div>
      <div class="h4-lv__ft"><div class="h4-mps">${mp.join('')}</div><span class="h4-btn">Смотреть матч ${ARR}</span></div></section>` }

  // ── v4 «Топ игроков»: 5 лучших по очкам TI 2026 (база), фото, команда, K/D/A
  const topPl = () => { if (!window.DB || CFG.state === 'skel') return ''
    const L = window.DB.playerStats('ti-2026').slice().sort((a, b) => b.pts - a.pts).slice(0, 5)
    const row = (x, i) => { const p = window.DB.player(x.player) || { nick: x.player }, d = x.pts - (x.ptsDayAgo ?? x.pts)
      return `<div class="h4-p"><span class="h3-r__i mono">${i + 1}</span>${p.photo ? `<img class="h4-p__ph" src="${esc(window.DB.url(p.photo))}" alt="">` : `<span class="h4-p__ph">${esc(p.nick[0])}</span>`}
        <span class="h4-p__n"><b>${esc(p.nick)}</b><small>${logo(x.team, 14)}${name(x.team, 'mid')} · <span class="mono">${x.k}/${x.d}/${x.a}</span></small></span>
        <span class="h4-p__v"><b class="mono">${x.pts}</b>${d > 0 ? `<small class="mono is-up">+${d}</small>` : ''}</span></div>` }
    return `<section class="h2-card"><div class="h2-h"><h2>Топ игроков</h2><span class="h4-sub">TI 2026 · очки</span></div>
      <div class="h4-pl">${L.map(row).join('')}</div><div class="h2-ft"><a class="h2-ln h2-ln--r" href="../gs-tournament/v46-hs.html${FIT ? '?fit=1' : ''}">Вся статистика ${ARR}</a></div></section>` }

  // ── v4 «Стримы» идущего матча. ‼️ пример: каналы и зрители придуманы (DB.fake.streams)
  const streams = () => { const F = window.DB && window.DB.fake.streams; if (!F || !F.length || CFG.state === 'skel') return ''
    const m = window.DB.matches({ state: 'live' })[0]
    const row = (x) => { const h = window.DB.hero(x.art)
      return `<div class="h4-s" data-st="${x.id}" role="link" tabindex="0"><span class="h4-s__img">${h ? `<img src="${esc(window.DB.url(h.img))}" alt="">` : ''}<i class="sc-dot"></i></span>
        <span class="h4-s__n"><b>${esc(x.name)}</b><small>${esc(x.src)}</small></span><span class="h4-s__v">${EYE}<span class="mono">${k1(x.v)}</span></span></div>` }
    return `<section class="h2-card"><div class="h2-h"><h2>Стримы</h2><span class="hm-ex">пример</span></div>
      ${m ? `<span class="h4-sub">${name(m.a, 'mid')} — ${name(m.b, 'mid')}</span>` : ''}<div class="h4-sl">${F.map(row).join('')}</div></section>` }

  // ── v5–v7: матчи строками (узкая колонка), полоса матчей дня, новости тремя видами, футер
  const mrow = (m) => { const done = m.state === 'done', sc = m.score, show = sc && (done || isLive(m)) && !(CFG.spoil && done), w = done && sc && show ? (sc[0] > sc[1] ? 0 : 1) : -1
    const st = isLive(m) ? '<i class="sc-dot"></i>' : done ? '<span class="is-mut">Кон.</span>' : m.state === 'tba' ? '<span class="is-mut">—</span>' : m.state === 'cancel' ? '<span class="is-mut">Отм.</span>' : `<span class="mono">${hm(m.start)}</span>`
    const tm = (i) => `<span class="h5-mr__t${w === 1 - i ? ' is-lose' : ''}">${logo(m[i ? 'b' : 'a'], 16)}<span>${name(m[i ? 'b' : 'a'], 'mid')}</span><b class="mono">${show ? sc[i] : ''}</b></span>`
    return `<div class="h5-mr${isLive(m) ? ' is-live' : ''}" data-m="${m.id}" role="link" tabindex="0"><span class="h5-mr__s">${st}${gameIc(m.game, 12)}</span><span class="h5-mr__tm">${tm(0)}${tm(1)}</span></div>` }
  const mcol = () => { const A = all(), L = list(), lv = ofDay(A).filter(isLive).length, shown = CFG.more ? L : L.slice(0, 14), rest = L.length - shown.length
    return `<section class="h2-card h5-mc"><div class="h2-h"><h2>Матчи</h2>${lv && CFG.day === 'today' ? `<span class="h2-lv"><i class="sc-dot"></i><b class="mono">${lv}</b></span>` : ''}
      <div class="h2-seg"><button class="${CFG.day === 'today' ? 'is-on' : ''}" data-day="today">Сегодня</button><button class="${CFG.day === 'tom' ? 'is-on' : ''}" data-day="tom">Завтра</button></div></div>
      ${games(A)}<div class="h5-ml">${shown.length ? shown.map(mrow).join('') : '<div class="h2-empty"><b>Матчей нет</b></div>'}</div>
      <div class="h2-ft">${rest > 0 ? `<button class="h2-ln" data-more>Ещё <span class="mono">${rest}</span></button>` : ''}<a class="h2-ln h2-ln--r" href="v1-schedule.html${FIT ? '?fit=1' : ''}">Всё расписание ${ARR}</a></div></section>` }
  const ticker = () => { const A = all(), L = list(), lv = ofDay(A).filter(isLive).length
    return `<section class="h5-tk"><div class="h2-h"><h2>Матчи</h2>${lv && CFG.day === 'today' ? `<span class="h2-lv"><i class="sc-dot"></i><b class="mono">${lv}</b> ${pl(lv, 'идёт', 'идут', 'идут')}</span>` : ''}${games(A)}
      <div class="h2-seg"><button class="${CFG.day === 'today' ? 'is-on' : ''}" data-day="today">Сегодня</button><button class="${CFG.day === 'tom' ? 'is-on' : ''}" data-day="tom">Завтра</button></div>
      <a class="h2-ln" href="v1-schedule.html${FIT ? '?fit=1' : ''}">Всё расписание ${ARR}</a></div>
      <div class="h5-tk__r">${L.length ? L.map(tile).join('') : '<div class="h2-empty"><b>Матчей нет</b></div>'}</div></section>` }
  const NEWS = (k) => window.DB.news().filter((n) => n.img && Date.parse(n.t) <= S.NOW).slice(0, k)
  const nImg = (n, c = 'h2-n__img') => `<span class="${c}"><img src="${esc(window.DB.url(n.img))}" alt=""></span>`
  const nCard = (n) => `<a class="h5-nc" data-n="${n.id}" href="#">${nImg(n, 'h5-nc__img')}<b>${esc(n.title)}</b>${meta(n)}</a>`
  const nRow = (n, lede) => `<a class="h2-n" data-n="${n.id}" href="#">${nImg(n)}<span class="h2-n__b"><b>${esc(n.title)}</b>${lede && n.lede ? `<span class="h5-nl">${esc(n.lede)}</span>` : ''}${meta(n)}</span></a>`
  const newsX = (k, mode) => { if (!window.DB || CFG.state === 'skel') return ''; const N = NEWS(k); if (!N.length) return ''
    const head = `<div class="h2-h"><h2>Главное</h2><a class="h2-ln h2-ln--r" href="#" data-n="all">Все новости ${ARR}</a></div>`
    if (mode === 'grid') return `<section class="h2-card">${head}<div class="h5-ng">${N.map(nCard).join('')}</div></section>`
    if (mode === 'feed') { const [a, ...r] = N
      return `<section class="h2-card">${head}<a class="h5-nb" data-n="${a.id}" href="#">${nImg(a, 'h2-big__img')}<span class="h2-n__b"><b>${esc(a.title)}</b>${a.lede ? `<span class="h2-big__l">${esc(a.lede)}</span>` : ''}${meta(a)}</span></a>
        <div class="h5-nf">${r.map((n) => nRow(n, true)).join('')}</div></section>` }
    const top = N.slice(0, 3), r = N.slice(3)
    return `<section class="h2-card">${head}<div class="h5-n3">${top.map(nCard).join('')}</div><div class="h5-n2">${r.map((n) => nRow(n)).join('')}</div></section>` }
  const FT = { 'Разделы': ['Матчи', 'Турниры', 'Новости', 'Рейтинг команд', 'Трансферы', 'Фэнтези'], 'Игры': S.GAMES.map((g) => g.name),
    'Проект': ['О нас', 'Реклама', 'Контакты', 'Вакансии'], 'Помощь': ['Правила', 'Конфиденциальность', 'Источники данных', 'Обратная связь'] }
  const footer = () => `<footer class="h5-f"><div class="h5-f__top"><div class="h5-f__b"><span class="pt-brand"><span class="pt-logo">◆</span>GoatScout</span><small>Матчи, турниры, новости и статистика: Dota 2, CS2, LoL, Valorant, MLBB</small>
      <div class="h5-f__so">${['Telegram', 'VK', 'YouTube', 'Twitch', 'X'].map((x) => `<a href="#">${x}</a>`).join('')}</div></div>
      ${Object.entries(FT).map(([h, L]) => `<div class="h5-f__c"><b>${h}</b>${L.map((x) => `<a href="#">${esc(x)}</a>`).join('')}</div>`).join('')}</div>
    <div class="h5-f__bot"><span>© 2026 GoatScout</span><span class="h5-f__18">18+</span><span>Не связан с Valve, Riot Games и Moonton. Названия и логотипы — их владельцев</span><span class="h5-f__r">Данные: OpenDota, Liquipedia · Русский</span></div></footer>`
  // ── v8–v10: «Матчи» строками как в v1 (копия строки v1 — _home.js row/group/hero; третий повтор — выносить в общее)
  const IC1 = { star: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg>',
    chev: (d) => `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d < 0 ? 'M7.5 2.5 4 6l3.5 3.5' : 'M4.5 2.5 8 6l-3.5 3.5'}"/></svg>`,
    play: '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2v8l7-4z"/></svg>' }
  const inTxt = (n) => (n < 60 ? `через ${n}′` : `через ${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`)
  const stLbl = (m) => m.state === 'live' ? `<span class="hm-st"><i class="sc-dot"></i>${mapLbl(m)}${m.clock ? ` <span class="mono">${m.clock}</span>` : ''}</span>`
    : m.state === 'draft' ? `<span class="hm-st"><i class="sc-dot"></i>Драфт · ${mapLbl(m)}</span>` : m.state === 'pause' ? `<span class="hm-st hm-st--warn">Пауза · ${mapLbl(m)}</span>`
    : m.state === 'break' ? `<span class="hm-st hm-st--mut">Перерыв · ${mapLbl(m)} <span class="mono">${inTxt(m.inMin)}</span></span>` : ''
  const tCell = (m) => { if (isLive(m)) return stLbl(m)
    if (m.state === 'tba') return '<span class="mono">—:—</span><small>время уточнят</small>'
    if (m.state === 'delayed') return `<s>${hm(m.start)}</s><small>+${m.delay}′</small>`
    if (m.state === 'moved') return `<s>${hm(m.start)}</s><small>перенос</small>`
    if (m.state === 'cancel') return `<span>${hm(m.start)}</span><small>отменён</small>`
    if (m.state === 'done') return `<span class="mut">${hm(m.start)}</span>`
    const n = Math.round((Date.parse(m.start) - S.NOW) / 60000); return `<span>${hm(m.start)}</span>${n > 0 && n <= 180 ? `<small>${inTxt(n)}</small>` : ''}` }
  const hid = (m) => CFG.spoil && m.state === 'done' && !CFG.rev.has(m.id)
  const win = (m) => (m.score && m.state === 'done' ? (m.score[0] > m.score[1] ? 0 : 1) : -1)
  const cen = (m) => { const w = win(m), sc = m.score
    if (m.state === 'done') return hid(m) ? `<button class="hm-hide" data-reveal="${m.id}">Счёт</button>` : `<span class="hm-sc"><span class="${w === 1 ? 'is-lose' : ''}">${sc[0]}</span><i>:</i><span class="${w === 0 ? 'is-lose' : ''}">${sc[1]}</span></span>`
    if (isLive(m) && sc) return `<span class="hm-sc"><span>${sc[0]}</span><i>:</i><span>${sc[1]}</span></span>${m.rounds ? `<small>${m.rounds[0]} : ${m.rounds[1]}</small>` : ''}`
    if (m.state === 'draft') return '<span class="hm-sc"><span>0</span><i>:</i><span>0</span></span>'
    if (m.state === 'moved') return `<small>→ ${S.dm(ymd(m.to))} · ${hm(m.to)}</small>`
    if (m.state === 'delayed') return `<span class="hm-in">~${hm(new Date(Date.parse(m.start) + m.delay * 60000).toISOString())}</span><small>задержка</small>`
    if (m.state === 'cancel') return '<span class="hm-vs">отменён</span>'
    return '<span class="hm-vs">vs</span>' }
  const chn = (m) => { if (!m.chance || m.state === 'done' || m.state === 'cancel') return ''; const f = m.chance[0] >= m.chance[1] ? 0 : 1
    return `<span class="hm-ch-w" title="Шанс по прогнозу: ${name(m[f ? 'b' : 'a'], 'mid')} ${m.chance[f]}%"><span class="hm-ch"><i class="${f === 0 ? 'is-fav' : ''}" style="flex:${m.chance[0]}"></i><i class="${f === 1 ? 'is-fav' : ''}" style="flex:${m.chance[1]}"></i></span>${m.chance[f]}</span>` }
  const row1 = (m) => { const w = hid(m) ? -1 : win(m)
    const ph = (i) => m.state === 'done' ? (hid(m) ? '<small>•</small>' : `<span class="${w === 1 - i ? '' : w >= 0 ? 'is-lose' : ''}">${m.score[i]}</span>`) : isLive(m) && m.score ? `<span>${m.score[i]}</span>` : ''
    return `<div class="hm-r${isLive(m) ? ' is-live' : ''}${m.state === 'done' ? ' is-done' : ''}${m.state === 'cancel' ? ' is-cancel' : ''}" data-m="${m.id}" role="link" tabindex="0">
      <span class="hm-r__t">${tCell(m)}</span><span class="hm-r__a${w === 0 ? ' is-win' : ''}"><span>${name(m.a, 'mid')}</span>${logo(m.a, 22)}</span>
      <span class="hm-r__c">${cen(m)}</span><span class="hm-r__b${w === 1 ? ' is-win' : ''}">${logo(m.b, 22)}<span>${name(m.b, 'mid')}</span></span>
      <span class="hm-r__tm"><span class="${w === 0 ? 'is-win' : ''}">${logo(m.a, 20)}<em>${name(m.a, 'mid')}</em></span><span class="${w === 1 ? 'is-win' : ''}">${logo(m.b, 20)}<em>${name(m.b, 'mid')}</em></span></span>
      <span class="hm-r__sc">${m.state === 'moved' ? `<small>→ ${S.dm(ymd(m.to))}</small>` : m.state === 'cancel' ? '<small>отменён</small>' : ph(0) + ph(1)}</span>
      <span class="hm-r__m">${chn(m)}<span class="hm-bo">Bo${m.bo}</span></span>
      <button class="hm-star${CFG.star.has(m.id) ? ' is-on' : ''}" data-star="${m.id}" aria-label="Следить за матчем" title="Следить — напомним о старте">${IC1.star}</button></div>` }
  const grpT = (tid, ms, rf = row1) => { const t = S.T[tid]
    return `<section class="hm-tg"><div class="hm-tg__h">${gameIc(t.game, 16)}${S.tourLogo(t, 18)}<b>${esc(t.name)}</b>${tierM(t.tier)}<small>${esc(ms[0].stage || t.stage || '')}</small>
      <button class="hm-tg__go" data-tour="${t.id}" aria-label="Открыть турнир" title="Турнир">${IC1.chev(1)}</button></div>${ms.map(rf).join('')}</section>` }
  const grpG = (g, ms) => { const lv = ms.filter(isLive).length
    return `<section class="hm-tg"><div class="hm-tg__h">${gameIc(g.id, 16)}<b>${esc(g.name)}</b><small><span class="mono">${ms.length}</span> ${pl(ms.length, 'матч', 'матча', 'матчей')}</small>${lv ? `<span class="h2-lv"><i class="sc-dot"></i><b class="mono">${lv}</b> ${pl(lv, 'идёт', 'идут', 'идут')}</span>` : ''}</div>${ms.map(row1).join('')}</section>` }
  const heroV1 = (L) => { if (!L.length) return ''
    CFG.hero = Math.min(CFG.hero, L.length - 1); const m = L[CFG.hero], t = S.T[m.tour], ch = m.chance || [50, 50], f = ch[0] >= ch[1] ? 0 : 1
    const tm = (i) => `<div class="hm-tm${f === i ? ' is-fav' : ''}">${logo(m[i ? 'b' : 'a'], 36)}<span class="hm-tm__n"><b>${name(m[i ? 'b' : 'a'])}</b><span class="hm-tm__bar"><i style="width:${ch[i]}%"></i></span></span>
      <span class="hm-tm__s"><b>${m.score ? m.score[i] : 0}</b>${m.rounds ? `<small>${m.rounds[i]}</small>` : ''}</span><span class="hm-tm__p">${ch[i]}%</span></div>`
    const lv = L.map((x, i) => `<button class="hm-lv__r${i === CFG.hero ? ' is-on' : ''}" data-hero="${i}">${gameIc(x.game, 16)}<span class="hm-lv__t"><span>${logo(x.a, 16)}<em>${name(x.a, 'mid')}</em></span><span>${logo(x.b, 16)}<em>${name(x.b, 'mid')}</em></span></span>
      <span class="hm-lv__s"><span>${x.score ? x.score[0] : 0}</span><span>${x.score ? x.score[1] : 0}</span></span></button>`).join('')
    return `<section class="hm-live"><div class="hm-hero">
        <div class="hm-hero__top">${gameIc(m.game, 16)}<span class="hm-tn">${esc(t.name)}</span><span>·</span><span>${esc(m.stage || '')}</span><span>·</span><span>Bo${m.bo}</span>
          ${L.length > 1 ? `<span class="hm-nav"><button data-hnav="-1" aria-label="Предыдущий">${IC1.chev(-1)}</button><span>${CFG.hero + 1} / ${L.length}</span><button data-hnav="1" aria-label="Следующий">${IC1.chev(1)}</button></span>` : ''}</div>
        <div>${stLbl(m)}</div><div class="hm-tms">${tm(0)}${tm(1)}</div>
        <div class="hm-hero__ft"><span>Шанс — по прогнозам зрителей${m.real ? '' : '<span class="hm-ex">пример</span>'}</span><button class="hm-go" data-m="${m.id}">${IC1.play}Смотреть матч</button></div>
      </div>${CFG.view === 'desk' ? `<div class="hm-lv"><div class="hm-lv__h">Идут сейчас · ${L.length}</div>${lv}</div>` : ''}</section>` }
  const mBlock = (by) => { const A = all(), L = list(), live = L.filter(isLive).sort((a, b) => S.T[a.tour].tier - S.T[b.tour].tier), lv = ofDay(A).filter(isLive).length
    const head = `<div class="h2-h"><h2>Матчи</h2>${lv && CFG.day === 'today' ? `<span class="h2-lv"><i class="sc-dot"></i><b class="mono">${lv}</b> ${pl(lv, 'идёт', 'идут', 'идут')}</span>` : ''}
      <div class="h2-seg"><button class="${CFG.day === 'today' ? 'is-on' : ''}" data-day="today">Сегодня</button><button class="${CFG.day === 'tom' ? 'is-on' : ''}" data-day="tom">Завтра</button></div>
      <button class="hm-ib${CFG.spoil ? ' is-on' : ''}" data-spoil title="Скрывать счёт сыгранных матчей">${CFG.spoil ? 'Счёт скрыт' : 'Счёт виден'}</button></div>`
    if (CFG.state === 'skel') return `<section class="h2-card">${head}${Array.from({ length: 6 }, () => '<span class="sk" style="height:44px"></span>').join('')}</section>`
    let body
    if (!L.length) body = `<div class="h2-empty"><b>${A.length ? 'Матчей нет' : 'Матчей пока нет'}</b>${A.length ? 'Посмотрите другой день' : 'Расписание обновится, как только турниры объявят пары'}</div>`
    else if (by === 'games') body = S.GAMES.map((g) => [g, L.filter((m) => m.game === g.id)]).filter(([, ms]) => ms.length).map(([g, ms]) => grpG(g, ms)).join('')
    else { const T = new Map(); L.forEach((m) => { if (!T.has(m.tour)) T.set(m.tour, []); T.get(m.tour).push(m) })
      body = [...T.entries()].sort((a, b) => (Math.min(...a[1].map((m) => ORD[m.state])) - Math.min(...b[1].map((m) => ORD[m.state]))) || (S.T[a[0]].tier - S.T[b[0]].tier)).map(([t, ms]) => grpT(t, ms)).join('') }
    return `<section class="h2-card h8-m">${head}${games(A)}${by === 'v1' && CFG.day === 'today' ? heroV1(live) : ''}<div class="h8-gs">${body}</div>
      <div class="h2-ft"><a class="h2-ln h2-ln--r" href="v1-schedule.html${FIT ? '?fit=1' : ''}">Всё расписание ${ARR}</a></div></section>` }

  // ── v11: раскрываемая строка матча — мини-виджеты по состоянию. ‼️ у примеров (не Dota) карты и форма придуманы — подпись «пример»
  const hsh = (x) => [...String(x)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const dbM = (m) => (m.real && window.DB ? window.DB.matches({ tour: m.tour }).find((x) => x.id === m.id) : null)
  const EXS = '<span class="hm-ex">пример</span>'
  const cMaps = (m) => { const d = dbM(m), sc = m.score || [0, 0], cur = isLive(m) && m.state !== 'draft'
    let ch, ex = false
    if (d && d.maps) ch = d.maps.map((x, i) => `<span><small>Карта ${i + 1}</small>${logo(x.win, 14)}<b class="mono">${mmss(x.dur)}</b></span>`)
    else { ex = true; const n = sc[0] + sc[1], h = hsh(m.id), W = []; let a = sc[0], b = sc[1]
      for (let i = 0; i < n; i++) { const pa = a && (!b || (h >> i) & 1); W.push(pa ? m.a : m.b); pa ? a-- : b-- }
      ch = W.map((w, i) => `<span><small>${m.game === 'lol' || m.game === 'mlbb' ? 'Game' : 'Карта'} ${i + 1}</small>${logo(w, 14)}<b class="mono">${m.game === 'cs2' || m.game === 'val' ? '13:' + (5 + ((h >> i) % 7)) : (28 + ((h >> i) % 15)) + ':' + String(h % 60).padStart(2, '0')}</b></span>`) }
    if (cur) ch.push(`<span class="is-now"><small>${mapLbl(m)}</small><i class="sc-dot"></i><b class="mono">${m.rounds ? m.rounds.join(':') : m.clock || 'идёт'}</b></span>`)
    else if (m.state === 'draft') ch.push(`<span class="is-now"><small>${mapLbl(m)}</small><i class="sc-dot"></i><b>драфт</b></span>`)
    return [`Карты серии${ex ? EXS : ''}`, `<div class="h11-mp">${ch.join('') || '<span class="h11-mut">Карт ещё не было</span>'}</div>`] }
  const cChance = (m) => { const c = m.chance; if (!c) return null; const f = c[0] >= c[1] ? 0 : 1
    return [`Шанс победы${m.real ? '' : EXS}`, `<p class="h11-sp"><span>${name(m.a, 'mid')} <b class="mono">${c[0]}%</b></span><span><b class="mono">${c[1]}%</b> ${name(m.b, 'mid')}</span></p><div class="h11-bar"><i class="${f ? '' : 'is-fav'}" style="flex:${c[0]}"></i><i class="${f ? 'is-fav' : ''}" style="flex:${c[1]}"></i></div>`] }
  const cForm = (m) => { const one = (id) => { const ts = m.real && window.DB ? window.DB.teamStats(m.tour, id) : null, f = ts && ts.form ? ts.form.slice(0, 5) : [...Array(5)].map((_, i) => ((hsh(id) >> i) & 1 ? 'W' : 'L'))
      return `<p>${logo(id, 16)}<span class="h11-nm">${name(id, 'mid')}</span><span class="h11-fm">${f.map((x) => `<i class="${x === 'W' || x === 1 || x === true ? 'w' : 'l'}"></i>`).join('')}</span></p>` }
    return [`Форма · 5 серий${m.real ? '' : EXS}`, `<div class="h11-fs">${one(m.a)}${one(m.b)}</div>`] }
  const cNews = (m) => { const N = window.DB ? window.DB.news({ team: m.a }).concat(window.DB.news({ team: m.b })).filter((n) => Date.parse(n.t) <= S.NOW) : []
    const n = N.sort((a, b) => b.t.localeCompare(a.t))[0]
    return ['Новость', n ? `<a class="h11-nw${n.img ? '' : ' no-img'}" data-n="${n.id}" href="#">${n.img ? `<img src="${esc(window.DB.url(n.img))}" alt="">` : ''}<span>${esc(n.title)}</span></a>` : '<span class="h11-mut">Новостей о матче пока нет</span>'] }
  // ── v12–v14: статистика команд для раскрытия. Dota — DB.teamStats / playerStats / heroStats; остальное — пример по хешу id
  const real = (m) => !!(m.real && window.DB && window.DB.teamStats(m.tour, m.a))
  const tst = (m, id) => { if (real(m)) return window.DB.teamStats(m.tour, id); const h = hsh(id), opp = [...new Set(S.M.filter((x) => x.game === m.game).flatMap((x) => [x.a, x.b]))].filter((x) => x !== id)
    const form = [...Array(5)].map((_, i) => { const w = !!((h >> i) & 1); return { vs: opp[(h >> (i + 2)) % opp.length], win: w, score: w ? [2, (h >> i) % 2] : [(h >> i) % 2, 2] } })
    const sw = form.filter((f) => f.win).length; return { series: [sw + (h % 3), 5 - sw + ((h >> 4) % 2)], maps: [sw * 2 + (h % 4), (5 - sw) * 2 + ((h >> 5) % 3)], form } }
  const durOf = (m, id) => { if (!real(m)) return (28 + (hsh(id) % 12)) * 60 + (hsh(id) % 60)
    const D = window.DB.matches({ tour: m.tour, team: id, state: 'done' }).flatMap((x) => x.maps || []).map((x) => x.dur).filter(Boolean); return D.length ? Math.round(D.reduce((a, b) => a + b, 0) / D.length) : 0 }
  const plOf = (m, id) => (real(m) ? window.DB.playerStats(m.tour, { team: id }) : [])
  const heroImg = (h, sz = 20) => { const x = window.DB && window.DB.hero(h); return x ? `<img class="h12-hi" style="width:${Math.round(sz * 16 / 9)}px;height:${sz}px" src="${esc(window.DB.url(x.img))}" alt="" title="${esc(x.name)}">` : '' }
  const exT = (m, t) => t + (real(m) ? '' : EXS)
  const cCmp = (m) => { const A = tst(m, m.a), B = tst(m, m.b), pc = (x) => Math.round(x[0] / Math.max(1, x[0] + x[1]) * 100)
    const pts = (id) => plOf(m, id).reduce((a, p) => a + (p.pts || 0), 0)
    const R = [['Серии', `${A.series[0]}–${A.series[1]}`, `${B.series[0]}–${B.series[1]}`, pc(A.series), pc(B.series)],
      ['Карты', `${A.maps[0]}–${A.maps[1]}`, `${B.maps[0]}–${B.maps[1]}`, pc(A.maps), pc(B.maps)],
      ['Длина карты', mmss(durOf(m, m.a)), mmss(durOf(m, m.b)), durOf(m, m.a), durOf(m, m.b), 1]]
    if (real(m)) R.push(['Очки игроков', pts(m.a), pts(m.b), pts(m.a), pts(m.b)])
    const row = ([l, va, vb, na, nb, low]) => { const mx = Math.max(na, nb) || 1, wa = low ? na < nb : na > nb, wb = low ? nb < na : nb > na
      return `<div class="h12-cr"><b class="mono${wa ? ' is-lead' : ''}">${va}</b><span class="h12-cb is-l"><i class="${wa ? 'is-lead' : ''}" style="width:${Math.round(na / mx * 100)}%"></i></span><small>${l}</small><span class="h12-cb"><i class="${wb ? 'is-lead' : ''}" style="width:${Math.round(nb / mx * 100)}%"></i></span><b class="mono${wb ? ' is-lead' : ''}">${vb}</b></div>` }
    return [exT(m, `Команды на ${esc(S.T[m.tour].short || S.T[m.tour].name)}`), `<div class="h12-ch"><span>${logo(m.a, 16)}${name(m.a, 'mid')}</span><span>${name(m.b, 'mid')}${logo(m.b, 16)}</span></div><div class="h12-cmp">${R.map(row).join('')}</div>`, 2] }
  const cForm5 = (m) => { const one = (id) => `<div class="h12-f"><span class="h12-f__t">${logo(id, 16)}</span>${tst(m, id).form.slice(0, 5).map((f) => `<span class="h12-f__s${f.win ? ' is-w' : ''}" title="${f.win ? 'Победа' : 'Поражение'} · ${name(f.vs, 'mid')} ${f.score.join(':')}">${logo(f.vs, 14)}<b class="mono">${f.score.join(':')}</b></span>`).join('')}</div>`
    return [exT(m, 'Форма · 5 серий'), `<div class="h12-fs">${one(m.a)}${one(m.b)}</div>`, 1] }
  const cH2H = (m) => { let L = []
    if (real(m)) L = window.DB.matches({ team: m.a, state: 'done' }).filter((x) => x.a === m.b || x.b === m.b).sort((a, b) => b.start.localeCompare(a.start))
    const wa = L.filter((x) => (x.score[0] > x.score[1] ? x.a : x.b) === m.a).length
    const body = real(m) ? (L.length ? `<p class="h12-big"><b class="mono">${wa} : ${L.length - wa}</b><span>${L.length} ${pl(L.length, 'серия', 'серии', 'серий')} в базе</span></p>${L.slice(0, 3).map((x) => `<p class="h12-hh"><span class="mono">${S.dm(ymd(x.start))}</span>${logo(x.a, 14)}<b class="mono">${x.score.join(':')}</b>${logo(x.b, 14)}<small>${esc(x.stage || '')}</small></p>`).join('')}` : '<span class="h11-mut">Раньше не встречались</span>')
      : (() => { const h = hsh(m.a + m.b), a = 1 + h % 4, b = (h >> 3) % 4; return `<p class="h12-big"><b class="mono">${a} : ${b}</b><span>за год</span></p>` })()
    return [exT(m, 'Личные встречи'), body, 1] }
  const cPl = (m) => { const one = (id) => { const P = plOf(m, id).slice().sort((a, b) => (a.role || 9) - (b.role || 9)), best = Math.max(...P.map((p) => p.kda))
      return `<div class="h12-pt"><p class="h12-pt__h">${logo(id, 16)}<b>${name(id, 'mid')}</b><small>K/D/A</small><small>GPM</small><small>Очки</small></p>${P.map((p) => { const q = window.DB.player(p.player) || { nick: p.player }
        return `<p class="h12-p${p.kda === best ? ' is-best' : ''}">${q.photo ? `<img class="h12-ph" src="${esc(window.DB.url(q.photo))}" alt="">` : '<span class="h12-ph"></span>'}<span class="h12-pn"><b>${esc(q.nick)}</b>${p.heroes && p.heroes[0] ? heroImg(p.heroes[0].hero, 14) : ''}</span>
          <span class="mono">${p.k}/${p.d}/${p.a}</span><span class="mono">${p.gpm}</span><b class="mono">${p.pts}</b></p>` }).join('')}</div>` }
    return [`Игроки на ${esc(S.T[m.tour].short || S.T[m.tour].name)} · лучший K/D/A — белым`, `<div class="h12-pls">${one(m.a)}${one(m.b)}</div>`, 3] }
  const cPicks = (m, k, t) => { const one = (id) => `<div class="h12-dr"><span class="h12-f__t">${logo(id, 16)}</span>${(tst(m, id)[k] || []).slice(0, 4).map(([h, n]) => `<span class="h12-dh">${heroImg(h, 22)}<small class="mono">${n}</small></span>`).join('')}</div>`
    return [t, `<div class="h12-drs">${one(m.a)}${one(m.b)}</div>`, 1] }
  const cMeta = (m) => { const H = window.DB.heroStats(m.tour); if (!H) return null; const L = H.list.slice().sort((a, b) => b.pickBan - a.pickBan).slice(0, 4)
    return [`Мета турнира · ${H.games} карт`, `<div class="h12-mt">${L.map((x) => `<p>${heroImg(x.hero, 18)}<span>${esc((window.DB.hero(x.hero) || {}).name || x.hero)}</span><span class="mono">${x.pickBan}%</span><b class="mono${x.picks && x.pickWins / x.picks >= 0.5 ? ' is-up' : ' is-dn'}">${x.picks ? Math.round(x.pickWins / x.picks * 100) : 0}%</b></p>`).join('')}</div><small class="h12-note">пик/бан · винрейт</small>`, 1] }
  const exStat = (m, soon) => { const k = real(m) ? O.ex : 'cmp', mp = soon ? [] : [[...cMaps(m), 1]]
    if (k === 'pl') return [...mp, cPl(m), ...(soon ? [cH2H(m)] : [])]
    if (k === 'draft') return [...mp, cPicks(m, 'picks', 'Чаще пикают'), cPicks(m, 'bans', 'Чаще банят против них'), cMeta(m), ...(soon ? [cH2H(m)] : [])]
    return [...mp, cCmp(m), soon ? cForm5(m) : null, cH2H(m)] }
  const exOf = (m) => { if (O.ex) { const soon = ['soon', 'delayed', 'tba', 'moved', 'cancel'].includes(m.state), cells = exStat(m, soon).filter(Boolean)
      const act = isLive(m) ? [['Смотреть', 'go', 1], ['Страница матча', 'go', 0]] : soon ? [[CFG.star.has(m.id) ? 'Напомним' : 'Напомнить', 'star', 1], ['Страница матча', 'go', 0]] : [['Страница матча', 'go', 1], ['Запись', 'rec', 0]]
      return `<div class="h11-ex"><div class="h11-ex__in"><div class="h12-cs">${cells.map(([t, h, sp]) => `<div class="h11-c h12-s${sp || 1}"><small>${t}</small>${h}</div>`).join('')}</div>
        <div class="h11-act">${act.map(([t, k, main]) => `<button class="h11-b${main ? ' is-main' : ''}" data-xa="${k}" data-id="${m.id}">${t}</button>`).join('')}</div></div></div>` } const done = m.state === 'done', soon = ['soon', 'delayed', 'tba', 'moved'].includes(m.state)
    const cells = (done ? [cMaps(m), cNews(m)] : soon ? [cForm(m), cChance(m), cNews(m)] : m.state === 'cancel' ? [cForm(m), cNews(m)] : [cMaps(m), cChance(m), cNews(m)]).filter(Boolean)
    const act = isLive(m) ? [['Смотреть', 'go', 1], ['Страница матча', 'go', 0]] : soon ? [[CFG.star.has(m.id) ? 'Напомним' : 'Напомнить', 'star', 1], ['Страница матча', 'go', 0]] : [['Страница матча', 'go', 1], ['Запись', 'rec', 0]]
    return `<div class="h11-ex"><div class="h11-ex__in"><div class="h11-cs">${cells.map(([t, h]) => `<div class="h11-c"><small>${t}</small>${h}</div>`).join('')}</div>
      <div class="h11-act">${act.map(([t, k, main]) => `<button class="h11-b${main ? ' is-main' : ''}" data-xa="${k}" data-id="${m.id}">${t}</button>`).join('')}</div></div></div>` }
  const CHV = '<svg class="h11-chv" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 4 4 4-4"/></svg>'
  const row11 = (m) => `<div class="h11-r${CFG.open === m.id ? ' is-open' : ''}" data-xr="${m.id}">${row1(m).replace(' data-m="', ' aria-expanded="' + (CFG.open === m.id) + '" data-x="').replace(/(<span class="hm-bo">Bo\d<\/span>)/, '$1' + CHV)}${exOf(m)}</div>`
  const ms11 = () => { const A = all(), L = list(), lv = ofDay(A).filter(isLive).length
    if (CFG.open === undefined) { const f = L.find(isLive); CFG.open = f ? f.id : null }
    const T = new Map(); L.forEach((m) => { if (!T.has(m.tour)) T.set(m.tour, []); T.get(m.tour).push(m) })
    const body = !L.length ? `<div class="h2-empty"><b>${A.length ? 'Матчей нет' : 'Матчей пока нет'}</b>${A.length ? 'Посмотрите другой день' : 'Расписание обновится, как только турниры объявят пары'}</div>`
      : [...T.entries()].sort((a, b) => (Math.min(...a[1].map((m) => ORD[m.state])) - Math.min(...b[1].map((m) => ORD[m.state]))) || (S.T[a[0]].tier - S.T[b[0]].tier)).map(([t, ms]) => grpT(t, ms, row11)).join('')
    return `<section class="h11-ms"><div class="h11-h"><h2>Матчи</h2>${lv && CFG.day === 'today' ? `<span class="h2-lv"><i class="sc-dot"></i><b class="mono">${lv}</b> ${pl(lv, 'идёт', 'идут', 'идут')}</span>` : ''}
      <div class="h2-seg"><button class="${CFG.day === 'today' ? 'is-on' : ''}" data-day="today">Сегодня</button><button class="${CFG.day === 'tom' ? 'is-on' : ''}" data-day="tom">Завтра</button></div>
      <button class="hm-ib${CFG.spoil ? ' is-on' : ''}" data-spoil title="Скрывать счёт сыгранных матчей">${CFG.spoil ? 'Счёт скрыт' : 'Счёт виден'}</button>
      <a class="h2-ln" href="v1-schedule.html${FIT ? '?fit=1' : ''}">Всё расписание ${ARR}</a></div>${games(A)}<div class="h8-gs">${body}</div></section>` }
  // ── v11: крупный блок новостей сверху (главная + 3 рядом) и лента как на странице новостей v62
  const lead11 = () => { if (!window.DB || CFG.state === 'skel') return ''; const N = NEWS(4); if (!N.length) return ''; const [a, ...r] = N
    return `<section class="h11-lead"><a class="h11-big" data-n="${a.id}" href="#"><img src="${esc(window.DB.url(a.img))}" alt=""><span class="h11-big__b">${meta(a)}<b>${esc(a.title)}</b>${a.lede ? `<span>${esc(a.lede)}</span>` : ''}</span></a>
      <div class="h11-lr">${r.map((n) => `<a class="h11-sm" data-n="${n.id}" href="#"><img src="${esc(window.DB.url(n.img))}" alt=""><span><b>${esc(n.title)}</b>${meta(n)}</span></a>`).join('')}</div></section>` }
  const chips = (n) => { const W = []; (n.teams || []).forEach((id) => { const x = window.DB.team(id); if (!x) return; [x.name, x.mid, x.tag].filter((v, i, a) => v && v.length > 2 && a.indexOf(v) === i).forEach((w) => W.push([w, `<span class="mn-ch"><img src="${window.DB.logo(id)}" alt="">$&</span>`])) })
    ;(n.players || []).forEach((id) => { const q = window.DB.player(id); if (q && q.nick && q.nick.length > 2) W.push([q.nick, `<span class="mn-ch mn-ch--p">${q.photo ? `<img src="${esc(window.DB.url(q.photo))}" alt="">` : ''}$&</span>`]) })
    const t = esc(n.title); if (!W.length) return t; W.sort((x, y) => y[0].length - x[0].length)
    const re = new RegExp(`(?<![\\wА-Яа-яЁё])(${W.map((w) => esc(w[0]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\wА-Яа-яЁё])`, 'g')
    return t.replace(re, (x) => { const w = W.find((q) => esc(q[0]) === x); return w ? w[1].replace('$&', x) : x }) }
  const WDN = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const dayH = (d) => { const k = S.dayDiff(d); return (k === 0 ? 'Сегодня' : k === -1 ? 'Вчера' : WDN[new Date(d + 'T12:00:00Z').getUTCDay()]) + ` · ${+d.slice(8, 10)} ${S.MON[+d.slice(5, 7) - 1]}` }
  // обложка новости в ленте: фото · нет фото — лого команд · нет команд — лого турнира · нет и его — без обложки (дирижёр 10.11: пустые плашки — баг)
  const cov11 = (n) => { if (n.img) return `<img class="mn-bi" src="${esc(window.DB.url(n.img))}" alt="" loading="lazy">`
    const T = (n.teams || []).filter((id) => window.DB.logo(id)).slice(0, 2)
    if (T.length) return `<span class="mn-bi mn-bv${T.length > 1 ? ' is-two' : ''}">${T.map((id) => `<img src="${window.DB.logo(id)}" alt="">`).join('<i>×</i>')}</span>`
    const t = (n.tours || []).map((id) => S.T[id]).find((x) => x && x.logo)
    return t ? `<span class="mn-bi mn-bv">${S.tourLogo(t, 48)}</span>` : '' }
  const feed11 = () => { if (!window.DB || CFG.state === 'skel') return ''; const used = new Set(NEWS(4).map((n) => n.id)), all = window.DB.news().filter((n) => Date.parse(n.t) <= S.NOW && !used.has(n.id)), L = all.slice(0, 16)
    const ds = [...new Set(L.map((n) => n.t.slice(0, 10)))]
    return `<section class="h11-nf"><div class="h11-h"><h2>Новости</h2><a class="h2-ln" href="../news-page/v62-match.html${FIT ? '?fit=1' : ''}">Все новости ${ARR}</a></div>
      <div class="mn mn--big mn--row mn--row2 mn--row3">${ds.map((d) => `<div class="h11-dh"><b>${dayH(d)}</b><small class="mono">${all.filter((n) => n.t.startsWith(d)).length}</small></div>
        <div class="mn-bg">${L.filter((n) => n.t.startsWith(d)).map((n) => `<a class="mn-bc" data-n="${n.id}" href="#">${cov11(n)}
          <span class="mn-bb"><span class="mn-wm"><time>${n.t.slice(11, 16)}</time>${(n.tours || []).includes('ti-2026') ? tierM(1) : ''}</span><span class="mn-bt">${chips(n)}</span></span></a>`).join('')}</div>`).join('')}</div>
      <a class="h11-all" href="../news-page/v62-match.html${FIT ? '?fit=1' : ''}">Читать все новости <span class="mono">${all.length + used.size}</span> ${ARR}</a></section>` }
  // ── v11: «Главные турниры — скоро» карточками, как на странице «Все турниры» v2
  const tLogos = (t, max) => { const d = t.real && window.DB && window.DB.data.tours[t.id], ids = d && d.teams && d.teams.length ? d.teams : [...new Set(S.M.filter((m) => m.tour === t.id).flatMap((m) => [m.a, m.b]))]
    if (!ids.length) return `<span class="t2-k mono">${t.teams ? `${t.teams} ${pl(t.teams, 'команда', 'команды', 'команд')}` : 'участники позже'}</span>`
    return `<span class="t2-lg">${ids.slice(0, max).map((id) => logo(id, 20)).join('')}${ids.length > max ? `<small class="mono">+${ids.length - max}</small>` : ''}</span>` }
  const soonCards = () => { if (CFG.state === 'skel') return ''; const L = Object.values(S.T).filter((t) => t.state === 'soon').sort((a, b) => a.tier - b.tier || a.from.localeCompare(b.from)).slice(0, 4); if (!L.length) return ''
    return `<section class="h2-card"><div class="h2-h"><h2>Главные турниры · скоро</h2><a class="h2-ln h2-ln--r" href="../gs-tours/v4-gantt.html${FIT ? '?fit=1' : ''}">Календарь ${ARR}</a></div><div class="t2-cs">${L.map((t) => { const k = S.dayDiff(t.from)
      return `<div class="t2-c" data-tour="${t.id}" role="link" tabindex="0"><span class="t2-c__b">${S.tourLogo(t, 56)}<span class="t2-c__g">${gameIc(t.game, 16)}</span><span class="t2-c__s">${k <= 1 ? 'завтра' : `через <span class="mono">${k}</span> ${pl(k, 'день', 'дня', 'дней')}`}</span></span>
        <span class="t2-c__n"><b>${esc(t.name)}</b><small><span class="mono">${S.dm(t.from)} – ${S.dm(t.to)}</span>${t.where ? ' · ' + esc(t.where) : ''}</small></span>
        <span class="t2-c__f"><span class="mono t2-c__p">${esc(t.prize)}</span>${tierM(t.tier)}${tLogos(t, 6)}</span></div>` }).join('')}</div></section>` }

  const lay = () => {
    if (O.lay === 'v11') return `<div class="h2-lay"><div class="h2-main">${lead11()}${ms11()}${tours()}${soonCards()}${feed11()}</div><aside class="h2-side">${rating()}${topPl()}${streams()}<div id="h2-tr"></div></aside></div>`
    if (O.lay === 'v1') return `<div class="h2-lay"><div class="h2-main">${mBlock('v1')}${newsX(8, 'list')}${tours()}</div><aside class="h2-side">${rating()}${topPl()}${streams()}<div id="h2-tr"></div></aside></div>`
    if (O.lay === 'live') return `<div class="h2-lay"><div class="h2-main">${liveBig()}${mBlock('tours')}${newsX(8, 'grid')}${tours()}</div><aside class="h2-side">${rating()}${topPl()}${streams()}<div id="h2-tr"></div></aside></div>`
    if (O.lay === 'games') return `<div class="h2-lay"><div class="h2-main">${mBlock('games')}${newsX(10, 'feed')}${tours()}</div><aside class="h2-side">${streams()}${rating()}${topPl()}<div id="h2-tr"></div></aside></div>`
    if (O.lay === 'cols') return `<div class="h5-l3"><aside class="h5-a">${mcol()}</aside><div class="h2-main">${liveBig()}${newsX(11, 'list')}${tours()}</div><aside class="h2-side">${rating()}${topPl()}${streams()}<div id="h2-tr"></div></aside></div>`
    if (O.lay === 'bento') return `<div class="h6"><div class="h6-r1">${liveBig()}${streams()}</div>${newsX(8, 'grid')}<div class="h6-r3"><div class="h2-main">${mcol()}</div><div class="h2-main">${tours()}${rating()}</div><div class="h2-main">${topPl()}<div id="h2-tr"></div></div></div></div>`
    return `<div class="h7">${ticker()}<div class="h5-l3 h7-l"><aside class="h5-a">${tours()}${rating()}</aside><div class="h2-main">${liveBig()}${newsX(12, 'feed')}</div><aside class="h2-side">${topPl()}${streams()}<div id="h2-tr"></div></aside></div></div>` }

  const side = () => O.v4 ? `<aside class="h2-side">${rating()}${topPl()}${streams()}<div id="h2-tr"></div></aside>` : O.v3 ? `<aside class="h2-side">${rating()}<div id="h2-tr"></div></aside>` : '<aside class="h2-side"><div id="h2-t4"></div><div id="h2-nw"></div><div id="h2-tr"></div></aside>'
  const mountSide = () => {
    const t4 = document.getElementById('h2-t4'), nw = document.getElementById('h2-nw'), tr = document.getElementById('h2-tr')
    if (t4 && window.T4) window.T4.render(t4, { opt: { v3: true, tier: 'fill', tierEn: true, final: 'merge', dt: 'mono' } })
    if (nw && window.NW2) window.NW2.render(nw, { pic: 'none', phone: CFG.view !== 'desk', fresh: true, btn: 'more', icon: 'doc', open: 'inline', reveal: 'type', pts: 2, even: true, rich: true, para2: true, hl: 'chip', ava: true, sq: true, sm: true, pad: true, calm: true, pl: 'logos' })
    if (tr && window.TR2) window.TR2.render(tr, { opt: { style: 'hltv', v5: true, gameAva: true, skinV1: true, topAll: true, rows: 'tint' } }) }

  function render() {
    document.body.classList.toggle('is-desk', CFG.view === 'desk')
    document.body.classList.toggle('bw', !!O.v3); document.body.classList.toggle('h5d', !!O.lay)
    document.getElementById('main').innerHTML = O.lay ? lay() + footer() : `<div class="h2-lay"><div class="h2-main">${O.v4 ? liveBig() : ''}${matches()}${news()}${O.v3 ? tours() : ''}</div>${side()}</div>
      ${CFG.state === 'offline' ? `<div class="hm-off"><span><b>Нет сети</b> · данные на ${hm(new Date(S.NOW).toISOString())}</span><button data-retry>Обновить</button></div>` : ''}`
    mountSide() }
  const toast = (t) => { let el = document.querySelector('.hm-toast'); if (!el) { el = document.createElement('div'); el.className = 'hm-toast'; document.body.append(el) } el.textContent = t; clearTimeout(el._t); el.style.display = ''; el._t = setTimeout(() => (el.style.display = 'none'), 2600) }

  function mount(o = {}) {
    O = o
    document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s)
      const g = q('[data-game]'); if (g) { CFG.game = g.dataset.game; CFG.more = false; render(); return }
      const d = q('[data-day]'); if (d) { CFG.day = d.dataset.day; CFG.more = false; render(); return }
      const tt = q('[data-tt]'); if (tt) { CFG.tt = tt.dataset.tt; render(); return }
      const rg = q('[data-rg]'); if (rg) { CFG.rg = rg.dataset.rg; render(); return }
      const tr = q('[data-tour]'); if (tr && tr.closest('#main')) { const t = S.T[tr.dataset.tour]; if (t.id === 'ti-2026') location.href = '../gs-tournament/v46-hs.html' + (FIT ? '?fit=1' : ''); else toast(`${t.name} — страница турнира (в лабе открыта только TI 2026)`); return }
      const hr = q('[data-hero]'); if (hr) { CFG.hero = +hr.dataset.hero; render(); return }
      const hn = q('[data-hnav]'); if (hn) { const n = S.M.filter((m) => isLive(m) && list().includes(m)).length || 1; CFG.hero = (CFG.hero + +hn.dataset.hnav + n) % n; render(); return }
      const st = q('[data-star]'); if (st) { const id = st.dataset.star; CFG.star.has(id) ? CFG.star.delete(id) : CFG.star.add(id); render(); if (CFG.star.has(id)) toast('Напомним о старте матча'); return }
      const rv = q('[data-reveal]'); if (rv) { CFG.rev.add(rv.dataset.reveal); render(); return }
      if (q('[data-spoil]')) { CFG.spoil = !CFG.spoil; CFG.rev.clear(); render(); return }
      const xa = q('[data-xa]'); if (xa) { const m = S.M.find((x) => x.id === xa.dataset.id), k = xa.dataset.xa
        if (k === 'star') { CFG.star.has(m.id) ? CFG.star.delete(m.id) : CFG.star.add(m.id); render(); if (CFG.star.has(m.id)) toast('Напомним о старте матча'); return }
        if (k === 'rec') { toast('Запись матча — в лабе не открывается'); return }
        if (m && m.href) location.href = m.href + (FIT ? '?fit=1' : ''); else toast('Страница матча — пример: в лабе открыта только PARIVISION — Team Spirit'); return }
      if (q('.h11-ex')) return
      const xr = q('[data-x]'); if (xr) { const id = xr.dataset.x, w = xr.closest('.h11-r'), was = w.classList.contains('is-open')
        document.querySelectorAll('.h11-r.is-open').forEach((r) => { r.classList.remove('is-open'); r.querySelector('[data-x]').setAttribute('aria-expanded', 'false') })
        if (!was) { w.classList.add('is-open'); xr.setAttribute('aria-expanded', 'true') } CFG.open = was ? null : id; return }
      if (q('[data-st]')) { toast('Стрим — в лабе не открывается'); return }
      if (q('[data-more]')) { CFG.more = true; render(); return }
      if (q('[data-retry]')) { CFG.state = 'ok'; render(); return }
      const n = q('[data-n]'); if (n && n.closest('#main')) { e.preventDefault(); toast('Страница новости — в лабе не открывается'); return }
      const r = q('[data-m]'); if (r && (r.closest('.h2-main') || (O.lay && r.closest('#main')))) { const m = S.M.find((x) => x.id === r.dataset.m); if (m && m.href) location.href = m.href + (FIT ? '?fit=1' : ''); else toast('Страница матча — пример: в лабе открыта только PARIVISION — Team Spirit') } })
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('.h2-m, .h4-lv, .h4-s, .h5-mr, .hm-r, .t2-c')) e.target.click() })
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер 1440' }, { v: 'phone', label: 'Телефон 390' }] },
        { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'ok', label: 'Обычный день' }, { v: 'nolive', label: 'Ничего не идёт' }, { v: 'empty', label: 'Матчей нет' }, { v: 'offline', label: 'Нет сети' }, { v: 'skel', label: 'Загрузка' }] }],
      set(k, x) { if (k === 'view') CFG.view = x; if (k === 'state') CFG.state = x; render() },
      toggles: () => [{ key: 'spoil', name: 'Антиспойлер', value: CFG.spoil }], toggle(k) { if (k === 'spoil') { CFG.spoil = !CFG.spoil; render() } },
      caption: () => 'Сейчас — 21.08.2026 16:08 мск. Dota 2 и новости — база (TI 2026). ‼️ CS2, LoL, Valorant, MLBB — пример' + (O.v3 ? '; рейтинг команд — пример' : '') + (O.v4 ? '; стримы — пример' : '') }
    if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render() } })
    render() }
  return { mount }
})()

// Правая колонка — как на всех страницах (решение 03.11): липнет с отступом 20; не влезает — едет и встаёт с отступом 20 снизу.
;(() => {
  const G = 20
  const fit = () => document.querySelectorAll('.h2-lay > .h2-side').forEach((c) => {
    if (!document.body.classList.contains('is-desk')) { c.style.position = c.style.top = ''; return }
    Object.assign(c.style, { position: 'sticky', top: Math.min(G, innerHeight - c.offsetHeight - G) + 'px' }) })
  addEventListener('resize', fit); addEventListener('load', fit); new ResizeObserver(fit).observe(document.body)
})()
