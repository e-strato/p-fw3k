// Данные лабы замен по созвону 22.10 (решение 29). ‼️ В основном ВЫДУМАНО (дирижёр 21.10: «пофиг на правдивость, выдумай данные»):
// составы, Steam ID, кто кого заменил. Настоящее: состав salamit и его Steam ID — с фото инструмента начальника (22.10/от-начальника/7.png);
// ники fading / F32REAK — с фото 9; Sonneiko, Ramzes666, Nikobaby, TA2000, Dukalis, Kiritych, Lorenof, Ahjit, ssnovv1 — из лабы widget-subs.
// Матчи и логотипы — из виджета турнира (T4_DATA), команды Team Lynx — Nemiga Gaming в ночь на 21.10 — выдуманы.
// Источника и надёжности нет (начальник отверг, 22.10). Замена — расхождение с базой: kind 'news' — узнали заранее (новость до матча),
// 'ids' — в матче Steam ID игрока не совпал с составом, 'pos' — игрок тот же, но позиция другая.
window.SUBS2 = {
  asOf: '21.10',
  pos: ['Керри', 'Мид', 'Оффлейн', 'Поддержка 4', 'Поддержка 5'],
  // Составы в базе: [ник, Steam ID] по позициям 1–5
  rosters: {
    'Power Rangers': [['Gpk~', '311459210'], ['Ryze', '148215639'], ['Kostik', '901126604'], ['Seleri', '386731410'], ['Dukalis', '220451889']],
    'Inner Circle x Insanity': [['Shiro', '113331514'], ['Kz', '902114553'], ['Wizard', '181716137'], ['Ves', '106305042'], ['Kartograf', '377109521']],
    'Team Nemesis Academy': [['Jinx', '320219866'], ['Kael', '101446572'], ['Rudy', '175463659'], ['Vyn', '242315098'], ['Pao', '163217459']],
    'Cloud Dawning': [['Ahjit', '139931271'], ['Lynn', '294213458'], ['Mekas', '188431762'], ['Zenith', '121459377'], ['Owl', '256310495']],
    'Dawn Bulls': [['Nightfall~', '124801257'], ['Lorien', '331208416'], ['Kiritych', '410322108'], ['Fly', '201745339'], ['Saksa~', '103940183']],
    'Zero Tenacity': [['Raven', '116513402'], ['Lorenof', '284011976'], ['Swede', '172846031'], ['Pinky', '135820941'], ['Tash', '199310547']],
    'salamit': [['423', '458287006'], ['salamat1', '333700720'], ['Ankou', '1675517497'], ['ani-san', '435139370'], ['mx', '169516760']],
    'HULIGANI': [['ssnovv1', '214877043'], ['Daxi', '160233187'], ['Grom', '128420911'], ['Kaktus', '301845129'], ['Bob', '177625403']],
    'Yellow Submarine': [['Malr1ne', '898754153'], ['Daxak', '137193239'], ['Lex', '210034961'], ['Malik', '158290117'], ['Xibbe', '117312455']],
    'The Bot$': [['Neo', '191200356'], ['Hex', '243518877'], ['Mute', '168094412'], ['Ping', '322199870'], ['Byte', '204517336']],
    'Team Lynx': [['Mitch', '115620394'], ['Leostyle', '209331846'], ['Ghost', '147722360'], ['Tofu', '388210744'], ['Kei', '170055912']],
    'Nemiga Gaming': [['Lil', '172034515'], ['Fenrir', '123410082'], ['Soma', '314098221'], ['Melon', '128872310'], ['Tank', '190036447']],
  },
  // Игроки базы вне этих составов (свободные, ладдер, другие команды): [ник, команда или '', позиция, Steam ID]
  base: [['Sonneiko', '', 3, '412900311'], ['Ramzes666', '', 2, '132851371'], ['Nikobaby', '', 1, '228700412'], ['TA2000', 'Team Synapse', 1, '156331720'],
    ['fading', '5chudsnoanchor', 1, '1675517400'], ['F32REAK', 'Teikō', 1, '1094421705'], ['Yamich', '', 5, '205531779'], ['rubikon155', 'Team Synapse', 1, '311200877'],
    ['Moon', '', 2, '112309811'], ['Shad', '1w Team', 1, '141209335'], ['Stojkov', 'Aurora Gaming', 2, '126543120']],
  // Матчи: за ночь, идущие и сегодняшние. bo — длина серии, map — какая карта сейчас (идущие)
  matches: [
    { id: 'm0', a: 'Team Lynx', b: 'Nemiga Gaming', tour: 'EPL Masters III', when: 'ночью, 03:00', done: '2:1', bo: 3 },
    { id: 'm1', a: 'Power Rangers', b: 'Inner Circle x Insanity', tour: 'EPL Masters III', when: 'live', bo: 3, map: 2 },
    { id: 'm2', a: 'Team Nemesis Academy', b: 'Cloud Dawning', tour: 'EPL World Series: SEA S19', when: 'live', bo: 3, map: 2 },
    { id: 'm3', a: 'Dawn Bulls', b: 'Zero Tenacity', tour: 'EPL Masters III', when: '15:00', bo: 3 },
    { id: 'm4', a: 'salamit', b: 'HULIGANI', tour: 'EPL Masters III', when: '18:00', bo: 3 },
    { id: 'm5', a: 'Yellow Submarine', b: 'The Bot$', tour: 'EPL Masters III', when: '21:00', bo: 3 }, // замен нет
  ],
  // Замены — расхождения с базой. in — кто на самом деле (из новости или найденный по Steam ID), null — в базе не нашёлся;
  // seen — Steam ID, который пришёл из матча; map — с какой карты серии; term — что предложила система (админ меняет)
  subs: [
    { id: 's1', m: 'm1', team: 'Inner Circle x Insanity', pos: 1, out: 'Shiro', kind: 'ids', seen: '1675517400', in: 'fading', map: 1, term: 'match' },
    { id: 's2', m: 'm1', team: 'Inner Circle x Insanity', pos: 2, out: 'Kz', kind: 'ids', seen: '902777301', in: null, map: 1, term: 'match' },
    { id: 's3', m: 'm1', team: 'Power Rangers', pos: 5, out: 'Dukalis', kind: 'news', in: 'Yamich', date: '21.10', note: 'Dukalis ушёл из команды', term: 'forever' },
    { id: 's4', m: 'm2', team: 'Cloud Dawning', pos: 1, out: 'Ahjit', kind: 'ids', seen: '228700412', in: 'Nikobaby', map: 2, term: 'map' },
    { id: 's5', m: 'm3', team: 'Dawn Bulls', pos: 3, out: 'Kiritych', kind: 'news', in: 'Sonneiko', date: '21.10', note: 'у Kiritych проблемы с визой', term: 'event' },
    { id: 's6', m: 'm3', team: 'Zero Tenacity', pos: 2, out: 'Lorenof', kind: 'news', in: 'Ramzes666', date: '21.10', note: 'Lorenof не успевает на матч', term: 'match' },
    { id: 's7', m: 'm4', team: 'HULIGANI', pos: 1, out: 'ssnovv1', kind: 'news', in: 'TA2000', date: '18.10', note: 'состав на EPL Masters III', term: 'event' },
    { id: 's8', m: 'm0', team: 'Team Lynx', pos: 3, out: 'Ghost', kind: 'pos', in: 'Leostyle', from: 2, map: 3, term: 'pos', note: 'Leostyle и Ghost поменялись позициями на третьей карте' },
  ],
}
