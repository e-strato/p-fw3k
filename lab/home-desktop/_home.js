// Лаба «Главная — первый экран, десктоп»: общие данные и кусочки для v1–v4.
// Данные — те же, что в лабе «Все матчи» (_matches.js): вторник 6 октября, сейчас 15:35, 5 игр. Часы идут по-настоящему —
// от 15:35:00 плюс секунды с открытия страницы, поэтому таймеры тикают, а близкий матч считает минуты и секунды.
// Язык подачи — из исследования «Игровые клиенты» (внутренняя документация/research-game-clients): «скоро» — таймером,
// который дробится по мере приближения; «сейчас» — словом и действием.
(() => {
  const ИГРЫ = { dota: 'Dota 2', cs: 'CS2', lol: 'LoL', val: 'Valorant', mlbb: 'MLBB' }
  // Команды: имя, файл логотипа (если есть), короткое имя для монограммы, цвет команды
  const К = {
    ts: ['Team Spirit', 'ts', 'TS', 'var(--c-team-ts)'], tun: ['Tundra Esports', 'tun', 'TUN', 'var(--c-team-tun)'], gg: ['Gaimin Gladiators', 'gg', 'GG', 'var(--c-team-gg)'],
    pv: ['PARIVISION', 'pv', 'PV', 'var(--c-team-pv)'], flc: ['Team Falcons', 'flc', 'FLC', 'var(--c-team-flc)'], tl: ['Team Liquid', 'tl', 'TL', 'var(--c-team-tl)'],
    aur: ['Aurora', 'aur', 'AUR', 'var(--c-team-aur)'], bb: ['BetBoom Team', 'bb', 'BB', 'var(--c-team-bb)'], yg: ['Yangon Galacticos', 'yg', 'YG', 'var(--c-team-yg)'],
    xip: ['Xipto Esports', 0, 'XIP', 'var(--c-team-xip)'], ive: ['Ivory', 0, 'IVR', 'var(--h-team-ive)'],
    vit: ['Team Vitality', 0, 'VIT', 'var(--h-team-vit)'], mgz: ['The MongolZ', 0, 'MGZ', 'var(--h-team-mgz)'], navi: ['Natus Vincere', 0, 'NAVI', 'var(--h-team-navi)'],
    mouz: ['MOUZ', 0, 'MZ', 'var(--h-team-mouz)'], g2: ['G2 Esports', 0, 'G2', 'var(--h-team-g2)'], faze: ['FaZe Clan', 0, 'FZ', 'var(--h-team-faze)'],
    t1: ['T1', 0, 'T1', 'var(--h-team-t1)'], gen: ['Gen.G', 0, 'GEN', 'var(--h-team-gen)'], fnc: ['Fnatic', 0, 'FNC', 'var(--h-team-fnc)'], blg: ['Bilibili Gaming', 0, 'BLG', 'var(--h-team-blg)'],
    sen: ['Sentinels', 0, 'SEN', 'var(--h-team-sen)'], prx: ['Paper Rex', 0, 'PRX', 'var(--h-team-prx)'], loud: ['LOUD', 0, 'LOUD', 'var(--h-team-loud)'],
    nrg: ['NRG', 0, 'NRG', 'var(--h-team-nrg)'], edg: ['EDward Gaming', 0, 'EDG', 'var(--h-team-edg)'],
    onic: ['ONIC', 0, 'ON', 'var(--h-team-onic)'], evos: ['EVOS', 0, 'EV', 'var(--h-team-evos)'], rrq: ['RRQ Hoshi', 0, 'RRQ', 'var(--h-team-rrq)'], ae: ['Alter Ego', 0, 'AE', 'var(--h-team-ae)'],
  }

  // Турниры дня. t — начало в минутах от полуночи; st — состояние, как в Match Center
  const ТУРНИРЫ = [
    { id: 'blast', g: 'dota', имя: 'BLAST Slam VIII', место: 'Мальта', фонд: '$1 000 000', тир: 'S', конец: '11 окт',
      стадии: [['Группы', '1–3 окт', 'done'], ['Плей-офф', '4–10 окт', 'now'], ['Финал', '11 окт', '']], день: 'Плей-офф · день 3 из 7',
      матчи: [
        { st: 'done', a: 'aur', b: 'bb', sa: 2, sb: 0, t: 11 * 60, bo: 'Bo3', стадия: 'Четвертьфинал' },
        { st: 'live', a: 'ts', b: 'tun', sa: 1, sb: 0, t: 14 * 60, карта: 2, часы: '24:15', bo: 'Bo3', стадия: 'Полуфинал верхней', главный: true },
        { st: 'pause', a: 'gg', b: 'pv', sa: 0, sb: 1, t: 14 * 60 + 30, карта: 2, часы: '6 мин', bo: 'Bo3', стадия: 'Нижняя сетка', заметка: 'техническая пауза' },
        { st: 'soon', a: 'flc', b: 'tl', t: 17 * 60, bo: 'Bo3', стадия: 'Полуфинал верхней', мой: 2 },
      ] },
    { id: 'epl', g: 'cs', имя: 'ESL Pro League S24', место: 'Мальта', фонд: '$850 000', тир: 'S', конец: '19 окт',
      стадии: [['Группы', '1–12 окт', 'now'], ['Плей-офф', '15–18 окт', ''], ['Финал', '19 окт', '']], день: 'Группа C · день 2',
      матчи: [
        { st: 'live', a: 'vit', b: 'mgz', sa: 1, sb: 0, t: 14 * 60, карта: 2, часы: 'Mirage · 7:5', bo: 'Bo3', стадия: 'Группа C' },
        { st: 'break', a: 'g2', b: 'faze', sa: 1, sb: 1, t: 13 * 60, карта: 3, через: '4 мин', bo: 'Bo3', стадия: 'Группа C' },
        { st: 'delay', a: 'navi', b: 'mouz', t: 15 * 60 + 50, было: '15:00', bo: 'Bo3', стадия: 'Группа C', заметка: 'задержан на 50 минут: прошлый матч ушёл в третью карту' },
      ] },
    { id: 'worlds', g: 'lol', имя: 'Worlds 2026', место: 'Сан-Франциско', фонд: '$5 000 000', тир: 'S', конец: '9 ноя',
      стадии: [['Швейцарка', '1–11 окт', 'now'], ['Плей-офф', '17–26 окт', ''], ['Финал', '9 ноя', '']], день: 'Швейцарка · раунд 3',
      матчи: [
        { st: 'draft', a: 't1', b: 'gen', sa: 0, sb: 0, t: 15 * 60 + 20, карта: 1, bo: 'Bo1', стадия: 'Раунд 3 · 1–1' },
        { st: 'soon', a: 'fnc', b: 'blg', t: 19 * 60, bo: 'Bo1', стадия: 'Раунд 3 · 1–1' },
      ] },
    { id: 'vct', g: 'val', имя: 'VCT Champions 2026', место: 'Париж', фонд: '$2 250 000', тир: 'S', конец: '12 окт',
      стадии: [['Группы', '27 сен – 3 окт', 'done'], ['Плей-офф', '4–11 окт', 'now'], ['Финал', '12 окт', '']], день: 'Плей-офф · нижняя сетка',
      матчи: [
        { st: 'done', a: 'prx', b: 'loud', sa: 2, sb: 1, t: 11 * 60, bo: 'Bo3', стадия: 'Нижняя сетка' },
        { st: 'moved', a: 'nrg', b: 'edg', t: 13 * 60, новое: '8 окт, 12:00', bo: 'Bo3', стадия: 'Нижняя сетка', заметка: 'перенесён: у EDward Gaming задержали визы' },
      ] },
    { id: 'mpl', g: 'mlbb', имя: 'MPL Indonesia S18', место: 'Джакарта', фонд: '$300 000', тир: 'A', конец: '30 ноя',
      стадии: [['Сезон', '15 авг – 26 окт', 'now'], ['Плей-офф', '19–30 ноя', '']], день: 'Регулярный сезон · неделя 7',
      матчи: [
        { st: 'soon', a: 'onic', b: 'evos', t: 20 * 60, bo: 'Bo3', стадия: 'Неделя 7' },
        { st: 'cancel', a: 'rrq', b: 'ae', t: 21 * 60 + 30, bo: 'Bo3', стадия: 'Неделя 7', заметка: 'отменён: Alter Ego снялись с сезона' },
      ] },
    { id: 'epl-sea', g: 'dota', имя: 'EPL World Series SEA S18', место: 'онлайн', фонд: '$50 000', тир: 'B', конец: '12 окт',
      стадии: [['Группы', '28 сен – 4 окт', 'done'], ['Плей-офф', '5–12 окт', 'now']], день: 'Плей-офф',
      матчи: [
        { st: 'soon', a: 'yg', b: 'xip', t: 21 * 60, bo: 'Bo3', стадия: 'Верхняя сетка' },
        { st: 'soon', a: 'ive', b: 'yg', t: 23 * 60 + 30, bo: 'Bo3', стадия: 'Нижняя сетка' },
      ] },
  ]
  const ВСЕ = ТУРНИРЫ.flatMap(tr => tr.матчи.map(m => Object.assign(m, { g: tr.g, тур: tr.имя, тид: tr.id, id: m.a + '-' + m.b })))
  const ЭФИР = ['live', 'draft', 'pause', 'break']
  const СКОРО = ['soon', 'delay']

  // Часы: 15:35:00 + реальные секунды с открытия
  const СТАРТ = 15 * 3600 + 35 * 60, t0 = Date.now()
  const сейчас = () => СТАРТ + Math.floor((Date.now() - t0) / 1000)
  const чч = n => String(n).padStart(2, '0')
  const время = мин => `${чч(Math.floor(мин / 60) % 24)}:${чч(мин % 60)}`
  // Таймер дробится по мере приближения: «через 4 ч 25 мин» → «через 52 мин» → «14:59»
  const доСтарта = мин => {
    const s = мин * 60 - сейчас()
    if (s <= 0) return { txt: 'начинается', short: '0:00', s: 0 }
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60
    if (s >= 3600) return { txt: `через ${h} ч ${m} мин`, short: `${h}:${чч(m)}:${чч(sec)}`, s, far: true }
    return { txt: `через ${m} мин`, short: `${m}:${чч(sec)}`, s }
  }

  const имя = id => К[id][0]
  const цвет = id => К[id][3]
  const лого = (id, size = 24, cls = '') => {
    const t = К[id]
    return t[1]
      ? `<img class="h-lg ${cls}" style="--s:${size}px" src="/p-fw3k/site/img/teams/${t[1]}.png" alt="" />`
      : `<span class="h-lg h-lg--mono ${cls}" style="--s:${size}px; --tc:${t[3]}">${t[2]}</span>`
  }
  const тег = g => `<span class="h-gt h-gt--${g}">${ИГРЫ[g]}</span>`
  // Статус словами — коротко, для карточек «идёт сейчас»
  const статус = m => ({
    live: `<b class="h-live"><i class="h-dot"></i>Карта ${m.карта}</b> · ${m.часы}`,
    draft: `<b class="h-live"><i class="h-dot"></i>Драфт</b> · карта ${m.карта}`,
    pause: `<b class="h-warn">Пауза</b> · ${m.часы}`,
    break: `<b class="h-warn">Перерыв</b> · карта ${m.карта} через ${m.через}`,
    soon: `${время(m.t)}`,
    delay: `<s>${m.было}</s> ${время(m.t)} · задержан`,
    moved: `Перенесён на ${m.новое}`,
    cancel: 'Отменён',
    done: 'Итог',
  })[m.st]

  const шапка = (активна = 'Матчи') => `<header class="ui-header">
      <div class="ui-header__in">
        <div class="ui-header__top">
          <a class="ui-header__brand" href="#">Fantasy · Dota 2</a>
          <div class="btn-row ui-header__game" role="group" aria-label="Игра"><button class="btn btn--quiet btn--xs" type="button" aria-pressed="true">Dota</button><button class="btn btn--quiet btn--xs" type="button" aria-pressed="false">LoL</button></div>
          <div class="ui-header__coins"><span>Монеты</span><b>1 000</b><button class="btn btn--quiet btn--sm" type="button">Забрать +50</button></div>
        </div>
        <nav class="ui-tabs ui-header__nav" aria-label="Разделы">
          ${['Главная', 'Матчи', 'Match Center', 'Состав', 'Бустеры', 'Коллекция', 'Квесты', 'Лидеры', 'История', 'Как это работает']
            .map(n => `<a class="ui-tabs__a" href="#" ${n === активна ? 'aria-current="page"' : ''}>${n}</a>`).join('')}
        </nav>
      </div>
    </header>`

  // Тикеры: элементы с data-tick="минуты старта" перерисовываются раз в секунду
  const тик = () => document.querySelectorAll('[data-tick]').forEach(el => {
    const d = доСтарта(+el.dataset.tick)
    el.textContent = el.dataset.mode === 'short' ? d.short : d.txt
  })
  setInterval(тик, 1000)

  // Рамка 1440 уменьшается под ширину окна — как в лабе «Все матчи»
  const вписать = () => document.querySelectorAll('.h-wrap').forEach(w => { w.firstElementChild.style.zoom = Math.min(1, w.clientWidth / 1440) })
  addEventListener('resize', вписать)

  window.H = { ИГРЫ, К, ТУРНИРЫ, ВСЕ, ЭФИР, СКОРО, сейчас, время, доСтарта, имя, цвет, лого, тег, статус, шапка, тик, вписать }
})()
