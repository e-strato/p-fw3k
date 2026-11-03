// gs-solo — виджет страницы матча один на странице (дирижёр 26.10). Страница матча (_gs.js, v19) строится скрыто, виджет — из неё.
// v5: ручка тянет ширину экрана. Меньше порога — одна колонка, виджет во всю ширину; от порога — главная колонка + правая 320 (холст их показывает).
// v6: порог выбирался в панели; v8 — один, 800, и без «ушей»: колонки на всю ширину экрана, поля 32 (_solo.css).
// v11: у каждой колонки на холсте — её название и ширина в px; ?cols=0 — подписи колонок скрыты (переключатель в панели песочницы).
// v10: в разделе «Виджеты» (?w=) ширина экрана = окно песочницы (Десктоп / Мобилка / своя ширина справа), холст на всё окно, ручки нет; в лабе ручка остаётся.
// v9: + шапка сайта (портал) во всю ширину.
// v7: в «Виджет» — все виджеты страницы (window.GS_LIST: шапка во всю ширину, главная колонка, правая). Шапка — над колонками, вместе с вкладками.
// Карточки — копия (клик по копии нажимает ту же кнопку в оригинале), виджеты правой колонки (турнир, замены, трансферы, MVP) — рисуются своим кодом (GS_WD).
// График золота перестраивается под ширину рамки (window.GS_G2W).
(() => {
  // Вне лабы (раздел «Виджеты» песочницы): ?w= — какой виджет (регулярка по ключу «место:название»)
  const Q = new URLSearchParams(location.search), WRX = Q.get('w') ? new RegExp(Q.get('w')) : null;
  const BP = 800; // v8: с этой ширины экрана — две колонки, порог один (дирижёр 26.10: «пока ставим 800»)
  const box = document.querySelector('#solo-box'), grip = document.querySelector('#solo-grip'), out = document.querySelector('#solo-w'), feed = document.querySelector('#feed');
  const scr = document.querySelector('#solo-scr'), colTop = scr.querySelector('.scr-top'), colMain = scr.querySelector('.scr-main'), colSide = scr.querySelector('.scr-side');
  // в разделе «Виджеты» — по окну; в лабе окно всегда 1440, поэтому там ручка
  const WIN = !!WRX; if (WIN) document.body.classList.add('solo-win');
  if (Q.get('cols') === '0') document.body.classList.add('no-cols');
  // подписи колонок: название · ширина — пересчёт при любом изменении размера колонки
  const NAMES = { 'scr-top': 'во всю ширину', 'scr-main': 'главная колонка', 'scr-side': 'правая колонка' };
  const ro = new ResizeObserver(es => es.forEach(e => { const c = e.target, n = Object.keys(NAMES).find(k => c.classList.contains(k));
    c.querySelector(':scope > i').textContent = `${scr.classList.contains('is-one') && n === 'scr-main' ? 'одна колонка' : NAMES[n]} · ${Math.round(c.getBoundingClientRect().width)} px`; }));
  [colTop, colMain, colSide].forEach(c => ro.observe(c));
  let pick = null, raf = 0, sw = 390;
  const L = window.LAB, axes = L.axes, set = L.set;
  const sec = () => feed.querySelector('.gm');
  const cur = () => { const all = window.GS_LIST(); if (WRX && !pick) return all.find(w => WRX.test(w.key)) || null; if (!pick) { const g = all.find(w => w.el.querySelector('.g2-wrap, [data-wd="gold"]')) || all[0]; pick = g && g.key; } return all.find(w => w.key === pick) || null; };
  // оригиналы на странице: у шапки — она и вкладки
  const origs = w => (w.el.matches('.gm-hd') ? [w.el, sec().querySelector('.mt-tabs')].filter(Boolean) : [w.el]);
  function show() {
    raf = 0;
    const w = cur(); place(w);
    if (!w) { box.innerHTML = '<p class="solo-empty">В этом состоянии этого виджета нет' + (WIN ? '' : ' — выбери другой в «Виджет»') + '</p>'; return; }
    if (w.wd) {
      box.innerHTML = '<div class="gm-wd"><div></div></div>';
      try { window.GS_WD(w.wd, box.firstChild.firstChild, sec()); } catch (e) { box.innerHTML = '<p class="solo-empty">Виджет не нарисовался</p>'; }
      return;
    }
    box.innerHTML = origs(w).map(el => el.outerHTML).join('');
    box.querySelectorAll('[id]').forEach(el => el.removeAttribute('id')); // копия шапки сайта — без id «portal», иначе страница рисует шапку в неё
    // виджеты внутри карточки (v21: график золота) — нарисовать заново в копии, под её ширину
    box.querySelectorAll('[data-wd]').forEach(el => { el.innerHTML = ''; try { window.GS_WD(el.dataset.wd, el, sec()); } catch (e) { el.remove(); } });
    // ширина графика ≠ ширина рамки → перерисовать страницу с новой шириной (копия обновится сама)
    const g = box.querySelector('.g2-wrap'), gw = g && Math.round(g.clientWidth);
    if (gw && gw !== window.GS_G2W) { window.GS_G2W = gw; set('view', sw >= BP ? 'desk' : 'phone'); }
  }
  // место на холсте: шапка — во всю ширину, правая — в правую колонку (на одной колонке — в главную)
  function place(w) { const col = w && w.place === 'all' ? colTop : w && w.place === 'side' && sw >= BP ? colSide : colMain; if (box.parentNode !== col) col.append(box); }
  // Страница перерисовалась → обновить; изменения внутри виджетов правой колонки (их анимации) не трогают
  // микрозадачей, не requestAnimationFrame — в рамке вне экрана он не срабатывает
  const later = () => { if (!raf) { raf = 1; queueMicrotask(show); } };
  new MutationObserver(ms => { if (ms.some(m => !m.target.closest || !m.target.closest('.gm-wd'))) later(); })
    .observe(feed, { childList: true, subtree: true });

  box.addEventListener('click', e => {
    const w = cur(); if (!w || w.wd) return;
    const t = e.target.closest('[data-a]'); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    const i = [...box.querySelectorAll('[data-a]')].indexOf(t), b = origs(w).flatMap(el => [...el.querySelectorAll('[data-a]')])[i];
    if (b) b.click();
  });

  // Ширина экрана: раскладка колонок, виджет — на своё место, вид страницы матча — телефон / компьютер по порогу
  function setW(v) {
    sw = WIN ? innerWidth : Math.round(Math.max(320, Math.min(innerWidth - 80, v)));
    const two = sw >= BP, view = two ? 'desk' : 'phone';
    scr.style.width = WIN ? '' : sw + 'px'; scr.classList.toggle('is-one', !two); place(cur());
    if (axes().find(a => a.key === 'view').value !== view) set('view', view); else later();
    setTimeout(() => { out.innerHTML = WIN ? '' : `Экран ${sw} px<small>${two ? 'две колонки' : 'одна колонка'} · виджет ${Math.round(box.getBoundingClientRect().width)} px</small>`; });
  }
  grip.addEventListener('pointerdown', e => { grip.setPointerCapture(e.pointerId); grip.classList.add('is-on'); });
  grip.addEventListener('pointermove', e => { if (grip.hasPointerCapture(e.pointerId)) setW(e.clientX - scr.getBoundingClientRect().left - 8); });
  grip.addEventListener('pointerup', () => grip.classList.remove('is-on'));

  // Панель: «Виджет» первым; «Вид» убран — его задаёт ширина экрана
  L.axes = () => { const all = window.GS_LIST(), opts = all.map(w => ({ v: w.key, label: w.label }));
    if (pick && !all.some(w => w.key === pick)) opts.unshift({ v: pick, label: pick.replace(/^\w+:/, ''), off: true, offNote: 'нет в этом состоянии' });
    return [{ key: 'solo', name: 'Виджет', value: pick, options: opts }, ...axes().filter(a => a.key !== 'view')]; };
  L.set = (key, v) => { if (key === 'solo') { pick = v; setW(sw); return; } set(key, v); };
  if (WIN) addEventListener('resize', () => setW(innerWidth));
  setW(innerWidth); // сразу как окно: Десктоп — компьютер, Мобилка — телефон (в лабе — во всю рамку, дальше ручкой)
})();
