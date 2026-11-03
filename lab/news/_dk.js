// news v15–v18 — «по тёмным референсам» (дирижёр 30.10: «ничего не нравится — нет акцентов, найти интересное невозможно»; разбор — Figma 308:389, разделы 339:*).
// Приёмы: v15 FotMob (блоки по рубрикам, цветная плашка, топ с номерами) · v16 Flashscore + Strafe + bo3 (метки рубрик, «Обновлено», полоса матчей, фильтр по командам)
// · v17 The Verge (темы под цветной линией, поток коротких новостей без фото справа, цифра-факт) · v18 SofaScore-лента (карточки разного вида: матч, цитата, цифра, новость).
// Данные — _real.js (cybersport.ru, hawk.live) + ниже добор с bo3.gg (30.10, внутренняя документация/figma-разбор/11-новости/news-bo3.json). Наша обработка: рубрика, «главное сейчас» (источники + свежесть).
(() => {
  const N = window.NEWS, V = window.DK_V, I = '../news/img/';
  // добор: настоящие новости bo3.gg (перевод и сокращение — наши)
  const BO = 'bo3.gg';
  N.push(
    { id: 'meepo', title: 'Meepo снова убрали из матчмейкинга — после серии багов', ago: '3 дня', teams: [], imgs: [I + 'b13.jpg', I + 'b10.jpg'],
      lede: 'Valve закрыла Meepo даже в Turbo. Через день герой вернулся, но аналитик Spirit sikle нашёл новый баг: со Скипетром Meepo можно бросить из любой точки карты.',
      main: ['Причину Valve не объяснила — скорее всего, баги со Скипетром Aghanim', 'До этого чинили бесконечный Blink Dagger и дублирование предметов', 'Новый баг нашёл аналитик Team Spirit sikle'],
      ups: [{ t: '27 окт, 00:40', key: true, text: 'Meepo вернули, но sikle нашёл новый баг со Скипетром' }, { t: '25 окт, 23:20', key: true, text: 'Valve снова убрала Meepo из матчмейкинга, даже из Turbo' }, { t: '25 окт, 19:00', text: 'Valve исправила два бага Meepo, включая дублирование предметов' }],
      src: [[BO, 'Meepo Returns to Dota 2 After a Day of Fixes, But a New Bug Surfaces', '3 дня'], [BO, 'Valve Removes Meepo From Dota 2 Matchmaking Again', '4 дня'], [BO, 'Valve Fixed Two Meepo Bugs, Including an Item Duplication Exploit', '5 дней']] },
    { id: 'online', title: 'Онлайн Dota 2: лучший октябрь за 10 лет — и ночной обвал до 341 тысячи', ago: 'вчера', teams: [], imgs: [I + 'b2.jpg', I + 'b11.jpg'],
      lede: 'Средний онлайн в октябре — 639,8 тыс., выше, чем в октябре 2016-го. А в ночь на 28 октября пик упал с 1,04 млн до 341 тыс., к полудню — 701 тыс.',
      main: ['10 октября пик впервые с 2022 года перешёл миллион', 'С 24 октября миллион — каждый день', 'Рекорд всех времён — 1,2 млн, март 2016'],
      stat: { big: '639,8 тыс.', what: 'средний онлайн в октябре 2026', facts: [['639,4 тыс.', 'прошлый рекорд, октябрь 2016'], ['1,04 млн → 341 тыс.', 'пик за ночь на 28 октября']] },
      ups: [{ t: 'вчера, 14:40', key: true, text: 'Пик онлайна упал с 1,04 млн до 341 тыс. за ночь' }, { t: '28 окт', key: true, text: 'Средний онлайн в октябре — 639,8 тыс., рекорд за 10 лет' }],
      src: [[BO, 'Dota 2 Peak Online Players Drop from One Million to 341K', 'вчера'], [BO, 'Dota 2 Average Online Player Count Breaks Decade-Old Record', '2 дня']] },
    { id: 'niku', title: 'Niku из NAVI набрал 10 000 MMR', ago: 'вчера', teams: ['NAVI'], imgs: [I + 'b5.jpg'], lede: 'Чаще всего играл на Lina и Ember Spirit, ещё — Void Spirit, Puck и Storm Spirit.',
      main: ['Чаще всего играл на Lina и Ember Spirit'], ups: [{ t: 'вчера', key: true, text: 'Niku показал 10 000 MMR в профиле' }], src: [[BO, 'Niku Reaches 10,000 MMR in Dota 2', 'вчера']] },
    { id: 'bm', title: 'Valve починила баг Beastmaster: таланты больше не усиливают крипов', ago: 'вчера', teams: [], imgs: [],
      lede: 'Если Beastmaster переподключался с иллюзиями, его таланты до конца матча работали на союзных линейных крипов.',
      main: ['Если Beastmaster переподключался с иллюзиями, его таланты до конца матча работали на союзных линейных крипов.'], ups: [{ t: 'вчера, 14:00', key: true, text: 'Баг исправлен' }], src: [[BO, 'Dota 2 Bug Fix: Beastmaster Talent No Longer Buffs Lane Creeps', 'вчера']] },
  );
  const NX = window.NX, { esc, team, logo, hl, X, newBtn } = NX;
  // рубрики: цвет — только у метки и плашки; заголовки остаются белыми
  const CAT = { tour: ['Турнир', '#60a5fa', '#1e3a8a'], roster: ['Составы', '#f59e0b', '#78350f'], talk: ['Интервью', '#c084fc', '#581c87'], game: ['Патч и игра', '#4ade80', '#14532d'], scene: ['Сцена', '#f472b6', '#831843'] };
  const OF = { 'spi-pv': 'tour', universe: 'tour', og: 'tour', '1w': 'roster', save: 'roster', s6: 'roster', s8: 'talk', cr1t: 'talk', s24: 'talk', s10: 'talk', s11: 'talk', s20: 'talk', s2: 'game', meepo: 'game', online: 'game', bm: 'game', niku: 'game', s12: 'scene', s14: 'scene' };
  const cat = x => OF[x.id] || 'scene';
  const min = a => { const n = parseInt(a) || 1; return /мин|сейчас/.test(a) ? n : /ч/.test(a) && !/вчера/.test(a) ? n * 60 : /вчера/.test(a) ? 1440 : /д/.test(a) ? n * 1440 : 9999; };
  const fresh = x => !x.live && x.ups.length > 1 && min(x.ago) <= 60; // тема с обновлением за последний час
  const all = () => [...N].sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0) || min(a.ago) - min(b.ago));
  const top = () => [...N].sort((a, b) => (b.src.length * 2 - min(b.ago) / 240) - (a.src.length * 2 - min(a.ago) / 240));
  const src1 = x => x.src[0][0], nsrc = x => new Set(x.src.map(s => s[0])).size;
  const chip = x => { const [n, c] = CAT[cat(x)]; return `<span class="d-chip" style="--c:${c}"><i></i>${n}</span>`; };
  const badge = x => x.live ? '<span class="d-live"><i></i>LIVE</span>' : fresh(x) ? `<span class="d-upd">Обновлено ${esc(x.ago)} назад</span>` : '';
  const meta = (x, more = '') => `<div class="d-meta">${chip(x)}${badge(x)}<span>${esc(src1(x))}${nsrc(x) > 1 ? ` +${nsrc(x) - 1}` : ''}</span><span>${esc(x.ago)}</span>${more}</div>`;
  const pic = (x, c = '') => x.imgs && x.imgs.length ? `<span class="d-pic ${c}"><img src="${x.imgs[0]}" alt="" loading="lazy"></span>` : '';
  const go = x => `href="#" data-id="${x.id}"`;
  const tm = t => { const x = team(t); return `<span class="d-tm">${logo(t)}${esc(x.short || x.name)}</span>`; };
  // матчи из новостей: PARIVISION — Spirit (идёт, ‼️ «идёт» — пример: по новости начало в 13:00), Team Yandex — GamerLegion (31.10, 16:00)
  const MATCHES = [{ a: 'PARIVISION', b: 7119388, live: true, sc: '0 : 0', when: 'Карта 1', odds: [1.75, 2.1], id: 'spi-pv' }, { a: 9823272, b: 'GamerLegion', when: '31 окт, 16:00', note: 'Финал виннеров', id: 'universe' }];
  const mrow = m => `<a class="d-m" ${go({ id: m.id })}><span class="d-mt">${m.live ? '<span class="d-live"><i></i>LIVE</span>' : `<small>${esc(m.when)}</small>`}<small>UNIVERSE${m.note ? ' · ' + esc(m.note) : ''}</small></span>
    <span class="d-mr">${tm(m.a)}<b class="num">${m.live ? m.sc.split(' : ')[0] : ''}</b></span><span class="d-mr">${tm(m.b)}<b class="num">${m.live ? m.sc.split(' : ')[1] : ''}</b></span>
    ${m.odds ? `<span class="d-odds num"><i>П1 <b>${m.odds[0].toFixed(2)}</b></i><i>П2 <b>${m.odds[1].toFixed(2)}</b></i></span>` : ''}</a>`;
  const matches = (h = 'Матчи из новостей') => `<section class="d-box"><h4 class="d-bh">${h}</h4>${MATCHES.map(mrow).join('')}</section>`;
  const toplist = (n = 5, h = 'Главное сейчас') => `<section class="d-box d-top"><h4 class="d-bh">${h}</h4><ol>${top().slice(0, n).map((x, i) => `<li><a ${go(x)}><b class="d-n num">${i + 1}</b><span><em>${esc(x.title)}</em>${meta(x)}</span>${x.imgs.length ? `<span class="d-th"><img src="${x.imgs[0]}" alt=""></span>` : ''}</a></li>`).join('')}</ol></section>`;
  const statCard = s => `<div class="d-stat"><b class="num">${esc(s.big)}</b><span>${esc(s.what)}</span><dl>${s.facts.map(([v, t]) => `<div><dt class="num">${esc(v)}</dt><dd>${esc(t)}</dd></div>`).join('')}</dl></div>`;
  const quotes = () => window.NEWS_QUOTES.map(q => ({ q, x: N.find(t => (t.imgs || []).includes(q.img)) }));

  // ── v15 FotMob: главное + топ с номерами; дальше блоки по рубрикам — одна крупная с цветной плашкой + строки текстом
  function fotmob() {
    const L = all(), lead = L[0], rest = L.slice(1), by = k => rest.filter(x => cat(x) === k);
    const big = (x, side) => { const [, , bg] = CAT[cat(x)]; return `<a class="d-fm-big${x.imgs.length ? '' : ' no-pic'}" ${go(x)} style="--p:${bg}">${pic(x)}<span class="d-plate"><h3>${esc(x.title)}</h3>${meta(x)}</span></a>`; };
    const row = x => `<a class="d-fm-row" ${go(x)}><span><b>${esc(x.title)}</b>${meta(x)}</span>${x.imgs.length ? `<span class="d-th"><img src="${x.imgs[0]}" alt=""></span>` : ''}</a>`;
    const block = (k, i) => { const a = by(k); if (!a.length) return ''; const b = a.find(x => x.imgs.length) || a[0], r = a.filter(x => x !== b).slice(0, 4);
      return `<section class="d-fm-blk${i % 2 ? ' is-rev' : ''}"><h2 class="d-fm-h"><span class="d-ico" style="--c:${CAT[k][1]}">${CAT[k][0][0]}</span>${CAT[k][0]}<a href="#">Все ›</a></h2><div class="d-fm-in">${big(b)}<div class="d-fm-list">${r.map(row).join('')}</div></div></section>`; };
    return `<h1 class="d-h1">Новости Dota 2</h1><div class="d-fm-blk is-lead"><div class="d-fm-in">${big(lead)}${toplist(4, 'Главное сейчас')}</div></div>
      ${['tour', 'roster', 'game', 'talk', 'scene'].map(block).join('')}`;
  }

  // ── v16 Flashscore + Strafe + bo3: полоса матчей, рубрики-фильтр, лента рядами (фото слева или только текст), метки «LIVE» / «Обновлено»; справа — фильтр по командам
  const F = { cat: null, team: null };
  function river() {
    const teams = [...new Set(N.flatMap(x => x.teams || []))].filter(t => typeof t === 'number' || ['PARIVISION', 'GamerLegion', 'OG', '1w Team', 'NAVI'].includes(t));
    const L = all().filter(x => (!F.cat || cat(x) === F.cat) && (!F.team || (x.teams || []).includes(F.team)));
    const lead = !F.cat && !F.team ? L.find(x => x.imgs.length) : null, rest = L.filter(x => x !== lead);
    const row = x => `<a class="d-rv${x.imgs.length ? '' : ' no-pic'}" ${go(x)}>${pic(x)}<span class="d-rv-t"><b>${esc(x.title)}</b>${x.imgs.length || x.lede.length < 140 ? `<p>${esc(x.lede)}</p>` : ''}${meta(x, x.ups.length > 1 ? `<span>${x.ups.length} события</span>` : '')}</span></a>`;
    const cnt = k => N.filter(x => cat(x) === k).length;
    return `<div class="d-strip">${MATCHES.map(mrow).join('')}</div>
      <div class="n-cols"><main><h1 class="d-h1">Новости</h1>
        <div class="d-cats"><button data-dcat="" class="${F.cat ? '' : 'on'}">Все <small>${N.length}</small></button>${Object.entries(CAT).map(([k, [n, c]]) => `<button data-dcat="${k}" class="${F.cat === k ? 'on' : ''}" style="--c:${c}"><i></i>${n} <small>${cnt(k)}</small></button>`).join('')}</div>
        ${F.team ? `<div class="d-fnote">Только ${tm(F.team)}<button data-dteam="">Сбросить ×</button></div>` : ''}
        ${lead ? `<a class="d-rv-lead" ${go(lead)}>${pic(lead)}<span><h2>${esc(lead.title)}</h2><p>${esc(lead.lede)}</p>${meta(lead)}</span></a>` : ''}
        <div class="d-rv-list">${rest.map(row).join('') || '<p class="n-empty">Пока ничего</p>'}</div></main>
      <aside>${matches()}<section class="d-box"><h4 class="d-bh">Команды</h4><div class="d-tags">${teams.map(t => `<button data-dteam="${t}" class="${F.team === t ? 'on' : ''}">${tm(t)}</button>`).join('')}</div></section>${toplist(5, 'Читают больше всего')}</aside></div>`;
  }

  // ── v17 The Verge: темы под цветной линией «Тема / о чём»; крупный заголовок, две младшие; справа поток коротких новостей без фото с цитатами и цифрой
  function verge(CFG) {
    const clusters = [['tour', 'UNIVERSE by FISSURE', 'Spirit и PARIVISION встречаются в нижней сетке'], ['roster', 'Составы', 'кто кого меняет и зачем'], ['game', 'Патч и игра', 'Meepo, баги и рекордный онлайн']];
    const used = new Set();
    const cl = ([k, name, sub]) => { const a = all().filter(x => cat(x) === k && x.imgs.length); if (!a.length) return ''; const [m, ...r] = a; [m, ...r.slice(0, 2)].forEach(x => used.add(x.id));
      return `<section class="d-vg-cl" style="--c:${CAT[k][1]}"><h2 class="d-vg-h"><b>${esc(name)}</b> / ${esc(sub)}</h2>
        <div class="d-vg-in"><a class="d-vg-main" ${go(m)}>${pic(m)}<h3>${esc(m.title)}</h3><p>${esc(m.lede)}</p>${meta(m)}</a>
        <div class="d-vg-side">${r.slice(0, 2).map(x => `<a class="d-vg-s" ${go(x)}><span><b>${esc(x.title)}</b>${meta(x)}</span>${pic(x, 'is-sq')}</a>`).join('')}${k === 'game' && m.id !== 'online' ? statCard(N.find(x => x.id === 'online').stat) : ''}</div></div></section>`; };
    const body = clusters.map(cl).join('');
    const Q = quotes(); let qi = 0;
    const stream = all().filter(x => !used.has(x.id)).map((x, i) => {
      const q = i % 3 === 1 && Q[qi] ? Q[qi++] : null;
      return `<a class="d-st" ${go(x)}><div class="d-st-h"><i class="d-src">${esc(src1(x)[0].toUpperCase())}</i><b>${esc(src1(x))}</b><span>${esc(x.ago)}</span>${badge(x)}</div>
        <p><b>${esc(x.title)}.</b> ${x.lede && x.lede !== x.title ? esc(x.lede) : ''}</p>${q ? `<blockquote class="d-pq">«${esc(q.q.text)}»<small>— ${esc(q.q.name)}</small></blockquote>` : ''}${chip(x)}</a>`; }).join('');
    return `<div class="d-vg"><h1 class="d-vg-title">Новости<span>30 октября · ${N.length} новостей из ${new Set(N.flatMap(x => x.src.map(s => s[0]))).size} источников</span></h1>
      <div class="n-cols"><main>${body}</main><aside class="d-vg-aside"><div class="d-vg-sh"><b>Поток</b><span>коротко, по времени</span></div>${stream}</aside></div></div>`;
  }

  // ── v18 SofaScore-лента: одна колонка карточек разного вида — матч, цитата, цифра, новость с фото, короткая без фото
  function feed() {
    const L = all(), Q = quotes(), out = []; let qi = 0;
    const mcard = m => `<div class="d-card d-c-match"><div class="d-ch">${chip(N.find(x => x.id === m.id))}<span>${esc(m.when)}</span></div>${mrow(m)}<a class="d-more" ${go({ id: m.id })}>Новости матча · ${N.find(x => x.id === m.id).ups.length} ›</a></div>`;
    const qcard = ({ q, x }) => `<a class="d-card d-c-q" ${x ? go(x) : 'href="#"'}><img src="${q.img}" alt=""><span class="d-c-qin"><blockquote>«${esc(q.text)}»</blockquote><b>${esc(q.name)}</b><small>${esc(q.role)} · ${esc(q.src)}</small></span></a>`;
    const ncard = x => x.imgs.length ? `<a class="d-card d-c-n" ${go(x)}>${pic(x)}<span class="d-c-in">${meta(x)}<h3>${esc(x.title)}</h3><p>${esc(x.lede)}</p>${x.ups.length > 1 ? `<span class="d-c-ups">${x.ups.slice(0, 2).map(u => `<i><b class="num">${esc(u.t)}</b>${esc(u.text)}</i>`).join('')}</span>` : ''}</span></a>`
      : `<a class="d-card d-c-t" ${go(x)}><span class="d-src">${esc(src1(x)[0].toUpperCase())}</span><span class="d-c-in">${meta(x)}<h3>${esc(x.title)}</h3><p>${esc(x.lede)}</p></span></a>`;
    const on = N.find(x => x.id === 'online');
    L.forEach((x, i) => {
      if (i === 0) out.push(mcard(MATCHES[0]));
      if (x.id === 'online') out.push(`<a class="d-card d-c-stat" ${go(x)}><div class="d-ch">${chip(x)}<span>${esc(x.ago)}</span></div>${statCard(on.stat)}<h3>${esc(x.title)}</h3></a>`); else out.push(ncard(x));
      if (i % 4 === 2 && Q[qi]) out.push(qcard(Q[qi++]));
      if (i === 6) out.push(mcard(MATCHES[1]));
    });
    return `<div class="n-cols"><main class="d-feed"><div class="d-fh"><h1 class="d-h1">Лента</h1><div class="d-cats is-sm"><button class="on">Для тебя</button><button>Последние</button><button>Команды</button></div></div>${out.join('')}</main><aside>${matches()}${toplist(5)}</aside></div>`;
  }

  // ── тема (общая для v15–v18): обложка с заголовком поверх фото (без фото — плашка цвета рубрики), главное, хронология, цитаты, матч, источники, ещё по рубрике
  function topic(CFG, x, pending) {
    const e = X(x), [cn, cc, cb] = CAT[cat(x)], m = MATCHES.find(mm => mm.id === x.id), more = all().filter(t => t !== x && cat(t) === cat(x)).slice(0, 4);
    return `<div class="d-cover${x.imgs.length ? '' : ' no-pic'}" style="--p:${cb}">${pic(x)}<span class="d-cover-in">${meta(x)}<h1>${esc(x.title)}</h1></span></div>
      <div class="n-cols"><main>
        <p class="d-lede">${hl(x.lede)}</p>
        ${x.stat ? statCard(x.stat) : ''}
        ${x.main && x.main.length > 1 ? `<section class="d-sec"><h4>Главное</h4><ul class="d-main">${x.main.map(t => `<li>${hl(t)}</li>`).join('')}</ul></section>` : ''}
        ${m ? `<section class="d-sec"><h4>Матч</h4><div class="d-box is-flat">${mrow(m)}</div></section>` : ''}
        <section class="d-sec"><h4>Как развивалось <small>${x.ups.length}</small></h4>${newBtn(x, pending)}<ol class="d-tl">${x.ups.map(u => `<li class="${u.key ? 'is-key' : ''}${u.fresh ? ' is-fresh' : ''}"><time class="num">${esc(u.t)}</time><span>${hl(u.text)}${u.src ? `<small>${esc(u.src)}</small>` : ''}</span></li>`).join('')}</ol></section>
        ${e.quotes && e.quotes.length ? `<section class="d-sec"><h4>Цитаты</h4>${e.quotes.map(q => `<figure class="d-q"><img src="${q.img}" alt=""><blockquote>«${hl(q.text)}»<figcaption><b>${esc(q.name)}</b> · ${esc(q.role)} · ${esc(q.src)}</figcaption></blockquote></figure>`).join('')}</section>` : ''}
        <section class="d-sec"><h4>Источники <small>${x.src.length}</small></h4><div class="d-srcl">${x.src.map(s => `<a href="${esc(s[3] || '#')}" target="_blank" rel="noopener"><i class="d-src">${esc(s[0][0].toUpperCase())}</i><span><b>${esc(s[1])}</b><small>${esc(s[0])} · ${esc(s[2])}</small></span><em>↗</em></a>`).join('')}</div></section>
      </main><aside>${more.length ? `<section class="d-box"><h4 class="d-bh"><span class="d-chip" style="--c:${cc}"><i></i>${cn}</span>ещё</h4>${more.map(t => `<a class="d-fm-row" ${go(t)}><span><b>${esc(t.title)}</b>${meta(t)}</span>${t.imgs.length ? `<span class="d-th"><img src="${t.imgs[0]}" alt=""></span>` : ''}</a>`).join('')}</section>` : ''}${matches()}</aside></div>`;
  }

  const R = { fotmob, river, verge, feed }[V];
  NX.page((CFG, x, pending) => CFG.screen === 'topic' ? topic(CFG, x, pending) : R(CFG), document.title.replace(/^v\d+ · /, ''));
  // фильтры v16 — свои клики поверх page(): перерисовка через LAB.set
  document.addEventListener('click', e => { const b = e.target.closest('[data-dcat],[data-dteam]'); if (!b) return; e.preventDefault();
    if (b.dataset.dcat !== undefined) F.cat = b.dataset.dcat || null; else { const v = b.dataset.dteam; F.team = !v ? null : isNaN(+v) ? v : +v; }
    window.LAB.set('view', document.querySelector('.stage').classList.contains('is-desk') ? 'desk' : 'phone'); }, true);
})();
