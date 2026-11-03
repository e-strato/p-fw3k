// Доска варианта виджета замен: живой виджет + сценарии + все состояния. Вызов: RBoard(номер варианта).
window.RBoard = v => {
  const st = { v, sc: 'both', open: null, live: true }
  const live = document.getElementById('live'), ctrl = document.getElementById('ctrl')
  const seg = (name, key, opts) => `<div class="lab-ctrl__g"><b>${name}</b><div class="w-seg">${opts.map(([k, t]) =>
    `<button data-k="${key}" data-v="${k}" class="${st[key] === k ? 'is-on' : ''}">${t}</button>`).join('')}</div></div>`
  const draw = () => {
    RW.render(live, Object.assign(st, { onchange: draw }))
    ctrl.innerHTML = seg('Сценарий', 'sc', [['calm', 'Без замен'], ['one', '1 замена'], ['heavy', '3 в одной команде'], ['both', '3 + 2'], ['out', 'Не вышел']])
      + `<p class="lab-ctrl__note">Кликни заменённого игрока — откроется карточка. У Shad и skiter данные есть, у Lumi их мало, Xen в базе не найден, у Stojkov ошибка загрузки (жми «Повторить»).</p>`
    ctrl.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { st[b.dataset.k] = b.dataset.v; st.open = null; st.tab = null; st.full = false; draw() })
  }
  draw()
  const cells = [
    ['Без замен', { sc: 'calm' }], ['1 замена (на турнир)', { sc: 'one' }], ['3 замены в одной команде', { sc: 'heavy' }],
    ['Обе команды: 2 + 3', { sc: 'both' }], ['Игрок не вышел, замена неизвестна', { sc: 'out' }],
    ['Карточка · найден, данные есть', { sc: 'both', open: 'shad' }], ['Карточка · найден, данных мало', { sc: 'both', open: 'lumi' }],
    ['Карточка · не найден в базе', { sc: 'both', open: 'xen' }], ['Карточка · ошибка загрузки', { sc: 'both', open: 'stojkov' }],
  ]
  document.getElementById('grid').innerHTML = cells.map((c, i) => `<div><div class="lab-cell__t">${c[0]}</div><div id="c${i}"></div></div>`).join('')
  cells.forEach((c, i) => RW.render(document.getElementById('c' + i), Object.assign({ v }, c[1])))
}
