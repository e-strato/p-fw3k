/* Лаба «Сайт в одном стиле» — набор 8 «Киберспорт сейчас» (Claude-B, 01.10): по разбору современных сайтов киберспорта
   (Fnatic, Team Liquid, LoL Esports, Esports World Cup, BLAST.tv — шрифты и цвета взяты из их CSS). Раскладка esp добавляется
   к раскладкам Claude-A (_раскладки.js) — его файлы не трогаем, только Object.assign.
     Шапка    — живая плашка идущего матча по центру (Fnatic «FNC vs BIG · Live Now») и поиск ⌘K (BLAST);
     Главная  — 2/3 + 1/3: герой-карточка матча дня с фото во всю высоту и приклеенными снизу мини-матчами (Fnatic),
                лента «Раньше / Сейчас / Позже сегодня» рядами «тег · лого · счёт · лого · тег», снизу турнир и Bo (LoL Esports),
                справа пятёрка, рейтинг (Power Rankings LoL), квесты, сундук точности;
     Галерея  — плитки сундуков: арт сверху, список с пилюлями справа (плитки игр BLAST), фильтры пилюлями, сетка карт;
     Игрок    — герой-карточка: фото во всю высоту, имя поверх затемнения (Fnatic), огромные цифры с мелкой подписью (EWC);
     Онбординг — шаг в большой скруглённой карточке по центру, точки шагов сверху, справа колонка «что получишь» с цифрами.
   Данные — общие (_сайт.js, ../страница-игрока/_игрок.js); расписание дня и изменения цен — условные. */
