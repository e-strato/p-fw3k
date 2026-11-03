// Наши виджеты под матчи ленты (дирижёр 26.10: «подгони данные виджетов под наш матч»). Грузится после данных виджетов и до их кода.
// Турнир — The International 2026: таблица по сериям OpenDota на 21.08 16:08 (как «сейчас» в ленте), live и следующий матч.
// MVP — игроки наших 4 серий: очки — наша формула из статистики (как в составах), фото — аватары Steam; примерные игроки этих команд убраны.
// Трансферы — данные виджета (Liquipedia) как есть, по командам матча. Замены — в наших сериях их нет: пустое состояние.
(() => {
  const D = window.GS_DATA, T = window.GS_TOURNAMENT;
  // «Сейчас» — 21.08.2026 16:08 МСК: Vision — Spirit, карта 3, 33:30 (настоящая пауза). Общее для страницы (_gs.js) и виджетов
  const NOW = window.GS_NOW = D.series[2].maps[2].start_time + 2010;
  const FIX = { 8255888: 'BetBoom Team', 9572001: 'Team Vision' }, SH = { 2163: 'Liquid', 7119388: 'Spirit', 8255888: 'BetBoom', 9247354: 'Falcons',
    9572001: 'Vision', 9823272: 'Yandex', 10136357: 'Nigma', 10150413: 'Iron Wing' };
  const NAME = {}, SHORT = {};
  for (const [id, n] of Object.entries(T.names)) { NAME[id] = FIX[id] || String(n || '—').trim(); SHORT[id] = SH[id] || NAME[id]; }
  window.GS_NAMES = { NAME, SHORT };
  const logo = id => (D.teams[id] && D.teams[id].logo) || null;

  // ——— Турнир ———
  const T4 = window.T4_DATA;
  if (T4) {
    // Конец серии: у наших 4 серий — точное время карт из OpenDota, у остальных — старт + длительности
    const ends = {}; D.series.forEach(x => { ends[x.series_id] = Math.max(...x.maps.map(m => m.start_time + m.duration)); });
    const done = s => (ends[s.series_id] ?? s.start + s.maps.reduce((n, m) => n + m.dur, 0)) < NOW;
    const rows = {};
    Object.keys(T.names).forEach(id => { rows[id] = [NAME[id], 0, 0]; });
    T.series.filter(done).forEach(s => {
      const wa = s.maps.filter(m => m.win === s.a).length, wb = s.maps.length - wa;
      rows[wa > wb ? s.a : s.b][1]++; rows[wa > wb ? s.b : s.a][2]++;
    });
    const table = Object.values(rows).sort((a, b) => b[1] - a[1] || a[2] - b[2]);
    for (const [id, n] of Object.entries(NAME)) { const t = T4.teams[n] ||= {}; if (!t.logo && logo(id)) t.logo = logo(id); }
    const hhmm = ts => new Date(ts * 1000).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
    const next = T.series.filter(s => !done(s));
    T4.tours.unshift({
      id: 'ti-2026', name: 'The International 2026', logo: null, st: 'live', tier: 'S',
      dates: '13.08 – 23.08', prize: '—', stage: 'Плей-офф · 21.08', fmt: 'groups',
      rule: 'Победы и поражения по сериям за весь турнир на 21.08, 16:08 (OpenDota)',
      groups: { A: table }, zones: {},
      matches: next.map(s => ({ a: NAME[s.a], b: NAME[s.b], when: s.start <= NOW ? 'live' : 'Сегодня, ' + hhmm(Math.floor(s.start / 300) * 300), stage: 'Bo3' })),
      note: 'Сыграно серий: ' + T.series.filter(done).length + '. Места — по победам, при равенстве — по поражениям.',
    });
  }

  // ——— MVP ———
  const MV = window.MVP_DATA;
  if (MV) {
    const ours = new Set(D.series.flatMap(s => s.maps.flatMap(m => [m.radiant_team_id, m.dire_team_id])).map(id => NAME[id]));
    MV.list = MV.list.filter(p => p.game !== 'dota2' || !ours.has(p.team));
    const acc = {};
    for (const s of D.series) for (const m of s.maps) {
      if (m.start_time + m.duration > NOW) continue; // только сыгранные карты
      for (const p of m.players) {
        const team = NAME[p.isRadiant ? m.radiant_team_id : m.dire_team_id], pl = D.players[p.account_id] || {};
        const q = acc[p.account_id] ||= { game: 'dota2', nick: pl.name || '—', team, role: '', photo: pl.avatar, hq: pl.avatar, hero: D.heroes[p.hero_id] && D.heroes[p.hero_id].img, k: 0, d: 0, a: 0, pts: 0, m: 0 };
        q.k += p.kills; q.d += p.deaths; q.a += p.assists; q.m++;
        q.pts += Math.round(p.kills * 3 - p.deaths + p.assists * 1.5 + p.net_worth / 2000);
      }
    }
    for (const q of Object.values(acc)) {
      const st = { pts: q.pts, prev: 0, m: q.m, kda: Math.round((q.k + q.a) / Math.max(1, q.d) * 10) / 10 };
      MV.list.push({ game: q.game, nick: q.nick, team: q.team, role: q.role, photo: q.photo, hq: q.hq, hero: q.hero, week: st, month: st });
    }
    for (const [id, n] of Object.entries(NAME)) if (logo(id)) MV.teams[n] = logo(id);
  }
})();
