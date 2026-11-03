// news v5–v9 — «как у референса, в нашей стилистике» (дирижёр 30.10). Устройство ленты и темы повторяет сервис из разбора (Figma стр. 308:389), стиль — наш.
// window.NEWS_V: particle (v5) · google (v6) · ground (v7) · apple (v8) · bbc (v9, лента как HLTV). Общие куски — _nx.js.
(() => {
  const { REAL, N, D, NM, esc, team, kk, RAD, DIR, hl, X, SRC, logo, img, collage, fav, srcs, meta, plural, ups, arts, fans, spark, g, matchCard, quote, xposts, clip, page, newBtn, timeline } = window.NX;
  const V = window.NEWS_V, main = N[0], rest = N.slice(1);
  const two = (a, b) => `<div class="r-cols"><main>${a}</main><aside>${b}</aside></div>`;
  const sec = (t, s = '') => `<div class="r-sec">${t}${s ? `<small>${s}</small>` : ''}</div>`;
  const tabs = (CFG, a) => `<div class="x-tabs">${a.map((t, i) => `<button data-tab="${i}" class="${CFG.tab === i ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  const art = ([s, t, a]) => `<a class="x-art" href="#">${fav(s)}<span><small>${esc(s.toUpperCase())} · ${esc(a)}</small><b>${hl(t)}</b></span></a>`;

  // ── v5 Particle: лента «Популярное» карточками с коллажем; тема — коллаж справа, «Обзор», «Статьи N» справа, клипы, цитаты, вопросы ──
  const particle = {
    feed: CFG => `${tabs(CFG, ['Популярное', 'Dota 2', 'Турниры', 'Команды'])}
      <div class="p-grid">${N.map((x, i) => `<a class="r-card p-card${i < 2 ? ' is-big' : ''}" href="#" data-id="${x.id}">${collage(X(x).imgs)}<div class="p-cb"><small class="p-up">${esc(arts(x).toUpperCase())} · ${esc(x.ago.toUpperCase())}</small><h3>${hl(x.title)}</h3>${srcs(x)}</div></a>`).join('')}</div>`,
    topic: (CFG, x, pending) => { const e = X(x);
      return `<div class="p-hero">${collage(e.imgs, true)}<div class="p-hin"><small class="p-up">${x.live ? '<span class="r-live">LIVE</span> ' : ''}${esc(arts(x).toUpperCase())} · ${esc(x.ago.toUpperCase())}</small><h1>${hl(x.title)}</h1><p>${hl(x.lede)}</p></div></div>
      ${two(`${sec('Обзор')}<ul class="r-main p-ov">${x.main.map(m => `<li>${hl(m)}</li>`).join('')}</ul>
        ${x.match != null ? matchCard(x) : ''}
        ${e.clips ? sec('Клипы', e.clips.length) + `<div class="r-quotes">${e.clips.map(clip).join('')}</div>` : ''}
        ${e.quotes && e.quotes.length ? sec('Цитаты', e.quotes.length) + `<div class="r-quotes">${e.quotes.map(quote).join('')}</div>` : ''}
        ${e.qs ? sec('Вопросы', e.qs.length) + `<div class="r-quotes">${e.qs.map(([q, a]) => `<div class="r-card p-qa"><b>${esc(q)}</b><p>${hl(a)}</p><small>Спросил читатель · ответ ИИ</small></div>`).join('')}</div>` : ''}
        ${sec(x.live ? 'Обновления' : 'Хронология')}${newBtn(x, pending)}${timeline(x)}`,
        `${sec('Статьи', e.arts.length)}<div class="p-arts">${e.arts.map(a => `<a class="r-card" href="#">${art(a)}</a>`).join('')}</div>`)}`; },
  };

  // ── v6 Google News: «Ваш брифинг», кластеры (главная + связанные), «Полное освещение»; тема — Главное, Хронология, Из X, Видео, Вопросы, Все материалы ──
  const cluster = x => { const e = X(x), a = e.arts;
    return `<div class="r-card g-cl"><a class="g-main" href="#" data-id="${x.id}"><span class="g-img">${img(e.imgs[0])}</span><span>${meta(x)}<b>${hl(x.title)}</b><small>${fav(a[0][0])} ${esc(a[0][0])} · ${esc(a[0][2])}</small></span></a>
      ${a.slice(1, 3).map(r => `<a class="g-rel" href="#" data-id="${x.id}">${fav(r[0])}<span><b>${hl(r[1])}</b><small>${esc(r[0])} · ${esc(r[2])}</small></span></a>`).join('')}
      <a class="g-full" href="#" data-id="${x.id}">▤ Полное освещение · ${esc(arts(x))}</a></div>`; };
  const google = {
    feed: () => two(`<h1 class="r-h1">Ваш брифинг</h1><p class="g-date">${REAL ? 'Пятница, 30 октября · UNIVERSE by FISSURE, плей-офф' : 'Пятница, 21 августа · The International 2026, плей-офф'}</p>${sec('Главное ›')}<div class="g-list">${N.slice(0, 4).map(cluster).join('')}</div>${sec('Dota 2 ›')}<div class="g-list">${N.slice(4).map(cluster).join('')}</div>`,
      `${sec('Сейчас идёт')}${matchCard()}${sec('Для вас')}<div class="r-card g-fy">${rest.slice(0, 4).map(x => `<a href="#" data-id="${x.id}"><span><small>${esc(x.tour || 'Dota 2')}</small><b>${hl(x.title)}</b></span><span class="g-th">${img(X(x).imgs[1] || X(x).imgs[0])}</span></a>`).join('')}</div>`),
    topic: (CFG, x, pending) => { const e = X(x);
      return `<div class="g-top"><h1>${hl(x.title)}</h1><button class="g-fol">☆ Подписаться</button></div>
      ${sec('Главное')}<div class="r-quotes">${e.arts.slice(0, 4).map((a, i) => `<a class="r-card g-tc" href="#"><span class="g-img">${img(e.imgs[i % e.imgs.length])}</span><small>${fav(a[0])} ${esc(a[0])}</small><b>${hl(a[1])}</b><small>${esc(a[2])}</small></a>`).join('')}</div>
      ${two(`${sec('Хронология')}${newBtn(x, pending)}${timeline(x)}
        ${e.x ? sec('Из X') + `<div class="r-quotes">${e.x.map(p => `<div class="g-xw">${xposts([p])}</div>`).join('')}</div>` : ''}
        ${e.clips ? sec('Видео') + `<div class="r-quotes">${e.clips.map(clip).join('')}</div>` : ''}
        ${e.qs ? sec('Вопросы и ответы') + `<div class="r-qs">${e.qs.map(([q, a], i) => `<details class="r-card"${i ? '' : ' open'}><summary>${esc(q)}</summary><p>${hl(a)}</p></details>`).join('')}</div>` : ''}
        ${sec('Все материалы', e.arts.length)}<div class="r-card x-list">${e.arts.map(art).join('')}</div>`,
        `${x.match != null ? sec('Матч') + matchCard(x) : ''}${sec('Главное за минуту')}<div class="r-card r-pad"><ul class="r-main">${x.main.map(m => `<li>${hl(m)}</li>`).join('')}</ul></div>`)}`; },
  };

  // ── v7 Ground News: темы со шкалой «кто пишет» (СМИ / команды / блогеры) и трибунами; «Мало кто заметил»; тема — детали освещения, вкладки по типу источника ──
  const KIND = ['СМИ', 'команда', 'блогер'];
  const mix = x => { const a = X(x).arts, c = KIND.map(k => a.filter(s => ((SRC[s[0]] || ['СМИ'])[0] === k) || (k === 'СМИ' && (SRC[s[0]] || [''])[0] === 'база')).length), n = a.length || 1;
    return c.map(v => Math.round(v / n * 100)); };
  const mixBar = x => { const m = mix(x); return `<div class="gr-bar">${m.map((v, i) => v ? `<i class="k${i}" style="width:${v}%">${v >= 18 ? `${['СМИ', 'Команды', 'Блогеры'][i]} ${v}%` : ''}</i>` : '').join('')}</div>`; };
  const ground = {
    feed: CFG => two(`<h1 class="r-h1">Топ новостей</h1>${tabs(CFG, ['Все', 'Dota 2', 'Мои темы'])}<div class="gr-list">${N.map(x => `<a class="r-card gr-row" href="#" data-id="${x.id}"><span class="gr-t">${meta(x)}<b>${hl(x.title)}</b>${mixBar(x)}<small>${esc(plural(X(x).arts.length, 'источник', 'источника', 'источников'))}</small></span><span class="gr-th">${img(X(x).imgs[0])}</span></a>`).join('')}</div>`,
      `<div class="r-card gr-blind">${sec('Мало кто заметил')}<p>О теме пишет один источник — легко пропустить.</p>${N.filter(x => X(x).arts.length === 1).slice(0, 3).map(x => `<a href="#" data-id="${x.id}"><b>${hl(x.title)}</b>${mixBar(x)}</a>`).join('')}</div>
       ${sec('Мои темы')}<div class="r-card gr-topics">${[[7119388], [9572001], ['The International 2026'], ['Патчи'], ['Трансферы']].map(([k]) => `<button data-fol="${k}" class="${CFG.follow[k] ? 'on' : ''}">${typeof k === 'number' ? logo(k) : '<i class="r-nol">#</i>'}<span>${esc(typeof k === 'number' ? team(k).name : k)}</span><b>${CFG.follow[k] ? '✓' : '+'}</b></button>`).join('')}</div>`),
    topic: (CFG, x, pending) => { const e = X(x), m = mix(x), K = ['Все', 'СМИ', 'Команды', 'Блогеры'], kind = [null, 'СМИ', 'команда', 'блогер'][CFG.tab];
      const list = e.arts.filter(a => !kind || (SRC[a[0]] || ['СМИ'])[0] === kind || (kind === 'СМИ' && (SRC[a[0]] || [''])[0] === 'база'));
      return two(`${meta(x)}<h1 class="gr-h1">${hl(x.title)}</h1><p class="r-lede">${hl(x.lede)}</p>${mixBar(x)}
        ${e.fans ? `<div class="r-card r-pad gr-fans">${sec('Трибуны')}${fans(x, true, CFG)}</div>` : ''}
        ${sec(`${e.arts.length} материалов`)}${tabs(CFG, K)}<div class="gr-arts">${list.map(a => `<div class="r-card gr-art"><div class="gr-ah">${fav(a[0])}<b>${esc(a[0])}</b><span class="gr-tag k${KIND.indexOf((SRC[a[0]] || ['СМИ'])[0])}">${esc((SRC[a[0]] || ['СМИ'])[0])}</span><span class="gr-tag">${esc((SRC[a[0]] || ['', 'RU'])[1])}</span></div><h3>${hl(a[1])}</h3><small>${esc(a[2])} назад · <a href="#">Читать ›</a></small></div>`).join('') || '<p class="r-lede">Таких источников нет</p>'}</div>
        ${sec('Хронология')}${newBtn(x, pending)}${timeline(x)}`,
        `<div class="r-card r-pad gr-det">${sec('Детали освещения')}<dl><dt>Всего источников</dt><dd>${e.arts.length}</dd><dt>Первым написал</dt><dd>${esc(e.arts[e.arts.length - 1][0])}</dd><dt>Больше всего</dt><dd>${['СМИ', 'команды', 'блогеры'][m.indexOf(Math.max(...m))]}</dd><dt>Языки</dt><dd>${esc([...new Set(e.arts.map(a => (SRC[a[0]] || ['', 'RU'])[1]))].join(', '))}</dd></dl></div>
         ${x.match != null ? matchCard(x) : ''}${sec('Похожие темы')}${N.filter(o => o.id !== x.id).slice(0, 3).map(o => `<a class="r-card gr-sim" href="#" data-id="${o.id}"><b>${hl(o.title)}</b>${mixBar(o)}</a>`).join('')}`); },
  };

  // ── v8 Apple News: журнал — «Главное» большими картинками с крупным именем источника, «В тренде» с номерами; тема — как статья: картинка, мастхед, заголовок, текст ──
  const masthead = s => `<span class="a-mh">${esc(s)}</span>`;
  const apple = {
    feed: () => { const e = X(main);
      return `<div class="a-date"><b>Новости</b><small>${REAL ? '30 октября' : '21 августа'}</small></div>${sec('Главное')}
      <a class="a-top" href="#" data-id="${main.id}"><span class="a-img">${img(e.imgs[0])}${main.live ? '<span class="r-live">LIVE</span>' : ''}</span>${masthead(e.arts[0][0])}<h2>${hl(main.title)}</h2><small>${esc(main.ago)} · ${esc(arts(main))}</small></a>
      <div class="a-two">${rest.slice(0, 2).map(x => `<a class="a-sm" href="#" data-id="${x.id}"><span class="a-img">${img(X(x).imgs[0])}</span>${masthead(X(x).arts[0][0])}<b>${hl(x.title)}</b><small>${esc(x.ago)}</small></a>`).join('')}</div>
      ${sec('В тренде')}<ol class="a-trend">${N.map((x, i) => `<li><a href="#" data-id="${x.id}"><em class="num">${i + 1}</em><span>${masthead(X(x).arts[0][0])}<b>${hl(x.title)}</b></span><span class="a-th">${img(X(x).imgs[1] || X(x).imgs[0])}</span></a></li>`).join('')}</ol>
      ${sec('Для вас')}${rest.slice(2).map(x => `<a class="a-row" href="#" data-id="${x.id}"><span>${masthead(X(x).arts[0][0])}<b>${hl(x.title)}</b><small>${esc(x.ago)}</small></span><span class="a-th">${img(X(x).imgs[2] || X(x).imgs[0])}</span></a>`).join('')}`; },
    topic: (CFG, x, pending) => { const e = X(x);
      return `<article class="a-art"><span class="a-img a-hero">${img(e.imgs[0])}</span>${masthead(e.arts[0][0])}<h1>${hl(x.title)}</h1><p class="a-dek">${hl(x.lede)}</p><small class="a-by">Редакция GoatScout · ${esc(x.ago)} · ${esc(arts(x))}</small>
        ${x.main.map(m => `<p>${hl(m)}.</p>`).join('')}${x.match != null ? matchCard(x) : ''}
        ${e.quotes && e.quotes.length ? `<blockquote class="a-pull">«${hl(Array.isArray(e.quotes[0]) ? e.quotes[0][1] : e.quotes[0].text)}»<small>— ${esc(Array.isArray(e.quotes[0]) ? (D.players[e.quotes[0][0].account_id] || {}).name || '' : e.quotes[0].name)}</small></blockquote>` : ''}
        ${sec(x.live ? 'Обновления' : 'Хронология')}${newBtn(x, pending)}${timeline(x)}
        ${sec('Ещё от ' + esc(e.arts[0][0]))}${rest.filter(o => o.id !== x.id).slice(0, 3).map(o => `<a class="a-row" href="#" data-id="${o.id}"><span>${masthead(X(o).arts[0][0])}<b>${hl(o.title)}</b></span><span class="a-th">${img(X(o).imgs[0])}</span></a>`).join('')}</article>`; },
  };

  // ── v9 лента как HLTV (сегодня / вчера плотным списком, справа матчи); тема — live как BBC Sport: счёт сверху, «Только главное», посты с заголовками, вставки X и матча ──
  const bbc = {
    feed: () => { const row = x => `<a class="h-row" href="#" data-id="${x.id}"><span class="h-fl">${x.live ? '<span class="r-live">LIVE</span>' : logo((x.teams || [])[0] ?? '·')}</span><b>${hl(x.title)}</b><small class="num">${esc(x.ago)}</small><small class="h-c num">💬 ${x.live ? 412 : (x.title.length * 3) % 90}</small></a>`;
      return two(`<h1 class="r-h1">Новости</h1><div class="r-card h-list"><div class="h-day">Сегодня</div>${N.filter(x => x.ago !== 'вчера').map(row).join('')}<div class="h-day">Вчера</div>${N.filter(x => x.ago === 'вчера').map(row).join('')}</div>`,
        `${sec('Матчи')}<div class="r-card h-ms">${(REAL ? [['PARIVISION', 7119388, '0 : 0', 'LIVE'], [9823272, 'GamerLegion', '31.10', '16:00'], ['OG', 2163, '—', 'нижняя сетка'], [9823272, 'PARIVISION', '2 : 1', 'итог']] : [[RAD, DIR, '1 : 1', 'LIVE'], [9247354, 2163, '2 : 0', 'итог'], [9823272, 10136357, '18:00', 'скоро']]).map(([a, b, s, st]) => `<a href="#"><span>${logo(a)}${esc(team(a).short)}</span><b class="num">${s}</b><span>${esc(team(b).short)}${logo(b)}</span><small>${st}</small></a>`).join('')}</div>`); },
    topic: (CFG, x, pending) => { const e = X(x), only = CFG.tab === 1, L = g() >= 0 ? RAD : DIR;
      const posts = (only ? x.ups.filter(u => u.key) : x.ups).map((u, i) => `<article class="r-card b-post${u.key ? ' is-key' : ''}${u.fresh ? ' is-fresh' : ''}"><small class="num">${esc(u.t)}</small>${u.key ? '<span class="b-key">Главное</span>' : ''}<h3>${hl(u.text.split(' — ')[0])}</h3>${u.text.includes(' — ') ? `<p>${hl(u.text.split(' — ').slice(1).join(' — '))}</p>` : ''}
        ${i === 0 && x.match != null && !REAL ? `<div class="b-emb">${spark(280, 40)}<span class="num">Карта 3 · 33:30 · <b class="${g() >= 0 ? 'up' : 'dn'}">${esc(NM.SHORT[L])} +${kk(g())}</b></span></div>` : ''}${i === 1 && e.x ? xposts([e.x[1]]) : ''}<button class="b-share">Поделиться</button></article>`).join('');
      const M = REAL ? x.match : x.match != null && { a: RAD, b: DIR, s: '1 : 1', when: 'Карта 3 · 33:30' };
      return `${M ? `<div class="b-score"><span class="r-live">LIVE</span><span>${logo(M.a)}${esc(team(M.a).name)}</span><b class="num">${M.s || '0 : 0'}</b><span>${esc(team(M.b).name)}${logo(M.b)}</span><small>${esc(M.when)}</small></div>` : ''}
      ${two(`<h1 class="gr-h1">${hl(x.title)}</h1><div class="b-sum r-card r-pad">${sec('Коротко')}<ul class="r-main">${x.main.map(m => `<li>${hl(m)}</li>`).join('')}</ul></div>
        <div class="b-bar">${tabs(CFG, ['Все обновления', 'Только главное'])}${x.live ? '<span class="b-auto"><span class="r-dot"></span>Обновляется</span>' : ''}</div>${newBtn(x, pending)}<div class="b-posts">${posts}</div>`,
        `${x.match != null ? matchCard(x) : ''}${e.fans ? `<div class="r-card r-pad">${sec('Трибуны')}${fans(x, true, CFG)}</div>` : ''}${sec('Комментарии', 412)}<div class="r-card h-com">${(REAL ? [['vlad_d2', 'Spirit в нижней сетке — это уже традиция'], ['mira', 'кф 1.75 на PARIVISION — смело'], ['kot', 'syndereN как всегда хейтит']] : [['vlad_d2', 'Рошан на 31-й решил всё'], ['mira', 'Vision, баньте ТА уже'], ['kot', 'лейт за Vision, рано хороните']]).map(([n, t]) => `<p><b>${n}</b>${esc(t)}</p>`).join('')}</div>`)}`; },
  };

  const R = { particle, google, ground, apple, bbc }[V];
  const TITLE = { particle: 'Как Particle', google: 'Как Google News', ground: 'Как Ground News', apple: 'Как Apple News', bbc: 'Лента как HLTV, тема — live как BBC Sport' }[V];
  page((CFG, x, pending) => CFG.screen === 'topic' ? `<button class="r-back" data-back>‹ Новости</button>${R.topic(CFG, x, pending)}` : R.feed(CFG), TITLE);
})();
