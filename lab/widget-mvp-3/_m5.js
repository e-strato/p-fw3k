// Виджет MVP, v6 (дирижёр 23.10: «не список — один игрок, как HLTV Player of the week, но в нашей стилистике»).
// Весь виджет — одна карточка: шапка «MVP турнира» + период; игрок целиком (не режем) на всю ширину, чуть парит над полом — тень и лёгкое
// покачивание, как в наших карточках; за ним — бледно лого команды и редкий глитч полосами; по нижним углам — ник с командой и KDA;
// под ним сегмент «MVP чего»; снизу обычная кнопка из-под края (как «Все трансферы»). Наклон всего виджета при наведении (п. 4.3).
// ‼️ Пример: кто MVP — см. HQ ниже; цена (очки месяца × 1,25)
// и «в составе» у Pure и rue — пример. MVPC.render(узел, { match, mine, depth — ник и KDA выше карточки (v7), up — заголовок, турнир и сегмент тоже выше (v8), still — без наклона за мышью (v9), dock — вид кнопки снизу (v10–v13) })
(() => {
  const D = window.MVP_DATA, U = window.U
  const dota = D.list.filter(p => p.game === 'dota2'), top = (arr, f) => arr.slice().sort((a, b) => f(b) - f(a))[0]
  // Фото — те же качественные портреты, что в карточках сайта (website/img/players, 760×911; дирижёр 23.10: «там они качественно»).
  // Есть у Pure, 9Class, rue (и Yatoro — его не берём, дирижёр 23.10). ‼️ Пример: Турнир — Pure, Неделя — 9Class, Месяц — rue; в матче — лучший из них в двух командах.
  // 9Class в данных нет — добавлен здесь, команда и цифры выдуманы (у трёх MVP — разные команды, дирижёр 23.10)
  if (!dota.some(p => p.nick === '9Class')) dota.push({ game: 'dota2', nick: '9Class', team: 'OG', week: { pts: 301, m: 6, kda: 6.2 }, month: { pts: 880, m: 16, kda: 5.9 } })
  const HQ = { pure: 1, '9class': 1, rue: 1 }, by = n => dota.find(p => p.nick.toLowerCase() === n)
  dota.forEach(p => { if (HQ[p.nick.toLowerCase()]) p.hq = `/p-fw3k/site/img/players/${p.nick.toLowerCase()}.webp` })
  const TOUR = by('pure'), MINE = ['Pure', 'rue'] // «в составе» — пример
  const nb = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), price = p => Math.round(p.month.pts * 1.25 / 10) * 10
  const views = o => { const tour = { tab: 'Турнир', what: 'MVP турнира', sub: 'BLAST SLAM VIII', p: TOUR, kda: p => p.month.kda }
    if (o.match) { const two = dota.filter(p => p.team === o.match.a || p.team === o.match.b)
      return [{ tab: 'Матч', what: 'MVP матча', sub: `${U.tag(o.match.a)} — ${U.tag(o.match.b)}`, p: top(two.filter(p => p.hq), p => p.week.pts) || TOUR, kda: p => p.week.kda }, tour] }
    return [tour, { tab: 'Неделя', what: 'MVP недели', sub: '14 – 20.10', p: by('9class'), kda: p => p.week.kda },
      { tab: 'Месяц', what: 'MVP месяца', sub: 'Октябрь', p: by('rue'), kda: p => p.month.kda }] }
  const ic = { add: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    ok: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m3 8.5 3 3 7-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
  const tilt = el => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.onpointermove = e => { const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height
      el.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg')
      el.style.setProperty('--px', (x - .5).toFixed(3)); el.style.setProperty('--py', (y - .5).toFixed(3)); el.classList.add('is-tilt') }
    el.onpointerleave = () => { el.classList.remove('is-tilt'); ['--rx', '--ry', '--px', '--py'].forEach(k => el.style.removeProperty(k)) } }
  // Кнопка из-под края (дирижёр 23.10: «зачем плюс и стрелка — сделай разные красивые»): без dock — как v8 (плюс, цена, стрелка);
  // 'plain' — только текст и цена с монеткой (v10) · 'center' — одной строкой по центру (v11) · 'fill' — залитая золотом (v12) · 'split' — текст и цена в пилюле (v13)
  const coin = n => `<span class="m6-dock__c">${n}</span>`
  const dock = (k, mine, n) => { const cls = `m6-dock${k ? ' m6-dock--' + k : ''}`
    if (!k) return mine ? `<a class="${cls}" href="#fantasy">${ic.ok}<span>В твоём составе</span>${ic.next}</a>` : `<a class="${cls}" href="#fantasy">${ic.add}<span>Взять в фэнтези</span>${coin(n)}${ic.next}</a>`
    if (mine) return `<a class="${cls} is-mine" href="#fantasy"><span>В твоём составе</span></a>`
    if (k === 'center') return `<a class="${cls}" href="#fantasy"><span>Взять в фэнтези за</span>${coin(n)}</a>`
    if (k === 'fill') return `<a class="${cls}" href="#fantasy"><span>Взять в фэнтези</span>${coin(n)}</a>`
    return `<a class="${cls}" href="#fantasy"><span>Взять в фэнтези</span>${coin(n)}${k === 'split' ? ic.next : ''}</a>` } // split — с шевроном справа (дирижёр 23.10)
  const G = D.games.find(g => g.id === 'dota2') // лого игры у турнира / периода в шапке (дирижёр 23.10)
  function render(el, o) { const s = o.s || (o.s = { i: 0 }), vs = views(o), v = vs[Math.min(s.i, vs.length - 1)], p = v.p, mine = o.mine && MINE.includes(p.nick), lg = D.teams[p.team]
    const ev = `${G ? `<img src="${G.logo}" alt="" title="${G.name}">` : ''}${v.sub}` // турнир / период с лого игры
    // перерисовка по клику не сбрасывает наклон: без is-tilt слои уезжают в покой за .5 с и при переключении сегмента дёргаются (дирижёр 23.10: «мигает там, где двигается от мыши»)
    const keep = ['is-tilt', 'fx-on'].filter(c => el.classList.contains(c)), oldPh = el.querySelector('.m6-ph')
    el.className = 'w m6' + (o.depth ? ' m6--depth' : '') + (o.up ? ' m6--up' : '') + keep.map(c => ' ' + c).join('') // up (v8) — заголовок, турнир (крупнее) и сегмент тоже выше карточки // depth (v7) — ник и KDA лежат выше карточки: при наклоне сдвигаются сильнее
    if (o.empty) { // пусто (дирижёр 23.10): MVP ещё не выбран — шапка и сегмент на месте, вместо игрока текст, кнопки нет
      el.innerHTML = `<div class="m6-main"><div class="m6-hd"><b class="m6-up">${v.what}</b><span class="m6-ev${o.up ? ' m6-up' : ''}">${ev}</span></div>
        <div class="m6-card u-empty"><b>MVP пока нет</b><span>${v.tab === 'Матч' ? 'Появится после матча' : 'Выберем после первых матчей'}</span></div>
        <div class="m6-seg${o.up ? ' m6-up' : ''}">${vs.map((x, j) => `<button class="${x === v ? 'is-on' : ''}" data-j="${j}">${x.tab}</button>`).join('')}</div></div>`
      el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { s.i = +b.dataset.j; render(el, o) }); return }
    el.innerHTML = `<div class="m6-main"><i class="m6-bg" style="--lg:url('${lg || ''}')"></i><i class="m6-gl"><i></i><i></i><i></i></i>
      <div class="m6-hd"><b class="m6-up">${v.what}</b><span class="m6-ev${o.up ? ' m6-up' : ''}">${ev}</span></div>
      <div class="m6-card"><i class="m6-floor"></i>${p.hq || p.photo ? `<img class="m6-ph" src="${p.hq ? (window.IMGR || (x => x))(p.hq) : p.photo}" alt="">` : ''}<i class="m6-fade"></i>
        <div class="m6-c m6-c--bl"><b>${p.nick}</b><span class="m6-tm">${lg ? `<img src="${lg}" alt="">` : ''}${p.team}</span></div>
        <div class="m6-c m6-c--br"><b>${v.kda(p)}</b><span>KDA</span></div></div>
      <div class="m6-seg${o.up ? ' m6-up' : ''}">${vs.map((x, j) => `<button class="${x === v ? 'is-on' : ''}" data-j="${j}">${x.tab}</button>`).join('')}</div></div>
      ${dock(o.dock, mine, nb(price(p)))}`
    el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { s.i = +b.dataset.j; render(el, o) })
    const ph = el.querySelector('.m6-ph'); if (oldPh && ph && oldPh.src === ph.src) ph.replaceWith(oldPh) // тот же игрок — фото не перезагружаем, без вспышки
    el.querySelectorAll('a').forEach(a => a.onclick = e => e.preventDefault()); if (!o.still) tilt(el) } // still (v9) — за мышью не двигается
  window.MVPC = { render }
})()
