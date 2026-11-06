// Лаба w-series — «Шапка: табы серии» (созвон 04.11, задачи 04.11 · область 1). Дирижёр 04.11: «шапка — табы серии, и сразу сценарий по-новому:
// как они будут переключаться, какие табы добавятся; внутри табов пока ничего не делаем, только перенос команд вниз в нижнюю строку».
// По созвону: сверху только табы серии (1.3), счёт серии не нужен — он виден по табам (1.4), без хлебных крошек, одна «назад» к расписанию (1.5, 1.6),
// «Превью» → «Статистика» (1.8), + / − / сброс графика — к табам (1.7), новый таб «Новости» (6.3); свайп / скролл вбок — соседний таб серии (1a.3),
// открываем на последнем событии (1a.4 — так уже делает хозяин, msegCur). Команды — в нижнюю строку к пикам: лого, название, Radiant / Dire (1.1, 3.1).
// Подменяет window.GS_HD2_TABS (хозяин ../gs-match/_gs.js, GS_HD2_WIN; прежний — ../w-header-3/_hd3.js). Подключать после _hd3.js.
// window.WS_V: center — табы по центру одной пилюлей · groups — слева тремя группами: «Статистика» | карты | «Новости» · steps — карты шагами серии.
// window.WS_ANIM = 'slide' — при смене таба содержимое въезжает с той стороны, куда переключили.
(() => {
  const V = window.WS_V; if (!V) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const nm = t => esc(t.name);
  const tour = hd => `${esc(hd.league)} · ${esc(hd.stage)}${hd.stageDay ? ', ' + esc(hd.stageDay) : ''} · ${esc(hd.bo)}`;
  // скрытая копия старой шапки: её читают другие виджеты страницы (.bj-t — турнир и команды)
  const compat = hd => `<span class="bj-t h3-sr"><small>${tour(hd)}</small><b><span class="h2-tm"><span>${nm(hd.a)}</span></span><span class="h2-tm"><span>${nm(hd.b)}</span></span></b></span>`;
  const S = window._wsS || (window._wsS = { news: false, last: {} });
  document.documentElement.classList.add('wsx', 'ws--' + V); // не 'ws': так называется виджет статистики (w-preview/_wstat.css .ws — overflow: hidden), на телефоне html переставал прокручиваться
  // v5 (дирижёр 04.11: «у нас будет один матч, свайп по центральной колонке переключает табы — сделать сразу, чтобы дальше везде на новом»;
  // «серым не выделяем, табы должны меньше места занимать»): WS_ONE — на странице один матч, ленты нет (снизу не подгружаем следующий);
  // WS_FLAT — табы без серой подложки и без плашки выбора: выбранный — белым, остальные приглушены, плотнее
  if (window.WS_ONE) document.documentElement.classList.add('ws-one');
  if (window.WS_FLAT) document.documentElement.classList.add('ws-flat');
  // v6 (дирижёр 04.11: «табы остаются как есть, а серая область под ними должна уйти»): WS_NOBAR — у строки шапки нет серой подложки (.bw-bar), табы — как в v2
  if (window.WS_NOBAR) document.documentElement.classList.add('ws-nobar');
  // v7 (дирижёр 04.11: «верни выделение табов — одно убрал, второе не вернул; этапы должны быть ровными»): WS_EVEN — плашка выбранного видна на фоне окна, все табы одной ширины
  if (window.WS_EVEN) document.documentElement.classList.add('ws-even');
  // v8 (дирижёр 04.11: «табы должны быть вот такими» — скрин табов v1): WS_TABS1 — табы ровно как на странице v53: тёмная пилюля, плашка выбранного — чёрная с тенью,
  // табы одной ширины; серой полосы шапки нет — цвет пилюли тот же, что был на серой полосе
  if (window.WS_TABS1) document.documentElement.classList.add('ws-tabs1');
  // v9 (дирижёр 04.11: «отступы ровные — снизу больше, чем сверху»): WS_PAD — шапка одного цвета с окном, сверху до табов 12 и от табов до графика 12
  if (window.WS_PAD) document.documentElement.classList.add('ws-pad');
  // v11 (дирижёр 04.11: «кнопки и таббар лежат отдельно — должны лежать в одной области; компонент с одинаковыми отступами, каждый этап по центру с равными отступами»):
  // WS_BAR — одна пилюля: табы | разделитель | кнопки графика; «назад» слева, пилюля по центру; отступы 12 сверху и снизу, внутри пилюли 3 со всех сторон
  const BAR = !!window.WS_BAR; if (BAR) document.documentElement.classList.add('ws-barx');
  // v12 (дирижёр 04.11: «серая подложка — только у таббара, кнопки лежат в правой части»): WS_ROW — одна строка: «назад» слева, табы (пилюля) по центру, кнопки справа без подложки
  const ROW = !!window.WS_ROW; if (ROW) document.documentElement.classList.add('ws-row');
  // v13 (дирижёр 04.11: «новости — самая левая вкладка, у новостей счётчик в маленьком круге»): WS_NEWS1 — «Новости» первым табом, рядом кружок с числом —
  // сколько новостей про обе команды в базе (../_db: DB.news), без базы — пример
  const N1 = !!window.WS_NEWS1;
  // v14 (дирижёр 04.11: «назад и поделиться — единообразные; кнопки графика мельче; легенду вообще уберём»): WS_BTN — «поделиться» той же квадратной кнопкой, что «назад»;
  // + / − / сброс мельче; кнопки «События» (легенда драк, башен, Рошана) нет
  if (window.WS_BTN) document.documentElement.classList.add('ws-btn');
  // v15 (дирижёр 04.11: «у пилюли сверху не 3, а 5»): WS_P5 — внутри пилюли сверху и снизу 5
  if (window.WS_P5) document.documentElement.classList.add('ws-p5');
  // v16 (дирижёр 04.11: «не в пилюле 5, а у таба верхний паддинг +2 — оптическая компенсация»): WS_OPT — у каждого таба сверху 2, пилюля как в v14 (3)
  if (window.WS_OPT) document.documentElement.classList.add('ws-opt');
  // v17 (дирижёр 04.11: «свайп не влево-вправо — слева направо в браузерах занят (назад / вперёд), а прокруткой вверх-вниз»): WS_VS — табы переключаются
  // прокруткой по центральной колонке: долистал её до низа и крутишь дальше — снизу заполняется плашка «следующий таб», заполнилась — переключили;
  // так же вверх у верха колонки — предыдущий. На телефоне — тянешь пальцем дальше конца. Вбок больше не переключаем; стрелки ← → остаются
  const VS = !!window.WS_VS; if (VS) document.documentElement.classList.add('ws-v');
  // v18 (дирижёр 04.11: «график по высоте занимает всё свободное место и уменьшается вместе с окном; колесо вверх-вниз над графиком тоже переключает табы —
  // график никто вверх-вниз не листает, его листают вбок или перетягивают; на графике — рука grab»): WS_FILL — высота графика = окно браузера минус всё остальное
  // в центральной колонке (шапка сайта, табы, пики, отступ 16 снизу); WS_GWHEEL — колесо над графиком не пропускаем мимо переключения
  const GW = !!window.WS_GWHEEL;
  // v20 (дирижёр 04.11: «на телефоне свайпа для переключения не будет, и график занимает столько места, сколько нужно»): WS_DESKONLY — переключение прокруткой
  // и высота «во всё окно» — только на компьютере (body.is-desk); на телефоне табы — только нажатием, график — своей высоты
  const DO = !!window.WS_DESKONLY, desk = () => !DO || document.body.classList.contains('is-desk');
  // v19 (дирижёр 04.11: «когда перекрестие попадает на точку — тогда и появляется наведение»): WS_PTCUR — на графике рука, а когда вертикаль перекрестия
  // проходит через точку на линии (событие) — курсор-палец: точку можно нажать
  // v21 (дирижёр 04.11: «откуда-то кнопка трансляции — удалить»): WS_NOPIP — плавающей «Трансляции» (w-desk, .wsc-pip) нет
  if (window.WS_NOPIP) document.documentElement.classList.add('ws-nopip');
  // v22 (дирижёр 04.11: «табы на телефоне фиксируются; дополнительной обводки у главного блока нет»): WS_STICK — на телефоне строка с табами прилипает к верху
  // при прокрутке (под шапкой сайта, --h3-top из ../w-header-3/_hd3.js); WS_NOBD — у окна матча нет рамки
  if (window.WS_STICK) document.documentElement.classList.add('ws-stick');
  if (window.WS_NOBD) document.documentElement.classList.add('ws-nobd');
  if (window.WS_PTCUR) { document.documentElement.classList.add('ws-ptcur');
    document.addEventListener('pointermove', e => { const pl = e.target.closest && e.target.closest('.g2-plot'); if (!pl) return;
      const hit = [...pl.querySelectorAll('.dm-pt')].some(c => { const r = c.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - e.clientX) <= Math.max(window.WS_SNAPPX || 5, r.width / 2 + 1) /* WS_SNAPPX (w-bottom v36) — палец-курсор на том же расстоянии, где график прилипает к точке */; });
      pl.classList.toggle('ws-on-pt', hit); }, { passive: true }); }
  if (window.WS_FILL) { document.documentElement.classList.add('ws-fill'); const base = window.GS_GOLD_OPT || {};
    window.GS_GOLD_OPT = { ...base, h: W => { if (!desk()) return W >= 600 ? 480 : 320; const bw = document.querySelector('.bw'), sv = bw && bw.querySelector('.g2-plot svg'), def = W >= 600 ? 480 : 320; if (!bw || !sv) return def;
      const r = bw.getBoundingClientRect(), cur = +sv.getAttribute('height') - (window.WS_OUT0 ? 0 : 80), /* WS_OUT0 — у графика нет полос под подписи команд (o.out = false, w-bottom v10) */ free = innerHeight - 16 - (r.top + scrollY) - r.height;
      return Math.round(Math.max(window.WS_GMIN || 220, Math.min(900, cur + free))); /* WS_GMIN (w-bottom v11): ниже этой высоты график не ужимается — страница прокручивается, как на телефоне */ } }; }
  const nCount = hd => { try { const D = window.DB; if (!D || !D.news) return 7; const ids = new Set(); [hd.a, hd.b].forEach(t => { const x = D.team(t.name); if (x) D.news({ team: x.id }).forEach(n => ids.add(n.id || n.title)); }); return ids.size; } catch (e) { return 7; } };

  // дирижёр 06.11: «До матча» (WLS_ST = pre0) — карты с замком, при наведении «Будет доступна, когда начнётся матч»; не disabled — иначе подсказка не всплывает
  const LOCKI = '<svg class="ws-lk" viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';
  const tab = (s, cur) => { const lock = /^(pre0|draft|pre)$/.test(window.WLS_ST || '') && s.st === 'future' && new URLSearchParams(location.search).get('case') !== 'cancel', /* отмена — карты просто погашены, без «будет доступна» */ /* до матча — замки и в «Драфте», «Пики готовы» (Map 1 там открывает w-lane) */ dis = lock ? ' aria-disabled="true" data-tip="Будет доступна, когда начнётся матч"' : s.st === 'future' || s.st === 'skip' ? ' disabled' : '', on = !S.news && s.i === cur;
    const t = s.st === 'pre' ? 'Статистика' : `Map ${s.i}`;
    const sub = s.st === 'live' ? `<i class="h3-dot"></i><small class="num">${esc(s.time)}</small>` : s.st === 'done' && s.win && s.win.logo ? `<img src="${esc(s.win.logo)}" alt="" title="Взяла ${esc(s.win.name)}" />` : '';
    return `<button class="h3-tab ws-t is-${s.st}${lock ? ' is-lock' : ''}${on ? ' on' : ''}" data-a="mseg" data-v="${s.i}"${dis} aria-pressed="${on}">${lock ? LOCKI : ''}<span>${t}</span>${sub}</button>`; };
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.ws-tabs .h3-tab.is-lock')) { e.preventDefault(); e.stopPropagation(); } }, true);
  const news = (n) => `<button class="h3-tab ws-t ws-t--news${S.news ? ' on' : ''}" data-ws="news" aria-pressed="${S.news}"><span>Новости</span>${n ? `<em class="ws-cnt num">${n > 99 ? '99+' : n}</em>` : ''}</button>`;
  const sep = '<i class="ws-sep" aria-hidden="true"></i>';
  const nav = (ms, key) => { const pre = ms.segs.filter(s => s.st === 'pre'), maps = ms.segs.filter(s => s.st !== 'pre');
    const thumb = window.HD3_SLIDE ? '<span class="h3-thumb no-anim"></span>' : '';
    const cls = `h3-tabs h3-tabs--in ws-tabs${window.HD3_SLIDE ? ' h3-tabs--sl' : ''}`;
    if (V === 'steps') return `<nav class="${cls}" data-k="${esc(key)}-${S.news ? 'n' : 'm'}" aria-label="Серия">${thumb}${pre.map(s => tab(s, ms.cur)).join('')}${sep}<span class="ws-steps">${maps.map(s => tab(s, ms.cur)).join('<i class="ws-ln" aria-hidden="true"></i>')}</span>${sep}${news()}</nav>`;
    if (V === 'groups') return `<nav class="${cls}" data-k="${esc(key)}" aria-label="Серия">${thumb}${pre.map(s => tab(s, ms.cur)).join('')}${sep}${maps.map(s => tab(s, ms.cur)).join('')}${sep}${news()}</nav>`;
    if (N1) return `<nav class="${cls}" data-k="${esc(key)}" aria-label="Серия">${thumb}${news(S.cnt)}${ms.segs.map(s => tab(s, ms.cur)).join('')}</nav>`;
    return `<nav class="${cls}" data-k="${esc(key)}" aria-label="Серия">${thumb}${ms.segs.map(s => tab(s, ms.cur)).join('')}${news()}</nav>`; };
  const back = '<button class="h3-b ws-b" data-a="back" aria-label="Назад к расписанию" title="К расписанию">' + BACK + '</button>';

  window.GS_HD2_TABS = (M, ms, hd) => { const key = String(ms.key || hd.a.name + hd.b.name);
    // направление для въезда содержимого: куда переключили относительно прошлого раза
    if (N1) S.cnt = nCount(hd);
    const pos = S.news ? (N1 ? -1 : 99) : ms.cur, was = S.last[key]; S.last[key] = pos;
    if (window.WS_ANIM === 'slide' && was != null && was !== pos) S.dir = { key, d: pos > was ? 1 : -1 };
    return compat(hd) + `<div class="bw-bar h3 ws-h ws-h--${V}${S.news ? ' ws-is-news' : ''}" data-ws-k="${esc(key)}">${back}${ROW ? `${nav(ms, key)}<span class="ws-ic" aria-label="Кнопки графика"></span>` : BAR ? `<div class="ws-bar">${nav(ms, key)}<i class="ws-div" aria-hidden="true"></i><span class="ws-ic" aria-label="Кнопки графика"></span></div><span class="ws-sp"></span>` : `${nav(ms, key)}<span class="ws-ic" aria-label="Кнопки графика"></span>`}</div>`
      + (S.news ? '<div class="ws-ph"><b>Новости</b><small>Новости турнира и команд — содержимое вкладки сделаем отдельно</small></div>' : ''); };

  document.addEventListener('click', e => {
    const n = e.target.closest && e.target.closest('[data-ws="news"]');
    if (n) { e.preventDefault(); if (S.news) return; S.news = true; const bw = n.closest('.bw'); const on = bw.querySelector('.ws-tabs .h3-tab.on[data-a="mseg"]') || bw.querySelector('.ws-tabs .h3-tab[data-a="mseg"]'); if (on) on.click(); return; }
    const m = e.target.closest && e.target.closest('.ws-tabs [data-a="mseg"]'); if (m && S.news && e.isTrusted) S.news = false;
    // кнопки графика в шапке — копии, нажатие передаём настоящим (они спрятаны в шапке графика)
    const p = e.target.closest && e.target.closest('[data-ws-px]');
    if (p) { e.preventDefault(); e.stopPropagation(); const bw = p.closest('.bw'), src = bw && bw.querySelectorAll('.g2-ic button')[+p.dataset.wsPx]; if (src) src.click(); }
  }, true);

  // свайп / прокрутка вбок / стрелки ← → — соседний таб серии (1a.3)
  const step = (bw, d) => { const ts = [...bw.querySelectorAll('.ws-tabs .h3-tab:not([disabled]):not(.is-lock)')], i = ts.findIndex(t => t.classList.contains('on')); const t = ts[i + d]; if (t) t.click(); };
  let acc = 0, lock = 0;
  document.addEventListener('wheel', e => { if (VS || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; const bw = e.target.closest && e.target.closest('.bw'); if (!bw || e.target.closest('.g2-plot, .h3-tabs')) return;
    e.preventDefault(); if (performance.now() < lock) return; acc += e.deltaX; if (Math.abs(acc) > 80) { step(bw, acc > 0 ? 1 : -1); acc = 0; lock = performance.now() + 700; } }, { passive: false });
  let tx = null; document.addEventListener('touchstart', e => { tx = e.touches[0] && e.target.closest('.bw') ? { x: e.touches[0].clientX, y: e.touches[0].clientY, bw: e.target.closest('.bw') } : null; }, { passive: true });
  document.addEventListener('touchend', e => { if (!tx || VS) return; const t = e.changedTouches[0], dx = t.clientX - tx.x, dy = t.clientY - tx.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(tx.bw, dx < 0 ? 1 : -1); tx = null; }, { passive: true });
  document.addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return; if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const bw = [...document.querySelectorAll('.bw')].find(b => { const r = b.getBoundingClientRect(); return r.top < innerHeight / 2 && r.bottom > innerHeight / 2; }); if (bw) step(bw, e.key === 'ArrowRight' ? 1 : -1); });

  // v17 · прокрутка вверх-вниз за край центральной колонки — соседний таб
  if (VS) {
    const nb = (bw, d) => { const ts = [...bw.querySelectorAll('.ws-tabs .h3-tab:not([disabled]):not(.is-lock)')], i = ts.findIndex(t => t.classList.contains('on')); return ts[i + d] || null; };
    const lbl = t => t ? t.querySelector('span').textContent : '';
    let pull = { bw: null, d: 0, v: 0, t: 0 }, hide = 0;
    const show = (bw, d, v) => { let el = bw.querySelector(':scope > .ws-pull'); const t = nb(bw, d); if (!t) { if (el) el.remove(); return null; }
      if (!el) { el = document.createElement('div'); el.className = 'ws-pull'; bw.append(el); }
      el.className = 'ws-pull ws-pull--' + (d > 0 ? 'dn' : 'up'); el.innerHTML = `<i style="width:${Math.round(v * 100)}%"></i><span>${d > 0 ? '↓' : '↑'} ${esc(lbl(t))}</span>`; return t; };
    const reset = () => { if (pull.bw) { const el = pull.bw.querySelector(':scope > .ws-pull'); if (el) el.remove(); } pull = { bw: null, d: 0, v: 0, t: 0 }; };
    const edge = (bw, d) => { const r = bw.getBoundingClientRect(); return d > 0 ? r.bottom <= innerHeight + 2 : r.top >= -2 && scrollY <= 2 || d < 0 && r.top >= 0; };
    // 05.11 (дирижёр: «сильно запустил скролл — дошёл до конца и перелетел на следующий; переход — отдельным скроллом, когда страница уже в конце»):
    //   дошли до края — инерция этого же жеста гаснет; тянуть к соседнему табу можно только новым жестом — после паузы в колесе 250 мс (или новым касанием)
    let arm = { bw: null, d: 0, ok: false }, lastW = 0;
    const armed = (bw, d, now, gap) => { if (arm.bw !== bw || arm.d !== d) arm = { bw, d, ok: false }; if (!arm.ok && gap) arm.ok = true; return arm.ok; };
    const feed = (bw, d, amt, gap) => { if (!desk() || !edge(bw, d)) { arm = { bw: null, d: 0, ok: false }; return false; } if (!armed(bw, d, performance.now(), gap)) return false; if (pull.bw !== bw || pull.d !== d) { reset(); pull = { bw, d, v: 0, t: 0 }; }
      pull.v = Math.min(1, pull.v + amt / 260); const t = show(bw, d, pull.v); clearTimeout(hide); hide = setTimeout(reset, 500);
      if (t && pull.v >= 1 && performance.now() > lock) { lock = performance.now() + 700; reset(); t.click(); bw.scrollIntoView({ block: 'start' }); } return !!t; };
    document.addEventListener('wheel', e => { const bw = e.target.closest && e.target.closest('.bw'); if (!bw || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (!GW && e.target.closest('.g2-plot')) return; /* колесо над графиком — его зум (v17); с WS_GWHEEL — тоже переключает */ const now = performance.now(), gap = now - lastW > 250; lastW = now; feed(bw, e.deltaY > 0 ? 1 : -1, Math.abs(e.deltaY), gap); }, { passive: true });
    let ty = null; document.addEventListener('touchstart', e => { const bw = e.target.closest && e.target.closest('.bw'); ty = bw && e.touches[0] ? { y: e.touches[0].clientY, bw, n: 1 } : null; }, { passive: true });
    document.addEventListener('touchmove', e => { if (!ty || !e.touches[0]) return; const dy = ty.y - e.touches[0].clientY; ty.y = e.touches[0].clientY; if (dy) { feed(ty.bw, dy > 0 ? 1 : -1, Math.abs(dy) * 1.5, ty.n === 1); ty.n = 0; } }, { passive: true });
  }

  // после каждой перерисовки: кнопки графика — копиями в шапку; команды — в нижнюю строку; въезд содержимого
  const ICN = b => b.innerHTML;
  const sync = () => {
    document.querySelectorAll('.ws-h').forEach(h => { const bw = h.closest('.bw'), ic = h.querySelector('.ws-ic'), src = bw && bw.querySelectorAll('.g2-ic button'); if (!ic || !src) return;
      const sig = [...src].map(b => b.className + b.disabled + b.title).join('|'); if (ic._sig === sig) return; ic._sig = sig;
      ic.innerHTML = [...src].map((b, i) => `<button class="ws-ib ${b.classList.contains('on') ? 'on' : ''}" data-src="${b.classList.contains('h3-share') ? 'share' : b.dataset.g || (b.dataset.zc ? 'z' : '')}" data-ws-px="${i}"${b.disabled ? ' disabled' : ''} title="${esc(b.title || b.getAttribute('aria-label') || '')}">${ICN(b)}</button>`).join(''); });
    document.querySelectorAll('.d3-tm:not(.ws-tm)').forEach(t => { const rad = t.classList.contains('a'), img = t.querySelector('img');
      t.classList.add('ws-tm'); t.innerHTML = `${img ? img.outerHTML : ''}<span class="ws-tn"><b>${esc(t.title)}</b><small>${rad ? 'Radiant' : 'Dire'}</small></span>`; });
    if (S.dir) { const bw = document.querySelector(`.ws-h[data-ws-k="${CSS.escape(S.dir.key)}"]`); const pg = bw && bw.closest('.bw') && bw.closest('.bw').querySelector('.bw-page');
      if (pg) { pg.classList.remove('ws-in-l', 'ws-in-r'); pg.offsetWidth; pg.classList.add(S.dir.d > 0 ? 'ws-in-r' : 'ws-in-l'); S.dir = null; } }
  };
  new MutationObserver(sync).observe(document.documentElement, { childList: true, subtree: true });
})();
