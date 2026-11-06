// w-lane — задача 9 «Лайнинг» (созвон 04.11 §2.6–2.8, чат начальника 04.11 + дирижёр 04.11: «график, который появляется до начала матча на основе данных»; «2.6, 2.7, 2.8 — это всё одно»)
// График (w-gold-2/_wg2.js, опция lane): пока не прошло 12′ — ось до 12′, дальше линии — пунктир прогноза по драфту; у линии 12′ — плашка «Линии»;
// по ней или по полю 0–12′ — блок «Линии» (WL_PANEL). Герои и команды — из нижней строки страницы (что видно — то и в блоке).
// ‼️ Цифры по линиям — пример (как ▲▼% под героями в w-bottom): настоящих данных по драфту нет.
(() => {
  // со стороны Radiant (команда слева в нижней строке): шанс выиграть / проиграть линию по драфту, ожидание золота к 10:00; g12 — ждут к 12′ (для пунктира)
  window.WL_DATA = { g10: 700, g12: 900, lanes: { hard: { win: 32, lose: 41, g10: -200, g12: -300 }, mid: { win: 61, lose: 19, g10: 600, g12: 800 }, easy: { win: 48, lose: 26, g10: 300, g12: 400 } } };
  const LANE = { 1: 'easy', 2: 'mid', 3: 'hard', 4: 'hard', 5: 'easy' }, VS = { easy: 'hard', mid: 'mid', hard: 'easy' }, NM = { hard: 'Hard', mid: 'Mid', easy: 'Easy' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const k = v => (v >= 0 ? '+' : '−') + (Math.abs(v) / 1000).toFixed(1) + 'k';
  // герои и команды: на карте — из нижней строки (пики); до матча (v5) — из «Составов» вкладки «Статистика»: ожидаемые, главный герой игрока по позиции
  const col = (bw, side) => (bw.querySelectorAll('.ws28 > div')[side === 'a' ? 0 : 1]) || null;
  const heroes = (bw, side) => { const hs = [...bw.querySelectorAll(`.d3-five.${side} .d3-h:not(.wl-slot)`)].map(h => ({ n: +(h.querySelector('.d3-i b') || {}).textContent, img: (h.querySelector('.d3-i img') || {}).src || '', name: (h.title || '').split(' · ')[0] }));
    if (hs.length) return hs; const c = col(document, side); return c ? [...c.querySelectorAll('.ws37-r')].map(r => { const i = r.querySelector('.ws24-h'); return { n: +(r.querySelector('.ws24-n') || {}).textContent, img: i ? i.src : '', name: i ? i.title : '' }; }) : []; };
  const tm = (bw, side) => { const t = bw.querySelector(`.d3-five.${side} .d3-tm:not(.wl-tm)`); if (t) return { name: t.title, logo: t.querySelector('img') ? t.querySelector('img').src : '' };
    const c = col(document, side), h = c && c.querySelector('.ws28-t'); return { name: h ? h.querySelector('b').textContent : '', logo: h && h.querySelector('img') ? h.querySelector('img').src : '' }; };
  window.WL_TEAM = (el, side) => tm(el.closest('.bw') || document, side).name;
  window.WL_PANEL = (el, D) => { const bw = el.closest('.bw') || document, A = heroes(bw, 'a'), B = heroes(bw, 'b'), TA = tm(bw, 'a'), TB = tm(bw, 'b');
    const ic = (hs, ln) => hs.filter(h => LANE[h.n] === ln).map(h => `<img src="${esc(h.img)}" alt="" title="${esc(h.name)}">`).join('');
    // v17 (дирижёр 04.11: «на графике 12 минут — поправить»): WL_AT12 — в блоке тоже к 12′, как на графике
    const T12 = !!window.WL_AT12, G = x => T12 ? x.g12 : x.g10, lead = G(D) >= 0 ? TA : TB;
    const rows = ['hard', 'mid', 'easy'].map(ln => { const L = D.lanes[ln], dr = 100 - L.win - L.lose, up = L.win > L.lose; /* ▲ — выиграть вероятнее, чем проиграть (как у начальника: easy ▲48% при 26% проиграть) */
      return `<div class="wl-r"><div class="wl-ln"><b>${NM[ln]}</b><small class="${up ? 'up' : 'dn'}">${up ? '▲' : '▼'}${L.win}%</small></div>
        <div class="wl-m"><div class="wl-hs"><span>${ic(A, ln)}</span><i>vs</i><span>${ic(B, VS[ln])}</span></div>
        <div class="wl-bar"><i class="w" style="width:${L.win}%"></i><i class="d" style="width:${dr}%"></i><i class="l" style="width:${L.lose}%"></i></div>
        <div class="wl-p">выиграть ${L.win}% · ничья ${dr}% · проиграть ${L.lose}%</div></div>
        <div class="wl-g ${G(L) >= 0 ? 'up' : 'dn'}">${k(G(L))}<small>${T12 ? 'к 12′' : 'к 10:00'}</small></div></div>`; }).join('');
    return `<div class="wl"><div class="wl-hd"><b>Линии · золото 0–12′</b>${D.dot ? '<button data-wl-x class="wl-min" title="Свернуть в точку 12′"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 10l6-6M14 10V5M14 10h5M10 14l-6 6M10 14v5M10 14H5"/></svg></button>' : '<button data-wl-x title=\"Закрыть\">×</button>'}</div>
      <div class="wl-sum">${lead.logo ? `<img src="${esc(lead.logo)}" alt="">` : ''}<span>${T12 ? 'к 12′' : 'к 10:00'} ждут <b>${esc(lead.name)}</b></span><em>+${(Math.abs(G(D)) / 1000).toFixed(1)}k</em></div>
      <div class="wl-who">${esc(TA.name)} против ${esc(TB.name)} — ${bw.querySelector('.d3-five .d3-h:not(.wl-slot)') ? 'по драфту' : 'ожидаемые герои, до драфта'}</div>${rows}<div class="wl-ft">Пример данных</div></div>`; };
  // момент для лабы: WL_T — секунда матча (0 — до начала); график стоит на ней, не едет
  // до матча (WL_PRE, v5; дирижёр 04.11: «надо именно до матча — карта 1»): таб Map 1 открыт; по нему вместо «Статистики» — график первой карты с прогнозом линий (время 0:00)
  if (window.WG2) { const g0 = WG2.render; WG2.render = (el, o) => g0(el, el.closest('.wl-pre') ? { ...o, t: 0, state: 'pre', glide: false } : window.WL_T != null ? { ...o, t: WL_T, state: WL_T ? 'live' : 'pre', glide: false } : o); }
  // v6 (дирижёр 04.11: «надо пустые пики показывать, не только график»): под графиком — нижняя строка как на карте: команды и по 5 пустых мест под пики
  // (номер позиции и ник из «Составов»), счёт 0 : 0; сторону (Radiant / Dire) до драфта не пишем
  // v8 (дирижёр 04.11: «почему пики по-разному выглядят по высоте?» — до матча не было строки счёта K/D): WL_KDA — у пустого пика счёт 0/0/—, высота как на карте
  // v15 (дирижёр 04.11: «этих данных у нас не будет, пока матч не начался»): WL_NOLN — под пустыми пиками нет линии и шанса (w-bottom их не дописывает), место под строку — пустое, высота та же
  // v16 (дирижёр 04.11: «пусть строка будет с дефолтом, а не просто её не будет»): WL_LNDEF — под пустым пиком линия по позиции и прочерк вместо шанса, серым
  const row = () => { const five = side => { const c = col(document, side), t = tm(document, side), ps = c ? [...c.querySelectorAll('.ws37-r')].map(r => ({ n: (r.querySelector('.ws24-n') || {}).textContent || '', nick: (r.querySelector(':scope > b') || {}).textContent || '' })) : [];
      const tmH = `<span class="d3-tm ${side} ws-tm wl-tm" title="${esc(t.name)}"><span class="wb-lr">${t.logo ? `<img src="${esc(t.logo)}" alt="">` : ''}</span><span class="ws-tn"><b>${esc(t.name)}</b><small>до драфта</small></span></span>`;
      const hs = `<div class="d3-hs">${ps.map(p => `<div class="d3-h wl-slot${window.WL_NOLN || window.WL_LNDEF ? ' wb-ln-on' : ''}"><span class="d3-i"><i></i><b>${esc(p.n)}</b></span><span class="d3-n">${esc(p.nick)}</span>${window.WL_KDA ? '<span class="d3-k num"><i class="kk">0</i><i class="kd">0</i><i class="ka">—</i></span>' : ''}${window.WL_LNDEF ? `<span class="wb-ln wl-lndef" title="Шанс по драфту появится после драфта">${LANE[+p.n] || ''} —</span>` : window.WL_NOLN ? '<span class="wb-ln wl-noln" aria-hidden="true">—</span>' : ''}</div>`).join('')}</div>`;
      return `<div class="d3-five ${side}">${side === 'a' ? tmH + hs : hs + tmH}</div>`; };
    return `<div class="d3-row">${five('a')}<div class="d3-mid"><div class="d3-sc num"><b>0</b><i>:</i><b>0</b></div></div>${five('b')}</div>`; };
  // v7 (дирижёр 04.11: «показывай сразу Map 1»): WL_OPEN — до матча страница открывается на Map 1
  if (window.WL_NOLIVE) document.documentElement.classList.add('wl-nolive');
  // дирижёр 06.11 (финальная проверка): «До матча» (WLS_ST = pre0) — карты ещё нет: Map 1 не открываем, показываем только «Статистику» (замки — w-series)
  // + особые случаи без карты (финальная проверка 06.11): «Анонс», «Перенос», «Отмена» — тоже только «Статистика», Map 1 не открываем
  const CASE0 = /^(announce|delayed|cancel)$/.test(new URLSearchParams(location.search).get('case') || '');
  if (window.WL_PRE && window.WLS_ST !== 'pre0' && !CASE0) { let on = !!window.WL_OPEN, q = 0;
    const isPre = nav => { const ts = [...nav.querySelectorAll('.h3-tab[data-a="mseg"]')].filter(t => +t.dataset.v >= 1); return ts.length && ts.every(t => t.disabled || t.classList.contains('wl-pt') || t.classList.contains('is-lock')); };
    const thumb = (nav, t) => { const th = nav.querySelector('.h3-thumb'); if (th && t) { th.style.width = t.offsetWidth + 'px'; th.style.transform = `translateX(${t.offsetLeft}px)`; } };
    const apply = () => document.querySelectorAll('.ws-h .ws-tabs').forEach(nav => { const bw = nav.closest('.bw'), pg = bw && bw.querySelector('.bw-page'); if (!pg) return;
      const m1 = nav.querySelector('.h3-tab[data-a="mseg"][data-v="1"]'); if (!m1) return;
      document.documentElement.classList.toggle('wl-is-pre', !!isPre(nav));
      if (!isPre(nav)) { on = false; pg.querySelectorAll(':scope > .wl-pre').forEach(n => n.remove()); pg.classList.remove('wl-hide'); return; }
      m1.disabled = false; m1.classList.add('wl-pt'); if (m1.classList.contains('is-lock')) { m1.classList.remove('is-lock'); m1.removeAttribute('aria-disabled'); m1.removeAttribute('data-tip'); m1.querySelector('.ws-lk')?.remove(); } // 06.11: замок с Map 1 снимаем — её открываем
      let box = pg.querySelector(':scope > .wl-pre');
      // v18 (дирижёр 04.11: «на телефоне в маленьком разрешении — по-другому, может вообще без графика, просто списком»): WL_PHLIST — на телефоне вместо графика блок «Линии» списком, под ним пустые пики
      const ph = !!window.WL_PHLIST && !document.body.classList.contains('is-desk'), mode = ph ? 'list' : 'graph';
      if (box && box.dataset.mode !== mode) { box.remove(); box = null; }
      if (on && ph) { nav.querySelectorAll('.h3-tab').forEach(t => t.classList.toggle('on', t === m1)); thumb(nav, m1); pg.classList.add('wl-hide');
        if (!box) { box = document.createElement('section'); box.className = 'cd wl-pre'; box.dataset.mode = mode; pg.prepend(box); }
        const html = `<div class="wl-inl">${WL_PANEL(box, window.WL_DATA)}</div><div class="top-bd"><div class="d3 d3--below">${window.WL_SLOTS ? row() : ''}</div></div>`;
        if (box._h !== html) { box.innerHTML = html; box._h = html; } return; }
      if (on) { nav.querySelectorAll('.h3-tab').forEach(t => t.classList.toggle('on', t === m1)); thumb(nav, m1); pg.classList.add('wl-hide');
        if (!box) { box = document.createElement('section'); box.className = 'cd wl-pre'; box.dataset.mode = mode; box.innerHTML = `<div class="top-bd"><div class="d3 d3--below"><div data-wd="gold" data-mi="0"></div>${window.WL_SLOTS ? row() : ''}</div></div>`; pg.prepend(box);
          const sec = bw.closest('.gm') || document.querySelector('.gm'); if (window.GS_WD && sec) GS_WD('gold', box.querySelector('[data-wd="gold"]'), sec);
          // до матча график не перерисовывается сам (в live — 30 раз в секунду): строка пиков дорисовалась / подгрузились лого — подгоняем высоту графика под экран
          if (window.ResizeObserver) { let rq = 0; new ResizeObserver(() => { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; const gd = box.querySelector('[data-wd="gold"]'), b = bw.getBoundingClientRect(), free = innerHeight - 16 - (b.top + scrollY) - b.height;
            if (gd && document.body.classList.contains('is-desk') && Math.abs(free) > 2 && window.GS_WD && sec) GS_WD('gold', gd, sec); }); }).observe(box); } }
        // страница открылась сразу на Map 1 (v7) — «Составы» дорисовываются позже: пустые пики досоздаём, когда появились
        else if (window.WL_SLOTS && !box.querySelector('.wl-slot') && document.querySelector('.ws28 .ws37-r')) { const r = box.querySelector('.d3-row'); if (r) r.outerHTML = row(); /* строка пиков появилась под графиком — график пересчитывает высоту, чтобы она влезла в экран */ const sec = bw.closest('.gm') || document.querySelector('.gm'), gd = box.querySelector('[data-wd="gold"]'); if (window.GS_WD && sec && gd) GS_WD('gold', gd, sec); } }
      else { if (box) box.remove(); pg.classList.remove('wl-hide'); } });
    document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.ws-tabs .h3-tab'); if (!t) return;
      if (t.classList.contains('wl-pt')) { e.preventDefault(); e.stopPropagation(); on = true; apply(); return; }
      if (on) { on = false; const nav = t.closest('.ws-tabs'); nav.querySelectorAll('.h3-tab').forEach(x => x.classList.toggle('on', x === t)); apply(); requestAnimationFrame(() => thumb(nav, nav.querySelector('.h3-tab.on'))); } }, true);
    new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; apply(); }); }).observe(document.documentElement, { childList: true, subtree: true }); }
})();
