// Лаба «Матч после» — страница матча, когда серия закончилась (исследование «Игровые клиенты», направление Г «Сцена матча»).
// Источники подачи: VALORANT (счёт и победа на весь экран, MVP отдельно, у игрока 2 числа), Rocket League (спотлайт с титулами → таблица,
// «следующий матч через…»), Dota 2 (пост-матч: Обзор / Таблица / Графики, нетворс с иконками событий), Flapscore (одна шапка + вкладки),
// EA FC (итог одной фразой + движение по сетке + строка KPI). Данные условные: Dota 2 Spirit — Tundra 2 : 1, CS2 G2 — FaZe 2 : 0.
// Движок: данные серии + кусочки (x). Вариант задаёт раскладку: MA.вариант = (m, x) => html. Рамки — десктоп 1440 (уменьшается под окно) и телефон 390.
;(() => {
  const К = { ts: ['Team Spirit', 'ts'], tun: ['Tundra Esports', 'tun'], flc: ['Team Falcons', 'flc'], tl: ['Team Liquid', 'tl'], g2: ['G2 Esports', 0, 'G2'], faze: ['FaZe Clan', 0, 'FZ'], vit: ['Team Vitality', 0, 'VIT'], mgz: ['The MongolZ', 0, 'MGZ'] }
  const лого = (id, cls = '') => { const t = К[id]; return t[1] ? `<img class="r-lg ${cls}" src="/p-fw3k/site/img/teams/${t[1]}.png" alt="" />` : `<span class="r-lg r-lg--mono ${cls}">${t[2]}</span>` }
  const имя = (id) => К[id][0]
  const ФОТО = { Yatoro: 'yatoro', rue: 'rue' }
  const фото = (n) => `/p-fw3k/site/img/players/${ФОТО[n] ? ФОТО[n] + '.webp' : '_silhouette.png'}`
  const ава = (n, cls = 'a-ava') => `<img class="${cls}" src="${фото(n)}" alt="" />`
  const ГЕРОИ = ['terrorblade', 'morphling', 'mars', 'hoodwink', 'tusk', 'faceless_void', 'lycan', 'beastmaster', 'rubick']
  const ГЕРОЙ_ИМЯ = ['Terrorblade', 'Morphling', 'Mars', 'Hoodwink', 'Tusk', 'Faceless Void', 'Lycan', 'Beastmaster', 'Rubick']
  const гер = (i, cls = 'a-hero') => `<img class="${cls}" src="/p-fw3k/site/img/heroes/${ГЕРОИ[i]}.webp" alt="${ГЕРОЙ_ИМЯ[i]}" title="${ГЕРОЙ_ИМЯ[i]}" />`
  const ЦВЕТ = { ts: 'var(--c-team-ts)', tun: 'var(--c-team-tun)', g2: 'var(--c-live)', faze: 'var(--c-accent)' }

  // CS: раунды строкой (A — первая команда, B — вторая) → разница по раундам для графика
  const раунды = (s) => { let d = 0; return [0, ...[...s].map((c) => (d += c === 'A' ? 1 : -1))] }

  const СЕРИИ = {
    dota: {
      g: 'dota', a: 'ts', b: 'tun', игра: 'Dota 2', тур: 'BLAST Slam VIII', стадия: 'Полуфинал верхней сетки', bo: 'Bo3', серия: [2, 1], дата: '6 октября', длит: '2 ч 04 мин',
      фраза: ['Spirit выходят в финал верхней сетки', 'Tundra уходят в нижнюю сетку — завтра против Liquid'],
      карты: [
        { n: 'Карта 1', под: 'Spirit — свет', сч: [34, 21], поб: 'a', длит: '41 мин', mvp: ['Yatoro', 'a', '14 / 2 / 11 · Terrorblade'], шаг: 2,
          ход: [0, 0.3, 0.8, 0.2, -0.6, 0.4, 1.5, 2.8, 3.1, 4.6, 5.2, 7.9, 9.4, 12.1, 15.0, 14.2, 18.5, 21.3, 24.0, 26.8, 30.2],
          соб: [[6, 'fight', 'b', 'Первая кровь — Crystallis'], [13, 'tower', 'a', 'Первая башня — Spirit'], [19, 'fight', 'a', 'Larl — тройное убийство'], [24, 'rosh', 'a', 'Рошан — Aegis у Yatoro'], [33, 'tower', 'a', 'Бараки на миде'], [41, 'gg', 'a', 'ГГ · 34 : 21']],
          пики: { a: [0, 2, 3, 4, 8], b: [5, 6, 7, 1, 3] } },
        { n: 'Карта 2', под: 'Spirit — тьма', сч: [22, 31], поб: 'b', длит: '47 мин', mvp: ['Crystallis', 'b', '12 / 3 / 9 · Faceless Void'], шаг: 2,
          ход: [0, -0.4, -1.2, -0.8, 0.6, 1.1, 0.2, -1.8, -3.5, -2.9, -5.6, -4.1, -2.2, -1.0, -3.8, -6.9, -9.2, -8.4, -11.6, -14.0, -16.3, -19.8, -22.4, -25.1],
          соб: [[8, 'fight', 'a', 'Первая кровь — Larl'], [15, 'tower', 'b', 'Tundra снесли две башни'], [21, 'rosh', 'b', 'Рошан — Tundra'], [27, 'fight', 'a', 'Spirit отыгрались у реки'], [36, 'rosh', 'b', 'Второй Рошан — Tundra'], [47, 'gg', 'b', 'ГГ · 22 : 31']],
          пики: { a: [1, 2, 3, 4, 8], b: [5, 6, 7, 0, 3] } },
        { n: 'Карта 3', под: 'решающая · Spirit — свет', сч: [43, 19], поб: 'a', длит: '36 мин', mvp: ['Larl', 'a', '13 / 1 / 16 · Lycan'], шаг: 2,
          ход: [0, 0.5, 1.4, 2.2, 1.6, 3.9, 5.1, 4.0, 6.8, 9.3, 12.4, 11.0, 15.6, 18.9, 22.1, 25.7, 28.4, 31.0],
          соб: [[4, 'fight', 'a', 'Первая кровь — Yatoro'], [11, 'tower', 'a', 'Две башни за минуту'], [17, 'rosh', 'a', 'Рошан — Spirit'], [23, 'fight', 'a', 'Collapse — Reverse Polarity на пятерых'], [29, 'rosh', 'a', 'Второй Aegis'], [36, 'gg', 'a', 'ГГ · 43 : 19']],
          пики: { a: [5, 6, 2, 3, 8], b: [0, 1, 7, 4, 3] } },
      ],
      // игрок: имя, роль, герои по картам, У, С, П, GPM, XPM, средний нетворс (тыс.)
      игроки: {
        a: [['Yatoro', 'Керри', [0, 1, 5], 27, 6, 19, 742, 801, 24.1], ['Larl', 'Мид', [2, 2, 6], 24, 7, 31, 664, 760, 20.3], ['Collapse', 'Хардлейн', [3, 3, 2], 11, 9, 38, 498, 590, 15.2], ['rue', 'Поддержка 4', [4, 4, 3], 6, 14, 41, 352, 455, 9.8], ['Miposhka', 'Поддержка 5', [8, 8, 8], 3, 12, 52, 281, 402, 7.4]],
        b: [['Crystallis', 'Керри', [5, 5, 0], 21, 11, 16, 701, 742, 21.8], ['bzm', 'Мид', [6, 6, 1], 18, 12, 22, 640, 703, 19.0], ['33', 'Хардлейн', [7, 7, 7], 9, 14, 25, 480, 566, 13.9], ['Saksa', 'Поддержка 4', [1, 0, 4], 5, 16, 33, 310, 420, 8.6], ['Whitemon', 'Поддержка 5', [3, 3, 3], 2, 15, 38, 270, 391, 6.9]],
      },
      // MVP серии + два числа на игрока (как VALORANT: средний счёт и У/С/П)
      mvp: ['Yatoro', 'a', 'Керри', 'Terrorblade · Morphling · Faceless Void'],
      два: ['У / С / П', 'GPM'],
      титулы: [['Yatoro', 'Больше всех убийств', '27 за серию'], ['Yatoro', 'Лучший GPM', '742 золота в минуту'], ['Larl', 'Урон по зданиям', '18.4 тыс.'], ['Collapse', 'Ни одной смерти', 'на карте 3'], ['rue', 'Больше всех вардов', '61 вард'], ['Miposhka', 'Больше всех помощи', '52 помощи']],
      kpi: [['Убийства', '99 : 71'], ['Рошаны', '4 : 2'], ['Башни', '24 : 15'], ['Длительность', '2 ч 04 мин'], ['Рейтинг Spirit', '+18', 'up', '3-е → 2-е']],
      путь: [['Групповой этап', '1-е место', 'done'], ['Четвертьфинал ВС', '2 : 0 Falcons', 'done'], ['Полуфинал ВС', '2 : 1 Tundra', 'now'], ['Финал ВС', '8 окт · Falcons', 'next'], ['Гранд-финал', '12 окт · LAN', 'wait']],
      сетка: { было: 'Полуфинал верхней сетки', стало: 'Финал верхней сетки', вниз: 'Нижняя сетка · раунд 3' },
      дальше: [['a', 'flc', 'Финал верхней сетки', '8 октября · 17:00', 44 * 3600 + 12 * 60], ['b', 'tl', 'Нижняя сетка · раунд 3', '7 октября · 14:00', 23 * 3600 + 25 * 60]],
      фэнтези: { очки: '+37.6', место: ['412', '288'], мои: [['Yatoro', 'a', '+31.4', 'капитан ×1.5'], ['Saksa', 'b', '+6.2', '']], прогноз: ['Spirit 2 : 1', 'точно', '+50 монет'] },
      прогнозы: [['Spirit — Falcons', '8 окт', 54], ['Tundra — Liquid', '7 окт', 61]],
    },
    cs: {
      g: 'cs', a: 'g2', b: 'faze', игра: 'CS2', тур: 'ESL Pro League S24', стадия: 'Группа C · решающий матч', bo: 'Bo3', серия: [2, 0], дата: '6 октября', длит: '1 ч 42 мин',
      фраза: ['G2 выходят в плей-офф', 'FaZe выбывают из турнира — 9–12 место'],
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
      mvp: ['m0NESY', 'a', 'Снайпер', 'Mirage 1.52 · Inferno 1.30 · 3 эйса за турнир'],
      два: ['У – С', 'Рейтинг'],
      титулы: [['m0NESY', 'Больше всех убийств', '47 за серию'], ['m0NESY', 'Убийства с AWP', '28'], ['huNter-', 'Клатчи', '3 из 4'], ['malbsMd', 'Первые убийства', '9 раундов'], ['HeavyGod', 'Дефьюзы', '4 бомбы'], ['Snax', 'Помощь флешками', '14']],
      kpi: [['Раунды', '26 : 20'], ['Убийства', '174 : 146'], ['Клатчи', '5 : 2'], ['Пистолетки', '2 : 2'], ['Рейтинг G2', '+22', 'up', '5-е → 3-е']],
      путь: [['Группа C · старт', '30 сен', 'done'], ['Верхний матч группы', '2 : 1 Vitality', 'done'], ['Решающий матч', '2 : 0 FaZe', 'now'], ['Плей-офф · 1/4', '11 окт · Vitality', 'next'], ['Финал', '19 окт · Мальта', 'wait']],
      сетка: { было: 'Решающий матч группы', стало: 'Плей-офф · четвертьфинал', вниз: 'Выбыли · 9–12 место, $12 500' },
      дальше: [['a', 'vit', 'Плей-офф · четвертьфинал', '11 октября · 18:00', 4 * 86400 + 2 * 3600 + 25 * 60], ['b', 'mgz', 'BLAST Open · группа', '9 октября · 15:30', 2 * 86400 - 3600]],
      фэнтези: { очки: '+28.9', место: ['412', '301'], мои: [['m0NESY', 'a', '+24.7', 'капитан ×1.5'], ['broky', 'b', '+4.2', '']], прогноз: ['G2 2 : 1', 'победитель угадан', '+20 монет'] },
      прогнозы: [['G2 — Vitality', '11 окт', 47], ['FaZe — MongolZ', '9 окт', 52]],
    },
  }

  // Подписи по-русски для иконок событий карты
  const ЗНАК = { fight: '⚔', rosh: '◆', tower: '▲', gg: '★', pistol: '●', clutch: '◎', ace: '✦' }

  // ——— Кусочки ———
  const x = {
    лого, имя, ава, фото, гер, ЗНАК, n: 0,
    цвет: (m, k) => ЦВЕТ[m[k]],
    поб: (m) => (m.серия[0] > m.серия[1] ? 'a' : 'b'),
    сек: (t, html, кл = '', доп = '') => `<section class="a-sec ${кл}">${t ? `<h3 class="a-h">${t}${доп ? `<small>${доп}</small>` : ''}</h3>` : ''}${html}</section>`,
    // Кнопки-вкладки: <div data-tabs> … [data-tab] … [data-pane]; первая вкладка открыта
    вкладки: (пары, кл = '') => `<div class="a-tabs ${кл}" role="tablist">${пары.map(([id, t], i) => `<button type="button" data-tab="${id}" aria-selected="${!i}">${t}</button>`).join('')}</div>`,
    панели: (пары) => пары.map(([id, html], i) => `<div data-pane="${id}"${i ? ' hidden' : ''}>${html}</div>`).join(''),

    // Серия кружками: сколько карт взяла команда
    пипы: (n, всего = 2) => `<span class="a-pips">${Array.from({ length: всего }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`,

    // Плитки карт серии: название, чья, счёт, победитель
    карты: (m, опц = {}) => `<div class="a-maps">${m.карты.map((к, i) => к.сч
      ? `<button type="button" class="a-map ${опц.кнопки ? '' : 'is-static'}" ${опц.кнопки ? `data-tab="map${i}" aria-selected="${!i}"` : ''} style="--tc:${ЦВЕТ[m[к.поб]]}"><span><b>${к.n}</b><small>${к.под}</small></span><em><span class="${к.поб === 'a' ? 'w' : ''}">${к.сч[0]}</span> : <span class="${к.поб === 'b' ? 'w' : ''}">${к.сч[1]}</span></em><span class="a-map__w">${лого(m[к.поб], 'sm')}${имя(m[к.поб])} · ${к.длит}</span></button>`
      : `<div class="a-map is-skip"><span><b>${к.n}</b><small>${к.под}</small></span><em>—</em><span class="a-map__w">не понадобилась</span></div>`).join('')}</div>`,

    // Два числа на игрока (VALORANT): карточка игрока
    карточка: (m, k, i, опц = {}) => {
      const p = m.игроки[k][i], cs = m.g === 'cs', [имяИ, роль] = p
      const ч1 = cs ? `${p[3]}–${p[4]}` : `${p[3]} / ${p[4]} / ${p[5]}`, ч2 = cs ? p[8].toFixed(2) : p[6]
      const mvp = m.mvp[0] === имяИ
      return `<article class="a-pc ${mvp ? 'is-mvp' : ''} ${опц.кл || ''}">${mvp ? '<span class="a-pc__tag">MVP серии</span>' : ''}
        ${cs ? ава(имяИ, 'a-pc__img') : `<span class="a-pc__heroes">${p[2].map((g) => гер(g)).join('')}</span>${ава(имяИ, 'a-pc__ava')}`}
        <b class="a-pc__n">${имяИ}</b><small class="a-pc__r">${роль}</small>
        <dl class="a-pc__d"><div><dt>${m.два[0]}</dt><dd>${ч1}</dd></div><div><dt>${m.два[1]}</dt><dd>${ч2}</dd></div></dl></article>`
    },

    // Полная таблица игроков серии (Dota: У/С/П, GPM, XPM, нетворс; CS: У–С, ±, ADR, KAST, HS, рейтинг)
    таблица: (m, k) => {
      const cs = m.g === 'cs', пб = x.поб(m) === k
      const head = cs ? ['У–С', '±', 'ADR', 'KAST', 'HS', 'Рейтинг'] : ['Герои', 'У / С / П', 'GPM', 'XPM', 'Нетворс']
      const ряды = m.игроки[k].map((p) => {
        const mvp = m.mvp[0] === p[0]
        const cells = cs
          ? [`${p[3]}–${p[4]}`, `<span class="${p[3] - p[4] >= 0 ? 'up' : 'dn'}">${p[3] - p[4] > 0 ? '+' : ''}${p[3] - p[4]}</span>`, p[5], p[6] + '%', p[7] + '%', `<b class="${p[8] >= 1.1 ? 'up' : p[8] < 0.95 ? 'dn' : ''}">${p[8].toFixed(2)}</b>`]
          : [`<span class="a-tb__h">${p[2].map((g) => гер(g, 'a-hero-s')).join('')}</span>`, `${p[3]} / ${p[4]} / ${p[5]}`, p[6], p[7], `<b>${p[8]} тыс.</b>`]
        return `<tr class="${mvp ? 'is-mvp' : ''}"><td>${ава(p[0], 'a-ava-s')}<span><b>${p[0]}</b>${mvp ? '<em class="a-mvp">MVP</em>' : ''}<small>${p[1]}</small></span></td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
      }).join('')
      return `<table class="a-tb"><thead><tr><th>${лого(m[k], 'sm')}${имя(m[k])}<span class="a-tb__res ${пб ? 'w' : 'l'}">${пб ? 'Победа' : 'Поражение'}</span></th>${head.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${ряды}</tbody></table>`
    },

    // График карты: Dota — разница нетворса по минутам, CS — разница раундов; над линией — иконки событий
    график: (m, i, опц = {}) => {
      const к = m.карты[i], cs = m.g === 'cs'
      if (!к.сч) return ''
      const d = cs ? раунды(к.р) : к.ход, n = d.length - 1
      const W = 1000, H = опц.h || 220, mid = H / 2, max = Math.max(...d.map(Math.abs), cs ? 4 : 10) * 1.12
      const X = (j) => (j / n) * W, Y = (v) => mid - (v / max) * (mid - 14)
      const линия = d.map((v, j) => `${j ? 'L' : 'M'}${X(j).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')
      const area = `${линия} L${W} ${mid} L0 ${mid} Z`
      const id = `c${m.g}${i}${опц.id || ''}n${++x.n}` // id уникален: та же разметка рисуется в двух рамках
      // события: по минуте (Dota) или номеру раунда (CS)
      const соб = к.соб.map(([t, тип, kk, s]) => {
        const j = cs ? t : (t / parseInt(к.длит)) * n
        const xx = (j / n) * 100
        return `<span class="a-ev is-${kk}" style="left:${xx}%;--tc:${ЦВЕТ[m[kk]]}" title="${s}"><i>${ЗНАК[тип]}</i></span>`
      }).join('')
      const ось = cs ? [1, 6, 12, 18, n].map((r) => `<span style="left:${((r) / n) * 100}%">${r}</span>`).join('') : [0, 10, 20, 30, 40].filter((t) => t <= parseInt(к.длит)).map((t) => `<span style="left:${(t / parseInt(к.длит)) * 100}%">${t}′</span>`).join('')
      return `<figure class="a-chart" style="--ta:${ЦВЕТ[m.a]};--tb:${ЦВЕТ[m.b]}">
        <div class="a-chart__ev">${соб}</div>
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
          <defs><clipPath id="${id}t"><rect x="0" y="0" width="${W}" height="${mid}" /></clipPath><clipPath id="${id}b"><rect x="0" y="${mid}" width="${W}" height="${mid}" /></clipPath>
          <linearGradient id="${id}ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ta)" stop-opacity=".45" /><stop offset="1" stop-color="var(--ta)" stop-opacity="0" /></linearGradient>
          <linearGradient id="${id}gb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--tb)" stop-opacity=".45" /><stop offset="1" stop-color="var(--tb)" stop-opacity="0" /></linearGradient></defs>
          <line x1="0" y1="${mid}" x2="${W}" y2="${mid}" class="a-chart__0" />
          <path d="${area}" fill="url(#${id}ga)" clip-path="url(#${id}t)" /><path d="${area}" fill="url(#${id}gb)" clip-path="url(#${id}b)" />
          <path d="${линия}" class="a-chart__l a-chart__l--a" clip-path="url(#${id}t)" /><path d="${линия}" class="a-chart__l a-chart__l--b" clip-path="url(#${id}b)" />
        </svg>
        <div class="a-chart__ax">${ось}</div>
        <figcaption><span>${лого(m.a, 'sm')}${имя(m.a)} впереди</span><span>${cs ? 'разница раундов' : 'разница нетворса, тыс. золота'}</span><span>${имя(m.b)} впереди${лого(m.b, 'sm')}</span></figcaption>
      </figure>`
    },
    // Список событий карты
    события: (m, i) => `<ul class="a-evl">${m.карты[i].соб.map(([t, тип, k, s]) => `<li style="--tc:${ЦВЕТ[m[k]]}"><time>${m.g === 'cs' ? 'Р' + t : t + '′'}</time><i>${ЗНАК[тип]}</i><span>${s}</span>${лого(m[k], 'sm')}</li>`).join('')}</ul>`,
    // Пики героев по карте (Dota) или полосы раундов (CS)
    состав_карты: (m, i) => {
      const к = m.карты[i]
      if (m.g === 'cs') return `<div class="a-rounds">${[...к.р].map((c, j) => `<i class="${c === 'A' ? 'a' : 'b'} ${j === 11 ? 'half' : ''}" title="Раунд ${j + 1}">${j + 1}</i>`).join('')}</div>`
      return `<div class="a-picks">${['a', 'b'].map((k) => `<p>${лого(m[k], 'sm')}${к.пики[k].map((g) => гер(g)).join('')}</p>`).join('')}</div>`
    },

    // Титулы игрокам (Rocket League) — из данных серии
    титулы: (m, кто) => {
      const t = m.титулы.filter(([n]) => !кто || n === кто)
      return t.map(([n, т, ч]) => `<p class="a-title"><b>${т}</b><small>${ч}</small></p>`).join('')
    },

    // Строка KPI (EA FC)
    kpi: (m) => `<div class="a-kpi">${m.kpi.map(([t, v, кл, под]) => `<div><b class="${кл || ''}">${v}</b><span>${t}</span>${под ? `<small>${под}</small>` : ''}</div>`).join('')}</div>`,

    // Путь команды по турниру (степпер): что пройдено, этот матч, что дальше
    путь: (m) => `<ol class="a-path" style="--tc:${ЦВЕТ[m[x.поб(m)]]}">${m.путь.map(([t, s, c]) => `<li class="is-${c}"><i></i><b>${t}</b><small>${s}</small></li>`).join('')}</ol>`,

    // Следующий матч с живым отсчётом (Rocket League «NEXT MATCH IN 52»)
    дальше: (m, j = 0, кл = '') => {
      const [k, соп, стадия, когда, сек] = m.дальше[j]
      return `<a href="#" class="a-next ${кл}" style="--tc:${ЦВЕТ[m[k]]}"><small>${стадия}</small>
        <span class="a-next__m">${лого(m[k], 'lg')}<b>${имя(m[k])}</b><i>vs</i><b>${имя(соп)}</b>${лого(соп, 'lg')}</span>
        <span class="a-next__t"><em data-cd="${сек}">${отсчёт(сек)}</em><small>${когда}</small></span></a>`
    },

    // Прогнозы на следующий раунд: две кнопки, процент голосов
    прогнозы: (m) => `<div class="a-pred">${m.прогнозы.map(([пара, д, p]) => {
      const [a, b] = пара.split(' — ')
      return `<div class="a-pred__r"><p><b>${пара}</b><small>${д} · голосуй до начала</small></p><div class="a-pred__b"><button type="button" data-vote>${a}<em>${p}%</em></button><button type="button" data-vote>${b}<em>${100 - p}%</em></button></div></div>`
    }).join('')}</div>`,

    // Фэнтези и прогноз за этот матч
    мои: (m) => {
      const ф = m.фэнтези
      return `<div class="a-my"><div class="a-my__top"><p><small>Твои очки за матч</small><b>${ф.очки}</b></p><p><small>Место в лиге друзей</small><b>${ф.место[0]} → ${ф.место[1]}</b></p></div>
        ${ф.мои.map(([n, k, o, кап]) => `<p class="a-my__p">${ава(n, 'a-ava-s')}<span><b>${n}</b><small>${имя(m[k])}${кап ? ' · ' + кап : ''}</small></span><em>${o}</em></p>`).join('')}
        <p class="a-my__pred"><span>Твой прогноз: <b>${ф.прогноз[0]}</b> — ${ф.прогноз[1]}</span><em>${ф.прогноз[2]}</em></p></div>`
    },

    // Мини-сетка: этот матч → куда пошёл победитель, куда проигравший
    сетка: (m) => {
      const w = x.поб(m), l = w === 'a' ? 'b' : 'a', [, сопW, , когдаW] = m.дальше[0], [, сопL, , когдаL] = m.дальше[1]
      return `<div class="a-br" style="--tw:${ЦВЕТ[m[w]]}">
        <div class="a-br__c"><small>${m.сетка.было}</small><div class="a-br__m"><p class="w">${лого(m[w], 'sm')}${имя(m[w])}<b>${m.серия[w === 'a' ? 0 : 1]}</b></p><p class="l">${лого(m[l], 'sm')}${имя(m[l])}<b>${m.серия[l === 'a' ? 0 : 1]}</b></p></div></div>
        <svg class="a-br__ln" viewBox="0 0 120 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 C60 70 60 40 120 40" class="w" /><path d="M0 130 C60 130 60 170 120 170" class="l" /></svg>
        <div class="a-br__col">
          <div class="a-br__c is-up"><small>${m.сетка.стало} · ${когдаW.split(' · ')[0]}</small><div class="a-br__m"><p class="w">${лого(m[w], 'sm')}${имя(m[w])}<b>↑</b></p><p>${лого(сопW, 'sm')}${имя(сопW)}<b>—</b></p></div></div>
          <div class="a-br__c is-down"><small>${m.сетка.вниз}</small><div class="a-br__m"><p class="l">${лого(m[l], 'sm')}${имя(m[l])}<b>↓</b></p>${m.g === 'dota' ? `<p>${лого(сопL, 'sm')}${имя(сопL)}<b>—</b></p>` : '<p class="out">турнир окончен</p>'}</div></div>
        </div></div>`
    },
  }

  // Отсчёт: дни+часы далеко, ч:м:с меньше суток (как в исследовании: таймер дробится по мере приближения)
  function отсчёт(s) {
    if (s <= 0) return 'идёт'
    const д = Math.floor(s / 86400), ч = Math.floor((s % 86400) / 3600), м = Math.floor((s % 3600) / 60), с = s % 60
    if (д) return `через ${д} д ${ч} ч`
    return `через ${ч}:${String(м).padStart(2, '0')}:${String(с).padStart(2, '0')}`
  }

  const ШАПКА = `<header class="ui-header"><div class="ui-header__in"><div class="ui-header__top"><a class="ui-header__brand" href="#">Fantasy · Dota 2</a>
    <div class="btn-row ui-header__game" role="group"><button class="btn btn--quiet btn--xs" type="button" aria-pressed="true">Dota</button><button class="btn btn--quiet btn--xs" type="button" aria-pressed="false">LoL</button></div>
    <div class="ui-header__coins"><span>Монеты</span><b>1 000</b><button class="btn btn--quiet btn--sm" type="button">Забрать +50</button></div></div>
    <nav class="ui-tabs ui-header__nav"><a class="ui-tabs__a" href="#">Главная</a><a class="ui-tabs__a" href="#">Матчи</a><a class="ui-tabs__a" href="#" aria-current="page">Match Center</a><a class="ui-tabs__a" href="#">Состав</a><a class="ui-tabs__a" href="#">Бустеры</a><a class="ui-tabs__a" href="#">Коллекция</a><a class="ui-tabs__a" href="#">Квесты</a><a class="ui-tabs__a" href="#">Лидеры</a><a class="ui-tabs__a" href="#">Как это работает</a></nav></div></header>`
  const ТАББАР = `<nav class="p-tabbar"><a href="#" aria-current="page"><i>▦</i>Матчи</a><a href="#"><i>⌕</i>Поиск</a><a href="#"><i>★</i>Состав</a><a href="#"><i>☆</i>Избранное</a><a href="#"><i>◉</i>Профиль</a></nav>`

  const MA = (window.MA = window.MA || {})
  const S = { g: 'dota' }
  const старт = Date.now()
  const draw = () => {
    const m = СЕРИИ[S.g]
    // Разметка строится для каждой рамки отдельно — чтобы id графиков не повторялись
    const html = () => `<div class="p-scroll">${ШАПКА}<div class="p-crumbs"><a href="#">Match Center</a> / <a href="#">${m.тур}</a> / ${имя(m.a)} — ${имя(m.b)}</div><div class="a-body">${MA.вариант(m, x)}</div></div>${ТАББАР}`
    document.querySelectorAll('[data-ma]').forEach((f) => { f.innerHTML = html(); f.style.setProperty('--tw', ЦВЕТ[m[x.поб(m)]]) })
    document.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === S.g))
    MA.после?.(m, x)
    tick()
  }
  // Живой отсчёт
  const tick = () => { const п = Math.floor((Date.now() - старт) / 1000); document.querySelectorAll('[data-cd]').forEach((e) => { e.textContent = отсчёт(+e.dataset.cd - п) }) }
  setInterval(tick, 1000)

  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-g]')
    if (g) { S.g = g.dataset.g; draw(); return }
    // Вкладки: [data-tab] переключает [data-pane] внутри ближайшего [data-tabs]
    const t = e.target.closest('[data-tab]')
    if (t) {
      const box = t.closest('[data-tabs]')
      box.querySelectorAll('[data-tab]').forEach((b) => { if (b.closest('[data-tabs]') === box) b.setAttribute('aria-selected', b.dataset.tab === t.dataset.tab) })
      box.querySelectorAll('[data-pane]').forEach((p) => { if (p.closest('[data-tabs]') === box) p.hidden = p.dataset.pane !== t.dataset.tab })
      return
    }
    // Шаги (v2): [data-go="N"] переключает [data-step] внутри рамки
    const go = e.target.closest('[data-go]')
    if (go) {
      const f = go.closest('[data-ma]')
      f.querySelectorAll('[data-step]').forEach((s) => s.classList.toggle('is-on', s.dataset.step === go.dataset.go))
      f.querySelectorAll('[data-dot]').forEach((s) => s.setAttribute('aria-current', s.dataset.dot === go.dataset.go))
      f.querySelector('.p-scroll').scrollTop = 0
      return
    }
    const v = e.target.closest('[data-vote]')
    if (v) { v.parentElement.querySelectorAll('[data-vote]').forEach((b) => b.classList.toggle('is-on', b === v)); e.preventDefault() }
    if (e.target.closest('a[href="#"]')) e.preventDefault()
  })
  const fit = () => document.querySelectorAll('.p-wrap').forEach((w) => { w.firstElementChild.style.zoom = Math.min(1, w.clientWidth / 1440) })
  addEventListener('resize', fit)
  draw(); fit()
})()
