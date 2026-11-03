// Шаг 4 лабы gs-match-2: компактный виджет турнира в правой колонке (созвон 28.10, созвон-2-матч.html §3.1:
// «достаточно показать Vision и Spirit, что первые на первом месте, вторые на четвёртом… и сделать кнопку раскрыть»).
// Хозяин — ../gs-match/_gs.js (виджет t4): GS_T4C(el, o) — рисует обычный виджет турнира (T4) внутрь и прячет всё, кроме строк двух команд матча;
// «Раскрыть» — та же таблица целиком, «Свернуть» — обратно. Шапка, места, форма и В–П — те же, что в полном виджете.
(() => {
  window.GS_T4C = (el, o) => {
    el.innerHTML = '<div class="tc-in"></div><button class="tc-more" data-tc></button>';
    const inn = el.firstChild, btn = el.lastChild;
    const set = open => { el.classList.toggle('tc--open', open); el.classList.add('tc'); btn.textContent = open ? 'Свернуть' : 'Раскрыть таблицу'; };
    btn.onclick = () => set(!el.classList.contains('tc--open'));
    window.T4.render(inn, o); set(false);
  };
})();
