// Нет сети и ошибки (дирижёр 23.10: «когда нет соединения — какие плашки появляются, мы это не проработали»).
// 4 итоговых виджета (как widgets-23 v2) на главной; поверх — состояние связи. Вид плашки — window.OFF_CFG.kind (вариант лабы):
// 'top' — плашка под шапкой · 'icon' — значок в шапке, данные чуть тусклее · 'toast' — плашка внизу виджета · 'stamp' — «обновлено N мин назад» в шапке
// Шапка (дирижёр 23.10: «заголовок выделяется, справа иконка нет сети, лучше показывать последнее обновление»): 'hl-orange' — заголовок рыжий, справа значок и время ·
// 'hl-red' — заголовок красный, справа «Нет сети · 14:32» · 'hl-bg' — шапка залита рыжим, справа значок и время · 'hl-ago' — заголовок рыжий, справа «3 мин назад»
// 'dock' — плашка выезжает из-под низа виджета, как «Взять в фэнтези» у MVP (дирижёр 23.10): у MVP — вместо неё
// Пустое — у каждого варианта своё (window.OFF_CFG.empty, дирижёр 23.10: «хочу разные пустые увидеть»): text · icon · circle · ghost · game · line · dash · notify · tile
// Состояния (ось «Связь»): off — нет сети, данные старые · err — данных нет, не загрузилось · back — связь вернулась (на 2 с)
(() => {
  const K = (window.OFF_CFG || {}).kind
  const ic = {
    off: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M5.2 8.6a4 4 0 0 1 2.3-1.1M2.8 6.2A7.4 7.4 0 0 1 5 4.8m3-.9a7.4 7.4 0 0 1 5.2 2.3M10.6 8.4a4 4 0 0 1 .9.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="12" r="1" fill="currentColor"/></svg>',
    ok: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    err: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3.5M8 10.8v.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    re: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5V5h-2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
  const AT = '14:32' // пример: время последних данных
  const hdOf = w => w.querySelector('.t5-hd, .s6-hd, .t2-hd, .m6-hd'), bodyOf = w => w.querySelector('.w-scroll, .m6-card')
  const note = st => st === 'back' ? `${ic.ok}<span>Связь есть, данные обновлены</span>` : `${ic.off}<span>Нет сети · данные на ${AT}</span>`
  const E = (window.OFF_CFG || {}).empty || 'text'
  // что пусто — по виджету: заголовок, подпись, значок, кнопка (для circle / notify)
  const EM = { t5: ['Турниров нет', 'Новые появятся, как только их объявят', 'Архив турниров'], s6: ['Новых расхождений нет', 'Сверенные матчи — в архиве', 'Открыть архив'],
    t2: ['Переходов нет', 'Новые трансферы появятся здесь', 'Все трансферы'], m6: ['MVP пока нет', 'Выберем после первых матчей', 'MVP прошлого турнира'] }
  const EI = { t5: '<path d="M5 2.5h6v3a3 3 0 0 1-6 0v-3ZM5 3.5H3a2 2 0 0 0 2 3M11 3.5h2a2 2 0 0 1-2 3M8 8.5v3M5.5 13.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
    s6: '<path d="M3 5.5h9m0 0-2.5-2.5M12 5.5 9.5 8M13 10.5H4m0 0 2.5-2.5M4 10.5 6.5 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
    t2: '<circle cx="8" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 13.5a4.5 4.5 0 0 1 9 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    m6: '<path d="m8 2.5 1.7 3.4 3.8.6-2.7 2.6.6 3.8L8 11.1l-3.4 1.8.6-3.8-2.7-2.6 3.8-.6L8 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>' }
  const wid = w => ['t5', 's6', 't2', 'm6'].find(k => w.classList.contains(k)) || (w.classList.contains('t6') ? 't5' : w.classList.contains('s3') ? 's6' : 'm6')
  const svg = (d, n) => `<svg width="${n}" height="${n}" viewBox="0 0 16 16" fill="none">${d}</svg>`
  const emptyHtml = k => { const [t, c, b] = EM[k], i = EI[k], gl = window.MVP_DATA?.games?.find(g => g.id === 'dota2')?.logo
    if (E === 'icon') return `<div class="o-x o-em o-em--icon">${svg(i, 24)}<b>${t}</b><span>${c}</span></div>`
    if (E === 'circle') return `<div class="o-x o-em o-em--circle"><i>${svg(i, 20)}</i><b>${t}</b><span>${c}</span><button class="o-btn">${b}</button></div>`
    if (E === 'ghost') return `<div class="o-x o-em o-em--ghost">${'<i><u></u><s></s></i>'.repeat(4)}<p><b>${t}</b><span>${c}</span></p></div>`
    if (E === 'game') return `<div class="o-x o-em o-em--game">${gl ? `<img src="${gl}" alt="">` : ''}<b>${t}</b><span>${c}</span></div>`
    if (E === 'line') return `<div class="o-x o-em o-em--line">${svg(i, 16)}<span><b>${t}</b> · ${c}</span></div>`
    if (E === 'dash') return `<div class="o-x o-em o-em--dash"><b>${t}</b><span>${c}</span></div>`
    if (E === 'tile') return `<div class="o-x o-em o-em--tile"><i>${svg(i, 18)}</i><b>${t}</b><span>${c}</span></div>`
    if (E === 'notify') return `<div class="o-x o-em o-em--notify"><b>${t}</b><span>${c}</span><a href="#" class="o-lnk">Сообщить, когда появятся</a></div>`
    return `<div class="o-x o-em"><b>${t}</b><span>${c}</span></div>` }
  // справа в шапке — перед «Архив» / «Смотреть все», если есть
  const right = (hd, html) => { const end = [...hd.children].reverse().find(x => x.matches('a, button.s6-arch, button.t5-arch'))
    end ? end.insertAdjacentHTML('beforebegin', html) : hd.insertAdjacentHTML('beforeend', html) }
  // плашка из-под низа: у MVP — внутри (наклоняется с карточкой), у остальных — следом за виджетом
  const dockOf = w => w.classList.contains('m6') ? w.querySelector(':scope > .o-dock') : w.nextElementSibling?.classList.contains('o-dock') ? w.nextElementSibling : null
  const RED = (window.OFF_CFG || {}).red ? ' o-dock--red' : '' // v10 — красная
  const dockHtml = st => st === 'back' ? `<div class="o-x o-dock o-dock--back${RED}">${ic.ok}<span>Связь есть</span><span class="o-dock__t">Обновлено только что</span></div>`
    : st === 'err' ? `<div class="o-x o-dock${RED}">${ic.off}<span>Нет сети</span><button class="o-dock__t o-dock__b">${ic.re}${RED ? 'Обновить' : 'Повторить'}</button></div>`
    : RED ? `<div class="o-x o-dock${RED}">${ic.off}<span>Нет сети · ${AT}</span><button class="o-dock__t o-dock__b">${ic.re}Обновить</button></div>` // v10 — справа «Обновить», время — к «Нет сети» (дирижёр 23.10)
    : `<div class="o-x o-dock${RED}">${ic.off}<span>Нет сети</span><span class="o-dock__t">Данные на ${AT}</span></div>`
  function apply(w, st) { const od = dockOf(w), had = !!od; if (od) od.remove(); w.querySelectorAll('.o-x').forEach(x => x.remove()); w.classList.remove('o-dim', 'o-back', 'o-hl', 'o-hl--red', 'o-hl--bg')
    const hd = hdOf(w), bd = bodyOf(w); if (bd) bd.style.display = ''; w.querySelectorAll('.m6-dock').forEach(d => d.style.display = ''); if (!st) return
    if (st === 'empty') { if (bd) { bd.style.display = 'none'; bd.insertAdjacentHTML('afterend', emptyHtml(wid(w))) } w.querySelectorAll('.m6-dock').forEach(d => d.style.display = 'none'); return }
    if (K === 'dock' && st !== 'empty') { const html = dockHtml(st), m6 = w.classList.contains('m6')
      w.querySelectorAll('.m6-dock').forEach(d => d.style.display = 'none'); if (st !== 'back') w.classList.add('o-dim'); else w.classList.add('o-back')
      m6 ? w.querySelector('.m6-main').insertAdjacentHTML('afterend', html) : w.insertAdjacentHTML('afterend', html)
      if (had) dockOf(w)?.classList.add('is-still') // перерисовка по клику — без повторного выезда
      if (st !== 'err') return }
    if (K && K.startsWith('hl-') && hd && st !== 'err') { // шапка: заголовок цветом, справа значок и время последнего обновления
      if (st === 'back') { right(hd, `<span class="o-x o-r o-r--back">${ic.ok}Только что</span>`); w.classList.add('o-back'); return }
      w.classList.add('o-dim', 'o-hl', ...(K === 'hl-red' ? ['o-hl--red'] : K === 'hl-bg' ? ['o-hl--bg'] : []))
      right(hd, `<span class="o-x o-r" title="Нет сети · данные на ${AT}">${ic.off}${K === 'hl-red' ? 'Нет сети · ' + AT : K === 'hl-ago' ? '3 мин назад' : AT}</span>`); return }
    if (st === 'err') { // данных нет: вместо тела — что случилось и «Повторить»; одинаково во всех вариантах
      if (bd) { bd.style.display = 'none'; bd.insertAdjacentHTML('afterend', `<div class="o-x o-err">${ic.err}<b>Не удалось загрузить</b><span>Нет соединения с интернетом</span><button class="o-btn">${ic.re}Повторить</button></div>`) }
      w.querySelectorAll('.m6-dock').forEach(d => d.style.display = 'none'); return }
    if (st === 'back') w.classList.add('o-back'); else w.classList.add('o-dim')
    if (K === 'top' && hd) hd.insertAdjacentHTML('afterend', `<div class="o-x o-bar o-bar--${st}">${note(st)}</div>`)
    if (K === 'toast') w.insertAdjacentHTML('beforeend', `<div class="o-x o-toast o-toast--${st}">${note(st)}</div>`)
    if (K === 'icon' && hd) hd.insertAdjacentHTML('beforeend', `<span class="o-x o-ic o-ic--${st}" title="${st === 'back' ? 'Связь есть' : 'Нет сети · данные на ' + AT}">${st === 'back' ? ic.ok : ic.off}</span>`)
    if (K === 'stamp' && hd) hd.insertAdjacentHTML('beforeend', `<span class="o-x o-stamp o-stamp--${st}">${st === 'back' ? ic.ok + 'Только что' : ic.off + 'Обновлено в ' + AT}</span>`) }
  window.OFF = { apply }
})()
