// Виджет трансферов v2 «Цена игрока» (дирижёр 21.10: подробнее, ценность игрока, крючок к фэнтези-карточкам; референс — Transfermarkt).
// Сверху — герой: выбранный переход крупно (фото, откуда → куда, дата, фэнтези-цена и её сдвиг). Ниже — остальные строками, клик — в героя.
// Клик по герою — карточка: график цены по турнирам с меткой перехода, факты, путь по командам, «Взять в состав».
// Два состояния (О.16): на главной — все переходы; в матче (o.match) — только две команды матча, своим цветом.
// ‼️ Цена — пример (price в _data.js), остальное — Liquipedia. TR2.render(узел, { match: { a, b } | null }).
(() => {
  const D = window.TR_DATA
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const day = s => { const [, m, d] = s.split('-'); return `${+d} ${MON[m - 1]}` }
  const POS = { 1: 'керри', 2: 'мид', 3: 'оффлейн', 4: 'саппорт', 5: 'саппорт' }
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const f1 = n => n.toFixed(1)
  const ic = {
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8m-3-3 3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} tr-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} tr-ini">${ini(n)}</span>`
  const logo = (n, cls = 'tr-lg') => img((D.teams[n] || {}).logo, n, cls)
  const ava = (p, cls) => img(p.photo, p.nick, cls)
  // Цена: до перехода — предпоследняя точка, после — последняя
  const pr = p => { const a = p.price[p.price.length - 2], b = p.price[p.price.length - 1], d = b - a; return { a, b, d, up: d >= 0 } }
  const delta = (p, cls = '') => { const c = pr(p); return `<span class="t2-d ${c.up ? 't2-d--up' : 't2-d--down'} ${cls}">${c.up ? '▲' : '▼'} ${f1(Math.abs(c.d))}</span>` }

  // Герой: фото справа, слева — дата, ник, путь, цена
  const hero = (p, side) => { const c = pr(p)
    return `<button class="t2-hero" data-card>${ava(p, 't2-hero__img')}
      <span class="t2-hero__m">
        <span class="tr-cap">${side || day(p.date)}${p.kind === 'loan' ? ' · аренда' : ''}</span>
        <b class="t2-hero__n">${p.nick}</b>
        <span class="t2-way">${logo(p.from)}<i>${ic.arrow}</i>${logo(p.to)}<span class="tr-nm">${p.to}</span></span>
        <span class="t2-price"><b>${f1(c.b)}</b>${delta(p)}</span>
        <span class="t2-price__l">цена в фэнтези</span>
      </span></button>` }

  // Строка: аватар, ник, откуда → куда, сдвиг цены
  const row = (p, i, side, k) => `<button class="t2-r" data-i="${i}">${k ? `<i class="tr-cd tr-cd--${k}"></i>` : ''}${ava(p, 't2-av')}
    <span class="t2-r__m"><b>${p.nick}</b><span class="tr-cap">${side || day(p.date)}</span></span>
    <span class="tr-mv">${logo(p.from)}<i>${ic.arrow}</i>${logo(p.to)}</span>${delta(p)}</button>`

  // График цены по турнирам: точки, последняя — после перехода, метка «переход» пунктиром
  const chart = p => { const W = 288, H = 64, v = p.price, lo = Math.min(...v) - .3, hi = Math.max(...v) + .3
    const X = i => 4 + i * (W - 8) / (v.length - 1), Y = n => 6 + (H - 20) * (1 - (n - lo) / (hi - lo))
    const pts = v.map((n, i) => `${f1(X(i))},${f1(Y(n))}`), xt = (X(v.length - 2) + X(v.length - 1)) / 2, c = pr(p)
    return `<svg class="t2-ch" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <line x1="${xt}" y1="0" x2="${xt}" y2="${H - 14}" stroke="var(--w-ring)" stroke-dasharray="3 3"/>
      <text x="${xt + 4}" y="10" class="t2-ch__t">переход</text>
      <polyline points="${pts.slice(0, -1).join(' ')}" fill="none" stroke="var(--w-muted-fg)" stroke-width="1.5"/>
      <polyline points="${pts.slice(-2).join(' ')}" fill="none" stroke="${c.up ? 'var(--w-up)' : 'var(--w-down)'}" stroke-width="2"/>
      ${v.map((n, i) => `<circle cx="${X(i)}" cy="${Y(n)}" r="${i === v.length - 1 ? 3.5 : 2}" fill="${i === v.length - 1 ? (c.up ? 'var(--w-up)' : 'var(--w-down)') : 'var(--w-muted-fg)'}"/>`).join('')}
      <text x="4" y="${H - 2}" class="t2-ch__t">6 турниров назад</text><text x="${W - 4}" y="${H - 2}" class="t2-ch__t" text-anchor="end">сейчас</text></svg>` }

  const card = p => { const c = pr(p)
    return `<div class="tr-ph">${ava(p, 'tr-ph__img')}<div class="tr-ph__n"><b>${p.nick}</b><span>${p.name} · поз. ${p.pos} · ${POS[p.pos]}</span></div></div>
    <div class="tr-bd">
      <div class="tr-way"><span>${logo(p.from, 'tr-lg tr-lg--24')}<span class="tr-nm">${p.from}</span></span><i>${ic.arrow}</i><span>${logo(p.to, 'tr-lg tr-lg--24')}<span class="tr-nm">${p.to}</span></span></div>
      <div class="t2-pv"><div><span class="tr-cap">Цена в фэнтези</span><b>${f1(c.a)} → ${f1(c.b)}</b></div>${delta(p, 't2-d--lg')}</div>
      ${chart(p)}
      <dl class="tr-f">
        <div><dt>Дата перехода</dt><dd><b>${p.date.split('-').reverse().join('.')}</b></dd></div>
        <div><dt>${p.kind === 'loan' ? 'Аренда' : 'Сумма'}</dt><dd>${p.fee || 'не раскрыта'}</dd></div>
        <div><dt>Страна, возраст</dt><dd>${p.country}, ${p.age}</dd></div>
        <div><dt>Призовые за карьеру</dt><dd>${p.earn}</dd></div>
      </dl>
      <div class="t2-lbl">Путь по командам</div>
      <ol class="t2-path">${p.path.map(t => { const [n, y] = [t.replace(/ [\d–]+$/, ''), (t.match(/[\d–]+$/) || [''])[0]]
        return `<li>${logo(n)}<span class="tr-nm">${n}</span><span class="tr-cap">${y}</span></li>` }).join('')}
        <li class="is-now">${logo(p.to)}<span class="tr-nm">${p.to}</span><span class="tr-cap">с ${day(p.date)}</span></li></ol>
      <button class="t2-go">Взять в состав · ${f1(c.b)}</button>
      <div class="tr-cap t2-src">Источник: ${p.src} · цена — пример</div>
    </div>` }

  function render(el, o = {}) {
    const s = el.st || (el.st = {}), m = o.match
    const go = q => { Object.assign(s, q); render(el, o) }
    // Какие переходы и с какой подписью
    let items = D.list.map((p, i) => ({ p, i }))
    if (m) items = items.filter(({ p }) => [m.a, m.b].some(t => p.to === t || p.from === t)).map(x => {
      const k = x.p.to === m.a || x.p.from === m.a ? 'a' : 'b', t = k === 'a' ? m.a : m.b
      return { ...x, k, side: x.p.to === t ? `пришёл в ${t}` : `ушёл из ${t}` } })
    if (s.sel == null || !items.some(x => x.i === s.sel)) s.sel = items[0] && items[0].i
    const cur = items.find(x => x.i === s.sel)
    const p = s.card ? cur.p : null
    const hd = p
      ? `<button class="tr-ib" data-back>${ic.back}</button><div class="tr-hd__t"><b>Трансфер</b><span class="tr-cap">${day(p.date)}</span></div>`
      : `<img class="tr-game" src="${D.game.logo}" alt=""><div class="tr-hd__t"><b>Трансферы</b><span class="tr-cap">${m ? 'Команды матча' : 'Тир-1 и тир-2 · свежие'}</span></div>`
    el.innerHTML = `<div class="w tr t2${p ? ' tr--card' : ''}"><div class="tr-hd">${hd}</div>${p
      ? `<div class="w-scroll">${card(p)}</div>`
      : `${hero(cur.p, cur.side)}<div class="w-scroll t2-list">${items.filter(x => x.i !== s.sel).map(x => row(x.p, x.i, x.side, x.k)).join('')}</div>`}</div>`
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => go({ sel: +b.dataset.i }))
    const h = el.querySelector('[data-card]'); if (h) h.onclick = () => go({ card: true })
    const bk = el.querySelector('[data-back]'); if (bk) bk.onclick = () => go({ card: false })
  }
  window.TR = { render, data: D }
})()
