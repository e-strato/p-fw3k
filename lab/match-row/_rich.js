// Лаба «Строка матча» — «богатые» кусочки для v4–v7 (по референсам страниц матча из Figma стр. 06: cyberscore, dltv, hltv, bo3, Flapscore, hawk).
// RICH.<кусочек>(m, h) → html. Данные условные; у Dota — герои картинками, у CS / LoL / Valorant — игроки и карты словами.
;(() => {
  const ИГРОКИ = {
    ts: ['Yatoro', 'Larl', 'Collapse', 'rue', 'Miposhka'], tun: ['Crystallis', 'bzm', '33', 'Saksa', 'Whitemon'],
    flc: ['skiter', 'Malr1ne', 'ATF', 'Cr1t-', 'Sneyking'], tl: ['miCKe', 'Nisha', 'SabeRLight-', 'Boxi', 'Insania'],
    gg: ['watson', 'Quinn', 'Ace', 'tOfu', 'Seleri'], pv: ['Satanic', 'No[o]ne', 'Dukalis', '9Class', 'Dem'],
    aur: ['Nightfall', 'Pure', 'Mira', 'TORONTOTOKYO', 'Panto'], bb: ['gpk', 'Daxak', 'Save-', 'kiyotaka', 'MieRo'],
    navi: ['Aleksib', 'iM', 'b1t', 'jL', 'w0nderful'], mouz: ['Brollan', 'torzsi', 'Jimpphat', 'xertioN', 'Spinx'],
    g2: ['huNter-', 'malbsMd', 'm0NESY', 'Snax', 'HeavyGod'], faze: ['karrigan', 'rain', 'frozen', 'broky', 'EliGE'],
    t1: ['Doran', 'Oner', 'Faker', 'Gumayusi', 'Keria'], gen: ['Kiin', 'Canyon', 'Chovy', 'Ruler', 'Duro'],
    nrg: ['s0m', 'Ethan', 'mada', 'brawk', 'skuba'], edg: ['ZmjjKK', 'CHICHOO', 'nobody', 'Smoggy', 'S1Mon'],
    prx: ['f0rsakeN', 'something', 'd4v41', 'Jinggg', 'mindfreak'], loud: ['Less', 'cauanzin', 'tuyz', 'Saadhak', 'pANcada'],
  }
  const ГЕРОИ = ['terrorblade', 'morphling', 'mars', 'hoodwink', 'tusk', 'faceless_void', 'lycan', 'beastmaster', 'rubick']
  const герой = (i) => `<img class="x-hero" src="/p-fw3k/site/img/heroes/${ГЕРОИ[i % 9]}.webp" alt="" />`
  const фото = { Yatoro: 'yatoro', rue: 'rue', Pure: 'pure', '9Class': '9class' }
  const ава = (n) => `<img class="x-ava" src="/p-fw3k/site/img/players/${фото[n] ? фото[n] + '.webp' : '_silhouette.png'}" alt="" />`
  const игроки = (id) => ИГРОКИ[id] || ['Игрок 1', 'Игрок 2', 'Игрок 3', 'Игрок 4', 'Игрок 5']
  const кольцо = (p, t) => `<span class="x-ring" style="--p:${p}"><b>${p}%</b><small>${t}</small></span>`
  const точки = (s) => `<span class="r-form">${[...s].map((c) => `<i class="${c === 'W' ? 'w' : 'l'}"></i>`).join('')}</span>`

  // Преимущество по золоту — столбики по минутам (как hawk / dltv): вверх — первая команда, вниз — вторая
  const ЗОЛОТО = [0, 0.3, 0.5, 0.2, -0.4, -0.6, -0.3, 0.2, 0.8, 1.4, 1.9, 1.5, 1.1, 1.6, 2.3, 2.9, 3.4, 3.1, 3.8, 4.2]
  const график = (m, h, { мин = 20, ш = 100 } = {}) => {
    const v = ЗОЛОТО.slice(0, мин), max = 5
    return `<div class="x-gold"><div class="x-gold__bars">${v.map((x) => `<i class="${x >= 0 ? 'up' : 'dn'}" style="--h:${Math.round((Math.abs(x) / max) * 50)}%"></i>`).join('')}</div>
      <p class="x-gold__l"><span>${h.лого(m.a, 'sm')} +4.2 тыс.</span><span>${мин * 1.2 | 0}:15</span></p></div>`
  }

  const RICH = {
    игроки, точки, кольцо, ава, герой,
    // Драфт Dota — пять героев на команду; у других игр — состав словами
    составы: (m, h) => m.g === 'dota'
      ? `<div class="x-draft">${['a', 'b'].map((k, j) => `<p>${h.лого(m[k], 'sm')}${[0, 1, 2, 3, 4].map((i) => герой(i + j * 4)).join('')}</p>`).join('')}</div>`
      : `<div class="x-line">${['a', 'b'].map((k) => `<p>${h.лого(m[k], 'sm')}${игроки(m[k]).map((n) => `<span>${n}</span>`).join('')}</p>`).join('')}</div>`,
    график,
    // Таблица игроков в эфире (cyberscore / Flapscore): ник, герой, K/D/A, золото
    таблица: (m, h, k) => `<table class="x-tab"><thead><tr><th>${h.лого(m[k], 'sm')} ${h.имя(m[k])}</th><th>У/С/П</th><th>${m.g === 'cs' ? 'ADR' : 'Золото'}</th></tr></thead><tbody>${игроки(m[k]).map((n, i) => {
      const kda = k === 'a' ? [[6, 1, 9], [4, 3, 11], [2, 2, 14], [1, 5, 16], [0, 4, 18]][i] : [[3, 4, 5], [5, 4, 3], [1, 3, 7], [1, 3, 8], [0, 3, 9]][i]
      return `<tr><td>${m.g === 'dota' ? герой(i + (k === 'b' ? 4 : 0)) : ''}<span>${n}</span></td><td>${kda.join(' / ')}</td><td>${m.g === 'cs' ? [92, 81, 77, 64, 58][i] : (k === 'a' ? [14.2, 12.8, 9.1, 6.4, 5.2] : [11.0, 10.4, 7.2, 5.9, 4.8])[i] + ' тыс.'}</td></tr>` }).join('')}</tbody></table>`,
    // Шапка до матча (dltv): форма точками и три кольца
    показатели: (m, h) => `<div class="x-stats">${['a', 'b'].map((k, j) => `<div class="x-st"><p>${h.лого(m[k])}<b>${h.имя(m[k])}</b>${точки(j ? 'LWWLL' : 'WWLWW')}</p>
      <div class="x-rings">${кольцо(j ? 47 : 62, 'победы')}${кольцо(j ? 38 : 55, 'первая кровь')}${кольцо(j ? 41 : 58, 'первые 10')}</div></div>`).join('')}</div>`,
    // Сильные и слабые стороны (bo3 «Analytics insights»)
    инсайты: (m, h) => `<div class="x-ins">${['a', 'b'].map((k, j) => `<div><p class="x-ins__h">${h.лого(m[k], 'sm')}${h.имя(m[k])}</p>
      <p class="ok">${j ? 'Сильны в затяжных играх: 60% побед после 40-й минуты' : 'Выиграли 4 из 5 последних, все — 2:0 или 2:1'}</p>
      <p class="ok">${j ? 'Лучший мидер турнира по KDA' : 'Лучшая команда группы по первой крови — 55%'}</p>
      <p class="no">${j ? 'Проиграли 3 последние встречи с топ-8' : 'Слабо закрывают игры: 3 камбэка против них'}</p></div>`).join('')}</div>`,
    // Прогноз счёта голосами (bo3 «Score predict»)
    прогноз: (m, h, bo = 3) => {
      const v = bo === 1 ? [['Победа ' + h.имя(m.a), 58], ['Победа ' + h.имя(m.b), 42]] : [['2 : 0', 31], ['2 : 1', 27], ['1 : 2', 24], ['0 : 2', 18]]
      return `<div class="x-pred">${v.map(([t, p], i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}"><span>${t}</span><i style="--p:${p}%"></i><b>${p}%</b></button>`).join('')}<small>2 140 голосов · открыто до начала</small></div>`
    },
    // Личные встречи списком (hltv / Flapscore)
    встречи: (m, h) => `<div class="x-h2h">${[['12 сен', 2, 1, 'DreamLeague S27'], ['24 авг', 0, 2, 'Esports World Cup'], ['3 июл', 2, 0, 'Riyadh Masters']].map(([d, a, b, t]) => `<p><time>${d}</time><span class="${a > b ? 'w' : ''}">${h.имя(m.a)}</span><b>${a} : ${b}</b><span class="${b > a ? 'w' : ''}">${h.имя(m.b)}</span><small>${t}</small></p>`).join('')}</div>`,
    // Сравнение командами-зеркалом (Flapscore / hltv): строки с полосами к центру
    сравнение: (m, h, ряды) => `<div class="x-cmp"><p class="x-cmp__h">${h.лого(m.a)}<b>${h.имя(m.a)}</b><span></span><b>${h.имя(m.b)}</b>${h.лого(m.b)}</p>${ряды.map(([t, a, b, ap, bp]) => `<div class="x-cmp__r"><b>${a}</b><span class="x-cmp__bar"><i class="a" style="--p:${ap}%"></i></span><small>${t}</small><span class="x-cmp__bar"><i class="b" style="--p:${bp}%"></i></span><b>${b}</b></div>`).join('')}</div>`,
    // Таймлайн серии: карты и ключевые события по минутам
    таймлайн: (m, h, события) => `<div class="x-tl" style="--n:${события.length}">${события.map(([, t, k, кл = '']) => `<span class="x-tl__ev ${кл}"><i class="${k}"></i><small>${t}</small></span>`).join('')}</div>`,
    // Карточки карт серии с картинкой-полосой (bo3 / hltv)
    карты: (m, h, list) => `<div class="x-maps">${list.map(([n, кто, счёт, кл, подп]) => `<div class="x-map ${кл}"><span>${n}</span>${кто ? `<b>${h.лого(m[кто], 'sm')}${h.имя(m[кто])}</b>` : `<b class="dim">${подп || '—'}</b>`}<em>${счёт}</em></div>`).join('')}</div>`,
    игрокМатча: (m, h) => `<div class="x-mvp">${ава('Pure')}<div><small>Игрок матча</small><b>Pure · ${h.имя(m.a)}</b><p>14 / 2 / 11 · 812 золота в минуту · Terrorblade, Morphling</p></div></div>`,
    новости: (m, h) => `<div class="x-news"><a href="#"><b>Разбор: как ${h.имя(m.a)} закрыла серию за 82 минуты</b><small>15 минут назад · статья</small></a><a href="#"><b>Лучшие моменты: Pure и тройное убийство на 31-й</b><small>видео · 2 мин</small></a></div>`,
  }
  // Группа состояния: до матча · драфт · в игре · итог · счёт скрыт · отменён
  RICH.группа = (m) => ({ soon: 'pre', delay: 'pre', moved: 'pre', draft: 'draft', live: 'live', pause: 'live', break: 'live', done: 'done', hidden: 'hidden', cancel: 'cancel' })[m.вид]
  // Закрытая строка — как на сайте (v0); тело открытой даёт вариант
  RICH.строка = (m, open, h, тело) => {
    const счёт = (k) => (m.sa == null || m.скрыт ? '' : m['s' + k])
    const исход = (k) => (m.st === 'done' && !m.скрыт ? ((k === 'a' ? m.sa > m.sb : m.sb > m.sa) ? 'is-win' : 'is-lose') : '')
    const с = (k) => `<span class="x-s x-s--${k} ${исход(k)}">${h.лого(m[k])}<span class="r-nm">${h.имя(m[k])}</span>${счёт(k) !== '' ? `<em>${счёт(k)}</em>` : ''}</span>`
    const [a, b, c] = h.статус(m.вид, m)
    const ст = `<div class="r-st ${c ? 'is-' + c : ''}"><b>${c === 'live' ? '<i class="r-dot"></i>' : ''}${a}</b><small>${b}</small></div>`
    const зам = m.заметка && ['delay', 'moved', 'pause', 'cancel'].includes(m.вид) ? m.заметка : ''
    return `<article class="r-row ${open ? 'is-open' : ''} ${m.вид === 'cancel' ? 'r-off' : ''}">
      <div class="x-in" data-toggle>${ст}<div class="x-tm">${с('a')}<span class="x-mid">${m.скрыт ? 'скрыт' : m.sa == null ? 'vs' : ':'}</span>${с('b')}</div>
        <div class="x-r"><span class="r-bo">${m.bo}</span><button class="r-fav ${m.fav ? 'is-on' : ''}" type="button">${m.fav ? '★' : '☆'}</button><span>${open ? '⌃' : m.вид === 'cancel' ? '' : '⌄'}</span></div></div>
      ${зам && (!open || m.вид === 'cancel') ? `<p class="r-note x-note">${зам}</p>` : ''}
      ${open ? `<div class="x-qv">${тело}</div>` : ''}
    </article>`
  }
  // Секция раскрытия с заголовком
  RICH.сек = (t, html, кл = '') => `<section class="x-sec ${кл}">${t ? `<h4 class="x-h">${t}</h4>` : ''}${html}</section>`
  RICH.скрыто = (h) => `<div class="x-hidden"><p>Счёт, карты и статистика спрятаны, чтобы не испортить запись.</p><button class="r-btn r-btn--main" type="button" data-spoil>Показать счёт</button><a class="r-btn" href="#">Смотреть запись · 2 ч 18 мин</a></div>`
  window.RICH = RICH
})()
