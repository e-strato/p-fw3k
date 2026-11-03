// Главный постер на главной (дирижёр 07.10: перенос лабы home-desktop v6 «Главный постер»; блок blocks/app/home-poster.html,
// стили — styles.css [=== Постер главной ===]). Полоса 7 дней, широкий постер главного матча дня и три поменьше; клик по малому
// ставит матч главным, день и фильтр игр пересобирают набор. Данные условные, как в Match Center: вторник 6 октября, сейчас 15:35 —
// данные — week-data.js; «Все матчи дня» ведёт в Match Center на выбранный день (?day=). Часы идут от 15:35 плюс секунды с открытия, поэтому таймер ближайшего матча тикает и дробится («через 1 ч 25 мин» → «14:59»).
(() => {
  const root = document.querySelector('[data-hp]')
  if (!root) return

  const { ИГРЫ, К, ЭФИР, ДЛИНА, ДНИ } = window.НЕДЕЛЯ // данные — week-data.js
  const ДНИ_НЕД = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье']

  // Часы и таймер, который дробится по мере приближения
  const СТАРТ = 15 * 3600 + 35 * 60, t0 = Date.now()
  const сейчас = () => СТАРТ + Math.floor((Date.now() - t0) / 1000)
  const чч = n => String(n).padStart(2, '0')
  const время = мин => `${чч(Math.floor(мин / 60) % 24)}:${чч(мин % 60)}`
  const доСтарта = мин => {
    const s = мин * 60 - сейчас()
    if (s <= 0) return { txt: 'Начинается', short: '0:00' }
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60
    if (s >= 3600) return { txt: `Через ${h} ч ${m} мин`, short: `${h}:${чч(m)}:${чч(sec)}` }
    return { txt: `Через ${m} мин`, short: `${m}:${чч(sec)}` }
  }

  const имя = id => К[id][0]
  const цвет = id => К[id][3]
  const лого = (id, size) => {
    const t = К[id]
    return t[1]
      ? `<img class="hp-lg" style="--s:${size}px" src="img/teams/${t[1]}.png" alt="" />`
      : `<span class="hp-lg hp-lg--mono" style="--s:${size}px; --tc:${t[3]}">${t[2]}</span>`
  }
  const тег = g => `<span class="hp-gt hp-gt--${g}">${ИГРЫ[g]}</span>`
  const выкл = m => m.st === 'moved' || m.st === 'cancel'
  const скоро = m => m.st === 'soon' || m.st === 'delay'
  // Ссылка на страницу матча: у страницы есть только Dota и CS — остальные игры пока ведут на пример Dota
  const ссылка = m => `match-page.html?game=${m.g === 'cs' ? 'cs' : 'dota'}&state=${ЭФИР.includes(m.st) ? 'live' : m.st === 'done' ? 'done' : 'pre'}`

  const состояние = (m, d) => {
    if (ЭФИР.includes(m.st)) return `<span class="hp-st is-live"><i class="hp-dot"></i>${m.st === 'draft' ? 'Драфт' : m.st === 'pause' ? 'Пауза' : m.st === 'break' ? 'Перерыв' : 'В эфире · карта ' + m.карта}</span>`
    if (m.st === 'done') return '<span class="hp-st is-done">Итог</span>'
    if (выкл(m)) return ''
    if (d.today) return `<span class="hp-st" data-hp-tick="${m.t}">${доСтарта(m.t).txt}</span>`
    return `<span class="hp-st">${d.n} окт</span>`
  }
  // Постер: tag — a (малый, кликается) или div (главный: внутри кнопки-ссылки)
  const постер = (m, d, cls, размер, tag = 'a') => {
    const эф = ЭФИР.includes(m.st), конец = m.t + (ДЛИНА[m.bo] || 150)
    const окно = m.st === 'delay' ? `<s>${m.было}</s> ${время(m.t)} – ${время(конец)}` : `${время(m.t)} – ${время(конец)}`
    const центр = выкл(m)
      ? `<div class="hp-lock"><i>${m.st === 'cancel' ? '✕' : '↷'}</i><span>${m.заметка}</span></div>`
      : (эф || m.st === 'done') && m.sa != null ? `<span class="hp-score">${m.sa} : ${m.sb}</span>` : ''
    const низ = m.мой ? `<span class="hp-p__mine">В матче ${m.мой} твоих игрока</span>` : m.если ? `<span>${m.если}</span>` : m.st === 'delay' ? '<span class="hp-p__warn">Задержан на 50 минут</span>' : ''
    const href = tag === 'a' ? ` href="${ссылка(m)}"` : ''
    return `<${tag} class="hp-p ${cls} ${выкл(m) ? 'is-off' : ''}" data-id="${m.id}"${href} style="--ca:${цвет(m.a)}; --cb:${цвет(m.b)}">
      <div class="hp-p__top">${тег(m.g)}<span class="hp-tour">${m.тур}</span>${состояние(m, d)}</div>
      <div class="hp-logos">${лого(m.a, размер)}${лого(m.b, размер)}</div>${центр}
      <div class="hp-p__bot"><p class="hp-win">${окно}</p>
        <h3>${имя(m.a)} <span>—</span> ${имя(m.b)}</h3>
        <p class="hp-p__meta"><b>${m.bo}</b><span>${m.стадия}</span>${низ}</p>
        ${tag === 'div' ? '%ACTS%' : ''}</div></${tag}>`
  }
  // Главный матч дня: в эфире с пометкой «главный» → любой в эфире → ближайший → первый
  const главный = с => с.find(m => m.главный && ЭФИР.includes(m.st)) || с.find(m => ЭФИР.includes(m.st)) || с.find(скоро) || с[0]
  const вес = m => ЭФИР.includes(m.st) ? 0 : скоро(m) ? 1 : m.st === 'done' ? 2 : 3
  const играДня = d => { const c = {}; d.м.forEach(m => c[m.g] = (c[m.g] || 0) + 1); return c }

  const героем = (m, d) => {
    const эф = ЭФИР.includes(m.st), ск = скоро(m) && !m.если
    let html = постер(m, d, 'hp-p--xl', 170, 'div')
    if (ск && d.today) html = html.replace('hp-p--xl', 'hp-p--xl has-timer').replace('<div class="hp-p__bot">', `<div class="hp-timer"><b data-hp-tick="${m.t}" data-mode="short">${доСтарта(m.t).short}</b><small>До начала</small></div><div class="hp-p__bot">`)
    const кнопки = эф ? `<a class="hp-btn hp-btn--main" href="${ссылка(m)}">Смотреть · Twitch RU</a><a class="hp-btn" href="${ссылка(m)}">Страница матча</a>`
      : ск ? `<button class="hp-btn hp-btn--main" type="button" data-hp-remind aria-pressed="false">Напомнить</button><a class="hp-btn" href="lineup.html">Собрать состав</a><a class="hp-btn" href="${ссылка(m)}">Страница матча</a>`
      : `<a class="hp-btn" href="${ссылка(m)}">Страница матча</a>`
    return html.replace('%ACTS%', `<div class="hp-acts">${кнопки}</div>`)
  }

  let день = 1, выбран = null
  const игры = new Set()
  const тик = () => root.querySelectorAll('[data-hp-tick]').forEach(el => {
    const d = доСтарта(+el.dataset.hpTick)
    el.textContent = el.dataset.mode === 'short' ? d.short : d.txt
  })

  const рисовать = () => {
    const d = ДНИ[день], c = играДня(d)
    const список = d.м.filter(m => !игры.size || игры.has(m.g)).sort((a, b) => выкл(a) - выкл(b) || a.t - b.t)
    const герой = список.find(m => m.id === выбран) || главный(список)
    const ещё = список.filter(m => m !== герой).sort((a, b) => вес(a) - вес(b) || a.t - b.t)
    root.innerHTML = `
      <div class="hp-head"><h2>Октябрь</h2><p>${d.today ? 'Сегодня, ' : ''}<b>${ДНИ_НЕД[день]}, ${d.n} октября</b> · ${d.k} матчей</p>
        <div class="hp-games" role="group" aria-label="Игры"><button type="button" data-g="all" aria-pressed="${!игры.size}">Все игры<small>${d.м.length}</small></button>
          ${Object.keys(ИГРЫ).map(g => `<button type="button" data-g="${g}" class="hp-gt--${g}" aria-pressed="${игры.has(g)}">${ИГРЫ[g]}<small>${c[g] || 0}</small></button>`).join('')}</div></div>
      <div class="hp-week">${ДНИ.map((x, i) => { const cg = играДня(x)
        return `<button class="hp-d ${x.past ? 'is-past' : ''}" type="button" data-d="${i}" aria-pressed="${i === день}"><span>${x.today ? 'Сегодня' : x.past ? 'Вчера' : x.d}</span>
          <div><p class="hp-d__top"><b>${x.n}</b>${x.today ? '<em><i class="hp-dot"></i>5 в эфире</em>' : ''}</p><small>${x.k} матчей<i>${Object.keys(cg).map(g => `<u class="hp-gt--${g}"></u>`).join('')}</i></small></div></button>` }).join('')}</div>
      ${герой ? `<div class="hp-main">${героем(герой, d)}
        <div class="hp-side"><div class="hp-side__list">${ещё.slice(0, 3).map(m => постер(m, d, 'hp-p--row', 64)).join('')}</div>
          <div class="hp-more"><a class="hp-btn" href="match-center.html?day=${d.n}">Все ${d.k} матчей дня</a></div></div></div>`
        : '<div class="hp-empty">В этот день матчей выбранных игр нет</div>'}`
  }

  root.addEventListener('click', e => {
    const p = e.target.closest('.hp-p--row'); if (p) { e.preventDefault(); выбран = p.dataset.id; рисовать(); return }
    const r = e.target.closest('[data-hp-remind]'); if (r) { const on = r.getAttribute('aria-pressed') !== 'true'; r.setAttribute('aria-pressed', on); r.textContent = on ? 'Напомню за 10 минут' : 'Напомнить'; return }
    const dd = e.target.closest('[data-d]'); if (dd) { день = +dd.dataset.d; выбран = null; рисовать(); return }
    const g = e.target.closest('[data-g]'); if (g) { const k = g.dataset.g; if (k === 'all') игры.clear(); else игры.has(k) ? игры.delete(k) : игры.add(k); if (игры.size === 5) игры.clear(); выбран = null; рисовать() }
  })
  рисовать()
  setInterval(тик, 1000)
})()
