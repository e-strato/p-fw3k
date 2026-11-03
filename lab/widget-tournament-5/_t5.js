// Виджет турнира, заход 5 (созвон 22.10, решение 29). Двухуровневый:
// 1) список турниров — первый экран на главной: заголовок «Турниры» мелко, архив ссылкой, без крестика и лого игры в шапке;
//    строка: слева дата / статус (вместо лого турнира), лого игры маленькой иконкой перед названием, бейдж тира, «День 2 · Групповой этап»;
// 2) турнир — клик по строке; в матче / у команды открыт сразу. Слева стрелка «назад» к списку, бургера и крестика нет нигде.
// Внутри: группы — сегментом, таблица с формой (5 матчей), зоны фоном строки, легенда снизу + «i». Плашки матча снизу нет.
// Клик по команде ничего не делает. Сетка — вся, табами Верхняя / Нижняя / Финал; матч открытой страницы — в рамке, под сеткой названия.
// Тот же вход, что у T4: T4.render(узел, { match: { a, b } | null, team, init, opt }) — оболочка лабы ../widget-states/ работает без правок.
(() => {
  const D = window.T4_DATA
  let O = {} // опции открытого виджета (o.opt): v3 — таблица во всю ширину, «Тир 1» словом, линии в сетке, шапки одной высоты; final — вид финала
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const ic = {
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} t5-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} t5-ini">${ini(n)}</span>`
  const isPh = n => /^(Победитель|Проигравший|TBD|TBA)/.test(n)
  const tlogo = (n, cls = 't5-lg') => isPh(n) ? `<span class="${cls} t5-ini">?</span>` : img(D.teams[n] && D.teams[n].logo, n, cls)
  const game = () => img(D.game.logo, D.game.name, 't5-game')
  // Тир: в данных буквы Liquipedia (S — tier 1, A — tier 2, B — tier 3)
  // Тир (O.tier, дирижёр 22.10 — разные подписи): 'color' «Тир 1» цветом по тиру · 'fill' залитый «Тир 1» · 'en' «Tier 1»; v2 — «T1»
  // O.tierEn (v6) — «Tier 1» по-английски в турнире, а в списке коротко «T1» поменьше (short)
  const tier = (t, short) => { const n = { S: 1, A: 2, B: 3 }[t.tier] || '?', sh = short && O.tierEn
    return `<span class="t5-tier ${O.tier ? 't5-tier--' + O.tier + ' t5-tier--' + n : ''} ${sh ? 't5-tier--s' : ''}">${sh ? 'T' : O.tier === 'en' || O.tierEn ? 'Tier ' : O.v3 ? 'Тир ' : 'T'}${n}</span>` }
  // «Групповой этап · день 4» → «День 4 · Групповой этап» — читается слева направо (1.5)
  const stageLine = t => { const p = String(t.stage || '').split(' · '), d = p.findIndex(x => /^день \d+/i.test(x))
    if (d > 0) { const day = p.splice(d, 1)[0]; p.unshift(day[0].toUpperCase() + day.slice(1)) }
    return p.filter(x => !/^Старт /.test(x)).map(x => x[0].toUpperCase() + x.slice(1)).join(' · ') }
  const info = txt => `<button class="t5-inf" data-info="${String(txt).replace(/"/g, '&quot;')}" aria-label="Пояснение">i</button>`

  // ——— Колонка даты / статуса (1.4: вместо лого турнира; вид — разбираем в лабе) ———
  const asOf = (() => { const [d, m, y] = D.asOf.split('.'); return new Date(+y, m - 1, +d) })()
  const day = s => { const [d, m] = s.split('.'); return new Date(asOf.getFullYear(), m - 1, +d) }
  const inDays = s => Math.round((day(s) - asOf) / 864e5)
  const when = t => { const [from, to] = t.dates.split(' – ')
    if (/завершён/.test(t.stage)) return `<b>${to}</b><span>финал</span>`
    if (t.st === 'live') return `<b class="t5-live">LIVE</b><span>до ${to}</span>`
    const n = inDays(from); return `<b>${from}</b><span>${n === 1 ? 'завтра' : n < 7 ? `${n} дн.` : `${Math.round(n / 7)} нед.`}</span>` }

  // ——— Где команда ———
  const zoneOf = (t, place) => { const z = t.zones || {}
    return (z.up || []).includes(place) ? 'up' : (z.mid || []).includes(place) ? 'mid' : (z.down || []).includes(place) ? 'down' : '' }
  const findTeam = (t, n) => { if (t.fmt === 'groups') for (const [g, rows] of Object.entries(t.groups)) { const i = rows.findIndex(r => r[0] === n); if (i >= 0) return { g, place: i + 1 } }
    return null }
  const bracketMatches = t => { if (t.fmt !== 'bracket') return []; const out = []
    for (const key of ['upper', 'lower', 'final']) (t.bracket[key] || []).forEach(([round, ms], ri) => ms.forEach(([a, sa, b, sb, w], mi) => out.push({ key, round, ri, mi, a, sa, b, sb, when: w || '' })))
    return out }
  const has = (t, n) => !!findTeam(t, n) || (t.teams || []).includes(n) || bracketMatches(t).some(m => m.a === n || m.b === n)
  const zoneName = (t, z) => z === 'up' ? ((t.zones.mid || []).length ? 'верхняя сетка' : 'плей-офф') : z === 'mid' ? 'нижняя сетка' : 'вылет'
  // Форма — 5 последних матчей команды (1.11). В данных её нет: пример, стабильный по названию команды
  const form = n => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0
    return [...Array(5)].map((_, i) => (h >> (i * 3)) % 5 < 3 ? 'w' : 'l') }
  const inCtx = (s, n) => s.ctx && (n === s.ctx.a || n === s.ctx.b)

  // ——— Уровень 1: список турниров ———
  const list = s => { const g = (name, st) => { const ts = D.tours.map((t, i) => [t, i]).filter(([t]) => t.st === st && !t.hidden)
      return ts.length ? `<div class="t5-lbl">${name}</div>${ts.map(([t, i]) => `<button class="t5-tr" data-tour="${i}"><span class="t5-when">${when(t)}</span>
        <span class="t5-tr__m"><span class="t5-tr__n">${game()}<b>${t.name}</b>${tier(t, 1)}</span><span class="t5-cap">${stageLine(t) || 'Призовой ' + t.prize}</span></span></button>`).join('')}` : '' }
    return `<div class="t5-hd t5-hd--list"><span class="t5-ttl">Турниры</span><button class="t5-arch">Архив ${ic.next}</button></div>
      <div class="w-scroll"><div class="t5-bd">${g('Идут сейчас', 'live')}${g('Предстоящие', 'soon')}</div></div>` }

  // ——— Уровень 2: турнир ———
  const head = t => `<div class="t5-hd"><button class="t5-ib" data-back aria-label="К списку турниров">${ic.back}</button>
    <span class="t5-hd__t"><span class="t5-tr__n"><b>${t.name}</b>${tier(t)}</span><span class="t5-cap">${stageLine(t) || t.dates}</span></span></div>`
  const seg = (items, cur, key) => items.length > 1 ? `<div class="t5-seg">${items.map(([v, l]) => `<button class="${v === cur ? 'is-on' : ''}" data-${key}="${v}">${l}</button>`).join('')}</div>` : ''
  const table = (t, s, rows) => `<table class="t5-tbl"><thead><tr><th>#</th><th>Команда</th><th>Форма</th><th>В–П</th></tr></thead><tbody>${rows.map(([n, w, l], i) => {
      const z = zoneOf(t, i + 1)
      return `<tr class="${z ? 't5-z--' + z : ''} ${inCtx(s, n) ? 'is-ctx' : ''}"><td>${i + 1}</td><td><span class="t5-tm">${tlogo(n)}<span class="t5-nm">${n}</span></span></td>
        <td><span class="t5-form">${form(n).map(r => `<i class="is-${r}"></i>`).join('')}</span></td><td>${w}–${l}</td></tr>` }).join('')}</tbody></table>`
  const legend = t => t.zones ? `<div class="t5-leg"><span><i class="t5-sq t5-z--up"></i>${zoneName(t, 'up')}</span>${(t.zones.mid || []).length ? `<span><i class="t5-sq t5-z--mid"></i>${zoneName(t, 'mid')}</span>` : ''}${(t.zones.down || []).length ? '<span><i class="t5-sq t5-z--down"></i>вылет</span>' : ''}${t.rule ? info(t.rule) : ''}</div>` : ''
  const groups = (t, s) => { const names = Object.keys(t.groups), g = names.includes(s.g) ? s.g : names[0]
    return seg(names.map(n => [n, 'Группа ' + n]), g, 'g') + table(t, s, t.groups[g]) + legend(t) }
  // Сетка — вся, табами (1.12); матч открытой страницы — в рамке, его команды подписаны под сеткой
  const shortRound = r => r.replace('Четвертьфиналы', '¼').replace(/Полуфинал(ы)?/, '½').replace(/ (ВС|НС)$/, '')
  const focusMatch = (t, s) => { const ms = bracketMatches(t)
    if (s.ctx) { const own = ms.filter(m => inCtx(s, m.a) || inCtx(s, m.b)), both = own.find(m => inCtx(s, m.a) && inCtx(s, m.b))
      return both || own.find(m => m.when === 'live') || own[own.length - 1] }
    return ms.find(m => m.when === 'live') || ms.find(m => m.sa == null && !isPh(m.a)) || ms[ms.length - 1] }
  // v3–v5 — вид финала (O.final): 'card' один матч карточкой с названиями · 'merge' без таба «Финал», гранд-финал — последней колонкой сетки ·
  // 'champ' чемпион крупно, ниже финалист и счёт
  const RU = { upper: 'Верхняя', lower: 'Нижняя', final: 'Финал' }
  const bracket = (t, s) => { const merge = O.final === 'merge', ks = ['upper', 'lower', 'final'].filter(k => (t.bracket[k] || []).length && !(merge && k === 'final')), f = focusMatch(t, s)
    const k = ks.includes(s.bt) ? s.bt : f && ks.includes(f.key) ? f.key : ks[0]
    if (k === 'final' && (O.final === 'card' || O.final === 'champ')) return seg(ks.map(x => [x, RU[x]]), k, 'bt') + finalView(t, s)
    // Колонки: раунды таба; merge — плюс гранд-финал в конце
    const cs = t.bracket[k].map(([r, ms], ri) => ({ key: k, ri, r, ms })).concat(merge && (t.bracket.final || []).length ? t.bracket.final.map(([r, ms], ri) => ({ key: 'final', ri, r, ms })) : [])
    const box = (key, ri, mi, a, sa, b, sb, ci) => { const on = f && f.key === key && f.ri === ri && f.mi === mi, done = sa != null
      return `<div class="t5-bx ${on ? 'is-on' : ''}" data-c="${ci}" data-w="${done ? (sa > sb ? a : b) : ''}" data-ab="${a}|${b}">${[[a, sa, sb], [b, sb, sa]].map(([n, x, y]) => `<span class="${done && x < y ? 'is-lose' : ''}">${tlogo(n, 't5-lg t5-lg--20')}<b>${done ? x : ''}</b></span>`).join('')}</div>` }
    const cols = `<div class="t5-bk" style="--c:${cs.length}">${O.v3 ? '<svg class="t5-ln"></svg>' : ''}${cs.map((c, ci) => `<div class="t5-bk__c"><div class="t5-bk__r">${c.key === 'final' && merge ? 'Гранд-финал' : shortRound(c.r)}</div><div class="t5-bk__ms">${c.ms.map(([a, sa, b, sb], mi) => box(c.key, c.ri, mi, a, sa, b, sb, ci)).join('')}</div></div>`).join('')}</div>`
    const name = f && (f.key === k || (merge && f.key === 'final')) ? `<div class="t5-fm"><span class="t5-cap">${shortRound(f.round)}</span>${[[f.a, f.sa, f.sb], [f.b, f.sb, f.sa]].map(([n, x, y], j) => `<span class="t5-fm__t ${j ? 'is-r' : ''} ${f.sa != null && x < y ? 'is-lose' : ''}">${tlogo(n)}<span class="t5-nm">${n}</span></span>${j ? '' : `<b class="t5-fm__s">${f.sa != null ? f.sa + ':' + f.sb : f.when === 'live' ? '<span class="t5-live">LIVE</span>' : '–'}</b>`}`).join('')}</div>` : ''
    return seg(ks.map(x => [x, RU[x]]), k, 'bt') + cols + name }
  // Таб «Финал» одним матчем: card — карточка с названиями и счётом; champ — чемпион крупно
  const finalView = (t, s) => { const [r, ms] = t.bracket.final[0], [a, sa, b, sb, w] = ms[0], done = sa != null, win = done ? (sa > sb ? a : b) : null, lose = win === a ? b : a
    if (O.final === 'champ' && done) return `<div class="t5-ch">${tlogo(win, 't5-lg t5-lg--48')}<b class="t5-ch__n">${win}</b><span class="t5-cap">Чемпион · ${t.prize}</span></div>
      <div class="t5-ch__ru"><span class="t5-cap">${r}</span><span class="t5-ch__m">${tlogo(win)}<b>${Math.max(sa, sb)}:${Math.min(sa, sb)}</b>${tlogo(lose)}<span class="t5-nm">${lose}</span><span class="t5-cap">2-е место</span></span></div>`
    return `<div class="t5-bk__r">${r} · ${w || ''}</div><div class="t5-fc">${[[a, sa, sb], [b, sb, sa]].map(([n, x, y]) => `<span class="${done && x < y ? 'is-lose' : ''} ${inCtx(s, n) ? 'is-ctx' : ''}">${tlogo(n, 't5-lg t5-lg--24')}<span class="t5-nm">${n}</span><b>${done ? x : ''}</b></span>`).join('')}</div>` }
  // Линии сетки (v3): от матча к матчу следующего раунда, куда ушёл победитель. Мерим offset* — не зависит от zoom доски
  const lines = el => el.querySelectorAll('.t5-ln').forEach(svg => { const bk = svg.parentElement, bx = [...bk.querySelectorAll('.t5-bx')], d = []
    const pos = b => { let x = 0, y = 0, n = b; while (n && n !== bk) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent } return { x, y, w: b.offsetWidth, h: b.offsetHeight } }
    bx.forEach(a => { const w = a.dataset.w; if (!w) return
      const to = bx.find(b => +b.dataset.c === +a.dataset.c + 1 && b.dataset.ab.split('|').includes(w)); if (!to) return
      const p = pos(a), q = pos(to), x1 = p.x + p.w, y1 = p.y + p.h / 2, x2 = q.x, y2 = q.y + q.h / 2, xm = (x1 + x2) / 2
      d.push(`M${x1} ${y1}H${xm}V${y2}H${x2}`) })
    svg.setAttribute('width', bk.offsetWidth); svg.setAttribute('height', bk.offsetHeight); svg.innerHTML = d.map(x => `<path d="${x}"/>`).join('') })
  const soon = (t, s) => `<div class="t5-pass"><div><span class="t5-cap">Даты</span><b>${t.dates}</b></div><div><span class="t5-cap">Призовой</span><b>${t.prize}</b></div></div>
    ${(t.teams || []).length ? `<div class="t5-lbl">Участники · ${t.teams.length}</div>${t.teams.map(n => `<div class="t5-pt ${inCtx(s, n) ? 'is-ctx' : ''}">${tlogo(n)}<span class="t5-nm">${n}</span></div>`).join('')}` : '<div class="t5-cap">Участники пока не объявлены</div>'}`
  const tour = (t, s) => head(t) + `<div class="w-scroll"><div class="t5-bd">${t.fmt === 'groups' ? groups(t, s) : t.fmt === 'bracket' ? bracket(t, s) : soon(t, s)}</div></div>`

  function render(el, o) {
    const s = o.s || (o.s = init(o)); O = o.opt || {}
    el.className = 'w t5' + (s.ctx ? ' t5--ctx' : '') + (O.v3 ? ' t5--v3' : '')
    el.innerHTML = s.t == null ? list(s) : tour(D.tours[s.t], s)
    const go = p => { Object.assign(s, p); render(el, o) }
    el.querySelectorAll('[data-tour]').forEach(b => b.onclick = () => { const t = D.tours[+b.dataset.tour], f = s.ctx && findTeam(t, s.ctx.a); go({ t: +b.dataset.tour, g: f ? f.g : null, bt: null }) })
    el.querySelectorAll('[data-back]').forEach(b => b.onclick = () => go({ t: null }))
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => go({ g: b.dataset.g }))
    el.querySelectorAll('[data-bt]').forEach(b => b.onclick = () => go({ bt: b.dataset.bt }))
    lines(el); if (document.fonts) document.fonts.ready.then(() => el.isConnected && lines(el))
    // «i» — поп-овер под кнопкой; любой следующий клик его закрывает
    el.querySelectorAll('[data-info]').forEach(b => b.onclick = e => { e.stopPropagation(); el.querySelectorAll('.t5-pop').forEach(x => x.remove())
      const W = el.getBoundingClientRect(), z = W.width / el.offsetWidth || 1, r = b.getBoundingClientRect(), p = document.createElement('div')
      p.className = 't5-pop'; p.textContent = b.dataset.info; el.append(p); p.style.top = Math.max(8, (r.top - W.top) / z - p.offsetHeight - 6) + 'px'
      setTimeout(() => document.addEventListener('click', () => p.remove(), { once: true })) })
  }
  // Начало: главная — список; матч — турнир матча и группа его команды; команда — её идущий турнир (нет — ближайший)
  function init(o) {
    const ctx = o.match || (o.team ? { a: o.team, b: null } : null), s = { t: null, g: null, bt: null, ctx }
    if (ctx) { const ts = D.tours.map((t, i) => [t, i]).filter(([t]) => has(t, ctx.a) && (!ctx.b || has(t, ctx.b)))
      const p = ts.find(([t]) => t.st === 'live') || ts[0]
      if (p) { s.t = p[1]; const f = findTeam(p[0], ctx.a); if (f) s.g = f.g } }
    if (o.init && o.init.tid) { s.t = D.tours.findIndex(t => t.id === o.init.tid); const f = ctx && findTeam(D.tours[s.t], ctx.a); s.g = f ? f.g : null } // экран лабы: открыть турнир по id
    return Object.assign(s, o.init)
  }
  window.T4 = { render, data: D, has, findTeam }
})()
