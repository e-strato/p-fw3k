// Лаба «Шапка портала» (ZZZZZ №1, дирижёр 15.10). Кадр: шапка варианта + условная страница Match Center под ней.
// Ссылка: ?v=1..4 — вариант, &user=guest|fan — гость или играет в фэнтези, &open=1 — сразу раскрыть вход в фэнтези.
// Портал: центр — расписание (Match Center), «Матчи» (schedule.html) убраны, фэнтези — один вход. Игры — 5: CS 2, Dota 2, LoL, Valorant, MLBB.
// Телефон — та же страница уже 860px: верх шапки свой у каждого варианта, внизу — таб-бар.
;(() => {
  const q = new URLSearchParams(location.search)
  const S = { v: +q.get('v') || 1, user: q.get('user') || 'guest', game: 'all', nav: 'mc', open: q.get('open') === '1', mode: q.get('mode') || 'portal', sheet: q.get('sheet') || '' }
  if (S.mode === 'fantasy') S.nav = 'f-lineup'

  const ИГРЫ = [
    { id: 'cs', имя: 'CS 2', знак: 'CS', live: 4 },
    { id: 'dota', имя: 'Dota 2', знак: 'D2', live: 2 },
    { id: 'lol', имя: 'LoL', знак: 'LoL', live: 1 },
    { id: 'val', имя: 'Valorant', знак: 'V', live: 0 },
    { id: 'mlbb', имя: 'MLBB', знак: 'ML', live: 1 },
  ]
  const РАЗДЕЛЫ = [['mc', 'Расписание'], ['trn', 'Турниры'], ['news', 'Новости'], ['teams', 'Команды и игроки']]
  const ФЭНТЕЗИ = [
    ['Мой состав', 'Пятёрка на сегодня'], ['Лиги', 'Турнир и друзья'], ['Коллекция', 'Твои карточки'],
    ['Бустеры', 'Открыть набор'], ['Квесты', '3 из 5 сегодня'], ['Лидеры', 'Рейтинг недели'], ['Как это работает', 'За 2 минуты'],
  ]
  const МАТЧИ = [
    { g: 'cs', t: 'Live', a: 'Vitality', b: 'NAVI', s: '1 : 0', trn: 'IEM Chengdu · плей-офф', live: 1 },
    { g: 'dota', t: 'Live', a: 'Team Spirit', b: 'Tundra', s: '1 : 1', trn: 'PGL Wallachia · группа', live: 1 },
    { g: 'lol', t: 'Live', a: 'T1', b: 'Gen.G', s: '0 : 0', trn: 'Worlds · четвертьфинал', live: 1 },
    { g: 'mlbb', t: 'Live', a: 'ONIC', b: 'RRQ', s: '2 : 1', trn: 'MPL ID · неделя 6', live: 1 },
    { g: 'cs', t: '17:00', a: 'G2', b: 'FaZe', s: '', trn: 'IEM Chengdu · плей-офф' },
    { g: 'val', t: '18:30', a: 'Fnatic', b: 'Sentinels', s: '', trn: 'Champions · группа B' },
    { g: 'dota', t: '19:00', a: 'Falcons', b: 'BetBoom', s: '', trn: 'PGL Wallachia · группа' },
    { g: 'lol', t: '20:00', a: 'G2', b: 'BLG', s: '', trn: 'Worlds · четвертьфинал' },
    { g: 'cs', t: '21:30', a: 'MOUZ', b: 'Spirit', s: '', trn: 'IEM Chengdu · плей-офф' },
    { g: 'val', t: '22:00', a: 'Paper Rex', b: 'EDG', s: '', trn: 'Champions · группа A' },
  ]
  const fan = () => S.user === 'fan'
  const игра = id => ИГРЫ.find(g => g.id === id)
  const знак = (g, cls = '') => `<i class="ph-g ph-g--${g.id} ${cls}">${g.знак}</i>`
  const всего = ИГРЫ.reduce((n, g) => n + g.live, 0)

  // Общие кусочки
  const бренд = () => `<a class="ph-brand" href="#" data-nav="mc"><i class="ph-brand__mark"></i>Cybersport</a>`
  const пользователь = () => fan()
    ? `<div class="ph-user"><span class="ph-coins"><i></i>1 240</span><button class="ph-ava" type="button" aria-label="Профиль">ЕК</button></div>`
    : `<div class="ph-user"><button class="btn btn--quiet btn--sm" type="button" data-user="fan">Войти</button></div>`
  const разделы = (cls = '') => `<nav class="ph-nav ${cls}" aria-label="Разделы">${РАЗДЕЛЫ.map(([id, t]) =>
    `<a href="#" data-nav="${id}"${S.nav === id ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>`
  const игрыЧипы = (cls = '') => `<div class="ph-games ${cls}" role="group" aria-label="Игра">
    <button type="button" data-game="all" aria-pressed="${S.game === 'all'}">Все игры<small>${всего}</small></button>
    ${ИГРЫ.map(g => `<button type="button" data-game="${g.id}" aria-pressed="${S.game === g.id}">${знак(g)}${g.имя}${g.live ? `<small>${g.live}</small>` : ''}</button>`).join('')}</div>`
  // Раскрытый вход в фэнтези: гость — что это и кнопка, играет — день и разделы
  const фэнтезиПанель = () => `<div class="ph-fan-panel" ${S.open ? '' : 'hidden'}>
    ${fan()
      ? `<div class="ph-fan-day"><b>Сегодня 3 твоих игрока</b><span>Дедлайн состава в 16:40 · +86 очков за вчера</span>
          <div class="ph-fan-ava"><i>Y</i><i>C</i><i>A</i><em>Yatoro · Collapse · ATF</em></div>
          <button class="btn btn--sm" type="button">Собрать состав</button></div>`
      : `<div class="ph-fan-day"><b>Фэнтези по 3 играм</b><span>Собери пятёрку из игроков сегодняшних матчей — получай очки за их игру. Бесплатно.</span>
          <button class="btn btn--sm" type="button" data-user="fan">Играть</button></div>`}
    <ul class="ph-fan-list">${ФЭНТЕЗИ.map(([t, s]) => `<li><a href="#">${t}<small>${s}</small></a></li>`).join('')}</ul></div>`

  // ———————————————— Варианты ————————————————
  const В = {}

  // v1 · Классика в три строки: верх — бренд, поиск, вход; разделы и кнопка «Фэнтези»; ряд 5 игр
  В[1] = () => ({
    head: `<header class="ph ph--v1">
      <div class="ph-in ph-row ph-row--top">${бренд()}
        <label class="ph-search"><i>⌕</i><input placeholder="Команды, игроки, турниры" /></label>${пользователь()}</div>
      <div class="ph-in ph-row ph-row--nav">${разделы()}
        <div class="ph-fan-wrap"><button class="ph-fan-btn" type="button" data-fan aria-expanded="${S.open}">Фэнтези${fan() ? '<small>3</small>' : ''}<b>▾</b></button>${фэнтезиПанель()}</div></div>
      <div class="ph-in ph-row ph-row--games">${игрыЧипы()}</div>
    </header>`,
    phoneTop: `<div class="ph-m ph-m--v1"><div class="ph-m__bar">${бренд()}<button class="ph-ico" type="button">⌕</button>${пользователь()}</div>${игрыЧипы('ph-games--scroll')}</div>`,
    tab: `<nav class="ph-tab ph-tab--v1">${таб('mc', '▦', 'Расписание')}${таб('trn', '◫', 'Турниры')}
      <a href="#" class="ph-tab__fan" data-sheet="fan"><i>★</i>Фэнтези</a>${таб('news', '≡', 'Новости')}${таб('me', '◉', 'Профиль')}</nav>`,
  })

  // v2 · Игры — верхней полосой, фэнтези — режим «Портал | Фэнтези»: в фэнтези меняются разделы и тон шапки
  const РАЗДЕЛЫ_Ф = [['f-lineup', 'Мой состав'], ['f-league', 'Лиги'], ['f-coll', 'Коллекция'], ['f-boost', 'Бустеры'], ['f-quest', 'Квесты'], ['f-lead', 'Лидеры']]
  В[2] = () => {
    const ф = S.mode === 'fantasy'
    const nav = ф ? `<nav class="ph-nav" aria-label="Фэнтези">${РАЗДЕЛЫ_Ф.map(([id, t], i) => `<a href="#" data-nav="${id}"${S.nav === id || (i === 0 && !S.nav.startsWith('f-')) ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>` : разделы()
    const режим = `<div class="ph-mode" role="group" aria-label="Режим"><button type="button" data-mode="portal" aria-pressed="${!ф}">Портал</button><button type="button" data-mode="fantasy" aria-pressed="${ф}">Фэнтези</button></div>`
    const полоса = `<div class="ph-rail"><div class="ph-in ph-rail__in">
      <button type="button" data-game="all" aria-pressed="${S.game === 'all'}">Все</button>
      ${ИГРЫ.map(g => `<button type="button" data-game="${g.id}" aria-pressed="${S.game === g.id}">${знак(g, 'ph-g--sm')}${g.имя}${g.live ? '<i class="ph-dot"></i>' : ''}</button>`).join('')}
      <span class="ph-rail__note">${ф ? 'Фэнтези есть по CS 2, Dota 2 и LoL' : `${всего} матча в эфире`}</span></div></div>`
    return {
      head: `<header class="ph ph--v2${ф ? ' is-fantasy' : ''}">${полоса}
        <div class="ph-in ph-row ph-row--main">${бренд()}${nav}${режим}${пользователь()}</div></header>`,
      phoneTop: `<div class="ph-m ph-m--v2${ф ? ' is-fantasy' : ''}"><div class="ph-m__bar">${бренд()}${режим}</div>
        <div class="ph-m__icons">${ИГРЫ.map(g => `<button type="button" data-game="${g.id}" aria-pressed="${S.game === g.id}">${знак(g)}<span>${g.имя}</span></button>`).join('')}</div></div>`,
      tab: ф
        ? `<nav class="ph-tab ph-tab--v2 is-fantasy">${таб('f-lineup', '★', 'Состав')}${таб('f-league', '♛', 'Лиги')}${таб('f-coll', '❖', 'Коллекция')}<a href="#" data-mode="portal"><i>↩</i>Портал</a></nav>`
        : `<nav class="ph-tab ph-tab--v2">${таб('mc', '▦', 'Расписание')}${таб('trn', '◫', 'Турниры')}${таб('news', '≡', 'Новости')}<a href="#" data-mode="fantasy" class="ph-tab__fan2"><i>★</i>Фэнтези</a></nav>`,
    }
  }

  // v3 · Одна строка: игра — выпадающим списком, фэнтези — «пилюля» со статусом дня справа
  В[3] = () => {
    const g = игра(S.game)
    const выбор = `<div class="ph-pick-wrap"><button class="ph-pick" type="button" data-sheet="games" aria-expanded="${S.sheet === 'games'}">${g ? знак(g, 'ph-g--sm') + g.имя : 'Все игры'}<b>▾</b></button>
      <div class="ph-pop" ${S.sheet === 'games' ? '' : 'hidden'}>
        <button type="button" data-game="all" aria-pressed="${S.game === 'all'}"><i class="ph-g ph-g--all">∗</i>Все игры<small>${всего} в эфире</small></button>
        ${ИГРЫ.map(x => `<button type="button" data-game="${x.id}" aria-pressed="${S.game === x.id}">${знак(x)}${x.имя}<small>${x.live ? x.live + ' в эфире' : 'сегодня 2 матча'}</small></button>`).join('')}</div></div>`
    const пилюля = fan()
      ? `<button class="ph-pill" type="button" data-fan aria-expanded="${S.open}"><span class="ph-pill__ava"><i>Y</i><i>C</i><i>A</i></span>Фэнтези<small>3 сегодня · 16:40</small></button>`
      : `<button class="ph-pill" type="button" data-fan aria-expanded="${S.open}"><span class="ph-pill__star">★</span>Фэнтези<small>Играть бесплатно</small></button>`
    return {
      head: `<header class="ph ph--v3"><div class="ph-in ph-row ph-row--one">${бренд()}${выбор}${разделы()}
        <button class="ph-ico" type="button" aria-label="Поиск">⌕</button>
        <div class="ph-fan-wrap ph-fan-wrap--right">${пилюля}${фэнтезиПанель()}</div>${пользователь()}</div></header>`,
      phoneTop: `<div class="ph-m ph-m--v3"><div class="ph-m__bar">${бренд()}${выбор}</div></div>`,
      tab: `<nav class="ph-tab ph-tab--v3">${таб('mc', '▦', 'Расписание')}${таб('search', '⌕', 'Поиск')}
        <a href="#" data-sheet="fan"${S.sheet === 'fan' ? ' aria-current="page"' : ''}><i>★${fan() ? '<em>3</em>' : ''}</i>Фэнтези</a>${таб('fav', '☆', 'Избранное')}${таб('me', '◉', 'Профиль')}</nav>`,
    }
  }

  // v4 · Расписание прямо в шапке: под разделами — живая лента матчей с фильтром игр; фэнтези — карточка дня
  В[4] = () => {
    const лента = МАТЧИ.filter(m => S.game === 'all' || m.g === S.game).map(m => `<a href="#" class="ph-tick${m.live ? ' is-live' : ''}">
      ${знак(игра(m.g), 'ph-g--xs')}<span class="ph-tick__t">${m.live ? 'Live' : m.t}</span><span>${m.a}</span><b>${m.s || '—'}</b><span>${m.b}</span></a>`).join('')
    const карточка = fan()
      ? `<button class="ph-card" type="button" data-fan aria-expanded="${S.open}"><span class="ph-pill__ava"><i>Y</i><i>C</i><i>A</i></span><span><b>Фэнтези · +86 очков</b><small>3 игрока сегодня · дедлайн 16:40</small></span></button>`
      : `<button class="ph-card" type="button" data-fan aria-expanded="${S.open}"><span class="ph-pill__star">★</span><span><b>Фэнтези</b><small>Собери пятёрку на сегодня</small></span></button>`
    return {
      head: `<header class="ph ph--v4"><div class="ph-in ph-row ph-row--main">${бренд()}${разделы()}
        <div class="ph-fan-wrap ph-fan-wrap--right">${карточка}${фэнтезиПанель()}</div>${пользователь()}</div>
        <div class="ph-ticker"><div class="ph-in ph-ticker__in">
          <div class="ph-tfilter">${[{ id: 'all', знак: 'Все' }, ...ИГРЫ].map(g => `<button type="button" data-game="${g.id}" aria-pressed="${S.game === g.id}" title="${g.имя || 'Все игры'}">${g.id === 'all' ? 'Все' : знак(g, 'ph-g--sm')}</button>`).join('')}</div>
          <div class="ph-ticker__row">${лента}</div><a href="#" class="ph-ticker__all" data-nav="mc">Всё расписание →</a></div></div></header>`,
      phoneTop: `<div class="ph-m ph-m--v4"><div class="ph-m__bar">${бренд()}<button class="ph-ico" type="button">⌕</button>${пользователь()}</div>
        <div class="ph-ticker"><div class="ph-ticker__in"><div class="ph-tfilter">${[{ id: 'all' }, ...ИГРЫ].map(g => `<button type="button" data-game="${g.id}" aria-pressed="${S.game === g.id}">${g.id === 'all' ? 'Все' : знак(g, 'ph-g--sm')}</button>`).join('')}</div><div class="ph-ticker__row">${лента}</div></div></div></div>`,
      tab: `<nav class="ph-tab ph-tab--v4">${таб('mc', '▦', 'Матчи')}<a href="#" data-sheet="fan"${S.sheet === 'fan' ? ' aria-current="page"' : ''}><i>★</i>Фэнтези</a><a href="#" data-sheet="more"${S.sheet === 'more' ? ' aria-current="page"' : ''}><i>⋯</i>Ещё</a></nav>`,
    }
  }

  function таб(id, и, t) { return `<a href="#" data-nav="${id}"${S.nav === id && !S.sheet ? ' aria-current="page"' : ''}><i>${и}</i>${t}</a>` }

  // Условная страница под шапкой — Match Center (расписание), чтобы видеть шапку в контексте
  const страница = () => {
    const g = игра(S.game)
    if (S.v === 2 && S.mode === 'fantasy') return `<main class="ph-page"><div class="ph-in"><h1>Фэнтези${g ? ' · ' + g.имя : ''}</h1>
      <p class="ph-sub">Тот же сайт, другой режим: разделы фэнтези в шапке, расписание — в один клик назад.</p>
      <div class="ph-grid">${['Мой состав · 3 из 5', 'Лига «Друзья» · 4-е место', 'Квесты · 3 из 5'].map(t => `<div class="ph-box"><b>${t}</b><span></span><span></span></div>`).join('')}</div></div></main>`
    const ряды = МАТЧИ.filter(m => S.game === 'all' || m.g === S.game)
    const назв = РАЗДЕЛЫ.find(([id]) => id === S.nav)?.[1] || 'Расписание'
    return `<main class="ph-page"><div class="ph-in">
      <h1>${назв}${g ? ' · ' + g.имя : ''}</h1>
      <div class="ph-days">${['Вчера', 'Сегодня, 15 окт', 'Завтра', 'Пт 17', 'Сб 18', 'Вс 19'].map((d, i) => `<span${i === 1 ? ' class="is-on"' : ''}>${d}</span>`).join('')}</div>
      <div class="ph-list">${ряды.map(m => `<div class="ph-mrow">${знак(игра(m.g), 'ph-g--sm')}<span class="ph-mrow__t${m.live ? ' is-live' : ''}">${m.t}</span>
        <span class="ph-mrow__a">${m.a}</span><b>${m.s || 'vs'}</b><span>${m.b}</span><small>${m.trn}</small>${fan() && m.g !== 'val' && m.g !== 'mlbb' ? '<em>★ твой игрок</em>' : ''}</div>`).join('') || '<p class="ph-sub">Сегодня матчей нет</p>'}</div></div></main>`
  }

  // Шторка на телефоне: фэнтези (v1, v3, v4) и «Ещё» (v4)
  const шторка = () => {
    if (!S.sheet || S.sheet === 'games') return ''
    const тело = S.sheet === 'more'
      ? `<ul class="ph-fan-list">${[...РАЗДЕЛЫ.slice(1), ['set', 'Настройки']].map(([, t]) => `<li><a href="#">${t}</a></li>`).join('')}</ul>`
      : фэнтезиПанель().replace(' hidden>', '>')
    return `<div class="ph-sheet"><button class="ph-sheet__bg" type="button" data-sheet="" aria-label="Закрыть"></button><div class="ph-sheet__in"><i class="ph-sheet__grip"></i>${тело}</div></div>`
  }

  const root = document.querySelector('[data-ph]')
  const рисовать = () => {
    const v = В[S.v]()
    root.innerHTML = `<div class="ph-desk">${v.head}</div>${v.phoneTop}${страница()}${шторка()}${v.tab}`
  }
  рисовать()

  root.addEventListener('click', e => {
    const t = e.target.closest('[data-game], [data-nav], [data-fan], [data-mode], [data-sheet], [data-user]')
    if (!t) { if (S.open && !e.target.closest('.ph-fan-panel')) { S.open = false; рисовать() } return }
    e.preventDefault()
    if (t.dataset.game) { S.game = t.dataset.game; if (S.sheet === 'games') S.sheet = '' }
    else if (t.dataset.nav) { S.nav = t.dataset.nav; S.sheet = ''; S.open = false; if (S.v === 2 && !t.dataset.nav.startsWith('f-')) S.mode = 'portal' }
    else if (t.dataset.fan !== undefined) S.open = !S.open
    else if (t.dataset.mode) { S.mode = t.dataset.mode; S.nav = S.mode === 'fantasy' ? 'f-lineup' : 'mc' }
    else if (t.dataset.sheet !== undefined) S.sheet = S.sheet === t.dataset.sheet ? '' : t.dataset.sheet
    else if (t.dataset.user) { S.user = t.dataset.user; S.open = true }
    рисовать()
  })
  // Хозяин (страница варианта) переключает гостя / игрока без перезагрузки
  addEventListener('message', e => { if (e.data && e.data.ph) { Object.assign(S, e.data.ph); рисовать() } })
})()
