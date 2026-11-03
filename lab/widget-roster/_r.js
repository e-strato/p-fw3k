// Виджет замен (созвон 20.10, требования Т2.* в «20.10/цитаты.md»). Пример: 1w Team — Aurora, замены по мотивам PGL Wallachia S9.
// RW.render(узел, { v, sc, open, card, tab, live }) — v: 1 две колонки · 2 лента замен · 3 вкладки команд;
// sc: calm | one | heavy | both | out; open — id замены с открытой карточкой; card — найден | мало | нет | ошибка (иначе из данных).
(() => {
  const TEAMS = { '1W': ['1w Team', '#8'], AUR: ['Aurora', '#4'] }
  const ROSTER = { '1W': ['Pure', 'bzm', '33', 'Ari', 'Whitemon'], AUR: ['Nightfall', 'Mikoto', 'Ws', 'Mira', 'kaori'] }
  const ST = { tour: 'на турнир', perm: 'навсегда', match: 'на этот матч' }
  // замена: [id, команда, позиция 0–4, новый (null — не вышел), статус, состояние карточки]
  const SUBS = {
    shad: ['shad', '1W', 0, 'Shad', 'tour', 'найден'],
    xen: ['xen', '1W', 1, 'Xen', 'match', 'нет'],
    skiter: ['skiter', 'AUR', 0, 'skiter', 'perm', 'найден'],
    stojkov: ['stojkov', 'AUR', 1, 'Stojkov', 'match', 'ошибка'],
    lumi: ['lumi', 'AUR', 3, 'Lumi', 'match', 'мало'],
    miko: ['miko', 'AUR', 1, null, 'match', 'нет'],
  }
  const SC = { calm: [], one: ['shad'], heavy: ['skiter', 'stojkov', 'lumi'], both: ['shad', 'xen', 'skiter', 'stojkov', 'lumi'], out: ['miko'] }
  const CARD = {
    shad: { role: 'Керри · поз. 1', from: 'свободный агент', rating: '#112', form: 'WLWWL', src: 'Источник: 1win Dota2 в X, 17.09 — «Shad is our stand-in»' },
    skiter: { role: 'Керри · поз. 1', from: 'из Team Liquid', rating: '#9', form: 'WWLWW', src: 'Источник: Aurora в X — переход объявлен' },
    stojkov: { role: 'Мид · поз. 2', from: 'свободный агент', rating: '#140', form: 'LWWLW', src: 'Источник: Aurora в X — объявили замену на матч' },
    lumi: { from: 'Aurora Academy' }, xen: {}, miko: {},
  }
  const icon = { back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg class="w-chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    swap: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="flex:none"><path d="M3 5h10m0 0-3-3m3 3-3 3M13 11H3m0 0 3-3m-3 3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
  const logo = k => `<span class="w-logo">${k}</span>`
  const subsOf = (sc, team) => SC[sc].map(id => SUBS[id]).filter(s => !team || s[1] === team)
  const total = sc => SC[sc].length
  const heavy = (sc, team) => subsOf(sc, team).length >= 3

  // Строка игрока в составе
  const pRow = (team, i, sc, compact) => {
    const s = subsOf(sc, team).find(x => x[2] === i), old = ROSTER[team][i]
    if (!s) return `<div class="r-p"><span class="r-p__n">${old}</span><span class="r-p__pos">${i + 1}</span></div>`
    const name = s[3] || 'нет замены'
    return `<button class="r-p r-p--ch" data-open="${s[0]}"><span class="r-p__main"><span class="r-p__n ${s[3] ? '' : 'is-none'}">${name}</span>
      <span class="r-p__was">${s[3] ? `вместо ${old}` : `${old} не вышел`}${compact ? '' : ` · ${ST[s[4]]}`}</span></span><span class="r-p__pos">${i + 1}</span></button>`
  }
  const teamHead = (team, sc) => `<div class="r-th">${logo(team)}<span class="r-th__n">${TEAMS[team][0]}</span>${heavy(sc, team) ? '<span class="r-th__heavy">Состав сильно изменён</span>' : ''}</div>`

  // Мини-карточка игрока
  const card = (id, forced) => {
    const s = SUBS[id], c = CARD[id], state = forced || s[5], old = ROSTER[s[1]][s[2]], name = s[3] || old
    const head = `<div class="r-c__top"><span class="w-logo r-c__ph">${name.slice(0, 2)}</span><span><div class="r-c__n">${name}</div>
      <div class="w-cap">${s[3] ? `${TEAMS[s[1]][0]} · вместо ${old}` : `${TEAMS[s[1]][0]} · не вышел на матч`}</div></span></div>
      <div class="r-c__st">${icon.swap}${s[3] ? `Замена ${ST[s[4]]}` : 'Замена пока неизвестна'}</div>`
    if (state === 'ошибка') return head + `<div class="r-c__msg"><b>Не удалось загрузить</b><div class="w-cap">База по Dota 2 не ответила. Данные по другим играм пришли.</div>
      <button class="r-btn" data-retry="${id}">Повторить</button></div>`
    if (state === 'нет') return head + `<div class="r-c__msg"><b>Новый игрок, данных пока нет</b><div class="w-cap">В базе не найден. Появится после первых матчей.</div>
      <button class="r-btn r-btn--ghost">Спросить ИИ об игроке</button></div>`
    if (state === 'мало') return head + `<dl class="r-c__dl"><dt>Команда</dt><dd>${c.from || TEAMS[s[1]][0]}</dd><dt>Роль</dt><dd class="is-na">—</dd><dt>Рейтинг</dt><dd class="is-na">—</dd><dt>Форма</dt><dd class="is-na">—</dd></dl>
      <div class="w-cap" style="margin-top:8px">Найден, но статистики мало: меньше 5 матчей.</div>`
    const cc = c
    return head + `<dl class="r-c__dl"><dt>Роль</dt><dd>${cc.role}</dd><dt>Откуда</dt><dd>${cc.from}</dd><dt>Рейтинг</dt><dd>${cc.rating}</dd>
      <dt>Форма</dt><dd><span class="w-form">${[...cc.form].map(x => `<i class="${x}"></i>`).join('')}</span></dd></dl><div class="w-cap" style="margin-top:8px">${cc.src}</div>`
  }

  const hd = (t, back, sub) => `<div class="w-hd">${back ? `<button class="w-hd__back" data-close aria-label="Назад">${icon.back}</button>` : ''}
    <span class="w-hd__t">${t}</span><span class="w-game">${sub || 'Dota 2'}</span></div>`
  const note = sc => total(sc) ? `<div class="r-note">${icon.swap}<span>${sc === 'out' ? 'Игрок не вышел на матч' : `Состав изменился · ${total(sc)} ${total(sc) === 1 ? 'замена' : total(sc) < 5 ? 'замены' : 'замен'}`}</span><span class="w-cap" style="margin-left:auto">2 мин назад</span></div>` : ''

  function html(o) {
    const { v, sc, open } = o
    const n = total(sc), sub = n ? `${n} изм.` : 'без замен'
    if (v === 1) {
      if (open) return hd('Игрок', true, sub) + `<div class="w-bd">${card(open, o.card)}</div>`
      const col = t => `<div class="r-col">${teamHead(t, sc)}${ROSTER[t].map((_, i) => pRow(t, i, sc, true)).join('')}</div>`
      return hd('Составы на матч', false, sub) + note(sc) + `<div class="r-cols">${col('1W')}${col('AUR')}</div>`
        + (n ? '' : `<div class="w-ft"><span>Составы подтверждены</span><span>за 40 мин до матча</span></div>`)
    }
    if (v === 2) {
      const list = SC[sc].map(id => SUBS[id]).map(s => {
        const row = `<button class="r-ch" data-open="${s[0]}">${logo(s[1])}<span class="w-row__main"><div class="w-row__t">${ROSTER[s[1]][s[2]]} → ${s[3] || '?'}</div>
          <div class="w-cap">${TEAMS[s[1]][0]} · ${s[3] ? ST[s[4]] : 'не вышел, замена неизвестна'}</div></span>${icon.chev.replace('w-chev"', `w-chev" style="${open === s[0] ? 'transform:rotate(90deg)' : ''}"`)}</button>`
        return row + (open === s[0] ? `<div class="r-ch__card">${card(s[0], o.card)}</div>` : '')
      }).join('')
      const full = `<div class="r-cols">${['1W', 'AUR'].map(t => `<div class="r-col">${teamHead(t, sc)}${ROSTER[t].map((_, i) => pRow(t, i, sc, true)).join('')}</div>`).join('')}</div>`
      if (!n || o.full) return hd('Составы на матч', false, sub) + (n ? note(sc) : '') + full + `<div class="w-ft"><span>${n ? '' : 'Замен нет'}</span>${n ? '<button class="w-link" data-full="0">К заменам</button>' : ''}</div>`
      return hd('Замены в составах', false, sub) + note(sc) + `<div class="w-bd" style="padding-top:4px">${list}</div><div class="w-ft"><span></span><button class="w-link" data-full="1">Составы целиком</button></div>`
    }
    // v3 — вкладки команд, карточка — шторкой поверх
    const tab = o.tab || (subsOf(sc, 'AUR').length > subsOf(sc, '1W').length ? 'AUR' : '1W')
    const seg = `<div class="w-seg">${['1W', 'AUR'].map(t => { const k = subsOf(sc, t).length
      return `<button class="${tab === t ? 'is-on' : ''}" data-tab="${t}">${TEAMS[t][0]}${k ? ` · ${k}` : ''}</button>` }).join('')}</div>`
    const body = `${heavy(sc, tab) ? '<div class="r-th__heavy" style="margin-bottom:8px">Состав сильно изменён</div>' : ''}${ROSTER[tab].map((_, i) => pRow(tab, i, sc)).join('')}`
    const sheet = open ? `<div class="r-sheet"><div class="r-sheet__bar"><span class="w-cap">Игрок</span><button class="w-link" data-close>Закрыть</button></div>${card(open, o.card)}</div>` : ''
    return hd('Составы на матч', false, sub) + note(sc) + seg + `<div class="w-bd r-rel">${body}${sheet}</div>`
  }

  function render(el, o) {
    el.className = 'w'
    el.innerHTML = html(o)
    if (!o.live) return
    const re = () => { render(el, o); o.onchange && o.onchange(o) }
    el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { o.open = o.open === b.dataset.open && o.v === 2 ? null : b.dataset.open; o.card = null; re() })
    el.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { o.open = null; re() })
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { o.tab = b.dataset.tab; o.open = null; re() })
    el.querySelectorAll('[data-full]').forEach(b => b.onclick = () => { o.full = b.dataset.full === '1'; o.open = null; re() })
    el.querySelectorAll('[data-retry]').forEach(b => b.onclick = () => { o.card = 'найден'; re() })
  }
  window.RW = { render, SC }
})()
