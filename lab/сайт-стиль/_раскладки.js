/* Лаба «Сайт в одном стиле» — раскладки наборов (дирижёр 01.10: «раскладка везде одинаковая, просто скин — нужны идеи по раскладке»).
   Набор = стиль (_т-*.css) + своя раскладка экранов. Данные общие (_сайт.js, ../страница-игрока/_игрок.js), подменяется только разметка:
   главная, галерея, страница игрока и оболочка онбординга. Набор 2 «Продукт» — раскладка по умолчанию (из _сайт.js).
     tablo — 1 Табло: лента матчей во всю ширину, маркет таблицей, игрок «сначала статистика», онбординг — мастер поверх главной;
     coll  — 3 Коллекция: пятёрка веером на первом экране, витрина с крупной картой, игрок как у Sorare (карта стоит, контент листается), онбординг-история;
     wiki  — 4 Вики: портал как главная Liquipedia, таблица карт с сортировкой, игрок — статья с инфобоксом, онбординг — чеклист на одной странице;
     hud   — 5 HUD: лобби игры (состав в центре, меню слева), инвентарь, экран персонажа, онбординг — кат-сцены на весь экран. */
(() => {
  const { лого, моно, логоИли, картаF, ИГРОКИ, РЕДКОСТЬ, шапка, шапкаОнбординга, ТУРНИРЫ, матчСтрокаГл, ГАЛЕРЕЯ, СУНДУКИ, ШАГИ, главная } = САЙТ.h
  const фото = (ид) => `/p-fw3k/site/img/players/${ИГРОКИ[ид].фото || '_silhouette.png'}`
  const ава = (ид, кл = '') => `<span class="l-ph ${кл}"><img src="${фото(ид)}" alt="" /></span>`
  const цена = (n) => `<span class="a-gc__price"><i></i><b>${n.toLocaleString('ru')}</b></span>`
  const тег = (r) => `<span class="l-rar l-rar--${r}">${РЕДКОСТЬ[r]}</span>`
  const КОМАНДА = { PV: 'pv', TUN: 'tun', TS: 'ts', FLC: 'flc' }
  const СТАТЫ_9 = [['FRM', 'Форма', 82], ['FGT', 'Драки', 60], ['POOL', 'Пул героев', 47], ['SUR', 'Выживание', 91], ['VIS', 'Обзор', 36], ['FORM', 'Игра сейчас', 67]]
  const ур = (v) => (v >= 75 ? 'hi' : v >= 50 ? 'mid' : 'lo')
  const ВСЕ_МАТЧИ = ТУРНИРЫ.flatMap((т) => т.матчи.map((м) => ({ ...м, тур: т.имя })))
  const квесты = () => [['Сделай 3 прогноза', 1, 3, '+30'], ['Открой сундук', 0, 1, '+20'], ['Собери пятёрку', 1, 1, '+50']].map(([t, n, всего, н]) => `
    <div class="a-q${n >= всего ? ' is-done' : ''}"><span class="a-q__t"><b>${t}</b><small>${n} / ${всего}</small></span><span class="a-bar" style="--p: ${(n / всего) * 100}%"><i></i></span><em>${н}</em></div>`).join('')
  const точность = () => `<div class="a-acc__seg">${Array.from({ length: 15 }, (_, i) => `<i${i < 4 ? ' class="is-on"' : ''}></i>`).join('')}</div><p class="a-acc__t">Ещё 11 верных прогнозов — <b>сундук Prism</b></p>`
  const лидеры = () => [['1', 'Kotik_TS', '2 340'], ['2', 'ArtStyleFan', '2 295'], ['3', 'wnd', '2 210'], ['4', 'mirage', '2 106'], ['5', 'Nova', '2 044']].map(([n, ник, о]) => `<div class="a-lr"><span class="a-lr__n">${n}</span><span class="a-ava a-ava--s">${ник[0]}</span><b>${ник}</b><em>${о}</em></div>`).join('')
    + `<div class="a-lr a-lr--me"><span class="a-lr__n">—</span><span class="a-ava a-ava--s">S</span><b>Skywrath_77</b><em>1 150</em></div>`
  const МОИ = [['9class', 'PARIVISION — BetBoom', '18:00', '18.9'], ['yatoro', 'Team Spirit — Tundra', 'Live · К2', '21.4'], ['pure', 'Team Spirit — Tundra', 'Live · К2', '24.0'], ['rue', 'Team Spirit — Tundra', 'Live · К2', '12.6'], ['collapse', 'Team Spirit — Tundra', 'Live · К2', '15.1']]
  const ИЗМЕНЕНИЕ = { '9class': '+4.2', pure: '+1.8', satanic: '−0.6', collapse: '+2.4', malrine: '−1.9', yatoro: '+0.7', noone: '+3.1', rue: '−0.4', miposhka: '0.0', dukalis: '−2.2' }
  const ПРОДАНО = { '9class': 31, pure: 44, satanic: 52, collapse: 61, malrine: 70, yatoro: 88, noone: 96, rue: 120, miposhka: 140, dukalis: 160 }

  /* ════════════ 1 · ТАБЛО ════════════ */
  const tablo = {
    что: { главная: 'Лента матчей во всю ширину, сверху полоса live, сбоку компактно — мои игроки, матч дня, квесты', галерея: 'Маркет списком: цена, изменение за сутки, продано из тиража', игрок: 'Сначала статистика: компактная шапка, дальше таблицы матчей, героев и трофеев' },
    главная: () => `
<div class="ap ap--home">${шапка('Главная')}
<main class="a-page l1-home">
  <div class="l1-strip">${ВСЕ_МАТЧИ.map((м) => `<span class="l1-chip l1-chip--${м.ст}"><small>${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${м.время}</small><span>${логоИли(м.a[0], м.a[1].slice(0, 3).toUpperCase())}<b>${м.a[2]}</b></span><span>${логоИли(м.b[0], м.b[1].slice(0, 3).toUpperCase())}<b>${м.b[2]}</b></span></span>`).join('')}</div>
  <div class="l1-home__grid">
    <section class="a-panel a-ml">
      <div class="a-ph"><h3>Матчи · сегодня, 1 октября</h3><div class="a-chips"><button type="button" aria-pressed="true">Все</button><button type="button">Live · 2</button><button type="button">Мои игроки</button><button type="button">Завершённые</button></div></div>
      <div class="l1-cols"><span>Матч</span><span>Мои</span><span>Прогноз</span><span></span><span>Время</span></div>
      ${ТУРНИРЫ.map((т) => `<div class="a-tour"><span class="a-tour__g">${т.игра}</span><b>${т.имя}</b><small>${т.где}</small><span class="a-tour__n">${т.матчи.length}</span></div>${т.матчи.map(матчСтрокаГл).join('')}`).join('')}
      <div class="a-tour"><span class="a-tour__g">LoL</span><b>LEC Summer</b><small>Берлин · Финал верхней сетки · Bo5</small><span class="a-tour__n">1</span></div>
      ${матчСтрокаГл({ ст: 'up', время: '20:00', a: ['', 'G2 Esports', ''], b: ['', 'Fnatic', ''], мои: 0 })}
    </section>
    <aside class="l1-side">
      <section class="a-panel"><div class="a-ph"><h3>Мои игроки</h3><span class="a-muted">5 в составе</span></div>
        ${МОИ.map(([ид, м, t, p]) => `<div class="l1-mine">${ава(ид)}<span><b>${ИГРОКИ[ид].ник}</b><small>${м}</small></span><em class="${t.startsWith('Live') ? 'is-live' : ''}">${t}</em><b class="l1-mine__p">${p}</b></div>`).join('')}
      </section>
      <section class="a-panel l1-feat"><div class="a-ph"><h3>Матч дня</h3><span class="a-live"><i class="a-dot"></i>К2 · 27:41</span></div>
        <div class="l1-feat__sc"><span>${лого('ts')}<b>Team Spirit</b></span><strong>1 : 0</strong><span>${лого('tun')}<b>Tundra</b></span></div>
        <div class="a-vote"><button type="button" class="js-pick" aria-pressed="true">Spirit <b>58%</b></button><button type="button" class="js-pick" aria-pressed="false">Tundra <b>42%</b></button></div>
      </section>
      <section class="a-panel a-quests"><div class="a-ph"><h3>Квесты дня</h3><span class="a-muted">до 00:00</span></div>${квесты()}</section>
      <section class="a-panel a-acc"><div class="a-ph"><h3>Сундук точности</h3><span class="a-muted">4 из 15</span></div>${точность()}</section>
    </aside>
  </div>
</main></div>`,

    галерея: () => `
<div class="ap ap--gal">${шапка('Коллекция')}
<main class="a-page l1-mk">
  <div class="a-ph l1-mk__h"><h3>Маркет карт</h3><div class="a-chips"><button type="button" aria-pressed="true">Dota 2</button><button type="button">LoL</button><button type="button">CS 2</button></div><span class="a-muted">10 карт · сезон 1</span><div class="a-chips"><button type="button" aria-pressed="true">Все</button>${[1, 2, 3, 4, 5].map((n) => `<button type="button">Pos ${n}</button>`).join('')}</div></div>
  <div class="l1-mk__grid">
    <section class="a-panel l1-tbl">
      <div class="l1-tr l1-tr--h"><span>Игрок</span><span>Поз</span><span>Редкость</span><span>OVR</span><span>Цена</span><span>24 ч</span><span>Тираж</span><span></span></div>
      ${ГАЛЕРЕЯ.map(([ид, ц]) => { const п = ИГРОКИ[ид], d = ИЗМЕНЕНИЕ[ид]; return `<div class="l1-tr">${ава(ид)}<span class="l1-tr__who"><b>${п.ник}</b><small>${лого(КОМАНДА[п.тег])}${п.тег}</small></span><span>${п.pos}</span><span>${тег(п.ред)}</span><b>${п.ovr}</b>${цена(ц)}<span class="l1-d ${d.startsWith('+') ? 'is-up' : d.startsWith('−') ? 'is-down' : ''}">${d}%</span><span class="a-muted">${ПРОДАНО[ид]} / 400</span><button type="button" class="a-btn a-btn--sm${ид === '9class' ? ' a-btn--pri' : ''}">Купить</button></div>` }).join('')}
    </section>
    <aside class="l1-side">
      <section class="a-panel"><div class="a-ph"><h3>Сундуки</h3><span class="a-muted">шансы открыты</span></div>
        ${СУНДУКИ.map(([t, s, ц, шанс], i) => `<div class="l1-chest"><span><b>${t}</b><small>${s} · ${шанс}</small></span><button type="button" class="a-btn a-btn--sm${i === 1 ? ' a-btn--pri' : ''}"><i class="a-coin"></i>${ц}</button></div>`).join('')}
      </section>
      <section class="a-panel"><div class="a-ph"><h3>Пыль</h3><span class="a-muted">из повторов</span></div><div class="a-dust"><b>240</b><small>из 400 — хватит на любую Holo</small><span class="a-bar" style="--p: 60%"><i></i></span></div></section>
    </aside>
  </div>
</main></div>`,

    игрок: () => `
<div class="ap ap--pl">${шапка('Коллекция')}
<main class="a-page l1-pl">
  <section class="a-panel l1-plh">
    ${ава('9class', 'l-ph--lg')}
    <div class="l1-plh__who"><b>9Class</b><small><i class="player-card__flag player-card__flag--ru"></i>Эдгар Налтакян · ${лого('pv')} PARIVISION · Pos 4 · Support</small></div>
    ${ИГРОК.цифры.map((ц) => `<span class="l1-plh__n"><b>${ц.v}</b><small>${ц.t}</small></span>`).join('')}
    <span class="l1-plh__n"><b>95</b><small>OVR карты</small></span>
    <button type="button" class="a-btn a-btn--pri">В состав</button>
  </section>
  <nav class="a-subnav">${['Статистика', 'Матчи', 'Герои', 'Трофеи', 'Путь', 'Медиа'].map((t, i) => `<a${i === 0 ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="l1-pl__grid">
    <div class="l1-pl__main">
      <section class="a-panel l1-tbl"><div class="a-ph"><h3>Последние матчи</h3><span class="a-muted">профматчи · OpenDota</span></div>
        <div class="l1-tr l1-tr--m l1-tr--h"><span>Дата</span><span>Турнир</span><span>Герой</span><span>K / D / A</span><span>GPM</span><span>Итог</span></div>
        ${МАТЧИ.map((м) => `<div class="l1-tr l1-tr--m"><span class="a-muted">${м.д}</span><b>${м.лига}</b><span class="l1-hero"><img class="a-hero" src="${героиКартинка(м.герой)}" alt="" /></span><span class="a-kda">${м.k} / ${м.d} / ${м.a}</span><span>${м.gpm}</span><em class="${м.w ? 'is-w' : 'is-l'}">${м.w ? 'Победа' : 'Поражение'}</em></div>`).join('')}
      </section>
      <section class="a-panel l1-tbl"><div class="a-ph"><h3>Герои</h3><span class="a-muted">с 12.2022</span></div>
        <div class="l1-tr l1-tr--h2 l1-tr--h"><span>Герой</span><span>Матчи</span><span>Победы</span><span>Винрейт</span><span>KDA</span></div>
        ${ГЕРОИ.map((h) => `<div class="l1-tr l1-tr--h2"><span class="l1-hero"><img class="a-hero" src="${героиКартинка(h.id)}" alt="" /><b>${h.имя}</b></span><span>${h.м}</span><span>${h.в}</span><b>${винрейт(h)}%</b><span class="a-muted">${h.kda}</span></div>`).join('')}
      </section>
    </div>
    <aside class="l1-side">
      <section class="a-panel"><div class="a-ph"><h3>Сейчас</h3><span class="a-live"><i class="a-dot"></i>${СЕЙЧАС.турнир}</span></div><div class="l1-now">${лого('pv')}<b>PV</b><i>vs</i>${моно('LGD')}<b>LGD</b><small>${СЕЙЧАС.далее}</small></div><button type="button" class="a-btn a-btn--pri a-btn--sm">Прогноз</button></section>
      <section class="a-panel l1-tbl"><div class="a-ph"><h3>Трофеи</h3></div>${ТРОФЕИ.map((т) => `<div class="l1-tr l1-tr--t"><span class="a-place a-place--${т.место}">${т.место}</span><b>${т.турнир}</b><em>${т.приз}</em></div>`).join('')}</section>
      <section class="a-panel a-info">${[['Родился', ИГРОК.родился], ['Страна', 'Россия'], ['Активен', 'с 2020'], ['Призовые', ИГРОК.призовые], ['Лучший MMR', '16 000']].map(([k, v]) => `<div class="a-info__r"><small>${k}</small><b>${v}</b></div>`).join('')}</section>
    </aside>
  </div>
</main></div>`,

    // Онбординг — мастер в окне поверх главной: сверху шаги точками
    онб: (n, d) => `
<div class="ap ap--l1ob"><div class="a-under">${tablo.главная()}</div><div class="a-modal-bg"></div>
<div class="a-modal l1-wiz" role="dialog">
  <div class="l1-wiz__top"><span class="a-brand"><i class="a-brand__mark">F</i></span><ol class="l1-dots">${ШАГИ.map(([t], i) => `<li class="${i + 1 < n ? 'is-done' : i + 1 === n ? 'is-now' : ''}"><i></i><span>${t}</span></li>`).join('')}</ol><a class="a-link">Пропустить</a></div>
  <h1 class="a-h1">${d.заголовок}</h1><p class="a-lead">${d.лид}</p>
  <div class="a-ob__body">${d.тело}</div>
  <footer class="a-ob__foot"><span class="a-reward">Награда: <b>${d.награда}</b></span><small>${d.пояснение}</small><button type="button" class="a-btn a-btn--pri a-btn--lg">${d.кнопка}</button></footer>
</div></div>`,
  }

  /* ════════════ 3 · КОЛЛЕКЦИЯ ════════════ */
  const coll = {
    что: { главная: 'Сначала карты: твоя пятёрка веером на первом экране, дальше матч дня и матчи карточками', галерея: 'Витрина: крупная карта недели с покупкой, рядом сетка карт', игрок: 'Как у Sorare: крупная карта слева стоит на месте, справа листается контент' },
    главная: () => `
<div class="ap ap--home">${шапка('Главная')}
<main class="a-page l3-home">
  <section class="l3-hero">
    <div class="l3-hero__txt"><span class="a-kick">Сегодня · 5 матчей твоих игроков</span><h1 class="a-h1">Твоя пятёрка</h1><p class="a-lead">Прогноз — <b>91.0 очка</b>. Состав закроется перед первым матчем.</p>
      <div class="l3-lock"><span><b>02:14:37</b><small>до лока</small></span><button type="button" class="a-btn a-btn--pri a-btn--lg">Изменить состав</button></div></div>
    <div class="l3-fan">${МОИ.map(([ид, , t, p], i) => `<div class="l3-fan__c" style="--i: ${i - 2}">${картаF(ид, 168)}<small><b>${p}</b> · ${t}</small></div>`).join('')}</div>
  </section>
  <div class="l3-row">
    <section class="a-panel a-feat l3-feat">
      <div class="a-feat__top"><span class="a-live"><i class="a-dot"></i>Live</span><span class="a-feat__league">Матч дня · DreamLeague S27</span><span class="a-feat__clock">Карта 2 · 27:41</span></div>
      <div class="a-feat__teams"><div class="a-feat__team">${лого('ts')}<b>Team Spirit</b></div><div class="a-feat__score"><b>1</b><i>:</i><b>0</b></div><div class="a-feat__team a-feat__team--r">${лого('tun')}<b>Tundra</b></div></div>
      <div class="a-feat__foot"><div class="a-vote"><button type="button" class="js-pick" aria-pressed="true">Spirit <b>58%</b></button><button type="button" class="js-pick" aria-pressed="false">Tundra <b>42%</b></button></div><button type="button" class="a-btn a-btn--pri">Прогноз на карту 3</button></div>
    </section>
    <section class="a-panel"><div class="a-ph"><h3>Квесты дня</h3><span class="a-muted">до 00:00</span></div>${квесты()}</section>
    <section class="a-panel a-acc"><div class="a-ph"><h3>Сундук точности</h3><span class="a-muted">4 из 15</span></div>${точность()}<button type="button" class="a-btn a-btn--sm l3-acc__b">Открыть сундук · 300</button></section>
  </div>
  <h3 class="l3-h">Матчи сегодня</h3>
  <div class="l3-matches">${ВСЕ_МАТЧИ.map((м) => `<div class="a-panel l3-mc l3-mc--${м.ст}"><small>${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${м.время} · ${м.тур}</small><div class="l3-mc__t"><span>${логоИли(м.a[0], м.a[1].slice(0, 3).toUpperCase())}<b>${м.a[1]}</b></span><strong>${м.a[2] === '' ? 'vs' : `${м.a[2]} : ${м.b[2]}`}</strong><span>${логоИли(м.b[0], м.b[1].slice(0, 3).toUpperCase())}<b>${м.b[1]}</b></span></div>${м.мои ? `<span class="a-tag">${м.мои} твоих</span>` : ''}</div>`).join('')}</div>
</main></div>`,

    галерея: () => `
<div class="ap ap--gal">${шапка('Коллекция')}
<main class="a-page l3-gal">
  <section class="a-panel l3-week">
    <div class="l3-week__card">${картаИгрока(290)}</div>
    <div class="l3-week__txt"><span class="a-kick">Карта недели · Legend</span><h1 class="a-h1">9Class</h1><p class="a-lead">Второе место на TI 2026 и титул Esports World Cup. Тираж — 400 карт, продано 31.</p>
      <div class="l3-week__buy">${цена(1450)}<button type="button" class="a-btn a-btn--pri a-btn--lg">Купить карту</button><button type="button" class="a-btn a-btn--lg">Командный сундук · 600</button></div>
      <div class="l3-week__f">${[['Legend', '1 из 400'], ['+25%', 'бонус Dark Willow'], ['95', 'OVR']].map(([v, t]) => `<span><b>${v}</b><small>${t}</small></span>`).join('')}</div></div>
  </section>
  <div class="a-filters"><div class="a-chips"><button type="button" aria-pressed="true">Dota 2</button><button type="button">LoL</button><button type="button">CS 2</button></div><span class="a-filters__sep"></span><div class="a-chips"><button type="button" aria-pressed="true">Все</button><button type="button">Legend</button><button type="button">Prism</button><button type="button">Holo</button></div><span class="a-filters__sort">Сначала дорогие ↓</span></div>
  <div class="l3-grid">${ГАЛЕРЕЯ.slice(1).map(([ид, ц]) => `<div class="l3-gc">${картаF(ид, 196)}<div class="a-gc__buy">${цена(ц)}<button type="button" class="a-btn a-btn--sm">Купить</button></div></div>`).join('')}</div>
</main></div>`,

    игрок: () => `
<div class="ap ap--pl">${шапка('Коллекция')}
<main class="a-page l3-pl">
  <aside class="l3-pl__stick">
    <div class="l3-pl__card">${картаИгрока(320)}</div>
    <div class="l3-pl__who">${лого('pv')}<span><b>9Class</b><small>PARIVISION · Pos 4 · Support</small></span></div>
    <div class="l3-pl__nums">${ИГРОК.цифры.map((ц) => `<span><b>${ц.v}</b><small>${ц.t}</small></span>`).join('')}</div>
    <div class="l3-pl__acts"><button type="button" class="a-btn a-btn--pri a-btn--lg">В состав</button><button type="button" class="a-btn a-btn--lg">Следить</button></div>
  </aside>
  <div class="l3-pl__flow">
    <section><h1 class="a-h1">Эдгар «9Class» Налтакян</h1><p class="a-lead">Саппорт PARIVISION, 23 года. Пять титулов Tier 1, второе место на The International 2026. ${ЦИТАТЫ.ник}</p></section>
    <section class="a-panel"><div class="a-ph"><h3>Хайлайты</h3><a class="a-link">Все видео →</a></div>
      <div class="l3-vids">${ВИДЕО.slice(0, 4).map((v) => `<a class="a-vid"><span class="a-vid__img"><img src="${превью(v.id)}" alt="" loading="lazy" /><i class="a-vid__play"></i></span><b>${v.имя}</b><small>${v.где}</small></a>`).join('')}</div></section>
    <section class="a-panel"><div class="a-ph"><h3>Путь</h3><span class="a-muted">от пабликов до финала TI</span></div>
      <ol class="l3-road">${ПУТЬ.map((п) => `<li><span class="a-road__dot">${логоИли(п.лого, п.мон)}</span><span><em>${п.с}${п.по !== п.с ? ` — ${п.по}` : ''}</em><b>${п.команда}</b><small>${п.что}</small></span></li>`).join('')}</ol></section>
    <section class="l3-trophies">${ТРОФЕИ.slice(0, 6).map((т) => `<div class="a-panel l3-tr"><span class="a-place a-place--${т.место}">${т.место}</span><b>${т.турнир}</b><small>${т.финал} · ${т.дата}</small><em>${т.приз}</em></div>`).join('')}</section>
    <section class="a-panel"><div class="a-ph"><h3>Факты</h3></div><div class="a-facts l3-facts">${ФАКТЫ.map((ф) => `<div class="a-fact"><b>${ф.big}</b><small>${ф.t}</small></div>`).join('')}</div></section>
    <blockquote class="a-quote l3-quote">${ЦИТАТЫ.др}<cite>— 9Class после финала Esports World Cup 2026</cite></blockquote>
  </div>
</main></div>`,

    // Онбординг — история: без бокового меню, сверху полоса из 5 отрезков, всё по центру
    онб: (n, d) => `
<div class="ap ap--ob">${шапкаОнбординга(d.монеты)}
<main class="a-page l3-ob">
  <ol class="l3-seg">${ШАГИ.map(([t], i) => `<li class="${i + 1 < n ? 'is-done' : i + 1 === n ? 'is-now' : ''}"><i></i><span>${t}</span></li>`).join('')}</ol>
  <div class="l3-ob__c"><span class="a-kick">Шаг ${n} из 5</span><h1 class="a-h1">${d.заголовок}</h1><p class="a-lead">${d.лид}</p></div>
  <div class="a-ob__body l3-ob__body">${d.тело}</div>
  <footer class="l3-ob__foot"><span class="a-reward">Награда: <b>${d.награда}</b></span><button type="button" class="a-btn a-btn--pri a-btn--lg">${d.кнопка}</button><small>${d.пояснение}</small></footer>
</main></div>`,
  }

  /* ════════════ 4 · ВИКИ ════════════ */
  const НОВОСТИ = [
    [ВИДЕО[0].id, 'PARIVISION — второе место на The International 2026', 'Финал с Team Spirit дошёл до пятой карты. Карты 9Class и Satanic подорожали за неделю.', '24.08'],
    [ВИДЕО[2].id, 'Esports World Cup 2026: титул в день рождения 9Class', 'Финал 3:1 с BetBoom. В Fantasy — лучший саппорт недели.', '20.07'],
    [ВИДЕО[4].id, 'Сезон 1 Fantasy: правила начисления очков', 'Как считаются очки за убийства, ассисты, вардинг и победы.', '01.09'],
    [ВИДЕО[3].id, 'BLAST Slam VIII: группы и расписание', 'PARIVISION в группе A, первый матч — с LVLUP.', '28.09'],
  ]
  const wiki = {
    что: { главная: 'Портал, как главная Liquipedia: идут сейчас, новости, результаты, лучшие игроки — тремя колонками', галерея: 'Таблица карт с сортировкой по колонкам', игрок: 'Статья: содержание, биография, карьера, достижения таблицами; инфобокс справа' },
    главная: () => `
<div class="ap ap--home">${шапка('Главная')}
<main class="a-page l4-home">
  <section class="l4-ban"><b>Fantasy · Dota 2</b><span>Сезон 1 · 412 профи-игроков · 48 210 участников · 23 турнира в сезоне</span><a class="a-link">Как это работает</a></section>
  <div class="l4-cols">
    <div class="l4-col">
      <section class="a-panel"><div class="a-ph"><h3>Сейчас идут</h3></div>${ВСЕ_МАТЧИ.filter((м) => м.ст === 'live').map((м) => `<div class="l4-m"><span class="a-live"><i class="a-dot"></i>${м.время}</span><span>${логоИли(м.a[0], м.a[1].slice(0, 3).toUpperCase())}<b>${м.a[1]}</b><em>${м.a[2]}</em></span><span>${логоИли(м.b[0], м.b[1].slice(0, 3).toUpperCase())}<b>${м.b[1]}</b><em>${м.b[2]}</em></span><small>${м.тур}</small></div>`).join('')}</section>
      <section class="a-panel"><div class="a-ph"><h3>Ближайшие матчи</h3></div>${ВСЕ_МАТЧИ.filter((м) => м.ст === 'up').map((м) => `<div class="l4-m"><span class="a-muted">${м.время}</span><span>${логоИли(м.a[0], м.a[1].slice(0, 3).toUpperCase())}<b>${м.a[1]}</b></span><span>${логоИли(м.b[0], м.b[1].slice(0, 3).toUpperCase())}<b>${м.b[1]}</b></span><small>${м.тур}${м.прогноз ? ` · прогноз ${м.прогноз}` : ''}</small></div>`).join('')}</section>
    </div>
    <div class="l4-col l4-col--mid">
      <section class="a-panel"><div class="a-ph"><h3>Новости</h3><a class="a-link">Все новости</a></div>${НОВОСТИ.map(([id, t, s, д], i) => `<article class="l4-news${i === 0 ? ' l4-news--big' : ''}"><img src="${превью(id)}" alt="" loading="lazy" /><span><b>${t}</b><small>${s}</small><em>${д}</em></span></article>`).join('')}</section>
      <section class="a-panel"><div class="a-ph"><h3>Результаты</h3></div>${ТРОФЕИ.slice(0, 4).map((т) => `<div class="l4-res"><b>${т.турнир}</b><span>${т.финал}</span><small>${т.дата}</small></div>`).join('')}</section>
    </div>
    <div class="l4-col">
      <section class="a-panel"><div class="a-ph"><h3>Лучшие игроки недели</h3></div><div class="l4-t"><div class="l4-t__h"><span>#</span><span>Игрок</span><span>Очки</span></div>${[['Yatoro', 'ts', '96.4'], ['Malr1ne', 'flc', '91.0'], ['Collapse', 'ts', '88.2'], ['9Class', 'pv', '84.7'], ['Miposhka', 'ts', '79.5']].map(([ник, к, о], i) => `<div class="l4-t__r"><span>${i + 1}</span><span>${лого(к)}<b>${ник}</b></span><em>${о}</em></div>`).join('')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Твой аккаунт</h3></div><div class="l4-acc">${[['Монеты', '1 150'], ['Место в лиге', '#12 480'], ['Карт', '3'], ['Прогнозов сегодня', '1 из 3']].map(([k, v]) => `<div class="a-info__r"><small>${k}</small><b>${v}</b></div>`).join('')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Квесты дня</h3></div>${квесты()}</section>
    </div>
  </div>
</main></div>`,

    галерея: () => `
<div class="ap ap--gal">${шапка('Коллекция')}
<main class="a-page l4-gal">
  <div class="l4-title"><h1 class="a-h1">Карты сезона 1</h1><span class="a-muted">10 из 412 · Dota 2 · отсортировано по цене</span></div>
  <div class="a-filters"><div class="a-chips"><button type="button" aria-pressed="true">Dota 2</button><button type="button">LoL</button><button type="button">CS 2</button></div><span class="a-filters__sep"></span><div class="a-chips"><button type="button" aria-pressed="true">Все позиции</button>${[1, 2, 3, 4, 5].map((n) => `<button type="button">Pos ${n}</button>`).join('')}</div></div>
  <div class="l4-gal__grid">
    <section class="a-panel l4-sort">
      <div class="l4-sort__r l4-sort__r--h">${['', 'Игрок', 'Команда', 'Поз', 'Редкость', 'OVR', 'Цена ↓', 'Тираж', ''].map((t) => `<span>${t}${t && !t.includes('↓') ? ' <i>↕</i>' : ''}</span>`).join('')}</div>
      ${ГАЛЕРЕЯ.map(([ид, ц]) => { const п = ИГРОКИ[ид]; return `<div class="l4-sort__r"><span class="l4-thumb">${картаF(ид, 58)}</span><b class="a-link">${п.ник}</b><span>${лого(КОМАНДА[п.тег])}${п.тег}</span><span>${п.pos}</span><span>${тег(п.ред)}</span><b>${п.ovr}</b>${цена(ц)}<span class="a-muted">${ПРОДАНО[ид]} / 400</span><button type="button" class="a-btn a-btn--sm">Купить</button></div>` }).join('')}
    </section>
    <aside class="l4-side">
      <section class="a-panel"><div class="a-ph"><h3>Сундуки</h3></div><div class="l4-t"><div class="l4-t__h l4-t__h--3"><span>Сундук</span><span>Шанс</span><span>Цена</span></div>${СУНДУКИ.map(([t, s, ц, шанс]) => `<div class="l4-t__r l4-t__r--3"><span><b>${t}</b><small>${s}</small></span><span>${шанс}</span><em>${ц}</em></div>`).join('')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Как устроены карты</h3></div><p class="l4-p">Сила карты — рамка (Bronze → Elite), редкость — блеск (Base → Legend). Повтор превращается в пыль; 400 пыли — любая Holo.</p></section>
    </aside>
  </div>
</main></div>`,

    игрок: () => {
      const разделы = ['Биография', 'Карьера', 'Достижения', 'Сигнатурные герои', 'Медиа', 'Цитаты']
      return `
<div class="ap ap--pl">${шапка('Коллекция')}
<main class="a-page l4-pl">
  <div class="a-crumbs"><a class="a-link">Игроки</a><i>/</i><a class="a-link">PARIVISION</a><i>/</i><span>9Class</span></div>
  <div class="l4-art">
    <article class="l4-art__main">
      <h1 class="l4-art__h">9Class</h1><p class="l4-art__sub">Материал из Fantasy · Вики. Данные: Liquipedia, OpenDota, интервью.</p>
      <p class="l4-p"><b>Эдгар «9Class» Налтакян</b> (род. 19 июля 2003) — российский профессиональный игрок в Dota 2, саппорт (позиция 4) команды PARIVISION. Пятикратный чемпион турниров Tier 1, финалист The International 2026.</p>
      <nav class="l4-toc"><b>Содержание</b><ol>${разделы.map((t) => `<li><a class="a-link">${t}</a></li>`).join('')}</ol></nav>
      <h2 class="l4-h2">Биография</h2>
      <p class="l4-p">Ник появился ещё в школе: ${ЦИТАТЫ.ник} В 2023 году ушёл из университета, чтобы попробовать себя в про-доте: ${ЦИТАТЫ.универ}</p>
      <p class="l4-p">${ФАКТЫ[1].t}. ${ФАКТЫ[3].t}.</p>
      <h2 class="l4-h2">Карьера</h2>
      <table class="l4-table"><thead><tr><th>Период</th><th>Команда</th><th>Итог</th></tr></thead><tbody>${ПУТЬ.map((п) => `<tr><td>${п.с}${п.по !== п.с ? ` — ${п.по}` : ''}</td><td><span class="l4-tm">${логоИли(п.лого, п.мон)}${п.команда}</span></td><td>${п.что}</td></tr>`).join('')}</tbody></table>
      <h2 class="l4-h2">Достижения</h2>
      <table class="l4-table"><thead><tr><th>Дата</th><th>Место</th><th>Турнир</th><th>Финал</th><th>Призовые</th></tr></thead><tbody>${ТРОФЕИ.map((т) => `<tr><td>${т.дата}</td><td><span class="a-place a-place--${т.место}">${т.место}</span></td><td><a class="a-link">${т.турнир}</a></td><td>${т.финал}</td><td class="l4-num">${т.приз}</td></tr>`).join('')}</tbody></table>
      <h2 class="l4-h2">Сигнатурные герои</h2>
      <table class="l4-table"><thead><tr><th>Герой</th><th>Матчи</th><th>Победы</th><th>Винрейт</th><th>KDA</th></tr></thead><tbody>${ГЕРОИ.map((h) => `<tr><td><span class="l4-tm"><img class="a-hero" src="${героиКартинка(h.id)}" alt="" />${h.имя}</span></td><td class="l4-num">${h.м}</td><td class="l4-num">${h.в}</td><td class="l4-num">${винрейт(h)}%</td><td>${h.kda}</td></tr>`).join('')}</tbody></table>
      <h2 class="l4-h2">Медиа</h2>
      <div class="l4-vids">${ВИДЕО.slice(0, 4).map((v) => `<a class="a-vid"><span class="a-vid__img"><img src="${превью(v.id)}" alt="" loading="lazy" /><i class="a-vid__play"></i></span><b>${v.имя}</b><small>${v.где}</small></a>`).join('')}</div>
      <h2 class="l4-h2">Цитаты</h2>
      ${[ЦИТАТЫ.эра, ЦИТАТЫ.techies, ЦИТАТЫ.др].map((ц) => `<blockquote class="a-quote">${ц}</blockquote>`).join('')}
    </article>
    <aside class="l4-art__box">
      <div class="a-panel a-info"><div class="a-info__h">${лого('pv')}<b>9Class</b></div>
        <div class="l4-art__card">${картаИгрока(230)}</div>
        ${[['Полное имя', 'Эдгар Налтакян'], ['Родился', `${ИГРОК.родился} (23 года)`], ['Страна', 'Россия'], ['Команда', 'PARIVISION'], ['Позиция', '4 · Саппорт'], ['Активен', 'с 2020'], ['Призовые', ИГРОК.призовые], ['Лучший MMR', '16 000'], ['Telegram', 'девятыйкласс'], ['Twitch', '9class']].map(([k, v]) => `<div class="a-info__r"><small>${k}</small><b>${v}</b></div>`).join('')}
        <div class="l4-art__cta"><button type="button" class="a-btn a-btn--pri">В состав · OVR 95</button></div>
      </div>
    </aside>
  </div>
</main></div>`
    },

    // Онбординг — одна страница-чеклист: прошлые шаги свёрнуты с ✓, текущий раскрыт, следующие — серым
    онб: (n, d) => `
<div class="ap ap--ob">${шапкаОнбординга(d.монеты)}
<main class="a-page l4-ob">
  <div class="l4-title"><h1 class="a-h1">Первый вход — 5 шагов</h1><span class="a-muted">Шаг ${n} из 5 · награды не сгорают</span></div>
  <ol class="l4-check">${ШАГИ.map(([t, s], i) => i + 1 === n ? `
    <li class="is-now"><div class="l4-check__h"><span class="a-steps__n">${i + 1}</span><b>${d.заголовок}</b><small>${s}</small></div>
      <div class="l4-check__b"><p class="a-lead">${d.лид}</p><div class="a-ob__body">${d.тело}</div>
        <footer class="a-ob__foot"><span class="a-reward">Награда: <b>${d.награда}</b></span><small>${d.пояснение}</small><button type="button" class="a-btn a-btn--pri a-btn--lg">${d.кнопка}</button></footer></div></li>`
    : `<li class="${i + 1 < n ? 'is-done' : ''}"><div class="l4-check__h"><span class="a-steps__n">${i + 1 < n ? '✓' : i + 1}</span><b>${t}</b><small>${i + 1 < n ? 'готово' : s}</small></div></li>`).join('')}</ol>
</main></div>`,
  }

  /* ════════════ 5 · HUD ════════════ */
  const рельс = (текущий) => `<nav class="l5-rail">${[['◉', 'Лобби'], ['⚔', 'Матчи'], ['▣', 'Сундуки'], ['❖', 'Коллекция'], ['▲', 'Рейтинг'], ['✦', 'Задания']].map(([и, t]) => `<a${t === текущий ? ' aria-current="page"' : ''}><i>${и}</i><span>${t}</span></a>`).join('')}</nav>`
  const шапкаHUD = () => `<header class="a-hd l5-hd"><div class="a-hd__in"><a class="a-brand"><i class="a-brand__mark">F</i><span>Fantasy <b>Dota 2</b></span></a><span class="l5-rank"><i>II</i><span><b>Серебро II</b><small>1 150 / 1 500 до золота</small></span></span><div class="a-hd__right"><span class="a-coins"><i></i><b>1 000</b></span><span class="a-ava">S</span></div></div></header>`
  const hud = {
    что: { главная: 'Лобби игры: меню слева, в центре твой состав из 5 карт и отсчёт до матча, справа задания и ранг', галерея: 'Инвентарь: фильтры слева, сетка ячеек, справа выбранная карта крупно', игрок: 'Экран персонажа: карта в центре, слева характеристики, справа матч и герои, ниже вкладки' },
    главная: () => `
<div class="ap ap--home">${шапкаHUD()}
<div class="l5-shell">${рельс('Лобби')}
<main class="a-page l5-lobby">
  <div class="l5-lobby__c">
    <div class="l5-sq__h"><h3>Состав на сегодня</h3><span class="a-muted">прогноз 91.0 очка</span><button type="button" class="a-btn a-btn--sm">Изменить</button></div>
    <div class="l5-sq">${МОИ.map(([ид, , t, p]) => `<div class="l5-slot"><span class="l5-slot__pos">POS ${ИГРОКИ[ид].pos}</span>${картаF(ид, 150)}<small>${t} · <b>${p}</b></small></div>`).join('')}</div>
    <section class="a-panel l5-next"><span class="a-kick">Следующий матч твоих игроков</span>
      <div class="l5-next__row"><span>${лого('pv')}<b>PARIVISION</b></span><div class="l5-timer"><b>02:14:37</b><small>DreamLeague S27 · Bo3 · 18:00</small></div><span>${лого('bb')}<b>BetBoom</b></span></div>
      <button type="button" class="a-btn a-btn--pri a-btn--lg">Сделать прогноз</button></section>
    <section class="a-panel"><div class="a-ph"><h3>Идут сейчас</h3></div>${ВСЕ_МАТЧИ.filter((м) => м.ст !== 'ft').map(матчСтрокаГл).join('')}</section>
  </div>
  <aside class="l5-lobby__r">
    <section class="a-panel"><div class="a-ph"><h3>Задания</h3><span class="a-muted">до 00:00</span></div>${квесты()}</section>
    <section class="a-panel a-acc"><div class="a-ph"><h3>Сундук точности</h3><span class="a-muted">4 / 15</span></div>${точность()}</section>
    <section class="a-panel"><div class="a-ph"><h3>Рейтинг недели</h3></div>${лидеры()}</section>
  </aside>
</main></div></div>`,

    галерея: () => `
<div class="ap ap--gal">${шапкаHUD()}
<div class="l5-shell">${рельс('Коллекция')}
<main class="a-page l5-inv">
  <aside class="a-panel l5-flt"><h3>Фильтры</h3>${[['Игра', ['Dota 2', 'LoL', 'CS 2']], ['Позиция', ['Все', 'Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5']], ['Редкость', ['Legend', 'Prism', 'Holo', 'Base']], ['Сила', ['Elite', 'Gold', 'Silver', 'Bronze']]].map(([t, вар]) => `<div class="l5-flt__g"><small>${t}</small>${вар.map((в, i) => `<button type="button"${i === 0 ? ' aria-pressed="true"' : ''}>${в}</button>`).join('')}</div>`).join('')}</aside>
  <section class="l5-cells">${ГАЛЕРЕЯ.map(([ид, ц]) => `<div class="l5-cell${ид === '9class' ? ' is-on' : ''}">${картаF(ид, 132)}${цена(ц)}</div>`).join('')}</section>
  <aside class="a-panel l5-det"><span class="a-kick">Выбрано</span>${картаИгрока(230)}
    <div class="l5-det__r">${СТАТЫ_9.slice(0, 3).map(([к, , v]) => `<span><small>${к}</small><b data-v="${ур(v)}">${v}</b></span>`).join('')}</div>
    <div class="l5-det__buy">${цена(1450)}<span class="a-muted">продано 31 / 400</span></div>
    <button type="button" class="a-btn a-btn--pri a-btn--lg">Купить</button><button type="button" class="a-btn">В сравнение</button></aside>
</main></div></div>`,

    игрок: () => `
<div class="ap ap--pl">${шапкаHUD()}
<div class="l5-shell">${рельс('Коллекция')}
<main class="a-page l5-char">
  <div class="l5-char__top">
    <section class="a-panel l5-stats"><h3>Характеристики</h3>${СТАТЫ_9.map(([к, имя, v]) => `<div class="l5-st"><span><b>${к}</b><small>${имя}</small></span><span class="a-bar" style="--p: ${v}%"><i></i></span><em data-v="${ур(v)}">${v}</em></div>`).join('')}
      <div class="l5-avg">${[['KDA', `${ИГРОК.средние.k} / ${ИГРОК.средние.d} / ${ИГРОК.средние.a}`], ['GPM', ИГРОК.средние.gpm], ['XPM', ИГРОК.средние.xpm]].map(([k, v]) => `<span><small>${k}</small><b>${v}</b></span>`).join('')}</div></section>
    <div class="l5-hero">${картаИгрока(300)}<div class="l5-hero__n"><b>9Class</b><small>${лого('pv')} PARIVISION · Pos 4 · Support</small></div><div class="l5-hero__acts"><button type="button" class="a-btn a-btn--pri a-btn--lg">В состав</button><button type="button" class="a-btn a-btn--lg">Следить</button></div></div>
    <div class="l5-char__r">
      <section class="a-panel"><span class="a-live"><i class="a-dot"></i>Сейчас · ${СЕЙЧАС.турнир}</span><div class="l1-now">${лого('pv')}<b>PV</b><i>vs</i>${моно('LGD')}<b>LGD</b><small>${СЕЙЧАС.далее}</small></div><button type="button" class="a-btn a-btn--pri a-btn--sm">Прогноз</button></section>
      <section class="a-panel"><div class="a-ph"><h3>Сигнатурные герои</h3></div>${ГЕРОИ.slice(0, 4).map((h) => `<div class="l5-hr"><img class="a-hero" src="${героиКартинка(h.id)}" alt="" /><span><b>${h.имя}</b><small>${h.м} матчей</small></span><em>${винрейт(h)}%</em></div>`).join('')}</section>
    </div>
  </div>
  <nav class="a-subnav">${['Хайлайты', 'Путь', 'Трофеи', 'Матчи', 'Факты'].map((t, i) => `<a${i === 0 ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="l5-vids">${ВИДЕО.slice(0, 4).map((v) => `<a class="a-vid"><span class="a-vid__img"><img src="${превью(v.id)}" alt="" loading="lazy" /><i class="a-vid__play"></i></span><b>${v.имя}</b><small>${v.где}</small></a>`).join('')}</div>
  <section class="a-panel"><div class="a-ph"><h3>Путь</h3></div><ol class="a-road">${ПУТЬ.map((п, i) => `<li class="${i === ПУТЬ.length - 1 ? 'is-now' : ''}"><span class="a-road__dot">${логоИли(п.лого, п.мон)}</span><span class="a-road__d">${п.с}${п.по !== п.с ? ` — ${п.по}` : ''}</span><b>${п.команда}</b><small>${п.что}</small></li>`).join('')}</ol></section>
</main></div></div>`,

    // Онбординг — кат-сцены: каждый шаг на весь экран, без меню; сверху 5 отрезков, огромный номер шага фоном
    онб: (n, d) => `
<div class="ap ap--ob l5-ob">
  <header class="l5-ob__top"><a class="a-brand"><i class="a-brand__mark">F</i><span>Fantasy <b>Dota 2</b></span></a><ol class="l5-seg">${ШАГИ.map((_, i) => `<li class="${i + 1 < n ? 'is-done' : i + 1 === n ? 'is-now' : ''}"></li>`).join('')}</ol><span class="a-coins"><i></i><b>${d.монеты}</b></span><a class="a-link">Пропустить</a></header>
  <span class="l5-ob__big">0${n}</span>
  <div class="l5-ob__c"><span class="a-kick">Шаг ${n} / 5 · ${ШАГИ[n - 1][0]}</span><h1 class="a-h1">${d.заголовок}</h1><p class="a-lead">${d.лид}</p></div>
  <div class="a-ob__body l5-ob__body">${d.тело}</div>
  <footer class="l5-ob__foot"><span class="a-reward">Награда: <b>${d.награда}</b></span><small>${d.пояснение}</small><button type="button" class="a-btn a-btn--pri a-btn--lg">${d.кнопка} →</button></footer>
</div>`,
  }

  window.РАСКЛАДКИ = { tablo, coll, wiki, hud }
  Object.assign(САЙТ.h, { шапкаHUD, рельс }) // для страниц матчей (_matches.js)
})()
