// DB_FAKE: если на странице есть выдуманная база (_db/_fake.js) — данные отсюда берутся из неё (одно место для выдумки); нет — как было
// Лаба widget-predict — «Прогнозы» вместо голосования (созвон 02.11 §1.3, задача 1.3). Начальник 02.11:
//  · фанаты / не фанаты не нужны — у варианта только общий процент;
//  · не один вопрос, а много: ответил — следующий; за каждый прогноз — баллы; слайдер, чтобы листать;
//  · типы прогнозов — с букмекерской линии; итог — как экспресс (купон);
//  · ответил на все — виджет сворачивается и показывает мои прогнозы; после матча видно, что угадал;
//  · «Мои прогнозы» — история, в первой версии без логина (храним в браузере).
// Дирижёр 02.11: виджет остаётся в правой колонке (в главную не переносим).
// Ставится на место голосования: переопределяет window.GS_VOTE (хозяин — ../gs-match/_gs.js, слот vote2). Подключать после ../widget-vote/_vote.js.
// window.PR: carousel (v2) — один вопрос во весь виджет, ‹ › и счётчик, ответил — сам уходит к следующему ·
//            list (v3) — все вопросы списком, варианты прямо в строке; ниже купон-экспресс.
// ‼️ Вопросы, проценты толпы и баллы — пример; ответы храним в localStorage ('pq-v1'), «Сбросить» — для показа.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const MODE = window.PR || 'carousel', KEY = 'pq-v1-' + MODE; // у каждого варианта свои ответы
  // Линия на Map 3 (идёт, 33:30) и серию Vision — Spirit. crowd — доли толпы по вариантам, pts — баллы за угаданный
  const Q = [
    { id: 'map', q: 'Кто возьмёт Map 3?', o: ['Vision', 'Spirit'], crowd: [61, 39], pts: 10 },
    { id: 'series', q: 'Счёт серии', o: ['2:1 Vision', '2:1 Spirit'], crowd: [58, 42], pts: 15 },
    { id: 'rosh', q: 'Кто убьёт следующего Рошана?', o: ['Vision', 'Spirit'], crowd: [70, 30], pts: 10 },
    { id: 'kills', q: 'Тотал убийств на Map 3', o: ['Больше 45,5', 'Меньше 45,5'], crowd: [54, 46], pts: 10 },
    { id: 'long', q: 'Map 3 дольше 45 минут?', o: ['Да', 'Нет'], crowd: [35, 65], pts: 10 },
    { id: 'rax', q: 'Кто первым снесёт казармы?', o: ['Vision', 'Spirit'], crowd: [64, 36], pts: 15 },
    { id: 'top', q: 'Больше всех убийств на Map 3', o: ['Yatoro', 'Satanic', 'Другой'], crowd: [41, 38, 21], pts: 20 },
    { id: 'ultra', q: 'Будет Ultra Kill?', o: ['Да', 'Нет'], crowd: [27, 73], pts: 20 },
  ];
  const load = () => { if (['cards', 'ticket', 'check', 'ticket2', 'check2', 'ticket3', 'ticket4', 'ticket5'].includes(window.PR)) return {}; try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } };
  const save = () => { if (VIS || BARE || SEQ) return; try { localStorage.setItem(KEY, JSON.stringify(st.a)) } catch { /* без хранилища — до перезагрузки */ } };
  const st = { a: load(), i: 0, open: false, flash: null };
  const firstOpen = () => Q.findIndex(q => st.a[q.id] == null);
  st.i = Math.max(0, firstOpen());
  const done = () => Q.filter(q => st.a[q.id] != null).length;
  const score = () => Q.reduce((t, q) => t + (st.a[q.id] != null ? q.pts : 0), 0);
  const HOSTS = new Set();

  const opts = (q, big) => `<div class="pq-o${big ? ' pq-o--big' : ''}${q.o.length > 2 ? ' pq-o--3' : ''}">${q.o.map((o, j) => { const me = st.a[q.id] === j, shown = st.a[q.id] != null;
      return `<button class="${me ? 'is-me' : ''}${shown ? ' is-shown' : ''}" data-pq="pick" data-q="${q.id}" data-v="${j}"${shown ? ' disabled' : ''}>
        <i style="width:${shown ? q.crowd[j] : 0}%"></i><span>${esc(o)}</span>${shown ? `<b class="num">${q.crowd[j]}%</b>` : ''}</button>` }).join('')}</div>`;

  const coupon = (full) => { const mine = Q.filter(q => st.a[q.id] != null);
    return `<div class="pq-cp">${full ? '' : `<div class="pq-cph"><b>Мой экспресс</b><span class="num">${mine.length} из ${Q.length}</span></div>`}
      ${mine.map(q => `<div class="pq-cr"><span>${esc(q.q)}</span><b>${esc(q.o[st.a[q.id]])}</b><em class="pq-wait" title="Ждём исход">⏳</em></div>`).join('') || '<p class="pq-empty">Пока ни одного прогноза</p>'}
      <div class="pq-cpf"><span>Угадаешь все — <b class="num">+${score() * 2}</b> баллов</span><button data-pq="reset">Сбросить</button></div></div>` };

  const carousel = () => { const all = done() === Q.length;
    if (all && !st.open) return `<button class="pq-min" data-pq="open"><span class="pq-ok">✓</span><span><b>Мои прогнозы · ${Q.length}</b><small>Исход — по ходу матча и после</small></span><em class="num">+${score()}</em></button>${coupon()}`;
    const q = Q[st.i], ans = st.a[q.id] != null;
    return `<div class="pq-card">
        <div class="pq-qh"><span class="pq-n num">${st.i + 1} / ${Q.length}</span><span class="pq-pts num">+${q.pts} баллов</span></div>
        <p class="pq-q">${esc(q.q)}</p>${opts(q, true)}
        <p class="pq-hint">${ans ? 'Принято. Так ответила толпа' : 'Выбери — потом увидишь, как ответили остальные'}</p>
        <div class="pq-nav"><button data-pq="prev" aria-label="Предыдущий">‹</button><div class="pq-dots">${Q.map((x, j) => `<i class="${j === st.i ? 'on' : ''}${st.a[x.id] != null ? ' ok' : ''}"></i>`).join('')}</div><button data-pq="next" aria-label="Следующий">›</button></div></div>
      ${done() ? coupon() : ''}` };

  const list = () => `<div class="pq-list">${Q.map(q => `<div class="pq-row"><div class="pq-rh"><span>${esc(q.q)}</span><em class="num">+${q.pts}</em></div>${opts(q)}</div>`).join('')}</div>${coupon()}`;

  // ——— v4 (дирижёр 02.11: «логику не понял: прогнозы появляются перед ключевыми событиями, не все подряд; 5 штук; показываем, что он уже всё
  // заполнил, и на третьей карте осталось одно ключевое событие») — window.PR = 'moments' ———
  // Прогноз всплывает перед ключевым событием и принимается до него; потом событие случилось — ✓ / ✗ и баллы. История — ниже.
  // ‼️ Пример: прошлые прогнозы и исходы выдуманы; активный — «следующий Рошан» на Map 3 (33:30), принимаем до 34:40.
  const HIST = window.DB_FAKE?.predictions.history ?? [
    { at: 'Map 1 · до старта', ev: 'Первая кровь', q: 'Кто прольёт первую кровь?', me: 'Vision', res: 'Spirit', ok: false, pts: 10 },
    { at: 'Map 1 · 18:40', ev: 'Рошан', q: 'Кто заберёт Рошана?', me: 'Spirit', res: 'Spirit', ok: true, pts: 10 },
    { at: 'Map 2 · 25:10', ev: 'Казармы', q: 'Кто первым снесёт казармы?', me: 'Spirit', res: 'Spirit', ok: true, pts: 15 },
    { at: 'Map 3 · 11:50', ev: 'Первая башня', q: 'Чья башня упадёт первой?', me: 'Spirit', res: 'Spirit', ok: true, pts: 10 },
  ];
  const ACT = { id: 'rosh3', at: 'Map 3 · сейчас 33:30', ev: 'Рошан появится ~34:40', q: 'Кто заберёт следующего Рошана?', o: ['Vision', 'Spirit'], crowd: [70, 30], pts: 10, until: '34:40', left: 70 };
  const earned = () => HIST.filter(h => h.ok).reduce((t, h) => t + h.pts, 0);
  const moments = () => { const ans = st.a[ACT.id] != null;
    return `<div class="pq-act${ans ? ' is-ans' : ''}">
        <div class="pq-ah"><span class="pq-ev"><i></i>${esc(ACT.ev)}</span><span class="pq-tm num">${ans ? 'ждём событие' : `приём до ${ACT.until}`}</span></div>
        <p class="pq-q">${esc(ACT.q)}</p>${opts(ACT, true)}
        <p class="pq-hint">${ans ? 'Принято. Так ответили остальные — исход после Рошана' : `+${ACT.pts} баллов, если угадаешь`}</p></div>
      <div class="pq-hist"><div class="pq-hh"><b>Мои прогнозы</b><span class="num">${HIST.filter(h => h.ok).length} из ${HIST.length} · <em>+${earned()}</em></span></div>
        ${HIST.map(h => `<div class="pq-hr"><span class="pq-res ${h.ok ? 'ok' : 'no'}">${h.ok ? '✓' : '✕'}</span>
          <span class="pq-ht"><b>${esc(h.q)}</b><small>${esc(h.at)} · ты: ${esc(h.me)}${h.ok ? '' : ` · вышло: ${esc(h.res)}`}</small></span>
          <em class="num ${h.ok ? 'ok' : ''}">${h.ok ? `+${h.pts}` : '0'}</em></div>`).join('')}
        <div class="pq-next">Следующий прогноз появится перед следующим ключевым событием</div></div>` };

  // ——— v5 (дирижёр 02.11: «сильно много текста; посмотреть, как выглядит, когда матч закончился») — window.PR = 'short' ———
  // Меньше слов: событие · карта — вопрос коротко; строки истории в одну строку. Состояние берём со страницы (M.state): live — активный
  // прогноз перед Рошаном на Map 3; «После» — итог: все 5 решены, сумма баллов. Команды — из матча на странице (M.A / M.B).
  const SH = { 9572001: 'Vision', 7119388: 'Spirit', 8255888: 'BetBoom', 10150413: 'Iron Wing' };
  const tn = id => SH[id] || ((window.GS_DATA || {}).teams || {})[id]?.tag || '—';
  let MM = null; // матч со страницы
  const shortView = () => { const A = tn(MM && MM.A), B = tn(MM && MM.B), post = MM && MM.state === 'post';
    const H5 = [
      { ev: 'Первая кровь', at: 'Map 1', me: A, ok: false, pts: 10 },
      { ev: 'Рошан', at: 'Map 1', me: B, ok: true, pts: 10 },
      { ev: 'Казармы', at: 'Map 2', me: B, ok: true, pts: 15 },
      { ev: 'Первая башня', at: 'Map 3', me: B, ok: true, pts: 10 },
      ...(post ? [{ ev: 'Рошан', at: 'Map 3', me: A, ok: true, pts: 10 }] : []),
    ];
    const sum = H5.filter(h => h.ok).reduce((t, h) => t + h.pts, 0), okN = H5.filter(h => h.ok).length;
    const act = { id: 'rosh3s', o: [A, B], crowd: [70, 30], pts: 10 };
    const rows = H5.map(h => `<div class="pq-sr"><span class="pq-res ${h.ok ? 'ok' : 'no'}">${h.ok ? '✓' : '✕'}</span><b>${esc(h.ev)}</b><small>${esc(h.at)}</small><span class="pq-me">${esc(h.me)}</span><em class="num${h.ok ? ' ok' : ''}">${h.ok ? '+' + h.pts : '0'}</em></div>`).join('');
    const head = `<div class="pq-hd"><b>${post ? 'Прогнозы · итог' : 'Прогнозы'}</b><small><span class="num">${okN} из 5</span> · <span class="num pq-sc">+${sum}</span></small></div>`;
    if (post) return `<div class="w pq pq--short">${head}<div class="pq-fin"><b class="num">+${sum}</b><span>баллов за матч · угадано ${okN} из 5</span></div><div class="pq-sl">${rows}</div></div>`;
    const ans = st.a[act.id] != null;
    return `<div class="w pq pq--short">${head}<div class="pq-act pq-act--s${ans ? ' is-ans' : ''}"><div class="pq-ah"><span class="pq-ev"><i></i>Рошан · Map 3</span><span class="pq-tm num">${ans ? 'ждём' : 'до 34:40'}</span></div>
      ${opts(act, true)}</div><div class="pq-sl">${rows}</div></div>`; };


  // ——— v6–v8 (дирижёр 02.11: «визуальнее, как карточка; старые — в истории или когда выбирать нечего; когда выбираем — акцент только
  // на выбор; итог — как экспресс: чек / билет») — window.PR = 'cards' | 'ticket' | 'check' ———
  // Три состояния: есть что выбрать — только карточка выбора (без истории) · ответил — 1,5 с проценты толпы, потом история с этим
  // прогнозом «ждём» · «После» — итог. Ответ не храним: перезагрузил — снова выбор (для показа).
  const VIS = ['cards', 'ticket', 'check'].includes(MODE);
  const logo = id => `<img src="img/teams/${id}.png" alt="">`;
  const legs = (post, pick) => { const a = MM && MM.A, b = MM && MM.B;
    const L = [
      { ev: 'Первая кровь', at: 'Map 1', me: a, st: 'no', pts: 10 },
      { ev: 'Рошан', at: 'Map 1', me: b, st: 'ok', pts: 10 },
      { ev: 'Казармы', at: 'Map 2', me: b, st: 'ok', pts: 15 },
      { ev: 'Первая башня', at: 'Map 3', me: b, st: 'ok', pts: 10 },
    ];
    if (post) L.push({ ev: 'Рошан', at: 'Map 3', me: a, st: 'ok', pts: 10 });
    else if (pick != null) L.push({ ev: 'Рошан', at: 'Map 3', me: pick ? b : a, st: 'wait', pts: 10 });
    return L; };
  const tally = L => ({ ok: L.filter(l => l.st === 'ok').length, sum: L.filter(l => l.st === 'ok').reduce((t, l) => t + l.pts, 0) });
  const mark = st => st === 'ok' ? '✓' : st === 'no' ? '✕' : '…';

  // Карточка выбора — одна на экране: событие, сколько осталось, вопрос, две команды с логотипами
  const pickCard = () => { const a = MM && MM.A, b = MM && MM.B, v = st.a.rosh3v, shown = v != null, crowd = [70, 30];
    return `<div class="pq-pk${shown ? ' is-ans' : ''}">
      <div class="pq-pk-top"><span class="pq-ev"><i></i>Рошан · Map 3</span><span class="num">${shown ? 'принято' : 'до 34:40'}</span></div>
      <div class="pq-pk-bar"><i style="width:${shown ? 0 : 62}%"></i></div>
      <p class="pq-pk-q">Кто заберёт Рошана?</p>
      <div class="pq-pk-o">${[a, b].map((id, j) => `<button class="${v === j ? 'is-me' : ''}${shown ? ' is-shown' : ''}" data-pq="pick" data-q="rosh3v" data-v="${j}"${shown ? ' disabled' : ''}>
        ${logo(id)}<b>${esc(tn(id))}</b>${shown ? `<em class="num">${crowd[j]}%</em><i style="height:${crowd[j]}%"></i>` : ''}</button>`).join('')}</div>
      <p class="pq-pk-f"><span class="num">+10 баллов</span><span>5-й прогноз в экспрессе</span></p></div>`; };

  // v6 · карточки: 5 мини-карточек в ряд — мой выбор (логотип), событие, карта, ✓ / ✕ / ждём
  const cardsSlip = (L, post) => { const t = tally(L);
    return `${post ? `<div class="pq-fin"><b class="num">+${t.sum}</b><span>баллов за матч · угадано ${t.ok} из 5</span></div>` : ''}
      <div class="pq-mcs">${L.map(l => `<div class="pq-mc ${l.st}"><span class="pq-mc-s">${mark(l.st)}</span>${logo(l.me)}<b>${esc(l.ev)}</b><small>${l.at}</small><em class="num">${l.st === 'ok' ? '+' + l.pts : l.st === 'no' ? '0' : 'ждём'}</em></div>`).join('')}
        ${L.length < 5 ? '<div class="pq-mc empty"><b>скоро</b></div>' : ''}</div>
      ${post ? '' : '<p class="pq-nx">Следующий прогноз — перед ключевым событием</p>'}`; };

  // v7 · билет-экспресс: шапка матча, ноги экспресса, перфорация с вырезами, итог; после матча — штамп
  const ticketSlip = (L, post) => { const t = tally(L), a = MM && MM.A, b = MM && MM.B;
    return `<div class="pq-tk${post ? ' is-post' : ''}">
      <div class="pq-tk-h">${logo(a)}<span><b>${esc(tn(a))} — ${esc(tn(b))}</b><small>Экспресс · ${L.length} из 5</small></span>${logo(b)}</div>
      <div class="pq-tk-l">${L.map(l => `<div class="pq-tl ${l.st}">${logo(l.me)}<b>${esc(l.ev)}</b><small>${l.at}</small><em class="num">${l.st === 'ok' ? '+' + l.pts : l.st === 'no' ? '0' : 'ждём'}</em></div>`).join('')}</div>
      <div class="pq-perf"></div>
      <div class="pq-tk-f"><span>${post ? 'Итого за матч' : 'Набрано'}</span><b class="num">+${t.sum}</b></div>
      ${post ? `<div class="pq-stamp"><b class="num">${t.ok} из 5</b><small>угадано</small></div>` : ''}</div>
      ${post ? '' : '<p class="pq-nx">Следующий прогноз — перед ключевым событием</p>'}`; };

  // v8 · чек: светлая бумага, строки с точками-отточием, итог, зубчатый низ
  const checkSlip = (L, post) => { const t = tally(L), a = MM && MM.A, b = MM && MM.B;
    return `<div class="pq-ck"><div class="pq-ck-h"><b>Чек прогнозов</b><small>TI 2026 · ${esc(tn(a))} — ${esc(tn(b))}</small></div>
      ${L.map(l => `<div class="pq-cl ${l.st}"><span>${esc(l.ev)} · ${l.at}</span><i></i><span>${esc(tn(l.me))}</span><em class="num">${l.st === 'ok' ? '+' + l.pts : l.st === 'no' ? '0' : '…'}</em></div>`).join('')}
      <div class="pq-ck-t"><span>${post ? 'Итого' : 'Пока'}</span><b class="num">+${t.sum}</b></div>
      <p class="pq-ck-n">${post ? `Угадано ${t.ok} из 5 · матч завершён` : L.length < 5 ? 'Впереди ещё прогноз' : 'Ждём Рошана на Map 3'}</p>
      <div class="pq-bc"></div></div>`; };

  const visView = () => { const post = MM && MM.state === 'post', v = st.a.rosh3v;
    if (!post && (v == null || !st.slip)) return `<div class="w pq pq--${MODE}"><div class="pq-hd"><b>Прогнозы</b><small><span class="num">4 из 5</span> · <span class="num pq-sc">+35</span></small></div>${pickCard()}</div>`;
    const L = legs(post, v), t = tally(L);
    const body = MODE === 'ticket' ? ticketSlip(L, post) : MODE === 'check' ? checkSlip(L, post) : cardsSlip(L, post);
    return `<div class="w pq pq--${MODE}"><div class="pq-hd"><b>${post ? 'Прогнозы · итог' : 'Мои прогнозы'}</b><small><span class="num">${t.ok} из 5</span> · <span class="num pq-sc">+${t.sum}</span></small></div>${body}</div>`; };


  // ——— v9–v10 (дирижёр 02.11: «билет и чек нравятся; всё чёрное; заголовки убрать, как с телевизором — только сама штука, состояние меняется,
  // высота пусть меняется; при выборе — выбираем и подсвечиваем всё, что выбрано; в «После» — финальный чек и сколько баллов набрали») ———
  // window.PR = 'ticket2' (финал — билет со штампом) | 'check2' (финал — чек). Без шапки и рамки виджета.
  // Live: до ответа — только выбор · ответил — выбор подсвечен + под перфорацией весь экспресс, мои ответы подсвечены (баллы не пишем).
  // «После»: финал — баллы за каждый и итог.
  const BARE = ['ticket2', 'check2'].includes(MODE);
  const bareView = () => { const post = MM && MM.state === 'post', v = st.a.rosh3v, a = MM && MM.A, b = MM && MM.B;
    const L = legs(post, v), t = tally(L), shown = v != null, crowd = [70, 30];
    if (post && MODE === 'check2') return `<div class="w pq pq--bare"><div class="pq-ck pq-ck--dark"><div class="pq-ck-h"><b>Чек прогнозов</b><small>TI 2026 · ${esc(tn(a))} — ${esc(tn(b))}</small></div>
      ${L.map(l => `<div class="pq-cl ${l.st}"><span>${esc(l.ev)} · ${l.at}</span><i></i><span>${esc(tn(l.me))}</span><em class="num">${l.st === 'ok' ? '+' + l.pts : '0'}</em></div>`).join('')}
      <div class="pq-ck-t"><span>Итого</span><b class="num">+${t.sum}</b></div><p class="pq-ck-n">Угадано ${t.ok} из 5 · матч завершён</p><div class="pq-bc"></div></div></div>`;
    if (post) return `<div class="w pq pq--bare"><div class="pq-tk is-post">
      <div class="pq-tk-h">${logo(a)}<span><b>${esc(tn(a))} — ${esc(tn(b))}</b><small>Экспресс · итог</small></span>${logo(b)}</div>
      <div class="pq-tk-l">${L.map(l => `<div class="pq-tl ${l.st}">${logo(l.me)}<b>${esc(l.ev)}</b><small>${l.at}</small><em class="num">${l.st === 'ok' ? '+' + l.pts : '0'}</em></div>`).join('')}</div>
      <div class="pq-perf"></div><div class="pq-tk-f"><span>Итого за матч</span><b class="num">+${t.sum}</b></div>
      <div class="pq-stamp"><b class="num">${t.ok} из 5</b><small>угадано</small></div></div></div>`;
    const choice = `<div class="pq-b-top"><span class="pq-ev"><i></i>Рошан · Map 3</span><span class="num">${shown ? 'принято' : 'до 34:40'}</span></div>
      <p class="pq-pk-q">Кто заберёт Рошана?</p>
      <div class="pq-pk-o">${[a, b].map((id, j) => `<button class="${v === j ? 'is-me' : ''}${shown ? ' is-shown' : ''}" data-pq="pick" data-q="rosh3v" data-v="${j}"${shown ? ' disabled' : ''}>
        ${logo(id)}<b>${esc(tn(id))}</b>${shown ? `<em class="num">${crowd[j]}%</em><i style="height:${crowd[j]}%"></i>` : ''}</button>`).join('')}</div>`;
    const rows = !shown ? '' : MODE === 'check2'
      ? `<div class="pq-b-ls pq-b-ls--ck">${L.map(l => `<div class="pq-cl ${l.st}"><span>${esc(l.ev)} · ${l.at}</span><i></i><span class="pq-me2">${esc(tn(l.me))}</span><em>${mark(l.st)}</em></div>`).join('')}</div>`
      : `<div class="pq-b-ls">${L.map(l => `<div class="pq-bl ${l.st}"><span class="pq-me2">${logo(l.me)}${esc(tn(l.me))}</span><b>${esc(l.ev)}</b><small>${l.at}</small><em>${mark(l.st)}</em></div>`).join('')}</div>`;
    return `<div class="w pq pq--bare"><div class="pq-b${shown ? ' is-ans' : ''}">${choice}<div class="pq-perf"></div>
      ${shown ? `<div class="pq-b-sub"><span>Мой экспресс</span><span class="num">${L.length} из 5</span></div>${rows}` : '<div class="pq-b-sub"><span>5-й прогноз экспресса</span><span class="num pq-sc">+10 баллов</span></div>'}</div></div>`; };


  // ——— v11–v13 (дирижёр 02.11, на базе v9): v11 'ticket3' — экспресс под выбором раскрывается плавно · v12 'ticket4' — цикл: выбор → список →
  // через 3 с новый прогноз → выбор → список · v13 'ticket5' — один размер: выбор и список — две стороны одной фиксированной высоты ———
  const SEQ = ['ticket3', 'ticket4', 'ticket5'].includes(MODE);
  const ITEMS = [
    ...(MODE === 'ticket4' ? [{ id: 'tow3', ev: 'Первая башня', at: 'Map 3', q: 'Чья башня упадёт первой?', crowd: [55, 45], res: 1 }] : []),
    { id: 'rosh3', ev: 'Рошан', at: 'Map 3', q: 'Кто заберёт Рошана?', crowd: [70, 30], res: 0 },
  ];
  st.ci = 0; st.open = false; st.anim = false;
  const seqLegs = post => { const a = MM && MM.A, b = MM && MM.B, base = legs(true).slice(0, 5 - ITEMS.length);
    return [...base, ...ITEMS.filter((it, k) => post || st.a[it.id] != null).map(it => { const k = ITEMS.indexOf(it), v = post ? it.res : st.a[it.id];
      const st2 = post || k < st.ci ? (v === it.res ? 'ok' : 'no') : 'wait'; return { ev: it.ev, at: it.at, me: v ? b : a, st: st2, pts: 10 }; })]; };

  // ——— v14–v17 (дирижёр 02.11: «v13 нравится; список прошлых — покрасивее, несколько версий») — window.PR = 'ticket5' + window.PQ_LIST:
  // tiles — 5 карточек в ряд · track — линия матча Map 1–3, на ней точки-прогнозы · steps — лесенка экспресса · maps — колонки по картам ———
  const STW = { ok: 'угадал', no: 'мимо', wait: 'ждём' };
  const listBody = L => { const K = window.PQ_LIST, ok = L.filter(l => l.st === 'ok').length, done = L.filter(l => l.st !== 'wait').length;
    const sum = `<div class="pq-ls-sum"><b class="num">${ok} из ${done}</b><span>угадано${L.some(l => l.st === 'wait') ? ' · 1 ждём' : ''}</span></div>`;
    if (K === 'tiles') return `<div class="pq-t5">${L.map(l => `<div class="pq-t5c ${l.st}"><span class="pq-t5s">${mark(l.st)}</span>${logo(l.me)}<b>${esc(l.ev)}</b><small>${l.at}</small></div>`).join('')}
      ${Array.from({ length: 5 - L.length }, () => '<div class="pq-t5c empty"><small>скоро</small></div>').join('')}</div>${sum}`;
    if (K === 'track') { const maps = ['Map 1', 'Map 2', 'Map 3'];
      return `<div class="pq-trk"><div class="pq-trk-line"></div>${L.map(l => `<div class="pq-trk-n ${l.st}"><span class="pq-trk-d">${logo(l.me)}<i>${mark(l.st)}</i></span><b>${esc(l.ev)}</b></div>`).join('')}
        ${Array.from({ length: 5 - L.length }, () => '<div class="pq-trk-n empty"><span class="pq-trk-d"></span><b>скоро</b></div>').join('')}</div>
        <div class="pq-trk-m">${maps.map(m => `<span style="flex:${[...L, ...Array(5 - L.length).fill({ at: 'Map 3' })].filter(l => l.at === m).length}">${m}</span>`).join('')}</div>${sum}`; }
    // v18 'steps2' — лесенка v16 в общей стилистике виджетов: логотип как .w-logo (квадрат 24, скругление 6), тонкая линия, строки 40 с разделителем,
    // исход — плашкой как .w-badge (up / down токены), без колец и свечения; мимо — строка приглушена
    if (K === 'steps2') return `<div class="pq-s2">${L.map(l => `<div class="pq-s2-r ${l.st}"><span class="pq-s2-d">${logo(l.me)}</span><span class="pq-s2-t"><b>${esc(l.ev)}</b><small>${l.at} · ${esc(tn(l.me))}</small></span><em>${l.st === 'wait' ? '<i></i>' : ''}${STW[l.st]}</em></div>`).join('')}</div>`;
    if (K === 'steps') return `<div class="pq-stp">${L.map(l => `<div class="pq-stp-r ${l.st}"><span class="pq-stp-d">${logo(l.me)}</span><span class="pq-stp-t"><b>${esc(l.ev)}</b><small>${l.at} · ${esc(tn(l.me))}</small></span><em>${mark(l.st)} ${STW[l.st]}</em></div>`).join('')}</div>`;
    // maps — три колонки, в каждой события этой карты
    return `<div class="pq-mp">${['Map 1', 'Map 2', 'Map 3'].map(m => `<div class="pq-mp-c"><small>${m}</small>${L.filter(l => l.at === m).map(l => `<div class="pq-mp-e ${l.st}">${logo(l.me)}<b>${esc(l.ev)}</b><i>${mark(l.st)}</i></div>`).join('') || '<div class="pq-mp-e empty"><b>—</b></div>'}</div>`).join('')}</div>${sum}`; };


  // ——— v19–v21 (дирижёр 02.11: «три совсем разных виджета, логика та же (v18: один размер, выбор → список), в лайве и после») —
  // window.PR = 'ticket5' + window.PQ_SKIN: rows — шкала экспресса из 5 делений + выбор строками · stack — стопка карточек ·
  // score — счёт «угадал : мимо», как счёт матча ———
  const skinView = () => { const K = window.PQ_SKIN, post = MM && MM.state === 'post', a = MM && MM.A, b = MM && MM.B;
    const it = ITEMS[st.ci], v = post ? it.res : st.a[it.id], shown = v != null, L = seqLegs(post), n = 5 - ITEMS.length + st.ci + 1;
    const t = tally(L), miss = L.filter(l => l.st === 'no').length, wait = L.some(l => l.st === 'wait');
    const open = post || (st.open && !st.anim), anim = st.anim && !post ? ' data-anim="is-list"' : '';
    const opt = (id, j, cls) => `<button class="${cls}${v === j ? ' is-me' : ''}${shown ? ' is-shown' : ''}" data-pq="pick" data-q="${it.id}" data-v="${j}"${shown ? ' disabled' : ''}>`;
    const pts = l => l.st === 'ok' ? '+' + l.pts : l.st === 'no' ? '0' : '';
    const top = `<div class="pq-k-top"><span class="pq-ev"><i></i>${esc(it.ev)} · ${it.at}</span><span class="num">${shown ? 'принято' : 'до 34:40'}</span></div>`;
    const box = (pick, list) => `<div class="w pq pq--bare"><div class="pq-b pq-fx pq-k pq-k--${K}${open ? ' is-list' : ''}"${anim}>
      <div class="pq-face pq-face--pick">${pick}</div><div class="pq-face pq-face--list">${list}</div></div></div>`;
    const row = l => `<div class="pq-kr ${l.st}">${logo(l.me)}<span><b>${esc(l.ev)}</b><small>${l.at} · ${esc(tn(l.me))}</small></span><em class="num">${post ? pts(l) : STW[l.st]}</em></div>`;

    if (K === 'rows') { // шкала из 5 делений: каждое — прогноз экспресса, цвет — исход
      const seg = cur => `<div class="pq-seg">${[...L.map(l => l.st), ...(cur ? ['now'] : []), ...Array(5 - L.length - (cur ? 1 : 0)).fill('')].map(c => `<i class="${c}"></i>`).join('')}</div>`;
      const pick = `${seg(!shown)}${top}<p class="pq-k-q">${esc(it.q)}</p>
        <div class="pq-k-rows">${[a, b].map((id, j) => `${opt(id, j, 'pq-k-opt')}<i style="width:${shown ? it.crowd[j] : 0}%"></i>${logo(id)}<b>${esc(tn(id))}</b><em class="num">${shown ? it.crowd[j] + '%' : ''}</em></button>`).join('')}</div>
        <div class="pq-k-f"><span class="num pq-sc">+10 баллов</span><span>${n}-й прогноз из 5</span></div>`;
      const list = `${seg(false)}${post ? `<div class="pq-k-tot"><b class="num">+${t.sum}</b><span>баллов за матч · угадано ${t.ok} из 5</span></div>` : `<div class="pq-k-h"><b>Мой экспресс</b><span class="num">${t.ok} угадано${wait ? ' · 1 ждём' : ''}</span></div>`}
        <div class="pq-kl">${L.map(row).join('')}</div>`;
      return box(pick, list); }

    if (K === 'stack') { // выбор — верхняя карта стопки (под ней прошлые); список — карты сеткой
      const pick = `<div class="pq-stk"><div class="pq-stk-c">${top}<p class="pq-k-q">${esc(it.q)}</p>
        <div class="pq-stk-o">${[a, b].map((id, j) => `${opt(id, j, '')}${logo(id)}<b>${esc(tn(id))}</b>${shown ? `<em class="num">${it.crowd[j]}%</em>` : ''}</button>`).join('')}</div>
        <div class="pq-k-f"><span class="num pq-sc">+10 баллов</span><span>под картой — ещё ${L.length - (shown ? 1 : 0)}</span></div></div></div>`;
      const card = l => `<div class="pq-sc2 ${l.st}"><div>${logo(l.me)}<em class="num">${post ? pts(l) : mark(l.st)}</em></div><b>${esc(l.ev)}</b><small>${l.at} · ${esc(tn(l.me))}</small></div>`;
      const list = `<div class="pq-k-h"><b>${post ? 'Итог прогнозов' : 'Мой экспресс'}</b><span class="num">${post ? `<span class="pq-sc">+${t.sum}</span> · ${t.ok} из 5` : `${t.ok} угадано${wait ? ' · 1 ждём' : ''}`}</span></div>
        <div class="pq-sg">${L.map(card).join('')}${Array(5 - L.length).fill('<div class="pq-sc2 empty"><small>скоро</small></div>').join('')}</div>`;
      return box(pick, list); }

    // score — счёт прогнозов «угадал : мимо», как счёт матча; выбор — логотипы по краям, вопрос по центру
    const sc = `<div class="pq-scb"><div><b class="num">${t.ok}</b><small>угадал</small></div><span>:</span><div><b class="num">${miss}</b><small>мимо</small></div></div>`;
    const pick = `${top}<div class="pq-vs">${[a, b].map((id, j) => `${opt(id, j, 'pq-vs-o')}${logo(id)}<b>${esc(tn(id))}</b><em class="num">${shown ? it.crowd[j] + '%' : ''}</em></button>${j ? '' : `<p class="pq-vs-q">${esc(it.q)}</p>`}`).join('')}</div>
      <div class="pq-vs-bar">${shown ? `<i style="width:${it.crowd[0]}%"></i>` : ''}</div>
      <div class="pq-k-f"><span class="num pq-sc">+10 баллов</span><span>${n}-й прогноз из 5</span></div>`;
    const list = `${sc}${post ? `<p class="pq-scb-t"><b class="num pq-sc">+${t.sum}</b> баллов за матч</p>` : `<p class="pq-scb-t">${wait ? 'Ждём исход 1 прогноза' : 'Следующий — перед ключевым событием'}</p>`}
      <div class="pq-chips">${L.map(l => `<span class="pq-chip ${l.st}">${logo(l.me)}${esc(l.ev)}<small>${l.at.replace('Map ', 'M')}</small>${post && l.st === 'ok' ? `<em class="num">+${l.pts}</em>` : ''}</span>`).join('')}</div>`;
    return box(pick, list); };


  // ——— v29–v31 (дирижёр 02.11: «v18, но билет заметно красивее») — window.PR = 'ticket5' + window.PQ_TK: stub | holo | art.
  // Логика v18 (один размер, выбор → «Мой экспресс», «После» — баллы), меняется сам билет: шапка матча, линия отрыва, корешок с итогом ———
  const qr = seed => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; // узор «QR» 9×9 — для вида
    return Array.from({ length: 81 }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const x = i % 9, y = (i / 9) | 0, eye = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      return `<i${eye || (h >> 16) & 1 ? ' class="on"' : ''}></i>`; }).join(''); };

  // Купон после матча: шапка «Купон · экспресс», те же строки с баллами; отрывной корешок — итог и «Забрать в Фэнтези».
  // Нажал — корешок отрывается (уезжает вниз с поворотом), на его месте «Зачислено в Фэнтези». ‼️ Куда ведёт — пока без ссылки
  const couponView = (K, a, b, L, t, list) => { const got = st.got;
    return `<div class="w pq pq--bare"><div class="pq-T pq-T--${K} pq-T--cp is-list is-post${got ? ' is-got' : ''}">
      <div class="pq-T-main"><div class="pq-T-hd"><span class="pq-T-art">${logo(a)}${logo(b)}</span>${logo(a)}<span class="pq-T-m"><b>Купон · экспресс</b><small>${esc(tn(a))} — ${esc(tn(b))} · матч завершён</small></span>${logo(b)}</div>
        <div class="pq-T-body"><div class="pq-face pq-face--list">${list}</div></div></div>
      <div class="pq-T-cut"></div>
      <div class="pq-T-tear">${got ? `<div class="pq-T-got"><span>✓</span><b>+${t.sum} в Фэнтези</b><small>Баллы зачислены</small></div>` : `
        <div class="pq-T-stub pq-T-stub--cp"><div class="pq-T-tot"><b class="num">+${t.sum}</b><small>баллов · угадано ${t.ok} из 5</small></div>
          <button class="pq-take" data-pq="take">Забрать<small>в Фэнтези</small></button></div>`}</div></div></div>`; };


  // v42–v44 (дирижёр 02.11: «отрывная часть — всегда; пока прогнозы идут — внизу текущие: что угадал, что нет») — window.PQ_LS:
  // slots — 5 ячеек (логотип моего выбора + ✓ / ✕ / … / пусто) · seg — шкала из 5 делений + «угадано 3 из 4» · text — одна строка счёта.
  // Справа — баллы «+35». После матча на этом месте — «+45» и «Забрать в Фэнтези»
  const liveStub = (L, t) => { const K = window.PQ_LS, miss = L.filter(l => l.st === 'no').length, wait = L.filter(l => l.st === 'wait').length,
      done = L.length - wait, all = [...L.map(l => ({ st: l.st, me: l.me })), ...Array(5 - L.length).fill({ st: 'open' })];
    const pts = `<div class="pq-ls-p"><b class="num">+${t.sum}</b><small>баллов</small></div>`;
    if (K === 'slots') return `<div class="pq-T-stub pq-ls pq-ls--slots"><div class="pq-ls-sl">${all.map(x => `<span class="${x.st}">${x.me ? logo(x.me) : ''}<i>${x.st === 'open' ? '' : mark(x.st)}</i></span>`).join('')}</div>${pts}</div>`;
    if (K === 'seg') return `<div class="pq-T-stub pq-ls pq-ls--seg"><div class="pq-ls-c"><div class="pq-seg">${all.map(x => `<i class="${x.st === 'open' ? '' : x.st}"></i>`).join('')}</div>
      <small>${done ? `угадано <b class="num">${t.ok} из ${done}</b>${wait ? ' · 1 ждём' : ''}${L.length < 5 ? ` · ${5 - L.length} впереди` : ''}` : `${wait ? 'ждём исход · ' : ''}5 прогнозов за матч`}</small></div>${pts}</div>`;
    return `<div class="pq-T-stub pq-ls pq-ls--text"><div class="pq-ls-c"><span class="pq-ls-n"><em class="ok">✓ ${t.ok}</em><em class="no">✕ ${miss}</em>${wait ? '<em class="wait">… 1</em>' : ''}</span>
      <small>Заберёшь после матча</small></div>${pts}</div>`; };

  const tkView = () => { const K = window.PQ_TK, post = MM && MM.state === 'post', a = MM && MM.A, b = MM && MM.B;
    // До матча (перенос на страницу, 02.11): первый прогноз — «Первая кровь · Map 1», принимаем до старта; прошлых нет
    const pre = MM && MM.state === 'pre', it = pre ? PRE : ITEMS[st.ci], v = st.a[it.id], shown = v != null;
    const L = pre ? (shown ? [{ ev: it.ev, at: it.at, me: v ? b : a, st: 'wait', pts: 10 }] : []) : seqLegs(post), t = tally(L);
    const open = post || (st.open && !st.anim), anim = st.anim && !post ? ' data-anim="is-list"' : '';
    const row = l => `<div class="pq-s2-r ${l.st}"><span class="pq-s2-d">${logo(l.me)}</span><span class="pq-s2-t"><b>${esc(l.ev)}</b><small>${l.at} · ${esc(tn(l.me))}</small></span><em class="num">${post ? (l.st === 'ok' ? '+' + l.pts : '0') : (l.st === 'wait' ? '<i></i>' : '') + STW[l.st]}</em></div>`;
    const pick = `<div class="pq-b-top"><span class="pq-ev"><i></i>${esc(it.ev)} · ${it.at}</span><span class="num">${shown ? 'принято' : pre ? 'до старта' : 'до 34:40'}</span></div>
      <p class="pq-pk-q">${esc(it.q)}</p>
      <div class="pq-pk-o">${[a, b].map((id, j) => `<button class="${v === j ? 'is-me' : ''}${shown ? ' is-shown' : ''}" data-pq="pick" data-q="${it.id}" data-v="${j}"${shown ? ' disabled' : ''}>
        ${logo(id)}<b>${esc(tn(id))}</b>${shown ? `<em class="num">${it.crowd[j]}%</em><i style="height:${it.crowd[j]}%"></i>` : ''}</button>`).join('')}</div>`;
    const list = `<div class="pq-T-lh"><b>${post ? 'Итог прогнозов' : 'Мой экспресс'}</b><span class="num">${L.length} из 5</span></div><div class="pq-s2">${L.map(row).join('')}</div>`;
    // v32–v34 (дирижёр 02.11: «после матча — купоном; внизу кнопка „Забрать“, переход в фэнтези — на отрывной части»)
    if (post && window.PQ_COUPON) return couponView(K, a, b, L, t, list);
    const stub = post
      ? `<div class="pq-T-tot"><b class="num">+${t.sum}</b><small>баллов · угадано ${t.ok} из 5</small></div>`
      : `<div class="pq-T-tot"><b class="num">+${t.sum}</b><small>набрано · ${L.length} из 5</small></div>`;
    const code = `<div class="pq-T-code">${K === 'art' ? `<div class="pq-qr">${qr('TI26' + a + b)}</div>` : '<div class="pq-bar2"></div>'}<small class="num">TI26 · 8956 7807 28</small></div>`;
    return `<div class="w pq pq--bare"><div class="pq-T pq-T--${K}${open ? ' is-list' : ''}${post ? ' is-post' : ''}${window.PQ_LS ? ' has-cut' : ''}"${anim}>
      <div class="pq-T-main"><div class="pq-T-hd"><span class="pq-T-art">${logo(a)}${logo(b)}</span>${logo(a)}<span class="pq-T-m"><b>${esc(tn(a))} — ${esc(tn(b))}</b><small>The International 2026 · ${post ? 'итог' : 'Map 3'}</small></span>${logo(b)}</div>
        <div class="pq-T-body"><div class="pq-face pq-face--pick">${pick}</div><div class="pq-face pq-face--list">${list}</div></div></div>
      ${K === 'f4' ? (window.PQ_LS ? `<div class="pq-T-cut"></div><div class="pq-T-tear">${liveStub(L, t)}</div>` : '') : `<div class="pq-T-cut"></div>
      <div class="pq-T-stub">${stub}${code}</div>`}</div></div>`; }; // v41 (f4): в live отрывной части нет — она только в итоге

  const seqView = () => { if (window.PQ_TK) return tkView(); if (window.PQ_SKIN) return skinView(); const post = MM && MM.state === 'post', a = MM && MM.A, b = MM && MM.B;
    if (post) { const L = seqLegs(true), t = tally(L);
      return `<div class="w pq pq--bare"><div class="pq-tk is-post${MODE === 'ticket5' ? ' pq-fxh' : ''}">
      <div class="pq-tk-h">${logo(a)}<span><b>${esc(tn(a))} — ${esc(tn(b))}</b><small>Экспресс · итог</small></span>${logo(b)}</div>
      <div class="pq-tk-l">${L.map(l => `<div class="pq-tl ${l.st}">${logo(l.me)}<b>${esc(l.ev)}</b><small>${l.at}</small><em class="num">${l.st === 'ok' ? '+' + l.pts : '0'}</em></div>`).join('')}</div>
      <div class="pq-perf"></div><div class="pq-tk-f"><span>Итого за матч</span><b class="num">+${t.sum}</b></div>
      <div class="pq-stamp"><b class="num">${t.ok} из 5</b><small>угадано</small></div></div></div>`; }
    const it = ITEMS[st.ci], v = st.a[it.id], shown = v != null, L = seqLegs(false), n = 5 - ITEMS.length + st.ci + 1;
    const open = st.open && !st.anim, anim = st.anim ? ' data-anim="is-open"' : '';
    const choice = `<div class="pq-b-top"><span class="pq-ev"><i></i>${esc(it.ev)} · ${it.at}</span><span class="num">${shown ? 'принято' : 'до 34:40'}</span></div>
      <p class="pq-pk-q">${esc(it.q)}</p>
      <div class="pq-pk-o">${[a, b].map((id, j) => `<button class="${v === j ? 'is-me' : ''}${shown ? ' is-shown' : ''}" data-pq="pick" data-q="${it.id}" data-v="${j}"${shown ? ' disabled' : ''}>
        ${logo(id)}<b>${esc(tn(id))}</b>${shown ? `<em class="num">${it.crowd[j]}%</em><i style="height:${it.crowd[j]}%"></i>` : ''}</button>`).join('')}</div>`;
    const rows = MODE === 'ticket5' && window.PQ_LIST ? listBody(L) : `<div class="pq-b-ls">${L.map(l => `<div class="pq-bl ${l.st}"><span class="pq-me2">${logo(l.me)}${esc(tn(l.me))}</span><b>${esc(l.ev)}</b><small>${l.at}</small><em>${mark(l.st)}</em></div>`).join('')}</div>`;
    if (MODE === 'ticket5') // один размер: две стороны в одной коробке, меняются плавно
      return `<div class="w pq pq--bare"><div class="pq-b pq-fx${open ? ' is-list' : ''}"${st.anim ? ' data-anim="is-list"' : ''}>
        <div class="pq-face pq-face--pick">${choice}<div class="pq-b-sub pq-b-sub--end"><span>${n}-й прогноз экспресса</span><span class="num pq-sc">+10 баллов</span></div></div>
        <div class="pq-face pq-face--list"><div class="pq-b-sub"><span>Мой экспресс</span><span class="num">${L.length} из 5</span></div>${rows}
          <p class="pq-fx-n">Следующий прогноз — перед ключевым событием</p></div></div></div>`;
    return `<div class="w pq pq--bare"><div class="pq-b${shown ? ' is-ans' : ''}">${choice}<div class="pq-perf"></div>
      <div class="pq-b-sub"><span>${shown ? 'Мой экспресс' : n + '-й прогноз экспресса'}</span><span class="num${shown ? '' : ' pq-sc'}">${shown ? L.length + ' из 5' : '+10 баллов'}</span></div>
      <div class="pq-x${open ? ' is-open' : ''}"${anim}><div>${rows}</div></div></div></div>`; };
  // ответил → 1,2 с проценты → плавно раскрыть; v12: через 3 с свернуть и показать следующий прогноз
  const PRE = window.DB_FAKE?.predictions.pre ?? { id: 'fb1', ev: 'Первая кровь', at: 'Map 1', q: 'Кто прольёт первую кровь?', crowd: [52, 48], res: 0 };
  const seqPick = btn => { const it = MM && MM.state === 'pre' ? PRE : ITEMS[st.ci]; if (st.a[it.id] != null) return; st.a[it.id] = +btn.dataset.v; draw();
    setTimeout(() => { st.open = true; st.anim = true; draw(); requestAnimationFrame(() => requestAnimationFrame(() => {
      HOSTS.forEach(el => el.querySelectorAll('[data-anim]').forEach(x => x.classList.add(x.dataset.anim))); st.anim = false; })); }, 1200);
    if (MODE === 'ticket4' && st.ci < ITEMS.length - 1) setTimeout(() => {
      HOSTS.forEach(el => el.querySelectorAll('.pq-x').forEach(x => x.classList.remove('is-open')));
      setTimeout(() => { st.ci++; st.open = false; draw(); }, 450); }, 1200 + 450 + 3000); };

  const html = () => SEQ ? seqView() : BARE ? bareView() : VIS ? visView() : MODE === 'short' ? shortView() : MODE === 'moments'
    ? `<div class="w pq pq--moments"><div class="pq-hd"><b>Прогнозы</b><small><span class="num">${HIST.length + (st.a[ACT.id] != null ? 1 : 0)} из 5</span> · <span class="num pq-sc">+${earned()}</span> баллов</small></div>${moments()}</div>`
    : `<div class="w pq pq--${MODE}"><div class="pq-hd"><b>Прогнозы</b><small><span class="num">${done()}/${Q.length}</span> · <span class="num pq-sc">+${score()}</span> баллов</small></div>
    ${MODE === 'list' ? list() : carousel()}</div>`;
  // v35–v37 (дирижёр 02.11: «чуть спокойнее, компактнее, у всех») — window.PQ_CALM: класс pq-T--calm, разница только в CSS
  // v22–v24 (дирижёр 02.11: «база v18, мелочи в дизайне другие») — window.PQ_TW: type | 3d | cyber — класс на виджет, разница только в CSS
  const draw = () => HOSTS.forEach(el => { if (!el.isConnected) return HOSTS.delete(el); MM = el._pqM || MM; const h0 = window.PQ_TW ? html().replace(/class="w pq pq--bare"/g, `class="w pq pq--bare pq-tw pq-tw--${window.PQ_TW}"`) : html(), h = window.PQ_CALM ? h0.replace(/class="pq-T /g, 'class="pq-T pq-T--calm ') : h0; el.innerHTML = h; }); // у каждого места свой матч (el._pqM)

  document.addEventListener('click', e => { const b = e.target.closest('[data-pq]'); if (!b || !b.closest('.pq-host')) return;
    e.preventDefault(); e.stopPropagation(); const a = b.dataset.pq;
    if (a === 'pick' && SEQ) return seqPick(b);
    if (a === 'pick') { const q = [...Q, ACT, { id: 'rosh3s' }, { id: 'rosh3v' }].find(x => x.id === b.dataset.q); if (st.a[q.id] != null) return; st.a[q.id] = +b.dataset.v; save(); draw();
      // карусель: показали проценты толпы — через 1,2 с к следующему неотвеченному
      if (VIS) setTimeout(() => { st.slip = true; draw(); }, 1500);
      if (MODE === 'carousel') setTimeout(() => { const n = firstOpen(); if (n >= 0) { st.i = n; draw(); } else { st.open = false; draw(); } }, 1200); }
    if (a === 'take') { HOSTS.forEach(el => el.querySelectorAll('.pq-T-stub--cp').forEach(x => x.classList.add('is-tear')));
      setTimeout(() => { st.got = true; draw(); }, 650); return; }
    if (a === 'prev') { st.i = (st.i - 1 + Q.length) % Q.length; draw(); }
    if (a === 'next') { st.i = (st.i + 1) % Q.length; draw(); }
    if (a === 'open') { st.open = true; st.i = 0; draw(); }
    if (a === 'reset') { st.a = {}; save(); st.i = 0; st.open = false; draw(); }
  }, true);

  window.GS_VOTE = (el, M) => { MM = M || MM; if (M) el._pqM = M; HOSTS.add(el); el.className = 'pq-host'; draw(); };
})();
