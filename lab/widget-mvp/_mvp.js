// Виджет MVP (созвон 21.10, Т4.1–Т4.6): лучшие игроки периода по фэнтези-очкам, как недельный рейтинг HLTV — кто поднялся вверх.
// Сверху — игра (Dota 2 · CS2, без «Все»: очки разных игр не сравнить; Т4.1 «делим по играм») и период сегментом «Неделя · Месяц» (Т4.3; турниров нет — дирижёр 21.10). Строка — как у трансферов v12:
// место, аватар, ник, команда, очки и сдвиг места ▲▼. Клик по строке — страница игрока. Внизу плашка (как у трансферов):
// «Хайлайты» и «В фэнтези» (Т4.5). Варианты (o.opt.style): 'table' — только список; 'card' — лидер мини-карточкой фэнтези (Т4.4), ниже список;
// 'podium' — топ-3 пьедесталом, ниже список; 'hltv' — один в один рейтинг HLTV; 'podgrow' — пьедестал с ростом мест, ниже сдвиг крупно. Общие классы шапки, переключателей и плашки — ../widget-transfers/_tr.css.
// MVP.render(узел, { match: { a, b } | null, opt: { style, game, per } }).
(() => {
  const D = window.MVP_DATA
  const PER = [{ id: 'week', name: 'Неделя' }, { id: 'month', name: 'Месяц' }] // турниров нет — общий список по времени (дирижёр 21.10)
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const ic = {
    list: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m8 2 1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    play: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} tr-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} tr-ini">${ini(n)}</span>`
  const logo = (n, cls = 'tr-lg') => img(D.teams[n], n, cls)
  const ava = (p, cls) => img(p.photo, p.nick, cls)
  let allGames = true, per = 'week', podTeam = '', rowBadge = false
  const glogo = p => { const g = D.games.find(x => x.id === p.game); return allGames && g ? `<img class="m-gi" src="${g.logo}" alt="${g.name}">` : '' }
  const st = p => p[per]
  // Сдвиг места против прошлого периода: ▲ поднялся, ▼ опустился, «новый» — не было в топе
  // Сдвиг места: ▲ / ▼ / new (дирижёр 21.10: тег «new» по-английски; в карточках и строках — одинаковой таблеткой)
  const move = (p, i) => { const prev = st(p).prev; if (!prev) return '<span class="m-mv m-mv--new">new</span>'
    const d = prev - (i + 1); return d > 0 ? `<span class="m-mv m-mv--up">▲ ${d}</span>` : d < 0 ? `<span class="m-mv m-mv--down">▼ ${-d}</span>` : '<span class="m-mv">—</span>' }
  const team = p => `<span class="t9-to">${logo(p.team)}<span class="tr-nm">${p.team}</span></span>`
  const nick = p => `<b class="t9-nk">${glogo(p)}<span class="tr-nm">${p.nick}</span>${p.hero ? `<img class="m-hero" src="${p.hero}" alt="" title="Лучший герой">` : ''}</b>`
  const pts = (p, i) => `<span class="t3-pr m-pts"><b>${st(p).pts}</b>${move(p, i)}</span>`
  const href = p => `#player/${encodeURIComponent(p.nick)}`
  const row = (p, i) => `<a class="t3-r${i === 0 ? ' t3-top t3-top--1' : i < 3 ? ` t3-top t3-top--${i + 1}` : ''}" href="${href(p)}" title="Страница игрока ${p.nick}">
    <span class="t3-n">${i + 1}</span>${ava(p, 't3-av t3-av--sm')}<span class="t3-m">${nick(p)}${team(p)}</span>${pts(p, i)}</a>`

  // Лидер мини-карточкой фэнтези: рамка «золото», фото, ник, команда, очки крупно, матчи и KDA
  const card = (p, lbl) => `<a class="m-card" href="${href(p)}" title="Страница игрока ${p.nick}">
    <span class="m-card__ph">${ava(p, 'm-card__img')}<span class="m-card__n">1</span></span>
    <span class="m-card__m"><span class="m-card__tag">${lbl}</span><b class="m-card__nk">${glogo(p)}${p.nick}</b>${team(p)}
      <span class="m-card__pts"><b>${st(p).pts}</b> очков</span>
      <span class="m-card__st">${st(p).m} матчей · ${p.game === 'cs2' ? 'рейтинг' : 'KDA'} ${st(p).kda}${p.hero ? `<img class="m-hero" src="${p.hero}" alt="">` : ''}</span></span></a>`

  // Пьедестал: 2 · 1 · 3, первый выше
  const podium = items => `<div class="m-pod">${[1, 0, 2].filter(i => items[i]).map(i => { const p = items[i]
    return `<a class="m-pod__c m-pod__c--${i + 1}" href="${href(p)}" title="Страница игрока ${p.nick}">${ava(p, 'm-pod__img')}<span class="m-pod__p">${i + 1}</span>
      <b class="tr-nm">${p.nick}</b><span class="m-pod__t">${logo(p.team)}</span><span class="m-pod__pts">${st(p).pts}</span></a>` }).join('')}</div>`

  // v4 'hltv' — как рейтинг HLTV (тёмная тема hltv.org): таблица с шапкой колонок «# · Игрок · Матчи · KDA · Очки», строки через одну,
  // место «#1», рядом сдвиг +2 / −1 зелёным и красным, у ника — лого команды
  const hmove = (p, i) => { const prev = st(p).prev; if (!prev) return '<span class="h-mv h-mv--new">new</span>'
    const d = prev - (i + 1); return d > 0 ? `<span class="h-mv h-mv--up">+${d}</span>` : d < 0 ? `<span class="h-mv h-mv--down">${d}</span>` : '<span class="h-mv">-</span>' }
  const hltv = (items, off = 0) => `<table class="h-t"><thead><tr><th>#</th><th>Игрок</th><th>Матчи</th><th>${items[0] && items[0].game === 'cs2' ? 'Рейт.' : 'KDA'}</th><th>Очки</th></tr></thead>
    <tbody>${items.map((p, j) => { const i = j + off; return `<tr onclick="location.hash='${href(p)}'"><td><b>#${i + 1}</b>${hmove(p, i)}</td>
      <td><span class="h-p">${logo(p.team, 'h-lg')}<span class="tr-nm">${p.nick}</span></span></td><td>${st(p).m}</td><td>${st(p).kda}</td><td><b>${st(p).pts}</b></td></tr>` }).join('')}</tbody></table>`
  // v6 'htable' — таблица HLTV в нашей стилистике (zinc) + аккуратный пьедестал сверху; v7 — то же, opt.tint: акцент цветом игры
  const htable = items => `<div class="m-pod m-pod--sm">${podium(items).replace(/^<div class="m-pod">|<\/div>$/g, '')}</div>${hltv(items.slice(3), 3)}`
  // v8 'hrows' — как v7, но без пьедестала и без шапки колонок: только строки (дирижёр 21.10)
  const hrows = items => hltv(items).replace(/<thead>.*?<\/thead>/s, '')
  // v5 'podgrow' — пьедестал 2 · 1 · 3 с ростом мест у каждого, ниже — таблица со столбцом «сдвиг» крупно
  const podgrow = items => podium(items).replace(/<span class="m-pod__pts">(\d+)<\/span>/g, (m0, n) => { const i = items.findIndex(p => String(st(p).pts) === n); return `${m0}${move(items[i], i)}` })
  const growRow = (p, i) => row(p, i).replace(/<span class="t3-pr m-pts"><b>(\d+)<\/b>(.*?)<\/span><\/a>/s, (m0, n, mv) => `<span class="m-g">${mv}</span><span class="t3-pr m-pts"><b>${n}</b><span class="m-mv">${st(p).m} матч.</span></span></a>`)

  // ——— Кардинально другие подачи (дирижёр 21.10) ———
  // Псевдослучайно, но одинаково при каждом показе — для формы и гонки (данные — пример)
  const rnd = (k, n) => { let h = 0; for (const c of k + n) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 1000) / 1000 }
  // v9 'cards' — лента мини-карточек фэнтези (5:7), листается вбок; место, очки, сдвиг; первая — золотая
  const cards = items => `<div class="c9">${items.map((p, i) => `<a class="c9-c${i === 0 ? ' is-1' : ''}" href="${href(p)}" title="Страница игрока ${p.nick}">
    ${ava(p, 'c9-img')}<span class="c9-n">${i + 1}</span><span class="c9-tm">${logo(p.team, 'tr-lg')}</span>
    <span class="c9-b"><b class="tr-nm">${p.nick}</b><span class="c9-p"><b>${st(p).pts}</b>${move(p, i)}</span></span></a>`).join('')}</div>`
  // v10 'race' — гонка за неделю: места топ-5 по дням линиями, у конца — аватар; видно, кто поднялся
  const race = items => { const top = items.slice(0, 5), W = 232, H = 168, days = 7, X = d => 8 + d * (W - 16) / (days - 1), Y = r => 14 + (r - 1) * (H - 28) / 4
    const cols = ['#f1c24c', '#e4e4e7', '#fdba74', '#60a5fa', '#a78bfa']
    const path = (p, i) => { const a = st(p).prev || 6, b = i + 1; return Array.from({ length: days }, (_, d) => { const t = d / (days - 1), r = Math.min(6, Math.max(1, Math.round(a + (b - a) * t + (d && d < days - 1 ? (rnd(p.nick, d) - .5) * 2 : 0)))); return [X(d), Y(Math.min(r, 5.6))] }) }
    return `<div class="r10"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${[1, 2, 3, 4, 5].map(r => `<text x="0" y="${Y(r) + 4}" class="r10-t">${r}</text>`).join('')}
      ${top.map((p, i) => `<polyline points="${path(p, i).map(q => q.join(',')).join(' ')}" fill="none" stroke="${cols[i]}" stroke-width="${i ? 1.5 : 2.5}" stroke-linejoin="round" opacity="${i ? .75 : 1}"/>`).join('')}
      <text x="${X(0)}" y="${H - 1}" class="r10-t">пн</text><text x="${X(days - 1)}" y="${H - 1}" class="r10-t" text-anchor="end">вс</text></svg>
      <div class="r10-l">${top.map((p, i) => `<a href="${href(p)}" style="top:${Y(i + 1) - 12}px" title="Страница игрока ${p.nick}">${ava(p, 'r10-av')}<span><b class="tr-nm">${p.nick}</b>${move(p, i)}</span></a>`).join('')}</div></div>
      <div class="t3-list">${items.slice(5).map((p, i) => row(p, i + 5)).join('')}</div>` }
  // v11 'form' — форма: последние 5 матчей квадратами цветом (очки матча), без длинных чисел
  const form = items => `<div class="f11">${items.map((p, i) => { const avg = st(p).pts / st(p).m
    const sq = Array.from({ length: 5 }, (_, k) => Math.round(avg * (.55 + rnd(p.nick, k) * .9)))
    const c = v => v >= avg * 1.15 ? 'hi' : v <= avg * .8 ? 'lo' : 'mid'
    return `<a class="f11-r${i === 0 ? ' is-1' : ''}" href="${href(p)}" title="Страница игрока ${p.nick}"><span class="f11-n">${i + 1}</span>${ava(p, 't3-av t3-av--sm')}
      <span class="t3-m"><b class="t9-nk"><span class="tr-nm">${p.nick}</span></b>${move(p, i)}</span>
      <span class="f11-sq">${sq.map(v => `<i class="f11-${c(v)}" title="${v} очков">${v}</i>`).join('')}</span></a>` }).join('')}</div>`

  // ——— Ближе к трансферам v12: тот же ряд, по-разному разложен баланс (дирижёр 21.10) ———
  const cls = i => `t3-r${i === 0 ? ' t3-top t3-top--1' : i < 3 ? ` t3-top t3-top--${i + 1}` : ''}`
  const pm = p => (st(p).pts / st(p).m).toFixed(1).replace('.', ',')
  const ROWS = {
    // v12 — место и сдвиг столбиком слева, справа только очки и матчи
    left: (p, i) => `<a class="${cls(i)}" href="${href(p)}"><span class="b-rk"><b>${i + 1}</b>${move(p, i)}</span>${ava(p, 't3-av t3-av--sm')}
      <span class="t3-m">${nick(p)}${team(p)}</span><span class="t3-pr m-pts"><b>${st(p).pts}</b><span class="m-mv">${st(p).m} матч.</span></span></a>`,
    // v13 — главное «очки за матч», сумма мелко; сдвиг плашкой у ника
    avg: (p, i) => `<a class="${cls(i)}" href="${href(p)}"><span class="t3-n">${i + 1}</span>${ava(p, 't3-av t3-av--sm')}
      <span class="t3-m"><b class="t9-nk"><span class="tr-nm">${p.nick}</span>${move(p, i).replace('m-mv', 'm-mv b-chip')}</b>${team(p)}</span>
      <span class="t3-pr m-pts"><b>${pm(p)}</b><span class="m-mv">за матч · ${st(p).pts}</span></span></a>`,
    // v14 — аватар крупнее, сдвиг цветной таблеткой справа рядом с очками
    // rowBadge — лого команды кружком у аватара, как на пьедестале v25; в строке команды остаётся только имя (дирижёр 21.10)
    pill: (p, i) => `<a class="${cls(i)} b-pill" href="${href(p)}"><span class="t3-n">${i + 1}</span>${rowBadge ? `<span class="pt-avw">${ava(p, 't3-av')}${logo(p.team, 'pt-bd')}</span>` : ava(p, 't3-av')}
      <span class="t3-m">${nick(p)}${rowBadge ? `<span class="t9-to"><span class="tr-nm pt-tn">${p.team}</span></span>` : team(p)}</span>${move(p, i).replace('m-mv', 'm-mv b-pl')}<span class="t3-pr m-pts"><b>${st(p).pts}</b></span></a>`,
  }
  // Концепты строки (дирижёр 21.10): 'add' — «+» в конце строки, взять игрока в состав не уходя; 'pop' — сколько % составов уже с ним (пример)
  const popOf = (p, i) => Math.max(3, Math.round(48 - i * 2.2 - rnd(p.nick, 9) * 6))
  const rowC = (kind, p, i) => { const r = ROWS.pill(p, i)
    if (kind === 'add') return r.replace('</a>', `<button class="k-add" title="Взять ${p.nick} в состав" onclick="event.preventDefault();this.classList.toggle('is-on')">+</button></a>`)
    if (kind === 'pop') return r.replace(/(<span class="t3-m">.*?)(<\/span><span class="m-mv)/s, (m0, a, b) => `${a}<span class="k-pop"><i style="width:${popOf(p, i)}%"></i><em>в ${popOf(p, i)}% составов</em></span>${b}`)
    return r }
  // v15 'stairs' — v14 + пьедестал лесенкой: 1 слева и выше всех, дальше 2 и 3 ступенями вниз (дирижёр 21.10)
  // Игроков меньше 7 (у команды — 5) — без пьедестала, просто списком (дирижёр 21.10)
  const stairs = items => `<div class="m-pod m-st">${[0, 1, 2].filter(i => items[i]).map(i => { const p = items[i]
    // Команда на ступени (дирижёр 21.10), podTeam: 'badge' — лого кружком у аватара · 'line' — лого и имя под ником · 'mark' — большое лого фоном ступени
    const pt = podTeam
    return `<a class="m-pod__c m-pod__c--${i + 1}${pt ? ` pt-${pt}` : ''}" href="${href(p)}" title="Страница игрока ${p.nick}">${pt === 'mark' ? logo(p.team, 'pt-mk') : ''}<span class="pt-avw">${ava(p, 'm-pod__img')}${pt === 'badge' ? logo(p.team, 'pt-bd') : ''}</span><span class="m-pod__p">${i + 1}</span>
      <b class="tr-nm">${p.nick}</b>${pt === 'line' ? `<span class="pt-ln">${logo(p.team)}<span class="tr-nm">${p.team}</span></span>` : ''}<span class="m-st__pts"><b>${st(p).pts}</b>${move(p, i).replace('m-mv', 'm-mv b-pl')}</span></a>` }).join('')}</div>`
  // Плашка для того, кто ещё не в фэнтези (o.nofan) — как подвигнуть попробовать (дирижёр 21.10), o.opt.nofan:
  // 'cta' — топ-3 аватарами + кнопка «Собрать состав»; 'fomo' — «взял бы Yatoro в пн — было бы +412»; 'slots' — 5 пустых слотов состава + «Заполнить топом»;
  // 'social' — сколько людей уже взяли лидера + кнопка; 'slots2' — слоты крупно + кнопка во всю ширину; 'banner' — золотой баннер «в один клик»
  const nofan = (kind, items) => { const top = items[0] || {}, t3 = items.slice(0, 3)
    if (kind === 'fomo') return `<a class="t3-dock n-dock" href="#fantasy"><span class="n-tx">Взял бы <b>${top.nick}</b> в понедельник — сейчас было бы <b class="n-up">+${st(top).pts}</b></span><span class="n-btn">Играть</span></a>`
    if (kind === 'slots') return `<a class="t3-dock n-dock" href="#fantasy"><span class="n-slots">${[0, 1, 2, 3, 4].map(i => `<i>${i < 3 && t3[i] ? ava(t3[i], 'n-sl') : '+'}</i>`).join('')}</span><span class="n-tx">Твой состав</span><span class="n-btn">Заполнить топом</span></a>`
    if (kind === 'slots2') return `<div class="t3-dock n-dock n-dock--col"><div class="n-row"><span class="n-slots n-slots--lg">${[0, 1, 2, 3, 4].map(i => `<i>${items[i] ? ava(items[i], 'n-sl') : '+'}</i>`).join('')}</span><span class="n-tx n-tx--sm"><b>12 480</b> уже собрали топ недели</span></div><a class="n-btn n-btn--w" href="#fantasy">Заполнить состав топом</a></div>`
    // Состав в фэнтези — пятёрка (website/blocks/lineup), поэтому в баннере топ-5, а не 3 (дирижёр 21.10)
    if (kind === 'banner') return `<a class="t3-dock n-dock n-dock--banner" href="#fantasy"><span class="n-stack">${items.slice(0, 5).map(p => ava(p, 'b-mav')).join('')}</span><span class="n-tx"><b>Состав из топа недели</b><span class="tr-nm">${items.slice(0, 5).map(p => p.nick).join(', ')}</span></span><span class="n-go">${ic.next}</span></a>`
    // Идея v18 «уже взяли» — разные виды нижней части (дирижёр 21.10: «на основе 18»)
    if (kind === 'social2') return `<a class="t3-dock n-dock" href="#fantasy"><span class="s2-av">${ava(top, 'b-mav')}</span><span class="n-tx"><b>12 480</b> человек<br><span class="n-sub">взяли ${top.nick} в состав</span></span><span class="n-btn">Взять тоже</span></a>`
    if (kind === 'social3') return `<a class="t3-dock n-dock" href="#fantasy"><span class="n-stack s3">${items.slice(5, 9).map(p => ava(p, 'b-mav')).join('')}<i>+12k</i></span><span class="n-tx">собрали состав с <b>${top.nick}</b></span><span class="n-btn">Взять</span></a>`
    if (kind === 'social4') return `<div class="t3-dock n-dock n-dock--col"><span class="n-tx n-tx--sm">Чаще всего берут в состав</span><div class="s4">${t3.map((p, i) => `<a href="#fantasy">${ava(p, 'b-mav')}<span><b class="tr-nm">${p.nick}</b><em>${['12,5k', '9,1k', '7,4k'][i]}</em></span><i>+</i></a>`).join('')}</div></div>`
    if (kind === 'social') return `<a class="t3-dock n-dock" href="#fantasy">${ava(top, 'b-mav')}<span class="n-tx"><b>12 480</b> человек взяли ${top.nick}</span><span class="n-btn">Взять тоже</span></a>`
    return `<a class="t3-dock n-dock" href="#fantasy"><span class="n-stack">${t3.map(p => ava(p, 'b-mav')).join('')}</span><span class="n-tx">Собери свой топ</span><span class="n-btn">Собрать состав</span></a>` }

  // Баннер: под заголовком — сами пятеро по никам (дирижёр 21.10: «в один клик · 12 480 уже взяли» не нравится)
  // Плашка снизу — три предложения: 'all' весь рейтинг · 'fantasy' собрать состав из топа · 'mine' твои игроки в рейтинге
  const dock = (kind, items, s) => kind === 'all' ? `<a class="t3-dock" href="#mvp">${ic.list}<span>Весь рейтинг</span><span class="tr-cap">${items.length} игроков</span>${ic.next}</a>`
    : kind === 'fantasy' ? `<a class="t3-dock b-dock--f" href="#fantasy">${ic.star}<span>Собрать состав из топа</span><span class="tr-cap">${items.slice(0, 5).map(p => p.nick).slice(0, 2).join(', ')}…</span>${ic.next}</a>`
    : kind === 'minebanner' ? (() => { const mine = items.map((p, i) => ({ p, i })).filter(x => ['Yatoro', 'Larl', 'NertZ', 'bodyy'].includes(x.p.nick))
      return `<a class="t3-dock n-dock n-dock--banner" href="#fantasy"><span class="n-stack">${mine.map(x => ava(x.p, 'b-mav')).join('')}</span><span class="n-tx"><b>Твои в рейтинге</b><span>${mine.map(x => `${x.p.nick} #${x.i + 1}`).join(' · ') || 'пока никого'}</span></span><span class="n-go">${ic.next}</span></a>` })()
    : kind === 'mine' ? (() => { const mine = items.map((p, i) => ({ p, i })).filter(x => ['Yatoro', 'Larl', 'NertZ', 'bodyy'].includes(x.p.nick))
      return `<a class="t3-dock" href="#fantasy">${ic.star}<span>Твои в рейтинге</span><span class="b-mine">${mine.map(x => `${ava(x.p, 'b-mav')}<b>#${x.i + 1}</b>`).join('') || '<span class="tr-cap">никого</span>'}</span>${ic.next}</a>` })() : ''

  function render(el, o = {}) {
    const s = el.st || (el.st = {}), m = o.match, style = (o.opt && o.opt.style) || 'table'
    if (!s.game) s.game = (o.opt && o.opt.game) || 'dota2' // «Все» нет: очки разных игр не сравнить (дирижёр 21.10)
    if (!s.per) s.per = (o.opt && o.opt.per) || 'week'
    const go = q => { Object.assign(s, q); render(el, o) }
    allGames = s.game === 'all'; per = s.per; podTeam = (o.opt && o.opt.podTeam) || ''; rowBadge = !!(o.opt && o.opt.rowBadge)
    let items = D.list.filter(p => s.game === 'all' || p.game === s.game)
    if (m) items = items.filter(p => p.team === m.a || p.team === m.b)
    if (o.team) items = items.filter(p => p.team === o.team)
    items = [...items].sort((a, b) => st(b).pts - st(a).pts)
    if (!m && !o.team) items = items.slice(0, 20) // общий рейтинг — топ-20, как у HLTV; у команды и в матче — все игроки (5 и 10)
    const games = D.games
    // Заголовок по контексту (дирижёр 21.10): в матче — «MVP матча», у команды — «MVP команды», иначе — по периоду
    const title = m ? 'MVP матча' : o.team ? `MVP · ${o.team}` : s.per === 'week' ? 'MVP недели' : 'MVP месяца'
    const lbl = s.per === 'week' ? 'MVP недели' : 'MVP месяца'
    const head = style === 'card' && items[0] ? card(items[0], lbl) : style === 'podium' ? podium(items) : style === 'podgrow' ? podgrow(items) : style === 'hltv' ? hltv(items) : style === 'htable' ? htable(items) : style === 'hrows' ? hrows(items) : style === 'cards' ? cards(items) : style === 'race' ? race(items) : style === 'form' ? form(items) : style === 'stairs' ? (items.length < 7 ? '' : stairs(items)) : ''
    const rest = style === 'card' ? items.slice(1).map((p, i) => row(p, i + 1)) : style === 'podium' ? items.slice(3).map((p, i) => row(p, i + 3))
      : style === 'podgrow' ? items.slice(3).map((p, i) => growRow(p, i + 3)) : ['hltv', 'htable', 'hrows', 'cards', 'race', 'form'].includes(style) ? [] : style === 'stairs' ? (items.length < 7 ? items.map((p, i) => rowC(o.opt && o.opt.rowc, p, i)) : items.slice(3).map((p, i) => rowC(o.opt && o.opt.rowc, p, i + 3))) : ROWS[style] ? items.map(ROWS[style]) : items.map(row)
    el.innerHTML = `<div class="w tr t3 t3--tableflat m m--${style}${o.opt && o.opt.v ? ` m--${o.opt.v}` : ''} t3--dock${o.opt && o.opt.tint ? ` m--tint m--g-${s.game}` : ''}"><div class="t3-main">
      <div class="tr-hd t3-hd"><div class="tr-hd__t"><b>${title}</b></div>
        <div class="t3-g">${games.map(g => `<button data-g="${g.id}" class="${s.game === g.id ? 'is-on' : ''}" title="${g.name}">${g.logo ? `<img src="${g.logo}" alt="">` : g.name}</button>`).join('')}</div></div>
      <div class="t3-seg">${PER.map(x => `<button data-p="${x.id}" class="${s.per === x.id ? 'is-on' : ''}">${x.name}</button>`).join('')}</div>
      <div class="w-scroll">${head}<div class="t3-list">${rest.join('') || (items.length ? '' : '<div class="t3-none">Нет игроков за период</div>')}</div></div></div>
      ${o.nofan ? nofan(o.opt && o.opt.nofan, items) : o.opt && o.opt.dock ? dock(o.opt.dock, items, s) : `<div class="t3-dock m-dock"><a href="#highlights">${ic.play}<span>Хайлайты</span></a><a href="#fantasy" class="m-dock__f"><span>В фэнтези</span>${ic.next}</a></div>`}</div>`
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => go({ game: b.dataset.g }))
    el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => go({ per: b.dataset.p }))
  }
  window.MVP = { render, data: D }
})()
