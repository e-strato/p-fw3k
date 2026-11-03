// Реальные данные Dota 2 на 21.10.2026 — источник Liquipedia (ссылки в src). Собрано 21.10.2026, ~13:15 МСК.
// Время матчей — МСК (переведено из CEST/SGT Liquipedia). rank/form не заполнены: открытого актуального рейтинга не нашлось.
// Команды с пустым {} — логотипа нет нигде (Liquipedia, dota2.ru, OpenDota). Dawn Bulls, Team Synapse — dota2.ru;
// Royal Bear, Resp Gaming, Novus Gaming, Team Kinetix — Steam (logo_url из OpenDota), добавлены 21.10.
window.T4_DATA = {
  asOf: '21.10.2026',
  game: { name: 'Dota 2', logo: 'logos/dota2.png' },
  teams: {
    // EPL Masters III
    'HULIGANI': { logo: 'logos/huligani.png' },
    'Team Lynx': { logo: 'logos/team-lynx.png' },
    'Power Rangers': { logo: 'logos/power-rangers.png' },
    'salamit': {},
    'Nemiga Gaming': { logo: 'logos/nemiga-gaming.png' },
    'Inner Circle x Insanity': { logo: 'logos/inner-circle-x-insanity.png' },
    'Yellow Submarine': { logo: 'logos/yellow-submarine.png' },
    'Dawn Bulls': { logo: 'logos/dawn-bulls.png' },
    'Team Synapse': { logo: 'logos/team-synapse.png' },
    'CyberHero': { logo: 'logos/cyberhero.png' },
    'The Bot$': {},
    'Zero Tenacity': { logo: 'logos/zero-tenacity.png' },
    // EPL World Series: SEA S19
    'Yangon Galacticos': { logo: 'logos/yangon-galacticos.png' },
    'Team Kinetix': { logo: 'logos/team-kinetix.png' },
    'Team Nemesis Academy': { logo: 'logos/team-nemesis-academy.png' },
    'Cloud Dawning': { logo: 'logos/cloud-dawning.png' },
    'Direborn Esports': { logo: 'logos/direborn-esports.png' },
    'Novus Gaming': { logo: 'logos/novus-gaming.png' },
    'Xipto Esports': { logo: 'logos/xipto-esports.png' },
    'Resp Gaming': { logo: 'logos/resp-gaming.png' },
    // BLAST SLAM VIII (плей-офф) и предстоящие
    'Team Yandex': { logo: 'logos/team-yandex.png' },
    'Team Spirit': { logo: 'logos/team-spirit.png' },
    'PARIVISION': { logo: 'logos/parivision.png' },
    'Aurora Gaming': { logo: 'logos/aurora-gaming.png' },
    'LGD Gaming': { logo: 'logos/lgd-gaming.png' },
    '1w Team': { logo: 'logos/1w-team.png' },
    'BetBoom Team': { logo: 'logos/betboom-team.png' },
    'GamerLegion': { logo: 'logos/gamerlegion.png' },
    'OG': { logo: 'logos/og.png' },
    'Team Liquid': { logo: 'logos/team-liquid.png' },
    'LEGION': { logo: 'logos/legion.png' },
    'Astra Invicta': {},
    'Natus Vincere': { logo: 'logos/natus-vincere.png' },
    'Xtreme Gaming': { logo: 'logos/xtreme-gaming.png' },
    'Team Nemesis': { logo: 'logos/team-nemesis.png' },
    'Pipsqueak+4': { logo: 'logos/pipsqueak-4.png' },
    'Team Tidebound': { logo: 'logos/team-tidebound.png' },
    'Team Resilience': { logo: 'logos/team-resilience.png' },
    'Royal Bear': { logo: 'logos/royal-bear.png' },
    'Skyreavers': {}
  },
  tours: [
    {
      id: 'epl-masters-3', name: 'EPL Masters III', logo: 'logos/epl-masters-3.png', st: 'live', tier: 'B',
      dates: '18.10 – 05.11', prize: '$100 000', stage: 'Групповой этап · день 4', src: 'https://liquipedia.net/dota2/EPL/Masters/3',
      fmt: 'groups',
      rule: 'Топ-2 каждой группы — в плей-офф (к 4 приглашённым командам), 3–6 места — вылет',
      // [команда, победы, поражения] — серии Bo3, порядок = места на Liquipedia на 21.10 ~13:00 МСК
      groups: {
        'A': [['HULIGANI', 2, 0], ['Team Lynx', 1, 0], ['Power Rangers', 1, 3], ['salamit', 1, 0], ['Nemiga Gaming', 0, 2], ['Inner Circle x Insanity', 0, 0]],
        'B': [['Yellow Submarine', 2, 0], ['Dawn Bulls', 2, 0], ['Team Synapse', 1, 2], ['CyberHero', 1, 1], ['The Bot$', 0, 2], ['Zero Tenacity', 0, 1]]
      },
      zones: { up: [1, 2], down: [3, 4, 5, 6] },
      matches: [
        { a: 'Power Rangers', b: 'Inner Circle x Insanity', when: 'live', stage: 'Группа A · Bo3' },
        { a: 'Dawn Bulls', b: 'Zero Tenacity', when: 'Сегодня, 15:00', stage: 'Группа B · Bo3' },
        { a: 'salamit', b: 'HULIGANI', when: 'Сегодня, 18:00', stage: 'Группа A · Bo3' },
        { a: 'Yellow Submarine', b: 'The Bot$', when: 'Сегодня, 21:00', stage: 'Группа B · Bo3' },
        { a: 'Inner Circle x Insanity', b: 'salamit', when: '22.10, 12:00', stage: 'Группа A · Bo3' },
        { a: 'HULIGANI', b: 'Team Lynx', when: '22.10, 15:00', stage: 'Группа A · Bo3' },
        { a: 'Team Synapse', b: 'The Bot$', when: '23.10', stage: 'Группа B · Bo3' } // время не объявлено; game-tournaments.com/en/dota-2/team/synapse, 21.10
      ],
      note: 'Tier 3 на Liquipedia: турниров tier 1–2, идущих 21.10, нет. Очки в группе: 2–0 = 3, 2–1 = 2/1 — места считаются по очкам, поэтому порядок не совпадает с победами. Плей-офф 02–05.11.'
    },
    {
      id: 'epl-world-sea-s19', name: 'EPL World Series: SEA S19', logo: 'logos/epl-world-sea-s19.png', st: 'live', tier: 'B',
      dates: '20.10 – 05.11', prize: '$10 000', stage: 'Групповой этап · день 2', src: 'https://liquipedia.net/dota2/EPL/World_Series/Southeast_Asia/19',
      fmt: 'groups',
      rule: 'Одна группа из 8: 1–4 — в верхнюю сетку плей-офф, 5–6 — в нижнюю, 7–8 — вылет',
      groups: {
        'A': [['Yangon Galacticos', 2, 0], ['Team Kinetix', 1, 1], ['Team Nemesis Academy', 0, 1], ['Cloud Dawning', 0, 0], ['Direborn Esports', 0, 0], ['Novus Gaming', 0, 0], ['Xipto Esports', 0, 0], ['Resp Gaming', 0, 1]]
      },
      zones: { up: [1, 2, 3, 4], mid: [5, 6], down: [7, 8] }, // mid — места в нижнюю сетку
      matches: [
        { a: 'Team Nemesis Academy', b: 'Cloud Dawning', when: 'live', stage: 'Группа · Bo3' },
        { a: 'Cloud Dawning', b: 'Resp Gaming', when: '22.10, 06:00', stage: 'Группа · Bo3' },
        { a: 'Novus Gaming', b: 'Team Kinetix', when: '22.10, 09:00', stage: 'Группа · Bo3' },
        { a: 'Yangon Galacticos', b: 'Team Nemesis Academy', when: '22.10, 12:00', stage: 'Группа · Bo3' },
        { a: 'Yangon Galacticos', b: 'Cloud Dawning', when: '23.10, 09:00', stage: 'Группа · Bo3' }
      ],
      note: 'Tier 3. Одна группа (на Liquipedia без буквы — ключ «A» условный). Идёт 2-й игровой день, сыграно 3 матча из 28; в live-матче счёт 1:0 в пользу Cloud Dawning на момент сбора.'
    },
    {
      id: 'blast-slam-8', name: 'BLAST SLAM VIII', logo: 'logos/blast-slam-8.png', st: 'live', tier: 'S',
      dates: '29.09 – 11.10', prize: '$750 000', stage: 'Плей-офф · завершён 11.10', src: 'https://liquipedia.net/dota2/BLAST/SLAM/8',
      fmt: 'bracket',
      rule: 'Двойное выбывание: поражение в верхней сетке — в нижнюю, в нижней — вылет. Гранд-финал Bo5, остальное Bo3',
      bracket: {
        upper: [
          ['Четвертьфиналы ВС', [['Team Yandex', 2, 'LGD Gaming', 1, '08.10, 12:00'], ['Aurora Gaming', 2, '1w Team', 0, '08.10, 16:00']]],
          ['Полуфиналы ВС', [['PARIVISION', 1, 'Team Yandex', 2, '08.10, 19:50'], ['Team Spirit', 2, 'Aurora Gaming', 1, '09.10, 12:00']]],
          ['Финал ВС', [['Team Yandex', 2, 'Team Spirit', 0, '10.10, 13:30']]]
        ],
        lower: [
          ['Четвертьфиналы НС', [['PARIVISION', 2, '1w Team', 1, '09.10, 17:00'], ['Aurora Gaming', 2, 'LGD Gaming', 0, '09.10, 21:25']]],
          ['Полуфинал НС', [['PARIVISION', 2, 'Aurora Gaming', 0, '10.10, 16:20']]],
          ['Финал НС', [['Team Spirit', 2, 'PARIVISION', 1, '11.10, 12:00']]]
        ],
        final: [['Гранд-финал', [['Team Yandex', 3, 'Team Spirit', 1, '11.10, 17:00']]]]
      },
      matches: [
        { a: 'Team Yandex', b: 'Team Spirit', when: '11.10, 17:00', stage: 'Гранд-финал · Bo5 · 3:1' },
        { a: 'Team Spirit', b: 'PARIVISION', when: '11.10, 12:00', stage: 'Финал НС · Bo3 · 2:1' },
        { a: 'PARIVISION', b: 'Aurora Gaming', when: '10.10, 16:20', stage: 'Полуфинал НС · Bo3 · 2:0' },
        { a: 'Team Yandex', b: 'Team Spirit', when: '10.10, 13:30', stage: 'Финал ВС · Bo3 · 2:0' }
      ],
      note: 'ПОДСТАВЛЕН: ни у одного турнира 21.10 плей-офф не идёт. Это последний сыгранный плей-офф tier 1 (завершён 11.10, 10 дней назад) — st: live условно, все матчи сыграны. Чемпион — Team Yandex. В плей-офф 6 команд: 2 сеяны сразу в полуфиналы ВС (Team Spirit, PARIVISION) через матчи посева.'
    },
    {
      id: 'pari-universe', name: 'PARI Universe', logo: 'logos/pari-universe.png', st: 'soon', tier: 'S',
      dates: '22.10 – 01.11', prize: '$250 000', stage: 'Старт завтра · групповой этап', src: 'https://liquipedia.net/dota2/PARI_Universe/1',
      fmt: 'soon',
      rule: 'Две группы по 5 (круг, Bo3): топ-4 — в плей-офф (двойное выбывание), 5-е места — вылет',
      teams: ['1w Team', 'Astra Invicta', 'BetBoom Team', 'GamerLegion', 'OG', 'PARIVISION', 'Team Liquid', 'Team Spirit', 'Team Yandex', 'LEGION'],
      note: 'LEGION на Liquipedia — «LEGION (stack)», прошёл через квалификацию.'
    },
    {
      id: 'blast-slam-9', name: 'BLAST SLAM IX', logo: 'logos/blast-slam-9.png', st: 'soon', tier: 'S',
      dates: '20.11 – 29.11', prize: '$750 000', stage: 'Старт 20.11', src: 'https://liquipedia.net/dota2/BLAST/SLAM/9',
      fmt: 'soon',
      rule: '4 группы GSL по 4: 1-е места — в матчи посева, 2-е — в «последний шанс», остальные — вылет; плей-офф — двойное выбывание',
      teams: ['Natus Vincere', 'Dawn Bulls', 'Xtreme Gaming', 'Team Nemesis'],
      note: 'Известны только 4 команды из квалификаций; 12 приглашённых Liquipedia пока не указывает.'
    },
    {
      id: 'dreamleague-s30', name: 'DreamLeague Season 30', logo: 'logos/dreamleague-s30.png', st: 'soon', tier: 'S',
      dates: '02.12 – 13.12', prize: '$750 000', stage: 'Старт 02.12', src: 'https://liquipedia.net/dota2/DreamLeague/30',
      fmt: 'soon',
      rule: 'Швейцарка на 24 команды (Bo3): топ-8 — в плей-офф (двойное выбывание), остальные — вылет',
      teams: ['Astra Invicta', 'Aurora Gaming', 'BetBoom Team', 'Natus Vincere', 'PARIVISION', 'Pipsqueak+4', 'Team Tidebound', 'Team Yandex', 'LGD Gaming', 'Xtreme Gaming', '1w Team', 'GamerLegion', 'Team Liquid', 'Team Nemesis', 'Team Spirit', 'OG', 'Team Lynx', 'Yellow Submarine', 'Team Resilience', 'Royal Bear', 'Skyreavers'],
      note: '24 участника: 21 известен, ещё 3 — из DreamLeague Division 2 Series 5 (06–19.11).'
    }
  ]
}
