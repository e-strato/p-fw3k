// w-bar v2–v5 — нижний бар, голосование и обсуждение в двух состояниях (дирижёр 26.10: «кардинально более сложные и интересные варианты;
// по-любому в двух состояниях — спокойным и когда прилетает какая-то штука: опрос или то, что обсуждать»). Задачи созвона 26.10 §7–§8.
// Вариант — window.WB_V: v2 «Остров» · v3 «Кнопка-таймер и стопка» · v4 «Карточка над баром» · v5 «Обсуждение».
// Панель: вид (телефон 390 / компьютер 1440), состояние (спокойно / прилетело событие), тумблер «Прилёт с анимацией» — проиграть появление заново.
// ‼️ Пример (в данных этого нет): Spirit — Vision, карта 3, 33:30; Рошан убит Spirit в 33:12; вопрос «Кто возьмёт следующую башню?», голоса, реакции, сообщения.
(() => {
  const V = window.WB_V || 'v2';
  const CFG = { view: 'phone', state: 'calm', anim: true, ans: null, open: false, react: null, shut: false, screen: 'match' };
  // v9 (дирижёр 26.10: «V2, но плашка зафиксирована жёстко по ширине — сейчас двигает, такого быть не должно; и как она выглядит на главной,
  // когда никакой матч не выбран») — остров одной ширины во всех состояниях; «Экран»: матч / главная, матчи идут / главная, ничего не идёт
  // v10–v12 (дирижёр 26.10: «база — v9, а карточку покрасивее, пару версий разных») — остров тот же, другая карточка события
  const CARD = { v10: 'teams', v11: 'big', v12: 'split' }[V];
  const V9 = V === 'v9' || !!CARD;
  const LOGO = { a: '../gs-match/img/teams/7119388.png', b: '../gs-match/img/teams/9572001.png' }; // Spirit, Vision
  const home = () => V9 && CFG.screen !== 'match';
  const EV = { what: 'Рошан убит', who: 'Spirit', at: '33:12', q: 'Кто возьмёт следующую башню?', a: 'Spirit', b: 'Vision', pa: 62, votes: 1240, talk: 84, T: 45 };
  const MSG = [['nefrit_fan', 'Аегис у Yatoro, сейчас пойдут на верх'], ['dota_dad', 'Vision без байбэков, тяжело'], ['ksu', 'ставлю на Spirit, 100%'], ['mira', 'Collapse опять всех поймал 😱']];
  const RE = [['🔥', 312], ['😱', 95], ['😂', 40], ['👏', 77]];
  let left = EV.T, tick = null, lastY = 0, barOff = false;
  const $ = s => document.querySelector(s);
  const I = {
    match: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    vote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    rosh: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="#eab308"/><circle cx="9" cy="12" r="1.4" fill="#000"/><circle cx="15" cy="12" r="1.4" fill="#000"/><path d="M5 7l2 3M19 7l-2 3" stroke="#eab308" stroke-width="2"/></svg>',
  };
  const ev = () => CFG.state === 'event';
  const pa = () => (CFG.ans === 'a' ? EV.pa + 1 : CFG.ans === 'b' ? EV.pa - 1 : EV.pa);
  const mmss = s => `0:${String(Math.max(0, s)).padStart(2, '0')}`;
  // кольцо таймера: сколько осталось на ответ
  const ring = (r = 22, w = 3) => { const c = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 ${2 * r + w * 2} ${2 * r + w * 2}"><circle cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="#3f3f46" stroke-width="${w}"/>
    <circle class="ring-v" cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="var(--gold)" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - left / EV.T)}" transform="rotate(-90 ${r + w} ${r + w})"/></svg>`; };
  // ответ одним касанием: две кнопки с живыми процентами (после ответа — видно, куда проголосовал)
  const answers = (cls = '') => `<div class="ans ${cls}">${[['a', EV.a, pa()], ['b', EV.b, 100 - pa()]].map(([k, n, p]) =>
    `<button class="an${CFG.ans === k ? ' pick' : ''}${CFG.ans ? ' shown' : ''}" data-ans="${k}"><i style="width:${CFG.ans ? p : 0}%"></i><span>${n}</span>${CFG.ans ? `<b class="num">${p}%</b>` : ''}</button>`).join('')}</div>`;
  const meta = () => `<span class="num">${(EV.votes + (CFG.ans ? 1 : 0)).toLocaleString('ru')} голосов</span><span>·</span><span>${EV.talk} обсуждают</span>`;
  const reacts = () => `<div class="re">${RE.map(([e, n], i) => `<button class="${CFG.react === i ? 'on' : ''}" data-re="${i}">${e}<span class="num">${n + (CFG.react === i ? 1 : 0)}</span></button>`).join('')}</div>`;
  const evLine = () => `<span class="evl">${I.rosh}<b>${EV.what}</b><span>${EV.who} · ${EV.at}</span></span>`;

  // страница-подложка: строка матча, график, кнопки сообщества, драфт, игроки
  // v9: главная — расписание, матч не выбран
  const homePage = () => `<div class="mline"><b>Матчи</b><span class="lv">сегодня</span></div>
    <div class="stack">${(CFG.screen === 'home' ? [['Spirit — Vision', '● карта 3 · 33:30'], ['Liquid — Falcons', '● карта 1 · 12:05'], ['Yandex — Nigma', '18:00'], ['BetBoom — Iron Wing', '20:30']]
      : [['Yandex — Nigma', '18:00'], ['BetBoom — Iron Wing', '20:30'], ['Liquid — Falcons', '22:00']]).map(([m, t]) => `<div class="ph hm"><b>${m}</b><span class="${t[0] === '●' ? 'lvt' : ''}">${t}</span></div>`).join('')}
    <div class="ph" style="height:160px">новости</div><div class="ph" style="height:200px">турниры</div></div>`;
  const page = () => home() ? homePage() : `<div class="mline"><b>Spirit</b>1:1<b>Vision</b><span class="lv">карта 3 · 33:30</span></div>
    <div class="stack"><div class="ph" style="height:36px">вкладки матча</div><div class="ph" style="height:200px">график золота</div>
    <div class="comm"><button>${I.chat}<span class="num">${EV.talk}</span></button><button>🔥<span class="num">312</span></button><span class="sp"></span><button class="ic">${I.share}</button></div>
    <div class="ph" style="height:150px">драфт</div><div class="ph" style="height:280px">игроки</div><div class="ph" style="height:200px">карты серии</div></div>`;
  const bar = (center) => `<nav class="bar${barOff ? ' off' : ''}"><button class="on">${I.match}Матчи</button><button>${I.cup}Турниры</button>${center}<button>${I.star}Фэнтези</button><button>${I.user}Профиль</button></nav>`;

  // ——— v2 «Остров»: в центре бара живая пилюля (счёт, время); прилетело — пилюля раскрывается вверх в карточку с вопросом, ответил — сжимается обратно ———
  function v2(desk) {
    const pill = home() && !ev() ? (CFG.screen === 'home' ? `<span class="lv-dot"></span><b>2 матча идут</b>` : `<span class="isl-off"></span><span>Ближайший</span><b class="num">18:00</b>`)
      : ev() && !CFG.open && !CFG.ans ? `<span class="isl-dot"></span><b>${home() ? 'Spirit — Vision' : EV.what}</b><span class="num">${mmss(left)}</span>`
      : CFG.ans ? `<span class="ok">✓</span><span>Ты: ${CFG.ans === 'a' ? EV.a : EV.b}</span><span class="num">${pa()}%</span>` : `<span class="lv-dot"></span><span class="num">33:30</span><b>Spirit +6.4k</b>`;
    const card = ev() && (CFG.open || desk) ? `<div class="isl-card${CFG.anim ? ' anim-up' : ''}">${home() ? '<div class="isl-from">Spirit — Vision · карта 3 · 33:30<button class="lnk">К матчу ›</button></div>' : ''}<div class="isl-hd">${evLine()}<span class="sp"></span>${ring(12, 3)}<span class="num t">${mmss(left)}</span></div>
      <p class="q">${EV.q}</p>${answers()}<div class="isl-ft">${meta()}</div>${reacts()}</div>` : '';
    const fix = V9 ? ' isl--fix' : '';
    const card2 = ev() && (CFG.open || desk) && CARD ? styled(home()) : card;
    if (CARD) { if (desk) return `<div class="isl-desk">${card2 || `<button class="isl${fix}" data-open>${pill}</button>`}</div>`;
      return `${card2 ? '<div class="dim" data-close></div>' : ''}${card2}${bar(`<button class="isl${fix}${ev() ? ' is-ev' : ''}${ev() && CFG.anim && !CFG.open ? ' anim-pop' : ''}" data-open>${pill}</button>`)}`; }
    if (desk) return `<div class="isl-desk">${card || `<button class="isl${fix}${ev() ? ' is-ev' : ''}${ev() && CFG.anim ? ' anim-pop' : ''}" data-open>${pill}</button>`}</div>`;
    return `${card ? '<div class="dim" data-close></div>' : ''}${card}${bar(`<button class="isl${fix}${ev() ? ' is-ev' : ''}${ev() && CFG.anim && !CFG.open ? ' anim-pop' : ''}" data-open>${pill}</button>`)}`;
  }

  // ——— v10–v12: карточка события в трёх видах ———
  function styled(fromHome) {
    const from = fromHome ? '<div class="isl-from">Spirit — Vision · карта 3 · 33:30<button class="lnk">К матчу ›</button></div>' : '';
    const p = { a: pa(), b: 100 - pa() }, N = { a: EV.a, b: EV.b }, total = `${(EV.votes + (CFG.ans ? 1 : 0)).toLocaleString('ru')} голосов · ${EV.talk} обсуждают`;
    const reMini = `<div class="re re--mini">${RE.map(([e, n], i) => `<button class="${CFG.react === i ? 'on' : ''}" data-re="${i}">${e}<span class="num">${n + (CFG.react === i ? 1 : 0)}</span></button>`).join('')}</div>`;
    const timeBar = `<div class="pc-time"><i style="width:${left / EV.T * 100}%"></i></div>`;
    if (CARD === 'teams') // v10 «Команды»: время тает полосой сверху; ответы — две плитки с логотипами; после ответа — проценты и заливка
      return `<div class="sc sc--teams${CFG.anim ? ' anim-up' : ''}">${timeBar}${from}<div class="sc-hd">${evLine()}<span class="sp"></span><span class="num t">${mmss(left)}</span></div>
        <p class="sc-q">${EV.q}</p><div class="sc-tiles">${['a', 'b'].map(k => `<button class="tile${CFG.ans === k ? ' pick' : ''}${CFG.ans ? ' shown' : ''}" data-ans="${k}"><i style="height:${CFG.ans ? p[k] : 0}%"></i>
          <img src="${LOGO[k]}" alt=""><span>${N[k]}</span>${CFG.ans ? `<b class="num">${p[k]}%</b>` : ''}</button>`).join('')}</div>
        <div class="sc-ft"><span>${total}</span><span class="sp"></span>${reMini}</div></div>`;
    if (CARD === 'big') // v11 «Вопрос крупно»: событие и вопрос по центру, крупный таймер; ответы — строками с логотипами; реакции — после ответа
      return `<div class="sc sc--big${CFG.anim ? ' anim-up' : ''}">${from}<div class="sc-top"><span class="sc-ic">${I.rosh}</span><span class="sc-ev"><b>${EV.what}</b> · ${EV.who}, ${EV.at}</span>
        <p class="sc-q">${EV.q}</p><span class="num t sc-big">${mmss(left)}</span></div>
        <div class="sc-rows">${['a', 'b'].map(k => `<button class="row${CFG.ans === k ? ' pick' : ''}" data-ans="${k}"><i style="width:${CFG.ans ? p[k] : 0}%"></i><img src="${LOGO[k]}" alt=""><span>${N[k]}</span>${CFG.ans ? `<b class="num">${p[k]}%</b>` : '<em>›</em>'}</button>`).join('')}</div>
        <div class="sc-ft sc-ft--c">${CFG.ans ? reMini : `<span>${total}</span>`}</div></div>`;
    // v12 «Раскол»: как рынок прогнозов — сразу видно, как голосуют все; нажал на свою сторону — твой голос
    return `<div class="sc sc--split${CFG.anim ? ' anim-up' : ''}">${from}<div class="sc-hd">${evLine()}<span class="sp"></span>${ring(10, 3)}<span class="num t">${mmss(left)}</span></div>
      <p class="sc-q">${EV.q}</p>
      <div class="split">${['a', 'b'].map(k => `<button class="sp-side sp-${k}${CFG.ans === k ? ' pick' : ''}" style="flex:${p[k]}" data-ans="${k}"><img src="${LOGO[k]}" alt=""><span>${N[k]}</span><b class="num">${p[k]}%</b></button>`).join('')}</div>
      <div class="sc-ft"><span>${CFG.ans ? `Ты: ${N[CFG.ans]} · ` : 'Нажми на свою сторону · '}${total}</span></div>${reMini}</div>`;
  }

  // ——— v3 «Кнопка-таймер и стопка»: плавающая кнопка; прилетело — на ней кольцо таймера, над ней стопка карточек: вопрос, Рошан, итог прошлого прогноза ———
  function v3(desk) {
    const toasts = ev() ? [
      `<div class="ts ts--q${CFG.open ? ' open' : ''}"><div class="ts-hd" data-open><span class="ts-i">?</span><b>${EV.q}</b><span class="num t">${mmss(left)}</span></div>${CFG.open || CFG.ans ? answers('sm') : ''}</div>`,
      `<div class="ts"><div class="ts-hd">${I.rosh}<b>${EV.what} · ${EV.who}</b><span class="t">${EV.at}</span></div></div>`,
      `<div class="ts ts--ok"><div class="ts-hd"><span class="ts-i ok">✓</span><b>Прогноз «Первый Рошан — Spirit» сбылся</b><span class="t">+40</span></div></div>`] : [];
    const stack = toasts.length ? `<div class="tstack${CFG.anim ? ' anim-stack' : ''}">${toasts.join('')}</div>` : '';
    const fab = `<button class="fab3${ev() ? ' is-ev' : ''}" data-open>${ev() ? ring(26, 3) : ''}<span class="vbtn">${I.vote}</span>${ev() ? '<span class="n">3</span>' : ''}</button>`;
    if (desk) return `<div class="d3">${stack || '<div class="d3-calm">Пока тихо. Новые вопросы прилетят сюда — с таймером на ответ</div>'}</div>`;
    return `${stack}${fab}${bar('')}`;
  }

  // ——— v4 «Карточка над баром»: спокойно — тонкая полоска с итогом прошлого прогноза; прилетело — над баром выезжает карточка: вопрос, ответ в одно касание, время тает ———
  function v4(desk) {
    const calm = `<div class="peek"><span class="ok">✓</span><span>Прогноз «Первая кровь — Spirit» сбылся</span><span class="sp"></span><b class="num">+25</b></div>`;
    const card = `<div class="pc${CFG.anim ? ' anim-up' : ''}"><div class="pc-time"><i style="width:${left / EV.T * 100}%"></i></div>
      <div class="pc-hd">${evLine()}<span class="sp"></span><span class="num t">${mmss(left)}</span></div><p class="q">${EV.q}</p>${answers()}
      <div class="pc-ft">${meta()}<span class="sp"></span><button class="lnk">Обсудить ›</button></div></div>`;
    if (desk) return `<div class="d4">${ev() ? card : calm}</div>`;
    return `<div class="pcwrap${barOff ? ' low' : ''}">${ev() ? card : calm}</div>${bar(`<button class="vote">${I.vote}Прогнозы</button>`)}`;
  }

  // ——— v5 «Обсуждение»: спокойно — над баром бегущая строка последних сообщений; прилетело — открывается обсуждение: сверху закреплён вопрос, ниже лента и реакции ———
  function v5(desk) {
    const pin = `<div class="pin${CFG.anim ? ' anim-pin' : ''}"><div class="pin-hd">${evLine()}<span class="sp"></span>${ring(10, 3)}<span class="num t">${mmss(left)}</span></div><p class="q">${EV.q}</p>${answers('sm')}<div class="pin-ft">${meta()}</div></div>`;
    const feed = `<div class="feed">${(ev() ? [['GoatScout', `${EV.what} — ${EV.who}, ${EV.at}. Голосуй, кто возьмёт следующую башню`, 1], ...MSG] : MSG.slice(1)).map(([u, t, sys]) =>
      `<div class="msg${sys ? ' sys' : ''}"><b>${u}</b><span>${t}</span></div>`).join('')}</div>`;
    const chat = `<div class="chat${CFG.open || ev() ? ' open' : ''}">${desk ? '' : '<div class="grab" data-open></div>'}<div class="chat-hd"><b>Обсуждение</b><span class="num">${EV.talk + (ev() ? 12 : 0)}</span><span class="sp"></span>${desk ? '' : '<button class="x" data-close>×</button>'}</div>
      ${ev() ? pin : ''}${feed}${reacts()}<div class="inp">Написать…</div></div>`;
    const ticker = `<button class="tick" data-open>${I.chat}<span class="tk"><span>${MSG.map(([u, t]) => `<b>${u}</b> ${t}`).join(' · ')}</span></span><span class="num">${EV.talk}</span></button>`;
    if (desk) return `<div class="d5">${chat}</div>`;
    return `${(ev() && !CFG.shut) || CFG.open ? '<div class="dim" data-close></div>' + chat : ticker}${bar(`<button class="vote">${I.chat}Чат</button>`)}`;
  }

  const VIEW = { v2, v3, v4, v5, v9: v2, v10: v2, v11: v2, v12: v2 };
  function render() {
    const keep = $('.scr') ? $('.scr').scrollTop : 0;
    if (CFG.view === 'desk') {
      document.body.innerHTML = `<div class="desk ${V}"><div class="main">${page()}</div><aside class="side">${VIEW[V](true)}<div class="ph" style="height:240px;margin-top:12px">турнир</div><div class="ph" style="height:160px;margin-top:12px">новости</div></aside></div>`;
    } else {
      document.body.innerHTML = `<div class="phone ${V}"><div class="scr">${page()}</div>${VIEW[V](false)}</div>`;
      const sc = $('.scr'); sc.scrollTop = keep;
      sc.onscroll = () => { const y = sc.scrollTop, d = y - lastY; if (Math.abs(d) > 6) { const off = d > 0 && y > 40; if (off !== barOff) { barOff = off; const b = $('.bar'); b && b.classList.toggle('off', off); const w = $('.pcwrap'); w && w.classList.toggle('low', off); } lastY = y; } };
    }
    document.querySelectorAll('[data-ans]').forEach(b => b.onclick = e => { e.stopPropagation(); CFG.ans = b.dataset.ans; if (V === 'v2') CFG.open = false; CFG.anim = false; render(); });
    document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { CFG.open = !CFG.open; CFG.anim = true; render(); });
    document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { CFG.open = false; CFG.shut = true; render(); });
    document.querySelectorAll('[data-re]').forEach(b => b.onclick = () => { CFG.react = CFG.react === +b.dataset.re ? null : +b.dataset.re; CFG.anim = false; render(); });
  }
  // таймер ответа: тикает только в «прилетело», дошёл до нуля — вопрос закрыт (ответ — проценты без выбора)
  function run() {
    clearInterval(tick); left = EV.T; CFG.ans = null; CFG.shut = false; CFG.open = ev() && V === 'v2' ? false : CFG.open && ev();
    if (ev()) tick = setInterval(() => { if (left > 0) { left--; document.querySelectorAll('.t').forEach(t => { if (/^0:\d\d$/.test(t.textContent)) t.textContent = mmss(left); });
      document.querySelectorAll('.ring-v').forEach(c => { const len = +c.getAttribute('stroke-dasharray'); c.setAttribute('stroke-dashoffset', len * (1 - left / EV.T)); });
      document.querySelectorAll('.pc-time i').forEach(i => (i.style.width = left / EV.T * 100 + '%'));
      document.querySelectorAll('.isl b + .num').forEach(t => (t.textContent = mmss(left))); } }, 1000);
    render();
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      ...(V9 ? [{ key: 'screen', name: 'Экран', value: CFG.screen, options: [{ v: 'match', label: 'Матч' }, { v: 'home', label: 'Главная · матчи идут' }, { v: 'quiet', label: 'Главная · ничего не идёт' }] }] : []),
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'calm', label: 'Спокойно' }, { v: 'event', label: 'Прилетело событие' }] },
    ],
    set(key, v) { CFG[key] = v; CFG.anim = true; if (key === 'state') run(); else render(); },
    toggles: () => [{ key: 'anim', name: 'Прилёт с анимацией', value: CFG.anim }],
    toggle() { CFG.anim = !CFG.anim; if (CFG.anim && ev()) run(); else render(); },
    caption: () => (V9 && CFG.screen !== 'match' ? 'Главная: матч не выбран. Прилетело — событие матча, на который ты подписан (Spirit — Vision); в карточке — «К матчу». ' : '') + 'Пример: Spirit — Vision, карта 3, 33:30. «Прилетело событие» — Рошан убит, вопрос «Кто возьмёт следующую башню?», 45 секунд на ответ',
  };
  run();
})();
