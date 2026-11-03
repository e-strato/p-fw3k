// w-gold-2 — обвязка лабы: как w-gold (_g.js) — вид, кто ведёт, состояние, «Идёт» — линия ползёт; плюс зум из _z.js. Режим — window.Z_MODE в файле варианта;
// v6+ — window.G2_LOOK: график рисует _wg2.js (визуальные варианты), жесты — как v5.
// График — как на странице матча v41: высота 480 / 320, кнопки группой справа сверху (GS_GOLD_OPT).
(() => {
  const D = window.GS_DATA, MODE = window.Z_MODE || '', LOOK = window.G2_LOOK, WG = LOOK ? window.WG2 : window.WGOLD;
  const MAPS = { dire: [2, 2, 'Ведёт Dire (Vision)'], rad: [2, 0, 'Ведёт Radiant (Vision)'], swing: [0, 1, 'Перевес меняется (BetBoom)'] };
  const CFG = { view: 'phone', state: 'live', lead: 'dire' };
  const HINT = {
    '': 'Как на странице матча v41 — без зума',
    chips: '10′ · 20′ · Карта — справа сверху; окно едет за линией',
    pinch: 'Телефон: щипок — приблизить, тащить — сдвиг, двойной тап. Мышь: Ctrl + колесо (щипок на тачпаде), тащить, двойной клик',
    both: 'Один палец (мышь с нажатием) — минута и события; два пальца — щипок и сдвиг; двойной тап — приблизить / вся карта; Ctrl + колесо',
    scrub: 'Веди пальцем (мышью) по графику — минута, перевес и что было рядом',
  };
  let m, t, timer = null;

  function run() {
    const [si, mi] = MAPS[CFG.lead]; m = D.series[si].maps[mi]; t = Math.min(2010, Math.round(m.duration * 0.75));
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><div id="w"></div></div>`;
    const el = document.querySelector('#w');
    const o = { m, t, state: CFG.state, n: mi + 1, base: '../gs-match/', h: W => (W >= 600 ? 480 : 320) };
    if (LOOK) WG2.render(el, { ...o, look: LOOK }); else WGOLD.render(el, { ...o, rail: 'top', ...(MODE ? WGZOOM(MODE) : {}) });
    clearInterval(timer);
    if (CFG.state === 'live') timer = setInterval(() => { if (t < m.duration) WG.set(el, { t: ++t }); }, 250);
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер · главная колонка 1040' }] },
      { key: 'lead', name: 'Кто ведёт', value: CFG.lead, options: Object.entries(MAPS).map(([v, x]) => ({ v, label: x[2] })) },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'live', label: 'Идёт' }, { v: 'post', label: 'После' }] },
    ],
    set(key, v) { CFG[key] = v; run(); },
    caption: () => LOOK ? HINT.both : HINT[MODE],
  };
  run();
})();
