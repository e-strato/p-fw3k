// Данные, логотипы и аватары — из widget-transfers (_data.js там). Пути в данных относительные — переводим на ту папку.
(() => { const D = window.TR_DATA, at = p => p && !p.startsWith('../') ? '../widget-transfers/' + p : p
  D.game.logo = at(D.game.logo)
  D.games.forEach(g => { g.logo = at(g.logo) })
  Object.values(D.teams).forEach(t => { t.logo = at(t.logo) })
  D.list.forEach(p => { p.photo = at(p.photo) })
})()
