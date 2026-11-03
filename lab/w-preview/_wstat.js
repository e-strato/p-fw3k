// w-preview → страница матча: «Статистика к матчу» — выбор v21 (дирижёр 26.10: «пока перенесём таймлайн 21, а потом будем думать»).
// Досье двух команд зеркально (4 цифры, инсайты ✓/✗, последние 5 серий) без очных, по центру — новости таймлайном.
// Узко (контейнер < 600) — одно досье, сверху переключалка команд; новости — под досье. Цифры — из GS_TOURNAMENT до этой серии; ‼️ новости — пример.
// WSTAT.render(el, { A, B, start, names: { [id]: 'Spirit' } })
(() => {
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const day = s => new Date(s * 1000).toLocaleDateString('ru', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'short' }).replace('.', '');
  const has = (s, id) => s.a === id || s.b === id;

  // форма на турнире до серии: серии, % карт, средняя победа, серия побед, последние 5 серий
  function form(before, id) {
    const ss = before.filter(s => has(s, id)).sort((x, y) => x.start - y.start);
    const won = s => s.maps.filter(m => m.win === id).length > s.maps.length / 2;
    const maps = ss.flatMap(s => s.maps), mw = maps.filter(m => m.win === id);
    const res = ss.map(s => (won(s) ? 'W' : 'L')).join('');
    return { sw: ss.filter(won).length, sl: ss.filter(s => !won(s)).length, mw: mw.length, ml: maps.length - mw.length,
      pct: maps.length ? Math.round(mw.length / maps.length * 100) : 0, avgW: mw.length ? Math.round(mw.reduce((n, m) => n + m.dur, 0) / mw.length) : 0,
      streak: res.length - res.lastIndexOf('L') - 1,
      last5: ss.slice(-5).reverse().map(s => { const w = s.maps.filter(m => m.win === id).length; return { opp: s.a === id ? s.b : s.a, w, l: s.maps.length - w, win: won(s), start: s.start }; }) };
  }
  function insights(f, o) {
    const lw = f.last5.filter(x => x.win).length;
    return [[f.pct >= 60, `${f.pct}% карт выиграно на турнире (${f.mw}–${f.ml})`],
      [f.avgW <= o.avgW, `средняя победа ${mmss(f.avgW)} — ${f.avgW <= o.avgW ? 'быстрее' : 'дольше'}, чем у соперника`],
      [lw >= 3, `${lw} из ${f.last5.length} последних серий выиграно${f.streak > 1 ? `, сейчас ${f.streak} подряд` : ''}`]].sort((x, y) => y[0] - x[0]);
  }

  function render(el, o) {
    const D = window.GS_DATA, T = window.GS_TOURNAMENT, { A, B } = o;
    const before = T.series.filter(s => s.start < o.start);
    const nm = id => o.names[id] || (T.names[id] || '—').trim();
    const opp = id => { const n = (T.names[id] || '—').trim().replace(/^Team /i, '').replace(/ Team$/i, ''); return o.names[id] || (n === n.toUpperCase() ? n.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()) : n); };
    const lg = id => (D.teams[id] ? `<img class="ws-lg" src="${D.teams[id].logo}" alt="">` : '');
    const fA = form(before, A), fB = form(before, B);
    // ‼️ пример: новости матча (картинки и тексты — не из данных)
    const NEWS = [[B, `${nm(B)} меняют пятую позицию перед плей-офф`, 'Cyberscore', '2 ч'], [A, `${nm(A)}: «Мы знаем, как играть против ${nm(B)}»`, 'Sports.ru', 'вчера'],
      [B, `Капитан ${nm(B)}: «Это главный матч сезона»`, 'Cybersport.ru', 'вчера'], [A, `${nm(A)} без замен: тот же состав, что прошёл группу`, 'Liquipedia', '2 дня']];
    const dos = (id, f, x) => `<div class="ws-ds" data-t="${id}"><div class="ws-t">${lg(id)}<b>${nm(id)}</b></div>
      <div class="ws-k"><span><small>серии</small>${f.sw}–${f.sl}</span><span><small>карты</small>${f.pct}%</span><span><small>ср. победа</small>${f.avgW ? mmss(f.avgW) : '—'}</span><span><small>подряд</small>${f.streak}</span></div>
      ${insights(f, x).map(([ok, t]) => `<div class="ws-i ${ok ? 'ok' : 'no'}"><i>${ok ? '✓' : '✕'}</i><span>${t}</span></div>`).join('')}
      <div class="ws-h">Последние 5</div>${f.last5.map(r => `<div class="ws-f"><i class="${r.win ? 'W' : 'L'}">${r.win ? 'В' : 'П'}</i><span>${opp(r.opp)}</span><b>${r.w}:${r.l}</b><small>${day(r.start)}</small></div>`).join('') || '<div class="ws-f"><small>на турнире ещё не играли</small></div>'}</div>`;
    const news = `<div class="ws-n"><div class="ws-h">Новости <small>пример</small></div><div class="ws-tl">${NEWS.map(n => `<a class="ws-tr" href="#"><i></i><small>${n[3]}</small><span>${n[1]}</span><small>${n[2]}</small></a>`).join('')}</div></div>`;
    const cur = el._team === B ? B : A;
    el.innerHTML = `<div class="ws"><div class="ws-hd"><b>Статистика к матчу</b><small>${T.league} · до серии</small></div>
      <div class="ws-sw">${[A, B].map(id => `<button type="button" data-team="${id}" class="${cur === id ? 'is-on' : ''}">${lg(id)}${nm(id)}</button>`).join('')}</div>
      <div class="ws-w" data-cur="${cur === A ? 'a' : 'b'}">${dos(A, fA, fB)}${news}${dos(B, fB, fA)}</div></div>`;
    el.querySelectorAll('[data-team]').forEach(b => b.onclick = () => { el._team = +b.dataset.team; render(el, o); });
    el.querySelectorAll('.ws-tr').forEach(a => a.onclick = e => e.preventDefault());
  }
  window.WSTAT = { render };
})();
