// gs-upgrade — «Сравнение с текущим вариантом» и одна ось «Вид» (дирижёр 10.11).
// Подключается первым скриптом в <head>: <script src="../gs-upgrade/_cmp.js" data-old="<текущая страница>"></script>
// Страница сама ставит window.LAB (панель песочницы) — перехватываем присваивание и отдаём песочнице обёртку:
// из осей остаётся только «Вид», из свитчей — только «Сравнение с текущим вариантом», подписи под осями нет.
// Сравнение включено — поверх страницы слева лежит текущая версия (iframe с теми же ?параметрами), справа видна новая;
// между ними ползунок, его тянут мышью или пальцем. Вид и прокрутка передаются в текущую версию.
// Включённое сравнение и место ползунка помнятся (localStorage) — открыл «На весь экран» или другую карточку, сравнение
// уже стоит; переключил в одном кадре — остальные открытые кадры подхватывают (событие storage) (дирижёр 10.11).
(() => {
  const me = document.currentScript
  // Без data-old (новости v4+, дирижёр 10.11: «убери сравнение с оригиналом») — только «Вид», без свитча сравнения
  const OLD = me.dataset.old ? new URL(me.dataset.old + location.search, me.src).href : null
  const KEY = 'gs-upgrade-cmp', KEYX = 'gs-upgrade-cmp-x'
  const load = (k) => { try { return localStorage.getItem(k) } catch (e) { return null } }
  const save = (k, v) => { try { localStorage.setItem(k, v) } catch (e) { /* без хранилища — до перезагрузки */ } }
  let real = null, on = !!OLD && load(KEY) === '1', x = null, box = null, ifr = null, clip = null, bar = null

  const syncView = () => { try { const L = ifr && ifr.contentWindow && ifr.contentWindow.LAB; const v = real && real.axes().find((a) => a.key === 'view'); if (L && v) L.set('view', v.value) } catch (e) { /* другая страница ещё грузится */ } }
  const syncScroll = () => { try { ifr && ifr.contentWindow.scrollTo(0, scrollY) } catch (e) { /* ещё грузится */ } }
  const place = () => {
    const w = innerWidth; if (x === null) x = w * (parseFloat(load(KEYX)) || 0.5); x = Math.max(0, Math.min(w, x))
    clip.style.clipPath = `inset(0 ${w - x}px 0 0)`; bar.style.left = x + 'px'
  }
  const open = () => {
    box = document.createElement('div'); box.className = 'cmp'
    box.innerHTML = `<style>
      .cmp{position:fixed;inset:0;z-index:2147483000;pointer-events:none}
      .cmp__old{position:absolute;inset:0;pointer-events:auto;background:#000}
      .cmp__old iframe{width:100%;height:100%;border:0;display:block}
      .cmp__bar{position:absolute;top:0;bottom:0;width:0;pointer-events:auto;cursor:ew-resize;touch-action:none}
      .cmp__bar::before{content:"";position:absolute;top:0;bottom:0;left:-2px;width:4px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
      .cmp__bar::after{content:"";position:absolute;top:0;bottom:0;left:-16px;width:32px}
      .cmp__grip{position:absolute;top:50vh;left:-22px;width:44px;height:44px;margin-top:-22px;border-radius:50%;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font:600 16px/1 Inter,system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.5);z-index:1}
      .cmp__tag{position:absolute;top:12px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.75);color:#fff;font:500 13px/1 Inter,system-ui,sans-serif;white-space:nowrap;pointer-events:none}
      .cmp__tag--old{right:14px}.cmp__tag--new{left:14px}
    </style>
    <div class="cmp__old"><iframe title="Текущий вариант"></iframe></div>
    <div class="cmp__bar"><span class="cmp__grip">‹ ›</span><span class="cmp__tag cmp__tag--old">Сейчас</span><span class="cmp__tag cmp__tag--new">Новое</span></div>`
    document.body.appendChild(box)
    clip = box.querySelector('.cmp__old'); bar = box.querySelector('.cmp__bar'); ifr = box.querySelector('iframe')
    ifr.addEventListener('load', () => { syncView(); syncScroll(); setTimeout(() => { syncView(); syncScroll() }, 800) })
    ifr.src = OLD
    bar.addEventListener('pointerdown', (e) => {
      e.preventDefault(); bar.setPointerCapture(e.pointerId); clip.style.pointerEvents = 'none'
      const move = (ev) => { x = ev.clientX; place() }
      const up = () => { save(KEYX, String(x / innerWidth)); bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); clip.style.pointerEvents = '' }
      bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up)
    })
    place()
  }
  const close = () => { if (box) box.remove(); box = ifr = clip = bar = null }
  const apply = () => { if (on && !box) open(); if (!on && box) close() }
  if (on) (document.body ? apply() : addEventListener('DOMContentLoaded', apply))
  addEventListener('storage', (e) => { if (!OLD) return; if (e.key === KEY) { on = e.newValue === '1'; apply() } if (e.key === KEYX && box) { x = null; place() } })
  addEventListener('scroll', syncScroll, { passive: true })
  addEventListener('resize', () => { if (box) place() })

  const wrap = (L) => ({
    ...L,
    axes: () => L.axes().filter((a) => a.key === 'view'),
    set(k, v) { L.set(k, v); if (k === 'view') syncView() },
    toggles: () => (OLD ? [{ key: 'cmp', name: 'Сравнение с текущим вариантом', value: on }] : []),
    toggle(k) { if (k !== 'cmp') return; on = !on; save(KEY, on ? '1' : '0'); apply() },
    caption: () => '',
  })
  Object.defineProperty(window, 'LAB', { configurable: true, get: () => real && wrap(real), set: (v) => { real = v } })
})()
