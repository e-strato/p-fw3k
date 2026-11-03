// Виджет MVP v5 «Карточка Хайперглитч» (дирижёр 22.10: «MVP — что-то похожее на нашу карточку, финальную»; выбрана v1 · Хайперглитч
// из lab/карточка-v3). Один MVP — наша карта: срезанные углы, язычок с логотипом, глитч, рейтинг, ник, статы; наклон и блик за курсором,
// клик — оборот (за что MVP, цифры, цена в фэнтези). Виды MVP и данные — MVP2.views (_mvp2.js), переключение — сегментом в шапке.
// Лица — настоящие фото игроков (начальник: «брать лица людей»): faces/ — вырезанные портреты с dota2.ru, скачаны 22.10.
// ‼️ Пример: рейтинг карты, 6 статов и позиция выведены из очков / KDA (своих данных нет); MVP турнира, цифры матча и цена — как в _mvp2.js.
// MVP5.render(узел, { match, mine })
(() => {
  const D = window.MVP_DATA
  const FACES = ['33', 'ame', 'batyuk', 'davai', 'insania', 'larl', 'malr1ne', 'mira', 'nightfall', 'pure', 'quinn', 'rue', 'saksa', 'satanic', 'skiter', 'sumail', 'topson', 'wisper', 'wits', 'yatoro', 'yuma', 'yuragi']
  const face = p => FACES.includes(p.nick.toLowerCase()) ? (window.IMGR || (x => x))(`${window.MVP2_BASE || ''}faces/${p.nick.toLowerCase()}.webp`) : '/p-fw3k/site/img/players/_silhouette.png' // нет фото — силуэт (решение 12)
  const nb = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') // неразрывный пробел — цена не ломается
  const price = p => Math.round(p.month.pts * 1.25 / 10) * 10
  const MINE = ['Malr1ne', 'Yatoro'] // экран «В фэнтези» — как в _mvp2.js
  const POS = { 'керри': [1, 'Carry'], 'мид': [2, 'Mid'], 'оффлейн': [3, 'Offlane'], 'саппорт': [4, 'Support'] }
  const ic = {
    play: '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.4-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z"/></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flip: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2.5 8a5.5 5.5 0 0 1 9.6-3.7M13.5 8a5.5 5.5 0 0 1-9.6 3.7M12.5 2v2.5H10M3.5 14v-2.5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  // ‼️ Пример: рейтинг и статы карты — из очков месяца и KDA, разброс — по нику (стабильно)
  const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }
  // Рейтинг карты — очки месяца на шкалу 70…98 (520 очков → 70, 1180 → 98): у MVP разные числа, а не 93 у всех (дирижёр 22.10: «кривенько»)
  const rating = p => Math.max(60, Math.min(99, Math.round(70 + (p.month.pts - 520) / 660 * 28)))
  const stats = p => { const h = hash(p.nick), base = Math.min(95, 55 + p.month.kda * 4)
    return ['FRM', 'FGT', 'POOL', 'SUR', 'VIS', 'FORM'].map((k, i) => { const v = Math.max(40, Math.min(99, Math.round(base + ((h >> (i * 4)) % 21) - 10))); return { k, v, ur: v >= 75 ? 'hi' : v >= 50 ? 'mid' : 'lo' } }) }
  const RAMKA = '<svg class="g1__frame" viewBox="0 0 220 308" preserveAspectRatio="none" aria-hidden="true"><polygon class="out" points="18,1 219,1 219,284 196,307 1,307 1,18" /></svg>'

  // Лицо карты — разметка v1 · Хайперглитч (карточка-v3), данные — MVP
  const front = v => { const p = v.p, logo = D.teams[p.team], [pos, role] = POS[p.role] || [1, 'Carry'], mask = cls => logo ? `<i class="logo-mask g1__logo ${cls}" style="--logo: url('${logo}')"></i>` : ''
    return `<div class="g1__face">
  <div class="g1__plate">
    <div class="g1__bg">${mask('')}${mask('g1__logo--a').replace('<i ', '<i data-deco="2" ')}${mask('g1__logo--b').replace('<i ', '<i data-deco="2" ')}<i class="g1__pix" data-deco="1"></i></div>
    <i class="g1__halo"></i>
    <img class="ph" src="${face(p)}" alt="${p.nick}" />
    <i class="g1__slices" data-deco="2"></i><i class="g1__scan" data-deco="3"></i>
    <div class="g1__panel"></div>
    <i class="fx fx-shine"></i><i class="fx fx-spark"><b></b><b></b><b></b><b></b><b></b><b></b></i>
  </div>
  ${RAMKA}
  <div class="g1__tab">${logo ? `<span><img class="logo" src="${logo}" alt="" /></span>` : ''}<hr /><span class="g1__serial"><b>MVP</b><small>${v.tab}</small></span></div>
  ${V6 ? '<span class="m6-turn" aria-hidden="true"></span>' : ''}
  <div class="g1__ovr"><b>${rating(p)}</b></div>
  ${p.hero && !V6 ? `<div class="g1__heroes"><div><img class="hero-ic" src="${p.hero}" alt="" /><small><b>${v.s.m} ${v.s.maps ? 'К' : 'М'}</b><br>KDA ${v.s.main}</small></div></div>` : ''}
  <span class="g1__role"><b>Pos ${pos}</b> · ${role}</span>
  <div class="g1__who"><div class="g1__nick">${p.nick}</div><div class="g1__name">${V6 ? v.sub : v.label}</div></div>
  <div class="g1__stats">${stats(p).map(s => `<span><b data-v="${s.ur}">${s.v}</b><small>${s.k}</small></span>`).join('')}</div>
  <div class="g1__team">${logo ? `<img class="logo" src="${logo}" alt="" />` : ''}${p.team}</div>
</div><i class="fx fx-glare"></i>` }
  // Оборот — лист данных карты (.bk из карточка-v3): за что MVP, цифры, цена в фэнтези
  const back = v => { const p = v.p, logo = D.teams[p.team]
    const rows = [['KDA', v.s.main, Math.min(100, v.s.main * 9)], [v.s.maps ? 'Карт в матче' : 'Матчей', v.s.m, Math.min(100, v.s.m * 5)], ['Очки фэнтези', nb(v.s.pts), Math.min(100, v.s.pts / 15)], ['Цена в фэнтези', nb(price(p)), Math.min(100, price(p) / 20)], ['Очки за месяц', nb(p.month.pts), Math.min(100, p.month.pts / 12)], ['Место в рейтинге', p.month.prev ? p.month.prev + '-е' : 'новичок', p.month.prev ? Math.max(10, 100 - p.month.prev * 8) : 30]]
    return `<div class="bk">${logo ? `<i class="logo-mask bk__mask" style="--logo: url('${logo}')"></i>` : ''}
  <div class="bk__top">${logo ? `<img class="logo" src="${logo}" alt="" />` : '<span></span>'}<span><b>${p.nick}</b><small>${v.label} · ${v.sub}</small></span><em>${rating(p)}</em></div>
  <ul class="bk__stats">${rows.map(([k, val, w]) => `<li><span>${k}</span><b>${val}</b><i style="--v: ${w}%"></i></li>`).join('')}</ul>
  <span class="bk__btn">Страница игрока</span>
</div>${RAMKA}` }

  const move = s => s.prev == null ? '' : s.prev === 0 ? '<span class="m2-mv m2-mv--new">впервые в топе</span>' : s.prev === 1 ? '<span class="m2-mv">держит 1-е</span>' : `<span class="m2-mv m2-mv--up">▲ было ${s.prev}-е</span>`
  const fan = (v, o) => o.mine && MINE.includes(v.p.nick) ? `<span class="m2-fan is-mine">${ic.check}В твоём составе</span>`
    : `<a class="m2-fan" href="#" data-fan>Взять в фэнтези<span class="m2-coin"><i></i>${nb(price(v.p))}</span></a>`

  // v6 (дирижёр 22.10: «кривенько, сделать красивее»): карта золотая (в цвет MVP), без дублей подписи и героя «в воздухе»,
  // свечение за картой, под ней одна строка — главная цифра и сдвиг; кнопки в одну строку без переносов, оборот — значком на карте
  let V6 = false
  const render6 = (vs, s, v, o) => `<div class="m2-hd"><span class="m2-ttl">MVP</span><div class="m2-seg">${vs.map((x, j) => `<button class="${j === s.i ? 'is-on' : ''}" data-v="${j}">${x.tab}</button>`).join('')}</div></div>
    <div class="m5-stage m6-stage"><i class="m6-glow"></i><div class="kc kc--gold kc--legend g1 m5-card" data-tilt title="Нажми — оборот"><div class="kc__in"><div class="kc__flip ${s.back ? 'is-flip' : ''}">
      <div class="kc__face">${front(v)}</div><div class="kc__back">${back(v)}</div></div></div></div></div>
    <div class="m6-row"><span class="m5-big"><b>${v.s.main}</b><span>${v.s.mainL}</span></span>${move(v.s)}</div>
    <div class="m2-act m6-act"><a class="m2-hl" href="#" data-hl aria-label="Хайлайты">${ic.play}</a>${o.mine && MINE.includes(v.p.nick) ? `<span class="m2-fan is-mine">${ic.check}В твоём составе</span>` : `<a class="m2-fan" href="#" data-fan><span>Взять в фэнтези</span><span class="m2-coin"><i></i>${nb(price(v.p))}</span></a>`}</div>`
  function render(el, o) {
    const s = o.s || (o.s = { i: 0 }), vs = MVP2.views(o), v = vs[s.i]; V6 = (o.opt || {}).style === 'hg2'
    el.className = 'w m2 m5' + (V6 ? ' m6' : '')
    el.innerHTML = V6 ? render6(vs, s, v, o) : `<div class="m2-hd"><span class="m2-ttl">MVP</span><div class="m2-seg">${vs.map((x, j) => `<button class="${j === s.i ? 'is-on' : ''}" data-v="${j}">${x.tab}</button>`).join('')}</div></div>
    <div class="m5-sub"><span class="m2-lbl">${v.label}</span><span class="m2-sub">${v.sub}</span></div>
    <div class="m5-stage"><div class="kc kc--elite kc--legend g1 m5-card" data-tilt title="Нажми — оборот"><div class="kc__in"><div class="kc__flip ${s.back ? 'is-flip' : ''}">
      <div class="kc__face">${front(v)}</div><div class="kc__back">${back(v)}</div></div></div></div></div>
    <div class="m5-row"><span class="m5-big"><b>${v.s.main}</b><span>${v.s.mainL}</span></span>${move(v.s)}<span class="m5-turn">${ic.flip}нажми на карту</span></div>
    <div class="m2-act"><a class="m2-hl" href="#" data-hl>${ic.play}Хайлайты</a>${fan(v, o)}</div>`
    const go = p => { Object.assign(s, p); render(el, o) }
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => go({ i: +b.dataset.v, back: false }))
    el.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault())) // в лабе ссылки никуда не ведут
    // Наклон и блик — как у карты (карточка-v3/_v3.js, наклон): --mx/--my — точка курсора, --dx/--dy — смещение от центра
    el.querySelectorAll('.kc').forEach(k => {
      k.onclick = () => { s.back = !s.back; k.querySelector('.kc__flip').classList.toggle('is-flip', s.back) }
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      k.onpointermove = e => { const b = k.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height
        k.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); k.style.setProperty('--my', (y * 100).toFixed(1) + '%')
        k.style.setProperty('--dx', (x - .5).toFixed(3)); k.style.setProperty('--dy', (y - .5).toFixed(3)); k.classList.add('is-on') }
      k.onpointerleave = () => { k.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach(p => k.style.removeProperty(p)) } })
  }
  window.MVP5 = { render, front, back, price, nb, rating, MINE } // front / back / price — и для v7–v9 (_mvp7.js)
})()
