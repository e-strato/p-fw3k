// Виджет трансферов, заход 4 (созвон 22.10, решение 29, пункты 3.1–3.3): проще, как на HLTV — игрок, откуда » куда, дата.
// Цены нет. Фильтра игр и периода нет: виджет стоит на странице одной игры (Dota 2) — CS2-переходы из данных не показываем.
// Состояния (О.16): на главной — все переходы игры; в матче — только двух его команд (ушёл из неё или пришёл в неё); нет таких — пустое состояние.
// Внизу — «Смотреть все» (страницы всех трансферов пока нет). Под ником — позиция: игра и так понятна по странице.
// Варианты (o.opt.style): 'hltv' — как фото 1: шапка колонок «Игрок · Трансфер · Дата», свежие даты цветом;
// 'days' — строки сгруппированы по дате, у каждой «из [лого] → [лого] Команда», новая команда названа;
// 'big' — карточки покрупнее: аватар 40, ник крупно, переход строкой с названиями, дата в углу.
// Данные — window.TR_DATA (../widget-transfers/_data.js, Liquipedia). TR2.render(узел, { match: { a, b } | null, opt })
(() => {
  const D = window.TR_DATA, NOW = new Date(D.asOf.split('.').reverse().join('-'))
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const POS = { 1: 'керри', 2: 'мид', 3: 'оффлейн', 4: 'саппорт', 5: 'саппорт' }
  const dd = s => s.split('-').slice(1).reverse().join('.')
  const dayName = s => { const [, m, d] = s.split('-'), n = Math.round((NOW - new Date(s)) / 864e5); return n === 0 ? 'Сегодня' : n === 1 ? 'Вчера' : `${+d} ${MON[m - 1]}` }
  const fresh = s => (NOW - new Date(s)) / 864e5 <= 7 // за последнюю неделю — дата цветом, как у HLTV
  const ini = n => String(n || '—').replace(/^(Team |The )/, '').slice(0, 2).toUpperCase() // n пустой — уход в никуда (переходы из общей базы)
  const img = (src, n, cls) => src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<span class=&quot;${cls} t2-ini&quot;>${ini(n)}</span>'">` : `<span class="${cls} t2-ini">${ini(n)}</span>`
  const logo = (n, cls = 't2-lg') => img((D.teams[n] || {}).logo, n, cls)
  // v5 (дирижёр 22.10): вместо аватара — фото игрока (faces/, вырезанные портреты dota2.ru), под ником — игра; виджет выше
  let V5 = false
  const FACES = ['batyuk', 'davai', 'malr1ne', 'sss', 'sumail', 'ta2000', 'topson', 'wisper', 'wits', 'yuma', 'yuragi']
  // v6 (opt.gameAva) — игра значком на фото, под ником ничего
  let GA = false, SK = false // SK (opt.skinV1, v7) — раскладка v6, а шрифты, размеры, стрелка и плашка — как у v1 (дирижёр 22.10)
  const G = p => D.games.find(g => g.id === (p.game || 'dota2')) || D.game // игра игрока: трансферы — из всех игр сразу (дирижёр 22.10)
  const ph = (p, cls) => V5 && FACES.includes(p.nick.toLowerCase()) ? `<span class="${cls} t2-ph" style="background-image:url('${(window.IMGR || (x => x))(`${window.TR2_BASE || ''}faces/${p.nick.toLowerCase()}.webp`)}')"></span>` : img(p.photo, p.nick, cls)
  // CS2 — значок в цвет игры (оранжево-жёлтый), а не белым (дирижёр 22.10): логотип маской, заливка цветом
  const gIcon = p => G(p).id === 'cs2' ? `<span class="t2-lg t2-avg t2-avg--cs"><i style="--m:url('${G(p).logo}')"></i></span>` : img(G(p).logo, G(p).name, 't2-lg t2-avg')
  const ava = (p, cls = 't2-av') => GA ? `<span class="t2-avw">${ph(p, cls)}${gIcon(p)}</span>` : ph(p, cls)
  const sub = p => GA ? '' : V5 ? `<span class="t2-game">${img(G(p).logo, G(p).name, 't2-lg t2-lg--12')}${G(p).name}</span>` : role(p)
  const role = p => p.pos ? `поз. ${p.pos} · ${POS[p.pos]}` : p.role || ''
  const loan = p => p.kind === 'loan' ? '<span class="t2-tag">аренда</span>' : ''
  const go = '<span class="t2-go">»</span>'
  const arrow = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8m-3-3 3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const href = p => `#player/${encodeURIComponent(p.nick)}` // страницы игрока пока нет

  // Строки трёх вариантов
  const rowHltv = p => `<a class="t2-r" href="${href(p)}">${ava(p)}<span class="t2-r__p"><b class="t2-nm">${p.nick}</b>${GA ? '' : `<span class="t2-cap">${sub(p)}</span>`}</span>
    <span class="t2-r__w" title="${p.from} → ${p.to}">${logo(p.from, 't2-lg is-from')}${SK ? `<i class="t2-ar">${arrow}</i>` : go}${logo(p.to)}</span><span class="t2-r__d ${fresh(p.date) ? 'is-new' : ''}">${dd(p.date)}</span></a>`
  const rowDays = p => `<a class="t2-r t2-r--days" href="${href(p)}">${ava(p)}<span class="t2-r__p"><span class="t2-r__n"><b class="t2-nm">${p.nick}</b>${loan(p)}</span>
    <span class="t2-way"><span class="t2-cap">из</span>${logo(p.from, 't2-lg t2-lg--14 is-from')}${arrow}${logo(p.to, 't2-lg t2-lg--14')}<span class="t2-nm t2-to">${p.to}</span></span></span></a>`
  const rowBig = p => `<a class="t2-c" href="${href(p)}">${ava(p, 't2-av t2-av--40')}<span class="t2-c__m"><span class="t2-r__n"><b class="t2-nm">${p.nick}</b>${loan(p)}<span class="t2-c__d ${fresh(p.date) ? 'is-new' : ''}">${dd(p.date)}</span></span>
    <span class="t2-cap">${role(p)}</span>
    <span class="t2-way t2-way--big">${logo(p.from, 't2-lg is-from')}<span class="t2-nm t2-from">${p.from}</span>${arrow}${logo(p.to)}<span class="t2-nm t2-to">${p.to}</span></span></span></a>`

  // v7 (style 'orig', дирижёр 22.10: «как наш оригинальный виджет, первый, но логика — из последней»): разметка и стили v1 (v12 · Таблица во всю ширину,
  // ../widget-transfers/_tr.css) — строки во всю ширину, игра и дата у ника, «откуда → куда», плашка «Все трансферы» снизу; без цены, места, игр и периода; фото — как v5
  const orig = ps => `<div class="t3-main"><div class="tr-hd t3-hd"><div class="tr-hd__t"><b>Трансферы</b></div></div><div class="w-scroll"><div class="t3-list t3-list--tableflat">${ps.map(p =>
      `<a class="t3-r" href="${href(p)}">${ph(p, 't3-av t3-av--sm')}<span class="t3-m"><b class="t9-nk"><img class="t6-gi t7-gl" src="${G(p).logo}" alt="${G(p).name}"><span class="tr-nm">${p.nick}</span><span class="t9-dt">${dd(p.date)}</span></b>`
      + `<span class="t9-to">${logo(p.from, 'tr-lg t9-old')}<i class="t9-ar">${arrow}</i>${logo(p.to, 'tr-lg')}<span class="tr-nm">${p.to}</span>${p.kind === 'loan' ? '<span class="tr-chip">аренда</span>' : ''}</span></span></a>`).join('')}</div></div></div>
    <a class="t3-dock" href="#transfers"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h9m-2.5-2.5L12 5 9.5 7.5M13 11H4m2.5-2.5L4 11l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Все трансферы</span><span class="tr-cap">${D.list.length} за сезон</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
  const body = (ps, st) => {
    if (st === 'hltv') return `<div class="t2-th"><span>Игрок</span><span>Трансфер</span><span>Дата</span></div>${ps.map(rowHltv).join('')}`
    if (st === 'days') { const by = []; ps.forEach(p => { const l = by[by.length - 1]; l && l.d === p.date ? l.ps.push(p) : by.push({ d: p.date, ps: [p] }) })
      return by.map(g => `<div class="t2-day ${fresh(g.d) ? 'is-new' : ''}">${dayName(g.d)}</div>${g.ps.map(rowDays).join('')}`).join('') }
    return ps.map(rowBig).join('')
  }
  const empty = m => `<div class="t2-empty"><div class="t2-empty__lg">${logo(m.a, 't2-lg t2-lg--28')}${logo(m.b, 't2-lg t2-lg--28')}</div><b>Переходов нет</b><span class="t2-cap">У команд матча новых<br>трансферов нет</span></div>`

  function render(el, o) {
    const st = (o.opt || {}).style || 'hltv', m = o.match; V5 = !!(o.opt || {}).v5; GA = !!(o.opt || {}).gameAva; SK = !!(o.opt || {}).skinV1
    const ps = D.list.filter(p => (V5 || st === 'orig' || (p.game || 'dota2') === 'dota2') && (!m || [m.a, m.b].some(n => n === p.from || n === p.to))) // v5–v7 — все игры сразу
    if (st === 'orig') { el.className = 'w tr t3 t3--tableflat t3--dock t2-orig'; el.innerHTML = ps.length ? orig(ps) : `<div class="t3-main"><div class="tr-hd t3-hd"><div class="tr-hd__t"><b>Трансферы</b></div></div>${empty(m)}</div>`; return }
    const top = !!(o.opt || {}).topAll // v8: «Смотреть все» — ссылкой в шапке, нижней плашки нет (дирижёр 22.10)
    el.className = `w t2 t2--${st}` + (V5 ? ' t2--v5' : '') + (SK ? ' t2--sk' : '') + (top ? ' t2--top' : '') + ((o.opt || {}).rows ? ' t2-rows--' + o.opt.rows : '')
    el.innerHTML = `<div class="t2-hd"><b>Трансферы</b>${m && ps.length ? `<span class="t2-cap">команды матча</span>` : ''}${top ? '<a class="t2-top" href="#transfers">Смотреть все<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' : ''}</div>
      <div class="w-scroll"><div class="t2-bd">${ps.length ? body(ps, st) : empty(m)}</div></div>
      ${top ? '' : '<div class="t2-ft"><a class="t2-all" href="#transfers">Смотреть все</a></div>'}`
  }
  // v12 (rows 'tint'): наведение — строка заливается цветом новой команды (средний цвет её логотипа)
  const tone = im => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 24)
    const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, w = 0
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); if (sat < 40) continue; r += d[i] * sat; g += d[i + 1] * sat; b += d[i + 2] * sat; w += sat }
    // Белый / серый / тёмный логотип (Team Liquid) — подсветка светлая, а не тёмная (дирижёр 22.10)
    const R = r / w, G2 = g / w, B = b / w, light = 'rgba(255,255,255,.1)'
    // Белый — только если своего цвета нет: логотип без цветных пикселей или цвет почти чёрный (тёмно-синий Liquid); красный FaZe, голубой Tidebound — цветом
    return !w || Math.max(R, G2, B) < 100 ? light : `rgba(${Math.round(R)},${Math.round(G2)},${Math.round(B)},.18)` } catch (e) { return null } }
  const tint = el => el.querySelectorAll('.t2-r').forEach(r => { const im = r.querySelector('.t2-r__w img:last-of-type'); if (!im) return
    const f = () => { const c = tone(im); if (c) r.style.setProperty('--tint', c) }; im.complete ? f() : im.addEventListener('load', f, { once: true }) })
  const _render = render
  window.TR2 = { render: (el, o) => { _render(el, o); if ((o.opt || {}).rows === 'tint') tint(el) } }
})()
