// Виджет MVP v10–v13 — то же направление, что v7–v9 (дирижёр 22.10: «правильное направление; где-то систематизировать, где-то ещё смелее»).
// Карта — «v1 · Хайперглитч» (MVP5.front / back из _hg.js), виды MVP — MVP2.views; play и сегментов-таблеток нет.
// Систематизированные: 'strip' (v10) — карта и под ней ровная лента из трёх MVP-миниатюр (выбор вида), одна раскладка на все экраны ·
// 'list' (v11) — список трёх MVP строками одной сетки, активная строка раскрывается в карту (аккордеон).
// Смелее: 'rise' (v12) — карта выходит за верх виджета, рейтинг набегает счётчиком, за картой лучи; виды — свайпом / точками на карте ·
// 'ring' (v13) — 3D-витрина: три карты на вращающемся кольце, тянешь или жмёшь стрелку — кольцо поворачивается, передняя — живая.
// ‼️ Цифры — пример (как в _hg.js / _mvp2.js). MVP10.render(узел, { match, mine, opt: { style } })
(() => {
  const { front, back, price, nb, rating, MINE } = window.MVP5
  const check = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const arrow = d => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="${d < 0 ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const face = v => front(v).replace(`<div class="g1__name">${v.label}</div>`, `<div class="g1__name">${v.sub}</div>`)
  const card = (v, cls = '', flip = false) => `<div class="kc kc--gold kc--legend g1 m10-card ${cls}"><div class="kc__in"><div class="kc__flip ${flip ? 'is-flip' : ''}"><div class="kc__face">${face(v)}</div><div class="kc__back">${back(v)}</div></div></div></div>`
  const cta = (v, o) => o.mine && MINE.includes(v.p.nick) ? `<span class="m7-cta is-mine">${check}<span>В твоём составе</span></span>`
    : `<a class="m7-cta" href="#" data-fan><span>Взять в фэнтези</span><b class="m7-price"><i></i>${nb(price(v.p))}</b></a>`
  const what = v => `${v.label} · KDA ${v.s.main}`
  const tilt = k => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    k.onpointermove = e => { const b = k.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height
      k.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); k.style.setProperty('--my', (y * 100).toFixed(1) + '%')
      k.style.setProperty('--dx', (x - .5).toFixed(3)); k.style.setProperty('--dy', (y - .5).toFixed(3)); k.classList.add('is-on') }
    k.onpointerleave = () => { k.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach(p => k.style.removeProperty(p)) } }
  const live = (el, s) => { el.querySelectorAll('a[href="#"]').forEach(a => a.onclick = e => e.preventDefault())
    el.querySelectorAll('.m10-live').forEach(k => { tilt(k); k.onclick = e => { if (e.target.closest('a, button')) return; s.back = !s.back; k.querySelector('.kc__flip').classList.toggle('is-flip', s.back) } }) }

  // ——— v10 · Лента: карта + три миниатюры одной сеткой ———
  const strip = (el, vs, s, o) => { const v = vs[s.i]
    el.innerHTML = `<div class="m10-stage ${s.anim ? 'is-anim' : ''}">${card(v, 'm10-live', s.back)}</div>
      <div class="m10-strip">${vs.map((x, j) => `<button class="m10-th ${j === s.i ? 'is-on' : ''}" data-j="${j}"><span class="m10-th__ph"><img src="${x.p.photo}" alt=""><b>${rating(x.p)}</b></span><span class="m10-th__t">${x.tab}</span><span class="m10-th__n">${x.p.nick}</span></button>`).join('')}</div>
      <div class="m10-foot">${cta(v, o)}</div>`
    s.anim = false; live(el, s)
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { if (+b.dataset.j === s.i) return; Object.assign(s, { i: +b.dataset.j, back: false, anim: true }); strip(el, vs, s, o) }) }

  // ——— v11 · Список: три MVP строками, активная раскрыта в карту ———
  const list = (el, vs, s, o) => {
    el.innerHTML = `<div class="m11-list">${vs.map((x, j) => j === s.i
      ? `<div class="m11-open ${s.anim ? 'is-anim' : ''}"><div class="m11-row is-on"><span class="m11-row__t">${x.label}</span><span class="m11-row__s">${x.sub}</span></div>${card(x, 'm10-live', s.back)}${cta(x, o)}</div>`
      : `<button class="m11-row" data-j="${j}"><img class="m11-ph" src="${x.p.photo}" alt=""><span class="m11-row__m"><span class="m11-row__t">${x.label}</span><b>${x.p.nick}</b></span><span class="m11-row__k"><b>${x.s.main}</b><small>KDA</small></span><span class="m11-rt">${rating(x.p)}</span></button>`).join('')}</div>`
    s.anim = false; live(el, s)
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { Object.assign(s, { i: +b.dataset.j, back: false, anim: true }); list(el, vs, s, o) }) }

  // ——— v12 · Над виджетом: карта выходит за верх, рейтинг набегает, виды — свайпом и точками ———
  const rise = (el, vs, s, o) => { const v = vs[s.i]
    el.innerHTML = `<i class="m12-rays"></i><div class="m12-stage">${card(v, 'm10-live m12-card' + (s.anim ? ' is-anim' : ''), s.back)}</div>
      ${vs.length > 1 ? `<div class="m12-nav"><button class="m12-arr" data-step="-1" aria-label="Предыдущий MVP">${arrow(-1)}</button><span class="m12-dots">${vs.map((x, j) => `<button class="${j === s.i ? 'is-on' : ''}" data-j="${j}" aria-label="${x.label}"></button>`).join('')}</span><button class="m12-arr" data-step="1" aria-label="Следующий MVP">${arrow(1)}</button></div>` : ''}
      <div class="m12-what">${what(v)}</div><div class="m10-foot">${cta(v, o)}</div>`
    const go = j => { Object.assign(s, { i: (j + vs.length) % vs.length, back: false, anim: true }); rise(el, vs, s, o) }
    live(el, s)
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => +b.dataset.j !== s.i && go(+b.dataset.j))
    el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go(s.i + +b.dataset.step))
    // Свайп по карте: тянем вбок больше 40 px — следующий / предыдущий (без клика-оборота)
    const k = el.querySelector('.m12-card'); let x0 = null, moved = false
    k.addEventListener('pointerdown', e => { x0 = e.clientX; moved = false })
    k.addEventListener('pointerup', e => { if (x0 == null) return; const z = k.getBoundingClientRect().width / k.offsetWidth || 1, dx = (e.clientX - x0) / z; x0 = null; if (Math.abs(dx) > 40 && vs.length > 1) { moved = true; go(s.i + (dx < 0 ? 1 : -1)) } })
    k.addEventListener('click', e => { if (moved) e.stopImmediatePropagation() }, true)
    // Рейтинг набегает от 60 до своего числа — только при появлении карты
    const r = k.querySelector('.g1__ovr b'), to = rating(v.p)
    if (s.anim && r && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const t0 = performance.now(), from = 60
      const tick = t => { const p = Math.min(1, (t - t0) / 700); r.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1 && r.isConnected) requestAnimationFrame(tick) }
      r.textContent = from; requestAnimationFrame(tick) }
    s.anim = false }

  // ——— v13 · Кольцо: три карты на вращающемся 3D-кольце ———
  // Кольцо рисуется один раз, поворот — сменой --a (анимируется, @property в _mvp10.css): перерисовка сбросила бы анимацию
  const ring = (el, vs, s, o) => { const n = vs.length
    el.innerHTML = `<div class="m13-scene"><div class="m13-ring">${vs.map((x, j) => `<div class="m13-face" style="--r:${j * 360 / n}deg" data-j="${j}">${card(x, 'm10-live')}</div>`).join('')}</div><i class="m13-floor"></i></div>
      <div class="m12-nav"><button class="m12-arr" data-step="-1" aria-label="Повернуть назад">${arrow(-1)}</button><span class="m13-lbl"></span><button class="m12-arr" data-step="1" aria-label="Повернуть вперёд">${arrow(1)}</button></div>
      <div class="m10-foot"></div>`
    const R = el.querySelector('.m13-ring'), faces = [...el.querySelectorAll('.m13-face')], lbl = el.querySelector('.m13-lbl'), foot = el.querySelector('.m10-foot')
    const show = () => { const v = vs[s.i]; R.style.setProperty('--a', -s.turn * 360 / n + 'deg')
      faces.forEach((f, j) => { f.classList.toggle('is-front', j === s.i); f.querySelector('.kc__flip').classList.remove('is-flip') })
      lbl.innerHTML = `<b>${v.label}</b><small>${v.sub}</small>`; foot.innerHTML = cta(v, o); foot.querySelectorAll('a[href="#"]').forEach(a => a.onclick = e => e.preventDefault()) }
    // turn — сколько шагов повернули (без сброса — кольцо крутится дальше, а не отматывается назад)
    const go = d => { s.turn += d; s.i = ((s.turn % n) + n) % n; s.back = false; show() }
    faces.forEach(f => { const k = f.querySelector('.kc'); tilt(k)
      f.onclick = () => { const j = +f.dataset.j; if (j === s.i) { k.querySelector('.kc__flip').classList.toggle('is-flip'); return } go(((j - s.i) % n + n) % n === 1 ? 1 : -1) } })
    el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go(+b.dataset.step))
    const sc = el.querySelector('.m13-scene'); let x0 = null
    sc.addEventListener('pointerdown', e => { x0 = e.clientX })
    sc.addEventListener('pointerup', e => { if (x0 == null) return; const z = sc.getBoundingClientRect().width / sc.offsetWidth || 1, dx = (e.clientX - x0) / z; x0 = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1) })
    show() }

  function render(el, o) {
    const style = (o.opt || {}).style || 'strip', s = o.s || (o.s = { i: 0, turn: 0, back: false, anim: true })
    // v12: в матче MVP один — MVP матча, без недели и месяца (дирижёр 22.10)
    const vs = style === 'rise' && o.match ? MVP2.views(o).slice(0, 1) : MVP2.views(o)
    el.className = 'w m7 m10 m10--' + style
    ;({ strip, list, rise, ring })[style](el, vs, s, o)
  }
  window.MVP10 = { render }
})()
