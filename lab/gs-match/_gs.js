// GoatScout · страница матча — лента матчей одна за другой (пакет заказчика 26.10, §2–§4). Данные — реальные (data/_matches.js, OpenDota),
// «сейчас» — 21.08.2026 16:08 МСК, The International 2026: BetBoom–Iron Wing и Liquid–Falcons сыграны, Vision–Spirit идёт (карта 3, 33:30, настоящая пауза), Yandex–Nigma — до матча.
// Настройки — в панели песочницы (window.LAB, дирижёр 26.10): вид, состояние, зритель, анти-спойлер, игра, серия. Состояние выбирает, с какого матча
// открыть ленту, и меняет его (анонс · перенос · отмена · нет данных …); лента дальше — как есть.
// ‼️ Пример (в данных этого нет): голоса болельщиков, вопросы «Угадай», голоса MVP, прогноз и место в «Ты в матче». Очки — наша формула из статистики.
(() => {
  const D = window.GS_DATA, T = window.GS_TOURNAMENT;
  const NOW = window.GS_NOW; // _wfit.js: 21.08.2026 16:08 МСК
  const { NAME, SHORT } = window.GS_NAMES;
  const FANS = Object.fromEntries(D.series.map((s, i) => [s.series_id, [[412, 236], [188, 97], [129, 643], [9, 6]][i]])); // пример; у последнего < 20 — «Голосуй первым»
  const V4 = window.GS_LAYOUT === 'v4'; // v4: по типовым сайтам (Cyberscore, DLTV): счёт в два уровня, вкладки матча под шапкой, таблица игроков, сыгранные карты
  const QUESTIONS = { live: 'Кто убьёт следующего Рошана?', pre: 'Кто выиграет серию?' };
  const MSK = { timeZone: 'Europe/Moscow' };
  const DELAY_TO = NOW + 86400 - 3600; // перенос — на завтра, 20:00 (пример)

  // Настройки страницы (панель песочницы)
  // Страница в песочнице вне лабы (раздел «Страница матча» / «Виджеты»): ?state= и ?auth= — переключатели песочницы, ?fit=1 — вид по ширине окна
  const Q = new URLSearchParams(location.search), FIT = Q.get('fit') === '1', fitView = () => (innerWidth >= 800 ? 'desk' : 'phone');
  const CFG = { view: FIT ? fitView() : (window.GS_VIEW || 'desk'), // в лабе — сначала компьютер (дирижёр 02.11); GS_VIEW = 'phone' — открыть телефоном
    state: (Q.get('case') && Q.get('case') !== 'none' ? Q.get('case') : '') || Q.get('state') || window.GS_STATE || 'live', mst: (window.WLS_PROD && window.WLS_ST) || Q.get('state') || window.GS_STATE || 'live', // ?case= — особый случай поверх хода матча (панель песочницы, 06.11)
    // GS_STATE — с какого состояния открыть; 06.11 (дирижёр: «что такое лента? — давай удалим»): по умолчанию live, «Ленты» в панели нет
    auth: Q.get('auth') === 'in', spoiler: false, event: !!window.GS_EVENT, // GS_EVENT — сразу с вопросом по событию (лаба w-social v26–v28)
    hd: window.GS_HD || 'h0' }; CFG.state = ({ pre0: 'pre', draft: 'pre', live12: 'live' })[CFG.state] || CFG.state; // GS_HD — вариант шапки (файлы v4-h*.html)
  const START = { feed: 0, post: 0, live: 2, nodata: 2, offline: 2, pre: 3, announce: 3, delayed: 3, cancel: 3 }; // с какого матча открыть
  // v31 (дирижёр 27.10: «лайв не во время паузы показывать везде… сделай её доп состоянием»): GS_PAUSE = 'state' — в Live пауза, на которую попадает «сейчас» (33:30), не идёт,
  // а «Live · пауза» — отдельное состояние в панели. Без флага — как было (пауза в Live всегда)
  const PAUSE_ST = window.GS_PAUSE === 'state';
  // 06.11 (дирижёр: «до матча → драфт → пики кончились → первые 12 минут → обычный лайв → после»; «твои названия хорошие — раздай везде»):
  //   ход матча — 6 шагов; draft и live12 рисует w-lane-2 (_wls-st.js), pre0 — матч не начался, драфта ещё нет; «Анонс» — в особых случаях
  const STATES = [['pre0', 'До матча'], ['draft', 'Драфт'], ['pre', 'Пики готовы'], ['live12', 'Первые 12′'], ['live', 'Live'], ...(PAUSE_ST ? [['pause', 'Live · пауза']] : []), ['post', 'После'],
    ['announce', 'Анонс'], ['nodata', 'Нет данных'], ['offline', 'Нет данных и трансляции'], ['delayed', 'Перенос'], ['cancel', 'Отмена']];
  const CORE = { pre0: 'pre', draft: 'pre', live12: 'live' }, WLSS = ['pre0', 'draft', 'live12']; // шаги, которых _gs.js не знает, — по ядру
  const vs = i => { const m = D.series[i].maps[0]; return `${SHORT[m.radiant_team_id]} — ${SHORT[m.dire_team_id]}`; };
  const CAPTION = { feed: 'Лента как есть: две сыгранные серии → live → до матча; листай вниз', announce: 'Анонс: время матча не назначено',
    pre: `До матча: ${vs(3)}`, live: `Live: ${vs(2)}, карта 3, 33:30${PAUSE_ST ? '' : ', идёт пауза'}`, pause: `Live на паузе: ${vs(2)}, карта 3, 33:30 — игра остановлена`, post: `После: ${vs(0)}, голосование MVP`,
    nodata: 'Live без подробных данных: только счёт по картам, трансляция и драфт', offline: 'Нет данных и трансляции: только счёт и события',
    delayed: 'Перенос: матч сдвинут на завтра, прогноз сохранён', cancel: 'Отмена: прогнозы и ответы не считаются' };

  const $ = (s, r = document) => r.querySelector(s);
  const pauseOn = (m, p, t) => p.time <= t && p.time + p.duration > t && (!PAUSE_ST || CFG.state === 'pause');
  const pausedAt = lx => (lx.m.pauses || []).some(p => pauseOn(lx.m, p, lx.t));
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const clock = ts => new Date(ts * 1000).toLocaleTimeString('ru-RU', { ...MSK, hour: '2-digit', minute: '2-digit' });
  const day = ts => new Date(ts * 1000).toLocaleDateString('ru-RU', { ...MSK, day: 'numeric', month: 'long' });
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const k = n => (Math.abs(n) >= 1000 ? (Math.abs(n) / 1000).toFixed(1).replace('.0', '').replace('.', ',') + 'k' : String(Math.abs(n)));
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; };
  const logo = (id, cls = '') => { const t = D.teams[id]; return t && t.logo ? `<span class="lg ${cls}"><img src="${t.logo}" alt=""></span>` : `<span class="lg lg--txt ${cls}">${esc((SHORT[id] || '?')[0])}</span>`; };
  const hero = id => D.heroes[id] || { name: '?', img: '', icon: '' };
  const nick = p => (D.players[p.account_id] || {}).name || '—';
  const avatar = p => (D.players[p.account_id] || {}).avatar || '';
  const slotIdx = s => (s < 128 ? s : s - 123); // player_slot → индекс в players (0–4 свет, 5–9 тьма)
  const lane = key => (key.includes('_top') ? 'верхней линии' : key.includes('_bot') ? 'нижней линии' : 'центра');
  // Фэнтези-очки — наша формула из статистики карты (не данные OpenDota)
  const pts = q => Math.round(q.kills * 3 - q.deaths + (q.assists ?? 0) * 1.5 + q.nw / 2000);

  // ——— Модель серии в момент NOW ———
  function model(s, ovr = null) {
    const A = s.maps[0].radiant_team_id, B = s.maps[0].dire_team_id;
    const maps = s.maps.map((m, i) => {
      const end = m.start_time + m.duration;
      const st = end <= NOW ? 'done' : m.start_time <= NOW ? 'live' : 'future';
      const t = st === 'done' ? m.duration : st === 'live' ? NOW - m.start_time : 0;
      const win = st === 'done' ? (m.radiant_win ? m.radiant_team_id : m.dire_team_id) : null;
      return { m, i, st, t, win, aRad: m.radiant_team_id === A };
    });
    const sa = maps.filter(x => x.win === A).length, sb = maps.filter(x => x.win === B).length;
    const state = maps.some(x => x.st === 'live') ? 'live' : maps.every(x => x.st === 'done') ? 'post' : 'pre';
    const bo = [1, 3, 5][s.series_type];
    const start = Math.floor(s.maps[0].start_time / 300) * 300; // время по расписанию — до 5 минут
    return { s, A, B, maps, sa, sb, state, bo, start, ovr };
  }
  const noData = M => M.ovr === 'nodata' || M.ovr === 'offline';
  const cancel = M => M.ovr === 'cancel';

  // Карта на момент t: убийства, смерти, ассисты (только по итогу), богатство
  function snap(x) {
    const { m, t, st } = x, full = st === 'done';
    const heroKey = p => 'npc_dota_hero_' + hero(p.hero_id).short;
    const players = m.players.map(p => {
      const kills = p.kills_log.filter(l => l.time <= t).length;
      const deaths = full ? p.deaths : m.players.filter(o => o.isRadiant !== p.isRadiant).reduce((n, o) => n + o.kills_log.filter(l => l.time <= t && l.key === heroKey(p)).length, 0);
      const nw = full ? p.net_worth : p.nw_t[Math.min(Math.floor(t / 60), p.nw_t.length - 1)] || 0;
      return { p, kills, deaths, assists: full ? p.assists : null, nw };
    });
    const kr = players.filter(q => q.p.isRadiant).reduce((n, q) => n + q.kills, 0), kd = players.filter(q => !q.p.isRadiant).reduce((n, q) => n + q.kills, 0);
    return { players, kr, kd, gold: (m.radiant_gold_adv || []).slice(0, Math.floor(t / 60) + 1) };
  }

  // События карты до момента t; без данных — только начало и конец карты
  function events(M, x) {
    const { m, t, i } = x, out = [], name = r => SHORT[r ? m.radiant_team_id : m.dire_team_id];
    const P = s => m.players[slotIdx(s)];
    const ev = (time, html, big, k) => time <= t && out.push({ ts: m.start_time + time, time, map: i + 1, html, big, k }); // k — вид события (значок в острове и ленте)
    ev(0, `Карта ${i + 1} началась`);
    if (x.st === 'done') ev(m.duration, `Карта ${i + 1}: победа <b>${esc(NAME[x.win])}</b> за ${mmss(m.duration)} · убийства ${m.radiant_score}:${m.dire_score}`, true);
    if (noData(M) && x.st === 'live') return out;
    let firstTower = true;
    for (const o of m.objectives) {
      if (o.type === 'CHAT_MESSAGE_FIRSTBLOOD') { const a = P(o.player_slot), v = P(o.victim_player_slot);
        ev(o.time, `Первая кровь: <b>${esc(nick(a))}</b> (${esc(hero(a.hero_id).name)}) — ${esc(nick(v))}`, true, 'kill'); }
      if (o.type === 'building_kill') {
        const by = name(!o.key.includes('goodguys'));
        if (o.key.includes('tower') && firstTower && !o.key.includes('tower4')) { firstTower = false; ev(o.time, `Первая башня — <b>${by}</b>`, false, 'tower'); }
        else if (o.key.includes('melee_rax')) ev(o.time, `<b>${by}</b> ломают казармы ${lane(o.key)}`, true, 'tower');
      }
      if (o.type === 'CHAT_MESSAGE_ROSHAN_KILL') ev(o.time, `Рошан — <b>${name(o.team === 2)}</b>`, true, 'rosh');
      if (o.type === 'CHAT_MESSAGE_AEGIS') ev(o.time, `Аегис у <b>${esc(nick(P(o.player_slot)))}</b>`, false, 'rosh');
      if (o.type === 'CHAT_MESSAGE_AEGIS_STOLEN') ev(o.time, `<b>${esc(nick(P(o.player_slot)))}</b> крадёт аегис`, true);
    }
    for (const f of m.teamfights) if (f.deaths >= 4 && f.end <= t) {
      const g = f.gold_delta.slice(0, 5).reduce((a, b) => a + b, 0) - f.gold_delta.slice(5).reduce((a, b) => a + b, 0);
      ev(f.end, `Драка: ${f.deaths} ${plural(f.deaths, 'смерть', 'смерти', 'смертей')}, сильнее <b>${name(g > 0)}</b>`, false, 'kill');
    }
    for (const p of m.pauses || []) { if (p.time + p.duration > t && !pauseOn(m, p, t)) continue; ev(p.time, p.time + p.duration > t ? 'Пауза — игра остановлена' : `Пауза ${mmss(p.duration)}`); }
    return out;
  }

  // ——— Турнир: форма, очные, факты ———
  const tser = T.series.filter(s => s.start <= NOW);
  // Конец серии: у наших 4 серий — точное время карт, у остальных — старт + длительности (идущая серия не считается сыгранной)
  const ends = {}; D.series.forEach(x => { ends[x.series_id] = Math.max(...x.maps.map(m => m.start_time + m.duration)); });
  const played = id => tser.filter(s => (s.a === id || s.b === id) && (ends[s.series_id] ?? s.start + s.maps.reduce((n, m) => n + m.dur, 0)) < NOW);
  const res = (s, id) => { const w = s.maps.filter(m => m.win === id).length, l = s.maps.length - w; return { w, l, win: w > l, opp: s.a === id ? s.b : s.a }; };
  function facts(M) {
    const f = [];
    for (const id of [M.A, M.B]) {
      const r = played(id).map(s => res(s, id)); if (!r.length) continue;
      const w = r.filter(x => x.win).length;
      f.push(w === r.length ? `${NAME[id]} выиграли все ${r.length} ${plural(r.length, 'серию', 'серии', 'серий')} на турнире` :
        w === 0 ? `${NAME[id]} проиграли все ${r.length} ${plural(r.length, 'серию', 'серии', 'серий')} на турнире` :
        `${NAME[id]} на турнире: ${w} ${plural(w, 'победа', 'победы', 'побед')} в ${r.length} ${plural(r.length, 'серии', 'сериях', 'сериях')}`);
      const last = r[r.length - 1]; f.push(`Последняя серия ${SHORT[id]} — ${last.win ? 'победа' : 'поражение'} ${last.w}:${last.l} против ${NAME[last.opp]}`);
    }
    const h2h = tser.filter(s => (s.a === M.A && s.b === M.B) || (s.a === M.B && s.b === M.A));
    f.push(h2h.length ? `Очные на турнире: ${h2h.map(s => { const r = res(s, M.A); return `${r.w}:${r.l}`; }).join(', ')}` : 'На этом турнире команды ещё не встречались');
    return f.slice(0, 5);
  }

  // ——— Состояние интерфейса по сериям ———
  const UI = {};
  const ui = M => (UI[M.s.series_id] ||= { map: CFG.spoiler ? 0 : (M.maps.find(x => x.st === 'live') || [...M.maps].reverse().find(x => x.st === 'done') || M.maps[0]).i,
    tab: null, ans: null, vote: null, evOpen: false, arOpen: false, bell: false, src: 'Twitch', lang: 'RU', revealed: false, evShown: false, unlocked: 1, other: false });
  const hidden = (M, u) => CFG.spoiler && !u.revealed && M.state !== 'pre';

  // ——— Шапка портала и таб-бар (дирижёр 26.10: «портал GoatScout») ———
  function portal() {
    const nav = ['Матчи', 'Турниры', 'Фэнтези', 'Новости'];
    $('#portal').innerHTML = `<a class="pt-brand" href="#" data-a="toast" data-v="Главная GoatScout (демо)"><span class="pt-logo">◆</span>GoatScout</a>
      <nav class="pt-nav" aria-label="Разделы">${nav.map((n, i) => `<a href="#" ${i ? `data-a="toast" data-v="${n} — отдельный раздел (демо)"` : 'aria-current="page" data-a="back"'}>${n}</a>`).join('')}</nav>
      ${PT_ICS()}${CFG.auth ? '<button class="pt-me" data-a="toast" data-v="Профиль (демо)" aria-label="Профиль">Я</button>' : '<button class="pt-in" data-a="login" data-v="Войди через Telegram — очки, прогнозы и напоминания сохранятся">Войти</button>'}`;
    // кнопки бара — из виджета w-bar (WBAR.tabs), тот же код в лабе w-barst; TB_LOOK — svg (рисованные значки) · bare (без подписей)
    let tb = WBAR.tabs({ auth: CFG.auth, look: window.TB_LOOK || '' });
    // v19: «Поиск» уехал в шапку, его место в баре — «Комментарии» со счётчиком: Матчи, Фэнтези | остров | Комментарии, Войти
    if (CFG.view !== 'desk' && SOC === 'rail' && SOC_M === 'tab5') tb = [tb[0], tb[2], '<div class="tb-soc" data-tbsoc="talk"></div>', tb[3]];
    // лаба w-social v12–v14 (дирижёр 27.10: «остаются и навигация, и кнопки сообщества — красиво обыграть, может, одно из-под другого выезжает; таббар мне до конца не нравился»):
    // dock — бар плавающей капсулой, кнопки сообщества — капсулой поменьше над ним · drawer — кнопки спрятаны за баром, ярлычок на краю — выезжают из-под бара ·
    // pages — у бара две страницы по бокам острова: навигация и сообщество, листаешь по бару или жмёшь точки — одна уезжает, другая въезжает
    const PH = CFG.view !== 'desk' && SOC === 'rail', TBS = PH && SOC_M === 'pages', DOCK = PH && ['dock', 'pages', 'fan', 'idle', 'sheet'].includes(SOC_M); // v15–v17 — тоже капсулой
    if (TBS) { const K = ['like', 'talk', 're', 'share'];
      tb = tb.map((a, i) => `<div class="tb-cell">${a}<div class="tb-soc" data-tbsoc="${K[i]}"></div></div>`); }
    // v23: в центре бара — остров (виджет из лабы w-bar, v11): про матч, который сейчас на экране (CUR_I; дирижёр 28.10: «докрутил до следующего матча — нижняя панель не переключилась»); прилетело событие — вопрос
    // лаба w-social v20–v22 (дирижёр 27.10: «с нуля: обсуждение и остров — отдельно, две пилюли, всегда видны; таббар скрывается по максимуму»):
    // остров не в баре, а в слое #pills над ним вместе с пилюлей «Обсуждение»; листаешь вниз — бар уезжает целиком, пилюли опускаются к низу экрана
    // v23–v25 — тоже одна капсула, как v22 (класс pl-join); v29–v31 — остров и отдельные круглые кнопки (класс pl-panel — остров и кнопки открывают общую панель)
    const PILLS = BAR && SOC === 'rail' && /^pills/.test(SOC_M) && (CFG.view !== 'desk' || DK === 'float' || DK === 'split'); let pl = document.getElementById('pills');
    if (PILLS && models[CUR_I]) { if (!pl) { pl = document.createElement('div'); pl.id = 'pills'; document.body.append(pl); }
      pl.className = `pills pl-${SOC_M}${/^pills[JTFO]$/.test(SOC_M) ? ' pl-join' : ''}${/^pills[TFOABCGHI]$/.test(SOC_M) ? ' pl-panel' : ''}`; pl.innerHTML = (DKON() && DK === 'split' || NOISL ? '' : WBAR.island(barData(models[CUR_I]))) + '<div class="pl-soc" data-plsoc></div>'
        + (DKON() ? '<button class="wsc-p2 wsc-pip" data-pip><i>▶</i>Трансляция</button>' : ''); // w-desk: «Трансляция» — в той же группе
      WSOC.render(pl.querySelector('[data-plsoc]'), { look: SOC_M === 'pillsS' ? 'round' : SOC_M === 'pills' ? 'pill' : /^pills[ABCGHI]$/.test(SOC_M) ? 'btns' : 'seg', mode: SOC_M, M: models[CUR_I], bar: () => barData(models[CUR_I]) }); }
    else if (pl) pl.remove();
    if (BAR && models[CUR_I] && !PILLS && !NOISL) tb.splice(2, 0, WBAR.island(barData(models[CUR_I])));
    $('#tabbar').classList.toggle('wb-on', BAR); $('#tabbar').className = `tabbar${BAR && !PILLS ? ' wb-on' : ''}${PILLS ? ' tb-pills' : ''}${window.TB_LOOK ? ' tb-' + window.TB_LOOK : ''}`; $('#tabbar').innerHTML = tb.join('') + (TBS ? '<button class="tb-pg" data-tbpg aria-label="Навигация / сообщество"><i></i><i></i></button>' : '');
    if (DOCK) $('#tabbar').classList.add('tb-dock');
    if (!TBS) document.querySelectorAll('#tabbar [data-tbsoc]').forEach(el => WSOC.render(el, { look: 'tb', keys: [el.dataset.tbsoc], M: models[CUR_I] }));
    if (TBS) { $('#tabbar').classList.add('tb-s-pages'); document.querySelectorAll('#tabbar [data-tbsoc]').forEach(el => WSOC.render(el, { look: 'tb', keys: [el.dataset.tbsoc], M: models[CUR_I] })); }
  }

  // ——— Блоки ———
  function header(M, u) {
    // v21 (дирижёр 26.10: «V5 нормальный, можно переносить») — шапка матча = виджет из лабы w-header (WHEADER), вкладки матча — в нём же
    // gs-match-2 шаг 2: GS_HD2 — шапка своей функцией (../gs-match-2/_hd2.js): одна строка + маленькие вкладки карт, карты матча отдельным блоком не рисуются
    if (window.GS_HD2) return window.GS_HD2(M, headerData(M, u), msegData(M, u));
    if (window.GS_HD === 'w') return '<header class="gm-hd wh-host"><div data-wd="header"></div></header>';
    const live = M.state === 'live', pre = M.state === 'pre', lx = M.maps.find(x => x.st === 'live'), hid = hidden(M, u);
    const paused = !noData(M) && lx && pausedAt(lx);
    const sc = M.ovr === 'announce' ? '<b class="is-time">—</b>' : M.ovr === 'delayed' ? `<b class="is-time"><s class="mut">${clock(M.start)}</s> ${clock(DELAY_TO)}</b>`
      : cancel(M) ? '<b class="is-time">—</b>' : pre ? `<b class="is-time">${clock(M.start)}</b>` : hid ? '<b class="is-time">Счёт скрыт</b>' : `<b>${M.sa} : ${M.sb}</b>`;
    const stage = M.ovr === 'announce' ? 'Время уточняется — напомним, как только появится' : M.ovr === 'delayed' ? `Перенесён на ${day(DELAY_TO)}, ${clock(DELAY_TO)}`
      : cancel(M) ? 'Матч отменён' : pre ? `${day(M.start) === day(NOW) ? 'Сегодня' : day(M.start)} · через ${Math.round((M.start - NOW) / 60)} мин`
      : hid ? 'Смотреть с начала' : live ? (noData(M) ? `Карта ${lx.i + 1} идёт` : `Карта ${lx.i + 1} · ${mmss(lx.t)}${paused ? ' · пауза' : ''}`) : 'Серия завершена';
    const fans = FANS[M.s.series_id] || [0, 0], n = fans[0] + fans[1];
    const note = M.ovr === 'delayed' ? `Перенесён на ${day(DELAY_TO)}, ${clock(DELAY_TO)}. Прогноз на победителя сохранён, вопросы драфта и карт начнутся заново`
      : cancel(M) ? 'Матч отменён: турнирный день снят. Прогнозы и ответы не считаются, очков нет' : paused ? 'Пауза — игра остановлена. Игровые часы и время ответов стоят' : '';
    const bell = `<button class="ib ib--bell" data-a="bell" aria-label="Напомнить о матче" aria-pressed="${u.bell}" ${cancel(M) ? 'disabled' : ''}>${u.bell ? '🔔' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>'}</button>`;
    const fansRow = cancel(M) ? '' : n >= 20 ? `<div class="fans"><b>${fans[0]}</b><span class="fans__bar"><i style="flex:${fans[0]}"></i><i style="flex:${fans[1]}"></i></span><b>${fans[1]}</b><span>${n} ${plural(n, 'голос', 'голоса', 'голосов')}</span></div>`
      : `<button class="fans__first" data-a="fan">Кто победит? Голосуй первым</button>`;
    const noteRow = note ? `<div class="note ${paused ? '' : 'note--info'}">${note}</div>` : '';
    if (V4 && CFG.hd !== 'h0') return headerV(M, u, { sc, stage, live, hid, bell, fansRow, noteRow });
    return `<header class="gm-hd"><div class="gm-row">
      <button class="ib" data-a="back" aria-label="Назад к расписанию">‹</button>
      <div class="tm">${logo(M.A)}<span>${esc(SHORT[M.A])}</span></div>
      <div class="sc">${sc}<small>${V4 ? score2(M, u) : `Bo${M.bo} · Dota 2`}</small></div>
      <div class="tm tm--b"><span>${esc(SHORT[M.B])}</span>${logo(M.B)}</div>
      <button class="ib ib--bell" data-a="bell" aria-label="Напомнить о матче" aria-pressed="${u.bell}" ${cancel(M) ? 'disabled' : ''}>${u.bell ? '🔔' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>'}</button></div>
      <div class="gm-meta"><span>${esc(T.league)}</span><i class="dot"></i>${live && !hid ? `<span class="is-live">LIVE</span><span>${stage}</span><i class="dot"></i><span>данные с задержкой</span>` : `<span>${stage}</span>`}
        ${hid ? '<button class="gm-reveal" data-a="reveal">Показать счёт</button>' : ''}</div>
      ${V4 ? '' : fansRow}
    </header>${note ? `<div class="note ${paused ? '' : 'note--info'}">${note}</div>` : ''}`;
  }

  // v21: данные для виджета шапки (WHEADER, лаба w-header v5): счёт серии, что сейчас, плашка (пауза / перенос / отмена), вкладки матча
  // лаба w-header-2 v15: стадии турнира по датам серий (даты настоящие, названия стадий — ‼️ пример): самый большой разрыв в днях делит группы и плей-офф, последний день — финал
  const TDAYS = [...new Set(T.series.map(s => day(s.start)))].map(d => ({ d, t: T.series.find(s => day(s.start) === d).start })).sort((a, b) => a.t - b.t);
  const STAGES = (() => { let g = 1; TDAYS.forEach((x, i) => { if (i && x.t - TDAYS[i - 1].t > TDAYS[g].t - TDAYS[g - 1].t) g = i; });
    const span = a => a.length > 1 ? `${a[0].d.split(' ')[0]}–${a[a.length - 1].d}` : a[0].d;
    return [{ t: 'Группы', days: TDAYS.slice(0, g) }, { t: 'Плей-офф', days: TDAYS.slice(g, -1) }, { t: 'Финал', days: TDAYS.slice(-1) }].map(x => ({ ...x, d: span(x.days) })); })();
  function headerData(M, u) {
    const lx = M.maps.find(x => x.st === 'live'), hid = hidden(M, u), off = M.state === 'pre' || cancel(M) || hid;
    const paused = !noData(M) && lx && pausedAt(lx);
    const st = M.ovr === 'announce' ? 'Время уточняется' : M.ovr === 'delayed' ? `Перенос · ${day(DELAY_TO)}, ${clock(DELAY_TO)}` : cancel(M) ? 'Матч отменён'
      : M.state === 'pre' ? `${day(M.start) === day(NOW) ? 'Сегодня' : day(M.start)}, ${clock(M.start)}` : hid ? 'Счёт скрыт'
      : lx ? (noData(M) ? `Карта ${lx.i + 1} идёт` : `Карта ${lx.i + 1} · ${mmss(lx.t)}${paused ? ' · пауза' : ''}`) : '';
    const note = M.ovr === 'delayed' ? 'Прогноз на победителя сохранён, вопросы драфта и карт начнутся заново'
      : cancel(M) ? 'Турнирный день снят. Прогнозы и ответы не считаются, очков нет' : paused ? 'Пауза — игра остановлена. Игровые часы и время ответов стоят' : '';
    const tm = id => ({ name: NAME[id], short: SHORT[id], logo: (D.teams[id] || {}).logo || '' });
    // w-desk: в шапке — остров (head, split), кнопки сообщества и «Трансляция» (head); класс pl-panel — остров и 💬 открывают панель «Событие / Обсуждение»
    const tools = DKON() && (DK === 'head' || DK === 'split') && M === models[CUR_I] && BAR ? `<span class="wh-tools pl-panel">${WBAR.island(barData(M))}${DK === 'head' ? '<span class="wh-soc" data-hdsoc></span><button class="wh-pip" data-pip><i>▶</i>Трансляция</button>' : ''}</span>` : '';
    return { tools, a: tm(M.A), b: tm(M.B), meta: `${T.league} · Bo${M.bo}`, sa: off ? null : M.sa, sb: off ? null : M.sb,
      bo: `Bo${M.bo}`, ...hdCtx(M), // лаба w-header-2 v15: турнир, стадия, день
      win: M.state === 'post' && !hid && !cancel(M) ? (M.sa > M.sb ? 'a' : 'b') : null, st, live: !!lx && !hid, stShort: lx && !noData(M) ? mmss(lx.t) : 'идёт', note, bell: u.bell, bellOff: cancel(M),
      // v24: вкладок в шапке нет (дирижёр 26.10: «все эти штуки убираем»), под ней будут карты матча — лаба w-maps
      tabs: window.GS_TABS === false ? [] : MT.map(t => { const real = V8 || V9 || t === 'Обзор' || t === 'Карты' || t === 'События', n = t === 'Карты' && !hid && !cancel(M) && M.state !== 'pre' ? M.maps.filter(x => x.st !== 'future').length : 0;
        return { t, on: (u.mtab || 'Обзор') === t, a: real ? 'mtab' : 'toast', v: real ? t : `${t} — вкладка матча (демо)`, n }; }) };
  }

  // лаба w-header-2 v15: турнир-родитель — стадия матча и какой это день стадии
  function hdCtx(M) {
    const S = STAGES.find(x => x.days.some(d => d.d === day(M.start))) || STAGES[1], di = S.days.findIndex(d => d.d === day(M.start));
    const si = STAGES.indexOf(S); // prog (v17) — турнир по дням: стадии, сколько дней, какой сегодня
    return { league: T.league, stage: S.t, stageDay: S.days.length > 1 && di >= 0 ? `день ${di + 1} из ${S.days.length}` : '',
      prog: STAGES.map((x, i) => ({ t: x.t, n: x.days.length, st: i < si ? 'done' : i === si ? 'now' : 'next', cur: i === si ? di : -1 })) };
  }

  // v23: остров нижнего бара (w-bar v11) — что в пилюле и событие с вопросом. ‼️ Пример: события-вопроса, голосов и обсуждений в данных нет
  const BAR = window.GS_BAR === 'w';
  // gs-match-2 v1 (созвон 28.10, 13:15: «идея прикольная, но не сработает»): GS_NOISL — остров снят, в нижней группе остаются ♡ / 💬 / поделиться / «Трансляция»
  const NOISL = window.GS_NOISL === true;
  let wbLayer = null;
  function barData(M) {
    const lx = M.maps.find(x => x.st === 'live'), hid = hidden(M, ui(M)), off = cancel(M) || M.ovr === 'announce' || M.ovr === 'delayed';
    const tm = id => ({ name: SHORT[id], logo: (D.teams[id] || {}).logo || '' });
    if (!wbLayer) { wbLayer = document.createElement('div'); wbLayer.className = 'wb-layer'; wbLayer.style.setProperty('--wb-bottom', '72px'); document.body.append(wbLayer); }
    let pill;
    if (lx && !off) { const g = noData(M) || hid ? 0 : (lx.m.radiant_gold_adv || [])[Math.floor(lx.t / 60)] || 0, lead = g > 0 ? lx.m.radiant_team_id : lx.m.dire_team_id;
      pill = { kind: 'live', time: noData(M) ? `Карта ${lx.i + 1}` : mmss(lx.t), lead: g ? `${SHORT[lead]} +${k(g)}` : '', leadTeam: g ? tm(lead) : null, leadBy: g ? k(g) : '',
        paused: !noData(M) && pausedAt(lx), nodata: noData(M), hid }; }
    else if (M.state === 'post' && !off) pill = { kind: 'post', score: hid ? 'скрыт' : `${M.sa}:${M.sb}`, hid };
    else pill = { kind: 'pre', start: M.ovr === 'delayed' ? clock(DELAY_TO) : off ? '—' : clock(M.start), why: cancel(M) ? 'cancel' : M.ovr || '' }; // why — для значков острова (w-barst)
    pill.a = tm(M.A); pill.b = tm(M.B); // лаба w-island (вид logos): логотипы команд в острове
    // v26 (лаба w-social, дирижёр 27.10: «по событиям подробнее… кто-то убит»): событие острова — последнее настоящее событие карты (Рошан, башня, драка, первая кровь),
    // feed — лента событий идущей карты, новое сверху. ‼️ Пример: вопроса, голосов и обсуждений в данных нет
    const feed = lx && !off && !hid && !noData(M) ? events(M, lx).filter(e => e.k).slice(-8).reverse() : [], last = feed.find(e => !/^Аегис/.test(e.html)); // аегис — следствие Рошана, не отдельное событие
    const QS = { rosh: 'Кто возьмёт следующую башню?', tower: 'Кто первым убьёт Рошана?', kill: 'Кто выиграет следующую драку?' };
    const sh = e => (/^Драка/.test(e.html) ? 'Драка' : /^Аегис/.test(e.html) ? 'Аегис' : /^Первая кровь/.test(e.html) ? 'Убит' : { rosh: 'Рошан', tower: 'Башня', kill: 'Убит' }[e.k]);
    const ev = CFG.event && last ? { id: `ev-${M.s.series_id}-${last.time}`, match: `${SHORT[M.A]} — ${SHORT[M.B]}`, what: last.html.replace(/<[^>]+>/g, ''), short: sh(last), ic: last.k, who: '',
      at: mmss(last.time), q: QS[last.k], a: tm(M.A), b: tm(M.B), pa: 62, votes: 1240, talk: 84, T: 45 } : null;
    return { pill, event: ev, layer: wbLayer, base: '', feed: feed.map(e => ({ t: mmss(e.time), k: e.k, html: e.html, big: e.big })) };
  }

  // v25: карты матча — сегменты под шапкой (w-maps v9): «Превью» + все карты серии (Bo3 — 4), не начатые бледные. u.mseg — выбранный (0 — Превью),
  // по умолчанию — идущая карта, после матча — последняя, до — Превью
  const MSEG = window.GS_MSEG === 'w', MSEG_MAIN = MSEG && window.GS_MSEG_MAIN; // v26 — в главной колонке
  // v28: «Статистика к матчу» (лаба w-preview, v21) вместо «Фактов к матчу» и «Очных и формы»; v29 — последним блоком на любой карте
  const STAT = window.GS_STAT === 'w', statBlock = () => '<section class="cd ws-cd"><div data-wd="stat"></div></section>';
  function msegCur(M, u) {
    const lx = M.maps.find(x => x.st === 'live'), last = [...M.maps].reverse().find(x => x.st === 'done'), ok = i => i === 0 || (M.maps[i - 1] && M.maps[i - 1].st !== 'future');
    if (cancel(M) || M.ovr === 'announce' || M.ovr === 'delayed' || M.state === 'pre') return 0;
    return u.mseg != null && ok(u.mseg) ? u.mseg : lx ? lx.i + 1 : last ? last.i + 1 : 0;
  }
  function msegData(M, u) {
    const hid = hidden(M, u), off = cancel(M) || M.ovr === 'announce' || M.ovr === 'delayed', need = Math.ceil(M.bo / 2);
    let a = 0, b = 0;
    const maps = Array.from({ length: M.bo }, (_, j) => { const x = M.maps[j], over = a >= need || b >= need;
      if (!x || off || over || x.st === 'future') return { i: j + 1, t: `Карта ${j + 1}`, st: over && !off ? 'skip' : 'future' };
      if (x.win === M.A) a++; else if (x.win === M.B) b++;
      if (x.st === 'live') return { i: j + 1, t: `Карта ${j + 1}`, st: 'live', time: noData(M) || hid ? 'идёт' : mmss(x.t) };
      return { i: j + 1, t: `Карта ${j + 1}`, st: 'done', time: mmss(x.m.duration), win: hid ? null : { name: SHORT[x.win], logo: (D.teams[x.win] || {}).logo || '' } }; });
    return { key: M.s.series_id, look: 'v9', cur: msegCur(M, u), segs: [{ i: 0, t: 'Превью', st: 'pre', note: M.state === 'pre' ? `${day(M.start) === day(NOW) ? 'Сегодня' : day(M.start)}, ${clock(M.start)}` : 'до матча' }, ...maps] };
  }

  // v4: шапка матча (дирижёр 26.10): основа — «столбиком» (логотип, под ним полное название), счёт и статус в центре.
  // Места под цифры заложены заранее: счёт — в окне одной ширины (2 : 1, 17:10, «—» — не прыгает), под ним слоты всех карт Bo, даже не сыгранных.
  // d3 — основа дальше (дирижёр 26.10): под счётом перевес по золоту (кто впереди на карте и на сколько). Голоса болельщиков — не здесь, а карточкой в контенте
  function headerV(M, u, { live, hid, bell, noteRow }) {
    const pre = M.state === 'pre', off = cancel(M) || M.ovr === 'announce' || M.ovr === 'delayed', lx = M.maps.find(x => x.st === 'live');
    const paused = lx && !noData(M) && pausedAt(lx);
    const status = cancel(M) ? 'Отменён' : M.ovr === 'announce' ? 'Время уточняется' : M.ovr === 'delayed' ? `Перенос · ${day(DELAY_TO)}` : hid ? 'Счёт скрыт'
      : pre ? `через ${Math.round((M.start - NOW) / 60)} мин` : lx ? `<span class="is-live">LIVE</span> Карта ${lx.i + 1}${noData(M) ? '' : ` · <span class="num">${mmss(lx.t)}</span>`}${paused ? ' · пауза' : ''}` : 'Завершён';
    const box = off || hid ? `<span class="sx sx--t">${M.ovr === 'delayed' ? clock(DELAY_TO) : '—'}</span>` : pre ? `<span class="sx sx--t num">${clock(M.start)}</span>`
      : `<span class="sx"><b class="num">${M.sa}</b><i>:</i><b class="num">${M.sb}</b></span>`;
    const back = '<button class="ib" data-a="back" aria-label="Назад к расписанию">‹</button>';
    const reveal = hid ? '<button class="gm-reveal" data-a="reveal">Показать счёт</button>' : '';
    const shown = x => x && x.st !== 'future' && !off && !hid && !(noData(M) && x.st === 'live');
    const sel = M.maps[u.map] && M.maps[u.map].st !== 'future' ? M.maps[u.map] : lx || M.maps[0], side = id => (sel.m.radiant_team_id === id ? 'rad' : 'dire');
    const tc = (id, sub = '') => `<div class="h1-t">${logo(id, 'lg--40')}<b>${esc(NAME[id])}</b><b class="h1-sh">${esc(SHORT[id])}</b>${sub}</div>`;
    const row = (subA = '', subB = '') => `<div class="h1-row">${back}${tc(M.A, subA)}<div class="h1-c">${box}<div class="h1-st">${status}</div></div>${tc(M.B, subB)}${bell}</div>`;
    // слоты карт: Bo штук всегда; сыграна — килы, идёт — килы красным, впереди — «—»
    const slots = cls => `<div class="mk ${cls}">${Array.from({ length: M.bo }, (_, i) => { const x = M.maps[i], ok = shown(x), kk = ok ? killsAB(x) : null;
      return `<span class="mk-c ${ok && x.st === 'live' ? 'is-now' : ''} ${!ok ? 'is-empty' : ''}"><small>К${i + 1}</small><b class="num">${ok ? kk.join(':') : '—'}</b></span>`; }).join('')}</div>`;
    const meta = `<div class="gm-meta"><span>${esc(T.league)}</span><i class="dot"></i><span>Bo${M.bo} · килы по картам</span>${reveal}</div>`;
    let body;
    if (CFG.hd === 'd3') {
      const ok = shown(sel), g = ok ? snap(sel).gold : [], v = g.length ? (sel.aRad ? 1 : -1) * g[g.length - 1] : 0, pct = Math.min(50, Math.abs(v) / 20000 * 50);
      const lead = ok ? (Math.abs(v) < 500 ? 'Поровну по золоту' : `${esc(SHORT[v > 0 ? M.A : M.B])} впереди на ${k(v)} золота`) : pre ? 'Перевес по золоту — с началом карты' : 'Перевес — нет данных';
      body = row() + `<div class="nw ${ok ? '' : 'is-empty'}"><span class="nw-bar"><i style="${v >= 0 ? `right:50%;width:${pct}%` : `left:50%;width:${pct}%`}" class="${v >= 0 ? 'is-a' : 'is-b'}"></i></span>
        <small>${lead}${ok ? ` · К${sel.i + 1}${sel.st === 'live' ? ', ' + mmss(sel.t) : ', итог'}` : ''}</small></div>` + slots('mk--sm') + `<div class="gm-meta"><span>${esc(T.league)}</span>${reveal}</div>`;
    } else body = row() + slots('') + meta;
    return V19 ? `<header class="gm-hd hd1 hd-${CFG.hd}">${body}${noteRow}</header>` : `<header class="gm-hd hd1 hd-${CFG.hd}">${body}</header>${noteRow}`;
  }

  // v4: голоса болельщиков — из шапки в контент (дирижёр 26.10: «шапка показывает только самое важное — матч»)
  function fansBlock(M) {
    if (cancel(M)) return '';
    const f = FANS[M.s.series_id] || [0, 0], n = f[0] + f[1];
    const side = (id, v) => `<span class="fv-t">${logo(id, 'lg--20')}<span>${esc(SHORT[id])}</span>${n >= 20 ? `<b class="num">${Math.round(v / n * 100)}%</b>` : ''}</span>`;
    return `<section class="cd"><div class="cd-hd"><b>Кто победит</b><small>${n >= 20 ? `${n} ${plural(n, 'голос', 'голоса', 'голосов')} болельщиков` : 'голосов пока мало'}</small></div><div class="cd-bd">
      <div class="fv">${side(M.A, f[0])}${side(M.B, f[1])}</div>${n >= 20 ? `<span class="fans__bar fv-bar"><i style="flex:${f[0]}"></i><i style="flex:${f[1]}"></i></span>` : ''}
      <button class="btn btn--ghost fv-go" data-a="fan">${n >= 20 ? 'Голосовать' : 'Голосуй первым'}</button></div></section>`;
  }

  // v4: второй уровень счёта под серией (наш разбор 06.10: «серия крупно, под ней Карта 1 · 12 мин · килы 4:4»; конец — итог по картам)
  const killsAB = x => { const sn = snap(x); return x.aRad ? [sn.kr, sn.kd] : [sn.kd, sn.kr]; };
  function score2(M, u) {
    const lx = M.maps.find(x => x.st === 'live');
    if (hidden(M, u) || cancel(M) || M.ovr === 'announce' || M.ovr === 'delayed' || M.state === 'pre') return `Bo${M.bo} · Dota 2`;
    if (lx) return noData(M) ? `Карта ${lx.i + 1} · идёт` : `Карта ${lx.i + 1} · ${mmss(lx.t)} · <b class="num">${killsAB(lx).join(' : ')}</b> килы`;
    return 'Завершён · ' + M.maps.filter(x => x.st === 'done').map(x => killsAB(x).join(':')).join(' · ');
  }
  // v4: вкладки матча под шапкой (как у Cyberscore: обзор · очные · стадия турнира · игроки); кроме «Обзор» — демо
  // v6 (дирижёр 26.10): вкладки — над главной колонкой (меняют только её); «Обзор» — матч сейчас (идущая или последняя карта, без чипов карт),
  // разбор по картам — во вкладке «Карты» (чипы, график, игроки и «Сыгранные карты» выбранной карты). Остальные вкладки — демо
  // v19 (дирижёр 26.10): всё на странице — виджеты трёх мест: во всю ширину (шапка матча с вкладками), главная колонка, правая колонка.
  // Ничего не висит само по себе: плашка паузы — внутри шапки, подпись «последняя карта…» — низом виджета графика, ссылки «Все …» — низом своего виджета.
  // На телефоне — шапка, главная колонка, потом правая. Подписи виджетов — переключатель в панели
  // v20 (дирижёр 26.10): на компьютере без «ушей» — страница во всю ширину окна, главная колонка тянется сколько угодно, поля по бокам 32
  const V20 = window.GS_V20 === true;
  if (V20) document.body.classList.add('no-ears');
  const V19 = window.GS_V19 === true || V20;
  const V18 = window.GS_V18 === true || V19; // v18: как v17, на телефоне шапка одного среднего размера, не сжимается, названия всегда (дирижёр 26.10)
  if (V18) document.body.classList.add('hd-mid');
  const V17 = window.GS_V17 === true || V18; // v17: как v16, на телефоне виджеты — во всю ширину, как карточки (дирижёр 26.10)
  if (V17) document.body.classList.add('wd-full');
  const V16 = window.GS_V16 === true || V17; // v16: как v15, на телефоне без пилюль килов и строки турнира, шапка сжимается плавно (дирижёр 26.10)
  const V15 = window.GS_V15 === true || V16; // v15: как v14, на телефоне — виджеты правой колонки под контентом вкладки (дирижёр 26.10)
  const V14 = window.GS_V14 === true || V15; // v14: как v13, на телефоне шапка матча ужимается, пока листаешь вниз (дирижёр 26.10)
  const V13 = window.GS_V13 === true || V14; // v13: как v12, вкладки матча прилипают под шапкой матча (дирижёр 26.10)
  const V12 = window.GS_V12 === true || V13; // v12: как v11, без вкладок «Турнир» и «Очные» (дирижёр 26.10)
  const V10 = window.GS_V10 === true || window.GS_V11 === true || V12, V11 = window.GS_V11 === true || V12;
  const V8 = window.GS_V8 === true || V10, V9 = window.GS_V9 === true;
  const V6 = window.GS_V6 === true || window.GS_V7 === true || V8 || V9;
  // v7 (дирижёр 26.10: «информация задублировалась»): «Обзор» — вся серия без разбора одной карты: серия по картам (строка на карту с мини-графиком,
  // тап — во вкладку «Карты» на эту карту), трансляция в live, игроки за серию; «Карты» — только разбор выбранной карты
  const V7 = window.GS_V7 === true || V8 || V9;
  // v8 (дирижёр 26.10): «Обзор» — самое интересное сейчас: в live — идущая карта (график · трансляция · драфт этой карты) и её игроки, после — итог по картам
  // и последняя карта. «Вокруг матча» → вкладка «Новости», ссылки (статистика, очные, сетка) → свои вкладки: виджет + ссылка на главную страницу раздела.
  // Угадайки (вопрос, MVP, кто победит) — в правой колонке одним блоком с «Ты в матче». v9 — то же, но угадайки внутри «Событий» в правой колонке
  const sub8 = h => h.replace(/<section class="cd">/g, '<div class="pg">').replace(/<\/section>/g, '</div>').replace(/class="cd-hd"/g, 'class="pg-hd"').replace(/class="cd-bd( you)?"/g, 'class="pg-bd$1"');
  const games8 = (M, u) => [M.state === 'post' ? mvp(M, u) : guess(M, u), fansBlock(M)].filter(Boolean).map(sub8).join('');
  // v37 (дирижёр 27.10: «в правой колонке не нужны эти баннеры, нужны только виджеты, которые мы собирали»): GS_ONLYW — без карточки «Ты в матче» (MVP, «Кто победит»)
  const side0 = (M, u) => window.GS_ONLYW ? '' : V9 ? you(M, u) + events9(M, u) : play8(M, u);
  const play8 = (M, u) => `<section class="cd cd-play">${sub8(you(M, u))}${games8(M, u)}</section>`;
  function events9(M, u) {
    const g = games8(M, u), ev = eventsBlock(M, u);
    return g ? ev.replace(/<div class="(cd-bd|empty)"/, m => `<div class="ev-q">${g}</div>${m}`) : ev;
  }
  // v10: без «Серии по картам» в обзоре и без перевеса в шапке (дирижёр 26.10). v11: верхний блок не переключателем, а отдельными карточками
  // (график · записи карт · драфт; до матча — история · трансляция); переключатель — только в live
  function topX(M, u) {
    const tabs = tabsFor(M);
    if (!V11 || M.state === 'live' || tabs.length < 2) return top(M, u);
    const x = M.maps[u.map];
    return tabs.map(t => t === 'График' ? withDraft(M, u, x, b => `<section class="cd"><div class="top-bd">${b}</div></section>`, graph(M, u, x))
      : `<section class="cd"><div class="cd-hd"><b>${t}</b>${t === 'Драфт' && x ? `<small>карта ${x.i + 1}</small>` : ''}</div><div class="top-bd">${t === 'История' ? history(M) : t === 'Трансляция' ? tv(M, u, x) : t === 'Записи карт' ? records(M, u) : draft(M, x)}</div></section>`).join('');
  }
  const link8 = t => `<button class="lk" data-a="toast" data-v="${t} — главная страница раздела (демо)"><span>${t}</span><i>›</i></button>`;
  // v19: ссылка — низом своего виджета (последней карточки), а не отдельной карточкой
  const wlink = (h, t) => (V19 ? h.replace(/<\/section>(?![\s\S]*<\/section>)/, `<div class="cd-lk">${link8(t)}</div></section>`) : `${h}<nav class="cd">${link8(t)}</nav>`);
  function tab8(M, u, tab, desk) {
    const lx = M.maps.find(x => x.st === 'live'), last = [...M.maps].reverse().find(x => x.st === 'done');
    if (tab === 'Новости') return wlink(around(M, { ...u, arOpen: true }).replace('<b>Вокруг матча</b>', '<b>Новости матча</b>'), 'Все новости турнира');
    if (tab === 'Очные') return `<section class="cd"><div class="cd-hd"><b>Очные и форма</b></div><div class="cd-bd">${history(M)}</div></section><nav class="cd">${link8('История и очные')}</nav>`;
    if (tab === 'Турнир') return `<div class="gm-wd" data-wd="t4"></div><nav class="cd">${link8('Сетка турнира')}</nav>`;
    if (tab === 'Статистика') return wlink(players7(M, u) || '<section class="cd"><div class="empty">Статистика появится с первой картой</div></section>', 'Вся статистика');
    if (tab === 'События') return eventsBlock(M, { ...u, evOpen: true });
    if (tab === 'Карты') return maps6(M, u, desk);
    // Обзор
    if (M.state === 'pre' || cancel(M) || M.ovr === 'announce' || M.ovr === 'delayed') return [M.state === 'pre' && !STAT ? factsBlock(M) : '', topX(M, u), desk || V19 ? '' : V9 ? you(M, u) + events9(M, u) : play8(M, u), lineups(M, u), STAT ? statBlock() : ''].join('');
    // v25: «Превью» — факты, очные, составы; карта — её график и игроки
    if (MSEG && msegCur(M, u) === 0) return (STAT ? [lineups(M, u), statBlock()] : [factsBlock(M), `<section class="cd"><div class="cd-hd"><b>Очные и форма</b></div><div class="cd-bd">${history(M)}</div></section>`, lineups(M, u)]).join('');
    const cur = MSEG ? M.maps[msegCur(M, u) - 1] : hidden(M, u) ? M.maps[u.map] : lx || last, uo = { ...u, map: cur ? cur.i : 0 };
    const cap = `<p class="ov-cap">${lx && cur === lx ? `Сейчас идёт карта ${cur.i + 1} из ${M.bo} · прошлые — во вкладке «Карты»` : `Матч завершён · ниже — последняя карта, все — во вкладке «Карты»`}</p>`;
    const side = desk || V19 ? '' : V9 ? you(M, u) + events9(M, u) : play8(M, u);
    // v19: вместо подписи над графиком — ссылка низом его виджета
    // v32+: вкладок в шапке нет (GS_TABS = false) — ссылки «Все карты матча — во вкладке «Карты»» тоже нет, вести некуда (дирижёр 27.10: «вот это надо убрать»)
    const tx0 = V19 && window.GS_TABS !== false ? topX(M, uo).replace('</section>', `<button class="cd-ft" data-a="mtab" data-v="Карты">Все карты матча — во вкладке «Карты» ›</button></section>`) : topX(M, uo);
    // лаба w-social v1: кнопки сообщества — строкой низом карточки графика
    const tx = SOC === 'row' ? tx0.replace(/<\/section>(?![\s\S]*<\/section>)/, '<div class="gm-soc" data-wd="soc"></div></section>') : tx0;
    // v29: «Статистика к матчу» — последним блоком на любой карте (дирижёр 27.10: «человек переключает карты — внизу под всем всегда статистика»)
    // gs-match-2 v1 (созвон 28.10): GS_LIVE_LEAN — на карте (live и сыгранной) нет игроков («О матче») и «Статистики к матчу»: она только в «Превью» и до матча
    if (window.GS_LIVE_LEAN) return [M.state === 'post' && !V10 ? series7(M, u) : '', V19 ? '' : cap, tx, side].join('');
    return [M.state === 'post' && !V10 ? series7(M, u) : '', V19 ? '' : cap, tx, side, desk || window.GS_PLAYERS === 'w' ? statTable(M, uo) : lineups(M, uo), STAT ? statBlock() : ''].join('');
  }
  function series7(M, u) {
    if (cancel(M) || M.state === 'pre' || M.ovr) return '';
    const hid = hidden(M, u), W = 120, H = 28;
    const spark = x => { const g = snap(x).gold.map(v => (x.aRad ? v : -v)); if (g.length < 2) return '<svg class="s7-g" viewBox="0 0 120 28"></svg>';
      const max = Math.max(3000, ...g.map(Math.abs)), X = i => (i / (g.length - 1)) * W, Y = v => H / 2 - (v / max) * (H / 2 - 2);
      const d = g.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
      return `<svg class="s7-g" viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}"/><path d="${d}"/></svg>`; };
    const rows = Array.from({ length: M.bo }, (_, i) => {
      const x = M.maps[i], open = x && x.st !== 'future' && !(hid && i >= u.unlocked), nd = noData(M) && x && x.st === 'live';
      if (!open) return `<div class="s7 is-empty"><span class="s7-n">Карта ${i + 1}</span><span class="mut">${hid && x && x.st !== 'future' ? 'скрыта анти-спойлером' : M.state === 'post' ? 'не понадобилась' : 'впереди'}</span></div>`;
      const [a, b] = killsAB(x), live = x.st === 'live';
      return `<button class="s7 ${live ? 'is-now' : ''}" data-a="mtab-map" data-v="${i}"><span class="s7-n">Карта ${i + 1}<small>${live ? `<span class="is-live">идёт</span> ${mmss(x.t)}` : Math.round(x.m.duration / 60) + ' мин'}</small></span>
        <span class="s7-w">${live ? '<span class="mut">ещё играют</span>' : `${logo(x.win, 'lg--20')}<b>${esc(SHORT[x.win])}</b>`}</span>
        ${nd ? '<span class="mut">данные после карты</span>' : `<b class="num s7-k">${a} : ${b}</b>${spark(x)}`}<i class="s7-go">›</i></button>`; }).join('');
    return `<section class="cd"><div class="cd-hd"><b>Серия по картам</b><small>килы · перевес по золоту · тап — разбор карты</small></div><div class="cd-bd" style="padding-bottom:8px">${rows}</div></section>`;
  }
  function players7(M, u) {
    if (cancel(M) || M.state === 'pre' || M.ovr || hidden(M, u)) return '';
    const xs = M.maps.filter(x => x.st !== 'future' && !(noData(M) && x.st === 'live')); if (!xs.length) return '';
    const team = id => { const acc = {};
      for (const x of xs) for (const q of snap(x).players) { if (q.p.isRadiant !== (x.m.radiant_team_id === id)) continue;
        const r = acc[q.p.account_id] ||= { p: q.p, k: 0, d: 0, a: 0, gpm: [], h: [] }; r.k += q.kills; r.d += q.deaths; r.a += q.assists ?? 0;
        if (x.st === 'done') r.gpm.push(q.p.gold_per_min); r.h.push(q.p.hero_id); }
      return `<table class="st st7"><thead><tr><th>${logo(id, 'lg--20')}${esc(NAME[id])}</th><th class="c-h">Герои</th><th>K</th><th>D</th><th>A</th><th class="c-g">Ср. GPM</th></tr></thead><tbody>${Object.values(acc).map(r =>
        `<tr data-a="pl" data-v="${xs[xs.length - 1].m.match_id}|${r.p.account_id}"><td><span class="st-p"><img src="${avatar(r.p)}" alt="" class="st-av"><span><b>${esc(nick(r.p))}</b></span></span></td>
        <td class="c-h"><span class="st-hs">${r.h.map(h => `<img src="${hero(h).img}" alt="" title="${esc(hero(h).name)}">`).join('')}</span></td><td>${r.k}</td><td>${r.d}</td><td>${r.a}</td>
        <td class="c-g">${r.gpm.length ? Math.round(r.gpm.reduce((n, v) => n + v, 0) / r.gpm.length) : '—'}</td></tr>`).join('')}</tbody></table>`; };
    const live = xs.some(x => x.st === 'live');
    return `<section class="cd"><div class="cd-hd"><b>Игроки за серию</b><small>${xs.length} ${plural(xs.length, 'карта', 'карты', 'карт')}${live ? ' · ассисты идущей карты — после неё' : ''}</small></div><div class="cd-bd">${team(M.A)}${team(M.B)}</div></section>`;
  }
  function overview7(M, u, mid, desk) {
    if (M.state === 'pre' || cancel(M) || M.ovr) return overview6(M, u, mid, desk);
    const lx = M.maps.find(x => x.st === 'live');
    const tvc = lx && M.ovr !== 'offline' ? `<section class="cd"><div class="cd-hd"><b>Трансляция</b><small>карта ${lx.i + 1}</small></div><div class="top-bd">${tv(M, u, lx)}</div></section>` : '';
    if (desk) return [series7(M, u), tvc, players7(M, u), `<div class="gm-grid">${[fansBlock(M), ...mid, around(M, u), links(M)].join('')}</div>`].join('');
    return [series7(M, u), tvc, you(M, u), fansBlock(M), ...mid, players7(M, u), links(M), around(M, u)].join('');
  }
  const MT = V12 ? ['Обзор', 'Карты', 'События', 'Новости', 'Статистика'] : V8 ? ['Обзор', 'Карты', 'События', 'Новости', 'Очные', 'Турнир', 'Статистика'] : V9 ? ['Обзор', 'Карты', 'Новости', 'Очные', 'Турнир', 'Статистика']
    : ['Обзор', 'События', 'Карты', 'Игроки', 'Очные', 'Турнир', 'Статистика']; // «События» — вкладкой, не в правой колонке (дирижёр 26.10)
  const mtabs6 = (M, u) => window.GS_HD === 'w' ? '' : `<nav class="mt-tabs" aria-label="Матч">${MT.map(t => { const on = (u.mtab || 'Обзор') === t, real = V8 || V9 || t === 'Обзор' || t === 'Карты' || t === 'События';
    const n = t === 'Карты' ? M.maps.filter(x => x.st !== 'future').length : 0;
    return `<a href="#" ${on ? 'aria-current="page"' : ''} ${real ? `data-a="mtab" data-v="${t}"` : `data-a="toast" data-v="${t} — вкладка матча (демо)"`}>${t}${n && !hidden(M, u) && !cancel(M) && M.state !== 'pre' ? ` <small>${n}</small>` : ''}</a>`; }).join('')}</nav>`;
  function overview6(M, u, mid, desk) {
    const lx = M.maps.find(x => x.st === 'live'), last = [...M.maps].reverse().find(x => x.st === 'done');
    const cur = hidden(M, u) ? M.maps[u.map] : lx || last, uo = { ...u, map: cur ? cur.i : 0 };
    const cap = cancel(M) || M.state === 'pre' || !cur ? '' : `<p class="ov-cap">${lx && cur === lx ? `Сейчас идёт карта ${cur.i + 1} из ${M.bo}` : `Последняя сыгранная — карта ${cur.i + 1}`}${M.maps.filter(x => x.st === 'done').length > (lx ? 0 : 1) ? ' · прошлые карты — во вкладке «Карты»' : ''}</p>`;
    if (desk) return [cap, top(M, uo), statTable(M, uo), `<div class="gm-grid">${[fansBlock(M), ...mid, around(M, u), links(M)].join('')}</div>`].join('');
    return [cap, top(M, uo), you(M, u), fansBlock(M), ...mid, lineups(M, uo), links(M), around(M, u)].join('');
  }
  function maps6(M, u, desk) {
    const cap = '<p class="ov-cap">Разбор по картам: выбери карту — график, игроки и драфт этой карты</p>';
    return [cap, chips(M, u), topX(M, u), desk || window.GS_PLAYERS === 'w' ? statTable(M, u) : lineups(M, u), V7 ? '' : mapsDone(M, u)].join('');
  }
  const mtabs = () => `<nav class="mt-tabs" aria-label="Матч">${['Обзор', 'Карты', 'Игроки', 'Очные', 'Турнир', 'Статистика'].map((t, i) =>
    `<a href="#" ${i ? `data-a="toast" data-v="${t} — вкладка матча (демо)"` : 'aria-current="page" data-a="back"'}>${t}</a>`).join('')}</nav>`;
  // v4: таблица игроков выбранной карты (как у Cyberscore справа от графика): K · D · A · золото · GPM · урон; в live — то, что известно на минуту
  function statTable(M, u) {
    const xm = M.maps[u.map], x = xm && xm.st !== 'future' && !cancel(M) && M.state !== 'pre' ? xm : null;
    if (x && drafting(M, x)) return '';
    if (!x || hidden(M, u) || (noData(M) && x.st === 'live')) return lineups(M, u);
    // v21 (дирижёр 26.10) — игроки = виджет из лабы w-players (WPLAYERS), и на телефоне тоже
    if (window.GS_PLAYERS === 'w') return `<div class="gm-wd"><div data-wd="players" data-mi="${x.i}"></div></div>`;
    const sn = snap(x), done = x.st === 'done', m = x.m;
    const team = id => { const rad = id === m.radiant_team_id, ps = sn.players.filter(q => q.p.isRadiant === rad), kk = rad ? sn.kr : sn.kd;
      return `<table class="st"><thead><tr><th>${logo(id, 'lg--20')}${esc(NAME[id])}<small>${x.win === id ? ' · победа' : ''}</small></th><th>K</th><th>D</th><th>A</th><th>Золото</th><th>GPM</th><th>Урон</th>${CFG.auth ? '<th>Очки</th>' : ''}</tr></thead>
        <tbody>${ps.map(q => `<tr data-a="pl" data-v="${m.match_id}|${q.p.account_id}"><td><span class="st-p"><img src="${hero(q.p.hero_id).img}" alt=""><span><b>${esc(nick(q.p))}</b><small>${esc(hero(q.p.hero_id).name)}</small></span></span></td>
          <td>${q.kills}</td><td>${q.deaths}</td><td>${q.assists ?? '—'}</td><td>${k(q.nw)}</td><td>${done ? q.p.gold_per_min : '—'}</td><td>${done ? k(q.p.hero_damage) : '—'}</td>${CFG.auth ? `<td>${pts(q)}</td>` : ''}</tr>`).join('')}
          <tr class="st-sum"><td>Итого</td><td>${kk}</td><td colspan="${CFG.auth ? 6 : 5}"></td></tr></tbody></table>`; };
    return `<section class="cd"><div class="cd-hd"><b>Игроки · карта ${x.i + 1}</b><small>${done ? 'итог карты' : mmss(x.t) + ' · ассисты, GPM и урон — после карты'}</small></div>
      <div class="cd-bd">${team(M.A)}${team(M.B)}${CFG.auth ? '' : '<button class="lock" data-a="login" data-v="Войди, чтобы видеть очки игроков">Войди, чтобы видеть очки</button>'}</div></section>`;
  }
  // v4: сыгранные карты отдельными строками (как «Завершённые карты · Игра #1» у DLTV): победитель, килы, длительность, герои; тап — карта сверху
  function mapsDone(M, u) {
    const ds = M.maps.filter(x => x.st === 'done' && !cancel(M) && !noData(M)).filter((x, i) => !hidden(M, u) || i < u.unlocked - 1);
    if (!ds.length || hidden(M, u)) return '';
    const heroes = (x, id) => x.m.players.filter(p => p.isRadiant === (id === x.m.radiant_team_id)).map(p => `<img src="${hero(p.hero_id).img}" alt="${esc(hero(p.hero_id).name)}" title="${esc(nick(p))} · ${esc(hero(p.hero_id).name)}">`).join('');
    return `<section class="cd"><div class="cd-hd"><b>Сыгранные карты</b><small>${ds.length} из ${M.bo}</small></div><div class="cd-bd" style="padding-bottom:8px">${ds.map(x => { const [a, b] = killsAB(x);
      return `<button class="md" data-a="map" data-v="${x.i}" aria-pressed="${u.map === x.i}"><span class="md-n">Игра ${x.i + 1}<small>${Math.round(x.m.duration / 60)} мин</small></span>
        <span class="md-h">${heroes(x, M.A)}</span><span class="md-s">${logo(x.win, 'lg--20')}<b class="num">${a} : ${b}</b></span><span class="md-h">${heroes(x, M.B)}</span></button>`; }).join('')}</div></section>`;
  }

  function chips(M, u) {
    if (M.bo === 1) return '';
    const hid = hidden(M, u), n = M.state === 'post' && !hid ? M.maps.length : M.bo;
    return `<nav class="chips" aria-label="Карты">${Array.from({ length: n }, (_, i) => {
      const x = M.maps[i], st = x && !cancel(M) && M.state !== 'pre' ? x.st : 'future', dis = st === 'future' || (hid && i >= u.unlocked);
      const tail = hid ? '' : st === 'live' ? ` · <span class="is-live">идёт</span>` : st === 'done' ? ` · ${esc(SHORT[x.win])}` : '';
      return `<button class="chip" data-a="map" data-v="${i}" aria-pressed="${u.map === i && !dis}" ${dis ? 'disabled' : ''}><b>К${i + 1}</b>${tail}</button>`;
    }).join('')}${hid && u.unlocked < M.maps.filter(x => x.st !== 'future').length ? '<button class="chip" data-a="next-map">Смотреть дальше →</button>' : ''}</nav>`;
  }

  // v29: трансляция — не вкладкой у графика, а кнопкой → мини-окно в углу без звука (начальник 26.10 [1 · 17:49] «маленькая кнопка… можно включить»,
  // [2 · 08:07–10:12] «в углу закрепить трансляцию, без звука… маленький экран в угол встаёт, как YouTube»)
  const PIP = window.GS_PIP === 'w';
  // gs-match-2 v3: GS_NO_REC — без «Записей карт» (дирижёр 28.10: «нигде она не нужна»)
  function tabsFor(M) { const t0 = tabsFor0(M), t = window.GS_NO_REC ? t0.filter(x => x !== 'Записи карт') : t0; return PIP || DRAFT ? t.filter(x => !(PIP && x === 'Трансляция') && !(DRAFT && x === 'Драфт')) : t; }
  // лаба w-draft v9–v12 (дирижёр 27.10): драфт — не вкладкой у графика, а рядом с ним. GS_DRAFT: above — карточкой над графиком, below — под ним,
  // split — Radiant полосой над графиком, Dire — под ним (как стороны графика), mini — пятёрки мелко в карточке графика.
  // «Драфт идёт» в панели — на идущей карте вместо графика фаза драфта, игроков нет (начальник 26.10: «график не возникнет, пока не пройдёт драфт»)
  const DRAFT = window.GS_DRAFT || '';
  const drafting = (M, x) => !!(DRAFT && CFG.draft && x && x.st === 'live');
  const wdraft = (x, look, side) => `<div data-wd="draft" data-mi="${x.i}" data-look="${look}"${side != null ? ` data-side="${side}"` : ''}></div>`;
  function tabsFor0(M) {
    if (cancel(M) || M.ovr === 'offline') return [];
    if (M.state === 'pre') return ['История', 'Трансляция'];
    if (M.state === 'live') return noData(M) ? ['Трансляция', 'Драфт'] : ['График', 'Трансляция', 'Драфт'];
    return ['График', 'Записи карт', 'Драфт'];
  }
  function top(M, u) {
    const tabs = tabsFor(M), tab = tabs.includes(u.tab) ? u.tab : tabs[0], x = M.maps[u.map];
    if (cancel(M)) return `<section class="cd"><div class="empty">Матч не состоится. Прогнозы аннулированы</div></section>`;
    if (M.ovr === 'offline') return `<section class="cd"><div class="top-bd big"><b class="num">${hidden(M, u) ? '— : —' : `${M.sa} : ${M.sb}`}</b><p class="q-sub">Счёт по картам · трансляция недоступна. Факты и обновления — в «Событиях»</p></div></section>`;
    const body0 = tab === 'История' ? history(M) : tab === 'Трансляция' ? tv(M, u, x) : tab === 'Записи карт' ? records(M, u) : tab === 'Драфт' ? draft(M, x) : graph(M, u, x);
    const seg = tabs.length > 1 || !DRAFT ? `<div class="seg" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${t === tab}" data-a="tab" data-v="${t}">${t}</button>`).join('')}</div>` : '';
    const card = b => `<section class="cd">${seg}
      ${noData(M) ? '<div class="note note--info" style="margin:12px 16px 0">Подробные данные появятся после карты</div>' : ''}<div class="top-bd">${b}</div></section>`;
    return tab === 'График' || tab == null ? withDraft(M, u, x, card, body0) : card(body0);
  }
  // лаба w-draft: карточка графика (card(тело)) и драфт рядом — по GS_DRAFT; без флага — как было
  function withDraft(M, u, x, card, g) {
    if (!DRAFT || !x || x.st === 'future' || hidden(M, u)) return card(g);
    // gs-match-2 шаг 3: GS_DR3 — график и пики своей функцией (../gs-match-2/_dr3.js), без банов; во время драфта — как было
    if (window.GS_DR3 && !drafting(M, x)) return card(window.GS_DR3(x, snap(x), g, CFG.view === 'desk'));
    if (drafting(M, x)) return card(wdraft(x, DRAFT === 'cm' ? 'cm' : 'live'));
    if (DRAFT === 'split') return card(wdraft(x, 'half', 0) + g + wdraft(x, 'half', 1));
    if (DRAFT === 'mini') return card(wdraft(x, 'mini') + g);
    // v13–v16 (дирижёр 27.10: «версии драфта сделай ещё»): sides — команды колонками слева и справа от графика (начальник [1 · 28:03]), order — под графиком 24 хода по порядку,
    // fold — свёрнуто строкой низом графика, по нажатию порядок ходов; cm — фаза драфта таймлайном сверху вниз (Captain's Mode), после — карточкой под графиком
    if (DRAFT === 'sides') return card(`<div class="gm-dside">${wdraft(x, 'col', 0)}<div>${g}</div>${wdraft(x, 'col', 1)}</div>`);
    if (DRAFT === 'fold') return card(g + wdraft(x, 'fold'));
    // v17–v20 — в формате v14 (порядок ходов карточкой под графиком): lanes, phases, both, fit; v21–v24 — в стиле сайтов: cs, dltv, hawk, flap
    const d = `<section class="cd">${wdraft(x, ['order', 'lanes', 'phases', 'both', 'fit', 'cs', 'dltv', 'hawk', 'flap'].includes(DRAFT) ? DRAFT : 'card')}</section>`;
    return `<div class="gm-gd">${DRAFT === 'above' ? d + card(g) : card(g) + d}</div>`;
  }

  // v2 «понятный график золота» (дирижёр 26.10, референсы Figma стр. 07: Hawk, DLTV, Cyberscore): заголовок «Перевес по золоту», кто впереди и на сколько,
  // половины подписаны логотипами команд, линия «поровну», точки убийств сверху/снизу, отметки Рошана / первой крови / первой башни, палец по графику — значение
  function graph2(M, x) {
    // GS_G2W — лаба gs-solo: ширина графика в px под рамку, график перестраивается под неё (подписи того же размера), а не растягивается
    const DESK = CFG.view === 'desk', g = snap(x).gold.map(v => (x.aRad ? v : -v)), FW = window.GS_G2W, W = FW || (DESK ? 700 : 366), H = FW ? (FW >= 600 ? 200 : 160) : DESK ? 200 : 160, L = 34, top = 18, bot = 18;
    const dur = Math.max(g.length - 1, x.st === 'live' ? Math.ceil(x.m.duration / 60) : 1), mid = top + (H - top - bot) / 2, half = (H - top - bot) / 2;
    const max = Math.ceil(Math.max(5000, ...g.map(Math.abs)) / 5000) * 5000, X = mi => L + (mi / dur) * (W - L - 4), Y = v => mid - (v / max) * (half - 4);
    const line = g.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    const area = `${line} L${X(g.length - 1).toFixed(1)} ${mid} L${L} ${mid}Z`, id = 'g2' + x.m.match_id;
    const cur = g[g.length - 1] || 0, lead = cur >= 0 ? M.A : M.B, aSide = x.aRad;
    const kills = x.m.players.flatMap(p => p.kills_log.filter(l => l.time <= x.t).map(l => ({ t: l.time, a: p.isRadiant === aSide })));
    const objs = [];
    for (const o of x.m.objectives) { if (o.time > x.t) continue;
      if (o.type === 'CHAT_MESSAGE_FIRSTBLOOD') objs.push([o.time, 'ПК', 'первая кровь']);
      if (o.type === 'CHAT_MESSAGE_ROSHAN_KILL') objs.push([o.time, 'Р', 'Рошан']); }
    const ft = x.m.objectives.find(o => o.type === 'building_kill' && o.key.includes('tower') && o.time <= x.t); if (ft) objs.push([ft.time, 'Б', 'первая башня']);
    const peak = side => { let b = 0, at = 0; g.forEach((v, i) => { const w = side ? v : -v; if (w > b) { b = w; at = i; } }); return [b, at]; };
    const [pa, ta] = peak(true), [pb, tb] = peak(false);
    const ticks = [0, 10, 20, 30, 40, 50, 60, 70].filter(t => t <= dur);
    const yl = v => `${v ? '+' : ''}${k(v)}`;
    return `<div class="g2-hd"><span class="g2-t"><i class="g2-coin"></i>Перевес по золоту <small>карта ${x.i + 1}${x.st === 'live' ? ' · ' + mmss(x.t) : ''}</small></span>
        ${cur ? `<span class="g2-lead g2-lead--${cur > 0 ? 'a' : 'b'}">${logo(lead, 'lg--20')}${esc(SHORT[lead])} +${k(cur)}</span>` : '<span class="g2-lead">поровну</span>'}</div>
      <p class="g2-sub">Сколько золота у команды больше, чем у соперника, по минутам. Выше линии — впереди ${esc(SHORT[M.A])}, ниже — ${esc(SHORT[M.B])}</p>
      <div class="g2-wrap" data-g2="${esc(JSON.stringify({ g, W, L, dur, a: SHORT[M.A], b: SHORT[M.B] }))}">
      <svg class="gr g2" viewBox="0 0 ${W} ${H + 14}" role="img" aria-label="Перевес по золоту, карта ${x.i + 1}">
        <defs><clipPath id="u${id}"><rect x="0" y="0" width="${W}" height="${mid}"/></clipPath><clipPath id="d${id}"><rect x="0" y="${mid}" width="${W}" height="${H}"/></clipPath></defs>
        <rect x="${L}" y="${top}" width="${W - L - 4}" height="${half}" fill="rgba(96,165,250,.04)"/><rect x="${L}" y="${mid}" width="${W - L - 4}" height="${half}" fill="rgba(245,158,11,.04)"/>
        ${[max, max / 2, max / 2, max].map((v, i) => { const y = i < 2 ? Y(v) : Y(-v); return `<line x1="${L}" x2="${W - 4}" y1="${y}" y2="${y}" stroke="var(--w-border)" stroke-dasharray="2 4"/><text x="${L - 4}" y="${y + 3}" text-anchor="end" class="${i < 2 ? 'ta' : 'tb'}">${yl(v)}</text>`; }).join('')}
        <line x1="${L}" x2="${W - 4}" y1="${mid}" y2="${mid}" stroke="var(--w-ring)"/><text x="${L - 4}" y="${mid + 3}" text-anchor="end">0</text>
        <path d="${area}" fill="rgba(96,165,250,.28)" clip-path="url(#u${id})"/><path d="${area}" fill="rgba(245,158,11,.26)" clip-path="url(#d${id})"/>
        <path d="${line}" fill="none" stroke="var(--w-a)" stroke-width="2" clip-path="url(#u${id})"/><path d="${line}" fill="none" stroke="var(--w-b)" stroke-width="2" clip-path="url(#d${id})"/>
        ${kills.map(q => `<circle cx="${X(q.t / 60).toFixed(1)}" cy="${q.a ? top - 8 : H - bot + 8}" r="2" fill="${q.a ? 'var(--w-a)' : 'var(--w-b)'}" opacity=".8"/>`).join('')}
        ${objs.map(([t, lbl]) => `<g transform="translate(${X(t / 60).toFixed(1)} ${mid})"><line y1="${-half + 4}" y2="${half - 4}" stroke="var(--w-ring)" stroke-dasharray="1 3"/><rect x="-9" y="-8" width="18" height="16" rx="4" fill="var(--w-muted)"/><text y="4" text-anchor="middle" class="tobj">${lbl}</text></g>`).join('')}
        ${x.st === 'live' ? `<circle cx="${X(g.length - 1)}" cy="${Y(cur)}" r="3.5" fill="var(--w-fg)"/>` : ''}
        ${ticks.map(t => `<text x="${X(t)}" y="${H + 12}" text-anchor="middle">${t}′</text>`).join('')}
        <line class="g2-cur" x1="0" x2="0" y1="${top}" y2="${H - bot}" stroke="var(--w-fg)" opacity="0"/>
      </svg>
      <div class="g2-side g2-side--a">${logo(M.A, 'lg--20')}</div><div class="g2-side g2-side--b">${logo(M.B, 'lg--20')}</div><div class="g2-tip" hidden></div></div>
      <div class="g2-leg"><span><i class="dt dt--a"></i><i class="dt dt--b"></i>убийства</span>${[...new Set(objs.map(o => o[1] + ' — ' + o[2]))].map(t => `<span>${t}</span>`).join('')}</div>
      <div class="g2-pk"><span>Макс. перевес</span>${pa ? `<b class="a">${esc(SHORT[M.A])} +${k(pa)} <small>${ta}′</small></b>` : ''}${pb ? `<b class="b">${esc(SHORT[M.B])} +${k(pb)} <small>${tb}′</small></b>` : ''}</div>`;
  }

  function graph(M, u, x) {
    // v21 (дирижёр 26.10: «можно переносить в виджет, страница собирается только из виджетов») — график золота = виджет из лабы w-gold (WGOLD), рисует paint()
    if (window.GS_GRAPH === 'w' && !hidden(M, u) && x && x.st !== 'future') return `<div data-wd="gold" data-mi="${x.i}"></div>`;
    if (window.GS_GRAPH === 'v2' && !hidden(M, u) && x && x.st !== 'future') return graph2(M, x);
    if (hidden(M, u)) return '<div class="empty">График скрыт, чтобы не раскрывать результат<br><button class="btn btn--ghost" style="width:auto;margin:12px auto 0;padding:0 16px" data-a="reveal">Показать счёт и график</button></div>';
    if (!x || x.st === 'future') return '<div class="empty">Подробные данные появятся после карты</div>';
    const DESK = CFG.view === 'desk', g = snap(x).gold.map(v => (x.aRad ? v : -v)), W = DESK ? 700 : 366, H = DESK ? 180 : 140, pad = 14;
    const dur = Math.max(g.length - 1, x.st === 'live' ? Math.ceil(x.m.duration / 60) : 1);
    const max = Math.max(3000, ...g.map(Math.abs)), X = i => (i / dur) * W, Y = v => H / 2 - (v / max) * (H / 2 - pad);
    const line = g.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    const area = `${line} L${X(g.length - 1).toFixed(1)} ${H / 2} L0 ${H / 2}Z`;
    const rosh = x.m.objectives.filter(o => o.type === 'CHAT_MESSAGE_ROSHAN_KILL' && o.time <= x.t);
    const cur = g[g.length - 1] || 0, lead = cur >= 0 ? M.A : M.B, id = x.m.match_id;
    const ticks = [0, 10, 20, 30, 40, 50, 60, 70].filter(t => t <= dur);
    return `<div class="gr-lg"><span>Разница золота · карта ${x.i + 1}</span><span>${cur ? `<b class="${cur > 0 ? 'a' : 'b'}">${esc(SHORT[lead])} +${k(cur)}</b>` : 'поровну'}</span></div>
      <svg class="gr" viewBox="0 0 ${W} ${H + 16}" role="img" aria-label="Разница золота, карта ${x.i + 1}">
        <defs><clipPath id="up${id}"><rect x="0" y="0" width="${W}" height="${H / 2}"/></clipPath><clipPath id="dn${id}"><rect x="0" y="${H / 2}" width="${W}" height="${H / 2}"/></clipPath></defs>
        <line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" stroke="var(--w-border)"/>
        ${rosh.map(o => `<line x1="${X(o.time / 60)}" x2="${X(o.time / 60)}" y1="4" y2="${H - 4}" stroke="var(--w-ring)" stroke-dasharray="2 3"/><text x="${X(o.time / 60) + 3}" y="12">Рошан</text>`).join('')}
        <path d="${area}" fill="var(--w-a-bg)" clip-path="url(#up${id})"/><path d="${area}" fill="rgba(245,158,11,.22)" clip-path="url(#dn${id})"/>
        <path d="${line}" fill="none" stroke="var(--w-a)" stroke-width="1.5" clip-path="url(#up${id})"/><path d="${line}" fill="none" stroke="var(--w-b)" stroke-width="1.5" clip-path="url(#dn${id})"/>
        ${x.st === 'live' ? `<circle cx="${X(g.length - 1)}" cy="${Y(cur)}" r="3" fill="var(--w-fg)"/>` : ''}
        ${ticks.map(t => `<text x="${Math.min(X(t), W - 22)}" y="${H + 14}">${t}′</text>`).join('')}
      </svg>
      <div class="gr-lg" style="margin:4px 0 0"><span class="a">▲ ${esc(SHORT[M.A])}</span><span class="b">▼ ${esc(SHORT[M.B])}</span></div>`;
  }

  function tv(M, u, x) {
    const n = x && x.st !== 'future' ? x.i + 1 : 1;
    const seg = (key, list) => `<div class="seg">${list.map(v => `<button aria-selected="${u[key] === v}" data-a="${key}" data-v="${v}">${v}</button>`).join('')}</div>`;
    const cap = M.ovr === 'announce' ? 'Трансляция — когда назначат время' : M.ovr === 'delayed' ? `Трансляция начнётся ${day(DELAY_TO)} в ${clock(DELAY_TO - 900)}`
      : M.state === 'pre' ? 'Трансляция начнётся в ' + clock(M.start - 900) : 'Карта ' + n;
    return `<div class="tv"><span class="tv__play">▶</span><div class="tv__cap"><b>${cap}</b><span>${u.src} · ${u.lang}</span></div></div>
      <div class="opts">${seg('src', ['Twitch', 'YouTube', 'Kick'])}${seg('lang', ['RU', 'EN'])}</div>`;
  }

  function records(M, u) {
    const hid = hidden(M, u);
    return M.maps.filter(x => x.st === 'done' && (!hid || x.i < u.unlocked)).map(x => `<button class="rec" data-a="toast" data-v="Запись карты ${x.i + 1} — демо, видео не подключено"><span class="rec__p">▶</span>
      <span class="rec__m"><b>Карта ${x.i + 1}${hid ? '' : ' · победа ' + esc(SHORT[x.win])}</b><small>${hid ? 'смотреть с начала' : `${mmss(x.m.duration)} · убийства ${x.aRad ? x.m.radiant_score : x.m.dire_score}:${x.aRad ? x.m.dire_score : x.m.radiant_score}`}</small></span></button>`).join('');
  }

  function draft(M, x) {
    if (!x || x.st === 'future') return '<div class="empty">Драфт появится перед картой</div>';
    const side = id => (id === x.m.radiant_team_id ? 0 : 1);
    const col = id => {
      const pb = x.m.picks_bans.filter(b => b.team === side(id)), ps = x.m.players.filter(p => p.isRadiant === (side(id) === 0));
      return `<div><h4>${logo(id, 'lg--20')}${esc(SHORT[id])}</h4>${pb.filter(b => b.is_pick).map(b => {
        const p = ps.find(q => q.hero_id === b.hero_id);
        return `<button class="dr-p" ${p ? `data-a="pl" data-v="${x.m.match_id}|${p.account_id}"` : ''}><img src="${hero(b.hero_id).img}" alt=""><span><b>${esc(hero(b.hero_id).name)}</b><small>${p ? esc(nick(p)) : ''}</small></span></button>`;
      }).join('')}<div class="dr-b" aria-label="Баны">${pb.filter(b => !b.is_pick).map(b => `<img src="${hero(b.hero_id).img}" alt="${esc(hero(b.hero_id).name)}" title="Бан: ${esc(hero(b.hero_id).name)}">`).join('')}</div></div>`;
    };
    return `<div class="gr-lg"><span>Карта ${x.i + 1} · пики по порядку, ниже баны</span></div><div class="dr">${col(M.A)}${col(M.B)}</div>`;
  }

  function history(M) {
    const form = id => played(id).slice(-5).map(s => res(s, id));
    const row = id => `<div class="rs-t">${logo(id, 'lg--20')}<b>${esc(NAME[id])}</b>${form(id).map(r => `<span class="chip" style="height:24px;padding:0 8px;${r.win ? 'color:var(--w-up)' : 'color:var(--w-down)'}" title="${r.w}:${r.l} — ${esc(NAME[r.opp])}">${r.win ? 'В' : 'П'} ${r.w}:${r.l}</span>`).join('') || '<small>нет игр</small>'}</div>`;
    return `<div class="gr-lg"><span>Форма на турнире · от старых к новым</span></div>${row(M.A)}${row(M.B)}<p class="q-sub" style="margin:12px 0 0">${esc(facts(M).slice(-1)[0])}</p>`;
  }

  // Мои игроки в пятёрке (вошёл, пример): лучший по очкам у каждой команды
  function myFive(M, x) {
    if (!x || x.st === 'future') return [];
    const sn = snap(x).players;
    return [true, false].map(r => sn.filter(q => q.p.isRadiant === r).sort((a, b) => pts(b) - pts(a))[0]).filter(Boolean);
  }
  function you(M, u) {
    let body;
    const lx = M.maps.find(x => x.st === 'live') || [...M.maps].reverse().find(x => x.st === 'done');
    if (cancel(M)) body = '<p>Прогнозы аннулированы · очков нет</p>';
    else if (hidden(M, u)) body = '<p>Цифры скрыты до «Показать счёт»</p>';
    else if (!CFG.auth) body = M.state === 'pre' ? `<p>Собери пятёрку из игроков этого матча — очки начнут идти со стартом</p><button class="btn" data-a="five">Собери пятёрку →</button>`
      : M.state === 'live' ? `<p>Ответь на вопрос ниже — так ты попадёшь в матч</p><button class="btn btn--ghost" data-a="five">Собери пятёрку →</button>`
      : `<p>Матч сыгран. Проголосуй за MVP — голос идёт в MVP недели</p>`;
    else {
      const five = myFive(M, lx), sum = five.reduce((n, q) => n + pts(q), 0);
      const pick = u.ans ? SHORT[u.ans] : null;
      body = M.state === 'pre' ? `<div class="kv"><span>Мой прогноз</span><b>${pick || 'нет — ответь ниже'}</b></div><button class="btn" data-a="five">Собери пятёрку на этот матч →</button>
          <button class="btn btn--ghost" data-a="bell" aria-pressed="${u.bell}">${u.bell ? 'Напоминание включено ✓' : 'Напомнить о матче'}</button>`
        : M.state === 'live' ? `<div class="kv"><span>Мой прогноз</span><b>${pick || SHORT[M.B]}</b></div><div class="kv"><span>Пятёрка</span><b>${noData(M) ? 'очки после карты' : `${sum} очк. · место 412`}</b></div>
          ${five.length && !noData(M) ? `<div class="kv"><span>Мои в матче</span><b>${five.map(q => esc(nick(q.p))).join(', ')}</b></div>` : ''}
          ${u.other ? `<div class="kv"><span>Другой мой матч</span><b>${vs(3)} · ${clock(models[3].start)}</b></div>` : ''}`
        : `<div class="kv"><span>Угадано</span><b>2 из 3 · 20 очк.</b></div><div class="kv"><span>Пятёрка</span><b>${sum} очк. · место 388</b></div>`;
    }
    const other = CFG.auth && M.state === 'live' ? `<button class="ib" style="width:32px;height:32px;margin:0" data-a="other" aria-label="Другой мой матч">⇄</button>` : '';
    return `<section class="cd"><div class="cd-hd"><b>Ты в матче</b>${other}<small>${CFG.auth ? 'вошёл' : 'гость'}</small></div><div class="cd-bd you">${body}</div></section>`;
  }

  function factsBlock(M) { return `<section class="cd"><div class="cd-hd"><b>Факты к матчу</b><small>${esc(T.league)}</small></div><div class="cd-bd"><ul class="facts">${facts(M).map(f => `<li>${esc(f)}</li>`).join('')}</ul></div></section>`; }

  function guess(M, u) {
    if (cancel(M)) return '';
    const pre = M.state === 'pre', lx = M.maps.find(x => x.st === 'live');
    const paused = !noData(M) && lx && pausedAt(lx);
    const left = M.ovr === 'announce' ? 'до старта · время уточняется' : M.ovr === 'delayed' ? `до старта, ${day(DELAY_TO)} ${clock(DELAY_TO)}` : pre ? `до старта, ${clock(M.start)}` : 'до 45:00 игрового времени';
    return `<section class="cd"><div class="cd-hd"><b>${pre ? 'Угадай до старта' : 'Угадай сейчас'}</b><small>${pre ? 'серия' : 'карта ' + (lx.i + 1)}</small></div><div class="cd-bd">
      <h3 class="q">${pre ? QUESTIONS.pre : QUESTIONS.live}</h3><p class="q-sub">Ответ в один тап · очки за угаданное</p>
      <div class="ans">${[M.A, M.B].map(id => `<button class="an ${u.ans === id ? 'is-on' : ''}" data-a="ans" data-v="${id}" ${u.ans ? 'disabled' : ''}>${logo(id, 'lg--20')}${esc(SHORT[id])}</button>`).join('')}</div>
      ${u.ans ? `<p class="ok">Ответ засчитан · итог — в «Событиях»</p>` : ''}
      <div class="tmr"><div class="tmr__bar"><i style="width:${pre ? 72 : 46}%"></i></div><small><span>Ответы ${left}</span><span>${paused ? 'таймер на паузе' : ''}</span></small></div></div></section>`;
  }

  function mvp(M, u) {
    if (hidden(M, u)) return '';
    const tot = {};
    for (const x of M.maps) for (const p of x.m.players) {
      const team = p.isRadiant ? x.m.radiant_team_id : x.m.dire_team_id;
      const q = tot[p.account_id] ||= { p, team, k: 0, d: 0, a: 0, heroes: [] };
      q.k += p.kills; q.d += p.deaths; q.a += p.assists; q.heroes.push(p.hero_id);
    }
    const c = Object.values(tot).sort((a, b) => (b.k + b.a) / Math.max(1, b.d) - (a.k + a.a) / Math.max(1, a.d)).slice(0, 3);
    const lastEnd = Math.max(...M.maps.map(x => x.m.start_time + x.m.duration)), left = lastEnd + 86400 - NOW;
    return `<section class="cd"><div class="cd-hd"><b>Выбери MVP</b><small>ещё ${Math.floor(left / 3600)} ч ${Math.floor(left % 3600 / 60)} мин</small></div><div class="cd-bd">
      <div class="mvp">${c.map(q => `<button class="mv ${u.vote === q.p.account_id ? 'is-on' : ''}" data-a="vote" data-v="${q.p.account_id}" ${u.vote ? 'disabled' : ''}>
        <span class="mv__av"><img src="${avatar(q.p)}" alt="">${logo(q.team)}</span><b>${esc(nick(q.p))}</b><span class="kda">${q.k}/${q.d}/${q.a}</span>
        <small>${q.heroes.map(h => esc(hero(h).name)).join(', ')}</small></button>`).join('')}</div>
      <p class="q-sub" style="margin:12px 0 0">${u.vote ? 'Твой голос ✓ · итог — через 24 ч после матча' : 'Один голос на матч · меньше 20 голосов — MVP по очкам'} · K/D/A за серию</p></div></section>`;
  }

  function lineups(M, u) {
    const xm = M.maps[u.map], x = xm && xm.st !== 'future' && !cancel(M) && M.state !== 'pre' ? xm : null, pre = !x;
    const hid = hidden(M, u), nd = x && noData(M) && x.st === 'live';
    const m = x ? x.m : M.maps[0].m, sn = x ? snap(x) : null, five = CFG.auth ? myFive(M, x).map(q => q.p) : [];
    const team = id => {
      const rad = id === m.radiant_team_id;
      const ps = (sn ? sn.players : m.players.map(p => ({ p }))).filter(q => q.p.isRadiant === rad);
      const kills = rad ? sn?.kr : sn?.kd;
      return `<div class="rs"><div class="rs-t">${logo(id, 'lg--20')}<b>${esc(NAME[id])}</b>${x && !hid && !nd ? `<span class="num">${kills} ${plural(kills, 'убийство', 'убийства', 'убийств')}</span>` : ''}</div>
        ${ps.map(q => `<button class="pl" data-a="pl" data-v="${m.match_id}|${q.p.account_id}${pre ? '|pre' : ''}"><span class="pl__av"><img src="${avatar(q.p)}" alt="">${pre ? '' : `<img class="pl__h" src="${hero(q.p.hero_id).img}" alt="">`}</span>
          <span class="pl__m"><b>${esc(nick(q.p))}${five.includes(q.p) ? ' <span class="star" title="В твоей пятёрке">★</span>' : ''}</b><small>${pre ? esc((D.players[q.p.account_id] || {}).country || '') || 'игрок' : esc(hero(q.p.hero_id).name)}</small></span>
          ${pre || hid ? '' : nd ? '<span class="pl__s"><small>после карты</small></span>' : `<span class="pl__s"><b>${q.kills}/${q.deaths}${q.assists == null ? '' : '/' + q.assists}</b><small>${CFG.auth ? pts(q) + ' очк.' : k(q.nw) + ' золота'}</small></span>`}</button>`).join('')}</div>`;
    };
    const sub = pre ? 'ожидаемые' : M.state === 'post' ? `итог · карта ${x.i + 1}` : `карта ${x.i + 1}${nd ? '' : ' · ' + mmss(x.t)}`;
    return `<section class="cd"><div class="cd-hd"><b>Составы</b><small>${sub}</small></div><div class="cd-bd" style="padding-bottom:12px"><div class="rs-wrap">${team(M.A)}${team(M.B)}</div>
      ${x && x.st === 'live' && !nd && !hid ? '<p class="q-sub" style="margin:8px 0 0">Убийства/смерти — живые, ассисты — после карты</p>' : ''}
      ${CFG.auth ? (x && !hid ? '<p class="q-sub" style="margin:8px 0 0">★ — в твоей пятёрке · очки — наша формула из статистики</p>' : '')
        : '<button class="lock" data-a="login" data-v="Войди, чтобы видеть очки игроков">Войди, чтобы видеть очки</button>'}</div></section>`;
  }

  function eventsBlock(M, u) {
    if (hidden(M, u) && !u.evShown) return `<section class="cd"><div class="cd-hd"><b>События</b></div><div class="cd-bd"><p class="q-sub">Скрыты анти-спойлером</p><button class="btn btn--ghost" data-a="ev-show">Показать</button></div></section>`;
    const extra = M.ovr === 'delayed' ? [{ ts: NOW - 600, clk: true, html: `Матч перенесён на <b>${day(DELAY_TO)}, ${clock(DELAY_TO)}</b>`, big: true }]
      : cancel(M) ? [{ ts: NOW - 600, clk: true, html: '<b>Матч отменён.</b> Прогнозы и ответы аннулированы', big: true }] : [];
    const all = [...extra, ...(cancel(M) || M.state === 'pre' ? [] : M.maps.filter(x => x.st !== 'future').flatMap(x => events(M, x)))].sort((a, b) => b.ts - a.ts);
    if (!all.length) return `<section class="cd"><div class="cd-hd"><b>События</b></div><div class="empty" style="padding-top:0">Событий пока нет — первые придут с драфтом</div></section>`;
    const live = M.state === 'live', DESK = CFG.view === 'desk', show = u.evOpen ? all : all.slice(0, DESK ? 10 : live ? 3 : 5), rest = all.length - show.length;
    const row = e => `<div class="ev ${e.big ? 'ev--big' : ''}"><span class="ev__t">${e.clk ? clock(e.ts) : mmss(e.time)}<small>${e.clk ? 'сегодня' : 'К' + e.map}</small></span><span class="ev__m">${e.html}</span></div>`;
    return `<section class="cd"><div class="cd-hd"><b>События</b><small>новое сверху</small></div><div class="cd-bd" style="padding-bottom:12px">${show.map(row).join('')}
      ${rest ? `<button class="ev-more" data-a="ev">${live ? `До тебя — ещё ${rest} ${plural(rest, 'событие', 'события', 'событий')}` : `Ещё ${rest}`} ↓</button>` : ''}</div></section>`;
  }

  function links(M) {
    const after = M.state !== 'post';
    const l = (t, dis) => `<button class="lk" data-a="toast" data-v="${t} — отдельная страница (демо)" ${dis ? 'disabled' : ''}><span>${t}</span>${dis ? '<small>после матча</small>' : '<i>›</i>'}</button>`;
    return `<nav class="cd" aria-label="Подстраницы матча">${l('Статистика', after)}${l('Записи карт', after)}${l('История и очные', false)}${l('Сетка турнира', false)}</nav>`;
  }

  function around(M, u) {
    const all = T.series.flatMap(s => s.maps.map(m => ({ s, m }))).filter(q => q.s.start < NOW);
    const longest = all.sort((a, b) => b.m.dur - a.m.dur)[0];
    const items = [];
    for (const id of [M.A, M.B]) { const r = played(id).map(s => res(s, id)), w = r.filter(x => x.win).length;
      if (r.length) items.push(['Форма', `${NAME[id]}: ${w}–${r.length - w} по сериям на турнире`, `${r.map(x => (x.win ? 'В' : 'П')).join(' ')} · от старых к новым`]); }
    if (longest) items.push(['Факт', `Самая долгая карта турнира — ${NAME[longest.s.a]} против ${NAME[longest.s.b]}, ${Math.round(longest.m.dur / 60)} мин`, day(longest.s.start)]);
    const pr = M.maps.flatMap(x => x.m.players).sort((a, b) => b.net_worth - a.net_worth)[0];
    if (M.state === 'post' && !hidden(M, u) && pr) items.push(['Матч', `Самый богатый игрок серии — ${nick(pr)} (${hero(pr.hero_id).name})`, `${k(pr.net_worth)} золота к концу карты`]);
    const show = u.arOpen ? items : items.slice(0, 2);
    return `<section class="cd"><div class="cd-hd"><b>Вокруг матча</b></div><div class="cd-bd" style="padding-bottom:4px">${show.map(([kk, t, s]) => `<div class="ar"><span class="ar__k">${kk}</span><span class="ar__m">${esc(t)}<small>${esc(s)}</small></span></div>`).join('')}</div>
      ${items.length > show.length ? `<button class="cd-ft" data-a="ar">Ещё ${items.length - show.length}</button>` : ''}</section>`;
  }

  // ——— Сборка матча (порядок — §3 пакета) ———
  // Компьютер: шапка во всю ширину; слева основная колонка, справа узкая на всю высоту — «Ты в матче» и «События»
  function render(M) {
    const u = ui(M), mid = M.state === 'pre' ? [factsBlock(M), guess(M, u)] : M.state === 'live' ? [guess(M, u)] : [mvp(M, u)];
    if (V8 || V9) { const desk = CFG.view === 'desk', tab = u.mtab || 'Обзор'; let body = tab8(M, u, tab, desk);
      // v19: виджет рисуется во внутренний элемент — свой класс (T4: «w t5 t6») он ставит на него, обёртка .gm-wd остаётся (ширина по колонке)
      const wds = sideWs(M).map(w => (V19 ? `<div class="gm-wd"><div data-wd="${w.id}"></div></div>` : `<div class="gm-wd" data-wd="${w.id}"></div>`)).join('');
      // v19, телефон: шапка с вкладками → главная колонка → правая (те же виджеты, что справа на компьютере, на любой вкладке)
      // v26: карты матча — в главной колонке, а не во всю ширину (дирижёр 27.10)
      const ms = MSEG && !window.GS_HD2 ? '<div class="gm-ms" data-wd="mseg"></div>' : '', msAll = MSEG_MAIN ? '' : ms, msMain = MSEG_MAIN ? ms : '';
      // лаба gs-res (дирижёр 27.10): GS_SPLIT — «по карте» (сегмент карт + график, драфт, игроки) одним подписанным блоком, ниже отдельно «О матче» (статистика к матчу);
      // на широком (от 1920) делится пополам только блок карты. Без флага — как было
      if (SPLIT) { const sb = statBlock(), inner = body.replace(sb, ''), cur = MSEG ? msegCur(M, u) : -1, x = cur > 0 ? M.maps[cur - 1] : null;
        const lbl = cur === 0 ? 'Превью серии' : x ? `Карта ${x.i + 1} · ${x.st === 'live' ? 'идёт' : x.st === 'done' ? 'сыграна' : 'впереди'}` : 'Матч';
        // заход 2 (дирижёр 27.10: «статистика относится ко всему матчу, и игроки — ко всему матчу… в правую колонку»): игроки и статистика — блок «О матче»;
        // на широком (от 1920) — две колонки: слева карта, справа матч; уже — друг под другом
        const pm = inner.match(/<div class="gm-wd"><div data-wd="players"[^>]*><\/div><\/div>/), pl = pm ? pm[0] : '', mapIn = inner.replace(pl, '');
        const ab = [pl, body.includes(sb) ? sb : ''].join('');
        const main = `<div class="gm-split"><section class="gm-map"><div class="gm-lbl">${lbl}</div>${msMain}<div class="gm-mapb">${mapIn}</div></section>${ab ? `<section class="gm-map gm-about"><div class="gm-lbl">О матче</div><div class="gm-mapb">${ab}</div></section>` : ''}</div>`;
        if (!desk) return `${header(M, u)}<div class="gm-z gm-main is-split">${main}</div><div class="gm-z gm-side">${side0(M, u)}${wds}</div>${rail(M)}`;
        return `${header(M, u)}<div class="gm-cols${rail(M) ? ' has-rail' : ''}">${rail(M)}<div class="gm-main is-split">${main}</div>
      <aside class="gm-side">${side0(M, u)}${wds}</aside></div>`; }
      // gs-match-2 шаг 2 (GS_HD2_WIN): вкладки карт — только в главной колонке, как окно браузера: полоса вкладок, под ней «страница» с графиком и драфтом внутри
      if (window.GS_HD2_WIN) body = `<div class="bw">${window.GS_HD2_TABS(M, msegData(M, u), headerData(M, u))}<div class="bw-page">${body}</div></div>`;
      if (!desk && V19) return `${header(M, u)}${msAll}${mtabs6(M, u)}<div class="gm-z gm-main">${msMain}${body}</div><div class="gm-z gm-side">${side0(M, u)}${wds}</div>${rail(M)}`;
      if (!desk) return header(M, u) + mtabs6(M, u) + body + (V15 ? wds : '');
      return `${header(M, u)}${msAll}<div class="gm-cols${rail(M) ? ' has-rail' : ''}">${rail(M)}<div class="gm-main">${msMain}${mtabs6(M, u)}${body}</div>
      <aside class="gm-side">${side0(M, u)}${wds}</aside></div>`; }
    if (V6) { const desk = CFG.view === 'desk', tab = u.mtab || 'Обзор', body = tab === 'Карты' ? maps6(M, u, desk) : tab === 'События' ? eventsBlock(M, { ...u, evOpen: true }) : (V7 ? overview7 : overview6)(M, u, mid, desk);
      if (!desk) return header(M, u) + mtabs6(M, u) + body;
      return `${header(M, u)}<div class="gm-cols"><div class="gm-main">${mtabs6(M, u)}${body}</div>
      <aside class="gm-side">${you(M, u)}${sideWs(M).map(w => `<div class="gm-wd" data-wd="${w.id}"></div>`).join('')}</aside></div>`; }
    if (V4 && CFG.view === 'desk') return `${header(M, u)}${mtabs()}<div class="gm-cols"><div class="gm-main">${[chips(M, u), top(M, u), statTable(M, u), mapsDone(M, u)].join('')}
      <div class="gm-grid">${[fansBlock(M), ...mid, around(M, u), links(M)].join('')}</div></div>
      <aside class="gm-side">${you(M, u)}${eventsBlock(M, u)}${sideWs(M).map(w => `<div class="gm-wd" data-wd="${w.id}"></div>`).join('')}</aside></div>`;
    if (V4) return [header(M, u), mtabs(), chips(M, u), top(M, u), you(M, u), fansBlock(M), ...mid, lineups(M, u), mapsDone(M, u), eventsBlock(M, u), links(M), around(M, u)].join('');
    if (CFG.view === 'desk') return `${header(M, u)}<div class="gm-cols"><div class="gm-main">${[chips(M, u), top(M, u), ...mid, lineups(M, u), links(M), around(M, u)].join('')}</div>
      <aside class="gm-side">${you(M, u)}${eventsBlock(M, u)}${sideWs(M).map(w => `<div class="gm-wd" data-wd="${w.id}"></div>`).join('')}</aside></div>`;
    return [header(M, u), chips(M, u), top(M, u), you(M, u), ...mid, lineups(M, u), eventsBlock(M, u), links(M), around(M, u)].join('');
  }

  // Наши виджеты для начальника в правой колонке компьютера (дирижёр 26.10): итоговые 23.10 — турнир v11, замены v9, трансферы v4, MVP v13
  // (код и данные — из их лаб, данные там — пример). Замены — только вошедшему: виджет технический. Пакет §3: «виджеты главной не ставим» — находка.
  const WIDGETS = [
    // gs-match-2 шаг 4 (GS_T4C): компактный — только две команды матча и «Раскрыть» (созвон 28.10 §3.1)
    { id: 't4', draw: (el, M) => { const o = { match: { a: NAME[M.A], b: NAME[M.B] }, opt: { v3: true, tier: 'fill', tierEn: true, final: 'merge', dt: 'mono' } }; window.T4 && (window.GS_T4C ? GS_T4C(el, o) : T4.render(el, o)); } },
    { id: 's3', auth: true, draw: el => { const o = { empty: true, game: 'when', big: true, plainHd: true, tint: true }; window.S3 && (window.GS_S3C ? GS_S3C(el, o) : S3.render(el, o)); } }, // GS_S3C — gs-match-2 v30: сворачивается (лаба widget-expand v20) // в наших сериях замен нет,
    { id: 'tr', draw: (el, M) => window.TR5 && TR5.render(el, { match: { a: NAME[M.A], b: NAME[M.B] } }) },
    // gold — не правая колонка, а график в главной (main: true — в правую колонку не добавляется)
    { id: 'gold', main: true, draw: (el, M) => { const x = M.maps[+el.dataset.mi]; window.WGOLD.render(el, { m: x.m, t: x.t, n: x.i + 1, state: noData(M) ? 'nodata' : x.st === 'live' ? 'live' : 'post', ...(window.GS_GOLD_OPT || {}) }); } },
    // header — шапка матча во всю ширину (v21): что показать — из модели матча, клики (вкладки, колокольчик) — data-a, как у страницы
    { id: 'header', main: true, draw: (el, M) => window.WHEADER.render(el, { ...headerData(M, ui(M)), after: h => h.querySelectorAll('[data-hdsoc]').forEach(x => WSOC.render(x, { look: 'btns', mode: 'pillsI', M, bar: () => barData(M) })) }) },
    // players — тоже главная колонка; без data-mi (лаба gs-solo рисует заново) — идущая карта, иначе последняя сыгранная
    { id: 'players', main: true, draw: (el, M) => { const i = el.dataset.mi != null ? +el.dataset.mi : Math.max(M.maps.findIndex(x => x.st === 'live'), M.maps.filter(x => x.st === 'done').length - 1);
      const x = M.maps[i]; window.WPLAYERS.render(el, { m: x.m, t: x.t, state: x.st === 'live' ? 'live' : 'post' }); } },
    // mseg — карты матча под шапкой, во всю ширину (v25, w-maps v9)
    { id: 'mseg', main: true, draw: (el, M) => window.WMSEG.render(el, msegData(M, ui(M))) },
    // stat — «Статистика к матчу» в главной колонке (v28, w-preview v21)
    { id: 'stat', main: true, draw: (el, M) => window.WSTAT.render(el, { A: M.A, B: M.B, start: M.start, names: { [M.A]: NAME[M.A], [M.B]: NAME[M.B] } }) },
    // vote — остров нижнего бара на компьютере (бара нет): вопрос-событие в правой колонке (v23)
    ...(BAR ? [{ id: 'vote', desk: true, draw: (el, M) => WBAR.side(el, barData(M)) }] : []),
    // promo — лаба widget-promo (созвон 28.10 §3.8): квадрат «мем или наша графика»; рисует GS_PROMO, место в правой колонке — GS_PROMO_AT (top · mid · end)
    { id: 'promo', draw: (el, M) => window.GS_PROMO && GS_PROMO(el, M) },
    // vote2 — лаба widget-vote (созвон 28.10 §3.5: «голосование как в отеле»): рисует GS_VOTE, место — сразу после promo (или первым)
    { id: 'vote2', draw: (el, M) => window.GS_VOTE && GS_VOTE(el, M) },
    // act — лаба w-actions (созвон 28.10 §3.6, дирижёр 29.10: трансляция + социальная активность вокруг матча): рисует GS_ACT, место — первым в правой колонке
    { id: 'act', draw: (el, M) => window.GS_ACT && GS_ACT(el, M) },
    { id: 'mvp', draw: (el, M) => window.MVPC && MVPC.render(el, { match: { a: NAME[M.A], b: NAME[M.B] }, mine: CFG.auth, up: true, depth: true, dock: 'split' }) },
    // лабы 27.10 (sd — не в общий список правой колонки, место выбирает sideWs): draft — драфт у графика (w-draft), sd-* и side — правая колонка (w-side), soc — кнопки сообщества (w-social)
    { id: 'draft', main: true, draw: (el, M) => { const x = M.maps[+el.dataset.mi]; window.WDRAFT.render(el, { m: x.m, n: x.i + 1, state: drafting(M, x) ? 'draft' : 'after', look: el.dataset.look, side: +el.dataset.side }); } },
    ...['predict', 'tournament', 'news', 'mvp'].map(k => ({ id: 'sd-' + k, sd: true, draw: (el, M) => window.WSIDE.render(el, { w: k, M }) })),
    { id: 'side', sd: true, draw: (el, M) => window.WSIDE.render(el, { w: SIDE, M, list: WSIDE.order(M, 'plain') }) },
    { id: 'soc', sd: true, draw: (el, M) => window.WSOC.render(el, { look: socLine() ? 'line' : CFG.view !== 'desk' && SOC_M === 'sheet' ? 'card' : SOC, keys: CFG.view !== 'desk' && SOC_M === 'two' ? ['like', 'talk'] : null, M }) },
  ];
  // лаба w-side v2–v5 (дирижёр 27.10): правая колонка — виджеты лабы w-side v1 вместо турнира, замен, трансферов и MVP 23.10 (созвон 26.10 §6: трансферов нет, MVP — после матча).
  // GS_SIDE: plain — прогноз, турнир, новости, MVP · state — порядок по состоянию матча · one — всё одной карточкой · tabs — одна карточка с вкладками. Вопрос матча (остров) — первым, как был
  const SIDE = window.GS_SIDE || '';
  // лаба w-social v1–v3: GS_SOC — row (строкой низом графика) · rail (колонка слева, на телефоне — тоже слева, над баром) · card (карточка «Обсуждение» в правой колонке)
  const SOC = window.GS_SOC || '', SPLIT = window.GS_SPLIT === true;
  function sideWs(M) {
    // gs-match-2 v1: GS_NO_TR — без трансферов (созвон 28.10: «трансфер в момент матча вообще не интересует»); GS_NOISL — без острова, значит и без его вопроса справа
    const ok = w => !w.main && !w.sd && (!w.desk || CFG.view === 'desk') && (!w.auth || CFG.auth) && !(w.id === 'vote' && (DKON() || NOISL)) && !(w.id === 'tr' && window.GS_NO_TR) && !(w.id === 'mvp' && window.GS_MVP_POST && M.state !== 'post'), by = id => WIDGETS.find(w => w.id === id); // gs-match-2 v37: GS_MVP_POST — MVP только после матча (дирижёр 29.10)
    const own = !SIDE ? WIDGETS.filter(ok) : [...WIDGETS.filter(w => w.id === 'vote' && ok(w)),
      ...(SIDE === 'one' || SIDE === 'tabs' ? [by('side')] : WSIDE.order(M, SIDE).filter(k => k !== 'mvp' || M.state === 'post').map(k => by('sd-' + k)))];
    const at = window.GS_PROMO && window.GS_PROMO_AT, rest = own.filter(w => w.id !== 'promo' && w.id !== 'vote2' && w.id !== 'act'), pr = by('promo');
    const withPromo = !at ? rest : at === 'top' ? [pr, ...rest] : at === 'mid' ? [...rest.slice(0, 1), pr, ...rest.slice(1)] : [...rest, pr];
    const withVote = !window.GS_VOTE ? withPromo : (k => [...withPromo.slice(0, k + 1), by('vote2'), ...withPromo.slice(k + 1)])(withPromo.indexOf(pr));
    const withAct = window.GS_ACT ? [by('act'), ...withVote] : withVote;
    // gs-match-2 v38 (дирижёр 29.10): GS_LIVEONLY — «Пульс», «Обсуждение» и голосование только в live и до матча (до — своим видом); после матча их нет
    // GS_POSTKEEP (02.11, «Прогнозы»): что всё же оставить после матча — напр. ['vote2'], там итог-купон
    const fin = window.GS_LIVEONLY && M.state === 'post' ? withAct.filter(w => !['promo', 'vote2', 'act'].filter(id => !(window.GS_POSTKEEP || []).includes(id)).includes(w.id)) : withAct;
    return SOC === 'card' ? [...fin, by('soc')] : fin;
  }
  // лаба w-social v5–v8 (дирижёр 27.10: «пока думаем про мобилку»): GS_SOC_M — где кнопки на телефоне: push — колонкой, виджеты сдвинуты вправо ·
  // tab — свёрнуты в полупрозрачный ярлычок у края, тянешь — выезжают (как свёрнутое видео на айфоне) · strip — строкой над баром (как Sports.ru) · merge — одним блоком с баром
  // v12–v14: dock / drawer — строка над баром (капсулой / из-под бара) · pages — кнопки в баре, второй страницей
  // v15–v17 (дирижёр 27.10: «ещё подумай»): fan — круглая кнопка у левого края, нажал — кнопки веером вверх · idle — строка появляется, когда перестал листать ·
  // sheet — у бара язычок, потянул бар вверх — из-под него выезжает шторка «Обсуждение» (комментарии и кнопки)
  // лаба w-desk (дирижёр 27.10, страница v38 на компьютере: «колонка кнопок слева не нравится; трансляцию — объединить с тем блоком; если это наша пилюля — лучше адаптировать с шапкой»):
  // GS_DESKBAR — head: остров, кнопки сообщества и «Трансляция» — в шапке матча · float: всё одной стеклянной группой внизу по центру, как на телефоне ·
  // split: остров — в шапке, кнопки и «Трансляция» — стеклянной группой внизу справа. Колонки кнопок слева и острова в правой колонке нет
  const DK = window.GS_DESKBAR || '', DKON = () => CFG.view === 'desk' && !!DK;
  const SOC_M = window.GS_SOC_M || '', socLine = () => CFG.view !== 'desk' && ['strip', 'merge', 'dock', 'drawer', 'idle', 'two'].includes(SOC_M);
  // v18–v19 (дирижёр 27.10: «сильно сложно и слабо проработана удобность»): под пальцем — только частое, редкое — в шапку, без скрытых жестов.
  // two — над баром слева две кнопки: Нравится и Комментарии; «Поделиться» (и репост в нём) — значок в шапке · tab5 — «Комментарии» в баре вместо «Поиска», поиск и «Поделиться» — в шапке
  const SV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const PT_ICS = () => CFG.view === 'desk' || SOC !== 'rail' || !['two', 'tab5'].includes(SOC_M) ? '' : `<span class="pt-ics">${SOC_M === 'tab5' ? `<button data-a="toast" data-v="Поиск (демо)" aria-label="Поиск">${SV('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>')}</button>` : ''}<button data-a="toast" data-v="Ссылка на матч скопирована · репост — там же (демо)" aria-label="Поделиться">${SV('<path d="M12 4v11M8 8l4-4 4 4M5 13v6h14v-6"/>')}</button></span>`;
  const RH = { tab: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>', drawer: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>', sheet: '<i></i>',
    fan: '<svg viewBox="0 0 24 24"><path d="M5 5h14v10H10l-4 4v-4H5z"/></svg>' };
  const rail = M => SOC === 'rail' && ((CFG.view === 'desk' && !DK) || (M === models[START_I] && SOC_M !== 'pages' && SOC_M !== 'tab5' && !/^pills/.test(SOC_M)))
    ? `<div class="gm-rail${SOC_M ? ' rm-' + SOC_M + (['dock', 'drawer', 'idle'].includes(SOC_M) ? ' rm-strip' : '') : ''}">${RH[SOC_M] ? `<button class="rm-h" data-rm="tab" aria-label="Кнопки сообщества">${RH[SOC_M]}</button>` : ''}<div data-wd="soc"></div></div>` : '';
  // Лаба gs-solo: нарисовать виджет правой колонки в своём месте — как у матча секции sec
  window.GS_WD = (id, el, sec) => WIDGETS.find(w => w.id === id).draw(el, models[sec.dataset.i]);
  // v13: высота шапки матча → --hd-h у её матча, вкладки прилипают ровно под ней
  const hdObs = V13 && window.ResizeObserver ? new ResizeObserver(es => es.forEach(e => { const sec = e.target.closest('.gm'); sec && sec.style.setProperty('--hd-h', e.target.offsetHeight + 'px'); })) : { observe() {} };
  if (V13) document.body.classList.add('tabs-stick');
  if (V14 && !V16) document.body.classList.add('hd-shrink');
  if (V16 && !V18) document.body.classList.add('hd-smooth');
  function paint(sec, M) {
    sec.innerHTML = render(M); sec.dataset.st = M.state; // 06.11 (w-stats-3): состояние матча на секции — блоки вкладок читают его (pre · live · post …)
    if (V13) { const hd = sec.querySelector('.gm-hd'); if (hd) hdObs.observe(hd); }
    sec.querySelectorAll('[data-wd]').forEach(el => { try { WIDGETS.find(w => w.id === el.dataset.wd).draw(el, M); } catch (e) { el.remove(); } });
    if (V19 && CFG.labels) labelWidgets(sec);
  }
  // v19: виджеты матча секции sec — место (all — во всю ширину / main / side), название, элемент. Для подписей и лаб gs-gold, gs-solo (window.GS_LIST)
  const WD_NAME = { draft: 'Драфт', soc: 'Кнопки сообщества', side: 'Правая колонка', 'sd-predict': 'Прогноз', 'sd-tournament': 'Турнир', 'sd-news': 'Новости матча', 'sd-mvp': 'MVP серии', mseg: 'Карты матча', stat: 'Статистика к матчу', vote: 'Вопрос матча', gold: 'Перевес по золоту', players: 'Игроки', t4: 'Турнир', s3: 'Замены', tr: 'Трансферы', mvp: 'MVP' }, PLACE = { all: 'Во всю ширину', main: 'Главная', side: 'Справа' };
  function widgetList(sec) {
    // v21: график золота — тоже [data-wd] (gold), но внутри карточки: имя — по вкладкам / «Перевес по золоту», перерисовка (wd) — только у виджетов правой колонки (.gm-wd)
    const wd = el => el.querySelector('[data-wd="gold"]') || el.querySelector('[data-wd]'), name = el => el.matches('#portal') ? 'Шапка сайта' : el.matches('.gm-hd') ? 'Шапка матча и вкладки' : el.matches('.gm-ms') ? 'Карты матча'
      : el.querySelector('.seg') ? [...el.querySelectorAll('.seg button')].map(b => b.textContent.trim()).join(' · ')
      : wd(el) ? WD_NAME[wd(el).dataset.wd] || wd(el).dataset.wd
      : el.querySelector('.g2-t') ? 'Перевес по золоту'
      : (el.querySelector('.cd-hd b, .pg-hd b') || {}).textContent || 'Блок';
    const res = [], seen = {};
    const add = (el, place) => { const n = name(el).trim(), k0 = place + ':' + n; seen[k0] = (seen[k0] || 0) + 1;
      res.push({ key: seen[k0] > 1 ? k0 + ' ' + seen[k0] : k0, place, label: `${PLACE[place]} · ${n}`, el, wd: el.classList.contains('gm-wd') && wd(el) ? wd(el).dataset.wd : undefined }); };
    // шапка сайта (портал) — тоже виджет во всю ширину, над шапкой матча (дирижёр 26.10)
    const pt = document.querySelector('#portal'); if (pt) add(pt, 'all');
    const hd = sec.querySelector('.gm-hd'); if (hd) add(hd, 'all');
    const ms = sec.querySelector('.gm-ms'); if (ms) add(ms, MSEG_MAIN || SPLIT ? 'main' : 'all');
    const rl = sec.querySelector('.gm-rail'); if (rl) add(rl, 'main');
    for (const [z, p] of [['.gm-main', 'main'], ['.gm-side', 'side']]) {
      const col = sec.querySelector(z); if (col) col.querySelectorAll(':scope > .cd, :scope > .gm-wd, :scope > .gm-grid > .cd, :scope > .gm-gd > .cd, :scope > .gm-split > .gm-map > .gm-mapb > .cd, :scope > .gm-split > .gm-map > .gm-mapb > .gm-wd, :scope > .gm-split > .gm-map > .gm-mapb > .gm-gd > .cd').forEach(el => add(el, p));
    }
    return res;
  }
  window.GS_LIST = () => { const sec = document.querySelector('#feed .gm'); return sec ? widgetList(sec) : []; };
  // подписи виджетов — «место · название» над каждым (переключатель «Подписи виджетов» в панели)
  function labelWidgets(sec) { widgetList(sec).forEach(w => w.el.insertAdjacentHTML('beforebegin', `<div class="wl">${esc(w.label)}</div>`)); }

  // ——— Лента: следующий матч подгружается снизу ———
  // Палец/мышь по графику v2 — минута и перевес
  function scrubG2() {
    document.addEventListener('pointermove', e => {
      const w = e.target.closest('.g2-wrap'); if (!w) return;
      const c = JSON.parse(w.dataset.g2), svg = w.querySelector('svg'), r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * c.W;
      const mi = Math.round(Math.max(0, Math.min(c.g.length - 1, (sx - c.L) / (c.W - c.L - 4) * c.dur))), v = c.g[mi], tip = w.querySelector('.g2-tip');
      const xx = c.L + mi / c.dur * (c.W - c.L - 4), cur = w.querySelector('.g2-cur');
      cur.setAttribute('x1', xx); cur.setAttribute('x2', xx); cur.setAttribute('opacity', '.5');
      tip.hidden = false; tip.style.left = `${xx / c.W * 100}%`;
      tip.innerHTML = `<b>${mi}′</b> ${v ? `${v > 0 ? c.a : c.b} +${k(v)}` : 'поровну'}`;
    });
    document.addEventListener('pointerout', e => { const w = e.target.closest && e.target.closest('.g2-wrap'); if (w && !w.contains(e.relatedTarget)) { w.querySelector('.g2-tip').hidden = true; w.querySelector('.g2-cur').setAttribute('opacity', '0'); } });
  }

  const feed = $('#feed');
  // лента (дирижёр 28.10: «матчей должно быть минимум 3 во всех состояниях»): стартовый, потом следующие, потом более ранние матчи дня — в ленте всегда все 4.
  // order — порядок индексов models, shown — сколько уже показано; CUR_I — матч, который сейчас на экране (по нему остров и кнопки внизу)
  let models = [], shown = 0, START_I = 0, CUR_I = 0, order = [];
  function append() {
    if (shown >= order.length) return;
    const i = order[shown], M = models[i];
    if (feed.querySelector('.gm')) feed.insertAdjacentHTML('beforeend', `<div class="nx">${i > START_I ? 'Дальше' : 'Ранее сегодня'} · ${esc(T.league)} · ${clock(M.start)}</div>`);
    const sec = document.createElement('section'); sec.className = 'gm'; sec.dataset.i = i; feed.append(sec); paint(sec, M);
    shown++;
    if (shown === order.length) feed.insertAdjacentHTML('beforeend', '<div class="end">Турнирный день закончен · ближайший матч не назначен</div>');
  }
  function reset() {
    const q = new URLSearchParams(location.search).get('m');
    const st = CFG.state === 'pause' ? 'live' : CFG.state;
    const first = st === 'feed' && q != null ? Math.max(0, Math.min(D.series.length - 1, Number(q))) : START[st];
    models = D.series.map((s, i) => model(s, i === first && st !== 'feed' && st !== START_STATE[first] ? st : null));
    for (const key in UI) delete UI[key];
    order = [first, ...models.map((_, i) => i).filter(i => i > first), ...models.map((_, i) => i).filter(i => i < first)];
    feed.innerHTML = ''; shown = 0; START_I = CUR_I = first; append();
    document.body.classList.toggle('is-desk', CFG.view === 'desk');
    portal(); scrollTo(0, 0);
  }
  const START_STATE = { 0: 'post', 2: 'live', 3: 'pre' }; // естественное состояние стартового матча — без переопределения
  const rerender = () => { document.body.classList.toggle('is-desk', CFG.view === 'desk'); fluid(); portal(); document.querySelectorAll('.gm').forEach(sec => paint(sec, models[sec.dataset.i])); };

  // ——— Панель песочницы (window.LAB, view 'toolbar' — см. sandbox-project/lab.tsx) ———
  const CASE_V = ['announce', 'nodata', 'offline', 'delayed', 'cancel']; if (!CFG.mst || CASE_V.includes(CFG.mst)) CFG.mst = CASE_V.includes(CFG.state) ? 'live' : CFG.state;
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер 1440' }, { v: 'phone', label: 'Телефон 390' }] },
      // GS_ONLY_STATES — лаба одного блока (gs-gold): остальные состояния нельзя выбрать — блока в них нет
      // 06.11 (дирижёр: «разделить состояние матча и дополнительные моменты, когда нет данных и всё такое»): «Матч» — ход матча, «Особый случай» — нет данных, перенос, отмена (поверх хода матча)
      { key: 'state', name: 'Матч', value: CFG.mst, options: STATES.filter(([v]) => !CASE_V.includes(v)).map(([v, label]) => (window.GS_ONLY_STATES && !GS_ONLY_STATES.includes(v) ? { v, label, off: true, offNote: 'виджета нет' } : !window.WLS_PROD && (v === 'draft' || v === 'live12') ? { v, label, off: true, offNote: 'нет в этой версии' } : { v, label })) },
      { key: 'case', name: 'Особый случай', value: CASE_V.includes(CFG.state) ? CFG.state : 'none', options: [{ v: 'none', label: 'Нет' }, ...STATES.filter(([v]) => CASE_V.includes(v)).map(([v, label]) => (window.GS_ONLY_STATES && !GS_ONLY_STATES.includes(v) ? { v, label, off: true, offNote: 'виджета нет' } : { v, label }))] },
      { key: 'auth', name: 'Зритель', value: CFG.auth ? 'in' : 'guest', options: [{ v: 'guest', label: 'Гость' }, { v: 'in', label: 'Вошёл' }] },
      { key: 'game', name: 'Игра', value: 'dota', options: [{ v: 'dota', label: 'Dota 2' }, ...['LoL', 'CS2', 'Valorant', 'MLBB'].map(g => ({ v: g, label: g, off: true }))] },
      { key: 'bo', name: 'Серия', value: 'bo3', options: [{ v: 'bo1', label: 'Bo1', off: true }, { v: 'bo3', label: 'Bo3' }, { v: 'bo5', label: 'Bo5', off: true }] },
    ],
    set(key, v) {
      if (key === 'view') { CFG.view = v; rerender(); }
      if (key === 'auth') { CFG.auth = v === 'in'; rerender(); }
      // draft / live12 / pre0 решает w-lane-2 при загрузке (_wls-st.js) — на странице с ним шаг меняем перезагрузкой с ?state=
      if (key === 'state') { if (window.WLS_PROD && (WLSS.includes(v) || WLSS.includes(CFG.mst) || v === 'pre' || v === 'live')) { const q = new URLSearchParams(location.search); q.set('state', v); if (CASE_V.includes(CFG.state)) q.set('case', CFG.state); location.search = q.toString(); return; }
        CFG.mst = v; CFG.state = CORE[v] || v; reset(); }
      if (key === 'case') { CFG.state = v === 'none' ? CORE[CFG.mst] || CFG.mst : v; reset(); }
    },
    toggles: () => [{ key: 'spoiler', name: 'Анти-спойлер', value: CFG.spoiler }, ...(BAR ? [{ key: 'event', name: 'Прилетело событие (live)', value: !!CFG.event }] : []), ...(DRAFT ? [{ key: 'draft', name: 'Драфт идёт (live)', value: !!CFG.draft }] : []), ...(V19 ? [{ key: 'labels', name: 'Подписи виджетов', value: !!CFG.labels }] : [])],
    toggle(key) { if (key === 'spoiler') { CFG.spoiler = !CFG.spoiler; reset(); }
      if (key === 'event') { CFG.event = !CFG.event; rerender(); }
      if (key === 'draft') { CFG.draft = !CFG.draft; rerender(); }
      if (key === 'labels') { CFG.labels = !CFG.labels; document.body.classList.toggle('wl-on', CFG.labels); rerender(); } },
    caption: () => `${CAPTION[CFG.state]} · другие игры и Bo1/Bo5 — позже, нужны данные`,
  };

  reset();
  if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); rerender(); } });
  // v40 (GS_FLUID, дирижёр 27.10): телефон тянется на всю ширину окна; уже 412 — весь экран пропорционально уменьшается
  // GS_FLUID_MAX = 799 (w-header-2 v8, дирижёр 28.10: «мобилка не должна тянуться на всю страницу — до 799»)
  const fluid = () => { const on = !!window.GS_FLUID && CFG.view !== 'desk'; document.body.classList.toggle('fluid', on); document.documentElement.style.zoom = on && innerWidth < 412 ? String(innerWidth / 412) : ''; document.body.classList.toggle('fluid-799', on && window.GS_FLUID_MAX === 799); };
  fluid(); addEventListener('resize', fluid);
  // Шапка портала: вниз — прячется, вверх — сразу возвращается (дирижёр 26.10)
  let lastY = 0;
  addEventListener('scroll', () => { const y = scrollY, dy = y - lastY; if (Math.abs(dy) < 4) return;
    document.body.classList.toggle('pt-off', y > 52 && dy > 0); if (BARHIDE) document.body.classList.toggle('bar-off', y > 52 && dy > 0); lastY = y; }, { passive: true });
  // какой матч на экране: последний, чей верх выше 40 % окна; сменился — перерисовать остров и кнопки внизу (portal)
  addEventListener('scroll', () => { let i = START_I; document.querySelectorAll('#feed .gm').forEach(sec => { if (sec.getBoundingClientRect().top < innerHeight * 0.4) i = +sec.dataset.i; });
    if (i !== CUR_I) { CUR_I = i; portal(); } }, { passive: true });
  // лаба w-bar v13–v15 (дирижёр 27.10, начальник 26.10 [2 · 07:01]: «провалился в матч — бар можно прятать»): вниз — прячется, вверх — возвращается.
  // GS_BARHIDE: all — уезжает весь · island — остаётся остров · small — ужимается до значков
  const BARHIDE = window.GS_BARHIDE || '';
  if (BARHIDE) document.body.classList.add('bh-' + BARHIDE);
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting && append()), { rootMargin: '600px 0px' }).observe($('#more'));

  // ——— Действия ———
  const toast = t => { const el = $('#toast'); el.textContent = t; el.classList.add('is-on'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('is-on'), 2600); };
  const sheet = $('#sheet');
  let afterLogin = null;
  // Гость: действие → шторка «Вход через Telegram», после входа действие засчитывается (§4.6)
  function login(reason, then) {
    afterLogin = then || null;
    sheet.innerHTML = `<div class="sh__grip"></div><div class="sh__hd"><span class="tg">✈</span><div><b>Вход через Telegram</b><small>${esc(reason)}</small></div></div>
      <div class="sh__ft" style="flex-direction:column"><button class="btn" data-a="login-ok">Войти через Telegram</button><button class="btn btn--ghost" data-a="close">Не сейчас</button>
      <p class="q-sub" style="margin:4px 0 0;text-align:center">Демо: Telegram не подключён</p></div>`;
    sheet.showModal();
  }
  const needAuth = (reason, then) => (CFG.auth ? then() : login(reason, then));
  function openPlayer(matchId, acc, pre) {
    const M = models.find(M => M.maps.some(x => x.m.match_id === matchId)), u = ui(M);
    const x = M.maps.find(x => x.m.match_id === matchId), p = x.m.players.find(p => p.account_id === acc);
    const sn = pre || x.st === 'future' || hidden(M, u) ? null : snap(x).players.find(q => q.p === p), nd = noData(M) && x.st === 'live';
    const team = p.isRadiant ? x.m.radiant_team_id : x.m.dire_team_id, h = hero(p.hero_id), full = x.st === 'done';
    sheet.innerHTML = `<div class="sh__grip"></div><div class="sh__hd"><img src="${avatar(p)}" alt=""><div><b>${esc(nick(p))}</b><small>${logo(team, 'lg--20')}${esc(NAME[team])}</small></div></div>
      ${!sn ? `<p class="q-sub" style="margin:0 16px">${hidden(M, u) ? 'Статистика скрыта анти-спойлером' : 'Герой и статистика появятся после драфта'}</p>` : `<div class="sh__hero"><img src="${h.img}" alt=""><div><b>${esc(h.name)}</b><small>Карта ${x.i + 1} · ${full ? 'итог' : nd ? 'идёт' : mmss(x.t)}</small></div></div>
      ${nd ? '<p class="q-sub" style="margin:12px 16px 0">Подробные данные появятся после карты</p>' : `<div class="sh__st"><div><b>${sn.kills}</b><small>убийства</small></div><div><b>${sn.deaths}</b><small>смерти</small></div><div><b>${sn.assists ?? '—'}</b><small>ассисты</small></div><div><b>${k(sn.nw)}</b><small>золото</small></div></div>`}
      ${full ? `<div class="sh__lbl">Предметы</div><div class="sh__it">${[...p.items, p.neutral].filter(Boolean).map(i => `<img src="${(D.items[i] || {}).img}" alt="" title="${esc((D.items[i] || {}).name)}">`).join('')}</div>` : ''}`}
      <div class="sh__ft">${CFG.auth ? `<span class="btn btn--ghost" style="cursor:default">${sn && !nd ? pts(sn) + ' очк. за карту' : 'Очки — после карты'}</span>` : '<button class="btn btn--ghost" data-a="login" data-v="Войди, чтобы видеть очки игроков">Войди, чтобы видеть очки</button>'}
        <button class="btn" data-a="toast" data-v="Страница игрока — отдельно (демо)">Вся страница игрока →</button></div>`;
    sheet.showModal();
  }
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });

  // Палец / мышь по графику v2 — минута и перевес
  scrubG2();

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    e.preventDefault();
    const a = b.dataset.a, v = b.dataset.v, sec = b.closest('.gm');
    if (a === 'toast') return toast(v);
    if (a === 'close') return sheet.close();
    if (a === 'back') return toast('Назад — в ту же точку расписания');
    if (a === 'login') return login(v);
    if (a === 'login-ok') { CFG.auth = true; sheet.close(); const f = afterLogin; afterLogin = null; f && f(); rerender(); return toast('Ты вошёл через Telegram (демо)'); }
    if (a === 'pl') { const [mid, acc, pre] = v.split('|'); return openPlayer(Number(mid), Number(acc), !!pre); }
    if (!sec) return;
    const M = models[sec.dataset.i], u = ui(M), draw = () => paint(sec, M);
    if (a === 'bell') return needAuth('Войди, чтобы получить напоминание в Telegram', () => { u.bell = !u.bell; draw(); toast(u.bell ? 'Напомним в Telegram через бота за 15 минут и при старте' : 'Напоминание выключено'); });
    if (a === 'fan') return needAuth('Войди, чтобы проголосовать за команду', () => toast('Голос принят'));
    if (a === 'five') return needAuth('Войди, чтобы собрать пятёрку на матч', () => toast('Фэнтези — отдельный раздел (демо)'));
    if (a === 'ans') return needAuth('Войди — ответ засчитается сразу', () => { u.ans = Number(v); draw(); });
    if (a === 'vote') return needAuth('Войди, чтобы сохранить голос за MVP', () => { u.vote = Number(v); draw(); });
    if (a === 'map') u.map = Number(v);
    if (a === 'mseg') u.mseg = Number(v);
    if (a === 'mtab-map') { u.mtab = 'Карты'; u.map = Number(v); }
    if (a === 'next-map') { u.unlocked++; u.map = u.unlocked - 1; }
    if (a === 'reveal') u.revealed = true;
    if (a === 'ev-show') u.evShown = true;
    if (a === 'other') u.other = !u.other;
    if (a === 'tab') u.tab = v;
    if (a === 'mtab') u.mtab = v;
    if (a === 'src' || a === 'lang') u[a] = v;
    if (a === 'ev') u.evOpen = true;
    if (a === 'ar') u.arOpen = true;
    draw();
  });
  // v29: кнопка «Трансляция» в углу → мини-окно (картинка в картинке), без звука; закрыть — × или та же кнопка. Что идёт — по первому матчу ленты
  if (PIP) {
    document.body.insertAdjacentHTML('beforeend', `<button type="button" class="pip-fab" aria-label="Трансляция"><i>▶</i><span>Трансляция</span></button>
      <div class="pip" hidden><div class="pip-v"><span class="pip-play">▶</span><span class="pip-cap"></span><span class="pip-mute">звук выкл</span></div><button type="button" class="pip-x" aria-label="Закрыть">×</button></div>`);
    const fab = document.querySelector('.pip-fab'), box = document.querySelector('.pip');
    const toggle = () => { const M = models[0]; if (M) { const lx = M.maps.find(x => x.st === 'live');
        box.querySelector('.pip-cap').textContent = M.state === 'pre' ? `Начнётся в ${clock(M.start - 900)} · Twitch · RU` : lx ? `Карта ${lx.i + 1} · Twitch · RU` : 'Запись · Twitch · RU'; }
      box.hidden = !box.hidden; fab.classList.toggle('is-on', !box.hidden); };
    fab.onclick = toggle; box.querySelector('.pip-x').onclick = toggle;
    document.addEventListener('click', e => { if (e.target.closest('[data-pip]')) { toggle(); document.querySelectorAll('[data-pip]').forEach(b => b.classList.toggle('is-on', !box.hidden)); } }); // w-desk: кнопка в шапке / группе
  }
})();

// Правая колонка (страница матча; дирижёр 03.11: «по этому правилу правая колонка должна везде работать», как на странице турнира):
// влезает в окно — липнет с отступом 20 сверху; не влезает — едет со страницей и встаёт с отступом 20 снизу. Одна колонка (телефон) — не трогаем.
(() => {
  const G = 20
  const fit = () => document.querySelectorAll('.gm-side').forEach((c) => {
    const m = c.parentElement.querySelector(':scope > .gm-main'), two = m && c.getBoundingClientRect().left > m.getBoundingClientRect().left + 10
    if (!two) { c.style.position = c.style.top = c.style.alignSelf = ''; return }
    Object.assign(c.style, { position: 'sticky', alignSelf: 'flex-start', top: Math.min(G, innerHeight - c.offsetHeight - G) + 'px' }) })
  addEventListener('resize', fit); addEventListener('load', fit)
  new ResizeObserver(fit).observe(document.body)
})()
