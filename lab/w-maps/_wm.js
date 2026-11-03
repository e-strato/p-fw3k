// w-maps — «Карты матча»: блок под шапкой матча (дирижёр 26.10: вкладки из шапки убираем; здесь — превью «Карта 1, Карта 2…», до 5 карт,
// показываем только начатые и сыгранные, во всю ширину). Варианты — window.WM_V: v1 плитки, v2 полоса по длительности, v3 герои.
// Данные — реальные (gs-match/data, OpenDota): серия Vision — Spirit, TI 2026. Bo5: карты 4–5 — пример (взяты из других серий дня).
(() => {
  const D = window.GS_DATA, V = window.WM_V, B = window.WM_B || '../gs-match/'; // WM_B — из _old
  const S = D.series[2], A = S.maps[0].radiant_team_id, Bt = S.maps[0].dire_team_id; // A — Vision, B — Spirit
  const EXTRA = [D.series[0].maps[0], D.series[1].maps[1]]; // ‼️ пример для Bo5
  const CFG = { view: 'desk', bo: 'bo3', state: 'live3', sel: null };
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const k = n => (Math.abs(n) >= 1000 ? (Math.abs(n) / 1000).toFixed(1).replace('.0', '').replace('.', ',') + 'k' : String(Math.abs(n)));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const logo = id => `<img class="wm-lg" src="${B + D.teams[id].logo}" alt="">`;
  const SH = id => D.teams[id].tag || D.teams[id].name;

  // карты на момент состояния: сыгранные + идущая; не начатые — не показываем
  function maps() {
    const all = [...S.maps, ...(CFG.bo === 'bo5' ? EXTRA : [])], live = CFG.state === 'post' ? -1 : +CFG.state.slice(4) - 1;
    const n = CFG.state === 'post' ? all.length : live + 1;
    return all.slice(0, n).map((m, i) => {
      const st = i === live ? 'live' : 'done', t = st === 'live' ? Math.min(2010, Math.round(m.duration * 0.7)) : m.duration;
      const aRad = i < 3 ? m.radiant_team_id === A : i % 2 === 0; // карты-примеры: стороны чередуем
      const kills = rad => m.players.filter(p => p.isRadiant === rad).reduce((s, p) => s + p.kills_log.filter(l => l.time <= t).length, 0);
      const ka = st === 'done' ? (aRad ? m.radiant_score : m.dire_score) : kills(aRad), kb = st === 'done' ? (aRad ? m.dire_score : m.radiant_score) : kills(!aRad);
      const g = (m.radiant_gold_adv || []).slice(0, Math.floor(t / 60) + 1).map(v => (aRad ? v : -v));
      const win = st === 'done' ? (m.radiant_win === aRad ? A : Bt) : null;
      const picks = side => m.picks_bans.filter(x => x.is_pick && x.team === ((side === 'a') === aRad ? 0 : 1)).map(x => D.heroes[x.hero_id]);
      return { i, st, t, dur: m.duration, ka, kb, g, win, pa: picks('a'), pb: picks('b') };
    });
  }
  const spark = (g, w = 100, h = 28) => { const mx = Math.max(1, ...g.map(Math.abs)), x = i => (i / Math.max(1, g.length - 1)) * w, y = v => h / 2 - (v / mx) * (h / 2 - 2);
    return `<svg class="wm-sp" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="0" x2="${w}" y1="${h / 2}" y2="${h / 2}"/><path d="${g.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}"/></svg>`; };
  const when = x => (x.st === 'live' ? `<span class="wm-live num">${mmss(x.t)}</span>` : `<span class="num">${mmss(x.dur)}</span>`);
  const lead = x => { const v = x.g[x.g.length - 1] || 0; return v ? `${SH(v > 0 ? A : Bt)} +${k(v)}` : 'поровну'; };
  const sc = x => `<span class="wm-sc num"><b class="${x.win === A ? 'w' : ''}">${x.ka}</b><i>:</i><b class="${x.win === Bt ? 'w' : ''}">${x.kb}</b></span>`;
  const on = x => (CFG.sel ?? ms.length - 1) === x.i;
  let ms = [];

  // v1 — плитки поровну: карта · время, логотипы и килы, мини-график перевеса
  const v1 = () => `<div class="wm wm1" style="--n:${ms.length}">${ms.map(x => `<button class="wm-c${on(x) ? ' on' : ''}${x.st === 'live' ? ' is-live' : ''}" data-i="${x.i}">
    <span class="wm-hd"><b>Карта ${x.i + 1}</b>${when(x)}</span>
    <span class="wm-row">${logo(A)}${sc(x)}${logo(Bt)}</span>
    <span class="wm-ft">${spark(x.g)}<small>${x.st === 'live' ? lead(x) : `Победа ${esc(SH(x.win))}`}</small></span></button>`).join('')}</div>`;

  // v2 — одна полоса: ширина карты — её длительность (идущая — сколько уже идёт), победитель — логотипом
  const v2 = () => `<div class="wm wm2">${ms.map(x => `<button class="wm-s${on(x) ? ' on' : ''}${x.st === 'live' ? ' is-live' : ''}" data-i="${x.i}" style="flex-grow:${x.st === 'live' ? x.t : x.dur}">
    <span class="wm-n">Карта ${x.i + 1}</span>${x.win ? logo(x.win) : '<span class="wm-dot"></span>'}${sc(x)}${when(x)}</button>`).join('')}</div>`;

  // v3 — герои: у каждой команды пятёрка, килы справа, победитель — галочкой
  const heroes = (hs, win) => `<span class="wm-h">${hs.map(h => `<img src="${B + h.icon}" alt="${esc(h.name)}" title="${esc(h.name)}">`).join('')}${win ? '<em>✓</em>' : ''}</span>`;
  const v3 = () => `<div class="wm wm3" style="--n:${ms.length}">${ms.map(x => `<button class="wm-c${on(x) ? ' on' : ''}${x.st === 'live' ? ' is-live' : ''}" data-i="${x.i}">
    <span class="wm-hd"><b>Карта ${x.i + 1}</b>${when(x)}</span>
    <span class="wm-tr">${logo(A)}${heroes(x.pa, x.win === A)}<b class="num${x.win === A ? ' w' : ''}">${x.ka}</b></span>
    <span class="wm-tr">${logo(Bt)}${heroes(x.pb, x.win === Bt)}<b class="num${x.win === Bt ? ' w' : ''}">${x.kb}</b></span></button>`).join('')}</div>`;

  function run() {
    ms = maps();
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><div class="hdph">Шапка матча · ${esc(D.teams[A].name)} — ${esc(D.teams[Bt].name)} (вкладок нет)</div>${{ v1, v2, v3 }[V]()}<div class="below">Ниже — перевес по золоту и игроки выбранной карты</div></div>`;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) { CFG.sel = +b.dataset.i; run(); } });

  const ST = [['live1', 'Идёт карта 1'], ['live2', 'Идёт карта 2'], ['live3', 'Идёт карта 3'], ['post', 'После']];
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'bo', name: 'Серия', value: CFG.bo, options: [{ v: 'bo3', label: 'Bo3' }, { v: 'bo5', label: 'Bo5 (пример)' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [...ST, ...(CFG.bo === 'bo5' ? [['live4', 'Идёт карта 4'], ['live5', 'Идёт карта 5']] : [])].map(([v, label]) => ({ v, label })) },
    ],
    set(key, v) { CFG[key] = v; CFG.sel = null; if (key === 'bo' && v === 'bo3' && /live[45]/.test(CFG.state)) CFG.state = 'live3'; run(); },
    caption: () => 'До матча блока нет. Показаны только начатые и сыгранные карты; нажал на карту — ниже её график и игроки. Карты 1–3 — реальные, 4–5 — пример',
  };
  run();
})();
