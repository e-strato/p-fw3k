// w-graph — кнопки графика + / − / сброс: где висят и какого размера (дирижёр 04.11). Флаг WGR_ZC — см. _wgr.css
(() => { const v = window.WGR_ZC; if (!v) return; document.documentElement.classList.add('wgr', 'wgr-' + v); if (window.WGR_PH) document.documentElement.classList.add('wgr-ph'); if (window.WGR_NOBACK) document.documentElement.classList.add('wgr-noback'); if (window.WGR_SM) document.documentElement.classList.add('wgr-sm'); if (window.WGR_TFILL) document.documentElement.classList.add('wgr-tfill'); if (window.WGR_TC) document.documentElement.classList.add('wgr-tc'); })(); // WGR_PH — v12, см. _wgr.css

// v16 — WGR_EDGE: у табов затухание края только там, где за краем есть ещё табы (класс wgr-ml — слева, wgr-mr — справа)
(() => { if (!window.WGR_EDGE) return; document.documentElement.classList.add('wgr-edge');
  const upd = n => { const ov = n.scrollWidth > n.clientWidth + 1; n.classList.toggle('wgr-ml', ov && n.scrollLeft > 2); n.classList.toggle('wgr-mr', ov && n.scrollLeft + n.clientWidth < n.scrollWidth - 2); };
  const all = () => document.querySelectorAll('.ws-h .ws-tabs').forEach(upd);
  document.addEventListener('scroll', e => { if (e.target.classList && e.target.classList.contains('ws-tabs')) upd(e.target); }, true);
  addEventListener('resize', all); let q = 0; new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; all(); }); }).observe(document.documentElement, { childList: true, subtree: true });
})();
