// Виджет MVP v7–v9 — смелые концепты (дирижёр 22.10: «акцент — карточка; play и сегмент сверху — нет; делай концепты смелее»).
// Карта — «v1 · Хайперглитч» (MVP5.front / back из _hg.js), виды MVP — MVP2.views. Переключение видов встроено в подачу:
// 'deck' (v7) — колода веером: активная карта спереди, две другие выглядывают по бокам, клик — вытащить вперёд; клик по передней — оборот;
// 'pack' (v8) — пак: запечатанная рубашка «MVP …» → вскрыть → глитч-вспышка → карта; другие виды — запечатанные паки внизу;
// 'full' (v9) — виджет = карта во всю ширину; виды — в язычке карты слева (Турнир / Неделя / Месяц), CTA — язычком под картой.
// Фэнтези — одна CTA «Взять в фэнтези · цена» (уже в составе — «В твоём составе ✓»). ‼️ Цифры — пример (как в _hg.js / _mvp2.js).
// MVP7.render(узел, { match, mine, opt: { style } })
(() => {
  const { front, back, price, nb, MINE } = window.MVP5
  const D = window.MVP_DATA
  const check = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  // На карте под ником — турнир / период (вид MVP — в подписи под картой, без дубля)
  const face7 = v => front(v).replace(`<div class="g1__name">${v.label}</div>`, `<div class="g1__name">${v.sub}</div>`)
  const card = (v, cls = '') => `<div class="kc kc--gold kc--legend g1 m7-card ${cls}"><div class="kc__in"><div class="kc__flip"><div class="kc__face">${face7(v)}</div><div class="kc__back">${back(v)}</div></div></div></div>`
  const cta = (v, o) => o.mine && MINE.includes(v.p.nick) ? `<span class="m7-cta is-mine">${check}<span>В твоём составе</span></span>`
    : `<a class="m7-cta" href="#" data-fan><span>Взять в фэнтези</span><b class="m7-price"><i></i>${nb(price(v.p))}</b></a>`
  const cap = v => `<div class="m7-cap"><b>${v.label}</b><span>KDA ${v.s.main} · ${v.s.m} ${v.s.maps ? 'карты' : 'матчей'}</span></div>`

  // Наклон и блик за курсором (как карточка-v3): --mx/--my, --dx/--dy на .kc
  const tilt = k => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    k.onpointermove = e => { const b = k.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height
      k.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); k.style.setProperty('--my', (y * 100).toFixed(1) + '%')
      k.style.setProperty('--dx', (x - .5).toFixed(3)); k.style.setProperty('--dy', (y - .5).toFixed(3)); k.classList.add('is-on') }
    k.onpointerleave = () => { k.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach(p => k.style.removeProperty(p)) } }
  const flipOnClick = k => k.addEventListener('click', () => k.querySelector('.kc__flip').classList.toggle('is-flip'))

  // ——— v7 · Колода веером ———
  // Позиции: 0 — спереди по центру, 1 — сзади справа, 2 — сзади слева. Клик по задней — она уходит вперёд, остальные сдвигаются по кругу
  const deck = (el, vs, s, o) => {
    el.innerHTML = `<div class="m7-deck">${vs.map((v, j) => `<div class="m7-slot" data-j="${j}">${card(v)}</div>`).join('')}<button class="m7-side is-l" data-side="2"></button><button class="m7-side is-r" data-side="1"></button></div>
      <div class="m7-foot"></div>`
    const slots = [...el.querySelectorAll('.m7-slot')], foot = el.querySelector('.m7-foot')
    // Подписи задних карт — под колодой у своего края («‹ Месяц» слева, «Неделя ›» справа), клик — та карта вперёд
    const sides = [...el.querySelectorAll('[data-side]')]
    const place = () => { slots.forEach(sl => { const j = +sl.dataset.j, p = (j - s.i + vs.length) % vs.length; sl.dataset.p = p })
      sides.forEach(b => { const j = (s.i + +b.dataset.side) % vs.length; b.dataset.j = j; b.textContent = b.classList.contains('is-l') ? '‹ ' + vs[j].tab : vs[j].tab + ' ›' })
      foot.innerHTML = cap(vs[s.i]) + cta(vs[s.i], o); foot.querySelectorAll('a[href="#"]').forEach(a => a.onclick = e => e.preventDefault())
      foot.classList.remove('is-in'); void foot.offsetWidth; foot.classList.add('is-in') }
    sides.forEach(b => b.onclick = () => { slots.forEach(x => x.querySelector('.kc__flip').classList.remove('is-flip')); s.i = +b.dataset.j; place() })
    slots.forEach(sl => { const k = sl.querySelector('.kc'); tilt(k)
      sl.addEventListener('click', () => { const j = +sl.dataset.j
        if (j === s.i) { k.querySelector('.kc__flip').classList.toggle('is-flip'); return }
        slots.forEach(x => x.querySelector('.kc__flip').classList.remove('is-flip')); s.i = j; place() }) })
    place() }

  // ——— v8 · Пак ———
  const packFace = (v, small) => `<div class="m7-pack ${small ? 'is-sm' : ''}"><i class="m7-pack__foil"></i><i class="m7-pack__shine"></i>
    <span class="m7-pack__top">${D.games[0] && D.games[0].logo ? `<img src="${D.games[0].logo}" alt="">` : ''}<span>Dota 2</span></span>
    <span class="m7-pack__mvp">MVP</span><span class="m7-pack__what">${v.tab.toLowerCase() === 'матч' ? 'матча' : v.tab === 'Турнир' ? 'турнира' : v.tab === 'Неделя' ? 'недели' : 'месяца'}</span>
    ${small ? '' : '<span class="m7-pack__go">Вскрыть</span>'}</div>`
  const pack = (el, vs, s, o) => {
    const v = vs[s.i], open = s.open && s.open[s.i]
    el.innerHTML = `<div class="m7-stage8">${open ? `<div class="m7-reveal ${s.anim ? 'is-anim' : ''}">${card(v)}<i class="m7-flash"></i></div>` : `<button class="m7-packbtn" data-open>${packFace(v)}</button>`}</div>
      <div class="m7-foot is-in">${open ? cap(v) + cta(v, o) : `<div class="m7-cap"><b>Кто ${v.label.replace('MVP ', 'MVP ')}?</b><span>${v.sub}</span></div>`}</div>
      <div class="m7-more">${vs.map((x, j) => j === s.i ? '' : `<button class="m7-mini" data-j="${j}">${s.open && s.open[j] ? `<span class="m7-mini__face"><img src="${x.p.photo}" alt=""></span><span><b>${x.p.nick}</b><small>${x.label}</small></span>` : `${packFace(x, 1)}<span><b>${x.label}</b><small>вскрыть</small></span>`}</button>`).join('')}</div>`
    s.anim = false
    const go = p => { Object.assign(s, p); pack(el, vs, s, o) }
    el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => go({ open: { ...(s.open || {}), [s.i]: true }, anim: true }))
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => go({ i: +b.dataset.j }))
    el.querySelectorAll('.m7-reveal .kc').forEach(k => { tilt(k); flipOnClick(k) })
    el.querySelectorAll('a[href="#"]').forEach(a => a.onclick = e => e.preventDefault()) }

  // ——— v9 · Виджет = карта ———
  // Язычок карты слева: вместо номера — виды MVP строками (вертикально); активный светится. Смена — глитч-переход карты
  const full = (el, vs, s, o) => {
    const v = vs[s.i]
    const tabs = `<div class="g1__tab m9-tab">${vs.map((x, j) => `<button class="m9-t ${j === s.i ? 'is-on' : ''}" data-j="${j}"><span>${x.tab}</span></button>`).join('')}</div>`
    const html = face7(v).replace(/<div class="g1__tab">[\s\S]*?<\/span><\/div>/, tabs)
    el.innerHTML = `<div class="m9-wrap ${s.anim ? 'is-anim' : ''}"><div class="kc kc--gold kc--legend g1 m7-card m9-card"><div class="kc__in"><div class="kc__flip"><div class="kc__face">${html}</div><div class="kc__back">${back(v)}</div></div></div></div>
      <div class="m9-under">${cta(v, o)}</div></div>`
    s.anim = false
    const k = el.querySelector('.kc'); tilt(k)
    k.addEventListener('click', e => { if (e.target.closest('[data-j]')) return; k.querySelector('.kc__flip').classList.toggle('is-flip') })
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = e => { e.stopPropagation(); if (+b.dataset.j === s.i) return; s.i = +b.dataset.j; s.anim = true; full(el, vs, s, o) })
    el.querySelectorAll('a[href="#"]').forEach(a => a.onclick = e => e.preventDefault()) }

  function render(el, o) {
    const style = (o.opt || {}).style || 'deck', s = o.s || (o.s = { i: 0 }), vs = MVP2.views(o)
    el.className = 'w m7 m7--' + style
    ;({ deck, pack, full })[style](el, vs, s, o)
  }
  window.MVP7 = { render }
})()
