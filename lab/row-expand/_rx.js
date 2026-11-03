// Лаба «Раскрытая строка матча» — общее для v1–v4. Строка — копия строки сайта (Match Center / главная: классы .mx-x из
// /p-fw3k/site/styles.css [=== Match Center ===]), раскрытие — своё (.rx-*), вариант задаёт <body data-v="1|2|3|4">.
// Две рамки: колонка главной ~1000 и телефон 390; в каждой обёртка .mc — тот же container query «mx», что на сайте.
// Клик по строке открывает и закрывает, открыта всегда одна (в своей рамке), первая открыта сразу. Высота — плавно (0fr → 1fr).
;(() => {
  const V = document.body.dataset.v
  const РОВНО = document.body.dataset.ic === 'even' // v5: три иконки одного размера, шеврон — тоже иконка (поворачивается)
  const С_ЛОГО = ['aur', 'bb', 'ts', 'tun', 'flc', 'tl', 'gg', 'pv'] // у остальных на сайте нет картинки — плашка с кодом, как в Match Center
  const лого = (id, sm) => С_ЛОГО.includes(id)
    ? `<img class="mx-lg${sm ? ' sm' : ''}" src="/p-fw3k/site/img/teams/${id}.png" alt="" />`
    : `<span class="mx-lg mx-lg--mono${sm ? ' sm' : ''}">${id.toUpperCase()}</span>`
  const точки = s => `<span class="mx-form">${[...s].map(c => `<i class="${c === 'W' ? 'w' : 'l'}"></i>`).join('')}</span>`
  const ИК = {
    bell: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a4 4 0 0 0-4 4v2.5L3 11h10l-1-2.5V6a4 4 0 0 0-4-4ZM6.5 13a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.2l2 1.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    tv: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 6.3v3.4L9.8 8Z" fill="currentColor"/></svg>',
    chev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chat: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5v5A1.5 1.5 0 0 1 11.5 11H7l-3 2.5V11h0a1 1 0 0 1-1-1Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  }

  // Золото по минутам: + — у первой команды, − — у второй
  const ЗОЛОТО = [0, 3, 5, 2, -4, -6, -3, 2, 6, 9, 7, 11, 14, 10, 16, 19, 15, 21, 24, 20, 26, 30]
  const золото = () => `<div class="rx-gold">${ЗОЛОТО.map(v => `<i class="${v >= 0 ? 'up' : 'dn'}" style="--h:${Math.abs(v) * 3}%"></i>`).join('')}</div>`
  const карты = l => `<div class="rx-maps">${l.map(([s, v, c]) => `<span class="${c || ''}"><small>${s}</small>${v}</span>`).join('')}</div>`
  const игрок = (img, имя, kda) => `<div class="rx-pl">${img ? `<img src="/p-fw3k/site/img/players/${img}.webp" alt="" />` : '<i></i>'}<span><b>${имя}</b><small>${kda}</small></span></div>`
  const шанс = (p, кто) => `<p class="rx-sp"><b>${p}%</b><span>${кто}</span><b>${100 - p}%</b></p><div class="rx-bar"><i style="--p:${p}%"></i></div>`

  // Матчи: строка (как на сайте) + раскрытие по состоянию — ячейки, кнопки и тонкая полоса v4
  const М = [
    { id: 'aur-bb', cls: 'st-done', g: 'Dota 2', tour: 'BLAST Slam VIII · Плей-офф · Bo3', a: ['aur', 'Aurora', 'WW'], b: ['bb', 'BetBoom Team', 'W'],
      va: ['—', '53%', '1.77', '—', '—'], vb: ['—', '47%', '2.00', '—', '—'], win: 'a', st: ['is-mute', 'Завершён'], clock: '13:40', sc: '2 : 0', sub: ['', 'Итог · 13:40'],
      cells: [
        ['Карты серии', карты([['К1 · 38′', '31:18'], ['К2 · 44′', '27:20']])],
        ['Игрок матча', игрок('pure', 'Pure · Aurora', '14 / 2 / 11 · Faceless Void')],
        ['Новости', '<a class="rx-nw" href="#">Разбор: как Aurora закрыла серию за 82 минуты</a>'],
      ],
      act: [['Страница матча', 1], ['Запись', 0]],
      strip: [карты([['К1', '31:18'], ['К2', '27:20']]), игрок('pure', 'Pure', '14 / 2 / 11'), '<a class="rx-nw" href="#">Разбор: как Aurora закрыла серию за 82 минуты</a>'] },
    { id: 'ts-tun', cls: 'st-live is-air', g: 'Dota 2', tour: 'BLAST Slam VIII · Плей-офф · Bo3', a: ['ts', 'Team Spirit', 'WWW'], b: ['tun', 'Tundra Esports', 'LL'],
      va: ['18', '52%', '1.81', '1.45', '+4%'], vb: ['12', '48%', '1.96', '2.45', '—'], st: ['is-live', 'Идёт'], clock: 'Карта 2 · 24:15', sc: '1 : 0', sub: ['is-live', 'Карта 2 · 24:15'],
      cells: [
        ['Карты серии', карты([['К1', '34:21'], ['К2 · идёт', '18:12', 'is-now'], ['К3', '—', 'is-wait']])],
        ['Золото · <em class="up">+4.2 тыс.</em> у Spirit', золото()],
        ['Лучший сейчас', игрок('yatoro', 'Yatoro · Spirit', '9 / 1 / 6 · 684 GPM')],
      ],
      act: [['Смотреть', 1], ['Страница матча', 0]],
      strip: ['<p class="rx-now"><i></i>Карта 2 · 18 : 12</p>', '<p class="rx-big"><b class="up">+4.2 тыс.</b><span>золота у Spirit</span></p>', игрок('yatoro', 'Yatoro', '9 / 1 / 6')] },
    { id: 'vit-mgz', cls: 'st-live is-air', g: 'CS2', tour: 'ESL Pro League S24 · Группа C · Bo3', a: ['vit', 'Team Vitality', 'WWW'], b: ['mgz', 'The MongolZ', 'WWW'],
      va: ['7', '56%', '1.68', '1.34', '—'], vb: ['5', '44%', '2.14', '2.68', '+6%'], st: ['is-live', 'Идёт'], clock: 'Карта 2 · Inferno · 7:5', sc: '1 : 0', sub: ['is-live', 'Карта 2 · Inferno · 7:5'],
      cells: [
        ['Карты серии', карты([['Mirage', '13:7'], ['Inferno · идёт', '7:5', 'is-now'], ['Ancient', '—', 'is-wait']])],
        ['Шанс победы', шанс(64, 'Team Vitality')],
        ['Следующая карта', '<p class="rx-txt">Ancient · выбор The MongolZ<small>если серия дойдёт до третьей</small></p>'],
      ],
      act: [['Смотреть', 1], ['Страница матча', 0]],
      strip: ['<p class="rx-now"><i></i>Inferno · 7 : 5</p>', '<p class="rx-big"><b>64%</b><span>шанс Vitality</span></p>', '<p class="rx-txt">Дальше Ancient · выбор The MongolZ</p>'] },
    { id: 'g2-fz', cls: 'st-break is-air', g: 'CS2', tour: 'ESL Pro League S24 · Группа C · Bo3', a: ['g2', 'G2 Esports', 'WW'], b: ['fz', 'FaZe Clan', 'WWL'],
      va: ['13', '65%', '1.45', '1.16', '—'], vb: ['11', '35%', '2.69', '3.36', '+2%'], st: ['is-mute', 'Перерыв'], clock: 'карта 3 через 4 мин', sc: '1 : 1', sub: ['', 'Перерыв · карта 3 через 4 мин'],
      cells: [
        ['Карты серии', карты([['Mirage', '13:9'], ['Inferno', '11:13'], ['Ancient', '4 мин', 'is-now']])],
        ['Шанс победы', шанс(64, 'G2 Esports')],
        ['Решающая карта', '<p class="rx-txt">Ancient · выбор FaZe Clan<small>кто возьмёт — тот выиграет серию</small></p>'],
      ],
      act: [['Смотреть', 1], ['Страница матча', 0]],
      strip: [карты([['Mirage', '13:9'], ['Inferno', '11:13']]), '<p class="rx-txt">Ancient через 4 мин · выбор FaZe</p>', '<p class="rx-big"><b>64%</b><span>шанс G2</span></p>'] },
    { id: 'flc-tl', cls: 'st-soon', g: 'Dota 2', tour: 'BLAST Slam VIII · Плей-офф · Bo3', a: ['flc', 'Team Falcons', 'WW'], b: ['tl', 'Team Liquid', 'W'],
      va: ['—', '52%', '1.81', '—', '—'], vb: ['—', '48%', '1.96', '—', '+6%'], st: ['', 'Запланирован'], clock: '17:00', sc: '17:00', sub: ['', 'Сегодня · через 1 ч 25 мин'], fav: 1,
      cells: [
        ['Форма · 5 матчей', `<div class="rx-forms"><p>${лого('flc', 1)}${точки('WWLWW')}<small>4 из 5</small></p><p>${лого('tl', 1)}${точки('LWWLL')}<small>2 из 5</small></p></div>`],
        ['Личные встречи', '<p class="rx-big"><b>3 : 2</b><span>в пользу Falcons · последняя 12 сентября</span></p>'],
        ['Кто победит · 2 140 голосов', '<div class="rx-vote"><button type="button" class="is-on"><span>Falcons</span><b>58%</b></button><button type="button"><span>Liquid</span><b>42%</b></button></div>'],
      ],
      act: [['Напомнить', 1], ['Страница матча', 0]],
      strip: [`<div class="rx-forms rx-forms--line"><p>${лого('flc', 1)}${точки('WWLWW')}</p><p>${лого('tl', 1)}${точки('LWWLL')}</p></div>`, '<p class="rx-big"><b>3 : 2</b><span>встречи</span></p>', '<div class="rx-vote"><button type="button" class="is-on"><span>Falcons</span><b>58%</b></button><button type="button"><span>Liquid</span><b>42%</b></button></div>'] },
  ]

  const кнопки = l => l.map(([t, main]) => `<a class="mx-btn${main ? ' mx-btn--main' : ''} rx-btn" href="#">${t}</a>`).join('')
  const ячейки = m => m.cells.map(([t, h], i) => `<div class="rx-c rx-c--${i}"><small>${t}</small>${h}</div>`).join('')
  const обёртка = (cls, html) => `<div class="rx-anim ${cls}"><div class="rx-clip"><div class="rx-pad">${html}</div></div></div>`

  // v1, v2 — раскрытие живёт в той же сетке, что строка: ячейки под левой частью, кнопки — в колонке счёта
  // v3 — ячейки и кнопки одной полосой под всей строкой (строка вместе с ней — одна карточка); v4 — тонкая полоса под всей строкой
  const раскрытие = m => {
    if (V === '1' || V === '2') return { внутри: обёртка('rx-x rx-body', ячейки(m)) + обёртка('rx-x rx-act', кнопки(m.act)), снизу: '' }
    if (V === '3') return { внутри: '', снизу: обёртка('rx-x rx-full', `<div class="rx-cells">${ячейки(m)}</div><div class="rx-acts">${кнопки(m.act)}</div>`) }
    return { внутри: '', снизу: обёртка('rx-x rx-full', `<div class="rx-strip">${m.strip.map(h => `<div class="rx-si">${h}</div>`).join('')}<div class="rx-acts">${кнопки(m.act)}</div></div>`) }
  }

  const команда = (m, k) => {
    const [id, имя, ф] = m[k], v = m['v' + k]
    const cls = m.win ? (m.win === k ? ' is-win' : ' is-lose') : ''
    return `<span class="mx-x__t${cls}">${лого(id)}<span class="mx-x__n"><b class="mx-nm">${имя}</b>${точки(ф)}</span></span>` +
      ['k', 'pre', 'odds', 'live', 'val'].map((c, i) => `<span class="mx-x__v mx-x__v--${c}${v[i] === '—' ? ' is-none' : ''}">${v[i]}</span>`).join('')
  }
  const строка = m => {
    const r = раскрытие(m)
    return `<article class="mx-row ${m.cls} is-click rx-row" data-id="${m.id}" aria-expanded="false">
      <div class="mx-row__in mx-x">
        <div class="mx-x__g">
          <p class="mx-x__h"><span class="mx-gt">${m.g}</span><span class="mx-x__tour">${m.tour}</span><a class="mx-x__go" href="#">матч ›</a></p>` +
          ['k:☠', 'pre:PRE', 'odds:ODDS', 'live:LIVE', 'val:VAL'].map(s => { const [c, t] = s.split(':'); return `<span class="mx-x__lb mx-x__lb--${c}">${t}</span>` }).join('') +
          команда(m, 'a') + команда(m, 'b') +
          `<p class="mx-x__f"><span class="mx-x__st ${m.st[0]}"><i></i>${m.st[1]}</span><button class="mx-fav${m.fav ? ' is-on' : ''}" type="button" title="Уведомлять о матче">${ИК.bell}</button><span class="mx-x__clock">${ИК.clock}${m.clock}</span></p>
          <p class="mx-x__ic"><a href="#" title="Трансляция">${ИК.tv}</a><a href="#" title="Обсуждение">${ИК.chat}</a>${РОВНО ? `<span class="mx-chev rx-chev">${ИК.chev}</span>` : '<span class="mx-chev">⌄</span>'}</p>
        </div>
        <div class="mx-x__time"><b>${m.sc}</b><small class="${m.sub[0]}">${m.sub[1]}</small></div>
        ${r.внутри}
      </div>
      ${r.снизу}
    </article>`
  }

  const список = () => `<div class="mc"><section class="mx-tour rx-list">${М.map(строка).join('')}</section></div>`
  document.querySelectorAll('[data-rx]').forEach(f => { f.innerHTML = список(); открыть(f.querySelector('.rx-row')) })

  function открыть (row) {
    const list = row.closest('.rx-list')
    list.querySelectorAll('.rx-row.is-open').forEach(r => { if (r !== row) закрыть(r) })
    row.classList.add('is-open'); row.setAttribute('aria-expanded', 'true'); if (!РОВНО) row.querySelector('.mx-chev').textContent = '⌃'
    list.classList.add('has-open')
  }
  function закрыть (row) {
    row.classList.remove('is-open'); row.setAttribute('aria-expanded', 'false'); if (!РОВНО) row.querySelector('.mx-chev').textContent = '⌄'
    const list = row.closest('.rx-list'); if (!list.querySelector('.rx-row.is-open')) list.classList.remove('has-open')
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (a && a.getAttribute('href') === '#') e.preventDefault()
    const fav = e.target.closest('.mx-fav'); if (fav) { fav.classList.toggle('is-on'); return }
    const vote = e.target.closest('.rx-vote button')
    if (vote) { vote.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b === vote)); return }
    if (a || e.target.closest('.rx-x')) return // внутри раскрытия клик строку не сворачивает
    const row = e.target.closest('.rx-row'); if (!row) return
    row.classList.contains('is-open') ? закрыть(row) : открыть(row)
  })
})()
