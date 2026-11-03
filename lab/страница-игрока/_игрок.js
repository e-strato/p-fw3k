// Лаба «Страница игрока» — общие данные 9Class и разметка, которую используют все варианты.
// Данные реальные, собраны 30.09.2026: внутренняя документация/страница-игрока/9class-данные.md (Liquipedia, OpenDota, Telegram, интервью).
// Картинки героев, которых нет на сайте, и превью видео — ссылками (CDN Valve, i.ytimg.com), файлов не добавляем.

const ИГРОК = {
  ник: '9Class',
  имя: 'Эдгар Налтакян',
  флаг: 'ru',
  страна: 'Россия',
  родился: '19.07.2003',
  возраст: 23,
  позиция: 4,
  роль: 'Саппорт',
  команда: { имя: 'PARIVISION', тег: 'PV', лого: 'pv', цвет: 'var(--c-team-pv)' },
  фото: '/p-fw3k/site/img/players/9class.webp',
  призовые: '$964 346',
  цифры: [
    { v: '1018', t: 'профматчей' },
    { v: '65 %', t: 'побед' },
    { v: '5', t: 'титулов Tier 1' },
    { v: '$964K', t: 'призовых' },
  ],
  средние: { k: 3.49, d: 6.58, a: 14.36, gpm: 356, xpm: 485 },
  mmr: [
    { дата: '30.09.2023', v: '12 000' },
    { дата: '24.02.2024', v: '13 000' },
    { дата: '07.10.2024', v: '14 000' },
    { дата: '21.05.2025', v: '16 000' },
    { дата: '26.09.2026', v: '1-й ранг' },
  ],
  соцсети: [
    { id: 'tg', имя: 'Telegram', ник: 'девятыйкласс', цифра: '13,3 тыс.', подпись: 'подписчиков', url: 'https://t.me/nineclassdota' },
    { id: 'tw', имя: 'Twitch', ник: 'twitch.tv/9class', цифра: '1 203', подпись: 'зрителей в среднем', url: 'https://www.twitch.tv/9class' },
    { id: 'ig', имя: 'Instagram', ник: '9class_ed', цифра: '', подпись: 'фото с турниров', url: 'https://www.instagram.com/9class_ed' },
    { id: 'vk', имя: 'VK', ник: 'id582302782', цифра: '', подпись: 'страница', url: 'https://vk.com/id582302782' },
  ],
}

// Путь: команды с датами (Liquipedia)
const ПУТЬ = [
  { с: '2020', по: '2022', команда: 'Паблик и миксы', лого: '', мон: '9', что: 'Moscow Esports 2020 (CSB), открытые квалификации. 16 000 пабликов впереди' },
  { с: '12.2022', по: '12.2022', команда: 'Winter Bear', лого: '', мон: 'WB', что: 'Квалификации DPC EEU 2023 Tour 1' },
  { с: '01.2023', по: '11.2023', команда: 'Team Sexy', лого: '', мон: 'SX', что: 'Второй дивизион DPC: 3-е и 2-е место. European Pro League S10 и S11 — победы' },
  { с: '01.2024', по: '10.2024', команда: 'Tundra Esports', лого: 'tun', мон: 'TUN', что: 'Первый Tier 1: 3-е место ESL One Birmingham, 4-е Riyadh Masters' },
  { с: '10.2024', по: 'сейчас', команда: 'PARIVISION', лого: 'pv', мон: 'PV', что: '5 титулов Tier 1, 3-е место TI 2025, 2-е место TI 2026' },
]

