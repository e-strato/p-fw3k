// Лаба «Главная — десктоп»: общее для вариантов «Неделя» (v3, v5, v6) — дни недели с матчами, постер матча, состояние на углу.
// Вынесено из v3 без изменений; добавлены класс и размер логотипов постера (для компактных постеров v5/v6)
// и второй цвет для светлых команд (цветП), чтобы постеры Spirit, G2, NRG, EDG не выходили серыми.
(() => {
const { ВСЕ, ЭФИР, ИГРЫ, время, доСтарта, имя, цвет, лого, тег } = H
const ВТОРОЙ = { ts: 'var(--h-poster-ts)', g2: 'var(--h-poster-g2)', nrg: 'var(--h-poster-nrg)', edg: 'var(--h-poster-edg)' }
const цветП = id => ВТОРОЙ[id] || цвет(id)
const ДЛИНА = { Bo1: 60, Bo2: 120, Bo3: 150, Bo5: 240 }
// Сегодня — главные матчи из данных лабы; остальные дни — короткий набор главных матчей, чтобы полоса дней была живой
const выкл_ = m => m.st === 'moved' || m.st === 'cancel'
const сегодня = [...ВСЕ].sort((a, b) => выкл_(a) - выкл_(b) || a.t - b.t)
const мк = (g, a, b, t, st, tur, стадия, extra = {}) => Object.assign({ g, a, b, t, st, тур: tur, стадия, bo: 'Bo3', id: a + '-' + b + t }, extra)
const ДНИ = [
  { d: 'Пн', n: 5, k: 31, past: true, м: [
    мк('dota', 'flc', 'aur', 13 * 60, 'done', 'BLAST Slam VIII', 'Четвертьфинал', { sa: 2, sb: 1 }), мк('cs', 'vit', 'g2', 15 * 60, 'done', 'ESL Pro League S24', 'Группа C', { sa: 2, sb: 0 }),
    мк('lol', 'gen', 'fnc', 17 * 60, 'done', 'Worlds 2026', 'Раунд 2', { sa: 1, sb: 0, bo: 'Bo1' }), мк('val', 'sen', 'loud', 19 * 60, 'done', 'VCT Champions 2026', 'Верхняя сетка', { sa: 1, sb: 2 }),
    мк('mlbb', 'rrq', 'evos', 20 * 60, 'done', 'MPL Indonesia S18', 'Неделя 7', { sa: 2, sb: 0 })] },
  { d: 'Вт', n: 6, k: 38, today: true, м: сегодня },
  { d: 'Ср', n: 7, k: 26, м: [мк('dota', 'ts', 'flc', 14 * 60, 'soon', 'BLAST Slam VIII', 'Финал верхней', { если: 'если Spirit пройдут Tundra' }), мк('cs', 'vit', 'navi', 16 * 60 + 30, 'soon', 'ESL Pro League S24', 'Группа C'),
    мк('lol', 't1', 'blg', 18 * 60, 'soon', 'Worlds 2026', 'Раунд 4', { bo: 'Bo3' }), мк('mlbb', 'onic', 'rrq', 20 * 60, 'soon', 'MPL Indonesia S18', 'Неделя 7')] },
  { d: 'Чт', n: 8, k: 24, м: [мк('val', 'nrg', 'edg', 12 * 60, 'soon', 'VCT Champions 2026', 'Нижняя сетка', { перенос: true }), мк('dota', 'tl', 'gg', 15 * 60, 'soon', 'BLAST Slam VIII', 'Нижняя сетка'), мк('cs', 'faze', 'mouz', 18 * 60, 'soon', 'ESL Pro League S24', 'Группа C')] },
  { d: 'Пт', n: 9, k: 19, м: [мк('dota', 'aur', 'pv', 15 * 60, 'soon', 'BLAST Slam VIII', 'Нижняя сетка'), мк('lol', 'gen', 't1', 19 * 60, 'soon', 'Worlds 2026', 'Раунд 5', { bo: 'Bo3' })] },
  { d: 'Сб', n: 10, k: 30, м: [мк('dota', 'ts', 'tl', 14 * 60, 'soon', 'BLAST Slam VIII', 'Финал нижней', { если: 'пары определятся в пятницу' }), мк('val', 'prx', 'sen', 17 * 60, 'soon', 'VCT Champions 2026', 'Финал нижней', { bo: 'Bo5' })] },
  { d: 'Вс', n: 11, k: 12, м: [мк('dota', 'ts', 'flc', 16 * 60, 'soon', 'BLAST Slam VIII', 'Гранд-финал', { bo: 'Bo5', если: 'пары определятся в субботу' })] },
]
const ИГРЫ_ДНЯ = d => { const c = {}; d.м.forEach(m => c[m.g] = (c[m.g] || 0) + 1); return c }

const состояние = (m, d) => {
  if (ЭФИР.includes(m.st)) return `<span class="w-st is-live"><i class="h-dot" style="background:var(--c-white)"></i>${m.st === 'draft' ? 'Драфт' : m.st === 'pause' ? 'Пауза' : m.st === 'break' ? 'Перерыв' : 'В эфире · карта ' + m.карта}</span>`
  if (m.st === 'done') return `<span class="w-st is-done">Итог</span>`
  if (m.st === 'moved' || m.st === 'cancel' || m.перенос) return ''
  if (d.today) return `<span class="w-st" data-tick="${m.t}">${доСтарта(m.t).txt}</span>`
  return `<span class="w-st">${d.n} окт</span>`
}
const постер = (m, d, cls = '', размер = 150) => {
  const выкл = m.st === 'moved' || m.st === 'cancel' || m.перенос, эф = ЭФИР.includes(m.st)
  const конец = m.t + (ДЛИНА[m.bo] || 150)
  const окно = m.st === 'delay' ? `<s style="opacity:.6">${m.было}</s> ${время(m.t)} – ${время(конец)}` : `${время(m.t)} – ${время(конец)}`
  const центр = выкл
    ? `<div class="w-lock"><i>${m.st === 'cancel' ? '✕' : '↷'}</i><span>${m.st === 'cancel' ? 'Отменён: Alter Ego снялись с сезона' : m.st === 'moved' ? 'Перенесён на 8 окт, 12:00 — у EDG задержали визы' : 'Перенесён сюда со вторника'}</span></div>`
    : (эф || m.st === 'done') && m.sa != null ? `<span class="w-score">${m.sa} : ${m.sb}</span>` : ''
  const низ = m.мой ? `<span class="w-p__mine">В матче ${m.мой} твоих игрока</span>` : m.если ? `<span>${m.если}</span>` : m.st === 'delay' ? `<span style="color:var(--c-stat-mid)">Задержан на 50 минут</span>` : ''
  return `<a class="w-p ${cls} ${выкл ? 'is-off' : ''}" data-id="${m.id}" href="#" style="--ca:${цветП(m.a)}; --cb:${цветП(m.b)}">
    <div class="w-p__top">${тег(m.g)}<span class="w-tour">${m.тур}</span>${состояние(m, d)}</div>
    <div class="w-logos">${лого(m.a, размер)}${лого(m.b, размер)}</div>${центр}
    <div class="w-p__bot"><p class="w-win">${окно}</p>
      <h3>${имя(m.a)} <span>—</span> ${имя(m.b)}</h3>
      <p class="w-p__meta"><b>${m.bo}</b><span>${m.стадия}</span>${низ}</p></div></a>`
}

const ДНИ_НЕД = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье']
// Главный матч дня: в эфире с пометкой «главный» → любой в эфире → ближайший → первый
const главный = список => список.find(m => m.главный && ЭФИР.includes(m.st)) || список.find(m => ЭФИР.includes(m.st)) || список.find(m => ['soon', 'delay'].includes(m.st)) || список[0]
window.W = { ДЛИНА, ДНИ, ДНИ_НЕД, ИГРЫ_ДНЯ, сегодня, состояние, постер, цветП, главный }
})()
