// Лаба widget-mvp-4 — MVP матча по созвону 02.11 §1.8 (задача 1.8). Начальник 02.11:
//  · аватарки Steam не показываем («аниме») — всегда фото игрока; нет фото — генерация (картинки делает Марат); у tier-1 фото будут;
//  · показать героя и короткую статистику в две колонки: K / D / A, GPM, XPM, урон — 6 показателей;
//  · у MVP матча название турнира не нужно → сегмента «Матч · Турнир» нет, в шапке — только две команды.
// Перехватывает MVPC.render (../widget-mvp-3/_m5.js) только для матча (o.match); остальные места — как было. Подключать после _m5.js.
// MVP — по данным серии из GS_DATA (OpenDota): больше всех (убийства + помощь) / смерти за серию. Цифры — сумма серии (K / D / A, урон) и среднее (GPM, XPM).
// ‼️ v2 показывает Pure (MVP4_PICK) — у настоящего MVP серии gpk~ фото нет, он в v3 с генерацией.
// Фото: вырезанное (/p-fw3k/site/img/players) → фото с dota2.ru (../widget-mvp-2/faces) → генерация. window.MVP4_GEN = true — всегда генерация (показать заглушку).
// ‼️ Генерация — заглушка: арт героя в цвет команды с ником; настоящие картинки — у Марата.
(() => {
  const M5 = window.MVPC, D = window.GS_DATA; if (!M5 || !D) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const k = n => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n);
  const CUT = ['pure', '9class', 'rue', 'yatoro'];
  const FACES = ['33', 'ame', 'batyuk', 'davai', 'insania', 'larl', 'malr1ne', 'mira', 'nightfall', 'pure', 'quinn', 'rue', 'saksa', 'satanic', 'skiter', 'sumail', 'topson', 'wisper', 'wits', 'yatoro', 'yuma', 'yuragi'];
  const photo = nick => { const n = nick.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (window.MVP4_GEN) return null;
    if (CUT.includes(n)) return { src: `/p-fw3k/site/img/players/${n}.webp`, cut: true };
    if (FACES.includes(n)) return { src: `../widget-mvp-2/faces/${n}.webp`, cut: false };
    return null };
  const teamId = name => { const w = String(name).toLowerCase().split(/\s+/)[0];
    return +Object.keys(D.teams).find(id => D.teams[id].name.toLowerCase().includes(w)) };
  const nick = id => (D.players[id] || {}).name || '—';

  const mvpOf = (a, b) => { const s = D.series.find(x => x.maps.some(m => [m.radiant_team_id, m.dire_team_id].includes(a) && [m.radiant_team_id, m.dire_team_id].includes(b)));
    if (!s) return null;
    const by = {};
    s.maps.forEach((m, i) => m.players.forEach(p => { const r = by[p.account_id] ||= { id: p.account_id, team: p.isRadiant ? m.radiant_team_id : m.dire_team_id, k: 0, d: 0, a: 0, gpm: 0, xpm: 0, dmg: 0, n: 0, hero: 0, map: 0, heroes: [], byMap: [] };
      r.k += p.kills; r.d += p.deaths; r.a += p.assists; r.gpm += p.gold_per_min; r.xpm += p.xp_per_min; r.dmg += p.hero_damage; r.n++; r.hero = p.hero_id; r.map = i + 1; r.heroes.push(p.hero_id); r.byMap[i] = { hero: p.hero_id, win: p.isRadiant === m.radiant_win } }));
    const all = Object.values(by).sort((x, y) => (y.k + y.a) / Math.max(1, y.d) - (x.k + x.a) / Math.max(1, x.d));
    // MVP4_PICK — показать конкретного игрока (v2: у настоящего MVP gpk~ фото нет, берём Pure из той же серии — чтобы видеть фото)
    const best = (window.MVP4_PICK && all.find(r => nick(r.id).toLowerCase() === window.MVP4_PICK.toLowerCase())) || all[0];
    // Среднее по игрокам серии — для сравнения (MVP4_STATS = 'bars')
    const avg = f => all.reduce((t, r) => t + f(r), 0) / all.length;
    const mean = { k: avg(r => r.k), d: avg(r => r.d), a: avg(r => r.a), gpm: avg(r => r.gpm / r.n), xpm: avg(r => r.xpm / r.n), dmg: avg(r => r.dmg) };
    return { ...best, gpm: Math.round(best.gpm / best.n), xpm: Math.round(best.xpm / best.n), maps: s.maps.length, mean } };

  const orig = M5.render.bind(M5);
  const skin = (el, o, p) => {
    orig(el, o);
    const h = D.heroes[p.hero] || {}, t = D.teams[p.team] || {}, n = nick(p.id), ph = photo(n), tag = id => (D.teams[id] || {}).tag || '—';
    const card = el.querySelector('.m6-card'); if (!card) return;
    el.querySelector('.m6-seg')?.remove(); el.querySelector('.m6-c--br')?.remove();
    const ev = el.querySelector('.m6-ev'); if (ev) ev.textContent = `${tag(teamId(o.match.a))} — ${tag(teamId(o.match.b))}`;
    // MVP4_LOGOS (v23, дирижёр 02.11: «в правом верхнем углу логотипы команд») — лого у каждой команды
    if (ev && window.MVP4_LOGOS) { const A = teamId(o.match.a), B = teamId(o.match.b), lo = id => (D.teams[id] || {}).logo ? `<img class="m4-tlg" src="${esc(D.teams[id].logo)}" alt="">` : '';
      ev.innerHTML = `${lo(A)}${esc(tag(A))} <i class="m4-dash">—</i> ${esc(tag(B))}${lo(B)}`; ev.classList.add('m4-ev'); }
    const bg = el.querySelector('.m6-bg'); if (bg && t.logo) bg.style.setProperty('--lg', `url('${new URL(t.logo, document.baseURI).href}')`) /* полный адрес: url() в переменной считается от _m5.css, не от страницы */;
    const img = card.querySelector('.m6-ph'); if (img && ph) img.src = ph.src;
    if (img && ph && !ph.cut) img.classList.add('m4-face');
    const who = card.querySelector('.m6-c--bl'); if (who) who.innerHTML = `<b>${esc(n)}</b><span class="m6-tm">${t.logo ? `<img src="${esc(t.logo)}" alt="">` : ''}${esc(t.name || '')}</span>`;
    // Показатели — на переднем слое, двигаются при наклоне вместе с ником (m4-fg = как .m6-c), без подложек.
    // MVP4_LAY — как лежат (дирижёр 02.11: «разные вариации, как оно будет лежать»):
    //  row (v9) — строкой под ником · side (v10) — столбиком в правом нижнем углу, где был KDA ·
    //  flank (v11) — по краям от игрока: слева K / D / A, справа GPM · XPM · урон · kda (v12) — K / D / A крупно справа внизу, остальное строкой под ником
    const L = window.MVP4_LAY || 'v8', st = (v, l, c = '') => `<div class="${c}"><b>${v}</b><span>${l}</span></div>`;
    const KDA = `${p.k} / ${p.d} / ${p.a}`, G = st(p.gpm, 'GPM'), X = st(p.xpm, 'XPM'), U = st(k(p.dmg), 'урон');
    const lay = {
      row: `<div class="m4-fg m4-l-row">${st(KDA, 'K / D / A')}${G}${X}${U}</div>`,
      side: `<div class="m4-fg m4-l-side">${st(KDA, 'K / D / A')}${G}${X}${U}</div>`,
      flank: `<div class="m4-fg m4-l-fl m4-l-fl--l">${st(p.k, 'убийства', 'up')}${st(p.d, 'смерти', 'dn')}${st(p.a, 'помощь')}</div><div class="m4-fg m4-l-fl m4-l-fl--r">${G}${X}${U}</div>`,
      kda: `<div class="m4-fg m4-l-big">${st(KDA, 'K / D / A')}</div><div class="m4-fg m4-l-row m4-l-row--3">${G}${X}${U}</div>`,
    };
    // Без MVP4_LAY — как в v8: строка на фото, не двигается
    const v8 = `<div class="m4-ov m4-ov--m6">${[[KDA, 'K / D / A'], [p.gpm, 'GPM'], [p.xpm, 'XPM'], [k(p.dmg), 'урон']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;
    card.insertAdjacentHTML('beforeend', window.MVP4_LAY ? (lay[L] || lay.row) : v8);
    el.classList.add('m4-lay-' + L);
    // Строка героя (дирижёр 02.11: «сделай подпись понятнее, несколько вариантов»): window.MVP4_HERO
    //  map (v13) — «Io · герой карты 3», справа «цифры — за 3 карты» · tag (v14) — герой карты 3 справа; над цифрами на фото — «за серию, 3 карты» ·
    //  all (v15) — все герои серии по картам: «Карта 1 · 2 · 3» с иконками · nick (v16) — строки нет: иконка героя у ника, под цифрами «за 3 карты»
    //  icons (v17) — «Герои по картам» + иконки с номером карты · cols (v18) — три колонки: иконка, герой, «Map N»
    //  wl (v19) — как cols, но «Map N» и победа / поражение по картам
    //  ring (v20) — кольцо цвета исхода, «Map N» цветом · stack (v21) — столбиками: иконка, имя, «Map N»
    //  maps (v22) — 3 ячейки: иконка в кольце, «Map N» цветом исхода, имя при наведении
    //  без MVP4_HERO — как в v11
    const HM = window.MVP4_HERO, ico = id => esc((D.heroes[id] || {}).icon || ''), hn = id => esc((D.heroes[id] || {}).name || '—');
    const heroRow = {
      map: `<div class="m4-hero m4-hero--m6"><img src="${ico(p.hero)}" alt=""><b>${hn(p.hero)}</b><span class="m4-hs">герой карты ${p.map}</span><span>цифры — за ${p.maps} карты</span></div>`,
      tag: `<div class="m4-hero m4-hero--m6"><span class="m4-hl">Герой карты ${p.map}</span><img src="${ico(p.hero)}" alt=""><b>${hn(p.hero)}</b></div>`,
      all: `<div class="m4-hero m4-hero--m6 m4-hero--all">${p.heroes.map((id, i) => `<span class="m4-hm"><img src="${ico(id)}" alt="" title="${hn(id)}"><em>Карта ${i + 1}</em></span>`).join('')}<span class="m4-hs">герои по картам</span></div>`,
      nick: '',
      // v17 (дирижёр 02.11: «v15 прикольно, но не вмещается») — слева «Герои по картам», справа 3 иконки с номером карты в углу
      icons: `<div class="m4-hero m4-hero--m6 m4-hero--ic"><span class="m4-hl">Герои по картам</span>${p.heroes.map((id, i) => `<span class="m4-hi" title="Карта ${i + 1} · ${hn(id)}"><img src="${ico(id)}" alt=""><i>${i + 1}</i></span>`).join('')}</div>`,
      // v18 — три колонки во всю ширину: иконка, имя героя, под ним «Map N» (дирижёр 02.11: «карта → Map»)
      // v20 (дирижёр 02.11: «v19 коряво») — иконка в кольце цвета исхода (зелёное — победа, красное — поражение), под именем «Map N» тем же цветом; слов «победа / поражение» нет
      ring: `<div class="m4-hero m4-hero--m6 m4-hero--cols">${Array.from({ length: p.maps }, (_, i) => { const x = p.byMap[i];
        return x ? `<span class="m4-hc m4-hc--ring" title="Map ${i + 1} · ${hn(x.hero)} · ${x.win ? 'победа' : 'поражение'}"><span class="m4-rg ${x.win ? 'is-w' : 'is-l'}"><img src="${ico(x.hero)}" alt=""></span><span><b>${hn(x.hero)}</b><em class="${x.win ? 'w' : 'l'}">Map ${i + 1}</em></span></span>`
          : `<span class="m4-hc m4-hc--no"><span class="m4-rg"></span><span><b>—</b><em>Map ${i + 1}</em></span></span>` }).join('')}</div>`,
      // v21 — столбиками по центру: иконка в кольце сверху, имя героя, «Map N» цветом исхода — имени больше места
      stack: `<div class="m4-hero m4-hero--m6 m4-hero--stack">${Array.from({ length: p.maps }, (_, i) => { const x = p.byMap[i];
        return x ? `<span class="m4-hst" title="Map ${i + 1} · ${hn(x.hero)} · ${x.win ? 'победа' : 'поражение'}"><span class="m4-rg ${x.win ? 'is-w' : 'is-l'}"><img src="${ico(x.hero)}" alt=""></span><b>${hn(x.hero)}</b><em class="${x.win ? 'w' : 'l'}">Map ${i + 1}</em></span>`
          : `<span class="m4-hst m4-hc--no"><span class="m4-rg"></span><b>—</b><em>Map ${i + 1}</em></span>` }).join('')}</div>`,
      // v22 (дирижёр 02.11: «v20, v21 всё равно кривые») — своя полоса без общих стилей строки героя: 3 равные ячейки,
      // в каждой по центру иконка героя в кольце цвета исхода и под ней «Map N» тем же цветом; имя героя — при наведении
      maps: `<div class="m4-maps">${Array.from({ length: p.maps }, (_, i) => { const x = p.byMap[i];
        return `<div class="m4-mp ${x ? (x.win ? 'is-w' : 'is-l') : 'is-no'}" title="${x ? `Map ${i + 1} · ${hn(x.hero)} · ${x.win ? 'победа' : 'поражение'}` : `Map ${i + 1} · не играл`}">${x ? `<img src="${ico(x.hero)}" alt="">` : '<i></i>'}<span>Map ${i + 1}</span></div>` }).join('')}</div>`,
      // v19 (дирижёр 02.11: «за базу v18; Map, а не „карта“») — как v18, но «Map N» и метка победы / поражения под иконкой; карту не играл — «—»
      wl: `<div class="m4-hero m4-hero--m6 m4-hero--cols">${Array.from({ length: p.maps }, (_, i) => { const x = p.byMap[i];
        return x ? `<span class="m4-hc m4-hc--wl"><span class="m4-hw ${x.win ? 'is-w' : 'is-l'}"><img src="${ico(x.hero)}" alt=""></span><span><b>${hn(x.hero)}</b><em>Map ${i + 1} · <i class="${x.win ? 'w' : 'l'}">${x.win ? 'победа' : 'поражение'}</i></em></span></span>`
          : `<span class="m4-hc m4-hc--no"><span class="m4-hw"></span><span><b>—</b><em>Map ${i + 1} · не играл</em></span></span>` }).join('')}</div>`,
      cols: `<div class="m4-hero m4-hero--m6 m4-hero--cols">${p.heroes.map((id, i) => `<span class="m4-hc"><img src="${ico(id)}" alt=""><span><b>${hn(id)}</b><em>Map ${i + 1}</em></span></span>`).join('')}</div>`,
    };
    card.insertAdjacentHTML('afterend', HM ? heroRow[HM] : `<div class="m4-hero m4-hero--m6"><img src="${esc(h.icon || h.img || '')}" alt=""><b>${esc(h.name || '—')}</b><span>${p.maps > 1 ? `карта ${p.map} · за серию из ${p.maps}` : 'карта 1'}</span></div>`);
    if (HM === 'tag' || HM === 'nick') card.insertAdjacentHTML('beforeend', `<div class="m4-fg m4-cap">${HM === 'tag' ? `за серию · ${p.maps} карты` : `за ${p.maps} карты`}</div>`);
    if (HM === 'nick') { const nb = card.querySelector('.m6-c--bl b'); if (nb) nb.insertAdjacentHTML('beforeend', ` <img class="m4-nh" src="${ico(p.hero)}" alt="" title="${hn(p.hero)} · карта ${p.map}">`); }
    if (HM) el.classList.add('m4-h-' + HM);
    el.classList.add('m4-skin');
  };
  M5.render = (el, o) => {
    if (!o || !o.match) return orig(el, o);
    const a = teamId(o.match.a), b = teamId(o.match.b), p = mvpOf(a, b);
    if (!p) return orig(el, o);
    // MVP4_SKIN = 'orig' (v8, дирижёр 02.11: «ближе всех v7, но нет ни глича — как в оригинале»): карточку рисует сам виджет MVP
    // (лого команды фоном, глитч, тень-пол, наклон за мышью, кнопка фэнтези), мы только подменяем игрока и кладём показатели на фото, как в v7
    if (window.MVP4_SKIN === 'orig') return skin(el, o, p);
    const h = D.heroes[p.hero] || {}, t = D.teams[p.team] || {}, n = nick(p.id), ph = photo(n);
    const tag = id => (D.teams[id] || {}).tag || '—';
    const cell = (v, l, c = '') => `<div class="m4-c"><b class="${c}">${v}</b><span>${l}</span></div>`;
    // Подача 6 показателей (дирижёр 02.11: «покажи разные варианты показателя, сейчас непонятно»): window.MVP4_STATS
    //  grid (v2) — 2 колонки «подпись … число» · kda (v4) — K / D / A одной крупной строкой, ниже GPM · XPM · урон ·
    //  tiles (v5) — 3 × 2 плитки, число крупно, подпись под ним · bars (v6) — строки с полосой «MVP против среднего по серии» ·
    //  over (v7) — числа прямо на фото снизу, две колонки
    const stats = p => { const m = p.mean, S = window.MVP4_STATS || 'grid';
      if (S === 'kda') return `<div class="m4-kda"><b class="up">${p.k}</b><i>/</i><b class="dn">${p.d}</b><i>/</i><b>${p.a}</b><span>убийства / смерти / помощь</span></div>
        <div class="m4-tri">${[[p.gpm, 'GPM'], [p.xpm, 'XPM'], [k(p.dmg), 'урон']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;
      if (S === 'tiles') return `<div class="m4-tl">${[[p.k, 'убийства', 'up'], [p.d, 'смерти', 'dn'], [p.a, 'помощь', ''], [p.gpm, 'GPM', ''], [p.xpm, 'XPM', ''], [k(p.dmg), 'урон', '']].map(([v, l, c]) => `<div><b class="${c}">${v}</b><span>${l}</span></div>`).join('')}</div>`;
      if (S === 'bars') { const row = (v, mv, l) => { const top = Math.max(v, mv * 1.6);
          return `<div class="m4-br"><span>${l}</span><b>${typeof v === 'number' && v >= 1000 ? k(v) : v}</b><i><s style="width:${Math.round(v / top * 100)}%"></s><u style="left:${Math.round(mv / top * 100)}%"></u></i></div>` };
        return `<div class="m4-bars"><div class="m4-bl">MVP <i></i> среднее по серии</div>${row(p.k, Math.round(m.k), 'Убийства')}${row(p.d, Math.round(m.d), 'Смерти')}${row(p.a, Math.round(m.a), 'Помощь')}${row(p.gpm, Math.round(m.gpm), 'GPM')}${row(p.xpm, Math.round(m.xpm), 'XPM')}${row(p.dmg, Math.round(m.dmg), 'Урон')}</div>` }
      if (S === 'over') return '';
      return `<div class="m4-g">${cell(p.k, 'убийства', 'up')}${cell(p.gpm, 'GPM')}${cell(p.d, 'смерти', 'dn')}${cell(p.xpm, 'XPM')}${cell(p.a, 'помощь')}${cell(k(p.dmg), 'урон')}</div>` };
    const over = p => (window.MVP4_STATS === 'over' ? `<div class="m4-ov">${[[`${p.k} / ${p.d} / ${p.a}`, 'K / D / A'], [p.gpm, 'GPM'], [p.xpm, 'XPM'], [k(p.dmg), 'урон']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>` : '');
    el.className = 'w m4' + (window.MVP4_STATS === 'over' ? ' m4--over' : '');
    el.innerHTML = `<div class="m4-hd"><b>MVP матча</b><span>${esc(tag(a))} — ${esc(tag(b))}</span></div>
      <div class="m4-card${ph ? '' : ' is-gen'}" style="--hero:url('${esc(h.img || '')}')">
        ${ph ? `<img class="m4-ph${ph.cut ? ' is-cut' : ''}" src="${esc(ph.src)}" alt="">` : `<i class="m4-gen"></i><i class="m4-gl"><i></i><i></i><i></i></i><em class="m4-tagg">генерация</em>`}
        <i class="m4-fade"></i>
        ${over(p)}
        <div class="m4-who"><b>${esc(n)}</b><span>${t.logo ? `<img src="${esc(t.logo)}" alt="">` : ''}${esc(t.name || '')}</span></div>
      </div>
      <div class="m4-hero"><img src="${esc(h.icon || h.img || '')}" alt=""><b>${esc(h.name || '—')}</b><span>${p.maps > 1 ? `карта ${p.map} · за серию из ${p.maps}` : 'карта 1'}</span></div>
      ${stats(p)}
      <a class="m4-dock" href="#fantasy"><span>Взять в фэнтези</span><em>200</em></a>`;
    el.querySelectorAll('a').forEach(x => x.onclick = e => e.preventDefault());
  };
})();
