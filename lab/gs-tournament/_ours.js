// Страница турнира в нашей стилистике (лаба gs-tournament, v2): то, что осталось в v1, без «Участников» (их добавит Claude-B, Т2).
// Данные — как в v0 (Liquipedia API, 28.10); лого команд — ../widget-participants/img/ (Claude-B), герои — img/.
(() => {
  const $ = s => document.querySelector(s);
  const PI = '../widget-participants/';
  const P = new URLSearchParams(location.search), FIT = P.has('fit');
  const fitView = () => (innerWidth < 800 ? 'phone' : 'desk');
  const CFG = { view: FIT ? fitView() : 'desk', tab: 'ov', g: 'A', gv: 't', hv: 't', ht: 'p', hx: null, hm: 'p' };

  // v43 (на странице есть window.DB — общая база _db, «сейчас» 21.08.2026 16:08): турнир — The International 2026; инфо, формат и стадии — из базы (открытые источники),
  //   групповой этап — швейцарка: место, серии, карты, все матчи по порядку и итог (плей-офф / раунд на вылет / выбыли) — из настоящих серий TI (OpenDota)
  const DBM = !!window.DB, DBD = DBM ? window.DB.data : null, TI = DBM ? DBD.tours['ti-2026'] : null
  // v44 (window.DB_TOUR): переключатель турниров в шапке — TI 2026 (идёт) / FISSURE Universe Episode 7 (5–12.10.2025, прошёл; формат как у PARI Universe — две группы по 5, плей-офф)
  //   (дирижёр 03.11: «найти турнир, который в то время уже прошёл», «Universe прошлого года»). Выбор — ?tour=ep7, страница перезагружается
  const EP7 = DBM && window.DB_TOUR === 'universe-ep7', T7 = EP7 ? DBD.tours['universe-ep7'] : null
  const SHORT = { 'Team Yandex': 'Yandex', GamerLegion: 'GL', OG: 'OG', 'Team Liquid': 'Liquid', '1w Team': '1w', 'Team Spirit': 'Spirit', PARIVISION: 'PARI', LEGION: 'LEGION', 'Astra Invicta': 'Astra', 'BetBoom Team': 'BetBoom' };
  const logo = (n, cls = '') => `<span class="lg ${cls}"><img src="${DBM ? window.DB.logo(n) : `${PI}img/team-${n.toLowerCase().replace(/\s+/g, '')}.png`}" alt="" /></span>`;
  const tm = n => `<span class="tmn">${logo(n, 'lg--20')}<span>${n}</span></span>`;
  const card = (title, sub, body) => `<section class="card"><div class="hd"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>${body}</section>`;

  // ——— О турнире (инфобокс) и формат ———
  const info = () => card('О турнире', '', `<div class="ib-logo"><img src="img/pari-universe.png" alt="PARI Universe" /></div>
    <dl class="kv">${[['Тир', '<span class="tag">Tier 1</span>'], ['Даты', '22.10 – 01.11.2026'], ['Серия', 'PARI Universe'], ['Организатор', 'FISSURE'], ['Сервер', 'Europe West'], ['Тип', 'Онлайн'],
      ['Регион', 'Европа'], ['Призовой фонд', '$250 000'], ['Патч', '7.41f'], ['Команд', '10']].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`);

  const format = () => card('Формат', '', `<div class="fmt">
    <div class="fmt-st"><div class="fmt-h"><b>Групповая стадия</b><small>22 – 26.10</small></div>
      <ul><li>Две группы по 5 команд, каждый с каждым в один круг</li><li>Все серии — Bo3</li><li><mark>4 лучших</mark> — в плей-офф, остальные выбывают</li><li><a href="#">Правила тай-брейков</a></li></ul></div>
    <div class="fmt-st"><div class="fmt-h"><b>Плей-офф</b><small>28.10 – 01.11</small></div>
      <ul><li>Double elimination — сетка с нижней веткой</li><li>Гранд-финал — Bo5, остальные серии — Bo3</li></ul></div></div>`);

  // «Формат» в правой колонке (v7–v10): below / above — тот же список, стадии друг под другом; steps — шагами по датам; rows — строками виджета
  const FS = EP7 ? [['Групповой этап', '05 – 08.10.2025', ['Две группы по 5 команд, каждый с каждым в один круг', 'Все серии — Bo2 (бывает ничья 1:1)', '<mark>2 лучших</mark> — в плей-офф, остальные выбывают']],
    ['Плей-офф', '09 – 12.10.2025', ['8 команд: 4 из групп + 4 приглашены (Nigma Galaxy, Team Liquid, HEROIC, Aurora)', 'Double elimination, Bo3; гранд-финал — Bo5']]]
    : DBM ? [['Групповой этап', '13 – 16.08', ['Швейцарская система, 16 команд', 'Все серии — Bo3', '<mark>1–3 места</mark> — сразу в плей-офф, 14–16 — выбывают']],
    ['Раунд на вылет', '16.08', ['10 команд, серии Bo3 на вылет', '<mark>5 победителей</mark> — в плей-офф']],
    ['Плей-офф', '20 – 23.08', ['Double elimination — 8 команд', 'Гранд-финал — Bo5, остальные серии — Bo3']]] : [['Групповая стадия', '22 – 26.10', ['Две группы по 5 команд, каждый с каждым в один круг', 'Все серии — Bo3', '<mark>4 лучших</mark> — в плей-офф, остальные выбывают']],
    ['Плей-офф', '28.10 – 01.11', ['Double elimination — сетка с нижней веткой', 'Гранд-финал — Bo5, остальные серии — Bo3']]];
  const rules = '<a class="more" href="#">Правила тай-брейков ›</a>';
  const fmtSide = () => {
    const k = window.TN_FMT;
    if (k === 'steps') return card('Формат', '', `<ol class="fs">${FS.map(([n, d, li], i) => `<li class="${(EP7 ? true : DBM ? i < 2 : !i) ? 'is-done' : ''}"><i></i><div class="fs-h"><b>${n}</b><small>${d}</small></div><p>${li.join(' · ')}</p></li>`).join('')}</ol>${rules}`);
    if (k === 'rows') return card('Формат', 'Bo3 · финал Bo5', `<div class="fr">${[['22–26.10', 'Групповая стадия', '2 группы по 5 · круг · топ-4 дальше'], ['28.10–01.11', 'Плей-офф', 'Double elimination · финал Bo5']].map(([d, n, s]) =>
      `<div class="fr-r"><span class="fr-d num">${d.replace('–', '<br>–')}</span><span class="fr-t"><b>${n}</b><small>${s}</small></span></div>`).join('')}</div>${rules}`);
    return card('Формат', '', `<div class="fmt fmt--side">${FS.map(([n, d, li]) => `<div class="fmt-st"><div class="fmt-h"><b>${n}</b><small>${d}</small></div><ul>${li.map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div>${rules}`);
  };

  // v5: «О турнире» полосой — главное (тир, даты) первым, дальше остальное
  const infoTop = () => `<section class="card it"><dl class="it-kv">${(EP7 ? [['Тир', '<span class="tag">Tier 1</span>'], ['Даты', '05.10 – 12.10.2025'], ['Команд', String(T7.teams.length)], ['Призовой фонд', T7.prize || '—'], ['Организатор', 'FISSURE'], ['Тип', 'Онлайн · Europe West'], ['Победитель', DBD.teams[T7.standings[0]?.team]?.name || '—']]
    : DBM ? [['Тир', '<span class="tag">Tier 1</span>'], ['Даты', '13.08 – 23.08.2026'], ['Команд', String(TI.teams.length)], ['Призовой фонд', `${TI.prize} <small class="mut">на 21.08</small>`],
    ['Организатор', 'Valve · PGL'], ['Тип', `LAN · ${TI.city.split(',')[0]}`], ['Патч', TI.patch]] : [['Тир', '<span class="tag">Tier 1</span>'], ['Даты', '22.10 – 01.11.2026'], ['Команд', '10'], ['Призовой фонд', '$250 000'],
    ['Организатор', 'FISSURE'], ['Тип', 'Онлайн · Европа'], ['Патч', '7.41f']]).map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></section>`;

  // ——— Групповая стадия ———
  const G = [
    { name: 'Группа A', st: [['Team Yandex', 4, 0, 8, 1], ['GamerLegion', 3, 1, 6, 3], ['OG', 2, 2, 5, 5], ['Team Liquid', 1, 3, 4, 6], ['1w Team', 0, 4, 0, 8]],
      order: ['1w Team', 'GamerLegion', 'OG', 'Team Liquid', 'Team Yandex'],
      x: '0-2 24|0-2 23|0-2 22|0-2 25|2-0 24|2-1 26|2-0 23|0-2 22|2-0 23|1-2 26|2-1 25|0-2 24|2-0 22|0-2 23|1-2 25|1-2 26|2-0 25|2-0 22|2-0 24|2-1 26' },
    { name: 'Группа B', st: [['Team Spirit', 4, 0, 8, 1], ['PARIVISION', 3, 1, 7, 2], ['LEGION', 1, 3, 2, 7], ['Astra Invicta', 1, 3, 3, 6], ['BetBoom Team', 1, 3, 2, 6]],
      order: ['Astra Invicta', 'BetBoom Team', 'PARIVISION', 'Team Spirit', 'LEGION'],
      x: '2-0 23|0-2 22|0-2 25|1-2 24|0-2 23|0-2 25|0-2 24|2-0 26|2-0 22|2-0 25|1-2 26|2-0 23|2-0 25|2-0 24|2-1 26|2-0 22|2-1 24|0-2 26|0-2 23|0-2 22' },
  ];
  const group = g => {
    const cells = g.x.split('|'); let n = 0;
    // «Каждый с каждым»: лого столбцов — сверху (начальник 28.10, 09:53: «логотипы вверх поднял бы»)
    const grid = `<table class="rr"><tr><th></th>${g.order.map(c => `<th>${logo(c, 'lg--20')}</th>`).join('')}</tr>${g.order.map((r, i) => `<tr><th>${logo(r, 'lg--20')}</th>${g.order.map((c, j) => {
      if (i === j) return '<td class="x"></td>'; const [s, d] = cells[n++].split(' '), [a, b] = s.split('-').map(Number);
      return `<td class="${a > b ? 'win' : 'loss'}"><b>${a}:${b}</b><small>${d}.10</small></td>`; }).join('')}</tr>`).join('')}</table>`;
    return `<div class="grp"><div class="lbl">${g.name}</div><div class="grp-row"><table class="tbl gt"><tr><th>#</th><th>Команда</th><th class="c">Серии</th><th class="c">Карты</th></tr>
      ${g.st.map((s, i) => `<tr class="${i < 4 ? 'in' : 'out'}"><td>${i + 1}</td><td>${tm(s[0])}</td><td class="c num">${s[1]}–${s[2]}</td><td class="c num">${s[3]}–${s[4]}</td></tr>`).join('')}</table>
      <div class="scroll">${grid}</div></div></div>`;
  };
  // v11–v14 (TN_GS): справа таблицы больше нет — групповая стадия только здесь, разные подачи (дирижёр 28.10):
  // stack — обе группы друг под другом (таблица + «каждый с каждым») · seg — группы переключателем A / B ·
  // view — переключатель «Таблица / Каждый с каждым», группы рядом · merged — одна таблица на группу: места, результаты по соперникам, серии, карты
  const res = g => { const cells = g.x.split('|'), r = {}; let n = 0;
    g.order.forEach((a, i) => g.order.forEach((b, j) => { if (i !== j) { const [s, d] = cells[n++].split(' '); (r[a] ||= {})[b] = [...s.split('-').map(Number), d]; } })); return r; };
  const cell = v => v ? `<td class="${v[0] > v[1] ? 'win' : 'loss'}"><b>${v[0]}:${v[1]}</b><small>${v[2]}.10</small></td>` : '<td class="x"></td>';
  const standings = g => `<table class="tbl gt"><tr><th>#</th><th>Команда</th><th class="c">Серии</th><th class="c">Карты</th></tr>
    ${g.st.map((s, i) => `<tr class="${i < 4 ? 'in' : 'out'}"><td>${i + 1}</td><td>${tm(s[0])}</td><td class="c num">${s[1]}–${s[2]}</td><td class="c num">${s[3]}–${s[4]}</td></tr>`).join('')}</table>`;
  // «Каждый с каждым» в порядке мест (как таблица слева)
  const cross = g => { const r = res(g), o = g.st.map(s => s[0]);
    return `<table class="rr"><tr><th></th>${o.map(c => `<th>${logo(c, 'lg--20')}</th>`).join('')}</tr>${o.map(a => `<tr><th>${logo(a, 'lg--20')}</th>${o.map(b => cell(a === b ? null : r[a][b])).join('')}</tr>`).join('')}</table>`; };
  const merged = g => { const r = res(g), o = g.st.map(s => s[0]);
    return `<table class="tbl gt gm"><tr><th>#</th><th>Команда</th>${o.map(c => `<th class="gm-h">${logo(c, 'lg--20')}</th>`).join('')}<th class="c">Серии</th><th class="c">Карты</th></tr>
      ${g.st.map((s, i) => `<tr class="${i < 4 ? 'in' : 'out'}"><td>${i + 1}</td><td>${tm(s[0])}</td>${o.map(b => cell(s[0] === b ? null : r[s[0]][b])).join('')}<td class="c num">${s[1]}–${s[2]}</td><td class="c num">${s[3]}–${s[4]}</td></tr>`).join('')}</table>`; };
  // v15–v18 — концепты на основе v14 (дирижёр 28.10: «визуал дотянуть, концептуальные решения»):
  // heat — тепловая карта: цвет по разнице (2:0 ярко, 2:1 бледно), только счёт, дата — подсказкой; на диагонали лого команды
  // path — вместо матрицы матчи по порядку дат: чип «лого соперника + счёт»
  // hover — v14 с перекрестьем: наводишь на клетку — подсвечены строка и столбец, видно «кто — кого»
  // dots — матрица точками (счёт подсказкой), карты — полоской выигранных / проигранных, черта выхода в плей-офф
  const tone = v => v[0] === v[1] ? 'dr' : v[0] > v[1] ? (v[1] === 0 ? 'w2' : 'w1') : (v[0] === 0 ? 'l2' : 'l1');
  const concept = (g, k) => { const r = res(g), o = g.st.map(s => s[0]);
    const tail = s => `<td class="c num">${s[1]}–${s[2]}</td><td class="c num">${s[3]}–${s[4]} <small class="${s[3] - s[4] >= 0 ? 'up' : 'down'}">${s[3] - s[4] > 0 ? '+' : ''}${s[3] - s[4]}</small></td>`;
    const row = (s, i, mid) => `<tr class="${i < 4 ? 'in' : 'out'} ${k === 'dots' && i === 3 ? 'cut' : ''}"><td>${i + 1}</td><td>${tm(s[0])}</td>${mid}${tail(s)}</tr>`;
    const head = mid => `<tr><th>#</th><th>Команда</th>${mid}<th class="c">Серии</th><th class="c">Карты</th></tr>`;
    if (k === 'path') return `<table class="tbl gt gp">${head('<th>Матчи по порядку</th>')}${g.st.map((s, i) => { const ms = o.filter(b => b !== s[0]).map(b => [b, r[s[0]][b]]).sort((x, y) => x[1][2] - y[1][2]);
      return row(s, i, `<td><span class="gp-ms">${ms.map(([b, v]) => `<span class="gp-m ${tone(v)}" title="${b} · ${v[2]}.10">${logo(b, 'lg--16')}<b>${v[0]}:${v[1]}</b></span>`).join('')}</span></td>`); }).join('')}</table>`;
    // телефон v19: heat-t — только места, серии, карты; heat-x — лого команды и клетки, без названий
    if (k === 'heat-t') return `<table class="tbl gt gm gm--heat gm--c">${head('')}${g.st.map((s, i) => row(s, i, '')).join('')}</table>`;
    if (k === 'heat-x') return `<table class="tbl gt gm gm--heat gm--c gm--x"><tr><th>#</th><th></th>${o.map(c => `<th class="gm-h">${logo(c, 'lg--16')}</th>`).join('')}</tr>${g.st.map((s, i) =>
      `<tr class="${i < 4 ? 'in' : 'out'}"><td>${i + 1}</td><td><span class="tmn">${logo(s[0], 'lg--20')}</span></td>${o.map(b => s[0] === b ? `<td class="hx">${logo(b, 'lg--16')}</td>` : `<td class="ht ${tone(r[s[0]][b])}" title="${s[0]} — ${b} · ${r[s[0]][b][2]}.10"><b>${r[s[0]][b][0]}:${r[s[0]][b][1]}</b></td>`).join('')}</tr>`).join('')}</table>`;
    const hd = head(o.map((c, j) => `<th class="gm-h" data-c="${j}">${logo(c, window.TN_COMPACT ? 'lg--16' : 'lg--20')}</th>`).join(''));
    const cl = (a, b, i, j) => { if (a === b) return k === 'heat' ? `<td class="hx">${logo(a, 'lg--16')}</td>` : `<td class="x" data-r="${i}" data-c="${j}"></td>`; const v = r[a][b];
      if (k === 'heat') return `<td class="ht ${tone(v)}" title="${a} — ${b} · ${v[2]}.10"><b>${v[0]}:${v[1]}</b></td>`;
      if (k === 'dots') return `<td class="dt" title="${a} — ${b} · ${v[0]}:${v[1]} · ${v[2]}.10"><i class="${tone(v)}"></i></td>`;
      return `<td class="${v[0] > v[1] ? 'win' : 'loss'}" data-r="${i}" data-c="${j}"><b>${v[0]}:${v[1]}</b><small>${v[2]}.10</small></td>`; };
    return `<table class="tbl gt gm gm--${k}${window.TN_COMPACT ? ' gm--c' : ''}">${hd}${g.st.map((s, i) => row(s, i, o.map((b, j) => cl(s[0], b, i, j)).join(''))).join('')}</table>`;
  };
  // Ep. 7: плей-офф по раундам и итоговые места с призами
  const playoff = () => { if (!EP7) return ''; const nm = (id) => DBD.teams[id].name, PO = DBD.matches.filter((m) => m.tour === 'universe-ep7' && !/^Группа|Тай-брейк/.test(m.stage)), rounds = [...new Set(PO.map((m) => m.stage))]
    const row = (m) => { const w = m.score[0] > m.score[1] ? 0 : 1; return `<div class="po-m"><span class="${w ? 'mut' : 'b'}">${tm(nm(m.a))}</span><b class="num">${m.score[0]}:${m.score[1]}</b><span class="${w ? 'b' : 'mut'}">${tm(nm(m.b))}</span><small class="mut">${m.start.slice(8, 10)}.${m.start.slice(5, 7)}</small></div>` }
    return card('Плей-офф и итог', '09 – 12.10.2025 · double elimination · гранд-финал Bo5', `<div class="po">${rounds.map((r) => `<div class="lbl">${r}</div>${PO.filter((m) => m.stage === r).map(row).join('')}`).join('')}</div>
      <table class="tbl gt"><tr><th>Место</th><th>Команда</th><th class="c">Приз</th></tr>${T7.standings.map((x) => `<tr><td>${x.place}</td><td>${tm(nm(x.team))}</td><td class="c num">${x.prize || '—'}</td></tr>`).join('')}</table>`) }
  const seg = (key, items, cur) => `<div class="sg">${items.map(([v, l]) => `<button class="${v === cur ? 'is-on' : ''}" data-${key}="${v}">${l}</button>`).join('')}</div>`;
  if (EP7) { const nm = (id) => DBD.teams[id].name, GM = DBD.matches.filter((m) => m.tour === 'universe-ep7' && /^Группа/.test(m.stage))
    G.splice(0, G.length, ...T7.groups.map((g) => { const order = g.rows.map((r) => nm(r.team)), ids = g.rows.map((r) => r.team), cells = []
      ids.forEach((a, i) => ids.forEach((b, j) => { if (i === j) return; const m = GM.find((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a)); if (!m) return cells.push('0-0 0')
        const me = m.a === a ? 0 : 1; cells.push(`${m.score[me]}-${m.score[1 - me]} ${+m.start.slice(8, 10)}`) }))
      return { name: g.name, st: g.rows.map((r) => [nm(r.team), `${r.w}–${r.d}`, r.l, r.maps[0], r.maps[1]]), order, x: cells.join('|') } })) }
  const GS_SUB = EP7 ? '05 – 08.10.2025 · Bo2 · 2 лучших — в плей-офф' : DBM ? '13 – 16.08 · швейцарка · Bo3 · 1–3 места — сразу в плей-офф' : '22 – 26.10 · Bo3 · 4 лучших — в плей-офф';
  // DB: швейцарка TI — место, серии, карты, матчи по порядку (лого соперника + счёт, цвет — как в тепловой карте), итог этапа
  const swiss = () => { const sw = window.DB.matches({ tour: 'ti-2026', state: 'done' }).filter((m) => m.stage === 'Групповой этап · швейцарка'), er = window.DB.matches({ tour: 'ti-2026', state: 'done' }).filter((m) => m.stage === 'Раунд на вылет')
    const nm = (id) => DBD.teams[id].name, dd = (m) => m.start.slice(8, 10) + '.' + m.start.slice(5, 7)
    const ms = (id) => sw.filter((m) => m.a === id || m.b === id).map((m) => { const me = m.a === id ? 0 : 1; return [nm(me ? m.a : m.b), [m.score[me], m.score[1 - me]], dd(m)] })
    const fin = (x) => { const e = er.find((m) => m.a === x.team || m.b === x.team); if (x.place <= 3) return '<span class="up">плей-офф</span>'; if (!e) return `<span class="down">выбыли · ${x.out?.place ?? ''}</span>`
      const me = e.a === x.team ? 0 : 1, w = e.score[me] > e.score[1 - me]; return `<span class="${w ? 'up' : 'down'}" title="Раунд на вылет · ${nm(me ? e.a : e.b)} · ${e.score[me]}:${e.score[1 - me]}">${w ? 'плей-офф' : 'выбыли · ' + (x.out?.place ?? '9–13')} <small class="mut">${e.score[me]}:${e.score[1 - me]}</small></span>` }
    const L = TI.standings.slice().sort((a, b) => a.place - b.place)
    return card('Групповой этап', GS_SUB, `<div class="scroll"><table class="tbl gt gp"><tr><th>#</th><th>Команда</th><th>Матчи по порядку</th><th class="c">Серии</th><th class="c">Карты</th><th>Итог</th></tr>
      ${L.map((x, i) => `<tr class="${x.place <= 3 ? 'in' : x.out && /группа/.test(x.out.when) ? 'out' : ''}"><td>${x.place}</td><td>${tm(nm(x.team))}</td><td><span class="gp-ms">${ms(x.team).map(([b, v, d]) => `<span class="gp-m ${tone(v)}" title="${b} · ${d}">${logo(b, 'lg--16')}<b>${v[0]}:${v[1]}</b></span>`).join('')}</span></td>
        <td class="c num">${x.wl.replace('-', '–')}</td><td class="c num">${x.maps.replace('-', '–')}</td><td>${fin(x)}</td></tr>`).join('')}</table></div>`) }
  const groups = () => {
    if (DBM && !EP7) return swiss();
    if (EP7) return card('Групповой этап', GS_SUB + ' · серии: победы–ничьи–поражения', `<div class="grps">${G.map(g => `<div class="grp"><div class="lbl">${g.name}</div><div class="scroll">${concept(g, 'heat')}</div></div>`).join('')}</div>`.replace(/<tr class="in ?/g, '<tr class="in ').replace(/(<tr class=")(in|out)( [^"]*"><td>)([3-5])</g, '$1out$3$4<')) + (window.TN_NOPO ? '' : playoff());   /* TN_NOPO (дирижёр 06.11): «Плей-офф и итог» у Universe не показываем */
    const k = window.TN_GS;
    if (k === 'seg') { const g = G.find(x => x.name.endsWith(CFG.g)) || G[0];
      return card('Групповая стадия', GS_SUB, `${seg('g', [['A', 'Группа A'], ['B', 'Группа B']], CFG.g)}<div class="grp-row">${standings(g)}<div class="scroll">${cross(g)}</div></div>`); }
    if (k === 'view') return card('Групповая стадия', GS_SUB, `${seg('gv', [['t', 'Таблица'], ['x', 'Каждый с каждым']], CFG.gv)}<div class="gpair">${G.map(g =>
      `<div class="grp"><div class="lbl">${g.name}</div>${CFG.gv === 'x' ? `<div class="scroll">${cross(g)}</div>` : standings(g)}</div>`).join('')}</div>`);
    // v19 (TN_COMPACT): тепловая карта компактнее; на телефоне без прокрутки — переключатель «Таблица / Каждый с каждым» (дирижёр 28.10)
    // v22 (TN_FIXV): строки и шапка обоих видов одной высоты до пикселя — одинаковые рамки, лого в одной обёртке
    // v21 (TN_FIXL): лого команды во 2-й колонке стоит в одной точке в обоих видах
    // v20 (TN_FIXW): обе таблицы на всю ширину карточки с фиксированной раскладкой — при переключении ширина не прыгает (дирижёр 28.10)
    // v23 (TN_SEGW): переключатель — на всю ширину карточки
    if (k === 'heat' && window.TN_COMPACT && CFG.view === 'phone') return card('Групповая стадия', GS_SUB, `${seg('hv', [['t', 'Таблица'], ['x', 'Каждый с каждым']], CFG.hv).replace('class="sg"', window.TN_SEGW ? 'class="sg sg--w"' : 'class="sg"')}<div class="grps">${G.map(g =>
      `<div class="grp"><div class="lbl">${g.name}</div>${concept(g, CFG.hv === 'x' ? 'heat-x' : 'heat-t')}</div>`).join('')}</div>`.replace(/gm--c/g, window.TN_FIXW ? 'gm--c gm--fix' + (window.TN_FIXL ? ' gm--fixl' : '') + (window.TN_FIXV ? ' gm--fixv' : '') : 'gm--c'));
    if (['heat', 'path', 'hover', 'dots'].includes(k)) return card('Групповая стадия', GS_SUB, `<div class="grps">${G.map(g => `<div class="grp"><div class="lbl">${g.name}</div><div class="scroll">${concept(g, k)}</div></div>`).join('')}</div>`);
    if (k === 'merged') return card('Групповая стадия', GS_SUB, `<div class="grps">${G.map(g => `<div class="grp"><div class="lbl">${g.name}</div><div class="scroll">${merged(g)}</div></div>`).join('')}</div>`);
    return card('Групповая стадия', GS_SUB, `<div class="grps">${G.map(group).join('')}</div>`);
  };

  // ——— Статистика героев ———
  // v24–v30 (TN_HS): статистика героев — варианты по идеям (дирижёр 28.10: «сделай, покажи визуально»).
  // min — только главное, стороны по нажатию · seg — «Пики / Баны / Стороны» · bar — полоска пик + бан · heat — WR тепловым цветом ·
  // top — топ-3 карточками · teams — по нажатию «кто играл» · combo — min + bar + heat + по нажатию стороны и команды
  let HD = [
    { n: 'Witch Doctor', img: 'witch-doctor', p: 25, pw: 16, rd: [13, 10, 3], dr: [12, 6, 6], b: 8, pb: 33, tm: [['Team Liquid', 4, 1], ['PARIVISION', 3, 2], ['Team Spirit', 4, 0], ['Astra Invicta', 1, 2], ['BetBoom Team', 1, 2]] },
    { n: 'Techies', img: 'techies', p: 24, pw: 11, rd: [12, 7, 5], dr: [12, 4, 8], b: 20, pb: 44, tm: [['Team Liquid', 1, 3], ['Team Yandex', 3, 0], ['OG', 2, 1], ['Astra Invicta', 1, 2], ['BetBoom Team', 1, 2]] },
    { n: 'Dark Willow', img: 'dark-willow', p: 21, pw: 12, rd: [11, 8, 3], dr: [10, 4, 6], b: 9, pb: 30, tm: [['GamerLegion', 4, 2], ['LEGION', 1, 3], ['BetBoom Team', 1, 2], ['PARIVISION', 2, 0], ['Team Spirit', 2, 0]] },
    { n: 'Hoodwink', img: 'hoodwink', p: 20, pw: 7, rd: [9, 3, 6], dr: [11, 4, 7], b: 7, pb: 27, tm: [['Team Spirit', 4, 1], ['Team Liquid', 0, 4], ['BetBoom Team', 1, 2], ['LEGION', 0, 3], ['Astra Invicta', 1, 1]] },
    { n: 'Windranger', img: 'windranger', p: 19, pw: 8, rd: [8, 3, 5], dr: [11, 5, 6], b: 11, pb: 30, tm: [['GamerLegion', 2, 1], ['Team Yandex', 2, 1], ['Team Liquid', 1, 2], ['BetBoom Team', 0, 3], ['OG', 2, 0]] },
  ];
  let GAMES = 50; const pct = (a, b) => (b ? Math.round(a / b * 100) + '%' : '—');
  // v41 (TN_HSFULL): все герои турнира (_heroes-full.js, Liquipedia 02.11), колонки — группами через линии, сортировка по клику на заголовок (созвон 02.11 §2.5)
  const HSF = window.TN_HSFULL && window.TN_HEROES;
  if (HSF) GAMES = window.TN_HEROES.games;
  const SORTK = { p: h => h.p, pv: h => h.pw, pwr: h => (h.p ? h.pw / h.p : -1), pt: h => h.p, r: h => h.rd[0], rv: h => h.rd[1], rwr: h => (h.rd[0] ? h.rd[1] / h.rd[0] : -1), d: h => h.dr[0], dv: h => h.dr[1], dwr: h => (h.dr[0] ? h.dr[1] / h.dr[0] : -1), b: h => h.b, bt: h => h.b, pb: h => h.pb, pbt: h => h.pb, n: h => h.n };
  const hsSorted = () => { const k = CFG.hs || 'pb', f = SORTK[k], dir = CFG.hsd || -1; return [...window.TN_HEROES.list].sort((a, b) => k === 'n' ? dir * -a.n.localeCompare(b.n) : dir * (f(a) - f(b)) || b.pb - a.pb) };
  const wrTone = (w, n) => { if (!n) return ''; const d = w / n - 0.5; return d >= 0.2 ? 'w2' : d > 0 ? 'w1' : d <= -0.2 ? 'l2' : d < 0 ? 'l1' : ''; };
  const wrTxt = (w, n) => `<span class="${w / n >= 0.5 ? 'up' : 'down'}">${pct(w, n)}</span>`;
  const wrHeat = (w, n) => (n ? `<span class="wrh ${wrTone(w, n)}">${pct(w, n)}</span>` : '<span class="wrh mut">—</span>');
  const himg = (h, cls = '') => h.k ? `<img class="${cls}" src="../gs-match/img/heroes/${h.k}.png" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />` : `<img class="${cls}" src="img/h-${h.img}.png" alt="" />`;
  const hname = h => `<span class="hero">${himg(h)}${h.n}</span>`;
  const pbBar = h => `<span class="pbb"><span class="pbb-t"><i class="pk" style="width:${h.p / GAMES * 100}%"></i><i class="bn" style="width:${h.b / GAMES * 100}%"></i></span><b class="num">${pct(h.pb, GAMES)}</b></span>`;
  const sides = h => `<div class="hs-x"><span><b>Radiant</b> ${h.rd[0]} · ${h.rd[1]}–${h.rd[2]} · ${wrTxt(h.rd[1], h.rd[0])}</span><span><b>Dire</b> ${h.dr[0]} · ${h.dr[1]}–${h.dr[2]} · ${wrTxt(h.dr[1], h.dr[0])}</span></div>`;
  const teamsOf = h => `<div class="hs-tm">${h.tm.map(([t, w, l]) => `<span class="hs-t" title="${t}">${logo(t, 'lg--16')}<b class="num">${w}–${l}</b></span>`).join('')}</div>`;
  const HS_SUB = HSF ? window.TN_HEROES.sub : '50 игр · Radiant 27–23';
  const heroes2 = k => {
    if (HSF) HD = hsSorted();
    const open = i => CFG.hx === i;
    const caret = i => `<span class="car">${open(i) ? '⌃' : '⌄'}</span>`;
    if (k === 'min' || k === 'teams' || k === 'combo') {
      const wr = k === 'combo' ? wrHeat : wrTxt;
      const head = k === 'combo' ? '<th>Герой</th><th class="c">Пики</th><th class="c">WR</th><th>Пик + бан</th><th></th>' : '<th>Герой</th><th class="c">Пики</th><th class="c">WR</th><th class="c">Баны</th><th class="c">Пик + бан</th><th></th>';
      return card('Статистика героев', HS_SUB, `<table class="tbl hs2"><tr><th>#</th>${head}</tr>${HD.map((h, i) => `<tr class="hs-r ${open(i) ? 'is-open' : ''}" data-hx="${i}"><td class="mut">${i + 1}</td><td>${hname(h)}</td>
        <td class="c num b">${h.p}</td><td class="c num">${wr(h.pw, h.p)}</td>${k === 'combo' ? `<td>${pbBar(h)}</td>` : `<td class="c num">${h.b}</td><td class="c num">${pct(h.pb, GAMES)}</td>`}<td>${caret(i)}</td></tr>
        ${open(i) ? `<tr class="hs-more"><td></td><td colspan="${k === 'combo' ? 5 : 6}">${k === 'teams' ? `<div class="lbl">Кто играл</div>${teamsOf(h)}` : k === 'combo' ? `${sides(h)}<div class="lbl">Кто играл</div>${teamsOf(h)}` : sides(h)}</td></tr>` : ''}`).join('')}</table>
        ${k === 'combo' ? '<div class="pbl"><span><i class="pk"></i>пики</span><span><i class="bn"></i>баны</span></div>' : ''}<a class="more" href="#">Вся статистика ›</a>`);
    }
    if (k === 'seg') { const t = CFG.ht;
      const cols = t === 'b' ? ['Баны', '% игр', 'Пик + бан', '% игр'] : t === 's' ? ['Radiant', 'WR', 'Dire', 'WR'] : ['Пики', 'В–П', 'WR', '% игр'];
      const val = h => t === 'b' ? [h.b, pct(h.b, GAMES), h.pb, pct(h.pb, GAMES)] : t === 's' ? [`${h.rd[1]}–${h.rd[2]}`, wrTxt(h.rd[1], h.rd[0]), `${h.dr[1]}–${h.dr[2]}`, wrTxt(h.dr[1], h.dr[0])] : [h.p, `${h.pw}–${h.p - h.pw}`, wrTxt(h.pw, h.p), pct(h.p, GAMES)];
      return card('Статистика героев', HS_SUB, `${seg('ht', [['p', 'Пики'], ['b', 'Баны'], ['s', 'Стороны']], t).replace('class="sg"', 'class="sg sg--w"')}<table class="tbl hs2"><tr><th>#</th><th>Герой</th>${cols.map(c => `<th class="c">${c}</th>`).join('')}</tr>
        ${HD.map((h, i) => `<tr><td class="mut">${i + 1}</td><td>${hname(h)}</td>${val(h).map((v, j) => `<td class="c num ${j === 0 ? 'b' : ''}">${v}</td>`).join('')}</tr>`).join('')}</table><a class="more" href="#">Вся статистика ›</a>`); }
    if (k === 'bar') return card('Статистика героев', HS_SUB, `<div class="pbl"><span><i class="pk"></i>пики</span><span><i class="bn"></i>баны</span><span class="mut">доля от 50 игр</span></div>
      <div class="hb">${HD.map(h => `<div class="hb-r">${hname(h)}${pbBar(h)}<span class="hb-wr num">WR ${wrTxt(h.pw, h.p)}</span></div>`).join('')}</div><a class="more" href="#">Вся статистика ›</a>`);
    if (k === 'top') return card('Статистика героев', HS_SUB, `<div class="ht3">${HD.slice(0, 3).map((h, i) => `<div class="ht3-c"><span class="ht3-n">${i + 1}</span>${himg(h, 'ht3-i')}<b>${h.n}</b>
      <div class="ht3-big num">${pct(h.pb, GAMES)}<small>пик + бан</small></div><div class="ht3-s"><span>Пики <b class="num">${h.p}</b></span><span>Баны <b class="num">${h.b}</b></span><span>WR ${wrTxt(h.pw, h.p)}</span></div></div>`).join('')}</div>
      <table class="tbl hs2">${HD.slice(3).map((h, i) => `<tr><td class="mut">${i + 4}</td><td>${hname(h)}</td><td class="c num">${pct(h.pb, GAMES)}</td><td class="c num">${h.p} / ${h.b}</td><td class="c num">${wrTxt(h.pw, h.p)}</td></tr>`).join('')}</table><a class="more" href="#">Вся статистика ›</a>`);
    // v31–v34 (TN_HSM): телефон для v27 — без прокрутки, компьютер как v27 (дирижёр 28.10):
    // cards — карточка на героя, 4 блока · seg — переключатель групп колонок · two — две строки на героя · flip — герои столбцами, показатели строками
    if (k === 'heat' && window.TN_HSM && CFG.view === 'phone') return card('Статистика героев', HS_SUB, (HSF ? '<div class="hsf-box hsf-box--m">' : '') + heroesPhone(window.TN_HSM) + (HSF ? '</div>' : '') + '<a class="more" href="#">Вся статистика ›</a>');
    // heat — та же полная таблица, WR — тепловым цветом, проценты целыми
    if (HSF) { const th = (k, t, c = '') => `<th class="srt ${c} ${CFG.hs === k || (!CFG.hs && k === 'pb') ? 'is-on' : ''}" data-hs="${k}">${t}${CFG.hs === k || (!CFG.hs && k === 'pb') ? `<i>${(CFG.hsd || -1) < 0 ? '↓' : '↑'}</i>` : ''}</th>`
      return card('Статистика героев', HS_SUB, `<div class="scroll hsf-box"><table class="tbl hs hs--full">
      <thead><tr class="grp-h"><th></th><th></th><th colspan="4" class="gs">Пики</th><th colspan="3" class="gs">Radiant</th><th colspan="3" class="gs">Dire</th><th colspan="2" class="gs">Баны</th><th colspan="2" class="gs">Пик + бан</th></tr>
      <tr><th>#</th>${th('n', 'Герой')}${th('p', 'Всего', 'gs')}${th('pv', 'В–П')}${th('pwr', 'WR')}${th('pt', '% игр')}${th('r', 'Всего', 'gs')}${th('rv', 'В–П')}${th('rwr', 'WR')}${th('d', 'Всего', 'gs')}${th('dv', 'В–П')}${th('dwr', 'WR')}${th('b', 'Всего', 'gs')}${th('bt', '% игр')}${th('pb', 'Всего', 'gs')}${th('pbt', '% игр')}</tr></thead>
      <tbody>${HD.map((h, i) => `<tr><td class="mut">${i + 1}</td><td>${hname(h)}</td><td class="num b gs">${h.p}</td><td class="num">${h.pw}–${h.p - h.pw}</td><td>${wrHeat(h.pw, h.p)}</td><td class="num mut">${pct(h.p, GAMES)}</td>
        <td class="num b gs">${h.rd[0]}</td><td class="num">${h.rd[1]}–${h.rd[2]}</td><td>${wrHeat(h.rd[1], h.rd[0])}</td><td class="num b gs">${h.dr[0]}</td><td class="num">${h.dr[1]}–${h.dr[2]}</td><td>${wrHeat(h.dr[1], h.dr[0])}</td>
        <td class="num b gs">${h.b}</td><td class="num mut">${pct(h.b, GAMES)}</td><td class="num b gs">${h.pb}</td><td class="num mut">${pct(h.pb, GAMES)}</td></tr>`).join('')}</tbody></table></div><div class="hsf-n mut">Героев: ${HD.length} · нажми на заголовок — сортировка</div>`); }
    return card('Статистика героев', HS_SUB, `<div class="scroll"><table class="tbl hs">
      <tr class="grp-h"><th></th><th></th><th colspan="4">Пики</th><th colspan="3">Radiant</th><th colspan="3">Dire</th><th colspan="2">Баны</th><th colspan="2">Пик + бан</th></tr>
      <tr><th>#</th><th>Герой</th><th>Всего</th><th>В–П</th><th>WR</th><th>% игр</th><th>Всего</th><th>В–П</th><th>WR</th><th>Всего</th><th>В–П</th><th>WR</th><th>Всего</th><th>% игр</th><th>Всего</th><th>% игр</th></tr>
      ${HD.map((h, i) => `<tr><td class="mut">${i + 1}</td><td>${hname(h)}</td><td class="num b">${h.p}</td><td class="num">${h.pw}–${h.p - h.pw}</td><td>${wrHeat(h.pw, h.p)}</td><td class="num mut">${pct(h.p, GAMES)}</td>
        <td class="num b">${h.rd[0]}</td><td class="num">${h.rd[1]}–${h.rd[2]}</td><td>${wrHeat(h.rd[1], h.rd[0])}</td><td class="num b">${h.dr[0]}</td><td class="num">${h.dr[1]}–${h.dr[2]}</td><td>${wrHeat(h.dr[1], h.dr[0])}</td>
        <td class="num b">${h.b}</td><td class="num mut">${pct(h.b, GAMES)}</td><td class="num b">${h.pb}</td><td class="num mut">${pct(h.pb, GAMES)}</td></tr>`).join('')}</table></div><a class="more" href="#">Вся статистика ›</a>`);
  };
  const heroesPhone = m => {
    const blk = (t, big, sub) => `<div class="hc-b"><span>${t}</span><b class="num">${big}</b><small>${sub}</small></div>`;
    if (m === 'cards') return `<div class="hc">${HD.map((h, i) => `<div class="hc-c"><div class="hc-h"><span class="mut num">${i + 1}</span>${hname(h)}<span class="hc-pb num">${pct(h.pb, GAMES)}<small>пик + бан</small></span></div>
      <div class="hc-g">${blk('Пики', h.p, `${h.pw}–${h.p - h.pw} · ${wrHeat(h.pw, h.p)}`)}${blk('Radiant', h.rd[0], `${h.rd[1]}–${h.rd[2]} · ${wrHeat(h.rd[1], h.rd[0])}`)}
      ${blk('Dire', h.dr[0], `${h.dr[1]}–${h.dr[2]} · ${wrHeat(h.dr[1], h.dr[0])}`)}${blk('Баны', h.b, pct(h.b, GAMES) + ' игр')}</div></div>`).join('')}</div>`;
    if (m === 'seg') { const t = CFG.hm;
      const cols = { p: ['Всего', 'В–П', 'WR', '% игр'], r: ['Всего', 'В–П', 'WR'], d: ['Всего', 'В–П', 'WR'], b: ['Баны', '% игр', 'П + Б', '% игр'] }[t];
      const val = h => ({ p: [h.p, `${h.pw}–${h.p - h.pw}`, wrHeat(h.pw, h.p), pct(h.p, GAMES)], r: [h.rd[0], `${h.rd[1]}–${h.rd[2]}`, wrHeat(h.rd[1], h.rd[0])], d: [h.dr[0], `${h.dr[1]}–${h.dr[2]}`, wrHeat(h.dr[1], h.dr[0])], b: [h.b, pct(h.b, GAMES), h.pb, pct(h.pb, GAMES)] }[t]);
      return `${seg('hm', [['p', 'Пики'], ['r', 'Radiant'], ['d', 'Dire'], ['b', 'Баны']], t).replace('class="sg"', 'class="sg sg--w"')}<table class="tbl hs2 hs-fix"><tr><th>#</th><th>Герой</th>${cols.map(c => `<th class="c">${c}</th>`).join('')}</tr>
        ${HD.map((h, i) => `<tr><td class="mut">${i + 1}</td><td>${hname(h)}</td>${val(h).map((v, j) => `<td class="c num ${j === 0 ? 'b' : ''}">${v}</td>`).join('')}</tr>`).join('')}</table>`; }
    if (m === 'two') return `<div class="h2r">${HD.map((h, i) => `<div class="h2r-r"><div class="h2r-a"><span class="mut num">${i + 1}</span>${hname(h)}<span class="num b">${h.p}</span>${wrHeat(h.pw, h.p)}<span class="num mut">${pct(h.pb, GAMES)}</span></div>
      <div class="h2r-b"><span>Radiant ${h.rd[1]}–${h.rd[2]} ${wrHeat(h.rd[1], h.rd[0])}</span><span>Dire ${h.dr[1]}–${h.dr[2]} ${wrHeat(h.dr[1], h.dr[0])}</span><span>Баны ${h.b}</span></div></div>`).join('')}
      <div class="h2r-l mut">пики · WR · пик + бан</div></div>`;
    // flip — герои столбцами, показатели строками
    const R = [['Пики', h => `<b>${h.p}</b>`], ['В–П', h => `${h.pw}–${h.p - h.pw}`], ['WR', h => wrHeat(h.pw, h.p)], ['Radiant', h => `${h.rd[1]}–${h.rd[2]}`], ['WR', h => wrHeat(h.rd[1], h.rd[0])],
      ['Dire', h => `${h.dr[1]}–${h.dr[2]}`], ['WR', h => wrHeat(h.dr[1], h.dr[0])], ['Баны', h => h.b], ['Пик + бан', h => `<b>${pct(h.pb, GAMES)}</b>`]];
    return `<table class="tbl hfl"><tr><th></th>${HD.map(h => `<th title="${h.n}">${himg(h)}<small>${h.n.split(' ').pop()}</small></th>`).join('')}</tr>
      ${R.map(([n, f], i) => `<tr class="${[2, 4, 6].includes(i) ? 'wr' : ''} ${[3, 5, 7].includes(i) ? 'sep' : ''}"><td class="mut">${n}</td>${HD.map(h => `<td class="c num">${f(h)}</td>`).join('')}</tr>`).join('')}</table>`;
  };
  const heroes = () => {
    if (window.TN_HS) return heroes2(window.TN_HS);
    const H = [['Witch Doctor', 'witch-doctor', '25 16 9 64.00% 50.00% 13 10 3 76.92% 12 6 6 50.00% 8 16.00% 33 66.00%'], ['Techies', 'techies', '24 11 13 45.83% 48.00% 12 7 5 58.33% 12 4 8 33.33% 20 40.00% 44 88.00%'],
      ['Dark Willow', 'dark-willow', '21 12 9 57.14% 42.00% 11 8 3 72.73% 10 4 6 40.00% 9 18.00% 30 60.00%'], ['Hoodwink', 'hoodwink', '20 7 13 35.00% 40.00% 9 3 6 33.33% 11 4 7 36.36% 7 14.00% 27 54.00%'],
      ['Windranger', 'windranger', '19 8 11 42.11% 38.00% 8 3 5 37.50% 11 5 6 45.45% 11 22.00% 30 60.00%']];
    const wr = v => `<span class="${parseFloat(v) >= 50 ? 'up' : 'down'}">${v.replace('.00', '')}</span>`;
    return card('Статистика героев', '50 игр · Radiant 27–23', `<div class="scroll"><table class="tbl hs">
      <tr class="grp-h"><th></th><th></th><th colspan="4">Пики</th><th colspan="3">Radiant</th><th colspan="3">Dire</th><th colspan="2">Баны</th><th colspan="2">Пик + бан</th></tr>
      <tr><th>#</th><th>Герой</th><th>Всего</th><th>В–П</th><th>WR</th><th>% игр</th><th>Всего</th><th>В–П</th><th>WR</th><th>Всего</th><th>В–П</th><th>WR</th><th>Всего</th><th>% игр</th><th>Всего</th><th>% игр</th></tr>
      ${H.map(([n, img, v], i) => { const d = v.split(' ');
        return `<tr><td class="mut">${i + 1}</td><td><span class="hero"><img src="img/h-${img}.png" alt="" />${n}</span></td>
          <td class="num b">${d[0]}</td><td class="num">${d[1]}–${d[2]}</td><td class="num">${wr(d[3])}</td><td class="num mut">${d[4].replace('.00', '')}</td>
          <td class="num b">${d[5]}</td><td class="num">${d[6]}–${d[7]}</td><td class="num">${wr(d[8])}</td>
          <td class="num b">${d[9]}</td><td class="num">${d[10]}–${d[11]}</td><td class="num">${wr(d[12])}</td>
          <td class="num b">${d[13]}</td><td class="num mut">${d[14].replace('.00', '')}</td><td class="num b">${d[15]}</td><td class="num mut">${d[16].replace('.00', '')}</td></tr>`; }).join('')}</table></div>
      <a class="more" href="#">Вся статистика ›</a>`);
  };

  // шапка: лого и название выбранного турнира + переключатель (v44)
  const head = () => { if (!DBM || !$('.th-row--info')) return; const t = EP7 ? T7 : TI, lg = $('.th-logo'), b = $('.th-t b'), sm = $('.th-t small')
    if (lg) lg.src = window.DB.url(t.logo); if (b) b.textContent = t.name; if (sm) sm.textContent = EP7 ? 'Dota 2 · прошёл · 5–12.10.2025' : 'Dota 2 · TI15 · Шанхай · идёт'
    // v45 (TN_SWLAB): переключатель — не в шапке, а в панели песочницы справа (дирижёр 03.11: «переключалка должна быть в лабе»)
    if (!window.TN_SWLAB && !$('#tsw')) $('.th-row--info').insertAdjacentHTML('beforeend', `<div class="sg th-sw" id="tsw">${[['ti', 'TI 2026 · идёт'], ['ep7', 'Universe Ep. 7 · прошёл']].map(([v, l]) => `<button class="${(v === 'ep7') === EP7 ? 'is-on' : ''}" data-tsw="${v}">${l}</button>`).join('')}</div>`) }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-tsw]'); if (!b) return; const u = new URL(location.href); b.dataset.tsw === 'ti' ? u.searchParams.delete('tour') : u.searchParams.set('tour', b.dataset.tsw); location.href = u.toString() })
  function render() {
    head();
    document.body.classList.toggle('is-desk', CFG.view === 'desk');
    if (window.TN_HDINFO && $('#hdinfo')) $('#hdinfo').innerHTML = infoTop().replace('<section class="card it">', '').replace('</section>', '');
    $('#main').innerHTML = CFG.tab === 'ov'
      // v4 (TN_HEROMAIN): статистика героев — в главной колонке, под группами (дирижёр 28.10)
      // v5 (TN_V5): «О турнире» — полосой сверху (начальнику важны тир и даты), справа — только виджет турнира с таблицей групп (дирижёр 28.10)
      // v6 (TN_HDINFO): та же инфа не блоком, а в шапке турнира — справа от названия (дирижёр 28.10)
      // v7–v10 (TN_FMT): «Формат» — в правой колонке, разными подачами: below / above — списком под / над виджетом турнира, steps — шагами, rows — строками как наши виджеты
      ? window.TN_FMT ? `<div class="top"><div class="top-l">${groups()}${heroes()}</div><aside class="top-r">${window.TN_FMT === 'below' ? '' : fmtSide()}${window.TN_GS ? '' : '<div id="tw"></div>'}${window.TN_FMT === 'below' ? fmtSide() : ''}</aside></div>`
      : window.TN_V5 ? `${window.TN_HDINFO ? '' : infoTop()}<div class="top"><div class="top-l">${format()}${groups()}${heroes()}</div><aside class="top-r"><div id="tw"></div></aside></div>`
      : window.TN_HEROMAIN ? `<div class="top"><div class="top-l">${format()}${groups()}${heroes()}</div><aside class="top-r">${info()}</aside></div>`
        : `<div class="top"><div class="top-l">${format()}${groups()}</div><aside class="top-r">${info()}</aside></div>${heroes()}`
      : `<div class="empty">Вкладка «${CFG.tab === 'q' ? 'Квалификация' : 'Статистика'}» — позже</div>`;
    if (window.TN_TOUR && $('#tw')) window.TN_TOUR($('#tw'));
  }
  if ($('#tabs')) $('#tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; CFG.tab = b.dataset.t;
    document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('is-on', x === b)); render(); };
  // v17: перекрестье — подсветить строку и столбец клетки под курсором
  document.addEventListener('mouseover', e => { const t = e.target.closest('.gm--hover'); document.querySelectorAll('.gm--hover .hl').forEach(x => x.classList.remove('hl')); if (!t) return;
    const c = e.target.closest('[data-r]'); if (!c) return; t.querySelectorAll(`[data-r="${c.dataset.r}"], [data-c="${c.dataset.c}"]`).forEach(x => x.classList.add('hl'));
    t.querySelectorAll('tr')[+c.dataset.r + 1].classList.add('hl'); });
  document.addEventListener('click', e => { if (e.target.closest('a[href="#"]')) e.preventDefault();
    const hs = e.target.closest('[data-hs]'); if (hs) { const k = hs.dataset.hs; CFG.hsd = (CFG.hs || 'pb') === k ? -(CFG.hsd || -1) : (k === 'n' ? 1 : -1); CFG.hs = k; const box = $('.hsf-box'), x = box && box.scrollLeft; render(); const nb = $('.hsf-box'); if (nb && x) nb.scrollLeft = x; return; }
    const r = e.target.closest('[data-hx]'); if (r) { CFG.hx = CFG.hx === +r.dataset.hx ? null : +r.dataset.hx; render(); return; }
    const b = e.target.closest('[data-g], [data-gv], [data-hv], [data-ht], [data-hm]'); if (!b) return; if (b.dataset.ht) CFG.ht = b.dataset.ht; if (b.dataset.hm) CFG.hm = b.dataset.hm; if (b.dataset.g) CFG.g = b.dataset.g; if (b.dataset.gv) CFG.gv = b.dataset.gv; if (b.dataset.hv) CFG.hv = b.dataset.hv; render(); });

  // Панель песочницы (window.LAB, view 'toolbar' — см. sandbox-project/lab.tsx)
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] }],
    set(key, v) { if (key === 'view') { CFG.view = v; render(); } },
    toggles: () => [], toggle() {},
    caption: () => 'Наша стилистика, без вкладок; «Участников» добавит Claude-B',
  };
  render();
  if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render(); } });
})();

// Правая колонка на компьютере (дирижёр 03.11): отступ от липкой шапки турнира при прокрутке — как в начале (20), не 47.
// Колонка не влезает в окно — едет со страницей и встаёт с тем же отступом 20 снизу.
(() => {
  const G = 20
  const fit = () => { const r = document.querySelector('.is-desk .top-r'), th = document.querySelector('.th'); if (!r || !th) return
    r.style.top = Math.min(th.offsetHeight + G, innerHeight - r.offsetHeight - G) + 'px' }
  addEventListener('resize', fit); addEventListener('load', fit)
  new ResizeObserver(fit).observe(document.body)
})()
