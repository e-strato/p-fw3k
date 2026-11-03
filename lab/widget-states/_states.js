// Подача «3 экрана + подсказки» (дирижёр 21.10): только главные экраны виджета турнира v2 (widget-tournament-4) —
// на главной, в матче, у команды; мелочи не отдельными кадрами, а кликом по самому виджету. У экрана — строка «зачем»
// и подсказки: что здесь можно сделать. Вид подсказки в каждой версии свой (hint), чтобы сравнить.
// S.key — экраны; S.mount(узел, экран, { hint, after }) — виджет (after — сразу после первого действия).
// window.S_CFG (до подключения) — для другой лабы: opt — вариант виджета, hints — свои подсказки экранов { match: [...] }, why — своё «зачем», o — свой вход виджета экрана (напр. другой матч),
// extra — свои экраны в конец ({ id, name, why, o, opt, hints }; opt экрана дополняет общий).
(() => {
  const D = T4.data, C = window.S_CFG || {}, opt = C.opt || { mark: 'bg', stakes: 'card' }
  const ti = id => D.tours.findIndex(t => t.id === id)
  const sea = { a: 'Team Nemesis Academy', b: 'Cloud Dawning' }
  // hints: [селектор, действие, что будет, все?]; первое — главное (по нему after). Пустой селектор — только в расшифровке, без подсветки;
  // все — подсветить каждое совпадение, а не первое
  const key = [
    { id: 'home', name: 'На главной', why: 'Ничего не выбрано — виджет показывает, какие турниры идут сейчас и какие скоро', o: {},
      hints: [['.t4-tr', 'Нажми на турнир', 'откроется таблица или сетка'], ['.t4-arch', 'Архив турниров', 'прошедшие турниры']], after: { list: false, t: ti('epl-masters-3') } },
    { id: 'match', name: 'В матче', why: 'Открыт матч — виджет сам открыл его турнир и подсветил обе команды', o: { match: sea },
      hints: [['.t4-ctx--a', 'Нажми на команду', 'что на кону в матче'], ['[data-list]', 'Бургер', 'выбрать другой турнир']], after: { pick: sea.a } },
    { id: 'team', name: 'У команды', why: 'Открыта команда — только её турниры и её место в каждом', o: { team: 'Team Spirit' },
      hints: [['.t4-tr', 'Нажми на турнир', 'её матчи в нём'], ['[data-flt]', 'Все турниры', 'снять фильтр команды']], after: { list: false, t: ti('blast-slam-8') } },
  ]

  key.forEach(k => { if (C.hints && C.hints[k.id]) k.hints = C.hints[k.id]; if (C.why && C.why[k.id]) k.why = C.why[k.id]; if (C.o && C.o[k.id]) k.o = C.o[k.id] })
  if (C.extra) key.push(...C.extra.map(k => ({ hints: [], after: {}, ...k })))
  const COLORS = ['#a78bfa', '#38bdf8', '#f472b6', '#34d399', '#e879f9', '#a3e635']
  // Где цель относительно обёртки (обёртка может быть внутри zoom)
  const rel = (host, t) => { const H = host.getBoundingClientRect(), z = H.width / host.offsetWidth || 1, r = t.getBoundingClientRect()
    return { x: (r.left - H.left) / z, y: (r.top - H.top) / z, w: r.width / z, h: r.height / z } }
  const add = (host, cls, html = '') => { const d = document.createElement('div'); d.className = 's-h ' + cls; d.innerHTML = html; host.append(d); return d }
  const targets = (el, k) => k.hints.map(([sel, act, res, all], i) => ({ t: sel && el.querySelector(sel), sel, act, res, i, many: all })).filter(h => h.t).map(h => ({ ...h, all: h.many ? [...el.querySelectorAll(h.sel)] : [h.t] }))
  // Что из подсказок сейчас есть в виджете: цвет — у подсвеченных, серый — у тех, что только в расшифровке
  const legend = (el, k) => k.hints.flatMap(([sel, act, res], i) => !sel ? [{ color: '#71717a', text: `${act} — ${res}` }] : el.querySelector(sel) ? [{ color: COLORS[i % COLORS.length], text: `${act} — ${res}` }] : [])
  // Виды подсказок. Каждый рисует поверх виджета; клик по виджету подсказки снимает (кроме legend, footer, hover)
  const H = {
    // Точка с подписью — у главного действия
    label: (host, el, hs) => { const h = hs[0], p = rel(host, h.t); add(host, 's-hot', `<i></i><span>${h.act} — ${h.res}</span>`).style.cssText = `left:${p.x + p.w - 28}px;top:${p.y + p.h / 2}px` },
    // Только точки, без слов
    dots: (host, el, hs) => hs.forEach(h => { const p = rel(host, h.t); add(host, 's-hot', '<i></i>').style.cssText = `left:${p.x + p.w - 20}px;top:${p.y + p.h / 2}px` }),
    // Номера на всём, что можно нажать, и расшифровка под виджетом
    numbers: (host, el, hs) => { hs.forEach(h => { const p = rel(host, h.t); add(host, 's-num', h.i + 1).style.cssText = `left:${p.x + p.w - 10}px;top:${p.y - 8}px` })
      add(host, 's-leg s-keep', hs.map(h => `<div><b>${h.i + 1}</b>${h.act} — ${h.res}</div>`).join('')) },
    // Мягкое свечение того, что можно нажать
    glow: (host, el, hs) => hs.forEach(h => h.t.classList.add('s-glow')),
    // Свечение своим цветом у каждого действия; расшифровка цветов — в оболочке (LAB.legend)
    glowc: (host, el, hs) => hs.forEach(h => h.all.forEach(t => { t.classList.add('s-glow', 's-glowc'); t.style.setProperty('--g', COLORS[h.i % COLORS.length]) })),
    // Пометки как в Figma: тонкая рамка своего цвета без анимации + метка с номером пункта в углу (на первом совпадении)
    tags: (host, el, hs) => hs.forEach(h => { const c = COLORS[h.i % COLORS.length], p = rel(host, h.t)
      h.all.forEach(t => { t.classList.add('s-ann'); t.style.setProperty('--g', c) })
      const tag = add(host, 's-ann-tag', h.act); tag.style.cssText = `--g:${c};left:${p.x + p.w}px;top:${p.y}px` }),
    // Строка под виджетом «Попробуй»
    footer: (host, el, hs) => add(host, 's-foot s-keep', `<b>Попробуй:</b> ${hs.map(h => `${h.act.toLowerCase()} — ${h.res}`).join(' · ')}`),
    // Затемнить всё, кроме главного действия
    spotlight: (host, el, hs) => { const h = hs[0], p = rel(host, h.t)
      add(host, 's-spot', `<span>${h.act} — ${h.res}</span>`).style.cssText = `left:${p.x - 4}px;top:${p.y - 4}px;width:${p.w + 8}px;height:${p.h + 8}px` },
    // Подсказка при наведении
    hover: (host, el, hs) => { const tip = add(host, 's-tipf s-keep'); tip.hidden = true
      el.addEventListener('mousemove', e => { const h = hs.find(h => h.t.isConnected && h.t.contains(e.target)); tip.hidden = !h; if (!h) return
        const p = rel(host, h.t); tip.textContent = `${h.act} — ${h.res}`; tip.style.cssText = `left:${p.x + 8}px;top:${p.y + p.h + 4}px` })
      el.addEventListener('mouseleave', () => tip.hidden = true) },
    // Рука-курсор сама «нажимает» на главное действие
    hand: (host, el, hs) => { const h = hs[0], p = rel(host, h.t)
      add(host, 's-hand', '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4.5 14a1.5 1.5 0 0 1 2.3-1.9L9 14.5" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg><span></span>')
        .style.cssText = `--x:${p.x + p.w / 2}px;--y:${p.y + p.h / 2}px` },
    // Окно-подсказка с «Дальше» по всем действиям
    coach: (host, el, hs) => { let i = 0; const box = add(host, 's-coach')
      const draw = () => { const h = hs[i], p = rel(host, h.t); host.querySelectorAll('.s-coach-ring').forEach(x => x.remove())
        add(host, 's-coach-ring').style.cssText = `left:${p.x - 3}px;top:${p.y - 3}px;width:${p.w + 6}px;height:${p.h + 6}px`
        box.style.cssText = `left:${Math.max(8, Math.min(p.x, host.offsetWidth - 248))}px;top:${p.y + p.h + 10}px`
        box.innerHTML = `<b>${h.act}</b><span>${h.res}</span><div><small>${i + 1} из ${hs.length}</small><button>${i < hs.length - 1 ? 'Дальше' : 'Понятно'}</button></div>`
        box.querySelector('button').onclick = e => { e.stopPropagation(); if (i < hs.length - 1) { i++; draw() } else host.querySelectorAll('.s-coach, .s-coach-ring').forEach(x => x.remove()) } }
      draw() },
    // Виджет сам показывает главное действие и возвращается
    demo: (host, el, hs, k) => { const bar = add(host, 's-foot s-keep', ''), tok = el.tok, live = () => el.tok === tok
      const run = () => { bar.innerHTML = `Показываем: <b>${hs[0].act.toLowerCase()}</b> — ${hs[0].res}…`
        setTimeout(() => { if (!live()) return; T4.render(el, { ...k.o, init: { ...k.after }, opt: { ...opt, ...k.opt } }); setTimeout(() => { if (!live()) return; T4.render(el, { ...k.o, opt: { ...opt, ...k.opt } }); bar.innerHTML = '<button>Показать ещё раз</button>'; bar.querySelector('button').onclick = run }, 2200) }, 900) }
      run() },
    none: () => {},
  }
  const mount = (el, k, { hint = 'label', after = false } = {}) => {
    const host = el.parentElement; host.classList.add('s-hw'); host.querySelectorAll(':scope > .s-h').forEach(x => x.remove())
    delete el.dataset.used; el.tok = {} // tok — чтобы «демо» прежнего экрана не перерисовало новый
    T4.render(el, { ...k.o, init: after ? { ...k.after } : k.o.init && { ...k.o.init }, opt: { ...opt, ...k.opt } })
    if (after) return
    const draw = () => { host.querySelectorAll(':scope > .s-h').forEach(x => x.remove()); const hs = targets(el, k); if (hs.length) H[hint](host, el, hs, k) }
    draw()
    if (hint !== 'demo' && hint !== 'hover') { document.fonts && document.fonts.ready.then(() => el.isConnected && !el.dataset.used && draw())
      el.addEventListener('click', () => { el.dataset.used = 1; host.querySelectorAll(':scope > .s-h:not(.s-keep)').forEach(x => x.remove()) }, { once: true }) } }
  window.S = { key, mount, legend, by: id => key.find(k => k.id === id) }
})()
