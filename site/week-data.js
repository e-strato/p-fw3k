// Данные недели матчей — общие для постера главной (home-poster.js) и дней Match Center (app.js [Match Center]).
// Вынесено из home-poster.js (дирижёр 08.10, задача «Все матчи дня → Match Center с выбранным днём»). Данные условные:
// вторник 6 октября, сейчас 15:35. ДНИ — 7 дней полосы постера (пн 5 – вс 11); ВС_4 — ещё воскресенье 4-го, оно есть только в Match Center.
window.НЕДЕЛЯ = (() => {
  const ИГРЫ = { dota: 'Dota 2', cs: 'CS2', lol: 'LoL', val: 'Valorant', mlbb: 'MLBB' }
  // Команда: имя, файл логотипа (если есть), монограмма, цвет постера (светлым командам — второй цвет, чтобы постер не был серым)
  const К = {
    ts: ['Team Spirit', 'ts', 'TS', 'var(--c-poster-ts)'], tun: ['Tundra Esports', 'tun', 'TUN', 'var(--c-team-tun)'], gg: ['Gaimin Gladiators', 'gg', 'GG', 'var(--c-team-gg)'],
    pv: ['PARIVISION', 'pv', 'PV', 'var(--c-team-pv)'], flc: ['Team Falcons', 'flc', 'FLC', 'var(--c-team-flc)'], tl: ['Team Liquid', 'tl', 'TL', 'var(--c-team-tl)'],
    aur: ['Aurora', 'aur', 'AUR', 'var(--c-team-aur)'], bb: ['BetBoom Team', 'bb', 'BB', 'var(--c-team-bb)'], yg: ['Yangon Galacticos', 'yg', 'YG', 'var(--c-team-yg)'],
    xip: ['Xipto Esports', 0, 'XIP', 'var(--c-team-xip)'], ive: ['Ivory', 0, 'IVR', 'var(--c-team-ive)'],
    vit: ['Team Vitality', 0, 'VIT', 'var(--c-team-vit)'], mgz: ['The MongolZ', 0, 'MGZ', 'var(--c-team-mgz)'], navi: ['Natus Vincere', 0, 'NAVI', 'var(--c-team-navi)'],
    mouz: ['MOUZ', 0, 'MZ', 'var(--c-team-mouz)'], g2: ['G2 Esports', 0, 'G2', 'var(--c-poster-g2)'], faze: ['FaZe Clan', 0, 'FZ', 'var(--c-team-faze)'],
    t1: ['T1', 0, 'T1', 'var(--c-team-t1)'], gen: ['Gen.G', 0, 'GEN', 'var(--c-team-gen)'], fnc: ['Fnatic', 0, 'FNC', 'var(--c-team-fnc)'], blg: ['Bilibili Gaming', 0, 'BLG', 'var(--c-team-blg)'],
    sen: ['Sentinels', 0, 'SEN', 'var(--c-team-sen)'], prx: ['Paper Rex', 0, 'PRX', 'var(--c-team-prx)'], loud: ['LOUD', 0, 'LOUD', 'var(--c-team-loud)'],
    nrg: ['NRG', 0, 'NRG', 'var(--c-poster-nrg)'], edg: ['EDward Gaming', 0, 'EDG', 'var(--c-poster-edg)'],
    onic: ['ONIC', 0, 'ON', 'var(--c-team-onic)'], evos: ['EVOS', 0, 'EV', 'var(--c-team-evos)'], rrq: ['RRQ Hoshi', 0, 'RRQ', 'var(--c-team-rrq)'], ae: ['Alter Ego', 0, 'AE', 'var(--c-team-ae)'],
  }
  const ЭФИР = ['live', 'draft', 'pause', 'break']
  const ДЛИНА = { Bo1: 60, Bo2: 120, Bo3: 150, Bo5: 240 }

  // Матч: игра, команды, начало в минутах от полуночи, состояние, турнир, стадия, прочее
  const мк = (g, a, b, t, st, тур, стадия, extra = {}) => Object.assign({ g, a, b, t, st, тур, стадия, bo: 'Bo3', id: a + '-' + b + '-' + t }, extra)
  const СЕГОДНЯ = [
    мк('dota', 'ts', 'tun', 14 * 60, 'live', 'BLAST Slam VIII', 'Полуфинал верхней', { sa: 1, sb: 0, карта: 2, главный: true }),
    мк('dota', 'gg', 'pv', 14 * 60 + 30, 'pause', 'BLAST Slam VIII', 'Нижняя сетка', { sa: 0, sb: 1, карта: 2 }),
    мк('cs', 'vit', 'mgz', 14 * 60, 'live', 'ESL Pro League S24', 'Группа C', { sa: 1, sb: 0, карта: 2 }),
    мк('cs', 'g2', 'faze', 13 * 60, 'break', 'ESL Pro League S24', 'Группа C', { sa: 1, sb: 1, карта: 3 }),
    мк('lol', 't1', 'gen', 15 * 60 + 20, 'draft', 'Worlds 2026', 'Раунд 3 · 1–1', { sa: 0, sb: 0, карта: 1, bo: 'Bo1' }),
    мк('cs', 'navi', 'mouz', 15 * 60 + 50, 'delay', 'ESL Pro League S24', 'Группа C', { было: '15:00' }),
    мк('dota', 'flc', 'tl', 17 * 60, 'soon', 'BLAST Slam VIII', 'Полуфинал верхней', { мой: 2 }),
    мк('lol', 'fnc', 'blg', 19 * 60, 'soon', 'Worlds 2026', 'Раунд 3 · 1–1', { bo: 'Bo1' }),
    мк('mlbb', 'onic', 'evos', 20 * 60, 'soon', 'MPL Indonesia S18', 'Неделя 7'),
    мк('dota', 'yg', 'xip', 21 * 60, 'soon', 'EPL World Series SEA S18', 'Верхняя сетка'),
    мк('dota', 'ive', 'yg', 23 * 60 + 30, 'soon', 'EPL World Series SEA S18', 'Нижняя сетка'),
    мк('dota', 'aur', 'bb', 11 * 60, 'done', 'BLAST Slam VIII', 'Нижняя сетка', { sa: 2, sb: 0 }),
    мк('val', 'prx', 'loud', 11 * 60, 'done', 'VCT Champions 2026', 'Нижняя сетка', { sa: 2, sb: 1 }),
    мк('val', 'nrg', 'edg', 13 * 60, 'moved', 'VCT Champions 2026', 'Нижняя сетка', { заметка: 'Перенесён на 8 окт, 12:00 — у EDG задержали визы' }),
    мк('mlbb', 'rrq', 'ae', 21 * 60 + 30, 'cancel', 'MPL Indonesia S18', 'Неделя 7', { заметка: 'Отменён: Alter Ego снялись с сезона' }),
  ]
  const ДНИ = [
    { d: 'Пн', n: 5, k: 31, past: true, м: [
      мк('dota', 'flc', 'aur', 13 * 60, 'done', 'BLAST Slam VIII', 'Четвертьфинал верхней', { sa: 2, sb: 1 }), мк('dota', 'tl', 'pv', 17 * 60, 'done', 'BLAST Slam VIII', 'Четвертьфинал верхней', { sa: 2, sb: 0 }), мк('cs', 'vit', 'g2', 15 * 60, 'done', 'ESL Pro League S24', 'Группа C', { sa: 2, sb: 0 }),
      мк('lol', 'gen', 'fnc', 17 * 60, 'done', 'Worlds 2026', 'Раунд 2', { sa: 1, sb: 0, bo: 'Bo1' }), мк('val', 'sen', 'loud', 19 * 60, 'done', 'VCT Champions 2026', 'Верхняя сетка', { sa: 1, sb: 2 }),
      мк('mlbb', 'rrq', 'evos', 20 * 60, 'done', 'MPL Indonesia S18', 'Неделя 7', { sa: 2, sb: 0 })] },
    { d: 'Вт', n: 6, k: 38, today: true, м: СЕГОДНЯ },
    { d: 'Ср', n: 7, k: 26, м: [мк('dota', 'ts', 'flc', 14 * 60, 'soon', 'BLAST Slam VIII', 'Финал верхней', { если: 'Если Spirit пройдут Tundra' }), мк('cs', 'vit', 'navi', 16 * 60 + 30, 'soon', 'ESL Pro League S24', 'Группа C'),
      мк('lol', 't1', 'blg', 18 * 60, 'soon', 'Worlds 2026', 'Раунд 4'), мк('mlbb', 'onic', 'rrq', 20 * 60, 'soon', 'MPL Indonesia S18', 'Неделя 7')] },
    { d: 'Чт', n: 8, k: 24, м: [мк('val', 'nrg', 'edg', 12 * 60, 'soon', 'VCT Champions 2026', 'Нижняя сетка', { если: 'Перенесён сюда со вторника' }), мк('dota', 'tl', 'gg', 15 * 60, 'soon', 'BLAST Slam VIII', 'Нижняя сетка'), мк('cs', 'faze', 'mouz', 18 * 60, 'soon', 'ESL Pro League S24', 'Группа C')] },
    { d: 'Пт', n: 9, k: 19, м: [мк('dota', 'aur', 'pv', 15 * 60, 'soon', 'BLAST Slam VIII', 'Нижняя сетка'), мк('lol', 'gen', 't1', 19 * 60, 'soon', 'Worlds 2026', 'Раунд 5')] },
    { d: 'Сб', n: 10, k: 30, м: [мк('dota', 'ts', 'tl', 14 * 60, 'soon', 'BLAST Slam VIII', 'Финал нижней', { если: 'Пары определятся в пятницу' }), мк('val', 'prx', 'sen', 17 * 60, 'soon', 'VCT Champions 2026', 'Финал нижней', { bo: 'Bo5' })] },
    { d: 'Вс', n: 11, k: 12, м: [мк('dota', 'ts', 'flc', 16 * 60, 'soon', 'BLAST Slam VIII', 'Гранд-финал', { bo: 'Bo5', если: 'Пары определятся в субботу' })] },
  ]
  const ВС_4 = { d: 'Вс', n: 4, k: 22, past: true, м: [
    мк('dota', 'ts', 'bb', 13 * 60, 'done', 'BLAST Slam VIII', 'Четвертьфинал верхней', { sa: 2, sb: 0 }), мк('dota', 'tun', 'gg', 17 * 60, 'done', 'BLAST Slam VIII', 'Четвертьфинал верхней', { sa: 2, sb: 1 }), мк('cs', 'navi', 'g2', 15 * 60, 'done', 'ESL Pro League S24', 'Группа C', { sa: 0, sb: 2 }),
    мк('lol', 'blg', 't1', 17 * 60, 'done', 'Worlds 2026', 'Раунд 1', { sa: 1, sb: 0, bo: 'Bo1' }), мк('mlbb', 'evos', 'ae', 19 * 60, 'done', 'MPL Indonesia S18', 'Неделя 6', { sa: 2, sb: 1 })] }
  return { ИГРЫ, К, ЭФИР, ДЛИНА, ДНИ, ВС_4 }
})()
