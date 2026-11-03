// Подача как у ../widget-transfers-2/_shell.js (решение 26): только виджет, «Экран» — под кадром лабы. Рисует TR5 (_tr5.js).
// Экраны — два состояния (О.16) + пустое: на главной · в матче · в матче без переходов.
(() => {
  const w = document.getElementById('w')
  const key = [
    { id: 'home', name: 'На главной', why: 'Страница игры — все переходы Dota 2, свежие сверху; цены и фильтра игр нет', o: {} },
    { id: 'match', name: 'В матче', why: 'Открыт матч — только переходы двух его команд: Yuragi пришёл в Inner Circle x Insanity, TA2000 ушёл из Power Rangers', o: { match: { a: 'Inner Circle x Insanity', b: 'Power Rangers' } } },
    { id: 'empty', name: 'В матче · пусто', why: 'У команд матча переходов нет — пустое состояние, «Смотреть все» остаётся', o: { match: { a: 'Team Nemesis Academy', b: 'Cloud Dawning' } } },
  ]
  let cur = { f: 0, i: 0 }
  const go = (f, i) => { cur = { f, i }; TR5.render(w, key[i].o) }
  window.LAB = {
    view: 'toolbar', go, cur: () => cur,
    flows: () => [{ name: 'Экраны', steps: key.map(k => ({ name: k.name, what: k.why })) }],
    axes: () => [{ key: 'screen', name: 'Экран', value: key[cur.i].id, options: key.map(k => ({ v: k.id, label: k.name })) }],
    set: (k, v) => go(0, key.findIndex(x => x.id === v)),
    caption: () => key[cur.i].why,
  }
  go(0, 0)
})()
