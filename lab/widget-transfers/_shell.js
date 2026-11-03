// Подача v13 (решение 26): на странице только виджет, «Экран» — под кадром лабы (window.LAB для sandbox-project/lab.tsx).
// Экраны — два состояния виджета (О.16): на главной и в матче; карточка игрока — кликом по строке.
(() => {
  const w = document.getElementById('w')
  // Матч — тот же, что в лабе виджета турнира (widget-tournament-4): идёт 21.10 в EPL Masters III
  const key = [
    { id: 'home', name: 'На главной', why: 'Ничего не выбрано — переходы тир-1 и тир-2 всех игр; сверху — игра и период; нажми на игрока — карточка', o: {} },
    { id: 'match', name: 'В матче', why: 'Открыт матч — игра матча выбрана сама, в списке только две его команды', o: { match: { a: 'Inner Circle x Insanity', b: 'Power Rangers' } } },
  ]
  let cur = { f: 0, i: 0 }
  const go = (f, i) => { cur = { f, i }; w.st = null; delete w.dataset.opened; TR.render(w, { ...key[i].o, opt: window.TR_OPT }) }
  window.LAB = {
    view: 'toolbar', go, cur: () => cur,
    flows: () => [{ name: 'Экраны', steps: key.map(k => ({ name: k.name, what: k.why })) }],
    axes: () => [{ key: 'screen', name: 'Экран', value: key[cur.i].id, options: key.map(k => ({ v: k.id, label: k.name })) }],
    set: (k, v) => go(0, key.findIndex(x => x.id === v)),
    caption: () => key[cur.i].why,
  }
  go(0, 0)
})()
