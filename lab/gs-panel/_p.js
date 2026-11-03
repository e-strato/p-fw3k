// gs-panel — общее для вариантов: состояния матча (как в странице матча gs-match), макет панели и подпись «что выбрано».
// Состояние = этап матча (анонс → до матча → идёт → после) + особый случай (нет данных, перенос, отмена). «Лента» — не этап, а режим: все матчи дня подряд.
window.P = (() => {
  const S = {
    feed: ['Лента', 'feed', 'режим: все матчи дня подряд'],
    announce: ['Анонс', 'pre', 'до матча, состав неизвестен'], pre: ['До матча', 'pre', 'составы есть'], delayed: ['Перенос', 'pre', 'до матча — особый случай'],
    live: ['Live', 'live', 'идёт карта'], nodata: ['Нет данных', 'live', 'идёт — особый случай'], offline: ['Нет данных и трансляции', 'live', 'идёт — особый случай'],
    post: ['После', 'post', 'матч сыгран'], cancel: ['Отмена', 'post', 'после — особый случай'],
  };
  let cur = 'live', on = () => {};
  const out = () => { const s = S[cur]; document.querySelector('#out').innerHTML = `Выбрано: <b>${s[0]}</b> — ${s[2]} · в ссылке <code>?state=${cur}</code>`; };
  return {
    S, get cur() { return cur; },
    set(v) { cur = v; on(); out(); },
    // макет панели: заголовок, ссылка, наш контрол, ниже — «Подписи колонок» и размер окна (для масштаба, серым)
    mount(html, render, note) {
      document.body.innerHTML = `<div class="pn"><div><h1>Перевес по золоту</h1><div class="path">sandbox-project/lab/gs-solo/v11-cols.html</div></div>
        <div id="ctl">${html}</div><div class="ghost"></div><div class="ghost" style="height:60px"></div></div>
        <div class="side"><h2>Как устроено</h2>${note}<p id="out" style="margin-top:16px"></p></div>`;
      on = render; render(); out();
    },
  };
})();
