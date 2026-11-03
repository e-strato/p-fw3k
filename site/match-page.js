// Страница матча (blocks/screens/match-page.html, страница match-page.html; дирижёр 08.10: перенос лабы «Матч одним экраном» v2 «Телефон: сегмент»).
// Одна страница на три состояния матча — что показать, берём из ссылки: ?game=dota|cs&state=pre|live|done (без параметров — Dota, в эфире).
// Старые значения из Match Center тоже работают: draft → pre, live1 / break / live2 → live.
// Каркас: шапка (до и после — карточка матча, в эфире — эфир) → 4 плитки на одних местах во всех состояниях → под ними блоки 07.10 (match-page-blocks.js, дирижёр 08.10)
// (Статистика · Награды · Фэнтези · Прогнозы и коэффициенты) → открытая плитка крупно. Карты серии — внутри «Статистики» своим переключателем.
// Телефон (container query «mp», до 700px): вместо плиток — сегмент на 4 пункта, липнет к верху; шапка компактная, в эфире — видео 16:9 и счёт строкой.
// Данные условные: Dota 2 Team Spirit — Tundra Esports 2 : 1, CS2 G2 — FaZe 2 : 0. Стили — styles.css [=== Страница матча ===].
;(() => {
  const root = document.querySelector('[data-mp]')
  if (!root) return

  // ——— Команды ———
  const К = {
    ts: ['Team Spirit', 'ts'], tun: ['Tundra Esports', 'tun'], flc: ['Team Falcons', 'flc'], tl: ['Team Liquid', 'tl'],
    g2: ['G2 Esports', 0, 'G2'], faze: ['FaZe Clan', 0, 'FZ'], vit: ['Team Vitality', 0, 'VIT'], mgz: ['The MongolZ', 0, 'MGZ'],
  }
  const лого = (id, cls = '') => { const t = К[id]; return t[1] ? `<img class="mp-lg ${cls}" src="img/teams/${t[1]}.png" alt="" />` : `<span class="mp-lg mp-lg--mono ${cls}">${t[2]}</span>` }
  const имя = (id) => К[id][0]
  const ЦВЕТ = { ts: 'var(--c-team-ts)', tun: 'var(--c-team-tun)', g2: 'var(--c-live)', faze: 'var(--c-accent)', flc: 'var(--c-team-flc)', tl: 'var(--c-team-tl)', vit: 'var(--c-coin)', mgz: 'var(--c-stat-mid)' }
  const ФОТО = { Yatoro: 'yatoro', rue: 'rue' }
  const фото = (n) => `img/players/${ФОТО[n] ? ФОТО[n] + '.webp' : '_silhouette.png'}`
  const ава = (n, cls = 'mp-ava-s') => `<img class="${cls}" src="${фото(n)}" alt="" />`
  const ГЕРОИ = ['terrorblade', 'morphling', 'mars', 'hoodwink', 'tusk', 'faceless_void', 'lycan', 'beastmaster', 'rubick']
  const ГЕРОЙ_ИМЯ = ['Terrorblade', 'Morphling', 'Mars', 'Hoodwink', 'Tusk', 'Faceless Void', 'Lycan', 'Beastmaster', 'Rubick']
  const гер = (i, cls = 'mp-hero') => `<img class="${cls}" src="img/heroes/${ГЕРОИ[i]}.webp" alt="${ГЕРОЙ_ИМЯ[i]}" title="${ГЕРОЙ_ИМЯ[i]}" />`
  const ЗНАК = { fight: '⚔', rosh: '◆', tower: '▲', gg: '★', pistol: '●', clutch: '◎', ace: '✦' }
  const раунды = (s) => { let d = 0; return [0, ...[...s].map((c) => (d += c === 'A' ? 1 : -1))] }

  // ——— Серии (как в лабе «Матч после»): карты, игроки, что дальше ———
  const СЕРИИ = {
    dota: {
      g: 'dota', a: 'ts', b: 'tun', игра: 'Dota 2', тур: 'BLAST Slam VIII', стадия: 'Полуфинал верхней сетки', bo: 'Bo3', серия: [2, 1], дата: '6 октября', длит: '2 ч 04 мин',
      карты: [
        { n: 'Карта 1', под: 'Spirit — свет', сч: [34, 21], поб: 'a', длит: '41 мин', mvp: ['Yatoro', 'a', '14 / 2 / 11 · Terrorblade'],
          ход: [0, 0.3, 0.8, 0.2, -0.6, 0.4, 1.5, 2.8, 3.1, 4.6, 5.2, 7.9, 9.4, 12.1, 15.0, 14.2, 18.5, 21.3, 24.0, 26.8, 30.2],
          соб: [[6, 'fight', 'b', 'Первая кровь — Crystallis'], [13, 'tower', 'a', 'Первая башня — Spirit'], [19, 'fight', 'a', 'Larl — тройное убийство'], [24, 'rosh', 'a', 'Рошан — Aegis у Yatoro'], [33, 'tower', 'a', 'Бараки на миде'], [41, 'gg', 'a', 'ГГ · 34 : 21']],
          пики: { a: [0, 2, 3, 4, 8], b: [5, 6, 7, 1, 3] } },
        { n: 'Карта 2', под: 'Spirit — тьма', сч: [22, 31], поб: 'b', длит: '47 мин', mvp: ['Crystallis', 'b', '12 / 3 / 9 · Faceless Void'],
          ход: [0, -0.4, -1.2, -0.8, 0.6, 1.1, 0.2, -1.8, -3.5, -2.9, -5.6, -4.1, -2.2, -1.0, -3.8, -6.9, -9.2, -8.4, -11.6, -14.0, -16.3, -19.8, -22.4, -25.1],
          соб: [[8, 'fight', 'a', 'Первая кровь — Larl'], [15, 'tower', 'b', 'Tundra снесли две башни'], [21, 'rosh', 'b', 'Рошан — Tundra'], [27, 'fight', 'a', 'Spirit отыгрались у реки'], [36, 'rosh', 'b', 'Второй Рошан — Tundra'], [47, 'gg', 'b', 'ГГ · 22 : 31']],
          пики: { a: [1, 2, 3, 4, 8], b: [5, 6, 7, 0, 3] } },
        { n: 'Карта 3', под: 'решающая · Spirit — свет', сч: [43, 19], поб: 'a', длит: '36 мин', mvp: ['Larl', 'a', '13 / 1 / 16 · Lycan'],
          ход: [0, 0.5, 1.4, 2.2, 1.6, 3.9, 5.1, 4.0, 6.8, 9.3, 12.4, 11.0, 15.6, 18.9, 22.1, 25.7, 28.4, 31.0],
          соб: [[4, 'fight', 'a', 'Первая кровь — Yatoro'], [11, 'tower', 'a', 'Две башни за минуту'], [17, 'rosh', 'a', 'Рошан — Spirit'], [23, 'fight', 'a', 'Collapse — Reverse Polarity на пятерых'], [29, 'rosh', 'a', 'Второй Aegis'], [36, 'gg', 'a', 'ГГ · 43 : 19']],
          пики: { a: [5, 6, 2, 3, 8], b: [0, 1, 7, 4, 3] } },
      ],
      // игрок: имя, роль, герои по картам, У, С, П, GPM, XPM, средний нетворс (тыс.)
      игроки: {
        a: [['Yatoro', 'Керри', [0, 1, 5], 27, 6, 19, 742, 801, 24.1], ['Larl', 'Мид', [2, 2, 6], 24, 7, 31, 664, 760, 20.3], ['Collapse', 'Хардлейн', [3, 3, 2], 11, 9, 38, 498, 590, 15.2], ['rue', 'Поддержка 4', [4, 4, 3], 6, 14, 41, 352, 455, 9.8], ['Miposhka', 'Поддержка 5', [8, 8, 8], 3, 12, 52, 281, 402, 7.4]],
        b: [['Crystallis', 'Керри', [5, 5, 0], 21, 11, 16, 701, 742, 21.8], ['bzm', 'Мид', [6, 6, 1], 18, 12, 22, 640, 703, 19.0], ['33', 'Хардлейн', [7, 7, 7], 9, 14, 25, 480, 566, 13.9], ['Saksa', 'Поддержка 4', [1, 0, 4], 5, 16, 33, 310, 420, 8.6], ['Whitemon', 'Поддержка 5', [3, 3, 3], 2, 15, 38, 270, 391, 6.9]],
      },
      mvp: 'Yatoro',
      сетка: { стало: 'Финал верхней сетки' },
      дальше: [['a', 'flc', 'Финал верхней сетки', '8 октября · 17:00', 44 * 3600 + 12 * 60], ['b', 'tl', 'Нижняя сетка · раунд 3', '7 октября · 14:00', 23 * 3600 + 25 * 60]],
      прогнозы: [['Spirit — Falcons', '8 окт', 54], ['Tundra — Liquid', '7 окт', 61]],
    },
    cs: {
      g: 'cs', a: 'g2', b: 'faze', игра: 'CS2', тур: 'ESL Pro League S24', стадия: 'Группа C · решающий матч', bo: 'Bo3', серия: [2, 0], дата: '6 октября', длит: '1 ч 42 мин',
      карты: [
        { n: 'Mirage', под: 'выбор G2', сч: [13, 9], поб: 'a', длит: '48 мин', mvp: ['m0NESY', 'a', '26–12 · рейтинг 1.52'], р: 'AABABAAABAABBBABAABBAA',
          соб: [[1, 'pistol', 'a', 'Пистолетка — G2'], [6, 'clutch', 'a', 'huNter- — клатч 1 на 2'], [13, 'pistol', 'b', 'Пистолетка второй половины — FaZe'], [16, 'ace', 'a', 'm0NESY — эйс с AWP'], [22, 'gg', 'a', 'Матч-пойнт и 13 : 9']] },
        { n: 'Inferno', под: 'выбор FaZe', сч: [13, 11], поб: 'a', длит: '54 мин', mvp: ['huNter-', 'a', '24–17 · рейтинг 1.34'], р: 'BABBAABABBABAABAABAABABA',
          соб: [[1, 'pistol', 'b', 'Пистолетка — FaZe'], [9, 'clutch', 'b', 'broky — клатч 1 на 3'], [13, 'pistol', 'a', 'Пистолетка второй половины — G2'], [19, 'clutch', 'a', 'huNter- — клатч 1 на 2'], [24, 'gg', 'a', 'G2 закрыли камбэк — 13 : 11']] },
        { n: 'Ancient', под: 'решающая', сч: null, поб: null, длит: '', mvp: null, р: '', соб: [] },
      ],
      // игрок: имя, роль, -, У, С, ADR, KAST, HS, рейтинг
      игроки: {
        a: [['m0NESY', 'Снайпер', 0, 47, 25, 97, 78, 31, 1.41], ['huNter-', 'Райфлер', 0, 38, 31, 84, 74, 52, 1.15], ['malbsMd', 'Райфлер', 0, 35, 30, 81, 72, 61, 1.10], ['HeavyGod', 'Райфлер', 0, 31, 31, 72, 70, 48, 1.01], ['Snax', 'Капитан', 0, 27, 33, 66, 69, 44, 0.92]],
        b: [['broky', 'Снайпер', 0, 36, 32, 83, 71, 22, 1.08], ['frozen', 'Райфлер', 0, 33, 34, 77, 70, 49, 1.00], ['rain', 'Райфлер', 0, 30, 34, 74, 66, 55, 0.95], ['EliGE', 'Райфлер', 0, 28, 35, 70, 64, 51, 0.90], ['karrigan', 'Капитан', 0, 19, 35, 58, 62, 40, 0.78]],
      },
      mvp: 'm0NESY',
      сетка: { стало: 'Плей-офф · четвертьфинал' },
      дальше: [['a', 'vit', 'Плей-офф · четвертьфинал', '11 октября · 18:00', 4 * 86400 + 2 * 3600 + 25 * 60], ['b', 'mgz', 'BLAST Open · группа', '9 октября · 15:30', 2 * 86400 - 3600]],
      прогнозы: [['G2 — Vitality', '11 окт', 47], ['FaZe — MongolZ', '9 окт', 52]],
    },
  }

  // ——— Что видит и делает зритель в каждой игре: фэнтези, прогнозы, коэффициенты, эфир ———
  // игрок фэнтези: ник, позиция, команда, OVR, редкость, фото, прогноз очков до матча, есть ли карта в коллекции, очки по итогу серии
  const Д = {
    dota: {
      кор: { ts: 'Spirit', tun: 'Tundra' },
      игроки: {
        yatoro: ['Yatoro', 1, 'ts', 82, 'holo', 'yatoro', 21.4, 1, 29.6], larl: ['Larl', 2, 'ts', 80, 'base', '', 18.2, 1, 27.2], collapse: ['Collapse', 3, 'ts', 88, 'prism', '', 15.1, 1, 18.4],
        rue: ['rue', 4, 'ts', 78, 'base', 'rue', 12.6, 1, 12.1], miposhka: ['Miposhka', 5, 'ts', 76, 'base', '', 9.8, 1, 10.3],
        crystallis: ['Crystallis', 1, 'tun', 91, 'prism', '', 22.0, 1, 21.5], bzm: ['bzm', 2, 'tun', 84, 'holo', '', 17.9, 0, 18.0], n33: ['33', 3, 'tun', 79, 'base', '', 9.1, 1, 9.4],
        saksa: ['Saksa', 4, 'tun', 81, 'holo', '', 11.4, 0, 8.2], whitemon: ['Whitemon', 5, 'tun', 74, 'base', '', 7.7, 1, 6.9],
      },
      роль: ['', 'Керри', 'Мид', 'Хардлейн', 'Поддержка 4', 'Поддержка 5'],
      нетКарты: 'bzm и Saksa',
      приз: 'yatoro',
      итог: { win: 'ts', sc: '2:1', fb: 'tun' },
      fb: 'Первая кровь на карте 1', fbЖив: 'Crystallis, 6-я минута', голоса: { win: 58, sc: { '2:1': 41, '2:0': 22 }, fb: 55 },
      примеры: { pre: { slots: [null, null, 'collapse', null, null] }, after: { slots: ['yatoro', 'larl', 'collapse', 'rue', 'whitemon'], cap: 'yatoro', win: 'ts', sc: '2:1', fb: 'ts' } },
      линия: {
        pre: { бк: [['Букмекер A', 1.62, 2.30], ['Букмекер B', 1.65, 2.24], ['Букмекер C', 1.60, 2.34]], ход: [1.80, 1.78, 1.74, 1.70, 1.71, 1.66, 1.64, 1.65], откр: [1.80, 2.00], модель: 64, мин: 1.5, макс: 1.9, от: 'Открытие · 1.80', когда: '3 дня назад' },
        live: { бк: [['Букмекер A', 1.36, 3.05], ['Букмекер B', 1.38, 2.98], ['Букмекер C', 1.35, 3.10]], ход: [1.65, 1.66, 1.62, 1.55, 1.52, 1.47, 1.41, 1.38], откр: [1.65, 2.34], модель: 72, мин: 1.3, макс: 1.7, от: 'До старта · 1.65', когда: 'начало карты 1' },
      },
      рынки: [['Фора Spirit −1.5', '2.60', 'Tundra +1.5', '1.48'], ['Тотал карт больше 2.5', '2.05', 'Меньше 2.5', '1.75'], ['Первая кровь, карта 1 · Spirit', '1.80', 'Tundra', '1.95']],
      зашло: { a: true, b: false, m0a: false, m0b: true, m1a: true, m1b: false, m2a: false, m2b: true },
      livePod: 'карта 1 · 24-я минута · меняются каждую минуту',
      форма: { ts: 'WWLWW', tun: 'LWWLL' }, рейтинг: { ts: '3-е в рейтинге · форма 4 из 5', tun: '8-е в рейтинге · форма 2 из 5' },
      встречи: [3, 2, 'Последняя — 2 : 1 Spirit, 12 сентября'],
      составы: 'Составы объявят за час, пики героев — на драфте каждой карты. Карты, график и игрок карты появятся здесь с началом матча.',
      эфир: {
        шанс: 64, счёт: '18 : 12', под: 'убийства 18 : 12 · +4.2 тыс. золота',
        тик: [['Перевес по золоту', '+4.2 тыс.', 'у Spirit · растёт 6 минут'], ['Башни', '7 : 3', 'за карту'], ['Рошан', 'Spirit · 24:02', 'Aegis у Yatoro'], ['Лучший', 'Yatoro', '9 / 1 / 6 · 684 GPM']],
        лента: [['24:02', 'a', 'Spirit убили Рошана — Aegis у Yatoro', 'big'], ['22:40', 'a', 'Драка у реки: 3 на 1, Collapse — Reverse Polarity на троих', ''], ['21:05', 'b', 'Tundra снесли башню на центре', ''], ['19:30', 'a', 'Larl — тройное убийство', 'big'], ['16:12', 'b', 'Tundra забрали Тормент', ''], ['12:44', 'a', 'Spirit снесли первую башню', ''], ['06:10', 'b', 'Первая кровь — Crystallis', ''], ['00:00', '', 'Горн — карта 1 началась', 'sys']],
        ход: [0, 0.3, 0.8, 0.2, -0.6, 0.4, 1.5, 2.0, 2.4, 3.1, 3.6, 3.9, 4.2], до: 24,
        лучший: ['Yatoro', '9 / 1 / 6 · Terrorblade · 684 GPM'],
        kv: [['Убийства', '18 : 12'], ['Перевес', '+4.2<small>тыс. · Spirit</small>'], ['Башни', '7 : 3'], ['Рошаны', '1 : 0']],
        подпись: 'Spirit — свет · убийства 18 : 12 · график растёт каждую минуту', знаки: '⚔ драка · ◆ Рошан · ▲ башня',
        карты: [['Карта 2', 'Spirit — тьма', 'начнётся минут через 25, после карты 1'], ['Карта 3', 'если 1 : 1', 'будет, если серия станет 1 : 1']],
        ведут: 'Spirit ведут карту 1',
      },
    },
    cs: {
      кор: { g2: 'G2', faze: 'FaZe' },
      игроки: {
        m0nesy: ['m0NESY', 1, 'g2', 90, 'prism', '', 20.8, 1, 26.4], hunter: ['huNter-', 2, 'g2', 84, 'holo', '', 16.2, 1, 19.8], malbsmd: ['malbsMd', 3, 'g2', 81, 'base', '', 14.9, 1, 16.1],
        heavygod: ['HeavyGod', 4, 'g2', 78, 'base', '', 12.7, 0, 13.0], snax: ['Snax', 5, 'g2', 75, 'base', '', 9.6, 1, 8.4],
        broky: ['broky', 1, 'faze', 86, 'holo', '', 17.5, 1, 12.2], frozen: ['frozen', 2, 'faze', 82, 'base', '', 14.1, 1, 11.0], rain: ['rain', 3, 'faze', 79, 'base', '', 13.0, 0, 9.1],
        elige: ['EliGE', 4, 'faze', 80, 'holo', '', 12.4, 1, 8.7], karrigan: ['karrigan', 5, 'faze', 72, 'base', '', 7.9, 1, 5.2],
      },
      роль: ['', 'Снайпер', 'Райфлер', 'Райфлер', 'Опорный', 'Капитан'],
      нетКарты: 'HeavyGod и rain',
      приз: 'm0nesy',
      итог: { win: 'g2', sc: '2:0', fb: 'g2' },
      fb: 'Пистолетка на Mirage', fbЖив: 'G2, раунд 1', голоса: { win: 55, sc: { '2:0': 33, '2:1': 29 }, fb: 52 },
      примеры: { pre: { slots: [null, null, 'malbsmd', null, null] }, after: { slots: ['m0nesy', 'frozen', 'malbsmd', 'elige', 'snax'], cap: 'm0nesy', win: 'g2', sc: '2:0', fb: 'g2' } },
      линия: {
        pre: { бк: [['Букмекер A', 1.70, 2.12], ['Букмекер B', 1.74, 2.05], ['Букмекер C', 1.68, 2.15]], ход: [1.85, 1.84, 1.80, 1.78, 1.79, 1.75, 1.73, 1.74], откр: [1.85, 1.95], модель: 61, мин: 1.6, макс: 1.95, от: 'Открытие · 1.85', когда: '3 дня назад' },
        live: { бк: [['Букмекер A', 1.40, 2.90], ['Букмекер B', 1.42, 2.84], ['Букмекер C', 1.39, 2.95]], ход: [1.74, 1.70, 1.66, 1.58, 1.55, 1.50, 1.46, 1.42], откр: [1.74, 2.15], модель: 70, мин: 1.3, макс: 1.8, от: 'До старта · 1.74', когда: 'начало Mirage' },
      },
      рынки: [['Фора G2 −1.5', '2.55', 'FaZe +1.5', '1.50'], ['Тотал карт больше 2.5', '2.10', 'Меньше 2.5', '1.72'], ['Пистолетка Mirage · G2', '1.85', 'FaZe', '1.90']],
      зашло: { a: true, b: false, m0a: true, m0b: false, m1a: false, m1b: true, m2a: true, m2b: false },
      livePod: 'Mirage · раунд 17 · меняются каждый раунд',
      форма: { g2: 'WWWLW', faze: 'LWLLW' }, рейтинг: { g2: '5-е в рейтинге · форма 4 из 5', faze: '9-е в рейтинге · форма 2 из 5' },
      встречи: [3, 2, 'Последняя — 2 : 0 G2, 22 августа'],
      составы: 'Вето карт — за 15 минут до старта. Карты, график раундов и игрок карты появятся здесь с началом матча.',
      эфир: {
        шанс: 66, счёт: '10 : 6', под: 'раунды 10 : 6 · экономика $24 900 : $11 300',
        тик: [['Раунды', '10 : 6', 'Mirage · вторая половина'], ['Раунды подряд', '3 · G2', 'лучшая серия карты'], ['Экономика', '$24 900', 'у G2 · у FaZe $11 300'], ['Лучший', 'm0NESY', '14–6 · рейтинг 1.58']],
        лента: [['Р16', 'a', 'm0NESY — эйс с AWP', 'big'], ['Р15', 'a', 'G2 выиграли форс-раунд', ''], ['Р14', 'b', 'FaZe взяли второй раунд подряд', ''], ['Р13', 'b', 'Пистолетка второй половины — FaZe', ''], ['Р12', 'a', 'G2 закрыли первую половину 8 : 4', ''], ['Р6', 'a', 'huNter- — клатч 1 на 2', 'big'], ['Р1', 'a', 'Пистолетка — G2', ''], ['00:00', '', 'Mirage — карта 1 началась', 'sys']],
        р: 'AABABAAABAABBBAA', до: 16,
        лучший: ['m0NESY', '14–6 · AWP · рейтинг 1.58'],
        kv: [['Раунды', '10 : 6'], ['Пистолетки', '1 : 1'], ['Клатчи', '1 : 0'], ['Эйсы', '1 : 0']],
        подпись: 'выбор G2 · раунды 10 : 6 · график растёт каждый раунд', знаки: '● пистолетка · ◎ клатч · ✦ эйс',
        карты: [['Inferno', 'выбор FaZe', 'начнётся после Mirage'], ['Ancient', 'если 1 : 1', 'будет, если серия станет 1 : 1']],
        ведут: 'G2 ведут Mirage',
      },
    },
  }

  // ——— Ссылка: игра и состояние; старые значения Match Center — синонимы ———
  const q = new URLSearchParams(location.search)
  const g = СЕРИИ[q.get('game')] ? q.get('game') : 'dota'
  const СОСТ = { pre: 'pre', draft: 'pre', live: 'live', live1: 'live', break: 'live', live2: 'live', done: 'done' }
  const m = СЕРИИ[g], d = Д[g]
  const кор = (k) => d.кор[k] || имя(k)

  // ——— Что сделал зритель: до матча — начал собирать пятёрку; в эфире и после — всё сделал до старта ———
  const ST = { st: СОСТ[q.get('state')] || 'live', tab: null, map: 0, bet: null, src: 0, feed: false, remind: null }
  const пусто = { slots: [null, null, null, null, null], cap: null, win: null, sc: null, fb: null, savedF: false, savedP: false, seenOdds: false }
  Object.assign(ST, structuredClone(пусто), structuredClone(ST.st === 'pre' ? d.примеры.pre : { ...d.примеры.after, savedF: true, savedP: true, seenOdds: true }))
  const открыта = () => ST.tab || (ST.st === 'pre' ? 'r' : 'm') // по умолчанию: до — Награды, в эфире и после — Статистика

  const п = (id) => { const [ник, pos, к, ovr, r, ф, очки, есть, итог] = d.игроки[id]; return { id, ник, pos, к, ovr, r, ф, очки, есть: !!есть, итог } }
  const ДРУЗЬЯ = [['Kostya_D', 1840], ['mirra', 1620], ['Вы', 1490, 1], ['tolik.exe', 1310], ['Sasha K', 990]]

  // Мини-карта «Жетон» — разметка компонента сайта ([=== Карта «Хайперглитч» ===], обёртка .hg); у команд без логотипа — плашка с кодом
  const сила = (ovr) => (ovr >= 90 ? 'elite' : ovr >= 75 ? 'gold' : ovr >= 60 ? 'silver' : 'bronze')
  const карта = (id, w = 110) => {
    const x = п(id), есть = !!К[x.к][1]
    const маска = (cl, deco = '') => (есть ? `<i class="logo-mask ${cl}" data-l="2"${deco} style="--logo: url('img/teams/${x.к}.png')"></i>` : '')
    const spark = x.r === 'prism' ? '<i class="fx fx-spark" data-l="4"><b></b><b></b><b></b><b></b><b></b><b></b></i>' : ''
    const ph = `img/players/${x.ф ? x.ф + '.webp' : '_silhouette.png'}`
    return `<span class="hg"><span class="kc mk kc--${сила(x.ovr)} kc--${x.r} m3" data-tilt style="--w: ${w}px"><span class="kc__in"><span class="kc__face"><span class="mk-plate">${маска('mk-logo')}${маска('mk-logo mk-logo--a', ' data-deco="2"')}${маска('mk-logo mk-logo--b', ' data-deco="2"')}`
      + `<i class="mk-pix" data-deco="1"></i><i class="mk-halo"></i><img class="ph${x.ф ? '' : ' ph--sil'}" data-l="5" src="${ph}" alt="${x.ник}" /><i class="mk-scan" data-deco="3"></i><i class="fx fx-shine" data-l="4"></i>${spark}`
      + `<span class="m3__band"><span class="m3__pos">P${x.pos}</span><span class="m3__nick">${x.ник}</span></span><span class="m3__foot"><b>${имя(x.к)}</b></span></span>`
      + `<svg class="mk-frame" viewBox="0 0 160 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="14,1 159,1 159,181 140,199 1,199 1,14" /></svg>`
      + `<span class="m3__tab">${есть ? `<img class="logo" src="img/teams/${x.к}.png" alt="" />` : `<b class="mp-tab-mono">${К[x.к][2]}</b>`}</span><span class="m3__ovr"><b>${x.ovr}</b></span><i class="fx fx-glare"></i></span></span></span></span>`
  }

  // ——— Часы: до старта 2 ч 25 мин, состав закрывается за 10 мин до старта; в эфире Dota — карта 1 идёт с 24:15 ———
  const СТАРТ = 2 * 3600 + 25 * 60, ЗАКР = СТАРТ - 600, КАРТА0 = 24 * 60 + 15, t0 = Date.now()
  const прошло = () => Math.floor((Date.now() - t0) / 1000)
  const чмс = (s) => (s <= 0 ? '00:00:00' : [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':'))
  const мс = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const чм = (s) => (s <= 0 ? '0:00' : `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}`)
  const текст = (что) => (что === 'map' ? мс(КАРТА0 + прошло()) : что === 'hm' ? чм(СТАРТ - прошло()) : чмс((что === 'lock' ? ЗАКР : СТАРТ) - прошло()))
  const часы = (что) => `<b data-clk="${что}">${текст(что)}</b>`
  // Отсчёт до следующего матча: дни и часы далеко, ч:м:с меньше суток
  const отсчёт = (s) => {
    if (s <= 0) return 'идёт'
    const дн = Math.floor(s / 86400), ч = Math.floor((s % 86400) / 3600), мн = Math.floor((s % 3600) / 60), с = s % 60
    return дн ? `через ${дн} д ${ч} ч` : `через ${ч}:${String(мн).padStart(2, '0')}:${String(с).padStart(2, '0')}`
  }
  setInterval(() => {
    root.querySelectorAll('[data-clk]').forEach((e) => { e.textContent = текст(e.dataset.clk) })
    root.querySelectorAll('[data-cd]').forEach((e) => { e.textContent = отсчёт(+e.dataset.cd - прошло()) })
  }, 1000)
  // Что идёт в эфире: Dota — карта 1 и живые часы, CS — Mirage и раунд
  const cs = g === 'cs'
  const жив = (кор_ = false) => (cs ? `${кор_ ? '' : 'Mirage · '}раунд 17` : `${кор_ ? '' : 'Карта 1 · '}${часы('map')}`)

  // ——— Коэффициенты ———
  const лучш = (L) => [Math.max(...L.бк.map((r) => r[1])), Math.max(...L.бк.map((r) => r[2]))]
  const рынок = (L) => { const [a, b] = лучш(L); return Math.round((100 / a) / (1 / a + 1 / b)) }
  const ценность = (L) => Math.round((L.модель / 100 * лучш(L)[0] - 1) * 1000) / 10
  const к2 = (v) => v.toFixed(2)

  // ——— Подсчёты по тому, что сделано ———
  const вСоставе = () => ST.slots.filter(Boolean).length
  const прогнозОчков = () => ST.slots.reduce((s, id) => s + (id ? п(id).очки * (id === ST.cap ? 1.5 : 1) : 0), 0)
  const итогОчков = () => ST.slots.reduce((s, id) => s + (id ? п(id).итог * (id === ST.cap ? 1.5 : 1) : 0), 0)
  const ответов = () => [ST.win, ST.sc, ST.fb].filter(Boolean).length
  const сохрФ = () => ST.savedF && вСоставе() === 5
  const ЖИВ = 0.45 // какая часть итоговых очков набрана к этому моменту эфира
  const живые = (id) => п(id).итог * ЖИВ * (id === ST.cap ? 1.5 : 1)
  const живыеОчки = () => (сохрФ() ? ST.slots.reduce((s, id) => s + живые(id), 0) : 0)
  const приз = п(d.приз)
  const ЦЕЛИ = () => {
    const состав = сохрФ(), кап = ST.cap ? п(ST.cap).итог * 1.5 : 0
    return [
      ['50', 'Собрать пятёрку из игроков матча', '50 монет', состав, состав, 'f', 'Собрать пятёрку'],
      ['100', 'Сделать прогноз на матч', '100 монет', ST.savedP, ST.savedP, 'p', 'Сделать прогноз'],
      ['20', 'Сравнить коэффициенты букмекеров', '20 монет', ST.seenOdds, ST.seenOdds, 'p', 'Открыть коэффициенты'],
      ['card', 'Капитан наберёт 15+ очков', `Карта ${приз.ник} · Holo`, false, состав && кап >= 15, 'f', 'Выбрать капитана'],
    ] // [значок, условие, приз, выполнено до матча, выполнено по итогу, куда ведёт, кнопка]
  }
  const угадано = () => (ST.savedP ? [['win', ST.win === d.итог.win, 100], ['sc', ST.win === d.итог.win && ST.sc === d.итог.sc, 150], ['fb', ST.fb === d.итог.fb, 50]] : [])

  // ——— Общие кусочки ———
  const ЦВ = { f: 'var(--c-accent)', p: 'var(--c-stat-mid)', r: 'var(--c-coin)', tv: 'var(--c-live)', m: 'var(--c-text)' }
  const плитка = (id, tc, t, sub, em, низ, ok = false, доп = {}) => `<button type="button" class="mp-tile ${ok ? 'is-ok' : ''} ${доп.cls || ''}" data-tab="${id}" aria-selected="${открыта() === id}" style="--tc:${tc}">
    <span><b>${t}</b><small>${sub}</small>${ok ? '<i class="mp-ok">✓</i>' : ''}</span><em>${em}</em>${доп.prog ? `<span class="mp-prog">${Array.from({ length: доп.prog[1] }, (_, i) => `<i class="${i < доп.prog[0] ? 'is-on' : ''}"></i>`).join('')}</span>` : ''}<span class="mp-tile__w">${низ}</span></button>`
  const панели = (пары) => пары.map(([id, html]) => `<div data-pane="${id}"${открыта() === id ? '' : ' hidden'}>${html}</div>`).join('')
  const таймеры = `<div class="mp-clocks"><div class="mp-clock"><small>Матч начнётся через</small>${часы('start')}</div><div class="mp-clock is-warn"><small>Состав и прогнозы закроются через</small>${часы('lock')}</div></div>`
  const вкладки = (пары) => `<div class="mp-tabs" role="tablist">${пары.map(([id, t], i) => `<button type="button" data-tab="${id}" aria-selected="${!i}">${t}</button>`).join('')}</div>`
  const сек = (t, html) => `<section class="mp-sec">${t ? `<h3 class="mp-h">${t}</h3>` : ''}${html}</section>`
  const поб = () => (m.серия[0] > m.серия[1] ? 'a' : 'b')
  const пипы = (n, всего = 2) => `<span class="mp-pips">${Array.from({ length: всего }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`

  // ——— Коэффициенты — нижняя часть плитки «Прогнозы» ———
  const таблицаКоэф = (L) => { const Л = лучш(L)
    const ряд = (n, a, b) => `<tr><td>${n}</td><td><button type="button" class="mp-odd ${a === Л[0] ? 'is-best' : ''} ${ST.bet === n + 'a' ? 'is-on' : ''}" data-sa="bet" data-v="${n}a">${к2(a)}${a < L.откр[0] ? '<i>▼</i>' : ''}</button></td><td><button type="button" class="mp-odd ${b === Л[1] ? 'is-best' : ''} ${ST.bet === n + 'b' ? 'is-on' : ''}" data-sa="bet" data-v="${n}b">${к2(b)}${b > L.откр[1] ? '<i>▲</i>' : ''}</button></td></tr>`
    return `<table class="mp-otab"><thead><tr><th>Победа в серии</th><th>${лого(m.a, 'sm')} ${имя(m.a)}</th><th>${имя(m.b)} ${лого(m.b, 'sm')}</th></tr></thead><tbody>${L.бк.map(([n, a, b]) => ряд(n, a, b)).join('')}</tbody></table>` }
  const линияКоэф = (L) => { const W = 600, H = 120, xy = L.ход.map((v, i) => [Math.round((i / (L.ход.length - 1)) * W), Math.round(H - ((v - L.мин) / (L.макс - L.мин)) * H)])
    return `<div class="mp-oline"><p class="mp-sub"><b>Движение линии · ${имя(m.a)}</b><small>от ${L === d.линия.pre ? 'открытия' : 'начала матча'} до сейчас</small></p>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${xy.map((p_) => p_.join(',')).join(' ')}" /><circle cx="${xy.at(-1)[0]}" cy="${xy.at(-1)[1]}" r="5" /></svg>
      <p class="mp-oline__l"><span>${L.от}</span><span>${L.когда}</span><span>Сейчас · ${к2(L.ход.at(-1))}</span></p></div>` }
  const рынкиКоэф = () => `<div><p class="mp-sub"><b>Другие рынки</b><small>нажми — отметится</small></p>
    <div class="mp-mk">${d.рынки.map(([a, ka, b, kb], i) => `<p><button type="button" class="${ST.bet === 'm' + i + 'a' ? 'is-on' : ''}" data-sa="bet" data-v="m${i}a"><span>${a}</span><b>${ka}</b></button><button type="button" class="${ST.bet === 'm' + i + 'b' ? 'is-on' : ''}" data-sa="bet" data-v="m${i}b"><span>${b}</span><b>${kb}</b></button></p>`).join('')}</div></div>`
  const модельКоэф = (L) => { const МОД = L.модель, РЫН = рынок(L), ЦЕН = ценность(L)
    return `<div class="mp-card"><small>Модель против рынка</small>
      <div class="mp-vs"><p><span>Модель</span><i><b style="width:${МОД}%"></b></i><em>${МОД}%</em></p><p class="is-mk"><span>Рынок</span><i><b style="width:${РЫН}%"></b></i><em>${РЫН}%</em></p></div>
      <p class="mp-val ${ЦЕН < 0 ? 'is-neg' : ''}">Ценность ставки на ${кор(m.a)}<b>${ЦЕН > 0 ? '+' : ''}${ЦЕН}%</b></p><p class="mp-note">${ЦЕН < 0 ? `Линия уже ниже честной — ставить на ${кор(m.a)} сейчас невыгодно. ` : ''}Коэффициенты условные, без брендов. 18+</p></div>` }
  const блокКоэф = (L, h, под) => `<div class="mp-odds"><div class="mp-ph"><b>${h}</b><small>${под}</small></div>${таблицаКоэф(L)}${линияКоэф(L)}${L === d.линия.pre ? рынкиКоэф() : ''}</div>`

  // ——— НАГРАДЫ — вход во всё остальное; одна панель на три состояния, меняются только статусы целей ———
  const ДРУГОЕ = { f: 'Фэнтези', p: 'Прогнозы', m: 'Статистика' }
  const панельНаграды = () => {
    const ц = ЦЕЛИ(), кап = ST.cap && сохрФ() ? живые(ST.cap) : 0
    const статус = ([ic, , , доМатча, итог]) => {
      if (ST.st === 'pre') return доМатча ? '<em>✓ Выполнено</em>' : ic === 'card' ? '<em class="is-wait">Узнаем после матча</em>' : ''
      if (ST.st === 'live') {
        if (ic === 'card') return сохрФ() ? `<em class="is-wait">${п(ST.cap).ник}: ${кап.toFixed(1)} из 15 очков</em><span class="mp-bar" style="--p:${Math.min(100, (кап / 15) * 100)}%"></span>` : '<em class="is-bad">✗ состав не сохранили</em>'
        return доМатча ? `<em>✓ Выполнено${ic === '100' ? ' · очки — после матча' : ''}</em>` : '<em class="is-bad">✗ закрыто на старте</em>'
      }
      return итог ? '<em>✓ Получено</em>' : '<em class="is-bad">✗ Не получено</em>'
    }
    const кнопка = ([, , , доМатча, , куда, текст_]) => (ST.st === 'pre' && !доМатча ? `<button type="button" class="mp-go" data-open="${куда}">${текст_} ›</button>` : `<button type="button" class="mp-go is-quiet" data-open="${куда}">${ДРУГОЕ[куда]} ›</button>`)
    const сделано = (c) => (ST.st === 'done' ? c[4] : c[3])
    const готово = ц.filter(сделано).length, o = живыеОчки()
    const заголовок = { pre: ['Награды за матч · бесплатно', 'начни отсюда — каждая кнопка ведёт в свою часть страницы'], live: ['Награды · матч идёт', сохрФ() ? 'очки пятёрки копятся по ходу матча' : 'состав не сохранили до 16:50 — очки в лигу не идут'], done: ['Награды · что ты собрал и угадал', 'монеты пришли сразу, карта — по итогу матча'] }[ST.st]
    const большая = ST.st === 'live'
      ? `<div class="mp-card mp-big mp-big--coin"><small>Пятёрка в эфире</small><b>${o ? '+' + o.toFixed(1) : '0'}</b><span>${o ? 'Лига друзей: держишься на 3-м' : 'в следующий раз — состав до старта'}</span></div>`
      : `<div class="mp-card mp-big mp-big--coin"><small>${ST.st === 'pre' ? 'Выполнено' : 'Получено за матч'}</small><b>${готово}<small> из ${ц.length}</small></b><span>${готово === ц.length ? 'всё собрано' : `до 170 монет и карта ${приз.ник} · Holo`}</span></div>`
    return `<section class="mp-pane mp-pane--hero" style="--tc:${ЦВ.r}">
      <div class="mp-main">
        <div class="mp-ph"><b>${заголовок[0]}</b><small>${заголовок[1]}</small></div>
        <div class="mp-rw">${ц.map((c) => `<div class="${сделано(c) ? 'is-done' : ''}">${c[0] === 'card' ? `<span class="mp-mc">${карта(d.приз, 84)}</span>` : `<span class="mp-rw__ic">+${c[0]}</span>`}<span><b>${c[1]}</b><small>${c[2]}</small>${статус(c)}${кнопка(c)}</span></div>`).join('')}</div>
        <ol class="mp-road">${ц.map((c, i) => `<li class="${сделано(c) ? 'is-done' : ''}"><i>${сделано(c) ? '✓' : i + 1}</i><span>${c[1]}</span></li>`).join('')}</ol>
      </div>
      <aside class="mp-side">${большая}${ST.st === 'pre' ? `<div class="mp-card">${таймеры}</div>` : ''}
        <p class="mp-note">${ST.st === 'pre' ? 'Монеты за состав, прогноз и коэффициенты приходят сразу, карта — по итогу матча.' : 'Подробности — в плитках Фэнтези и Прогнозы.'}</p></aside></section>`
  }
  const плиткаНаград = () => {
    const ц = ЦЕЛИ(), n = ц.length, доп = (г) => ({ cls: 'mp-tile--hero', prog: [г, n] })
    if (ST.st === 'pre') { const г = ц.filter((c) => c[3]).length, след = ц.find((c) => !c[3])
      return плитка('r', ЦВ.r, 'Награды', 'за этот матч, бесплатно', `<span class="w">${г}</span> / ${n}`, след ? `дальше: ${след[6].toLowerCase()}` : 'всё собрано · карта — по итогу', г === n, доп(г)) }
    if (ST.st === 'live') { const г = ц.filter((c) => c[3]).length
      return плитка('r', ЦВ.r, 'Награды', 'в эфире', `<span class="w">${г}</span> / ${n}`, сохрФ() ? `карта ${приз.ник} — капитан набирает` : 'состав не сохранили', false, доп(г)) }
    const пол = ц.filter((c) => c[4]).length
    return плитка('r', ЦВ.r, 'Награды', 'что ты получил', `<span class="w">${пол}</span> / ${n}`, `получено наград ${пол} из ${n}`, пол === n, доп(пол))
  }

  // ——— ФЭНТЕЗИ: до — сборка, в эфире — очки копятся по игрокам, после — итог по игрокам ———
  const панельФэнтезиДо = () => {
    const в = вСоставе()
    const слот = (i) => { const id = ST.slots[i]
      if (!id) return `<div class="mp-slot is-empty"><span class="mp-slot__pos">P${i + 1}<em> · ${d.роль[i + 1]}</em></span><span class="mp-slot__ph">${i + 1}</span></div>`
      return `<div class="mp-slot"><span class="mp-slot__pos">P${i + 1}<em> · ${d.роль[i + 1]}</em></span><span class="mp-mc" data-sa="pick" data-v="${id}">${id === ST.cap ? '<span class="mp-capm">×1.5</span>' : ''}${карта(id, 104)}</span><button class="mp-cap" type="button" data-sa="cap" data-v="${id}" aria-pressed="${id === ST.cap}">${id === ST.cap ? 'Капитан' : '<em>Сделать капитаном</em><i>×1.5</i>'}</button></div>` }
    const ряд = (k) => `<div class="mp-pool__r"><p>${лого(k)}${имя(k)}</p>${Object.keys(d.игроки).filter((id) => п(id).к === k).map((id) => { const pl = п(id), on = ST.slots.includes(id)
      return `<button class="mp-pick ${on ? 'is-on' : ''}" type="button" data-sa="pick" data-v="${id}" ${pl.есть ? '' : 'disabled'}><span class="mp-mc">${on ? '<span class="mp-mine">✓</span>' : ''}${карта(id, 80)}</span><small>${pl.есть ? `прогноз <b>${pl.очки.toFixed(1)}</b>` : 'нет карты'}</small></button>` }).join('')}</div>`
    return `<section class="mp-pane" style="--tc:${ЦВ.f}">
      <div class="mp-main">
        <div class="mp-ph"><b>Фэнтези на матч · пятёрка из игроков этого матча</b><small>клик по игроку — в свой слот, капитан даёт ×1.5</small></div>
        <div class="mp-slots">${[0, 1, 2, 3, 4].map(слот).join('')}</div>
        <div class="mp-pool">${ряд(m.a)}${ряд(m.b)}</div>
      </div>
      <aside class="mp-side">
        <div class="mp-card">${таймеры}</div>
        <dl class="mp-kv"><div><dt>В составе</dt><dd>${в}<small>из 5</small></dd></div><div><dt>Прогноз очков</dt><dd>${прогнозОчков().toFixed(1)}</dd></div><div><dt>Капитан</dt><dd class="mp-dd-s">${ST.cap ? п(ST.cap).ник : '—'}</dd></div><div><dt>Лига друзей</dt><dd>3<small>-е место</small></dd></div></dl>
        <button class="mp-btn mp-btn--main mp-btn--lg mp-wide" type="button" data-sa="saveF" ${в === 5 && !ST.savedF ? '' : 'disabled'}>${сохрФ() ? '✓ Состав сохранён' : в === 5 ? 'Сохранить состав' : `Ещё ${5 - в} в состав`}</button>
        <p class="mp-note">Без своей карты игрока выбрать нельзя — ${d.нетКарты} пока не в коллекции.</p>
      </aside></section>`
  }
  const панельФэнтезиИдёт = () => {
    const идёт = ST.st === 'live', сохр = сохрФ(), очки = идёт ? живыеОчки() : (сохр ? итогОчков() : 0), набрала = итогОчков()
    const пятёрка = [0, 1, 2, 3, 4].map((i) => { const id = ST.slots[i]
      if (!id) return `<div class="mp-slot is-empty"><span class="mp-slot__pos">P${i + 1}</span><span class="mp-slot__ph">—</span><small class="mp-pts">не выбран</small></div>`
      const pl = п(id), o = идёт ? живые(id) : pl.итог * (id === ST.cap ? 1.5 : 1)
      return `<div class="mp-slot"><span class="mp-slot__pos">P${i + 1}<em> · ${d.роль[i + 1]}</em></span><span class="mp-mc">${id === ST.cap ? '<span class="mp-capm">×1.5</span>' : ''}${карта(id, 96)}</span><small class="mp-pts">${сохр ? `<b>+${o.toFixed(1)}</b> · ${идёт ? 'в эфире' : 'прогноз был ' + (pl.очки * (id === ST.cap ? 1.5 : 1)).toFixed(1)}` : 'не в лиге'}</small></div>` }).join('')
    const под = идёт ? (сохр ? 'очки обновляются по ходу матча' : 'состав не сохранили до 16:50 — очки в лигу не идут') : (сохр ? 'состав был сохранён до 16:50' : 'состав не сохранили до закрытия — очки не идут в лигу')
    return `<section class="mp-pane" style="--tc:${ЦВ.f}">
      <div class="mp-main">
        <div class="mp-ph"><b>Фэнтези · ${идёт ? 'пятёрка в эфире' : 'итог пятёрки'}</b><small>${под}</small></div>
        <div class="mp-slots">${пятёрка}</div>
      </div>
      <aside class="mp-side">
        <div class="mp-card mp-big"><small>${идёт ? 'Пятёрка в эфире' : 'Очки фэнтези за матч'}</small><b class="${очки ? 'up' : ''}">${очки ? '+' + очки.toFixed(1) : '0'}</b><span>${сохр ? (идёт ? 'Лига друзей: 3-е · до 2-го 4.6' : 'Лига друзей: 3-е → 2-е место') : набрала ? `пятёрка набрала бы +${набрала.toFixed(1)}` : 'состав не собран'}</span></div>
        <dl class="mp-kv"><div><dt>Капитан</dt><dd class="mp-dd-s">${ST.cap ? п(ST.cap).ник : '—'}</dd></div><div><dt>${идёт ? 'Карта' : 'Карт сыграно'}</dt><dd>${идёт ? '1<small>из 3</small>' : m.карты.filter((к) => к.сч).length}</dd></div></dl>
      </aside></section>`
  }
  const плиткаФэнтези = () => {
    const в = вСоставе(), сохр = сохрФ()
    if (ST.st === 'pre') return плитка('f', ЦВ.f, 'Фэнтези', 'пятёрка из игроков матча', `<span class="w">${в}</span> / 5`, сохр ? `состав сохранён · капитан ${п(ST.cap).ник}` : `в составе · закроется через&nbsp;${часы('lock')}`, сохр)
    if (ST.st === 'live') { const o = живыеОчки(); return плитка('f', ЦВ.f, 'Фэнтези', 'очки в эфире', `<span class="w">${o ? '+' + o.toFixed(1) : '0'}</span>`, сохр && ST.cap ? `пятёрка · капитан ${п(ST.cap).ник} ×1.5` : сохр ? 'пятёрка без капитана' : 'состав не сохранили') }
    const o = сохр ? итогОчков() : 0
    return плитка('f', ЦВ.f, 'Фэнтези', 'итог пятёрки', `<span class="w">${o ? '+' + o.toFixed(1) : '0'}</span>`, сохр ? 'лига друзей: 3-е → 2-е' : 'не в лиге', !!o)
  }

  // ——— ПРОГНОЗЫ (вместе с коэффициентами): сверху твой прогноз, ниже линия букмекеров и модель ———
  const ВОПРОС = { win: 'Кто выиграет серию', sc: 'Счёт серии', fb: d.fb }
  const ответ = (k) => ({ win: кор(ST.win), sc: ST.sc ? `${кор(ST.win)} ${ST.sc.replace(':', ' : ')}` : '—', fb: кор(ST.fb) })[k]
  const панельПрогнозы = () => {
    const опц = (k, v, html, em) => `<button class="mp-opt ${ST[k] === v ? 'is-on' : ''}" type="button" data-sa="q" data-k="${k}" data-v="${v}"><span>${html}</span><em>${em}</em></button>`
    const сч = ST.win ? ['2:0', '2:1'].map((v) => [v, `${кор(ST.win)} ${v.replace(':', ' : ')}`]) : []
    const уг = угадано(), плюсП = ST.st === 'done' ? уг.filter((u) => u[1]).reduce((s, u) => s + u[2], 0) : 0, Г = d.голоса
    let верх, h, под
    if (ST.st === 'pre') {
      h = 'Прогноз на матч · три вопроса'; под = 'до 300 очков в таблице турнира · проценты — как голосуют зрители'
      верх = `<div class="mp-qs">
        <div class="mp-q"><b>${ВОПРОС.win}</b><small>+100 очков</small><div class="mp-opts">${опц('win', m.a, лого(m.a, 'sm') + имя(m.a), Г.win + '%')}${опц('win', m.b, лого(m.b, 'sm') + имя(m.b), 100 - Г.win + '%')}</div></div>
        <div class="mp-q"><b>${ВОПРОС.sc}</b><small>+150 очков${ST.win ? '' : ' · сначала победитель'}</small><div class="mp-opts">${ST.win ? сч.map(([v, t]) => опц('sc', v, t, (Г.sc[v] || 20) + '%')).join('') : '<p class="mp-note">—</p>'}</div></div>
        <div class="mp-q"><b>${ВОПРОС.fb}</b><small>+50 очков</small><div class="mp-opts">${опц('fb', m.a, лого(m.a, 'sm') + кор(m.a), Г.fb + '%')}${опц('fb', m.b, лого(m.b, 'sm') + кор(m.b), 100 - Г.fb + '%')}</div></div></div>`
    } else if (ST.st === 'live') {
      h = 'Прогноз закрыт на старте'; под = ST.savedP ? `${cs ? 'пистолетка' : 'первая кровь'} уже решилась, победитель и счёт — после серии` : 'прогноз не сделан — в следующий раз до начала матча'
      const ход = { win: ST.win === m.a ? ['is-ok', `пока сходится · ${d.эфир.ведут}`] : ['is-bad', `пока против тебя · ${d.эфир.ведут}`], sc: ['', 'решится после карты 2'], fb: ST.fb === d.итог.fb ? ['is-ok', `✓ +50 · ${d.fbЖив}`] : ['is-bad', `✗ мимо · ${d.fbЖив}`] }
      верх = ST.savedP ? `<div class="mp-res3">${['win', 'sc', 'fb'].map((k) => `<p class="${ход[k][0]}"><span><small>${ВОПРОС[k]}</small><b>${ответ(k)}</b></span><em>${ход[k][1]}</em></p>`).join('')}</div>` : `<p class="mp-note">Три вопроса закрылись в 16:50. Голоса зрителей: ${кор(m.a)} ${Г.win}% · ${cs ? 'пистолетка' : 'первая кровь'} ${кор(m.a)} ${Г.fb}%.</p>`
    } else {
      h = 'Прогноз · что угадал'; под = ST.savedP ? `сравнили с результатом · +${плюсП} очков` : 'прогноз не сделан'
      верх = ST.savedP ? `<div class="mp-res3">${уг.map(([k, ok, o]) => `<p class="${ok ? 'is-ok' : 'is-bad'}"><span><small>${ВОПРОС[k]}</small><b>${ответ(k)}</b></span><em>${ok ? `✓ +${o}` : '✗ мимо'}</em></p>`).join('')}</div>` : '<p class="mp-note">В следующий раз — три вопроса до начала матча, до 300 очков.</p>'
    }
    // Низ — букмекеры: до — линия и рынки, в эфире — live-линия, после — закрытие линии и что зашло
    const Лп = лучш(d.линия.pre), w = поб()
    const низ = ST.st === 'pre' ? блокКоэф(d.линия.pre, 'Коэффициенты на серию', '3 букмекера · лучший — зелёным · обновлено минуту назад')
      : ST.st === 'live' ? блокКоэф(d.линия.live, 'Коэффициенты в эфире', d.livePod)
        : `<div class="mp-odds"><div class="mp-ph"><b>Закрытие линии · итог ${кор(m[w])} ${m.серия[0]} : ${m.серия[1]}</b><small>как закрылись коэффициенты на старте и что зашло</small></div>
        <div class="mp-mk mp-mk--res">${[[`Победа ${кор(m.a)}`, к2(Лп[0]), 'a'], [`Победа ${кор(m.b)}`, к2(Лп[1]), 'b'], ...d.рынки.flatMap(([a, ka, b, kb], i) => [[a, ka, 'm' + i + 'a'], [b, kb, 'm' + i + 'b']])].map(([t, k, id]) => { const ok = d.зашло[id], моя = !!ST.bet && (ST.bet === id || (id.length === 1 && ST.bet.startsWith('Букмекер') && ST.bet.endsWith(id)))
          return `<p class="${ok ? 'is-ok' : 'is-bad'} ${моя ? 'is-mine' : ''}"><span>${t}${моя ? ' · твоя отметка' : ''}</span><b>${k}</b><em>${ok ? '✓ зашло' : '✗'}</em></p>` }).join('')}</div></div>`
    const L = ST.st === 'live' ? d.линия.live : d.линия.pre
    const сбоку = ST.st === 'done'
      ? `<div class="mp-card mp-big"><small>Модель была права</small><b class="up">✓</b><span>давала ${кор(m.a)} ${d.линия.pre.модель}% при рынке ${рынок(d.линия.pre)}% · ценность была ${ценность(d.линия.pre) > 0 ? '+' : ''}${ценность(d.линия.pre)}%</span></div>`
      : модельКоэф(L)
    return `<section class="mp-pane" style="--tc:${ЦВ.p}">
      <div class="mp-main">
        <div class="mp-ph"><b>${h}</b><small>${под}</small></div>
        ${верх}
        ${низ}
      </div>
      <aside class="mp-side">
        ${ST.st === 'pre' ? `<button class="mp-btn mp-btn--main mp-btn--lg mp-wide" type="button" data-sa="saveP" ${ответов() === 3 && !ST.savedP ? '' : 'disabled'}>${ST.savedP ? '✓ Прогноз сохранён' : ответов() === 3 ? 'Сохранить прогноз' : 'Ответь на 3 вопроса'}</button>` : ''}
        <div class="mp-card"><small>Очки прогнозов турнира · друзья</small><div class="mp-board">${ДРУЗЬЯ.map(([n, o, я]) => [n, o + (я ? плюсП : 0), я]).sort((a, b) => b[1] - a[1]).map(([n, o, я], i) => `<p class="${я ? 'is-me' : ''}"><i>${i + 1}</i><span class="mp-ini">${n[0]}</span><span>${n}</span><b>${o.toLocaleString('ru-RU')}</b></p>`).join('')}</div></div>
        ${сбоку}
        <dl class="mp-kv"><div><dt>Лучший П1</dt><dd>${к2(лучш(L)[0])}</dd></div><div><dt>Лучший П2</dt><dd>${к2(лучш(L)[1])}</dd></div></dl>
      </aside></section>`
  }
  const плиткаПрогнозы = () => {
    const Л = лучш(ST.st === 'live' ? d.линия.live : d.линия.pre)
    if (ST.st === 'pre') return плитка('p', ЦВ.p, 'Прогнозы', 'и коэффициенты', `<span class="w">${ответов()}</span> / 3`, ST.savedP ? `${кор(ST.win)} ${ST.sc.replace(':', ' : ')} · линия ${к2(Л[0])} : ${к2(Л[1])}` : `до +300 очков · линия ${к2(Л[0])} : ${к2(Л[1])}`, ST.savedP)
    if (ST.st === 'live') return плитка('p', ЦВ.p, 'Прогнозы', 'закрыты · линия в эфире', `<span class="w">${к2(Л[0])}</span> : <span>${к2(Л[1])}</span>`, ST.savedP ? `${cs ? 'пистолетка' : 'первая кровь'} — ${ST.fb === d.итог.fb ? '✓ угадал' : '✗ мимо'}` : 'прогноз не сделан')
    const уг = угадано().filter((u) => u[1]).length
    return плитка('p', ЦВ.p, 'Прогнозы', 'и закрытие линии', `<span class="w">${уг}</span> / 3`, ST.savedP ? 'угадано · модель была права' : 'прогноз не сделан · модель была права', уг > 0)
  }

  // ——— СТАТИСТИКА: карты серии живут внутри плитки — свой маленький переключатель карт ———
  let нг = 0
  // Крупный график карты: Dota — разница нетворса по минутам, CS — разница раундов; события значками прямо на линии
  const график = (к) => {
    const dd = cs ? раунды(к.р) : к.ход, n = dd.length - 1, мин = parseInt(к.длит)
    const W = 1000, H = 360, mid = H / 2, max = Math.max(...dd.map(Math.abs), cs ? 4 : 10) * 1.18
    const X = (j) => (j / n) * W, Y = (v) => mid - (v / max) * (mid - 24)
    const линия = dd.map((v, j) => `${j ? 'L' : 'M'}${X(j).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')
    const area = `${линия} L${W} ${mid} L0 ${mid} Z`, id = `mp${g}n${++нг}`
    const на = (j) => { const a = Math.floor(j), b = Math.min(n, a + 1), t = j - a; return dd[a] + (dd[b] - dd[a]) * t }
    const точки = к.соб.map(([t, тип, k, s]) => {
      const j = Math.min(n, cs ? t : (t / мин) * n), v = на(j), left = (j / n) * 100, top = (Y(v) / H) * 100
      const кл = `${left < 18 ? 'is-l' : left > 82 ? 'is-r' : ''} ${top < 28 ? 'is-low' : ''}`
      return `<button type="button" class="mp-pt ${кл}" data-pt style="left:${left}%;top:${top}%;--tc:${ЦВЕТ[m[k]]}" aria-label="${s}">${ЗНАК[тип]}<span class="mp-tip"><time>${cs ? 'Раунд ' + t : t + '-я минута'}</time>${s}</span></button>`
    }).join('')
    const ось = cs ? [1, 6, 12, 18, 24].filter((r) => r <= n).map((r) => `<span style="left:${(r / n) * 100}%">${r}</span>`).join('') : [0, 10, 20, 30, 40].filter((t) => t <= мин).map((t) => `<span style="left:${(t / мин) * 100}%">${t}′</span>`).join('')
    return `<figure class="mp-ch" style="--ta:${ЦВЕТ[m.a]};--tb:${ЦВЕТ[m.b]}">
      <div class="mp-plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs><clipPath id="${id}t"><rect x="0" y="0" width="${W}" height="${mid}" /></clipPath><clipPath id="${id}b"><rect x="0" y="${mid}" width="${W}" height="${mid}" /></clipPath>
        <linearGradient id="${id}ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ta)" stop-opacity=".5" /><stop offset="1" stop-color="var(--ta)" stop-opacity="0" /></linearGradient>
        <linearGradient id="${id}gb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--tb)" stop-opacity=".5" /><stop offset="1" stop-color="var(--tb)" stop-opacity="0" /></linearGradient></defs>
        <line x1="0" y1="${mid}" x2="${W}" y2="${mid}" class="mp-ch__0" />
        <path d="${area}" fill="url(#${id}ga)" clip-path="url(#${id}t)" /><path d="${area}" fill="url(#${id}gb)" clip-path="url(#${id}b)" />
        <path d="${линия}" class="mp-ch__l mp-ch__l--a" clip-path="url(#${id}t)" /><path d="${линия}" class="mp-ch__l mp-ch__l--b" clip-path="url(#${id}b)" />
      </svg>${точки}</div>
      <div class="mp-ax">${ось}</div>
      <figcaption><span>${лого(m.a, 'sm')}${имя(m.a)} впереди</span><span>${cs ? 'разница раундов' : 'разница нетворса, тыс. золота'}</span><span>${имя(m.b)} впереди${лого(m.b, 'sm')}</span></figcaption></figure>`
  }
  const цифры = (к) => {
    const сколько = (тип, k) => к.соб.filter((e) => e[1] === тип && e[2] === k).length
    if (cs) return [['Раунды', `${к.сч[0]} : ${к.сч[1]}`], ['Длительность', к.длит], ['Пистолетки', `${сколько('pistol', 'a')} : ${сколько('pistol', 'b')}`], ['Клатчи', `${сколько('clutch', 'a')} : ${сколько('clutch', 'b')}`]]
    const пик = к.ход.reduce((a, v) => (Math.abs(v) > Math.abs(a) ? v : a), 0)
    return [['Убийства', `${к.сч[0]} : ${к.сч[1]}`], ['Длительность', к.длит], ['Макс. отрыв', `${Math.abs(пик).toFixed(1)}<small>тыс. · ${кор(m[пик >= 0 ? 'a' : 'b'])}</small>`], ['Рошаны', `${сколько('rosh', 'a')} : ${сколько('rosh', 'b')}`]]
  }
  // Пики героев по карте (Dota) или полоса раундов (CS)
  const подКартой = (к) => (cs
    ? `<div class="mp-rounds">${[...к.р].map((c, j) => `<i class="${c === 'A' ? 'a' : 'b'} ${j === 11 ? 'half' : ''}" title="Раунд ${j + 1}">${j + 1}</i>`).join('')}</div>`
    : `<div class="mp-picks">${['a', 'b'].map((k) => `<p>${лого(m[k], 'sm')}${к.пики[k].map((h) => гер(h)).join('')}</p>`).join('')}</div>`)
  // В эфире: идущая карта — тот же график, обрезан на текущем моменте
  const картаЖив = () => { const к = m.карты[0], е = d.эфир
    return cs ? { ...к, р: е.р, соб: к.соб.filter((x) => x[0] <= е.до && x[1] !== 'gg') } : { ...к, ход: е.ход, соб: к.соб.filter((x) => x[0] <= е.до && x[1] !== 'gg'), длит: е.до + ' мин' } }

  const мини = (i, tc, t, sub, em, низ, cls = '', off = false) => `<button type="button" class="mp-tile mp-mtile ${cls}" ${off ? 'disabled' : `data-tab="k${i}"`} aria-selected="${!off && ST.map === i}" style="--tc:${tc}"><span><b>${t}</b><small>${sub}</small></span><em>${em}</em><span class="mp-tile__w">${низ}</span></button>`
  const картаПанель = (i) => { const к = m.карты[i], [n, , строка] = к.mvp
    return `<div class="mp-mpane"><div class="mp-main">
        <div class="mp-ph"><b>${к.n} · ${имя(m[к.поб])} взяли ${к.сч[0]} : ${к.сч[1]}</b><small>${к.под} · ${к.длит}</small></div>
        ${график(к)}
        <p class="mp-hint">Наведи или нажми на значок на линии — что случилось. ${cs ? '● пистолетка · ◎ клатч · ✦ эйс · ★ конец' : '⚔ драка · ◆ Рошан · ▲ башня · ★ конец'}</p>
        <div class="mp-under">${подКартой(к)}</div></div>
      <aside class="mp-side"><div class="mp-pl" style="--tc:${ЦВЕТ[m[к.поб]]}"><small>Игрок карты</small><img src="${фото(n)}" alt="" /><b>${n}</b><em>${строка}</em></div>
        <dl class="mp-kv">${цифры(к).map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl></aside></div>` }
  const картаЖивПанель = () => { const е = d.эфир, к = картаЖив()
    return `<div class="mp-mpane"><div class="mp-main">
        <div class="mp-ph"><b>${к.n} · идёт ${cs ? 'раунд 17' : часы('map')}</b><small>${е.подпись}</small></div>
        <div class="mp-livech">${график(к)}<i class="mp-now" aria-hidden="true"></i></div>
        <p class="mp-hint">Наведи или нажми на значок на линии — что случилось. ${е.знаки}</p>
        <div class="mp-under">${подКартой(к)}</div></div>
      <aside class="mp-side"><div class="mp-pl" style="--tc:${ЦВЕТ[m.a]}"><small>Лучший на карте сейчас</small><img src="${фото(е.лучший[0])}" alt="" /><b>${е.лучший[0]}</b><em>${е.лучший[1]}</em></div>
        <dl class="mp-kv">${е.kv.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl></aside></div>` }
  const ждём = (n, когда) => `<div class="mp-mpane mp-mpane--wait"><div class="mp-main"><div class="mp-ph"><b>${n} ещё не началась</b><small>${когда}</small></div>
      <p class="mp-wait">Здесь появятся счёт карты, график ${cs ? 'раундов' : 'нетворса'} со значками событий и игрок карты — как у карты 1.</p></div>
      <aside class="mp-side"><button type="button" class="mp-btn mp-btn--main mp-btn--lg mp-wide" data-sa="remind" data-v="${n}">${ST.remind === n ? '✓ Напомним' : 'Напомнить о начале'}</button></aside></div>`
  const картыВнутри = (кнопки, html) => `<div data-tabs class="mp-mtk"><div class="mp-mtiles">${кнопки}</div>${html.map((h, i) => (h ? `<div data-pane="k${i}"${ST.map === i ? '' : ' hidden'}>${h}</div>` : '')).join('')}</div>`
  const точкиФормы = (s) => `<span class="mp-form">${[...s].map((c) => `<i class="${c === 'W' ? 'w' : 'l'}"></i>`).join('')}</span>`
  const шансДо = () => { const L = d.линия.pre
    return `<div class="mp-chance"><p><span>${лого(m.a, 'sm')}${имя(m.a)}</span><b>${L.модель}%</b><b class="l">${100 - L.модель}%</b><span>${имя(m.b)}${лого(m.b, 'sm')}</span></p><i style="--p:${L.модель}%"></i><small>шанс победы в серии по модели · рынок ${рынок(L)}%</small></div>` }
  // Что дальше и прогнозы на следующий раунд (после матча)
  const дальше = (j = 0) => { const [k, соп, стадия, когда, сек_] = m.дальше[j]
    return `<a href="match-center.html" class="mp-next" style="--tc:${ЦВЕТ[m[k]]}"><small>${стадия}</small>
      <span class="mp-next__m">${лого(m[k], 'lg')}<b>${имя(m[k])}</b><i>vs</i><b>${имя(соп)}</b>${лого(соп, 'lg')}</span>
      <span class="mp-next__t"><em data-cd="${сек_}">${отсчёт(сек_)}</em><small>${когда}</small></span></a>` }
  const прогнозыДальше = () => `<div class="mp-pred">${m.прогнозы.map(([пара, дт, p]) => { const [a, b] = пара.split(' — ')
    return `<div class="mp-pred__r"><p><b>${пара}</b><small>${дт} · голосуй до начала</small></p><div class="mp-pred__b"><button type="button" data-vote>${a}<em>${p}%</em></button><button type="button" data-vote>${b}<em>${100 - p}%</em></button></div></div>` }).join('')}</div>`
  // Полная таблица игроков серии (Dota: герои, У/С/П, GPM, XPM, нетворс; CS: У–С, ±, ADR, KAST, HS, рейтинг)
  const таблица = (k) => {
    const пб = поб() === k
    const head = cs ? ['У–С', '±', 'ADR', 'KAST', 'HS', 'Рейтинг'] : ['Герои', 'У / С / П', 'GPM', 'XPM', 'Нетворс']
    const ряды = m.игроки[k].map((p_) => {
      const mvp = m.mvp === p_[0]
      const cells = cs
        ? [`${p_[3]}–${p_[4]}`, `<span class="${p_[3] - p_[4] >= 0 ? 'up' : 'dn'}">${p_[3] - p_[4] > 0 ? '+' : ''}${p_[3] - p_[4]}</span>`, p_[5], p_[6] + '%', p_[7] + '%', `<b class="${p_[8] >= 1.1 ? 'up' : p_[8] < 0.95 ? 'dn' : ''}">${p_[8].toFixed(2)}</b>`]
        : [`<span class="mp-tb__h">${p_[2].map((h) => гер(h, 'mp-hero-s')).join('')}</span>`, `${p_[3]} / ${p_[4]} / ${p_[5]}`, p_[6], p_[7], `<b>${p_[8]} тыс.</b>`]
      return `<tr class="${mvp ? 'is-mvp' : ''}"><td>${ава(p_[0])}<span><b>${p_[0]}</b>${mvp ? '<em class="mp-mvp">MVP</em>' : ''}<small>${p_[1]}</small></span></td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
    }).join('')
    return `<table class="mp-tb"><thead><tr><th>${лого(m[k], 'sm')}${имя(m[k])}<span class="mp-tb__res ${пб ? 'w' : 'l'}">${пб ? 'Победа' : 'Поражение'}</span></th>${head.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${ряды}</tbody></table>`
  }

  const панельСтат = () => {
    if (ST.st === 'pre') {
      const кн = m.карты.map((к, i) => мини(i, 'var(--c-ui-dim)', `Карта ${i + 1}`, i === 2 ? 'если 1 : 1' : cs ? 'после вето' : 'с началом матча', '— : —', 'карты появятся с началом', 'is-wait', true)).join('')
      const [ва, вб, последняя] = d.встречи
      return `<section class="mp-pane mp-stat" style="--tc:${ЦВ.m}">
        <div class="mp-main">
          <div class="mp-ph"><b>Статистика · превью</b><small>${m.тур} · ${m.стадия} · ${m.bo} · победитель — в «${m.сетка.стало}»</small></div>
          <div class="mp-mtiles">${кн}</div>
          <div class="mp-pre">
            <div class="mp-q"><b>Форма · последние 5</b>${[m.a, m.b].map((k) => `<p class="mp-fr">${лого(k, 'sm')}<span>${имя(k)}</span>${точкиФормы(d.форма[k])}<b>${[...d.форма[k]].filter((c) => c === 'W').length} из 5</b></p>`).join('')}</div>
            <div class="mp-q"><b>Личные встречи · ${ва + вб}</b><div class="mp-h2h"><i style="--p:${Math.round((ва / (ва + вб)) * 100)}%"></i></div><p class="mp-fr mp-fr--2"><span>${имя(m.a)} · ${ва}</span><span class="r">${вб} · ${имя(m.b)}</span></p><small>${последняя}</small></div>
            <div class="mp-q"><b>${cs ? 'Составы и вето' : 'Составы и пики'}</b><small>${d.составы}</small></div>
          </div>
        </div>
        <aside class="mp-side">${шансДо()}<div class="mp-card">${таймеры}</div></aside></section>` }
    if (ST.st === 'live') {
      const к0 = m.карты[0], е = d.эфир
      const кн = мини(0, ЦВ.tv, к0.n, 'идёт', `<span class="w">${е.счёт.split(' : ')[0]}</span> : ${е.счёт.split(' : ')[1]}`, cs ? `раунд 17 · ${к0.под}` : `<b>${часы('map')}</b> · +4.2 тыс. у Spirit`, 'mp-tile--live')
        + е.карты.map(([n, sub], i) => мини(i + 1, 'var(--c-ui-dim)', n, sub, '— : —', i ? 'решающая' : `после ${cs ? 'Mirage' : 'карты 1'}`, 'is-wait')).join('')
      return `<section class="mp-stat mp-maps">${картыВнутри(кн, [картаЖивПанель(), ...е.карты.map(([n, , когда]) => ждём(n, когда))])}</section>` }
    const кн = m.карты.map((к, i) => (к.сч
      ? мини(i, ЦВЕТ[m[к.поб]], к.n, к.под, `<span class="${к.поб === 'a' ? 'w' : ''}">${к.сч[0]}</span> : <span class="${к.поб === 'b' ? 'w' : ''}">${к.сч[1]}</span>`, `${лого(m[к.поб], 'sm')}${имя(m[к.поб])} · ${к.длит}`)
      : мини(i, 'var(--c-ui-dim)', к.n, к.под, '—', 'не понадобилась', 'is-wait', true))).join('')
    return `<section class="mp-stat mp-maps">${картыВнутри(кн, m.карты.map((к, i) => (к.сч ? картаПанель(i) : '')))}
      <div class="mp-more">
        <div data-tabs class="mp-more__t">${вкладки([['t1', 'Таблица серии · ' + имя(m.a)], ['t2', имя(m.b)]])}<div class="mp-more__p"><div data-pane="t1">${таблица('a')}</div><div data-pane="t2" hidden>${таблица('b')}</div></div></div>
        <div class="mp-g2">${сек('Что дальше', дальше(0))}${сек('Прогнозы на следующий раунд', прогнозыДальше())}</div>
      </div></section>`
  }
  const плиткаСтат = () => {
    if (ST.st === 'pre') return плитка('m', ЦВ.m, 'Статистика', `${m.bo} · превью`, `<span class="w">${часы('hm')}</span>`, 'до начала · форма, встречи, шанс')
    if (ST.st === 'live') return плитка('m', ЦВ.tv, 'Статистика', `идёт · ${cs ? 'Mirage' : 'карта 1'}`, '<span class="w">0 : 0</span>', `${жив()} · ${d.эфир.счёт}`, false, { cls: 'mp-tile--live' })
    const w = поб()
    return плитка('m', ЦВЕТ[m[w]], 'Статистика', `серия · ${m.карты.filter((к) => к.сч).length} карты`, `<span class="${w === 'a' ? 'w' : ''}">${m.серия[0]}</span> : <span class="${w === 'b' ? 'w' : ''}">${m.серия[1]}</span>`, `${лого(m[w], 'sm')}${имя(m[w])} · ${m.длит}`)
  }

  // ——— Шапка: до — время и отсчёт, в эфире — эфир, после — счёт серии. Короткое имя — для компактной шапки телефона ———
  const ПЛОЩАДКИ = ['Twitch · RU 12 тыс.', 'YouTube · EN 8 тыс.', 'Kick 2 тыс.', 'Без звука комментатора']
  const эфир = () => { const е = d.эфир
    return `<section class="mp-pane mp-live-top" style="--tc:${ЦВ.tv}">
      <div class="mp-main">
        <div class="mp-tv" style="--ta:${ЦВЕТ[m.a]};--tb:${ЦВЕТ[m.b]}">
          <div class="mp-tv__top"><span class="mp-gt">${m.игра}</span><b>${m.тур}</b><span>${m.стадия} · ${m.bo}</span><span class="mp-pill-live">${жив()}</span><span class="mp-tv__v">22 тыс. смотрят</span></div>
          <button type="button" class="mp-tv__play" aria-label="Смотреть">▶</button>
          <div class="mp-hud"><span class="mp-hud__t">${лого(m.a)}<b>${имя(m.a)}</b></span><span class="mp-hud__c"><b>0 : 0</b><em>${жив()}</em><small>${е.под}</small></span><span class="mp-hud__t"><b>${имя(m.b)}</b>${лого(m.b)}</span></div>
          <div class="mp-src">${ПЛОЩАДКИ.map((t, i) => `<button type="button" class="${ST.src === i ? 'is-on' : ''}" data-sa="src" data-v="${i}">${t}</button>`).join('')}</div>
        </div>
        <p class="mp-pscore"><span>${лого(m.a, 'sm')}<b>${кор(m.a)}</b></span><span class="mp-pscore__c"><b>0 : 0</b><em>${жив()}</em></span><span><b>${кор(m.b)}</b>${лого(m.b, 'sm')}</span></p>
        <dl class="mp-tick">${[['Шанс победы', е.шанс + '%', `<i class="mp-bar" style="--p:${е.шанс}%"></i>`], ...е.тик].map(([t, v, s]) => `<div><dt>${t}</dt><dd>${v}</dd>${s.startsWith('<') ? s : `<small>${s}</small>`}</div>`).join('')}</dl>
      </div>
      <aside class="mp-side mp-feed ${ST.feed ? 'is-open' : ''}">
        <button type="button" class="mp-feed__t" data-feed aria-expanded="${ST.feed}"><span>Лента «Что происходит» · ${е.лента.length}</span><i>${ST.feed ? '▴' : '▾'}</i></button>
        <p class="mp-feed__h"><b>Что происходит</b><small><i class="mp-dot"></i>в эфире</small></p>
        <ol class="mp-log">${е.лента.map(([t, k, s, кл]) => `<li class="${кл ? 'is-' + кл : ''}"><time>${t}</time>${k ? лого(m[k], 'sm') : '<i class="mp-log__sys"></i>'}<span>${s}</span></li>`).join('')}</ol>
        <div class="mp-chance"><p><span>${лого(m.a, 'sm')}${имя(m.a)}</span><b>${е.шанс}%</b><b class="l">${100 - е.шанс}%</b><span>${имя(m.b)}${лого(m.b, 'sm')}</span></p><i style="--p:${е.шанс}%"></i><small>шанс победы в серии · ${cs ? 'по раундам и экономике' : 'по золоту, башням и героям'}</small></div>
      </aside></section>` }
  const имя2 = (k) => `<span class="mp-nm">${имя(k)}</span><span class="mp-sn">${кор(k)}</span>`
  const шапкаДо = () => `<header class="mp-top" style="--ta:${ЦВЕТ[m.a]};--tb:${ЦВЕТ[m.b]}">
      <div class="mp-team">${лого(m.a)}<span><b>${имя2(m.a)}</b><small>${d.рейтинг[m.a]}</small></span></div>
      <div class="mp-c"><p>${m.тур} · ${m.стадия} · ${m.bo}</p><b class="mp-time">17:00</b><span class="mp-res mp-res--pre">${m.дата} · МСК · через&nbsp;${часы('start')}</span></div>
      <div class="mp-team">${лого(m.b)}<span><b>${имя2(m.b)}</b><small>${d.рейтинг[m.b]}</small></span></div></header>`
  const шапкаПосле = () => { const w = поб()
    return `<header class="mp-top" style="--ta:${ЦВЕТ[m.a]};--tb:${ЦВЕТ[m.b]};--tw:${ЦВЕТ[m[w]]}">
      <div class="mp-team ${w === 'a' ? '' : 'is-l'}">${лого(m.a)}<span><b>${имя2(m.a)}</b><small>${w === 'a' ? 'победа' : 'поражение'} · ${пипы(m.серия[0])}</small></span></div>
      <div class="mp-c"><p>${m.тур} · ${m.стадия}</p><b><span class="${w === 'a' ? '' : 'l'}">${m.серия[0]}</span><i>:</i><span class="${w === 'b' ? '' : 'l'}">${m.серия[1]}</span></b><span class="mp-res">Завершён · ${m.дата} · ${m.длит}</span></div>
      <div class="mp-team ${w === 'b' ? '' : 'is-l'}">${лого(m.b)}<span><b>${имя2(m.b)}</b><small>${w === 'b' ? 'победа' : 'поражение'} · ${пипы(m.серия[1])}</small></span></div></header>` }

  // ——— Телефон: вместо плиток — сегмент на 4 пункта (те же data-tab), у Наград — бейдж прогресса ———
  const сегмент = () => {
    const ц = ЦЕЛИ(), г = ц.filter((c) => (ST.st === 'done' ? c[4] : c[3])).length, откр = открыта()
    const ПУНКТЫ = [['m', 'Статистика', ST.st === 'live' ? ЦВ.tv : ЦВ.m], ['r', 'Награды', ЦВ.r], ['f', 'Фэнтези', ЦВ.f], ['p', 'Прогнозы', ЦВ.p]]
    return `<nav class="mp-seg" aria-label="Разделы матча"><div class="mp-seg__in">${ПУНКТЫ.map(([id, t, tc]) => `<button type="button" class="mp-sg mp-sg--${id}" data-tab="${id}" aria-selected="${откр === id}" style="--tc:${tc}">${id === 'm' && ST.st === 'live' ? '<i class="mp-dot"></i>' : ''}${t}${id === 'r' ? `<i class="mp-sg__b">${г}/${ц.length}</i>` : ''}</button>`).join('')}</div></nav>`
  }

  // ——— Страница: шапка → 4 плитки на одних местах → открытая плитка ———
  const draw = () => {
    const шапка = ST.st === 'pre' ? шапкаДо() : ST.st === 'live' ? эфир() : шапкаПосле()
    const плитки = плиткаСтат() + плиткаНаград() + плиткаФэнтези() + плиткаПрогнозы()
    const фэнтези = ST.st === 'pre' ? панельФэнтезиДо() : панельФэнтезиИдёт()
    root.innerHTML = `<p class="mp-crumbs"><a href="match-center.html">Match Center</a> / ${m.тур} / ${имя(m.a)} — ${имя(m.b)}</p>
      <div class="mp-body">${шапка}<div data-tabs class="mp-tk">${сегмент()}<div class="mp-tiles">${плитки}</div>${панели([['m', панельСтат()], ['r', панельНаграды()], ['f', фэнтези], ['p', панельПрогнозы()]])}</div>${window.БЛОКИ_МАТЧА ? `<div class="mpo">${window.БЛОКИ_МАТЧА}</div>` : ''}</div>`
    // Наклон и блик мини-карт — как app.js сайта [Карточка: наклон и блик]
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) root.querySelectorAll('.kc[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`); card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
        card.style.setProperty('--dx', (px - 0.5).toFixed(3)); card.style.setProperty('--dy', (py - 0.5).toFixed(3)); card.classList.add('is-on') })
      card.addEventListener('pointerleave', () => { card.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach((v) => card.style.removeProperty(v)) })
    })
  }

  // ——— Действия ———
  const ДЕЙСТВИЯ = {
    pick: (el) => { const id = el.dataset.v, i = п(id).pos - 1; ST.slots[i] = ST.slots[i] === id ? null : id; if (ST.cap && !ST.slots.includes(ST.cap)) ST.cap = null; ST.savedF = false },
    cap: (el) => { ST.cap = ST.cap === el.dataset.v ? null : el.dataset.v; ST.savedF = false },
    saveF: () => { ST.savedF = true },
    q: (el) => { ST[el.dataset.k] = el.dataset.v; if (el.dataset.k === 'win') ST.sc = null; ST.savedP = false },
    saveP: () => { ST.savedP = true },
    bet: (el) => { ST.bet = ST.bet === el.dataset.v ? null : el.dataset.v },
    src: (el) => { ST.src = +el.dataset.v },
    remind: (el) => { ST.remind = ST.remind === el.dataset.v ? null : el.dataset.v },
  }
  // Сегмент телефона прилип к верху: при смене раздела возвращаем начало раздела под него
  const кНачалу = () => { const tk = root.querySelector('.mp-tk'), seg = root.querySelector('.mp-seg'); if (!tk || !seg || getComputedStyle(seg).display === 'none') return
    const y = tk.getBoundingClientRect().top + scrollY - 8; if (scrollY > y) scrollTo({ top: y }) }
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-feed]')) { ST.feed = !ST.feed; draw(); return }
    // Плитка ряда или пункт сегмента: запоминаем выбор; панели переключаем на месте
    const t = e.target.closest('[data-tab]')
    if (t) {
      const box = t.closest('[data-tabs]')
      if (box.classList.contains('mp-tk')) {
        ST.tab = t.dataset.tab
        if (t.dataset.tab === 'p' && ST.st === 'pre' && !ST.seenOdds) { ST.seenOdds = true; draw(); кНачалу(); return }
        if (t.closest('.mp-seg')) кНачалу()
      } else if (box.classList.contains('mp-mtk')) ST.map = +t.dataset.tab.slice(1)
      box.querySelectorAll('[data-tab]').forEach((b) => { if (b.closest('[data-tabs]') === box) b.setAttribute('aria-selected', b.dataset.tab === t.dataset.tab) })
      box.querySelectorAll('[data-pane]').forEach((p_) => { if (p_.closest('[data-tabs]') === box) p_.hidden = p_.dataset.pane !== t.dataset.tab })
      return
    }
    // Кнопка из «Наград» — открыть свою плитку
    const o = e.target.closest('[data-open]')
    if (o) { ST.tab = o.dataset.open; if (o.dataset.open === 'p' && ST.st === 'pre') ST.seenOdds = true; draw(); кНачалу(); return }
    const a = e.target.closest('[data-sa]')
    if (a && ДЕЙСТВИЯ[a.dataset.sa] && !a.disabled) { e.preventDefault(); ДЕЙСТВИЯ[a.dataset.sa](a); draw(); return }
    const v = e.target.closest('[data-vote]')
    if (v) { v.parentElement.querySelectorAll('[data-vote]').forEach((b) => b.classList.toggle('is-on', b === v)); return }
    // Значок события на графике: подпись остаётся открытой (на телефоне нет наведения)
    const p_ = e.target.closest('[data-pt]')
    root.querySelectorAll('[data-pt].is-on').forEach((x) => { if (x !== p_) x.classList.remove('is-on') })
    if (p_) p_.classList.toggle('is-on')
  })

  document.title = `${имя(m.a)} — ${имя(m.b)} · ${m.тур}`
  draw()
})()
