// DB_FAKE: если на странице есть выдуманная база (_db/_fake.js) — данные отсюда берутся из неё (одно место для выдумки); нет — как было
// Лаба widget-vote (созвон 28.10 §3.5: «голосование по событию — как делали в „отеле“, ничего не придумывать»; дирижёр 29.10: «простой — выбор из трёх вариантов»).
// Вид — как опрос HotelAI (AI Assistant 2, frontend/components/survey/SurveyWidget.tsx, вид по умолчанию «В20»): шапка — круглый значок 40 и вопрос крупно (18/24),
// под ним подпись 13/16; под шапкой — полоса хода 2 px; ответы — врезка со скруглением 18 и рамкой, строки 44 со стрелкой справа, разделители от текста.
// Тап → строка подсвечена 700 мс («гость должен увидеть, что попал»), затем итог: проценты полосой в тех же строках, у твоего — галочка.
// v2 (дирижёр 29.10: «теперь в нашей стилистике»): window.VT_LOOK = 'ours' — как наши виджеты: карточка 12, шапка 36 (название --t-title, справа счётчик голосов --t-sub),
// вопрос строкой --t-title и событие --t-sub, строки 40 со скруглением 8 и наведением --w-mid-bg (как строки турнира), итог — полоса подложкой, проценты --t-num-s.
// v3–v4 (дирижёр 29.10: «трибуны прикольные, с таймером — не минута, а 5; отдельно версия с тремя минутами и трибунами — как раз два вопроса»): window.VT_TIMER — секунд на вопрос,
// идёт обратный отсчёт и полоса тает; кончилось — «Голосование закрыто», итог. window.VT_TRIB — в итоге у каждого варианта, как голосовали трибуны: доля фанатов Spirit / Vision.
// window.VT_Q2 — два вопроса подряд (по 3 мин): ответил на первый или время вышло — открывается второй; «Вопрос 1 из 2».
// v5 (дирижёр 29.10: «первым вопросом выбираешь, за кого болеешь, вторым — ответ; так распределяешься в голосах»): window.VT_FAN — шаг 1 «За кого болеешь?»
// (Spirit · Vision · Ни за кого), шаг 2 — сам вопрос; итог — у каждого варианта доли трибун Spirit / Vision / нейтральные, и «ты — в трибуне …». Таймер — VT_TIMER на оба шага.
// v6 (дирижёр 29.10, скрин v5: «другому мне непонятно, кто за кого голосовал»): window.VT_FAN2 — под каждым вариантом строка трибун цифрами:
// [лого Spirit] 70 % · [—] 18 % · [лого Vision] 12 % и под ней та же полоска (в v5 полоска схлопывалась в 0 — flex:1 в колонке); у твоей трибуны цифра ярче.
// v7–v9 (дирижёр 29.10: «ставь пока v5; ещё вариации: по-другому показать проценты, убрать полосу, таймер покрасивее, ближе к нашему стилю; „голос учтён“ — не нужно,
// понятно по состоянию»): window.VT_RES — как показать итог, у всех без полосы хода и без «голос учтён»:
// num — процент крупной цифрой слева, трибуны тремя цифрами с лого справа; таймер — кольцо вокруг значка часов ·
// stack — строка сама заливается на свой %, и заливка поделена на трибуны (зелёный / серый / красный); таймер — пилюля, тает изнутри ·
// cols — три столбика рядом, высота = %, внутри — трибуны слоями; таймер — моноширинные цифры, двоеточие мигает.
// v10–v11 (дирижёр 29.10: «оставь v6–v9, ещё пару вариаций»): VT_RES = 'sides' — итог двумя колонками по трибунам (как ответили фанаты Spirit и фанаты Vision),
// таймер — три сегмента по минуте, гаснут · VT_RES = 'chips' — у ответа стопка аватарок проголосовавших и «+N», трибуны — цветные точки с цифрами, таймер — тихий текст «осталось 2:41».
// v12 (дирижёр 29.10: «v7 и v8 соединим: итог из v8, но доработать, чтобы понятно, кто за что; время — красным, как LIVE в соседнем виджете»): VT_RES = 'mix' —
// строка заливается на свой %, заливка поделена на трибуны (v8), под ответом — трибуны цифрами с лого (v7), над полосой — подписи сегментов не нужны;
// легенда — с лого вместо цветных чёрточек; таймер — кольцо (v7) красным, с пульсирующей точкой, как LIVE на экране «Обсуждения».
// v13–v15 (дирижёр 29.10, скрины v12: «круг убери — только мигающая точка и время моношрифтом; логика итога нравится, реализация — нет; у вариантов ответа — цветные иконки;
// оставляем v12, на его основе — разные версии»): window.VT_V13 — таймер: красная мигающая точка + время моношрифтом; у ответов цветные значки (лого Spirit, лого Vision, песочные часы);
// итог трибун по VT_RES: bar — под ответом тонкая сегментная полоса на % ответа, сегменты — трибуны, цифры с лого справа от полосы ·
// pills — без полос: % крупно, справа три пилюли трибун с лого и цифрой на подложке своего цвета · waffle — квадратики-«люди»: один = 5 % голосов, цвет — трибуна.
// v16–v19 (дирижёр 29.10: «зачем и заголовок „Голосование“, и „За кого болеешь“ — оставляем один; таймер меньше, а то больше заголовка; значки — залитые, как у Google,
// не про команды, а про смысл: победа, камбэк, время; покажи ещё»): window.VT_V16 — шапки «Голосование» нет: заголовок — сам вопрос, таймер в его строке, мелко (моно 11, точка 5);
// значки ответов — Material залитые: кубок (победа, янтарь), стрелка вверх (камбэк, голубой), песочные часы (долго, фиолетовый). v16–v18 — итог как v13–v15; v19 — новая идея:
// duel — у ответа полоса трибун от центра: фанаты Spirit — влево зелёным, фанаты Vision — вправо красным, видно, чья трибуна за этот ответ.
// v20 (дирижёр 29.10: «только в лайве или с актуальным контентом до — немного по-другому»): до матча — вопрос про серию («Кто выиграет серию?»: Spirit / Vision / будет 3 карты),
// подпись «голосование закроется на старте», вместо красного таймера — серое «до старта 1:24», время не истекает.
// Хозяин — ../gs-match/_gs.js (виджет vote2, сразу после «Обсуждения»). ‼️ Голоса — заглушка.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const SV = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const CHEV = SV('<path d="m9 6 6 6-6 6"/>'), CHECK = SV('<path d="M5 12l4 4 10-10"/>'), POLL = SV('<path d="M5 20V10M12 20V4M19 20v-7"/>');
  const Q = { q: 'Что дальше после Рошана?', sub: 'Spirit забрали Рошана · 24:10 · карта 3', opts: [['Spirit закроют карту', 1840], ['Vision отыграются', 760], ['Будет ещё долго', 410]] };
  const ST = { pick: null, done: false };
  const total = () => Q.opts.reduce((a, [, n], i) => a + n + (ST.pick === i ? 1 : 0), 0);
  const draw = el => {
    el.className = 'w vt' + (window.VT_LOOK === 'ours' ? ' vt--ours' : '');
    if (window.VT_LOOK === 'ours') return drawOurs(el);
    const rows = Q.opts.map(([t, n], i) => {
      if (!ST.done) return `<button class="vt-r${ST.pick === i ? ' is-sel' : ''}" data-vt="${i}"><span>${esc(t)}</span><i>${CHEV}</i></button>`;
      const pc = Math.round((n + (ST.pick === i ? 1 : 0)) / total() * 100);
      return `<div class="vt-r is-res${ST.pick === i ? ' is-me' : ''}"><b class="vt-bar" style="width:${pc}%"></b><span>${esc(t)}</span>${ST.pick === i ? `<i class="vt-ok">${CHECK}</i>` : ''}<em class="num">${pc}%</em></div>`;
    }).join('');
    el.innerHTML = `<div class="vt-hd"><span class="vt-ic">${POLL}</span><span class="vt-tt"><b>${ST.done ? 'Спасибо, голос учтён' : esc(Q.q)}</b><small>${ST.done ? `${esc(Q.q)} · ${total().toLocaleString('ru')} голосов` : esc(Q.sub)}</small></span></div>
      <div class="vt-pg"><i style="width:${ST.done ? 100 : ST.pick != null ? 60 : 0}%"></i></div>
      <div class="vt-rows">${rows}</div>`;
  };
  // v2 — наша стилистика
  const drawOurs = el => {
    const rows = Q.opts.map(([t, n], i) => {
      if (!ST.done) return `<button class="vo-r${ST.pick === i ? ' is-sel' : ''}" data-vt="${i}"><i class="vo-dot"></i><span>${esc(t)}</span></button>`;
      const pc = Math.round((n + (ST.pick === i ? 1 : 0)) / total() * 100);
      return `<div class="vo-r is-res${ST.pick === i ? ' is-me' : ''}"><b class="vo-bar" style="width:${pc}%"></b>${ST.pick === i ? `<i class="vo-ok">${CHECK}</i>` : '<i class="vo-dot"></i>'}<span>${esc(t)}</span><em class="num">${pc}%</em></div>`;
    }).join('');
    el.innerHTML = `<div class="vo-hd"><b>Голосование</b><small class="num">${total().toLocaleString('ru')} голосов</small></div>
      <div class="vo-q"><b>${esc(Q.q)}</b><small>${esc(Q.sub)}</small></div><div class="vo-rows">${rows}</div>${ST.done ? '<p class="vo-ft">Голос учтён · итог после карты</p>' : ''}`;
  };
  // v3–v4 — таймер и трибуны (opts: текст, голоса, доля фанатов Spirit среди голосов за вариант, %)
  const QS = window.DB_FAKE?.votes.questions ?? [{ q: 'Что дальше после Рошана?', sub: 'Spirit забрали Рошана · 24:10', opts: [['Spirit закроют карту', 1840, 82], ['Vision отыграются', 760, 14], ['Будет ещё долго', 410, 47]] },
    { q: 'Кто сделает больше убийств до 35:00?', sub: 'Карта 3 · сейчас 31:05', opts: [['Yatoro', 1210, 88], ['Satanic', 980, 9], ['Collapse', 520, 71]] }];
  const T = { qi: 0, left: [0, 0], pick: [null, null], shown: [false, false], tick: null };
  const lg = k => `<img class="vo-lg" src="img/teams/${k === 'a' ? 7119388 : 9572001}.png" alt="" />`;
  const mmss = x => `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`;
  const tot = i => QS[i].opts.reduce((a, [, n], k) => a + n + (T.pick[i] === k ? 1 : 0), 0);
  const drawT = el => {
    const i = T.qi, Qx = QS[i], open = T.left[i] > 0 && !T.shown[i], dur = window.VT_TIMER, n2 = window.VT_Q2 ? 2 : 1;
    const rows = Qx.opts.map(([t, n, sp], k) => {
      if (open) return `<button class="vo-r${T.pick[i] === k ? ' is-sel' : ''}" data-vt2="${k}"><i class="vo-dot"></i><span>${esc(t)}</span></button>`;
      const pc = Math.round((n + (T.pick[i] === k ? 1 : 0)) / tot(i) * 100), me = T.pick[i] === k;
      const trib = window.VT_TRIB ? `<span class="vo-tr">${lg('a')}<i class="vo-trb"><u style="width:${sp}%"></u></i>${lg('b')}<small class="num">${sp} / ${100 - sp}</small></span>` : '';
      return `<div class="vo-r is-res vo-r--t${me ? ' is-me' : ''}"><b class="vo-bar" style="width:${pc}%"></b>${me ? `<i class="vo-ok">${CHECK}</i>` : '<i class="vo-dot"></i>'}<span class="vo-tx">${esc(t)}${trib}</span><em class="num">${pc}%</em></div>`;
    }).join('');
    const timer = open ? `<span class="vo-tm num">${SV('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>')}${mmss(T.left[i])}</span>` : `<small>${T.left[i] > 0 ? 'голос учтён' : 'закрыто'}</small>`;
    const steps = n2 > 1 ? `<span class="vo-st">${[0, 1].map(k => `<i class="${k === i ? 'on' : k < i ? 'done' : ''}"></i>`).join('')}<small>Вопрос ${i + 1} из 2</small></span>` : '';
    const next = n2 > 1 && i === 0 && !open ? `<button class="vo-next" data-vt2n>Следующий вопрос →</button>` : '';
    el.innerHTML = `<div class="vo-hd"><b>Голосование</b>${timer}</div><div class="vo-pg"><i style="width:${open ? T.left[i] / dur * 100 : 0}%"></i></div>
      <div class="vo-q">${steps}<b>${esc(Qx.q)}</b><small>${esc(Qx.sub)} · ${tot(i).toLocaleString('ru')} голосов</small></div><div class="vo-rows">${rows}</div>
      ${!open && window.VT_TRIB ? `<p class="vo-ft">${lg('a')}фанаты Spirit · ${lg('b')}фанаты Vision — как голосовали трибуны</p>` : ''}${next}`;
  };
  const startT = el => { T.left = [window.VT_TIMER, window.VT_TIMER]; clearInterval(T.tick);
    T.tick = setInterval(() => { const i = T.qi; if (T.left[i] > 0) { T.left[i]--; if (T.left[i] === 0 && window.VT_Q2 && i === 0) { /* время вышло — итог, кнопка «следующий» */ } drawT(el); } }, 1000); drawT(el); };
  // v5 — шаг «за кого болеешь» → вопрос; итог по трибунам (opts: текст, голоса, % Spirit, % Vision среди голосов за вариант; остальное — нейтральные)
  const FQ_PRE = { q: 'Кто выиграет серию?', sub: 'Голосование закроется на старте матча', opts: [['Spirit победят', 2210, 88, 4], ['Vision победят', 1380, 6, 81], ['Будет три карты', 690, 41, 37]] };
  let PREV = false;
  const FQ = window.DB_FAKE?.votes.featured ?? { q: 'Что дальше после Рошана?', sub: 'Spirit забрали Рошана · 24:10', opts: [['Spirit закроют карту', 1840, 70, 12], ['Vision отыграются', 760, 9, 78], ['Будет ещё долго', 410, 34, 30]] };
  Object.defineProperty(window, '__vtLive', { value: JSON.parse(JSON.stringify(FQ)) });
  const FANS = [['a', 'Spirit'], ['b', 'Vision'], ['n', 'Ни за кого']];
  const F = { fan: null, pick: null, step: 0, done: false, left: 0, tick: null };
  const fanIc = k => k === 'n' ? `<i class="vo-nt">${SV('<circle cx="12" cy="12" r="8"/><path d="M8 12h8"/>')}</i>` : `<img class="vo-flg" src="img/teams/${k === 'a' ? 7119388 : 9572001}.png" alt="" />`;
  // v13: цветные значки ответов — лого Spirit, лого Vision, песочные часы (янтарь)
  // v16: залитые значки Material — кубок, рост, песочные часы
  const MI = ['<path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>',
    '<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>', '<path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>'];
  const optIc16 = k => `<i class="vo-mi vo-mi--${k}"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">${MI[k]}</svg></i>`;
  const optIc = k => window.VT_V16 ? optIc16(k) : k === 0 ? `<img class="vo-oi" src="img/teams/7119388.png" alt="" />` : k === 1 ? `<img class="vo-oi" src="img/teams/9572001.png" alt="" />` : `<i class="vo-oi vo-oi--t">${SV('<path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/>')}</i>`;
  const ftot = () => FQ.opts.reduce((a, [, n], k) => a + n + (F.pick === k ? 1 : 0), 0);
  const drawF = el => { if (window.VT_RES) return drawR(el);
    const open = F.left > 0 && !F.done, dur = window.VT_TIMER;
    let body;
    if (F.step === 0) body = `<div class="vo-q"><span class="vo-st"><i class="on"></i><i></i><small>Шаг 1 из 2</small></span><b>За кого болеешь?</b><small>Так твой голос попадёт в свою трибуну</small></div>
      <div class="vo-rows">${FANS.map(([k, t]) => `<button class="vo-r${F.fan === k ? ' is-sel' : ''}" data-vf="${k}">${fanIc(k)}<span>${t}</span></button>`).join('')}</div>`;
    else if (!F.done && open) body = `<div class="vo-q"><span class="vo-st"><i class="done"></i><i class="on"></i><small>Шаг 2 из 2 · ты за ${F.fan === 'n' ? 'нейтралов' : F.fan === 'a' ? 'Spirit' : 'Vision'}</small></span><b>${esc(FQ.q)}</b><small>${esc(FQ.sub)}</small></div>
      <div class="vo-rows">${FQ.opts.map(([t], k) => `<button class="vo-r${F.pick === k ? ' is-sel' : ''}" data-vp="${k}"><i class="vo-dot"></i><span>${esc(t)}</span></button>`).join('')}</div>`;
    else body = `<div class="vo-q"><b>${esc(FQ.q)}</b><small>${ftot().toLocaleString('ru')} голосов${F.fan ? ` · ты в трибуне ${F.fan === 'n' ? 'нейтралов' : F.fan === 'a' ? 'Spirit' : 'Vision'}` : ''}</small></div>
      <div class="vo-rows">${FQ.opts.map(([t, n, sp, vp], k) => { const pc = Math.round((n + (F.pick === k ? 1 : 0)) / ftot() * 100), me = F.pick === k;
        return `<div class="vo-r is-res vo-r--t${me ? ' is-me' : ''}"><b class="vo-bar" style="width:${pc}%"></b>${me ? `<i class="vo-ok">${CHECK}</i>` : '<i class="vo-dot"></i>'}<span class="vo-tx">${esc(t)}
          ${window.VT_FAN2 ? `<span class="vo-tn num">${[['a', sp], ['n', 100 - sp - vp], ['b', vp]].map(([g, v]) => `<span class="${F.fan === g ? 'is-my' : ''}">${fanIc(g)}${v}%</span>`).join('')}</span>` : ''}<span class="vo-tr3"><i style="width:${sp}%" class="a"></i><i style="width:${100 - sp - vp}%" class="n"></i><i style="width:${vp}%" class="b"></i></span></span><em class="num">${pc}%</em></div>`; }).join('')}</div>
      ${window.VT_FAN2 ? '<p class="vo-ft">Под каждым ответом — как проголосовали трибуны: фанаты Spirit, нейтральные, фанаты Vision</p>' : '<p class="vo-ft vo-leg"><span><i class="a"></i>Spirit</span><span><i class="n"></i>нейтральные</span><span><i class="b"></i>Vision</span></p>'}`;
    const timer = open ? `<span class="vo-tm num">${SV('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>')}${mmss(F.left)}</span>` : `<small>${F.done && F.left > 0 ? 'голос учтён' : 'закрыто'}</small>`;
    el.innerHTML = `<div class="vo-hd"><b>Голосование</b>${timer}</div><div class="vo-pg"><i style="width:${open ? F.left / dur * 100 : 0}%"></i></div>${body}`;
  };
  const startF = el => { F.left = window.VT_TIMER; clearInterval(F.tick); F.tick = setInterval(() => { if (PREV) return; if (F.left > 0) { F.left--; if (!F.left) F.done = true; drawF(el); } }, 1000); drawF(el); };
  // v7–v9 — итог и таймер по VT_RES
  const ring = (left, dur) => { const r = 7, c = 2 * Math.PI * r; return `<span class="vr-ring num"><svg viewBox="0 0 18 18" width="18" height="18"><circle cx="9" cy="9" r="${r}" class="bg"/><circle cx="9" cy="9" r="${r}" class="fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - left / dur)}"/></svg>${mmss(left)}</span>`; };
  const pill = (left, dur) => `<span class="vr-pill num"><i style="width:${left / dur * 100}%"></i><b>${mmss(left)}</b></span>`;
  const mono = left => { const [m, sec] = mmss(left).split(':'); return `<span class="vr-mono">${m}<i>:</i>${sec}</span>`; };
  const drawR = el => {
    const v = window.VT_RES, open = F.left > 0 && !F.done, dur = window.VT_TIMER;
    const segs = `<span class="vr-segs">${[0, 1, 2].map(k => { const part = Math.max(0, Math.min(1, (F.left - k * dur / 3) / (dur / 3))); return `<i><u style="width:${part * 100}%"></u></i>`; }).join('')}<b class="num">${mmss(F.left)}</b></span>`;
    const tm = !open ? '' : window.VT_V13 ? `<span class="vr-live vr-live--mono"><i></i><b>${mmss(F.left)}</b></span>` : v === 'mix' ? `<span class="vr-live"><i></i>${ring(F.left, dur)}</span>` : v === 'num' ? ring(F.left, dur) : v === 'stack' ? pill(F.left, dur) : v === 'sides' ? segs : v === 'chips' ? `<small class="vr-quiet num">осталось ${mmss(F.left)}</small>` : mono(F.left);
    const who = F.fan ? (F.fan === 'n' ? 'нейтралов' : F.fan === 'a' ? 'Spirit' : 'Vision') : '';
    let body;
    if (F.step === 0) body = `<div class="vo-q"><b>За кого болеешь?</b><small>Голос попадёт в твою трибуну · шаг 1 из 2</small></div>
      <div class="vo-rows">${FANS.map(([k, t]) => `<button class="vo-r${F.fan === k ? ' is-sel' : ''}" data-vf="${k}">${fanIc(k)}<span>${t}</span></button>`).join('')}</div>`;
    else if (!F.done && open) body = `<div class="vo-q"><b>${esc(FQ.q)}</b><small>${esc(FQ.sub)} · шаг 2 из 2</small></div>
      <div class="vo-rows">${FQ.opts.map(([t], k) => `<button class="vo-r${F.pick === k ? ' is-sel' : ''}" data-vp="${k}">${window.VT_V13 ? optIc(k) : '<i class="vo-dot"></i>'}<span>${esc(t)}</span></button>`).join('')}</div>`;
    else { const P = FQ.opts.map(([t, n, sp, vp], k) => ({ t, sp, vp, np: 100 - sp - vp, me: F.pick === k, pc: Math.round((n + (F.pick === k ? 1 : 0)) / ftot() * 100) }));
      const tribs = o => [['a', o.sp], ['n', o.np], ['b', o.vp]].map(([g, x]) => `<span class="${F.fan === g ? 'is-my' : ''}">${fanIc(g)}${x}</span>`).join('');
      const AVS = ['101356886', '10366616', '100058342', '103735745', '1044002267'];
      const sides = () => { const col = (g, name) => { const raw = P.map(o => g === 'a' ? o.sp * o.pc : o.vp * o.pc), sum = raw.reduce((x, y) => x + y, 0), pcs = raw.map(x => Math.round(x / sum * 100)), top = pcs.indexOf(Math.max(...pcs));
          return `<div class="vr-sd${F.fan === g ? ' is-my' : ''}"><div class="vr-sdh">${fanIc(g)}<b>Фанаты ${name}</b></div>${P.map((o, k) => `<div class="vr-sdr${k === top ? ' is-top' : ''}"><span>${esc(o.t)}</span><b class="num">${pcs[k]}%</b></div>`).join('')}</div>`; };
        return `<div class="vr-sides">${col('a', 'Spirit')}${col('b', 'Vision')}</div>`; };
      const chips = () => `<div class="vo-rows">${P.map((o, k) => `<div class="vr-ch${o.me ? ' is-me' : ''}"><div class="vr-cht"><span>${esc(o.t)}${o.me ? ` <i class="vo-ok">${CHECK}</i>` : ''}</span><b class="num">${o.pc}%</b></div>
          <div class="vr-chb"><span class="vr-avs">${AVS.slice(0, 3 + (k === 0 ? 2 : k === 1 ? 1 : 0)).map(a => `<img src="img/players/${a}.jpg" alt="" />`).join('')}<small class="num">+${(FQ.opts[k][1] - 5).toLocaleString('ru')}</small></span>
          <span class="vr-dots num"><span><i class="a"></i>${o.sp}</span><span><i class="n"></i>${o.np}</span><span><i class="b"></i>${o.vp}</span></span></div></div>`).join('')}</div>`;
      const mixR = () => `<div class="vo-rows">${P.map(o => `<div class="vr-sr vr-sr--mix${o.me ? ' is-me' : ''}"><span class="vr-fill" style="width:${o.pc}%"><i class="a" style="flex:${o.sp}"></i><i class="n" style="flex:${o.np}"></i><i class="b" style="flex:${o.vp}"></i></span>
          <span class="vr-mt"><span class="vr-st">${esc(o.t)}${o.me ? ` <i class="vo-ok">${CHECK}</i>` : ''}</span><span class="vr-tn num">${tribs(o)}</span></span><em class="num">${o.pc}%</em></div>`).join('')}</div>
          <p class="vo-ft vr-leg2"><span>${fanIc('a')}<i class="a"></i>фанаты Spirit</span><span>${fanIc('n')}<i class="n"></i>нейтральные</span><span>${fanIc('b')}<i class="b"></i>фанаты Vision</span></p>`;
      const head = (o, k) => `<span class="vr-h3">${optIc(k)}<span class="vr-st">${esc(o.t)}${o.me ? ` <i class="vo-ok">${CHECK}</i>` : ''}</span><em class="num">${o.pc}%</em></span>`;
      const tn = o => `<span class="vr-tn num">${tribs(o)}</span>`;
      const barR = () => `<div class="vr-l3">${P.map((o, k) => `<div class="vr-r3${o.me ? ' is-me' : ''}">${head(o, k)}<span class="vr-b3"><span class="vr-sg" style="width:${o.pc}%"><i class="a" style="flex:${o.sp}"></i><i class="n" style="flex:${o.np}"></i><i class="b" style="flex:${o.vp}"></i></span></span>${tn(o)}</div>`).join('')}</div>`;
      const pillR = () => `<div class="vr-l3">${P.map((o, k) => `<div class="vr-r3${o.me ? ' is-me' : ''}">${head(o, k)}<span class="vr-pl3">${[['a', o.sp], ['n', o.np], ['b', o.vp]].map(([g, x]) => `<span class="vr-p3 ${g}${F.fan === g ? ' is-my' : ''}">${fanIc(g)}<b class="num">${x}%</b></span>`).join('')}</span></div>`).join('')}</div>`;
      const waffle = () => `<div class="vr-l3">${P.map((o, k) => { const cells = Math.round(o.pc / 5), a = Math.round(cells * o.sp / 100), b = Math.round(cells * o.vp / 100), n = Math.max(0, cells - a - b);
          return `<div class="vr-r3${o.me ? ' is-me' : ''}">${head(o, k)}<span class="vr-wf">${'<i class="a"></i>'.repeat(a)}${'<i class="n"></i>'.repeat(n)}${'<i class="b"></i>'.repeat(b)}${'<i class="e"></i>'.repeat(20 - cells)}</span>${tn(o)}</div>`; }).join('')}<p class="vo-ft">Один квадратик — 5 % голосов</p></div>`;
      const duel = () => `<div class="vr-l3">${P.map((o, k) => `<div class="vr-r3${o.me ? ' is-me' : ''}">${head(o, k)}<span class="vr-du"><span class="vr-dl">${fanIc('a')}<b class="num">${o.sp}</b><i><u style="width:${o.sp}%"></u></i></span><span class="vr-dr"><i><u style="width:${o.vp}%"></u></i><b class="num">${o.vp}</b>${fanIc('b')}</span></span></div>`).join('')}<p class="vo-ft">Слева — сколько фанатов Spirit за ответ, справа — фанатов Vision, %</p></div>`;
      const res = window.VT_V13 && v === 'duel' ? duel() : window.VT_V13 && v === 'bar' ? barR() : window.VT_V13 && v === 'pills' ? pillR() : window.VT_V13 && v === 'waffle' ? waffle() : v === 'mix' ? mixR() : v === 'sides' ? sides() : v === 'chips' ? chips() : v === 'num' ? `<div class="vr-num">${P.map(o => `<div class="vr-nr${o.me ? ' is-me' : ''}"><b class="num">${o.pc}<small>%</small></b><span class="vr-nt"><span>${esc(o.t)}${o.me ? ` <i class="vo-ok">${CHECK}</i>` : ''}</span><span class="vr-tn num">${tribs(o)}</span></span></div>`).join('')}</div>`
        : v === 'stack' ? `<div class="vo-rows">${P.map(o => `<div class="vr-sr${o.me ? ' is-me' : ''}"><span class="vr-fill" style="width:${o.pc}%"><i class="a" style="flex:${o.sp}"></i><i class="n" style="flex:${o.np}"></i><i class="b" style="flex:${o.vp}"></i></span><span class="vr-st">${esc(o.t)}${o.me ? ` <i class="vo-ok">${CHECK}</i>` : ''}</span><em class="num">${o.pc}%</em></div>`).join('')}</div>
          <p class="vo-ft vo-leg"><span><i class="a"></i>фанаты Spirit</span><span><i class="n"></i>нейтральные</span><span><i class="b"></i>фанаты Vision</span></p>`
        : `<div class="vr-cols">${P.map(o => `<div class="vr-c${o.me ? ' is-me' : ''}"><b class="num">${o.pc}%</b><span class="vr-cb"><span class="vr-cf" style="height:${o.pc}%"><i class="b" style="flex:${o.vp}"></i><i class="n" style="flex:${o.np}"></i><i class="a" style="flex:${o.sp}"></i></span></span><small>${esc(o.t)}</small></div>`).join('')}</div>
          <p class="vo-ft vo-leg"><span><i class="a"></i>Spirit</span><span><i class="n"></i>нейтральные</span><span><i class="b"></i>Vision</span></p>`;
      body = `<div class="vo-q"><b>${esc(FQ.q)}</b><small>${ftot().toLocaleString('ru')} голосов${who ? ` · ты в трибуне ${who}` : ''}</small></div>${res}`; }
    if (window.VT_V16) { const tm16 = open ? (PREV ? '<span class="vr-pre">до старта 1:24</span>' : `<span class="vr-live vr-live--sm"><i></i><b>${mmss(F.left)}</b></span>`) : '';
      el.innerHTML = body.replace('<div class="vo-q">', `<div class="vo-q vo-q--hd">`).replace(/(<div class="vo-q vo-q--hd">)(<b>[^<]*<\/b>)/, `$1<span class="vo-qh">$2${tm16}</span>`); return; }
    el.innerHTML = `<div class="vo-hd"><b>Голосование</b>${tm}</div>${body}`;
  };
  let host;
  window.GS_VOTE = (el, M) => { const pre = !!(M && M.state === 'pre'); if (pre !== PREV) { PREV = pre; Object.assign(FQ, pre ? FQ_PRE : window.__vtLive); } host = el; if (window.VT_FAN) { el.className = 'w vt vt--ours'; return F.tick ? drawF(el) : startF(el); } if (window.VT_TIMER) { el.className = 'w vt vt--ours'; return T.tick ? drawT(el) : startT(el); } draw(el); };
  document.addEventListener('click', e => {
    const vf = e.target.closest('[data-vf]');
    if (vf) { if (F.fan) return; F.fan = vf.dataset.vf; drawF(host); return void setTimeout(() => { F.step = 1; drawF(host); }, 700); }
    const vp = e.target.closest('[data-vp]');
    if (vp) { if (F.pick != null) return; F.pick = +vp.dataset.vp; drawF(host); return void setTimeout(() => { F.done = true; drawF(host); }, 700); }
    const b2 = e.target.closest('[data-vt2]');
    if (b2) { const i = T.qi; if (T.pick[i] != null) return; T.pick[i] = +b2.dataset.vt2; drawT(host); return void setTimeout(() => { T.shown[i] = true; drawT(host); }, 700); }
    if (e.target.closest('[data-vt2n]')) { T.qi = 1; return drawT(host); }
    const b = e.target.closest('[data-vt]'); if (!b || ST.pick != null) return;
    ST.pick = +b.dataset.vt; draw(host);
    setTimeout(() => { ST.done = true; draw(host); }, 700); // пауза «нажал → итог», как ПАУЗА_ВЫБОРА в HotelAI
  });
})();
