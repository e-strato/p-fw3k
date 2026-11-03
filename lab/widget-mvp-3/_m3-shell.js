// Подача лабы MVP-3 (как v13, решение 26): на странице только виджет, под кадром — «Экран» и «Зритель» (window.LAB для sandbox-project/lab.tsx).
// Экраны — как у MVP в «Все виджеты» (_all.js): главная · матч Team Spirit — Team Liquid; зритель — не в фэнтези · в фэнтези.
// Чем рисовать — window.M3_DRAW(узел, { match, mine }) задаёт страница: v1 — MVP15 (v18), v5 — MVPC (_m5.js).
(() => {
  const w = document.getElementById('w')
  const SCR = [
    { id: 'home', name: 'На главной', o: {}, why: 'Главная Dota 2' },
    { id: 'match', name: 'В матче', o: { match: { a: 'Team Spirit', b: 'Team Liquid' } }, why: 'Открыт матч Team Spirit — Team Liquid' },
  ]
  const FAN = [
    { id: 'no', name: 'Не в фэнтези', why: 'человек не в фэнтези — зовём собрать состав' },
    { id: 'yes', name: 'В фэнтези', why: 'человек в фэнтези, Malr1ne и Yatoro у него в составе (пример)' },
  ]
  const steps = SCR.flatMap(s => FAN.map(f => ({ s, f })))
  let cur = { s: 0, f: 0 }
  const draw = () => window.M3_DRAW(w, { ...SCR[cur.s].o, mine: FAN[cur.f].id === 'yes' })
  const go = (fl, i) => { cur = { s: SCR.indexOf(steps[i].s), f: FAN.indexOf(steps[i].f) }; draw() }
  window.LAB = {
    view: 'toolbar', go, cur: () => ({ f: 0, i: cur.s * FAN.length + cur.f }),
    flows: () => [{ name: 'Экраны', steps: steps.map(x => ({ name: `${x.s.name} · ${x.f.name}`, what: `${x.s.why}, ${x.f.why}` })) }],
    axes: () => [
      { key: 'screen', name: 'Экран', value: SCR[cur.s].id, options: SCR.map(x => ({ v: x.id, label: x.name })) },
      { key: 'fan', name: 'Зритель', value: FAN[cur.f].id, options: FAN.map(x => ({ v: x.id, label: x.name })) },
    ],
    set: (k, v) => { if (k === 'screen') cur.s = SCR.findIndex(x => x.id === v); else cur.f = FAN.findIndex(x => x.id === v); draw() },
    caption: () => `${SCR[cur.s].why}, ${FAN[cur.f].why}`,
  }
  draw()
})()
