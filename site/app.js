// FantasyWeb — логика сайта (подключается в конце layout.html). Пока пусто: поведение добавляем по слову дирижёра.

// === Ревью: фильтр находок по приоритету (кнопки data-filter, карточки data-priority) ===
document.querySelectorAll('#review .review-filter').forEach((bar) => {
  const items = bar.closest('section').querySelectorAll('.review-item')
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]')
    if (!btn) return
    bar.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
    items.forEach((it) => { it.hidden = btn.dataset.filter !== 'all' && it.dataset.priority !== btn.dataset.filter })
  })
})

// === Онбординг: кликабельный прототип (шаги data-onb-step, переходы data-onb-go, выбор — role="radio") ===
document.querySelectorAll('#onboarding-proto').forEach((sec) => {
  const box = sec.querySelector('.onb')
  const equip = sec.querySelector('[data-onb-equip]')
  const predict = sec.querySelector('[data-onb-predict]')
  const go = (step) => {
    box.dataset.step = step
    box.querySelectorAll('[data-onb-step]').forEach((s) => { s.hidden = s.dataset.onbStep !== step })
    sec.querySelectorAll('.onb-jump [data-onb-go]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.onbGo === step)))
  }
  sec.addEventListener('click', (e) => {
    const radio = e.target.closest('[role="radio"]')
    if (radio) {
      radio.parentElement.querySelectorAll('[role="radio"]').forEach((r) => r.setAttribute('aria-checked', String(r === radio)))
      if (radio.dataset.hero) equip.textContent = 'Надеть ' + radio.dataset.hero
      if (radio.classList.contains('onb-pick__opt')) predict.disabled = false
      return
    }
    const btn = e.target.closest('[data-onb-go]')
    if (btn) go(btn.dataset.onbGo)
  })
})

// === Карточка: наклон и блик за курсором (.player-card[data-tilt], карты архива .kc[data-tilt] на «Все варианты карточки») ===
// --mx/--my — точка курсора в %, --dx/--dy — смещение от центра (−.5….5); стили — styles.css [=== Карточка ===]
function tilt(card) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    card.style.setProperty('--dx', (x - 0.5).toFixed(3))
    card.style.setProperty('--dy', (y - 0.5).toFixed(3))
    card.classList.add('is-on')
  })
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-on')
    ;['--mx', '--my', '--dx', '--dy'].forEach((v) => card.style.removeProperty(v))
  })
}
document.querySelectorAll('.player-card[data-tilt], .kc[data-tilt]').forEach(tilt)

