// Виджет замен, заход 2 (дирижёр 20.10: «так же, как с турниром: по частям, сначала самое главное»).
// Главное: составы двух команд матча, заменённые игроки видны сразу (статус замены — тихой подписью), клик по игроку —
// карточка-профиль под строкой, как в виджете турнира v7 (фон затемнён, тап мимо — закрыть).
// R2.render(узел, версия): 1 — обе команды списком · 2 — вкладки · 3 — две колонки · 4 — только изменения · 5 — по позициям лицом к лицу ·
// 6 — аватары рядами · 7 — сначала новость о заменах, ниже аватары (шапка — сам матч) · 8–11 — на основе 7. 320×400, скролл внутри.
(() => {
  const MATCH = { when: 'Сегодня, 18:00', tour: 'PARI Universe · группа A' }
  const TEAMS = [
    { id: '1W', name: '1w Team', players: [['Shad', 'Керри', { was: 'Pure', st: 'на турнир', src: '1win Dota2 в X, 17.09', at: '17.09' }], ['bzm', 'Мид'], ['33', 'Хард'], ['Ari', 'Поддержка'], ['Whitemon', 'Поддержка']] },
    { id: 'AUR', name: 'Aurora', players: [['skiter', 'Керри', { was: 'Nightfall', st: 'навсегда', src: 'Aurora в X, 14.10', at: '14.10' }], ['Stojkov', 'Мид', { was: 'Mikoto', st: 'на этот матч', src: 'Aurora в X, сегодня', at: 'сегодня, 15:42', fresh: true }], ['Ws', 'Хард'], ['Mira', 'Поддержка'], ['kaori', 'Поддержка']] },
  ]
  const subs = TEAMS.reduce((n, t) => n + t.players.filter(p => p[2]).length, 0)
  const hash = n => [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)
  const rank = n => 20 + hash(n) % 180
  const form = n => { let x = hash(n); return [0, 1, 2, 3, 4].map(() => (x = (x * 1103515245 + 12345) % 2147483648, (x >> 8) % 5 < 3 ? 'W' : 'L')) }
  const ini = n => n.slice(0, 2).toUpperCase()
  const ic = { swap: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="flex:none"><path d="M3 5h10m0 0-3-3m3 3-3 3M13 11H3m0 0 3-3m-3 3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' }

  // Строка игрока: имя, роль; у замены — «вместо X · на турнир» тихой подписью
  const prow = (t, [n, role, sub], pick, i) => `<div class="r2-p ${sub ? 'is-sub' : ''} ${pick === n ? 'sel' : ''}" data-team="${n}">
    <span class="r2-p__pos">${i + 1}</span><span class="r2-p__main"><span class="r2-p__n">${n}</span>
    <span class="r2-p__s">${sub ? `вместо ${sub.was} · ${sub.st}` : role}</span></span>${sub ? `<span class="r2-tag">замена</span>` : ''}</div>`
  const thead = t => { const k = t.players.filter(p => p[2]).length
    return `<div class="r2-th"><span class="w-logo">${t.id}</span><b>${t.name}</b>${k ? `<span class="w-cap">${k} ${k === 1 ? 'замена' : 'замены'}</span>` : ''}</div>` }
  const note = `<div class="tt-st r2-note"><span class="r2-note__i">${ic.swap}</span><span class="t2-st__m">Состав изменился · ${subs} замены</span><span class="tt-st__r">2 мин назад</span></div>`
  const head = `<div class="w-hd tt-hd2"><span class="tt-hd2__t"><b>Составы на матч</b><span class="w-cap">${MATCH.when} · ${MATCH.tour}</span></span></div>`

  const matchHead = `<div class="r2-mh"><div class="r2-mh__t"><span class="w-logo r2-mh__l">${TEAMS[0].id}</span><b>${TEAMS[0].name}</b></div>
    <div class="r2-mh__c"><span class="t2-chip t2-chip--today">18:00</span><span class="w-cap">${MATCH.tour}</span></div>
    <div class="r2-mh__t"><span class="w-logo r2-mh__l">${TEAMS[1].id}</span><b>${TEAMS[1].name}</b></div></div>`
  // Новости о заменах — с источником и ссылкой (v17–v19, дирижёр 20.10: «понятно, откуда это; ссылки на новости; может, бегущей строкой»)
  const NEWS = [
    ['сегодня, 15:42', 'Aurora', 'Stojkov заменит Mikoto на этот матч', 'Aurora в X'],
    ['14.10', 'Aurora', 'skiter — новый керри, Nightfall покинул состав', 'Aurora в X'],
    ['17.09', '1w Team', 'Shad сыграет вместо Pure на турнире — визы', '1win Dota2 в X'],
  ]
  // в строке замены источник — только иконкой ↗ (подсказка — название источника)
  const iconLink = src => `<a class="r2-ilink" href="#" onclick="return false" title="Новость: ${src}" aria-label="Новость: ${src}"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3H3.5A.5.5 0 0 0 3 3.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10M9 3h4v4M13 3 7 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
  const newsOf = n => ({ Shad: NEWS[2], skiter: NEWS[1], Stojkov: NEWS[0] })[n]
  const link = (src, cls = '') => `<a class="r2-src ${cls}" href="#" onclick="return false" title="Открыть новость">${src} ↗</a>`
  // Карточка игрока — как профиль в виджете турнира v7
  const card = n => { const t = TEAMS.find(x => x.players.some(p => p[0] === n)), [, role, sub] = t.players.find(p => p[0] === n)
    return `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof">
      <div class="t2-p__top"><span class="w-logo t3-av">${ini(n)}</span><span class="t3-prof__n"><b>${n}</b><span class="w-cap">${t.name} · ${role} · #${rank(n)}</span></span>
      <span class="t3-dots">${form(n).map(c => `<i class="${c}"></i>`).join('')}</span></div>
      ${sub ? `<div class="r2-c__sub">${ic.swap}<span>Вместо <b>${sub.was}</b></span><span class="t2-chip t2-chip--later">${sub.st}</span></div><div class="w-cap r2-c__src">Источник: ${sub.src}</div>`
        : `<div class="w-cap r2-c__src">Основной состав</div>`}</div>` }

  // Шаг 2 — поиск игрока по базе (лаба widget-roster-3, o.db): instant — сразу результат · loading — сначала загрузка · ai — плюс «Спросить ИИ»
  // Результаты (Т2.6): найден · найден, данных мало · не найден · ошибка базы. В примере: Shad — найден, skiter — мало данных, Stojkov — не найден, Mira — ошибка.
  const DBST = { skiter: 'little', Stojkov: 'none', Mira: 'error' }
  const AI = { Stojkov: 'Мидер из Северной Македонии, 21 год. Два сезона в тир-2 (EEU), в этом году — стендин в трёх командах. Лучший герой — Puck.', skiter: 'Керри из Словакии. До Aurora — Team Liquid и Tundra; 2 победы на тир-1 турнирах. В Aurora с 14.10.', Shad: 'Керри, свободный агент. Играл за 1w Team в квалификациях; на PGL Wallachia S9 заменял Pure (визы). Сильные герои — Terrorblade, Morphling.' }
  const aiText = n => AI[n] || `${n} — игрок основного состава. По открытым источникам: регулярно играет тир-1 турниры, последние 30 дней — 18 матчей.`
  const dbCard = (n, s) => {
    const t = TEAMS.find(x => x.players.some(p => p[0] === n)), [, role, sub] = t.players.find(p => p[0] === n), st = s.fixed && s.fixed[n] ? 'found' : (DBST[n] || 'found')
    const subLine = sub ? `<div class="r2-c__sub">${ic.swap}<span>Вместо <b>${sub.was}</b></span><span class="t2-chip t2-chip--later">${sub.st}</span></div>` : ''
    const shell = inner => `<div class="t2-ov" data-unpick></div><div class="t2-p t2-p--anchor t3-prof">${inner}</div>`
    if ((s.db === 'loading' || s.retrying === n) && !(s.loaded && s.loaded[n])) return shell(`<div class="t2-p__top"><span class="w-logo t3-av r2-sh"></span><span class="t3-prof__n"><b>${n}</b><span class="r2-sh r2-sh--l"></span></span></div>
      <div class="r2-sh r2-sh--b"></div><div class="w-cap r2-c__src">Ищем в базе Dota 2…</div>`)
    const top = (av, cap, right = '') => `<div class="t2-p__top"><span class="w-logo t3-av">${av}</span><span class="t3-prof__n"><b>${n}</b><span class="w-cap">${cap}</span></span>${right}</div>`
    const ai = s.db === 'ai' || s.cardv ? (s.asked && s.asked[n] ? `<div class="r2-ai"><span class="r2-ai__t">ИИ</span><span>${aiText(n)}</span></div><div class="w-cap r2-c__src">Собрано ИИ из открытых источников — может быть неточно</div>`
      : `<button class="r2-btn r2-btn--ghost" data-ask="${n}">✦ Спросить ИИ об игроке</button>`) : ''
    const prof0 = s.cardv === 'page' ? `<a class="r2-btn r2-btn--ghost r2-prof" href="/p-fw3k/site/player.html" target="_blank" rel="noopener">Профиль игрока ›</a>` : ''
    const nw0 = newsOf(n), ex0 = s.cardv && nw0 ? `<div class="r2-cn"><div class="r2-nl__h">${nw0[2]}</div><div class="r2-nl__m"><span>${nw0[0]}</span>${link(nw0[3])}</div></div>` : ''
    if (st === 'little') return shell(top(ini(n), `${t.name} · ${role}`) + subLine + `<div class="r2-msg"><b>Данных мало</b><span>Найден в базе, но сыграл меньше 5 матчей на про-сцене — рейтинга и формы пока нет.</span></div>` + ex0 + ai + prof0)
    if (st === 'none') return shell(top('?', `${t.name} · ${role}`) + subLine + `<div class="r2-msg"><b>В базе не найден</b><span>Новый игрок — данные появятся после первых матчей.</span></div>` + ex0 + ai + prof0)
    if (st === 'error') return shell(top(ini(n), `${t.name} · ${role}`) + subLine + `<div class="r2-msg r2-msg--err"><b>Не удалось загрузить</b><span>База Dota 2 не ответила. Остальное на странице работает.</span><button class="r2-btn" data-retry="${n}">Повторить</button></div>`)
    const nw = newsOf(n), extra = s.cardv && nw ? `<div class="r2-cn"><div class="r2-nl__h">${nw[2]}</div><div class="r2-nl__m"><span>${nw[0]}</span>${link(nw[3])}</div></div>` : ''
    const prof = s.cardv === 'page' ? `<a class="r2-btn r2-btn--ghost r2-prof" href="/p-fw3k/site/player.html" target="_blank" rel="noopener">Профиль игрока ›</a>` : ''
    return shell(top(ini(n), `${t.name} · ${role} · #${rank(n)}`, `<span class="t3-dots">${form(n).map(c => `<i class="${c}"></i>`).join('')}</span>`) + subLine + (s.cardv ? extra : sub ? `<div class="w-cap r2-c__src">Источник: ${sub.src}</div>` : `<div class="w-cap r2-c__src">Основной состав</div>`) + ai + prof)
  }

  // v6 (cardv = 'go'): клик по игроку — «страница» игрока на весь виджет, назад стрелкой
  const playerPage = (n, s) => { const t = TEAMS.find(x => x.players.some(p => p[0] === n)), [, role, sub] = t.players.find(p => p[0] === n), nw = newsOf(n), st = DBST[n] || 'found'
    return `<div class="w-hd tt-hd2"><button class="tt-arr" data-unpick aria-label="Назад">‹</button><span class="tt-hd2__t"><b>${n}</b><span class="w-cap">${t.name} · ${role}</span></span></div>
      <div class="w-scroll"><div class="w-bd r2-pp">
        <div class="r2-pp__hero"><span class="w-logo r2-pp__av">${st === 'none' ? '?' : ini(n)}</span><div><b>${n}</b><span class="w-cap">${st === 'found' ? `#${rank(n)} в мире` : st === 'none' ? 'нет в базе' : 'данных мало'}</span>
          ${st === 'found' ? `<span class="t3-dots">${form(n).map(c => `<i class="${c}"></i>`).join('')}</span>` : ''}</div></div>
        ${sub ? `<div class="r2-c__sub">${ic.swap}<span>Вместо <b>${sub.was}</b></span><span class="t2-chip t2-chip--later">${sub.st}</span></div>` : ''}
        ${nw ? `<div class="w-lbl" style="margin-top:16px">Новость</div><div class="r2-cn" style="margin-top:0"><div class="r2-nl__h">${nw[2]}</div><div class="r2-nl__m"><span>${nw[0]}</span>${link(nw[3])}</div></div>` : ''}
        ${st === 'none' ? `<div class="r2-msg"><b>В базе не найден</b><span>Новый игрок — данные появятся после первых матчей.</span></div>` : st === 'little' ? `<div class="r2-msg"><b>Данных мало</b><span>Меньше 5 матчей на про-сцене.</span></div>` : ''}
        ${s.asked && s.asked[n] ? `<div class="r2-ai"><span class="r2-ai__t">ИИ</span><span>${aiText(n)}</span></div><div class="w-cap r2-c__src">Собрано ИИ из открытых источников — может быть неточно</div>` : `<button class="r2-btn r2-btn--ghost" data-ask="${n}">✦ Спросить ИИ об игроке</button>`}
        <a class="r2-btn r2-btn--ghost r2-prof" href="/p-fw3k/site/player.html" target="_blank" rel="noopener">Открыть полную страницу ↗</a>
      </div></div>` }

  // v7 поиска (cardv = 'page2', дирижёр 20.10: «всё совместить, основа v6»): страница игрока на весь виджет —
  // сначала «Ищем игрока в базе», потом блоки: данные · замена · новость; нет данных — «Спросить ИИ»; ошибка — «Повторить»;
  // внизу, прилеплена, «Открыть профиль игрока».
  const playerPage2 = (n, s) => { const t = TEAMS.find(x => x.players.some(p => p[0] === n)), [, role, sub] = t.players.find(p => p[0] === n), nw = newsOf(n)
    const st = s.fixed && s.fixed[n] ? 'found' : (DBST[n] || 'found'), loading = !(s.loaded && s.loaded[n])
    const hd = `<div class="w-hd tt-hd2"><button class="tt-arr" data-unpick aria-label="Назад">${'<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</button><span class="tt-hd2__t"><b>${n}</b><span class="w-cap">${t.name} · ${role}</span></span></div>`
    const foot = `<div class="r2-pf"><a class="r2-btn r2-pf__b" href="/p-fw3k/site/player.html" target="_blank" rel="noopener">Открыть профиль игрока</a></div>`
    const blk = (title, inner, cls = '') => `<div class="r2-blk ${cls}">${title ? `<div class="r2-blk__t">${title}</div>` : ''}${inner}</div>`
    if (loading && ['head', 'info', 'phrase', 'fold'].includes(s.pp)) return `<div class="w-hd r2-ph"><button class="tt-arr" data-unpick aria-label="Назад"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="w-logo r2-ph__av r2-sh"></span><span class="tt-hd2__t"><b>${n}</b><span class="w-cap">${t.name} · ${role}</span></span></div><div class="w-scroll"><div class="w-bd r2-pp"><span class="r2-sh r2-sh--b"></span><span class="r2-sh r2-sh--b"></span><div class="w-cap r2-pp__wait">Ищем игрока в базе Dota 2…</div></div></div>` + foot
    if (loading) return hd + `<div class="w-scroll"><div class="w-bd r2-pp">${blk('', `<div class="r2-pp__hero"><span class="w-logo r2-pp__av r2-sh"></span><div style="flex:1"><span class="r2-sh r2-sh--l"></span><span class="r2-sh r2-sh--l" style="width:80px"></span></div></div>`)}
      ${blk('', '<span class="r2-sh r2-sh--b" style="margin:0"></span>')}<div class="w-cap r2-pp__wait">Ищем игрока в базе Dota 2…</div></div></div>` + foot
    const askAI = s.asked && s.asked[n] ? blk('<span class="r2-ai__t">ИИ</span> Что известно', `<div class="r2-pp__txt">${aiText(n)}</div><div class="w-cap" style="margin-top:6px">Собрано ИИ из открытых источников — может быть неточно</div>`)
      : `<button class="r2-btn r2-btn--ghost" data-ask="${n}">✦ Спросить ИИ об игроке</button>`
    const data = st === 'found' ? blk('Профиль', `<div class="r2-pp__hero"><span class="w-logo r2-pp__av">${ini(n)}</span><div><b>${n}</b><span class="w-cap">#${rank(n)} в мире · ${role}</span>
        <span class="t3-dots">${form(n).map(c => `<i class="${c}"></i>`).join('')}</span></div></div>`)
      : st === 'error' ? blk('', `<div class="r2-msg r2-msg--err" style="margin:0"><b>Не удалось загрузить</b><span>База Dota 2 не ответила.</span><button class="r2-btn" data-retry="${n}">Повторить</button></div>`)
      : blk('', `<div class="r2-pp__hero"><span class="w-logo r2-pp__av">?</span><div><b>${n}</b><span class="w-cap">${st === 'none' ? 'Данных об игроке в базе нет' : 'Данных мало — меньше 5 матчей'}</span></div></div>`) + askAI
    const swap = sub ? blk('Замена', `<div class="r2-c__sub" style="margin:0;padding:0;border:0">${ic.swap}<span>Вместо <b>${sub.was}</b></span><span class="t2-chip t2-chip--later">${sub.st}</span></div>`) : ''
    const news = nw ? blk('Новость', `<div class="r2-nl__h">${nw[2]}</div><div class="r2-nl__m"><span>${nw[0]}</span>${link(nw[3])}</div>`) : ''
    // v8–v11 — подача (s.pp): tabs · hero · slide · flat
    const pp = s.pp, body = `${data}${swap}${news}${st === 'found' ? askAI : ''}`
    if (pp === 'tabs') { const tab = s.ppTab || 0, tabs = ['Профиль', 'Новости', 'ИИ']
      const pane = tab === 0 ? data + swap : tab === 1 ? (news || blk('', '<div class="w-cap">Новостей нет</div>')) : (s.asked && s.asked[n] ? askAI : `<button class="r2-btn r2-btn--ghost" data-ask="${n}">✦ Спросить ИИ об игроке</button>`)
      return hd + `<div class="w-seg">${tabs.map((x, i) => `<button class="${i === tab ? 'is-on' : ''}" data-pptab="${i}">${x}</button>`).join('')}</div><div class="w-scroll"><div class="w-bd r2-pp">${pane}</div></div>` + foot }
    if (pp === 'hero') { const hero = `<div class="r2-hero"><span class="w-logo r2-hero__av">${st === 'found' ? ini(n) : '?'}</span><div class="r2-hero__m"><b>${n}</b><span class="w-cap">${t.name} · ${role}${st === 'found' ? ' · #' + rank(n) : ''}</span>
        ${sub ? `<span class="t2-chip t2-chip--later r2-hero__st">${ic.swap} вместо ${sub.was} · ${sub.st}</span>` : ''}</div></div>`
      const rest = (st === 'found' ? blk('', `<div class="r2-blk__t" style="margin:0">Форма <span class="t3-dots">${form(n).map(c => `<i class="${c}"></i>`).join('')}</span></div>`)
        : st === 'error' ? data : blk('', `<div class="r2-pp__txt">${st === 'none' ? 'Данных об игроке в базе нет' : 'Данных мало — меньше 5 матчей'}</div>`) + askAI) + news + (st === 'found' ? askAI : '')
      return hd.replace(/<span class="tt-hd2__t">.*?<\/span><\/span>/, '<span class="tt-hd2__t"><b>Игрок</b></span>') + `<div class="w-scroll"><div class="w-bd r2-pp">${hero}${rest}</div></div>` + foot }
    if (pp === 'flat') return hd + `<div class="w-scroll"><div class="w-bd r2-pp r2-flat">${body}</div></div>` + foot
    // v13–v15 (info · phrase · fold): без формы, сверху вниз — общая информация → новость → обзор ИИ (дирижёр 20.10)
    if (pp === 'info' || pp === 'phrase' || pp === 'fold') {
      const back = '<button class="tt-arr" data-unpick aria-label="Назад"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      const head = `<div class="w-hd r2-ph">${back}<span class="w-logo r2-ph__av">${st === 'none' ? '?' : ini(n)}</span><span class="tt-hd2__t"><b>${n}</b><span class="w-cap">${t.name} · ${role}</span></span></div>`
      if (st === 'error') return head + `<div class="w-scroll"><div class="w-bd r2-pp">${blk('', `<div class="r2-msg r2-msg--err" style="margin:0"><b>Не удалось загрузить</b><span>База Dota 2 не ответила.</span><button class="r2-btn" data-retry="${n}">Повторить</button></div>`)}</div></div>` + foot
      const kv = [['Команда', t.name], ['Роль', role], ['Рейтинг', st === 'found' ? `#${rank(n)} в мире` : '—']].concat(sub ? [['Замена', `вместо ${sub.was} · ${sub.st}`]] : [])
      const noData = st === 'found' ? '' : `<div class="r2-pp__txt r2-pp__nod">${st === 'none' ? 'Об игроке в базе нет данных' : 'Данных мало — меньше 5 матчей на про-сцене'}</div>`
      const general = pp === 'phrase'
        ? `<div class="r2-pp__txt">${role} ${t.name}${st === 'found' ? `, #${rank(n)} в мире` : ''}.${sub ? ` ${sub.st === 'навсегда' ? 'Теперь в основном составе' : sub.st === 'на турнир' ? 'На этот турнир заменяет' : 'На этот матч заменяет'} ${sub.was}.` : ''}</div>${noData}`
        : `<dl class="r2-kv">${kv.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>${noData}`
      const newsB = nw ? `<div class="r2-nl__h">${nw[2]}</div><div class="r2-nl__m"><span>${nw[0]}</span>${link(nw[3])}</div>` : ''
      const aiB = pp === 'phrase' || (s.asked && s.asked[n]) ? `<div class="r2-pp__txt">${aiText(n)}</div><div class="w-cap" style="margin-top:6px">Собрано ИИ из открытых источников — может быть неточно</div>`
        : `<button class="r2-btn r2-btn--ghost" data-ask="${n}" style="margin-top:0">✦ Собрать обзор ИИ</button>`
      const sec = (k, title, inner, open = true) => pp === 'fold'
        ? `<div class="r2-fold ${open ? 'is-open' : ''}"><button class="r2-fold__h" data-fold="${k}"><span>${title}</span><span class="r2-fold__c">${open ? '−' : '+'}</span></button>${open ? `<div class="r2-fold__b">${inner}</div>` : ''}</div>`
        : blk(title, inner)
      const op = s.folds || { g: true }
      const parts = [sec('g', 'Общая информация', general, pp !== 'fold' || !!op.g)].concat(newsB ? [sec('n', 'Новость', newsB, pp !== 'fold' || !!op.n)] : [])
        .concat([sec('a', '<span class="r2-ai__t">ИИ</span> Обзор', aiB, pp !== 'fold' || !!op.a)])
      return head + `<div class="w-scroll"><div class="w-bd r2-pp r2-flat">${parts.join('')}</div></div>` + foot }
    // v12 (head): игрок — в шапке (фото, имя, команда, роль, рейтинг); ниже без рамок только блоки с инфой — есть она или нет
    if (pp === 'head') {
      const back = '<button class="tt-arr" data-unpick aria-label="Назад"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      const head = `<div class="w-hd r2-ph">${back}<span class="w-logo r2-ph__av">${st === 'none' ? '?' : ini(n)}</span><span class="tt-hd2__t"><b>${n}</b><span class="w-cap">${t.name} · ${role}${st === 'found' ? ' · #' + rank(n) : ''}</span></span></div>`
      const info = st === 'found' ? blk('Форма', `<span class="t3-dots">${form(n).map(c => `<i class="${c}"></i>`).join('')}</span>`)
        : st === 'error' ? blk('', `<div class="r2-msg r2-msg--err" style="margin:0"><b>Не удалось загрузить</b><span>База Dota 2 не ответила.</span><button class="r2-btn" data-retry="${n}">Повторить</button></div>`)
        : blk('Данные', `<div class="r2-pp__txt">${st === 'none' ? 'Об игроке в базе нет данных' : 'Данных мало — меньше 5 матчей на про-сцене'}</div>`) + askAI
      return head + `<div class="w-scroll"><div class="w-bd r2-pp r2-flat">${info}${swap}${news}${st === 'found' ? askAI : ''}</div></div>` + foot }
    if (pp === 'slide') return `<div class="r2-slide ${s.slidFor === n ? 'is-static' : ''}">${hd}<div class="w-scroll"><div class="w-bd r2-pp">${body}</div></div>${foot}</div>`
    return hd + `<div class="w-scroll"><div class="w-bd r2-pp">${body}</div></div>` + foot }

  const V = { // 1–3; 4–7 добавлены ниже
    1: s => head + note + `<div class="w-scroll"><div class="w-bd">${TEAMS.map(t => thead(t) + t.players.map((p, i) => prow(t, p, s.pick, i)).join('')).join('<div style="height:12px"></div>')}</div></div>`,
    2: s => { const t = TEAMS[s.tab]
      return head + note + `<div class="w-seg">${TEAMS.map((x, i) => { const k = x.players.filter(p => p[2]).length
        return `<button class="${i === s.tab ? 'is-on' : ''}" data-tab="${i}">${x.name}${k ? ` · ${k}` : ''}</button>` }).join('')}</div>`
        + `<div class="w-scroll"><div class="w-bd">${t.players.map((p, i) => prow(t, p, s.pick, i)).join('')}</div></div>` },
    3: s => head + note + `<div class="w-scroll"><div class="r2-cols">${TEAMS.map(t => `<div class="r2-col">${thead(t)}${t.players.map((p, i) => prow(t, p, s.pick, i)).join('')}</div>`).join('')}</div></div>`,
  }

  // v4–v7 — другие подходы (дирижёр 20.10: «ни один не нравится, предложи ещё»)
  const changes = () => TEAMS.flatMap(t => t.players.filter(p => p[2]).map(p => [t, p]))
  const chRow = ([t, [n, role, sub]], pick) => `<div class="r2-ch ${pick === n ? 'sel' : ''}" data-team="${n}"><span class="w-logo r2-ch__l">${t.id}</span>
    <span class="r2-ch__m"><span class="r2-ch__w"><s>${sub.was}</s><span class="r2-ch__a">→</span><b>${n}</b></span><span class="w-cap">${t.name} · ${role}</span></span><span class="t2-chip t2-chip--later r2-ch__st">${sub.st}</span></div>`
  const ROLES = ['Керри', 'Мид', 'Хард', 'Поддержка 4', 'Поддержка 5']
  const ava = (t, [n, , sub], pick) => `<div class="r2-av ${sub ? 'is-sub' : ''} ${pick === n ? 'sel' : ''}" data-team="${n}"><span class="r2-av__c">${ini(n)}${sub ? `<i class="r2-av__b">${ic.swap}</i>` : ''}</span><span class="r2-av__n">${n}</span></div>`
  const strip = (t, pick) => `<div class="r2-strip">${thead(t)}<div class="r2-avs">${t.players.map(p => ava(t, p, pick)).join('')}</div></div>`
  Object.assign(V, {
    4: s => head + note + `<div class="w-scroll"><div class="w-bd">${changes().map(c => chRow(c, s.pick)).join('')}
      <button class="r2-all" data-all>Составы целиком</button>${s.all ? TEAMS.map(t => thead(t) + t.players.map((p, i) => prow(t, p, s.pick, i)).join('')).join('<div style="height:12px"></div>') : ''}</div></div>`,
    5: s => head + note + `<div class="w-scroll"><div class="w-bd"><div class="r2-vs-h"><span><span class="w-logo">1W</span>1w Team</span><span>Aurora<span class="w-logo">AUR</span></span></div>
      ${ROLES.map((r, k) => { const a = TEAMS[0].players[k], b = TEAMS[1].players[k]
        const cell = (p, side) => `<div class="r2-vs__p r2-vs__p--${side} ${p[2] ? 'is-sub' : ''} ${s.pick === p[0] ? 'sel' : ''}" data-team="${p[0]}"><b>${p[0]}</b>${p[2] ? `<span>вместо ${p[2].was}</span>` : ''}</div>`
        return `<div class="r2-vs">${cell(a, 'l')}<span class="r2-vs__r">${r}</span>${cell(b, 'r')}</div>` }).join('')}</div></div>`,
    6: s => head + note + `<div class="w-scroll"><div class="w-bd">${TEAMS.map(t => strip(t, s.pick)).join('')}</div></div>`,
    // v7: шапка — сам матч (дирижёр 20.10: «конкретный матч, на странице матча — большая шапка»)
    7: s => matchHead + `<div class="w-scroll"><div class="w-bd"><div class="r2-news"><div class="r2-news__h"><span class="r2-note__i">${ic.swap}</span><b>Замены перед матчем</b><span class="w-cap">2 мин назад</span></div>
      ${changes().map(([t, [n, , sub]]) => `<div class="r2-news__r" data-team="${n}"><span class="w-logo">${t.id}</span><s>${sub.was}</s><span class="r2-ch__a">→</span><b>${n}</b><span class="w-cap">${sub.st}</span></div>`).join('')}</div>
      ${TEAMS.map(t => strip(t, s.pick)).join('')}</div></div>`,
  })
  // v8–v11 — на основе v7 (дирижёр 20.10: «v7 оставь, на его основе ещё версии»)
  const tSubs = t => t.players.filter(p => p[2])
  const ava2 = (t, [n, , sub], pick) => `<div class="r2-av ${sub ? 'is-sub' : ''} ${pick === n ? 'sel' : ''}" data-team="${n}"><span class="r2-av__c">${ini(n)}${sub ? `<i class="r2-av__b">${ic.swap}</i>` : ''}</span><span class="r2-av__n">${n}</span>${sub ? `<s class="r2-av__was">${sub.was}</s>` : ''}</div>`
  const rkHead = () => { const tm = (t, k) => `<div class="r2-mh__t"><span class="w-logo r2-mh__l">${t.id}</span><b>${t.name}</b><span class="w-cap">#${k} в мире</span><span class="t3-dots">${form(t.name).map(c => `<i class="${c}"></i>`).join('')}</span></div>`
    return `<div class="r2-mh">${tm(TEAMS[0], 8)}<div class="r2-mh__c"><span class="t2-chip t2-chip--today">18:00</span><span class="w-cap">${MATCH.tour}</span></div>${tm(TEAMS[1], 4)}</div>` }
  const news = `<div class="r2-news"><div class="r2-news__h"><span class="r2-note__i">${ic.swap}</span><b>Замены перед матчем</b><span class="w-cap">2 мин назад</span></div>
      ${changes().map(([t, [n, , sub]]) => `<div class="r2-news__r" data-team="${n}"><span class="w-logo">${t.id}</span><s>${sub.was}</s><span class="r2-ch__a">→</span><b>${n}</b><span class="w-cap">${sub.st}</span></div>`).join('')}</div>`
  const teamsWithSubs = (s, src) => TEAMS.map(t => strip(t, s.pick) + (tSubs(t).length ? `<div class="r2-tsub">${tSubs(t).map(([n, , sub]) =>
      (src ? `<div data-team="${n}" class="r2-tsub__1"><span class="r2-note__i">${ic.swap}</span><span class="r2-tsub__w">${sub.was} → <b>${n}</b></span><span class="w-cap">${sub.st}</span>${iconLink(sub.src)}</div>`
        : `<div data-team="${n}"><span class="r2-note__i">${ic.swap}</span>${sub.was} → <b>${n}</b><span class="w-cap">${sub.st}</span></div>`)).join('')}</div>` : '')).join('')
  const newsStrip = `<div class="tt-st r2-note"><span class="r2-note__i">${ic.swap}</span><span class="t2-st__m"><b>Замены перед матчем</b> · ${subs}</span><span class="tt-st__r">2 мин назад</span></div>`
  const matchFoot = `<div class="r2-mf"><span class="w-logo">${TEAMS[0].id}</span><b>${TEAMS[0].name}</b><span class="t2-chip t2-chip--today">18:00</span><b>${TEAMS[1].name}</b><span class="w-logo">${TEAMS[1].id}</span></div>`
  const matchMini = `<div class="r2-mf r2-mf--top"><span class="w-logo">${TEAMS[0].id}</span><b>${TEAMS[0].name}</b><span class="t2-chip t2-chip--today">18:00</span><b>${TEAMS[1].name}</b><span class="w-logo">${TEAMS[1].id}</span></div>`
  Object.assign(V, {
    8: s => matchHead + `<div class="w-scroll"><div class="w-bd"><div class="r2-line">${TEAMS.filter(t => tSubs(t).length).map(t => `<div class="r2-line__r"><span class="r2-note__i">${ic.swap}</span><b>${t.name}:</b>
      ${tSubs(t).map(([n, , sub]) => `<span data-team="${n}" class="r2-line__p">${sub.was} → <b>${n}</b></span>`).join(', ')}</div>`).join('')}</div>
      ${TEAMS.map(t => strip(t, s.pick)).join('')}</div></div>`,
    9: s => matchHead + `<div class="w-scroll"><div class="w-bd">${TEAMS.map(t => strip(t, s.pick) + (tSubs(t).length ? `<div class="r2-tsub">${tSubs(t).map(([n, , sub]) =>
      `<div data-team="${n}"><span class="r2-note__i">${ic.swap}</span>${sub.was} → <b>${n}</b><span class="w-cap">${sub.st}</span></div>`).join('')}</div>` : '')).join('')}</div></div>`,
    10: s => matchHead + `<div class="w-scroll"><div class="w-bd">${news}${TEAMS.map(t => `<div class="r2-strip">${thead(t)}<div class="r2-avs">${t.players.map(p => ava2(t, p, s.pick)).join('')}</div></div>`).join('')}</div></div>`,
    // v12, v13 — v9 + новость полосой; плашка матча внизу (12) или маленькая сверху (13)
    12: s => newsStrip + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s)}</div></div>` + matchFoot,
    13: s => matchMini + newsStrip + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s)}</div></div>`,
    // v14–v16 — v12, где новость работает (дирижёр 20.10: «не понимаю, как новость будет работать»)
    14: s => `<button class="tt-st r2-note r2-note--btn ${s.only ? 'is-on' : ''}" data-only><span class="r2-note__i">${ic.swap}</span><span class="t2-st__m"><b>Замены перед матчем</b> · ${subs}</span><span class="tt-st__r">${s.only ? 'показать всех' : 'показать'}</span></button>`
      + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s)}</div></div>` + matchFoot,
    15: s => { const f = changes().find(([, p]) => p[2].fresh), [t, [n, , sub]] = f
      return `<div class="r2-toastwrap">${s.toast ? `<div class="r2-toast"><span class="r2-note__i">${ic.swap}</span><span><b>${t.name}:</b> ${sub.was} → <b>${n}</b></span><span class="w-cap">только что</span></div>` : `<div class="r2-badgebar"><button class="r2-badge" data-toast aria-label="Замены">${ic.swap}<span>${subs} замены</span></button></div>`}</div>`
        + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s)}</div></div>` + matchFoot },
    16: s => `<button class="tt-st r2-note r2-note--btn ${s.feed ? 'is-on' : ''}" data-feed><span class="r2-note__i">${ic.swap}</span><span class="t2-st__m"><b>Замены перед матчем</b> · ${subs}</span><span class="tt-st__r">${s.feed ? 'свернуть' : 'хроника'}</span></button>`
      + (s.feed ? `<div class="r2-feed">${changes().slice().reverse().map(([t, [n, , sub]]) => `<div class="r2-feed__r" data-team="${n}"><span class="r2-feed__d">${sub.at}</span><span><b>${t.name}:</b> ${n} вместо ${sub.was}</span><span class="w-cap">${sub.st}</span></div>`).join('')}</div>` : '')
      + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s)}</div></div>` + matchFoot,
    // v17–v19 — v12 с новостями и источниками
    17: s => { const items = NEWS.map(([d, t, h, src]) => `<span class="r2-tk__i"><span class="r2-note__i">${ic.swap}</span><b>${t}:</b> ${h} · <span class="w-cap">${d}</span> ${link(src)}</span>`).join('<span class="r2-tk__dot">•</span>')
      return `<div class="r2-tk"><div class="r2-tk__run">${items}<span class="r2-tk__dot">•</span>${items}<span class="r2-tk__dot">•</span></div></div>` + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s, true)}</div></div>` + matchFoot },
    18: s => `<button class="tt-st r2-note r2-note--btn ${s.feed ? 'is-on' : ''}" data-feed><span class="r2-note__i">${ic.swap}</span><span class="t2-st__m"><b>Новости о заменах</b> · ${NEWS.length}</span><span class="tt-st__r">${s.feed ? 'свернуть' : 'открыть'}</span></button>`
      + (s.feed ? `<div class="r2-nl">${NEWS.map(([d, t, h, src]) => `<div class="r2-nl__r"><div class="r2-nl__h"><b>${t}:</b> ${h}</div><div class="r2-nl__m"><span>${d}</span>${link(src)}</div></div>`).join('')}</div>` : '')
      + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s, !s.cardv)}</div></div>` + matchFoot,
    19: s => { const k = s.ni || 0, [d, t, h, src] = NEWS[k]
      return `<div class="r2-one"><span class="r2-note__i">${ic.swap}</span><div class="r2-one__m"><div class="r2-one__h"><b>${t}:</b> ${h}</div><div class="r2-nl__m"><span>${d}</span>${link(src)}</div></div>
        <span class="r2-one__dots">${NEWS.map((_, i) => `<i class="${i === k ? 'is-on' : ''}" data-ni="${i}"></i>`).join('')}</span></div>`
        + `<div class="w-scroll"><div class="w-bd">${teamsWithSubs(s, true)}</div></div>` + matchFoot },
    11: s => rkHead() + `<div class="w-scroll"><div class="w-bd">${news}${TEAMS.map(t => strip(t, s.pick)).join('')}</div></div>`,
  })
  function render(el, v, s = { tab: 1, pick: null, toast: v === 15 }) {
    el.className = 'w w--fixed t2-tap t2-tap--11' + (s.pick ? ' has-pick' : '')
    el.innerHTML = s.cardv === 'page2' && s.pick ? (s.pp === 'slide' ? V[v](s) : '') + playerPage2(s.pick, s) : s.cardv === 'go' && s.pick ? playerPage(s.pick, s) : V[v](s) + (s.pick ? (s.db ? dbCard(s.pick, s) : card(s.pick)) : '')
    const go = p => { const sc = el.querySelector('.w-scroll'), y = sc ? sc.scrollTop : 0; Object.assign(s, p); render(el, v, s); const n = el.querySelector('.w-scroll'); if (n) n.scrollTop = y; T2.placeAnchor(el, true) }
    el.querySelectorAll('[data-team]').forEach(r => r.onclick = () => go({ pick: s.pick === r.dataset.team ? null : r.dataset.team, ppTab: 0, folds: null }))
    el.querySelectorAll('[data-unpick]').forEach(b => b.onclick = () => go({ pick: null }))
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => go({ tab: +b.dataset.tab, pick: null }))
    el.querySelectorAll('[data-all]').forEach(b => b.onclick = () => go({ all: !s.all, pick: null }))
    el.querySelectorAll('[data-only]').forEach(b => b.onclick = () => go({ only: !s.only, pick: null }))
    el.querySelectorAll('[data-feed]').forEach(b => b.onclick = () => go({ feed: !s.feed, pick: null }))
    el.querySelectorAll('[data-toast]').forEach(b => b.onclick = () => go({ toast: true }))
    el.querySelectorAll('[data-ni]').forEach(b => b.onclick = () => go({ ni: +b.dataset.ni }))
    s.slidFor = s.pick // v10: выезд — только при открытии, не при каждой перерисовке
    el.querySelectorAll('[data-fold]').forEach(b => b.onclick = () => { const f = Object.assign({ g: true }, s.folds); f[b.dataset.fold] = !f[b.dataset.fold]; go({ folds: f }) })
    el.querySelectorAll('[data-pptab]').forEach(b => b.onclick = () => go({ ppTab: +b.dataset.pptab }))
    // поиск по базе (o.db): загрузка ~0,9 с, «Повторить» после ошибки, «Спросить ИИ»
    if (s.db && s.pick && (s.db === 'loading' || s.retrying || s.cardv === 'page2') && !(s.loaded && s.loaded[s.pick]) && !s.waiting) { const n = s.pick; s.waiting = true
      setTimeout(() => { s.waiting = false; s.loaded = Object.assign(s.loaded || {}, { [n]: true }); if (s.retrying === n) { s.fixed = Object.assign(s.fixed || {}, { [n]: true }); s.retrying = null } if (s.pick === n) go({}) }, 900) }
    el.querySelectorAll('[data-retry]').forEach(b => b.onclick = e => { e.stopPropagation(); const n = b.dataset.retry; if (s.loaded) delete s.loaded[n]; go({ retrying: n }) })
    el.querySelectorAll('[data-ask]').forEach(b => b.onclick = e => { e.stopPropagation(); go({ asked: Object.assign(s.asked || {}, { [b.dataset.ask]: true }) }) })
    el.querySelectorAll('.r2-src, .r2-ilink').forEach(a => a.addEventListener('click', e => e.stopPropagation()))
    // v19: новость сама сменяется каждые 4 секунды
    if (v === 19 && !s.rot) s.rot = setInterval(() => { if (!s.pick) go({ ni: ((s.ni || 0) + 1) % NEWS.length }) }, 4000)
    el.classList.toggle('r2-only', !!s.only)
    // v15: новость сама сворачивается через 3 секунды
    if (v === 15 && s.toast && !s.timer) s.timer = setTimeout(() => { s.timer = null; go({ toast: false }) }, 3000)
    const sc = el.querySelector('.w-scroll'); if (sc && s.pick) sc.onscroll = () => T2.placeAnchor(el)
  }
  window.R2 = { render }
})()
