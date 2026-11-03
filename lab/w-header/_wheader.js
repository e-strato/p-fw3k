// w-header — виджет «Шапка матча» (лаба w-header, выбран v5 «Счёт по центру», дирижёр 26.10: «V5 нормальный, можно переносить»).
// Один код для лабы и страницы матча (gs-match, GS_HD = 'w'): WHEADER.render(el, o). Вверху — развёрнутая: турнир · Bo, колокольчик; команды по краям
// с названиями, счёт серии и «что сейчас» по центру; вкладки матча. Секция прокручена выше своего верха на 40 px — одна строка (липкость — у хозяина).
// o: tools — HTML справа перед колокольчиком (лаба w-desk: остров, кнопки, трансляция), after(el) — после каждой отрисовки; a / b — { name, short, logo }, meta, sa / sb (null — счёта нет), win 'a' | 'b' | null, st — что сейчас, live, note, bell, bellOff, tabs — [{ t, on, a, v, n }],
// tabs: [] — без вкладок (gs-match v24: под шапкой — карты матча), base — путь к картинкам, force 'full' | 'mini' (лаба). Клики — data-a / data-v, как у страницы (обрабатывает хозяин).
(() => {
  const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
  const CUP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const all = new Set();

  function html(o, narrow) {
    const lg = (t, cls = '') => `<img class="wh-lg ${cls}" src="${(o.base || '') + t.logo}" alt="">`;
    // window.TEAM_FULL (лаба w-gold-2 v19+, дирижёр 30.10: «в заголовке — нормальные Team Vision, Team Spirit») — везде полное название
    const nm = (k, full) => `<span class="wh-nm${o.win === k ? ' wh-w' : ''}">${esc(full || window.TEAM_FULL ? o[k].name : o[k].short)}</span>`;
    const sc = o.sa == null ? '<span class="wh-sc wh-sc--none">—</span>'
      : `<span class="wh-sc num"><b class="${o.win === 'a' ? 'wh-w' : ''}">${o.sa}</b><i>:</i><b class="${o.win === 'b' ? 'wh-w' : ''}">${o.sb}</b></span>`;
    const st = o.st ? `<span class="wh-st${o.live ? ' is-live' : ''}">${esc(o.st)}</span>` : '';
    const bell = `<button class="wh-bell${o.bell ? ' on' : ''}" data-a="bell" aria-label="Напомнить о матче" aria-pressed="${!!o.bell}" ${o.bellOff ? 'disabled' : ''}>${BELL}</button>`;
    const tabs = !o.tabs.length ? '' : `<nav class="wh-tabs" aria-label="Матч">${o.tabs.map(x => `<a href="#" class="wh-tab${x.on ? ' on' : ''}" ${x.on ? 'aria-current="page"' : ''} data-a="${x.a}" data-v="${esc(x.v)}">${esc(x.t)}${x.n ? ` <small>${x.n}</small>` : ''}</a>`).join('')}</nav>`;
    let full = `<div class="wh-full"><div class="wh-meta"><span>${esc(o.meta)}</span>${o.tools || ''}${bell}</div>
      <div class="wh-row"><div class="wh-t">${lg(o.a, 'wh-lg--l')}${nm('a', !narrow)}</div><div class="wh-c">${sc}${st}</div><div class="wh-t wh-t--b">${nm('b', !narrow)}${lg(o.b, 'wh-lg--l')}</div></div>
      ${o.note ? `<div class="wh-note">${esc(o.note)}</div>` : ''}${tabs}</div>`;
    let mini = `<div class="wh-mini"><div class="wh-line">${lg(o.a)}${nm('a', false)}${sc}${nm('b', false)}${lg(o.b)}${o.live && o.stShort ? `<span class="wh-st is-live">${esc(o.stShort)}</span>` : ''}${narrow ? '' : tabs}<span class="wh-sp"></span>${o.tools || ''}${bell}</div>${narrow ? tabs : ''}</div>`;
    const look = o.look || window.WH_LOOK, tour = look === 'card' && (o.ctx || window.WH_CTX) === 'tour';
    // лаба w-header-2 v8 «Карточка» (дирижёр 28.10: «должна остаться карточка матча, более центрированная, сжиматься; скругления со всех сторон»):
    // команды у счёта, турнир над счётом, колокольчик в углу; сжатая — одна строка по центру. Сжатие — как обычно (WH_COLLAPSE).
    // v15 «Турнир — родитель» (o.ctx || WH_CTX = 'tour'; дирижёр 28.10: «как показывать привязанность к турниру… крошки — и кнопка назад тоже»; «v15 — уже ближе»):
    // карточка в два этажа — сверху турнир (назад, кубок, название, «Dota 2 · стадия, день · Bo», «Сетка ›», колокольчик), снизу матч; сжатая — «‹» слева
    if (look === 'card') {
      const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
      // v16–v19 — версии от v15 (дирижёр 28.10: «логика нравится, может получится ещё лучше»), o.tv || WH_TOUR:
      //   link  — турнир лёгкой строкой-ссылкой без подложки: «‹ · кубок The International 2026 › Плей-офф, день 2 из 3»; в сжатой — «‹» и кубок
      //   prog  — как v15, под турниром — полоса турнира по дням: группы · плей-офф · финал, где мы сейчас
      //   side  — на компьютере турнир — колонкой слева от матча (кубок, название, стадия, «Сетка»); на телефоне — как v15
      //   brand — как v15, этаж турнира — в цветах турнира, крупнее, кубок фоном
      const tv = tour ? o.tv || window.WH_TOUR || '' : '', side = tv === 'side' && !narrow;
      const backB = `<button class="wh-back wh-back--s" data-a="back" aria-label="Назад к матчам">${BACK}</button>`;
      const sub = `Dota 2 · ${esc(o.stage)}${o.stageDay ? ', ' + esc(o.stageDay) : ''} · ${esc(o.bo)}`;
      const grid = `<a href="#" class="wh-band-go" data-a="toast" data-v="Сетка турнира (демо)">Сетка<i>›</i></a>`;
      const prog = tv === 'prog' && o.prog ? `<div class="wh-prog" aria-label="Турнир по дням">${o.prog.map(x => `<div class="wh-pg is-${x.st}" style="flex:${x.n}"><span class="wh-pg-b">${Array.from({ length: x.n }, (_, i) => `<i class="${x.st === 'done' || (x.st === 'now' && i < x.cur) ? 'on' : x.st === 'now' && i === x.cur ? 'cur' : ''}"></i>`).join('')}</span><small>${esc(x.t)}</small></div>`).join('')}</div>` : '';
      const top = !tour ? `<div class="wh-cd-top"><span class="wh-cd-mt">${esc(o.meta)}</span><span class="wh-cd-r">${o.tools || ''}${bell}</span></div>`
        : tv === 'link' ? `<div class="wh-tl">${backB}<a href="#" class="wh-tl-a" data-a="toast" data-v="${esc(o.league)} — страница турнира (демо)"><span class="wh-tl-ic">${CUP}</span><b>${esc(o.league)}</b><i>›</i><span>${esc(o.stage)}${o.stageDay ? ', ' + esc(o.stageDay) : ''} · ${esc(o.bo)}</span></a><span class="wh-band-r">${o.tools || ''}${bell}</span></div>`
        : side ? `<div class="wh-sd">${backB}<span class="wh-band-ic">${CUP}</span><b>${esc(o.league)}</b><small>${sub}</small>${grid}</div>`
        : `<div class="wh-band${tv === 'brand' ? ' wh-band--brand' : ''}">${backB}<span class="wh-band-ic">${CUP}</span><span class="wh-band-tx"><b>${esc(o.league)}</b><small>${sub}</small></span>${grid}<span class="wh-band-r">${o.tools || ''}${bell}</span></div>${prog}`;
      const row = `<div class="wh-cd-row"><div class="wh-t">${nm('a', !narrow)}${lg(o.a, 'wh-lg--xl')}</div><div class="wh-c">${sc}${st}</div><div class="wh-t wh-t--b">${lg(o.b, 'wh-lg--xl')}${nm('b', !narrow)}</div></div>`;
      full = side ? `<div class="wh-full wh-cd wh-cd--side">${top}<div class="wh-sd-m"><span class="wh-sd-r">${o.tools || ''}${bell}</span>${row}${o.note ? `<div class="wh-note">${esc(o.note)}</div>` : ''}</div></div>`
        : `<div class="wh-full wh-cd${tour ? ' wh-cd--tour' : ''}${tv ? ' wh-cd--' + tv : ''}">${top}
        ${row}
        ${o.note ? `<div class="wh-note">${esc(o.note)}</div>` : ''}</div>`;
      mini = `<div class="wh-mini"><div class="wh-line wh-line--c">${tour ? `<button class="wh-back wh-back--i" data-a="back" aria-label="Назад">${BACK}</button>` : ''}${tv === 'link' ? `<a href="#" class="wh-tl-mini" data-a="toast" data-v="${esc(o.league)} — страница турнира (демо)" aria-label="${esc(o.league)}">${CUP}</a>` : ''}${lg(o.a)}${nm('a', false)}${sc}${nm('b', false)}${lg(o.b)}${o.live && o.stShort ? `<span class="wh-st is-live">${esc(o.stShort)}</span>` : ''}<span class="wh-cd-r">${bell}</span></div></div>`;
      return shell(o, narrow, full, mini, ' wh--card');
    }
    return shell(o, narrow, full, mini, '');
  }
  function shell(o, narrow, full, mini, cls) {
    const c = o.collapse || window.WH_COLLAPSE; // v8–v10 (дирижёр 27.10: «неплавно сжимается, страница дёргается — плавнее, медленнее, другие варианты»)
    return `<div class="wh${narrow ? ' is-narrow' : ''}${c ? ' wh--' + c : ''}${cls}"><div class="wh-fw">${full}</div><div class="wh-mw">${mini}</div></div>`;
  }

  // Сжатие с запасом (дирижёр 27.10: «залипает между состояниями и быстро переключается»): шапка сжалась — страница под ней сдвинулась,
  // и браузер подкручивал прокрутку (scroll anchoring), порог пересекался обратно. Подкрутку у прокрутки, где стоит шапка, выключаем (noAnchor),
  // и запас: сжимается ниже −40, разворачивается только выше −8.
  // Способы сжатия (o.collapse / window.WH_COLLAPSE):
  //   anim   — как было (порог с запасом), но развёрнутая сворачивается, а строка разворачивается медленно, за 0,45 с;
  //   slide  — развёрнутая не липнет, уезжает вместе со страницей; когда ушла — сверху выезжает отдельная строка. Высота страницы не меняется — дёргаться нечему;
  //   scroll — сжимается вслед за прокруткой: на сколько прокрутил, на столько и ниже (до одной строки), без порога.
  function mode(el) {
    const o = el._wh, box = el.querySelector('.wh'); if (!box) return;
    const c = o.collapse || window.WH_COLLAPSE, host = el.closest('.gm-hd'), sec = el.closest('[data-wh-sec], .gm') || el.parentElement, r = sec.getBoundingClientRect(), top = r.top, mini = box.classList.contains('is-mini');
    if (o.force) return box.classList.toggle('is-mini', o.force === 'mini');
    if (c === 'slide') {
      host && host.classList.add('wh-host--slide');
      const fw = box.querySelector('.wh-fw'), gone = fw.getBoundingClientRect().bottom < (document.body.classList.contains('pt-off') ? 0 : 52), mw = box.querySelector('.wh-mw'), b = box.getBoundingClientRect();
      mw.style.left = b.left + 'px'; mw.style.width = b.width + 'px';
      return box.classList.toggle('is-mini', gone && r.bottom > 120);
    }
    if (c === 'scroll') {
      const fw = box.querySelector('.wh-fw'), inner = fw.firstElementChild, mh = box.querySelector('.wh-mw').scrollHeight, fh = inner.scrollHeight;
      const d = Math.max(0, Math.min(fh - mh, -top)), p = fh > mh ? d / (fh - mh) : 0;
      // вверху — высота сама (auto): при первой отрисовке логотипы ещё не загружены, и замеренная высота обрезала шапку (дирижёр 27.10: «неправильный хедер»)
      fw.style.height = d ? fh - d + 'px' : ''; inner.style.opacity = String(Math.max(0, 1 - p * 1.6));
      return box.classList.toggle('is-mini', p > 0.6), box.style.setProperty('--p', p.toFixed(3));
    }
    box.classList.toggle('is-mini', mini ? top < -8 : top < -40);
  }
  document.addEventListener('scroll', () => all.forEach(el => (el.isConnected ? mode(el) : all.delete(el))), { capture: true, passive: true });

  function noAnchor(el) {
    document.documentElement.style.overflowAnchor = 'none';
    for (let p = el.parentElement; p; p = p.parentElement) if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) p.style.overflowAnchor = 'none';
  }

  window.WHEADER = {
    render(el, o) {
      el._wh = o; all.add(el); noAnchor(el);
      const draw = el._whdraw = () => { el.innerHTML = html(o, el.clientWidth > 0 && el.clientWidth < 800); mode(el); if (o.after) o.after(el); }; // after — дорисовать вставки в tools (w-desk)
      if (!el._whro && window.ResizeObserver) { let n0 = null; el._whro = new ResizeObserver(() => { const n = el.clientWidth < 800; if (n !== n0) { n0 = n; el._whdraw(); } }); el._whro.observe(el); }
      draw();
    },
  };
})();
