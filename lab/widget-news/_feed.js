// Виджет «Новости» — общая лента (лаба widget-news, v23+): NFEED.render(el, { look, pic, phone }).
// Строка: заголовок, картинка справа (если есть), под ним значки: ранг S/A/B/C · ⚡ влияние · ✓ источник · 🔥 читают · ◫ источников · лого · время.
// Наведение на значок — поповер «что это значит»; на телефоне — тап. Новости — настоящие (../news/_real.js, лаба Claude-B), ‼️ ранг, влияние, «читают» — пример.
// look: quiet2 — тихие с цветом (v23) · top — значки над заголовком, цвет только у ранга (v24) · box — значки в контейнере под заголовком (v25) · cap — ранг + капсула сверху (v26) · r1 / r2 / r3 — ранг ярко перед заголовком: плашка / свечение / щит, низ — крупнее, без контейнера (v27–v29) · r4 щит в строку · r5 карточка-портрет · r6 светящаяся буква (v30–v32) · r7 / r8 / r9 — светящаяся буква внизу, первой в строке значков, с разделителями: черта / точка / крупнее + время справа (v33–v35) · r10 — как v34, буква крупнее + тонкие разделители между новостями (v36).
//   Везде: ранг · источник (✓ / ? + число изданий) · читают · время (DECISIONS 30.10: влияние и лого убраны). v24–v26: цвет только у ранга, время рядом, моно, мельче
window.NFEED = (() => {
  const D = window.GS_DATA, NM = window.GS_NAMES || { NAME: {}, SHORT: {} }, REAL = window.NEWS
  // [влияние 1–3, авторитет: off — официально · ver — проверенный · rum — слух, читают за сутки] ‼️ пример
  const M = { 'spi-pv': [3, 'ver', 4800], universe: [2, 'ver', 2100], '1w': [2, 'ver', 3600], og: [2, 'ver', 2900], save: [2, 'ver', 1500], cr1t: [1, 'ver', 900],
    s2: [3, 'ver', 5200], s6: [2, 'ver', 1300], s24: [1, 'ver', 700], s8: [2, 'ver', 2400], s10: [1, 'ver', 800], s11: [1, 'ver', 600], s12: [2, 'rum', 3100], s14: [2, 'off', 1900], s20: [1, 'ver', 1100] }
  // свежие сверху, с картинками и без вперемешку (у «вчера» в данных нет часа — расставили сами) ‼️ пример
  const ORDER = ['1w', 's6', 'spi-pv', 's2', 's24', 's8', 'universe', 's10', 'og', 's11', 's12', 'save', 's14', 'cr1t', 's20']
  const FIRE = '<svg width="10" height="10" viewBox="0 0 12 12"><path d="M6 11c2.2 0 3.8-1.5 3.8-3.6 0-1.9-1.3-3-2-4.4-.3 1-.9 1.6-1.6 1.9C6.4 3.1 5.6 1.8 4.4 1c.2 1.6-.6 2.7-1.4 3.7-.6.8-.8 1.6-.8 2.5C2.2 9.5 3.8 11 6 11z" fill="currentColor"/></svg>'
  const CHK = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 .8l1.4 1 1.7-.1.5 1.6 1.4 1-.6 1.6.6 1.6-1.4 1-.5 1.6-1.7-.1L6 11.2l-1.4-1-1.7.1-.5-1.6-1.4-1L1.6 6 1 4.4l1.4-1 .5-1.6 1.7.1z" fill="currentColor"/><path d="m4 6 1.4 1.4L8.2 4.6" stroke="#0d0d10" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const DOC = '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3.5" y="1.5" width="7" height="8" rx="1.5"/><path d="M1.5 4v5.5a1.5 1.5 0 0 0 1.5 1.5h5"/></svg>'
  const k1 = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : n)
  const pl = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c)
  const score = ([imp, au, heat]) => imp * 100 + { off: 30, ver: 15, rum: 5 }[au] + heat / 100
  const tier = (m) => { const s = score(m), t = s >= 320 ? 'S' : s >= 230 ? 'A' : s >= 200 ? 'B' : 'C'; return m[1] === 'rum' && t === 'S' ? 'A' : t }
  // поповеры: заголовок | что значит
  const P = {
    tier: { S: 'Ранг S — читать обязательно', A: 'Ранг A — важное', B: 'Ранг B — стоит глянуть', C: 'Ранг C — по желанию' },
    au: { off: 'Официально|Сообщил организатор, команда или Valve', ver: 'Проверенный источник|Крупное издание, отвечает за новость', rum: 'Слух|Не подтверждено — проверяйте' },
  }
  const pop = (s) => `data-pop="${s}"`

  // v23: ранг · источник (✓ / ? + сколько изданий) · читают · время
  const rank = (m) => { const t = tier(m); return `<span class="f-ic f-tier t-${t}" ${pop(`${P.tier[t]}|Считаем из важности новости, источника и того, сколько читают`)}>${t}</span>` }
  const icons2 = (n, m, inTitle) => { const src = (n.src || []).length, au = P.au[m[1]].split('|'), more = src > 1 ? ` · ещё ${src - 1} ${pl(src - 1, 'издание', 'издания', 'изданий')} пишут об этом` : ''
    return (inTitle ? '' : rank(m))
      + `<span class="f-g"><span class="f-ic f-au is-${m[1]}" ${pop(`${au[0]} · ${n.src?.[0]?.[0] || ''}|${au[1]}${more}`)}>${m[1] === 'rum' ? '?' : CHK}${src > 1 ? `<b>${src}</b>` : ''}</span>`
      + `<span class="f-ic f-heat${m[2] >= 3000 ? ' is-hot' : ''}" ${pop(`Читают: ${k1(m[2])}|Открыли за сутки${m[2] >= 3000 ? ' — в топе' : ''}`)}>${FIRE}${k1(m[2])}</span>`
      + `<time>${n.ago}</time></span>` }
  // v27–v29: ранг — ярко, в первой строке перед заголовком
  const RT = { r1: 1, r2: 1, r3: 1, r4: 1, r5: 1, r6: 1 }
  const row = (n, i, o) => { const m = M[n.id] || [1, 'ver', 500]
    const im = o.pic === 'all' ? (n.imgs || [])[0] || `../news/img/n${(i * 3) % 27}.jpg` : o.pic === 'none' ? '' : (n.imgs || [])[0] || ''
    return `<a class="f-r${im ? ' has-img' : ''}" href="#"><span class="f-b"><span class="f-t">${RT[o.look] ? rank(m) : ''}${n.title}</span><span class="f-m">${icons2(n, m, RT[o.look])}</span></span>${im ? `<img class="f-im" src="${im}" alt="" loading="lazy">` : ''}</a>` }

  // поповер — один на страницу, у курсора / пальца
  let tip
  const hide = () => tip && tip.classList.remove('is-on')
  function show(a) { if (!tip) { tip = document.createElement('div'); tip.className = 'f-pop'; document.body.append(tip) }
    const [h, t] = a.dataset.pop.split('|'); tip.innerHTML = `<b>${h}</b>${t ? `<span>${t}</span>` : ''}`; tip.classList.add('is-on')
    const r = a.getBoundingClientRect(), w = tip.offsetWidth, hh = tip.offsetHeight
    const x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8), up = r.top - hh - 8 > 8
    tip.style.left = x + 'px'; tip.style.top = (up ? r.top - hh - 8 : r.bottom + 8) + 'px'; tip.style.setProperty('--ax', r.left + r.width / 2 - x + 'px'); tip.classList.toggle('is-down', !up) }
  function wire(el) {
    el.querySelectorAll('[data-pop]').forEach((a) => {
      a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(a) })
      a.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide() })
      a.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); tip && tip.classList.contains('is-on') && tip._a === a ? hide() : (show(a), (tip._a = a)) }) })
    el.querySelectorAll('.nw-feed').forEach((f) => f.addEventListener('scroll', hide, { passive: true }))
    if (!wire.on) document.addEventListener("click", hide), addEventListener("scroll", hide, { passive: true }), (wire.on = 1)
  }
  function render(el, o = {}) { o = { look: 'quiet2', pic: 'mix', ...o }
    el.classList.toggle('is-phone', !!o.phone); hide()
    const L = ORDER.map((id) => REAL.find((n) => n.id === id)).filter(Boolean)
    el.innerHTML = `<div class="w nw nf nf--${o.look}"><div class="w-hd"><span class="w-hd__t">Новости</span><a class="nw-all" href="#">Все</a></div><div class="nw-feed"><div class="nw-fl">${L.map((n, i) => row(n, i, o)).join('')}</div></div></div>`
    wire(el) }
  // pops — поповеры «что значит» на [data-pop] в любом контейнере (страница новостей, лаба news-page)
  return { render, pops: wire, CHK, FIRE }
})()
