// Виджет трансферов, заход 3 (дирижёр 21.10): только список, без героя-плашки. Красиво показать цену, выделить лучших.
// Сверху — игра (Все · Dota 2 · CS2; по умолчанию — где человек: на главной «Все», в матче — игра матча) и период сегментом
// (Неделя · Месяц · Сезон). Список — по цене, топ-3 выделены. Аватары и логотипы команд крупные относительно строки.
// Варианты (o.opt.style): 'rank' — рейтинг: место, аватар с лого новой команды, цена крупно справа;
// 'table' — плотная таблица; 'spark' — по росту, график между игроком и ценой; 'bg' — график фоном строки; 'under' — график во всю ширину под строкой;
// 'way' — путь: лого «откуда → куда» крупно слева, игрок и цена справа; 'bar' — цена полосой от самой дорогой.
// Внизу — плашка «Все трансферы», как плашка матча у виджета турнира (widget-tournament-4, .t4-dock): выезжает из-под нижнего края квадрата.
// Клик по строке — на страницу игрока (дирижёр 21.10: своей карточки в виджете нет; страницы пока нет — ссылка #player/<ник>). ‼️ Стоимость в $ — пример (price в _data.js × $100 000).
(() => {
  const D = window.TR_DATA, NOW = new Date('2026-10-21')
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const day = s => { const [, m, d] = s.split('-'); return `${+d} ${MON[m - 1]}` }
  const dd = s => s.split('-').slice(1).reverse().join('.') // «15.10» (дирижёр 21.10: «октября» — много места)
  const POS = { 1: 'керри', 2: 'мид', 3: 'оффлейн', 4: 'саппорт', 5: 'саппорт' }
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const f1 = n => n.toFixed(1)
  // Стоимость игрока в долларах (дирижёр 21.10: «10.2 чего?»): price в _data.js × $100 000 → «$1,02 млн» / «$520 тыс»
  const usd = n => { const v = Math.abs(n) * 1e5; return v >= 1e6 ? `$${(v / 1e6).toFixed(2).replace('.', ',')} млн` : `$${Math.round(v / 1e3)} тыс` }
  const PER = [{ id: 'week', name: 'Неделя', d: 7 }, { id: 'month', name: 'Месяц', d: 30 }, { id: 'season', name: 'Сезон', d: 366 }]
  const ic = {
    swap: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h9m-2.5-2.5L12 5 9.5 7.5M13 11H4m2.5-2.5L4 11l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8m-3-3 3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} tr-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} tr-ini">${ini(n)}</span>`
  const logo = (n, cls = 'tr-lg') => img((D.teams[n] || {}).logo, n, cls)
  const ava = (p, cls) => img(p.photo, p.nick, cls)
  const game = p => p.game || 'dota2'
  const role = p => p.pos ? `поз. ${p.pos} · ${POS[p.pos]}` : p.role
  const pr = p => { const a = p.price[p.price.length - 2], b = p.price[p.price.length - 1]; return { a, b, d: b - a } }
  const delta = p => { const d = pr(p).d; return `<span class="t3-d ${d >= 0 ? 't3-d--up' : 't3-d--down'}">${d >= 0 ? '▲' : '▼'} ${usd(d)}</span>` }
  const medal = i => i < 3 ? ` t3-top t3-top--${i + 1}` : ''

  // ——— Строки трёх вариантов ———
  // Главное — куда (дирижёр 21.10: «откуда без разницы, главное куда»): новая команда — лого и имя ярко, «из …» — мелко серым; дата — в каждой строке
  // Переход одной строкой (дирижёр 21.10: «непонятно, из какой в какую»): старое лого серым → новое лого и имя ярко
  const to = p => `<span class="t9-to">${logo(p.from, 'tr-lg t9-old')}<i class="t9-ar">${ic.arrow}</i>${logo(p.to, 'tr-lg')}<span class="tr-nm">${p.to}</span>${p.kind === 'loan' ? '<span class="tr-chip">аренда</span>' : ''}</span>`
  let allGames = true // лого игры у строки — только при «Все» (дирижёр 21.10)
  const nick = p => `<b class="t9-nk">${allGames ? glogo(p, 't7-gl') : ''}<span class="tr-nm">${p.nick}</span><span class="t9-dt">${dd(p.date)}</span></b>`
  const price = p => `<span class="t3-pr"><b>${usd(pr(p).b)}</b>${delta(p)}</span>`
  const ROW = {
    // Место — во всех вариантах (дирижёр 21.10)
    rank: (p, i) => `<span class="t3-n">${i + 1}</span>${ava(p, 't3-av')}<span class="t3-m">${nick(p)}${to(p)}</span>${price(p)}`,
    // v4 — лого новой команды крупно слева
    way: (p, i) => `${logo(p.to, 't3-tl t9-big')}<span class="t3-m">${nick(p)}${to(p)}</span>${ava(p, 't3-av t3-av--sm')}${price(p)}`,
    table: (p, i) => `<span class="t3-n">${i + 1}</span>${ava(p, 't3-av t3-av--sm')}<span class="t3-m">${nick(p)}${to(p)}</span>${price(p)}`,
    // v8 — график между игроком и ценой
    spark: (p, i) => `${ava(p, 't3-av')}<span class="t3-m">${nick(p)}${to(p)}</span>${spark(p, 48, 24)}${price(p)}`,
    // v9 — график фоном всей строки (заливка), поверх — игрок и цена
    bg: (p, i) => `${spark(p, 288, 56, 'bg')}${ava(p, 't3-av')}<span class="t3-m">${nick(p)}${to(p)}</span>${price(p)}`,
    // v10 — график во всю ширину под строкой, точка — переход
    under: (p, i) => `<span class="t10-top"><span class="t3-n">${i + 1}</span>${ava(p, 't3-av')}<span class="t3-m">${nick(p)}${to(p)}</span>${price(p)}</span>${spark(p, 272, 28, 'under')}`,
  }
  // Лого игры у строки — видно, когда выбраны «Все»
  const glogo = (p, cls = '') => { const g = D.games.find(x => x.id === game(p)); return g && g.logo ? `<img class="t6-gi ${cls}" src="${g.logo}" alt="${g.name}">` : '' }
  ROW.tableflat = ROW.table // v12 — v11 во всю ширину, без скруглений, строки ниже, зазор больше
  ROW.tableair = ROW.table // v11 — таблица v7 с воздухом (дирижёр 21.10), отличие только в стилях .t3--tableair
  // Мини-график стоимости по 6 турнирам; 'bg' — заливкой фоном строки, 'under' — во всю ширину с точкой перехода
  const spark = (p, W, H, mode) => { const v = p.price, lo = Math.min(...v), hi = Math.max(...v), up = pr(p).d >= 0, col = up ? 'var(--w-up)' : 'var(--w-down)'
    const X = i => (i * W / (v.length - 1)).toFixed(1), Y = n => (3 + (H - 6) * (1 - (n - lo) / (hi - lo || 1))).toFixed(1)
    const line = v.map((n, i) => `${X(i)},${Y(n)}`).join(' '), n = v.length - 1
    if (mode === 'bg') return `<svg class="t9-bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polygon points="0,${H} ${line} ${W},${H}" fill="${col}" opacity=".12"/><polyline points="${line}" fill="none" stroke="${col}" stroke-opacity=".5" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`
    const dot = mode === 'under' ? `<line x1="${((n - .5) * W / n).toFixed(1)}" y1="0" x2="${((n - .5) * W / n).toFixed(1)}" y2="${H}" stroke="var(--w-ring)" stroke-dasharray="2 2"/><circle cx="${X(n)}" cy="${Y(v[n])}" r="3" fill="${col}"/>` : ''
    return `<svg class="t8-sp${mode ? ' t10-sp' : ''}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${dot}<polyline points="${line}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/></svg>` }

  const card = p => { const c = pr(p), v = p.price, W = 288, H = 56, lo = Math.min(...v) - .3, hi = Math.max(...v) + .3
    const X = i => 4 + i * (W - 8) / (v.length - 1), Y = n => 6 + (H - 14) * (1 - (n - lo) / (hi - lo)), xt = (X(v.length - 2) + X(v.length - 1)) / 2
    const col = c.d >= 0 ? 'var(--w-up)' : 'var(--w-down)', pts = v.map((n, i) => `${X(i)},${Y(n)}`)
    return `<div class="tr-bd t3-card">
      <div class="t3-ch">${ava(p, 't3-av t3-av--lg')}<div class="t3-m"><b>${p.nick}</b><span class="tr-cap">${p.name} · ${role(p)}</span><span class="tr-cap">${p.country}, ${p.age}</span></div></div>
      <div class="tr-way"><span>${logo(p.from, 't3-tl')}<span class="tr-nm">${p.from}</span></span><i>${ic.arrow}</i><span>${logo(p.to, 't3-tl')}<span class="tr-nm">${p.to}</span></span></div>
      <div class="t3-pv"><div><span class="tr-cap">Стоимость игрока</span><b>${usd(c.a)} → ${usd(c.b)}</b></div>${delta(p)}</div>
      <svg class="t3-sp" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><line x1="${xt}" y1="0" x2="${xt}" y2="${H}" stroke="var(--w-ring)" stroke-dasharray="3 3"/>
        <text x="${xt + 4}" y="10" class="t3-sp__t">переход</text>
        <polyline points="${pts.slice(0, -1).join(' ')}" fill="none" stroke="var(--w-muted-fg)" stroke-width="1.5"/><polyline points="${pts.slice(-2).join(' ')}" fill="none" stroke="${col}" stroke-width="2"/>
        <circle cx="${X(v.length - 1)}" cy="${Y(c.b)}" r="3.5" fill="${col}"/></svg>
      <dl class="tr-f"><div><dt>Дата перехода</dt><dd><b>${p.date.split('-').reverse().join('.')}</b></dd></div>
        <div><dt>${p.kind === 'loan' ? 'Аренда' : 'Сумма'}</dt><dd>${p.fee || 'не раскрыта'}</dd></div>
        ${p.earn ? `<div><dt>Призовые</dt><dd>${p.earn}</dd></div>` : ''}<div><dt>Источник</dt><dd class="tr-src">${p.src}</dd></div></dl>
      <button class="t3-go">Взять в состав · ${usd(c.b)}</button></div>` }

  function render(el, o = {}) {
    const s = el.st || (el.st = {}), m = o.match, style = (o.opt && o.opt.style) || 'rank'
    if (!s.game) s.game = (o.opt && o.opt.game) || (m ? 'dota2' : 'all') // opt.game — игра страницы (скелетон матча)
    if (!s.per) s.per = (o.opt && o.opt.per) || (m ? 'season' : 'month') // в матче — за сезон: у двух команд за месяц бывает пусто
    const go = q => { Object.assign(s, q); render(el, o) }
    allGames = s.game === 'all'
    const per = PER.find(x => x.id === s.per)
    let items = D.list.map((p, i) => ({ p, i })).filter(({ p }) => (s.game === 'all' || game(p) === s.game) && (NOW - new Date(p.date)) / 864e5 <= per.d)
    if (m) items = items.filter(({ p }) => [m.a, m.b].some(t => p.to === t || p.from === t))
    if (o.team) items = items.filter(({ p }) => p.to === o.team || p.from === o.team) // у команды — её переходы (страница всех виджетов)
    items.sort(['spark', 'bg', 'under'].includes(style) ? (x, y) => pr(y.p).d - pr(x.p).d : (x, y) => pr(y.p).b - pr(x.p).b) // v8 — по росту стоимости
    const all = D.list.filter(x => s.game === 'all' || game(x) === s.game).length
    const max = Math.max(...items.map(x => pr(x.p).b), 1)
    const p = s.card != null ? D.list[s.card] : null
    const games = [{ id: 'all', name: 'Все' }, ...D.games]
    const hd = p
      ? `<div class="tr-hd"><button class="tr-ib" data-back>${ic.back}</button><div class="tr-hd__t"><b>Трансфер</b><span class="tr-cap">${day(p.date)}</span></div></div>`
      : `<div class="tr-hd t3-hd"><div class="tr-hd__t"><b>Трансферы</b></div>
          <div class="t3-g">${games.map(g => `<button data-g="${g.id}" class="${s.game === g.id ? 'is-on' : ''}" title="${g.name}">${g.logo ? `<img src="${g.logo}" alt="">` : g.name}</button>`).join('')}</div></div>
        <div class="t3-seg">${PER.map(x => `<button data-p="${x.id}" class="${s.per === x.id ? 'is-on' : ''}">${x.name}</button>`).join('')}</div>`
    el.innerHTML = `<div class="w tr t3 t3--${style}${p ? '' : ' t3--dock'}"><div class="t3-main">${hd}<div class="w-scroll">${p ? card(p) : `<div class="t3-list t3-list--${style}">${items.length
      ? items.map((x, i) => `<a class="t3-r${medal(i)}" href="#player/${encodeURIComponent(x.p.nick)}" title="Страница игрока ${x.p.nick}">${(ROW[style] || ROW.rank)(x.p, i, max)}</a>`).join('')
      : `<div class="t3-none">За ${per.name.toLowerCase()} переходов не было</div>`}</div>`}</div></div>${p ? '' : `<a class="t3-dock" href="#transfers">${ic.swap}<span>Все трансферы</span><span class="tr-cap">${all} за сезон</span>${ic.next}</a>`}</div>`
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => go({ game: b.dataset.g }))
    el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => go({ per: b.dataset.p }))
    const bk = el.querySelector('[data-back]'); if (bk) bk.onclick = () => go({ card: null })
  }
  window.TR = { render, data: D }
})()
