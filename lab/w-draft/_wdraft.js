// w-draft — виджет «Драфт» для страницы матча (лаба w-draft v9–v12, дирижёр 27.10: «новые лабы на основе текущего варианта» — страница v30).
// Начальник 26.10: «график с золотом не возникнет, пока не пройдёт драфт», «после драфта результат одной и другой команды встаёт к графику».
// Один код для страницы (gs-match, data-wd="draft") и лабы: WDRAFT.render(el, o).
// o: m — карта (OpenDota), n — номер карты, state — draft (идёт: пятёрки растут, шаг каждые 1,5 с — в данных draft_timings пусты; look cm — таймлайн ходов сверху вниз) | after,
//    look — card (карточка: пятёрки и баны) | half (одна команда полосой, o.side 0 — Radiant / 1 — Dire) | mini (две пятёрки мелко в одну строку)
//    | col (одна команда колонкой сбоку графика, o.side) | order (24 хода по порядку полосой) | fold (свёрнуто строкой, по нажатию — порядок ходов), base — путь к img/.
// v13–v16 (дирижёр 27.10: «версии драфта сделай ещё») — col, order, fold, cm.
(() => {
  const D = window.GS_DATA;
  const H = id => D.heroes[id] || { name: '—', img: '' };
  const TM = id => D.teams[id] || { name: '—', tag: '—', logo: '' };
  const S = { step: 0, left: 30, timer: null, open: new Set() };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const nick = (m, hid) => { const p = m.players.find(q => q.hero_id === hid); return (p && D.players[p.account_id]?.name) || ''; };
  const order = m => [...m.picks_bans].sort((a, b) => a.order - b.order);
  const tid = (m, t) => (t ? m.dire_team_id : m.radiant_team_id);
  const team = (m, t, B, extra = '') => `<span class="wdr-tm"><i class="wdr-dot wdr-dot--${t ? 'b' : 'a'}"></i><img src="${B + TM(tid(m, t)).logo}" alt="">${esc(TM(tid(m, t)).tag)}${extra}</span>`;

  // после драфта: пик — картинка героя и ник, бан — мелко серым
  const pick = (m, x, B, names) => `<span class="wdr-p" title="${esc(H(x.hero_id).name)}"><img src="${B + H(x.hero_id).img}" alt="">${names ? `<small>${esc(nick(m, x.hero_id))}</small>` : ''}</span>`;
  const ban = (x, B) => `<img class="wdr-ban" src="${B + H(x.hero_id).img}" alt="" title="бан · ${esc(H(x.hero_id).name)}">`;
  function side(m, t, B, names) {
    const my = order(m).filter(x => x.team === t);
    return `<div class="wdr-row wdr-row--${t ? 'b' : 'a'}">${team(m, t, B)}<div class="wdr-five">${my.filter(x => x.is_pick).map(x => pick(m, x, B, names)).join('')}</div>
      <div class="wdr-bans">${my.filter(x => !x.is_pick).map(x => ban(x, B)).join('')}</div></div>`;
  }

  // драфт идёт: слот шага — сделан (герой), текущий (пунктир и таймер), впереди (пусто); ходящая команда светлее
  function live(m, B, n) {
    const PB = order(m), now = PB[S.step];
    const slot = (x, i) => i < S.step ? `<img class="wdr-s wdr-s--${x.is_pick ? 'pick' : 'ban'}" src="${B + H(x.hero_id).img}" alt="" title="${i + 1} · ${x.is_pick ? 'пик' : 'бан'} · ${esc(H(x.hero_id).name)}">`
      : `<span class="wdr-s wdr-s--${x.is_pick ? 'pick' : 'ban'} ${i === S.step ? 'is-now' : ''}">${i === S.step ? (x.is_pick ? 'пик' : 'бан') : ''}</span>`;
    const half = t => { const my = PB.map((x, i) => [x, i]).filter(([x]) => x.team === t), on = now && now.team === t;
      return `<div class="wdr-half ${now ? (on ? 'is-on' : 'is-off') : ''}">${team(m, t, '' + B, on ? '<em>ходит</em>' : '')}
        <div class="wdr-five">${my.filter(([x]) => x.is_pick).map(([x, i]) => slot(x, i)).join('')}</div>
        <div class="wdr-bans">${my.filter(([x]) => !x.is_pick).map(([x, i]) => slot(x, i)).join('')}</div></div>`; };
    return `<div class="wdr wdr--live"><div class="wdr-hd"><b>Драфт · карта ${n}</b><span class="num">${now ? `шаг ${S.step + 1} из ${PB.length} · <span class="wdr-clock">0:${String(S.left).padStart(2, '0')}</span>` : 'драфт закончен'}</span></div>
      <div class="wdr-halves">${half(0)}${half(1)}</div><p class="wdr-note">График золота появится, когда закончится драфт</p></div>`;
  }

  // таймлайн ходов сверху вниз, как Captain's Mode (начальник 26.10 [1 · 18:04]): Radiant — слева, Dire — справа, номер хода по центру; сделанные — герой, текущий — подсвечен
  function cm(m, B, n) {
    const PB = order(m), now = PB[S.step];
    const cell = (x, i) => i < S.step ? `<span class="wdr-h ${x.is_pick ? '' : 'is-ban'}"><img src="${B + H(x.hero_id).img}" alt=""><span>${esc(H(x.hero_id).name)}</span></span>`
      : i === S.step ? `<span class="wdr-h is-now"><span class="wdr-s is-now">${x.is_pick ? 'пик' : 'бан'}</span><span>выбирает… <span class="wdr-clock">0:${String(S.left).padStart(2, '0')}</span></span></span>` : `<span class="wdr-h is-wait">${x.is_pick ? 'пик' : 'бан'}</span>`;
    return `<div class="wdr wdr--cm"><div class="wdr-hd"><b>Драфт · карта ${n}</b><span class="num">${now ? `ход ${S.step + 1} из ${PB.length}` : 'драфт закончен'}</span></div>
      <div class="wdr-cm-t">${team(m, 0, B)}<span></span>${team(m, 1, B)}</div>
      <div class="wdr-cm">${PB.map((x, i) => `<div class="wdr-cm-r ${i === S.step ? 'is-now' : i > S.step ? 'is-wait' : ''}"><div>${x.team ? '' : cell(x, i)}</div><span class="num">${i + 1}</span><div>${x.team ? cell(x, i) : ''}</div></div>`).join('')}</div>
      <p class="wdr-note">График золота появится, когда закончится драфт</p></div>`;
  }
  // 24 хода по порядку полосой: цвет сверху — чей ход, бан серым, номер под героем
  const strip = (m, B) => `<div class="wdr-ord">${order(m).map((x, i) => `<span class="wdr-o wdr-o--${x.team ? 'b' : 'a'} ${x.is_pick ? 'is-pick' : 'is-ban'}" title="${i + 1} · ${x.team ? TM(m.dire_team_id).tag : TM(m.radiant_team_id).tag} · ${x.is_pick ? 'пик' : 'бан'} · ${esc(H(x.hero_id).name)}"><img src="${B + H(x.hero_id).img}" alt=""><small class="num">${i + 1}</small></span>`).join('')}</div>`;

  // v17–v20 (дирижёр 27.10: «оставь эту версию [v14] и в формате её сделать ещё») — тот же порядок ходов, по-другому:
  // lanes — две дорожки: Radiant сверху, Dire снизу, номер хода между; phases — ходы группами по фазам (бан 1, пик 1…);
  // both — сверху пятёрки, ниже порядок мелко; fit — полоса во всю ширину без прокрутки (пик шире бана)
  const PH = m => order(m).reduce((a, x, i) => { const l = a[a.length - 1]; l && l.pick === x.is_pick ? l.idx.push(i) : a.push({ pick: x.is_pick, idx: [i] }); return a; }, []);
  function more(o, m, B) {
    const PB = order(m), hd = sub => `<div class="wdr-hd"><b>Драфт · карта ${o.n}</b><span>${sub}</span></div>`, img = x => `<img src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}">`;
    if (o.look === 'lanes') { const lane = t => PB.map((x, i) => `<span class="wdr-ln ${x.is_pick ? 'is-pick' : 'is-ban'}">${x.team === t ? img(x) : ''}</span>`).join('');
      return `<div class="wdr wdr--card">${hd('по порядку ходов')}<div class="wdr-lns"><div class="wdr-lt">${team(m, 0, B)}${team(m, 1, B)}</div>
        <div class="wdr-lx" style="--fr:${PB.map(x => (x.is_pick ? '1.6fr' : '1fr')).join(' ')};--px:${PB.map(x => (x.is_pick ? '40px' : '26px')).join(' ')}"><div class="wdr-lr wdr-lr--a">${lane(0)}</div><div class="wdr-lr wdr-lr--n">${PB.map((x, i) => `<span class="wdr-ln ${x.is_pick ? 'is-pick' : 'is-ban'} num">${i + 1}</span>`).join('')}</div><div class="wdr-lr wdr-lr--b">${lane(1)}</div></div></div></div>`; }
    if (o.look === 'phases') { let nb = 0, np = 0;
      return `<div class="wdr wdr--card">${hd('по фазам')}<div class="wdr-ord-t">${team(m, 0, B)}${team(m, 1, B)}</div><div class="wdr-phs">${PH(m).map(f => `<div class="wdr-ph"><small>${f.pick ? 'Пик ' + ++np : 'Бан ' + ++nb}</small><div>${f.idx.map(i => { const x = PB[i];
        return `<span class="wdr-o wdr-o--${x.team ? 'b' : 'a'} ${x.is_pick ? 'is-pick' : 'is-ban'}" title="${i + 1} · ${esc(H(x.hero_id).name)}">${img(x)}<small class="num">${i + 1}</small></span>`; }).join('')}</div></div>`).join('')}</div></div>`; }
    if (o.look === 'both') return `<div class="wdr wdr--card">${hd(`${PB.filter(x => x.is_pick).length} пиков · ${PB.filter(x => !x.is_pick).length} банов`)}${side(m, 0, B, true)}${side(m, 1, B, true)}<div class="wdr-sub">Порядок ходов</div>${strip(m, B)}</div>`;
    // fit
    return `<div class="wdr wdr--card">${hd('по порядку ходов')}<div class="wdr-ord-t">${team(m, 0, B)}${team(m, 1, B)}</div><div class="wdr-ord wdr-ord--fit">${PB.map((x, i) => `<span class="wdr-o wdr-o--${x.team ? 'b' : 'a'} ${x.is_pick ? 'is-pick' : 'is-ban'}" title="${i + 1} · ${esc(H(x.hero_id).name)}">${img(x)}<small class="num">${i + 1}</small></span>`).join('')}</div></div>`;
  }

  // v21–v24 (дирижёр 27.10: «в стиле сайтов, как на мобильных версиях») — по мобильным скринам исследования (figma-разбор/06-матчи/скрины):
  // cs — Cyberscore: обе команды рядом, у каждой 5 героев с ником под ними, ниже ряд банов перечёркнутыми; dltv — DLTV: под счётом карты герои с никами и
  // баны строкой, баны прячутся («Показать баны»); hawk — Hawk: «Пики команд» двумя колонками сверху вниз; flap — Flapscore: ходы списком текстом в две колонки
  function site(o, m, B) {
    const PB = order(m), hd = sub => `<div class="wdr-hd"><b>Драфт · карта ${o.n}</b><span>${sub}</span></div>`, H5 = t => PB.filter(x => x.team === t && x.is_pick), BN = t => PB.filter(x => x.team === t && !x.is_pick);
    if (o.look === 'cs') { const col = t => `<div class="wcs-t"><div class="wcs-n ${t ? 'b' : 'a'}"><small>${t ? 'Dire' : 'Radiant'}</small>${team(m, t, B)}</div>
        <div class="wcs-p">${H5(t).map(x => `<span><img src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}"><small>${esc(nick(m, x.hero_id))}</small></span>`).join('')}</div>
        <div class="wcs-b">${BN(t).map(x => `<span><img src="${B + H(x.hero_id).img}" alt="" title="бан · ${esc(H(x.hero_id).name)}"></span>`).join('')}</div></div>`;
      return `<div class="wdr wdr--card wdr--cs">${hd('пики и баны')}<div class="wcs">${col(0)}${col(1)}</div></div>`; }
    if (o.look === 'dltv') { const open = S.open.has(m.match_id), col = t => `<div class="wdl-t">${team(m, t, B)}<div class="wdl-p">${H5(t).map(x => `<span><img src="${B + H(x.hero_id).img}" alt=""><small>${esc(nick(m, x.hero_id))}</small></span>`).join('')}</div>
        ${open ? `<div class="wdl-b">${BN(t).map(x => `<img src="${B + H(x.hero_id).img}" alt="" title="бан · ${esc(H(x.hero_id).name)}">`).join('')}</div>` : ''}</div>`;
      return `<div class="wdr wdr--card wdr--dl"><div class="wdl-hd">Пики <span>&amp;</span> баны · карта ${o.n}</div><div class="wdl">${col(0)}${col(1)}</div>
        <button class="wdl-more" data-wdr-fold="${m.match_id}">${open ? 'Скрыть баны ▴' : 'Показать баны ▾'}</button></div>`; }
    if (o.look === 'hawk') { const row = (x, t) => `<div class="whk-r ${t ? 'b' : 'a'}"><img src="${B + H(x.hero_id).img}" alt=""><span>${esc(H(x.hero_id).name)}<small>${esc(nick(m, x.hero_id))}</small></span></div>`;
      return `<div class="wdr wdr--card wdr--hk"><div class="whk-hd">Пики команд</div><div class="whk-tm">${team(m, 0, B)}${team(m, 1, B)}</div>
        <div class="whk">${H5(0).map((x, i) => row(x, 0) + row(H5(1)[i], 1)).join('')}</div></div>`; }
    // flap
    const tag = x => esc(x.team ? TM(m.dire_team_id).tag : TM(m.radiant_team_id).tag), half = Math.ceil(PB.length / 2);
    const li = (x, i) => `<li><span class="num">${i + 1}.</span> <b class="${x.team ? 'b' : 'a'}">${tag(x)}</b> ${x.is_pick ? 'берёт' : 'банит'} ${esc(H(x.hero_id).name)}</li>`;
    return `<div class="wdr wdr--card wdr--fp"><div class="wfp-hd">Пики</div><div class="wfp"><ol>${PB.slice(0, half).map(li).join('')}</ol><ol>${PB.slice(half).map((x, i) => li(x, i + half)).join('')}</ol></div></div>`;
  }


  // w-draft-2 (дирижёр 06.11, созвон с Антоном: «отобразил бы драфт так же, как в Доте»): ход драфта в центре вместо графика, до начала карты
  // dota — как в самой Доте (Captain's Mode): команды по краям, у каждой 5 слотов пиков и 7 банов, по центру таймер и чей ход; ниже 24 хода полосой
  // phase — по фазам: Бан 1 · Пик 1 · …, текущая фаза раскрыта и подсвечена, крупно — чей ход
  function dota(m, B, n) {
    const PB = order(m), now = PB[S.step], clock = `<span class="wdr-clock">0:${String(S.left).padStart(2, '0')}</span>`;
    const slot = (x, i, big) => i < S.step ? `<img class="wdt-s ${x.is_pick ? '' : 'is-ban'}" src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}">`
      : `<span class="wdt-s ${x.is_pick ? '' : 'is-ban'} ${i === S.step ? 'is-now' : ''}">${i === S.step && big ? 'выбирает' : ''}</span>`;
    const half = t => { const my = PB.map((x, i) => [x, i]).filter(([x]) => x.team === t), on = now && now.team === t, T = TM(tid(m, t));
      return `<div class="wdt-side ${t ? 'b' : 'a'} ${on ? 'is-on' : ''}"><div class="wdt-tm"><img src="${B + T.logo}" alt=""><span><b>${esc(T.name)}</b><small class="${t ? 'dire' : 'rad'}">${t ? 'Dire' : 'Radiant'}</small></span></div>
        <div class="wdt-pk">${my.filter(([x]) => x.is_pick).map(([x, i]) => slot(x, i, true)).join('')}</div>
        <div class="wdt-bn">${my.filter(([x]) => !x.is_pick).map(([x, i]) => slot(x, i)).join('')}</div></div>`; };
    const mid = now ? `<div class="wdt-mid"><small class="num">ход ${S.step + 1} из ${PB.length}</small><b class="num">${clock}</b><span class="${now.team ? 'dire' : 'rad'}">${esc(TM(tid(m, now.team)).tag)} · ${now.is_pick ? 'пик' : 'бан'}</span></div>`
      : '<div class="wdt-mid"><b>Готово</b><small>карта начинается</small></div>';
    const ord = `<div class="wdt-ord">${PB.map((x, i) => `<span class="wdt-o ${x.team ? 'b' : 'a'} ${x.is_pick ? 'is-pick' : 'is-ban'} ${i < S.step ? 'is-done' : i === S.step ? 'is-now' : ''}">${i < S.step ? `<img src="${B + H(x.hero_id).img}" alt="">` : ''}</span>`).join('')}</div>`;
    return `<div class="wdr wdr--dota"><div class="wdr-hd"><b>Драфт · карта ${n}</b><span>Captain's Mode</span></div><div class="wdt">${half(0)}${mid}${half(1)}</div>${ord}<p class="wdr-note">График золота появится, когда закончится драфт</p></div>`;
  }
  function phase(m, B, n) {
    const PB = order(m), now = PB[S.step]; let nb = 0, np = 0;
    const T = now && TM(tid(m, now.team)), big = now ? `<div class="wdp-now ${now.team ? 'dire' : 'rad'}"><img src="${B + T.logo}" alt=""><span><small>сейчас ходит</small><b>${esc(T.name)} · ${now.is_pick ? 'пик' : 'бан'}</b></span><em class="num"><span class="wdr-clock">0:${String(S.left).padStart(2, '0')}</span></em></div>` : '<div class="wdp-now"><span><b>Драфт закончен</b><small>карта начинается</small></span></div>';
    const ph = PH(m).map(f => { const cur = f.idx.includes(S.step), done = f.idx[f.idx.length - 1] < S.step;
      return `<div class="wdp-ph ${cur ? 'is-now' : done ? 'is-done' : 'is-wait'}"><small>${f.pick ? 'Пик ' + ++np : 'Бан ' + ++nb}</small><div>${f.idx.map(i => { const x = PB[i];
        return `<span class="wdr-o wdr-o--${x.team ? 'b' : 'a'} ${x.is_pick ? 'is-pick' : 'is-ban'} ${i === S.step ? 'is-now' : ''}">${i < S.step ? `<img src="${B + H(x.hero_id).img}" alt="">` : '<i></i>'}<small class="num">${i + 1}</small></span>`; }).join('')}</div></div>`; }).join('');
    return `<div class="wdr wdr--phase"><div class="wdr-hd"><b>Драфт · карта ${n}</b><span class="num">${now ? `ход ${S.step + 1} из ${PB.length}` : ''}</span></div>${big}<div class="wdr-ord-t">${team(m, 0, B)}${team(m, 1, B)}</div><div class="wdp">${ph}</div><p class="wdr-note">График золота появится, когда закончится драфт</p></div>`;
  }


  // w-draft-2 v5–v7 (дирижёр 06.11: драфт в центре вместо графика — крупно, на весь центр)
  // dota2 — как в Доте: сверху команды и большой таймер, ниже пятёрки высокими портретами (текущий слот светится), баны рядами, внизу 24 хода с фазами
  // slots — пики сразу встают в строку игроков под центром (см. ../w-draft-2/_wd2.js), в центре — крупно чей ход и баны обеих команд
  // phase2 — по фазам, крупно: «Бан 1 · Пик 1 …» карточками, текущая подсвечена
  const clk = () => `<span class="wdr-clock">0:${String(S.left).padStart(2, '0')}</span>`;
  const TT = (m, t, B, cls = '') => { const T = TM(tid(m, t)); return `<div class="d2-tm ${t ? 'b' : 'a'} ${cls}"><img src="${B + T.logo}" alt=""><span><b>${esc(T.name)}</b><small class="${t ? 'dire' : 'rad'}">${t ? 'Dire' : 'Radiant'}</small></span></div>`; };
  const NOW = (m, B, now) => now ? `<div class="d2-now"><small class="num">ход ${S.step + 1} из 24</small><b class="num">${clk()}</b><span class="d2-who ${now.team ? 'dire' : 'rad'}">${esc(TM(tid(m, now.team)).tag)} · ${now.is_pick ? 'пик' : 'бан'}</span></div>`
    : '<div class="d2-now"><b>Готово</b><small>карта начинается</small></div>';
  const ORD = (m, B) => { const PB = order(m); let nb = 0, np = 0;
    return `<div class="d2-ord">${PH(m).map(f => `<div class="d2-og ${f.pick ? 'is-pick' : 'is-ban'}" style="flex:${f.idx.length}"><small>${f.pick ? 'Пик ' + ++np : 'Бан ' + ++nb}</small><div>${f.idx.map(i => { const x = PB[i];
      return `<span class="d2-o ${x.team ? 'b' : 'a'} ${i < S.step ? 'is-done' : i === S.step ? 'is-now' : ''}">${i < S.step ? `<img src="${B + H(x.hero_id).img}" alt="">` : ''}</span>`; }).join('')}</div></div>`).join('')}</div>`; };
  function dota2(m, B, n) {
    const PB = order(m), now = PB[S.step];
    const card = (x, i) => i < S.step ? `<span class="d2-c is-done"><img src="${B + H(x.hero_id).img}" alt=""><b>${esc(H(x.hero_id).name)}</b><small>${esc(nick(m, x.hero_id))}</small></span>`
      : `<span class="d2-c ${i === S.step ? 'is-now' : ''}"><i></i><b>${i === S.step ? 'выбирает…' : ''}</b><small></small></span>`;
    const ban = (x, i) => i < S.step ? `<img class="d2-b" src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}">` : `<span class="d2-b ${i === S.step ? 'is-now' : ''}"></span>`;
    const side = t => { const my = PB.map((x, i) => [x, i]).filter(([x]) => x.team === t), on = now && now.team === t;
      return `<div class="d2-side ${t ? 'b' : 'a'} ${now ? (on ? 'is-on' : 'is-off') : ''}"><div class="d2-pk">${my.filter(([x]) => x.is_pick).map(([x, i]) => card(x, i)).join('')}</div><div class="d2-bn"><small>Баны</small>${my.filter(([x]) => !x.is_pick).map(([x, i]) => ban(x, i)).join('')}</div></div>`; };
    return `<div class="wdr wdr--d2"><div class="d2-top">${TT(m, 0, B, now && now.team === 0 ? 'is-on' : '')}${NOW(m, B, now)}${TT(m, 1, B, now && now.team === 1 ? 'is-on' : '')}</div><div class="d2-mid">${side(0)}${side(1)}</div>${ORD(m, B)}</div>`;
  }
  function slots(m, B, n) {
    const PB = order(m), now = PB[S.step];
    const bans = t => PB.map((x, i) => [x, i]).filter(([x]) => x.team === t && !x.is_pick).map(([x, i]) => i < S.step ? `<img class="d3b" src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}">` : `<span class="d3b ${i === S.step ? 'is-now' : ''}"></span>`).join('');
    return `<div class="wdr wdr--sl"><div class="d2-top">${TT(m, 0, B, now && now.team === 0 ? 'is-on' : '')}${NOW(m, B, now)}${TT(m, 1, B, now && now.team === 1 ? 'is-on' : '')}</div>
      <div class="sl-bn"><div class="sl-bs a"><small>Баны</small><div>${bans(0)}</div></div><div class="sl-bs b"><small>Баны</small><div>${bans(1)}</div></div></div>${ORD(m, B)}<p class="sl-note">Пики встают в состав внизу ↓</p></div>`;
  }
  function phase2(m, B, n) {
    const PB = order(m), now = PB[S.step]; let nb = 0, np = 0;
    const ph = PH(m).map(f => { const cur = f.idx.includes(S.step), done = f.idx[f.idx.length - 1] < S.step;
      return `<div class="p2-ph ${f.pick ? 'is-pick' : 'is-ban'} ${cur ? 'is-now' : done ? 'is-done' : 'is-wait'}"><small>${f.pick ? 'Пик ' + ++np : 'Бан ' + ++nb}</small><div>${f.idx.map(i => { const x = PB[i];
        return `<span class="p2-o ${x.team ? 'b' : 'a'} ${i === S.step ? 'is-now' : ''}">${i < S.step ? `<img src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}">` : '<i></i>'}<em>${esc(x.team ? TM(m.dire_team_id).tag : TM(m.radiant_team_id).tag)}</em></span>`; }).join('')}</div></div>`; }).join('');
    return `<div class="wdr wdr--p2"><div class="d2-top">${TT(m, 0, B, now && now.team === 0 ? 'is-on' : '')}${NOW(m, B, now)}${TT(m, 1, B, now && now.team === 1 ? 'is-on' : '')}</div><div class="p2">${ph}</div></div>`;
  }


  // w-draft-2 v8 (дирижёр 06.11: «как в Доте, только меньше текста и ближе к нашему визуалу» + шанс на победу по ходам драфта)
  // dota3 — без подписей: лого сторон, таймер по центру (пик / бан — одним словом), пятёрки портретами, баны мелко; внизу график шанса Radiant по 24 ходам
  // ‼️ шанс — пример: своей модели прогноза по героям нет; сдвиг на пике/бане — из номера героя (стабильно, не случайно)
  const chance = m => { const PB = order(m); let v = 50; const a = [v];
    PB.forEach(x => { const h = ((x.hero_id * 37) % 11) - 5, k = x.is_pick ? 1.6 : .5, sgn = x.team === 0 ? 1 : -1; v = Math.max(18, Math.min(82, v + sgn * h * k)); a.push(Math.round(v)); }); return a; };
  function dota3(m, B, n) {
    const PB = order(m), now = PB[S.step], st = Math.min(S.step, PB.length);
    const card = (x, i) => i < S.step ? `<img class="d3c" src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)} · ${esc(nick(m, x.hero_id))}">` : `<span class="d3c ${i === S.step ? 'is-now' : ''}"></span>`;
    const ban = (x, i) => i < S.step ? `<img class="d3n" src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}">` : `<span class="d3n ${i === S.step ? 'is-now' : ''}"></span>`;
    const side = t => { const my = PB.map((x, i) => [x, i]).filter(([x]) => x.team === t), on = now && now.team === t, T = TM(tid(m, t));
      return `<div class="d3s ${t ? 'b' : 'a'} ${now ? (on ? 'is-on' : 'is-off') : ''}"><div class="d3s-h"><img src="${B + T.logo}" alt="" title="${esc(T.name)}"><i class="${t ? 'dire' : 'rad'}"></i></div>
        <div class="d3s-p">${my.filter(([x]) => x.is_pick).map(([x, i]) => card(x, i)).join('')}</div><div class="d3s-b">${my.filter(([x]) => !x.is_pick).map(([x, i]) => ban(x, i)).join('')}</div></div>`; };
    const ch = chance(m), W = 1000, Hh = 96, X = i => (i / PB.length * W).toFixed(1), Y = v => (Hh - v / 100 * Hh).toFixed(1), pts = ch.slice(0, st + 1).map((v, i) => `${X(i)},${Y(v)}`);
    const area = `M0,${Y(50)} L${pts.join(' L')} L${X(st)},${Y(50)} Z`, cur = ch[st], lead = cur >= 50 ? 0 : 1, LT = TM(tid(m, lead));
    const ticks = PB.map((x, i) => x.is_pick ? `<line x1="${X(i + 1)}" x2="${X(i + 1)}" y1="${Hh - 4}" y2="${Hh}" />` : '').join('');
    const graph = `<div class="d3g"><svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><defs><clipPath id="d3u"><rect x="0" y="0" width="${W}" height="${Y(50)}"/></clipPath><clipPath id="d3d"><rect x="0" y="${Y(50)}" width="${W}" height="${Hh}"/></clipPath></defs>
      <line class="d3g-m" x1="0" x2="${W}" y1="${Y(50)}" y2="${Y(50)}"/>${ticks}<path class="rad" d="${area}" clip-path="url(#d3u)"/><path class="dire" d="${area}" clip-path="url(#d3d)"/><polyline points="${pts.join(' ')}"/></svg>
      <span class="d3g-v num" style="left:${(st / PB.length * 100).toFixed(1)}%;top:${(100 - cur).toFixed(0)}%"><img src="${B + LT.logo}" alt="">${Math.max(cur, 100 - cur)}%</span></div>`;
    return `<div class="wdr wdr--d3"><div class="d3-t"><b class="num">${now ? clk() : '—'}</b><small>${now ? (now.is_pick ? 'пик' : 'бан') : 'готово'}</small></div><div class="d3-m">${side(0)}${side(1)}</div>${graph}</div>`;
  }


  // w-draft-2 v9 (дирижёр 06.11: «драфт происходит в нижней панели, а по центру — график шанса»): center — таймер, чей ход, баны сторон мелко; крупно график шанса по ходам.
  // Пики встают в состав в нижней панели (../w-draft-2/_wd2.js, WD2_FILL), текущий слот там светится; золото, время, K/D/A внизу — «—» (данных ещё нет)
  function center(m, B, n) {
    const PB = order(m), now = PB[S.step], st = Math.min(S.step, PB.length), TA = TM(m.radiant_team_id), TB = TM(m.dire_team_id);
    // v12+ (дирижёр 06.11: «в конце на 5 секунд выводить шанс по центру экрана»): драфт закончился — по центру крупно итог шанса по драфту, потом плавно — прогноз до 12′
    if (!now && window.WD2_FIN) { const c = chance(m)[PB.length], ca = c, cb = 100 - c, L = ca >= cb ? 'a' : 'b';
      return `<div class="wdr wdr--c9 is-fin"><div class="c9-fin"><small>Шанс по драфту</small>
        <div class="c9-fr"><span class="a${L === 'a' ? ' on' : ''}"><img src="${B + TA.logo}" alt=""><em>${esc(TA.name)}</em><b class="num">${ca}%</b></span><span class="b${L === 'b' ? ' on' : ''}"><b class="num">${cb}%</b><em>${esc(TB.name)}</em><img src="${B + TB.logo}" alt=""></span></div>
        <div class="c9-fb"><i class="rad" style="width:${ca}%"></i><i class="dire" style="width:${cb}%"></i></div></div></div>`; }
    const ban = (x, i) => i < S.step ? `<img class="d3n" src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)}">` : `<span class="d3n ${i === S.step ? 'is-now' : ''}"></span>`;
    const bans = t => `<div class="c9-b ${t ? 'b' : 'a'}">${PB.map((x, i) => [x, i]).filter(([x]) => x.team === t && !x.is_pick).map(([x, i]) => ban(x, i)).join('')}</div>`;
    const who = now ? `<img src="${B + TM(tid(m, now.team)).logo}" alt="">` : '';
    const ch = chance(m), W = 1000, Hh = 300, X = i => (i / PB.length * W).toFixed(1), Y = v => (Hh - v / 100 * Hh).toFixed(1), pts = ch.slice(0, st + 1).map((v, i) => `${X(i)},${Y(v)}`);
    const area = `M0,${Y(50)} L${pts.join(' L')} L${X(st)},${Y(50)} Z`, cur = ch[st], lead = cur >= 50 ? 0 : 1, LT = TM(tid(m, lead));
    let nb = 0, np = 0; const ph = PH(m).map(f => { const a = f.idx[0], b = f.idx[f.idx.length - 1] + 1; return `<span class="c9-ph ${f.idx.includes(S.step) ? 'is-now' : ''}" style="left:${(a / PB.length * 100).toFixed(2)}%;width:${((b - a) / PB.length * 100).toFixed(2)}%">${f.pick ? 'Пик ' + ++np : 'Бан ' + ++nb}</span>`; }).join('');
    const dots = PB.map((x, i) => x.is_pick && i < st ? `<circle cx="${X(i + 1)}" cy="${Y(ch[i + 1])}" r="4" class="${x.team ? 'dire' : 'rad'}"/>` : '').join('');
    return `<div class="wdr wdr--c9"><div class="c9-top">${bans(0)}<div class="c9-t">${who}<b class="num">${now ? clk() : '—'}</b><small>${now ? (now.is_pick ? 'пик' : 'бан') : 'готово'}</small></div>${bans(1)}</div>
      <div class="c9-g"><span class="c9-l a"><img src="${B + TA.logo}" alt="">${esc(TA.tag)}</span><span class="c9-l b"><img src="${B + TB.logo}" alt="">${esc(TB.tag)}</span>
        <svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><defs><clipPath id="c9u"><rect x="0" y="0" width="${W}" height="${Y(50)}"/></clipPath><clipPath id="c9d"><rect x="0" y="${Y(50)}" width="${W}" height="${Hh}"/></clipPath></defs>
        <line class="d3g-m" x1="0" x2="${W}" y1="${Y(50)}" y2="${Y(50)}"/><path class="rad" d="${area}" clip-path="url(#c9u)"/><path class="dire" d="${area}" clip-path="url(#c9d)"/><polyline points="${pts.join(' ')}"/></svg>${PB.map((x, i) => x.is_pick && i < st ? `<i class="c9-d ${x.team ? 'dire' : 'rad'}" style="left:${(i + 1) / PB.length * 100}%;top:${100 - ch[i + 1]}%"></i>` : '').join('')}
        <span class="d3g-v num" style="left:${(st / PB.length * 100).toFixed(1)}%;top:${(100 - cur).toFixed(0)}%"><img src="${B + LT.logo}" alt="">${Math.max(cur, 100 - cur)}%</span>
        ${window.WD2_VL ? PH(m).slice(1).map(f => `<i class="c9-vl" style="left:${(f.idx[0] / PB.length * 100).toFixed(2)}%"></i>`).join('') : ''}<div class="c9-x">${ph}</div></div></div>`;   /* WD2_VL (дирижёр 06.11): тонкие линии начала фаз через весь график — порядок ходов Captain's Mode известен заранее */
  }

  function html(o) {
    const m = o.m, B = o.base || '';
    if (o.state === 'draft') return o.look === 'cm' ? cm(m, B, o.n) : o.look === 'dota' ? dota(m, B, o.n) : o.look === 'phase' ? phase(m, B, o.n) : o.look === 'center' ? center(m, B, o.n) : o.look === 'dota3' ? dota3(m, B, o.n) : o.look === 'dota2' ? dota2(m, B, o.n) : o.look === 'slots' ? slots(m, B, o.n) : o.look === 'phase2' ? phase2(m, B, o.n) : live(m, B, o.n);
    if (o.look === 'col') { const t = o.side; return `<div class="wdr wdr--col">${team(m, t, B)}${order(m).filter(x => x.team === t && x.is_pick).map(x => pick(m, x, B, true)).join('')}<div class="wdr-bans">${order(m).filter(x => x.team === t && !x.is_pick).map(x => ban(x, B)).join('')}</div></div>`; }
    if (['cs', 'dltv', 'hawk', 'flap'].includes(o.look)) return site(o, m, B);
    if (['lanes', 'phases', 'both', 'fit'].includes(o.look)) return more(o, m, B);
    if (o.look === 'order') return `<div class="wdr wdr--card"><div class="wdr-hd"><b>Драфт · карта ${o.n}</b><span>по порядку ходов</span></div><div class="wdr-ord-t">${team(m, 0, B)}${team(m, 1, B)}</div>${strip(m, B)}</div>`;
    if (o.look === 'fold') { const five = t => order(m).filter(x => x.team === t && x.is_pick).map(x => `<img src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)} · ${esc(nick(m, x.hero_id))}">`).join(''), open = S.open.has(m.match_id);
      return `<div class="wdr wdr--fold"><button class="wdr-fl" data-wdr-fold="${m.match_id}"><b>Драфт</b>${team(m, 0, B)}<span class="wdr-mf">${five(0)}</span><span class="wdr-vs">vs</span><span class="wdr-mf">${five(1)}</span>${team(m, 1, B)}<em>${open ? 'Свернуть' : 'Порядок ходов'} ${open ? '▴' : '▾'}</em></button>${open ? strip(m, B) : ''}</div>`; }
    if (o.look === 'half') return `<div class="wdr wdr--half">${side(m, o.side, B, true)}</div>`;
    if (o.look === 'mini') { const five = t => order(m).filter(x => x.team === t && x.is_pick).map(x => `<img src="${B + H(x.hero_id).img}" alt="" title="${esc(H(x.hero_id).name)} · ${esc(nick(m, x.hero_id))}">`).join('');
      return `<div class="wdr wdr--mini">${team(m, 0, B)}<span class="wdr-mf">${five(0)}</span><span class="wdr-vs">vs</span><span class="wdr-mf">${five(1)}</span>${team(m, 1, B)}</div>`; }
    return `<div class="wdr wdr--card"><div class="wdr-hd"><b>Драфт · карта ${o.n}</b><span>${order(m).filter(x => x.is_pick).length} пиков · ${order(m).filter(x => !x.is_pick).length} банов</span></div>${side(m, 0, B, true)}${side(m, 1, B, true)}</div>`;
  }

  // один таймер на страницу: идёт драфт — шаг каждые 1,5 с, по кругу; перерисовываются только живые виджеты
  function tick() {
    const els = [...document.querySelectorAll('[data-wdr-live]')];
    if (!els.length) { clearInterval(S.timer); S.timer = null; return; }
    S.left -= 5;
    if (S.left <= 0) { S.left = 30; const was = S.step; S.step = S.step >= 24 ? (window.WDR_ONCE ? 24 : 0) : S.step + 1; /* WDR_ONCE (w-draft-2 v10): драфт один раз, без повтора по кругу; закончился — больше не перерисовываем */ if (S.step !== was) { if (S.step >= 24 && window.WD2_SOFT) { /* w-draft-2 v18+: драфт сначала гаснет (0,5 с), потом появляется итог */ els.forEach(el => el.classList.add('wdr-out')); setTimeout(() => els.forEach(el => { el.innerHTML = html(el._wdr); el.classList.remove('wdr-out'); }), 500); } else els.forEach(el => (el.innerHTML = html(el._wdr))); } }
    else document.querySelectorAll('.wdr-clock').forEach(c => (c.textContent = '0:' + String(S.left).padStart(2, '0')));
  }

  // свёрнутый драфт: нажал — порядок ходов
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-wdr-fold]'); if (!b) return; e.preventDefault();
    const id = +b.dataset.wdrFold; S.open.has(id) ? S.open.delete(id) : S.open.add(id);
    document.querySelectorAll('[data-wd="draft"]').forEach(el => el._wdr && el._wdr.m.match_id === id && (el.innerHTML = html(el._wdr)));
  });

  window.WDRAFT = {
    step: () => S.step, order, nick: (m, h) => nick(m, h), hero: id => H(id),
    render(el, o) {
      if (window.WDR_START && !S.st0) { S.st0 = true; S.step = window.WDR_START; }   // WDR_START (w-draft-2 v11): начать с этого хода — конец драфта и переход; флаг ставится после загрузки скрипта, поэтому читаем при первой отрисовке
      el._wdr = o; el.innerHTML = html(o);
      if (o.state === 'draft') { el.setAttribute('data-wdr-live', ''); if (!S.timer) S.timer = setInterval(tick, 250); } else el.removeAttribute('data-wdr-live');
    },
  };
})();
