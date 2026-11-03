// DB_FAKE: если на странице есть выдуманная база (_db/_fake.js) — данные отсюда берутся из неё (одно место для выдумки); нет — как было
// Лаба w-actions v9–v11 — «Пульс матча» как система (дирижёр 29.10: «на основе v8 несколько концептуальных версий, чтобы полностью объяснить функционал; непонятно, как работает + / −;
// трансляция: видно, что запущена; при сворачивании остаётся в полном размере; на весь экран; открепить и перетащить в угол; несколько трансляций»).
// Спека — внутренняя документация/29.10/w-actions-спека.md (что делает каждая кнопка, состояния, концепции). Основа — v8 (_act2.js, watch).
// Хозяин — ../gs-match/_gs.js (виджет act), сворачивается (../widget-expand WXKey, peek2). Плавающие окна и «на весь экран» — свои слои в body.
// window.ACT3: anchor — v9 «Плеер-якорь» (эфир в виджете, 📌 на чипе — второе плавающее окно) · multi — v10 «Мультиэфир» (миниатюры, обмен, сетка 2 × 2) ·
//              capsule — v11 «Капсула» (плеер — плавающая пилюля, виджет — только аналитика).
// v12–v14 (дирижёр 29.10: «мультиэфир прикольно, но думал, сделаешь гораздо интереснее; плавающие ♡ / 💬 / поделиться внизу убрать — этот виджет их заменяет»):
// у всех — нижней группы ♡ / 💬 / поделиться нет (body.a3-nosoc); эфиры не просто рядом, а «живут» по толпе:
// director — «Авто-режиссёр»: у каждого эфира свой хайп (реакции и прирост зрителей за минуту), самый горячий помечен 🔥; включён авто-режиссёр — основной эфир сам
//            переключается туда, где сейчас жарко, с подписью почему; тап по эфиру — ручной выбор, авто выключается ·
// treemap  — «Где все»: эфиры плитками, площадь = доля зрителей, плитки перестраиваются вживую, когда зрители перетекают; стрелки «→ POV Yatoro +1,2k/мин»; тап — смотреть ·
// replay   — «Моменты толпы»: под эфиром лента реакций по минутам, пики — моменты (Рошан, драка) с числом реакций; тап — повтор момента 15 с прямо в плеере
//            («⟲ Повтор 24:10»), затем «В эфир».
// v15 (дирижёр 29.10: «„Где все“ прикольно — сделай реально мини тепловую карту; „Огонь / Скучно“ — неинтересно, лучше „Поделиться матчем“, „Сохранить“; моменты толпы — нет;
// одну идеальную версию»): ideal — эфир со всем из v9 (состояния, открепить, перетащить, на весь экран) · мини тепловая карта эфиров: плитка = эфир, площадь = доля зрителей,
// цвет = жар (прирост зрителей за минуту: серый — спокойно, оранжевый — растёт, красный — всплеск), плитки перестраиваются вживую, тап — смотреть ·
// пульс-график (золото и толпа) · циферблат: за Spirit, смотрят, в чате/мин, сохранили · действия: ↗ Поделиться (ссылка на матч, с таймкодом), 🔖 Сохранить, 🔔 Следить.
// v16 (дирижёр 29.10: «только в лайве или с актуальным контентом до — немного по-другому»): до матча (data-pre на виджете) — вместо эфира постер «Эфир начнётся через 1:24:10»
// и «🔔 Напомнить»; вместо тепловой карты — анонс эфиров (кто будет вещать); пульса нет (игры ещё нет); циферблат — прогноз за Spirit, ждут, в чате/мин, сохранили.
// ‼️ Видео — картинка с наездом, все числа — выдуманные.
(() => {
  const MODE = window.ACT3 || 'anchor';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const SV = (d, z = 14) => `<svg viewBox="0 0 24 24" width="${z}" height="${z}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const FL = (d, z = 14) => `<svg viewBox="0 0 24 24" width="${z}" height="${z}" fill="currentColor">${d}</svg>`;
  const I = { play: FL('<path d="M8 5v14l11-7z"/>', 18), pause: FL('<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>', 16), mute: SV('<path d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>'), vol: SV('<path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
    full: SV('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), unfull: SV('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'), pop: SV('<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11" width="7" height="6" rx="1" fill="currentColor"/>'),
    back: SV('<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>'), x: SV('<path d="M6 6l12 12M18 6 6 18"/>'), pin: SV('<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>', 12), grid: SV('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
    eye: SV('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 11), down: SV('<path d="m6 9 6 6 6-6"/>'), up: SV('<path d="m6 15 6-6 6 6"/>') };
  const IMG = h => `../gs-match/img/heroes/${h}.png`;
  const k = v => v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : String(Math.round(v));
  const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ---- данные: ряды пульса (как v7) ----
  const N = 34, EV = [[8, 'Первая кровь'], [17, 'Бараки Vision'], [24, 'Рошан Spirit'], [31, 'Драка на миду']];
  const rnd = (seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280)(7);
  const walk = (a, b, vol, ev = {}) => { let v = a; return Array.from({ length: N }, (_, i) => (v += (b - a) / N + (rnd() - .5) * vol + (ev[i] || 0), Math.round(v * 10) / 10)); };
  const D = { view: walk(14000, 27400, 900, { 24: 2600, 31: 1800 }), rate: walk(200, 1700, 60, { 24: 220, 31: 160 }), chat: walk(40, 320, 30, { 8: 60, 24: 140, 31: 110 }).map(v => Math.max(5, v)),
    gold: walk(0, 8.7, 1.1, { 17: -3, 24: 3, 31: 2.2 }), mood: walk(50, 76, 2.2, { 17: -7, 24: 8, 31: 5 }) };
  const STREAMS = window.DB_FAKE?.streams ?? [{ id: 'ru', name: 'Основной · RU', src: 'Twitch · BetBoom', art: 'faceless_void', v: 18400 }, { id: 'en', name: 'EN', src: 'Twitch · PGL', art: 'storm_spirit', v: 6900 },
    { id: 'p1', name: 'POV Yatoro', src: 'Twitch · yatoro', art: 'terrorblade', v: 1300 }, { id: 'p2', name: 'POV Satanic', src: 'Twitch · satanic', art: 'invoker', v: 800 }];
  STREAMS.forEach(s => { s.h = walk(s.v * .6, s.v, s.v * .05); });
  const byId = id => STREAMS.find(s => s.id === id);

  // ---- состояние ----
  const S = { preLeft: 5050, saved: false, savedN: 3120, follow: false, shareOpen: false, flash: '', auto: true, why: '', flows: [{ from: 'ru', to: 'p1', n: 1200 }, { from: 'en', to: 'ru', n: 400 }], rep: null, play: false, load: false, paused: false, lag: 0, muted: true, el: 0, main: 'ru', floats: [], full: false, grid: false, cap: 'pill', capOn: false,
    vote: 0, cool: 0, my: [], info: null, up2: 214, dn2: 38, ctl: false };
  // floats: [{ id, corner }]; в capsule — плеер всегда «плавает» (одно окно-капсула)

  // ---- плеер ----
  const player = (s, { cls = '', ctl = true, where = 'w' } = {}) => {
    const playing = S.play && !S.paused, isMain = s.id === S.main;
    const rep = S.rep && isMain ? `<div class="a3-rep"><span>⟲ Повтор ${S.rep.t} · ${esc(S.rep.e)}</span><i><u style="width:${S.rep.p / 15 * 100}%" data-live="rep"></u></i><button data-a3="live">В эфир</button></div>` : '';
    const state = S.load ? `<span class="a3-spin"></span>` : !S.play ? `<button class="a3-big" data-a3="play">${I.play}<span>Смотреть</span></button>` : S.paused ? `<button class="a3-big a3-big--p" data-a3="resume">${I.play}<span>Пауза · отстаёшь на ${S.lag} с</span></button>` : '';
    const top = `<div class="a3-top"><span class="a3-onair${playing ? ' on' : ''}">${playing ? '<i></i>В ЭФИРЕ' : 'LIVE'}</span><span class="a3-src">${esc(s.name)}</span><span class="a3-vw num">${I.eye}<b data-live="sv-${s.id}">${k(s.v)}</b></span></div>`;
    const bar = S.play && ctl ? `<div class="a3-ctl"><button data-a3="${S.paused ? 'resume' : 'pause'}" title="${S.paused ? 'Продолжить' : 'Пауза'}">${S.paused ? I.play : I.pause}</button>
      <button data-a3="mute" class="${S.muted ? 'is-mute' : ''}" title="${S.muted ? 'Включить звук' : 'Выключить звук'}">${S.muted ? I.mute : I.vol}</button>${!S.muted && playing ? '<span class="a3-eq"><i></i><i></i><i></i><i></i></span>' : ''}
      <span class="a3-el num" data-live="el">${mmss(S.el)}</span>${S.paused ? '<button class="a3-go" data-a3="live">В эфир</button>' : ''}<span class="a3-sp"></span>
      ${where === 'f' && MODE === 'capsule' ? '' : where === 'f' ? `<button data-a3="dock" data-v="${s.id}" title="Вернуть в виджет">${I.back}</button>` : MODE !== 'capsule' ? `<button data-a3="pop" data-v="${s.id}" title="Открепить">${I.pop}</button>` : ''}
      <button data-a3="full" title="На весь экран">${S.full ? I.unfull : I.full}</button></div>` : '';
    return `<div class="a3-pl ${cls}${playing ? ' is-play' : ''}${S.paused ? ' is-paused' : ''}${S.ctl ? ' show-ctl' : ''}" style="--art:url('${IMG(s.art)}')" data-pl="${s.id}"><div class="a3-vid"></div>${top}${state}${rep}${bar}</div>`;
  };

  // ---- циферблат и «Как тебе момент?» ----
  const mood = () => D.mood.map((v, i) => v + S.my.filter(m => m[0] === i).reduce((t, m) => t + (m[1] > 0 ? .8 : -.8), 0));
  const spark = (arr, w, h, c) => { const mn = Math.min(...arr), mx = Math.max(...arr); return `<svg class="a3-sk" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${arr.map((v, i) => `${(i / (arr.length - 1) * w).toFixed(1)},${(h - 1 - (v - mn) / ((mx - mn) || 1) * (h - 2)).toFixed(1)}`).join(' ')}" style="stroke:${c}"/></svg>`; };
  const INFO = { spirit: 'Доля зрителей, которые считают, что карту возьмёт Spirit — из голосования «Кто возьмёт карту» и реакций', rate: 'Сумма 👍 минус 👎 за карту; штрих — как менялась по минутам. Твой голос — в ней',
    view: 'Зрители всех трансляций матча сейчас', chat: 'Сообщений в «Обсуждении» за последнюю минуту', saved: 'Сколько человек сохранили матч — вернутся к записи или ждут следующую карту' };
  const dial = () => { const m = Math.round(mood()[N - 1]), r = 13, L = 2 * Math.PI * r;
    const c = (key, html) => `<button class="a3-c${S.info === key ? ' on' : ''}" data-a3="info" data-v="${key}">${html}</button>`;
    return `<div class="a3-dial">${c('spirit', `<span class="a3-ring"><svg viewBox="0 0 32 32" width="30" height="30"><circle cx="16" cy="16" r="${r}" class="bg"/><circle cx="16" cy="16" r="${r}" class="fg" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - m / 100)}"/></svg><b class="num">${m}%</b></span><small>${PREV ? 'прогноз Spirit' : 'за Spirit'}</small>`)}
      ${MODE === 'ideal' ? '' : c('rate', `<b class="num${S.vote ? ' hl' : ''}" data-live="rate">+${k(D.rate[N - 1] + S.vote)}</b>${spark(D.rate.slice(-12), 40, 12, 'var(--w-up)')}<small>оценка</small>`)}
      ${c('view', `<b class="num" data-live="view">${k(STREAMS.reduce((a, s) => a + s.v, 0) * (PREV ? .35 : 1))}</b>${spark(D.view.slice(-12), 40, 12, 'var(--w-fg)')}<small>${PREV ? 'ждут' : 'смотрят'}</small>`)}
      ${c('chat', `<b class="num" data-live="chat">${Math.round(D.chat[N - 1])}</b>${spark(D.chat.slice(-12), 40, 12, '#f59e0b')}<small>в чате/мин</small>`)}${MODE === 'ideal' ? c('saved', `<b class="num${S.saved ? ' hl' : ''}">${k(S.savedN + (S.saved ? 1 : 0))}</b>${spark(D.view.slice(-12).map((v, i) => v + i * 40), 40, 12, '#a78bfa')}<small>сохранили</small>`) : ''}</div>
      ${S.info ? `<p class="a3-info">${INFO[S.info]}</p>` : ''}`; };
  const voteBox = compact => { const cd = S.cool > 0, L = 2 * Math.PI * 9;
    const btn = (d, e, t) => `<button class="a3-v a3-v--${d > 0 ? 'up' : 'dn'}${S.vote === d ? ' on' : ''}" data-a3="vote" data-v="${d}" ${cd ? 'disabled' : ''} title="${t}"><span>${e}</span>${compact ? '' : `<b>${t}</b>`}${cd && S.vote === d ? `<svg class="a3-cd" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - S.cool / 30)}"/></svg>` : ''}</button>`;
    const pct = S.vote > 0 ? Math.round(S.up2 / (S.up2 + S.dn2) * 100) : Math.round(S.dn2 / (S.up2 + S.dn2) * 100);
    return `<div class="a3-vote${compact ? ' is-c' : ''}">${compact ? '' : '<span class="a3-vq">Как тебе момент?<small>последние 2 мин</small></span>'}${btn(1, '👍', 'Огонь')}${btn(-1, '👎', 'Скучно')}</div>
      ${compact ? '' : `<p class="a3-vs num">${S.vote ? `Ты: ${S.vote > 0 ? '👍' : '👎'} · с тобой ${pct} % голосов момента${cd ? ` · снова через ${S.cool} с` : ''}` : `за 2 мин: 👍 ${S.up2} · 👎 ${S.dn2}`}</p>`}`; };
  const pulse = () => { const md = mood(), W = 300, H = 64, g = D.gold, gm = Math.max(...g.map(Math.abs)) * 1.15, X = i => i / (N - 1) * W, YG = v => H / 2 - v / gm * (H / 2 - 4), YM = v => H - 3 - (v - 30) / 55 * (H - 6);
    return `<div class="a3-pu"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="z"/><polygon points="0,${H / 2} ${g.map((v, i) => `${X(i)},${YG(v)}`).join(' ')} ${W},${H / 2}" class="g"/>${EV.map(([i]) => `<line x1="${X(i)}" x2="${X(i)}" y1="0" y2="${H}" class="ev"/>`).join('')}
      <polyline points="${md.map((v, i) => `${X(i)},${YM(v)}`).join(' ')}" class="m"/>${S.my.map(([i, t]) => `<circle cx="${X(i)}" cy="${YM(md[i])}" r="3.5" class="me ${t > 0 ? 'up' : 'dn'}"/>`).join('')}</svg>
      <div class="a3-lg"><span><i class="g"></i>золото</span><span><i class="m"></i>толпа</span><span class="a3-r">толпа реагирует через ~40 с</span></div></div>`; };

  // ---- источники ----
  const chips = () => `<div class="a3-chips">${STREAMS.map(s => { const f = S.floats.find(x => x.id === s.id);
    return `<span class="a3-chip${s.id === S.main ? ' on' : ''}${f ? ' is-pin' : ''}"><button data-a3="main" data-v="${s.id}">${esc(s.name)}<small class="num">${k(s.v)}</small></button>${s.id !== S.main ? `<button class="a3-pinb" data-a3="${f ? 'unpin' : 'pin'}" data-v="${s.id}" title="${f ? 'Открепить окно' : 'Закрепить вторым окном'}">${f ? I.x : I.pin}</button>` : ''}</span>`; }).join('')}</div>`;
  const thumbs = () => `<div class="a3-thumbs">${STREAMS.filter(s => s.id !== S.main).map(s => `<button class="a3-th" data-a3="swap" data-v="${s.id}" style="--art:url('${IMG(s.art)}')"><span class="a3-thn">${esc(s.name)}</span><span class="a3-thv num">${I.eye}${k(s.v)}</span>${spark(s.h.slice(-12), 48, 10, '#fff')}</button>`).join('')}</div>`;
  const gridView = () => `<div class="a3-grid">${STREAMS.map(s => `<button class="a3-gc${s.id === S.main ? ' on' : ''}" data-a3="main" data-v="${s.id}" style="--art:url('${IMG(s.art)}')"><span class="a3-thn">${esc(s.name)}</span>${s.id === S.main && !S.muted ? '<span class="a3-eq a3-eq--s"><i></i><i></i><i></i><i></i></span>' : ''}<span class="a3-thv num">${I.eye}${k(s.v)}</span></button>`).join('')}</div>`;
  const placeholder = s => `<div class="a3-ph"><span>${I.pop}Эфир «${esc(s.name)}» откреплён</span><button data-a3="dock" data-v="${s.id}">${I.back}Вернуть</button></div>`;

  // ---- v12 «Авто-режиссёр» ----
  STREAMS.forEach((s, i) => { s.hype = [62, 34, 48, 21][i]; s.dv = [2, -1, 6, 1][i]; s.re = walk(10, [40, 18, 30, 12][i], 6).map(v => Math.max(1, v)); });
  const hot = () => STREAMS.reduce((a, b) => b.hype > a.hype ? b : a);
  const director = () => { const h = hot();
    const tiles = STREAMS.map(s => `<button class="a3-dt${s.id === S.main ? ' on' : ''}${s === h ? ' is-hot' : ''}" data-a3="dsel" data-v="${s.id}" style="--art:url('${IMG(s.art)}')">
      <span class="a3-dtn">${s === h ? '🔥 ' : ''}${esc(s.name)}</span><span class="a3-dtv num">${I.eye}${k(s.v)} <em class="${s.dv >= 0 ? 'up' : 'dn'}">${s.dv >= 0 ? '+' : ''}${s.dv}%</em></span>
      <span class="a3-hy"><i style="width:${s.hype}%"></i></span>${spark(s.re.slice(-14), 60, 12, s === h ? '#fb923c' : '#fff')}</button>`).join('');
    return `<div class="a3-mh"><small>Эфиры · по хайпу</small><button class="a3-auto${S.auto ? ' on' : ''}" data-a3="auto"><i></i>Авто-режиссёр</button></div>
      ${S.auto && S.why ? `<p class="a3-why">🎬 ${esc(S.why)}</p>` : ''}<div class="a3-dts">${tiles}</div>
      <p class="a3-vs">Хайп — реакции и прирост зрителей эфира за минуту. ${S.auto ? 'Авто-режиссёр сам переключает на самый горячий эфир' : 'Включи авто-режиссёра — эфир сам переключится туда, где жарко'}</p>`; };
  // ---- v13 «Где все» ----
  const treemap = () => { const tot = STREAMS.reduce((a, s) => a + s.v, 0), sorted = [...STREAMS].sort((a, b) => b.v - a.v), big = sorted[0], rest = sorted.slice(1);
    const tile = (s, cls) => `<button class="a3-tm ${cls}${s.id === S.main ? ' on' : ''}" data-a3="main" data-v="${s.id}" style="--art:url('${IMG(s.art)}');flex-grow:${s.v}"><span class="a3-tmp num">${Math.round(s.v / tot * 100)}%</span><span class="a3-thn">${esc(s.name)}</span><span class="a3-thv num">${I.eye}${k(s.v)}</span>${s.id === S.main && S.play ? '<span class="a3-onair on a3-tmo"><i></i>смотришь</span>' : ''}</button>`;
    return `<div class="a3-tmap"><div class="a3-tmc" style="flex-grow:${big.v}">${tile(big, 'big')}</div><div class="a3-tmc a3-tmc--col" style="flex-grow:${tot - big.v}">${rest.map(s => tile(s, '')).join('')}</div></div>`; };
  const flows = () => `<div class="a3-flows">${S.flows.map(f => `<span class="a3-fl"><b>${esc(byId(f.from).name)}</b> → <b>${esc(byId(f.to).name)}</b><em class="num">+${k(f.n)}/мин</em></span>`).join('')}</div>
    <p class="a3-vs">Площадь плитки — доля зрителей матча на этом эфире; плитки перестраиваются, когда зрители перетекают. Нажми — смотреть</p>`;
  // ---- v14 «Моменты толпы» ----
  const REACT = Array.from({ length: N }, (_, i) => Math.round(8 + 4 * rnd() + EV.reduce((a, [m]) => a + Math.max(0, 60 - Math.abs(i - m) * 22), 0)));
  const moments = () => { const mx = Math.max(...REACT);
    const bars = `<div class="a3-rb">${REACT.map((v, i) => { const ev = EV.find(([m]) => m === i); return `<i class="${ev ? 'pk' : ''}" style="height:${(v / mx * 100).toFixed(0)}%"${ev ? ` data-a3="rep" data-v="${i}" title="${esc(ev[1])}"` : ''}></i>`; }).join('')}</div>`;
    const chips = `<div class="a3-mom">${EV.slice().reverse().map(([m, e]) => `<button class="a3-mc${S.rep && S.rep.m === m ? ' on' : ''}" data-a3="rep" data-v="${m}"><span class="num">${String(m).padStart(2, '0')}:${m === 24 ? '10' : m === 31 ? '05' : '00'}</span><b>${esc(e)}</b><em class="num">🔥 ${k([0, 0, 0, 0, 0, 0, 0, 0, 940, 0, 0, 0, 0, 0, 0, 0, 0, 1700, 0, 0, 0, 0, 0, 0, 4200, 0, 0, 0, 0, 0, 0, 3100][m] || REACT[m] * 37)}</em><i>⟲</i></button>`).join('')}</div>`;
    return `<div class="a3-mh"><small>Моменты толпы · реакции по минутам</small></div>${bars}${chips}<p class="a3-vs">Пик — когда зрители реагировали больше всего. Нажми — повтор момента 15 с прямо в плеере</p>`; };

  // ---- v15 мини тепловая карта и действия ----
  const heatC = dv => dv >= 20 ? '#ef4444' : dv >= 8 ? '#f97316' : dv >= 2 ? '#f59e0b' : dv > -2 ? '#52525b' : '#3f3f46';
  const heat = () => { const tot = STREAMS.reduce((a, s) => a + s.v, 0), sorted = [...STREAMS].sort((a, b) => b.v - a.v), big = sorted[0], rest = sorted.slice(1);
    const cell = (s, cls) => `<button class="a3-ht ${cls}${s.id === S.main ? ' on' : ''}" data-a3="main" data-v="${s.id}" style="flex-grow:${s.v};--h:${heatC(s.dv)}" title="${esc(s.name)} · ${k(s.v)} · ${s.dv >= 0 ? '+' : ''}${s.dv}%/мин">
      <b class="num">${Math.round(s.v / tot * 100)}%</b><span>${esc(s.name)}</span><em class="num">${s.dv >= 0 ? '▲' : '▼'}${Math.abs(s.dv)}%</em>${s.id === S.main && S.play ? '<i class="a3-htw"></i>' : ''}</button>`;
    return `<div class="a3-heat"><div class="a3-hc" style="flex-grow:${big.v}">${cell(big, 'big')}</div><div class="a3-hc a3-hc--col" style="flex-grow:${tot - big.v}">${rest.map(s => cell(s, '')).join('')}</div></div>
      <div class="a3-hl"><span><i style="background:#52525b"></i>спокойно</span><span><i style="background:#f59e0b"></i>растёт</span><span><i style="background:#ef4444"></i>всплеск</span><span class="a3-r">площадь — доля зрителей</span></div>`; };
  const SH = SV('<path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'), BM = (on) => on ? FL('<path d="M6 3h12v18l-6-4-6 4z"/>') : SV('<path d="M6 3h12v18l-6-4-6 4z"/>'), BELL = (on) => on ? FL('<path d="M12 2a6 6 0 0 0-6 6v5l-2 3h16l-2-3V8a6 6 0 0 0-6-6zm-2 18a2 2 0 0 0 4 0z"/>') : SV('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>');
  const acts = compact => compact
    ? `<div class="a3-acts is-c"><button data-a3="share" title="Поделиться матчем">${SH}</button><button class="${S.saved ? 'on' : ''}" data-a3="save" title="${S.saved ? 'Сохранено' : 'Сохранить матч'}">${BM(S.saved)}</button></div>`
    : `<div class="a3-acts"><button data-a3="share">${SH}<span>Поделиться</span></button><button class="${S.saved ? 'on' : ''}" data-a3="save">${BM(S.saved)}<span>${S.saved ? 'Сохранено' : 'Сохранить'}</span></button><button class="${S.follow ? 'on' : ''}" data-a3="follow">${BELL(S.follow)}<span>${S.follow ? 'Слежу' : 'Следить'}</span></button></div>
      ${S.shareOpen ? `<div class="a3-shm"><button data-a3="sh" data-v="link">${SV('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>')}Ссылка на матч</button><button data-a3="sh" data-v="time">${SV('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>')}С этого момента · ${mmss(S.el || 1865).replace(/^00:/, '31:')}</button><button data-a3="sh" data-v="tg">${SV('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/>')}В Telegram</button></div>` : ''}
      ${S.flash ? `<p class="a3-vs a3-flash">${esc(S.flash)}</p>` : ''}`;

  // ---- сборка виджета ----
  const widget = () => {
    const ms = byId(S.main), mainFloat = S.floats.find(f => f.id === S.main);
    const thumb = `<button class="a3-mini" style="--art:url('${IMG(ms.art)}')" data-a3="play"><i>LIVE</i>${I.play}</button>`;
    const VB = c => MODE === 'ideal' ? acts(c) : voteBox(c);
    const row = `<div class="a3-row">${MODE !== 'capsule' ? thumb : ''}${dial()}${VB(true)}</div>`;
    if (MODE === 'capsule') {
      const list = `<div class="a3-list"><small>Эфиры матча</small>${STREAMS.map(s => `<button class="a3-li${s.id === S.main && S.capOn ? ' on' : ''}" data-a3="cap" data-v="${s.id}"><span class="a3-lit" style="--art:url('${IMG(s.art)}')"></span><span>${esc(s.name)}<small>${esc(s.src)}</small></span><b class="num">${I.eye}${k(s.v)}</b><em>${s.id === S.main && S.capOn ? '● в капсуле' : '▶ смотреть'}</em></button>`).join('')}</div>`;
      return { min: `<div class="a3-row">${thumb}${dial()}${voteBox(true)}</div>`, full: `${pulse()}${dial()}${voteBox(false)}${list}` };
    }
    const stage = mainFloat ? placeholder(ms) : MODE === 'multi' && S.grid ? gridView() : player(ms);
    const extra = MODE === 'director' ? director() : MODE === 'treemap' ? `<div class="a3-mh"><small>Где все · доля зрителей по эфирам</small></div>${treemap()}<div data-flows>${flows()}</div>` : MODE === 'replay' ? moments() : MODE === 'multi' ? `<div class="a3-mh"><small>Эфиры матча</small><button class="a3-gb${S.grid ? ' on' : ''}" data-a3="grid">${I.grid}${S.grid ? 'Один' : 'Сетка'}</button></div>${S.grid ? '' : thumbs()}` : chips();
    const min = S.play && !mainFloat ? `${stage}<div class="a3-row a3-row--p">${dial()}${VB(true)}</div>` : row;
    if (MODE === 'ideal' && PREV) { const left = S.preLeft, hh = Math.floor(left / 3600), mm = Math.floor(left % 3600 / 60), ss = left % 60, t3 = `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
      const poster = `<div class="a3-pl a3-pre" style="--art:url('${IMG(ms.art)}')"><div class="a3-vid"></div><div class="a3-top"><span class="a3-onair">СКОРО</span><span class="a3-src">${esc(ms.name)}</span></div>
        <div class="a3-cnt"><small>Эфир начнётся через</small><b class="num" data-live="pre">${t3}</b><button class="a3-rem${S.follow ? ' on' : ''}" data-a3="follow">${BELL(S.follow)}${S.follow ? 'Напомним за 5 минут' : 'Напомнить'}</button></div></div>`;
      const ann = `<div class="a3-mh"><small>Эфиры матча · анонс</small></div><div class="a3-ann">${STREAMS.map(x => `<span class="a3-an"><span class="a3-lit" style="--art:url('${IMG(x.art)}')"></span><span>${esc(x.name)}<small>${esc(x.src)}</small></span><em class="num">ждут ${k(Math.round(x.v * .35))}</em></span>`).join('')}</div>`;
      const rowP = `<div class="a3-row"><button class="a3-mini a3-mini--pre" style="--art:url('${IMG(ms.art)}')" data-a3="follow"><i>СКОРО</i>${BELL(S.follow)}</button>${dial()}${acts(true)}</div>`;
      return { min: rowP, full: `${poster}${ann}${dial()}${acts(false)}` }; }
    if (MODE === 'ideal') return { min, full: `${stage}<div class="a3-mh"><small>Где смотрят · эфиры матча</small></div>${heat()}${pulse()}${dial()}${acts(false)}` };
    return { min, full: `${stage}${extra}${pulse()}${dial()}${voteBox(false)}` };
  };
  const NAME = { ideal: 'Пульс матча', anchor: 'Пульс матча', multi: 'Пульс матча', capsule: 'Пульс матча', director: 'Пульс матча', treemap: 'Пульс матча', replay: 'Пульс матча' };
  let PREV = false; // до матча — для текущей перерисовки (data-pre у виджета)
  const draw = w => { PREV = (w.closest('[data-pre]') || {}).dataset?.pre === '1'; const r = widget(); w.className = 'w a3 a3--' + MODE + (PREV ? ' a3--pre' : '');
    w.innerHTML = `<div class="a3-hd"><b>${NAME[MODE]}</b><span class="a3-on num"><i></i><b data-live="view2">${k(STREAMS.reduce((a, s) => a + s.v, 0) * (PREV ? .35 : 1))}</b> ${PREV ? 'ждут' : 'смотрят'}</span></div><div class="a3-min">${r.min}</div><div class="a3-full">${r.full}</div>`; };

  // ---- плавающие окна и «на весь экран» ----
  const layer = id => document.getElementById(id) || document.body.appendChild(Object.assign(document.createElement('div'), { id, className: id }));
  const isDesk = () => document.body.classList.contains('is-desk');
  const CORNERS = ['br', 'bl', 'tr', 'tl'];
  const pos = (corner, i) => { const W = isDesk() ? 320 : 200, H = W * 9 / 16 + (MODE === 'capsule' && S.cap === 'pill' ? 0 : 0), m = 12, bottom = isDesk() ? 24 : 150, top = isDesk() ? 72 : 64;
    const w = MODE === 'capsule' && S.cap === 'pill' ? (isDesk() ? 260 : 220) : W, h = MODE === 'capsule' && S.cap === 'pill' ? 44 : H, off = i * (h + 8);
    return { w, left: corner[1] === 'l' ? m : innerWidth - w - m, top: corner[0] === 't' ? top + off : innerHeight - bottom - h - off }; };
  const drawFloats = () => { const L = layer('a3-float');
    let items = S.floats.map(f => ({ ...f, s: byId(f.id) }));
    if (MODE === 'capsule' && S.capOn) items = [{ id: S.main, corner: S.capCorner || 'br', s: byId(S.main), cap: true }];
    const perCorner = {};
    L.innerHTML = items.map(f => { const i = perCorner[f.corner] = (perCorner[f.corner] ?? -1) + 1, p = pos(f.corner, i);
      const inner = f.cap && S.cap === 'pill'
        ? `<div class="a3-pill" data-a3="capopen"><span class="a3-onair on"><i></i>В ЭФИРЕ</span><span class="a3-pn">${esc(f.s.name)}</span>${!S.muted ? '<span class="a3-eq a3-eq--s"><i></i><i></i><i></i><i></i></span>' : `<span class="a3-pmute">${I.mute}</span>`}<button data-a3="capclose" title="Закрыть">${I.x}</button></div>`
        : `${player(f.s, { where: 'f' })}${f.cap ? `<button class="a3-fmin" data-a3="cappill" title="Свернуть в капсулу">${I.down}</button>` : `<button class="a3-fx" data-a3="unpin" data-v="${f.id}" title="Закрыть">${I.x}</button>`}`;
      return `<div class="a3-fw${f.cap ? ' is-cap' : ''}${f.cap && S.cap === 'pill' ? ' is-pill' : ''}" data-fw="${f.id}" style="left:${p.left}px;top:${p.top}px;width:${p.w}px">${inner}</div>`; }).join('');
  };
  const drawFull = () => { const L = layer('a3-fullL'); if (!S.full) { L.innerHTML = ''; L.classList.remove('on'); return; }
    L.classList.add('on'); const body = MODE === 'multi' && S.grid ? gridView() : player(byId(S.main), { cls: 'is-full' });
    L.innerHTML = `<div class="a3-fs">${body}<div class="a3-fbar">${dial()}${voteBox(true)}</div><button class="a3-fsx" data-a3="full" title="Выйти (Esc)">${I.x}</button></div>`; };

  let host;
  const redraw = () => { const w = host && host.querySelector('.wx-p > .w'); w && draw(w); drawFloats(); drawFull(); };
  window.GS_ACT = (el, M) => { el.dataset.pre = M && M.state === 'pre' ? '1' : '0'; host = el; el.dataset.wxKey = 'act3'; WXKey(el, draw, '.a3-hd', false); el.classList.add('ac-host'); drawFloats(); };
  const toastA = msg => { const t = layer('a3-toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2200); };
  const freeCorner = () => CORNERS.find(c => !S.floats.some(f => f.corner === c)) || 'br';

  // ---- действия ----
  const start = () => { if (S.play || S.load) return; S.load = true; redraw(); setTimeout(() => { S.load = false; S.play = true; S.paused = false; S.ctl = true; redraw(); hideCtl(); }, 800); };
  let ctlT; const hideCtl = () => { clearTimeout(ctlT); ctlT = setTimeout(() => { S.ctl = false; document.querySelectorAll('.a3-pl').forEach(p => p.classList.remove('show-ctl')); }, 2500); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-a3]'); if (!b || b.disabled || Date.now() - (S.dragEnd || 0) < 300) return; const a = b.dataset.a3, v = b.dataset.v; // клик сразу после перетаскивания — не клик
    if (a === 'play') { if (MODE === 'capsule') { S.capOn = true; } start(); return; }
    if (a === 'pause') { S.paused = true; S.lag = 0; }
    if (a === 'resume') { S.paused = false; }
    if (a === 'live') { S.paused = false; S.lag = 0; S.rep = null; }
    if (a === 'mute') S.muted = !S.muted;
    if (a === 'full') S.full = !S.full;
    if (a === 'pop') { if (!S.floats.some(f => f.id === v)) S.floats.push({ id: v, corner: freeCorner() }); if (!S.play) start(); }
    if (a === 'dock') { S.floats = S.floats.filter(f => f.id !== v); if (v !== S.main) S.main = v; }
    if (a === 'pin') { if (S.floats.length < 3) S.floats.push({ id: v, corner: freeCorner() }); if (!S.play) start(); }
    if (a === 'unpin') S.floats = S.floats.filter(f => f.id !== v);
    if (a === 'main' || a === 'swap') { S.main = v; S.floats = S.floats.filter(f => f.id !== v); if (MODE === 'ideal' && !S.play) start(); }
    if (a === 'grid') S.grid = !S.grid;
    if (a === 'auto') { S.auto = !S.auto; S.why = ''; }
    if (a === 'share') { if (e.target.closest('.a3-acts.is-c')) { S.flash = ''; toastA('Ссылка на матч скопирована'); return; } S.shareOpen = !S.shareOpen; }
    if (a === 'sh') { S.shareOpen = false; S.flash = v === 'time' ? 'Ссылка с таймкодом скопирована — друг откроет эфир с этого момента' : v === 'tg' ? 'Открыл Telegram (демо)' : 'Ссылка на матч скопирована'; clearTimeout(S.ft); S.ft = setTimeout(() => { S.flash = ''; redraw(); }, 2600); }
    if (a === 'save') { S.saved = !S.saved; if (e.target.closest('.a3-acts.is-c')) toastA(S.saved ? 'Матч сохранён — найдёшь в «Сохранённом»' : 'Убрал из сохранённого'); else { S.flash = S.saved ? 'Матч сохранён — найдёшь в «Сохранённом»; запись появится после карты' : ''; } }
    if (a === 'follow') { S.follow = !S.follow; S.flash = S.follow ? 'Пришлём уведомление: начало карты, Рошан, перевес больше 5k' : ''; }
    if (a === 'dsel') { S.main = v; S.auto = false; S.why = ''; if (!S.play) start(); }
    if (a === 'rep') { const m = +v, ev = EV.find(x => x[0] === m); S.rep = { m, t: `${String(m).padStart(2, '0')}:${m === 24 ? '10' : m === 31 ? '05' : '00'}`, e: ev ? ev[1] : '', p: 0 }; if (!S.play) start(); }
    if (a === 'info') S.info = S.info === v ? null : v;
    if (a === 'vote') { S.vote = +v; S.cool = 30; S.my.push([N - 1, +v]); +v > 0 ? S.up2++ : S.dn2++; }
    if (a === 'cap') { S.main = v; S.capOn = true; S.cap = 'player'; if (!S.play) start(); }
    if (a === 'capopen') { if (e.target.closest('[data-a3="capclose"]')) return; S.cap = 'player'; }
    if (a === 'cappill') S.cap = 'pill';
    if (a === 'capclose') { S.capOn = false; S.play = false; }
    redraw();
  });
  // показать управление: наведение (ПК) / тап по видео (телефон)
  document.addEventListener('pointerover', e => { const p = e.target.closest && e.target.closest('.a3-pl'); if (p && S.play) { p.classList.add('show-ctl'); S.ctl = true; hideCtl(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.full) { S.full = false; redraw(); } });

  // перетаскивание окна: тянешь за любое место, отпустил — к ближайшему углу
  document.addEventListener('pointerdown', e => { const fw = e.target.closest('.a3-fw'); if (!fw || e.target.closest('button:not(.a3-pill)')) return;
    const x0 = e.clientX, y0 = e.clientY, l0 = fw.offsetLeft, t0 = fw.offsetTop; let moved = false;
    const mv = ev => { const dx = ev.clientX - x0, dy = ev.clientY - y0; if (!moved && Math.hypot(dx, dy) < 5) return; moved = true; fw.classList.add('is-drag'); fw.style.left = l0 + dx + 'px'; fw.style.top = t0 + dy + 'px'; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); if (!moved) return;
      const cx = fw.offsetLeft + fw.offsetWidth / 2, cy = fw.offsetTop + fw.offsetHeight / 2, corner = (cy < innerHeight / 2 ? 't' : 'b') + (cx < innerWidth / 2 ? 'l' : 'r'), id = fw.dataset.fw;
      if (MODE === 'capsule') S.capCorner = corner; else { const f = S.floats.find(x => x.id === id); if (f) f.corner = corner; }
      fw.classList.remove('is-drag'); S.dragEnd = Date.now(); drawFloats(); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up); });
  addEventListener('resize', () => drawFloats());

  // ---- живые числа без перерисовки (иначе видео «дёргается»): раз в секунду — время просмотра, отсчёт голоса; раз в 3 с — зрители, оценка, чат ----
  let t = 0;
  setInterval(() => { t++;
    if (S.preLeft > 0) { S.preLeft--; const l = S.preLeft; document.querySelectorAll('[data-live="pre"]').forEach(x => x.textContent = `${Math.floor(l / 3600)}:${String(Math.floor(l % 3600 / 60)).padStart(2, '0')}:${String(l % 60).padStart(2, '0')}`); }
    if (S.rep) { S.rep.p++; document.querySelectorAll('[data-live="rep"]').forEach(x => x.style.width = S.rep.p / 15 * 100 + '%'); if (S.rep.p >= 15) { S.rep = null; redraw(); } }
    if (MODE === 'director' && t % 8 === 0) { const order = ['p1', 'p2', 'ru', 'en'], nx = order[(t / 8) % 4]; STREAMS.forEach(s => { s.hype = s.id === nx ? 70 + Math.round(rnd() * 20) : Math.round(15 + rnd() * 40); s.dv = s.id === nx ? 20 + Math.round(rnd() * 25) : Math.round(rnd() * 8 - 3); });
      const h = hot(); if (S.auto && h.id !== S.main) { S.main = h.id; S.why = `Переключил на «${h.name}»: там +${h.dv} % зрителей и всплеск реакций`; } redraw(); }
    if (MODE === 'ideal' && t % 4 === 0) { const ids = STREAMS.map(x => x.id), a = byId(ids[Math.floor(rnd() * 4)]), b = byId(ids.filter(x => x !== a.id)[Math.floor(rnd() * 3)]), n = Math.round(a.v * (.02 + rnd() * .06));
      a.v -= n; b.v += n; a.dv = -Math.min(25, Math.round(n / a.v * 100)); b.dv = Math.min(45, Math.round(n / b.v * 100)); // прирост за минуту, %, в разумных пределах STREAMS.forEach(x => { if (x !== a && x !== b) x.dv = Math.round(x.dv * .5); });
      const host2 = document.querySelector('.a3-heat'); if (host2) { const wrap = host2.parentElement, old = wrap.querySelector('.a3-heat'), tmp = document.createElement('div'); tmp.innerHTML = heat(); old.nextElementSibling?.classList.contains('a3-hl') && old.nextElementSibling.remove(); old.replaceWith(...tmp.children); } }
    if (MODE === 'treemap' && t % 4 === 0) { const f = S.flows[0], from = byId(f.from), to = byId(f.to), n = Math.round(from.v * .06); from.v -= n; to.v += n; f.n = n * 4; // перетекло за 4 с ≈ в минуту /15 — показываем сглаженно
      if (rnd() > .6) { const ids = STREAMS.map(s => s.id), a = ids[Math.floor(rnd() * 4)], b = ids.filter(x => x !== a)[Math.floor(rnd() * 3)]; S.flows.unshift({ from: a, to: b, n: 300 + Math.round(rnd() * 900) }); S.flows = S.flows.slice(0, 2); }
      // без перерисовки (иначе дёргается видео): площади плиток и проценты — на месте, строки перетоков — заново
      const tot = STREAMS.reduce((a, x) => a + x.v, 0); document.querySelectorAll('.a3-tm').forEach(el => { const x = byId(el.dataset.v); if (!x) return; if (!el.classList.contains('big')) el.style.flexGrow = x.v; const pc = el.querySelector('.a3-tmp'); if (pc) pc.textContent = Math.round(x.v / tot * 100) + '%'; });
      document.querySelectorAll('[data-flows]').forEach(el => el.innerHTML = flows()); }
    if (S.play && !S.paused) { S.el++; document.querySelectorAll('[data-live="el"]').forEach(x => x.textContent = mmss(S.el)); }
    if (S.paused) S.lag++;
    if (S.cool > 0) { S.cool--; if (!S.cool) redraw(); else {
      document.querySelectorAll('.a3-cd circle').forEach(c => c.setAttribute('stroke-dashoffset', 2 * Math.PI * 9 * (1 - S.cool / 30)));
      document.querySelectorAll('.a3-vs').forEach(p => p.textContent = p.textContent.replace(/снова через \d+ с/, `снова через ${S.cool} с`)); } }
    if (S.paused) document.querySelectorAll('.a3-big--p span').forEach(x => x.textContent = `Пауза · отстаёшь на ${S.lag} с`);
    if (t % 3 === 0) { STREAMS.forEach(s => { s.v = Math.max(100, Math.round(s.v + (rnd() - .45) * s.v * .01)); document.querySelectorAll(`[data-live="sv-${s.id}"]`).forEach(x => x.textContent = k(s.v)); });
      const tot = k(STREAMS.reduce((a, s) => a + s.v, 0)); document.querySelectorAll('[data-live="view"], [data-live="view2"]').forEach(x => x.textContent = tot);
      D.chat[N - 1] = Math.max(5, Math.round(D.chat[N - 1] + (rnd() - .5) * 14)); document.querySelectorAll('[data-live="chat"]').forEach(x => x.textContent = Math.round(D.chat[N - 1])); }
  }, 1000);
})();
