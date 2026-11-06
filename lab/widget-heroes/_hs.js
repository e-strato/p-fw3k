// Статистика героев турнира (созвон 02.11 §2.5) — отдельный блок для лабы: HS.render(el, { phone, reset }).
// Все герои (../gs-tournament/_heroes-full.js, Liquipedia 02.11), группы колонок через линии, сортировка по клику на заголовок.
// Ширина колонок не меняется: таблица с фиксированной раскладкой, место под стрелку сортировки есть у каждого заголовка.
// reset: 'btn' — «Сбросить сортировку» под таблицей · 'chip' — над таблицей «Сортировка: … ×»; третье нажатие на тот же заголовок — сброс.
window.HS = (() => {
  const D = window.TN_HEROES, G = D.games, HB = '../gs-match/img/heroes/'
  const pct = (a, b) => (b ? Math.round(a / b * 100) + '%' : '—')
  const tone = (w, n) => { if (!n) return ''; const d = w / n - 0.5; return d >= 0.2 ? 'w2' : d > 0 ? 'w1' : d <= -0.2 ? 'l2' : d < 0 ? 'l1' : '' }
  const heat = (w, n) => (n ? `<span class="wrh ${tone(w, n)}">${pct(w, n)}</span>` : '<span class="wrh mut">—</span>')
  // колонки: ключ, заголовок, группа, значение для сортировки, ячейка
  const C = [
    ['p', 'Всего', 'Пики', (h) => h.p, (h) => `<b>${h.p}</b>`, 1], ['pv', 'В–П', 'Пики', (h) => h.pw, (h) => `${h.pw}–${h.p - h.pw}`], ['pwr', 'WR', 'Пики', (h) => (h.p ? h.pw / h.p : -1), (h) => heat(h.pw, h.p)], ['pt', '% игр', 'Пики', (h) => h.p, (h) => `<span class="mut">${pct(h.p, G)}</span>`],
    ['r', 'Всего', 'Radiant', (h) => h.rd[0], (h) => `<b>${h.rd[0]}</b>`, 1], ['rv', 'В–П', 'Radiant', (h) => h.rd[1], (h) => `${h.rd[1]}–${h.rd[2]}`], ['rwr', 'WR', 'Radiant', (h) => (h.rd[0] ? h.rd[1] / h.rd[0] : -1), (h) => heat(h.rd[1], h.rd[0])],
    ['d', 'Всего', 'Dire', (h) => h.dr[0], (h) => `<b>${h.dr[0]}</b>`, 1], ['dv', 'В–П', 'Dire', (h) => h.dr[1], (h) => `${h.dr[1]}–${h.dr[2]}`], ['dwr', 'WR', 'Dire', (h) => (h.dr[0] ? h.dr[1] / h.dr[0] : -1), (h) => heat(h.dr[1], h.dr[0])],
    ['b', 'Всего', 'Баны', (h) => h.b, (h) => `<b>${h.b}</b>`, 1], ['bt', '% игр', 'Баны', (h) => h.b, (h) => `<span class="mut">${pct(h.b, G)}</span>`],
    ['pb', 'Всего', 'Пик + бан', (h) => h.pb, (h) => `<b>${h.pb}</b>`, 1], ['pbt', '% игр', 'Пик + бан', (h) => h.pb, (h) => `<span class="mut">${pct(h.pb, G)}</span>`],
  ]
  const GROUPS = ['Пики', 'Radiant', 'Dire', 'Баны', 'Пик + бан']
  // телефон: группа сегментом, колонки — только этой группы
  const PH = { p: 'Пики', r: 'Radiant', d: 'Dire', b: 'Баны' }
  const DEF = { k: 'pb', d: -1 }
  const S = { k: DEF.k, d: DEF.d, g: 'p' }
  const isDef = () => S.k === DEF.k && S.d === DEF.d
  const colName = (k) => { if (k === 'n') return 'Герой'; const c = C.find((x) => x[0] === k); return `${c[2]} · ${c[1]}` }
  const sorted = () => { const c = C.find((x) => x[0] === S.k), f = c ? c[3] : null
    return [...D.list].sort((a, b) => (S.k === 'n' ? S.d * a.n.localeCompare(b.n) : S.d * (f(a) - f(b))) || b.pb - a.pb) }
  const arrow = (k) => `<i class="ar${S.k === k ? ' is-on' : ''}">${S.k === k && S.d > 0 ? '↑' : '↓'}</i>`
  const th = (k, t, cls = '') => `<th class="srt ${cls}${S.k === k ? ' is-on' : ''}" data-hs="${k}"><span>${t}${arrow(k)}</span></th>`
  function render(el, o = {}) {
    el.classList.toggle('is-phone', !!o.phone)
    // w-hero-stats (HSW_D, дирижёр 06.11: «чтобы помещалась на страницу — убрать лишнее, поуже»), только компьютер:
    // seg — группы колонок переключателем, как на телефоне · min — узко: пики, WR, баны, пик + бан (стороны убраны) · cols — узко, в две колонки · scroll — узко, все герои в окне фиксированной высоты
    // seg / min / cols — сначала 10 (cols — 20) героев, «Все герои» раскрывает
    // full — все колонки, но уже: таблица целиком помещается по ширине; сначала 10, «Все герои» раскрывает · fullscroll — все колонки, все герои в окне с прокруткой (дирижёр 06.11: «всю статистику помещать»)
    const DM = !o.phone && window.HSW_D, SEGL = o.phone || DM === 'seg', MIN = DM === 'min' || DM === 'cols' || DM === 'scroll'
    el.classList.toggle('hsw-d', !!DM); if (DM) el.dataset.hswd = DM
    const cols = SEGL ? C.filter((c) => c[2] === (PH[S.g] || 'Пики')) : MIN ? ['p', 'pwr', 'b', 'pb'].map((k) => C.find((c) => c[0] === k)) : C
    const FULL = DM === 'full' || DM === 'fullscroll', L0 = sorted(), LIM = DM && DM !== 'scroll' && DM !== 'fullscroll' && !S.all ? (DM === 'cols' ? 20 : 10) : 0, L = LIM ? L0.slice(0, LIM) : L0
    const NAMES = { p: 'Пики', pwr: 'WR', b: 'Баны', pb: 'Пик + бан' }, hdr = (c) => (MIN ? NAMES[c[0]] : c[1])
    const more = DM && DM !== 'scroll' && DM !== 'fullscroll' && L0.length > (DM === 'cols' ? 20 : 10) ? `<button data-all class="hsw-all">${S.all ? 'Свернуть' : `Все герои · ${L0.length}`}</button>` : ''
    const body = (rows, off = 0) => `<table class="hsw-t">
        <colgroup><col class="c-k"><col class="c-h${S.k === 'n' ? ' is-sort' : ''}">${cols.map((c) => `<col class="c-${c[0].endsWith('wr') ? 'wr' : 'n'}${S.k === c[0] ? ' is-sort' : ''}">`).join('')}</colgroup>
        <thead><tr><th class="k">#</th>${th('n', 'Герой', 'h')}${cols.map((c) => th(c[0], hdr(c), '')).join('')}</tr></thead>
        <tbody>${rows.map((h, i) => `<tr><td class="k mut">${off + i + 1}</td><td class="h"><span class="hero"><img src="${HB}${h.k}.png" alt="" loading="lazy" onerror="this.style.visibility='hidden'">${h.n}</span></td>${cols.map((c) => `<td class="${S.k === c[0] ? 'is-sc' : ''}">${c[4](h)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    if (DM && DM !== 'seg' && !FULL) { const h2 = Math.ceil(L.length / 2)
      el.innerHTML = `<div class="w hsw${o.nice ? ' hsw--nice' : ''}"><div class="w-hd"><span class="w-hd__t">Статистика героев</span><span class="hsw-sub">${D.sub}</span></div>
        <div class="hsw-box hsw-box--${DM}">${DM === 'cols' ? `<div class="hsw-2">${body(L.slice(0, h2))}${body(L.slice(h2), h2)}</div>` : body(L)}</div>${more}</div>`
      el.onclick = click(el, o); return }
    const chip = o.reset === 'chip' ? `<div class="hsw-chip${isDef() ? '' : ' is-on'}"><span>Сортировка: <b>${colName(S.k)} ${S.d > 0 ? '↑' : '↓'}</b></span>${isDef() ? '' : '<button data-reset aria-label="Сбросить сортировку">× Сбросить</button>'}</div>` : ''
    const seg = SEGL ? `<div class="hsw-seg">${Object.entries(PH).map(([k, n]) => `<button data-g="${k}" class="${S.g === k ? 'is-on' : ''}">${n}</button>`).join('')}</div>` : ''
    el.innerHTML = `<div class="w hsw${o.nice ? ' hsw--nice' : ''}${o.dim ? ' hsw--dim' : ''}${o.sortHi ? ' hsw--sorthi' : ''}"><div class="w-hd"><span class="w-hd__t">Статистика героев</span><span class="hsw-sub">${D.sub}</span>${o.reset === 'corner' ? `<button data-reset class="hsw-rc"${isDef() ? ' disabled' : ''} title="Сбросить сортировку"><svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6a3.5 3.5 0 1 0 1-2.5M2.5 1.8v1.9h1.9"/></svg>Сбросить</button>` : ''}</div>${seg}${chip}
      <div class="hsw-box"><table class="hsw-t">
        <colgroup><col class="c-k"><col class="c-h${S.k === 'n' ? ' is-sort' : ''}">${cols.map((c) => `<col class="c-${c[0].endsWith('wr') ? 'wr' : 'n'}${S.k === c[0] ? ' is-sort' : ''}">`).join('')}</colgroup>
        <thead>${SEGL ? '' : `<tr class="grp"><th></th><th></th>${GROUPS.map((g) => `<th class="gs" colspan="${C.filter((c) => c[2] === g).length}">${g}</th>`).join('')}</tr>`}
        <tr><th class="k">#</th>${th('n', 'Герой', 'h')}${cols.map((c) => th(c[0], c[1], c[5] ? 'gs' : '')).join('')}</tr></thead>
        <tbody>${L.map((h, i) => `<tr><td class="k mut">${i + 1}</td><td class="h"><span class="hero"><img src="${HB}${h.k}.png" alt="" loading="lazy" onerror="this.style.visibility='hidden'">${h.n}</span></td>${cols.map((c) => `<td class="${c[5] ? 'gs' : ''}${S.k === c[0] ? ' is-sc' : ''}">${c[4](h)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      ${more}<div class="hsw-ft"><span class="mut">Героев: ${L0.length} · нажми на заголовок — сортировка${o.reset === 'chip' ? ', третье нажатие — сброс' : ''}</span>${o.reset === 'btn' ? `<button data-reset class="hsw-reset"${isDef() ? ' disabled' : ''}>Сбросить сортировку</button>` : ''}</div></div>`
    // v3: наведение — подсвечены строка и колонка
    if (o.nice) { const t = el.querySelector('.hsw-t'), cs = t.querySelectorAll('col')
      t.onpointerover = (e) => { const c = e.target.closest('td, th'); if (!c || e.pointerType !== 'mouse') return; const tr = c.parentElement
        t.querySelectorAll('.is-hr').forEach((x) => x.classList.remove('is-hr')); cs.forEach((x) => x.classList.remove('is-hc'))
        if (tr.parentElement.tagName === 'TBODY') tr.classList.add('is-hr')
        if (tr.parentElement.tagName === 'TBODY' || !tr.classList.contains('grp')) { const i = [...tr.children].indexOf(c); if (i > 1) cs[i]?.classList.add('is-hc')
          // v4 (dim): как в «Игроках по позициям» — остальные строки тише; ячейки наведённой колонки — чуть ярче остальных
          if (o.dim) { t.dataset.hc = i > 1 ? i : ''; t.querySelectorAll('td.is-cc').forEach((x) => x.classList.remove('is-cc')); if (i > 1) t.querySelectorAll(`tbody tr > :nth-child(${i + 1})`).forEach((x) => x.classList.add('is-cc')) } } }
      t.onpointerleave = () => { t.querySelectorAll('.is-hr, .is-cc').forEach((x) => x.classList.remove('is-hr', 'is-cc')); cs.forEach((x) => x.classList.remove('is-hc')) } }
    el.onclick = click(el, o)
  }
  const click = (el, o) => (e) => { if (e.target.closest('[data-reset], [data-g], [data-hs], [data-all]')) e.stopPropagation()
      if (e.target.closest('[data-all]')) { S.all = !S.all; return keep(el, o) } // на странице турнира у _ours.js свои data-g / data-hs
      const r = e.target.closest('[data-reset]'); if (r) { S.k = DEF.k; S.d = DEF.d; return keep(el, o) }
      const g = e.target.closest('[data-g]'); if (g) { S.g = g.dataset.g; return keep(el, o) }
      const t = e.target.closest('[data-hs]'); if (!t) return
      const k = t.dataset.hs, first = k === 'n' ? 1 : -1
      if (S.k !== k) { S.k = k; S.d = first } else if (o.reset === 'chip' && S.d === -first) { S.k = DEF.k; S.d = DEF.d } else S.d = -S.d
      keep(el, o) }
  // перерисовать, сохранив прокрутку таблицы
  function keep(el, o) { const b = el.querySelector('.hsw-box'), x = b ? b.scrollLeft : 0, y = b ? b.scrollTop : 0; render(el, o); const n = el.querySelector('.hsw-box'); if (n) { n.scrollLeft = x; n.scrollTop = y } }
  return { render }
})()
