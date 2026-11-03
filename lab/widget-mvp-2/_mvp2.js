// Виджет MVP, заход 2 (созвон 22.10, решение 29, пункты 4.1–4.4): MVP — ОДИН игрок крупной карточкой, пьедестал и топ-20 ушли.
// Виды MVP переключаются: на главной — турнир · неделя · месяц (21.10: «скорее турнира» — он первый), в матче — матч · турнир · неделя.
// Связь с фэнтези: цена игрока в фэнтези и «Взять в фэнтези»; уже в составе — «В твоём составе». Рядом — «Хайлайты».
// Три подачи (o.opt.style): 'hltv' — как Player of the week на HLTV: фото, ник, одна главная цифра, сегмент периода сверху ·
// 'swipe' — 3D-карточка (наклон за курсором, блик), MVP листаются свайпом и стрелками · 'flip' — карточка-«пак»: лицо — игрок,
// клик переворачивает — оборот со статистикой и фэнтези; виды — чипами сверху.
// ‼️ Пример: данные — ../widget-mvp/_data.js (уже пример, решение 25). Здесь выдуманы: MVP турнира (BLAST SLAM VIII — Malr1ne),
// счёт и цифры матча, цена в фэнтези (≈ очки месяца × 1,25), «в составе» — для экрана «В фэнтези».
// MVP2.render(узел, { match: { a, b } | null, mine, opt: { style } })
(() => {
  const D = window.MVP_DATA
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} m2-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} m2-ini">${ini(n)}</span>`
  const nb = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const ic = {
    prev: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.4-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z"/></svg>',
    flip: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2.5 8a5.5 5.5 0 0 1 9.6-3.7M13.5 8a5.5 5.5 0 0 1-9.6 3.7M12.5 2v2.5H10M3.5 14v-2.5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const dota = D.list.filter(p => p.game === 'dota2')
  const by = (arr, k) => [...arr].sort((a, b) => b[k].pts - a[k].pts)
  const price = p => Math.round(p.month.pts * 1.25 / 10) * 10
  const MINE = ['Malr1ne', 'Yatoro'] // экран «В фэнтези»: эти игроки уже в составе (пример)

  // ——— Виды MVP: кто, за что, главная цифра ———
  const st = (p, per, lbl) => ({ main: p[per].kda, mainL: `KDA ${lbl}`, m: p[per].m, pts: p[per].pts, prev: p[per].prev })
  const views = o => { const used = new Set(), pick = (arr, k) => { const p = by(arr, k).find(x => !used.has(x.nick)) || by(arr, k)[0]; used.add(p.nick); return p }
    const tourP = dota.find(p => p.nick === 'Malr1ne'); used.add(tourP.nick)
    const tour = { id: 'tour', tab: 'Турнир', label: 'MVP турнира', sub: 'BLAST SLAM VIII', p: tourP, s: st(tourP, 'month', 'за турнир') }
    if (o.match) { const two = dota.filter(p => p.team === o.match.a || p.team === o.match.b), mp = by(two, 'week')[0]
      const ms = { main: (mp.week.kda * 1.4).toFixed(1), mainL: 'KDA за матч', m: 3, pts: Math.round(mp.week.pts / mp.week.m * 3), prev: null, maps: true }
      const wk = by(dota, 'week')[0] // в матче — настоящий MVP недели, даже если это тот же игрок
      return [{ id: 'match', tab: 'Матч', label: 'MVP матча', sub: `${o.match.a} — ${o.match.b} · 2:1`, p: mp, s: ms }, tour,
        { id: 'week', tab: 'Неделя', label: 'MVP недели', sub: '14 – 20.10', p: wk, s: st(wk, 'week', 'за неделю') }] }
    const wk = pick(dota, 'week'), mo = pick(dota, 'month') // ‼️ пример: на главной виды не повторяют игрока — месяц берёт следующего по очкам, чтобы в лабе было три разных MVP
    return [tour, { id: 'week', tab: 'Неделя', label: 'MVP недели', sub: '14 – 20.10', p: wk, s: st(wk, 'week', 'за неделю') },
      { id: 'month', tab: 'Месяц', label: 'MVP месяца', sub: 'Октябрь', p: mo, s: st(mo, 'month', 'за месяц') }] }

  // ——— Общие куски ———
  const team = p => img(D.teams[p.team], p.team, 'm2-tl')
  const move = s => s.prev == null ? '' : s.prev === 0 ? '<span class="m2-mv m2-mv--new">впервые в топе</span>' : s.prev === 1 ? '<span class="m2-mv">держит 1-е</span>' : `<span class="m2-mv m2-mv--up">▲ было ${s.prev}-е</span>`
  const stats = v => `<div class="m2-st"><span><b>${v.s.m}</b>${v.s.maps ? 'карты' : 'матчей'}</span><span><b>${nb(v.s.pts)}</b>очков фэнтези</span><span><b>${v.p.role}</b>роль</span></div>`
  const fan = (v, o, big) => o.mine && MINE.includes(v.p.nick) ? `<span class="m2-fan is-mine">${ic.check}В твоём составе</span>`
    : `<a class="m2-fan ${big ? 'is-big' : ''}" href="#" data-fan>Взять в фэнтези<span class="m2-coin"><i></i>${nb(price(v.p))}</span></a>`
  const hl = `<a class="m2-hl" href="#" data-hl>${ic.play}Хайлайты</a>`
  const seg = (vs, i, cls = '') => `<div class="m2-seg ${cls}">${vs.map((v, j) => `<button class="${j === i ? 'is-on' : ''}" data-v="${j}">${v.tab}</button>`).join('')}</div>`

  // ——— v2: как HLTV ———
  const hltv = (vs, i, o) => { const v = vs[i]
    return `<div class="m2-hd"><span class="m2-ttl">MVP</span>${seg(vs, i)}</div>
    <a class="m2-h" href="#" data-player><span class="m2-h__ph">${img(v.p.photo, v.p.nick, 'm2-ph')}${team(v.p)}</span>
      <span class="m2-h__m"><span class="m2-lbl">${v.label}</span><span class="m2-sub">${v.sub}</span><b class="m2-nk">${v.p.nick}</b>
        <span class="m2-big"><b>${v.s.main}</b><span>${v.s.mainL}</span></span>${move(v.s)}</span></a>
    ${stats(v)}<div class="m2-act">${hl}${fan(v, o)}</div>` }

  // ——— Карточка (v3, v4): фон — арт лучшего героя, фото, ник, ярлык вида ———
  const face = (v, foot) => `<span class="m2-c__bg">${v.p.hero ? `<img src="${v.p.hero}" alt="">` : ''}</span><span class="m2-c__grid"></span>
    <span class="m2-c__top"><span class="m2-c__tag">${v.label}</span>${team(v.p)}</span>
    <span class="m2-c__ph">${img(v.p.photo, v.p.nick, 'm2-ph')}</span>
    <span class="m2-c__bt"><span class="m2-sub">${v.sub}</span><b class="m2-nk">${v.p.nick}</b><span class="m2-c__row"><span class="m2-big"><b>${v.s.main}</b><span>${v.s.mainL}</span></span>${foot || ''}</span></span>
    <i class="m2-glare"></i>`
  // v3: стопка — следующие MVP выглядывают сзади, листаем свайпом и стрелками
  const swipe = (vs, i, o, dir) => { const v = vs[i]
    return `<div class="m2-hd"><span class="m2-ttl">MVP</span><span class="m2-dots">${vs.map((x, j) => `<button class="${j === i ? 'is-on' : ''}" data-v="${j}" title="${x.label}">${x.tab}</button>`).join('')}</span></div>
    <div class="m2-stage"><button class="m2-arr is-l" data-step="-1" ${i ? '' : 'disabled'} aria-label="Предыдущий MVP">${ic.prev}</button>
      <div class="m2-stack">${vs.length - i > 2 ? '<i class="m2-ghost is-2"></i>' : ''}${vs.length - i > 1 ? '<i class="m2-ghost is-1"></i>' : ''}
        <a class="m2-c ${dir ? 'is-in-' + (dir > 0 ? 'r' : 'l') : ''}" href="#" data-tilt data-swipe>${face(v, move(v.s))}</a></div>
      <button class="m2-arr is-r" data-step="1" ${i < vs.length - 1 ? '' : 'disabled'} aria-label="Следующий MVP">${ic.next}</button></div>
    <div class="m2-act">${hl}${fan(v, o)}</div>` }
  // v4: пак — лицо и оборот; виды чипами
  const flip = (vs, i, o, s) => { const v = vs[i]
    return `<div class="m2-hd"><span class="m2-ttl">MVP</span>${seg(vs, i, 'm2-seg--chips')}</div>
    <div class="m2-flip ${s.back ? 'is-back' : ''}" data-flip><div class="m2-flip__in" data-tilt>
      <div class="m2-c m2-c--front">${face(v, `<span class="m2-turn">${ic.flip}Статистика</span>`)}</div>
      <div class="m2-c m2-c--back"><span class="m2-c__grid"></span>
        <span class="m2-b__hd">${img(v.p.photo, v.p.nick, 'm2-ph m2-ph--sm')}<span><b class="m2-nk">${v.p.nick}</b><span class="m2-sub">${v.p.team} · ${v.p.role}</span></span></span>
        <span class="m2-b__big"><b>${v.s.main}</b><span>${v.s.mainL}</span>${move(v.s)}</span>
        <span class="m2-b__rows"><span><span>${v.s.maps ? 'Карт в матче' : 'Матчей'}</span><b>${v.s.m}</b></span><span><span>Очки фэнтези</span><b>${nb(v.s.pts)}</b></span>
          <span><span>Лучший герой</span><b>${v.p.hero ? `<img class="m2-hero" src="${v.p.hero}" alt="">` : '—'}</b></span><span><span>Цена в фэнтези</span><b class="m2-coin"><i></i>${nb(price(v.p))}</b></span></span>
        <span class="m2-b__act">${hl}${fan(v, o, true)}</span>
        <i class="m2-glare"></i></div>
    </div></div>` }

  function render(el, o) {
    const s = o.s || (o.s = { i: 0, back: false }), vs = views(o), style = (o.opt || {}).style || 'hltv', dir = s.dir || 0; s.dir = 0
    el.className = 'w m2 m2--' + style
    el.innerHTML = style === 'swipe' ? swipe(vs, s.i, o, dir) : style === 'flip' ? flip(vs, s.i, o, s) : hltv(vs, s.i, o)
    const go = p => { Object.assign(s, p); render(el, o) }
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => go({ i: +b.dataset.v, dir: Math.sign(+b.dataset.v - s.i), back: false }))
    el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go({ i: s.i + +b.dataset.step, dir: +b.dataset.step }))
    el.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault())) // в лабе ссылки никуда не ведут
    // Переворот пака — клик по карточке (кроме кнопок)
    el.querySelectorAll('[data-flip]').forEach(f => f.onclick = e => { if (e.target.closest('[data-fan], [data-hl]')) return; s.back = !s.back; f.classList.toggle('is-back', s.back) })
    // Наклон за курсором + блик: доля от размера карточки — не зависит от zoom доски
    el.querySelectorAll('[data-tilt]').forEach(c => { c.onpointermove = e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
        c.style.setProperty('--rx', ((.5 - y) * 14).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - .5) * 18).toFixed(2) + 'deg')
        c.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); c.classList.add('is-tilt') }
      c.onpointerleave = () => { c.classList.remove('is-tilt'); c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg') } })
    // Свайп: тянем карточку вбок больше 40 px — следующий / предыдущий MVP
    el.querySelectorAll('[data-swipe]').forEach(c => { let x0 = null
      c.onpointerdown = e => { x0 = e.clientX; c.setPointerCapture(e.pointerId) }
      c.onpointerup = e => { if (x0 == null) return; const r = c.getBoundingClientRect(), dx = (e.clientX - x0) / (r.width / c.offsetWidth || 1); x0 = null
        if (Math.abs(dx) > 40) { const n = s.i + (dx < 0 ? 1 : -1); if (n >= 0 && n < vs.length) go({ i: n, dir: dx < 0 ? 1 : -1 }) } } })
  }
  window.MVP2 = { render, views }
})()
