// w-maps v4–v6 — табы матча (дирижёр 26.10: «по сути табы, только всё на одной странице; привязаны к карте или превью — смотреть как историю»).
// «Превью · Карта 1 · Карта 2 …» — до 5, только начатые и сыгранные; во всю ширину. Таб выбирает, что показывает страница ниже. Вариант — window.WM_V.
(() => {
  const V = window.WM_V, CFG = { view: 'desk', bo: 'bo3', state: 'live3', sel: null };
  const ST = { pre: 0, live1: 1, live2: 2, live3: 3, live4: 4, live5: 5, post: 0 }, LIVE = s => (s.startsWith('live') ? ST[s] : 0);
  function tabs() {
    const n = CFG.state === 'pre' ? 0 : CFG.state === 'post' ? (CFG.bo === 'bo5' ? 5 : 3) : ST[CFG.state];
    return [{ i: 0, t: 'Превью' }, ...Array.from({ length: n }, (_, j) => ({ i: j + 1, t: `Карта ${j + 1}`, live: LIVE(CFG.state) === j + 1 }))];
  }
  function run() {
    const ts = tabs(), sel = CFG.sel ?? (LIVE(CFG.state) || (CFG.state === 'post' ? ts.length - 1 : 0)), cur = ts.find(x => x.i === sel) || ts[0];
    const html = ts.map(x => `<button class="wt-t${x.i === cur.i ? ' on' : ''}${x.live ? ' is-live' : ''}" data-i="${x.i}">${x.t}</button>`).join('');
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><div class="hdph">Шапка матча</div>
      <nav class="wt wt--${V}" aria-label="Матч">${html}</nav>
      <div class="below">${cur.i ? `${cur.t}${cur.live ? ' — идёт' : ''}: график, драфт, игроки этой карты` : 'Превью: до матча — факты, очные, составы'}</div></div>`;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) { CFG.sel = +b.dataset.i; run(); } });
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'bo', name: 'Серия', value: CFG.bo, options: [{ v: 'bo3', label: 'Bo3' }, { v: 'bo5', label: 'Bo5' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [['pre', 'До матча'], ['live1', 'Идёт карта 1'], ['live2', 'Идёт карта 2'], ['live3', 'Идёт карта 3'],
        ...(CFG.bo === 'bo5' ? [['live4', 'Идёт карта 4'], ['live5', 'Идёт карта 5']] : []), ['post', 'После']].map(([v, label]) => ({ v, label })) },
    ],
    set(key, v) { CFG[key] = v; CFG.sel = null; if (key === 'bo' && v === 'bo3' && /live[45]/.test(CFG.state)) CFG.state = 'live3'; run(); },
    caption: () => 'Табы — только начатые и сыгранные карты; нажал — ниже эта карта. Всё на одной странице',
  };
  run();
})();