// Главные места (Liquipedia /Results). Приз — на всю команду.
const ТРОФЕИ = [
  { дата: '23.08.2026', место: 2, турнир: 'The International 2026', финал: '2:3 Team Spirit', соперник: 'ts', приз: '$507 800' },
  { дата: '19.07.2026', место: 1, турнир: 'Esports World Cup 2026', финал: '3:1 BetBoom', соперник: 'bb', приз: '$750 000', заметка: 'в день рождения' },
  { дата: '24.05.2026', место: 1, турнир: 'DreamLeague S29', финал: '3:2 Aurora', соперник: 'aur', приз: '$290 000' },
  { дата: '14.09.2025', место: 3, турнир: 'The International 2025', финал: '1:2 Xtreme Gaming', соперник: '', приз: '$259 319' },
  { дата: '01.06.2025', место: 1, турнир: 'DreamLeague S26', финал: '3:0 BetBoom', соперник: 'bb', приз: '$290 000' },
  { дата: '13.04.2025', место: 1, турнир: 'ESL One Raleigh 2025', финал: '3:1 Team Spirit', соперник: 'ts', приз: '$290 000' },
  { дата: '15.12.2024', место: 1, турнир: 'ESL One Bangkok 2024', финал: '3:1 Liquid', соперник: 'tl', приз: '$300 000' },
]

// Герои в профматчах (OpenDota, с 19.12.2022)
const ГЕРОИ = [
  { id: 'rubick', имя: 'Rubick', м: 95, в: 64, kda: '2,8 / 5,5 / 15,2' },
  { id: 'dark_willow', имя: 'Dark Willow', м: 73, в: 49, kda: '3,8 / 6,2 / 12,6' },
  { id: 'monkey_king', имя: 'Monkey King', м: 72, в: 47, kda: '3,5 / 6,6 / 14,8' },
  { id: 'techies', имя: 'Techies', м: 69, в: 45, kda: '4,8 / 7,5 / 14,3' },
  { id: 'batrider', имя: 'Batrider', м: 65, в: 45, kda: '3,8 / 6,0 / 15,2' },
  { id: 'keeper_of_the_light', имя: 'Keeper of the Light', м: 55, в: 40, kda: '1,8 / 3,9 / 13,4' },
]

// Последние профматчи (OpenDota, 2026). w — победа
const МАТЧИ = [
  { д: '29.09', лига: 'BLAST SLAM VIII', герой: 'rubick', k: 2, d: 2, a: 9, gpm: 262, w: 1 },
  { д: '29.09', лига: 'BLAST SLAM VIII', герой: 'dark_willow', k: 3, d: 8, a: 12, gpm: 313, w: 1 },
  { д: '23.08', лига: 'TI 2026 · финал, карта 5', герой: 'rubick', k: 2, d: 11, a: 23, gpm: 285, w: 0 },
  { д: '23.08', лига: 'TI 2026 · финал, карта 4', герой: 'keeper_of_the_light', k: 3, d: 4, a: 20, gpm: 461, w: 1 },
  { д: '23.08', лига: 'TI 2026 · финал, карта 3', герой: 'marci', k: 2, d: 8, a: 11, gpm: 277, w: 0 },
  { д: '23.08', лига: 'TI 2026 · финал, карта 2', герой: 'rubick', k: 0, d: 13, a: 38, gpm: 338, w: 1 },
  { д: '23.08', лига: 'TI 2026 · финал, карта 1', герой: 'hoodwink', k: 5, d: 14, a: 8, gpm: 300, w: 0 },
  { д: '22.08', лига: 'TI 2026 · верхняя сетка', герой: 'dark_willow', k: 8, d: 6, a: 16, gpm: 381, w: 1 },
  { д: '22.08', лига: 'TI 2026 · верхняя сетка', герой: 'dark_willow', k: 3, d: 6, a: 6, gpm: 301, w: 0 },
  { д: '22.08', лига: 'TI 2026 · верхняя сетка', герой: 'keeper_of_the_light', k: 7, d: 0, a: 20, gpm: 561, w: 1 },
]

