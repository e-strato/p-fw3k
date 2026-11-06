// Лаба match-bar — строка матчей под шапкой сайта (созвон 02.11 §3.10; разбор референсов — Figma стр. 12 · Матч-бар, 351:368).
// v1 — в стиле CBS Sports (дирижёр 03.11: «cbssports.com — сделай версию в этом стиле»): отдельные плитки на подложке,
// слева плитка турнира (лого + название ▾ — выбор турнира) и «Все матчи», дальше плитки матчей: статус сверху, две строки «лого · команда · счёт»,
// проигравший — серым. Порядок: идут → скоро → завершены. Прокрутка вбок (на телефоне — пальцем). ‼️ Матчи UNIVERSE, счёт и время — пример.
window.MB = (() => {
  const T4 = (window.T4_DATA || { teams: {} }).teams, LG = (n) => (T4[n]?.logo ? '../widget-tournament-4/' + T4[n].logo : '')
  const SH = { 'Team Spirit': 'Spirit', PARIVISION: 'PARI', 'Team Yandex': 'Yandex', OG: 'OG', GamerLegion: 'GL', 'Team Liquid': 'Liquid', 'Astra Invicta': 'Astra', Nightfall: 'Nightfall', 'SabeRLight-': 'SabeRLight' }
  // [статус, время/дата, команда 1, команда 2, счёт 1, счёт 2, подпись]
  const M = [
    ['live', 'Карта 2', 'Team Spirit', 'PARIVISION', 1, 0, 'Нижняя сетка'],
    ['soon', 'Сегодня 19:00', 'Team Liquid', 'OG', null, null, 'Нижняя сетка'],
    ['soon', '31 окт 16:00', 'GamerLegion', 'Team Yandex', null, null, 'Финал верхней'],
    ['done', '30 окт', 'GamerLegion', 'OG', 2, 0], ['done', '29 окт', 'Team Yandex', 'PARIVISION', 2, 1], ['done', '29 окт', 'Team Spirit', 'SabeRLight-', 2, 1],
    ['done', '29 окт', 'Team Liquid', 'Nightfall', 2, 0], ['done', '28 окт', 'OG', 'Team Spirit', 2, 1], ['done', '28 окт', 'PARIVISION', 'Team Liquid', 2, 1], ['done', '28 окт', 'Team Yandex', 'Astra Invicta', 2, 0],
  ]
  const TOURS = [['UNIVERSE', '../widget-tournament-4/logos/pari-universe.png', 1], ['EPL Masters III', '../widget-tournament-4/logos/epl-masters-3.png', 0], ['BLAST SLAM IX', '../widget-tournament-4/logos/blast-slam-9.png', 0]]
  const S = { t: 0, open: false, o: {} }
  // v4 (o.more): больше матчей — к UNIVERSE добавлены идущие и будущие матчи EPL Masters III и EPL World Series: SEA (настоящие пары с Liquipedia, ../widget-tournament-4/_data.js);
  //   live — первыми, дальше по времени; у каждой плитки — лого своего турнира (дирижёр 03.11: «больше данных»). ‼️ Время у EPL — из снимка 21.10, пример
  const SLOTS = ['15:00', '16:30', '18:00', '20:30', '21:00', '22:30', '31.10 12:00', '31.10 13:30', '31.10 15:00', '31.10 18:00', '01.11 12:00', '01.11 15:00']
  const EXTRA = () => { const out = []; let k = 0; for (const t of (window.T4_DATA?.tours || []).filter((x) => /^epl-/.test(x.id)))
    for (const m of t.matches || []) { if (/\d:\d/.test(m.stage)) continue
      const w = m.when === 'live' ? 'Карта 1' : SLOTS[k++ % SLOTS.length] // время — по сетке слотов от «сейчас» страницы (30.10), пример
      out.push([m.when === 'live' ? 'live' : 'soon', w, m.a, m.b, m.when === 'live' ? 0 : null, m.when === 'live' ? 0 : null, '', [t.name, '../widget-tournament-4/' + t.logo]]) }
    return out }
  // v6 (o.db): матчи — из общей базы (_db): идут и скоро на «сейчас» (21.08.2026 16:08, TI), время — по Москве; лого и имена — из базы
  const DBL = () => window.DB.matches({ state: ['live', 'soon'] }).map((m) => [m.state, m.state === 'live' ? m.live || 'Live' : (m.start.slice(0, 10) === window.DB.data.now.slice(0, 10) ? '' : m.start.slice(8, 10) + '.' + m.start.slice(5, 7) + ' ') + m.start.slice(11, 16), m.a, m.b, m.score?.[0] ?? null, m.score?.[1] ?? null, m.stage, undefined, m.id]) // 9-й — id матча (w-news-match: тап по матчу фильтрует новости)
  const ALL = () => { if (S.o.db) return DBL()
    const L = [...M, ...(S.o.more ? EXTRA() : [])]; return S.o.more ? [...L.filter((m) => m[0] === 'live'), ...L.filter((m) => m[0] === 'soon').sort((a, b) => key(shortW('soon', a[1])) - key(shortW('soon', b[1]))), ...L.filter((m) => m[0] === 'done')] : L }
  const key = (w) => { const m = w.match(/(?:(\d+)\.(\d+) )?(\d+):(\d+)/) || w.match(/(\d+) окт (\d+):(\d+)/); if (!m) return 0; return m.length === 5 ? (m[1] ? (+m[2] === 11 ? 31 + +m[1] : +m[1]) * 1440 : 30 * 1440) + +m[3] * 60 + +m[4] : 31 * 1440 + +m[2] * 60 + +m[3] }
  // v3 (o.noDone): завершённые матчи не показываем — только идут и скоро (дирижёр 03.11)
  // v2 (o.v2): без переключателя турниров — лого турнира маленьким в правом верхнем углу плитки; дата короче: «19:00», «31.10 16:00», «30.10» (дирижёр 03.11)
  const shortW = (st, w) => (st === 'live' ? w : w.replace(/^Сегодня /, '').replace(/(\d+) окт/, (_, d) => d.padStart(2, '0') + '.10'))
  const ini = (n) => n.replace(/^Team /, '').slice(0, 2).toUpperCase()
  const lg = (n) => (S.o.db ? `<img src="${window.DB.logo(n)}" alt="">` : LG(n) ? `<img src="${LG(n)}" alt="">` : `<i>${ini(n)}</i>`)
  const tile = ([st, when, a, b, x, y, note, tl]) => { const done = st === 'done', w = done ? (x > y ? 0 : 1) : -1
    const row = (n, s, i) => `<span class="mb-r${w === i ? ' is-w' : w >= 0 ? ' is-l' : ''}">${lg(n)}<b>${SH[n] || n}</b><em>${s ?? ''}</em></span>`
    return `<a class="mb-t${st === 'live' ? ' is-live' : ''}" href="#"><span class="mb-s">${S.o.v2 ? (st === 'live' ? '<i></i>Live · ' + when : shortW(st, when)) : st === 'live' ? '<i></i>Live · ' + when : done ? 'Завершён · ' + when : when}</span>${S.o.v2 ? `<img class="mb-tl" src="${tl ? tl[1] : TOURS[0][1]}" alt="" title="${tl ? tl[0] : TOURS[0][0]}">` : ''}${row(a, x, 0)}${row(b, y, 1)}</a>` }
  // v5 (o.tick) — как 99damage.de: одна тонкая строка 40 px, бежит сама (наведение — стоп), элемент «лого Команда [счёт] Команда лого», между — черта;
  //   в окошке счёта: Live — счёт и красная точка, скоро — время. Без плиток и подложки (дирижёр 03.11: «сделай версию 99damage»)
  const SH2 = (n) => (S.o.db ? window.DB.name(n, 'mid') : SH[n] || n.replace(/^Team /, ''))
  const tk = ([st, when, a, b, x, y, , , id]) => { const live = st === 'live', box = live ? `<i class="mb-k__lv"></i>${x}<s>:</s>${y}` : shortW(st, when)
    return `<a class="mb-k${live ? ' is-live' : ''}" href="#"${id ? ` data-mm="${id}"` : ''}>${lg(a)}<b>${SH2(a)}</b><span class="mb-k__s">${box}</span><b>${SH2(b)}</b>${lg(b)}</a>` }
  // дирижёр 06.11: строка не должна кончаться — матчей мало (2) → повторяем, пока половина ленты не шире экрана (≥ 12 плиток); медленнее — 6 с на плитку
  function renderTick(el) { const L = ALL().filter((m) => m[0] !== 'done'), k = Math.max(1, Math.ceil(12 / (L.length || 1))), row = L.map(tk).join('').repeat(k)
    el.innerHTML = `<div class="mb mb--tick"><div class="mb-k__in" style="--d:${L.length * k * 6}s">${row}${row}</div></div>` }
  function render(el) { if (S.o.tick) return renderTick(el)
    const T = TOURS[S.t], has = T[2]
    el.innerHTML = `<div class="mb"><div class="mb-in">
      ${S.o.v2 ? '' : `<div class="mb-tw"><button class="mb-t mb-tour" data-tour><img src="${T[1]}" alt=""><span>${T[0].split(' ')[0]}<svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2.5 4l2.5 2.5L7.5 4"/></svg></span></button>
        ${S.open ? `<div class="mb-pop">${TOURS.map((t, i) => `<button data-ti="${i}" class="${i === S.t ? 'is-on' : ''}"><img src="${t[1]}" alt="">${t[0]}</button>`).join('')}</div>` : ''}</div>`}
      <a class="mb-t mb-all" href="#">Все<br>матчи</a>
      ${has ? ALL().filter((m) => !(S.o.noDone && m[0] === 'done')).map(tile).join('') : '<span class="mb-none">Сегодня матчей нет · ближайшие — в «Все матчи»</span>'}
    </div></div>` }
  function mount(el, o = {}) { S.o = o; render(el)
    el.addEventListener('click', (e) => { const t = e.target.closest('[data-tour]'), i = e.target.closest('[data-ti]')
      if (t) { S.open = !S.open; return render(el) } if (i) { S.t = +i.dataset.ti; S.open = false; return render(el) }
      if (e.target.closest('a')) e.preventDefault() })
    document.addEventListener('click', (e) => { if (S.open && !el.contains(e.target)) { S.open = false; render(el) } }) }
  return { mount }
})()
