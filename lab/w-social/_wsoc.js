// DB_FAKE: если на странице есть выдуманная база (_db/_fake.js) — данные отсюда берутся из неё (одно место для выдумки); нет — как было
// w-social — виджет «Кнопки сообщества» для страницы матча (лаба w-social v1–v3, дирижёр 27.10: «новые лабы на основе текущего варианта» — страница v30).
// Начальник 26.10 [2 · 13:58–14:22]: «панель с кнопками сообщества — репосты, поделиться, комментарии — точно будет»; [1 · 02:52] — лента сбоку, как на Sports.ru.
// Один код для страницы (gs-match, data-wd="soc") и лабы: WSOC.render(el, o). o: look — row (строка) | rail (колонка иконок) | line (строка поровну, телефон) | card (карточка «Обсуждение»), M — матч страницы.
// ‼️ Пример (в данных этого нет): число лайков, репостов и комментариев, сами комментарии.
(() => {
  const MINE = {}; // что нажал зритель — по серии
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const n = v => (v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : String(v));
  const IC = {
    like: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    talk: '<svg viewBox="0 0 24 24"><path d="M5 5h14v10H10l-4 4v-4H5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    re: '<svg viewBox="0 0 24 24"><path d="M7 7h10l-3-3M17 17H7l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 4v11M8 8l4-4 4 4M5 13v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const TALK = window.DB_FAKE?.chat.talk ?? [['Mira_fan', '2 мин', 'Третья карта всё решит, на линиях уже давят'], ['dota_old', '5 мин', 'Рошан на 28-й — вот и весь перевес'], ['nikita', '9 мин', 'Если камбэк — лучшая серия дня']];
  // счётчики — стабильные от серии (пример)
  const base = M => { const s = M.s.series_id % 997; return { like: 900 + s * 3, talk: 120 + (s % 300), re: 40 + (s % 90), on: 1200 + s * 7 }; };
  const mine = M => (MINE[M.s.series_id] ||= { like: false, re: false, shared: false });

  function btn(M, k, label, withText) {
    const c = base(M), me = mine(M), v = k === 'share' ? null : c[k] + (me[k] ? 1 : 0);
    const text = k === 'share' ? (me.shared ? 'Ссылка скопирована' : 'Поделиться') : label;
    return `<button class="wsc-b${me[k] ? ' on' : ''}" data-wsc="${k}" aria-label="${label}">${IC[k]}${v != null ? `<span class="num">${n(v)}</span>` : ''}${withText ? `<em>${text}</em>` : ''}</button>`;
  }
  function html(o) {
    const M = o.M;
    // line — строка из 4 кнопок поровну, со счётчиками (телефон: над баром / вместе с баром, лаба v7–v8)
    // tb — кнопки в местах нижнего бара: значок, под ним счётчик (лаба v14); o.keys — какие
    if (o.look === 'tb') return `<div class="wsc wsc--tb">${o.keys.map(k => btn(M, k, { like: 'Нравится', talk: 'Комментарии', re: 'Репост', share: 'Поделиться' }[k], k === 'share')).join('')}</div>`;
    const L = { like: 'Нравится', talk: 'Комментарии', re: 'Репост', share: 'Поделиться' };
    if (o.look === 'line') return `<div class="wsc wsc--line">${(o.keys || ['like', 'talk', 're', 'share']).map(k => btn(M, k, L[k])).join('')}</div>`;
    // v20–v22: пилюля «Обсуждение» рядом с островом — pill (значок, слово, число) · round (круглая, число значком) · seg (половина общей капсулы с островом)
    const tk = `${IC.talk}<span class="num">${n(base(M).talk)}</span>`;
    if (o.look === 'pill') return `<button class="wsc wsc-pl" data-wsc="talk">${IC.talk}<b>Обсуждение</b><span class="num">${n(base(M).talk)}</span></button>`;
    if (o.look === 'round') return `<button class="wsc wsc-rd" data-wsc="talk" aria-label="Обсуждение">${IC.talk}<span class="num">${n(base(M).talk)}</span></button>`;
    // v23–v25 (дирижёр 27.10: «V22 логичный, только больше показателей и подумать, как вместе открываться»): в половине капсулы — Нравится (жмёшь — сразу лайк) и Обсуждение;
    // v25 — ещё «смотрят сейчас». Открытие — общая панель над капсулой (panel): pillsT — вкладки «Событие / Обсуждение» · pillsF — одной лентой: вопрос сверху, ниже комментарии ·
    // pillsO — без вкладок: что нажал, то и в панели, нажатая половина капсулы подсвечена
    if (o.look === 'seg' && o.mode !== 'pillsJ') return `<div class="wsc wsc-sg wsc-sg2">${o.mode === 'pillsO' ? `<span class="wsc-on">${IC.eye}<span class="num">${n(base(M).on)}</span></span>` : ''}${btn(M, 'like', L.like)}<button class="wsc-b" data-wsc="talk" aria-label="Обсуждение">${tk}</button></div>`;
    // v29–v31 (дирижёр 27.10: «капсула очень плохо выглядит — разбивать на пилюли и кнопки: отдельный круглый лайк, комментарии»): кнопки рядом с островом, каждая сама по себе.
    // pillsA — остров, круглый ♡, пилюля 💬 313 · pillsB — ♡ слева от острова, 💬 справа, числа значком · pillsC — остров, ♡, 💬, поделиться — три круглые · pillsG (v32) — как C, под ними матовое стекло · pillsH (v33) — как G, у бара своей подложки нет, стекло на весь низ · pillsI (v34) — как H, но стекло, а не чёрный
    if (o.look === 'btns') { const c = base(M), me = mine(M), on = k => (me[k] ? ' on' : '');
      const rb = (k, lbl, badge) => `<button class="wsc-r${on(k)}" data-wsc="${k}" aria-label="${lbl}">${IC[k]}${badge != null ? `<span class="num">${n(badge)}</span>` : ''}</button>`;
      const like = rb('like', L.like, c.like + (me.like ? 1 : 0)), talkR = rb('talk', 'Обсуждение', c.talk);
      return o.mode === 'pillsA' ? `${like}<button class="wsc-p2" data-wsc="talk">${IC.talk}<span class="num">${n(c.talk)}</span></button>`
        : o.mode === 'pillsB' ? `<span class="wsc-l">${like}</span><span class="wsc-rt">${talkR}</span>` : `${like}${talkR}${rb('share', me.shared ? 'Ссылка скопирована' : L.share)}`; }
    if (o.look === 'seg') return `<button class="wsc wsc-sg" data-wsc="talk" aria-label="Обсуждение">${tk}</button>`;
    if (o.look === 'ft') return `<div class="wsc wsc-ft">${btn(M, 'like', L.like)}${btn(M, 're', L.re)}<span class="wsc-sp"></span>${btn(M, 'share', L.share, true)}</div>`;
    // v19: окно комментариев — тут же Нравится, Репост, Поделиться
    if (o.look === 'dlg') return `<div class="wsc-dlg-hd"><b>Комментарии · ${n(base(M).talk)}</b><span class="wsc-ex">пример</span><button data-wsc-x aria-label="Закрыть">×</button></div>
      ${TALK.map(([who, t, x]) => `<div class="wsc-c"><b>${esc(who)}</b><small>${t}</small><p>${esc(x)}</p></div>`).join('')}
      <div class="wsc-in">Написать комментарий…</div><div class="wsc-ft">${btn(M, 'like', L.like)}${btn(M, 're', L.re)}<span class="wsc-sp"></span>${btn(M, 'share', L.share, true)}</div>`;
    if (o.look === 'rail') return `<div class="wsc wsc--rail">${btn(M, 'like', 'Нравится')}${btn(M, 'talk', 'Комментарии')}${btn(M, 're', 'Репост')}${btn(M, 'share', 'Поделиться')}</div>`;
    if (o.look === 'card') return `<section class="wsc wsc--card"><div class="wsc-hd"><b>Обсуждение</b><span class="wsc-ex">пример</span></div>
      ${TALK.slice(0, 2).map(([who, t, x]) => `<div class="wsc-c"><b>${esc(who)}</b><small>${t}</small><p>${esc(x)}</p></div>`).join('')}
      <button class="wsc-in" data-wsc="talk">Написать комментарий…</button>
      <div class="wsc-ft">${btn(M, 'like', 'Нравится')}${btn(M, 'talk', 'Комментарии')}${btn(M, 're', 'Репост')}${btn(M, 'share', 'Поделиться')}</div></section>`;
    return `<div class="wsc wsc--row">${btn(M, 'like', 'Нравится')}${btn(M, 'talk', 'Комментарии')}${btn(M, 're', 'Репост')}<span class="wsc-sp"></span>${btn(M, 'share', 'Поделиться', true)}<span class="wsc-ex">пример</span></div>`;
  }

  // комментарии — шторка снизу (телефон) / окно (компьютер)
  function talk(M) {
    let d = document.querySelector('.wsc-dlg');
    if (!d) { d = document.createElement('dialog'); d.className = 'wsc-dlg'; document.body.append(d); d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-wsc-x]')) d.close(); }); }
    d._wsc = { look: 'dlg', M }; d.setAttribute('data-wsc-host', ''); d.innerHTML = html(d._wsc);
    d.showModal();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-wsc]'), el = b && b.closest('[data-wsc-host]'); if (!el) return; e.preventDefault();
    const M = el._wsc.M, me = mine(M), k = b.dataset.wsc;
    if (k === 'talk') { if (el.matches('dialog')) return; return el._wsc.bar ? panel(el._wsc, 'talk') : talk(M); }
    if (k === 'share') { me.shared = true; setTimeout(() => { me.shared = false; paint(M); }, 2000); } else me[k] = !me[k];
    paint(M);
  });
  // v14: бар — две страницы (навигация / сообщество): точки или смахнул по бару
  const flip = () => document.querySelector('.tabbar.tb-s-pages')?.classList.toggle('pg-soc');
  document.addEventListener('click', e => { if (e.target.closest('[data-tbpg]')) { e.preventDefault(); flip(); } });
  let sx = null; document.addEventListener('pointerdown', e => { sx = e.target.closest('.tb-s-pages') ? e.clientX : null; });
  document.addEventListener('pointerup', e => { if (sx != null && Math.abs(e.clientX - sx) > 40) flip(); sx = null; });
  // v23–v25: общая панель над капсулой — событие острова и обсуждение. Вопрос рисует виджет острова (WBAR.side — тот же, что в правой колонке компьютера)
  const P = { o: null, tab: null };
  const pk = o => ({ pillsF: 'feed', pillsO: 'swap' })[o.mode] || 'tabs'; // вид панели: v23/v26 и v29–v31 — вкладки
  function panel(o, tab) {
    const same = P.tab === tab && document.querySelector('.wsp'); P.o = o; P.tab = tab;
    if (same && pk(o) !== 'tabs') return closePanel();
    let p = document.querySelector('.wsp');
    if (!p) { const d = document.createElement('div'); d.className = 'wsp-dim'; d.onclick = closePanel; p = document.createElement('section'); p.className = 'wsp'; document.body.append(d, p); }
    const M = o.M, e = o.bar().event, talkN = n(base(M).talk);
    // v26: под вопросом — лента событий идущей карты (настоящие: первая кровь, башни, Рошан, аегис, драки), новое сверху
    const fd = o.bar().feed || [], feed = fd.length ? `<div class="wsp-sub">На карте</div><div class="wsp-feed">${fd.map(f => `<div class="wsp-fi${f.big ? ' big' : ''}"><span class="wsp-fic k-${f.k}">${WBAR.icon(f.k)}</span><span class="wsp-ftx">${f.html}</span><small class="num">${f.t}</small></div>`).join('')}</div>` : '';
    const ev = `<div class="wsp-ev">${e ? '<div data-wsp-ev></div>' : '<p class="wsp-none">Сейчас вопроса нет — появится после события на карте: Рошан, башня, убийство</p>'}${feed}</div>`;
    const talk = `<div class="wsp-talk">${TALK.map(([who, t, x]) => `<div class="wsc-c"><b>${esc(who)}</b><small>${t}</small><p>${esc(x)}</p></div>`).join('')}<div class="wsc-in">Написать комментарий…</div><div data-wsp-ft></div></div>`;
    const x = '<button class="wsp-x" data-wsp-x aria-label="Закрыть">×</button>';
    const hd = pk(o) === 'tabs' ? `<div class="wsp-tabs"><button class="${tab === 'ev' ? 'on' : ''}" data-wsp-tab="ev">Событие${e ? ' <i class="wsp-dot"></i>' : ''}</button><button class="${tab === 'talk' ? 'on' : ''}" data-wsp-tab="talk">Обсуждение · ${talkN}</button>${x}</div>`
      : `<div class="wsp-hd"><b>${pk(o) === 'feed' ? 'Матч' : tab === 'ev' ? 'Событие' : `Обсуждение · ${talkN}`}</b><span class="wsc-ex">пример</span>${x}</div>`;
    const body = pk(o) === 'feed' ? ev + `<div class="wsp-sub">Обсуждение · ${talkN}</div>` + talk : tab === 'ev' ? ev : talk;
    p.innerHTML = hd + `<div class="wsp-bd">${body}</div>`;
    const evEl = p.querySelector('[data-wsp-ev]'); if (evEl) WBAR.side(evEl, o.bar());
    const ft = p.querySelector('[data-wsp-ft]'); if (ft) WSOC.render(ft, { look: 'ft', M });
    document.body.classList.add('wsp-open'); document.body.dataset.wsp = tab;
  }
  function closePanel() { document.querySelectorAll('.wsp, .wsp-dim').forEach(x => x.remove()); P.tab = null; document.body.classList.remove('wsp-open'); delete document.body.dataset.wsp; }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-wsp-x]')) return closePanel();
    const t = e.target.closest('[data-wsp-tab]'); if (t) return panel(P.o, t.dataset.wspTab);
    // остров в капсуле v23–v25 открывает ту же панель, а не свою карточку
    const isl = e.target.closest('.pl-panel .wb-isl'), host = isl && document.querySelector('.pl-panel [data-wsc-host]');
    if (isl && host && host._wsc.bar && host._wsc.mode !== 'pillsJ') { e.preventDefault(); e.stopImmediatePropagation(); panel(host._wsc, 'ev'); }
  }, true);
  // v16: перестал листать на 0,7 с — строка появляется, листаешь — прячется
  let it; const idle = () => { document.body.classList.remove('soc-idle'); clearTimeout(it); it = setTimeout(() => document.body.classList.add('soc-idle'), 700); };
  addEventListener('scroll', idle, { passive: true }); addEventListener('DOMContentLoaded', () => document.body.classList.add('soc-idle'));
  // v17: потянул бар вверх — шторка выезжает, вниз — уезжает
  let sy = null; document.addEventListener('pointerdown', e => { sy = e.target.closest('.tb-dock, .rm-sheet') ? e.clientY : null; });
  document.addEventListener('pointerup', e => { const sh = document.querySelector('.gm-rail.rm-sheet'); if (sy == null || !sh) return; const d = e.clientY - sy; sy = null;
    if (d < -30) sh.classList.add('is-open'); else if (d > 30) sh.classList.remove('is-open'); });
  // v6 / v13 / v15 / v17: ярлычок — открыть / закрыть
  document.addEventListener('click', e => { const t = e.target.closest('[data-rm="tab"]'); if (t) { e.preventDefault(); t.closest('.gm-rail').classList.toggle('is-open'); } });
  const paint = M => document.querySelectorAll('[data-wsc-host]').forEach(x => x._wsc.M.s.series_id === M.s.series_id && (x.innerHTML = html(x._wsc)));

  window.WSOC = { render(el, o) { el._wsc = o; el.setAttribute('data-wsc-host', ''); el.innerHTML = html(o); } };
})();
