/* Лаба «card-mini» — мини-форма карты «v1 · Хайперглитч» для виджетов (дирижёр 05.10: базовая карта — Хайперглитч, в виджетах — своя мини-форма).
   Данные и помощники разметки — из лабы карточка-v3 (../карточка-v3/_v3.js: V3.ИГРОКИ, V3.h), слои редкости и наклон — её же стили (_v3.css).
   Вариант задаёт только лицо: MINI.страница({ класс, лицо(п, r, h) }). Страница: ряд «сила и редкость» в трёх размерах (180 / 140 / 110 px)
   и примеры в контексте — «Твои игроки сегодня» и сетка маркета. */
(() => {
  const { h, ИГРОКИ } = V3
  const РЯД = [['undefined', 'base'], ['rue', 'holo'], ['yatoro', 'prism'], ['pure', 'legend']]
  const ИМЯ = { base: 'Base', holo: 'Holo', prism: 'Prism', legend: 'Legend', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', elite: 'Elite' }
  const РАЗМЕРЫ = [180, 140, 110]
  const ступень = (р) => (р >= 90 ? 'elite' : р >= 75 ? 'gold' : р >= 60 ? 'silver' : 'bronze')

  // Мини-карта: .kc из v3 (наклон, слои редкости), свой класс варианта; оборота нет — в виджете клик ведёт на страницу игрока
  const карта = (в, ид, r, w) => {
    const п = ИГРОКИ[ид]
    return `<div class="kc mk kc--${ступень(п.рейтинг)} kc--${r} ${в.класс}" data-tilt style="--w: ${w}px">
  <div class="kc__in"><div class="kc__face">${в.лицо(п, r, h)}<i class="fx fx-glare"></i></div></div>
</div>`
  }

  // Контекст: строка «Твои игроки сегодня» и сетка маркета
  const МОИ = [['9class', 'legend', 'PV — BetBoom', '18:00', '18.9'], ['yatoro', 'prism', 'Spirit — Tundra', 'Live · К2', '21.4'], ['pure', 'legend', 'Spirit — Tundra', 'Live · К2', '24.0']]
  const МАРКЕТ = [['9class', 'legend', 1450], ['pure', 'prism', 1380], ['rue', 'holo', 540]]

  function страница(в) {
    const куда = document.getElementById('mini')
    const подпись = (ид, r) => `${ИМЯ[ступень(ИГРОКИ[ид].рейтинг)]} · ${ИМЯ[r]} — ${ИГРОКИ[ид].ник}`
    куда.innerHTML = `
<h3 class="mn-h">Сила и редкость — в трёх размерах виджетов</h3>
${РАЗМЕРЫ.map((w) => `<div class="mn-size"><span class="mn-size__w">${w} px</span><div class="mn-row">${РЯД.map(([ид, r]) => `<figure>${карта(в, ид, r, w)}${w === 180 ? `<figcaption>${подпись(ид, r)}</figcaption>` : ''}</figure>`).join('')}</div></div>`).join('')}
<h3 class="mn-h">В контексте</h3>
<div class="mn-ctx">
  <section class="mn-panel"><div class="mn-ph"><b>Твои игроки сегодня</b><small>3 из 5 играют</small></div>
    <div class="mn-mine">${МОИ.map(([ид, r, м, t, p]) => `<div class="mn-mine__it">${карта(в, ид, r, 110)}<span><b>${ИГРОКИ[ид].ник}</b><small>${м}</small><em class="${t.startsWith('Live') ? 'is-live' : ''}">${t}</em><small><strong>${p}</strong> очков прогноз</small></span></div>`).join('')}</div></section>
  <section class="mn-panel"><div class="mn-ph"><b>Маркет</b><small>сезон 1 · сначала дорогие</small></div>
    <div class="mn-market">${МАРКЕТ.map(([ид, r, ц]) => `<div class="mn-gc">${карта(в, ид, r, 150)}<div class="mn-gc__buy"><span class="mn-price"><i></i>${ц.toLocaleString('ru')}</span><span class="mn-btn">Купить</span></div></div>`).join('')}</div></section>
</div>`
    наклон(куда)
  }

  // Наклон и блик за курсором — как в v3 (--mx/--my — точка курсора, --dx/--dy — смещение от центра)
  function наклон(корень) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    корень.querySelectorAll('.kc').forEach((к) => {
      к.addEventListener('pointermove', (e) => {
        const б = к.getBoundingClientRect(), x = (e.clientX - б.left) / б.width, y = (e.clientY - б.top) / б.height
        к.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); к.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
        к.style.setProperty('--dx', (x - 0.5).toFixed(3)); к.style.setProperty('--dy', (y - 0.5).toFixed(3))
        к.classList.add('is-on')
      })
      к.addEventListener('pointerleave', () => { к.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach((v) => к.style.removeProperty(v)) })
    })
  }

  window.MINI = { страница }
})()
