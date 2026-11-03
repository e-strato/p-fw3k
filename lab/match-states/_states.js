// Лаба «Матч одним экраном по состояниям» — одна страница матча, переключалка «До матча / В эфире / После матча».
// Каркас один: шапка матча → ряд плиток одного размера (как тикер карт в match-after v6) → открытая плитка крупно (слева основное, справа колонка).
// Один набор плиток во всех трёх состояниях и на тех же местах (дирижёр 07.10: «зашёл в одно, потом этого не нашёл»):
// Статистика · Награды · Фэнтези · Прогнозы и коэффициенты — меняется только содержимое. Карты серии живут внутри плитки «Статистика» (свой маленький переключатель).
// Телефон: v1 — те же плитки листаются вбок; v2–v4 (body[data-ph]) — вместо плиток сегмент / чипсы со статусом / нижние вкладки, шапка компактнее (дирижёр 07.10).
// Награды — первая и выделенная, из неё кнопками заходят в остальное. Шапка: до и после — карточка матча, в эфире — эфир (как страница матча сайта, state=live1).
// Открытая плитка запоминается при переключении состояния; по умолчанию: до — Награды, в эфире и после — Статистика.
// Движок рамок, шапки, вкладок и данных серии — ../match-after/_after.js (только читаем): здесь — MA.вариант и своё состояние ST.
// Коэффициенты — по мотивам лабы match-odds (условные букмекеры A/B/C, движение линии, модель против рынка), фэнтези — по match-fantasy v2.
;(() => {
  const MA = (window.MA = window.MA || {})

  // ——— Состояние страницы: что открыто и что пользователь сделал до матча ———
  const ПУСТО = { slots: [null, null, null, null, null], cap: null, win: null, sc: null, fb: null, savedF: false, savedP: false, seenOdds: false }
  const ПРИМЕРЫ = {
    some: { slots: [null, null, 'collapse', null, null], cap: null, win: null, sc: null, fb: null, savedF: false, savedP: false, seenOdds: false },
    none: ПУСТО,
    all: { slots: ['yatoro', 'larl', 'collapse', 'rue', 'whitemon'], cap: 'yatoro', win: 'ts', sc: '2:1', fb: 'ts', savedF: true, savedP: true, seenOdds: true },
  }
  const ST = (window.ST = { st: 'pre', tab: null, map: 0, demo: 'some', bet: null, src: 0, ...structuredClone(ПРИМЕРЫ.some) })
  const открыта = () => ST.tab || (ST.st === 'pre' ? 'r' : 'm') // какая плитка открыта: выбор пользователя или по состоянию

  // ——— Игроки матча (составы как в match-after: Spirit — Tundra) ———
  // ник, позиция, команда, OVR, редкость, фото, прогноз очков до матча, есть ли карта в коллекции, очки по итогу серии
  const ИГРОКИ = {
    yatoro: ['Yatoro', 1, 'ts', 82, 'holo', 'yatoro', 21.4, 1, 29.6], larl: ['Larl', 2, 'ts', 80, 'base', '', 18.2, 1, 27.2], collapse: ['Collapse', 3, 'ts', 88, 'prism', '', 15.1, 1, 18.4],
    rue: ['rue', 4, 'ts', 78, 'base', 'rue', 12.6, 1, 12.1], miposhka: ['Miposhka', 5, 'ts', 76, 'base', '', 9.8, 1, 10.3],
    crystallis: ['Crystallis', 1, 'tun', 91, 'prism', '', 22.0, 1, 21.5], bzm: ['bzm', 2, 'tun', 84, 'holo', '', 17.9, 0, 18.0], n33: ['33', 3, 'tun', 79, 'base', '', 9.1, 1, 9.4],
    saksa: ['Saksa', 4, 'tun', 81, 'holo', '', 11.4, 0, 8.2], whitemon: ['Whitemon', 5, 'tun', 74, 'base', '', 7.7, 1, 6.9],
  }
  const РОЛЬ = ['', 'Керри', 'Мид', 'Хардлейн', 'Поддержка 4', 'Поддержка 5']
  const п = (id) => { const [ник, pos, к, ovr, r, фото, очки, есть, итог] = ИГРОКИ[id]; return { id, ник, pos, к, ovr, r, фото, очки, есть: !!есть, итог } }
  const КОР = { ts: 'Spirit', tun: 'Tundra' }
  const ИТОГ = { win: 'ts', sc: '2:1', fb: 'tun' } // как закончился матч: Spirit 2 : 1, первая кровь карты 1 — Crystallis
  const ДРУЗЬЯ = [['Kostya_D', 1840], ['mirra', 1620], ['Вы', 1490, 1], ['tolik.exe', 1310], ['Sasha K', 990]]

  // Мини-карта «Жетон» — разметка компонента сайта (как match-fantasy/_mf.js), стили сайта висят на обёртке .hg
  const сила = (ovr) => (ovr >= 90 ? 'elite' : ovr >= 75 ? 'gold' : ovr >= 60 ? 'silver' : 'bronze')
  const карта = (id, w = 110) => {
    const x = п(id), маска = (cl, deco = '') => `<i class="logo-mask ${cl}" data-l="2"${deco} style="--logo: url('/p-fw3k/site/img/teams/${x.к}.png')"></i>`
    const spark = x.r === 'prism' ? '<i class="fx fx-spark" data-l="4"><b></b><b></b><b></b><b></b><b></b><b></b></i>' : ''
    const ph = `/p-fw3k/site/img/players/${x.фото ? x.фото + '.webp' : '_silhouette.png'}`
    return `<span class="hg"><span class="kc mk kc--${сила(x.ovr)} kc--${x.r} m3" data-tilt style="--w: ${w}px"><span class="kc__in"><span class="kc__face"><span class="mk-plate">${маска('mk-logo')}${маска('mk-logo mk-logo--a', ' data-deco="2"')}${маска('mk-logo mk-logo--b', ' data-deco="2"')}`
      + `<i class="mk-pix" data-deco="1"></i><i class="mk-halo"></i><img class="ph${x.фото ? '' : ' ph--sil'}" data-l="5" src="${ph}" alt="${x.ник}" /><i class="mk-scan" data-deco="3"></i><i class="fx fx-shine" data-l="4"></i>${spark}`
      + `<span class="m3__band"><span class="m3__pos">P${x.pos}</span><span class="m3__nick">${x.ник}</span></span><span class="m3__foot"><b>${x.к === 'ts' ? 'Team Spirit' : 'Tundra Esports'}</b></span></span>`
      + `<svg class="mk-frame" viewBox="0 0 160 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="14,1 159,1 159,181 140,199 1,199 1,14" /></svg>`
      + `<span class="m3__tab"><img class="logo" src="/p-fw3k/site/img/teams/${x.к}.png" alt="" /></span><span class="m3__ovr"><b>${x.ovr}</b></span><i class="fx fx-glare"></i></span></span></span></span>`
  }

  // ——— Время до старта и до закрытия состава (состав закрывается за 10 мин) ———
  const СТАРТ = 2 * 3600 + 25 * 60, ЗАКР = СТАРТ - 600, t0 = Date.now()
  const прошло = () => Math.floor((Date.now() - t0) / 1000)
  const чмс = (s) => (s <= 0 ? '00:00:00' : [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':'))
  // В эфире — часы карты 1 идут вперёд от 24:15
  const КАРТА0 = 24 * 60 + 15, мс = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const чм = (s) => (s <= 0 ? '0:00' : `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}`)
  const текст = (что) => (что === 'map' ? мс(КАРТА0 + прошло()) : что === 'hm' ? чм(СТАРТ - прошло()) : чмс((что === 'lock' ? ЗАКР : СТАРТ) - прошло()))
  const часы = (что) => `<b data-clk="${что}">${текст(что)}</b>`
  setInterval(() => document.querySelectorAll('[data-clk]').forEach((e) => { e.textContent = текст(e.dataset.clk) }), 1000)

  // ——— Коэффициенты: условные букмекеры, П1 / П2 на серию; открытие линии 1.80 / 2.00 ———
  // Две линии: до матча (от открытия) и в эфире (с начала карты 1 — Spirit ведут, коэффициент на них падает)
  const ЛИНИЯ = {
    pre: { бк: [['Букмекер A', 1.62, 2.30], ['Букмекер B', 1.65, 2.24], ['Букмекер C', 1.60, 2.34]], ход: [1.80, 1.78, 1.74, 1.70, 1.71, 1.66, 1.64, 1.65], откр: [1.80, 2.00],
      модель: 64, мин: 1.5, макс: 1.9, h: 'Коэффициенты на серию', под: '3 букмекера · лучший — зелёным · обновлено минуту назад', от: 'Открытие · 1.80', когда: '3 дня назад', с: 'С открытия', сv: '−0.15', зр: 58 },
    live: { бк: [['Букмекер A', 1.36, 3.05], ['Букмекер B', 1.38, 2.98], ['Букмекер C', 1.35, 3.10]], ход: [1.65, 1.66, 1.62, 1.55, 1.52, 1.47, 1.41, 1.38], откр: [1.65, 2.34],
      модель: 72, мин: 1.3, макс: 1.7, h: 'Коэффициенты в эфире', под: 'карта 1 · 24-я минута · меняются каждую минуту', от: 'До старта · 1.65', когда: 'начало карты 1', с: 'С начала матча', сv: '−0.27', зр: 66 },
  }
  const лучш = (L) => [Math.max(...L.бк.map((r) => r[1])), Math.max(...L.бк.map((r) => r[2]))]
  const рынок = (L) => { const [a, b] = лучш(L); return Math.round((100 / a) / (1 / a + 1 / b)) }
  const ценность = (L) => Math.round((L.модель / 100 * лучш(L)[0] - 1) * 1000) / 10
  const ЛУЧШ = лучш(ЛИНИЯ.pre), МОДЕЛЬ = ЛИНИЯ.pre.модель
  const РЫНКИ = [['Фора Spirit −1.5', '2.60', 'Tundra +1.5', '1.48'], ['Тотал карт больше 2.5', '2.05', 'Меньше 2.5', '1.75'], ['Первая кровь, карта 1 · Spirit', '1.80', 'Tundra', '1.95']]
  const к2 = (v) => v.toFixed(2)

  // ——— Подсчёты по тому, что сделано ———
  const вСоставе = () => ST.slots.filter(Boolean).length
  const прогнозОчков = () => ST.slots.reduce((s, id) => s + (id ? п(id).очки * (id === ST.cap ? 1.5 : 1) : 0), 0)
  const итогОчков = () => ST.slots.reduce((s, id) => s + (id ? п(id).итог * (id === ST.cap ? 1.5 : 1) : 0), 0)
  const ответов = () => [ST.win, ST.sc, ST.fb].filter(Boolean).length
  const прогнозГотов = () => ответов() === 3
  const ЦЕЛИ = () => {
    const состав = ST.savedF && вСоставе() === 5, кап = ST.cap ? п(ST.cap).итог * 1.5 : 0
    return [
      ['50', 'Собрать пятёрку из игроков матча', '50 монет', состав, состав, 'f', 'Собрать пятёрку'],
      ['100', 'Сделать прогноз на матч', '100 монет', ST.savedP, ST.savedP, 'p', 'Сделать прогноз'],
      ['20', 'Сравнить коэффициенты букмекеров', '20 монет', ST.seenOdds, ST.seenOdds, 'p', 'Открыть коэффициенты'],
      ['card', 'Капитан наберёт 15+ очков', 'Карта Yatoro · Holo', false, состав && кап >= 15, 'f', 'Выбрать капитана'],
    ] // [значок, условие, приз, выполнено до матча, выполнено по итогу, куда ведёт, кнопка]
  }
  const угадано = () => (ST.savedP ? [['win', ST.win === ИТОГ.win, 100], ['sc', ST.win === ИТОГ.win && ST.sc === ИТОГ.sc, 150], ['fb', ST.fb === ИТОГ.fb, 50]] : [])

  // ——— Плитка: один размер и стиль для всех (как карты в match-after v6) ———
  // доп: { cls — свой класс (st-tile--hero у наград), prog — [сделано, всего] полоской из шагов }
  const плитка = (id, tc, t, sub, em, низ, ok = false, доп = {}) => `<button type="button" class="a-map st-tile ${ok ? 'is-ok' : ''} ${доп.cls || ''}" data-tab="${id}" aria-selected="${открыта() === id}" style="--tc:${tc}">
    <span><b>${t}</b><small>${sub}</small>${ok ? '<i class="st-ok">✓</i>' : ''}</span><em>${em}</em>${доп.prog ? `<span class="st-prog">${Array.from({ length: доп.prog[1] }, (_, i) => `<i class="${i < доп.prog[0] ? 'is-on' : ''}"></i>`).join('')}</span>` : ''}<span class="a-map__w">${низ}</span></button>`
  const панели = (пары) => пары.map(([id, html]) => `<div data-pane="${id}"${открыта() === id ? '' : ' hidden'}>${html}</div>`).join('')
  const ЦВ = { f: 'var(--c-accent)', p: 'var(--c-stat-mid)', odds: 'var(--c-stat-high)', r: 'var(--c-coin)', tv: 'var(--c-live)', m: 'var(--c-text)' }
  const таймеры = `<div class="st-clocks"><div class="mf-clock"><small>Матч начнётся через</small>${часы('start')}</div><div class="mf-clock is-warn"><small>Состав и прогнозы закроются через</small>${часы('lock')}</div></div>`
  const сохрФ = () => ST.savedF && вСоставе() === 5

  // ——— Коэффициенты — кусочки, из них собирается нижняя часть плитки «Прогнозы» ———
  const таблицаКоэф = (m, x, L) => { const Л = лучш(L)
    const ряд = (n, a, b) => `<tr><td>${n}</td><td><button type="button" class="st-odd ${a === Л[0] ? 'is-best' : ''} ${ST.bet === n + 'a' ? 'is-on' : ''}" data-sa="bet" data-v="${n}a">${к2(a)}${a < L.откр[0] ? '<i class="dn">▼</i>' : ''}</button></td><td><button type="button" class="st-odd ${b === Л[1] ? 'is-best' : ''} ${ST.bet === n + 'b' ? 'is-on' : ''}" data-sa="bet" data-v="${n}b">${к2(b)}${b > L.откр[1] ? '<i class="up">▲</i>' : ''}</button></td></tr>`
    return `<table class="st-tab"><thead><tr><th>Победа в серии</th><th>${x.лого(m.a, 'sm')} ${x.имя(m.a)}</th><th>${x.имя(m.b)} ${x.лого(m.b, 'sm')}</th></tr></thead><tbody>${L.бк.map(([n, a, b]) => ряд(n, a, b)).join('')}</tbody></table>` }
  const линияКоэф = (m, x, L) => { const W = 600, H = 120, xy = L.ход.map((v, i) => [Math.round((i / (L.ход.length - 1)) * W), Math.round(H - ((v - L.мин) / (L.макс - L.мин)) * H)])
    return `<div class="st-line"><p class="st-sub"><b>Движение линии · ${x.имя(m.a)}</b><small>от ${L === ЛИНИЯ.pre ? 'открытия' : 'начала карты 1'} до сейчас</small></p>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${xy.map((p) => p.join(',')).join(' ')}" /><circle cx="${xy.at(-1)[0]}" cy="${xy.at(-1)[1]}" r="5" /></svg>
      <p class="st-line__l"><span>${L.от}</span><span>${L.когда}</span><span>Сейчас · ${к2(L.ход.at(-1))}</span></p></div>` }
  const рынкиКоэф = () => `<div><p class="st-sub"><b>Другие рынки</b><small>нажми — отметится</small></p>
    <div class="st-mk">${РЫНКИ.map(([a, ka, b, kb], i) => `<p><button type="button" class="${ST.bet === 'm' + i + 'a' ? 'is-on' : ''}" data-sa="bet" data-v="m${i}a"><span>${a}</span><b>${ka}</b></button><button type="button" class="${ST.bet === 'm' + i + 'b' ? 'is-on' : ''}" data-sa="bet" data-v="m${i}b"><span>${b}</span><b>${kb}</b></button></p>`).join('')}</div></div>`
  const модельКоэф = (L) => { const Л = лучш(L), МОД = L.модель, РЫН = рынок(L), ЦЕН = ценность(L)
    return `<div class="st-card"><small>Модель против рынка</small>
      <div class="st-vs"><p><span>Модель</span><i><b style="width:${МОД}%"></b></i><em>${МОД}%</em></p><p class="is-mk"><span>Рынок</span><i><b style="width:${РЫН}%"></b></i><em>${РЫН}%</em></p></div>
      <p class="st-val ${ЦЕН < 0 ? 'is-neg' : ''}">Ценность ставки на ${КОР.ts}<b>${ЦЕН > 0 ? '+' : ''}${ЦЕН}%</b></p><p class="st-note">${ЦЕН < 0 ? 'Линия уже ниже честной — ставить на Spirit сейчас невыгодно. ' : ''}Коэффициенты условные, без брендов. 18+</p></div>` }
  const блокКоэф = (m, x, L, h, под) => `<div class="st-odds"><div class="v6-map__h"><b>${h}</b><small>${под}</small></div>${таблицаКоэф(m, x, L)}${линияКоэф(m, x, L)}${L === ЛИНИЯ.pre ? рынкиКоэф() : ''}</div>`

  // ——— НАГРАДЫ — вход во всё остальное, одна панель на три состояния: меняются только статусы целей ———
  const ДРУГОЕ = { f: 'Фэнтези', p: 'Прогнозы', m: 'Статистика' }
  const панельНаграды = (m, x) => {
    const ц = ЦЕЛИ(), кап = ST.cap && сохрФ() ? живые(ST.cap) : 0
    const статус = ([ic, t, , доМатча, итог], i) => {
      if (ST.st === 'pre') return доМатча ? '<em>✓ Выполнено</em>' : ic === 'card' ? '<em class="is-wait">Узнаем после матча</em>' : ''
      if (ST.st === 'live') {
        if (ic === 'card') return сохрФ() ? `<em class="is-wait">${п(ST.cap).ник}: ${кап.toFixed(1)} из 15 очков</em><span class="st-bar" style="--p:${Math.min(100, (кап / 15) * 100)}%"></span>` : '<em class="is-bad">✗ состав не сохранили</em>'
        return доМатча ? `<em>✓ Выполнено${ic === '100' ? ' · очки — после матча' : ''}</em>` : '<em class="is-bad">✗ закрыто на старте</em>'
      }
      return итог ? '<em>✓ Получено</em>' : '<em class="is-bad">✗ Не получено</em>'
    }
    const кнопка = ([ic, , , доМатча, , куда, текст]) => ST.st === 'pre' && !доМатча ? `<button type="button" class="st-go" data-open="${куда}">${текст} ›</button>` : `<button type="button" class="st-go is-quiet" data-open="${куда}">${ДРУГОЕ[куда]} ›</button>`
    const сделано = (c) => (ST.st === 'post' ? c[4] : c[3])
    const готово = ц.filter(сделано).length, o = живыеОчки()
    const заголовок = { pre: ['Награды за матч · бесплатно', 'начни отсюда — каждая кнопка ведёт в свою часть страницы'], live: ['Награды · матч идёт', сохрФ() ? 'очки пятёрки копятся каждую минуту' : 'состав не сохранили до 16:50 — очки в лигу не идут'], post: ['Награды · что ты собрал и угадал', 'монеты пришли сразу, карта — по итогу матча'] }[ST.st]
    const большая = ST.st === 'live'
      ? `<div class="st-card st-big st-big--coin"><small>Пятёрка в эфире</small><b>${o ? '+' + o.toFixed(1) : '0'}</b><span>${o ? 'Лига друзей: держишься на 3-м' : 'в следующий раз — состав до старта'}</span></div>`
      : `<div class="st-card st-big st-big--coin"><small>${ST.st === 'pre' ? 'Выполнено' : 'Получено за матч'}</small><b>${готово}<small> из ${ц.length}</small></b><span>${готово === ц.length ? 'всё собрано' : 'до 170 монет и карта Yatoro · Holo'}</span></div>`
    return `<section class="v6-map st-panel st-panel--hero" style="--tc:${ЦВ.r}">
      <div class="st-main">
        <div class="v6-map__h"><b>${заголовок[0]}</b><small>${заголовок[1]}</small></div>
        <div class="st-rw">${ц.map((c, i) => `<div class="${сделано(c) ? 'is-done' : ''}">${c[0] === 'card' ? `<span class="mf-card">${карта('yatoro', 84)}</span>` : `<span class="st-rw__ic">+${c[0]}</span>`}<span><b>${c[1]}</b><small>${c[2]}</small>${статус(c, i)}${кнопка(c)}</span></div>`).join('')}</div>
        <ol class="st-road">${ц.map((c, i) => `<li class="${сделано(c) ? 'is-done' : ''}"><i>${сделано(c) ? '✓' : i + 1}</i><span>${c[1]}</span></li>`).join('')}</ol>
      </div>
      <aside class="v6-side">${большая}${ST.st === 'pre' ? `<div class="st-card">${таймеры}</div>` : ''}
        <p class="st-note">${ST.st === 'pre' ? 'Монеты за состав, прогноз и коэффициенты приходят сразу, карта — по итогу матча.' : 'Подробности — в плитках Фэнтези и Прогнозы.'}</p></aside></section>`
  }
  const плиткаНаград = () => {
    const ц = ЦЕЛИ(), n = ц.length
    if (ST.st === 'pre') { const г = ц.filter((c) => c[3]).length, след = ц.find((c) => !c[3])
      return плитка('r', ЦВ.r, 'Награды', 'за этот матч, бесплатно', `<span class="w">${г}</span> / ${n}`, след ? `дальше: ${след[6].toLowerCase()}` : 'всё собрано · карта — по итогу', г === n, { cls: 'st-tile--hero', prog: [г, n] }) }
    if (ST.st === 'live') { const г = ц.filter((c) => c[3]).length
      return плитка('r', ЦВ.r, 'Награды', 'в эфире', `<span class="w">${г}</span> / ${n}`, сохрФ() ? `карта Yatoro — капитан набирает` : 'состав не сохранили', false, { cls: 'st-tile--hero', prog: [г, n] }) }
    const пол = ц.filter((c) => c[4]).length
    return плитка('r', ЦВ.r, 'Награды', 'что ты получил', `<span class="w">${пол}</span> / ${n}`, `получено наград ${пол} из ${n}`, пол === n, { cls: 'st-tile--hero', prog: [пол, n] })
  }

  // ——— ФЭНТЕЗИ: до — сборка, в эфире — очки копятся по игрокам, после — итог по игрокам ———
  const панельФэнтезиДо = (m, x) => {
    const в = вСоставе()
    const слот = (i) => { const id = ST.slots[i]
      if (!id) return `<div class="st-slot is-empty"><span class="st-slot__pos">P${i + 1}<em> · ${РОЛЬ[i + 1]}</em></span><span class="st-slot__ph">${i + 1}</span></div>`
      return `<div class="st-slot"><span class="st-slot__pos">P${i + 1}<em> · ${РОЛЬ[i + 1]}</em></span><span class="mf-card" data-sa="pick" data-v="${id}">${id === ST.cap ? '<span class="mf-cap-mark">×1.5</span>' : ''}${карта(id, 104)}</span><button class="st-cap" type="button" data-sa="cap" data-v="${id}" aria-pressed="${id === ST.cap}">${id === ST.cap ? 'Капитан' : '<em>Сделать капитаном</em><i>×1.5</i>'}</button></div>` }
    const ряд = (k) => `<div class="st-pool__r"><p>${x.лого(k)}${x.имя(k)}</p>${Object.keys(ИГРОКИ).filter((id) => п(id).к === k).map((id) => { const pl = п(id), on = ST.slots.includes(id)
      return `<button class="st-pick ${on ? 'is-on' : ''}" type="button" data-sa="pick" data-v="${id}" ${pl.есть ? '' : 'disabled'}><span class="mf-card">${on ? '<span class="mf-mine">✓</span>' : ''}${карта(id, 80)}</span><small>${pl.есть ? `прогноз <b>${pl.очки.toFixed(1)}</b>` : 'нет карты'}</small></button>` }).join('')}</div>`
    return `<section class="v6-map st-panel" style="--tc:${ЦВ.f}">
      <div class="st-main">
        <div class="v6-map__h"><b>Фэнтези на матч · пятёрка из игроков этого матча</b><small>клик по игроку — в свой слот, капитан даёт ×1.5</small></div>
        <div class="st-slots">${[0, 1, 2, 3, 4].map(слот).join('')}</div>
        <div class="st-pool">${ряд('ts')}${ряд('tun')}</div>
      </div>
      <aside class="v6-side">
        <div class="st-card">${таймеры}</div>
        <dl class="v6-kv"><div><dt>В составе</dt><dd>${в}<small>из 5</small></dd></div><div><dt>Прогноз очков</dt><dd>${прогнозОчков().toFixed(1)}</dd></div><div><dt>Капитан</dt><dd class="st-dd-s">${ST.cap ? п(ST.cap).ник : '—'}</dd></div><div><dt>Лига друзей</dt><dd>3<small>-е место</small></dd></div></dl>
        <button class="mf-btn mf-btn--main mf-btn--lg st-wide" type="button" data-sa="saveF" ${в === 5 && !ST.savedF ? '' : 'disabled'}>${сохрФ() ? '✓ Состав сохранён' : в === 5 ? 'Сохранить состав' : `Ещё ${5 - в} в состав`}</button>
        <p class="st-note">Без своей карты игрока выбрать нельзя — bzm и Saksa пока не в коллекции.</p>
      </aside></section>`
  }
  const панельФэнтезиИдёт = (m, x) => {
    const жив = ST.st === 'live', сохр = сохрФ(), очки = жив ? живыеОчки() : (сохр ? итогОчков() : 0), набрала = итогОчков()
    const пятёрка = [0, 1, 2, 3, 4].map((i) => { const id = ST.slots[i]
      if (!id) return `<div class="st-slot is-empty"><span class="st-slot__pos">P${i + 1}</span><span class="st-slot__ph">—</span><small class="st-pts">не выбран</small></div>`
      const pl = п(id), o = жив ? живые(id) : pl.итог * (id === ST.cap ? 1.5 : 1)
      return `<div class="st-slot"><span class="st-slot__pos">P${i + 1}<em> · ${РОЛЬ[i + 1]}</em></span><span class="mf-card">${id === ST.cap ? '<span class="mf-cap-mark">×1.5</span>' : ''}${карта(id, 96)}</span><small class="st-pts">${сохр ? `<b>+${o.toFixed(1)}</b> · ${жив ? 'в эфире' : 'прогноз был ' + (pl.очки * (id === ST.cap ? 1.5 : 1)).toFixed(1)}` : 'не в лиге'}</small></div>` }).join('')
    const под = жив ? (сохр ? 'очки обновляются каждую минуту карты' : 'состав не сохранили до 16:50 — очки в лигу не идут') : (сохр ? 'состав был сохранён до 16:50' : 'состав не сохранили до закрытия — очки не идут в лигу')
    return `<section class="v6-map st-panel" style="--tc:${ЦВ.f}">
      <div class="st-main">
        <div class="v6-map__h"><b>Фэнтези · ${жив ? 'пятёрка в эфире' : 'итог пятёрки'}</b><small>${под}</small></div>
        <div class="st-slots">${пятёрка}</div>
      </div>
      <aside class="v6-side">
        <div class="st-card st-big"><small>${жив ? 'Пятёрка в эфире' : 'Очки фэнтези за матч'}</small><b class="${очки ? 'up' : ''}">${очки ? '+' + очки.toFixed(1) : '0'}</b><span>${сохр ? (жив ? 'Лига друзей: 3-е · до 2-го 4.6' : 'Лига друзей: 3-е → 2-е место') : набрала ? `пятёрка набрала бы +${набрала.toFixed(1)}` : 'состав не собран'}</span></div>
        <dl class="v6-kv"><div><dt>Капитан</dt><dd class="st-dd-s">${ST.cap ? п(ST.cap).ник : '—'}</dd></div><div><dt>${жив ? 'Карта' : 'Карт сыграно'}</dt><dd>${жив ? '1<small>из 3</small>' : '3'}</dd></div></dl>
      </aside></section>`
  }
  const плиткаФэнтези = () => {
    const в = вСоставе(), сохр = сохрФ()
    if (ST.st === 'pre') return плитка('f', ЦВ.f, 'Фэнтези', 'пятёрка из игроков матча', `<span class="w">${в}</span> / 5`, сохр ? `состав сохранён · капитан ${п(ST.cap).ник}` : `в составе · закроется через&nbsp;${часы('lock')}`, сохр)
    if (ST.st === 'live') { const o = живыеОчки(); return плитка('f', ЦВ.f, 'Фэнтези', 'очки в эфире', `<span class="w">${o ? '+' + o.toFixed(1) : '0'}</span>`, сохр ? `пятёрка · капитан ${п(ST.cap).ник} ×1.5` : 'состав не сохранили') }
    const o = сохр ? итогОчков() : 0
    return плитка('f', ЦВ.f, 'Фэнтези', 'итог пятёрки', `<span class="w">${o ? '+' + o.toFixed(1) : '0'}</span>`, сохр ? 'лига друзей: 3-е → 2-е' : 'не в лиге', !!o)
  }

  // ——— ПРОГНОЗЫ (вместе с коэффициентами): сверху твой прогноз, ниже линия букмекеров и модель ———
  const ВОПРОС = { win: 'Кто выиграет серию', sc: 'Счёт серии', fb: 'Первая кровь на карте 1' }
  const ответ = (k) => ({ win: КОР[ST.win], sc: ST.sc ? `${КОР[ST.win]} ${ST.sc.replace(':', ' : ')}` : '—', fb: КОР[ST.fb] })[k]
  const панельПрогнозы = (m, x) => {
    const опц = (k, v, html, em) => `<button class="st-opt ${ST[k] === v ? 'is-on' : ''}" type="button" data-sa="q" data-k="${k}" data-v="${v}"><span>${html}</span><em>${em}</em></button>`
    const сч = ST.win === 'tun' ? [['2:0', 'Tundra 2 : 0'], ['2:1', 'Tundra 2 : 1']] : [['2:0', 'Spirit 2 : 0'], ['2:1', 'Spirit 2 : 1']]
    const уг = угадано(), плюсП = ST.st === 'post' ? уг.filter((u) => u[1]).reduce((s, u) => s + u[2], 0) : 0
    let верх, h, под
    if (ST.st === 'pre') {
      h = 'Прогноз на матч · три вопроса'; под = 'до 300 очков в таблице турнира · проценты — как голосуют зрители'
      верх = `<div class="st-qs">
        <div class="st-q"><b>${ВОПРОС.win}</b><small>+100 очков</small><div class="st-opts">${опц('win', 'ts', x.лого('ts', 'sm') + x.имя('ts'), '58%')}${опц('win', 'tun', x.лого('tun', 'sm') + x.имя('tun'), '42%')}</div></div>
        <div class="st-q"><b>${ВОПРОС.sc}</b><small>+150 очков${ST.win ? '' : ' · сначала победитель'}</small><div class="st-opts">${ST.win ? сч.map(([v, t]) => опц('sc', v, t, v === '2:1' ? '41%' : '22%')).join('') : '<p class="st-note">—</p>'}</div></div>
        <div class="st-q"><b>${ВОПРОС.fb}</b><small>+50 очков</small><div class="st-opts">${опц('fb', 'ts', x.лого('ts', 'sm') + КОР.ts, '55%')}${опц('fb', 'tun', x.лого('tun', 'sm') + КОР.tun, '45%')}</div></div></div>`
    } else if (ST.st === 'live') {
      h = 'Прогноз закрыт на старте'; под = ST.savedP ? 'первая кровь уже решилась, победитель и счёт — после серии' : 'прогноз не сделан — в следующий раз до начала матча'
      const ход = { win: ST.win === 'ts' ? ['is-ok', 'пока сходится · Spirit ведут карту 1'] : ['is-bad', 'пока против тебя · Spirit ведут карту 1'], sc: ['', 'решится после карты 2'], fb: ST.fb === ИТОГ.fb ? ['is-ok', '✓ +50 · Crystallis, 6-я минута'] : ['is-bad', '✗ мимо · Crystallis, 6-я минута'] }
      верх = ST.savedP ? `<div class="st-res3">${['win', 'sc', 'fb'].map((k) => `<p class="${ход[k][0]}"><span><small>${ВОПРОС[k]}</small><b>${ответ(k)}</b></span><em>${ход[k][1]}</em></p>`).join('')}</div>` : '<p class="st-note">Три вопроса закрылись в 16:50. Голоса зрителей: Spirit 58% · счёт 2 : 1 — 41% · первая кровь Spirit 55%.</p>'
    } else {
      h = 'Прогноз · что угадал'; под = ST.savedP ? `сравнили с результатом · +${плюсП} очков` : 'прогноз не сделан'
      верх = ST.savedP ? `<div class="st-res3">${уг.map(([k, ok, o]) => `<p class="${ok ? 'is-ok' : 'is-bad'}"><span><small>${ВОПРОС[k]}</small><b>${ответ(k)}</b></span><em>${ok ? `✓ +${o}` : '✗ мимо'}</em></p>`).join('')}</div>` : '<p class="st-note">В следующий раз — три вопроса до начала матча, до 300 очков.</p>'
    }
    // Нижняя часть — букмекеры: до — линия и рынки, в эфире — live-линия, после — закрытие линии и чем кончилось
    const ЗАШЛО = { a: true, b: false, m0a: false, m0b: true, m1a: true, m1b: false, m2a: false, m2b: true }
    const низ = ST.st === 'pre' ? блокКоэф(m, x, ЛИНИЯ.pre, 'Коэффициенты на серию', '3 букмекера · лучший — зелёным · обновлено минуту назад')
      : ST.st === 'live' ? блокКоэф(m, x, ЛИНИЯ.live, 'Коэффициенты в эфире', 'карта 1 · 24-я минута · меняются каждую минуту')
      : `<div class="st-odds"><div class="v6-map__h"><b>Закрытие линии · итог Spirit 2 : 1</b><small>как закрылись коэффициенты на старте и что зашло</small></div>
        <div class="st-mk st-mk--res">${[['Победа Spirit', к2(ЛУЧШ[0]), 'a'], ['Победа Tundra', к2(ЛУЧШ[1]), 'b'], ...РЫНКИ.flatMap(([a, ka, b, kb], i) => [[a, ka, 'm' + i + 'a'], [b, kb, 'm' + i + 'b']])].map(([t, k, id]) => { const ok = ЗАШЛО[id], моя = !!ST.bet && (ST.bet === id || (id.length === 1 && ST.bet.startsWith('Букмекер') && ST.bet.endsWith(id)))
          return `<p class="${ok ? 'is-ok' : 'is-bad'} ${моя ? 'is-mine' : ''}"><span>${t}${моя ? ' · твоя отметка' : ''}</span><b>${k}</b><em>${ok ? '✓ зашло' : '✗'}</em></p>` }).join('')}</div></div>`
    const L = ST.st === 'live' ? ЛИНИЯ.live : ЛИНИЯ.pre
    const сбоку = ST.st === 'post'
      ? `<div class="st-card st-big"><small>Модель была права</small><b class="up">✓</b><span>давала Spirit ${МОДЕЛЬ}% при рынке ${рынок(ЛИНИЯ.pre)}% · ценность была +${ценность(ЛИНИЯ.pre)}%</span></div>`
      : модельКоэф(L)
    return `<section class="v6-map st-panel" style="--tc:${ЦВ.p}">
      <div class="st-main">
        <div class="v6-map__h"><b>${h}</b><small>${под}</small></div>
        ${верх}
        ${низ}
      </div>
      <aside class="v6-side">
        ${ST.st === 'pre' ? `<button class="mf-btn mf-btn--main mf-btn--lg st-wide" type="button" data-sa="saveP" ${прогнозГотов() && !ST.savedP ? '' : 'disabled'}>${ST.savedP ? '✓ Прогноз сохранён' : прогнозГотов() ? 'Сохранить прогноз' : 'Ответь на 3 вопроса'}</button>` : ''}
        <div class="st-card"><small>Очки прогнозов турнира · друзья</small><div class="mf-board">${ДРУЗЬЯ.map(([n, o, я]) => [n, o + (я ? плюсП : 0), я]).sort((a, b) => b[1] - a[1]).map(([n, o, я], i) => `<p class="${я ? 'is-me' : ''}"><i>${i + 1}</i><span class="mf-ini">${n[0]}</span><span>${n}</span><b>${o.toLocaleString('ru-RU')}</b><em></em></p>`).join('')}</div></div>
        ${сбоку}
        <dl class="v6-kv"><div><dt>Лучший П1</dt><dd>${к2(лучш(L)[0])}</dd></div><div><dt>Лучший П2</dt><dd>${к2(лучш(L)[1])}</dd></div></dl>
      </aside></section>`
  }
  const плиткаПрогнозы = () => {
    const Л = лучш(ST.st === 'live' ? ЛИНИЯ.live : ЛИНИЯ.pre)
    if (ST.st === 'pre') return плитка('p', ЦВ.p, 'Прогнозы', 'и коэффициенты', `<span class="w">${ответов()}</span> / 3`, ST.savedP ? `${КОР[ST.win]} ${ST.sc.replace(':', ' : ')} · линия ${к2(Л[0])} : ${к2(Л[1])}` : `до +300 очков · линия ${к2(Л[0])} : ${к2(Л[1])}`, ST.savedP)
    if (ST.st === 'live') return плитка('p', ЦВ.p, 'Прогнозы', 'закрыты · линия в эфире', `<span class="w">${к2(Л[0])}</span> : <span>${к2(Л[1])}</span>`, ST.savedP ? `первая кровь — ${ST.fb === ИТОГ.fb ? '✓ угадал' : '✗ мимо'}` : 'прогноз не сделан')
    const уг = угадано().filter((u) => u[1]).length
    return плитка('p', ЦВ.p, 'Прогнозы', 'и закрытие линии', `<span class="w">${уг}</span> / 3`, ST.savedP ? `угадано · модель была права` : 'прогноз не сделан · модель была права', уг > 0)
  }

  // ——— СТАТИСТИКА: карты серии живут внутри плитки — свой маленький переключатель «Карта 1 · 2 · 3» ———
  const раунды = (s) => { let d = 0; return [0, ...[...s].map((c) => (d += c === 'A' ? 1 : -1))] }
  let нг = 0
  // Крупный график карты: линия разницы, события значками прямо на линии, подпись по наведению или нажатию (из match-after v6)
  const график = (m, x, i, к = m.карты[i]) => {
    const cs = m.g === 'cs', d = cs ? раунды(к.р) : к.ход, n = d.length - 1, мин = parseInt(к.длит)
    const W = 1000, H = 360, mid = H / 2, max = Math.max(...d.map(Math.abs), cs ? 4 : 10) * 1.18
    const X = (j) => (j / n) * W, Y = (v) => mid - (v / max) * (mid - 24)
    const линия = d.map((v, j) => `${j ? 'L' : 'M'}${X(j).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')
    const area = `${линия} L${W} ${mid} L0 ${mid} Z`, id = `st${m.g}${i}n${++нг}`
    const на = (j) => { const a = Math.floor(j), b = Math.min(n, a + 1), t = j - a; return d[a] + (d[b] - d[a]) * t }
    const точки = к.соб.map(([t, тип, k, s]) => {
      const j = Math.min(n, cs ? t : (t / мин) * n), v = на(j), left = (j / n) * 100, top = (Y(v) / H) * 100
      const кл = `${left < 18 ? 'is-l' : left > 82 ? 'is-r' : ''} ${top < 28 ? 'is-low' : ''}`
      return `<button type="button" class="v6-pt ${кл}" data-pt style="left:${left}%;top:${top}%;--tc:${x.цвет(m, k)}" aria-label="${s}">${x.ЗНАК[тип]}<span class="v6-tip"><time>${cs ? 'Раунд ' + t : t + '-я минута'}</time>${s}</span></button>`
    }).join('')
    const ось = [0, 10, 20, 30, 40].filter((t) => t <= мин).map((t) => `<span style="left:${(t / мин) * 100}%">${t}′</span>`).join('')
    return `<figure class="v6-ch" style="--ta:${x.цвет(m, 'a')};--tb:${x.цвет(m, 'b')}">
      <div class="v6-plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs><clipPath id="${id}t"><rect x="0" y="0" width="${W}" height="${mid}" /></clipPath><clipPath id="${id}b"><rect x="0" y="${mid}" width="${W}" height="${mid}" /></clipPath>
        <linearGradient id="${id}ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ta)" stop-opacity=".5" /><stop offset="1" stop-color="var(--ta)" stop-opacity="0" /></linearGradient>
        <linearGradient id="${id}gb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--tb)" stop-opacity=".5" /><stop offset="1" stop-color="var(--tb)" stop-opacity="0" /></linearGradient></defs>
        <line x1="0" y1="${mid}" x2="${W}" y2="${mid}" class="a-chart__0" />
        <path d="${area}" fill="url(#${id}ga)" clip-path="url(#${id}t)" /><path d="${area}" fill="url(#${id}gb)" clip-path="url(#${id}b)" />
        <path d="${линия}" class="a-chart__l a-chart__l--a" clip-path="url(#${id}t)" style="stroke-width:3" /><path d="${линия}" class="a-chart__l a-chart__l--b" clip-path="url(#${id}b)" style="stroke-width:3" />
      </svg>${точки}</div>
      <div class="v6-ax">${ось}</div>
      <figcaption><span>${x.лого(m.a, 'sm')}${x.имя(m.a)} впереди</span><span>разница нетворса, тыс. золота</span><span>${x.имя(m.b)} впереди${x.лого(m.b, 'sm')}</span></figcaption></figure>`
  }
  const цифры = (m, x, к) => {
    const d = к.ход, сколько = (тип, k) => к.соб.filter((e) => e[1] === тип && e[2] === k).length
    const пик = d.reduce((a, v) => (Math.abs(v) > Math.abs(a) ? v : a), 0)
    return [['Убийства', `${к.сч[0]} : ${к.сч[1]}`], ['Длительность', к.длит], ['Макс. отрыв', `${Math.abs(пик).toFixed(1)}<small>тыс. · ${x.имя(m[пик >= 0 ? 'a' : 'b']).split(' ')[0]}</small>`], ['Рошаны', `${сколько('rosh', 'a')} : ${сколько('rosh', 'b')}`]]
  }
  // В эфире: карта 1 — тот же график, обрезан на 24-й минуте; перевес +4.2 тыс. у Spirit, как на странице матча сайта
  const картаЖив = (m) => { const к = m.карты[0]; return { ...к, ход: [0, 0.3, 0.8, 0.2, -0.6, 0.4, 1.5, 2.0, 2.4, 3.1, 3.6, 3.9, 4.2], соб: к.соб.filter((e) => e[0] <= 24 && e[1] !== 'gg'), длит: '24 мин' } }

  // Маленький переключатель карт внутри «Статистики»
  const мини = (i, tc, t, sub, em, низ, cls = '', off = false) => `<button type="button" class="a-map st-mtile ${cls}" ${off ? 'disabled' : `data-tab="k${i}"`} aria-selected="${!off && ST.map === i}" style="--tc:${tc}"><span><b>${t}</b><small>${sub}</small></span><em>${em}</em><span class="a-map__w">${низ}</span></button>`
  const картаПанель = (m, x, i) => { const к = m.карты[i], [n, , строка] = к.mvp
    return `<div class="st-mpane"><div class="st-main">
        <div class="v6-map__h"><b>${к.n} · ${x.имя(m[к.поб])} взяли ${к.сч[0]} : ${к.сч[1]}</b><small>${к.под} · ${к.длит}</small></div>
        ${график(m, x, i)}
        <p class="v6-hint">Наведи или нажми на значок на линии — что случилось. ⚔ драка · ◆ Рошан · ▲ башня · ★ конец</p>
        <div class="v6-under">${x.состав_карты(m, i)}</div></div>
      <aside class="v6-side"><div class="v6-pl" style="--tc:${x.цвет(m, к.поб)}"><small>Игрок карты</small><img src="${x.фото(n)}" alt="" /><b>${n}</b><em>${строка}</em></div>
        <dl class="v6-kv">${цифры(m, x, к).map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl></aside></div>` }
  const картаЖивПанель = (m, x) => `<div class="st-mpane"><div class="st-main">
        <div class="v6-map__h"><b>Карта 1 · идёт ${часы('map')}</b><small>Spirit — свет · убийства 18 : 12 · график растёт каждую минуту</small></div>
        <div class="st-livech">${график(m, x, 0, картаЖив(m))}<i class="st-now" aria-hidden="true"></i></div>
        <p class="v6-hint">Наведи или нажми на значок на линии — что случилось. ⚔ драка · ◆ Рошан · ▲ башня</p>
        <div class="v6-under">${x.состав_карты(m, 0)}</div></div>
      <aside class="v6-side"><div class="v6-pl" style="--tc:${x.цвет(m, 'a')}"><small>Лучший на карте сейчас</small><img src="${x.фото('Yatoro')}" alt="" /><b>Yatoro</b><em>9 / 1 / 6 · Terrorblade · 684 GPM</em></div>
        <dl class="v6-kv"><div><dt>Убийства</dt><dd>18 : 12</dd></div><div><dt>Перевес</dt><dd>+4.2<small>тыс. · Spirit</small></dd></div><div><dt>Башни</dt><dd>7 : 3</dd></div><div><dt>Рошаны</dt><dd>1 : 0</dd></div></dl></aside></div>`
  const ждём = (n, когда) => `<div class="st-mpane st-mpane--wait"><div class="st-main"><div class="v6-map__h"><b>${n} ещё не началась</b><small>${когда}</small></div>
      <p class="st-wait">Здесь появятся счёт карты, график нетворса со значками событий и игрок карты — как у карты 1.</p></div>
      <aside class="v6-side"><button type="button" class="mf-btn mf-btn--main mf-btn--lg st-wide" data-sa="remind" data-v="${n}">${ST.remind === n ? '✓ Напомним' : 'Напомнить о начале'}</button></aside></div>`
  const картыВнутри = (кнопки, панели_) => `<div data-tabs class="st-mtk"><div class="a-maps st-mtiles">${кнопки}</div>${панели_.map((html, i) => `<div data-pane="k${i}"${ST.map === i ? '' : ' hidden'}>${html}</div>`).join('')}</div>`

  const ФОРМА = { ts: 'WWLWW', tun: 'LWWLL' }
  const точки = (s) => `<span class="mf-form st-form">${[...s].map((c) => `<i class="${c === 'W' ? 'w' : 'l'}"></i>`).join('')}</span>`
  const панельМатч = (m, x) => {
    if (ST.st === 'pre') {
      const кн = m.карты.map((к, i) => мини(i, 'var(--c-ui-dim)', к.n, i === 2 ? 'если 1 : 1' : 'с началом матча', '— : —', 'карты появятся с началом', 'is-wait', true)).join('')
      return `<section class="v6-map st-panel st-match" style="--tc:${ЦВ.m}">
        <div class="st-main">
          <div class="v6-map__h"><b>Статистика · превью</b><small>${m.тур} · ${m.стадия} · ${m.bo} · победитель — в «${m.сетка.стало}»</small></div>
          <div class="a-maps st-mtiles">${кн}</div>
          <div class="st-pre">
            <div class="st-q"><b>Форма · последние 5</b>${['ts', 'tun'].map((k) => `<p class="st-fr">${x.лого(k, 'sm')}<span>${x.имя(k)}</span>${точки(ФОРМА[k])}<b>${[...ФОРМА[k]].filter((c) => c === 'W').length} из 5</b></p>`).join('')}</div>
            <div class="st-q"><b>Личные встречи · 5</b><div class="st-h2h"><i style="--p:60%"></i></div><p class="st-fr"><span>${x.имя('ts')} · 3</span><span class="r">2 · ${x.имя('tun')}</span></p><small>Последняя — 2 : 1 Spirit, 12 сентября</small></div>
            <div class="st-q"><b>Составы и пики</b><small>Составы объявят за час, пики героев — на драфте каждой карты. Карты, график и игрок карты появятся здесь с началом матча.</small></div>
          </div>
        </div>
        <aside class="v6-side">${шансДо(m, x)}<div class="st-card">${таймеры}</div></aside></section>` }
    if (ST.st === 'live') {
      const кн = мини(0, ЦВ.tv, 'Карта 1', 'идёт', '<span class="w">18</span> : 12', `<b>${часы('map')}</b> · +4.2 тыс. у Spirit`, 'st-tile--live') + мини(1, 'var(--c-ui-dim)', 'Карта 2', 'Spirit — тьма', '— : —', 'после карты 1', 'is-wait') + мини(2, 'var(--c-ui-dim)', 'Карта 3', 'если 1 : 1', '— : —', 'решающая', 'is-wait')
      return `<section class="st-panel st-match st-match--maps">${картыВнутри(кн, [картаЖивПанель(m, x), ждём('Карта 2', 'начнётся минут через 25, после карты 1'), ждём('Карта 3', 'будет, если серия станет 1 : 1')])}</section>` }
    const кн = m.карты.map((к, i) => мини(i, x.цвет(m, к.поб), к.n, к.под, `<span class="${к.поб === 'a' ? 'w' : ''}">${к.сч[0]}</span> : <span class="${к.поб === 'b' ? 'w' : ''}">${к.сч[1]}</span>`, `${x.лого(m[к.поб], 'sm')}${x.имя(m[к.поб])} · ${к.длит}`)).join('')
    return `<section class="st-panel st-match st-match--maps">${картыВнутри(кн, m.карты.map((_, i) => картаПанель(m, x, i)))}
      <div class="st-match__more">
        <div data-tabs class="st-more">${x.вкладки([['t1', 'Таблица серии · ' + x.имя(m.a)], ['t2', x.имя(m.b)]])}<div style="margin-top:14px"><div data-pane="t1">${x.таблица(m, 'a')}</div><div data-pane="t2" hidden>${x.таблица(m, 'b')}</div></div></div>
        <div class="a-g2">${x.сек('Что дальше', x.дальше(m, 0))}${x.сек('Прогнозы на следующий раунд', x.прогнозы(m))}</div>
      </div></section>`
  }
  const шансДо = (m, x) => `<div class="st-chance"><p><span>${x.лого(m.a, 'sm')}${x.имя(m.a)}</span><b>${МОДЕЛЬ}%</b><b class="l">${100 - МОДЕЛЬ}%</b><span>${x.имя(m.b)}${x.лого(m.b, 'sm')}</span></p><i style="--p:${МОДЕЛЬ}%"></i><small>шанс победы в серии по модели · рынок ${рынок(ЛИНИЯ.pre)}%</small></div>`
  const плиткаМатч = (m, x) => {
    if (ST.st === 'pre') return плитка('m', ЦВ.m, 'Статистика', `${m.bo} · превью`, `<span class="w">${часы('hm')}</span>`, 'до начала · форма, встречи, шанс')
    if (ST.st === 'live') return плитка('m', ЦВ.tv, 'Статистика', 'идёт · карта 1', `<span class="w">0 : 0</span>`, `Карта 1 · ${часы('map')} · 18 : 12`, false, { cls: 'st-tile--live' })
    const w = x.поб(m)
    return плитка('m', x.цвет(m, w), 'Статистика', 'серия · 3 карты', `<span class="${w === 'a' ? 'w' : ''}">${m.серия[0]}</span> : <span class="${w === 'b' ? 'w' : ''}">${m.серия[1]}</span>`, `${x.лого(m[w], 'sm')}${x.имя(m[w])} · ${m.длит}`)
  }

  // ——— В ЭФИРЕ: шапка матча заменяется эфиром (как страница матча сайта, state=live1) ———
  const ЖИВ = 0.45 // какая часть итоговых очков набрана к 24-й минуте карты 1
  const живые = (id) => п(id).итог * ЖИВ * (id === ST.cap ? 1.5 : 1)
  const живыеОчки = () => (сохрФ() ? ST.slots.reduce((s, id) => s + живые(id), 0) : 0)
  const ЛЕНТА = [['24:02', 'a', 'Spirit убили Рошана — Aegis у Yatoro', 'big'], ['22:40', 'a', 'Драка у реки: 3 на 1, Collapse — Reverse Polarity на троих', ''], ['21:05', 'b', 'Tundra снесли башню на центре', ''], ['19:30', 'a', 'Larl — тройное убийство', 'big'], ['16:12', 'b', 'Tundra забрали Тормент', ''], ['12:44', 'a', 'Spirit снесли первую башню', ''], ['06:10', 'b', 'Первая кровь — Crystallis', ''], ['00:00', '', 'Горн — карта 1 началась', 'sys']]
  const ПЛОЩАДКИ = ['Twitch · RU 12 тыс.', 'YouTube · EN 8 тыс.', 'Kick 2 тыс.', 'Без звука комментатора']
  const ШАНС = 64
  const шанс = (m, x) => `<div class="st-chance"><p><span>${x.лого(m.a, 'sm')}${x.имя(m.a)}</span><b>${ШАНС}%</b><b class="l">${100 - ШАНС}%</b><span>${x.имя(m.b)}${x.лого(m.b, 'sm')}</span></p><i style="--p:${ШАНС}%"></i><small>шанс победы в серии · по золоту, башням и героям</small></div>`
  const эфир = (m, x) => `<section class="v6-map st-panel st-panel--tv st-live-top" style="--tc:${ЦВ.tv}">
      <div class="st-main">
        <div class="st-tv" style="--ta:${x.цвет(m, 'a')};--tb:${x.цвет(m, 'b')}">
          <div class="st-tv__top"><span class="st-gt">Dota 2</span><b>${m.тур}</b><span>${m.стадия} · ${m.bo}</span><span class="st-pill-live"><i></i>Карта 1 · ${часы('map')}</span><span class="st-tv__v">22 тыс. смотрят</span></div>
          <button type="button" class="st-tv__play" aria-label="Смотреть">▶</button>
          <div class="st-hud"><span class="st-hud__t">${x.лого(m.a)}<b>${x.имя(m.a)}</b></span><span class="st-hud__c"><b>0 : 0</b><em>Карта 1 · ${часы('map')}</em><small>убийства 18 : 12 · +4.2 тыс. золота</small></span><span class="st-hud__t"><b>${x.имя(m.b)}</b>${x.лого(m.b)}</span></div>
          <div class="st-src">${ПЛОЩАДКИ.map((t, i) => `<button type="button" class="${ST.src === i ? 'is-on' : ''}" data-sa="src" data-v="${i}">${t}</button>`).join('')}</div>
        </div>
        <p class="st-pscore"><span>${x.лого(m.a, 'sm')}<b>${КОР[m.a] || x.имя(m.a)}</b></span><span class="st-pscore__c"><b>0 : 0</b><em>Карта 1 · ${часы('map')}</em></span><span><b>${КОР[m.b] || x.имя(m.b)}</b>${x.лого(m.b, 'sm')}</span></p>
        <dl class="st-tick">${[['Шанс победы', ШАНС + '%', `<i class="st-bar" style="--p:${ШАНС}%"></i>`], ['Перевес по золоту', '+4.2 тыс.', 'у Spirit · растёт 6 минут'], ['Башни', '7 : 3', 'за карту'], ['Рошан', 'Spirit · 24:02', 'Aegis у Yatoro'], ['Лучший', 'Yatoro', '9 / 1 / 6 · 684 GPM']].map(([t, v, s]) => `<div><dt>${t}</dt><dd>${v}</dd><small>${s}</small></div>`).join('')}</dl>
      </div>
      <aside class="v6-side st-feed ${ST.feed ? 'is-open' : ''}">
        <button type="button" class="st-feed__t" data-feed aria-expanded="${!!ST.feed}"><span>Лента «Что происходит» · ${ЛЕНТА.length}</span><i>${ST.feed ? '▴' : '▾'}</i></button>
        <p class="st-feed__h"><b>Что происходит</b><small><i class="st-dot"></i>в эфире</small></p>
        <ol class="st-log">${ЛЕНТА.map(([t, k, s, кл]) => `<li class="${кл ? 'is-' + кл : ''}"><time>${t}</time>${k ? x.лого(m[k], 'sm') : '<i class="st-log__sys"></i>'}<span>${s}</span></li>`).join('')}</ol>
        ${шанс(m, x)}
      </aside></section>`

  // ——— Шапки: до — время и отсчёт, после — счёт серии. Короткое имя (Spirit / Tundra) — для компактной шапки телефона v2–v4 ———
  const имя2 = (x, k) => `<span class="v6-nm">${x.имя(k)}</span><span class="v6-sn">${КОР[k] || x.имя(k)}</span>`
  const шапкаДо = (m, x) => `<header class="v6-top" style="--ta:${x.цвет(m, 'a')};--tb:${x.цвет(m, 'b')}">
      <div class="v6-team">${x.лого(m.a)}<span><b>${имя2(x, m.a)}</b><small>3-е в рейтинге · форма 4 из 5</small></span></div>
      <div class="v6-c"><p>${m.тур} · ${m.стадия} · ${m.bo}</p><b class="st-time">17:00</b><span class="v6-res st-res">${m.дата} · МСК · через&nbsp;${часы('start')}</span></div>
      <div class="v6-team">${x.лого(m.b)}<span><b>${имя2(x, m.b)}</b><small>8-е в рейтинге · форма 2 из 5</small></span></div></header>`
  const шапкаПосле = (m, x) => { const w = x.поб(m)
    return `<header class="v6-top" style="--ta:${x.цвет(m, 'a')};--tb:${x.цвет(m, 'b')}">
      <div class="v6-team ${w === 'a' ? '' : 'is-l'}">${x.лого(m.a)}<span><b>${имя2(x, m.a)}</b><small>${w === 'a' ? 'победа' : 'поражение'} · ${x.пипы(m.серия[0])}</small></span></div>
      <div class="v6-c"><p>${m.тур} · ${m.стадия}</p><b><span class="${w === 'a' ? '' : 'l'}">${m.серия[0]}</span><i>:</i><span class="${w === 'b' ? '' : 'l'}">${m.серия[1]}</span></b><span class="v6-res">Завершён · ${m.дата} · ${m.длит}</span></div>
      <div class="v6-team ${w === 'b' ? '' : 'is-l'}">${x.лого(m.b)}<span><b>${имя2(x, m.b)}</b><small>${w === 'b' ? 'победа' : 'поражение'} · ${x.пипы(m.серия[1])}</small></span></div></header>` }

  // ——— Телефон v2–v4: вместо плиток — сегмент, чипсы со статусом или нижние вкладки (те же data-tab, та же коробка вкладок) ———
  const ИКОНКИ = {
    m: '<path d="M4 20V11M10 20V5M16 20v-6M21 20H3" />',
    r: '<rect x="3.5" y="8" width="17" height="4.5" rx="1" /><path d="M5.5 12.5V20h13v-7.5M12 8v12M12 8C10.5 4 7 3.5 7 6s3 2 5 2Zm0 0c1.5-4 5-4.5 5-2s-3 2-5 2Z" />',
    f: '<rect x="3.5" y="6" width="10" height="14" rx="2" /><path d="M16.5 7.5 20 8.6 16.8 19.3l-3.3-1" />',
    p: '<circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".8" fill="currentColor" />',
  }
  const статусТел = (m, x) => {
    const ц = ЦЕЛИ(), n = ц.length, г = ц.filter((c) => (ST.st === 'post' ? c[4] : c[3])).length
    const Л = лучш(ST.st === 'live' ? ЛИНИЯ.live : ЛИНИЯ.pre), w = x.поб(m), очкиФ = ST.st === 'live' ? живыеОчки() : ST.st === 'post' && сохрФ() ? итогОчков() : 0
    return {
      m: ST.st === 'pre' ? `через ${часы('hm')}` : ST.st === 'live' ? `Карта 1 · ${часы('map')}` : `${m.серия[0]} : ${m.серия[1]} · ${КОР[m[w]] || x.имя(m[w])}`,
      r: `${г} / ${n}`, rг: г, rn: n,
      f: ST.st === 'pre' ? `${вСоставе()} / 5 в составе` : очкиФ ? `+${очкиФ.toFixed(1)} очков` : 'не в лиге',
      p: ST.st === 'pre' ? `${ответов()} / 3 · ${к2(Л[0])}` : ST.st === 'live' ? `линия ${к2(Л[0])} : ${к2(Л[1])}` : `${угадано().filter((u) => u[1]).length} / 3 угадано`,
    }
  }
  const навТел = (m, x) => {
    const вид = document.body.dataset.ph
    if (!вид) return ''
    const с = статусТел(m, x), откр = открыта()
    const ПУНКТЫ = [['m', 'Статистика', ST.st === 'live' ? ЦВ.tv : ЦВ.m], ['r', 'Награды', ЦВ.r], ['f', 'Фэнтези', ЦВ.f], ['p', 'Прогнозы', ЦВ.p]]
    const бейдж = `<i class="st-pn__b">${с.rг}/${с.rn}</i>`
    const пункт = ([id, t, tc]) => {
      const sel = `data-tab="${id}" aria-selected="${откр === id}" style="--tc:${tc}"`, live = id === 'm' && ST.st === 'live' ? '<i class="st-dot"></i>' : ''
      if (вид === 'seg') return `<button type="button" class="st-pn st-pn--${id}" ${sel}>${live}${t}${id === 'r' ? бейдж : ''}</button>`
      if (вид === 'chips') return `<button type="button" class="st-pn st-pn--${id}" ${sel}><b>${live}${t}</b><small>${с[id]}</small></button>`
      return `<button type="button" class="st-pn st-pn--${id}" ${sel}><svg viewBox="0 0 24 24" aria-hidden="true">${ИКОНКИ[id]}</svg><span>${t}</span>${id === 'r' ? бейдж : live}</button>`
    }
    return `<nav class="st-pnav st-pnav--${вид}" aria-label="Разделы матча"><div class="st-pnav__in">${ПУНКТЫ.map(пункт).join('')}</div></nav>`
  }

  // ——— Страница: шапка → 4 плитки на одних местах (Статистика · Награды · Фэнтези · Прогнозы и коэффициенты) → открытая плитка ———
  MA.вариант = (m, x) => {
    const шапка = ST.st === 'pre' ? шапкаДо(m, x) : ST.st === 'live' ? эфир(m, x) : шапкаПосле(m, x)
    const плитки = плиткаМатч(m, x) + плиткаНаград() + плиткаФэнтези() + плиткаПрогнозы()
    const фэнтези = ST.st === 'pre' ? панельФэнтезиДо(m, x) : панельФэнтезиИдёт(m, x)
    const нав = навТел(m, x), низом = document.body.dataset.ph === 'tabbar'
    return `${шапка}<div data-tabs class="v6-tk st-tk">${низом ? '' : нав}<div class="a-maps st-tiles" style="--n:4">${плитки}</div>${панели([['m', панельМатч(m, x)], ['r', панельНаграды(m, x)], ['f', фэнтези], ['p', панельПрогнозы(m, x)]])}${низом ? нав : ''}</div>`
  }

  // ——— Перерисовка: движок рисует по клику на кнопку игры; прокрутку телефона сохраняем ———
  let прокрутка = []
  const redraw = () => {
    прокрутка = [...document.querySelectorAll('[data-ma] .p-scroll')].map((s) => s.scrollTop)
    document.querySelector('[data-g]')?.click()
  }
  MA.после = () => {
    document.querySelectorAll('[data-ma] .p-scroll').forEach((s, i) => { if (прокрутка[i]) s.scrollTop = прокрутка[i] })
    document.querySelectorAll('[data-st]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.st === ST.st))
    document.querySelectorAll('[data-demo]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.demo === ST.demo))
    tilt()
  }

  // Наклон и блик мини-карт — как app.js сайта [Карточка: наклон и блик]
  const tilt = () => document.querySelectorAll('.kc[data-tilt]:not([data-t])').forEach((card) => {
    card.dataset.t = ''
    card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`); card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      card.style.setProperty('--dx', (px - 0.5).toFixed(3)); card.style.setProperty('--dy', (py - 0.5).toFixed(3)); card.classList.add('is-on') })
    card.addEventListener('pointerleave', () => { card.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach((v) => card.style.removeProperty(v)) })
  })

  // ——— Действия ———
  const ДЕЙСТВИЯ = {
    pick: (el) => { const id = el.dataset.v, i = п(id).pos - 1; ST.slots[i] = ST.slots[i] === id ? null : id; if (ST.cap && !ST.slots.includes(ST.cap)) ST.cap = null; ST.savedF = false },
    cap: (el) => { ST.cap = ST.cap === el.dataset.v ? null : el.dataset.v; ST.savedF = false },
    saveF: () => { ST.savedF = true },
    q: (el) => { ST[el.dataset.k] = el.dataset.v; if (el.dataset.k === 'win') ST.sc = null; ST.savedP = false },
    saveP: () => { ST.savedP = true },
    bet: (el) => { ST.bet = ST.bet === el.dataset.v ? null : el.dataset.v },
    src: (el) => { ST.src = +el.dataset.v },
    remind: (el) => { ST.remind = ST.remind === el.dataset.v ? null : el.dataset.v },
  }
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-st]')
    if (s) { ST.st = s.dataset.st; redraw(); return }
    if (e.target.closest('[data-feed]')) { ST.feed = !ST.feed; redraw(); return }
    const d = e.target.closest('[data-demo]')
    if (d) { ST.demo = d.dataset.demo; Object.assign(ST, structuredClone(ПРИМЕРЫ[d.dataset.demo])); redraw(); return }
    // Плитка ряда: запоминаем выбор — он сохранится при переключении состояния (вкладки переключает движок)
    const t = e.target.closest('[data-tab]')
    if (t && t.closest('.st-pnav')) { const sc = t.closest('.p-scroll'), tk = t.closest('.st-tk'); if (sc && tk) { const y = tk.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8; if (sc.scrollTop > y) sc.scrollTop = y } }
    if (t && t.closest('[data-tabs]')?.classList.contains('st-tk')) { ST.tab = t.dataset.tab; if (t.dataset.tab === 'p' && ST.st === 'pre' && !ST.seenOdds) { ST.seenOdds = true; redraw() } return }
    // Переключатель карт внутри «Статистики»
    if (t && t.closest('[data-tabs]')?.classList.contains('st-mtk')) { ST.map = +t.dataset.tab.slice(1); return }
    // Кнопка из «Наград» — открыть свою плитку
    const o = e.target.closest('[data-open]')
    if (o) { ST.tab = o.dataset.open; if (o.dataset.open === 'p' && ST.st === 'pre') ST.seenOdds = true; redraw(); return }
    const a = e.target.closest('[data-sa]')
    if (a && ДЕЙСТВИЯ[a.dataset.sa] && !a.disabled) { e.preventDefault(); ДЕЙСТВИЯ[a.dataset.sa](a); ST.demo = null; redraw(); return }
    // Значок события на графике: подпись остаётся открытой (на телефоне нет наведения)
    const p = e.target.closest('[data-pt]')
    document.querySelectorAll('[data-pt].is-on').forEach((q) => { if (q !== p) q.classList.remove('is-on') })
    if (p) p.classList.toggle('is-on')
  })
})()
