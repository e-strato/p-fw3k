// «Все турниры» (лаба gs-tours, дирижёр 10.11). Исследование — внутренняя документация/исследование-главная-турниры.
// Начальник 22.10: «на главной — список турниров, клик → внутрь»; позже — «страница событий, как на HLTV: Events → календарь». 21.10: «идут сейчас · предстоящие», прошедшие — архивом.
// TOURS.mount(): шапка «Турниры» · счётчики · поиск → игры со счётчиками и «Tier 1 · Все» → «Идут сейчас» плитками (стадия, live-матчи, дни турнира полосой)
// → «Скоро · Прошли» таблицей по месяцам (даты моно слева, игра, лого, тир, формат, команд, фонд, «через N дн» / победитель). Справа — Новости (NW2) и Трансферы (TR2).
window.TOURS = (() => {
  const S = window.SCH, { esc, logo, name, gameIc, tourLogo, tierTag, LIVE } = S
  const P = new URLSearchParams(location.search), FIT = P.has('fit'), fitView = () => (innerWidth < 800 ? 'phone' : 'desk')
  const CFG = { view: FIT ? fitView() : 'desk', game: 'all', tier: 'all', tab: 'soon', q: '', state: 'ok' }
  const IC = { chev: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>',
    search: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>',
    cup: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4.5 2.5h7v4a3.5 3.5 0 0 1-7 0zM8 10v3M5.5 13.5h5M4.5 4H2.5a2 2 0 0 0 2 3M11.5 4h2a2 2 0 0 1-2 3"/></svg>',
    users: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="5.5" r="2.5"/><path d="M1.5 13.5c.5-2.5 2.3-3.8 4.5-3.8s4 1.3 4.5 3.8M11 3.2a2.4 2.4 0 0 1 0 4.6M12.5 9.9c1.2.5 1.9 1.7 2 3.6"/></svg>' }
  const pl = (n, a, b, c) => { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 12 || y > 14) ? b : c }
  const dd = (d) => S.dm(d)
  const daysTo = (d) => S.dayDiff(d)
  const all = () => (CFG.state === 'empty' ? [] : Object.values(S.T))
  const pass = (t) => (CFG.game === 'all' || t.game === CFG.game) && (CFG.tier === 'all' || t.tier === 1) && (!CFG.q || (t.name + ' ' + S.G[t.game].short).toLowerCase().includes(CFG.q.toLowerCase()))
  const liveMs = (t) => S.M.filter((m) => m.tour === t.id && LIVE.includes(m.state))

  // ── «Идут сейчас»: плитка турнира
  const tile = (t) => { const L = liveMs(t), len = daysTo(t.to) - daysTo(t.from) + 1, now = -daysTo(t.from) + 1, pc = Math.max(0, Math.min(100, (now / len) * 100))
    return `<button class="tr-tile" data-tour="${t.id}">
      <span class="tr-tile__top">${gameIc(t.game, 16)}${tierTag(t.tier)}${L.length ? `<span class="hm-st"><i class="sc-dot"></i>${L.length} ${pl(L.length, 'матч идёт', 'матча идут', 'матчей идут')}</span>` : (() => { const nx = S.M.filter((m) => m.tour === t.id && ['soon', 'delayed'].includes(m.state) && S.ymd(m.start) === S.TODAY).sort((a, b) => a.start.localeCompare(b.start))[0]
        return `<span class="hm-st hm-st--mut">${nx ? `сегодня · <span class="mono">${S.hm(nx.start)}</span>` : 'сегодня без матчей'}</span>` })()}</span>
      <span class="tr-tile__n">${tourLogo(t, 40)}<span><b>${esc(t.name)}</b><small>${esc(t.stage)}</small></span></span>
      <span class="tr-prog"><span class="tr-prog__bar"><i style="width:${pc}%"></i></span><span class="tr-prog__d mono"><span>${dd(t.from)}</span><span>день ${now} из ${len}</span><span>${dd(t.to)}</span></span></span>
      <span class="tr-tile__ft"><span class="mono">${esc(t.prize)}</span>${t.teams ? `<span>${IC.users}<span class="mono">${t.teams}</span></span>` : ''}${t.where ? `<span>${esc(t.where)}</span>` : ''}${t.real ? '' : '<span class="hm-ex">пример</span>'}</span></button>` }

  // ── таблица «Скоро» / «Прошли» по месяцам
  const rowSoon = (t) => { const n = daysTo(t.from)
    return `<div class="tr-r" data-tour="${t.id}" role="link" tabindex="0"><span class="tr-r__d mono">${dd(t.from)} – ${dd(t.to)}</span>
      <span class="tr-r__n">${gameIc(t.game, 16)}${tourLogo(t, 24)}<span><b>${esc(t.name)}</b><small>${[t.where, t.format].filter(Boolean).map(esc).join(' · ')}</small></span></span>
      <span class="tr-r__t">${tierTag(t.tier)}</span><span class="tr-r__k">${t.teams ? `${IC.users}<span class="mono">${t.teams}</span>` : '<span class="mut">—</span>'}</span>
      <span class="tr-r__p mono">${esc(t.prize)}</span><span class="tr-r__s mono">${n <= 0 ? 'сегодня' : n === 1 ? 'завтра' : `через ${n} ${pl(n, 'день', 'дня', 'дней')}`}</span><span class="tr-r__go">${IC.chev}</span></div>` }
  const rowDone = (t) => `<div class="tr-r tr-r--done" data-tour="${t.id}" role="link" tabindex="0"><span class="tr-r__d mono">${dd(t.from)} – ${dd(t.to)}</span>
      <span class="tr-r__n">${gameIc(t.game, 16)}${tourLogo(t, 24)}<span><b>${esc(t.name)}</b><small>${[t.where, t.format].filter(Boolean).map(esc).join(' · ')}</small></span></span>
      <span class="tr-r__t">${tierTag(t.tier)}</span><span class="tr-r__w">${t.winner ? `${IC.cup}${logo(t.winner, 20)}<b>${name(t.winner, 'mid')}</b>` : '<span class="mut">—</span>'}</span>
      <span class="tr-r__p mono">${esc(t.prize)}</span><span class="tr-r__go">${IC.chev}</span></div>`
  const months = (L, fn, desc) => { const by = new Map(); L.slice().sort((a, b) => (desc ? b.from.localeCompare(a.from) : a.from.localeCompare(b.from))).forEach((t) => { const k = t.from.slice(0, 7); if (!by.has(k)) by.set(k, []); by.get(k).push(t) })
    return [...by.entries()].map(([k, ts]) => `<div class="tr-mo"><div class="tr-mo__h"><b>${S.MONN[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}</b><small>${ts.length}</small></div>${ts.map(fn).join('')}</div>`).join('') }

  const head = (A) => { const c = (st) => A.filter((t) => t.state === st).length
    return `<div class="hm-h"><h1>Турниры</h1><span class="hm-cnt"><span class="is-live"><i class="sc-dot"></i><b>${c('live')}</b> идут</span><span><b>${c('soon')}</b> скоро</span><span><b>${c('done')}</b> прошли</span></span>
      <label class="tr-q">${IC.search}<input type="search" placeholder="Турнир или игра" value="${esc(CFG.q)}" data-q /></label></div>` }
  const filters = () => { const byG = (g) => all().filter((t) => (g === 'all' || t.game === g) && (CFG.tier === 'all' || t.tier === 1))
    const gb = (g, lbl) => { const ts = byG(g), lv = ts.filter((t) => t.state === 'live').length
      return `<button class="${CFG.game === g ? 'is-on' : ''}" data-game="${g}">${lbl}${lv ? `<span class="sc-l"><i class="sc-dot"></i>${lv}</span>` : `<small>${ts.length}</small>`}</button>` }
    return `<div class="hm-f"><div class="sc-seg">${gb('all', 'Все игры')}${S.GAMES.map((g) => gb(g.id, `${gameIc(g.id, 16)}${CFG.view === 'desk' ? g.short : ''}`)).join('')}</div>
      <div class="sc-seg"><button class="${CFG.tier === '1' ? 'is-on' : ''}" data-tier="1">Tier 1</button><button class="${CFG.tier === 'all' ? 'is-on' : ''}" data-tier="all">Все</button></div></div>` }
  const skel = () => `<div class="tr-tiles">${[0, 1, 2].map(() => '<div class="tr-tile" style="height:208px"><span class="sk" style="width:50%;height:14px"></span><span class="sk" style="width:80%;height:40px;margin-top:12px"></span><span class="sk" style="width:100%;height:6px;margin-top:24px"></span></div>').join('')}</div>
    <section class="tr-list">${[0, 1, 2, 3, 4].map(() => '<div class="tr-r"><span class="sk" style="height:14px"></span><span class="sk" style="height:14px"></span><span></span><span></span><span></span><span></span><span></span></div>').join('')}</section>`

  function render() {
    document.body.classList.toggle('is-desk', CFG.view === 'desk')
    const main = document.getElementById('main'), A = all(), L = A.filter(pass), live = L.filter((t) => t.state === 'live').sort((a, b) => a.tier - b.tier || liveMs(b).length - liveMs(a).length)
    const soon = L.filter((t) => t.state === 'soon'), done = L.filter((t) => t.state === 'done')
    let body
    if (CFG.state === 'skel') body = skel()
    else if (!L.length) body = A.length ? `<div class="hm-empty"><b>Турниров не нашли</b>${CFG.q ? `По запросу «${esc(CFG.q)}» ничего нет` : 'По этому фильтру ничего нет'}<button data-reset>Сбросить</button></div>`
      : '<div class="hm-empty"><b>Турниров пока нет</b>Календарь обновится, как только организаторы объявят даты</div>'
    else body = `${live.length ? `<section class="tr-sec"><div class="tr-sec__h"><b>Идут сейчас</b><small>${live.length}</small></div><div class="tr-tiles">${live.map(tile).join('')}</div></section>` : ''}
      <section class="tr-sec"><div class="tr-sec__h"><div class="sc-seg"><button class="${CFG.tab === 'soon' ? 'is-on' : ''}" data-tab="soon">Скоро<small>${soon.length}</small></button><button class="${CFG.tab === 'done' ? 'is-on' : ''}" data-tab="done">Прошли<small>${done.length}</small></button></div></div>
        <div class="tr-list">${CFG.view === 'desk' ? `<div class="tr-r tr-r--h${CFG.tab === 'done' ? ' tr-r--done' : ''}"><span>Даты</span><span>Турнир</span><span>Тир</span><span>${CFG.tab === 'done' ? 'Победитель' : 'Команд'}</span><span class="tr-r__p">Фонд</span>${CFG.tab === 'done' ? '' : '<span class="tr-r__s">Старт</span>'}<span></span></div>` : ''}
        ${(CFG.tab === 'soon' ? soon : done).length ? months(CFG.tab === 'soon' ? soon : done, CFG.tab === 'soon' ? rowSoon : rowDone, CFG.tab === 'done') : `<div class="hm-empty" style="border:0">${CFG.tab === 'soon' ? 'Ближайших турниров по фильтру нет' : 'Прошедших турниров по фильтру нет'}</div>`}</div></section>`
    main.innerHTML = `${head(A)}${filters()}<div class="hm-lay"><div class="hm-main">${body}</div><aside class="hm-side"><div id="tr-nw"></div><div id="tr-tr"></div></aside></div>
      ${CFG.state === 'offline' ? `<div class="hm-off"><span><b>Нет сети</b> · данные на ${S.hm(new Date(S.NOW).toISOString())}</span><button data-retry>Обновить</button></div>` : ''}`
    const nw = document.getElementById('tr-nw'), tr = document.getElementById('tr-tr')
    if (nw && window.NW2) window.NW2.render(nw, { pic: 'mix', phone: CFG.view !== 'desk', fresh: true, btn: 'more', icon: 'doc', open: 'inline', reveal: 'type', pts: 2, even: true, rich: true, para2: true, hl: 'chip', ava: true, sq: true, sm: true, pad: true, calm: true, pl: 'logos' })
    if (tr && window.TR2) window.TR2.render(tr, { opt: { style: 'hltv', v5: true, gameAva: true, skinV1: true, topAll: true, rows: 'tint' } })
    const qi = main.querySelector('[data-q]'); if (qi && CFG.qFocus) { qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length) }
  }
  const toast = (t) => { let el = document.querySelector('.hm-toast'); if (!el) { el = document.createElement('div'); el.className = 'hm-toast'; document.body.append(el) } el.textContent = t; clearTimeout(el._t); el.style.display = ''; el._t = setTimeout(() => (el.style.display = 'none'), 2600) }

  function mount() {
    document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s)
      const g = q('[data-game]'); if (g) { CFG.game = g.dataset.game; render(); return }
      const t = q('[data-tier]'); if (t) { CFG.tier = t.dataset.tier; render(); return }
      const tb = q('[data-tab]'); if (tb) { CFG.tab = tb.dataset.tab; render(); return }
      if (q('[data-reset]')) { CFG.game = 'all'; CFG.tier = 'all'; CFG.q = ''; render(); return }
      if (q('[data-retry]')) { CFG.state = 'ok'; render(); return }
      const tr = q('[data-tour]'); if (tr && tr.closest('#main')) { const x = S.T[tr.dataset.tour]; if (x.id === 'ti-2026' || x.id === 'universe-ep7') location.href = '../gs-tournament/v46-hs.html' + (FIT ? '?fit=1' : ''); else toast(`${x.name} — страница турнира (в лабе открыта только Dota 2)`) } })
    document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { CFG.q = e.target.value; CFG.qFocus = true; render(); CFG.qFocus = false } })
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('.tr-r')) e.target.click() })
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер 1440' }, { v: 'phone', label: 'Телефон 390' }] },
        { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'ok', label: 'Обычный' }, { v: 'empty', label: 'Турниров нет' }, { v: 'offline', label: 'Нет сети' }, { v: 'skel', label: 'Загрузка' }] }],
      set(k, x) { if (k === 'view') CFG.view = x; if (k === 'state') CFG.state = x; render() },
      caption: () => 'Сейчас — 21.08.2026. Dota 2 — настоящее (8 турниров из базы, участники «скоро» неизвестны). ‼️ CS2, LoL, Valorant, MLBB — пример: турниры, даты, фонды по памяти' }
    if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render() } })
    render()
  }
  return { mount }
})()

;(() => {
  const G = 20
  const fit = () => document.querySelectorAll('.hm-lay > .hm-side').forEach((c) => {
    if (!document.body.classList.contains('is-desk')) { c.style.position = c.style.top = ''; return }
    Object.assign(c.style, { position: 'sticky', top: Math.min(G, innerHeight - c.offsetHeight - G) + 'px' }) })
  addEventListener('resize', fit); addEventListener('load', fit); new ResizeObserver(fit).observe(document.body)
})()
