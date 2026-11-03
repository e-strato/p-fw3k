// Лаба w-actions v4–v6 (дирижёр 29.10: «нужно концептуальнее и сложнее — мини-графики, динамика; мы делаем аналитический инструмент: видно импакт пользователей и можно
// внести свой; трансляция красиво закреплена; у человека как будто есть контроль — видно, сколько людей, какой эффект, это помогает принять решение»).
// Хозяин — ../gs-match/_gs.js (виджет act, первым в правой колонке), сворачивается (../widget-expand WXKey, peek2). На телефоне свёрнутый — док над нижним баром.
// window.ACT2 — концепция:
//   term   — «Терминал матча» (Bloomberg / биржа): эфир, под ним 4 плитки с мини-графиком и изменением за 5 мин — зрители, оценка матча, трибуны, темп чата;
//            нажал плитку — большой график по минутам с метками событий; внизу — «твоё мнение»: ползунок «кто возьмёт карту», твоя точка против толпы ·
//   pulse  — «Пульс на таймлайне»: один большой график по времени матча — перевес по золоту (игра) и настроение толпы поверх, метки событий; видно, как толпа
//            реагирует на игру; твои реакции + / − ставятся точками на текущую минуту и сразу двигают линию толпы ·
//   market — «Рынок мнений» (Polymarket): исходы как рынки — «Spirit берут карту 3» 72 % с графиком цены, объём голосов, изменение; вкладываешь очки в мнение —
//            видишь, насколько сдвинул цену; эфир — плавающее мини-окно сверху.
// v7 (дирижёр 29.10: «на мобилке много места — компактнее; на ПК лучше всех v5; не хватает баланса — маленькие ёмкие значения, как на Apple Watch: всё в одном месте коротко и чётко»):
// watch — логика v5 (толпа реагирует на игру, твоя реакция двигает линию), но циферблатом: строка «осложнений» как на Watch — кольцо «толпа за Spirit», оценка со штрихом-графиком,
// зрители со стрелкой, темп чата; рядом крошечный эфир и + / −. Свёрнут — одна строка (телефон — полоса 56 над баром). Раскрыт — эфир, пульс-график 64, те же осложнения крупнее.
// ‼️ Все ряды — выдуманные, трансляция — картинка.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const SV = (d, z = 14) => `<svg viewBox="0 0 24 24" width="${z}" height="${z}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = { eye: SV('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 12), plus: SV('<path d="M12 5v14M5 12h14"/>'), minus: SV('<path d="M5 12h14"/>'),
    play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>', up: '▲', dn: '▼' };
  const ART = '../gs-match/img/heroes/faceless_void.png';
  const N = 34; // минут карты (0–33)
  const rnd = (seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280)(7);
  const walk = (a, b, vol, ev = {}) => { let v = a; return Array.from({ length: N }, (_, i) => (v += (b - a) / N + (rnd() - .5) * vol + (ev[i] || 0), Math.round(v * 10) / 10)); };
  const EV = [[8, 'Первая кровь'], [17, 'Бараки Vision'], [24, 'Рошан Spirit'], [31, 'Драка на миду']];
  const D = {
    view: walk(14000, 24180, 900, { 24: 2600, 31: 1800 }), rate: walk(200, 1428, 60, { 24: 220, 31: 160 }), trib: walk(52, 64, 2.4, { 17: -6, 24: 7, 31: 4 }),
    chat: walk(40, 90, 18, { 8: 60, 24: 140, 31: 110 }).map(v => Math.max(5, v)), gold: walk(0, 8.7, 1.1, { 17: -3, 24: 3, 31: 2.2 }), mood: walk(50, 66, 2.2, { 17: -7, 24: 8, 31: 5 }),
  };
  const S = { tile: 'trib', mine: 50, set: false, my: [], mk: null, stake: 50, moves: {}, tick: 0 };
  // мини-график: линия (и заливка) по ряду; mark — индексы событий
  const spark = (arr, { w = 120, h = 32, c = 'var(--w-fg)', fill = true, mid = null, marks = false, dots = [] } = {}) => {
    const mn = Math.min(...arr, mid ?? Infinity), mx = Math.max(...arr, mid ?? -Infinity), X = i => i / (arr.length - 1) * w, Y = v => h - 2 - (v - mn) / ((mx - mn) || 1) * (h - 4);
    const pts = arr.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    return `<svg class="a2-sp" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="--c:${c}">${mid != null ? `<line x1="0" x2="${w}" y1="${Y(mid)}" y2="${Y(mid)}" class="mid"/>` : ''}${fill ? `<polygon points="0,${h} ${pts} ${w},${h}" class="fl"/>` : ''}<polyline points="${pts}" class="ln"/>
      ${marks ? EV.map(([i]) => `<line x1="${X(i)}" x2="${X(i)}" y1="0" y2="${h}" class="ev"/>`).join('') : ''}${dots.map(([i, v, k]) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3" class="dot ${k}"/>`).join('')}<circle cx="${X(arr.length - 1)}" cy="${Y(arr[arr.length - 1])}" r="2.5" class="end"/></svg>`;
  };
  const delta = (arr, n = 5, fmt = v => v) => { const d = arr[arr.length - 1] - arr[arr.length - 1 - n]; return `<span class="a2-d ${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? IC.up : IC.dn} ${fmt(Math.abs(d))}</span>`; };
  const k = v => v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : String(Math.round(v));
  const tv = (cls = '') => `<div class="a2-tv ${cls}" style="--art:url('${ART}')"><span class="a2-live">LIVE</span><span class="a2-vw num">${IC.eye}${k(D.view[N - 1] + S.tick * 7)}</span><button class="a2-play" data-a="toast" data-v="Трансляция (демо)">${IC.play}</button><span class="a2-tm num">31:05 · карта 3</span></div>`;

  // ---- v4 «Терминал матча» ----
  const TILES = [['view', 'Зрители', v => k(v), 'var(--w-fg)'], ['rate', 'Оценка матча', v => '+' + k(v), 'var(--w-up)'], ['trib', 'Трибуна Spirit', v => Math.round(v) + ' %', '#38bdf8'], ['chat', 'Темп чата', v => Math.round(v) + '/мин', '#f59e0b']];
  const tile = ([key, name, fmt, c]) => { const a = D[key]; return `<button class="a2-t${S.tile === key ? ' on' : ''}" data-a2="tile" data-v="${key}"><span class="a2-tn">${name}</span><b class="num">${fmt(a[N - 1])}</b>${delta(a, 5, v => key === 'trib' ? Math.round(v) + ' п.' : k(v))}${spark(a, { w: 100, h: 24, c })}</button>`; };
  const term = () => { const t = TILES.find(x => x[0] === S.tile), a = D[S.tile];
    const big = `<div class="a2-big"><div class="a2-bh"><b>${t[1]}</b><span class="num">${t[2](a[N - 1])}</span>${delta(a, 5, v => S.tile === 'trib' ? Math.round(v) + ' п.' : k(v))}<small>за 5 мин</small></div>${spark(a, { w: 300, h: 90, c: t[3], marks: true, mid: S.tile === 'trib' ? 50 : null })}
      <div class="a2-evs">${EV.map(([i, e]) => `<span style="left:${i / (N - 1) * 100}%">${e}</span>`).join('')}</div></div>`;
    const crowd = Math.round(D.trib[N - 1]);
    const mine = `<div class="a2-my"><div class="a2-myh"><b>Кто возьмёт карту?</b><small>${S.set ? `ты ${S.mine} % · толпа ${crowd} % — ${Math.abs(S.mine - crowd) < 8 ? 'ты с большинством' : S.mine > crowd ? 'ты увереннее толпы' : 'ты осторожнее толпы'}` : 'двигай — твоё мнение попадёт в трибуну'}</small></div>
      <div class="a2-sl"><span>${'<img src="../gs-match/img/teams/9572001.png" alt="" />'}Vision</span><span class="a2-tr"><i class="crowd" style="left:${crowd}%"><em>толпа</em></i>${S.set ? `<i class="me" style="left:${S.mine}%"><em>ты</em></i>` : ''}<input type="range" min="0" max="100" value="${S.mine}" data-a2-range /></span><span>Spirit<img src="../gs-match/img/teams/7119388.png" alt="" /></span></div></div>`;
    return { title: 'Терминал матча', min: `${tv()}<div class="a2-tiles">${TILES.map(tile).join('')}</div>`, full: `${tv()}<div class="a2-tiles">${TILES.map(tile).join('')}</div>${big}${mine}` }; };

  // ---- v5 «Пульс на таймлайне» ----
  const pulse = () => { const mood = D.mood.map((v, i) => v + S.my.filter(m => m[0] === i).reduce((s, m) => s + (m[1] > 0 ? .8 : -.8), 0));
    const W = 300, H = 110, gold = D.gold, gmx = Math.max(...gold.map(Math.abs)) * 1.15, X = i => i / (N - 1) * W, YG = v => H / 2 - v / gmx * (H / 2 - 6), YM = v => H - 4 - (v - 30) / 50 * (H - 8);
    const gArea = `<polygon points="0,${H / 2} ${gold.map((v, i) => `${X(i)},${YG(v)}`).join(' ')} ${W},${H / 2}" class="g"/>`;
    const mLine = `<polyline points="${mood.map((v, i) => `${X(i)},${YM(v)}`).join(' ')}" class="m"/>`;
    const dots = S.my.map(([i, s]) => `<circle cx="${X(i)}" cy="${YM(mood[i])}" r="4" class="me ${s > 0 ? 'up' : 'dn'}"/>`).join('');
    const chart = `<div class="a2-pl"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="a2-plc"><line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="z"/>${gArea}${EV.map(([i]) => `<line x1="${X(i)}" x2="${X(i)}" y1="0" y2="${H}" class="ev"/>`).join('')}${mLine}${dots}<circle cx="${X(N - 1)}" cy="${YM(mood[N - 1])}" r="3" class="end"/></svg>
      <div class="a2-evs">${EV.map(([i, e]) => `<span style="left:${i / (N - 1) * 100}%">${e}</span>`).join('')}</div></div>`;
    const leg = `<div class="a2-lg"><span><i class="g"></i>Перевес по золоту · Spirit +8.7k</span><span><i class="m"></i>Настроение толпы · ${Math.round(mood[N - 1])} % за Spirit</span></div>`;
    const corr = `<div class="a2-cor"><div><small>Толпа реагирует на игру</small><b class="num">через ~40 с</b></div><div><small>Сильнее всего</small><b>Рошан, 24:10</b></div><div><small>Твоих реакций</small><b class="num">${S.my.length}</b></div></div>`;
    const act = `<div class="a2-act"><span>Что чувствуешь сейчас?</span><button class="a2-pm up" data-a2="my" data-v="1">${IC.plus}</button><button class="a2-pm dn" data-a2="my" data-v="-1">${IC.minus}</button></div>`;
    return { title: 'Пульс матча', min: `${tv()}${chart}${act}`, full: `${tv()}${chart}${leg}${corr}${act}<p class="a2-hint">Твоя реакция ставится точкой на текущую минуту и сразу сдвигает линию толпы</p>` }; };

  // ---- v6 «Рынок мнений» ----
  const MK = [{ id: 'win', q: 'Spirit берут карту 3', p: 72, vol: 48210, h: walk(48, 72, 3, { 24: 9, 31: 5 }) }, { id: 'rosh', q: 'Следующий Рошан — Spirit', p: 61, vol: 12400, h: walk(55, 61, 3) },
    { id: 'mvp', q: 'MVP карты — Yatoro', p: 44, vol: 9800, h: walk(30, 44, 3, { 24: 6 }) }];
  const market = () => { const m0 = MK.find(m => m.id === S.mk);
    const row = m => { const p = Math.min(99, m.p + (S.moves[m.id] || 0)); return `<button class="a2-mk${S.mk === m.id ? ' on' : ''}" data-a2="mk" data-v="${m.id}"><span class="a2-mq">${esc(m.q)}<small class="num">${k(m.vol)} голосов</small></span>${spark(m.h.concat(p), { w: 64, h: 24, c: 'var(--w-up)', fill: false })}<b class="num">${p} %</b>${delta(m.h, 5, v => Math.round(v) + ' п.')}</button>`; };
    const trade = m0 ? `<div class="a2-trd"><div class="a2-trh"><b>${esc(m0.q)}</b><span class="num">${Math.min(99, m0.p + (S.moves[m0.id] || 0))} %</span></div>${spark(m0.h.concat(m0.p + (S.moves[m0.id] || 0)), { w: 300, h: 70, c: 'var(--w-up)', marks: true })}
      <div class="a2-stk"><span>Вложить очков</span><input type="range" min="10" max="500" step="10" value="${S.stake}" data-a2-stake /><b class="num">${S.stake}</b></div>
      <div class="a2-yn"><button class="up" data-a2="buy" data-v="1">Да · сдвинет до ${Math.min(99, m0.p + Math.max(1, Math.round(S.stake / 120)))} %</button><button class="dn" data-a2="buy" data-v="-1">Нет · сдвинет до ${m0.p - Math.max(1, Math.round(S.stake / 120))} %</button></div>
      <small class="a2-hint">Цена — доля очков, вложенных в «да». Угадал — очки возвращаются с выигрышем</small></div>` : '';
    return { title: 'Рынок мнений', min: `${tv('a2-tv--pip')}<div class="a2-mks">${MK.slice(0, 2).map(row).join('')}</div>`, full: `${tv('a2-tv--pip')}<div class="a2-mks">${MK.map(row).join('')}</div>${trade || '<p class="a2-hint">Нажми рынок — график цены и вложить очки</p>'}` }; };

  // ---- v7 «Пульс-циферблат» ----
  const ringC = (pct, c, label, sub) => { const r = 13, L = 2 * Math.PI * r; return `<span class="w7-c w7-ring"><svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="${r}" class="bg"/><circle cx="16" cy="16" r="${r}" class="fg" style="stroke:${c}" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - pct / 100)}"/></svg><b class="num">${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>`; };
  const cmp = (val, sub, arr, c) => `<span class="w7-c"><b class="num">${val}</b>${arr ? spark(arr.slice(-12), { w: 40, h: 12, c, fill: false }) : ''}<small>${sub}</small></span>`;
  const watch = () => { const mood = D.mood.map((v, i) => v + S.my.filter(m => m[0] === i).reduce((t, m) => t + (m[1] > 0 ? .8 : -.8), 0)), m = Math.round(mood[N - 1]);
    const thumb = `<button class="w7-th" style="--art:url('${ART}')" data-a="toast" data-v="Трансляция (демо)"><i>LIVE</i></button>`;
    const pm = `<span class="w7-pm"><button data-a2="my" data-v="1" aria-label="Нравится">${IC.plus}</button><button data-a2="my" data-v="-1" aria-label="Не нравится">${IC.minus}</button></span>`;
    const dial = `${ringC(m, '#38bdf8', m + '%', 'за Spirit')}${cmp('+' + k(D.rate[N - 1]), 'оценка', D.rate, 'var(--w-up)')}${cmp(k(D.view[N - 1] + S.tick * 7), 'смотрят', D.view, 'var(--w-fg)')}${cmp(Math.round(D.chat[N - 1]), 'в чате/мин', D.chat, '#f59e0b')}`;
    const W = 300, H = 64, gold = D.gold, gmx = Math.max(...gold.map(Math.abs)) * 1.15, X = i => i / (N - 1) * W, YG = v => H / 2 - v / gmx * (H / 2 - 4), YM = v => H - 3 - (v - 30) / 50 * (H - 6);
    const chart = `<div class="w7-pl"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="a2-plc w7-plc"><line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="z"/><polygon points="0,${H / 2} ${gold.map((v, i) => `${X(i)},${YG(v)}`).join(' ')} ${W},${H / 2}" class="g"/>${EV.map(([i]) => `<line x1="${X(i)}" x2="${X(i)}" y1="0" y2="${H}" class="ev"/>`).join('')}<polyline points="${mood.map((v, i) => `${X(i)},${YM(v)}`).join(' ')}" class="m"/>${S.my.map(([i, t]) => `<circle cx="${X(i)}" cy="${YM(mood[i])}" r="3.5" class="me ${t > 0 ? 'up' : 'dn'}"/>`).join('')}</svg>
      <div class="w7-lg"><span><i class="g"></i>золото</span><span><i class="m"></i>толпа</span><span class="w7-r">реагирует через ~40 с</span></div></div>`;
    return { title: 'Пульс матча', min: `<div class="w7-row">${thumb}<span class="w7-dial">${dial}</span>${pm}</div>`, full: `${tv()}${chart}<div class="w7-row w7-row--big"><span class="w7-dial">${dial}</span>${pm}</div>` }; };
  const V = { term, pulse, market, watch };
  const draw = w => { const r = V[window.ACT2 || 'term'](); w.className = 'w a2 a2--' + (window.ACT2 || 'term');
    w.innerHTML = `<div class="a2-hd"><b>${r.title}</b><span class="a2-on num"><i></i>${k(D.view[N - 1] + S.tick * 7)} смотрят</span></div><div class="ac-min">${r.min}</div><div class="ac-full">${r.full}</div>`; };
  let host;
  window.GS_ACT = el => { host = el; el.dataset.wxKey = 'act2'; WXKey(el, draw, '.a2-hd', false); el.classList.add('ac-host'); };
  const redraw = () => { const w = host && host.querySelector('.wx-p > .w'); w && draw(w); };
  document.addEventListener('click', e => { const b = e.target.closest('[data-a2]'); if (!b) return; const a = b.dataset.a2, v = b.dataset.v;
    if (a === 'tile') S.tile = v;
    if (a === 'my') S.my.push([N - 1, +v]);
    if (a === 'mk') S.mk = S.mk === v ? null : v;
    if (a === 'buy') S.moves[S.mk] = (S.moves[S.mk] || 0) + (+v) * Math.max(1, Math.round(S.stake / 120));
    redraw(); });
  document.addEventListener('input', e => { if (e.target.matches('[data-a2-range]')) { S.mine = +e.target.value; S.set = true; const me = e.target.parentElement.querySelector('.me'); if (me) me.style.left = S.mine + '%'; }
    if (e.target.matches('[data-a2-stake]')) { S.stake = +e.target.value; } });
  document.addEventListener('change', e => { if (e.target.matches('[data-a2-range], [data-a2-stake]')) redraw(); });
  // живые ряды: раз в 3 с последняя точка чуть двигается
  setInterval(() => { S.tick++; ['view', 'rate', 'trib', 'chat', 'mood'].forEach(key => { const a = D[key]; a[N - 1] = Math.round((a[N - 1] + (rnd() - .45) * (key === 'view' ? 120 : key === 'rate' ? 6 : key === 'chat' ? 6 : .6)) * 10) / 10; });
    if (!document.querySelector('.a2 input:focus')) redraw(); }, 3000);
})();
