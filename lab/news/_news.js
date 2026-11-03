// news — лаба «Страница новостей» (З1, дирижёр 30.10: «новость как тема, как матч»; «лабу в стилях, страницу в стилях»).
// Два экрана: Лента (все темы) → Тема (одна новость: суть, главное, хронология обновлений — новые сверху, источники, связанный матч).
// Как приходят новости: у live-темы через 6 с приходит новое обновление — сверху «↑ 1 новое», нажал — встаёт в хронологию; в ленте у неё «LIVE».
// Вариант — window.NEWS_V: topics — карточки тем (Particle, Google News) · swipe — по одной на экран, листать вверх (Inshorts) · dense — плотная лента по дням с кластерами (Techmeme, HLTV), тема — live-блог (BBC).
// Данные — _ndata.js (пример), команды — GS_NAMES, матч — gs-match/data. Стиль — токены виджетов (widget-tournament/_w.css), шапка — как на странице матча.
(() => {
  const V = window.NEWS_V || 'topics', N = window.NEWS, D = window.GS_DATA, NM = window.GS_NAMES || { NAME: {}, SHORT: {} };
  const CFG = { view: 'phone', screen: 'feed', id: 'vis-spi', f: 'all' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const IMG = '../gs-match/';
  const team = t => typeof t === 'number' ? { name: NM.NAME[t] || (D.teams[t] || {}).name, logo: (D.teams[t] || {}).logo } : { name: t, logo: '' };
  const chip = t => { const x = team(t); return `<span class="n-tm">${x.logo ? `<img src="${IMG + x.logo}" alt="">` : '<i></i>'}${esc(x.name)}</span>`; };
  const k = v => (v < 0 ? '−' : '+') + (Math.abs(v) / 1000).toFixed(1) + 'k';
  const live = '<span class="n-live">LIVE</span>';
  const pending = {}; let timer = null;

  // матч темы — карточка как на странице матча: команды, счёт серии, карта и время, перевес
  function match(si) {
    const s = D.series[si], m3 = s.maps[2], t = 2010, A = m3.radiant_team_id, B = m3.dire_team_id, g = m3.radiant_gold_adv[Math.floor(t / 60)];
    const lead = g >= 0 ? A : B;
    return `<a class="n-card n-match" href="#"><div class="n-mh"><span>${esc(window.GS_TOURNAMENT?.league || '')} · Bo3</span>${live}</div>
      <div class="n-mrow">${chip(A)}<b class="num">1 : 1</b>${chip(B)}</div>
      <div class="n-msub num">Карта 3 · 33:30 · <span class="${g >= 0 ? 'up' : 'dn'}">${esc(NM.SHORT[lead] || '')} ${k(Math.abs(g))}</span></div>
      <span class="n-mgo">Открыть матч ›</span></a>`;
  }
  const meta = x => `<div class="n-meta">${x.live ? live : ''}<span>${esc([x.tour, x.ago].filter(Boolean).join(' · '))}</span></div>`;
  const counts = x => `${x.ups.length} ${x.ups.length === 1 ? 'обновление' : x.ups.length < 5 ? 'обновления' : 'обновлений'} · ${x.src.length} ${x.src.length === 1 ? 'источник' : x.src.length < 5 ? 'источника' : 'источников'}`;
  const FIL = [['all', 'Все'], ['live', 'Сейчас'], ['The International 2026', 'TI 2026'], ['UNIVERSE by FISSURE', 'UNIVERSE']];
  const list = () => N.filter(x => CFG.f === 'all' || (CFG.f === 'live' ? x.live : x.tour === CFG.f));
  const filters = () => `<div class="n-fil">${FIL.map(([v, l]) => `<button data-f="${v}" class="${CFG.f === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;

  // ── Лента ─────────────────────────────────────────────────────────────
  const card = (x, big) => `<a class="n-card n-topic${big ? ' is-big' : ''}" href="#" data-id="${x.id}">${meta(x)}<h3>${esc(x.title)}</h3><p>${esc(x.lede)}</p>
    <div class="n-foot">${(x.teams || []).map(chip).join('')}<span class="n-cnt">${counts(x)}</span></div></a>`;
  function feedTopics() {
    const L = list();
    return `<div class="n-cols"><main><h1 class="n-h1">Новости</h1>${filters()}<div class="n-list">${L.map((x, i) => card(x, i === 0)).join('') || empty()}</div></main>
      <aside><div class="n-side-h">Сейчас идёт</div>${match(2)}</aside></div>`;
  }
  // по одной на экран: карточка на всю высоту, листаешь вверх — следующая
  function feedSwipe() {
    const L = list();
    return `<div class="n-swipe">${L.map((x, i) => `<section class="n-slide" data-id="${x.id}"><div class="n-slide-in">${meta(x)}<h2>${esc(x.title)}</h2><p>${esc(x.lede)}</p>
      <ul class="n-main">${x.main.map(m => `<li>${esc(m)}</li>`).join('')}</ul>${x.match != null ? match(x.match) : ''}
      <div class="n-foot">${(x.teams || []).map(chip).join('')}</div><button class="n-open" data-id="${x.id}">Открыть тему · ${counts(x)}</button>
      <span class="n-pg num">${i + 1} / ${L.length}</span></div></section>`).join('') || empty()}</div>`;
  }
  // плотно: по дням, строка — время · заголовок · источники; у live — два последних обновления кластером под ней
  function feedDense() {
    const L = list(), today = L.filter(x => x.ago !== 'вчера'), old = L.filter(x => x.ago === 'вчера');
    const row = x => `<a class="n-row" href="#" data-id="${x.id}"><span class="n-rt num">${x.live ? live : esc(x.ups[0].t.replace('вчера, ', ''))}</span><span class="n-rb"><b>${esc(x.title)}</b>
      <small>${esc(x.src.map(s => s[0]).filter((v, i, a) => a.indexOf(v) === i).join(' · '))} · ${counts(x)}</small>
      ${x.live ? `<span class="n-cl">${x.ups.slice(0, 2).map(u => `<span><i class="num">${u.t}</i>${esc(u.text)}</span>`).join('')}</span>` : ''}</span></a>`;
    const day = (t, a) => a.length ? `<div class="n-day">${t}</div>${a.map(row).join('')}` : '';
    const keys = N.flatMap(x => x.ups.filter(u => u.key && !/вчера/.test(u.t)).map(u => ({ ...u, x }))).slice(0, 5);
    return `<div class="n-cols"><main><h1 class="n-h1">Новости</h1>${filters()}<div class="n-card n-dense">${day('Сегодня', today) + day('Вчера', old) || empty()}</div></main>
      <aside><div class="n-side-h">Сейчас идёт</div>${match(2)}<div class="n-side-h">Главное за день</div><div class="n-card n-keys">${keys.map(u => `<a href="#" data-id="${u.x.id}"><i class="num">${u.t}</i>${esc(u.text)}</a>`).join('')}</div></aside></div>`;
  }
  const empty = () => '<div class="n-empty">Пока новостей нет</div>';

  // ── Тема ──────────────────────────────────────────────────────────────
  function topic() {
    const x = N.find(t => t.id === CFG.id), p = pending[x.id];
    const newBtn = p ? `<button class="n-new" data-new>↑ ${p.length} ${p.length === 1 ? 'новое' : 'новых'}</button>` : '';
    const up = u => `<li class="${u.key ? 'is-key' : ''}${u.fresh ? ' is-fresh' : ''}"><i class="num">${esc(u.t)}</i><span>${esc(u.text)}</span></li>`;
    const others = N.filter(o => o.id !== x.id && (o.tour && o.tour === x.tour || (o.teams || []).some(t => (x.teams || []).includes(t)))).slice(0, 3);
    const side = `${x.match != null && CFG.view !== 'phone' ? `<div class="n-side-h">Матч</div>${match(x.match)}` : ''}${x.teams ? `<div class="n-side-h">Команды</div><div class="n-card n-teams">${x.teams.map(chip).join('')}</div>` : ''}
      ${others.length ? `<div class="n-side-h">Ещё по теме</div>${others.map(o => card(o)).join('')}` : ''}`;
    const blog = V === 'dense';
    const body = blog
      ? `<div class="n-card n-pin"><div class="n-side-h">Ключевые моменты</div><ul>${x.ups.filter(u => u.key).map(up).join('')}</ul></div>
         <div class="n-sec-h">${x.live ? '<span class="n-dot"></span>Обновляется · новые сверху' : 'Хронология'}</div>${newBtn}<div class="n-blog">${x.ups.map(u => `<div class="n-card n-post${u.key ? ' is-key' : ''}${u.fresh ? ' is-fresh' : ''}"><b class="num">${esc(u.t)}</b><p>${esc(u.text)}</p></div>`).join('')}</div>`
      : `<div class="n-sec-h">Главное</div><ul class="n-main">${x.main.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
         <div class="n-sec-h">${x.live ? '<span class="n-dot"></span>Хронология · обновляется' : 'Хронология'}</div>${newBtn}<ul class="n-tl">${x.ups.map(up).join('')}</ul>`;
    return `<div class="n-cols"><main><button class="n-back" data-back>‹ Новости</button>${meta(x)}<h1 class="n-title">${esc(x.title)}</h1><p class="n-lede">${esc(x.lede)}</p>
      ${CFG.view === 'phone' && x.match != null ? match(x.match) : ''}${body}
      <div class="n-sec-h">Источники · ${x.src.length}</div><div class="n-card n-src">${x.src.map(([s, t, a]) => `<a href="#"><b>${esc(s)}</b><span>${esc(t)}</span><small>${esc(a)}</small></a>`).join('')}</div></main>
      <aside>${side}</aside></div>`;
  }

  // ── Страница: шапка как на странице матча, путь, на телефоне нижний бар ────
  function run() {
    const scr = CFG.screen === 'topic' ? topic() : V === 'swipe' ? feedSwipe() : V === 'dense' ? feedDense() : feedTopics();
    const x = N.find(t => t.id === CFG.id);
    document.body.innerHTML = `<div class="stage is-${CFG.view} v-${V} s-${CFG.screen}"><header class="pt"><div class="pt-brand"><span class="pt-logo">◆</span>GoatScout</div><button class="pt-in">Войти</button></header>
      <nav class="n-crumbs"><span>‹</span><a href="#" data-back>Новости</a>${CFG.screen === 'topic' ? `<span>›</span><b>${esc(x.title)}</b>` : ''}</nav>
      <div class="n-page">${scr}</div>${CFG.view === 'phone' ? '<nav class="n-tabbar"><span>Матчи</span><span>Поиск</span><span>Фэнтези</span><span>Войти</span></nav>' : ''}</div>`;
    document.querySelectorAll('[data-id]').forEach(a => a.onclick = e => { e.preventDefault(); CFG.screen = 'topic'; CFG.id = a.dataset.id; go(); });
    document.querySelectorAll('[data-back]').forEach(a => a.onclick = e => { e.preventDefault(); CFG.screen = 'feed'; go(); });
    document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { CFG.f = b.dataset.f; run(); });
    const nb = document.querySelector('[data-new]'); if (nb) nb.onclick = () => { const t = N.find(o => o.id === CFG.id); t.ups.forEach(u => delete u.fresh); t.ups.unshift(...pending[t.id].map(u => ({ ...u, fresh: true }))); delete pending[t.id]; run(); };
  }
  // открыл live-тему — через 6 с приходит новое обновление
  function go() {
    clearTimeout(timer); run(); window.scrollTo(0, 0);
    const x = N.find(t => t.id === CFG.id);
    if (CFG.screen === 'topic' && x.live && x.next && x.next.length) timer = setTimeout(() => { pending[x.id] = x.next.splice(0); run(); }, 6000);
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'screen', name: 'Экран', value: CFG.screen, options: [{ v: 'feed', label: 'Лента' }, { v: 'topic', label: 'Тема: Vision — Spirit (live)' }, { v: 'og', label: 'Тема: OG — GamerLegion' }] },
    ],
    set(key, v) { if (key === 'screen') { CFG.screen = v === 'feed' ? 'feed' : 'topic'; CFG.id = v === 'og' ? 'og-gl' : 'vis-spi'; } else CFG[key] = v; go(); },
    caption: () => 'Пример данных. Нажми тему — откроется; в live-теме через 6 с придёт новое обновление',
  };
  go();
})();
