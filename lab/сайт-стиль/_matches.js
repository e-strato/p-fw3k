/* Лаба «Сайт в одном стиле» — страницы «Расписание» (поток матчей по дням) и «Матч» (live) для всех 6 наборов (дирижёр 05.10).
   Данные общие (ниже), разметка — своя у каждого набора; расписание у наборов — разными способами (дирижёр: «нужны разные варианты»):
     Продукт (по умолчанию) — лента по дням: полоса недели сверху, дни подряд, внутри турниры; сбоку мои матчи недели;
     tablo — день таблицей, как у трекера: слева фильтры турниров, сверху полоса дат, строки ленты главной;
     coll  — матчи моих карт: дни подряд, матч с моими игроками — широкая карточка с их картами;
     hud   — календарь недели: 7 колонок-дней, матчи плитками; сегодня подсвечен;
     efir  — программа передач на неделю: строки — дни, колонки — часы, матчи — блоки эфира;
     esp   — лента LoL Esports: слева лиги, справа дни подряд рядами «тег · лого · счёт · лого · тег».
   Матч — Team Spirit — Tundra, карта 2 идёт: счёт серии, карты, трансляция, нетворс, составы 5 на 5, мои игроки и их очки, события, прогноз на карту 3.
   Матчи, составы и цифры — условные; сходятся с главной (DreamLeague S27, TS — TUN, К2 · 27:41, 1 : 0). */
