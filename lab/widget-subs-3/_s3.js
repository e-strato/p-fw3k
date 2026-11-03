// Замены v2 по созвону 23.10 (решение 34) — копия логики v18 из widget-subs-2/_s2.js (rstep + list mono + lv badge), старый файл не трогаем.
// Изменено: список — колонка даты U.when слева, значок игры 16, лого 16 у тега (PR — IC), число замен серым без подложки (u-count);
// матч — без табов: команды друг под другом (лого + тег), у каждой только игроки с заменой; Steam ID-чипов и плашки «не сверены» нет;
// роли по-английски (Carry, Mid… / у CS2 — IGL, AWP…), Map 2 вместо «Карта 2». Шаги Кто → Позиция → Срок → Проверь и поиск игрока — как в v18.
// Данные — SUBS2 (widget-subs-2/_data.js + _games.js) + пример _s3data.js; теги и колонка даты — window.U (widgets-unified/_cons.js).
// S3.render(узел, { match: id матча | null, game: где значок игры в списке — 'row' перед командами (v2) · 'groups' разделы по играм (v4) ·
//   'line2' второй строкой под командами с турниром (v5) · 'when' в колонке даты (v6) · 'right' у числа замен (v7); big — лого команд 20 вместо 16 (v8); plainHd — в матче шапка без лого, у команд лого 16 (v9); tint — наведение цветом команд })
(() => {
  const D = window.SUBS2, T = window.T4_DATA
  let PH = false // v9: шапка матча без лого, как в v1; лого — только у заголовков команд, мельче
  let GP = 'row' // где значок игры в списке (дирижёр 23.10: «рядом с лого первой команды странно смотрится»)
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const logo = (n, cls = 's6-lg s3-lg') => { const src = T.teams[n] && T.teams[n].logo; return src ? `<img class="${cls}" src="${src}" alt="" title="${n}">` : `<span class="${cls} s6-ini" title="${n}">${ini(n)}</span>` }
  const lt = n => `<span class="s3-lt">${logo(n)}${U.tagHtml(n)}</span>` // лого вплотную к тегу
  const vs = m => `${lt(m.a)}<span class="s3-dash">—</span>${lt(m.b)}`
  const ic = {
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arr: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0-3-3m3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ok: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    find: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    warn: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2.5 14 13H2L8 2.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6.5V9.5M8 11.2v.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  }
  const M = id => D.matches.find(m => m.id === id)
  const subsOf = m => D.subs.filter(x => x.m === m.id)
  const Cp = t => t ? t[0].toUpperCase() + t.slice(1) : t
  // Игра и роли: роли всегда по-английски (созвон 23.10, п. 0.3); у CS2 — свои
  const gameOf = m => m.game || 'dota2'
  const ROLE = g => D.games[g].roles
  const PS = x => ROLE(gameOf(M(x.m)))
  const gIco = (m, cls = 'u-game') => { const g = D.games[gameOf(m)]; return `<img class="${cls}" src="${g.icon}" alt="" title="${g.name}">` }
  // Состав в базе: ключ — команда, второй состав той же команды — «Команда#cs2» (поле rk у замены)
  const rk = x => x.rk || x.team
  const tm = k => (k || '').replace(/#.*$/, '')
  const roleOf = p => ROLE(/#cs2$/.test(p.team) || String(p.id).length >= 17 ? 'cs2' : 'dota2')[p.pos - 1] // в примере у CS2 Steam ID длинный
  const KIND = { news: 'Заранее', ids: 'В матче · ID не совпал', pos: 'В матче · позиция' }
  const kindText = x => (x.kind === 'news' ? 'Заранее · ' + x.date : x.kind === 'ids' ? 'ID не совпал' : 'Позиция') + (x.map ? ` · Map ${x.map}` : '')
  // Срок замены: что из этого есть у матча — на карту только у серии
  const TERM = [['match', 'На матч'], ['map', 'На карту'], ['event', 'На турнир'], ['date', 'До даты'], ['forever', 'Навсегда'], ['pos', 'Смена позиции']]
  const termText = (x, d) => { const m = M(x.m), k = d.term
    return Cp(k === 'match' ? 'на матч' : k === 'map' ? `с Map ${d.map || x.map || 1}` : k === 'event' ? `на ${m.tour}` : k === 'date' ? `до ${d.to || '…'}` : k === 'forever' ? 'навсегда' : 'смена позиции') }

  // ——— Поиск игрока по базе: ник / Steam ID / ссылка; состав команды — первым (как v18) ———
  const players = () => [...Object.entries(D.rosters).flatMap(([team, r]) => r.map(([n, id], i) => ({ n, team, pos: i + 1, id }))), ...D.base.map(([n, team, pos, id]) => ({ n, team, pos, id }))]
  const byName = n => players().find(p => p.n === n)
  const idOf = q => { const m = /(?:dotabuff\.com\/players|opendota\.com\/players)\/(\d+)/.exec(q) || /^\s*(\d{6,})\s*$/.exec(q); return m ? m[1] : null }
  const search = (q, team) => { const id = idOf(q), t = q.trim().toLowerCase(), all = players()
    const hit = all.filter(p => id ? p.id === id : !t || p.n.toLowerCase().startsWith(t) || p.n.toLowerCase().includes(t))
    return hit.sort((a, b) => (b.team === team) - (a.team === team) || a.pos - b.pos).slice(0, 5) }
  const resRow = (p, team) => `<button class="s6-res" data-pick="${p.n}"><span class="s6-av">${p.n.slice(0, 1).toUpperCase()}</span><span class="s6-res__m"><b>${p.n}</b><span class="s6-cap">${p.team ? U.tag(tm(p.team)) + (p.team === team ? ' · состав' : '') : 'Без команды'} · ${p.id}</span></span><span class="s6-res__p ${p.team === team ? 'is-own' : ''}">${roleOf(p)}</span></button>`
  const drop = (q, team) => { const r = search(q, team), id = idOf(q)
    if (!q.trim()) return `<div class="s6-drop"><div class="s6-drop__hint">Ник, Steam ID или ссылка Dotabuff / OpenDota</div>${r.filter(p => p.team === team).map(p => resRow(p, team)).join('')}</div>`
    return `<div class="s6-drop">${r.map(p => resRow(p, team)).join('')}${r.length ? '' : `<div class="s6-drop__none">${id ? `Игрока со Steam ID ${id} в базе нет` : 'В базе не нашли'}</div>`}
      ${id && !r.length ? `<button class="s6-res s6-res--add" data-add="${id}"><span class="s6-av">+</span><span class="s6-res__m"><b>Добавить в базу</b><span class="s6-cap">Steam ID ${id}</span></span></button>` : !r.length ? '<div class="s6-drop__hint">Вставь Steam ID — добавим нового игрока</div>' : ''}</div>` }
  const field = (s, x) => `<div class="s6-find"><span class="s6-find__i">${ic.find}</span><input class="s6-in" data-q placeholder="Ник, Steam ID или ссылка · ${PS(x)[(s.pos || x.pos) - 1]}" value="${(s.q || '').replace(/"/g, '&quot;')}" autocomplete="off" /></div>`
  const picked = (x, d) => d.who === undefined ? x.in : d.who
  const whoCard = (x, d) => { const n = picked(x, d), p = n && byName(n), add = d.addId
    if (add) return `<div class="s6-who"><span class="s6-av">+</span><span class="s6-res__m"><b>Новый игрок</b><span class="s6-cap">Steam ID ${add} · добавим в базу</span></span><button class="s6-lnk" data-change>Другой</button></div>`
    if (!p) return `<div class="s6-who s6-who--none">${ic.warn}<span class="s6-res__m"><b>Не нашли в базе</b><span class="s6-cap">Steam ID из матча: ${x.seen || '—'}</span></span><button class="s6-lnk" data-change>Найти</button></div>`
    return `<div class="s6-who"><span class="s6-av">${p.n.slice(0, 1).toUpperCase()}</span><span class="s6-res__m"><b>${p.n}</b><span class="s6-cap">${p.team ? U.tag(tm(p.team)) : 'Без команды'} · ${roleOf(p)} · ${p.id}</span></span><button class="s6-lnk" data-change>Другой</button></div>` }
  const termPick = (d, x) => { const m = M(x.m), k = d.term || x.term
    const maps = `<div class="s6-maps"><span class="s6-cap">С Map</span>${[...Array(m.bo)].map((_, i) => `<button class="${(d.map || x.map || 1) === i + 1 ? 'is-on' : ''}" data-map="${i + 1}">${i + 1}</button>`).join('')}</div>`, date = `<input class="s6-date" type="date" data-to value="${d.toIso || ''}" />`
    return `<div class="s6-terms s6-terms--col">${TERM.filter(([v]) => v !== 'map' || m.bo > 1).map(([v, l]) => `<button class="${k === v ? 'is-on' : ''}" data-term="${v}">${l}</button>${k === v && v === 'map' ? maps : k === v && v === 'date' ? date : ''}`).join('')}</div>` }
  const none = m => `<div class="s6-none"><span class="s3-vs u-fit">${vs(m)}</span><b>Замен нет</b><span class="s6-cap">Составы ${U.tag(m.a)} и ${U.tag(m.b)} совпадают с базой</span></div>`
  // Решение по замене: d = { ok | no, who, addId, pos, term, map, to }
  const st = (s, x) => s.d[x.id] || (s.d[x.id] = {})
  const isDone = (s, x) => { const d = s.d[x.id]; return !!(d && (d.ok || d.no)) }
  const wire = (el, s, x, redraw, after) => { if (!x) return; const d = st(s, x)
    const q = el.querySelector('[data-q]'); if (q) { q.oninput = () => { s.q = q.value; const box = el.querySelector('.s6-dropw'); if (box) { box.innerHTML = drop(s.q, rk(x)); bindDrop() } }; if (s.focus) { q.focus(); q.setSelectionRange(q.value.length, q.value.length) } }
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

  // Колонка даты (U.when): LIVE / Map 2 · 03:00 / Сегодня (прошёл ночью) · 15:00 / Сегодня
  const whenOf = m => m.when === 'live' ? U.when({ live: 1, map: m.map }) : U.when({ time: m.when.replace('ночью, ', ''), sub: 'Сегодня' })
  const whenLine = m => m.when === 'live' ? `<b class="u-live">LIVE</b> · Map ${m.map}` : m.done ? `Сегодня · ${m.when.replace('ночью, ', '')} · ${m.done}` : `Сегодня · ${m.when}`

  // tint (дирижёр 23.10) — наведение на строку цветом команд, как у трансферов (../widget-transfers-3/_tr5.js): слева цвет первой, справа — второй
  let TINT = false
  const tone = im => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 24)
    const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, w = 0
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); if (sat < 40) continue; r += d[i] * sat; g += d[i + 1] * sat; b += d[i + 2] * sat; w += sat }
    const R = r / w, G = g / w, B = b / w
    return !w || Math.max(R, G, B) < 100 ? 'rgba(255,255,255,.08)' : `rgba(${Math.round(R)},${Math.round(G)},${Math.round(B)},.18)` } catch (e) { return null } }
  const tint = el => el.querySelectorAll('.s3-r').forEach(r => r.querySelectorAll('.s3-lt').forEach((t, j) => { const im = t.querySelector('img'), k = j ? '--tb' : '--ta'
    if (!im) return r.style.setProperty(k, 'rgba(255,255,255,.08)'); const f = () => { const c = tone(im); if (c) r.style.setProperty(k, c) }; im.complete ? f() : im.addEventListener('load', f, { once: true }) }))

  // ——— Главная: только матчи с новыми расхождениями; LIVE первыми, потом прошедшие, потом предстоящие по времени ———
  const home = (el, s, redraw) => { const rank = m => m.when === 'live' ? 0 : m.done ? 1 : 2, left = m => subsOf(m).filter(x => !isDone(s, x)).length
    const ms = D.matches.filter(m => !s.empty && left(m) > 0).sort((a, b) => rank(a) - rank(b) || (rank(a) ? a.when.slice(-5).localeCompare(b.when.slice(-5)) : 0))
    const teams = m => `<span class="s3-r__t u-fit">${vs(m)}</span>`, n = m => `<span class="u-count">${left(m)}</span>`
    // when: значок у второй строки даты — «LIVE / [ ] Map 2», «03:00 / [ ] Сегодня»
    const whenG = m => whenOf(m).replace(/<span>([^<]*)<\/span><\/span>$/, `<span class="s3-wg">${gIco(m, 's3-gi')}$1</span></span>`)
    const row = m => `<button class="s3-r" data-rm="${m.id}">${GP === 'when' ? whenG(m) : whenOf(m)}${GP === 'row' ? gIco(m) : ''}${GP === 'line2'
      ? `<span class="s3-r__m">${teams(m)}<span class="s6-cap s3-r__g">${gIco(m, 's3-gi')}${D.games[gameOf(m)].name} · ${m.tour}</span></span>` : teams(m)}${GP === 'right' ? `<span class="s3-rt">${gIco(m)}${n(m)}</span>` : n(m)}</button>`
    // groups: разделы «Dota 2» / «CS2», в строке значка нет
    const list = () => GP !== 'groups' ? ms.map(row).join('') : [...new Set(ms.map(gameOf))].map(g => `<div class="s6-lbl s3-gl"><img class="s3-gi" src="${D.games[g].icon}" alt="">${D.games[g].name}</div>${ms.filter(m => gameOf(m) === g).map(row).join('')}`).join('')
    el.innerHTML = `<div class="s6-hd"><b>Замены</b><span class="s6-sp"></span><button class="s6-arch" title="Проверенные замены и все игроки">Архив ${ic.next}</button></div>
      <div class="w-scroll"><div class="s6-bd">${ms.length ? list() : `<div class="s6-none s6-none--all">${ic.ok}<b>Новых расхождений нет</b><span class="s6-cap">Сверенные матчи — в архиве</span></div>`}</div></div>`
    el.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { s.rm = b.dataset.rm; redraw() }); if (TINT) tint(el) }

  // ——— Матч: без табов — команды друг под другом, у каждой только игроки с заменой ———
  const match = (el, s, o, m, redraw) => { const xs = subsOf(m), R = ROLE(gameOf(m))
    const row = x => { const d = st(s, x), done = isDone(s, x), p = d.pos || x.pos
      const pos = `<span class="s8-p s8-p--row"><b>${p}</b><small>${R[p - 1]}</small></span>`
      const who = done ? `<b class="s8-n ${d.no ? 'is-no' : ''}">${d.no ? x.out : d.addId ? 'Новый · ' + d.addId : picked(x, d)}</b>` : `<span class="s8-n s6-swap"><span class="s6-out">${x.out}</span>${ic.arr}<b>${d.addId ? 'Новый' : picked(x, d) || '?'}</b></span>`
      const sub = done ? `<small class="s8-s ${d.no ? '' : 'is-ok'}">${d.no ? 'Замена отклонена' : `Вместо ${x.out} · ${termText(x, d)}`}</small>` : `<small class="s8-s">${kindText(x)}</small>`
      const right = done ? `<button class="s6-undo" data-undo="${x.id}" title="Вернуть">↺</button>` : `<span class="s6-chev">${ic.next}</span>`
      const cls = `s8-r s8-r--a ${done ? (d.no ? 'is-no' : 'is-ok') : 'is-bad'}`
      return done ? `<div class="${cls}">${pos}<span class="s8-m">${who}${sub}</span>${right}</div>` : `<button class="${cls}" data-row="${x.id}">${pos}<span class="s8-m">${who}${sub}</span>${right}</button>` }
    const teams = [m.a, m.b].map(t => [t, xs.filter(x => x.team === t)]).filter(([, l]) => l.length)
    const body = xs.length ? teams.map(([t, l]) => `<div class="s3-team">${lt(t)}</div>${l.map(row).join('')}`).join('') : none(m)
    el.innerHTML = `<div class="s6-hd">${o.match ? `<b>Замены</b><span class="s6-hd__sub">В этом матче</span><span class="s6-sp"></span><button class="s6-arch">Архив ${ic.next}</button>`
      : `<button class="s6-ib" data-back aria-label="Ко всем матчам">${ic.back}</button><span class="s6-hd__m"><b class="u-fit">${PH ? `${U.tagHtml(m.a)}<span class="s3-dash">—</span>${U.tagHtml(m.b)}` : vs(m)}</b><span class="s6-cap">${whenLine(m)} · ${m.tour}</span></span>`}</div>
      <div class="w-scroll"><div class="s6-bd">${body}</div></div>`
    el.querySelectorAll('[data-back]').forEach(b => b.onclick = () => { s.rm = null; redraw() })
    undo(el, s, redraw) }

  // ——— Замена шагами (как v18): Кто → Позиция → Срок → Проверь ———
  const STEPS = ['Кто', 'Позиция', 'Срок', 'Проверь']
  const stepView = (el, s, x, pool, redraw, close, next) => {
    const d = st(s, x), m = M(x.m), i = pool.indexOf(x), step = s.step || 0, who = d.addId ? 'Новый игрок' : picked(x, d), P = PS(x)
    const bodyOf = [
      () => `<div class="s6-q">Кто сыграл вместо <b>${x.out}</b>?</div><div class="s6-cap s6-q__s">${x.kind === 'news' ? `Замена известна заранее · ${x.date}` : x.kind === 'pos' ? x.note : `Steam ID из матча ${x.seen} — не из состава ${U.tag(x.team)}`}</div>
        ${s.search || (!picked(x, d) && !d.addId) ? `${field(s, x)}<div class="s6-dropw">${drop(s.q || '', rk(x))}</div>` : whoCard(x, d)}`,
      () => `<div class="s6-q">На какой позиции?</div><div class="s6-cap s6-q__s">В составе ${x.out} играл ${x.pos} · ${P[x.pos - 1]}</div>
        <div class="s6-pl">${P.map((l, j) => `<button class="${(d.pos || x.pos) === j + 1 ? 'is-on' : ''}" data-pos="${j + 1}"><b>${j + 1}</b>${l}${x.kind === 'pos' && x.from === j + 1 ? '<span class="s6-cap">Его обычная</span>' : ''}</button>`).join('')}</div>`,
      () => `<div class="s6-q">На какой срок?</div><div class="s6-cap s6-q__s">${m.tour} · ${U.tag(m.a)} — ${U.tag(m.b)}${m.bo > 1 ? ` · Bo${m.bo}` : ''}</div>${termPick(d, x)}`,
      () => `<div class="s6-q">Проверь</div><div class="s6-sum"><div>${lt(x.team)}<span class="s6-cap">${U.tag(m.a)} — ${U.tag(m.b)} · ${m.tour}</span></div>
        <dl><dt>Ушёл</dt><dd>${x.out}</dd><dt>Играет</dt><dd><b>${who || '—'}</b>${d.addId ? ` · Steam ID ${d.addId}` : ''}</dd><dt>Позиция</dt><dd>${d.pos || x.pos} · ${P[(d.pos || x.pos) - 1]}</dd><dt>Срок</dt><dd>${termText(x, { ...d, term: d.term || x.term })}</dd></dl></div>`,
    ]
    const can = step !== 0 || picked(x, d) || d.addId
    el.innerHTML = `<div class="s6-hd"><button class="s6-ib" data-close aria-label="К матчу">${ic.back}</button><span class="s6-hd__m"><b>Замена ${i + 1} из ${pool.length}</b><span class="s6-cap">${U.tag(x.team)} · ${KIND[x.kind]}</span></span></div>
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

  // empty — нет ни одного матча с новыми расхождениями (дирижёр 23.10)
  function render(el, o) { const s = o.s = o.s || { d: {}, empty: o.empty }, redraw = () => render(el, o)
    GP = o.game || 'row'; PH = !!o.plainHd; TINT = !!o.tint
    el.className = 'w s6 s7 s8--prow s3' + (o.big ? ' s3--big' : '') + (o.plainHd ? ' s3--phd' : '') // big (v8) — лого команд крупнее
    const x = s.w && D.subs.find(y => y.id === s.w)
    if (x) { const m = M(x.m), pool = subsOf(m)
      el.classList.add('s6--wizard')
      // После решения — следующая непроверенная в матче, нет — к матчу
      return stepView(el, s, x, pool, redraw, () => { s.w = null; if (!o.match) s.rm = m.id; redraw() },
        () => { const nx = pool.find(y => !isDone(s, y)); s.step = 0; s.search = false; s.q = ''; s.w = nx ? nx.id : null; if (!nx && !o.match) s.rm = m.id; redraw() }) }
    const mid = o.match || s.rm
    if (!mid) return home(el, s, redraw)
    match(el, s, o, M(mid), redraw)
    el.querySelectorAll('[data-row]').forEach(b => b.onclick = () => { s.w = b.dataset.row; s.step = 0; s.search = false; s.q = ''; const d = st(s, D.subs.find(y => y.id === s.w)); delete d.ok; delete d.no; redraw() })
  }
  window.S3 = { render, data: D, M, subsOf }
})()
