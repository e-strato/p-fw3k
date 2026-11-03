// Лаба «Главная — первый экран, телефон 390» (исследование «Игровые клиенты», 07.10).
// Данные — те же матчи, что в лабе matches: вторник 6 октября, сейчас 15:35. Часы в каждой рамке свои:
// data-clock="ЧЧ:ММ:СС" задаёт стартовое время, дальше оно идёт само (таймеры тикают, матч в момент старта уходит в эфир).
// Рамка: <div class="hm-phone" data-v="v1" data-clock="15:35:00" data-tab="now" data-game="all" data-slide="0"></div>
(() => {
  const GAMES = {
    all: { n: 'Все игры', s: 'Все' },
    cs: { n: 'CS2', s: 'CS', c: 'var(--c-tier-gold)' },
    dota: { n: 'Dota 2', s: 'D2', c: 'var(--c-team-gg)' },
    lol: { n: 'LoL', s: 'LoL', c: 'var(--c-tier-elite)' },
    val: { n: 'Valorant', s: 'VAL', c: 'var(--c-rarity-holo-1)' },
    mlbb: { n: 'MLBB', s: 'ML', c: 'var(--c-team-tl)' },
  }
  // команда: имя, файл логотипа (если есть), код, цвет
  const T = {
    ts: ['Team Spirit', 'ts', 'TS', '--c-team-ts'], tun: ['Tundra Esports', 'tun', 'TUN', '--c-team-tun'], gg: ['Gaimin Gladiators', 'gg', 'GG', '--c-team-gg'],
    pv: ['PARIVISION', 'pv', 'PV', '--c-team-pv'], flc: ['Team Falcons', 'flc', 'FLC', '--c-team-flc'], tl: ['Team Liquid', 'tl', 'TL', '--c-team-tl'],
    aur: ['Aurora', 'aur', 'AUR', '--c-team-aur'], bb: ['BetBoom Team', 'bb', 'BB', '--c-team-bb'], yg: ['Yangon Galacticos', 'yg', 'YG', '--c-team-yg'],
    xip: ['Xipto Esports', 0, 'XIP', '--c-team-xip'], ive: ['Ivory', 0, 'IVR'],
    vit: ['Team Vitality', 0, 'VIT'], mgz: ['The MongolZ', 0, 'MGZ'], navi: ['Natus Vincere', 0, 'NAVI'], mouz: ['MOUZ', 0, 'MZ'], g2: ['G2 Esports', 0, 'G2'], faze: ['FaZe Clan', 0, 'FZ'],
    t1: ['T1', 0, 'T1'], gen: ['Gen.G', 0, 'GEN'], fnc: ['Fnatic', 0, 'FNC'], blg: ['Bilibili Gaming', 0, 'BLG'],
    prx: ['Paper Rex', 0, 'PRX'], loud: ['LOUD', 0, 'LOUD'], nrg: ['NRG', 0, 'NRG'], edg: ['EDward Gaming', 0, 'EDG'],
    onic: ['ONIC', 0, 'ON'], evos: ['EVOS', 0, 'EV'], rrq: ['RRQ Hoshi', 0, 'RRQ'], ae: ['Alter Ego', 0, 'AE'],
  }
  const TOURS = {
    blast: { g: 'dota', n: 'BLAST Slam VIII', w: 'Плей-офф · $1 000 000', art: 'terrorblade' },
    epl: { g: 'dota', n: 'EPL World Series SEA', w: 'Плей-офф', art: 'tusk' },
    esl: { g: 'cs', n: 'ESL Pro League S24', w: 'Группа C · $850 000', art: 'mars' },
    worlds: { g: 'lol', n: 'Worlds 2026', w: 'Швейцарка, раунд 3', art: 'rubick' },
    vct: { g: 'val', n: 'VCT Champions 2026', w: 'Плей-офф', art: 'hoodwink' },
    mpl: { g: 'mlbb', n: 'MPL Indonesia S18', w: 'Неделя 7', art: 'lycan' },
  }
  // t — начало в минутах от полуночи; st: soon · live · draft · pause · break · delay · moved · cancel · done
  const M = [
    { id: 'aur-bb', tr: 'blast', a: 'aur', b: 'bb', st: 'done', sa: 2, sb: 0, t: 11 * 60 + 30, end: '13:40', bo: 3, stage: 'Четвертьфинал', mvp: 'Pure' },
    { id: 'prx-loud', tr: 'vct', a: 'prx', b: 'loud', st: 'done', sa: 2, sb: 1, t: 10 * 60 + 40, end: '12:55', bo: 3, stage: 'Нижняя сетка', hide: true },
    { id: 'ts-tun', tr: 'blast', a: 'ts', b: 'tun', st: 'live', sa: 1, sb: 0, map: 2, clock: '24:15', t: 14 * 60, bo: 3, stage: 'Полуфинал верхней', fav: true, viewers: '48,2 тыс.', win: 64, gold: '+4,2 тыс.' },
    { id: 'gg-pv', tr: 'blast', a: 'gg', b: 'pv', st: 'pause', sa: 0, sb: 1, map: 2, clock: '6 мин паузы', t: 14 * 60 + 30, bo: 3, stage: 'Нижняя сетка', note: 'Техническая пауза: у Gaimin Gladiators отвалился игрок', viewers: '12,1 тыс.' },
    { id: 'vit-mgz', tr: 'esl', a: 'vit', b: 'mgz', st: 'live', sa: 1, sb: 0, map: 2, clock: 'Mirage · 7 : 5', t: 14 * 60 + 15, bo: 3, stage: 'Группа C', viewers: '31,7 тыс.', win: 58 },
    { id: 'g2-faze', tr: 'esl', a: 'g2', b: 'faze', st: 'break', sa: 1, sb: 1, map: 3, clock: 'карта 3 через 4 мин', t: 13 * 60 + 40, bo: 3, stage: 'Группа C', viewers: '22,4 тыс.' },
    { id: 't1-gen', tr: 'worlds', a: 't1', b: 'gen', st: 'draft', sa: 0, sb: 0, map: 1, clock: 'пики и баны', t: 15 * 60 + 30, bo: 1, stage: 'Раунд 3 · 1–1', viewers: '1,2 млн' },
    { id: 'navi-mouz', tr: 'esl', a: 'navi', b: 'mouz', st: 'delay', t: 15 * 60 + 50, was: '15:00', bo: 3, stage: 'Группа C', note: 'Задержан на 50 минут: прошлый матч на сервере затянулся' },
    { id: 'flc-tl', tr: 'blast', a: 'flc', b: 'tl', st: 'soon', t: 17 * 60, bo: 3, stage: 'Полуфинал верхней', fav: true, mine: 2 },
    { id: 'fnc-blg', tr: 'worlds', a: 'fnc', b: 'blg', st: 'soon', t: 19 * 60, bo: 1, stage: 'Раунд 3 · 1–1' },
    { id: 'onic-evos', tr: 'mpl', a: 'onic', b: 'evos', st: 'soon', t: 20 * 60, bo: 3, stage: 'Неделя 7' },
    { id: 'yg-xip', tr: 'epl', a: 'yg', b: 'xip', st: 'soon', t: 21 * 60, bo: 3, stage: 'Верхняя сетка' },
    { id: 'rrq-ae', tr: 'mpl', a: 'rrq', b: 'ae', st: 'cancel', t: 21 * 60 + 30, bo: 3, stage: 'Неделя 7', note: 'Отменён: Alter Ego снялись с сезона' },
    { id: 'ive-yg', tr: 'epl', a: 'ive', b: 'yg', st: 'soon', t: 23 * 60 + 30, bo: 3, stage: 'Нижняя сетка' },
    { id: 'nrg-edg', tr: 'vct', a: 'nrg', b: 'edg', st: 'moved', t: 2 * 1440 + 12 * 60, now: '8 окт, 12:00', bo: 3, stage: 'Нижняя сетка', note: 'Перенесён: у EDward Gaming задержали визы' },
  ]
  const TOMORROW = [
    { id: 'ts-flc', tr: 'blast', a: 'ts', b: 'flc', st: 'soon', t: 1440 + 14 * 60, bo: 3, stage: 'Финал верхней', note: 'если обе пройдут' },
    { id: 'vit-navi', tr: 'esl', a: 'vit', b: 'navi', st: 'soon', t: 1440 + 16 * 60 + 30, bo: 3, stage: 'Группа C' },
    { id: 'gen-fnc', tr: 'worlds', a: 'gen', b: 'fnc', st: 'soon', t: 1440 + 18 * 60, bo: 1, stage: 'Раунд 4' },
  ]
  const DAYS = [['Вс', 4, 22], ['Пн', 5, 31], ['Сегодня', 6, 38], ['Ср', 7, 26], ['Чт', 8, 24], ['Пт', 9, 19], ['Сб', 10, 30], ['Вс', 11, 12]]
  const AIR = ['live', 'draft', 'pause', 'break']

  // ——— мелочи
  const pad = n => String(n).padStart(2, '0')
  const hhmm = t => pad(Math.floor(t / 60) % 24) + ':' + pad(t % 60)
  const name = id => T[id][0]
  const code = id => T[id][2]
  const tcol = id => T[id][3] ? `var(${T[id][3]})` : null
  const logo = (id, cls = '') => T[id][1] ? `<img class="hm-lg ${cls}" src="/p-fw3k/site/img/teams/${T[id][1]}.png" alt="" />` : `<em class="hm-lg hm-lg--mono ${cls}">${code(id)}</em>`
  const gtag = g => `<span class="hm-gt" style="--g:${GAMES[g].c}">${GAMES[g].n}</span>`
  const gc = m => GAMES[TOURS[m.tr].g].c
  const left = s => {
    if (s >= 86400) return `${Math.floor(s / 86400)} дн ${Math.floor(s % 86400 / 3600)} ч`
    if (s >= 3600) return `${Math.floor(s / 3600)} ч ${Math.floor(s % 3600 / 60)} мин`
    if (s >= 60) return `${Math.ceil(s / 60)} мин`
    return `${s} с`
  }
  const big = s => s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
  const ICON = {
    matches: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    tours: '<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 20h8"/></svg>',
    fantasy: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="10" height="14" rx="2"/><path d="M14 7.5l4.5 1.2a2 2 0 0 1 1.4 2.4l-2.3 8.6a2 2 0 0 1-2.4 1.4l-3-.8"/></svg>',
    rating: '<svg viewBox="0 0 24 24"><path d="M5 20V12M12 20V5M19 20v-5"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  }
  const TABS = [['matches', 'Матчи'], ['tours', 'Турниры'], ['fantasy', 'Фэнтези'], ['rating', 'Рейтинг'], ['more', 'Ещё']]

  // ——— состояние матча на момент «сейчас» (секунды от полуночи): soon/delay, дошедшие до старта, уходят в эфир
  const live = (m, now) => {
    if ((m.st === 'soon' || m.st === 'delay') && now >= m.t * 60) {
      const min = Math.floor((now - m.t * 60) / 60)
      return { ...m, st: min < 4 ? 'draft' : 'live', sa: 0, sb: 0, map: 1, clock: min < 4 ? 'пики и баны' : pad(min - 4) + ':' + pad(now % 60), viewers: '9,8 тыс.', fresh: true }
    }
    return m
  }
  const word = m => ({ live: `Карта ${m.map}`, draft: 'Драфт', pause: 'Пауза', break: 'Перерыв' }[m.st])
  const st = (m, now) => {
    if (AIR.includes(m.st)) return `<span class="hm-s hm-s--air ${m.st === 'pause' || m.st === 'break' ? 'is-hold' : ''}"><i></i>${word(m)}</span>`
    if (m.st === 'done') return `<span class="hm-s">Итог</span>`
    if (m.st === 'cancel') return `<span class="hm-s hm-s--off">Отменён</span>`
    if (m.st === 'moved') return `<span class="hm-s hm-s--warn">Перенесён</span>`
    const s = m.t * 60 - now
    return `<span class="hm-s ${m.st === 'delay' ? 'hm-s--warn' : ''}" data-left="${m.t * 60}">${m.st === 'delay' ? 'задержан · ' : ''}через ${left(s)}</span>`
  }
  const score = (m, k) => m.hide ? '' : (m['s' + k] ?? '')
  const isWin = (m, k) => m.st === 'done' && !m.hide && m['s' + k] > m['s' + (k === 'a' ? 'b' : 'a')]
  const pips = m => `<span class="hm-pips" title="Карта ${m.map} из ${m.bo}">${Array.from({ length: m.bo }, (_, i) => `<i class="${i < m.map - 1 ? 'is-done' : i === m.map - 1 ? 'is-now' : ''}"></i>`).join('')}</span>`

  // ——— общие кусочки экрана
  const statusBar = c => `<div class="hm-sb"><b data-clock>${c}</b><span class="hm-sb__i"><i></i><i></i><i></i><em></em></span></div>`
  const tabbar = (cur = 'matches') => `<nav class="hm-tab">${TABS.map(([k, n]) => `<button type="button" data-tabbar="${k}" ${k === cur ? 'aria-current="page"' : ''}>${ICON[k]}<span>${n}</span>${k === 'fantasy' ? '<em class="hm-badge">1</em>' : ''}</button>`).join('')}</nav>`
  const stub = k => {
    const n = TABS.find(t => t[0] === k)[1]
    const txt = { tours: 'Турниры по 5 играм: идёт сейчас, скоро, сетки и таблицы.', fantasy: 'Твой состав на BLAST Slam VIII: 2 игрока в матче Falcons — Liquid, замены до 17:00.', rating: 'Рейтинг команд и игроков по 5 играм.', more: 'Профиль, избранное, настройки, язык.' }[k]
    return `<div class="hm-stub">${ICON[k]}<h2>${n}</h2><p>${txt}</p><p class="hm-mut">В этой лабе — только первый экран «Матчи». Вернись на вкладку «Матчи» внизу.</p></div>`
  }
  const row = (m, now, o = {}) => `<article class="hm-row ${m.st === 'done' ? 'is-done' : ''} ${m.st === 'cancel' ? 'is-off' : ''} ${o.cls || ''}">
      <div class="hm-row__tm">
        <p class="${isWin(m, 'a') ? 'is-win' : m.st === 'done' && !m.hide ? 'is-lose' : ''}">${logo(m.a, 'sm')}<span>${name(m.a)}</span><b>${score(m, 'a')}</b></p>
        <p class="${isWin(m, 'b') ? 'is-win' : m.st === 'done' && !m.hide ? 'is-lose' : ''}">${logo(m.b, 'sm')}<span>${name(m.b)}</span><b>${score(m, 'b')}</b></p>
      </div>
      <div class="hm-row__r">${m.hide ? '<button type="button" class="hm-spoil">Показать счёт</button>' : st(m, now)}<small>${o.sub ?? (m.st === 'moved' ? m.now : m.stage)}</small></div>
      ${m.note && o.note !== false ? `<p class="hm-row__note">${m.note}</p>` : ''}
    </article>`

  // ——— v1 «Очередь»: следующий матч — герой, за ним лента по времени
  const v1 = (ph, now) => {
    const ms = M.map(m => live(m, now))
    const air = ms.filter(m => AIR.includes(m.st))
    const next = ms.filter(m => (m.st === 'soon' || m.st === 'delay') && m.t * 60 > now).sort((a, b) => a.t - b.t)
    const h = next[0], tr = TOURS[h.tr], s = h.t * 60 - now, soonish = s < 300
    const later = next.slice(1)
    const done = ms.filter(m => m.st === 'done')
    return `<header class="hm-top"><div><small>Вторник, 6 октября</small><h1>Матчи</h1></div><button type="button" class="hm-ic">${ICON.search}</button><button type="button" class="hm-ic">${ICON.bell}<em class="hm-dot"></em></button></header>
      <div class="hm-airline"><span class="hm-airline__h"><i></i>Идёт · ${air.length}</span>${air.map(m => `<a href="#" class="hm-airchip" style="--g:${gc(m)}">${logo(m.a, 'xs')}<b>${m.sa}:${m.sb}</b>${logo(m.b, 'xs')}<small>${word(m)}</small></a>`).join('')}</div>
      <section class="hm-hero ${soonish ? 'is-soon' : ''}" style="--ta:${tcol(h.a) || gc(h)};--tb:${tcol(h.b) || gc(h)}">
        <p class="hm-hero__k">${h.st === 'delay' ? '<span class="hm-s hm-s--warn">задержан</span>' : ''}<span>Следующий матч</span>${gtag(tr.g)}</p>
        <div class="hm-hero__vs">
          <div class="hm-hero__t">${logo(h.a, 'xl')}<b>${name(h.a)}</b></div>
          <div class="hm-hero__c"><b data-big="${h.t * 60}">${big(s)}</b><small>${h.st === 'delay' ? `<s>${h.was}</s> ` : ''}начало в ${hhmm(h.t)}</small></div>
          <div class="hm-hero__t">${logo(h.b, 'xl')}<b>${name(h.b)}</b></div>
        </div>
        <p class="hm-hero__w">${tr.n} · ${h.stage} · Bo${h.bo}</p>
        ${h.note ? `<p class="hm-hero__n">${h.note}</p>` : ''}
        <div class="hm-hero__btn"><button type="button" class="hm-btn hm-btn--main" data-toggle="Напомню за 5 минут ✓">${soonish ? 'Открыть трансляцию' : 'Напомнить о начале'}</button><a class="hm-btn" href="#">Матч</a></div>
        ${h.mine ? `<p class="hm-hero__mine">В матче ${h.mine} твоих игрока · состав закрывается в ${hhmm(h.t)}</p>` : ''}
      </section>
      <h2 class="hm-h">Дальше сегодня <small>${later.length}</small></h2>
      <ol class="hm-line">${later.map((m, i) => `<li class="${i === 0 ? 'is-next' : ''}" style="--g:${gc(m)}"><time>${hhmm(m.t)}</time><div class="hm-line__c"><p class="hm-line__h">${gtag(TOURS[m.tr].g)}<span>${TOURS[m.tr].n}</span>${m.fav ? '<em>★</em>' : ''}</p>
        <p class="hm-line__m">${logo(m.a, 'sm')}<b>${name(m.a)}</b><i>—</i><b>${name(m.b)}</b>${logo(m.b, 'sm')}</p>
        <p class="hm-line__f">${st(m, now)}<span>${m.stage}</span></p></div></li>`).join('')}
        ${ms.filter(m => m.st === 'cancel' || m.st === 'moved').map(m => `<li class="is-off"><time>${m.st === 'moved' ? '8 окт' : hhmm(m.t)}</time><div class="hm-line__c"><p class="hm-line__m"><b>${name(m.a)}</b><i>—</i><b>${name(m.b)}</b></p><p class="hm-line__f">${st(m, now)}<span>${m.note}</span></p></div></li>`).join('')}</ol>
      <h2 class="hm-h hm-h--dim">Уже сыграно <small>${done.length}</small></h2>
      <div class="hm-list">${done.map(m => row(m, now)).join('')}</div>`
  }

  // ——— v2 «Слоёный компаньон»: карусель → плитки → турнир → прогресс → эфир → лента
  const SLIDES = [
    { art: 'terrorblade', h: 'BLAST Slam VIII — плей-офф', p: 'Spirit и Tundra в полуфинале верхней сетки, идёт карта 2', g: 'dota' },
    { art: 'rubick', h: 'Worlds 2026 — швейцарка, раунд 3', p: 'T1 — Gen.G в драфте: кто выйдет в 2–1', g: 'lol' },
    { art: 'mars', h: 'Tundra без Topson на BLAST', p: 'Замена — 33. Что это меняет для фэнтези', g: 'dota', news: true },
  ]
  const v2 = (ph, now) => {
    const ms = M.map(m => live(m, now))
    const air = ms.filter(m => AIR.includes(m.st))
    const next = ms.filter(m => (m.st === 'soon' || m.st === 'delay') && m.t * 60 > now).sort((a, b) => a.t - b.t)
    const sl = +(ph.dataset.slide || 0)
    return `<header class="hm-top hm-top--me"><span class="hm-ava">K</span><div><b>Keyser</b><small><em class="hm-coin">◆</em> 1 240 очков · место 3 812</small></div><button type="button" class="hm-ic">${ICON.search}</button></header>
      <div class="hm-car" data-car>${SLIDES.map((s, i) => `<a href="#" class="hm-slide ${i === sl ? 'is-on' : ''}" style="--art:url(/p-fw3k/site/img/heroes/${s.art}.webp)">${gtag(s.g)}${s.news ? '<span class="hm-slide__nw">Новость</span>' : ''}<b>${s.h}</b><span>${s.p}</span></a>`).join('')}</div>
      <div class="hm-cdots">${SLIDES.map((_, i) => `<button type="button" data-slide-to="${i}" ${i === sl ? 'aria-current="true"' : ''}></button>`).join('')}</div>
      <div class="hm-tiles">
        <a href="#" class="hm-tile"><span class="hm-tile__i">${logo('ts')}${logo('aur')}</span><b>Мои команды</b><small>Spirit в эфире</small></a>
        <a href="#" class="hm-tile">${ICON.fantasy}<b>Фэнтези</b><small class="is-warn" data-left-txt="${17 * 3600}">состав до 17:00</small><em class="hm-tile__n">!</em></a>
        <a href="#" class="hm-tile">${ICON.rating}<b>Прогнозы</b><small>2 матча открыты</small><em class="hm-tile__n">2</em></a>
        <a href="#" class="hm-tile">${ICON.tours}<b>Турниры</b><small>6 идут сегодня</small></a>
      </div>
      <a href="#" class="hm-tban" style="--art:url(/p-fw3k/site/img/heroes/terrorblade.webp)">
        <p>${gtag('dota')}<span>Мальта · $1 000 000</span></p><b>BLAST Slam VIII</b>
        <ol class="hm-steps"><li class="is-done"><i></i>Группы<small>1–3 окт</small></li><li class="is-now"><i></i>Плей-офф<small>сейчас</small></li><li><i></i>Финал<small>11 окт</small></li></ol>
      </a>
      <section class="hm-prog">
        <div class="hm-prog__r"><span class="hm-ring" style="--p:72"><b>184</b></span><div><b>Фэнтези на BLAST</b><small>184 очка · до награды «Бустер» 16 очков</small><span class="hm-bar"><i style="--p:92%"></i></span></div></div>
        <div class="hm-prog__r"><span class="hm-ring hm-ring--alt" style="--p:70"><b>7/10</b></span><div><b>Прогнозы недели</b><small>7 из 10 угадано · серия 3 подряд</small><span class="hm-bar hm-bar--alt"><i style="--p:70%"></i></span></div></div>
      </section>
      <h2 class="hm-h hm-h--line"><span><i class="hm-livedot"></i>Сейчас в эфире</span><a href="#">Все ${air.length}</a></h2>
      <div class="hm-acards">${air.map(m => `<article class="hm-acard" style="--g:${gc(m)}"><header><span>${GAMES[TOURS[m.tr].g].n} · ${TOURS[m.tr].n}</span>${pips(m)}</header>
        <div class="hm-acard__b"><p>${logo(m.a, 'sm')}<span>${name(m.a)}</span><b>${m.sa}</b></p><p>${logo(m.b, 'sm')}<span>${name(m.b)}</span><b>${m.sb}</b></p></div>
        <footer>${st(m, now)}<span>${m.clock}</span></footer></article>`).join('')}</div>
      <h2 class="hm-h hm-h--line"><span>Дальше сегодня</span><a href="#">Расписание</a></h2>
      <div class="hm-list">${next.slice(0, 5).map(m => row(m, now, { sub: `${hhmm(m.t)} · ${GAMES[TOURS[m.tr].g].n}`, note: false })).join('')}</div>`
  }

  // ——— v3 «Сейчас / Скоро / Итоги»: полоса дней, вкладки, цвет шапки карточки = игра
  const v3 = (ph, now) => {
    const ms = M.map(m => live(m, now))
    const game = ph.dataset.game || 'all', tab = ph.dataset.tab || 'now', day = +(ph.dataset.day ?? 2)
    const inGame = m => game === 'all' || TOURS[m.tr].g === game
    const sets = {
      now: ms.filter(m => AIR.includes(m.st)),
      soon: ms.filter(m => ['soon', 'delay', 'moved', 'cancel'].includes(m.st)).sort((a, b) => a.t - b.t),
      done: ms.filter(m => m.st === 'done'),
    }
    const list = day === 2 ? sets[tab].filter(inGame) : day > 2 ? (tab === 'soon' ? TOMORROW.filter(inGame) : []) : (tab === 'done' ? sets.done.filter(inGame) : [])
    const card = m => {
      const g = TOURS[m.tr].g, airy = AIR.includes(m.st)
      return `<article class="hm-gcard ${m.st === 'cancel' || m.st === 'moved' ? 'is-off' : ''}" style="--g:${GAMES[g].c}">
        <header><b>${GAMES[g].n}</b><span>${TOURS[m.tr].n}</span>${airy ? pips(m) : `<em>Bo${m.bo}</em>`}</header>
        <div class="hm-gcard__b">
          ${tab === 'soon' || (!airy && m.st !== 'done') ? `<div class="hm-gcard__time"><b>${m.st === 'moved' ? '8 окт' : hhmm(m.t)}</b>${st(m, now)}</div>` : ''}
          <div class="hm-gcard__tm">
            <p class="${isWin(m, 'a') ? 'is-win' : m.st === 'done' && !m.hide ? 'is-lose' : ''}">${logo(m.a, 'sm')}<span>${name(m.a)}</span>${airy || m.st === 'done' ? `<b>${score(m, 'a')}</b>` : ''}</p>
            <p class="${isWin(m, 'b') ? 'is-win' : m.st === 'done' && !m.hide ? 'is-lose' : ''}">${logo(m.b, 'sm')}<span>${name(m.b)}</span>${airy || m.st === 'done' ? `<b>${score(m, 'b')}</b>` : ''}</p>
          </div>
          ${airy ? `<div class="hm-gcard__st">${st(m, now)}<small>${m.clock}</small></div>` : ''}
          ${m.st === 'done' ? `<div class="hm-gcard__st">${m.hide ? '<button type="button" class="hm-spoil">Показать счёт</button>' : `<span class="hm-s">Итог</span>`}<small>в ${m.end}</small></div>` : ''}
        </div>
        ${m.note ? `<p class="hm-gcard__n">${m.note}</p>` : ''}
        ${m.win ? `<div class="hm-gcard__w"><span>${code(m.a)} ${m.win}%</span><span class="hm-bar"><i style="--p:${m.win}%"></i></span><span>${100 - m.win}% ${code(m.b)}</span></div>` : ''}
        ${m.mvp ? `<p class="hm-gcard__mvp"><img src="/p-fw3k/site/img/players/pure.webp" alt="" /><span>Игрок матча — <b>${m.mvp}</b>, 14 / 2 / 11</span></p>` : ''}
        ${m.mine && tab === 'soon' ? `<p class="hm-gcard__mvp is-mine">В матче 2 твоих игрока · <a href="#">состав до ${hhmm(m.t)}</a></p>` : ''}
      </article>`
    }
    const n = k => day === 2 ? sets[k].filter(inGame).length : 0
    return `<header class="hm-top"><div><small>Матчи · 5 игр</small><h1>${['4 октября', 'Вчера', 'Сегодня', 'Завтра', '8 октября', '9 октября', '10 октября', '11 октября'][day]}</h1></div><button type="button" class="hm-ic">${ICON.search}</button></header>
      <div class="hm-days">${DAYS.map(([d, dd, k], i) => `<button type="button" data-day="${i}" ${i === day ? 'aria-pressed="true"' : ''} class="${i < 2 ? 'is-past' : ''}"><small>${d}</small><b>${dd}</b><span>${i === 2 ? `<i class="hm-livedot"></i>${k}` : k}</span></button>`).join('')}</div>
      <div class="hm-seg">${[['now', 'Сейчас'], ['soon', 'Скоро'], ['done', 'Итоги']].map(([k, t]) => `<button type="button" data-tab3="${k}" ${k === tab ? 'aria-pressed="true"' : ''}>${k === 'now' && n('now') ? '<i class="hm-livedot"></i>' : ''}${t}<small>${day === 2 ? n(k) : ''}</small></button>`).join('')}</div>
      <div class="hm-gf"><button type="button" class="hm-gf__sel">${ICON.filter}<span>${GAMES[game].n}</span></button>${Object.keys(GAMES).filter(k => k !== 'all').map(k => `<button type="button" data-game="${k}" style="--g:${GAMES[k].c}" ${k === game ? 'aria-pressed="true"' : ''}><i></i>${GAMES[k].s}</button>`).join('')}</div>
      <div class="hm-gcards">${list.length ? list.map(card).join('') : `<p class="hm-empty">${day < 2 ? 'Этот день уже прошёл — смотри «Итоги».' : day > 2 && tab !== 'soon' ? 'Матчи ещё не начались — смотри «Скоро».' : 'Нет матчей по этому фильтру.'}</p>`}</div>`
  }

  // ——— v4 «Постер»: матч в эфире крупным постером, кружки игр, день заголовком, время капсулой
  const v4 = (ph, now) => {
    const ms = M.map(m => live(m, now))
    const air = ms.filter(m => AIR.includes(m.st) && m.viewers)
    const sl = Math.min(+(ph.dataset.slide || 0), air.length - 1), game = ph.dataset.game || 'all'
    const inGame = m => game === 'all' || TOURS[m.tr].g === game
    const poster = (m, i) => `<article class="hm-poster ${i === sl ? 'is-on' : ''}" style="--art:url(/p-fw3k/site/img/heroes/${TOURS[m.tr].art}.webp);--ta:${tcol(m.a) || gc(m)};--tb:${tcol(m.b) || gc(m)}">
        <div class="hm-poster__top"><span class="hm-cap hm-cap--live"><i></i>${word(m)}</span><span class="hm-cap">${m.viewers} смотрят</span></div>
        <button type="button" class="hm-poster__play">${ICON.play}</button>
        <div class="hm-poster__sb">
          <div>${logo(m.a, 'lg')}<b>${code(m.a)}</b></div>
          <div class="hm-poster__sc"><b>${m.sa} : ${m.sb}</b><small>${m.clock}</small></div>
          <div>${logo(m.b, 'lg')}<b>${code(m.b)}</b></div>
        </div>
        <p class="hm-poster__tr">${TOURS[m.tr].n} · ${m.stage} · Bo${m.bo}</p>
      </article>`
    const day = (title, list) => `<h2 class="hm-dayh">${title}</h2><div class="hm-crows">${list.map(m => {
      const airy = AIR.includes(m.st)
      const cap = airy ? `<span class="hm-cap hm-cap--live"><i></i>${m.sa} : ${m.sb}</span>` : m.st === 'done' ? (m.hide ? '<span class="hm-cap">Счёт скрыт</span>' : `<span class="hm-cap hm-cap--done">${m.sa} : ${m.sb}</span>`) : m.st === 'cancel' ? '<span class="hm-cap hm-cap--off">Отменён</span>' : m.st === 'moved' ? '<span class="hm-cap hm-cap--warn">8 окт</span>' : `<span class="hm-cap ${m.st === 'delay' ? 'hm-cap--warn' : ''}">${hhmm(m.t)}</span>`
      return `<a href="#" class="hm-crow ${m.st === 'cancel' || m.st === 'moved' ? 'is-off' : ''}"><span class="hm-crow__g" style="--g:${gc(m)}">${GAMES[TOURS[m.tr].g].s}</span>
        <div class="hm-crow__m"><p>${logo(m.a, 'sm')}<b class="${isWin(m, 'b') ? 'is-lose' : ''}">${code(m.a)}</b><i>—</i><b class="${isWin(m, 'a') ? 'is-lose' : ''}">${code(m.b)}</b>${logo(m.b, 'sm')}</p><small>${TOURS[m.tr].n} · ${m.stage}${m.st === 'delay' ? ' · задержан' : ''}</small></div>${cap}</a>`
    }).join('') || '<p class="hm-empty">Нет матчей этой игры.</p>'}</div>`
    const today = ms.filter(inGame).sort((a, b) => (AIR.includes(b.st) - AIR.includes(a.st)) || (a.st === 'done') - (b.st === 'done') || a.t - b.t)
    return `<div class="hm-postwrap"><header class="hm-top hm-top--float"><h1>Матчи</h1><button type="button" class="hm-ic">${ICON.search}</button><button type="button" class="hm-ic">${ICON.bell}<em class="hm-dot"></em></button></header>
      <div class="hm-posters">${air.map(poster).join('')}</div>
      <div class="hm-poster__btns"><button type="button" class="hm-btn hm-btn--main">${ICON.play}Смотреть</button><a href="#" class="hm-btn">Матч</a></div>
      <div class="hm-cdots hm-cdots--post">${air.map((_, i) => `<button type="button" data-slide-to="${i}" ${i === sl ? 'aria-current="true"' : ''}></button>`).join('')}</div></div>
      <div class="hm-circles">${Object.keys(GAMES).map(k => `<button type="button" data-game="${k}" ${k === game ? 'aria-pressed="true"' : ''} style="--g:${GAMES[k].c || 'var(--c-accent)'}"><i>${GAMES[k].s}</i><span>${GAMES[k].n}</span></button>`).join('')}</div>
      ${day('Вторник, 6 октября', today)}
      ${day('Среда, 7 октября', TOMORROW.filter(inGame))}`
  }

  const V = { v1, v2, v3, v4 }

  // ——— рамки: рендер, часы, клики
  const sec = s => { const [h, m, x] = s.split(':').map(Number); return h * 3600 + m * 60 + (x || 0) }
  const fmt = s => pad(Math.floor(s / 3600) % 24) + ':' + pad(Math.floor(s % 3600 / 60))
  const phones = [...document.querySelectorAll('.hm-phone')]
  const t0 = Date.now()
  const nowOf = ph => sec(ph.dataset.clock || '15:35:00') + Math.floor((Date.now() - t0) / 1000)
  const render = ph => {
    const now = nowOf(ph), sc = ph.querySelector('.hm-scroll'), top = sc ? sc.scrollTop : 0, tab = ph.dataset.tabbar || 'matches'
    ph.innerHTML = `<div class="hm-screen">${statusBar(fmt(now))}<div class="hm-scroll">${tab === 'matches' ? V[ph.dataset.v](ph, now) : stub(tab)}</div>${tabbar(tab)}</div>`
    ph.querySelector('.hm-scroll').scrollTop = top
    ph._next = Math.min(...M.concat(TOMORROW).filter(m => (m.st === 'soon' || m.st === 'delay') && m.t * 60 > now).map(m => m.t * 60))
    if (ph.dataset.scroll) ph.querySelector('.hm-scroll').scrollTop = +ph.dataset.scroll, delete ph.dataset.scroll
  }
  phones.forEach(render)
  setInterval(() => phones.forEach(ph => {
    const now = nowOf(ph)
    if (now >= ph._next) return render(ph)
    ph.querySelector('[data-clock]').textContent = fmt(now)
    ph.querySelectorAll('[data-left]').forEach(e => { const s = e.dataset.left - now; e.textContent = e.textContent.replace(/через .*/, 'через ' + left(s)) })
    ph.querySelectorAll('[data-big]').forEach(e => { e.textContent = big(e.dataset.big - now) })
  }), 1000)
  // карусели (v2, v4) листаются сами
  setInterval(() => phones.forEach(ph => {
    if (ph.dataset.auto !== '1') return
    const n = ph.querySelectorAll('.hm-slide, .hm-poster').length
    if (!n) return
    ph.dataset.slide = ((+ph.dataset.slide || 0) + 1) % n; render(ph)
  }), 5000)

  document.addEventListener('click', e => {
    const ph = e.target.closest('.hm-phone'); if (!ph) return
    const b = e.target.closest('button, a'); if (!b) return
    if (b.tagName === 'A') e.preventDefault()
    const d = b.dataset
    if (d.tabbar) { ph.dataset.tabbar = d.tabbar; ph.querySelector('.hm-scroll').scrollTop = 0; return render(ph) }
    if (d.slideTo) { ph.dataset.slide = d.slideTo; ph.dataset.auto = '0'; return render(ph) }
    if (d.tab3) { ph.dataset.tab = d.tab3; return render(ph) }
    if (d.day) { ph.dataset.day = d.day; ph.dataset.tab = +d.day < 2 ? 'done' : +d.day > 2 ? 'soon' : ph.dataset.tab; return render(ph) }
    if (d.game) { ph.dataset.game = ph.dataset.game === d.game && d.game !== 'all' ? 'all' : d.game; return render(ph) }
    if (b.classList.contains('hm-spoil')) { b.outerHTML = '<span class="hm-s">Итог · 2 : 1</span>'; return }
    if (d.toggle) { const t = b.textContent; b.textContent = d.toggle; d.toggle = t; b.classList.toggle('is-on'); return }
    if (b.classList.contains('hm-gf__sel')) { ph.dataset.game = 'all'; return render(ph) }
  })
})()
