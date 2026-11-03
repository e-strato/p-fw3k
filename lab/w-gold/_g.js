// w-gold — обвязка лабы: панель песочницы (вид, кто ведёт, состояние) и «Идёт» — линия ползёт (1 игровая секунда за 250 мс).
// Сам виджет — _wgold.js (WGOLD), его же рисует страница матча (gs-match, data-wd="gold"). Данные — реальные (gs-match/data, OpenDota).
(() => {
  const D = window.GS_DATA;
  // v2 (дирижёр 26.10: «покажи, когда выигрывает другая команда») — «Кто ведёт»: какая карта на графике (все — реальные)
  const MAPS = { dire: [2, 2, 'Ведёт Dire (Vision)'], rad: [2, 0, 'Ведёт Radiant (Vision)'], swing: [0, 1, 'Перевес меняется (BetBoom)'] };
  const CFG = { view: 'desk', state: 'live', lead: 'dire' };
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  let m, t, T0, timer = null;

  function run() {
    const [si, mi] = MAPS[CFG.lead]; m = D.series[si].maps[mi]; t = T0 = Math.min(2010, Math.round(m.duration * 0.75));
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><div id="w"></div></div>`;
    const el = document.querySelector('#w');
    WGOLD.render(el, { m, t, state: CFG.state, n: mi + 1, base: '../gs-match/' });
    clearInterval(timer);
    if (CFG.state === 'live') timer = setInterval(() => { if (t < m.duration) WGOLD.set(el, { t: ++t }); }, 250);
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер · главная колонка 1040' }] },
      { key: 'lead', name: 'Кто ведёт', value: CFG.lead, options: Object.entries(MAPS).map(([v, x]) => ({ v, label: x[2] })) },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'live', label: 'Идёт' }, { v: 'post', label: 'После' }, { v: 'nodata', label: 'Нет данных' }] },
    ],
    set(key, v) { CFG[key] = v; run(); },
    caption: () => `${MAPS[CFG.lead][2]} — реальная карта. Идёт — линия ползёт с ${mmss(T0)}; наведи на ромб — кто умер`,
  };
  run();
})();
