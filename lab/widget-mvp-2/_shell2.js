// Подача v13 (решение 26): на странице только виджет, «Экран» — под кадром лабы (window.LAB для sandbox-project/lab.tsx).
// Экраны: на главной (виды — турнир · неделя · месяц), в матче (матч · турнир · неделя), в фэнтези — игрок уже в составе.
(() => {
  const w = document.getElementById('w'), style = (window.MVP2_OPT || {}).style
  const key = [
    { id: 'home', name: 'На главной', why: 'Главная Dota 2: MVP турнира первым (21.10: «скорее турнира»), дальше недели и месяца', o: {} },
    { id: 'match', name: 'В матче', why: 'Открыт матч Team Spirit — Team Liquid: первым MVP матча — лучший из двух команд, дальше турнир и неделя', o: { match: { a: 'Team Spirit', b: 'Team Liquid' } } },
    { id: 'mine', name: 'В фэнтези', why: 'Человек уже в фэнтези и MVP у него в составе — вместо «Взять» отметка «В твоём составе»', o: { mine: true } },
  ]
  let cur = { f: 0, i: 0 }
  const go = (f, i) => { cur = { f, i }; (['stage', 'ribbon', 'faces', 'side', 'auto'].includes(style) || (window.MVP2_OPT || {}).glitch ? window.MVP15 : ['strip', 'list', 'rise', 'ring'].includes(style) ? window.MVP10 : window.MVP7 || window.MVP5 || MVP2).render(w, { ...key[i].o, opt: { ...window.MVP2_OPT } }) } // v5–v6 — _hg.js, v7–v9 — _mvp7.js
  window.LAB = {
    view: 'toolbar', go, cur: () => cur,
    flows: () => [{ name: 'Экраны', steps: key.map(k => ({ name: k.name, what: k.why })) }],
    axes: () => [{ key: 'screen', name: 'Экран', value: key[cur.i].id, options: key.map(k => ({ v: k.id, label: k.name })) }],
    set: (k, v) => go(0, key.findIndex(x => x.id === v)),
    caption: () => key[cur.i].why,
  }
  go(0, 0)
})()
