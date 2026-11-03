// Лаба «промо-турнира»: общее поведение — переключатель состояний виджета, отсчёт, счётчик денег.
// Состояние: кнопки .lab-st [data-go="до"] показывают элементы [data-st~="до"] (класс .is-st). ?st=… — сразу нужное.
(() => {
  const btns = [...document.querySelectorAll('.lab-st [data-go]')]
  const set = (st) => {
    document.documentElement.dataset.state = st
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.go === st)))
    document.querySelectorAll('[data-st]').forEach((el) => el.classList.toggle('is-st', el.dataset.st.split(' ').includes(st)))
    document.dispatchEvent(new CustomEvent('промо:состояние', { detail: st }))
  }
  btns.forEach((b) => b.addEventListener('click', () => set(b.dataset.go)))
  const q = new URLSearchParams(location.search).get('st')
  const first = q || btns[0]?.dataset.go || ''
  set(first)
  // Повтор после скриптов варианта — чтобы их обработчики тоже увидели стартовое состояние
  document.addEventListener('DOMContentLoaded', () => set(first))

  // Отсчёт: [data-cd="секунд от загрузки"] → внутри [data-d] [data-h] [data-m] [data-s]
  const t0 = Date.now()
  const pad = (n) => String(n).padStart(2, '0')
  const tick = () => {
    document.querySelectorAll('[data-cd]').forEach((el) => {
      let s = Math.max(0, Math.round(+el.dataset.cd - (Date.now() - t0) / 1000))
      const d = Math.floor(s / 86400); s -= d * 86400
      const h = Math.floor(s / 3600); s -= h * 3600
      const m = Math.floor(s / 60); s -= m * 60
      const put = (k, v) => el.querySelectorAll(`[data-${k}]`).forEach((n) => (n.textContent = v))
      put('d', d); put('h', pad(h)); put('m', pad(m)); put('s', pad(s))
    })
  }
  tick(); setInterval(tick, 1000)

  // Настоящая главная (дирижёр 05.10): берём собранную /p-fw3k/site/index.html (шапка + главная), ставим виджет варианта на его место
  // по data-slot у .home: «replace:сел» — вместо блока, «into:сел» — внутрь ячейки вместо содержимого, «prepend:сел» — первым в ячейку,
  // «before:сел» / «after:сел» — отдельной строкой до / после. Пути сайта (img/…, chest.html) переписываем на /p-fw3k/site/. Поведение — /p-fw3k/site/app.js.
  const home = document.querySelector('.home[data-slot]')
  if (home) {
    const w = home.querySelector(':scope > section') // не вынимаем заранее: скрипты варианта уже нашли свои элементы внутри
    fetch('/p-fw3k/site/index.html').then((r) => r.text()).then((t) => {
      const doc = new DOMParser().parseFromString(t.replace(/(src|href)="(?!https?:|\/|#|mailto:|data:)/g, '$1="/p-fw3k/site/').replace(/url\((['"]?)img\//g, 'url($1/site/img/'), 'text/html')
      doc.querySelectorAll('script').forEach((x) => x.remove())
      const box = document.createElement('div'); box.className = 'home-real'; box.innerHTML = doc.body.innerHTML
      home.replaceWith(box)
      const [mode, sel] = home.dataset.slot.split(':'), at = box.querySelector(sel)
      w.classList.add('promo-w')
      if (mode === 'replace') at.replaceWith(w)
      else if (mode === 'into') at.replaceChildren(w)
      else if (mode === 'prepend') at.prepend(w)
      else if (mode === 'before') at.before(w)
      else at.after(w)
      const sc = document.createElement('script'); sc.src = '/p-fw3k/site/app.js'; document.body.append(sc)
      w.scrollIntoView({ block: 'nearest' }) // виджеты наверху — страница не прыгает
    })
  }

  window.ПРОМО = {
    set,
    money: (n) => '$' + Math.round(n).toLocaleString('ru-RU'),
  }
})()
