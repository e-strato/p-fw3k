// Лаба gs-upgrade · страница турнира v2 (10.11) — доработки к gs-tournament/v46 по сравнению с аналитиками (D2PT, OpenDota, Dotabuff, Spectral;
// внутренняя документация/figma-разбор/14-аналитика/analysis/tournament.md, «Что добавить»). Страница v46 не тронута: _ours.js рисует #main как раньше,
// здесь после каждой его перерисовки встают новые блоки (как виджеты в v46):
//   1. Сводка меты плитками · 2. Сетка плей-офф (double elimination) · 3. Серии турнира с драфтом по картам · 4. Рекорды за карту и заметные матчи ·
//   5. Статистика игроков (сортировка, позиция) · 6. Статистика героев с фильтрами (сторона, 1-й / 2-й пик) и «вне меты» · 7. Статы команд в карточках «Участников» ·
//   телефон — групповой этап переключателем «Таблица / Каждый с каждым» (не уходит за край), имена героев целиком.
// Данные: турнир, команды, матчи — общая база (../_db, window.DB); карты (стороны, убийства, длительность, драфт, игроки) — _upt-data.js (настоящее, OpenDota).
// ‼️ Пример — только «Линии» у игроков (выигранные линии: в снимках OpenDota исхода лайнинга нет) и TBD-слоты сетки TI после «сейчас».
window.UPT = (() => {
  const DB = window.DB, D = DB.data, T = window.DB_TOUR || 'ti-2026', TOUR = D.tours[T], U = (window.UPT_DATA || {})[T] || {}
  const EP7 = T === 'universe-ep7', HB = '../gs-match/img/heroes/', MATCH = '../gs-match-2/v84-gold.html?fit=1'
  const $ = (s, r = document) => r.querySelector(s)
  // v13–v16 (window.UPT_OPT, дирижёр 10.11): без плей-офф (начальник: только групповой этап), без «Вне меты / Только в банах»,
  // таблицы без скролла — 25 строк на компе, 10 на телефоне, дальше «Показать ещё»; мета и рекорды — одним блоком, вид — UPT_OPT.mr: one | list | tabs | two
  const O = window.UPT_OPT || null, LIM = { pl: false, hs: false }
  const lim = () => (phone() ? 10 : 15)   // дирижёр 10.11: «ограничим 15, не 25, во всех таблицах»
  const cut = (k, L) => (!O || LIM[k] ? L : L.slice(0, lim()))
  const more = (k, L) => (!O || LIM[k] || L.length <= lim() ? '' : `<button class="upt-more" data-u="more" data-v="${k}">Показать ещё ${L.length - lim()}</button>`)
  const phone = () => !document.body.classList.contains('is-desk')
  const S = { br: null, ss: 'all', st: '', open: {}, ps: 'pts', psd: -1, pos: 0, min: false, pg: 'f', hs: 'pb', hsd: -1, side: 'all', fp: 'all', gv: 't' }

  // ——— данные: матчи турнира и карты ———
  const M = DB.matches({ tour: T })
  const MAPS = []; for (const m of M) (m.maps || []).forEach((mp, i) => { const x = U[mp.id]; if (x) MAPS.push({ ...x, id: mp.id, m, n: i + 1 }) })
  const NOW = DB.now()
  const nm = (id, k = 'mid') => DB.name(id, k), lg = (id, c = '') => `<img class="upt-lg ${c}" src="${DB.logo(id)}" alt="" />`
  const hn = (k) => DB.hero(k)?.name || k, hi = (k, c = '') => `<img class="upt-hi ${c}" src="${HB}${k}.png" alt="${hn(k)}" title="${hn(k)}" loading="lazy" onerror="this.style.visibility='hidden'" />`
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
  const dm = (iso) => iso.slice(8, 10) + '.' + iso.slice(5, 7), hm = (iso) => iso.slice(11, 16)
  const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], wd = (iso) => WD[new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).getUTCDay()]
  const today = (iso) => new Date(NOW + 3 * 3600e3).toISOString().slice(0, 10) === iso.slice(0, 10)
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
  const fx = (v, n = 1) => (Math.round(v * 10 ** n) / 10 ** n).toFixed(n).replace('.', ',')
  const k1 = (v) => (v >= 1000 ? fx(v / 1000, 1) + ' тыс.' : String(Math.round(v)))
  const tone = (w, n) => { if (!n) return ''; const d = w / n - 0.5; return d >= 0.2 ? 'w2' : d > 0 ? 'w1' : d <= -0.2 ? 'l2' : d < 0 ? 'l1' : '' }
  const heat = (w, n) => (n ? `<span class="wrh ${tone(w, n)}">${pct(w, n)}%</span>` : '<span class="wrh mut">—</span>')
  const link = (m, t = 'Матч') => `<a class="upt-go" href="${MATCH}&m=${m.id}">${t} ›</a>`
  const STG = { 'Группа A': 'Группа A', 'Группа B': 'Группа B', 'Тай-брейк': 'Тай-брейк', 'Групповой этап · швейцарка': 'Швейцарка', 'Раунд на вылет': 'На вылет',
    'Четвертьфинал верхней сетки': 'Верхняя · ¼', 'Полуфинал верхней сетки': 'Верхняя · ½', 'Финал верхней сетки': 'Финал верхней',
    '1-й раунд нижней сетки': 'Нижняя · 1-й раунд', 'Четвертьфинал нижней сетки': 'Нижняя · ¼', 'Полуфинал нижней сетки': 'Нижняя · ½', 'Финал нижней сетки': 'Финал нижней', 'Гранд-финал': 'Гранд-финал' }
  const stg = (s) => STG[s] || s
  const isPO = (m) => /сетки|Гранд/.test(m.stage)
  const seg = (u, items, cur, cls = '') => `<div class="upt-seg ${cls}">${items.map(([v, l]) => `<button data-u="${u}" data-v="${v}" class="${String(v) === String(cur) ? 'is-on' : ''}">${l}</button>`).join('')}</div>`
  const card = (id, title, sub, body, right = '') => `<div class="w upt" id="${id}"><div class="w-hd"><span class="w-hd__t">${title}</span>${sub ? `<span class="upt-sub">${sub}</span>` : ''}${right}</div>${body}</div>`
  const pl3 = (n, a, b, c) => { const m = n % 10, t = n % 100; return m === 1 && t !== 11 ? a : m >= 2 && m <= 4 && (t < 12 || t > 14) ? b : c }
  const kills = (n) => `${n} <span class="mut">${pl3(n, 'убийство', 'убийства', 'убийств')}</span>`
  const h = (s) => { let x = 7; for (const c of String(s)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x }

  // игроки за карту: [игрок, герой, сторона 0/1, K, D, A, GPM, XPM, добито, урон, NW, линия]
  const teamOf = (mp, side) => (side ? mp.d : mp.r)
  const PL = []; for (const mp of MAPS) for (const p of mp.pl) PL.push({ mp, id: p[0], hero: p[1], side: p[2], team: teamOf(mp, p[2]), k: p[3], d: p[4], a: p[5], gpm: p[6], xpm: p[7], lh: p[8], dmg: p[9], nw: p[10],
    win: (p[2] === 0) === !!mp.rw, tk: mp.k[p[2]] })

  // ——— 1. Сводка меты ———
  function meta() {
    const n = MAPS.length; if (!n) return ''
    const rw = MAPS.filter((x) => x.rw).length, F = MAPS.filter((x) => x.fp != null), fw = F.filter((x) => (x.fp === 0) === !!x.rw).length
    const dur = MAPS.map((x) => x.dur), avg = dur.reduce((a, b) => a + b, 0) / n, kl = MAPS.map((x) => x.k[0] + x.k[1]), kav = kl.reduce((a, b) => a + b, 0) / n
    const picked = new Set(MAPS.flatMap((x) => x.pk.flat())), banned = new Set(MAPS.flatMap((x) => x.bn.flat())), all = Object.keys(D.heroes).length
    const onlyBan = [...banned].filter((x) => !picked.has(x)).length, none = Object.keys(D.heroes).filter((x) => !picked.has(x) && !banned.has(x)).length
    const bl = MAPS.reduce((a, x) => (x.k[0] + x.k[1] > a.k[0] + a.k[1] ? x : a))
    const tile = (lbl, big, sub, extra = '', cls = '') => `<div class="upt-tl ${cls}"><span class="upt-tl__l">${lbl}</span><b class="upt-tl__v num">${big}</b>${extra}<small>${sub}</small></div>`
    const bar = (a, b) => `<span class="upt-bar"><i style="width:${pct(a, a + b)}%"></i></span>`
    if (O && O.st) return metaSt({ n, rw, fw, F, dur, avg, kl, kav, picked, all, onlyBan, none })
    if (O) return metaRec({ n, rw, fw, F, dur, avg, kl, kav, picked, all, onlyBan, none, tile, bar })
    return card('upt-meta', 'Мета турнира', `${n} карт · ${M.filter((m) => m.state === 'done').length} серий`, `<div class="upt-tls">
      ${tile('Radiant — Dire', `${pct(rw, n)}% <span class="mut">— ${100 - pct(rw, n)}%</span>`, `побед по картам ${rw}–${n - rw}`, bar(rw, n - rw))}
      ${tile('Первый пик', `${pct(fw, F.length)}%`, `побед у 1-го пика · ${fw}–${F.length - fw}`, bar(fw, F.length - fw))}
      ${tile('Длительность', mmss(avg), `в среднем · от ${mmss(Math.min(...dur))} до ${mmss(Math.max(...dur))}`)}
      ${tile('Убийств за карту', Math.round(kav), `в среднем · максимум ${Math.max(...kl)}`)}
      ${tile('Героев в игре', `${picked.size} <span class="mut">из ${all}</span>`, `ещё ${onlyBan} только в банах · ${none} вне меты`)}
      <a class="upt-tl upt-tl--go" href="${MATCH}&m=${bl.m.id}"><span class="upt-tl__l">Самый кровавый матч</span><b class="upt-tl__v num">${kills(bl.k[0] + bl.k[1])}</b>
        <span class="upt-tl__m">${[bl.m.a, bl.m.b].map((t) => `<span>${lg(t)}<span class="n">${nm(t)}</span><b class="num">${bl.k[bl.r === t ? 0 : 1]}</b></span>`).join('')}</span><small>${stg(bl.m.stage)} · карта ${bl.n} · ${dm(bl.m.start)} ›</small></a>
    </div>`)
  }

  // ——— 2. Сетка плей-офф ———
  // раунды double elimination на 8 команд; соседние матчи раунда «сливаются» в один матч следующего (pair) или идут в него напрямую (str)
  const UB = [['Четвертьфинал верхней сетки', 4, 'Четвертьфинал', 'pair'], ['Полуфинал верхней сетки', 2, 'Полуфинал', 'pair'], ['Финал верхней сетки', 1, 'Финал верхней сетки', '']]
  const LB = [['1-й раунд нижней сетки', 2, '1-й раунд', 'str'], ['Четвертьфинал нижней сетки', 2, 'Четвертьфинал', 'pair'], ['Полуфинал нижней сетки', 1, 'Полуфинал', 'str'], ['Финал нижней сетки', 1, 'Финал нижней сетки', '']]
  const GF = 'Гранд-финал'
  const winner = (m) => (m.state === 'done' && m.score ? (m.score[0] > m.score[1] ? m.a : m.b) : null), loser = (m) => (winner(m) ? (winner(m) === m.a ? m.b : m.a) : null)
  // ‼️ TBD-слоты TI (после «сейчас» участники неизвестны) — подписи слотов, не данные
  const slots = (stage, n) => { const L = M.filter((m) => m.stage === stage); while (L.length < n) L.push({ tbd: true, stage, a: null, b: null }); return L }
  const order = (prev, next, f = winner) => { const out = []; for (const x of next) for (const p of prev) if (!out.includes(p) && !p.tbd && [x.a, x.b].includes(f(p))) out.push(p); return [...out, ...prev.filter((p) => !out.includes(p))] }
  function bracket() {
    if (!M.some(isPO)) return ''
    const R = Object.fromEntries([...UB, ...LB].map(([s, n]) => [s, slots(s, n)])); R[GF] = slots(GF, 1)
    // порядок сверху вниз: от финала к началу, чтобы пары сходились в свой матч
    R[UB[1][0]] = order(R[UB[1][0]], R[UB[2][0]]); R[UB[0][0]] = order(R[UB[0][0]], R[UB[1][0]])
    R[LB[1][0]] = order(R[LB[1][0]], R[LB[2][0]]); R[LB[0][0]] = order(R[LB[0][0]], R[LB[1][0]])
    // подписи пустых слотов — откуда придёт команда
    const TBD = { [UB[1][0]]: ['Победитель ¼', 'Победитель ¼'], [UB[2][0]]: ['Победитель ½', 'Победитель ½'], [LB[0][0]]: ['Проигравший ¼', 'Проигравший ¼'], [LB[1][0]]: ['Победитель 1-го раунда', 'Проигравший ½'],
      [LB[2][0]]: ['Победитель ¼', 'Победитель ¼'], [LB[3][0]]: ['Победитель ½', 'Проигравший финала'], [GF]: ['Из верхней сетки', 'Из нижней сетки'] }
    // TI: у слота нижней ¼ уже известен победитель 1-го раунда — ставим его
    if (!EP7) R[LB[1][0]].forEach((x, i) => { if (x.tbd) { const w = winner(R[LB[0][0]][i] || {}); if (w) x.a = w } })
    const row = (m, side, i) => { const id = m[side]; const sc = m.score && m.state !== 'soon' ? m.score[side === 'a' ? 0 : 1] : ''
      const w = winner(m), cls = w ? (w === id ? 'is-w' : 'is-l') : ''
      return id ? `<span class="upt-bt ${cls}">${lg(id)}<span class="n">${nm(id)}</span><b class="num">${sc}</b></span>` : `<span class="upt-bt is-tbd"><i></i><span class="n" title="${(TBD[m.stage] || [])[i] || 'Определится'}">${(TBD[m.stage] || [])[i] || 'Определится'}</span><b></b></span>` }
    const st = (m) => m.tbd ? '<span class="mut">скоро</span>' : m.state === 'live' ? `<span class="upt-live">LIVE</span><span class="mut">${m.live || ''}</span>` : m.state === 'soon' ? `<span class="mut">${today(m.start) ? 'сегодня' : dm(m.start)}, ${hm(m.start)}</span>` : `<span class="mut">${dm(m.start)} · Bo${m.bo}</span>`
    const box = (m) => { const inner = `<span class="upt-bm__h">${st(m)}</span>${row(m, 'a', 0)}${row(m, 'b', 1)}`
      return m.tbd ? `<div class="upt-bm is-tbd">${inner}</div>` : `<a class="upt-bm${m.state === 'live' ? ' is-live' : ''}" href="${MATCH}&m=${m.id}">${inner}</a>` }
    const date = (L) => { const d = [...new Set(L.filter((x) => !x.tbd).map((x) => dm(x.start)))]; return d.length ? d.join(', ') : '' }
    const champ = EP7 && R[GF][0] && winner(R[GF][0])
    const prize = EP7 ? TOUR.standings : []
    const sub = EP7 ? '09 – 12.10.2025 · double elimination · Bo3, гранд-финал Bo5' : '20 – 23.08 · double elimination · Bo3, гранд-финал Bo5 · идёт'
    const places = EP7 ? `<div class="upt-pl">${prize.slice(0, 8).map((x) => `<span class="upt-plc${x.place === '1' ? ' is-1' : ''}"><b class="num">${x.place}</b>${lg(x.team)}<span>${nm(x.team)}</span>${x.prize ? `<small class="num">${x.prize}</small>` : ''}</span>`).join('')}</div>` : ''
    const champBox = champ ? `<div class="upt-ch"><span class="mut">Победитель</span><span class="upt-ch__t">${lg(champ, 'upt-lg--28')}<b>${nm(champ, 'name')}</b></span><small class="num">${prize[0]?.prize || ''}</small></div>` : ''
    if (phone()) {
      const cur = S.br || (EP7 ? 'gf' : 'ub'), list = cur === 'ub' ? UB : cur === 'lb' ? LB : [[GF, 1, 'Гранд-финал']]
      return card('upt-br', 'Плей-офф', '', `${seg('br', [['ub', 'Верхняя сетка'], ['lb', 'Нижняя сетка'], ['gf', 'Гранд-финал']], cur, 'upt-seg--w')}
        <div class="upt-brm">${list.map(([s, n, t]) => `<div class="upt-brm__r"><div class="upt-rh"><b>${t}</b><small class="mut">${date(R[s])}</small></div><div class="upt-brm__g${n > 1 ? ' is-2' : ''}">${R[s].map(box).join('')}</div></div>`).join('')}
        ${cur === 'gf' ? champBox : ''}</div>${cur === 'gf' ? places : ''}<div class="upt-ft mut">${sub}</div>`)
    }
    const col = ([s, n, t, k], i) => `<div class="upt-bc upt-bc--${k || 'end'}" style="--n:${n}"><div class="upt-rh"><b>${t}</b><small class="mut">${date(R[s])}</small></div><div class="upt-bc__s">${R[s].map((m) => `<div class="upt-bs">${box(m)}</div>`).join('')}</div></div>`
    return card('upt-br', 'Плей-офф', sub, `<div class="upt-brd">
        <div class="upt-brd__lb">Верхняя сетка</div><div class="upt-brd__u">${UB.map(col).join('')}<div class="upt-bc upt-bc--gap"></div></div>
        <div class="upt-brd__gf"><div class="upt-rh"><b>Гранд-финал</b><small class="mut">${date(R[GF])}</small></div>${box(R[GF][0])}${champBox}</div>
        <div class="upt-brd__lb upt-brd__lb--l">Нижняя сетка</div><div class="upt-brd__l">${LB.map(col).join('')}</div>
      </div>${places}`)
  }

  // ——— 3. Серии турнира с драфтом ———
  const CATS = EP7 ? [['all', 'Все'], ['g', 'Группы'], ['po', 'Плей-офф']] : [['all', 'Все'], ['g', 'Швейцарка'], ['e', 'На вылет'], ['po', 'Плей-офф']]
  const catOf = (m) => (isPO(m) ? 'po' : m.stage === 'Раунд на вылет' ? 'e' : 'g')
  // v20–v22 (UPT_OPT.ser = 'r', дирижёр 10.11: «из серий турнира — виджет для правой колонки, похожий на виджет турниров»):
  //   «Сейчас · Скоро · Прошли», строка — дата и время, две команды с логотипами, счёт; нажатие — страница матча; прошедших 6, дальше «Показать все»
  const serW = () => { const L = M.slice(), live = L.filter((m) => m.state === 'live'), soon = L.filter((m) => m.state === 'soon'), done = L.filter((m) => m.state === 'done').reverse()
    const row = (m) => { const w = winner(m), sc = (i, t) => (m.state === 'soon' ? '' : `<b class="num${w && w !== t ? ' mut' : ''}">${m.score[i]}</b>`)
      return `<a class="upt-sw__r${m.state === 'live' ? ' is-live' : ''}" href="${MATCH}&m=${m.id}"><span class="upt-sw__d num">${m.state === 'live' ? '<span class="upt-live">LIVE</span>' : `${dm(m.start)}<br>${hm(m.start)}`}</span>
        <span class="upt-sw__t">${[m.a, m.b].map((t, i) => `<span class="${w && w !== t ? 'is-l' : ''}">${lg(t)}<span class="n">${nm(t)}</span>${sc(i, t)}</span>`).join('')}<small class="mut">${stg(m.stage)} · Bo${m.bo}</small></span></a>` }
    const grp = (t, L2) => (L2.length ? `<div class="upt-sw__g"><span class="upt-sw__h mut">${t}</span>${L2.map(row).join('')}</div>` : '')
    const D = S.swAll ? done : done.slice(0, 6)
    return `<div class="w upt upt-sw" id="upt-ser"><div class="w-hd"><span class="w-hd__t">Серии турнира</span><span class="upt-sub">${done.length} из ${M.length} сыграно</span></div>
      ${grp('Сейчас', live)}${grp('Скоро', soon.slice(0, 4))}${grp('Прошли', D)}${done.length > D.length ? `<button class="upt-more" data-u="swall">Показать все ${done.length}</button>` : ''}</div>` }
  function series() {
    if (O && O.ser === 'r') return serW()
    const PH = phone()   // телефон: в строке серии — теги команд (NGX, YS), полное имя — подсказкой
    const L = M.filter((m) => (S.ss === 'all' || catOf(m) === S.ss) && (!S.st || m.a === S.st || m.b === S.st)).slice().reverse()
    const days = []; for (const m of L) { const d = m.start.slice(0, 10); let g = days.find((x) => x.d === d); if (!g) days.push((g = { d, L: [] })); g.L.push(m) }
    const teams = [...new Set(M.flatMap((m) => [m.a, m.b]))].sort((a, b) => nm(a).localeCompare(nm(b)))
    const side = (mp, id) => (mp.r === id ? 0 : 1)
    const mapRow = (m, mp) => { const sa = side(mp, m.a), sb = 1 - sa, wa = (sa === 0) === !!mp.rw
      const picks = (s) => mp.pk[s].map((k) => hi(k)).join(''), fp = (s) => (mp.fp === s ? '<em class="upt-fp" title="Первый пик">1-й пик</em>' : '')
      return `<div class="upt-mp"><span class="upt-mp__n"><b>Карта ${mp.n}</b><small class="mut num">${mmss(mp.dur)}</small></span>
        <span class="upt-mp__s upt-mp__s--a${wa ? ' is-w' : ''}"><span class="upt-mp__t">${lg(m.a)}<small>${sa ? 'Dire' : 'Radiant'}</small>${fp(sa)}</span><span class="upt-mp__h">${picks(sa)}</span></span>
        <span class="upt-mp__k num"><b class="${wa ? 'is-w' : ''}">${mp.k[sa]}</b><i>:</i><b class="${wa ? '' : 'is-w'}">${mp.k[sb]}</b></span>
        <span class="upt-mp__s upt-mp__s--b${wa ? '' : ' is-w'}"><span class="upt-mp__h">${picks(sb)}</span><span class="upt-mp__t">${fp(sb)}<small>${sb ? 'Dire' : 'Radiant'}</small>${lg(m.b)}</span></span></div>` }
    const ser = (m) => { const op = !!S.open[m.id], mp = MAPS.filter((x) => x.m === m), w = winner(m)
      const sc = m.state === 'soon' ? '<span class="mut">—</span>' : `<b class="${w === m.a ? 'is-w' : ''}">${m.score[0]}</b><i>:</i><b class="${w === m.b ? 'is-w' : ''}">${m.score[1]}</b>`
      const tm = m.state === 'live' ? '<span class="upt-live">LIVE</span>' : `<span class="num">${hm(m.start)}</span>`
      return `<div class="upt-sr${op ? ' is-open' : ''}${m.state === 'live' ? ' is-live' : ''}"><button class="upt-sr__r" data-u="sr" data-v="${m.id}"${mp.length ? '' : ' disabled'}>
          <span class="upt-sr__tm mut">${tm}</span><span class="upt-sr__st mut">${stg(m.stage)}</span>
          <span class="upt-sr__a${w && w !== m.a ? ' is-l' : ''}"><span class="n" title="${nm(m.a, 'name')}">${nm(m.a, PH ? 'tag' : 'mid')}</span>${lg(m.a)}</span><span class="upt-sr__sc num">${sc}</span><span class="upt-sr__b${w && w !== m.b ? ' is-l' : ''}">${lg(m.b)}<span class="n" title="${nm(m.b, 'name')}">${nm(m.b, PH ? 'tag' : 'mid')}</span></span>
          <span class="upt-sr__bo mut">Bo${m.bo}</span><span class="upt-car">${mp.length ? (op ? '⌃' : '⌄') : ''}</span></button>
        ${op ? `<div class="upt-sr__d">${mp.map((x) => mapRow(m, x)).join('')}${m.state === 'live' ? `<div class="upt-mp upt-mp--live"><span class="upt-live">LIVE</span><span class="mut">${m.live}</span></div>` : ''}<div class="upt-sr__f">${link(m, m.state === 'live' ? 'Смотреть матч' : 'Страница матча')}</div></div>` : ''}</div>` }
    const sel = `<label class="upt-sel"><select data-u="st">${['', ...teams].map((t) => `<option value="${t}"${t === S.st ? ' selected' : ''}>${t ? nm(t, 'name') : 'Все команды'}</option>`).join('')}</select></label>`
    return card('upt-ser', 'Серии турнира', `${L.length} из ${M.length} · нажми — карты с драфтом`, `<div class="upt-fl">${seg('ss', CATS, S.ss)}${sel}</div>
      <div class="upt-box">${days.map((g) => `<div class="upt-day"><div class="upt-day__h"><b>${wd(g.d)}, ${dm(g.d)}</b><small class="mut">${[...new Set(g.L.map((m) => stg(m.stage)))].join(' · ')}</small></div>${g.L.map(ser).join('')}</div>`).join('') || '<div class="upt-empty mut">Серий нет</div>'}</div>`)
  }

  // ——— 4. Рекорды за карту и заметные матчи ———
  function records() {
    if (!MAPS.length || (O && !O.st)) return ''
    if (O && O.st) return recSt()
    const max = (f) => MAPS.reduce((a, x) => (f(x) > f(a) ? x : a)), min = (f) => MAPS.reduce((a, x) => (f(x) < f(a) ? x : a))
    const mapCard = (lbl, mp, big) => { const wr = mp.rw ? mp.r : mp.d
      return `<a class="upt-rc" href="${MATCH}&m=${mp.m.id}"><span class="upt-rc__l">${lbl}</span><b class="upt-rc__v num">${big}</b>
        <span class="upt-rc__m">${[mp.m.a, mp.m.b].map((t) => `<span class="${wr === t ? 'is-w' : 'mut'}">${lg(t)}<span class="n">${nm(t)}</span><b class="num">${mp.k[mp.r === t ? 0 : 1]}</b></span>`).join('')}</span>
        <small class="mut">${stg(mp.m.stage)} · карта ${mp.n} · ${dm(mp.m.start)} ›</small></a>` }
    const blood = max((x) => x.k[0] + x.k[1]), long = max((x) => x.dur), short = min((x) => x.dur), rout = max((x) => Math.abs(x.k[0] - x.k[1])), calm = min((x) => x.k[0] + x.k[1])
    const REC = [['Убийства', 'k', (v) => v], ['Ассисты', 'a', (v) => v], ['Урон по героям', 'dmg', k1], ['GPM', 'gpm', (v) => v], ['XPM', 'xpm', (v) => v], ['Добито крипов', 'lh', (v) => v], ['Net worth', 'nw', k1], ['Смерти', 'd', (v) => v]]
    const pc = ([lbl, f, fmt]) => { const p = PL.reduce((a, x) => (x[f] > a[f] ? x : a)), pl = D.players[p.id], op = p.team === p.mp.m.a ? p.mp.m.b : p.mp.m.a, ph = pl?.photo || pl?.avatar
      return `<a class="upt-rc upt-rc--p" href="${MATCH}&m=${p.mp.m.id}"><span class="upt-rc__l">${lbl}</span><b class="upt-rc__v num">${fmt(p[f])}</b>
        <span class="upt-rc__p">${ph ? `<img class="upt-av" src="${DB.url(ph)}" alt="" onerror="this.style.visibility='hidden'" />` : '<i class="upt-av"></i>'}<span class="n"><b>${pl?.nick || p.id}</b><small class="mut">${lg(p.team)}${nm(p.team)}</small></span>${hi(p.hero, 'upt-hi--r')}</span>
        <small class="mut">против ${nm(op)} · карта ${p.mp.n} · ${dm(p.mp.m.start)} ›</small></a>` }
    return card('upt-rec', 'Рекорды турнира', 'за одну карту · нажми — страница матча', `<div class="upt-rs"><div class="upt-rh"><b>Заметные матчи</b></div>
      <div class="upt-rg upt-rg--m">${mapCard('Самый кровавый', blood, kills(blood.k[0] + blood.k[1]))}${mapCard('Самый длинный', long, mmss(long.dur))}
        ${mapCard('Самый разгромный', rout, `+${Math.abs(rout.k[0] - rout.k[1])} <span class="mut">по убийствам</span>`)}${mapCard('Самый короткий', short, mmss(short.dur))}${phone() ? '' : mapCard('Самый тихий', calm, kills(calm.k[0] + calm.k[1]))}</div>
      <div class="upt-rh"><b>Рекорды игроков</b></div><div class="upt-rg">${REC.map(pc).join('')}</div></div>`)
  }

  // ——— v13–v16: мета и рекорды одним блоком «Турнир в цифрах», четыре подачи ———
  function metaRec(x) {
    const { n, rw, fw, F, dur, avg, kl, kav, picked, all, onlyBan, none, tile, bar } = x, ser = M.filter((m) => m.state === 'done').length
    const MT = [['Radiant — Dire', `${pct(rw, n)}% <span class="mut">— ${100 - pct(rw, n)}%</span>`, `побед по картам ${rw}–${n - rw}`, bar(rw, n - rw), `${pct(rw, n)}%`, 'Radiant'],
      ['Первый пик', `${pct(fw, F.length)}%`, `побед у 1-го пика · ${fw}–${F.length - fw}`, bar(fw, F.length - fw), `${pct(fw, F.length)}%`, 'побед у 1-го пика'],
      ['Длительность', mmss(avg), `в среднем · от ${mmss(Math.min(...dur))} до ${mmss(Math.max(...dur))}`, '', mmss(avg), 'средняя карта'],
      ['Убийств за карту', Math.round(kav), `в среднем · максимум ${Math.max(...kl)}`, '', Math.round(kav), 'убийств за карту'],
      ['Героев в игре', `${picked.size} <span class="mut">из ${all}</span>`, `ещё ${onlyBan} только в банах · ${none} вне меты`, '', `${picked.size}<span class="mut">/${all}</span>`, 'героев в игре']]
    const max = (f) => MAPS.reduce((a, y) => (f(y) > f(a) ? y : a)), min = (f) => MAPS.reduce((a, y) => (f(y) < f(a) ? y : a))
    const blood = max((y) => y.k[0] + y.k[1]), long = max((y) => y.dur), short = min((y) => y.dur), rout = max((y) => Math.abs(y.k[0] - y.k[1])), calm = min((y) => y.k[0] + y.k[1])
    const MR = [['Самый кровавый', blood, kills(blood.k[0] + blood.k[1])], ['Самый длинный', long, mmss(long.dur)], ['Самый разгромный', rout, `+${Math.abs(rout.k[0] - rout.k[1])} <span class="mut">по убийствам</span>`], ['Самый короткий', short, mmss(short.dur)], ['Самый тихий', calm, kills(calm.k[0] + calm.k[1])]]
    const REC = [['Убийства', 'k', (v) => v], ['Ассисты', 'a', (v) => v], ['Урон по героям', 'dmg', k1], ['GPM', 'gpm', (v) => v], ['XPM', 'xpm', (v) => v], ['Добито крипов', 'lh', (v) => v], ['Net worth', 'nw', k1], ['Смерти', 'd', (v) => v]]
    const PR = REC.map(([lbl, f, fmt]) => { const p = PL.reduce((a, y) => (y[f] > a[f] ? y : a)); return [lbl, p, fmt(p[f])] })
    const pInfo = (p) => { const pl = D.players[p.id], op = p.team === p.mp.m.a ? p.mp.m.b : p.mp.m.a, ph = pl?.photo || pl?.avatar; return { pl, op, ph } }
    const av = (ph) => (ph ? `<img class="upt-av" src="${DB.url(ph)}" alt="" onerror="this.style.visibility='hidden'" />` : '<i class="upt-av"></i>')
    const where = (mp) => `${stg(mp.m.stage)} · карта ${mp.n} · ${dm(mp.m.start)} ›`
    // плитки и карточки — как в v2
    const tiles = (L) => L.map(([l, b, s, e]) => tile(l, b, s, e)).join('')
    const mCard = ([lbl, mp, big]) => { const wr = mp.rw ? mp.r : mp.d
      return `<a class="upt-rc" href="${MATCH}&m=${mp.m.id}"><span class="upt-rc__l">${lbl}</span><b class="upt-rc__v num">${big}</b><span class="upt-rc__m">${[mp.m.a, mp.m.b].map((t) => `<span class="${wr === t ? 'is-w' : 'mut'}">${lg(t)}<span class="n">${nm(t)}</span><b class="num">${mp.k[mp.r === t ? 0 : 1]}</b></span>`).join('')}</span><small class="mut">${where(mp)}</small></a>` }
    const pCard = ([lbl, p, v]) => { const { pl, op, ph } = pInfo(p)
      return `<a class="upt-rc upt-rc--p" href="${MATCH}&m=${p.mp.m.id}"><span class="upt-rc__l">${lbl}</span><b class="upt-rc__v num">${v}</b><span class="upt-rc__p">${av(ph)}<span class="n"><b>${pl?.nick || p.id}</b><small class="mut">${lg(p.team)}${nm(p.team)}</small></span>${hi(p.hero, 'upt-hi--r')}</span><small class="mut">против ${nm(op)} · карта ${p.mp.n} · ${dm(p.mp.m.start)} ›</small></a>` }
    // строки списка
    const mRow = ([lbl, mp, big]) => { const wr = mp.rw ? mp.r : mp.d, side = (t) => `<span class="${wr === t ? 'is-w' : 'mut'}">${nm(t)} <b class="num">${mp.k[mp.r === t ? 0 : 1]}</b></span>`
      return `<a class="upt-lr" href="${MATCH}&m=${mp.m.id}"><span class="upt-lr__l">${lbl}</span><b class="upt-lr__v num">${big}</b><span class="upt-lr__w">${lg(mp.m.a)}${side(mp.m.a)}<i class="mut">—</i>${side(mp.m.b)}${lg(mp.m.b)}</span><small class="upt-lr__s mut">${where(mp)}</small></a>` }
    const pRow = ([lbl, p, v]) => { const { pl, op, ph } = pInfo(p)
      return `<a class="upt-lr" href="${MATCH}&m=${p.mp.m.id}"><span class="upt-lr__l">${lbl}</span><b class="upt-lr__v num">${v}</b><span class="upt-lr__w">${av(ph)}<b>${pl?.nick || p.id}</b>${lg(p.team)}${hi(p.hero, 'upt-hi--r')}</span><small class="upt-lr__s mut">против ${nm(op)} · ${dm(p.mp.m.start)} ›</small></a>` }
    const sub = `${n} карт · ${ser} серий`, rh = (t, s = '') => `<div class="upt-rh"><b>${t}</b>${s ? `<small class="mut">${s}</small>` : ''}</div>`
    const mr = O.mr || 'one'
    if (mr === 'one') return card('upt-meta', 'Турнир в цифрах', sub, `<div class="upt-tls upt-tls--5">${tiles(MT)}</div>
      <div class="upt-rs upt-rs--top">${rh('Заметные матчи', 'за одну карту')}<div class="upt-rg upt-rg--m">${MR.slice(0, phone() ? 4 : 5).map(mCard).join('')}</div>
      ${rh('Рекорды игроков', 'за одну карту')}<div class="upt-rg">${PR.map(pCard).join('')}</div></div>`)
    if (mr === 'list') return card('upt-meta', 'Турнир в цифрах', sub, `<div class="upt-strip">${MT.map((t) => `<span class="upt-strip__i"><b class="num">${t[4]}</b><small>${t[5]}</small></span>`).join('')}</div>
      <div class="upt-l2"><div class="upt-l2__c">${rh('Заметные матчи')}<div class="upt-lrs">${MR.map(mRow).join('')}</div></div><div class="upt-l2__c">${rh('Рекорды игроков')}<div class="upt-lrs">${PR.map(pRow).join('')}</div></div></div>`)
    if (mr === 'tabs') { const t = S.mr || 'm'
      const body = t === 'm' ? `<div class="upt-tls upt-tls--3">${tiles(MT)}${mCard(MR[0]).replace('upt-rc"', 'upt-tl upt-tl--go upt-tl--rc"')}</div>` : `<div class="upt-rs">${t === 'r' ? `<div class="upt-rg upt-rg--m">${MR.map(mCard).join('')}</div>` : `<div class="upt-rg">${PR.map(pCard).join('')}</div>`}</div>`
      return card('upt-meta', 'Турнир в цифрах', '', `<div class="upt-fl">${seg('mr', [['m', 'Мета'], ['r', 'Заметные матчи'], ['p', 'Рекорды игроков']], t, phone() ? 'upt-seg--w' : '')}</div>${body}`, `<span class="upt-sub">${sub}</span>`) }
    // two: слева мета списком, справа рекорды строками (матчи и игроки вместе)
    return card('upt-meta', 'Турнир в цифрах', sub, `<div class="upt-tw"><div class="upt-tw__m">${rh('Мета')}${MT.map(([l, b, s, e]) => `<div class="upt-ml"><span class="upt-ml__l">${l}</span><b class="upt-ml__v num">${b}</b>${e}<small class="mut">${s}</small></div>`).join('')}</div>
      <div class="upt-tw__r">${rh('Заметные матчи')}<div class="upt-lrs">${MR.map(mRow).join('')}</div>${rh('Рекорды игроков')}<div class="upt-lrs">${PR.map(pRow).join('')}</div></div></div>`)
  }

  // ——— v17–v19 (UPT_OPT.st, дирижёр 10.11: «рекорды не поднимать к мете — обновить в той же стилистике, на том же месте»):
  //   мета сверху и рекорды ниже серий — одна стилистика на два блока: viz — показатели с мини-графиками · big — крупные цифры без рамок · art — с артом героев
  const mapsRec = () => { const max = (f) => MAPS.reduce((a, y) => (f(y) > f(a) ? y : a)), min = (f) => MAPS.reduce((a, y) => (f(y) < f(a) ? y : a))
    const kk = (y) => y.k[0] + y.k[1], avK = MAPS.reduce((a, y) => a + kk(y), 0) / MAPS.length, avD = MAPS.reduce((a, y) => a + y.dur, 0) / MAPS.length
    const rr = (a, b) => Math.min(a, b) / Math.max(a, b)   // полоса: среднее против рекорда
    const blood = max(kk), long = max((y) => y.dur), short = min((y) => y.dur), rout = max((y) => Math.abs(y.k[0] - y.k[1])), calm = min(kk)
    return [['Самый кровавый', blood, kk(blood), 'убийств', rr(kk(blood), avK), `в среднем ${Math.round(avK)}`], ['Самый длинный', long, mmss(long.dur), '', rr(long.dur, avD), `в среднем ${mmss(avD)}`],
      ['Самый разгромный', rout, '+' + Math.abs(rout.k[0] - rout.k[1]), 'по убийствам', 0, ''], ['Самый короткий', short, mmss(short.dur), '', rr(short.dur, avD), `в среднем ${mmss(avD)}`], ['Самый тихий', calm, kk(calm), 'убийств', rr(kk(calm), avK), `в среднем ${Math.round(avK)}`]] }
  const plRec = () => [['Убийства', 'k', (v) => v], ['Ассисты', 'a', (v) => v], ['Урон по героям', 'dmg', k1], ['GPM', 'gpm', (v) => v], ['XPM', 'xpm', (v) => v], ['Добито крипов', 'lh', (v) => v], ['Net worth', 'nw', k1], ['Смерти', 'd', (v) => v]]
    .map(([lbl, f, fmt]) => { const p = PL.reduce((a, y) => (y[f] > a[f] ? y : a)), av = PL.reduce((a, y) => a + y[f], 0) / PL.length, pl = D.players[p.id]
      return { lbl, p, v: fmt(p[f]), r: Math.min(1, p[f] ? av / p[f] : 0), avg: fmt(Math.round(av)), pl, op: p.team === p.mp.m.a ? p.mp.m.b : p.mp.m.a, ph: pl?.photo || pl?.avatar } })
  const heroTop = () => { const P = {}, B = {}, W = {}; for (const mp of MAPS) for (const sd of [0, 1]) { const w = (sd === 0) === !!mp.rw; for (const k of mp.pk[sd]) { P[k] = (P[k] || 0) + 1; if (w) W[k] = (W[k] || 0) + 1 } for (const k of mp.bn[sd]) B[k] = (B[k] || 0) + 1 }
    const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 5); return { pk: top(P), bn: top(B), W } }
  const hist = (vals, lo, step, nb) => { const c = Array(nb).fill(0); for (const v of vals) c[Math.max(0, Math.min(nb - 1, Math.floor((v - lo) / step)))]++; const m = Math.max(...c); return `<span class="upt-hg">${c.map((x) => `<i style="height:${Math.max(6, Math.round((x / m) * 100))}%"></i>`).join('')}</span>` }
  const avImg = (ph, c = '') => (ph ? `<img class="upt-av ${c}" src="${DB.url(ph)}" alt="" onerror="this.style.visibility='hidden'" />` : `<i class="upt-av ${c}"></i>`)
  const sideS = (mp, t, wr) => `<span class="${wr === t ? 'is-w' : 'mut'}">${lg(t)}<span class="n">${nm(t)}</span><b class="num">${mp.k[mp.r === t ? 0 : 1]}</b></span>`
  function metaSt(x) {
    const { n, rw, fw, F, dur, avg, kl, kav, picked, all, onlyBan, none } = x, ser = M.filter((m) => m.state === 'done').length, st = O.st, ht = heroTop()
    const sub = `${n} карт · ${ser} серий`
    const split = (a, b, la, lb) => `<span class="upt-sp"><i style="flex:${a}"></i><i style="flex:${b}"></i></span><span class="upt-sp__l"><span>${la}</span><span>${lb}</span></span>`
    if (st === 'viz') { const ring = `<span class="upt-ring" style="--p:${pct(picked.size, all)}"><b class="num">${pct(picked.size, all)}%</b></span>`, [hk, hn0] = ht.pk[0]
      const T = [['Radiant — Dire', `${pct(rw, n)}%<span class="mut"> — ${100 - pct(rw, n)}%</span>`, split(rw, n - rw, `Radiant ${rw}`, `Dire ${n - rw}`)],
        ['Первый пик', `${pct(fw, F.length)}%`, split(fw, F.length - fw, `побед ${fw}`, `поражений ${F.length - fw}`)],
        ['Длительность', mmss(avg), `${hist(dur, 1200, 300, 9)}<span class="upt-sp__l"><span>20′</span><span>60′+</span></span>`],
        ['Убийств за карту', Math.round(kav), `${hist(kl, 20, 8, 9)}<span class="upt-sp__l"><span>20</span><span>${Math.max(...kl)}</span></span>`],
        ['Героев в игре', `${picked.size}<span class="mut"> из ${all}</span>`, `<span class="upt-vz__rw">${ring}<small class="mut">${onlyBan} только в банах · ${none} вне меты</small></span>`],
        ['Чаще всех брали', hn(hk), `<span class="upt-vz__rw">${hi(hk, 'upt-hi--l')}<small class="mut">${hn0} ${pl3(hn0, 'карта', 'карты', 'карт')} · WR ${pct(ht.W[hk] || 0, hn0)}%</small></span>`]]
      return card('upt-meta', 'Мета турнира', sub, `<div class="upt-vz">${T.map(([l, b, v]) => `<div class="upt-vz__c"><span class="upt-vz__l">${l}</span><b class="upt-vz__v num">${b}</b><span class="upt-vz__g">${v}</span></div>`).join('')}</div>`) }
    if (st === 'big') { const T = [[`${pct(rw, n)}%`, 'побед за Radiant', `${rw}–${n - rw} по картам`], [`${pct(fw, F.length)}%`, 'побед у 1-го пика', `${fw}–${F.length - fw}`], [mmss(avg), 'средняя карта', `от ${mmss(Math.min(...dur))} до ${mmss(Math.max(...dur))}`],
        [Math.round(kav), 'убийств за карту', `максимум ${Math.max(...kl)}`], [`${picked.size}<span class="mut">/${all}</span>`, 'героев в игре', `${onlyBan} только в банах`], [ser, 'серий сыграно', `${n} карт`]]
      return card('upt-meta', 'Мета турнира', '', `<div class="upt-bg">${T.map(([v, l, s2]) => `<div class="upt-bg__c"><b class="upt-bg__v num">${v}</b><span class="upt-bg__l">${l}</span><small class="mut">${s2}</small></div>`).join('')}</div>`) }
    // art
    const hRow = (L, lbl, f) => `<div class="upt-ah"><span class="upt-ah__l">${lbl}</span><div class="upt-ah__r">${L.map(([k, c]) => `<span class="upt-ah__h"><img src="${HB}${k}.png" alt="" loading="lazy" /><span><b>${hn(k)}</b><small class="num">${f(k, c)}</small></span></span>`).join('')}</div></div>`
    const T = [['Radiant — Dire', `${pct(rw, n)}%<span class="mut"> — ${100 - pct(rw, n)}%</span>`], ['Первый пик', `${pct(fw, F.length)}%`], ['Длительность', mmss(avg)], ['Убийств за карту', Math.round(kav)], ['Героев в игре', `${picked.size}<span class="mut"> из ${all}</span>`]]
    return card('upt-meta', 'Мета турнира', sub, `${hRow(ht.pk, 'Чаще всех брали', (k, c) => `${c} пиков · WR ${pct(ht.W[k] || 0, c)}%`)}${hRow(ht.bn, 'Чаще всех банили', (k, c) => `${c} банов`)}
      <div class="upt-an">${T.map(([l, v]) => `<span><small class="mut">${l}</small><b class="num">${v}</b></span>`).join('')}</div>`)
  }
  function recSt() {
    const st = O.st, MR = mapsRec(), PR = plRec(), wrOf = (mp) => (mp.rw ? mp.r : mp.d)
    const sub = 'за одну карту · нажми — страница матча', rh = (t) => `<div class="upt-rh"><b>${t}</b></div>`
    if (st === 'viz') {
      const bar = (r, t) => `<span class="upt-cb"><i style="width:${Math.round(Math.min(1, r) * 100)}%"></i></span><small class="mut">${t}</small>`
      const mc = ([lbl, mp, v, u, r, t]) => `<a class="upt-vr" href="${MATCH}&m=${mp.m.id}"><span class="upt-vz__l">${lbl}</span><b class="upt-vz__v num">${v}${u ? `<span class="mut"> ${u}</span>` : ''}</b><span class="upt-rc__m">${[mp.m.a, mp.m.b].map((tm) => sideS(mp, tm, wrOf(mp))).join('')}</span>${t ? bar(r, t) : ''}<small class="mut">${stg(mp.m.stage)} · карта ${mp.n} · ${dm(mp.m.start)} ›</small></a>`
      const pc = (q) => `<a class="upt-vr" href="${MATCH}&m=${q.p.mp.m.id}"><span class="upt-vz__l">${q.lbl}</span><b class="upt-vz__v num">${q.v}</b><span class="upt-rc__p">${avImg(q.ph)}<span class="n"><b>${q.pl?.nick || q.p.id}</b><small class="mut">${lg(q.p.team)}${nm(q.p.team)}</small></span>${hi(q.p.hero, 'upt-hi--r')}</span>${bar(q.r, `в среднем ${q.avg}`)}<small class="mut">против ${nm(q.op)} · ${dm(q.p.mp.m.start)} ›</small></a>`
      return card('upt-rec', 'Рекорды турнира', sub, `<div class="upt-rs">${rh('Заметные матчи')}<div class="upt-vz upt-vz--5">${MR.slice(0, phone() ? 4 : 5).map(mc).join('')}</div>${rh('Рекорды игроков')}<div class="upt-vz upt-vz--4">${PR.map(pc).join('')}</div></div>`) }
    if (st === 'big') {
      const mc = ([lbl, mp, v, u]) => `<a class="upt-bg__c upt-bg__c--a" href="${MATCH}&m=${mp.m.id}"><b class="upt-bg__v num">${v}</b><span class="upt-bg__l">${lbl.replace('Самый ', 'самый ')}${u ? ` · ${u}` : ''}</span><span class="upt-rc__m">${[mp.m.a, mp.m.b].map((tm) => sideS(mp, tm, wrOf(mp))).join('')}</span><small class="mut">${dm(mp.m.start)} · карта ${mp.n} ›</small></a>`
      const pc = (q) => `<a class="upt-bg__c upt-bg__c--a" href="${MATCH}&m=${q.p.mp.m.id}"><b class="upt-bg__v num">${q.v}</b><span class="upt-bg__l">${q.lbl.toLowerCase()}</span><span class="upt-bg__p">${avImg(q.ph, 'upt-av--l')}<span><b>${q.pl?.nick || q.p.id}</b><small class="mut">${nm(q.p.team)} · против ${nm(q.op)}</small></span></span></a>`
      return card('upt-rec', 'Рекорды турнира', '', `<div class="upt-rs upt-rs--big">${rh('Заметные матчи')}<div class="upt-bg upt-bg--5">${MR.slice(0, phone() ? 4 : 5).map(mc).join('')}</div>${rh('Рекорды игроков')}<div class="upt-bg upt-bg--4">${PR.map(pc).join('')}</div></div>`) }
    // art: карточки с артом героя / логотипами команд на фоне
    const mc = ([lbl, mp, v, u]) => `<a class="upt-ar upt-ar--m" href="${MATCH}&m=${mp.m.id}"><span class="upt-ar__bg">${[mp.m.a, mp.m.b].map((t) => `<img src="${DB.logo(t)}" alt="" />`).join('')}</span><span class="upt-ar__t"><span class="upt-vz__l">${lbl}</span><b class="upt-ar__v num">${v}${u ? `<span class="mut"> ${u}</span>` : ''}</b><span class="upt-rc__m">${[mp.m.a, mp.m.b].map((tm) => sideS(mp, tm, wrOf(mp))).join('')}</span></span></a>`
    const pc = (q) => `<a class="upt-ar" href="${MATCH}&m=${q.p.mp.m.id}"><img class="upt-ar__h" src="${HB}${q.p.hero}.png" alt="" loading="lazy" /><span class="upt-ar__t"><span class="upt-vz__l">${q.lbl}</span><b class="upt-ar__v num">${q.v}</b><span class="upt-ar__p">${avImg(q.ph)}<b>${q.pl?.nick || q.p.id}</b><small class="mut">${hn(q.p.hero)} · против ${nm(q.op)}</small></span></span></a>`
    return card('upt-rec', 'Рекорды турнира', sub, `<div class="upt-rs">${rh('Заметные матчи')}<div class="upt-vz upt-vz--5 upt-arg">${MR.slice(0, phone() ? 4 : 5).map(mc).join('')}</div>${rh('Рекорды игроков')}<div class="upt-vz upt-vz--4 upt-arg">${PR.map(pc).join('')}</div></div>`)
  }

  // ——— 5. Статистика игроков ———
  const posOf = (id) => { const p = D.players[id]; return p?.roleAt?.[T] ?? (typeof p?.role === 'number' ? p.role : null) }
  const PS = (() => { const g = {}
    for (const x of PL) { const q = (g[x.id] ??= { id: x.id, team: x.team, maps: 0, wins: 0, k: 0, d: 0, a: 0, gpm: 0, xpm: 0, lh: 0, dmg: 0, kp: 0, H: {} }); q.maps++; if (x.win) q.wins++
      q.k += x.k; q.d += x.d; q.a += x.a; q.gpm += x.gpm; q.xpm += x.xpm; q.lh += x.lh; q.dmg += x.dmg; q.kp += x.tk ? (x.k + x.a) / x.tk : 0; (q.H[x.hero] ??= [0, 0])[0]++; if (x.win) q.H[x.hero][1]++ }
    return Object.values(g).map((q) => ({ ...q, pos: posOf(q.id), wr: q.wins / q.maps, kda: (q.k + q.a) / Math.max(1, q.d), ka: q.k / q.maps, da: q.d / q.maps, aa: q.a / q.maps, gpm: q.gpm / q.maps, xpm: q.xpm / q.maps, lh: q.lh / q.maps, dmg: q.dmg / q.maps,
      kp: q.kp / q.maps, pool: Object.keys(q.H).length, top: Object.entries(q.H).sort((a, b) => b[1][0] - a[1][0]).slice(0, 3),
      lane: 38 + (h(q.id + T) % 40) })) })()   // ‼️ пример: «Линии» — доля выигранных линий
  const PCOL = [['maps', 'Карт', (q) => q.maps, (q) => q.maps, 'f'], ['wr', 'WR', (q) => q.wr, (q) => heat(q.wins, q.maps), 'f'], ['kda', 'KDA', (q) => q.kda, (q) => `<b>${fx(q.kda)}</b>`, 'f'],
    ['kda3', 'K / D / A', (q) => q.ka, (q) => `<span class="mut">${fx(q.ka)} / ${fx(q.da)} / ${fx(q.aa)}</span>`, 'f'], ['kp', 'KP', (q) => q.kp, (q) => `${Math.round(q.kp * 100)}%`, 'f'],
    ['gpm', 'GPM', (q) => q.gpm, (q) => `<b>${Math.round(q.gpm)}</b>`, 'e'], ['xpm', 'XPM', (q) => q.xpm, (q) => Math.round(q.xpm), 'e'], ['lh', 'Добито', (q) => q.lh, (q) => Math.round(q.lh), 'e'], ['dmg', 'Урон', (q) => q.dmg, (q) => k1(q.dmg), 'e'],
    ['pool', 'Пул', (q) => q.pool, (q) => `<span class="upt-pool"><b>${q.pool}</b>${q.top.map(([k, [n, w]]) => `<span title="${hn(k)} · ${n} ${pl3(n, 'карта', 'карты', 'карт')} · WR ${pct(w, n)}%">${hi(k)}</span>`).join('')}</span>`, 'p'],
    ['lane', 'Линии', (q) => q.lane, (q) => `${q.lane}%`, 'p']]
  const PGRP = [['f', 'Бой'], ['e', 'Фарм'], ['p', 'Пул и линии']]
  function players() {
    const ph = phone(), cols = ph ? PCOL.filter((c) => c[4] === S.pg && c[0] !== 'kda3') : PCOL
    const f = PCOL.find((c) => c[0] === S.ps)?.[2] || ((q) => q.kda)
    const L = PS.filter((q) => (!S.pos || q.pos === S.pos) && (!S.min || q.maps >= 5)).sort((a, b) => S.psd * (f(a) - f(b)) || b.kda - a.kda)
    const th = (c) => `<th class="srt${S.ps === c[0] ? ' is-on' : ''} c-${c[0]}" data-u="ps" data-v="${c[0]}"><span>${c[1]}<i class="ar${S.ps === c[0] ? ' is-on' : ''}">${S.ps === c[0] && S.psd > 0 ? '↑' : '↓'}</i></span></th>`
    const pr = (q, i) => { const p = D.players[q.id], img = p?.photo || p?.avatar
      return `<tr><td class="k mut num">${i + 1}</td><td class="pl"><span class="upt-pp">${q.pos ? `<span class="upt-pos" title="Позиция ${q.pos}">${q.pos}</span>` : '<span class="upt-pos is-0">—</span>'}${img && !ph ? `<img class="upt-av" src="${DB.url(img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />` : ''}<b title="${p?.nick || q.id}">${p?.nick || q.id}</b><span class="upt-pt" title="${nm(q.team, 'name')}">${lg(q.team)}</span></span></td>${cols.map((c) => `<td class="c-${c[0]}${S.ps === c[0] ? ' is-sc' : ''}">${c[3](q)}</td>`).join('')}</tr>` }
    return card('upt-pls', 'Статистика игроков', `${L.length} игроков · среднее за карту`, `<div class="upt-fl">${seg('pos', [[0, 'Все'], [1, 'Pos 1'], [2, 'Pos 2'], [3, 'Pos 3'], [4, 'Pos 4'], [5, 'Pos 5']], S.pos, ph ? 'upt-seg--w' : '')}
        ${ph ? seg('pg', PGRP, S.pg, 'upt-seg--w') : ''}<button class="upt-chk${S.min ? ' is-on' : ''}" data-u="min"><i></i>от 5 карт</button></div>
      <div class="upt-box upt-box--t"><table class="upt-t upt-t--pl${ph ? ' is-ph' : ''}"><thead><tr><th class="k">#</th><th class="pl">Игрок</th>${cols.map(th).join('')}</tr></thead><tbody>${cut('pl', L).map(pr).join('')}</tbody></table></div>${more('pl', L)}
      <div class="upt-ft mut">KP — участие в убийствах команды · пул — разных героев, значки — 3 самых частых · нажми на заголовок — сортировка</div>`)
  }

  // ——— 6. Статистика героев: фильтры (сторона, 1-й / 2-й пик) и «вне меты» ———
  function heroStats() {
    const keep = (mp, s) => (S.side === 'all' || String(s) === S.side) && (S.fp === 'all' || (mp.fp != null && (S.fp === '1' ? mp.fp === s : mp.fp !== s)))
    const G = MAPS.filter((mp) => S.fp === 'all' || mp.fp != null), H = {}
    const hx = (k) => (H[k] ??= { k, n: hn(k), p: 0, pw: 0, b: 0, rd: [0, 0], dr: [0, 0] })
    for (const mp of G) for (const s of [0, 1]) { if (!keep(mp, s)) continue; const w = (s === 0) === !!mp.rw
      for (const k of mp.pk[s]) { const x = hx(k); x.p++; if (w) x.pw++; const sd = s ? x.dr : x.rd; sd[0]++; if (w) sd[1]++ }
      for (const k of mp.bn[s]) hx(k).b++ }
    const n = G.length, L0 = Object.values(H).map((x) => ({ ...x, pb: x.p + x.b }))
    const C = [['p', 'Пики', (x) => x.p, (x) => `<b>${x.p}</b>`, 'gs'], ['pv', 'В–П', (x) => x.pw, (x) => `${x.pw}–${x.p - x.pw}`], ['pwr', 'WR', (x) => (x.p ? x.pw / x.p : -1), (x) => heat(x.pw, x.p)], ['pt', '% карт', (x) => x.p, (x) => `<span class="mut">${pct(x.p, n)}%</span>`],
      ...(S.side === 'all' ? [['rwr', 'Radiant', (x) => (x.rd[0] ? x.rd[1] / x.rd[0] : -1), (x) => `<span class="upt-sd"><span class="mut num">${x.rd[0]}</span>${heat(x.rd[1], x.rd[0])}</span>`, 'gs'], ['dwr', 'Dire', (x) => (x.dr[0] ? x.dr[1] / x.dr[0] : -1), (x) => `<span class="upt-sd"><span class="mut num">${x.dr[0]}</span>${heat(x.dr[1], x.dr[0])}</span>`]] : []),
      ['b', 'Баны', (x) => x.b, (x) => `<b>${x.b}</b>`, 'gs'], ['bt', '% карт', (x) => x.b, (x) => `<span class="mut">${pct(x.b, n)}%</span>`], ['pb', 'Пик + бан', (x) => x.pb, (x) => `<b>${pct(x.pb, n)}%</b>`, 'gs']]
    const ph = phone(), cols = ph ? C.filter((c) => ['p', 'pwr', 'b', 'pb'].includes(c[0])) : C
    const f = C.find((c) => c[0] === S.hs)?.[2] || ((x) => x.pb), L = L0.sort((a, b) => (S.hs === 'n' ? S.hsd * a.n.localeCompare(b.n) : S.hsd * (f(a) - f(b))) || b.pb - a.pb)
    const th = (k, t, c = '') => `<th class="srt ${c}${S.hs === k ? ' is-on' : ''}" data-u="hs" data-v="${k}"><span>${t}<i class="ar${S.hs === k ? ' is-on' : ''}">${S.hs === k && S.hsd > 0 ? '↑' : '↓'}</i></span></th>`
    const all = MAPS.flatMap((x) => [...x.pk.flat(), ...x.bn.flat()]), used = new Set(all), picked = new Set(MAPS.flatMap((x) => x.pk.flat()))
    const out = Object.values(D.heroes).filter((x) => !used.has(x.id)).sort((a, b) => a.name.localeCompare(b.name)), ban = Object.values(D.heroes).filter((x) => used.has(x.id) && !picked.has(x.id)).sort((a, b) => a.name.localeCompare(b.name))
    const chip = (x) => `<span class="upt-hc">${hi(x.id)}<span>${x.name}</span></span>`
    const def = S.side === 'all' && S.fp === 'all' && S.hs === 'pb' && S.hsd === -1
    const sub = S.side === 'all' && S.fp === 'all' ? `${n} карт · Radiant ${G.filter((x) => x.rw).length}–${G.filter((x) => !x.rw).length}` : `${n} карт · ${S.side === 'all' ? 'обе стороны' : S.side === '0' ? 'за Radiant' : 'за Dire'}${S.fp === 'all' ? '' : S.fp === '1' ? ' · у 1-го пика' : ' · у 2-го пика'}`
    return `<div class="w upt hsw hsw--nice hsw--sorthi${ph ? ' is-ph' : ''}" id="upt-hs"><div class="w-hd"><span class="w-hd__t">Статистика героев</span><span class="upt-sub">${sub}</span><button data-u="hsr" class="hsw-rc upt-rc0"${def ? ' disabled' : ''} title="Сбросить фильтры и сортировку">Сбросить</button></div>
      <div class="upt-fl">${seg('side', [['all', 'Обе стороны'], ['0', 'Radiant'], ['1', 'Dire']], S.side)}${seg('fp', [['all', 'Любой пик'], ['1', '1-й пик'], ['2', '2-й пик']], S.fp)}</div>
      <div class="upt-box"><table class="upt-t upt-t--hs${ph ? ' is-ph' : ''}"><thead><tr><th class="k">#</th>${th('n', 'Герой', 'h')}${cols.map((c) => th(c[0], ph && c[0] === 'pb' ? 'П + Б' : c[1], c[4] || '')).join('')}</tr></thead>
        <tbody>${cut('hs', L).map((x, i) => `<tr><td class="k mut num">${i + 1}</td><td class="h"><span class="upt-hero">${hi(x.k)}<span>${x.n}</span></span></td>${cols.map((c) => `<td class="${c[4] || ''}${S.hs === c[0] ? ' is-sc' : ''}">${c[3](x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${more('hs', L)}
      ${O ? '' : `<div class="upt-om"><div class="upt-rh"><b>Вне меты</b><small class="mut">${out.length} ${pl3(out.length, 'герой', 'героя', 'героев')} — никто не взял и не забанил</small></div><div class="upt-hcs">${out.map(chip).join('') || '<span class="mut">таких нет</span>'}</div>
        <div class="upt-rh"><b>Только в банах</b><small class="mut">${ban.length} — банили, но ни разу не взяли</small></div><div class="upt-hcs">${ban.map(chip).join('') || '<span class="mut">таких нет</span>'}</div></div>`}
      <div class="upt-ft mut">Героев в таблице: ${L.length} · фильтр «1-й / 2-й пик» — по команде, у которой был первый пик на карте · нажми на заголовок — сортировка</div></div>`
  }
  let HSEL = null
  const heroes = (el) => { HSEL = el; el.innerHTML = heroStats() }

  // ——— 7. Статы команд в карточках «Участников» ———
  const TS = (() => { const g = {}
    for (const x of PL) { const q = (g[x.team] ??= { k: 0, d: 0, a: 0, gpm: 0, n: 0, maps: new Set(), H: new Set() }); q.k += x.k; q.d += x.d; q.a += x.a; q.gpm += x.gpm; q.n++; q.maps.add(x.mp); q.H.add(x.hero) }
    return Object.fromEntries(Object.entries(g).map(([t, q]) => [t, { kda: (q.k + q.a) / Math.max(1, q.d), gpm: q.gpm / q.n, dur: [...q.maps].reduce((a, m) => a + m.dur, 0) / q.maps.size, pool: q.H.size, maps: q.maps.size }])) })()
  const teamStats = () => { const wp = $('#wp'); if (!wp || !window.PU_TEAMS) return
    wp.querySelectorAll('.pt-tm[data-drag]:not(.slot)').forEach((c) => { if (c.querySelector('.upt-ts')) return; const t = window.PU_TEAMS[+c.dataset.drag]?.dbId, s = TS[t]; if (!s) return
      const th = c.querySelector('.pt-th'); if (!th) return
      th.insertAdjacentHTML('afterend', `<div class="upt-ts" title="${s.maps} ${pl3(s.maps, 'карта', 'карты', 'карт')} на турнире"><span><small>KDA</small><b class="num">${fx(s.kda)}</b></span><span><small>GPM</small><b class="num">${Math.round(s.gpm)}</b></span><span><small>Карта</small><b class="num">${mmss(s.dur)}</b></span><span><small>Пул</small><b class="num">${s.pool}</b></span></div>`) }) }
  let wpObs = null
  const watchWp = () => { const wp = $('#wp'); if (!wp || wp._upt) return; wp._upt = true; (wpObs ||= new MutationObserver(() => teamStats())).observe(wp, { childList: true }); teamStats() }

  // ——— телефон: групповой этап без ухода за край — «Таблица / Каждый с каждым» (TI: «Таблица / Матчи») ———
  const groupsFix = () => { const c = [...document.querySelectorAll('#main section.card')].find((x) => /^Групповой этап/.test(x.querySelector('.hd b')?.textContent || '')); if (!c) return
    c.classList.add('upt-gs'); c.classList.toggle('upt-gs--ph', phone()); c.classList.toggle('upt-gs--ti', !EP7)
    c.classList.toggle('upt-gs--x', S.gv === 'x'); c.classList.toggle('upt-gs--t', S.gv !== 'x')
    let sg = c.querySelector('.upt-gsw'); if (!phone()) { sg?.remove(); return }
    if (!sg) { c.querySelector('.hd').insertAdjacentHTML('afterend', `<div class="upt-gsw">${seg('gv', [['t', 'Таблица'], ['x', EP7 ? 'Каждый с каждым' : 'Матчи по порядку']], S.gv, 'upt-seg--w')}</div>`) }
    else sg.innerHTML = seg('gv', [['t', 'Таблица'], ['x', EP7 ? 'Каждый с каждым' : 'Матчи по порядку']], S.gv, 'upt-seg--w') }

  // ——— раскладка: новые блоки в главной колонке ———
  const BLOCKS = { 'upt-meta': meta, 'upt-br': bracket, 'upt-ser': series, 'upt-rec': records, 'upt-pls': players }
  if (O) { delete BLOCKS['upt-br']; if (!O.st) delete BLOCKS['upt-rec']; document.documentElement.classList.add('upt-o') }   // v13–v16: плей-офф нет, рекорды — в блоке меты
  const html = (id) => { const s = BLOCKS[id](); if (!s) return null; const t = document.createElement('div'); t.innerHTML = s; return t.firstElementChild }
  const redraw = (id) => { const o = document.getElementById(id); if (id === 'upt-hs') { if (HSEL) { const b = o?.querySelector('.upt-box'), x = b?.scrollLeft, y = b?.scrollTop; HSEL.innerHTML = heroStats(); const nb = HSEL.querySelector('.upt-box'); if (nb) { nb.scrollLeft = x || 0; nb.scrollTop = y || 0 } } return }
    const b = o?.querySelector('.upt-box'), x = b?.scrollLeft, y = b?.scrollTop, n = html(id); if (o && n) { o.replaceWith(n); const nb = n.querySelector('.upt-box'); if (nb) { nb.scrollLeft = x || 0; nb.scrollTop = y || 0 } } }
  function arrange() {
    const l = $('#main .top-l'); if (!l) return
    for (const id of Object.keys(BLOCKS)) if (!document.getElementById(id)) { const n = html(id); if (n) l.append(n) }
    const gs = [...l.querySelectorAll(':scope > section.card')].find((x) => /^Групповой этап/.test(x.querySelector('.hd b')?.textContent || ''))
    // порядок: мета · сетка · группы · участники · по позициям · игроки · серии · рекорды · герои · (телефон) новости
    const want = ['upt-meta', 'upt-br', gs, 'wp', 'wpp', 'upt-pls', 'upt-ser', 'upt-rec', 'whs', 'wn'].map((x) => (typeof x === 'string' ? document.getElementById(x) : x)).filter((x) => x && x.parentElement === l)
    want.forEach((x) => l.append(x)); [...l.children].filter((x) => !want.includes(x)).forEach((x) => l.insertBefore(x, want[0] || null))
    if (O && O.ser === 'r' && !phone()) { const r = $('#main .top-r'), sw = document.getElementById('upt-ser'); if (r && sw && sw.parentElement !== r) { const wn = document.getElementById('wn'); wn && wn.parentElement === r ? r.insertBefore(sw, wn) : r.append(sw) } }
    if (O && O.bs) document.documentElement.classList.add('upt-bs-' + O.bs)
    groupsFix(); watchWp()
  }
  new MutationObserver(() => queueMicrotask(arrange)).observe($('#main'), { childList: true })
  document.addEventListener('DOMContentLoaded', arrange)

  // ——— нажатия (свои data-u — у _ours.js свои data-g / data-hs / data-hx на document) ———
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-u]'); if (!b || b.tagName === 'SELECT') return; const u = b.dataset.u, v = b.dataset.v
    if (u === 'br') { S.br = v; return redraw('upt-br') }
    if (u === 'ss') { S.ss = v; return redraw('upt-ser') }
    if (u === 'sr') { S.open[v] = !S.open[v]; return redraw('upt-ser') }
    if (u === 'ps') { S.psd = S.ps === v ? -S.psd : -1; S.ps = v; return redraw('upt-pls') }
    if (u === 'pos') { S.pos = +v; return redraw('upt-pls') }
    if (u === 'pg') { S.pg = v; return redraw('upt-pls') }
    if (u === 'min') { S.min = !S.min; return redraw('upt-pls') }
    if (u === 'hs') { S.hsd = S.hs === v ? -S.hsd : v === 'n' ? 1 : -1; S.hs = v; return redraw('upt-hs') }
    if (u === 'side') { S.side = v; return redraw('upt-hs') }
    if (u === 'fp') { S.fp = v; return redraw('upt-hs') }
    if (u === 'hsr') { Object.assign(S, { side: 'all', fp: 'all', hs: 'pb', hsd: -1 }); return redraw('upt-hs') }
    if (u === 'gv') { S.gv = v; return groupsFix() }
    if (u === 'swall') { S.swAll = true; return redraw('upt-ser') }
    if (u === 'more') { LIM[v] = true; return redraw(v === 'pl' ? 'upt-pls' : 'upt-hs') }
    if (u === 'mr') { S.mr = v; return redraw('upt-meta') } })
  document.addEventListener('change', (e) => { const s = e.target.closest('select[data-u="st"]'); if (!s) return; S.st = s.value; redraw('upt-ser') })

  return { heroes }
})()