// === Все варианты карточки: клик по карте — она на весь экран, фон размыт. Закрыть — клик мимо, «Закрыть» или Esc ===
// Слой кладём в секцию направления: стили карт архива действуют только внутри неё (#cards-v-…). Стили — styles.css [=== Все варианты карточки ===]
document.querySelectorAll('.cards-arch').forEach((sec) => {
  sec.addEventListener('click', (e) => {
    const card = e.target.closest('.kc, .player-card')
    if (!card || card.closest('.card-zoom')) return
    const big = card.cloneNode(true)
    big.classList.remove('is-on')
    ;['--mx', '--my', '--dx', '--dy', '--w'].forEach((v) => big.style.removeProperty(v))
    const box = document.createElement('div')
    box.className = 'card-zoom'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-modal', 'true')
    const cap = card.closest('.slot')?.querySelector('figcaption')?.textContent ?? ''
    const title = sec.querySelector('.sec-title')?.firstChild?.textContent.trim() ?? ''
    box.setAttribute('aria-label', [title, cap].filter(Boolean).join(' · '))
    box.innerHTML = `<button class="btn btn--chip card-zoom__close" type="button">Закрыть ✕</button><p class="card-zoom__cap">${[title, cap].filter(Boolean).join(' · ')}</p>`
    box.prepend(big)
    sec.append(box)
    tilt(big)
    document.documentElement.style.overflow = 'hidden'
    const close = () => {
      box.remove()
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
    const onKey = (ev) => { if (ev.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    box.addEventListener('click', (ev) => { if (!ev.target.closest('.kc, .player-card') || ev.target.closest('.card-zoom__close')) close() })
    box.querySelector('.card-zoom__close').focus()
  })
})

// === Генератор карточки v2: с нуля, по этапам — 1 Форма → 2 Фон → 3 Рамка → 4 Эффекты → 5 Фото → 6 Игрок → 7 Раскладка → 8 Инфо → 9 Оборот (blocks/builder-v2/app.html) ===
// .cb2-card — контейнер без обрезки: внутри кольца одной формы .cb2-ring[data-r=0…n] › .cb2-face (фон-узор) › .cb2-art (фото),
// + данные (рейтинг, позиция, флаг, ник, команда) — ячейки сетки фона: раскладка задаёт сетку, фото занимает остаток сверху (автолэйаут); рядом — .cb2-pop (голова над краем, не обрезается) и .cb2-glare (блик, по форме). У кольца свой отступ внутрь (em), форма пересчитывается
// под накопленный отступ; цвет кольца — в CSS по data-frame и data-r. Атрибуты на карте и обёртке: data-bg, data-tier, data-frame, data-art, data-layout, data-fx, data-heroes, data-stats, data-info, data-step.
// Форма считается в em (карта 22em × 30.8em, 1em = ширина / 22) — одна функция рисует и большую заготовку, и плитки. Стили — styles.css [=== Генератор карточки v2 ===].
document.querySelectorAll('#card-builder-v2').forEach((root) => {
  // p — размер формы в em (радиус, срез, глубина): постоянный, чуть сильнее «по умолчанию» (дирижёр 29.09 — без ползунка)
  const ФОРМЫ = [
    { id: 'round', имя: 'Скругление', p: 1.8 },
    { id: 'cut4', имя: 'Срез 4 углов', p: 2.4 },
    { id: 'cut2', имя: 'Срез по диагонали', p: 3.2 },
    // Вместо щита (дирижёр 29.09): асимметрия и фаска сверху. Вырезы в углах, скошенный и вогнутый верх, шестигранник убраны
    { id: 'asym', имя: 'Асимметрия', p: 4.2 },
    { id: 'chamfer', имя: 'Фаска сверху', p: 2.6 },
    { id: 'ticket', имя: 'Билет', p: 2.2 },
  ]
  const ФОНЫ = [['plain', 'Чистый'], ['lines', 'Диагональ'], ['speed', 'Скорость'], ['rays', 'Лучи'], ['halftone', 'Полутон'], ['zigzag', 'Зигзаг'], ['topo', 'Топография'], ['tech', 'Техно'], ['hex', 'Соты'], ['logo', 'Логотип команды']]
  const СИЛА = [['bronze', 'Bronze'], ['silver', 'Silver'], ['gold', 'Gold'], ['elite', 'Elite']]
  // Рамка: отступы колец 1…n и фона (em), от внешнего края внутрь. Цвета колец — в CSS: [data-frame] .cb2-ring[data-r].
  // Техно, неон и «чёрную с золотом» дирижёр убрал 29.09. Блики рамок следят за наклоном: --mx/--my/--dx/--dy ставит tilt() на обёртку
  const РАМКИ = [
    { id: 'none', имя: 'Без рамки', кольца: [], фон: 0 },
    { id: 'baguette', имя: 'Багет', кольца: [.08, .5, .06], фон: .05 },
    { id: 'bevel', имя: 'Скос', кольца: [.38], фон: .14 },
    { id: 'prism', имя: 'Призма', кольца: [.06, .32], фон: .06 },
    { id: 'engraved', имя: 'Гравировка', кольца: [.06, .52], фон: .06 },
    { id: 'crystal', имя: 'Кристалл', кольца: [.05, .45], фон: .05 },
  ]

  const e = (v) => `${+v.toFixed(3)}em`
  // Форма со сдвигом внутрь на d (em): срезы и радиусы уменьшаются, у «Билета» вогнутый радиус растёт. Острые углы, арку и вымпел дирижёр убрал 29.09
  function форма(id, p, d = 0) {
    const c = (pts) => ({ clipPath: `polygon(${pts})` })
    switch (id) {
      case 'round': return { borderRadius: e(Math.max(p - d, 0)) }
      case 'cut4': { const q = e(Math.max(p - d * .4, 0)); return c(`${q} 0, calc(100% - ${q}) 0, 100% ${q}, 100% calc(100% - ${q}), calc(100% - ${q}) 100%, ${q} 100%, 0 calc(100% - ${q}), 0 ${q}`) }
      case 'cut2': { const q = e(Math.max(p - d * .4, 0)); return c(`0 0, calc(100% - ${q}) 0, 100% ${q}, 100% 100%, ${q} 100%, 0 calc(100% - ${q})`) }
      // Асимметрия: большие скругления по диагонали (верх-лево, низ-право), малые — в двух других углах
      case 'asym': { const b = e(Math.max(p - d, 0)), m = e(Math.max(.8 - d, 0)); return { borderRadius: `${b} ${m} ${b} ${m}` } }
      // Фаска сверху: верхние углы срезаны, нижние скруглены (дуга — точками многоугольника)
      case 'chamfer': {
        const q = e(Math.max(p - d * .4, 0)), r = Math.max(1.6 - d, 0), дуга = (x, y, a0) => [0, 1, 2, 3, 4, 5, 6].map((k) => {
          const a = (a0 + k * 15) * Math.PI / 180
          return `calc(${x} + ${e(Math.cos(a) * r)}) calc(${y} + ${e(Math.sin(a) * r)})`
        })
        return c([`${q} 0`, `calc(100% - ${q}) 0`, `100% ${q}`, ...дуга(`100% - ${e(r)}`, `100% - ${e(r)}`, 0), ...дуга(`${e(r)}`, `100% - ${e(r)}`, 90), `0 ${q}`].join(', '))
      }
      case 'ticket': {
        const r = e(p + d), o = e(-d)
        const q = (x, y) => `radial-gradient(circle at ${x} ${y}, transparent ${r}, var(--c-black) calc(${r} + .5px))`
        const m = [q(o, o) + ' top left', q(`calc(100% + ${e(d)})`, o) + ' top right', q(o, `calc(100% + ${e(d)})`) + ' bottom left', q(`calc(100% + ${e(d)})`, `calc(100% + ${e(d)})`) + ' bottom right']
          .map((x) => `${x} / 51% 51% no-repeat`).join(', ')
        return { mask: m, webkitMask: m }
      }
    }
    return {}
  }
  const стиль = (el, id, p, d) => {
    ;['clipPath', 'borderRadius', 'mask', 'webkitMask', 'maskComposite', 'webkitMaskComposite'].forEach((k) => { el.style[k] = '' })
    if (id) Object.assign(el.style, форма(id, p, d))
  }
  // Фото: подача игрока. Игроки — вырезки из website/img/players
  // Сияние, медальон, «в цвет силы», двойника, крупный план и плашку дирижёр убрал 29.09. Окно повторяет форму карты
  const ФОТО = [['none', 'Без фото'], ['full', 'На весь фон'], ['pop', 'Над краем'], ['window', 'В окне'], ['sticker', 'Наклейка'], ['rim', 'Контровой свет'], ['diagonal', 'Диагональ']]
  // Undefined — базовый игрок без фото: вместо вырезки силуэт (этап 6 «Игрок»)
  const ИГРОКИ = [['undefined', 'Undefined'], ['9class', '9Class'], ['pure', 'Pure'], ['yatoro', 'Yatoro'], ['rue', 'Rue']]
  // Данные игроков для раскладки (условные, сайт тестовый)
  // герои: [id картинки, имя, доля карт %, бонус %, матчей, винрейт %] — третий лучший (★); статы — FRM, FGT, POOL, SUR, VIS, FORM
  // name — настоящее имя, id — номер карты в сезоне, logo — команда игрока (id из КОМАНДЫ): её выбирает смена игрока, дальше команду можно сменить на этапе «Фон»
  const ДАННЫЕ = {
    // Базовый игрок: без фото, имени, флага и своей команды (команда — та, что выбрана на этапе «Фон»)
    undefined: { ovr: 70, pos: 3, logo: null, flag: 'none', name: '', id: '000', stats: [60, 60, 60, 60, 60, 60],
      heroes: [['mars', 'Mars', 20, 5, 20, 50], ['lycan', 'Lycan', 15, 10, 15, 50], ['beastmaster', 'Beastmaster', 10, 25, 10, 50]] },
    '9class': { ovr: 95, pos: 4, logo: 'pv', flag: 'ru', name: 'Эдгар Налдакян', id: '012', stats: [82, 60, 47, 91, 36, 67],
      heroes: [['tusk', 'Tusk', 24, 5, 38, 61], ['rubick', 'Rubick', 19, 12, 31, 58], ['hoodwink', 'Hoodwink', 12, 25, 19, 68]] },
    pure: { ovr: 93, pos: 1, logo: 'tun', flag: 'ru', name: 'Иван Москаленко', id: '003', stats: [95, 88, 83, 86, 49, 90],
      heroes: [['terrorblade', 'Terrorblade', 22, 5, 35, 63], ['morphling', 'Morphling', 16, 12, 26, 57], ['faceless_void', 'Faceless Void', 10, 25, 16, 69]] },
    yatoro: { ovr: 82, pos: 1, logo: 'ts', flag: 'ua', name: 'Илья Мулярчук', id: '027', stats: [93, 71, 64, 78, 41, 74],
      heroes: [['faceless_void', 'Faceless Void', 21, 5, 34, 60], ['morphling', 'Morphling', 17, 10, 27, 55], ['terrorblade', 'Terrorblade', 9, 25, 14, 64]] },
    // Имя rue придумано (дирижёр 30.09)
    rue: { ovr: 78, pos: 5, logo: 'ts', flag: 'ru', name: 'Владислав Пупкин', id: '041', stats: [44, 68, 72, 81, 88, 70],
      heroes: [['rubick', 'Rubick', 20, 5, 33, 59], ['tusk', 'Tusk', 14, 10, 22, 55], ['beastmaster', 'Beastmaster', 7, 25, 11, 64]] },
  }
  const СЕЗОН = 'Сезон 1', ТИРАЖ = 400
  // Команды — логотипы img/teams/<id>.png (те же, что на главной): фон «Логотип команды» и название на карте
  const КОМАНДЫ = [['pv', 'PARIVISION'], ['ts', 'Team Spirit'], ['tun', 'Tundra Esports'], ['flc', 'Team Falcons'], ['tl', 'Team Liquid'], ['gg', 'Gaimin Gladiators'], ['bb', 'BetBoom Team'], ['aur', 'Aurora'], ['yg', 'Yangon Galacticos']]
  const имяКоманды = (id) => КОМАНДЫ.find(([k]) => k === id)[1]
  const СТАТЫ = ['FRM', 'FGT', 'POOL', 'SUR', 'VIS', 'FORM']
  const уровень = (v) => (v >= 75 ? 'hi' : v >= 50 ? 'mid' : 'lo')
  // Инфо: герои и статы — строки внизу карты (автолэйаут поднимает фото)
  const ГЕРОИ_ВИД = [['none', 'Без героев'], ['rows', 'Списком'], ['icons', 'Иконками'], ['tiles', 'Плитки с бонусом'], ['best', 'Лучший крупно']]
  // Позиция, роль и команда — отдельной строкой над героями (правки начальника 30.09: по позиции выбирают игрока — видно сразу; команда средне, с логотипом).
  // Выбран вид — позиция и команда из раскладки прячутся, чтобы не повторяться
  const РОЛЬ_ВИД = [['none', 'Как в раскладке'], ['line', 'Строкой'], ['badge', 'Плашка роли'], ['center', 'По центру крупно'], ['chips', 'Чипами'], ['even', 'Плашка, один размер']]
  // «Полосы: рейтинг…» — герои в самой раскладке; этап 7 выбирает их вид: без героев, иконками, лучший крупно. Списком и плитками в узкую полосу не влезают
  const ПОЛОСЫ = ['r30', 'r30b'], НЕ_В_ПОЛОСУ = ['rows', 'tiles']
  const РОЛИ = { 1: 'Керри', 2: 'Мид', 3: 'Оффлейн', 4: 'Саппорт', 5: 'Хард-саппорт' }
  const СТАТЫ_ВИД = [['none', 'Без статов'], ['grid', 'Сетка 3×2'], ['bars', 'Полоски'], ['rings', 'Кольца'], ['line', 'Строкой'], ['pips', 'Деления']]
  const РАСКЛАДКИ = [['none', 'Без раскладки'], ['fut', 'Классика FUT'], ['strip', 'Полоса справа'], ['tab', 'Закладка сзади'], ['rtg', 'Рейтинг сверху'], ['ribbon', 'Ник на ленте'], ['corner', 'Медальон в углу'], ['minimal', 'Минимал'], ['r30', 'Полоса: рейтинг, герои'], ['r30b', 'Полоса: рейтинг, ник']]
  // Эффекты: редкость — блеск поверх карты (перелив, грани, фольга), искры, у Legend — сияние и лучи за картой
  const ЭФФЕКТЫ = [['base', 'Base — без блеска'], ['holo', 'Holo — перелив'], ['prism', 'Prism — грани'], ['legend', 'Legend — фольга'], ['sparks', 'Искры'],
    ['galaxy', 'Галактика'], ['aurora', 'Аврора'], ['fire', 'Жар'], ['frost', 'Иней'], ['scan', 'Скан-луч'], ['chrome', 'Хром']]
  // Несовместимые пары (дирижёр 29.09): такие плитки заблокированы, а выбор одного сбрасывает второе к началу
  // Плохие сочетания — пока не блокируем (дирижёр 29.09): плитка с красным контуром, при выборе — снекбар; в будущем заблокируем
  const НЕЛЬЗЯ = [[['art', 'diagonal'], ['layout', 'corner']], [['art', 'diagonal'], ['layout', 'ribbon']], [['art', 'window'], ['layout', 'corner']], [['shape', 'chamfer'], ['layout', 'tab']]]
  const ЧТО = { shape: ['Форма', () => ФОРМЫ], art: ['Фото', () => ФОТО], layout: ['Раскладка', () => РАСКЛАДКИ] }
  const плохая = () => НЕЛЬЗЯ.find((пара) => пара.every(([k, x]) => S[k] === x))
  const запрет = (o, k, v) => НЕЛЬЗЯ.some((пара) => пара.some(([a, x], i) => a === k && x === v && o[пара[1 - i][0]] === пара[1 - i][1]))
  const КАРТА = '<i class="cb2-card"></i>'
  // Свечение за головой — отдельная настройка этапа «Фото» (правки 30.09)
  const СВЕЧЕНИЕ = [['off', 'Нет'], ['on', 'Есть']]
  // Шрифтовые пары (этап 6): [id, крупный — ник и рейтинг, остальной текст карты]. Сами шрифты — styles.css [data-font], загрузка — blocks/builder-v2/app.html
  // Наклон шрифта (дирижёр 30.09): база — без наклона; «Везде» — курсив у всего текста карты
  // Номер карты — этап 7, у «Полос: рейтинг…». Виды по исследованию (исследование-финал §5–6): у ника; сверху поверх фото; в полосе вертикально (Arcane);
  // сезон плашкой + серийник (Sorare «412/1000»); неоновый серийник (NBA Top Shot). «В полосе» — только у «рейтинг, герои»: у «рейтинг, ник» полоса занята ником
  // Игрок без фото (Undefined): светящийся 3D-силуэт с глитчем (идея дирижёра из Figma: карта Sorare без фото) — img/players/_silhouette.png (картинка; лаба «силуэт-без-фото» v1)
  // Оборот (этап 9) — макеты, содержание продумаем отдельно: логотип и номер; путь игрока; хайлайты; факты
  // Оборот с кнопкой «Страница игрока» внизу и статистикой (дирижёр 30.09): статы полосками, герои с М и винрейтом, форма за 10 матчей
  // Путь игрока, хайлайты и факты убраны (дирижёр 30.09)
  const ОБОРОТ = [['logo', 'Логотип и номер'], ['stats', 'Статы + кнопка'], ['heroes', 'Герои + кнопка'], ['form', 'Сезон + кнопка']]
  // Полные названия статов для оборота; форма — последние 10 матчей (условно, сайт тестовый)
  const СТАТЫ_ИМЯ = ['Форма', 'Драки', 'Пул героев', 'Выживание', 'Обзор', 'Игра сейчас']
  const ФОРМА = { undefined: 'ВВПВПВВПВП', '9class': 'ВВВПВВПВВВ', pure: 'ВВПВВВВПВВ', yatoro: 'ВПВВПВВВПВ', rue: 'ПВВПВВПВВП' }
  const НОМЕР_ВИД = [['none', 'Без номера'], ['text', 'У ника'], ['top', 'Сверху'], ['band', 'В полосе'], ['chip', 'Сезон плашкой'], ['neon', 'Неон']]
  const НАКЛОН = [['none', 'Нигде'], ['all', 'Везде']]
  const ШРИФТЫ = [['archivo', 'Archivo', 'Google Sans'], ['unbounded', 'Unbounded', 'Onest'], ['oswald', 'Oswald', 'Rubik']]

  // Состояние сборки. reached — дальний пройденный этап: карта показывает всё собранное, даже если вернулся на прошлый шаг.
  // Хранится в браузере (localStorage), чтобы пересборка страницы и обновление вкладки не сбрасывали карту; «Сбросить всё» — к началу
  const НАЧАЛО = { step: '1', reached: 1, shape: 'round', bg: 'lines', tier: 'silver', frame: 'baguette', art: 'pop', player: 'undefined', layout: 'fut', fx: 'holo', heroes: 'icons', stats: 'grid', halo: 'off', team: 'pv', font: 'archivo', ref: 'on', slant: 'none', role: 'none', serial: 'text', back: 'logo' }
  const КЛЮЧ = 'fantasyweb-card-builder-v2'
  let S = { ...НАЧАЛО }
  try { Object.assign(S, JSON.parse(localStorage.getItem(КЛЮЧ)) || {}) } catch {}
  S.p = Object.fromEntries(ФОРМЫ.map((f) => [f.id, f.p]))
  // Сохранённое из прошлых версий (убранные формы, рамки, подачи) — к началу
  const есть = (list, id) => list.some((x) => (x.id ?? x[0]) === id)
  ;[['shape', ФОРМЫ], ['bg', ФОНЫ], ['tier', СИЛА], ['frame', РАМКИ], ['art', ФОТО], ['player', ИГРОКИ], ['layout', РАСКЛАДКИ], ['fx', ЭФФЕКТЫ], ['heroes', ГЕРОИ_ВИД], ['stats', СТАТЫ_ВИД], ['halo', СВЕЧЕНИЕ], ['team', КОМАНДЫ], ['font', ШРИФТЫ], ['slant', НАКЛОН], ['role', РОЛЬ_ВИД], ['serial', НОМЕР_ВИД], ['back', ОБОРОТ]].forEach(([k, list]) => { if (!есть(list, S[k])) S[k] = НАЧАЛО[k] })
  const сохранить = () => { try { const { p, ...x } = S; localStorage.setItem(КЛЮЧ, JSON.stringify(x)) } catch {} }
  const шаг = () => Math.max(+S.step, S.reached)

  // Нарисовать карту в обёртке wrap (.cb2-outline) по настройкам o — одна функция для большой заготовки и плиток
  function нарисовать(wrap, o) {
    const cardEl = wrap.querySelector('.cb2-card')
    const рамка = o.step >= 3 ? РАМКИ.find((r) => r.id === o.frame) : РАМКИ[0]
    // Пересобрать кольца, если рамка сменилась
    if (cardEl.dataset.built !== рамка.id) {
      // Фон — сетка (автолэйаут): фото занимает остаток сверху, данные — ячейки; раскладка задаёт сетку в CSS
      // .cb2-pat — паттерн из логотипов команды (фон «Логотип команды»), под фото
      const face = '<i class="cb2-face"><i class="cb2-pat">' + '<b></b>'.repeat(77) + '</i><span class="cb2-art"><span class="cb2-win"><i class="cb2-ph cb2-halo"></i><i class="cb2-ph cb2-under"></i><img class="cb2-ph" alt="" /><i class="cb2-ph cb2-ghost"><i></i><i></i></i></span></span><i class="cb2-band"></i>'
        + '<i class="cb2-fx"></i><i class="cb2-spark"><b></b><b></b><b></b><b></b><b></b><b></b></i>'
        + '<span class="cb2-ovr"><b></b><small>OVR</small></span><span class="cb2-pos"></span><i class="player-card__flag cb2-flag"></i>'
        + '<b class="cb2-nick"></b><span class="cb2-team"></span><small class="cb2-id"></small><span class="cb2-name"></span><span class="cb2-top3"></span>'
        + '<span class="cb2-role"></span><span class="cb2-heroes"></span><span class="cb2-stats"></span>'
        + '<i class="cb2-back"><span class="cb2-bk cb2-bk--logo"></span>'
        + '<span class="cb2-bk cb2-bk--stats"></span><span class="cb2-bk cb2-bk--heroes"></span><span class="cb2-bk cb2-bk--form"></span></i></i>'
      // .cb2-tab — «Закладка сзади»: полоса за картой, выступает справа (снаружи формы, поэтому не в кольцах)
      cardEl.innerHTML = '<i class="cb2-aura"></i><i class="cb2-tab"><span class="cb2-pos"></span><b class="cb2-nick"></b><span class="cb2-ovr"><b></b><small>OVR</small></span></i>'
        + [0, ...рамка.кольца].reduceRight((inner, _, i) => `<i class="cb2-ring" data-r="${i}">${inner}</i>`, face)
        + '<img class="cb2-pop" alt="" aria-hidden="true" /><i class="cb2-pop cb2-gpop" aria-hidden="true"><i><i></i></i></i><i class="cb2-glare"></i>'
      cardEl.dataset.built = рамка.id
    }
    ;[wrap, cardEl].forEach((el) => {
      el.dataset.step = o.step
      if (o.step >= 2) { el.dataset.bg = o.bg; el.dataset.tier = o.tier } else { delete el.dataset.bg; delete el.dataset.tier }
      if (o.step >= 3) el.dataset.frame = o.frame; else delete el.dataset.frame
      // «Без фото» и «Без раскладки» — как будто этап не пройден: слоя нет
      if (o.step >= 5 && o.art !== 'none') el.dataset.art = o.art; else delete el.dataset.art
      if (o.step >= 5 && o.art !== 'none' && o.halo === 'on') el.dataset.halo = ''; else delete el.dataset.halo
      if (o.step >= 7 && o.layout !== 'none') el.dataset.layout = o.layout; else delete el.dataset.layout
      if (o.step >= 4) el.dataset.fx = o.fx; else delete el.dataset.fx
      el.dataset.font = o.font; el.dataset.slant = o.slant; el.dataset.back = o.back
      if (o.player === 'undefined') el.dataset.nophoto = ''; else delete el.dataset.nophoto
      const есть = (v) => o.step >= 8 && v !== 'none'
      if (есть(o.heroes)) el.dataset.heroes = o.heroes; else delete el.dataset.heroes
      if (o.step >= 8 && o.heroes === 'none') el.dataset.heroesOff = ''; else delete el.dataset.heroesOff
      if (есть(o.stats)) el.dataset.stats = o.stats; else delete el.dataset.stats
      if (есть(o.role)) el.dataset.role = o.role; else delete el.dataset.role
      // Номер карты до этапа 7 — «у ника», как раньше; на этапе 7 — выбранный вид
      const номер = o.step >= 8 ? (o.serial === 'band' && o.layout === 'r30b' ? 'text' : o.serial) : 'text'
      if (номер !== 'none') el.dataset.serial = номер; else delete el.dataset.serial
      if (есть(o.heroes) || есть(o.stats) || есть(o.role)) el.dataset.info = ''; else delete el.dataset.info
    })
    const p = S.p[o.shape]
    // Кольца: первое — кольцо 0 (не первый ребёнок карты: перед ним лежит закладка .cb2-tab), дальше — вглубь
    let d = 0, el = null
    ;[0, ...рамка.кольца, рамка.фон].forEach((x, i) => {
      el = i ? el.firstElementChild : cardEl.querySelector(':scope > .cb2-ring'); d += x
      el.style.inset = e(x); стиль(el, o.shape, p, d)
    })
    стиль(cardEl.querySelector('.cb2-glare'), o.shape, p, 0)
    // Фото: в фоне и копия головы над краем; --d — отступ фона от края карты (для копии головы в координатах карты)
    cardEl.style.setProperty('--d', e(d))
    const src = `img/players/${o.player}.webp`
    // Логотип команды игрока — для фона «Логотип команды»
    cardEl.style.setProperty('--logo', `url(img/teams/${o.team}.png)`)
    // Оборот: логотип команды, ник, номер карты
    // Оборот (этап 9, макеты): заполняем все виды, показывает CSS по data-back
    const back = cardEl.querySelector('.cb2-back'), д = ДАННЫЕ[o.player], ник = имя(ИГРОКИ, o.player), номер = `${СЕЗОН} · #${д.id} / ${ТИРАЖ}`
    if (back.dataset.for !== o.player + o.team) {
      back.dataset.for = o.player + o.team
      const шапка = (что) => `<b>${что}</b><small>${ник} · ${номер}</small>`
      back.querySelector('.cb2-bk--logo').innerHTML = `<img src="img/teams/${o.team}.png" alt="" /><b>${ник}</b><small>${номер}</small>`
      // Виды с кнопкой: шапка сверху, статистика, внизу кнопка на страницу игрока (клик — app.js ниже, не переворачивает карту)
      const кнопка = '<span class="cb2-bk-btn" role="link" data-href="player.html">Страница игрока →</span>'
      const форма = ФОРМА[o.player] || ФОРМА.undefined, побед = [...форма].filter((x) => x === 'В').length
      const матчей = д.heroes.reduce((n, h) => n + h[4], 0), вр = Math.round(д.heroes.reduce((n, h) => n + h[4] * h[5], 0) / матчей)
      back.querySelector('.cb2-bk--stats').innerHTML = шапка('Статистика')
        + `<div class="cb2-bk-sum"><span><b>${д.ovr}</b><small>Рейтинг</small></span><span><b>${матчей}</b><small>Матчей</small></span><span><b>${вр}%</b><small>Винрейт</small></span></div>`
        + `<ul class="cb2-bk-bars">${д.stats.map((v, i) => `<li><span>${СТАТЫ_ИМЯ[i]}</span><i style="--v: ${v}%"></i><b data-l="${уровень(v)}">${v}</b></li>`).join('')}</ul>` + кнопка
      back.querySelector('.cb2-bk--heroes').innerHTML = шапка('Лучшие герои')
        + `<ul class="cb2-bk-heroes">${д.heroes.map(([id, n, , , м, в]) => `<li><img src="img/heroes/${id}.webp" alt="" /><span><b>${n}</b><small>${м} матчей</small></span><em>${в}%</em><i style="--v: ${в}%"></i></li>`).join('')}</ul>`
        + `<div class="cb2-bk-sum"><span><b>${матчей}</b><small>Матчей</small></span><span><b>${вр}%</b><small>Винрейт</small></span><span><b>${д.pos}</b><small>${РОЛИ[д.pos]}</small></span></div>` + кнопка
      back.querySelector('.cb2-bk--form').innerHTML = шапка(СЕЗОН)
        + `<div class="cb2-bk-sum"><span><b>${д.ovr}</b><small>Рейтинг</small></span><span><b>${побед}–${10 - побед}</b><small>Победы – поражения</small></span></div>`
        + `<p class="cb2-bk-lbl">Последние 10 матчей</p><ol class="cb2-bk-form">${[...форма].map((x) => `<li data-w="${x === 'В'}">${x}</li>`).join('')}</ol>`
        + `<ul class="cb2-bk-bars">${д.stats.slice(0, 3).map((v, i) => `<li><span>${СТАТЫ_ИМЯ[i]}</span><i style="--v: ${v}%"></i><b data-l="${уровень(v)}">${v}</b></li>`).join('')}</ul>` + кнопка
    }
    if (o.step >= 5 && o.art !== 'none' && o.player !== 'undefined') {
      cardEl.querySelectorAll('img.cb2-ph, .cb2-pop').forEach((img) => { if (img.getAttribute('src') !== src) img.src = src })
      // Подложка под фото (фон «Логотип команды») — силуэт игрока маской
      cardEl.style.setProperty('--ph', `url(${src})`)
    }
    if (o.step >= 7 && o.layout !== 'none') {
      const x = ДАННЫЕ[o.player], все = (c, f) => cardEl.querySelectorAll(c).forEach(f)
      все('.cb2-ovr b', (el) => { el.textContent = x.ovr }); все('.cb2-pos', (el) => { el.textContent = `POS ${x.pos}` })
      все('.cb2-nick', (el) => { el.textContent = ИГРОКИ.find(([id]) => id === o.player)[1] })
      cardEl.querySelector('.cb2-team').textContent = имяКоманды(o.team)
      cardEl.querySelector('.cb2-flag').className = `player-card__flag player-card__flag--${x.flag} cb2-flag`
      // «Полоса: рейтинг…» (r30, r30b): номер карты в сезоне, настоящее имя, три лучших героя иконками — матчи (М) и винрейт
      cardEl.querySelector('.cb2-id').innerHTML = `<em>${СЕЗОН}</em><b>#${x.id}</b><small>/ ${ТИРАЖ}</small>`
      cardEl.querySelector('.cb2-name').textContent = x.name
      cardEl.querySelector('.cb2-top3').innerHTML = x.heroes.map(([id, n, , , м, вр], i) =>
        `<span${i === 2 ? ' class="is-best"' : ''}><img src="img/heroes/${id}.webp" alt="${n}" /><small>${м} М</small><small>${вр}%</small></span>`).join('')
    }
    if (o.step >= 8) {
      const x = ДАННЫЕ[o.player]
      cardEl.querySelector('.cb2-heroes').innerHTML = x.heroes.map(([id, n, доля, бонус], i) =>
        `<span class="cb2-hero${i === 2 ? ' is-best' : ''}"><img src="img/heroes/${id}.webp" alt="" /><b>${n}</b><small>${доля} % карт</small><em>+${бонус}%</em></span>`).join('')
      cardEl.querySelector('.cb2-role').innerHTML = `<span class="cb2-role__main"><i class="cb2-role__pos"><small>POS</small><b>${x.pos}</b></i><span class="cb2-role__name">${РОЛИ[x.pos]}</span></span>`
        + `<span class="cb2-role__team"><img src="img/teams/${o.team}.png" alt="" /><span>${имяКоманды(o.team)}</span></span>`
      cardEl.querySelector('.cb2-stats').innerHTML = x.stats.map((v, i) => `<span style="--v: ${v}"><b data-l="${уровень(v)}">${v}</b><small>${СТАТЫ[i]}</small></span>`).join('')
    }
    // Окно — по форме карты: внешний слой — кант, внутренний — фото. Высоту окна даёт сетка (место над данными), отступы — CSS
    const art = cardEl.querySelector('.cb2-art'), win = cardEl.querySelector('.cb2-win')
    // Окно — форма карты с дополнительным скруглением/срезом (как у внешнего края, без вычета отступа окна)
    if (o.step >= 5 && o.art === 'window') { стиль(art, o.shape, p, d); стиль(win, o.shape, p, d + .14) } else [art, win].forEach((x) => стиль(x))
    // Панель «Полосы справа» не заходит в срезы и скругления формы: отступы сверху и снизу — по форме (em фона)
    const faceEl = cardEl.querySelector('.cb2-face'), к = Math.max(p - d * .4, 0)
    const [cutT, cutB] = { round: [Math.max(p - d, 0), Math.max(p - d, 0)], cut4: [к, к], cut2: [к, к], asym: [Math.max(p - d, 0), Math.max(p - d, 0) * 1.35], chamfer: [к, 1.6], ticket: [p, p] }[o.shape]
    faceEl.style.setProperty('--cut-t', e(cutT + .45)); faceEl.style.setProperty('--cut-b', e(cutB + .45))
    // Нижние углы по отдельности — левый и правый отступ инфо: у асимметрии большой только правый, у среза по диагонали — только левый
    const R = Math.max(p - d, 0), [cutBL, cutBR] = { round: [R, R], cut4: [к, к], cut2: [к, 0], asym: [Math.max(.8 - d, 0), R * 1.35], chamfer: [1.6, 1.6], ticket: [p, p] }[o.shape]
    faceEl.style.setProperty('--cut-bl', e(cutBL + .45)); faceEl.style.setProperty('--cut-br', e(cutBR + .45))
    // Нижний отступ инфо — ровно сколько нужно, чтобы угол строки не зашёл в срез/скругление при боковом отступе pad:
    // срез 45° — c − pad, скругление радиуса r — r − √(r² − (r − pad)²), вогнутый угол билета — √(r² − pad²). У «Полосы справа» правый угол занят полосой — его не считаем
    const скругл = { round: true, asym: true, chamfer: true, ticket: false, cut4: false, cut2: false }[o.shape]
    const нужно = (c) => { const pad = Math.max(1.2, (c + .45) * .5); if (pad >= c) return 0; if (o.shape === 'ticket') return Math.sqrt(c * c - pad * pad); return скругл ? c - Math.sqrt(c * c - (c - pad) ** 2) : c - pad }
    const углы = [cutBL, ...(o.step >= 7 && ['strip', 'r30', 'r30b'].includes(o.layout) ? [] : [cutBR])]
    faceEl.style.setProperty('--mb', e(Math.max(1.3, ...углы.map((c) => нужно(c) + .5))))
    // Левый верхний угол — место рейтинга и флага: у «Среза по диагонали» он не срезан, число можно поднять выше
    const cutTL = { round: Math.max(p - d, 0), cut4: к, cut2: 0, asym: Math.max(p - d, 0), chamfer: к, ticket: p }[o.shape]
    faceEl.style.setProperty('--cut-tl', e(cutTL + .45))
  }

  // Панели этапов: плитки (мини-карта — та же карта 440px, уменьшенная) и подписи
  const plate = (attr, id, имя) => `<button type="button" class="cb2-tile" data-${attr}="${id}"><span class="cb2-outline cb2-outline--mini">${КАРТА}</span><span>${имя}</span></button>`
  const shapes = root.querySelector('[data-cb2-shapes]')
  const bgs = root.querySelector('[data-cb2-bgs]')
  const frames = root.querySelector('[data-cb2-frames]')
  const tiers = root.querySelector('[data-cb2-tiers]')
  shapes.innerHTML = ФОРМЫ.map((f) => plate('shape', f.id, f.имя)).join('')
  bgs.innerHTML = ФОНЫ.map(([id, имя]) => plate('bg', id, имя)).join('')
  frames.innerHTML = РАМКИ.map((r) => plate('frame', r.id, r.имя)).join('')
  const arts = root.querySelector('[data-cb2-arts]')
  const halos = root.querySelector('[data-cb2-halos]')
  const teams = root.querySelector('[data-cb2-teams]')
  const fonts = root.querySelector('[data-cb2-fonts]')
  const slants = root.querySelector('[data-cb2-slants]')
  slants.innerHTML = НАКЛОН.map(([id, имя]) => `<button type="button" data-slant="${id}">${имя}</button>`).join('')
  fonts.innerHTML = ШРИФТЫ.map(([id, крупный, текст]) => `<button type="button" data-font="${id}"><b>9Class 95</b><span>Эдгар Налдакян · PARIVISION</span><small>${крупный} + ${текст}</small></button>`).join('')
  teams.innerHTML = КОМАНДЫ.map(([id, имя]) => `<button type="button" data-team="${id}" title="${имя}"><img src="img/teams/${id}.png" alt="${имя}" /></button>`).join('')
  halos.innerHTML = СВЕЧЕНИЕ.map(([id, имя]) => `<button type="button" data-halo="${id}">${имя}</button>`).join('')
  const players = root.querySelector('[data-cb2-players]')
  arts.innerHTML = ФОТО.map(([id, имя]) => plate('art', id, имя)).join('')
  const layouts = root.querySelector('[data-cb2-layouts]')
  layouts.innerHTML = РАСКЛАДКИ.map(([id, имя]) => plate('layout', id, имя)).join('')
  const heroesEl = root.querySelector('[data-cb2-heroes]'), statsEl = root.querySelector('[data-cb2-stats]'), rolesEl = root.querySelector('[data-cb2-roles]')
  rolesEl.innerHTML = РОЛЬ_ВИД.map(([id, имя]) => plate('role', id, имя)).join('')
  const serialsEl = root.querySelector('[data-cb2-serials]')
  serialsEl.innerHTML = НОМЕР_ВИД.map(([id, имя]) => plate('serial', id, имя)).join('')
  heroesEl.innerHTML = ГЕРОИ_ВИД.map(([id, имя]) => plate('heroes', id, имя)).join('')
  statsEl.innerHTML = СТАТЫ_ВИД.map(([id, имя]) => plate('stats', id, имя)).join('')
  const fxs = root.querySelector('[data-cb2-fxs]')
  fxs.innerHTML = ЭФФЕКТЫ.map(([id, имя]) => plate('fx', id, имя)).join('')
  players.innerHTML = ИГРОКИ.map(([id, имя]) => plate('player', id, имя)).join('')
  const backs = root.querySelector('[data-cb2-backs]')
  backs.innerHTML = ОБОРОТ.map(([id, имя]) => plate('back', id, имя)).join('')
  backs.querySelectorAll('.cb2-outline').forEach((o) => o.classList.add('is-back'))
  tiers.innerHTML = СИЛА.map(([id, имя]) => `<button type="button" data-tier="${id}">${имя}</button>`).join('')
  // Идеальная карта (дирижёр 30.09) — выбранные решения помечены зелёной рамкой в панелях этапов
  const ИДЕАЛ = { shape: 'round', bg: 'logo', frame: 'bevel', fx: 'legend', art: 'pop', halo: 'on', layout: 'r30', font: 'archivo', role: 'even', serial: 'neon', heroes: 'icons', stats: 'grid' }
  Object.entries(ИДЕАЛ).forEach(([k, v]) => root.querySelectorAll(`.cb2-side button[data-${k}="${v}"]`).forEach((b) => { b.classList.add('is-ideal'); b.title ||= 'Решение: идеальная карта' }))

  const stage = root.querySelector('.cb2-stage > .cb2-outline')
  const caption = root.querySelector('[data-cb2-caption]')
  const имя = (list, id) => { const x = list.find((y) => (y.id ?? y[0]) === id); return x?.имя ?? x?.[1] }
  // Карточка-референс Arcane рядом со сборкой — показать / скрыть (кнопка в шапке панели)
  const refBtn = root.querySelector('[data-cb2-ref]'), refCard = root.querySelector('.cb2-ref')
  refBtn.addEventListener('click', () => { S.ref = S.ref === 'off' ? 'on' : 'off'; draw() })
  function draw() {
    refCard.hidden = S.ref === 'off'; refBtn.setAttribute('aria-pressed', String(S.ref !== 'off'))
    if (ПОЛОСЫ.includes(S.layout) && НЕ_В_ПОЛОСУ.includes(S.heroes)) S.heroes = 'icons'
    нарисовать(stage, { ...S, step: шаг() })
    stage.classList.toggle('is-bad', НЕЛЬЗЯ.some((пара) => пара.every(([k, x]) => S[k] === x)) && шаг() >= 7)
    shapes.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.shape === S.shape)); t.classList.toggle('is-bad', запрет(S, 'shape', t.dataset.shape)); t.title = t.classList.contains('is-bad') ? `Не сочетается с раскладкой «${имя(РАСКЛАДКИ, S.layout)}»` : ''; нарисовать(t.firstElementChild, { ...S, shape: t.dataset.shape, step: 1 }) })
    bgs.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.bg === S.bg)); нарисовать(t.firstElementChild, { ...S, bg: t.dataset.bg, step: 2 }) })
    frames.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.frame === S.frame)); нарисовать(t.firstElementChild, { ...S, frame: t.dataset.frame, step: 3 }) })
    arts.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.art === S.art)); t.classList.toggle('is-bad', запрет(S, 'art', t.dataset.art)); t.title = t.classList.contains('is-bad') ? `Не сочетается с раскладкой «${имя(РАСКЛАДКИ, S.layout)}»` : ''; нарисовать(t.firstElementChild, { ...S, art: t.dataset.art, step: 5 }) })
    players.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.player === S.player)); нарисовать(t.firstElementChild, { ...S, player: t.dataset.player, step: 7 }) })
    backs.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.back === S.back)); нарисовать(t.firstElementChild, { ...S, back: t.dataset.back, step: 9 }) })
    halos.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.halo === S.halo)))
    teams.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.team === S.team)))
    fonts.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.font === S.font)))
    slants.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.slant === S.slant)))
    layouts.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.layout === S.layout)); t.classList.toggle('is-bad', запрет(S, 'layout', t.dataset.layout)); t.title = t.classList.contains('is-bad') ? `Не сочетается с ${запрет({ ...S, art: '' }, 'layout', t.dataset.layout) ? `формой «${имя(ФОРМЫ, S.shape)}»` : `фото «${имя(ФОТО, S.art)}»`}` : ''; нарисовать(t.firstElementChild, { ...S, layout: t.dataset.layout, step: 7 }) })
    fxs.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.fx === S.fx)); нарисовать(t.firstElementChild, { ...S, fx: t.dataset.fx, step: 4 }) })
    heroesEl.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.heroes === S.heroes)); t.disabled = ПОЛОСЫ.includes(S.layout) && НЕ_В_ПОЛОСУ.includes(t.dataset.heroes); t.title = t.disabled ? 'Не влезает в полосу раскладки' : ''; нарисовать(t.firstElementChild, { ...S, heroes: t.dataset.heroes, step: 8 }) })
    serialsEl.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.serial === S.serial)); t.disabled = t.dataset.serial === 'band' && S.layout === 'r30b'; t.title = t.disabled ? 'У «Полоса: рейтинг, ник» полоса занята ником' : ''; нарисовать(t.firstElementChild, { ...S, serial: t.dataset.serial, step: 8 }) })
    rolesEl.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.role === S.role)); нарисовать(t.firstElementChild, { ...S, role: t.dataset.role, step: 8 }) })
    statsEl.querySelectorAll('.cb2-tile').forEach((t) => { t.setAttribute('aria-pressed', String(t.dataset.stats === S.stats)); нарисовать(t.firstElementChild, { ...S, stats: t.dataset.stats, step: 8 }) })
    tiers.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tier === S.tier)))
    // Хлебные крошки под картой: принятые решения по этапам, клик — открыть этап
    const крошки = [
      ['1', 'Форма', имя(ФОРМЫ, S.shape)],
      ['2', 'Фон', `${имя(ФОНЫ, S.bg)}, ${имя(СИЛА, S.tier)}, ${имяКоманды(S.team)}`],
      ['3', 'Рамка', имя(РАМКИ, S.frame)],
      ['4', 'Эффекты', имя(ЭФФЕКТЫ, S.fx).split(' —')[0]],
      ['5', 'Фото', S.art === 'none' ? имя(ФОТО, S.art) : `${имя(ФОТО, S.art)}${S.halo === 'on' ? ', свечение' : ''}`],
      ['6', 'Игрок', имя(ИГРОКИ, S.player)],
      ['7', 'Раскладка', `${имя(РАСКЛАДКИ, S.layout)}, ${ШРИФТЫ.find(([id]) => id === S.font).slice(1).join(' + ')}${S.slant === 'all' ? ', наклон' : ''}`],
      ['8', 'Инфо', `${S.role === 'none' ? '' : `Позиция ${имя(РОЛЬ_ВИД, S.role).toLowerCase()}, `}${ПОЛОСЫ.includes(S.layout) ? `номер ${имя(НОМЕР_ВИД, S.serial).toLowerCase()}, ` : ''}${имя(ГЕРОИ_ВИД, S.heroes)}, ${имя(СТАТЫ_ВИД, S.stats)}`],
    ].filter(([n]) => +n <= шаг())
    caption.innerHTML = крошки.map(([n, этап, что]) => `<button type="button" data-cb2-go="${n}"${n === S.step ? ' aria-current="step"' : ''}><small>${этап}</small>${что}</button>`).join('<i>·</i>')
    сохранить()
  }

  // Этапы — вкладки слева сверху
  let сторона = () => {}
  const открыть = (step) => {
    S.step = step; S.reached = Math.max(S.reached, +step); сторона(step)
    root.querySelectorAll('[data-cb2-step]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cb2Step === step)))
    root.querySelectorAll('[data-cb2-panel]').forEach((p) => { p.hidden = p.dataset.cb2Panel !== step })
    draw()
  }
  root.querySelector('.cb2-steps').addEventListener('click', (ev) => { const b = ev.target.closest('[data-cb2-step]'); if (b) открыть(b.dataset.cb2Step) })
  caption.addEventListener('click', (ev) => { const b = ev.target.closest('[data-cb2-go]'); if (b) открыть(b.dataset.cb2Go) })
  root.querySelector('[data-cb2-reset]').addEventListener('click', () => { S = { ...НАЧАЛО, p: S.p }; открыть('1') })
  // Случайная карта: по одному варианту на каждом этапе, без «пустых» вариантов и плохих сочетаний; открывает последний этап
  const любой = (list) => { const x = list[Math.floor(Math.random() * list.length)]; return x.id ?? x[0] }
  root.querySelector('[data-cb2-random]').addEventListener('click', () => {
    do {
      // Первый вариант в списке — «пусто» (чистый фон, без рамки, без блеска, без фото…): в случайную карту не берём, всегда что-то выбрано
      Object.assign(S, { shape: любой(ФОРМЫ), bg: любой(ФОНЫ.slice(1)), tier: любой(СИЛА), frame: любой(РАМКИ.slice(1)), fx: любой(ЭФФЕКТЫ.slice(1)), art: любой(ФОТО.slice(1)),
        player: любой(ИГРОКИ), layout: любой(РАСКЛАДКИ.slice(1)), heroes: любой(ГЕРОИ_ВИД.slice(1)), stats: любой(СТАТЫ_ВИД.slice(1)), role: любой(РОЛЬ_ВИД) })
    } while (НЕЛЬЗЯ.some((пара) => пара.every(([k, x]) => S[k] === x)))
    S.reached = 8
    открыть('8')
  })
  shapes.addEventListener('click', (ev) => { const t = ev.target.closest('[data-shape]'); if (t) { S.shape = t.dataset.shape; draw(); предупредить() } })
  bgs.addEventListener('click', (ev) => { const t = ev.target.closest('[data-bg]'); if (t) { S.bg = t.dataset.bg; draw() } })
  frames.addEventListener('click', (ev) => { const t = ev.target.closest('[data-frame]'); if (t) { S.frame = t.dataset.frame; draw() } })
  tiers.addEventListener('click', (ev) => { const b = ev.target.closest('[data-tier]'); if (b) { S.tier = b.dataset.tier; draw() } })
  // Выбрали вариант, с которым несовместим уже выбранный — второй сбрасываем к началу
  // Снекбар о плохом сочетании: снизу холста, сам гаснет через 4 с
  const snack = root.querySelector('[data-cb2-snack]')
  let snackT = 0
  const предупредить = () => {
    if (!плохая()) return
    const [[k1, v1], [k2, v2]] = плохая()
    snack.textContent = `${ЧТО[k1][0]} «${имя(ЧТО[k1][1](), v1)}» и ${ЧТО[k2][0].toLowerCase()} «${имя(ЧТО[k2][1](), v2)}» не сочетаются — такое решение в будущем будет заблокировано`
    snack.hidden = false; clearTimeout(snackT); snackT = setTimeout(() => { snack.hidden = true }, 4000)
  }
  arts.addEventListener('click', (ev) => { const t = ev.target.closest('[data-art]'); if (t) { S.art = t.dataset.art; draw(); предупредить() } })
  heroesEl.addEventListener('click', (ev) => { const t = ev.target.closest('[data-heroes]'); if (t) { S.heroes = t.dataset.heroes; draw() } })
  serialsEl.addEventListener('click', (ev) => { const t = ev.target.closest('[data-serial]'); if (t && !t.disabled) { S.serial = t.dataset.serial; draw() } })
  rolesEl.addEventListener('click', (ev) => { const t = ev.target.closest('[data-role]'); if (t) { S.role = t.dataset.role; draw() } })
  statsEl.addEventListener('click', (ev) => { const t = ev.target.closest('[data-stats]'); if (t) { S.stats = t.dataset.stats; draw() } })
  fxs.addEventListener('click', (ev) => { const t = ev.target.closest('[data-fx]'); if (t) { S.fx = t.dataset.fx; draw() } })
  layouts.addEventListener('click', (ev) => { const t = ev.target.closest('[data-layout]'); if (t) { S.layout = t.dataset.layout; draw(); предупредить() } })
  players.addEventListener('click', (ev) => { const b = ev.target.closest('[data-player]'); if (b) { S.player = b.dataset.player; S.team = ДАННЫЕ[S.player].logo ?? S.team; draw() } })
  slants.addEventListener('click', (ev) => { const b = ev.target.closest('[data-slant]'); if (b) { S.slant = b.dataset.slant; draw() } })
  fonts.addEventListener('click', (ev) => { const b = ev.target.closest('[data-font]'); if (b) { S.font = b.dataset.font; draw() } })
  teams.addEventListener('click', (ev) => { const b = ev.target.closest('[data-team]'); if (b) { S.team = b.dataset.team; draw() } })
  backs.addEventListener('click', (ev) => { const t = ev.target.closest('[data-back]'); if (t) { S.back = t.dataset.back; draw() } })
  halos.addEventListener('click', (ev) => { const b = ev.target.closest('[data-halo]'); if (b) { S.halo = b.dataset.halo; draw() } })

  // Большая заготовка крутится за курсором, как карта на сайте (tilt — выше, [Карточка])
  tilt(stage)
  // Клик по большой карте — переворот: доворачиваем до ребра, меняем сторону (.is-back), выходим с другого ребра
  // Этап 9 «Оборот» сам поворачивает карту оборотом, уход с него — обратно лицом
  let перевёрнута = false, идёт = false
  const перевернуть = () => {
    if (идёт) return
    идёт = true
    stage.style.transition = 'transform .2s ease-in'; stage.style.setProperty('--flip', '90deg')
    setTimeout(() => {
      перевёрнута = !перевёрнута; stage.classList.toggle('is-back', перевёрнута)
      stage.style.transition = 'none'; stage.style.setProperty('--flip', '-90deg'); stage.getBoundingClientRect()
      stage.style.transition = 'transform .25s ease-out'; stage.style.setProperty('--flip', '0deg')
      setTimeout(() => { stage.style.transition = ''; идёт = false }, 260)
    }, 200)
  }
  // Кнопка «Страница игрока» на обороте — переход, карту не переворачивает
  stage.addEventListener('click', (ev) => { const b = ev.target.closest('.cb2-bk-btn'); if (b) location.href = b.dataset.href; else перевернуть() })
  сторона = (step) => { if ((step === '9') !== перевёрнута) перевернуть() }
  открыть(S.step)
})

