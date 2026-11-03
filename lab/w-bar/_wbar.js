// DB_FAKE: если на странице есть выдуманная база (_db/_fake.js) — данные отсюда берутся из неё (одно место для выдумки); нет — как было
// w-bar — виджет «Остров» нижнего бара (лаба w-bar, выбран v11 «Вопрос крупно», дирижёр 26.10: «пока v11 переноси в продукт»).
// Один код для лабы и страницы матча (gs-match, GS_BAR = 'w'):
//   WBAR.island(o) — HTML пилюли для центра бара: одна ширина во всех состояниях (идёт / до / после / главная), прилетело событие — светится золотом, таймер;
//   нажал — над баром карточка: событие, вопрос и крупный таймер по центру, ответы строками с логотипами, после ответа — проценты и реакции;
//   WBAR.side(el, o) — компьютер: то же в правой колонке (карточка сразу открыта). Карточка телефона — в слое o.layer (страница — фиксированный на весь экран).
// o: pill — { kind: live | pre | post | home | quiet, time, lead, start, score }, event — { id, what, who, at, q, a: { name, logo }, b, pa, votes, talk, T } | null, base — путь к картинкам.
(() => {
  const S = { o: null, open: false, ans: null, react: null, left: 0, ev: null, tick: null, anim: true };
  const RE = window.DB_FAKE?.reactions.bar ?? [['🔥', 312], ['😱', 95], ['😂', 40], ['👏', 77]]; // ‼️ пример: реакций в данных нет
  const ROSH = '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="#eab308"/><circle cx="9" cy="12" r="1.4" fill="#000"/><circle cx="15" cy="12" r="1.4" fill="#000"/><path d="M5 7l2 3M19 7l-2 3" stroke="#eab308" stroke-width="2"/></svg>';
  const mmss = s => `0:${String(Math.max(0, s)).padStart(2, '0')}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const pa = () => { const e = S.o.event; return S.ans === 'a' ? e.pa + 1 : S.ans === 'b' ? e.pa - 1 : e.pa; };

  // вид текста в острове (лаба w-island, дирижёр 27.10: «текст в острове стрёмно выглядит»): o.look / window.WB_LOOK —
  // '' как было · big — крупнее и ровнее · two — две строки: что (мелко) и значение (крупно) · logos — логотипы команд вместо названий
  const look = () => S.o.look || window.WB_LOOK || '';

  // лаба w-barst v3–v5 (дирижёр 27.10: «чтобы текст не обрезался… событие — просто Убит или Рошан и иконка… везде больше иконок, нажмёт — посмотрит инфу»):
  // ic — значок и одно слово · ring — то же, таймер вопроса кольцом вокруг значка · chip — каждое состояние начинается цветным кружком со значком
  const I = (d, f) => `<svg class="wb-i" viewBox="0 0 24 24" fill="${f || 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    rosh: I('<path d="M5 4l2.5 4M19 4l-2.5 4"/><path d="M12 7a6.5 6.5 0 0 0-6.5 6.5c0 2.6 1.6 4.8 4 5.8V21h5v-1.7c2.4-1 4-3.2 4-5.8A6.5 6.5 0 0 0 12 7z"/><path d="M9.5 13h.01M14.5 13h.01" stroke-width="3"/>'),
    kill: I('<path d="M5 19L17 7M17 7V4h3v3h-3M8 13l3 3M4 20l2-2"/><path d="M19 19L7 7M7 7V4H4v3h3M16 13l-3 3M20 20l-2-2"/>'),
    tower: I('<path d="M6 21h12M8 21l1-10h6l1 10M8 11V4h2v2h1.5V4h1v2H14V4h2v7"/>'),
    pause: I('<rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/>', 'currentColor'),
    eyeOff: I('<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-2.6 3.2M6.4 7.6C4.3 9.1 3 12 3 12s4 6 9 6c1.4 0 2.7-.4 3.8-1"/>'),
    noSig: I('<path d="M5 20v-2M10 20v-5M15 20v-8M20 20V8M3 4l18 15"/>'),
    ask: I('<circle cx="12" cy="12" r="9"/><path d="M9.7 9.5a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.7M12 17h.01"/>'),
    later: I('<circle cx="11" cy="12" r="8"/><path d="M11 8v4l2.5 1.5M19 4l2 2-2 2"/>'),
    off: I('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    cup: I('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6"/>'),
    ok: I('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
    ppl: I('<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5"/><circle cx="16.5" cy="8.5" r="2.5"/><path d="M16 14.5c2.2 0 4 1.3 4.5 4"/>'),
  };
  const HOT = 10; // последние секунды на ответ — красным
  function model() {
    const o = S.o, e = o.event, p = o.pill || {}, B = o.base || '', lg = t => (t && t.logo ? `<img class="wb-lg" src="${B + t.logo}" alt="">` : '');
    const n = v => `<span class="num">${esc(v)}</span>`;
    if (e && S.ans) return { ic: 'ok', tone: 'up', body: `${lg(e[S.ans])}<span class="wb-mut">${IC.ppl}</span><b class="num">${S.ans === 'a' ? pa() : 100 - pa()}%</b>` };
    if (e) return { ic: e.ic || 'rosh', tone: S.left <= HOT ? 'dn' : 'gold', ev: true, body: `<b>${esc(e.short || e.what)}</b>` };
    if (p.kind === 'live') {
      if (p.paused) return { ic: 'pause', tone: 'amber', body: `<b>Пауза</b>${n(p.time)}` };
      if (p.nodata) return { ic: 'noSig', tone: 'mute', body: `<span>${esc(p.time)}</span><small class="wb-mut">нет данных</small>` };
      if (p.hid) return { ic: 'live', tone: 'dn', body: `${n(p.time)}<span class="wb-mut">${IC.eyeOff}</span>` };
      return { ic: 'live', tone: 'dn', body: p.leadTeam ? `${n(p.time)}${lg(p.leadTeam)}<b class="num">+${esc(p.leadBy)}</b>` : `${n(p.time)}<span class="wb-mut">ровно</span>` };
    }
    // лаба w-header-2 v8 (дирижёр 28.10: «внизу не счёт, а время»; «после матча — не карта 3, а победитель»): WB_POST = 'time' — в итоге кубок и лого победителя, без подписи («победитель — иконкой») (счёт — в шапке)
    if (p.kind === 'post' && window.WB_POST === 'time' && !p.hid) { const [x, y] = String(p.score).split(':').map(Number), w = x > y ? p.a : p.b; return { ic: 'cup', tone: 'gold', body: lg(w) }; } // кубок — золотой (дирижёр 28.10)
    if (p.kind === 'post') return { ic: 'cup', tone: 'mute', body: p.hid ? `${lg(p.a)}<span class="wb-mut">${IC.eyeOff}</span>${lg(p.b)}` : `${lg(p.a)}<b class="num wb-sc">${esc(p.score).replace(':', ' : ')}</b>${lg(p.b)}` };
    if (p.why === 'announce') return { ic: 'ask', tone: 'mute', body: '<span>Уточняется</span>' };
    if (p.why === 'delayed') return { ic: 'later', tone: 'amber', body: `<span>Перенос</span><b class="num">${esc(p.start)}</b>` };
    if (p.why === 'cancel') return { ic: 'off', tone: 'dn', body: '<span>Отменён</span>' };
    return { ic: 'clock', tone: 'mute', body: `${lg(p.a)}<b class="num">${esc(p.start)}</b>${lg(p.b)}` };
  }
  // кольцо: сколько осталось на ответ (r = 12 → длина 75.4)
  const RING = 75.4, ringOff = () => (S.o.event ? RING * (1 - Math.max(0, S.left) / S.o.event.T) : 0);
  function pillIc(L) {
    const m = model(), timer = m.ev ? `<span class="num wb-t">${mmss(S.left)}</span>` : '';
    const lead = m.ic === 'live' ? '<span class="wb-dot"></span>' : IC[m.ic];
    if (L === 'chip') return `<span class="wb-chip t-${m.tone}">${m.ic === 'live' ? '<i class="wb-live"></i>' : IC[m.ic]}</span>${m.body}${timer}`;
    if (L === 'ring' && m.ev) return `<span class="wb-ring t-${m.tone}"><svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="12"/><circle class="wb-rg" cx="14" cy="14" r="12" style="stroke-dasharray:${RING};stroke-dashoffset:${ringOff()}"/></svg>${IC[m.ic]}</span>${m.body}`;
    return `<span class="wb-ld t-${m.tone}">${lead}</span>${m.body}${timer}`;
  }
  function pill() {
    const L = look(), p = S.o.pill || {};
    if (L === 'ic' || L === 'ring' || L === 'chip') return pillIc(L);
    if (!L || L === 'big' || (S.o.event && !S.ans)) return pill0();
    const B = S.o.base || '', lg = t => (t && t.logo ? `<img class="wb-lg" src="${B + t.logo}" alt="">` : '');
    const lead = p.leadTeam ? `${lg(p.leadTeam)}<b class="num">+${esc(p.leadBy)}</b>` : '';
    if (L === 'two') {
      const two = (cap, val, dot) => `${dot || ''}<span class="wb-2"><small>${cap}</small><b class="num">${val}</b></span>`;
      if (S.o.event && S.ans) return two('Твой ответ', `${esc(S.o.event[S.ans].name)} · ${S.ans === 'a' ? pa() : 100 - pa()}%`, '<span class="ok">✓</span>');
      if (p.kind === 'live') return two(p.leadTeam ? `${esc(p.leadTeam.name)} впереди` : 'Идёт', esc(p.time) + (p.leadTeam ? ' · +' + esc(p.leadBy) : ''), '<span class="wb-dot"></span>');
      if (p.kind === 'post') return two('Итог серии', esc(p.score));
      if (p.kind === 'pre') return two('Начало', esc(p.start));
      return pill0();
    }
    // logos
    if (S.o.event && S.ans) return `<span class="ok">✓</span>${lg(S.o.event[S.ans])}<b class="num">${S.ans === 'a' ? pa() : 100 - pa()}%</b>`;
    if (p.kind === 'live') return `<span class="wb-dot"></span><span class="num">${esc(p.time)}</span>${lead}`;
    if (p.kind === 'post') return `${lg(p.a)}<b class="num wb-sc">${esc(p.score).replace(':', ' : ')}</b>${lg(p.b)}`;
    if (p.kind === 'pre') return `${lg(p.a)}<b class="num">${esc(p.start)}</b>${lg(p.b)}`;
    return pill0();
  }
  function pill0() {
    const o = S.o, e = o.event, p = o.pill || {};
    if (e && S.ans) return `<span class="ok">✓</span><span>Ты: ${esc(e[S.ans].name)}</span><span class="num">${S.ans === 'a' ? pa() : 100 - pa()}%</span>`;
    if (e) return `<span class="wb-dot is-ev"></span><b>${esc(p.kind === 'home' || p.kind === 'quiet' ? e.match : e.what)}</b><span class="num wb-t">${mmss(S.left)}</span>`;
    if (p.kind === 'live') return `<span class="wb-dot"></span><span class="num">${esc(p.time)}</span>${p.lead ? `<b>${esc(p.lead)}</b>` : ''}`;
    if (p.kind === 'pre') return `<span class="wb-dot is-off"></span><span>Начало</span><b class="num">${esc(p.start)}</b>`;
    if (p.kind === 'post') return `<span class="wb-dot is-off"></span><span>Итог</span><b class="num">${esc(p.score)}</b>`;
    if (p.kind === 'home') return `<span class="wb-dot"></span><b>${esc(p.text || 'Матчи идут')}</b>`;
    return `<span class="wb-dot is-off"></span><span>Ближайший</span><b class="num">${esc(p.start || '—')}</b>`;
  }
  const islandHtml = () => { const e = S.o.event, glow = e && !S.ans;
    return `<button class="wb-isl${look() ? ' wb-isl--' + look() : ''}${glow ? ' is-ev' : ''}${glow && S.left <= HOT && /ic|ring|chip/.test(look()) ? ' is-hot' : ''}${glow && S.anim && !S.open ? ' anim-pop' : ''}" data-wb="open" aria-label="${e ? 'Вопрос: ' + esc(e.q) : 'Матч'}">${pill()}</button>`; };

  // карточка: событие, вопрос и крупный таймер по центру; ответы — строками с логотипами; реакции — после ответа
  function card(desk) {
    const o = S.o, e = o.event, p = { a: pa(), b: 100 - pa() }, B = o.base || '';
    const from = o.pill && (o.pill.kind === 'home' || o.pill.kind === 'quiet') ? `<div class="wb-from">${esc(e.match)}<button class="wb-lnk">К матчу ›</button></div>` : '';
    const total = `${(e.votes + (S.ans ? 1 : 0)).toLocaleString('ru')} голосов · ${e.talk} обсуждают`;
    const re = `<div class="wb-re">${RE.map(([x, n], i) => `<button class="${S.react === i ? 'on' : ''}" data-wb="re" data-i="${i}">${x}<span class="num">${n + (S.react === i ? 1 : 0)}</span></button>`).join('')}</div>`;
    return `<div class="wb-card${desk ? ' is-desk' : ''}${S.anim ? ' anim-up' : ''}">${from}<div class="wb-top"><span class="wb-ic">${ROSH}</span><span class="wb-ev"><b>${esc(e.what)}</b> · ${e.who ? esc(e.who) + ', ' : ''}${esc(e.at)}</span>
      <p class="wb-q">${esc(e.q)}</p><span class="num wb-t wb-big">${mmss(S.left)}</span></div>
      <div class="wb-rows">${['a', 'b'].map(k => `<button class="wb-row${S.ans === k ? ' pick' : ''}" data-wb="ans" data-k="${k}"><i style="width:${S.ans ? p[k] : 0}%"></i><img src="${B + e[k].logo}" alt=""><span>${esc(e[k].name)}</span>${S.ans ? `<b class="num">${p[k]}%</b>` : '<em>›</em>'}</button>`).join('')}</div>
      <div class="wb-ft">${S.ans ? re : `<span>${total}</span>`}</div></div>`;
  }

  function paint() {
    document.querySelectorAll('.wb-isl').forEach(el => (el.outerHTML = islandHtml()));
    const L = S.o && S.o.layer; if (L) L.innerHTML = S.o.event && S.open ? `<div class="wb-dim" data-wb="close"></div>${card(false)}` : '';
    document.querySelectorAll('[data-wb-side]').forEach(el => side(el));
  }
  function side(el) { el.innerHTML = `<div class="wb-side">${S.o.event ? card(true) : islandHtml()}</div>`; }

  // событие сменилось — таймер заново; дошёл до нуля — вопрос закрыт (видны проценты)
  function setEvent(o) {
    const id = o.event ? o.event.id : null; if (id === S.ev) return; S.ev = id; S.ans = null; S.react = null; S.open = false; S.anim = true; clearInterval(S.tick);
    if (!o.event) return; S.left = o.event.T;
    S.tick = setInterval(() => { if (S.left <= 0) return clearInterval(S.tick); S.left--; document.querySelectorAll('.wb-t').forEach(t => (t.textContent = mmss(S.left)));
      document.querySelectorAll('.wb-rg').forEach(c => (c.style.strokeDashoffset = ringOff())); if (S.left === HOT && /ic|ring|chip/.test(look())) paint(); }, 1000);
  }

  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-wb]'); if (!b || !S.o) return; ev.preventDefault();
    const a = b.dataset.wb; S.anim = a === 'open';
    if (a === 'open') { if (!S.o.event || S.ans) return; S.open = !S.open; }
    if (a === 'close') S.open = false;
    if (a === 'ans') { if (S.left <= 0) return; S.ans = b.dataset.k; }
    if (a === 're') S.react = S.react === +b.dataset.i ? null : +b.dataset.i;
    paint();
  });

  // кнопки бара (лаба w-island, дирижёр 27.10: «подписи бара стрёмно выглядят»): look — '' символы ▦ ⌕ ★ ◉ · svg — рисованные значки с подписью · bare — только значки
  const SV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const TI = { Матчи: SV('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'), Поиск: SV('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
    Фэнтези: SV('<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>'), Я: SV('<circle cx="12" cy="9" r="4"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"/>') };
  TI.Войти = TI.Я;
  const tabs = o => [['▦', 'Матчи', 1], ['⌕', 'Поиск'], ['★', 'Фэнтези'], ['◉', o.auth ? 'Я' : 'Войти']].map(([i, n, on]) =>
    `<a href="#" ${on ? 'aria-current="page" data-a="back"' : n === 'Войти' ? 'data-a="login" data-v="Войди через Telegram — очки, прогнозы и напоминания сохранятся"' : `data-a="toast" data-v="${n} (демо)"`}${o.look ? ` aria-label="${n}"` : ''}>${o.look ? `${TI[n]}<span>${n}</span>` : `<i>${i}</i>${n}`}</a>`);

  window.WBAR = {
    tabs,
    icon: k => IC[k] || '', // значки событий — и для ленты в панели w-social
    icon: k => IC[k] || '', // значки событий — и для ленты в панели w-social
    // лаба w-barst: остров без общего состояния — много баров на одном экране; st — { ans: 'a' | 'b' | null, left: секунды таймера }
    still(o, st = {}) { const keep = { ...S }; Object.assign(S, { o, ans: st.ans || null, left: st.left ?? (o.event ? o.event.T : 0), open: false, anim: false });
      const h = islandHtml(); Object.assign(S, keep); return h; },
    island(o) { S.o = o; setEvent(o); queueMicrotask(paint); return islandHtml(); },
    side(el, o) { S.o = { ...o, layer: (S.o && S.o.layer) || o.layer }; setEvent(o); el.setAttribute('data-wb-side', ''); side(el); },
  };
})();
