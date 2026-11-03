// gs-gold v3 — выделить один виджет страницы матча (дирижёр 26.10). Список — window.GS_LIST (_gs.js, v19): шапка, главная колонка, правая.
// Выбор — ось «Виджет» в панели; страница перерисовалась — выделение ставится заново. Шапка выделяется вместе с вкладками
(() => {
  const feed = document.querySelector('#feed');
  let pick = null, raf = 0;
  function mark(scroll) {
    raf = 0;
    document.querySelectorAll('.is-focus').forEach(el => el.classList.remove('is-focus'));
    const all = window.GS_LIST();
    if (!pick) { const g = all.find(w => w.el.querySelector('.g2-wrap')) || all[0]; pick = g && g.key; }
    const w = all.find(w => w.key === pick); if (!w) return;
    w.el.classList.add('is-focus');
    if (w.el.matches('.gm-hd')) { const t = feed.querySelector('.gm .mt-tabs'); if (t) t.classList.add('is-focus'); }
    // не scrollIntoView — он прокручивает и песочницу вокруг рамки; только своё окно
    if (scroll) { const r = w.el.getBoundingClientRect(); scrollTo(0, Math.max(0, scrollY + r.top - Math.max(80, (innerHeight - r.height) / 2))); }
  }
  // сразу (микрозадачей), не requestAnimationFrame — в рамке вне экрана он не срабатывает, и выделение терялось
  new MutationObserver(() => { if (!raf) { raf = 1; queueMicrotask(() => mark(false)); } }).observe(feed, { childList: true, subtree: true });

  const L = window.LAB, axes = L.axes, set = L.set;
  L.axes = () => { const all = window.GS_LIST(), opts = all.map(w => ({ v: w.key, label: w.label }));
    if (pick && !all.some(w => w.key === pick)) opts.unshift({ v: pick, label: pick.replace(/^\w+:/, ''), off: true, offNote: 'нет в этом состоянии' });
    return [{ key: 'focus', name: 'Виджет', value: pick, options: opts }, ...axes()]; };
  L.set = (key, v) => { if (key === 'focus') { pick = v; mark(true); return; } set(key, v); mark(false); };
  mark(true);
})();
