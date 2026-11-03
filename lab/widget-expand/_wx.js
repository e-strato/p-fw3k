// Лаба widget-expand (дирижёр 29.10: «в отдельной лабе посмотрим, как сделать раскрываемый и сворачиваемый виджет»).
// На примере компактного турнира страницы матча (gs-match-2 v29): свёрнут — только две команды матча, раскрыт — вся таблица.
// Код виджета — ../widget-tournament-6/_t6.js (T4) как есть; здесь — только свернуть / раскрыть. Вариант — window.WX:
// btn — кнопка «Раскрыть таблицу» снизу, виджет плавно растёт и сдвигает соседей · head — стрелка в шапке, клик по шапке, «ещё 14» мелко ·
// gap — между командами строка-разрыв «··· ещё 2», клик раскрывает её на месте (как свёрнутые строки в GitHub) · over — таблица раскрывается поверх соседей, колонка не прыгает
// v5–v8 — как уже делаем в проекте (дирижёр 29.10: «есть ещё те, которые мы используем»): more — «Ещё 14» снизу, как «Вокруг матча» и «События» страницы матча ·
// icon — значок в шапке с подсказкой, как «Свернуть составы» у «Участников» · row — клик по таблице, стрелка поворачивается, как «Раскрытая строка матча» (row-expand) ·
// fold — свёрнут в одну строку, как свёрнутый драфт (w-draft fold): «Турнир · лого 1-е · лого 4-е · Таблица ▾»
(() => {
  const CHEV = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // плавно по высоте: замеряем до и после, тянем height
  const grow = (box, fn) => { const h0 = box.offsetHeight; fn(); const h1 = box.offsetHeight; if (h0 === h1) return;
    box.style.height = h0 + 'px'; box.offsetHeight; box.style.transition = 'height .28s cubic-bezier(.2,.7,.2,1)'; box.style.height = h1 + 'px';
    const end = () => { box.style.transition = ''; box.style.height = ''; box.removeEventListener('transitionend', end); }; box.addEventListener('transitionend', end); };

  window.WXMount = (el, o) => {
    const k = window.WX || 'btn';
    el.className = 'wx wx--' + k + (window.WX_ICB ? ' wx--icb' : ''); // v9 (WX_ICB): значок v6 — с рамкой
    el.innerHTML = '<div class="wx-p"><div class="wx-w"></div></div>';
    const p = el.firstChild, w = p.firstChild;
    T4.render(w, o);
    const rows = [...w.querySelectorAll('.t5-tbl tbody tr')], ctx = rows.map(r => r.classList.contains('is-ctx'));
    const hidden = rows.length - ctx.filter(Boolean).length;
    let open = false;
    const hide = on => rows.forEach((r, i) => r.classList.toggle('wx-hid', on && !ctx[i]));

    if (k === 'gap') {
      // разрывы: каждая серия спрятанных строк — одна строка «··· ещё N», клик — раскрыть эту серию
      let run = [];
      const flush = before => { if (!run.length) return; const g = document.createElement('tr'), my = run; g.className = 'wx-gap';
        g.innerHTML = `<td colspan="4"><button>··· ещё ${my.length}</button></td>`; g.onclick = () => grow(p, () => { my.forEach(r => r.classList.remove('wx-hid')); g.remove(); bar(); });
        before ? before.before(g) : rows[rows.length - 1].after(g); run = []; };
      rows.forEach((r, i) => { if (ctx[i]) flush(r); else run.push(r); }); flush(null);
      const all = document.createElement('button'); all.className = 'wx-more'; p.append(all);
      const bar = () => { const left = rows.filter(r => r.classList.contains('wx-hid')).length; all.textContent = left ? 'Вся таблица' : 'Свернуть'; };
      all.onclick = () => grow(p, () => { const left = rows.some(r => r.classList.contains('wx-hid'));
        w.querySelectorAll('.wx-gap').forEach(g => g.style.display = left ? 'none' : '');
        if (left) hide(false); else { hide(true); w.querySelectorAll('.wx-gap').forEach(g => g.style.display = ''); } bar(); });
      hide(true); bar(); return;
    }

    if (k === 'head') {
      const hd = w.querySelector('.t5-hd'), t = document.createElement('button');
      t.className = 'wx-hb'; hd.append(t); hd.classList.add('wx-click');
      const set = v => { open = v; el.classList.toggle('is-open', v); t.innerHTML = `<span>${v ? 'Свернуть' : 'ещё ' + hidden}</span>${CHEV}`; };
      hd.onclick = e => { if (e.target.closest('[data-back]')) return; grow(p, () => { hide(open); set(!open); }); };
      hide(true); set(false); return;
    }

    if (k === 'icon') {
      // значки — как у «Участников» (widget-participants/_wp.js: I_COL / I_EXP), подсказка — data-tip
      const I_COL = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2 6 4.5 8.5 2M3.5 10 6 7.5 8.5 10"/></svg>';
      const I_EXP = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 4.5 6 2 8.5 4.5M3.5 7.5 6 10 8.5 7.5"/></svg>';
      const hd = w.querySelector('.t5-hd'), t = document.createElement('button'); t.className = 'wx-ic'; hd.append(t);
      const set = v => { open = v; t.innerHTML = v ? I_COL : I_EXP; t.dataset.tip = v ? 'Свернуть таблицу' : 'Вся таблица'; };
      t.onclick = () => grow(p, () => { hide(open); set(!open); });
      hide(true); set(false); return;
    }
    if (k === 'row') {
      const hd = w.querySelector('.t5-hd'), t = document.createElement('span'); t.className = 'wx-hb'; t.innerHTML = CHEV; hd.append(t);
      const tb = w.querySelector('.t5-tbl'); tb.classList.add('wx-click');
      tb.onclick = () => grow(p, () => { hide(open); open = !open; el.classList.toggle('is-open', open); });
      hide(true); return;
    }
    if (k === 'fold') {
      // свёрнут — одна строка; раскрыт — строка сверху (как у драфта) и под ней весь виджет
      const cx = rows.map((r, i) => ctx[i] ? r : null).filter(Boolean).map(r => `<span class="wx-fx">${r.querySelector('.t5-lg') ? r.querySelector('.t5-lg').outerHTML : ''}<b>${r.cells[0].textContent}-е</b></span>`).join('');
      const f = document.createElement('button'); f.className = 'wx-fl'; p.prepend(f);
      const set = v => { open = v; el.classList.toggle('is-open', v); f.innerHTML = `<b>Турнир</b><span class="wx-fn">${w.querySelector('.t5-hd b').textContent}</span>${cx}<em>${v ? 'Свернуть ▴' : 'Таблица ▾'}</em>`; };
      f.onclick = () => grow(p, () => set(!open));
      set(false); return;
    }

    const b = document.createElement('button'); b.className = k === 'more' ? 'wx-more wx-more--cd' : 'wx-more'; p.append(b);
    if (k === 'more') {
      const set2 = v => { open = v; b.textContent = v ? 'Свернуть' : `Ещё ${hidden}`; };
      b.onclick = () => grow(p, () => { hide(open); set2(!open); });
      hide(true); set2(false); return;
    }
    const set = v => { open = v; el.classList.toggle('is-open', v); b.innerHTML = `<span>${v ? 'Свернуть' : 'Раскрыть таблицу'}</span>${CHEV}`; };

    if (k === 'over') {
      // поверх: место в колонке — по свёрнутому виду, раскрытая таблица ложится на соседей; закрыть — кнопкой или кликом мимо
      hide(true); set(false); el.style.height = p.offsetHeight + 'px';
      const close = () => { if (!open) return; grow(p, () => hide(true)); set(false); };
      b.onclick = e => { e.stopPropagation(); if (open) return close(); grow(p, () => hide(false)); set(true); };
      document.addEventListener('click', e => { if (!el.contains(e.target)) close(); });
      return;
    }
    b.onclick = () => grow(p, () => { hide(open); set(!open); });
    hide(true); set(false);
  };

  // v10 (дирижёр 29.10: «в v9 надо показать, как будут другие виджеты»): тот же значок с рамкой — у MVP матча (v11: MVP сворачивать не нужно — только в v10)
  // Свёрнут — карточка игрока низкой полосой: ник, команда, KDA, без фото и сегмента; раскрыт — как есть. Виджет перерисовывается по клику (сегмент) — значок ставим заново
  window.WXMvp = (el, o) => wrap(el, 'wx--mvp', () => MVPC.render(el.querySelector('.wx-w'), o.mvp), '.m6-hd', !!o.open);
  // v11 (дирижёр 29.10: «сворачивать пустой виджет замен… посмотреть, как будет сворачиваться виджет трансферов»): любой виджет — значок в шапке,
  // свёрнут — только шапка; hd — селектор шапки виджета
  window.WXAny = (el, draw, hd, open) => wrap(el, 'wx--any', () => draw(el.querySelector('.wx-w')), hd, open);
  // v12 (дирижёр 29.10: «свёрнутый показывает самую важную инфу, развёрнутый — всю»): замены — одной строкой «✓ Новых расхождений нет», трансферы — последний трансфер; раскрыт — всё (_wx.css [v12])
  window.WXKey = (el, draw, hd, open) => wrap(el, 'wx--any wx--key', () => draw(el.querySelector('.wx-w')), hd, open);
  const I_COL = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2 6 4.5 8.5 2M3.5 10 6 7.5 8.5 10"/></svg>';
  const I_EXP = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 4.5 6 2 8.5 4.5M3.5 7.5 6 10 8.5 7.5"/></svg>';
  // v14–v16 (дирижёр 29.10: «„Смотреть все“ / „Архив“ всегда в правом верхнем углу — значок на неё наезжает; может, в нижнюю часть»): где кнопка — window.WX_POS:
  // bar — тонкая полоса внизу во всю ширину, только стрелка · foot — внизу строка «Показать всё» / «Свернуть» со стрелкой · title — стрелка сразу за названием, клик по названию
  window.WXT4 = (el, o) => wrap(el, 'wx--any wx--key wx--t4', () => T4.render(el.querySelector('.wx-w'), o), '.t5-hd', false);
  const CH = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const WX_OPEN = window.WX_OPEN = window.WX_OPEN || {};
  function wrap(el, cls, draw, hdSel, open) {
    const pos = window.WX_POS;
    el.className = 'wx wx--icb ' + cls + (pos ? ' wx--pos-' + pos : ''); el.innerHTML = '<div class="wx-p"><div class="wx-w"></div></div>';
    const p = el.firstChild, w = p.firstChild;
    // key (страница матча перерисовывает виджеты): открыт / свёрнут помним между перерисовками — WX_OPEN[key]
    const key = el.dataset.wxKey; if (key && key in WX_OPEN) open = WX_OPEN[key];
    const flip = () => grow(p, () => { open = !open; if (key) WX_OPEN[key] = open; el.classList.toggle('is-c', !open); el.classList.toggle('is-open', open); paint(); });
    // v19 (WX_POS = 'peek', дирижёр 29.10: «не везде видно — пусть залезает на контент чуть-чуть, и лёгкое размытие фона»): как float, но под содержимым запас, значок заходит на него краем
    // v20 (WX_POS = 'peek2', дирижёр 29.10: «как v19, но раскрытый никуда не заходит, там нормальный»): раскрыт — под содержимым своё место, значок обычный, с рамкой
    if (pos === 'float' || pos === 'peek' || pos === 'peek2') {
      // v18 (дирижёр 29.10: «как v17, только без разделителя; свёрнут — значок полупрозрачный, наезжает на контент; развёрнут — заливается»): значок поверх содержимого в правом нижнем углу
      const b = document.createElement('button'); b.className = 'wx-ic wx-fl2'; p.append(b); b.onclick = flip;
      var paint = () => { b.innerHTML = open ? I_COL : I_EXP; b.dataset.tip = open ? 'Свернуть' : 'Развернуть'; b.setAttribute('aria-label', b.dataset.tip); };
      draw(); el.classList.toggle('is-c', !open); paint(); return;
    }
    if (pos === 'corner') {
      // v17 (дирижёр 29.10: «как v13, только в нижней панели справа в углу — свернуть / развернуть»): значок с рамкой из v13 — в нижней полосе справа
      const f = document.createElement('div'), b = document.createElement('button'); f.className = 'wx-ft'; b.className = 'wx-ic'; f.append(b); p.append(f); b.onclick = flip;
      var paint = () => { b.innerHTML = open ? I_COL : I_EXP; b.dataset.tip = open ? 'Свернуть' : 'Развернуть'; b.setAttribute('aria-label', b.dataset.tip); };
      draw(); el.classList.toggle('is-c', !open); paint(); return;
    }
    if (pos === 'bar' || pos === 'foot') {
      const b = document.createElement('button'); b.className = pos === 'bar' ? 'wx-bar' : 'wx-more'; p.append(b); b.onclick = flip;
      var paint = () => { b.innerHTML = pos === 'bar' ? CH : `<span>${open ? 'Свернуть' : 'Показать всё'}</span>${CH}`; b.setAttribute('aria-label', open ? 'Свернуть' : 'Раскрыть'); };
      draw(); el.classList.toggle('is-c', !open); paint(); return;
    }
    if (pos === 'title') {
      // стрелка — сразу за названием (первый <b> шапки); виджет перерисовывается — ставим заново
      var paint = () => {};
      const put = () => { const hd = w.querySelector(hdSel); if (!hd) return; hd.classList.add('wx-keep'); if (hd.querySelector('.wx-tt')) return;
        const ttl = hd.querySelector('b'); if (!ttl) return; const t = document.createElement('button'); t.className = 'wx-tt'; t.innerHTML = CH; t.setAttribute('aria-label', 'Раскрыть / свернуть');
        ttl.classList.add('wx-tl'); ttl.onclick = e => { e.stopPropagation(); flip(); }; t.onclick = e => { e.stopPropagation(); flip(); }; ttl.after(t); };
      draw(); el.classList.toggle('is-c', !open); put(); new MutationObserver(put).observe(w, { childList: true, subtree: true }); return;
    }
    const icon = () => { const hd = w.querySelector(hdSel); if (!hd) return; hd.classList.add('wx-keep'); if (hd.querySelector('.wx-ic')) return; const t = document.createElement('button'); t.className = 'wx-ic';
      t.innerHTML = open ? I_COL : I_EXP; t.dataset.tip = open ? 'Свернуть' : 'Раскрыть'; t.onclick = e => { e.preventDefault(); e.stopPropagation(); grow(p, () => { open = !open; el.classList.toggle('is-c', !open); t.remove(); icon(); }); }; hd.append(t); };
    draw(); el.classList.toggle('is-c', !open); icon();
    new MutationObserver(icon).observe(w, { childList: true, subtree: true });
  }
})();
