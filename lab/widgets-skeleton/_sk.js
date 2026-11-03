// Вставляет итоговые виджеты в скелетон: турнира v26 (решение 27) в [data-tw], замен v17 (решение 28) в [data-rw], трансферов v12 в [data-trw], MVP v28 в [data-mvw]
// Логотипы виджета турнира лежат в widget-tournament-4/logos — пути в данных относительные, поправляем под эту страницу
;(() => { const D = window.T4_DATA, fix = o => { if (o && o.logo && !/^(\.\.|\/|https?:)/.test(o.logo)) o.logo = '../widget-tournament-4/' + o.logo }
  fix(D.game); Object.values(D.teams).forEach(fix); D.tours.forEach(fix) })()
// Страница матча: открыт матч SEA — виджет сам открывает его турнир, подсвечивает обе команды, внизу — плашка этого матча
document.querySelectorAll('[data-tw]').forEach(el => T4.render(el, { match: { a: 'Team Nemesis Academy', b: 'Cloud Dawning' },
  opt: { mark: 'bg', home: 'top', now: 'dock', hl: 'dim', bracket: 'path', air: true, dockMatch: true, dockStyle: 'match', allStyle: 'tabs', switch: 'vclock', fx: 'slide', fxv: 'tslide' } }))
// Замены — в матче: только замены открытого матча (Nemesis Academy — Cloud Dawning)
document.querySelectorAll('[data-rw]').forEach(el => S5.render(el, { match: { a: 'Team Nemesis Academy', b: 'Cloud Dawning', when: 'live' }, look: 'mix', v14: true, v15: true, v16: true, v17: true }))
// Трансферы v12 (дирижёр 21.10): пути к лого и аватарам — из widget-transfers. У команд матча SEA переходов нет — показываем все переходы Dota 2
;(() => { const D = window.TR_DATA, fix = (o, k) => { if (o && o[k] && !/^(\.\.|\/|https?:)/.test(o[k])) o[k] = '../widget-transfers/' + o[k] }
  fix(D.game, 'logo'); D.games.forEach(g => fix(g, 'logo')); Object.values(D.teams).forEach(t => fix(t, 'logo')); D.list.forEach(p => fix(p, 'photo')) })()
document.querySelectorAll('[data-trw]').forEach(el => TR.render(el, { opt: { style: 'tableflat', game: 'dota2' } }))
// MVP v28 (дирижёр 21.10): пути к лого, аватарам и героям — из widget-mvp. У команд матча SEA игроков в рейтинге нет — показываем MVP недели Dota 2
;(() => { const D = window.MVP_DATA, fix = (o, k) => { if (o && o[k] && !/^(\.\.|\/|https?:)/.test(o[k])) o[k] = '../widget-mvp/' + o[k] }
  D.games.forEach(g => fix(g, 'logo')); Object.keys(D.teams).forEach(k => { if (!/^(\.\.|\/)/.test(D.teams[k])) D.teams[k] = '../widget-mvp/' + D.teams[k] }); D.list.forEach(p => { fix(p, 'photo'); fix(p, 'hero') }) })()
document.querySelectorAll('[data-mvw]').forEach(el => MVP.render(el, { opt: { style: 'stairs', dock: 'minebanner', nofan: 'banner', v: 'v24', podTeam: 'badge', rowBadge: true, game: 'dota2' } }))
