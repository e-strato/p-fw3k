// Лаба «Страница матча + блоки» (дирижёр 08.10: «вот эти блоки надо вернуть на страницу матча — покажи в лабе»).
// Сверху — нынешняя страница матча сайта как есть (match-page.html + match-page.js: шапка → 4 плитки → открытая плитка).
// Под ней — блоки страницы на 07.10 (v5 «Эфир сверху»): их строит старый скрипт _old.js в скрытом корне, отсюда берём .mp5-grid
// (основная колонка + узкая справа) и ставим под плитки. Стили блоков — _old.css (внутри .mpo). Состояние — ?game=dota|cs&state=pre|live|done.
;(async () => {
  const q = new URLSearchParams(location.search)
  const сайт = new DOMParser().parseFromString(await (await fetch('match-page.html')).text(), 'text/html')
  сайт.querySelectorAll('script').forEach(s => s.remove())
  document.body.innerHTML = сайт.body.innerHTML
  const скрипт = src => new Promise(ok => { const s = document.createElement('script'); s.src = src; s.onload = ok; document.body.append(s) })

  // 1. Старые блоки: старый скрипт рисует страницу 07.10 в скрытый корень — забираем сетку блоков под эфиром
  const старый = Object.assign(document.createElement('div'), { className: 'mp' }); старый.dataset.mpo = ''; старый.hidden = true
  document.body.append(старый)
  await скрипт('/lab-files/match-blocks/_old.js')
  const блоки = старый.querySelector('.mp5-grid')?.outerHTML || ''
  старый.remove()

  // 2. Нынешняя страница матча сайта
  await скрипт('match-page.js')
  await скрипт('app.js')
  const root = document.querySelector('[data-mp]')
  // Блоки — под плитками; страница перерисовывает себя по кликам — ставим блоки обратно после каждой перерисовки
  const вставить = () => { if (!root.querySelector('.mpo')) root.querySelector('.mp-body')?.insertAdjacentHTML('beforeend', `<div class="mpo">${блоки}</div>`) }
  вставить(); new MutationObserver(вставить).observe(root, { childList: true })
  if (q.get('scroll')) requestAnimationFrame(() => scrollTo(0, +q.get('scroll')))
  parent.postMessage({ mb: 'ready' }, '*')
})()