// Видео (YouTube, канал dota2 и влоги команды)
const ВИДЕО = [
  { id: 'o3W28o7jLYo', имя: 'Гранд-финал TI 2026, карта 5 — Team Spirit', где: 'dota2 · 23.08.2026', длит: '' },
  { id: 'q3bzGpyETVE', имя: 'Гранд-финал TI 2026, карта 1 — Team Spirit', где: 'dota2 · 23.08.2026', длит: '' },
  { id: 'WEj83vr1Plo', имя: 'Влог: чемпионы Esports World Cup 2026', где: 'PARIVISION · 07.2026', длит: '' },
  { id: 'y7wWO2FMlUo', имя: 'Финал верхней сетки TI 2026 — Team Yandex', где: 'dota2 · 22.08.2026', длит: '' },
  { id: '6ENUP6u_dMc', имя: 'Влог: чемпионы DreamLeague S29', где: 'PARIVISION · 05.2026', длит: '' },
  { id: 'gqFnmILXoO4', имя: 'MIND GAMES: Satanic, No[o]ne, 9Class, Dukalis', где: 'PARIVISION · 02.2026', длит: '' },
  { id: '8QM6rCySGME', имя: 'Why 9class is JUST BETTER!', где: 'Tundra · 04.2024', длит: '' },
  { id: 'vO88az2muJM', имя: 'Storytime с Topson', где: '02.2024', длит: '' },
]

// Факты и цитаты (с источниками — в 9class-данные.md §7)
const ФАКТЫ = [
  { big: '9 класс', t: 'Ник остался со школы: думал, что с высоким рейтингом и таким ником возьмут в академию' },
  { big: '19.07', t: 'Выиграл Esports World Cup 2026 в свой день рождения — финал 3:1 с BetBoom' },
  { big: '1400 dpi', t: '«Играл всю жизнь на 2000 dpi, поставил 1400 во время плей-офф — и выиграл турнир»' },
  { big: '16 000', t: 'MMR в мае 2025 — один из немногих саппортов, кто взял 16k' },
  { big: '955', t: 'Игр на Pudge в пабликах. Puppey: «лучший игрок на Пудже в мире»' },
  { big: '0 / 13 / 38', t: 'Rubick во второй карте финала TI 2026 — 38 ассистов и победа' },
]

const ЦИТАТЫ = {
  ник: '«Девятый класс. В школе ещё поставил такой ник. У меня был высокий рейтинг, и я подумал: может, возьмут в какую-нибудь академку. Меня звали, но я решил пойти учиться, а ник остался»',
  универ: '«Я за этот год очень много поменял в жизни: ушёл из университета, решил попробовать себя в про-доте»',
  цель2023: '«Хочу просто попасть на топ-турнир уровня мейджора»',
  techies: '«Старый Techies давал этой игре эмоции. Сейчас в Dota 2 такого осталось мало»',
  др: '«Круто, что выиграли чемпионат мира в Париже на др — будет что вспомнить!»',
  эра: '«В новом сезоне моя цель — победа на каждом турнире. Для меня важен не столько инт, сколько тотальная доминация. Хочу начать новую эру»',
}

// Сейчас: идёт BLAST SLAM VIII
const СЕЙЧАС = { турнир: 'BLAST SLAM VIII', было: '29.09 · 2:0 LVLUP', далее: '30.09 · PARIVISION — LGD', за: 'первое место в группе A' }

const СОСТАВ = [
  { ник: 'Satanic', поз: 1 }, { ник: 'No[o]ne', поз: 2 }, { ник: 'Dukalis', поз: 3 }, { ник: '9Class', поз: 4, я: 1 }, { ник: 'Noticed', поз: 5 },
]

// ——— Разметка ———
const МЕСТНЫЕ_ГЕРОИ = ['rubick', 'hoodwink', 'tusk', 'beastmaster', 'faceless_void', 'lycan', 'mars', 'morphling', 'terrorblade']
const героиИмя = Object.fromEntries([...ГЕРОИ, { id: 'marci', имя: 'Marci' }, { id: 'hoodwink', имя: 'Hoodwink' }].map((h) => [h.id, h.имя]))
const героиКартинка = (id) => МЕСТНЫЕ_ГЕРОИ.includes(id) ? `/p-fw3k/site/img/heroes/${id}.webp` : `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${id}.png`
const превью = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
const винрейт = (h) => Math.round((h.в / h.м) * 100)
const лого = (k, мон = '') => k ? `<img class="pl-logo" src="/p-fw3k/site/img/teams/${k}.png" alt="" />` : `<span class="pl-logo pl-logo--mono">${мон}</span>`

