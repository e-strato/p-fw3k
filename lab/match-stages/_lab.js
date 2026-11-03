// Лаба «Стадии матча»: страница варианта. Пульт (игра, стадия, «Проиграть») ведёт рамку телефона 390 —
// только телефон, без десктопа и раскадровки (дирижёр 15.10: «много данных, сложно просматривать»). Номер варианта — <body data-v>.
;(() => {
  const V = +document.body.dataset.v, S = { g: 'dota', i: 4, play: null }
  const tools = document.querySelector('.p-tools'), рамки = [...document.querySelectorAll('.p-phone iframe')]
  tools.innerHTML = `<div class="p-seg" data-g><button type="button" data-v="dota" aria-pressed="true">Dota 2 · Spirit — Tundra</button><button type="button" data-v="cs">CS2 · G2 — FaZe</button></div>
    <div class="p-seg" data-st></div><button type="button" class="p-play" aria-pressed="false">▶ Проиграть стадии</button>`
  const st = tools.querySelector('[data-st]'), play = tools.querySelector('.p-play')
  const кнопки = () => { st.innerHTML = МС.СТАДИИ.map((_, j) => `<button type="button" data-v="${j}" aria-pressed="${j === S.i}">${МС.стадия(S.g, j).имя}</button>`).join('') }
  const адрес = () => `_page.html?v=${V}&game=${S.g}&stage=${S.i}&state=${МС.СТАДИИ[S.i][3]}`
  const загрузить = () => рамки.forEach((f) => { f.src = адрес() })
  const стадия = (i) => { S.i = i; кнопки(); рамки.forEach((f) => f.contentWindow?.postMessage({ ms: 'stage', i }, '*')) }
  const стоп = () => { clearInterval(S.play); S.play = null; play.setAttribute('aria-pressed', 'false'); play.textContent = '▶ Проиграть стадии' }

  tools.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return
    if (b === play) { if (S.play) return стоп(); play.setAttribute('aria-pressed', 'true'); play.textContent = '❚❚ Пауза'
      стадия((S.i + 1) % МС.СТАДИИ.length); S.play = setInterval(() => стадия((S.i + 1) % МС.СТАДИИ.length), 3500); return }
    if (b.closest('[data-g]')) { стоп(); S.g = b.dataset.v; b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); кнопки(); загрузить(); return }
    if (b.closest('[data-st]')) { стоп(); стадия(+b.dataset.v) }
  })
  addEventListener('message', (e) => { if (e.data?.ms === 'go') { стоп(); стадия(e.data.i) } })

  кнопки(); загрузить()
})()
