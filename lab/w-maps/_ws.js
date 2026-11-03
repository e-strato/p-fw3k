// w-maps v7–v9 — сегменты матча (дирижёр 26.10: «ближе к сегментам, покрасивее, переход плавный, мини-инфа в сегменте — время или что-то такое;
// обязательные — Bo3 идёт, значит всё равно 4 штуки»). «Превью» + все карты серии: не начатые — бледные, нажать нельзя.
// Сегменты рисует виджет _wmseg.js (WMSEG) — тот же, что на странице матча; здесь — данные и смена содержимого ниже. Вариант — window.WM_V. Данные — серия Vision — Spirit (TI 2026, OpenDota), карты 4–5 у Bo5 — пример.
(() => {
  const D = window.GS_DATA, V = window.WM_V, B = '../gs-match/';
  const S = D.series[2], A = S.maps[0].radiant_team_id, Bt = S.maps[0].dire_team_id;
  const EXTRA = [D.series[0].maps[0], D.series[1].maps[1]]; // ‼️ пример для Bo5
  const CFG = { view: 'desk', bo: 'bo3', state: 'live3' };
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const SH = id => D.teams[id].tag || D.teams[id].name;
  const START = '16:00'; // начало серии (пример)

  function segs() {
    const all = [...S.maps, ...(CFG.bo === 'bo5' ? EXTRA : [])], live = CFG.state.startsWith('live') ? +CFG.state.slice(4) : 0;
    const maps = all.map((m, j) => {
      const n = j + 1, st = CFG.state === 'post' || n < live ? 'done' : n === live ? 'live' : 'future';
      const aRad = j < 3 ? m.radiant_team_id === A : j % 2 === 0, t = st === 'live' ? Math.min(2010, Math.round(m.duration * 0.7)) : m.duration;
      const ka = aRad ? m.radiant_score : m.dire_score, kb = aRad ? m.dire_score : m.radiant_score;
      return { i: n, t: `Карта ${n}`, st, time: t, win: st === 'done' ? (m.radiant_win === aRad ? A : Bt) : null, ka, kb };
    });
    // серия закончилась раньше (2:0 в Bo3) — оставшиеся карты «не играли»
    if (CFG.state === 'post') { let a = 0, b = 0;
      maps.forEach(x => { if (a >= Math.ceil(all.length / 2) || b >= Math.ceil(all.length / 2)) { x.st = 'skip'; x.win = null; } else if (x.win === A) a++; else b++; }); }
    return [{ i: 0, t: 'Превью', st: 'pre' }, ...maps];
  }
  // мини-инфа — у виджета; здесь только данные: v8 — победитель и килы, v7 — победитель и время, v9 — победитель названием
  const seg = x => ({ ...x, note: x.st === 'pre' ? (CFG.state === 'pre' ? `Сегодня, ${START}` : 'до матча') : x.st === 'done' && V !== 'v9' ? (V === 'v8' ? `${x.ka}:${x.kb}` : mmss(x.time)) : '',
    time: x.st === 'live' ? mmss(x.time) : '', win: x.win ? { name: V === 'v9' ? SH(x.win) : V === 'v8' ? `${x.ka}:${x.kb}` : mmss(x.time), logo: D.teams[x.win].logo } : null });

  let cur = null, xs = [];
  function body(x) {
    return x.i ? `${x.t}${x.st === 'live' ? ' — идёт' : ''}: график, драфт, игроки этой карты` : 'Превью: факты, очные, составы';
  }
  function run() {
    xs = segs(); const live = xs.find(x => x.st === 'live'), done = xs.filter(x => x.st === 'done');
    cur = live ? live.i : CFG.state === 'post' ? done[done.length - 1].i : 0;
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><div class="hdph">Шапка матча</div><div class="ws" id="ms"></div>
      <div class="below"><span class="ws-body">${body(xs[cur])}</span></div></div>`;
    draw();
  }
  const draw = () => WMSEG.render(document.querySelector('#ms'), { key: 'lab', look: V, cur, segs: xs.map(seg), base: B });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-a="mseg"]'); if (!b || b.disabled || +b.dataset.v === cur) return;
    cur = +b.dataset.v; draw();
    const bd = document.querySelector('.ws-body'); bd.classList.add('out');
    setTimeout(() => { bd.textContent = body(xs[cur]); bd.classList.remove('out'); }, 160);
  });

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'bo', name: 'Серия', value: CFG.bo, options: [{ v: 'bo3', label: 'Bo3' }, { v: 'bo5', label: 'Bo5 (пример)' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [['pre', 'До матча'], ['live1', 'Идёт карта 1'], ['live2', 'Идёт карта 2'], ['live3', 'Идёт карта 3'],
        ...(CFG.bo === 'bo5' ? [['live4', 'Идёт карта 4'], ['live5', 'Идёт карта 5']] : []), ['post', 'После']].map(([v, label]) => ({ v, label })) },
    ],
    set(key, v) { CFG[key] = v; if (key === 'bo' && v === 'bo3' && /live[45]/.test(CFG.state)) CFG.state = 'live3'; run(); },
    caption: () => 'Все карты серии видны всегда: не начатые — бледные. Нажми на сегмент — плашка переезжает. Карты 1–3 — реальные',
  };
  run();
})();