// === Сундук: анпакинг (шаги data-step на .unp: idle → charge → burst → reveal → walkout → summary) ===
document.querySelectorAll('#unpacking-stage .unp').forEach((box) => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  const HOLD = calm ? 400 : 1200 // мс удержания до вскрытия
  const chest = box.querySelector('.unp-chest')
  const slots = [...box.querySelectorAll('.unp-slot')]
  const legend = box.querySelector('.unp-slot[data-rarity="legend"]')
  const timers = []
  let charge = 0, holding = false, last = 0, raf = 0

  const step = (s) => { box.dataset.step = s }
  const later = (fn, ms) => timers.push(setTimeout(fn, calm ? 0 : ms))
  const setCharge = (v) => { charge = Math.max(0, Math.min(1, v)); box.style.setProperty('--charge', charge.toFixed(3)) }

  const tick = (t) => {
    const dt = t - last
    last = t
    setCharge(charge + (holding ? dt / HOLD : -dt / 400))
    if (charge >= 1) { holding = false; step('burst'); later(() => step('reveal'), 900); return }
    if (charge <= 0 && !holding) { step('idle'); return }
    raf = requestAnimationFrame(tick)
  }
  const press = () => {
    if (!['idle', 'charge'].includes(box.dataset.step)) return
    holding = true
    step('charge')
    cancelAnimationFrame(raf)
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }
  const release = () => { holding = false }
  chest.addEventListener('pointerdown', (e) => { chest.setPointerCapture(e.pointerId); press() })
  ;['pointerup', 'pointercancel'].forEach((ev) => chest.addEventListener(ev, release))
  chest.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press() } })
  chest.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') release() })

  const checkLast = () => box.classList.toggle('is-last', slots.every((s) => s === legend || s.classList.contains('is-open')))
  const openAll = () => { slots.forEach((s) => s.classList.add('is-open')); box.classList.add('is-last') }
  const walkout = () => {
    legend.classList.add('is-open')
    step('walkout')
    ;[1, 2, 3, 4].forEach((w) => later(() => { box.dataset.w = w }, w * 700))
  }
  const summary = () => { timers.splice(0).forEach(clearTimeout); cancelAnimationFrame(raf); holding = false; setCharge(1); openAll(); box.dataset.w = 4; step('summary') }
  const reset = () => {
    timers.splice(0).forEach(clearTimeout)
    slots.forEach((s) => s.classList.remove('is-open'))
    box.classList.remove('is-last')
    delete box.dataset.w
    setCharge(0)
    step('idle')
  }

  box.addEventListener('click', (e) => {
    const back = e.target.closest('.unp-back')
    if (back && ['burst', 'reveal'].includes(box.dataset.step)) {
      const slot = back.closest('.unp-slot')
      if (box.dataset.step === 'burst') step('reveal')
      if (slot !== legend) { slot.classList.add('is-open'); checkLast() }
      else if (box.classList.contains('is-last')) walkout()
    }
    if (e.target.closest('[data-unp-all]')) { slots.forEach((s) => s !== legend && s.classList.add('is-open')); checkLast() }
    if (e.target.closest('[data-unp-skip], [data-unp-summary]')) summary()
    if (e.target.closest('[data-unp-again]')) reset()
  })
})

