// w-maps — виджет «Карты матча» (сегменты; лаба w-maps, выбран v9 «Идущая подсвечена», дирижёр 26.10: «9 переноси»).
// Один код для лабы и страницы матча (gs-match, GS_MSEG = 'w'): WMSEG.render(el, o). «Превью» + все карты серии (Bo3 — 4 сегмента), не начатые — бледные,
// нажать нельзя; под названием — мини-инфа: победитель, у идущей — красная точка и время. Выбранный — плашка плавно переезжает (помнит, где стояла, по o.key).
// o: key, look 'v7' | 'v8' | 'v9', cur — номер сегмента (0 — Превью), segs — [{ i, t, st: pre | done | live | future | skip, note, time, win: { name, logo } }], base.
// Клик — data-a="mseg" data-v="<i>" (обрабатывает хозяин).
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const at = new Map(); // key → где стояла плашка { x, w }
  function mini(x, o) {
    if (x.st === 'live') return `<span class="wms-live">${esc(x.time || 'идёт')}</span>`;
    if (x.st === 'done' && x.win) return `<img class="wms-lg" src="${(o.base || '') + x.win.logo}" alt=""><span>${esc(x.win.name)}</span>`;
    return esc(x.note || { pre: 'до матча', done: x.time || 'сыграна', future: 'не начата', skip: 'не играли' }[x.st] || '');
  }
  function render(el, o) {
    el.innerHTML = `<nav class="wms wms--${o.look || 'v9'}" aria-label="Карты матча" style="--n:${o.segs.length}"><span class="wms-thumb no-anim"></span>${o.segs.map(x =>
      `<button class="wms-s is-${x.st}${x.i === o.cur ? ' on' : ''}" data-a="mseg" data-v="${x.i}" ${x.st === 'future' || x.st === 'skip' ? 'disabled' : ''} aria-pressed="${x.i === o.cur}"><b>${esc(x.t)}</b><small>${mini(x, o)}</small></button>`).join('')}</nav>`;
    const th = el.querySelector('.wms-thumb'), place = (p, anim) => { th.classList.toggle('no-anim', !anim); th.style.width = p.w + 'px'; th.style.transform = `translateX(${p.x}px)`; };
    const go = () => { const b = el.querySelector('.wms-s.on'); if (!b || !b.offsetWidth) return;
      const to = { x: b.offsetLeft, w: b.offsetWidth }, from = at.get(o.key);
      if (from && (from.x !== to.x || from.w !== to.w)) { place(from, false); th.offsetWidth; place(to, true); } else place(to, false);
      at.set(o.key, to); };
    requestAnimationFrame(go);
    if (!el._wmsro && window.ResizeObserver) { el._wmsro = new ResizeObserver(() => { const b = el.querySelector('.wms-s.on'); if (b) { at.delete(o.key); go(); } }); el._wmsro.observe(el); }
  }
  window.WMSEG = { render };
})();