(() => {
  const { лого, моно, картаF, ИГРОКИ, шапка, матчСтрокаГл } = САЙТ.h
  const фото = (ид) => `/p-fw3k/site/img/players/${(ид && ИГРОКИ[ид]?.фото) || '_silhouette.png'}`

  /* ───────── Данные ───────── */
  // Команды: [имя, тег, есть ли лого на сайте]
  const КОМ = {
    ts: ['Team Spirit', 'TS', 1], tun: ['Tundra Esports', 'TUN', 1], pv: ['PARIVISION', 'PV', 1], bb: ['BetBoom Team', 'BB', 1], gg: ['Gaimin Gladiators', 'GG', 1],
    flc: ['Team Falcons', 'FLC', 1], tl: ['Team Liquid', 'TL', 1], aur: ['Aurora', 'AUR', 1], yg: ['Yangon Galacticos', 'YG', 1],
    lvl: ['LVLUP', 'LVL'], lgd: ['LGD Gaming', 'LGD'], xg: ['Xtreme Gaming', 'XG'], hr: ['HEROIC', 'HR'], g2: ['G2 Esports', 'G2'], fnc: ['Fnatic', 'FNC'],
    w1: ['Победитель TS — TUN', '?'], w2: ['Победитель PV — BB', '?'], tbd: ['Определится', '?'],
  }
  const кЛ = (id) => (КОМ[id][2] ? лого(id) : моно(КОМ[id][1]))
  const кИ = (id) => КОМ[id][0]
  const кТ = (id) => КОМ[id][1]

  // Турниры: [имя, этап по умолчанию, формат, игра]
  const ТУРЫ = {
    dl: ['DreamLeague · Сезон 27', 'Плей-офф', 'Bo3', 'D2'],
    bl: ['BLAST Slam VIII', 'Группа A', 'Bo2', 'D2'],
    lec: ['LEC Summer', 'Финал верхней сетки', 'Bo5', 'LoL'],
  }
  // Неделя: [короткий день, дата, подпись, полное имя дня]
  const ДНИ = [
    ['Ср', '30 сен', 'Вчера', 'Вчера, 30 сентября'], ['Чт', '1 окт', 'Сегодня', 'Сегодня, 1 октября'], ['Пт', '2 окт', 'Завтра', 'Завтра, 2 октября'],
    ['Сб', '3 окт', '', 'Суббота, 3 октября'], ['Вс', '4 окт', '', 'Воскресенье, 4 октября'], ['Пн', '5 окт', '', 'Понедельник, 5 октября'], ['Вт', '6 окт', '', 'Вторник, 6 октября'],
  ]
  const СЕГОДНЯ = 1
  // Поток матчей недели: д — индекс дня, ч — час начала (для сеток по времени), ст — ft / live / up
  const ПОТОК = [
    { д: 0, t: '13:00', ч: 13, ст: 'ft', тур: 'bl', a: 'pv', b: 'lvl', sa: 2, sb: 0, мои: 1, итог: '+16.8' },
    { д: 0, t: '16:00', ч: 16, ст: 'ft', тур: 'bl', a: 'lgd', b: 'xg', sa: 1, sb: 1 },
    { д: 0, t: '17:00', ч: 17, ст: 'ft', тур: 'dl', a: 'flc', b: 'hr', sa: 2, sb: 0 },
    { д: 0, t: '19:00', ч: 19.5, ст: 'ft', тур: 'bl', a: 'yg', b: 'bb', sa: 0, sb: 2 },
    { д: 1, t: '13:00', ч: 13, ст: 'ft', тур: 'dl', a: 'gg', b: 'flc', sa: 2, sb: 1 },
    { д: 1, t: '15:30', ч: 15.5, ст: 'live', live: 'К2 · 27:41', тур: 'dl', a: 'ts', b: 'tun', sa: 1, sb: 0, мои: 3, прогноз: '60.5', это: 1 },
    { д: 1, t: '16:00', ч: 16, ст: 'live', live: 'К1 · 14:02', тур: 'bl', a: 'yg', b: 'lvl', sa: 0, sb: 0 },
    { д: 1, t: '18:00', ч: 18, ст: 'up', тур: 'dl', a: 'pv', b: 'bb', мои: 1, прогноз: '18.9' },
    { д: 1, t: '19:30', ч: 19.5, ст: 'up', тур: 'bl', a: 'lgd', b: 'xg' },
    { д: 1, t: '20:00', ч: 20, ст: 'up', тур: 'lec', a: 'g2', b: 'fnc' },
    { д: 1, t: '21:30', ч: 21.5, ст: 'up', тур: 'dl', a: 'tl', b: 'aur' },
    { д: 2, t: '15:00', ч: 15, ст: 'up', тур: 'bl', a: 'pv', b: 'lgd', мои: 1, прогноз: '17.2' },
    { д: 2, t: '16:00', ч: 16.5, ст: 'up', тур: 'dl', этап: 'Нижняя сетка', a: 'gg', b: 'bb' },
    { д: 2, t: '18:00', ч: 18, ст: 'up', тур: 'bl', a: 'yg', b: 'xg' },
    { д: 2, t: '19:30', ч: 19.5, ст: 'up', тур: 'dl', этап: 'Нижняя сетка', a: 'flc', b: 'tl' },
    { д: 3, t: '15:00', ч: 15, ст: 'up', тур: 'dl', этап: 'Полуфинал', a: 'w1', b: 'w2', мои: 3 },
    { д: 3, t: '18:00', ч: 18, ст: 'up', тур: 'bl', a: 'lvl', b: 'lgd' },
    { д: 4, t: '17:00', ч: 17, ст: 'up', тур: 'dl', этап: 'Гранд-финал', bo: 'Bo5', a: 'tbd', b: 'tbd' },
    { д: 6, t: '14:00', ч: 14, ст: 'up', тур: 'bl', этап: 'Плей-офф', a: 'tbd', b: 'tbd' },
    { д: 6, t: '17:00', ч: 17, ст: 'up', тур: 'bl', этап: 'Плей-офф', a: 'tbd', b: 'tbd' },
  ]
  const дня = (д) => ПОТОК.filter((м) => м.д === д)
  const мойДень = (д) => дня(д).filter((м) => м.мои).length
  const поТурнирам = (мм) => Object.keys(ТУРЫ).map((к) => [к, мм.filter((м) => м.тур === к)]).filter(([, x]) => x.length)
  const тур = (м) => ТУРЫ[м.тур][0]
  const этап = (м) => `${м.этап || ТУРЫ[м.тур][1]} · ${м.bo || ТУРЫ[м.тур][2]}`
  const статус = (м) => (м.ст === 'live' ? м.live : м.ст === 'ft' ? 'Итог' : м.t)
  const счёт = (м, разд = ' : ') => (м.ст === 'up' ? 'vs' : `${м.sa}${разд}${м.sb}`)
  // В строку ленты главной (матчСтрокаГл из _сайт.js)
  const вСтроку = (м) => ({ ст: м.ст, время: м.ст === 'live' ? м.live : м.ст === 'ft' ? 'Завершён' : м.t, a: [КОМ[м.a][2] ? м.a : '', кИ(м.a), м.ст === 'up' ? '' : м.sa], b: [КОМ[м.b][2] ? м.b : '', кИ(м.b), м.ст === 'up' ? '' : м.sb], мои: м.мои, прогноз: м.прогноз })

  // Матч: Team Spirit — Tundra, идёт карта 2
  const ГЕРОЙ = { faceless_void: 'Faceless Void', puck: 'Puck', mars: 'Mars', hoodwink: 'Hoodwink', tusk: 'Tusk', terrorblade: 'Terrorblade', storm_spirit: 'Storm Spirit', beastmaster: 'Beastmaster', rubick: 'Rubick', shadow_shaman: 'Shadow Shaman' }
  const СОСТАВ = {
    a: [
      { ник: 'Yatoro', ид: 'yatoro', поз: 1, г: 'faceless_void', k: 6, d: 1, a: 4, nw: 13.8, lh: 212, gpm: 702, о: 21.4, мой: 1 },
      { ник: 'Larl', поз: 2, г: 'puck', k: 5, d: 2, a: 7, nw: 11.2, lh: 168, gpm: 588, о: 18.2 },
      { ник: 'Collapse', ид: 'collapse', поз: 3, г: 'mars', k: 3, d: 4, a: 11, nw: 8.1, lh: 96, gpm: 431, о: 15.1, мой: 1 },
      { ник: 'Rue', ид: 'rue', поз: 4, г: 'hoodwink', k: 3, d: 2, a: 9, nw: 5.0, lh: 41, gpm: 312, о: 12.6 },
      { ник: 'Miposhka', ид: 'miposhka', поз: 5, г: 'tusk', k: 1, d: 2, a: 12, nw: 4.2, lh: 18, gpm: 256, о: 9.8 },
    ],
    b: [
      { ник: 'Pure', ид: 'pure', поз: 1, г: 'terrorblade', k: 5, d: 2, a: 3, nw: 14.6, lh: 248, gpm: 741, о: 24.0, мой: 1 },
      { ник: 'bzm', поз: 2, г: 'storm_spirit', k: 3, d: 4, a: 4, nw: 11.9, lh: 175, gpm: 603, о: 14.3 },
      { ник: '33', поз: 3, г: 'beastmaster', k: 1, d: 4, a: 6, nw: 7.6, lh: 88, gpm: 402, о: 9.1 },
      { ник: 'Saksa', поз: 4, г: 'rubick', k: 1, d: 4, a: 7, nw: 4.1, lh: 30, gpm: 281, о: 8.4 },
      { ник: 'Whitemon', поз: 5, г: 'shadow_shaman', k: 1, d: 4, a: 8, nw: 3.5, lh: 14, gpm: 238, о: 7.7 },
    ],
  }
  const МОИ_В_МАТЧЕ = [
    { ид: 'yatoro', сторона: 'a', разбор: [['Убийства', '6', '+12.0'], ['Смерти', '1', '−1.0'], ['Помощь', '4', '+4.0'], ['Добивания', '212', '+4.2'], ['Рошан', '1', '+2.2']] },
    { ид: 'pure', сторона: 'b', разбор: [['Убийства', '5', '+10.0'], ['Смерти', '2', '−2.0'], ['Помощь', '3', '+3.0'], ['Добивания', '248', '+5.0'], ['Башни', '2', '+8.0']] },
    { ид: 'collapse', сторона: 'a', разбор: [['Убийства', '3', '+6.0'], ['Смерти', '4', '−4.0'], ['Помощь', '11', '+11.0'], ['Добивания', '96', '+1.9'], ['Станы', '48 с', '+0.2']] },
  ]
  const игрокМатча = (ид) => [...СОСТАВ.a, ...СОСТАВ.b].find((и) => и.ид === ид)
  const ВСЕГО_МОИХ = '60.5'
  const КАРТЫ = [{ n: 1, ст: 'ft', поб: 'a', счёт: '34 : 21', длит: '38:12' }, { n: 2, ст: 'live', счёт: '18 : 11', длит: '27:41' }, { n: 3, ст: 'up' }]
  const ЦИФРЫ = [['Нетворс', '42.3k', '41.7k', 50.4], ['Убийства', '18', '11', 62], ['Башни', '5', '2', 71], ['Рошаны', '1', '0', 100], ['Опыт', '48.9k', '46.2k', 51.4]]
  // Перевес по нетворсу у Team Spirit, тыс. — по минутам карты 2 (0…27)
  const ГРАФ = [0, 0.1, 0.2, -0.3, -0.5, -0.8, -0.4, 0.2, 0.9, 1.4, 1.1, 0.6, -0.2, -1.3, -2.1, -1.8, -0.9, 0.4, 1.6, 2.8, 3.4, 2.2, 1.1, -0.4, -1.2, 0.3, 1.0, 0.6]
  // События карты 2: [минута, сторона, вид, что, подробно, очки моему игроку]
  const СОБЫТИЯ = [
    ['27:02', 'a', 'kill', 'Yatoro — тройное убийство', 'Faceless Void ловит троих в Chronosphere у Рошана', '+6.0'],
    ['25:40', 'a', 'tower', 'Team Spirit ломают T2 в центре', 'Перевес по башням 5 : 2'],
    ['24:31', 'a', 'rosh', 'Team Spirit берут Рошана', 'Аегис у Yatoro', '+2.2'],
    ['21:15', 'b', 'tower', 'Pure ломает T1 на нижней линии', 'Terrorblade сносит башню за 20 секунд', '+4.0'],
    ['18:48', 'a', 'kill', 'Collapse — Reverse Polarity на четверых', 'Драка 4 : 1 в пользу Team Spirit', '+4.0'],
    ['14:20', 'b', 'kill', 'Pure — двойное убийство', 'Terrorblade на нижней линии', '+4.0'],
    ['09:12', 'a', 'tower', 'Первая башня — Team Spirit', 'T1 на верхней линии'],
    ['04:37', 'a', 'fb', 'Первая кровь — Rue', 'Hoodwink ловит Saksa в лесу'],
  ]
  const ВОПРОСЫ = [
    ['Кто возьмёт карту 3?', [['Team Spirit', '58%', 1], ['Tundra', '42%']], '+50'],
    ['Первая кровь на карте 3', [['Spirit', '51%'], ['Tundra', '49%', 1]], '+30'],
    ['У Yatoro больше 8 убийств?', [['Да', '44%'], ['Нет', '56%']], '+40'],
  ]
  const ЭФИР = { кадр: () => превью(ВИДЕО[2].id), где: 'Twitch · RU · комментаторы Lex и Smile', зрит: '41 тыс.' }

  /* ───────── Общие куски — наборы собирают из них свои экраны ───────── */
  // Полоса недели: день, дата, число матчей, точка — есть мои игроки
  const неделя = (кл = '') => `<div class="m-week ${кл}">${ДНИ.map(([к, д, п], i) => { const n = дня(i).length; return `<button type="button" class="m-week__d${i === СЕГОДНЯ ? ' is-on' : ''}${n ? '' : ' is-empty'}"><small>${п || к}</small><b>${д}</b><em>${n ? `${n} ${n === 1 ? 'матч' : n < 5 ? 'матча' : 'матчей'}` : 'нет матчей'}</em>${мойДень(i) ? '<i class="a-star"></i>' : ''}</button>` }).join('')}</div>`

  // Карты серии
  const карты = (кл = '') => `<div class="m-maps ${кл}">${КАРТЫ.map((к) => `<div class="m-map m-map--${к.ст}"><small>Карта ${к.n}</small>${к.ст === 'ft' ? `<b>${кТ(к.поб === 'a' ? 'ts' : 'tun')} победа</b><span>${к.счёт} · ${к.длит}</span>` : к.ст === 'live' ? `<b><i class="a-dot"></i>Идёт · ${к.длит}</b><span>убийства ${к.счёт}</span>` : '<b>—</b><span>если понадобится</span>'}</div>`).join('')}</div>`

  // Сравнение команд по карте — полосы из главной (a-cmp)
  const сравнение = (n = 4) => `<div class="a-cmp">${ЦИФРЫ.slice(0, n).map(([k, a, b, p]) => `<div class="a-cmp__row"><b>${a}</b><span class="a-cmp__bar" style="--p: ${p}%"><i></i></span><small>${k}</small><span class="a-cmp__bar a-cmp__bar--b" style="--p: ${100 - p}%"><i></i></span><b>${b}</b></div>`).join('')}</div>`

  // График перевеса по нетворсу: выше нуля — Team Spirit, ниже — Tundra
  const граф = (h = 120) => {
    const W = 280, H = 80, max = 4, x = (i) => (i / (ГРАФ.length - 1)) * W, y = (v) => H / 2 - (v / max) * (H / 2)
    const точки = ГРАФ.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
    const зона = (знак) => `M0,${H / 2} ${ГРАФ.map((v, i) => `L${x(i).toFixed(1)},${y(знак > 0 ? Math.max(v, 0) : Math.min(v, 0)).toFixed(1)}`).join(' ')} L${W},${H / 2} Z`
    return `<div class="m-graph" style="--h: ${h}px"><div class="m-graph__l"><span>${лого('ts')}+4k</span><span>${лого('tun')}+4k</span></div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Перевес по нетворсу"><path class="m-graph__a" d="${зона(1)}" /><path class="m-graph__b" d="${зона(-1)}" /><line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" /><polyline points="${точки}" /></svg>
      <div class="m-graph__x">${[0, 10, 20, 27].map((m) => `<i style="left: ${(m / 27) * 100}%">${m}:00</i>`).join('')}</div></div>`
  }

  // Состав одной команды таблицей
  const состав = (с, { кол = 'полный' } = {}) => {
    const полный = кол === 'полный'
    return `<div class="m-sb${полный ? '' : ' m-sb--short'}">
      <div class="m-sb__r m-sb__r--h"><span>${кЛ(с === 'a' ? 'ts' : 'tun')}<b>${кИ(с === 'a' ? 'ts' : 'tun')}</b></span><span>K / D / A</span><span>Нетворс</span>${полный ? '<span>Добив.</span><span>GPM</span>' : ''}<span>Очки</span></div>
      ${СОСТАВ[с].map((и) => `<div class="m-sb__r${и.мой ? ' is-mine' : ''}"><span class="m-sb__who"><img class="a-hero" src="${героиКартинка(и.г)}" alt="" /><span><b>${и.мой ? '<i class="a-star"></i>' : ''}${и.ник}</b><small>${ГЕРОЙ[и.г]} · поз. ${и.поз}</small></span></span><span class="a-kda">${и.k} / ${и.d} / ${и.a}</span><span>${и.nw}k</span>${полный ? `<span>${и.lh}</span><span>${и.gpm}</span>` : ''}<em>${и.о.toFixed(1)}</em></div>`).join('')}
    </div>`
  }

  // Мои игроки в матче: фото, герой, очки сейчас и откуда они
  const мои = ({ разбор = true } = {}) => МОИ_В_МАТЧЕ.map(({ ид, сторона, разбор: р }) => { const и = игрокМатча(ид); return `
    <div class="m-my">
      <span class="m-my__ph"><img src="${фото(ид)}" alt="" /><img class="m-my__hero" src="${героиКартинка(и.г)}" alt="" /></span>
      <span class="m-my__who"><b>${и.ник}</b><small>${кТ(сторона === 'a' ? 'ts' : 'tun')} · ${ГЕРОЙ[и.г]} · ${и.k} / ${и.d} / ${и.a}</small></span>
      <span class="m-my__p"><b>${и.о.toFixed(1)}</b><small>очков</small></span>
      ${разбор ? `<div class="m-my__br">${р.map(([k, v, o]) => `<span><small>${k} ${v}</small><em class="${o.startsWith('−') ? 'is-down' : ''}">${o}</em></span>`).join('')}</div>` : ''}
    </div>` }).join('')

  // Лента событий карты
  const события = (n = СОБЫТИЯ.length) => `<ol class="m-ev">${СОБЫТИЯ.slice(0, n).map(([t, с, вид, что, подр, о]) => `<li class="m-ev__i m-ev__i--${с}"><time>${t}</time><i class="m-ev__ic m-ev__ic--${вид}"></i><span><b>${что}</b><small>${подр}</small></span>${о ? `<em>${о}</em>` : ''}</li>`).join('')}</ol>`

  // Прогноз на карту 3 — вопросы из онбординга (a-qq)
  const прогноз = () => `<div class="a-qs">${ВОПРОСЫ.map(([в, вар, н], i) => `
    <div class="a-qq"><span class="a-qq__n">${i + 1}</span><b>${в}</b><div class="a-qq__opts">${вар.map(([t, p, вкл]) => `<button type="button" class="js-pick${вкл ? ' is-on' : ''}" aria-pressed="${вкл ? 'true' : 'false'}"><span>${t}</span><em>${p}</em></button>`).join('')}</div><em class="a-qq__r">${н}</em></div>`).join('')}</div>`

  // Кадр трансляции
  const трансляция = (кл = '') => `<div class="m-tv ${кл}"><img src="${ЭФИР.кадр()}" alt="" loading="lazy" /><i class="a-vid__play"></i>
    <span class="m-tv__live"><i class="a-dot"></i>Live · ${ЭФИР.зрит} зрителей</span><span class="m-tv__src">${ЭФИР.где}</span></div>`

  /* ───────── Продукт (по умолчанию) ───────── */
  const расписание = () => `
<div class="ap ap--sch">${шапка('Матчи')}
<main class="a-page m-sch">
  <div class="m-sch__head"><div><h1 class="a-h1 a-h1--page">Матчи</h1><p class="a-lead">Все матчи недели. Прогноз открыт до начала, очки твоих игроков считаются по ходу карты.</p></div>
    <div class="a-chips"><button type="button" aria-pressed="true">Все</button><button type="button">Live · 2</button><button type="button">Мои игроки</button><button type="button">Dota 2</button><button type="button">LoL</button></div></div>
  ${неделя()}
  <div class="m-sch__grid">
    <div class="m-sch__main">
      <a class="m-more">Показать вчера · ${дня(0).length} матча, твои игроки набрали +16.8</a>
      ${[1, 2, 3, 4].map((д) => `<section class="a-panel a-ml m-day"><div class="a-ph"><h3>${ДНИ[д][3]}</h3><span class="a-muted">${дня(д).length} ${дня(д).length === 1 ? 'матч' : 'матча'}${мойДень(д) ? ` · с твоими игроками — ${мойДень(д)}` : ''}</span></div>
        ${поТурнирам(дня(д)).map(([к, мм]) => `<div class="a-tour"><span class="a-tour__g">${ТУРЫ[к][3]}</span><b>${ТУРЫ[к][0]}</b><small>${этап(мм[0])}</small><span class="a-tour__n">${мм.length}</span></div>${мм.map((м) => матчСтрокаГл(вСтроку(м))).join('')}`).join('')}</section>`).join('')}
    </div>
    <aside class="m-sch__side">
      <section class="a-panel"><div class="a-ph"><h3>Твои матчи на неделе</h3><span class="a-muted">${ПОТОК.filter((м) => м.мои && м.д >= СЕГОДНЯ).length}</span></div>
        ${ПОТОК.filter((м) => м.мои && м.д >= СЕГОДНЯ).map((м) => `<div class="m-wk"><span class="m-wk__d"><b>${ДНИ[м.д][2] || ДНИ[м.д][0]}</b><small>${м.ст === 'live' ? '<i class="a-dot"></i>live' : м.t}</small></span><span><b>${кТ(м.a)} — ${кТ(м.b)}</b><small>${тур(м)}</small></span><em><i class="a-star"></i>${м.мои}</em></div>`).join('')}</section>
      <section class="a-panel"><div class="a-ph"><h3>Турниры недели</h3></div>
        ${[['DreamLeague · Сезон 27', 'Плей-офф', 'до 4 окт', 62], ['BLAST Slam VIII', 'Группа A', 'до 12 окт', 30], ['LEC Summer', 'Плей-офф · LoL', 'до 5 окт', 80]].map(([t, s, д, p]) => `<div class="m-tr"><span><b>${t}</b><small>${s} · ${д}</small></span><span class="a-bar" style="--p: ${p}%"><i></i></span></div>`).join('')}</section>
      <section class="a-panel a-acc"><div class="a-ph"><h3>Сундук точности</h3><span class="a-muted">4 из 15</span></div>
        <div class="a-acc__seg">${Array.from({ length: 15 }, (_, i) => `<i${i < 4 ? ' class="is-on"' : ''}></i>`).join('')}</div><p class="a-acc__t">Ещё 11 верных прогнозов — <b>сундук Prism</b></p></section>
    </aside>
  </div>
</main></div>`

  const крошки = (последнее = 'Team Spirit — Tundra') => `<div class="a-crumbs"><a class="a-link">Матчи</a><i>/</i><a class="a-link">DreamLeague · Сезон 27</a><i>/</i><span>${последнее}</span></div>`

  const матч = () => `
<div class="ap ap--match">${шапка('Матчи')}
<main class="a-page m-match">
  ${крошки()}
  <section class="a-panel a-feat m-hero">
    <div class="a-feat__top"><span class="a-live"><i class="a-dot"></i>Live</span><span class="a-feat__league">DreamLeague · Сезон 27 · Плей-офф · Верхняя сетка · Bo3</span><span class="a-feat__clock">Карта 2 · 27:41</span></div>
    <div class="a-feat__teams">
      <div class="a-feat__team">${лого('ts')}<span><b>Team Spirit</b><small>2 твоих игрока · Yatoro, Collapse</small></span></div>
      <div class="a-feat__score"><b>1</b><i>:</i><b>0</b><small>серия · до двух побед</small></div>
      <div class="a-feat__team a-feat__team--r">${лого('tun')}<span><b>Tundra Esports</b><small>1 твой игрок · Pure</small></span></div>
    </div>
    ${карты()}
  </section>
  <div class="m-match__grid">
    <div class="m-match__main">
      <section class="a-panel"><div class="a-ph"><h3>Трансляция</h3><a class="a-link">Открыть на Twitch →</a></div>${трансляция()}</section>
      <section class="a-panel"><div class="a-ph"><h3>Карта 2 · 27:41</h3><span class="a-muted">Team Spirit впереди по башням и убийствам</span></div>
        <div class="m-duo">${сравнение(5)}${граф(150)}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Составы</h3><span class="a-muted">карта 2 · очки Fantasy считаются по ходу</span></div>
        <div class="m-teams">${состав('a')}${состав('b')}</div></section>
    </div>
    <aside class="m-match__side">
      <section class="a-panel m-myp"><div class="a-ph"><h3>Твои игроки в матче</h3><span class="m-sum"><b>+${ВСЕГО_МОИХ}</b> очков</span></div>${мои()}</section>
      <section class="a-panel"><div class="a-ph"><h3>Прогноз на карту 3</h3><span class="a-muted">до начала карты</span></div>${прогноз()}
        <button type="button" class="a-btn a-btn--pri m-wide">Отправить прогноз</button></section>
      <section class="a-panel"><div class="a-ph"><h3>События карты 2</h3></div>${события(6)}</section>
    </aside>
  </div>
</main></div>`

  window.МАТЧИ = {
    расписание, матч,
    что: { расписание: 'Лента по дням: полоса недели, дни подряд, внутри турниры; сбоку твои матчи недели', матч: 'Live: счёт серии и карты, трансляция, нетворс, составы 5 на 5, твои игроки и их очки, прогноз на карту 3' },
  }

  /* ════════════ 1 · ТАБЛО ════════════ */
  const { шапкаHUD, рельс, шапкаЭфир, отсчёт, шапкаЕсп, стрелка, рядЕсп } = САЙТ.h
  const L = window.РАСКЛАДКИ || {}
  const добавить = (ключ, части) => { if (!L[ключ]) return; const { что, ...экр } = части; Object.assign(L[ключ], экр); L[ключ].что = { ...L[ключ].что, ...что } }

  добавить('tablo', {
    что: { расписание: 'День таблицей, как у трекера: слева фильтры турниров, сверху полоса дат, строки — как в ленте главной', матч: 'Сначала цифры: компактная шапка со счётом, вкладки, полные таблицы составов; сбоку карты, события, прогноз' },
    расписание: () => `
<div class="ap ap--sch">${шапка('Матчи')}
<main class="a-page m1-sch">
  <aside class="m1-flt">
    <section class="a-panel"><div class="a-ph"><h3>Игра</h3></div>${[['Dota 2', 17, 1], ['LoL', 1, 1], ['CS 2', 0]].map(([t, n, вкл]) => `<label class="m1-ck${вкл ? ' is-on' : ''}"><i></i><span>${t}</span><em>${n}</em></label>`).join('')}</section>
    <section class="a-panel"><div class="a-ph"><h3>Турниры</h3></div>${Object.entries(ТУРЫ).map(([к, [t, s]]) => `<label class="m1-ck is-on"><i></i><span>${t}<small>${s}</small></span><em>${ПОТОК.filter((м) => м.тур === к).length}</em></label>`).join('')}</section>
    <section class="a-panel"><label class="m1-ck"><i></i><span>Только мои игроки</span><em>5</em></label><label class="m1-ck"><i></i><span>Скрыть завершённые</span></label></section>
  </aside>
  <div class="m1-sch__main">
    <div class="m1-dates">${ДНИ.map(([к, д, п], i) => `<button type="button" class="${i === СЕГОДНЯ ? 'is-on' : ''}"><b>${п || к}</b><small>${д}</small><em>${дня(i).length || '—'}</em></button>`).join('')}</div>
    <section class="a-panel a-ml">
      <div class="a-ph"><h3>${ДНИ[СЕГОДНЯ][3]}</h3><div class="a-chips"><button type="button" aria-pressed="true">Все · 7</button><button type="button">Live · 2</button><button type="button">Скоро · 4</button><button type="button">Завершённые · 1</button></div></div>
      <div class="l1-cols"><span>Матч</span><span>Мои</span><span>Прогноз</span><span></span><span>Время</span></div>
      ${поТурнирам(дня(СЕГОДНЯ)).map(([к, мм]) => `<div class="a-tour"><span class="a-tour__g">${ТУРЫ[к][3]}</span><b>${ТУРЫ[к][0]}</b><small>${этап(мм[0])}</small><span class="a-tour__n">${мм.length}</span></div>${мм.map((м) => матчСтрокаГл(вСтроку(м))).join('')}`).join('')}
    </section>
    <section class="a-panel a-ml">
      <div class="a-ph"><h3>${ДНИ[2][3]}</h3><span class="a-muted">${дня(2).length} матча</span></div>
      ${поТурнирам(дня(2)).map(([к, мм]) => `<div class="a-tour"><span class="a-tour__g">${ТУРЫ[к][3]}</span><b>${ТУРЫ[к][0]}</b><small>${этап(мм[0])}</small><span class="a-tour__n">${мм.length}</span></div>${мм.map((м) => матчСтрокаГл(вСтроку(м))).join('')}`).join('')}
    </section>
  </div>
</main></div>`,

    матч: () => `
<div class="ap ap--match">${шапка('Матчи')}
<main class="a-page m1-match">
  <section class="a-panel m1-head">
    <span class="m1-head__t">${лого('ts')}<b>Team Spirit</b></span>
    <span class="m1-head__s"><b>1</b><i>:</i><b>0</b></span>
    <span class="m1-head__t m1-head__t--r"><b>Tundra Esports</b>${лого('tun')}</span>
    <span class="m1-head__info"><span class="a-live"><i class="a-dot"></i>Карта 2 · 27:41</span><small>DreamLeague S27 · Плей-офф · Bo3</small></span>
    ${карты('m1-maps')}
  </section>
  <nav class="a-subnav">${['Обзор', 'Составы', 'Статистика', 'Прогноз', 'Трансляция', 'Очная история'].map((t, i) => `<a${i === 0 ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="m1-match__grid">
    <div class="m1-match__main">
      <section class="a-panel m1-tbl">${состав('a')}</section>
      <section class="a-panel m1-tbl">${состав('b')}</section>
      <section class="a-panel"><div class="a-ph"><h3>Карта 2 · сравнение</h3><span class="a-muted">нетворс по минутам</span></div><div class="m-duo">${сравнение(5)}${граф(120)}</div></section>
    </div>
    <aside class="m1-match__side">
      <section class="a-panel"><div class="a-ph"><h3>Мои игроки</h3><span class="m-sum"><b>+${ВСЕГО_МОИХ}</b></span></div>${мои({ разбор: false })}</section>
      <section class="a-panel"><div class="a-ph"><h3>Кто возьмёт карту 3?</h3><span class="a-muted">+50 монет</span></div>
        <div class="a-vote"><button type="button" class="js-pick" aria-pressed="true">Spirit <b>58%</b></button><button type="button" class="js-pick" aria-pressed="false">Tundra <b>42%</b></button></div></section>
      <section class="a-panel"><div class="a-ph"><h3>События</h3></div>${события()}</section>
      <section class="a-panel"><div class="a-ph"><h3>Очные встречи</h3><span class="a-muted">последние 5</span></div>
        ${[['24.08', 'TI 2026 · полуфинал', '2 : 1', 'a'], ['12.07', 'EWC 2026 · группа', '0 : 2', 'b'], ['30.05', 'DreamLeague S26', '2 : 0', 'a'], ['18.04', 'PGL Wallachia', '1 : 2', 'b'], ['02.03', 'BLAST Slam VII', '2 : 1', 'a']].map(([д, t, с, п]) => `<div class="m1-h2h"><span class="a-muted">${д}</span><b>${t}</b><em class="${п === 'a' ? 'is-w' : 'is-l'}">${с}</em></div>`).join('')}</section>
    </aside>
  </div>
</main></div>`,
  })

  /* ════════════ 3 · КОЛЛЕКЦИЯ ════════════ */
  // Игрок матча → id мини-карты (у кого карта есть в коллекции)
  const МОИ_КАРТЫ = { ts: ['yatoro', 'collapse'], tun: ['pure'], pv: ['9class'], w1: ['yatoro', 'pure'], w2: ['9class'] }
  добавить('coll', {
    что: { расписание: 'Матчи моих карт: дни подряд, матч с моими игроками — широкая карточка с их картами и прогнозом очков', матч: 'Сначала мои карты: в шапке матча — карты игроков с очками сейчас, ниже трансляция, нетворс и составы с фото' },
    расписание: () => `
<div class="ap ap--sch">${шапка('Матчи')}
<main class="a-page m3-sch">
  <div class="m3-sch__head"><div><h1 class="a-h1">Матчи твоих карт</h1><p class="a-lead">5 матчей с твоими игроками на неделе. Карта играет — приносит очки.</p></div>
    <div class="a-seg a-seg--lg"><button type="button" aria-pressed="true">Сначала мои</button><button type="button" aria-pressed="false">Все матчи · ${ПОТОК.length}</button></div></div>
  ${неделя('m3-week')}
  ${[1, 2, 3].map((д) => `<h3 class="l3-h">${ДНИ[д][3]}</h3>
  <div class="m3-day">${дня(д).sort((x, y) => (y.мои ? 1 : 0) - (x.мои ? 1 : 0)).map((м) => м.мои ? `
    <article class="a-panel m3-big m3-big--${м.ст}">
      <div class="m3-big__info"><small>${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${статус(м)} · ${тур(м)}</small>
        <div class="l3-mc__t"><span>${кЛ(м.a)}<b>${кИ(м.a)}</b></span><strong>${счёт(м)}</strong><span>${кЛ(м.b)}<b>${кИ(м.b)}</b></span></div>
        <div class="m3-big__acts"><span class="a-tag">${м.ст === 'live' ? `+${ВСЕГО_МОИХ} очков сейчас` : (м.прогноз ? `прогноз ${м.прогноз} очка` : 'прогноз — после жеребьёвки')}</span><button type="button" class="a-btn a-btn--sm${м.ст === 'live' ? ' a-btn--pri' : ''}">${м.ст === 'live' ? 'Смотреть' : 'Прогноз'}</button></div></div>
      <div class="m3-big__cards">${(МОИ_КАРТЫ[м.a] || []).concat(МОИ_КАРТЫ[м.b] || []).slice(0, 3).map((ид) => картаF(ид, 112)).join('')}</div>
    </article>` : `
    <div class="a-panel l3-mc l3-mc--${м.ст}"><small>${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${статус(м)} · ${тур(м)}</small><div class="l3-mc__t"><span>${кЛ(м.a)}<b>${кИ(м.a)}</b></span><strong>${счёт(м)}</strong><span>${кЛ(м.b)}<b>${кИ(м.b)}</b></span></div></div>`).join('')}</div>`).join('')}
</main></div>`,

    матч: () => `
<div class="ap ap--match">${шапка('Матчи')}
<main class="a-page m3-match">
  ${крошки()}
  <section class="m3-hero">
    <div class="m3-hero__sc">
      <span class="a-live"><i class="a-dot"></i>Live · Карта 2 · 27:41</span>
      <div class="l3-mc__t m3-hero__t"><span>${лого('ts')}<b>Team Spirit</b></span><strong>1 : 0</strong><span>${лого('tun')}<b>Tundra Esports</b></span></div>
      <small class="a-muted">DreamLeague · Сезон 27 · Плей-офф · Bo3</small>
      ${карты()}
    </div>
    <div class="m3-hero__cards">${МОИ_В_МАТЧЕ.map(({ ид }) => { const и = игрокМатча(ид); return `<div class="m3-hc">${картаF(ид, 158)}<span><b>${и.о.toFixed(1)}</b> очков</span><small>${ГЕРОЙ[и.г]} · ${и.k} / ${и.d} / ${и.a}</small></div>` }).join('')}
      <div class="m3-hero__sum"><b>+${ВСЕГО_МОИХ}</b><small>очков у твоих карт за матч</small></div></div>
  </section>
  <div class="l3-row m3-row">
    <section class="a-panel"><div class="a-ph"><h3>Трансляция</h3></div>${трансляция()}</section>
    <section class="a-panel"><div class="a-ph"><h3>Карта 2</h3></div>${сравнение(4)}${граф(110)}</section>
    <section class="a-panel"><div class="a-ph"><h3>Прогноз на карту 3</h3></div>${прогноз()}</section>
  </div>
  <div class="m3-rost">${['a', 'b'].map((с) => `<section class="a-panel"><div class="a-ph">${кЛ(с === 'a' ? 'ts' : 'tun')}<h3>${кИ(с === 'a' ? 'ts' : 'tun')}</h3><span class="a-muted">нетворс ${с === 'a' ? '42.3k' : '41.7k'}</span></div>
    ${СОСТАВ[с].map((и) => `<div class="m3-pr${и.мой ? ' is-mine' : ''}"><span class="l-ph"><img src="${фото(и.ид)}" alt="" /></span><span><b>${и.ник}</b><small>${ГЕРОЙ[и.г]} · поз. ${и.поз}</small></span><img class="a-hero" src="${героиКартинка(и.г)}" alt="" /><span class="a-kda">${и.k} / ${и.d} / ${и.a}</span><em>${и.о.toFixed(1)}</em></div>`).join('')}</section>`).join('')}</div>
  <section class="a-panel"><div class="a-ph"><h3>События карты 2</h3></div>${события()}</section>
</main></div>`,
  })

  /* ════════════ 5 · HUD ════════════ */
  // Мини-карта: башни (центральная симметрия Radiant ↔ Dire) и герои точками
  const БАШНИ = [[9, 30, 0], [9, 50, 1], [9, 72, 1], [40, 60, 1], [30, 70, 1], [20, 80, 1], [70, 91, 0], [50, 91, 1], [28, 91, 1]]
  const ПАЛИ = { b: [0, 1, 1, 0, 0, 1, 0, 0, 1] } // у Dire сломаны T1 верх, T1 и T2 центр, T1 и T2 низ — 5 башен
  const ГЕРОИ_НА_КАРТЕ = { a: [[62, 38], [55, 45], [66, 30], [48, 52], [58, 42]], b: [[80, 22], [74, 18], [84, 30], [78, 12], [88, 16]] }
  const миникарта = () => `<div class="m5-mm">
    <i class="m5-mm__river"></i><i class="m5-mm__base m5-mm__base--a"></i><i class="m5-mm__base m5-mm__base--b"></i>
    ${БАШНИ.map(([x, y, жива]) => `<i class="m5-mm__tw m5-mm__tw--a${жива ? '' : ' is-dead'}" style="left: ${x}%; top: ${y}%"></i>`).join('')}
    ${БАШНИ.map(([x, y], i) => `<i class="m5-mm__tw m5-mm__tw--b${ПАЛИ.b[i] ? '' : ' is-dead'}" style="left: ${100 - x}%; top: ${100 - y}%"></i>`).join('')}
    ${['a', 'b'].map((с) => ГЕРОИ_НА_КАРТЕ[с].map(([x, y], i) => `<span class="m5-mm__h m5-mm__h--${с}" style="left: ${x}%; top: ${y}%"><img src="${героиКартинка(СОСТАВ[с][i].г)}" alt="" /></span>`).join('')).join('')}
    <i class="m5-mm__rosh"></i></div>`
  добавить('hud', {
    что: { расписание: 'Календарь недели: 7 колонок-дней, матчи плитками, сегодня подсвечен; снизу — твои матчи недели', матч: 'Как верхняя панель Доты: герои 5 на 5 и таймер; мини-карта с башнями, твои игроки, прогноз и полная таблица' },
    расписание: () => `
<div class="ap ap--sch">${шапкаHUD()}
<div class="l5-shell">${рельс('Матчи')}
<main class="a-page m5-sch">
  <div class="l5-sq__h"><h3>Неделя матчей · 30 сен — 6 окт</h3><span class="a-muted">${ПОТОК.length} матчей · твои игроки в ${ПОТОК.filter((м) => м.мои).length}</span><div class="a-chips"><button type="button" aria-pressed="true">Неделя</button><button type="button">День</button><button type="button">Только мои</button></div></div>
  <div class="m5-cal">${ДНИ.map(([к, д, п], i) => `<div class="m5-cal__col${i === СЕГОДНЯ ? ' is-now' : ''}${i < СЕГОДНЯ ? ' is-past' : ''}">
    <div class="m5-cal__h"><b>${к}</b><span>${д}</span>${п ? `<small>${п}</small>` : ''}</div>
    ${дня(i).length ? дня(i).map((м) => `<div class="m5-tile m5-tile--${м.ст}${м.мои ? ' is-mine' : ''}"><small>${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${статус(м)}</small><span>${кЛ(м.a)}<b>${кТ(м.a)}</b><em>${м.ст === 'up' ? '' : м.sa}</em></span><span>${кЛ(м.b)}<b>${кТ(м.b)}</b><em>${м.ст === 'up' ? '' : м.sb}</em></span><i>${ТУРЫ[м.тур][0].split(' ·')[0]}${м.мои ? ` · ★${м.мои}` : ''}</i></div>`).join('') : '<p class="m5-cal__empty">Матчей нет</p>'}
  </div>`).join('')}</div>
  <section class="a-panel"><div class="a-ph"><h3>Твои матчи недели</h3><span class="a-muted">состав закроется перед первым матчем дня</span></div>
    <div class="m5-mine">${ПОТОК.filter((м) => м.мои && м.д >= СЕГОДНЯ).map((м) => `<div class="m5-mine__i${м.ст === 'live' ? ' is-live' : ''}"><small>${ДНИ[м.д][2] || ДНИ[м.д][0] + ' ' + ДНИ[м.д][1]} · ${м.ст === 'live' ? 'идёт' : м.t}</small><span>${кЛ(м.a)}<b>${кТ(м.a)}</b><i>vs</i><b>${кТ(м.b)}</b>${кЛ(м.b)}</span><em>★ ${м.мои} · ${м.прогноз ? `${м.прогноз} очк.` : 'прогноз позже'}</em></div>`).join('')}</div></section>
</main></div></div>`,

    матч: () => `
<div class="ap ap--match">${шапкаHUD()}
<div class="l5-shell">${рельс('Матчи')}
<main class="a-page m5-match">
  <section class="m5-top">
    <div class="m5-top__side">${СОСТАВ.a.map((и) => `<span class="m5-por${и.мой ? ' is-mine' : ''}"><img src="${героиКартинка(и.г)}" alt="" /><small>${и.ник}</small></span>`).join('')}</div>
    <div class="m5-top__mid"><span class="m5-top__k">18</span><span class="m5-top__clock"><b>27:41</b><small>Карта 2 · серия 1 : 0</small></span><span class="m5-top__k">11</span></div>
    <div class="m5-top__side m5-top__side--r">${СОСТАВ.b.map((и) => `<span class="m5-por${и.мой ? ' is-mine' : ''}"><img src="${героиКартинка(и.г)}" alt="" /><small>${и.ник}</small></span>`).join('')}</div>
    <div class="m5-top__names"><span>${лого('ts')}<b>Team Spirit</b></span><small>DreamLeague S27 · Плей-офф · Bo3</small><span><b>Tundra Esports</b>${лого('tun')}</span></div>
  </section>
  <div class="m5-match__grid">
    <section class="a-panel"><h3 class="m5-h">Твои игроки</h3><div class="m5-big"><b>+${ВСЕГО_МОИХ}</b><small>очков за матч</small></div>${мои()}</section>
    <section class="a-panel m5-center"><div class="a-ph"><h3>Мини-карта</h3><span class="a-muted">стоят башен 7 : 4 · Рошан у Spirit</span></div>${миникарта()}${граф(90)}</section>
    <div class="m5-right">
      <section class="a-panel"><div class="a-ph"><h3>Прогноз на карту 3</h3></div>${прогноз()}<button type="button" class="a-btn a-btn--pri m-wide">Отправить</button></section>
      <section class="a-panel"><div class="a-ph"><h3>Журнал</h3></div>${события(5)}</section>
    </div>
  </div>
  <section class="a-panel m5-tbl"><div class="a-ph"><h3>Таблица</h3><span class="a-muted">карта 2</span></div><div class="m-teams">${состав('a')}${состав('b')}</div></section>
  <section class="a-panel"><div class="a-ph"><h3>Серия</h3></div>${карты()}</section>
</main></div></div>`,
  })

  /* ════════════ 6 · ЭФИР ════════════ */
  const ЧАС0 = 12, ЧАСОВ = 12
  // Длина серии в часах — по формату: Bo2 — 2, Bo3 — 2.4, Bo5 — 3.4
  const длит = (м) => ({ Bo2: 2, Bo3: 2.4, Bo5: 3.4 })[м.bo || ТУРЫ[м.тур][2]]
  const слот = (м) => `<div class="m6-slot m6-slot--${м.ст} m6-slot--${м.тур}${м.мои ? ' is-mine' : ''}" style="left: ${((м.ч - ЧАС0) / ЧАСОВ) * 100}%; width: calc(${(длит(м) / ЧАСОВ) * 100}% - 4px)">
    <small>${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${статус(м)}${м.мои ? ` · <i class="a-star"></i>${м.мои}` : ''}</small><span>${кЛ(м.a)}<b>${кТ(м.a)}</b><em>${м.ст === 'up' ? '' : `${м.sa}:${м.sb}`}</em><b>${кТ(м.b)}</b>${кЛ(м.b)}</span></div>`
  добавить('efir', {
    что: { расписание: 'Программа передач на неделю: строки — дни, колонки — часы, матчи — блоки эфира, линия «сейчас»; справа — далее в эфире', матч: 'Трансляция крупно со счётом-багом и титром игрока, под ней титры твоих игроков, составы и хроника эфира' },
    расписание: () => `
<div class="ap ap--sch">${шапкаЭфир('Матчи')}
<main class="a-page m6-sch">
  <div class="l6-draft__head"><h1 class="a-h1 a-h1--page">Программа передач</h1>
    <div class="l6-board">${[['Неделя', '30 сен — 6 окт'], ['Игра', 'Все'], ['Турнир', 'Все'], ['Мои игроки', 'Подсветить']].map(([k, v]) => `<button type="button" class="l6-board__i"><small>${k}</small><b>${v}</b></button>`).join('')}</div></div>
  <div class="m6-sch__grid">
    <section class="a-panel m6-epg">
      <div class="m6-epg__hrs"><span></span><div>${Array.from({ length: ЧАСОВ }, (_, i) => `<i style="left: ${(i / ЧАСОВ) * 100}%">${ЧАС0 + i}:00</i>`).join('')}</div></div>
      ${ДНИ.map(([к, д, п], i) => `<div class="m6-epg__row${i === СЕГОДНЯ ? ' is-now' : ''}${i < СЕГОДНЯ ? ' is-past' : ''}"><span class="m6-epg__d"><b>${п || к}</b><small>${к} · ${д}</small></span><div class="m6-epg__lanes">${поТурнирам(дня(i)).map(([, мм]) => `<div class="m6-epg__lane">${мм.map(слот).join('')}</div>`).join('') || '<div class="m6-epg__lane"><span class="m6-epg__off">Эфира нет</span></div>'}${i === СЕГОДНЯ ? `<i class="m6-epg__now" style="--x: ${((16 + 40 / 60 - ЧАС0) / ЧАСОВ).toFixed(4)}"><small>16:40</small></i>` : ''}</div></div>`).join('')}
      <div class="m6-epg__key">${Object.entries(ТУРЫ).map(([к, [t]]) => `<span class="m6-key m6-key--${к}"><i></i>${t}</span>`).join('')}<span class="m6-key m6-key--mine"><i></i>Твои игроки</span></div>
    </section>
    <aside class="l6-studio">
      <section class="a-panel l6-next"><div class="a-ph"><h3>Сейчас в эфире</h3><span class="a-live"><i class="a-dot"></i>2</span></div>
        ${дня(СЕГОДНЯ).filter((м) => м.ст === 'live').map((м) => `<div class="l6-next__m m6-onair">${кЛ(м.a)}<span><b>${кТ(м.a)} ${м.sa} : ${м.sb} ${кТ(м.b)}</b><small>${м.live} · ${тур(м)}</small></span>${кЛ(м.b)}</div>`).join('')}
        <button type="button" class="a-btn a-btn--pri l6-wipe m-wide">Смотреть TS — TUN</button></section>
      <section class="a-panel l6-next"><div class="a-ph"><h3>Далее в эфире</h3></div>
        <div class="l6-next__m">${лого('pv')}<span><b>PARIVISION — BetBoom</b><small>DreamLeague S27 · твой 9Class</small></span>${лого('bb')}</div>
        <div class="l6-next__t"><span>до начала</span>${отсчёт(4637)}</div>
        ${дня(СЕГОДНЯ).filter((м) => м.ст === 'up').slice(1).map((м) => `<div class="m6-later"><em>${м.t}</em><b>${кТ(м.a)} — ${кТ(м.b)}</b><small>${тур(м)}</small></div>`).join('')}</section>
    </aside>
  </div>
</main></div>`,

    матч: () => `
<div class="ap ap--match">${шапкаЭфир('Матчи')}
<main class="a-page m6-match">
  <section class="m6-tv" style="--ta: var(--c-team-ts); --tb: var(--c-team-tun)">
    <img class="m6-tv__img" src="${ЭФИР.кадр()}" alt="" loading="lazy" />
    <div class="l6-air__bug m6-tv__bug"><span class="l6-bug__t">${лого('ts')}<b>TS</b></span><span class="l6-bug__s"><b>1</b><b>0</b></span><span class="l6-bug__t">${лого('tun')}<b>TUN</b></span><span class="l6-bug__m"><i class="a-dot"></i>К2 · 27:41</span></div>
    <span class="m6-tv__src">${ЭФИР.где} · ${ЭФИР.зрит} зрителей</span>
    <i class="a-vid__play m6-tv__play"></i>
    <div class="l6-lt m6-tv__lt" style="--tc: var(--c-team-ts)"><span class="l6-lt__ph"><img src="${фото('yatoro')}" alt="" /></span><span class="l6-lt__who"><b>Yatoro</b><small>Faceless Void · тройное убийство · 27:02</small></span><span class="l6-lt__n"><small>KDA</small><b>6 / 1 / 4</b></span><span class="l6-lt__n"><small>очки</small><b>21.4</b></span></div>
  </section>
  <div class="m6-strip">${КАРТЫ.map((к) => `<span class="m6-strip__i m6-strip__i--${к.ст}"><small>Карта ${к.n}</small><b>${к.ст === 'ft' ? `TS · ${к.счёт}` : к.ст === 'live' ? `<i class="a-dot"></i>${к.счёт} · ${к.длит}` : '—'}</b></span>`).join('')}<span class="m6-strip__lg">DreamLeague · Сезон 27 · Плей-офф · Bo3</span></div>
  <div class="l6-home__grid">
    <div class="l6-home__main">
      <section class="a-panel"><div class="a-ph"><h3>Твои игроки в эфире</h3><span class="m-sum"><b>+${ВСЕГО_МОИХ}</b> очков</span></div>
        <div class="m6-lts">${МОИ_В_МАТЧЕ.map(({ ид, сторона }) => { const и = игрокМатча(ид); return `<div class="l6-lt" style="--tc: var(--c-team-${сторона === 'a' ? 'ts' : 'tun'})"><span class="l6-lt__ph"><img src="${фото(ид)}" alt="" /></span><span class="l6-lt__who"><b>${и.ник}</b><small>${кИ(сторона === 'a' ? 'ts' : 'tun')} · ${ГЕРОЙ[и.г]}</small></span><span class="l6-lt__n"><small>KDA</small><b>${и.k} / ${и.d} / ${и.a}</b></span><span class="l6-lt__n"><small>очки</small><b>${и.о.toFixed(1)}</b></span></div>` }).join('')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Составы</h3></div><div class="m-teams">${состав('a')}${состав('b')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Нетворс</h3></div><div class="m-duo">${сравнение(5)}${граф(140)}</div></section>
    </div>
    <aside class="l6-studio">
      <section class="a-panel l6-next"><div class="a-ph"><h3>Карта 3 — прогноз</h3></div>
        <div class="l6-split" style="--ta: var(--c-team-ts); --tb: var(--c-team-tun)"><span style="--p: 58%"><b>Spirit 58%</b></span><span><b>42% Tundra</b></span></div>
        ${прогноз()}<button type="button" class="a-btn a-btn--pri l6-wipe m-wide">Отправить прогноз</button></section>
      <section class="a-panel"><div class="a-ph"><h3>Хроника эфира</h3></div>${события()}</section>
    </aside>
  </div>
</main></div>`,
  })

  /* ════════════ 8 · КИБЕРСПОРТ СЕЙЧАС ════════════ */
  const вРядЕсп = (м) => ({ ст: м.ст, t: м.ст === 'live' ? м.live : м.t, a: [КОМ[м.a][2] ? м.a : '', кТ(м.a), м.sa], b: [КОМ[м.b][2] ? м.b : '', кТ(м.b), м.sb], тур: `${тур(м)} · ${м.этап || ТУРЫ[м.тур][1]}`, bo: м.bo || ТУРЫ[м.тур][2], мои: м.мои, игра: ТУРЫ[м.тур][3] === 'LoL' ? 'LoL' : '' })
  добавить('esp', {
    что: { расписание: 'Как расписание LoL Esports: слева лиги галочками, справа дни подряд рядами «тег · лого · счёт · лого · тег»', матч: 'Герой-карточка матча с фото игроков и счётом, снизу карты серии; огромные цифры карты, составы, справа мои игроки и прогноз' },
    расписание: () => `
<div class="ap ap--sch">${шапкаЕсп('Матчи')}
<main class="l8-wrap m8-sch">
  <aside class="m8-lg">
    <h3 class="m8-lg__h">Лиги</h3>
    ${Object.entries(ТУРЫ).map(([к, [t, s, , g]]) => `<label class="m8-lg__i is-on"><span class="m8-lg__b">${g}</span><span><b>${t}</b><small>${s}</small></span><i>✓</i></label>`).join('')}
    <label class="m8-lg__i"><span class="m8-lg__b">CS</span><span><b>PGL Major</b><small>с 14 октября</small></span><i></i></label>
    <div class="m8-lg__mine"><b>5</b><small>матчей с твоими игроками на неделе</small><button type="button" class="a-btn l8-wide">Только мои ${стрелка}</button></div>
  </aside>
  <div class="m8-feed">
    <div class="l8-feed__h"><h1 class="l8-h1">Расписание</h1><div class="l8-date"><button type="button" class="l8-ico">←</button><span>30 сен — 6 окт</span><button type="button" class="l8-ico">→</button></div></div>
    ${[0, 1, 2, 3, 4, 6].map((д) => `<h3 class="m8-day${д === СЕГОДНЯ ? ' is-now' : ''}"><b>${ДНИ[д][2] || ДНИ[д][3].split(',')[0]}</b><small>${ДНИ[д][3].split(', ')[1] || ДНИ[д][1]}</small><em>${дня(д).length}</em></h3>
    <div class="l8-feed__list">${дня(д).map((м) => рядЕсп(вРядЕсп(м))).join('')}</div>`).join('')}
  </div>
</main></div>`,

    матч: () => `
<div class="ap ap--match">${шапкаЕсп('Матчи')}
<main class="l8-wrap m8-match">
  ${крошки()}
  <section class="l8-hero" style="--ta: var(--c-team-ts); --tb: var(--c-team-tun)">
    <div class="l8-hero__art">
      <img class="l8-hero__ph l8-hero__ph--a" src="/p-fw3k/site/img/players/yatoro.webp" alt="Yatoro" />
      <img class="l8-hero__ph l8-hero__ph--b" src="/p-fw3k/site/img/players/pure.webp" alt="Pure" />
      <div class="l8-hero__top"><span class="l8-pill l8-pill--live"><i class="a-dot"></i>Live · Карта 2 · 27:41</span><span class="l8-pill">DreamLeague S27 · Плей-офф · Bo3</span></div>
      <div class="l8-hero__score"><b>1</b><i>:</i><b>0</b></div>
      <div class="l8-hero__txt">
        <div><h1 class="l8-hero__h">Team Spirit — Tundra</h1><p>Твои Yatoro, Collapse и Pure набрали <b>+${ВСЕГО_МОИХ} очка</b> за матч</p></div>
        <div class="l8-hero__acts"><button type="button" class="a-btn a-btn--lg l8-btn-w">Смотреть ${стрелка}</button></div>
      </div>
    </div>
    <div class="l8-hero__strip m8-strip">${КАРТЫ.map((к) => `<div class="l8-mini"><small>Карта ${к.n}</small><small>${к.ст === 'ft' ? `Итог · ${к.длит}` : к.ст === 'live' ? `<i class="a-dot"></i>${к.длит}` : 'если понадобится'}</small>
      <span${к.ст === 'ft' && к.поб !== 'a' ? ' class="is-lose"' : ''}>${лого('ts')}<b>TS</b><em>${к.ст === 'up' ? '—' : к.счёт.split(' : ')[0]}</em></span><span${к.ст === 'ft' && к.поб === 'a' ? ' class="is-lose"' : ''}>${лого('tun')}<b>TUN</b><em>${к.ст === 'up' ? '—' : к.счёт.split(' : ')[1]}</em></span></div>`).join('')}</div>
  </section>
  <nav class="l8-tabs">${['Обзор', 'Составы', 'Статистика', 'Прогноз', 'Очные встречи'].map((t, i) => `<a${i === 0 ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="l8-pl__grid">
    <div class="l8-pl__main">
      <section class="a-panel"><div class="a-ph"><h3>Карта 2 в цифрах</h3><span class="a-muted">27:41</span></div>
        <div class="m8-nums">${ЦИФРЫ.slice(0, 4).map(([k, a, b]) => `<div class="m8-num"><span><b>${a}</b><b>${b}</b></span><small>${k}</small></div>`).join('')}</div>${граф(140)}</section>
      <section class="a-panel"><div class="a-ph"><h3>Составы</h3></div><div class="m-teams">${состав('a')}${состав('b')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>События карты 2</h3></div>${события()}</section>
    </div>
    <aside class="l8-pl__side">
      <section class="a-panel l8-five"><div class="a-ph"><h3>Твои игроки</h3><span class="a-muted">3 в матче</span></div>
        <div class="l8-big"><b>+${ВСЕГО_МОИХ}</b><small>очков за матч</small></div>${мои()}</section>
      <section class="a-panel"><div class="a-ph"><h3>Кто возьмёт карту 3?</h3><span class="a-muted">+50</span></div>
        <div class="l8-vote"><button type="button" class="js-pick" aria-pressed="true">Spirit <em>58%</em></button><button type="button" class="js-pick" aria-pressed="false">Tundra <em>42%</em></button></div>
        <button type="button" class="a-btn a-btn--pri l8-wide">Все вопросы прогноза ${стрелка}</button></section>
      <section class="a-panel"><div class="a-ph"><h3>Трансляция</h3></div>${трансляция()}</section>
    </aside>
  </div>
</main></div>`,
  })
})()
