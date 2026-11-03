// w-preview — вкладка «Превью» серии, нулевой этап (задачи-по-виджетам.md §5, созвон 26.10 [2 · 03:07–05:56]).
// Общая статистика, факты, новости, история противостояния, прошлые карты серии (где команда сильнее); записей карт нет.
// v2–v4 (Claude-B, дирижёр 26.10: «непонятно, как он хотел показать») — превью как вкладка окна графика: «Превью · Карта 1 · 2 · 3»,
// начальник [2 · 14:22] «верхний элемент над графиком… превью матча», [2 · 04:15] «зашёл, читал — о, прикольно». <body data-v="story|duel|cards|hud|table|charts|tiles|stat|v10|v11|v12|v13|v14|v15|v16|v17|v18|v19|v20|v21">.
// v18–v21 (дирижёр 26.10: «ещё варианты, пока ни один не понравился») — досье без очных, новости: v18 лента с тегами · v19 главная + две · v20 полоса сверху · v21 таймлайн по центру.
// v15–v17 (дирижёр 26.10: «без очных, новости другие — покажи несколько вариантов») — досье v14 без очных, новости: v15 карточками с картинкой · v16 у каждой команды свои · v17 колонкой по центру.
// v14 (дирижёр 26.10: «v13, только с переключалкой» → команды Vision / Spirit) — на телефоне одно досье, команды переключаются сверху; на компьютере как v13.
// v11–v13 (дирижёр 26.10: «и всё?») — ещё подачи по исследованию: v11 строка + кнопка «Статистика» → панель с вкладками (Kalshi) · v12 таблица «карты по длине», как винрейт по картам у bo3 · v13 досье команд зеркально, очные по центру.
// v10 (дирижёр 26.10: «отрисовывай новую, старые убери») — по исследованию «статистика к матчу»: инсайты ✓/✗ (bo3.gg), форма — последние 5 списком (bo3, Kalshi),
// сравнение значение · подпись · значение с полоской цветом команды (Kalshi), очные полосой лого (bo3), сводка абзацем (Polymarket «Рыночный контекст»), новости. Блок на странице, без вкладок.
// v9 «Сводная» (дирижёр 26.10: «общее между всеми вариантами… превью и какая карта не нужны — просто статистика; новости куда-то воткнуть») — без вкладок.
// v6–v8 (дирижёр 26.10: «уже лучше, нужны ещё версии») — то же «HUD»-направление, другая подача: таблица · графики · плитки (OKX, Polymarket, Cloudflare Radar).
// v5 «HUD» (дирижёр 26.10: «плохие варианты… компактно и чётко, как аналитика»): начальник [1 · 03:36] «видит HUD одной страницы», [1 · 10:21–10:40] «максимум информации на один пиксель».
// Реальные данные (gs-match/data): очные, форма на турнире (серии до этой), карты серии, стороны. ‼️ Пример (в данных нет): новости и текст истории.
(() => {
  const D = window.GS_DATA, T = window.GS_TOURNAMENT, S = D.series[2];
  const IMG = '../gs-match/';
  const A = S.maps[0].radiant_team_id, B = S.maps[0].dire_team_id; // Vision, Spirit
  const SHORT = { 9572001: 'Vision', 7119388: 'Spirit' };
  const START = S.maps[0].start_time;
  const CFG = { view: 'desk', state: 'live' };
  const lg = id => `<img class="lg" src="${IMG + D.teams[id].logo}" alt="">`;
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const day = s => new Date(s * 1000).toLocaleDateString('ru', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'short' }).replace('.', '');
  const before = T.series.filter(s => s.start < START);
  const has = (s, id) => s.a === id || s.b === id;

  // форма на турнире до этой серии: серии, карты, средняя карта, последние 5
  function form(id) {
    const ss = before.filter(s => has(s, id)).sort((x, y) => x.start - y.start);
    const won = s => s.maps.filter(m => m.win === id).length > s.maps.length / 2;
    const maps = ss.flatMap(s => s.maps), mw = maps.filter(m => m.win === id);
    const fast = mw.reduce((a, m) => (!a || m.dur < a.dur ? m : a), null);
    return { sw: ss.filter(won).length, sl: ss.filter(s => !won(s)).length, mw: mw.length, ml: maps.length - mw.length,
      avg: Math.round(maps.reduce((n, m) => n + m.dur, 0) / maps.length), fast, last: ss.slice(-5).map(s => (won(s) ? 'W' : 'L')),
      pct: Math.round(mw.length / maps.length * 100), avgW: mw.length ? Math.round(mw.reduce((n, m) => n + m.dur, 0) / mw.length) : 0,
      streak: (r => r.length - r.lastIndexOf('L') - 1)(ss.map(s => (won(s) ? 'W' : 'L')).join('')),
      seq: maps.map(m => ({ w: m.win === id, dur: m.dur })) };
  }
  const h2h = before.filter(s => has(s, A) && has(s, B));

  function render() {
    const nPlayed = CFG.state === 'pre' ? 0 : CFG.state === 'live' ? 2 : 3;
    const played = S.maps.slice(0, nPlayed).map((m, i) => ({ i, m, win: m.radiant_win ? m.radiant_team_id : m.dire_team_id }));
    const fA = form(A), fB = form(B);
    const card = (title, sub, body) => `<section class="cd"><div class="cd-hd"><b>${title}</b><small>${sub}</small></div><div class="cd-bd">${body}</div></section>`;

    const formCol = (id, f) => `<div><div class="t">${lg(id)}${SHORT[id]}</div><dl class="num">
      <dt>Серии</dt><dd>${f.sw}–${f.sl}</dd><dt>Карты</dt><dd>${f.mw}–${f.ml}</dd><dt>Средняя карта</dt><dd>${mmss(f.avg)}</dd>
      <dt>Быстрая победа</dt><dd>${f.fast ? mmss(f.fast.dur) : '—'}</dd></dl>
      <div class="chips">${f.last.map(r => `<i class="${r}">${r === 'W' ? 'В' : 'П'}</i>`).join('')}</div></div>`;

    const h2hRows = h2h.map(s => { const wa = s.maps.filter(m => m.win === A).length, wb = s.maps.length - wa;
      return `<div class="row num"><span class="d">${day(s.start)}</span>${lg(A)}<span class="${wa > wb ? 'w' : 'mut'}">${SHORT[A]}</span><span class="sc">${wa}:${wb}</span><span class="${wb > wa ? 'w' : 'mut'}">${SHORT[B]}</span>${lg(B)}<span class="sp"></span><span class="mut">Bo${s.bo}</span></div>`; }).join('');

    // прошлые карты этой серии + стороны: кто за кого играл и выиграл
    const mapRows = played.map(({ i, m, win }) => `<div class="row num"><span class="d">Карта ${i + 1}</span>${lg(win)}<span class="w">${SHORT[win]}</span><span class="sp"></span>
      <span class="mut">${m.radiant_score}:${m.dire_score} · ${mmss(m.duration)}</span></div>`).join('');
    const side = (id, rad) => { const ms = played.filter(p => (p.m.radiant_team_id === id) === rad); return ms.length ? `${ms.filter(p => p.win === id).length}–${ms.filter(p => p.win !== id).length}` : '—'; };
    const sides = played.length ? `<div class="sides num"><span></span><span>Radiant</span><span>Dire</span>
      ${[A, B].map(id => `<b>${SHORT[id]}</b><b>${side(id, true)}</b><b>${side(id, false)}</b>`).join('')}</div>` : '';

    const facts = [
      h2h.length ? [`${h2h.map(s => s.maps.filter(m => m.win === A).length + ':' + s.maps.filter(m => m.win === B).length).join(', ')}`, `${SHORT[A]} уже обыграли ${SHORT[B]} на этом турнире (${day(h2h[0].start)})`] : null,
      [`${fA.mw}–${fA.ml}`, `${SHORT[A]} по картам на турнире`],
      [mmss(fB.avg), `средняя карта ${SHORT[B]} — ${fB.avg < fA.avg ? 'быстрее' : 'дольше'}, чем у ${SHORT[A]} (${mmss(fA.avg)})`],
    ].filter(Boolean).map(([n, t]) => `<div class="fact"><b class="num">${n}</b><span>${t}</span></div>`).join('');

    // ‼️ пример: текст истории и новости — не из данных
    const story = `<p class="story" style="margin:0">Spirit и OG — единственные, кто выигрывал The International дважды. Spirit идут за третьим титулом, Vision весь турнир обыгрывают их: 2:0 в группе.</p>`;
    const news = [['Spirit меняют пятую позицию перед плей-офф', 'Cyberscore · 2 ч назад'], ['Vision: «Мы знаем, как играть против Spirit»', 'Sports.ru · вчера'], ['Расписание плей-офф TI 2026', 'Liquipedia · 3 дня назад']]
      .map(([h, s]) => `<a class="news" href="#"><span class="h">${h}</span><small>${s}</small></a>`).join('');

    const blocks = [
      played.length ? card('Карты серии', `${played.length} из 3`, mapRows + sides) : '',
      card('Очные', h2h.length ? `${h2h.length} на турнире` : 'не встречались', h2h.length ? h2hRows : '<div class="empty">На турнире ещё не встречались</div>'),
      card('Форма на турнире', 'до этой серии', `<div class="form">${formCol(A, fA)}${formCol(B, fB)}</div>`),
      card('Факты', '', facts),
      card('История', '', story),
      card('Новости', '', news),
    ].filter(Boolean).join('');
    const V = document.body.dataset.v, P = { story: vStory, duel: vDuel, cards: vCards, hud: vHud, table: vTable, charts: vCharts, tiles: vTiles, stat: vStat, v10: vTen, v11: vBtn, v12: vLen, v13: vDos, v14: vDos, v15: vDos, v16: vDos, v17: vDos, v18: vDos, v19: vDos, v20: vDos, v21: vDos }[V];
    document.body.innerHTML = `<div class="stage is-${CFG.view}">${P ? `<div class="win ${['hud', 'table', 'charts', 'tiles', 'stat'].includes(V) ? 'win--hud' : ['v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v18', 'v19', 'v20', 'v21'].includes(V) ? 'win--ten' : ''}">${['stat', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v18', 'v19', 'v20', 'v21'].includes(V) ? '' : tabs(played)}<div class="win-bd">${P({ fA, fB, played, h2hRows, facts, news, mapRows, sides })}</div></div>` : `<div class="grid">${blocks}</div>`}</div>`;
    document.querySelectorAll('.news').forEach(a => a.onclick = e => e.preventDefault());
    // v11: кнопка «Статистика» и вкладки панели
    document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { BTN.open = !BTN.open; render(); });
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { BTN.tab = b.dataset.tab; render(); });
    // v14: переключалка команд на телефоне
    document.querySelectorAll('[data-team]').forEach(b => b.onclick = () => { SW.team = +b.dataset.team; render(); });
  }

  // ‼️ пример (в данных нет): заголовок и подводка истории
  const HEAD = 'Spirit идут за третьим The International. Vision весь турнир у них выигрывают';
  const LEDE = 'Третий титул не брал никто. Vision — фаворит года и уже обыграли Spirit 2:0 в группе.';
  const W = d => d.played.length; // сколько карт сыграно

  // вкладки окна: «Превью» + карты серии (прошла — победитель и счёт · live · впереди); активна «Превью»
  function tabs(played) {
    const live = CFG.state === 'live';
    return `<div class="tabs"><span class="tab is-on">Превью</span>${S.maps.slice(0, 3).map((m, i) => { const p = played[i];
      return p ? `<span class="tab">Карта ${i + 1} ${lg(p.win)}<small class="num">${m.radiant_score}:${m.dire_score}</small></span>`
        : live && i === played.length ? `<span class="tab"><i class="dot"></i>Карта ${i + 1}<small>live</small></span>`
        : `<span class="tab is-next">Карта ${i + 1}<small>впереди</small></span>`; }).join('')}</div>`;
  }
  const mapsLine = d => W(d) ? `<div class="pv-maps">${d.played.map(({ i, m, win }) => `<span class="num">Карта ${i + 1} ${lg(win)}<b>${SHORT[win]}</b><small>${mmss(m.duration)}</small></span>`).join('')}</div>` : '';
  const newsLine = (n) => `<div class="pv-news">${n}</div>`;

  // v2 «История»: заголовок-история и подводка, 3 крупных факта, карты серии строкой, новости
  function vStory(d) {
    return `<h2 class="pv-h">${HEAD}</h2><p class="pv-lede">${LEDE}</p>
      <div class="pv-facts">${d.facts}</div>${mapsLine(d)}<div class="pv-lbl">Новости</div>${newsLine(d.news)}`;
  }

  // v3 «Противостояние»: команды друг напротив друга, между ними сравнение полосками; история — подписью сверху
  function vDuel(d) {
    const team = (id, f) => `<div class="du-t">${lg(id).replace('class="lg"', 'class="lg lg--xl"')}<b>${SHORT[id]}</b><div class="chips">${f.last.map(r => `<i class="${r}">${r === 'W' ? 'В' : 'П'}</i>`).join('')}</div></div>`;
    const wa = h2h.reduce((n, x) => n + x.maps.filter(m => m.win === A).length, 0), wb = h2h.reduce((n, x) => n + x.maps.filter(m => m.win === B).length, 0);
    // меньше — лучше у времени: полоска длиннее у того, кто быстрее
    const row = (name, a, b, ta, tb, less) => { const [x, y] = less ? [b, a] : [a, b], k = x + y ? x / (x + y) : .5;
      return `<div class="du-r num"><b class="${(less ? a < b : a > b) ? '' : 'mut'}">${ta}</b><div><span>${name}</span><div class="du-bar"><i style="width:${k * 100}%"></i><i style="width:${(1 - k) * 100}%"></i></div></div><b class="${(less ? b < a : b > a) ? '' : 'mut'}">${tb}</b></div>`; };
    return `<p class="pv-lede pv-lede--top">${HEAD}</p>
      <div class="du">${team(A, d.fA)}<span class="du-vs">vs</span>${team(B, d.fB)}</div>
      <div class="du-rows">${row('Очные на турнире, карты', wa, wb, wa, wb)}${row('Серии на турнире', d.fA.sw, d.fB.sw, `${d.fA.sw}–${d.fA.sl}`, `${d.fB.sw}–${d.fB.sl}`)}
        ${row('Карты на турнире', d.fA.mw, d.fB.mw, `${d.fA.mw}–${d.fA.ml}`, `${d.fB.mw}–${d.fB.ml}`)}${row('Средняя карта', d.fA.avg, d.fB.avg, mmss(d.fA.avg), mmss(d.fB.avg), true)}
        ${d.fA.fast && d.fB.fast ? row('Быстрая победа', d.fA.fast.dur, d.fB.fast.dur, mmss(d.fA.fast.dur), mmss(d.fB.fast.dur), true) : ''}</div>
      ${mapsLine(d)}<div class="pv-lbl">Новости</div>${newsLine(d.news)}`;
  }

  // v4 «Карточки-истории»: по одной мысли на карточку, листаются вбок (свайп / прокрутка), как сторис
  function vCards(d) {
    const fx = [...d.facts.matchAll(/<b class="num">(.*?)<\/b><span>(.*?)<\/span>/g)];
    const sl = [`<div class="cs cs--hero"><small>История</small><b>${HEAD}</b><span>${LEDE}</span></div>`,
      ...fx.map(([, n, t]) => `<div class="cs"><small>Факт</small><b class="num cs-n">${n}</b><span>${t}</span></div>`),
      W(d) ? `<div class="cs"><small>Карты серии</small>${d.mapRows}${d.sides}</div>` : '',
      `<div class="cs"><small>Новости</small>${d.news}</div>`].filter(Boolean);
    return `<div class="cs-row">${sl.join('')}</div><div class="cs-hint">${sl.length} карточек · листай вбок</div>`;
  }

  // v5 «HUD»: сухая аналитика плотно — строка ключевых цифр, под ней 3 колонки (сравнение · очные и карты серии · факты и новости),
  // история — одной строкой внизу. Окно фиксированной высоты (как у графика), лишнее — прокрутка внутри.
  function vHud(d) {
    const { fA, fB, played } = d, wa = h2h.reduce((n, x) => n + x.maps.filter(m => m.win === A).length, 0), wb = h2h.reduce((n, x) => n + x.maps.filter(m => m.win === B).length, 0);
    const kpi = (l, v) => `<div class="k"><small>${l}</small><b class="num">${v}</b></div>`;
    const strip = `<div class="hd-k">${kpi('Очные на TI, карты', h2h.length ? `${wa}:${wb} ${SHORT[wa >= wb ? A : B]}` : '—')}${kpi(`Карты ${SHORT[A]}`, `${fA.mw}–${fA.ml} · ${fA.pct}%`)}${kpi(`Карты ${SHORT[B]}`, `${fB.mw}–${fB.ml} · ${fB.pct}%`)}
      ${kpi('Средняя карта', `${mmss(fA.avg)} / ${mmss(fB.avg)}`)}${kpi('Серия побед', `${fA.streak} / ${fB.streak}`)}${kpi('Формат', `Bo${T.series.find(x => has(x, A) && has(x, B) && x.start >= START)?.bo || 3} · ${played.length ? `${played.filter(p => p.win === A).length}:${played.filter(p => p.win === B).length}` : '0:0'}`)}</div>`;
    // сравнение: значение A · метрика · значение B, лучшее — ярче (less — меньше лучше)
    const cmp = (l, a, b, ta = a, tb = b, less) => { const bA = less ? a < b : a > b, bB = less ? b < a : b > a;
      return `<div class="c-r num"><span class="${bA ? 'hi' : ''}">${ta}</span><small>${l}</small><span class="${bB ? 'hi' : ''}">${tb}</span></div>`; };
    const dots = f => `<span class="hd-dots">${f.last.map(r => `<i class="${r}"></i>`).join('')}</span>`;
    const col1 = `<div class="hd-c"><div class="hd-t"><span>${lg(A)}${SHORT[A]}</span><small>Форма на TI</small><span>${SHORT[B]}${lg(B)}</span></div>
      ${cmp('Серии', fA.sw, fB.sw, `${fA.sw}–${fA.sl}`, `${fB.sw}–${fB.sl}`)}${cmp('Карты', fA.pct, fB.pct, `${fA.mw}–${fA.ml}`, `${fB.mw}–${fB.ml}`)}${cmp('% карт', fA.pct, fB.pct, fA.pct + '%', fB.pct + '%')}
      ${cmp('Средняя карта', fA.avg, fB.avg, mmss(fA.avg), mmss(fB.avg), true)}${cmp('Средняя победа', fA.avgW, fB.avgW, mmss(fA.avgW), mmss(fB.avgW), true)}
      ${fA.fast && fB.fast ? cmp('Быстрая победа', fA.fast.dur, fB.fast.dur, mmss(fA.fast.dur), mmss(fB.fast.dur), true) : ''}${cmp('Серия побед', fA.streak, fB.streak)}
      <div class="c-r"><span>${dots(fA)}</span><small>Последние 5</small><span>${dots(fB)}</span></div></div>`;
    const sideTxt = id => { const r = played.filter(p => p.m.radiant_team_id === id), dd = played.filter(p => p.m.dire_team_id === id), w = xs => xs.filter(p => p.win === id).length;
      return `${SHORT[id]}: Radiant ${r.length ? w(r) + '–' + (r.length - w(r)) : '—'} · Dire ${dd.length ? w(dd) + '–' + (dd.length - w(dd)) : '—'}`; };
    const col2 = `<div class="hd-c"><div class="hd-t"><small>Очные на TI</small><small>${h2h.length}</small></div>
      ${h2h.length ? h2h.map(x => { const a = x.maps.filter(m => m.win === A).length, b = x.maps.length - a;
        return `<div class="l-r num"><small>${day(x.start)}</small><span class="${a > b ? 'hi' : ''}">${SHORT[A]}</span><b>${a}:${b}</b><span class="${b > a ? 'hi' : ''}">${SHORT[B]}</span><small>Bo${x.bo} · ${x.maps.map(m => mmss(m.dur)).join(' ')}</small></div>`; }).join('') : '<div class="l-r"><small>не встречались</small></div>'}
      <div class="hd-t hd-t--2"><small>Эта серия</small><small>${played.length} из 3</small></div>
      ${played.length ? played.map(({ i, m, win }) => `<div class="l-r num"><small>Карта ${i + 1}</small>${lg(win)}<span class="hi">${SHORT[win]}</span><b>${m.radiant_score}:${m.dire_score}</b><small>${mmss(m.duration)} · ${m.radiant_team_id === win ? 'Radiant' : 'Dire'}</small></div>`).join('')
        + `<div class="l-r"><small>${sideTxt(A)}</small></div><div class="l-r"><small>${sideTxt(B)}</small></div>` : '<div class="l-r"><small>карты ещё не сыграны</small></div>'}</div>`;
    const fx = [...d.facts.matchAll(/<b class="num">(.*?)<\/b><span>(.*?)<\/span>/g)];
    const nw = [...d.news.matchAll(/<span class="h">(.*?)<\/span><small>(.*?)<\/small>/g)];
    const col3 = `<div class="hd-c"><div class="hd-t"><small>Факты</small></div>${fx.map(([, n, t]) => `<div class="f-r"><b class="num">${n}</b><span>${t}</span></div>`).join('')}
      <div class="hd-t hd-t--2"><small>Новости</small></div>${nw.map(([, h, src]) => { const [who, when] = src.split(' · ');
        return `<a class="n-r" href="#"><span>${h}</span><small>${who} · ${when.replace(' назад', '')}</small></a>`; }).join('')}</div>`;
    return `${strip}<div class="hd">${col1}${col2}${col3}</div><div class="hd-s"><small>История</small><span>${LEDE}</span></div>`;
  }

  // общее для v6–v8: очные по картам, счёт серии, стороны; цвета команд для сравнения — A голубой, B янтарный
  const base = d => { const wa = h2h.reduce((n, x) => n + x.maps.filter(m => m.win === A).length, 0), wb = h2h.reduce((n, x) => n + x.maps.filter(m => m.win === B).length, 0);
    const sc = id => d.played.filter(p => p.win === id).length;
    const sd = (id, rad) => { const xs = d.played.filter(p => (p.m.radiant_team_id === id) === rad); return xs.length ? `${xs.filter(p => p.win === id).length}–${xs.filter(p => p.win !== id).length}` : '—'; };
    return { wa, wb, sc, sd }; };
  const bar = (a, b, less) => { const [x, y] = less ? [b, a] : [a, b], k = x + y ? x / (x + y) : .5; return `<span class="bb"><i class="ba" style="width:${k * 100}%"></i><i class="bB" style="width:${(1 - k) * 100}%"></i></span>`; };
  const hi = (a, b, less) => [less ? a < b : a > b, less ? b < a : b > a].map(x => (x ? 'hi' : ''));
  const factsNews = d => ({ fx: [...d.facts.matchAll(/<b class="num">(.*?)<\/b><span>(.*?)<\/span>/g)], nw: [...d.news.matchAll(/<span class="h">(.*?)<\/span><small>(.*?)<\/small>/g)] });
  const legend = `<span class="lgd"><i class="ba"></i>${SHORT[A]}<i class="bB"></i>${SHORT[B]}</span>`;

  // v6 «Таблица»: одна плотная таблица на всю ширину — метрика · A · полоска · B, группы «На TI · Очные · Эта серия»; справа узко — факты и новости
  function vTable(d) {
    const { fA, fB } = d, { wa, wb, sc, sd } = base(d);
    const r = (l, a, b, ta = a, tb = b, less) => { const [h1, h2] = hi(a, b, less); return `<div class="t-r num"><small>${l}</small><span class="${h1}">${ta}</span>${bar(a, b, less)}<span class="${h2}">${tb}</span></div>`; };
    const g = t => `<div class="t-g"><small>${t}</small><span>${lg(A)}${SHORT[A]}</span><span></span><span>${SHORT[B]}${lg(B)}</span></div>`;
    const { fx, nw } = factsNews(d);
    return `<div class="tb"><div class="tb-m">${g('На TI, до серии')}${r('Серии', fA.sw, fB.sw, `${fA.sw}–${fA.sl}`, `${fB.sw}–${fB.sl}`)}${r('Карты', fA.pct, fB.pct, `${fA.mw}–${fA.ml} · ${fA.pct}%`, `${fB.mw}–${fB.ml} · ${fB.pct}%`)}
        ${r('Средняя карта', fA.avg, fB.avg, mmss(fA.avg), mmss(fB.avg), true)}${r('Средняя победа', fA.avgW, fB.avgW, mmss(fA.avgW), mmss(fB.avgW), true)}${r('Серия побед', fA.streak, fB.streak)}
        ${g('Очные на TI')}${r('Карты', wa, wb)}
        ${g('Эта серия')}${r('Счёт', sc(A), sc(B))}${r('За Radiant', 0, 0, sd(A, true), sd(B, true))}${r('За Dire', 0, 0, sd(A, false), sd(B, false))}</div>
      <div class="tb-s"><div class="hd-t"><small>Факты</small></div>${fx.map(([, n, t]) => `<div class="f-r"><b class="num">${n}</b><span>${t}</span></div>`).join('')}
        <div class="hd-t hd-t--2"><small>Новости</small></div>${nw.map(([, h, src]) => `<a class="n-r" href="#"><span>${h}</span><small>${src.split(' · ')[1].replace(' назад', '')}</small></a>`).join('')}</div></div>
      <div class="hd-s"><small>История</small><span>${LEDE}</span></div>`;
  }

  // v7 «Графики»: строка цифр, под ней у каждой команды все карты на TI столбиками (высота — длина карты, цвет — победа / поражение), справа — очные и эта серия
  function vCharts(d) {
    const { fA, fB } = d, { wa, wb, sc } = base(d), mx = Math.max(...[...fA.seq, ...fB.seq].map(x => x.dur));
    const kpi = (l, v) => `<div class="k"><small>${l}</small><b class="num">${v}</b></div>`;
    const strip = `<div class="hd-k">${kpi('Очные, карты', `${wa}:${wb}`)}${kpi('% карт на TI', `${fA.pct}% / ${fB.pct}%`)}${kpi('Средняя карта', `${mmss(fA.avg)} / ${mmss(fB.avg)}`)}${kpi('Серия побед', `${fA.streak} / ${fB.streak}`)}${kpi('Счёт серии', `${sc(A)}:${sc(B)}`)}</div>`;
    const ch = (id, f) => `<div class="ch"><div class="hd-t"><span>${lg(id)}${SHORT[id]}</span><small class="num">${f.mw}–${f.ml} · ср. ${mmss(f.avg)}</small></div>
      <div class="ch-b">${f.seq.map(x => `<i class="${x.w ? 'W' : 'L'}" style="height:${Math.round(x.dur / mx * 100)}%" title="${x.w ? 'победа' : 'поражение'} · ${mmss(x.dur)}"></i>`).join('')}</div></div>`;
    const { fx } = factsNews(d);
    return `${strip}<div class="cr"><div class="cr-l">${ch(A, fA)}${ch(B, fB)}<div class="ch-lg"><small><i class="W"></i>победа <i class="L"></i>поражение · высота — длина карты · карты на TI по порядку</small></div></div>
      <div class="cr-r"><div class="hd-t"><small>Очные на TI</small></div>${h2h.map(x => { const a = x.maps.filter(m => m.win === A).length; return `<div class="l-r num"><small>${day(x.start)}</small><span class="hi">${SHORT[a > x.maps.length - a ? A : B]}</span><b>${a}:${x.maps.length - a}</b><small>${x.maps.map(m => mmss(m.dur)).join(' ')}</small></div>`; }).join('') || '<div class="l-r"><small>не встречались</small></div>'}
        <div class="hd-t hd-t--2"><small>Факты</small></div>${fx.map(([, n, t]) => `<div class="f-r"><b class="num">${n}</b><span>${t}</span></div>`).join('')}</div></div>`;
  }

  // v8 «Плитки»: 8 плиток-метрик 4×2 (подпись · A и B · полоска), под ними — факты и новости по строке
  function vTiles(d) {
    const { fA, fB } = d, { wa, wb, sc, sd } = base(d);
    const t = (l, a, b, ta = a, tb = b, less) => { const [h1, h2] = hi(a, b, less); return `<div class="ti"><small>${l}</small><div class="ti-v num"><b class="${h1}">${ta}</b><b class="${h2}">${tb}</b></div>${bar(a, b, less)}</div>`; };
    const { fx, nw } = factsNews(d);
    return `<div class="ti-h"><span>${lg(A)}${SHORT[A]}</span>${legend}<span>${SHORT[B]}${lg(B)}</span></div>
      <div class="tis">${t('Очные на TI, карты', wa, wb)}${t('Серии на TI', fA.sw, fB.sw, `${fA.sw}–${fA.sl}`, `${fB.sw}–${fB.sl}`)}${t('Карты на TI', fA.pct, fB.pct, `${fA.mw}–${fA.ml}`, `${fB.mw}–${fB.ml}`)}${t('% карт', fA.pct, fB.pct, fA.pct + '%', fB.pct + '%')}
        ${t('Средняя карта', fA.avg, fB.avg, mmss(fA.avg), mmss(fB.avg), true)}${t('Средняя победа', fA.avgW, fB.avgW, mmss(fA.avgW), mmss(fB.avgW), true)}${t('Серия побед', fA.streak, fB.streak)}${t('Эта серия', sc(A), sc(B), `${sc(A)} · R ${sd(A, true)}`, `${sc(B)} · R ${sd(B, true)}`)}</div>
      <div class="ti-l"><small>Факт</small>${fx.map(([, n, t]) => `<span><b class="num">${n}</b> ${t}</span>`).join('<i>·</i>')}</div>
      <div class="ti-l"><small>Новости</small>${nw.map(([, h]) => `<a href="#">${h}</a>`).join('<i>·</i>')}</div>
      <div class="hd-s"><small>История</small><span>${LEDE}</span></div>`;
  }

  // v9 «Сводная»: общее из v5–v8 без вкладок и карт серии — заголовок с легендой, строка цифр (v5), сравнение с полосками (v6)
  // и карты на TI столбиками (v7) слева; справа — очные и факты; новости — строкой внизу вместо истории
  function vStat(d) {
    const { fA, fB } = d, { wa, wb } = base(d), mx = Math.max(...[...fA.seq, ...fB.seq].map(x => x.dur));
    const kpi = (l, v) => `<div class="k"><small>${l}</small><b class="num">${v}</b></div>`;
    const r = (l, a, b, ta = a, tb = b, less) => { const [h1, h2] = hi(a, b, less); return `<div class="s-r num"><span class="${h1}">${ta}</span><div><small>${l}</small>${bar(a, b, less)}</div><span class="${h2}">${tb}</span></div>`; };
    const seq = f => `<div class="ch-b ch-b--s">${f.seq.map(x => `<i class="${x.w ? 'W' : 'L'}" style="height:${Math.round(x.dur / mx * 100)}%" title="${x.w ? 'победа' : 'поражение'} · ${mmss(x.dur)}"></i>`).join('')}</div>`;
    const { fx, nw } = factsNews(d);
    return `<div class="st-h"><span>${lg(A)}<b>${SHORT[A]}</b></span><small>статистика на ${T.league.replace('The International', 'TI')} · до серии</small><span><b>${SHORT[B]}</b>${lg(B)}</span></div>
      <div class="hd-k">${kpi('Очные, карты', `${wa}:${wb}`)}${kpi('Серии', `${fA.sw}–${fA.sl} / ${fB.sw}–${fB.sl}`)}${kpi('% карт', `${fA.pct}% / ${fB.pct}%`)}${kpi('Средняя карта', `${mmss(fA.avg)} / ${mmss(fB.avg)}`)}${kpi('Серия побед', `${fA.streak} / ${fB.streak}`)}</div>
      <div class="st"><div class="st-l">${r('Карты', fA.pct, fB.pct, `${fA.mw}–${fA.ml}`, `${fB.mw}–${fB.ml}`)}${r('Средняя победа', fA.avgW, fB.avgW, mmss(fA.avgW), mmss(fB.avgW), true)}
          ${fA.fast && fB.fast ? r('Быстрая победа', fA.fast.dur, fB.fast.dur, mmss(fA.fast.dur), mmss(fB.fast.dur), true) : ''}
          <div class="st-seq"><small>Карты на TI по порядку · высота — длина · <i class="W"></i>победа <i class="L"></i>поражение</small><div class="st-seq-r"><span>${SHORT[A]}</span>${seq(fA)}</div><div class="st-seq-r"><span>${SHORT[B]}</span>${seq(fB)}</div></div></div>
        <div class="st-r"><div class="hd-t"><small>Очные на TI</small></div>${h2h.map(x => { const a = x.maps.filter(m => m.win === A).length; return `<div class="l-r num"><small>${day(x.start)}</small><span class="hi">${SHORT[a > x.maps.length - a ? A : B]}</span><b>${a}:${x.maps.length - a}</b><small>Bo${x.bo}</small></div>`; }).join('') || '<div class="l-r"><small>не встречались</small></div>'}
          <div class="hd-t hd-t--2"><small>Факты</small></div>${fx.map(([, n, t]) => `<div class="f-r"><b class="num">${n}</b><span>${t}</span></div>`).join('')}</div></div>
      <div class="ti-l st-n"><small>Новости</small>${nw.map(([, h, src]) => `<a href="#">${h}</a><small class="st-t">${src.split(' · ')[1].replace(' назад', '')}</small>`).join('<i>·</i>')}</div>`;
  }

  // v10: инсайты считаются из реальных цифр турнира (✓ — сильная сторона, ✗ — слабая); последние 5 серий с соперником и счётом
  // имена из турнира бывают капсом («BETBOOM TEAM») — без капса: каждое слово с заглавной
  const NAME = id => SHORT[id] || (n => (n === n.toUpperCase() ? n.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()) : n))((T.names[id] || '—').trim().replace(/^Team /i, '').replace(/ Team$/i, ''));
  const last5 = id => before.filter(x => has(x, id)).sort((x, y) => y.start - x.start).slice(0, 5).map(x => {
    const opp = x.a === id ? x.b : x.a, w = x.maps.filter(m => m.win === id).length, l = x.maps.length - w;
    return { opp, w, l, win: w > l, start: x.start }; });
  function insights(id, f, o, wa, wb) {
    const me = id === A ? wa : wb, they = id === A ? wb : wa, l5 = last5(id), lw = l5.filter(x => x.win).length, out = [];
    out.push([f.pct >= 60, `${f.pct}% карт выиграно на TI (${f.mw}–${f.ml})`]);
    if (me + they) out.push([me > they, `${me}:${they} по картам в очных на этом TI`]);
    out.push([f.avgW <= o.avgW, `средняя победа ${mmss(f.avgW)} — ${f.avgW <= o.avgW ? 'быстрее' : 'дольше'}, чем у соперника`]);
    out.push([lw >= 3, `${lw} из 5 последних серий выиграно${f.streak > 1 ? `, сейчас ${f.streak} подряд` : ''}`]);
    return out.sort((x, y) => y[0] - x[0]);
  }
  function vTen(d) {
    const { fA, fB } = d, { wa, wb } = base(d);
    const ins = (id, f, o) => `<div class="tn-i"><div class="tn-t">${lg(id)}<b>${SHORT[id]}</b></div>${insights(id, f, o, wa, wb).map(([ok, t]) => `<div class="tn-ir ${ok ? 'ok' : 'no'}"><i>${ok ? '✓' : '✕'}</i><span>${t}</span></div>`).join('')}</div>`;
    const form = id => `<div class="tn-f"><div class="tn-h">Форма · ${SHORT[id]}</div>${last5(id).map(x => `<div class="tn-fr num"><i class="${x.win ? 'W' : 'L'}">${x.win ? 'В' : 'П'}</i><span>${NAME(x.opp)}</span><b>${x.w}:${x.l}</b><small>${day(x.start)}</small></div>`).join('')}</div>`;
    const row = (l, a, b, ta = a, tb = b, less) => { const [h1, h2] = hi(a, b, less); return `<div class="tn-c num"><div class="tn-cv"><b class="${h1}">${ta}</b><small>${l}</small><b class="${h2}">${tb}</b></div>${bar(a, b, less)}</div>`; };
    const cmp = `<div class="tn-m"><div class="tn-h tn-h--c">Сравнение на TI ${legend}</div>${row('Серии', fA.sw, fB.sw, `${fA.sw}–${fA.sl}`, `${fB.sw}–${fB.sl}`)}${row('Карты', fA.pct, fB.pct, `${fA.pct}%`, `${fB.pct}%`)}
      ${row('Средняя карта', fA.avg, fB.avg, mmss(fA.avg), mmss(fB.avg), true)}${row('Средняя победа', fA.avgW, fB.avgW, mmss(fA.avgW), mmss(fB.avgW), true)}${row('Серия побед', fA.streak, fB.streak)}</div>`;
    const h = h2h.map(x => { const a = x.maps.filter(m => m.win === A).length, b = x.maps.length - a; return { x, a, b, win: a > b ? A : B }; });
    const meet = `<div class="tn-b"><div class="tn-h">Очные на TI</div>${h.length ? `<div class="tn-strip">${h.map(m => `<span>${lg(m.win)}</span>`).join('')}</div>${h.map(m => `<div class="tn-fr num"><small>${day(m.x.start)}</small><span class="hi">${SHORT[m.win]}</span><b>${m.a}:${m.b}</b><small>Bo${m.x.bo} · ${m.x.maps.map(mm => mmss(mm.dur)).join(' · ')}</small></div>`).join('')}` : '<div class="tn-fr"><small>не встречались</small></div>'}</div>`;
    const { nw } = factsNews(d);
    const news = `<div class="tn-b"><div class="tn-h">Новости</div>${nw.map(([, t, src]) => `<a class="n-r" href="#"><span>${t}</span><small>${src}</small></a>`).join('')}</div>`;
    return `<div class="tn-hd"><span>${lg(A)}<b>${SHORT[A]}</b></span><small>Статистика к матчу · ${T.league} · до серии</small><span><b>${SHORT[B]}</b>${lg(B)}</span></div>
      <div class="tn-ctx"><small>Контекст</small><span>${LEDE}</span></div>
      <div class="tn-row">${ins(A, fA, fB)}${ins(B, fB, fA)}</div>
      <div class="tn-row tn-row--3">${form(A)}${cmp}${form(B)}</div>
      <div class="tn-row">${meet}${news}</div>`;
  }

  // v11: строка-сводка у графика + кнопка «Статистика» → панель с вкладками (Kalshi: Stats над графиком → окно с вкладками)
  const BTN = { open: true, tab: 'cmp' };
  function vBtn(d) {
    const { fA, fB } = d, { wa, wb } = base(d);
    const row = (l, a, b, ta = a, tb = b, less) => { const [h1, h2] = hi(a, b, less); return `<div class="tn-c num"><div class="tn-cv"><b class="${h1}">${ta}</b><small>${l}</small><b class="${h2}">${tb}</b></div>${bar(a, b, less)}</div>`; };
    const form = id => `<div>${last5(id).map(x => `<div class="tn-fr num"><i class="${x.win ? 'W' : 'L'}">${x.win ? 'В' : 'П'}</i><span>${NAME(x.opp)}</span><b>${x.w}:${x.l}</b><small>${day(x.start)}</small></div>`).join('')}</div>`;
    const { nw } = factsNews(d);
    const T4 = [['cmp', 'Сравнение'], ['form', 'Форма'], ['h2h', 'Очные'], ['news', 'Новости']];
    const body = { cmp: `<div class="bt-2">${row('Серии', fA.sw, fB.sw, `${fA.sw}–${fA.sl}`, `${fB.sw}–${fB.sl}`)}${row('Карты', fA.pct, fB.pct, `${fA.pct}%`, `${fB.pct}%`)}${row('Средняя карта', fA.avg, fB.avg, mmss(fA.avg), mmss(fB.avg), true)}${row('Средняя победа', fA.avgW, fB.avgW, mmss(fA.avgW), mmss(fB.avgW), true)}${row('Серия побед', fA.streak, fB.streak)}${row('Очные, карты', wa, wb)}</div>`,
      form: `<div class="bt-f"><div><div class="tn-t">${lg(A)}<b>${SHORT[A]}</b></div>${form(A)}</div><div><div class="tn-t">${lg(B)}<b>${SHORT[B]}</b></div>${form(B)}</div></div>`,
      h2h: h2h.map(x => { const a = x.maps.filter(m => m.win === A).length; return `<div class="tn-fr num"><small>${day(x.start)}</small><span class="hi">${SHORT[a > x.maps.length - a ? A : B]}</span><b>${a}:${x.maps.length - a}</b><small>Bo${x.bo} · ${x.maps.map(m => mmss(m.dur)).join(' · ')}</small></div>`; }).join('') || '<div class="tn-fr"><small>не встречались</small></div>',
      news: nw.map(([, t, src]) => `<a class="n-r" href="#"><span>${t}</span><small>${src}</small></a>`).join('') };
    return `<div class="bt"><span>${lg(A)}<b>${SHORT[A]}</b></span><span class="bt-k num"><small>очные</small>${wa}:${wb}</span><span class="bt-k num"><small>карты</small>${fA.pct}% · ${fB.pct}%</span><span class="bt-k num"><small>серия побед</small>${fA.streak} · ${fB.streak}</span><span><b>${SHORT[B]}</b>${lg(B)}</span>
        <button type="button" data-open class="bt-b ${BTN.open ? 'is-on' : ''}">Статистика ${BTN.open ? '▴' : '▾'}</button></div>
      ${BTN.open ? `<div class="bt-p"><div class="bt-tabs">${T4.map(([k, l]) => `<button type="button" data-tab="${k}" class="${BTN.tab === k ? 'is-on' : ''}">${l}</button>`).join('')}${legend}</div><div class="bt-bd">${body[BTN.tab]}</div></div>` : ''}`;
  }

  // v12: таблица «карты по длине» — аналог винрейта по картам у bo3 (в Dota карт нет, есть длина игры): % побед, сыграно, последние 5 по каждой длине
  function vLen(d) {
    const { fA, fB } = d, BK = [['до 35 мин', 0, 2100], ['35–45 мин', 2100, 2700], ['45–55 мин', 2700, 3300], ['55+ мин', 3300, 1e9]];
    const st = (f, lo, hi2) => { const xs = f.seq.filter(x => x.dur >= lo && x.dur < hi2), w = xs.filter(x => x.w).length; return { n: xs.length, w, pct: xs.length ? Math.round(w / xs.length * 100) : null, l5: xs.slice(-5) }; };
    const dots = l5 => `<span class="ln-d">${l5.map(x => `<i class="${x.w ? 'W' : 'L'}">${x.w ? 'В' : 'П'}</i>`).join('')}</span>`;
    const cell = x => `<span class="num">${x.pct == null ? '—' : x.pct + '%'}</span><span class="num mut">${x.n}</span>${dots(x.l5)}`;
    const rows = BK.map(([l, lo, h]) => { const a = st(fA, lo, h), b = st(fB, lo, h), fav = a.pct == null && b.pct == null ? null : (a.pct ?? -1) >= (b.pct ?? -1) ? A : B;
      return `<div class="ln-r"><span>${l}</span><span class="ln-cmp">${fav ? lg(fav) : ''}${bar(a.pct ?? 0, b.pct ?? 0)}</span><div class="ln-t" data-t="${SHORT[A]}">${cell(a)}</div><div class="ln-t" data-t="${SHORT[B]}">${cell(b)}</div></div>`; }).join('');
    const ins = (id, f, o) => insights(id, f, o, base(d).wa, base(d).wb).slice(0, 2).map(([ok, t]) => `<div class="tn-ir ${ok ? 'ok' : 'no'}"><i>${ok ? '✓' : '✕'}</i><span>${t}</span></div>`).join('');
    return `<div class="tn-hd"><span>${lg(A)}<b>${SHORT[A]}</b></span><small>Карты по длине · ${T.league} · до серии</small><span><b>${SHORT[B]}</b>${lg(B)}</span></div>
      <div class="ln"><div class="ln-r ln-r--h"><span>Длина карты</span><span>Сравнение ${legend}</span><div class="ln-t"><small>% побед</small><small>карт</small><small>последние</small></div><div class="ln-t"><small>% побед</small><small>карт</small><small>последние</small></div></div>${rows}</div>
      <div class="tn-row"><div class="tn-i">${ins(A, fA, fB)}</div><div class="tn-i">${ins(B, fB, fA)}</div></div>`;
  }

  const SW = { team: A };
  // v13: досье команд зеркально — у каждой: ключевые цифры, инсайты, форма; по центру узко — очные полосой и счёт
  function vDos(d) {
    // v15–v17 без очных — и инсайт про очные не показываем (0:0 → строка не попадает)
    const { fA, fB } = d, { wa, wb } = ['v15', 'v16', 'v17', 'v18', 'v19', 'v20', 'v21'].includes(document.body.dataset.v) ? { wa: 0, wb: 0 } : base(d);
    const dos = (id, f, o, r) => `<div class="ds ${r ? 'ds--r' : ''}"><div class="tn-t">${lg(id)}<b>${SHORT[id]}</b></div>
      <div class="ds-k num"><span><small>серии</small>${f.sw}–${f.sl}</span><span><small>карты</small>${f.pct}%</span><span><small>ср. победа</small>${mmss(f.avgW)}</span><span><small>подряд</small>${f.streak}</span></div>
      ${insights(id, f, o, wa, wb).map(([ok, t]) => `<div class="tn-ir ${ok ? 'ok' : 'no'}"><i>${ok ? '✓' : '✕'}</i><span>${t}</span></div>`).join('')}
      <div class="tn-h" style="margin-top:8px">Последние 5</div>${last5(id).map(x => `<div class="tn-fr num"><i class="${x.win ? 'W' : 'L'}">${x.win ? 'В' : 'П'}</i><span>${NAME(x.opp)}</span><b>${x.w}:${x.l}</b><small>${day(x.start)}</small></div>`).join('')}</div>`;
    const mid = `<div class="ds-m"><small>очные на TI</small><b class="num">${wa}:${wb}</b><div class="ds-s">${h2h.map(x => { const a = x.maps.filter(m => m.win === A).length; return `<span>${lg(a > x.maps.length - a ? A : B)}<small>${day(x.start)}</small></span>`; }).join('') || '<small>не встречались</small>'}</div></div>`;
    const { nw } = factsNews(d);
    const V = document.body.dataset.v, noH2h = ['v15', 'v16', 'v17', 'v18', 'v19', 'v20', 'v21'].includes(V);
    // ‼️ пример: новости — картинка (лого команды на подложке), заголовок, источник, время; у v16 — свои у каждой команды
    const NEWS = [[B, 'Spirit меняют пятую позицию перед плей-офф', 'Cyberscore', '2 ч'], [A, 'Vision: «Мы знаем, как играть против Spirit»', 'Sports.ru', 'вчера'],
      [B, 'Yatoro: «Третий TI — главная цель сезона»', 'Cybersport.ru', 'вчера'], [A, 'Vision без замен: тот же состав, что выиграл группу', 'Liquipedia', '2 дня']];
    const TAG = ['Состав', 'Интервью', 'Интервью', 'Состав'], LEAD = 'Коллапс уходит на скамейку: на пятую позицию выходит игрок из академии. Первая игра нового состава — прямо в плей-офф против Vision.';
    const tagged = (n, i) => `<a class="nt" href="#"><small class="nt-t">${n[3]}</small><span class="nt-g">${TAG[i]}</span>${lg(n[0])}<span class="nt-h">${n[1]}</span><small>${n[2]}</small></a>`;
    const card = ([id, h, src, t]) => `<a class="nc" href="#"><span class="nc-i">${lg(id)}</span><span class="nc-b"><b>${h}</b><small>${src} · ${t}</small></span></a>`;
    const line = ([, h, src, t]) => `<a class="n-r n-r--2" href="#"><span>${h}</span><small>${src} · ${t}</small></a>`;
    const teamNews = id => V === 'v16' ? `<div class="tn-h" style="margin-top:8px">Новости ${SHORT[id]}</div>${NEWS.filter(n => n[0] === id).map(line).join('')}` : '';
    const dosN = (id, f, o, r) => dos(id, f, o, r).replace(/<\/div>$/, teamNews(id) + '</div>');
    const tl = `<div class="ds-n"><div class="tn-h">Новости</div><div class="tl2">${NEWS.map(n => `<a class="tl2-r" href="#"><i></i><small>${n[3]}</small><span>${n[1]}</span><small>${n[2]}</small></a>`).join('')}</div></div>`;
    const midN = V === 'v21' ? tl : V === 'v17' ? `<div class="ds-n"><div class="tn-h">Новости</div>${NEWS.slice(0, 3).map(line).join('')}</div>` : noH2h ? '' : mid;
    // v14+ на телефоне: одно досье, сверху переключалка команд
    const sw = ['v14', 'v15', 'v16', 'v17', 'v18', 'v19', 'v20', 'v21'].includes(V) && CFG.view === 'phone';
    const body = sw ? `<div class="ds-sw">${[A, B].map(id => `<button type="button" data-team="${id}" class="${SW.team === id ? 'is-on' : ''}">${lg(id)}${SHORT[id]}</button>`).join('')}</div>${noH2h ? '' : midN}${SW.team === A ? dosN(A, fA, fB) : dosN(B, fB, fA, true)}${['v17', 'v21'].includes(V) ? midN : ''}`
      : `${dosN(A, fA, fB)}${midN}${dosN(B, fB, fA, true)}`;
    const bottom = V === 'v18' ? `<div class="nc-w"><div class="tn-h">Новости</div><div class="nt-w">${NEWS.map(tagged).join('')}</div></div>`
      : V === 'v19' ? `<div class="nc-w"><div class="tn-h">Новости</div><div class="nl"><a class="nl-m" href="#"><span class="nl-i">${lg(NEWS[0][0])}</span><b>${NEWS[0][1]}</b><span>${LEAD}</span><small>${NEWS[0][2]} · ${NEWS[0][3]}</small></a><div>${NEWS.slice(1, 4).map(line).join('')}</div></div></div>`
      : V === 'v15' ? `<div class="nc-w"><div class="tn-h">Новости</div><div class="nc-r">${NEWS.slice(0, 3).map(card).join('')}</div></div>`
      : noH2h ? '' : `<div class="ti-l st-n"><small>Новости</small>${nw.map(([, h, src]) => `<a href="#">${h}</a><small class="st-t">${src.split(' · ')[1].replace(' назад', '')}</small>`).join('<i>·</i>')}</div>`;
    // v20: новости полосой сразу под контекстом, листаются вбок
    const strip = V === 'v20' ? `<div class="ns">${NEWS.map(n => `<a class="ns-c" href="#">${lg(n[0])}<span>${n[1]}</span><small>${n[3]}</small></a>`).join('')}</div>` : '';
    return `<div class="tn-ctx"><small>Контекст</small><span>${LEDE}</span></div>${strip}<div class="ds-w ${noH2h && !['v17', 'v21'].includes(V) ? 'ds-w--2' : ''}">${body}</div>${bottom}`;
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      // дирижёр 26.10: сначала «только десктоп», потом «нужна ещё версия на мобилке» — вид вернули
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер · главная колонка 1040' }, { v: 'phone', label: 'Телефон 390' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'pre', label: 'До матча' }, { v: 'live', label: 'Идёт' }, { v: 'post', label: 'После' }] },
    ],
    set(key, v) { CFG[key] = v; render(); },
    caption: () => 'Vision — Spirit, TI 2026: очные, форма, карты — реальные; история и новости — пример',
  };
  render();
})();
