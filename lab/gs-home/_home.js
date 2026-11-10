// Главная = расписание всех матчей 5 игр (лаба gs-home, дирижёр 10.11). Исследование — внутренняя документация/исследование-главная-турниры.
// Начальник: «центр — расписание» (12.10), «просто плашки всех матчей» (21.10), «Polymarket для киберспорта — наш ориентир» (21.10), две колонки (26.10).
// HOME.mount(opt): шапка «Матчи» · день · счётчики → игры со счётчиками и тир → «Идут сейчас» (главный live карточкой + остальные live) → дни, внутри — турниры и строки.
// Правая колонка — готовые виджеты в «состоянии главной»: Турниры (T4), Новости (NW2), Трансферы (TR2). Данные — ../gs-home/_sch.js (Dota — база, остальное — пример).
window.HOME = (() => {
  const S = window.SCH, { esc, logo, name, gameIc, tourLogo, tierTag, hm, ymd, dayName, LIVE } = S
  const P = new URLSearchParams(location.search), FIT = P.has('fit'), fitView = () => (innerWidth < 800 ? 'phone' : 'desk')
  const CFG = { view: FIT ? fitView() : 'desk', game: 'all', tier: 'all', spoil: false, state: 'ok', hero: 0, star: new Set(), showOld: false, o: {} }
  const IC = {
    eye: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/></svg>',
    eyeOff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l12 12M6.6 3.7A6.6 6.6 0 0 1 8 3.5c4.1 0 6.5 4.5 6.5 4.5a11 11 0 0 1-1.8 2.4M4.2 4.9A11.4 11.4 0 0 0 1.5 8S3.9 12.5 8 12.5c1 0 1.9-.3 2.7-.7"/></svg>',
    star: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg>',
    chev: (d) => `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d < 0 ? 'M7.5 2.5 4 6l3.5 3.5' : 'M4.5 2.5 8 6l-3.5 3.5'}"/></svg>`,
    play: '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2v8l7-4z"/></svg>',
  }

  // ── выборка
  const tourOf = (m) => S.T[m.tour]
  const pass = (m) => (CFG.game === 'all' || m.game === CFG.game) && (CFG.tier === 'all' || tourOf(m).tier === 1)
  const all = () => (CFG.state === 'empty' ? [] : S.M.filter((m) => !(CFG.state === 'nolive' && LIVE.includes(m.state))))
  const list = () => all().filter(pass)
  const dayOf = (m) => ymd(m.start)
  const isLive = (m) => LIVE.includes(m.state)
  const ORD = { live: 0, pause: 0, break: 0, draft: 0, delayed: 1, soon: 2, tba: 3, moved: 4, cancel: 5, done: 6 }
  const sortDay = (a, b) => (ORD[a.state] - ORD[b.state]) || (a.state === 'done' ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start))

  // ── строка матча: время / состояние слева · команды и счёт · Bo и шанс · ★
  const mapLbl = (m) => (m.game === 'lol' || m.game === 'mlbb' ? 'Game' : 'Map') + ' ' + (m.map || 1)
  const minsTo = (iso) => Math.round((Date.parse(iso) - S.NOW) / 60000)
  const inTxt = (n) => (n < 60 ? `через ${n}′` : `через ${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`)
  const stLbl = (m) => m.state === 'live' ? `<span class="hm-st"><i class="sc-dot"></i>${mapLbl(m)}${m.clock ? ` <span class="mono">${m.clock}</span>` : ''}</span>`
    : m.state === 'draft' ? `<span class="hm-st"><i class="sc-dot"></i>Драфт · ${mapLbl(m)}</span>`
    : m.state === 'pause' ? `<span class="hm-st hm-st--warn">Пауза · ${mapLbl(m)}</span>`
    : m.state === 'break' ? `<span class="hm-st hm-st--mut">Перерыв · ${mapLbl(m)} <span class="mono">${inTxt(m.inMin)}</span></span>` : ''
  const timeCell = (m) => {
    if (isLive(m)) return stLbl(m)
    if (m.state === 'tba') return `<span class="mono">—:—</span><small>время уточнят</small>`
    if (m.state === 'delayed') return `<s>${hm(m.start)}</s><small>+${m.delay}′</small>`
    if (m.state === 'moved') return `<s>${hm(m.start)}</s><small>перенос</small>`
    if (m.state === 'cancel') return `<span>${hm(m.start)}</span><small>отменён</small>`
    if (m.state === 'done') return `<span class="mut">${hm(m.start)}</span>`
    const n = minsTo(m.start); return `<span>${hm(m.start)}</span>${n > 0 && n <= 180 ? `<small>${inTxt(n)}</small>` : ''}` }
  const win = (m) => (m.score && m.state === 'done' ? (m.score[0] > m.score[1] ? 0 : 1) : -1)
  const hidden = (m) => CFG.spoil && m.state === 'done'
  const center = (m) => {
    const w = win(m), sc = m.score
    if (m.state === 'done') return hidden(m) ? `<button class="hm-hide" data-reveal="${m.id}">${IC.eye.replace('<svg', '<svg width="12" height="12"')}Счёт</button>`
      : `<span class="hm-sc"><span class="${w === 1 ? 'is-lose' : ''}">${sc[0]}</span><i>:</i><span class="${w === 0 ? 'is-lose' : ''}">${sc[1]}</span></span>`
    if (isLive(m) && sc) return `<span class="hm-sc"><span>${sc[0]}</span><i>:</i><span>${sc[1]}</span></span>${m.rounds ? `<small>${m.rounds[0]} : ${m.rounds[1]}</small>` : ''}`
    if (m.state === 'draft') return `<span class="hm-sc"><span>0</span><i>:</i><span>0</span></span>`
    if (m.state === 'moved') return `<small>→ ${S.dm(ymd(m.to))} · ${hm(m.to)}</small>`
    if (m.state === 'delayed') return `<span class="hm-in">~${hm(new Date(Date.parse(m.start) + m.delay * 60000).toISOString())}</span><small>задержка</small>`
    if (m.state === 'cancel') return '<span class="hm-vs">отменён</span>'
    return '<span class="hm-vs">vs</span>' }
  const chance = (m) => { if (!m.chance || m.state === 'done' || m.state === 'cancel') return ''
    const f = m.chance[0] >= m.chance[1] ? 0 : 1
    return `<span class="hm-ch-w" title="Шанс по прогнозу: ${name(m[f ? 'b' : 'a'], 'mid')} ${m.chance[f]}%"><span class="hm-ch"><i class="${f === 0 ? 'is-fav' : ''}" style="flex:${m.chance[0]}"></i><i class="${f === 1 ? 'is-fav' : ''}" style="flex:${m.chance[1]}"></i></span>${m.chance[f]}</span>` }
  const row = (m) => {
    const w = hidden(m) ? -1 : win(m), cls = ['hm-r', isLive(m) ? 'is-live' : '', m.state === 'done' ? 'is-done' : '', m.state === 'cancel' ? 'is-cancel' : ''].join(' ')
    const phSc = (i) => m.state === 'done' ? (hidden(m) ? '<small>•</small>' : `<span class="${w === 1 - i ? '' : w >= 0 ? 'is-lose' : ''}">${m.score[i]}</span>`) : isLive(m) && m.score ? `<span>${m.score[i]}</span>` : ''
    return `<div class="${cls}" data-m="${m.id}" role="link" tabindex="0">
      <span class="hm-r__t">${timeCell(m)}</span>
      <span class="hm-r__a${w === 0 ? ' is-win' : ''}"><span>${name(m.a, 'mid')}</span>${logo(m.a, 22)}</span>
      <span class="hm-r__c">${center(m)}</span>
      <span class="hm-r__b${w === 1 ? ' is-win' : ''}">${logo(m.b, 22)}<span>${name(m.b, 'mid')}</span></span>
      <span class="hm-r__tm"><span class="${w === 0 ? 'is-win' : ''}">${logo(m.a, 20)}<em>${name(m.a, 'mid')}</em></span><span class="${w === 1 ? 'is-win' : ''}">${logo(m.b, 20)}<em>${name(m.b, 'mid')}</em></span></span>
      <span class="hm-r__sc">${m.state === 'moved' ? `<small>→ ${S.dm(ymd(m.to))}</small>` : m.state === 'cancel' ? '<small>отменён</small>' : phSc(0) + phSc(1)}</span>
      <span class="hm-r__m">${chance(m)}<span class="hm-bo">Bo${m.bo}</span></span>
      <button class="hm-star${CFG.star.has(m.id) ? ' is-on' : ''}" data-star="${m.id}" aria-label="Следить за матчем" title="Следить — напомним о старте">${IC.star}</button></div>` }

  // ── группа турнира внутри дня
  const group = (tid, ms) => { const t = S.T[tid]
    return `<section class="hm-tg"><div class="hm-tg__h">${gameIc(t.game, 16)}${tourLogo(t, 18)}<b>${esc(t.name)}</b>${tierTag(t.tier)}<small>${esc(ms[0].stage || t.stage || '')}</small>
      <button class="hm-tg__go" data-tour="${t.id}" aria-label="Открыть турнир" title="Турнир">${IC.chev(1)}</button></div>${ms.map(row).join('')}</section>` }
  const dayBlock = (d, ms) => { const by = new Map(); ms.slice().sort(sortDay).forEach((m) => { if (!by.has(m.tour)) by.set(m.tour, []); by.get(m.tour).push(m) })
    // турниры в дне: где есть live — первыми, дальше по тиру и времени первого матча
    const gs = [...by.entries()].sort((a, b) => (Math.min(...a[1].map((m) => ORD[m.state])) - Math.min(...b[1].map((m) => ORD[m.state]))) || (S.T[a[0]].tier - S.T[b[0]].tier))
    return `<div class="hm-day"><div class="hm-day__h"><b>${dayName(d)}</b><small>${ms.length} ${pl(ms.length, 'матч', 'матча', 'матчей')}</small></div>${gs.map(([t, x]) => group(t, x)).join('')}</div>` }
  const pl = (n, a, b, c) => { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 12 || y > 14) ? b : c }

  // ── «Идут сейчас»: главный live-матч карточкой (листается), справа остальные live
  const hero = (L) => { if (!L.length) return ''
    CFG.hero = Math.min(CFG.hero, L.length - 1); const m = L[CFG.hero], t = tourOf(m), ch = m.chance || [50, 50], f = ch[0] >= ch[1] ? 0 : 1
    const tm = (i) => `<div class="hm-tm${f === i ? ' is-fav' : ''}">${logo(m[i ? 'b' : 'a'], 36)}<span class="hm-tm__n"><b>${name(m[i ? 'b' : 'a'])}</b><span class="hm-tm__bar"><i style="width:${ch[i]}%"></i></span></span>
      <span class="hm-tm__s"><b>${m.score ? m.score[i] : 0}</b>${m.rounds ? `<small>${m.rounds[i]}</small>` : ''}</span><span class="hm-tm__p">${ch[i]}%</span></div>`
    const lv = L.map((x, i) => `<button class="hm-lv__r${i === CFG.hero ? ' is-on' : ''}" data-hero="${i}">${gameIc(x.game, 16)}<span class="hm-lv__t"><span>${logo(x.a, 16)}<em>${name(x.a, 'mid')}</em></span><span>${logo(x.b, 16)}<em>${name(x.b, 'mid')}</em></span></span>
      <span class="hm-lv__s"><span>${x.score ? x.score[0] : 0}</span><span>${x.score ? x.score[1] : 0}</span></span></button>`).join('')
    return `<section class="hm-live"><div class="hm-hero">
        <div class="hm-hero__top">${gameIc(m.game, 16)}<span class="hm-tn">${esc(t.name)}</span><span>·</span><span>${esc(m.stage || '')}</span><span>·</span><span>Bo${m.bo}</span>
          ${L.length > 1 ? `<span class="hm-nav"><button data-hnav="-1" aria-label="Предыдущий">${IC.chev(-1)}</button><span>${CFG.hero + 1} / ${L.length}</span><button data-hnav="1" aria-label="Следующий">${IC.chev(1)}</button></span>` : ''}</div>
        <div>${stLbl(m)}</div>
        <div class="hm-tms">${tm(0)}${tm(1)}</div>
        <div class="hm-hero__ft"><span>Шанс — по прогнозам зрителей${m.real ? '' : '<span class="hm-ex">пример</span>'}</span><button class="hm-go" data-m="${m.id}">${IC.play}Смотреть матч</button></div>
      </div>${CFG.view === 'desk' ? `<div class="hm-lv"><div class="hm-lv__h">Идут сейчас · ${L.length}</div>${lv}</div>` : ''}</section>` }

  // ── шапка: «Матчи» · день · счётчики · антиспойлер; игры со счётчиками · тир
  const head = (A) => { const live = A.filter(isLive).length, soon = A.filter((m) => ['soon', 'delayed', 'tba'].includes(m.state)).length, done = A.filter((m) => m.state === 'done' && dayOf(m) === S.TODAY).length
    const x = new Date(S.NOW)
    return `<div class="hm-h"><h1>Матчи</h1><span class="hm-d">${(() => { const d = x.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }); return d[0].toUpperCase() + d.slice(1) })()} · ${hm(x.toISOString())} мск</span>
      <span class="hm-cnt"><span class="is-live">${live ? '<i class="sc-dot"></i>' : ''}<b>${live}</b> идут</span><span><b>${soon}</b> скоро</span><span><b>${done}</b> сыграно сегодня</span></span>
      <span class="hm-tools"><button class="hm-ib${CFG.spoil ? ' is-on' : ''}" data-spoil title="Скрывать счёт сыгранных матчей">${CFG.spoil ? IC.eyeOff : IC.eye}${CFG.view === 'desk' ? (CFG.spoil ? 'Счёт скрыт' : 'Счёт виден') : ''}</button></span></div>` }
  const filters = () => { const A = all(), byG = (g) => A.filter((m) => (g === 'all' || m.game === g) && (CFG.tier === 'all' || tourOf(m).tier === 1))
    const gb = (g, lbl) => { const ms = byG(g), lv = ms.filter(isLive).length
      return `<button class="${CFG.game === g ? 'is-on' : ''}" data-game="${g}">${lbl}${lv ? `<span class="sc-l"><i class="sc-dot"></i>${lv}</span>` : `<small>${ms.length}</small>`}</button>` }
    return `<div class="hm-f"><div class="sc-seg">${gb('all', 'Все игры')}${S.GAMES.map((g) => gb(g.id, `${gameIc(g.id, 16)}${CFG.view === 'desk' ? g.short : ''}`)).join('')}</div>
      <div class="sc-seg"><button class="${CFG.tier === '1' ? 'is-on' : ''}" data-tier="1">Tier 1</button><button class="${CFG.tier === 'all' ? 'is-on' : ''}" data-tier="all">Все</button></div></div>` }

  // ── скелетон
  const skel = () => `<div class="hm-live" style="height:220px;padding:16px"><span class="sk" style="width:40%;height:14px"></span><span class="sk" style="width:70%;height:36px;margin-top:24px"></span><span class="sk" style="width:70%;height:36px;margin-top:12px"></span></div>
    <div class="hm-days">${[0, 1].map(() => `<div class="hm-day"><span class="sk" style="width:180px;height:18px"></span><section class="hm-tg">${[0, 1, 2, 3].map(() => '<div class="hm-r"><span class="sk" style="height:14px"></span><span class="sk" style="height:14px"></span><span class="sk" style="height:14px;width:40px;justify-self:center"></span><span class="sk" style="height:14px"></span><span></span><span></span></div>').join('')}</section></div>`).join('')}</div>`

  // ── правая колонка: готовые виджеты в «состоянии главной»
  const side = () => `<aside class="hm-side"><div id="hm-t4"></div><div id="hm-nw"></div><div id="hm-tr"></div></aside>`
  const mountSide = () => {
    const t4 = document.getElementById('hm-t4'), nw = document.getElementById('hm-nw'), tr = document.getElementById('hm-tr')
    if (t4 && window.T4) window.T4.render(t4, { opt: { v3: true, tier: 'fill', tierEn: true, final: 'merge', dt: 'mono' } })
    if (nw && window.NW2) { window.NW2.render(nw, { pic: 'mix', phone: CFG.view !== 'desk', fresh: true, btn: 'more', icon: 'doc', open: 'inline', reveal: 'type', pts: 2, even: true, rich: true, para2: true, hl: 'chip', ava: true, sq: true, sm: true, pad: true, calm: true, pl: 'logos' }) }
    if (tr && window.TR2) window.TR2.render(tr, { opt: { style: 'hltv', v5: true, gameAva: true, skinV1: true, topAll: true, rows: 'tint' } }) }

  function render() {
    document.body.classList.toggle('is-desk', CFG.view === 'desk')
    const main = document.getElementById('main'), A = all(), L = list()
    let body
    if (CFG.state === 'skel') body = skel()
    else {
      const live = L.filter(isLive).sort((a, b) => tourOf(a).tier - tourOf(b).tier), days = new Map()
      L.forEach((m) => { const d = m.state === 'moved' ? dayOf(m) : dayOf(m); if (!days.has(d)) days.set(d, []); days.get(d).push(m) })
      const ds = [...days.keys()].sort(), fut = ds.filter((d) => d >= S.TODAY), past = ds.filter((d) => d < S.TODAY).reverse()
      const emp = !L.length ? (A.length ? `<div class="hm-empty"><b>Матчей нет</b>По этому фильтру сегодня и в ближайшие дни ничего нет<button data-reset>Сбросить фильтр</button></div>`
        : '<div class="hm-empty"><b>Матчей пока нет</b>Расписание обновится, как только турниры объявят пары</div>') : ''
      body = `${hero(live)}${emp}<div class="hm-days">${fut.map((d) => dayBlock(d, days.get(d))).join('')}
        ${past.length ? (CFG.showOld ? past.map((d) => dayBlock(d, days.get(d))).join('') : `<button class="hm-more" data-old>Показать вчера · ${past.reduce((a, d) => a + days.get(d).length, 0)} ${pl(past.reduce((a, d) => a + days.get(d).length, 0), 'матч', 'матча', 'матчей')}</button>`) : ''}</div>`
    }
    main.innerHTML = `${head(A)}${filters()}<div class="hm-lay"><div class="hm-main">${body}</div>${side()}</div>
      ${CFG.state === 'offline' ? `<div class="hm-off"><span><b>Нет сети</b> · данные на ${hm(new Date(S.NOW).toISOString())}</span><button data-retry>Обновить</button></div>` : ''}`
    mountSide()
  }
  const toast = (t) => { let el = document.querySelector('.hm-toast'); if (!el) { el = document.createElement('div'); el.className = 'hm-toast'; document.body.append(el) } el.textContent = t; clearTimeout(el._t); el.style.display = ''; el._t = setTimeout(() => (el.style.display = 'none'), 2600) }

  function mount(o = {}) {
    CFG.o = o
    document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s)
      const st = q('[data-star]'); if (st) { e.stopPropagation(); const id = st.dataset.star; CFG.star.has(id) ? CFG.star.delete(id) : CFG.star.add(id); st.classList.toggle('is-on'); toast(CFG.star.has(id) ? 'Напомним о старте и счёте этого матча' : 'Больше не следим за матчем'); return }
      const rv = q('[data-reveal]'); if (rv) { e.stopPropagation(); CFG.spoil = false; render(); return }
      const g = q('[data-game]'); if (g) { CFG.game = g.dataset.game; CFG.hero = 0; render(); return }
      const t = q('[data-tier]'); if (t) { CFG.tier = t.dataset.tier; CFG.hero = 0; render(); return }
      if (q('[data-spoil]')) { CFG.spoil = !CFG.spoil; render(); return }
      if (q('[data-reset]')) { CFG.game = 'all'; CFG.tier = 'all'; render(); return }
      if (q('[data-old]')) { CFG.showOld = true; render(); return }
      if (q('[data-retry]')) { CFG.state = 'ok'; render(); return }
      const hn = q('[data-hnav]'); if (hn) { const n = document.querySelectorAll('.hm-lv__r').length || list().filter(isLive).length; CFG.hero = (CFG.hero + +hn.dataset.hnav + n) % n; render(); return }
      const h = q('[data-hero]'); if (h) { CFG.hero = +h.dataset.hero; render(); return }
      const tr = q('[data-tour]'); if (tr) { const t = S.T[tr.dataset.tour]; if (t.id === 'ti-2026' || t.id === 'universe-ep7') location.href = '../gs-tournament/v46-hs.html' + (FIT ? '?fit=1' : ''); else toast(`${t.name} — страница турнира (в лабе открыта только Dota 2)`); return }
      const r = q('[data-m]'); if (r && r.closest('#main')) { const m = S.M.find((x) => x.id === r.dataset.m); if (m && m.href) location.href = m.href + (FIT ? '?fit=1' : ''); else toast('Страница матча — пример: в лабе открыта только PARIVISION — Team Spirit') } })
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('.hm-r')) e.target.click() })
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер 1440' }, { v: 'phone', label: 'Телефон 390' }] },
        { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'ok', label: 'Обычный день' }, { v: 'nolive', label: 'Ничего не идёт' }, { v: 'empty', label: 'Матчей нет' }, { v: 'offline', label: 'Нет сети' }, { v: 'skel', label: 'Загрузка' }] }],
      set(k, x) { if (k === 'view') CFG.view = x; if (k === 'state') CFG.state = x; CFG.hero = 0; render() },
      toggles: () => [{ key: 'spoil', name: 'Антиспойлер', value: CFG.spoil }], toggle(k) { if (k === 'spoil') { CFG.spoil = !CFG.spoil; render() } },
      caption: () => 'Сейчас — 21.08.2026 16:08 мск. Dota 2 — настоящее (TI 2026, база). ‼️ CS2, LoL, Valorant, MLBB — пример: турниры по памяти, матчи и счёт выдуманы. Шанс — пример' }
    if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render() } })
    render()
  }
  return { mount }
})()

// Правая колонка — как на всех страницах (решение 03.11): влезает в окно — липнет с отступом 20; не влезает — едет и встаёт с отступом 20 снизу. Телефон — без липкости.
;(() => {
  const G = 20
  const fit = () => document.querySelectorAll('.hm-lay > .hm-side').forEach((c) => {
    const two = document.body.classList.contains('is-desk')
    if (!two) { c.style.position = c.style.top = ''; return }
    Object.assign(c.style, { position: 'sticky', top: Math.min(G, innerHeight - c.offsetHeight - G) + 'px' }) })
  addEventListener('resize', fit); addEventListener('load', fit); new ResizeObserver(fit).observe(document.body)
})()
