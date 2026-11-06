// Лаба w-sidebar — «Разбор» не виджетом в колонке, а сайдбаром (созвон 04.11 §4a, задача 8; Claude-B).
// Начальник 04.11: сайдбар выезжает и ЗАМЕНЯЕТ колонку виджетов; закрыть или «назад» — колонка возвращается (4a.1, 4a.2);
// одна сущность за раз — та, на которую кликнул, без полосы со всеми кружками и без «Прогнозов» (4a.3, 4a.12);
// вход — клик по команде или игроку в нижней строке (4a.4, 4a.5); внутри: команда → игрок из состава, команда → её герои → герой (4a.5, 4a.6);
// игрок — с фокусом на его герое в этом матче (4a.8); цифры «к этой минуте» и сравнение с обычным, без общей статистики (4a.7, 4a.10);
// одна из трёх карточек: команда / игрок / герой, наполнение — потом (4a.11); внутри — ссылка на полную страницу (4a.9, толкование).
// Хук нижней строки (её ведёт Claude-A): клик по .d3-tm (команда) и .d3-h (игрок, data-hc «карта|steam») — здесь перехвачен в фазе захвата.
// window.SD: replace — сайдбар на месте колонки, «назад» и крестик · over — шторка поверх колонки, колонка видна под ней, затемнена ·
//            crumbs — как replace, но в шапке путь «команда › игрок › герой», любой шаг — нажать.
// ‼️ «Обычно к этой минуте» — оценка: среднее игрока / команды на TI 2026 за карту × (минута / средняя длина карты 38 мин). Данные — общая база (_db).
(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  const MODE = window.SD || 'replace', TOUR = 'ti-2026', AVG = 38
  // v5 (дирижёр 04.11: «должна поверх открываться, не заменять правую колонку»): window.SD_OVER — вид apple, но панель ложится поверх колонки,
  // виджеты остаются под ней (не прячутся); выезжает справа, крестик — уезжает вправо и открывает колонку
  const OVER = !!window.SD_OVER
  // v6 (дирижёр 04.11: «не остров, а полуостров»): window.SD_PEN — панель прибита к правому краю окна, сверху — от верха колонки, снизу — до низа окна,
  // чуть шире колонки (наезжает на главную), тень слева; выезжает справа. Кнопка не «закрыть», а «свернуть вправо» — в пилюлю у края, как свёрнутое видео
  // на айфоне; нажал пилюлю — панель выезжает обратно с тем же местом. Esc — тоже свернуть
  const PEN = !!window.SD_PEN
  const st = { stack: [], side: null, sec: null, dir: 'in', mini: false, tab: 'now' } // dir — куда листаем: in (вглубь) · out (назад), для перехода как в Apple Картах
  const url = (p) => (p ? DB.url(p) : null)
  const min = (sec) => { const t = sec?.querySelector('.h3-tab.is-on, .h3-tab[aria-selected="true"]')?.textContent.match(/(\d+):(\d+)/); return t ? +t[1] + +t[2] / 60 : 33.5 }
  const fmt = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString('ru-RU')
  const heroName = (k) => DB.hero(k)?.name || k
  const heroImg = (k) => `img/heroes/${k}.png`
  const ps = (id) => DB.playerStats(TOUR).find((x) => x.player === id)
  // что сейчас в нижней строке: игрок → герой и K/D/A этого матча
  const rowOf = (sec, steam) => { const h = sec?.querySelector(`.d3-h[data-hc$="|${steam}"]`); if (!h) return null
    const k = [...h.querySelectorAll('.d3-k i')].map((i) => i.textContent), hero = h.querySelector('.d3-i img')?.getAttribute('src').match(/([\w]+)\.png$/)?.[1]
    return { hero, k: +k[0] || 0, d: +k[1] || 0, a: k[2] === '—' ? null : +k[2] } }
  const cmp = (now, usual, lowGood) => { const diff = now - usual, bad = lowGood ? diff > 0.6 : diff < -0.6, good = lowGood ? diff < -0.6 : diff > 0.6
    return `<span class="sd-cmp ${bad ? 'bad' : good ? 'good' : ''}">${bad || good ? (diff > 0 ? 'больше' : 'меньше') + ' обычного' : 'как обычно'}</span>` }

  // ── карточки (4a.11): команда / игрок / герой
  function teamCard(id) {
    const t = DB.team(id), s = DB.teamStats(TOUR, id) || {}, all = DB.players({ team: id }).filter((p) => typeof p.role === 'number').sort((a, b) => a.role - b.role), inMatch = all.filter((p) => rowOf(st.sec, p.steam)), roster = inMatch.length >= 5 ? inMatch : all.slice(0, 5) // состав — кто играет этот матч
    const heroes = {}; roster.forEach((p) => (ps(p.id)?.heroes || []).forEach((h) => { heroes[h.hero] = heroes[h.hero] || [0, 0]; heroes[h.hero][0] += h.maps; heroes[h.hero][1] += h.wins }))
    const top = Object.entries(heroes).sort((a, b) => b[1][0] - a[1][0]).slice(0, 6)
    const m = min(st.sec), kills = roster.reduce((sum, p) => sum + (ps(p.id)?.k || 0), 0) / Math.max(1, ps(roster[0]?.id)?.maps || 1)
    const nowK = roster.reduce((sum, p) => sum + (rowOf(st.sec, p.steam)?.k || 0), 0)
    return { title: t.name, kind: 'Команда', html: `
      <div class="sd-id"><img class="sd-tl" src="${url(t.logo)}" alt=""><div><b>${esc(t.name)}</b><small>TI 2026 · серии ${s.series?.join('–') || '—'} · карты ${s.maps?.join('–') || '—'}</small></div></div>
      <div class="sd-form">${(s.form || []).map((f) => `<i class="${f.win ? 'w' : 'l'}" title="${esc(DB.name(f.vs))} ${f.score.join(':')}">${f.win ? 'В' : 'П'}</i>`).join('')}<small>форма · 5 серий</small></div>
      <div class="sd-now"><h4>К ${Math.floor(m)}-й минуте</h4>
        <div class="sd-kv"><span>Убийства</span><b class="num">${nowK}</b><small>обычно ${fmt((kills * m) / AVG)} к этой минуте</small>${cmp(nowK, (kills * m) / AVG)}</div></div>
      <h4>Состав</h4><div class="sd-list">${roster.map((p) => { const r = rowOf(st.sec, p.steam)
        return `<button class="sd-li" data-sd="player:${p.id}"><img class="sd-av" src="${url(p.photo || p.avatar)}" alt=""><span><b>${esc(p.nick)}</b><small>позиция ${p.role}${r?.hero ? ' · ' + esc(heroName(r.hero)) : ''}</small></span>${r ? `<em class="num">${r.k}/${r.d}</em>` : ''}<i class="sd-go">›</i></button>` }).join('')}</div>
      <h4>Герои команды на турнире</h4><div class="sd-grid">${top.map(([h, [n, w]]) => `<button class="sd-hc" data-sd="hero:${h}"><img src="${heroImg(h)}" alt=""><b>${esc(heroName(h))}</b><small class="num">${n} карт · ${Math.round((w / n) * 100)}%</small></button>`).join('')}</div>` }
  }
  function playerCard(id) {
    const p = DB.player(id), t = DB.team(p.team), s = ps(id) || {}, r = rowOf(st.sec, p.steam), m = min(st.sec), maps = Math.max(1, s.maps || 1)
    const u = { k: (s.k / maps) * (m / AVG), d: (s.d / maps) * (m / AVG) }, h = r?.hero
    return { title: p.nick, kind: 'Игрок', html: `
      <div class="sd-id"><img class="sd-ph" src="${url(p.photo || p.avatar)}" alt=""><div><b>${esc(p.nick)}</b><small><img src="${url(t?.logo)}" alt="">${esc(t?.name)} · позиция ${p.role ?? '—'}</small></div></div>
      ${h ? `<button class="sd-focus" data-sd="hero:${h}"><img src="${heroImg(h)}" alt=""><span><small>В этом матче</small><b>${esc(heroName(h))}</b></span><em class="num">${r.k} / ${r.d}${r.a != null ? ' / ' + r.a : ''}</em><i class="sd-go">›</i></button>` : ''}
      <div class="sd-now"><h4>К ${Math.floor(m)}-й минуте</h4>
        <div class="sd-kv"><span>Убийства</span><b class="num">${r?.k ?? '—'}</b><small>обычно ${fmt(u.k)}</small>${r ? cmp(r.k, u.k) : ''}</div>
        <div class="sd-kv"><span>Смерти</span><b class="num">${r?.d ?? '—'}</b><small>обычно ${fmt(u.d)}</small>${r ? cmp(r.d, u.d, true) : ''}</div>
</div>
      <h4>Его герои на турнире</h4><div class="sd-list">${(s.heroes || []).slice(0, 5).map((x) => `<button class="sd-li" data-sd="hero:${x.hero}"><img class="sd-hi" src="${heroImg(x.hero)}" alt=""><span><b>${esc(heroName(x.hero))}</b><small class="num">${x.maps} карт · ${x.wins}–${x.maps - x.wins}</small></span><i class="sd-go">›</i></button>`).join('')}</div>` }
  }
  function heroCard(k) {
    const H = DB.heroStats(TOUR), x = H?.list.find((y) => y.hero === k), who = DB.playerStats(TOUR).filter((p) => p.heroes.some((h) => h.hero === k)).map((p) => [p, p.heroes.find((h) => h.hero === k)]).sort((a, b) => b[1].maps - a[1].maps).slice(0, 5)
    return { title: heroName(k), kind: 'Герой', html: `
      <div class="sd-hero"><img src="${heroImg(k)}" alt=""><b>${esc(heroName(k))}</b></div>
      <div class="sd-stats"><div><b class="num">${x?.picks ?? 0}</b><small>пиков</small></div><div><b class="num">${x?.picks ? Math.round((x.pickWins / x.picks) * 100) : 0}%</b><small>побед</small></div><div><b class="num">${x?.bans ?? 0}</b><small>банов</small></div><div><b class="num">${x?.pickBan ?? 0}%</b><small>пик или бан</small></div></div>
      <h4>Кто играет на турнире</h4><div class="sd-list">${who.map(([p, h]) => { const pl = DB.player(p.player)
        return `<button class="sd-li" data-sd="player:${p.player}"><img class="sd-av" src="${url(pl?.photo || pl?.avatar)}" alt=""><span><b>${esc(pl?.nick || p.player)}</b><small>${esc(DB.name(p.team))}</small></span><em class="num">${h.wins}–${h.maps - h.wins}</em><i class="sd-go">›</i></button>` }).join('')}</div>` }
  }
  // ── v12–v14 (дирижёр 04.11: «нравилось, как в прошлом виджете — взять оттуда описательную логику»): SD_RICH — блоки прошлого «Разбора» (w-drill):
  // «Сейчас» (на этой минуте карты: У / С / П, состояние, GPM, добито, предметы), «Динамика» (по минутам), «Турнир», «Справка» (Liquipedia), у героя — мета и «сильнее / слабее против».
  // Начальник 04.11 (1·14:44–16:39): общая статистика — в «Статистике», здесь — то, что связано с моментом матча. Данные: живая карта (OpenDota), w-drill/_sb-data.js, общая база.
  // SD_LAY: now — «Сейчас» сверху · ref — «Справка» и «Турнир» сверху · tabs — вкладки «Сейчас · Турнир · Справка»
  const RICH = !!window.SD_RICH, LAY = window.SD_LAY || 'now', SBD = window.SB_DATA || {}, GD = () => window.GS_DATA || {}
  // страница без лабы прогнозов (продукт, gs-match-2 v55): матч берём из того же места колонки — оборачиваем GS_VOTE, он получает матч от _gs.js
  { const gv = window.GS_VOTE; if (gv) window.GS_VOTE = (el, M) => { el._sdM = M; el.dataset.sdm = '1'; return gv(el, M) } }
  const live = () => { const M = st.sec?.querySelector('.pc-host')?._pcM || st.sec?.querySelector('[data-sdm]')?._sdM; if (!M) return null; const L = M.maps.filter((x) => x.m), sv = window.SD_GOLD1 === 2 ? +(document.querySelector('.h3-tab.on')?.dataset.v ?? NaN) : NaN, x = (window.SD_GOLD1 === 2 && L.find((y) => y.i === sv)) || L.find((y) => y.st === 'live') || L.at(-1); /* w-gold-pl v2: выбран таб сыгранной карты — её итог */ return x && { m: x.m, t: x.st === 'live' ? x.t : x.m.duration, live: x.st === 'live', n: x.i + 1 } }
  const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
  const kk = (v) => (Math.abs(v) >= 1000 ? fmt(v / 1000, 1) + 'k' : String(Math.round(v)))
  const hShort = (od) => GD().heroes?.[od]?.short
  const at = (m, p, t) => { const full = t >= m.duration, key = 'npc_dota_hero_' + hShort(p.hero_id)
    const K = p.kills_log.filter((l) => l.time <= t).length, D = full ? p.deaths : m.players.filter((q) => q.isRadiant !== p.isRadiant).reduce((n, q) => n + q.kills_log.filter((l) => l.time <= t && l.key === key).length, 0)
    const nw = full ? p.net_worth : p.nw_t[Math.min(Math.floor(t / 60), p.nw_t.length - 1)] || 0, k = Math.min(1, t / m.duration)
    const items = p.items.filter((it) => it && GD().items?.[it] && (full || p.purchase_log.some((l) => l.key === it && l.time <= t)))
    return { K, D, A: full ? p.assists : null, nw, lh: Math.round(p.last_hits * k), dn: Math.round(p.denies * k), items } }
  const spark = (ser, c = '') => { if (ser.length < 2) return ''; const mx = Math.max(...ser), mn = Math.min(0, ...ser), w = 260, h = 44, X = (i) => (i / (ser.length - 1)) * w, Y = (v) => h - ((v - mn) / (mx - mn || 1)) * h
    return `<svg class="sd-sp ${c}" viewBox="0 0 ${w} ${h + 2}" preserveAspectRatio="none"><polyline points="${ser.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}"/>${mn < 0 ? `<line x1="0" x2="${w}" y1="${Y(0)}" y2="${Y(0)}"/>` : ''}</svg>` }
  const blk = (t, src, body) => `<section class="sd-b"><div class="sd-bh"><b>${t}</b>${src ? `<small>${src}</small>` : ''}</div>${body}</section>`
  const tbl = (rows) => `<div class="sd-tb">${rows.filter(Boolean).map(([k, v]) => `<div><span>${k}</span><b class="num">${v}</b></div>`).join('')}</div>`
  const ROLE = { 1: 'керри', 2: 'мид', 3: 'офлейн', 4: 'поддержка', 5: 'полная поддержка' }
  const age = (b) => (b ? Math.floor((Date.parse(DB.data.now) - Date.parse(b)) / 31557600000) : null)
  const yrs = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'год' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'года' : 'лет')
  // карточку v1–v11 режем на: шапка · «к этой минуте» · остальное (списки)
  const cut = (H) => { const m = H.match(/<div class="sd-now">[\s\S]*?<\/div>\s*<\/div>/); return m ? [H.slice(0, m.index), m[0], H.slice(m.index + m[0].length)] : [H, '', ''] }
  const compose = (head, parts) => { const now = parts.now.join(''), tour = parts.tour.join(''), ref = parts.ref.join(''), more = parts.more.join('')
    if (LAY === 'tabs') { const T = [['now', 'Сейчас', now], ['tour', 'Турнир', tour], ['ref', 'Справка', ref]].filter((x) => x[2]); /* списки (состав, герои) — под вкладками всегда: начальник «вижу состав» */ const on = T.find((x) => x[0] === st.tab) || T[0]
      return head + `<div class="sd-seg">${T.map(([k, n]) => `<button data-sdtab="${k}" class="${k === on[0] ? 'is-on' : ''}">${n}</button>`).join('')}</div>` + on[2] + more }
    return head + (LAY === 'ref' ? ref + tour + now + more : now + tour + ref + more) }

  function richPlayer(id) { const base = playerCard(id), p = DB.player(id), L = live(), s0 = ps(id) || {}, lp = SBD.lp?.[p.steam] || {}
    const lp0 = L && L.m.players.find((q) => q.account_id === p.steam), m = min(st.sec), maps = Math.max(1, s0.maps || 1)
    const [head, minute, heroes] = cut(base.html)
    const parts = { now: [], tour: [], ref: [], more: [heroes] }
    if (lp0) { const a = at(L.m, lp0, L.t), when = `Map ${L.n} · ${L.live ? mmss(L.t) : 'итог'}`
      parts.now.push(blk('Сейчас', when, tbl([['У / С / П', `<i class="up">${a.K}</i> / <i class="dn">${a.D}</i> / ${a.A ?? '—'}`], ['Состояние', kk(a.nw)], ['Золото в минуту', Math.round(a.nw / Math.max(1, L.t / 60))], ['Добито / не отдано', `${a.lh} / ${a.dn}`]]) + (a.items.length ? `<div class="sd-items">${a.items.map((it) => `<img src="${GD().items[it].img}" alt="" title="${esc(GD().items[it].name)}">`).join('')}</div>` : '')))
      parts.now.push(minute)
      const ser = lp0.nw_t.slice(0, Math.floor(L.t / 60) + 1); parts.now.push(blk('Состояние по минутам', when, `<div class="sd-dy"><b class="num">${kk(a.nw)}</b><small>сейчас</small></div>` + spark(ser))) }
    else parts.now.push(minute)
    const h = lp0 ? DB.hero(lp0.hero_id)?.id : null, onH = h && (s0.heroes || []).find((x) => x.hero === h)
    parts.tour.push(blk('Турнир', 'TI 2026 до этой карты', tbl([['Карт', s0.maps ?? '—'], ['Побед', s0.maps ? Math.round((s0.wins / s0.maps) * 100) + '%' : '—'], ['У / С / П за карту', `${fmt(s0.k / maps)} / ${fmt(s0.d / maps)} / ${fmt(s0.a / maps)}`], s0.rank && ['Место в рейтинге фэнтези', `#${s0.rank}${s0.prevRank && s0.prevRank !== s0.rank ? ` <small>(было #${s0.prevRank})</small>` : ''}`], s0.pts && ['Очки фэнтези', s0.pts], h && ['На ' + heroName(h), onH ? `${onH.maps} карт · ${onH.wins}–${onH.maps - onH.wins}` : 'на турнире не играл']])))
    const a0 = age(p.birth || lp.birth)
    parts.ref.push(blk('Об игроке', lp.page ? `<a class="sd-src" href="https://liquipedia.net/dota2/${encodeURIComponent(lp.page)}" target="_blank" rel="noopener">Liquipedia ↗</a>` : 'Liquipedia', tbl([(p.name || lp.name) && ['Имя', esc(p.name || lp.name)], a0 && ['Возраст', a0 + ' ' + yrs(a0)], (lp.country || p.country) && ['Страна', esc(lp.country || p.country)], ['Позиция', p.role ? `${p.role} · ${ROLE[p.role]}` : '—'], p.earn && ['Призовые', '$' + Math.round(p.earn).toLocaleString('ru-RU')]])))
    return { ...base, html: compose(head, parts) } }

  function richHero(k) { const base = heroCard(k), od = DB.hero(k)?.od, me = SBD.meta?.[od] || {}, mu = SBD.mu?.[od] || { up: [], dn: [] }, L = live()
    const head = base.html.split('<h4>')[0], who = '<h4>' + base.html.split('<h4>').slice(1).join('<h4>'), parts = { now: [], tour: [], ref: [], more: [who] }
    const lp0 = L && L.m.players.find((q) => q.hero_id === od)
    if (lp0) { const a = at(L.m, lp0, L.t), pl = DB.player(lp0.account_id); parts.now.push(blk(`${esc(pl?.nick || 'Игрок')} на ${esc(heroName(k))}`, `Map ${L.n} · ${L.live ? mmss(L.t) : 'итог'}`, tbl([['У / С / П', `<i class="up">${a.K}</i> / <i class="dn">${a.D}</i> / ${a.A ?? '—'}`], ['Состояние', kk(a.nw)]]))) }
    if (me.pick) parts.tour.push(blk('Мета героя', 'OpenDota · про-матчи', tbl([['Винрейт', me.wr != null ? `<i class="${me.wr >= 52 ? 'up' : me.wr < 48 ? 'dn' : ''}">${me.wr}%</i>` : '—'], ['Пиков · банов', me.pick != null ? `${me.pick} · ${me.ban}` : '—']])))
    const vs = (x, up) => { const h = DB.hero(x[0]); return [`<span class="sd-hn"><img src="${heroImg(h?.id)}" alt="">${esc(h?.name || '—')}</span>`, `<i class="${up ? 'up' : 'dn'}">${up ? '+' : '−'}${fmt(Math.abs(x[1]))} п.</i> <small>${x[2]} игр</small>`] }
    parts.ref.push(blk('Сильнее против', 'винрейт против героя − обычный', mu.up.length ? tbl(mu.up.slice(0, 3).map((x) => vs(x, true))) : '<p class="sd-none">Мало игр</p>'))
    parts.ref.push(blk('Слабее против', 'OpenDota · про-матчи', mu.dn.length ? tbl(mu.dn.slice(0, 3).map((x) => vs(x, false))) : '<p class="sd-none">Мало игр</p>'))
    return { ...base, html: compose(head, parts) } }

  function richTeam(id) { const base = teamCard(id), t = DB.team(id), s = DB.teamStats(TOUR, id) || {}, L = live()
    const [head, minute, rest] = cut(base.html)
    const parts = { now: [], tour: [], ref: [], more: [rest] }
    if (L) { const rad = L.m.radiant_team_id === t.od, pl = L.m.players.filter((p) => p.isRadiant === rad), en = L.m.players.filter((p) => p.isRadiant !== rad), a = pl.map((p) => at(L.m, p, L.t)), b = en.map((p) => at(L.m, p, L.t))
      const advS = L.m.radiant_gold_adv.slice(0, Math.floor(L.t / 60) + 1).map((v) => (rad ? v : -v)), adv = advS.at(-1) || 0, when = `Map ${L.n} · ${L.live ? mmss(L.t) : 'итог'}`
      parts.now.push(blk('Сейчас', when, tbl([['Убийства', `${a.reduce((n, x) => n + x.K, 0)} : ${b.reduce((n, x) => n + x.K, 0)}`], ['Перевес по золоту', `<i class="${adv >= 0 ? 'up' : 'dn'}">${adv >= 0 ? '+' : '−'}${kk(Math.abs(adv))}</i>`], ['Состояние команды', kk(a.reduce((n, x) => n + x.nw, 0))]])))
      parts.now.push(minute)
      parts.now.push(blk('Перевес по минутам', when, `<div class="sd-dy"><b class="num ${adv >= 0 ? 'up' : 'dn'}">${adv >= 0 ? '+' : '−'}${kk(Math.abs(adv))}</b><small>лучший +${kk(Math.max(0, ...advS))} · худший −${kk(Math.abs(Math.min(0, ...advS)))}</small></div>` + spark(advS, adv >= 0 ? 'up' : 'dn'))) }
    else parts.now.push(minute)
    parts.tour.push(blk('Турнир · серии', 'TI 2026 до этого матча', tbl([['Серии', s.series?.join('–') || '—'], ['Карты', s.maps?.join('–') || '—']]) + `<div class="sd-tb">${(s.form || []).map((f) => `<div><span class="sd-hn"><img src="${url(DB.team(f.vs)?.logo)}" alt="">${esc(DB.name(f.vs))}</span><b class="num ${f.win ? 'up' : 'dn'}">${f.score.join(':')}</b></div>`).join('')}</div>`))
    return { ...base, html: compose(head, parts) } }
  // ── v15 (дирижёр 04.11: «не много ли инфы? — базово умещаться без прокрутки на нормальном разрешении; „перейти на страницу“ — прибита к низу»): SD_SHORT —
  // по 3–4 блока на сущность, только про момент матча (начальник 1·14:44–16:39); общее — на полной странице, кнопка которой прибита к низу панели (.sd-ft)
  const SHORT = !!window.SD_SHORT
  const li3 = (H) => { const m = [...H.matchAll(/<button class="sd-li"[\s\S]*?<\/button>/g)].slice(0, 3).map((x) => x[0]); return m.length ? `<div class="sd-list">${m.join('')}</div>` : '' }
  const nowBlk = (L, lp0, rows) => blk('Сейчас', `Map ${L.n} · ${L.live ? mmss(L.t) : 'итог'}`, tbl(rows))
  function shortPlayer(id) { const base = playerCard(id), p = DB.player(id), L = live(), lp0 = L && L.m.players.find((q) => q.account_id === p.steam), [head, minute, rest] = cut(base.html)
    const a = lp0 && at(L.m, lp0, L.t)
    if (TILES) return { ...base, html: head + (a ? tilesP(p, L, lp0, a) + (a.items.length ? `<div class="sd-items sd-items--s">${a.items.map((it) => `<img src="${GD().items[it].img}" alt="" title="${esc(GD().items[it].name)}">`).join('')}</div>` : '') : minute) + '<h4>Его герои на турнире</h4>' + li3(rest) }
    return { ...base, html: head + (a ? nowBlk(L, lp0, [['У / С / П', `<i class="up">${a.K}</i> / <i class="dn">${a.D}</i> / ${a.A ?? '—'}`], ['Состояние', kk(a.nw)], ['Золото в минуту', Math.round(a.nw / Math.max(1, L.t / 60))]]) + (a.items.length ? `<div class="sd-items sd-items--s">${a.items.map((it) => `<img src="${GD().items[it].img}" alt="" title="${esc(GD().items[it].name)}">`).join('')}</div>` : '') : '') + minute + '<h4>Его герои на турнире</h4>' + li3(rest) } }
  function shortTeam(id) { const base = teamCard(id), t = DB.team(id), L = live(), [head, minute, rest] = cut(base.html), [roster, heroes] = rest.split('<h4>Герои команды на турнире</h4>')
    let now = ''; if (L) { const rad = L.m.radiant_team_id === t.od, a = L.m.players.filter((p) => p.isRadiant === rad).map((p) => at(L.m, p, L.t)), b = L.m.players.filter((p) => p.isRadiant !== rad).map((p) => at(L.m, p, L.t)), adv = (L.m.radiant_gold_adv[Math.min(Math.floor(L.t / 60), L.m.radiant_gold_adv.length - 1)] || 0) * (rad ? 1 : -1)
      now = nowBlk(L, null, [['Убийства', `${a.reduce((n, x) => n + x.K, 0)} : ${b.reduce((n, x) => n + x.K, 0)}`], ['Перевес по золоту', `<i class="${adv >= 0 ? 'up' : 'dn'}">${adv >= 0 ? '+' : '−'}${kk(Math.abs(adv))}</i>`]]) }
    if (TILES && L) now = tilesT(t, L)
    const hs = [...(heroes || '').matchAll(/<button class="sd-hc"[\s\S]*?<\/button>/g)].slice(0, 3).map((x) => x[0]).join('')
    return { ...base, html: head + now + (TILES && L ? '' : minute) + roster + (hs ? `<h4>Герои команды на турнире</h4><div class="sd-grid">${hs}</div>` : '') } }
  function shortHero(k) { const base = heroCard(k), od = DB.hero(k)?.od, L = live(), lp0 = L && L.m.players.find((q) => q.hero_id === od), parts = base.html.split('<h4>'), head = parts[0]
    let now = ''; if (lp0) { const a = at(L.m, lp0, L.t), pl = DB.player(lp0.account_id); now = blk(`${esc(pl?.nick || 'Игрок')} на нём сейчас`, `Map ${L.n} · ${L.live ? mmss(L.t) : 'итог'}`, tbl([['У / С / П', `<i class="up">${a.K}</i> / <i class="dn">${a.D}</i> / ${a.A ?? '—'}`], ['Состояние', kk(a.nw)]])) }
    return { ...base, html: (TILES ? head.replace(/<div class="sd-stats">[\s\S]*?<\/div><\/div>/, tilesH(k)) : head) + now + '<h4>Кто играет на турнире</h4>' + li3('<h4>' + parts.slice(1).join('<h4>')) } }
  // ── v16 (дирижёр 04.11: «нравилось в прошлом „Разборе“ — полоса, прогресс; инфа базовая, простая, аккуратно»): SD_TILES — наверху плитки сравнения,
  // как «О матче» в «Статистике» (w-preview-2: .ws49-c): значок и подпись · слева «сейчас» / своя команда · по центру плашка лидера · справа «обычно» / соперник · снизу полоса
  const TILES = !!window.SD_TILES
  const IC = { k: '<path d="M3 13 13 3M10 3h3v3M3 3l4 4M9 9l4 4M11 13h2v-2" />', d: '<path d="M8 2.5a4.5 4.5 0 0 0-4.5 4.5c0 1.6.8 2.6 1.5 3.2V13h6v-2.8c.7-.6 1.5-1.6 1.5-3.2A4.5 4.5 0 0 0 8 2.5zM6.3 7.3h.01M9.7 7.3h.01M7 13v-1.5M9 13v-1.5"/>', g: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5v6M6.3 6.5c0-.8.8-1.3 1.7-1.3s1.7.5 1.7 1.3-.8 1.2-1.7 1.4-1.7.6-1.7 1.4.8 1.3 1.7 1.3 1.7-.5 1.7-1.3"/>', w: '<path d="M4 3h8v3a4 4 0 0 1-8 0zM6 13h4M8 10v3M4 4H2.5v1A2 2 0 0 0 4 7M12 4h1.5v1A2 2 0 0 1 12 7"/>' }
  const icon = (k) => `<span class="ws41-ic"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg></span>`
  // a / b: [значение для полосы, подпись к числу, как показать число]; best: 'a' | 'b' | ''; chip: [картинка, текст]
  const tile = (ic, label, a, b, best, chip) => { const sum = Math.max(1e-9, a[0] + b[0]), wa = Math.round((a[0] / sum) * 100)
    return `<div class="ws49-c sd-tile"><div class="ws43-t">${icon(ic)}<small>${label}</small></div>
      <div class="ws43-v"><span class="${best === 'a' ? 'is-best' : ''}"><b class="num">${a[2] ?? a[0]}</b><small>${a[1]}</small></span>${chip ? `<em class="sd-chip ${best}">${chip[0] ? `<img src="${chip[0]}" alt="">` : ''}<b class="num">${chip[1]}</b></em>` : ''}<span class="${best === 'b' ? 'is-best' : ''}"><small>${b[1]}</small><b class="num">${b[2] ?? b[0]}</b></span></div>
      <div class="ws5-bar"><i style="width:${wa}%" class="${best === 'a' ? 'is-best' : ''}"></i><i class="${best === 'b' ? 'is-best' : ''}"></i></div></div>` }
  const tilesP = (p, L, lp0, a) => { const s0 = ps(p.id) || {}, m = min(st.sec), maps = Math.max(1, s0.maps || 1), uk = (s0.k / maps) * (m / AVG), ud = (s0.d / maps) * (m / AVG), gpm = Math.round(a.nw / Math.max(1, L.t / 60)), hi = heroImg(DB.hero(lp0.hero_id)?.id)
    const pc = (now, us) => Math.round((now / Math.max(0.1, us)) * 100) + '%'
    return `<div class="sd-tiles">${tile('k', `Убийства к ${Math.floor(m)}-й минуте`, [a.K, 'сейчас'], [uk, 'обычно', fmt(uk)], a.K >= uk ? 'a' : 'b', [hi, pc(a.K, uk)])}${tile('d', `Смерти к ${Math.floor(m)}-й минуте`, [a.D, 'сейчас'], [ud, 'обычно', fmt(ud)], a.D <= ud ? 'a' : 'b', [hi, pc(a.D, ud)])}${tile('g', 'Золото в минуту', [gpm, 'сейчас'], [s0.gpm || 0, 'на турнире'], gpm >= (s0.gpm || 0) ? 'a' : 'b', [hi, pc(gpm, s0.gpm || 1)])}</div>` }
  const tilesT = (t, L) => { const rad = L.m.radiant_team_id === t.od, A = L.m.players.filter((p) => p.isRadiant === rad).map((p) => at(L.m, p, L.t)), B = L.m.players.filter((p) => p.isRadiant !== rad).map((p) => at(L.m, p, L.t)), o = DB.team(rad ? L.m.dire_team_id : L.m.radiant_team_id)
    const ka = A.reduce((n, x) => n + x.K, 0), kb = B.reduce((n, x) => n + x.K, 0), na = A.reduce((n, x) => n + x.nw, 0), nb = B.reduce((n, x) => n + x.nw, 0), m = min(st.sec)
    const lead = (x, y) => (x >= y ? [url(t.logo), Math.round((x / Math.max(1, x + y)) * 100) + '%'] : [url(o?.logo), Math.round((y / Math.max(1, x + y)) * 100) + '%'])
    const all = DB.players({ team: t.id }).filter((p) => typeof p.role === 'number'), maps = Math.max(1, ps(all[0]?.id)?.maps || 1), uk = (all.reduce((n, p) => n + (ps(p.id)?.k || 0), 0) / maps) * (m / AVG)
    return `<div class="sd-tiles">${tile('k', 'Убийства', [ka, esc(t.mid || t.name)], [kb, esc(o?.mid || o?.name || '')], ka >= kb ? 'a' : 'b', lead(ka, kb))}${tile('w', `Убийства к ${Math.floor(m)}-й — против обычного`, [ka, 'сейчас'], [uk, 'обычно', fmt(uk)], ka >= uk ? 'a' : 'b', [url(t.logo), Math.round((ka / Math.max(0.1, uk)) * 100) + '%'])}</div>` }
  const tilesH = (k) => { const x = DB.heroStats(TOUR)?.list.find((y) => y.hero === k), od = DB.hero(k)?.od, me = SBD.meta?.[od] || {}, wr = x?.picks ? Math.round((x.pickWins / x.picks) * 100) : 0, pb = x?.pickBan || 0
    return `<div class="sd-tiles">${tile('w', 'Побед на TI 2026', [wr, 'TI', wr + '%'], [100 - wr, 'поражений', 100 - wr + '%'], wr >= 50 ? 'a' : 'b', [heroImg(k), wr + '%'])}${tile('k', 'Пик или бан на TI 2026', [pb, 'пик / бан', pb + '%'], [100 - pb, 'нет', 100 - pb + '%'], pb >= 50 ? 'a' : 'b', [heroImg(k), (x?.picks || 0) + ' · ' + (x?.bans || 0)])}</div>` }
  // ── v17 (дирижёр 04.11: «плитки начальнику не нравятся — без них, без лишних разделителей, проще; как виджет команд на странице турнира — мало текста, мало выделения»):
  // SD_PT — всё строками, как «Участники» (widget-participants .pt-r): слева значок / картинка, имя и серая подпись, справа число и серое «обычно»; подзаголовки серым, без рамок и плашек
  const PT = !!window.SD_PT
  // ── v18 (дирижёр 04.11: «внутри сайдбара не должно быть проваливания — показываем только страницы; герой / игрок — переключением»): SD_FLAT —
  // строки не нажимаются, «назад» нет; у игрока сверху сегмент «Игрок · его герой в матче», переключает карточку на месте; «Открыть страницу» — того, что выбрано
  const FLAT = !!window.SD_FLAT
  const R = (o0) => { const o = FLAT ? { ...o0, sd: '' } : o0; return R0(o) }
  const R0 = (o) => `<${o.sd ? `button data-sd="${o.sd}"` : 'div'} class="sd-r${o.sd ? ' is-btn' : ''}">${o.lead || ''}<span class="n"><span>${o.n}</span>${o.sub ? `<small>${o.sub}</small>` : ''}</span>${o.v != null ? `<span class="v"><b class="${o.c || ''}">${o.v}</b>${o.u ? `<i>${o.u}</i>` : ''}</span>` : ''}</${o.sd ? 'button' : 'div'}>`
  const SH = (t, m) => `<div class="sd-sh"><b>${t}</b>${m ? `<small>${m}</small>` : ''}</div>`
  const when = (L) => `Map ${L.n} · ${L.live ? mmss(L.t) : 'итог'}`
  const kda = (a) => `${a.K} / ${a.D}${a.A != null ? ' / ' + a.A : ''}`
  const hi = (k, cls = 'h') => `<img class="${cls}" src="${heroImg(k)}" alt="">`
  function ptPlayer(id) { const p = DB.player(id), t = DB.team(p.team), s0 = ps(id) || {}, L = live(), lp0 = L && L.m.players.find((q) => q.account_id === p.steam), m = min(st.sec), maps = Math.max(1, s0.maps || 1)
    let now = ''; if (lp0) { const a = at(L.m, lp0, L.t), h = DB.hero(lp0.hero_id)?.id, gpm = Math.round(a.nw / Math.max(1, L.t / 60))
      // w-gold-pl v1 (созвон 06.11 §3.5, дирижёр: «на табе карты в сайдбаре у игрока золото на этот момент — главный показатель»): SD_GOLD1 — первым крупно золото на эту минуту и золото в минуту
      const g1 = window.SD_GOLD1 ? `<div class="sd-g1${window.SD_G1BD ? ' sd-g1--bd' : ''}"><img src="../w-bottom-2/gold.png" alt=""><b class="num">${kk(a.nw)}</b><span>золото ${L.live ? 'сейчас' : 'к концу карты'}<small class="num">${gpm} в минуту${s0.gpm ? ' · обычно ' + s0.gpm : ''}</small></span></div>` : ''
      now = SH('Сейчас', when(L)) + g1 + R({ lead: hi(h), n: esc(heroName(h)), sub: 'в этом матче', v: kda(a), sd: 'hero:' + h })
        + R({ n: `Убийства к ${Math.floor(m)}-й`, v: a.K, u: 'обычно ' + fmt((s0.k / maps) * (m / AVG)) }) + R({ n: `Смерти к ${Math.floor(m)}-й`, v: a.D, u: 'обычно ' + fmt((s0.d / maps) * (m / AVG)) })
        + (window.SD_GOLD1 ? '' : R({ n: 'Золото в минуту', v: gpm, u: s0.gpm ? 'обычно ' + s0.gpm : '' }) + (PLUS ? '' : R({ n: 'Состояние', v: kk(a.nw) }))) }
    return { title: p.nick, kind: 'Игрок', html: `<div class="sd-id"><img class="sd-ph" src="${url(p.photo || p.avatar)}" alt=""><div><b>${esc(p.nick)}</b><small><img src="${url(t?.logo)}" alt="">${esc(t?.name)} · позиция ${p.role ?? '—'}</small></div></div>`
      + now + SH('Его герои на турнире') + (s0.heroes || []).slice(0, 3).map((x) => R({ lead: hi(x.hero), n: esc(heroName(x.hero)), sub: x.maps + ' карт', v: `${x.wins}–${x.maps - x.wins}`, sd: 'hero:' + x.hero })).join('') } }
  function ptTeam(id) { const t = DB.team(id), s = DB.teamStats(TOUR, id) || {}, L = live(), m = min(st.sec), all = DB.players({ team: id }).filter((p) => typeof p.role === 'number').sort((a, b) => a.role - b.role), inM = all.filter((p) => rowOf(st.sec, p.steam)), roster = inM.length >= 5 ? inM : all.slice(0, 5)
    let now = ''; if (L) { const rad = L.m.radiant_team_id === t.od, A = L.m.players.filter((p) => p.isRadiant === rad).map((p) => at(L.m, p, L.t)), B = L.m.players.filter((p) => p.isRadiant !== rad).map((p) => at(L.m, p, L.t)), adv = (L.m.radiant_gold_adv[Math.min(Math.floor(L.t / 60), L.m.radiant_gold_adv.length - 1)] || 0) * (rad ? 1 : -1)
      const ka = A.reduce((n, x) => n + x.K, 0), uk = (roster.reduce((n, p) => n + (ps(p.id)?.k || 0), 0) / Math.max(1, ps(roster[0]?.id)?.maps || 1)) * (m / AVG)
      now = SH('Сейчас', when(L)) + R({ n: 'Убийства', v: `${ka} : ${B.reduce((n, x) => n + x.K, 0)}` }) + R({ n: `Убийства к ${Math.floor(m)}-й`, v: ka, u: 'обычно ' + fmt(uk) }) + R({ n: 'Перевес по золоту', v: `${adv >= 0 ? '+' : '−'}${kk(Math.abs(adv))}`, c: adv >= 0 ? 'up' : 'dn' }) }
    const heroes = {}; roster.forEach((p) => (ps(p.id)?.heroes || []).forEach((h) => { heroes[h.hero] = heroes[h.hero] || [0, 0]; heroes[h.hero][0] += h.maps; heroes[h.hero][1] += h.wins }))
    return { title: t.name, kind: 'Команда', html: `<div class="sd-id"><img class="sd-tl" src="${url(t.logo)}" alt=""><div><b>${esc(t.name)}</b><small>TI 2026 · серии ${s.series?.join('–') || '—'} · карты ${s.maps?.join('–') || '—'}</small></div></div>`
      + now + SH('Состав') + roster.map((p) => { const r = rowOf(st.sec, p.steam); return R({ lead: `<span class="p">${p.role}</span>`, n: esc(p.nick), sub: r?.hero ? esc(heroName(r.hero)) : '', v: r ? `${r.k} / ${r.d}` : null, sd: 'player:' + p.id }) }).join('')
      + SH('Герои команды на турнире') + Object.entries(heroes).sort((a, b) => b[1][0] - a[1][0]).slice(0, 3).map(([h, [n, w]]) => R({ lead: hi(h), n: esc(heroName(h)), sub: n + ' карт', v: Math.round((w / n) * 100) + '%', u: 'побед', sd: 'hero:' + h })).join('') } }
  function ptHero(k) { const x = DB.heroStats(TOUR)?.list.find((y) => y.hero === k), od = DB.hero(k)?.od, L = live(), lp0 = L && L.m.players.find((q) => q.hero_id === od)
    const who = DB.playerStats(TOUR).filter((p) => p.heroes.some((h) => h.hero === k)).map((p) => [p, p.heroes.find((h) => h.hero === k)]).sort((a, b) => b[1].maps - a[1].maps).slice(0, 3)
    let now = ''; if (lp0) { const a = at(L.m, lp0, L.t), pl = DB.player(lp0.account_id); now = SH('Сейчас', when(L)) + R({ n: esc(pl?.nick || 'Игрок'), sub: esc(DB.name(pl?.team)), v: kda(a), sd: pl ? 'player:' + pl.id : '' }) + R({ n: 'Состояние', v: kk(a.nw) }) }
    return { title: heroName(k), kind: 'Герой', html: `<div class="sd-id"><img class="sd-ph sd-ph--h" src="${heroImg(k)}" alt=""><div><b>${esc(heroName(k))}</b><small>TI 2026 · ${x?.picks ?? 0} пиков · ${x?.picks ? Math.round((x.pickWins / x.picks) * 100) : 0}% побед · ${x?.bans ?? 0} банов</small></div></div>`
      + now + SH('Кто играет на турнире') + who.map(([p, h]) => { const pl = DB.player(p.player); return R({ n: esc(pl?.nick || p.player), sub: esc(DB.name(p.team)), v: `${h.wins}–${h.maps - h.wins}`, u: h.maps + ' карт', sd: 'player:' + p.player }) }).join('') } }
  function flatPlayer(id) { const p = DB.player(id), L = live(), lp0 = L && L.m.players.find((q) => q.account_id === p.steam), h = lp0 ? DB.hero(lp0.hero_id)?.id : rowOf(st.sec, p.steam)?.hero
    if (!h) return ptPlayer(id)
    const on = st.tab === 'h' ? 'h' : 'p', c = on === 'h' ? ptHero(h) : ptPlayer(id)
    const seg = `<div class="sd-seg sd-seg--pt"><button data-sdtab="p" class="${on === 'p' ? 'is-on' : ''}">${esc(p.nick)}</button><button data-sdtab="h" class="${on === 'h' ? 'is-on' : ''}">${esc(heroName(h))}</button></div>`
    if (PLUS) { const pc = ptPlayer(id), head = pc.html.match(/^<div class="sd-id">[\s\S]*?<\/div><\/div>/)[0], body = c.html.replace(/^<div class="sd-id">[\s\S]*?<\/div><\/div>/, '')
      const x = DB.heroStats(TOUR)?.list.find((y) => y.hero === h), hInfo = R({ lead: hi(h), n: 'На TI 2026', sub: (x?.picks ?? 0) + ' пиков · ' + (x?.bans ?? 0) + ' банов', v: (x?.picks ? Math.round((x.pickWins / x.picks) * 100) : 0) + '%', u: 'побед' })
      return { title: pc.title, kind: pc.kind, page: on === 'h' ? 'герой' : 'игрок', html: head + seg + (on === 'h' ? SH('Герой') + hInfo + body : body.replace('<div class="sd-sh"><b>Его герои', plusP(p, L, lp0) + '<div class="sd-sh"><b>Его герои')) } }
    const html = c.html.replace(/^(<div class="sd-id">[\s\S]*?<\/div><\/div>)/, '$1' + seg)
    return { ...c, html } }
  // ── v19 (дирижёр 04.11: «блоки из старой версии нравятся — „Состояние по минутам“ и „Рейтинг за период“; шапка не должна прыгать при выборе в сегменте»): SD_PLUS —
  // шапка и сегмент у игрока одни и те же на обеих вкладках, меняется только то, что ниже; у игрока — два блока из прошлого «Разбора» (w-drill vP), «Состояние» строкой убрано — оно в графике
  // ‼️ «Рейтинг за период» — пример, как в w-drill: формула рейтинга у начальника; число карт — настоящее (общая база)
  const PLUS = !!window.SD_PLUS
  const hh = (x) => { let v = 7; for (const ch of String(x)) v = (v * 31 + ch.charCodeAt(0)) >>> 0; return v }
  function plusP(p, L, lp0) { if (!lp0) return ''; const a = at(L.m, lp0, L.t), ser = lp0.nw_t.slice(0, Math.floor(L.t / 60) + 1), s0 = ps(p.id) || {}
    const r = (n) => 38 + (hh(p.steam + n) % 55), Rt = [['Фарм', r('f')], ['Драки', r('g')], ['Пул героев', r('p')], ['Выживание', r('s')], ['Объекты', r('o')], ['Форма', r('m')]], all = Math.round(Rt.reduce((n, x) => n + x[1], 0) / 6), tone = (v) => (v >= 75 ? 'up' : v < 50 ? 'dn' : '')
    return SH(window.SD_GOLD1 ? 'Золото по минутам' : 'Состояние по минутам', when(L)) + `<div class="sd-dyn">${window.SD_GOLD1 ? '' : `<div class="sd-1"><b class="num">${kk(a.nw)}</b><span>${L.live ? 'сейчас' : 'к концу карты'}</span></div>`}${spark(ser)}</div>`
      + SH('Рейтинг за период', (s0.maps || 0) + ' карт турнира · пример') + `<div class="sd-rt"><div class="sd-1"><b class="num">${all}</b><span>${ROLE[p.role] || 'игрок'}</span></div><div class="sd-r6">${Rt.map(([t, v]) => `<div><b class="num ${tone(v)}">${v}</b><span>${t}</span></div>`).join('')}</div></div>` }
  const card = (e) => { const [k, v] = e.split(':'); if (PT && FLAT && k === 'player') return flatPlayer(v); if (PT) return k === 'team' ? ptTeam(v) : k === 'player' ? ptPlayer(v) : ptHero(v); if (SHORT) return k === 'team' ? shortTeam(v) : k === 'player' ? shortPlayer(v) : shortHero(v); return k === 'team' ? (RICH ? richTeam(v) : teamCard(v)) : k === 'player' ? (RICH ? richPlayer(v) : playerCard(v)) : RICH ? richHero(v) : heroCard(v) }

  function render() {
    const side = st.side; if (!side) return
    if (PEN) return renderPen()
    // сайдбар — внутри колонки первым: колонка липкая (правило 03.11), он вместе с ней; виджеты колонки прячутся (replace) или затемняются под ним (over)
    let box = side.querySelector(':scope > .sd'); if (!box) { box = document.createElement('aside'); box.className = 'sd sd--' + MODE; side.prepend(box) }
    if (!st.stack.length) { if (OVER && box.classList.contains('is-on')) { box.classList.add('is-out'); setTimeout(() => { if (!st.stack.length) box.classList.remove('is-on', 'is-out') }, 260); return }
      box.classList.remove('is-on'); side.classList.remove('sd-hid', 'sd-dim'); return }
    if (OVER) { box.classList.add('sd--over2'); box.classList.remove('is-out'); side.classList.add('sd-host') }
    const cur = card(st.stack.at(-1)), crumbs = st.stack.map((e, i) => `<button data-sdi="${i}" class="${i === st.stack.length - 1 ? 'is-cur' : ''}">${esc(card(e).title)}</button>`).join('<i>›</i>')
    // v4 apple (дирижёр 04.11: «как Apple Карты, только сайдбар с другой стороны, перекрывает только правую колонку»): круглое «‹ прошлое имя» и крестик сверху,
    // крупное имя и тип под ними; переход вглубь — новое въезжает справа, назад — слева
    if (MODE === 'apple') { const prev = st.stack.length > 1 ? card(st.stack.at(-2)).title : null
      box.innerHTML = `<div class="sd-in sd-in--${st.dir}"><div class="sd-hd">${prev ? `<button class="sd-back" data-sdback><i>‹</i>${esc(prev)}</button>` : '<span></span>'}<button class="sd-ib" data-sdx title="Закрыть — вернуть колонку">✕</button></div>
        <div class="sd-bd"><div class="sd-big"><b>${esc(cur.title)}</b><small>${cur.kind}</small></div>${cur.html}<a class="sd-page" href="#" onclick="return false">Открыть страницу · ${esc(cur.kind.toLowerCase())} ›</a></div></div>`
      box.classList.add('is-on'); if (!OVER) side.classList.add('sd-hid'); box.querySelector('.sd-bd').scrollTop = 0; return }
    box.innerHTML = `<div class="sd-in"><div class="sd-hd">
        ${st.stack.length > 1 ? '<button class="sd-ib" data-sdback title="Назад">‹</button>' : ''}
        ${MODE === 'crumbs' ? `<div class="sd-crumbs">${crumbs}</div>` : `<div class="sd-t"><small>${cur.kind}</small><b>${esc(cur.title)}</b></div>`}
        <button class="sd-ib" data-sdx title="Закрыть — вернуть колонку">✕</button></div>
      <div class="sd-bd">${cur.html}<a class="sd-page" href="#" onclick="return false">Открыть страницу · ${esc(cur.kind.toLowerCase())} ›</a></div></div>`
    box.classList.add('is-on'); side.classList.toggle('sd-hid', MODE !== 'over'); side.classList.toggle('sd-dim', MODE === 'over')
    box.querySelector('.sd-bd').scrollTop = 0
  }
  // ── v6 полуостров: панель и пилюля — в body, position:fixed; место — по колонке (её левый край минус наезд, её верх)
  // наезд на главную колонку: v6 — 28; v7 (дирижёр 04.11: «наезжает только на правую колонку, отступ остаётся… на один пиксель больше») — 1
  const OVERLAP = window.SD_PEN_OVER ?? 28
  function penPlace() { const box = document.querySelector('body > .sd-pen'); if (!box || !st.side) return
    const r = st.side.getBoundingClientRect(); box.style.left = Math.round(r.left - OVERLAP) + 'px'; box.style.top = Math.max(0, Math.round(r.top)) + 'px'
    // v8 (дирижёр 04.11: «пилюля — в верхней части, а не посередине»): SD_PILL_TOP — пилюля вровень с верхом колонки
    const pill = document.querySelector('body > .sd-pill'); if (pill && window.SD_PILL_TOP) { pill.style.top = Math.max(12, Math.round(r.top)) + 'px'; pill.style.marginTop = '0' } if (pill && window.SD_PILL_MID && st.pillY == null) { const b = document.querySelector('body > .sd-pen').getBoundingClientRect(); pill.style.marginTop = '0'; pill.style.top = Math.round(b.top + b.height / 2 - pill.offsetHeight / 2) + 'px' } /* v33 (дирижёр 04.11: «свернулся — пусть базово оказывается в центре»): SD_PILL_MID — язычок по центру высоты сайдбара, там же, где «свернуть» */ if (pill && DRAG && st.pillY != null) pill.style.top = pillClamp(pill, st.pillY) + 'px'
    const t2 = TAB2 && box.querySelector('.sd-tab2'); if (t2) { const bt = box.getBoundingClientRect().top, def = box.offsetHeight / 2 - 52; t2.style.top = Math.round(st.mini && st.pillY != null ? pillClamp(t2, st.pillY) - bt : def) + 'px' }
    if (pill && TAB1) { const b = box.getBoundingClientRect(); if (!st.mini) { pill.style.right = Math.round(innerWidth - parseFloat(box.style.left) - 1) + 'px'; pill.style.top = Math.round(b.top + b.height / 2 - 52) + 'px' } else pill.style.right = '0px' } }
  // v31 (дирижёр 04.11: «язычок можно перетаскивать по высоте»): SD_PILL_DRAG — тянешь язычок вверх / вниз, он остаётся там (до перезагрузки); границы — от верха колонки до низа окна; сдвинул больше 4 px — это перетаскивание, не нажатие
  // v37 (созвон 05.11 §5.1; дирижёр 05.11: «язычок / свёрнутый „Разбор“ — перебор: на месте виджета просто открывается сайдбар»): SD_NOTAB — не сворачивается, язычка нет;
  //   в шапке справа крестик — закрыть, колонка снова видна; Esc — тоже закрыть
  const NOTAB = !!window.SD_NOTAB, DRAG = !!window.SD_PILL_DRAG && !NOTAB, TAB2 = !!window.SD_TAB2 && !NOTAB, TAB1 = !!window.SD_TAB1 && !TAB2 && !NOTAB
  const pillClamp = (pill, y) => { const top = st.side ? Math.max(12, Math.round(st.side.getBoundingClientRect().top)) : 12; return Math.round(Math.min(Math.max(y, top), innerHeight - pill.offsetHeight - 8)) }
  if (DRAG) addEventListener('pointerdown', (e) => { const pill = e.target.closest?.(TAB2 ? '.sd-tab2' : 'body > .sd-pill'); if (!pill || e.button || ((TAB1 || TAB2) && !st.mini)) return; const off = TAB2 ? pill.parentElement.getBoundingClientRect().top : 0
    const y0 = e.clientY, t0 = pill.getBoundingClientRect().top; let moved = false; pill.setPointerCapture(e.pointerId)
    const mv = (ev) => { const dy = ev.clientY - y0; if (!moved && Math.abs(dy) < 4) return; moved = true; pill.classList.add('is-drag'); st.pillY = t0 + dy; pill.style.marginTop = '0'; pill.style.top = pillClamp(pill, st.pillY) - off + 'px' }
    const up = () => { pill.removeEventListener('pointermove', mv); pill.removeEventListener('pointerup', up); pill.removeEventListener('pointercancel', up); pill.classList.remove('is-drag'); if (moved) { st.pillY = parseFloat(pill.style.top) + off; st.drug = true; setTimeout(() => { st.drug = false }, 0) } }
    pill.addEventListener('pointermove', mv); pill.addEventListener('pointerup', up); pill.addEventListener('pointercancel', up) })
  function renderPen() {
    let box = document.querySelector('body > .sd-pen'), pill = document.querySelector('body > .sd-pill')
    if (!box) { box = document.createElement('aside'); box.className = 'sd sd--apple sd-pen'; document.body.append(box); pill = document.createElement('button'); pill.className = 'sd-pill'; pill.title = 'Развернуть'; document.body.append(pill) }
    if (!st.stack.length) { box.classList.remove('is-on', 'is-mini'); pill.classList.remove('is-on'); return }
    const cur = card(st.stack.at(-1)), prev = st.stack.length > 1 ? card(st.stack.at(-2)).title : null, img = cur.html.match(/<img class="sd-(?:tl|ph)[^"]*" src="([^"]+)"/)?.[1] || cur.html.match(/<div class="sd-hero"><img src="([^"]+)"/)?.[1]
    // v9 (дирижёр 04.11: «кнопку сворачивания — в левый угол и в нашем стиле»): SD_MIN_LEFT — квадрат 30, мягкий фон, серая иконка (как «назад» в окне матча, .bj--soft), слева; «‹ прошлое имя» — после неё
    const minBtn = `<button class="${window.SD_MIN_LEFT ? 'sd-sq' : 'sd-ib sd-min'}" data-sdmin title="Свернуть вправо"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg></button>`, backBtn = prev ? `<button class="sd-back" data-sdback><i>‹</i>${esc(prev)}</button>` : ''
    // v10 (дирижёр 04.11: «визуально в нашем стиле, как наши виджеты»): SD_OURS — шапка как у виджетов: «свернуть», «назад» квадратами, имя 15 / 600 и тип серым в строку;
    // блоки — без плашек, строки 44 с разделителями, подписи --t-sub, числа --t-num; кнопка страницы — нейтральная, как наши кнопки
    const OURS = !!window.SD_OURS; box.classList.toggle('sd--ours', OURS); box.classList.toggle('sd--short', SHORT); box.classList.toggle('sd--pt', PT); box.classList.toggle('sd--lift', !!window.SD_LIFT); box.classList.toggle('sd--sq0', !!window.SD_SQ0); box.classList.toggle('sd--notop', !!window.SD_NOTOP); box.classList.toggle('sd--hdid', !!window.SD_HDID); box.classList.toggle('sd--mout2', !!window.SD_PILL_MID); if (DRAG) pill.dataset.drag = '1' /* v23 (дирижёр 04.11: «убери дивайдер сверху — не должно быть линии шапки + линии сайдбара»): верхней рамки нет, линия — только у шапки страницы */ /* v22 (дирижёр 04.11: «без скругления»): выделение как v21, углы прямые, до низа окна */ /* v21 (дирижёр 04.11: «чуть-чуть выделен и со скруглением»): фон светлее, рамка, скругление слева сверху и снизу, от низа окна 8 */
    const hd = OURS ? `<div class="sd-hd sd-hd--l">${window.SD_MIN_OUT ? '' : minBtn}${prev ? `<button class="sd-sq" data-sdback title="Назад — ${esc(prev)}"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8 10 12.5"/></svg></button>` : ''}<div class="sd-ttl"><b>${esc(cur.title)}</b><small>${cur.kind}${prev ? ' · из ' + esc(prev) : ''}</small></div></div>`
      : `<div class="sd-hd${window.SD_MIN_LEFT ? ' sd-hd--l' : ''}">${window.SD_MIN_LEFT ? minBtn + backBtn : (backBtn || '<span></span>') + minBtn}</div>`
    // v24 (дирижёр 04.11: «эту штуку перенеси сюда»): SD_HDID — картинка и подпись («команда · позиция», у команды — серии, у героя — TI 2026) из строки под шапкой переезжают в шапку: картинка вместо «Игрок», подпись под именем; строки под шапкой нет
    let hd2 = hd; if (window.SD_HDID && OURS) { const m = cur.html.match(/<div class="sd-id">(<img [^>]*>)<div><b>[\s\S]*?<\/b><small>([\s\S]*?)<\/small><\/div><\/div>/); if (m) { cur.html = cur.html.replace(m[0], ''); hd2 = hd.replace(/<div class="sd-ttl"><b>([\s\S]*?)<\/b><small>[\s\S]*?<\/small><\/div>/, (_, b) => `${m[1].replace('<img ', '<img data-hdid ')}<div class="sd-ttl"><b>${b}</b><small>${m[2]}</small></div>`) } }
    box.innerHTML = `<div class="sd-in sd-in--${st.dir}">${hd2}
      <div class="sd-bd">${OURS ? '' : `<div class="sd-big"><b>${esc(cur.title)}</b><small>${cur.kind}</small></div>`}${cur.html}${SHORT ? '' : `<a class="sd-page" href="#" onclick="return false">Открыть страницу · ${esc(cur.kind.toLowerCase())} ›</a>`}</div>${SHORT ? `<div class="sd-ft"><a class="sd-page" href="#" onclick="return false">Открыть страницу · ${esc(cur.page || cur.kind.toLowerCase())} ›</a></div>` : ''}</div>`
    // v32 (дирижёр 04.11: «кнопку „свернуть“ — сюда, по центру, за пределы сайдбара»): SD_MIN_OUT — язычок «›» снаружи у левого края сайдбара по центру высоты, трапецией, цвета сайдбара (зеркало свёрнутого язычка); в шапке кнопки нет
    if (window.SD_MIN_OUT && !TAB1 && !NOTAB) box.insertAdjacentHTML('beforeend', `<button class="sd-mout" data-sdmin title="Свернуть вправо"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg></button>`)
    // v25–v28 (дирижёр 04.11: «несколько вариантов этой штуки, визуально ближе к нашему дизайну»), v29 (дирижёр 04.11: «все плохие — ближе к тому, как было, только трапеция и значок инфо, с тем, что сейчас в сайдбаре»): SD_PILL — t трапеция: фото того, что в сайдбаре, и значок «i» · t2 (v30, дирижёр 04.11: «цвет как у сайдбара, уже на 4 px») — то же, цвет подложки сайдбара, ширина 28 · a язычок цвета панели · b плашка «‹ фото» · c мини-шапка «‹ фото имя» · d только фото
    const PV = window.SD_PILL, chev = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8 10 12.5"/></svg>'
    if (PV) { pill.className = 'sd-pill sd-pill2 sd-pill2--' + (PV === 't2' ? 't sd-pill2--t2' : PV) + (pill.classList.contains('is-on') ? ' is-on' : ''); pill.innerHTML = PV === 't' || PV === 't2' ? `${img ? `<img src="${img}" alt="">` : ''}<i><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.3v3.6"/><circle cx="8" cy="5.2" r=".5" fill="currentColor" stroke="none"/></svg></i>` : PV === 'c' ? `<i>${chev}</i>${img ? `<img src="${img}" alt="">` : ''}<span><b>${esc(cur.title)}</b><small>${esc(cur.kind)}</small></span>` : PV === 'd' ? `${img ? `<img src="${img}" alt="">` : ''}<i>${chev}</i>` : PV === 'b' ? `<i>${chev}</i>${img ? `<img src="${img}" alt="">` : ''}` : `${img ? `<img src="${img}" alt="">` : ''}<i>${chev}</i>` }
    else pill.innerHTML = `${img ? `<img src="${img}" alt="">` : ''}<i>‹</i>`
    box.classList.add('is-on'); box.classList.toggle('is-mini', st.mini); pill.classList.toggle('is-on', st.mini)
    // v34 (дирижёр 04.11: «пусть это будет тот же язычок; убрать разделитель, лучше по контуру»): SD_TAB1 — «свернуть» и свёрнутый — один и тот же язычок: открыт — он у левого края сайдбара со «›», свернул — уезжает вместе с сайдбаром к краю окна и показывает фото и «i»;
    // линию между язычком и сайдбаром закрывает сам язычок, контур (верх, скос, левый край, скос, низ) — обводкой цвета рамки сайдбара
    // v35 (дирижёр 04.11: «язычок и сайдбар должны выезжать одинаково»): SD_TAB2 — язычок — часть сайдбара (внутри него, слева снаружи), едут одним движением;
    // свёрнутый сайдбар уезжает ровно на свою ширину — за краем окна остаётся только язычок (фото и «i»); тянуть по высоте — как в v31
    box.classList.toggle('sd--tab2', TAB2); box.classList.toggle('sd--ftfull', !!window.SD_FT_FULL) /* v36 (дирижёр 04.11: «кнопку — на всё место контейнера, а не внутри») */
    if (TAB2) { pill.classList.remove('is-on'); const ic = st.mini ? `${img ? `<img src="${img}" alt="">` : ''}<i><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.3v3.6"/><circle cx="8" cy="5.2" r=".5" fill="currentColor" stroke="none"/></svg></i>` : '<i><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg></i>'
      box.insertAdjacentHTML('beforeend', `<button class="sd-tab2${st.mini ? ' is-mini' : ''}" data-sdtab2 title="${st.mini ? 'Развернуть' : 'Свернуть вправо'}"${DRAG ? ' data-drag' : ''}>${ic}<svg class="sd-tab1-o" viewBox="0 0 28 104" preserveAspectRatio="none"><path d="M28 .5 .5 14.5v75L28 103.5" fill="none"/></svg></button>`) }
    if (TAB1) { pill.classList.add('is-on', 'sd-tab1'); pill.classList.toggle('is-open', !st.mini); pill.title = st.mini ? 'Развернуть' : 'Свернуть вправо'
      pill.insertAdjacentHTML('beforeend', '<svg class="sd-tab1-o" viewBox="0 0 28 104" preserveAspectRatio="none"><path d="M28 .5 .5 14.5v75L28 103.5" fill="none"/></svg>')
      if (!st.mini) { pill.querySelectorAll('img, i').forEach((x) => x.remove()); pill.insertAdjacentHTML('afterbegin', '<i><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg></i>') } }
    if (NOTAB) { pill.classList.remove('is-on'); box.classList.add('sd--notab'); const h = box.querySelector('.sd-hd'); h && h.insertAdjacentHTML('beforeend', '<button class="sd-sq sd-x" data-sdx title="Закрыть"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg></button>') }
    penPlace(); if (!st.mini) box.querySelector('.sd-bd').scrollTop = 0
  }
  addEventListener('scroll', penPlace, { passive: true }); addEventListener('resize', penPlace)
  const openSd = (sec, e, fresh) => { if (FLAT) { fresh = true; st.tab = 'p' } st.dir = 'in'; st.mini = false; const side = sec.querySelector('.gm-side'); if (st.side && st.side !== side) { st.stack = []; render() } st.side = side; st.sec = sec; if (fresh) st.stack = []; st.stack.push(e); render() }

  // вход из нижней строки — в фазе захвата, раньше подсказок и ссылок страницы
  document.addEventListener('click', (ev) => {
    if (PEN && TAB2 && ev.target.closest('[data-sdtab2]')) { if (st.drug) { st.drug = false; return } st.mini = !st.mini; if (!st.mini) st.pillY = null; st.dir = ''; render(); return }
    if (PEN && st.drug && ev.target.closest('.sd-pill')) { st.drug = false; return }
    if (PEN && TAB1 && !st.mini && ev.target.closest('.sd-pill')) { st.mini = true; st.pillY = null; render(); return }
    if (PEN) { if (ev.target.closest('.sd-pill')) { st.mini = false; st.dir = 'in'; render(); return } if (ev.target.closest('[data-sdmin]')) { st.mini = true; render(); return } }
    const sec = ev.target.closest('#feed section.gm, body > .sd-pen'); if (!sec) return
    const tm = ev.target.closest('.d3-tm'), pl = ev.target.closest('.d3-h[data-hc]')
    if ((tm || pl) && sec.matches('section.gm')) { ev.preventDefault(); ev.stopPropagation()
      if (tm) { const t = DB.team(tm.getAttribute('title')) || DB.team(+tm.querySelector('img')?.getAttribute('src').match(/(\d+)\.png/)?.[1]); if (t) openSd(sec, 'team:' + t.id, true) }
      else { const p = DB.player(+pl.dataset.hc.split('|')[1]); if (p) openSd(sec, 'player:' + p.id, true) }
      return }
    const tb = ev.target.closest('[data-sdtab]'); if (tb) { st.tab = tb.dataset.sdtab; st.dir = ''; render(); return }
    const go = ev.target.closest('[data-sd]'), back = ev.target.closest('[data-sdback]'), x = ev.target.closest('[data-sdx]'), cr = ev.target.closest('[data-sdi]')
    if (go) { st.tab = 'now'; st.dir = 'in'; st.stack.push(go.dataset.sd); render() }
    else if (back) { st.dir = 'out'; st.stack.pop(); render() }
    else if (cr) { st.dir = 'out'; st.stack = st.stack.slice(0, +cr.dataset.sdi + 1); render() }
    else if (x) { st.stack = []; render() }
  }, true)
  // страница перерисовала колонку — вернуть сайдбар в новую
  new MutationObserver(() => { if (st.stack.length && st.side && !st.side.isConnected) { const sec = document.querySelector('#feed section.gm'); st.sec = sec; st.side = sec?.querySelector('.gm-side'); render() } }).observe(document.body, { childList: true, subtree: true })
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && st.stack.length) { if (PEN && !NOTAB) st.mini = true; else st.stack = []; render() } })
})()
