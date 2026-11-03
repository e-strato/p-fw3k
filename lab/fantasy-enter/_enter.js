// Лаба «Вход в фэнтези»: с сайта cybersport.com на другой сайт fantasy.cybersport.com.
// Фэнтези заранее не подгружено: нажал виджет «Твои игроки сегодня» на главной → от места клика кругом расходятся точки
// и закрывают сайт → загрузка → страница фэнтези проявляется поверх фона в точках. Механика одна, варианты — стиль.
// <body data-style>: violet · gold · halftone · neon. <body data-skeleton> — вместо значка загрузки каркас будущей страницы.

const ФЭНТЕЗИ = /(lineup|gallery|cards|chest)\.html/
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const МИН_ЗАГРУЗКА = 1800 // мс: как будто другой сайт грузится по сети

// Стили: два цвета по ширине экрана, тёмная основа, форма и шаг точек.
const СТИЛИ = {
  violet: { c1: [140, 103, 235], c2: [64, 190, 255], основа: '#0b0a14', форма: 'круг', шаг: 22 },
  gold: { c1: [233, 200, 97], c2: [255, 138, 60], основа: '#0d0b07', форма: 'круг', шаг: 18 },
  halftone: { c1: [235, 235, 245], c2: [170, 150, 255], основа: '#08080a', форма: 'полутон', шаг: 14 },
  neon: { c1: [255, 60, 200], c2: [40, 230, 255], основа: '#07060d', форма: 'крест', шаг: 26 },
}
const С = СТИЛИ[document.body.dataset.style] || СТИЛИ.violet
const цвет = (д, a) => `rgba(${С.c1.map((v, j) => Math.round(v + (С.c2[j] - v) * д))},${a})`
document.body.style.setProperty('--fe-acc', цвет(0.2, 1))
const КАРКАС = 'skeleton' in document.body.dataset

const st = document.querySelector('.fe-stage'), адрес = document.querySelector('.fe-url b'), VW = 1440, VH = 900
st.innerHTML = `<iframe title="Сайт" src="/p-fw3k/site/index.html"></iframe>
  <div class="fe-fan"><canvas></canvas>
    <div class="fe-load"><b>Fantasy</b><small>cybersport</small><span><i></i><i></i><i></i><i></i><i></i></span><em>Загружаем фэнтези</em></div>
    <div class="fe-skel"></div>
    <div class="fe-fanpage"><iframe title="Фэнтези"></iframe></div></div>
  <canvas class="fe-front"></canvas>`
const [сайт, фан] = st.querySelectorAll('iframe'), слой = st.querySelector('.fe-fan'), скелет = st.querySelector('.fe-skel')
const фон = слой.querySelector('canvas'), фронт = st.querySelector('.fe-front')
const cb = фон.getContext('2d'), cf = фронт.getContext('2d')
for (const f of [сайт, фан]) { f.width = VW; f.height = VH }
скелет.style.width = VW + 'px'; скелет.style.height = VH + 'px'

let s = 1, W = 0, H = 0, dpr = 1
const подогнать = () => {
  s = st.clientWidth / VW; dpr = Math.min(devicePixelRatio, 1.5); W = st.clientWidth; H = VH * s
  st.style.height = H + 'px'; for (const el of [сайт, фан, скелет]) el.style.transform = `scale(${s})`
  for (const c of [фон, фронт]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) }
}
new ResizeObserver(подогнать).observe(st); подогнать()

