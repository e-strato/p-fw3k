// Лаба w-actions — «Трансляция и активность» (созвон 28.10 §3.6; начальник 29.10: «на Sports.ru в боковой колонке — лайк, комментарии, плюс-минус — социальная активность
// вокруг матча»; дирижёр 29.10: «не копия Sports.ru: сам оцениваешь матч и видишь, как оценивают другие; в центре — трансляция (Twitch), вокруг неё активность
// и предложение поактивничать; ПК — правая колонка, раскрывается на месте, как „Обсуждение“; телефон — закреплена над нижним баром; несколько вариаций»).
// Параллельно лабе w-social-2 (Claude-B). Хозяин — ../gs-match/_gs.js (виджет act, первым в правой колонке), сворачивается как остальные (../widget-expand WXKey, peek2).
// window.ACT — вариант:
//   rate    — «Плеер и оценка»: трансляция 16:9, под ней строка + / рейтинг / −, доля плюсов полосой, зрители, обсуждение, поделиться; раскрыт — как менялась оценка по картам, кто оценил ·
//   overlay — «Активность поверх эфира»: как Twitch / TikTok Live — на видео взлетают реакции, в углу рейтинг и зрители, снизу на видео кнопки + / − / 🔥; раскрыт — эфир крупнее и лента реакций ·
//   players — «Эфир и оценка игроков»: трансляция, оценка матча + / −, под ней лента 10 игроков с оценкой зрителей 1–10 (как SofaScore); нажал игрока — ставишь свою.
// Телефон: свёрнутый — полоса над нижним баром (миниатюра эфира и главное), раскрыт — шторка снизу. ‼️ Трансляция — заглушка (картинка), числа — пример.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const SV = (d, z = 16) => `<svg viewBox="0 0 24 24" width="${z}" height="${z}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = { plus: SV('<path d="M12 5v14M5 12h14"/>'), minus: SV('<path d="M5 12h14"/>'), talk: SV('<path d="M4 5h16v11H9l-5 4z"/>', 14), share: SV('<path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>', 14),
    eye: SV('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 13), play: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    fire: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5S9 11 10.5 11C10.5 7 12 2 12 2z"/></svg>' };
  const ART = '../gs-match/img/heroes/faceless_void.png', TW = '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M4 3 3 6v13h4v2h3l2-2h3l5-5V3zm15 10-3 3h-4l-2 2v-2H7V5h12zM15 7h2v5h-2zm-5 0h2v5h-2z"/></svg>';
  const S = { up: 1840, dn: 412, mine: 0, view: 24180, talk: 312, react: [], pr: {}, pOpen: null };
  const PL = [['Yatoro', 'a', 8.4, '101356886'], ['Larl', 'a', 7.6, '10366616'], ['Collapse', 'a', 8.1, '100058342'], ['rue', 'a', 5.9, '103735745'], ['not_me', 'a', 6.4, '1044002267'],
    ['Satanic', 'b', 7.8, '101356886'], ['No[o]ne-', 'b', 6.1, '10366616'], ['Noticed', 'b', 6.7, '100058342'], ['Dukalis', 'b', 6.2, '103735745'], ['9Class', 'b', 6.9, '1044002267']];
  const lg = k => `<img class="ac-lg" src="../gs-match/img/teams/${k === 'a' ? 7119388 : 9572001}.png" alt="" />`;
  const num = n => n >= 10000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : n.toLocaleString('ru');
  const up = () => S.up + (S.mine > 0 ? 1 : 0), dn = () => S.dn + (S.mine < 0 ? 1 : 0), pct = () => Math.round(up() / (up() + dn()) * 100);
  const rateBtns = () => `<span class="ac-rt"><button class="ac-pm${S.mine > 0 ? ' on up' : ''}" data-ac="up" aria-label="Матч нравится">${IC.plus}</button><b class="num ${up() >= dn() ? 'pos' : 'neg'}">${up() >= dn() ? '+' : '−'}${num(Math.abs(up() - dn()))}</b><button class="ac-pm${S.mine < 0 ? ' on dn' : ''}" data-ac="dn" aria-label="Матч не нравится">${IC.minus}</button></span>`;
  const stream = (cls = '') => `<div class="ac-tv ${cls}" style="--art:url('${ART}')"><span class="ac-live">LIVE</span><span class="ac-src">${TW}Twitch · ru</span><span class="ac-view num">${IC.eye}${num(S.view)}</span><button class="ac-play" data-a="toast" data-v="Трансляция (демо)">${IC.play}</button></div>`;
  const metaRow = () => `<span class="ac-meta"><button data-a="toast" data-v="Обсуждение — виджет ниже">${IC.talk}<b class="num">${S.talk}</b></button><button data-a="toast" data-v="Поделиться матчем (демо)">${IC.share}</button></span>`;
  const callout = () => S.mine ? `<p class="ac-hint">Ты ${S.mine > 0 ? 'за' : 'против'} · с тобой ${S.mine > 0 ? pct() : 100 - pct()} % зрителей</p>` : '<p class="ac-hint">Как тебе матч? Оцени — увидишь, совпал ли с остальными</p>';

  // v1 rate
  const rate = () => {
    const bar = `<div class="ac-split"><i style="width:${pct()}%"></i></div><div class="ac-splt num"><span>+ ${pct()} %</span><span>${num(up() + dn())} оценок</span><span>− ${100 - pct()} %</span></div>`;
    const maps = [['Карта 1', 62], ['Карта 2', 71], ['Карта 3', pct()]];
    return { min: `${stream()}<div class="ac-row">${rateBtns()}${metaRow()}</div>${callout()}`,
      full: `${stream()}<div class="ac-row">${rateBtns()}${metaRow()}</div>${bar}<div class="ac-maps"><small>Как менялась оценка</small>${maps.map(([m, p]) => `<div class="ac-mp"><span>${m}</span><i><u style="width:${p}%"></u></i><b class="num">${p} %</b></div>`).join('')}</div>${callout()}` };
  };
  // v2 overlay — реакции поверх эфира
  const overlay = () => {
    const ov = big => `<div class="ac-tv ac-tv--ov${big ? ' is-big' : ''}" style="--art:url('${ART}')"><span class="ac-live">LIVE</span><span class="ac-view num">${IC.eye}${num(S.view)}</span>
      <span class="ac-ovr num ${up() >= dn() ? 'pos' : 'neg'}">${up() >= dn() ? '+' : '−'}${num(Math.abs(up() - dn()))} · ${pct()} % 👍</span><div class="ac-fly" data-ac-fly></div>
      <div class="ac-ovb"><button class="ac-ob${S.mine > 0 ? ' on' : ''}" data-ac="up">${IC.plus}</button><button class="ac-ob${S.mine < 0 ? ' on' : ''}" data-ac="dn">${IC.minus}</button><button class="ac-ob ac-ob--f" data-ac="fire">${IC.fire}</button><button class="ac-ob" data-a="toast" data-v="Обсуждение — виджет ниже">${IC.talk}</button><button class="ac-ob" data-a="toast" data-v="Поделиться (демо)">${IC.share}</button></div></div>`;
    const feed = `<div class="ac-rf"><small>Реакции зрителей · за минуту</small><div class="ac-rfr num"><span>👍 <b>${num(up() - 1700)}</b></span><span>👎 <b>${dn() - 380}</b></span><span>🔥 <b>${412 + S.react.length}</b></span><span>💬 <b>${S.talk}</b></span></div></div>`;
    return { min: ov(false), full: `${ov(true)}${feed}${callout()}` };
  };
  // v3 players — оценка матча и игроков
  const players = () => {
    const pl = (p, i) => { const [n, k, r, a] = p, my = S.pr[i]; return `<button class="ac-p${S.pOpen === i ? ' on' : ''}" data-ac="pl" data-v="${i}"><img src="../gs-match/img/players/${a}.jpg" alt="" /><b class="num ${r >= 7.5 ? 'hi' : r < 6.3 ? 'lo' : ''}">${(my || r).toFixed(1)}</b><small>${esc(n)}</small>${lg(k)}</button>`; };
    const pick = S.pOpen != null ? `<div class="ac-pk"><span>Твоя оценка · ${esc(PL[S.pOpen][0])}</span><div>${[4, 5, 6, 7, 8, 9, 10].map(v => `<button class="${S.pr[S.pOpen] === v ? 'on' : ''}" data-ac="pv" data-v="${v}">${v}</button>`).join('')}</div></div>` : '';
    return { min: `${stream()}<div class="ac-row">${rateBtns()}${metaRow()}</div><div class="ac-pls">${PL.slice(0, 5).map(pl).join('')}</div>`,
      full: `${stream()}<div class="ac-row">${rateBtns()}${metaRow()}</div>${callout()}<div class="ac-plh"><small>Оценка игроков зрителями</small><small>нажми — поставь свою</small></div><div class="ac-pls ac-pls--all">${PL.map(pl).join('')}</div>${pick}` };
  };

  const V = { rate, overlay, players };
  const draw = w => { const r = V[window.ACT || 'rate'](); w.className = 'w ac ac--' + (window.ACT || 'rate');
    w.innerHTML = `<div class="ac-min">${r.min}</div><div class="ac-full">${r.full}</div>`; };
  let host;
  window.GS_ACT = el => { host = el; el.dataset.wxKey = 'act'; WXKey(el, draw, '.ac-row', false); el.classList.add('ac-host'); };
  const redraw = () => { const w = host && host.querySelector('.wx-p > .w'); w && draw(w); };

  const fly = (b, e) => { const box = host && host.querySelector('.wx:not(.is-c) .ac-full [data-ac-fly], .wx.is-c .ac-min [data-ac-fly]') || host && host.querySelector('[data-ac-fly]'); if (!box) return;
    const f = document.createElement('i'); f.textContent = e; f.style.left = 20 + Math.random() * 60 + '%'; box.appendChild(f); setTimeout(() => f.remove(), 1600); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ac]'); if (!b) return;
    const a = b.dataset.ac;
    if (a === 'up') S.mine = S.mine > 0 ? 0 : 1;
    if (a === 'dn') S.mine = S.mine < 0 ? 0 : -1;
    if (a === 'fire') { S.react.push(1); fly(b, '🔥'); return; }
    if (a === 'pl') S.pOpen = S.pOpen === +b.dataset.v ? null : +b.dataset.v;
    if (a === 'pv') { S.pr[S.pOpen] = +b.dataset.v; S.pOpen = null; }
    redraw();
    if (a === 'up' || a === 'dn') fly(b, a === 'up' ? '👍' : '👎');
  });
  // v2: зрители реагируют сами — реакции взлетают по эфиру
  if (window.ACT === 'overlay') setInterval(() => fly(null, ['🔥', '👍', '😱', '👍', '🔥', '😂'][Math.floor(Math.random() * 6)]), 900);
})();
