// Лаба w-predict-col — «Прогноз» главным в правой колонке (созвон 04.11 §4.5–4.11, задача 7; Claude-B).
// Начальник 04.11: прогноз — первым в колонке (на месте «Разбора»), в покое визуально главный — светится, по нему регулярно проходит блик;
// без шума (дубли «5 из 5», низ «угадано»), табы; карточка — как ставка на Polymarket / BetBoom: вопрос, выбор А / Б,
// у выбора — вероятность и сколько баллов получишь; прогнозов сколько угодно — в начале и по ходу матча, по событиям
// («умрёт ли Larl через 3 минуты — да / нет, +6»); кнопка «развернуть» — прогноз на всю колонку. Эфир со страницы убран (§4.11).
// Ставится на место прогнозов: window.GS_VOTE (хозяин — ../gs-match/_gs.js, слот vote2); «Разбор» (GS_ACT) и эфир (GS_PROMO) страница варианта снимает.
// window.PC: poly — как Polymarket (кнопки «Да / Нет» с вероятностью, у главного — шкала шанса) ·
//            bb — как BetBoom (плитки исходов, баллы крупно, как коэффициент) · feed — главный сверху, ниже лента: новые приходят по событиям.
// ‼️ Вопросы, вероятности и события — пример (настоящей линии нет). Баллы = 10 × 50 / вероятность (реже — дороже), не меньше 2.
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  const MODE = window.PC || 'poly'
  const pts = (p) => Math.max(2, Math.round((10 * 50) / Math.max(p, 1)))
  let MM = null // матч хозяина, который сейчас рисуем (у каждого .pc-host — свой, в ленте их несколько)
  const HOSTS = new Set()
  const team = (id) => { const t = ((window.GS_DATA || {}).teams || {})[id] || {}, d = window.DB && (DB.team(+id) || DB.team(t.name)); return { id, name: t.name || '—', tag: d?.mid || t.tag || t.name || '—', logo: `img/teams/${id}.png` } }
  // игроки матча по команде (база: DB.players) — для событийных вопросов
  const roster = (id) => { const t = window.DB && (DB.team(+id) || DB.team(team(id).name)); return t ? DB.players({ team: t.id }).filter((p) => !p.sub && typeof p.role === 'number').sort((a, b) => a.role - b.role).map((p) => p.nick) : [] } // по позиции: [0] — керри, [1] — мид
  // Линия: q — вопрос, ev — событие (метка), o — исходы [подпись, вероятность, команда?], t — до какого времени карты, kind — match / event
  function line() {
    const A = team(MM?.A), B = team(MM?.B), ra = roster(MM?.A), rb = roster(MM?.B)
    return [
      { id: 'rosh', ev: 'Рошан', q: window.PC_LONGQ ? 'Кто заберёт Рошана, если драка у ямы начнётся до 40-й минуты и обе команды будут с байбэками?' : 'Кто заберёт Рошана?', t: '34:40', hot: true, o: [[A.tag, 38, A], [B.tag, 62, B]] },
      { id: 'die', ev: 'Событие', q: `Умрёт ли ${rb[1] || 'Larl'} в ближайшие 3 минуты?`, t: '36:30', o: [['Да', 44], ['Нет', 56]] },
      { id: 'map', ev: 'Карта', q: 'Кто возьмёт Map 3?', t: 'конца карты', o: [[A.tag, 31, A], [B.tag, 69, B]] },
      { id: 'rax', ev: 'Казармы', q: 'Чьи казармы падут первыми?', t: 'конца карты', o: [[A.tag, 66, A], [B.tag, 34, B]] },
      { id: 'long', ev: 'Длина', q: 'Map 3 дольше 45 минут?', t: '45:00', o: [['Да', 41], ['Нет', 59]] },
      { id: 'fight', ev: 'Драка', q: 'Следующая драка — 3 убийства и больше?', t: '38:00', o: [['Да', 57], ['Нет', 43]] },
    ]
  }
  // По ходу матча приходят новые (§4.8) — пример: раз в 25 с, по кругу
  const INCOMING = () => { const A = team(MM?.A), B = team(MM?.B), ra = roster(MM?.A); return [
    { id: 'aegis', ev: 'Событие', q: `Аегис потеряют за 2 минуты?`, t: '37:10', o: [['Да', 28], ['Нет', 72]], fresh: true },
    { id: 'buy', ev: 'Событие', q: `${ra[0] || 'Satanic'} выкупится после смерти?`, t: '35:00', o: [['Да', 63], ['Нет', 37]], fresh: true },
    { id: 'tower', ev: 'Башня', q: 'Чья башня упадёт следующей?', t: '39:00', o: [[A.tag, 47, A], [B.tag, 53, B]], fresh: true },
  ] }
  // Решённые раньше (вкладка «Мои»)
  const DONE = () => { const A = team(MM?.A), B = team(MM?.B); return [
    { id: 'd1', ev: 'Первая кровь', q: 'Кто прольёт первую кровь?', at: 'Map 3 · 02:14', me: A.tag, ok: false, p: 10 },
    { id: 'd2', ev: 'Первая башня', q: 'Чья башня упадёт первой?', at: 'Map 3 · 11:50', me: B.tag, ok: true, p: 8 },
    { id: 'd3', ev: 'Рошан', q: 'Кто заберёт Рошана?', at: 'Map 3 · 21:05', me: B.tag, ok: true, p: 9 },
  ] }
  const st = { pick: {}, tab: 'open', full: false, extra: [], n: 0, i: 0 }
  // v4–v6 (дирижёр 04.11: «начальник говорил — по одному»; созвон 2·09:04–09:34: «видеть вверху прогноз… согласен или нет»): window.PC_ONE —
  // в покое один прогноз; ‹ › и точки — перелистать; ответил — через секунду следующий без ответа; новый по событию встаёт первым; все — «развернуть»
  const ONE = !!window.PC_ONE
  // v13–v14 (дирижёр 05.11: «прогнозы приходят по событию, сильно копиться не будут — показать, когда событие пришло и когда накопились; в настройку вынести»):
  //   PC_EVT — вместо потока раз в 25 с — состояние из переключалки слева снизу: «Ждём событие» (пусто) · «Пришло событие» (один новый, вспышка) · «Накопились» (три открытых — зашёл посреди карты)
  const EVT = !!window.PC_EVT
  const open = () => !EVT ? [...st.extra, ...line()] : st.evt === 'wait' ? [] : st.evt === 'one' ? [INCOMING()[st.evN % 3]] : line().slice(0, 3)
  const mineOpen = () => open().filter((x) => st.pick[x.id] != null)
  const ic = { full: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 2.5h3.5V6M6 13.5H2.5V10M13.5 2.5 9 7M2.5 13.5 7 9"/></svg>',
    min: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M13.5 6H10V2.5M2.5 10H6v3.5M10 6l3.5-3.5M6 10l-3.5 3.5"/></svg>' }
  const lg = (o) => (o[2] ? `<img class="pc-lg" src="${o[2].logo}" alt="">` : '')

  // ── poly: кнопки «исход · %», под ними «+баллы»; у главного — шкала шанса
  const polyBtns = (x) => `<div class="pc-btns">${x.o.map((o, i) => { const on = st.pick[x.id] === i
    return `<button class="pc-b pc-b--${i ? 'n' : 'y'}${on ? ' is-on' : ''}${st.pick[x.id] != null && !on ? ' is-off' : ''}" data-pc="${x.id}" data-i="${i}">${lg(o)}<b>${esc(o[0])}</b><em class="num">${o[1]}%</em><small class="num">+${pts(o[1])}</small></button>` }).join('')}</div>`
  const polyHero = (x) => { const lead = x.o[0][1] >= x.o[1][1] ? 0 : 1, p = x.o[lead][1]
    return `<div class="pc-hero"><div class="pc-q"><span class="pc-ev"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span><b>${esc(x.q)}</b></div>
      <div class="pc-gauge"><svg viewBox="0 0 100 56"><path d="M8 50a42 42 0 0 1 84 0" class="tr"/><path d="M8 50a42 42 0 0 1 84 0" class="fl${lead ? ' fl--n' : ''}" style="stroke-dasharray:${(132 * p) / 100} 200"/></svg><b class="num">${p}%</b><small>${esc(x.o[lead][0])}</small></div></div>${polyBtns(x)}`
  }
  const polyRow = (x) => `<div class="pc-row${x.fresh ? ' is-new' : ''}"><div class="pc-q"><span class="pc-ev">${esc(x.ev)} · до ${esc(x.t)}</span><b>${esc(x.q)}</b></div>${polyBtns(x)}</div>`

  // ── bb: плитки исходов, баллы крупно (как коэффициент), рынок — заголовком
  const bbTiles = (x) => `<div class="pc-tiles">${x.o.map((o, i) => { const on = st.pick[x.id] === i
    return `<button class="pc-t${on ? ' is-on' : ''}" data-pc="${x.id}" data-i="${i}"><span>${lg(o)}${esc(o[0])}</span><b class="num">+${pts(o[1])}</b><small class="num">${o[1]}%</small></button>` }).join('')}</div>`
  const bbCard = (x, big) => `<div class="pc-bb${big ? ' pc-bb--big' : ''}${x.fresh ? ' is-new' : ''}"><div class="pc-q"><span class="pc-ev">${big ? '<i></i>' : ''}${esc(x.ev)} · до ${esc(x.t)}</span><b>${esc(x.q)}</b></div>${bbTiles(x)}</div>`

  // ── feed: главный — крупно, ниже лента компактных строк (выбор — двумя половинками)
  const feedRow = (x) => { const p = st.pick[x.id]
    return `<div class="pc-fr${x.fresh ? ' is-new' : ''}"><div class="pc-fq"><b>${esc(x.q)}</b><small>${esc(x.ev)} · до ${esc(x.t)}</small></div>
      <div class="pc-half">${x.o.map((o, i) => `<button class="pc-h${p === i ? ' is-on' : ''}${p != null && p !== i ? ' is-off' : ''}" data-pc="${x.id}" data-i="${i}">${esc(o[0])} <em class="num">+${pts(o[1])}</em></button>`).join('')}</div></div>` }

  const mineList = () => { const D = DONE(), O = mineOpen(), sum = D.filter((d) => d.ok).reduce((s, d) => s + d.p, 0)
    return `<div class="pc-mine">${O.map((x) => `<div class="pc-m"><span class="pc-st wait">…</span><b>${esc(x.q)}</b><small>${esc(x.o[st.pick[x.id]][0])} · ждём</small><em class="num">+${pts(x.o[st.pick[x.id]][1])}</em></div>`).join('')}
      ${D.map((d) => `<div class="pc-m"><span class="pc-st ${d.ok ? 'ok' : 'no'}">${d.ok ? '✓' : '✕'}</span><b>${esc(d.q)}</b><small>${esc(d.me)} · ${esc(d.at)}</small><em class="num ${d.ok ? 'ok' : ''}">${d.ok ? '+' + d.p : '0'}</em></div>`).join('')}
      ${window.PC_V20 ? '</div>' : ''}<div class="pc-sum"><span>За матч</span><b class="num">+${sum}</b></div>${window.PC_V20 ? '' : '</div>'}` }

  // ── v9–v12 (дирижёр 04.11: «прогнозы не нравятся — разные варианты по референсам начальника», созвон 4.7: «ближе к Polymarket / BetBoom»; референсы — внутренняя документация/04.11/референсы/01–10):
  // pm — карточка сделки Polymarket (02): матч и выбранный исход сверху, две кнопки исходов, «получишь +N», кнопка «Сделать прогноз» ·
  // ks — Kalshi «First Blood» (06): строки исходов с полосой шанса под именем, справа «+N» и шанс в рамке ·
  // bb2 — рынок BetBoom (09): плитки «исход … баллы», под ними — доля прогнозов полосой ·
  // cp — как bb2, но с купоном (09, справа): выбрал — ниже купон «твой прогноз» и кнопка «Подтвердить»
  const conf = st.conf = st.conf || {}
  const tag2 = () => { const A = team(MM?.A), B = team(MM?.B); return `${A.tag} — ${B.tag}` }
  const pmCard = (x) => { const p = st.pick[x.id], o = p != null ? x.o[p] : null
    return `<div class="pc-k pc-pm"><div class="pc-q"><span class="pc-ev"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span><b>${esc(x.q)}</b></div>
      <div class="pc-pm-sel">${o ? `${lg(o)}<span><small>${esc(tag2())}</small><b class="${p ? 'n' : 'y'}">${esc(o[0])}</b></span>` : `<span><small>${esc(tag2())}</small><b class="pc-mut">Выбери исход</b></span>`}</div>
      <div class="pc-pm-b">${x.o.map((o, i) => `<button class="pc-pmb pc-pmb--${i ? 'n' : 'y'}${p === i ? ' is-on' : ''}" data-pc="${x.id}" data-i="${i}">${esc(o[0])} <em class="num">${o[1]}%</em></button>`).join('')}</div>
      <div class="pc-pm-pay"><span>Получишь, если угадаешь</span><b class="num">${o ? '+' + pts(o[1]) : '+0'}</b></div>
      <button class="pc-pm-go${o ? '' : ' is-dis'}${conf[x.id] ? ' is-done' : ''}" data-conf="${x.id}">${conf[x.id] ? 'Прогноз принят ✓' : 'Сделать прогноз'}</button></div>` }
  const ksCard = (x) => { const p = st.pick[x.id]
    return `<div class="pc-k pc-ks"><div class="pc-q"><span class="pc-ev"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span><b>${esc(x.q)}</b></div>
      ${x.o.map((o, i) => `<button class="pc-ksr${p === i ? ' is-on' : ''}${p != null && p !== i ? ' is-off' : ''}" data-pc="${x.id}" data-i="${i}">${o[2] ? lg(o) : `<span class="pc-ksd">${i ? 'Н' : 'Д'}</span>`}<span class="pc-ksn"><b>${esc(o[0])}</b><i style="width:${o[1]}%" class="${i ? 'n' : 'y'}"></i></span><small class="num">+${pts(o[1])}</small><em class="num">${o[1]}%</em></button>`).join('')}</div>` }
  const FIRE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 14.5c2.6 0 4.5-1.8 4.5-4.4 0-2.9-2.6-4.2-3-7.6-1.9 1-3 3-2.8 4.8-.9-.4-1.4-1.3-1.5-2.1C3.9 6.4 3.5 8 3.5 10.1c0 2.6 1.9 4.4 4.5 4.4z"/></svg>'
  const PPL = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="6" cy="5.5" r="2.2"/><path d="M2 13c.4-2.2 2-3.5 4-3.5s3.6 1.3 4 3.5"/><circle cx="11.2" cy="6" r="1.7"/><path d="M11 9.6c1.6 0 2.7 1 3 2.6"/></svg>'
  const bb2Card = (x, coupon) => { const p = st.pick[x.id], a = x.o[0][1], share = Math.round(100 - a * 0.9) /* доля прогнозов — пример: кто как ответил */
    return `<div class="pc-k pc-bb2"><div class="pc-bbh">${FIRE}<b>${esc(x.q)}</b></div><span class="pc-ev pc-ev--bb"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span>
      <div class="pc-bbt">${x.o.map((o, i) => `<button class="pc-bbx${p === i ? ' is-on' : ''}" data-pc="${x.id}" data-i="${i}"><span>${lg(o)}${esc(o[0])}</span><b class="num">+${pts(o[1])}</b></button>`).join('')}</div>
      <div class="pc-bbs">${PPL}<div><div class="pc-bbbar"><i style="width:${100 - share}%"></i><i></i></div><div class="pc-bbl"><span>${esc(x.o[0][0])} <b class="num">${100 - share}%</b></span><span>${esc(x.o[1][0])} <b class="num">${share}%</b></span></div></div></div>
      ${coupon && p != null ? `<div class="pc-cp"><div class="pc-cpr"><span><small>Твой прогноз</small><b>${esc(x.o[p][0])}</b></span><b class="num">+${pts(x.o[p][1])}</b></div><button class="pc-cpgo${conf[x.id] ? ' is-done' : ''}" data-conf="${x.id}">${conf[x.id] ? 'Принят ✓' : 'Подтвердить прогноз'}</button></div>` : ''}</div>` }
  const NEWC = { pm: pmCard, ks: ksCard, bb2: (x) => bb2Card(x), cp: (x) => bb2Card(x, true) }
  // ── v13–v16 (дирижёр 04.11: «ты всё примерно одно сделал, только центр поменял — надо разные»): разные по устройству виджета, не по карточке
  // lst — лента рынков (Thunderpick 10 / Polymarket 01): все открытые строками, у каждой «Да +N · Нет +N», первый подсвечен; фикс. высота, прокрутка ·
  // chart — график шанса (Polymarket 02): одна ставка, две линии шанса за последние минуты, крупные % у концов, кнопки ниже ·
  // swipe — стопка (Kalshi 07, телефон: Yes / No): карточка сверху стопки, ✕ нет · ✓ да или смахни влево / вправо, следующая выглядывает снизу ·
  // strip — полоса мини-карточек сверху (Kalshi 06, лайв-полоса) + выбор снизу: переключатель исходов, шанс, «получишь», кнопка
  const hsh = (x) => { let v = 7; for (const ch of String(x)) v = (v * 31 + ch.charCodeAt(0)) >>> 0; return v }
  const ser = (x) => { let v = 50, h = hsh(x.id); const out = []; for (let k = 0; k < 24; k++) { h = (h * 1103515245 + 12345) >>> 0; v += ((h % 1000) / 1000 - 0.5) * 9; v = Math.max(8, Math.min(92, v)); out.push(v) } const d = x.o[0][1] - out.at(-1); return out.map((y, k) => y + (d * k) / 23) }
  const lstBody = (L) => `<div class="pc-lst">${L.map((x, n) => { const p = st.pick[x.id]
    return `<div class="pc-lr${n === 0 ? ' is-hot' : ''}${x.fresh ? ' is-new' : ''}"><div class="pc-lq">${n === 0 ? '<i></i>' : ''}<b>${esc(x.q)}</b><small>${esc(x.ev)} · до ${esc(x.t)}</small></div>
      <div class="pc-lb">${x.o.map((o, i) => `<button class="${p === i ? 'is-on' : ''}${p != null && p !== i ? ' is-off' : ''}" data-pc="${x.id}" data-i="${i}"><span>${esc(o[0])}</span><b class="num">+${pts(o[1])}</b></button>`).join('')}</div></div>` }).join('')}</div>`
  const chartBody = (x) => { const S = ser(x), W = 280, H = 96, X = (k) => (k / 23) * W, Y = (v) => H - (v / 100) * H, p = st.pick[x.id]
    let ly = Y(S.at(-1)), ln = Y(100 - S.at(-1)); if (Math.abs(ly - ln) < 36) { const m = (ly + ln) / 2, up = ly <= ln ? -1 : 1; ly = m + up * 18; ln = m - up * 18 }
    const path = (f) => S.map((v, k) => `${k ? 'L' : 'M'}${X(k).toFixed(1)},${Y(f(v)).toFixed(1)}`).join('')
    return `<div class="pc-ch"><div class="pc-q"><span class="pc-ev"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span><b>${esc(x.q)}</b></div>
      <div class="pc-chw"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path class="g" d="M0,${Y(50)}H${W}"/><path class="y" d="${path((v) => v)}"/><path class="n" d="${path((v) => 100 - v)}"/></svg>
        <div class="pc-chl"><span class="y" style="top:${(ly / H) * 100}%">${esc(x.o[0][0])}<b class="num">${x.o[0][1]}%</b></span><span class="n" style="top:${(ln / H) * 100}%">${esc(x.o[1][0])}<b class="num">${x.o[1][1]}%</b></span></div></div>
      <div class="pc-chx"><span>10 мин назад</span><span>сейчас</span></div>
      <div class="pc-chb">${x.o.map((o, i) => `<button class="pc-chbt pc-chbt--${i ? 'n' : 'y'}${p === i ? ' is-on' : ''}" data-pc="${x.id}" data-i="${i}">${lg(o)}${esc(o[0])}<b class="num">+${pts(o[1])}</b></button>`).join('')}</div></div>` }
  const swipeBody = (L) => { const todo = L.filter((x) => st.pick[x.id] == null), x = todo[0]
    if (!x) return `<div class="pc-sw-done"><b>Все прогнозы сделаны</b><small>Новые придут по событиям матча</small></div>`
    const lead = x.o[0][1] >= x.o[1][1] ? 0 : 1
    return `<div class="pc-sw">${todo.slice(1, 3).map((y, k) => `<div class="pc-swc pc-swc--b${k + 1}"></div>`).reverse().join('')}
      <div class="pc-swc pc-swc--f" data-swipe="${x.id}"><span class="pc-ev"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span><b class="pc-swq">${esc(x.q)}</b>
        <div class="pc-swp"><b class="num">${x.o[lead][1]}%</b><small>думают «${esc(x.o[lead][0])}»</small></div>
        <div class="pc-swb"><button class="pc-swn" data-pc="${x.id}" data-i="1"><i>✕</i><span>${esc(x.o[1][0])}</span><b class="num">+${pts(x.o[1][1])}</b></button><button class="pc-swy" data-pc="${x.id}" data-i="0"><i>✓</i><span>${esc(x.o[0][0])}</span><b class="num">+${pts(x.o[0][1])}</b></button></div></div></div>
      <div class="pc-swh"><span>← ${esc(x.o[1][0])}</span><span class="num">${todo.length} без ответа</span><span>${esc(x.o[0][0])} →</span></div>` }
  const stripBody = (L) => { st.i = Math.min(st.i, L.length - 1); const x = L[st.i], p = st.pick[x.id], sel = p ?? 0
    return `<div class="pc-sp">${L.map((y, k) => `<button class="pc-spc${k === st.i ? ' is-on' : ''}${st.pick[y.id] != null ? ' is-done' : ''}${y.fresh ? ' is-new' : ''}" data-go="${k}"><small>${esc(y.ev)}</small><b>${esc(y.q)}</b><span class="num">${esc(y.o[0][0])} ${y.o[0][1]}% · ${esc(y.o[1][0])} ${y.o[1][1]}%</span></button>`).join('')}</div>
      <div class="pc-spd"><b class="pc-spq">${esc(x.q)}</b><span class="pc-ev">до ${esc(x.t)}</span>
        <div class="pc-spt">${x.o.map((o, i) => `<button class="${p === i ? 'is-on' : ''} ${i ? 'n' : 'y'}" data-pc="${x.id}" data-i="${i}">${esc(o[0])} <em class="num">${o[1]}%</em></button>`).join('')}</div>
        <div class="pc-spr"><span>Шанс</span><b class="num">${x.o[sel][1]}%</b></div><div class="pc-spr"><span>Получишь, если угадаешь</span><b class="num">+${pts(x.o[sel][1])}</b></div>
        <button class="pc-spgo${p == null ? ' is-dis' : ''}${conf[x.id] ? ' is-done' : ''}" data-conf="${x.id}">${conf[x.id] ? 'Прогноз принят ✓' : p == null ? 'Выбери исход' : 'Сделать прогноз · ' + esc(x.o[p][0])}</button></div>` }
  // v17 (дирижёр 04.11: «график шанса нравится — повыше, 3:4, фиксированный размер, меньше скругление, по краю гоняет блик, как раньше»): PC_EDGE — виджет 3 : 4, скругление 10, блик бежит по рамке (как билет widget-predict v41), график тянется на свободную высоту
  // v18 (дирижёр 04.11: «раскрытия на полный экран не должно быть; нулевая линия графика всегда в одном месте; линию под шапкой убрать; переключение влево-вправо убрать»): PC_NOFULL — без «развернуть»; PC_V18 — вопрос всегда в две строки, график фиксированной высоты (середина 50 % — на одном месте), без линии под шапкой, без ‹ ›
  // v19 (дирижёр 04.11: «прижать кнопки к низу»): PC_V19 — кнопки исходов внизу, над точками; свободное место — между графиком и кнопками
  // v20 (дирижёр 04.11: «когда все выбраны — показывать „Мои“; „За матч“ — в абсолюте, прижата к низу; нулевую линию — ровно по центру»): PC_V20 — ответил на последний — открывается «Мои»;
  // «За матч» стоит внизу виджета, список над ней прокручивается; график занимает всё место между вопросом и кнопками, середина (50 %) — посередине этого места
  // v21 (дирижёр 04.11: «на мобиле по высоте нужно меньше»): PC_V21 — на телефоне (до 799) виджет 1 : 1 вместо 3 : 4
  // v22 (дирижёр 04.11: «на маленьком экране плохо — блюр наезжает; на планшете сильно большой»): PC_V22 — высота не больше 440 на любой ширине (планшет);
  // на телефоне 4 : 3 (ниже, чем 1 : 1) и отступ снизу под нижнее меню, чтобы его размытие не наезжало на точки
  // v23 (дирижёр 04.11: «базовая линия должна быть по центру, даже на маленьких»): PC_V23 — место под вопрос на две строки сохраняется (линия на одном месте),
  // но короткий вопрос прижат книзу этого места — видимый зазор над графиком и под ним одинаковый, линия 50 % — посередине и на глаз
  // v24 (дирижёр 04.11: «отступ над вопросом большой — может поменьше»): PC_V24 — вопрос сразу под шапкой, места под вторую строку не держим; линия 50 % — посередине между вопросом и кнопками
  // (у вопроса в две строки она ниже на ~10 px, чем у вопроса в одну)
  // ── созвон 05.11 §6 (задача 6; лаба w-predict-2): yn — вопрос по центру, под ним две большие кнопки исходов одна над другой (у каждой — шанс и сколько получишь), графика нет.
  //   PC_YN = 'color' — кнопки цветом исхода (первый — зелёный, второй — красный), иначе нейтральные, выбранная — золотом.
  //   PC_STILL — без бегающего блика: рамка светится ровно; пришёл новый прогноз — вспышка свечения на 3 с (pc--ping), и только тогда
  const ynBody = (L) => { st.i = Math.min(st.i, L.length - 1); const x = L[st.i], p = st.pick[x.id]
    return `<div class="pc-yn${IDEAL ? ' pc-yn--id' : ''}${x.fresh ? ' is-new' : ''}${window.PC_YN === 'color' ? ' pc-yn--c' : ''}"><div class="pc-ynm"><span class="pc-ev"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span><b class="pc-ynq">${esc(x.q)}</b></div>
      <div class="pc-ynb">${x.o.map((o, i) => `<button class="pc-ynbt pc-ynbt--${i ? 'n' : 'y'}${p === i ? ' is-on' : ''}${p != null && p !== i ? ' is-off' : ''}" data-pc="${x.id}" data-i="${i}"${IDEAL ? ` style="--p:${o[1]}%"` : ''}><span class="pc-ynl">${lg(o)}${esc(o[0])}</span><small class="num">${o[1]}%</small><b class="num">+${pts(o[1])}</b></button>`).join('')}</div></div>` + (IDEAL ? idNav(L) : oneNav(L)) }
  // v3 «идеальная по начальнику» (дирижёр 05.11; сводка — внутренняя документация/прогнозы-что-знаем.md): PC_IDEAL — как v2, плюс
  //   у кнопки — доля голосов полосой (как Polymarket, «вероятность прогноза»); вместо точек — поток «Дальше»: две следующие без ответа (прогнозов много, идут по событиям);
  //   внизу — «Экспресс»: сколько прогнозов дал и сколько баллов получишь, если все сбудутся (02.11: «формат экспресса как финал») → «Мои»
  const IDEAL = !!window.PC_IDEAL
  const idNav = (L) => { const nx = L.map((x, i) => [x, i]).filter(([x, i]) => i !== st.i && st.pick[x.id] == null), mine = L.filter((x) => st.pick[x.id] != null), pot = mine.reduce((a, x) => a + pts(x.o[st.pick[x.id]][1]), 0)
    return `<div class="pc-idq"><span class="pc-idh">Дальше <i class="num">${nx.length}</i></span>${nx.slice(0, 2).map(([x, i]) => `<button class="pc-idr" data-go="${i}"><span class="pc-ev"><i></i>${esc(x.ev)}</span><b>${esc(x.q)}</b><em class="num">до ${esc(x.t)}</em></button>`).join('') || '<span class="pc-ide">Ответил на все — новые придут по ходу карты</span>'}</div>
      <button class="pc-idx" data-tab="mine"><span>Экспресс · <i class="num">${mine.length}</i> из ${L.length}</span><b class="num">${pot ? '+' + pot : '—'}</b></button>` }
  // v5 (дирижёр 05.11: «что-то похожее на Polymarket, только в наших токенах и с логикой начальника»): PC_SLIP — как карточка ставки Polymarket:
  //   сверху «купон» — вопрос, две большие кнопки исходов одна над другой (доля голосов полосой), «Если сбудется +N баллов» крупно (вместо суммы $ — баллы, ставки нет),
  //   кнопка «Сделать прогноз» — баллы летят в кошелёк в шапке «зарезервированными»; ниже — линии, как у Polymarket: вопрос и две кнопки исходов, клик — вопрос в купон;
  //   внизу — «Экспресс», как «Комбо»: сколько прогнозов дал и сколько баллов, если все сбудутся → «Мои»
  const SLIP = !!window.PC_SLIP
  const slOpen = (L) => L.filter((x) => !st.conf?.[x.id])
  const slipBody = (L) => { const C = st.conf = st.conf || {}, O = slOpen(L)
    if (!O.length) return `<div class="pc-sle">Ответил на все прогнозы — новые придут по ходу карты</div>` + slX(L)
    st.i = Math.max(0, Math.min(st.i, L.length - 1)); if (C[L[st.i].id]) st.i = L.indexOf(O[0])
    const x = L[st.i], p = st.pick[x.id], ic = x.o[0][2] ? `<img src="${x.o[0][2].logo}" alt="">` : '<i></i>'
    const card = `<div class="pc-slc"><div class="pc-slh"><span class="pc-sli">${ic}</span><span class="pc-slm"><small>${esc(x.ev)} · до ${esc(x.t)}</small><b>${esc(x.q)}</b></span><span class="pc-q" style="display:none"><b>${esc(x.q)}</b></span></div>
      <div class="pc-slb">${x.o.map((o, i) => `<button class="pc-slo pc-slo--${i ? 'n' : 'y'}${p === i ? ' is-on' : ''}${p != null && p !== i ? ' is-off' : ''}" data-sp="${x.id}" data-i="${i}" style="--p:${o[1]}%"><span class="pc-ynl">${lg(o)}${esc(o[0])}</span><b class="num">${o[1]}%</b></button>`).join('')}</div>
      <div class="pc-sla"><span>Если сбудется</span><b class="num${p == null ? ' is-0' : ''}">+${p == null ? 0 : pts(x.o[p][1])}</b></div>
      <div class="pc-slp">${p == null ? '' : `<span>Сделали так же</span><b class="num">${x.o[p][1]}%</b>`}</div>
      <button class="pc-slgo" ${p == null ? 'disabled' : `data-conf="${x.id}"`}>${p == null ? 'Выбери исход' : `Сделать прогноз · +${pts(x.o[p][1])}`}</button></div>`
    const rows = O.filter((y) => y !== x).map((y) => { const q = st.pick[y.id], j = L.indexOf(y)
      return `<div class="pc-slr"><button class="pc-slrq" data-go="${j}"><small>${esc(y.ev)} · до ${esc(y.t)}</small><b>${esc(y.q)}</b></button><span class="pc-slrb">${y.o.map((o, i) => `<button class="pc-slo pc-slo--${i ? 'n' : 'y'} pc-slo--s${q === i ? ' is-on' : ''}" data-sp="${y.id}" data-i="${i}"><span>${esc(o[0])}</span><b class="num">${o[1]}%</b></button>`).join('')}</span></div>` }).join('')
    return card + (rows ? `<div class="pc-sll"><div class="pc-slt">Ещё прогнозы <i class="num">${O.length - 1}</i></div>${rows}</div>` : '') + slX(L) }
  const slX = (L) => { const D = L.filter((x) => st.conf?.[x.id]), sum = D.reduce((a, x) => a + pts(x.o[st.pick[x.id]][1]), 0)
    return `<button class="pc-slx" data-tab="mine"><span class="pc-slxi">${D.length}</span><span>Экспресс · ${D.length ? `${D.length} ${D.length === 1 ? 'прогноз' : D.length < 5 ? 'прогноза' : 'прогнозов'}` : 'пока пусто'}</span><b class="num">${sum ? '+' + sum : ''}</b><i>›</i></button>` }
  // v6–v8 (дирижёр 05.11: «v5 чересчур длинный, плохой вариант; три новых; без таких больших цифр; рефы убрать») — PC_SL, компактный купон в высоте виджета (3 : 4, не выше 440):
  //   общее — вопрос, две кнопки исходов одна над другой (доля голосов полосой, справа шанс и «+баллы» мелко), «Сделать прогноз» → баллы в кошелёк, следующий встаёт сам; внизу строкой «Экспресс»
  //   PC_SL = 'nav' — листать стрелками «‹ 1 из 6 ›» над вопросом · 'chips' — сверху лента событий-чипов (Рошан · Событие · Карта…), клик — вопрос · 'deck' — под купоном торчат две следующие карточки-полоски
  const SL = window.PC_SL || ''
  const slCard = (x) => { const p = st.pick[x.id], ic = x.o[0][2] ? `<img src="${x.o[0][2].logo}" alt="">` : ''
    return `<div class="pc-sk"><span class="pc-ev"><i></i>${esc(x.ev)} · до ${esc(x.t)}</span><b class="pc-skq">${esc(x.q)}</b><span class="pc-q" style="display:none"><b>${esc(x.q)}</b></span>
      <div class="pc-skb">${x.o.map((o, i) => `<button class="pc-sko pc-sko--${i ? 'n' : 'y'}${p === i ? ' is-on' : ''}${p != null && p !== i ? ' is-off' : ''}" data-sp="${x.id}" data-i="${i}" style="--p:${o[1]}%"><span class="pc-ynl">${lg(o)}${esc(o[0])}</span><small class="num">${o[1]}%</small><b class="num">+${pts(o[1])}</b></button>`).join('')}</div>
      <button class="pc-skgo" ${p == null ? 'disabled' : `data-conf="${x.id}"`}>${p == null ? 'Выбери исход' : `Сделать прогноз · +${pts(x.o[p][1])}`}</button></div>` }
  const slBody = (L) => { const O = slOpen(L)
    if (!O.length) return `<div class="pc-sle">Ответил на все — новые придут по ходу карты</div>` + slX(L)
    if (st.conf?.[L[st.i]?.id] || !L[st.i]) st.i = L.indexOf(O[0]); const x = L[st.i], k = O.indexOf(x)
    const top = SL === 'chips' ? `<div class="pc-skc">${O.map((y) => `<button class="${y === x ? 'is-on' : ''}${st.pick[y.id] != null ? ' is-pk' : ''}" data-go="${L.indexOf(y)}">${esc(y.ev)}</button>`).join('')}</div>`
      : SL === 'nav' ? `<div class="pc-skn"><button data-go="${L.indexOf(O[k - 1] || x)}" ${k ? '' : 'disabled'}>‹</button><span class="num">${k + 1} из ${O.length}</span><button data-go="${L.indexOf(O[k + 1] || x)}" ${k < O.length - 1 ? '' : 'disabled'}>›</button></div>` : ''
    const deck = SL === 'deck' ? `<div class="pc-skd">${O.filter((y) => y !== x).slice(0, 2).map((y, i) => `<button class="pc-skd${i}" data-go="${L.indexOf(y)}"><span>${esc(y.ev)}</span><b>${esc(y.q)}</b></button>`).join('')}</div>` : ''
    return `<div class="pc-sl2 pc-sl2--${SL}">${top}${slCard(x)}${deck}</div>` + slX(L) }
  // v9–v12 (дирижёр 05.11: «базовый виджет не нравится, экспресса быть не должно; кардинально разные виджеты — общее только то, что говорил начальник, и ограниченная высота»):
  //   общее по начальнику — вопрос в центре внимания, два исхода крупно одна над другой, баллы (не деньги), без графика, ровное свечение и вспышка на новом; нажал — прогноз принят, баллы летят в кошелёк, следом следующий
  //   PC_K = 'timer' — таймер: огромные кнопки, под вопросом тает полоса времени до события · 'deck' — колода: карточка, за ней торчат следующие, ответил — карточка уходит
  //        'duel' — дуэль: исход сверху и исход снизу, вопрос плашкой ровно между ними · 'feed' — лента: новые прогнозы приходят сверху, верхний открыт, ниже — строки с твоим ответом
  const K = window.PC_K || '', MYB = !!window.PC_MYB && !window.PC_NOMY
  // v23 (дирижёр 05.11: «версию дуэли, где оно заполняется по количеству игроков в реальном времени, кто как проголосовал»): PC_LIVE —
  //   у исхода заливка слева направо по доле голосов, справа «38% · 1 284»; голоса капают раз в секунду (пример), твой голос — тоже +1; обновляем на месте, без перерисовки
  // v24–v26 (дирижёр 05.11: «когда прогноз есть — мигает или по рамке крутится; когда нет — спокойный, как обычный виджет»): PC_ACT — есть открытый прогноз: рамка золотом «дышит»; нет (ждём / всё собрано) — обычная рамка, без свечения
  // v27–v28 (дирижёр 05.11: «дышит — не видно; сделай крутящийся, но поаккуратнее»): PC_SPIN (вместе с PC_ACT) — есть прогноз: по рамке медленно (8 с) идёт короткий мягкий золотой блик; нет — обычная рамка
  const LIVE = !!window.PC_LIVE, VT = {}, nf = (n) => n.toLocaleString('ru-RU')
  const vOf = (x) => VT[x.id] || (VT[x.id] = x.o.map((o) => Math.round(o[1] * (8 + (x.id.length % 5)))))
  const vp = (V, i) => Math.round((V[i] / Math.max(1, V[0] + V[1])) * 100)
  if (LIVE) setInterval(() => { Object.keys(VT).forEach((id) => { const V = VT[id], r = Math.random(); V[r < V[0] / (V[0] + V[1]) + (Math.random() - .5) * .3 ? 0 : 1] += 1 + Math.floor(Math.random() * 4) })
    document.querySelectorAll('.pc-host .qz-u[data-pc]').forEach((b) => { const V = VT[b.dataset.pc], i = +b.dataset.i; if (!V) return; const f = b.querySelector('.qz-uf'); if (f) f.style.width = vp(V, i) + '%'
      const a = b.querySelector('.qz-vp'), n = b.querySelector('.qz-vn'); if (a) a.textContent = vp(V, i) + '%'; if (n) n.textContent = nf(V[i]) }) }, 1000)
  let kLast = '', kCur = null
  const FLIP = !!window.PC_FLIP // v13: ответил или листнул — карточка улетает в сторону, следующая поднимается из колоды
  const kWait = () => `<div class="qz qz-w"><i class="qz-wi"></i><b>Ждём событие</b>${window.PC_QUIET ? '' : '<span>Новый прогноз придёт к следующему событию карты — Рошан, драка, башня</span>'}<button data-tab="mine">Мои прогнозы</button></div>`
  // v20: PC_NOBAR — у дуэли без полосы доли (дирижёр 05.11: «не тонкой линией… может, вообще не надо»)
  const kBtn = (x, o, i, cls) => { const p = st.pick[x.id]; return `<button class="${cls} ${cls}--${i ? 'n' : 'y'}${p === i ? ' is-on' : ''}${p != null && p !== i ? ' is-off' : ''}" data-pc="${x.id}" data-i="${i}" style="--p:${o[1]}%">` }
  const kOpen = (L) => L.filter((x) => st.pick[x.id] == null && !st.skip?.[x.id])
  // v29 (дирижёр 05.11: «стрелки „‹ 2 / 3 ›“ убрать, добавить „Пропустить“; ответил „за“ — карточка уезжает вправо, „против“ — влево»): PC_SKIP —
  //   без стрелок, только «2 / 3»; первый исход (Да / первая команда) — вправо, второй — влево, «Пропустить» — вниз; пропущенный в итог не идёт
  const SKIP = !!window.PC_SKIP
  // v30 (дирижёр 05.11: «стрелки как было; „Пропуск“ — маленькой кнопкой возле стрелок; внизу только выбор да / нет»): PC_SKIP2 — в шапке карточки «‹ 2 / 3 ›» и рядом «Пропуск»; направления вылета — как v29
  const SKIP2 = !!window.PC_SKIP2
  // v31–v33 (дирижёр 05.11: «кнопку пропуска выделить отдельно; несколько версий на основе v30»): PC_SK3 — «Пропуск» своей кнопкой, не в плашке со стрелками:
  //   'sep' — круглая кнопка рядом с плашкой справа · 'split' — пропуск в левом углу, стрелки в правом · 'label' — отдельная кнопка с иконкой и словом «Пропустить» рядом со стрелками
  const SK3 = window.PC_SK3 || ''
  // w-predict-3 v1 (созвон 06.11 §5.1–5.2, дирижёр: «не „пропустить“, а „закрыть“; к закрытому можно вернуться, пока он не прошёл»): PC_SK3 = 'close' —
  //   в шапке карточки слева стрелки ‹ › и «2 / 5», справа крестик «Закрыть» высотой с кнопки «Да» / «Нет»; «Закрыть» — не ответ: карточка уходит, сверху следующая без ответа;
  //   стрелками листаются все живые прогнозы, закрытые тоже, — на закрытом можно ответить; всё отвечено или закрыто — итог и строка «Закрытые · N — вернуться»
  // v2 (дирижёр 06.11: «у виджета бордер обычный, а светящийся перенесём в карточку прогноза; кнопку закрытия поменьше»): PC_CARDGLOW — блик и вспышка по рамке карточки, у виджета рамка обычная; PC_CLS_SM — крестик 32
  // v3 (дирижёр 06.11: «стрелочки побольше, одного размера с крестиком; заголовок пониже — возле кнопок»): PC_EVEN — стрелки и крестик по 32, вопрос над кнопками
  // v4 (дирижёр 06.11: «без серой карточки: открыта — на всю ширину окна и уезжает вместе с окном, из-за низа появляется следующее»; «при клике блик не должен сбиваться — у этого прогноза он просто гаснет, не появляется сверху сначала»):
  //   PC_FLAT — карточка без подложки, во весь виджет; следующая и итог выезжают снизу; блик — по рамке виджета, фаза от часов (--pc-d), поэтому перерисовка его не сбрасывает;
  //   ответил или закрыл — блик гаснет за 0,45 с (--pc-go — сколько уже прошло), у следующего без ответа загорается снова с той же фазы
  const FLAT = !!window.PC_FLAT
  const flatCls = () => { const L = open(), x = L[Math.min(st.i, L.length - 1)], on = EVT && st.tab !== 'mine' && !st.allDone && x && st.pick[x.id] == null && !st.skip?.[x.id], out = st.glT && Date.now() - st.glT < 450
    return ' pc--flat' + (on ? ' pc--gl' : out ? ' pc--glout' : '') }
  // v5 (дирижёр 06.11: «серая карточка — один в один как сейчас, только размером во весь виджет; улетает — а чёрная, где все прогнозы, появляется снизу, из чуть меньшей; потом появляется её заголовок — как две разные карточки»):
  //   PC_FULL — пока есть прогноз, серая карточка занимает весь виджет (шапки «Прогнозы» не видно); итог — чёрная карточка: выезжает снизу из чуть меньшей, шапка проявляется следом;
  //   блик по рамке карточки — фаза от часов (--pc-d), перерисовка его не сбрасывает
  const FULL = !!window.PC_FULL
  const fullCls = () => { const L = open(); if (st.tab === 'mine' || !L.length) return ''; const done = EVT && st.allDone && !kOpen(L).length; if (done && !st.sumOn) { st.sumT = Date.now(); st.sumOn = 1 }
    return done ? ' pc--full pc--sum' + (st.sumT && Date.now() - st.sumT < 900 ? ' pc--sumin' : '') : ' pc--full pc--card' }
  // v6 (дирижёр 06.11: «отвеченные прям тут показываю; крутить по кругу можем; все должны быть — и прогнозы, на которые не успели ответить»; основа — v3):
  //   PC_LOOP — стрелки листают по кругу (с последнего — на первый); PC_ALLSUM — в итоге все прогнозы карты: отвеченные с результатом и неотвеченные («Не ответил» — строка кликается, к прогнозу можно вернуться)
  const LOOP = !!window.PC_LOOP, ALLSUM = !!window.PC_ALLSUM
  // v7 (дирижёр 06.11: «„Не ответил · ответить“ и „Сбылось +14“ — аккуратными иконками, без стольких слов»): PC_ICONS — у неотвеченного значок «вернуться», у отвеченного: ✓ +14 · ✕ мимо · часы +13 (в игре)
  const ICONS = !!window.PC_ICONS
  // v8 (дирижёр 06.11: «эти проценты уберём»): PC_NOPCT — на кнопках «Да» / «Нет» нет процентов, только исход и «+баллы»
  const IC = { back: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4 3 7l3 3"/><path d="M3 7h6.5a3.5 3.5 0 0 1 0 7H8"/></svg>',
    ok: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 6.5 2.3 2.3 4.7-5"/></svg>',
    no: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9"/></svg>',
    wait: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l1.6 1"/></svg>' }
  const CLS = SK3 === 'close'
  // v35 (дирижёр 05.11: «на телефоне покороче, чтобы помещалось в экран, и без рамки»): PC_MOB — в виде «Телефон» виджет по высоте содержимого (без 4 : 3), без рамки и свечения; вопрос сразу над кнопками
  // v34 (дирижёр 05.11: «пропустить как в v33, только слева; стрелки в каждой версии криво лежат на подложке»): 'labelL' — кнопка со словом в левом углу, стрелки в правом;
  //   стрелки — SVG-шевроны по центру квадрата 26 × 26 (символы ‹ › в шрифте сидят несимметрично — отсюда и криво)
  const CHV = (d) => `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d < 0 ? 'M7.5 2.5 4 6l3.5 3.5' : 'M4.5 2.5 8 6l-3.5 3.5'}"/></svg>`
  // v15–v16 (дирижёр 05.11: «логика страдает — почему именно переключение; показать финальное состояние, когда всё собрал»): PC_DONE —
  //   карточка меняется только по трём причинам: ответил (через 1 с — следующая без ответа), пришло событие (новая встаёт сверху со вспышкой), листнул сам;
  //   открытые идут по сроку — ближайший первым; ответил на все — итог: что выбрал по каждому и сколько «в игре», события закрываются по ходу карты — «Сбылось +13» / «Мимо»;
  //   внизу — «Следующий прогноз — к следующему событию». В переключалке четвёртое состояние — «Всё собрано»
  const DONEV = !!window.PC_DONE
  // w-predict-4 v5+ (дирижёр 10.11: «показывать в этих строках обратный отсчёт — пока можно ещё ответить»): PC_CD — у неотвеченного в итоге, пока прогноз не решился:
  //   'pill' — как 'text', время в контейнере · 'pillring' — плюс по рамке строки тает тонкая линия
  //   'text' — вместо «до 34:40» — «ответить ещё 0:07» · 'bar' — внизу строки тает полоса · 'ring' — кольцо вокруг кнопки «вернуться» тает · 'btn' — на кнопке цифры «0:07» вместо значка
  const CD = window.PC_CD || ''
  const cdLeft = (id) => { const d = st.resDue?.[id]; return d ? Math.max(0, d[1] - Date.now()) : 0 }
  const cdFmt = (ms) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
  const cdAnim = (id) => { const d = st.resDue[id]; return `--cd-t:${d[1] - d[0]}ms;--cd-d:-${Date.now() - d[0]}ms` }
  // 10.11 (дирижёр: «и когда не ответил, и когда ответил»): у отвеченного тоже — «итог через 0:07»; кольцо и цифры на кнопке — только у неотвеченного (у отвеченного кнопки нет)
  // v10 (дирижёр 10.11: «чтобы шло равномерно, по часовой стрелке»): линия по рамке — SVG-прямоугольник с pathLength, тает по часовой от левого верхнего угла с одной скоростью по всей длине
  const cdRow = (x, h) => { if (!CD || !st.resDue?.[x.id] || st.res?.[x.id] || !cdLeft(x.id)) return h; const L = `<span class="num" data-cd="${x.id}">${cdFmt(cdLeft(x.id))}</span>`
    const ans = st.pick[x.id] != null, tag = ans ? 'div' : 'button', say = ans ? 'итог через' : 'ответить ещё'
    h = h.replace(/^<(div|button) class="qz-zr([^"]*)"/, `<$1 style="${cdAnim(x.id)}" class="qz-zr$2 qz-cd qz-cd--${CD}"`)
    const end = `</${tag}>`, line = `<canvas class="qz-cdl" data-cdc="${x.id}" aria-hidden="true"></canvas>`
    if (CD === 'text') return h.replace(/<small>[^<]*<\/small>/, `<small>${esc(x.ev)} · ${say} ${L}</small>`)
    // v9 (дирижёр 10.11: «как v5, но время в контейнере, как в v8») · v10 — плюс по рамке строки тает тонкая лёгкая линия, как блик на карточке
    if (CD === 'pill' || CD === 'pillring') { h = h.replace(/<small>[^<]*<\/small>/, `<small>${esc(x.ev)} · ${say} <span class="qz-cdp">${L}</span></small>`); return CD === 'pillring' ? h.slice(0, -end.length) + line + end : h }
    if (CD === 'bar') return h.slice(0, -end.length) + '<i class="qz-cdb" aria-hidden="true"></i>' + end
    if (ans) return h
    if (CD === 'ring') return h.replace('<span class="qz-zb"', '<span class="qz-zb qz-zb--ring"').replace(/(<\/svg>)(<\/span><\/span><\/button>)$/, '$1<svg class="qz-cdr" viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="9" pathLength="100"/></svg>$2')
    return h.replace(/<span class="qz-zb"([^>]*)>[\s\S]*?<\/span><\/span><\/button>$/, `<span class="qz-zb qz-zb--num"$1>${L}</span></span></button>`) }
  // v10 (дирижёр 10.11: «от середины, по часовой, равномерно; линия градиентом, без ступенек»): линия по рамке рисуется на canvas каждый кадр —
  //   контур строки от середины верха по часовой, часть до края, где время уходит, стёрта; у края ярко, к хвосту плавно гаснет (по пикселю), дальше — тускло
  const cdPt = (s, w, h, r) => { const Q = Math.PI * r / 2, seg = [w / 2 - r, Q, h - 2 * r, Q, w - 2 * r, Q, h - 2 * r, Q, w / 2 - r]; let k = 0
    while (k < 8 && s > seg[k]) { s -= seg[k]; k++ } const arc = (cx, cy, a0) => { const a = a0 + s / r; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] }
    return [() => [w / 2 + s, 0], () => arc(w - r, r, -Math.PI / 2), () => [w, r + s], () => arc(w - r, h - r, 0), () => [w - r - s, h], () => arc(r, h - r, Math.PI / 2), () => [0, h - r - s], () => arc(r, r, Math.PI), () => [r + s, 0]][k]() }
  const cdTick = () => { document.querySelectorAll('.pc-host canvas.qz-cdl').forEach((cv) => { const row = cv.parentElement, W = row.offsetWidth, H = row.offsetHeight, dpr = devicePixelRatio || 1, R0 = +cv.dataset.r || 10
      if (!W || !H) return; if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr) }
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H)
      const d = st.resDue?.[cv.dataset.cdc]; if (!d) return; const f = Math.max(0, Math.min(1, (d[1] - Date.now()) / (d[1] - d[0]))); if (!f) return
      const w = W - 1, h = H - 1, r = Math.min(R0, w / 2, h / 2), P = 2 * (w + h) - 8 * r + 2 * Math.PI * r, s0 = (1 - f) * P, F = P * 0.3, step = 0.5
      g.save(); g.translate(.5, .5); g.lineWidth = 1; g.strokeStyle = cv.dataset.c === 'm' ? '#e4e4e7' : cdCol || (cdCol = getComputedStyle(cv.closest('.w.pc') || cv).getPropertyValue('--pc-ac').trim() || '#f5c542')
      g.globalAlpha = .14; g.beginPath(); for (let s = Math.min(P, s0 + F); s <= P; s += 2) g.lineTo(...cdPt(s, w, h, r)); g.lineTo(...cdPt(P, w, h, r)); g.stroke()
      for (let s = s0; s < Math.min(P, s0 + F); s += step) { const u = (s - s0) / F; g.globalAlpha = .14 + .66 * (1 - u) ** 1.6; g.beginPath(); g.moveTo(...cdPt(s, w, h, r)); g.lineTo(...cdPt(Math.min(P, s + step), w, h, r)); g.stroke() }
      g.restore() }); requestAnimationFrame(cdTick) }
  let cdCol = ''; if (CD === 'pillring' || window.PC_SUMV) requestAnimationFrame(cdTick)
  if (window.PC_CD) setInterval(() => { document.querySelectorAll('.pc-host [data-cd]').forEach((el) => { el.textContent = cdFmt(cdLeft(el.dataset.cd)) }) }, 250)
  // 10.11 (дирижёр: «как только всё закрыли — через 5 секунд решаются, независимо от того, закрыл или ответил»): все прогнозы карты решаются по одному раз в 5 с;
  //   неотвеченный решился — 'gone': к нему уже не вернуться, в итоге «Не ответил» без кнопки
  const kRes = () => { if (st.resT) return; st.res = {}; st.win = {}; st.resAt = {}; st.resDue = {}; st.resT = 1; const t0 = Date.now(); open().forEach((x, n) => (st.resDue[x.id] = [t0, t0 + 5000 * (n + 1)]) && setTimeout(() => { if (!st.resT) return; const p = st.pick[x.id]
    st.res[x.id] = p == null ? 'gone' : n % 2 ? 'no' : 'ok'; st.win[x.id] = p == null ? n % 2 : st.res[x.id] === 'ok' ? p : 1 - p; st.resAt[x.id] = Date.now(); draw() }, 5000 * (n + 1))) }
  // w-predict-4 (дирижёр 10.11: «после того, как событие произошло, показывать количество проголосовавших»): PC_VOTES — у решённого прогноза в итоге голоса всех:
  //   'line' — строкой под вопросом: «72 % угадали · 1 284 голоса» · 'split' — полоса «Да | Нет» долями, исход-победитель ярче · 'fill' — строка заливается долей угадавших, справа «72 % · 1 284»
  //   'tap' — справа значок людей и число; нажал на строку — раскрывается полоса «Да | Нет» (переключатель на строке). Голоса — пример
  const VOTES = window.PC_VOTES || ''
  const plv = (n) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'голос' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'голоса' : 'голосов' }
  const ICP = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="5.5" r="2.5"/><path d="M1.5 13.5c.5-2.5 2.3-3.8 4.5-3.8s4 1.3 4.5 3.8M11 3.2a2.4 2.4 0 0 1 0 4.6M12.5 9.9c1.2.5 1.9 1.7 2 3.6"/></svg>'
  const vSplit = (x, w, V) => `<span class="qz-vs">${x.o.map((o, i) => `<i class="${i === w ? 'is-w' : ''} qz-vs--${i ? 'n' : 'y'}" style="flex:${Math.max(1, vp(V, i))}"></i>`).join('')}</span><span class="qz-vl num">${x.o.map((o, i) => `<span class="${i === w ? 'is-w' : ''}">${esc(o[0])} ${vp(V, i)}%</span>`).join(`<span>${nf(V[0] + V[1])}</span>`)}</span>`
  const vAdd = (x, h) => { const R = st.res || {}; if (!VOTES || !R[x.id] || st.win?.[x.id] == null) return h
    const w = st.win[x.id], V = vOf(x), all = V[0] + V[1], pw = vp(V, w), fr = Date.now() - (st.resAt?.[x.id] || 0) < 900 ? ' is-fresh' : ''
    const tag = h.startsWith('<button') ? 'button' : 'div', end = `</${tag}>`, body = h.slice(0, -end.length)
    if (VOTES === 'line') return `${body}<span class="qz-zv qz-zv--line${fr}"><b class="num">${pw}%</b> угадали · <span class="num">${nf(all)}</span> ${plv(all)}</span>${end}`
    if (VOTES === 'split') return `${body}<span class="qz-zv qz-zv--split${fr}">${vSplit(x, w, V)}</span>${end}`
    if (VOTES === 'fill') return body.replace(/^<(div|button) class="qz-zr/, `<$1 style="--qz-vf:${pw}%" class="qz-zr qz-zr--fill${fr}`).replace(/<\/span>$/, `<small class="qz-vn num">${pw}% · ${nf(all)}</small></span>`) + end
    const op = st.vOpen?.[x.id]
    return body.replace(/^<div class="qz-zr/, `<div data-vt="${x.id}" class="qz-zr qz-zr--tap${op ? ' is-open' : ''}`).replace(/<\/span>$/, `<small class="qz-vn num">${ICP}${nf(all)}</small></span>`) + (op ? `<span class="qz-zv qz-zv--split${st.vFr === x.id ? ' is-fresh' : ''}">${vSplit(x, w, V)}</span>` : '') + end }
  // w-predict-4 v11–v18 (дирижёр 10.11: «на каждый из вариантов v9 и v10 — по 4 разные версии визуально, в нашей стилистике: меньше текста, больше иконок, ёмко и мелко, как аналитический дашборд»):
  //   PC_SUMV — вид строки итога. На основе v9 (время в плашке): 'tick' — строка-тикер · 'table' — таблица · 'clock' — таймер слева · 'tile' — плитки 2 в ряд;
  //   на основе v10 (время уходит линией по рамке): 'pill' — капсулы · 'line' — контур без подложки · 'gauge' — плитки с крупным временем · 'icon' — линия вокруг значка события.
  //   Отвеченный ждёт итога — линия / время серые; не ответил — золотые (ещё можно ответить); решился — доля голосов полосой
  const SUMV = window.PC_SUMV || ''
  // v20–v22 (дирижёр 10.11: «золотое — это деньги: таймер всегда серый, ответил или нет; внимание привлекать по-другому; доля голосов — на всю ширину»): PC_SV3 —
  //   время и линия всегда серые; не ответил — кнопка «вернуться» светлой заливкой, вопрос белым, у отвеченного вопрос тише; полоса голосов тянется на всю ширину
  const SV3 = !!window.PC_SV3
  // v23–v25 (дирижёр 10.11: «линии могут быть золотыми, золотым не может быть только таймер с цифрами»): PC_SV4 — линия вокруг значка у неотвеченного снова золотая, «вернуться» серая;
  //   у плиток «Ответить» — кнопкой на всю ширину, надпись внутри; у таймера слева время чуть меньше
  const SV4 = !!window.PC_SV4
  // v26–v30 (дирижёр 10.11): PC_SV5 — у таймера слева полоса голосов одной длины, справа (не зависит от ответа и события); у линии вокруг значка строки одной высоты до и после итога;
  //   у плиток «Ответить» — серая кнопка на всю ширину со значком «вернуться». PC_RES — ярче «угадал / мимо» в плитках: 'tint' — плитка цветом итога · 'ribbon' — ленточка на углу · 'stamp' — крупная печать ✓ / ✕.
  //   PC_LONGQ — длинный вопрос у Рошана: посмотреть, как ведёт себя длинный заголовок
  const SV5 = !!window.PC_SV5, RES = window.PC_RES || ''
  // v31–v33 (дирижёр 10.11): PC_SV6 — строки одной высоты (таймер слева), полоса «кто как ответил» одной длины во всех строках (линия вокруг значка);
  //   ленточка: «Верно» · «Неверно» · «Пропустил» (чёрная)
  const SV6 = !!window.PC_SV6
  // v34–v36 (дирижёр 10.11): PC_SV7 — у таймера слева в подписи только значок события, без слова («Рошан», «Событие»…); на карточке прогноза перед «Рошан · до 34:40» — тот же значок
  const SV7 = !!window.PC_SV7
  // 10.11 (дирижёр: «если контент уходит в многоточие — при наведении показывать его в подсказке»): в итоге у обрезанного текста подсказка с полным текстом
  //   своя подсказка в стиле сайта (браузерная title в кадре песочницы не всплывает): тёмная плашка над текстом, появляется при наведении на обрезанный текст
  if (SUMV) { let tip = null, on = null
    const hide = () => { on = null; if (tip) tip.classList.remove('is-on') }
    document.addEventListener('mouseover', (e) => { const el = e.target.closest?.('.sv .sv-q, .sv .sv-meta > span, .sv .sv-vl'); if (el === on) return; if (!el) return hide()
      if (!(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) return hide()
      if (!tip) { tip = document.createElement('div'); tip.className = 'sv-tip'; document.body.appendChild(tip) }
      on = el; tip.textContent = el.textContent.trim(); const r = el.getBoundingClientRect(); tip.style.maxWidth = Math.max(220, r.width) + 'px'; tip.classList.add('is-on')
      const tr = tip.getBoundingClientRect(), left = Math.min(Math.max(8, r.left), innerWidth - tr.width - 8), top = r.top - tr.height - 6 < 8 ? r.bottom + 6 : r.top - tr.height - 6
      tip.style.left = left + 'px'; tip.style.top = top + 'px' })
    addEventListener('scroll', hide, true) }
  // v19 (дирижёр 10.11: «плитки не должны прыгать — бордер всегда какой-то; строка с вариантами ответа пережата»): PC_SV2 — у плитки высота и рамка постоянные, строки сверху и снизу фиксированной высоты, низ просторнее
  const EVI = (ev) => { const k = /Рошан/.test(ev) ? 'rosh' : /Баш|Казар/.test(ev) ? 'tower' : /Драк|кровь/.test(ev) ? 'fight' : /Длин/.test(ev) ? 'clock' : /Карт/.test(ev) ? 'map' : 'ev'
    const P = { rosh: '<path d="M5 10a7 7 0 0 1 14 0v4l-2 2v3h-3v-2h-4v2H7v-3l-2-2z"/><circle cx="9.5" cy="11" r="1.2" fill="currentColor"/><circle cx="14.5" cy="11" r="1.2" fill="currentColor"/>',
      tower: '<path d="M7 21V9l-2-2V3h3v2h2V3h4v2h2V3h3v4l-2 2v12z"/><path d="M10 21v-4h4v4"/>', fight: '<path d="M4 4l9 9M13 13l2 2M15 15l3 3-1.5 1.5-3-3M20 4l-9 9M11 13l-2 2M9 15l-3 3 1.5 1.5 3-3"/>',
      clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>', map: '<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>', ev: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>' }[k]
    return `<svg class="sv-ei" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P}</svg>` }
  const svState = (x) => { const p = st.pick[x.id], r = st.res?.[x.id], due = !r && cdLeft(x.id) > 0; return { p, r, due, ans: p != null, pt: p != null ? pts(x.o[p][1]) : 0 } }
  const svT = (x, cls = '') => `<span class="sv-t num${cls}" data-cd="${x.id}">${cdFmt(cdLeft(x.id))}</span>`
  const svCv = (x, S, r) => S.due ? `<canvas class="qz-cdl" data-cdc="${x.id}" data-r="${r}"${S.ans || (SV3 && !SV4) ? ' data-c="m"' : ''} aria-hidden="true"></canvas>` : ''
  const svPick = (x, S) => S.ans ? `<span class="sv-pk sv-pk--${S.p ? 'n' : 'y'}">${esc(x.o[S.p][0])}</span>` : ''
  const svRes = (x, S) => S.r === 'ok' ? `<span class="sv-rs is-ok num">${IC.ok}+${S.pt}</span>` : S.r === 'no' ? `<span class="sv-rs is-no">${IC.no}</span>` : S.r === 'gone' ? '<span class="sv-rs is-gone">—</span>' : S.ans ? `<span class="sv-rs is-wait num">+${S.pt}</span>` : ''
  const svVote = (x, S, lbl) => { if (!S.r || st.win?.[x.id] == null) return ''; const w = st.win[x.id], V = vOf(x), fr = Date.now() - (st.resAt?.[x.id] || 0) < 900 ? ' is-fresh' : ''
    return `<span class="sv-v${fr}"><span class="sv-vb">${x.o.map((o, i) => `<i class="${i === w ? 'is-w sv-vb--' + (i ? 'n' : 'y') : ''}" style="flex:${Math.max(1, vp(V, i))}"></i>`).join('')}</span>${lbl ? `<span class="sv-vl num">${esc(x.o[w][0])} ${vp(V, w)}% · ${nf(V[0] + V[1])}</span>` : `<span class="sv-vl num">${vp(V, w)}%</span>`}</span>` }
  const svAttr = (x, S, cls) => `class="sv-r sv-r--${SUMV}${cls ? ' ' + cls : ''}${S.r ? ' is-' + S.r : S.ans ? ' is-ans' : ' is-open'}"${!S.ans && !S.r ? ` data-back-id="${x.id}" role="button" tabindex="0" title="Вернуться и ответить"` : ''}`
  const sumRow = (x) => { const S = svState(x), q = esc(x.q), ev = esc(x.ev), back = !S.ans && !S.r ? `<span class="sv-bk">${IC.back}</span>` : ''
    if (SUMV === 'tick') return `<div ${svAttr(x, S)}><span class="sv-ic">${EVI(x.ev)}</span><b class="sv-q">${q}</b>${S.r ? svVote(x, S) + svRes(x, S) : `${svPick(x, S)}${S.due ? svT(x, ' sv-t--box') : ''}${back}`}</div>`
    if (SUMV === 'table') return `<div ${svAttr(x, S)}><span class="sv-c1">${EVI(x.ev)}<b class="sv-q">${q}</b></span><span class="sv-c2">${S.ans ? svPick(x, S) : S.r ? '<span class="sv-dash">—</span>' : back}</span><span class="sv-c3">${S.r ? svRes(x, S) : S.due ? svT(x, ' sv-t--box') : ''}</span>${S.r ? `<span class="sv-c4">${svVote(x, S, true)}</span>` : ''}</div>`
    if (SUMV === 'clock') return `<div ${svAttr(x, S)}><span class="sv-big">${S.r ? svRes(x, S) : S.due ? svT(x, ' sv-t--box sv-t--big') : ''}</span><span class="sv-mid"><b class="sv-q">${q}</b><span class="sv-meta">${EVI(x.ev)}${SV7 ? '' : `<span>${ev}</span>`}${S.ans ? svPick(x, S) : ''}${S.r ? svVote(x, S) : ''}</span></span>${back}</div>`
    if (SUMV === 'tile') return `<div ${svAttr(x, S)}>${RES === 'ribbon' && (S.r === 'ok' || S.r === 'no' || (SV6 && S.r === 'gone')) ? `<span class="sv-rib sv-rib--${S.r}">${SV6 ? { ok: 'Верно', no: 'Неверно', gone: 'Пропустил' }[S.r] : S.r === 'ok' ? 'Угадал' : 'Мимо'}</span>` : ''}<span class="sv-top">${EVI(x.ev)}${S.r && RES === 'stamp' && (S.r === 'ok' || S.r === 'no') ? `<span class="sv-st sv-st--${S.r}">${S.r === 'ok' ? `<b class="num">+${S.pt}</b>` : ''}<i>${IC[S.r]}</i></span>` : S.r && RES === 'ribbon' ? '' : S.r ? svRes(x, S) : S.due ? svT(x, ' sv-t--box') : ''}</span><b class="sv-q">${q}</b><span class="sv-bot">${S.r ? (RES === 'ribbon' && S.r === 'ok' ? `<span class="sv-rs is-ok num">+${S.pt}</span>` : '') + svVote(x, S) : S.ans ? svPick(x, S) + `<span class="sv-rs is-wait num">+${S.pt}</span>` : (SV5 ? `<span class="sv-btn sv-btn--g">${IC.back}Ответить</span>` : SV4 ? '<span class="sv-btn">Ответить</span>' : back + '<span class="sv-hint">ответить</span>')}</span></div>`
    if (SUMV === 'pill') return `<div ${svAttr(x, S)}>${svCv(x, S, 18)}<span class="sv-ic">${EVI(x.ev)}</span><b class="sv-q">${q}</b>${S.r ? svVote(x, S) + svRes(x, S) : `${svPick(x, S)}${S.due ? svT(x) : ''}${back}`}</div>`
    if (SUMV === 'line') return `<div ${svAttr(x, S)}>${svCv(x, S, 8)}<span class="sv-hd">${EVI(x.ev)}<span>${ev}</span>${S.due ? svT(x, ' sv-t--r') : S.r ? svRes(x, S) : ''}</span><span class="sv-ln"><b class="sv-q">${q}</b>${S.ans && !S.r ? svPick(x, S) : ''}${back}</span>${S.r ? svVote(x, S, true) : ''}</div>`
    if (SUMV === 'gauge') return `<div ${svAttr(x, S)}>${svCv(x, S, 10)}<span class="sv-top">${EVI(x.ev)}${back}</span><span class="sv-big">${S.r ? svRes(x, S) : S.due ? svT(x, ' sv-t--big') : ''}</span><b class="sv-q">${q}</b>${S.r ? svVote(x, S) : S.ans ? `<span class="sv-bot">${svPick(x, S)}<span class="sv-rs is-wait num">+${S.pt}</span></span>` : ''}</div>`
    /* icon */ return `<div ${svAttr(x, S)}><span class="sv-ib">${svCv(x, S, 7)}${EVI(x.ev)}</span><span class="sv-mid"><b class="sv-q">${q}</b>${S.r ? svVote(x, S, true) : `<span class="sv-meta">${S.due ? svT(x) : ''}${S.ans ? svPick(x, S) : '<span class="sv-hint">не ответил</span>'}</span>`}</span>${S.r ? svRes(x, S) : back || `<span class="sv-rs is-wait num">+${S.pt}</span>`}</div>` }
  const kDone = (L) => { const D = ALLSUM ? L : L.filter((x) => st.pick[x.id] != null), pp = (x) => pts(x.o[st.pick[x.id]][1]), R = st.res || {}
    const DA = D.filter((x) => st.pick[x.id] != null), inG = DA.filter((x) => !R[x.id]).reduce((a, x) => a + pp(x), 0), got = DA.filter((x) => R[x.id] === 'ok').reduce((a, x) => a + pp(x), 0)
    return `<div class="qz qz-z">${window.PC_NOMY ? '' : `<div class="qz-zh"><b>Всё собрано</b><span class="num">${D.length} из ${L.length}</span></div>`}
      <div class="qz-zl${SUMV ? ' sv sv--' + SUMV + (window.PC_SV2 ? ' sv--v2' : '') + (SV3 ? ' sv--v3' : '') + (SV4 ? ' sv--v4' : '') + (SV5 ? ' sv--v5' : '') + (RES ? ' sv--res-' + RES : '') + (SV6 ? ' sv--v6' : '') : ''}">${SUMV ? D.map(sumRow).join('') : ''}${SUMV ? '' : D.map((x) => vAdd(x, (() => { const p = st.pick[x.id], r = R[x.id]; if (p == null && r === 'gone') return `<div class="qz-zr is-gone"><span class="qz-zq"><small>${esc(x.ev)} · до ${esc(x.t)}</small><b>${esc(x.q)}</b></span><span class="qz-za"><em class="qz-zc">Не ответил</em></span></div>`
        if (p == null) return cdRow(x, `<button class="qz-zr is-skip" data-back-id="${x.id}"><span class="qz-zq"><small>${esc(x.ev)} · до ${esc(x.t)}</small><b>${esc(x.q)}</b></span>${ICONS ? '<span class="qz-za qz-za--ic"><span class="qz-zb" title="Не ответил — вернуться и ответить">' + IC.back + '</span></span>' : '<span class="qz-za"><em class="qz-zc">Не ответил</em><i>ответить ›</i></span>'}</button>`)
        return cdRow(x, `<div class="qz-zr${r ? ' is-' + r : ''}"><span class="qz-zq"><small>${esc(x.ev)} · до ${esc(x.t)}</small><b>${esc(x.q)}</b></span><span class="qz-za"><em class="qz-zc qz-zc--${p ? 'n' : 'y'}">${esc(x.o[p][0])}</em>${ICONS ? `<i class="num qz-zi qz-zi--${r || 'wait'}" title="${r === 'ok' ? 'Сбылось' : r === 'no' ? 'Мимо' : 'В игре'}">${IC[r || 'wait']}${r === 'no' ? '' : '+' + pp(x)}</i>` : `<i class="num">${r === 'ok' ? 'Сбылось +' + pp(x) : r === 'no' ? 'Мимо' : '+' + pp(x) + ' в игре'}</i>`}</span></div>`) })())).join('')}</div>
      <div class="qz-zs"><span>${inG ? `В игре <b class="num">+${inG}</b>` : 'Все закрылись'}</span><span>Получено <b class="num">+${got}</b></span></div>
      ${CLS && !ALLSUM && L.some((x) => st.skip?.[x.id] && st.pick[x.id] == null && !R[x.id]) ? `<button class="qz-zback" data-back-closed>Закрытые · <b class="num">${L.filter((x) => st.skip?.[x.id] && st.pick[x.id] == null && !R[x.id]).length}</b> — вернуться <i>›</i></button>` : ''}
      ${window.PC_QUIET ? '' : '<div class="qz-zn"><i class="qz-wi"></i>Следующий прогноз — к следующему событию карты</div>'}</div>` }
  const kBody = (L) => { if (EVT && (!L.length || (st.allDone && !kOpen(L).length))) { const pc = kCur; kCur = null; kLast = ''; if (DONEV && L.length) { kRes()
      // v30 (дирижёр 05.11: «третья карточка тоже уходит в сторону, а за ней уже результаты»): последняя улетает поверх итога
      if (SKIP2 && FLIP && K === 'deck' && pc) { const d = st.outDir || 'fw'; st.outDir = ''; return `<div class="qz qz-d qz-d--flip qz-d--z"><div class="qz-dk"><div class="qz-dc is-out qz--${d}" aria-hidden="true">${pc.html}</div>${kDone(L)}</div></div>` }
      return kDone(L) } return kWait() } st.sumOn = 0; st.i = Math.min(st.i, L.length - 1); const x = L[st.i], left = kOpen(L).length, inn = x.id !== kLast; kLast = x.id
    if (K === 'timer') { const f = [0.62, 0.35, 0.8, 0.5, 0.2, 0.7][st.i % 6]
      return `<div class="qz qz-t${inn ? ' is-in' : ''}"><span class="qz-ev">${esc(x.ev)}</span><b class="qz-q">${esc(x.q)}</b><span class="qz-bar"><i style="width:${f * 100}%"></i></span><span class="qz-tl num">до ${esc(x.t)} · осталось ${left}</span>
        <div class="qz-tb">${x.o.map((o, i) => `${kBtn(x, o, i, 'qz-tbt')}<span class="qz-l">${lg(o)}${esc(o[0])}</span><span class="qz-r"><small class="num">${o[1]}%</small><b class="num">+${pts(o[1])}</b></span></button>`).join('')}</div></div>` }
    if (K === 'deck') { const n = L.length, O = kOpen(L)
      const skB = (c, t) => CLS ? `<button class="qz-cls" data-skip="${x.id}" title="Закрыть" aria-label="Закрыть"${st.pick[x.id] != null ? ' disabled' : ''}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg></button>` : `<button class="${c}" data-skip="${x.id}" title="Пропустить" aria-label="Пропустить"${st.pick[x.id] != null ? ' disabled' : ''}><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 3.5v9l6-4.5zM9 3.5v9l6-4.5z"/></svg>${t}</button>`
      const evl = `<span class="qz-ev${SV7 ? ' qz-ev--ic' : ''}">${SV7 ? EVI(x.ev) : ''}${x.fresh && EVT ? '<em>Новый</em> · ' : ''}${esc(x.ev)} · до ${esc(x.t)}</span>`
      const inner = `<div class="qz-dh${SKIP2 ? ' qz-dh--s' : ''}${SK3 ? ' qz-dh--' + SK3 : ''}">${SKIP2 ? '' : evl}${n > 1 ? (SKIP && !SKIP2 ? `<span class="qz-dn num">${st.i + 1} / ${n}</span>` : `<span class="qz-dn${SKIP2 ? ' qz-dn--s' : ''}"><button data-nav="-1" ${st.i || LOOP ? '' : 'disabled'} aria-label="Назад">${SKIP2 ? CHV(-1) : '‹'}</button><span class="num">${st.i + 1} / ${n}</span><button data-nav="1" ${st.i < n - 1 || LOOP ? '' : 'disabled'} aria-label="Дальше">${SKIP2 ? CHV(1) : '›'}</button>${SKIP2 && !SK3 ? skB('qz-sk2', '') : ''}</span>`) : ''}${SK3 ? skB('qz-sk3', SK3 === 'label' || SK3 === 'labelL' ? '<span>Пропустить</span>' : '') : ''}</div>${SKIP2 ? evl : ''}<b class="qz-q">${esc(x.q)}</b>
        <div class="qz-db">${x.o.map((o, i) => `${kBtn(x, o, i, 'qz-dbt')}<span class="qz-l">${lg(o)}${esc(o[0])}</span><small class="num">${o[1]}%</small><b class="num">+${pts(o[1])}</b></button>`).join('')}</div>${SKIP && !SKIP2 ? `<button class="qz-skip" data-skip="${x.id}"${st.pick[x.id] != null ? ' disabled' : ''}>Пропустить</button>` : ''}`
      const prev = kCur, dir = SKIP && st.outDir ? st.outDir : st.navDir ? st.navDir : prev && st.i < prev.i ? 'bk' : 'fw', out = FLIP && inn && prev && prev.id !== x.id ? `<div class="qz-dc is-out qz--${dir}" aria-hidden="true">${prev.html}</div>` : ''
      kCur = { id: x.id, i: st.i, html: inner }; if (out) { st.outDir = ''; st.navDir = '' } const left = O.length - (st.pick[x.id] == null ? 1 : 0)
      return `<div class="qz qz-d${FLIP ? ' qz-d--flip' : ''}"><div class="qz-dk${left > 1 ? ' has-2' : left > 0 ? ' has-1' : ''}">${out}<div class="qz-dc${inn ? ' is-in qz--' + dir : ''}">${inner}</div></div></div>` }
    if (K === 'duel') { const [a, b] = x.o
      const V = LIVE ? vOf(x) : null
      const half = (o, i) => `${kBtn(x, o, i, 'qz-u')}${V ? `<i class="qz-uf" style="width:${vp(V, i)}%"></i>` : ''}${o[2] ? `<img class="qz-ul" src="${o[2].logo}" alt="">` : ''}<span class="qz-un">${esc(o[0])}</span><span class="qz-ur"><b class="num">+${pts(o[1])}</b><small class="num">${V ? `<span class="qz-vp">${vp(V, i)}%</span> · <span class="qz-vn">${nf(V[i])}</span>` : o[1] + '%'}</small></span></button>`
      return `<div class="qz qz-du${inn ? ' is-in' : ''}">${half(a, 0)}<div class="qz-uq"><span class="qz-ev">${x.fresh && EVT ? '<em>Новый</em> · ' : ''}${esc(x.ev)} · до ${esc(x.t)}</span><b>${esc(x.q)}</b></div>${half(b, 1)}${L.length > 1 ? oneNav(L) : ''}</div>` }
    // feed
    const top = kOpen(L)[0], rest = L.filter((y) => y !== top)
    return `<div class="qz qz-f">${top ? `<div class="qz-fo${top.fresh ? ' is-new' : ''}"><span class="qz-ev">${top.fresh ? '<em>Новый</em> ' : ''}${esc(top.ev)} · до ${esc(top.t)}</span><b class="qz-q">${esc(top.q)}</b>
      <div class="qz-fb">${top.o.map((o, i) => `${kBtn(top, o, i, 'qz-fbt')}<span class="qz-l">${lg(o)}${esc(o[0])}</span><small class="num">${o[1]}%</small><b class="num">+${pts(o[1])}</b></button>`).join('')}</div></div>` : '<div class="qz-fe">Ответил на все — новые придут сверху</div>'}
      <div class="qz-fl">${rest.map((y) => { const p = st.pick[y.id]; return `<div class="qz-fr${p != null ? ' is-done' : ''}"><span class="qz-fq"><small>${esc(y.ev)} · до ${esc(y.t)}</small><b>${esc(y.q)}</b></span>${p != null ? `<span class="qz-fa qz-fa--${p ? 'n' : 'y'}">${esc(y.o[p][0])} <i class="num">+${pts(y.o[p][1])}</i></span>` : `<span class="qz-fw">ждёт</span>`}</div>` }).join('')}</div></div>` }
  const NEWB = { yn: (L) => K ? kBody(L) : SL ? slBody(L) : SLIP ? slipBody(L) : ynBody(L), lst: (L) => lstBody(L), chart: (L) => { st.i = Math.min(st.i, L.length - 1); return chartBody(L[st.i]) + oneNav(L) }, swipe: swipeBody, strip: stripBody }
  const oneNav = (L) => `<div class="pc-nav"><button data-nav="-1" ${st.i ? '' : 'disabled'}>‹</button><span class="pc-dots">${L.map((x, i) => `<i class="${i === st.i ? 'is-on' : ''}${st.pick[x.id] != null ? ' is-done' : ''}" data-go="${i}"></i>`).join('')}</span><span class="num">${st.i + 1} из ${L.length}</span><button data-nav="1" ${st.i < L.length - 1 ? '' : 'disabled'}>›</button></div>`
  const oneCard = (x) => NEWC[MODE] ? NEWC[MODE](x) : (MODE === 'bb' ? bbCard(x, true) : MODE === 'feed' ? `<div class="pc-top">${polyHero(x).replace(/<div class="pc-btns">[\s\S]*$/, '')}${feedRow({ ...x, fresh: false }).replace(/<div class="pc-fq">[\s\S]*?<\/div>/, '')}</div>` : `<div class="pc-top">${polyHero(x)}</div>`)
  function body() {
    // v19–v20 (дирижёр 05.11: «„Открытые / Мои“ убрать — есть мои, показываем, нет — не показываем; внизу кнопкой, не сегментом, и тогда всё вверх улетает»): PC_MYB —
    //   в шапке только «Прогнозы»; дал хоть один прогноз — внизу кнопка «Мои прогнозы»; нажал — прогноз уезжает вверх, снизу поднимается «Мои», внизу «Назад»
    if (MYB) { const mine = st.tab === 'mine', anim = st.myT && Date.now() - st.myT < 500, has = mineOpen().length > 0
      const pr = NEWB[MODE] ? NEWB[MODE](open()) : ''
      return `<div class="qz-pg${mine ? ' is-mine' : ''}${anim ? ' is-anim' : ''}"><div class="qz-pp">${pr}${has ? '<button class="qz-my" data-tab="mine">Мои прогнозы <i>›</i></button>' : ''}</div><div class="qz-pp qz-pp--m">${mineList()}<button class="qz-my qz-my--b" data-tab="open"><i>‹</i> Назад</button></div></div>` }
    if (st.tab === 'mine') return mineList()
    const L = open(), [h, ...rest] = L
    if (NEWB[MODE]) return NEWB[MODE](L)
    if (ONE && !st.full) { st.i = Math.min(st.i, L.length - 1); return `<div class="pc-one${L[st.i].fresh ? ' is-new' : ''}">${oneCard(L[st.i])}</div>${oneNav(L)}` }
    if (NEWC[MODE]) return `<div class="pc-list pc-list--k">${L.map(NEWC[MODE]).join('')}</div>`
    if (MODE === 'bb') return `${bbCard(h, true)}<div class="pc-list">${rest.map((x) => bbCard(x)).join('')}</div>`
    if (MODE === 'feed') return `<div class="pc-top">${polyHero(h)}</div><div class="pc-list pc-list--feed">${rest.map(feedRow).join('')}</div>`
    return `<div class="pc-top">${polyHero(h)}</div><div class="pc-list">${rest.map(polyRow).join('')}</div>`
  }
  function draw() {
    HOSTS.forEach((el) => { if (!el.isConnected) HOSTS.delete(el) })
    HOSTS.forEach((el) => { MM = el._pcM; const nOpen = EVT ? open().filter((x) => st.pick[x.id] == null).length : open().length, nMine = mineOpen().length + DONE().length
      el.innerHTML = `<div class="w pc${window.PC_V18 ? ' pc--v18' : ''}${window.PC_V19 ? ' pc--v19' : ''}${window.PC_V20 ? ' pc--v20' : ''}${window.PC_V21 ? ' pc--v21' : ''}${window.PC_V22 ? ' pc--v22' : ''}${window.PC_V23 ? ' pc--v23' : ''}${window.PC_V24 ? ' pc--v24' : ''} pc--${MODE}${window.PC_STILL ? ' pc--still' : ''}${SLIP ? ' pc--slip' : ''}${SL ? ' pc--sl' : ''}${K ? ' pc--k pc--k-' + K : ''}${window.PC_NOBAR ? ' pc--nobar' : ''}${window.PC_ACT && EVT ? (kOpen(open()).length ? ' pc--act' : ' pc--calm') : ''}${window.PC_SPIN ? ' pc--spin' : ''}${window.PC_CARDGLOW ? ' pc--cg' : ''}${window.PC_CLS_SM ? ' pc--clsm' : ''}${window.PC_EVEN ? ' pc--even' : ''}${window.PC_NOPCT ? ' pc--nopct' : ''}${window.PC_MOB ? ' pc--mob' : ''}${st.ping && Date.now() - st.ping < 3000 ? ' pc--ping' : ''}${st.full ? ' is-full' : ''}${window.PC_EDGE ? ' pc--edge' : ''}${FLAT ? flatCls() : ''}${FULL ? fullCls() : ''}"${FLAT || FULL ? ` style="--pc-d:-${Date.now() % 8000}ms;--pc-go:-${st.glT ? Math.min(450, Date.now() - st.glT) : 450}ms;--pc-so:-${st.sumT ? Math.min(900, Date.now() - st.sumT) : 900}ms"` : ''}><div class="pc-hd"><b>Прогнозы</b>${window.PC_NOMY && EVT && DONEV && st.allDone && open().length && !kOpen(open()).length ? `<span class="qz-hc num">${open().length} из ${open().length}</span>` : ''}
        ${MYB || window.PC_NOMY ? '' : `<div class="pc-tabs"><button class="${st.tab === 'open' ? 'is-on' : ''}" data-tab="open">Открытые <i class="num">${nOpen}</i></button><button class="${st.tab === 'mine' ? 'is-on' : ''}" data-tab="mine">Мои <i class="num">${nMine}</i></button></div>`}
        ${window.PC_NOFULL ? '' : `<button class="pc-x" data-full title="${st.full ? 'Свернуть' : 'Развернуть на колонку'}">${st.full ? ic.min : ic.full}</button>`}</div>
        <div class="pc-bd">${body()}</div></div>`
    })
    // v9 (дирижёр 06.11: «на телефоне скачет размер: был минимальным — мог расти, растёт плавно»): PC_MOBH — на телефоне виджет не становится ниже, чем уже был; растёт — плавно (0,3 с)
    // v10 (дирижёр 06.11: «не должно быть пустоты снизу; минимальный размер — с одной карточкой, а карточка прижата книзу»): PC_MOBH = 2 — минимум = высота с первой карточкой (не больше),
    //   виджет флексом: карточка тянется на всю высоту, вопрос и кнопки — внизу; итог — сверху, «В игре · Получено» — внизу; больше места нужно — растёт плавно
    if (window.PC_MOBH === 2 && !document.body.classList.contains('is-desk')) HOSTS.forEach((el) => { const w = el.querySelector('.w.pc'); if (!w) return; w.classList.add('pc--mobh2'); w.style.minHeight = (st.mobMin || 0) + 'px'; const h = w.offsetHeight
      if (st.mobLast && h > st.mobLast) { w.style.height = st.mobLast + 'px'; w.style.overflow = 'hidden'; void w.offsetHeight; w.style.transition = 'height .3s ease'; w.style.height = h + 'px'; setTimeout(() => { w.style.height = ''; w.style.overflow = ''; w.style.transition = '' }, 320) }
      if (!st.mobMin && w.querySelector('.qz-dc:not(.is-out)')) { st.mobMin = h; w.style.minHeight = h + 'px' } st.mobLast = Math.max(h, st.mobMin || 0) })
    else if (window.PC_MOBH && !document.body.classList.contains('is-desk')) HOSTS.forEach((el) => { const w = el.querySelector('.w.pc'); if (!w) return; w.style.minHeight = (st.mobH || 0) + 'px'; const h = w.offsetHeight
      if (st.mobH && h > st.mobH) { w.style.height = st.mobH + 'px'; w.style.overflow = 'hidden'; void w.offsetHeight; w.style.transition = 'height .3s ease'; w.style.height = h + 'px'; setTimeout(() => { w.style.height = ''; w.style.overflow = ''; w.style.transition = '' }, 320) }
      st.mobH = Math.max(st.mobH || 0, h); w.style.minHeight = st.mobH + 'px' })
    document.body.classList.toggle('pc-colfull', st.full)
  }
  document.addEventListener('click', (e) => {
    const host = e.target.closest('.pc-host'); if (!host) return
    const b = e.target.closest('[data-pc]'), t = e.target.closest('[data-tab]'), f = e.target.closest('[data-full]'), nv = e.target.closest('[data-nav]'), go = e.target.closest('[data-go]')
    const cf = e.target.closest('[data-conf]')
    const vt = e.target.closest('[data-vt]'); if (vt) { const id = vt.dataset.vt; st.vOpen = st.vOpen || {}; st.vOpen[id] = !st.vOpen[id]; st.vFr = st.vOpen[id] ? id : ''; draw(); st.vFr = ''; return }
    const bi = e.target.closest('[data-back-id]'); if (bi) { const L = open(), k = L.findIndex((x) => x.id === bi.dataset.backId); if (k >= 0 && !st.res?.[bi.dataset.backId]) { st.allDone = false; st.i = k; kLast = ''; draw() } return }
    const bc = e.target.closest('[data-back-closed]'); if (bc) { const L = open(), k = L.findIndex((x) => st.skip?.[x.id] && st.pick[x.id] == null && !st.res?.[x.id]); if (k >= 0) { st.allDone = false; st.i = k; kLast = ''; draw() } return }
    const sk = e.target.closest('[data-skip]'); if (sk) { const id = sk.dataset.skip; if (FLAT) st.glT = Date.now(); st.skip = st.skip || {}; st.skip[id] = true; st.outDir = 'd'; const L = open(), nx = L.findIndex((x) => st.pick[x.id] == null && !st.skip[x.id]); if (nx >= 0) st.i = nx; else if (EVT) st.allDone = true; draw(); return }
    const sp = e.target.closest('[data-sp]'); if (sp) { const id = sp.dataset.sp, i = +sp.dataset.i, L = open(); st.i = L.findIndex((x) => x.id === id); st.pick[id] = st.pick[id] === i && sp.closest('.pc-slc') ? null : i; draw(); return }
    if (cf) { const id = cf.dataset.conf; st.conf = st.conf || {}; if (st.pick[id] == null || st.conf[id]) return; st.conf[id] = true; if (SLIP || SL) { cf.textContent = 'Прогноз принят ✓'; cf.classList.add('is-ok'); setTimeout(() => { const L = open(), nx = L.findIndex((x) => !st.conf[x.id]); if (nx >= 0) st.i = nx; draw() }, 900); return } draw(); if (ONE && !st.full) setTimeout(() => { const L = open(), nx = L.findIndex((x) => st.pick[x.id] == null && !st.skip?.[x.id]); if (nx >= 0) { st.i = nx; draw() } }, 1000); return }
    if (b) { const id = b.dataset.pc, i = +b.dataset.i; if (st.conf?.[id]) return; if (FLAT) st.glT = Date.now(); if (CLS && st.skip) delete st.skip[id]; if (SKIP) st.outDir = i ? 'l' : 'r'; if (LIVE && VT[id] && st.pick[id] !== i) VT[id][i]++; st.pick[id] = st.pick[id] === i ? null : i; draw()
      if (ONE && !st.full && st.pick[id] != null && !(MODE === 'pm' || MODE === 'cp' || MODE === 'strip' || MODE === 'swipe' || MODE === 'lst')) setTimeout(() => { const L = open(), nx = L.findIndex((x) => st.pick[x.id] == null && !st.skip?.[x.id]); if (nx >= 0) { st.i = nx; draw() } else if (EVT) { st.allDone = true; draw() } else if (window.PC_V20) { st.tab = 'mine'; draw() } /* v20: ответил на все — сразу «Мои» */ }, 1000) }
    else if (nv) { st.navDir = +nv.dataset.nav < 0 ? 'bk' : 'fw'; /* фикс 06.11 (дирижёр: «крутим в одну сторону — уходят в одну»): направление — по стрелке, а не по номеру, по кругу тоже */ const n = open().length; st.i = LOOP && n ? (st.i + +nv.dataset.nav + n) % n : Math.max(0, st.i + +nv.dataset.nav); draw() }
    else if (go) { st.i = +go.dataset.go; draw() }
    else if (t) { st.tab = t.dataset.tab; st.myT = Date.now(); draw() }
    else if (f) { st.full = !st.full; draw() }
  })
  // новые прогнозы по событиям — по одному раз в 25 с (пример)
  if (!EVT) setInterval(() => { const inc = INCOMING(); MM = [...HOSTS][0]?._pcM; if (!MM || st.n >= inc.length) return; st.extra.unshift(inc[st.n++]); st.i = 0; st.ping = Date.now(); setTimeout(draw, 3100); setTimeout(() => { st.extra.forEach((x) => (x.fresh = false)) }, 4000); draw() }, 25000)
  // swipe: смахнуть карточку — влево «второй исход», вправо «первый»
  addEventListener('pointerdown', (e) => { const c = e.target.closest?.('[data-swipe]'); if (!c || e.target.closest('button')) return; const x0 = e.clientX; c.setPointerCapture(e.pointerId)
    const mv = (ev) => { const dx = ev.clientX - x0; c.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`; c.dataset.dir = dx > 40 ? 'y' : dx < -40 ? 'n' : '' }
    const up = (ev) => { c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up); const dx = ev.clientX - x0
      if (Math.abs(dx) > 80) { c.style.transition = 'transform .25s'; c.style.transform = `translateX(${dx > 0 ? 400 : -400}px) rotate(${dx / 10}deg)`; setTimeout(() => { st.pick[c.dataset.swipe] = dx > 0 ? 0 : 1; draw() }, 220) } else { c.style.transition = 'transform .2s'; c.style.transform = ''; c.dataset.dir = '' } }
    c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up) })
  if (EVT) { st.evt = 'one'; st.evN = 0; st.ping = Date.now()
    const set = (v) => { if (v === 'one') { st.evN++; st.ping = Date.now() } ; st.evt = v === 'done' ? 'many' : v; st.sw = v; st.i = 0; st.tab = 'open'; st.allDone = v === 'done'; st.skip = {}; st.outDir = ''; st.resT = 0; st.res = {}; open().forEach((x, n) => { delete st.pick[x.id]; if (st.conf) delete st.conf[x.id]; if (v === 'done') st.pick[x.id] = n % 2 }); paintSw(); draw(); if (v === 'one') setTimeout(draw, 3100) }
    const paintSw = () => { if (window.PC_AX) return; let b = document.querySelector('.qz-sw'); if (!b) { b = document.createElement('div'); b.className = 'qz-sw'; document.body.append(b) }
      b.innerHTML = `<span>Состояние</span>${[['wait', 'Ждём событие'], ['one', 'Пришло событие'], ['many', 'Накопились · 3'], ...(DONEV ? [['done', 'Всё собрано']] : [])].map(([k, t]) => `<button data-evt="${k}" class="${(st.sw || st.evt) === k ? 'is-on' : ''}">${t}</button>`).join('')}` }
    document.addEventListener('click', (e) => { const b = e.target.closest('[data-evt]'); if (b) set(b.dataset.evt) })
    // v17–v18 (дирижёр 05.11: «подписи и объяснялки убрать; переключалку со страницы убрать — настройки событий в настройки песочницы»): PC_AX — ось «Прогнозы» в панели настроек (window.LAB), PC_QUIET — без пояснений
    if (window.PC_AX) { const wrap = () => { const B = window.LAB; if (!B || B._pc) return; const O = [['wait', 'Ждём событие'], ['one', 'Пришло событие'], ['many', 'Накопились · 3'], ['done', 'Всё собрано']]
        window.LAB = { ...B, _pc: 1, axes: () => [...B.axes(), { key: 'pcev', name: 'Прогнозы', value: st.sw || st.evt, options: O.map(([v, label]) => ({ v, label })) }], set: (k, v) => (k === 'pcev' ? set(v) : B.set(k, v)) } }
      wrap(); addEventListener('DOMContentLoaded', wrap) }
    else { addEventListener('DOMContentLoaded', paintSw); if (document.body) paintSw() } }
  // дирижёр 06.11 (финальная проверка): «прогнозы показываем только в лайве» — до матча (До матча · Драфт · Пики готовы) и после матча блока нет
  window.GS_VOTE = (el, M) => { const off = ['pre', 'post'].includes((M || el._pcM || {}).state); el.style.display = off ? 'none' : ''; const w = el.parentElement && el.parentElement.children.length === 1 ? el.parentElement : null; if (w) w.style.display = off ? 'none' : ''; if (off) { HOSTS.delete(el); return }
    el._pcM = M || el._pcM; MM = el._pcM; HOSTS.add(el); el.className = 'pc-host'; draw() }
})()
