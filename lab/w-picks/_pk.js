// Лаба w-picks — «Пики под графиком» (созвон 02.11 §1.6, задача 1.6). Поверх ../gs-match-2/_dr3.js (пики, карточка при наведении .d3-hc), его не меняем.
//  1.6.1 номер позиции — маленький чёрный квадратик внутри иконки (не белый поверх угла) — CSS в _pk.css, window.PK = 'br' (снизу справа) | 'tl' (сверху слева);
//  1.6.2 (дирижёр 02.11) карточка не закрывается, когда навёл на неё мышь; внутри ссылки: герой → страница героя, ник → страница игрока (пока демо-тост);
//  1.6.3 содержимое карточки — как есть, ждём список данных от начальника.
(() => {
  if (!window.PK) return;
  document.documentElement.classList.add('pk', 'pk--' + window.PK, 'pk-l--' + (window.PK_LINK || 'line'));
  let hide = 0;
  const pop = () => document.querySelector('.d3-hc');
  // Перехват раньше _dr3.js (фаза захвата): над героем — пусть покажет он; над карточкой — держим; ушли — закрываем через 250 мс (успеть перейти на карточку)
  document.addEventListener('mouseover', e => {
    const t = e.target.closest ? e.target : null; if (!t) return;
    // Тот же герой — не даём _dr3.js перерисовывать карточку на каждом движении (перерисовка сбрасывала подсветку блоков — «дёргалась»)
    const hc = t.closest('[data-hc]'); if (hc) { clearTimeout(hide); const p = pop(); if (p && p.classList.contains('on') && p._key === hc.dataset.hc) e.stopPropagation(); else if (p) p._key = hc.dataset.hc; return; }
    e.stopPropagation();
    if (t.closest('.d3-hc')) { clearTimeout(hide); const p = pop(); p && p.classList.add('on'); return; }
    clearTimeout(hide); hide = setTimeout(() => { const p = pop(); p && p.classList.remove('on'); }, 250);
  }, true);
  addEventListener('scroll', () => { const p = pop(); if (p && p.matches(':hover')) requestAnimationFrame(() => p.classList.add('on')); }, { passive: true });
  // Ссылки в карточке: ник → страница игрока, герой → страница героя (демо: тост, обработчик data-a — ../gs-match/_gs.js)
  const link = p => { if (p._pk) return; p._pk = 1;
    // v4–v5 (дирижёр 02.11: «подчёркивания вообще нигде не должно быть»): window.PK_LINK —
    // row — нажимается весь блок (игрок / герой): при наведении подсветка и «›» справа · arrow — у имени при наведении появляется «→», имя светлеет
    const LK = window.PK_LINK;
    new MutationObserver(() => {
      // v6 (дирижёр 02.11: «v4 норм, но блоки единообразно, стрелки в одном месте, как в других виджетах, не придумывать»): row2 — оба блока —
      // одна и та же строка-кнопка, как .w-row--btn (подсветка var(--w-muted)), стрелка — та же .w-chev (svg 16, цвет --w-ring), что в widget-roster
      const CH = LK === 'row2' ? '<svg class="w-chev pk-chev2" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<i class="pk-chev">›</i>';
      if (LK === 'row' || LK === 'row2') { [['.hc-hd', 'игрока'], ['.hc-hero', 'героя']].forEach(([sel, w]) => { const el = p.querySelector(sel); if (!el || el.dataset.a) return;
        el.dataset.a = 'toast'; el.dataset.v = `Страница ${w} ${el.querySelector('b').textContent} (демо)`; el.classList.add('pk-row'); el.setAttribute('role', 'link');
        el.insertAdjacentHTML('beforeend', CH); if (LK === 'row2') el.classList.add('pk-row2'); }); return; }
      const nk = p.querySelector('.hc-hd b'), hr = p.querySelector('.hc-hero b');
      if (nk && !nk.closest('a')) nk.outerHTML = `<a class="pk-a" role="link" tabindex="0" data-a="toast" data-v="Страница игрока ${nk.textContent} (демо)"><b>${nk.innerHTML}</b></a>`;
      if (hr && !hr.closest('a')) hr.outerHTML = `<a class="pk-a" role="link" tabindex="0" data-a="toast" data-v="Страница героя ${hr.textContent} (демо)"><b>${hr.innerHTML}</b></a>`;
    }).observe(p, { childList: true }); };
  new MutationObserver(() => { const p = pop(); if (p) link(p); }).observe(document.body || document.documentElement, { childList: true });
})();
