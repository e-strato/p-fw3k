// Виджет турнира (widget-tournament-6 v11) на странице турнира, v5: PARI Universe — групповой этап из Liquipedia API (28.10), идёт плей-офф.
// В данных виджета PARI Universe ещё «скоро» (на 21.10) — здесь дописываем группы; Astra Invicta — лого из ../widget-participants/img/ (Claude-B).
(() => {
  const D = window.T4_DATA, t = D.tours.find(x => x.id === 'pari-universe')
  Object.assign(t, { st: 'live', fmt: 'groups', stage: 'Плей-офф · день 1',
    groups: { A: [['Team Yandex', 4, 0], ['GamerLegion', 3, 1], ['OG', 2, 2], ['Team Liquid', 1, 3], ['1w Team', 0, 4]],
      B: [['Team Spirit', 4, 0], ['PARIVISION', 3, 1], ['LEGION', 1, 3], ['Astra Invicta', 1, 3], ['BetBoom Team', 1, 3]] },
    zones: { up: [1, 2, 3, 4], down: [5] } })
  D.teams['Astra Invicta'] = { logo: '../widget-participants/img/team-astrainvicta.png' }
  // Опции — как на «Все виджеты» (v11)
  window.TN_TOUR = el => window.T4.render(el, { init: { tid: 'pari-universe' }, opt: { v3: true, tier: 'fill', tierEn: true, final: 'merge', dt: 'mono' } })
})()
