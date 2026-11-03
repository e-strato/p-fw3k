// Данные и логотипы — из widget-tournament-4 (_data.js там). Пути логотипов в данных относительные — переводим на ту папку.
(() => { const D = window.T4_DATA, at = p => p && !p.startsWith('../') ? '../widget-tournament-4/' + p : p
  D.game.logo = at(D.game.logo)
  Object.values(D.teams).forEach(t => { t.logo = at(t.logo) })
  D.tours.forEach(t => { t.logo = at(t.logo) })
})()
