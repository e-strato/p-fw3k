// Виджет замен — технический, для админа (созвон 21.10, Т2.10–Т2.19, решение 25): держать составы в базе актуальными.
// Флоу: система нашла замену → строка «не проверено» → админ раскрывает, смотрит источник, ставит срок
// (навсегда · на турнир · до даты · смена позиции) и подтверждает → «проверено», у игрока «заменён с … по …». «Найти» — поиск новых.
// Строка: «поз. 1 · Pure → Shad», без аватарок; игроков без замен нет. На главной — лента по матчам дня, в матче — только его замены.
// Данные: window.SUBS_DATA (_data.js, cybersport.ru / dota2.ru) + логотипы и матчи — из виджета турнира (T4_DATA).
// S5.render(узел, { match: { a, b } | null, look }) — look: v2 'rss' · v3 'log' · v4 'term' (техничные виды, без скруглений) ·
// v5 'inbox' — входящие · v6 'diff' — git-дифф · v7 'queue' — по одной, Y / N / → · v8 'mlog' — терминал по матчам ·
// v9 'news' — новости со ссылками, решение только в открытой записи · v10 'min' — одна линия по сетке, остальное в раскрытии ·
// v11 'mix' — терминал + минимум: группы по матчу (крупно), тег надёжности источника, новость с решением; без look — v1.
(() => {
  const D = window.SUBS_DATA, T = window.T4_DATA
  const ini = n => n.replace(/^(Team |The )/, '').slice(0, 2).toUpperCase()
  const logo = (n, cls = 's5-lg') => { const src = T.teams[n] && T.teams[n].logo; return src ? `<img class="${cls}" src="${src}" alt="" title="${n}">` : `<span class="${cls} s5-ini" title="${n}">${ini(n)}</span>` }
  const chip = w => w === 'live' ? '<span class="s5-chip s5-chip--live">LIVE</span>' : `<span class="s5-chip">${String(w).replace(/^Сегодня,?\s*/, '')}</span>`
  const ic = {
    arr: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0-3-3m3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ok: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    find: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    link: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }
  const KIND = { forever: 'Навсегда', event: 'На турнир', date: 'До даты', pos: 'Смена позиции' }

  // Матчи дня (идущие и сегодня) из турниров; у каждого — замены его команд
  const today = () => T.tours.flatMap(t => (t.matches || []).filter(m => m.when === 'live' || /^Сегодня/.test(m.when)).map(m => ({ ...m, tour: t.name })))
  const subsOf = m => D.subs.map((x, i) => ({ ...x, i })).filter(x => x.team === m.a || x.team === m.b)
  // На главной после матчей дня — замены команд, которые сегодня не играют (админу их тоже проверять)
  const rest = ms => D.subs.map((x, i) => ({ ...x, i })).filter(x => !ms.some(m => x.team === m.a || x.team === m.b))

  // Строка замены; раскрыта — источник, срок и «Подтвердить / Отклонить»
  const row = (x, s) => { const st = s.st[x.i] || {}, open = s.open === x.i
    const status = st.ok ? `<span class="s5-st s5-st--ok">${ic.ok}проверено</span>` : st.no ? '<span class="s5-st s5-st--no">отклонено</span>' : '<span class="s5-st">не проверено</span>'
    const term = st.ok ? `<div class="s5-term">${st.kind === 'pos' ? 'смена позиции' : `заменён с ${x.from || '—'}${st.kind === 'forever' ? ' · навсегда' : st.kind === 'event' ? ` · на ${x.event || 'турнир'}` : st.kind === 'date' ? ` по ${st.to || x.to || '…'}` : ''}`}</div>` : ''
    const body = !open ? '' : `<div class="s5-x">
      <a class="s5-src" href="${x.src}" target="_blank" rel="noopener">${ic.link}${new URL(x.src).hostname.replace(/^www\./, '')}${x.from ? ' · с ' + x.from : ''}${x.event ? ' · ' + x.event : ''}</a>
      <div class="s5-kind">${Object.entries(KIND).map(([k, l]) => `<button class="${(s.kind[x.i] || 'event') === k ? 'is-on' : ''}" data-kind="${k}">${l}</button>`).join('')}</div>
      ${(s.kind[x.i] || 'event') === 'date' ? `<input class="s5-date" type="date" data-to value="${s.to[x.i] || ''}">` : ''}
      <div class="s5-act"><button class="s5-btn s5-btn--pri" data-ok>Подтвердить</button><button class="s5-btn" data-no>Отклонить</button></div></div>`
    return `<div class="s5-r ${open ? 'is-open' : ''} ${st.ok ? 'is-ok' : ''}" data-i="${x.i}"><button class="s5-r__h" data-tog>
      <span class="s5-pos">поз. ${x.pos || '?'}</span>${logo(x.team, 's5-lg s5-lg--16')}<span class="s5-out">${x.out}</span>${ic.arr}<b class="s5-in">${x.in}</b>${status}</button>${term}${body}</div>` }
  const matchHead = (m, n) => `<div class="s5-m">${logo(m.a)}<span class="s5-m__n">${m.a}</span><span class="s5-cap">—</span>${logo(m.b)}<span class="s5-m__n">${m.b}</span><span class="s5-sp"></span>${chip(m.when)}<span class="s5-cap">${n} ${n === 1 ? 'замена' : n < 5 ? 'замены' : 'замен'}</span></div>`

  // ——— v2–v4: техничные виды (o.look) — ближе к RSS-ленте, квадратные, без пилюль ———
  // rss — записи по времени, свежие сверху; log — таблица-журнал; term — моноширинный лог с [✓] [✕]
  const when = x => x.from ? +(x.from.slice(3) + x.from.slice(0, 2)) : 0
  const host = x => new URL(x.src).hostname.replace(/^www\./, '')
  const stText = st => st.ok ? 'проверено' : st.no ? 'отклонено' : 'не проверено'
  const stCls = st => st.ok ? 'ok' : st.no ? 'no' : 'new'
  const term2 = (x, st) => st.kind === 'pos' ? 'смена позиции' : `с ${x.from || '—'}${st.kind === 'forever' ? ', навсегда' : st.kind === 'date' ? ` по ${st.to || x.to || '…'}` : `, на ${x.event || 'турнир'}`}`
  const kindRow = (x, s, cls) => `<div class="${cls}">${Object.entries(KIND).map(([k, l]) => `<button class="${(s.kind[x.i] || 'event') === k ? 'is-on' : ''}" data-kind="${k}">${l}</button>`).join('')}</div>${(s.kind[x.i] || 'event') === 'date' ? `<input class="s5-date s5q-date" type="date" data-to value="">` : ''}`
  const matchOf = x => today().find(m => m.a === x.team || m.b === x.team)
  const looks = {
    rss: (x, s) => { const st = s.st[x.i] || {}, open = s.open === x.i, m = matchOf(x)
      return `<article class="s5r ${open ? 'is-open' : ''}" data-i="${x.i}"><button class="s5r__h" data-tog>
        <span class="s5r__meta">${x.from || '—'} · ${host(x)}<span class="s5r__st s5r__st--${stCls(st)}">${stText(st)}</span></span>
        <span class="s5r__t">${logo(x.team, 's5-lg s5-lg--16')}<b>${x.team}:</b> ${x.in} вместо ${x.out}${x.pos ? `, поз. ${x.pos}` : ''}</span>
        <span class="s5r__sub">${m ? `${m.a} — ${m.b} · ${m.when === 'live' ? 'идёт' : m.when.replace(/^Сегодня,?\s*/, 'сегодня ')}` : x.event || ''}${st.ok ? ` · ${term2(x, st)}` : ''}</span></button>
        ${open ? `<div class="s5r__x"><a href="${x.src}" target="_blank" rel="noopener">${host(x)} — открыть источник</a>${kindRow(x, s, 's5q-kind')}<div class="s5r__act"><button data-ok>подтвердить</button><span>·</span><button data-no>отклонить</button></div></div>` : ''}</article>` },
    log: (x, s) => { const st = s.st[x.i] || {}, open = s.open === x.i
      return `<div class="s5l ${open ? 'is-open' : ''}" data-i="${x.i}"><button class="s5l__r" data-tog><span class="s5l__d">${x.from || '—'}</span>${logo(x.team, 's5-lg s5-lg--16')}<span class="s5l__p">${x.pos || '?'}</span><span class="s5l__x"><s>${x.out}</s> → <b>${x.in}</b></span><span class="s5l__st s5l__st--${stCls(st)}" title="${stText(st)}"></span></button>
        ${open ? `<dl class="s5l__kv"><dt>команда</dt><dd>${x.team}</dd><dt>турнир</dt><dd>${x.event || '—'}</dd><dt>срок</dt><dd>${st.ok ? term2(x, st) : `${x.from || '—'} → ${x.to || 'не объявлен'}`}</dd><dt>источник</dt><dd><a href="${x.src}" target="_blank" rel="noopener">${host(x)}</a></dd></dl>
          <div class="s5l__ed">${kindRow(x, s, 's5q-kind')}<div class="s5q-act"><button class="s5q-btn s5q-btn--pri" data-ok>Подтвердить</button><button class="s5q-btn" data-no>Отклонить</button></div></div>` : ''}</div>` },
    term: (x, s) => { const st = s.st[x.i] || {}, open = s.open === x.i
      return `<div class="s5t ${open ? 'is-open' : ''}" data-i="${x.i}"><div class="s5t__r"><button class="s5t__l" data-tog><span class="s5t__d">${x.from || '--.--'}</span> <span class="s5t__tm">${x.team.slice(0, 10).padEnd(10, ' ')}</span> p${x.pos || '?'} <span class="s5t__o">${x.out}</span>→<b>${x.in}</b></button>
        ${st.ok || st.no ? `<span class="s5t__st s5t__st--${stCls(st)}">${st.ok ? '✓' : '✕'}</span>` : `<button class="s5t__b s5t__b--ok" data-quick="ok" title="Подтвердить">✓</button><button class="s5t__b" data-quick="no" title="Отклонить">✕</button>`}</div>
        ${open ? `<div class="s5t__x"><div>src: <a href="${x.src}" target="_blank" rel="noopener">${host(x)}</a></div><div>event: ${x.event || '—'}</div><div>term: ${st.ok ? term2(x, st) : (x.from || '—') + ' → ' + (x.to || '?')}</div>${kindRow(x, s, 's5q-kind s5q-kind--mono')}</div>` : ''}</div>` },
  }
  // v6 «Дифф»: замена как git-дифф — «− pN ушёл» / «+ pN пришёл», [✓] [✕] справа; клик по шапке — src / event / term
  looks.diff = (x, s) => { const st = s.st[x.i] || {}, open = s.open === x.i
    return `<div class="s5f ${st.ok ? 'is-ok' : st.no ? 'is-no' : ''}" data-i="${x.i}"><div class="s5f__h"><button class="s5f__t" data-tog>${logo(x.team, 's5-lg s5-lg--16')}<span>${x.team}</span><span class="s5f__d">${x.from || ''}</span></button>
      ${st.ok || st.no ? `<span class="s5t__st s5t__st--${stCls(st)}">${st.ok ? '✓' : '✕'}</span>` : `<button class="s5t__b s5t__b--ok" data-quick="ok" title="Норм">✓</button><button class="s5t__b" data-quick="no" title="Не норм">✕</button>`}</div>
      <div class="s5f__l s5f__l--rm">− p${x.pos || '?'} ${x.out}</div><div class="s5f__l s5f__l--add">+ p${x.pos || '?'} ${x.in}</div>
      ${open ? `<div class="s5t__x"><div>src: <a href="${x.src}" target="_blank" rel="noopener">${host(x)}</a></div><div>event: ${x.event || '—'}</div><div>term: ${st.ok ? term2(x, st) : (x.from || '—') + ' → ' + (x.to || '?')}</div>${kindRow(x, s, 's5q-kind s5q-kind--mono')}</div>` : ''}</div>` }
  // v8 «Лог по матчам»: строки терминала под заголовками матчей дня, потом «без матча»
  const byMatch = (xs, ctx) => { if (ctx) return [[null, xs]]; const g = today().map(m => [m, xs.filter(x => x.team === m.a || x.team === m.b)]).filter(([, a]) => a.length)
    const rest = xs.filter(x => !g.some(([, a]) => a.includes(x))); return rest.length ? [...g, ['rest', rest]] : g }

  // v7 «Очередь»: по одной непроверенной замене крупно, Y / N / → с клавиатуры; ниже — журнал решённых
  function renderQueue(el, o) {
    const s = o.s || (o.s = { open: null, st: {}, kind: {}, to: {}, find: 0, skip: [] })
    const ctx = o.match, all = (ctx ? subsOf(ctx) : D.subs.map((x, i) => ({ ...x, i }))).sort((a, b) => when(b) - when(a))
    const todo = all.filter(x => !s.st[x.i]), order = [...todo.filter(x => !s.skip.includes(x.i)), ...todo.filter(x => s.skip.includes(x.i))], x = order[0]
    const done = all.filter(y => s.st[y.i]), n = all.length - todo.length
    const decide = v => { if (!x) return; if (v === 'skip') { s.skip = [...s.skip.filter(i => i !== x.i), x.i] } else s.st[x.i] = v === 'ok' ? { ok: 1, kind: s.kind[x.i] || 'event' } : { no: 1 }; renderQueue(el, o) }
    const m = x && matchOf(x)
    el.className = 'w s5 s5q s5q--term s5u'
    el.innerHTML = `<div class="s5q-hd"><b>${ctx ? `замены · ${ctx.a} — ${ctx.b}` : 'замены · очередь'}</b><span class="s5q-hd__c">${todo.length ? `${n + 1} / ${all.length}` : 'пусто'}</span></div>
      <div class="s5u__bar"><i style="width:${all.length ? n / all.length * 100 : 0}%"></i></div>
      <div class="w-scroll"><div class="s5q-bd">${x ? `<div class="s5u__cur">
        <div class="s5u__tm">${logo(x.team, 's5-lg s5u__lg')}<b>${x.team}</b></div>
        <div class="s5f__l s5f__l--rm">− p${x.pos || '?'} ${x.out}</div><div class="s5f__l s5f__l--add">+ p${x.pos || '?'} ${x.in}</div>
        <div class="s5u__kv"><div>where: ${m ? `${m.a} — ${m.b} · ${m.when === 'live' ? 'live' : m.when.replace(/^Сегодня,?\s*/, 'сегодня ')}` : x.event || '—'}</div><div>since: ${x.from || '—'}${x.to ? ' → ' + x.to : ' → ?'}</div><div>src: <a href="${x.src}" target="_blank" rel="noopener">${host(x)}</a></div></div>
        ${kindRow(x, s, 's5q-kind s5q-kind--mono')}
        <div class="s5u__act"><button class="s5u__b s5u__b--ok" data-v="ok">✓ норм <kbd>Y</kbd></button><button class="s5u__b" data-v="no">✕ не норм <kbd>N</kbd></button><button class="s5u__b" data-v="skip">› <kbd>→</kbd></button></div></div>` : '<div class="s5u__empty">всё проверено ✓</div>'}
        ${done.length ? `<div class="s5u__log">${done.map(y => `<div class="s5u__lr"><span class="s5t__st--${stCls(s.st[y.i])}">${s.st[y.i].ok ? '✓' : '✕'}</span> ${y.team.slice(0, 12)} p${y.pos || '?'} ${y.out}→${y.in}<button data-undo="${y.i}" title="Вернуть">↺</button></div>`).join('')}</div>` : ''}</div></div>
      <div class="s5q-ft s5q-ft--term"><button class="s5q-btn" data-find>${s.find === 1 ? 'ищем…' : 'найти'}</button><span>${s.find === 2 ? 'новых нет · только что' : 'обновлено ' + D.asOf}</span></div>`
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => decide(b.dataset.v))
    el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { s.kind[x.i] = b.dataset.kind; renderQueue(el, o) })
    el.querySelectorAll('[data-undo]').forEach(b => b.onclick = () => { delete s.st[+b.dataset.undo]; renderQueue(el, o) })
    el.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { if (s.find === 1) return; s.find = 1; renderQueue(el, o); setTimeout(() => { s.find = 2; renderQueue(el, o) }, 1200) })
    if (!el.dataset.keys) { el.dataset.keys = 1; el.tabIndex = 0; el.addEventListener('keydown', e => { const k = { y: 'ok', н: 'ok', n: 'no', т: 'no', ArrowRight: 'skip' }[e.key]; if (k && o.look === 'queue') { e.preventDefault(); o.decide && o.decide(k) } }) }
    o.decide = decide
  }

  // v9 «Новости со ссылками» (как v18 старого виджета, дирижёр 21.10): запись — фраза, главное выделено, под ней ссылки на источники.
  // Быстрых кнопок нет — открыл запись, посмотрел, выбрал срок, «Подтвердить» (Т2.13–Т2.15). Сверху — перед матчами сегодня
  function renderNews(el, o) {
    const s = o.s || (o.s = { open: null, st: {}, kind: {}, to: {}, find: 0 })
    const ctx = o.match, all = (ctx ? subsOf(ctx) : D.subs.map((x, i) => ({ ...x, i }))).sort((a, b) => when(b) - when(a))
    const soon = all.filter(x => matchOf(x)), rest = all.filter(x => !matchOf(x)), left = all.filter(x => !s.st[x.i]).length
    const item = x => { const st = s.st[x.i] || {}, open = s.open === x.i, m = matchOf(x)
      const phrase = st.ok ? `<b>${x.in}</b> заменил <b>${x.out}</b> в ${x.team}` : st.no ? `<s>${x.in} вместо ${x.out}</s> — не подтвердилось` : `<b>${x.in}</b> заменит <b>${x.out}</b> в ${x.team}`
      const meta = [x.from, x.pos ? 'поз. ' + x.pos : '', m ? `${m.a} — ${m.b}, ${m.when === 'live' ? 'идёт' : m.when.replace(/^Сегодня,?\s*/, 'сегодня ')}` : x.event].filter(Boolean).join(' · ')
      return `<div class="s5n ${open ? 'is-open' : ''} ${st.ok ? 'is-ok' : st.no ? 'is-no' : ''}" data-i="${x.i}"><button class="s5n__h" data-tog>${logo(x.team, 's5-lg s5n__lg')}
          <span class="s5n__b"><span class="s5n__p">${phrase}</span><span class="s5n__m">${meta}</span></span>${st.ok ? `<span class="s5n__ok">${ic.ok}</span>` : st.no ? '' : '<i class="s5n__dot" title="Нужно проверить"></i>'}</button>
        <div class="s5n__links"><a href="${x.src}" target="_blank" rel="noopener">${host(x)} ↗</a></div>
        ${open ? `<div class="s5n__x">${st.ok ? `<div class="s5n__term">Подтверждено: ${term2(x, st)}</div>` : ''}<div class="s5n__lbl">Срок замены</div>${kindRow(x, s, 's5q-kind')}<div class="s5q-act"><button class="s5q-btn s5q-btn--pri" data-ok>Подтвердить</button><button class="s5q-btn" data-no>Не подтвердилось</button></div></div>` : ''}</div>` }
    const sec = (t, xs) => xs.length ? `<div class="s5n__sec">${t}</div>${xs.map(item).join('')}` : ''
    el.className = 'w s5 s5q s5n-w'
    el.innerHTML = `<div class="s5q-hd"><b>${ctx ? `Замены · ${ctx.a} — ${ctx.b}` : 'Замены'}</b><span class="s5q-hd__c">${left ? `${left} проверить` : 'всё проверено'}</span></div>
      <div class="w-scroll"><div class="s5q-bd">${ctx ? all.map(item).join('') : sec('Перед матчами сегодня', soon) + sec('Ещё', rest)}${all.length ? '' : '<div class="s5-empty">Замен нет</div>'}</div></div>
      <div class="s5q-ft"><button class="s5q-btn" data-find>${s.find === 1 ? 'Ищем…' : 'Найти новые'}</button><span>${s.find === 2 ? 'новых нет · только что' : 'обновлено ' + D.asOf}</span></div>`
    const go = p => { Object.assign(s, p); renderNews(el, o) }
    el.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const i = +b.closest('[data-i]').dataset.i; go({ open: s.open === i ? null : i }) })
    el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { s.kind[s.open] = b.dataset.kind; renderNews(el, o) })
    el.querySelectorAll('[data-to]').forEach(b => b.onchange = () => { s.to[s.open] = b.value.split('-').reverse().slice(0, 2).join('.') })
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { s.st[s.open] = { ok: 1, kind: s.kind[s.open] || 'event', to: s.to[s.open] }; go({ open: null }) })
    el.querySelectorAll('[data-no]').forEach(b => b.onclick = () => { s.st[s.open] = { no: 1 }; go({ open: null }) })
    el.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { if (s.find === 1) return; go({ find: 1 }); setTimeout(() => go({ find: 2 }), 1200) })
  }

  // v10 «Минимум» (дирижёр 21.10: «много инфы, нет баланса»): строка — одна линия по сетке: лого · ушёл → пришёл · точка.
  // Всё остальное (позиция, с какого числа, источник, срок, «Подтвердить») — только в раскрытой строке
  function renderMin(el, o) {
    const s = o.s || (o.s = { open: null, st: {}, kind: {}, to: {}, find: 0 })
    const ctx = o.match, all = (ctx ? subsOf(ctx) : D.subs.map((x, i) => ({ ...x, i }))).sort((a, b) => when(b) - when(a))
    const left = all.filter(x => !s.st[x.i]).length
    const row = x => { const st = s.st[x.i] || {}, open = s.open === x.i
      return `<div class="s5m ${open ? 'is-open' : ''} ${st.ok || st.no ? 'is-done' : ''}" data-i="${x.i}"><button class="s5m__r" data-tog>${logo(x.team, 's5-lg s5m__lg')}<span class="s5m__o">${x.out}</span>${ic.arr}<span class="s5m__i">${x.in}</span>${st.ok ? `<span class="s5m__s s5m__s--ok">${ic.ok}</span>` : st.no ? '<span class="s5m__s">✕</span>' : '<i class="s5m__dot"></i>'}</button>
        ${open ? `<div class="s5m__x"><div class="s5m__kv"><span>поз. ${x.pos || '?'}</span><span>с ${x.from || '—'}${x.to ? ' по ' + x.to : ''}</span><a href="${x.src}" target="_blank" rel="noopener">${host(x)} ↗</a></div>${kindRow(x, s, 's5q-kind')}<div class="s5q-act"><button class="s5q-btn s5q-btn--pri" data-ok>Подтвердить</button><button class="s5q-btn" data-no>Отклонить</button></div></div>` : ''}</div>` }
    const groups = ctx ? [['', all]] : [...today().map(m => [`Сегодня · ${m.a} — ${m.b} ${m.when === 'live' ? '· live' : m.when.replace(/^Сегодня,?\s*/, '')}`, all.filter(x => x.team === m.a || x.team === m.b)]), ['Ещё', all.filter(x => !matchOf(x))]].filter(([, xs]) => xs.length)
    el.className = 'w s5 s5q s5m-w'
    el.innerHTML = `<div class="s5m-hd"><b>${ctx ? `${ctx.a} — ${ctx.b}` : 'Замены'}</b>${left ? `<span class="s5m-hd__n">${left}</span>` : ''}</div>
      <div class="w-scroll"><div class="s5q-bd">${groups.map(([h, xs]) => (h ? `<div class="s5m__g">${h}</div>` : '') + xs.map(row).join('')).join('')}${all.length ? '' : '<div class="s5-empty">Замен нет</div>'}</div></div>
      <div class="s5q-ft"><button class="s5q-btn" data-find>${s.find === 1 ? 'Ищем…' : 'Найти'}</button><span>${s.find === 2 ? 'новых нет' : 'обновлено ' + D.asOf}</span></div>`
    const go = p => { Object.assign(s, p); renderMin(el, o) }
    el.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const i = +b.closest('[data-i]').dataset.i; go({ open: s.open === i ? null : i }) })
    el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { s.kind[s.open] = b.dataset.kind; renderMin(el, o) })
    el.querySelectorAll('[data-to]').forEach(b => b.onchange = () => { s.to[s.open] = b.value.split('-').reverse().slice(0, 2).join('.') })
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { s.st[s.open] = { ok: 1, kind: s.kind[s.open] || 'event', to: s.to[s.open] }; go({ open: null }) })
    el.querySelectorAll('[data-no]').forEach(b => b.onclick = () => { s.st[s.open] = { no: 1 }; go({ open: null }) })
    el.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { if (s.find === 1) return; go({ find: 1 }); setTimeout(() => go({ find: 2 }), 1200) })
  }

  // v11 (дирижёр 21.10): карточка = турнир → матчи дня с их заменами → замены без матча сегодня. Почти без цвета: важное — жирностью
  // и яркостью; цвет — только точка «проверить» и LIVE. Строка: крупно кто вышел играть, под ним «вместо … · поз.»; тег — надёжность источника.
  // Нажал — новость о замене и решение (срок, «Подтвердить / Отклонить»). o.v12 — сегмент «Новые · Подтверждённые · Отклонённые» сверху
  // и срок крупными карточками 2×2, кнопка «Подтвердить · на турнир» называет выбранный срок. Сегментов два: новые · проверенные.
  // o.v13 — только для решения: в строке кто пришёл / вместо кого · поз. (трансфер — кто ушёл → куда), тихо — тип «замена / трансфер»; раскрыл — надёжность + ссылка, срок карточками 2×2 (как v12),
  // «Подтвердить · на турнир / Отклонить». o.v14 — как v13, раскрытие на всю ширину (без отступа под логотипом); в «Проверенных»
  // видно решение, его можно изменить или «Вернуть в новые»
  // Надёжность — по правилу домена: офиц. (X / сайт команды) · СМИ (cybersport, gosugamers) · база (dota2.ru, Liquipedia)
  const rel = x => { const h = host(x); return /(^|\.)(x|twitter)\.com$/.test(h) ? ['офиц.', 'Сама команда — X или сайт'] : /cybersport|gosugamers|hltv/.test(h) ? ['СМИ', 'Новость в киберспортивном СМИ'] : ['база', 'Запись в базе турниров (dota2.ru, Liquipedia)'] }
  // v15: надёжность источника в процентах — из данных (rel) или по правилу домена: офиц. 95 · СМИ 75 · база 60
  const relPct = x => x.rel || { 'офиц.': 95, 'СМИ': 75, 'база': 60 }[rel(x)[0]]
  const relBadge = (x, box) => { const p = relPct(x); return `<span class="s5x__pct ${box ? 's5x__pct--box' : ''} ${p >= 80 ? 'is-hi' : p < 50 ? 'is-lo' : ''}" title="Надёжность источника">${p}%</span>` } // v16 — боксиком, как зоны
  const headline = (x, st) => st.ok ? `${x.in} заменил ${x.out} в ${x.team}` : st.no ? `Замена ${x.out} → ${x.in} не подтвердилась` : `${x.in} сыграет за ${x.team} вместо ${x.out}${x.event ? ' на ' + x.event : ''}`
  function renderMix(el, o) {
    const STEPS = ['база турниров…', 'СМИ…', 'X команд…'] // шаги «Найти новые»
    const s = o.s || (o.s = { open: null, st: {}, kind: {}, to: {}, find: 0, seg: 'new', found: [] })
    // «Найти новые» (v13): одна настоящая замена (D.later — Team Synapse) спрятана до поиска — поиск её находит; выдумывать нельзя
    const hidden = x => (o.v13 || o.v14) && (D.later || []).includes(x.team) && !s.found.includes(x.i)
    const ctx = o.match, every = (ctx ? subsOf(ctx) : D.subs.map((x, i) => ({ ...x, i }))).filter(x => !hidden(x)).sort((a, b) => when(b) - when(a))
    // Замена всегда под своим матчем — сегодняшним или ближайшим; турнир закончился — в «Новые» не попадает (в «Проверенных», «турнир завершён»)
    const dnum = w => { const r = /(\d\d)\.(\d\d)/.exec(w || ''); return r ? +(r[2] + r[1]) : null }, NOW = dnum(D.asOf)
    const ended = x => x.to && dnum(x.to) < NOW
    const ord = m => { const t = /(\d\d):(\d\d)/.exec(m.when); return m.when === 'live' ? 0 : /^Сегодня/.test(m.when) ? 1 + (t ? +t[1] / 100 : 0) : dnum(m.when) || 1e5 } // идущий → сегодня по времени → по дате
    const matchFor = x => today().find(m => m.a === x.team || m.b === x.team) || T.tours.flatMap(t => (t.matches || []).map(m => ({ ...m, tour: t.name })))
      .filter(m => (m.a === x.team || m.b === x.team) && dnum(m.when) >= NOW).sort((a, b) => dnum(a.when) - dnum(b.when))[0]
    const left = every.filter(x => !s.st[x.i] && !ended(x)).length
    // v12–v13: два сегмента сверху — новые · проверенные (подтверждённые и отклонённые); список — только выбранные
    const seg2 = o.v12 || o.v13 || o.v14, inSeg = x => s.seg === 'new' ? !s.st[x.i] && !ended(x) : !!s.st[x.i] || ended(x)
    const all = seg2 ? every.filter(inSeg) : every
    const row = x => { const st = s.st[x.i] || {}, open = s.open === x.i, [rt, rh] = rel(x)
      return `<div class="s5x ${open ? 'is-open' : ''} ${st.ok || st.no || ended(x) ? 'is-done' : ''}" data-i="${x.i}"><button class="s5x__r" data-tog>${logo(x.team, 's5-lg s5x__lg')}<span class="s5x__who"><b>${x.type === 'transfer' ? x.out : x.in}</b><span>${x.type === 'transfer' ? `ушёл${x.toTeam ? ' → ' + x.toTeam : ''}` : 'вместо ' + x.out}${x.pos ? ' · поз. ' + x.pos : ''}${(s.fresh || []).includes(x.i) ? ' · <em class="s5x-new">найдено сейчас</em>' : ''}</span></span>
          ${o.v16 && (st.ok || st.no) ? `<span class="s5x__dec ${st.ok ? 'is-ok' : 'is-no'}" title="${st.ok ? 'Подтверждено' : 'Отклонено'}">${st.ok ? ic.ok : '✕'}</span>` : st.ok ? `<span class="s5x__st">${ic.ok}</span>` : st.no ? '<span class="s5x__st">отклонено</span>' : ended(x) ? '<span class="s5x__st">завершён</span>' : `${o.v15 ? relBadge(x, o.v16) : o.v13 || o.v14 ? `<span class="s5x__tag">${x.type === 'transfer' ? 'трансфер' : 'замена'}</span>` : `<span class="s5x__tag" title="${rh}">${rt}</span>`}<i class="s5x__dot" title="Проверить"></i>`}</button>
        ${open && (o.v13 || o.v14) ? `<div class="s5z__x ${o.v14 ? 's5z__x--full' : ''}">${o.v14 && (st.ok || st.no) ? `<div class="s5z__was">${st.ok ? `Подтверждено · ${termsOf(x)[st.kind || defKind(x)][0].toLowerCase()}` : 'Отклонено'}<button class="s5z__back" data-back>Вернуть в новые</button></div>` : ''}<a class="s5z__src" href="${x.src}" target="_blank" rel="noopener"><b>${o.v15 ? relPct(x) + '% · ' : ''}${rt}</b> · ${host(x)} ↗</a>${o.v15 && x.text ? `<p class="s5z__txt">${x.text}</p>` : ''}
          ${termGrid(x)}
          <div class="s5z__act"><button class="s5z__b s5z__b--ok" data-ok>${o.v14 && (st.ok || st.no) ? 'Изменить на' : 'Подтвердить'} · ${termsOf(x)[curKind(x)][0].toLowerCase()}</button>${st.no ? '' : '<button class="s5z__b" data-no>Отклонить</button>'}</div></div>`
        : open ? `<div class="s5x__news"><div class="s5x__h">${headline(x, st)}</div>
          <div class="s5x__src"><span>${rt}</span><a href="${x.src}" target="_blank" rel="noopener">${host(x)} ↗</a><span>${x.from || ''}</span></div>
          <div class="s5x__kv"><span>позиция</span><b>${x.pos || 'не указана'}</b><span>срок</span><b>${x.to ? `${x.from} – ${x.to}` : 'не объявлен'}</b></div>
          ${o.v12 ? termGrid(x) : kindRow(x, s, 's5q-kind')}<div class="s5q-act ${o.v12 ? 's5y-act' : ''}"><button class="s5q-btn s5q-btn--pri" data-ok>Подтвердить${o.v12 && !st.ok ? ' · ' + TERM[s.kind[x.i] || 'event'][0].toLowerCase() : ''}</button><button class="s5q-btn" data-no>Отклонить</button></div></div>` : ''}</div>` }
    // v12: срок — четыре крупные карточки 2×2 с пояснением; «До даты» — с выбором даты
    const TERM = { forever: ['Навсегда', 'в основной состав'], event: ['На турнир', ''], date: ['До даты', 'выбрать дату'], pos: ['Смена позиции', 'внутри команды'] }
    // Уход / трансфер — свои варианты: ушёл (убрать из состава) · перешёл (в новую команду) · пауза (временно не играет)
    const TERM_T = { gone: ['Ушёл', 'убрать из состава'], moved: ['Перешёл', ''], pause: ['Пауза', 'временно не играет'] }
    const termsOf = x => x.type === 'transfer' ? TERM_T : TERM, defKind = x => x.type === 'transfer' ? (x.toTeam ? 'moved' : 'gone') : 'event'
    const curKind = x => s.kind[x.i] || (s.st[x.i] || {}).kind || defKind(x) // в «Проверенных» выбрано принятое решение
    const termGrid = x => { const k = curKind(x)
      return `<div class="s5y-lbl">${x.type === 'transfer' ? 'Что с игроком' : 'Срок замены'}</div><div class="s5y-terms ${x.type === 'transfer' ? 's5y-terms--3' : ''}">${Object.entries(termsOf(x)).map(([v, [t, d]]) => `<button class="s5y-term ${k === v ? 'is-on' : ''}" data-kind="${v}"><b>${t}</b><span>${v === 'event' ? x.event || 'этот турнир' : v === 'moved' ? (x.toTeam ? 'в ' + x.toTeam : 'в другую команду') : v === 'date' && k === 'date' && s.to[x.i] ? 'по ' + s.to[x.i] : d}</span></button>`).join('')}</div>${k === 'date' ? '<input class="s5-date s5q-date s5y-date" type="date" data-to>' : ''}` }
    // Группы всегда одной схемой: турнир → матчи дня с их заменами → замены без матча сегодня
    const evOf = x => { const m = matchFor(x); return m ? m.tour : x.event || 'Без турнира' }
    const groups = []; all.forEach(x => { const ev = ctx ? '' : evOf(x); let g = groups.find(g => g.ev === ev); if (!g) groups.push(g = { ev, xs: [] }); g.xs.push(x) })
    const span = xs => { const f = xs.map(x => x.from).filter(Boolean).sort((a, b) => when({ from: a }) - when({ from: b })), t = xs.map(x => x.to).filter(Boolean).sort((a, b) => when({ from: a }) - when({ from: b })); return f.length ? f[0] + (t.length ? '–' + t[t.length - 1] : '') : '' }
    const mLine = m => `<div class="s5x-ml">${logo(m.a, 's5-lg s5x-mlg')}<span>${m.a}</span><span class="s5x-vs">—</span>${logo(m.b, 's5-lg s5x-mlg')}<span>${m.b}</span><span class="s5x-when">${m.when === 'live' ? '<i class="s5x-live">LIVE</i>' : m.when.replace(/^Сегодня,?\s*/, '')}</span></div>`
    const body = g => { const ms = ctx ? [ctx] : [...new Map(g.xs.map(matchFor).filter(Boolean).map(m => [m.a + m.b + m.when, m])).values()].sort((a, b) => ord(a) - ord(b)), inM = x => ms.some(m => x.team === m.a || x.team === m.b)
      return ms.map(m => mLine(m) + g.xs.filter(x => x.team === m.a || x.team === m.b).map(row).join('')).join('')
        + (g.xs.some(x => !inM(x)) ? '<div class="s5x-ml s5x-ml--none">турнир завершён</div>' : '') + g.xs.filter(x => !inM(x)).map(row).join('') }
    const top0 = (el.querySelector('.w-scroll') || {}).scrollTop || 0 // перерисовка не должна сбрасывать прокрутку
    el.className = 'w s5 s5q s5x-w' + (o.v12 ? ' s5y' : '') + (o.v13 || o.v14 ? ' s5y s5z' : '') + (o.v17 ? ' s5e' : '') // v17 — ровные скругления, единые кнопки
      + (o.v17 && s.hid ? ' is-hid' : '') // v17: при скролле вниз шапка и низ сжаты
    const cnt = v => every.filter(x => v === 'new' ? !s.st[x.i] && !ended(x) : !!s.st[x.i] || ended(x)).length
    const seg = seg2 ? `<div class="s5y-seg">${[['new', 'Новые'], ['done', 'Проверенные']].map(([v, l]) => `<button class="${s.seg === v ? 'is-on' : ''}" data-seg="${v}">${l}<i>${cnt(v)}</i></button>`).join('')}</div>` : ''
    el.innerHTML = `<div class="s5x-hd"><b>${ctx ? 'Замены в матче' : 'Замены'}</b><span>${left ? `${left} ждут проверки` : 'всё проверено'}</span></div>${seg}
      <div class="w-scroll"><div class="s5q-bd">${groups.map(g => `<section class="s5x-g">${g.ev ? `<div class="s5x-t"><b>${g.ev}</b><span>${span(g.xs)}</span></div>` : ''}${body(g)}</section>`).join('')}${all.length ? '' : `<div class="s5-empty">${seg2 && s.seg !== 'new' ? 'Пока пусто' : seg2 ? 'Всё проверено' : 'Замен нет'}</div>`}</div></div>
      <div class="s5q-ft"><button class="s5q-btn" data-find>${s.find === 1 ? 'Ищем…' : 'Найти новые'}</button><span class="s5x-find">${s.find === 1 ? STEPS[s.step || 0] : s.find === 2 ? (s.got ? `найдено: ${s.got}` : 'новых нет') + (o.v16 ? ' · обновлено только что' : '') : o.v16 ? `обновлено сегодня в ${D.at || '—'}` : 'обновлено ' + D.asOf}</span></div>`
    const go = p => { Object.assign(s, p); renderMix(el, o) }
    // Раскрыл замену — её новость плавно подъезжает к верху списка
    const sc = el.querySelector('.w-scroll'); sc.scrollTop = top0
    // v17: скролл вниз — шапка «Замены» и низ «Найти новые» сжимаются в ноль; скролл вверх или самый верх — появляются обе
    // Без мерцания: сжатие само сдвигает прокрутку (у низа списка браузер подрезает scrollTop) — пока идёт анимация (≈320 мс), события
    // скролла не считаем; направление решает накопленный сдвиг от 12 px, а не каждый шаг
    if (o.v17) { let last = sc.scrollTop, acc = 0, lock = 0
      const set = h => { if (h === !!s.hid) return; s.hid = h; el.classList.toggle('is-hid', h); lock = performance.now() + 320; acc = 0 }
      sc.onscroll = () => { const y = sc.scrollTop; if (performance.now() < lock) { last = y; return }
        const d = y - last; last = y
        if (y <= 0) return set(false)
        acc = Math.sign(d) === Math.sign(acc) ? acc + d : d
        if (acc > 12) set(true); else if (acc < -12) set(false) } }
    if (s.jump != null) { const it = sc.querySelector(`[data-i="${s.jump}"]`); s.jump = null
      // доскролл своей анимацией (≈350 мс, мягкое замедление) со следующего кадра — встроенный smooth после перерисовки срабатывал скачком
      if (it) requestAnimationFrame(() => { const z = sc.getBoundingClientRect().height / sc.offsetHeight || 1, from = sc.scrollTop
        const to = Math.min(sc.scrollHeight - sc.clientHeight, from + (it.getBoundingClientRect().top - sc.getBoundingClientRect().top) / z - 8), t0 = performance.now()
        const step = t => { const k = Math.min(1, (t - t0) / 350), e = 1 - Math.pow(1 - k, 3); sc.scrollTop = from + (to - from) * e; if (k < 1) requestAnimationFrame(step) }
        requestAnimationFrame(step) }) }
    el.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const i = +b.closest('[data-i]').dataset.i; go(s.open === i ? { open: null } : { open: i, jump: i }) })
    el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { s.kind[s.open] = b.dataset.kind; renderMix(el, o) })
    el.querySelectorAll('[data-seg]').forEach(b => b.onclick = () => { s.seg = b.dataset.seg; s.open = null; renderMix(el, o) })
    el.querySelectorAll('[data-to]').forEach(b => b.onchange = () => { s.to[s.open] = b.value.split('-').reverse().slice(0, 2).join('.'); if (o.v12) renderMix(el, o) })
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { const x = every.find(y => y.i === s.open); s.st[s.open] = { ok: 1, kind: curKind(x), to: s.to[s.open] }; go({ open: null }) })
    el.querySelectorAll('[data-no]').forEach(b => b.onclick = () => { s.st[s.open] = { no: 1 }; go({ open: null }) })
    el.querySelectorAll('[data-back]').forEach(b => b.onclick = () => { delete s.st[s.open]; go({ open: null }) }) // v14: решение можно отменить
    // Поиск по шагам: база турниров → СМИ → X команд; спрятанное находится, повторный поиск — «новых нет»
    el.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { if (s.find === 1) return
      const add = o.v13 || o.v14 ? D.subs.map((x, i) => ({ ...x, i })).filter(x => hidden(x)) : []
      go({ find: 1, step: 0 }); setTimeout(() => go({ step: 1 }), 600); setTimeout(() => go({ step: 2 }), 1200)
      setTimeout(() => { s.found.push(...add.map(x => x.i)); s.fresh = add.map(x => x.i); go({ find: 2, got: add.length, seg: 'new' }) }, 1800) })
  }

  function renderLook(el, o) {
    const s = o.s || (o.s = { open: null, st: {}, kind: {}, to: {}, find: 0 }), look = o.look
    const ctx = o.match, ms = ctx ? [ctx] : today()
    const xs = (ctx ? subsOf(ctx) : D.subs.map((x, i) => ({ ...x, i }))).sort((a, b) => when(b) - when(a)) // свежие сверху
    const left = xs.filter(x => !(s.st[x.i] || {}).ok && !(s.st[x.i] || {}).no).length
    const title = ctx ? `Замены · ${ctx.a} — ${ctx.b}` : 'Замены · лента'
    const head = `<div class="s5q-hd s5q-hd--${look}"><b>${title}</b><span class="s5q-hd__c">${left} не проверено</span></div>`
    const thead = look === 'log' ? '<div class="s5l__th"><span>дата</span><span></span><span>поз</span><span>вне → вместо</span><span></span></div>' : ''
    const foot = `<div class="s5q-ft s5q-ft--${look}"><button class="s5q-btn" data-find>${s.find === 1 ? 'Ищем…' : 'Найти'}</button><span>${s.find === 2 ? 'новых нет · только что' : 'обновлено ' + D.asOf}</span></div>`
    el.className = 'w s5 s5q s5q--' + (look === 'mlog' || look === 'diff' ? 'term' : look)
    const rowsOf = look === 'mlog' ? byMatch(xs, ctx).map(([m, a]) => (m ? `<div class="s5g">▸ ${m === 'rest' ? 'без матча сегодня' : `${m.a} — ${m.b} · ${m.when === 'live' ? 'live' : m.when.replace(/^Сегодня,?\s*/, '')}`}</div>` : '') + a.map(x => looks.term(x, s)).join('')).join('') : xs.map(x => looks[look](x, s)).join('')
    el.innerHTML = head + thead + `<div class="w-scroll"><div class="s5q-bd">${xs.length ? rowsOf : '<div class="s5-empty">Замен нет</div>'}</div></div>` + foot
    const go = p => { Object.assign(s, p); renderLook(el, o) }
    el.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const i = +b.closest('[data-i]').dataset.i; go({ open: s.open === i ? null : i }) })
    el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { s.kind[s.open] = b.dataset.kind; renderLook(el, o) })
    el.querySelectorAll('[data-to]').forEach(b => b.onchange = () => { s.to[s.open] = b.value.split('-').reverse().slice(0, 2).join('.') })
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { s.st[s.open] = { ok: 1, kind: s.kind[s.open] || 'event', to: s.to[s.open] }; go({ open: null }) })
    el.querySelectorAll('[data-no]').forEach(b => b.onclick = () => { s.st[s.open] = { no: 1 }; go({ open: null }) })
    el.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => { const i = +b.closest('[data-i]').dataset.i; s.st[i] = b.dataset.quick === 'ok' ? { ok: 1, kind: s.kind[i] || 'event' } : { no: 1 }; renderLook(el, o) })
    el.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { if (s.find === 1) return; go({ find: 1 }); setTimeout(() => go({ find: 2 }), 1200) })
  }

  // ——— v5 «Входящие»: пришла замена → глянул → «Норм» / «Не норм» в один клик; сомневаешься — «Подробнее» (экран проверки) ———
  // «Норм» — подтвердить на турнир (срок по умолчанию); срок другой — в «Подробнее». Проверенные — ниже, одной строкой
  function renderInbox(el, o) {
    const s = o.s || (o.s = { st: {}, kind: {}, to: {}, find: 0, det: null })
    const ctx = o.match, all = (ctx ? subsOf(ctx) : D.subs.map((x, i) => ({ ...x, i }))).sort((a, b) => when(b) - when(a))
    const fresh = all.filter(x => !s.st[x.i]), done = all.filter(x => s.st[x.i])
    const go = p => { Object.assign(s, p); renderInbox(el, o) }
    const L = (n, c = 's5-lg s5i-lg') => logo(n, c)
    el.className = 'w s5 s5i'
    if (s.det != null) { // экран проверки одной замены
      const x = all.find(y => y.i === s.det), m = matchOf(x), k = s.kind[x.i] || 'event'
      el.innerHTML = `<div class="s5i-hd"><button class="s5i-back" data-back>${ic.arr}Назад</button></div>
        <div class="w-scroll"><div class="s5i-det">
          <div class="s5i-team">${L(x.team, 's5-lg s5i-lg--32')}<b>${x.team}</b></div>
          <div class="s5i-swap"><span class="s5i-pos">поз. ${x.pos || '?'}</span><span class="s5i-out">${x.out}</span>${ic.arr}<b>${x.in}</b></div>
          <dl class="s5i-kv"><dt>Где</dt><dd>${m ? `${m.a} — ${m.b}, ${m.when === 'live' ? 'идёт' : m.when.toLowerCase()}` : x.event || '—'}</dd>
            <dt>С</dt><dd>${x.from || '—'}${x.to ? ' по ' + x.to : ' · срок не объявлен'}</dd>
            <dt>Источник</dt><dd><a href="${x.src}" target="_blank" rel="noopener">${host(x)} ${ic.link}</a></dd></dl>
          <div class="s5i-lbl">Срок замены</div>${kindRow(x, s, 's5q-kind')}
        </div></div>
        <div class="s5i-ft"><button class="s5i-b s5i-b--ok" data-dok>Норм</button><button class="s5i-b" data-dno>Не норм</button></div>`
      el.querySelector('[data-back]').onclick = () => go({ det: null })
      el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { s.kind[x.i] = b.dataset.kind; renderInbox(el, o) })
      el.querySelectorAll('[data-to]').forEach(b => b.onchange = () => { s.to[x.i] = b.value.split('-').reverse().slice(0, 2).join('.') })
      el.querySelector('[data-dok]').onclick = () => { s.st[x.i] = { ok: 1, kind: k, to: s.to[x.i] }; go({ det: null }) }
      el.querySelector('[data-dno]').onclick = () => { s.st[x.i] = { no: 1 }; go({ det: null }) }
      return }
    const card = x => { const m = matchOf(x)
      return `<div class="s5i-c" data-i="${x.i}"><div class="s5i-c__top">${L(x.team)}<b class="s5i-c__tm">${x.team}</b><span class="s5i-c__m">${x.from || ''} · ${host(x)}</span></div>
        <div class="s5i-swap"><span class="s5i-pos">поз. ${x.pos || '?'}</span><span class="s5i-out">${x.out}</span>${ic.arr}<b>${x.in}</b></div>
        ${m ? `<div class="s5i-c__where">${m.when === 'live' ? 'идёт матч' : 'матч ' + m.when.toLowerCase()} · ${m.a} — ${m.b}</div>` : ''}
        <div class="s5i-c__act"><button class="s5i-b s5i-b--ok" data-q="ok">Норм</button><button class="s5i-b" data-q="no">Не норм</button><button class="s5i-more" data-det>Подробнее ›</button></div></div>` }
    const doneRow = x => { const st = s.st[x.i]
      return `<div class="s5i-d ${st.ok ? 'is-ok' : 'is-no'}" data-i="${x.i}">${L(x.team, 's5-lg s5-lg--16')}<span class="s5i-d__x"><span class="s5i-out">${x.out}</span> → ${x.in}</span><span class="s5i-d__st">${st.ok ? ic.ok + (st.kind === 'pos' ? 'смена поз.' : st.kind === 'forever' ? 'навсегда' : st.kind === 'date' ? 'до ' + (st.to || x.to || '…') : 'на турнир') : 'отклонено'}</span><button class="s5i-undo" data-undo title="Вернуть во входящие">↺</button></div>` }
    el.innerHTML = `<div class="s5i-hd"><b>${ctx ? `Замены · ${ctx.a} — ${ctx.b}` : 'Замены'}</b>${fresh.length ? `<span class="s5i-new">${fresh.length} новых</span>` : '<span class="s5i-zero">всё проверено</span>'}</div>
      <div class="w-scroll"><div class="s5i-bd">${fresh.map(card).join('')}${done.length ? `<div class="s5i-sec">Проверено · ${done.length}</div>${done.map(doneRow).join('')}` : ''}${all.length ? '' : '<div class="s5-empty">Замен нет</div>'}</div></div>
      <div class="s5i-ft s5i-ft--list"><button class="s5i-b" data-find>${s.find === 1 ? 'Ищем…' : 'Найти новые'}</button><span>${s.find === 2 ? 'новых нет · только что' : 'обновлено ' + D.asOf}</span></div>`
    el.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const i = +b.closest('[data-i]').dataset.i; s.st[i] = b.dataset.q === 'ok' ? { ok: 1, kind: 'event' } : { no: 1 }; renderInbox(el, o) })
    el.querySelectorAll('[data-det]').forEach(b => b.onclick = () => go({ det: +b.closest('[data-i]').dataset.i }))
    el.querySelectorAll('[data-undo]').forEach(b => b.onclick = () => { delete s.st[+b.closest('[data-i]').dataset.i]; renderInbox(el, o) })
    el.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { if (s.find === 1) return; go({ find: 1 }); setTimeout(() => go({ find: 2 }), 1200) })
  }

  function render(el, o) {
    if (o.look === 'inbox') return renderInbox(el, o)
    if (o.look === 'queue') return renderQueue(el, o)
    if (o.look === 'news') return renderNews(el, o)
    if (o.look === 'min') return renderMin(el, o)
    if (o.look === 'mix') return renderMix(el, o)
    if (o.look) return renderLook(el, o)
    const s = o.s || (o.s = { open: null, st: {}, kind: {}, to: {}, find: 0 })
    const ctx = o.match, ms = ctx ? [{ ...ctx, when: ctx.when || 'live' }] : today()
    const groups = ms.map(m => [m, subsOf(m)]).filter(([, xs]) => xs.length)
    const other = ctx ? [] : rest(ms)
    if (other.length) groups.push([null, other])
    const left = groups.flatMap(([, xs]) => xs).filter(x => !(s.st[x.i] || {}).ok && !(s.st[x.i] || {}).no).length
    const head = `<div class="s5-hd"><span class="s5-hd__t"><b>${ctx ? 'Замены в матче' : 'Замены · сегодня'}</b>${ctx ? `<span class="s5-cap">${ctx.a} — ${ctx.b}</span>` : ''}</span>${left ? `<span class="s5-cnt">${left}</span>` : ''}</div>`
    const list = groups.length ? groups.map(([m, xs]) => (ctx ? '' : m ? matchHead(m, xs.length) : '<div class="s5-m s5-m--rest">Без матча сегодня</div>') + xs.map(x => row(x, s)).join('')).join('') : '<div class="s5-empty">Замен нет</div>'
    const foot = `<div class="s5-ft"><button class="s5-btn s5-find ${s.find === 1 ? 'is-busy' : ''}" data-find>${ic.find}${s.find === 1 ? 'Ищем…' : 'Найти'}</button><span class="s5-cap">${s.find === 2 ? 'Новых замен нет · только что' : 'Проверено ' + D.asOf}</span></div>`
    el.className = 'w s5'
    el.innerHTML = head + `<div class="w-scroll"><div class="s5-bd">${list}</div></div>` + foot
    const go = p => { Object.assign(s, p); render(el, o) }
    el.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const i = +b.closest('[data-i]').dataset.i; go({ open: s.open === i ? null : i }) })
    el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { s.kind[s.open] = b.dataset.kind; render(el, o) })
    el.querySelectorAll('[data-to]').forEach(b => b.onchange = () => { s.to[s.open] = b.value.split('-').reverse().slice(0, 2).join('.') })
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { s.st[s.open] = { ok: 1, kind: s.kind[s.open] || 'event', to: s.to[s.open] }; go({ open: null }) })
    el.querySelectorAll('[data-no]').forEach(b => b.onclick = () => { s.st[s.open] = { no: 1 }; go({ open: null }) })
    // «Найти» — механика ищет новые замены (в лабе — поиск без новых результатов: данные настоящие, выдумывать нельзя)
    el.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { if (s.find === 1) return; go({ find: 1 }); setTimeout(() => go({ find: 2 }), 1200) })
  }
  window.S5 = { render, today, subsOf }
})()
