// Виджет турнира, заход 4 (созвон 21.10, решение 25): помощник центра — без поиска, звезды и ‹ › между турнирами.
// Бургер ≡ — список «Идут сейчас» / «Предстоящие» + «Архив турниров»; клик — провалились в турнир.
// Группы — табами; сетка без скролла: один матч крупно, ‹ › между матчами и «Вся сетка» (отдалить).
// Контекст страницы (o.match) — открыт матч: виджет сам открывает его турнир и подсвечивает обе команды.
// Контекст o.team — открыта команда: в списке только её турниры, в турнире она подсвечена.
// Варианты (o.opt): mark — отметка зон 'bg' фон строки | 'cut' линия-граница | 'num' цвет места;
// stakes — что на кону в матче: 'card' в карточке команды | 'whatif' таблица «если победит» | 'strip' полоса над таблицей;
// v5: home 'top' — виджет никогда не начинает со списка: на главной сразу самый важный турнир (идёт матч, больше призовой),
// у команды — её идущий; список турниров — только по бургеру (как в v1); now — внизу только идущие (LIVE) матчи, открытый первым и выделен:
// квадрат 320×320 под основное не трогаем, каждый LIVE — строка под ним, виджет растёт вниз. liveDemo — только для лабы: сегодняшние считаем идущими.
// v6–v8: compact — таблица без скролла (строки ниже, легенда зон — в заголовке таблицы, правило — подсказкой); важность матча крупно:
// stakes 'hero' — табло фокусного матча сверху (открытый, иначе идущий): команды крупно, вердикт под каждой.
// v9: now 'hero' — то же табло, но внизу: по одному на каждый идущий матч, под квадратом 320, только когда матч идёт.
// v9 (21.10, вечер): now 'dock' — плашка «прилипает» снизу, чуть уже, будто из-под виджета: на главной — идущие (несколько — ‹ › от самого
// важного), нет идущих — ближайший; у команды — её идущий / ближайший; в матче — ничего (он и так открыт).
// hl 'dim' — команды открытого приглушают остальных, без рамок и точек; bracket 'path' — сетка списком: путь команды (обе сетки) или раунд ‹ ›;
// air — больше воздуха: логотипы крупнее, без лишних подложек и рамок.
// v11–v13: плашка — только крупные логотипы, что будет с командами (dockStyle): 'pills' места под логотипами · 'phrase' словами ·
// 'scen' два сценария «если победит …»; dockMatch — в матче плашка показывает открытый матч. «Вся сетка» (allStyle): 'tabs' по сеткам ·
// 'list' раунды строками · 'logos' дерево без счёта, логотипы крупнее.
// v14–v17: dockStyle 'match' — строка матча (логотип · название · LIVE · название · логотип), под названием серым место в таблице;
// наведение / тап по команде раскрывает «Win 3-е → 2-е / Lose 3-е → вылет»; как именно — fx: grow раздвигание · wipe шторка · drop строка вниз · swap смена ·
// v18–v20 — от края блока команды: edge шторка с линией · ride Win / Lose едут на краю шторки · fill заливка без линии, соперник уезжает ·
// v21–v23 slide — три зоны (команда · LIVE · команда): подложка зоны команды растягивается до соперника, LIVE гаснет, у соперника остаётся
// только логотип на месте; ничего не перестраивается. fxv: plain светлая · tone цвет зоны после победы · move Win / Lose въезжают вместе с подложкой;
// fxFull (v24) — подложка на всю высоту плашки, без отступов, прижата к её краю; fxv tint (v25) — подложки нет, фон плашки проявляется
// сплошным оттенком команды (по цвету логотипа) с чёткой границей перед логотипом соперника; tslide (v26) — тот же блок заливается
// от края плашки со стороны команды до соперника, цвет набирается из прозрачности.
// air — ещё и без пояснений текстом (дирижёр 21.10: «всё должно считываться без пояснений»): что нужно объяснить — в кнопке «i» с поп-овером.
// Данные — реальные, window.T4_DATA (_data.js, Liquipedia), логотипы — logos/. T4.render(узел, { match: { a, b } | null, team, opt }).
(() => {
  const D = window.T4_DATA
  const nb = s => String(s || '').replace(/ (\d{3})/g, ' $1')
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const ic = {
    menu: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    up: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 10l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    prev: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    zoomOut: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    zoomIn: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2.5V6H2.5M13.5 6H10V2.5M10 13.5V10h3.5M2.5 10H6v3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  // Логотип: настоящий файл, нет файла — буквы
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} t4-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} t4-ini">${ini(n)}</span>`
  const tlogo = (n, cls = 't4-lg') => /^(Победитель|Проигравший|TBD|TBA)/.test(n) ? `<span class="${cls} t4-ini">?</span>` : img(D.teams[n] && D.teams[n].logo, n, cls)
  const game = () => img(D.game.logo, D.game.name, 't4-game')
  const team = n => D.teams[n] || {}
  const chip = w => w === 'live' ? '<span class="t4-chip t4-chip--live">LIVE</span>' : /^Сегодня/.test(w) ? `<span class="t4-chip t4-chip--today">${w.replace(/^Сегодня,?\s*/, '')}</span>` : `<span class="t4-chip">${w}</span>`

  // Оттенок по логотипу: средний цвет насыщенных пикселей, 18% непрозрачности; серый / не вышло — null
  const logoTone = im => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 24)
    const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, w = 0
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); if (sat < 40) continue; r += d[i] * sat; g += d[i + 1] * sat; b += d[i + 2] * sat; w += sat }
    return w ? `rgba(${Math.round(r / w)},${Math.round(g / w)},${Math.round(b / w)},.22)` : null } catch (e) { return null } }
  // Кнопка «i» — пояснение в маленьком поп-овере (по клику)
  const info = txt => `<button class="t4-inf" data-info="${String(txt).replace(/"/g, '&quot;')}" aria-label="Пояснение">i</button>`

  // ——— Где команда: место в группе / швейцарке и зона ———
  const zoneOf = (t, place) => { const z = t.zones || {}
    return (z.up || []).includes(place) ? 'up' : (z.mid || []).includes(place) ? 'mid' : (z.down || []).includes(place) ? 'down' : '' } // mid — дальше, но в нижнюю сетку
  const findTeam = (t, n) => {
    if (t.fmt === 'groups') for (const [g, rows] of Object.entries(t.groups)) { const i = rows.findIndex(r => r[0] === n); if (i >= 0) return { g, place: i + 1, size: rows.length, row: rows[i] } }
    if (t.fmt === 'swiss') { const i = t.rows.findIndex(r => r[0] === n); if (i >= 0) return { place: i + 1, size: t.rows.length, row: t.rows[i] } }
    return null
  }
  const has = (t, n) => !!findTeam(t, n) || (t.teams || []).includes(n) || bracketMatches(t).some(m => m.a === n || m.b === n)

  // ——— Сетка: все матчи по порядку, у каждого — где он ———
  const bracketMatches = t => { if (t.fmt !== 'bracket') return []
    const out = []
    for (const [side, key] of [['Верхняя сетка', 'upper'], ['Нижняя сетка', 'lower'], ['', 'final']]) (t.bracket[key] || []).forEach(([round, ms], ri) =>
      ms.forEach(([a, sa, b, sb, when], mi) => out.push({ side, key, round, ri, mi, a, sa, b, sb, when: when || '' })))
    return out }
  const isPh = n => /^(Победитель|Проигравший|TBD|TBA)/.test(n)

  // ——— Что на кону: где команда окажется при победе и при поражении ———
  // Прогноз грубый — по сериям в таблице: двигаем только две команды матча, остальные стоят как стоят.
  const better = ([, w, l], [, W, L]) => w - l > W - L || (w - l === W - L && w >= W)
  const project = (rows, win, lose) => {
    const moved = rows.map(r => r[0] === win ? [r[0], r[1] + 1, r[2]] : r[0] === lose ? [r[0], r[1], r[2] + 1] : r)
    const out = moved.filter(r => r[0] !== win && r[0] !== lose)
    for (const r of moved.filter(r => r[0] === win || r[0] === lose)) out.splice(out.filter(x => better(x, r)).length, 0, r)
    return out }
  const rowsOf = (t, n) => { const f = findTeam(t, n); return f ? (f.g ? t.groups[f.g] : t.rows) : null }
  const zoneName = (t, z) => z === 'up' ? ((t.zones.mid || []).length ? 'верхняя сетка' : 'плей-офф') : z === 'mid' ? 'нижняя сетка' : z === 'down' ? 'вылет' : 'вне зон'
  const pending = (t, n) => (t.matches || []).find(m => (m.a === n || m.b === n) && !/· \d+:\d+$/.test(m.stage))
  const stakes = (t, n, m) => {
    const o = m.a === n ? m.b : m.a
    if (t.fmt === 'bracket') { const rs = t.bracket[m.key], next = m.ri < rs.length - 1 ? rs[m.ri + 1][0] : 'Гранд-финал'
      const win = m.key === 'final' ? 'чемпион' : next, lose = m.key === 'upper' ? 'нижняя сетка' : m.key === 'lower' ? 'вылет' : '2-е место'
      const [v, tone] = m.key === 'upper' ? ['Есть право на ошибку', 'mute'] : m.key === 'lower' ? ['Проигрыш — вылет', 'down'] : ['Матч за титул', 'up']
      return { win: { text: win, z: 'up' }, lose: { text: lose, z: m.key === 'upper' ? 'mid' : 'down' }, v, tone } }
    const rows = rowsOf(t, n); if (!rows || !rowsOf(t, o)) return null
    const at = (win, lose) => { const p = project(rows, win, lose).findIndex(r => r[0] === n) + 1, z = zoneOf(t, p); return { p, z, text: `${p}-е · ${zoneName(t, z)}` } }
    const cur = zoneOf(t, rows.findIndex(r => r[0] === n) + 1), w = at(n, o), l = at(o, n)
    const [v, tone] = w.z === l.z ? (w.z === 'up' ? ['Выход уже в кармане', 'up'] : w.z === 'down' ? ['Ничего не теряет', 'mute'] : ['Место не решается', 'mute'])
      : cur === w.z ? ['Обязана выиграть', 'down'] : ['Победа поднимает', 'up']
    return { win: w, lose: l, v, tone } }
  // Матч открытой страницы в этом турнире (группы — из списка матчей, сетка — из сетки)
  const ctxMatch = (t, s) => { if (!s.ctx || !s.ctx.b) return null
    const same = m => (m.a === s.ctx.a && m.b === s.ctx.b) || (m.a === s.ctx.b && m.b === s.ctx.a)
    return t.fmt === 'bracket' ? bracketMatches(t).find(same) : (t.matches || []).find(same) }
  const vd = st => `<span class="t4-vd t4-vd--${st.tone}">${st.v}</span>`
  const ztone = z => z === 'up' ? 'up' : z === 'mid' ? 'mid' : z === 'down' ? 'down' : ''

  // ——— Части ———
  const head = s => {
    const t = s.t != null ? D.tours[s.t] : null
    const btn = `<button class="t4-ib ${s.list ? 'is-on' : ''}" data-list aria-label="${s.list ? 'Закрыть список' : 'Все турниры'}">${s.list ? ic.close : ic.menu}</button>`
    if ((s.list || !t) && s.flt) return `<div class="t4-hd">${btn}${tlogo(s.team, 't4-lg t4-lg--24')}<span class="t4-hd__t"><b>Турниры команды</b><span class="t4-cap">${s.team}</span></span>${game()}</div>`
    if (s.list || !t) return `<div class="t4-hd">${btn}<span class="t4-hd__t"><b>Турниры</b></span>${game()}</div>`
    return `<div class="t4-hd">${btn}${img(t.logo, t.name, 't4-tl')}<span class="t4-hd__t"><b>${t.name}</b><span class="t4-cap">${t.dates} · ${t.stage}</span></span>${game()}</div>`
  }
  // У команды в списке вместо стадии турнира — где она в нём
  const teamAt = (t, n) => { const f = findTeam(t, n)
    return f ? `${f.g ? 'группа ' + f.g + ', ' : ''}${f.place}-е` : t.fmt === 'bracket' ? 'плей-офф' : 'заявлена' }
  const tourRow = (t, i, s) => `<button class="t4-tr" data-tour="${i}">${img(t.logo, t.name, 't4-tl')}<span class="t4-tr__m"><b>${t.name}</b><span class="t4-cap">${t.dates} · ${s.flt ? teamAt(t, s.team) : t.stage}</span></span>${game()}</button>`
  const list = s => {
    const g = (name, st, dot) => { const ts = D.tours.map((t, i) => [t, i]).filter(([t]) => t.st === st && (!s.flt || has(t, s.team)))
      return ts.length ? `<div class="t4-lbl">${dot ? '<span class="t4-dot"></span>' : ''}${name}</div>${ts.map(([t, i]) => tourRow(t, i, s)).join('')}` : '' }
    return `<div class="w-scroll"><div class="t4-bd">${g('Идут сейчас', 'live', true)}${g('Предстоящие', 'soon')}
      ${s.flt ? `<button class="t4-arch" data-flt>Все турниры ${ic.next}</button>` : `<button class="t4-arch" data-arch>Архив турниров ${ic.next}</button>`}</div></div>`
  }
  // v5: внизу только идущие матчи турнира; открытый на странице (у команды — её) первым и выделен
  const nowLine = (t, s) => { if (!s.opt.now || s.opt.now === 'dock' || t.fmt === 'soon') return ''
    const live = m => m.when === 'live' || (s.opt.liveDemo && /^Сегодня/.test(m.when))
    const all = t.fmt === 'bracket' ? bracketMatches(t).filter(m => !isPh(m.a) && !isPh(m.b)) : t.matches || [] // в сетке — её матчи
    const own = ctxMatch(t, s) || (s.ctx && !s.ctx.b && pending(t, s.ctx.a)), ms = all.filter(live).sort((a, b) => (b === own) - (a === own))
    if (!ms.length) return ''
    if (s.opt.now === 'hero') return `<div class="t4-now t4-now--hero">${ms.map(m => heroCard(t, s, m, 'a', m === own)).join('')}</div>`
    return `<div class="t4-now">${ms.map(m => `<a class="t4-now__r ${m === own ? 'is-own' : ''}" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener">${chip('live')}${tlogo(m.a)}<span class="t4-nm">${m.a}</span><span class="t4-cap">—</span>${tlogo(m.b)}<span class="t4-nm">${m.b}</span>${ic.next}</a>`).join('')}</div>` }
  const mk = (s, n) => s.ctx && (n === s.ctx.a ? 'a' : n === s.ctx.b ? 'b' : '')
  // Таблица; prev — места до «если победит» (для стрелок ↑↓)
  const table = (t, s, rows, prev) => { const mark = s.opt.mark || 'bg'
    const thead = s.opt.air ? '' : '<tr><th></th><th></th><th>В–П</th></tr>' // air — «В–П» в строке табов
    return `<table class="t4-tbl t4-tbl--${mark}">${thead}${rows.map(([n, w, l], i) => {
      const z = zoneOf(t, i + 1, rows.length), k = mk(s, n), d = prev ? prev[n] - (i + 1) : 0
      const cut = mark === 'cut' && z && i < rows.length - 1 && zoneOf(t, i + 2) !== z ? `<tr class="t4-cut t4-cut--${z}"><td colspan="3"><span>↑ ${zoneName(t, z)}</span></td></tr>` : ''
      return `<tr data-team="${n}" class="${z && mark === 'bg' ? 't4-z--' + z : ''} ${k ? 't4-ctx t4-ctx--' + k : ''} ${s.pick === n ? 'sel' : ''}"><td>${mark === 'num' ? `<span class="t4-pn t4-pn--${ztone(z)}">${i + 1}</span>` : i + 1}</td>
        <td><span class="t4-tm">${tlogo(n)}<span class="t4-nm">${n}</span>${k ? `<i class="t4-cd t4-cd--${k}"></i>` : ''}${d ? `<i class="t4-dl t4-dl--${d > 0 ? 'up' : 'down'}">${d > 0 ? '↑' : '↓'}${Math.abs(d)}</i>` : ''}</span></td><td>${w}–${l}</td></tr>${cut}` }).join('')}</table>` }
  // Легенда зон (compact) — в строке табов справа, правило турнира в title
  const zoneKey = (t, mark) => !t.zones ? '' : `<span class="t4-zk" title="${t.rule || ''}">${['up', 'mid', 'down'].filter(z => (t.zones[z] || []).length).map(z => `<span><i class="t4-zk__${mark === 'num' ? 'n' : 'b'} t4-zk--${z}"></i>${zoneName(t, z)}</span>`).join('')}</span>`
  const focus = (t, s) => ctxMatch(t, s) || (t.fmt !== 'bracket' && (t.matches || []).find(m => m.when === 'live'))
  // Табло матча — команды, LIVE, вердикт каждой; v6 — сверху для фокусного матча, v9 — внизу ссылкой на каждый идущий
  const heroCard = (t, s, m, tag = 'div', own = false) => { const side = n => { const x = stakes(t, n, m), k = mk(s, n)
      return `<div class="t4-hero__s" ${tag === 'div' ? `data-team="${n}"` : ''}><span class="t4-hero__n">${tlogo(n)}<b class="t4-nm">${n}</b></span>${x ? vd(x) : ''}${k ? `<i class="t4-cd t4-cd--${k}"></i>` : ''}</div>` }
    return `<${tag} class="t4-hero ${own ? 'is-own' : ''}" ${tag === 'a' ? 'href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener"' : ''}>${side(m.a)}<div class="t4-hero__c">${chip(tag === 'a' ? 'live' : m.when)}<span class="t4-cap">${(m.stage || m.round || '').split(' · ')[0]}</span></div>${side(m.b)}</${tag}>` }
  const hero = (t, s) => { const m = s.opt.stakes === 'hero' && t.fmt !== 'bracket' && focus(t, s); return m ? heroCard(t, s, m) : '' }
  // «Если победит»: Сейчас · победа одной · победа другой — таблица пересчитана, у сдвинутых стрелки
  const whatIf = (t, s, rows) => { const m = ctxMatch(t, s)
    if (s.opt.stakes !== 'whatif' || !m || !rows.some(r => r[0] === m.a) || !rows.some(r => r[0] === m.b)) return table(t, s, rows)
    const wi = s.wi || 0, prev = Object.fromEntries(rows.map((r, i) => [r[0], i + 1]))
    const b = (i, inner) => `<button class="${wi === i ? 'is-on' : ''}" data-wi="${i}">${inner}</button>`
    return `<div class="t4-wi">${b(0, 'Сейчас')}${[m.a, m.b].map((n, i) => b(i + 1, `${tlogo(n, 't4-lg t4-lg--16')}<span class="t4-nm">${n}</span>`)).join('')}</div>
      ${wi ? `<div class="t4-cap t4-wi__c">Если побеждает ${wi === 1 ? m.a : m.b}</div>` : ''}
      ${table(t, s, wi ? project(rows, wi === 1 ? m.a : m.b, wi === 1 ? m.b : m.a) : rows, wi ? prev : null)}` }
  // Полоса «на кону» над таблицей: по строке на команду открытого матча
  const strip = (t, s) => { const m = s.opt.stakes === 'strip' && ctxMatch(t, s); if (!m) return ''
    const st = [m.a, m.b].map(n => [n, stakes(t, n, m)]).filter(([, x]) => x); if (!st.length) return ''
    return `<div class="t4-sk"><div class="t4-sk__h t4-cap">${m.sa != null ? 'Что было на кону' : 'Что на кону'}</div>${st.map(([n, x]) => `<div class="t4-sk__r"><i class="t4-cd t4-cd--${mk(s, n)}"></i>${tlogo(n)}${vd(x)}
      <span class="t4-sk__o"><span class="t4-${ztone(x.win.z)}">✓ ${x.win.p || ''}${x.win.p ? '-е' : x.win.text}</span><span class="t4-${ztone(x.lose.z)}">✕ ${x.lose.p || ''}${x.lose.p ? '-е' : x.lose.text}</span></span></div>`).join('')}</div>` }
  const groups = (t, s) => { const names = Object.keys(t.groups), g = names.includes(s.g) ? s.g : names[0]
    // Одна группа (air) — заголовок «Положение команд» в том же месте и виде, что выбранный таб: строка не пустая (дирижёр 21.10)
    const tabs = names.length > 1 ? names.map(n => `<button class="${n === g ? 'is-on' : ''}" data-g="${n}">Группа ${n}</button>`).join('') : s.opt.air ? '<span class="t4-tabs__one">Положение команд</span>' : ''
    return (tabs || s.opt.compact || s.opt.air ? `<div class="t4-tabs">${tabs}${s.opt.compact ? zoneKey(t, s.opt.mark || 'bg') : ''}${s.opt.air ? '<span class="t4-wl">В–П</span>' : ''}</div>` : '')
      + whatIf(t, s, t.groups[g]) }
  const legend = (t, s) => s.opt.mark === 'cut' || s.opt.compact ? '' : t.zones ?`<div class="t4-leg"><span><i class="t4-sq t4-z--up"></i>проходит</span>${(t.zones.mid || []).length ? '<span><i class="t4-sq t4-z--mid"></i>в нижнюю сетку</span>' : ''}${(t.zones.down || []).length ? '<span><i class="t4-sq t4-z--down"></i>вылет</span>' : ''}${s.opt.air && t.rule ? info(t.rule) : ''}</div>` : ''
  const soon = (t, s) => `<div class="t4-pass"><div><span class="t4-cap">Даты</span><b>${t.dates}</b></div><div><span class="t4-cap">Призовой</span><b>${nb(t.prize)}</b></div></div>
    ${(t.teams || []).length ? `<div class="t4-lbl">Участники · ${t.teams.length}</div>${t.teams.map(n => `<div class="t4-pt ${s.ctx && (n === s.ctx.a || n === s.ctx.b) ? 't4-ctx t4-ctx--' + mk(s, n) : ''}" data-team="${n}">${tlogo(n)}<span class="t4-nm">${n}</span></div>`).join('')}` : '<div class="t4-cap">Участники пока не объявлены</div>'}`

  // Сетка: один матч крупно + ‹ › между матчами; «Вся сетка» — отдалить
  const navList = (t, s) => { const all = bracketMatches(t).filter(m => !isPh(m.a) || !isPh(m.b))
    const focus = s.ctx && all.filter(m => [m.a, m.b].some(n => n === s.ctx.a || n === s.ctx.b))
    return focus && focus.length ? focus : all }
  const startIdx = (t, s) => { const l = navList(t, s), c = s.ctx && l.findIndex(m => (m.a === s.ctx.a && m.b === s.ctx.b) || (m.a === s.ctx.b && m.b === s.ctx.a))
    if (c != null && c >= 0) return c
    const live = l.findIndex(m => m.when === 'live'); if (live >= 0) return live
    const nx = l.findIndex(m => m.sa == null); return nx >= 0 ? nx : l.length - 1 }
  const side = (s, n, x, y, done) => { const k = mk(s, n)
    return `<div class="t4-bm__r ${done && x < y ? 'is-lose' : ''} ${k ? 't4-ctx t4-ctx--' + k : ''}" ${isPh(n) ? '' : `data-team="${n}"`}>${tlogo(n, 't4-lg t4-lg--24')}<span class="t4-nm">${n}</span>${k ? `<i class="t4-cd t4-cd--${k}"></i>` : ''}<b>${done ? x : ''}</b></div>` }
  const bracketOne = (t, s) => { const l = navList(t, s), i = Math.min(s.bi ?? startIdx(t, s), l.length - 1), m = l[i]
    if (!m) return '<div class="t4-cap">Сетка ещё не сформирована</div>'
    const done = m.sa != null
    return `<div class="t4-bm"><div class="t4-bm__cap">${m.side ? m.side + ' · ' : ''}${m.round}</div>
      <div class="t4-bm__card">${side(s, m.a, m.sa, m.sb, done)}${side(s, m.b, m.sb, m.sa, done)}</div>
      <div class="t4-bm__when">${done ? '<span class="t4-cap">Сыгран</span>' : m.when ? chip(m.when) : '<span class="t4-cap">Время уточняется</span>'}</div></div>` }
  // Вся сетка: ячейки только с логотипами и счётом, ужата по ширине виджета; клик по матчу — приблизить к нему
  const bracketAll = (t, s) => { const l = navList(t, s), all = bracketMatches(t), sty = s.opt.allStyle
    if (sty === 'list') return allList(t, s)
    const lg = sty === 'logos' || sty === 'tabs' ? 't4-lg t4-lg--20' : 't4-lg t4-lg--16'
    const col = (round, ms, key, ri) => `<div class="t4-bc"><div class="t4-bc__r">${sty === 'tabs' ? shortRound(round) : round}</div>${sty === 'tabs' ? '<div class="t4-bc__ms">' : ''}${ms.map(([a, sa, b, sb, w], mi) => {
      const j = l.findIndex(m => m.key === key && m.ri === ri && m.mi === mi), hl = s.ctx && [a, b].some(n => n === s.ctx.a || n === s.ctx.b)
      const go = s.opt.bracket === 'path' ? `data-rr="${rounds(t).findIndex(r => r.k === key && r.ri === ri)}"` : j >= 0 ? `data-bi="${j}"` : 'disabled'
      return `<button class="t4-bx ${hl ? 'is-hl' : ''} ${w === 'live' ? 'is-live' : ''}" ${go}>${[[a, sa, sb], [b, sb, sa]].map(([n, x, y]) =>
        `<span class="${sa != null && x < y ? 'is-lose' : ''}">${tlogo(n, lg)}${sty === 'logos' ? '' : `<b>${sa != null ? x : ''}</b>`}</span>`).join('')}</button>` }).join('')}${sty === 'tabs' ? '</div>' : ''}</div>`
    const branch = (key, name) => (t.bracket[key] || []).length ? `<div class="t4-bb">${name ? `<div class="t4-bb__n">${name}</div>` : ''}<div class="t4-bb__cols" style="--c:${t.bracket[key].length}">${t.bracket[key].map(([r, ms], ri) => col(r, ms, key, ri)).join('')}</div></div>` : ''
    if (sty === 'tabs') { const ks = ['upper', 'lower', 'final'].filter(k => (t.bracket[k] || []).length), own = s.ctx && all.filter(m => [m.a, m.b].some(n => n === s.ctx.a || n === s.ctx.b)).sort((a, b) => when(b) - when(a))[0], k = ks.includes(s.bt) ? s.bt : own ? own.key : ks[0] // по умолчанию — сетка последнего матча команды
      return `<div class="t4-tabs">${ks.map(x => `<button class="${x === k ? 'is-on' : ''}" data-bt="${x}">${{ upper: 'Верхняя', lower: 'Нижняя', final: 'Финал' }[x]}</button>`).join('')}</div><div class="t4-ball t4-ball--tabs">${branch(k, '')}</div>` }
    return `<div class="t4-ball ${sty === 'logos' ? 't4-ball--logos' : ''}" style="--n:${all.length}">${branch('upper', 'Верхняя сетка')}${branch('lower', 'Нижняя сетка')}${branch('final', 'Финал')}</div>` }
  // «Вся сетка» строками по сеткам: заголовок сетки, раунд · матчи «логотип счёт логотип», проигравший бледнее; клик — к раунду
  const allList = (t, s) => { const rs = rounds(t), name = { upper: 'Верхняя сетка', lower: 'Нижняя сетка', final: 'Финал' }
    return rs.map((r, i) => `${i === 0 || rs[i - 1].k !== r.k ? `<div class="t4-rl__h">${name[r.k]}</div>` : ''}<div class="t4-rl"><span class="t4-rl__r">${shortRound(r.r)}</span><span class="t4-rl__ms">${bracketMatches(t).filter(m => m.key === r.k && m.ri === r.ri).map(m => {
      const hl = s.ctx && [m.a, m.b].some(n => n === s.ctx.a || n === s.ctx.b), done = m.sa != null, lose = n => done && (n === m.a ? m.sa < m.sb : m.sb < m.sa) ? 'is-lose' : ''
      return `<button class="t4-rm ${hl ? 'is-hl' : ''}" data-rr="${i}"><span class="${lose(m.a)}" title="${m.a}">${tlogo(m.a, 't4-lg t4-lg--20')}</span><b>${done ? m.sa + ':' + m.sb : '–'}</b><span class="${lose(m.b)}" title="${m.b}">${tlogo(m.b, 't4-lg t4-lg--20')}</span></button>` }).join('')}</span></div>`).join('') }
  const bracketBar = (t, s) => { if (s.opt.bracket === 'path') return pathBar(t, s)
    const l = navList(t, s), i = Math.min(s.bi ?? startIdx(t, s), l.length - 1)
    return `<div class="t4-bar">${s.all ? '<span class="t4-cap">Нажми на матч — приблизить</span>'
      : `<button class="t4-ib" data-bs="-1" ${i > 0 ? '' : 'disabled'} aria-label="Предыдущий матч">${ic.prev}</button><span class="t4-cap t4-bar__n">Матч ${i + 1} из ${l.length}${s.ctx && l.length < bracketMatches(t).length ? ' · этих команд' : ''}</span><button class="t4-ib" data-bs="1" ${i < l.length - 1 ? '' : 'disabled'} aria-label="Следующий матч">${ic.next}</button>`}
      <button class="t4-zb" data-all>${s.all ? ic.zoomIn + 'К матчу' : ic.zoomOut + 'Вся сетка'}</button></div>` }

  // ——— v9: сетка списком ———
  // Раунды по порядку; дата матча «dd.mm, hh:mm» — для пути команды по времени
  const rounds = t => ['upper', 'lower', 'final'].flatMap(k => (t.bracket[k] || []).map(([r], ri) => ({ k, ri, r })))
  const when = m => { const x = /(\d\d)\.(\d\d), (\d\d):(\d\d)/.exec(m.when || ''); return x ? +(x[2] + x[1] + x[3] + x[4]) : m.when === 'live' ? 1e9 : 2e9 }
  const shortRound = r => r.replace('Четвертьфиналы', '¼').replace(/Полуфинал(ы)?/, '½')
  const curRound = (t, rs) => { const ms = bracketMatches(t), at = f => rs.findIndex(r => ms.some(m => m.key === r.k && m.ri === r.ri && f(m)))
    const i = at(m => m.when === 'live'); if (i >= 0) return i; const j = at(m => m.sa == null && !isPh(m.a)); return j >= 0 ? j : rs.length - 1 }
  // Путь команды (обе сетки) / матчи этих команд; без контекста — матчи раунда, ‹ › между раундами
  const bracketList = (t, s) => { const all = bracketMatches(t).filter(m => !isPh(m.a) || !isPh(m.b))
    let ms = s.ctx ? all.filter(m => [m.a, m.b].some(n => n === s.ctx.a || n === s.ctx.b)).sort((a, b) => when(a) - when(b)) : []
    let cap = s.ctx ? (s.ctx.b ? 'Матчи этих команд' : `Путь ${s.ctx.a}`) : ''
    if (!ms.length) { const rs = rounds(t), r = rs[Math.min(s.ri ?? curRound(t, rs), rs.length - 1)]; ms = all.filter(m => m.key === r.k && m.ri === r.ri); cap = '' }
    const story = s.ctx && !s.ctx.b ? pathStory(s.ctx.a, ms) : ''
    return (cap ? `<div class="t4-pl">${cap}${s.opt.air && story ? info(story) : ''}</div>` : '') + ms.map(m => pathRow(t, s, m)).join('') + (story && !s.opt.air ? `<div class="t4-story">${story}</div>` : '') }
  // Почему команда в обеих сетках — одной фразой в конце пути
  const pathStory = (n, ms) => { const res = m => m.sa == null ? null : (m.a === n ? m.sa > m.sb : m.sb > m.sa), opp = m => m.a === n ? m.b : m.a, out = []
    const ul = ms.find(m => m.key === 'upper' && res(m) === false); if (ul) out.push(`Проиграла ${opp(ul)} в матче «${shortRound(ul.round)}» — по правилам ушла в нижнюю сетку, там ещё один шанс.`)
    const ll = ms.find(m => m.key === 'lower' && res(m) === false); if (ll) out.push(`Проиграла в нижней сетке, в матче «${shortRound(ll.round)}» — вылет.`)
    else if (ul && ms.some(m => m.key === 'lower' && res(m)) && ms.some(m => m.key === 'final')) out.push('Через нижнюю сетку вернулась в гранд-финал.')
    const f = ms.find(m => m.key === 'final'); if (f && res(f) != null) out.push(res(f) ? 'Выиграла гранд-финал — чемпион.' : `Проиграла гранд-финал ${f.a === n ? f.sa + ':' + f.sb : f.sb + ':' + f.sa} — 2-е место.`)
    return out.join(' ') }
  const pathRow = (t, s, m) => { if (s.ctx && !s.ctx.b && m.b === s.ctx.a) m = { ...m, a: m.b, b: m.a, sa: m.sb, sb: m.sa } // команда пути — всегда слева
    const done = m.sa != null, w = done ? (m.sa > m.sb ? m.a : m.b) : null
    const tm = (n, r) => `<span class="t4-pr__t ${r ? 'is-r' : ''} ${done && n !== w ? 'is-lose' : ''}" ${isPh(n) ? '' : `data-team="${n}"`}>${tlogo(n, 't4-lg t4-lg--24')}<span class="t4-nm">${n}</span></span>`
    return `<div class="t4-pr ${s.ctx && [m.a, m.b].some(n => n === s.ctx.a || n === s.ctx.b) ? 't4-ctx' : ''}"><span class="t4-pr__r">${shortRound(m.round)}</span>${tm(m.a)}<b class="t4-pr__s">${done ? m.sa + ':' + m.sb : chip(m.when === 'live' ? 'live' : m.when || 'TBD')}</b>${tm(m.b, 1)}</div>` }
  const pathBar = (t, s) => { const rs = rounds(t), i = Math.min(s.ri ?? curRound(t, rs), rs.length - 1), path = s.ctx && bracketMatches(t).some(m => [m.a, m.b].some(n => n === s.ctx.a || n === s.ctx.b))
    return `<div class="t4-bar">${s.all ? `<span class="t4-cap">${s.opt.air ? '' : 'Нажми на матч — к его раунду'}</span>` : path ? '<span class="t4-cap t4-bar__n"></span>'
      : `<button class="t4-ib" data-rs="-1" ${i > 0 ? '' : 'disabled'} aria-label="Предыдущий раунд">${ic.prev}</button><span class="t4-cap t4-bar__n">${rs[i].k === 'upper' ? 'Верхняя · ' : rs[i].k === 'lower' ? 'Нижняя · ' : ''}${shortRound(rs[i].r)}</span><button class="t4-ib" data-rs="1" ${i < rs.length - 1 ? '' : 'disabled'} aria-label="Следующий раунд">${ic.next}</button>`}
      <button class="t4-zb" data-all>${s.all ? ic.zoomIn + 'Назад' : ic.zoomOut + 'Вся сетка'}</button></div>` }

  // ——— v9: плашка матча снизу ———
  // Важность матча — по вердиктам обеих команд: на кону титул / вылет / «обязана» выше, чем «ничего не теряет»
  const weight = { 'Матч за титул': 4, 'Проигрыш — вылет': 3, 'Обязана выиграть': 3, 'Победа поднимает': 2 }
  const importance = (t, m) => [m.a, m.b].reduce((x, n) => { const st = stakes(t, n, m); return x + (st ? weight[st.v] || 0 : 0) }, 0)
  const isLive = (s, m) => m.when === 'live' || (s.opt.liveDemo && /^Сегодня/.test(m.when))
  const dockList = (t, s) => { if (s.ctx && s.ctx.b) { if (!s.opt.dockMatch) return [] // v10: в матче — ничего, он и так открыт; v11–v13 — открытый матч
      const m = (t.fmt === 'bracket' ? bracketMatches(t) : t.matches || []).find(m => (m.a === s.ctx.a && m.b === s.ctx.b) || (m.a === s.ctx.b && m.b === s.ctx.a)); return m ? [m] : [] }
    const all = (t.fmt === 'bracket' ? bracketMatches(t).filter(m => !isPh(m.a) && !isPh(m.b)) : t.matches || []).filter(m => !(s.ctx && m.a !== s.ctx.a && m.b !== s.ctx.a) )
    const live = all.filter(m => isLive(s, m)).map((m, i) => [m, importance(t, m), i]).sort((a, b) => b[1] - a[1] || a[2] - b[2]).map(x => x[0])
    if (live.length) return s.ctx ? live.slice(0, 1) : live
    const next = all.filter(m => m.sa == null && !/· \d+:\d+$/.test(m.stage || '') && m.when).sort((a, b) => when(a) - when(b))[0]
    return next ? [next] : [] }
  const outcome = (t, n, m) => { const x = stakes(t, n, m); if (!x) return ''
    const z = o => o.p ? `${o.p}-е · ${zoneName(t, o.z)}` : o.text
    // Зона та же при любом исходе — одной строкой: оба места и зона
    if (x.win.z === x.lose.z && x.win.p) return `<span class="t4-oc t4-oc--${ztone(x.win.z)}">✓ ${x.win.p}-е ✕ ${x.lose.p}-е · ${zoneName(t, x.win.z)}</span>`
    return `<span class="t4-oc t4-oc--${ztone(x.win.z)}">✓ ${z(x.win)}</span><span class="t4-oc t4-oc--${ztone(x.lose.z)}">✕ ${z(x.lose)}</span>` }
  const dock = s => { const t = s.t != null ? D.tours[s.t] : null; if (!t) return ''
    const ms = dockList(t, s); if (!ms.length) return ''
    const i = Math.min(s.di || 0, ms.length - 1), m = ms[i]
    // Команда — крупный логотип без названия (название — в подсказке) и где она встанет сразу после матча: ✓ при победе, ✕ при поражении
    const side = (n, r) => `<span class="t4-dk__s ${r ? 'is-r' : ''}" title="${n}">${tlogo(n, 't4-lg t4-lg--36')}<span class="t4-dk__n">${outcome(t, n, m)}</span></span>`
    const what = s.ctx && s.ctx.b ? 'Открытый матч' : isLive(s, m) ? (ms.length > 1 ? 'Идут сейчас' : 'Идёт сейчас') : 'Ближайший матч'
    const note = { pills: ' · место после матча: ✓ победа, ✕ поражение', phrase: '', scen: ' · места после матча' }[s.opt.dockStyle] ?? ' · места после матча'
    const body = s.opt.dockStyle ? dockBody(t, s, m) : `<a class="t4-dk__m" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener">${side(m.a)}<span class="t4-dk__c">${chip(isLive(s, m) ? 'live' : m.when)}</span>${side(m.b, 1)}</a>`
    const hchip = s.opt.dockStyle === 'phrase' ? (m.sa != null ? `<b class="t4-cap">${m.sa}:${m.sb}</b>` : chip(isLive(s, m) ? 'live' : m.when)) : ''
    const tip = { pills: '✓ — место после победы, ✕ — после поражения. Цвет — зона', scen: 'Места обеих команд, если победит одна или другая' }[s.opt.dockStyle] || ''
    if (s.opt.air) { const sw = s.opt.switch || 'arrows', many = ms.length > 1, title = many ? `<span class="t4-dk__t">${what}</span>` : ''
      // Переключение между идущими — только кликом (наведение занято раскрытием): arrows ‹ 1/4 › · dots точки снизу · chips мини-пары логотипов сверху ·
      // list «4 ▾» — по клику список всех идущих поверх строки · v18–v20 — сбоку от строки: clock ▲▼ с прокруткой как на часах ·
      // vdots точки столбиком · sides ‹ › по краям строки
      const nav = !many ? '' : sw === 'arrows' ? `<button class="t4-ib" data-ds="-1" ${i > 0 ? '' : 'disabled'} aria-label="Предыдущий матч">${ic.prev}</button><span class="t4-cap">${i + 1} / ${ms.length}</span><button class="t4-ib" data-ds="1" ${i < ms.length - 1 ? '' : 'disabled'} aria-label="Следующий матч">${ic.next}</button>`
        : sw === 'list' ? `<button class="t4-dk__more ${s.dl ? 'is-on' : ''}" data-dl>${i + 1} из ${ms.length} ${s.dl ? ic.close : ic.next}</button>`
        : sw === 'chips' ? `<span class="t4-dk__chips">${ms.map((x, j) => `<button class="t4-dk__pair ${j === i ? 'is-on' : ''}" data-di="${j}" title="${x.a} — ${x.b}">${tlogo(x.a, 't4-lg')}${tlogo(x.b, 't4-lg')}</button>`).join('')}</span>` : ''
      const head = hchip || title || nav ? `<div class="t4-dk__h">${hchip}${sw === 'chips' ? '' : title}<span class="t4-sp"></span>${nav}</div>` : ''
      const step = (d, icon, lbl) => `<button class="t4-ib" data-ds="${d}" ${(d < 0 ? i > 0 : i < ms.length - 1) ? '' : 'disabled'} aria-label="${lbl}">${icon}</button>`
      const roll = s.dir ? ` t4-roll t4-roll--${s.dir > 0 ? 'dn' : 'up'}` : ''; s.dir = 0 // «часы»: новый матч въезжает сверху / снизу один раз
      // vclock — ▲ 1/4 ▼ на месте стрелок v14 (в шапке справа), матч прокручивается вверх-вниз
      if (many && sw === 'vclock') return `<div class="t4-dock"><i class="t4-dk__bg is-a"></i><i class="t4-dk__bg is-b"></i>${tip ? info(tip) : ''}<div class="t4-dk__h">${title}<span class="t4-sp"></span>${step(-1, ic.up, 'Предыдущий матч')}<span class="t4-cap">${i + 1} / ${ms.length}</span>${step(1, ic.down, 'Следующий матч')}</div><div class="t4-dk__win${roll}">${body}</div></div>`
      if (many && ['clock', 'vdots', 'sides'].includes(sw)) {
        const side = sw === 'clock' ? `<span class="t4-dk__v">${step(-1, ic.up, 'Предыдущий матч')}<span class="t4-cap">${i + 1}/${ms.length}</span>${step(1, ic.down, 'Следующий матч')}</span>`
          : sw === 'vdots' ? `<span class="t4-dk__v t4-dk__vd">${ms.map((_, j) => `<button class="${j === i ? 'is-on' : ''}" data-di="${j}" aria-label="Матч ${j + 1}"></button>`).join('')}</span>` : ''
        const row = `<div class="t4-dk__row">${sw === 'sides' ? step(-1, ic.prev, 'Предыдущий матч') : ''}<div class="t4-dk__win${roll}">${body}</div>${sw === 'sides' ? step(1, ic.next, 'Следующий матч') : side}</div>`
        return `<div class="t4-dock"><i class="t4-dk__bg is-a"></i><i class="t4-dk__bg is-b"></i>${tip ? info(tip) : ''}<div class="t4-dk__h">${title}</div>${row}</div>` }
      const dots = many && sw === 'dots' ? `<div class="t4-dk__dots">${ms.map((_, j) => `<button class="${j === i ? 'is-on' : ''}" data-di="${j}" aria-label="Матч ${j + 1}"></button>`).join('')}</div>` : ''
      const main = many && sw === 'list' && s.dl ? `<div class="t4-dk__list">${ms.map((x, j) => `<button class="${j === i ? 'is-on' : ''}" data-di="${j}">${tlogo(x.a, 't4-lg t4-lg--20')}<span class="t4-nm">${x.a}</span><span class="t4-cap">—</span><span class="t4-nm">${x.b}</span>${tlogo(x.b, 't4-lg t4-lg--20')}</button>`).join('')}</div>` : body
      return `<div class="t4-dock"><i class="t4-dk__bg is-a"></i><i class="t4-dk__bg is-b"></i>${tip ? info(tip) : ''}${head}${main}${dots}</div>` }
    return `<div class="t4-dock">${ms.length < 2 ? `<div class="t4-dk__h"><span class="t4-cap">${what}${note}</span>${hchip}</div>` : ''}${ms.length > 1 ? `<div class="t4-dk__h"><span class="t4-cap">${what}${note}</span>${hchip}<button class="t4-ib" data-ds="-1" ${i > 0 ? '' : 'disabled'} aria-label="Предыдущий матч">${ic.prev}</button><span class="t4-cap">${i + 1} / ${ms.length}</span><button class="t4-ib" data-ds="1" ${i < ms.length - 1 ? '' : 'disabled'} aria-label="Следующий матч">${ic.next}</button></div>` : ''}
      ${body}</div>` }
  // v11–v13: тело плашки — крупные логотипы без названий + что будет с командами, по-своему в каждой версии
  const dockBody = (t, s, m) => { const st = s.opt.dockStyle, mini = n => tlogo(n, 't4-lg')
    const L = n => `<span class="t4-dkl" title="${n}">${tlogo(n, 't4-lg t4-lg--44')}</span>`
    const mid = `<span class="t4-dk__c">${m.sa != null ? `<b class="t4-dk__sc">${m.sa}:${m.sb}</b>` : chip(isLive(s, m) ? 'live' : m.when)}</span>`
    const link = inner => `<a class="t4-dk__m t4-dk--${st}" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener">${inner}</a>`
    if (st === 'match') { // строка матча; наведение / тап по команде — раскрывается, соперник — маленький логотип (наведи — переключится)
      const side = (n, r) => { const x = stakes(t, n, m), rows = rowsOf(t, n), now = rows ? rows.findIndex(q => q[0] === n) + 1 : 0
        const cur = now ? zoneOf(t, now) : null, to = (y, lose) => y.p ? (lose && y.z !== cur ? zoneName(t, y.z) : `${y.p}-е`) : y.text
        const oc = x ? `<span class="t4-mx__oc"><span class="t4-${ztone(x.win.z)}">Win ${now ? now + '-е → ' : ''}${to(x.win)}</span><span class="t4-${ztone(x.lose.z)}">Lose ${now ? now + '-е → ' : ''}${to(x.lose, 1)}</span></span>` : ''
        const ride = s.opt.fx === 'ride' // Win / Lose едут на краю шторки — живут внутри неё
        const tone = x && { up: 'rgba(34,197,94,.16)', mid: 'rgba(245,158,11,.16)', down: 'rgba(239,68,68,.16)' }[x.win.z] // цвет подложки — зона после победы (slide tone)
        return `<span class="t4-mx__s ${r ? 'is-r' : ''}" tabindex="0" ${tone ? `style="--tone:${tone}"` : ''}><i class="t4-mx__wp">${ride ? oc : ''}</i>${tlogo(n, 't4-lg t4-lg--28')}<span class="t4-mx__n"><b class="t4-nm">${n}</b>${now ? `<span class="t4-mx__w">${now}-е место</span>` : ''}</span>${ride ? '' : oc}</span>` }
      return `<div class="t4-mx" data-fx="${s.opt.fx || 'grow'}" ${s.opt.fxv ? `data-fxv="${s.opt.fxv}"` : ''} ${s.opt.fxFull ? 'data-full' : ''}>${side(m.a)}<a class="t4-mx__c" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener">${m.sa != null ? `<b class="t4-dk__sc">${m.sa}:${m.sb}</b>` : chip(isLive(s, m) ? 'live' : m.when)}</a>${side(m.b, 1)}</div>` }
    if (st === 'pills') { // места кружками под логотипом: ✓ после победы, ✕ после поражения, цвет — зона
      const pp = n => { const x = stakes(t, n, m); if (!x) return ''; const v = o => o.p ? o.p + '-е' : o.text
        return `<span class="t4-pp"><i class="t4-pp--${ztone(x.win.z)}">✓ ${v(x.win)}</i><i class="t4-pp--${ztone(x.lose.z)}">✕ ${v(x.lose)}</i></span>` }
      return link(`<span class="t4-dkc">${tlogo(m.a, 't4-lg t4-lg--28')}${pp(m.a)}</span>${mid}<span class="t4-dkc is-r">${tlogo(m.b, 't4-lg t4-lg--28')}${pp(m.b)}</span>`) }
    const top = `<span class="t4-dkt">${L(m.a)}${mid}${L(m.b)}</span>`
    if (st === 'phrase') { // по фразе на команду: мини-логотип вместо названия
      const say = n => { const x = stakes(t, n, m); if (!x) return ''
        if (t.fmt === 'bracket') return `победа — ${x.win.text}`
        const zw = zoneName(t, x.win.z), zl = zoneName(t, x.lose.z), cur = zoneOf(t, rowsOf(t, n).findIndex(r => r[0] === n) + 1)
        const now = rowsOf(t, n).findIndex(r => r[0] === n) + 1, lo = Math.min(x.win.p, x.lose.p), hi = Math.max(x.win.p, x.lose.p)
        return x.win.z === x.lose.z ? 'ничего не решает' : cur === x.win.z ? `только победа — иначе ${zl}` : `победа — ${zw}` }
      return link([m.a, m.b].map(n => `<span class="t4-dkp" title="${n}">${tlogo(n, 't4-lg t4-lg--20')}<span>${say(n)}</span></span>`).join('')) }
    // scen: два сценария — «побеждает A» / «побеждает B» и места обеих команд после
    const scen = (w, l) => { if (t.fmt === 'bracket') { const x = stakes(t, w, m), y = stakes(t, l, m); return x && y ? `${mini(w)} ${x.win.text} · ${mini(l)} ${y.lose.text}` : '' }
      const rows = rowsOf(t, w); if (!rows) return ''; const r = project(rows, w, l), at = n => { const p = r.findIndex(x => x[0] === n) + 1; return `<span class="t4-${ztone(zoneOf(t, p))}">${mini(n)} ${p}-е</span>` }
      return `${at(w)}${at(l)}` }
    return link(top + [[m.a, m.b], [m.b, m.a]].map(([w, l]) => `<span class="t4-dks"><span class="t4-dks__w">Победит ${mini(w)}</span><span class="t4-dks__r">${scen(w, l)}</span></span>`).join('')) }


  // Карточка команды по клику: профиль, ближайший матч, где стоит
  const card = (t, s) => { const n = s.pick, tm = team(n), f = findTeam(t, n), x = (t.matches || []).find(m => m.a === n || m.b === n)
    const z = f && zoneOf(t, f.place, f.size), where = f ? `${f.g ? 'Группа ' + f.g + ' · ' : ''}${f.place}-е из ${f.size} · ${f.row[1]}–${f.row[2]}` : ''
    const zt = z === 'up' ? '<b class="t4-up">в зоне выхода</b>' : z === 'mid' ? '<b class="t4-mid">в нижнюю сетку</b>' : z === 'down' ? '<b class="t4-down">в зоне вылета</b>' : f ? '<b>на границе</b>' : ''
    return `<div class="t4-ov" data-unpick></div><div class="t4-card">
      <div class="t4-card__top">${tlogo(n, 't4-lg t4-lg--40')}<span class="t4-card__n"><b>${n}</b>${tm.rank ? `<span class="t4-cap">#${tm.rank} в мире</span>` : ''}</span>${tm.form ? `<span class="t4-form">${[...tm.form].map(c => `<i class="${c}"></i>`).join('')}</span>` : ''}</div>
      ${where ? `<div class="t4-card__l">${where}${zt ? ' — ' + zt : ''}</div>` : ''}
      ${x ? `<div class="t4-card__m">${chip(x.when)}<span class="t4-nm">против <b>${x.a === n ? x.b : x.a}</b></span><a class="t4-ib t4-go" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener" aria-label="К матчу">${ic.next}</a></div><div class="t4-cap">${x.stage}</div>` : ''}
      ${s.opt.stakes === 'card' ? cardStakes(t, s, n) : ''}</div>` }
  // В карточке — что на кону в ближайшем матче: вердикт и куда при победе / поражении
  const cardStakes = (t, s, n) => { const c = ctxMatch(t, s), m = c && (c.a === n || c.b === n) ? c : pending(t, n), x = m && stakes(t, n, m); if (!x) return ''
    return `<div class="t4-cs"><div class="t4-cs__h"><span class="t4-cap">${m.sa != null ? 'На кону было' : 'На кону'}</span>${vd(x)}</div>
      <div class="t4-cs__r"><span>Победа</span><b class="t4-${ztone(x.win.z)}">${x.win.text}</b></div><div class="t4-cs__r"><span>Поражение</span><b class="t4-${ztone(x.lose.z)}">${x.lose.text}</b></div></div>` }

  const tourBody = (t, s) => {
    const main = t.fmt === 'groups' ? groups(t, s) + legend(t, s) : t.fmt === 'swiss' ? whatIf(t, s, t.rows) + legend(t, s) : t.fmt === 'bracket' ? (s.all ? bracketAll(t, s) : s.opt.bracket === 'path' ? bracketList(t, s) : bracketOne(t, s)) : soon(t, s)
    return `<div class="w-scroll"><div class="t4-bd">${s.all ? '' : strip(t, s) + hero(t, s)}${main}${t.rule && t.fmt !== 'bracket' && !s.opt.compact && !s.opt.air ? `<div class="t4-cap t4-rule">${t.rule}</div>` : ''}</div></div>`
      + (t.fmt === 'bracket' ? bracketBar(t, s) : '') + nowLine(t, s) + (s.pick ? card(t, s) : '')
  }

  function render(el, o) {
    const s = o.s || (o.s = init(o))
    const dk = s.opt.now === 'dock'
    el.className = 'w t4' + (dk ? ' t4--dock' : s.opt.now ? ' t4--grow' : '') + (s.opt.compact ? ' t4--compact' : '') + (s.opt.hl === 'dim' && s.ctx ? ' t4--dim' : '') + (s.opt.air ? ' t4--air' : '') + (s.pick ? ' has-pick' : '')
    const inner = head(s) + (s.list || s.t == null ? list(s) : tourBody(D.tours[s.t], s))
    el.innerHTML = dk ? `<div class="t4-main">${inner}</div>${dock(s)}` : inner
    const go = p => { Object.assign(s, p); render(el, o) }
    el.querySelectorAll('[data-list]').forEach(b => b.onclick = () => go({ list: !s.list, pick: null }))
    el.querySelectorAll('[data-tour]').forEach(b => b.onclick = () => { const t = D.tours[+b.dataset.tour], f = s.team && findTeam(t, s.team)
      go({ t: +b.dataset.tour, list: false, pick: null, g: f && f.g ? f.g : null, bi: null, ri: null, di: 0, all: false, wi: 0 }) })
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => go({ g: b.dataset.g, pick: null, wi: 0 }))
    el.querySelectorAll('[data-wi]').forEach(b => b.onclick = () => go({ wi: +b.dataset.wi, pick: null }))
    el.querySelectorAll('[data-flt]').forEach(b => b.onclick = () => go({ flt: false }))
    el.querySelectorAll('[data-bs]').forEach(b => b.onclick = () => { const t = D.tours[s.t]; go({ bi: Math.max(0, (s.bi ?? startIdx(t, s)) + +b.dataset.bs), pick: null }) })
    el.querySelectorAll('[data-all]').forEach(b => b.onclick = () => go({ all: !s.all, pick: null }))
    el.querySelectorAll('[data-bi]').forEach(b => b.onclick = () => go({ bi: +b.dataset.bi, all: false }))
    el.querySelectorAll('[data-bt]').forEach(b => b.onclick = () => go({ bt: b.dataset.bt }))
    el.querySelectorAll('[data-rr]').forEach(b => b.onclick = () => go({ ri: +b.dataset.rr, all: false }))
    el.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { const t = D.tours[s.t], rs = rounds(t); go({ ri: Math.max(0, Math.min(rs.length - 1, (s.ri ?? curRound(t, rs)) + +b.dataset.rs)) }) })
    el.querySelectorAll('[data-di]').forEach(b => b.onclick = () => go({ di: +b.dataset.di, dl: false, dir: Math.sign(+b.dataset.di - (s.di || 0)) }))
    el.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => go({ dl: !s.dl }))
    el.querySelectorAll('[data-ds]').forEach(b => b.onclick = () => go({ di: Math.max(0, (s.di || 0) + +b.dataset.ds), dir: +b.dataset.ds }))
    el.querySelectorAll('[data-team]').forEach(r => r.onclick = () => go({ pick: s.pick === r.dataset.team ? null : r.dataset.team }))
    el.querySelectorAll('[data-unpick]').forEach(b => b.onclick = () => go({ pick: null }))
    // v14: раскрытие команды в строке матча — состоянием (data-open), а не :hover: строка перестраивается под курсором и :hover мерцал
    // Раскрытие команды в строке матча — состоянием (data-open), а не :hover: строка перестраивается под курсором и :hover мерцал.
    // Раскрытая сторона владеет всей строкой: соперник раскрывается только наведением на его логотип (дирижёр 21.10)
    el.querySelectorAll('.t4-mx').forEach(mx => { const dock = mx.closest('.t4-dock')
      const open = sd => { const k = sd.classList.contains('is-r') ? 'b' : 'a'; mx.dataset.open = k
        // v25–v26: у каждой стороны свой цветной слой, закреплённый за своим краем, — сторона не путается при переключении
        if (dock) { dock.dataset.side = k; dock.classList.add('is-open'); dock.style.setProperty('--dk-' + k, sd.style.getPropertyValue('--team') || 'rgba(255,255,255,.08)')
          // v25: цветной блок — от верха строки матча (над ней может быть шапка «Идут сейчас»)
          const D2 = dock.getBoundingClientRect(), zz = D2.width / dock.offsetWidth || 1
          dock.style.setProperty('--bgt', Math.max(12, (mx.getBoundingClientRect().top - D2.top) / zz - 6) + 'px')
        }
        // шторка от края блока (v18–v20) — меряем, где кончается логотип + название
        const M = mx.getBoundingClientRect(), z = M.width / mx.offsetWidth || 1, n = sd.querySelector('.t4-mx__n').getBoundingClientRect()
        mx.style.setProperty('--ea', (n.right - M.left) / z + 8 + 'px'); mx.style.setProperty('--eb', (M.right - n.left) / z + 8 + 'px') }
      mx.querySelectorAll('.t4-mx__s').forEach(sd => { sd.onmouseenter = () => { if (!mx.dataset.open) open(sd) }; sd.onclick = () => open(sd)
        const lg = sd.querySelector(':scope > .t4-lg'); if (lg) lg.onmouseenter = () => open(sd)
        // Оттенок команды — по цвету её логотипа (цветов команд в данных нет)
        const im = sd.querySelector(':scope > img'); if (im) { const f = () => { const c = logoTone(im); if (c) sd.style.setProperty('--team', c) }; im.complete ? f() : im.addEventListener('load', f, { once: true }) } })
      mx.onmouseleave = () => { delete mx.dataset.open; if (dock) dock.classList.remove('is-open') } })
    // «i» — поп-овер под кнопкой; любой следующий клик его закрывает
    el.querySelectorAll('[data-info]').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); el.querySelectorAll('.t4-pop').forEach(x => x.remove())
      const W = el.getBoundingClientRect(), z = W.width / el.offsetWidth || 1, r = b.getBoundingClientRect(), p = document.createElement('div')
      p.className = 't4-pop'; p.textContent = b.dataset.info; el.append(p); p.style.top = (r.bottom - W.top) / z + 6 + 'px'
      setTimeout(() => document.addEventListener('click', () => p.remove(), { once: true })) })
    // Вся сетка — ужать по ширине области
    // Вся сетка — ужать по ширине и высоте области, чтобы не резалась
    const ball = el.querySelector('.t4-ball'); if (ball) { const sc = el.querySelector('.w-scroll'), w = el.querySelector('.t4-bd').clientWidth, k = Math.min(1, w / ball.scrollWidth, (sc.clientHeight - 16) / ball.scrollHeight); ball.style.zoom = k }
    // Карточка — под выбранной строкой, внутри области прокрутки
    const cd = el.querySelector('.t4-card'), row = el.querySelector('.sel, [data-team="' + (s.pick || '').replace(/"/g, '') + '"]'), sc = el.querySelector('.w-scroll')
    if (cd && row && sc) { const W = el.getBoundingClientRect(), z = W.height / el.offsetHeight || 1, r = row.getBoundingClientRect(), b = sc.getBoundingClientRect()
      let top = (r.bottom - W.top) / z + 8; const h = cd.offsetHeight, bot = (b.bottom - W.top) / z
      if (top + h > bot - 8) top = (r.top - W.top) / z - 8 - h
      cd.style.top = Math.max((b.top - W.top) / z + 8, Math.min(top, bot - h - 8)) + 'px' }
  }
  // Начало: на главной — список турниров; в матче — его турнир, группа одной из команд, их матч в сетке
  // У команды — её турниры: один — сразу открыт, несколько — список только из них (v5 home 'top' — сразу её идущий турнир, остальные по бургеру)
  // v5 home 'top' — на главной сразу самый важный турнир: идёт матч, больше призовой
  const prizeOf = t => +String(t.prize || '').replace(/\D/g, '') || 0
  // Самый важный — где идущий матч решает больше всего (вердикты обеих команд), при равенстве — больше призовой
  const liveImp = t => Math.max(0, ...(t.matches || []).filter(m => m.when === 'live').map(m => importance(t, m)))
  const topTour = () => { const l = D.tours.map((t, i) => [t, i]).filter(([t]) => t.st === 'live' && (t.matches || []).some(m => m.when === 'live')).sort((a, b) => liveImp(b[0]) - liveImp(a[0]) || prizeOf(b[0]) - prizeOf(a[0]))
    return l.length ? l[0][1] : D.tours.findIndex(t => t.st === 'live') }
  function init(o) {
    const ctx = o.match || (o.team ? { a: o.team, b: null } : null), s = { list: !ctx, t: null, g: null, bi: null, all: false, pick: null, ctx, opt: o.opt || {}, wi: 0, team: o.team || null, flt: !!o.team }
    if (o.team) { const ts = D.tours.map((t, i) => [t, i]).filter(([t]) => has(t, o.team))
      if (ts.length === 1 || s.opt.home === 'top') { const p = ts.find(([t]) => t.st === 'live') || ts[0]; ts[0] = p; s.t = ts[0][1]; s.list = false; const f = findTeam(ts[0][0], o.team); if (f && f.g) s.g = f.g } else s.list = true }
    else if (ctx) { const i = D.tours.findIndex(t => t.st === 'live' && has(t, ctx.a) && has(t, ctx.b)); s.t = i >= 0 ? i : D.tours.findIndex(t => has(t, ctx.a)); if (s.t < 0) { s.t = null; s.list = true }
      else { const f = findTeam(D.tours[s.t], ctx.a); if (f && f.g) s.g = f.g } }
    if (!ctx && s.opt.home === 'top') { s.list = false; s.t = topTour(); const t = D.tours[s.t], m = t && (t.matches || []).find(m => m.when === 'live'), f = m && findTeam(t, m.a); if (f && f.g) s.g = f.g }
    return Object.assign(s, o.init) // o.init — стартовое состояние для доски лабы (открытый турнир, карточка)
  }
  window.T4 = { render, data: D, has, findTeam }
})()
