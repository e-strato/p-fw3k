// w-lane-2 — задача 8 «Лайнинг до матча» и 7.4 «Состояния карты» (созвон 05.11 §8, §7.4)
// 8.1 блок «Линии» сам не открывается · 8.3 метка у 12′ (WLS_MK: 'dot' — точка · 'L' — кружок «L» · 'chip' — плашка «Линии»), по клику — блок · 8.4 до 12′ прогноз 0–12′ лежит под реальным
// «До матча» (st=pre): пики известны — в пустые слоты встают герои (‼️ пример: ожидаемые герои из «Составов»), под командой — сторона вместо «до драфта»
(() => { if (!window.WLS && !window.WLS_BAR) return; const H = document.documentElement, st = window.WLS_ST, ON = !!window.WLS; H.classList.add('wls-st--' + st); if (st === 'pre0') H.classList.add('wls-st--draft'); /* 06.11: «До матча» — как «Драфт» (пиков нет), только без хода драфта */ if (ON) H.classList.add('wls', 'wls-mk--' + (window.WLS_MK || 'dot')); if (window.WLS_PH) H.classList.add('wls-ph'); if (window.WLS_SH) H.classList.add('wls-sh'); if (window.WLS_SIDE) H.classList.add('wls-side'); if (window.WLS_SIDEC) H.classList.add('wls-sidec'); if (/^(val|fc|lgval|fcval)$/.test(window.WLS_MK)) H.classList.add('wls-mkv');
  // график: блок не открыт по умолчанию; прогноз 0–12′ под реальным (WLS_BAR без WLS — v0: только переключатель)
  const G = window.WG2; if (ON && G && G.render && !G.__wls) { const f = G.render; G.__wls = 1; G.render = function (el, o, ...a) { return f.call(this, el, { ...o, laneOpen: null, fcAll: true }, ...a); }; }
  // переключатель состояний — внизу по центру
  const SW = [['pre0', 'До матча'], ['draft', 'Драфт'], ['pre', 'Пики готовы'], ['live12', 'Первые 12′'], ['live', 'Live']]; // 06.11: названия шагов — как в панели песочницы
  const bar = () => { if (window.WLS_PROD || document.querySelector('.wls-sw')) return; // на странице матча состояния — в панели песочницы const d = document.createElement('div'); d.className = 'wls-sw';
    d.innerHTML = SW.map(([k, t]) => `<button data-st="${k}"${k === st ? ' class="on"' : ''}>${t}</button>`).join('<i>→</i>');
    d.onclick = e => { const b = e.target.closest('[data-st]'); if (!b) return; const q = new URLSearchParams(location.search); q.set('st', b.dataset.st); location.search = q.toString(); };
    document.body.appendChild(d); };
  // «До матча»: пики в слоты
  const picks = () => { if (!ON || st !== 'pre') return; ['a', 'b'].forEach((side, k) => {
    const col = document.querySelectorAll('.ws28 > div')[k]; if (!col) return; const hs = [...col.querySelectorAll('.ws37-r')].map(r => { const i = r.querySelector('.ws24-h'); return { img: i ? i.getAttribute('src').replace('/icon/', '/') : '', name: i ? i.title : '' }; });
    document.querySelectorAll(`.wl-pre .d3-five.${side} .wl-slot`).forEach((sl, j) => { if (sl.__wls) return; const h = hs[j]; if (!h || !h.img) return; // слоты и «Составы» — в одном порядке (позиции 1–5)
      sl.__wls = 1; const i = sl.querySelector('.d3-i i'); if (i) i.outerHTML = `<img src="${h.img}" alt="" title="${h.name}">`; sl.classList.add('wls-pk'); });
    document.querySelectorAll(`.wl-pre .d3-five.${side} .d3-tm small`).forEach(s => { if (/до драфта/.test(s.textContent)) s.textContent = side === 'a' ? 'Radiant' : 'Dire'; }); }); };
  // метка-прогноз: значение к 12′ (как в блоке «Линии») и лого того, кого ждут впереди
  const mk = () => { if (!ON || !window.WL_DATA) return; const g = window.WL_DATA.g12, v = `"${g >= 0 ? '+' : '−'}${(Math.abs(g) / 1000).toFixed(1)}k"`;
    if (H.style.getPropertyValue('--wls-v') !== v) H.style.setProperty('--wls-v', v);
    H.classList.toggle('wls-lead--rad', g >= 0); H.classList.toggle('wls-lead--dire', g < 0); // левая команда нижней строки — Radiant
    const im = document.querySelector(`.bw .d3-five.${g >= 0 ? 'a' : 'b'} .d3-tm img`); if (im && im.src) { const u = `url("${im.src}")`; if (H.style.getPropertyValue('--wls-lg') !== u) H.style.setProperty('--wls-lg', u); } };
  // шторка на телефоне: нажатие мимо неё — закрыть (затемнение)
  if (window.WLS_SH) document.addEventListener('click', e => { if (document.body.classList.contains('is-desk')) return; const sh = document.querySelector('.g2-lanes'); if (!sh || sh.contains(e.target) || e.target.closest('.g2-l12, .wls-sw')) return;
    const x = sh.querySelector('[data-wl-x]'); if (x) { e.stopPropagation(); e.preventDefault(); x.click(); } }, true);
  let q = 0; new MutationObserver(() => { if (q) return; q = requestAnimationFrame(() => { q = 0; bar(); picks(); mk(); }); }).observe(H, { childList: true, subtree: true });
})();
