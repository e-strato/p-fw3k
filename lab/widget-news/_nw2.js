// Виджет «Новости» v37+ (созвон 02.11 §2.1): NW2.render(el, { pic, phone, fresh }).
// Строка: сверху время первым («сейчас» → «N мин назад» → «ЧЧ:ММ» сегодня → дата) и тир турнира («Tier 1»), ниже заголовок —
// у команд и турнира лого 14 перед названием, ник игрока — ссылкой. Клик по строке — «Кратко»: 2–3 строки сути + «Читать ›».
// «Читают», источник, ранг S/A/B/C — убраны. fresh — через 3 с сверху въезжает новая новость с пометкой «Новое».
// Новости — настоящие (../news/_real.js), лого — ../widget-tournament-4/logos. ‼️ Минуты «назад» и новая новость — пример.
// v74 (на странице есть window.DB — общая база _db): новости — настоящие из базы про TI 2026 на «сейчас» (21.08.2026 16:08); разметка команд и игроков — по упоминаниям базы;
//   «сейчас» виджета — «сейчас» базы (часы идут от открытия страницы); «Новое» — самая свежая настоящая новость; команда и герой у ника — из базы (самый частый герой на TI)
window.NW2 = (() => {
  const DBM = !!window.DB, DBD = DBM ? window.DB.data : null, T00 = Date.now(), NOWF = () => (DBM ? window.DB.now() + (Date.now() - T00) : Date.now())
  const REAL = window.NEWS, T4 = window.T4_DATA
  const LG = (name) => { if (DBM) return window.DB.logo(name) || ''; const l = T4.teams[name]?.logo; return l ? '../widget-tournament-4/' + l : '' }
  const TOUR = { uni: { name: 'UNIVERSE', logo: '../widget-tournament-4/logos/pari-universe.png', tier: 1 }, esl: { name: 'ESL One 2027', tier: 1 }, ti: { name: DBM ? DBD.tours[window.DB_TOUR || 'ti-2026'].short : 'TI 2026', logo: DBM ? window.DB.url(DBD.tours[window.DB_TOUR || 'ti-2026'].logo) : '', tier: 1 } }
  // заголовки с разметкой: {t:Команда|как написать} — лого перед названием · {p:Ник} — ссылка на игрока · {e:турнир}
  // m — минут назад (‼️ пример; от «сейчас» страницы), tour — турнир новости (тир)
  const N = [
    ['1w', 33, null, '{t:1w Team}: скандал с {p:Pure~}, споры о заменах и {p:Stariy bog} на ESSENCE III'],
    ['s6', 58, null, 'Весь состав {t:PlayTime} по Dota 2 ушёл в инактив'],
    ['spi-pv', 124, 'uni', '{t:PARIVISION} и {t:Team Spirit} сыграют в нижней сетке {e:uni}'],
    ['s2', 176, null, '{p:NS}: крупного патча не будет ещё пару месяцев'],
    ['s24', 191, null, '{p:Dyrachyo}: до про-сцены у меня была порядочность 1'],
    ['s8', 715, null, '{p:Niku}: уйду из {t:Natus Vincere|NAVI} только в команду того же уровня'],
    ['universe', 790, 'uni', 'Финал виннеров {e:uni}: {t:Team Yandex} против {t:GamerLegion}'],
    ['s10', 1180, null, '{p:RAMZES666}: про-сцену Dota 2 через пару лет ждут большие перемены'],
    ['og', 1240, 'uni', '{t:OG} обыграли {t:Team Spirit|Spirit} и проиграли {t:GamerLegion}: что говорят о новом составе'],
    ['s11', 1300, null, '{p:Lelis}: без русского языка попасть в команду гораздо труднее'],
    ['s12', 1390, null, 'На reddit просят Valve проверить {t:Execration} на договорные матчи'],
    ['save', 1450, null, '{p:Save-} на миде: зачем {t:BetBoom Team|BetBoom} переставили игроков'],
    ['s14', 1520, 'esl', '{e:esl} пройдёт в Мюнхене на LAN'],
    ['cr1t', 1600, null, '{p:Cr1t-}: мид — «безмозглая роль», а по про-сцене он не скучает'],
    ['s20', 1680, null, '{p:Kaffs} о словах {p:Misha} про {p:Wisper}: «Это абсолютная ложь»'],
  ]
  // v55: «Кратко» подробнее и ровнее — суть в 1–2 предложения + 2 пункта у каждой; только факты из самих новостей (../news/_real.js: lede, main, ups), переписаны коротко (дирижёр 02.11)
  const RICH = {
    '1w': ['Стример Stariy bog сыграет за 1w Team на ESSENCE III. До этого y0nd раскритиковал керри Pure~ за концерт до 5 утра перед официальной игрой.', ['RAMZES666: полного роспуска не будет, контракты до конца сезона', 'y0nd: «Максимально неспортивное и дурацкое решение»']],
    s6: ['PlayTime остались без состава по Dota 2: все игроки разом ушли в инактив.', ['Abed, Elmisho и FCR приостановили карьеру', 'В команде не осталось ни одного игрока']],
    'spi-pv': ['Матч сегодня в 13:00 мск, Bo3, нижняя сетка UNIVERSE. Букмекеры чуть больше верят в PARIVISION: 1.75 против 2.10 на Spirit.', ['Spirit вчера выбили LEGION — 2:0', 'PARIVISION опустились в нижнюю сетку после 1:2 от Team Yandex']],
    s2: ['По словам NS, крупного патча не будет ещё пару месяцев: сначала Valve выпустит продолжение «Тёмного карнавала».', ['Продолжение «Тёмного карнавала» — через 15–45 дней', 'Крупный патч — только после него']],
    s24: ['Dyrachyo рассказал, каким был в рейтинге до про-сцены: порядочность — 1.', ['Получал бан на полгода', 'Постоянно ловил муты в рейтинге']],
    s8: ['Niku ответил, при каком условии уйдёт из NAVI: только в команду того же уровня.', ['Даже зарплата в три раза выше не убедит, если команда слабее']],
    universe: ['Финал верхней сетки UNIVERSE — 31 октября в 16:00 мск. GamerLegion обыграли OG 2:0, Team Yandex — PARIVISION 2:1.', ['OG и PARIVISION продолжат в нижней сетке', 'Турнир онлайн, 22 октября — 1 ноября, призовой фонд $250 тыс.']],
    s10: ['RAMZES666 считает, что в ближайшие пару лет про-сцену Dota 2 ждут большие перемены.', ['«Этот год, следующий, а дальше как будто что-то будет очень сильно меняться»']],
    og: ['OG обыграли Team Spirit 2:1 — Topson на Magnus сыграл 13/3/20. Затем уступили GamerLegion 0:2 и ушли в нижнюю сетку.', ['Adekvat: OG уверенно идут к статусу тир-1', 'Дальше в нижней сетке — Team Liquid']],
    s11: ['Lelis считает, что без русского языка попасть в команду гораздо труднее.', ['Сцена сосредоточена в Европе', 'Многие составы — из Восточной Европы']],
    s12: ['На reddit просят Valve проверить Execration на договорные матчи.', ['Автор поста подозревает стак Kukuys', 'Доказательств в посте нет']],
    save: ['BetBoom перевели Save- на мид. RAMZES666 считает, что игрок ушёл туда за мотивацией.', ['RAMZES666: «Save- мог устать от четвёртой позиции»', 'Petushara: к середине сезона всех вернут на свои позиции']],
    s14: ['ESL One 2027 пройдёт в Мюнхене на LAN, 4–11 апреля.', ['16 команд, призовой фонд $1 млн', 'Финальные дни — на арене BMW Park со зрителями']],
    cr1t: ['Бывший саппорт Cr1t- считает мид проще оффлейна и лишь немного сложнее керри.', ['«Мид — это не тяжёлая роль. Она сложнее керри, но на этом всё»', '«Я совсем не скучаю по про-сцене. Может, в следующем году»']],
    s20: ['Тренер OG Kaffs заступился за оффлейнера Liquid Wisper после слов Misha.', ['Kaffs: «Это абсолютная ложь»', 'По словам Kaffs, Wisper хорошо говорит по-английски']],
  }
  // v56: «Кратко» одним абзацем, без пунктов-точек — 2–3 ёмких предложения, шире заголовка; факты — те же, что в RICH (дирижёр 02.11: «точки сбивают фокус, лучше просто абзац»)
  const PARA = {
    '1w': 'Стример Stariy bog сыграет за 1w Team на ESSENCE III. Перед этим y0nd раскритиковал керри Pure~ за концерт до 5 утра накануне официальной игры. RAMZES666 успокаивает: полного роспуска не будет, контракты действуют до конца сезона.',
    s6: 'PlayTime остались без состава по Dota 2: Abed, Elmisho и FCR разом приостановили карьеру. В команде не осталось ни одного игрока.',
    'spi-pv': 'Сегодня в 13:00 мск Spirit и PARIVISION разыграют место в нижней сетке UNIVERSE, Bo3. Spirit вчера выбили LEGION 2:0, PARIVISION упали сюда после 1:2 от Team Yandex. Букмекеры чуть больше верят в PARIVISION — 1.75 против 2.10.',
    s2: 'По словам NS, крупного патча не будет ещё пару месяцев. Сначала Valve выпустит продолжение «Тёмного карнавала» — через 15–45 дней, и только потом патч.',
    s24: 'Dyrachyo признался, что до про-сцены его порядочность в рейтинге была на единице: он получал бан на полгода и постоянно ловил муты.',
    s8: 'Niku уйдёт из NAVI только в команду того же уровня. Даже зарплата в три раза выше его не убедит, если команда слабее.',
    universe: 'Финал верхней сетки UNIVERSE — 31 октября в 16:00 мск. GamerLegion прошли OG 2:0, Team Yandex — PARIVISION 2:1, а проигравшие продолжат в нижней сетке. Турнир онлайн, призовой фонд — $250 тыс.',
    s10: 'RAMZES666 считает, что через пару лет про-сцену Dota 2 ждут большие перемены: «Этот год, следующий, а дальше как будто что-то будет очень сильно меняться».',
    og: 'OG обыграли Team Spirit 2:1 — Topson на Magnus сыграл 13/3/20, но затем уступили GamerLegion 0:2 и ушли в нижнюю сетку к Team Liquid. Adekvat уверен, что OG идут к статусу тир-1.',
    s11: 'Lelis считает, что без русского языка попасть в команду гораздо труднее: сцена сосредоточена в Европе, и многие составы — из Восточной Европы.',
    s12: 'На reddit просят Valve проверить Execration на договорные матчи. Автор поста подозревает стак Kukuys, но доказательств не приводит.',
    save: 'BetBoom перевели Save- на мид. RAMZES666 считает, что игрок устал от четвёртой позиции и ушёл за мотивацией, а Petushara уверен, что к середине сезона всех вернут на свои места.',
    s14: 'ESL One 2027 пройдёт в Мюнхене на LAN с 4 по 11 апреля: 16 команд и призовой фонд $1 млн. Финальные дни сыграют на арене BMW Park со зрителями.',
    cr1t: 'Бывший саппорт Cr1t- назвал мид «безмозглой ролью»: по его словам, она проще оффлейна и лишь немного сложнее керри. По про-сцене он не скучает — «может, в следующем году».',
    s20: 'Тренер OG Kaffs заступился за оффлейнера Liquid Wisper: слова Misha о том, что тот плохо говорит по-английски, он назвал «абсолютной ложью».',
  }
  // v57: абзац как первый абзац новости — продолжает заголовок, не пересказывает его (дирижёр 02.11: «не переписывать то же самое, что в заголовке»); факты — из самих новостей
  const PARA2 = {
    '1w': 'y0nd раскритиковал керри за концерт до 5 утра перед официальной игрой. RAMZES666 уверен, что полного роспуска не будет: контракты действуют до конца сезона, а GpK~ вместо bzm «жёстко бы усилил» состав.',
    s6: 'Abed, Elmisho и FCR приостановили карьеру — в команде не осталось ни одного игрока.',
    'spi-pv': 'Матч сегодня в 13:00 мск, Bo3. Spirit вчера выбили LEGION 2:0, PARIVISION опустились сюда после 1:2 от Team Yandex. Букмекеры чуть больше верят в PARIVISION — 1.75 против 2.10.',
    s2: 'Сначала Valve выпустит продолжение «Тёмного карнавала» — его ждут через 15–45 дней, и только после него дойдёт очередь до патча.',
    s24: 'Игрок признался, что в рейтинге получал бан на полгода и постоянно ловил муты.',
    s8: 'Даже зарплата в три раза выше его не убедит, если команда слабее.',
    universe: 'Матч — 31 октября в 16:00 мск. GamerLegion прошли OG 2:0, Team Yandex — PARIVISION 2:1, проигравшие продолжат в нижней сетке. Турнир онлайн, призовой фонд — $250 тыс.',
    s10: '«Этот год, следующий, а дальше как будто что-то будет очень сильно меняться», — считает игрок.',
    og: 'Против Spirit Topson на Magnus сыграл 13/3/20, а GamerLegion отправили OG в нижнюю сетку — 0:2, дальше Team Liquid. Adekvat уверен, что команда идёт к статусу тир-1.',
    s11: 'Сцена сосредоточена в Европе, и многие составы собраны из игроков Восточной Европы.',
    s12: 'Автор поста подозревает стак Kukuys, но доказательств не приводит.',
    save: 'RAMZES666 считает, что игрок устал от четвёртой позиции и ушёл на мид за мотивацией. Petushara не согласен: на 4-й Save- гораздо комфортнее, и к середине сезона всех вернут на свои места.',
    s14: 'Турнир пройдёт 4–11 апреля: 16 команд и призовой фонд $1 млн. Финальные дни сыграют на арене BMW Park со зрителями.',
    cr1t: 'Бывший саппорт считает мид проще оффлейна и лишь немного сложнее керри. Вернуться на сцену он, может быть, решит в следующем году.',
    s20: 'Тренер OG заступился за оффлейнера Liquid: по его словам, Wisper хорошо говорит по-английски.',
  }
  // новая новость (fresh) — из обновления матча в данных (spi-pv.next) ‼️ пример
  const FRESH = { id: 'fresh', m: 0, tour: 'uni', t: '{t:PARIVISION} — {t:Team Spirit}: матч начался, идёт первая карта',
    lede: 'Нижняя сетка {e:uni}, Bo3. Проигравший покидает турнир.', main: [] }

  // v62+: цвет команды и «кто есть кто» у игроков. ‼️ Пример: цвета — на глаз по логотипам, команды игроков и их герои — для показа
  const TC = { 'Team Spirit': '#60a5fa', PARIVISION: '#f472b6', '1w Team': '#f87171', 'Natus Vincere': '#fde047', 'Team Yandex': '#fb923c', GamerLegion: '#c084fc', OG: '#34d399', 'BetBoom Team': '#f59e0b', 'Team Liquid': '#22d3ee' }
  const PL = { 'Pure~': ['1w Team', 'faceless_void'], 'Stariy bog': ['1w Team', 'invoker'], Niku: ['Natus Vincere', 'nevermore'], 'Save-': ['BetBoom Team', 'rubick'], Wisper: ['Team Liquid', 'tidehunter'],
    Kaffs: ['OG', ''], Misha: ['', 'earthshaker'], NS: ['', 'invoker'], RAMZES666: ['', 'terrorblade'], Dyrachyo: ['', 'slark'], Lelis: ['', 'puck'], 'Cr1t-': ['', 'earth_spirit'] }
  const HERO = (h) => `../gs-match/img/heroes/${h}.png`
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const mark = (s) => esc(s).replace(/\{(t|p|e):([^}|]+)(?:\|([^}]+))?\}/g, (_, k, a, b) => {
    if (k === 'p') { const [tm, h] = PL[a] || [], c = TC[tm]
      // 06.11 (дирижёр: «такие баги тоже убрать… посмотреть, чего не хватает, и догуглить данные»): нет героя на турнире — фото игрока из базы; нет и фото — буква
      const ph = !h && DBM ? window.DB.url(window.DB.player(a)?.photo) : null
      const av = O.ava ? `<span class="n2-av${ph ? ' n2-av--ph' : ''}">${h ? `<img src="${HERO(h)}" alt="">` : ph ? `<img src="${ph}" alt="">` : `<b>${a[0]}</b>`}</span>` : ''
      return `<a class="n2-p" href="#" title="Страница игрока"${c ? ` style="--tc:${c}"` : ''}>${av}${a}</a>` }
    const lg = k === 't' ? LG(a) : TOUR[a].logo, nm = k === 't' ? b || a : TOUR[a].name, c = k === 't' && TC[a]
    return `<span class="n2-e${lg ? '' : ' n2-e--nl'}"${c ? ` style="--tc:${c}"` : ''}>${lg ? `<img src="${lg}" alt="">` : ''}${nm}</span>` })
    // 05.11 (дирижёр: «после тега сбивается строка») — кавычка / скобка перед плашкой и знаки после неё не отрываются от плашки на другую строку
    .replace(/([«"(„]*)(<(a|span) class="n2-[pe][ "][^>]*>(?:(?!<\/\3>)[\s\S])*<\/\3>)([,.:;!?»")…]*)/g, (x, l, m, _, r) => (l || r ? `<span class="n2-nb">${l}${m}${r}</span>` : x))
  const MON = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const pad = (n) => String(n).padStart(2, '0')
  function when(ts) { const now = NOWF(), m = Math.floor((now - ts) / 60000), d = new Date(ts), t = new Date(now)
    if (m < 1) return 'сейчас'
    if (m < 60) return `${m} мин назад`
    if (d.toDateString() === t.toDateString()) return `${pad(d.getHours())}:${pad(d.getMinutes())}`
    return `${d.getDate()} ${MON[d.getMonth()]}` }

  // из базы: заголовок с разметкой {t:Команда}/{p:Ник} по упоминаниям; турнир — TI, если новость про него
  const reE = (x) => x.replace(/[.*+?^${}()|[\]\\~-]/g, (c) => '\\' + c)
  const tok = (n) => { let t = n.title; const al = [...n.teams.flatMap((id) => [...new Set([DBD.teams[id].name, DBD.teams[id].mid])].map((a) => [a, `{t:${DBD.teams[id].name}|${a}}`])), ...n.players.flatMap((id) => { const k = DBD.players[id].nick, b = k.replace(/[~^-]$/, ''); return [...new Set([k, b, b + '~', b + '-'])].map((a) => [a, `{p:${k}}`]) })]
      .filter(([a]) => a.length > 1).sort((a, b) => b[0].length - a[0].length)
    if (al.length) t = t.replace(new RegExp(`(?<![\\wА-Яа-яЁё{|:])(${al.map(([a]) => reE(a)).join('|')})(?![\\wА-Яа-яЁё}])`, 'g'), (x) => al.find(([a]) => a === x)[1]); return t }
  const fromDB = (n, extra = {}) => ({ id: n.id, ts: new Date(n.t).getTime(), tour: n.tours.includes(window.DB_TOUR || 'ti-2026') || (!window.DB_TOUR && /TI15|The International/i.test(n.title)) ? 'ti' : null, t: tok(n), lede: n.lede || n.title, main: [], img: n.img ? window.DB.url(n.img) : '', ...extra })
  if (DBM) { for (const k of Object.keys(PL)) delete PL[k]; for (const x of window.DB.playerStats(window.DB_TOUR || 'ti-2026')) { const p = DBD.players[x.player]; PL[p.nick] = [DBD.teams[x.team]?.name || '', x.heroes[0]?.hero || ''] } }
  // 05.11 (лаба w-match-news, дирижёр: «тут должны быть не новости турнира, а новости матча»): NW2_TEAMS = [id, id] — новости, где есть хоть одна из команд (до загрузки виджета)
  const DBN = DBM ? (window.NW2_TEAMS ? window.DB.news().filter((n) => window.NW2_TEAMS.some((id) => n.teams.includes(id))) : window.DB.news({ tour: window.DB_TOUR || 'ti-2026' })) : []
  const T0 = Date.now()
  let LIST = DBM ? DBN.slice(1, 16).map((n) => fromDB(n)) : N.map(([id, m, tour, t]) => { const n = REAL.find((x) => x.id === id); return { id, ts: T0 - m * 60000, tour, t, lede: n.lede, main: (n.main || []).length > 1 ? n.main : [], rich: RICH[id], img: (n.imgs || [])[0] || '' } })
  // 06.11 (созвон 06.11 §2.2, дирижёр: «внутри виджета маленький сегмент „Этот матч · Все“, как в виджетах на странице турнира»): o.seg — сегмент под шапкой;
  //   «Этот матч» — новости команд матча (NW2_TEAMS), «Все» — все новости базы; по матчу новостей нет — сразу «Все»
  const LISTS = { m: LIST, a: DBM && window.NW2_TEAMS ? window.DB.news().slice(1, 16).map((n) => fromDB(n)) : LIST }
  // «Кратко» — кнопка в духе «✦ Пикабу ИИ» (Pikabu-AI-prototype, pikabu-post-demo): переливается, открыта — серый круг ×
  // v42+ (o.btn = 'more'): вместо пилюли — тихая серая «Подробнее» под заголовком, без подложки; значок ✦ оживает при наведении (дирижёр 02.11)
  const MORE = '<button class="n2-more" data-brief type="button"><svg class="n2-more__i" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5c.4 2.9 1.6 4.1 4.5 4.5-2.9.4-4.1 1.6-4.5 4.5-.4-2.9-1.6-4.1-4.5-4.5 2.9-.4 4.1-1.6 4.5-4.5z" fill="currentColor"/><path class="n2-more__d" d="M13 10.5c.2 1.2.7 1.7 1.9 1.9-1.2.2-1.7.7-1.9 1.9-.2-1.2-.7-1.7-1.9-1.9 1.2-.2 1.7-.7 1.9-1.9z" fill="currentColor"/></svg><span class="n2-more__t">Подробнее</span></button>'
  // v46+ (o.icon): «Подробнее» белым, у каждой версии своя иконка и своя анимация при наведении — цвет, как у «✦ Пикабу ИИ» (дирижёр 02.11)
  const STAR = 'M8 1.5c.4 2.9 1.6 4.1 4.5 4.5-2.9.4-4.1 1.6-4.5 4.5-.4-2.9-1.6-4.1-4.5-4.5 2.9-.4 4.1-1.6 4.5-4.5z'
  const ICON = {
    spark: `<svg viewBox="0 0 16 16"><path class="i-a" d="${STAR}" transform="translate(0 2)"/></svg>`,
    twin: `<svg viewBox="0 0 16 16"><path class="i-a" d="${STAR}" transform="translate(-1 2) scale(.9)"/><g class="i-orb"><path class="i-b" d="M13 1c.2 1.1.6 1.5 1.7 1.7-1.1.2-1.5.6-1.7 1.7-.2-1.1-.6-1.5-1.7-1.7 1.1-.2 1.5-.6 1.7-1.7z"/></g></svg>`,
    doc: `<svg viewBox="0 0 16 16" fill="none" stroke-linecap="round"><rect class="i-d" x="2.5" y="1.5" width="11" height="13" rx="2.5"/><path class="i-l i-l1" d="M5.5 5.5h5"/><path class="i-l i-l2" d="M5.5 8h5"/><path class="i-l i-l3" d="M5.5 10.5h3"/></svg>`,
    orb: `<span class="i-orb2"><svg viewBox="0 0 16 16"><path d="${STAR}" transform="translate(2.4 3.4) scale(.7)" fill="#fff"/></svg></span>`,
  }
  const more = (ic) => ic ? `<button class="n2-more n2-mi n2-mi--${ic}" data-brief type="button"><span class="n2-mi__i" aria-hidden="true">${ICON[ic]}</span><span class="n2-more__t">Подробнее</span></button>` : MORE
  // общий градиент для иконок (один на страницу): плывёт по кругу
  const defs = () => document.getElementById('n2-defs') || document.body.insertAdjacentHTML('beforeend', '<svg id="n2-defs" width="0" height="0" style="position:absolute"><defs><linearGradient id="n2g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset=".3" stop-color="#b14bff"/><stop offset=".65" stop-color="#3a86ff"/><stop offset="1" stop-color="#3ddc84"/><animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="2.4s" repeatCount="indefinite"/></linearGradient></defs></svg>')
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', defs) : defs()
  const AI = '<button class="n2-ai" data-brief type="button" aria-label="Кратко"><span class="n2-ai__s">✦</span><span class="n2-ai__t">Кратко</span></button>'
  const brief = (n) => `<span class="n2-l">${mark(n.lede)}</span>${n.main.length ? `<ul class="n2-pts">${n.main.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}<a class="n2-go" href="#">Читать ›</a>`
  const row = (n, i, o) => { const im = o.pic === 'all' ? n.img || `../news/img/n${(i * 3) % 27}.jpg` : o.pic === 'none' ? '' : n.img
    const tr = n.tour && TOUR[n.tour].tier
    return `<div class="n2-r${im ? ' has-img' : ''}${n.fresh ? ' is-new' : ''}" data-id="${n.id}" tabindex="0" role="button" aria-expanded="false">`
      + `<span class="n2-b"><span class="n2-m"><time data-ts="${n.ts}">${when(n.ts)}</time>${n.fresh ? '<span class="n2-new">Новое</span>' : ''}${tr ? `<span class="t5-tier t5-tier--fill t5-tier--${tr}">Tier ${tr}</span>` : ''}${o.open && o.btn !== 'more' ? AI : ''}</span>`
      + `<span class="n2-t">${mark(n.t)}</span>` + (o.btn === 'more' && (o.open === 'pop' || o.open === 'sheet') ? more(o.icon) : '')
      + (o.open === 'pop' || o.open === 'sheet' ? '</span>' : `<span class="n2-x"><span class="n2-xi">${o.open ? '' : brief(n)}</span></span>${o.btn === 'more' ? more(o.icon) : ''}</span>`)
      + `${im ? `<img class="n2-im" src="${im}" alt="" loading="lazy">` : ''}</div>` }

  let timer, tick, O = {}, EL, POP
  if (DBM && DBN[0]) Object.assign(FRESH, fromDB(DBN[0], { id: 'fresh' }))
  const byId = (id) => (id === 'fresh' ? { ...FRESH, ts: NOWF() } : LIST.find((n) => n.id === id))
  // 06.11 v16 (дирижёр: «маленький переключатель справа в шапке вверху»): o.seg = 'hd' — сегмент справа в шапке вместо «Все новости ›»;
  //   v17 (дирижёр: «переход на все новости… делаем внизу такой же штукой, как у виджета MVP»): o.dock — «Все новости ›» строкой внизу, как «Взять в фэнтези» у MVP (.m4-dock)
  // v20 (дирижёр 06.11: «вот такой подложкой показываем все новости… кнопка внизу, внизу справа»): o.dock = 2 — «Все новости» подложкой из-под края виджета, как «Взять в фэнтези» у MVP (.m6-dock), стрелка справа
  const NX = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const SEGH = (o) => o.seg === 'hd'
  // v18 (дирижёр 06.11: «иконками, вот как здесь… логотипы команд, которые участвуют — в левую, вправо написать „Все“»): o.segi — слева лого двух команд матча, справа «Все»; выбранная — светлой плашкой
  // v19 (дирижёр 06.11: «криво и косо»): o.segi = 2 — кнопки по содержимому одной высоты, выбранная — серой плашкой (белая съедала светлые лого), невыбранные лого приглушены
  const SEGL = () => DBM && window.NW2_TEAMS ? `<span class="n2-sgl">${window.NW2_TEAMS.map((id) => { const l = LG(DBD.teams[id].name); return l ? `<img src="${l}" alt="">` : '' }).join('')}</span>` : 'Этот матч'
  const SEG = (o, c) => `<div class="n2-seg${c}${o.segi ? ' n2-seg--i' + (o.segi === 2 ? ' n2-seg--i2' : '') : ''}"><div class="t5-seg">${[['m', o.segi ? SEGL() : 'Этот матч'], ['a', 'Все']].map(([v, l]) => `<button class="${v === o.sc ? 'is-on' : ''}" data-nsc="${v}"${o.segi && v === 'm' ? ' aria-label="Этот матч" title="Этот матч"' : ''}>${l}</button>`).join('')}</div></div>`
  function render(el, o = {}) { o = { pic: 'mix', fresh: true, ...o }; O = o; EL = el
    if (o.seg) { if (!o.sc) o.sc = LISTS.m.length ? 'm' : 'a'; LIST = LISTS[o.sc] }
    clearTimeout(timer); clearInterval(tick); closePop()
    el.classList.toggle('is-phone', !!o.phone); el.classList.toggle('n2-hasdock', o.dock === 2)
    el.innerHTML = `<div class="w nw nf n2${o.open ? ' n2--' + o.open : ''}${o.btn ? ' n2--b-' + o.btn : ''}${o.even ? ' n2--even' : ''}${o.hl ? ' n2--hl-' + o.hl : ''}${o.ava ? ' n2--ava' : ''}${o.sq ? ' n2--sq' : ''}${o.sm ? ' n2--sm' : ''}${o.pad ? ' n2--even3' : ''}${o.calm ? ' n2--calm' : ''}${o.nodiv ? ' n2--nodiv' : ''}${o.gap ? ' n2--gap' : ''}${o.edge ? ' n2--edge' : ''}${o.fade ? ' n2--fade' + (o.fade === 2 ? ' n2--fade2' : '') + (o.fade === 'v' ? ' n2--fade2 n2--fadev' : '') + (o.fade === 'p' ? ' n2--fade2 n2--fadev n2--fadep' : '') : ''}${o.pl ? ' n2--pl-' + o.pl : ''}"><div class="w-hd"><span class="w-hd__t">Новости</span>${SEGH(o) ? '' : '<a class="nw-all" href="#">Все новости ›</a>'}${SEGH(o) ? SEG(o, ' n2-seg--hd') : ''}</div>${o.seg && !SEGH(o) ? SEG(o, '') : ''}<div class="nw-feed"><div class="nw-fl">${LIST.map((n, i) => row(n, i, o)).join('')}</div></div>${o.dock === true ? '<a class="n2-dock" href="#">Все новости <span aria-hidden="true">›</span></a>' : ''}${o.open === 'sheet' ? '<div class="n2-sh" aria-hidden="true"></div>' : ''}</div>${o.dock === 2 ? `<a class="n2-dock2" href="#"><span>Все новости</span>${NX}</a>` : ''}`
    const fl = el.querySelector('.nw-fl')
    // v27 (дирижёр 06.11: «чуть позже появлялась — когда первая новость уже зашла за край»): o.fadeLate — верхнее размытие начинает расти только после стольких px прокрутки; v28 o.fadeLateB — так же снизу: нижнее гаснет за столько px до конца
    // v21 (дирижёр 06.11: «без дивайдера» · «как в „Разборе“: при скролле, когда есть куда скроллить, небольшой лёгкий блюр»): o.nodiv — у шапки нет черты; o.fade — затемнение с размытием сверху (пролистали) и снизу (есть ещё)
    if (o.fade) { const fd = el.querySelector('.nw-feed'), w = el.querySelector('.w.n2')
      const up = () => { w.style.setProperty('--n2-ft', fd.offsetTop + 'px'); w.classList.toggle('n2-sc-top', fd.scrollTop > 2); w.classList.toggle('n2-sc-more', fd.scrollTop + fd.clientHeight < fd.scrollHeight - 2)
        if (o.fade === 'p') { const c = (v) => Math.max(0, Math.min(1, v / 32)).toFixed(2); w.style.setProperty('--n2-to', c(fd.scrollTop - (o.fadeLate || 0))); w.style.setProperty('--n2-bo', c(fd.scrollHeight - fd.clientHeight - fd.scrollTop - (o.fadeLateB || 0))) } }
      fd.addEventListener('scroll', up, { passive: true }); requestAnimationFrame(up); setTimeout(up, 600) }
    el.querySelector('.n2-seg')?.addEventListener('click', (e) => { const b = e.target.closest('[data-nsc]'); if (b && b.dataset.nsc !== o.sc) render(el, { ...o, sc: b.dataset.nsc, fresh: false }) })
    fl.addEventListener('click', (e) => { const ai = e.target.closest('[data-brief]'), r = e.target.closest('.n2-r')
      if (ai) { e.stopPropagation(); return open(fl, r, ai) }
      if (e.target.closest('a')) { e.preventDefault(); return }
      if (r && !o.open) toggle(fl, r) })
    fl.addEventListener('keydown', (e) => { const r = e.target.closest('.n2-r'); if (!o.open && r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(fl, r) } })
    el.querySelector('.n2-sh')?.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (!b) return; e.preventDefault()
      const go = b.dataset.go; if (go === 'back') return sheet(null); const rows = [...fl.querySelectorAll('.n2-r')], k = rows.findIndex((x) => x.dataset.id === EL._sh) + (go === 'next' ? 1 : -1); if (rows[k]) sheet(rows[k].dataset.id) })
    tick = setInterval(() => el.querySelectorAll('time[data-ts]').forEach((t) => { t.textContent = when(+t.dataset.ts) }), 20000)
    if (o.fresh) timer = setTimeout(() => {
      const n = { ...FRESH, ts: NOWF(), fresh: true }, tmp = document.createElement('div'); tmp.innerHTML = row(n, 0, { ...o, pic: 'none' })
      const r = tmp.firstChild
      if (o.calm) return calm(el, fl, r)
      fl.prepend(r); el.querySelector('.nw-feed').scrollTop = 0
      requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add('is-in')))
      setTimeout(() => r.classList.remove('is-new', 'is-in'), 600)
      setTimeout(() => r.classList.add('is-seen'), 10000) }, 3000) }
  // v69 (o.calm): новая новость не сдвигает ленту — встаёт выше видимого, сверху вылетает пилюля «↑ Новая новость»; нажал — лента плавно уезжает к ней; долистал до верха — пилюля уходит (дирижёр 02.11: «человек смотрит — не надо сдвигать ленту»)
  function calm(el, fl, r) { const feed = el.querySelector('.nw-feed'), w = el.querySelector('.n2')
    r.classList.remove('is-new'); fl.prepend(r); feed.scrollTop += r.offsetHeight
    let pill = w.querySelector('.n2-pill'); if (!pill) { pill = document.createElement('button'); pill.type = 'button'; pill.className = 'n2-pill'; w.append(pill)
      pill.addEventListener('click', () => feed.scrollTo({ top: 0, behavior: 'smooth' }))
      feed.addEventListener('scroll', () => { if (feed.scrollTop < 4 && pill.classList.contains('is-on')) { pill.classList.remove('is-on'); setTimeout(() => fl.querySelectorAll('.n2-r.is-new-c').forEach((x) => x.classList.add('is-seen')), 8000) } }, { passive: true }) }
    r.classList.add('is-new-c'); const k = fl.querySelectorAll('.n2-r.is-new-c:not(.is-seen)').length
    const AR = '<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10V2M2.5 5.5 6 2l3.5 3.5"/></svg>', txt = k > 1 ? k + ' новых' : 'Новая новость'
    // v70+ вид пилюли (o.pl): glass — тёмное стекло · ai — фиолетовый перелив · bar — полоса во всю ширину под шапкой · logos — лого команд из новой новости
    pill.innerHTML = O.pl === 'bar' ? `${AR}<span>${k > 1 ? k + ' новых новости' : 'Новая новость'}</span><b>Показать</b>`
      : O.pl === 'logos' ? `<span class="n2-pill__lg">${[LG('PARIVISION'), LG('Team Spirit')].map((l) => `<img src="${l}" alt="">`).join('')}</span>${txt}${AR}`
      : AR + txt
    requestAnimationFrame(() => pill.classList.add('is-on')) }
  // v37: клик по строке — раскрыта одна
  function toggle(fl, r) { const on = !r.classList.contains('is-open')
    fl.querySelectorAll('.n2-r.is-open').forEach((x) => { x.classList.remove('is-open'); x.setAttribute('aria-expanded', 'false') })
    if (on) { r.classList.add('is-open'); r.setAttribute('aria-expanded', 'true') } }

  // v38+: кнопка «✦ Кратко»; open — inline (на месте, курсор → проявляется) · type (на месте, печатает по словам, волна) · pop (карточка рядом) · sheet (шторка поверх ленты)
  function open(fl, r, ai) { if (O.reveal) return reveal(r, ai); const was = ai.classList.contains('is-on')
    fl.querySelectorAll('[data-brief].is-on').forEach((b) => b.classList.remove('is-on'))
    fl.querySelectorAll('.n2-r.is-open').forEach((x) => { x.classList.remove('is-open'); x.querySelector('.n2-xi') && clearTimeout(x._t) })
    closePop()
    if (O.open === 'sheet') return sheet(was ? null : r.dataset.id)
    if (was) return
    ai.classList.add('is-on'); const n = byId(r.dataset.id)
    if (O.open === 'pop') return pop(n, ai)
    const xi = r.querySelector('.n2-xi'); r.classList.add('is-open')
    if (O.open === 'type') return type(r, xi, n)
    xi.innerHTML = '<span class="n2-cur"></span>'; r._t = setTimeout(() => { xi.innerHTML = brief(n); xi.classList.remove('is-in'); requestAnimationFrame(() => xi.classList.add('is-in')) }, 600) }
  // печатает по словам: суть, потом пункты; внизу — волна, пока печатает
  function type(r, xi, n) { if (O.rich && n.rich) n = { ...n, lede: n.rich[0], main: n.rich[1] }; if (O.para && PARA[n.id]) n = { ...n, lede: PARA[n.id], main: [] }; if (O.para2 && PARA2[n.id]) n = { ...n, lede: PARA2[n.id], main: [] }; const words = esc(n.lede).split(' '), pts = n.main.slice(0, O.pts ?? 9).map(esc); let k = 0
    xi.innerHTML = `<span class="n2-l"><span class="n2-tw"></span><span class="n2-cur"></span></span><ul class="n2-pts"></ul><a class="n2-go" href="#" hidden>Читать ›</a><i class="n2-wave"></i>`
    const tw = xi.querySelector('.n2-tw'), ul = xi.querySelector('.n2-pts'), cur = xi.querySelector('.n2-cur'); r.classList.add('is-gen')
    const step = () => { if (!r.classList.contains('is-open')) return
      if (k < words.length) { tw.textContent = words.slice(0, ++k).join(' '); return (r._t = setTimeout(step, 45)) }
      const j = k - words.length
      if (j === 0) cur.remove()
      if (j < pts.length) { const li = document.createElement('li'); li.textContent = pts[j]; ul.append(li); k++; return (r._t = setTimeout(step, 260)) }
      xi.querySelector('.n2-go').hidden = false; r.classList.remove('is-gen'); tw.innerHTML = mark(n.lede) }
    r._t = setTimeout(step, 500) }
  // карточка рядом с виджетом (слева от него на компьютере, под строкой на телефоне)
  function pop(n, ai) { POP = document.createElement('div'); POP.className = 'w n2-pop'; POP._ai = ai
    const tr = n.tour && TOUR[n.tour].tier
    POP.innerHTML = `${n.img ? `<img class="n2-pop__im" src="${n.img}" alt="">` : ''}<div class="n2-pop__b"><span class="n2-m"><time data-ts="${n.ts}">${when(n.ts)}</time>${tr ? `<span class="t5-tier t5-tier--fill t5-tier--${tr}">Tier ${tr}</span>` : ''}<span class="n2-pop__k">✦ Кратко</span></span><b class="n2-t">${mark(n.t)}</b>${brief(n)}</div>`
    document.body.append(POP)
    const w = EL.querySelector('.n2').getBoundingClientRect(), b = ai.closest('.n2-r').getBoundingClientRect(), pw = 320, ph = POP.offsetHeight
    const left = w.left - pw - 12 > 8 ? w.left - pw - 12 : null
    if (left != null) { POP.style.left = left + 'px'; POP.style.top = Math.max(8, Math.min(b.top, innerHeight - ph - 8)) + 'px' }
    else { POP.classList.add('is-under'); POP.style.left = Math.max(8, w.left + 8) + 'px'; POP.style.width = Math.min(pw, w.width - 16) + 'px'; POP.style.top = Math.min(b.bottom + 4, innerHeight - ph - 8) + 'px' }
    requestAnimationFrame(() => POP.classList.add('is-on')) }
  function closePop() { if (!POP) return; POP._ai?.classList.remove('is-on'); POP.remove(); POP = null }
  document.addEventListener('pointerdown', (e) => { if (POP && !POP.contains(e.target) && !e.target.closest('[data-brief]')) closePop() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePop(); EL && O.open === 'sheet' && sheet(null) } })
  addEventListener('scroll', closePop, { passive: true })
  // шторка поверх ленты: ‹ Новости, новость целиком кратко, листать ‹ › по ленте
  function sheet(id) { const sh = EL.querySelector('.n2-sh'), fl = EL.querySelector('.nw-fl'); EL._sh = id
    fl.querySelectorAll('[data-brief]').forEach((b) => b.classList.toggle('is-on', b.closest('.n2-r').dataset.id === id))
    if (!id) { sh.classList.remove('is-on'); sh.setAttribute('aria-hidden', 'true'); return }
    const n = byId(id), tr = n.tour && TOUR[n.tour].tier, rows = [...fl.querySelectorAll('.n2-r')], k = rows.findIndex((x) => x.dataset.id === id)
    sh.innerHTML = `<div class="n2-sh__hd"><a href="#" data-go="back">‹ Новости</a><span class="n2-pop__k">✦ Кратко</span></div>`
      + `<div class="n2-sh__b">${n.img ? `<img class="n2-pop__im" src="${n.img}" alt="">` : ''}<span class="n2-m"><time data-ts="${n.ts}">${when(n.ts)}</time>${tr ? `<span class="t5-tier t5-tier--fill t5-tier--${tr}">Tier ${tr}</span>` : ''}</span><b class="n2-t">${mark(n.t)}</b>${brief(n)}</div>`
      + `<div class="n2-sh__ft"><a href="#" data-go="prev"${k ? '' : ' class="is-off"'}>‹</a><span>${k + 1} из ${rows.length}</span><a href="#" data-go="next"${k < rows.length - 1 ? '' : ' class="is-off"'}>›</a></div>`
    sh.classList.add('is-on'); sh.setAttribute('aria-hidden', 'false'); sh.querySelector('.n2-sh__b').scrollTop = 0 }
  // v50+ (o.reveal): раскрывается один раз и остаётся, «Свернуть» нет (дирижёр 02.11: «обновят страницу, если что»); кнопка дописывает строки и уходит.
  //   rise — строки выезжают по очереди · type — печатает по словам · skel — сначала строки-заготовки переливаются, потом текст · blur — текст проступает из размытия, по нему проходит цвет
  const stag = (n) => { let k = 0; const st = () => ` style="--i:${k++}"`
    return `<span class="n2-l"${st()}>${mark(n.lede)}</span>${n.main.length ? `<ul class="n2-pts">${n.main.map((x) => `<li${st()}>${esc(x)}</li>`).join('')}</ul>` : ''}<a class="n2-go" href="#"${st()}>Читать ›</a>` }
  function reveal(r, ai) { if (r.classList.contains('is-open')) return
    const n = byId(r.dataset.id), xi = r.querySelector('.n2-xi'), md = O.reveal
    ai.classList.add('is-on', 'is-gone'); r.classList.add('is-open', 'rv-' + md)
    if (md === 'type') return type(r, xi, n)
    if (md === 'skel') { xi.innerHTML = '<span class="n2-sk"><i></i><i></i><i style="width:60%"></i></span>'; r._t = setTimeout(() => { xi.innerHTML = stag(n); r.classList.add('is-done') }, 1100); return }
    xi.innerHTML = stag(n); requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add('is-done'))) }
  return { render }
})()
