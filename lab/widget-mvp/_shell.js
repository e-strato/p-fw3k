// Подача v13 (решение 26): на странице только виджет, «Экран» — под кадром лабы (window.LAB для sandbox-project/lab.tsx).
// Экраны: на главной — человек не в фэнтези / в фэнтези (дирижёр 21.10: «подвигнуть»), в матче (О.16). Клик по строке — страница игрока.
(() => {
  const w = document.getElementById('w')
  // Матч — Team Spirit — Team Liquid (пример: у обеих команд есть игроки в топе)
  const key = [
    { id: 'nofan', name: 'Не в фэнтези', why: 'Человек ещё не играет в фэнтези — плашка внизу зовёт попробовать', o: { nofan: true } },
    { id: 'home', name: 'В фэнтези', why: 'Человек уже в фэнтези — внизу его игроки и их места в рейтинге', o: {} },
    { id: 'match', name: 'В матче', why: 'Открыт матч — игра матча выбрана сама, в списке только игроки двух его команд', o: { match: { a: 'Team Spirit', b: 'Team Liquid' } } },
    { id: 'team', name: 'У команды', why: 'Открыта команда — заголовок «MVP · Team Spirit», вся её пятёрка простым списком, без пьедестала (игроков меньше 7)', o: { team: 'Team Spirit' } },
  ]
  let cur = { f: 0, i: 0 }
  const go = (f, i) => { cur = { f, i }; w.st = null; delete w.dataset.opened; MVP.render(w, { ...key[i].o, opt: window.MVP_OPT }) }
  window.LAB = {
    view: 'toolbar', go, cur: () => cur,
    flows: () => [{ name: 'Экраны', steps: key.map(k => ({ name: k.name, what: k.why })) }],
    axes: () => [{ key: 'screen', name: 'Экран', value: key[cur.i].id, options: key.map(k => ({ v: k.id, label: k.name })) }],
    set: (k, v) => go(0, key.findIndex(x => x.id === v)),
    caption: () => key[cur.i].why,
  }
  go(0, 0)
})()
