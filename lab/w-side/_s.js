// w-side — правая колонка страницы матча (задачи-по-виджетам.md §6, созвон 26.10): только про этот матч, компактно; трансферов нет, MVP — только после матча.
// Матч — TI 2026, Spirit — Vision (как в gs-match). Турнир и MVP — реальные данные (gs-match/data), прогноз и новости — пример (помечено).
(() => {
  const D = window.GS_DATA, T = window.GS_TOURNAMENT, S = D.series[2], IMG = '../gs-match/';
  const A = S.maps[0].radiant_team_id, B = S.maps[0].dire_team_id, START = S.maps[0].start_time;
  const CFG = { view: 'desk', state: 'live', w: 'all', pick: null };
  const $ = s => document.querySelector(s);
  const team = id => D.teams[id] || { name: T.names[id] || '—', tag: T.names[id] || '—', logo: '' };
  const logo = id => team(id).logo ? `<img class="lg" src="${IMG + team(id).logo}" alt="">` : '<span class="lg"></span>';

  // таблица турнира на момент состояния: до матча — без этой серии, после — с ней
  function table() {
    const done = T.series.filter(s => s.series_id === S.series_id ? CFG.state === 'post' : s.start < START);
    const r = {}; for (const id of Object.keys(T.names)) r[id] = { id, w: 0, l: 0, mw: 0, ml: 0 };
    for (const s of done) { const wa = s.maps.filter(m => m.win === s.a).length, wb = s.maps.length - wa; if (!r[s.a] || !r[s.b]) continue;
      r[s.a].mw += wa; r[s.a].ml += wb; r[s.b].mw += wb; r[s.b].ml += wa;
      if (wa > wb) { r[s.a].w++; r[s.b].l++; } else { r[s.b].w++; r[s.a].l++; } }
    return Object.values(r).sort((x, y) => y.w - x.w || x.l - y.l || (y.mw - y.ml) - (x.mw - x.ml));
  }
  function tournament() {
    const t = table(), rows = [A, B].map(id => ({ ...t.find(x => x.id == id), pl: t.findIndex(x => x.id == id) + 1 })).sort((x, y) => x.pl - y.pl);
    return `<section class="cd"><div class="cd-hd"><b>${T.league}</b><small>из ${t.length}</small></div>
      ${rows.map(q => `<div class="tr num"><span class="pl">${q.pl}</span>${logo(q.id)}<span>${team(q.id).name}</span><span class="wl">${q.w}–${q.l}</span><span class="mp">${q.mw}:${q.ml}</span></div>`).join('')}</section>`;
  }

  // прогноз (пример): до и во время — голосовать, после — сбылось ли
  function predict() {
    const pa = 57, a = team(A), b = team(B), post = CFG.state === 'post';
    const win = S.maps.filter(m => (m.radiant_win ? m.radiant_team_id : m.dire_team_id) === A).length >= 2 ? A : B;
    return `<section class="cd"><div class="cd-hd"><b>Кто выиграет серию</b><span class="ex">пример</span></div><div class="pr">
      <div class="pr-t num"><span>${logo(A)}${a.tag} ${pa}%</span><span>${100 - pa}% ${b.tag}${logo(B)}</span></div>
      <div class="bar"><i style="width:${pa}%"></i><i style="width:${100 - pa}%"></i></div>
      ${post ? `<div class="pr-res">Выиграла ${team(win).tag} — угадали ${win === A ? pa : 100 - pa}%${CFG.pick ? ` · твой прогноз ${CFG.pick == win ? 'сбылся' : 'не сбылся'}` : ''}</div>`
        : `<div class="pr-btn">${[A, B].map(id => `<button data-p="${id}" class="${CFG.pick == id ? 'on' : ''}">${team(id).tag}</button>`).join('')}</div>`}</div></section>`;
  }

  // новости вокруг матча (пример) — 3 строки
  function news() {
    const N = [['Spirit на пути к третьему титулу: что изменилось в составе', '2 ч назад'], ['Vision без замен: тот же состав, что выиграл группу', '5 ч назад'], ['Победитель серии выходит в верхнюю сетку плей-офф', 'вчера']];
    return `<section class="cd"><div class="cd-hd"><b>Новости матча</b><span class="ex">пример</span></div>${N.map(([t, s]) => `<a class="nw" href="#">${t}<small>${s}</small></a>`).join('')}</section>`;
  }

  // MVP серии — по итогу всех карт: (убийства + помощь) / смерти, тройка лучших
  function mvp() {
    const acc = {};
    for (const m of S.maps) for (const p of m.players) { const r = acc[p.account_id] ||= { p, k: 0, d: 0, a: 0, hero: p.hero_id }; r.k += p.kills; r.d += p.deaths; r.a += p.assists; r.hero = p.hero_id; }
    const top = Object.values(acc).sort((x, y) => (y.k + y.a) / Math.max(1, y.d) - (x.k + x.a) / Math.max(1, x.d)).slice(0, 3);
    return `<section class="cd"><div class="cd-hd"><b>MVP серии</b><small>по K+A / D</small></div>${top.map((r, i) => { const pl = D.players[r.p.account_id] || {}, h = D.heroes[r.hero] || {};
      return `<div class="mv${i ? '' : ' top'}"><img src="${IMG + (h.img || '')}" alt=""><span>${pl.name || '—'}<small>${team(pl.team_id)?.tag || ''} · ${h.name || ''}</small></span>
        <span class="kda num"><span class="k">${r.k}</span>/<span class="d">${r.d}</span>/<span class="a">${r.a}</span></span></div>`; }).join('')}</section>`;
  }

  function render() {
    const W = { tournament, predict, news, mvp }, post = CFG.state === 'post';
    const list = CFG.w === 'all' ? ['predict', 'tournament', 'news', ...(post ? ['mvp'] : [])] : [CFG.w];
    document.body.innerHTML = `<div class="col is-${CFG.view}">${list.map(k => (k === 'mvp' && !post ? '<p style="color:var(--w-muted-fg)">MVP — только после матча. Переключи «Состояние» на «После».</p>' : W[k]())).join('')}</div>`;
    document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { CFG.pick = b.dataset.p; render(); });
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      // только десктоп (дирижёр 26.10: «вопросы решаем только на десктопе, мобилки решены»)
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'pre', label: 'До матча' }, { v: 'live', label: 'Идёт' }, { v: 'post', label: 'После' }] },
      { key: 'w', name: 'Виджет', value: CFG.w, options: [{ v: 'all', label: 'Все вместе' }, { v: 'tournament', label: 'Турнир' }, { v: 'predict', label: 'Прогноз' }, { v: 'news', label: 'Новости' }, { v: 'mvp', label: 'MVP' }] },
    ],
    set(key, v) { CFG[key] = v; render(); },
    caption: () => 'Spirit — Vision, TI 2026. Турнир и MVP — реальные данные; прогноз и новости — пример',
  };
  render();
})();
