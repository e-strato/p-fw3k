// Лаба w-header-3 — «Шапка и табы» (созвон 02.11 §1.4, задача 1.4). Дирижёр 02.11: ориентируемся на 1.4.3–1.4.5:
//  · табы «Превью · Map 1–3» — в одну низкую строку (32), подписи короче;
//  · строка «Золото · карта 3 · сейчас 33:30» над графиком — убрать «ни в каком виде»;
//  · «Поделиться» — из шапки к кнопкам графика; шапка: команда — счёт — команда по центру, больше данных.
// Подменяет window.GS_HD2_TABS (хозяин — ../gs-match/_gs.js, режим GS_HD2_WIN; прежний вид — ../gs-match-2/_hd2.js). Подключать после _hd2.js.
// window.HD3: center (v2) — всё по центру, под счётом статус · big (v3) — табло: логотипы крупно над названиями · inline (v4) — табы внутри шапки под счётом.
// Кнопку «Поделиться» вставляем в значки графика (.g2-ic, лаба w-gold-2) — после каждой его отрисовки (MutationObserver).
(() => {
  const K = window.HD3; if (!K) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const SHARE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
  const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const lg = (t, c = '') => t.logo ? `<img class="h3-lg ${c}" src="${esc(t.logo)}" alt="" />` : `<span class="h3-lg h3-lg--t ${c}">${esc(t.short.slice(0, 2))}</span>`;
  const nm = t => esc(window.TEAM_FULL ? t.name : t.short);
  const map = s => String(s || '').replace(/Карта /g, 'Map '); // дирижёр: «Map 2», а не «карта 2»
  const tour = hd => `${esc(hd.league)} · ${esc(hd.stage)}${hd.stageDay ? ', ' + esc(hd.stageDay) : ''} · ${esc(hd.bo)}`;
  const score = hd => hd.sa == null ? '<b class="h3-sc">vs</b>' : `<b class="h3-sc num">${hd.sa}<i>:</i>${hd.sb}</b>`;
  const status = (M, hd) => hd.live ? `<span class="h3-st is-live"><i></i>${esc(map(hd.st))}</span>`
    : M.state === 'post' ? `<span class="h3-st">Матч завершён</span>` : hd.st ? `<span class="h3-st">${esc(hd.st)}</span>` : '';
  const back = '<button class="h3-b" data-a="back" aria-label="Назад к расписанию">' + BACK + '</button>';

  // Табы — одна строка 32: «Превью», «Map 1» + логотип победителя, идущая — точка и время
  const tab = (s, cur) => { const dis = s.st === 'future' || s.st === 'skip' ? ' disabled' : '';
    const t = s.st === 'pre' ? 'Превью' : `Map ${s.i}`;
    const sub = s.st === 'live' ? `<i class="h3-dot"></i><small class="num">${esc(s.time)}</small>` : s.st === 'done' && s.win && s.win.logo ? `<img src="${esc(s.win.logo)}" alt="" title="${esc(s.win.name)}" />` : '';
    return `<button class="h3-tab is-${s.st}${s.i === cur ? ' on' : ''}" data-a="mseg" data-v="${s.i}"${dis} aria-pressed="${s.i === cur}"><span>${t}</span>${sub}</button>`; };
  // v11 (дирижёр 02.11: «раз стал сегментом — плавный переезд, как везде»): HD3_SLIDE — выбранный подсвечивает плашка, она переезжает
  // к новому табу (как w-maps / _wmseg.js: помнит, где стояла, по матчу; хозяин перерисовывает шапку на каждый клик)
  const SL = !!window.HD3_SLIDE, at = new Map();
  const tabs = (ms, cls = '', key = '') => `<nav class="h3-tabs ${cls}${SL ? ' h3-tabs--sl' : ''}" data-k="${esc(key)}" aria-label="Карты матча">${SL ? '<span class="h3-thumb no-anim"></span>' : ''}${ms.segs.map(s => tab(s, ms.cur)).join('')}</nav>`;
  const slide = nav => { nav._sl = 1; const th = nav.querySelector('.h3-thumb'), k = nav.dataset.k;
    const place = (p, anim) => { th.classList.toggle('no-anim', !anim); th.style.width = p.w + 'px'; th.style.transform = `translateX(${p.x}px)`; };
    const go = () => { const b = nav.querySelector('.h3-tab.on'); if (!b || !b.offsetWidth) return;
      const to = { x: b.offsetLeft, w: b.offsetWidth }, prev = at.get(k), now = performance.now();
      // хозяин мог перерисовать шапку посреди переезда — продолжаем с того места, где плашка сейчас
      const mid = prev && prev.src && now - prev.t0 < 350 ? (q => ({ x: prev.src.x + (prev.x - prev.src.x) * q, w: prev.src.w + (prev.w - prev.src.w) * q }))(Math.min(1, (now - prev.t0) / 350)) : prev;
      if (mid && (Math.round(mid.x) !== to.x || Math.round(mid.w) !== to.w)) { place(mid, false); th.offsetWidth; place(to, true); at.set(k, { ...to, src: mid, t0: now }); }
      else { place(to, false); at.set(k, prev && prev.x === to.x && prev.w === to.w ? prev : to); } };
    requestAnimationFrame(go);
    // ResizeObserver срабатывает сразу при подписке — тогда не трогаем (иначе стирал «где стояла» и переезда не было); только при настоящей смене ширины
    let w0 = nav.offsetWidth; if (window.ResizeObserver) new ResizeObserver((_, ro) => { if (!nav.isConnected) return ro.disconnect(); /* старая шапка, убранная перерисовкой: её «ширина 0» стирала память — второй переезд пропадал */ if (nav.offsetWidth === w0) return; w0 = nav.offsetWidth; at.delete(k); go(); }).observe(nav); };

  // Путь над страницей (../w-subhead/_sbh.js) берёт турнир и команды из .bj-t старой шапки — кладём скрытую копию в те же классы
  const compat = hd => `<span class="bj-t h3-sr"><small>${tour(hd)}</small><b><span class="h2-tm"><span>${nm(hd.a)}</span></span><span class="h2-tm"><span>${nm(hd.b)}</span></span></b></span>`;
  // v12–v15 (дирижёр 02.11: «табы прилипают, название прилипает, перестраивается — разные версии»): window.HD3_STICK —
  // all — липнет вся шапка · tabs — уехала шапка → сверху остаются только табы · line — сверху одна строка: команды и счёт слева, табы справа ·
  // pin — табы, первым — матч «Vision 1:1 Spirit». Строка-«прилипала» стоит сразу под шапкой (высота 0), видна, когда шапка ушла под верх страницы
  const STK = window.HD3_STICK;
  const mini = (M, ms, hd) => { const k = hd.a.name + hd.b.name + '-m', sc = hd.sa == null ? 'vs' : `${hd.sa}<i>:</i>${hd.sb}`;
    const teams = `<span class="h3-mt">${lg(hd.a)}<b>${nm(hd.a)}</b><em class="num">${sc}</em><b>${nm(hd.b)}</b>${lg(hd.b)}</span>`;
    const pin = `<span class="h3-mt h3-mt--pin">${lg(hd.a)}<em class="num">${sc}</em>${lg(hd.b)}</span>`;
    const inner = STK === 'line' ? teams + tabs(ms, 'h3-tabs--in', k) : STK === 'pin' ? `<div class="h3-pinrow">${pin}${tabs(ms, 'h3-tabs--in', k)}</div>` : tabs(ms, 'h3-tabs--in', k);
    return `<div class="h3-mini h3-mini--${STK}"><div class="h3-mini-in">${inner}</div></div>`; };
  window.GS_HD2_TABS = (M, ms, hd) => compat(hd) + head3(M, ms, hd) + (STK && STK !== 'all' && STK !== 'native' ? mini(M, ms, hd) : '');
  if (STK) { document.documentElement.classList.add('h3-stk', 'h3-stk--' + STK);
    // верх, под который уходит шапка, — низ шапки сайта (.pt, она прячется при прокрутке вниз)
    const tick = () => { const pt = document.querySelector('.pt'), y = pt ? Math.max(0, pt.getBoundingClientRect().bottom) : 0;
      document.documentElement.style.setProperty('--h3-top', y + 'px');
      document.querySelectorAll('.bw').forEach(bw => { const bar = bw.querySelector('.h3'), r = bw.getBoundingClientRect(); if (!bar) return;
        bw.classList.toggle('is-stuck', bar.getBoundingClientRect().bottom <= y + 1 && r.bottom > y + 60); }); };
    let raf = 0; const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
    document.addEventListener('scroll', on, true); window.addEventListener('resize', on); setInterval(tick, 500); }
  const head3 = (M, ms, hd) => {
    const win = hd.win; // 'a' | 'b' после матча — проигравшая сторона бледнее
    const A = `<span class="h3-t${win === 'b' ? ' is-lose' : ''}">`, B = `<span class="h3-t h3-t--b${win === 'a' ? ' is-lose' : ''}">`;
    if (K === 'big') return `<div class="bw-bar h3 h3--big">${back}<div class="h3-c"><small>${tour(hd)}</small>
        <div class="h3-row">${A}${lg(hd.a)}<b>${nm(hd.a)}</b></span><span class="h3-mid">${score(hd)}${status(M, hd)}</span>${B}${lg(hd.b)}<b>${nm(hd.b)}</b></span></div></div><span class="h3-sp"></span></div>${tabs(ms, '', hd.a.name + hd.b.name)}`;
    const head = `<div class="h3-c"><small>${tour(hd)}</small><div class="h3-row">${A}<b>${nm(hd.a)}</b>${lg(hd.a)}</span>${score(hd)}${B}${lg(hd.b)}<b>${nm(hd.b)}</b></span></div>`;
    // v5–v6 (дирижёр 02.11: «v4 хорош, ниже по высоте»): HD3_FIT = tight — всё мельче и плотнее · row — турнир не над командами, а в одной строке с «назад» слева
    const F = window.HD3_FIT ? ' h3--' + window.HD3_FIT : '';
    // v7–v9 (дирижёр 02.11: «v5–v6 меньше нравятся, чем v4 — ещё варианты»): размеры как в v4, ниже за счёт другого —
    // air — только отступы плотнее · row4 — турнир слева в строке с «назад» (как v6), размеры v4 · notour — без строки турнира (он есть в пути над страницей)
    // v16 (дирижёр 02.11: «v13, только понативнее»): HD3_STICK = 'native' — табы не копией, а сами: отдельная строка под командами, обычный sticky —
    // команды уезжают, пилюля доезжает до верха и остаётся; когда прилипла — снизу тонкая линия и тень
    if (K === 'inline' && STK === 'native') return `<div class="bw-bar h3 h3--inline${F} h3--nt">${back}<div class="h3-c"><div class="h3-row">${A}<b>${nm(hd.a)}</b>${lg(hd.a)}</span>${score(hd)}${B}${lg(hd.b)}<b>${nm(hd.b)}</b></span></div></div><span class="h3-sp"></span></div><div class="h3-tabrow">${tabs(ms, 'h3-tabs--in', hd.a.name + hd.b.name)}</div>`;
    if (K === 'inline' && window.HD3_FIT === 'notour') return `<div class="bw-bar h3 h3--inline${F}">${back}<div class="h3-c"><div class="h3-row">${A}<b>${nm(hd.a)}</b>${lg(hd.a)}</span>${score(hd)}${B}${lg(hd.b)}<b>${nm(hd.b)}</b></span></div>${tabs(ms, 'h3-tabs--in', hd.a.name + hd.b.name)}</div><span class="h3-sp"></span></div>`;
    if (K === 'inline' && (window.HD3_FIT === 'row' || window.HD3_FIT === 'row4')) return `<div class="bw-bar h3 h3--inline${F}">${back}<small class="h3-tour">${tour(hd)}</small><div class="h3-c"><div class="h3-row">${A}<b>${nm(hd.a)}</b>${lg(hd.a)}</span>${score(hd)}${B}${lg(hd.b)}<b>${nm(hd.b)}</b></span></div>${tabs(ms, 'h3-tabs--in', hd.a.name + hd.b.name)}</div><span class="h3-sp"></span></div>`;
    if (K === 'inline') return `<div class="bw-bar h3 h3--inline${F}">${back}${head}${tabs(ms, 'h3-tabs--in', hd.a.name + hd.b.name)}</div><span class="h3-sp"></span></div>`;
    return `<div class="bw-bar h3 h3--center">${back}${head}${status(M, hd)}</div><span class="h3-sp"></span></div>${tabs(ms, '', hd.a.name + hd.b.name)}`;
  };

  // «Поделиться» — в значки графика, первой кнопкой
  const put = () => document.querySelectorAll('.g2-ic').forEach(ic => { if (ic.querySelector('.h3-share')) return;
    ic.insertAdjacentHTML('afterbegin', `<button class="h3-share" data-a="toast" data-v="Поделиться матчем (демо)" title="Поделиться">${SHARE}</button>`); });
  new MutationObserver(() => { put(); if (SL) document.querySelectorAll('.h3-tabs--sl').forEach(n => n._sl || slide(n)); }).observe(document.documentElement, { childList: true, subtree: true });
})();
