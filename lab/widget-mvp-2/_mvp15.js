// Виджет MVP v15–v19 — семья v12 «Над виджетом» (дирижёр 22.10: «хороший вариант; в этой стилистике придумай 5 разных вариантов»).
// Общее с v12: карта «Хайперглитч» выходит за верх виджета, золото, рейтинг набегает; в матче MVP один — MVP матча, без переключения;
// на главной виды — турнир · неделя · месяц. У каждой версии одна своя идея (o.opt.style):
// 'stage' (v15) — сцена: прожекторы сверху и подиум под картой, под подписью три цифры строкой · обычная кнопка
// 'ribbon' (v16) — лента «MVP турнира» наискось через угол карты, за картой искры летят вверх вместо лучей
// 'faces' (v17) — переключение на главной — лица трёх MVP в ряд под картой (вместо точек), активное крупнее · обычная кнопка
// 'side' (v18) — карта сдвинута влево, справа столбик цифр (KDA · матчи · очки · место); подпись вида — над цифрами
// 'auto' (v19) — карта собирается глитч-полосами; на главной виды листаются сами каждые 5 с (полоски-истории сверху, наведение — пауза) · обычная кнопка
// ‼️ Цифры — пример (как в _hg.js / _mvp2.js). MVP15.render(узел, { match, mine, opt: { style } })
(() => {
  const { front, back, price, nb, rating, MINE } = window.MVP5
  const check = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const arrow = d => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="${d < 0 ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const face = v => front(v).replace(`<div class="g1__name">${v.label}</div>`, `<div class="g1__name">${v.sub}</div>`)
  const card = (v, cls, flip) => `<div class="kc kc--gold kc--legend g1 m10-card m12-card m15-card ${cls}"><div class="kc__in"><div class="kc__flip ${flip ? 'is-flip' : ''}"><div class="kc__face">${face(v)}</div><div class="kc__back">${back(v)}</div></div></div></div>`
  const cta = (v, o) => o.mine && MINE.includes(v.p.nick) ? `<span class="m7-cta is-mine">${check}<span>В твоём составе</span></span>`
    : `<a class="m7-cta" href="#" data-fan><span>Взять в фэнтези</span><b class="m7-price"><i></i>${nb(price(v.p))}</b></a>`
  // Место в рейтинге — из сдвига (prev) для недели и месяца; у турнира и матча — «1-е» (он и есть MVP)
  const nums = v => [['KDA', v.s.main], [v.s.maps ? 'карты' : 'матчей', v.s.m], ['очки', nb(v.s.pts)]]
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const tilt = k => { if (reduce()) return
    k.onpointermove = e => { const b = k.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height
      k.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); k.style.setProperty('--my', (y * 100).toFixed(1) + '%')
      k.style.setProperty('--dx', (x - .5).toFixed(3)); k.style.setProperty('--dy', (y - .5).toFixed(3)); k.classList.add('is-on') }
    k.onpointerleave = () => { k.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach(p => k.style.removeProperty(p)) } }

  // Фон за картой — свой у версии
  const bg = st => st === 'stage' ? '<i class="m15-spot is-l"></i><i class="m15-spot is-r"></i><i class="m15-podium"></i>'
    : st === 'ribbon' ? `<i class="m12-rays m16-rays"></i><span class="m16-sparks">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i * 0.53) % 3.2}s;--t:${3 + (i % 4) * .6}s;--s:${2 + (i % 3)}px"></i>`).join('')}</span>`
    : '<i class="m12-rays"></i>'

  // Переключатель видов на главной — свой у версии; в матче (vs.length === 1) его нет
  const nav = (st, vs, i, auto) => vs.length < 2 || auto ? '' : st === 'faces'
    ? `<div class="m17-faces">${vs.map((x, j) => `<button class="m17-face ${j === i ? 'is-on' : ''}" data-j="${j}" aria-label="${x.label}"><span class="m17-face__ph"><img src="${x.p.photo}" alt=""></span><small>${x.tab}</small></button>`).join('')}</div>`
    : st === 'auto' ? ''
    : `<div class="m12-nav"><button class="m12-arr" data-step="-1" aria-label="Предыдущий MVP">${arrow(-1)}</button><span class="m12-dots">${vs.map((x, j) => `<button class="${j === i ? 'is-on' : ''}" data-j="${j}" aria-label="${x.label}"></button>`).join('')}</span><button class="m12-arr" data-step="1" aria-label="Следующий MVP">${arrow(1)}</button></div>`
  // Полоски-истории (v19) — над подписью, заполняется текущая
  const stories = (vs, i) => vs.length < 2 ? '' : `<div class="m19-bars">${vs.map((x, j) => `<button class="${j < i ? 'is-done' : j === i ? 'is-on' : ''}" data-j="${j}" aria-label="${x.label}"><i></i></button>`).join('')}</div>`

  // o.opt.glitch — переход между видами как в v19 (карта собирается глитч-полосами) у любой версии; листание — своё, без автопрокрутки (дирижёр 22.10)
  function draw(el, vs, s, o) {
    const st = o.opt.style, auto = st === 'auto', gl = (auto || o.opt.glitch) && s.anim ? ' m19-glitch' : '', v = vs[s.i], anim = s.anim ? ' is-anim' : ''
    const what = `<div class="m12-what">${v.label}${st === 'stage' || st === 'side' ? '' : ' · KDA ' + v.s.main}</div>`
    const row = `<div class="m15-nums">${nums(v).map(([k, x]) => `<span><b>${x}</b><small>${k}</small></span>`).join('')}</div>`
    const main = st === 'side'
      ? `<div class="m12-stage m18-stage">${card(v, 'm10-live' + anim + gl, s.back)}<div class="m18-col${anim}"><span class="m18-lbl">${v.label}</span>${nums(v).map(([k, x]) => `<span class="m18-n"><b>${x}</b><small>${k}</small></span>`).join('')}${v.s.prev != null ? `<span class="m18-n"><b>${v.s.prev === 0 ? 'new' : v.s.prev === 1 ? '1-е' : '▲' + v.s.prev}</b><small>${v.s.prev === 0 ? 'впервые в топе' : v.s.prev === 1 ? 'держит место' : 'было место'}</small></span>` : ''}</div></div>`
      : `<div class="m12-stage">${st === 'ribbon' ? `<span class="m16-wrap${anim}">${card(v, 'm10-live', s.back)}<span class="m16-ribbon"><b>${v.label}</b></span></span>` : card(v, 'm10-live' + anim + gl, s.back)}</div>`
    el.className = `w m7 m10 m10--rise m15 m15--${st}` + (vs.length < 2 ? ' is-one' : '')
    el.innerHTML = bg(st) + main + (auto ? stories(vs, s.i) : '') + nav(st, vs, s.i, auto) + (st === 'side' ? '' : what) + (st === 'stage' ? row : '') + `<div class="m10-foot">${cta(v, o)}</div>`
    const go = j => { if (vs.length < 2) return; Object.assign(s, { i: (j + vs.length) % vs.length, back: false, anim: true }); draw(el, vs, s, o) }
    el.querySelectorAll('a[href="#"]').forEach(a => a.onclick = e => e.preventDefault())
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => +b.dataset.j !== s.i && go(+b.dataset.j))
    el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go(s.i + +b.dataset.step))
    const k = el.querySelector('.m15-card'); tilt(k)
    // Клик — оборот; свайп вбок больше 40 px — соседний вид (только на главной)
    let x0 = null, moved = false
    k.addEventListener('pointerdown', e => { x0 = e.clientX; moved = false })
    k.addEventListener('pointerup', e => { if (x0 == null) return; const z = k.getBoundingClientRect().width / k.offsetWidth || 1, dx = (e.clientX - x0) / z; x0 = null; if (Math.abs(dx) > 40 && vs.length > 1) { moved = true; go(s.i + (dx < 0 ? 1 : -1)) } })
    k.addEventListener('click', e => { if (moved || e.target.closest('a, button')) return; s.back = !s.back; k.querySelector('.kc__flip').classList.toggle('is-flip', s.back) })
    // Рейтинг набегает от 60 — при появлении карты
    const r = k.querySelector('.g1__ovr b'), to = rating(v.p)
    if (s.anim && r && !reduce()) { const t0 = performance.now(), d = st === 'auto' ? 900 : 700
      const tick = t => { const p = Math.min(1, (t - t0) / d); r.textContent = Math.round(60 + (to - 60) * (1 - Math.pow(1 - p, 3))); if (p < 1 && r.isConnected) requestAnimationFrame(tick) }
      r.textContent = 60; requestAnimationFrame(tick) }
    s.anim = false
    // v19: сами листаются каждые 5 с; наведение на виджет — пауза (полоска замирает)
    clearTimeout(el.m19); if (auto && vs.length > 1) { const bar = el.querySelector('.m19-bars .is-on i'), left = s.left ?? 5000
      let t0 = performance.now(), rest = left, paused = el.matches(':hover')
      const run = () => { t0 = performance.now(); bar.style.animation = `m19-fill ${rest}ms linear forwards`; bar.style.setProperty('--from', (1 - rest / 5000) * 100 + '%'); el.m19 = setTimeout(() => { s.left = 5000; go(s.i + 1) }, rest) }
      const stop = () => { clearTimeout(el.m19); rest = Math.max(0, rest - (performance.now() - t0)); bar.style.animationPlayState = 'paused' }
      el.onpointerenter = () => { paused = true; stop() }
      el.onpointerleave = () => { if (!paused) return; paused = false; bar.style.animation = 'none'; void bar.offsetWidth; run() }
      if (paused) bar.style.setProperty('--p', (1 - rest / 5000) * 100 + '%'); else run() }
  }
  function render(el, o) {
    const s = o.s || (o.s = { i: 0, back: false, anim: true }), all = MVP2.views(o)
    draw(el, o.match ? all.slice(0, 1) : all, s, o) // в матче MVP один — MVP матча (дирижёр 22.10)
  }
  window.MVP15 = { render }
})()
