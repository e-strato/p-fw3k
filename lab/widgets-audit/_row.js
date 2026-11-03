// Четыре итоговых виджета в ряд (как на странице «Все виджеты», lab/widgets-all) + подписи стилей текстовых слоёв под каждым.
// Общее для лаб widgets-audit («как есть») и widgets-unified («унифицировано», свои стили поверх). Конфиг страницы — window.ROW:
// { notes: { t4, r2, tr, mvp } — «что поменялось» под виджетом (html), styles: true — сразу показать стили }.
// Сверху: экран (Главная · Матч · Команда) и свитч «Стили» — подсветка текстовых слоёв цветом по стилю + список стилей под каждым виджетом.
(() => {
  const C = window.ROW || {}
  // Пути картинок — как в widgets-all/_all.js: страница лежит рядом, папки виджетов — соседние
  const R = (dir, p) => !p || /^(data:|https?:|\/|\.\.)/.test(p) ? p : `../${dir}/${p}`
  { const D = T4_DATA, f = o => { if (o && o.logo) o.logo = R('widget-tournament-4', o.logo) }; f(D.game); Object.values(D.teams).forEach(f); D.tours.forEach(f) }
  { const D = TR_DATA, f = (o, k) => { if (o && o[k]) o[k] = R('widget-transfers', o[k]) }
    f(D.game, 'logo'); D.games.forEach(g => f(g, 'logo')); Object.values(D.teams).forEach(t => f(t, 'logo')); D.list.forEach(p => f(p, 'photo')) }
  { const D = MVP_DATA, f = (o, k) => { if (o && o[k]) o[k] = R('widget-mvp', o[k]) }
    D.games.forEach(g => f(g, 'logo')); Object.keys(D.teams).forEach(k => D.teams[k] = R('widget-mvp', D.teams[k])); D.list.forEach(p => { f(p, 'photo'); f(p, 'hero') }) }

  // Виджеты и их опции — ровно как в widgets-all (турнир v6, замены v18, трансферы v12, MVP v18)
  const SCR = {
    home: { name: 'Главная', t4: {}, tr: {}, mvp: {} },
    match: { name: 'Матч', t4: { match: { a: 'Power Rangers', b: 'Inner Circle x Insanity' } }, tr: { match: { a: 'Inner Circle x Insanity', b: 'Power Rangers' } }, mvp: { match: { a: 'Team Spirit', b: 'Team Liquid' } } },
    team: { name: 'Команда', t4: { team: 'Team Spirit' }, tr: { team: 'Team Spirit' }, mvp: { team: 'Team Spirit' } },
  }
  const W = [
    { id: 't4', name: 'Турнир · v6', draw: (el, sc) => T4.render(el, { ...sc.t4, opt: { v3: true, tier: 'fill', tierEn: true, final: 'merge' } }) },
    { id: 'r2', name: 'Замены · v18', draw: (el, sc) => S6.render(el, { ...(sc.t4.match ? { match: 'm1' } : {}), mode: 'rstep', noSeq: true, list: 'mono', cap: true, rs: 'a', posRow: true, lv: 'badge' }) },
    { id: 'tr', name: 'Трансферы · v12', draw: (el, sc) => TR2.render(el, { ...(sc.tr.match ? { match: sc.tr.match } : {}), opt: { style: 'hltv', v5: true, gameAva: true, skinV1: true, topAll: true, rows: 'tint' } }) },
    { id: 'mvp', name: 'MVP · v18', draw: (el, sc) => MVP15.render(el, { ...(sc.mvp.match ? { match: sc.mvp.match } : {}), opt: { style: 'side', glitch: true } }) },
  ]

  // ——— Стили текстовых слоёв ———
  // Роль по стилю: размер / вес / цвет → ближайший токен из предложенного набора (_type.css лабы widgets-unified)
  const TOK = [
    ['title', 'Заголовок · основной текст строки', 13, 600, 'fg'], ['link', 'Ссылка в шапке', 12, 500, 'mut'], ['label', 'Подпись раздела, шапка таблицы', 11, 500, 'mut'],
    ['head-sub', 'Подзаголовок шапки', 12, 400, 'mut'], ['alert', 'Алерт', 12, 500, 'any'], ['cell', 'Текст в таблице', 12, 400, 'fg'], ['sub', 'Вторичный', 11, 400, 'mut'],
    ['num', 'Число / дата', 14, 700, 'fg'], ['num-s', 'Число в таблице', 12, 600, 'fg'], ['live', 'LIVE', 11, 700, 'red'], ['tag', 'Метка / бейдж', 10, 600, 'any'],
    ['seg', 'Сегмент', 12, 500, 'any'], ['btn', 'Кнопка', 13, 600, 'any'], ['big', 'Крупная цифра (MVP)', 18, 700, 'fg']]
  const tone = c => { const m = c.match(/\d+/g).map(Number); return m[0] > 200 && m[1] < 120 ? 'red' : m[0] > 230 && m[1] > 230 && m[2] > 230 ? 'fg' : m[0] < 40 ? 'dark' : m[0] > 230 && m[1] > 180 ? 'gold' : 'mut' }
  const COL = ['#a78bfa', '#38bdf8', '#f472b6', '#34d399', '#fb923c', '#e879f9', '#a3e635', '#facc15', '#60a5fa', '#f87171', '#2dd4bf', '#c084fc', '#fdba74', '#94a3b8']
  const textEls = w => [...w.querySelectorAll('*')].filter(el => !el.closest('.kc') && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && el.getClientRects().length)
  const sig = el => { const c = getComputedStyle(el); return { size: parseFloat(c.fontSize), lh: c.lineHeight === 'normal' ? '—' : parseFloat(c.lineHeight), w: +c.fontWeight, tone: tone(c.color), ls: c.letterSpacing === 'normal' ? '' : c.letterSpacing } }
  const key = s => `${s.size}/${s.lh} · ${s.w} · ${s.tone}${s.ls ? ' · ' + s.ls : ''}`
  const match = s => TOK.find(([, , sz, w, t]) => sz === s.size && w === s.w && (t === 'any' || t === s.tone || (t === 'fg' && s.tone === 'dark')))
  const TONE = { fg: 'белый', mut: 'серый', red: 'красный', gold: 'золото', dark: 'тёмный (на плашке)' }
  const legend = (slot, on) => { const w = slot.querySelector('.w'), box = slot.querySelector('.r-st'); if (!w || !box) return
    w.querySelectorAll('[data-st]').forEach(el => { el.removeAttribute('data-st'); el.style.removeProperty('--stc') })
    if (!on) { box.innerHTML = ''; return }
    const groups = new Map()
    textEls(w).forEach(el => { const s = sig(el), k = key(s); if (!groups.has(k)) groups.set(k, { s, n: 0, ex: [] }); const g = groups.get(k); g.n++; if (g.ex.length < 3) g.ex.push(el.textContent.trim().slice(0, 18)) })
    const ks = [...groups.keys()].sort((a, b) => groups.get(b).s.size - groups.get(a).s.size || groups.get(b).s.w - groups.get(a).s.w)
    textEls(w).forEach(el => { el.dataset.st = 1; el.style.setProperty('--stc', COL[ks.indexOf(key(sig(el))) % COL.length]) })
    box.innerHTML = ks.map((k, i) => { const g = groups.get(k), m = match(g.s)
      return `<div class="r-st__r"><i style="background:${COL[i % COL.length]}"></i><b>${g.s.size}/${g.s.lh} · ${g.s.w}</b><span>${TONE[g.s.tone] || g.s.tone}${g.s.ls ? ' · ' + g.s.ls : ''}</span>
        <em class="${m ? '' : 'is-off'}">${m ? m[1] : 'вне набора'}</em><small>${g.n} × «${g.ex.join('», «')}»</small></div>` }).join('') }

  const st = { scr: 'home', styles: !!C.styles }
  const bar = document.getElementById('bar'), row = document.getElementById('row')
  const draw = () => {
    bar.innerHTML = `<b class="r-t">${C.title || 'Виджеты'}</b><span class="r-seg">${Object.entries(SCR).map(([k, v]) => `<button data-scr="${k}" class="${st.scr === k ? 'is-on' : ''}">${v.name}</button>`).join('')}</span>
      <label class="r-sw"><input type="checkbox" ${st.styles ? 'checked' : ''} data-sw /> Стили текстов</label>`
    bar.querySelectorAll('[data-scr]').forEach(b => b.onclick = () => { st.scr = b.dataset.scr; draw() })
    bar.querySelector('[data-sw]').onchange = e => { st.styles = e.target.checked; row.classList.toggle('is-st', st.styles); row.querySelectorAll('.r-w').forEach(s => legend(s, st.styles)) }
    row.classList.toggle('is-st', st.styles)
    row.innerHTML = W.map(w => `<div class="r-w" data-w="${w.id}"><div class="r-h">${w.name}</div><div class="r-box"></div>${C.notes && C.notes[w.id] ? `<div class="r-note">${C.notes[w.id]}</div>` : ''}<div class="r-st"></div></div>`).join('')
    row.querySelectorAll('.r-w').forEach(slot => { const w = W.find(x => x.id === slot.dataset.w), box = document.createElement('div'); slot.querySelector('.r-box').append(box); w.draw(box, SCR[st.scr])
      // виджет перерисовывается сам (клики внутри) — стили пересчитываем после каждого клика
      box.addEventListener('click', () => setTimeout(() => legend(slot, st.styles), 50))
      setTimeout(() => legend(slot, st.styles), 300) })
  }
  draw()
})()
