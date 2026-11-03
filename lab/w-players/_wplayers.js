// w-players — виджет «Игроки» (задачи созвона 26.10 §3, образец из Телеграма; дирижёр 26.10: «можно переносить» — страница собирается только из виджетов).
// Один код и для лабы w-players, и для страницы матча (gs-match, data-wd="players"): WPLAYERS.render(el, opts) — рисует в el, под ширину (уже 600 — компактно).
// opts: m — карта (OpenDota), t — секунда (live), state live / post, base — путь к img/ (от страницы).
// ‼️ Пример (в данных этого нет): ранг игрока и % под линией — придуманы, стабильные от account_id. Линия easy/mid/hard — из lane_role (1 лёгкая, 2 мид, 3 сложная).
(() => {
  const D = window.GS_DATA;
  const HERO = Object.fromEntries(Object.entries(D.heroes).map(([id, h]) => [+id, h]));
  const team = id => D.teams[id] || { name: '—', logo: '' };
  const k = v => (v / 1000).toFixed(1) + 'k';
  // статистика на момент t (как snap в gs-match): ассисты — только по итогу карты
  function stat(o, p) {
    const m = o.m, full = o.state === 'post', t = full ? m.duration : o.t, key = 'npc_dota_hero_' + HERO[p.hero_id].short;
    const kills = p.kills_log.filter(l => l.time <= t).length;
    const deaths = full ? p.deaths : m.players.filter(q => q.isRadiant !== p.isRadiant).reduce((n, q) => n + q.kills_log.filter(l => l.time <= t && l.key === key).length, 0);
    const nw = full ? p.net_worth : p.nw_t[Math.min(Math.floor(t / 60), p.nw_t.length - 1)] || 0;
    // предметы: итоговый слот, если куплен к моменту t
    const items = p.items.filter(it => it && D.items[it] && (full || p.purchase_log.some(l => l.key === it && l.time <= t)));
    return { kills, deaths, assists: full ? p.assists : null, nw, items, full, t };
  }
  // ‼️ пример: ранг и % — нет в данных
  const RANKS = ['#12', '#48', '#3', '#97', '#25', '#7', '#61', '#140', '#33', '#19'];
  const rank = p => RANKS[p.account_id % RANKS.length];
  const LANE = { 1: 'easy', 2: 'mid', 3: 'hard' };
  const pct = p => ({ up: p.account_id % 3 !== 0, v: 20 + (p.account_id % 37) });
  const name = p => D.players[p.account_id]?.name || '—';

  function player(S, p, i) {
    const s = stat(S.o, p), h = HERO[p.hero_id], c = pct(p), IMG = S.o.base || '';
    return `<div class="wp-pl${S.open === i ? ' on' : ''}" data-i="${i}">
      <div class="wp-nm"><span class="wp-rk num" title="Ранг (пример)">${rank(p)}</span><span>${name(p)}</span></div>
      <img class="wp-hr" src="${IMG + h.img}" alt="${h.name}">
      <div class="wp-kda num"><span class="k">${s.kills}</span><i>/</i><span class="d">${s.deaths}</span><i>/</i><span class="a">${s.assists ?? '—'}</span></div>
      <div class="wp-its">${s.items.map(it => `<img src="${IMG + D.items[it].img}" alt="" title="${D.items[it].name}">`).join('')}</div>
      <div class="wp-ln num ${c.up ? 'up' : 'dn'}">${LANE[p.lane_role] || '—'} ${c.up ? '▲' : '▼'}${c.v}%</div></div>`;
  }

  function card(el, i) {
    const S = el._wp, m = S.o.m, p = m.players[i], s = stat(S.o, p), h = HERO[p.hero_id], tm = team(p.isRadiant ? m.radiant_team_id : m.dire_team_id), IMG = S.o.base || '';
    const pl = el.querySelector(`.wp-pl[data-i="${i}"]`), box = el.querySelector('.wp'); if (!pl) return '';
    const r = pl.getBoundingClientRect(), b = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(b.width - 240, r.left - b.left + r.width / 2 - 120)), y = r.bottom - b.top + 4;
    return `<div class="wp-card" style="left:${x}px;top:${y}px"><div class="h"><img src="${IMG + h.img}" alt=""><div><b>${name(p)}</b><small>${tm.name} · ${h.name}</small></div></div>
      <dl class="num"><dt>У / С / П</dt><dd>${s.kills} / ${s.deaths} / ${s.assists ?? '—'}</dd>
        <dt>Золото в минуту</dt><dd>${s.full ? p.gold_per_min : Math.round(s.nw / (s.t / 60))}</dd>
        <dt>Опыт в минуту</dt><dd>${s.full ? p.xp_per_min : '—'}</dd>
        <dt>Богатство</dt><dd>${k(s.nw)}</dd>
        <dt>Урон по героям</dt><dd>${s.full ? k(p.hero_damage) : '—'}</dd></dl>
      <div class="wp-its">${s.items.map(it => `<img src="${IMG + D.items[it].img}" alt="">`).join('')}</div></div>`;
  }

  function draw(el) {
    const S = el._wp, o = S.o, m = o.m, IMG = o.base || '';
    const side = rad => { const tm = team(rad ? m.radiant_team_id : m.dire_team_id), ps = m.players.map((p, i) => [p, i]).filter(([p]) => p.isRadiant === rad);
      const kills = ps.reduce((n, [p]) => n + stat(o, p).kills, 0);
      return `<div class="wp-tr"><div class="wp-hd"><img src="${IMG + tm.logo}" alt=""><b>${tm.name}</b><span class="k num">${kills} убийств</span></div>
        <div class="wp-grid">${ps.map(([p, i]) => player(S, p, i)).join('')}</div></div>`; };
    el.innerHTML = `<div class="wp${el.clientWidth && el.clientWidth < 600 ? ' is-narrow' : ''}">${side(true)}${side(false)}</div>`;
    if (S.open != null) el.querySelector('.wp').insertAdjacentHTML('beforeend', card(el, S.open));
    el.querySelectorAll('.wp-pl').forEach(pl => { pl.onmouseenter = pl.onclick = () => { if (S.open !== +pl.dataset.i) { S.open = +pl.dataset.i; draw(el); } }; });
    el.querySelector('.wp').onmouseleave = () => { if (S.open != null) { S.open = null; draw(el); } };
  }

  window.WPLAYERS = {
    render(el, o) {
      const S = el._wp || (el._wp = { open: null }); S.o = o; S.open = null;
      if (!S.ro && window.ResizeObserver) { let w0 = 0; S.ro = new ResizeObserver(() => { const w = el.clientWidth < 600; if (w !== w0) { w0 = w; draw(el); } }); S.ro.observe(el); }
      draw(el);
    },
  };
})();