// Полная карта — разметка компонента сайта (blocks/shared/card-full.html), данные 9Class
const картаИгрока = (w = 360) => `
<div class="player-card player-card--elite player-card--legend" data-tilt style="--w: ${w}px">
  <div class="player-card__in">
    <div class="player-card__body"></div>
    <div class="player-card__art">
      <i class="player-card__shine"></i>
      <i class="player-card__spark"><b></b><b></b><b></b><b></b><b></b><b></b></i>
      <span class="player-card__big">95</span>
      <img class="player-card__ph" src="${ИГРОК.фото}" alt="9Class" />
    </div>
    <img class="player-card__ph player-card__ph--pop" src="${ИГРОК.фото}" alt="" aria-hidden="true" />
    <i class="player-card__corner"></i><i class="player-card__corner"></i>
    <div class="player-card__strip"><small>#012 / 400</small><b class="player-card__nick">9Class</b><span class="player-card__ovr"><b>95</b><small>OVR</small></span></div>
    <div class="player-card__info">
      <div class="player-card__tags"><b class="player-card__rarity">Legend</b><span class="player-card__pips"><i></i><i></i><i></i><i></i></span><small class="player-card__src">из 200 профматчей 2026</small></div>
      <div class="player-card__team"><i class="player-card__flag player-card__flag--ru" aria-label="RU"></i><span>PARIVISION · <b>POS 4</b> · Support</span></div>
      <div class="player-card__heroes">
        <div class="player-card__hero"><img src="${героиКартинка('keeper_of_the_light')}" alt="" /><span><b>Keeper of the Light</b><small>33 матча · 73 % побед</small></span><em>+5%</em></div>
        <div class="player-card__hero"><img src="${героиКартинка('rubick')}" alt="" /><span><b>Rubick</b><small>26 матчей · 77 % побед</small></span><em>+12%</em></div>
        <div class="player-card__hero player-card__hero--best"><img src="${героиКартинка('dark_willow')}" alt="" /><span><b>Dark Willow</b><small>23 матча · 78 % побед</small></span><em>+25%</em></div>
      </div>
      <div class="player-card__stats">
        <span><b data-l="hi">82</b><small>FRM</small></span><span><b data-l="mid">60</b><small>FGT</small></span><span><b data-l="lo">47</b><small>POOL</small></span>
        <span><b data-l="hi">91</b><small>SUR</small></span><span><b data-l="lo">36</b><small>VIS</small></span><span><b data-l="mid">67</b><small>FORM</small></span>
      </div>
    </div>
    <i class="player-card__glare"></i>
  </div>
</div>`

// Шапка продукта — копия blocks/app/header.html (ссылки сайта в лабе не ведут)
const шапка = () => `
<header class="ui-header"><div class="ui-header__in">
  <div class="ui-header__top">
    <a class="ui-header__brand" href="#">Fantasy · Dota 2</a>
    <div class="btn-row ui-header__game" role="group" aria-label="Игра"><button class="btn btn--quiet btn--xs" type="button" aria-pressed="true">Dota</button><button class="btn btn--quiet btn--xs" type="button" aria-pressed="false">LoL</button></div>
    <div class="ui-header__coins"><span>Монеты</span><b>1 000</b></div>
  </div>
  <nav class="ui-tabs ui-header__nav" aria-label="Разделы">
    <a class="ui-tabs__a" href="#">Главная</a><a class="ui-tabs__a" href="#">Мои матчи</a><a class="ui-tabs__a" href="#">Сундуки</a><a class="ui-tabs__a" href="#" aria-current="page">Коллекция</a>
    <a class="ui-tabs__a" href="#">Квесты</a><a class="ui-tabs__a" href="#">Лидеры</a><a class="ui-tabs__a" href="#">История</a><a class="ui-tabs__a" href="#">Как это работает</a>
  </nav>
</div></header>`

