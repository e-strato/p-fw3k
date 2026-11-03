/* Лаба «Сайт в одном стиле» — набор 6 «Эфир» (Claude-B, 01.10): сайт как графика киберспортивной трансляции.
   Раскладка efir добавляется к раскладкам Claude-A (_раскладки.js) — его файлы не трогаем, только Object.assign.
     Главная  — эфир live-матча (счёт-баг, игроки пятёрки плашками-«титрами»), под ним программа дня сеткой по времени, справа «студия»;
     Галерея  — драфт: ряды по позициям 1–5, пики карт, справа представление выбранного игрока и сундуки;
     Игрок    — интро на трансляции: огромный ник на цвете команды, стат-карты, сравнение со средним саппортом, хайлайты, путь, трофеи;
     Онбординг — предматчевое шоу: рандаун из 5 сегментов с наградами, отсчёт до матча, снизу «далее в эфире».
   Данные — общие (_сайт.js, ../страница-игрока/_игрок.js); программа дня и сравнение со средним — условные. */
(() => {
  const { лого, моно, логоИли, картаF, ИГРОКИ, РЕДКОСТЬ, шапка, ГАЛЕРЕЯ, СУНДУКИ, ШАГИ } = САЙТ.h
  const фото = (ид) => `/p-fw3k/site/img/players/${ИГРОКИ[ид].фото || '_silhouette.png'}`
  const цена = (n) => `<span class="a-gc__price"><i></i><b>${n.toLocaleString('ru')}</b></span>`
  const КОМАНДА = { PV: 'pv', TUN: 'tun', TS: 'ts', FLC: 'flc' }

  // Бегущая строка счёта под шапкой — как тикер внизу эфира
  const ТИКЕР = [['live', 'ts', 'TS', 1, 'tun', 'TUN', 0, 'К2 · 27:41'], ['live', 'yg', 'YG', 0, '', 'LVL', 0, 'К1 · 14:02'], ['ft', 'gg', 'GG', 2, 'flc', 'FLC', 1, 'Итог'],
    ['up', 'pv', 'PV', '', 'bb', 'BB', '', '18:00'], ['up', '', 'LGD', '', '', 'XG', '', '19:30'], ['up', 'tl', 'TL', '', 'aur', 'AUR', '', '21:30']]
  const тикер = () => {
    const ряд = ТИКЕР.map(([ст, ка, та, са, кб, тб, сб, t]) => `<span class="l6-tk l6-tk--${ст}"><small>${ст === 'live' ? '<i class="a-dot"></i>' : ''}${t}</small>${логоИли(ка, та)}<b>${та}</b><em>${са}${ст === 'up' ? '' : ' : '}${сб}</em><b>${тб}</b>${логоИли(кб, тб)}</span>`).join('')
    return `<div class="l6-ticker" aria-label="Счёт матчей"><div class="l6-ticker__run">${ряд}${ряд}</div></div>`
  }
  const шапкаЭфир = (т) => шапка(т) + тикер()

  // Отсчёт: элементы [data-l6-t="сек"] тикают раз в секунду (во всех экранах и кадрах)
  const чч = (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((x) => String(x).padStart(2, '0')).join(':')
  const отсчёт = (сек) => `<b class="l6-count" data-l6-t="${сек}">${чч(сек)}</b>`
  setInterval(() => document.querySelectorAll('[data-l6-t]').forEach((el) => { const s = Math.max(0, +el.dataset.l6T - 1); el.dataset.l6T = s; el.textContent = чч(s) }), 1000)

  /* ── Главная: эфир + программа дня + студия ── */
  const МОИ_В_ЭФИРЕ = [['yatoro', 'ts', 'Team Spirit · Pos 1', '6 / 1 / 4', '21.4'], ['pure', 'tun', 'Tundra Esports · Pos 1', '3 / 4 / 2', '24.0']]
  const титр = ([ид, к, где, kda, p]) => `
    <div class="l6-lt" style="--tc: var(--c-team-${к})"><span class="l6-lt__ph"><img src="${фото(ид)}" alt="" /></span>
      <span class="l6-lt__who"><b>${ИГРОКИ[ид].ник}</b><small>${где}</small></span>
      <span class="l6-lt__n"><small>KDA</small><b>${kda}</b></span><span class="l6-lt__n"><small>очки</small><b>${p}</b></span></div>`

  // Программа дня: часы 12–24, блок матча по времени начала и длине серии; «сейчас» — 16:40
  const ПРОГРАММА = [
    ['DreamLeague S27', 'Плей-офф · Bo3', [
      { с: 13, д: 2.4, ст: 'ft', a: ['gg', 'GG', 2], b: ['flc', 'FLC', 1], t: 'Итог' },
      { с: 15.5, д: 2.4, ст: 'live', a: ['ts', 'TS', 1], b: ['tun', 'TUN', 0], t: 'К2 · 27:41', мои: 2 },
      { с: 18, д: 2.4, ст: 'up', a: ['pv', 'PV', ''], b: ['bb', 'BB', ''], t: '18:00', мои: 1 },
      { с: 21.5, д: 2.4, ст: 'up', a: ['tl', 'TL', ''], b: ['aur', 'AUR', ''], t: '21:30' }]],
    ['BLAST Slam VIII', 'Группа A · Bo2', [
      { с: 16, д: 2, ст: 'live', a: ['yg', 'YG', 0], b: ['', 'LVL', 0], t: 'К1 · 14:02' },
      { с: 19.5, д: 2, ст: 'up', a: ['', 'LGD', ''], b: ['', 'XG', ''], t: '19:30' }]],
    ['LEC Summer', 'Финал верхней сетки · Bo5', [
      { с: 20, д: 3.4, ст: 'up', a: ['', 'G2', ''], b: ['', 'FNC', ''], t: '20:00 · LoL' }]],
  ]
  const СЕЙЧАС_Ч = 16 + 40 / 60
  const пр = (ч) => `${((ч - 12) / 12) * 100}%`
  const блок = (м) => `<div class="l6-slot l6-slot--${м.ст}${м.мои ? ' is-mine' : ''}" style="left: ${пр(м.с)}; width: calc(${(м.д / 12) * 100}% - 4px)">
    <small>${м.ст === 'live' ? '<i class="a-dot"></i>' : ''}${м.t}${м.мои ? ` · <i class="a-star"></i>${м.мои}` : ''}</small>
    <span>${логоИли(м.a[0], м.a[1])}<b>${м.a[1]}</b><em>${м.a[2]}${м.ст === 'up' ? '' : ':'}${м.b[2]}</em><b>${м.b[1]}</b>${логоИли(м.b[0], м.b[1])}</span></div>`
  const программа = () => `
  <section class="a-panel l6-prog">
    <div class="a-ph"><h3>Программа дня · 1 октября</h3><div class="a-chips"><button type="button" aria-pressed="true">Все</button><button type="button">Live · 2</button><button type="button">Мои игроки</button></div></div>
    <div class="l6-prog__grid">
      <div class="l6-prog__hrs"><span></span><div>${Array.from({ length: 12 }, (_, i) => `<i style="left: ${(i / 12) * 100}%">${12 + i}:00</i>`).join('')}</div></div>
      ${ПРОГРАММА.map(([имя, где, мм]) => `<div class="l6-prog__row"><span class="l6-prog__t"><b>${имя}</b><small>${где}</small></span><div class="l6-prog__lane">${мм.map(блок).join('')}</div></div>`).join('')}
      <div class="l6-prog__now" style="--x: ${((СЕЙЧАС_Ч - 12) / 12).toFixed(4)}"><small>16:40</small></div>
    </div>
  </section>`

  const студия = () => `
  <aside class="l6-studio">
    <section class="a-panel l6-next"><div class="a-ph"><h3>Далее в эфире</h3></div>
      <div class="l6-next__m">${лого('pv')}<span><b>PARIVISION — BetBoom</b><small>DreamLeague S27 · твой 9Class</small></span>${лого('bb')}</div>
      <div class="l6-next__t"><span>до начала</span>${отсчёт(4637)}</div>
      <button type="button" class="a-btn a-btn--pri l6-wipe">Прогноз на матч</button></section>
    <section class="a-panel"><div class="a-ph"><h3>Квесты дня</h3><span class="a-muted">до 00:00</span></div>
      ${[['Сделай 3 прогноза', 1, 3, '+30'], ['Открой сундук', 0, 1, '+20'], ['Собери пятёрку', 1, 1, '+50']].map(([t, n, всего, н]) => `<div class="a-q${n >= всего ? ' is-done' : ''}"><span class="a-q__t"><b>${t}</b><small>${n} / ${всего}</small></span><span class="a-bar" style="--p: ${(n / всего) * 100}%"><i></i></span><em>${н}</em></div>`).join('')}</section>
    <section class="a-panel a-acc"><div class="a-ph"><h3>Сундук точности</h3><span class="a-muted">4 из 15</span></div>
      <div class="a-acc__seg">${Array.from({ length: 15 }, (_, i) => `<i${i < 4 ? ' class="is-on"' : ''}></i>`).join('')}</div><p class="a-acc__t">Ещё 11 верных — <b>сундук Prism</b></p></section>
    <section class="a-panel"><div class="a-ph"><h3>Лидеры недели</h3><a class="a-link">Все →</a></div>
      ${[['1', 'Kotik_TS', '2 340'], ['2', 'ArtStyleFan', '2 295'], ['3', 'wnd', '2 210']].map(([n, ник, о]) => `<div class="a-lr"><span class="a-lr__n">${n}</span><span class="a-ava a-ava--s">${ник[0]}</span><b>${ник}</b><em>${о}</em></div>`).join('')}
      <div class="a-lr a-lr--me"><span class="a-lr__n">—</span><span class="a-ava a-ava--s">S</span><b>Skywrath_77</b><em>1 150</em></div></section>
  </aside>`

  /* ── Галерея: драфт по позициям ── */
  const РОЛИ = [[1, 'Керри'], [2, 'Мид'], [3, 'Оффлейн'], [4, 'Саппорт'], [5, 'Полный саппорт']]
  const ПИК = '9class'
  const стат = (к, имя, v) => `<div class="l6-sc__r"><span><b>${к}</b><small>${имя}</small></span><span class="a-bar" style="--p: ${v}%"><i></i></span><em>${v}</em></div>`

  /* ── Онбординг: рандаун предматчевого шоу ── */
  const ДЛИТ = ['0:30', '0:20', '0:40', '1:00', '0:15']

  const efir = {
    что: {
      главная: 'Эфир live-матча со счётом-багом и титрами твоих игроков; под ним программа дня сеткой по часам; справа «студия» — отсчёт, квесты, лидеры',
      галерея: 'Драфт: карты рядами по позициям 1–5, выбранный пик — справа представлением игрока, как на трансляции',
      игрок: 'Интро игрока: огромный ник на цвете команды, стат-карты и сравнение со средним саппортом, дальше хайлайты, путь и трофеи',
    },

    главная: () => `
<div class="ap ap--home">${шапкаЭфир('Главная')}
<main class="a-page l6-home">
  <section class="l6-air" style="--ta: var(--c-team-ts); --tb: var(--c-team-tun)">
    <div class="l6-air__bug"><span class="l6-bug__t">${лого('ts')}<b>TS</b></span><span class="l6-bug__s"><b>1</b><b>0</b></span><span class="l6-bug__t">${лого('tun')}<b>TUN</b></span><span class="l6-bug__m"><i class="a-dot"></i>К2 · 27:41</span></div>
    <span class="l6-air__league">DreamLeague S27 · Плей-офф · Bo3</span>
    <div class="l6-air__main">
      <div class="l6-air__team">${лого('ts')}<b>Team Spirit</b></div>
      <div class="l6-air__score"><b>1</b><i>:</i><b>0</b></div>
      <div class="l6-air__team l6-air__team--r"><b>Tundra Esports</b>${лого('tun')}</div>
    </div>
    <div class="l6-air__foot">
      <div class="l6-air__lts">${МОИ_В_ЭФИРЕ.map(титр).join('')}</div>
      <div class="l6-air__vote"><div class="l6-split"><span style="--p: 58%"><b>Spirit 58%</b></span><span><b>42% Tundra</b></span></div>
        <div class="l6-air__acts"><button type="button" class="a-btn a-btn--lg l6-wipe">Смотреть</button><button type="button" class="a-btn a-btn--pri a-btn--lg l6-wipe">Прогноз на карту 3</button></div></div>
    </div>
  </section>
  <div class="l6-home__grid">
    <div class="l6-home__main">${программа()}
      <section class="a-panel l6-five"><div class="a-ph"><h3>Твоя пятёрка в эфире сегодня</h3><span class="a-muted">прогноз 91.0 очка</span><a class="a-link">Состав →</a></div>
        <div class="l6-five__row">${[['9class', '18:00'], ['yatoro', 'Live'], ['pure', 'Live'], ['rue', 'Live'], ['collapse', 'Live']].map(([ид, t]) => `<div class="l6-five__c">${картаF(ид, 132)}<small class="${t === 'Live' ? 'is-live' : ''}">${t === 'Live' ? '<i class="a-dot"></i>в эфире' : `в ${t}`}</small></div>`).join('')}</div></section>
    </div>
    ${студия()}
  </div>
</main></div>`,

    галерея: () => {
      const п = ИГРОКИ[ПИК]
      return `
<div class="ap ap--gal">${шапкаЭфир('Коллекция')}
<main class="a-page l6-draft">
  <div class="l6-draft__head"><h1 class="a-h1 a-h1--page">Драфт карт</h1>
    <div class="l6-board">${[['Игра', 'Dota 2'], ['Редкость', 'Все'], ['Сила', 'Все'], ['Сортировка', 'Сначала дорогие']].map(([k, v]) => `<button type="button" class="l6-board__i"><small>${k}</small><b>${v}</b></button>`).join('')}</div>
    <div class="a-seg a-seg--lg"><button type="button" aria-pressed="true">Купить</button><button type="button" aria-pressed="false">Моя коллекция · 3</button></div></div>
  <div class="l6-draft__body">
    <div class="l6-picks">${РОЛИ.map(([pos, роль]) => `
      <div class="l6-pick-row"><span class="l6-pick-row__pos"><b>${pos}</b><small>${роль}</small></span>
        <div class="l6-pick-row__cards">${ГАЛЕРЕЯ.filter(([ид]) => ИГРОКИ[ид].pos === pos).map(([ид, ц]) => `<div class="l6-pk${ид === ПИК ? ' is-on' : ''}">${картаF(ид, 116)}${цена(ц)}</div>`).join('')}</div></div>`).join('')}</div>
    <aside class="l6-side">
      <section class="a-panel l6-intro" style="--tc: var(--c-team-pv)">
        <div class="l6-intro__art">${картаF(ПИК, 190)}</div>
        <div class="l6-intro__lt"><b>${п.ник}</b><small>${лого(КОМАНДА[п.тег])}PARIVISION · Pos ${п.pos} · ${РЕДКОСТЬ[п.ред]}</small></div>
        <div class="l6-sc">${стат('FRM', 'Форма', 82)}${стат('SUR', 'Выживание', 91)}${стат('FGT', 'Драки', 60)}</div>
        <div class="l6-intro__buy">${цена(1450)}<span class="a-muted">продано 31 из 400 · +4.2 за сутки</span></div>
        <button type="button" class="a-btn a-btn--pri a-btn--lg l6-wipe">Забрать пик</button>
      </section>
      <section class="a-panel"><div class="a-ph"><h3>Сундуки</h3><span class="a-muted">шансы открыты</span></div>
        ${СУНДУКИ.map(([t, s, ц, шанс], i) => `<div class="a-chestrow${i === 1 ? ' is-pick' : ''}"><span class="a-chestrow__box a-chestrow__box--${i}"></span><span><b>${t}</b><small>${s}</small><small class="a-chestrow__odds">${шанс}</small></span><button type="button" class="a-btn a-btn--sm${i === 1 ? ' a-btn--pri' : ''}"><i class="a-coin"></i>${ц}</button></div>`).join('')}</section>
    </aside>
  </div>
</main></div>`
    },

    игрок: () => {
      const maxМ = Math.max(...ГЕРОИ.map((h) => h.м))
      const ср = [['GPM', ИГРОК.средние.gpm, 318], ['XPM', ИГРОК.средние.xpm, 441], ['Ассисты', ИГРОК.средние.a, 12.1], ['Смерти', ИГРОК.средние.d, 7.2, 1]]
      return `
<div class="ap ap--pl">${шапкаЭфир('Коллекция')}
<main class="a-page l6-pl">
  <section class="l6-plh" style="--tc: ${ИГРОК.команда.цвет}">
    <img class="l6-plh__ph" src="${ИГРОК.фото}" alt="${ИГРОК.ник}" />
    <div class="l6-plh__txt">
      <h1 class="l6-plh__nick">${ИГРОК.ник}</h1>
      <div class="l6-plh__lt"><span>${лого('pv')}<b>PARIVISION</b></span><span><b>Pos 4</b> · ${ИГРОК.роль}</span><span><i class="player-card__flag player-card__flag--ru"></i>${ИГРОК.имя} · ${ИГРОК.возраст} года</span></div>
      <div class="l6-plh__acts"><button type="button" class="a-btn a-btn--pri a-btn--lg l6-wipe">В состав</button><button type="button" class="a-btn a-btn--lg l6-wipe">Следить</button><span class="a-muted">в 34% составов</span></div>
    </div>
    <div class="l6-plh__card">${картаИгрока(230)}</div>
  </section>
  <div class="l6-stats">${ИГРОК.цифры.map((ц) => `<div class="l6-stat"><b>${ц.v}</b><small>${ц.t}</small></div>`).join('')}
    <div class="l6-stat l6-stat--cmp"><small>За карту против среднего саппорта Tier 1</small>${ср.map(([k, v, avg, меньше]) => `<div class="l6-cmp"><span>${k}</span><span class="l6-cmp__bar"><i style="--p: ${Math.min(100, (v / Math.max(v, avg)) * 100)}%"></i><u style="--p: ${Math.min(100, (avg / Math.max(v, avg)) * 100)}%"></u></span><b class="${(меньше ? v < avg : v > avg) ? 'is-up' : 'is-down'}">${v}</b></div>`).join('')}</div></div>
  <div class="l6-pl__grid">
    <div class="l6-pl__main">
      <section class="a-panel"><div class="a-ph"><h3>Хайлайты</h3><a class="a-link">Все видео →</a></div>
        <div class="a-vids">${ВИДЕО.slice(0, 5).map((v, i) => `<a class="a-vid${i === 0 ? ' a-vid--big' : ''}"><span class="a-vid__img"><img src="${превью(v.id)}" alt="" loading="lazy" /><i class="a-vid__play"></i></span><b>${v.имя}</b><small>${v.где}</small></a>`).join('')}</div></section>
      <section class="a-panel"><div class="a-ph"><h3>Путь</h3></div>
        <ol class="l6-path">${ПУТЬ.map((п, i) => `<li class="${i === ПУТЬ.length - 1 ? 'is-now' : ''}"><span class="l6-path__d">${п.с}${п.по !== п.с ? ` — ${п.по}` : ''}</span><span class="l6-path__t">${логоИли(п.лого, п.мон)}<b>${п.команда}</b></span><small>${п.что}</small></li>`).join('')}</ol></section>
      <section class="a-panel"><div class="a-ph"><h3>Трофеи</h3><span class="a-muted">${ИГРОК.призовые} призовых</span></div>
        ${ТРОФЕИ.slice(0, 5).map((т) => `<div class="a-tbl__r"><span class="a-place a-place--${т.место}">${т.место}</span><b>${т.турнир}</b><small>${т.финал}</small><small>${т.дата}</small><em>${т.приз}</em></div>`).join('')}</section>
    </div>
    <aside class="l6-pl__side">
      <section class="a-panel l6-next"><div class="a-ph"><h3>Далее в эфире</h3><span class="a-live"><i class="a-dot"></i>${СЕЙЧАС.турнир}</span></div>
        <div class="l6-next__m">${лого('pv')}<span><b>PARIVISION — LGD</b><small>${СЕЙЧАС.далее} · ${СЕЙЧАС.за}</small></span>${моно('LGD')}</div>
        <div class="l6-next__t"><span>до начала</span>${отсчёт(15420)}</div>
        <button type="button" class="a-btn a-btn--pri l6-wipe">Прогноз на 9Class</button></section>
      <section class="a-panel"><div class="a-ph"><h3>Сигнатурные герои</h3><span class="a-muted">профматчи</span></div>
        ${ГЕРОИ.slice(0, 5).map((h) => `<div class="l6-hr"><img class="a-hero" src="${героиКартинка(h.id)}" alt="" /><span><b>${h.имя}</b><small>${h.м} матчей</small></span><span class="a-bar" style="--p: ${(h.м / maxМ) * 100}%"><i></i></span><em>${винрейт(h)}%</em></div>`).join('')}</section>
      <section class="a-panel"><div class="a-ph"><h3>Факты</h3></div>
        <div class="l6-facts">${ФАКТЫ.slice(0, 3).map((ф) => `<div class="l6-fact"><b>${ф.big}</b><small>${ф.t}</small></div>`).join('')}</div></section>
    </aside>
  </div>
</main></div>`
    },

    онб: (n, d) => `
<div class="ap ap--ob l6-ob">
  <header class="a-hd l6-ob__hd"><div class="a-hd__in"><a class="a-brand"><i class="a-brand__mark">F</i><span>Fantasy <b>Dota 2</b></span></a>
    <span class="a-hd__note">Предматчевое шоу для новичка</span>
    <div class="a-hd__right"><span class="l6-ob__cd"><small>PARIVISION — BetBoom через</small>${отсчёт(4637)}</span><span class="a-coins"><i></i><b>${d.монеты}</b></span><a class="a-link">Пропустить</a></div></div></header>
  <ol class="l6-run">${ШАГИ.map(([t, s], i) => `<li class="${i + 1 < n ? 'is-done' : i + 1 === n ? 'is-now' : ''}"><span class="l6-run__n">${i + 1 < n ? '✓' : i + 1}</span><span><b>${t}</b><small>${i + 1 < n ? 'в эфире было' : s} · ${ДЛИТ[i]}</small></span></li>`).join('')}</ol>
  <main class="l6-ob__main">
    <div class="l6-ob__title"><span class="l6-ob__seg"><b>${n}</b><small>из 5</small></span><div><h1 class="a-h1">${d.заголовок}</h1><p class="a-lead">${d.лид}</p></div></div>
    <div class="a-ob__body l6-ob__body">${d.тело}</div>
  </main>
  <footer class="l6-ob__foot">
    <div class="l6-ob__nx">${n < 5 ? `<small>Далее в эфире</small><b>${ШАГИ[n][0]}</b><em>${ШАГИ[n][1]}</em>` : `<small>Далее в эфире</small><b>PARIVISION — BetBoom</b><em>сегодня в 18:00</em>`}</div>
    <span class="a-reward">Награда сегмента: <b>${d.награда}</b></span><small>${d.пояснение}</small>
    <button type="button" class="a-btn a-btn--pri a-btn--lg l6-wipe">${d.кнопка}</button>
  </footer>
</div>`,
  }

  Object.assign(window.РАСКЛАДКИ, { efir })
  Object.assign(САЙТ.h, { шапкаЭфир, отсчёт }) // для страниц матчей (_matches.js)
})()
