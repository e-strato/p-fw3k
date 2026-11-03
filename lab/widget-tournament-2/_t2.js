// Виджет турнира, шаг 2 (дирижёр 20.10): форматы турнира — лига, швейцарка, сетка — и состояние «открыт матч».
// Основа — v20 из лабы widget-tournament (бургер со списком и поиском, звезда, ‹ ›). Стили — ../widget-tournament/_w.css.
// Открыт матч: под шапкой карточка — две команды своими цветами и где каждая стоит; в таблице/сетке ниже — те же цвета.
// «Что на кону» — o.stake: 4 строка · 5 победа/поражение · 6 бейдж · 7 заголовком.
// o.tap: клик по команде показывает её ближайший матч панелью внизу; 9–12 — как выглядит выбор (см. _t2.css). Сетка — одним полотном, листается целиком.
// v13–v16 — o.panel (lines | chips | head | rank): как матч повлияет на команду; o.marks (dots | tags | zones | arrows): кто где в таблице.
// o.past — добавить прошедшие турниры (итог); o.rf — рейтинг и форма: в строке inline | col | sub (сняты) или в карточке card | rankonly | profile, profile-logo | profile-chips | profile-match | profile-nums (лаба widget-tournament-3).
// o.sheet: вид панели — anchor (v22) | bigtime (v24), а также sheet | float | versus | blur (сняты). o.when: inline (v22) | big (v26) | chip (v27) | compact (v28).
// o.live (v16): тег LIVE у играющих сейчас — в таблице, сетке и панели; из панели — «К матчу ›» на страницу матча сайта.
// T2.render(узел, { start: id турнира, match: id матча | null, stake: 4–7, tap: 9–12, panel, marks, live }). Размер 320×400, скролл внутри. Данные — пример по Dota 2.
(() => {
  const TOURS = [
    { id: 'epl', fmt: 'league', name: 'EPL Masters III', st: 'live', tier: 'B', dates: '18.10 – 05.11', prize: '$100 000', now: 'Группы · день 3 из 19',
      rule: 'В плей-офф — 4 лучших из группы', groups: {
        'Группа A': [['HULIGANI', 3, 0, 9], ['Power Rangers', 1, 1, 3], ['Salamit', 1, 2, 3], ['Nemiga Gaming', 0, 2, 1], ['Team Lynx', 0, 2, 0], ['IC x Insanity', 0, 2, 0]],
        'Группа B': [['Team Synapse', 2, 0, 6], ['Yellow Submarine', 2, 1, 6], ['Dawn Bulls', 1, 1, 3], ['CyberHero', 1, 1, 3], ['Zero Tenacity', 0, 2, 0], ['TheBots', 0, 1, 0]] },
      // кто где (v13–v16): up — уже почти в плей-офф, mid — борется, down — на грани вылета; hot — лучшая форма
      status: { 'HULIGANI': 'up', 'Team Synapse': 'up', 'Nemiga Gaming': 'down', 'Team Lynx': 'down', 'IC x Insanity': 'down', 'Zero Tenacity': 'down', 'TheBots': 'down' },
      hot: ['HULIGANI', 'Team Synapse'] },
    { id: 'pgl', fmt: 'swiss', name: 'PGL Wallachia S12', st: 'live', tier: 'A', dates: '19.10 – 31.10', prize: '$1 000 000', now: 'Швейцарка · раунд 4/5',
      rule: '3 победы — в плей-офф, 3 поражения — вылет', rows: [['Team Yandex', 3, 0], ['PARIVISION', 3, 0], ['Team Spirit', 2, 1], ['Team Liquid', 2, 1], ['Aurora', 2, 1],
        ['BetBoom Team', 2, 1], ['1w Team', 2, 1], ['Team Falcons', 2, 1], ['Nigma Galaxy', 1, 2], ['Vici Gaming', 1, 2], ['LGD Gaming', 1, 2], ['OG', 1, 2],
        ['Xtreme Gaming', 1, 2], ['Team Resilience', 1, 2], ['HULIGANI', 0, 3], ['GamerLegion', 0, 3]], hot: ['Team Yandex', 'PARIVISION'] },
    { id: 'ti', fmt: 'bracket', name: 'The International 2026', st: 'live', tier: 'S', dates: '13.08 – 23.08', prize: '$3 900 000', now: 'Плей-офф · день 3 из 4',
      rule: 'Двойное выбывание: проиграл в верхней сетке — уходишь в нижнюю, проиграл в нижней — вылет', branches: [
        ['Верхняя сетка', [
          ['Полуфиналы', [['Team Spirit', 1, 'PARIVISION', 2], ['Team Yandex', 2, 'Nigma Galaxy', 1]]],
          ['Финал', [['PARIVISION', null, 'Team Yandex', null, 'Сейчас']]],
          ['Гранд-финал', [['Победитель ВС', null, 'Победитель НС', null, '23.08']]]]],
        ['Нижняя сетка', [
          ['Раунд 2', [['Nigma Galaxy', 1, 'BetBoom Team', 2], ['Team Spirit', 2, 'Team Liquid', 0]]],
          ['Раунд 3', [['BetBoom Team', null, 'Team Spirit', null, 'Сегодня, 20:00']]],
          ['Финал', [['Проигравший ВС', null, 'Победитель Р3', null, '22.08']]]]]] },
    { id: 'pari', fmt: 'soon', name: 'PARI Universe', st: 'soon', tier: 'B', dates: '22.10 – 01.11', prize: '$250 000', now: 'Начнётся через 2 дня',
      teams: ['Team Yandex', 'Team Spirit', '1w Team', 'BetBoom Team', 'PARIVISION', 'Aurora', 'Team Liquid', 'Nigma Galaxy', 'HULIGANI', 'Team Falcons'] },
    { id: 'blast', fmt: 'soon', name: 'BLAST Slam IX', st: 'soon', tier: 'A', dates: '20.11 – 29.11', prize: '$750 000', now: 'Начнётся через месяц',
      teams: ['Natus Vincere', 'Team Nemesis', 'Dawn Bulls', 'Team Falcons'], more: 8 },
  ]
  // Прошедшие турниры (лаба widget-tournament-3, o.past): итог — места и призовые
  const PAST_TOURS = [
    { id: 'blast8', fmt: 'done', name: 'BLAST Slam VIII', st: 'done', tier: 'A', dates: '29.09 – 11.10', prize: '$750 000', now: 'Победитель — Team Yandex',
      places: [['1', 'Team Yandex', '$270 000'], ['2', 'Team Spirit', '$135 000'], ['3', 'PARIVISION', '$95 000'], ['4', 'Aurora', '$65 000'],
        ['5–6', 'LGD Gaming', '$35 500'], ['5–6', '1w Team', '$35 500'], ['7–8', 'OG', '$20 000'], ['7–8', 'GamerLegion', '$20 000'],
        ['9–12', 'BetBoom Team', '$11 500'], ['9–12', 'Team Liquid', '$11 500'], ['9–12', 'Xtreme Gaming', '$11 500'], ['9–12', 'Team Nemesis', '$11 500']] },
  ]
  let TL = TOURS // турниры, по которым листаем: с прошедшими или без
  // Рейтинг и форма команды (o.rf): пример — известные из рейтинга, остальные — стабильно по имени
  const RANK = { 'Team Spirit': 1, 'PARIVISION': 2, 'Team Falcons': 3, 'Aurora': 4, 'Team Yandex': 5, 'Team Liquid': 6, 'BetBoom Team': 7, '1w Team': 8, 'Nigma Galaxy': 9 }
  const hash = n => [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)
  const rankOf = n => RANK[n] || 12 + hash(n) % 70
  const formOf = n => { let x = hash(n); return [0, 1, 2, 3, 4].map(() => (x = (x * 1103515245 + 12345) % 2147483648, (x >> 8) % 5 < 3 ? 'W' : 'L')).join('') }
  // Матчи, которые можно «открыть» на странице: виджет подсвечивает обе команды
  const MATCHES = {
    'lnx-pr': { tour: 'epl', a: 'Team Lynx', b: 'Power Rangers', where: 'Группа A · Bo3', live: true, head: ['risk', 'Для Team Lynx — матч на вылет'],
      stake: { 'Team Lynx': ['risk', 'На вылет', '1–2, шанс на плей-офф остаётся', '0–3, вылет из группы'], 'Power Rangers': ['', 'Важный', '2–1, почти в плей-офф', '1–2, борьба за 4-е место'] } },
    'spr-lqd': { tour: 'pgl', a: 'Team Spirit', b: 'Team Liquid', where: 'Раунд 4 · Bo3', live: true, head: ['', 'Победитель выходит в плей-офф'],
      stake: { 'Team Spirit': ['', 'Решающий', '3–1, в плей-офф', '2–2, ещё один шанс в 5-м раунде'], 'Team Liquid': ['', 'Решающий', '3–1, в плей-офф', '2–2, ещё один шанс в 5-м раунде'] } },
    'pv-ydx': { tour: 'ti', a: 'PARIVISION', b: 'Team Yandex', where: 'Финал ВС · Bo3', live: true, pos: ['Верхняя сетка, финал', 'Верхняя сетка, финал'], head: ['safe', 'Проигравший не вылетает — уйдёт в нижнюю сетку'],
      stake: { 'PARIVISION': ['safe', 'Без риска', 'в гранд-финал', 'в нижнюю сетку, не вылет'], 'Team Yandex': ['safe', 'Без риска', 'в гранд-финал', 'в нижнюю сетку, не вылет'] } },
    'bb-spr': { tour: 'ti', a: 'BetBoom Team', b: 'Team Spirit', where: 'НС, раунд 3 · 20:00', live: false, pos: ['Нижняя сетка, раунд 3', 'Нижняя сетка, раунд 3'], head: ['risk', 'Матч на вылет для обеих'],
      stake: { 'BetBoom Team': ['risk', 'На вылет', 'в финал нижней сетки', 'вылет, 4-е место, $234 000'], 'Team Spirit': ['risk', 'На вылет', 'в финал нижней сетки', 'вылет, 4-е место, $234 000'] } },
  }
  // Ближайшие матчи по турнирам (v8: клик по команде): [когда, команда, команда, этап]; out — у кого матчей больше нет
  const SCHED = {
    epl: { list: [['live', 'Team Lynx', 'Power Rangers', 'Группа A'], ['Сегодня, 18:00', 'HULIGANI', 'Salamit', 'Группа A'], ['Сегодня, 18:00', 'Team Synapse', 'Yellow Submarine', 'Группа B'],
      ['Сегодня, 21:00', 'Dawn Bulls', 'TheBots', 'Группа B'], ['Завтра, 15:00', 'Nemiga Gaming', 'IC x Insanity', 'Группа A'], ['Завтра, 15:00', 'CyberHero', 'Zero Tenacity', 'Группа B']] },
    pgl: { list: [['live', 'Team Spirit', 'Team Liquid', 'Раунд 4'], ['Сегодня, 19:00', 'Aurora', 'BetBoom Team', 'Раунд 4'], ['Сегодня, 19:00', '1w Team', 'Team Falcons', 'Раунд 4'],
      ['Сегодня, 21:00', 'Nigma Galaxy', 'Vici Gaming', 'Раунд 4'], ['Сегодня, 21:00', 'LGD Gaming', 'OG', 'Раунд 4'], ['Сегодня, 22:00', 'Xtreme Gaming', 'Team Resilience', 'Раунд 4']],
      out: { 'Team Yandex': 'Уже в плей-офф — соперник после жеребьёвки', 'PARIVISION': 'Уже в плей-офф — соперник после жеребьёвки', 'HULIGANI': 'Выбыла из турнира', 'GamerLegion': 'Выбыла из турнира' } },
    ti: { list: [['live', 'PARIVISION', 'Team Yandex', 'Финал верхней сетки'], ['Сегодня, 20:00', 'BetBoom Team', 'Team Spirit', 'Нижняя сетка, раунд 3']],
      out: { 'Nigma Galaxy': 'Выбыла: 5–6-е место', 'Team Liquid': 'Выбыла: 7–8-е место' } },
  }
  const nb = s => s.replace(/ (\d{3})/g, ' $1')
  const ini = n => n.replace(/^(Team |IC x )/, '').slice(0, 2).toUpperCase()
  const ic = {
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m8 2 1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5L8 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  }
  const logo = n => `<span class="w-logo">${ini(n)}</span>`

  // ——— Форматы. Команды открытого матча отмечены своим цветом: первая — синяя точка, вторая — оранжевая ———
  const mark = (n, m) => m && (n === m.a ? 'a' : n === m.b ? 'b' : '')
  let PICK = null // команда, выбранная кликом — выделена строка (без точки)
  let MK = null // метки «кто где» в таблице (v13–v16): dots | tags | zones | arrows
  const statusOf = (t, n) => {
    if (t.fmt === 'swiss') { const r = t.rows.find(r => r[0] === n); return r[1] === 3 ? 'up' : r[2] === 3 ? 'out' : r[2] === 2 ? 'down' : 'mid' }
    return (t.status && t.status[n]) || 'mid'
  }
  let LIVE = null // показывать тег LIVE у команд, которые играют прямо сейчас (v16)
  const isLive = (t, n) => LIVE && SCHED[t.id] && SCHED[t.id].list.some(r => r[0] === 'live' && (r[1] === n || r[2] === n))
  const liveTag = '<span class="t2-live">LIVE</span>'
  const ST = { up: 'проходит', mid: 'борется', down: 'на грани', out: 'вылет' }
  const marks = (t, n) => { const st = statusOf(t, n), hot = t.hot && t.hot.includes(n)
    return { st, pre: MK === 'dots' ? `<span class="t2-mk t2-mk--${st}"></span>` : MK === 'arrows' ? `<span class="t2-ar t2-ar--${st}">${st === 'up' ? '↑' : st === 'down' || st === 'out' ? '↓' : ''}</span>` : '',
      tag: MK === 'tags' && st !== 'mid' ? `<span class="t2-tg t2-tg--${st}">${ST[st]}</span>` : '', hot: MK === 'zones' && hot ? '<span class="t2-hot" title="Лучшая форма">🔥</span>' : '',
      cls: MK === 'zones' ? `t2-zn--${st}` : '' } }
  const legend = () => MK === 'dots' ? `<div class="t2-lg"><span><i class="t2-mk t2-mk--up"></i>проходит</span><span><i class="t2-mk t2-mk--mid"></i>борется</span><span><i class="t2-mk t2-mk--down"></i>на грани</span></div>`
    : MK === 'arrows' ? `<div class="t2-lg"><span><b class="t2-ar t2-ar--up">↑</b>проходит</span><span><b class="t2-ar t2-ar--down">↓</b>на вылет</span></div>`
    : MK === 'zones' ? `<div class="t2-lg"><span><i class="t2-sq t2-zn--up"></i>проходит</span><span><i class="t2-sq t2-zn--down"></i>на грани</span><span>🔥 лучшая форма</span></div>` : ''
  const dot = k => k ? `<span class="t2-dot t2-dot--${k}"></span>` : ''
  let RF = null // как показать рейтинг и форму в строке: inline (#5 у имени + колонка формы) | col (колонка «Рейт.») | sub (второй строкой)
  const bars = n => `<span class="t3-fm">${[...formOf(n)].map(c => `<i class="${c}"></i>`).join('')}</span>`
  const letters = n => [...formOf(n)].map(c => `<b class="t3-l t3-l--${c}">${c === 'W' ? 'В' : 'П'}</b>`).join('')
  const rfName = n => RF === 'inline' || RF === 'rankonly' ? `<span class="t3-rk">#${rankOf(n)}</span>` : ''
  // card | rankonly | profile (v4–v6): строка таблицы чистая, рейтинг и форма — в карточке по клику
  const inCard = () => RF === 'card' || RF === 'rankonly' || /^profile/.test(RF || '')
  const dots5 = n => `<span class="t3-dots">${[...formOf(n)].map(c => `<i class="${c}"></i>`).join('')}</span>`
  const rfSub = n => RF === 'sub' ? `<span class="t3-sub">#${rankOf(n)} в мире · ${letters(n)}</span>` : ''
  const rfTh = () => RF === 'inline' ? '<th>Форма</th>' : RF === 'col' ? '<th>Рейт.</th>' : ''
  const rfTd = n => RF === 'inline' ? `<td class="t3-td">${bars(n)}</td>` : RF === 'col' ? `<td class="t3-td">#${rankOf(n)}</td>` : ''
  const nameCell = (t, n, k, x) => RF === 'sub'
    ? `<span class="w-team">${logo(n)}<span class="t3-two"><span class="t3-two__n"><span class="t2-nm">${n}</span>${isLive(t, n) ? liveTag : ''}</span>${rfSub(n)}</span></span>`
    : `<span class="w-team">${logo(n)}<span class="t2-nm">${n}</span>${rfName(n)}${isLive(t, n) ? liveTag : ''}${x.hot}${dot(k)}${x.tag}</span>`
  const league = (t, m) => Object.entries(t.groups).map(([g, rows]) => `<div class="w-lbl">${g}</div><table class="w-tbl ${RF ? 't3-tbl t3-tbl--' + RF : ''}"><tr><th></th><th></th>${rfTh()}<th>В–П</th><th>Очки</th></tr>${rows.map(([n, w, l, p], i) => { const k = mark(n, m)
    const x = marks(t, n)
    return `<tr data-team="${n}" class="${i === 3 ? 't-cut' : ''} ${k ? 't2-row t2-row--' + k : ''} ${PICK === n ? 't2-row sel' : ''} ${x.cls}"><td>${x.pre}${i + 1}</td><td>${nameCell(t, n, k, x)}</td>${rfTd(n)}<td>${w}–${l}</td><td>${p}</td></tr>` }).join('')}</table>`).join('<div style="height:12px"></div>') + legend()
  const swiss = (t, m) => `<table class="w-tbl t2-sw ${RF ? 't3-tbl t3-tbl--' + RF : ''}"><tr><th></th><th></th>${rfTh()}<th>В–П</th><th></th></tr>${t.rows.map(([n, w, l], i) => { const k = mark(n, m), z = MK ? '' : w === 3 ? 'up' : l === 3 ? 'down' : '', x = marks(t, n)
    return `<tr data-team="${n}" class="${z ? 't2-z--' + z : ''} ${k ? 't2-row t2-row--' + k : ''} ${PICK === n ? 't2-row sel' : ''} ${x.cls}"><td>${x.pre}${i + 1}</td><td>${nameCell(t, n, k, x)}</td>${rfTd(n)}<td>${w}–${l}</td><td>${z === 'up' ? 'плей-офф' : z === 'down' ? 'вылет' : ''}</td></tr>` }).join('')}</table>` + legend()
  // Сетка — одним полотном: верхняя и нижняя ветки в общих колонках, листаются вбок вместе (дирижёр 20.10)
  const bracket = (t, m) => `<div class="t2-brw"><div class="t2-brin">${t.branches.map(([name, cols]) => `<div class="t2-side">${name}</div>${cols.map(([round, ms]) => `<div class="t2-col"><div class="w-cap">${round}</div><div class="t2-col__ms">${ms.map(([a, sa, b, sb, when]) => {
      const live = sa === null, cur = m && ((a === m.a && b === m.b) || (a === m.b && b === m.a))
      const line = (n, x, y) => { const ph = /^(Победитель|Проигравший)/.test(n), k = cur ? mark(n, m) : ''
        return `<div ${ph ? '' : `data-team="${n}"`} class="w-br__l ${!live && x < y ? 'is-lose' : ''} ${k || PICK === n ? 't2-hl' : ''} ${PICK === n ? 'sel' : ''}">${ph ? '<span class="w-logo">?</span>' : logo(n)}<span>${n}</span>${!ph && live && isLive(t, n) ? liveTag : ''}${dot(k)}<b>${live ? '' : x}</b></div>` }
      return `<div class="w-br__m ${cur ? 'is-hl' : ''}">${line(a, sa, sb)}${line(b, sb, sa)}${when ? `<div class="t2-when">${LIVE && when === 'Сейчас' ? liveTag + ' идёт сейчас' : when}</div>` : ''}</div>` }).join('')}</div></div>`).join('')}`).join('')}</div></div>`
  const soon = t => `<div class="t-pass" style="margin-top:0">${[['Даты', t.dates], ['Призовой', nb(t.prize)]].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
    <div class="w-lbl" style="margin-top:16px">Участники · ${t.teams.length}${t.more ? ` из ${t.teams.length + t.more}` : ''}</div>
    <div class="tt-teams">${t.teams.map(n => `<div class="tt-team ${PICK === n ? 'sel' : ''}" data-team="${n}">${logo(n)}${n}</div>`).join('')}</div>`

  // Прошедший турнир: победитель и места с призовыми; строки кликабельны
  const done = t => `<div class="t3-win"><span class="t3-win__cup">🏆</span><span><span class="w-cap">Победитель</span><b>${t.places[0][1]}</b></span><b class="t3-win__p">${nb(t.places[0][2])}</b></div>
    <table class="w-tbl t3-pl ${RF ? 't3-tbl t3-tbl--' + RF : ''}"><tr><th></th><th></th>${rfTh()}<th>Призовые</th></tr>${t.places.map(([p, n, $]) =>
      `<tr data-team="${n}" class="${PICK === n ? 't2-row sel' : ''}"><td>${p}</td><td>${nameCell(t, n, '', { hot: '', tag: '' })}</td>${rfTd(n)}<td>${nb($)}</td></tr>`).join('')}</table>`
  const body = (t, m) => {
    const main = t.fmt === 'league' ? league(t, m) : t.fmt === 'swiss' ? swiss(t, m) : t.fmt === 'bracket' ? bracket(t, m) : t.fmt === 'done' ? done(t) : soon(t)
    return main + (t.rule ? `<div class="w-cap" style="margin-top:12px">${t.rule}</div>` : '')
  }
  // Где стоит команда — одной фразой для карточки матча
  const where = (t, m, n) => {
    if (m.pos) return m.pos[n === m.a ? 0 : 1]
    if (t.fmt === 'league') { for (const [g, rows] of Object.entries(t.groups)) { const i = rows.findIndex(r => r[0] === n); if (i >= 0) return `${i + 1}-е из ${rows.length} · ${rows[i][1]}–${rows[i][2]}` } }
    if (t.fmt === 'swiss') { const r = t.rows.find(r => r[0] === n); return `${r[1]}–${r[2]} в швейцарке` }
    return ''
  }
  const strip = t => `<div class="tt-st">${t.st === 'live' ? '<span class="w-dot"></span>' : '<span class="w-dot w-dot--soon"></span>'}<span class="t2-st__m">${t.st === 'done' ? 'Завершён · ' + t.dates : t.now}</span><span class="tt-st__r">${t.tier}-тир · ${nb(t.prize)}</span></div>`
  // Карточка открытого матча. sv — как показать «что на кону»: 4 строка под командой · 5 победа/поражение · 6 бейдж · 7 заголовком
  const card = (t, m, sv) => {
    const cap = `<div class="t2-mc__cap">${m.live ? '<span class="w-dot"></span>В эфире' : 'Скоро'} · ${m.where}</div>`
    const team = (n, k, right) => `<div class="t2-mc__r"><span class="t2-dot t2-dot--${k}"></span><b>${n}</b>${right}</div>`
    const rows = m => [[m.a, 'a'], [m.b, 'b']]
    if (!sv || !m.stake) return `<div class="t2-mc">${cap}${rows(m).map(([n, k]) => team(n, k, `<span>${where(t, m, n)}</span>`)).join('')}</div>`
    if (sv === 4) return `<div class="t2-mc">${cap}${rows(m).map(([n, k]) => { const [z, , , lose] = m.stake[n]
      return team(n, k, `<span>${where(t, m, n)}</span>`) + `<div class="t2-sk t2-sk--${z || 'mid'}">Проиграет — ${lose}</div>` }).join('')}</div>`
    if (sv === 5) return `<div class="t2-mc">${cap}${rows(m).map(([n, k]) => { const [z, , win, lose] = m.stake[n]
      return team(n, k, `<span>${where(t, m, n)}</span>`) + `<div class="t2-wl"><span class="t2-wl__w">↑ ${win}</span><span class="t2-wl__l t2-wl__l--${z || 'mid'}">↓ ${lose}</span></div>` }).join('')}</div>`
    if (sv === 6) return `<div class="t2-mc">${cap}${rows(m).map(([n, k]) => { const [z, tag] = m.stake[n]
      return team(n, k, `<span class="t2-tag t2-tag--${z || 'mid'}">${tag}</span>`) }).join('')}</div>`
    const [z, h] = m.head
    return `<div class="t2-mc"><div class="t2-head t2-head--${z || 'mid'}">${h}</div>${cap}${rows(m).map(([n, k]) => team(n, k, `<span>${where(t, m, n)}</span>`)).join('')}</div>`
  }

  // Как ближайший матч повлияет на команду (v13–v16): win / lose — что будет, risk — насколько страшно, head — одной фразой, now/up/dn — место сейчас и после
  const impact = (t, n, x) => {
    if (t.fmt === 'league') { const [, rows] = Object.entries(t.groups).find(([, r]) => r.some(q => q[0] === n)), p = rows.findIndex(q => q[0] === n) + 1, st = statusOf(t, n)
      const up = Math.max(1, p - 1), dn = Math.min(rows.length, p + 1)
      if (st === 'up') return { risk: 'safe', head: 'матч за первое место', win: 'останется 1-м в группе', lose: 'всё равно почти в плей-офф', now: `${p}-е`, up: `${up}-е`, dn: `${dn}-е` }
      if (st === 'down') return { risk: 'risk', head: 'матч на вылет', win: `${up}-е, шанс на плей-офф остаётся`, lose: 'вылет из группы', now: `${p}-е`, up: `${up}-е`, dn: 'вылет' }
      return { risk: 'mid', head: 'матч за плей-офф', win: `${up}-е, почти плей-офф`, lose: `${dn}-е, плей-офф под угрозой`, now: `${p}-е`, up: `${up}-е`, dn: `${dn}-е` } }
    if (t.fmt === 'swiss') { const [, w, l] = t.rows.find(q => q[0] === n)
      return { risk: l === 2 ? 'risk' : w === 2 ? 'safe' : 'mid', head: l === 2 ? 'матч на вылет' : w === 2 ? 'победа — плей-офф' : 'важный матч',
        win: w + 1 === 3 ? 'в плей-офф' : `${w + 1}–${l}`, lose: l + 1 === 3 ? 'вылет' : `${w}–${l + 1}, решающий раунд`, now: `${w}–${l}`, up: w + 1 === 3 ? 'плей-офф' : `${w + 1}–${l}`, dn: l + 1 === 3 ? 'вылет' : `${w}–${l + 1}` } }
    const ub = /верхней/i.test(x[3])
    return ub ? { risk: 'safe', head: 'проигрыш не страшен', win: 'в гранд-финал', lose: 'в нижнюю сетку, не вылет', now: 'Финал ВС', up: 'Гранд-финал', dn: 'В нижнюю' }
      : { risk: 'risk', head: 'матч на вылет', win: 'дальше по нижней сетке', lose: 'вылет', now: 'НС, р. 3', up: 'Финал НС', dn: 'Вылет' }
  }
  const oppWhere = (t, n) => t.fmt === 'league' ? (() => { const [, r] = Object.entries(t.groups).find(([, r]) => r.some(q => q[0] === n)); return `${r.findIndex(q => q[0] === n) + 1}-е` })()
    : t.fmt === 'swiss' ? (() => { const r = t.rows.find(q => q[0] === n); return `${r[1]}–${r[2]}` })() : ''
  // Панель: как показать влияние — lines | chips | head | rank
  const nextImpact = (t, n, pn) => {
    const sc = SCHED[t.id] || { list: [] }, x = sc.list.find(r => r[1] === n || r[2] === n)
    const top = `<div class="t2-nx__top"><b>${n}</b><span class="w-cap">ближайший матч</span>${LIVE ? `<a class="t2-go2" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener">К матчу ${ic.next}</a>` : `<button class="t2-nx__x" data-unpick aria-label="Закрыть">${ic.close}</button>`}</div>`
    if (!x) return `<div class="t2-nx">${top}<div class="t2-nx__w">${(sc.out && sc.out[n]) || 'Ближайший матч ещё не назначен'}</div></div>`
    const opp = x[1] === n ? x[2] : x[1], ow = oppWhere(t, opp), i = impact(t, n, x)
    const when = `<div class="t2-nx__w">${x[0] === 'live' ? (LIVE ? liveTag : '<span class="w-dot"></span>Сейчас') : x[0]} · против <b>${opp}</b>${ow ? ` <span class="w-cap">(${ow})</span>` : ''}</div>`
    if (pn === 'lines') return `<div class="t2-nx">${top}${when}<div class="t2-wl" style="margin:4px 0 0"><span class="t2-wl__w">↑ Победа — ${i.win}</span><span class="t2-wl__l t2-wl__l--${i.risk}">↓ Поражение — ${i.lose}</span></div></div>`
    if (pn === 'chips') return `<div class="t2-nx">${top}${when}<div class="t2-ch"><span class="t2-ch__w">Победа: ${i.win}</span><span class="t2-ch__l t2-ch__l--${i.risk}">Поражение: ${i.lose}</span></div></div>`
    if (pn === 'head') return `<div class="t2-nx">${top}<div class="t2-head t2-head--${i.risk}" style="margin:0 0 4px">Для ${n} — ${i.head}</div>${when}</div>`
    return `<div class="t2-nx">${top}${when}<div class="t2-rk"><div><span class="w-cap">сейчас</span><b>${i.now}</b></div><div><span class="w-cap">победа</span><b class="t2-rk--up">${i.up}</b></div><div><span class="w-cap">поражение</span><b class="t2-rk--${i.risk}">${i.dn}</b></div></div></div>`
  }

  // Панель v17–v20 (o.sheet): compact — компактно · sheet — шторка снизу с затемнением · float — всплывающая карточка · min — минимум
  let WHEN = null // v26–v28: как показать «когда» в карточке у строки — big | chip | inline
  // big — крупно, как в v24: LIVE той же высоты, что и время; дата серым
  const bigWhen = w => w === 'live' ? '<span class="t2-bw t2-bw--live">LIVE</span>' : (([d, h]) => d === 'Сегодня' ? `<b class="t2-bw t2-bw--today">${h}</b><span class="w-cap">сегодня</span>` : `<b class="t2-bw t2-bw--later">${d}${h ? ', ' + h : ''}</b>`)(w.split(', '))
  // chip — плашкой: LIVE красная, время сегодня зелёная, дата серая, все одного размера
  const chipWhen = w => w === 'live' ? '<span class="t2-chip t2-chip--live">LIVE</span>' : (([d, h]) => d === 'Сегодня' ? `<span class="t2-chip t2-chip--today">${h}</span>` : `<span class="t2-chip t2-chip--later">${d}${h ? ', ' + h : ''}</span>`)(w.split(', '))
  // Панель (o.sheet): sheet — шторка (v18) · float — карточка (v19) · versus — шторка «против» (v21) · anchor — карточка у строки (v22) ·
  // blur — шторка с размытием (v23) · bigtime — карточка с крупным временем (v24). Все — поверх затемнения, тап мимо закрывает.
  const sheetPanel = (t, n, kind) => {
    const sc = SCHED[t.id] || { list: [] }, x = sc.list.find(r => r[1] === n || r[2] === n)
    const link = x ? `<a class="t2-go2" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener">К матчу ${ic.next}</a>` : ''
    const head = `<div class="t2-p__top"><b class="t2-p__n">${n}</b>${link}</div>`
    const nums = i => `<div class="t2-rk t2-p__rk"><div><span class="w-cap">сейчас</span><b>${i.now}</b></div><div><span class="w-cap">победа</span><b class="t2-rk--up">${i.up}</b></div><div><span class="w-cap">поражение</span><b class="t2-rk--${i.risk}">${i.dn}</b></div></div>`
    let body = '', top = head
    if (!x) body = `<div class="t2-p__line">${(sc.out && sc.out[n]) || 'Ближайший матч ещё не назначен'}</div>`
    else { const opp = x[1] === n ? x[2] : x[1], i = impact(t, n, x), when = x[0] === 'live' ? liveTag : `<span>${x[0]}</span>`
      if (kind === 'versus') { top = `<div class="t2-p__top"><span class="w-cap">ближайший матч</span>${link}</div>`
        body = `<div class="t2-vs"><div><b>${n}</b><span class="w-cap">${oppWhere(t, n) || i.now}</span></div><span class="t2-vs__x">против</span><div><b>${opp}</b><span class="w-cap">${oppWhere(t, opp) || '&nbsp;'}</span></div></div>
          <div class="t2-p__line t2-p__line--c">${when}</div>${nums(i)}` }
      else if (kind === 'bigtime') { const [d, h] = x[0] === 'live' ? ['', ''] : x[0].split(', ')
        top = `<div class="t2-big">${x[0] === 'live' ? '<span class="t2-live t2-live--big">LIVE</span>' : `<b>${h}</b><span class="w-cap">${d}</span>`}${link}</div>`
        body = `<div class="t2-p__line t2-p__line--fg"><b>${n}</b><span class="t2-p__opp">против <b>${opp}</b></span></div>${nums(i)}` }
      else body = `<div class="t2-p__line">${when}<span class="t2-p__opp">против <b>${opp}</b></span></div>${nums(i)}` }
    // Турнир ещё не начался: матчей нет — карточка только про команду (дирижёр 20.10)
    if (kind === 'anchor' && t.fmt === 'soon') return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof">
      <div class="t2-p__top"><span class="w-logo t3-av">${ini(n)}</span><span class="t3-prof__n"><b>${n}</b><span class="w-cap">#${rankOf(n)} в мире</span></span>${dots5(n)}</div></div>`
    if (kind === 'anchor' && t.fmt === 'done') {
      const pl = t.places.find(q => q[1] === n), nx = TOURS.find(q => q.st !== 'done' && q.teams && q.teams.includes(n))
      return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor"><div class="t2-p__top"><span class="t2-chip t2-chip--later t2-chip--32">Завершён</span></div>
        <div class="t2-p__line t2-p__line--fg"><b>${n}</b><span class="t2-p__opp"><b>${pl[0]}-е место</b> · ${nb(pl[2])}</span></div>
        ${inCard() ? `<div class="t3-cf2"><span>#${rankOf(n)} в мире</span><span class="t3-cf2__f">форма ${dots5(n)}</span></div>` : ''}${nx ? `<div class="t2-p__line">Следующий турнир: <b class="t3-nx">${nx.name}</b> · ${nx.dates.split(' – ')[0]}</div>` : ''}${RF === 'col' ? `<div class="t2-p__line">Форма: ${letters(n)}</div>` : ''}</div>`
    }
    if (kind === 'anchor' && WHEN && x) {
      const opp = x[1] === n ? x[2] : x[1], i = impact(t, n, x)
      const vs = `<div class="t2-p__line t2-p__line--fg"><b>${n}</b><span class="t2-p__opp">против <b>${opp}</b></span></div>`
      let top2
      if (WHEN === 'big') top2 = `<div class="t2-big">${bigWhen(x[0])}${link}</div>${vs}`
      // v27: вместо «К матчу» — стрелка-кнопка 32×32 в правом верхнем углу (как кнопки шапки), плашка «когда» той же высоты
      else if (WHEN === 'chip') top2 = `<div class="t2-p__top">${chipWhen(x[0]).replace('t2-chip ', 't2-chip t2-chip--32 ')}<a class="tt-arr t2-go3" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener" aria-label="К матчу">${ic.next}</a></div>${vs}`
      else top2 = `<div class="t2-p__top"><b class="t2-p__n">${n}</b>${link}</div><div class="t2-p__line">${chipWhen(x[0])}<span class="t2-p__opp">против <b>${opp}</b></span></div>`
      // compact (v28): всё в две строки — «когда · против соперника» и места одной строкой
      if (WHEN === 'compact') return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor"><div class="t2-p__top">${chipWhen(x[0])}<span class="t2-p__opp t2-p__opp--fg">против <b>${opp}</b></span>${link}</div>
        <div class="t2-p__mini">сейчас <b>${i.now}</b> · победа <b class="t2-rk--up">${i.up}</b> · поражение <b class="t2-rk--${i.risk}">${i.dn}</b></div></div>`
      const go = `<a class="tt-arr t2-go3" href="/p-fw3k/site/match-page.html" target="_blank" rel="noopener" aria-label="К матчу">${ic.next}</a>`
      // v7–v10 — варианты профиля (дирижёр 20.10: «v6 хорошо, от него пляшем»)
      const lettersChips = `<span class="t3-lc">${[...formOf(n)].map(c => `<b class="t3-lc__${c}">${c === 'W' ? 'В' : 'П'}</b>`).join('')}</span>`
      const mrow = `<div class="t3-prof__m">${chipWhen(x[0])}<span class="t2-p__opp">против <b>${opp}</b></span>${go}</div>`
      const wl = `<div class="t2-p__mini">победа — <b class="t2-rk--up">${i.up}</b> · поражение — <b class="t2-rk--${i.risk}">${i.dn}</b></div>`
      if (RF === 'profile-logo') return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof">
        <div class="t2-p__top"><span class="w-logo t3-av">${ini(n)}</span><span class="t3-prof__n"><b>${n}</b><span class="w-cap">#${rankOf(n)} в мире</span></span>${dots5(n)}</div>${mrow}${wl}</div>`
      if (RF === 'profile-chips') return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof">
        <div class="t2-p__top"><span class="t3-prof__n"><b>${n}</b><span class="w-cap">#${rankOf(n)} в мире</span></span>${lettersChips}</div>${mrow}${wl}</div>`
      if (RF === 'profile-match') return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof t3-prof--m">
        <div class="t3-prof__q"><b>${n}</b><span>#${rankOf(n)}</span>${dots5(n)}</div>
        <div class="t2-p__top">${chipWhen(x[0]).replace('t2-chip ', 't2-chip t2-chip--32 ')}${go}</div><div class="t2-p__line t2-p__line--fg"><span class="t2-p__opp">против <b>${opp}</b></span></div>${wl}</div>`
      if (RF === 'profile-nums') return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof">
        <div class="t2-p__top"><span class="t3-prof__n"><b>${n}</b><span class="w-cap">#${rankOf(n)} в мире</span></span>${dots5(n)}</div>${mrow}${nums(i)}</div>`
      if (RF === 'profile') return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof">
        <div class="t2-p__top"><span class="t3-prof__n"><b>${n}</b><span class="w-cap">#${rankOf(n)} в мире</span></span>${dots5(n)}</div>
        <div class="t3-prof__m">${chipWhen(x[0])}<span class="t2-p__opp">против <b>${opp}</b></span>${go}</div>
        <div class="t2-p__mini">победа — <b class="t2-rk--up">${i.up}</b> · поражение — <b class="t2-rk--${i.risk}">${i.dn}</b></div></div>`
      const rf = RF === 'card' ? `<div class="t3-cf2"><span>#${rankOf(n)} в мире</span><span class="t3-cf2__f">форма ${dots5(n)}</span></div>`
        : RF === 'rankonly' ? `<div class="t3-cf2"><span class="t3-cf2__f">форма ${dots5(n)}</span></div>` : ''
      return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor">${top2}${rf}${nums(i)}${RF === 'col' ? `<div class="t2-p__line t3-cf">Форма: ${letters(n)}</div>` : ''}</div>`
    }
    const shape = { sheet: 'sheet', blur: 'sheet', versus: 'sheet', float: 'float', bigtime: 'float', anchor: 'anchor' }[kind]
    const panel = `<div class="t2-p t2-p--${shape}">${shape === 'sheet' ? '<div class="t2-p__grab"></div>' : ''}${top}${body}</div>`
    return `<div class="t2-ov ${kind === 'blur' ? 't2-ov--blur' : ''}" data-unpick></div>${panel}`
  }

  // Ближайший матч выбранной команды — панелью внизу виджета (v9–v12)
  const next = (t, n) => {
    const sc = SCHED[t.id] || { list: [] }, x = sc.list.find(r => r[1] === n || r[2] === n)
    const body = x ? `<div class="t2-nx__w">${x[0] === 'live' ? '<span class="w-dot"></span>Сейчас в эфире' : x[0]} · против <b>${x[1] === n ? x[2] : x[1]}</b></div><div class="w-cap">${x[3]}</div>`
      : `<div class="t2-nx__w">${(sc.out && sc.out[n]) || 'Ближайший матч ещё не назначен'}</div>`
    return `<div class="t2-nx"><div class="t2-nx__top"><b>${n}</b><span class="w-cap">ближайший матч</span><button class="t2-nx__x" data-unpick aria-label="Закрыть">${ic.close}</button></div>${body}</div>`
  }

  // ——— Список турниров (бургер) ———
  const row = (t, s) => `<button class="w-row w-row--btn" data-id="${t.id}"><span class="w-dot ${t.st === 'soon' ? 'w-dot--soon' : ''}"></span>
    <span class="w-row__main"><div class="w-row__t">${t.name}</div><div class="w-cap">${t.now}</div></span>
    <span class="tt-star ${s.fav.has(t.id) ? 'is-on' : ''}" data-fav="${t.id}" role="button" aria-label="В избранное">${ic.star}</span></button>`
  const list = s => {
    const g = (name, ts) => ts.length ? `<div class="w-lbl">${name}</div>${ts.map(t => row(t, s)).join('')}` : ''
    const fav = TL.filter(t => s.fav.has(t.id))
    return `<div class="tt-search"><input type="text" placeholder="Найти турнир" data-q /></div><div class="w-scroll"><div class="w-bd">
      ${g('Избранное', fav)}${g('Идут', TL.filter(t => t.st === 'live' && !s.fav.has(t.id)))}${g('Скоро', TL.filter(t => t.st === 'soon' && !s.fav.has(t.id)))}${g('Прошли', TL.filter(t => t.st === 'done' && !s.fav.has(t.id)))}
      <div class="w-cap tt-none" hidden>Ничего не нашлось</div></div></div>`
  }

  function html(s) {
    PICK = s.team; MK = s.mk || null; LIVE = !!s.live; WHEN = s.when || null; RF = s.rf || null; TL = s.past ? TOURS.concat(PAST_TOURS) : TOURS
    const t = TL[s.i], m = s.match && MATCHES[s.match].tour === t.id ? MATCHES[s.match] : null
    const arrows = `<span class="tt-arrows"><button class="tt-arr" data-step="-1" ${s.i ? '' : 'disabled'} aria-label="Предыдущий">${ic.back}</button><button class="tt-arr" data-step="1" ${s.i < TL.length - 1 ? '' : 'disabled'} aria-label="Следующий">${ic.next}</button></span>`
    const star = `<button class="tt-arr tt-star ${s.fav.has(t.id) ? 'is-on' : ''}" data-fav="${t.id}" aria-label="Избранное">${ic.star}</button>`
    return `<div class="w-hd tt-hd2"><button class="tt-arr ${s.open ? 'is-on' : ''}" data-open aria-label="Все турниры">${s.open ? ic.close : ic.menu}</button>
      <span class="tt-hd2__t"><b>${t.name}</b><span class="w-cap">${s.i + 1} из ${TL.length} · Dota 2</span></span>${s.open ? '' : star + arrows}</div>`
      + (s.open ? list(s) : (m ? card(t, m, s.sv) : strip(t)) + `<div class="w-scroll"><div class="w-bd">${body(t, m)}</div></div>` + (s.team ? (s.sheet ? sheetPanel(t, s.team, s.sheet) : s.pn ? nextImpact(t, s.team, s.pn) : next(t, s.team)) : ''))
  }
  // Карточка у строки (v22, v26–v28): считаем по реальным прямоугольникам (учитывает zoom), держим строго внутри области прокрутки.
  // Не влезает под строкой — подкручиваем таблицу; в самом конце списка — открываем над строкой. В сетке — ещё и вбок к ячейке.
  const placeAnchor = (el, fit) => {
    const anc = el.querySelector('.t2-p--anchor'), row = el.querySelector('.sel'), scr = el.querySelector('.w-scroll')
    if (!anc || !row || !scr) return
    const W = el.getBoundingClientRect(), z = W.height / el.offsetHeight || 1, rel = r => ({ top: (r.top - W.top) / z, bot: (r.bottom - W.top) / z, left: (r.left - W.left) / z, right: (r.right - W.left) / z })
    const h = anc.offsetHeight, gap = 8
    if (fit) { const br = row.closest('.t2-brw'), box = row.closest('.w-br__m')
      if (br && box) { const bx = rel(box.getBoundingClientRect()), bw = rel(br.getBoundingClientRect()); if (bx.left < bw.left + 8 || bx.right > bw.right - 8) br.scrollLeft += bx.left - bw.left - 16 }
      const r = rel(row.getBoundingClientRect()), sc = rel(scr.getBoundingClientRect()), need = r.bot + gap + h + 8 - sc.bot
      if (need > 0) scr.scrollTop += need
      if (r.top - (need > 0 ? need : 0) < sc.top) scr.scrollTop -= sc.top - (r.top - need) + 8 }
    const r = rel(row.getBoundingClientRect()), sc = rel(scr.getBoundingClientRect())
    let top = r.bot + gap
    if (top + h > sc.bot - 4) top = r.top - gap - h
    top = Math.min(Math.max(top, sc.top + 4), sc.bot - h - 4)
    anc.style.top = top + 'px'
    anc.style.visibility = r.bot < sc.top || r.top > sc.bot ? 'hidden' : ''
  }
  function render(el, o) {
    const s = o.s || (o.s = { i: Math.max(0, TOURS.concat(o.past ? PAST_TOURS : []).findIndex(t => t.id === o.start)), match: o.match, sv: o.stake, tap: o.tap, pn: o.panel, mk: o.marks, live: o.live, sheet: o.sheet, when: o.when, rf: o.rf, past: o.past, team: null, open: false, fav: new Set(['epl']) })
    el.className = 'w w--fixed' + (s.tap ? ` t2-tap t2-tap--${s.tap}` + (s.team ? ' has-pick' : '') : '')
    el.innerHTML = html(s)
    // stay — тот же турнир: прокрутка остаётся на месте (запоминаем её в момент клика), выбранная строка — в зоне видимости
    const go = (p, stay) => { const sc0 = el.querySelector('.w-scroll'), b0 = el.querySelector('.t2-brw'), y = sc0 ? sc0.scrollTop : 0, x = b0 ? b0.scrollLeft : 0
      Object.assign(s, p); render(el, o); if (!stay) return
      const sc = el.querySelector('.w-scroll'), b = el.querySelector('.t2-brw'); if (b) b.scrollLeft = x; if (!sc) return; sc.scrollTop = y
      const sel = el.querySelector('.sel'); if (!sel) return; let top = 0, e = sel; while (e && e !== sc) { top += e.offsetTop; e = e.offsetParent }
      if (top + sel.offsetHeight > sc.scrollTop + sc.clientHeight) sc.scrollTop = top + sel.offsetHeight - sc.clientHeight + 8
      placeAnchor(el, true) }
    if (s.tap) { el.querySelectorAll('[data-team]').forEach(r => r.onclick = () => go({ team: s.team === r.dataset.team ? null : r.dataset.team }, true))
      el.querySelectorAll('[data-unpick]').forEach(b => b.onclick = () => go({ team: null }, true))
      // LIVE-режим (v16): закрыть панель — клик в любом месте виджета мимо команды и мимо самой панели
      if (s.live && s.team) el.onclick = e => { if (!e.target.closest('[data-team], .t2-nx, .t2-p, .w-hd, .t2-brw')) go({ team: null }, true) }
      else el.onclick = null }
    el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => go({ open: !s.open }))
    el.querySelectorAll('[data-id]').forEach(b => b.onclick = e => { if (!e.target.closest('[data-fav]')) go({ i: TL.findIndex(t => t.id === b.dataset.id), open: false, team: null }) })
    el.querySelectorAll('[data-fav]').forEach(b => b.onclick = () => { const id = b.dataset.fav; s.fav.has(id) ? s.fav.delete(id) : s.fav.add(id); go({}, true) })
    el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go({ i: Math.max(0, Math.min(TL.length - 1, s.i + +b.dataset.step)), team: null }))
    const q = el.querySelector('[data-q]')
    if (q) { q.focus({ preventScroll: true }); q.oninput = () => { const v = q.value.trim().toLowerCase(); let n = 0
      el.querySelectorAll('[data-id]').forEach(r => { const hit = r.textContent.toLowerCase().includes(v); r.style.display = hit ? '' : 'none'; n += hit })
      el.querySelectorAll('.w-lbl').forEach(l => { let x = l.nextElementSibling, any = false; while (x && x.matches('[data-id]')) { any = any || x.style.display !== 'none'; x = x.nextElementSibling } l.style.display = any ? '' : 'none' })
      el.querySelector('.tt-none').hidden = n > 0 } }
    placeAnchor(el, !!s.team)
    // карточка едет за строкой при прокрутке таблицы и сетки
    const scrl = el.querySelector('.w-scroll'), bw = el.querySelector('.t2-brw')
    if (el.querySelector('.t2-p--anchor')) { if (scrl) scrl.onscroll = () => placeAnchor(el); if (bw) bw.onscroll = () => placeAnchor(el) }
    // открытый матч — прокрутить к нему
    const hl = el.querySelector('.t2-row, .w-br__m.is-hl'), sc = el.querySelector('.w-scroll')
    if (hl && s.match && sc) { let y = 0, e = hl; while (e && e !== sc) { y += e.offsetTop; e = e.offsetParent } sc.scrollTop = Math.max(0, y - 88)
      const br = hl.closest('.t2-brw'); if (br) br.scrollLeft = hl.closest('.t2-col').offsetLeft - br.offsetLeft - 16 }
  }
  window.T2 = { render, placeAnchor } // placeAnchor — и для виджета замен (widget-roster-2)
})()