// ——— Каркас будущей страницы ———
// В продукте каркас рисуется заранее по макету Состава. Здесь снимаем его с настоящей страницы один раз при открытии лабы:
// текст — полосы, картинки и аватары — плотные блоки, карточки — контуры; всё из точек.
if (КАРКАС) {
  const тень = document.createElement('iframe')
  тень.width = VW; тень.height = VH; тень.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden'
  тень.src = '/p-fw3k/site/lineup.html'; document.body.append(тень)
  тень.addEventListener('load', () => setTimeout(() => {
    const d = тень.contentDocument, w = тень.contentWindow, блоки = []
    const в = (r) => r.width > 2 && r.height > 2 && r.top < VH && r.bottom > 0 && r.left < VW
    for (const el of d.body.querySelectorAll('*')) {
      const cs = w.getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue
      const r = el.getBoundingClientRect(); if (!в(r)) continue
      const картинка = el.tagName === 'IMG' || el.tagName === 'svg' || el.tagName === 'CANVAS' || (cs.backgroundImage !== 'none' && !cs.backgroundImage.includes('gradient'))
      if (картинка) { блоки.push(['img', r, cs.borderRadius]); continue }
      const фонЕсть = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && el !== d.body && el.tagName !== 'HTML'
      if (фонЕсть && r.width < VW - 40) блоки.push(['box', r, cs.borderRadius])
      for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { // строки текста
        const rg = d.createRange(); rg.selectNodeContents(n)
        for (const tr of rg.getClientRects()) if (в(tr)) блоки.push(['txt', tr, '999px'])
      }
    }
    скелет.innerHTML = блоки.map(([т, r, рад]) => `<i class="fe-skel__${т}" style="left:${r.left}px;top:${r.top + (т === 'txt' ? r.height * 0.2 : 0)}px;width:${r.width}px;height:${т === 'txt' ? r.height * 0.6 : r.height}px;border-radius:${рад}"></i>`).join('')
    тень.remove()
  }, 400))
}

// ——— Состояние: p 0 — сайт, 1 — круг закрыл экран ———
let p = 0, цель = 0, x0 = W / 2, y0 = H / 2, старт = 0, загружено = false
const R = () => Math.hypot(Math.max(x0, W - x0), Math.max(y0, H - y0))
const АДРЕС_САЙТА = адрес.textContent

function войти(x, y) {
  if (старт) return
  x0 = x * s; y0 = y * s; старт = performance.now(); загружено = false; цель = 1
  st.classList.add('is-loading'); st.classList.remove('is-ready')
  адрес.textContent = 'fantasy.cybersport.com/lineup'
  фан.src = '/p-fw3k/site/lineup.html?t=' + Date.now()
}
function выйти() {
  старт = 0; цель = 0; st.classList.remove('is-loading', 'is-ready'); адрес.textContent = АДРЕС_САЙТА
  setTimeout(() => { if (!старт) фан.removeAttribute('src') }, 1200)
}

// Подсветка виджета на сайте: свечение по контуру и подпись; клик в любом месте виджета — вход.
const ПОДСВЕТКА = `.w-lineup { position: relative; cursor: pointer; animation: fe-glow 1.6s ease-in-out infinite; }
  .w-lineup::after { content: 'Нажми на виджет — откроется фэнтези'; position: absolute; left: 50%; top: -14px; transform: translate(-50%, -100%);
    padding: 6px 12px; border-radius: 999px; background: var(--c-accent); color: #fff; font: 600 13px var(--font); white-space: nowrap; }
  @keyframes fe-glow { 0%, 100% { box-shadow: 0 0 0 2px var(--c-accent), 0 0 24px -4px var(--c-accent); } 50% { box-shadow: 0 0 0 2px var(--c-accent), 0 0 48px 4px var(--c-accent); } }`
сайт.addEventListener('load', () => {
  const d = сайт.contentDocument, w = d.querySelector('.w-lineup'); if (!w) return
  const css = d.createElement('style'); css.textContent = ПОДСВЕТКА; d.head.append(css)
  w.scrollIntoView({ block: 'center' })
  w.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); войти(e.clientX, e.clientY) }, true)
})
фан.addEventListener('load', () => {
  if (!фан.getAttribute('src')) return
  const d = фан.contentDocument, css = d.createElement('style'); css.textContent = 'html, body { background: transparent !important; }'; d.head.append(css)
  d.addEventListener('click', (e) => { const a = e.target.closest('a[href]'); if (a && !a.getAttribute('href').startsWith('#') && !ФЭНТЕЗИ.test(a.getAttribute('href'))) { e.preventDefault(); выйти() } }, true)
  загружено = true
})
document.querySelector('[data-out]').addEventListener('click', выйти)

