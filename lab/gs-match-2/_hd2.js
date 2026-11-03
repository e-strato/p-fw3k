// Шаг 2 лабы gs-match-2: шапка матча в одну строку + маленькие вкладки карт (созвон 28.10, созвон-2-матч.html §1.1–1.5).
// Хозяин — ../gs-match/_gs.js: GS_HD2(M, hd, ms) → HTML шапки; hd — headerData (команды, счёт серии, турнир, стадия, день), ms — msegData (вкладки карт).
// Варианты — window.HD2: a — строка, под ней вкладки · b — всё одной строкой · c — вкладки с точкой результата · d — турнир мелко сверху, команды и вкладки одной строкой.
// Без лого турнира, «Сетки», колокольчика, текущей карты и времени в шапке (они на графике). При прокрутке остаются только вкладки (они прилипают).
(() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const lg = (t, cls = '') => t.logo ? `<img class="h2-lg ${cls}" src="${esc(t.logo)}" alt="" />` : `<span class="h2-lg h2-lg--t ${cls}">${esc(t.short.slice(0, 2))}</span>`;
  const back = '<button class="h2-ib" data-a="back" aria-label="Назад к расписанию">‹</button>';
  const score = hd => hd.sa == null ? '<b class="h2-sc">—</b>' : `<b class="h2-sc num">${hd.sa}<i>:</i>${hd.sb}</b>`;
  const tn = t => (window.TEAM_FULL ? t.name : t.short); // лаба w-gold-2 v19+: полные названия в шапке
  const teams = hd => `<span class="h2-tm">${lg(hd.a)}<span>${esc(tn(hd.a))}</span></span>${score(hd)}<span class="h2-tm h2-tm--b"><span>${esc(tn(hd.b))}</span>${lg(hd.b)}</span>`;
  const tour = hd => `${esc(hd.league)} · ${esc(hd.stage)}${hd.stageDay ? ', ' + esc(hd.stageDay) : ''} · ${esc(hd.bo)}`;
  // Вкладка карты: сыграна — победитель (лого + тег) или точка (c); идёт — красная точка и время; впереди — бледно
  const tab = (s, cur, k, hd) => {
    const dis = s.st === 'future' || s.st === 'skip' ? 'disabled' : '';
    let sub = '';
    if (s.st === 'pre') sub = '';
    else if (s.st === 'live') sub = `<span class="h2-live">${esc(s.time)}</span>`;
    else if (s.st === 'done' && s.win) sub = k === 'c' ? `<i class="h2-dot ${s.win.name === hd.a.short ? 'is-a' : 'is-b'}"></i>` : `${s.win.logo ? `<img class="h2-lg h2-lg--s" src="${esc(s.win.logo)}" alt="" />` : ''}${esc(s.win.name)}`;
    const t = s.st === 'pre' ? 'Превью' : k === 'c' ? `К${s.i}` : String(s.i);
    return `<button class="h2-t is-${s.st}${s.i === cur ? ' on' : ''}" data-a="mseg" data-v="${s.i}" ${dis} aria-pressed="${s.i === cur}"><b>${t}</b>${sub ? `<span class="h2-s">${sub}</span>` : ''}</button>`;
  };
  const tabs = (ms, k, hd) => `<nav class="h2-tabs" aria-label="Карты матча">${ms.segs.map(s => tab(s, ms.cur, k, hd)).join('')}</nav>`;

  // e–h (дирижёр 28.10: «никакая не нравится… может как в браузере — вкладки, под ними путь»): вкладки карт как вкладки браузера / редактора
  // e — вкладки сверху, под ними путь «турнир › стадия › матч» · f — путь сверху, вкладки под ним на линии · g — как Chrome: полоса вкладок, страница под ней со строкой пути
  // h — первая вкладка закреплена: матч и счёт, дальше карты
  const crumbs = hd => `<nav class="h2-cr" aria-label="Путь">${back}<span>${esc(hd.league)}</span><i>›</i><span>${esc(hd.stage)}${hd.stageDay ? ', ' + esc(hd.stageDay) : ''}</span><i>›</i><b>${teams(hd)}</b><span class="h2-bo">${esc(hd.bo)}</span></nav>`;
  const btab = (s, cur) => { const dis = s.st === 'future' || s.st === 'skip' ? 'disabled' : '';
    const ic = s.st === 'live' ? '<i class="h2-bdot"></i>' : s.st === 'done' && s.win && s.win.logo ? `<img class="h2-lg h2-lg--s" src="${esc(s.win.logo)}" alt="" />` : s.st === 'pre' ? '<i class="h2-bic">◷</i>' : '<i class="h2-bic">·</i>';
    const t = s.st === 'pre' ? 'Превью' : `Карта ${s.i}`, sub = s.st === 'live' ? `<small class="h2-live2">${esc(s.time)}</small>` : s.st === 'done' && s.win ? `<small>${esc(s.win.name)}</small>` : '';
    return `<button class="h2-bt is-${s.st}${s.i === cur ? ' on' : ''}" data-a="mseg" data-v="${s.i}" ${dis} aria-pressed="${s.i === cur}">${ic}<span>${t}</span>${sub}</button>`; };
  // v19 (window.HDFLUSH): без отступов слева и справа — вкладки от края до края окна
  // v17–v18 (window.HDFILL): вкладки на всю ширину окна поровну; sep — с разделителями, nosep — без
  const btabs = (ms, pin) => `<nav class="h2-bts${window.HDFILL ? ' h2-bts--fill h2-bts--' + window.HDFILL : ''}${window.HDFLUSH ? ' h2-bts--flush' : ''}" aria-label="Карты матча">${pin || ''}${ms.segs.map(s => btab(s, ms.cur)).join('')}</nav>`;

  // i (дирижёр 28.10: «v10 норм, но сверху название турнира в серой штуке, снизу вкладки — только в главной колонке, виджеты внутри»):
  // шапка — серая полоса с путём (турнир › стадия › матч), вкладки карт — окном браузера в главной колонке (хозяин вызывает GS_HD2_TABS)
  // j (дирижёр 28.10: «серая шапка — в главной колонке, ни один виджет не идёт на всю ширину»): окно в главной колонке — сверху серая полоса с путём, под ней вкладки, ниже страница
  // v14–v16 (window.HDJ, дирижёр 28.10: «назад и поделиться выделить нормально, International — не слева от матча, а сверху»): полоса в две строки —
  // сверху мелко турнир, стадия, день, Bo3; ниже матч и счёт. sq — кнопки квадратами по краям · center — текст по центру, «Поделиться» пилюлей · pill — «‹ Назад» и «Поделиться» текстом
  const SHARE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
  const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const bar2 = (hd, k) => {
    const two = `<span class="bj-t"><small>${esc(hd.league)} · ${esc(hd.stage)}${hd.stageDay ? ', ' + esc(hd.stageDay) : ''} · ${esc(hd.bo)}</small><b>${teams(hd)}</b></span>`;
    // v20 (window.HDBTN = 'soft'): кнопки меньше и тише, иконки — SVG ровно по центру (символ «‹» сидел не по центру)
    if (window.HDBTN === 'soft') return `<div class="bw-bar bj bj--${k} bj--soft"><button class="bj-b" data-a="back" aria-label="Назад к расписанию">${BACK}</button>${two}<button class="bj-b" data-a="toast" data-v="Поделиться матчем (демо)" aria-label="Поделиться">${SHARE}</button></div>`;
    const bk = k === 'pill' ? '<button class="bj-b bj-b--pill" data-a="back"><span>‹</span>Назад</button>' : '<button class="bj-b" data-a="back" aria-label="Назад к расписанию">‹</button>';
    const sh = k === 'sq' ? `<button class="bj-b" data-a="toast" data-v="Поделиться матчем (демо)" aria-label="Поделиться">${SHARE}</button>` : `<button class="bj-b bj-b--pill" data-a="toast" data-v="Поделиться матчем (демо)">${SHARE}Поделиться</button>`;
    return `<div class="bw-bar bj bj--${k}">${bk}${two}${sh}</div>`;
  };
  window.GS_HD2_TABS = (M, ms, hd) => (window.HD2 === 'j' ? (window.HDJ ? bar2(hd, window.HDJ) : `<div class="bw-bar">${crumbs(hd)}</div>`) : '') + btabs(ms);
  window.GS_HD2 = (M, hd, ms) => {
    if (window.HD2 === 'j') return '';
    if ((window.HD2 || 'a') === 'i') return `<div class="h2 h2--i"><div class="h2-bar">${crumbs(hd)}</div></div>`;
    const k = window.HD2 || 'a';
    if (k === 'e') return `<div class="h2 h2--e"><div class="h2-stick">${btabs(ms)}</div>${crumbs(hd)}</div>`;
    if (k === 'f') return `<div class="h2 h2--f">${crumbs(hd)}<div class="h2-stick">${btabs(ms)}</div></div>`;
    if (k === 'g') return `<div class="h2 h2--g"><div class="h2-stick">${btabs(ms)}</div><div class="h2-page">${crumbs(hd)}</div></div>`;
    if (k === 'h') return `<div class="h2 h2--h"><div class="h2-stick">${btabs(ms, `<span class="h2-pin">${back}${teams(hd)}</span>`)}</div><div class="h2-sub">${esc(hd.league)} · ${esc(hd.stage)}${hd.stageDay ? ', ' + esc(hd.stageDay) : ''} · ${esc(hd.bo)}</div></div>`;
    // b: одна прилипающая строка — назад, команды и счёт, турнир, вкладки справа
    if (k === 'b') return `<div class="h2 h2--b"><div class="h2-stick"><header class="h2-row">${back}<span class="h2-teams">${teams(hd)}</span><span class="h2-meta">${tour(hd)}</span>${tabs(ms, k, hd)}</header></div></div>`;
    if (k === 'd') return `<div class="h2 h2--d"><div class="h2-crumb">${back}<span>${tour(hd)}</span></div>
      <div class="h2-stick"><div class="h2-row"><span class="h2-teams">${teams(hd)}</span>${tabs(ms, k, hd)}</div></div></div>`;
    // a и c: строка (назад · команды и счёт · турнир), под ней прилипающие вкладки
    return `<div class="h2 h2--${k}"><header class="h2-row">${back}<span class="h2-teams">${teams(hd)}</span><span class="h2-meta">${tour(hd)}</span></header>
      <div class="h2-stick">${tabs(ms, k, hd)}${k === 'c' ? `<span class="h2-leg"><i class="h2-dot is-a"></i>${esc(hd.a.short)}<i class="h2-dot is-b"></i>${esc(hd.b.short)}</span>` : ''}</div></div>`;
  };
})();
