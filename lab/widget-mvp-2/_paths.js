// Данные и картинки — из widget-mvp (_data.js там). Пути в данных относительные — переводим на ту папку.
(() => { const D = window.MVP_DATA, at = p => p && !/^(\.\.\/|\/|https?:)/.test(p) ? '../widget-mvp/' + p : p
  D.games.forEach(g => { g.logo = at(g.logo) })
  Object.keys(D.teams).forEach(k => { D.teams[k] = at(D.teams[k]) })
  D.list.forEach(p => { p.photo = at(p.photo); p.hero = at(p.hero) })
})()
// Лица — настоящие фото игроков (начальник: «брать лица людей»; дирижёр 22.10): faces/ — вырезанные портреты с dota2.ru. Нет фото — остаётся аватар Steam
;(() => { const F = ['33', 'ame', 'batyuk', 'davai', 'insania', 'larl', 'malr1ne', 'mira', 'nightfall', 'pure', 'quinn', 'rue', 'saksa', 'satanic', 'skiter', 'sumail', 'topson', 'wisper', 'wits', 'yatoro', 'yuma', 'yuragi']
  if (window.MVP_OLD_PHOTOS) return // v1 — как было
  window.MVP_DATA.list.forEach(p => { const n = p.nick.toLowerCase(); if (F.includes(n)) p.photo = `${window.MVP2_BASE || ''}faces/${n}.webp` }) })() // MVP2_BASE — путь к этой папке со страницы вне её (Все виджеты)
