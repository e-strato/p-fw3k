// Лаба widget-disc-2 — «Обсуждение» → трансляция + карточки фактов (созвон 02.11 §1.2, задача 1.2). Начальник 02.11:
//  · чат (свой или Twitch) в ближайшее время не делаем — спам, тяжело поддерживать; чат не удаляем, он остаётся в лабе widget-promo;
//  · события матча сюда не нужны — они на графике;
//  · на месте «телевизора» — карточки-картинки с фактами из данных до матча: стрики, рекорды (GPM, время), составы; набор, меняются;
//  · первая версия — только трансляция и факты.
// Ставится на место «Обсуждения»: переопределяет window.GS_PROMO (хозяин — ../gs-match/_gs.js, слот promo). Подключать после ../widget-promo/_disc.js.
// Факты считаются по GS_DATA (OpenDota, TI 2026, 4 серии) — настоящие; ‼️ эфир — картинка, зрители — пример.
(() => {
  const D = window.GS_DATA; if (!D) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const nick = id => (D.players[id] || {}).name || '—';
  const H = id => D.heroes[id] || {};
  const T = id => D.teams[id] || {};
  const short = id => ({ 9572001: 'Vision', 7119388: 'Spirit', 8255888: 'BetBoom', 10150413: 'Iron Wing' })[id] || T(id).tag || T(id).name;
  const MAPS = D.series.flatMap(s => s.maps.map((m, i) => ({ ...m, n: i + 1 })));
  const ROWS = MAPS.flatMap(m => m.players.map(p => ({ m, p, team: p.isRadiant ? m.radiant_team_id : m.dire_team_id })));
  const top = (arr, f) => arr.slice().sort((a, b) => f(b) - f(a))[0];

  // 6 фактов турнира — что есть в данных до матча Vision — Spirit (карта 3)
  const gpm = top(ROWS, r => r.p.gold_per_min), kills = top(ROWS, r => r.p.kills), dmg = top(ROWS, r => r.p.hero_damage);
  const long = top(MAPS, m => m.duration);
  const fb = MAPS.filter(m => m.first_blood_time > 0).sort((a, b) => a.first_blood_time - b.first_blood_time)[0];
  const picks = {}; ROWS.forEach(r => picks[r.p.hero_id] = (picks[r.p.hero_id] || 0) + 1);
  const [ph, pn] = Object.entries(picks).sort((a, b) => b[1] - a[1])[0];
  const wins = {}; MAPS.forEach(m => { const w = m.radiant_win ? m.radiant_team_id : m.dire_team_id; wins[w] = (wins[w] || 0) + 1 });
  const FACTS = [
    { k: 'Рекорд турнира', big: gpm.p.gold_per_min, unit: 'GPM', txt: `${nick(gpm.p.account_id)} на ${H(gpm.p.hero_id).name}`, sub: `${short(gpm.m.radiant_team_id)} — ${short(gpm.m.dire_team_id)}, Map ${gpm.m.n}`, hero: gpm.p.hero_id },
    { k: 'Больше всех убийств', big: kills.p.kills, unit: 'убийств', txt: `${nick(kills.p.account_id)} на ${H(kills.p.hero_id).name}`, sub: `за одну карту`, hero: kills.p.hero_id },
    { k: 'Самая долгая карта', big: mmss(long.duration), unit: '', txt: `${short(long.radiant_team_id)} — ${short(long.dire_team_id)}`, sub: `Map ${long.n}`, hero: long.players[0].hero_id },
    { k: 'Самая быстрая первая кровь', big: mmss(fb.first_blood_time), unit: '', txt: `${short(fb.radiant_team_id)} — ${short(fb.dire_team_id)}`, sub: `Map ${fb.n}`, hero: fb.players[5].hero_id },
    { k: 'Больше всего урона', big: (dmg.p.hero_damage / 1000).toFixed(1) + 'k', unit: 'урона', txt: `${nick(dmg.p.account_id)} на ${H(dmg.p.hero_id).name}`, sub: 'за одну карту', hero: dmg.p.hero_id },
    { k: 'Чаще всех пикают', big: pn, unit: 'пиков', txt: H(+ph).name, sub: `за ${MAPS.length} карт турнира`, hero: +ph },
  ];

  // Подложка факта (для window.DC2 = 'mixbg'): у рекордов игрока — арт героя, у карт — лого команд, у пиков — сетка иконок героя
  FACTS[2].bg = 'teams'; FACTS[2].teams = [long.radiant_team_id, long.dire_team_id];
  FACTS[3].bg = 'teams'; FACTS[3].teams = [fb.radiant_team_id, fb.dire_team_id];
  FACTS[5].bg = 'grid';
  // v7–v8 (дирижёр 02.11: «VS с картинкой прикольно — везде с картинкой; трансляцию — первым или последним сторисом, выделить; у событий — „посмотреть момент“»):
  // window.DC2 = 'pics' — у каждого факта картинка: игрок — лого команды · арт героя, карта — лого двух команд VS, пики — арт героя крупно;
  // window.DC2_LIVE = 'first' | 'last' — эфир отдельным сторисом (красная полоска, кадр эфира, «Смотреть трансляцию»); у фактов-моментов кнопка «Посмотреть момент» → сторис эфира с повтором.
  FACTS[0].team = gpm.team; FACTS[1].team = kills.team; FACTS[4].team = dmg.team;
  FACTS[1].mt = `Map ${kills.m.n}`; FACTS[3].mt = `Map ${fb.n} · ${mmss(fb.first_blood_time)}`; FACTS[4].mt = `Map ${dmg.m.n}`; FACTS[2].mt = `Map ${long.n} · концовка`;
  if (window.DC2 === 'pics') { FACTS.forEach(f => { if (!f.bg) f.bg = f.team ? 'player' : 'hero' });
    if (window.DC2_LIVE) FACTS[window.DC2_LIVE === 'first' ? 'unshift' : 'push']({ live: true, k: 'Эфир матча', hero: 0 }); }
  const st = { i: 0, play: false, el: window.DC2_HOLD && FACTS[0].live ? 8000 : 0, moment: '' }; let host = null, timer = null; const HOSTS = new Set(); // виджет может стоять в нескольких местах страницы (ПК / телефон) — рисуем во все
  const fact = f => `<div class="dc2-fact" style="--art:url('${esc(H(f.hero).img || '')}')"><i class="dc2-art"></i><i class="dc2-scan"></i>
    <div class="dc2-bars">${FACTS.map((_, j) => `<i class="${j < st.i ? 'done' : j === st.i ? 'on' : ''}">${j === st.i ? `<b style="width:${Math.min(100, st.el / 80)}%"></b>` : ''}</i>`).join('')}</div>
    <div class="dc2-txt"><span class="dc2-k">${esc(f.k)}</span><b class="dc2-big num">${esc(f.big)}${f.unit ? `<small>${esc(f.unit)}</small>` : ''}</b>
    <span class="dc2-who">${esc(f.txt)}</span><span class="dc2-sub">${esc(f.sub)}</span></div>
    <button class="dc2-nav dc2-nav--l" data-dc2="prev" aria-label="Назад"></button><button class="dc2-nav dc2-nav--r" data-dc2="next" aria-label="Дальше"></button></div>`;
  const stream = () => st.play
    ? `<div class="dc2-tv"><img src="../gs-match/img/heroes/${esc(H(MAPS[MAPS.length - 1].players[0].hero_id).short || 'axe')}.png" alt=""><span class="dc2-live">LIVE</span><span class="dc2-src">Основной · RU · 16,0k</span><button class="dc2-x" data-dc2="stop" aria-label="Закрыть эфир">×</button></div>`
    : `<button class="dc2-watch" data-dc2="play"><i>▶</i><span><b>Смотреть трансляцию</b><small>Основной · RU · 16,0k зрителей</small></span><em class="dc2-live">LIVE</em></button>`;
  // ——— v3–v6 (дирижёр 02.11: «визуально ближе к прошлому: телевизор, факты красиво; в сторисах разные факты, подложка; эфир — маленьким окном; новый виджет») ———
  // Телевизор — разметка и стили экрана «Обсуждения» (../widget-promo/_disc.css: .mx-body, .sc--tv, .mx-led, .mx-st — LED янтарём).
  // window.DC2: tv (v3) — телевизор с фактами-сторис, под ним мини-окно эфира строкой · pip (v4) — эфир маленьким окном в углу телевизора ·
  //            dock (v5) — сверху мини-эфир 16:9, под ним телевизор фактов · mixbg (v6) — как tv, но подложка у фактов разная: арт героя / лого команд / сетка героя
  // v14–v15 (дирижёр 02.11: «логотипы перекрывает инфоблок — заставку повыше / другое расположение; на первом экране — „смотреть трансляцию на Twitch“, иконка, понятнее; заставка стрима»):
  // DC2_TW — сторис эфира: значок Twitch, «Смотреть на Twitch», канал и зрители, кадр стрима ярче · DC2_UP (v14) — картинка факта в верхней части экрана, над инфоблоком ·
  // DC2_SLIM (v15) — инфоблок компактнее (рубрика, число и кто — плотнее, без отступов), картинка видна целиком
  const TW = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M4.3 3 3 6.4v13.1h4.5V22h2.5l2.4-2.5h3.7l4.9-4.9V3H4.3zm14.9 10.7-2.8 2.8h-4.5L9.5 19v-2.5H5.8V4.7h13.4v9z"/><path d="M15.5 7.6h1.7v4.9h-1.7zM11 7.6h1.7v4.9H11z"/></svg>';
  const DC2 = window.DC2, DC2_LIVE = window.DC2 === 'pics' && window.DC2_LIVE;
  const STREAM = `../gs-match/img/heroes/${esc(H(MAPS[MAPS.length - 1].players[0].hero_id).short || 'axe')}.png`;
  // DC2_MID (v16, дирижёр 02.11: «картинка чётко между слайдером и инфоблоком, независимо от высоты инфоблока»): картинка — не фоном,
  // а отдельной средней строкой экрана (flex: 1) — она всегда занимает место между полосками и инфоблоком
  const midOf = f => f.live ? `<img class="dc2-mstream" src="${STREAM}" alt="">`
    : f.bg === 'teams' ? `${f.teams.map(id => `<img class="dc2-mlogo" src="${esc(T(id).logo || '')}" alt="">`).join('<i>VS</i>')}`
    : f.bg === 'player' ? `<img class="dc2-mlogo" src="${esc(T(f.team).logo || '')}" alt=""><i>·</i><img class="dc2-mhero" src="${esc(H(f.hero).img || '')}" alt="">`
    : `<img class="dc2-mhero" src="${esc(H(f.hero).img || '')}" alt="">`;
  const bgOf0 = f => f.live ? `<div class="sc-pic dc2-bgl" style="--art:url('${STREAM}')"></div>`
    : DC2 === 'pics' && f.bg === 'player' ? `<div class="sc-pic dc2-bgt dc2-bgp"><img src="${esc(T(f.team).logo || '')}" alt=""><i>·</i><img class="dc2-hart" src="${esc(H(f.hero).img || '')}" alt=""></div>`
    : DC2 === 'pics' && f.bg === 'hero' ? `<div class="sc-pic dc2-bgt dc2-bgp"><img class="dc2-hart dc2-hart--big" src="${esc(H(f.hero).img || '')}" alt=""></div>`
    : DC2 === 'pics' && f.bg === 'grid' ? `<div class="sc-pic dc2-bgt dc2-bgp"><img class="dc2-hart dc2-hart--big" src="${esc(H(f.hero).img || '')}" alt=""></div>`
    : (DC2 !== 'mixbg' && DC2 !== 'pics') || !f.bg ? `<div class="sc-pic" style="--art:url('${esc(H(f.hero).img || '')}')"></div>`
    : f.bg === 'teams' ? `<div class="sc-pic dc2-bgt">${f.teams.map(id => `<img src="${esc(T(id).logo || '')}" alt="">`).join('<i>VS</i>')}</div>`
    : `<div class="sc-pic dc2-bgg">${Array.from({ length: 12 }, () => `<img src="${esc(H(f.hero).icon || '')}" alt="">`).join('')}</div>`;
  // DC2_LIVEFULL (v17, дирижёр 02.11: «первая страница — эфир — картинкой на всю ширину; все кнопки на всю ширину блока»)
  const midHere = f => window.DC2_MID && !(f.live && window.DC2_LIVEFULL);
  const bgOf = f => midHere(f) ? '<div class="sc-pic dc2-bgnone"></div>' : bgOf0(f);
  const tv = (f, pip) => `<div class="mx-body"><div class="sc sc--tv mx mx--frame dc2-tv2${midHere(f) ? ' dc2-midm' : ''}${window.DC2_LIVEFULL ? ' dc2-wide' : ''}${f.live ? ' is-live' : ''}${window.DC2_UP ? ' dc2-up' : ''}${window.DC2_SLIM ? ' dc2-slim' : ''}${window.DC2_TW ? ' dc2-twm' : ''}">${bgOf(f)}
      <div class="sc-top mx-top dc2-top"><div class="dc2-bars dc2-bars--tv">${FACTS.map((x, j) => `<i class="${j < st.i ? 'done' : j === st.i ? 'on' : ''}${x.live ? ' live' : ''}">${j === st.i ? `<b style="width:${Math.min(100, st.el / 80)}%"></b>` : ''}</i>`).join('')}</div></div>
      <div class="sc-top mx-top${window.DC2_TIN ? ' dc2-cnt' : ''}">${window.DC2_TIN ? '' : `<span class="dc2-tk${f.live ? ' dc2-tk--live' : ''}">${f.live ? '● ' : ''}${esc(f.k)}</span>`}<span class="mx-live mx-pre num">${st.i + 1}/${FACTS.length}</span></div>
      ${midHere(f) ? `<div class="dc2-mid${f.live ? ' dc2-mid--live' : ''}">${midOf(f)}</div>` : ''}
      ${pip ? mini('pip') : ''}
      ${f.live ? `<div class="mx-led dc2-led dc2-led--live">${window.DC2_TIN ? `<span class="dc2-tk${f.live ? ' dc2-tk--live' : ''}">${f.live ? '● ' : ''}${esc(f.k)}</span>` : ''}<p class="mx-st dc2-st"><span class="dc2-num">${st.moment ? 'ПОВТОР' : 'LIVE'}</span> ${st.moment ? esc(st.moment) : window.DC2_TW ? (window.DC2_MID && !window.DC2_LIVEFULL ? '16,0k зрителей' : window.DC2_LIVEFULL ? '16,0k зрителей' : 'twitch.tv/dota2ti_ru · 16,0k зрителей') : 'Основной · RU · 16,0k'}</p>
        ${window.DC2_TW ? `<button class="dc2-cta dc2-tw" data-dc2="${st.play ? 'stop' : 'play'}">${TW}<span>${st.play ? 'Пауза' : 'Смотреть на Twitch'}</span></button>` : `<button class="dc2-cta" data-dc2="${st.play ? 'stop' : 'play'}">${st.play ? '❚❚ Пауза' : '▶ Смотреть трансляцию'}</button>`}</div>`
      : `<div class="mx-led dc2-led">${window.DC2_TIN ? `<span class="dc2-tk${f.live ? ' dc2-tk--live' : ''}">${f.live ? '● ' : ''}${esc(f.k)}</span>` : ''}<p class="mx-st dc2-st"><span class="dc2-num">${esc(f.big)}</span> ${esc(f.unit || '')}</p>
        <div class="dc2-by"><img src="${esc(H(f.hero).icon || '')}" alt=""><b>${esc(f.txt)}</b><span>${esc(f.sub)}</span></div>
        ${DC2_LIVE && f.mt ? `<button class="dc2-mom" data-dc2="moment" title="Посмотреть момент · ${esc(f.mt)}">▶ Момент · ${esc(f.mt.split(' · ')[0])}</button>` : ''}</div>`}
      <button class="dc2-nav dc2-nav--l" data-dc2="prev" aria-label="Назад"></button><button class="dc2-nav dc2-nav--r" data-dc2="next" aria-label="Дальше"></button></div></div>`;
  const mini = k => `<button class="dc2-mini dc2-mini--${k}${st.play ? ' is-play' : ''}" data-dc2="${st.play ? 'stop' : 'play'}" title="${st.play ? 'Пауза' : 'Смотреть'}">
      <span class="dc2-mv"><img src="${STREAM}" alt=""><i class="dc2-pl">${st.play ? '❚❚' : '▶'}</i><em class="dc2-lv">LIVE</em></span>
      ${k === 'pip' ? '' : `<span class="dc2-mi"><b>Эфир матча</b><small>Основной · RU · <span class="num">16,0k</span></small></span>`}</button>`;
  const drawTV = () => {
    const f = FACTS[st.i], head = window.DC2_ONLY ? '' : `<div class="dc2-hd"><b>Факты и эфир</b><small><i class="dc2-dot"></i>в эфире</small></div>`; // DC2_TIN (v13, дирижёр 02.11: «заголовок перенесём в информационный блок — его я читаю, а то, что сверху, не вижу») — рубрика в LED-блоке, сверху только полоски и счётчик
    // DC2_ONLY (v11–v12, дирижёр 02.11: «убери заголовок и live — только телек»)
    const body = DC2 === 'pics' ? tv(f) : DC2 === 'pip' ? tv(f, true) : DC2 === 'dock' ? `<div class="dc2-dock">${mini('dock')}</div>${tv(f)}` : `${tv(f)}${mini('row')}`;
    // DC2_BARE (v9–v10, дирижёр 02.11: «обводку убери, пусть будет только телек») — без карточки виджета: ни рамки, ни фона, только заголовок и телевизор
    return `<div class="w dc2 dc2--tv dc2--${DC2}${window.DC2_BARE ? ' dc2--bare' : ''}">${head}<div class="dc2-in">${body}</div></div>`; };
  const html = () => DC2 ? drawTV() : `<div class="w dc2"><div class="dc2-hd"><b>Факты и эфир</b><small class="num">${st.i + 1} / ${FACTS.length}</small></div>
      ${fact(FACTS[st.i])}${stream()}</div>`;
  const draw = () => { const h = html(); HOSTS.forEach(el => el.isConnected ? (el.innerHTML = h) : HOSTS.delete(el)); };
  // Сторис листаются сами: 8 с на факт. Страница в live перерисовывает виджеты по тикам — поэтому таймер один на всё время,
  // а прошедшее время (st.el) живёт в состоянии: перерисовка не сбрасывает ни счёт, ни полоску. Пауза на наведение убрана.
  const go = d => { st.i = (st.i + d + FACTS.length) % FACTS.length; st.el = window.DC2_HOLD && FACTS[st.i].live ? 8000 : 0; st.moment = ''; draw(); };
  const restart = () => { if (timer) return; timer = setInterval(() => {
    const live = [...HOSTS].filter(el => el.isConnected); if (!live.length) return;
    // Наведение больше не ставит паузу (дирижёр 02.11: после клика «зависает» — мышь-то на экране)
    if (FACTS[st.i].live && st.play) return; // смотрит эфир — сторис не уходит
    // DC2_HOLD (v17, дирижёр 02.11): на эфире полоска заполнена и стоит — дальше только по клику вправо; дошли по кругу до эфира — снова стоим
    if (window.DC2_HOLD && FACTS[st.i].live) { st.el = 8000; live.forEach(el => el.querySelectorAll('.dc2-bars i.on b').forEach(b => b.style.width = '100%')); return; }
    st.el += 100; live.forEach(el => el.querySelectorAll('.dc2-bars i.on b').forEach(b => b.style.width = Math.min(100, st.el / 80) + '%'));
    if (st.el >= 8000) go(1); }, 100); };

  // Клики — в фазе захвата: страница может гасить всплытие у своих виджетов. Левая половина экрана — назад, правая — вперёд.
  document.addEventListener('click', e => { const b = e.target.closest('[data-dc2]'); if (!b || !b.closest('.dc2-host')) return;
    e.preventDefault(); e.stopPropagation();
    const a = b.dataset.dc2; if (a === 'prev') go(-1); if (a === 'next') go(1); if (a === 'moment') { const f = FACTS[st.i]; st.moment = f.mt; st.play = true; st.i = FACTS.findIndex(x => x.live); st.el = window.DC2_HOLD ? 8000 : 0; draw(); } if (a === 'play') { st.play = true; draw(); } if (a === 'stop') { st.play = false; draw(); } }, true);

  window.GS_PROMO = (el, M) => { host = el; HOSTS.add(el); el.className = 'dc2-host'; el.dataset.pre = M && M.state === 'pre' ? '1' : '0'; draw(); restart(); };
})();
