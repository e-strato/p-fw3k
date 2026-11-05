// Лаба w-stats v8 (дирижёр 04.11: «две колонки — не нравится; кардинально другое, три колонки, не занимать много места, типографикой — на основе того, что сегодня делали»; Claude-B).
// window.WST8 — вкладка «Статистика» собирается заново, компактно, из уже нарисованных блоков (w-preview-2: «О матче», «Составы», «Статистика к матчу»):
// сверху одна строка — команды и шанс полосой; ниже три колонки строками, как «Участники» на странице турнира и сайдбар «Разбор»:
// 1 — «Сравнение»: подпись … значение A · значение B (лучшее — белым, второе — серым), последние 5 серий буквами, итог; 2 и 3 — составы команд.
// Исходные блоки прячутся (класс wst8-src), данные и вид остальных лаб не трогаются.
(() => {
  if (!window.WST8 && !window.WST_AB) return
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  const tx = (el) => (el ? el.textContent.trim() : '')
  function build(gm) {
    const about = gm.querySelector('.wst-about'), lu = gm.querySelector('section.cd.ws24-cd'), ws7 = gm.querySelector('.ws7'), st = ws7 && ws7.closest('section.cd')
    if (!about || !lu || !ws7 || gm.querySelector('.wst8')) return
    // шапка: команды и шанс
    const top = about.querySelector('.ws47-top'), lg = top ? [...top.querySelectorAll('img.ws7-lg')].map((i) => i.getAttribute('src')) : [], nm = top ? [...top.querySelectorAll('.ws45-t b')].map(tx) : ['', ''], pc = top ? [...top.querySelectorAll('.ws47-big em')].map(tx) : ['', '']
    const pa = parseInt(pc[0]) || 50
    // сравнение: плитки «О матче» (без итоговой) + «Статистика к матчу»
    const rows = []
    about.querySelectorAll('.ws49-c:not(.ws49-sum)').forEach((c) => { const v = [...c.querySelectorAll('.ws43-v > span')].map((s) => tx(s.querySelector('b')) || tx(s)); rows.push([tx(c.querySelector('.ws43-t small')).split(' · ')[0], v[0], v[v.length - 1], c.classList.contains('is-a') ? 'a' : c.classList.contains('is-b') ? 'b' : '']) })
    const cols = [...ws7.querySelectorAll('.ws7-col')]
    const t8 = cols.map((c) => [...c.querySelectorAll('.ws8-t')].map((t) => [tx(t.querySelector('small')), tx(t.querySelector('b'))]))
    ;(t8[0] || []).forEach(([k, va], i) => { if (/Место/.test(k)) rows.push([k, va, (t8[1][i] || [])[1] || '', parseInt(va) < parseInt((t8[1][i] || [])[1]) ? 'a' : 'b']) })
    const l5 = cols.map((c) => [...c.querySelectorAll('.ws13-c')].map((x) => `<i class="${x.classList.contains('W') ? 'w' : ''}" title="${x.classList.contains('W') ? 'победа' : 'поражение'} ${tx(x.querySelector('small'))}"></i>`).join(''))
    const sum = about.querySelector('.ws49-sum'), fav = sum ? tx(sum.querySelector('b')) : ''
    const h2h = tx(ws7.querySelector('.ws23')).replace(/\s+/g, ' ')
    const R = (k, a, b, best) => `<div class="wst8-r"><span class="k">${esc(k)}</span><b class="${best === 'a' ? 'on' : ''}">${esc(a)}</b><b class="${best === 'b' ? 'on' : ''}">${esc(b)}</b></div>`
    const cmp = `<div class="wst8-c"><div class="wst8-h"><b>Сравнение</b><span class="wst8-tl"><img src="${lg[0] || ''}" alt=""><img src="${lg[1] || ''}" alt=""></span></div>
      ${rows.map((r) => R(r[0], r[1], r[2], r[3])).join('')}
      <div class="wst8-r"><span class="k">Последние 5 серий</span><b class="wst8-l5">${l5[0] || ''}</b><b class="wst8-l5">${l5[1] || ''}</b></div>
      ${h2h ? `<div class="wst8-r"><span class="k">${esc(h2h.split(':')[0])}</span><b class="on wst8-h2h">${esc(h2h.split(':').slice(1).join(':').trim())}</b></div>` : ''}
      ${fav ? `<div class="wst8-sum">${esc(fav)}</div>` : ''}</div>`
    // составы: строки как в «Участниках» — номер, фото, ник, главный герой и «побед из карт»
    const team = (div, i) => `<div class="wst8-c"><div class="wst8-h"><b><img src="${lg[i] || ''}" alt="">${esc(nm[i] || tx(div.querySelector('.ws28-t')))}</b><small>главный герой · побед из карт</small></div>
      ${[...div.querySelectorAll('.ws27-r')].map((r) => { const ph = r.querySelector('.wst-pa img, .ws27-av'), n = tx(r.querySelector('.wst-pa i, .ws24-n')), hi = r.querySelector('.ws37-c img'), rec = tx(r.querySelector('.ws37-c b'))
        return `<div class="wst8-p"><span class="n">${esc(n)}</span>${ph && ph.tagName === 'IMG' ? `<img class="ph" src="${ph.getAttribute('src')}" alt="">` : '<span class="ph"></span>'}<b>${esc(tx(r.querySelector(':scope > b')))}</b>${hi ? `<img class="hi" src="${hi.getAttribute('src')}" title="${esc(hi.getAttribute('title') || '')}" alt="">` : ''}<em class="${r.querySelector('.ws37-c.is-top') ? 'on' : ''}">${esc(rec)}</em></div>` }).join('')}</div>`
    const teams = [...lu.querySelectorAll('.ws28 > div')]
    const html = `<section class="cd wst8"><div class="wst8-top"><span class="t"><img src="${lg[0] || ''}" alt=""><b>${esc(nm[0])}</b></span><span class="p"><b class="${pa >= 50 ? 'on' : ''}">${esc(pc[0])}</b><i><i style="width:${pa}%"></i></i><b class="${pa < 50 ? 'on' : ''}">${esc(pc[1])}</b></span><span class="t b"><b>${esc(nm[1])}</b><img src="${lg[1] || ''}" alt=""></span></div>
      <small class="wst8-note">Шанс — модель по статистике турнира до матча, не ставки</small>
      <div class="wst8-g">${cmp}${teams.map(team).join('')}</div></section>`
    about.insertAdjacentHTML('beforebegin', html)
    ;[about, lu, st].forEach((x) => x && x.classList.add('wst8-src'))
  }
  // ── v9–v11 (дирижёр 04.11: «работаем только по первому блоку статистики — нужны вариации именно его»): window.WST_AB — только «О матче», остальные блоки — как v4
  // cells — шапка строкой + 6 ячеек в три колонки: подпись, «77% · 60%» (лучшее белым), без полос и плашек ·
  // mirror — шапка строкой + таблица: значение A · подпись по центру · значение B, под подписью полоса от центра к лидеру ·
  // big — крупные шансы и три колонки по два показателя крупной типографикой: число лидера крупно, второе — мелко рядом
  function buildAbout(gm) {
    const about = gm.querySelector('.wst-about'); if (!about || gm.querySelector('.wstA')) return
    const top = about.querySelector('.ws47-top'), lg = top ? [...top.querySelectorAll('img.ws7-lg')].map((i) => i.getAttribute('src')) : [], nm = top ? [...top.querySelectorAll('.ws45-t b')].map(tx) : ['', ''], pc = top ? [...top.querySelectorAll('.ws47-big em')].map(tx) : ['', '']
    const pa = parseInt(pc[0]) || 50, MODE = window.WST_AB
    const rows = [...about.querySelectorAll('.ws49-c:not(.ws49-sum)')].map((c) => { const v = [...c.querySelectorAll('.ws43-v > span')].map((x) => tx(x.querySelector('b')) || tx(x)), ch = c.querySelector('.ws50'), sh = parseInt(tx(ch)) || 50
      return { k: tx(c.querySelector('.ws43-t small')), a: v[0], b: v[v.length - 1], best: c.classList.contains('is-a') ? 'a' : c.classList.contains('is-b') ? 'b' : '', sh: ch && ch.classList.contains('b') ? 100 - sh : sh } })
    const sum = about.querySelector('.ws49-sum'), fav = sum ? tx(sum.querySelector('b')) : '', favSub = sum ? tx(sum.querySelector('span, small:last-of-type')) : ''
    const hd = `<div class="wstA-hd"><b>О матче</b><small>шанс — модель по статистике турнира до матча, не ставки</small></div>`
    const line = `<div class="wst8-top"><span class="t"><img src="${lg[0] || ''}" alt=""><b>${esc(nm[0])}</b></span><span class="p"><b class="${pa >= 50 ? 'on' : ''}">${esc(pc[0])}</b><i><i style="width:${pa}%"></i></i><b class="${pa < 50 ? 'on' : ''}">${esc(pc[1])}</b></span><span class="t b"><b>${esc(nm[1])}</b><img src="${lg[1] || ''}" alt=""></span></div>`
    const k1 = (k) => esc(k.split(' · ')[0]), k2 = (k) => esc(k.split(' · ').slice(1).join(' · '))
    // v12–v13 (дирижёр 04.11: «v10, v11 норм; карточка с фаворитом — всё равно куда-то большой лого засунуть»): WST_FAVCARD — итог карточкой с мягким фоном и большим лого фаворита справа
    const FC = window.WST_FAVCARD ? `<div class="wstA-fc"><span><small>Итог · среднее 5 показателей</small><b>${esc(fav)}</b><small>${esc(pa >= 50 ? pc[0] : pc[1])} против ${esc(pa >= 50 ? pc[1] : pc[0])}</small></span><img src="${lg[pa >= 50 ? 0 : 1] || ''}" alt=""></div>` : ''
    // v14–v15 (дирижёр 04.11: «криво карточки выглядят»): WST_FAVCARD2 — карточка ровно в ячейке сетки: та же линия снизу, что у соседей, по высоте — от линии до линии с отступом 8;
    // в две строки (имя фаворита · «56 % против 44 %, среднее 5 показателей»), лого — по высоте карточки
    const FC2 = window.WST_FAVCARD2 ? `<div class="wstA-fcc"><div class="wstA-fc wstA-fc2"><span><b>${esc(fav)}</b><small>${esc(pa >= 50 ? pc[0] : pc[1])} против ${esc(pa >= 50 ? pc[1] : pc[0])}<span class="x"> · среднее 5 показателей</span></small></span><img src="${lg[pa >= 50 ? 0 : 1] || ''}" alt=""></div></div>` : ''
    // v16–v17 (дирижёр 04.11: «всё равно криво — отступы от разделителей, надо, чтобы их не было»): WST_FAVCARD3 — карточка во всю ячейку, от разделителя до разделителя, без скругления
    // v18 (дирижёр 04.11: «на маленьком экране по 2 делаем»): WST_M2 — на телефоне ячейки в две колонки, шапка — команды строкой, шансы под ними; числа не переносятся
    let body = ''
    if (MODE === 'cells') body = line + `<div class="wstA-cells">${rows.map((r) => `<div class="wstA-cell"><small>${k1(r.k)}</small><span><b class="${r.best === 'a' ? 'on' : ''}">${esc(r.a)}</b><i>·</i><b class="${r.best === 'b' ? 'on' : ''}">${esc(r.b)}</b></span></div>`).join('')}<div class="wstA-cell wstA-fav"><small>Итог</small><span><b class="on">${esc(fav)}</b></span></div></div>`
    else if (MODE === 'mirror') body = line + `<div class="wstA-mir">${rows.map((r) => `<div class="wstA-mr"><b class="${r.best === 'a' ? 'on' : ''}">${esc(r.a)}</b><span class="m"><small>${k1(r.k)}</small><i class="bar"><i class="${r.sh >= 50 ? 'a' : 'b'}" style="width:${Math.abs(r.sh - 50)}%"></i></i></span><b class="${r.best === 'b' ? 'on' : ''}">${esc(r.b)}</b></div>`).join('')}${FC2 || FC || `<div class="wstA-mr wstA-mf"><span class="m"><small>Итог</small><b>${esc(fav)}</b></span></div>`}</div>`
    else body = `<div class="wstA-big"><span class="t"><img src="${lg[0] || ''}" alt="">${esc(nm[0])}</span><b class="${pa >= 50 ? 'on' : ''}">${esc(pc[0])}</b><small>шанс</small><b class="${pa < 50 ? 'on' : ''}">${esc(pc[1])}</b><span class="t b">${esc(nm[1])}<img src="${lg[1] || ''}" alt=""></span></div>
      <div class="wstA-bg">${rows.map((r) => { const w = r.best === 'b' ? [r.b, r.a, 1] : [r.a, r.b, 0]; return `<div class="wstA-bc"><small>${k1(r.k)}</small><span><b>${esc(w[0])}</b><img src="${lg[w[2]] || ''}" alt=""><i>против ${esc(w[1])}</i></span></div>` }).join('')}${FC2 || FC || `<div class="wstA-bc"><small>Итог</small><span><b class="s">${esc(fav)}</b></span></div>`}</div>`
    about.insertAdjacentHTML('beforebegin', `<section class="cd wstA wstA--${MODE}${FC2 ? ' wstA--fc2' : ''}${window.WST_FAVCARD3 ? ' wstA--fc3' : ''}${window.WST_M2 ? ' wstA--m2' : ''}">${hd}${body}</section>`); about.classList.add('wst8-src')
  }
  const run = () => document.querySelectorAll('#feed section.gm').forEach((g) => { if (window.WST8) build(g); if (window.WST_AB) buildAbout(g) })
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, { childList: true, subtree: true })
  addEventListener('load', () => setTimeout(run, 200))
})()
