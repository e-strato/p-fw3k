// Виджет замен, заход 3 (созвон 22.10, решение 29) — технический, для админа: держать составы в базе верными.
// Твёрдо: шапка «Замены» + ссылка на архив (без сегмента Новые / Проверенные); источника и надёжности нет; каждую замену проверяем отдельно;
// игрок — поиском по базе (ник · Steam ID · ссылка Dotabuff / OpenDota), состав команды первым, у каждого позиция; не нашли — добавить по Steam ID;
// срок: на матч · на карту · на турнир · до даты · навсегда · смена позиции; состояния: все замены · замены матча · замен нет.
// Три концепции (o.mode) — разные ответы на открытые вопросы (как показать «заранее / в матче», куда ведёт клик по матчу):
//   queue  (v2) — «Очередь»: утренний разбор матч за матчем прямо в виджете, счётчик «осталось N», проверил матч — «Следующий матч»;
//   roster (v3) — «Составы»: как инструмент начальника, но в 320 — матч → команда (сегмент) × 5 позиций, расхождения подсвечены, поиск в строке;
//   wizard (v4) — «По шагам»: список разбит на «Во время матча» и «Заранее»; замена открывается шагами Кто → Позиция → Срок → Проверь.
// Данные — window.SUBS2 (_data.js, в основном выдумано), логотипы — T4_DATA (виджет турнира, страница с <base> в его папку).
// S6.render(узел, { mode, match: id матча | null })
(() => {
  const D = window.SUBS2, T = window.T4_DATA
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const logo = (n, cls = 's6-lg') => { const src = T.teams[n] && T.teams[n].logo; return src ? `<img class="${cls}" src="${src}" alt="" title="${n}">` : `<span class="${cls} s6-ini" title="${n}">${ini(n)}</span>` }
  const ic = {
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arr: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0-3-3m3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ok: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    find: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    warn: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2.5 14 13H2L8 2.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6.5V9.5M8 11.2v.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    copy: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" stroke="currentColor" stroke-width="1.4"/></svg>',
    ext: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const M = id => D.matches.find(m => m.id === id)
  const subsOf = m => D.subs.filter(x => x.m === m.id)
  const plural = (n, a, b, c) => n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c
  const when = m => m.done ? `<span class="s6-chip">${m.when} · ${m.done}</span>` : m.when === 'live' ? `<span class="s6-chip s6-chip--live">LIVE · ${CAP ? 'Карта' : 'карта'} ${m.map}</span>` : `<span class="s6-chip">${m.when}</span>`
  // v11–v13 (o.cap, дирижёр 22.10: «всё с большой буквы»): подписи и метки с заглавной. CAP ставит render()
  let CAP = false
  const Cp = t => CAP && t ? t[0].toUpperCase() + t.slice(1) : t
  const KIND = { news: 'заранее', ids: 'в матче · ID не совпал', pos: 'в матче · позиция' }
  const kindText = x => Cp(x.kind === 'news' ? 'заранее · ' + x.date : x.kind === 'ids' ? 'ID не совпал' : 'позиция') + (x.map ? ` · ${CAP ? 'Карта' : 'карта'} ${x.map}` : '')
  const kindTag = x => `<span class="s6-tag s6-tag--${x.kind}">${kindText(x)}</span>`
  // Срок замены: что из этого есть у матча — на карту только у серии
  const TERM = [['match', 'На матч'], ['map', 'На карту'], ['event', 'На турнир'], ['date', 'До даты'], ['forever', 'Навсегда'], ['pos', 'Смена позиции']]
  const termText = (x, d) => Cp(termText0(x, d))
  const termText0 = (x, d) => { const m = M(x.m), k = d.term
    return k === 'match' ? 'на матч' : k === 'map' ? `с ${d.map || x.map || 1}-й карты` : k === 'event' ? `на ${m.tour}` : k === 'date' ? `до ${d.to || '…'}` : k === 'forever' ? 'навсегда' : 'смена позиции' }

  // ——— Поиск игрока по базе: ник / Steam ID / ссылка; состав команды — первым ———
  const players = () => [...Object.entries(D.rosters).flatMap(([team, r]) => r.map(([n, id], i) => ({ n, team, pos: i + 1, id }))), ...D.base.map(([n, team, pos, id]) => ({ n, team, pos, id }))]
  const byName = n => players().find(p => p.n === n)
  const idOf = q => { const m = /(?:dotabuff\.com\/players|opendota\.com\/players)\/(\d+)/.exec(q) || /^\s*(\d{6,})\s*$/.exec(q); return m ? m[1] : null }
  const search = (q, team) => { const id = idOf(q), t = q.trim().toLowerCase(), all = players()
    const hit = all.filter(p => id ? p.id === id : !t || p.n.toLowerCase().startsWith(t) || p.n.toLowerCase().includes(t))
    return hit.sort((a, b) => (b.team === team) - (a.team === team) || a.pos - b.pos).slice(0, 5) }
  const resRow = (p, team) => `<button class="s6-res" data-pick="${p.n}"><span class="s6-av">${p.n.slice(0, 1).toUpperCase()}</span><span class="s6-res__m"><b>${p.n}</b><span class="s6-cap">${p.team === team ? p.team + ' · состав' : p.team || 'без команды'} · ${p.id}</span></span><span class="s6-res__p ${p.team === team ? 'is-own' : ''}">поз. ${p.pos}</span></button>`
  // Выпадающий список под полем: пусто — подсказка; есть совпадения — до 5; нет — «добавить по Steam ID»
  const drop = (q, team) => { const r = search(q, team), id = idOf(q)
    if (!q.trim()) return `<div class="s6-drop"><div class="s6-drop__hint">Ник, Steam ID или ссылка Dotabuff / OpenDota</div>${r.filter(p => p.team === team).map(p => resRow(p, team)).join('')}</div>`
    return `<div class="s6-drop">${r.map(p => resRow(p, team)).join('')}${r.length ? '' : `<div class="s6-drop__none">${id ? `Игрока со Steam ID ${id} в базе нет` : 'В базе не нашли'}</div>`}
      ${id && !r.length ? `<button class="s6-res s6-res--add" data-add="${id}"><span class="s6-av">+</span><span class="s6-res__m"><b>Добавить в базу</b><span class="s6-cap">Steam ID ${id}</span></span></button>` : !r.length ? '<div class="s6-drop__hint">Вставь Steam ID — добавим нового игрока</div>' : ''}</div>` }
  const field = (s, x) => `<div class="s6-find"><span class="s6-find__i">${ic.find}</span><input class="s6-in" data-q placeholder="Ник, Steam ID или ссылка · поз. ${s.pos || x.pos}" value="${(s.q || '').replace(/"/g, '&quot;')}" autocomplete="off" /></div>`
  // Кто сейчас выбран: предложенный системой, выбранный в поиске или добавленный по ID
  const picked = (x, d) => d.who === undefined ? x.in : d.who
  const whoCard = (x, d) => { const n = picked(x, d), p = n && byName(n), add = d.addId
    if (add) return `<div class="s6-who"><span class="s6-av">+</span><span class="s6-res__m"><b>Новый игрок</b><span class="s6-cap">Steam ID ${add} · добавим в базу</span></span><button class="s6-lnk" data-change>Другой</button></div>`
    if (!p) return `<div class="s6-who s6-who--none">${ic.warn}<span class="s6-res__m"><b>Не нашли в базе</b><span class="s6-cap">Steam ID из матча: ${x.seen || '—'}</span></span><button class="s6-lnk" data-change>Найти</button></div>`
    return `<div class="s6-who"><span class="s6-av">${p.n.slice(0, 1).toUpperCase()}</span><span class="s6-res__m"><b>${p.n}</b><span class="s6-cap">${p.team || 'без команды'} · поз. ${p.pos} · ${p.id}</span></span><button class="s6-lnk" data-change>Другой</button></div>` }
  const posPills = (d, x) => `<div class="s6-pp">${D.pos.map((l, i) => `<button class="${(d.pos || x.pos) === i + 1 ? 'is-on' : ''}" data-pos="${i + 1}" title="${l}">${i + 1}</button>`).join('')}<span class="s6-cap">${D.pos[(d.pos || x.pos) - 1]}</span></div>`
  const termPick = (d, x, cls = '') => { const m = M(x.m), k = d.term || x.term
    const maps = `<div class="s6-maps"><span class="s6-cap">С карты</span>${[...Array(m.bo)].map((_, i) => `<button class="${(d.map || x.map || 1) === i + 1 ? 'is-on' : ''}" data-map="${i + 1}">${i + 1}</button>`).join('')}</div>`, date = `<input class="s6-date" type="date" data-to value="${d.toIso || ''}" />`
    // Столбиком (шаг «Срок»): выбор карты / даты — сразу под своей строкой (дирижёр 22.10)
    if (/--col/.test(cls)) return `<div class="s6-terms ${cls}">${TERM.filter(([v]) => v !== 'map' || m.bo > 1).map(([v, l]) => `<button class="${k === v ? 'is-on' : ''}" data-term="${v}">${l}</button>${k === v && v === 'map' ? maps : k === v && v === 'date' ? date : ''}`).join('')}</div>`
    return `<div class="s6-terms ${cls}">${TERM.filter(([v]) => v !== 'map' || m.bo > 1).map(([v, l]) => `<button class="${k === v ? 'is-on' : ''}" data-term="${v}">${l}</button>`).join('')}</div>
      ${k === 'map' ? `<div class="s6-maps"><span class="s6-cap">С карты</span>${[...Array(m.bo)].map((_, i) => `<button class="${(d.map || x.map || 1) === i + 1 ? 'is-on' : ''}" data-map="${i + 1}">${i + 1}</button>`).join('')}</div>` : ''}
      ${k === 'date' ? `<input class="s6-date" type="date" data-to value="${d.toIso || ''}" />` : ''}` }
  const matchRow = (m, extra = '') => `<div class="s6-m">${logo(m.a)}<span class="s6-m__n">${m.a}</span><span class="s6-cap">—</span>${logo(m.b)}<span class="s6-m__n">${m.b}</span><span class="s6-sp"></span>${when(m)}${extra}</div>`
  const head = (s, o, sub) => `<div class="s6-hd"><b>Замены</b>${sub ? `<span class="s6-hd__sub">${sub}</span>` : ''}<span class="s6-sp"></span><button class="s6-arch" title="Проверенные замены и все игроки">Архив ${ic.next}</button></div>`
  // Шапка как у v2 (дирижёр 22.10: «заголовок точно из v2»): «Замены · Архив», под ней «Осталось N замен · M матчей · k из n» и полоса; в матче — без полосы
  const progress = (s, o) => { if (o.match) return ''; const ms = D.matches.filter(m => subsOf(m).length), all = ms.flatMap(subsOf), left = all.filter(x => !isDone(s, x)), doneN = all.length - left.length
    const pend = ms.filter(m => subsOf(m).some(x => !isDone(s, x)))
    return `<div class="s6-prog"><div class="s6-prog__t"><b>${left.length ? `Осталось ${left.length} ${plural(left.length, 'замена', 'замены', 'замен')}` : 'Всё проверено'}</b><span class="s6-cap">${pend.length} ${plural(pend.length, 'матч', 'матча', 'матчей')} · ${doneN} из ${all.length}</span></div><div class="s6-bar"><i style="width:${all.length ? doneN / all.length * 100 : 0}%"></i></div></div>` }
  const none = m => `<div class="s6-none">${logo(m.a, 's6-lg s6-lg--28')}${logo(m.b, 's6-lg s6-lg--28')}<b>Замен нет</b><span class="s6-cap">Составы ${m.a} и ${m.b} совпадают с базой</span></div>`
  // Решение по замене: d = { ok | no, who, addId, pos, term, map, to }
  const st = (s, x) => s.d[x.id] || (s.d[x.id] = {})
  const isDone = (s, x) => { const d = s.d[x.id]; return !!(d && (d.ok || d.no)) }
  const doneLine = (s, x) => { const d = s.d[x.id]
    return d.no ? `<span class="s6-res-st s6-res-st--no">${ic.x}отклонено</span>` : `<span class="s6-res-st">${ic.ok}${d.addId ? 'новый игрок' : picked(x, d)} · ${termText(x, d)}</span>` }
  // Общие обработчики: поиск, выбор, позиция, срок, подтвердить / отклонить. cur — открытая замена
  const wire = (el, s, x, redraw, after) => { if (!x) return; const d = st(s, x)
    const q = el.querySelector('[data-q]'); if (q) { q.oninput = () => { s.q = q.value; const box = el.querySelector('.s6-dropw'); if (box) { box.innerHTML = drop(s.q, x.team); bindDrop() } }; if (s.focus) { q.focus(); q.setSelectionRange(q.value.length, q.value.length) } }
    const bindDrop = () => { el.querySelectorAll('[data-pick]').forEach(b => b.onmousedown = e => { e.preventDefault(); d.who = b.dataset.pick; delete d.addId; s.search = false; s.q = ''; s.focus = false; redraw() })
      el.querySelectorAll('[data-add]').forEach(b => b.onmousedown = e => { e.preventDefault(); d.addId = b.dataset.add; d.who = null; s.search = false; s.q = ''; s.focus = false; redraw() }) }
    bindDrop()
    el.querySelectorAll('[data-change]').forEach(b => b.onclick = () => { s.search = true; s.focus = true; redraw() })
    el.querySelectorAll('[data-pos]').forEach(b => b.onclick = () => { d.pos = +b.dataset.pos; redraw() })
    el.querySelectorAll('[data-term]').forEach(b => b.onclick = () => { d.term = b.dataset.term; redraw() })
    el.querySelectorAll('[data-map]').forEach(b => b.onclick = () => { d.map = +b.dataset.map; redraw() })
    el.querySelectorAll('[data-to]').forEach(b => b.onchange = () => { d.toIso = b.value; d.to = b.value.split('-').reverse().slice(0, 2).join('.') })
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { if (!picked(x, d) && !d.addId) { s.search = true; s.focus = true; return redraw() } d.ok = 1; delete d.no; d.term = d.term || x.term; after() })
    el.querySelectorAll('[data-no]').forEach(b => b.onclick = () => { d.no = 1; delete d.ok; after() }) }
  const undo = (el, s, redraw) => el.querySelectorAll('[data-undo]').forEach(b => b.onclick = e => { e.stopPropagation(); delete s.d[b.dataset.undo]; redraw() })

  // ——— v2 «Очередь»: матч за матчем, в каждом — его замены; проверил всё — следующий матч ———
  function queue(el, o) { const s = o.s, redraw = () => queue(el, o)
    const ms = o.match ? [M(o.match)] : D.matches.filter(m => subsOf(m).length)
    const all = ms.flatMap(subsOf), left = all.filter(x => !isDone(s, x)), doneN = all.length - left.length
    const pend = ms.filter(m => subsOf(m).some(x => !isDone(s, x)))
    const m = o.match ? ms[0] : !left.length ? null : ms.find(m => m.id === s.qm) || pend[0] || null // всё проверено — итог вместо матча
    const xs = m ? subsOf(m) : [], open = xs.find(x => x.id === s.open)
    const editor = x => { const d = st(s, x)
      return `<div class="s6-ed">${x.note ? `<div class="s6-note">${x.note}</div>` : ''}
        <div class="s6-ed__l">Кто играет</div>${s.search ? `${field(s, x)}<div class="s6-dropw">${drop(s.q || '', x.team)}</div>` : whoCard(x, d)}
        <div class="s6-ed__l">Позиция</div>${posPills(d, x)}
        <div class="s6-ed__l">Срок</div>${termPick(d, x)}
        <div class="s6-act"><button class="s6-btn s6-btn--pri" data-ok>Подтвердить</button><button class="s6-btn" data-no>Отклонить</button></div></div>` }
    const row = x => { const d = s.d[x.id] || {}, done = isDone(s, x), op = open === x
      return `<div class="s6-sr ${op ? 'is-open' : ''} ${done ? 'is-done' : ''}"><button class="s6-sr__h" data-open="${x.id}">${logo(x.team, 's6-lg s6-lg--16')}<span class="s6-sr__m"><span class="s6-swap"><span class="s6-out">${x.out}</span>${ic.arr}<b>${d.addId ? 'новый' : picked(x, d) || '?'}</b><span class="s6-cap">· поз. ${d.pos || x.pos}</span></span>
        ${done ? doneLine(s, x) : kindTag(x)}</span>${done ? `<span class="s6-undo" data-undo="${x.id}" title="Вернуть">↺</span>` : `<span class="s6-dot"></span>`}</button>${op && !done ? editor(x) : ''}</div>` }
    const mdone = m && xs.every(x => isDone(s, x)), nextM = pend.find(p => p !== m)
    const prog = o.match ? '' : `<div class="s6-prog"><div class="s6-prog__t"><b>${left.length ? `Осталось ${left.length} ${plural(left.length, 'замена', 'замены', 'замен')}` : 'Всё проверено'}</b><span class="s6-cap">${pend.length} ${plural(pend.length, 'матч', 'матча', 'матчей')} · ${doneN} из ${all.length}</span></div><div class="s6-bar"><i style="width:${all.length ? doneN / all.length * 100 : 0}%"></i></div></div>`
    let body
    if (!m) body = `<div class="s6-none s6-none--all">${ic.ok}<b>Все замены проверены</b><span class="s6-cap">${all.length} из ${all.length} · составы в базе верные</span><button class="s6-btn" data-reset>Начать заново (лаба)</button></div>`
    else if (!xs.length) body = none(m)
    else body = `<div class="s6-card"><div class="s6-card__t"><span class="s6-cap">${m.tour}</span>${o.match ? '' : `<span class="s6-cap">матч ${ms.indexOf(m) + 1} из ${ms.length}</span>`}</div>${matchRow(m)}
      ${xs.map(row).join('')}
      ${mdone && !o.match ? `<div class="s6-mdone">${ic.ok}Матч проверен${nextM ? `<button class="s6-btn s6-btn--pri" data-goto="${nextM.id}">Следующий матч ${ic.next}</button>` : ''}</div>` : ''}</div>
      ${o.match || pend.length < 2 ? '' : `<div class="s6-lbl">Дальше в очереди</div>${pend.filter(p => p !== m).map(p => `<button class="s6-qm" data-goto="${p.id}">${logo(p.a, 's6-lg s6-lg--16')}${logo(p.b, 's6-lg s6-lg--16')}<span class="s6-qm__n">${p.a} — ${p.b}</span>${when(p)}<span class="s6-cnt">${subsOf(p).filter(x => !isDone(s, x)).length}</span></button>`).join('')}`}`
    el.className = 'w s6 s6--queue'
    el.innerHTML = head(s, o, o.match ? 'в этом матче' : '') + prog + `<div class="w-scroll"><div class="s6-bd">${body}</div></div>`
    el.querySelectorAll('[data-open]').forEach(b => b.onclick = e => { if (e.target.closest('[data-undo]')) return; const id = b.dataset.open; s.open = s.open === id ? null : id; s.search = false; s.q = ''; s.focus = false; redraw() })
    el.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => { s.qm = b.dataset.goto; s.open = (subsOf(M(s.qm)).find(x => !isDone(s, x)) || {}).id; s.search = false; redraw() })
    el.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => { s.d = {}; s.qm = null; s.open = null; redraw() })
    undo(el, s, redraw)
    wire(el, s, open, redraw, () => { const nx = xs.find(x => !isDone(s, x)); s.open = nx ? nx.id : null; s.search = false; s.q = ''; redraw() })
  }

  // Сверка состава одного матча (v3): сегмент команд, 5 позиций со Steam ID, расхождение — жёлтая строка, поиск и срок прямо в строке.
  // Общая для v3 и v5 (v5 — очередь v2, а сверка внутри матча — эта). Возвращает куски разметки и bind(el)
  const rosterIn = (s, o, m, redraw) => {
    const xs = subsOf(m), team = s.rt && [m.a, m.b].includes(s.rt) ? s.rt : (xs[0] || {}).team || m.a, r = D.rosters[team] || []
    const tx = n => xs.filter(x => x.team === n && !isDone(s, x)).length
    const seg = `<div class="s6-seg">${[m.a, m.b].map(n => `<button class="${n === team ? 'is-on' : ''}" data-rt="${n}">${logo(n, 's6-lg s6-lg--16')}<span class="s6-nm">${n}</span>${tx(n) ? `<i class="s6-seg__n">${tx(n)}</i>` : ''}</button>`).join('')}</div>`
    const rowOf = i => { const x = xs.find(x => x.team === team && x.pos === i + 1), [nick, id] = r[i], d = x ? st(s, x) : {}, open = x && s.row === x.id
      if (!x) return `<div class="s6-rr"><span class="s6-rr__p">${i + 1}</span><span class="s6-rr__l">${D.pos[i]}</span><span class="s6-rr__n">${nick}</span><span class="s6-rr__id">${id}</span></div>`
      if (isDone(s, x)) return `<div class="s6-rr ${d.no ? 'is-no' : 'is-ok'}"><span class="s6-rr__p">${i + 1}</span><span class="s6-rr__l">${D.pos[i]}</span><span class="s6-rr__n">${d.no ? nick : d.addId ? 'Новый · ' + d.addId : picked(x, d)}<span class="s6-cap">${d.no ? 'замена отклонена' : `вместо ${x.out} · ${termText(x, d)}`}</span></span><button class="s6-undo" data-undo="${x.id}" title="Вернуть">↺</button></div>`
      return `<div class="s6-rr is-bad ${open ? 'is-open' : ''}"><button class="s6-rr__h" data-row="${x.id}"><span class="s6-rr__p">${i + 1}</span><span class="s6-rr__l">${D.pos[i]}</span><span class="s6-rr__n"><span class="s6-swap"><span class="s6-out">${x.out}</span>${ic.arr}<b>${d.addId ? 'новый' : picked(x, d) || '?'}</b></span>${kindTag(x)}</span></button>
        ${open ? `<div class="s6-ed s6-ed--in">${x.note ? `<div class="s6-note">${x.note}</div>` : ''}${s.search || !picked(x, d) && !d.addId ? `${field(s, x)}<div class="s6-dropw">${drop(s.q || '', x.team)}</div>` : whoCard(x, d)}
          ${x.kind === 'pos' || (d.pos && d.pos !== x.pos) ? `<div class="s6-ed__l">Позиция</div>${posPills(d, x)}` : ''}<div class="s6-ed__l">Срок</div>${termPick(d, x, 's6-terms--sm')}
          <div class="s6-act"><button class="s6-btn s6-btn--pri" data-ok>Верно</button><button class="s6-btn" data-no>Отклонить</button></div></div>` : ''}</div>` }
    // v11–v13 (o.rs) — три раскладки строки состава; у всех строки одной высоты, Steam ID — чипом с копированием
    const ROLE = (D.games && D.games[m.game || 'dota2'] || {}).roles || ['Carry', 'Mid', 'Offlane', 'Support', 'Hard Sup'] // роли — по игре матча (v19: CS2)
    const chip = id => `<button class="s8-id" data-copy="${id}" title="Скопировать Steam ID">${id}${ic.copy}</button>`
    const rowAlt = i => { const x = xs.find(x => x.team === team && x.pos === i + 1), [nick, id] = r[i], d = x ? st(s, x) : {}, rs = o.rs
      const done = x && isDone(s, x), bad = x && !done
      const pos = rs === 'a' && !o.posRow ? `<span class="s8-p"><b>${i + 1}</b><small>${ROLE[i]}</small></span>` : rs === 'b' || o.posRow ? `<span class="s8-p s8-p--row"><b>${i + 1}</b><small>${ROLE[i]}</small></span>` : `<span class="s8-p s8-p--ring">${i + 1}</span>`
      const who = !x ? `<b class="s8-n">${nick}</b>` : done ? `<b class="s8-n ${d.no ? 'is-no' : ''}">${d.no ? nick : d.addId ? 'Новый · ' + d.addId : picked(x, d)}</b>` : `<span class="s8-n s6-swap"><span class="s6-out">${x.out}</span>${ic.arr}<b>${d.addId ? 'Новый' : picked(x, d) || '?'}</b></span>`
      const sub = !x ? (rs === 'b' ? '' : rs === 'c' ? `<small class="s8-s">${D.pos[i]}</small>` : chip(id)) : done ? `<small class="s8-s ${d.no ? '' : 'is-ok'}">${d.no ? 'Замена отклонена' : `Вместо ${x.out} · ${termText(x, d)}`}</small>` : `<small class="s8-s">${kindText(x)}</small>`
      const right = !x ? (rs === 'a' ? '' : chip(id)) : done ? `<button class="s6-undo" data-undo="${x.id}" title="Вернуть">↺</button>` : rs === 'b' ? `<small class="s8-tag">${x.kind === 'ids' ? 'ID' : x.kind === 'pos' ? 'Позиция' : 'Заранее'}${x.map ? ' · Карта ' + x.map : ''}</small>` : `<span class="s6-chev">${ic.next}</span>`
      const mid = `<span class="s8-m">${who}${rs === 'b' ? '' : sub}</span>`
      const cls = `s8-r s8-r--${rs} ${bad ? 'is-bad' : done ? (d.no ? 'is-no' : 'is-ok') : ''}`
      return bad ? `<button class="${cls}" data-row="${x.id}">${pos}${mid}${right}</button>` : `<div class="${cls}">${pos}${mid}${right}</div>` }
    const rh = o.rs ? `<div class="s8-rh s8-rh--${o.rs}"><span>Поз.</span><span>Игрок</span>${o.rs === 'a' ? '' : '<span>Steam ID</span>'}</div>` : `<div class="s6-rh"><span>Поз.</span><span>Игрок</span><span>Steam ID</span></div>`
    const leftAll = xs.filter(x => !isDone(s, x)).length
    const foot = !xs.length ? `<div class="s6-ft s6-ft--ok">${ic.ok}Составы совпадают с базой</div>`
      : leftAll ? `<div class="s6-ft s6-ft--warn">${ic.warn}<span>Позиции: ${leftAll} не ${plural(leftAll, 'сверена', 'сверены', 'сверены')}${tx(m.a) && tx(m.b) ? ' в обеих командах' : ''}</span></div>`
      : `<div class="s6-ft s6-ft--ok">${ic.ok}Матч сверен · составы сохранены</div>`
    const rows = r.map((_, i) => (o.rs ? rowAlt : rowOf)(i)).join('')
    const bind = el => {
    el.querySelectorAll('[data-rt]').forEach(b => b.onclick = () => { s.rt = b.dataset.rt; s.row = null; redraw() })
      el.querySelectorAll('[data-row]').forEach(b => b.onclick = () => { const id = b.dataset.row; s.row = s.row === id ? null : id; const x = D.subs.find(x => x.id === id), d = st(s, x); s.search = !picked(x, d) && !d.addId; s.focus = s.search; s.q = ''; redraw() })
      undo(el, s, redraw)
      // Steam ID — копировать по клику, тост «Скопировано» внутри виджета
      el.querySelectorAll('[data-copy]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = b.dataset.copy
        try { navigator.clipboard && navigator.clipboard.writeText(v) } catch (err) {}
        el.querySelectorAll('.s8-toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 's8-toast'; t.textContent = 'Скопировано · ' + v; el.append(t); setTimeout(() => t.remove(), 1400) })
      wire(el, s, xs.find(x => x.id === s.row), redraw, () => { const nx = xs.find(x => !isDone(s, x)); s.row = null; if (nx && nx.team !== team) s.rt = nx.team; s.search = false; s.q = ''; redraw() })
    }
    return { xs, seg, rows, foot, bind, rh }
  }

  // Список матчей на главной. o.list — подача (дирижёр 22.10: «светофор не нравится, ещё несколько версий»):
  // по умолчанию (v3–v6) — время / LIVE и «N расхождений» цветом; 'count' — справа только серое число, время серым, LIVE — красной точкой;
  // 'stack' — команды двумя строками (как счёт), справа «N замен» серым; 'groups' — разделы «Идут сейчас / Прошли / Сегодня», в строках без цвета;
  // 'mono' — всё серое, единственный акцент — число расхождений крупно белым
  // Значок игры у матча на главной (v19, есть D.games): Дота — как есть, CS2 — оранжевым маской (как у трансферов)
  const gIco = m => { if (!D.games) return ''; const g = D.games[m.game || 'dota2']; return (m.game || 'dota2') === 'cs2' ? `<i class="s9-gl s9-gl--cs" style="--m:url('${g.logo}')" title="${g.name}"></i>` : `<img class="s9-gl" src="${g.logo}" alt="" title="${g.name}">` }
  const homeList = (ms, s, o, cnt) => { const st = o.list, n = mx => cnt(mx)
    const t = m => m.when === 'live' ? `<span class="s7-t"><i class="s7-live"></i>карта ${m.map}</span>` : `<span class="s7-t">${m.done ? m.when.replace('ночью, ', '') + ' · ' + m.done : m.when}</span>`
    const btn = (m, inner) => `<button class="s6-qm s6-qm--tall s7-r" data-rm="${m.id}">${inner}</button>`
    const lgs = m => `<span class="s6-qm__lg">${logo(m.a)}${logo(m.b)}</span>`
    if (st === 'count') return `<div class="s6-lbl s6-lbl--top">Матчи за ночь и сегодня</div>` + ms.map(mx => { const [m, xs] = mx, k = n(mx)
      return btn(m, `${lgs(m)}<span class="s6-qm__m"><span class="s6-qm__n">${m.a} — ${m.b}</span><span class="s6-cap">${m.tour} · ${t(m)}</span></span>${xs.length ? (k ? `<span class="s7-cnt">${k}</span>` : `<span class="s7-ok">${ic.ok}</span>`) : ''}`) }).join('')
    if (st === 'stack') return `<div class="s6-lbl s6-lbl--top">Матчи за ночь и сегодня</div>` + ms.map(mx => { const [m, xs] = mx, k = n(mx)
      return btn(m, `<span class="s7-st"><span>${logo(m.a)}<span class="s6-nm">${m.a}</span></span><span>${logo(m.b)}<span class="s6-nm">${m.b}</span></span></span><span class="s7-st__r">${t(m)}<span class="s6-cap">${!xs.length ? 'без замен' : k ? `${k} ${plural(k, 'замена', 'замены', 'замен')}` : 'сверено'}</span></span>`) }).join('')
    if (st === 'groups') { const g = [['Идут сейчас', ms.filter(([m]) => m.when === 'live')], ['Прошли за ночь', ms.filter(([m]) => m.done)], ['Сегодня', ms.filter(([m]) => !m.done && m.when !== 'live')]]
      return g.filter(([, l]) => l.length).map(([name, l]) => `<div class="s6-lbl">${name}</div>` + l.map(mx => { const [m, xs] = mx, k = n(mx)
        return btn(m, `${lgs(m)}<span class="s6-qm__m"><span class="s6-qm__n">${m.a} — ${m.b}</span><span class="s6-cap">${m.tour}</span></span><span class="s7-st__r">${m.when === 'live' ? `<span class="s7-t">карта ${m.map}</span>` : t(m)}<span class="s6-cap">${!xs.length ? 'без замен' : k ? `${k} ${plural(k, 'расхождение', 'расхождения', 'расхождений')}` : 'сверено'}</span></span>`) }).join('')).join('') }
    // v10 (созвон 22.10, п. 2.9 + дирижёр 22.10): на главной только новые расхождения — матчей без замен и уже сверенных в списке нет (сверенные — в архиве), подписи раздела нет
    // v11–v13: LIVE явно (красная плашка) и первым; дальше прошли за ночь, потом предстоящие; подписи с заглавной
    if (st === 'mono' && CAP) { const rank = ([m]) => m.when === 'live' ? 0 : m.done ? 1 : 2, live = ms.filter(mx => n(mx) > 0).sort((a, b) => rank(a) - rank(b))
      // o.lv — вид LIVE и числа (v15–v18, дирижёр 22.10: «LIVE и надпись „расхождения“ не нравятся — версии»):
      // 'dot' — красная точка + «Live · Карта 2» красным, справа только число; 'outline' — LIVE контурной плашкой, справа «3 замены» одной строкой;
      // 'pulse' — пульсирующая точка перед названием матча, ниже «Карта 2», справа число без подписи; 'badge' — LIVE красным текстом в строке времени, число — квадратным бейджем как тир
      const lv = o.lv
      const liveTag = m => lv === 'dot' ? `<span class="s9-live s9-live--dot"><i></i>Live · Карта ${m.map}</span>` : lv === 'outline' ? `<span class="s7-t"><span class="s9-live s9-live--outline">LIVE</span>Карта ${m.map}</span>`
        : lv === 'pulse' ? `<span class="s7-t">Карта ${m.map}</span>` : lv === 'badge' ? `<span class="s7-t"><b class="s9-live s9-live--text">LIVE</b>· Карта ${m.map}</span>` : `<span class="s8-live">LIVE · Карта ${m.map}</span>`
      const num = k => lv === 'dot' || lv === 'pulse' ? `<span class="s9-n">${k}</span>` : lv === 'outline' ? `<span class="s9-w">${k} ${plural(k, 'замена', 'замены', 'замен')}</span>` : lv === 'badge' ? `<span class="s9-b">${k}</span>`
        : `<span class="s7-big"><b>${k}</b><span class="s6-cap">${Cp(plural(k, 'расхождение', 'расхождения', 'расхождений'))}</span></span>`
      const tt = m => m.when === 'live' ? liveTag(m) : `<span class="s7-t">${m.done ? 'Ночью · ' + m.when.replace('ночью, ', '') + ' · ' + m.done : 'Сегодня · ' + m.when}</span>`
      return live.length ? (o.gv === 'groups' ? [live[0]] : live).map(mx => {
        // o.gv — где показать игру (v19–v22): 'name' значок перед названием · 'badge' значок в углу логотипов · 'meta' названием игры в строке времени · 'groups' разделы по играм
        const gv = o.gv || 'name', gName = m => D.games ? D.games[m.game || 'dota2'].name : ''
        const row = (mx) => { const [m] = mx, k = n(mx)
          return btn(m, `${gv === 'badge' && D.games ? `<span class="s9-lgw">${lgs(m)}${gIco(m).replace('s9-gl', 's9-gl s9-gl--b')}</span>` : lgs(m)}<span class="s6-qm__m"><span class="s6-qm__n">${gv === 'name' ? gIco(m) : ''}${m.a} — ${m.b}</span>${gv === 'meta' && D.games ? tt(m).replace(/^(<span class="s7-t">)/, `$1<span class="s9-gm">${gName(m)}</span> · `).replace(/^(<span class="s8-live">)/, `$1${gName(m)} · `) : tt(m)}</span>${num(k)}`) }
        if (gv === 'groups' && D.games) return Object.keys(D.games).map(g => { const l = live.filter(([m]) => (m.game || 'dota2') === g); return l.length ? `<div class="s6-lbl s9-glbl">${gIco({ game: g })}${D.games[g].name}</div>` + l.map(row).join('') : '' }).join('')
        return row(mx) }).join('')
        : `<div class="s6-none s6-none--all">${ic.ok}<b>Новых расхождений нет</b><span class="s6-cap">Сверенные матчи — в архиве</span></div>` }
    if (st === 'mono') { const live = ms.filter(mx => n(mx) > 0)
      return live.length ? live.map(mx => { const [m, xs] = mx, k = n(mx)
      return btn(m, `${lgs(m)}<span class="s6-qm__m"><span class="s6-qm__n">${m.a} — ${m.b}</span><span class="s6-cap">${t(m)}</span></span><span class="s7-big ${k ? '' : 'is-zero'}"><b>${xs.length ? k : '—'}</b><span class="s6-cap">${xs.length ? (k ? plural(k, 'расхождение', 'расхождения', 'расхождений') : 'сверено') : 'без замен'}</span></span>`) }).join('')
        : `<div class="s6-none s6-none--all">${ic.ok}<b>Новых расхождений нет</b><span class="s6-cap">Сверенные матчи — в архиве</span></div>` }
    return `<div class="s6-lbl s6-lbl--top">Матчи за ночь и сегодня</div>${ms.map(([m, xs]) => `<button class="s6-qm s6-qm--tall" data-rm="${m.id}">
        <span class="s6-qm__lg">${logo(m.a)}${logo(m.b)}</span><span class="s6-qm__m"><span class="s6-qm__n">${m.a} — ${m.b}</span><span class="s6-cap">${m.tour}</span></span><span class="s6-qm__r">${when(m)}${!xs.length ? '<span class="s6-cap">совпадает</span>' : cnt([m, xs]) ? `<span class="s6-warn">${ic.warn}${cnt([m, xs])} ${plural(cnt([m, xs]), 'расхождение', 'расхождения', 'расхождений')}</span>` : `<span class="s6-okk">${ic.ok}сверено</span>`}</span></button>`).join('')}` }

  // ——— v3 «Составы»: матч → команда сегментом → 5 позиций; расхождение — жёлтая строка, клик — поиск прямо в строке ———
  function roster(el, o, rd) { const s = o.s, redraw = rd || (() => roster(el, o))
    const mid = o.match || s.rm, m = mid && M(mid)
    el.className = 'w s6 s6--roster'
    if (!m) { // все матчи дня с расхождениями
      const ms = D.matches.map(m => [m, subsOf(m)]), cnt = ([m, xs]) => xs.filter(x => !isDone(s, x)).length
      el.innerHTML = head(s, o) + progress(s, o) + `<div class="w-scroll"><div class="s6-bd">${homeList(ms, s, o, cnt)}</div></div>`
      el.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { s.rm = b.dataset.rm; const xs = subsOf(M(s.rm)); s.rt = xs.length ? xs[0].team : M(s.rm).a; s.row = null; redraw() })
      return }
    const R = rosterIn(s, o, m, redraw)
    el.innerHTML = `<div class="s6-hd">${o.match ? `<b>Замены</b><span class="s6-hd__sub">${Cp('в этом матче')}</span>` : `<button class="s6-ib" data-back aria-label="Ко всем матчам">${ic.back}</button><span class="s6-hd__m"><b>${m.a} — ${m.b}</b><span class="s6-cap">${o.lv ? `${m.when === 'live' ? `<b class="s9-live s9-live--text">LIVE</b> · Карта ${m.map}` : m.done ? 'Ночью · ' + m.when.replace('ночью, ', '') + ' · ' + m.done : 'Сегодня · ' + m.when} · ` : ''}${m.tour}</span></span>`}<span class="s6-sp"></span>${o.match ? `<button class="s6-arch">Архив ${ic.next}</button>` : o.lv ? '' : when(m)}</div>
      <div class="w-scroll"><div class="s6-bd">${R.xs.length ? R.seg + R.rh + R.rows : none(m)}</div></div>${R.foot}`
    el.querySelectorAll('[data-back]').forEach(b => b.onclick = () => { s.rm = null; s.row = null; redraw() })
    R.bind(el)
  }

  // Замена шагами (v4): Кто → Позиция → Срок → Проверь. Общая для v4 и v5; close — назад, next — после решения
  // Позиции по игре матча (у CS2 — роли), по умолчанию — Дота
  const PS = x => { const g = D.games && D.games[M(x.m).game]; return (g && g.posRu) || D.pos }
  const stepView = (el, s, o, x, pool, redraw, close, next) => {
    const d = st(s, x), m = M(x.m), i = pool.indexOf(x), step = s.step || 0, who = d.addId ? 'Новый игрок' : picked(x, d)
    const bodyOf = [
      () => `<div class="s6-q">Кто сыграл вместо <b>${x.out}</b>?</div><div class="s6-cap s6-q__s">${x.kind === 'news' ? `Замена известна заранее · ${x.date}` : x.kind === 'pos' ? x.note : `Steam ID из матча ${x.seen} — не из состава ${x.team}`}</div>
        ${s.search || (!picked(x, d) && !d.addId) ? `${field(s, x)}<div class="s6-dropw">${drop(s.q || '', x.team)}</div>` : whoCard(x, d)}`,
      () => `<div class="s6-q">На какой позиции?</div><div class="s6-cap s6-q__s">В составе ${x.out} играл ${x.pos} · ${PS(x)[x.pos - 1]}</div>
        <div class="s6-pl">${PS(x).map((l, j) => `<button class="${(d.pos || x.pos) === j + 1 ? 'is-on' : ''}" data-pos="${j + 1}"><b>${j + 1}</b>${l}${x.kind === 'pos' && x.from === j + 1 ? '<span class="s6-cap">его обычная</span>' : ''}</button>`).join('')}</div>`,
      () => `<div class="s6-q">На какой срок?</div><div class="s6-cap s6-q__s">${m.tour} · ${m.a} — ${m.b}${m.bo > 1 ? ` · серия Bo${m.bo}` : ''}</div>${termPick(d, x, 's6-terms--col')}`,
      () => `<div class="s6-q">Проверь</div><div class="s6-sum"><div>${logo(x.team, 's6-lg s6-lg--28')}<span class="s6-res__m"><b>${x.team}</b><span class="s6-cap">${m.a} — ${m.b} · ${m.tour}</span></span></div>
        <dl><dt>Ушёл</dt><dd>${x.out}</dd><dt>Играет</dt><dd><b>${who || '—'}</b>${d.addId ? ` · Steam ID ${d.addId}` : ''}</dd><dt>Позиция</dt><dd>${d.pos || x.pos} · ${PS(x)[(d.pos || x.pos) - 1]}</dd><dt>Срок</dt><dd>${termText(x, { ...d, term: d.term || x.term })}</dd></dl></div>`,
    ]
    const can = step !== 0 || picked(x, d) || d.addId
    el.innerHTML = `<div class="s6-hd"><button class="s6-ib" data-close aria-label="К списку">${ic.back}</button><span class="s6-hd__m"><b>Замена ${i + 1} из ${pool.length}</b><span class="s6-cap">${x.team} · ${Cp(KIND[x.kind])}</span></span></div>
      <div class="s6-steps">${STEPS.map((n, j) => `<button class="${j < step ? 'is-done' : j === step ? 'is-on' : ''}" data-step="${j}" ${j > step ? 'disabled' : ''}><i></i><span>${n}</span></button>`).join('')}</div>
      <div class="w-scroll"><div class="s6-bd s6-bd--wz">${bodyOf[step]()}</div></div>
      <div class="s6-ft s6-ft--wz">${step ? `<button class="s6-btn" data-prev>Назад</button>` : `<button class="s6-btn s6-btn--ghost" data-no>Не замена</button>`}<span class="s6-sp"></span>
        ${step < 3 ? `<button class="s6-btn s6-btn--pri" data-next ${can ? '' : 'disabled'}>Дальше</button>` : `<button class="s6-btn s6-btn--pri" data-ok>Подтвердить</button>`}</div>`
    el.querySelectorAll('[data-close]').forEach(b => b.onclick = close)
    el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { s.step = +b.dataset.step; s.search = false; redraw() })
    el.querySelectorAll('[data-prev]').forEach(b => b.onclick = () => { s.step = step - 1; s.search = false; redraw() })
    el.querySelectorAll('[data-next]').forEach(b => b.onclick = () => { if (!can) return; s.step = step + 1; s.search = false; s.q = ''; redraw() })
    wire(el, s, x, redraw, next)
  }

  // ——— v4 «По шагам»: список «Во время матча» / «Заранее»; замена — мастер Кто → Позиция → Срок → Проверь ———
  const STEPS = ['Кто', 'Позиция', 'Срок', 'Проверь']
  function wizard(el, o) { const s = o.s, redraw = () => wizard(el, o)
    const pool = o.match ? subsOf(M(o.match)) : D.subs, x = pool.find(x => x.id === s.w)
    el.className = 'w s6 s6--wizard'
    if (!x) {
      const item = x => { const m = M(x.m), d = s.d[x.id] || {}, done = isDone(s, x)
        return `<button class="s6-wi ${done ? 'is-done' : ''}" data-w="${x.id}">${logo(x.team)}<span class="s6-wi__m"><span class="s6-swap"><span class="s6-out">${x.out}</span>${ic.arr}<b>${d.addId ? 'новый' : picked(x, d) || '?'}</b><span class="s6-cap">· поз. ${d.pos || x.pos}</span></span>
          <span class="s6-cap">${done ? (d.no ? 'отклонено' : termText(x, d)) : o.match ? x.team + (x.map ? ' · карта ' + x.map : '') : `${m.a} — ${m.b} · ${m.done ? m.when : m.when === 'live' ? 'идёт' : m.when}`}</span></span>${done ? `<span class="s6-wi__st ${d.no ? 'is-no' : ''}">${d.no ? ic.x : ic.ok}</span><span class="s6-undo" data-undo="${x.id}" title="Вернуть">↺</span>` : `<span class="s6-chev">${ic.next}</span>`}</button>` }
      const sec = (name, hint, xs) => xs.length ? `<div class="s6-lbl">${name}<span class="s6-cap">${hint}</span></div>${xs.map(item).join('')}` : ''
      const live = pool.filter(x => x.kind !== 'news'), news = pool.filter(x => x.kind === 'news'), left = pool.filter(x => !isDone(s, x)).length
      const mm = o.match && M(o.match)
      el.innerHTML = head(s, o, o.match ? 'в этом матче' : '') + progress(s, o) + `<div class="w-scroll"><div class="s6-bd">${
        o.match && !pool.length ? none(mm) : (mm ? `<div class="s6-mtop">${matchRow(mm)}</div>` : '') + sec('Во время матча', 'Steam ID или позиция не совпали', live) + sec('Заранее', 'из новостей до матча', news)}</div></div>
        ${left && pool.length ? `<div class="s6-ft"><button class="s6-btn s6-btn--pri s6-btn--w" data-w="${pool.find(x => !isDone(s, x)).id}">Проверить по порядку · ${left}</button></div>` : pool.length ? `<div class="s6-ft s6-ft--ok">${ic.ok}Всё проверено</div>` : ''}`
      el.querySelectorAll('[data-w]').forEach(b => b.onclick = e => { if (e.target.closest('[data-undo]')) return; s.w = b.dataset.w; s.step = 0; s.search = false; s.q = ''; const d = st(s, D.subs.find(x => x.id === s.w)); delete d.ok; delete d.no; redraw() })
      undo(el, s, redraw); return }
    // После решения — сразу следующая непроверенная (по порядку), нет — к списку
    stepView(el, s, o, x, pool, redraw, () => { s.w = null; redraw() }, () => { const nx = pool.find(y => !isDone(s, y)); s.w = nx ? nx.id : null; s.step = 0; s.search = false; s.q = ''; redraw() })
  }

  // ——— v5 (дирижёр 22.10: «основа — v3, из v4 — последовательное заполнение»): список матчей и сверка состава — как v3;
  // клик по жёлтой строке — замена шагами (v4), после решения — следующая в матче; «Проверить по порядку» — все замены подряд, матч за матчем
  function rstep(el, o) { const s = o.s, redraw = () => rstep(el, o)
    const x = s.w && D.subs.find(y => y.id === s.w)
    if (x) { const m = M(x.m), pool = s.seq && !o.match ? D.matches.flatMap(subsOf) : subsOf(m)
      el.className = 'w s6 s6--wizard s6--rstep'
      return stepView(el, s, o, x, pool, redraw, () => { s.w = null; s.seq = false; if (!o.match) s.rm = m.id; s.rt = x.team; redraw() },
        () => { const nx = pool.find(y => !isDone(s, y)); s.step = 0; s.search = false; s.q = ''
          if (nx) { s.w = nx.id; s.rt = nx.team } else { const all = s.seq; s.w = null; s.seq = false; if (!o.match) s.rm = all ? null : m.id; s.rt = x.team } // всё по порядку — к списку матчей, иначе — к составу матча
          redraw() }) }
    roster(el, o, redraw); el.classList.add('s6--rstep'); if (o.list) el.classList.add('s7', 's7--' + o.list); if (o.posRow) el.classList.add('s8--prow') // v7–v10: своя подача списка и строк состава
    const open = id => { s.w = id; s.step = 0; s.search = false; s.q = ''; const d = st(s, D.subs.find(y => y.id === id)); delete d.ok; delete d.no; redraw() }
    el.querySelectorAll('[data-row]').forEach(b => b.onclick = () => { s.seq = false; open(b.dataset.row) })
    // Внизу списка матчей — «Проверить по порядку · N» (v4)
    const mid = o.match || s.rm, left = (mid ? subsOf(M(mid)) : D.matches.flatMap(subsOf)).filter(y => !isDone(s, y))
    // v6 — без кнопки (дирижёр 22.10: «нет смысла»)
    if (!mid && left.length && !o.noSeq) { el.insertAdjacentHTML('beforeend', `<div class="s6-ft"><button class="s6-btn s6-btn--pri s6-btn--w" data-seq>Проверить по порядку · ${left.length}</button></div>`)
      el.querySelector('[data-seq]').onclick = () => { s.seq = true; open(left[0].id) } }
  }

  function render(el, o) { o.s = o.s || { d: {}, open: null }; CAP = !!o.cap
    if (o.mode === 'rstep') return rstep(el, o)
    if (o.mode === 'roster') return roster(el, o)
    if (o.mode === 'wizard') return wizard(el, o)
    if (!o.match && o.s.open === null && !o.s.started) { o.s.started = 1; const m = D.matches.find(m => subsOf(m).length); o.s.open = subsOf(m)[0].id } // очередь: первая замена сразу открыта
    if (o.match && o.s.open === null && !o.s.started) { o.s.started = 1; const x = subsOf(M(o.match))[0]; if (x) o.s.open = x.id }
    return queue(el, o) }
  window.S6 = { render, data: D, M, subsOf }
})()