// === Онбординг (главная): страница onboarding.html — модалка поверх главной (blocks/app/onboarding.html). Выход («Пропустить»,
// «На главную», Esc) — на index.html. Шаг 2 ждёт от сцены бустера (iframe, ?embed, booster.js) сообщения 'chest-opened' ===
document.querySelectorAll('[data-onb2]').forEach((ob) => {
  const $ = (sel) => ob.querySelector(sel), $$ = (sel) => [...ob.querySelectorAll(sel)]
  const m = $('.onb2__m')
  let шаг = 1
  const go = (n) => {
    шаг = n; m.dataset.at = n
    $$('[data-onb-step]').forEach((st) => { st.hidden = +st.dataset.onbStep !== n })
    $$('.onb2__dots i').forEach((d, i) => d.classList.toggle('is-on', i < n))
    $('[data-onb-n]').textContent = `${n} из 6`
    if (n === 2 && !$('[data-onb-chest]').getAttribute('src')) $('[data-onb-chest]').src = 'chest.html?form=booster&embed'
  }
  const close = () => { location.href = 'index.html' }
  const done = (st) => { $(`[data-onb-step="${st}"] [data-onb-next]`).disabled = false }
  ob.addEventListener('click', (e) => {
    if (e.target.closest('[data-onb-next]')) go(шаг + 1)
    if (e.target.closest('[data-onb-close]')) close()
    const team = e.target.closest('.onb2-team')
    if (team) { $$('.onb2-team').forEach((x) => x.setAttribute('aria-checked', String(x === team))); $('[data-onb-guar]').textContent = `Игрок ${team.dataset.team}`; done(1) }
    if (e.target.closest('[data-onb-auto]')) {
      $$('.onb2-slot__place').forEach((p) => { const t = p.querySelector('template'); p.replaceChildren(t.content.cloneNode(true)); p.querySelectorAll('.player-card[data-tilt]').forEach(tilt) })
      e.target.disabled = true; done(3)
    }
    const h = e.target.closest('.onb2-h')
    if (h) { $$('.onb2-h').forEach((x) => x.setAttribute('aria-checked', String(x === h))); done(4) }
    const ml = e.target.closest('[data-onb-ml] .btn')
    if (ml) { $$('[data-onb-ml] .btn').forEach((x) => x.setAttribute('aria-pressed', String(x === ml))); done(5) }
  })
  addEventListener('message', (e) => { if (e.data === 'chest-opened') { done(2); $('[data-onb-chest-hint]').textContent = 'Карты в коллекции' } })
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
  go(1)
})

