// Лаба «Шапка портала», второй заход (дирижёр 15.10: прежние 4 — «ни один не нравится», делаем от нынешней шапки сайта и меняем минимум).
// Показываем только шапку, без страницы под ней (дирижёр 15.10).
// Шапка — на классах сайта (.ui-header, .ui-header__game, .ui-tabs, .btn); меняется только: бренд портала, 5 игр, короткое меню без «Матчей»,
// фэнтези — один вход (открывает вторую строку с разделами фэнтези). ?v=5..7 — вариант, &fan=1 — вход в фэнтези открыт.
;(() => {
  const q = new URLSearchParams(location.search)
  const S = { v: +q.get('v') || 5, fan: q.get('fan') === '1', game: 'dota', nav: 'mc', fnav: 'lineup' }
  const ИГРЫ = [['cs', 'CS 2'], ['dota', 'Dota 2'], ['lol', 'LoL'], ['val', 'Valorant'], ['mlbb', 'MLBB']]
  const РАЗДЕЛЫ = [['mc', 'Расписание'], ['trn', 'Турниры'], ['news', 'Новости'], ['teams', 'Команды и игроки']]
  const ФЭНТЕЗИ = [['lineup', 'Состав'], ['boost', 'Бустеры'], ['coll', 'Коллекция'], ['quests', 'Квесты'], ['lead', 'Лидеры'], ['how', 'Как это работает']]

  const игры = (кл = '') => `<div class="btn-row ui-header__game ${кл}" role="group" aria-label="Игра">${ИГРЫ.map(([id, t]) => `<button class="btn btn--quiet btn--xs" type="button" data-hg="${id}" aria-pressed="${S.game === id}"><i class="hd-gdot hd-gdot--${id}"></i>${t}</button>`).join('')}</div>`
  const пункт = ([id, t], набор = 'nav') => `<a class="ui-tabs__a" href="#" data-h${набор}="${id}"${(набор === 'nav' ? !S.fan && S.nav === id : S.fnav === id) ? ' aria-current="page"' : ''}>${t}</a>`
  const меню = (хвост = '') => `<nav class="ui-tabs ui-header__nav" aria-label="Разделы">${РАЗДЕЛЫ.map((р) => пункт(р)).join('')}${хвост}</nav>`
  const вкладкаФэнтези = `<a class="ui-tabs__a hd-fan-tab" href="#" data-hfan${S.fan ? ' aria-current="page"' : ''}>★ Фэнтези</a>`
  const монеты = `<div class="ui-header__coins"><span>Монеты</span><b>1 000</b><button class="btn btn--quiet btn--sm" type="button">Забрать +50</button></div>`
  const кнопкаФэнтези = `<button class="btn btn--sm hd-fan-btn" type="button" data-hfan aria-pressed="${S.fan}">★ Фэнтези</button>`
  const подменю = () => (S.fan ? `<nav class="ui-tabs ui-header__nav hd-sub" aria-label="Фэнтези"><span class="hd-sub__t">Фэнтези</span>${ФЭНТЕЗИ.map((р) => пункт(р, 'fnav')).join('')}</nav>` : '')
  const бренд = `<a class="ui-header__brand" href="#" data-hnav="mc">Cybersport</a>`

  const ШАПКИ = {
    // v5 — нынешняя шапка 1 : 1: бренд · игры · монеты; меню плашкой; фэнтези — последней вкладкой меню
    5: () => `<div class="ui-header__top">${бренд}${игры()}${S.fan ? монеты : ''}</div>${меню('<i class="hd-sep"></i>' + вкладкаФэнтези)}${подменю()}`,
    // v6 — меню поднято в первую строку к бренду; справа фэнтези вместе с монетами; игры — второй строкой
    6: () => `<div class="ui-header__top">${бренд}${меню()}<div class="hd-right">${S.fan ? монеты : ''}${кнопкаФэнтези}</div></div>${игры('hd-games-row')}${подменю()}`,
    // v7 — игры отдельной тонкой полосой над шапкой; ниже бренд, меню и кнопка «Фэнтези» справа
    7: () => `<div class="hd-rail">${игры('hd-rail__g')}</div><div class="ui-header__top">${бренд}${меню()}<div class="hd-right">${S.fan ? монеты : ''}${кнопкаФэнтези}</div></div>${подменю()}`,
  }
  const шапка = () => `<header class="ui-header hd hd--v${S.v}"><div class="ui-header__in">${ШАПКИ[S.v]()}</div></header>`

  // Только шапка, без страницы под ней (дирижёр 15.10: «показывать только шапку, без ничего»)
  document.body.insertAdjacentHTML('afterbegin', '<header class="ui-header"></header>')
  const рисовать = () => { document.querySelector('.ui-header').outerHTML = шапка() }
  рисовать()

  document.addEventListener('click', (e) => {
    const t = e.target.closest('.hd [data-hg], .hd [data-hnav], .hd [data-hfnav], .hd [data-hfan]')
    if (!t) return
    e.preventDefault(); e.stopPropagation()
    if (t.dataset.hg) S.game = t.dataset.hg
    else if (t.dataset.hnav) { S.nav = t.dataset.hnav; S.fan = false }
    else if (t.dataset.hfnav) S.fnav = t.dataset.hfnav
    else S.fan = !S.fan
    рисовать()
  }, true)
})()
