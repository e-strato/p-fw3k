// «Все турниры» v3–v5 (лаба gs-tours, дирижёр 11.11: «все турниры должны выглядеть как главная v12 — умно, мощно; три новые версии на основе главной»).
// Как главная: две колонки (1fr + 360), плотно, чёрно-белое (фиолетовый — только точка «идёт»), футер; строка турнира раскрывается на месте — статистические мини-виджеты
//   идёт: ход турнира (день N из M) · матчи сейчас и дальше · лидеры (TI — база: серии W–L) · скоро: до старта · участники · фонд и формат · прошёл: чемпион · фонд · участники.
// lay: 'groups' (v3) — «Главные сейчас» карточками, ниже группы по месяцам · 'gantt' (v4) — календарь сезона полосами, ниже группы по играм ·
//   'live' (v5) — цифры сезона плитками и «Сейчас на турнирах» (матчи идущих турниров), ниже группы по месяцам.
// Справа: Фильтры (тир, команда) · Призовые 2026 по играм · Топ игроков TI 2026 · Чемпионы сезона. Данные — ../gs-home/_sch.js (Dota — база, остальное — ‼️ пример).
window.TOURS3 = (() => {
  const S = window.SCH, { esc, logo, name, gameIc, tourLogo, hm, LIVE } = S
  const P = new URLSearchParams(location.search), FIT = P.has('fit'), fitView = () => (innerWidth < 800 ? 'phone' : 'desk')
  const CFG = { view: FIT ? fitView() : 'desk', tab: 'now', game: 'all', tiers: new Set(), team: '', state: 'ok', open: undefined }
  let O = {}
  const pl = (n, a, b, c) => { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 12 || y > 14) ? b : c }
  const ARR = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>'
  const CHV = '<svg class="h11-chv" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 4 4 4-4"/></svg>'
  const CUP = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4.5 2.5h7v4a3.5 3.5 0 0 1-7 0zM8 10v3M5.5 13.5h5M4.5 4H2.5a2 2 0 0 0 2 3M11.5 4h2a2 2 0 0 1-2 3"/></svg>'
  const EXS = '<span class="hm-ex">пример</span>'
  const tierM = (n) => `<span class="h3-tier${n === 1 ? ' is-1' : ''}">Tier ${n}</span>`
  const hsh = (x) => [...String(x)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const isLive = (m) => LIVE.includes(m.state)
  const liveN = (t) => S.M.filter((m) => m.tour === t.id && isLive(m)).length
  const teamsOf = (t) => { const d = t.real && window.DB && window.DB.data.tours[t.id]; if (d && d.teams && d.teams.length) return d.teams
    return [...new Set(S.M.filter((m) => m.tour === t.id).flatMap((m) => [m.a, m.b]))] }
  const tq = () => CFG.team.trim().toLowerCase()
  const pass = (t) => (CFG.game === 'all' || t.game === CFG.game) && (!CFG.tiers.size || CFG.tiers.has(t.tier))
    && (!tq() || teamsOf(t).some((id) => (S.team(id).name + ' ' + (S.team(id).tag || '')).toLowerCase().includes(tq())))
  const all = () => (CFG.state === 'empty' ? [] : Object.values(S.T))
  const len = (t) => S.dayDiff(t.to) - S.dayDiff(t.from) + 1, dayN = (t) => -S.dayDiff(t.from) + 1
  // фонд в долларах — для сумм и полос (₩ и € — по грубому курсу)
  const usd = (t) => { const n = +String(t.prize || '').replace(/[^0-9]/g, ''); if (!n) return 0; return /₩/.test(t.prize) ? Math.round(n / 1350) : /€/.test(t.prize) ? Math.round(n * 1.1) : n }
  const money = (n) => (n >= 1e6 ? '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + ' млн' : n >= 1e3 ? '$' + Math.round(n / 1e3) + ' тыс.' : '$' + n)
  const status = (t) => { if (t.state === 'live') { const n = liveN(t); return n ? `<i class="sc-dot"></i><span class="mono">${n}</span> ${pl(n, 'матч идёт', 'матча идут', 'матчей идут')}` : `день <span class="mono">${dayN(t)}</span> из <span class="mono">${len(t)}</span>` }
    if (t.state === 'done') return 'завершён'
    const k = S.dayDiff(t.from); return k <= 0 ? 'сегодня' : k === 1 ? 'завтра' : `через <span class="mono">${k}</span> ${pl(k, 'день', 'дня', 'дней')}` }
  const logos = (t, max) => { const ids = teamsOf(t); if (!ids.length) return t.teams ? `<span class="t2-k mono">${t.teams} ${pl(t.teams, 'команда', 'команды', 'команд')}</span>` : '<span class="t2-k">участники позже</span>'
    return `<span class="t2-lg">${ids.slice(0, max).map((id) => logo(id, 20)).join('')}${ids.length > max ? `<small class="mono">+${ids.length - max}</small>` : ''}</span>` }

  // ── карточка главного турнира (как «Все турниры» v2)
  const card = (t) => `<div class="t2-c" data-go="${t.id}" role="link" tabindex="0">
      <span class="t2-c__b">${tourLogo(t, 64)}<span class="t2-c__g">${gameIc(t.game, 16)}</span><span class="t2-c__s">${status(t)}</span></span>
      <span class="t2-c__n"><b>${esc(t.name)}</b><small><span class="mono">${S.dm(t.from)} – ${S.dm(t.to)}</span>${t.where ? ' · ' + esc(t.where) : ''}</small></span>
      ${t.state === 'live' ? `<span class="t3-pg"><i style="width:${Math.min(100, Math.round(dayN(t) / len(t) * 100))}%"></i></span>` : ''}
      <span class="t2-c__f"><span class="mono t2-c__p">${esc(t.prize)}</span>${logos(t, 6)}</span></div>`

  // ── раскрытие строки турнира: статистические мини-виджеты по состоянию
  const mRow = (m) => { const sc = m.score, show = sc && (m.state === 'done' || isLive(m))
    return `<p class="t3-mr" data-m="${m.id}"><span class="t3-mr__s">${isLive(m) ? '<i class="sc-dot"></i>' : m.state === 'done' ? '<span>кон.</span>' : `<span class="mono">${m.state === 'tba' ? '—:—' : hm(m.start)}</span>`}</span>
      <span class="t3-mr__t">${logo(m.a, 16)}<span>${name(m.a, 'mid')}</span></span><b class="mono">${show ? sc.join(' : ') : 'vs'}</b><span class="t3-mr__t is-r"><span>${name(m.b, 'mid')}</span>${logo(m.b, 16)}</span></p>` }
  const cProg = (t) => { const p = Math.min(100, Math.round(dayN(t) / len(t) * 100)), left = len(t) - dayN(t)
    return ['Ход турнира', `<p class="h12-big"><b class="mono">${dayN(t)}</b><span>день из <span class="mono">${len(t)}</span> · осталось <span class="mono">${left}</span></span></p><span class="t3-pg"><i style="width:${p}%"></i></span><small class="t3-sub">${esc(t.stage || '')}${t.format ? ' · ' + esc(t.format) : ''}</small>`, 1] }
  const cMatches = (t) => { const L = S.M.filter((m) => m.tour === t.id).sort((a, b) => (isLive(b) - isLive(a)) || a.start.localeCompare(b.start)), N = L.filter((m) => m.state !== 'done').slice(0, 4), D = L.filter((m) => m.state === 'done').slice(-1)
    const X = [...N, ...D].slice(0, 4)
    return [`Матчи · сейчас и дальше${t.real ? '' : EXS}`, X.length ? `<div class="t3-ml">${X.map(mRow).join('')}</div>` : '<span class="h11-mut">Матчи объявят позже</span>', 2] }
  const cLead = (t) => { const ids = teamsOf(t); let R, ex = false
    if (t.real && window.DB) R = ids.map((id) => ({ id, s: window.DB.teamStats(t.id, id) })).filter((x) => x.s).sort((a, b) => (b.s.series[0] - b.s.series[1]) - (a.s.series[0] - a.s.series[1]) || b.s.maps[0] - a.s.maps[0]).slice(0, 4).map((x) => [x.id, x.s.series])
    if (!R || !R.length) { ex = true; R = ids.map((id) => [id, [1 + hsh(id + t.id) % 6, hsh(t.id + id) % 4]]).sort((a, b) => (b[1][0] - b[1][1]) - (a[1][0] - a[1][1])).slice(0, 4) }
    if (!R.length) return null
    return [`Лидеры · серии${ex ? EXS : ''}`, `<div class="t3-ld">${R.map(([id, s], i) => `<p><span class="mono">${i + 1}</span>${logo(id, 16)}<span class="h11-nm">${name(id, 'mid')}</span><b class="mono">${s[0]}–${s[1]}</b></p>`).join('')}</div>`, 1] }
  const cStart = (t) => { const k = Math.max(0, S.dayDiff(t.from))
    return ['До старта', `<p class="h12-big"><b class="mono">${k}</b><span>${pl(k, 'день', 'дня', 'дней')}</span></p><small class="t3-sub"><span class="mono">${S.dm(t.from)} – ${S.dm(t.to)}</span> · <span class="mono">${len(t)}</span> ${pl(len(t), 'день', 'дня', 'дней')}${t.where ? ' · ' + esc(t.where) : ''}</small>`, 1] }
  const cTeams = (t) => { const ids = teamsOf(t)
    return [`Участники${ids.length ? ` · <span class="mono">${ids.length}</span>` : ''}`, ids.length ? `<div class="t3-tm">${ids.slice(0, 16).map((id) => `<span title="${name(id)}">${logo(id, 24)}</span>`).join('')}${ids.length > 16 ? `<small class="mono">+${ids.length - 16}</small>` : ''}</div>` : `<span class="h11-mut">Объявят позже${t.teams ? ` · ждём <span class="mono">${t.teams}</span> ${pl(t.teams, 'команду', 'команды', 'команд')}` : ''}</span>`, 2] }
  const cFund = (t) => { const u = usd(t), mx = Math.max(...Object.values(S.T).filter((x) => x.game === t.game).map(usd))
    return ['Фонд и формат', `<p class="h12-big"><b class="mono">${esc(t.prize)}</b></p><span class="t3-pg is-thin"><i style="width:${mx ? Math.round(u / mx * 100) : 0}%"></i></span><small class="t3-sub">${u && mx ? `${u === mx ? 'крупнейший' : Math.round(u / mx * 100) + '% от крупнейшего'} в ${S.G[t.game].short} · ` : ''}${esc(t.format || '')}</small>`, 1] }
  const cChamp = (t) => ['Чемпион', t.winner ? `<p class="t3-ch">${logo(t.winner, 36)}<span><b>${name(t.winner)}</b><small>${CUP} ${esc(t.prize)} · <span class="mono">${S.dm(t.to)}</span></small></span></p>` : '<span class="h11-mut">Нет данных</span>', 1]
  const exOf = (t) => { const C = (t.state === 'live' ? [cProg(t), cMatches(t), cLead(t)] : t.state === 'soon' ? [cStart(t), cTeams(t), cFund(t)] : [cChamp(t), cTeams(t), cFund(t)]).filter(Boolean)
    return `<div class="h11-ex"><div class="h11-ex__in"><div class="h12-cs">${C.map(([h, b, sp]) => `<div class="h11-c h12-s${sp}"><small>${h}</small>${b}</div>`).join('')}</div>
      <div class="h11-act"><button class="h11-b is-main" data-go="${t.id}">Страница турнира</button><button class="h11-b" data-go="${t.id}">${t.state === 'done' ? 'Итоги' : 'Расписание'}</button></div></div></div>` }
  const row = (t) => { const done = t.state === 'done', op = CFG.open === t.id
    return `<div class="h11-r${op ? ' is-open' : ''}"><div class="t2-r${done ? ' is-done' : ''}" data-x="${t.id}" role="button" tabindex="0" aria-expanded="${op}">
      <span class="t2-r__d mono">${S.dm(t.from)} – ${S.dm(t.to)}</span>
      <span class="t2-r__n">${gameIc(t.game, 16)}${tourLogo(t, 24)}<span><b>${esc(t.name)}</b><small>${[t.state === 'live' ? t.stage : t.where, t.format].filter(Boolean).map(esc).join(' · ')}</small></span></span>
      ${tierM(t.tier)}${done ? `<span class="t2-r__w">${t.winner ? `${CUP}${logo(t.winner, 20)}<b>${S.name(t.winner, 'mid')}</b>` : '<span class="t2-k">—</span>'}</span>` : `<span class="t2-r__k">${logos(t, 5)}</span>`}
      <span class="t2-r__p mono">${esc(t.prize)}</span><span class="t2-r__s">${done ? '' : status(t)}${CHV}</span></div>${exOf(t)}</div>` }
  const grp = (head, L) => `<section class="hm-tg t3-g"><div class="hm-tg__h">${head}<small class="t3-gs"><span class="mono">${L.length}</span> ${pl(L.length, 'турнир', 'турнира', 'турниров')} · <span class="mono">${money(L.reduce((a, t) => a + usd(t), 0))}</span></small></div>${L.map(row).join('')}</section>`
  const byMonth = (L) => { const by = new Map(); L.forEach((t) => { const k = t.from.slice(0, 7); if (!by.has(k)) by.set(k, []); by.get(k).push(t) })
    return [...by.entries()].map(([k, ts]) => grp(`<b>${S.MONN[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}</b>`, ts)).join('') }
  const byGame = (L) => S.GAMES.map((g) => [g, L.filter((t) => t.game === g.id)]).filter(([, ts]) => ts.length).map(([g, ts]) => grp(`${gameIc(g.id, 16)}<b>${esc(g.name)}</b>`, ts)).join('')

  // ── v4: календарь сезона — полосы по датам (июнь — декабрь), линия «сегодня»
  const gantt = (L) => { if (!L.length) return ''; const from = '2026-06-01', to = '2026-12-31', D0 = Date.parse(from), span = Date.parse(to) - D0, x = (d) => Math.max(0, Math.min(100, (Date.parse(d) - D0) / span * 100))
    const MS = ['06', '07', '08', '09', '10', '11', '12'], now = x(new Date(S.NOW).toISOString().slice(0, 10))
    const R = L.filter((t) => t.to >= from).sort((a, b) => a.game.localeCompare(b.game) || a.from.localeCompare(b.from))
    return `<section class="h2-card t3-gt"><div class="h2-h"><h2>Календарь сезона</h2><small class="t3-gs">июнь — декабрь 2026 · Tier 1 — белым</small></div>
      <div class="t3-gt__w"><div class="t3-gt__m"><span></span><div>${MS.map((m) => `<span style="left:${x('2026-' + m + '-01')}%">${S.MONN[+m - 1].toLowerCase()}</span>`).join('')}</div></div>
      ${R.map((t) => `<div class="t3-gt__r" data-x="${t.id}"><span class="t3-gt__n">${gameIc(t.game, 14)}<span>${esc(t.short || t.name)}</span></span><div class="t3-gt__l"><i class="t3-gt__now" style="left:${now}%"></i>
        <span class="t3-gt__b${t.tier === 1 ? ' is-1' : ''}${t.state === 'live' ? ' is-live' : ''}${t.state === 'done' ? ' is-done' : ''}" style="left:${x(t.from)}%;width:${Math.max(1.2, x(t.to) - x(t.from))}%" title="${esc(t.name)} · ${S.dm(t.from)} – ${S.dm(t.to)} · ${esc(t.prize)}">${t.state === 'live' ? '<i class="sc-dot"></i>' : ''}</span></div></div>`).join('')}</div></section>` }
  // ── v5: цифры сезона и «Сейчас на турнирах»
  const kpi = (A) => { const lv = A.filter((t) => t.state === 'live'), ms = S.M.filter(isLive).length, sn = A.filter((t) => t.state === 'soon')
    const K = [['Идут', lv.length, 'турниров'], ['Матчей сейчас', ms, 'в эфире'], ['Фонд идущих', money(lv.reduce((a, t) => a + usd(t), 0)), 'в сумме'], ['Скоро', sn.length, (() => { const k = Math.min(...sn.map((t) => S.dayDiff(t.from))); return k <= 1 ? 'ближайший — завтра' : `ближайший через ${k} ${pl(k, 'день', 'дня', 'дней')}` })()]]
    return `<div class="t3-kp">${K.map(([l, v, s], i) => `<div class="h2-card t3-k"><small>${l}</small><b class="mono">${i === 1 && v ? '<i class="sc-dot"></i>' : ''}${v}</b><span>${s}</span></div>`).join('')}</div>` }
  const nowBlocks = (L) => { const lv = L.filter((t) => t.state === 'live').sort((a, b) => a.tier - b.tier || liveN(b) - liveN(a)); if (!lv.length) return ''
    return `<section class="t3-now"><div class="h11-h"><h2>Сейчас на турнирах</h2></div><div class="t3-nw">${lv.map((t) => { const M = S.M.filter((m) => m.tour === t.id && m.state !== 'done').sort((a, b) => (isLive(b) - isLive(a)) || a.start.localeCompare(b.start)).slice(0, 3)
      return `<div class="h2-card t3-nb"><div class="t3-nb__h" data-go="${t.id}">${gameIc(t.game, 16)}${tourLogo(t, 24)}<span><b>${esc(t.name)}</b><small>${esc(t.stage || '')}</small></span>${tierM(t.tier)}</div>
        <span class="t3-pg"><i style="width:${Math.min(100, Math.round(dayN(t) / len(t) * 100))}%"></i></span><small class="t3-sub">день <span class="mono">${dayN(t)}</span> из <span class="mono">${len(t)}</span> · <span class="mono">${esc(t.prize)}</span></small>
        ${M.length ? `<div class="t3-ml">${M.map(mRow).join('')}</div>` : '<span class="h11-mut">Сегодня матчей нет</span>'}</div>` }).join('')}</div></section>` }

  // ── правая колонка
  const filters = () => { const tc = (n) => all().filter((t) => t.tier === n).length
    return `<section class="h2-card t2-fl"><div class="h2-h"><h2>Фильтры</h2>${CFG.game !== 'all' || CFG.tiers.size || CFG.team ? '<button class="h2-ln" data-reset style="margin-left:auto">Сбросить</button>' : ''}</div>
      <div class="t2-fl__s"><small>Тир</small>${[1, 2, 3].map((n) => `<label class="t2-ck"><input type="checkbox" data-tier="${n}"${CFG.tiers.has(n) ? ' checked' : ''}>${tierM(n)}<span class="mono">${tc(n)}</span></label>`).join('')}</div>
      <div class="t2-fl__s"><small>Команда</small><input class="t2-in" type="search" placeholder="Название команды" value="${esc(CFG.team)}" data-team></div></section>` }
  const prizes = () => { const A = all().filter((t) => t.from.startsWith('2026')), R = S.GAMES.map((g) => [g, A.filter((t) => t.game === g.id).reduce((a, t) => a + usd(t), 0), A.filter((t) => t.game === g.id).length]).sort((a, b) => b[1] - a[1]), mx = Math.max(...R.map((r) => r[1])), tot = R.reduce((a, r) => a + r[1], 0)
    return `<section class="h2-card"><div class="h2-h"><h2>Призовые 2026</h2>${EXS}<span class="h4-sub">${money(tot)}</span></div><div class="t3-pz">${R.map(([g, v, n]) => `<p data-game="${g.id}">${gameIc(g.id, 16)}<span>${esc(g.short)}<small class="mono">${n}</small></span><span class="t3-pz__b"><i style="width:${mx ? Math.round(v / mx * 100) : 0}%"></i></span><b class="mono">${money(v)}</b></p>`).join('')}</div></section>` }
  const topPl = () => { if (!window.DB) return ''; const L = window.DB.playerStats('ti-2026').slice().sort((a, b) => b.pts - a.pts).slice(0, 5)
    return `<section class="h2-card"><div class="h2-h"><h2>Топ игроков</h2><span class="h4-sub">TI 2026 · очки</span></div><div class="h4-pl">${L.map((x, i) => { const p = window.DB.player(x.player) || { nick: x.player }
      return `<div class="h4-p"><span class="h3-r__i mono">${i + 1}</span>${p.photo ? `<img class="h4-p__ph" src="${esc(window.DB.url(p.photo))}" alt="">` : `<span class="h4-p__ph">${esc(p.nick[0])}</span>`}<span class="h4-p__n"><b>${esc(p.nick)}</b><small>${logo(x.team, 14)}${name(x.team, 'mid')} · <span class="mono">${x.k}/${x.d}/${x.a}</span></small></span><span class="h4-p__v"><b class="mono">${x.pts}</b></span></div>` }).join('')}</div></section>` }
  const champs = () => { const L = all().filter((t) => t.state === 'done' && t.winner).sort((a, b) => b.to.localeCompare(a.to)).slice(0, 5); if (!L.length) return ''
    return `<section class="h2-card"><div class="h2-h"><h2>Чемпионы сезона</h2></div><div class="t3-cl">${L.map((t) => `<p data-go="${t.id}">${logo(t.winner, 24)}<span><b>${name(t.winner, 'mid')}</b><small>${gameIc(t.game, 12)}${esc(t.name)}</small></span><b class="mono">${esc(t.prize)}</b></p>`).join('')}</div></section>` }
  const FT = { 'Разделы': ['Матчи', 'Турниры', 'Новости', 'Рейтинг команд', 'Трансферы', 'Фэнтези'], 'Игры': S.GAMES.map((g) => g.name),
    'Проект': ['О нас', 'Реклама', 'Контакты', 'Вакансии'], 'Помощь': ['Правила', 'Конфиденциальность', 'Источники данных', 'Обратная связь'] }
  const footer = () => `<footer class="h5-f"><div class="h5-f__top"><div class="h5-f__b"><span class="pt-brand"><span class="pt-logo">◆</span>GoatScout</span><small>Матчи, турниры, новости и статистика: Dota 2, CS2, LoL, Valorant, MLBB</small>
      <div class="h5-f__so">${['Telegram', 'VK', 'YouTube', 'Twitch', 'X'].map((x) => `<a href="#">${x}</a>`).join('')}</div></div>
      ${Object.entries(FT).map(([h, L]) => `<div class="h5-f__c"><b>${h}</b>${L.map((x) => `<a href="#">${esc(x)}</a>`).join('')}</div>`).join('')}</div>
    <div class="h5-f__bot"><span>© 2026 GoatScout</span><span class="h5-f__18">18+</span><span>Не связан с Valve, Riot Games и Moonton. Названия и логотипы — их владельцев</span><span class="h5-f__r">Данные: OpenDota, Liquipedia · Русский</span></div></footer>`

  function render() {
    document.body.classList.toggle('is-desk', CFG.view === 'desk'); document.body.classList.add('bw', 'h5d')
    const A = all(), L = A.filter(pass), live = L.filter((t) => t.state === 'live').sort((a, b) => a.tier - b.tier || liveN(b) - liveN(a))
    const soon = L.filter((t) => t.state === 'soon').sort((a, b) => a.from.localeCompare(b.from)), done = L.filter((t) => t.state === 'done').sort((a, b) => b.from.localeCompare(a.from))
    if (CFG.open === undefined) CFG.open = live[0] ? live[0].id : null
    const cnt = (g) => A.filter((t) => (g === 'all' || t.game === g) && (CFG.tab === 'done' ? t.state === 'done' : t.state !== 'done')).length
    const games = `<div class="h2-g">${[['all', 'Все']].concat(S.GAMES.map((g) => [g.id, gameIc(g.id, 16)])).map(([g, l]) => `<button class="${CFG.game === g ? 'is-on' : ''}" data-game="${g}">${l}<small class="mono">${cnt(g)}</small></button>`).join('')}</div>`
    let body
    if (CFG.state === 'skel') body = `<div class="t2-cs">${[0, 1].map(() => '<div class="t2-c"><span class="sk" style="height:120px"></span><span class="sk" style="width:60%;height:16px"></span></div>').join('')}</div>`
    else if (!L.length) body = `<div class="hm-empty"><b>${A.length ? 'Турниров не нашли' : 'Турниров пока нет'}</b>${A.length ? 'По этим фильтрам ничего нет<button data-reset>Сбросить фильтры</button>' : 'Календарь обновится, как только организаторы объявят даты'}</div>`
    else if (CFG.tab === 'done') body = done.length ? (O.lay === 'gantt' ? gantt(L) + byGame(done) : byMonth(done)) : '<div class="hm-empty"><b>Прошедших турниров нет</b>По этим фильтрам ничего нет</div>'
    else { const top = live.filter((t) => t.tier === 1).slice(0, 4), lvG = live.length ? grp('<i class="sc-dot"></i><b>Идут сейчас</b>', live) : ''
      if (O.lay === 'gantt') body = gantt(L) + byGame([...live, ...soon])
      else if (O.lay === 'live') body = kpi(A) + nowBlocks(L) + `<div class="h11-h"><h2>Все турниры</h2></div>` + lvG + byMonth(soon)
      else body = (top.length ? `<section class="t2-sec"><div class="h11-h"><h2>Главные сейчас</h2></div><div class="t2-cs">${top.map(card).join('')}</div></section>` : '') + lvG + byMonth(soon) }
    const nNow = A.filter((t) => t.state !== 'done').length, nDone = A.filter((t) => t.state === 'done').length
    document.getElementById('main').innerHTML = `<div class="t2-h"><h1>Турниры</h1><div class="h2-seg"><button class="${CFG.tab === 'now' ? 'is-on' : ''}" data-tab="now">Идут и скоро <small class="mono">${nNow}</small></button><button class="${CFG.tab === 'done' ? 'is-on' : ''}" data-tab="done">Прошли <small class="mono">${nDone}</small></button></div>${games}</div>
      <div class="h2-lay"><div class="h2-main">${body}</div><aside class="h2-side">${filters()}${prizes()}${topPl()}${champs()}</aside></div>${footer()}
      ${CFG.state === 'offline' ? `<div class="hm-off"><span><b>Нет сети</b> · данные на ${hm(new Date(S.NOW).toISOString())}</span><button data-retry>Обновить</button></div>` : ''}`
    if (CFG.focus) { const i = document.querySelector('[data-team]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length) } }
  }
  const toast = (t) => { let el = document.querySelector('.hm-toast'); if (!el) { el = document.createElement('div'); el.className = 'hm-toast'; document.body.append(el) } el.textContent = t; clearTimeout(el._t); el.style.display = ''; el._t = setTimeout(() => (el.style.display = 'none'), 2600) }
  const goTour = (id) => { const x = S.T[id]; if (x.id === 'ti-2026' || x.id === 'universe-ep7') location.href = '../gs-tournament/v46-hs.html' + (FIT ? '?fit=1' : ''); else toast(`${x.name} — страница турнира (в лабе открыта только TI 2026)`) }
  const toggle = (id) => { const was = CFG.open === id
    document.querySelectorAll('.h11-r.is-open').forEach((r) => { r.classList.remove('is-open'); r.querySelector('[data-x]').setAttribute('aria-expanded', 'false') })
    CFG.open = was ? null : id; if (was) return
    const r = document.querySelector(`.h11-r [data-x="${id}"]`); if (!r) return; const w = r.closest('.h11-r'); w.classList.add('is-open'); r.setAttribute('aria-expanded', 'true'); return w }

  function mount(o = {}) {
    O = o
    document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s)
      const tb = q('[data-tab]'); if (tb) { CFG.tab = tb.dataset.tab; CFG.open = undefined; render(); return }
      const g = q('[data-game]'); if (g) { CFG.game = g.dataset.game; render(); return }
      if (q('[data-reset]')) { CFG.game = 'all'; CFG.tiers.clear(); CFG.team = ''; render(); return }
      if (q('[data-retry]')) { CFG.state = 'ok'; render(); return }
      const go = q('[data-go]'); if (go) { goTour(go.dataset.go); return }
      const m = q('[data-m]'); if (m) { const x = S.M.find((y) => y.id === m.dataset.m); if (x && x.href) location.href = x.href + (FIT ? '?fit=1' : ''); else toast('Страница матча — пример: в лабе открыта только PARIVISION — Team Spirit'); return }
      if (q('.h11-ex')) return
      const gt = q('.t3-gt__r'); if (gt) { const w = toggle(gt.dataset.x); if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
      const x = q('[data-x]'); if (x) { toggle(x.dataset.x); return } })
    document.addEventListener('change', (e) => { const t = e.target.closest('[data-tier]'); if (t) { const n = +t.dataset.tier; t.checked ? CFG.tiers.add(n) : CFG.tiers.delete(n); render() } })
    document.addEventListener('input', (e) => { if (e.target.matches('[data-team]')) { CFG.team = e.target.value; CFG.focus = true; render(); CFG.focus = false } })
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches && e.target.matches('.t2-r, .t2-c')) e.target.click() })
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'desk', label: 'Компьютер 1440' }, { v: 'phone', label: 'Телефон 390' }] },
        { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'ok', label: 'Обычный' }, { v: 'empty', label: 'Турниров нет' }, { v: 'offline', label: 'Нет сети' }, { v: 'skel', label: 'Загрузка' }] }],
      set(k, x) { if (k === 'view') CFG.view = x; if (k === 'state') CFG.state = x; render() },
      caption: () => 'Сейчас — 21.08.2026. Dota 2 — база (TI 2026: лидеры, игроки). ‼️ CS2, LoL, Valorant, MLBB — пример; призовые ₩ и € пересчитаны в $ грубо' }
    if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render() } })
    render() }
  return { mount }
})()

;(() => {
  const G = 20
  const fit = () => document.querySelectorAll('.h2-lay > .h2-side').forEach((c) => {
    if (!document.body.classList.contains('is-desk')) { c.style.position = c.style.top = ''; return }
    Object.assign(c.style, { position: 'sticky', top: Math.min(G, innerHeight - c.offsetHeight - G) + 'px' }) })
  addEventListener('resize', fit); addEventListener('load', fit); new ResizeObserver(fit).observe(document.body)
})()
