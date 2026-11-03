// Пример (дирижёр 22.10: «показать вариант с другими играми — Counter-Strike и т. д., маленький логотип игры на главной»).
// ‼️ ВЫДУМАНО: два матча CS2 с заменами, составы и Steam ID. Логотипы команд — из widget-transfers. Роли CS2 — свои (у Доты позиции 1–5).
// Страница с <base href="../widget-tournament-4/"> — пути от той папки.
(() => { const D = window.SUBS2, T = window.T4_DATA, L = n => '../widget-transfers/logos/' + n
  Object.assign(T.teams, { 'FaZe Clan': { logo: L('faze-clan.png') }, 'BC.Game': { logo: L('bc-game.svg') }, 'The MongolZ': { logo: L('the-mongolz.svg') }, 'G2 Esports': { logo: L('g2-esports.png') } })
  D.games = { dota2: { name: 'Dota 2', logo: '../widget-transfers/logos/dota2.png', roles: ['Carry', 'Mid', 'Offlane', 'Support', 'Hard Sup'] },
    cs2: { name: 'CS2', logo: '../widget-transfers/logos/cs2.png', roles: ['IGL', 'AWP', 'Entry', 'Lurk', 'Support'], posRu: ['Капитан', 'Снайпер', 'Энтри', 'Люркер', 'Поддержка'] } }
  Object.assign(D.rosters, {
    'FaZe Clan': [['karrigan', '76561197989430253'], ['broky', '76561198068422762'], ['frozen', '76561198039986599'], ['rain', '76561197997351207'], ['ropz', '76561197991272318']],
    'The MongolZ': [['bLitz', '76561198241236312'], ['910', '76561198315208742'], ['Techno', '76561198342348116'], ['mzinho', '76561198996374617'], ['Senzu', '76561199052402183']],
    'BC.Game': [['s1n', '76561198024837214'], ['nexa', '76561198087215543'], ['aragornN', '76561198139020421'], ['Snax', '76561197988627193'], ['kRaSnaL', '76561198061020498']],
    'G2 Esports': [['Snax', '76561197988627193'], ['m0NESY', '76561198074762801'], ['huNter-', '76561198031908632'], ['malbsMd', '76561198178427433'], ['HeavyGod', '76561198853312101']] })
  D.base.push(['JBOEN', '', 3, '76561198104311210'], ['Brollan', '', 3, '76561198043926416'], ['Kyxsan', '', 1, '76561198052436728'])
  D.matches.splice(2, 0, { id: 'c1', game: 'cs2', a: 'FaZe Clan', b: 'The MongolZ', tour: 'BLAST Premier: Fall Final', when: 'live', bo: 3, map: 2 })
  D.matches.push({ id: 'c2', game: 'cs2', a: 'BC.Game', b: 'G2 Esports', tour: 'ESL Pro League S22', when: '19:30', bo: 3 })
  D.subs.push({ id: 'c1a', m: 'c1', team: 'FaZe Clan', pos: 3, out: 'frozen', kind: 'ids', seen: '76561198104311210', in: 'JBOEN', map: 2, term: 'map' },
    { id: 'c2a', m: 'c2', team: 'BC.Game', pos: 1, out: 's1n', kind: 'news', in: 'Kyxsan', date: '22.10', note: '', term: 'event' },
    { id: 'c2b', m: 'c2', team: 'G2 Esports', pos: 4, out: 'malbsMd', kind: 'ids', seen: '76561198043926416', in: 'Brollan', map: 1, term: 'match' })
})()
