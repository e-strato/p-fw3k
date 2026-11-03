// w-bar v6–v8 — новые концепты после v2 «Остров» (дирижёр 26.10: «V2 очень понравился — не перекрывает экран и сразу понятно; остальные убрать;
// нужны ещё версии — не копии v2, а концептуально новые»). Общее с v2: ничего не ложится поверх контента, два состояния — спокойно / прилетело событие.
// Вариант — window.WB_V: v6 «Строка в шапке» · v7 «Карточка в ленте» · v8 «Бар становится ответами». Общий вид — _x.css (как у v2), своё — _y.css.
// ‼️ Пример (в данных этого нет): Spirit — Vision, карта 3, 33:30; Рошан убит Spirit в 33:12; вопрос «Кто возьмёт следующую башню?», 45 с, голоса.
(() => {
  const V = window.WB_V || 'v6';
  const CFG = { view: 'phone', state: 'calm', anim: true, ans: null, gone: false };
  const EV = { what: 'Рошан убит', who: 'Spirit', at: '33:12', q: 'Кто возьмёт следующую башню?', a: 'Spirit', b: 'Vision', pa: 62, votes: 1240, T: 45 };
  let left = EV.T, tick = null, lastY = 0, barOff = false, at = 1;
  const $ = s => document.querySelector(s);
  const I = {
    match: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    rosh: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="#eab308"/><circle cx="9" cy="12" r="1.4" fill="#000"/><circle cx="15" cy="12" r="1.4" fill="#000"/><path d="M5 7l2 3M19 7l-2 3" stroke="#eab308" stroke-width="2"/></svg>',
  };
  const ev = () => CFG.state === 'event' && !CFG.gone;
  const pa = () => (CFG.ans === 'a' ? EV.pa + 1 : CFG.ans === 'b' ? EV.pa - 1 : EV.pa);
  const mmss = s => `0:${String(Math.max(0, s)).padStart(2, '0')}`;
  const pick = () => (CFG.ans === 'a' ? EV.a : EV.b);
  // итог после ответа — одна строка: что выбрал, сколько так же, сколько осталось до закрытия
  const done = () => `<span class="ok">✓</span><span>Ты: <b>${pick()}</b></span><span class="num">${CFG.ans === 'a' ? pa() : 100 - pa()}% так же</span><span class="sp"></span><span class="num mut">итог через ${mmss(left)}</span>`;
  const answers = cls => `<div class="ans ${cls || ''}">${[['a', EV.a], ['b', EV.b]].map(([k, n]) => `<button class="an" data-ans="${k}"><span>${n}</span></button>`).join('')}</div>`;

  // страница-подложка: строка матча (липкая), вкладки, график, драфт, игроки, карты; slot — куда v7 вставляет карточку
  const head = extra => `<div class="y-head${V === 'v6' && ev() ? ' is-ev' : ''}"><div class="mline"><b>Spirit</b><span class="num">1:1</span><b>Vision</b><span class="lv">карта 3 · 33:30</span></div>${extra || ''}</div>`;
  const BLOCKS = [['вкладки матча', 36], ['график золота', 200], ['драфт', 150], ['игроки', 280], ['карты серии', 200], ['новости', 160]];
  const page = (slot, i0) => BLOCKS.map(([n, h], i) => `<div class="ph" style="height:${h}px">${n}</div>${i === i0 ? slot : ''}`).join('');
  const bar = () => `<nav class="bar${barOff ? ' off' : ''}"><button class="on">${I.match}Матчи</button><button>${I.cup}Турниры</button><button>${I.star}Фэнтези</button><button>${I.user}Профиль</button></nav>`;

  // ——— v6 «Строка в шапке»: событие живёт в липкой строке матча — она вырастает на одну строку с вопросом и ответом; ответил — строка сжимается до итога ———
  function v6(desk) {
    const row = !ev() ? '' : CFG.ans ? `<div class="hq hq--done">${done()}</div>`
      : `<div class="hq${CFG.anim ? ' anim-grow' : ''}"><div class="hq-q">${I.rosh}<span><b>${EV.q}</b><small>${EV.what} · ${EV.who} · ${EV.at}</small></span></div>
          <div class="hq-a">${answers('hq-ans')}<span class="num t">${mmss(left)}</span></div><i class="hq-time" style="width:${left / EV.T * 100}%"></i></div>`;
    const h = head(row);
    if (desk) return { main: `${h}<div class="stack">${page('', -1)}</div>`, side: '' };
    return `<div class="scr">${h}<div class="stack">${page('', -1)}</div></div>${bar()}`;
  }

  // ——— v7 «Карточка в ленте»: вопрос встаёт прямо в страницу — под тем блоком, который сейчас перед глазами; страница раздвигается, поверх ничего нет ———
  function v7(desk) {
    const card = !ev() ? '' : CFG.ans ? `<div class="fc fc--done">${done()}</div>`
      : `<div class="fc${CFG.anim ? ' anim-open' : ''}"><div class="fc-hd">${I.rosh}<span><b>${EV.what}</b> · ${EV.who} · ${EV.at}</span><span class="sp"></span><span class="num t">${mmss(left)}</span></div>
          <p class="q">${EV.q}</p>${answers()}<div class="fc-time"><i style="width:${left / EV.T * 100}%"></i></div></div>`;
    if (desk) return { main: `${head()}<div class="stack">${page(card, 1)}</div>`, side: '' };
    return `<div class="scr">${head()}<div class="stack">${page(card, at)}</div></div>${bar()}`;
  }

  // ——— v8 «Бар становится ответами»: нижний бар сам превращается в две половины-ответа, над ними — вопрос, по краю тает время; ответил — снова вкладки ———
  function v8(desk) {
    const ansBar = `<nav class="bar bar--q${barOff ? ' off' : ''}${CFG.anim ? ' anim-morph' : ''}"><i class="bq-time" style="width:${left / EV.T * 100}%"></i>
      <div class="bq-q">${I.rosh}<b>${EV.q}</b><span class="num t">${mmss(left)}</span></div>
      <div class="bq-a">${[['a', EV.a], ['b', EV.b]].map(([k, n]) => `<button class="bq-h bq-h--${k}" data-ans="${k}">${n}</button>`).join('<span class="bq-or">или</span>')}</div></nav>`;
    const doneBar = `<nav class="bar${barOff ? ' off' : ''}"><button class="on">${I.match}Матчи</button><button>${I.cup}Турниры</button>
      <button class="bq-done">${'<span class="ok">✓</span>'}${pick()}<small class="num">${CFG.ans === 'a' ? pa() : 100 - pa()}%</small></button><button>${I.star}Фэнтези</button><button>${I.user}Профиль</button></nav>`;
    const b = ev() && !CFG.ans ? ansBar : ev() && CFG.ans ? doneBar : bar();
    if (desk) { const side = ev() && !CFG.ans ? `<div class="d8">${ansBar.replace('<nav class="bar bar--q', '<nav class="bar bar--q in-side')}</div>` : ev() ? `<div class="d8 d8--done">${done()}</div>` : '<div class="d8 d8--calm">Вопросы матча появятся здесь — на ответ 45 секунд</div>';
      return { main: `${head()}<div class="stack">${page('', -1)}</div>`, side }; }
    return `<div class="scr">${head()}<div class="stack">${page('', -1)}</div></div>${b}`;
  }

  const VIEW = { v6, v7, v8 };
  function render() {
    const keep = $('.scr') ? $('.scr').scrollTop : $('.desk') ? scrollY : 0;
    if (CFG.view === 'desk') {
      const r = VIEW[V](true);
      document.body.innerHTML = `<div class="desk y-desk ${V}"><div class="main">${r.main}</div><aside class="side">${r.side}<div class="ph" style="height:240px;margin-top:12px">турнир</div><div class="ph" style="height:160px;margin-top:12px">новости</div></aside></div>`;
    } else {
      document.body.innerHTML = `<div class="phone y-phone ${V}">${VIEW[V](false)}</div>`;
      const sc = $('.scr'); sc.scrollTop = keep;
      sc.onscroll = () => { const y = sc.scrollTop, d = y - lastY; if (Math.abs(d) > 6) { const off = d > 0 && y > 40; if (off !== barOff) { barOff = off; const b = $('.bar'); b && b.classList.toggle('off', off); } lastY = y; } };
    }
    document.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => { CFG.ans = b.dataset.ans; CFG.anim = false; render(); });
  }
  // v7: блок, который сейчас вверху экрана телефона, — под ним и встанет карточка
  function topBlock() {
    const sc = $('.scr'); if (!sc) return 1;
    const top = sc.getBoundingClientRect().top + 60, phs = [...sc.querySelectorAll('.ph')];
    const i = phs.findIndex(p => p.getBoundingClientRect().bottom > top); return Math.max(0, i);
  }
  // таймер ответа: тикает только в «прилетело»; дошёл до нуля — вопрос закрыт, всё возвращается в спокойное
  function run() {
    clearInterval(tick); left = EV.T; CFG.ans = null; CFG.gone = false; at = CFG.state === 'event' && V === 'v7' ? topBlock() : 1;
    if (CFG.state === 'event') tick = setInterval(() => { if (left > 0) { left--;
      document.querySelectorAll('.t').forEach(t => (t.textContent = mmss(left)));
      document.querySelectorAll('.mut.num').forEach(t => (t.textContent = 'итог через ' + mmss(left)));
      document.querySelectorAll('.hq-time, .fc-time i, .bq-time').forEach(i => (i.style.width = left / EV.T * 100 + '%')); }
      else { clearInterval(tick); CFG.gone = true; CFG.anim = false; render(); } }, 1000);
    render();
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'calm', label: 'Спокойно' }, { v: 'event', label: 'Прилетело событие' }] },
    ],
    set(key, v) { CFG[key] = v; CFG.anim = true; if (key === 'state') run(); else render(); },
    toggles: () => [{ key: 'anim', name: 'Прилёт с анимацией', value: CFG.anim }],
    toggle() { CFG.anim = !CFG.anim; if (CFG.anim && CFG.state === 'event') run(); else render(); },
    caption: () => 'Пример: Spirit — Vision, карта 3, 33:30. «Прилетело событие» — Рошан убит, «Кто возьмёт следующую башню?», 45 секунд. Ничего не ложится поверх страницы',
  };
  run();
})();
