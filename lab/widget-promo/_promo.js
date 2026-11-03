// DB_FAKE: если на странице есть выдуманная база (_db/_fake.js) — данные отсюда берутся из неё (одно место для выдумки); нет — как было
// Лаба widget-promo (созвон 28.10 §3.8: «квадратный виджет — либо мем, либо наша графика»; дирижёр 29.10: «выводится из обсуждения матча самое залайканное… как на Пикабу; чат матча как на Sports.ru, реакции — разные концепции»).
// Хозяин — ../gs-match/_gs.js (виджет promo): GS_PROMO(el) рисует квадрат, место в правой колонке — GS_PROMO_AT (top · mid · end).
// PROMO_KIND: ours — наша графика (v1) · top — топ обсуждения: самое залайканное за 10 минут, текст или мем (v2) · chat — чат матча, лента идёт вживую (v3) ·
// react — реакции на последнее событие карты + лучший коммент к нему (v4) · hot — «Горячее»: три поста с рейтингом (v5) · wall — мемы из чата сеткой 2×2 (v6).
// v7–v11 (дирижёр 29.10: «как на YouTube и Twitch выделяют лучшее или спонсорское»): ticker — полоса закрепов, как Super Chat · pin — закреп редакции «пост матча» ·
// boost — выделение за очки Fantasy, цвет и время по ставке (как Super Chat / Hype Chat) · hype — шкала хайпа 1–5 от лайков и реакций (как Hype Train) · predict — прогноз на очки (как Predictions на Twitch).
// ‼️ Комментариев в данных нет — тексты, ники и лайки выдуманы; картинки мемов — заглушки (герои), пути от ../gs-match/ (base href страницы).
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const HEART = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>';
  const av = n => `<i class="pr-av" style="--h:${[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 360}">${esc(n[0].toUpperCase())}</i>`;
  const like = (n, on) => `<button class="pr-like${on ? ' on' : ''}" data-pr="like">${HEART}<span class="num">${n}</span></button>`;
  const all = (t = 'Всё обсуждение') => `<button class="pr-all" data-a="toast" data-v="Обсуждение матча — сайдбар (шаг 5)">${t} →</button>`;
  const IMG = h => `img/heroes/${h}.png`;

  // Посты обсуждения: img — мем (картинка + подпись), иначе текст
  const POSTS = window.DB_FAKE?.posts ?? [
    { n: 'roshan_enjoyer', t: 'Когда Yatoro купил шестой слот на 24-й минуте', img: 'terrorblade', l: 1240, m: '3 мин' },
    { n: 'miposhka_fan', t: 'Vision опять отдали Рошана без боя. Третий раз за серию одна и та же ошибка — смоки на верхнюю линию и никто не смотрит на реку.', l: 812, m: '6 мин' },
    { n: 'bkb_timing', t: 'Collapse на Марсе — лучший инициатор турнира, без вариантов', l: 655, m: '1 мин' },
    { n: 'tinker_main', t: 'Spirit на 20-й минуте vs Spirit на 40-й', img: 'faceless_void', l: 590, m: '8 мин' },
    { n: 'glhf_dota', t: 'Если Vision не заберут мид сейчас — карта всё', l: 402, m: '2 мин' },
    { n: 'nix_pls', t: 'Миду Vision нужен Блинк, а не третий предмет на ману', img: 'storm_spirit', l: 377, m: '4 мин' },
  ];
  const CHAT = window.DB_FAKE?.chat.promo ?? [['ez4ence', 'ГГ, Рошан ушёл'], ['shadow_fiend', 'Ларл чуть не отдал керри'], ['volvo_pls', 'пауза? чего стоим'], ['dota_dad', 'Spirit играют в свою игру, Vision догоняют'],
    ['ancient_one', 'этот Black Hole 🔥'], ['rax_down', 'топ-рачки упали'], ['mid_or_feed', 'Vision, купите варды, пожалуйста'], ['pos5_life', 'саппорты Spirit везде'], ['ti2026', 'это финал года, без шансов скучать']];

  const ours = () => `<div class="pr-ours"><small>Fantasy · Dota 2</small><b>Собери пятёрку на The International 2026</b><span>Очки — за каждую карту этого матча</span><button class="pr-btn" data-a="toast" data-v="Fantasy (демо)">Играть</button></div>`;

  // v2 — топ обсуждения: один пост, самый залайканный за 10 минут; точки — переключить на 2-й и 3-й
  const topPost = (p, i) => `<div class="pr-top">
      <div class="pr-cap"><b>🔥 Топ обсуждения</b><small>за 10 минут</small></div>
      ${p.img ? `<div class="pr-mm"><img src="${IMG(p.img)}" alt="" /><b>${esc(p.t)}</b></div>` : `<p class="pr-txt">${esc(p.t)}</p>`}
      <div class="pr-ft">${av(p.n)}<span class="pr-nk">${esc(p.n)} · ${p.m}</span>${like(p.l)}</div>
      <div class="pr-dots">${[0, 1, 2].map(k => `<button data-pr="top" data-v="${k}" class="${k === i ? 'on' : ''}" aria-label="Топ ${k + 1}"></button>`).join('')}${all()}</div></div>`;

  // v3 — чат матча: лента идёт снизу вверх, у каждого сообщения ♡; поле «Написать»
  const msg = ([n, t], l) => `<div class="pr-msg">${av(n)}<p><b>${esc(n)}</b>${esc(t)}</p>${l ? `<span class="pr-ml">${HEART}${l}</span>` : ''}</div>`;
  const chat = () => `<div class="pr-chat"><div class="pr-cap"><b><i class="pr-live"></i>Чат матча</b><small class="num">2 418 в чате</small></div>
      <div class="pr-feed">${CHAT.slice(0, 6).map((c, i) => msg(c, i === 3 ? 48 : 0)).join('')}</div>
      <button class="pr-inp" data-a="toast" data-v="Написать в чат (демо)">Написать в чат…</button></div>`;

  // v4 — реакции: последнее событие карты, эмодзи со счётчиком (нажал — +1 и всплывает), под ними лучший коммент к событию
  const RE = window.DB_FAKE?.reactions.match ?? [['🔥', 1820], ['😂', 640], ['😱', 512], ['💀', 388]];
  const react = () => `<div class="pr-re"><div class="pr-cap"><b>Реакции</b><small>24:10 · карта 3</small></div>
      <div class="pr-ev"><img src="${IMG('faceless_void')}" alt="" /><p><b>Spirit забрали Рошана</b><small>Vision потеряли двоих у ямы</small></p></div>
      <div class="pr-rbs">${RE.map(([e, n], i) => `<button data-pr="re" data-v="${i}"><span>${e}</span><b class="num">${n}</b></button>`).join('')}</div>
      <div class="pr-best"><small>Лучший коммент к событию</small><p>${av('miposhka_fan')}<span>Третий раз за серию одна и та же ошибка у ямы</span>${like(812)}</p></div></div>`;

  // v5 — «Горячее»: три поста с рейтингом ▲ (как лента Пикабу / Reddit), вкладки «Горячее · Свежее»
  const hot = sort => { const ps = sort === 'new' ? [...POSTS].sort((a, b) => parseInt(a.m) - parseInt(b.m)).slice(0, 3) : POSTS.slice(0, 3);
    return `<div class="pr-hot"><div class="pr-cap"><span class="pr-seg"><button data-pr="hot" data-v="hot" class="${sort !== 'new' ? 'on' : ''}">Горячее</button><button data-pr="hot" data-v="new" class="${sort === 'new' ? 'on' : ''}">Свежее</button></span></div>
      ${ps.map(p => `<div class="pr-hp"><span class="pr-up"><button data-pr="up">▲</button><b class="num">${p.l}</b></span>${p.img ? `<img src="${IMG(p.img)}" alt="" />` : ''}<p>${esc(p.t)}<small>${esc(p.n)} · ${p.m}</small></p></div>`).join('')}
      ${all()}</div>`; };

  // v6 — мемы из чата: сетка 2×2, самые залайканные картинки; нажал — открывается крупно
  const MEMES = POSTS.filter(p => p.img).concat([{ n: 'ancient_one', t: 'Энигма перед Black Hole', img: 'enigma', l: 290 }, { n: 'pos5_life', t: 'Саппорт с 300 золота', img: 'crystal_maiden', l: 244 }]).slice(0, 4);
  const wall = big => big != null ? `<div class="pr-wbig"><img src="${IMG(MEMES[big].img)}" alt="" /><b>${esc(MEMES[big].t)}</b><div class="pr-ft">${av(MEMES[big].n)}<span class="pr-nk">${esc(MEMES[big].n)}</span>${like(MEMES[big].l)}</div><button class="pr-x" data-pr="wall" data-v="">×</button></div>`
    : `<div class="pr-wall"><div class="pr-cap"><b>Мемы матча</b><small>по лайкам</small></div><div class="pr-grid">${MEMES.map((p, i) => `<button data-pr="wall" data-v="${i}"><img src="${IMG(p.img)}" alt="" /><span>${HEART}${p.l}</span></button>`).join('')}</div></div>`;


  // v7 — полоса закрепов (YouTube Super Chat): сверху кружки выделенных, у каждого полоска «сколько ещё висит»; в квадрате — выбранный
  const TK = window.DB_FAKE?.tips ?? [{ n: 'roshan_enjoyer', c: '#e11d48', s: 500, t: 'Spirit, забирайте эту карту — и я сделаю тату с Yatoro 🔥', left: .8 },
    { n: 'miposhka_fan', c: '#f59e0b', s: 200, t: 'Vision, верю до конца! Рошан ещё будет наш', left: .55 }, { n: 'bkb_timing', c: '#0ea5e9', s: 100, t: 'Привет из Казани, смотрим всей общагой', left: .3 },
    { n: 'glhf_dota', c: '#22c55e', s: 50, t: 'GG WP обеим командам', left: .15 }];
  const ticker = i => { const p = TK[i]; return `<div class="pr-tk"><div class="pr-tks">${TK.map((q, k) => `<button data-pr="tk" data-v="${k}" class="${k === i ? 'on' : ''}" style="--c:${q.c}">${av(q.n)}<b class="num">${q.s}</b><i style="width:${q.left * 100}%"></i></button>`).join('')}</div>
      <div class="pr-tkm" style="--c:${p.c}"><div class="pr-ft">${av(p.n)}<span class="pr-nk"><b>${esc(p.n)}</b></span><span class="pr-amt num">${p.s} очков</span></div><p>${esc(p.t)}</p></div>
      <div class="pr-ft"><small class="pr-nk">Висит дольше тот, кто поставил больше</small>${all('Чат')}</div></div>`; };

  // v8 — закреп редакции: модератор выбирает «пост матча»; значок редакции, зачем закрепили, ответы
  const pin = () => `<div class="pr-pin"><div class="pr-cap"><b>📌 Пост матча</b><small>закрепила редакция</small></div>
      <div class="pr-mm"><img src="${IMG('terrorblade')}" alt="" /><b>Когда Yatoro купил шестой слот на 24-й минуте</b></div>
      <div class="pr-ft">${av('roshan_enjoyer')}<span class="pr-nk">roshan_enjoyer · 1 240 ♡ · 86 ответов</span></div>
      <div class="pr-ed"><i class="pr-av" style="--h:260">G</i><span><b>Редакция:</b> лучший мем карты 3 — забирайте в пятёрку Yatoro, пока не поздно</span></div></div>`;

  // v9 — выделение за очки Fantasy: своё сообщение в квадрат; ставка → цвет и время; ниже — кто сейчас в квадрате и очередь
  const BT = [[50, '#22c55e', '1 мин'], [200, '#f59e0b', '5 мин'], [500, '#e11d48', '15 мин']];
  const boost = b => `<div class="pr-bo"><div class="pr-cap"><b>⚡ В квадрате</b><small>ещё 3:12</small></div>
      <div class="pr-tkm" style="--c:#f59e0b"><div class="pr-ft">${av('miposhka_fan')}<span class="pr-nk"><b>miposhka_fan</b></span><span class="pr-amt num">200 очков</span></div><p>Vision, верю до конца! Рошан ещё будет наш</p></div>
      <small class="pr-nk">Поставь своё сообщение сюда — за очки Fantasy</small>
      <div class="pr-bts">${BT.map(([s, c, t], k) => `<button data-pr="bt" data-v="${k}" class="${k === b ? 'on' : ''}" style="--c:${c}"><b class="num">${s}</b><small>${t}</small></button>`).join('')}</div>
      <button class="pr-btn" data-a="toast" data-v="Выделить сообщение (демо)">Выделить за ${BT[b][0]}</button></div>`;

  // v10 — шкала хайпа: лайки и реакции всего чата наполняют шкалу, уровень 1–5; нажал 🔥 — +1 к шкале; на 5-м — «хайп-момент», лучшее за него
  const hype = v => { const lv = Math.min(5, 1 + Math.floor(v / 20)), pct = v >= 100 ? 100 : (v % 20) * 5;
    return `<div class="pr-hy${lv === 5 ? ' is-max' : ''}"><div class="pr-cap"><b>Хайп чата</b><small class="num">уровень ${lv} из 5</small></div>
      <div class="pr-lv">${[1, 2, 3, 4, 5].map(k => `<i class="${k < lv || lv === 5 ? 'full' : k === lv ? 'cur' : ''}">${k === lv && lv < 5 ? `<u style="width:${pct}%"></u>` : ''}</i>`).join('')}</div>
      <p class="pr-hyt">${lv === 5 ? '🔥 Хайп-момент! Чат взорвался после Рошана' : 'Жми 🔥 вместе со всеми — на 5-м уровне чат увидит хайп-момент'}</p>
      <div class="pr-best"><small>Самое залайканное за хайп</small><p>${av('bkb_timing')}<span>Collapse на Марсе — лучший инициатор турнира</span>${like(655)}</p></div>
      <button class="pr-fire" data-pr="fire">🔥</button></div>`; };

  // v11 — прогноз на очки (Twitch Predictions): «Кто возьмёт карту 3», две кнопки с процентами и пулом; поставил — видишь свою ставку
  const predict = my => `<div class="pr-pd"><div class="pr-cap"><b>Прогноз</b><small>закроется через 2:40</small></div>
      <p class="pr-q">Кто возьмёт карту 3?</p>
      ${[['Team Spirit', 64, '48 210', 'a'], ['TEAM VISION', 36, '27 100', 'b']].map(([t, pc, pool, k]) => `<button class="pr-opt ${k}${my === k ? ' on' : ''}" data-pr="pd" data-v="${k}"><i style="width:${pc}%"></i><span>${t}</span><b class="num">${pc}%</b><small class="num">${pool} очков</small></button>`).join('')}
      <small class="pr-nk">${my ? `Ты поставил 100 очков на ${my === 'a' ? 'Spirit' : 'Vision'} · выигрыш ×${my === 'a' ? '1,6' : '2,8'}` : '2 418 зрителей уже поставили'}</small></div>`;

  const ST = { top: 0, hot: 'hot', wall: null, tk: 0, bt: 1, hy: 72, pd: '' };
  const draw = el => { const k = window.PROMO_KIND || 'ours';
    el.className = 'pr pr--' + k;
    el.innerHTML = k === 'top' ? topPost(POSTS[ST.top], ST.top) : k === 'chat' ? chat() : k === 'react' ? react() : k === 'hot' ? hot(ST.hot) : k === 'wall' ? wall(ST.wall) : k === 'ticker' ? ticker(ST.tk) : k === 'pin' ? pin() : k === 'boost' ? boost(ST.bt) : k === 'hype' ? hype(ST.hy) : k === 'predict' ? predict(ST.pd) : ours(); };
  window.GS_PROMO = el => { draw(el); if (window.PROMO_KIND === 'chat') tick(); };

  // чат: новое сообщение каждые 3 с, старое уходит вверх
  let ci = 6, timer;
  const tick = () => { clearInterval(timer); timer = setInterval(() => { const f = document.querySelector('.pr-feed'); if (!f) return clearInterval(timer);
    f.insertAdjacentHTML('beforeend', msg(CHAT[ci++ % CHAT.length], 0)); while (f.children.length > 6) f.firstElementChild.remove(); }, 3000); };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pr]'); if (!b) return;
    const el = b.closest('.pr'), a = b.dataset.pr;
    if (a === 'like') { b.classList.toggle('on'); const s = b.querySelector('span'); s.textContent = +s.textContent + (b.classList.contains('on') ? 1 : -1); return; }
    if (a === 'up') { const s = b.nextElementSibling; b.classList.toggle('on'); s.textContent = +s.textContent + (b.classList.contains('on') ? 1 : -1); return; }
    if (a === 're') { const s = b.querySelector('b'); s.textContent = +s.textContent + 1; const f = document.createElement('i'); f.className = 'pr-fly'; f.textContent = b.querySelector('span').textContent; b.appendChild(f); setTimeout(() => f.remove(), 900); return; }
    if (a === 'top') ST.top = +b.dataset.v;
    if (a === 'hot') ST.hot = b.dataset.v;
    if (a === 'tk') ST.tk = +b.dataset.v;
    if (a === 'bt') ST.bt = +b.dataset.v;
    if (a === 'fire') ST.hy = Math.min(100, ST.hy + 4);
    if (a === 'pd') ST.pd = b.dataset.v;
    if (a === 'wall') ST.wall = b.dataset.v === '' ? null : +b.dataset.v;
    draw(el);
  });
})();
