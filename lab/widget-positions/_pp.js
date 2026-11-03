// Виджет «Игроки по позициям» (созвон 02.11 §2.4) — отдельный от «Участников»: PP.render(el, { phone, pos, ic }).
// Строка: место · флаг · ник и лого команды после него (имя команды — при наведении) · 3 главных героя (герой, винрейт, матчи) · рейтинг.
// Позиции — 1–5 значками, как в Доте (мини-карта, подсвечена линия). Данные — ../widget-participants/_data.js (Liquipedia, PARI Universe).
// ‼️ Пример: рейтинги (тот же расчёт, что в «Участниках»), герои, винрейты, матчи.
window.PP = (() => {
  const WB = window.DB ? '' : '../widget-participants/', HB = '../gs-match/img/heroes/' // DB: пути уже от страницы (_db/compat.js)
  const h = (s) => { let x = 7; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x }
  // рейтинг — как в «Участниках» v56: 4 цифры, второй мелко
  // v8 (на странице есть window.DB — общая база _db, TI на 21.08): рейтинг — по очкам игрока за карту на TI (как в «Участниках»), 3 героя — самые частые на TI с настоящим винрейтом и числом карт
  const DBM = !!window.DB, DBD = DBM ? window.DB.data : null
  const PSx = DBM ? Object.fromEntries(window.DB.playerStats(window.DB_TOUR || 'ti-2026').map((x) => [DBD.players[x.player].nick, x])) : {}
  const ppm = (x, w) => (w ? x.week / Math.max(1, x.weekMaps) : x.pts / Math.max(1, x.maps)), PV = Object.values(PSx), lo = Math.min(...PV.map((x) => ppm(x))), hi = Math.max(...PV.map((x) => ppm(x)))
  const sc = (v) => Math.round(60 + ((v - lo) / Math.max(1, hi - lo)) * 34)
  const rate = (n) => { if (DBM) { const x = PSx[n], b = x ? sc(ppm(x)) : 60, d = x ? sc(ppm(x, true)) : 60; return { b: 1200 + b * 7, d: 1200 + d * 7 } } const b = 60 + h(n) % 35, d = b - 6 + h(n + '·') % 13; return { b: 1200 + b * 7 + h(n) % 7, d: 1200 + d * 7 + h(n + 'd') % 7 } }
  const HEROES = ['abyssal_underlord', 'alchemist', 'axe', 'bane', 'centaur', 'clinkz', 'crystal_maiden', 'dark_seer', 'dark_willow', 'dawnbreaker', 'dazzle', 'doom_bringer', 'earth_spirit', 'earthshaker', 'ember_spirit', 'enchantress', 'enigma', 'faceless_void', 'furion', 'grimstroke', 'hoodwink', 'invoker', 'kez', 'largo', 'life_stealer', 'lina', 'lion', 'lycan', 'mirana', 'monkey_king', 'nevermore', 'night_stalker', 'pangolier', 'phantom_lancer', 'primal_beast', 'puck', 'rattletrap', 'razor', 'ringmaster', 'rubick', 'sand_king', 'shadow_demon', 'shredder', 'slardar', 'snapfire', 'spirit_breaker', 'storm_spirit', 'templar_assassin', 'terrorblade', 'tidehunter', 'treant', 'tusk', 'undying', 'void_spirit', 'windrunner', 'winter_wyvern', 'wisp']
  const nm = (x) => x.replace(/_/g, ' ')
  // ‼️ пример: 3 главных героя игрока — [герой, винрейт %, матчей]
  const heroes = (n) => { if (DBM) return (PSx[n]?.heroes || []).slice(0, 3).map((x) => [x.hero, Math.round((x.wins / x.maps) * 100), x.maps]); const used = new Set(); return [0, 1, 2].map((i) => { let k = h(n + 'h' + i) % HEROES.length; while (used.has(k)) k = (k + 1) % HEROES.length; used.add(k)
    return [HEROES[k], 38 + h(n + 'w' + i) % 41, 12 - i * 3 - h(n + 'm' + i) % 3] }) }
  const ROLE = { 1: 'Керри', 2: 'Мид', 3: 'Оффлейн', 4: 'Саппорт 4', 5: 'Саппорт 5' }
  // значки позиций — мини-карта, как в Доте: квадрат, диагональ реки, подсвечена линия игрока; у саппортов — линия пунктиром и точка
  const MAP = '<rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-opacity=".35"/>'
  const LANE = {
    1: '<path d="M4 12h8V4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    2: '<path d="M4.5 11.5l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    3: '<path d="M4 12V4h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    4: '<path d="M4 12V4h8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1.5 2"/><circle cx="8" cy="8" r="1.8" fill="currentColor"/>',
    5: '<path d="M4 12h8V4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1.5 2"/><circle cx="8" cy="8" r="1.8" fill="currentColor"/>' }
  // v6 (o.ic 'cs'): значки позиций как на Cyberscore — цветной квадрат со скруглением и белым знаком: 1 меч · 2 лук · 3 щит с молнией · 4 рука с искрой · 5 рука с плюсом (перерисовано по скрину матча Cyberscore 06.10)
  const CS = {
    1: ['#6366f1', '<path d="M11.5 3.5 7 8l1 1 4.5-4.5V3.5zM5.2 8.6l2.2 2.2-.8.8-.7-.7-1.3 1.3-.8-.8 1.3-1.3-.7-.7z" fill="#fff"/>'],
    2: ['#14b8a6', '<path d="M4.2 11.8C3 9 3.6 5.6 6 4.2" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/><path d="M4.4 11.6 11.6 4.4M9.4 4.2h2.4v2.4" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'],
    3: ['#f59e0b', '<path d="M8 3.2 12 4.6v3c0 2.4-1.7 4.3-4 5.1-2.3-.8-4-2.7-4-5.1v-3z" fill="#fff"/><path d="M8.6 5 6.6 8.2h1.6L7.4 11l2.1-3.3H7.9z" fill="#f59e0b"/>'],
    4: ['#ea7a28', '<path d="M5 12.5V8.2c0-.5.8-.5.8 0V9h.1V6.1c0-.5.9-.5.9 0V9h.1V5.6c0-.5.9-.5.9 0V9h.1V6.2c0-.5.9-.5.9 0v4c0 1.3-1 2.3-2.3 2.3z" fill="#fff"/><path d="M10.6 3.2c.5.8 1.1 1.2 1.1 2a1 1 0 0 1-2 0c0-.6.5-1 .9-2z" fill="#fff"/>'],
    5: ['#22a36a', '<path d="M4.6 12.5V8.2c0-.5.8-.5.8 0V9h.1V6.1c0-.5.9-.5.9 0V9h.1V5.6c0-.5.9-.5.9 0V9h.1V6.2c0-.5.9-.5.9 0v4c0 1.3-1 2.3-2.3 2.3z" fill="#fff"/><path d="M11 3v3.2M9.4 4.6h3.2" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>'] }
  // v7 (o.ic 'csk'): знак чёрный на цветном квадрате · v8 ('csd'): квадрат чёрный, знак цветом позиции
  const glyph = (p, c) => CS[p][1].replace(/#fff/g, c).replace(/#f59e0b"\/>/, (p === 3 && c !== '#fff' ? (c === '#000' ? CS[3][0] : '#0b0b0d') : '#f59e0b') + '"/>')
  const PICS = (p) => { const c = CS[p][0], bg = O.ic === 'csd' ? '#0b0b0d' : c, fg = O.ic === 'csk' ? '#000' : O.ic === 'csd' ? c : '#fff'
    return `<svg class="pp-pi pp-pi--cs" viewBox="0 0 16 16" aria-hidden="true"><rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="${bg}"${O.ic === 'csd' ? ` stroke="${c}" stroke-opacity=".45"` : ''}/>${glyph(p, fg)}</svg>` }
  const PIC = (p) => O.ic && O.ic.startsWith('cs') ? PICS(p) : `<svg class="pp-pi" viewBox="0 0 16 16" aria-hidden="true">${MAP}${LANE[p]}</svg>`

  const TEAMS = window.PU_TEAMS.map((t) => ({ name: t.name, logo: WB + t.logo, p: t.tabs[0].m.filter((x) => x.role !== 'Coach') }))
  const S = { pos: 1 }
  function rows() {
    return TEAMS.map((t) => { const x = t.p.find((m) => +m.role === S.pos) || t.p[S.pos - 1]; return { t, x, r: rate(x.nick) } }).sort((a, b) => b.r.b - a.r.b)
  }
  // v2 (o.hv 'under'): герой — иконка, под ней «62% · 14» раздельно, шире промежутки · v3 ('badge'): винрейт полоской под иконкой, матчи — числом в углу иконки
  const heroU = ([hh, wr, n]) => `<span class="pp-hu"><img src="${HB}${hh}.png" alt=""><span><b class="${wr >= 55 ? 'up' : wr < 45 ? 'dn' : ''}">${wr}%</b><i>${n}</i></span></span>`
  const heroB = ([hh, wr, n]) => `<span class="pp-hb"><span class="im"><img src="${HB}${hh}.png" alt=""><i>${n}</i></span><u class="${wr >= 55 ? 'up' : wr < 45 ? 'dn' : ''}"><b style="width:${wr}%"></b></u><em>${wr}%</em></span>`
  // v4 (o.hv 'wide'): место используем — у ника под ним имя команды; герой — иконка, имя, винрейт полоской и числом, матчи
  const heroW = ([hh, wr, n]) => `<span class="pp-hw"><img src="${HB}${hh}.png" alt=""><span class="t"><span class="nm">${nm(hh)}</span><span class="st"><u class="${wr >= 55 ? 'up' : wr < 45 ? 'dn' : ''}"><b style="width:${wr}%"></b></u><b class="${wr >= 55 ? 'up' : wr < 45 ? 'dn' : ''}">${wr}%</b><i>${n}<span> ${n % 10 === 1 && n % 100 !== 11 ? 'матч' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'матча' : 'матчей'}</span></i></span></span></span>`
  const hero = ([hh, wr, n]) => `<span class="pp-h" title="${nm(hh)} · винрейт ${wr}% · ${n} матчей"><img src="${HB}${hh}.png" alt=""><b class="${wr >= 55 ? 'up' : wr < 45 ? 'dn' : ''}">${wr}%</b><i>${n}</i></span>`
  let O = {}
  function render(el, o = {}) { O = o
    if (o.pos) S.pos = o.pos
    el.classList.toggle('is-phone', !!o.phone)
    el.innerHTML = `<div class="w pp${o.hv ? ' pp--' + o.hv : ''}${o.dim ? ' pp--dim' : ''}"><div class="w-hd"><span class="w-hd__t">Игроки по позициям</span></div>
      <div class="pp-seg" role="tablist">${[1, 2, 3, 4, 5].map((p) => `<button role="tab" data-pos="${p}" class="${S.pos === p ? 'is-on' : ''}" title="${ROLE[p]}">${PIC(p)}<span>${p}</span></button>`).join('')}</div>
      <div class="pp-hd"><span class="k">#</span><span class="n">Игрок</span><span class="hs">${o.hv === 'under' ? 'Герои · винрейт · матчей' : o.hv === 'badge' ? 'Герои · матчей · винрейт' : o.hv === 'wide' ? 'Главные герои на турнире' : 'Герои · винрейт · матчи'}</span><span class="r">Рейтинг</span></div>
      <div class="pp-list">${rows().map((a, k) => `<div class="pp-r"><span class="k">${k + 1}</span><img class="f" src="${a.x.fsrc ? WB + a.x.fsrc : 'data:image/gif;base64,R0lGODlhAQABAAAAACw='}" alt=""><span class="n">${o.hv === 'wide' ? `<span class="nw"><span class="nk">${a.x.nick}</span><small><img src="${a.t.logo}" alt="">${a.t.name}</small></span>` : `<span class="nk">${a.x.nick}</span>`}${o.hv === 'wide' ? '' : `<span class="tl" data-tip="${a.t.name}"><img src="${a.t.logo}" alt=""></span>`}</span>
        <span class="hs">${heroes(a.x.nick).map(o.hv === 'wide' ? heroW : o.hv === 'under' ? heroU : o.hv === 'badge' ? heroB : hero).join('')}</span><span class="r"><b>${a.r.b}</b><i>${a.r.d}</i></span></div>`).join('')}</div></div>`
    el.querySelectorAll('.pp-r .tl').forEach((im) => im.addEventListener('click', (e) => { e.stopPropagation(); const on = !im.classList.contains('is-tip'); el.querySelectorAll('.is-tip').forEach((x) => x.classList.remove('is-tip')); im.classList.toggle('is-tip', on) }))
    el.querySelector('.pp-seg').onclick = (e) => { const b = e.target.closest('[data-pos]'); if (b) { S.pos = +b.dataset.pos; render(el, o) } }
  }
  document.addEventListener('click', () => document.querySelectorAll('.pp .tl.is-tip').forEach((x) => x.classList.remove('is-tip'))) // PP_TIPOFF
  return { render }
})()
