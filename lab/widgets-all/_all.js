// Все виджеты на одной странице — для начальника (дирижёр 21.10): панель сверху — вид (компьютер / телефон), экран (главная / матч / команда),
// зритель (в фэнтези / нет) и какие виджеты показывать. Компьютер — скелетон матча как у начальника (2 колонки, справа виджеты 320),
// телефон — экран 390, виджеты друг под другом. Виджеты — итоговые 23.10 (widgets-23 v2): турнир v11, замены v9, трансферы v4, MVP v13; «Стиль» — темы widgets-23.
// Картинки: в лабе — пути к папкам виджетов; в выгрузке одним файлом (bundle.mjs) — window.IMG, картинки внутри файла.
(() => {
  // Картинка из выгрузки одним файлом: путь «../папка/…» или «папка/…» → data: из window.IMG (bundle.mjs); в лабе — как есть
  const IMGR = window.IMGR = p => window.IMG && p ? (IMG[p.replace(/^(\.\.\/)+/, '')] || p) : p
  const R = (dir, p) => !p || /^(data:|https?:|\/)/.test(p) ? p : /^\.\./.test(p) ? IMGR(p) : window.IMG ? (IMG[`${dir}/${p}`] || p) : `../${dir}/${p}`
  { const D = T4_DATA, f = o => { if (o && o.logo) o.logo = R('widget-tournament-4', o.logo) }; f(D.game); Object.values(D.teams).forEach(f); D.tours.forEach(f) }
  Object.values(SUBS2.games || {}).forEach(g => { g.logo = IMGR(g.logo); g.icon = IMGR(g.icon) }) // значки игр замен v9
  { const D = TR_DATA, f = (o, k) => { if (o && o[k]) o[k] = R('widget-transfers', o[k]) }
    f(D.game, 'logo'); D.games.forEach(g => f(g, 'logo')); Object.values(D.teams).forEach(t => f(t, 'logo')); D.list.forEach(p => f(p, 'photo')) }
  { const D = MVP_DATA, f = (o, k) => { if (o && o[k]) o[k] = R('widget-mvp', o[k]) }
    D.games.forEach(g => f(g, 'logo')); Object.keys(D.teams).forEach(k => D.teams[k] = R('widget-mvp', D.teams[k])); D.list.forEach(p => { f(p, 'photo'); f(p, 'hero') }) }

  { const D = SUBS2; Object.values(D.games || {}).forEach(g => { g.logo = IMGR(g.logo); g.icon = IMGR(g.icon) }) }

  // Виджеты — итоговые по созвону 23.10, как в widgets-23 v2 (дирижёр 23.10): турнир v11, замены v9, трансферы v4, MVP v13
  const T4_OPT = { v3: true, tier: 'fill', tierEn: true, final: 'merge', dt: 'mono' }
  const S3_OPT = { game: 'when', big: true, plainHd: true, tint: true }, MVP_OPT = { up: true, depth: true, dock: 'split' }
  // Экран страницы → вход каждого виджета. Матч в каждом виджете свой: в примере данных у одного матча нет и переходов, и MVP
  const SCR = {
    home: { name: 'Главная', t4: {}, tr: {}, mvp: {} },
    match: { name: 'Матч', t4: { match: { a: 'Power Rangers', b: 'Inner Circle x Insanity' } }, tr: { match: { a: 'Inner Circle x Insanity', b: 'Power Rangers' } }, mvp: { match: { a: 'Team Spirit', b: 'Team Liquid' } } },
    team: { name: 'Команда · Team Spirit', t4: { team: 'Team Spirit' }, tr: { team: 'Team Spirit' }, mvp: { team: 'Team Spirit' } },
  }
  const vs = m => m ? `${m.a} — ${m.b}` : ''
  // «Все состояния» (дирижёр 23.10): у каждого виджета — его экраны подряд, не кликаются; под названием — какой матч / команда
  const lbl = (n, o) => { const m = typeof o.match === 'string' ? (window.SUBS2 || {}).matches?.find(x => x.id === o.match) : o.match
    return m ? `${n}<small>${vs(m)}</small>` : o.team ? `${n}<small>${o.team}</small>` : n }
  // Ошибки (дирижёр 23.10): нет сети и не загрузилось — плашка из-под низа, красная, как widgets-offline v10
  const NET = [['Нет сети — данные на 14:32', 'off'], ['Не загрузилось', 'err']]
  const STATES = {
    t4: [['Главная — список турниров', {}], ['Матч — группа матча', SCR.match.t4], ['Матч — две группы', { match: { a: 'Power Rangers', b: 'Inner Circle x Insanity' }, init: { g: 'B' } }],
      ['Команда — сетка', SCR.team.t4], ['Сетка · середина плей-офф (пример)', { match: { a: 'Team Spirit', b: 'PARIVISION' }, init: { tid: 'blast-slam-8-live' } }], ['Скоро — участники', { init: { tid: 'pari-universe' } }], ['Главная — турниров нет', { empty: true }]].map(([n, o]) => [lbl(n, o), el => T4.render(el, { ...o, opt: T4_OPT })]),
    r2: [['Главная — все замены', {}], ['Матч — замены матча', { match: 'm1' }], ['Замена на карту', { match: 'm2' }], ['Шаг замены', { match: 'm1', s: { d: {}, w: 's1' } }], ['Матч — замен нет', { match: 'm5' }], ['Главная — новых расхождений нет', { empty: true }]].map(([n, o]) => [lbl(n, o), el => S3.render(el, { ...o, ...S3_OPT })]),
    tr: [['Главная — все переходы', {}], ['Матч — команды матча', SCR.match.tr], ['Команда — переходы команды', SCR.team.tr], ['Матч — переходов нет', { match: { a: 'Team Nemesis Academy', b: 'Cloud Dawning' } }], ['Команда — переходов нет', { team: 'Cloud Dawning' }], ['Главная — переходов нет', { empty: true }]].map(([n, o]) => [lbl(n, o), el => TR5.render(el, o)]),
    mvp: [['MVP турнира', {}], ['MVP недели', { s: { i: 1 } }], ['MVP месяца', { s: { i: 2 } }], ['MVP матча', SCR.match.mvp], ['Зритель в фэнтези — игрок в составе', { mine: true }], ['MVP турнира — пока нет', { empty: true }], ['MVP матча — пока нет', { ...SCR.match.mvp, empty: true }]].map(([n, o]) => [lbl(n, o), el => MVPC.render(el, { ...o, ...MVP_OPT })]),
  }
  STATES.t4.push(...NET.map(([n, k]) => [n, el => { T4.render(el, { opt: T4_OPT }); OFF.apply(el, k) }]))
  STATES.r2.push(...NET.map(([n, k]) => [n, el => { S3.render(el, { ...S3_OPT }); OFF.apply(el, k) }]))
  STATES.tr.push(...NET.map(([n, k]) => [n, el => { TR5.render(el, {}); OFF.apply(el, k) }]))
  STATES.mvp.push(...NET.map(([n, k]) => [n, el => { MVPC.render(el, { ...MVP_OPT }); OFF.apply(el, k) }]))
  // Стиль виджетов — темы из widgets-23 (дирижёр 23.10: «чтобы можно было в разных стилях всё посмотреть»)
  const THEMES = [['', 'Базовый'], ['apple', 'Apple'], ['skeuo', 'Скевоморфизм'], ['glow', 'Подсветки'], ['terminal', 'Терминал'], ['nasapunk', 'NASA-панк'], ['mecha', 'Меха-HUD']]
  const W = [
    // extra — настройки конкретного виджета для нижней плашки; нет — «Тут нет дополнительных настроек»
    { id: 't4', name: 'Турнир', extra: [{ key: 't4scr', name: 'Экран', opts: [['home', 'На главной'], ['match', 'В матче'], ['team', 'У команды'], ['live', 'Сетка · идёт матч (пример)']] }],
      draw: (el, sc, st) => T4.render(el, st.x.t4scr === 'live' ? { match: { a: 'Team Spirit', b: 'PARIVISION' }, init: { tid: 'blast-slam-8-live' }, opt: T4_OPT } : { ...SCR[st.x.t4scr].t4, opt: T4_OPT }) },
    { id: 'r2', name: 'Замены', draw: (el, sc) => S3.render(el, { ...(sc.t4.match ? { match: 'm1' } : {}), ...S3_OPT }) },
    { id: 'tr', name: 'Трансферы', draw: (el, sc) => TR5.render(el, sc.tr) }, // у команды — только её переходы (дирижёр 23.10)
    { id: 'mvp', name: 'MVP', extra: [{ key: 'fan', name: 'Зритель', opts: [['no', 'Не в фэнтези'], ['yes', 'В фэнтези']] }], draw: (el, sc, st) => MVPC.render(el, { ...(sc.mvp.match ? { match: sc.mvp.match } : {}), mine: st.x.fan === 'yes', ...MVP_OPT }) },
  ]
  // Настройки (дирижёр 21.10): какой виджет — все или один; где он — экран страницы. «Вид» по ширине экрана сам: компьютер — скелетон, телефон — без скелетона.
  // «Зритель» — в нижней плашке у MVP (настройки конкретного виджета)
  const st = { scr: 'home', one: 'all', theme: '', view: 'page', x: { t4scr: 'home', fan: 'no' } }
  const bar = document.getElementById('bar'), bot = document.getElementById('bot'), stage = document.getElementById('stage'), fab = document.getElementById('fab'), shade = document.getElementById('shade')
  const narrow = () => innerWidth < 760
  const sheet = open => document.body.classList.toggle('is-sheet', open)
  fab.onclick = () => sheet(true); shade.onclick = () => sheet(false)
  addEventListener('resize', () => { const n = narrow(); if (n !== document.body.classList.contains('is-narrow')) draw() })
  const seg = (key, opts) => `<span class="a-seg">${opts.map(([v, l]) => `<button data-k="${key}" data-v="${v}" class="${String(st[key]) === String(v) ? 'is-on' : ''}">${l}</button>`).join('')}</span>`
  // «Все состояния» — кнопка в нижней плашке, только когда выбран один виджет (дирижёр 23.10)
  const stb = () => `<button class="a-stb${st.view === 'states' ? ' is-on' : ''}" data-view>${st.view === 'states' ? '← К странице' : 'Все состояния'}</button>`
  const drawBar = () => { bar.innerHTML = `<b class="a-t">Виджеты · страница матча</b><button class="a-x" data-close aria-label="Закрыть">✕</button>
    <label>Виджеты ${seg('one', [['all', 'Все'], ...W.map(w => [w.id, w.name])])}</label>
    <label>Где ${seg('scr', Object.entries(SCR).map(([k, v]) => [k, v.name]))}</label>
    <label>Стиль ${seg('theme', THEMES)}</label>`
    bar.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { st[b.dataset.k] = b.dataset.v; if (b.dataset.k === 'scr') st.x.t4scr = b.dataset.v; draw() })
    bar.querySelector('[data-close]').onclick = () => sheet(false)

    // Нижняя плашка — настройки выбранного виджета; при «Все» её нет (дирижёр 21.10)
    const w = W.find(x => x.id === st.one); document.body.classList.toggle('has-bot', !!w)
    bot.innerHTML = !w ? '' : `<b class="a-t">${w.name}</b>${w.extra ? w.extra.map(e => `<label>${e.name} <span class="a-seg">${e.opts.map(([v, l]) => `<button data-x="${e.key}" data-v="${v}" class="${st.x[e.key] === v ? 'is-on' : ''}">${l}</button>`).join('')}</span></label>`).join('') : '<span class="a-no">Тут нет дополнительных настроек</span>'}`
    // кнопка «Все состояния» — в нижней плашке виджета (дирижёр 23.10): на компьютере справа, на телефоне во всю ширину
    if (w) bot.insertAdjacentHTML('beforeend', stb())
    bot.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { st.x[b.dataset.x] = b.dataset.v; draw() })
    document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { st.view = st.view === 'states' ? 'page' : 'states'; draw() }) }

  // Скелетон центра: компьютер — график, трансляция, прогноз; телефон — коротко
  const sk = (tag, h) => `<div class="pg-card"><div class="pg-tag">${tag}</div><div class="sk" style="${h}"></div></div>`
  const head = `<div class="pg-hd"><div class="pg-logo"></div><div class="sk-l" style="width:120px"></div><div class="pg-hd__c"><div class="sk-l" style="width:80px;height:24px"></div><div class="sk-l" style="width:140px"></div></div><div class="sk-l" style="width:120px"></div><div class="pg-logo"></div></div>`
  const nav = `<div class="pg-card a-nav"><div class="pg-row"><div class="sk-l" style="width:90px"></div><div class="sk-l" style="width:60px"></div><div class="sk-l" style="width:60px"></div><div class="sk-l" style="width:60px"></div><div class="sk-l" style="width:60px;margin-left:auto"></div></div></div>`
  const slots = () => W.filter(w => st.one === 'all' || st.one === w.id).map(w => `<div class="a-w" data-slot="${w.id}"></div>`).join('')
  const draw = () => { if (st.one === 'all') st.view = 'page'; document.body.className = document.body.className.replace(/\s*th-\S+/g, '') + (st.theme ? ' th-' + st.theme : ''); document.body.classList.toggle('is-narrow', narrow()); drawBar(); if (st.view === 'states') return drawStates(); const sc = SCR[st.scr], centre = st.scr === 'match', view = narrow() ? 'phone' : 'desk'
    stage.className = `a-stage a-stage--${view}`
    stage.innerHTML = view === 'desk'
      ? `<div class="pg pg--outline a-desk">${nav}${centre ? head : ''}<div class="a-grid"><div class="a-main">${centre ? sk('График золота + события', 'height:300px') + `<div class="a-2">${sk('Трансляция', 'aspect-ratio:16/9')}${sk('Прогноз', 'height:100px')}</div>` : sk(st.scr === 'team' ? 'Команда: состав, матчи, статистика' : 'Главная: матч дня, расписание', 'height:420px')}</div><div class="a-side">${slots()}</div></div></div>`
      : `<div class="a-phone${st.one === 'all' ? '' : ' a-phone--one'}"><div class="a-ph-in">${slots()}</div></div>` // телефон — без скелетона; один виджет — по центру экрана
    stage.querySelectorAll('[data-slot]').forEach(el => { const w = W.find(x => x.id === el.dataset.slot), box = document.createElement('div'); el.append(box); w.draw(box, sc, st)
    }) }
  // «Все состояния» (дирижёр 23.10) — кнопка при одном выбранном виджете: вместо страницы — его экраны подряд, не кликаются;
  // компьютер — сеткой, телефон — лентой, листается пальцем
  const drawStates = () => { const ws = W.filter(w => st.one === 'all' || st.one === w.id)
    stage.className = 'a-stage a-states'
    // заголовки групп вместо названия виджета — он и так выбран (дирижёр 23.10): «Состояния с данными» · «Пусто и ошибки» (в названии «нет» + NET)
    const err = n => NET.some(([x]) => x === n)
    const em = n => /нет$/.test(n.replace(/<small>.*$/, '')) // подпись матча (<small>) не в счёт
    const G = [['Состояния с данными', n => !err(n) && !em(n)], ['Пусто и ошибки', n => err(n) || em(n)]] // пустые и ошибки — одним рядом (дирижёр 23.10)
    stage.innerHTML = ws.map(w => `<section class="a-ss">${G.map(([g, f]) => { const it = STATES[w.id].map((x, i) => [x[0], i]).filter(([n]) => f(n))
      return it.length ? `<b class="a-ss__t">${g}</b><div class="a-ss__row">${it.map(([n, i]) => `<div class="a-ss__it"><span>${n}</span><div data-st="${w.id}:${i}"></div></div>`).join('')}</div>` : '' }).join('')}</section>`).join('')
    stage.querySelectorAll('[data-st]').forEach(el => { const [id, i] = el.dataset.st.split(':'); STATES[id][+i][1](el) }) }
  // Тема «Подсветки»: свет за курсором — пишет --gx / --gy (в %) на виджет, как в widgets-23 v6
  stage.addEventListener('pointermove', e => { const w = e.target.closest('.w'); if (!w) return; const b = w.getBoundingClientRect()
    w.style.setProperty('--gx', ((e.clientX - b.left) / b.width * 100).toFixed(1) + '%'); w.style.setProperty('--gy', ((e.clientY - b.top) / b.height * 100).toFixed(1) + '%') })
  draw()
  sheet(narrow()) // на телефоне при первом входе настройки сразу открыты (дирижёр 21.10)
})()
