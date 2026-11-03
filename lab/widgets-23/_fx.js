/* Эффекты тем (скан, мигание LIVE, глитч MVP) — только по наведению: один проход, не чаще раза в минуту на виджет.
   CSS запускает анимации, пока у .w есть класс fx-on; замены (.s3) — без эффектов. */
(() => {
  const GAP = 60000, DUR = 2200            // пауза между запусками и длительность самого долгого эффекта (скан 2 с)
  const last = new WeakMap()               // виджет → время прошлого запуска
  const calm = matchMedia('(prefers-reduced-motion: reduce)')
  document.addEventListener('pointerover', e => {
    const w = e.target.closest?.('.w')
    if (!w || w.classList.contains('s3') || w.contains(e.relatedTarget)) return   // не виджет, замены или движение внутри виджета
    if (calm.matches || Date.now() - (last.get(w) || -GAP) < GAP) return
    last.set(w, Date.now())
    w.classList.add('fx-on')
    setTimeout(() => w.classList.remove('fx-on'), DUR)
  })
})()
