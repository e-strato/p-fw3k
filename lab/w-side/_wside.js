// w-side — виджеты правой колонки для страницы матча (лаба w-side v2–v5, дирижёр 27.10: «новые лабы на основе текущего варианта» — страница v30).
// Код карточек — из лабы w-side v1 (_s.js): только про этот матч, компактно; трансферов нет, MVP — только после матча (созвон 26.10, задачи-по-виджетам.md §6).
// WSIDE.render(el, o) — o: w — tournament | predict | news | mvp | one (всё одной карточкой) | tabs (одна карточка с вкладками),
//   list — что и в каком порядке (для one / tabs), M — матч страницы (s, A, B, start, state, sa, sb), base — путь к img/.
// Турнир и MVP — реальные данные (gs-match/data); прогноз и новости — пример (помечено).
(() => {
  const D = window.GS_DATA, T = window.GS_TOURNAMENT;
  const PICK = {}, TAB = {}; // выбор зрителя — по серии
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const team = id => D.teams[id] || { name: T.names[id] || '—', tag: T.names[id] || '—', logo: '' };
  const logo = (id, B) => team(id).logo ? `<img class="wsd-lg" src="${B + team(id).logo}" alt="">` : '<span class="wsd-lg"></span>';
  const NAME = { tournament: 'Турнир', predict: 'Прогноз', news: 'Новости', mvp: 'MVP' };

  // таблица турнира на момент матча: до и во время — без этой серии, после — с ней
  function table(M) {
    const done = T.series.filter(s => s.series_id === M.s.series_id ? M.state === 'post' : s.start < M.start);
    const r = {}; for (const id of Object.keys(T.names)) r[id] = { id, w: 0, l: 0, mw: 0, ml: 0 };
    for (const s of done) { const wa = s.maps.filter(m => m.win === s.a).length, wb = s.maps.length - wa; if (!r[s.a] || !r[s.b]) continue;
      r[s.a].mw += wa; r[s.a].ml += wb; r[s.b].mw += wb; r[s.b].ml += wa;
      if (wa > wb) { r[s.a].w++; r[s.b].l++; } else { r[s.b].w++; r[s.a].l++; } }
    return Object.values(r).sort((x, y) => y.w - x.w || x.l - y.l || (y.mw - y.ml) - (x.mw - x.ml));
  }
  const hd = (t, small) => `<div class="wsd-hd"><b>${t}</b>${small}</div>`;
  const tournament = (M, B, bare) => { const t = table(M), rows = [M.A, M.B].map(id => ({ ...t.find(x => x.id == id), pl: t.findIndex(x => x.id == id) + 1 })).sort((x, y) => x.pl - y.pl);
    return `${bare ? '' : hd(esc(T.league), `<small>из ${t.length}</small>`)}${rows.map(q => `<div class="wsd-tr num"><span class="pl">${q.pl}</span>${logo(q.id, B)}<span>${esc(team(q.id).name)}</span><span class="wl">${q.w}–${q.l}</span><span class="mp">${q.mw}:${q.ml}</span></div>`).join('')}`; };

  // прогноз (пример): до и во время — голосовать, после — сбылось ли
  const predict = (M, B, bare) => { const pa = 57, post = M.state === 'post', pick = PICK[M.s.series_id], win = M.sa > M.sb ? M.A : M.B;
    return `${bare ? '' : hd('Кто выиграет серию', '<span class="wsd-ex">пример</span>')}<div class="wsd-pr">
      <div class="wsd-pr-t num"><span>${logo(M.A, B)}${esc(team(M.A).tag)} ${pa}%</span><span>${100 - pa}% ${esc(team(M.B).tag)}${logo(M.B, B)}</span></div>
      <div class="wsd-bar"><i style="width:${pa}%"></i><i style="width:${100 - pa}%"></i></div>
      ${post ? `<div class="wsd-res">Выиграла ${esc(team(win).tag)} — угадали ${win === M.A ? pa : 100 - pa}%${pick ? ` · твой прогноз ${pick == win ? 'сбылся' : 'не сбылся'}` : ''}</div>`
        : `<div class="wsd-btn">${[M.A, M.B].map(id => `<button data-wsd-p="${id}" class="${pick == id ? 'on' : ''}">${esc(team(id).tag)}</button>`).join('')}</div>`}</div>`; };

  // новости вокруг матча (пример) — 3 строки
  const news = (M, B, bare) => { const a = team(M.A).tag, b = team(M.B).tag;
    const N = [[`${a}: что изменилось в составе перед плей-офф`, '2 ч назад'], [`${b} без замен — тот же состав, что выиграл группу`, '5 ч назад'], ['Победитель серии выходит в верхнюю сетку плей-офф', 'вчера']];
    return `${bare ? '' : hd('Новости матча', '<span class="wsd-ex">пример</span>')}${N.map(([t, s]) => `<a class="wsd-nw" href="#">${esc(t)}<small>${s}</small></a>`).join('')}`; };

  // MVP серии — по итогу всех карт: (убийства + помощь) / смерти, тройка лучших; до конца матча — нет
  const mvp = (M, B, bare) => { const acc = {};
    for (const m of M.s.maps) for (const p of m.players) { const r = acc[p.account_id] ||= { p, k: 0, d: 0, a: 0, hero: p.hero_id }; r.k += p.kills; r.d += p.deaths; r.a += p.assists; r.hero = p.hero_id; }
    const top = Object.values(acc).sort((x, y) => (y.k + y.a) / Math.max(1, y.d) - (x.k + x.a) / Math.max(1, x.d)).slice(0, 3);
    return `${bare ? '' : hd('MVP серии', '<small>по K+A / D</small>')}${top.map((r, i) => { const pl = D.players[r.p.account_id] || {}, h = D.heroes[r.hero] || {};
      return `<div class="wsd-mv${i ? '' : ' top'}"><img src="${B + (h.img || '')}" alt=""><span>${esc(pl.name || '—')}<small>${esc(team(pl.team_id)?.tag || '')} · ${esc(h.name || '')}</small></span>
        <span class="wsd-kda num"><span class="k">${r.k}</span>/<span class="d">${r.d}</span>/<span class="a">${r.a}</span></span></div>`; }).join('')}`; };

  const W = { tournament, predict, news, mvp };
  const html = o => { const M = o.M, B = o.base || '', list = (o.list || []).filter(k => k !== 'mvp' || M.state === 'post');
    if (o.w === 'one') return `<section class="wsd wsd--one">${list.map(k => `<div class="wsd-part">${k === 'tournament' ? tournament(M, B) : W[k](M, B)}</div>`).join('')}</section>`;
    if (o.w === 'tabs') { const cur = list.includes(TAB[M.s.series_id]) ? TAB[M.s.series_id] : list[0];
      return `<section class="wsd wsd--tabs"><nav class="wsd-tabs">${list.map(k => `<button data-wsd-t="${k}" class="${k === cur ? 'on' : ''}">${NAME[k]}</button>`).join('')}</nav>
        ${cur === 'tournament' ? hd(esc(T.league), '') : cur === 'predict' ? hd('Кто выиграет серию', '<span class="wsd-ex">пример</span>') : cur === 'news' ? '<div class="wsd-gap"></div>' : ''}${W[cur](M, B, true)}</section>`; }
    if (o.w === 'mvp' && M.state !== 'post') return '';
    return `<section class="wsd">${W[o.w](M, B)}</section>`; };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-wsd-p], [data-wsd-t]'), el = b && b.closest('[data-wsd]'); if (!el) return; e.preventDefault();
    const id = el._wsd.M.s.series_id;
    if (b.dataset.wsdP) PICK[id] = b.dataset.wsdP; else TAB[id] = b.dataset.wsdT;
    document.querySelectorAll('[data-wsd]').forEach(x => x._wsd.M.s.series_id === id && (x.innerHTML = html(x._wsd)));
  });

  window.WSIDE = {
    render(el, o) { el._wsd = o; el.setAttribute('data-wsd', ''); el.innerHTML = html(o); },
    // что ставить в правую колонку и в каком порядке — по варианту (лаба w-side): plain — как в лабе v1; state — по состоянию матча
    order(M, how) {
      if (how === 'state') return M.state === 'pre' ? ['predict', 'tournament', 'news'] : M.state === 'live' ? ['predict', 'news', 'tournament'] : ['mvp', 'tournament', 'news'];
      return ['predict', 'tournament', 'news', 'mvp'];
    },
  };
})();
