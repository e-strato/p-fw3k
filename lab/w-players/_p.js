// w-players — обвязка лабы: панель песочницы (вид, состояние). Сам виджет — _wplayers.js (WPLAYERS), его же рисует страница матча (gs-match, data-wd="players").
// Данные — реальные (gs-match/data, OpenDota): TI 2026, Spirit (Radiant) — Vision (Dire), карта 3. «Идёт» — на 33:30 (как в gs-match), «После» — итог карты.
(() => {
  const D = window.GS_DATA, m = D.series[2].maps[2], T = 2010;
  const CFG = { view: 'desk', state: 'live' };
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function render() {
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><div id="w"></div></div>`;
    WPLAYERS.render(document.querySelector('#w'), { m, t: T, state: CFG.state, base: '../gs-match/' });
  }
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер · главная колонка 1040' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'live', label: 'Идёт · ' + mmss(T) }, { v: 'post', label: 'После' }] },
    ],
    set(key, v) { CFG[key] = v; render(); },
    caption: () => 'Spirit — Vision, карта 3 (реальные данные). Ранг и % под линией — пример. Наведи на игрока — карточка',
  };
  render();
})();