(() => {
  const { лого, моно, логоИли, картаF, ИГРОКИ, РЕДКОСТЬ, ГАЛЕРЕЯ, СУНДУКИ, ШАГИ } = САЙТ.h
  const фото = (ид) => `/p-fw3k/site/img/players/${ИГРОКИ[ид].фото || '_silhouette.png'}`
  const цена = (n) => `<span class="a-gc__price"><i></i><b>${n.toLocaleString('ru')}</b></span>`
  const стрелка = '<i class="l8-arr">→</i>'

  /* ── Шапка: бренд, вкладки, живая плашка матча, поиск ⌘K, монеты ── */
  const шапкаЕсп = (текущий = 'Главная') => `
<header class="a-hd l8-hd"><div class="a-hd__in">
  <a class="a-brand"><i class="a-brand__mark">F</i><span>Fantasy <b>Dota 2</b></span></a>
  <nav class="a-nav">${['Главная', 'Матчи', 'Сундуки', 'Коллекция', 'Лидеры', 'Квесты'].map((t) => `<a${t === текущий ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <a class="l8-livepill">${лого('ts')}<b>TS</b><em>1 : 0</em><b>TUN</b>${лого('tun')}<small><i class="a-dot"></i>Live · К2</small></a>
  <div class="a-hd__right"><span class="l8-search">Поиск<kbd>⌘K</kbd></span><span class="a-coins"><i></i><b>1 000</b></span><span class="a-ava">S</span></div>
</div></header>`

  /* ── Главная ── */
  // Лента дня: [группа, матчи]; матч — статус, время, команда A, команда B, турнир, формат, сколько моих
  const ЛЕНТА = [
    ['Раньше сегодня', [
      { ст: 'ft', t: '13:00', a: ['gg', 'GG', 2], b: ['flc', 'FLC', 1], тур: 'DreamLeague S27 · Плей-офф', bo: 'Bo3' },
    ]],
    ['Сейчас', [
      { ст: 'live', t: 'К2 · 27:41', a: ['ts', 'TS', 1], b: ['tun', 'TUN', 0], тур: 'DreamLeague S27 · Плей-офф', bo: 'Bo3', мои: 2 },
      { ст: 'live', t: 'К1 · 14:02', a: ['yg', 'YG', 0], b: ['', 'LVL', 0], тур: 'BLAST Slam VIII · Группа A', bo: 'Bo2' },
    ]],
    ['Позже сегодня', [
      { ст: 'up', t: '18:00', a: ['pv', 'PV', ''], b: ['bb', 'BB', ''], тур: 'DreamLeague S27 · Плей-офф', bo: 'Bo3', мои: 1 },
      { ст: 'up', t: '20:00', a: ['', 'G2', ''], b: ['', 'FNC', ''], тур: 'LEC Summer · Финал верхней сетки', bo: 'Bo5', игра: 'LoL' },
      { ст: 'up', t: '21:30', a: ['tl', 'TL', ''], b: ['aur', 'AUR', ''], тур: 'DreamLeague S27 · Плей-офф', bo: 'Bo3' },
    ]],
  ]
  const ряд = (м) => `
    <div class="l8-row l8-row--${м.ст} l8-lift">
      <div class="l8-row__top">
        <span class="l8-row__st">${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${м.ст === 'ft' ? 'Итог' : м.t}</span>
        <span class="l8-row__tm">${м.a[1]}${логоИли(м.a[0], м.a[1])}</span>
        <span class="l8-row__sc">${м.ст === 'up' ? '<small>vs</small>' : `<b>${м.a[2]}</b><i>:</i><b>${м.b[2]}</b>`}</span>
        <span class="l8-row__tm l8-row__tm--b">${логоИли(м.b[0], м.b[1])}${м.b[1]}</span>
        <span class="l8-row__act">${м.мои ? `<span class="l8-mine"><i class="a-star"></i>${м.мои}</span>` : ''}${м.ст === 'ft' ? '<button type="button" class="a-btn a-btn--sm">Повтор</button>' : `<button type="button" class="a-btn a-btn--sm${м.ст === 'live' ? ' a-btn--pri' : ''}">Прогноз ${стрелка}</button>`}</span>
      </div>
      <div class="l8-row__bot"><span>${м.игра ? `<em class="l8-game">${м.игра}</em>` : ''}${м.тур}</span><span>${м.bo}</span></div>
    </div>`

  const МОИ = [['9class', 'PV · 18:00', '18.9'], ['yatoro', 'TS · live', '21.4'], ['pure', 'TUN · live', '24.0'], ['rue', 'TS · live', '12.6'], ['collapse', 'TS · live', '14.5']]
  const РЕЙТИНГ = [['1', 'Kotik_TS', '2 340', '+2'], ['2', 'ArtStyleFan', '2 295', '−1'], ['3', 'wnd', '2 210', '+1'], ['4', 'mirage', '2 106', '0'], ['5', 'Nova', '2 044', '+3']]

  const главная = () => `
<div class="ap ap--home">${шапкаЕсп('Главная')}
<main class="l8-wrap l8-home">
  <div class="l8-home__main">
    <section class="l8-hero" style="--ta: var(--c-team-ts); --tb: var(--c-team-tun)">
      <div class="l8-hero__art">
        <img class="l8-hero__ph l8-hero__ph--a" src="/p-fw3k/site/img/players/yatoro.webp" alt="Yatoro" />
        <img class="l8-hero__ph l8-hero__ph--b" src="/p-fw3k/site/img/players/pure.webp" alt="Pure" />
        <div class="l8-hero__top"><span class="l8-pill l8-pill--live"><i class="a-dot"></i>Live · Карта 2 · 27:41</span><span class="l8-pill">DreamLeague S27 · Плей-офф · Bo3</span></div>
        <div class="l8-hero__score"><b>1</b><i>:</i><b>0</b></div>
        <div class="l8-hero__txt">
          <div><h1 class="l8-hero__h">Team Spirit — Tundra</h1><p>В матче твои Yatoro и Pure · прогноз <b>45.4 очка</b> на карту</p></div>
          <div class="l8-hero__acts"><button type="button" class="a-btn a-btn--lg l8-btn-w">Прогноз на карту 3 ${стрелка}</button><button type="button" class="a-btn a-btn--lg">Смотреть</button></div>
        </div>
      </div>
      <div class="l8-hero__strip">
        <div class="l8-mini"><small>DreamLeague S27 · Bo3</small><small>Сегодня, 18:00</small>
          <span>${лого('pv')}<b>PV</b><em>—</em></span><span>${лого('bb')}<b>BB</b><em>—</em></span></div>
        <div class="l8-mini"><small>DreamLeague S27 · Bo3</small><small>Итог · 13:00</small>
          <span>${лого('gg')}<b>GG</b><em>2</em></span><span class="is-lose">${лого('flc')}<b>FLC</b><em>1</em></span></div>
        <div class="l8-mini l8-mini--vote"><b>Кто возьмёт карту 3?</b><small>Угадаешь — +30 монет</small>
          <div class="l8-vote"><button type="button" class="js-pick" aria-pressed="true">Spirit <em>58%</em></button><button type="button" class="js-pick" aria-pressed="false">Tundra <em>42%</em></button></div></div>
      </div>
    </section>

    <section class="a-panel l8-feed">
      <div class="l8-feed__h"><h2 class="l8-h2">Сегодня</h2>
        <div class="l8-date"><button type="button" class="l8-ico">←</button><span>1 октября</span><button type="button" class="l8-ico">→</button></div>
        <div class="a-chips"><button type="button" aria-pressed="true">Все турниры</button><button type="button">Мои игроки · 3</button><button type="button">Dota 2</button><button type="button">LoL</button></div></div>
      ${ЛЕНТА.map(([г, мм]) => `<h3 class="l8-feed__g">${г}<small>${мм.length}</small></h3><div class="l8-feed__list">${мм.map(ряд).join('')}</div>`).join('')}
    </section>
  </div>

  <aside class="l8-home__side">
    <section class="a-panel l8-five">
      <div class="a-ph"><h3>Твоя пятёрка</h3><span class="a-muted">5 из 5 играют</span></div>
      <div class="l8-big"><b>91.0</b><small>очков прогноз на сегодня</small></div>
      <div class="l8-five__row">${МОИ.map(([ид, где, p]) => `<div class="l8-ph"><img src="${фото(ид)}" alt="" /><span><b>${ИГРОКИ[ид].ник}</b><small>${где}</small></span><em>${p}</em></div>`).join('')}</div>
      <button type="button" class="a-btn l8-wide">Изменить состав ${стрелка}</button>
    </section>
    <section class="a-panel">
      <div class="a-ph"><h3>Рейтинг недели</h3><a class="a-link">Все ${стрелка}</a></div>
      ${РЕЙТИНГ.map(([n, ник, о, д]) => `<div class="l8-rank"><span class="l8-rank__n">${n}</span><span class="a-ava a-ava--s">${ник[0]}</span><b>${ник}</b><small class="${д.startsWith('+') ? 'is-up' : д.startsWith('−') ? 'is-down' : ''}">${д}</small><em>${о}</em></div>`).join('')}
      <div class="l8-rank l8-rank--me"><span class="l8-rank__n">—</span><span class="a-ava a-ava--s">S</span><b>Skywrath_77</b><small class="is-up">+214</small><em>1 150</em></div>
    </section>
    <section class="a-panel">
      <div class="a-ph"><h3>Квесты дня</h3><span class="a-muted">до 00:00</span></div>
      ${[['Сделай 3 прогноза', 1, 3, '+30'], ['Открой сундук', 0, 1, '+20'], ['Собери пятёрку', 1, 1, '+50']].map(([t, n, всего, н]) => `
      <div class="a-q${n >= всего ? ' is-done' : ''}"><span class="a-q__t"><b>${t}</b><small>${n} / ${всего}</small></span><span class="a-bar" style="--p: ${(n / всего) * 100}%"><i></i></span><em>${н}</em></div>`).join('')}
    </section>
    <section class="a-panel l8-acc">
      <div class="a-ph"><h3>Сундук точности</h3><span class="a-muted">неделя</span></div>
      <div class="l8-big"><b>4<small> / 15</small></b><small>верных прогнозов — до сундука Prism ещё 11</small></div>
      <div class="a-acc__seg">${Array.from({ length: 15 }, (_, i) => `<i${i < 4 ? ' class="is-on"' : ''}></i>`).join('')}</div>
    </section>
  </aside>
</main></div>`

  /* ── Галерея: плитки сундуков, фильтры пилюлями, сетка карт ── */
  const ИЗМ = { '9class': '+4.2', pure: '+1.8', satanic: '−0.6', collapse: '+2.4', malrine: '−1.9', yatoro: '+0.7', noone: '+3.1', rue: '−0.4', miposhka: '0.0', dukalis: '−2.2' }
  const СУНД_СПИСОК = [
    [['Карт внутри', '3'], ['Редкость', 'Base и Holo'], ['Шанс Holo', '25%']],
    [['Карт внутри', '4'], ['Гарантия', 'игрок твоей команды'], ['Шанс Prism', '10%']],
    [['Карт внутри', '5'], ['Гарантия', 'Legend'], ['Повтор', 'в пыль']],
  ]
  const галерея = () => `
<div class="ap ap--gal">${шапкаЕсп('Коллекция')}
<main class="l8-wrap l8-gal">
  <div class="l8-gal__head">
    <div><h1 class="l8-h1">Карты</h1><p class="a-lead">Карты про-игроков сезона 1. Купить за монеты или выбить из сундука — шансы открыты.</p></div>
    <div class="a-seg a-seg--lg"><button type="button" aria-pressed="true">Купить</button><button type="button" aria-pressed="false">Моя коллекция · 3</button></div>
  </div>
  <div class="l8-tiles">${СУНДУКИ.map(([t, s, ц], i) => `
    <article class="l8-tile l8-tile--${i} l8-lift">
      <div class="l8-tile__art"><span><b>${t}</b><small>${s}</small></span><span class="a-chestrow__box a-chestrow__box--${i} l8-tile__box"></span></div>
      <div class="l8-tile__list">${СУНД_СПИСОК[i].map(([k, v]) => `<div><span>${k}</span><em>${v}</em></div>`).join('')}</div>
      <button type="button" class="a-btn${i === 1 ? ' a-btn--pri' : ''} l8-wide"><i class="a-coin"></i>${ц} · Открыть ${стрелка}</button>
    </article>`).join('')}</div>
  <div class="l8-flt">
    <div class="a-chips"><button type="button" aria-pressed="true">Dota 2</button><button type="button">LoL</button><button type="button">CS 2</button></div>
    <div class="a-chips"><button type="button" aria-pressed="true">Все позиции</button>${[1, 2, 3, 4, 5].map((n) => `<button type="button">Pos ${n}</button>`).join('')}</div>
    <div class="a-chips"><button type="button">Legend</button><button type="button">Prism</button><button type="button">Holo</button><button type="button">Base</button></div>
    <span class="l8-sort">Сначала дорогие ↓</span>
  </div>
  <div class="l8-grid">${ГАЛЕРЕЯ.map(([ид, ц]) => `
    <div class="l8-gc l8-lift">${картаF(ид, 176)}
      <div class="l8-gc__foot">${цена(ц)}<small class="${ИЗМ[ид].startsWith('+') ? 'is-up' : ИЗМ[ид].startsWith('−') ? 'is-down' : ''}">${ИЗМ[ид]}%</small><button type="button" class="a-btn a-btn--sm${ид === '9class' ? ' a-btn--pri' : ''}">Купить</button></div>
    </div>`).join('')}</div>
</main></div>`

  /* ── Страница игрока ── */
  const игрок = () => {
    const maxМ = Math.max(...ГЕРОИ.map((h) => h.м))
    return `
<div class="ap ap--pl">${шапкаЕсп('Коллекция')}
<main class="l8-wrap l8-pl">
  <div class="a-crumbs"><a class="a-link">Коллекция</a><i>/</i><a class="a-link">PARIVISION</a><i>/</i><span>9Class</span></div>
  <section class="l8-plh" style="--tc: ${ИГРОК.команда.цвет}">
    <div class="l8-plh__photo">
      <img src="${ИГРОК.фото}" alt="${ИГРОК.ник}" />
      <div class="l8-plh__who">
        <span class="l8-pill">${лого('pv')}PARIVISION · Pos 4 · ${ИГРОК.роль}</span>
        <h1 class="l8-plh__nick">${ИГРОК.ник}</h1>
        <p><i class="player-card__flag player-card__flag--ru"></i>${ИГРОК.имя} · ${ИГРОК.возраст} года · ${ИГРОК.страна}</p>
        <div class="l8-plh__acts"><button type="button" class="a-btn a-btn--lg l8-btn-w">В состав ${стрелка}</button><button type="button" class="a-btn a-btn--lg">Следить</button></div>
      </div>
    </div>
    <div class="l8-plh__nums">
      ${ИГРОК.цифры.map((ц, i) => `<div class="l8-num${i === 3 ? ' l8-num--gold' : ''}"><b>${ц.v}</b><small>${ц.t}</small></div>`).join('')}
      <div class="l8-plh__avg">${[['Убийства', ИГРОК.средние.k], ['Смерти', ИГРОК.средние.d], ['Помощь', ИГРОК.средние.a], ['GPM', ИГРОК.средние.gpm], ['XPM', ИГРОК.средние.xpm]].map(([k, v]) => `<span><small>${k}</small><b>${v}</b></span>`).join('')}<em>в среднем за карту</em></div>
    </div>
  </section>

  <nav class="l8-tabs">${['Обзор', 'Хайлайты', 'Путь', 'Трофеи', 'Матчи', 'Факты'].map((t, i) => `<a${i === 0 ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>

  <div class="l8-pl__grid">
    <div class="l8-pl__main">
      <section class="a-panel"><div class="a-ph"><h3>Хайлайты</h3><a class="a-link">Все видео ${стрелка}</a></div>
        <div class="a-vids">${ВИДЕО.slice(0, 5).map((v, i) => `<a class="a-vid${i === 0 ? ' a-vid--big' : ''}"><span class="a-vid__img"><img src="${превью(v.id)}" alt="" loading="lazy" /><i class="a-vid__play"></i></span><b>${v.имя}</b><small>${v.где}</small></a>`).join('')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Путь</h3><span class="a-muted">от пабликов до финала TI</span></div>
        <ol class="l8-path">${ПУТЬ.map((п, i) => `<li class="${i === ПУТЬ.length - 1 ? 'is-now' : ''}"><span class="l8-path__d">${п.с}${п.по !== п.с ? ` — ${п.по}` : ''}</span><span class="l8-path__t">${логоИли(п.лого, п.мон)}<b>${п.команда}</b></span><small>${п.что}</small></li>`).join('')}</ol></section>
      <section class="a-panel"><div class="a-ph"><h3>Трофеи</h3><span class="a-muted">${ИГРОК.призовые} призовых</span></div>
        <div class="l8-trophies">${ТРОФЕИ.slice(0, 6).map((т) => `<div class="l8-tr l8-lift"><span class="a-place a-place--${т.место}">${т.место}</span><b>${т.турнир}</b><small>${т.финал} · ${т.дата}</small><em>${т.приз}</em></div>`).join('')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Последние матчи</h3><span class="a-muted">профматчи · OpenDota</span></div>
        ${МАТЧИ.slice(0, 6).map((м) => `<div class="l8-m${м.w ? ' is-w' : ''}"><img class="a-hero" src="${героиКартинка(м.герой)}" alt="" /><b>${м.лига}</b><span class="a-kda">${м.k} / ${м.d} / ${м.a}</span><span class="a-muted">${м.gpm} GPM</span><span class="l8-res">${м.w ? 'Победа' : 'Поражение'}</span><small>${м.д}</small></div>`).join('')}</section>
    </div>
    <aside class="l8-pl__side">
      <section class="a-panel l8-now"><div class="a-ph"><h3>Сейчас</h3><span class="a-live"><i class="a-dot"></i>${СЕЙЧАС.турнир}</span></div>
        <div class="l8-now__m"><span>${лого('pv')}<b>PV</b></span><small>vs</small><span><b>LGD</b>${моно('LGD')}</span></div>
        <p class="a-muted">${СЕЙЧАС.далее} · ${СЕЙЧАС.за}</p>
        <button type="button" class="a-btn a-btn--pri l8-wide">Прогноз на 9Class ${стрелка}</button></section>
      <section class="a-panel l8-own"><div class="a-ph"><h3>Карта игрока</h3><span class="a-muted">продано 31 / 400</span></div>
        <div class="l8-own__card">${картаИгрока(220)}</div>
        <div class="l8-own__buy">${цена(1450)}<small class="is-up">+4.2% за сутки</small></div>
        <button type="button" class="a-btn l8-wide">Купить ${стрелка}</button></section>
      <section class="a-panel"><div class="a-ph"><h3>Сигнатурные герои</h3></div>
        ${ГЕРОИ.slice(0, 5).map((h) => `<div class="a-hr"><img class="a-hero" src="${героиКартинка(h.id)}" alt="" /><span><b>${h.имя}</b><small>${h.м} матчей · ${h.kda}</small></span><span class="a-bar" style="--p: ${(h.м / maxМ) * 100}%"><i></i></span><em>${винрейт(h)}%</em></div>`).join('')}</section>
    </aside>
  </div>
</main></div>`
  }

  /* ── Онбординг: карточка шага по центру, точки сверху, справа «что получишь» ── */
  const ПОЛУЧИШЬ = [['+100', 'монет за вход'], ['1', 'фан-лига команды'], ['3', 'карты в коллекцию'], ['+150', 'монет за прогноз'], ['1', 'серебряный жетон']]
  const онб = (n, d) => `
<div class="ap ap--ob l8-ob">
  <header class="a-hd l8-hd"><div class="a-hd__in">
    <a class="a-brand"><i class="a-brand__mark">F</i><span>Fantasy <b>Dota 2</b></span></a>
    <ol class="l8-dots" aria-label="Шаг ${n} из 5">${ШАГИ.map(([t], i) => `<li class="${i + 1 < n ? 'is-done' : i + 1 === n ? 'is-now' : ''}"><i></i><span>${t}</span></li>`).join('')}</ol>
    <div class="a-hd__right"><span class="a-coins"><i></i><b>${d.монеты}</b></span><a class="a-link">Пропустить</a></div>
  </div></header>
  <main class="l8-wrap l8-ob__grid">
    <section class="l8-ob__card">
      <h1 class="l8-h1">${d.заголовок}</h1>
      <p class="a-lead">${d.лид}</p>
      <div class="a-ob__body">${d.тело}</div>
      <footer class="l8-ob__foot"><span class="l8-pill l8-pill--gold">Награда: <b>${d.награда}</b></span><small>${d.пояснение}</small><button type="button" class="a-btn a-btn--pri a-btn--lg">${d.кнопка} ${стрелка}</button></footer>
    </section>
    <aside class="l8-ob__side">
      <section class="a-panel l8-ob__total"><b>${d.монеты}</b><small>монет на счету · не покупаются и не выводятся</small></section>
      <section class="a-panel"><div class="a-ph"><h3>Что получишь</h3><span class="a-muted">${n - 1} из 5</span></div>
        ${ПОЛУЧИШЬ.map(([v, t], i) => `<div class="l8-get${i + 1 < n ? ' is-done' : i + 1 === n ? ' is-now' : ''}"><b>${v}</b><span><small>${ШАГИ[i][0]}</small>${t}</span><i>${i + 1 < n ? '✓' : ''}</i></div>`).join('')}</section>
    </aside>
  </main>
</div>`

  const esp = {
    что: {
      главная: 'Герой-карточка матча дня с фото и мини-матчами снизу (Fnatic), лента «Раньше / Сейчас / Позже» рядами LoL Esports, справа пятёрка, рейтинг, квесты',
      галерея: 'Плитки сундуков с артом и списком (BLAST), фильтры пилюлями, сетка карт с ценой и изменением за сутки',
      игрок: 'Герой-карточка: фото во всю высоту и имя поверх затемнения (Fnatic), огромные цифры с мелкой подписью (EWC); справа «Сейчас», карта, герои',
    },
    главная, галерея, игрок, онб,
  }

  Object.assign(window.РАСКЛАДКИ, { esp })
  Object.assign(САЙТ.h, { шапкаЕсп, стрелка, рядЕсп: ряд }) // для страниц матчей (_matches.js)
})()
