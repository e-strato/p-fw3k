// Виджет трансферов (созвон 21.10, Т3.1–Т3.5): переход игрока в другую команду, только тир-1 и тир-2.
// Как замены, но «официальнее»: лента по датам, дата крупно; аватар и фокус на игрока — в карточке по клику.
// Два состояния (О.16): на главной — все свежие переходы; в матче (o.match) — переходы обеих команд матча, своим цветом.
// Данные — реальные, window.TR_DATA (_data.js, Liquipedia), логотипы — logos/, фото — players/. TR.render(узел, { match: { a, b } | null, open }).
(() => {
  const D = window.TR_DATA
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const day = s => { const [, m, d] = s.split('-'); return `${+d} ${MON[m - 1]}` }
  const full = s => s.split('-').reverse().join('.')
  const POS = { 1: 'керри', 2: 'мид', 3: 'оффлейн', 4: 'саппорт', 5: 'саппорт' }
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const ic = {
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8m-3-3 3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  // Логотип / фото: настоящий файл, нет файла — буквы
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} tr-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} tr-ini">${ini(n)}</span>`
  const logo = (n, cls = 'tr-lg') => img((D.teams[n] || {}).logo, n, cls)
  const ava = (p, cls = 'tr-av') => img(p.photo, p.nick, cls)
  const pos = p => `поз. ${p.pos} · ${POS[p.pos]}`

  // Строка ленты: аватар, ник, позиция; справа — откуда → куда логотипами
  const row = (p, i, side) => `<button class="tr-r" data-i="${i}">${ava(p)}
    <span class="tr-r__m"><b>${p.nick}${p.kind === 'loan' ? ' <span class="tr-chip">аренда</span>' : ''}</b><span class="tr-cap">${side || pos(p)}</span></span>
    <span class="tr-mv">${logo(p.from)}<i>${ic.arrow}</i>${logo(p.to)}</span></button>`

  // По датам: дата перехода — заголовком группы (Т3.4 «очень важна дата»)
  const byDate = (items, side) => { let out = '', last = ''
    for (const [p, i] of items) { if (p.date !== last) { out += `<div class="tr-lbl">${day(p.date)}</div>`; last = p.date } out += row(p, i, side && side(p)) }
    return out }

  const home = () => byDate(D.list.map((p, i) => [p, i]))

  // В матче: по команде — кто пришёл, кто ушёл; команда своим цветом, как в виджете турнира
  const match = m => [['a', m.a], ['b', m.b]].map(([k, t]) => {
    const items = D.list.map((p, i) => [p, i]).filter(([p]) => p.to === t || p.from === t)
    const side = p => p.to === t ? `пришёл из ${p.from}` : `ушёл в ${p.to}`
    return `<div class="tr-tm"><i class="tr-cd tr-cd--${k}"></i>${logo(t)}<span class="tr-nm">${t}</span></div>` +
      (items.length ? byDate(items, side) : '<div class="tr-none">С начала сезона без переходов</div>') }).join('')

  // Карточка игрока: фото, откуда → куда, дата крупно, сумма, позиция, призовые, источник
  const card = p => `<div class="tr-ph">${ava(p, 'tr-ph__img')}<div class="tr-ph__n"><b>${p.nick}</b><span>${p.name}</span></div></div>
    <div class="tr-bd">
      <div class="tr-way"><span>${logo(p.from, 'tr-lg tr-lg--24')}<span class="tr-nm">${p.from}</span></span><i>${ic.arrow}</i><span>${logo(p.to, 'tr-lg tr-lg--24')}<span class="tr-nm">${p.to}</span></span></div>
      <dl class="tr-f">
        <div><dt>Дата перехода</dt><dd><b>${full(p.date)}</b></dd></div>
        <div><dt>${p.kind === 'loan' ? 'Аренда' : 'Сумма'}</dt><dd>${p.fee || 'не раскрыта'}</dd></div>
        <div><dt>Позиция</dt><dd>${pos(p)}</dd></div>
        <div><dt>Страна, возраст</dt><dd>${p.country}, ${p.age}</dd></div>
        <div><dt>Призовые за карьеру</dt><dd>${p.earn}</dd></div>
        <div><dt>Источник</dt><dd class="tr-src">${p.src}</dd></div>
      </dl>
    </div>`

  function render(el, o = {}) {
    const s = el.st || (el.st = {})
    if (o.open !== undefined && !el.dataset.opened) { s.open = o.open; el.dataset.opened = 1 }
    const go = p => { Object.assign(s, p); render(el, o) }
    const m = o.match, p = s.open != null ? D.list[s.open] : null
    const hd = p
      ? `<button class="tr-ib" data-back>${ic.back}</button><div class="tr-hd__t"><b>Трансфер</b><span class="tr-cap">${day(p.date)}</span></div>`
      : `<img class="tr-game" src="${D.game.logo}" alt=""><div class="tr-hd__t"><b>Трансферы</b><span class="tr-cap">${m ? 'Команды матча' : 'Тир-1 и тир-2'}</span></div>`
    el.innerHTML = `<div class="w tr${p ? ' tr--card' : ''}"><div class="tr-hd">${hd}</div>
      <div class="w-scroll">${p ? card(p) : `<div class="tr-bd">${m ? match(m) : home()}</div>`}</div></div>`
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => go({ open: +b.dataset.i }))
    const bk = el.querySelector('[data-back]'); if (bk) bk.onclick = () => go({ open: null })
  }
  window.TR = { render, data: D }
})()
