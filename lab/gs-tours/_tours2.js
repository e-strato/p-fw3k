// «Все турниры» v2 (лаба gs-tours, дирижёр 10.11: «всё, что есть у 2 из 3 конкурентов и выше»; v1 — «много фиолетового»).
// Блоки (HLTV, bo3, DLTV): табы «Идут и скоро · Прошли» · главные турниры крупными карточками · таблица по месяцам (тир, фонд, лого команд) · фильтры · новости сбоку.
// Чёрно-белое: тир серым, Tier 1 белым; фиолетовый — только точка «идёт». Данные — ../gs-home/_sch.js (Dota — база, остальное — ‼️ пример).
window.TOURS2 = (() => {
  const S = window.SCH, { esc, logo, gameIc, tourLogo, LIVE } = S
  const P = new URLSearchParams(location.search), FIT = P.has('fit'), fitView = () => (innerWidth < 800 ? 'phone' : 'desk')
  const CFG = { view: FIT ? fitView() : 'desk', tab: 'now', game: 'all', tiers: new Set(), team: '', state: 'ok' }
  const pl = (n, a, b, c) => { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 12 || y > 14) ? b : c }
  const ARR = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>'
  const CUP = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4.5 2.5h7v4a3.5 3.5 0 0 1-7 0zM8 10v3M5.5 13.5h5M4.5 4H2.5a2 2 0 0 0 2 3M11.5 4h2a2 2 0 0 1-2 3"/></svg>'
  const tierM = (n) => `<span class="h3-tier${n === 1 ? ' is-1' : ''}">Tier ${n}</span>`
  const liveN = (t) => S.M.filter((m) => m.tour === t.id && LIVE.includes(m.state)).length
  // команды турнира: Dota — список из базы; пример — кто есть в матчах
  const teamsOf = (t) => { const d = t.real && window.DB && window.DB.data.tours[t.id]; if (d && d.teams && d.teams.length) return d.teams
    return [...new Set(S.M.filter((m) => m.tour === t.id).flatMap((m) => [m.a, m.b]))] }
  const tq = () => CFG.team.trim().toLowerCase()
  const pass = (t) => (CFG.game === 'all' || t.game === CFG.game) && (!CFG.tiers.size || CFG.tiers.has(t.tier))
    && (!tq() || teamsOf(t).some((id) => (S.team(id).name + ' ' + (S.team(id).tag || '')).toLowerCase().includes(tq())))
  const all = () => (CFG.state === 'empty' ? [] : Object.values(S.T))
  const len = (t) => S.dayDiff(t.to) - S.dayDiff(t.from) + 1, dayN = (t) => -S.dayDiff(t.from) + 1
  const status = (t) => { if (t.state === 'live') { const n = liveN(t); return n ? `<i class="sc-dot"></i><span class="mono">${n}</span> ${pl(n, 'матч идёт', 'матча идут', 'матчей идут')}` : `день <span class="mono">${dayN(t)}</span> из <span class="mono">${len(t)}</span>` }
    const k = S.dayDiff(t.from); return k <= 0 ? 'сегодня' : k === 1 ? 'завтра' : `через <span class="mono">${k}</span> ${pl(k, 'день', 'дня', 'дней')}` }
  const logos = (t, max) => { const ids = teamsOf(t); if (!ids.length) return t.teams ? `<span class="t2-k mono">${t.teams} ${pl(t.teams, 'команда', 'команды', 'команд')}</span>` : '<span class="t2-k">участники позже</span>'
    return `<span class="t2-lg">${ids.slice(0, max).map((id) => logo(id, 20)).join('')}${ids.length > max ? `<small class="mono">+${ids.length - max}</small>` : ''}</span>` }

  // ── главные турниры карточками (Tier 1, идут и ближайшие)
  const card = (t) => `<div class="t2-c" data-tour="${t.id}" role="link" tabindex="0">
      <span class="t2-c__b">${tourLogo(t, 64)}<span class="t2-c__g">${gameIc(t.game, 16)}</span><span class="t2-c__s">${status(t)}</span></span>
      <span class="t2-c__n"><b>${esc(t.name)}</b><small><span class="mono">${S.dm(t.from)} – ${S.dm(t.to)}</span>${t.where ? ' · ' + esc(t.where) : ''}</small></span>
      <span class="t2-c__f"><span class="mono t2-c__p">${esc(t.prize)}</span>${logos(t, 6)}</span></div>`
  // ── строка таблицы
  const row = (t, done) => `<div class="t2-r${done ? ' is-done' : ''}" data-tour="${t.id}" role="link" tabindex="0">
      <span class="t2-r__d mono">${S.dm(t.from)} – ${S.dm(t.to)}</span>
      <span class="t2-r__n">${gameIc(t.game, 16)}${tourLogo(t, 24)}<span><b>${esc(t.name)}</b><small>${[t.state === 'live' ? t.stage : t.where, t.format].filter(Boolean).map(esc).join(' · ')}</small></span></span>
      ${tierM(t.tier)}${done ? `<span class="t2-r__w">${t.winner ? `${CUP}${logo(t.winner, 20)}<b>${S.name(t.winner, 'mid')}</b>` : '<span class="t2-k">—</span>'}</span>` : `<span class="t2-r__k">${logos(t, 5)}</span>`}
      <span class="t2-r__p mono">${esc(t.prize)}</span>${done ? '' : `<span class="t2-r__s">${status(t)}</span>`}</div>`
  const head = (done) => CFG.view === 'desk' ? `<div class="t2-r t2-r--h${done ? ' is-done' : ''}"><span>Даты</span><span>Турнир</span><span>Тир</span><span>${done ? 'Победитель' : 'Команды'}</span><span class="t2-r__p">Фонд</span>${done ? '' : '<span class="t2-r__s"></span>'}</div>` : ''
  const months = (L, done) => { const by = new Map(); L.forEach((t) => { const k = t.from.slice(0, 7); if (!by.has(k)) by.set(k, []); by.get(k).push(t) })
    return [...by.entries()].map(([k, ts]) => `<div class="t2-mo"><b>${S.MONN[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}</b><small class="mono">${ts.length}</small></div>${ts.map((t) => row(t, done)).join('')}`).join('') }

  // ── фильтры (правая колонка)
  const filters = () => { const tc = (n) => all().filter((t) => t.tier === n).length
    return `<section class="h2-card t2-fl"><div class="h2-h"><h2>Фильтры</h2>${CFG.game !== 'all' || CFG.tiers.size || CFG.team ? '<button class="h2-ln" data-reset style="margin-left:auto">Сбросить</button>' : ''}</div>
      <div class="t2-fl__s"><small>Игра</small><div class="h2-g"><button class="${CFG.game === 'all' ? 'is-on' : ''}" data-game="all">Все</button>${S.GAMES.map((g) => `<button class="${CFG.game === g.id ? 'is-on' : ''}" data-game="${g.id}" title="${esc(g.name)}">${gameIc(g.id, 16)}</button>`).join('')}</div></div>
      <div class="t2-fl__s"><small>Тир</small>${[1, 2, 3].map((n) => `<label class="t2-ck"><input type="checkbox" data-tier="${n}"${CFG.tiers.has(n) ? ' checked' : ''}>${tierM(n)}<span class="mono">${tc(n)}</span></label>`).join('')}</div>
      <div class="t2-fl__s"><small>Команда</small><input class="t2-in" type="search" placeholder="Название команды" value="${esc(CFG.team)}" data-team></div></section>` }

  function render() {
    document.body.classList.toggle('is-desk', CFG.view === 'desk'); document.body.classList.add('bw')
    const A = all(), L = A.filter(pass), live = L.filter((t) => t.state === 'live').sort((a, b) => a.tier - b.tier || liveN(b) - liveN(a))
    const soon = L.filter((t) => t.state === 'soon').sort((a, b) => a.from.localeCompare(b.from)), done = L.filter((t) => t.state === 'done').sort((a, b) => b.from.localeCompare(a.from))
    const top = [...live, ...soon].filter((t) => t.tier === 1).slice(0, 4)
    let body
    if (CFG.state === 'skel') body = `<div class="t2-cs">${[0, 1].map(() => '<div class="t2-c"><span class="sk" style="height:120px"></span><span class="sk" style="width:60%;height:16px"></span><span class="sk" style="width:40%;height:12px"></span></div>').join('')}</div>`
    else if (!L.length) body = `<div class="hm-empty"><b>${A.length ? 'Турниров не нашли' : 'Турниров пока нет'}</b>${A.length ? 'По этим фильтрам ничего нет<button data-reset>Сбросить фильтры</button>' : 'Календарь обновится, как только организаторы объявят даты'}</div>`
    else if (CFG.tab === 'now') body = `${top.length ? `<section class="t2-sec"><h2>Главные</h2><div class="t2-cs">${top.map(card).join('')}</div></section>` : ''}
      <section class="t2-tb">${head(false)}${live.length ? `<div class="t2-mo"><b>Идут сейчас</b><small class="mono">${live.length}</small></div>${live.map((t) => row(t, false)).join('')}` : ''}${months(soon, false)}</section>`
    else body = done.length ? `<section class="t2-tb">${head(true)}${months(done, true)}</section>` : '<div class="hm-empty"><b>Прошедших турниров нет</b>По этим фильтрам ничего нет</div>'
    const nNow = L.filter((t) => t.state !== 'done').length
    document.getElementById('main').innerHTML = `<div class="t2-h"><h1>Турниры</h1><div class="h2-seg"><button class="${CFG.tab === 'now' ? 'is-on' : ''}" data-tab="now">Идут и скоро <small class="mono">${nNow}</small></button><button class="${CFG.tab === 'done' ? 'is-on' : ''}" data-tab="done">Прошли <small class="mono">${done.length}</small></button></div></div>
      <div class="h2-lay"><div class="h2-main">${body}</div><aside class="h2-side">${filters()}<div id="t2-nw"></div></aside></div>
      ${CFG.state === 'offline' ? `<div class="hm-off"><span><b>Нет сети</b> · данные на ${S.hm(new Date(S.NOW).toISOString())}</span><button data-retry>Обновить</button></div>` : ''}`
    const nw = document.getElementById('t2-nw')
    if (nw && window.NW2) window.NW2.render(nw, { pic: 'mix', phone: CFG.view !== 'desk', fresh: true, btn: 'more', icon: 'doc', open: 'inline', reveal: 'type', pts: 2, even: true, rich: true, para2: true, hl: 'chip', ava: true, sq: true, sm: true, pad: true, calm: true, pl: 'logos' })
    if (CFG.focus) { const i = document.querySelector('[data-team]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length) } }
  }
  const toast = (t) => { let el = document.querySelector('.hm-toast'); if (!el) { el = document.createElement('div'); el.className = 'hm-toast'; document.body.append(el) } el.textContent = t; clearTimeout(el._t); el.style.display = ''; el._t = setTimeout(() => (el.style.display = 'none'), 2600) }

  function mount() {
    document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s)
      const tb = q('[data-tab]'); if (tb) { CFG.tab = tb.dataset.tab; render(); return }
      const g = q('[data-game]'); if (g) { CFG.game = g.dataset.game; render(); return }
      if (q('[data-reset]')) { CFG.game = 'all'; CFG.tiers.clear(); CFG.team = ''; render(); return }
      if (q('[data-retry]')) { CFG.state = 'ok'; render(); return }
      const tr = q('[data-tour]'); if (tr && tr.closest('.h2-main')) { const x = S.T[tr.dataset.tour]; if (x.id === 'ti-2026' || x.id === 'universe-ep7') location.href = '../gs-tournament/v46-hs.html' + (FIT ? '?fit=1' : ''); else toast(`${x.name} — страница турнира (в лабе открыта только Dota 2)`) } })
    document.addEventListener('change', (e) => { const t = e.target.closest('[data-tier]'); if (t) { const n = +t.dataset.tier; t.checked ? CFG.tiers.add(n) : CFG.tiers.delete(n); render() } })
    document.addEventListener('input', (e) => { if (e.target.matches('[data-team]')) { CFG.team = e.target.value; CFG.focus = true; render(); CFG.focus = false } })
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('.t2-r, .t2-c')) e.target.click() })
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер 1440' }, { v: 'phone', label: 'Телефон 390' }] },
        { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'ok', label: 'Обычный' }, { v: 'empty', label: 'Турниров нет' }, { v: 'offline', label: 'Нет сети' }, { v: 'skel', label: 'Загрузка' }] }],
      set(k, x) { if (k === 'view') CFG.view = x; if (k === 'state') CFG.state = x; render() },
      caption: () => 'Сейчас — 21.08.2026. Dota 2 — база (участники «скоро» неизвестны). ‼️ CS2, LoL, Valorant, MLBB — пример: турниры, даты, фонды, команды' }
    if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render() } })
    render() }
  return { mount }
})()

;(() => {
  const G = 20
  const fit = () => document.querySelectorAll('.h2-lay > .h2-side').forEach((c) => {
    if (!document.body.classList.contains('is-desk')) { c.style.position = c.style.top = ''; return }
    Object.assign(c.style, { position: 'sticky', top: Math.min(G, innerHeight - c.offsetHeight - G) + 'px' }) })
  addEventListener('resize', fit); addEventListener('load', fit); new ResizeObserver(fit).observe(document.body)
})()
