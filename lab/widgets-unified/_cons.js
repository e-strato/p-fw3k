// Общее для 4 виджетов по созвону 23.10 (решение 34): теги команд и колонка даты слева в одном формате.
// Подключать после данных виджета. window.U: tag(имя) · mid(имя) · tagHtml(имя) — имя по месту (U.fit) · when({ live, map, date, time, sub }) · dm(Date)
(() => {
  // Теги — по образцу поля shortname Liquipedia (исследование 23.10, п. 1): 2–4 знака, регистр как у команды, академия — «.A».
  // ‼️ Пример: Liquipedia не открылась, теги подобраны по памяти и GosuGamers — сверить с shortname перед продом
  const TAG = {
    '1w Team': '1w', '3DMAX': '3DMAX', 'Astra Invicta': 'AI', 'Aurora Gaming': 'Aurora', 'BC.Game': 'BCG', 'BIG Academy': 'BIG.A',
    'BetBoom Team': 'BB', 'Cloud Dawning': 'CD', 'CyberHero': 'CH', 'Dawn Bulls': 'DB', 'Direborn Esports': 'DRB', 'FaZe Clan': 'FaZe',
    'G2 Esports': 'G2', 'GamerLegion': 'GL', 'HULIGANI': 'HLG', 'Inner Circle x Insanity': 'IC', 'LEGION': 'LGN', 'LGD Gaming': 'LGD',
    'Natus Vincere': 'NAVI', 'Nemiga Gaming': 'Nemiga', 'Nigma Galaxy': 'NGX', 'Novus Gaming': 'NVS', 'OG': 'OG', 'PARIVISION': 'PARI',
    'Pipsqueak+4': 'P+4', 'PlayTime': 'PT', 'Power Rangers': 'PR', 'PuckChamp': 'PC', 'Resp Gaming': 'RESP', 'Royal Bear': 'RB',
    'Skyreavers': 'SKR', 'Team Falcons': 'FLCN', 'Team Kinetix': 'KNX', 'Team Liquid': 'Liquid', 'Team Lynx': 'Lynx', 'Team Nemesis': 'NMSS',
    'Team Nemesis Academy': 'NMSS.A', 'Team Refuser': 'RFS', 'Team Resilience': 'RSL', 'Team Spirit': 'Spirit', 'Team Synapse': 'SYN',
    'Team Tidebound': 'TB', 'Team Yandex': 'Yandex', 'The Bot$': 'Bot$', 'The MongolZ': 'MongolZ', 'Xipto Esports': 'XPT', 'Xtreme Gaming': 'XG',
    'Yangon Galacticos': 'YG', 'Yellow Submarine': 'YS', 'Zero Tenacity': 'ZT', 'salamit': 'salamit',
  }
  // Нет в таблице: до 6 знаков — как есть, длиннее — первые буквы слов (без Team / The / Gaming / Esports)
  const tag = n => { if (!n) return ''; if (TAG[n]) return TAG[n]; if (n.length <= 6) return n
    const w = n.replace(/^(Team|The) /, '').split(/\s+/).filter(x => !/^(Gaming|Esports|Team|Clan)$/i.test(x)); return w.length > 1 ? w.map(x => x[0]).join('').toUpperCase() : w[0].slice(0, 5) }
  const esc = s => String(s).replace(/"/g, '&quot;')
  // Три имени у команды (дирижёр 23.10: «не везде сокращать»): полное · среднее (без лишних слов) · тег.
  // Среднее: без Team / The в начале и Gaming / Esports / Clan в конце; особые — таблицей
  const MID = { 'Inner Circle x Insanity': 'Inner Circle', 'Team Nemesis Academy': 'Nemesis Academy', 'Yangon Galacticos': 'Yangon', 'Pipsqueak+4': 'Pipsqueak' }
  const mid = n => MID[n] || n.replace(/^(Team|The) /, '').replace(/ (Gaming|Esports|Team|Clan)$/, '')
  // Имя команды: сначала полное, U.fit ужимает по месту
  const tagHtml = n => `<span class="u-tag u-nm" title="${esc(n)}" data-n0="${esc(n)}" data-n1="${esc(mid(n))}" data-n2="${esc(tag(n))}">${n}</span>`
  // Подбор имён по месту. Группа — .u-fit (пара команд в строке) или одно имя. Имена соразмерны: шаг за шагом
  // сокращаем сперва более длинное, затем второе (полное+полное → среднее+полное → среднее+среднее → тег+среднее → тег+тег)
  const over = el => el.scrollWidth > el.clientWidth + 0.5
  const fitGroup = (box, ns) => { const by = [...ns].sort((a, b) => b.dataset.n0.length - a.dataset.n0.length), n = by.length
    for (let k = 0; k <= 2 * n; k++) { by.forEach((e, i) => { const l = Math.min(2, Math.floor((k + n - 1 - i) / n)); e.textContent = e.dataset['n' + l] })
      if (!(box && over(box)) && !by.some(over)) return } }
  const fit = (root = document) => { const seen = new Set()
    root.querySelectorAll('.u-nm').forEach(e => { const box = e.closest('.u-fit'); if (box) { if (!seen.has(box)) { seen.add(box); fitGroup(box, box.querySelectorAll('.u-nm')) } } else fitGroup(null, [e]) }) }
  // Сам следит за перерисовкой виджетов: новые имена — подбираем в следующем кадре; шрифты догрузились — ещё раз
  let raf = 0; const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fit() }) }
  const watch = () => { new MutationObserver(ms => { if (ms.some(m => [...m.addedNodes].some(x => x.nodeType === 1 && (x.matches('.u-nm') || x.querySelector('.u-nm'))))) later() }).observe(document.body, { childList: true, subtree: true }); later()
    if (document.fonts) document.fonts.ready.then(later); addEventListener('resize', later) }
  if (document.body) watch(); else addEventListener('DOMContentLoaded', watch)

  // Сегмент переезжает плавно, а не перепрыгивает (дирижёр 23.10). Виджеты по клику перерисовываются целиком, поэтому FLIP:
  // до клика запоминаем выбранную кнопку (offset* — не зависит от zoom доски), после перерисовки ведём «таблетку» от старого места к новому
  const SEG = '.t5-seg, .m6-seg'
  let was = null
  document.addEventListener('pointerdown', e => { const b = e.target.closest(SEG + ' button'), seg = b && b.closest(SEG), on = seg && seg.querySelector('.is-on')
    was = on && on !== b ? { w: seg.closest('.w'), k: seg.className.split(' ')[0], n: [...seg.closest('.w').querySelectorAll('.' + seg.className.split(' ')[0])].indexOf(seg), x: on.offsetLeft, y: on.offsetTop, wd: on.offsetWidth, h: on.offsetHeight } : null }, true)
  document.addEventListener('click', () => { const p = was; was = null; if (!p || !p.w || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const seg = p.w.querySelectorAll('.' + p.k)[p.n], on = seg && seg.querySelector('.is-on'); if (!on) return
    const cs = getComputedStyle(on), pill = document.createElement('i')
    pill.className = 'u-seg-pill'; Object.assign(pill.style, { left: on.offsetLeft + 'px', top: on.offsetTop + 'px', width: on.offsetWidth + 'px', height: on.offsetHeight + 'px',
      background: cs.background, borderRadius: cs.borderRadius, boxShadow: cs.boxShadow, clipPath: cs.clipPath })
    on.classList.add('u-seg-hold'); seg.prepend(pill)
    // плавнее (дирижёр 23.10): дольше и мягче; текст тоже не перескакивает — новая кнопка светлеет, бывшая гаснет
    const T = { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)' }, off = [...seg.querySelectorAll('button')].find(b => b !== on), dim = off ? getComputedStyle(off).color : cs.color
    const old = [...seg.querySelectorAll('button')].find(b => b !== on && Math.abs(b.offsetLeft - p.x) < 2 && Math.abs(b.offsetTop - p.y) < 2)
    on.animate([{ color: dim }, { color: cs.color }], T); if (old) old.animate([{ color: cs.color }, { color: dim }], T)
    pill.animate([{ transform: `translate(${p.x - on.offsetLeft}px, ${p.y - on.offsetTop}px)`, width: p.wd + 'px', height: p.h + 'px' }, { transform: 'none', width: on.offsetWidth + 'px', height: on.offsetHeight + 'px' }],
      T).onfinish = () => { // кнопка забирает подложку у «таблетки» без своего перехода — иначе подложка проявляется заново и мигает
        const tr = on.style.transition; on.style.transition = 'none'; on.classList.remove('u-seg-hold'); pill.remove(); void on.offsetWidth; on.style.transition = tr } })
  const dm = d => String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0')
  // Колонка даты (исследование 23.10, п. 3): фиксированной ширины слева, один формат во всех виджетах.
  // Верх — LIVE · ЧЧ:ММ (сегодня) · ДД.ММ (другой день); низ — мелкий контекст: Map 2 · Сегодня · Завтра · –01.11 и т. п.
  const when = ({ live, map, date, time, sub }) => `<span class="u-when">${live ? '<b class="u-live">LIVE</b>' : `<b>${time || date || '—'}</b>`}<span>${live ? (map ? 'Map ' + map : '') : (sub || '')}</span></span>`
  window.U = { TAG, tag, mid, tagHtml, fit, when, dm }
})()
