/* Лаба «Состав» (дирижёр 05.10; правка начальника 30.09: «общая расстановка состава — одна для всех игр, с небольшими отличиями»).
   Общее для трёх вариантов: данные, состояние, мини-карта «Жетон» (стили — /p-fw3k/site/styles.css, обёртка .hg), поведение.
   Вариант задаёт только разметку экрана: LINEUP.page({ id, render(S, h) }). Экран рисуется дважды — десктоп и телефон
   (телефон — та же разметка в рамке 390 px, перестраивает её container query «lu» в _lineup.css). Состояние общее: клик в одной рамке
   меняет обе. Данные условные: сегодня 1 октября, TS — TUN идёт (К2), PV — BB в 18:00, Team Falcons сегодня не играют.
   Перетаскивание (дирижёр 05.10: «чтобы карточки прикольно перетаскивались на десктопе» — v1, v3): LINEUP.page({ render, drag: true }) —
   игровое перетаскивание мышью (тащить() ниже); варианту нужны data-drop="i" на слотах и data-drop-bench на скамейке. Без drag — HTML5 (v2). */
(() => {
  // Роли слотов по играм — состав один, отличаются подписи (Dota — позиции 1–5, LoL — линии, CS 2 — роли)
  const РОЛИ = {
    dota: [['1', 'Керри'], ['2', 'Мид'], ['3', 'Оффлейн'], ['4', 'Саппорт'], ['5', 'Полный саппорт']],
    lol: [['Top', 'Топ'], ['Jgl', 'Лес'], ['Mid', 'Мид'], ['ADC', 'Стрелок'], ['Sup', 'Поддержка']],
    cs: [['Entry', 'Входящий'], ['AWP', 'Снайпер'], ['Rifle', 'Райфлер'], ['Lurk', 'Люркер'], ['IGL', 'Капитан-тактик']],
  }
  const ИГРЫ = [['dota', 'Dota 2'], ['lol', 'LoL'], ['cs', 'CS 2']]
  const КОМАНДЫ = { pv: 'PARIVISION', ts: 'Team Spirit', tun: 'Tundra Esports', flc: 'Team Falcons', bb: 'BetBoom Team' }
  const КОРОТКО = { pv: 'PV', ts: 'Spirit', tun: 'Tundra', flc: 'Falcons', bb: 'BetBoom' }
  // Матчи сегодня: команда → [статус, время, соперник]
  const МАТЧИ = { ts: ['live', 'К2 · 27:41', 'tun'], tun: ['live', 'К2 · 27:41', 'ts'], pv: ['up', '18:00', 'bb'], bb: ['up', '18:00', 'pv'] }
  // Карты игрока: ник, позиция, команда, OVR, редкость, фото, прогноз очков на сегодня
  const ИГРОКИ = {
    yatoro: ['Yatoro', 1, 'ts', 82, 'holo', 'yatoro.webp', 21.4], pure: ['Pure', 1, 'tun', 93, 'prism', 'pure.webp', 24.0], satanic: ['Satanic', 1, 'pv', 91, 'holo', '', 19.6],
    larl: ['Larl', 2, 'ts', 80, 'base', '', 18.2], noone: ['No[o]ne', 2, 'pv', 84, 'holo', '', 17.5], malrine: ['Malr1ne', 2, 'flc', 86, 'base', '', 0],
    collapse: ['Collapse', 3, 'ts', 88, 'prism', '', 15.1], dukalis: ['Dukalis', 3, 'pv', 72, 'base', '', 12.0], n33: ['33', 3, 'tun', 79, 'base', '', 9.1],
    '9class': ['9Class', 4, 'pv', 95, 'legend', '9class.webp', 18.9], rue: ['Rue', 4, 'ts', 78, 'base', 'rue.webp', 12.6],
    miposhka: ['Miposhka', 5, 'ts', 76, 'base', '', 9.8], whitemon: ['Whitemon', 5, 'tun', 74, 'base', '', 7.7],
  }
  const ид = Object.keys(ИГРОКИ)
  const п = (id) => { const [ник, pos, к, ovr, r, фото, очки] = ИГРОКИ[id]; return { id, ник, pos, к, ovr, r, фото, очки, матч: МАТЧИ[к] } }
  const сила = (ovr) => (ovr >= 90 ? 'elite' : ovr >= 75 ? 'gold' : ovr >= 60 ? 'silver' : 'bronze')
  const РЕДК = { base: 'Base', holo: 'Holo', prism: 'Prism', legend: 'Legend' }

  // Мини-карта «Жетон» — разметка компонента сайта (website/blocks/screens/gallery.html), --w — ширина
  const карта = (id, w = 120, extra = '') => {
    const x = п(id), лого = (cl, deco = '') => `<i class="logo-mask ${cl}" data-l="2"${deco} style="--logo: url('/p-fw3k/site/img/teams/${x.к}.png')"></i>`
    const spark = x.r === 'prism' || x.r === 'legend' ? '<i class="fx fx-spark" data-l="4"><b></b><b></b><b></b><b></b><b></b><b></b></i>' : ''
    return `<div class="kc mk kc--${сила(x.ovr)} kc--${x.r} m3" data-tilt style="--w: ${w}px"${extra}><div class="kc__in"><div class="kc__face"><div class="mk-plate">${лого('mk-logo')}${лого('mk-logo mk-logo--a', ' data-deco="2"')}${лого('mk-logo mk-logo--b', ' data-deco="2"')}`
      + `<i class="mk-pix" data-deco="1"></i><i class="mk-halo"></i><img class="ph${x.фото ? '' : ' ph--sil'}" data-l="5" src="/p-fw3k/site/img/players/${x.фото || '_silhouette.png'}" alt="${x.ник}" /><i class="mk-scan" data-deco="3"></i><i class="fx fx-shine" data-l="4"></i>${spark}`
      + `<div class="m3__band"><span class="m3__pos">P${x.pos}</span><span class="m3__nick">${x.ник}</span></div><div class="m3__foot"><b>${КОМАНДЫ[x.к]}</b></div></div>`
      + `<svg class="mk-frame" viewBox="0 0 160 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="14,1 159,1 159,181 140,199 1,199 1,14" /></svg>`
      + `<div class="m3__tab"><img class="logo" src="/p-fw3k/site/img/teams/${x.к}.png" alt="${КОМАНДЫ[x.к]}" /></div><div class="m3__ovr"><b>${x.ovr}</b></div><i class="fx fx-glare"></i></div></div></div>`
  }
  const лого = (к, cl = '') => `<img class="lu-logo ${cl}" src="/p-fw3k/site/img/teams/${к}.png" alt="${КОМАНДЫ[к]}" />`
  const матч = (x) => (x.матч ? `${x.матч[0] === 'live' ? '<i class="lu-dot"></i>' : ''}${КОРОТКО[x.к]} — ${КОРОТКО[x.матч[2]]} · ${x.матч[1]}` : 'Сегодня не играет')

  // Состояние: слоты по позициям 1–5 (id или null), капитан, игра, фильтр скамейки, поиск
  const S = { game: 'dota', slots: ['yatoro', null, 'collapse', '9class', null], cap: '9class', pos: 0, q: '', deadline: 2 * 3600 + 14 * 60 + 37 }
  const очки = () => S.slots.reduce((s, id) => s + (id ? п(id).очки * (id === S.cap ? 1.5 : 1) : 0), 0)
  const скамейка = () => ид.filter((id) => !S.slots.includes(id)).filter((id) => !S.pos || п(id).pos === S.pos).filter((id) => !S.q || п(id).ник.toLowerCase().includes(S.q.toLowerCase()))
  const таймер = () => [Math.floor(S.deadline / 3600), Math.floor(S.deadline / 60) % 60, S.deadline % 60].map((n) => String(n).padStart(2, '0')).join(':')
  const нестарт = () => S.slots.filter((id) => id && !п(id).матч)

  // Общие куски разметки для вариантов
  const h = {
    РОЛИ: () => РОЛИ[S.game], ИГРЫ, КОМАНДЫ, п, карта, лого, матч, сила, РЕДК, очки, скамейка, таймер, нестарт,
    игры: () => `<div class="lu-seg" role="group" aria-label="Игра">${ИГРЫ.map(([k, t]) => `<button type="button" aria-pressed="${S.game === k}" data-game="${k}">${t}</button>`).join('')}</div>`,
    позиции: () => `<div class="lu-chips">${['Все', ...РОЛИ[S.game].map((r) => r[1])].map((t, i) => `<button type="button" aria-pressed="${S.pos === i}" data-pos="${i}">${t}</button>`).join('')}</div>`,
    поиск: () => `<label class="lu-search"><i>⌕</i><input type="search" placeholder="Найти игрока" value="${S.q}" data-q /></label>`,
    итог: () => `<div class="lu-sum"><span><small>Прогноз пятёрки</small><b>${очки().toFixed(1)}</b></span><span><small>Замены закроются через</small><b class="lu-clock" data-clock>${таймер()}</b></span><span><small>Капитан ×1.5</small><b>${S.cap && S.slots.includes(S.cap) ? п(S.cap).ник : '—'}</b></span></div>`,
    предупреждение: () => нестарт().length ? `<p class="lu-warn"><b>${нестарт().map((id) => п(id).ник).join(', ')}</b> сегодня не играет — 0 очков. Замени до дедлайна.</p>` : '',
    // Шапка продукта — как website/blocks/app/header.html, раздел «Состав» добавлен и выбран; снизу таб-бар (виден на телефоне)
    шапка: () => `<header class="ui-header"><div class="ui-header__in"><div class="ui-header__top"><a class="ui-header__brand">Fantasy · Dota 2</a>
      <div class="btn-row ui-header__game"><button class="btn btn--quiet btn--xs" type="button" aria-pressed="true">Dota</button><button class="btn btn--quiet btn--xs" type="button" aria-pressed="false">LoL</button></div>
      <div class="ui-header__coins"><span>Монеты</span><b>1 000</b><button class="btn btn--quiet btn--sm" type="button">Забрать +50</button></div></div>
      <nav class="ui-tabs ui-header__nav">${['Главная', 'Матчи', 'Состав', 'Бустеры', 'Коллекция', 'Квесты', 'Лидеры'].map((t) => `<a class="ui-tabs__a"${t === 'Состав' ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav></div></header>`,
    таббар: () => `<nav class="lu-tabbar">${[['▦', 'Матчи'], ['★', 'Состав', 1], ['▣', 'Бустеры'], ['❖', 'Коллекция'], ['◉', 'Профиль']].map(([и, t, on]) => `<a${on ? ' aria-current="page"' : ''}><i>${и}</i>${t}</a>`).join('')}</nav>`,
    авто: (cl = '') => `<button type="button" class="btn ${cl}" data-auto>Собрать за меня</button>`,
    S,
  }

  // Автосборка: на каждую позицию — лучший по прогнозу из тех, кто играет сегодня; капитан — лучший в пятёрке
  const авто = () => {
    S.slots = [1, 2, 3, 4, 5].map((pos) => ид.filter((id) => п(id).pos === pos && п(id).матч).sort((a, b) => п(b).очки - п(a).очки)[0] || null)
    S.cap = [...S.slots].filter(Boolean).sort((a, b) => п(b).очки - п(a).очки)[0]
  }
  const поставить = (id) => { const i = п(id).pos - 1; S.slots[i] = id }
  const убрать = (id) => { const i = S.slots.indexOf(id); if (i >= 0) S.slots[i] = null; if (S.cap === id) S.cap = null }

  function page({ render, drag = false }) {
    const рамки = [...document.querySelectorAll('[data-lu]')]
    const draw = () => {
      рамки.forEach((r) => {
        const фокус = r.contains(document.activeElement) && document.activeElement.matches('[data-q]')
        r.innerHTML = render(S, h)
        if (drag) r.querySelectorAll('[draggable]').forEach((el) => el.removeAttribute('draggable')) // своё перетаскивание — без серого призрака HTML5
        if (фокус) { const i = r.querySelector('[data-q]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length) }
      })
      наклон()
    }
    if (drag) { document.body.classList.add('lu-drag'); тащить(draw) }
    document.addEventListener('click', (e) => {
      const t = e.target
      const g = t.closest('[data-game]'); if (g) { S.game = g.dataset.game; return draw() }
      const pos = t.closest('[data-pos]'); if (pos) { S.pos = +pos.dataset.pos; return draw() }
      if (t.closest('[data-auto]')) { авто(); return draw() }
      const cap = t.closest('[data-cap]'); if (cap) { S.cap = cap.dataset.cap; return draw() }
      const out = t.closest('[data-out]'); if (out) { убрать(out.dataset.out); return draw() }
      const add = t.closest('[data-add]'); if (add) { поставить(add.dataset.add); return draw() }
      const slot = t.closest('[data-slot]'); if (slot && !S.slots[+slot.dataset.slot]) { S.pos = +slot.dataset.slot + 1; return draw() }
    })
    document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { S.q = e.target.value; draw() } })
    // Перетаскивание карты со скамейки в слот (плюс к клику) — HTML5, для вариантов без своего перетаскивания
    if (!drag) document.addEventListener('dragstart', (e) => { const c = e.target.closest('[data-add]'); if (c) e.dataTransfer.setData('text/plain', c.dataset.add) })
    if (!drag) document.addEventListener('dragover', (e) => { if (e.target.closest('[data-slot]')) e.preventDefault() })
    if (!drag) document.addEventListener('drop', (e) => { const s = e.target.closest('[data-slot]'); const id = e.dataTransfer.getData('text/plain'); if (s && id) { e.preventDefault(); поставить(id); draw() } })
    setInterval(() => { S.deadline = Math.max(0, S.deadline - 1); document.querySelectorAll('[data-clock]').forEach((el) => { el.textContent = таймер() }) }, 1000)
    draw()
  }

  // ——— Игровое перетаскивание (v1, v3) ———
  // Нажал на карту (скамейка — [data-add], состав — [data-out]) и повёл больше 6 px: карта приподнимается (копия поверх всего, ×1.08, тень,
  // свет цвета редкости), едет за курсором и наклоняется по скорости; на месте остаётся пунктирный след. Свой слот (позиция игрока)
  // подсвечен, чужие приглушены; у слота под курсором — магнит. Отпустил над своим слотом — карта влетает с пружиной (занятый: прежний
  // игрок уходит на скамейку); над чужим — слот краснеет и трясётся, карта возвращается; карту из состава над скамейкой — убрать.
  // Мимо — плавный возврат. Клик без движения — прежнее поведение. Только мышь: на телефоне палец листает, ставит клик.
  const СВЕТ = { base: 'var(--c-tier-silver)', holo: 'var(--c-rarity-holo-4)', prism: 'var(--c-rarity-holo-5)', legend: 'var(--c-tier-gold)' }
  function тащить(draw) {
    const тихо = matchMedia('(prefers-reduced-motion: reduce)').matches
    let D = null, глушитьКлик = false
    const центр = (r) => [r.left + r.width / 2, r.top + r.height / 2]
    const внутри = (r, x, y, pad = 0) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad
    // Копия летит к прямоугольнику rect и исчезает; затем — что сделать
    const лететь = (rect, done, пружина) => {
      const g = D.g, w = rect.width / D.w0
      g.style.transition = тихо ? 'none' : `left .34s ${пружина ? 'cubic-bezier(.2, 1.5, .4, 1)' : 'cubic-bezier(.3, .8, .3, 1)'}, top .34s ${пружина ? 'cubic-bezier(.2, 1.5, .4, 1)' : 'cubic-bezier(.3, .8, .3, 1)'}, transform .34s ease, box-shadow .34s`
      g.classList.remove('is-up')
      Object.assign(g.style, { left: `${rect.left}px`, top: `${rect.top}px`, transform: `scale(${w})` })
      setTimeout(() => { g.remove(); done() }, тихо ? 0 : 340)
    }
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      const кл = e.target.closest('.kc'), ист = кл && кл.closest('[data-add], [data-out]'); if (!ист || !ист.closest('[data-lu]')) return
      e.preventDefault()
      D = { id: ист.dataset.add || ист.dataset.out, изСостава: !!ист.dataset.out, ист, кл, рамка: ист.closest('[data-lu]'), x0: e.clientX, y0: e.clientY, идёт: false }
    })
    document.addEventListener('pointermove', (e) => {
      if (!D) return
      if (!D.идёт) {
        if (Math.hypot(e.clientX - D.x0, e.clientY - D.y0) < 6) return
        // Старт: копия карты поверх всего, на месте — след; подсветка слотов
        const r = D.кл.getBoundingClientRect(), x = п(D.id)
        D.идёт = true; D.r0 = r; D.w0 = r.width; D.dx = e.clientX - r.left; D.dy = e.clientY - r.top; D.px = e.clientX; D.py = e.clientY; D.rot = 0; D.tx = 0
        const g = D.кл.cloneNode(true)
        g.classList.add('lu-ghost'); g.classList.remove('is-on'); g.style.setProperty('--w', `${r.width}px`); g.style.setProperty('--glow', СВЕТ[x.r])
        Object.assign(g.style, { left: `${r.left}px`, top: `${r.top}px` })
        // Слой копии — с обёрткой .hg: стили «Жетона» на сайте висят на ней
        let слой = document.querySelector('.lu-layer'); if (!слой) { слой = Object.assign(document.createElement('div'), { className: 'hg lu-layer' }); document.body.append(слой) }
        слой.append(g); D.g = g
        requestAnimationFrame(() => g.classList.add('is-up'))
        D.ист.classList.add('lu-trail'); document.body.classList.add('lu-dragging')
        D.слоты = [...D.рамка.querySelectorAll('[data-drop]')]
        D.слоты.forEach((s) => s.classList.add(+s.dataset.drop === x.pos - 1 ? 'lu-ok' : 'lu-no'))
        D.скамейка = D.рамка.querySelector('[data-drop-bench]')
        if (D.изСостава && D.скамейка) D.скамейка.classList.add('lu-bench-on')
      }
      // Ведение: магнит к слоту под курсором, наклон по скорости (сглаженный)
      let x = e.clientX - D.dx, y = e.clientY - D.dy
      D.над = D.слоты.find((s) => внутри(s.getBoundingClientRect(), e.clientX, e.clientY, 24))
      D.слоты.forEach((s) => s.classList.toggle('is-hover', s === D.над))
      if (D.над && !тихо) { const [cx, cy] = центр(D.над.getBoundingClientRect()); x += (cx - D.w0 / 2 - x) * 0.35; y += (cy - D.r0.height / 2 - y) * 0.35 }
      const vx = e.clientX - D.px, vy = e.clientY - D.py; D.px = e.clientX; D.py = e.clientY
      D.rot += (Math.max(-18, Math.min(18, vx * 0.9)) - D.rot) * 0.3; D.tx += (Math.max(-14, Math.min(14, -vy * 0.7)) - D.tx) * 0.3
      Object.assign(D.g.style, { left: `${x}px`, top: `${y}px` })
      if (!тихо) D.g.style.setProperty('--tilt', `rotateZ(${(D.rot * 0.5).toFixed(2)}deg) rotateY(${D.rot.toFixed(2)}deg) rotateX(${D.tx.toFixed(2)}deg)`)
      if (D.скамейка) D.скамейка.classList.toggle('is-hover', D.изСостава && !D.над && внутри(D.скамейка.getBoundingClientRect(), e.clientX, e.clientY, 10))
    })
    document.addEventListener('pointerup', (e) => {
      if (!D) return
      const d = D
      if (!d.идёт) { D = null; return } // клик без движения — обработает click
      глушитьКлик = true; setTimeout(() => { глушитьКлик = false }, 60)
      const x = п(d.id), свой = d.над && +d.над.dataset.drop === x.pos - 1
      const наСкамейку = d.изСостава && !d.над && d.скамейка && внутри(d.скамейка.getBoundingClientRect(), e.clientX, e.clientY, 10)
      const конец = (действие, сели = []) => {
        d.слоты.forEach((s) => s.classList.remove('lu-ok', 'lu-no', 'is-hover'))
        d.скамейка?.classList.remove('lu-bench-on', 'is-hover'); d.ист.classList.remove('lu-trail'); document.body.classList.remove('lu-dragging')
        if (действие) { действие(); draw(); if (!тихо) сели.forEach((id) => document.querySelectorAll(`[data-lu] [data-out="${id}"] .kc, [data-lu] [data-add="${id}"] .kc`).forEach((к) => к.classList.add('lu-land'))) }
        D = null
      }
      if (свой && !(d.изСостава && S.slots[x.pos - 1] === d.id)) {
        // В свой слот: влетает с пружиной; прежний игрок — на скамейку
        const прежний = S.slots[x.pos - 1], куда = (d.над.querySelector('.kc') || d.над.querySelector('.v3-emp') || d.над).getBoundingClientRect()
        const r = куда.width < 40 ? d.над.getBoundingClientRect() : куда
        лететь({ left: r.left + (r.width - Math.min(r.width, d.w0)) / 2, top: r.top, width: Math.min(r.width, d.w0) }, () => конец(() => поставить(d.id), [d.id, прежний].filter(Boolean)), true)
      } else if (наСкамейку) {
        лететь(d.скамейка.getBoundingClientRect(), () => конец(() => убрать(d.id), [d.id]), false)
      } else {
        // Чужая позиция — слот краснеет и трясётся; мимо — просто возврат на место
        if (d.над && !свой) { const s = d.над; s.classList.add('is-bad'); setTimeout(() => s.classList.remove('is-bad'), 500) }
        лететь(d.r0, () => конец(null), false)
      }
    })
    document.addEventListener('click', (e) => { if (глушитьКлик) { e.stopPropagation(); e.preventDefault() } }, true)
  }

  // Наклон и блик карт — как на сайте (app.js [Карта Хайперглитч])
  function наклон() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.querySelectorAll('.kc:not([data-t])').forEach((к) => {
      к.dataset.t = ''
      к.addEventListener('pointermove', (e) => { const б = к.getBoundingClientRect(), x = (e.clientX - б.left) / б.width, y = (e.clientY - б.top) / б.height
        к.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); к.style.setProperty('--my', `${(y * 100).toFixed(1)}%`); к.style.setProperty('--dx', (x - .5).toFixed(3)); к.style.setProperty('--dy', (y - .5).toFixed(3)); к.classList.add('is-on') })
      к.addEventListener('pointerleave', () => { к.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach((v) => к.style.removeProperty(v)) })
    })
  }

  window.LINEUP = { page }
})()
