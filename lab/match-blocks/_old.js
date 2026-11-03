// Копия website/match-page.js на 07.10 (коммит 0a13967, v5 «Эфир сверху») — для лабы match-blocks: из неё берём блоки под эфиром.
// Изменено только: корень [data-mpo] и состояния нового сайта (pre / live / done).
// Страница матча (blocks/screens/match-page.html, страница match-page.html; дирижёр 07.10: перенос лабы «Страница матча» v5 «Эфир сверху»).
// Один матч в шести моментах — что показать, берём из ссылки: ?game=dota|cs&state=pre|draft|live1|break|live2|done (Match Center ставит их по строке).
// Данные условные (Dota — Spirit — Tundra, CS — G2 — FaZe). Стили — styles.css [=== Страница матча ===], раскладка — container query «mp» (телефон — до 700px).
;(() => {
  const root = document.querySelector('[data-mpo]')
  if (!root) return
  const ИГРОКИ = {
    ts: ['Yatoro', 'Larl', 'Collapse', 'rue', 'Miposhka'], tun: ['Crystallis', 'bzm', '33', 'Saksa', 'Whitemon'],
    g2: ['huNter-', 'malbsMd', 'm0NESY', 'Snax', 'HeavyGod'], faze: ['karrigan', 'rain', 'frozen', 'broky', 'EliGE'],
  }
  const игроки = (id) => ИГРОКИ[id]
  const кольцо = (p, t) => `<span class="mpx-ring" style="--p:${p}"><b>${p}%</b><small>${t}</small></span>`
  const точки = (s) => `<span class="mpr-form">${[...s].map((c) => `<i class="${c === 'W' ? 'w' : 'l'}"></i>`).join('')}</span>`

  // Преимущество по золоту — столбики по минутам (как hawk / dltv): вверх — первая команда, вниз — вторая
  const ЗОЛОТО = [0, 0.3, 0.5, 0.2, -0.4, -0.6, -0.3, 0.2, 0.8, 1.4, 1.9, 1.5, 1.1, 1.6, 2.3, 2.9, 3.4, 3.1, 3.8, 4.2]
  const график = (m, h, { мин = 20 } = {}) => {
    const v = ЗОЛОТО.slice(0, мин), max = 5
    return `<div class="mpx-gold"><div class="mpx-gold__bars">${v.map((x) => `<i class="${x >= 0 ? 'up' : 'dn'}" style="--h:${Math.round((Math.abs(x) / max) * 50)}%"></i>`).join('')}</div>
      <p class="mpx-gold__l"><span>${h.лого(m.a, 'sm')} +4.2 тыс.</span><span>${мин * 1.2 | 0}:15</span></p></div>`
  }

  const R = {
    игроки, точки, график,
    // Шапка до матча (dltv): форма точками и три кольца
    показатели: (m, h) => `<div class="mpx-stats">${['a', 'b'].map((k, j) => `<div class="mpx-st"><p>${h.лого(m[k])}<b>${h.имя(m[k])}</b>${точки(j ? 'LWWLL' : 'WWLWW')}</p>
      <div class="mpx-rings">${кольцо(j ? 47 : 62, 'победы')}${кольцо(j ? 38 : 55, 'первая кровь')}${кольцо(j ? 41 : 58, 'первые 10')}</div></div>`).join('')}</div>`,
    // Сильные и слабые стороны (bo3 «Analytics insights»)
    инсайты: (m, h) => `<div class="mpx-ins">${['a', 'b'].map((k, j) => `<div><p class="mpx-ins__h">${h.лого(m[k], 'sm')}${h.имя(m[k])}</p>
      <p class="ok">${j ? 'Сильны в затяжных играх: 60% побед после 40-й минуты' : 'Выиграли 4 из 5 последних, все — 2:0 или 2:1'}</p>
      <p class="ok">${j ? 'Лучший мидер турнира по KDA' : 'Лучшая команда группы по первой крови — 55%'}</p>
      <p class="no">${j ? 'Проиграли 3 последние встречи с топ-8' : 'Слабо закрывают игры: 3 камбэка против них'}</p></div>`).join('')}</div>`,
    // Прогноз счёта голосами (bo3 «Score predict»)
    прогноз: (m, h, bo = 3) => {
      const v = bo === 1 ? [['Победа ' + h.имя(m.a), 58], ['Победа ' + h.имя(m.b), 42]] : [['2 : 0', 31], ['2 : 1', 27], ['1 : 2', 24], ['0 : 2', 18]]
      return `<div class="mpx-pred">${v.map(([t, p], i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}"><span>${t}</span><i style="--p:${p}%"></i><b>${p}%</b></button>`).join('')}<small>2 140 голосов · открыто до начала</small></div>`
    },
    // Личные встречи списком (hltv / Flapscore)
    встречи: (m, h) => `<div class="mpx-h2h">${[['12 сен', 2, 1, 'DreamLeague S27'], ['24 авг', 0, 2, 'Esports World Cup'], ['3 июл', 2, 0, 'Riyadh Masters']].map(([d, a, b, t]) => `<p><time>${d}</time><span class="${a > b ? 'w' : ''}">${h.имя(m.a)}</span><b>${a} : ${b}</b><span class="${b > a ? 'w' : ''}">${h.имя(m.b)}</span><small>${t}</small></p>`).join('')}</div>`,
    // Сравнение командами-зеркалом (Flapscore / hltv): строки с полосами к центру
    сравнение: (m, h, ряды) => `<div class="mpx-cmp"><p class="mpx-cmp__h">${h.лого(m.a)}<b>${h.имя(m.a)}</b><span></span><b>${h.имя(m.b)}</b>${h.лого(m.b)}</p>${ряды.map(([t, a, b, ap, bp]) => `<div class="mpx-cmp__r"><b>${a}</b><span class="mpx-cmp__bar"><i class="a" style="--p:${ap}%"></i></span><small>${t}</small><span class="mpx-cmp__bar"><i class="b" style="--p:${bp}%"></i></span><b>${b}</b></div>`).join('')}</div>`,
  }

  const К = {
    ts: ['Team Spirit', 'ts'], tun: ['Tundra Esports', 'tun'], g2: ['G2 Esports', 0, 'G2'], faze: ['FaZe Clan', 0, 'FZ'],
    flc: ['Team Falcons', 'flc'], tl: ['Team Liquid', 'tl'], gg: ['Gaimin Gladiators', 'gg'], pv: ['PARIVISION', 'pv'], vit: ['Team Vitality', 0, 'VIT'], mgz: ['The MongolZ', 0, 'MGZ'],
  }
  const лого = (id, cls = '') => { const t = К[id]; return t[1] ? `<img class="mpr-lg ${cls}" src="img/teams/${t[1]}.png" alt="" />` : `<span class="mpr-lg mpr-lg--mono ${cls}">${t[2]}</span>` }
  const имя = (id) => К[id][0]
  const h = { лого, имя }

  const МАТЧИ = {
    dota: { g: 'dota', a: 'ts', b: 'tun', игра: 'Dota 2', тур: 'BLAST Slam VIII', стадия: 'Плей-офф · полуфинал верхней сетки', bo: 'Bo3', t: '17:00', приз: '$1 000 000' },
    cs: { g: 'cs', a: 'g2', b: 'faze', игра: 'CS2', тур: 'ESL Pro League S24', стадия: 'Группа C · решающий матч', bo: 'Bo3', t: '17:00', приз: '$850 000' },
  }

  // Что видно в каждый момент: счёт серии и статус двумя уровнями
  const момент = (g, мом) => {
    const cs = g === 'cs', N = cs ? ['Mirage', 'Inferno', 'Ancient'] : ['Карта 1', 'Карта 2', 'Карта 3']
    const S = {
      pre: { серия: null, гл: '17:00', под: 'через 25 мин · ' + (cs ? 'вето в 16:45' : 'драфт в 16:55'), live: false },
      draft: { серия: [0, 0], гл: cs ? 'Вето карт' : 'Драфт · карта 1', под: cs ? '5 из 7 шагов' : 'пики 4 из 10 · без часов', live: true },
      live1: { серия: [0, 0], гл: cs ? N[0] + ' · раунд 17' : 'Карта 1 · 24:15', под: cs ? 'раунды 10 : 6' : 'убийства 18 : 12 · +4.2 тыс. золота', live: true },
      break: { серия: [1, 0], гл: 'Перерыв', под: (cs ? N[1] : 'карта 2') + ' через 6 мин · ' + N[0] + ' — ' + (cs ? 'G2 13 : 9' : 'Spirit 34 : 21'), live: true },
      live2: { серия: [1, 0], гл: cs ? N[1] + ' · раунд 9' : 'Карта 2 · 12:40', под: cs ? 'раунды 3 : 5' : 'убийства 7 : 5 · +1.1 тыс. золота', live: true },
      done: { серия: [2, 0], гл: 'Завершён', под: cs ? '2 : 0 · Mirage 13 : 9, Inferno 13 : 11' : '2 : 0 · 82 минуты', live: false },
    }[мом]
    S.мом = мом
    return S
  }

  // Кусочки страницы
  const x = {
    h, R,
    сек: (t, html, кл = '') => `<section class="mp-sec ${кл}">${t ? `<h3 class="mp-h">${t}</h3>` : ''}${html}</section>`,
    // Вето по шагам (hltv) или драфт героями (Dota)
    вето: (m) => {
      if (m.g === 'cs') {
        const ш = [['FaZe', 'убрали', 'Nuke'], ['G2', 'убрали', 'Dust2'], ['G2', 'выбрали', 'Mirage'], ['FaZe', 'выбрали', 'Inferno'], ['FaZe', 'убрали', 'Anubis'], ['G2', 'убрали', 'Train'], ['', 'осталась', 'Ancient']]
        const до = m.S.мом === 'pre' ? 0 : m.S.мом === 'draft' ? 5 : 7
        return `<ol class="mp-veto">${ш.map(([к, д, к2], i) => `<li class="${i >= до ? 'is-wait' : д === 'убрали' ? 'is-ban' : 'is-pick'}"><b>${i + 1}</b><span>${к ? к + ' ' : ''}${д}</span><em>${к2}</em></li>`).join('')}</ol>`
      }
      const Г = ['terrorblade', 'morphling', 'mars', 'hoodwink', 'tusk', 'faceless_void', 'lycan', 'beastmaster', 'rubick']
      const сколько = m.S.мом === 'pre' ? 0 : m.S.мом === 'draft' ? 2 : 5
      const ряд = (k, j) => `<p>${лого(m[k], 'sm')}${[0, 1, 2, 3, 4].map((i) => i < сколько ? `<img class="mp-hero" src="img/heroes/${Г[(i + j * 4) % 9]}.webp" alt="" />` : i === сколько && m.S.мом === 'draft' && !j ? '<span class="mp-hero mp-hero--now">выбирает…</span>' : '<span class="mp-hero mp-hero--wait"></span>').join('')}</p>`
      return `<div class="mp-draft">${ряд('a', 0)}${ряд('b', 1)}<p class="mp-draft__bans"><small>Баны</small>${['Pudge', 'Invoker', 'Sniper', 'Earthshaker'].slice(0, m.S.мом === 'pre' ? 0 : 4).map((b) => `<span>${b}</span>`).join('') || '<span class="is-wait">после начала драфта</span>'}</p></div>`
    },
    // Шанс победы (hltv) + перевес (cyberscore)
    шанс: (m) => {
      const p = { pre: 58, draft: 58, live1: 64, break: 71, live2: 68, done: 100 }[m.S.мом]
      return `<div class="mp-chance"><p><span>${лого(m.a, 'sm')}${имя(m.a)}</span><b>${p}%</b><b>${100 - p}%</b><span>${имя(m.b)}${лого(m.b, 'sm')}</span></p><div class="mpr-bar mpr-bar--win"><i style="--p:${p}%"></i></div>
        <small>${m.S.мом === 'pre' || m.S.мом === 'draft' ? 'по голосам зрителей и форме' : m.g === 'cs' ? 'по раундам и экономике' : 'по золоту, башням и героям'}</small></div>`
    },
    // Золото по минутам (Dota) или история раундов (CS)
    ход: (m) => m.g === 'cs'
      ? `<div class="mp-rounds">${[...'WWLWWLLWWWLWLWWWL'].slice(0, m.S.мом === 'live2' ? 8 : 17).map((c, i) => `<i class="${c === 'W' ? 'a' : 'b'}" title="Раунд ${i + 1}">${i + 1}</i>`).join('')}</div><p class="mp-rounds__l"><span>${лого(m.a, 'sm')} ${имя(m.a)}</span><span>${имя(m.b)} ${лого(m.b, 'sm')}</span></p>`
      : R.график({ ...m, a: m.a }, h),
    рядом: (m) => R.сравнение(m, h, m.S.мом === 'pre' || m.S.мом === 'draft'
      ? [['Победы за 30 дней', '72%', '55%', 72, 55], ['Место в рейтинге', '3', '8', 80, 45], [m.g === 'cs' ? 'Пистолетки' : 'Первая кровь', '55%', '38%', 55, 38], ['Форма', '4 из 5', '2 из 5', 80, 40]]
      : m.g === 'cs' ? [['Раунды', '23', '17', 58, 42], ['Убийства', '142', '121', 54, 46], ['ADR команды', '84', '73', 54, 46], ['Пистолетки', '2', '1', 66, 33]]
        : [['Убийства', '41', '25', 62, 38], ['Золото', '58.4 тыс.', '51.0 тыс.', 53, 47], ['Башни', '9', '4', 69, 31], ['Рошаны', '2', '0', 100, 0]]),
    показатели: (m) => R.показатели(m, h),
    прогноз: (m) => R.прогноз(m, h),
    встречи: (m) => R.встречи(m, h),
    инсайты: (m) => R.инсайты(m, h),
    мои: (m) => `<div class="mp-my">${(m.g === 'cs' ? [['m0NESY', 'g2', '+14.2'], ['broky', 'faze', '+6.8']] : [['Yatoro', 'ts', '+12.4'], ['Saksa', 'tun', '+4.1']]).map(([n, k, o]) => `<p><img class="mpx-ava" src="img/players/${n === 'Yatoro' ? 'yatoro.webp' : '_silhouette.png'}" alt="" /><span><b>${n}</b><small>${имя(m[k === m.a ? 'a' : 'b'])}</small></span><em>${m.S.мом === 'pre' ? 'прогноз ' + (parseFloat(o) * 1.4).toFixed(1) : o}</em></p>`).join('')}<a class="mp-link" href="#">${m.S.мом === 'pre' ? 'Собрать состав до 17:00 ›' : 'Мой состав ›'}</a></div>`,
    mvp: (m) => `<div class="mpx-mvp"><img class="mpx-ava" src="img/players/${m.g === 'cs' ? '_silhouette.png' : 'yatoro.webp'}" alt="" /><div><small>Игрок матча</small><b>${m.g === 'cs' ? 'm0NESY · G2' : 'Yatoro · Team Spirit'}</b><p>${m.g === 'cs' ? '1.41 рейтинг · 92 ADR · 3 эйса' : '14 / 2 / 11 · 812 золота в минуту · Terrorblade, Morphling'}</p></div></div>`,
    рейтинг: (m) => `<div class="mp-rate"><p>${лого(m.a, 'sm')}<span>${имя(m.a)}</span><b class="up">+18</b><small>3-е → 2-е</small></p><p>${лого(m.b, 'sm')}<span>${имя(m.b)}</span><b class="dn">−12</b><small>8-е → 9-е</small></p></div>`,
    новости: (m) => `<div class="mp-news">${[
      [m.S.мом === 'done' ? 'Разбор: как ' + имя(m.a) + ' закрыли серию за 82 минуты' : 'Превью: ' + имя(m.a) + ' — фавориты, но ' + имя(m.b) + ' выбили их на прошлом турнире', 'статья · 15 мин назад'],
      ['Лучшие моменты карты 1: Рошан и тройное убийство', 'видео · 2 мин'],
      [имя(m.b) + ' без замены: тот же состав, что и на EWC', 'новость · 2 часа назад']].map(([t, s]) => `<a href="#"><b>${t}</b><small>${s}</small></a>`).join('')}</div>`,
    другие: () => `<div class="mp-other">${[['ts', 'tun', '1 : 0', 'Карта 2', 1], ['vit', 'mgz', '1 : 0', 'Mirage', 1], ['flc', 'tl', '17:00', 'скоро', 0], ['gg', 'pv', '0 : 1', 'Пауза', 1]].map(([a, b, s, st, live]) => `<a href="#"><span>${лого(a, 'sm')}${имя(a)}</span><b>${s}</b><span>${имя(b)}${лого(b, 'sm')}</span><small class="${live ? 'is-live' : ''}">${live ? '<i class="mpr-dot"></i>' : ''}${st}</small></a>`).join('')}</div>`,
  }

  // Подробные блоки — по bo3, cyberscore, Flapscore, hltv, dltv (Figma стр. 06–07)
  const цвет = { ts: 'var(--c-team-ts)', tun: 'var(--c-team-tun)', g2: 'var(--c-live)', faze: 'var(--c-accent)' }
  const доля = (мом) => ({ pre: 0, draft: 0, live1: 0.55, break: 1, live2: 1.3, done: 1.75 })[мом]
  const ГР = ['terrorblade', 'morphling', 'mars', 'hoodwink', 'tusk', 'faceless_void', 'lycan', 'beastmaster', 'rubick']
  const гер = (i, кл = 'mp-hero') => `<img class="${кл}" src="img/heroes/${ГР[i % 9]}.webp" alt="" />`
  const ГЕРОЙ_ИМЯ = ['Terrorblade', 'Morphling', 'Mars', 'Hoodwink', 'Tusk', 'Faceless Void', 'Lycan', 'Beastmaster', 'Rubick']
  const ФОТО = { Yatoro: 'yatoro', rue: 'rue' }
  const ава = (n, кл = 'mpx-ava') => `<img class="${кл}" src="img/players/${ФОТО[n] ? ФОТО[n] + '.webp' : '_silhouette.png'}" alt="" />`
  const РОЛИ = {
    dota: ['Керри', 'Мид', 'Хардлейн', 'Поддержка 4', 'Поддержка 5'],
    g2: ['Райфлер', 'Райфлер', 'Снайпер', 'Капитан', 'Райфлер'], faze: ['Капитан', 'Райфлер', 'Райфлер', 'Снайпер', 'Райфлер'],
  }
  const СТРАНА = { ts: ['RU', 'RU', 'RU', 'RU', 'RU'], tun: ['UA', 'KZ', 'BR', 'MK', 'PH'], g2: ['BA', 'UA', 'RU', 'PL', 'RU'], faze: ['DK', 'NO', 'SK', 'LV', 'US'] }
  // Полная таблица игроков: Dota — уровень, У/С/П, добивания, GPM, XPM, ценность; CS — У–С, ±, ADR, KAST, HS, рейтинг
  const ТАБ = {
    ts: [[0, 22, [9, 1, 6], 312, 684, 712, 21.4], [1, 21, [7, 2, 9], 268, 602, 688, 17.9], [2, 19, [3, 3, 12], 190, 455, 540, 12.6], [3, 16, [2, 4, 15], 64, 301, 402, 7.8], [4, 15, [1, 4, 17], 41, 266, 371, 6.1]],
    tun: [[5, 20, [4, 4, 5], 271, 588, 604, 16.2], [6, 20, [5, 3, 4], 244, 561, 598, 15.0], [7, 17, [1, 5, 7], 150, 402, 455, 10.1], [8, 14, [1, 5, 8], 52, 258, 330, 6.4], [2, 14, [0, 4, 9], 38, 231, 312, 5.0]],
    g2: [[22, 14, 88, 78, 52, 1.31], [19, 15, 81, 74, 61, 1.12], [27, 13, 97, 81, 31, 1.41], [15, 16, 66, 70, 44, 0.96], [17, 17, 72, 68, 48, 1.01]],
    faze: [[13, 19, 61, 64, 40, 0.84], [18, 18, 79, 70, 55, 1.03], [17, 17, 74, 71, 49, 1.00], [20, 18, 83, 69, 22, 1.11], [16, 19, 70, 66, 51, 0.92]],
  }
  const скорборд = (m, k, { кратко = false } = {}) => {
    const id = m[k], f = доля(m.S.мом), игроки = R.игроки(id)
    if (!f) return `<div class="mp-empty">${лого(id, 'sm')}<b>${имя(id)}</b><span>Статистика появится после начала ${m.g === 'cs' ? 'первой карты' : 'игры'}</span></div>`
    const лучший = k === 'a'
    if (m.g === 'cs') {
      const head = кратко ? ['У–С', 'ADR', 'Рейт.'] : ['У–С', '±', 'ADR', 'KAST', 'HS', 'Рейтинг']
      return `<table class="mp-sbd"><thead><tr><th>${лого(id, 'sm')}${имя(id)}</th>${head.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${ТАБ[id].map(([у, с, adr, kast, hs, r], i) => {
        const U = Math.round(у * f), C = Math.round(с * f), рей = r.toFixed(2), кл = r >= 1.1 ? 'up' : r < 0.95 ? 'dn' : ''
        const cells = кратко ? [`${U}–${C}`, adr, `<b class="${кл}">${рей}</b>`] : [`${U}–${C}`, `<span class="${U - C >= 0 ? 'up' : 'dn'}">${U - C > 0 ? '+' : ''}${U - C}</span>`, adr, kast + '%', hs + '%', `<b class="${кл}">${рей}</b>`]
        return `<tr><td>${ава(игроки[i], 'mp-ava-s')}<span><b>${игроки[i]}</b>${лучший && i === 2 ? '<em class="mp-mvp">MVP</em>' : ''}${кратко ? '' : `<small>${РОЛИ[id][i]}</small>`}</span></td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
      }).join('')}</tbody></table>`
    }
    const head = кратко ? ['У/С/П', 'Ценн.'] : ['Ур.', 'У/С/П', 'Доб.', 'GPM', 'XPM', 'Ценность']
    return `<table class="mp-sbd"><thead><tr><th>${лого(id, 'sm')}${имя(id)}</th>${head.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${ТАБ[id].map(([г, ур, kda, доб, gpm, xpm, nw], i) => {
      const K = kda.map((v) => Math.round(v * f)), L = Math.min(30, Math.round(ур * Math.sqrt(f)))
      const cells = кратко ? [K.join('/'), (nw * f).toFixed(1) + ' т'] : [L, K.join(' / '), Math.round(доб * f), gpm, xpm, `<b>${(nw * f).toFixed(1)} тыс.</b>`]
      return `<tr><td>${гер(г, 'mp-hero-s')}<span><b>${игроки[i]}</b>${лучший && i === 0 ? '<em class="mp-mvp">MVP</em>' : ''}${кратко ? '' : `<small>${ГЕРОЙ_ИМЯ[г]}</small>`}</span></td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
    }).join('')}</tbody></table>`
  }

  // Сводка серии по картам (cyberscore Summary, hltv «счёт по каждой карте»): победитель, счёт, длительность, герои или половины
  const сводка = (m) => {
    const cs = m.g === 'cs', мом = m.S.мом
    const сыграно = { pre: 0, draft: 0, live1: 0, break: 1, live2: 1, done: 2 }[мом], идёт = { live1: 0, live2: 1, draft: 0 }[мом]
    const К = cs
      ? [['Mirage', 'выбор G2', '13 : 9', '7 : 5 · 6 : 4', '48 мин', 'm0NESY · 1.52'], ['Inferno', 'выбор FaZe', '13 : 11', '5 : 7 · 8 : 4', '54 мин', 'huNter- · 1.34'], ['Ancient', 'решающая', '', '', '', '']]
      : [['Карта 1', 'Spirit — свет', '34 : 21', '', '41 мин', 'Yatoro · 14/2/11'], ['Карта 2', 'Spirit — тьма', '27 : 20', '', '41 мин', 'Larl · 11/3/14'], ['Карта 3', 'если 1 : 1', '', '', '', '']]
    return `<div class="mp-series">${К.map(([n, под, сч, пол, длит, mvp], i) => {
      const done = i < сыграно, now = i === идёт && мом !== 'draft', wait = !done && !now
      const тело = done
        ? (cs ? `<p class="mp-series__half"><small>Половины</small><b>${пол}</b></p>` : `<div class="mp-series__picks"><p>${лого(m.a, 'sm')}${[0, 1, 2, 3, 4].map((j) => гер(j + i * 2)).join('')}</p><p>${лого(m.b, 'sm')}${[0, 1, 2, 3, 4].map((j) => гер(j + 5 + i)).join('')}</p></div>`)
          + `<p class="mp-series__ft"><span>⏱ ${длит}</span><span>★ ${mvp}</span></p>`
        : now ? `<p class="mp-series__now"><i class="mpr-dot"></i>${m.S.гл} · ${m.S.под}</p>` : `<p class="mp-series__wait">${мом === 'done' ? 'Не понадобилась — серия закончилась 2 : 0' : i === 2 ? 'Сыграют, если счёт станет 1 : 1' : мом === 'draft' && i === 0 ? (cs ? 'Вето идёт' : 'Драфт идёт — герои ниже') : 'Начнётся после карты ' + i}</p>`
      return `<article class="mp-series__m ${done ? 'is-done' : now ? 'is-now' : 'is-wait'}"><header><b>${n}</b><small>${под}</small>${done ? `<span class="mp-series__w">${лого(m.a, 'sm')}${имя(m.a)}</span><em>${сч}</em>` : now ? '<em class="is-live">идёт</em>' : '<em>—</em>'}</header>${тело}</article>`
    }).join('')}</div>`
  }

  // Форма — последние 5 матчей каждой команды (cyberscore «Previous games», bo3 «Team form»)
  const ФОРМА = {
    ts: [['2 окт', 'flc', 2, 1, 'BLAST Slam VIII'], ['30 сен', 'gg', 2, 0, 'BLAST Slam VIII'], ['27 сен', 'tl', 1, 2, 'BLAST Slam VIII'], ['14 сен', 'pv', 2, 0, 'DreamLeague S27'], ['12 сен', 'tun', 2, 1, 'DreamLeague S27']],
    tun: [['2 окт', 'gg', 2, 1, 'BLAST Slam VIII'], ['30 сен', 'tl', 0, 2, 'BLAST Slam VIII'], ['28 сен', 'pv', 2, 1, 'BLAST Slam VIII'], ['15 сен', 'flc', 0, 2, 'DreamLeague S27'], ['12 сен', 'ts', 1, 2, 'DreamLeague S27']],
    g2: [['3 окт', 'vit', 2, 1, 'ESL Pro League S24'], ['1 окт', 'mgz', 2, 0, 'ESL Pro League S24'], ['29 сен', 'faze', 1, 2, 'BLAST Open'], ['21 сен', 'vit', 2, 0, 'BLAST Open'], ['19 сен', 'mgz', 0, 2, 'BLAST Open']],
    faze: [['3 окт', 'mgz', 2, 1, 'ESL Pro League S24'], ['1 окт', 'vit', 0, 2, 'ESL Pro League S24'], ['29 сен', 'g2', 2, 1, 'BLAST Open'], ['22 сен', 'mgz', 1, 2, 'BLAST Open'], ['20 сен', 'vit', 0, 2, 'BLAST Open']],
  }
  const форма = (m, k) => `<div class="mp-form"><p class="mp-form__h">${лого(m[k], 'sm')}<b>${имя(m[k])}</b><span>${ФОРМА[m[k]].filter((r) => r[2] > r[3]).length} из 5</span></p>${ФОРМА[m[k]].map(([d, op, a, b, t]) => `<p><time>${d}</time><span>${лого(op, 'sm')}${имя(op)}</span><b class="${a > b ? 'w' : 'l'}">${a} : ${b}</b><small>${t}</small></p>`).join('')}</div>`

  // Пул: CS — карты с процентом побед и что убирают (bo3 «Historical maps winrate», Flapscore «Map stats»); Dota — любимые герои
  const пул = (m) => {
    if (m.g === 'cs') {
      const М = [['Mirage', 71, 14, 58, 12, 'pick-a'], ['Inferno', 52, 11, 66, 15, 'pick-b'], ['Ancient', 60, 10, 55, 9, 'left'], ['Nuke', 38, 8, 70, 13, 'ban'], ['Anubis', 64, 11, 33, 6, 'ban'], ['Dust2', 45, 9, 61, 10, 'ban'], ['Train', 50, 4, 42, 7, 'ban']]
      const м = { 'pick-a': 'выбор G2', 'pick-b': 'выбор FaZe', left: 'решающая', ban: 'убрана' }
      return `<table class="mp-pool"><thead><tr><th>Карта</th><th>${лого(m.a, 'sm')}</th><th></th><th>${лого(m.b, 'sm')}</th><th>в этом матче</th></tr></thead><tbody>${М.map(([n, a, an, b, bn, s]) => `<tr class="is-${s}"><td><b>${n}</b></td><td><b class="${a >= 60 ? 'up' : a < 45 ? 'dn' : ''}">${a}%</b><small>${an} карт</small></td><td><span class="mp-pool__bar"><i style="--p:${a}%"></i><i style="--p:${b}%"></i></span></td><td><b class="${b >= 60 ? 'up' : b < 45 ? 'dn' : ''}">${b}%</b><small>${bn} карт</small></td><td><span class="mp-tag">${m.S.мом === 'pre' ? '—' : м[s]}</span></td></tr>`).join('')}</tbody></table><p class="mp-note">Победы на карте за 3 месяца</p>`
    }
    const П = { a: [[0, 9, 78], [1, 7, 71], [2, 8, 63], [3, 6, 67], [4, 11, 55]], b: [[5, 10, 60], [6, 6, 50], [7, 9, 67], [8, 12, 58], [2, 5, 40]] }
    return `<div class="mp-heropool">${['a', 'b'].map((k) => `<div><p class="mp-form__h">${лого(m[k], 'sm')}<b>${имя(m[k])}</b><span>за 30 дней</span></p>${П[k].map(([г, n, p]) => `<p>${гер(г, 'mp-hero-s')}<span>${ГЕРОЙ_ИМЯ[г]}</span><small>${n} игр</small><b class="${p >= 65 ? 'up' : p < 50 ? 'dn' : ''}">${p}%</b></p>`).join('')}</div>`).join('')}</div>`
  }

  // Лучшие в матче (Flapscore «Top», bo3 «Records»)
  const рекорды = (m) => {
    if (!доля(m.S.мом)) return `<p class="mp-note">Появятся после начала матча</p>`
    const Т = m.g === 'cs'
      ? [['Больше всех убийств', 'm0NESY', 'g2', '27'], ['Лучший ADR', 'm0NESY', 'g2', '97'], ['Первые убийства', 'huNter-', 'g2', '6'], ['Клатчи', 'broky', 'faze', '3'], ['Убийства с AWP', 'm0NESY', 'g2', '14'], ['Лучший рейтинг', 'm0NESY', 'g2', '1.41']]
      : [['Больше всех убийств', 'Yatoro', 'ts', '9'], ['Больше всех золота', 'Yatoro', 'ts', '21.4 тыс.'], ['Урон по зданиям', 'Larl', 'ts', '6.2 тыс.'], ['Больше помощи', 'Miposhka', 'ts', '17'], ['Варды', 'Whitemon', 'tun', '14'], ['Серия убийств', 'Yatoro', 'ts', '5 подряд']]
    return `<div class="mp-recs">${Т.map(([t, n, k, v]) => `<p><small>${t}</small>${ава(n, 'mp-ava-s')}<span><b>${n}</b><i>${имя(k)}</i></span><em>${v}</em></p>`).join('')}</div>`
  }

  // Турнир: путь команды и что на кону (vpedota2 «прогресс турнира», bo3 «Шапка: турнир»)
  const турнир = (m) => {
    const cs = m.g === 'cs'
    const шаги = cs ? [['Группа C', 'старт 30 сен', 'done'], ['Решающий матч группы', 'сегодня', 'now'], ['Плей-офф · 1/4', '11 окт', 'wait'], ['Финал', '19 окт · Мальта', 'wait']]
      : [['Групповой этап', '1-е место', 'done'], ['Четвертьфинал ВС', '2 : 0 Falcons', 'done'], ['Полуфинал ВС', 'сегодня', 'now'], ['Финал ВС', '8 окт', 'wait'], ['Гранд-финал', '12 окт · LAN', 'wait']]
    const кон = cs ? [['Победитель', 'в плей-офф · против Vitality, 11 окт'], ['Проигравший', 'выбывает · 9–12 место, $12 500']]
      : [['Победитель', 'в финал верхней сетки · против Falcons, 8 окт'], ['Проигравший', 'в нижнюю сетку · против Liquid, 7 окт']]
    return `<div class="mp-trn"><p class="mp-trn__h"><b>${m.тур}</b><span>Призовой фонд ${m.приз}</span></p><ol class="mp-path">${шаги.map(([t, s, c]) => `<li class="is-${c}"><i></i><b>${t}</b><small>${s}</small></li>`).join('')}</ol><div class="mp-stake">${кон.map(([t, s], i) => `<p class="${i ? 'dn' : 'up'}"><b>${t}</b><span>${s}</span></p>`).join('')}</div></div>`
  }

  // Паспорт матча (bo3 «карточка справа»)
  const паспорт = (m) => `<dl class="mp-pass">${[
    ['Дата', '6 октября, понедельник'], ['Начало', m.t + ' МСК · ' + (m.g === 'cs' ? 'вето в 16:45' : 'драфт в 16:55')], ['Формат', m.bo + ' · ' + (m.g === 'cs' ? 'MR12, овертаймы MR3' : 'Captains Mode')],
    ['Турнир', m.тур], ['Стадия', m.стадия], ['Версия', m.g === 'cs' ? 'CS2 · 1.40.6' : 'Патч 7.39d'], ['Где', m.g === 'cs' ? 'Онлайн · Европа' : 'LAN · Копенгаген'], ['Языки эфира', 'RU · EN · ES · PT']].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`

  // Составы с фото, ролью и страной (hltv / dltv «составы с фото»)
  const составы = (m, k) => `<div class="mp-roster"><p class="mp-form__h">${лого(m[k], 'sm')}<b>${имя(m[k])}</b><span>${m.g === 'cs' ? 'тренер: TaZ' : 'тренер: Silent'}</span></p><div>${R.игроки(m[k]).map((n, i) => `<p>${ава(n, 'mp-ava-m')}<b>${n}</b><small>${(РОЛИ[m[k]] || РОЛИ.dota)[i]}</small><span class="mp-cc">${СТРАНА[m[k]][i]}</span></p>`).join('')}</div></div>`

  // Объекты карты (Dota) или раунды по типу закупки (CS)
  const объекты = (m) => R.сравнение(m, h, m.g === 'cs'
    ? [['Пистолетные', '2', '0', 100, 0], ['Эко-раунды', '3', '1', 75, 25], ['Форс-байи', '2', '3', 40, 60], ['Полная закупка', '9', '8', 53, 47], ['Бомба взорвана', '6', '—', 100, 0]]
    : [['Башни', '7', '3', 70, 30], ['Бараки', '2', '0', 100, 0], ['Рошаны', '1', '0', 100, 0], ['Варды', '31', '28', 53, 47], ['Тормент', '1', '1', 50, 50]])

  // Лента событий подробная (hltv лог раунда, dltv лента)
  const лог = (m) => `<ul class="mp-log">${(m.g === 'cs'
    ? [['Р17', 'a', 'm0NESY — четверо с AWP, G2 отбили A', 'big'], ['Р16', 'a', 'huNter- — клатч 1 на 2', ''], ['Р15', 'b', 'FaZe взорвали B, 10 : 5', ''], ['Р14', 'a', 'G2 выиграли эко FaZe', ''], ['Р13', 'a', 'Смена сторон · первая половина 8 : 4', 'sys'], ['Р12', 'b', 'broky — три с AWP на мид', ''], ['Р11', 'a', 'Snax поставил бомбу на A', ''], ['Р1', 'a', 'G2 выиграли пистолетку', '']]
    : [['24:02', 'a', 'Spirit убили Рошана — Aegis у Yatoro', 'big'], ['22:40', 'a', 'Драка у реки: 3 на 1, Collapse — Reverse Polarity на троих', ''], ['21:05', 'b', 'Tundra снесли башню на центре', ''], ['19:30', 'a', 'Larl — тройное убийство', 'big'], ['16:12', 'b', 'Tundra забрали Тормент', ''], ['12:44', 'a', 'Spirit снесли первую башню', ''], ['06:10', 'b', 'Первая кровь — Crystallis', ''], ['00:00', '', 'Горн — карта 1 началась', 'sys']]
  ).map(([t, k, s, кл]) => `<li class="${кл}"><time>${t}</time>${k ? лого(m[k], 'sm') : '<span class="mp-log__sys">●</span>'}<span>${s}</span></li>`).join('')}</ul>`

  // Ближайшие матчи этих команд
  const дальше = (m) => `<div class="mp-next">${(m.g === 'cs' ? [['g2', 'vit', '11 окт · 18:00', 'если выиграют'], ['faze', 'mgz', '9 окт · 15:30', 'BLAST Open']] : [['ts', 'flc', '8 окт · 17:00', 'если выиграют'], ['tun', 'tl', '7 окт · 14:00', 'если проиграют']]).map(([a, b, t, s]) => `<a href="#"><span>${лого(a, 'sm')}${имя(a)}</span><i>vs</i><span>${имя(b)}${лого(b, 'sm')}</span><small>${t} · ${s}</small></a>`).join('')}</div>`

  // Видео: лучшие моменты, интервью (dltv «стрим в странице», bo3 «Stream»)
  const видео = (m) => `<div class="mp-vids">${(m.S.мом === 'pre' ? [['Превью матча: что ждать от Spirit и Tundra', '8:12'], ['Последняя встреча — все лучшие моменты', '4:40'], ['Интервью капитана перед полуфиналом', '2:15']] : [['Лучшие моменты карты 1', '3:48'], [m.g === 'cs' ? 'm0NESY — эйс на Mirage' : 'Рошан и Aegis на 24-й минуте', '0:52'], ['Интервью после карты', '2:15']]).map(([t, d], i) => `<a href="#" class="mp-vid"><span class="mp-vid__th" style="--i:${i}"><i>▶</i><em>${d}</em></span><b>${t}</b></a>`).join('')}</div>`

  Object.assign(x, { цвет, скорборд, сводка, форма, пул, рекорды, турнир, паспорт, составы, объекты, лог, дальше, видео, ава, гер })

  // Раскладка v5: эфир с плашкой счёта и лентой, тикер цифр, ниже сетка главной
  const раскладка = (m) => {
    const мом = m.S.мом, сек = x.сек, h = x.h, cs = m.g === 'cs', g2 = (...a) => `<div class="mp5-g2">${a.join('')}</div>`
    const [sa, sb] = m.S.серия || [], live = m.S.live
    const пилюля = `<p class="mp-pill ${live ? 'is-live' : мом === 'done' ? 'is-done' : ''}">${live ? '<i class="mpr-dot"></i>' : ''}${m.S.серия ? m.S.гл : 'Скоро'}</p>`
    const hud = `<div class="mp5-hud"><div class="mp5-hud__t">${h.лого(m.a)}<span>${h.имя(m.a)}</span></div>
      <div class="mp5-hud__c">${m.S.серия ? `<b>${sa} : ${sb}</b>` : `<b>${m.t}</b>`}${live ? `<em>${m.S.гл}</em>` : ''}<small>${m.S.под}</small></div>
      <div class="mp5-hud__t"><span>${h.имя(m.b)}</span>${h.лого(m.b)}</div></div>`
    const центр = мом === 'pre'
      ? `<div class="mp5-big"><b>${m.t}</b><p>Начало через 25 минут · ${cs ? 'вето в 16:45' : 'драфт в 16:55'} · эфир с 16:45</p><div class="mp5-btns"><button class="mp-btn mp-btn--main" type="button">★ Напомнить</button><button class="mp-btn" type="button">▶ Превью · 8 мин</button></div></div>`
      : мом === 'done' ? `<div class="mp5-big"><span class="mp5-play">▶</span><p>Запись матча · 2 ч 18 мин · с таймкодами карт</p></div>`
        : `<span class="mp5-play">▶</span>`
    const лента = мом === 'pre'
      ? `<h3>Перед матчем <small>обновлено 16:30</small></h3><div class="mp5-pre">${[['Spirit — фавориты: 58% голосов зрителей', 'прогноз · 2 140 голосов'], ['Последняя встреча — 2 : 1 Spirit, DreamLeague S27', 'личные встречи'], ['Tundra без замен — тот же состав, что и на EWC', 'новость · 2 часа назад'], ['Победитель — в финал верхней сетки против Falcons', 'турнир'], [cs ? 'Mirage — 71% побед G2 за 3 месяца' : 'Terrorblade у Yatoro — 78% побед', 'статистика']].map(([t, s]) => `<p><b>${t}</b><small>${s}</small></p>`).join('')}</div><footer>${x.прогноз(m)}</footer>`
      : `<h3>Что происходит <small>${live ? '● в эфире' : мом === 'done' ? 'весь матч' : 'вето и драфт'}</small></h3>${x.лог(m)}<footer>${x.шанс(m)}</footer>`
    const сцена = `<section class="mp5-stage" style="--ta:${x.цвет[m.a]};--tb:${x.цвет[m.b]}"><div class="mp5-tv">
        <div class="mp5-tv__top"><span class="mpr-gt">${m.игра}</span><b>${m.тур}</b><span>${m.стадия}</span><span class="mpr-bo">${m.bo}</span>${пилюля}<span class="mp5-viewers">${live ? '22 тыс. смотрят' : мом === 'done' ? '48 тыс. смотрели' : '★ 1 840 следят'}</span></div>
        ${центр}
        <div style="display:grid;gap:12px">${hud}<div class="mp5-src">${['Twitch · RU 12 тыс.', 'YouTube · EN 8 тыс.', 'Kick 2 тыс.', 'Без звука комментатора'].map((t, i) => `<button type="button" class="${i ? '' : 'is-on'}">${t}</button>`).join('')}</div></div>
      </div><aside class="mp5-feed">${лента}</aside></section>`
    const p = { pre: 58, draft: 58, live1: 64, break: 71, live2: 68, done: 100 }[мом]
    const тик = (cs
      ? [['Шанс победы', `${p}%`, `<div class="mpr-bar mpr-bar--win"><i style="--p:${p}%"></i></div>`], ['Карта', live ? m.S.гл.split(' · ')[0] : мом === 'pre' ? 'вето в 16:45' : 'Mirage', live ? m.S.под : 'выбор G2'], ['Раунды подряд', live ? '3 · G2' : '—', 'лучшая серия карты'], ['Экономика', live ? '$24 900 : $11 300' : '—', 'деньги команд сейчас'], ['Лучший', 'm0NESY', live || мом === 'done' ? 'рейтинг 1.41 · 27 убийств' : 'рейтинг 1.28 за 3 месяца']]
      : [['Шанс победы', `${p}%`, `<div class="mpr-bar mpr-bar--win"><i style="--p:${p}%"></i></div>`], ['Перевес по золоту', live ? '+4.2 тыс.' : '—', live ? 'у Spirit · растёт 6 минут' : 'появится в игре'], ['Башни', live ? '7 : 3' : мом === 'done' ? '18 : 7' : '—', 'за карту'], ['Рошан', live ? 'Spirit · 24:02' : '—', live ? 'Aegis у Yatoro' : 'первый — около 20-й минуты'], ['Лучший', 'Yatoro', live || мом === 'done' ? '9 / 1 / 6 · 684 GPM' : '78% побед на Terrorblade']]
    ).map(([t, b, s]) => `<div><small>${t}</small><b>${b}</b>${s.startsWith('<') ? s : `<span>${s}</span>`}</div>`).join('')
    const главное = {
      pre: () => сек('Перед матчем', x.показатели(m)) + g2(сек('Форма', x.форма(m, 'a')), сек('Форма', x.форма(m, 'b'))) + g2(сек('Состав', x.составы(m, 'a')), сек('Состав', x.составы(m, 'b'))) + сек(cs ? 'Карты: победы за 3 месяца' : 'Любимые герои', x.пул(m)) + сек('Аналитика', x.инсайты(m)) + сек('Видео', x.видео(m)),
      draft: () => g2(сек(cs ? 'Вето по шагам' : 'Драфт · карта 1', x.вето(m)), сек(cs ? 'Карты: победы за 3 месяца' : 'Любимые герои', x.пул(m))) + g2(сек('Форма', x.форма(m, 'a')), сек('Форма', x.форма(m, 'b'))) + сек('Перед матчем', x.показатели(m)),
      live1: () => сек(cs ? 'Раунды' : 'Золото по минутам', x.ход(m)) + сек('', x.скорборд(m, 'a')) + сек('', x.скорборд(m, 'b')) + сек('Серия по картам', x.сводка(m)) + g2(сек(cs ? 'Раунды по закупке' : 'Объекты карты', x.объекты(m)), сек(cs ? 'Вето' : 'Драфт', x.вето(m))) + сек('Лучшие в матче', x.рекорды(m)),
      break: () => сек('Серия по картам', x.сводка(m)) + сек('', x.скорборд(m, 'a')) + сек('', x.скорборд(m, 'b')) + g2(сек('Команды рядом · карта 1', x.рядом(m)), сек('Прогноз счёта', x.прогноз(m))) + сек('Видео', x.видео(m)),
      live2: () => сек(cs ? 'Раунды' : 'Золото по минутам', x.ход(m)) + сек('', x.скорборд(m, 'a')) + сек('', x.скорборд(m, 'b')) + сек('Серия по картам', x.сводка(m)) + g2(сек(cs ? 'Раунды по закупке' : 'Объекты карты', x.объекты(m)), сек('Лучшие в матче', x.рекорды(m).replace('mp-recs', 'mp-recs mp-recs--col'))),
      done: () => g2(сек('', x.mvp(m)), сек('Рейтинг после матча', x.рейтинг(m))) + сек('Серия по картам', x.сводка(m)) + сек('', x.скорборд(m, 'a')) + сек('', x.скорборд(m, 'b')) + сек('Лучшие в матче', x.рекорды(m)) + сек('Видео', x.видео(m)) + сек('Новости матча', x.новости(m)),
    }[мом]()
    const бок = сек('Твои игроки', x.мои(m)) + сек('О матче', x.паспорт(m)) + `<section class="mp-sec"><h3 class="mp-h">Турнир</h3>${x.турнир(m).replace('mp-trn', 'mp-trn mp-trn--col')}</section>` + сек('Дальше у команд', x.дальше(m)) + сек('Другие матчи', x.другие())
    return `<div class="mp-body mp5">${сцена}<div class="mp5-tick">${тик}</div><div class="mp5-grid"><div class="mp5-main">${главное}</div><aside class="mp5-side">${бок}</aside></div></div>`
  }

  const q = new URLSearchParams(location.search)
  const g = МАТЧИ[q.get('game')] ? q.get('game') : 'dota'
  const мом = ({ pre: 'pre', live: 'live1', done: 'done' })[q.get('state')] || 'live1' // лаба match-blocks: состояния нового сайта
  const m = { ...МАТЧИ[g], S: момент(g, мом) }
  document.title = `${имя(m.a)} — ${имя(m.b)} · ${m.тур}`
  root.innerHTML = `<p class="mp-crumbs"><a href="match-center.html">Match Center</a> / ${m.тур} / ${имя(m.a)} — ${имя(m.b)}</p>${раскладка(m)}`
})()
