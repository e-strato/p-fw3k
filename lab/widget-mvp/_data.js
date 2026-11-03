// Виджет MVP (созвон 21.10, Т4): ‼️ данные — пример (дирижёр 21.10: «пофиг на правду»), MVP считаем по своей статистике (Т4.6).
// pts — фэнтези-очки за период, prev — место в прошлый период (0 — новичок в топе), m — матчей, kda — средний KDA (CS2 — рейтинг).
// Игроки и команды настоящие; аватары — Steam (OpenDota proPlayers), у CS2 — аватары других про-игроков (заглушка). Лого — из лабы трансферов.
window.MVP_DATA = {
  games: [{ id: 'dota2', name: 'Dota 2', logo: 'logos/dota2.png' }, { id: 'cs2', name: 'CS2', logo: 'logos/cs2.png' }],
  teams: {
    'Team Spirit': 'logos/team-spirit.png', 'Team Liquid': 'logos/team-liquid.png', 'OG': 'logos/og.png', 'LGD Gaming': 'logos/lgd-gaming.png',
    'PARIVISION': 'logos/parivision.png', 'Inner Circle x Insanity': 'logos/inner-circle-x-insanity.png', 'GamerLegion': 'logos/gamerlegion.png',
    'FaZe Clan': 'logos/faze-clan.png', 'BC.Game': 'logos/bc-game.svg', 'The MongolZ': 'logos/the-mongolz.svg', '3DMAX': 'logos/3dmax.svg',
  },
  list: [
    { game: 'dota2', nick: 'Yatoro', team: 'Team Spirit', role: 'керри', photo: 'players/yatoro.jpg', hero: 'heroes/morphling.webp', week: { pts: 412, prev: 3, m: 7, kda: 9.1 }, month: { pts: 1180, prev: 1, m: 18, kda: 8.4 } },
    { game: 'dota2', nick: 'Malr1ne', team: 'Team Liquid', role: 'мид', photo: 'players/malr1ne.jpg', hero: 'heroes/puck.png', week: { pts: 398, prev: 1, m: 6, kda: 8.7 }, month: { pts: 1125, prev: 2, m: 17, kda: 8.1 } },
    { game: 'dota2', nick: 'Satanic', team: 'PARIVISION', role: 'керри', photo: 'players/satanic.jpg', hero: 'heroes/faceless_void.webp', week: { pts: 371, prev: 7, m: 6, kda: 7.9 }, month: { pts: 1040, prev: 4, m: 16, kda: 7.2 } },
    { game: 'dota2', nick: 'Topson', team: 'OG', role: 'мид', photo: 'players/topson.jpg', hero: 'heroes/invoker.png', week: { pts: 355, prev: 2, m: 5, kda: 7.4 }, month: { pts: 990, prev: 3, m: 15, kda: 7.0 } },
    { game: 'dota2', nick: 'Yuragi', team: 'Inner Circle x Insanity', role: 'керри', photo: 'players/yuragi.jpg', hero: 'heroes/terrorblade.webp', week: { pts: 340, prev: 0, m: 6, kda: 6.8 }, month: { pts: 930, prev: 6, m: 16, kda: 6.5 } },
    { game: 'dota2', nick: 'Larl', team: 'Team Spirit', role: 'мид', photo: 'players/larl.jpg', hero: 'heroes/storm_spirit.png', week: { pts: 322, prev: 4, m: 7, kda: 6.9 }, month: { pts: 960, prev: 5, m: 18, kda: 6.7 } },
    { game: 'dota2', nick: 'SumaiL', team: 'LGD Gaming', role: 'мид', photo: 'players/sumail.jpg', hero: 'heroes/ember_spirit.png', week: { pts: 305, prev: 5, m: 5, kda: 6.2 }, month: { pts: 870, prev: 7, m: 14, kda: 6.1 } },
    { game: 'dota2', nick: 'Batyuk', team: 'Team Spirit', role: 'оффлейн', photo: 'players/batyuk.jpg', hero: 'heroes/mars.webp', week: { pts: 288, prev: 9, m: 7, kda: 5.9 }, month: { pts: 845, prev: 8, m: 18, kda: 5.6 } },
    { game: 'dota2', nick: 'Wisper', team: 'Team Liquid', role: 'оффлейн', photo: 'players/wisper.jpg', hero: 'heroes/beastmaster.webp', week: { pts: 270, prev: 6, m: 6, kda: 5.4 }, month: { pts: 810, prev: 9, m: 17, kda: 5.3 } },
    { game: 'dota2', nick: 'Yuma', team: 'GamerLegion', role: 'керри', photo: 'players/yuma.jpg', hero: 'heroes/lycan.webp', week: { pts: 251, prev: 0, m: 4, kda: 5.1 }, month: { pts: 760, prev: 10, m: 12, kda: 5.0 } },
    // ещё 10 — до топ-20, как у HLTV (дирижёр 21.10); команды у части подменены ради лого
    { game: 'dota2', nick: 'Ame', team: 'LGD Gaming', role: 'керри', photo: 'players/ame.jpg', hero: 'heroes/faceless_void.webp', week: { pts: 244, prev: 8, m: 5, kda: 5.0 }, month: { pts: 740, prev: 11, m: 13, kda: 5.1 } },
    { game: 'dota2', nick: 'Crystallis', team: 'Team Liquid', role: 'керри', photo: 'players/crystallis.jpg', hero: 'heroes/terrorblade.webp', week: { pts: 236, prev: 12, m: 6, kda: 4.8 }, month: { pts: 735, prev: 13, m: 16, kda: 4.9 } },
    { game: 'dota2', nick: 'Pure', team: 'PARIVISION', role: 'мид', photo: 'players/pure.jpg', hero: 'heroes/puck.png', week: { pts: 229, prev: 0, m: 5, kda: 4.9 }, month: { pts: 712, prev: 15, m: 13, kda: 4.7 } },
    { game: 'dota2', nick: 'Nightfall', team: 'OG', role: 'оффлейн', photo: 'players/nightfall.jpg', hero: 'heroes/mars.webp', week: { pts: 221, prev: 11, m: 5, kda: 4.6 }, month: { pts: 700, prev: 12, m: 14, kda: 4.6 } },
    { game: 'dota2', nick: '33', team: 'GamerLegion', role: 'оффлейн', photo: 'players/33.jpg', hero: 'heroes/beastmaster.webp', week: { pts: 214, prev: 14, m: 4, kda: 4.4 }, month: { pts: 688, prev: 14, m: 12, kda: 4.5 } },
    { game: 'dota2', nick: 'skiter', team: 'OG', role: 'керри', photo: 'players/skiter.jpg', hero: 'heroes/morphling.webp', week: { pts: 207, prev: 10, m: 5, kda: 4.3 }, month: { pts: 675, prev: 16, m: 14, kda: 4.4 } },
    { game: 'dota2', nick: 'Saksa', team: 'Inner Circle x Insanity', role: 'саппорт', photo: 'players/saksa.jpg', hero: 'heroes/lycan.webp', week: { pts: 199, prev: 17, m: 6, kda: 4.0 }, month: { pts: 640, prev: 17, m: 16, kda: 4.1 } },
    { game: 'dota2', nick: 'Quinn', team: 'Team Liquid', role: 'мид', photo: 'players/quinn.jpg', hero: 'heroes/storm_spirit.png', week: { pts: 193, prev: 13, m: 6, kda: 4.1 }, month: { pts: 632, prev: 18, m: 16, kda: 4.0 } },
    { game: 'dota2', nick: 'Davai', team: 'LGD Gaming', role: 'оффлейн', photo: 'players/davai.jpg', hero: 'heroes/mars.webp', week: { pts: 186, prev: 0, m: 5, kda: 3.9 }, month: { pts: 610, prev: 0, m: 13, kda: 3.8 } },
    { game: 'dota2', nick: 'Wits', team: 'LGD Gaming', role: 'керри', photo: 'players/wits.jpg', hero: 'heroes/lycan.webp', week: { pts: 178, prev: 16, m: 5, kda: 3.7 }, month: { pts: 598, prev: 19, m: 13, kda: 3.7 } },
    // Добор до полных пятёрок Team Spirit и Team Liquid (дирижёр 21.10: у команды — все игроки, в матче — 10); вне топ-20 по очкам
    { game: 'dota2', nick: 'Mira', team: 'Team Spirit', role: 'саппорт', photo: 'players/mira.jpg', hero: 'heroes/beastmaster.webp', week: { pts: 164, prev: 22, m: 7, kda: 3.4 }, month: { pts: 560, prev: 21, m: 18, kda: 3.5 } },
    { game: 'dota2', nick: 'rue', team: 'Team Spirit', role: 'саппорт', photo: 'players/rue.jpg', hero: 'heroes/lycan.webp', week: { pts: 151, prev: 21, m: 7, kda: 3.1 }, month: { pts: 538, prev: 23, m: 18, kda: 3.2 } },
    { game: 'dota2', nick: 'Insania', team: 'Team Liquid', role: 'саппорт', photo: 'players/insania.jpg', hero: 'heroes/mars.webp', week: { pts: 147, prev: 23, m: 6, kda: 3.0 }, month: { pts: 520, prev: 22, m: 17, kda: 3.1 } },
    { game: 'cs2', nick: 'NertZ', team: 'Team Spirit', role: 'стрелок', photo: 'players/nertz.jpg', week: { pts: 386, prev: 2, m: 6, kda: 1.31 }, month: { pts: 1090, prev: 1, m: 15, kda: 1.27 } },
    { game: 'cs2', nick: 'JBOEN', team: 'FaZe Clan', role: 'стрелок', photo: 'players/jboen.jpg', week: { pts: 362, prev: 0, m: 5, kda: 1.24 }, month: { pts: 980, prev: 3, m: 14, kda: 1.19 } },
    { game: 'cs2', nick: 'Senzu', team: 'BC.Game', role: 'стрелок', photo: 'players/senzu.jpg', week: { pts: 333, prev: 1, m: 6, kda: 1.18 }, month: { pts: 1010, prev: 2, m: 15, kda: 1.21 } },
    { game: 'cs2', nick: 'bodyy', team: '3DMAX', role: 'стрелок', photo: 'players/bodyy.jpg', week: { pts: 297, prev: 4, m: 5, kda: 1.09 }, month: { pts: 870, prev: 4, m: 13, kda: 1.08 } },
  ],
}
