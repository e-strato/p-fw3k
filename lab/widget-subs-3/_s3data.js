// Пример к созвону 23.10, п. 2.3: у одной команды бывает 2 состава — Dota 2 и CS2; две замены = две строки (разные игры и матчи).
// ‼️ ВЫДУМАНО (пример): CS2-состав Nemiga Gaming, матч Nemiga Gaming — 3DMAX (CS2), состав 3DMAX, Steam ID, замены zweih → Jyo и Melon → Moon.
// Подключать после widget-subs-2/_data.js и _games.js. Страница с <base href="../widget-tournament-4/"> — пути от той папки.
// Состав второй игры — отдельным ключом «Команда#cs2» (имя команды то же, у замены — поле rk).
(() => { const D = window.SUBS2, T = window.T4_DATA
  T.teams['3DMAX'] = { logo: '../widget-transfers/logos/3dmax.svg' }
  D.games.dota2.icon = D.games.dota2.logo
  D.games.cs2.icon = '../widget-transfers/logos/cs2.png' // значок CS2 — квадратный, синий / оранжевый (дирижёр 23.10)
  D.rosters['Nemiga Gaming#cs2'] = [['Xant3r', '76561198143204477'], ['khaN', '76561198212610315'], ['riskyb0b', '76561198066693739'], ['zweih', '76561198871303231'], ['1eeR', '76561199004613281']]
  D.rosters['3DMAX'] = [['Maka', '76561198123117826'], ['Lucky', '76561198093180236'], ['Ex3rcice', '76561198146213001'], ['Graviti', '76561198290512219'], ['bodyy', '76561198031650151']]
  D.base.push(['Jyo', '', 4, '76561198402155630'])
  D.matches.push({ id: 'n2', game: 'cs2', a: 'Nemiga Gaming', b: '3DMAX', tour: 'CCT Season 3', when: '16:30', bo: 3 })
  D.subs.push({ id: 'n0a', m: 'm0', team: 'Nemiga Gaming', pos: 4, out: 'Melon', kind: 'ids', seen: '112309811', in: 'Moon', map: 2, term: 'map' },
    { id: 'n2a', m: 'n2', team: 'Nemiga Gaming', rk: 'Nemiga Gaming#cs2', pos: 4, out: 'zweih', kind: 'news', in: 'Jyo', date: '22.10', note: 'zweih болеет', term: 'match' })
})()
