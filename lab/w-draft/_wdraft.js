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

  function html(o) {
    const m = o.m, B = o.base || '';
    if (o.state === 'draft') return o.look === 'cm' ? cm(m, B, o.n) : live(m, B, o.n);
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
    if (S.left <= 0) { S.left = 30; S.step = S.step >= 24 ? 0 : S.step + 1; els.forEach(el => (el.innerHTML = html(el._wdr))); }
    else document.querySelectorAll('.wdr-clock').forEach(c => (c.textContent = '0:' + String(S.left).padStart(2, '0')));
  }

  // свёрнутый драфт: нажал — порядок ходов
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-wdr-fold]'); if (!b) return; e.preventDefault();
    const id = +b.dataset.wdrFold; S.open.has(id) ? S.open.delete(id) : S.open.add(id);
    document.querySelectorAll('[data-wd="draft"]').forEach(el => el._wdr && el._wdr.m.match_id === id && (el.innerHTML = html(el._wdr)));
  });

  window.WDRAFT = {
    render(el, o) {
      el._wdr = o; el.innerHTML = html(o);
      if (o.state === 'draft') { el.setAttribute('data-wdr-live', ''); if (!S.timer) S.timer = setInterval(tick, 250); } else el.removeAttribute('data-wdr-live');
    },
  };
})();