// === Главная сайта: список матчей (вкладки, статус, игра, Fantasy, избранное, свернуть турнир), лучшие игроки, голосования,
// разбивка рейтинга, замена в пятёрке, live-тик и таймеры, плашка «скоро» (blocks/app/*). Стили — styles.css [=== Главная сайта ===].
;(() => {
  if (!document.querySelector('.ui-header')) return
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const pad = (n) => String(n).padStart(2, '0')

  // Текущий раздел шапки — по адресу страницы (шапка одна на все страницы); у матча и игрока — их разделы
  const стр = location.pathname.split('/').pop() || 'index.html'
  const раздел = { 'match.html': 'schedule.html', 'match-page.html': 'match-center.html', 'player.html': 'gallery.html' }[стр] || стр
  $$('.ui-header__nav a, .ui-tabbar a').forEach((a) => { if (a.getAttribute('href') === раздел) a.setAttribute('aria-current', 'page') })
  // Экраны финала (.fin): выбор в голосовании и вопросах прогноза — внутри своей группы
  document.addEventListener('click', (e) => {
    const б = e.target.closest('.fin .js-pick'); if (!б) return
    $$('.js-pick', б.parentElement).forEach((x) => { x.setAttribute('aria-pressed', String(x === б)); x.classList.toggle('is-on', x === б) })
  })

  // Плашка «скоро» для разделов и действий, которых ещё нет (data-soon)
  const toast = Object.assign(document.createElement('div'), { className: 'ui-toast', role: 'status' })
  document.body.append(toast)
  let toastT
  const soon = (what) => {
    toast.textContent = `«${what}» — скоро`
    toast.classList.add('is-on')
    clearTimeout(toastT)
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2200)
  }

  // Список матчей: что показать — вкладка (все / избранное / мои), статус (live / завершённые / предстоящие), игра из шапки
  const box = document.querySelector('[data-matches]')
  const S = { list: 'all', status: null, game: 'dota' }
  const apply = () => {
    if (!box) return
    let any = false
    $$('.w-matches__grp', box).forEach((g) => {
      let n = 0
      $$('.w-matches__row', g).forEach((r) => {
        const ok = (!S.status || r.dataset.status === S.status) && (S.list === 'all' || (S.list === 'fav' ? r.hasAttribute('data-fav') : r.hasAttribute('data-mine')))
        r.hidden = !ok
        if (ok) n++
      })
      g.hidden = g.dataset.game !== S.game || !n
      g.querySelector('.w-matches__n').textContent = n
      if (!g.hidden) any = true
    })
    box.querySelector('.w-matches__empty').hidden = any
    $$('[data-list]', box).forEach((t) => t.setAttribute('aria-selected', String(t.dataset.list === S.list)))
    $$('[data-status-filter]', box).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.statusFilter === S.status)))
  }
  const press = (group, btn) => group.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-soon], [data-list-go], [data-list], [data-status-filter], [data-fantasy], [data-game-pick], .star, .w-matches__gh, [data-stat-tab], [data-vote] .btn, .w-perf__row, [data-lineup-swap]')
    if (!t) return
    if (t.dataset.soon) { e.preventDefault(); soon(t.dataset.soon); return }
    if (t.dataset.listGo) { e.preventDefault(); S.list = t.dataset.listGo; apply(); document.querySelector('#app-matches')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    if (t.dataset.list) { S.list = t.dataset.list; apply(); return }
    if (t.dataset.statusFilter) { S.status = S.status === t.dataset.statusFilter ? null : t.dataset.statusFilter; apply(); return }
    if (t.hasAttribute('data-fantasy')) { const on = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', String(on)); box.classList.toggle('is-fantasy', on); return }
    if (t.dataset.gamePick) { press($$('[data-game-pick]'), t); S.game = t.dataset.gamePick; apply(); return }
    if (t.classList.contains('star')) { const on = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', String(on)); t.closest('.w-matches__row').toggleAttribute('data-fav', on); apply(); return }
    if (t.classList.contains('w-matches__gh')) { t.setAttribute('aria-expanded', String(t.getAttribute('aria-expanded') !== 'true')); return }
    if (t.dataset.statTab) {
      const w = t.closest('.w-leaders')
      press($$('[data-stat-tab]', w), t)
      $$('[data-stat]', w).forEach((l) => { l.hidden = l.dataset.stat !== t.dataset.statTab })
      return
    }
    if (t.closest('[data-vote]')) {
      const v = t.closest('[data-vote]')
      press($$('.btn', v), t)
      $$('.btn', v).forEach((b) => b.style.setProperty('--pct', `${b.dataset.pct}%`))
      v.classList.add('is-voted')
      return
    }
    if (t.classList.contains('w-perf__row')) { const open = t.getAttribute('aria-expanded') !== 'true'; t.setAttribute('aria-expanded', String(open)); t.nextElementSibling.hidden = !open; return }
    if (t.hasAttribute('data-lineup-swap')) {
      const w = t.closest('.w-lineup')
      w.querySelector('[data-out]')?.replaceWith(w.querySelector('[data-bench]').content.cloneNode(true))
      w.querySelector('[data-lineup-warn]').hidden = true
    }
  })
  apply()

  // Live: время карты растёт (data-clock, секунды → м:сс), таймеры идут вниз (data-countdown, секунды → ч:мм:сс)
  setInterval(() => {
    $$('[data-clock]').forEach((el) => { const s = +el.dataset.clock + 1; el.dataset.clock = s; el.textContent = `${Math.floor(s / 60)}:${pad(s % 60)}` })
    $$('[data-countdown]').forEach((el) => { const s = Math.max(0, +el.dataset.countdown - 1); el.dataset.countdown = s; el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` })
  }, 1000)
})()

// === Страница игрока: переход с карточки и плашка игрока (blocks/player/page.html). Стили — styles.css [=== Страница игрока ===].
// Переход: карточка стартует по центру экрана поверх затемнения и летит в свой слот в шапке (FLIP). Плашка — когда шапка ушла за экран.
;(() => {
  const root = document.querySelector('#player')
  if (!root) return
  const bar = root.querySelector('[data-pl-bar]'), hero = root.querySelector('[data-pl-hero]')
  if (bar && hero) new IntersectionObserver(([e]) => bar.classList.toggle('is-show', !e.isIntersecting)).observe(hero)

  const card = root.querySelector('[data-pl-slot] .kc, [data-pl-slot] .player-card')
  if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const cover = Object.assign(document.createElement('div'), { className: 'pl-tr' })
  root.append(cover)
  const r = card.getBoundingClientRect()
  const k = Math.min(12, (innerHeight * 0.7) / r.height)
  const dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (r.top + r.height / 2)
  Object.assign(card.style, { position: 'relative', zIndex: 60, transition: 'none', transform: `translate(${dx}px, ${dy}px) scale(${k})` })
  setTimeout(() => {
    cover.classList.add('is-go')
    Object.assign(card.style, { transition: 'transform 900ms cubic-bezier(.2, .8, .2, 1)', transform: '' })
    setTimeout(() => { cover.remove(); ['position', 'z-index', 'transition', 'transform'].forEach((p) => card.style.removeProperty(p)) }, 950)
  }, 500)
})()

// === Карта «Хайперглитч» (blocks/shared/card-hg.html): наклон и блик за курсором, оборот по клику. Стили — styles.css [=== Карта «Хайперглитч» ===].
// Как в лабе «карточка-v3»: --mx/--my — точка курсора в %, --dx/--dy — смещение от центра (−.5….5); оборот — .is-flip у .kc__flip
;(() => {
  const карты = document.querySelectorAll('.hg .kc')
  if (!карты.length) return
  const тихо = matchMedia('(prefers-reduced-motion: reduce)').matches
  карты.forEach((к) => {
    const оборот = к.querySelector('.kc__flip') // у мини-формы оборота нет
    if (оборот) к.addEventListener('click', () => оборот.classList.toggle('is-flip'))
    if (тихо) return
    к.addEventListener('pointermove', (e) => {
      const б = к.getBoundingClientRect(), x = (e.clientX - б.left) / б.width, y = (e.clientY - б.top) / б.height
      к.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); к.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      к.style.setProperty('--dx', (x - 0.5).toFixed(3)); к.style.setProperty('--dy', (y - 0.5).toFixed(3))
      к.classList.add('is-on')
    })
    к.addEventListener('pointerleave', () => { к.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach((v) => к.style.removeProperty(v)) })
  })
})()

// === Онбординг финала (blocks/onboard/flow.html, страница onboarding.html; перенос лабы «онбординг-полный» v1, дирижёр 05.10).
// Сцены по data-go, свет сцены — цвет команды (--otc), бустер сообщает «chest-opened», карты — мини-форма «Жетон». Стили — styles.css [=== Онбординг финала ===].
;(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const root = $('[data-onb3]')
  if (!root) return
  const st = $('[data-st]', root)
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  const домой = () => { location.href = 'index.html' }

  // ——— Данные (условные) ———
  const КОМАНДЫ = [['ts', 'TS', 'Team Spirit', 1], ['tun', 'TUN', 'Tundra Esports', 1], ['pv', 'PV', 'PARIVISION', 1], ['bb', 'BB', 'BetBoom Team', 1],
    ['gg', 'GG', 'Gaimin Gladiators'], ['flc', 'FLC', 'Team Falcons'], ['tl', 'TL', 'Team Liquid'], ['aur', 'AUR', 'Aurora'], ['yg', 'YG', 'Yangon Galacticos'], ['xip', 'XIP', 'Xipto Esports']]
  const БОЛЕЛЬЩИКОВ = { ts: '48 210', tun: '21 940', pv: '17 305', bb: '29 870', gg: '12 480', flc: '15 620', tl: '19 330', aur: '9 870', yg: '3 140', xip: '2 615' }
  const ИГРОКИ = {
    pure: { ник: 'Pure', фото: 'pure', ovr: 93, tier: 'elite', r: 'prism', тег: 'TUN', к: 'tun', флаг: 'ru', pos: 1, герои: ['terrorblade', 'morphling', 'faceless_void'] },
    izdu: { ник: 'izdu', фото: '', ovr: 52, tier: 'bronze', r: 'base', тег: 'XIP', к: 'xip', флаг: 'ru', pos: 2, герои: ['mars', 'lycan', 'hoodwink'] },
    takizawa: { ник: 'takizawa', фото: '', ovr: 70, tier: 'silver', r: 'base', тег: 'VPP', к: '', флаг: 'ru', pos: 3, герои: ['lycan', 'beastmaster', 'mars'] },
    '9class': { ник: '9Class', фото: '9class', ovr: 95, tier: 'elite', r: 'legend', тег: 'PV', к: 'pv', флаг: 'ru', pos: 4, герои: ['tusk', 'rubick', 'hoodwink'] },
    yatoro: { ник: 'Yatoro', фото: 'yatoro', ovr: 88, tier: 'gold', r: 'holo', тег: 'TS', к: 'ts', флаг: 'ua', pos: 5, герои: ['faceless_void', 'terrorblade', 'morphling'] },
  }
  const ПОЗИЦИИ = ['Керри', 'Мид', 'Хардлейн', 'Роумер', 'Саппорт']
  const RU = { base: 'Base', holo: 'Holo', prism: 'Prism', legend: 'Legend' }
  const RC = { base: '--c-muted', holo: '--c-rarity-holo-4', prism: '--c-rarity-holo-5', legend: '--c-tier-gold' }
  const ПАК = ['izdu', 'takizawa', 'yatoro', 'pure', '9class'] // раскрытие: от простых к Legend
  const S = { team: null, rv: 0, pick: null, nick: '', coach: 0, coins: 1000 }

  // Игрок твоей команды; у команды без карты в базе — силуэт на позицию 3 (данных нет, игрок условный)
  const якорь = () => {
    if (!S.team) return null
    const id = Object.keys(ИГРОКИ).find((k) => ИГРОКИ[k].к === S.team[0])
    if (id) return id
    ИГРОКИ.fan = { ник: `Игрок ${S.team[1]}`, фото: '', ovr: 74, tier: 'silver', r: 'holo', тег: S.team[1], к: S.team[0], флаг: 'ru', pos: 3, герои: ['beastmaster', 'mars', 'lycan'] }
    return 'fan'
  }
  const пак = () => { const a = якорь(); return a === 'fan' ? ПАК.map((id) => (id === 'takizawa' ? 'fan' : id)) : ПАК }
  const пятёрка = () => [...пак()].sort((a, b) => ИГРОКИ[a].pos - ИГРОКИ[b].pos)

  // Мини-карта «Жетон» (лаба card-mini v3; стили — styles.css [=== Карта «Хайперглитч» ===]). Логотип есть не у всех команд — у остальных монограмма
  const ЛОГО = new Set(['pv', 'ts', 'tun', 'flc', 'bb', 'gg', 'tl', 'aur', 'yg'])
  const ИМЯ_КОМАНДЫ = Object.fromEntries(КОМАНДЫ.map((t) => [t[0], t[2]]))
  const сила = (ovr) => (ovr >= 90 ? 'elite' : ovr >= 75 ? 'gold' : ovr >= 60 ? 'silver' : 'bronze')
  const картаF = (id) => { const p = ИГРОКИ[id], k = p.к, лого = ЛОГО.has(k)
    const маска = (cl, deco = '') => (лого ? `<i class="logo-mask ${cl}" data-l="2"${deco} style="--logo: url('img/teams/${k}.png')"></i>` : '')
    const ph = `<img class="ph${p.фото ? '' : ' ph--sil'}" data-l="5" src="img/players/${p.фото ? p.фото + '.webp' : '_silhouette.png'}" alt="${p.ник}" />`
    const spark = p.r === 'prism' || p.r === 'legend' ? '<i class="fx fx-spark" data-l="4"><b></b><b></b><b></b><b></b><b></b><b></b></i>' : ''
    const tab = лого ? `<img class="logo" src="img/teams/${k}.png" alt="${ИМЯ_КОМАНДЫ[k]}" />` : `<b class="logo logo--mono">${p.тег}</b>`
    return `<div class="kc mk kc--${сила(p.ovr)} kc--${p.r} m3" data-tilt><div class="kc__in"><div class="kc__face"><div class="mk-plate">${маска('mk-logo')}${маска('mk-logo mk-logo--a', ' data-deco="2"')}${маска('mk-logo mk-logo--b', ' data-deco="2"')}`
      + `<i class="mk-pix" data-deco="1"></i><i class="mk-halo"></i>${ph}<i class="mk-scan" data-deco="3"></i><i class="fx fx-shine" data-l="4"></i>${spark}`
      + `<div class="m3__band"><span class="m3__pos">P${p.pos}</span><span class="m3__nick">${p.ник}</span></div><div class="m3__foot"><b>${ИМЯ_КОМАНДЫ[k] || p.тег}</b></div></div>`
      + `<svg class="mk-frame" viewBox="0 0 160 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="14,1 159,1 159,181 140,199 1,199 1,14" /></svg>`
      + `<div class="m3__tab">${tab}</div><div class="m3__ovr"><b>${p.ovr}</b></div><i class="fx fx-glare"></i></div></div></div>` }
  const аватар = (id, cls = '') => { const p = ИГРОКИ[id]; return p.фото ? `<i class="avatar ${cls}" style="--img: url(img/players/${p.фото}.webp)"></i>` : `<i class="avatar ${cls}">${p.ник[0]}</i>` }
  const лого = (k, m, cls = 'team-logo--lg') => `<i class="team-logo ${cls} t-${k}${k === 'xip' ? '' : ' is-logo'}">${m}</i>`

  // Наклон и блик карт — как app.js сайта [Карточка: наклон и блик]
  const tilt = (root = st) => { if (calm) return
    $$('.kc[data-tilt]:not([data-t])', root).forEach((card) => { card.dataset.t = ''
      card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
        card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
        card.style.setProperty('--dx', (x - .5).toFixed(3)); card.style.setProperty('--dy', (y - .5).toFixed(3)); card.classList.add('is-on') })
      card.addEventListener('pointerleave', () => { card.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach((v) => card.style.removeProperty(v)) }) }) }
  const later = (fn, ms) => setTimeout(fn, calm ? 0 : ms)
  const toast = (t) => { const el = $('[data-toast]', st); el.textContent = t; el.classList.add('is-on'); clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('is-on'), 2600) }
  const num = (n) => n.toLocaleString('ru-RU')

  // ——— Сцены и прогресс ———
  const ШАГ = { hook: 1, team: 2, chest: 3, reveal: 3, grid: 3, five: 4, pred: 5, save: 6, tour: 7, home: 7, final: 8 }
  const go = (sc) => {
    if (sc === 'home') return домой() // «На главную» — настоящая главная сайта
    const view = sc
    st.dataset.scene = sc
    st.classList.toggle('is-home', sc === 'home')
    $$('[data-sc]', st).forEach((s) => { s.hidden = s.dataset.sc !== view })
    $('[data-prog]', st).style.width = `${(ШАГ[sc] / 8) * 100}%`
    if (sc === 'chest' && !$('[data-chest]').src) $('[data-chest]').src = 'chest.html?form=booster&embed' // бустер Claude-B (страница chest)
    if (sc === 'reveal') showCard(S.rv)
    if (sc === 'grid') renderGrid()
    if (sc === 'five') renderFive()
    if (sc === 'save') renderSave()
    if (sc === 'tour') { renderHome(); requestAnimationFrame(() => coach(S.coach)) }
    if (sc === 'final') renderFinal()
    tilt()
  }
  st.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b && !b.disabled) go(b.dataset.go) })
  $('[data-skip]').addEventListener('click', домой)
  addEventListener('keydown', (e) => { if (e.key === 'Escape') домой() })
  $('[data-login]').addEventListener('click', () => toast('Вход — Steam, Google или Telegram, тот же экран, что на шаге «Сохрани»'))

  // 1 · Хук: три карты веером
  $('[data-fan]').insertAdjacentHTML('beforeend', ['pure', '9class', 'yatoro'].map(картаF).join(''))

  // 2 · Команда: популярные крупно, остальные рядом; выбор красит сцену
  const кнопка = ([k, m, n]) => `<button class="team t-${k}" type="button" role="radio" aria-checked="false" data-team="${k}">${лого(k, m)}<span>${n}<small>${БОЛЕЛЬЩИКОВ[k] ? `<br>${БОЛЕЛЬЩИКОВ[k]} болельщиков` : ''}</small></span></button>`
  $('[data-teams]').innerHTML = `<span class="teams__l">Популярные</span><div class="teams__row teams__row--top">${КОМАНДЫ.filter((t) => t[3]).map(кнопка).join('')}</div>
    <span class="teams__l">Остальные</span><div class="teams__row teams__row--rest">${КОМАНДЫ.filter((t) => !t[3]).map(кнопка).join('')}</div>`
  const pickTeam = (k) => {
    S.team = КОМАНДЫ.find((t) => t[0] === k)
    $$('.team', st).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.team === k)))
    st.style.setProperty('--otc', `var(--c-team-${k})`)
    $('[data-team-next]').disabled = false
    $('[data-chest-team]').innerHTML = `Игрок <b>${S.team[2]}</b>`
    S.nick = `${S.team[2].split(' ').pop()}_фан`
  }
  $('[data-teams]').addEventListener('click', (e) => { const b = e.target.closest('.team'); if (b) pickTeam(b.dataset.team) })
  $('[data-noteam]').addEventListener('click', () => { S.team = null; st.style.removeProperty('--otc'); $('[data-chest-team]').textContent = 'Игроки, у которых сегодня матч'; go('chest') })

  // 3 · Сундук: сцена сообщает, что карты раскрыты → карты по одной
  addEventListener('message', (e) => { if (e.data === 'chest-opened' && st.dataset.scene === 'chest') later(() => go('reveal'), 400) })

  // 3б · Карты по одной
  const showCard = (i) => {
    const ids = пак(), id = ids[i], p = ИГРОКИ[id], моя = id === якорь()
    S.rv = i
    $('[data-rv]').style.setProperty('--rc', `var(${RC[p.r]})`)
    $('[data-rv-n]').innerHTML = `${i + 1}<span> / ${ids.length}</span>`
    const box = $('[data-rv-card]'); box.classList.remove('is-in'); box.innerHTML = картаF(id); void box.offsetWidth; box.classList.add('is-in')
    $('[data-rv-about]').innerHTML = `<h3>${p.ник}</h3><div class="chips"><span class="chip"><span class="rv__rar">${RU[p.r]}</span></span><span class="chip">Позиция ${p.pos} · ${ПОЗИЦИИ[p.pos - 1]}</span>${моя ? '<span class="chip chip--tc"><b>Игрок твоей команды</b></span>' : ''}</div>
      <p>${p.r === 'legend' ? 'Самая редкая карта сундука — 1% шанс. Очки за игру ×1.5.' : p.r === 'base' ? 'Обычная карта. Очки за игру — без бонуса.' : `Редкость ${RU[p.r]} даёт бонус к очкам за игру.`}</p>`
    $('[data-rv-next]').textContent = i === ids.length - 1 ? 'Все карты' : 'Следующая'
    tilt()
  }
  $('[data-rv-next]').addEventListener('click', () => { S.rv < пак().length - 1 ? showCard(S.rv + 1) : go('grid') })
  $('[data-rv-card]').addEventListener('click', () => $('[data-rv-next]').click())

  // 3в · Сетка новых карт
  const renderGrid = () => { $('[data-got]').innerHTML = пак().map((id, k) => `<figure style="--k: ${k}">${картаF(id)}<figcaption><b>${ИГРОКИ[id].ник}</b> · ${RU[ИГРОКИ[id].r]}${id === якорь() ? ' · твоя команда' : ''}</figcaption></figure>`).join('') }

  // 4 · Пятёрка (дирижёр 05.10: «собрать самому»): якорь стоит сразу, остальные карты — на скамейке под позициями. Нажал на карту —
  // она встаёт на свою позицию; потащил — своя позиция светится и притягивает, чужая краснеет. Нажал на карту в составе — обратно
  // на скамейку (якорь — нет). «Собрать за меня» — все разом. Пятёрка полная — кнопка ведёт к прогнозу.
  const состав = [null, null, null, null, null]
  const полный = () => состав.every(Boolean)
  const поз = (id) => ИГРОКИ[id].pos - 1
  const renderFive = (fly = []) => {
    const a = якорь(), ids = пятёрка()
    состав.forEach((id, i) => { if (id && !ids.includes(id)) состав[i] = null }) // сменили команду — состав из старого пака убираем
    if (a) состав[поз(a)] = a
    $('[data-five-lead]').innerHTML = полный() ? 'Пятёрка собрана — <b>пять позиций, пять карт</b>. Менять можно до начала матча.'
      : 'Перетащи карту на её позицию или просто нажми на неё. ' + (a ? 'Игрок твоей команды уже в составе. ' : '') + 'Не хочешь сам — <b>соберём за тебя</b>.'
    $('[data-five]').innerHTML = ПОЗИЦИИ.map((п, i) => { const id = состав[i]
      return `<div class="slot" style="--d: ${Math.abs(i - 2)}"><span class="slot__place${id ? ' is-on' : ''}${fly.includes(i) ? ' is-fly' : ''}" style="--k: ${fly.indexOf(i)}" data-pos="${i}"${id && id !== a ? ` data-id="${id}" title="Убрать на скамейку"` : ''}>${id ? картаF(id) : '+'}</span>
      <span class="slot__pos"><b>${i + 1} · ${п}</b></span>${id && id === a ? '<span class="chip chip--tc">Твоя команда</span>' : ''}</div>` }).join('')
    const скамейка = ids.filter((id) => !состав.includes(id))
    $('[data-bench]').innerHTML = скамейка.length ? `<p>Твои карты · ${скамейка.length}</p><div>${скамейка.map((id) => `<button class="bench__c" type="button" data-id="${id}" aria-label="${ИГРОКИ[id].ник} — на позицию ${ПОЗИЦИИ[поз(id)]}">${картаF(id)}<small>${поз(id) + 1} · ${ПОЗИЦИИ[поз(id)]}</small></button>`).join('')}</div>` : ''
    $('[data-auto]').textContent = полный() ? 'Дальше — первый прогноз' : 'Собрать за меня'
    tilt()
  }
  const поставить = (id) => { состав[поз(id)] = id; renderFive([поз(id)]) }
  const auto = () => { const пустые = []; пятёрка().forEach((id) => { if (!состав[поз(id)]) пустые.push(поз(id)); состав[поз(id)] = id }); renderFive(пустые) }
  $('[data-auto]').addEventListener('click', () => (полный() ? go('pred') : auto()))
  // Карта в составе — обратно на скамейку
  $('[data-five]').addEventListener('click', (e) => { const pl = e.target.closest('.slot__place[data-id]'); if (pl) { состав[+pl.dataset.pos] = null; renderFive() } })
  // Скамейка: клик — на свою позицию; перетаскивание — копия карты за курсором, позиции подсвечиваются
  let тяну = null
  $('[data-bench]').addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.bench__c'); if (!b) return
    e.preventDefault(); b.setPointerCapture(e.pointerId)
    const r = b.getBoundingClientRect()
    тяну = { b, id: b.dataset.id, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, ghost: null, над: null }
  })
  $('[data-bench]').addEventListener('pointermove', (e) => {
    if (!тяну) return
    if (!тяну.ghost) {
      if (Math.hypot(e.clientX - тяну.x0, e.clientY - тяну.y0) < 6) return
      тяну.ghost = тяну.b.cloneNode(true); тяну.ghost.classList.add('bench__ghost', 'hg'); тяну.ghost.style.width = тяну.w + 'px'; document.body.append(тяну.ghost)
      тяну.b.classList.add('is-away')
    }
    тяну.ghost.style.left = e.clientX - тяну.dx + 'px'; тяну.ghost.style.top = e.clientY - тяну.dy + 'px'
    const pl = document.elementsFromPoint(e.clientX, e.clientY).find((el) => el.matches?.('.slot__place'))
    $$('.slot__place', st).forEach((x) => x.classList.remove('is-ok', 'is-bad'))
    if (pl) pl.classList.add(+pl.dataset.pos === поз(тяну.id) ? 'is-ok' : 'is-bad')
    тяну.над = pl || null
  })
  const отпустить = () => {
    if (!тяну) return
    const { id, ghost, над, b } = тяну; тяну = null
    $$('.slot__place', st).forEach((x) => x.classList.remove('is-ok', 'is-bad'))
    if (!ghost) return поставить(id) // это был клик
    ghost.remove(); b.classList.remove('is-away')
    if (над && +над.dataset.pos === поз(id)) поставить(id)
    else if (над) toast(`${ИГРОКИ[id].ник} — ${ПОЗИЦИИ[поз(id)].toLowerCase()}, его место — ${поз(id) + 1}-я позиция`)
  }
  $('[data-bench]').addEventListener('pointerup', отпустить)
  $('[data-bench]').addEventListener('pointercancel', отпустить)

  // 5 · Прогноз на прошедшей карте → повтор → итог сразу
  $('[data-pred-card]').innerHTML = картаF('pure')
  const СОБЫТИЯ = [[.09, '3:24', 'Первая кровь', 2.0], [.24, '9:10', '80 добиваний к 10-й минуте', 1.6], [.4, '15:02', 'Двойное убийство', 3.0], [.56, '21:30', 'Рошан вместе с командой', 1.2], [.74, '28:44', 'Тройное убийство', 2.4], [.92, '35:10', 'Победа на карте', 1.2]]
  const ИТОГ = 11.4, ПЯТЁРКА_ОЧКИ = 38, ДЛИНА = 38 * 60 + 12
  const replay = (pick) => {
    S.pick = pick
    $$('[data-ml] .btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === pick)))
    const pred = $('[data-pred]'); pred.classList.add('is-replay'); pred.classList.remove('is-done')
    const feed = $('[data-rp-feed]'); feed.innerHTML = ''
    let shown = 0
    const draw = (k) => {
      while (shown < СОБЫТИЯ.length && СОБЫТИЯ[shown][0] <= k) { const [, t, what, pts] = СОБЫТИЯ[shown++]; feed.insertAdjacentHTML('afterbegin', `<li><time>${t}</time><span>${what}</span><em>+${pts.toFixed(1)}</em></li>`) }
      while (feed.children.length > 3) feed.lastElementChild.remove()
      const pts = СОБЫТИЯ.slice(0, shown).reduce((s, e) => s + e[3], 0)
      $('[data-rp-pts]').textContent = pts.toFixed(1)
      $('[data-rp-fill]').style.width = `${Math.min(100, (pts / 15) * 100)}%`
      $('[data-rp-bar]').style.width = `${k * 100}%`
      const sec = Math.round(k * ДЛИНА); $('[data-rp-t]').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
    }
    const finish = () => {
      draw(1)
      $('[data-score]').textContent = '1 : 1'
      const hit = pick === 'over'
      if (hit) S.coins = 1030
      const v = $('[data-verdict]'); v.classList.toggle('is-miss', !hit)
      v.innerHTML = hit ? `<div><b>Прогноз зашёл: 11.4 больше 8.5</b><p>А вся твоя пятёрка набрала ${ПЯТЁРКА_ОЧКИ} очков за эту карту</p></div><strong>+30 монет</strong>`
        : `<div><b>В этот раз мимо: Pure набрал 11.4</b><p>Это разминка — монеты не списались. Пятёрка набрала ${ПЯТЁРКА_ОЧКИ} очков</p></div><strong>${ПЯТЁРКА_ОЧКИ} очков</strong>`
      pred.classList.add('is-done')
      $('[data-pred-next]').disabled = false
      $('[data-pred-cap]').textContent = 'Живые матчи — так же, только очки капают по ходу игры'
    }
    if (calm) return finish()
    const t0 = performance.now(), DUR = 7000
    const tick = (now) => { const k = Math.min(1, (now - t0) / DUR); draw(k); k < 1 ? requestAnimationFrame(tick) : finish() }
    requestAnimationFrame(tick)
  }
  $('[data-ml]').addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b && !S.pick) replay(b.dataset.pick) })

  // 6 · Сохранить: карты веером, ник с живым превью строки таблицы
  const lbRow = (place, av, nick, pts, me) => `<div class="${me ? 'is-me' : ''}"><span>${place}</span>${av}<span>${nick}</span><span>${pts}</span></div>`
  const renderLb = () => {
    const nick = S.nick || 'Твой ник'
    $('[data-lb]').innerHTML = lbRow('1 283', '<i class="avatar">M</i>', 'Moonwalker', 39) + lbRow('1 284', `<i class="avatar">${nick[0]}</i>`, nick, ПЯТЁРКА_ОЧКИ, 1) + lbRow('1 285', '<i class="avatar">k</i>', 'kotik_mid', 37)
  }
  const renderSave = () => {
    if (!S.nick) S.nick = 'Новичок_1284'
    $('[data-keep]').innerHTML = пак().map((id, i) => картаF(id).replace('<div class="kc ', `<div style="left: ${i * 92}px; rotate: ${(i - 2) * 4}deg; top: ${Math.abs(i - 2) * 10 + 20}px; z-index: ${i}" class="kc `)).join('')
    $('[data-keep-sum]').innerHTML = `<span class="chip">5 карт · 1 Legend</span><span class="chip">${ПЯТЁРКА_ОЧКИ} очков пятёрки</span><span class="chip">Монеты <b>${num(S.coins)}</b></span>`
    $('[data-nick]').value = S.nick
    renderLb()
  }
  $('[data-nick]').addEventListener('input', (e) => { S.nick = e.target.value.trim(); renderLb() })
  $('.auth', st).addEventListener('click', (e) => { const b = e.target.closest('[data-auth]'); if (!b) return
    if (!S.nick) S.nick = 'Новичок_1284'
    b.textContent = 'Сохраняем…'
    later(() => { toast(`Сохранено. Привет, ${S.nick}!`); S.coach = 0; go('tour') }, 700) })

  // 7 · Главная продукта + 5 подсказок по одной, у самого элемента
  const renderHome = () => {
    $('[data-me-nick]').textContent = S.nick || 'Новичок_1284'
    $('[data-me-av]').textContent = (S.nick || 'Н')[0]
    $('[data-coins]').textContent = num(S.coins)
    $('[data-w-five]').innerHTML = пятёрка().map((id, i) => `<span>${аватар(id)}${i + 1} · ${ИГРОКИ[id].ник}</span>`).join('')
    $('[data-w-lb]').innerHTML = `<div><span>1</span><span>Arteezy_fan</span><span>412</span></div><div><span>2</span><span>miposhka4ever</span><span>398</span></div><div class="is-me"><span>1 284</span><span>${S.nick || 'Новичок_1284'}</span><span>${ПЯТЁРКА_ОЧКИ}</span></div>`
  }
  const ПОДСКАЗКИ = [
    ['match', 'Матч дня', 'Здесь живые матчи. Собери состав или сделай прогноз — до начала карты. Твой izdu играет прямо сейчас.'],
    ['five', 'Твоя пятёрка', 'Очки капают, пока твои игроки на карте. На вчерашней карте она набрала бы 38.'],
    ['quests', 'Квесты дня', '3 прогноза — +30 монет, 6 — ещё +30. Обновляются каждый день.'],
    ['acc', 'Сундук точности', '15 верных прогнозов за неделю — бесплатный сундук. Разминка уже засчитана.'],
    ['coins', 'Монеты', 'Каждый день +50. Не покупаются и не выводятся — только для игры: сундуки, бонусы, прогнозы.'],
  ]
  const coach = (i) => {
    if (i >= ПОДСКАЗКИ.length) return go('final')
    S.coach = i
    const [key, t, p] = ПОДСКАЗКИ[i], el = $(`[data-c="${key}"]`, st)
    const sr = st.getBoundingClientRect(), r = el.getBoundingClientRect(), pad = 8
    const box = { x: r.left - sr.left - pad, y: r.top - sr.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 }
    Object.assign($('[data-spot]').style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` })
    $('[data-coach-t]').textContent = t; $('[data-coach-p]').textContent = p; $('[data-coach-n]').textContent = `${i + 1} из ${ПОДСКАЗКИ.length}`
    const c = $('[data-coach]'), cw = 340, below = box.y + box.h + 16 + 170 < sr.height
    c.style.left = `${Math.max(20, Math.min(sr.width - cw - 20, box.x + box.w / 2 - cw / 2))}px`
    c.style.top = `${below ? box.y + box.h + 16 : box.y - 16 - c.offsetHeight}px`
  }
  $('[data-coach-ok]').addEventListener('click', () => coach(S.coach + 1))
  $('[data-coach-skip]').addEventListener('click', () => go('final'))
  addEventListener('resize', () => { if (st.dataset.scene === 'tour') coach(S.coach) })

  // 8 · Финал
  let cd = 14 * 60 + 32, cdT = 0
  const renderFinal = () => {
    $('[data-fin-h]').textContent = `Ты в игре, ${S.nick || 'Новичок_1284'}`
    const t = S.team || ['all', 'F', 'Лига новичков']
    $('[data-fan-l]').innerHTML = S.team ? `${лого(t[0], t[1])}<div><b>Фан-лига ${t[2]}</b><span class="cap">${БОЛЕЛЬЩИКОВ[t[0]]} болельщиков · ты будешь следующим</span></div>`
      : '<i class="team-logo team-logo--lg">F</i><div><b>Лига новичков</b><span class="cap">Все, кто пришёл на этой неделе</span></div>'
    const from = S.coins, to = S.coins + 50, el = $('[data-coin-up]')
    if (calm) el.textContent = num(to)
    else { const t0 = performance.now(); const up = (now) => { const k = Math.min(1, (now - t0) / 1200); el.textContent = num(Math.round(from + (to - from) * k)); if (k < 1) requestAnimationFrame(up) }; requestAnimationFrame(up) }
    S.coins = to
    clearInterval(cdT)
    const draw = () => { $('[data-cd]').textContent = `${Math.floor(cd / 60)}:${String(cd % 60).padStart(2, '0')}` }
    draw(); if (!calm) cdT = setInterval(() => { cd = Math.max(0, cd - 1); draw() }, 1000)
  }
  $('[data-join]').addEventListener('click', (e) => { const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'
    b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Ты в лиге' : 'Вступить'; if (on) toast('Ты в фан-лиге — таблица своих на вкладке «Лидеры»') })

  go('hook')
})()

// === Бустер в окне ([data-booster] — виджет главной, бустеры в «Коллекции»): живой бустер chest.html?form=booster&embed (booster.js) в окне поверх страницы.
// Закрыть — ✕, клик по фону, Esc. Сцена грузится заново при каждом открытии. Стили — styles.css [=== Бустер в окне ===].
;(() => {
  if (!document.querySelector('[data-booster]')) return
  const окно = Object.assign(document.createElement('div'), { className: 'bm', hidden: true })
  окно.setAttribute('role', 'dialog'); окно.setAttribute('aria-modal', 'true'); окно.setAttribute('aria-label', 'Открытие бустера')
  окно.innerHTML = '<div class="bm__box"><button class="bm__x" type="button" aria-label="Закрыть">✕</button></div>'
  document.body.append(окно)
  const коробка = окно.firstElementChild
  const закрыть = () => { окно.hidden = true; document.body.classList.remove('bm-open'); коробка.querySelector('iframe')?.remove() }
  const открыть = () => {
    коробка.querySelector('iframe')?.remove()
    коробка.insertAdjacentHTML('beforeend', '<iframe src="chest.html?form=booster&embed" title="Бустер"></iframe>')
    окно.hidden = false; document.body.classList.add('bm-open'); коробка.querySelector('.bm__x').focus()
  }
  document.addEventListener('click', (e) => { const б = e.target.closest('[data-booster]'); if (!б) return; e.preventDefault(); открыть() })
  окно.addEventListener('click', (e) => { if (e.target === окно || e.target.closest('.bm__x')) закрыть() })
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !окно.hidden) закрыть() })
})()

// === Состав (blocks/lineup/app.html, страница lineup.html; дирижёр 05.10: из лабы «Состав» берём v3 «Карта и скамейка»).
// Один состав для Dota 2, LoL и CS 2 — меняются роли и поле. Клик ставит / убирает карту, мышью — игровое перетаскивание (тащить()),
// капитан ×1.5, «Собрать за меня», дедлайн замен, предупреждение «не играет». Данные условные (сегодня 1 октября).
// Перенос lab/lineup/_lineup.js + v3-map.html как есть; стили — styles.css [=== Состав ===].
;(() => {
  if (!document.querySelector('[data-lu]')) return
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
    const x = п(id), лого = (cl, deco = '') => `<i class="logo-mask ${cl}" data-l="2"${deco} style="--logo: url('img/teams/${x.к}.png')"></i>`
    const spark = x.r === 'prism' || x.r === 'legend' ? '<i class="fx fx-spark" data-l="4"><b></b><b></b><b></b><b></b><b></b><b></b></i>' : ''
    return `<div class="kc mk kc--${сила(x.ovr)} kc--${x.r} m3" data-tilt style="--w: ${w}px"${extra}><div class="kc__in"><div class="kc__face"><div class="mk-plate">${лого('mk-logo')}${лого('mk-logo mk-logo--a', ' data-deco="2"')}${лого('mk-logo mk-logo--b', ' data-deco="2"')}`
      + `<i class="mk-pix" data-deco="1"></i><i class="mk-halo"></i><img class="ph${x.фото ? '' : ' ph--sil'}" data-l="5" src="img/players/${x.фото || '_silhouette.png'}" alt="${x.ник}" /><i class="mk-scan" data-deco="3"></i><i class="fx fx-shine" data-l="4"></i>${spark}`
      + `<div class="m3__band"><span class="m3__pos">P${x.pos}</span><span class="m3__nick">${x.ник}</span></div><div class="m3__foot"><b>${КОМАНДЫ[x.к]}</b></div></div>`
      + `<svg class="mk-frame" viewBox="0 0 160 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="14,1 159,1 159,181 140,199 1,199 1,14" /></svg>`
      + `<div class="m3__tab"><img class="logo" src="img/teams/${x.к}.png" alt="${КОМАНДЫ[x.к]}" /></div><div class="m3__ovr"><b>${x.ovr}</b></div><i class="fx fx-glare"></i></div></div></div>`
  }
  const лого = (к, cl = '') => `<img class="lu-logo ${cl}" src="img/teams/${к}.png" alt="${КОМАНДЫ[к]}" />`
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

// Точки на поле по ролям, % от поля: Dota — пары на линиях и мид; LoL — топ, лес, мид, бот парой; CS 2 — A, мид, B
// по горизонтали точки через 18% — карты не налезают друг на друга
const ТОЧКИ = { dota: [[86, 72], [50, 48], [14, 26], [32, 28], [68, 76]], lol: [[14, 26], [32, 42], [50, 50], [86, 72], [68, 78]], cs: [[14, 30], [86, 28], [50, 50], [68, 74], [32, 72]] }
const ПОЛЕ = { dota: 'Карта Доты · Radiant снизу', lol: 'Ущелье призывателей', cs: 'Карта · точки A и B' }
page({
  drag: true,
  render: (S, h) => `<div class="lu-app hg">
  <div class="lu-h"><div><h2>Состав</h2><p>Расставь пятёрку по карте — один состав для Dota 2, LoL и CS 2</p></div>${h.игры()}</div>
  <div class="v3-grid">
    <div class="v3-field" data-field><i class="v3-lane"></i><span class="v3-game">${ПОЛЕ[S.game]}</span>
      ${h.РОЛИ().map(([код, имя], i) => { const id = S.slots[i], x = id && h.п(id), [l, t] = ТОЧКИ[S.game][i]
        return `<div class="v3-spot" style="left: ${l}%; top: ${t}%" data-slot="${i}" data-drop="${i}">${id ? `<span data-out="${id}" title="Убрать">${h.карта(id, 118)}</span>` : '<span class="v3-emp">+</span>'}
          <span class="v3-tag"><b>${код}</b><span>${имя}</span>${x ? `<em>${(x.очки * (id === S.cap ? 1.5 : 1)).toFixed(1)}</em><button class="lu-cap-b" type="button" aria-pressed="${id === S.cap}" data-cap="${id}" title="Капитан ×1.5">C</button>` : ''}</span></div>` }).join('')}
    </div>
    <aside class="v3-side">${h.итог()}${h.предупреждение()}
      <section class="v3-panel"><h3>Кто сегодня играет</h3>${S.slots.filter(Boolean).map((id) => { const x = h.п(id); return `<div class="v3-m"><span><b>${x.ник}</b> <span class="lu-muted">· ${h.КОМАНДЫ[x.к]}</span></span><em>${x.очки.toFixed(1)}</em><small class="${x.матч ? '' : 'lu-out'}">${h.матч(x)}</small></div>` }).join('') || '<p class="lu-muted">Поставь игроков на карту</p>'}</section>
      ${h.авто()}<button class="btn btn--quiet" type="button">Сохранить состав</button></aside>
  </div>
  <div class="v3-bh"><h3>Скамейка <span class="lu-muted">· ${h.скамейка().length}</span></h3>${h.позиции()}${h.поиск()}</div>
  <div class="v3-bench" data-drop-bench>${h.скамейка().map((id) => { const x = h.п(id); return `<div class="v3-bc${x.матч ? '' : ' is-out'}" data-add="${id}" draggable="true">${h.карта(id, 112)}<span><b>${x.очки ? x.очки.toFixed(1) : '0'}</b> · ${x.матч ? x.матч[1] : '<span class="lu-out">не играет</span>'}</span></div>` }).join('')}</div>
</div>`,
})
})()

