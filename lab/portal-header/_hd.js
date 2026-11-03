// Лаба «Шапка портала», третий заход (дирижёр 15.10: «посмотри, как другие киберсайты делают шапки по разным играм, делай по аналогии»).
// Каждый вариант — по образцу одного сайта (полоска его шапки — над рамкой на странице варианта, ref/*.png):
// v8 — bo3.gg (игры вкладками сверху, разделы игры — второй строкой), v9 — Strafe (игры значками, разделы второй строкой, фэнтези — выпадающим),
// v10 — BLAST.tv (одна строка: игры крупно, фэнтези — главной кнопкой), v11 — «Кибер» Sports.ru (одна строка, игры среди разделов).
// Ещё 11 (дирижёр 15.10: «поищи ещё вариации, штук 15»): v12 Dot Esports · v13 Esports.net · v14 LoL Esports · v15 The Spike · v16 Dexerto ·
// v17 Esports World Cup · v18 Twitch · v19 ONE Esports · v20 ESPN · v21 FotMob · v22 start.gg.
// Только шапка, без страницы. Кликается: игра, раздел, фэнтези. ?v=8..22
;(() => {
  const q = new URLSearchParams(location.search)
  const S = { v: +q.get('v') || 8, game: 'cs', nav: 'mc', drop: false }
  const ИГРЫ = [['cs', 'CS 2', 'CS'], ['dota', 'Dota 2', 'D2'], ['lol', 'LoL', 'L'], ['val', 'Valorant', 'V'], ['mlbb', 'MLBB', 'ML']]
  const РАЗДЕЛЫ = [['home', 'Главная'], ['mc', 'Расписание'], ['trn', 'Турниры'], ['teams', 'Команды'], ['players', 'Игроки'], ['news', 'Новости']]
  const ФЭНТЕЗИ = ['Мой состав', 'Лиги', 'Коллекция', 'Бустеры', 'Лидеры', 'Как играть']
  const знак = (id, кл = '') => { const и = ИГРЫ.find((x) => x[0] === id); return `<i class="hd-gi hd-gi--${id} ${кл}">${и[2]}</i>` }
  const игра = (кл, сИменем = true) => ИГРЫ.map(([id, t]) => `<button type="button" class="${кл}" data-g="${id}" aria-pressed="${S.game === id}" title="${t}">${знак(id)}${сИменем ? `<span>${t}</span>` : ''}</button>`).join('')
  const пункт = ([id, t], кл) => `<a href="#" class="${кл}" data-n="${id}"${S.nav === id ? ' aria-current="page"' : ''}>${t}</a>`
  const лого = `<a href="#" class="hd-logo" data-n="home">Cybersport</a>`
  const лупа = `<button type="button" class="hd-ic" aria-label="Поиск"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg></button>`
  const колокол = `<button type="button" class="hd-ic" aria-label="Уведомления"><svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg></button>`
  const ИКОНКИ = { home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z', mc: 'M5 5h14v15H5zM5 9h14M9 3v4M15 3v4', trn: 'M7 4h10v4a5 5 0 0 1-10 0zM12 13v4M8 20h8M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4',
    news: 'M5 5h11v14H5zM16 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5', fan: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z', more: 'M5 12h.01M12 12h.01M19 12h.01' }
  const ик = (k) => `<svg class="hd-svg" viewBox="0 0 24 24"><path d="${ИКОНКИ[k]}"/></svg>`
  const войти = (кл = '') => `<button type="button" class="hd-btn ${кл}">Войти</button>`
  const ТЕМЫ = ['Spirit — Tundra', 'BLAST Slam VIII', 'Мажор CS 2', 'Worlds 2026', 'Трансферы недели']
  const выпадашка = () => (S.drop ? `<div class="hd-drop">${ФЭНТЕЗИ.map((t) => `<a href="#">${t}</a>`).join('')}</div>` : '')

  const ШАПКИ = {
    8: () => `<header class="hd hd8">
      <div class="hd8__top"><div class="hd-in">${лого}<nav class="hd8__games">${игра('hd8__g')}</nav><span class="hd-sp"></span>${лупа}${колокол}<button type="button" class="hd-btn">Войти</button></div></div>
      <div class="hd8__sub"><div class="hd-in">${знак(S.game, 'hd8__cur')}<nav class="hd8__nav">${[...РАЗДЕЛЫ, ['fan', 'Фэнтези']].map((р) => пункт(р, 'hd8__a')).join('')}</nav>
        <a href="#" class="hd8__promo" data-n="trn"><b>BLAST Slam VIII</b><small>Плей-офф · идёт</small></a></div></div></header>`,
    9: () => `<header class="hd hd9">
      <div class="hd9__top"><div class="hd-in">${лого}<nav class="hd9__games">${игра('hd9__g', false)}</nav>
        <div class="hd9__fan"><button type="button" class="hd9__fanbtn" data-drop aria-expanded="${S.drop}">Фэнтези <b>▾</b></button>${выпадашка()}</div>
        <span class="hd-sp"></span>${лупа}<span class="hd9__lang">RU</span><button type="button" class="hd-btn hd-btn--line">Войти</button></div></div>
      <div class="hd9__sub"><div class="hd-in"><nav class="hd9__nav">${РАЗДЕЛЫ.map((р) => пункт(р, 'hd9__a')).join('')}</nav></div></div></header>`,
    10: () => `<header class="hd hd10"><div class="hd-in">${лого}<nav class="hd10__games">${игра('hd10__g')}</nav><span class="hd-sp"></span>
      <label class="hd10__search">Поиск<kbd>⌘ K</kbd>${лупа}</label><a href="#" class="hd10__in">Войти</a><button type="button" class="hd-btn hd10__fan" data-n="fan">★ Фэнтези</button></div></header>`,
    11: () => `<header class="hd hd11"><div class="hd-in">${лого}<button type="button" class="hd-ic hd11__menu" aria-label="Меню"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h11M4 17h16"/></svg></button>
      <nav class="hd11__nav">${[['home', 'Главная'], ['mc', 'Расписание'], ['news', 'Новости']].map((р) => пункт(р, 'hd11__a')).join('')}<i class="hd11__sep"></i>${ИГРЫ.map(([id, t]) => пункт(['g-' + id, t], 'hd11__a')).join('')}<i class="hd11__sep"></i>${пункт(['fan', 'Фэнтези'], 'hd11__a hd11__fan')}</nav>
      <span class="hd-sp"></span>${лупа}${колокол}<span class="hd11__me">Я</span></div></header>`,
    // v12 — Dot Esports: бренд слева, игры и разделы одной строкой справа
    12: () => `<header class="hd hd12"><div class="hd-in">${лого}<span class="hd-sp"></span><nav class="hd12__nav">${пункт(['news', 'Новости'], 'hd12__a')}${ИГРЫ.map(([id, t]) => пункт(['g-' + id, t], 'hd12__a')).join('')}${пункт(['fan', 'Фэнтези'], 'hd12__a hd12__fan')}</nav>${лупа}<button type="button" class="hd-ic" aria-label="Меню"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></header>`,
    // v13 — Esports.net: бренд и два пункта сверху, игры с логотипами по центру второй строкой, снизу полоса акцента
    13: () => `<header class="hd hd13"><div class="hd13__top"><div class="hd-in">${лого}<span class="hd-sp"></span><a href="#" class="hd13__a">Новости ▾</a><a href="#" class="hd13__a" data-n="mc">Расписание</a><a href="#" class="hd13__a hd13__fan" data-n="fan">Фэнтези</a></div></div>
      <nav class="hd13__games">${игра('hd13__g')}</nav></header>`,
    // v14 — LoL Esports: бренд со стрелкой — переключатель игр; разделы одной строкой; справа язык и «Войти»
    14: () => `<header class="hd hd14"><div class="hd-in"><div class="hd9__fan"><button type="button" class="hd14__brand" data-drop aria-expanded="${S.drop}">${знак(S.game)}<b>Cybersport</b><small>${ИГРЫ.find((x) => x[0] === S.game)[1]} ▾</small></button>${S.drop ? `<div class="hd-drop">${ИГРЫ.map(([id, t]) => `<a href="#" data-g="${id}">${знак(id)} ${t}</a>`).join('')}</div>` : ''}</div>
      <nav class="hd14__nav">${[...РАЗДЕЛЫ.slice(0, 3), ['rank', 'Рейтинг'], ['pred', 'Прогнозы'], ['fan', 'Фэнтези'], ['news', 'Новости']].map((р) => пункт(р, 'hd14__a')).join('')}</nav><span class="hd-sp"></span><span class="hd9__lang">RU</span>${войти('hd-btn--pill')}</div></header>`,
    // v15 — The Spike: бренд, рядом игра выпадающим списком, разделы вкладками; справа иконки в рамках и «Войти» контуром
    15: () => `<header class="hd hd15"><div class="hd-in">${лого}<div class="hd9__fan"><button type="button" class="hd15__game" data-drop aria-expanded="${S.drop}">${знак(S.game)}<b>${ИГРЫ.find((x) => x[0] === S.game)[1]}</b> ▾</button>${S.drop ? `<div class="hd-drop">${ИГРЫ.map(([id, t]) => `<a href="#" data-g="${id}">${знак(id)} ${t}</a>`).join('')}</div>` : ''}</div>
      <nav class="hd15__nav">${[['mc', 'Расписание'], ['trn', 'Турниры'], ['news', 'Новости ▾'], ['teams', 'Данные ▾'], ['fan', 'Фэнтези']].map((р) => пункт(р, 'hd15__a')).join('')}</nav><span class="hd-sp"></span><span class="hd15__box">RU ▾</span><span class="hd15__box">${лупа}</span>${войти('hd-btn--line')}</div></header>`,
    // v16 — Dexerto: крупные пункты, «Войти» и «Регистрация»; второй строкой — «Сейчас обсуждают»
    16: () => `<header class="hd hd16"><div class="hd16__top"><div class="hd-in">${лого}<nav class="hd16__nav">${[['mc', 'Расписание'], ['trn', 'Турниры'], ['news', 'Новости'], ['fan', 'Фэнтези'], ['more', 'Ещё']].map((р) => пункт(р, 'hd16__a')).join('')}</nav><span class="hd-sp"></span>
      <button type="button" class="hd16__ghost">Войти</button><button type="button" class="hd-btn">Регистрация</button><span class="hd16__sq">${лупа}</span></div></div>
      <div class="hd16__trend"><div class="hd-in"><b>Сейчас обсуждают</b>${ТЕМЫ.map((t, i) => `<a href="#"><i class="hd-gi--${ИГРЫ[i % 5][0]}"></i>${t}</a>`).join('')}</div></div></header>`,
    // v17 — Esports World Cup: вертикальная панель слева, значок и подпись под ним
    17: () => `<header class="hd hd17"><a href="#" class="hd17__logo" data-n="home">CS</a>${[['home', 'Главная'], ['mc', 'Расписание'], ['trn', 'Турниры'], ['news', 'Новости'], ['fan', 'Фэнтези']].map(([id, t]) => `<a href="#" class="hd17__a" data-n="${id}"${S.nav === id ? ' aria-current="page"' : ''}>${ик(id)}<span>${t}</span></a>`).join('')}
      <i class="hd17__sep"></i>${игра('hd17__g', false)}</header>`,
    // v18 — Twitch: тонкая строка (бренд, «Расписание», поиск по центру, «Войти», «Фэнтези»), слева — «Идёт сейчас» по играм
    18: () => `<header class="hd hd18"><div class="hd18__top">${лого}<a href="#" class="hd18__go" data-n="mc">Расписание</a><button type="button" class="hd-ic" aria-label="Ещё">⋮</button><span class="hd-sp"></span><label class="hd18__search">Поиск матча, команды, игрока${лупа}</label><span class="hd-sp"></span>${колокол}<button type="button" class="hd16__ghost">Войти</button><button type="button" class="hd-btn hd-btn--pill" data-n="fan">Фэнтези</button></div>
      <aside class="hd18__side"><p>Идёт сейчас</p>${ИГРЫ.map(([id, t], i) => `<button type="button" class="hd18__row" data-g="${id}" aria-pressed="${S.game === id}">${знак(id)}<span><b>${t}</b><small>${['BLAST Slam VIII', 'BLAST Slam VIII', 'Worlds 2026', 'Champions 2026', 'MPL ID'][i]}</small></span><em>${[4, 2, 1, 0, 1][i] ? '● ' + [4, 2, 1, 0, 1][i] : '—'}</em></button>`).join('')}</aside></header>`,
    // v19 — ONE Esports: одна плотная строка, игры пунктами, активный — цветом; под ней строка горячих тем
    19: () => `<header class="hd hd19"><div class="hd19__top"><div class="hd-in">${лого}<nav class="hd19__nav">${пункт(['home', 'Главная'], 'hd19__a')}${ИГРЫ.map(([id, t]) => пункт(['g-' + id, t], 'hd19__a')).join('')}${пункт(['fan', 'Фэнтези'], 'hd19__a')}${пункт(['more', 'Ещё ▾'], 'hd19__a')}</nav><span class="hd-sp"></span><i class="hd11__sep"></i><span class="hd9__lang">RU ▾</span>${войти('hd-btn--sm')}${лупа}</div></div>
      <div class="hd19__trend"><div class="hd-in">↗${ТЕМЫ.map((t) => `<a href="#">${t}</a>`).join('<i>•</i>')}</div></div></header>`,
    // v20 — ESPN: бренд плашкой, игры в строку, справа «Смотреть» и «Фэнтези» со значками; второй строкой — выбранная игра и её разделы
    20: () => `<header class="hd hd20"><div class="hd20__top"><a href="#" class="hd20__logo" data-n="home">Cybersport</a><nav class="hd20__games">${игра('hd20__g', true)}</nav><span class="hd-sp"></span>
      <a href="#" class="hd20__x">${ик('mc')}Смотреть</a><a href="#" class="hd20__x" data-n="fan">${ик('fan')}Фэнтези</a>${лупа}<span class="hd11__me">Я</span></div>
      <div class="hd20__sub">${знак(S.game)}<b>${ИГРЫ.find((x) => x[0] === S.game)[1]}</b><i class="hd11__sep"></i>${[['home', 'Главная'], ['mc', 'Расписание'], ['trn', 'Турниры'], ['news', 'Новости']].map((р) => пункт(р, 'hd20__a')).join('')}</div></header>`,
    // v21 — FotMob: бренд, рядом широкий поиск; справа три пункта, настройки и приложения. Игры — не в шапке, а на странице
    21: () => `<header class="hd hd21"><div class="hd-in">${лого}<label class="hd21__search">${лупа}Поиск</label><span class="hd-sp"></span>${[['news', 'Новости'], ['mc', 'Расписание'], ['fan', 'Фэнтези']].map((р) => пункт(р, 'hd21__a')).join('')}
      <button type="button" class="hd-ic" aria-label="Настройки"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg></button><i class="hd11__sep"></i><span class="hd21__app">iOS</span><span class="hd21__app">Android</span></div></header>`,
    // v22 — start.gg: узкая панель значков слева — бренд, поиск, игры логотипами, фэнтези внизу
    22: () => `<header class="hd hd22"><a href="#" class="hd22__logo" data-n="home">C</a>${лупа}<i class="hd17__sep"></i>${игра('hd22__g', false)}<i class="hd17__sep"></i><a href="#" class="hd22__a" data-n="mc" title="Расписание">${ик('mc')}</a><a href="#" class="hd22__a" data-n="fan" title="Фэнтези">${ик('fan')}</a></header>`,
  }
  const root = document.querySelector('[data-hd]')
  const рисовать = () => { root.innerHTML = ШАПКИ[S.v]() }
  рисовать()
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-g], [data-n], [data-drop]')
    if (!t) { if (S.drop) { S.drop = false; рисовать() } return }
    e.preventDefault()
    if (t.dataset.g) { S.game = t.dataset.g; S.drop = false }
    else if (t.dataset.n) { S.nav = t.dataset.n; S.drop = false }
    else S.drop = !S.drop
    рисовать()
  })
})()
