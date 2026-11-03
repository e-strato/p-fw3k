// Страница новостей (лаба news-page) — на решениях виджета «Новости» (widget-news v36, DECISIONS 30.10): ранг светящейся буквой · ? слух · 🔥 читают · время (моно); поповеры «что значит».
// Данные — настоящие: 92 новости cybersport.ru за 25–30.10 (../news/_feed.js, лаба news Claude-B): заголовок, время, просмотры, комментарии, фото у 30 самых читаемых.
// Ранг — наш: из просмотров и комментариев (S — топ-5, A — следующие 13, B — 28, C — остальные); «по слухам» в заголовке — значок «?». ‼️ Ранг — пример расчёта.
// Раскладка (v18, дирижёр 30.10: «v18 прям нравится»): две колонки; слева группы — «Темы / Ранги / Время» + фильтр ранга; блок группы — колонки «4 мелких | большая | 2 средние с фото»,
// строго: линии, заголовки одного размера, без подсветки. v19: одна бегущая строка сверху — слабые (C) и всё, что не вошло в блоки; группы из одной новости — в общий блок «Ещё»;
// справа вместо «Горячего» (повторял S) — виджет трансферов (v20; «Матчи» из v19 убраны: такого виджета у нас не было); на телефоне — главная, средние, мелкие одной колонкой.
window.NP = (() => {
  const F = window.NEWS_FEED, { FIRE } = window.NFEED
  const P = new URLSearchParams(location.search), FIT = P.has('fit'), fitView = () => (innerWidth < 800 ? 'phone' : 'desk')
  const CFG = { view: FIT ? fitView() : 'desk', g: 't', r: 'all' }
  const score = (n) => n.views + n.com * 40
  const byScore = [...F].sort((a, b) => score(b) - score(a))
  const TIER = new Map(byScore.map((n, i) => [n, i < 5 ? 'S' : i < 18 ? 'A' : i < 46 ? 'B' : 'C']))
  const TT = { S: 'Ранг S — читать обязательно', A: 'Ранг A — важное', B: 'Ранг B — стоит глянуть', C: 'Ранг C — по желанию' }
  const TL = { S: 'читать обязательно', A: 'важное', B: 'стоит глянуть', C: 'по желанию' }
  const k1 = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : n)
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const dayName = (d) => { const x = new Date(d), n = x.getDate(); return (n === 30 ? 'Сегодня' : n === 29 ? 'Вчера' : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][x.getDay()]) + ` · ${n} ${MON[x.getMonth()]}` }
  const rum = (n) => /по слухам|слух|инсайд/i.test(n.title)
  // в сути cybersport слова у ссылок слиплись («PARIVISIONоказалась», «слабееTeam») — расставляем пробелы
  const fixLede = (t) => t.replace(/([A-Za-z0-9~^])([а-яё])/g, '$1 $2').replace(/([а-яё])([A-Z])/g, '$1 $2')
  const short = (t, k = 44) => (t.length > k ? t.slice(0, k - 1).trim() + '…' : t)

  // Темы — правила Claude-B (лаба news, _dense.js RULES): первое совпадение по заголовку
  const RULES = [
    ['spi', 'Team Spirit', 'проиграли OG, выбили LEGION, сегодня — PARIVISION', '#60a5fa', /Spirit/],
    ['pv', 'PARIVISION', 'нижняя сетка после Team Yandex', '#f472b6', /PARIVISION/],
    ['bb', 'BETBOOM и 1w Team', 'вылет, замены и скандал с Pure~', '#f59e0b', /BETBOOM|1w|gpK|bzm|Save-|Stariy bog|Pure~|Petushara/i],
    ['liq', 'Team Liquid', 'Wisper, Malr1ne и спор о языке', '#22d3ee', /Wisper|Malr1ne|Nisha|Liquid/],
    ['uni', 'UNIVERSE by FISSURE', 'плей-офф: Yandex, OG, GamerLegion', '#a78bfa', /UNIVERSE|Nightfall|Yandex|\bOG\b|SabeRLight|Lorenof|Topson|Ceb |Adekvat|9Class/],
    ['game', 'Онлайн и баги', 'минус 300 тыс. ботов, Meepo, крипы', '#4ade80', /[Оо]нлайн|баг|патч|Meepo|MMR|GPM|Steam|кастом|героев|саппортов|бан|rostislav/],
    ['scene', 'Сцена', 'ESL в Мюнхене, PGL, 322 на reddit', '#fb7185', /ESL|PGL|DPC|Fonbet|322|PlayTime|инактив|Astini/],
    ['talk', 'Мнения', 'игроки и аналитики о сцене', '#a1a1aa', /./],
  ]
  const TOPICS = RULES.map(([id, name, sub, col]) => ({ id, name, sub, col, L: [] }))
  F.forEach((n) => { const r = RULES.find((x) => x[4].test(n.title)), t = TOPICS.find((x) => x.id === r[0]); n.topic = t; t.L.push(n) })
  const ok = (n) => CFG.r === 'all' || (CFG.r === 's' ? TIER.get(n) === 'S' : 'SA'.includes(TIER.get(n)))
  const sc = (L) => [...L].sort((a, b) => score(b) - score(a)), tm = (L) => [...L].sort((a, b) => (a.t < b.t ? 1 : -1))
  const when = (n) => (n.t.startsWith('2026-10-30') ? n.t.slice(11, 16) : dayName(n.t).split(' · ')[0] === 'Вчера' ? 'вчера' : `${+n.t.slice(8, 10)} окт`)
  const rk = (n) => `<b class="np-rk t-${TIER.get(n)}" data-pop="${TT[TIER.get(n)]}|Считаем из того, сколько читают и обсуждают">${TIER.get(n)}</b>`
  const mini = (n) => `<span class="np-mm">${rum(n) ? '<i class="np-rum" data-pop="Слух · cybersport.ru|Не подтверждено — проверяйте">?</i>' : ''}<span class="f-heat" data-pop="Читают: ${k1(n.views)}|Просмотры на cybersport.ru">${FIRE}${k1(n.views)}</span><time>${when(n)}</time></span>`
  const tdot = (n) => `<i class="np-td" style="--tc:${n.topic.col}" data-pop="${n.topic.name}|${n.topic.sub}"></i>`
  const seg = (k, arr) => `<div class="t5-seg np-sg">${arr.map(([v, t]) => `<button data-${k}="${v}" class="${CFG[k] === v ? 'is-on' : ''}">${t}</button>`).join('')}</div>`
  // бегущая строка — одна, сверху: слабые (C) и всё, что не вошло в блоки групп
  const tick = (L) => { if (!L.length) return ''; const it = tm(L).map((n) => `<a href="${n.url}" target="_blank" rel="noopener">${tdot(n)}<b class="np-rk t-${TIER.get(n)}">${TIER.get(n)}</b><time>${when(n)}</time>${short(n.title, 80)}</a>`).join('')
    return `<div class="np-tk np-tk--top"><div class="np-tk__in" style="--d:${Math.max(30, L.length * 5)}s">${it}${it}</div></div>` }

  // ячейки: главная — фото на всю ячейку, затемнение снизу, текст на фото; средняя — фото сверху; мелкая — только текст. Заголовок везде одного размера
  const leadCell = (n, wt, area) => `<a class="np-c np-lead${n.img ? ' has-img' : ''}" style="grid-area:${area}" href="${n.url}" target="_blank" rel="noopener">${n.img ? `<img src="${n.img}" alt="" loading="lazy">` : ''}`
    + `<span class="np-c__b"><span class="np-c__t">${rk(n)}${n.title}</span>${n.lede ? `<span class="np-lede">${short(fixLede(n.lede), 170)}</span>` : ''}<span class="np-it__m">${wt ? `${tdot(n)}<span class="np-tn">${n.topic.name}</span>` : ''}${mini(n)}</span></span></a>`
  const small = (n, wt) => `<a class="np-c" href="${n.url}" target="_blank" rel="noopener"><span class="np-c__b"><span class="np-c__t">${rk(n)}${n.title}</span><span class="np-it__m">${wt ? `${tdot(n)}<span class="np-tn">${n.topic.name}</span>` : ''}${mini(n)}</span></span></a>`
  const mid = (n, wt) => `<a class="np-c np-mid${n.img ? ' has-img' : ''}" href="${n.url}" target="_blank" rel="noopener">${n.img ? `<img src="${n.img}" alt="" loading="lazy">` : ''}<span class="np-c__b"><span class="np-c__t">${rk(n)}${n.title}</span><span class="np-it__m">${wt ? `${tdot(n)}<span class="np-tn">${n.topic.name}</span>` : ''}${mini(n)}</span></span></a>`
  // блок группы — колонки «4 мелких | большая | 2 средние с фото»; пустых колонок не рисуем; что не вошло — в бегущую строку
  const block = (N, wt) => { const m = N.find((n) => n.img) || N[0], r = N.filter((n) => n !== m)
    const meds = r.filter((n) => n.img).slice(0, 2), smalls = r.filter((n) => !meds.includes(n)), sm = smalls.slice(0, 4)
    if (CFG.view !== 'desk') return { html: `<div class="np-g np-g--1">${leadCell(m, wt, 'auto')}${meds.map((n) => mid(n, wt)).join('')}${sm.map((n) => small(n, wt)).join('')}</div>`, rest: smalls.slice(4) }
    const cols = [sm.length && `<div class="np-col np-col--s">${sm.map((n) => small(n, wt)).join('')}</div>`, `<div class="np-col np-col--lead">${leadCell(m, wt, 'auto')}</div>`, meds.length && `<div class="np-col">${meds.map((n) => mid(n, wt)).join('')}</div>`].filter(Boolean)
    return { html: `<div class="np-g"><div class="np-cols${cols.length === 1 ? ' is-1' : ''}" style="grid-template-columns:repeat(${cols.length}, minmax(0, 1fr))">${cols.join('')}</div></div>`, rest: smalls.slice(4) } }
  // «Ещё» — группы, где после фильтра одна новость: мелкими в 3 колонки (по кругу), подпись группы — у новости
  const singles = (L) => { const c = CFG.view === 'desk' ? 3 : 1, cols = [...Array(c)].map(() => [])
    L.forEach((n, i) => cols[i % c].push(n))
    return `<section class="np-sec"><div class="np-ds__h"><b>Ещё</b><small>${L.length} — по одной в ${CFG.g === 't' ? 'теме' : 'дне'}</small></div><div class="np-g"><div class="np-cols" style="grid-template-columns:repeat(${c}, minmax(0, 1fr))">${cols.map((C) => `<div class="np-col np-col--s">${C.map((n) => small(n, 1)).join('')}</div>`).join('')}</div></div></section>` }

  // группы: темы / ранги / время → [{ h, N, wt, weak }]
  const groups = () => {
    if (CFG.g === 't') return [...TOPICS].sort((a, b) => b.L.reduce((x, n) => x + score(n), 0) - a.L.reduce((x, n) => x + score(n), 0)).map((t) => { const L = sc(t.L.filter(ok)), strong = L.filter((n) => TIER.get(n) !== 'C')
      return { st: ` style="--tc:${t.col}"`, h: `<div class="np-tc__h"><i class="np-td"></i><b>${t.name}</b><small>${t.sub}</small><span class="np-tc__n" data-pop="${t.L.length} новостей в теме|Читают всего: ${k1(t.L.reduce((a, n) => a + n.views, 0))}">${t.L.length}</span></div>`,
        N: strong.length ? strong : L.slice(0, 1), wt: 0, weak: strong.length ? L.filter((n) => TIER.get(n) === 'C') : L.slice(1) } })
    if (CFG.g === 'r') return ['S', 'A', 'B'].map((t) => ({ h: `<div class="np-rs__h"><b class="np-rk t-${t}" data-pop="${TT[t]}|Считаем из того, сколько читают и обсуждают">${t}</b><b>${TL[t]}</b><small>${F.filter((n) => TIER.get(n) === t).length}</small></div>`, N: sc(F.filter((n) => TIER.get(n) === t && ok(n))), wt: 1, weak: [] }))
      .concat([{ h: '', N: [], wt: 1, weak: CFG.r === 'all' ? F.filter((n) => TIER.get(n) === 'C') : [] }])
    return [...new Set(F.map((n) => n.t.slice(0, 10)))].map((d) => { const Dd = F.filter((n) => n.t.startsWith(d))
      return { h: `<div class="np-ds__h"><b>${dayName(d)}</b><small>${Dd.length} новостей · читают ${k1(Dd.reduce((a, n) => a + n.views, 0))}</small></div>`, N: sc(Dd.filter((n) => ok(n) && TIER.get(n) !== 'C')), wt: 1, weak: CFG.r === 'all' ? Dd.filter((n) => TIER.get(n) === 'C') : [] } }) }
  const feed = () => { const G = groups(), weak = [], one = []
    const html = G.map((g) => { weak.push(...g.weak); if (!g.N.length) return ''; if (g.N.length === 1 && G.filter((x) => x.N.length).length > 1) { one.push(g.N[0]); return '' }
      const b = block(g.N, g.wt); weak.push(...b.rest); return `<section class="np-sec"${g.st || ''}>${g.h}${b.html}</section>` }).join('')
    return { html: html + (one.length ? singles(one) : ''), weak } }

  // справа — только наши утверждённые виджеты: турниры (widget-tournament-6, список, как на главной), трансферы (widget-transfers-2 v12, решение 32 — как на главной); «Активность» убрана (v21, дирижёр 30.10)
  const T4O = { opt: { v3: true, tier: 'fill', tierEn: true, final: 'merge', dt: 'mono' } }, TRO = { opt: { style: 'hltv', v5: true, gameAva: true, skinV1: true, topAll: true, rows: 'tint' } }

  function render() {
    document.body.classList.toggle('is-desk', CFG.view === 'desk')
    const m = document.getElementById('main'), f = feed()
    m.innerHTML = `<div class="np-h"><h1>Новости</h1><small>Dota 2 · cybersport.ru · 25–30 октября</small></div>${tick(f.weak)}
      <div class="top np-lay"><div class="top-l"><div class="np-fb">${seg('g', [['t', 'Темы'], ['r', 'Ранги'], ['d', 'Время']])}${seg('r', [['all', 'Все'], ['sa', 'S и A'], ['s', 'Только S']])}</div>${f.html}</div>
      <aside class="top-r np-side"><div id="np-t4"></div><div id="np-tr"></div></aside></div>`
    const t4 = document.getElementById('np-t4'), tr = document.getElementById('np-tr'); if (t4 && window.T4) window.T4.render(t4, T4O); if (tr && window.TR2) window.TR2.render(tr, TRO)
    window.NFEED.pops(m)
  }
  function mount() {
    render()
    document.addEventListener('click', (e) => { const g = e.target.closest('[data-g], [data-r]'); if (!g) return; if (g.dataset.g) CFG.g = g.dataset.g; if (g.dataset.r) CFG.r = g.dataset.r; render() })
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] }],
      set(k, x) { if (k === 'view') { CFG.view = x; render() } }, toggles: () => [], toggle() {},
      caption: () => 'Новости настоящие (cybersport.ru), ‼️ ранг — наш расчёт из просмотров и комментариев' }
    if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render() } })
  }
  return { mount }
})()
