// Лаба «Матч + фэнтези до начала» — движок: данные матча Team Spirit — Tundra Esports (Dota 2, до начала 2 ч 25 мин,
// состав закрывается за 10 мин до старта), игроки обеих команд картами «Жетон», друзья, таймеры. Исследование «Игровые клиенты»,
// направление Б «Турнир-хаб»: CS2 Pick'Em, Dota 2 TI Fantasy / Predictions, EA FC Live Event, Destiny 2 (два таймера), LoL (миссии).
// Вариант задаёт раскладку: MF.вариант = (S, x) => html, свои действия — MF.действия = { имя: (S, el) => … }, переключалки лабы — MF.инструменты.
// Рамки — десктоп 1440 (уменьшается под окно) и телефон 390; обе рисуются одной разметкой, таймеры тикают раз в секунду без перерисовки.
;(() => {
  const МАТЧ = { a: 'ts', b: 'tun', игра: 'Dota 2', тур: 'BLAST Slam VIII', стадия: 'Плей-офф · полуфинал верхней сетки', bo: 'Bo3', t: '17:00', дата: '6 октября', приз: '$1 000 000' }
  const КОМ = {
    ts: ['Team Spirit', 'Spirit', '3-е в рейтинге'], tun: ['Tundra Esports', 'Tundra', '8-е в рейтинге'], pv: ['PARIVISION', 'PV'], bb: ['BetBoom Team', 'BetBoom'],
    flc: ['Team Falcons', 'Falcons'], tl: ['Team Liquid', 'Liquid'], gg: ['Gaimin Gladiators', 'GG'], aur: ['Aurora', 'Aurora'],
    vit: ['Team Vitality', 'Vitality', '', 'VIT'], mgz: ['The MongolZ', 'MongolZ', '', 'MGZ'], t1: ['T1', 'T1', '', 'T1'], gen: ['Gen.G', 'Gen.G', '', 'GEN'],
  }
  const ЛОГО = new Set(['ts', 'tun', 'pv', 'bb', 'flc', 'tl', 'gg', 'aur'])
  const ЦВЕТ = { ts: 'var(--c-team-ts)', tun: 'var(--c-team-tun)', pv: 'var(--c-team-pv)', bb: 'var(--c-team-bb)', flc: 'var(--c-team-flc)', tl: 'var(--c-team-tl)', gg: 'var(--c-team-gg)', aur: 'var(--c-team-aur)' }
  // Игроки матча: ник, позиция, команда, OVR, редкость, фото, прогноз очков, есть ли карта в коллекции
  const ИГРОКИ = {
    yatoro: ['Yatoro', 1, 'ts', 82, 'holo', 'yatoro', 21.4, 1], larl: ['Larl', 2, 'ts', 80, 'base', '', 18.2, 1], collapse: ['Collapse', 3, 'ts', 88, 'prism', '', 15.1, 1],
    rue: ['Rue', 4, 'ts', 78, 'base', 'rue', 12.6, 1], miposhka: ['Miposhka', 5, 'ts', 76, 'base', '', 9.8, 1],
    pure: ['Pure', 1, 'tun', 93, 'prism', 'pure', 24.0, 1], bzm: ['bzm', 2, 'tun', 84, 'holo', '', 17.9, 0], n33: ['33', 3, 'tun', 79, 'base', '', 9.1, 1],
    saksa: ['Saksa', 4, 'tun', 81, 'holo', '', 11.4, 0], whitemon: ['Whitemon', 5, 'tun', 74, 'base', '', 7.7, 1],
  }
  const РОЛЬ = ['', 'Керри', 'Мид', 'Хардлейн', 'Поддержка 4', 'Поддержка 5']
  const ДРУЗЬЯ = [['Kostya_D', 1840], ['mirra', 1620], ['Вы', 1490, 1], ['tolik.exe', 1310], ['Sasha K', 990], ['nekit', 760]]

  const п = (id) => { const [ник, pos, к, ovr, r, фото, очки, есть] = ИГРОКИ[id]; return { id, ник, pos, к, ovr, r, фото, очки, есть: !!есть } }
  const имя = (k) => КОМ[k][0], кор = (k) => КОМ[k][1]
  const лого = (k, cls = '') => ЛОГО.has(k) ? `<img class="mf-lg ${cls}" src="/p-fw3k/site/img/teams/${k}.png" alt="" />` : `<span class="mf-lg mf-lg--mono ${cls}">${КОМ[k][3] || кор(k).slice(0, 3)}</span>`
  const сила = (ovr) => (ovr >= 90 ? 'elite' : ovr >= 75 ? 'gold' : ovr >= 60 ? 'silver' : 'bronze')
  const ава = (id, cls = '') => { const x = п(id); return `<img class="mf-ava ${x.фото ? '' : 'mf-ava--sil'} ${cls}" src="/p-fw3k/site/img/players/${x.фото ? x.фото + '.webp' : '_silhouette.png'}" alt="" />` }
  // Мини-карта «Жетон» — разметка компонента сайта (как app.js [Состав]), обёртка .hg — стили сайта висят на ней
  const карта = (id, w = 120) => {
    const x = п(id), маска = (cl, deco = '') => `<i class="logo-mask ${cl}" data-l="2"${deco} style="--logo: url('/p-fw3k/site/img/teams/${x.к}.png')"></i>`
    const spark = x.r === 'prism' || x.r === 'legend' ? '<i class="fx fx-spark" data-l="4"><b></b><b></b><b></b><b></b><b></b><b></b></i>' : ''
    return `<span class="hg"><span class="kc mk kc--${сила(x.ovr)} kc--${x.r} m3" data-tilt style="--w: ${w}px"><span class="kc__in"><span class="kc__face"><span class="mk-plate">${маска('mk-logo')}${маска('mk-logo mk-logo--a', ' data-deco="2"')}${маска('mk-logo mk-logo--b', ' data-deco="2"')}`
      + `<i class="mk-pix" data-deco="1"></i><i class="mk-halo"></i><img class="ph${x.фото ? '' : ' ph--sil'}" data-l="5" src="/p-fw3k/site/img/players/${x.фото ? x.фото + '.webp' : '_silhouette.png'}" alt="${x.ник}" /><i class="mk-scan" data-deco="3"></i><i class="fx fx-shine" data-l="4"></i>${spark}`
      + `<span class="m3__band"><span class="m3__pos">P${x.pos}</span><span class="m3__nick">${x.ник}</span></span><span class="m3__foot"><b>${имя(x.к)}</b></span></span>`
      + `<svg class="mk-frame" viewBox="0 0 160 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="14,1 159,1 159,181 140,199 1,199 1,14" /></svg>`
      + `<span class="m3__tab"><img class="logo" src="/p-fw3k/site/img/teams/${x.к}.png" alt="" /></span><span class="m3__ovr"><b>${x.ovr}</b></span><i class="fx fx-glare"></i></span></span></span></span>`
  }

  // Время: от «сейчас» до старта и до закрытия состава, тикает (T — секунд до старта)
  const T0 = 2 * 3600 + 25 * 60
  const Т = { t: T0 }
  const чмс = (s) => (s <= 0 ? '00:00:00' : [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':'))
  const словами = (s) => { if (s <= 0) return 'сейчас'; const ч = Math.floor(s / 3600), м = Math.floor(s / 60) % 60; return ч ? `${ч} ч ${м} мин` : м ? `${м} мин ${s % 60} с` : `${s} с` }
  const до = (что) => (что === 'lock' ? Т.t - 600 : Т.t)
  // Часы в разметке: <b data-clock="start|lock" data-fmt="hms|words" [data-shift="секунд позже"]> — обновляются раз в секунду
  const часы = (что, fmt = 'hms') => `<b data-clock="${что}" data-fmt="${fmt}">${fmt === 'words' ? словами(до(что)) : чмс(до(что))}</b>`

  const x = { МАТЧ, КОМ, ИГРОКИ, РОЛЬ, ДРУЗЬЯ, ЦВЕТ, п, имя, кор, лого, ава, карта, часы, чмс, словами, до, Т }

  // Сцена матча — герой-блок: свет цветом команд, логотипы крупно, время старта крупно, под ним — сколько осталось
  x.сцена = (S, низ = '') => `<header class="mf-stage" style="--ta:${ЦВЕТ[МАТЧ.a]};--tb:${ЦВЕТ[МАТЧ.b]}">
    <p class="mf-stage__t"><span class="mf-gt">${МАТЧ.игра}</span><b>${МАТЧ.тур}</b><span>${МАТЧ.стадия} · ${МАТЧ.bo}</span></p>
    <div class="mf-stage__m">
      <div class="mf-team" style="--tc:${ЦВЕТ[МАТЧ.a]}">${лого(МАТЧ.a, 'xl')}<div><b>${имя(МАТЧ.a)}</b><small>${КОМ[МАТЧ.a][2]}</small></div></div>
      <div class="mf-mid"><b>${МАТЧ.t}</b><small>${МАТЧ.дата} · МСК</small>${S.st === 'locked' || S.st === 'win' || S.st === 'lose' ? (S.st === 'locked' ? '<span class="mf-pill mf-pill--bad"><i class="mf-dot"></i>Идёт · карта 1</span>' : '<span class="mf-pill">Завершён · 2 : 1</span>') : `<span class="mf-pill">через&nbsp;${часы('start', 'words')}</span>`}</div>
      <div class="mf-team mf-team--b" style="--tc:${ЦВЕТ[МАТЧ.b]}">${лого(МАТЧ.b, 'xl')}<div><b>${имя(МАТЧ.b)}</b><small>${КОМ[МАТЧ.b][2]}</small></div></div>
    </div>${низ}</header>`

  // Друзья — очки прогнозов турнира
  x.друзья = (плюс = 0) => `<div class="mf-board">${ДРУЗЬЯ.map(([n, o, я], i) => [n, o + (я ? плюс : 0), я]).sort((a, b) => b[1] - a[1]).map(([n, o, я], i) =>
    `<p class="${я ? 'is-me' : ''}"><i>${i + 1}</i><span class="mf-ini">${n[0]}</span><span>${n}</span><b>${o.toLocaleString('ru-RU')}</b><em>${я && плюс ? `<span class="mf-up">+${плюс}</span>` : ''}</em></p>`).join('')}</div>`

  const ШАПКА = `<header class="ui-header"><div class="ui-header__in"><div class="ui-header__top"><a class="ui-header__brand" href="#">Fantasy · Dota 2</a>
    <div class="btn-row ui-header__game" role="group"><button class="btn btn--quiet btn--xs" type="button" aria-pressed="true">Dota</button><button class="btn btn--quiet btn--xs" type="button" aria-pressed="false">LoL</button></div>
    <div class="ui-header__coins"><span>Монеты</span><b>1 000</b><button class="btn btn--quiet btn--sm" type="button">Забрать +50</button></div></div>
    <nav class="ui-tabs ui-header__nav"><a class="ui-tabs__a" href="#">Главная</a><a class="ui-tabs__a" href="#">Матчи</a><a class="ui-tabs__a" href="#" aria-current="page">Match Center</a><a class="ui-tabs__a" href="#">Состав</a><a class="ui-tabs__a" href="#">Бустеры</a><a class="ui-tabs__a" href="#">Коллекция</a><a class="ui-tabs__a" href="#">Квесты</a><a class="ui-tabs__a" href="#">Лидеры</a><a class="ui-tabs__a" href="#">Как это работает</a></nav></div></header>`
  const ТАББАР = `<nav class="mf-tabbar"><a href="#" aria-current="page"><i>▦</i>Матчи</a><a href="#"><i>⌕</i>Поиск</a><a href="#"><i>★</i>Состав</a><a href="#"><i>☆</i>Избранное</a><a href="#"><i>◉</i>Профиль</a></nav>`

  const MF = (window.MF = window.MF || {})
  const S = (MF.S = Object.assign({ st: 'open' }, MF.нач || {}))
  const рамки = () => [...document.querySelectorAll('[data-mf]')]
  const draw = () => {
    const html = `<div class="mf-scroll">${ШАПКА}${MF.крошки === false ? '' : `<div class="mf-crumbs"><a href="#">Match Center</a> / <a href="#">${МАТЧ.тур}</a> / ${имя(МАТЧ.a)} — ${имя(МАТЧ.b)}</div>`}<div class="mf-body">${MF.вариант(S, x)}</div></div>${ТАББАР}<div class="mf-toast" data-toast></div>`
    рамки().forEach((f) => { const sc = f.querySelector('.mf-scroll')?.scrollTop || 0; f.innerHTML = html; const n = f.querySelector('.mf-scroll'); if (n) n.scrollTop = sc })
    document.querySelectorAll('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(S[b.dataset.tool]) === b.dataset.v))
    tilt()
    MF.после?.(S, x)
  }
  MF.draw = draw
  x.тост = (t) => рамки().forEach((f) => { const el = f.querySelector('[data-toast]'); el.textContent = t; el.classList.add('is-on'); clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('is-on'), 2200) })

  // Переключалки лабы: MF.инструменты = [[ключ, подпись, [[значение, имя], …]], …]
  const tools = document.querySelector('[data-tools]')
  if (tools && MF.инструменты) tools.innerHTML = MF.инструменты.map(([k, n, вар]) => `<span>${n}</span><div class="mf-seg">${вар.map(([v, t]) => `<button type="button" data-tool="${k}" data-v="${v}">${t}</button>`).join('')}</div>`).join('')
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tool]')
    if (t) { const v = t.dataset.v; S[t.dataset.tool] = /^-?\d+$/.test(v) ? +v : v; MF.сброс?.(S, t.dataset.tool); draw(); return }
    const a = e.target.closest('[data-act]')
    if (a && MF.действия?.[a.dataset.act]) { e.preventDefault(); if (MF.действия[a.dataset.act](S, a, x) !== false) draw() }
  })

  // Наклон и блик мини-карт — как app.js сайта [Карточка: наклон и блик]
  const tilt = () => document.querySelectorAll('.kc[data-tilt]:not([data-t])').forEach((card) => {
    card.dataset.t = ''
    card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`); card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      card.style.setProperty('--dx', (px - 0.5).toFixed(3)); card.style.setProperty('--dy', (py - 0.5).toFixed(3)); card.classList.add('is-on') })
    card.addEventListener('pointerleave', () => { card.classList.remove('is-on'); ['--mx', '--my', '--dx', '--dy'].forEach((v) => card.style.removeProperty(v)) })
  })

  // Тик раз в секунду: только часы, без перерисовки (наведение и прокрутка не сбиваются)
  setInterval(() => {
    Т.t = Т.t > 0 ? Т.t - 1 : T0
    document.querySelectorAll('[data-clock]').forEach((el) => { const s = до(el.dataset.clock) + (+el.dataset.shift || 0); el.textContent = el.dataset.fmt === 'words' ? словами(s) : чмс(s) })
  }, 1000)

  const fit = () => document.querySelectorAll('.mf-wrap').forEach((w) => { w.firstElementChild.style.zoom = Math.min(1, w.clientWidth / 1440) })
  addEventListener('resize', fit)
  const go = () => { draw(); fit() }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', go); else go()
})()
