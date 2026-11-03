// news v19–v21 — плотная лента под цветными линиями (дирижёр 30.10: «не нравятся сетки новостей; понравилась тема под цветной линией; плотность больше, мало новостей»).
// Данные — _feed.js: 92 настоящие новости Dota 2 с cybersport.ru за 26–30.10 (время мск, просмотры, комментарии — как на сайте). Ничего лишнего: ни матчей, ни фильтров — только новости.
// Наша обработка: новость → тема (кластер) по правилам RULES; тема = цветная линия + «Название / о чём»; внутри — главная (самая читаемая) и строки по времени.
// Грузится ДО _nx.js: кладёт темы в window.NEWS, чтобы общий page() (шапка, путь, LAB) работал как в остальных вариантах.
(() => {
  const F = window.NEWS_FEED, NOW = new Date('2026-10-30T15:00');
  const RULES = [
    ['spi', 'Team Spirit', 'проиграли OG, выбили LEGION, сегодня — PARIVISION', '#60a5fa', /Spirit/],
    ['pv', 'PARIVISION', 'нижняя сетка после Team Yandex', '#f472b6', /PARIVISION/],
    ['bb', 'BETBOOM и 1w Team', 'вылет, замены и скандал с Pure~', '#f59e0b', /BETBOOM|1w|gpK|bzm|Save-|Stariy bog|Pure~|Petushara/i],
    ['liq', 'Team Liquid', 'Wisper, Malr1ne и спор о языке', '#22d3ee', /Wisper|Malr1ne|Nisha|Liquid/],
    ['uni', 'UNIVERSE by FISSURE', 'плей-офф: Yandex, OG, GamerLegion', '#a78bfa', /UNIVERSE|Nightfall|Yandex|\bOG\b|SabeRLight|Lorenof|Topson|Ceb |Adekvat|9Class/],
    ['game', 'Онлайн и баги', 'минус 300 тыс. ботов, Meepo, крипы', '#4ade80', /[Оо]нлайн|баг|патч|Meepo|MMR|GPM|Steam|кастом|героев|саппортов|бан|rostislav/],
    ['scene', 'Сцена', 'ESL в Мюнхене, PGL, 322 на reddit', '#fb7185', /ESL|PGL|DPC|Fonbet|322|PlayTime|инактив|Astini/],
    ['talk', 'Мнения', 'игроки и аналитики о сцене', '#a1a1aa', /./],
  ];
  const at = s => new Date(s), day = d => d.toDateString();
  const MON = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const hm = d => d.toTimeString().slice(0, 5);
  const when = d => { const y = new Date(NOW); y.setDate(y.getDate() - 1); return day(d) === day(NOW) ? hm(d) : day(d) === day(y) ? 'вчера' : `${d.getDate()} ${MON[d.getMonth()]}`; };
  const dayName = d => { const y = new Date(NOW); y.setDate(y.getDate() - 1); return day(d) === day(NOW) ? 'Сегодня' : day(d) === day(y) ? 'Вчера' : `${d.getDate()} ${MON[d.getMonth()]}`; };
  const ago = d => { const m = Math.round((NOW - d) / 60000); return m < 60 ? m + ' мин' : m < 1440 ? Math.round(m / 60) + ' ч' : when(d); };
  const k = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',') + ' тыс.' : String(n);
  F.forEach((n, i) => { n.i = i; n.d = at(n.t); const r = RULES.find(r => r[4].test(n.title)); n.c = r[0]; });
  const HOT = [...F].sort((a, b) => b.views - a.views).slice(0, 12).map(n => n.i);
  // тема: ряды по времени (новые сверху), главная — самая читаемая с фото; вес темы — просмотры за 2 суток
  const T = RULES.map(([id, name, sub, color]) => { const a = F.filter(n => n.c === id).sort((x, y) => y.d - x.d); if (!a.length) return null;
    const views = a.reduce((s, n) => s + n.views, 0), fresh = a.filter(n => NOW - n.d < 2 * 864e5).reduce((s, n) => s + n.views, 0);
    const lead = [...a].sort((x, y) => (y.img ? 1 : 0) - (x.img ? 1 : 0) || y.views - x.views)[0];
    return { id, title: `${name} — ${sub}`, name, sub, color, items: a, lead, views, fresh, last: a[0].d, ago: ago(a[0].d), ups: [], src: [], imgs: [] };
  }).filter(Boolean).sort((a, b) => (b.id === 'talk' ? -1 : 0) - (a.id === 'talk' ? -1 : 0) || b.fresh - a.fresh);
  window.NEWS = T; window.NEWS_QUOTES = [];

  window.DENSE = () => {
    const { esc, page } = window.NX, V = window.DENSE_V; let SEL = null;
    const eye = '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M8 3C4.4 3 1.7 5.6 1 8c.7 2.4 3.4 5 7 5s6.3-2.6 7-5c-.7-2.4-3.4-5-7-5Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="currentColor"/></svg>';
    const bub = '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M2 3h12v8H6l-3 3v-3H2z" fill="currentColor"/></svg>';
    const stat = n => `<span class="z-st num${HOT.includes(n.i) ? ' is-hot' : ''}">${eye}${k(n.views)}${n.com ? `<i>${bub}${n.com}</i>` : ''}</span>`;
    const go = (t, n) => `href="#" data-id="${t.id}"${n ? ` data-n="${n.i}"` : ''}`;
    const head = (t, big) => `<h2 class="z-h${big ? ' is-big' : ''}"><b>${esc(t.name)}</b><span> / ${esc(t.sub)}</span></h2><div class="z-hm num">${t.items.length} новост${t.items.length % 10 === 1 && t.items.length !== 11 ? 'ь' : t.items.length % 10 >= 2 && t.items.length % 10 <= 4 && (t.items.length < 10 || t.items.length > 20) ? 'и' : 'ей'} · ${k(t.views)} просмотров · обновлено ${esc(t.ago)}${t.ago.match(/мин|ч$/) ? ' назад' : ''}</div>`;
    const row = (t, n) => `<a class="z-row${HOT.includes(n.i) ? ' is-hot' : ''}" ${go(t, n)}><time class="num">${when(n.d)}</time><span>${esc(n.title)}</span>${stat(n)}</a>`;
    const leadCard = (t, cls = '') => { const n = t.lead; return `<a class="z-lead ${cls}" ${go(t, n)}>${n.img ? `<span class="z-pic"><img src="${n.img}" alt="" loading="lazy"></span>` : ''}<span class="z-lt"><b>${esc(n.title)}</b>${n.lede ? `<p>${esc(n.lede)}</p>` : ''}<span class="z-meta num">${when(n.d)} · cybersport.ru ${stat(n)}</span></span></a>`; };

    // v19 — темы колонками (как газетная полоса / Techmeme): блок = линия + шапка + главная + строки
    const cols = (CFG) => { const n = CFG.view === 'desk' ? 7 : 5;
      return `<div class="z-top"><h1 class="z-h1">Новости Dota 2</h1><span class="num">${F.length} новостей за 5 дней · ${T.length} тем</span></div>
        <div class="z-cols">${T.map(t => `<section class="z-blk" style="--c:${t.color}">${head(t)}${leadCard(t, 'is-col')}<div class="z-rows">${t.items.filter(x => x !== t.lead).slice(0, n).map(x => row(t, x)).join('')}</div>${t.items.length - 1 > n ? `<a class="z-more" ${go(t)}>Ещё ${t.items.length - 1 - n} ›</a>` : ''}</section>`).join('')}</div>`; };

    // v20 — лента по времени: дни, ряды плотно; у каждой строки — название темы её цветом; самые читаемые — крупнее и с фото; справа — темы под линиями
    const river = (CFG) => { const byT = Object.fromEntries(T.map(t => [t.id, t])); let last = '';
      const list = [...F].sort((a, b) => b.d - a.d).map(n => { const t = byT[n.c], d = dayName(n.d), sep = d !== last ? `<h3 class="z-day">${d}<span class="num">${F.filter(x => dayName(x.d) === d).length}</span></h3>` : ''; last = d;
        const hot = HOT.includes(n.i) && n.img;
        return sep + `<a class="z-rv${hot ? ' is-hot' : ''}" ${go(t, n)}><time class="num">${hm(n.d)}</time><span class="z-rvt"><em style="color:${t.color}">${esc(t.name)}</em><b>${esc(n.title)}</b>${hot && n.lede ? `<p>${esc(n.lede)}</p>` : ''}${stat(n)}</span>${hot ? `<span class="z-pic"><img src="${n.img}" alt="" loading="lazy"></span>` : ''}</a>`; }).join('');
      return `<div class="n-cols"><main><div class="z-top"><h1 class="z-h1">Новости Dota 2</h1><span class="num">${F.length} новостей · обновлено ${hm(F.map(n => n.d).sort((a, b) => b - a)[0])}</span></div>${list}</main>
        <aside><div class="z-idx">${T.map(t => `<a class="z-ix" style="--c:${t.color}" ${go(t)}><b>${esc(t.name)}</b><span>${esc(t.sub)}</span><small class="num">${t.items.length} · ${k(t.views)} · ${esc(t.ago)}</small></a>`).join('')}</div></aside></div>`; };

    // v21 — темы-полосы во всю ширину (The Verge, плотнее): главная с фото слева, справа две колонки строк; первые две строки — с маленьким фото
    const bands = (CFG) => { const n = CFG.view === 'desk' ? 10 : 5;
      return `<div class="z-top"><h1 class="z-h1">Новости Dota 2</h1><span class="num">${F.length} новостей за 5 дней</span></div>
        ${T.map(t => `<section class="z-band" style="--c:${t.color}">${head(t, true)}<div class="z-bin">${leadCard(t, 'is-band')}<div class="z-bl">${t.items.filter(x => x !== t.lead).slice(0, n).map((x, i) => i < 2 && x.img ? `<a class="z-bs" ${go(t, x)}><span class="z-pic"><img src="${x.img}" alt="" loading="lazy"></span><span><b>${esc(x.title)}</b><span class="z-meta num">${when(x.d)} ${stat(x)}</span></span></a>` : row(t, x)).join('')}</div></div>${t.items.length - 1 > n ? `<a class="z-more" ${go(t)}>Вся тема · ${t.items.length} ›</a>` : ''}</section>`).join('')}`; };

    // тема: линия + крупное «Название / о чём», главная, дальше все новости темы по дням; нажатая в ленте — подсвечена
    const topic = (CFG, t) => { let last = '';
      const list = t.items.map(n => { const d = dayName(n.d), sep = d !== last ? `<h3 class="z-day">${d}</h3>` : ''; last = d;
        return sep + `<a class="z-tr${SEL === n.i ? ' is-sel' : ''}" href="${esc(n.url)}" target="_blank" rel="noopener"><time class="num">${hm(n.d)}</time><span class="z-rvt"><b>${esc(n.title)}</b>${n.lede ? `<p>${esc(n.lede)}</p>` : ''}<span class="z-meta num">cybersport.ru ↗ ${stat(n)}</span></span>${n.img ? `<span class="z-pic"><img src="${n.img}" alt="" loading="lazy"></span>` : ''}</a>`; }).join('');
      return `<section class="z-topic" style="--c:${t.color}"><h1 class="z-h is-xl"><b>${esc(t.name)}</b><span> / ${esc(t.sub)}</span></h1><div class="z-hm num">${t.items.length} новостей · ${k(t.views)} просмотров · обновлено ${esc(t.ago)}</div>
        <div class="n-cols"><main>${leadCard(t, 'is-band')}<div class="z-tl">${list}</div></main><aside><div class="z-idx"><div class="z-ixh">Другие темы</div>${T.filter(o => o !== t).map(o => `<a class="z-ix" style="--c:${o.color}" ${go(o)}><b>${esc(o.name)}</b><span>${esc(o.sub)}</span><small class="num">${o.items.length} · ${esc(o.ago)}</small></a>`).join('')}</div></aside></div></section>`; };

    document.addEventListener('click', e => { const a = e.target.closest('[data-id]'); if (a) SEL = a.dataset.n ? +a.dataset.n : null; }, true);
    const R = { cols, river, bands }[V];
    page((CFG, x) => CFG.screen === 'topic' ? topic(CFG, x) : R(CFG), document.title.replace(/^v\d+ · /, ''));
    const L = window.LAB; L.axes = () => [
      { key: 'view', name: 'Вид', value: document.querySelector('.stage').classList.contains('is-desk') ? 'desk' : 'phone', options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'screen', name: 'Экран', value: document.querySelector('.s-feed') ? 'feed' : (T.find(t => document.querySelector('.z-topic') && document.querySelector('.z-topic h1 b').textContent === t.name) || T[0]).id,
        options: [{ v: 'feed', label: 'Лента' }, ...T.map(t => ({ v: t.id, label: 'Тема: ' + t.name }))] }];
    L.caption = () => `${document.title.replace(/^v\d+ · /, '')}. ${F.length} настоящих новостей Dota 2 с cybersport.ru за 26–30.10 (просмотры и комментарии — с сайта); нажми новость — откроется её тема`;
  };
})();