const видеоПлитка = (v, cls = '') => `<a class="pl-vid ${cls}" href="https://youtu.be/${v.id}" target="_blank" rel="noopener"><span class="pl-vid__img"><img src="${превью(v.id)}" alt="" loading="lazy" /><i class="pl-vid__play"></i></span><b>${v.имя}</b><small>${v.где}</small></a>`

const соцПлитка = (s) => `<a class="pl-soc pl-soc--${s.id}" href="${s.url}" target="_blank" rel="noopener"><i class="pl-soc__ic">${{ tg: '✈', tw: '▶', ig: '◎', vk: 'в' }[s.id]}</i><span><b>${s.имя}</b><small>${s.ник}</small></span>${s.цифра ? `<em><b>${s.цифра}</b><small>${s.подпись}</small></em>` : `<em><small>${s.подпись}</small></em>`}</a>`

const матчСтрока = (m) => `<div class="pl-m${m.w ? ' is-w' : ''}"><img src="${героиКартинка(m.герой)}" alt="" /><span><b>${героиИмя[m.герой] || m.герой}</b><small>${m.лига}</small></span><span class="pl-m__kda">${m.k} / ${m.d} / ${m.a}</span><span class="pl-m__gpm">${m.gpm}<small> GPM</small></span><b class="pl-m__res">${m.w ? 'Победа' : 'Поражение'}</b><small class="pl-m__d">${m.д}</small></div>`

const геройСтрока = (h, max) => `<div class="pl-h"><img src="${героиКартинка(h.id)}" alt="" /><span><b>${h.имя}</b><small>${h.kda}</small></span><span class="pl-h__bar"><i style="--p: ${(h.м / max) * 100}%"></i></span><span class="pl-h__n">${h.м}<small> матчей</small></span><span class="pl-h__wr${винрейт(h) >= 67 ? ' is-hi' : ''}">${винрейт(h)} %</span></div>`

// Наклон и блик карты — кодом сайта
const подключитьНаклон = () => { const s = document.createElement('script'); s.src = '/p-fw3k/site/app.js'; document.body.append(s) }

// Переход «карточка → страница» (FLIP): карта стартует по центру экрана поверх затемнения и летит в свой слот на странице
function переход(слот, { задержка = 700, длит = 900, перед, после } = {}) {
  const карта = слот.querySelector('.player-card')
  const экран = document.createElement('div'); экран.className = 'pl-tr'; экран.innerHTML = '<p>Клик по карточке в коллекции…</p>'
  document.body.append(экран); document.body.classList.add('is-tr'); перед?.()
  const цель = слот.getBoundingClientRect()
  const k = Math.min(12, (innerHeight * 0.7) / цель.height)
  const dx = innerWidth / 2 - (цель.left + цель.width / 2), dy = innerHeight / 2 - (цель.top + цель.height / 2)
  карта.style.transition = 'none'; карта.style.transform = `translate(${dx}px, ${dy}px) scale(${k})`; карта.style.zIndex = 60; карта.style.position = 'relative'
  requestAnimationFrame(() => setTimeout(() => {
    экран.classList.add('is-go'); document.body.classList.remove('is-tr')
    карта.style.transition = `transform ${длит}ms cubic-bezier(.2,.8,.2,1)`; карта.style.transform = ''
    setTimeout(() => { экран.remove(); карта.style.cssText = карта.style.cssText.replace(/z-index[^;]*;|position[^;]*;|transition[^;]*;/g, ''); после?.() }, длит + 50)
  }, задержка))
}