// === Match Center (blocks/screens/match-center.html, страница match-center.html; дирижёр 06.10: лаба «Все матчи» v6). Стили — styles.css [=== Match Center ===].
// Строка .mx-row.is-click раскрывается по клику — открыта всегда одна; раскрытие .mx-xo — продолжение строки в её же сетке (лаба «Раскрытая строка матча» v5),
// высоту плавно открывает CSS по .is-open, шеврон поворачивает CSS.
// «Показать счёт» (в строке или в полосе) снимает .is-spoil и меняет полосу «счёт скрыт» на итог матча.
;(() => {
  const root = document.querySelector('.mc')
  if (!root) return
  // Липкая правая колонка: top = окно минус высота колонки (не больше 16px) — длинная колонка прилипает низом к низу экрана
  const right = root.querySelector('.mx-right')
  const липко = () => { if (right) right.style.top = Math.min(16, innerHeight - right.offsetHeight - 16) + 'px' }
  липко(); addEventListener('resize', липко); if (right) new ResizeObserver(липко).observe(right)
  // Дни (дирижёр 08.10): «Сегодня» — разметка страницы, другой день — строки из week-data.js (те же .mx-row, без раскрытия).
  // День приходит по ссылке ?day=7 (кнопка «Все матчи дня» под постером главной) или кликом по полосе дней.
  const main = root.querySelector('.mx-main'), неделя = window.НЕДЕЛЯ
  const дни = неделя ? [неделя.ВС_4, ...неделя.ДНИ] : []
  const ДН = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
  const чч = n => String(n).padStart(2, '0'), вр = мин => `${чч(Math.floor(мин / 60) % 24)}:${чч(мин % 60)}`
  const ПОДПИСИ = '<span class="mx-x__lb mx-x__lb--k">☠</span><span class="mx-x__lb mx-x__lb--pre">PRE</span><span class="mx-x__lb mx-x__lb--odds">ODDS</span><span class="mx-x__lb mx-x__lb--live">LIVE</span><span class="mx-x__lb mx-x__lb--val">VAL</span>'
  const ПУСТО = ['k', 'pre', 'odds', 'live', 'val'].map(k => `<span class="mx-x__v mx-x__v--${k} is-none">—</span>`).join('')
  const строка = (m, d) => {
    const К = неделя.К, итог = m.st === 'done', g = неделя.ИГРЫ[m.g]
    const ссылка = `match-page.html?game=${m.g === 'cs' ? 'cs' : 'dota'}&amp;state=${итог ? 'done' : 'pre'}`
    const лого = id => К[id][1] ? `<img class="mx-lg" src="img/teams/${К[id][1]}.png" alt="">` : `<span class="mx-lg mx-lg--mono">${К[id][2]}</span>`
    const команда = (id, свои, чужие) => `<span class="mx-x__t ${итог ? (свои > чужие ? 'is-win' : 'is-lose') : ''}">${лого(id)}<span class="mx-x__n"><b class="mx-nm">${К[id][0]}</b></span></span>${ПУСТО}`
    const конец = вр(m.t + (неделя.ДЛИНА[m.bo] || 150))
    return `<article class="mx-row st-${итог ? 'done' : 'soon'}" data-id="${m.id}"><div class="mx-row__in mx-x"><div class="mx-x__g">
      <p class="mx-x__h"><span class="mx-gt">${g}</span><span class="mx-x__tour">${m.тур} · ${m.стадия} · ${m.bo}</span><a class="mx-x__go" href="${ссылка}">матч ›</a></p>${ПОДПИСИ}
      ${команда(m.a, m.sa, m.sb)}${команда(m.b, m.sb, m.sa)}
      <p class="mx-x__f"><span class="mx-x__st ${итог ? 'is-mute' : ''}"><i></i>${итог ? 'Завершён' : 'Запланирован'}</span><span class="mx-x__clock">${итог ? конец : вр(m.t)}</span></p></div>
      <div class="mx-x__time">${итог ? `<b class="mx-x__sc">${m.sa} : ${m.sb}</b><small>Итог · ${конец}</small>` : `<b>${вр(m.t)}</b><small>${m.если || `${d.n} окт`}</small>`}</div></div></article>`
  }
  const день = n => {
    const d = дни.find(x => x.n === n)
    root.querySelectorAll('.mx-days [data-day]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.day === n))
    main.querySelector('.mx-gen')?.remove()
    main.classList.toggle('is-day', n !== 6)
    if (n === 6 || !d) return
    const туры = []
    ;[...d.м].sort((a, b) => a.t - b.t).forEach(m => { let т = туры.find(x => x.тур === m.тур); if (!т) туры.push(т = { тур: m.тур, g: m.g, м: [] }); т.м.push(m) })
    const заголовок = `${d.n === 5 ? 'Вчера' : d.n === 7 ? 'Завтра' : ДН[(d.n - 4) % 7][0].toUpperCase() + ДН[(d.n - 4) % 7].slice(1)}, ${d.n} октября`
    main.querySelector('.mx-days').insertAdjacentHTML('afterend', `<div class="mx-gen"><h2 class="mx-day">${заголовок} <small>${d.k} матчей</small></h2>
      ${туры.map(т => `<section class="mx-tour"><header class="mx-tb"><span class="mx-gt">${неделя.ИГРЫ[т.g]}</span><b>${т.тур}</b><a class="mx-tb__go" href="#">›</a></header>${т.м.map(m => строка(m, d)).join('')}</section>`).join('')}
      <button class="mx-more mx-more--day" type="button">Все ${d.k} матчей</button></div>`)
  }
  root.querySelector('.mx-days')?.addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) день(+b.dataset.day) })
  const сДня = +new URLSearchParams(location.search).get('day')
  if (неделя && сДня) день(сДня)
  const свернуть = (row) => row.classList.remove('is-open')
  root.addEventListener('click', (e) => {
    const spoil = e.target.closest('.mx-spoil, [data-spoil]')
    if (spoil) {
      const row = spoil.closest('.mx-row'), mid = row.querySelector('.mx-tm .mx-spoil')
      row.classList.remove('is-spoil')
      if (mid) mid.replaceWith(Object.assign(document.createElement('span'), { className: 'mx-sep', textContent: ':' }))
      row.querySelectorAll('.mx-q-hid').forEach(el => el.setAttribute('hidden', '')); row.querySelectorAll('.mx-q-rev').forEach(el => el.removeAttribute('hidden'))
      return
    }
    if (e.target.closest('.mx-fav, .mx-xo, a')) return
    const row = e.target.closest('.mx-row.is-click')
    if (!row) return
    const открыть = !row.classList.contains('is-open')
    root.querySelectorAll('.mx-row.is-open').forEach(свернуть)
    if (!открыть) return
    row.classList.add('is-open')
  })
})()