// ——— Точка по стилю: круг, крест или полутон (размер от яркости) ———
function точка(c, x, y, р, a, д) {
  c.fillStyle = цвет(д, a)
  if (С.форма === 'крест') { const т = Math.max(1, р * 0.45); c.fillRect(x - р, y - т / 2, р * 2, т); c.fillRect(x - т / 2, y - р, т, р * 2); return }
  c.beginPath(); c.arc(x, y, р, 0, 7); c.fill()
}

// ——— Фон фэнтези: сетка точек, свечение снизу, рябь от места клика ———
function фонТочки(t) {
  const c = cb, w = фон.width, h = фон.height, шаг = С.шаг * dpr
  c.fillStyle = С.основа; c.fillRect(0, 0, w, h)
  const g = c.createRadialGradient(w * 0.5, h * 1.05, 0, w * 0.5, h * 1.05, w * 0.7)
  g.addColorStop(0, цвет(0.3, 0.28)); g.addColorStop(1, цвет(0.3, 0)); c.fillStyle = g; c.fillRect(0, 0, w, h)
  for (let y = шаг / 2; y < h; y += шаг) for (let x = шаг / 2; x < w; x += шаг) {
    const рябь = Math.sin(Math.hypot(x - x0 * dpr, y - y0 * dpr) / (60 * dpr) - t * 1.6) * 0.5 + 0.5, низ = 0.4 + 0.6 * y / h
    if (С.форма === 'полутон') точка(c, x, y, (0.4 + 2.4 * рябь * низ) * dpr, 0.22 + 0.3 * низ, x / w)
    else if (С.форма === 'крест') точка(c, x, y, 3 * dpr, 0.10 + 0.35 * рябь * низ, x / w)
    else { c.fillStyle = цвет(x / w, 0.12 + 0.35 * рябь * низ); c.fillRect(x - dpr, y - dpr, 2 * dpr, 2 * dpr) }
  }
}

// ——— Фронт: круг растёт от места клика, по краю — кольцо крупных ярких точек ———
function маска(k) {
  const r = k * R(), c = cf, w = фронт.width, h = фронт.height
  слой.style.clipPath = k >= 1 ? 'none' : `circle(${r}px at ${x0}px ${y0}px)`
  c.clearRect(0, 0, w, h); if (k <= 0 || k >= 1) return
  const шаг = С.шаг * dpr, rr = r * dpr, ширина = (С.форма === 'полутон' ? 140 : 90) * dpr
  for (let y = шаг / 2; y < h; y += шаг) for (let x = шаг / 2; x < w; x += шаг) {
    const d = Math.hypot(x - x0 * dpr, y - y0 * dpr) - rr
    if (d < -ширина || d > ширина * 0.3) continue
    const сила = 1 - Math.abs(d) / ширина
    const р = С.форма === 'полутон' ? (0.5 + (С.шаг / 2) * сила) * dpr : (1.5 + 3.5 * сила) * dpr
    точка(c, x, y, р, 0.25 + 0.75 * сила, x / w)
  }
}

let прошлое = performance.now()
function кадр(now) {
  const dt = Math.min(0.05, (now - прошлое) / 1000); прошлое = now
  p += Math.sign(цель - p) * Math.min(Math.abs(цель - p), dt / 0.9)
  const k = ease(p)
  if (старт && загружено && k >= 1 && now - старт >= МИН_ЗАГРУЗКА && !st.classList.contains('is-ready')) { st.classList.remove('is-loading'); st.classList.add('is-ready') }
  слой.style.visibility = k > 0 ? 'visible' : 'hidden'
  if (k > 0) фонТочки(now / 1000)
  маска(k)
  requestAnimationFrame(кадр)
}
requestAnimationFrame(кадр)
