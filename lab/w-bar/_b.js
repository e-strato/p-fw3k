// w-bar — нижний бар, голосование и кнопки сообщества (задачи созвона 26.10 §7–§8, внутренняя документация/26.10/задачи-по-виджетам.md).
// Голосование — не виджет, а кнопка → панель: вопросы по одному, как опросник (5–6 ответов), прогресс, вкладка «История» — сбылось / нет.
// Телефон: кнопка в нижнем баре или плавающая (ось «Кнопка»); бар прячется при скролле вниз и возвращается вверх. Компьютер: полная версия в правой колонке.
// ‼️ Пример: вопросы и история придуманы (Spirit — Vision, карта 3, идёт), в данных их нет. «Новое событие» — кнопка мигает золотым, вопрос — первым.
(() => {
  const CFG = { view: 'phone', place: 'bar', fresh: false, open: false, tab: 'q' };
  const NEW = { q: 'Кто заберёт Рошана, который появится в 36:00?', meta: 'Рошан · до 36:00', opts: [['Spirit', '58 %'], ['Vision', '31 %'], ['Никто до 40:00', '11 %']] };
  const QS = [
    { q: 'Кто выиграет карту 3?', meta: 'Карта · до конца карты', opts: [['Spirit', '64 %'], ['Vision', '36 %']] },
    { q: 'Сколько продлится карта?', meta: 'Карта · до 40:00', opts: [['До 40 мин', '22 %'], ['40–45 мин', '41 %'], ['45–50 мин', '24 %'], ['Дольше 50', '13 %']] },
    { q: 'Кто сделает больше убийств до 40:00?', meta: 'Игроки · до 40:00', opts: [['Yatoro', '30 %'], ['Collapse', '18 %'], ['Larl', '21 %'], ['Pure', '17 %'], ['Другой', '14 %']] },
    { q: 'Будет ли ещё одна драка 5 на 5 до 38:00?', meta: 'Драки · до 38:00', opts: [['Да', '71 %'], ['Нет', '29 %']] },
    { q: 'Какая башня падёт следующей?', meta: 'Башни · до 42:00', opts: [['Верх Spirit', '12 %'], ['Центр Spirit', '9 %'], ['Низ Spirit', '15 %'], ['Верх Vision', '28 %'], ['Центр Vision', '24 %'], ['Низ Vision', '12 %']] },
  ];
  const HIST = [
    ['Первая кровь — Spirit', 'Драфт и старт · 2:51', 'ok'], ['Карта 2 — победа Vision', 'Карта 2', 'no'], ['Первый Рошан — Spirit', '19:40', 'ok'],
    ['Перевес Spirit к 30:00 больше 5k', '30:00', 'no'], ['Больше 60 убийств на карте', 'до конца карты', 'wait'],
  ];
  let qi = 0, picked = null, lastY = 0;
  const list = () => (CFG.fresh ? [NEW, ...QS] : QS);
  const $ = s => document.querySelector(s);
  const I = {
    match: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    vote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    rep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  };
  let liked = false;
  const comm = () => `<div class="comm"><button id="c-like" class="${liked ? 'on' : ''}">${I.heart}<span class="num">${128 + (liked ? 1 : 0)}</span></button>
    <button>${I.chat}<span class="num">34</span></button><button>${I.rep}<span class="num">12</span></button><span class="sp"></span>
    <button class="ic" title="Поделиться">${I.share}</button></div>`;

  // панель голосования — одна и та же: в шторке (телефон) и карточкой в правой колонке (компьютер)
  function panel(close) {
    const L = list(), q = L[qi];
    const tabs = `<div class="tabs"><button data-tab="q" class="${CFG.tab === 'q' ? 'on' : ''}">Вопросы · ${Math.max(0, L.length - qi)}</button><button data-tab="h" class="${CFG.tab === 'h' ? 'on' : ''}">История</button></div>`;
    let bd;
    if (CFG.tab === 'h') {
      const ok = HIST.filter(h => h[2] === 'ok').length, no = HIST.filter(h => h[2] === 'no').length;
      bd = `<div class="score">Сбылось <b class="num">${ok}</b> · Нет <b class="num">${no}</b> · Ждём <b class="num">${HIST.length - ok - no}</b></div>`
        + HIST.map(([t, m, s]) => `<div class="hi"><div class="t">${t}<small>${m}</small></div><span class="st ${s}">${s === 'ok' ? 'Сбылось' : s === 'no' ? 'Не сбылось' : 'Ждём'}</span></div>`).join('');
    } else if (!q) {
      bd = '<div class="done"><b>Ответил на всё</b>Новый вопрос придёт, когда в матче что-то случится — кнопка загорится золотым</div>';
    } else {
      bd = `<div class="prog">${L.map((_, i) => `<i class="${i < qi ? 'ok' : i === qi ? 'cur' : ''}"></i>`).join('')}</div>
        <div class="q-meta"><span class="num">${qi + 1} из ${L.length}</span><span>${q.meta}</span>${q === NEW ? '<span class="new">новое</span>' : ''}</div>
        <p class="q">${q.q}</p><div class="opts">${q.opts.map(([o, p], i) => `<button data-o="${i}" class="${picked === i ? 'pick' : ''}">${o}<small>${picked != null ? p : '&nbsp;'}</small></button>`).join('')}</div>
        <button class="skip" id="v-skip">Пропустить</button>`;
    }
    return `<div class="vp"><div class="vp-hd"><b>Прогнозы</b>${close ? '<button class="x" id="v-x" title="Закрыть">×</button>' : ''}</div>${tabs}<div class="vp-bd">${bd}<div class="ex">Пример — вопросов в данных нет</div></div></div>`;
  }
  const next = () => { picked = null; qi += 1; if (list()[qi - 1] === NEW) CFG.fresh = false, qi -= 1; render(); };

  function bind() {
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { CFG.tab = b.dataset.tab; render(); });
    document.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { if (picked != null) return; picked = +b.dataset.o; render(); setTimeout(next, 700); });
    $('#v-skip') && ($('#v-skip').onclick = next);
    $('#v-x') && ($('#v-x').onclick = () => { CFG.open = false; render(); });
    $('.dim') && ($('.dim').onclick = () => { CFG.open = false; render(); });
    document.querySelectorAll('[data-vote]').forEach(b => b.onclick = () => { CFG.open = true; CFG.tab = 'q'; render(); });
    $('#c-like') && ($('#c-like').onclick = () => { liked = !liked; render(); });
  }

  const vbtn = () => { const n = Math.max(0, list().length - qi); return `<span class="vbtn">${I.vote}${n ? `<span class="n num">${n}</span>` : ''}</span>`; };
  function phone() {
    const s = $('#scr'), y = s ? s.scrollTop : 0;
    const bar = `<nav class="bar" id="bar"><button class="on">${I.match}Матчи</button><button>${I.cup}Турниры</button>
      ${CFG.place === 'bar' ? `<button class="vote" data-vote>${vbtn()}</button>` : ''}<button>${I.star}Фэнтези</button><button>${I.user}Профиль</button></nav>`;
    document.body.innerHTML = `<div class="phone${CFG.fresh ? ' is-new' : ''}"><div class="scr" id="scr"><div class="stack">
      <div class="mline"><b>Spirit</b>1 : 1<b>Vision</b><span class="lv">карта 3 · 33:30</span></div>
      <div class="ph" style="height:44px">вкладки серии</div>
      <div class="ph" style="height:230px">график золота</div>
      ${comm()}
      <div class="ph" style="height:150px">драфт</div><div class="ph" style="height:300px">игроки</div>
      <div class="ph" style="height:180px">турнир</div><div class="ph" style="height:160px">новости</div></div></div>
      ${bar}${CFG.place === 'float' ? `<button class="fab" id="fab" data-vote>${vbtn()}</button>` : ''}
      ${CFG.open ? `<div class="dim"></div><div class="sheet"><div class="grab"></div>${panel(true)}</div>` : ''}</div>`;
    const sc = $('#scr'); sc.scrollTop = y; lastY = y;
    sc.addEventListener('scroll', () => { const v = sc.scrollTop, d = v - lastY; if (Math.abs(d) < 4) return;
      const off = v > 40 && d > 0; $('#bar').classList.toggle('off', off); $('#fab')?.classList.toggle('low', off); lastY = v; }, { passive: true });
  }
  function desk() {
    document.body.innerHTML = `<div class="desk${CFG.fresh ? ' is-new' : ''}"><div class="main stack">
      <div class="mline"><b>Spirit</b>1 : 1<b>Vision</b><span class="lv">карта 3 · 33:30</span></div>
      <div class="ph" style="height:44px">вкладки серии</div><div class="ph" style="height:320px">график золота</div>${comm()}
      <div class="ph" style="height:160px">драфт</div><div class="ph" style="height:300px">игроки</div></div>
      <div class="side stack"><div class="card">${panel(false)}</div><div class="ph" style="height:200px">турнир</div><div class="ph" style="height:160px">новости</div></div></div>`;
  }
  function render() { CFG.view === 'desk' ? desk() : phone(); bind(); }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'place', name: 'Кнопка', value: CFG.place, options: [{ v: 'bar', label: 'В нижнем баре' }, { v: 'float', label: 'Плавающая' }].map(o => (CFG.view === 'desk' ? { ...o, off: true, offNote: 'на компьютере — колонка' } : o)) },
    ],
    set(key, v) { CFG[key] = v; CFG.open = false; render(); },
    toggles: () => [{ key: 'fresh', name: 'Новое событие', value: CFG.fresh }],
    toggle(key) { if (key === 'fresh') { CFG.fresh = !CFG.fresh; qi = 0; picked = null; } render(); },
    caption: () => 'Пример: Spirit — Vision, карта 3 идёт. Листай вниз — бар прячется; кнопка голосования → панель с вопросами по одному',
  };
  render();
})();
