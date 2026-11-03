// Лаба «Строка матча» — одна строка матча (закрыта / открыта) в любом из 10 состояний, варианты подачи рядом.
// Данные и содержимое вкладок — общие (как на сайте, Match Center); вариант задаёт только разметку строки: ROW.вариант = (м, открыта, h) => html.
// Страница: переключалка состояний и «закрыта / открыта» сверху; рамки «Колонка матчей · 1000» и «Телефон · 390» под ней.
;(() => {
  const ИГРЫ = { cs: 'CS2', dota: 'Dota 2', lol: 'LoL', val: 'Valorant', mlbb: 'MLBB' }
  const К = {
    ts: ['Team Spirit', 'ts'], tun: ['Tundra Esports', 'tun'], gg: ['Gaimin Gladiators', 'gg'], pv: ['PARIVISION', 'pv'], flc: ['Team Falcons', 'flc'],
    tl: ['Team Liquid', 'tl'], aur: ['Aurora', 'aur'], bb: ['BetBoom Team', 'bb'],
    navi: ['Natus Vincere', 0, 'NAVI'], mouz: ['MOUZ', 0, 'MZ'], g2: ['G2 Esports', 0, 'G2'], faze: ['FaZe Clan', 0, 'FZ'],
    t1: ['T1', 0, 'T1'], gen: ['Gen.G', 0, 'GEN'], prx: ['Paper Rex', 0, 'PRX'], loud: ['LOUD', 0, 'LOUD'], nrg: ['NRG', 0, 'NRG'], edg: ['EDward Gaming', 0, 'EDG'],
    rrq: ['RRQ Hoshi', 0, 'RRQ'], ae: ['Alter Ego', 0, 'AE'],
    yg: ['Yangon Galacticos', 'yg'], vit: ['Team Vitality', 0, 'VIT'], mgz: ['The MongolZ', 0, 'MGZ'], fnc: ['Fnatic', 0, 'FNC'], blg: ['Bilibili Gaming', 0, 'BLG'],
    onic: ['ONIC', 0, 'ON'], evos: ['EVOS', 0, 'EV'], xip: ['Xipto Esports', 0, 'XIP'], ive: ['Ivory', 0, 'IVR'],
  }
  const лого = (id, cls = '') => { const t = К[id]; return t[1] ? `<img class="r-lg ${cls}" src="/p-fw3k/site/img/teams/${t[1]}.png" alt="" />` : `<span class="r-lg r-lg--mono ${cls}">${t[2]}</span>` }
  const имя = id => К[id][0]
  const тег = g => `<span class="r-gt">${ИГРЫ[g]}</span>`
  const точки = s => `<span class="r-form">${[...s].map(c => `<i class="${c === 'W' ? 'w' : 'l'}"></i>`).join('')}</span>`

  // По одному матчу на состояние — те же, что на сайте
  const СОСТОЯНИЯ = [
    ['soon', 'Скоро', { g: 'dota', тур: 'BLAST Slam VIII', стадия: 'Полуфинал верхней', a: 'flc', b: 'tl', t: '17:00', через: 'через 1 ч 25 мин', bo: 'Bo3', fav: true }],
    ['delay', 'Задержан', { g: 'cs', тур: 'ESL Pro League S24', стадия: 'Группа C', a: 'navi', b: 'mouz', t: '15:00', новое: '15:50', bo: 'Bo3', заметка: 'Предыдущий матч на этом сервере затянулся до третьей карты' }],
    ['moved', 'Перенесён', { g: 'val', тур: 'VCT Champions 2026', стадия: 'Нижняя сетка', a: 'nrg', b: 'edg', новое: '8 окт, 12:00', bo: 'Bo3', заметка: 'У EDward Gaming задержали визы' }],
    ['draft', 'Драфт', { g: 'lol', тур: 'Worlds 2026', стадия: 'Швейцарка, раунд 3', a: 't1', b: 'gen', sa: 0, sb: 0, карта: 1, bo: 'Bo1' }],
    ['live', 'В эфире', { g: 'dota', тур: 'BLAST Slam VIII', стадия: 'Полуфинал верхней', a: 'ts', b: 'tun', sa: 1, sb: 0, карта: 2, часы: '24:15', bo: 'Bo3', fav: true }],
    ['pause', 'Пауза', { g: 'dota', тур: 'BLAST Slam VIII', стадия: 'Нижняя сетка', a: 'gg', b: 'pv', sa: 0, sb: 1, карта: 2, часы: '6 мин', bo: 'Bo3', заметка: 'Техническая: у Gaimin Gladiators отвалился игрок' }],
    ['break', 'Перерыв', { g: 'cs', тур: 'ESL Pro League S24', стадия: 'Группа C', a: 'g2', b: 'faze', sa: 1, sb: 1, карта: 3, через: '4 мин', bo: 'Bo3' }],
    ['done', 'Итог', { g: 'dota', тур: 'BLAST Slam VIII', стадия: 'Четвертьфинал', a: 'aur', b: 'bb', sa: 2, sb: 0, конец: '13:40', bo: 'Bo3' }],
    ['hidden', 'Счёт скрыт', { g: 'val', тур: 'VCT Champions 2026', стадия: 'Нижняя сетка', a: 'prx', b: 'loud', sa: 2, sb: 1, конец: '12:55', bo: 'Bo3', скрыт: true }],
    ['cancel', 'Отменён', { g: 'mlbb', тур: 'MPL Indonesia S18', стадия: 'Неделя 7', a: 'rrq', b: 'ae', t: '21:30', bo: 'Bo3', заметка: 'Alter Ego снялись с сезона, победа присуждена RRQ Hoshi' }],
  ]

  // Статус словами — две строки: главное (крупно) и пояснение
  const статус = (st, m) => ({
    soon: [m.t, m.через, ''], delay: [m.новое, 'задержан · было ' + m.t, 'warn'], moved: [m.новое, 'перенесён', 'warn'],
    draft: ['Драфт', 'карта ' + m.карта, 'live'], live: ['Карта ' + m.карта, m.часы, 'live'], pause: ['Пауза', m.часы, 'pause'],
    break: ['Перерыв', 'карта ' + m.карта + ' через ' + m.через, 'muted'], done: ['Итог', 'в ' + m.конец, 'muted'], hidden: ['Итог', 'в ' + m.конец, 'muted'], cancel: ['Отменён', 'было в ' + m.t, 'muted'],
  })[st]

  // Вкладки раскрытия и кнопки — как на сайте (Match Center)
  const КАРТЫ_CS = ['Mirage', 'Inferno', 'Ancient']
  const кусочки = (st, m) => {
    const а = имя(m.a), б = имя(m.b), cs = m.g === 'cs'
    const кар = (n, txt, cls = '') => `<span class="${cls}"><small>${cs ? КАРТЫ_CS[n - 1] : 'Карта ' + n}</small><i class="r-mv">${txt}</i></span>`
    const голос = `<div class="r-vote"><button type="button" class="is-on">${лого(m.a, 'sm')}<span>${а}</span><b>58%</b></button><button type="button">${лого(m.b, 'sm')}<span>${б}</span><b>42%</b></button></div>`
    const форма = `<div class="r-forms"><p>${лого(m.a, 'sm')}<span>${а}</span>${точки('WWLWW')}<b>4 из 5</b></p><p>${лого(m.b, 'sm')}<span>${б}</span>${точки('LWWLL')}<b>2 из 5</b></p></div>`
    const встречи = `<div class="r-chance"><span>${а} <b>3</b></span><div class="r-bar"><i style="--p:60%"></i></div><span><b>2</b> ${б}</span></div>`
    const шанс = `<div class="r-chance"><span>${а} <b>64%</b></span><div class="r-bar r-bar--win"><i style="--p:64%"></i></div><span><b>36%</b> ${б}</span></div>`
    const события = `<ul class="r-ev"><li><time>23:40</time>${а} забрали Рошана</li><li><time>21:05</time>${б} снесли башню на центре</li><li><time>18:30</time>Драка у реки: 3 на 1 в пользу ${а}</li></ul>`
    const игрок = `<p class="r-pl"><img src="/p-fw3k/site/img/players/pure.webp" alt="" /><span>Pure · ${а}<small>игрок матча · 14 / 2 / 11 за две карты</small></span></p>`
    const новость = `<a class="r-nw" href="#">Разбор: как ${а} закрыла серию за 82 минуты<small>15 минут назад</small></a>`
    const текст = (t, s) => `<p class="r-txt">${t}<small>${s}</small></p>`
    const карты = {
      live: `<div class="r-maps">${кар(1, `${лого(m.a, 'sm')}<b>${cs ? '13:9' : '34:21'}</b>`, 'is-done')}${кар(2, `<b><i class="r-dot"></i>${cs ? '7:5' : '18:12'}</b>`, 'is-now')}${кар(3, '<b>—</b>')}</div>`,
      pause: `<div class="r-maps">${кар(1, `${лого(m.b, 'sm')}<b>29:33</b>`, 'is-done')}${кар(2, `<b>11:9</b>`, 'is-now')}${кар(3, '<b>—</b>')}</div>`,
      break: `<div class="r-maps">${кар(1, `${лого(m.a, 'sm')}<b>13:9</b>`, 'is-done')}${кар(2, `${лого(m.b, 'sm')}<b>11:13</b>`, 'is-done')}${кар(3, `<b>через ${m.через}</b>`, 'is-now')}</div>`,
      done: `<div class="r-maps">${кар(1, `${лого(m.a, 'sm')}<b>31:18</b>`, 'is-done')}${кар(2, `${лого(m.a, 'sm')}<b>27:20</b>`, 'is-done')}</div>`,
    }
    const драфт = `<div class="r-dr"><p><b>${а}</b><span>Azir</span><span>Lee Sin</span><span class="is-now">выбирает…</span><span class="is-wait">—</span><span class="is-wait">—</span></p><p><b>${б}</b><span>Orianna</span><span>Vi</span><span class="is-wait">—</span><span class="is-wait">—</span><span class="is-wait">—</span></p><p><b>Баны</b><span class="is-ban">Ahri</span><span class="is-ban">Kalista</span><span class="is-ban">Rumble</span><span class="is-ban">Nidalee</span></p></div>`
    const кн = { стр: ['Страница матча', 1], смотреть: ['Смотреть', 1], напомнить: ['★ Напомнить', 0], следить: ['★ Следить', 0], страница: ['Страница матча', 0], запись: ['Смотреть запись', 1], запись2: ['Запись', 0] }
    const К_ = (...ks) => ks.map(k => кн[k])
    const скоро = [['Кто победит', голос], ['Форма', форма], ['Личные встречи', встречи]]
    return {
      soon: [скоро, К_('стр', 'напомнить')],
      delay: [[['Что случилось', текст(`Начало сдвинули с ${m.t} на ${m.новое}.`, m.заметка)], ...скоро], К_('стр', 'напомнить')],
      moved: [[['Что случилось', текст(`Матч перенесён на ${m.новое}. Голоса сохранены.`, m.заметка + '. Уведомим, если время снова сдвинут')], ...скоро.slice(1)], К_('стр', 'следить')],
      draft: [[['Пики и баны', драфт], ['Кто победит', голос], ['Форма', форма]], К_('смотреть', 'страница')],
      live: [[['Карты', карты.live], ['Шанс победы', шанс], ['События', события]], К_('смотреть', 'страница')],
      pause: [[['Почему пауза', текст(`${m.заметка}, ждут переподключения.`, 'Обычно до 10 минут · счёт серии ' + m.sa + ':' + m.sb)], ['Карты', карты.pause], ['Шанс победы', шанс]], К_('смотреть', 'страница')],
      break: [[['Карты', карты.break], ['Следующая карта', текст(`Карта 3 — Ancient, выбор ${б} · начало через ${m.через}.`, 'Счёт серии ' + m.sa + ':' + m.sb + ' — кто возьмёт карту, тот выиграет матч')], ['Шанс победы', шанс]], К_('смотреть', 'страница')],
      done: [[['Карты', карты.done], ['Игрок матча', игрок], ['Новости', новость]], К_('стр', 'запись2')],
      hidden: [[['Счёт скрыт', `<div class="r-hid">Карты, счёт и игрок матча спрятаны, чтобы не испортить запись. <button class="r-btn" type="button" data-spoil>Показать счёт</button></div>`], ['Запись', текст('Полная запись — 2 ч 18 мин, Twitch · RU.', 'Длительность серии не показываем: по ней угадывается счёт')]], К_('запись')],
      cancel: [[], []],
    }[st]
  }
  const кнопки = list => list.map(([t, main]) => `<a class="r-btn${main ? ' r-btn--main' : ''}" href="#">${t}</a>`).join('')

  const h = { лого, имя, тег, точки, статус, кусочки, кнопки, ИГРЫ }
  window.ROW_H = h // для переноса на сайт: собрать раскрытия всех матчей Match Center в разметку
  const S = { st: 'live', open: true }
  const ROW = (window.ROW = window.ROW || {})

  const draw = () => {
    const [st, , данные] = СОСТОЯНИЯ.find(s => s[0] === S.st)
    const m = { ...данные, st: st === 'hidden' ? 'done' : st, вид: st }
    const html = `<div class="r-tour"><header class="r-tb">${тег(m.g)}<b>${m.тур}</b><span>${m.стадия}</span></header>${ROW.вариант(m, S.open && st !== 'cancel', h)}</div>`
    document.querySelectorAll('[data-row]').forEach(f => { f.innerHTML = html })
    document.querySelectorAll('[data-st]').forEach(b => b.setAttribute('aria-pressed', b.dataset.st === S.st))
    document.querySelectorAll('[data-open]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.open === '1') === String(S.open)))
  }
  document.querySelector('[data-states]').innerHTML = СОСТОЯНИЯ.map(([id, n]) => `<button type="button" data-st="${id}">${n}</button>`).join('')
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-st], [data-open]')
    if (b) { if (b.dataset.st) S.st = b.dataset.st; else S.open = b.dataset.open === '1'; draw(); return }
    const tab = e.target.closest('[data-tab]')
    if (tab) { const box = tab.closest('[data-row]'); box.querySelectorAll('[data-tab]').forEach(t => t.setAttribute('aria-selected', t === tab)); box.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== tab.dataset.tab }); return }
    if (e.target.closest('[data-spoil]')) { S.st = 'done'; S.open = true; draw(); return }
    if (e.target.closest('[data-row] [data-toggle]') && !e.target.closest('a, button')) { S.open = !S.open; draw() }
  })
  draw()
})()
