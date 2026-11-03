// Лаба «Все матчи» — статичная страница: данные условные (вторник 6 октября, сейчас 15:35), разметка одна на все рамки
// (десктоп 1440 — сетка главной: две большие колонки под матчи + узкая справа; телефон 390 — одна). Раскрытые строки показаны сразу открытыми.
// Сводка решений, откуда что взято (Figma стр. 06 «Матчи»): переключатель 5 игр и плотность по тиру — bo3; звёзды важности и шанс победы — hltv;
// статус словами и раскрытие строки — cyberscore; лайв-карусель и полоса дней — dltv; счётчики в шапке и прогресс турнира — vpedota2;
// ★-подписка и новости в матче — Flapscore; «показать счёт» — hawk.
(() => {
  const ИГРЫ = { cs: 'CS2', dota: 'Dota 2', lol: 'LoL', val: 'Valorant', mlbb: 'MLBB' }
  const К = {
    ts: ['Team Spirit', 'ts'], tun: ['Tundra Esports', 'tun'], gg: ['Gaimin Gladiators', 'gg'], pv: ['PARIVISION', 'pv'], flc: ['Team Falcons', 'flc'],
    tl: ['Team Liquid', 'tl'], aur: ['Aurora', 'aur'], bb: ['BetBoom Team', 'bb'], yg: ['Yangon Galacticos', 'yg'],
    vit: ['Team Vitality', 0, 'VIT'], mgz: ['The MongolZ', 0, 'MGZ'], navi: ['Natus Vincere', 0, 'NAVI'], mouz: ['MOUZ', 0, 'MZ'], g2: ['G2 Esports', 0, 'G2'], faze: ['FaZe Clan', 0, 'FZ'],
    t1: ['T1', 0, 'T1'], gen: ['Gen.G', 0, 'GEN'], fnc: ['Fnatic', 0, 'FNC'], blg: ['Bilibili Gaming', 0, 'BLG'],
    sen: ['Sentinels', 0, 'SEN'], prx: ['Paper Rex', 0, 'PRX'], loud: ['LOUD', 0, 'LOUD'], nrg: ['NRG', 0, 'NRG'], edg: ['EDward Gaming', 0, 'EDG'],
    onic: ['ONIC', 0, 'ON'], evos: ['EVOS', 0, 'EV'], rrq: ['RRQ Hoshi', 0, 'RRQ'], ae: ['Alter Ego', 0, 'AE'], xip: ['Xipto Esports', 0, 'XIP'], ive: ['Ivory', 0, 'IVR'],
  }
  const лого = (id, cls = '') => { const t = К[id]; return t[1] ? `<img class="mx-lg ${cls}" src="/p-fw3k/site/img/teams/${t[1]}.png" alt="" />` : `<span class="mx-lg mx-lg--mono ${cls}">${t[2]}</span>` }
  const имя = id => К[id][0]
  const тег = g => `<span class="mx-gt">${ИГРЫ[g]}</span>`
  const точки = s => `<span class="mx-form">${[...s].map(c => `<i class="${c === 'W' ? 'w' : 'l'}"></i>`).join('')}</span>`

  // Время/статус слева в строке — словами, как у cyberscore; задержка и перенос — с объяснением ниже
  const СТАТУС = {
    soon: m => `<b>${m.t}</b><small>${m.через || ''}</small>`,
    live: m => `<b class="is-live"><i class="mx-dot"></i>Карта ${m.карта}</b><small>${m.часы}</small>`,
    draft: m => `<b class="is-live"><i class="mx-dot"></i>Драфт</b><small>карта ${m.карта}</small>`,
    pause: m => `<b class="is-pause">Пауза</b><small>${m.часы}</small>`,
    break: m => `<b class="is-break">Перерыв</b><small>карта ${m.карта} через ${m.через}</small>`,
    delay: m => `<b><s>${m.t}</s> ${m.новое}</b><small class="is-warn">задержан</small>`,
    moved: m => `<b>${m.новое}</b><small class="is-warn">перенесён</small>`,
    cancel: () => `<b>—</b><small>отменён</small>`,
    done: m => `<b>Итог</b><small>в ${m.конец}</small>`,
  }
  const ЭФИР = ['live', 'draft', 'pause', 'break']

  const сторона = (m, k) => {
    const id = m[k], s = m['s' + k], итог = m.st === 'done' && !m.скрыт
    const cls = итог ? (s > m[k === 'a' ? 'sb' : 'sa'] ? 'is-win' : 'is-lose') : ''
    const счёт = s == null || m.скрыт ? '' : `<em>${s}</em>`
    return `<span class="mx-side mx-side--${k} ${cls}">${лого(id)}<span class="mx-nm">${имя(id)}</span>${счёт}</span>`
  }
  const середина = m => {
    if (m.скрыт) return `<button class="mx-spoil" type="button">Показать счёт</button>`
    if (m.sa == null) return `<span class="mx-vs">vs</span>`
    return `<span class="mx-sep">:</span>`
  }

  // Раскрытая строка — быстрый взгляд, по состоянию матча
  const РАСКРЫТИЕ = {
    soon: m => `
      <div class="mx-qv__grid">
        <section><h4>Форма · последние 5</h4>
          <p class="mx-fr">${лого(m.a, 'sm')}<span>${имя(m.a)}</span>${точки('WWLWW')}<b>4 из 5</b></p>
          <p class="mx-fr">${лого(m.b, 'sm')}<span>${имя(m.b)}</span>${точки('LWWLL')}<b>2 из 5</b></p></section>
        <section><h4>Личные встречи · 5</h4>
          <div class="mx-bar"><i style="--p:60%"></i></div>
          <p class="mx-bar__l"><span>${имя(m.a)} · 3</span><span>2 · ${имя(m.b)}</span></p>
          <p class="mx-qv__mut">Последняя — 2:1 ${имя(m.a)}, 12 сентября</p></section>
        <section><h4>Кто победит · 2 140 голосов</h4>
          <div class="mx-vote"><button type="button" class="is-on"><span>${имя(m.a)}</span><b>58%</b></button><button type="button"><span>${имя(m.b)}</span><b>42%</b></button></div>
          <p class="mx-qv__mut">Голосовать можно до 17:00</p></section>
        <section><h4>Что на кону</h4>
          <p>Полуфинал верхней сетки. Победитель — в финал верхней, проигравший — в нижнюю сетку.</p>
          <p class="mx-qv__mut">Смотреть: Twitch · RU, 12 тыс. ждут · YouTube · EN</p></section>
      </div>
      <footer class="mx-qv__ft"><a class="mx-btn mx-btn--main" href="#">Страница матча</a><button class="mx-btn" type="button">★ Напомнить о начале</button>
        <p class="mx-hook">В матче 2 твоих игрока · <a href="#">собрать состав до 17:00</a></p></footer>`,
    live: m => `
      <div class="mx-maps">
        <div class="mx-map is-done"><span>Карта 1 · 38:12</span><b>${лого(m.a, 'sm')}${имя(m.a)}</b><em>34 : 21</em></div>
        <div class="mx-map is-now"><span><i class="mx-dot"></i>Карта 2 · ${m.часы}</span><b>идёт</b><em>18 : 12</em></div>
        <div class="mx-map"><span>Карта 3</span><b>если понадобится</b><em>—</em></div>
      </div>
      <div class="mx-qv__grid">
        <section><h4>Шанс победы в карте</h4>
          <div class="mx-bar mx-bar--win"><i style="--p:64%"></i></div>
          <p class="mx-bar__l"><span>${имя(m.a)} · 64%</span><span>36% · ${имя(m.b)}</span></p>
          <p class="mx-qv__mut">Золото: +4.2 тыс. у ${имя(m.a)}</p></section>
        <section><h4>Последнее в игре</h4>
          <ul class="mx-ev"><li><time>23:40</time>${имя(m.a)} забрали Рошана</li><li><time>21:05</time>${имя(m.b)} снесли башню на центре</li><li><time>18:30</time>Драка у реки: 3 на 1 в пользу ${имя(m.a)}</li></ul></section>
        <section><h4>Твои игроки в матче</h4>
          <p class="mx-pl"><img src="/p-fw3k/site/img/players/yatoro.webp" alt="" /><span>Yatoro · ${имя(m.a)}</span><b>+12.4</b></p>
          <p class="mx-pl"><img src="/p-fw3k/site/img/players/_silhouette.png" alt="" /><span>Saksa · ${имя(m.b)}</span><b>+4.1</b></p></section>
      </div>
      <footer class="mx-qv__ft"><a class="mx-btn mx-btn--main" href="#">Смотреть · Twitch RU</a><a class="mx-btn" href="#">Страница матча</a></footer>`,
    done: m => `
      <div class="mx-maps">
        <div class="mx-map is-done"><span>Карта 1 · 38 мин</span><b>${лого(m.a, 'sm')}${имя(m.a)}</b><em>31 : 18</em></div>
        <div class="mx-map is-done"><span>Карта 2 · 44 мин</span><b>${лого(m.a, 'sm')}${имя(m.a)}</b><em>27 : 20</em></div>
      </div>
      <div class="mx-qv__grid">
        <section><h4>Игрок матча</h4>
          <p class="mx-pl"><img src="/p-fw3k/site/img/players/pure.webp" alt="" /><span>Pure · ${имя(m.a)}<small>14 / 2 / 11 за две карты</small></span></p></section>
        <section><h4>Рейтинг после матча</h4>
          <p class="mx-rt"><span>${имя(m.a)}</span><b class="up">+18</b><small>3-е → 2-е место</small></p>
          <p class="mx-rt"><span>${имя(m.b)}</span><b class="down">−12</b><small>7-е → 9-е место</small></p></section>
        <section><h4>Новости матча</h4>
          <a class="mx-nw" href="#">Разбор: как ${имя(m.a)} закрыла серию за 82 минуты<small>15 минут назад</small></a>
          <a class="mx-nw" href="#">Лучшие моменты: Pure и тройное убийство на 31-й<small>видео · 2 мин</small></a></section>
      </div>
      <footer class="mx-qv__ft"><a class="mx-btn mx-btn--main" href="#">Страница матча</a><a class="mx-btn" href="#">Запись трансляции</a></footer>`,
  }

  // Вариант страницы: v1 — всё раскрыто сразу, статично; v2+ — строки свёрнуты, раскрываются кликом, форма раскрытия — своя у каждого варианта
  const V = document.body.dataset.v || 'v1'
  const ФОРМЫ = (window.MX_ФОРМЫ = window.MX_ФОРМЫ || {})
  const вид = m => m.st === 'done' ? 'done' : ЭФИР.includes(m.st) ? 'live' : m.st === 'cancel' ? null : 'soon'
  const ПО_ID = {}

  const строка = m => {
    const эфир = ЭФИР.includes(m.st), v1 = V === 'v1'
    m.id = m.a + '-' + m.b; ПО_ID[m.id] = m
    const откр = v1 && m.open
    const кл = ['mx-row', 'st-' + m.st, эфир ? 'is-air' : '', откр ? 'is-open' : '', m.st === 'cancel' ? 'is-off' : '', !v1 && вид(m) ? 'is-click' : ''].join(' ')
    const важн = v1 && m.звёзды ? `<span class="mx-imp" title="Важность матча">${'★'.repeat(m.звёзды)}</span>` : ''
    const стадия = v1 ? `<span class="mx-stage">${m.стадия || ''}</span>` : ''
    return `<article class="${кл}" data-id="${m.id}">
      <div class="mx-row__in">
        <div class="mx-st">${СТАТУС[m.st](m)}</div>
        <div class="mx-tm">${сторона(m, 'a')}${середина(m)}${сторона(m, 'b')}</div>
        <div class="mx-rt-col">${стадия}${важн}<span class="mx-bo">${m.bo}</span>
          <button class="mx-fav ${m.fav ? 'is-on' : ''}" type="button" title="Уведомлять о матче">${m.fav ? '★' : '☆'}</button><span class="mx-chev">${откр ? '⌃' : вид(m) || v1 ? '⌄' : ''}</span></div>
      </div>
      ${m.заметка ? `<p class="mx-note">${m.заметка}</p>` : ''}
      ${откр ? `<div class="mx-qv">${РАСКРЫТИЕ[m.open](m)}</div>` : ''}
    </article>`
  }

  // Сегодня: турниры по важности (тир S → B), внутри — по времени. Матчи «в эфире» стоят на своих местах, а сверху их дублирует карусель.
  const ТУРНИРЫ = [
    { g: 'dota', имя: 'BLAST Slam VIII', тир: 'S', что: 'Плей-офф · $1 000 000', fav: true, матчи: [
      { st: 'done', a: 'aur', b: 'bb', sa: 2, sb: 0, конец: '13:40', bo: 'Bo3', стадия: 'Четвертьфинал', звёзды: 2, open: 'done' },
      { st: 'live', a: 'ts', b: 'tun', sa: 1, sb: 0, карта: 2, часы: '24:15', bo: 'Bo3', стадия: 'Полуфинал верхней', звёзды: 3, fav: true, open: 'live' },
      { st: 'pause', a: 'gg', b: 'pv', sa: 0, sb: 1, карта: 2, часы: '6 мин', bo: 'Bo3', стадия: 'Нижняя сетка', звёзды: 2, заметка: 'Техническая пауза: у Gaimin Gladiators отвалился игрок, ждут переподключения' },
      { st: 'soon', a: 'flc', b: 'tl', t: '17:00', через: 'через 1 ч 25 мин', bo: 'Bo3', стадия: 'Полуфинал верхней', звёзды: 3, fav: true, open: 'soon' },
    ] },
    { g: 'cs', имя: 'ESL Pro League S24', тир: 'S', что: 'Группа C · $850 000', матчи: [
      { st: 'live', a: 'vit', b: 'mgz', sa: 1, sb: 0, карта: 2, часы: 'Mirage · 7:5', bo: 'Bo3', стадия: 'Группа C', звёзды: 2 },
      { st: 'break', a: 'g2', b: 'faze', sa: 1, sb: 1, карта: 3, через: '4 мин', bo: 'Bo3', стадия: 'Группа C', звёзды: 2 },
      { st: 'delay', a: 'navi', b: 'mouz', t: '15:00', новое: '15:50', bo: 'Bo3', стадия: 'Группа C', звёзды: 3, заметка: 'Задержан на 50 минут: предыдущий матч на этом сервере затянулся до третьей карты' },
    ] },
    { g: 'lol', имя: 'Worlds 2026', тир: 'S', что: 'Швейцарка, раунд 3 · $5 000 000', матчи: [
      { st: 'draft', a: 't1', b: 'gen', sa: 0, sb: 0, карта: 1, bo: 'Bo1', стадия: 'Раунд 3 · 1–1', звёзды: 3 },
      { st: 'soon', a: 'fnc', b: 'blg', t: '19:00', через: 'через 3 ч 25 мин', bo: 'Bo1', стадия: 'Раунд 3 · 1–1', звёзды: 2 },
    ] },
    { g: 'val', имя: 'VCT Champions 2026', тир: 'S', что: 'Плей-офф · $2 250 000', матчи: [
      { st: 'done', a: 'prx', b: 'loud', sa: 2, sb: 1, конец: '12:55', bo: 'Bo3', стадия: 'Нижняя сетка', скрыт: true },
      { st: 'moved', a: 'nrg', b: 'edg', новое: '8 окт, 12:00', bo: 'Bo3', стадия: 'Нижняя сетка', заметка: 'Перенесён организатором: у EDward Gaming задержали визы. Уведомим, если время снова сдвинут' },
    ] },
    { g: 'mlbb', имя: 'MPL Indonesia S18', тир: 'A', что: 'Регулярный сезон · неделя 7', матчи: [
      { st: 'soon', a: 'onic', b: 'evos', t: '20:00', через: 'через 4 ч 25 мин', bo: 'Bo3', стадия: 'Неделя 7' },
      { st: 'cancel', a: 'rrq', b: 'ae', t: '21:30', bo: 'Bo3', стадия: 'Неделя 7', заметка: 'Отменён: Alter Ego снялись с сезона. Победа присуждена RRQ Hoshi' },
    ], ещё: '+3 матча недели 7 — завтра и в четверг' },
    { g: 'dota', имя: 'EPL World Series SEA S18', тир: 'B', что: 'Плей-офф', плотно: true, матчи: [
      { st: 'soon', a: 'yg', b: 'xip', t: '21:00', через: '', bo: 'Bo3', стадия: 'Верхняя сетка' },
      { st: 'soon', a: 'ive', b: 'yg', t: '23:30', через: '', bo: 'Bo3', стадия: 'Нижняя сетка' },
    ], ещё: '+2 матча — пары определятся после 21:00' },
  ]
  const ЗАВТРА = [
    { g: 'dota', имя: 'BLAST Slam VIII', тир: 'S', что: 'Плей-офф', матчи: [
      { st: 'soon', a: 'ts', b: 'flc', t: '14:00', через: 'если пройдут', bo: 'Bo3', стадия: 'Финал верхней', звёзды: 3, fav: true },
    ] },
    { g: 'cs', имя: 'ESL Pro League S24', тир: 'S', что: 'Группа C', матчи: [
      { st: 'soon', a: 'vit', b: 'navi', t: '16:30', через: '', bo: 'Bo3', стадия: 'Группа C', звёзды: 3 },
    ] },
  ]

  const турнир = tr => `<section class="mx-tour ${tr.плотно ? 'mx-tour--dense' : ''}">
      <header class="mx-tb">${тег(tr.g)}<b>${tr.имя}</b><span class="mx-tb__w">${tr.что}</span><span class="mx-tier">${tr.тир}-тир</span>
        <button class="mx-fav ${tr.fav ? 'is-on' : ''}" type="button" title="Следить за турниром">${tr.fav ? '★' : '☆'}</button><a class="mx-tb__go" href="#">›</a></header>
      ${tr.матчи.map(m => строка(Object.assign(m, { g: tr.g, тур: tr.имя }))).join('')}
      ${tr.ещё ? `<button class="mx-more" type="button">${tr.ещё}</button>` : ''}
    </section>`

  const всеМатчи = ТУРНИРЫ.flatMap(t => t.матчи.map(m => ({ ...m, g: t.g, тур: t.имя })))
  const вЭфире = всеМатчи.filter(m => ЭФИР.includes(m.st))

  const карточка = m => `<article class="mx-lc">
      <p class="mx-lc__h">${тег(m.g)}<span>${m.тур}</span></p>
      <p class="mx-lc__t">${лого(m.a, 'sm')}<span>${имя(m.a)}</span><b>${m.sa}</b></p>
      <p class="mx-lc__t">${лого(m.b, 'sm')}<span>${имя(m.b)}</span><b>${m.sb}</b></p>
      <p class="mx-lc__s">${СТАТУС[m.st](m).replace(/<\/?b[^>]*>|<\/?small[^>]*>/g, ' ')}</p>
      ${m.st === 'live' && m.g === 'dota' ? `<div class="mx-bar mx-bar--win mx-bar--thin"><i style="--p:64%"></i></div>` : ''}
    </article>`

  const дни = [['Вс', '4 окт', 22], ['Вчера', '5 окт', 31], ['Сегодня', '6 окт', 38], ['Завтра', '7 окт', 26], ['Чт', '8 окт', 24], ['Пт', '9 окт', 19], ['Сб', '10 окт', 30], ['Вс', '11 окт', 12]]
  const полосаДней = `<div class="mx-days">${дни.map(([d, n, k], i) => `<button type="button" class="${i < 2 ? 'is-past' : ''}" ${i === 2 ? 'aria-pressed="true"' : ''}><b>${d}</b><span>${n}</span><small>${i === 2 ? '● 5 в эфире' : k + ' матчей'}</small></button>`).join('')}<button type="button" class="mx-cal" title="Календарь">▦</button></div>`

  const ИГРЫ_СЧЁТ = [['all', 'Все игры', 38], ['cs', 'CS2', 12], ['dota', 'Dota 2', 9], ['lol', 'LoL', 6], ['val', 'Valorant', 5], ['mlbb', 'MLBB', 6]]
  const играСег = `<div class="mx-seg mx-seg--games">${ИГРЫ_СЧЁТ.map(([id, n, k], i) => `<button type="button" ${i === 0 ? 'aria-pressed="true"' : ''}>${n}<small>${k}</small></button>`).join('')}</div>`
  const статусСег = `<div class="mx-seg">${[['Все', 38], ['В эфире', 5, 1], ['Скоро', 21], ['Завершены', 12], ['★ Мои', 4]].map(([n, k, live], i) => `<button type="button" ${i === 0 ? 'aria-pressed="true"' : ''}>${live ? '<i class="mx-dot"></i>' : ''}${n}<small>${k}</small></button>`).join('')}</div>`

  const правая = `<aside class="mx-right">
      <div class="mx-pan"><h3>Для тебя</h3>
        <a class="mx-fy" href="#"><i class="mx-dot"></i><span><b>Team Spirit 1 : 0 Tundra</b><small>ты следишь за Spirit · карта 2</small></span></a>
        <a class="mx-fy" href="#"><b class="mx-fy__t">17:00</b><span><b>Falcons — Liquid</b><small>2 твоих игрока · состав до 17:00</small></span></a>
        <a class="mx-fy" href="#"><b class="mx-fy__t">Итог</b><span><b>Aurora 2 : 0 BetBoom</b><small>Pure — игрок матча, +18.6 очка</small></span></a></div>
      <div class="mx-pan"><h3>Избранное</h3>
        <a class="mx-fl" href="#">${лого('ts', 'sm')}<span>Team Spirit</span><small>в эфире</small></a>
        <a class="mx-fl" href="#">${лого('aur', 'sm')}<span>Aurora</span><small>победа 2:0</small></a>
        <a class="mx-fl" href="#">${тег('dota')}<span>BLAST Slam VIII</span><small>4 матча</small></a>
        <button class="mx-add" type="button">+ Команда или турнир</button></div>
      <div class="mx-pan"><h3>Турнир дня</h3>
        <p class="mx-td">${тег('dota')}<b>BLAST Slam VIII</b><span>Мальта · $1 000 000</span></p>
        <ol class="mx-steps"><li class="is-done">Группы<small>1–3 окт</small></li><li class="is-now">Плей-офф<small>сейчас</small></li><li>Финал<small>11 окт</small></li></ol>
        <p class="mx-qv__mut">Дальше: Falcons — Liquid, 17:00 · победитель — в финал верхней</p></div>
      <div class="mx-pan"><h3>Новости</h3>
        <a class="mx-nw" href="#">${тег('dota')} Tundra без Topson на BLAST: замена — 33<small>1 час назад</small></a>
        <a class="mx-nw" href="#">${тег('cs')} NAVI — MOUZ сдвинули на 15:50<small>40 минут назад</small></a>
        <a class="mx-nw" href="#">${тег('val')} EDward Gaming не успели с визами: матч с NRG — 8 октября<small>2 часа назад</small></a>
        <a class="mx-link" href="#">Все новости ›</a></div>
    </aside>`

  const шапка = `<header class="ui-header">
      <div class="ui-header__in">
        <div class="ui-header__top">
          <a class="ui-header__brand" href="#">Fantasy · Dota 2</a>
          <div class="btn-row ui-header__game" role="group" aria-label="Игра"><button class="btn btn--quiet btn--xs" type="button" aria-pressed="true">Dota</button><button class="btn btn--quiet btn--xs" type="button" aria-pressed="false">LoL</button></div>
          <div class="ui-header__coins"><span>Монеты</span><b>1 000</b><button class="btn btn--quiet btn--sm" type="button">Забрать +50</button></div>
        </div>
        <nav class="ui-tabs ui-header__nav" aria-label="Разделы">
          <a class="ui-tabs__a" href="#">Главная</a><a class="ui-tabs__a" href="#" aria-current="page">Матчи</a><a class="ui-tabs__a" href="#">Состав</a>
          <a class="ui-tabs__a" href="#">Бустеры</a><a class="ui-tabs__a" href="#">Коллекция</a><a class="ui-tabs__a" href="#">Квесты</a>
          <a class="ui-tabs__a" href="#">Лидеры</a><a class="ui-tabs__a" href="#">История</a><a class="ui-tabs__a" href="#">Как это работает</a>
        </nav>
      </div>
    </header>`
  const таббар = `<nav class="mx-tabbar" aria-label="Разделы"><a href="#" aria-current="page"><i>▦</i>Матчи</a><a href="#"><i>⌕</i>Поиск</a><a href="#"><i>★</i>Состав</a><a href="#"><i>☆</i>Избранное</a><a href="#"><i>◉</i>Профиль</a></nav>`

  const центр = `<main class="mx-main">
      <div class="mx-head"><div><h1>Матчи</h1><p>Вторник, 6 октября · 38 матчей в 5 играх · время московское</p></div>
        <p class="mx-cnt"><span><i class="mx-dot"></i><b>5</b> в эфире</span><span><b>21</b> скоро</span><span><b>12</b> завершены</span></p></div>
      ${играСег}
      ${полосаДней}
      <section class="mx-air"><h2><i class="mx-dot"></i>В эфире сейчас <small>5</small></h2><div class="mx-car">${вЭфире.map(карточка).join('')}</div></section>
      <div class="mx-bar-row">${статусСег}<label class="mx-sw mx-sw--inline"><span>Скрывать счёт</span><input type="checkbox" /><i></i></label></div>
      <button class="mx-yest" type="button">Вчера, 5 октября · 31 матч — показать</button>
      <h2 class="mx-day">Сегодня, 6 октября <small>38 матчей</small></h2>
      ${ТУРНИРЫ.map(турнир).join('')}
      <h2 class="mx-day">Завтра, 7 октября <small>26 матчей</small></h2>
      ${ЗАВТРА.map(турнир).join('')}
      <button class="mx-more mx-more--day" type="button">Все 26 матчей завтра</button>
    </main>`

  // Кусочки для форм раскрытия (варианты берут их через MX)
  const КУСКИ = {
    карты: (m, k) => k === 'live'
      ? `<div class="mx-chips"><span class="is-done">К1 ${лого(m.a, 'sm')} <b>34:21</b></span><span class="is-now"><i class="mx-dot"></i>К2 · ${m.часы || 'идёт'} <b>18:12</b></span><span>К3 —</span></div>`
      : `<div class="mx-chips"><span class="is-done">К1 ${лого(m.a, 'sm')} <b>31:18</b></span><span class="is-done">К2 ${лого(m.a, 'sm')} <b>27:20</b></span></div>`,
    шанс: m => `<div class="mx-chance"><span>${имя(m.a)} <b>64%</b></span><div class="mx-bar mx-bar--win"><i style="--p:64%"></i></div><span><b>36%</b> ${имя(m.b)}</span></div>`,
    форма: m => `<div class="mx-forms"><p>${лого(m.a, 'sm')}${точки('WWLWW')}</p><p>${лого(m.b, 'sm')}${точки('LWWLL')}</p></div>`,
    голос: m => `<div class="mx-vote2"><button type="button" class="is-on">${лого(m.a, 'sm')}<span>${имя(m.a)}</span><b>58%</b></button><button type="button">${лого(m.b, 'sm')}<span>${имя(m.b)}</span><b>42%</b></button></div>`,
    встречи: m => `<div class="mx-chance"><span>${имя(m.a)} <b>3</b></span><div class="mx-bar"><i style="--p:60%"></i></div><span><b>2</b> ${имя(m.b)}</span></div>`,
    игрок: m => `<p class="mx-pl"><img src="/p-fw3k/site/img/players/pure.webp" alt="" /><span>Pure · ${имя(m.a)}<small>игрок матча · 14 / 2 / 11</small></span></p>`,
    события: m => `<ul class="mx-ev"><li><time>23:40</time>${имя(m.a)} забрали Рошана</li><li><time>21:05</time>${имя(m.b)} снесли башню на центре</li></ul>`,
    новость: m => `<a class="mx-nw" href="#">Разбор: как ${имя(m.a)} закрыла серию за 82 минуты<small>15 минут назад</small></a>`,
    кнопки: (m, k) => k === 'live' ? `<a class="mx-btn mx-btn--main" href="#">Смотреть</a><a class="mx-btn" href="#">Страница матча</a>` : `<a class="mx-btn mx-btn--main" href="#">Страница матча</a>`,
    лого, имя, тег, статус: m => СТАТУС[m.st](m),
  }
  window.MX = { КУСКИ, вид, ПО_ID }

  const страница = `<div class="mx-scroll">${шапка}<div class="mx-app">${центр}${правая}</div></div>${таббар}`
  document.querySelectorAll('[data-mx]').forEach(f => { f.innerHTML = страница; window.MX_ПОСЛЕ?.(f) })
  if (V === 'v1') return

  const форма = ФОРМЫ[V]
  const открыть = (row, on) => {
    const frame = row.closest('[data-mx]'), m = ПО_ID[row.dataset.id], k = вид(m)
    if (!k) return
    frame.querySelectorAll('.mx-row.is-open').forEach(r => { if (r !== row) { r.classList.remove('is-open'); r.querySelector('.mx-qv')?.remove(); r.querySelector('.mx-chev').textContent = '⌄' } })
    const будет = on ?? !row.classList.contains('is-open')
    row.classList.toggle('is-open', будет); row.querySelector('.mx-chev').textContent = будет ? '⌃' : '⌄'
    row.querySelector('.mx-qv')?.remove()
    if (форма.панель) { форма.панель(frame, будет ? m : null, k); return }
    if (будет) row.insertAdjacentHTML('beforeend', `<div class="mx-qv mx-qv--${V}">${форма(m, k)}</div>`)
    форма.после?.(row)
  }
  document.addEventListener('click', e => {
    if (e.target.closest('.mx-fav, .mx-spoil, .mx-qv, a')) return
    const row = e.target.closest('.mx-row.is-click'); if (row) открыть(row)
  })
  // Переключалка над рамками: «Скоро» / «В эфире» / «Итог» — раскрыть пример в обеих рамках и подсветить
  const ПРИМЕР = { soon: 'flc-tl', delay: 'navi-mouz', moved: 'nrg-edg', draft: 't1-gen', live: 'ts-tun', pause: 'gg-pv', break: 'g2-faze', done: 'aur-bb', hidden: 'prx-loud', cancel: 'rrq-ae' }
  const показать = (вид_, листать) => {
    document.querySelectorAll('[data-show]').forEach(x => x.setAttribute('aria-pressed', x.dataset.show === вид_))
    document.querySelectorAll('[data-mx]').forEach((f, i) => {
      if (вид_ === 'none') { f.querySelectorAll('.mx-row.is-open').forEach(r => открыть(r, false)); return }
      const row = f.querySelector(`.mx-row[data-id="${ПРИМЕР[вид_]}"]`)
      открыть(row, true)
      if (!листать) return
      row.classList.add('is-hl'); setTimeout(() => row.classList.remove('is-hl'), 1600)
      const sc = f.querySelector('.mx-scroll')
      if (f.classList.contains('mx-frame--phone')) sc.scrollTop += row.getBoundingClientRect().top - sc.getBoundingClientRect().top - 140
      else if (i === 0) row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
  document.querySelectorAll('[data-show]').forEach(b => b.addEventListener('click', () => показать(b.dataset.show, true)))
  // Сразу раскрыт пример «в эфире», чтобы форма была видна без клика
  показать('live', false)
})()
