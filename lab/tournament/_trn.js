// Лаба «Страница турнира» v2 (дирижёр 08.10: «строка матча должна быть одинаковая — как везде»; первая версия снята).
// Страница собирается из настоящего сайта: берём match-center.html (шапка сайта, таб-бар, футер, строки матча с раскрытием),
// на место Match Center ставим турнир. Строки матча — та же разметка .mx-row, раскрытие и липкую колонку делает app.js сайта.
// Шапка турнира — шапка страницы матча (.mp-top), в v2 — и плитки страницы матча (.mp-tile).
// Данные: матчи плей-офф — общие week-data.js (их же показывают главная и Match Center), группы 1–3 окт — здесь.
// Вариант и состояние — из ссылки: ?v=v1|v2|v3&td=8 (день) &tab=m|b|g|t &sel=<матч> &scroll=<px>.
;(async () => {
  const q = new URLSearchParams(location.search)
  const V = q.get('v') || 'v1'
  const Н = window.НЕДЕЛЯ
  const ТУР = 'BLAST Slam VIII', СЕГОДНЯ = 6

  // ——— Сайт: берём Match Center целиком ———
  const сайт = new DOMParser().parseFromString(await (await fetch('match-center.html')).text(), 'text/html')
  сайт.querySelectorAll('script').forEach(s => s.remove())
  const НАСТОЯЩИЕ = {}
  сайт.querySelectorAll('.mx-row[data-id]').forEach(r => { НАСТОЯЩИЕ[r.dataset.id] = r.outerHTML })

  // ——— Команды, сила (для прогноза и коэффициентов), игрок матча ———
  const К = Н.К
  const СИЛА = { ts: 90, tun: 85, flc: 88, tl: 84, gg: 80, aur: 79, pv: 76, bb: 72 }
  const ИГРОК = { ts: ['Yatoro', 'yatoro'], aur: ['Pure', 'pure'], tun: ['33'], flc: ['skiter'], tl: ['miCKe'], gg: ['Quinn'], pv: ['Satanic'], bb: ['Nightfall'] }
  const лого = (id, cls = '') => К[id][1] ? `<img class="mx-lg ${cls}" src="img/teams/${К[id][1]}.png" alt="">` : `<span class="mx-lg mx-lg--mono ${cls}">${К[id][2]}</span>`

  // ——— Матчи турнира: группы (здесь) + плей-офф (week-data.js) ———
  const мк = (n, t, a, b, st, стадия, x = {}) => Object.assign({ n, t, a, b, st, стадия, bo: 'Bo3', id: `${a}-${b}` }, x)
  const г = (n, t, a, b, sa, sb, гр) => мк(n, t, a, b, 'done', 'Группа ' + гр, { sa, sb, гр, bo: 'Bo2' })
  const ГРУППЫ = [
    г(1, 13 * 60, 'ts', 'gg', 2, 0, 'A'), г(1, 15 * 60, 'tun', 'bb', 2, 0, 'B'), г(1, 17 * 60, 'aur', 'pv', 1, 1, 'A'), г(1, 19 * 60, 'flc', 'tl', 1, 1, 'B'),
    г(2, 13 * 60, 'ts', 'aur', 2, 0, 'A'), г(2, 15 * 60, 'tun', 'flc', 1, 1, 'B'), г(2, 17 * 60, 'gg', 'pv', 1, 1, 'A'), г(2, 19 * 60, 'tl', 'bb', 2, 0, 'B'),
    г(3, 13 * 60, 'ts', 'pv', 1, 1, 'A'), г(3, 15 * 60, 'tun', 'tl', 2, 0, 'B'), г(3, 17 * 60, 'gg', 'aur', 2, 0, 'A'), г(3, 19 * 60, 'flc', 'bb', 2, 0, 'B'),
  ]
  const ПЛЕЙОФФ = [Н.ВС_4, ...Н.ДНИ].flatMap(d => d.м.filter(m => m.тур === ТУР).map(m => Object.assign({}, m, { n: d.n, id: `${m.a}-${m.b}` })))
  const М = [...ГРУППЫ, ...ПЛЕЙОФФ].sort((a, b) => a.n - b.n || a.t - b.t)
  const ДНИ = [...new Set(М.map(m => m.n))]
  const по = (n, id) => М.find(m => m.n === n && m.id === id)
  const ЭФИР = ['live', 'draft', 'pause', 'break']
  const вЭфире = М.filter(m => ЭФИР.includes(m.st))
  const ДН = { 1: 'Чт', 2: 'Пт', 3: 'Сб', 4: 'Вс', 5: 'Пн', 6: 'Вт', 7: 'Ср', 8: 'Чт', 9: 'Пт', 10: 'Сб', 11: 'Вс' }
  const ДНП = { Чт: 'четверг', Пт: 'пятница', Сб: 'суббота', Вс: 'воскресенье', Пн: 'понедельник', Вт: 'вторник', Ср: 'среда' }
  const деньСлово = n => n === СЕГОДНЯ ? 'Сегодня' : n === СЕГОДНЯ - 1 ? 'Вчера' : n === СЕГОДНЯ + 1 ? 'Завтра' : ДН[n]
  const деньЗаголовок = n => `${n === СЕГОДНЯ ? 'Сегодня' : n === СЕГОДНЯ - 1 ? 'Вчера' : n === СЕГОДНЯ + 1 ? 'Завтра' : ДНП[ДН[n]][0].toUpperCase() + ДНП[ДН[n]].slice(1)}, ${n} октября`
  const стадияДня = n => n <= 3 ? 'Группы' : n === 11 ? 'Гранд-финал' : 'Плей-офф'
  const чч = n => String(n).padStart(2, '0'), вр = мин => `${чч(Math.floor(мин / 60) % 24)}:${чч(мин % 60)}`
  const сколько = (k, w = ['матч', 'матча', 'матчей']) => `${k} ${k % 10 === 1 && k !== 11 ? w[0] : k % 10 >= 2 && k % 10 <= 4 && (k < 12 || k > 14) ? w[1] : w[2]}`

  // Часы: вт 6 октября 15:35 плюс секунды с открытия
  const t0 = Date.now(), СЕЙЧАС = 15 * 3600 + 35 * 60
  const осталось = m => {
    const s = (m.n - СЕГОДНЯ) * 86400 + m.t * 60 - (СЕЙЧАС + Math.floor((Date.now() - t0) / 1000))
    if (s <= 0) return 'начинается'
    const д = Math.floor(s / 86400), ч = Math.floor(s % 86400 / 3600), мн = Math.floor(s % 3600 / 60)
    return д ? `через ${д} дн ${ч} ч` : ч ? `через ${ч} ч ${мн} мин` : `через ${мн} мин ${чч(s % 60)} с`
  }

  // ——— Строка матча — разметка Match Center (сегодня и завтра — сами строки сайта, остальные дни — та же разметка) ———
  const ПОДПИСИ = '<span class="mx-x__lb mx-x__lb--k" title="Убийства или раунды на текущей карте">☠</span><span class="mx-x__lb mx-x__lb--pre" title="Прогноз модели до матча">PRE</span><span class="mx-x__lb mx-x__lb--odds" title="Коэффициент до матча">ODDS</span><span class="mx-x__lb mx-x__lb--live" title="Коэффициент в эфире">LIVE</span><span class="mx-x__lb mx-x__lb--val" title="Ценность ставки: прогноз против коэффициента">VAL</span>'
  const ИК = {
    bell: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a4 4 0 0 0-4 4v2.5L3 11h10l-1-2.5V6a4 4 0 0 0-4-4ZM6.5 13a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.2l2 1.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    tv: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 6.3v3.4L9.8 8Z" fill="currentColor"/></svg>',
    chat: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5v5A1.5 1.5 0 0 1 11.5 11H7l-3 2.5V11h0a1 1 0 0 1-1-1Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const ФОРМА = { ts: 'wwwlw', tun: 'wlwww', flc: 'wwlww', tl: 'lwwll', gg: 'lwlwl', aur: 'wllwl', pv: 'llwlw', bb: 'lllwl' }
  const форма = (k, n = 4) => `<span class="mx-form">${[...ФОРМА[k].slice(0, n)].map(c => `<i class="${c}"></i>`).join('')}</span>`
  const шанс = m => Math.round(100 * СИЛА[m.a] ** 3 / (СИЛА[m.a] ** 3 + СИЛА[m.b] ** 3))
  const кф = p => (0.94 / (p / 100)).toFixed(2)
  const ссылка = m => `match-page.html?game=dota&amp;state=${m.st === 'done' ? 'done' : ЭФИР.includes(m.st) ? 'live' : 'pre'}`
  const строка = m => {
    if ((m.n === СЕГОДНЯ || m.n === СЕГОДНЯ + 1) && НАСТОЯЩИЕ[m.id]) return НАСТОЯЩИЕ[m.id]
    const итог = m.st === 'done', p = шанс(m), ст = m.стадия
    const кол = (k, pp) => `<span class="mx-x__v mx-x__v--k is-none">—</span><span class="mx-x__v mx-x__v--pre">${pp}%</span><span class="mx-x__v mx-x__v--odds">${кф(pp)}</span><span class="mx-x__v mx-x__v--live is-none">—</span><span class="mx-x__v mx-x__v--val ${!итог && pp > 55 ? '' : 'is-none'}">${!итог && pp > 55 ? '+' + (pp - 53) + '%' : '—'}</span>`
    const тм = (k, свои, чужие, pp) => `<span class="mx-x__t ${итог ? (свои > чужие ? 'is-win' : свои < чужие ? 'is-lose' : '') : ''}">${лого(k)}<span class="mx-x__n"><b class="mx-nm">${К[k][0]}</b>${форма(k)}</span></span>${кол(k, pp)}`
    const конец = вр(m.t + (m.bo === 'Bo2' ? 100 : m.bo === 'Bo5' ? 240 : 150))
    const время = итог ? `<b class="mx-x__sc">${m.sa} : ${m.sb}</b><small>Итог · ${конец}</small>` : `<b>${вр(m.t)}</b><small>${m.если || `${ДН[m.n]}, ${m.n} окт`}</small>`
    const поб = итог ? (m.sa > m.sb ? m.a : m.sb > m.sa ? m.b : null) : null
    const карты = итог ? Array.from({ length: m.sa + m.sb }, (_, i) => `<span><small>К${i + 1} · ${32 + (i * 7 + m.t) % 15}′</small>${24 + (i * 5 + m.t) % 12}:${14 + (i * 3 + m.t) % 9}</span>`).join('') : ''
    const xb = итог
      ? `<div class="mx-q__c"><small>Карты серии</small><div class="mx-q-maps">${карты}</div></div><div class="mx-q__c"><small>Игрок матча</small><div class="mx-q-pl"><img class="mx-q-ava" src="img/players/${(ИГРОК[поб || m.a][1] || '_silhouette') + (ИГРОК[поб || m.a][1] ? '.webp' : '.png')}" alt="" /><span><b>${ИГРОК[поб || m.a][0]} · ${К[поб || m.a][0]}</b><small>${11 + m.t % 7} / ${2 + m.t % 3} / ${9 + m.t % 6}</small></span></div></div><div class="mx-q__c"><small>${m.гр ? 'Группа ' + m.гр : 'Сетка'}</small><p class="mx-q-big"><b>${поб ? К[поб][2] : 'Ничья'}</b><span>${поб ? (m.гр ? '+3 очка в группе' : 'проходит дальше') : '+1 очко обеим'}</span></p></div>`
      : `<div class="mx-q__c"><small>Форма · 5 матчей</small><div class="mx-q-forms">${[m.a, m.b].map(k => `<p>${лого(k, 'sm')}${форма(k, 5)}<small style="color:var(--c-caption)">${[...ФОРМА[k]].filter(c => c === 'w').length} из 5</small></p>`).join('')}</div></div><div class="mx-q__c"><small>Личные встречи</small><p class="mx-q-big"><b>${p > 50 ? '3 : 1' : '1 : 3'}</b><span>в пользу ${К[p > 50 ? m.a : m.b][0]}<br />в этом турнире — ${М.some(x => x.n < m.n && ((x.a === m.a && x.b === m.b) || (x.a === m.b && x.b === m.a))) ? 'уже играли' : 'впервые'}</span></p></div><div class="mx-q__c"><small>${m.если ? 'Если пары сложатся' : 'Прогноз зрителей'}</small><p class="mx-q-big"><b>${m.если ? m.bo : p > 50 ? '2 : 1' : '1 : 2'}</b><span>${m.если || `${30 + m.t % 20}% голосов`}</span></p></div>`
    const xa = итог ? `<a class="mx-btn mx-btn--main" href="${ссылка(m)}">Страница матча</a><a class="mx-btn" href="#">Запись</a>` : `<a class="mx-btn mx-btn--main" href="${ссылка(m)}">Страница матча</a><a class="mx-btn" href="#">★ Напомнить</a>`
    return `<article class="mx-row st-${итог ? 'done' : 'soon'} is-click" data-id="${m.id}"><div class="mx-row__in mx-x"><div class="mx-x__g">
      <p class="mx-x__h"><span class="mx-gt">Dota 2</span><span class="mx-x__tour">${ТУР} · ${ст} · ${m.bo}</span><a class="mx-x__go" href="${ссылка(m)}">матч ›</a></p>${ПОДПИСИ}
      ${тм(m.a, m.sa, m.sb, p)}${тм(m.b, m.sb, m.sa, 100 - p)}
      <p class="mx-x__f"><span class="mx-x__st ${итог ? 'is-mute' : ''}"><i></i>${итог ? 'Завершён' : 'Запланирован'}</span><button class="mx-fav" type="button" title="Уведомлять о матче">${ИК.bell}</button><span class="mx-x__clock">${ИК.clock}${итог ? конец : вр(m.t)}</span></p><p class="mx-x__ic"><a href="${ссылка(m)}" title="Трансляция">${ИК.tv}</a><a href="${ссылка(m)}" title="Обсуждение">${ИК.chat}</a><span class="mx-chev">${ИК.chev}</span></p>
      </div><div class="mx-x__time">${время}</div>
      <div class="mx-xo mx-xo--b"><div class="mx-xo__clip"><div class="mx-xo__pad">${xb}</div></div></div>
      <div class="mx-xo mx-xo--a"><div class="mx-xo__clip"><div class="mx-xo__pad">${xa}</div></div></div></div></article>`
  }
  // Матчи дня одним блоком турнира, как в Match Center: полоса-заголовок и строки
  const деньБлок = (n, o = {}) => {
    const мс = М.filter(m => m.n === n).sort((a, b) => (ЭФИР.includes(b.st) - ЭФИР.includes(a.st)) || a.t - b.t)
    const стадии = [...new Set(мс.map(m => m.стадия))].join(' · ')
    return `${o.безЗаголовка ? '' : `<h2 class="mx-day">${деньЗаголовок(n)} <small>${сколько(мс.length)}</small></h2>`}
      <section class="mx-tour"><header class="mx-tb"><span class="mx-gt">${стадияДня(n)}</span><b>${стадии}</b><span class="mx-tb__w">${ДН[n]}, ${n} октября</span></header>${мс.map(строка).join('')}</section>`
  }

  // ——— Шапка турнира — шапка страницы матча (.mp-top): слева турнир, в центре что идёт, справа фонд ———
  const шапка = () => `<div class="mp trn-mp"><p class="mp-crumbs"><a href="match-center.html">Match Center</a> / Dota 2 / ${ТУР}</p>
    <header class="mp-top trn-top" style="--ta:var(--c-game-dota);--tb:var(--c-coin)">
      <div class="mp-team"><span class="mp-lg mp-lg--mono trn-emb">B<small>VIII</small></span><span><b>${ТУР}</b><small>Dota 2 · S-тир · Мальта, LAN · 8 команд</small></span></div>
      <div class="mp-c"><p>Плей-офф · день 3 из 7 · полуфиналы верхней</p><b class="trn-live"><i class="mx-dot"></i>${вЭфире.length} в эфире</b><span class="mp-res">${вЭфире.map(m => `${К[m.a][2]} — ${К[m.b][2]} ${m.sa} : ${m.sb}`).join(' · ')}</span></div>
      <div class="mp-team"><span class="mp-lg mp-lg--mono trn-emb trn-emb--gold">$</span><span><b>$1 000 000</b><small>призовой фонд · 1–11 октября</small></span></div>
    </header></div>`

  // ——— Сетка плей-офф: строится из тех же матчей ———
  const СЕТКА = {
    верх: [['Четвертьфиналы', [[4, 'ts-bb'], [4, 'tun-gg'], [5, 'flc-aur'], [5, 'tl-pv']]], ['Полуфиналы', [[6, 'ts-tun'], [6, 'flc-tl']]], ['Финал верхней', [[7, 'ts-flc']]]],
    низ: [['Раунд 1', [[6, 'aur-bb'], [6, 'gg-pv']]], ['Раунд 2', [[8, 'tl-gg'], [9, 'aur-pv']]], ['Финал нижней', [[10, 'ts-tl']]]],
    финал: [['Гранд-финал · Bo5', [[11, 'ts-flc']]]],
  }
  const ячейка = (m, sel) => {
    const эф = ЭФИР.includes(m.st), итог = m.st === 'done'
    const сторона = (k, s, o) => `<span class="trn-bm__t ${итог ? (s > o ? 'is-win' : 'is-lose') : ''}">${лого(k, 'sm')}<em>${К[k][0]}</em><b>${m.st === 'soon' || m.st === 'delay' ? '' : s}</b></span>`
    const верх = эф ? `<i class="mx-dot"></i>${m.st === 'pause' ? 'Пауза' : 'В эфире'} · карта ${m.карта}` : итог ? `${ДН[m.n]}, ${m.n} окт` : `${ДН[m.n]}, ${m.n} окт · ${вр(m.t)}`
    return `<button type="button" class="trn-bm ${эф ? 'is-air' : ''} ${m.если ? 'is-if' : ''} ${sel === m.n + ':' + m.id ? 'is-sel' : ''}" data-bm="${m.n}:${m.id}"><span class="trn-bm__h">${верх}</span>${сторона(m.a, m.sa, m.sb)}${сторона(m.b, m.sb, m.sa)}${m.если ? `<span class="trn-bm__if">${m.если}</span>` : ''}</button>`
  }
  const сетка = (sel, части = ['верх', 'низ', 'финал'], мини = false) => `<div class="trn-br ${мини ? 'trn-br--mini' : ''}">${части.map(ч => `<div class="trn-br__part trn-br__part--${ч}">
      ${ч === 'финал' ? '' : `<p class="trn-br__h">${ч === 'верх' ? 'Верхняя сетка' : 'Нижняя сетка'}</p>`}<div class="trn-br__cols">${СЕТКА[ч].map(([имя, ids]) => `<div class="trn-br__col"><h4>${имя}</h4><div>${ids.map(([n, id]) => ячейка(по(n, id), sel)).join('')}</div></div>`).join('')}</div></div>`).join('')}</div>`

  // ——— Группы, стадии, призовые ———
  const таблица = гр => {
    const r = {}
    ГРУППЫ.filter(m => m.гр === гр).forEach(m => [[m.a, m.sa, m.sb], [m.b, m.sb, m.sa]].forEach(([k, s, o]) => {
      const x = r[k] || (r[k] = { k, о: 0, в: 0, н: 0, п: 0, к: 0, кп: 0 })
      x.к += s; x.кп += o; if (s > o) { x.в++; x.о += 3 } else if (s === o) { x.н++; x.о++ } else x.п++
    }))
    return Object.values(r).sort((a, b) => b.о - a.о || (b.к - b.кп) - (a.к - a.кп))
  }
  const группы = (полно = false) => ['A', 'B'].map(гр => `<div class="trn-tbl"><p class="trn-tbl__h">Группа ${гр}</p><table>
      <thead><tr><th></th><th>Команда</th>${полно ? '<th>В</th><th>Н</th><th>П</th>' : ''}<th>Карты</th><th>Очки</th></tr></thead><tbody>
      ${таблица(гр).map((x, i) => `<tr class="${i < 2 ? 'is-up' : ''}"><td>${i + 1}</td><td><span>${лого(x.k, 'sm')}${полно ? К[x.k][0] : К[x.k][2]}</span></td>${полно ? `<td>${x.в}</td><td>${x.н}</td><td>${x.п}</td>` : ''}<td>${x.к}–${x.кп}</td><td><b>${x.о}</b></td></tr>`).join('')}</tbody></table></div>`).join('')
  const стадии = () => `<ol class="mx-steps"><li class="is-done">Группы<small>1–3 окт</small></li><li class="is-now">Плей-офф<small>4–10 окт · сейчас</small></li><li>Гранд-финал<small data-left="11:ts-flc">${осталось(по(11, 'ts-flc'))}</small></li></ol>`
  const ПРИЗЫ = [['1', '$400 000'], ['2', '$200 000'], ['3', '$120 000'], ['4', '$80 000'], ['5–6', '$50 000'], ['7–8', '$25 000 · BetBoom, …']]
  const СТАТУС = { ts: ['up', 'в эфире — полуфинал верхней'], tun: ['up', 'в эфире — полуфинал верхней'], flc: ['up', 'полуфинал верхней в 17:00'], tl: ['up', 'полуфинал верхней в 17:00'],
    aur: ['low', 'нижняя сетка · следующий 9 окт'], gg: ['low', 'нижняя сетка · на паузе'], pv: ['low', 'нижняя сетка · ведёт 1 : 0'], bb: ['out', 'выбыли · 7–8 место'] }
  const пан = (h, html, cls = '') => `<div class="mx-pan ${cls}"><h3>${h}</h3>${html}</div>`
  const панТурнир = () => пан('Турнир', `<p class="trn-fmt">Группы Bo2 → плей-офф Bo3 до двух поражений → гранд-финал Bo5</p>${стадии()}`)
  const панПризы = () => пан('Призовые', `<ol class="trn-prize">${ПРИЗЫ.map(([м, п]) => `<li><span>${м}</span><b>${п}</b></li>`).join('')}</ol>`)
  const панКоманды = () => пан('Команды', `<div class="trn-teams">${Object.keys(СИЛА).map(k => `<p class="is-${СТАТУС[k][0]}">${лого(k, 'sm')}<span><b>${К[k][0]}</b><small>${СТАТУС[k][1]}</small></span></p>`).join('')}</div>`)
  const полосаДней = n => `<div class="mx-days trn-days">${ДНИ.map(x => { const k = М.filter(m => m.n === x).length
    return `<button type="button" class="${x < СЕГОДНЯ ? 'is-past' : ''}" data-td="${x}" aria-pressed="${x === n}"><b>${деньСлово(x)}</b><span>${x} окт</span><small>${x === СЕГОДНЯ ? `● ${вЭфире.length} в эфире` : x === 11 ? 'финал' : сколько(k)}</small></button>` }).join('')}</div>`

  // ——— Варианты ———
  const S = { td: +q.get('td') || СЕГОДНЯ, tab: q.get('tab') || 'm', sel: q.get('sel') || `${СЕГОДНЯ}:ts-tun` }
  const v1 = () => ({ // Match Center турнира: дни турнира → матчи дня; справа турнир, сетка, группы, призовые
    main: `${шапка()}${полосаДней(S.td)}<div data-day-box>${деньБлок(S.td)}${S.td === СЕГОДНЯ ? деньБлок(СЕГОДНЯ + 1) : ''}</div>`,
    right: `${панТурнир()}${пан('Сетка плей-офф', сетка(S.sel, ['верх'], true), 'trn-pan-br')}${пан('Группы', группы())}${панПризы()}`,
  })
  const v2 = () => { // Как страница матча: шапка → 4 плитки → открытая плитка; телефон — сегмент
    const ПЛ = [['m', 'Матчи', 'сегодня', `<b class="w">${вЭфире.length}</b> в эфире`, `${сколько(М.filter(m => m.n === СЕГОДНЯ).length)} сегодня · ${сколько(М.length)} всего`, 'var(--c-live)'],
      ['b', 'Сетка', 'плей-офф', '<b class="w">8</b> → 1', 'полуфиналы верхней', 'var(--c-accent)'],
      ['g', 'Группы', '1–3 окт', '<b class="w">TS</b> · TUN', 'первые в группах A и B', 'var(--c-coin)'],
      ['t', 'Команды', 'кто где', '<b class="w">7</b> / 8', 'в игре · BetBoom выбыли', 'var(--c-team-tl)']]
    const пан2 = { m: `${полосаДней(S.td)}<div data-day-box>${деньБлок(S.td)}${S.td === СЕГОДНЯ ? деньБлок(СЕГОДНЯ + 1) : ''}</div>`,
      b: `<div class="mx-pan trn-pan-wide">${сетка(S.sel)}</div><div data-bm-row></div>`, g: `<div class="trn-groups">${группы(true)}</div>`, t: `<div class="trn-cols2">${панКоманды()}${панПризы()}</div>` }
    return { main: `${шапка()}<div class="mp trn-mp"><div class="mp-tk"><nav class="mp-seg" aria-label="Разделы турнира"><div class="mp-seg__in">${ПЛ.map(([id, t, , , , tc]) => `<button type="button" class="mp-sg" data-tab="${id}" aria-selected="${S.tab === id}" style="--tc:${tc}">${t}</button>`).join('')}</div></nav>
      <div class="mp-tiles">${ПЛ.map(([id, t, sub, em, низ, tc]) => `<button type="button" class="mp-tile" data-tab="${id}" aria-selected="${S.tab === id}" style="--tc:${tc}"><span><b>${t}</b><small>${sub}</small></span><em>${em}</em><span class="mp-tile__w">${низ}</span></button>`).join('')}</div></div></div>
      ${ПЛ.map(([id]) => `<div class="trn-pane" data-pane="${id}"${S.tab === id ? '' : ' hidden'}>${пан2[id]}</div>`).join('')}
      ${блокиПодПлитками()}`, right: null }
  }
  // ——— v2: блоки под плитками — всегда на странице, при любой открытой плитке (дирижёр 08.10: под изменяемым контентом, друг под другом — новости, букмекеры, переход в фэнтези) ———
  const ПОБЕДИТЕЛЬ = [['ts', 2.4, 'Fonbet'], ['flc', 3.1, 'Winline'], ['tun', 4.5, 'BetBoom'], ['tl', 6.0, 'Fonbet'], ['gg', 15, 'Winline'], ['aur', 21, 'BetBoom'], ['pv', 26, 'Fonbet']]
  const панБукмекеры = () => { const сумма = ПОБЕДИТЕЛЬ.reduce((x, [, k]) => x + 1 / k, 0)
    return `<section class="mp-sec trn-bk"><h3 class="mp-h">Кто выиграет турнир</h3>
      ${ПОБЕДИТЕЛЬ.slice(0, 5).map(([k, кф, бк]) => { const p = Math.round(100 / кф / сумма)
        return `<div class="trn-bk__r">${лого(k, 'sm')}<span><b>${К[k][0]}</b><small>${СТАТУС[k][0] === 'up' ? 'верхняя сетка' : 'нижняя сетка'} · ${бк}</small></span><div class="mx-bar"><i style="width:${p * 2}%"></i></div><em>${p}%</em><button type="button" class="trn-odd">${кф.toFixed(2)}</button></div>` }).join('')}
      <p class="trn-bk__ft"><a class="mx-link" href="#">Все коэффициенты ›</a><small>18+ · ставки — у букмекеров</small></p></section>` }
  const панФэнтези = () => `<section class="mp-sec trn-fan"><h3 class="mp-h">Фэнтези · плей-офф BLAST</h3>
      <p class="trn-fan__t">Собери пятёрку из игроков турнира — очки за каждую карту плей-офф</p>
      <div class="trn-fan__mine"><img class="mx-lg sm" src="img/teams/flc.png" alt=""><span><b>2 твоих игрока сегодня</b><small>Falcons — Liquid · 17:00</small></span></div>
      <div class="trn-fan__lock"><small>Состав закрывается через</small><b data-left="6:flc-tl">${осталось(по(6, 'flc-tl'))}</b></div>
      <p class="trn-fan__ft"><a class="mx-btn mx-btn--main" href="lineup.html">Собрать состав</a><a class="mx-btn" href="gallery.html">Карты турнира</a></p></section>`
  const НОВОСТИ = [['Tundra без Topson на BLAST: замена — 33', '1 час назад'], ['Spirit — Tundra: Yatoro снова на Terrorblade, третий матч подряд', '25 минут назад'], ['Falcons и Liquid: кто сильнее перед полуфиналом — разбор', '3 часа назад'], ['Aurora выбила BetBoom: Pure — игрок матча', '4 часа назад']]
  const панНовости = () => `<div class="mx-pan"><h3>Новости турнира</h3>${НОВОСТИ.map(([т, к]) => `<a class="mx-nw" href="#"><span class="mx-gt">Dota 2</span> ${т}<small>${к}</small></a>`).join('')}<a class="mx-link" href="#">Все новости ›</a></div>`
  // Блоки под плиткой — как на странице матча (решение 20): та же сетка .mp5-grid и те же секции .mp-sec, основная колонка + узкая справа
  const ава = n => `<img class="mp-ava-s" src="img/players/${['yatoro', 'pure', 'rue', '9class'].includes(n.toLowerCase()) ? n.toLowerCase() + '.webp' : '_silhouette.png'}" alt="" />`
  const сек = (t, html) => `<section class="mp-sec">${t ? `<h3 class="mp-h">${t}</h3>` : ''}${html}</section>`
  const ЛУЧШИЕ = [['Больше всех убийств', 'Yatoro', 'ts', '87'], ['Лучший GPM', 'Yatoro', 'ts', '742'], ['Больше помощи', 'Miposhka', 'ts', '164'], ['Варды', 'Whitemon', 'tun', '118'], ['Урон по зданиям', 'skiter', 'flc', '41.2 тыс.'], ['Серия побед', 'Team Spirit', 'ts', '6 подряд']]
  const ВИДЕО = [['Лучшие моменты плей-офф: день 2', '6:40'], ['Pure — игрок матча против BetBoom', '1:12'], ['Интервью Yatoro перед полуфиналом', '3:05']]
  const О_ТУРНИРЕ = [['Даты', '1–11 октября'], ['Формат', 'группы Bo2 → плей-офф Bo3 до двух поражений → финал Bo5'], ['Призовой фонд', '$1 000 000'], ['Команд', '8 · по приглашениям и отборам'], ['Где', 'Мальта · LAN, финал с публикой'], ['Версия', 'Патч 7.39d'], ['Организатор', 'BLAST'], ['Языки эфира', 'RU · EN · ES · PT']]
  const ДРУГИЕ = [['CS2', 'ESL Pro League S24', 'группа C · 2 в эфире'], ['LoL', 'Worlds 2026', 'швейцарка · драфт'], ['Valorant', 'VCT Champions 2026', 'плей-офф · завтра'], ['MLBB', 'MPL Indonesia S18', 'неделя 7 · 20:00']]
  const блокиПодПлитками = () => `<div class="mp trn-mp"><div class="mpo"><div class="mp5-grid">
      <div class="mp5-main">${сек('Лучшие в турнире', `<div class="mp-recs">${ЛУЧШИЕ.map(([t, n, k, v]) => `<p><small>${t}</small>${ава(n)}<span><b>${n}</b><i>${К[k][0]}</i></span><em>${v}</em></p>`).join('')}</div>`)}
        ${сек('Новости турнира', `<div class="mp-news">${НОВОСТИ.map(([т, к]) => `<a href="#"><b>${т}</b><small>новость · ${к}</small></a>`).join('')}</div>`)}
        ${сек('Видео', `<div class="mp-vids">${ВИДЕО.map(([t, d], i) => `<a href="#" class="mp-vid"><span class="mp-vid__th" style="--i:${i}"><i>▶</i><em>${d}</em></span><b>${t}</b></a>`).join('')}</div>`)}</div>
      <aside class="mp5-side">${сек('О турнире', `<dl class="mp-pass">${О_ТУРНИРЕ.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`)}
        ${панБукмекеры()}${панФэнтези()}
        ${сек('Другие турниры', `<div class="trn-other">${ДРУГИЕ.map(([g, n, s]) => `<a href="#"><span class="mx-gt">${g}</span><b>${n}</b><small>${s}</small></a>`).join('')}</div>`)}</aside>
    </div></div></div>`

  const v3 = () => ({ // Сетка — главное: сетка во всю ширину, выбранный матч — настоящей раскрытой строкой
    main: `${шапка()}<div class="mx-pan trn-pan-wide"><h3>Сетка плей-офф <small>до двух поражений · нажми на матч</small></h3>${сетка(S.sel)}</div><div data-bm-row></div>${деньБлок(СЕГОДНЯ)}`,
    right: `${панТурнир()}${пан('Группы', группы())}${панКоманды()}${панПризы()}`,
  })

  // ——— Сборка: шапка и футер сайта, вместо Match Center — турнир ———
  document.title = `${ТУР} — турнир`
  document.body.innerHTML = сайт.body.innerHTML
  document.body.dataset.trn = V
  const mc = document.querySelector('.mc'), r = { v1, v2, v3 }[V]()
  mc.innerHTML = `<div class="mx-app ${r.right ? '' : 'trn-app--one'}"><main class="mx-main">${r.main}</main>${r.right ? `<aside class="mx-right">${r.right}</aside>` : ''}</div>`
  // Выбранный матч сетки — настоящей строкой под сеткой, сразу раскрыт
  const строкаПодСеткой = () => { const box = mc.querySelector('[data-bm-row]'); if (!box) return
    const [n, id] = S.sel.split(':'), m = по(+n, id)
    box.innerHTML = `<h2 class="mx-day">Выбранный матч <small>${m.стадия} · ${ДН[m.n]}, ${m.n} окт</small></h2><section class="mx-tour">${строка(m)}</section>`
    box.querySelector('.mx-row')?.classList.add('is-open') }
  строкаПодСеткой()

  mc.addEventListener('click', e => {
    const d = e.target.closest('[data-td]'), t = e.target.closest('[data-tab]'), b = e.target.closest('[data-bm]')
    if (d) { S.td = +d.dataset.td; mc.querySelectorAll('[data-td]').forEach(x => x.setAttribute('aria-pressed', +x.dataset.td === S.td)); mc.querySelector('[data-day-box]').innerHTML = деньБлок(S.td) + (S.td === СЕГОДНЯ ? деньБлок(СЕГОДНЯ + 1) : '') }
    if (t) { S.tab = t.dataset.tab; mc.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x.dataset.tab === S.tab)); mc.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== S.tab }) }
    if (b) {
      S.sel = b.dataset.bm; mc.querySelectorAll('[data-bm]').forEach(x => x.classList.toggle('is-sel', x.dataset.bm === S.sel))
      if (mc.querySelector('[data-bm-row]')) { строкаПодСеткой(); mc.querySelector('[data-bm-row]').scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
      else { const [n] = S.sel.split(':'); mc.querySelector(`[data-td="${n}"]`)?.click() } // v1: малая сетка открывает день матча
    }
  })
  setInterval(() => document.querySelectorAll('[data-left]').forEach(el => { const [n, id] = el.dataset.left.split(':'); el.textContent = осталось(по(+n, id)) }), 1000)

  // Поведение сайта: раскрытие строк, липкая колонка, шапка — app.js
  await new Promise(ok => { const s = document.createElement('script'); s.src = 'app.js'; s.onload = ok; document.body.append(s) })
  if (q.get('open')) mc.querySelector(`.mx-row[data-id="${q.get('open')}"]`)?.classList.add('is-open')
  if (q.get('scroll')) requestAnimationFrame(() => scrollTo(0, +q.get('scroll')))
  parent.postMessage({ trn: 'ready', h: document.documentElement.scrollHeight }, '*')
})()
