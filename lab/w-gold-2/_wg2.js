// w-gold-2 v6+ — график «Перевес по золоту», визуальные варианты (дирижёр 30.10: «докрутить визуально, ближе к современным трейдинг-платформам»).
// Управление — как v5 (щипок + ведение пальцем по нажатию), кнопок меньше: события и трансляция значками; «к текущему» — круглая кнопка, только когда приближено.
// WG2.render(el, o) / WG2.set(el, patch) — как WGOLD. o.look: rh — крупная цифра сверху (Robinhood) · tv — перекрестие и метки на шкале (TradingView) · pm — плавная линия и пузырь (Polymarket).
// Данные и события — те же, что у w-gold (OpenDota). Код страницы матча (w-gold/_wgold.js) не трогает.
(() => {
  const D = window.GS_DATA;
  const HERO = Object.fromEntries(Object.entries(D.heroes).map(([id, h]) => [h.short, { ...h, id: +id }]));
  const hero = key => HERO[key.replace('npc_dota_hero_', '')] || { name: key, img: '' };
  // названия команд — из общей базы страницы GS_NAMES (gs-match/_wfit.js: NAME — как пишет команда, SHORT — коротко), не сырые OpenDota (там «TEAM VISION» капсом); решение дирижёра 30.10
  const team = id => { const t = D.teams[id] || { name: '—', tag: '—', logo: '' }, N = window.GS_NAMES; return N && N.NAME[id] ? { ...t, name: N.NAME[id], tag: N.SHORT[id] || t.tag } : t; };
  const k = v => (v < 0 ? '−' : '+') + (Math.abs(v) / 1000).toFixed(1) + 'k';
  const kk = v => (Math.abs(v) / 1000).toFixed(1) + 'k';
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const at = (m, s) => { const a = m.radiant_gold_adv, i = Math.min(Math.floor(s / 60), a.length - 1), f = s / 60 - i; return a[i] + ((a[i + 1] ?? a[i]) - a[i]) * Math.min(1, f); };
  const deathsOf = m => { const by = Object.fromEntries(m.players.map(p => [p.hero_id, p]));
    return m.players.flatMap(p => p.kills_log.map(l => { const h = hero(l.key), v = by[h.id]; return { t: l.time, h, v, rad: v ? v.isRadiant : !p.isRadiant, kp: p, kh: D.heroes[p.hero_id] }; })).sort((a, b) => a.t - b.t); };
  const fights = (ds, now) => { const out = []; for (const d of ds.filter(d => d.t <= now)) { const f = out[out.length - 1]; if (f && d.t - f.last <= 25) { f.ds.push(d); f.last = d.t; } else out.push({ ds: [d], last: d.t }); } return out; };
  const objs = (m, now) => m.objectives.filter(o => o.time <= now && (o.type === 'CHAT_MESSAGE_ROSHAN_KILL' || (o.type === 'building_kill' && /tower|rax/.test(o.key))));
  const MIN = 180; // ближе 3 минут не приближаем: данные поминутные

  const ICON = {
    ev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l3 3-3 3-3-3z"/><path d="M4 21h16M8 21v-6M16 21v-9"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="13" rx="2"/><rect x="12" y="11" width="7" height="5" rx="1" fill="currentColor"/></svg>',
    now: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h11M12 7l5 5-5 5M20 5v14"/></svg>',
    all: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>',
  };
  const LOOK = {
    rh: { hd: 76, R: 44, lw: 2, smooth: false, fill: .30, grid: 'dots' },
    tv: { hd: 32, R: 52, lw: 1.5, smooth: false, fill: .16, grid: 'lines' },
    pm: { hd: 76, R: 40, lw: 2.5, smooth: true, fill: 0, grid: 'zero' },
    mx: { hd: 34, R: 52, lw: 2, smooth: false, fill: .22, grid: 'lines' }, // v17: tv (линия текущего значения, перекрестие) + «кто ведёт» крупно — в строке ведущей команды
  };
  // плавная линия (pm): кривая через точки, без выбросов за соседние значения по y
  const curve = p => p.length < 3 ? 'M' + p.map(q => q.join(',')).join('L') : p.reduce((s, q, i) => {
    if (!i) return `M${q[0]},${q[1]}`; const a = p[i - 2] || p[i - 1], b = p[i - 1], c = q, d = p[i + 1] || q;
    const lo = Math.min(b[1], c[1]), hi = Math.max(b[1], c[1]);
    const c1 = [b[0] + (c[0] - a[0]) / 6, clamp(b[1] + (c[1] - a[1]) / 6, lo, hi)], c2 = [c[0] - (d[0] - b[0]) / 6, clamp(c[1] - (d[1] - b[1]) / 6, lo, hi)];
    return s + `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`; }, '');
  let uid = 0;

  // сверка узлов вместо innerHTML: тот же тег — обновить атрибуты и детей; <img> с тем же src не трогать (не мигает)
  function morph(host, html) { const t = document.createElement('template'); t.innerHTML = html; sync(host, t.content); }
  function sync(a, b) { const A = [...a.childNodes], B = [...b.childNodes];
    B.forEach((nb, i) => { const na = A[i];
      if (!na) { a.appendChild(nb.cloneNode(true)); return; }
      if (na.nodeType !== nb.nodeType || na.nodeName !== nb.nodeName) { a.replaceChild(nb.cloneNode(true), na); return; }
      if (nb.nodeType === 3) { if (na.nodeValue !== nb.nodeValue) na.nodeValue = nb.nodeValue; return; }
      if (nb.nodeType !== 1) return;
      [...na.attributes].forEach(x => { if (!nb.hasAttribute(x.name)) na.removeAttribute(x.name); });
      [...nb.attributes].forEach(x => { if (na.getAttribute(x.name) !== x.value) na.setAttribute(x.name, x.value); });
      if (nb.nodeName !== 'IMG') sync(na, nb); });
    A.slice(B.length).forEach(n => n.remove()); }
  function draw(el) {
    const S = el._g2, o = S.o, m = o.m, Lk = LOOK[o.look] || LOOK.rh, box = el.querySelector('.g2-plot'); if (!box) return;
    const W = box.clientWidth; if (!W) return;
    if (o.state === 'nodata') { box.style.height = (o.h ? o.h(W) : 320) + 'px'; box.innerHTML = '<div class="g2-empty">Нет данных о золоте — карта идёт</div>'; el.querySelector('.g2-l').innerHTML = `<div class="g2-cap">Золото · карта ${o.n}</div>`; return; }
    box.style.height = '';
    const H = (o.h ? o.h(W) : W >= 600 ? 480 : 320) + (o.out ? 80 : 0), now = o.state === 'post' ? m.duration : Math.min(o.t, m.duration), live = o.state === 'live', IMG = o.base || ''; // o.out: +80 под две строки команд — поле графика не меньше, чем было
    // o.out (v15+, дирижёр 30.10: «названия не внутри графика, а снаружи»): строка Radiant — над графиком, строка Dire — под осью времени
    const TB = o.out ? 40 : 0, L = 8, R = Lk.R, top = Lk.hd + TB, evH = S.ev ? 26 : 0, plotB = H - 20 - evH - TB, xl = H - 5 - TB;
    // окно: o.win = { span, end } (end null — живой край); без o.win — вся карта
    const wn = o.win, bE = wn && wn.end != null ? Math.min(now, Math.max(wn.span, wn.end)) : now, a0 = wn ? Math.max(0, bE - wn.span) : 0, edge = bE === now;
    const X = s => L + ((s - a0) / (bE - a0)) * (W - L - R);
    const secs = [a0]; for (let s = Math.floor(a0 / 60) * 60 + 60; s < bE; s += 60) secs.push(s); secs.push(bE);
    const vals = secs.map(s => at(m, s)); let hi = Math.max(0, ...vals), lo = Math.min(0, ...vals); const pad = Math.max(800, (hi - lo) * .12); hi += pad; lo -= pad;
    const step = [500, 1000, 2000, 5000, 10000, 20000].find(s => (hi - lo) / s <= (H > 400 ? 6 : 4)) || 20000;
    const Y = v => top + (hi - v) / (hi - lo) * (plotB - top), z = Y(0), id = 'g2' + S.id;
    const sc = S.sc != null && S.sc <= now ? S.sc : null;
    let g = ''; const GR = o.pmGrid ? 'dots' : Lk.grid; // v27: как на Polymarket — горизонтали редкими точками, вертикальных линий минут нет
    // сетка: rh — точки, tv — линии и вертикали, pm — только ноль
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { const y = Y(v);
      if (v && GR === 'dots') g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#27272a" stroke-dasharray="1 5" stroke-linecap="round"/>`;
      if (v && GR === 'lines') g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#1c1c20"/>`;
      if (GR !== 'zero' || !v) g += `<text x="${W - R + 8}" y="${y + 4}">${v ? k(v) : '0'}</text>`; }
    g += o.v23 ? `<line x1="${L}" x2="${W - R}" y1="${z}" y2="${z}" stroke="#71717a" stroke-width="1.2"/>` : `<line x1="${L}" x2="${W - R}" y1="${z}" y2="${z}" stroke="#3f3f46" stroke-dasharray="4 4"/>`; // v23: ось 0 — сплошная, ярче сетки (созвон 02.11 §1.5.6)
    const tk = [10, 5, 2, 1].find(t => (bE - a0) / (t * 60) <= (W >= 600 ? 9 : 5)) || 1;
    for (let mi = Math.floor(a0 / 60 / tk) * tk + tk; mi * 60 < bE; mi += tk) { const x = X(mi * 60);
      if (GR === 'lines') g += `<line x1="${x}" x2="${x}" y1="${top}" y2="${plotB}" stroke="#1c1c20"/>`;
      if (W - R - x > 40 && x - L > 12) g += `<text${o.v23 ? ' class="g2-tx"' : ''} x="${x}" y="${xl}" text-anchor="middle">${mi}'</text>`; } // v23: минуты контрастнее (§1.5.4)
    // линия: выше нуля — зелёная, ниже — красная; заливка тает к нулю
    const pts = secs.map(s => [+X(s).toFixed(1), +Y(at(m, s)).toFixed(1)]), d = (Lk.smooth || o.smooth) ? curve(pts) : 'M' + pts.map(q => q.join(',')).join('L');
    const area = `${d}L${X(bE)},${z}L${X(a0)},${z}Z`;
    g += `<defs><clipPath id="u${id}"><rect x="0" y="0" width="${W}" height="${z}"/></clipPath><clipPath id="d${id}"><rect x="0" y="${z}" width="${W}" height="${H}"/></clipPath>
      <linearGradient id="gu${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${z}"><stop offset="0" style="stop-color:var(--up);stop-opacity:${Lk.fill}"/><stop offset="1" style="stop-color:var(--up);stop-opacity:0"/></linearGradient>
      <linearGradient id="gd${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${plotB}" x2="0" y2="${z}"><stop offset="0" style="stop-color:var(--dn);stop-opacity:${Lk.fill}"/><stop offset="1" style="stop-color:var(--dn);stop-opacity:0"/></linearGradient></defs>
      ${Lk.fill ? `<path d="${area}" fill="url(#gu${id})" clip-path="url(#u${id})"/><path d="${area}" fill="url(#gd${id})" clip-path="url(#d${id})"/>` : ''}
      <g class="${sc != null ? 'g2-dim' : ''}"><path d="${d}" fill="none" stroke="var(--up)" stroke-width="${Lk.lw}" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#u${id})"/>
      <path d="${d}" fill="none" stroke="var(--dn)" stroke-width="${Lk.lw}" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#d${id})"/></g>`;
    // tv: пунктир на текущем значении через весь график
    const vNow = at(m, now), yNow = Y(vNow), TVL = o.look === 'tv' || o.look === 'mx';
    if (TVL && edge) g += `<line x1="${L}" x2="${W - R}" y1="${yNow}" y2="${yNow}" stroke="${vNow >= 0 ? 'var(--up)' : 'var(--dn)'}" stroke-dasharray="2 3" opacity=".7"/>`;
    // события: башни и Рошан — тонкой засечкой у низа графика; драки — ромбами (pm — кружками) в полосе под графиком
    if (S.ev) {
      for (const ob of objs(m, now).filter(ob => ob.time >= a0 && ob.time <= bE)) { const x = X(ob.time), r = ob.type !== 'building_kill';
        g += r ? `<circle cx="${x}" cy="${plotB - 6}" r="3.5" fill="#eab308"/>` : `<rect x="${x - 2.5}" y="${plotB - 9}" width="5" height="7" rx="1" fill="${/goodguys/.test(ob.key) ? 'var(--dn)' : 'var(--up)'}" opacity=".85"/>`; }
      fights(S.ds, now).forEach((f, i) => { const t0 = f.ds[0].t; if (t0 < a0 || t0 > bE) return;
        const x = X(t0), y = plotB + 14, n = f.ds.length, a = f.ds.filter(q => !q.rad).length >= n / 2, c = a ? 'var(--up)' : 'var(--dn)';
        const mark = o.look === 'pm' ? `<circle cx="${x}" cy="${y}" r="${4 + Math.min(n, 5)}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="1.2"/>`
          : `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2" transform="rotate(45 ${x} ${y})" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="1.2"/>`;
        if (o.v23) { // v23 (созвон 02.11 §1.5.5, 1.5.8): ромб долями по фрагам — доля цвета = доля убийств стороны; число всего — внутри; одиночная смерть — маленький ромб без числа; от ромба пунктир вверх к линии и точка на ней
          const kR = f.ds.filter(q => !q.rad).length, sh = kR / n, r = n === 1 ? 4.5 : 7 + Math.min(n, 6) * 0.9, gid = `fr${id}_${i}`, yl = Y(at(m, t0));
          if (o.ring && n > 1) { // v25: по краям — рамка из долей (как кольцевая диаграмма, только ромбом), внутри — число на чёрном ромбе
            const R2 = r + 2, P = 4 * Math.SQRT2 * R2, gl = sh * P, dia = `M${x},${y - R2}L${x + R2},${y}L${x},${y + R2}L${x - R2},${y}Z`, ri = R2 - 3.2;
            g += `<g class="dm dm2${S.pop === i ? ' on' : ''}" data-f="${i}"><line class="dm-st" x1="${x}" x2="${x}" y1="${y - R2 - 2}" y2="${yl + 3}"/><circle class="dm-pt" cx="${x}" cy="${yl}" r="2.6" fill="${at(m, t0) >= 0 ? 'var(--up)' : 'var(--dn)'}"/>
              <circle cx="${x}" cy="${y}" r="16" fill="transparent"/><path d="${dia}" fill="#09090b"/>
              ${sh > 0 ? `<path d="${dia}" fill="none" stroke="var(--up)" stroke-width="3.2" stroke-linejoin="miter" stroke-dasharray="${gl.toFixed(2)} ${P.toFixed(2)}"/>` : ''}${sh < 1 ? `<path d="${dia}" fill="none" stroke="var(--dn)" stroke-width="3.2" stroke-linejoin="miter" stroke-dasharray="0 ${gl.toFixed(2)} ${(P - gl).toFixed(2)} ${P.toFixed(2)}"/>` : ''}
              <path d="M${x},${y - ri}L${x + ri},${y}L${x},${y + ri}L${x - ri},${y}Z" fill="#09090b"/><text class="dm-n2" x="${x}" y="${y + 3.4}" text-anchor="middle">${n}</text></g>`; return; }
          g += `<g class="dm dm2${S.pop === i ? ' on' : ''}" data-f="${i}"><line class="dm-st" x1="${x}" x2="${x}" y1="${y - r - 1}" y2="${yl + 3}"/><circle class="dm-pt" cx="${x}" cy="${yl}" r="2.6" fill="${at(m, t0) >= 0 ? 'var(--up)' : 'var(--dn)'}"/>
            <defs><linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${x - r}" y1="0" x2="${x + r}" y2="0"><stop offset="${sh}" stop-color="var(--up)"/><stop offset="${sh}" stop-color="var(--dn)"/></linearGradient></defs>
            <circle cx="${x}" cy="${y}" r="16" fill="transparent"/><path d="M${x},${y - r}L${x + r},${y}L${x},${y + r}L${x - r},${y}Z" fill="url(#${gid})" stroke="#09090b" stroke-width="1.2" stroke-linejoin="round"/>
            ${n > 1 ? `<text class="dm-n2" x="${x}" y="${y + 3.4}" text-anchor="middle">${n}</text>` : ''}</g>`; return; }
        g += `<g class="dm${S.pop === i ? ' on' : ''}" data-f="${i}"><circle cx="${x}" cy="${y}" r="16" fill="transparent"/>${mark}${n > 1 ? `<text class="dm-n" x="${x}" y="${y - 10}" text-anchor="middle">${n}</text>` : ''}</g>`; });
    }
    // палец на графике: линия, точка (и для tv — горизонталь)
    let ov = '';
    if (sc != null) { const x = X(sc), v = at(m, sc), y = Y(v), c = v >= 0 ? 'var(--up)' : 'var(--dn)';
      g += `<line x1="${x}" x2="${x}" y1="${top - 4}" y2="${plotB}" stroke="#71717a" ${TVL ? 'stroke-dasharray="3 3"' : ''}/>`;
      if (TVL) g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#71717a" stroke-dasharray="3 3"/>`;
      g += `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="#09090b" stroke-width="2"/>`;
      if (TVL) ov += `<div class="g2-tag g2-tag--n num" style="top:${y}px;left:${W - R + 2}px">${k(v)}</div><div class="g2-xb num" style="left:${x}px;top:${xl - 13}px">${mmss(sc)}</div>`;
      if (o.look === 'pm') ov += `<div class="g2-bub num" style="left:${clamp(x, 44, W - R - 44)}px;top:${y}px"><span>${mmss(sc)}</span><b class="${v >= 0 ? 'up' : 'dn'}">${k(v)}</b></div>`;
      ov += near(S, sc, x, W, R, plotB, IMG);
    }
    // живой край: точка с пульсом; tv — метка значения на шкале
    if (edge) { ov += `<div class="g2-end${live ? ' is-live' : ''}" style="left:${X(now)}px;top:${yNow}px;--c:${vNow >= 0 ? 'var(--up)' : 'var(--dn)'}"></div>`;
      if (TVL) ov += `<div class="g2-tag num" style="top:${yNow}px;left:${W - R + 2}px;background:${vNow >= 0 ? 'var(--up)' : 'var(--dn)'}">${k(vNow)}</div>`; }
    // команды у графика: сверху Radiant, снизу Dire (tv — в строке сверху)
    const A = team(m.radiant_team_id), B = team(m.dire_team_id);
    // o.big (v13+, дирижёр 30.10: «явнее показать команду, побольше»): плашки команд крупнее — лого 24, полное имя, тон стороны; и в tv тоже
    if (o.out && o.look === 'mx') { const vr = at(m, sc ?? now), ld = Math.abs(vr) < 500 ? 0 : vr > 0 ? 1 : -1;
      // строка команды: у ведущей — крупно перевес и «ведёт» (под пальцем — на эту минуту); поровну — у обеих «поровну»
      // v18 (o.neat, дирижёр 30.10: «аккуратнее, не на всю ширину»): обе строки одинаковые, без плашек; у ведущей — имя ярче и аккуратная пилюля «ведёт 6.4k» её цветом
      // v19+ (o.lead, дирижёр 30.10: «плашку поярче, без лишнего текста»): solid — залитая цветом стороны · arrow — крупная стрелка и число · ring — лого в цветном кольце, имя цветом · bar — полоска размера перевеса (от максимума карты)
      const mx = Math.max(1, ...m.radiant_gold_adv.slice(0, Math.floor(now / 60) + 1).map(Math.abs));
      const lead = v => !o.lead ? `<b class="num">ведёт · ${kk(v)}</b>`
        : o.lead === 'arrow' ? `<b class="g2-ld g2-ld--arrow num">▲ ${kk(v)}</b>`
        : o.lead === 'bar' ? `<i class="g2-ld--bar"><i style="width:${Math.round(Math.min(1, Math.abs(v) / mx) * 100)}%"></i></i><b class="g2-ld g2-ld--plain num">${kk(v)}</b>`
        : `<b class="g2-ld g2-ld--${o.lead} num">+${kk(v)}</b>`;
      const row = o.neat ? (T, side, y, me) => `<div class="g2-r2 ${side}${ld === me ? ' is-lead' : ''}${o.lead ? ' g2-r2--' + o.lead : ''}" style="top:${y}px"><img src="${IMG + T.logo}" alt=""><span>${T.name}</span>
        ${ld === me ? lead(vr) : ''}</div>`
        : (T, side, y, me) => `<div class="g2-tb g2-tb--out g2-row ${side}${ld === me ? ' is-lead' : ''}" style="top:${y}px;right:${R}px"><img src="${IMG + T.logo}" alt=""><span>${T.name}</span>
        ${ld === me ? `<em>ведёт</em><b class="num">${kk(vr)}</b>` : ld ? '' : '<em>поровну</em>'}</div>`;
      ov += row(A, 'a', top - TB + 2, 1) + row(B, 'b', H - TB + 2, -1); }
    else if (o.out) ov += `<div class="g2-tb g2-tb--out a" style="top:${top - TB + 2}px"><img src="${IMG + A.logo}" alt=""><span>${A.name}</span></div><div class="g2-tb g2-tb--out b" style="top:${H - TB + 2}px"><img src="${IMG + B.logo}" alt=""><span>${B.name}</span></div>`;
    else if (o.big) ov += `<div class="g2-tb a" style="top:${top + 4}px"><img src="${IMG + A.logo}" alt=""><span>${A.name}</span></div><div class="g2-tb b" style="top:${plotB - 40}px"><img src="${IMG + B.logo}" alt=""><span>${B.name}</span></div>`;
    else if (o.look !== 'tv') ov += `<div class="g2-tm" style="top:${top + 2}px"><img src="${IMG + A.logo}" alt="">${A.tag}</div><div class="g2-tm" style="top:${plotB - 22}px"><img src="${IMG + B.logo}" alt="">${B.tag}</div>`;
    // «к текущему» — только когда приближено: не у края — к краю, у края — вся карта
    const zcHtml = () => { const span = bE - a0; return `<button data-zc="in" title="Приблизить"${span <= MIN + 1 ? ' disabled' : ''}>+</button><button data-zc="out" title="Отдалить"${!wn ? ' disabled' : ''}>−</button><button data-zc="reset" title="Вернуть как было"${!wn ? ' disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg></button>` };
    if (o.ctl && o.ztop) { const ic = el.querySelector('.g2-ic'); let zt = ic && ic.querySelector('.g2-zt'); if (ic && !zt) { zt = document.createElement('span'); zt.className = 'g2-zt'; ic.prepend(zt) } if (zt) zt.innerHTML = zcHtml() }
    else if (o.ctl) { const span = bE - a0; ov += `<div class="g2-zc" style="top:${plotB - 104 - (S.ev ? 0 : 0)}px;right:${R + 6}px"><button data-zc="in" title="Приблизить"${span <= MIN + 1 ? ' disabled' : ''}>+</button><button data-zc="out" title="Отдалить"${!wn ? ' disabled' : ''}>−</button><button data-zc="reset" title="Вернуть как было"${!wn ? ' disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg></button></div>`; }
    else if (wn) ov += `<button class="g2-fab" data-z="${edge ? 'all' : 'now'}" style="top:${plotB - 40}px;right:${R + 6}px" title="${edge ? 'Вся карта' : live ? 'К текущему' : 'К концу'}">${edge ? ICON.all : ICON.now}</button>`;
    // Claude-A 03.11 (дирижёр: «лого под графиком мигают, наведение на них не работает»): в live поле рисуется 30 раз в секунду —
    // раньше каждый кадр пересоздавались и подписи команд с лого. Теперь линия (svg) — заменяется, а надписи поверх — сверяются по узлам: картинки не пересоздаются
    const ovh = ov + (S.pop != null ? pop(S, X, W, now, IMG, Y) : '');
    let sv = box.querySelector(':scope > svg'), ow = box.querySelector(':scope > .g2-ovw');
    if (!sv || !ow) { box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}">${g}</svg><div class="g2-ovw" style="display:contents">${ovh}</div>`; box.querySelector('.g2-ovw')._h = ovh; }
    else { sv.setAttribute('viewBox', `0 0 ${W} ${H}`); sv.setAttribute('height', H); sv.innerHTML = g; if (ow._h !== ovh) { morph(ow, ovh); ow._h = ovh; } }
    head(el, S, sc, now, A, B);
    S.geo = { L, R, W, a: a0, b: bE, now };
    el.querySelectorAll('[data-zc]').forEach(b => { b.onpointerdown = e => e.stopPropagation(); b.onclick = e => { e.stopPropagation(); const z = b.dataset.zc, span = bE - a0, nowT = now;
      let A1, B1; if (z === 'reset') { A1 = 0; B1 = nowT } else { const ns = Math.min(nowT, z === 'in' ? Math.max(MIN, span / 1.6) : span * 1.6), c = edge ? nowT : (a0 + bE) / 2; B1 = edge ? nowT : Math.min(nowT, c + ns / 2); A1 = Math.max(0, B1 - ns); B1 = A1 + ns }
      const fin = (a, b) => { const sp = b - a; S.o.win = sp >= S.geo.now - 1 ? null : { span: sp, end: b >= S.geo.now - 2 ? null : b } };
      if (!o.smoothZ) { fin(A1, B1); return draw(el); }
      // v25: плавно — окно переезжает за 260 мс
      cancelAnimationFrame(S.zAnim); const A0 = a0, B0 = bE, t0 = performance.now(), ease = q => 1 - Math.pow(1 - q, 3);
      const step = tm => { const q = Math.min(1, (tm - t0) / 260), e = ease(q); fin(A0 + (A1 - A0) * e, B0 + (B1 - B0) * e); draw(el); S.zAnim = q < 1 ? requestAnimationFrame(step) : 0 };
      S.zAnim = requestAnimationFrame(step); }; });
    const fab = box.querySelector('.g2-fab'); if (fab) fab.onclick = e => { e.stopPropagation(); S.o.win = fab.dataset.z === 'all' ? null : { span: wn.span, end: null }; draw(el); };
    if (o.v23) { box.onpointerover = e => { if (e.pointerType !== 'mouse') return; const dm = e.target.closest('.dm'); if (dm && S.pop !== +dm.dataset.f) { S.pop = +dm.dataset.f; draw(el); } };
      box.onpointerout = e => { if (e.pointerType !== 'mouse') return; const dm = e.target.closest('.dm'); if (dm && !e.relatedTarget?.closest?.('.dm, .g2-pop') && S.pop != null) { S.pop = null; draw(el); } }; }
    box.onclick = e => { if (e.target.closest('.g2-pop, .g2-fab, .g2-zc')) return;
      const dm = e.target.closest('.dm') || document.elementFromPoint(e.clientX, e.clientY)?.closest('.dm'), i = dm ? +dm.dataset.f : null;
      const nx = i == null ? null : S.pop === i ? null : i; if (nx !== S.pop) { S.pop = nx; draw(el); } };
  }

  // шапка графика — по виду; при ведении пальцем показывает минуту под пальцем
  function head(el, S, sc, now, A, B) {
    const o = S.o, m = o.m, IMG = o.base || '', hd = el.querySelector('.g2-hd'), t = sc ?? now, v = at(m, t), T = v >= 0 ? A : B, c = v >= 0 ? 'up' : 'dn';
    const who = Math.abs(v) < 500 ? 'поровну' : `ведёт ${T.name}`, when = sc != null ? `на ${mmss(sc)}` : o.state === 'live' ? `сейчас · ${mmss(now)}` : `итог · ${mmss(now)}`;
    let h = '';
    if (o.look === 'mx') h = `<div class="g2-cap g2-cap--mx num">Золото · карта ${o.n} · ${when}</div>`;
    else if (o.look === 'tv') h = `<div class="g2-leg num${o.big ? ' g2-leg--big' : ''}"><span class="g2-legt"><img src="${IMG + A.logo}" alt="">${o.big ? A.name : A.tag}<i>—</i><img src="${IMG + B.logo}" alt="">${o.big ? B.name : B.tag}</span><span class="mu">${mmss(t)}</span><b class="${c}">${k(v)}</b></div>`;
    else if (o.look === 'pm') { const d5 = v - at(m, Math.max(0, t - 300)), g5 = d5 >= 0 ? A : B;
      h = `<div class="g2-cap">Золото · карта ${o.n}</div><div class="g2-big num"><img src="${IMG + T.logo}" alt=""><span>${Math.abs(v) < 500 ? 'Поровну' : T.name}</span><b class="${c}">${kk(v)}</b></div>
        <div class="g2-sub num"><span class="${d5 >= 0 ? 'up' : 'dn'}">${d5 >= 0 ? '▲' : '▼'} ${kk(d5)} ${g5.tag}</span> за 5 мин · ${when}</div>`; }
    else h = `<div class="g2-cap">Золото · карта ${o.n}</div><div class="g2-big num ${c}">${k(v)}</div><div class="g2-sub${o.big ? ' g2-sub--big' : ''}"><img src="${IMG + T.logo}" alt="">${who} · <span class="num">${when}</span></div>`;
    hd.querySelector('.g2-l').innerHTML = h;
  }

  // что было рядом с пальцем (±30 с): герои погибших, башни, Рошан — строкой над полосой событий
  function near(S, t, x, W, R, plotB, IMG) {
    if (!S.ev) return ''; const m = S.o.m;
    const ds = S.ds.filter(d => Math.abs(d.t - t) <= 30 && d.t <= t + 30).map(d => `<img class="${d.rad ? 'a' : 'b'}" src="${IMG + d.h.img}" alt="">`);
    const ob = objs(m, m.duration).filter(o => Math.abs(o.time - t) <= 30).map(o => o.type === 'building_kill' ? `<i class="g2-tw ${/goodguys/.test(o.key) ? 'b' : 'a'}"></i>` : '<i class="g2-rs"></i>');
    const all = ds.concat(ob); if (!all.length) return '';
    const w = Math.min(6, all.length) * 24 + (all.length > 6 ? 28 : 0) + 8;
    return `<div class="g2-near" style="left:${clamp(x - w / 2, 0, W - R - w)}px;top:${plotB - 38}px">${all.slice(0, 6).join('')}${all.length > 6 ? `<small>+${all.length - 6}</small>` : ''}</div>`;
  }

  function pop(S, X, W, now, IMG, Yf) {
    const f = fights(S.ds, now)[S.pop]; if (!f) return '';
    if (S.o.tip2) { // v28: подсказка в стиле наших виджетов — карточка как .w: шапка (событие и время), счёт драки строкой с лого, золото — тегом; ниже плотный список «убийца → погибший» через тонкие линии
      const m = S.o.m, t0 = f.ds[0].t, t1 = f.last, n = f.ds.length, kA = f.ds.filter(q => !q.rad).length, kB = n - kA, A = team(m.radiant_team_id), B = team(m.dire_team_id);
      const sw = at(m, Math.min(now, t1 + 30)) - at(m, Math.max(0, t0 - 30)), x = clamp(X(t0) - 136, 0, W - 272), y = Yf(at(m, t0));
      const nm = d => (d.v && D.players[d.v.account_id]?.name) || d.h.name, kn = d => (d.kp && D.players[d.kp.account_id]?.name) || d.kh?.name || '—';
      const win = kA === kB ? null : kA > kB ? A : B, gTag = Math.abs(sw) >= 100 ? `<em class="num ${sw >= 0 ? 'up' : 'dn'}">${sw >= 0 ? '+' : '−'}${kk(sw)}</em>` : '', when = `${mmss(t0)}${t1 - t0 >= 5 ? ' – ' + mmss(t1) : ''}`;
      // v29 line — одна плотная шапка (событие · время · счёт · золото), ниже — пары иконок «убийца ✕ погибший» плиткой, ники при наведении не нужны
      if (S.o.tip2 === 'line') return `<div class="g2-pop g2-tip g2-tip--line" style="left:${clamp(X(t0) - 120, 0, W - 240)}px;top:${y + 14}px">
        <div class="g2-tip__hd"><b>${n === 1 ? 'Смерть' : 'Драка'}</b><span class="num">${when}</span>${n > 1 ? `<span class="sc num"><img src="${IMG + A.logo}" alt=""><i class="up">${kA}</i>:<i class="dn">${kB}</i><img src="${IMG + B.logo}" alt=""></span>` : ''}${gTag}</div>
        <div class="g2-tip__grid">${f.ds.map(d => `<span class="p ${d.rad ? 'dn' : 'up'}" title="${kn(d)} ✕ ${nm(d)}">${d.kh ? `<img src="${IMG + d.kh.img}" alt="">` : '<i></i>'}<svg viewBox="0 0 12 12" width="8" height="8"><path d="M3 3l6 6M9 3 3 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><img class="v" src="${IMG + d.h.img}" alt=""></span>`).join('')}</div></div>`;
      // v30 cols — как табло: две колонки по командам, в каждой — кто из команды погиб (герой, ник), сверху лого и сколько убили
      if (/^cols/.test(S.o.tip2)) { const sk = `<b class="g2-skl${S.o.dIc ? ' g2-skl--' + S.o.dIc : ''}${S.o.dWh ? ' g2-skl--wh' : ''}"></b>`; // dIc: x · grave · dagger — другая иконка смерти (v35–v37)
        // cols4 (v34): у каждого погибшего — вместо времени череп; погиб больше раза — череп и «×2»
        const rows = rad => { const L = f.ds.filter(d => d.rad === rad); if (S.o.tip2 !== 'cols4') return L.map(d => [d, `<small class="num">${mmss(d.t)}</small>`]);
          const g = new Map(); L.forEach(d => { const k = d.h.img; g.set(k, g.has(k) ? [g.get(k)[0], g.get(k)[1] + 1] : [d, 1]); });
          return [...g.values()].map(([d, c]) => [d, `<span class="g2-dth">${sk}${c > 1 ? `<em class="num">×${c}</em>` : ''}</span>`]); };
        const col = (T, rad, kills, cls) => `<div class="c"><div class="ch"><img src="${IMG + T.logo}" alt=""><span>${T.tag}</span><b class="num ${cls}">${kills}</b></div>${rows(rad).map(([d, r]) => `<div class="cr"><img src="${IMG + d.h.img}" alt=""><span>${nm(d)}</span>${r}</div>`).join('') || `<div class="cr none">${S.o.tip2 === 'cols' || S.o.tip2 === 'cols2' ? 'без потерь' : '—'}</div>`}</div>`;
        return `<div class="g2-pop g2-tip g2-tip--cols" style="left:${x}px;top:${y + 14}px"><div class="g2-tip__hd"><b>${n === 1 ? 'Смерть' : 'Драка'}</b><span class="num">${when}</span>${gTag}</div>
          <div class="g2-tip__cols">${col(A, true, kA, 'up')}${col(B, false, kB, 'dn')}</div>${S.o.tip2 === 'cols' ? '<div class="g2-tip__ft">Погибшие · убийств у команды — справа от имени</div>' : ''}</div>`; }
      // v31 feed — лента: точка цветом стороны, «убийца убил погибшего» текстом, сверху мини-график золота за драку
      if (S.o.tip2 === 'feed') { const a = Math.max(0, t0 - 45), b = Math.min(now, t1 + 45), N = 24, vs = [...Array(N + 1)].map((_, i) => at(m, a + (b - a) * i / N)), mx = Math.max(500, ...vs.map(Math.abs));
        const sp = vs.map((v, i) => `${(i / N * 248).toFixed(1)},${(18 - v / mx * 16).toFixed(1)}`).join(' ');
        return `<div class="g2-pop g2-tip g2-tip--feed" style="left:${x}px;top:${y + 14}px"><div class="g2-tip__hd"><b>${n === 1 ? 'Смерть' : 'Драка'}</b><span class="num">${when}</span>${n > 1 ? `<span class="sc num"><i class="up">${kA}</i>:<i class="dn">${kB}</i></span>` : ''}${gTag}</div>
          <svg class="g2-tip__sp" viewBox="0 0 248 36" preserveAspectRatio="none"><line x1="0" x2="248" y1="18" y2="18"/><polyline points="${sp}"/></svg>
          <div class="g2-tip__fd">${f.ds.map(d => `<div class="fr"><i class="${d.rad ? 'dn' : 'up'}"></i><small class="num">${mmss(d.t)}</small><span><b>${kn(d)}</b> убил <b class="v">${nm(d)}</b></span><img src="${IMG + d.h.img}" alt=""></div>`).join('')}</div></div>`; }
      return `<div class="g2-pop g2-tip" style="left:${x}px;top:${y + 14}px">
        <div class="g2-tip__hd"><b>${n === 1 ? 'Смерть' : 'Драка'}</b><span class="num">${mmss(t0)}${t1 - t0 >= 5 ? ' – ' + mmss(t1) : ''}</span>${Math.abs(sw) >= 100 ? `<em class="num ${sw >= 0 ? 'up' : 'dn'}">${sw >= 0 ? '+' : '−'}${kk(sw)}</em>` : ''}</div>
        ${n > 1 ? `<div class="g2-tip__sc"><span class="t${win === A ? ' is-w' : ''}"><img src="${IMG + A.logo}" alt="">${A.tag}</span><b class="num"><i class="up">${kA}</i>:<i class="dn">${kB}</i></b><span class="t r${win === B ? ' is-w' : ''}">${B.tag}<img src="${IMG + B.logo}" alt=""></span></div>` : ''}
        <div class="g2-tip__ls">${f.ds.map(d => `<div class="g2-tip__r"><small class="num">${mmss(d.t)}</small><span class="k ${d.rad ? 'dn' : 'up'}">${d.kh ? `<img src="${IMG + d.kh.img}" alt="">` : ''}<span>${kn(d)}</span></span><svg viewBox="0 0 12 12" width="10" height="10"><path d="M3 3l6 6M9 3 3 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span class="v"><img src="${IMG + d.h.img}" alt=""><span>${nm(d)}</span></span></div>`).join('')}</div></div>`; }
    if (S.o.rich) { // v26 (созвон 02.11, 2·09:44: «от нижних элементов пунктир к графику, при наведении на пересечении — тултип»): подсказка у точки на линии — счёт драки по командам, сдвиг золота, кто кого
      const m = S.o.m, t0 = f.ds[0].t, t1 = f.last, n = f.ds.length, kA = f.ds.filter(q => !q.rad).length, kB = n - kA, A = team(m.radiant_team_id), B = team(m.dire_team_id);
      const sw = at(m, Math.min(now, t1 + 30)) - at(m, Math.max(0, t0 - 30)), x = clamp(X(t0) - 130, 0, W - 260), y = Yf(at(m, t0));
      const nm = d => (d.v && D.players[d.v.account_id]?.name) || d.h.name, kn = d => (d.kp && D.players[d.kp.account_id]?.name) || d.kh?.name || '—';
      return `<div class="g2-pop g2-pop--rich" style="left:${x}px;top:${y + 12}px"><div class="g2-ph"><span class="num">${mmss(t0)}${t1 - t0 >= 5 ? '–' + mmss(t1) : ''}</span><span>${n === 1 ? 'Смерть' : 'Драка'}</span></div>
        ${n > 1 ? `<div class="g2-psc"><img src="${IMG + A.logo}" alt=""><b class="num up">${kA}</b><i>:</i><b class="num dn">${kB}</b><img src="${IMG + B.logo}" alt=""><span class="num ${sw >= 0 ? 'up' : 'dn'}">${sw >= 0 ? '+' : '−'}${kk(sw)} золота ${sw >= 0 ? A.tag : B.tag}</span></div>` : ''}
        ${f.ds.map(d => `<div class="g2-pk ${d.rad ? 'b' : 'a'}"><small class="num">${mmss(d.t)}</small>${d.kh ? `<img src="${IMG + d.kh.img}" alt="">` : ''}<span>${kn(d)}</span><i>✕</i><img class="v" src="${IMG + d.h.img}" alt=""><span class="v">${nm(d)}</span></div>`).join('')}</div>`; }
    const x = clamp(X(f.ds[0].t) - 120, 0, W - 240), n = f.ds.length;
    return `<div class="g2-pop" style="left:${x}px"><b>${n} ${n === 1 ? 'смерть' : n < 5 ? 'смерти' : 'смертей'} · ${mmss(f.ds[0].t)}</b>
      ${f.ds.map(d => `<div class="r ${d.rad ? 'a' : 'b'}"><small class="num">${mmss(d.t)}</small><img src="${IMG + d.h.img}" alt="">${(d.v && D.players[d.v.account_id]?.name) || d.h.name}</div>`).join('')}</div>`;
  }

  // жесты — как v5: один палец / мышь с нажатием — ведение; два пальца — щипок и сдвиг; двойной тап (клик) — приблизить / вся карта; Ctrl + колесо — зум
  function gestures(el) {
    const box = el.querySelector('.g2-plot'); box.style.touchAction = 'pan-y';
    const P = new Map(); let two = null, one = null, moved = false, tap = { t: 0, x: 0 }, kind = 'mouse';
    const S = () => el._g2, G = () => S().geo, xIn = e => e.clientX - box.getBoundingClientRect().left;
    const frac = x => clamp((x - G().L) / (G().W - G().L - G().R), 0, 1), tOf = x => clamp(G().a + frac(x) * (G().b - G().a), 0, G().now);
    const setWin = (a, span) => { const now = G().now; span = clamp(span, MIN, now);
      if (span >= now - 1) S().o.win = null; else { a = clamp(a, 0, now - span); const end = a + span; S().o.win = { span, end: end >= now - 2 ? null : end }; } draw(el); };
    const sc = x => { S().sc = x == null ? null : tOf(x); draw(el); };
    const dbl = x => { if (S().o.win) { S().o.win = null; return draw(el); } const span = Math.max(MIN, G().now / 3); setWin(tOf(x) - frac(x) * span, span); };
    let pan = null;
    box.addEventListener('pointerdown', e => {
      if (e.target.closest('.dm, .g2-pop, .g2-fab, .g2-zc') || (e.pointerType === 'mouse' && e.button)) return;
      // v23: мышью — тащить, когда приближено (как карту); наведение — минута под курсором
      if (S().o.ctl && e.pointerType === 'mouse') { if (S().o.win) { pan = { x: xIn(e), a: G().a, span: G().b - G().a }; box.setPointerCapture(e.pointerId); box.classList.add('is-pan'); } return; }
      P.set(e.pointerId, xIn(e)); kind = e.pointerType; box.setPointerCapture(e.pointerId); const xs = [...P.values()];
      if (P.size === 2) { one = null; S().sc = null; moved = true; const cx = (xs[0] + xs[1]) / 2; two = { d: Math.abs(xs[0] - xs[1]) || 1, span: G().b - G().a, t: tOf(cx) }; }
      else if (P.size === 1) { one = xs[0]; moved = false; sc(xs[0]); }
    });
    box.addEventListener('pointermove', e => {
      if (S().o.ctl && e.pointerType === 'mouse') { if (pan) { const dx = xIn(e) - pan.x; setWin(pan.a - dx / (G().W - G().L - G().R) * pan.span, pan.span); } else if (!e.target.closest('.g2-zc, .dm, .g2-pop')) sc(xIn(e)); return; }
      if (!P.has(e.pointerId)) return; P.set(e.pointerId, xIn(e)); const xs = [...P.values()];
      if (two && P.size === 2) { const cx = (xs[0] + xs[1]) / 2, span = two.span * two.d / (Math.abs(xs[0] - xs[1]) || 1); setWin(two.t - frac(cx) * span, span); }
      else if (one != null && P.size === 1) { if (Math.abs(xs[0] - one) > 6) moved = true; sc(xs[0]); }
    });
    const up = e => { if (!P.has(e.pointerId)) return; const x = P.get(e.pointerId); P.delete(e.pointerId);
      if (P.size < 2) two = null;
      if (P.size === 0) { one = null; sc(null);
        if (!moved && e.type === 'pointerup' && e.pointerType !== 'mouse') { const n = Date.now();
          if (n - tap.t < 300 && Math.abs(x - tap.x) < 30) { dbl(x); tap.t = 0; } else tap = { t: n, x }; } } };
    const endPan = () => { if (pan) { pan = null; box.classList.remove('is-pan'); } };
    box.addEventListener('pointerup', e => { endPan(); up(e); }); box.addEventListener('pointercancel', e => { endPan(); up(e); });
    box.addEventListener('pointerleave', e => { if (S().o.ctl && e.pointerType === 'mouse' && !pan && S().sc != null) sc(null); }); // палец пошёл вверх-вниз — прокрутка страницы
    box.addEventListener('dblclick', e => { if (kind === 'mouse') dbl(xIn(e)); });
    box.addEventListener('wheel', e => { const span = G().b - G().a, x = xIn(e);
      if (e.ctrlKey) { e.preventDefault(); const s = span * Math.exp(e.deltaY * 0.01); setWin(tOf(x) - frac(x) * s, s); }
      else if (S().o.win && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); setWin(G().a + e.deltaX / (G().W - G().L - G().R) * span, span); }
    }, { passive: false });
  }

  // каркас: шапка (текст слева, значки справа) + график; трансляция — мини-окно в углу (как w-gold)
  function shell(el) {
    const S = el._g2, A = team(S.o.m.radiant_team_id), B = team(S.o.m.dire_team_id);
    el.innerHTML = `<div class="g2 g2--${S.o.look}${S.o.stl ? ' g2--stl' : ''}${S.o.rich ? ' g2--dot' : ''}${S.o.dot2 ? ' g2--dot2' : ''}"><div class="g2-hd"><div class="g2-l"></div><div class="g2-ic">
      <button data-g="ev" class="${S.ev ? 'on' : ''}" title="События: драки, башни, Рошан">${ICON.ev}</button>
      ${S.o.noTv ? '' : `<button data-g="tv" class="${S.pip ? 'on' : ''}" title="Трансляция — маленьким окном, без звука">${ICON.tv}</button>`}</div></div><div class="g2-plot"></div></div>`;
    el.querySelector('[data-g="ev"]').onclick = () => { S.ev = !S.ev; S.pop = null; shell(el); };
    if (el.querySelector('[data-g="tv"]')) el.querySelector('[data-g="tv"]').onclick = () => { S.pip = !S.pip; shell(el); };
    document.querySelectorAll('.wg-pip').forEach(p => p.remove());
    if (S.pip) { const p = document.createElement('div'); p.className = 'wg-pip'; p.innerHTML = `<span>${A.tag} — ${B.tag} · без звука</span><button title="Закрыть">×</button>`;
      p.querySelector('button').onclick = () => { S.pip = false; shell(el); }; document.body.append(p); }
    gestures(el); draw(el);
  }

  window.WG2 = {
    render(el, o) {
      const S = el._g2 || (el._g2 = { id: ++uid, ev: true, pip: false, pop: null, sc: null }); if (o.noTv) S.pip = false;
      S.o = o; S.ds = deathsOf(o.m); S.pop = null; S.sc = null;
      // v27 (o.glide): live — линия дорисовывается плавно, без скачков от тика к тику (как на Polymarket): время матча течёт непрерывно, кадр — 30 в секунду. ‼️ В лабе — ×6 к реальному, чтобы было видно
      cancelAnimationFrame(S.gl); if (o.glide && o.state === 'live') { let last = performance.now(), acc = 0; const sp = o.glide === true ? 6 : o.glide;
        const loop = tm => { const dt = (tm - last) / 1000; last = tm; acc += dt; S.o.t = Math.min(S.o.m.duration, S.o.t + dt * sp); if (acc >= 1 / 30 && S.sc == null && !S.zAnim) { acc = 0; draw(el); } if (S.o.t < S.o.m.duration && el.isConnected) S.gl = requestAnimationFrame(loop); };
        S.gl = requestAnimationFrame(loop); }
      if (!S.ro && window.ResizeObserver) { S.ro = new ResizeObserver(() => draw(el)); S.ro.observe(el); }
      shell(el);
    },
    set(el, patch) { const S = el._g2; if (!S) return; Object.assign(S.o, patch); draw(el); },
  };
})();
