// w-match-news — созвон 05.11, задача 9.2: таб «Новости» в табах серии страницы матча — лента по матчу и командам, если есть (дирижёр 05.11:
// «надо подумать, как у нас новости будут отображаться… пока попробуй просто, как ты понимаешь, сделать таб новостей в странице матча»).
// Вкладку рисует w-series (_ws.js) — заглушка .ws-ph; сюда кладём содержимое (_ws.js не трогаем). Данные — общая база: DB.news (cybersport.ru 10–21.08), «сейчас» — 21.08 16:08.
// Команды — с нижней строки страницы (по номеру из лого), турнир — из матча в базе. «Про матч» — новости, где есть обе команды.
// MN — вид:
//   days — лента по дням, как на странице новостей: чипы «Всё · Про матч · команда · команда · турнир», строки «время · заголовок · источник», фото справа ·
//   lead — сверху «Про этот матч» крупно (главная + ещё три), ниже две колонки — новости каждой команды, внизу — турнир ·
//   time — хронология: новости вперемешку с картами серии (началась / победа), сверху «сейчас», ниже — «до матча» ·
//   cols — плотно, без фото: четыре блока «Про матч · команда · команда · турнир» по 6 строк «время · заголовок», «ещё N»
(() => {
  const MN = window.MN || 'days', D = () => window.DB, GD = window.GS_DATA;
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const TZ = { timeZone: 'Europe/Moscow' }, ts = t => typeof t === 'number' ? t : Date.parse(t);
  const hm = t => new Date(ts(t)).toLocaleTimeString('ru-RU', { ...TZ, hour: '2-digit', minute: '2-digit' });
  const dayKey = t => new Date(ts(t)).toLocaleDateString('ru-RU', { ...TZ, day: 'numeric', month: 'long' });
  const dayName = t => { const now = D().now(), k = dayKey(t); return k === dayKey(now) ? 'Сегодня' : k === dayKey(now - 864e5) ? 'Вчера' : k; };
  const k1 = v => v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : v;
  const pl = (n, a, b, c) => n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c;
  let F = 'all'; // фильтр в days
  const TM = {};

  const ctx = ph => { const DB = D(); if (!DB || !DB.news) return null; const bw = ph.closest('.bw') || document;
    const tm = s => { const t = bw.querySelector(`.d3-five.${s} .d3-tm:not(.wl-tm)`) || bw.querySelector(`.d3-five.${s} .d3-tm`); if (!t) return null;
      const logo = t.querySelector('img') ? t.querySelector('img').src : '', num = +((logo.match(/teams\/(\d+)\./) || [])[1]), x = DB.team(num) || DB.team(t.title);
      return x ? { id: x.id, num, name: t.title, logo } : null; };
    // 05.11 (дирижёр: «пропадание через несколько секунд осталось»): пока открыт таб «Новости», страница перерисовывается без нижней строки — команд в DOM нет;
    //   берём команды, запомненные при прошлой отрисовке (TM), иначе лента откатывалась к заглушке
    const A = tm('a') || TM.A, B = tm('b') || TM.B; if (!A || !B) return null; TM.A = A; TM.B = B;
    const m = DB.matches({ team: A.id }).filter(q => q.a === B.id || q.b === B.id).sort((x, y) => (x.state === 'live' ? -1 : 0) - (y.state === 'live' ? -1 : 0))[0];
    const tour = m && DB.tour(m.tour), all = new Map(); const nA = DB.news({ team: A.id }), nB = DB.news({ team: B.id }), nT = tour ? DB.news({ tour: tour.id }) : [];
    [...nA, ...nB, ...nT].forEach(n => all.set(n.id, n));
    const has = id => n => n.teams.includes(id), both = [...all.values()].filter(n => has(A.id)(n) && has(B.id)(n));
    const byT = (x, y) => ts(y.t) - ts(x.t);
    return { A, B, m, tour, both: both.sort(byT), nA: nA.filter(n => !has(B.id)(n)), nB: nB.filter(n => !has(A.id)(n)), nT: nT.filter(n => !has(A.id)(n) && !has(B.id)(n)), all: [...all.values()].sort(byT) }; };

  const lg = (C, n) => [C.A, C.B].filter(T => n.teams.includes(T.id)).map(T => `<img src="${esc(T.logo)}" alt="" title="${esc(T.name)}">`).join('');
  const meta = (C, n, logos = true) => `<span class="mn-m">${logos ? `<span class="mn-lg">${lg(C, n)}</span>` : ''}<span>${esc(n.src || '')}</span>${n.views ? `<span>${k1(n.views)} просмотров</span>` : ''}${n.com ? `<span>${n.com} ${pl(n.com, 'комментарий', 'комментария', 'комментариев')}</span>` : ''}</span>`;
  const img = n => n.img ? `<img class="mn-im" src="../${esc(n.img)}" alt="" loading="lazy">` : '';
  const A_ = n => `href="${esc(n.url || '#')}" target="_blank" rel="noopener"`;
  const empty = '<p class="mn-0">Новостей нет</p>';

  // ── days
  const days = C => { const tn = C.tour ? C.tour.short || C.tour.name : 'Турнир';
    const FL = [['all', 'Всё', C.all, ''], ['both', 'Про матч', C.both, `${lgo(C.A)}${lgo(C.B)}`], ['a', C.A.name, C.nA, lgo(C.A)], ['b', C.B.name, C.nB, lgo(C.B)], ['tour', tn, C.nT, '']].filter(f => f[0] === 'all' || f[2].length);
    const cur = FL.find(f => f[0] === F) || FL[0], L = cur[2].slice(0, 40), G = [];
    L.forEach(n => { const d = dayName(n.t); (G[G.length - 1] && G[G.length - 1][0] === d ? G[G.length - 1][1] : (G.push([d, []]), G[G.length - 1][1])).push(n); });
    return `<div class="mn mn--days"><div class="mn-f">${FL.map(f => `<button data-mn="${f[0]}" class="${f === cur ? 'on' : ''}">${f[3]}<span>${esc(f[1])}</span><small class="num">${f[2].length}</small></button>`).join('')}</div>
      ${G.map(([d, ns]) => `<section class="mn-day"><h4>${d}</h4>${ns.map(n => `<a class="mn-r${n.teams.includes(C.A.id) && n.teams.includes(C.B.id) ? ' is-both' : ''}" ${A_(n)}><time class="num">${hm(n.t)}</time><span class="mn-b"><span class="mn-t">${esc(n.title)}</span>${meta(C, n)}</span>${img(n)}</a>`).join('')}</section>`).join('') || empty}
      ${cur[2].length > 40 ? `<p class="mn-0">Показаны 40 из ${cur[2].length}</p>` : ''}</div>`; };
  const lgo = T => `<img class="mn-fl" src="${esc(T.logo)}" alt="">`;

  // ── lead
  const card = (C, n, big) => `<a class="mn-c${big ? ' mn-c--big' : ''}${n.img ? ' has-img' : ''}" ${A_(n)}>${n.img ? `<img class="mn-ci" src="../${esc(n.img)}" alt="" loading="lazy">` : `<span class="mn-cv">${lgo(C.A)}<i>×</i>${lgo(C.B)}</span>`}
    <span class="mn-cb"><span class="mn-ct">${esc(n.title)}</span><span class="mn-m"><time class="num">${dayName(n.t) === 'Сегодня' ? hm(n.t) : esc(dayName(n.t)) + ', ' + hm(n.t)}</time>${n.views ? `<span>${k1(n.views)} просмотров</span>` : ''}</span></span></a>`;
  const line = (C, n) => `<a class="mn-l" ${A_(n)}><time class="num">${dayName(n.t) === 'Сегодня' ? hm(n.t) : esc(new Date(ts(n.t)).toLocaleDateString('ru-RU', { ...TZ, day: '2-digit', month: '2-digit' }))}</time><span class="mn-lt">${esc(n.title)}</span></a>`;
  const col = (C, T, L, n = 6) => `<section class="mn-col"><h4>${T ? lgo(T) : ''}<span>${esc(T ? T.name : C.tour ? C.tour.short || C.tour.name : 'Турнир')}</span><small class="num">${L.length}</small></h4>${L.slice(0, 30).map(x => line(C, x)).join('') || empty}${L.length > n ? `<button class="mn-more" data-mnm>Ещё ${L.length - n}</button>` : ''}</section>`;
  const lead = C => { const [h, ...r] = C.both;
    return `<div class="mn mn--lead">${h ? `<section class="mn-top"><h3>Про этот матч <small class="num">${C.both.length}</small></h3><div class="mn-tg">${card(C, h, true)}<div class="mn-ts">${r.slice(0, 3).map(n => card(C, n)).join('')}</div></div></section>` : ''}
      <div class="mn-2">${col(C, C.A, C.nA)}${col(C, C.B, C.nB)}</div>${C.nT.length ? `<section class="mn-tour"><h3>${esc(C.tour ? C.tour.short || C.tour.name : 'Турнир')}</h3><div class="mn-tr">${C.nT.slice(0, 4).map(n => card(C, n)).join('')}</div></section>` : ''}</div>`; };

  // ── time: новости и карты серии на одной оси
  const seriesOf = () => { const h = document.querySelector('.d3-h[data-hc]'), mid = h ? +h.dataset.hc.split('|')[0] : 0; return GD && GD.series.find(x => x.maps.some(m => m.match_id === mid)); };
  const time = C => { const now = D().now(), S = seriesOf(), ev = [], nm = num => num === C.A.num ? C.A : num === C.B.num ? C.B : null;
    if (S) S.maps.forEach((m, i) => { const t0 = m.start_time * 1000, t1 = t0 + m.duration * 1000; if (t0 <= now) ev.push({ t: t0, k: 'map', h: `Карта ${i + 1} началась` });
      if (t1 <= now) { const W = nm(m.radiant_win ? m.radiant_team_id : m.dire_team_id); ev.push({ t: t1, k: 'win', h: `Карта ${i + 1} — победа ${W ? W.name : ''}`, T: W, d: `${Math.floor(m.duration / 60)}:${String(m.duration % 60).padStart(2, '0')}` }); } });
    const t0 = S ? S.maps[0].start_time * 1000 : now, inM = C.all.filter(n => ts(n.t) >= t0 && ts(n.t) <= now).map(n => ({ t: ts(n.t), k: 'news', n }));
    const live = [...ev, ...inM].sort((x, y) => y.t - x.t), pre = C.all.filter(n => ts(n.t) < t0).slice(0, 14);
    const it = e => e.k === 'news' ? `<a class="mn-e mn-e--n" ${A_(e.n)}><time class="num">${hm(e.t)}</time><i></i><span class="mn-b"><span class="mn-t">${esc(e.n.title)}</span>${meta(C, e.n)}</span>${img(e.n)}</a>`
      : `<div class="mn-e mn-e--${e.k}"><time class="num">${hm(e.t)}</time><i></i><span class="mn-eh">${e.T ? lgo(e.T) : ''}${esc(e.h)}${e.d ? `<small class="num">${e.d}</small>` : ''}</span></div>`;
    return `<div class="mn mn--time"><div class="mn-e mn-e--now"><time class="num">${hm(now)}</time><i></i><span class="mn-eh">Сейчас${C.m && C.m.live ? ` · ${esc(C.m.live)}` : ''}</span></div>
      ${live.map(it).join('')}<h4 class="mn-sep">До матча</h4>${pre.map(n => it({ t: ts(n.t), k: 'news', n })).join('') || empty}</div>`; };

  // ── cols
  const cols = C => `<div class="mn mn--cols">${C.both.length ? `<section class="mn-col"><h4>${lgo(C.A)}${lgo(C.B)}<span>Про матч</span><small class="num">${C.both.length}</small></h4>${C.both.slice(0, 30).map(x => line(C, x)).join('')}${C.both.length > 6 ? `<button class="mn-more" data-mnm>Ещё ${C.both.length - 6}</button>` : ''}</section>` : ''}
    ${col(C, C.A, C.nA)}${col(C, C.B, C.nB)}${C.nT.length ? col(C, null, C.nT) : ''}</div>`;

  // v5–v6 (дирижёр 05.11: «новостей, вероятно, будет немного — карточки обычные, но довольно большие; сначала возьми референс со страницы новостей — как если просто перенести; и отдельно — с большими карточками»).
  // Обе — только матч и две команды (без турнира): столько новостей у матча и будет
  // 05.11 (скрин дирижёра: в «Главном» «10 октября») — в базе есть новости команд за 2025 год с большими просмотрами, они всплывали в «Главное»; берём только последние 30 дней до «сейчас»
  const mine = C => { const now = D().now(); return [...C.both, ...C.nA, ...C.nB].filter(n => ts(n.t) <= now && now - ts(n.t) < 30 * 864e5).sort((x, y) => ts(y.t) - ts(x.t)); };
  const ago = t => { const m = Math.floor((D().now() - ts(t)) / 6e4); return m < 1 ? 'сейчас' : m < 60 ? `${m} мин назад` : dayName(t) === 'Сегодня' ? hm(t) : new Date(ts(t)).toLocaleDateString('ru-RU', { ...TZ, day: 'numeric', month: 'long' }); };
  // np — как на странице новостей (news-page v61, раскладка mod + m4): день — заголовок «Сегодня · N новостей», модульная сетка 3 колонки: большая (2×4, текст на фото) ·
  //   пара средних (по 4 клетки) · средняя + мелкие; мелкая — «время · заголовок» в клетке; не влезло — «Ещё N за день ›»
  let EXP = new Set();
  const np = (C, skip = [], top = '') => { const L = mine(C).filter(n => !skip.includes(n)), days = [...new Set(L.map(n => dayKey(n.t)))].slice(0, 5);
    const cell = (n, k, pair) => `<a class="np7-c np7-${k}" ${A_(n)}${pair ? ' data-pair' : ''}><img src="../${esc(n.img)}" alt="" loading="lazy"><span class="np7-b"><span class="np3-m"><time>${ago(n.t)}</time></span><span class="np7-t">${esc(n.title)}</span></span></a>`;
    const sm = n => `<a class="np3-i np7-s" ${A_(n)}><span class="np3-m"><time>${ago(n.t)}</time></span><span class="np3-t">${esc(n.title)}</span></a>`;
    return `<div class="mn mn--np">${top}${days.map((d, di) => { const Dn = L.filter(n => dayKey(n.t) === d).sort((x, y) => (y.views || 0) - (x.views || 0)), I = Dn.filter(n => n.img);
      const sup = I[0] && I[0].views >= 10000 ? I[0] : null, ph = sup ? [sup] : I.length >= 2 && di % 2 === 0 ? I.slice(0, 2) : I.slice(0, 1), k = sup ? 4 : ph.length === 2 ? 4 : 6;
      const r = Dn.filter(n => !ph.includes(n)), shown = EXP.has(di) ? r : r.slice(0, k), rest = r.length - shown.length;
      const P = sup ? cell(sup, 'big') : ph.map(n => cell(n, 'mid', ph.length === 2)).join('');
      return `<div class="n2-day"><div class="n2-day__h"><b>${dayName(Dn[0].t)}</b><small>${Dn.length} ${pl(Dn.length, 'новость', 'новости', 'новостей')}</small></div>
        <div class="np7 np7--m4">${P}${shown.map(sm).join('')}</div>${rest > 0 ? `<button class="np4-btn" data-mnx="${di}">Ещё ${rest} за день ›</button>` : ''}</div>`; }).join('') || empty}</div>`; };

  // big — обычные большие карточки, все одного размера, 2 в ряд: обложка 16 : 9 (нет фото — лого команд крупно), заголовок до 3 строк, ниже — лого · время · источник · просмотры.
  //   Сверху — «Про матч · команда · команда» сегментом; показано 8, «Показать ещё»
  let BF = 'all', BN = 8;
  const big = (C, skip = []) => { const FL = [['all', 'Все', mine(C)], ['both', 'Про матч', C.both], ['a', C.A.name, C.nA], ['b', C.B.name, C.nB]].map(f => [f[0], f[1], f[2].filter(n => !skip.includes(n))]).filter(f => f[0] === 'all' || f[2].length);
    const cur = FL.find(f => f[0] === BF) || FL[0], L = cur[2];
    const cov = n => { const T = [C.A, C.B].filter(x => n.teams.includes(x.id)); return n.img ? `<img class="mn-bi" src="../${esc(n.img)}" alt="" loading="lazy">`
      : `<span class="mn-bi mn-bv${T.length > 1 ? ' is-two' : ''}">${T.map(x => `<img src="${esc(x.logo)}" alt="">`).join('<i>×</i>')}</span>`; };
    return `<div class="mn mn--big"><div class="mn-bh"><div class="mn-seg">${FL.map(f => `<button data-mnb="${f[0]}" class="${f === cur ? 'on' : ''}">${esc(f[1])}<small class="num">${f[2].length}</small></button>`).join('')}</div></div>
      <div class="mn-bg">${L.slice(0, BN).map(n => `<a class="mn-bc" ${A_(n)}>${cov(n)}<span class="mn-bb"><span class="mn-bt">${esc(n.title)}</span>${n.lede ? `<span class="mn-bl">${esc(n.lede)}</span>` : ''}<span class="mn-m"><span class="mn-lg">${lg(C, n)}</span><time>${ago(n.t)}</time><span>${esc(n.src || '')}</span>${n.views ? `<span>${k1(n.views)} просмотров</span>` : ''}</span></span></a>`).join('') || empty}</div>
      ${L.length > BN ? `<button class="mn-bmore" data-mnbm>Показать ещё ${Math.min(8, L.length - BN)} из ${L.length - BN}</button>` : ''}</div>`; };
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-mnx], [data-mnb], [data-mnbm]'); if (!t) return; e.preventDefault();
    if (t.dataset.mnx != null) EXP.add(+t.dataset.mnx); else if (t.dataset.mnb) { BF = t.dataset.mnb; BN = 8; } else BN += 8; paint(); }, true);

  // v8 np2 (дирижёр 05.11: «на странице новостей одна карточка главная — посередине переключается, а под ней блоки»): сверху — главная, слайдер 5 новостей матча (по просмотрам, сначала с фото),
  //   смена каждые 6 с, точки — переключить; ниже — дни модульной сеткой, как v5, без тех, что в слайдере
  const cover = (C, n, cls) => { const T = [C.A, C.B].filter(x => n.teams.includes(x.id)); return n.img ? `<img class="${cls}" src="../${esc(n.img)}" alt="" loading="lazy">`
    : `<span class="${cls} mn-bv${T.length > 1 ? ' is-two' : ''}">${T.map(x => `<img src="${esc(x.logo)}" alt="">`).join('<i>×</i>')}</span>`; };
  const np2 = C => { const L = mine(C), H = [...L].sort((x, y) => (!!y.img - !!x.img) || (y.views || 0) - (x.views || 0)).slice(0, 5);
    const top = `<div class="mn-hero">${H.map((n, i) => `<a class="mn-hs${i ? '' : ' on'}" ${A_(n)}>${cover(C, n, 'mn-hi')}<span class="mn-hb"><span class="np3-m"><time>${ago(n.t)}</time></span><span class="mn-ht">${esc(n.title)}</span>${n.lede ? `<span class="mn-hl">${esc(n.lede)}</span>` : ''}</span></a>`).join('')}
      <div class="mn-hd">${H.map((_, i) => `<button data-mnh="${i}" class="${i ? '' : 'on'}" aria-label="Новость ${i + 1}"></button>`).join('')}</div></div>`;
    return np(C, H, top); };
  const hero = (box, i) => { const S = box.querySelectorAll('.mn-hs'), B = box.querySelectorAll('[data-mnh]'); if (!S.length) return; i = (i + S.length) % S.length; box._i = i;
    S.forEach((x, k) => x.classList.toggle('on', k === i)); B.forEach((x, k) => x.classList.toggle('on', k === i)); };
  setInterval(() => document.querySelectorAll('.mn-hero:not(:hover)').forEach(b => hero(b, (b._i || 0) + 1)), 6000);
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-mnh]'); if (!b) return; e.preventDefault(); hero(b.closest('.mn-hero'), +b.dataset.mnh); }, true);

  // v9 wide (дирижёр 05.11: «большие норм, но хочу ещё на всю ширину такие карточки, чтобы там картинки были»): как v6, но карточка во всю ширину — обложка 21 : 9, ниже заголовок крупно и суть
  const wide = C => big(C).replace('mn mn--big', 'mn mn--big mn--wide');

  // v11 row (дирижёр 05.11: «карточки другими — не большими: картинка слева, чуть уже, название справа; нет картинки — лого команд»): как v9, но строкой — обложка 16 : 9 слева, текст справа
  const row = C => big(C).replace('mn mn--big', 'mn mn--big mn--row');
  // v12 row2 (дирижёр 05.11: «в v11 строки — по 2 в ряд, сеткой; сверху — виджет, который на странице новостей самый первый»): сверху «Главное», как на странице новостей (news-page v61):
  //   три колонки поровну, 460 px — слева 5 новостей строками, в центре слайдер 5 главных (смена 6 с, полоски снизу), справа 2 с фото; нет фото — лого команд. Ниже — карточки v11 по две в ряд, без тех, что в «Главном»
  const main = (C, nl = 5) => { const L = mine(C).sort((x, y) => (y.views || 0) - (x.views || 0)), H = [...L].sort((x, y) => (!!y.img - !!x.img) || (y.views || 0) - (x.views || 0)).slice(0, 5);
    const r = L.filter(n => !H.includes(n)), M = r.filter(n => n.img).slice(0, 2).concat(r.filter(n => !n.img)).slice(0, 2), Ls = r.filter(n => !M.includes(n)).slice(0, nl);
    const html = `<section class="mn-main"><div class="mn-mls"><div class="mn-msh">Главное</div>${Ls.map(n => `<a class="mn-mli" ${A_(n)}><span class="np3-m"><time>${ago(n.t)}</time></span><span class="mn-mlt">${esc(n.title)}</span></a>`).join('')}</div>
      <div class="mn-hero mn-hero--in">${H.map((n, i) => `<a class="mn-hs${i ? '' : ' on'}" ${A_(n)}>${cover(C, n, 'mn-hi')}<span class="mn-hb"><span class="np3-m"><time>${ago(n.t)}</time></span><span class="mn-ht">${esc(n.title)}</span></span></a>`).join('')}
        <div class="mn-hd mn-hd--bar">${H.map((_, i) => `<button data-mnh="${i}" class="${i ? '' : 'on'}" aria-label="Новость ${i + 1}"><i></i></button>`).join('')}</div></div>
      <div class="mn-mmd">${M.map(n => `<a class="mn-mm" ${A_(n)}>${cover(C, n, 'mn-mmi')}<span class="np3-m"><time>${ago(n.t)}</time></span><span class="mn-mmt">${esc(n.title)}</span></a>`).join('')}</div></section>`;
    return { html, used: [...H, ...M, ...Ls] }; };
  const row2 = C => { const T = main(C); return `<div class="mn mn--row2wrap">${T.html}${big(C, T.used).replace('mn mn--big', 'mn mn--big mn--row mn--row2')}</div>`; };
  // v13 row3 (дирижёр 05.11: «больше новостей с картинками; в колонке „Главного“ поменьше; сегмент убрать — у нас просто новости по матчу; ближе к виду новостей в виджете»):
  //   «Главное» — слева 3 строки (было 5); ниже без сегмента — сначала новости с картинкой, потом без; карточка как строка виджета «Новости» (widget-news v73):
  //   сверху время моно и «Tier 1», в заголовке команды и игроки матча — плашками (лого / фото), картинка слева
  const chips = (C, t) => { const DB = D(), W = []; [C.A, C.B].forEach(T => { const x = DB.team(T.id); [x.name, x.mid, x.tag].filter((v, i, a) => v && v.length > 2 && a.indexOf(v) === i).forEach(w => W.push([w, `<span class="mn-ch"><img src="${esc(T.logo)}" alt="">${'$&'}</span>`])); });
    [C.A, C.B].forEach(T => (DB.players({ team: T.id }) || []).forEach(q => q.nick && q.nick.length > 2 && W.push([q.nick, `<span class="mn-ch mn-ch--p">${q.avatar || q.photo ? `<img src="../${esc(q.photo || q.avatar)}" alt="">` : ''}${'$&'}</span>`])));
    W.sort((x, y) => y[0].length - x[0].length); let h = esc(t), out = '', i = 0;
    const re = new RegExp(`(?<![\\wА-Яа-яЁё])(${W.map(w => w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\wА-Яа-яЁё])`, 'g');
    h = h.replace(re, x => { const w = W.find(q => q[0] === x); return w ? w[1].replace('$&', x) : x; });
    return h.replace(/([«"(„]*)(<span class="mn-ch[^>]*>(?:(?!<\/span>)[\s\S])*<\/span>)([,.:;!?»")…]*)/g, (x, l, m, r) => (l || r ? `<span class="mn-nb">${l}${m}${r}</span>` : x)); };
  const tier = n => n.tours && n.tours.includes('ti-2026') ? '<span class="t5-tier t5-tier--fill t5-tier--1">Tier 1</span>' : '';
  const row3 = C => { const T = main(C, 3), L = mine(C).filter(n => !T.used.includes(n)), G = [...L.filter(n => n.img), ...L.filter(n => !n.img)].slice(0, BN);
    return `<div class="mn mn--row2wrap">${T.html}<div class="mn mn--big mn--row mn--row2 mn--row3"><div class="mn-bg">${G.map(n => `<a class="mn-bc" ${A_(n)}>${cover(C, n, 'mn-bi')}<span class="mn-bb"><span class="mn-wm"><time>${ago(n.t)}</time>${tier(n)}</span><span class="mn-bt">${chips(C, n.title)}</span></span></a>`).join('')}</div>
      ${L.length > BN && !window.MN_END ? `<button class="mn-bmore" data-mnbm>Показать ещё ${Math.min(8, L.length - BN)} из ${L.length - BN}</button>` : ''}</div></div>`; };
  // v14 (дирижёр 05.11: «про матч не будет 70 новостей — убери „Показать ещё“, просто конец страницы»): MN_END — 8 карточек и всё
  const V = { days, lead, time, cols, np, big, np2, wide, row, row2, row3 };
  // v7 side (дирижёр 05.11: «одну версию — без таба „Новости“, с виджетом новостей в правой колонке — он у нас уже есть, только написать, что новости по турниру»):
  //   таба «Новости» нет; в правой колонке последним — виджет «Новости» со страницы турнира (widget-news v73, NW2, те же опции, что в gs-tournament v45), заголовок — «Новости турнира»
  if (MN === 'side') { document.documentElement.classList.add('mn-notab');
    const NWO = { pic: 'mix', fresh: true, btn: 'more', icon: 'doc', open: 'inline', reveal: 'type', pts: 2, even: true, rich: true, para2: true, hl: 'chip', ava: true, sq: true, sm: true, pad: true, calm: true, pl: 'logos' };
    // v15 (созвон 06.11 §2.1–2.3, дирижёр: «новости — под прогнозами, в правой колонке» · «внутри виджета маленький сегмент „Этот матч · Все“»): MN_SEG — сегмент, заголовок «Новости»; встаёт сразу под прогнозами (.pc-host); v16 MN_SEG = 'hd' — сегмент справа в шапке; v17 MN_DOCK — «Все новости ›» внизу
    const SEG = !!window.MN_SEG;
    const side = () => { const as = document.querySelector(SEG ? '.gm-side' : 'aside.gm-side'); if (!as || !window.NW2) return;
      // дирижёр 06.11 (финальная проверка): «MVP должно быть выше» — есть MVP матча (после матча) → новости под ним, иначе — под прогнозами
      const mvp = [...as.children].find(c => c.matches('[data-wd="mvp"]') || c.querySelector('[data-wd="mvp"]')), pc = mvp || (SEG && [...as.children].find(c => c.matches('.pc-host') || c.querySelector('.pc-host'))), had = as.querySelector(':scope > .mn-side');
      if (had) { if (pc && pc.nextElementSibling !== had) pc.after(had); return; }
      const w = document.createElement('div'); w.className = 'gm-wd mn-side'; if (pc) pc.after(w); else as.append(w);
      NW2.render(w, { ...NWO, seg: window.MN_SEG || false, dock: window.MN_DOCK === 2 ? 2 : !!window.MN_DOCK, segi: window.MN_SEGI || false, nodiv: !!window.MN_NODIV, gap: !!window.MN_GAP, edge: !!window.MN_EDGE, fadeLate: window.MN_FADE_LATE || 0, fadeLateB: window.MN_FADE_LATE_B || 0, fade: window.MN_FADE === 2 || window.MN_FADE === 'v' || window.MN_FADE === 'p' ? window.MN_FADE : !!window.MN_FADE, phone: !document.body.classList.contains('is-desk') });
      const t = w.querySelector('.w-hd__t'); if (t) t.textContent = SEG ? 'Новости' : window.NW2_TEAMS ? 'Новости матча' : 'Новости турнира'; };
    new MutationObserver(() => side()).observe(document.documentElement, { childList: true, subtree: true }); }
  const paint = () => !V[MN] ? 0 : document.querySelectorAll('.ws-ph').forEach(ph => { const C = ctx(ph); if (!C) return; const h = V[MN](C); if (ph._mn !== h) { ph.innerHTML = h; ph._mn = h; ph.classList.add('mn-on'); } });
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-mn]'); if (b) { e.preventDefault(); F = b.dataset.mn; paint(); return; }
    const m = e.target.closest && e.target.closest('[data-mnm]'); if (m) { e.preventDefault(); m.parentElement.classList.add('is-all'); m.remove(); } }, true);
  // MN_OPEN (дирижёр 05.11: «открывай сразу новости, чтобы не на каждом перекликивать») — только в лабе: при загрузке один раз жмём таб «Новости»
  let opened = !window.MN_OPEN || MN === 'side'; const open = () => { if (opened) return; const t = document.querySelector('.ws-tabs [data-ws="news"]'); if (t) { opened = true; t.click(); } };
  // 05.11 (дирижёр: «пропадает в какой-то момент»): перерисовка — сразу в наблюдателе, не через requestAnimationFrame: в песочнице кадры у фреймов вне экрана не идут, и вкладка оставалась заглушкой
  new MutationObserver(() => { open(); paint(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
