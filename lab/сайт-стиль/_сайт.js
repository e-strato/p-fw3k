/* Лаба «Сайт в одном стиле» — общее для всех наборов: экраны продукта (главная, онбординг в 5 шагов, страница игрока)
   одной разметкой и данными; стиль набора — свой файл _т-*.css (класс темы на <body>). Под большим экраном — мелкие кадры
   всех экранов; клик по кадру открывает экран наверху (?экран=N — прямая ссылка).
   Данные игрока — общие с лабой «Страница игрока» (../страница-игрока/_игрок.js: ИГРОК, ПУТЬ, ТРОФЕИ, ГЕРОИ, МАТЧИ, ВИДЕО, ФАКТЫ,
   ЦИТАТЫ, СЕЙЧАС, СОСТАВ, героиКартинка, превью, картаИгрока) — собраны 30.09 из Liquipedia и OpenDota. Матчи главной — условные. */
(() => {
  const лого = (id) => `<img class="a-logo" src="/p-fw3k/site/img/teams/${id}.png" alt="" />`
  const моно = (t) => `<span class="a-logo a-logo--mono">${t}</span>`
  const логоИли = (id, t) => (id ? лого(id) : моно(t))

  // Мини-карта F — разметка компонента сайта (blocks/shared/card-f.html)
  const ИГРОКИ = {
    '9class': { ник: '9Class', фото: '9class.webp', ovr: 95, тег: 'PV', pos: 4, сила: 'elite', ред: 'legend', флаг: 'ru', герои: ['keeper_of_the_light', 'rubick', 'dark_willow'] },
    pure: { ник: 'Pure', фото: 'pure.webp', ovr: 93, тег: 'TUN', pos: 1, сила: 'elite', ред: 'prism', флаг: 'ru', герои: ['terrorblade', 'morphling', 'faceless_void'] },
    yatoro: { ник: 'Yatoro', фото: 'yatoro.webp', ovr: 82, тег: 'TS', pos: 1, сила: 'gold', ред: 'holo', флаг: 'ua', герои: ['faceless_void', 'morphling', 'terrorblade'] },
    rue: { ник: 'Rue', фото: 'rue.webp', ovr: 78, тег: 'TS', pos: 5, сила: 'gold', ред: 'base', флаг: 'ru', герои: ['rubick', 'tusk', 'beastmaster'] },
    // Для галереи — игроки без фото (силуэт, решение 12); рейтинги условные
    satanic: { ник: 'Satanic', фото: '', ovr: 91, тег: 'PV', pos: 1, сила: 'elite', ред: 'holo', флаг: 'ru', герои: ['terrorblade', 'morphling', 'faceless_void'] },
    collapse: { ник: 'Collapse', фото: '', ovr: 88, тег: 'TS', pos: 3, сила: 'gold', ред: 'prism', флаг: 'ru', герои: ['mars', 'beastmaster', 'lycan'] },
    malrine: { ник: 'Malr1ne', фото: '', ovr: 86, тег: 'FLC', pos: 2, сила: 'gold', ред: 'base', флаг: 'ru', герои: ['morphling', 'faceless_void', 'terrorblade'] },
    noone: { ник: 'No[o]ne', фото: '', ovr: 84, тег: 'PV', pos: 2, сила: 'gold', ред: 'holo', флаг: 'ua', герои: ['rubick', 'morphling', 'lycan'] },
    miposhka: { ник: 'Miposhka', фото: '', ovr: 76, тег: 'TS', pos: 5, сила: 'gold', ред: 'base', флаг: 'ru', герои: ['tusk', 'rubick', 'hoodwink'] },
    dukalis: { ник: 'Dukalis', фото: '', ovr: 72, тег: 'PV', pos: 3, сила: 'silver', ред: 'base', флаг: 'ru', герои: ['mars', 'beastmaster', 'tusk'] },
  }
  const РЕДКОСТЬ = { legend: 'Legend', prism: 'Prism', holo: 'Holo', base: 'Base' }
  const картаF = (ид, w = 150) => {
    const п = ИГРОКИ[ид], ф = `/p-fw3k/site/img/players/${п.фото || '_silhouette.png'}`
    return `<div class="player-card player-card--f player-card--${п.сила} player-card--${п.ред}" data-tilt style="--w: ${w}px"><div class="player-card__in">
  <div class="player-card__body"></div>
  <div class="player-card__f-art"><i class="player-card__shine"></i><i class="player-card__spark"><b></b><b></b><b></b><b></b><b></b><b></b></i><span class="player-card__big">${п.ovr}</span><img class="player-card__ph" src="${ф}" alt="${п.ник}" /></div>
  ${п.фото ? `<img class="player-card__ph player-card__ph--pop" src="${ф}" alt="" aria-hidden="true" />` : ''}
  <div class="player-card__f-info"><b class="player-card__rarity">${РЕДКОСТЬ[п.ред]}</b>
    <div class="player-card__f-ic">${п.герои.map((h, i) => `<span${i === 2 ? ' class="player-card__hero--best"' : ''}><img src="${героиКартинка(h)}" alt="" /></span>`).join('')}</div>
    <div class="player-card__f-team"><i class="player-card__flag player-card__flag--${п.флаг}"></i><span>${п.тег} · <b>POS ${п.pos}</b></span></div></div>
  <div class="player-card__f-strip"><b class="player-card__f-nick">${п.ник}</b><span class="player-card__ovr"><b>${п.ovr}</b><small>OVR</small></span></div>
  <i class="player-card__glare"></i></div></div>`
  }

  /* ───────── Шапка продукта ───────── */
  const шапка = (текущий = 'Главная') => `
<header class="a-hd"><div class="a-hd__in">
  <a class="a-brand"><i class="a-brand__mark">F</i><span>Fantasy <b>Dota 2</b></span></a>
  <div class="a-seg"><button type="button" aria-pressed="true">Dota 2</button><button type="button" aria-pressed="false">LoL</button></div>
  <nav class="a-nav">${['Главная', 'Матчи', 'Сундуки', 'Коллекция', 'Лидеры', 'Квесты'].map((t) => `<a${t === текущий ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="a-hd__right"><span class="a-coins"><i></i><b>1 000</b></span><span class="a-ava">S</span></div>
</div></header>`

  const шапкаОнбординга = (монеты) => `
<header class="a-hd a-hd--ob"><div class="a-hd__in">
  <a class="a-brand"><i class="a-brand__mark">F</i><span>Fantasy <b>Dota 2</b></span></a>
  <span class="a-hd__note">Первый вход</span>
  <div class="a-hd__right"><span class="a-coins"><i></i><b>${монеты}</b></span><a class="a-link">Пропустить</a></div>
</div></header>`

  /* ───────── Главная ───────── */
  const ТУРНИРЫ = [
    { игра: 'D2', имя: 'DreamLeague · Сезон 27', где: 'Европа · Плей-офф · Bo3', матчи: [
      { ст: 'live', время: 'К2 · 27:41', a: ['ts', 'Team Spirit', 1], b: ['tun', 'Tundra Esports', 0], мои: 2, прогноз: '21.4' },
      { ст: 'up', время: '18:00', a: ['pv', 'PARIVISION', ''], b: ['bb', 'BetBoom Team', ''], мои: 1, прогноз: '18.9' },
      { ст: 'ft', время: 'Завершён', a: ['gg', 'Gaimin Gladiators', 2], b: ['flc', 'Team Falcons', 1], мои: 0 },
      { ст: 'up', время: '21:30', a: ['tl', 'Team Liquid', ''], b: ['aur', 'Aurora', ''], мои: 0 },
    ] },
    { игра: 'D2', имя: 'BLAST Slam VIII', где: 'Группа A · Bo2', матчи: [
      { ст: 'live', время: 'К1 · 14:02', a: ['yg', 'Yangon Galacticos', 0], b: ['', 'LVLUP', 0], мои: 0 },
      { ст: 'up', время: 'Завтра 15:00', a: ['pv', 'PARIVISION', ''], b: ['', 'LGD Gaming', ''], мои: 1, прогноз: '17.2' },
    ] },
  ]
  const матчСтрокаГл = (м) => `
<div class="a-mr a-mr--${м.ст}">
  <span class="a-mr__st">${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${м.время}</span>
  <span class="a-mr__teams">
    <span class="a-mr__t">${логоИли(м.a[0], м.a[1].slice(0, 3).toUpperCase())}<b>${м.a[1]}</b><em>${м.a[2]}</em></span>
    <span class="a-mr__t">${логоИли(м.b[0], м.b[1].slice(0, 3).toUpperCase())}<b>${м.b[1]}</b><em>${м.b[2]}</em></span>
  </span>
  <span class="a-mr__mine">${м.мои ? `<i class="a-star"></i>${м.мои} ${м.мои === 1 ? 'игрок' : 'игрока'}` : ''}</span>
  <span class="a-mr__pred">${м.прогноз ? `<b>${м.прогноз}</b><small>очков прогноз</small>` : ''}</span>
  <span class="a-mr__act">${м.ст === 'ft' ? '<span class="a-muted">Итог</span>' : `<button type="button" class="a-btn a-btn--sm${м.ст === 'live' ? ' a-btn--pri' : ''}">${м.ст === 'live' ? 'Смотреть' : 'Прогноз'}</button>`}</span>
</div>`

  const главная = () => `
<div class="ap ap--home">${шапка('Главная')}
<main class="a-page a-home">
  <div class="a-home__main">
    <section class="a-panel a-feat">
      <div class="a-feat__top"><span class="a-live"><i class="a-dot"></i>Live</span><span class="a-feat__league">Матч дня · DreamLeague S27 · Плей-офф · Bo3</span><span class="a-feat__clock">Карта 2 · 27:41</span></div>
      <div class="a-feat__teams">
        <div class="a-feat__team">${лого('ts')}<b>Team Spirit</b><small>2 твоих игрока</small></div>
        <div class="a-feat__score"><b>1</b><i>:</i><b>0</b><small>серия</small></div>
        <div class="a-feat__team a-feat__team--r">${лого('tun')}<b>Tundra Esports</b><small>1 твой игрок</small></div>
      </div>
      <div class="a-cmp">
        ${[['Нетворс', '42.3k', '41.7k', 52], ['Убийства', '18', '11', 62], ['Башни', '5', '2', 71], ['Рошаны', '1', '0', 100]].map(([k, a, b, p]) => `<div class="a-cmp__row"><b>${a}</b><span class="a-cmp__bar" style="--p: ${p}%"><i></i></span><small>${k}</small><span class="a-cmp__bar a-cmp__bar--b" style="--p: ${100 - p}%"><i></i></span><b>${b}</b></div>`).join('')}
      </div>
      <div class="a-feat__foot">
        <div class="a-vote"><span>Кто победит?<small>угадаешь — +30 монет</small></span><button type="button" class="js-pick" aria-pressed="true">Team Spirit <b>58%</b></button><button type="button" class="js-pick" aria-pressed="false">Tundra <b>42%</b></button></div>
        <button type="button" class="a-btn a-btn--pri">Прогноз на карту 3</button>
      </div>
    </section>

    <section class="a-panel a-mine">
      <div class="a-ph"><h3>Твои игроки сегодня</h3><span class="a-muted">3 из 5 играют</span><a class="a-link">Состав →</a></div>
      <div class="a-mine__row">
        ${[['9class', 'PARIVISION — BetBoom', '18:00', '18.9'], ['yatoro', 'Team Spirit — Tundra', 'Live · К2', '21.4'], ['pure', 'Team Spirit — Tundra', 'Live · К2', '24.0']].map(([ид, м, t, p]) => `
        <div class="a-mine__it">${картаF(ид, 132)}<div class="a-mine__info"><b>${ИГРОКИ[ид].ник}</b><small>${м}</small><span class="a-mine__t${t.startsWith('Live') ? ' is-live' : ''}">${t}</span><span class="a-mine__p"><b>${p}</b> очков прогноз</span></div></div>`).join('')}
      </div>
    </section>

    <section class="a-panel a-ml">
      <div class="a-ph"><h3>Матчи</h3><div class="a-chips"><button type="button" aria-pressed="true">Все</button><button type="button">Live · 2</button><button type="button">Мои игроки</button><button type="button">Завершённые</button></div></div>
      ${ТУРНИРЫ.map((т) => `<div class="a-tour"><span class="a-tour__g">${т.игра}</span><b>${т.имя}</b><small>${т.где}</small><span class="a-tour__n">${т.матчи.length}</span></div>${т.матчи.map(матчСтрокаГл).join('')}`).join('')}
    </section>
  </div>

  <aside class="a-home__side">
    <section class="a-panel a-quests">
      <div class="a-ph"><h3>Квесты дня</h3><span class="a-muted">до 00:00</span></div>
      ${[['Сделай 3 прогноза', 1, 3, '+30'], ['Открой сундук', 0, 1, '+20'], ['Собери пятёрку', 1, 1, '+50']].map(([t, n, всего, н]) => `
      <div class="a-q${n >= всего ? ' is-done' : ''}"><span class="a-q__t"><b>${t}</b><small>${n} / ${всего}</small></span><span class="a-bar" style="--p: ${(n / всего) * 100}%"><i></i></span><em>${н}</em></div>`).join('')}
    </section>
    <section class="a-panel a-acc">
      <div class="a-ph"><h3>Сундук точности</h3><span class="a-muted">4 из 15</span></div>
      <div class="a-acc__seg">${Array.from({ length: 15 }, (_, i) => `<i${i < 4 ? ' class="is-on"' : ''}></i>`).join('')}</div>
      <p class="a-acc__t">Ещё 11 верных прогнозов — <b>сундук Prism</b></p>
    </section>
    <section class="a-panel a-lead">
      <div class="a-ph"><h3>Лидеры недели</h3><a class="a-link">Все →</a></div>
      ${[['1', 'Kotik_TS', '2 340'], ['2', 'ArtStyleFan', '2 295'], ['3', 'wnd', '2 210'], ['4', 'mirage', '2 106'], ['5', 'Nova', '2 044']].map(([n, ник, о]) => `<div class="a-lr"><span class="a-lr__n">${n}</span><span class="a-ava a-ava--s">${ник[0]}</span><b>${ник}</b><em>${о}</em></div>`).join('')}
      <div class="a-lr a-lr--me"><span class="a-lr__n">—</span><span class="a-ava a-ava--s">S</span><b>Skywrath_77</b><em>1 150</em></div>
    </section>
    <section class="a-panel a-tw">
      <div class="a-ph"><h3>Команда недели</h3><span class="a-muted">очки за неделю</span></div>
      ${[['1', 'Yatoro', 'ts', '96.4'], ['2', 'Malr1ne', 'flc', '91.0'], ['3', 'Collapse', 'ts', '88.2'], ['4', '9Class', 'pv', '84.7'], ['5', 'Miposhka', 'ts', '79.5']].map(([поз, ник, к, о]) => `<div class="a-tw__r"><span class="a-pos">${поз}</span>${лого(к)}<b>${ник}</b><em>${о}</em></div>`).join('')}
    </section>
  </aside>
</main></div>`

  /* ───────── Галерея карт на покупку ───────── */
  const ГАЛЕРЕЯ = [['9class', 1450], ['pure', 1380], ['satanic', 1120], ['collapse', 980], ['malrine', 760], ['yatoro', 820], ['noone', 690], ['rue', 540], ['miposhka', 420], ['dukalis', 310]]
  const СУНДУКИ = [['Обычный', '3 карты · Base и Holo', '300', 'Holo 25%'], ['Командный', '4 карты · игрок твоей команды', '600', 'Prism 10%'], ['Легендарный', '5 карт · Legend гарантирован', '1 500', 'Legend 100%']]
  const галерея = () => `
<div class="ap ap--gal">${шапка('Коллекция')}
<main class="a-page a-gal">
  <div class="a-gal__head">
    <div><h1 class="a-h1 a-h1--page">Все карты</h1><p class="a-lead">Карты про-игроков сезона 1. Купить за монеты или выбить из сундука.</p></div>
    <div class="a-seg a-seg--lg"><button type="button" aria-pressed="true">Купить</button><button type="button" aria-pressed="false">Моя коллекция · 3</button></div>
  </div>
  <div class="a-filters">
    <div class="a-chips"><button type="button" aria-pressed="true">Dota 2</button><button type="button">LoL</button><button type="button">CS 2</button></div>
    <span class="a-filters__sep"></span>
    <div class="a-chips"><button type="button" aria-pressed="true">Все позиции</button>${[1, 2, 3, 4, 5].map((n) => `<button type="button">Pos ${n}</button>`).join('')}</div>
    <span class="a-filters__sep"></span>
    <div class="a-chips"><button type="button">Legend</button><button type="button">Prism</button><button type="button">Holo</button><button type="button">Base</button></div>
    <span class="a-filters__sort">Сначала дорогие ↓</span>
  </div>
  <div class="a-gal__body">
    <div class="a-gal__grid">${ГАЛЕРЕЯ.map(([ид, цена]) => `<div class="a-gc">${картаF(ид, 172)}<div class="a-gc__buy"><span class="a-gc__price"><i></i><b>${цена.toLocaleString('ru')}</b></span><button type="button" class="a-btn a-btn--sm${ид === '9class' ? ' a-btn--pri' : ''}">Купить</button></div></div>`).join('')}</div>
    <aside class="a-gal__side">
      <section class="a-panel"><div class="a-ph"><h3>Сундуки</h3><span class="a-muted">шансы открыты</span></div>
        ${СУНДУКИ.map(([t, s, ц, шанс], i) => `<div class="a-chestrow${i === 1 ? ' is-pick' : ''}"><span class="a-chestrow__box a-chestrow__box--${i}"></span><span><b>${t}</b><small>${s}</small><small class="a-chestrow__odds">${шанс}</small></span><button type="button" class="a-btn a-btn--sm${i === 1 ? ' a-btn--pri' : ''}"><i class="a-coin"></i>${ц}</button></div>`).join('')}
      </section>
      <section class="a-panel"><div class="a-ph"><h3>Пыль</h3><span class="a-muted">из повторов</span></div>
        <div class="a-dust"><b>240</b><small>из 400 — хватит на любую карту Holo</small><span class="a-bar" style="--p: 60%"><i></i></span></div>
      </section>
    </aside>
  </div>
</main></div>`

  /* ───────── Открытие сундука — поп-ап поверх галереи (заход 2, дирижёр 01.10: «это не открытие, а открытый сундук»):
     в окне — живой 3D-сундук страницы «Сундук» сайта (chest.html?embed): клик — сундук открывается, карты выходят по одной.
     В мелких кадрах сцены нет (WebGL на каждый кадр — тяжело) — там рисунок сундука ─────────────── */
  const сундук = (подложка = галерея()) => `
<div class="ap ap--chest-pop"><div class="a-under">${подложка}</div>
<div class="a-modal-bg"></div>
<div class="a-modal a-modal--open" role="dialog" aria-label="Открытие сундука">
  <div class="a-modal__top"><span class="a-tag">Командный сундук · PARIVISION</span><span class="a-muted">4 карты · игрок твоей команды гарантирован</span><a class="a-link">Пропустить →</a></div>
  <div class="a-open3d"><i class="a-open3d__box"></i><iframe class="a-open3d__frame" data-src="/p-fw3k/site/chest.html?form=chest&type=legend&embed" title="Открытие сундука"></iframe></div>
  <div class="a-odds">${[['Legend', '2%', 'legend'], ['Prism', '10%', 'prism'], ['Holo', '30%', 'holo'], ['Base', '58%', 'base']].map(([t, p, к]) => `<span class="a-odds__i a-odds__i--${к}"><b>${t}</b><em>${p}</em></span>`).join('')}<small>Повтор карты → пыль</small></div>
</div></div>`

  /* ───────── Онбординг: 5 шагов ───────── */
  const ШАГИ = [
    ['Вход в 1 клик', '+100 монет'],
    ['Любимая команда', 'фан-лига'],
    ['Стартовый сундук', '3 карты'],
    ['Первый прогноз', 'до +150 монет'],
    ['Ты в игре', 'жетон новичка'],
  ]
  const онбординг = (n, { заголовок, лид, тело, награда, пояснение, кнопка, монеты }) => `
<div class="ap ap--ob">${шапкаОнбординга(монеты)}
<main class="a-page a-ob">
  <aside class="a-ob__rail">
    <div class="a-badge"><i class="a-badge__medal${n === 5 ? ' a-badge__medal--silver' : ''}">F</i><span><b>Жетон новичка</b><small>${n < 5 ? `${5 - n} ${5 - n === 1 ? 'шаг' : 'шага'} до серебра` : 'Серебро'}</small></span></div>
    <div class="a-ob__prog"><span class="a-bar" style="--p: ${((n - 1) / 4) * 100}%"><i></i></span><small>${n} из 5</small></div>
    <ol class="a-steps">${ШАГИ.map(([t, s], i) => `<li class="${i + 1 < n ? 'is-done' : i + 1 === n ? 'is-now' : ''}"><span class="a-steps__n">${i + 1 < n ? '✓' : i + 1}</span><span><b>${t}</b><small>${s}</small></span></li>`).join('')}</ol>
    <p class="a-ob__note">Путь можно бросить и вернуться — он ждёт в профиле, награды не сгорают.</p>
  </aside>
  <section class="a-ob__main">
    <span class="a-kick">Шаг ${n} из 5</span>
    <h1 class="a-h1">${заголовок}</h1>
    <p class="a-lead">${лид}</p>
    <div class="a-ob__body">${тело}</div>
    <footer class="a-ob__foot"><span class="a-reward">Награда шага: <b>${награда}</b></span><small>${пояснение}</small><button type="button" class="a-btn a-btn--pri a-btn--lg">${кнопка}</button></footer>
  </section>
</main></div>`

  const таблицаЛидеров = (заголовок, хвост, строки, я) => `
<div class="a-panel a-mini-lead"><div class="a-ph"><h3>${заголовок}</h3><span class="a-muted">${хвост}</span></div>
  ${строки.map(([n, ник, о]) => `<div class="a-lr"><span class="a-lr__n">${n}</span><span class="a-ava a-ava--s">${ник[0]}</span><b>${ник}</b><em>${о}</em></div>`).join('')}
  <div class="a-lr a-lr--gap"><span class="a-lr__n">…</span><small>${я[0]}</small></div>
  <div class="a-lr a-lr--me"><span class="a-lr__n">—</span><span class="a-ava a-ava--s">S</span><b>${я[1]}</b><em>${я[2]}</em></div>
</div>`

  // Данные шагов онбординга — общие; оболочку (как шаги показаны) задаёт раскладка набора
  const ОНБ_ДАННЫЕ = [
    {
      заголовок: 'Сначала — кто ты', лид: 'Вход в один клик, без пароля и анкеты. Ник подтянется из профиля — поменяешь, если хочешь.',
      тело: `<div class="a-cols">
        <div class="a-login">${[['S', 'Steam', 'Подтянем ник и любимых героев', true], ['T', 'Telegram', 'И уведомления о матчах туда же'], ['G', 'Google', 'Аккаунт Google или Android']].map(([б, t, s, вкл]) => `<button type="button" class="a-opt${вкл ? ' is-on' : ''}"><span class="a-opt__ic">${б}</span><span><b>${t}</b><small>${s}</small></span><em>${вкл ? '✓ подключён' : '1 клик'}</em></button>`).join('')}
          <p class="a-muted">Нет этих аккаунтов? <a class="a-link">Войти по почте</a> — пришлём код.</p></div>
        <div class="a-stack"><label class="a-field"><small>Ник в игре</small><span>Skywrath_77</span></label>
          ${таблицаЛидеров('Так тебя увидят в лидерах', 'неделя', [['1', 'Kotik_TS', '2 340'], ['2', 'ArtStyleFan', '2 295'], ['3', 'wnd', '2 210']], ['ещё 48 210 игроков', 'Skywrath_77', '0 · новичок'])}</div>
      </div>`,
      награда: '+100 монет', пояснение: 'Монеты не покупаются и не выводятся', кнопка: 'Это я', монеты: '1 000',
    },
    {
      заголовок: 'За кого болеешь?', лид: 'Игрок этой команды точно будет в стартовом сундуке, а ты попадёшь в её фан-лигу — отдельную таблицу болельщиков.',
      тело: `<div class="a-cols">
        <div class="a-teams">${[['ts', 'Team Spirit'], ['tun', 'Tundra Esports'], ['pv', 'PARIVISION', 1], ['bb', 'BetBoom Team'], ['gg', 'Gaimin Gladiators'], ['flc', 'Team Falcons'], ['tl', 'Team Liquid'], ['aur', 'Aurora'], ['yg', 'Yangon Galacticos']].map(([к, t, вкл]) => `<button type="button" class="a-teamt${вкл ? ' is-on' : ''}">${лого(к)}<b>${t}</b>${вкл ? '<em>✓</em>' : ''}</button>`).join('')}</div>
        ${таблицаЛидеров('Фан-лига PARIVISION', '12 480 болельщиков', [['1', 'Kotik_TS', '2 340'], ['2', 'shamon', '2 118'], ['3', 'drowdawr', '1 960']], ['ещё 12 476', 'Skywrath_77', '0 · ты здесь'])}
      </div>`,
      награда: 'фан-лига PARIVISION', пояснение: 'Команду можно сменить в профиле раз в сезон', кнопка: 'Болею за PARIVISION', монеты: '1 100',
    },
    {
      заголовок: 'Стартовый сундук', лид: 'Три карты про-игроков. Гарантия: один из них — игрок твоей команды, редкость Holo и выше.',
      тело: `<div class="a-chest">
        <div class="a-chest__guar"><span class="a-tag">Гарантия</span><b>Игрок PARIVISION · Holo и выше</b><span class="a-tag a-tag--q">Шансы: Legend 1% · Prism 7% · Holo 22%</span></div>
        <div class="a-chest__cards">${['pure', '9class', 'yatoro'].map((ид, i) => `<div class="a-chest__c${i === 1 ? ' is-best' : ''}">${картаF(ид, i === 1 ? 188 : 160)}<small>${i === 1 ? 'Твоя команда · Legend' : РЕДКОСТЬ[ИГРОКИ[ид].ред]}</small></div>`).join('')}</div>
      </div>`,
      награда: '3 карты', пояснение: 'Повтор карты превращается в пыль — из пыли собирается любая карта', кнопка: 'Забрать в коллекцию', монеты: '1 100',
    },
    {
      заголовок: 'Первый прогноз', лид: 'Матч сегодня в 18:00, твой 9Class играет. Три вопроса — по тапу, без денег. Верный ответ — монеты.',
      тело: `<div class="a-cols a-cols--pred">
        <div class="a-panel a-pm"><div class="a-pm__top"><span class="a-muted">DreamLeague S27 · Bo3 · сегодня 18:00</span></div>
          <div class="a-pm__teams"><span>${лого('pv')}<b>PARIVISION</b></span><i>vs</i><span>${лого('bb')}<b>BetBoom Team</b></span></div></div>
        <div class="a-qs">${[['Кто возьмёт карту 1?', [['PARIVISION', '61%', 1], ['BetBoom', '39%']], '+50'], ['Первая кровь', [['PARIVISION', '54%'], ['BetBoom', '46%', 1]], '+50'], ['Больше 45 убийств на карте 1?', [['Да', '47%'], ['Нет', '53%', 1]], '+50']].map(([в, вар, н], i) => `
          <div class="a-qq"><span class="a-qq__n">${i + 1}</span><b>${в}</b><div class="a-qq__opts">${вар.map(([t, p, вкл]) => `<button type="button" class="js-pick${вкл ? ' is-on' : ''}" aria-pressed="${вкл ? 'true' : 'false'}"><span>${t}</span><em>${p}</em></button>`).join('')}</div><em class="a-qq__r">${н}</em></div>`).join('')}</div>
      </div>`,
      награда: 'до +150 монет', пояснение: 'Итог — после матча, монеты придут сами', кнопка: 'Отправить прогноз', монеты: '1 100',
    },
    {
      заголовок: 'Ты в игре', лид: 'Жетон новичка стал серебряным. Дальше — сегодняшний матч и квесты дня.',
      тело: `<div class="a-done">
        <div class="a-done__tiles">${[['1 150', 'монет'], ['3', 'карты в коллекции'], ['3', 'прогноза на 18:00'], ['#12 480', 'в фан-лиге PV']].map(([v, t]) => `<div class="a-panel a-tile"><b>${v}</b><small>${t}</small></div>`).join('')}</div>
        <div class="a-panel a-next"><div class="a-ph"><h3>Что дальше</h3></div>
          ${[['18:00', 'PARIVISION — BetBoom', 'твой прогноз засчитают после матча'], ['Сегодня', 'Квесты дня', '3 задания, до +100 монет'], ['15 верных', 'Сундук точности', 'Prism за серию прогнозов']].map(([k, t, s]) => `<div class="a-next__r"><em>${k}</em><span><b>${t}</b><small>${s}</small></span><i>→</i></div>`).join('')}</div>
      </div>`,
      награда: 'серебряный жетон', пояснение: 'Путь новичка сохранён в профиле', кнопка: 'На главную', монеты: '1 150',
    },
  ]

  /* ───────── Страница игрока ───────── */
  const страницаИгрока = () => {
    const maxМ = Math.max(...ГЕРОИ.map((h) => h.м))
    return `
<div class="ap ap--pl">${шапка('Коллекция')}
<main class="a-page a-pl">
  <div class="a-crumbs"><a class="a-link">Коллекция</a><i>/</i><a class="a-link">PARIVISION</a><i>/</i><span>9Class</span></div>
  <section class="a-panel a-plh">
    <div class="a-plh__card">${картаИгрока(250)}</div>
    <div class="a-plh__who">
      <div class="a-plh__team">${лого('pv')}<b>PARIVISION</b><span class="a-tag">Pos 4 · Support</span></div>
      <h1 class="a-plh__nick">9Class</h1>
      <p class="a-plh__name"><i class="player-card__flag player-card__flag--ru"></i>Эдгар Налтакян · 23 года · Россия</p>
      <div class="a-nums">${ИГРОК.цифры.map((ц) => `<span><b>${ц.v}</b><small>${ц.t}</small></span>`).join('')}</div>
      <div class="a-plh__acts"><button type="button" class="a-btn a-btn--pri">В состав</button><button type="button" class="a-btn">Следить</button><span class="a-muted">в 34% составов игроков</span></div>
    </div>
    <div class="a-plh__now">
      <span class="a-live"><i class="a-dot"></i>Сейчас</span>
      <b>${СЕЙЧАС.турнир}</b><small>${СЕЙЧАС.за}</small>
      <div class="a-plh__next"><span>${лого('pv')}<b>PV</b></span><i>vs</i><span>${моно('LGD')}<b>LGD</b></span></div>
      <small>${СЕЙЧАС.далее}</small>
      <button type="button" class="a-btn a-btn--sm a-btn--pri">Прогноз</button>
    </div>
  </section>

  <nav class="a-subnav">${['Обзор', 'Путь', 'Матчи', 'Герои', 'Медиа', 'Факты'].map((t, i) => `<a${i === 0 ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>

  <div class="a-pl__grid">
    <div class="a-pl__main">
      <section class="a-panel">
        <div class="a-ph"><h3>Хайлайты</h3><a class="a-link">Все видео →</a></div>
        <div class="a-vids">${ВИДЕО.slice(0, 5).map((v, i) => `<a class="a-vid${i === 0 ? ' a-vid--big' : ''}"><span class="a-vid__img"><img src="${превью(v.id)}" alt="" loading="lazy" /><i class="a-vid__play"></i></span><b>${v.имя}</b><small>${v.где}</small></a>`).join('')}</div>
      </section>

      <section class="a-panel">
        <div class="a-ph"><h3>Путь</h3><span class="a-muted">от пабликов до финала TI</span></div>
        <ol class="a-road">${ПУТЬ.map((п, i) => `<li class="${i === ПУТЬ.length - 1 ? 'is-now' : ''}"><span class="a-road__dot">${логоИли(п.лого, п.мон)}</span><span class="a-road__d">${п.с}${п.по !== п.с ? ` — ${п.по}` : ''}</span><b>${п.команда}</b><small>${п.что}</small></li>`).join('')}</ol>
        <blockquote class="a-quote">${ЦИТАТЫ.эра}<cite>— 9Class, 2026</cite></blockquote>
      </section>

      <section class="a-panel">
        <div class="a-ph"><h3>Трофеи</h3><span class="a-muted">5 титулов Tier 1</span></div>
        <div class="a-tbl">${ТРОФЕИ.map((т) => `<div class="a-tbl__r"><span class="a-place a-place--${т.место}">${т.место}</span><b>${т.турнир}</b><small>${т.финал}</small><span class="a-muted">${т.дата}</span><em>${т.приз}</em></div>`).join('')}</div>
      </section>

      <section class="a-panel">
        <div class="a-ph"><h3>Последние матчи</h3><span class="a-muted">профматчи · OpenDota</span></div>
        <div class="a-tbl">${МАТЧИ.slice(0, 7).map((м) => `<div class="a-tbl__r a-tbl__r--m${м.w ? ' is-w' : ''}"><img class="a-hero" src="${героиКартинка(м.герой)}" alt="" /><b>${м.лига}</b><span class="a-kda">${м.k} / ${м.d} / ${м.a}</span><span class="a-muted">${м.gpm} GPM</span><em>${м.w ? 'Победа' : 'Поражение'}</em><small>${м.д}</small></div>`).join('')}</div>
      </section>
    </div>

    <aside class="a-pl__side">
      <section class="a-panel a-info">
        <div class="a-info__h">${лого('pv')}<b>9Class</b></div>
        ${[['Полное имя', 'Эдгар Налтакян'], ['Родился', `${ИГРОК.родился} (23 года)`], ['Страна', 'Россия'], ['Команда', 'PARIVISION'], ['Позиция', '4 · Саппорт'], ['Активен', 'с 2020'], ['Призовые', ИГРОК.призовые], ['Лучший MMR', '16 000 · 1-й ранг']].map(([k, v]) => `<div class="a-info__r"><small>${k}</small><b>${v}</b></div>`).join('')}
      </section>
      <section class="a-panel">
        <div class="a-ph"><h3>Сигнатурные герои</h3></div>
        ${ГЕРОИ.map((h) => `<div class="a-hr"><img class="a-hero" src="${героиКартинка(h.id)}" alt="" /><span><b>${h.имя}</b><small>${h.м} матчей · ${h.kda}</small></span><span class="a-bar" style="--p: ${(h.м / maxМ) * 100}%"><i></i></span><em>${винрейт(h)}%</em></div>`).join('')}
      </section>
      <section class="a-panel">
        <div class="a-ph"><h3>Факты</h3></div>
        <div class="a-facts">${ФАКТЫ.slice(0, 4).map((ф) => `<div class="a-fact"><b>${ф.big}</b><small>${ф.t}</small></div>`).join('')}</div>
      </section>
      <section class="a-panel">
        <div class="a-ph"><h3>Соцсети</h3></div>
        ${ИГРОК.соцсети.map((с) => `<div class="a-soc"><span class="a-soc__ic a-soc__ic--${с.id}">${{ tg: 'TG', tw: 'TW', ig: 'IG', vk: 'VK' }[с.id]}</span><span><b>${с.имя}</b><small>${с.ник}</small></span><em>${с.цифра || ''}</em></div>`).join('')}
      </section>
      <section class="a-panel">
        <div class="a-ph"><h3>Состав PARIVISION</h3></div>
        ${СОСТАВ.map((с) => `<div class="a-rost${с.я ? ' is-me' : ''}"><span class="a-pos">${с.поз}</span><b>${с.ник}</b></div>`).join('')}
      </section>
    </aside>
  </div>
</main></div>`
  }

  /* ───────── Экраны и страница набора ───────── */
  // [группа, подпись, экран, что на нём] — миниатюры идут группами: сначала страницы сайта, отдельно — онбординг (дирижёр 01.10)
  // Раскладка набора (L из _раскладки.js) подменяет экраны: главная, галерея, игрок, оболочка онбординга, подписи
  const экраны = (L = {}) => {
    const гал = L.галерея || галерея, онб = L.онб || онбординг, ч = L.что || {}, м = window.МАТЧИ || { что: {} } // на загрузке _сайт.js файла матчей ещё нет — экраны пересобирает набор()
    return [
      ['Страницы', 'Главная', L.главная || главная, ч.главная || 'Матч дня, твои игроки, лента матчей, квесты и лидеры'],
      // Расписание и матч — _matches.js (дирижёр 05.10)
      ['Страницы', 'Расписание', L.расписание || м.расписание, ч.расписание || м.что.расписание],
      ['Страницы', 'Матч · live', L.матч || м.матч, ч.матч || м.что.матч],
      ['Страницы', 'Галерея карт', гал, ч.галерея || 'Все карты на покупку: игры, позиции, редкость; сбоку сундуки и пыль'],
      ['Страницы', 'Открытие сундука', () => сундук(гал()), 'Поп-ап поверх галереи: живой 3D-сундук сайта — клик открывает, карты выходят по одной'],
      ['Страницы', 'Страница игрока', L.игрок || страницаИгрока, ч.игрок || 'Как Liquipedia, но с контентом: хайлайты, путь, трофеи, факты'],
      ...['1 · Вход', '2 · Команда', '3 · Сундук', '4 · Прогноз', '5 · Готово'].map((t, i) => ['Онбординг', t, () => онб(i + 1, ОНБ_ДАННЫЕ[i]),
        ['Вход в 1 клик, ник сразу виден в таблице лидеров', 'Любимая команда → гарантия в сундуке и фан-лига', 'Три карты, игрок своей команды гарантирован', 'Три вопроса по тапу на сегодняшний матч', 'Итог пути и что делать дальше'][i]]),
    ]
  }
  let ЭКРАНЫ = экраны()

  // Полный экран (?полный=N): экран N на всё окно, листается сама страница. Сверху плашка — крупная «Выйти» и соседние экраны;
  // снизу док из мелких превью всех экранов — клик сразу открывает другой экран на весь экран (дирижёр 01.10)
  function полный(n, { номер, имя }) {
    const корень = document.getElementById('набор')
    const i = Math.min(ЭКРАНЫ.length, Math.max(1, n)) - 1
    const ссылка = (k) => { const u = new URL(location.href); u.searchParams.set('полный', k + 1); return u.pathname + u.search }
    // Выход — в лабораторию песочницы (разбор этой лабы), а не на голую страницу набора (дирижёр 01.10)
    const разбор = decodeURIComponent(location.pathname.split('/lab-files/')[1]?.split('/')[0] || '')
    const назад = new URLSearchParams(location.search).get('назад') // откуда открыли: лаба или «Концепты»
    const кНабору = назад ? `/${назад}` : разбор ? `/#/lab/${encodeURIComponent(разбор)}` : (() => { const u = new URL(location.href); u.searchParams.delete('полный'); return u.pathname + u.search })()
    document.body.classList.add('sx-full')
    корень.innerHTML = `<div class="sx-bar"><a class="sx-bar__exit" href="${кНабору}">✕ Выйти из полного экрана</a><b>Набор ${номер} · ${имя} — ${ЭКРАНЫ[i][0]} · ${ЭКРАНЫ[i][1]}</b>
      <span>${i > 0 ? `<a class="sx-bar__nav" href="${ссылка(i - 1)}">‹ ${ЭКРАНЫ[i - 1][1]}</a>` : ''}${i < ЭКРАНЫ.length - 1 ? `<a class="sx-bar__nav" href="${ссылка(i + 1)}">${ЭКРАНЫ[i + 1][1]} ›</a>` : ''}</span></div>
      <div class="sx-scr">${ЭКРАНЫ[i][2]()}</div>
      <nav class="sx-dock" aria-label="Все экраны">${ЭКРАНЫ.map(([г, t, f], k) => `<div class="sx-dock__it${k === i ? ' is-on' : ''}" role="link" tabindex="0" data-href="${ссылка(k)}"><div class="sx-dock__view"><div class="sx-dock__in">${f()}</div></div><small>${г === 'Онбординг' ? 'Онб. ' : ''}${t}</small></div>`).join('')}</nav>`
    // Превью дока: экран в ширину окна, ужат под ширину ячейки
    const ужать = () => корень.querySelectorAll('.sx-dock__view').forEach((в) => { в.style.setProperty('--k', в.clientWidth / innerWidth); в.style.setProperty('--sw', `${innerWidth}px`) })
    ужать(); addEventListener('resize', ужать)
    // Превью — не <a>: внутри экранов свои ссылки, а ссылка в ссылке ломает разметку
    корень.querySelectorAll('.sx-dock__it').forEach((д) => { д.addEventListener('click', () => { location.href = д.dataset.href }); д.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.href = д.dataset.href }) })
    корень.querySelectorAll('.sx-scr .a-open3d__frame').forEach((ф) => { ф.src = ф.dataset.src })
    addEventListener('keydown', (e) => { if (e.key === 'Escape') location.href = кНабору; if (e.key === 'ArrowRight' && i < ЭКРАНЫ.length - 1) location.href = ссылка(i + 1); if (e.key === 'ArrowLeft' && i > 0) location.href = ссылка(i - 1) })
    const s = document.createElement('script'); s.src = '/p-fw3k/site/app.js'; document.body.append(s)
  }

  // Мобильная версия (дирижёр 05.10: «мобильные версии всех страниц, рядом с каждым экраном»): та же разметка экрана в телефоне 390 px —
  // перестраивают её правила _мобайл.css (container query «ph»), снизу — панель вкладок; у онбординга панели нет
  const ВКЛАДКИ = [['⌂', 'Главная'], ['⚔', 'Матчи'], ['▣', 'Сундуки'], ['❖', 'Коллекция'], ['◉', 'Профиль']]
  const ВКЛАДКА_ЭКРАНА = { 'Главная': 0, 'Расписание': 1, 'Матч · live': 1, 'Открытие сундука': 2, 'Галерея карт': 3, 'Страница игрока': 3 }
  const телефон = (i, h) => {
    const [г, t] = ЭКРАНЫ[i], в = ВКЛАДКА_ЭКРАНА[t]
    return `<div class="ph">${h}${г === 'Онбординг' ? '' : `<nav class="ph-tabs">${ВКЛАДКИ.map(([и, имя], k) => `<a${k === в ? ' aria-current="page"' : ''}><i>${и}</i><span>${имя}</span></a>`).join('')}</nav>`}</div>`
  }
  const ШИРИНА = 1360, ТЕЛ_В = 844 // экран десктопа и высота экрана телефона, px

  function набор({ номер, имя, описание, раскладка }) {
    ЭКРАНЫ = экраны(window.РАСКЛАДКИ?.[раскладка])
    const весь = +new URLSearchParams(location.search).get('полный')
    if (весь) return полный(весь, { номер, имя })
    const корень = document.getElementById('набор')
    const html = ЭКРАНЫ.map(([, , f]) => f())
    const группы = [...new Set(ЭКРАНЫ.map(([г]) => г))]
    корень.innerHTML = `
<div class="sx-head"><h2>Набор ${номер} · ${имя}</h2><p>${описание}</p></div>
<div class="sx-tools"><b id="экран-имя"></b><button type="button" class="sx-btn" data-step="-1">‹</button><button type="button" class="sx-btn" data-step="1">›</button><a class="sx-btn sx-btn--full" id="экран-весь" target="_top">На весь экран ↗</a></div>
<div class="sx-stage sx-duo"><div class="sx-desk"><div class="sx-screen" id="экран"></div></div><div class="sx-phone"><div class="sx-phone__scr" id="экран-тел"></div></div></div>
<div class="sx-all">${группы.map((г) => `<h3>${г} <small>клик — открыть наверху; экран листается внутри окна</small></h3>
  <div class="sx-thumbs">${ЭКРАНЫ.map(([гр, t, , s], i) => гр !== г ? '' : `<div class="sx-th" role="button" tabindex="0" data-i="${i}"><div class="sx-th__pair"><div class="sx-th__view"><div class="sx-th__in">${html[i]}</div></div><div class="sx-th__ph"><div class="sx-th__phin">${телефон(i, html[i])}</div></div></div><div class="sx-th__cap"><b>${t}</b><small>${s}</small></div></div>`).join('')}</div>`).join('')}
</div>`
    const экран = document.getElementById('экран')
    // Все экраны лежат в сцене сразу (наклон карт сайта вешается на загрузке), виден один
    экран.innerHTML = html.map((h, i) => `<div class="sx-scr" data-i="${i}" hidden>${h}</div>`).join('')
    const тел = document.getElementById('экран-тел'), окно = экран.parentElement
    тел.innerHTML = html.map((h, i) => `<div class="sx-scr" data-i="${i}" hidden>${телефон(i, h)}</div>`).join('')
    корень.querySelectorAll('.sx-stage .a-open3d__frame').forEach((ф) => { ф.src = ф.dataset.src })
    let текущий = 0
    const показать = (i, прокрутить) => {
      корень.querySelectorAll('.sx-stage .sx-scr').forEach((x) => { x.hidden = +x.dataset.i !== i })
      корень.querySelectorAll('.sx-th').forEach((б) => б.classList.toggle('is-on', +б.dataset.i === i))
      const u = new URL(location.href); u.searchParams.set('экран', i + 1); history.replaceState(null, '', u)
      текущий = i
      document.getElementById('экран-имя').textContent = `${ЭКРАНЫ[i][0]} · ${ЭКРАНЫ[i][1]}`
      const п = new URL(location.href); п.searchParams.delete('экран'); п.searchParams.set('полный', i + 1)
      try { if (window.top !== window && window.top.location.hash) п.searchParams.set('назад', window.top.location.hash) } catch {}
      document.getElementById('экран-весь').href = п.pathname + п.search
      окно.scrollTop = 0; тел.scrollTop = 0
      if (прокрутить) окно.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    корень.querySelectorAll('[data-step]').forEach((б) => б.addEventListener('click', () => показать((текущий + +б.dataset.step + ЭКРАНЫ.length) % ЭКРАНЫ.length, false)))
    // Кадр — не <button>: внутри экрана свои кнопки, а кнопка в кнопке ломает разметку
    корень.querySelectorAll('.sx-th').forEach((б) => {
      б.addEventListener('click', () => показать(+б.dataset.i, true))
      б.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); показать(+б.dataset.i, true) } })
    })
    // Десктоп в окне — в настоящую ширину 1360, ужат zoom под ширину окна (рядом телефон). Мелкие кадры: пара «десктоп + телефон»,
    // ширина телефона — чтобы высоты совпали: тел = 0.226 × (кадр − зазор)
    const ужать = () => {
      экран.style.zoom = окно.clientWidth / ШИРИНА
      корень.querySelectorAll('.sx-th__pair').forEach((п) => п.style.setProperty('--phw', `${((п.clientWidth - 8) * 0.2261).toFixed(1)}px`))
      корень.querySelectorAll('.sx-th__view').forEach((в) => { в.style.setProperty('--k', в.clientWidth / ШИРИНА); в.style.setProperty('--sw', `${ШИРИНА}px`) })
      корень.querySelectorAll('.sx-th__ph').forEach((т) => т.style.setProperty('--k', т.clientHeight / ТЕЛ_В))
    }
    // Выбор в вопросах и голосовании — переключается внутри своей группы
    корень.addEventListener('click', (e) => {
      const б = e.target.closest('.js-pick'); if (!б || б.closest('.sx-th')) return
      б.parentElement.querySelectorAll('.js-pick').forEach((x) => { x.setAttribute('aria-pressed', x === б); x.classList.toggle('is-on', x === б) })
    })
    const n = Math.min(ЭКРАНЫ.length, Math.max(1, +new URLSearchParams(location.search).get('экран') || 1))
    показать(n - 1, false)
    ужать(); addEventListener('resize', ужать)
    // Наклон и блик карт — кодом сайта
    const s = document.createElement('script'); s.src = '/p-fw3k/site/app.js'; document.body.append(s)
  }

  // Помощники и данные — для раскладок наборов (_раскладки.js)
  window.САЙТ = { набор, h: { лого, моно, логоИли, картаF, ИГРОКИ, РЕДКОСТЬ, шапка, шапкаОнбординга, ТУРНИРЫ, матчСтрокаГл, таблицаЛидеров,
    ГАЛЕРЕЯ, СУНДУКИ, ШАГИ, ОНБ_ДАННЫЕ, главная, галерея, страницаИгрока, онбординг } }
})()
