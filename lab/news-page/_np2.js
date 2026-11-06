// Страница новостей v22+ (лаба news-page) — по созвону 02.11 §3. Отдельно от _np.js (v21 не трогаем).
// §3.1 ранги и фильтр рангов убраны; игры — переключателем в шапке сайта · §3.2 чипы идущих турниров, по умолчанию все
// §3.3 без «Темы / Ранги / Время»: лента по дням, внутри дня — блоками по турнирам · §3.5 колонка турниров и трансферов — слева
// §3.6 первая колонка главного — плотно, мелко, без превью, 10 строк · §3.7 большая в центре — слайдер 5 главных, смена каждые 6 с, активная подсвечена в первой колонке
// §3.8 блок турнира — подборка новостей по нему со ссылками на источник · §3.9 полоса сторис над лентой, по дням · §3.10 матч-бар под шапкой вместо бегущей строки
// v23 (o.right, o.simple): виджеты турниров и трансферов — снова справа (начальник 1·27:08 про колонку мелких новостей, не про виджеты — дирижёр 03.11); стили проще, как у виджетов сайта.
// 03.11 починено: главная новость блока турнира была ссылкой со ссылкой на источник внутри — браузер разрывал вложенную <a>, и блок разваливался; теперь — div с двумя ссылками
// v29–v30 (o.stBare): сторис без заголовка и подложки — просто линия кружков (дирижёр 03.11)
//   o.hd: 'out' — заголовки «Главное» и турниров вынесены над блоком, крупно (v29) · 'none' — без заголовков, турнир — в подписи главной новости блока (v30)
// v28 (o.low): «Главное» ниже — 460 px, у средних фото ужимается, заголовок в 2 строки (дирижёр 03.11)
// v27 (o.fill): строки первой колонки делят высоту блока — без пустоты снизу (дирижёр 03.11)
// v25 (o.eq): блок «Главное» — колонки поровну, как в v21, чтобы не был выше оригинала (дирижёр 03.11)
// v24 (o.stR): сторис — виджетом в правой колонке, над турнирами (дирижёр 03.11)
// v24 (o.sep: N): первая колонка — N своих новостей, не те же, что в слайдере; слайдер — отдельно, с первой колонкой не связан (дирижёр 03.11: «больше четырёх, но не 20; новость по центру — отдельная»).
// Данные — 92 настоящие новости cybersport.ru за 25–30.10 (../news/_feed.js). ‼️ Матчи в матч-баре (счёт, время) и сторис (фото из новостей) — пример.
// v61 (window.DB есть на странице): данные — из общей базы sandbox-project/lab/_db (через _db/compat.js): «сейчас» — 21.08.2026 16:08, середина TI;
//   492 настоящие новости cybersport.ru за 10–21.08, турнир — TI 2026, плашки команд и игроков — по упоминаниям из базы, герой у ника — самый частый герой игрока на TI,
//   сторис — события дня из настоящих матчей TI, «Новое» — самая свежая настоящая новость (дирижёр 03.11: «переводи все 3 страницы на данные»)
window.NP2 = (() => {
  const DBM = !!window.DB, DBD = DBM ? window.DB.data : null
  const F = DBM ? window.NEWS_FEED.slice(1) : window.NEWS_FEED, { FIRE } = window.NFEED, T4T = (window.T4_DATA || { teams: {} }).teams
  const P = new URLSearchParams(location.search), FIT = P.has('fit'), fitView = () => (innerWidth < 800 ? 'phone' : 'desk')
  const CFG = { view: FIT ? fitView() : 'desk', off: new Set(), slide: 0, o: {} }
  const score = (n) => n.views + n.com * 40
  const k1 = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : n)
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const TODAY = DBM ? new Date(window.DB.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' }) : '2026-10-30'
  const TDN = +TODAY.slice(8, 10), MSH = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const dayName = (d) => { const x = new Date(d), n = x.getDate(); return (n === TDN ? 'Сегодня' : n === TDN - 1 ? 'Вчера' : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][x.getDay()]) + ` · ${n} ${MON[x.getMonth()]}` }
  const dayShort = (d) => { const n = +d.slice(8, 10); return n === TDN ? 'Сегодня' : n === TDN - 1 ? 'Вчера' : `${n} ${MSH[+d.slice(5, 7) - 1]}` }
  const when = (n) => (n.t.startsWith(TODAY) ? n.t.slice(11, 16) : `${dayShort(n.t).toLowerCase()}, ${n.t.slice(11, 16)}`)
  const rum = (n) => /по слухам|слух|инсайд/i.test(n.title)
  const fixLede = (t) => t.replace(/([A-Za-z0-9~^])([а-яё])/g, '$1 $2').replace(/([а-яё])([A-Z])/g, '$1 $2')
  const short = (t, k) => (t.length > k ? t.slice(0, k - 1).trim() + '…' : t)
  const LG = (name) => (DBM ? window.DB.logo(name) || '' : T4T[name]?.logo ? '../widget-tournament-4/' + T4T[name].logo : '')
  const ini = (s) => s.replace(/^(Team|Команда)\s+/i, '').slice(0, 2).toUpperCase()
  const logo = (src, name, cls = 'n2-lg') => (src ? `<img class="${cls}" src="${src}" alt="">` : `<i class="${cls} is-ph">${ini(name)}</i>`)

  // турниры — идущие сейчас (§3.2); новость относим по заголовку; остальное — «Другое» (сцена, игроки, игра)
  const TOURS = [
    { id: 'uni', name: 'UNIVERSE by FISSURE', sub: 'Tier 1 · плей-офф · 22.10 – 01.11', logo: '../widget-tournament-4/logos/pari-universe.png', re: /UNIVERSE|FISSURE|о матче OG — Spirit|Dukalis после победы/ },
    { id: 'fme', name: 'Fonbet Media Eleague S5', sub: 'медиалига', logo: '', re: /Fonbet Media Eleague/ },
    { id: 'etc', name: 'Другое', sub: 'игроки, сцена, игра', logo: '', re: /./ },
  ]
  const NB = DBM ? Object.fromEntries(DBD.news.map((n) => ['cs-' === n.id.slice(0, 3) ? n.id : n.id, n])) : {}, nb = (n) => NB[n.db] || { teams: [], players: [], tours: [] }
  if (DBM) { const ti = DBD.tours['ti-2026']; TOURS.splice(0, TOURS.length,
    { id: 'uni', name: ti.name, sub: `Tier 1 · плей-офф · 13.08 – 23.08`, logo: window.DB.url(ti.logo), re: { test: () => false } },
    { id: 'etc', name: 'Другое', sub: 'игроки, сцена, игра', logo: '', re: /./ }) }
  F.forEach((n) => { n.tour = DBM ? (nb(n).tours.includes('ti-2026') || /TI15|The International/i.test(n.title) ? TOURS[0] : TOURS[TOURS.length - 1]) : TOURS.find((t) => t.re.test(n.title)) })
  // v59 (o.topics): чипы — не только турниры, но и темы: команды, трансферы, мнения, игра, слухи, сцена; выбор один (нажал — только эта тема, «Все» — сброс) (дирижёр 03.11: «больше тем»)
  const TOP = [
    { id: 'uni', name: 'UNIVERSE by FISSURE', logo: '../widget-tournament-4/logos/pari-universe.png', t: (n) => n.tour.id === 'uni' },
    { id: 'fme', name: 'Fonbet Media Eleague', t: (n) => n.tour.id === 'fme' },
    { id: 'spi', name: 'Team Spirit', logo: '../widget-tournament-4/logos/team-spirit.png', t: (n) => /Spirit/.test(n.title) },
    { id: 'pv', name: 'PARIVISION', logo: '../widget-tournament-4/logos/parivision.png', t: (n) => /PARIVISION/.test(n.title) },
    { id: 'bb', name: 'BetBoom Team', logo: '../widget-tournament-4/logos/betboom-team.png', t: (n) => /BETBOOM/i.test(n.title) },
    { id: 'tr', name: 'Трансферы и составы', t: (n) => /замен|состав|переход|клуб|кик|инактив|ростер|сменил|вернётся|вернет|присоедин|роль/i.test(n.title) },
    { id: 'op', name: 'Мнения', t: (n) => /«/.test(n.title) },
    { id: 'game', name: 'Игра и патч', t: (n) => /патч|баг|Meepo|[Оо]нлайн|MMR|GPM|героев|Steam|кастом|матчмейкинг|саппорт/i.test(n.title) },
    { id: 'rum', name: 'Слухи', t: (n) => /слух|инсайд|может|возможн|потенциальн/i.test(n.title) },
    { id: 'scene', name: 'Сцена', t: (n) => /ESL|PGL|DPC|LAN|ESSENCE|сцен|322|reddit|Valve/i.test(n.title) },
  ]
  if (DBM) { const T = (id) => ({ id, name: DBD.teams[id].name, logo: window.DB.logo(id), t: (n) => nb(n).teams.includes(id) })
    TOP.splice(0, 5, { id: 'uni', name: 'The International 2026', logo: TOURS[0].logo, t: (n) => n.tour.id === 'uni' }, T('team-spirit'), T('parivision'), T('team-yandex'), T('betboom-team')) }
  // w-news-match (o.mf, созвон 06.11 §2.4): фильтр по матчу — новости о любой из двух команд; ?match=<id матча>, без него — идущий матч, ?match=0 — без фильтра
  // дирижёр 06.11: «выключил — и не могу зайти обратно» → матчи дня всегда стоят чипами в начале ряда (chip/page/split), выбранный — с ×
  // o.mf: 'chip' — матч первым чипом · 'head' — шапка матча над лентой · 'chips' — матчи дня чипами перед темами
  const MM = DBM ? window.DB.matches({ state: ['live', 'soon'] }) : [], mOf = (id) => MM.find((m) => m.id === id) || null
  const inM = (m) => (n) => { const t = nb(n).teams; return t.includes(m.a) || t.includes(m.b) }
  const MX = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 2l6 6M8 2l-6 6"/></svg>'
  const mTeam = (id) => `<img class="n2-tl" src="${window.DB.logo(id)}" alt="">${window.DB.name(id, 'mid')}`
  const mWhen = (m) => (m.state === 'live' ? `<i class="n2-lv"></i>${m.score[0]}:${m.score[1]}` : m.start.slice(11, 16))
  const mChip = (m, x) => `<button class="n2-chip n2-mc${CFG.m === m ? ' is-on' : ''}" data-mm="${m.id}">${mTeam(m.a)}<span class="n2-mc__s">${mWhen(m)}</span>${mTeam(m.b)}<small>${F.filter(inM(m)).length}</small>${x && CFG.m === m ? `<span class="n2-mc__x" data-mx>${MX}</span>` : ''}</button>`
  const mHead = () => { const m = CFG.m; return !m ? '' : `<div class="n2-mh"><span class="n2-mh__k">Новости матча</span><span class="n2-mh__t">${mTeam(m.a)}<span class="n2-mc__s">${mWhen(m)}</span>${mTeam(m.b)}</span><span class="n2-mh__i">${m.state === 'live' ? 'Live · ' + m.live.replace(/^Карта (\d+)/, 'карта $1') : 'Сегодня ' + m.start.slice(11, 16)} · ${m.stage} · ${F.filter(inM(m)).length} новостей</span><a class="n2-mh__go" href="#">К матчу ›</a><button class="n2-mh__x" data-mx aria-label="Все новости">${MX}</button></div>` }
  // 'page' — страница новостей матча: заголовок — сам матч, «‹ Все новости», без чипов
  const mPage = () => { const m = CFG.m; return `<div class="np-h n2-mp"><a class="n2-mp__bk" href="#" data-mx>‹ Все новости</a><h1 class="n2-mh__t">${mTeam(m.a)}<span class="n2-mc__s">${mWhen(m)}</span>${mTeam(m.b)}</h1><small>Новости матча · ${m.stage} · ${m.state === 'live' ? 'Live, ' + m.live.replace(/^Карта (\d+)/, 'карта $1') : 'сегодня ' + m.start.slice(11, 16)} · ${F.filter(inM(m)).length} новостей</small><a class="n2-mh__go" href="#">К матчу ›</a></div>` }
  // 'split' — вместо «Главного» три колонки: обе команды · первая · вторая (свежие сверху), дальше лента по дням
  const mSplit = () => { const m = CFG.m, has = (id) => (n) => nb(n).teams.includes(id), L = tm(F.filter(inM(m)))
    const cols = [['Обе команды', '', L.filter((n) => has(m.a)(n) && has(m.b)(n))], [window.DB.name(m.a, 'mid'), m.a, L.filter((n) => has(m.a)(n) && !has(m.b)(n))], [window.DB.name(m.b, 'mid'), m.b, L.filter((n) => has(m.b)(n) && !has(m.a)(n))]].map(([t, id, l]) => [t, id, l.slice(0, 6), l.length])
    // дирижёр 06.11: на телефоне — сегмент «Обе · команда · команда», видна одна колонка
    const PH = CFG.view !== 'desk', j = CFG.spc || 0, segH = PH ? `<div class="mn-seg n2-sps">${cols.map(([t, , , k], i) => `<button data-spc="${i}" class="${i === j ? 'on' : ''}">${i ? t : 'Обе'}<small class="num">${k}</small></button>`).join('')}</div>` : ''
    return { main: [], used: new Set(cols.flatMap((c) => c[2])), html: `${segH}<section class="n2-sp${PH ? ' is-sw' : ''}">${cols.map(([t, id, l, k]) => `<div class="n2-sp__c"><div class="n2-sp__h">${id ? `<img class="n2-tl" src="${window.DB.logo(id)}" alt="">` : `<img class="n2-tl" src="${window.DB.logo(m.a)}" alt=""><img class="n2-tl" src="${window.DB.logo(m.b)}" alt="">`}${t}<small>${k}</small></div><div class="n2-sp__l">${l.map(it).join('')}</div></div>`).join('')}</section>` } }
  // 'drop' — выбор матча списком справа от заголовка; выбранный матч подсвечен в строке матчей
  const mDrop = () => `<div class="n2-dd${CFG.dd ? ' is-open' : ''}"><button class="n2-dd__b" data-dd>${CFG.m ? `<span class="n2-dd__k">Матч</span>${mTeam(CFG.m.a)}<span class="n2-mc__s">${mWhen(CFG.m)}</span>${mTeam(CFG.m.b)}` : '<span class="n2-dd__k">Матч</span>Любой'}<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2.5 4l2.5 2.5L7.5 4"/></svg></button>${CFG.dd ? `<div class="n2-dd__m"><button class="n2-dd__i${CFG.m ? '' : ' is-on'}" data-mx>Любой матч<small>${F.length}</small></button>${MM.map((m) => `<button class="n2-dd__i${CFG.m === m ? ' is-on' : ''}" data-mm="${m.id}">${mTeam(m.a)}<span class="n2-mc__s">${mWhen(m)}</span>${mTeam(m.b)}<span class="n2-dd__s">${m.state === 'live' ? 'Live' : 'Сегодня ' + m.start.slice(11, 16)}</span><small>${F.filter(inM(m)).length}</small></button>`).join('')}</div>` : ''}</div>`
  const on = (n) => (CFG.m ? inM(CFG.m)(n) : CFG.o.topics ? !CFG.sel || TOP.find((x) => x.id === CFG.sel).t(n) : !CFG.off.has(n.tour.id))
  const sc = (L) => [...L].sort((a, b) => score(b) - score(a)), tm = (L) => [...L].sort((a, b) => (a.t < b.t ? 1 : -1))
  const src = (n) => `<a class="n2-src" href="${n.url}" target="_blank" rel="noopener" data-pop="Источник · cybersport.ru|Откроется на сайте издания">cybersport.ru<svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3 7l4-4M4 3h3v3"/></svg></a>`
  const meta = (n, o = {}) => `<span class="n2-m">${o.tour ? `${logo(n.tour.logo, n.tour.name, 'n2-tl')}<span class="n2-tn">${n.tour.name}</span>` : ''}${rum(n) ? '<i class="n2-rum" data-pop="Слух|Не подтверждено — проверяйте">?</i>' : ''}<span class="f-heat" data-pop="Читают: ${k1(n.views)}|Просмотры на cybersport.ru">${FIRE}${k1(n.views)}</span><time>${when(n)}</time>${o.src ? src(n) : ''}</span>`

  // §3.10 матч-бар — плотно, как SofaScore: статус сверху, две строки «лого · команда · счёт». ‼️ пример: счёт и время — не с Liquipedia
  const MB = [
    ['28.10', 'Team Yandex', 'Astra Invicta', 2, 0], ['28.10', 'PARIVISION', 'Team Liquid', 2, 1], ['28.10', 'OG', 'Team Spirit', 2, 1],
    ['29.10', 'Team Liquid', 'Nightfall', 2, 0], ['29.10', 'Team Spirit', 'SabeRLight-', 2, 1], ['29.10', 'Team Yandex', 'PARIVISION', 2, 1], ['29.10', 'GamerLegion', 'OG', 2, 0],
    ['live', 'Team Spirit', 'PARIVISION', 1, 0], ['31.10 16:00', 'GamerLegion', 'Team Yandex'],
  ]
  const mbar = () => `<div class="n2-mb"><div class="n2-mb__t"><img src="${TOURS[0].logo}" alt=""><span>UNIVERSE<br><small>плей-офф</small></span></div><div class="n2-mb__in">${MB.map(([st, a, b, x, y]) => {
    const live = st === 'live', done = x != null && !live, w = done ? (x > y ? 0 : 1) : -1
    const tr = (nm, s, i) => `<span class="n2-mb__r${w === i ? ' is-w' : w >= 0 ? ' is-l' : ''}">${logo(LG(nm), nm)}<span>${nm}</span><b>${s ?? ''}</b></span>`
    return `<a class="n2-mb__m${live ? ' is-live' : ''}" href="#"><span class="n2-mb__s">${live ? '<i></i>Live · карта 2' : done ? `${st} · завершён` : st}</span>${tr(a, x, 0)}${tr(b, y, 1)}</a>` }).join('')}</div></div>`

  // §3.9 сторис — кружки по дням (новые — с цветным кольцом); тап — просмотр. ‼️ пример: сторис делает Марат, здесь — фото из новостей
  const STO = tm(F.filter((n) => n.img))
  const who = (n) => (n.title.match(/[A-Za-z][\w~^\-]+(?: [A-Z][\w]+)?/) || ['Dota 2'])[0]
  // v25 (o.st1): одна линия — важные события (делают редакторы), без дней. ‼️ пример: события — самые читаемые новости с фото
  const stories1 = () => `<div class="n2-st n2-st--1"><div class="n2-st__row">${sc(STO).slice(0, 8).map((n) => { const i = STO.indexOf(n)
    return `<button class="n2-st__c${CFG.seen?.has(i) ? ' is-seen' : ''}" data-st="${i}"><span class="n2-st__ring"><img src="${n.img}" alt="" loading="lazy"></span><span class="n2-st__n">${short(who(n), 11)}</span></button>` }).join('')}</div></div>`
  const stories = () => { const days = [...new Set(STO.map((n) => n.t.slice(0, 10)))]
    return `<div class="n2-st">${days.map((d) => `<div class="n2-st__d"><small>${dayShort(d)}</small><div class="n2-st__row">${STO.filter((n) => n.t.startsWith(d)).map((n) => { const i = STO.indexOf(n)
      return `<button class="n2-st__c${CFG.seen?.has(i) ? ' is-seen' : ''}" data-st="${i}"><span class="n2-st__ring"><img src="${n.img}" alt="" loading="lazy"></span><span class="n2-st__n">${short(who(n), 11)}</span></button>` }).join('')}</div></div>`).join('')}</div>` }
  // v32–v34: см. o.abs и o.feed ниже
// v31 (o.hl): сторис — хайлайты событий (не новости): кружок = событие, внутри — несколько кадров; копятся по дням — одной линией, прошлые дни дальше вбок с меткой дня;
  // настройка «Прошлые дни» в панели. ‼️ пример: хайлайты будет генерировать Марат; здесь — кадры из фото новостей и наши подписи
  const IM = (i) => F[i].img
  const HL = [
    ['2026-10-30', 'Spirit — PV', 'Live', [[67, 'Team Spirit — PARIVISION', 'Нижняя сетка UNIVERSE, Bo3 · идёт карта 2'], [17, 'Spirit взяли первую карту', 'PARIVISION ни разу не обыграли Spirit на турнире']], 'К матчу'],
    ['2026-10-30', 'GamerLegion', '', [[8, 'GamerLegion 2:0 OG', 'В финале верхней сетки — 31 октября, 16:00']], 'К матчу'],
    ['2026-10-30', 'Pure~', '', [[3, 'Y0nd про Pure~', '«Был до 5 утра на концерте, а в 11 — официальная игра»']], 'Читать'],
    ['2026-10-29', 'Yandex', '', [[10, 'Team Yandex 2:1 PARIVISION', 'Yandex — в финале верхней сетки'], [68, 'Без поражений', 'На турнире Yandex ещё не проигрывали']], 'К матчу'],
    ['2026-10-29', 'Spirit', '', [[17, 'Spirit выбили SabeRLight-', 'Дальше — PARIVISION']], 'К матчу'],
    ['2026-10-29', 'Liquid', '', [[23, 'Liquid 2:0 Nightfall', 'Ростер Nightfall и Lorenof вылетел']], 'К матчу'],
    ['2026-10-29', '322?', '', [[13, 'Подозрения в 322', 'Kuku, Armel и Gabbi — reddit просит Valve разобраться']], 'Читать'],
    ['2026-10-28', 'OG', '', [[28, 'OG 2:1 Team Spirit', 'Первый матч плей-офф'], [26, 'RAMZES666', '«Папа Topson делает»']], 'К матчу'],
    ['2026-10-28', 'Кастомки', '', [[44, 'Онлайн кастомок −99,8%', 'После обновления Steam']], 'Читать'],
    ['2026-10-27', 'BETBOOM', '', [[52, 'BETBOOM — в переигровках', 'Проиграли Nightfall'], [51, 'BETBOOM вылетели', 'Поражение от состава SabeRLight-']], 'К матчу'],
    ['2026-10-26', 'PV — Spirit', '', [[67, 'Spirit обыграли PARIVISION', 'Групповой этап']], 'К матчу'],
    ['2026-10-25', 'Meepo', '', [[85, 'Meepo снова убрали', 'Valve удалила героя из матчмейкинга']], 'Читать'],
  ].map(([d, nm, live, fr, go]) => ({ d, nm, live, fr, go }))
  if (DBM) { // сторис — события из настоящих матчей TI: live и сыгранные серии, новые первыми; кадр — самая читаемая новость про обе команды (или про одну)
    const nm = (id) => DBD.teams[id].mid, fi = (a, b) => { const L = F.map((n, i) => [n, i]).filter(([n]) => nb(n).teams.includes(a) && (!b || nb(n).teams.includes(b))).sort((x, y) => y[0].views - x[0].views); return L[0]?.[1] }
    HL.splice(0, HL.length, ...window.DB.matches({ tour: 'ti-2026', state: ['live', 'done'] }).reverse().slice(0, 12).map((m) => { const i = fi(m.a, m.b) ?? fi(m.a) ?? 0
      return { d: m.start.slice(0, 10), nm: `${nm(m.a)} — ${nm(m.b)}`, live: m.state === 'live' ? 'Live' : '', fr: [[i, `${DBD.teams[m.a].name} ${m.score[0]}:${m.score[1]} ${DBD.teams[m.b].name}`, `${m.stage}${m.live ? ' · ' + m.live : ''}`]], go: 'К матчу' } })) }
  // v32 (o.abs): сторис без подписей, без Live и дней — просто кружки событий; картинки — абстракции-заглушки (градиенты), пока Марат не делает настоящие
  // v58 (o.ill): заглушки сторис — рисунки-сцены (SVG, вертикальные 9:16, как превью видео-хайлайтов): сцена со светом, метро, арена с кубком, игрок за монитором; в просмотре — кнопка ▶ и длительность.
  //   ‼️ пример: настоящие хайлайты будет делать Марат; рисунки нарисованы кодом, не картинки из интернета
  const ILL = (i) => { const k = i % 4, H = [270, 220, 25, 190, 300, 340][i % 6], c1 = `hsl(${H} 55% 14%)`, c2 = `hsl(${(H + 40) % 360} 70% 45%)`, c3 = `hsl(${(H + 180) % 360} 80% 62%)`
    const fig = (x, y, hair, suit) => `<g transform="translate(${x} ${y})"><path d="M-95 260 Q-90 120 0 110 Q90 120 95 260Z" fill="${suit}"/><path d="M-22 112 L0 160 L22 112Z" fill="#e5e5e5"/><circle cx="0" cy="40" r="52" fill="#f1e4d8"/>${hair}<path d="M-56 30 A58 58 0 0 1 56 30" stroke="#111" stroke-width="9" fill="none"/><rect x="-62" y="26" width="14" height="30" rx="6" fill="#111"/><rect x="48" y="26" width="14" height="30" rx="6" fill="#111"/><circle cx="-18" cy="44" r="5" fill="#222"/><circle cx="18" cy="44" r="5" fill="#222"/><path d="M-12 70 Q0 78 12 70" stroke="#a55" stroke-width="4" fill="none"/></g>`
    const hairA = `<path d="M-56 30 Q-60 -30 0 -22 Q60 -30 56 30 Q40 0 20 8 Q0 -6 -20 8 Q-40 0 -56 30Z" fill="${c3}"/>`, hairB = `<path d="M-58 50 L-70 -10 L-30 -30 L-10 -60 L10 -30 L40 -50 L70 0 L58 50 Q30 0 0 10 Q-30 0 -58 50Z" fill="#f4c6dc"/>`
    const sc = [
      `<rect width="360" height="640" fill="${c1}"/>${[40, 120, 200, 280, 330].map((x, j) => `<polygon points="${x},0 ${x - 70},430 ${x + 50},430" fill="${j % 2 ? c3 : '#fff'}" opacity=".12"/>`).join('')}${[...Array(14)].map((_, j) => `<circle cx="${j * 28 + 6}" cy="${600 + (j % 3) * 10}" r="16" fill="#0008"/>`).join('')}${fig(180, 330, hairA, c2)}`,
      `<rect width="360" height="640" fill="#1b2230"/><rect y="0" width="360" height="120" fill="#2b3446"/>${[60, 180, 300].map((x) => `<rect x="${x - 40}" y="40" width="80" height="10" rx="5" fill="#fffbe6"/><circle cx="${x}" cy="150" r="16" stroke="#9aa" stroke-width="5" fill="none"/>`).join('')}<rect x="0" y="200" width="70" height="440" fill="#141a24"/><rect x="290" y="200" width="70" height="440" fill="#141a24"/>${fig(180, 300, hairB, '#222')}<rect x="130" y="470" width="100" height="60" rx="8" fill="#111"/>`,
      `<rect width="360" height="640" fill="${c1}"/><circle cx="180" cy="230" r="170" fill="${c2}" opacity=".35"/>${[...Array(9)].map((_, j) => `<line x1="180" y1="230" x2="${j * 45}" y2="0" stroke="#fff" stroke-width="3" opacity=".15"/>`).join('')}<path d="M120 170 h120 v40 a60 60 0 0 1 -120 0z" fill="#f5c542"/><path d="M120 180 q-40 0 -30 40 q10 20 30 20 M240 180 q40 0 30 40 q-10 20 -30 20" stroke="#f5c542" stroke-width="10" fill="none"/><rect x="165" y="270" width="30" height="50" fill="#d9a521"/><rect x="135" y="320" width="90" height="22" rx="4" fill="#b8860b"/>${[...Array(12)].map((_, j) => `<circle cx="${j * 32 + 10}" cy="${560 + (j % 2) * 18}" r="22" fill="#0009"/>`).join('')}`,
      `<rect width="360" height="640" fill="#0e0f14"/><rect x="40" y="140" width="280" height="170" rx="10" fill="${c2}" opacity=".9"/><rect x="52" y="152" width="256" height="146" rx="6" fill="${c3}" opacity=".5"/><rect x="170" y="310" width="20" height="40" fill="#333"/><ellipse cx="180" cy="230" rx="200" ry="120" fill="${c2}" opacity=".15"/><g transform="translate(180 360)"><path d="M-110 280 Q-100 90 0 80 Q100 90 110 280Z" fill="#1d1d24"/><circle cx="0" cy="20" r="60" fill="#2a2a33"/><path d="M-64 10 A64 64 0 0 1 64 10" stroke="#111" stroke-width="10" fill="none"/></g>`,
    ]
    return `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640'>${sc[k]}</svg>`).replace(/'/g, '%27')}')` } // одинарные кавычки: url стоит внутри style="…"
  const ABS = (i) => { const h = (i * 67 + 200) % 360, h2 = (h + 70) % 360, x = 20 + (i * 37) % 60, y = 20 + (i * 53) % 60
    return `radial-gradient(circle at ${x}% ${y}%, hsl(${h} 85% 64%), transparent 52%), radial-gradient(circle at ${100 - x}% ${100 - y}%, hsl(${h2} 80% 55%), transparent 58%), linear-gradient(${i * 41}deg, hsl(${(h + 180) % 360} 55% 24%), hsl(${h} 45% 10%))` }
  const hlRow = () => { const L = CFG.past === false ? HL.filter((h) => h.d === HL[0].d) : HL, days = [...new Set(L.map((h) => h.d))]
    if (CFG.o.abs) return `<div class="n2-hl"><div class="n2-hl__row">${L.map((h) => { const i = HL.indexOf(h)
      return `<button class="n2-st__c${CFG.hseen?.has(i) ? ' is-seen' : ''}" data-hl="${i}" aria-label="${h.nm}"><span class="n2-st__ring"><i class="n2-abs${CFG.o.ill ? ' is-ill' : ''}" style="background:${CFG.o.ill ? ILL(i) : ABS(i)}"></i></span></button>` }).join('')}</div></div>`
    return `<div class="n2-hl">${days.map((d) => `<div class="n2-hl__g">${days.length > 1 ? `<small>${dayShort(d)}</small>` : ''}<div class="n2-hl__row">${L.filter((h) => h.d === d).map((h) => { const i = HL.indexOf(h)
      return `<button class="n2-st__c${CFG.hseen?.has(i) ? ' is-seen' : ''}${h.live ? ' is-live' : ''}" data-hl="${i}"><span class="n2-st__ring"><img src="${IM(h.fr[0][0])}" alt="" loading="lazy">${h.live ? '<em>Live</em>' : ''}</span><span class="n2-st__n">${h.nm}</span></button>` }).join('')}</div></div>`).join('')}</div>` }
  // просмотр: кадры одного хайлайта, полоски сверху; 4 с на кадр; после последнего — следующий хайлайт; внизу — переход к матчу или новости
  let hlT = 0
  const closeHL = () => { clearTimeout(hlT); document.querySelector('.n2-sv')?.remove(); render() }
  const openHL = (i, f = 0) => { clearTimeout(hlT); const L = CFG.past === false ? HL.filter((h) => h.d === HL[0].d) : HL, h = HL[i]
    if (!h || !L.includes(h)) return closeHL()
    if (f < 0) { const p = L[L.indexOf(h) - 1]; return p ? openHL(HL.indexOf(p), p.fr.length - 1) : openHL(i, 0) }
    if (f >= h.fr.length) { const n = L[L.indexOf(h) + 1]; return n ? openHL(HL.indexOf(n), 0) : closeHL() }
    ;(CFG.hseen ||= new Set()).add(i); let v = document.querySelector('.n2-sv'); if (!v) { v = document.createElement('div'); v.className = 'n2-sv'; document.body.append(v) }
    const [im, t, sub] = h.fr[f]
    v.innerHTML = `<div class="n2-sv__card"><div class="n2-sv__bars">${h.fr.map((_, j) => `<i class="${j < f ? 'is-done' : j === f ? 'is-on is-4' : ''}"></i>`).join('')}</div>
      ${CFG.o.abs ? (CFG.o.ill ? `<i class="n2-sv__abs is-ill" style="background:${ILL(i)}"></i><span class="n2-sv__play"></span><span class="n2-sv__dur">00:${String(14 + (i * 7) % 40).padStart(2, '0')}</span>` : `<i class="n2-sv__abs" style="background:${ABS(i)}"></i>`) : `<div class="n2-sv__top"><b>${h.nm}</b><small>${h.live ? '<i class="n2-sv__lv"></i>Live' : dayShort(h.d)}</small></div>
      <img src="${IM(im)}" alt="">`}<div class="n2-sv__b"><b>${t}</b><small>${sub}</small><a href="${F[im].url}" target="_blank" rel="noopener">${h.go} ›</a></div>
      <button class="n2-sv__x" data-hx aria-label="Закрыть">×</button><button class="n2-sv__p" data-hgo="${i}:${f - 1}" aria-label="Назад"></button><button class="n2-sv__n" data-hgo="${i}:${f + 1}" aria-label="Дальше"></button></div>`
    hlT = setTimeout(() => openHL(i, f + 1), 4000) }
  let stT = 0
  const openStory = (i) => { clearTimeout(stT); (CFG.seen ||= new Set()).add(i); const n = STO[i]; let v = document.querySelector('.n2-sv')
    if (!n) { v?.remove(); render(); return }
    if (!v) { v = document.createElement('div'); v.className = 'n2-sv'; document.body.append(v) }
    const d = CFG.o.st1 ? sc(STO).slice(0, 8) : STO.filter((x) => x.t.slice(0, 10) === n.t.slice(0, 10)), k = d.indexOf(n)
    v.innerHTML = `<div class="n2-sv__card"><div class="n2-sv__bars">${d.map((_, j) => `<i class="${j < k ? 'is-done' : j === k ? 'is-on' : ''}"></i>`).join('')}</div>
      <img src="${n.img}" alt=""><div class="n2-sv__b"><small>${dayShort(n.t)} · ${n.t.slice(11, 16)}</small><b>${n.title}</b><a href="${n.url}" target="_blank" rel="noopener">Читать ›</a></div>
      <button class="n2-sv__x" data-sx aria-label="Закрыть">×</button><button class="n2-sv__p" data-sgo="${CFG.o.st1 ? (d[k - 1] ? STO.indexOf(d[k - 1]) : -1) : i - 1}" aria-label="Назад"></button><button class="n2-sv__n" data-sgo="${CFG.o.st1 ? (d[k + 1] ? STO.indexOf(d[k + 1]) : -1) : i + 1}" aria-label="Дальше"></button></div>`
    stT = setTimeout(() => openStory(CFG.o.st1 ? (d[k + 1] ? STO.indexOf(d[k + 1]) : -1) : i + 1), 5000) }

  // §3.2 чипы турниров — все включены; нажал — выключил/включил; «Все» — вернуть все
  const chips = () => CFG.o.topics ? `${CFG.o.mf === 'head' ? mHead() : ''}<div class="n2-ch"><button class="n2-chip${CFG.sel || CFG.m ? '' : ' is-on'}" data-tall>Все</button>${CFG.o.mf && CFG.o.mf !== 'drop' && CFG.o.mf !== 'head' ? MM.map((m) => mChip(m, true)).join('') + '<i class="n2-ch__sep"></i>' : ''}${TOP.map((t) => `<button class="n2-chip${CFG.sel === t.id ? ' is-on' : ''}" data-top="${t.id}">${t.logo ? `<img class="n2-tl" src="${t.logo}" alt="">` : ''}${t.name}<small>${F.filter(t.t).length}</small></button>`).join('')}</div>` : `<div class="n2-ch"><button class="n2-chip${CFG.off.size ? '' : ' is-on'}" data-tall>Все</button>${TOURS.map((t) => `<button class="n2-chip${CFG.off.has(t.id) ? '' : ' is-on'}" data-tour="${t.id}">${t.id === 'etc' ? '' : logo(t.logo, t.name, 'n2-tl')}${t.name}<small>${F.filter((n) => n.tour === t).length}</small></button>`).join('')}</div>`

  // главное: §3.6 плотная колонка (10 строк, мелко, без превью) · §3.7 слайдер 5 главных · 2 средние с фото
  const top = () => { const L = sc(F.filter(on)), main = L.filter((n) => n.img).slice(0, 5), rest = L.filter((n) => !main.includes(n))
    const list = CFG.o.sep ? rest.slice(0, CFG.o.sep) : [...main, ...rest.slice(0, 10 - main.length)], meds = rest.filter((n) => n.img && !list.includes(n)).slice(0, 2)
    return { main, used: new Set([...list, ...meds]), html: !main.length ? '' : `${CFG.o.hd === 'out' ? '<h2 class="n2-oh">Главное</h2>' : ''}<section class="n2-top${CFG.o.eq ? ' is-eq' : ''}${CFG.o.fill ? ' is-fill' : ''}${CFG.o.low ? ' is-low' : ''}${CFG.o.m4 ? ' is-ov2' : ''}${CFG.o.mfUnder ? ' is-under' : ''}">
      <div class="n2-ls">${CFG.o.hd ? '' : '<div class="n2-sh">Главное</div>'}${list.map((n) => { const j = main.indexOf(n)
        return CFG.o.w && j < 0 ? it(n) : j >= 0 ? `<button class="n2-li is-main${j === CFG.slide ? ' is-on' : ''}" data-sl="${j}"><span class="n2-li__t">${n.title}</span>${meta(n)}<i class="n2-li__pg"></i></button>`
          : `<a class="n2-li" href="${n.url}" target="_blank" rel="noopener"><span class="n2-li__t">${n.title}</span>${meta(n)}</a>` }).join('')}</div>
      <div class="n2-sl">${main.map((n, j) => `<a class="n2-sl__s${j === CFG.slide ? ' is-on' : ''}" href="${n.url}" target="_blank" rel="noopener"><img src="${n.img}" alt=""><span class="n2-sl__b"><b>${n.title}</b>${n.lede ? `<span class="n2-sl__l">${short(fixLede(n.lede), 180)}</span>` : ''}${CFG.o.w ? meta3(n) : meta(n, { tour: n.tour.id !== 'etc' })}</span></a>`).join('')}
        <div class="n2-sl__dots">${main.map((_, j) => `<button data-sl="${j}" class="${j === CFG.slide ? 'is-on' : ''}" aria-label="Новость ${j + 1}"><i></i></button>`).join('')}</div></div>
      ${meds.length ? `<div class="n2-md">${meds.map((n) => `<a class="n2-mid" href="${n.url}" target="_blank" rel="noopener"><img src="${n.img}" alt="" loading="lazy">${CFG.o.w ? meta3(n) : ''}<span class="n2-mid__t">${CFG.o.w ? mark(n.title) : n.title}</span>${CFG.o.w ? '' : meta(n, { tour: n.tour.id !== 'etc' })}</a>`).join('')}</div>` : ''}
    </section>` } }

  // v35+ (o.w): новость — как в виджете «Новости» (widget-news v73, созвон 02.11 §2.1): время первым и живое, «Tier 1» у турнирных, без «читают» и источника;
  //   команды и турнир — плашкой с лого, игрок — плашкой с аватаром-квадратом; «Подробнее» — суть печатается на месте, раскрывается один раз, «Читать ›» ведёт к новости;
  //   новая новость приходит сверху в первую колонку с пометкой «Новое». Минимальная новость везде — как в первой колонке «Главного»: время, заголовок, «Подробнее»; длинных строк-полос нет.
  //   ‼️ «сейчас» страницы — 30.10, 15:00 (время снимка новостей); новая новость, герои у ников — пример
  const NOW = DBM ? window.DB.now() : new Date('2026-10-30T15:00').getTime(), MS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const when2 = (n) => { const ts = new Date(n.t).getTime(), m = Math.floor((NOW - ts) / 60000), d = new Date(ts)
    return m < 1 ? 'сейчас' : m < 60 ? `${m} мин назад` : n.t.startsWith(TODAY) ? n.t.slice(11, 16) : `${d.getDate()} ${MS[d.getMonth()]}` }
  const TEAMS = { 'Team Spirit': ['Team Spirit', 'Spirit'], PARIVISION: ['PARIVISION'], 'Team Yandex': ['Team Yandex', 'Yandex'], OG: ['OG'], GamerLegion: ['GamerLegion'], 'Team Liquid': ['Team Liquid', 'Liquid'],
    'BetBoom Team': ['BETBOOM TEAM'], '1w Team': ['1w Team'], 'Astra Invicta': ['Astra Invicta'], 'Natus Vincere': ['NAVI'], LEGION: ['LEGION'], PlayTime: ['PlayTime'] }
  const HEROES = { 'Pure~': 'faceless_void', 'Stariy bog': 'invoker', Niku: 'nevermore', 'Save-': 'rubick', Wisper: 'tidehunter', Misha: 'earthshaker', NS: 'invoker', RAMZES666: 'terrorblade', Lelis: 'puck', 'Cr1t-': 'earth_spirit' }
  const PLAYERS = ['Pure~', 'Stariy bog', 'Y0nd', 'Fishman', 'Bignum', 'NS', 'Petushara', 'RAMZES666', 'Lelis', 'Kuku', 'Armel', 'Gabbi', 'Adekvat', 'Ceb', 'Topson', 'Collapse', 'SyndereN', 'Cr1t-', 'Каffs', 'Misha', 'Wisper', 'Malr1ne', 'Satanic', 'Korb3n', 'Lorenof',
    'Arteezy', 'AndreyIMMERSION', 'ILTW', 'SabeRLight-', 'SaberLight-', 'Save-', '9Class', 'Dukalis', 'Kiritych', 'N0tail', 'Nisha', 'Mira', 'Iceberg', 'SQreen', 'Noticed', 'Astini', 'Noxville', 'KuroKy', 'Gorgc', 'Miracle-', 'Niku', 'Ahilles', 'DarkLord^', 'gpK~', 'bzm', 'rostislav_999', 'Nightfall', 'Ahilles']
  if (DBM) { // команды и игроки — из базы: полное и среднее имя команды; ник игрока; герой у ника — самый частый на TI
    for (const k of Object.keys(TEAMS)) delete TEAMS[k]; PLAYERS.length = 0; for (const k of Object.keys(HEROES)) delete HEROES[k]
    const used = new Set(DBD.news.flatMap((n) => n.teams)), usedP = new Set(DBD.news.flatMap((n) => n.players))
    for (const id of used) { const t = DBD.teams[id]; TEAMS[t.name] = [...new Set([t.name, t.mid])].filter((x) => x.length > 2) }
    const vars = (k) => { const b = k.replace(/[~^-]$/, ''); return [...new Set([k, b, b + '~', b + '-'])] }
    for (const id of usedP) PLAYERS.push(...vars(DBD.players[id].nick))
    for (const x of window.DB.playerStats('ti-2026')) { if (x.heroes[0]) for (const v of vars(DBD.players[x.player].nick)) HEROES[v] = x.heroes[0].hero } }
  const ALIAS = []; Object.entries(TEAMS).forEach(([k, a]) => a.forEach((x) => ALIAS.push([x, 't', k]))); PLAYERS.forEach((x) => ALIAS.push([x, 'p', x])); ALIAS.push(DBM ? ['The International 2026', 'e', 'uni'] : ['UNIVERSE by FISSURE', 'e', 'uni']); if (DBM) ALIAS.push(['TI15', 'e', 'uni'])
  ALIAS.sort((a, b) => b[0].length - a[0].length)
  const reE = (x) => x.replace(/[.*+?^${}()|[\]\\~-]/g, (c) => '\\' + c)
  const MRE = new RegExp(`(?<![\\wА-Яа-яЁё])(${ALIAS.map((a) => reE(a[0])).join('|')})(?![\\wА-Яа-яЁё])`, 'g')
  const escH = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const mark = (t) => escH(t).replace(MRE, (x) => { const [, k, id] = ALIAS.find((a) => a[0] === x)
    if (k === 'p') return `<span class="np3-p" title="Страница игрока"><span class="np3-av">${HEROES[id] ? `<img src="../gs-match/img/heroes/${HEROES[id]}.png" alt="">` : `<b>${x[0]}</b>`}</span>${x}</span>`
    const lg = k === 'e' ? TOURS[0].logo : LG(id); return `<span class="np3-e${lg ? '' : ' is-nl'}">${lg ? `<img src="${lg}" alt="">` : ''}${x}</span>` })
  const tier = (n) => (n.tour?.id === 'uni' ? '<span class="t5-tier t5-tier--fill t5-tier--1">Tier 1</span>' : '')
  const MORE3 = '<button class="np3-more" data-brief type="button"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><rect x="2.5" y="1.5" width="11" height="13" rx="2.5"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/></svg>Подробнее</button>'
  const it = (n) => CFG.o.noMore ? `<a class="np3-i${n.fresh ? ' is-new' : ''}" href="${n.url}" target="_blank" rel="noopener"><span class="np3-m"><time>${n.fresh ? 'сейчас' : when2(n)}</time>${n.fresh ? '<span class="np3-new">Новое</span>' : ''}${tier(n)}</span><span class="np3-t">${mark(n.title)}</span></a>` : `<div class="np3-i${n.fresh ? ' is-new' : ''}" data-nid="${n.fresh ? 'fresh' : F.indexOf(n)}"><span class="np3-m"><time>${n.fresh ? 'сейчас' : when2(n)}</time>${n.fresh ? '<span class="np3-new">Новое</span>' : ''}${tier(n)}</span><span class="np3-t">${mark(n.title)}</span>${MORE3}<span class="np3-x"></span></div>`
  const FRESH = DBM ? { ...window.NEWS_FEED[0], tour: TOURS[TOURS.length - 1], fresh: true } : { t: '2026-10-30T15:00', title: 'PARIVISION — Team Spirit: матч начался, идёт первая карта', tour: TOURS[0], lede: 'Нижняя сетка UNIVERSE by FISSURE, Bo3. Проигравший покидает турнир.', url: '#', fresh: true, views: 0, com: 0 }
  const brief3 = (el) => { if (el.classList.contains('is-open')) return; const id = el.dataset.nid, n = id === 'fresh' ? FRESH : F[+id], x = el.querySelector('.np3-x'), b = el.querySelector('.np3-more')
    el.classList.add('is-open'); b.classList.add('is-gone'); const words = n.lede ? fixLede(n.lede).split(' ') : []; let k = 0
    x.innerHTML = `<span class="np3-l"></span><a class="np3-go" href="${n.url}" target="_blank" rel="noopener" hidden>Читать ›</a>`; const l = x.querySelector('.np3-l'), go = x.querySelector('.np3-go')
    const step = () => { if (k < words.length) { l.textContent = words.slice(0, ++k).join(' '); return setTimeout(step, 35) } go.hidden = false }; setTimeout(step, 250) }
  const meta3 = (n) => `<span class="np3-m"><time>${when2(n)}</time>${tier(n)}</span>`
  const grid3 = (L) => (L.length ? `<div class="np3-grid">${tm(L).map(it).join('')}</div>` : '')
  // v32–v34 (o.feed): лента ниже «Главного» ближе к оригиналу v21 — раскладка «4 мелких | большая | 2 средние»; заголовок — только день, у группы — тихая подпись над блоком
  //   A — день одним блоком · B — внутри дня блок на турнир · C — внутри дня блок на тему (команда, игрок, игра — правила тем из v21). Что не влезло в раскладку — строками под ней
  const RULES = [
    ['spi', 'Team Spirit', '#60a5fa', /Spirit/], ['pv', 'PARIVISION', '#f472b6', /PARIVISION/], ['bb', 'BETBOOM и 1w Team', '#f59e0b', /BETBOOM|1w|gpK|bzm|Save-|Stariy bog|Pure~|Petushara/i],
    ['liq', 'Team Liquid', '#22d3ee', /Wisper|Malr1ne|Nisha|Liquid/], ['uni', 'Yandex, OG, GamerLegion', '#a78bfa', /UNIVERSE|Nightfall|Yandex|\bOG\b|SabeRLight|Lorenof|Topson|Ceb |Adekvat|9Class/],
    ['game', 'Игра: онлайн, баги, патч', '#4ade80', /[Оо]нлайн|баг|патч|Meepo|MMR|GPM|Steam|кастом|героев|саппортов|бан|rostislav/], ['scene', 'Сцена', '#fb7185', /ESL|PGL|DPC|Fonbet|322|PlayTime|инактив|Astini/],
    ['talk', 'Игроки и мнения', '#a1a1aa', /./],
  ].map(([id, name, col, re]) => ({ id, name, col, re }))
  F.forEach((n) => { n.topic2 = RULES.find((r) => r.re.test(n.title)) })
  const cs = (n, o) => CFG.o.w ? it(n) : `<a class="np-c" href="${n.url}" target="_blank" rel="noopener"><span class="np-c__b"><span class="np-c__t">${rum(n) ? '<i class="n2-rum">?</i>' : ''}${n.title}</span>${meta(n, o)}</span></a>`
  const cm = (n, o) => `<a class="np-c np-mid has-img" href="${n.url}" target="_blank" rel="noopener"><img src="${n.img}" alt="" loading="lazy"><span class="np-c__b">${CFG.o.w ? meta3(n) : ''}<span class="np-c__t">${CFG.o.w ? mark(n.title) : n.title}</span>${CFG.o.w ? '' : meta(n, o)}</span></a>`
  const cl = (n, o) => `<a class="np-c np-lead${n.img ? ' has-img' : ''}" href="${n.url}" target="_blank" rel="noopener">${n.img ? `<img src="${n.img}" alt="" loading="lazy">` : ''}<span class="np-c__b"><span class="np-c__t">${n.title}</span>${n.lede ? `<span class="np-lede">${short(fixLede(n.lede), 170)}</span>` : ''}${CFG.o.w ? meta3(n) : meta(n, o)}</span></a>`
  const comp = (N, o) => { N = sc(N); const m = N.find((n) => n.img) || N[0], r = N.filter((n) => n !== m), meds = r.filter((n) => n.img).slice(0, 2), sm = r.filter((n) => !meds.includes(n)).slice(0, 4)
    const rest = tm(r.filter((n) => !meds.includes(n) && !sm.includes(n)))
    const rows = CFG.o.w ? grid3(rest) : rest.length ? `<div class="n2-more">${rest.map((n) => `<div class="n2-row"><time>${n.t.slice(11, 16)}</time><a class="n2-row__t" href="${n.url}" target="_blank" rel="noopener">${rum(n) ? '<i class="n2-rum">?</i>' : ''}${n.title}</a>${src(n)}</div>`).join('')}</div>` : ''
    if (N.length < 3 && CFG.o.w) return `<div class="np-sec n2-cb">${grid3(N)}</div>`
    if (N.length < 3) return `<div class="np-sec n2-cb"><div class="n2-more">${tm(N).map((n) => `<div class="n2-row"><time>${n.t.slice(11, 16)}</time><a class="n2-row__t" href="${n.url}" target="_blank" rel="noopener">${rum(n) ? '<i class="n2-rum">?</i>' : ''}${n.title}</a>${src(n)}</div>`).join('')}</div></div>` // 1–2 новости — без раскладки, строками
    if (CFG.view !== 'desk') return `<div class="np-sec n2-cb"><div class="np-g np-g--1">${cl(m, o)}${meds.map((n) => cm(n, o)).join('')}${sm.map((n) => cs(n, o)).join('')}</div>${rows}</div>`
    const cols = [sm.length && `<div class="np-col np-col--s">${sm.map((n) => cs(n, o)).join('')}</div>`, `<div class="np-col np-col--lead">${cl(m, o)}</div>`, meds.length && `<div class="np-col">${meds.map((n) => cm(n, o)).join('')}</div>`].filter(Boolean)
    return `<div class="np-sec n2-cb"><div class="np-g"><div class="np-cols${cols.length === 1 ? ' is-1' : ''}" style="grid-template-columns:repeat(${cols.length}, minmax(0, 1fr))">${cols.join('')}</div></div>${rows}</div>` }
  const gl = (lg, name, n, col) => `<div class="n2-gl">${col ? `<i class="n2-gl__d" style="--tc:${col}"></i>` : lg}<b>${name}</b><small>${n}</small></div>`
  // v38–v41 (o.lay): раскладка блока дня по референсам (Figma 308:389): в день видно 5–7 новостей, остальное — «Ещё N за день ›» (раскрывает мелкими карточками);
  //   v46–v47 (o.fl2: 'top' | 'mid'): клетки 4:3 ровной сеткой; у мелких фото сверху, у главной — фото слева на всю высоту, текст справа; главная не растягивает ряд; текст к верху слева (v46) или посередине (v47) (дирижёр 03.11)
//   v44–v45 (o.flat: 'top' | 'mid'): клетки приплюснутые (4:3 → шире, чем выше), у главной и мелких всё одинаково — фото сверху во всю ширину, текст ниже: прижат к верху слева (v44) или ровно посередине (v45) (дирижёр 03.11)
//   v43 (o.sq): клетки — ровные квадраты, главная — два квадрата в ширину; фото — верх квадрата, текст — низ (дирижёр 03.11)
//   v42 of3 — как of, но 3 колонки (главная на 2 + 1, ниже 3), фото во всю ширину карточки без отступов — и у главной, и у мелких (дирижёр 03.11)
//   у фото — постоянная пропорция, у колонок — равная высота, ничего не тянется. fm — FotMob · bbc — BBC Sport · verge — The Verge · of — OneFootball
  const ph = (n, cls = '') => (n.img ? `<img class="np4-im${cls}" src="${n.img}" alt="" loading="lazy">` : '')
  const card = (n, cls = '') => `<a class="np4-c${n.img ? ' has-img' : ' no-img'}${cls}" href="${n.url}" target="_blank" rel="noopener">${ph(n)}<span class="np4-b">${meta3(n)}<span class="np4-t">${CFG.o.plain ? escH(n.title) : mark(n.title)}</span>${!n.img && n.lede ? `<span class="np4-l">${short(fixLede(n.lede), 140)}</span>` : ''}</span></a>`
  const lead4 = (n, cls = '') => `<a class="np4-lead${cls}" href="${n.url}" target="_blank" rel="noopener">${ph(n)}<span class="np4-b">${meta3(n)}<span class="np4-t">${CFG.o.plain ? escH(n.title) : mark(n.title)}</span>${n.lede ? `<span class="np4-l">${short(fixLede(n.lede), 200)}</span>` : ''}</span></a>`
  const thumbRow = (n) => `<a class="np4-tr" href="${n.url}" target="_blank" rel="noopener"><span class="np4-b">${meta3(n)}<span class="np4-t">${mark(n.title)}</span></span>${n.img ? `<img src="${n.img}" alt="" loading="lazy">` : ''}</a>`
  const lay = (D, di) => { const L = sc(D), I = L.filter((n) => n.img), T = L.filter((n) => !n.img), m = I[0] || L[0], pick = (k, pref) => { const out = []; for (const n of [...pref, ...L]) { if (out.length >= k) break; if (n !== m && !out.includes(n)) out.push(n) } return out }
    const M = CFG.o.lay, desk = CFG.view === 'desk'; let html = '', shown
    if (!desk && M !== 'mod') { const r = pick(4, []); shown = [m, ...r]; html = `<div class="np4 np4--ph">${lead4(m)}${r.map(it).join('')}</div>` }
    else if (M === 'fm') { const r = pick(4, I.slice(1)); shown = [m, ...r]; html = `<div class="np4 np4--fm${di % 2 ? ' is-rev' : ''}">${lead4(m)}<div class="np4-rows">${r.map(thumbRow).join('')}</div></div>` }
    else if (M === 'bbc') { const mids = pick(2, I.slice(1)), tx = pick(6, T).filter((n) => !mids.includes(n)).slice(0, 4); shown = [m, ...mids, ...tx]
      html = `<div class="np4 np4--bbc">${lead4(m, ' is-big')}${mids.map((n) => card(n)).join('')}</div>${tx.length ? `<div class="np4-tx">${tx.map(it).join('')}</div>` : ''}` }
    else if (M === 'verge') { const r = pick(4, []); shown = [m, ...r]; html = `<div class="np4 np4--vg">${lead4(m)}<div class="np4-rows">${r.map(thumbRow).join('')}</div></div>` }
    // v54 (lay: 'base') — базовая логика (дирижёр 03.11): «супер-важная» — максимум одна в день (с фото и от 5 тыс. просмотров), только у неё крупный заголовок; у остальных — один размер 15 px.
    //   День — две колонки, на всю ширину ничего не тянется: слева 2/3 — новости с фото (супер-важная одна или 2 карточки рядом), справа 1/3 — столбик мелких высотой с левую часть;
    //   нет фото — две колонки мелких. Видно 1–2 с фото и 4–6 мелких, остальное — «Ещё N за день ›». Порядок — по важности
    else if (M === 'base') { const sup = I[0] && I[0].views >= 5000 ? I[0] : null, ph = sup ? [sup] : I.slice(0, 2), txt = L.filter((n) => !ph.includes(n))
      const pc = (n, big) => `<a class="np5-c${big ? ' is-sup' : ''}" href="${n.url}" target="_blank" rel="noopener"><img src="${n.img}" alt="" loading="lazy"><span class="np5-b">${meta3(n)}<span class="np5-t">${escH(n.title)}</span>${big && n.lede ? `<span class="np5-ld">${short(fixLede(n.lede), 180)}</span>` : ''}</span></a>`
      if (!desk) { const r = txt.slice(0, 4); shown = [...ph, ...r]; html = `<div class="np5 np5--ph">${ph.map((n) => pc(n, n === sup)).join('')}${r.map(it).join('')}</div>` }
      else if (!ph.length) { const r = txt.slice(0, 6); shown = r; html = `<div class="np5 np5--tx"><div class="np5-col">${r.slice(0, 3).map(it).join('')}</div><div class="np5-col">${r.slice(3).map(it).join('')}</div></div>` }
      else { const r = txt.slice(0, 5); shown = [...ph, ...r]
        html = `<div class="np5"><div class="np5-l${ph.length === 2 ? ' is-two' : ''}">${ph.map((n) => pc(n, n === sup)).join('')}</div><div class="np5-col">${r.map(it).join('')}</div></div>` } }
    // v56 (lay: 'mod') — модульная сетка (дирижёр 03.11): 3 колонки, шаг по высоте — мелкая новость (1 клетка). Средняя = 3 мелких по высоте, большая = 2 средние (6 клеток) и 2 колонки в ширину (2:1).
    //   Пустого места нет: мелкая — 2 строки ровно в клетку, у средней и большой лишнюю высоту занимает фото. Узоры дня: супер-важная (большая + 6 мелких) ·
    //   2 средние + 3 мелких · 1 средняя + 6 мелких (по дням чередуются) · без фото — 6 мелких в 3 колонки
    else if (M === 'mod') { const sup = I[0] && I[0].views >= 10000 ? I[0] : null
      const cell = (n, k, extra = '') => `<a class="np7-c np7-${k}" href="${n.url}" target="_blank" rel="noopener"${extra}><img src="${n.img}" alt="" loading="lazy"><span class="np7-b">${meta3(n)}<span class="np7-t">${escH(n.title)}</span>${k === 'big' && n.lede ? `<span class="np7-l">${short(fixLede(n.lede), 160)}</span>` : ''}</span></a>`
      const sm = (n) => it(n).replace('class="np3-i', 'class="np3-i np7-s')
      let ph, k
      if (!desk) { ph = I.slice(0, 1); const r = L.filter((n) => !ph.includes(n)).slice(0, 4); shown = [...ph, ...r]; html = `<div class="np7 np7--ph${CFG.o.m4 ? ' np7--m4' : ''}">${ph.map((n) => cell(n, 'mid')).join('')}${r.map(sm).join('')}</div>` }
      else { if (sup) { ph = [sup]; k = CFG.o.m4 ? 4 : 6 } else if (I.length >= 2 && (CFG.modK = (CFG.modK || 0) + 1) % 2 === 1) { ph = I.slice(0, 2); k = CFG.o.m4 ? 4 : 3 } else if (I.length) { ph = I.slice(0, 1); k = 6 } else { ph = []; k = 6 }
        const r = L.filter((n) => !ph.includes(n)).slice(0, k); shown = [...ph, ...r]
        const P = sup ? cell(sup, 'big') : ph.map((n) => cell(n, 'mid', ph.length === 2 ? ' data-pair' : '')).join('')
        html = `<div class="np7${CFG.o.m4 ? ' np7--m4' : ''}">${P}${r.map(sm).join('')}</div>` } }
    // v57 (o.m4): большая — 2×4 клетки, текст на фото под затемнением; где 2 средние — они по 4 клетки, рядом 4 мелких (дирижёр 03.11)
    // v55 (lay: 'mix') — как base, но есть средняя новость и размеры вразброс (дирижёр 03.11: «нижние блоки — новость сильно большая; средний вариант, вразброс»):
    //   супер-важная — реже (от 10 тыс. просмотров), фото 21:9; иначе слева по дням чередуются: 2 средние горизонтальные (фото слева 4:3, текст справа) или 2 карточки рядом;
    //   в столбике мелких одна новость с фото — с маленькой картинкой справа
    else if (M === 'mix') { const sup = I[0] && I[0].views >= 10000 ? I[0] : null, ph = sup ? [sup] : I.slice(0, 2)
      const hz = (n) => `<a class="np6-h" href="${n.url}" target="_blank" rel="noopener"><img src="${n.img}" alt="" loading="lazy"><span class="np5-b">${meta3(n)}<span class="np5-t">${escH(n.title)}</span>${n.lede ? `<span class="np5-ld">${short(fixLede(n.lede), 150)}</span>` : ''}</span></a>`
      const vc = (n) => `<a class="np5-c" href="${n.url}" target="_blank" rel="noopener"><img src="${n.img}" alt="" loading="lazy"><span class="np5-b">${meta3(n)}<span class="np5-t">${escH(n.title)}</span>${n.lede ? `<span class="np5-ld">${short(fixLede(n.lede), 140)}</span>` : ''}</span></a>`
      const big = (n) => `<a class="np5-c is-sup np6-sup" href="${n.url}" target="_blank" rel="noopener"><img src="${n.img}" alt="" loading="lazy"><span class="np5-b">${meta3(n)}<span class="np5-t">${escH(n.title)}</span>${n.lede ? `<span class="np5-ld">${short(fixLede(n.lede), 180)}</span>` : ''}</span></a>`
      const th = (n) => `<a class="np3-i np6-th" href="${n.url}" target="_blank" rel="noopener"><span class="np6-th__b"><span class="np3-m"><time>${when2(n)}</time>${tier(n)}</span><span class="np3-t">${mark(n.title)}</span></span><img src="${n.img}" alt="" loading="lazy"></a>`
      const rest0 = L.filter((n) => !ph.includes(n)), r = rest0.slice(0, 5), thN = r.find((n) => n.img) || rest0.find((n) => n.img)
      const col = (thN && !r.includes(thN) ? [...r.slice(0, 4), thN] : r).sort((a, b) => score(b) - score(a))
      shown = [...ph, ...col]
      const C = `<div class="np5-col">${col.map((n) => (n === thN ? th(n) : it(n))).join('')}</div>`
      if (!desk) html = `<div class="np5 np5--ph">${ph.map((n) => (n === sup ? big(n) : hz(n))).join('')}${col.map(it).join('')}</div>`
      else if (!ph.length) html = `<div class="np5 np5--tx"><div class="np5-col">${col.slice(0, 3).map(it).join('')}</div><div class="np5-col">${col.slice(3).map(it).join('')}</div></div>`
      else { const L2 = sup ? big(sup) : ph.length === 1 ? hz(ph[0]) : di % 2 ? `<div class="np6-two">${ph.map(vc).join('')}</div>` : ph.map(hz).join('')
        html = `<div class="np5"><div class="np6-l">${L2}</div>${C}</div>` } }
    // v53 (o.noMore): мелкие новости — просто новость-ссылка, без «Подробнее»; ряд мелких прилеплен к блоку с фото (обёртка np4-wrap) (дирижёр 03.11)
    // v48–v52: А (o.ov) — главная: текст на фото под затемнением · Б (o.split) — ряд с фото (главная + 1) и отдельно ряд из 3 текстовых, как в первой колонке «Главного» ·
    //   В (o.uni) — все карточки одинаковые: фото 16:9 + 2 строки; новости без фото — строкой «Коротко» под сеткой · Г (o.plain) — плашки только в мелких новостях, в карточках — обычный текст (дирижёр 03.11: «покажи все варианты»)
    else if (M === 'of3' && (CFG.o.split || CFG.o.uni)) { const wc = ` is-wide${CFG.o.ov ? ' is-ov' : ''}`, cls = `np4 np4--of np4--of3 np4--fl2 np4--t-${CFG.o.fl2 || 'mid'}${CFG.o.uni ? ' np4--uni' : ' np4--split'}`
      const ph1 = I.filter((n) => n !== m), txt = T.filter((n) => n !== m)
      if (CFG.o.split) { const c = ph1.slice(0, 1), tx = [...txt, ...ph1.slice(1)].slice(0, 3); shown = [m, ...c, ...tx]
        html = `<div class="np4-wrap"><div class="${cls}${c.length ? '' : ' is-solo'}">${lead4(m, wc)}${c.map((n) => card(n)).join('')}</div>${tx.length ? `<div class="np4-tx3">${tx.map(it).join('')}</div>` : ''}</div>` }
      else { const c = ph1.slice(0, ph1.length >= 4 ? 4 : ph1.length ? 1 : 0), tx = txt.slice(0, 3); shown = [m, ...c, ...tx]
        html = `<div class="${cls}${c.length ? '' : ' is-solo'}">${lead4(m, wc)}${c.map((n) => card(n)).join('')}</div>${tx.length ? `<div class="np4-tx3 is-short"><span class="np4-sh">Коротко</span>${tx.map(it).join('')}</div>` : ''}` } }
    else if (M === 'of3') { const r = pick(4, I.slice(1)); shown = [m, ...r]; html = `<div class="np4 np4--of np4--of3${CFG.o.sq ? ' np4--sq' : ''}${CFG.o.flat ? ` np4--flat np4--t-${CFG.o.flat}` : ''}${CFG.o.fl2 ? ` np4--fl2 np4--t-${CFG.o.fl2}` : ''}">${lead4(m, ` is-wide${CFG.o.ov ? ' is-ov' : ''}`)}${r.map((n) => card(n)).join('')}</div>` }
    else { const r = pick(6, I.slice(1)); shown = [m, ...r]; html = `<div class="np4 np4--of">${lead4(m, ' is-wide')}${r.map((n) => card(n)).join('')}</div>` }
    const rest = L.filter((n) => !shown.includes(n)), open = CFG.exp?.has(di)
    return html + (rest.length ? (open ? `<div class="np4-more">${grid3(rest)}</div>` : `<button class="np4-btn" data-exp="${di}">Ещё ${rest.length} за день ›</button>`) : '') }
  const daysAlt = (used) => { CFG.modK = 0; const L = F.filter((n) => on(n) && !used.has(n)), M = CFG.o.feed
    return [...new Set(L.map((n) => n.t.slice(0, 10)))].map((d, di) => { const D = L.filter((n) => n.t.startsWith(d))
      let body = ''
      if (CFG.o.lay) body = lay(D, di)
      else if (M === 'A') body = comp(D, { tour: 1 })
      else if (M === 'B') body = TOURS.map((t) => [t, D.filter((n) => n.tour === t)]).filter(([, N]) => N.length).map(([t, N]) => `<div class="n2-grp">${gl(t.id === 'etc' ? '' : logo(t.logo, t.name), t.name, N.length)}${comp(N, {})}</div>`).join('')
      else body = RULES.map((r) => [r, D.filter((n) => n.topic2 === r)]).filter(([, N]) => N.length).sort((a, b) => b[1].reduce((x, n) => x + score(n), 0) - a[1].reduce((x, n) => x + score(n), 0)).map(([r, N]) => `<div class="n2-grp">${gl('', r.name, N.length, r.col)}${comp(N, { tour: 1 })}</div>`).join('')
      return `<div class="n2-day n2-day--alt"><div class="n2-day__h"><b>${dayName(d)}</b><small>${D.length} новостей</small></div>${body}</div>` }).join('') }
  // §3.3 + §3.8 лента по дням, внутри дня — блок турнира: подборка новостей (крупная с фото + строки со ссылкой на источник)
  // w-news-match v7/v8 (o.mfRow, дирижёр 06.11: «ниже — как новости на странице матча»): под верхним виджетом — карточки как в табе «Новости» матча (w-match-news v14, row3):
  //   по две в ряд, слева фото или лого команд «× », сверху время моно и «Tier 1», в заголовке команды и игроки — плашками; по дням (свежие сверху), до конца ленты — «Показать ещё»
  const rChips = (n) => { const W = []; nb(n).teams.forEach((id) => { const x = window.DB.team(id); if (!x) return; [x.name, x.mid, x.tag].filter((v, i, a) => v && v.length > 2 && a.indexOf(v) === i).forEach((w) => W.push([w, `<span class="mn-ch"><img src="${window.DB.logo(id)}" alt="">$&</span>`])) })
    nb(n).players.forEach((id) => { const q = window.DB.player(id); if (q && q.nick && q.nick.length > 2) W.push([q.nick, `<span class="mn-ch mn-ch--p">${q.photo ? `<img src="../${q.photo}" alt="">` : ''}$&</span>`]) })
    if (!W.length) return n.title; W.sort((x, y) => y[0].length - x[0].length)
    const re = new RegExp(`(?<![\\wА-Яа-яЁё])(${W.map((w) => w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\wА-Яа-яЁё])`, 'g')
    return n.title.replace(re, (x) => { const w = W.find((q) => q[0] === x); return w ? w[1].replace('$&', x) : x }) }
  // v9/v10 (o.mfPic, дирижёр 06.11: «побольше фоток, поменьше логотипов»): у 2 из 3 новостей без фото — фото из других новостей (‼️ пример, не их фото)
  const PIC = F.filter((n) => n.img).map((n) => n.img), pic = (n) => { if (n.img || !CFG.o.mfPic || !PIC.length) return n.img; const h = [...n.title].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); return h % 3 ? PIC[h % PIC.length] : null }
  const rCov = (n) => { const im = pic(n); if (im) return `<img class="mn-bi" src="${im}" alt="" loading="lazy">`; const T = nb(n).teams.slice(0, 2), I = T.length ? T.map((id) => window.DB.logo(id)) : n.tour.logo ? [n.tour.logo] : []
    return `<span class="mn-bi mn-bv${I.length > 1 ? ' is-two' : ''}">${I.map((x) => `<img src="${x}" alt="">`).join('<i>×</i>')}</span>` }
  const rTier = (n) => (nb(n).tours.includes('ti-2026') ? '<span class="t5-tier t5-tier--fill t5-tier--1">Tier 1</span>' : '')
  const rows = (used) => { const L = tm(F.filter((n) => on(n) && !used.has(n))), N = CFG.rn || 16, S = L.slice(0, N)
    return `<div class="mn mn--big mn--row mn--row2 mn--row3 n2-rw${CFG.o.mfBox ? ' is-box' : ''}">${[...new Set(S.map((n) => n.t.slice(0, 10)))].map((d) => { const D = S.filter((n) => n.t.startsWith(d))
      return `<div class="n2-day__h"><b>${dayName(d)}</b><small>${L.filter((n) => n.t.startsWith(d)).length} новостей</small></div><div class="mn-bg">${D.map((n) => `<a class="mn-bc" href="${n.url}" target="_blank" rel="noopener">${rCov(n)}<span class="mn-bb"><span class="mn-wm"><time>${n.t.slice(11, 16)}</time>${rTier(n)}</span><span class="mn-bt">${rChips(n)}</span></span></a>`).join('')}</div>` }).join('')}
      ${L.length > N ? `<button class="mn-bmore" data-rmore>Показать ещё ${Math.min(16, L.length - N)} из ${L.length - N}</button>` : ''}</div>` }
  const days = (used) => { const L = F.filter((n) => on(n) && !used.has(n))
    return [...new Set(L.map((n) => n.t.slice(0, 10)))].map((d) => { const D = L.filter((n) => n.t.startsWith(d))
      const blocks = TOURS.map((t) => [t, sc(D.filter((n) => n.tour === t))]).filter(([, N]) => N.length).map(([t, N]) => { const m = N.find((n) => n.img), R = tm(N.filter((n) => n !== m))
        const hd = `${t.id === 'etc' ? '' : logo(t.logo, t.name)}<b>${t.name}</b><small>${t.sub}</small><span class="n2-tb__n">${N.length}</span>`
        return `${CFG.o.hd === 'out' ? `<div class="n2-oh n2-oh--t">${hd}</div>` : ''}<section class="n2-tb">${CFG.o.hd ? '' : `<div class="n2-tb__h">${hd}</div>`}
          <div class="n2-tb__g${m ? '' : ' is-1'}">${m ? `<div class="n2-tb__lead"><a href="${m.url}" target="_blank" rel="noopener"><img src="${m.img}" alt="" loading="lazy"></a><a class="n2-tb__lt" href="${m.url}" target="_blank" rel="noopener">${m.title}</a>${meta(m, { src: 1, tour: CFG.o.hd === 'none' && t.id !== 'etc' })}</div>` : ''}
          <div class="n2-tb__rows">${R.map((n) => `<div class="n2-row"><time>${n.t.slice(11, 16)}</time><a class="n2-row__t" href="${n.url}" target="_blank" rel="noopener">${rum(n) ? '<i class="n2-rum">?</i>' : ''}${n.title}</a>${src(n)}</div>`).join('')}</div></div></section>` }).join('')
      return `<div class="n2-day"><div class="n2-day__h"><b>${dayName(d)}</b><small>${D.length} новостей</small></div>${blocks}</div>` }).join('') }

  // §3.1 игры — переключатель в шапке сайта (общий для сайта: выбирают при заходе). ‼️ данные есть только по Dota 2
  const GAMES = ['Dota 2', 'CS2', 'League of Legends', 'Valorant', 'MLBB']
  const games = () => `<div class="n2-gm"><button class="n2-gm__b" data-gm>${GAMES[0]}<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 4l2.5 2.5L7.5 4"/></svg></button>
    <div class="n2-gm__p"${CFG.gm ? '' : ' hidden'}><small>Мои игры</small>${GAMES.map((g, i) => `<label><input type="checkbox"${i ? '' : ' checked'}>${g}</label>`).join('')}</div></div>`

  const T4O = { opt: { v3: true, tier: 'fill', tierEn: true, final: 'merge', dt: 'mono' } }, TRO = { opt: { style: 'hltv', v5: true, gameAva: true, skinV1: true, topAll: true, rows: 'tint' } }
  let slT = 0
  const tickSlide = () => { clearTimeout(slT); slT = setTimeout(() => { if (!document.querySelector('.n2-sl:hover')) setSlide((CFG.slide + 1) % (CFG.nMain || 1)); else tickSlide() }, 6000) }
  const setSlide = (j) => { CFG.slide = j
    document.querySelectorAll('.n2-sl__s').forEach((x, k) => x.classList.toggle('is-on', k === j))
    document.querySelectorAll('.n2-sl__dots button, .n2-li.is-main').forEach((x) => x.classList.toggle('is-on', +x.dataset.sl === j))
    tickSlide() }

  // w-news-match (o.mfGame, дирижёр 06.11): переключатель игр «Dota 2 ▾» — из шапки сайта в заголовок «Новости»
  const GE = () => document.querySelector('.n2-hg') || document.querySelector('.pt-games')
  function render() {
    document.body.classList.toggle('is-desk', CFG.view === 'desk'); document.body.classList.toggle('n2s', !!CFG.o.simple)
    document.body.classList.toggle('n2-hgame', !!CFG.o.mfGame); if (!CFG.o.mfGame) document.querySelector('.pt-games').innerHTML = games()
    const m = document.getElementById('main'), T = CFG.o.mf === 'split' && CFG.m ? mSplit() : top(), side = `<aside class="top-r n2-side">${CFG.o.stR ? (CFG.o.stBare ? `<div class="n2-stb">${CFG.o.hl ? hlRow() : stories1()}</div>` : `<div class="w n2-stw"><div class="w-hd"><span class="w-hd__t">Сторис</span></div>${CFG.o.st1 ? stories1() : stories()}</div>`) : ''}<div id="np-t4"></div><div id="np-tr"></div></aside>`; CFG.nMain = T.main.length; if (CFG.slide >= CFG.nMain) CFG.slide = 0
    if (!CFG.o.mbExt) document.getElementById('mbar').innerHTML = mbar() // v60 (o.mbExt): строка матчей — из лабы match-bar (v5), рисует MB
    const MP = CFG.o.mf === 'page' && CFG.m
    if (CFG.o.mf === 'drop') { let st = document.getElementById('n2-mms'); if (!st) { st = document.createElement('style'); st.id = 'n2-mms'; document.head.append(st) } st.textContent = CFG.m ? `.mb-k[data-mm="${CFG.m.id}"]{ background:var(--w-muted); box-shadow:inset 0 -2px 0 var(--w-fg); }` : '' }
    m.innerHTML = `${MP ? mPage() : `<div class="np-h"><h1>Новости</h1>${CFG.o.mfGame ? `<div class="pt-games n2-hg">${games()}</div>` : ''}<small>${CFG.o.mfGame ? '' : 'Dota 2 · '}cybersport.ru · ${DBM ? `${+F[F.length - 1]?.t.slice(8, 10) || ''}–${TDN} ${['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][+TODAY.slice(5, 7) - 1]}` : '25–30 октября'}</small>${CFG.o.mf === 'drop' ? mDrop() : ''}</div>`}${CFG.o.stR ? '' : stories()}${MP ? '' : chips()}
      <div class="top n2-lay${CFG.o.right ? ' is-right' : ''}">${CFG.o.right ? '' : side}<div class="top-l">${T.html}${CFG.o.mfRow ? rows(T.used) : CFG.o.feed ? daysAlt(T.used) : days(T.used)}</div>${CFG.o.right ? side : ''}</div>`
    const t4 = document.getElementById('np-t4'), tr = document.getElementById('np-tr'); if (t4 && window.T4) window.T4.render(t4, T4O); if (tr && window.TR2) window.TR2.render(tr, TRO)
    // дирижёр 06.11: на телефоне колонки едут за сегментом, как слайдер фото — лента со щелчком; листаешь пальцем — сегмент переключается сам
    const sw = m.querySelector('.n2-sp.is-sw'); if (sw) { sw.scrollLeft = (CFG.spc || 0) * sw.clientWidth
      sw.addEventListener('scroll', () => { const k = Math.round(sw.scrollLeft / sw.clientWidth); if (k === CFG.spc && sw._k === k) return; sw._k = k; CFG.spc = k; m.querySelectorAll('.n2-sps [data-spc]').forEach((b) => b.classList.toggle('on', +b.dataset.spc === k)) }, { passive: true }) }
    window.NFEED.pops(m); tickSlide()
    if (CFG.o.w && !CFG.freshDone) { clearTimeout(CFG.fT); CFG.fT = setTimeout(() => { const ls = document.querySelector('.n2-ls'); if (!ls) return; CFG.freshDone = true
      const t = document.createElement('div'); t.innerHTML = it(FRESH); const r = t.firstChild; ls.prepend(r); const all = ls.querySelectorAll('.np3-i'); if (all.length > 5) all[all.length - 1].remove()
      requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add('is-in'))); setTimeout(() => r.classList.remove('is-new', 'is-in'), 600); setTimeout(() => r.classList.add('is-seen'), 10000) }, 4000) }
  }
  function mount(o = {}) {
    CFG.o = o; if (o.mf) { const id = new URLSearchParams(location.search).get('match'); CFG.m = id === '0' ? null : mOf(id) || MM.find((m) => m.state === 'live') || null }
    render()
    document.addEventListener('click', (e) => {
      const q = (s) => e.target.closest(s)
      if (q('[data-gm]')) { CFG.gm = !CFG.gm; GE().innerHTML = games(); return }
      if (CFG.gm && !q('.n2-gm')) { CFG.gm = false; GE().innerHTML = games() }
      const sl = q('[data-sl]'); if (sl) { e.preventDefault(); setSlide(+sl.dataset.sl); return }
      const ex = q('[data-exp]'); if (ex) { (CFG.exp ||= new Set()).add(+ex.dataset.exp); render(); return }
      const br = q('[data-brief]'); if (br) { brief3(br.closest('.np3-i')); return }
      const hl = q('[data-hl]'); if (hl) { openHL(+hl.dataset.hl); return }
      const hg = q('[data-hgo]'); if (hg) { const [i, f] = hg.dataset.hgo.split(':').map(Number); openHL(i, f); return }
      if (q('[data-hx]') || (CFG.o.hl && e.target.classList?.contains('n2-sv'))) { closeHL(); return }
      const st = q('[data-st]'); if (st) { openStory(+st.dataset.st); return }
      const sg = q('[data-sgo]'); if (sg) { openStory(+sg.dataset.sgo); return }
      if (q('[data-sx]') || (e.target.classList?.contains('n2-sv'))) { clearTimeout(stT); document.querySelector('.n2-sv')?.remove(); render(); return }
      if (CFG.o.mf === 'drop') { if (q('[data-dd]')) { CFG.dd = !CFG.dd; render(); return } if (CFG.dd && !q('.n2-dd')) { CFG.dd = false; render() } else if (q('.n2-dd [data-mm], .n2-dd [data-mx]')) CFG.dd = false }
      const spc = q('[data-spc]'); if (spc) { const tr = document.querySelector('.n2-sp.is-sw'); CFG.spc = +spc.dataset.spc; if (tr) tr.scrollTo({ left: CFG.spc * tr.clientWidth, behavior: 'smooth' }); else render(); return }
      if (q('[data-rmore]')) { CFG.rn = (CFG.rn || 16) + 16; render(); return }
      if (CFG.o.mf) { if (q('[data-mx]')) { e.preventDefault(); CFG.m = null; CFG.rn = 0; CFG.slide = 0; render(); return }
        const mm = q('[data-mm]'); if (mm) { e.preventDefault(); const m = mOf(mm.dataset.mm); CFG.m = CFG.m === m ? null : m; CFG.sel = null; CFG.rn = 0; CFG.slide = 0; render(); return }
        if (q('.n2-mh__go')) { e.preventDefault(); return } }
      const tp = q('[data-top]'); if (tp) { CFG.sel = CFG.sel === tp.dataset.top ? null : tp.dataset.top; CFG.m = null; CFG.slide = 0; render(); return }
      if (q('[data-tall]')) { CFG.sel = null; CFG.m = null; CFG.off.clear(); CFG.slide = 0; render(); return }
      const t = q('[data-tour]'); if (t) { const id = t.dataset.tour; CFG.off.has(id) ? CFG.off.delete(id) : CFG.off.add(id); if (CFG.off.size === TOURS.length) CFG.off.clear(); CFG.slide = 0; render() }
    })
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.querySelector('.n2-sv')) { clearTimeout(hlT); clearTimeout(stT); document.querySelector('.n2-sv').remove(); render() } })
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер 1440' }, { v: 'phone', label: 'Телефон 390' }] }],
      set(k, x) { if (k === 'view') { CFG.view = x; render() } }, toggles: () => (CFG.o.hl ? [{ key: 'past', name: 'Сторис: прошлые дни', value: CFG.past !== false }] : []), toggle(k) { if (k === 'past') { CFG.past = CFG.past === false; render() } },
      caption: () => 'Новости настоящие (cybersport.ru) · ‼️ матч-бар (счёт, время) и сторис (фото из новостей) — пример' }
    if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render() } })
  }
  return { mount }
})()


// Правая колонка (страница новостей; дирижёр 03.11: «по этому правилу правая колонка должна везде работать», как на странице турнира):
// влезает в окно — липнет с отступом 20 сверху; не влезает — едет со страницей и встаёт с отступом 20 снизу. Одна колонка (телефон) — не трогаем.
;(() => {
  const G = 20
  const fit = () => document.querySelectorAll('.n2-lay > .top-r').forEach((c) => {
    const m = c.parentElement.querySelector(':scope > .top-l'), two = m && c.getBoundingClientRect().left > m.getBoundingClientRect().left + 10
    if (!two) { c.style.position = c.style.top = c.style.alignSelf = ''; return }
    Object.assign(c.style, { position: 'sticky', alignSelf: 'flex-start', top: Math.min(G, innerHeight - c.offsetHeight - G) + 'px' }) })
  addEventListener('resize', fit); addEventListener('load', fit)
  new ResizeObserver(fit).observe(document.body)
})()
