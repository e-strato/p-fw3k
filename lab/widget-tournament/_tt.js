// Виджет турнира — базовый (дирижёр 20.10): один турнир на экране + переключение между всеми турнирами игры.
// Оставлены (дирижёр 20.10): 20 стрелки + бургер · 24 снизу «‹ 2 из 6 ›» · 25 снизу соседи половинами · 26 поле поиска + точки.
// Во всех — бургер со списком и поиском, избранное. Остальные — в _отклонено/widget-tournament.
// TT.render(узел, версия). Размер 320×400, лишнее — скроллом внутри. Данные — пример по Dota 2, октябрь 2026.
(() => {
  const TOURS = [
    { id: 'epl', name: 'EPL Masters III', short: 'EPL Masters', abbr: 'EPL', st: 'live', tier: 'B', dates: '18.10 – 05.11', prize: '$100 000', now: 'Группы · день 3 из 19',
      rule: 'В плей-офф — 4 лучших из группы', groups: {
        'Группа A': [['HULIGANI', 3, 0, 9], ['Power Rangers', 1, 1, 3], ['Salamit', 1, 2, 3], ['Nemiga Gaming', 0, 2, 1], ['Team Lynx', 0, 2, 0], ['IC x Insanity', 0, 2, 0]],
        'Группа B': [['Team Synapse', 2, 0, 6], ['Yellow Submarine', 2, 1, 6], ['Dawn Bulls', 1, 1, 3], ['CyberHero', 1, 1, 3], ['Zero Tenacity', 0, 2, 0], ['TheBots', 0, 1, 0]] } },
    { id: 'sea', name: 'EPL World Series: SEA S19', short: 'EPL SEA', abbr: 'SEA', st: 'live', tier: 'C', dates: '20.10 – 05.11', prize: '$10 000', now: 'Лига · тур 1 из 7',
      rule: 'В плей-офф — 4 лучших', groups: {
        'Лига': [['Team Kinetix', 1, 0, 3], ['Shinigami Gaming', 1, 0, 3], ['Night Force', 1, 0, 3], ['Teiko', 1, 0, 3], ['Nemesis Academy', 0, 1, 0], ['Eye Gaming', 0, 1, 0], ['Wiser Warriors', 0, 1, 0], ['Scarlet Lotus', 0, 1, 0]] } },
    { id: 'sber', name: 'Sber Tournament 2026 Pro', short: 'Sber Pro', abbr: 'SBR', st: 'live', tier: 'C', dates: '10.10 – 01.11', prize: '$47 000', now: 'Лига · тур 5 из 7',
      rule: 'В финал — 2 лучших', groups: {
        'Лига': [['Team Revenant', 4, 1, 12], ['Chandogs', 4, 1, 12], ['Team Solid', 3, 2, 9], ['Pizza Hook', 3, 2, 9], ['L1GA Team', 2, 3, 6], ['Inner Circle', 2, 3, 6], ['Selva Esports', 1, 4, 3], ['Nemiga Academy', 1, 4, 3]] } },
    { id: 'pari', name: 'PARI Universe', short: 'PARI Universe', abbr: 'PARI', st: 'soon', tier: 'B', dates: '22.10 – 01.11', prize: '$250 000', now: 'Начнётся через 2 дня',
      teams: ['Team Yandex', 'Team Spirit', '1w Team', 'BetBoom Team', 'PARIVISION', 'Aurora', 'Team Liquid', 'Nigma Galaxy', 'HULIGANI', 'Team Falcons'] },
    { id: 'blast', name: 'BLAST Slam IX', short: 'BLAST Slam', abbr: 'BLS', st: 'soon', tier: 'A', dates: '20.11 – 29.11', prize: '$750 000', now: 'Начнётся через месяц',
      teams: ['Natus Vincere', 'Team Nemesis', 'Dawn Bulls', 'Team Falcons'], more: 8 },
    { id: 'dl', name: 'DreamLeague Season 30', short: 'DreamLeague', abbr: 'DL', st: 'soon', tier: 'A', dates: '02.12 – 13.12', prize: '$750 000', now: 'Начнётся через 6 недель',
      teams: [], more: 21 },
  ]
  const nb = s => s.replace(/ (\d{3})/g, ' $1')
  const ini = n => n.replace(/^(Team |IC x )/, '').slice(0, 2).toUpperCase()
  const ic = {
    down: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="vertical-align:-1px"><path d="m4 10 4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m8 2 1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5L8 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    lens: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }

  // ——— Содержимое турнира (одно и то же во всех версиях) ———
  const status = t => `<div class="tt-st">${t.st === 'live' ? '<span class="w-dot"></span>' : '<span class="w-dot w-dot--soon"></span>'}<span>${t.now}</span><span class="tt-st__r">${t.tier}-тир · ${nb(t.prize)}</span></div>`
  const table = rows => `<table class="w-tbl"><tr><th></th><th></th><th>В–П</th><th>Очки</th></tr>${rows.map(([n, w, l, p], i) =>
    `<tr class="${i === 3 ? 't-cut' : ''}"><td>${i + 1}</td><td><span class="w-team"><span class="w-logo">${ini(n)}</span>${n}</span></td><td>${w}–${l}</td><td>${p}</td></tr>`).join('')}</table>`
  const body = t => {
    if (t.st === 'live') return Object.entries(t.groups).map(([g, r]) => `<div class="w-lbl">${g}</div>${table(r)}`).join('<div style="height:12px"></div>')
      + `<div class="w-cap" style="margin-top:12px">${t.rule}</div>`
    const known = t.teams.length
    return `<div class="t-pass" style="margin-top:0">${[['Даты', t.dates], ['Призовой', nb(t.prize)]].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
      <div class="w-lbl" style="margin-top:16px">Участники · ${known}${t.more ? ` из ${known + t.more}` : ''}</div>
      ${known ? `<div class="tt-teams">${t.teams.map(n => `<div class="tt-team"><span class="w-logo">${ini(n)}</span>${n}</div>`).join('')}</div>` : '<div class="w-cap">Состав объявят позже</div>'}
      ${t.more && known ? `<div class="w-cap" style="margin-top:8px">Ещё ${t.more} — после квалификаций</div>` : ''}`
  }
  const content = t => status(t) + `<div class="w-scroll"><div class="w-bd">${body(t)}</div></div>`
  const row = (t, cur, star) => `<button class="w-row w-row--btn" data-id="${t.id}">
      <span class="w-dot ${t.st === 'soon' ? 'w-dot--soon' : ''}"></span><span class="w-row__main"><div class="w-row__t">${t.name}</div><div class="w-cap">${t.st === 'live' ? t.now : t.dates}</div></span>
      ${star ? `<span class="tt-star ${star === 'on' ? 'is-on' : ''}" data-fav="${t.id}" role="button" aria-label="В избранное">${ic.star}</span>` : cur === t.id ? `<span class="tt-ok">${ic.check}</span>` : `<span class="w-cap">${t.tier}</span>`}</button>`
  const group = (name, ts, cur, star) => ts.length ? `<div class="w-lbl">${name}</div>${ts.map(t => row(t, cur, star && star(t))).join('')}` : ''
  // Список турниров: f — all | live | soon (v22); fav/recent — избранное и недавние (v23)
  const listRows = (cur, o = {}) => {
    const by = st => TOURS.filter(t => t.st === st && (!o.f || o.f === 'all' || o.f === st))
    if (!o.fav) return group('Идут', by('live'), cur) + group('Скоро', by('soon'), cur)
    const star = t => o.fav.has(t.id) ? 'on' : 'off', shown = new Set()
    const take = ts => ts.filter(t => !shown.has(t.id) && shown.add(t.id))
    return group('Избранное', take(TOURS.filter(t => o.fav.has(t.id))), cur, star) + group('Недавние', take(o.recent.map(id => TOURS.find(t => t.id === id))), cur, star)
      + group('Идут', take(by('live')), cur, star) + group('Скоро', take(by('soon')), cur, star)
  }
  const search = (t, o) => `<div class="tt-search"><input type="text" placeholder="Найти турнир" data-q /></div>${o && o.seg || ''}
    <div class="w-scroll"><div class="w-bd">${listRows(t.id, o)}<div class="w-cap tt-none" hidden>Ничего не нашлось</div></div></div>`
  const arrows = s => `<span class="tt-arrows"><button class="tt-arr" data-step="-1" ${s.i ? '' : 'disabled'} aria-label="Предыдущий">${ic.back}</button><button class="tt-arr" data-step="1" ${s.i < TOURS.length - 1 ? '' : 'disabled'} aria-label="Следующий">${ic.next}</button></span>`

  // ——— Версии: только способ переключения ———
  // Избранное — во всех версиях (дирижёр 20.10): звезда у текущего турнира в шапке, в списках — у каждой строки + группа «Избранное»
  const fav = (s, t) => `<button class="tt-star ${s.fav.has(t.id) ? 'is-on' : ''}" data-fav="${t.id}" aria-label="Избранное">${ic.star}</button>`
  const list = (s, t, recent) => search(t, { fav: s.fav, recent: recent ? s.recent : [] })
  // Кнопки шапки одного вида (дирижёр 20.10): 32×32 с рамкой, как стрелки — бургер, звезда, ‹ ›
  const burger = s => `<button class="tt-arr ${s.open ? 'is-on' : ''}" data-open aria-label="Все турниры">${s.open ? ic.close : ic.menu}</button>`
  const favBox = (s, t) => fav(s, t).replace('class="tt-star', 'class="tt-arr tt-star')
  const V = {
    20: s => { const t = TOURS[s.i]
      return `<div class="w-hd tt-hd2">${burger(s)}<span class="tt-hd2__t"><b>${t.name}</b><span class="w-cap">${s.i + 1} из ${TOURS.length} · Dota 2</span></span>${s.open ? '' : favBox(s, t) + arrows(s)}</div>`
        + (s.open ? list(s, t) : content(t)) },
    // 24–26: название и поиск сверху (бургер ≡), переключение — только снизу
    24: s => { const t = TOURS[s.i]
      return `<div class="w-hd">${burger(s)}<span class="w-hd__t">${t.name}</span>${fav(s, t)}</div>`
        + (s.open ? list(s, t) : `<div class="tt-rel">${content(t)}</div><div class="tt-bot">${arrows(s)}<span class="tt-bot__n">${s.i + 1} из ${TOURS.length}</span></div>`) },
    25: s => { const t = TOURS[s.i], p = TOURS[s.i - 1], n = TOURS[s.i + 1]
      return `<div class="w-hd">${burger(s)}<span class="w-hd__t">${t.name}</span>${fav(s, t)}</div>`
        + (s.open ? list(s, t) : `<div class="tt-rel">${content(t)}</div><div class="tt-halves"><button data-step="-1" ${p ? '' : 'disabled'}>${ic.back}<span>${p ? p.short : 'Начало'}</span></button>
          <button data-step="1" ${n ? '' : 'disabled'}><span>${n ? n.short : 'Конец'}</span>${ic.next}</button></div>`) },
    26: s => { const t = TOURS[s.i]
      return `<div class="w-hd">${burger(s)}<span class="w-hd__t">${t.name}</span>${fav(s, t)}</div>`
        + (s.open ? list(s, t)
          : `<div class="tt-search tt-search--btn"><button data-open>${ic.lens}<span>Найти турнир</span></button></div><div class="tt-rel">${content(t)}</div>
            <div class="tt-bot">${arrows(s)}<span class="tt-pips">${TOURS.map((_, i) => `<button class="${i === s.i ? 'is-on' : ''}" data-i="${i}" aria-label="${TOURS[i].name}"></button>`).join('')}</span></div>`) },
  }
  function render(el, v, s = { i: 0, open: false, fav: new Set(['epl']), recent: ['pari', 'sber'] }) {
    el.className = 'w w--fixed'
    el.innerHTML = V[v](s)
    // stay — тот же турнир (звезда): прокрутка остаётся на месте
    const go = (p, stay) => { const sc0 = el.querySelector('.w-scroll'), y = sc0 ? sc0.scrollTop : 0; render(el, v, Object.assign(s, p)); const sc = el.querySelector('.w-scroll'); if (stay && sc) sc.scrollTop = y }
    el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => go({ open: !s.open }))
    el.querySelectorAll('[data-id]').forEach(b => b.onclick = e => { if (e.target.closest('[data-fav]')) return
      const id = b.dataset.id; s.recent = [id, ...s.recent.filter(x => x !== id)].slice(0, 2); go({ i: TOURS.findIndex(t => t.id === id), open: false }) })
    el.querySelectorAll('[data-fav]').forEach(b => b.onclick = () => { const id = b.dataset.fav; s.fav.has(id) ? s.fav.delete(id) : s.fav.add(id); go({}, true) })
    el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => go({ f: b.dataset.f }))
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => go({ i: +b.dataset.i }))
    el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go({ i: Math.max(0, Math.min(TOURS.length - 1, s.i + +b.dataset.step)) }))
    // Поиск (v14): прячем строки, не пересобирая виджет — чтобы не терять фокус в поле
    const q = el.querySelector('[data-q]')
    if (q) { q.focus({ preventScroll: true }); q.oninput = () => { const v = q.value.trim().toLowerCase(); let n = 0
      el.querySelectorAll('[data-id]').forEach(r => { const hit = r.textContent.toLowerCase().includes(v); r.style.display = hit ? '' : 'none'; n += hit })
      el.querySelectorAll('.w-lbl').forEach(l => { let x = l.nextElementSibling, any = false; while (x && x.matches('[data-id]')) { any = any || x.style.display !== 'none'; x = x.nextElementSibling } l.style.display = any ? '' : 'none' })
      el.querySelector('.tt-none').hidden = n > 0 } }
  }
  window.TT = { render }
})()
