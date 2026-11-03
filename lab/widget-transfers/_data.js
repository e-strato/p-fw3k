// Аватары — игровые, Steam (OpenDota proPlayers, 21.10); у TA2000 и CS2-игроков — аватары других про-игроков (заглушка); лого с .svg — выдуманные щиты-заглушки, остальные — Liquipedia / Wikimedia.
// ‼️ Лабa (дирижёр 21.10: «пофиг на правду»): у Malr1ne «откуда» — PARIVISION (лого Falcons на тёмном не видно), NertZ → Team Spirit (лого G2 чёрное).
// Реальные трансферы Dota 2 на 21.10.2026 — источник Liquipedia (Portal:Transfers + страницы игроков). Собрано 21.10.2026.
// Только переходы между командами тир-1 и тир-2 (Т3.3): внутренние перестановки, тренеры и аналитики не вошли.
// from — прошлая команда игрока (по истории на Liquipedia, даже если между командами он был без клуба).
// Сумма — Liquipedia её не даёт, в Dota 2 переходы почти всегда без раскрытой суммы → fee: null. Призовые — «Approx. Total Winnings».
// path — прошлые команды по истории Liquipedia (до from включительно). price — ‼️ фэнтези-цена ПРИМЕР (не данные): 6 турниров, последняя точка — после перехода.
// pos — позиция по роли на Liquipedia: керри 1, мид 2, оффлейн 3, саппорт 4–5 (номер саппорта не пишут — «саппорт»).
window.TR_DATA = {
  asOf: '21.10.2026',
  game: { name: 'Dota 2', logo: 'logos/dota2.png' },
  // Игры для переключателя; лого CS2 — значок-заглушка (вордмарк с Wikimedia чёрный, на тёмном не виден)
  games: [{ id: 'dota2', name: 'Dota 2', logo: 'logos/dota2.png' }, { id: 'cs2', name: 'CS2', logo: 'logos/cs2.png' }],
  teams: {
    'Team Falcons': { logo: 'logos/team-falcons.png' },
    'Team Liquid': { logo: 'logos/team-liquid.png' },
    'Team Refuser': { logo: 'logos/team-refuser.svg' },
    'Team Tidebound': { logo: 'logos/team-tidebound.png' },
    'PuckChamp': { logo: 'logos/puckchamp.svg' },
    'Inner Circle x Insanity': { logo: 'logos/inner-circle-x-insanity.png' },
    'LGD Gaming': { logo: 'logos/lgd-gaming.png' },
    'GamerLegion': { logo: 'logos/gamerlegion.png' },
    'Nigma Galaxy': { logo: 'logos/nigma-galaxy.png' },
    'PlayTime': { logo: 'logos/playtime.svg' },
    'OG': { logo: 'logos/og.png' },
    'PARIVISION': { logo: 'logos/parivision.png' },
    'Yellow Submarine': { logo: 'logos/yellow-submarine.png' },
    'Team Spirit': { logo: 'logos/team-spirit.png' },
    'Power Rangers': { logo: 'logos/power-rangers.png' },
    'Team Synapse': { logo: 'logos/team-synapse.svg' },
    '3DMAX': { logo: 'logos/3dmax.svg' },
    'G2 Esports': { logo: 'logos/g2-esports.png' },
    'BC.Game': { logo: 'logos/bc-game.svg' },
    'The MongolZ': { logo: 'logos/the-mongolz.svg' },
    'FaZe Clan': { logo: 'logos/faze-clan.png' },
    'BIG Academy': { logo: 'logos/big-academy.svg' },
  },
  // Свежие сверху. kind: 'move' — переход, 'loan' — аренда
  list: [
    // CS2 — по новостям (esports.gg, bo3.gg, pley.gg), Liquipedia/HLTV 21.10 недоступны; фото и лого нет, призовых нет
    { date: '2026-10-15', nick: 'Malr1ne', name: 'Станислав Поторак', pos: 2, country: 'Россия', age: 22, earn: '$1 362 990', photo: 'players/malr1ne.jpg', from: 'PARIVISION', to: 'Team Liquid', kind: 'move', src: 'x.com/teamliquiddota', path: ['Nemiga Gaming 2022–23','Team Falcons 2023–26'], price: [8.6,9.1,9.4,9.2,9.0,10.2] },
    { date: '2026-10-10', nick: 'Yang', name: 'Чжоу Хайян', pos: 3, country: 'Китай', age: 29, earn: '$1 001 878', photo: 'players/yang.jpg', from: 'Team Refuser', to: 'Team Tidebound', kind: 'move', src: 'weibo.com', path: ['Yakult Brothers 2026','Team Refuser 2026'], price: [6.1,6.4,6.2,6.6,6.5,7.2] },
    { date: '2026-10-09', nick: 'Yuragi', name: 'Артём Голубев', pos: 1, country: 'Украина', age: 25, earn: '$490 315', photo: 'players/yuragi.jpg', from: 'PuckChamp', to: 'Inner Circle x Insanity', kind: 'move', src: 't.me/radiactive_baby', path: ['Natus Vincere 2024–25','PuckChamp 2025–26'], price: [7.4,7.0,6.8,7.1,7.3,8.1] },
    { date: '2026-09-29', nick: 'Yuma', name: 'Yuma Langlet', pos: 1, country: 'Никарагуа', age: 25, earn: '$324 546', photo: 'players/yuma.jpg', from: 'LGD Gaming', to: 'GamerLegion', kind: 'move', src: 'x.com/GamerLegion', path: ['HEROIC 2025–26','LGD Gaming 2026'], price: [7.8,8.2,8.0,7.6,7.5,7.9] },
    { date: '2026-09-25', nick: 'SumaiL', name: 'Syed Sumail Hassan', pos: 2, country: 'Пакистан', age: 27, earn: '$4 265 041', photo: 'players/sumail.jpg', from: 'Nigma Galaxy', to: 'LGD Gaming', kind: 'move', src: 'weibo.com', path: ['Nigma Galaxy 2023–26'], price: [9.6,9.2,8.9,9.1,8.8,9.5] },
    { date: '2026-09-25', nick: 'Davai', name: 'Cedric Deckmyn', pos: 3, country: 'Бельгия', age: 26, earn: '$345 064', photo: 'players/davai.jpg', from: 'Nigma Galaxy', to: 'LGD Gaming', kind: 'move', src: 'weibo.com', path: ['HEROIC 2026','Nigma Galaxy 2026'], price: [6.2,6.6,6.4,6.9,6.7,7.0] },
    { date: '2026-09-25', nick: 'Wits', name: 'Máximo Orozco', pos: 1, country: 'Перу', age: 18, earn: '$146 702', photo: 'players/wits.jpg', from: 'PlayTime', to: 'LGD Gaming', kind: 'move', src: 'weibo.com', path: ['paiN Gaming 2026','PlayTime 2026'], price: [5.2,5.8,6.4,6.9,7.1,7.8] },
    { date: '2026-09-23', nick: 'Topson', name: 'Topias Taavitsainen', pos: 2, country: 'Финляндия', age: 28, earn: '$5 919 099', photo: 'players/topson.jpg', from: 'LGD Gaming', to: 'OG', kind: 'move', src: 'x.com/OGesports', path: ['OG 2018–21','LGD Gaming 2026'], price: [9.8,9.4,9.1,8.7,9.0,9.9] },
    { date: '2026-09-23', nick: 'SSS', name: 'Валерий Лазарев', pos: 3, country: 'Россия', age: 20, earn: '$80 015', photo: 'players/sss.jpg', from: 'PARIVISION', to: 'OG', kind: 'loan', src: 'x.com/PARIVISIONdota2', path: ['1w Team 2025–26','PARIVISION 2026'], price: [6.0,6.3,6.7,6.5,6.4,6.6] },
    { date: '2026-09-21', nick: 'Batyuk', name: 'Богдан Батюк', pos: 3, country: 'Украина', age: 22, earn: '$44 254', photo: 'players/batyuk.jpg', from: 'Yellow Submarine', to: 'Team Spirit', kind: 'move', src: 'x.com/TSpirit_Dota2', path: ['Passion UA 2024–25','Yellow Submarine 2026'], price: [5.4,5.9,6.1,6.6,6.8,7.6] },
    { date: '2026-09-20', nick: 'Wisper', name: 'Adrián Céspedes Dobles', pos: 2, country: 'Боливия', age: 24, earn: '$902 826', photo: 'players/wisper.jpg', from: 'LGD Gaming', to: 'Team Liquid', kind: 'move', src: 'x.com/teamliquiddota', path: ['HEROIC 2025–26','LGD Gaming 2026'], price: [8.4,8.8,8.6,8.2,8.0,8.7] },
    { date: '2026-09-18', nick: 'TA2000', name: 'Айбек Токаев', pos: 1, country: 'Казахстан', age: 26, earn: '$350 630', photo: 'players/ta2000.jpg', from: 'Power Rangers', to: 'Team Synapse', kind: 'move', src: 'x.com/TEAMSYNAPSwxv', path: ['Team Yandex 2025','Power Rangers 2026'], price: [7.6,7.3,7.0,6.8,6.9,6.4] },
    { game: 'cs2', date: '2026-06-10', nick: 'JBOEN', name: 'Jason Boe Nielsen', role: 'стрелок', country: 'Дания', age: 19, photo: 'players/jboen.jpg', from: 'BIG Academy', to: 'FaZe Clan', kind: 'loan', src: 'bo3.gg', path: ['BIG Academy'], price: [5.0, 5.3, 5.6, 5.9, 6.1, 6.8] },
    { game: 'cs2', date: '2026-04-28', nick: 'Senzu', name: 'Azbayar Munkhbold', role: 'стрелок', country: 'Монголия', age: 20, photo: 'players/senzu.jpg', from: 'The MongolZ', to: 'BC.Game', kind: 'loan', src: 'bc.game', path: ['The MongolZ'], price: [7.9, 8.1, 7.8, 7.6, 7.4, 7.0] },
    { game: 'cs2', date: '2026-03-13', nick: 'NertZ', name: 'Guy Iluz', role: 'стрелок', country: 'Израиль', age: 24, photo: 'players/nertz.jpg', from: 'Team Liquid', to: 'Team Spirit', kind: 'move', src: 'pley.gg', path: ['Team Liquid'], price: [7.2, 7.5, 7.8, 8.0, 8.3, 8.9] },
    { game: 'cs2', date: '2026-03-07', nick: 'bodyy', name: 'Alexandre Pianaro', role: 'стрелок', country: 'Франция', age: 28, photo: 'players/bodyy.jpg', from: '3DMAX', to: 'OG', kind: 'move', src: 'pley.gg', path: ['3DMAX'], price: [6.4, 6.2, 6.0, 6.3, 6.1, 6.5] },
  ],
}
