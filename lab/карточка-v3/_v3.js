/* Общее для разбора «карточка-v3»: данные игроков, помощники разметки, страница варианта (большая карта + иерархия,
   ряд «сила и редкость», раскадровка по 9 шагам), наклон, блик, оборот по клику.
   Вариант задаёт только своё лицо карты: V3.страница({ класс, лицо(п, r, h), иерархия: [9 строк] }).

   Иерархия — как в генераторе v2: 1 Форма → 2 Фон → 3 Рамка → 4 Эффекты → 5 Фото → 6 Игрок → 7 Раскладка → 8 Инфо → 9 Оборот.
   В шаблоне каждый слой помечен data-l="N" — раскадровка показывает карту с шага 1 по шаг N.
   Украшения помечены data-deco="1|2|3": видны с Holo / Prism / Legend (правка начальника 30.09: чем проще карта, тем меньше украшений). */
(() => {
  const ШАГИ = ['Форма', 'Фон', 'Рамка', 'Эффекты', 'Фото', 'Игрок', 'Раскладка', 'Инфо', 'Оборот']
  const СТАТЫ = ['FRM', 'FGT', 'POOL', 'SUR', 'VIS', 'FORM']
  const СТАТЫ_ИМЯ = ['Форма', 'Драки', 'Пул героев', 'Выживание', 'Обзор', 'Игра сейчас']
  // Позиция и роль — по-английски на всех картах (дирижёр 01.10: «поз по-русски выглядит ужасно»)
  const РОЛИ = { 1: 'Carry', 2: 'Mid', 3: 'Offlane', 4: 'Support', 5: 'Hard Support' }
  const КОМАНДЫ = { pv: 'PARIVISION', tun: 'Tundra Esports', ts: 'Team Spirit', aur: 'Aurora' }
  const ИМЯ = { base: 'Base', holo: 'Holo', prism: 'Prism', legend: 'Legend', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', elite: 'Elite' }
  const СЕЗОН = 'Сезон 1', ТИРАЖ = 400

  // Данные — те же, что в генераторе v2 (app.js [Генератор карточки v2]); условные, сайт тестовый.
  // герои: [id картинки, имя, матчей, винрейт %]. Undefined — игрок без фото: силуэт (решение 12), команда условная.
  const ИГРОКИ = {
    '9class': { ник: '9Class', имя: 'Эдгар Налдакян', флаг: 'ru', команда: 'pv', pos: 4, рейтинг: 95, номер: '012', фото: '9class.webp',
      статы: [82, 60, 47, 91, 36, 67], герои: [['tusk', 'Tusk', 38, 61], ['rubick', 'Rubick', 31, 58], ['hoodwink', 'Hoodwink', 19, 68]], форма: 'ВВВПВВПВВВ' },
    pure: { ник: 'Pure', имя: 'Иван Москаленко', флаг: 'ru', команда: 'tun', pos: 1, рейтинг: 93, номер: '003', фото: 'pure.webp',
      статы: [95, 88, 83, 86, 49, 90], герои: [['terrorblade', 'Terrorblade', 35, 63], ['morphling', 'Morphling', 26, 57], ['faceless_void', 'Faceless Void', 16, 69]], форма: 'ВВПВВВВПВВ' },
    yatoro: { ник: 'Yatoro', имя: 'Илья Мулярчук', флаг: 'ua', команда: 'ts', pos: 1, рейтинг: 82, номер: '027', фото: 'yatoro.webp',
      статы: [93, 71, 64, 78, 41, 74], герои: [['faceless_void', 'Faceless Void', 34, 60], ['morphling', 'Morphling', 27, 55], ['terrorblade', 'Terrorblade', 14, 64]], форма: 'ВПВВПВВВПВ' },
    rue: { ник: 'Rue', имя: 'Владислав Пупкин', флаг: 'ru', команда: 'ts', pos: 5, рейтинг: 78, номер: '041', фото: 'rue.webp',
      статы: [44, 68, 72, 81, 88, 70], герои: [['rubick', 'Rubick', 33, 59], ['tusk', 'Tusk', 22, 55], ['beastmaster', 'Beastmaster', 11, 64]], форма: 'ПВВПВВПВВП' },
    undefined: { ник: 'Undefined', имя: '', флаг: '', команда: 'aur', pos: 3, рейтинг: 70, номер: '318', фото: '',
      статы: [60, 60, 60, 60, 60, 60], герои: [['mars', 'Mars', 20, 50], ['lycan', 'Lycan', 15, 50], ['beastmaster', 'Beastmaster', 10, 50]], форма: 'ВВПВПВВПВП' },
  }

  // Ряд «сила и редкость»: от простой карты к сложной
  const РЯД = [['undefined', 'base'], ['rue', 'holo'], ['yatoro', 'prism'], ['pure', 'legend']]

  const ступень = (р) => (р >= 90 ? 'elite' : р >= 75 ? 'gold' : р >= 60 ? 'silver' : 'bronze')
  const уровень = (v) => (v >= 75 ? 'hi' : v >= 50 ? 'mid' : 'lo')

  // Помощники разметки — вариант собирает из них своё лицо карты
  const h = {
    СТАТЫ, РОЛИ, СЕЗОН, ТИРАЖ,
    статы: (п) => п.статы.map((v, i) => ({ к: СТАТЫ[i], имя: СТАТЫ_ИМЯ[i], v, ур: уровень(v) })),
    роль: (п) => `Pos ${п.pos} · ${РОЛИ[п.pos]}`,
    серия: (п) => `#${п.номер} / ${ТИРАЖ}`,
    команда: (п) => КОМАНДЫ[п.команда],
    флаг: (п) => (п.флаг ? `<i class="flag flag--${п.флаг}" aria-label="${п.флаг.toUpperCase()}"></i>` : ''),
    лого: (п, кл = '') => `<img class="logo ${кл}" src="/p-fw3k/site/img/teams/${п.команда}.png" alt="${КОМАНДЫ[п.команда]}" />`,
    // Логотип команды маской: силуэт логотипа, залитый тем, что задаст вариант (фон карты — брендируемый)
    маска: (п, кл = '', l = 2) => `<i class="logo-mask ${кл}" data-l="${l}" style="--logo: url('/p-fw3k/site/img/teams/${п.команда}.png')"></i>`,
    герой: (г, кл = '') => `<img class="hero-ic ${кл}" src="/p-fw3k/site/img/heroes/${г[0]}.webp" alt="${г[1]}" loading="lazy" />`,
    фото: (п, кл = '', l = 5) => `<img class="ph ${кл}${п.фото ? '' : ' ph--sil'}" data-l="${l}" src="/p-fw3k/site/img/players/${п.фото || '_silhouette.png'}" alt="${п.ник}" />`,
    // Контур формы «один скос справа снизу» (.kc-cut): svg — обводка идёт и по скосу. Сетка 220×308 = карта в десятых em
    контур: (кл = '') => `<svg class="cut-frame ${кл}" data-l="3" viewBox="0 0 220 308" preserveAspectRatio="none" aria-hidden="true">
  <path class="out" d="M10,1 H210 A9,9 0 0 1 219,10 V277 L189,307 H10 A9,9 0 0 1 1,298 V10 A9,9 0 0 1 10,1 Z" />
  <path class="in" d="M12,5 H208 A7,7 0 0 1 215,12 V275.3 L187.3,303 H12 A7,7 0 0 1 5,296 V12 A7,7 0 0 1 12,5 Z" />
</svg>`,
    // Диаграмма статов — «паук навыков» (v14–v16): шестиугольник радиуса R в сетке −72…72 × −58…58, вершины по часовой от верха;
    // подпись и значение — у вершины. сетка: false — только паук, без сетки радара (дирижёр 01.10, v15).
    // Вид — .rd в _v3.css (.rd--3d — двигается за курсором, как фото), место и размер задаёт вариант своим классом
    // мин — доля радиуса у нулевого значения (0 — из центра; v16: малое значение не у центра, максимум — у краёв карты);
    // внутрь — подписи у самой точки, к центру (паук на всю карту); вид — viewBox, если сетка нестандартная
    // наОсях — подписи на концах осей, на одном радиусе (не у точек): от точки к подписи — пунктир (v16, заход 4)
    // сектора — шесть секторов-клиньев под подсветку выбранного стата (v18: выбор по кругу за курсором, как колесо оружия в GTA 5)
    радар: (п, кл = '', { R = 36, сетка = true, мин = 0, внутрь = false, наОсях = 0, сектора = false, вид = '-72 -58 144 116' } = {}) => {
      const ст = h.статы(п), g = `rd-holo-${++h.n}`
      const точка = (i, r) => { const a = (-90 + i * 60) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)] }
      const xy = (pt) => pt.map((x) => x.toFixed(1)).join(',')
      const шести = (r) => [0, 1, 2, 3, 4, 5].map((i) => xy(точка(i, r))).join(' ')
      const радиус = (v) => R * (мин + (1 - мин) * v / 100)
      const фигура = ст.map((с, i) => xy(точка(i, радиус(с.v)))).join(' ')
      const подписи = ст.map((с, i) => {
        if (наОсях) {
          const [px, py] = точка(i, радиус(с.v)), [lx, ly] = точка(i, наОсях), [cx, cy] = точка(i, наОсях - 9)
          return `<line class="lead" data-i="${i}" x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" />`
            + `<text class="k" data-i="${i}" x="${lx.toFixed(1)}" y="${(ly - 4).toFixed(1)}" text-anchor="middle">${с.к}</text><text class="v" data-i="${i}" data-v="${с.ур}" x="${lx.toFixed(1)}" y="${(ly + 8).toFixed(1)}" text-anchor="middle">${с.v}</text>`
        }
        if (внутрь) {
          const [xv, yv] = точка(i, радиус(с.v) - 13), [xk, yk] = точка(i, радиус(с.v) - 25)
          return `<text class="v" data-v="${с.ур}" x="${xv.toFixed(1)}" y="${(yv + 4).toFixed(1)}" text-anchor="middle">${с.v}</text><text class="k" x="${xk.toFixed(1)}" y="${(yk + 2).toFixed(1)}" text-anchor="middle">${с.к}</text>`
        }
        let x = 0, yk, yv, якорь = 'middle'
        if (i === 0) { yk = -R - 15; yv = -R - 4 } else if (i === 3) { yk = R + 10; yv = R + 21 }
        else { const [px, py] = точка(i, R + 6); x = px; yk = py - 3; yv = py + 8; якорь = px > 0 ? 'start' : 'end' }
        return `<text class="k" x="${x.toFixed(1)}" y="${yk.toFixed(1)}" text-anchor="${якорь}">${с.к}</text><text class="v" data-v="${с.ур}" x="${x.toFixed(1)}" y="${yv.toFixed(1)}" text-anchor="${якорь}">${с.v}</text>`
      }).join('')
      return `<svg class="rd ${кл}" data-l="8" viewBox="${вид}" aria-label="Статы">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" style="stop-color: var(--c-rarity-holo-1)" /><stop offset=".35" style="stop-color: var(--c-rarity-holo-4)" />
    <stop offset=".7" style="stop-color: var(--c-rarity-holo-3)" /><stop offset="1" style="stop-color: var(--c-rarity-holo-2)" /></linearGradient></defs>
  ${сетка ? `<polygon class="grid" points="${шести(R)}" /><polygon class="grid" points="${шести(R * 2 / 3)}" /><polygon class="grid" points="${шести(R / 3)}" />
  ${[0, 1, 2, 3, 4, 5].map((i) => `<line class="axis" x1="0" y1="0" x2="${точка(i, R)[0].toFixed(1)}" y2="${точка(i, R)[1].toFixed(1)}" />`).join('')}
  <polygon class="grid rd__glow" points="${шести(R)}" data-l="4" data-deco="1" />` : `<polygon class="shape rd__glow" points="${фигура}" data-l="4" data-deco="1" />`}
  ${сектора ? [0, 1, 2, 3, 4, 5].map((i) => { const r = наОсях + 6, [ax, ay] = точка(i - .5, r), [bx, by] = точка(i + .5, r)
    return `<path class="sec" data-i="${i}" d="M0,0 L${ax.toFixed(1)},${ay.toFixed(1)} A${r},${r} 0 0 1 ${bx.toFixed(1)},${by.toFixed(1)} Z" />` }).join('') : ''}
  ${наОсях ? [0, 1, 2, 3, 4, 5].map((i) => `<line class="ray" data-i="${i}" x1="0" y1="0" x2="${точка(i, наОсях - 9)[0].toFixed(1)}" y2="${точка(i, наОсях - 9)[1].toFixed(1)}" />`).join('') : ''}
  <polygon class="shape" points="${фигура}" />
  <polygon class="rd__holo" points="${фигура}" data-l="4" data-deco="2" style="fill: url(#${g})" />
  ${ст.map((с, i) => { const [x, y] = точка(i, радиус(с.v)); return `<circle class="dot" data-i="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.8" />` }).join('')}
  ${подписи}
</svg>`
    },
    n: 0,
    // Слои редкости — вариант кладёт их на «поверхность» карты
    блеск: (r) => `<i class="fx fx-shine" data-l="4"></i>${r === 'prism' || r === 'legend' ? '<i class="fx fx-spark" data-l="4"><b></b><b></b><b></b><b></b><b></b><b></b></i>' : ''}`,
  }

  // Оборот — содержание одно на все варианты (как в генераторе v2: статы, герои с матчами и винрейтом, форма, кнопка «Страница игрока»),
  // вид у каждого варианта свой: вариант передаёт свою рамку (svg по контуру формы) и перекрашивает .bk своими стилями (дирижёр 01.10)
  h.оборот = (п, рамка = '') => `
<div class="bk">
  ${h.маска(п, 'bk__mask', 9)}
  <div class="bk__top">${h.лого(п)}<span><b>${п.ник}</b><small>${h.серия(п)} · ${СЕЗОН}</small></span><em>${п.рейтинг}</em></div>
  <ul class="bk__stats">${h.статы(п).map((с) => `<li><span>${с.имя}</span><b data-v="${с.ур}">${с.v}</b><i style="--v: ${с.v}%"></i></li>`).join('')}</ul>
  <ul class="bk__heroes">${п.герои.map((г) => `<li>${h.герой(г)}<span><b>${г[1]}</b><small>${г[2]} матчей</small></span><em>${г[3]}%</em></li>`).join('')}</ul>
  <p class="bk__lbl">Последние 10 матчей</p>
  <ol class="bk__form">${[...п.форма].map((x) => `<li data-w="${x === 'В'}">${x}</li>`).join('')}</ol>
  <span class="bk__btn">Страница игрока</span>
</div>${рамка}`

  function карта(в, ид, r, { шаг = 9, оборот = false } = {}) {
    const п = ИГРОКИ[ид]
    const rr = шаг >= 4 ? r : 'base'
    return `<div class="kc kc--${ступень(п.рейтинг)} kc--${rr} ${в.класс}" data-tilt${шаг < 9 ? ` data-step="${шаг}"` : ''}>
  <div class="kc__in"><div class="kc__flip${оборот ? ' is-flip' : ''}">
    <div class="kc__face">${в.лицо(п, rr, h)}<i class="fx fx-glare"></i></div>
    <div class="kc__back">${(в.оборот || h.оборот)(п, rr, h)}</div>
  </div></div>
</div>`
  }

  function страница(в) {
    const куда = document.getElementById('v3')
    const подпись = (ид, r) => `${ИМЯ[ступень(ИГРОКИ[ид].рейтинг)]} · ${ИМЯ[r]} — ${ИГРОКИ[ид].ник}`
    куда.innerHTML = `
<div class="v3-hero">
  <figure class="v3-hero__card">${карта(в, '9class', 'legend')}<figcaption>${подпись('9class', 'legend')} · наведите — наклон и блик, клик — оборот</figcaption></figure>
  <ol class="v3-tree">${в.иерархия.map((t, i) => `<li><b>${i + 1}</b><span><strong>${ШАГИ[i]}</strong>${t}</span></li>`).join('')}</ol>
</div>
<h3 class="v3-h">Сила и редкость: чем проще карта, тем меньше украшений</h3>
<div class="v3-row">${РЯД.map(([ид, r]) => `<figure>${карта(в, ид, r)}<figcaption>${подпись(ид, r)}</figcaption></figure>`).join('')}</div>
<h3 class="v3-h">Раскадровка: карта по шагам иерархии</h3>
<div class="v3-story">${ШАГИ.map((ш, i) => `<figure>${карта(в, '9class', 'legend', { шаг: i + 1, оборот: i === 8 })}<figcaption><b>${i + 1}</b>${ш}</figcaption></figure>`).join('')}</div>`

    // Раскадровка: прячем слои старше шага
    куда.querySelectorAll('.kc[data-step]').forEach((к) => {
      const шаг = +к.dataset.step
      к.querySelectorAll('[data-l]').forEach((el) => { if (+el.dataset.l > шаг) el.classList.add('is-later') })
    })
    // Оборот по клику — у живых карт (не в раскадровке)
    куда.querySelectorAll('.kc:not([data-step])').forEach((к) => к.addEventListener('click', () => к.querySelector('.kc__flip').classList.toggle('is-flip')))
    наклон(куда)
  }

  // Наклон и блик за курсором. --mx/--my — точка курсора в %, --dx/--dy — смещение от центра (−.5….5)
  function наклон(корень) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    корень.querySelectorAll('.kc:not([data-step])').forEach((к) => {
      к.addEventListener('pointermove', (e) => {
        const б = к.getBoundingClientRect()
        const x = (e.clientX - б.left) / б.width
        const y = (e.clientY - б.top) / б.height
        к.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
        к.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
        к.style.setProperty('--dx', (x - 0.5).toFixed(3))
        к.style.setProperty('--dy', (y - 0.5).toFixed(3))
        к.classList.add('is-on')
      })
      к.addEventListener('pointerleave', () => {
        к.classList.remove('is-on')
        ;['--mx', '--my', '--dx', '--dy'].forEach((v) => к.style.removeProperty(v))
      })
    })
  }

  window.V3 = { страница, h, ИГРОКИ }
})()
