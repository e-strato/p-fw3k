// Лаба «Стадии матча»: внутри рамки — страница матча сайта как есть (match-page.html + match-page.js), виджет стадий — в карточке трансляции.
// Карточка: в эфире — видео .mp-tv и счёт строкой .mp-pscore, до и после — карточка матча .mp-top. Сайт не трогаем: кладём виджет в его разметку
// и возвращаем после каждой перерисовки страницы. v5 — внутрь карточки, v6 и v7 — приклеены снизу к ней. Виджет рисует _ms-data.js (window.МС).
// Страница-вариант шлёт сюда { ms: 'stage', i } — меняем виджет на месте; если меняется состояние страницы (до / эфир / после) — перезагружаемся.
;(async () => {
  const q = new URLSearchParams(location.search)
  const S = { v: +q.get('v') || 5, g: q.get('game') === 'cs' ? 'cs' : 'dota', i: +q.get('stage') || 0, выбор: null, открыт: false }
  const сайт = new DOMParser().parseFromString(await (await fetch('match-page.html')).text(), 'text/html')
  сайт.querySelectorAll('script').forEach((s) => s.remove())
  document.body.insertAdjacentHTML('afterbegin', сайт.body.innerHTML)
  const скрипт = (src) => new Promise((ok) => { const s = document.createElement('script'); s.src = src; s.onload = ok; document.body.append(s) })
  await скрипт('match-page.js')
  await скрипт('app.js')

  const root = document.querySelector('[data-mp]')
  const host = Object.assign(document.createElement('div'), { className: `ms-host ms-host--v${S.v}` })
  const поставить = () => {
    if (host.isConnected) return
    const tv = root.querySelector('.mp-tv'), карта = tv || root.querySelector('.mp-top')
    if (!карта) return
    if (S.v === 5) { карта.append(host); return }
    const низ = tv ? root.querySelector('.mp-pscore') : карта // в эфире снизу карточки — счёт строкой
    низ.classList.add('ms-glued'); низ.after(host)
  }
  const draw = (новая) => {
    host.innerHTML = МС.виджет[S.v](S.g, S.i, S.выбор, S.открыт)
    if (новая) { host.classList.remove('is-in'); void host.offsetWidth; host.classList.add('is-in') }
  }
  поставить(); draw(true)
  new MutationObserver(поставить).observe(root, { childList: true })

  host.addEventListener('click', (e) => {
    const o = e.target.closest('[data-pick]')
    if (o) { S.выбор = S.выбор === +o.dataset.pick ? null : +o.dataset.pick; draw(); return }
    if (e.target.closest('[data-fold]')) { S.открыт = !S.открыт; draw(); return }
    const go = e.target.closest('[data-go]')
    if (go) parent.postMessage({ ms: 'go', i: +go.dataset.go }, '*')
  })
  addEventListener('message', (e) => {
    if (!e.data || e.data.ms !== 'stage') return
    const i = e.data.i
    if (МС.СТАДИИ[i][3] !== МС.СТАДИИ[S.i][3]) { q.set('stage', i); q.set('state', МС.СТАДИИ[i][3]); location.replace(location.pathname + '?' + q); return }
    S.i = i; S.выбор = null; draw(true)
  })
  parent.postMessage({ ms: 'ready' }, '*')
})()
