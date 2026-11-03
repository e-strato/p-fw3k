// Варианты v10–v12: на странице только виджет, управление — в оболочке лабы (sandbox-project/lab.tsx).
// Страница отдаёт оболочке window.LAB: view — какую панель рисовать ('flows' список слева · 'toolbar' переключатель в шапке · 'steps' шаги под кадром);
// flows() / go(f, i) — экраны; axes() / set(key, v) — тот же выбор одной осью; caption() — зачем открытый экран.
// data-switch у страницы — свитч «Подсказки»: toggles() / toggle(key) и legend() — что значит каждый цвет; подсказок нет — свитч выключен и недоступен.
// Экраны — три главных из _states.js, мелочи — кликом по виджету. Подсказки свои у каждой: рука-курсор · виджет сам показывает · окно «Дальше».
(() => {
  const w = document.getElementById('w'), view = document.body.dataset.view, hint = document.body.dataset.hint || { flows: 'hand', toolbar: 'demo', steps: 'coach' }[view] // data-hint — свой вид подсказки у страницы
  let cur = { f: 0, i: 0 }, on = true
  const sw = 'switch' in document.body.dataset, has = () => S.key[cur.i].hints.length > 0
  const flows = () => [{ name: 'Главные экраны', steps: S.key.map(k => ({ name: k.name, what: k.why })) }]
  const go = (f, i) => { cur = { f, i }; S.mount(w, S.key[i], { hint: sw && !(on && has()) ? 'none' : hint }) }
  const axes = () => [{ key: 'screen', name: 'Экран', value: S.key[cur.i].id, options: S.key.map(k => ({ v: k.id, label: k.name })) }]
  const set = (k, v) => go(0, S.key.findIndex(x => x.id === v))
  const caption = () => S.key[cur.i].why
  const toggles = () => sw ? [{ key: 'hints', name: document.body.dataset.switch || 'Подсказки', value: on && has(), off: !has() }] : [] // data-switch — имя свитча
  const toggle = () => { on = !on; go(cur.f, cur.i) }
  const legend = () => sw && on && has() ? S.legend(w, S.key[cur.i]) : []
  window.LAB = { view, flows, go, axes, set, caption, toggles, toggle, legend, cur: () => cur }
  go(0, 0)
})()
