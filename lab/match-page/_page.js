// Лаба «Страница матча» — один матч в шести моментах (до начала · драфт или вето · карта 1 · перерыв · карта 2 · итог), Dota или CS.
// Собрано из Match Center (статус словами, двухуровневый счёт, строка v8) и находок Figma стр. 06–07 (cyberscore, dltv, hltv, bo3, Flapscore, hawk).
// Движок: данные момента + кусочки (MP.x). Вариант задаёт только раскладку: MP.вариант = (m, x) => html. Рамки — десктоп 1440 (уменьшается под окно) и телефон 390.
;(() => {
  const К = {
    ts: ['Team Spirit', 'ts'], tun: ['Tundra Esports', 'tun'], g2: ['G2 Esports', 0, 'G2'], faze: ['FaZe Clan', 0, 'FZ'],
    flc: ['Team Falcons', 'flc'], tl: ['Team Liquid', 'tl'], gg: ['Gaimin Gladiators', 'gg'], pv: ['PARIVISION', 'pv'], vit: ['Team Vitality', 0, 'VIT'], mgz: ['The MongolZ', 0, 'MGZ'],
  }
  const лого = (id, cls = '') => { const t = К[id]; return t[1] ? `<img class="r-lg ${cls}" src="/p-fw3k/site/img/teams/${t[1]}.png" alt="" />` : `<span class="r-lg r-lg--mono ${cls}">${t[2]}</span>` }
  const имя = (id) => К[id][0]
  const h = { лого, имя }
  const R = window.RICH

  const МАТЧИ = {
    dota: { g: 'dota', a: 'ts', b: 'tun', игра: 'Dota 2', тур: 'BLAST Slam VIII', стадия: 'Плей-офф · полуфинал верхней сетки', bo: 'Bo3', t: '17:00', приз: '$1 000 000' },
    cs: { g: 'cs', a: 'g2', b: 'faze', игра: 'CS2', тур: 'ESL Pro League S24', стадия: 'Группа C · решающий матч', bo: 'Bo3', t: '17:00', приз: '$850 000' },
  }
  const МОМЕНТЫ = [['pre', 'До начала'], ['draft', 'Драфт / вето'], ['live1', 'Карта 1 идёт'], ['break', 'Перерыв'], ['live2', 'Карта 2 идёт'], ['done', 'Итог']]

  // Что видно в каждый момент: счёт серии, статус двумя уровнями, карты
  const момент = (g, мом) => {
    const cs = g === 'cs', N = cs ? ['Mirage', 'Inferno', 'Ancient'] : ['Карта 1', 'Карта 2', 'Карта 3']
    const выбор = cs ? ['выбор G2', 'выбор FaZe', 'решающая'] : ['', '', '']
    const S = {
      pre: { серия: null, гл: '17:00', под: 'через 25 мин · ' + (cs ? 'вето в 16:45' : 'драфт в 16:55'), live: false },
      draft: { серия: [0, 0], гл: cs ? 'Вето карт' : 'Драфт · карта 1', под: cs ? '5 из 7 шагов' : 'пики 4 из 10 · без часов', live: true },
      live1: { серия: [0, 0], гл: cs ? N[0] + ' · раунд 17' : 'Карта 1 · 24:15', под: cs ? 'раунды 10 : 6' : 'убийства 18 : 12 · +4.2 тыс. золота', live: true },
      break: { серия: [1, 0], гл: 'Перерыв', под: (cs ? N[1] : 'карта 2') + ' через 6 мин · ' + N[0] + ' — ' + (cs ? 'G2 13 : 9' : 'Spirit 34 : 21'), live: true },
      live2: { серия: [1, 0], гл: cs ? N[1] + ' · раунд 9' : 'Карта 2 · 12:40', под: cs ? 'раунды 3 : 5' : 'убийства 7 : 5 · +1.1 тыс. золота', live: true },
      done: { серия: [2, 0], гл: 'Завершён', под: cs ? '2 : 0 · Mirage 13 : 9, Inferno 13 : 11' : '2 : 0 · 82 минуты', live: false },
    }[мом]
    const сч = cs ? ['13 : 9', '13 : 11'] : ['34 : 21', '27 : 20']
    const К1 = { pre: ['скоро', '', 'wait'], draft: [cs ? 'выбрана' : 'драфт', '', 'now'], live1: [cs ? '10 : 6' : '18 : 12', '', 'now'] }[мом] || [сч[0], 'a', 'done']
    const К2 = { pre: ['—', '', 'wait'], draft: ['—', '', 'wait'], live1: ['—', '', 'wait'], break: ['через 6 мин', '', 'now'], live2: [cs ? '3 : 5' : '7 : 5', '', 'now'] }[мом] || [сч[1], 'a', 'done']
    const К3 = мом === 'done' ? ['не понадобилась', '', 'wait'] : ['если 1 : 1', '', 'wait']
    S.карты = [[N[0], выбор[0], ...К1], [N[1], выбор[1], ...К2], [N[2], выбор[2], ...К3]]
    S.мом = мом
    return S
  }

  // Кусочки страницы
  const x = {
    h, R,
    сек: (t, html, кл = '') => `<section class="p-sec ${кл}">${t ? `<h3 class="p-h">${t}</h3>` : ''}${html}</section>`,
    // Табло: команды крупно, серия по центру, статус двумя уровнями (Match Center), Bo3 и турнир
    табло: (m, кл = '') => {
      const [sa, sb] = m.S.серия || [], итог = m.S.мом === 'done'
      const ст = m.S.live ? 'is-live' : итог ? 'is-done' : ''
      return `<header class="p-sb ${кл}">
        <p class="p-sb__t">${'<span class="r-gt">' + m.игра + '</span>'}<b>${m.тур}</b><span>${m.стадия}</span></p>
        <div class="p-sb__m">
          <div class="p-sb__team">${лого(m.a, 'xl')}<b>${имя(m.a)}</b><small>3-е место в рейтинге</small></div>
          <div class="p-sb__c">${m.S.серия ? `<b class="p-sb__s"><span class="${итог ? 'w' : ''}">${sa}</span><i>:</i><span class="${итог ? 'l' : ''}">${sb}</span></b>` : `<b class="p-sb__s p-sb__s--t">${m.S.гл}</b>`}
            <p class="p-pill ${ст}">${m.S.live ? '<i class="r-dot"></i>' : ''}${m.S.серия ? m.S.гл : 'Скоро'}</p><small>${m.S.под}</small></div>
          <div class="p-sb__team">${лого(m.b, 'xl')}<b>${имя(m.b)}</b><small>8-е место в рейтинге</small></div>
        </div>
        <p class="p-sb__f"><span class="r-bo">${m.bo}</span><span>${m.t} МСК · 6 октября</span><span>Приз ${m.приз}</span><button class="p-btn" type="button">★ Следить</button>${m.S.live ? '<a class="p-btn p-btn--main" href="#">Смотреть</a>' : ''}</p>
      </header>`
    },
    // Плитки карт серии (bo3 / hltv): название, чья карта, счёт или статус
    карты: (m) => `<div class="p-maps">${m.S.карты.map(([n, выбор, v, кто, сост]) => `<div class="p-map is-${сост}"><p><b>${n}</b>${выбор ? `<small>${выбор}</small>` : ''}</p><em>${сост === 'now' ? '<i class="r-dot"></i>' : ''}${v}</em>${кто ? `<span>${лого(m[кто], 'sm')}${имя(m[кто])}</span>` : ''}</div>`).join('')}</div>`,
    // Вето по шагам (hltv) или драфт героями (Dota)
    вето: (m) => {
      if (m.g === 'cs') {
        const ш = [['FaZe', 'убрали', 'Nuke'], ['G2', 'убрали', 'Dust2'], ['G2', 'выбрали', 'Mirage'], ['FaZe', 'выбрали', 'Inferno'], ['FaZe', 'убрали', 'Anubis'], ['G2', 'убрали', 'Train'], ['', 'осталась', 'Ancient']]
        const до = m.S.мом === 'pre' ? 0 : m.S.мом === 'draft' ? 5 : 7
        return `<ol class="p-veto">${ш.map(([к, д, к2], i) => `<li class="${i >= до ? 'is-wait' : д === 'убрали' ? 'is-ban' : 'is-pick'}"><b>${i + 1}</b><span>${к ? к + ' ' : ''}${д}</span><em>${к2}</em></li>`).join('')}</ol>`
      }
      const Г = ['terrorblade', 'morphling', 'mars', 'hoodwink', 'tusk', 'faceless_void', 'lycan', 'beastmaster', 'rubick']
      const сколько = m.S.мом === 'pre' ? 0 : m.S.мом === 'draft' ? 2 : 5
      const ряд = (k, j) => `<p>${лого(m[k], 'sm')}${[0, 1, 2, 3, 4].map((i) => i < сколько ? `<img class="p-hero" src="/p-fw3k/site/img/heroes/${Г[(i + j * 4) % 9]}.webp" alt="" />` : i === сколько && m.S.мом === 'draft' && !j ? '<span class="p-hero p-hero--now">выбирает…</span>' : '<span class="p-hero p-hero--wait"></span>').join('')}</p>`
      return `<div class="p-draft">${ряд('a', 0)}${ряд('b', 1)}<p class="p-draft__bans"><small>Баны</small>${['Ahri', 'Pudge', 'Invoker', 'Sniper'].slice(0, m.S.мом === 'pre' ? 0 : 4).map((b) => `<span>${b}</span>`).join('') || '<span class="is-wait">после начала драфта</span>'}</p></div>`
    },
    // Шанс победы (hltv) + перевес (cyberscore)
    шанс: (m) => {
      const p = { pre: 58, draft: 58, live1: 64, break: 71, live2: 68, done: 100 }[m.S.мом]
      return `<div class="p-chance"><p><span>${лого(m.a, 'sm')}${имя(m.a)}</span><b>${p}%</b><b>${100 - p}%</b><span>${имя(m.b)}${лого(m.b, 'sm')}</span></p><div class="r-bar r-bar--win"><i style="--p:${p}%"></i></div>
        <small>${m.S.мом === 'pre' || m.S.мом === 'draft' ? 'по голосам зрителей и форме' : m.g === 'cs' ? 'по раундам и экономике' : 'по золоту, башням и героям'}</small></div>`
    },
    // Золото по минутам (Dota) или история раундов (CS)
    ход: (m) => m.g === 'cs'
      ? `<div class="p-rounds">${[...'WWLWWLLWWWLWLWWWL'].slice(0, m.S.мом === 'live2' ? 8 : 17).map((c, i) => `<i class="${c === 'W' ? 'a' : 'b'}" title="Раунд ${i + 1}">${i + 1}</i>`).join('')}</div><p class="p-rounds__l"><span>${лого(m.a, 'sm')} ${имя(m.a)}</span><span>${имя(m.b)} ${лого(m.b, 'sm')}</span></p>`
      : R.график({ ...m, a: m.a }, h),
    события: (m) => R.таймлайн(m, h, m.g === 'cs'
      ? [[0, 'пистолетка · G2', 'a'], [0, 'эко-раунд · FaZe', 'b'], [0, '3 раунда подряд · G2', 'a', 'big'], [0, m.S.мом === 'done' ? 'матч-пойнт · 12 : 9' : 'сейчас · раунд 17', 'now', 'big']]
      : [[0, 'первая кровь · Spirit', 'a'], [0, 'башня · Tundra', 'b'], [0, 'Рошан · Spirit', 'a', 'big'], [0, m.S.мом === 'done' ? 'ГГ · 34 : 21' : 'сейчас · 24:15', 'now', 'big']]),
    лента: (m) => `<ul class="p-feed">${(m.g === 'cs'
      ? [['17:42', 'm0NESY — эйс с AWP, G2 берут раунд 16'], ['17:39', 'FaZe проиграли эко, 10 : 6'], ['17:31', 'G2 выиграли пистолетку второй половины']]
      : [['23:40', 'Spirit забрали Рошана, Aegis у Yatoro'], ['21:05', 'Tundra снесли башню на центре'], ['18:30', 'Драка у реки: 3 на 1 в пользу Spirit']]).map(([t, s]) => `<li><time>${t}</time>${s}</li>`).join('')}</ul>`,
    игроки: (m, k) => R.таблица(m, h, k),
    рядом: (m) => R.сравнение(m, h, m.S.мом === 'pre' || m.S.мом === 'draft'
      ? [['Победы за 30 дней', '72%', '55%', 72, 55], ['Место в рейтинге', '3', '8', 80, 45], [m.g === 'cs' ? 'Пистолетки' : 'Первая кровь', '55%', '38%', 55, 38], ['Форма', '4 из 5', '2 из 5', 80, 40]]
      : m.g === 'cs' ? [['Раунды', '23', '17', 58, 42], ['Убийства', '142', '121', 54, 46], ['ADR команды', '84', '73', 54, 46], ['Пистолетки', '2', '1', 66, 33]]
        : [['Убийства', '41', '25', 62, 38], ['Золото', '58.4 тыс.', '51.0 тыс.', 53, 47], ['Башни', '9', '4', 69, 31], ['Рошаны', '2', '0', 100, 0]]),
    показатели: (m) => R.показатели(m, h),
    прогноз: (m) => R.прогноз(m, h),
    встречи: (m) => R.встречи(m, h),
    инсайты: (m) => R.инсайты(m, h),
    // Трансляция: заглушка плеера, площадки со счётчиками (dltv)
    стрим: (m) => `<div class="p-stream"><div class="p-stream__v"><span class="p-play">▶</span><p>${m.S.live ? '<i class="r-dot"></i>В эфире · ' + m.S.гл : m.S.мом === 'done' ? 'Запись · 2 ч 18 мин' : 'Начало трансляции в 16:45'}</p></div>
      <p class="p-stream__t"><button class="is-on" type="button">Twitch · RU <small>12 тыс.</small></button><button type="button">YouTube · EN <small>8 тыс.</small></button><button type="button">Kick <small>2 тыс.</small></button></p></div>`,
    мои: (m) => `<div class="p-my">${(m.g === 'cs' ? [['m0NESY', 'g2', '+14.2'], ['broky', 'faze', '+6.8']] : [['Yatoro', 'ts', '+12.4'], ['Saksa', 'tun', '+4.1']]).map(([n, k, o]) => `<p><img class="x-ava" src="/p-fw3k/site/img/players/${n === 'Yatoro' ? 'yatoro.webp' : '_silhouette.png'}" alt="" /><span><b>${n}</b><small>${имя(m[k === m.a ? 'a' : 'b'])}</small></span><em>${m.S.мом === 'pre' ? 'прогноз ' + (parseFloat(o) * 1.4).toFixed(1) : o}</em></p>`).join('')}<a class="p-link" href="#">${m.S.мом === 'pre' ? 'Собрать состав до 17:00 ›' : 'Мой состав ›'}</a></div>`,
    mvp: (m) => `<div class="x-mvp"><img class="x-ava" src="/p-fw3k/site/img/players/${m.g === 'cs' ? '_silhouette.png' : 'yatoro.webp'}" alt="" /><div><small>Игрок матча</small><b>${m.g === 'cs' ? 'm0NESY · G2' : 'Yatoro · Team Spirit'}</b><p>${m.g === 'cs' ? '1.41 рейтинг · 92 ADR · 3 эйса' : '14 / 2 / 11 · 812 золота в минуту · Terrorblade, Morphling'}</p></div></div>`,
    рейтинг: (m) => `<div class="p-rate"><p>${лого(m.a, 'sm')}<span>${имя(m.a)}</span><b class="up">+18</b><small>3-е → 2-е</small></p><p>${лого(m.b, 'sm')}<span>${имя(m.b)}</span><b class="dn">−12</b><small>8-е → 9-е</small></p></div>`,
    новости: (m) => `<div class="p-news">${[
      [m.S.мом === 'done' ? 'Разбор: как ' + имя(m.a) + ' закрыли серию за 82 минуты' : 'Превью: ' + имя(m.a) + ' — фавориты, но ' + имя(m.b) + ' выбили их на прошлом турнире', 'статья · 15 мин назад'],
      ['Лучшие моменты карты 1: Рошан и тройное убийство', 'видео · 2 мин'],
      [имя(m.b) + ' без замены: тот же состав, что и на EWC', 'новость · 2 часа назад']].map(([t, s]) => `<a href="#"><b>${t}</b><small>${s}</small></a>`).join('')}</div>`,
    другие: () => `<div class="p-other">${[['ts', 'tun', '1 : 0', 'Карта 2', 1], ['vit', 'mgz', '1 : 0', 'Mirage', 1], ['flc', 'tl', '17:00', 'скоро', 0], ['gg', 'pv', '0 : 1', 'Пауза', 1]].map(([a, b, s, st, live]) => `<a href="#"><span>${лого(a, 'sm')}${имя(a)}</span><b>${s}</b><span>${имя(b)}${лого(b, 'sm')}</span><small class="${live ? 'is-live' : ''}">${live ? '<i class="r-dot"></i>' : ''}${st}</small></a>`).join('')}</div>`,
  }

  // ——— 07.10 (Claude-A): больше информации — по bo3, cyberscore, Flapscore, hltv, dltv (Figma стр. 06–07) ———
  const цвет = { ts: 'var(--c-team-ts)', tun: 'var(--c-team-tun)', g2: 'var(--c-live)', faze: 'var(--c-accent)' }
  const доля = (мом) => ({ pre: 0, draft: 0, live1: 0.55, break: 1, live2: 1.3, done: 1.75 })[мом]
  const ГР = ['terrorblade', 'morphling', 'mars', 'hoodwink', 'tusk', 'faceless_void', 'lycan', 'beastmaster', 'rubick']
  const гер = (i, кл = 'p-hero') => `<img class="${кл}" src="/p-fw3k/site/img/heroes/${ГР[i % 9]}.webp" alt="" />`
  const ГЕРОЙ_ИМЯ = ['Terrorblade', 'Morphling', 'Mars', 'Hoodwink', 'Tusk', 'Faceless Void', 'Lycan', 'Beastmaster', 'Rubick']
  const ФОТО = { Yatoro: 'yatoro', rue: 'rue' }
  const ава = (n, кл = 'x-ava') => `<img class="${кл}" src="/p-fw3k/site/img/players/${ФОТО[n] ? ФОТО[n] + '.webp' : '_silhouette.png'}" alt="" />`
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
    if (!f) return `<div class="p-empty">${лого(id, 'sm')}<b>${имя(id)}</b><span>Статистика появится после начала ${m.g === 'cs' ? 'первой карты' : 'игры'}</span></div>`
    const лучший = k === 'a'
    if (m.g === 'cs') {
      const head = кратко ? ['У–С', 'ADR', 'Рейт.'] : ['У–С', '±', 'ADR', 'KAST', 'HS', 'Рейтинг']
      return `<table class="p-sbd"><thead><tr><th>${лого(id, 'sm')}${имя(id)}</th>${head.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${ТАБ[id].map(([у, с, adr, kast, hs, r], i) => {
        const U = Math.round(у * f), C = Math.round(с * f), рей = r.toFixed(2), кл = r >= 1.1 ? 'up' : r < 0.95 ? 'dn' : ''
        const cells = кратко ? [`${U}–${C}`, adr, `<b class="${кл}">${рей}</b>`] : [`${U}–${C}`, `<span class="${U - C >= 0 ? 'up' : 'dn'}">${U - C > 0 ? '+' : ''}${U - C}</span>`, adr, kast + '%', hs + '%', `<b class="${кл}">${рей}</b>`]
        return `<tr><td>${ава(игроки[i], 'p-ava-s')}<span><b>${игроки[i]}</b>${лучший && i === 2 ? '<em class="p-mvp">MVP</em>' : ''}${кратко ? '' : `<small>${РОЛИ[id][i]}</small>`}</span></td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
      }).join('')}</tbody></table>`
    }
    const head = кратко ? ['У/С/П', 'Ценн.'] : ['Ур.', 'У/С/П', 'Доб.', 'GPM', 'XPM', 'Ценность']
    return `<table class="p-sbd"><thead><tr><th>${лого(id, 'sm')}${имя(id)}</th>${head.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${ТАБ[id].map(([г, ур, kda, доб, gpm, xpm, nw], i) => {
      const K = kda.map((v) => Math.round(v * f)), L = Math.min(30, Math.round(ур * Math.sqrt(f)))
      const cells = кратко ? [K.join('/'), (nw * f).toFixed(1) + ' т'] : [L, K.join(' / '), Math.round(доб * f), gpm, xpm, `<b>${(nw * f).toFixed(1)} тыс.</b>`]
      return `<tr><td>${гер(г, 'p-hero-s')}<span><b>${игроки[i]}</b>${лучший && i === 0 ? '<em class="p-mvp">MVP</em>' : ''}${кратко ? '' : `<small>${ГЕРОЙ_ИМЯ[г]}</small>`}</span></td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
    }).join('')}</tbody></table>`
  }

  // Сводка серии по картам (cyberscore Summary, hltv «счёт по каждой карте»): победитель, счёт, длительность, герои или половины
  const сводка = (m) => {
    const cs = m.g === 'cs', мом = m.S.мом
    const сыграно = { pre: 0, draft: 0, live1: 0, break: 1, live2: 1, done: 2 }[мом], идёт = { live1: 0, live2: 1, draft: 0 }[мом]
    const К = cs
      ? [['Mirage', 'выбор G2', '13 : 9', '7 : 5 · 6 : 4', '48 мин', 'm0NESY · 1.52'], ['Inferno', 'выбор FaZe', '13 : 11', '5 : 7 · 8 : 4', '54 мин', 'huNter- · 1.34'], ['Ancient', 'решающая', '', '', '', '']]
      : [['Карта 1', 'Spirit — свет', '34 : 21', '', '41 мин', 'Yatoro · 14/2/11'], ['Карта 2', 'Spirit — тьма', '27 : 20', '', '41 мин', 'Larl · 11/3/14'], ['Карта 3', 'если 1 : 1', '', '', '', '']]
    return `<div class="p-series">${К.map(([n, под, сч, пол, длит, mvp], i) => {
      const done = i < сыграно, now = i === идёт && мом !== 'draft', wait = !done && !now
      const тело = done
        ? (cs ? `<p class="p-series__half"><small>Половины</small><b>${пол}</b></p>` : `<div class="p-series__picks"><p>${лого(m.a, 'sm')}${[0, 1, 2, 3, 4].map((j) => гер(j + i * 2)).join('')}</p><p>${лого(m.b, 'sm')}${[0, 1, 2, 3, 4].map((j) => гер(j + 5 + i)).join('')}</p></div>`)
          + `<p class="p-series__ft"><span>⏱ ${длит}</span><span>★ ${mvp}</span></p>`
        : now ? `<p class="p-series__now"><i class="r-dot"></i>${m.S.гл} · ${m.S.под}</p>` : `<p class="p-series__wait">${мом === 'done' ? 'Не понадобилась — серия закончилась 2 : 0' : i === 2 ? 'Сыграют, если счёт станет 1 : 1' : мом === 'draft' && i === 0 ? (cs ? 'Вето идёт' : 'Драфт идёт — герои ниже') : 'Начнётся после карты ' + i}</p>`
      return `<article class="p-series__m ${done ? 'is-done' : now ? 'is-now' : 'is-wait'}"><header><b>${n}</b><small>${под}</small>${done ? `<span class="p-series__w">${лого(m.a, 'sm')}${имя(m.a)}</span><em>${сч}</em>` : now ? '<em class="is-live">идёт</em>' : '<em>—</em>'}</header>${тело}</article>`
    }).join('')}</div>`
  }

  // Форма — последние 5 матчей каждой команды (cyberscore «Previous games», bo3 «Team form»)
  const ФОРМА = {
    ts: [['2 окт', 'flc', 2, 1, 'BLAST Slam VIII'], ['30 сен', 'gg', 2, 0, 'BLAST Slam VIII'], ['27 сен', 'tl', 1, 2, 'BLAST Slam VIII'], ['14 сен', 'pv', 2, 0, 'DreamLeague S27'], ['12 сен', 'tun', 2, 1, 'DreamLeague S27']],
    tun: [['2 окт', 'gg', 2, 1, 'BLAST Slam VIII'], ['30 сен', 'tl', 0, 2, 'BLAST Slam VIII'], ['28 сен', 'pv', 2, 1, 'BLAST Slam VIII'], ['15 сен', 'flc', 0, 2, 'DreamLeague S27'], ['12 сен', 'ts', 1, 2, 'DreamLeague S27']],
    g2: [['3 окт', 'vit', 2, 1, 'ESL Pro League S24'], ['1 окт', 'mgz', 2, 0, 'ESL Pro League S24'], ['29 сен', 'faze', 1, 2, 'BLAST Open'], ['21 сен', 'vit', 2, 0, 'BLAST Open'], ['19 сен', 'mgz', 0, 2, 'BLAST Open']],
    faze: [['3 окт', 'mgz', 2, 1, 'ESL Pro League S24'], ['1 окт', 'vit', 0, 2, 'ESL Pro League S24'], ['29 сен', 'g2', 2, 1, 'BLAST Open'], ['22 сен', 'mgz', 1, 2, 'BLAST Open'], ['20 сен', 'vit', 0, 2, 'BLAST Open']],
  }
  const форма = (m, k) => `<div class="p-form"><p class="p-form__h">${лого(m[k], 'sm')}<b>${имя(m[k])}</b><span>${ФОРМА[m[k]].filter((r) => r[2] > r[3]).length} из 5</span></p>${ФОРМА[m[k]].map(([d, op, a, b, t]) => `<p><time>${d}</time><span>${лого(op, 'sm')}${имя(op)}</span><b class="${a > b ? 'w' : 'l'}">${a} : ${b}</b><small>${t}</small></p>`).join('')}</div>`

  // Пул: CS — карты с процентом побед и что убирают (bo3 «Historical maps winrate», Flapscore «Map stats»); Dota — любимые герои
  const пул = (m) => {
    if (m.g === 'cs') {
      const М = [['Mirage', 71, 14, 58, 12, 'pick-a'], ['Inferno', 52, 11, 66, 15, 'pick-b'], ['Ancient', 60, 10, 55, 9, 'left'], ['Nuke', 38, 8, 70, 13, 'ban'], ['Anubis', 64, 11, 33, 6, 'ban'], ['Dust2', 45, 9, 61, 10, 'ban'], ['Train', 50, 4, 42, 7, 'ban']]
      const м = { 'pick-a': 'выбор G2', 'pick-b': 'выбор FaZe', left: 'решающая', ban: 'убрана' }
      return `<table class="p-pool"><thead><tr><th>Карта</th><th>${лого(m.a, 'sm')}</th><th></th><th>${лого(m.b, 'sm')}</th><th>в этом матче</th></tr></thead><tbody>${М.map(([n, a, an, b, bn, s]) => `<tr class="is-${s}"><td><b>${n}</b></td><td><b class="${a >= 60 ? 'up' : a < 45 ? 'dn' : ''}">${a}%</b><small>${an} карт</small></td><td><span class="p-pool__bar"><i style="--p:${a}%"></i><i style="--p:${b}%"></i></span></td><td><b class="${b >= 60 ? 'up' : b < 45 ? 'dn' : ''}">${b}%</b><small>${bn} карт</small></td><td><span class="p-tag">${m.S.мом === 'pre' ? '—' : м[s]}</span></td></tr>`).join('')}</tbody></table><p class="p-note">Победы на карте за 3 месяца</p>`
    }
    const П = { a: [[0, 9, 78], [1, 7, 71], [2, 8, 63], [3, 6, 67], [4, 11, 55]], b: [[5, 10, 60], [6, 6, 50], [7, 9, 67], [8, 12, 58], [2, 5, 40]] }
    return `<div class="p-heropool">${['a', 'b'].map((k) => `<div><p class="p-form__h">${лого(m[k], 'sm')}<b>${имя(m[k])}</b><span>за 30 дней</span></p>${П[k].map(([г, n, p]) => `<p>${гер(г, 'p-hero-s')}<span>${ГЕРОЙ_ИМЯ[г]}</span><small>${n} игр</small><b class="${p >= 65 ? 'up' : p < 50 ? 'dn' : ''}">${p}%</b></p>`).join('')}</div>`).join('')}</div>`
  }

  // Лучшие в матче (Flapscore «Top», bo3 «Records»)
  const рекорды = (m) => {
    if (!доля(m.S.мом)) return `<p class="p-note">Появятся после начала матча</p>`
    const Т = m.g === 'cs'
      ? [['Больше всех убийств', 'm0NESY', 'g2', '27'], ['Лучший ADR', 'm0NESY', 'g2', '97'], ['Первые убийства', 'huNter-', 'g2', '6'], ['Клатчи', 'broky', 'faze', '3'], ['Убийства с AWP', 'm0NESY', 'g2', '14'], ['Лучший рейтинг', 'm0NESY', 'g2', '1.41']]
      : [['Больше всех убийств', 'Yatoro', 'ts', '9'], ['Больше всех золота', 'Yatoro', 'ts', '21.4 тыс.'], ['Урон по зданиям', 'Larl', 'ts', '6.2 тыс.'], ['Больше помощи', 'Miposhka', 'ts', '17'], ['Варды', 'Whitemon', 'tun', '14'], ['Серия убийств', 'Yatoro', 'ts', '5 подряд']]
    return `<div class="p-recs">${Т.map(([t, n, k, v]) => `<p><small>${t}</small>${ава(n, 'p-ava-s')}<span><b>${n}</b><i>${имя(k)}</i></span><em>${v}</em></p>`).join('')}</div>`
  }

  // Турнир: путь команды и что на кону (vpedota2 «прогресс турнира», bo3 «Шапка: турнир»)
  const турнир = (m) => {
    const cs = m.g === 'cs'
    const шаги = cs ? [['Группа C', 'старт 30 сен', 'done'], ['Решающий матч группы', 'сегодня', 'now'], ['Плей-офф · 1/4', '11 окт', 'wait'], ['Финал', '19 окт · Мальта', 'wait']]
      : [['Групповой этап', '1-е место', 'done'], ['Четвертьфинал ВС', '2 : 0 Falcons', 'done'], ['Полуфинал ВС', 'сегодня', 'now'], ['Финал ВС', '8 окт', 'wait'], ['Гранд-финал', '12 окт · LAN', 'wait']]
    const кон = cs ? [['Победитель', 'в плей-офф · против Vitality, 11 окт'], ['Проигравший', 'выбывает · 9–12 место, $12 500']]
      : [['Победитель', 'в финал верхней сетки · против Falcons, 8 окт'], ['Проигравший', 'в нижнюю сетку · против Liquid, 7 окт']]
    return `<div class="p-trn"><p class="p-trn__h"><b>${m.тур}</b><span>Призовой фонд ${m.приз}</span></p><ol class="p-path">${шаги.map(([t, s, c]) => `<li class="is-${c}"><i></i><b>${t}</b><small>${s}</small></li>`).join('')}</ol><div class="p-stake">${кон.map(([t, s], i) => `<p class="${i ? 'dn' : 'up'}"><b>${t}</b><span>${s}</span></p>`).join('')}</div></div>`
  }

  // Паспорт матча (bo3 «карточка справа»)
  const паспорт = (m) => `<dl class="p-pass">${[
    ['Дата', '6 октября, понедельник'], ['Начало', m.t + ' МСК · ' + (m.g === 'cs' ? 'вето в 16:45' : 'драфт в 16:55')], ['Формат', m.bo + ' · ' + (m.g === 'cs' ? 'MR12, овертаймы MR3' : 'Captains Mode')],
    ['Турнир', m.тур], ['Стадия', m.стадия], ['Версия', m.g === 'cs' ? 'CS2 · 1.40.6' : 'Патч 7.39d'], ['Где', m.g === 'cs' ? 'Онлайн · Европа' : 'LAN · Копенгаген'], ['Языки эфира', 'RU · EN · ES · PT']].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`

  // Составы с фото, ролью и страной (hltv / dltv «составы с фото»)
  const составы = (m, k) => `<div class="p-roster"><p class="p-form__h">${лого(m[k], 'sm')}<b>${имя(m[k])}</b><span>${m.g === 'cs' ? 'тренер: TaZ' : 'тренер: Silent'}</span></p><div>${R.игроки(m[k]).map((n, i) => `<p>${ава(n, 'p-ava-m')}<b>${n}</b><small>${(РОЛИ[m[k]] || РОЛИ.dota)[i]}</small><span class="p-cc">${СТРАНА[m[k]][i]}</span></p>`).join('')}</div></div>`

  // Объекты карты (Dota) или раунды по типу закупки (CS)
  const объекты = (m) => R.сравнение(m, h, m.g === 'cs'
    ? [['Пистолетные', '2', '0', 100, 0], ['Эко-раунды', '3', '1', 75, 25], ['Форс-байи', '2', '3', 40, 60], ['Полная закупка', '9', '8', 53, 47], ['Бомба взорвана', '6', '—', 100, 0]]
    : [['Башни', '7', '3', 70, 30], ['Бараки', '2', '0', 100, 0], ['Рошаны', '1', '0', 100, 0], ['Варды', '31', '28', 53, 47], ['Тормент', '1', '1', 50, 50]])

  // Лента событий подробная (hltv лог раунда, dltv лента)
  const лог = (m) => `<ul class="p-log">${(m.g === 'cs'
    ? [['Р17', 'a', 'm0NESY — четверо с AWP, G2 отбили A', 'big'], ['Р16', 'a', 'huNter- — клатч 1 на 2', ''], ['Р15', 'b', 'FaZe взорвали B, 10 : 5', ''], ['Р14', 'a', 'G2 выиграли эко FaZe', ''], ['Р13', 'a', 'Смена сторон · первая половина 8 : 4', 'sys'], ['Р12', 'b', 'broky — три с AWP на мид', ''], ['Р11', 'a', 'Snax поставил бомбу на A', ''], ['Р1', 'a', 'G2 выиграли пистолетку', '']]
    : [['24:02', 'a', 'Spirit убили Рошана — Aegis у Yatoro', 'big'], ['22:40', 'a', 'Драка у реки: 3 на 1, Collapse — Reverse Polarity на троих', ''], ['21:05', 'b', 'Tundra снесли башню на центре', ''], ['19:30', 'a', 'Larl — тройное убийство', 'big'], ['16:12', 'b', 'Tundra забрали Тормент', ''], ['12:44', 'a', 'Spirit снесли первую башню', ''], ['06:10', 'b', 'Первая кровь — Crystallis', ''], ['00:00', '', 'Горн — карта 1 началась', 'sys']]
  ).map(([t, k, s, кл]) => `<li class="${кл}"><time>${t}</time>${k ? лого(m[k], 'sm') : '<span class="p-log__sys">●</span>'}<span>${s}</span></li>`).join('')}</ul>`

  // Ближайшие матчи этих команд
  const дальше = (m) => `<div class="p-next">${(m.g === 'cs' ? [['g2', 'vit', '11 окт · 18:00', 'если выиграют'], ['faze', 'mgz', '9 окт · 15:30', 'BLAST Open']] : [['ts', 'flc', '8 окт · 17:00', 'если выиграют'], ['tun', 'tl', '7 окт · 14:00', 'если проиграют']]).map(([a, b, t, s]) => `<a href="#"><span>${лого(a, 'sm')}${имя(a)}</span><i>vs</i><span>${имя(b)}${лого(b, 'sm')}</span><small>${t} · ${s}</small></a>`).join('')}</div>`

  // Видео: лучшие моменты, интервью (dltv «стрим в странице», bo3 «Stream»)
  const видео = (m) => `<div class="p-vids">${(m.S.мом === 'pre' ? [['Превью матча: что ждать от Spirit и Tundra', '8:12'], ['Последняя встреча — все лучшие моменты', '4:40'], ['Интервью капитана перед полуфиналом', '2:15']] : [['Лучшие моменты карты 1', '3:48'], [m.g === 'cs' ? 'm0NESY — эйс на Mirage' : 'Рошан и Aegis на 24-й минуте', '0:52'], ['Интервью после карты', '2:15']]).map(([t, d], i) => `<a href="#" class="p-vid"><span class="p-vid__th" style="--i:${i}"><i>▶</i><em>${d}</em></span><b>${t}</b></a>`).join('')}</div>`

  Object.assign(x, { цвет, скорборд, сводка, форма, пул, рекорды, турнир, паспорт, составы, объекты, лог, дальше, видео, ава, гер })

  // Табло богаче: подсветка цветами команд, форма точками, рейтинг, серия кружками
  x.табло = (m, кл = '') => {
    const [sa, sb] = m.S.серия || [], итог = m.S.мом === 'done'
    const ст = m.S.live ? 'is-live' : итог ? 'is-done' : ''
    const пипы = (s) => [0, 1].map((i) => `<i class="${i < s ? 'on' : ''}"></i>`).join('')
    const команда = (k, j) => `<div class="p-sb__team">${лого(m[k], 'xl')}<b>${имя(m[k])}</b><small>${j ? '8-е' : '3-е'} в рейтинге · ${R.точки(j ? 'LWWLL' : 'WWLWW')}</small>${m.S.серия ? `<span class="p-pips">${пипы(m.S.серия[j])}</span>` : ''}</div>`
    return `<header class="p-sb ${кл}" style="--ta:${цвет[m.a]};--tb:${цвет[m.b]}">
      <p class="p-sb__t"><span class="r-gt">${m.игра}</span><b>${m.тур}</b><span>${m.стадия}</span></p>
      <div class="p-sb__m">${команда('a', 0)}
        <div class="p-sb__c">${m.S.серия ? `<b class="p-sb__s"><span class="${итог ? 'w' : ''}">${sa}</span><i>:</i><span class="${итог ? 'l' : ''}">${sb}</span></b>` : `<b class="p-sb__s p-sb__s--t">${m.S.гл}</b>`}
          <p class="p-pill ${ст}">${m.S.live ? '<i class="r-dot"></i>' : ''}${m.S.серия ? m.S.гл : 'Скоро'}</p><small>${m.S.под}</small></div>
        ${команда('b', 1)}</div>
      <p class="p-sb__f"><span class="r-bo">${m.bo}</span><span>${m.t} МСК · 6 октября</span><span>Приз ${m.приз}</span><button class="p-btn" type="button">★ Следить</button>${m.S.live ? '<a class="p-btn p-btn--main" href="#">Смотреть</a>' : m.S.мом === 'pre' ? '<button class="p-btn p-btn--main" type="button">Напомнить</button>' : '<a class="p-btn" href="#">Запись</a>'}</p>
    </header>`
  }

  const ШАПКА = `<header class="ui-header"><div class="ui-header__in"><div class="ui-header__top"><a class="ui-header__brand" href="#">Fantasy · Dota 2</a>
    <div class="btn-row ui-header__game" role="group"><button class="btn btn--quiet btn--xs" type="button" aria-pressed="true">Dota</button><button class="btn btn--quiet btn--xs" type="button" aria-pressed="false">LoL</button></div>
    <div class="ui-header__coins"><span>Монеты</span><b>1 000</b><button class="btn btn--quiet btn--sm" type="button">Забрать +50</button></div></div>
    <nav class="ui-tabs ui-header__nav"><a class="ui-tabs__a" href="#">Главная</a><a class="ui-tabs__a" href="#">Матчи</a><a class="ui-tabs__a" href="#" aria-current="page">Match Center</a><a class="ui-tabs__a" href="#">Состав</a><a class="ui-tabs__a" href="#">Бустеры</a><a class="ui-tabs__a" href="#">Коллекция</a><a class="ui-tabs__a" href="#">Квесты</a><a class="ui-tabs__a" href="#">Лидеры</a><a class="ui-tabs__a" href="#">Как это работает</a></nav></div></header>`
  const ТАББАР = `<nav class="p-tabbar"><a href="#" aria-current="page"><i>▦</i>Матчи</a><a href="#"><i>⌕</i>Поиск</a><a href="#"><i>★</i>Состав</a><a href="#"><i>☆</i>Избранное</a><a href="#"><i>◉</i>Профиль</a></nav>`

  const MP = (window.MP = window.MP || {})
  const S = { g: 'dota', мом: 'live1' }
  const draw = () => {
    const m = { ...МАТЧИ[S.g], S: момент(S.g, S.мом) }
    const html = `<div class="p-scroll">${ШАПКА}<div class="p-crumbs"><a href="#">Match Center</a> / <a href="#">${m.тур}</a> / ${имя(m.a)} — ${имя(m.b)}</div>${MP.вариант(m, x)}</div>${ТАББАР}`
    document.querySelectorAll('[data-mp]').forEach((f) => { f.innerHTML = html })
    document.querySelectorAll('[data-mom]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mom === S.мом))
    document.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === S.g))
    MP.после?.()
  }
  document.querySelector('[data-moments]').innerHTML = МОМЕНТЫ.map(([id, n]) => `<button type="button" data-mom="${id}">${n}</button>`).join('')
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mom], [data-g]')
    if (b) { if (b.dataset.mom) S.мом = b.dataset.mom; else S.g = b.dataset.g; draw(); return }
    const t = e.target.closest('[data-tab]')
    if (t) { const f = t.closest('[data-mp]'); f.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', x === t)); f.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== t.dataset.tab }) }
  })
  const fit = () => document.querySelectorAll('.p-wrap').forEach((w) => { w.firstElementChild.style.zoom = Math.min(1, w.clientWidth / 1440) })
  addEventListener('resize', fit)
  draw(); fit()
})()
