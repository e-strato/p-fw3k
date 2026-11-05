// Лаба w-bottom — «Нижняя строка: команды вниз» (созвон 04.11, задачи 04.11 · область 3). Начальник: «заголовок с командами соотнести к нижнему элементу с пиками:
// название команды, логотип, её текущая форма и сторона — красной или зелёной точкой, сильно выделять не надо» (1·08:31); дирижёр 04.11: подпись Radiant / Dire остаётся.
// Поверх w-series v22 (там у пиков уже лого, название и Radiant / Dire — .ws-tm). Здесь — форма команды: последние 5 серий турнира до этого матча
// (../gs-match/data/_tournament.js, GS_TOURNAMENT; «сейчас» — GS_NOW). window.WB: dots — 5 точек (зелёная — победа, красная — поражение, свежая справа) ·
// letters — буквы W / L · streak — серия подряд одной плашкой («W3») · bars — 5 столбиков: высота — счёт по картам
(() => {
  const K = window.WB; if (!K) return;
  document.documentElement.classList.add('wb', 'wb--' + K);
  // v6–v9 (дирижёр 04.11: «берём точками, но форму ближе и другое расположение; и цветом подсветить, кто Dire, кто Radiant»): window.WB_LAY —
  // inline — точки сразу за названием в одной строке, под ним «Radiant» зелёным / «Dire» красным · pill — под названием плашка стороны цветом стороны, точки рядом ·
  // ring — у лого кольцо цвета стороны, точки сразу за названием, под ним сторона · dot — перед «Radiant / Dire» точка цвета стороны, форма — за названием
  // v10 (дирижёр 04.11: «на основе v8; убери над и под графиком дубликаты»): WB_NOLBL — подписей команд на графике нет (сверху «Team Spirit», снизу «PARIVISION +8.7k»):
  // команды уже в нижней строке. Полосы под них у графика тоже убраны (на странице — out: false, WS_OUT0)
  if (window.WB_NOLBL) document.documentElement.classList.add('wb-nolbl');
  // v11 (дирижёр 04.11: «график растянуть по ширине — минимальные отступы 4, чтобы не наезжал на углы; по высоте убрать лишний отступ — прижат к табам;
  // минимальная высота, ниже которой он не тянется на весь экран — страница своей высоты и прокручивается»): WB_WIDE — у графика поля 4 по бокам и 0 сверху,
  // на странице у графика tight (слева без поля, запас по значениям сверху и снизу меньше) и WS_GMIN = 360
  if (window.WB_WIDE) document.documentElement.classList.add('wb-wide');
  // v12–v13 (дирижёр 04.11: «счёт крупнее, перевес по золоту, номер позиции в самый угол серым, под героем линия hard / mid / easy — за один заход»; созвон 3.3–3.5, чат 3.8):
  // WB_ROW3 — счёт крупнее, без «убийства»; перевес по золоту — жёлтым, без лого и без «золото», с той стороны от счёта, чья команда ведёт; номер позиции —
  // в самом углу иконки, серым; под героем — линия и шанс выиграть её по драфту (▲ зелёным ≥ 50, ▼ красным). ‼️ Шансы — пример (числа из скрина начальника), данных нет.
  // Линия — по позиции: 1 и 5 — easy, 2 — mid, 3 и 4 — hard. WB_LANE: text — строкой под счётом героя (как у начальника) · chip — плашкой над ником
  const R3 = !!window.WB_ROW3, LN = window.WB_LANE || 'text';
  if (R3) document.documentElement.classList.add('wb-r3', 'wb-ln--' + LN);
  const LANE = { 1: 'easy', 2: 'mid', 3: 'hard', 4: 'hard', 5: 'easy' }, PCT = { a: { easy: 48, mid: 61, hard: 32 }, b: { hard: 52, mid: 39, easy: 68 } };
  const lanes = () => document.querySelectorAll('.d3-five .d3-h:not(.wb-ln-on)').forEach(h => { const n = +(h.querySelector('.d3-i b') || {}).textContent, side = h.closest('.d3-five').classList.contains('a') ? 'a' : 'b', ln = LANE[n]; if (!ln) return;
    h.classList.add('wb-ln-on'); const v = PCT[side][ln], up = v >= 50, tag = `<span class="wb-ln ${up ? 'up' : 'dn'}" title="Линия ${ln}: шанс выиграть по драфту ${v}% (пример)">${ln} ${up ? '▲' : '▼'}${v}%</span>`;
    if (LN === 'chip') { const nk = h.querySelector('.d3-n') || h.querySelector('.pk-a'); (nk || h.querySelector('.d3-i')).insertAdjacentHTML('beforebegin', tag); } else h.insertAdjacentHTML('beforeend', tag); });
  if (R3) new MutationObserver(lanes).observe(document.documentElement, { childList: true, subtree: true });
  // v21 (дирижёр 04.11: «v17 берём, галочки — зелёные»): WB_GREEN — ✓ цветом победы (зелёный), ✕ серым
  if (window.WB_GREEN) document.documentElement.classList.add('wb-green');
  // v22 (дирижёр 04.11: «галочки и крестики чуть поменьше»): WB_SM — значки 8 вместо 10
  if (window.WB_SM) document.documentElement.classList.add('wb-sm');
  // v23 (дирижёр 04.11: «логотип команды — над названием, чтобы выиграть ещё место по горизонтали»): WB_STACK — блок команды столбиком: лого, под ним название, под ним сторона и форма
  if (window.WB_STACK) document.documentElement.classList.add('wb-stack');
  // v24 (дирижёр 04.11: «логотип чуть больше, место есть; не круг, а квадрат со скруглёнными углами»): WB_SQ — лого 32, рамка цвета стороны — квадрат со скруглением 8
  if (window.WB_SQ) document.documentElement.classList.add('wb-sq');
  // v25 (дирижёр 04.11: «перевес по золоту — возле логотипа, тегом; на графике без минусовой оси»): WB_GTAG — у счёта золота нет, жёлтый тег «+8.7k»
  // стоит рядом с лого той команды, что ведёт; ось графика без минуса — на странице у графика absY
  // v26 (дирижёр 04.11: «логотип чуть меньше — сейчас перебор»): WB_LG28 — лого 28 вместо 32
  if (window.WB_LG28) document.documentElement.classList.add('wb-lg28');
  // v27 (дирижёр 04.11: «логотип и перевес по золоту — единообразные по высоте»): WB_GT28 — тег золота той же высоты и скругления, что рамка лого (28, 7)
  if (window.WB_GT28) document.documentElement.classList.add('wb-gt28');
  // v28 (дирижёр 04.11: «наведение на команду и на пик — единообразное: одинаковые отступы по краям»): WB_HOV — у пика и у блока команды одна и та же
  // подсветка при наведении: подложка --w-muted, скругление 8, поля 6 сверху / снизу и 6 по бокам
  if (window.WB_HOV) document.documentElement.classList.add('wb-hov');
  // v29 (дирижёр 04.11: «цветная рамка у лого — только у той команды, что сейчас лидирует»): WB_LEADBD — у лидера по золоту рамка цвета стороны, у второй — серая
  if (window.WB_LEADBD) document.documentElement.classList.add('wb-leadbd');
  // v30 (дирижёр 04.11: «блоки по высоте единообразные — и пики, и команды»): WB_EQH — блок команды той же высоты, что пик (меряем пик), содержимое по центру
  const EQH = !!window.WB_EQH; if (EQH) document.documentElement.classList.add('wb-eqh');
  const eqh = () => document.querySelectorAll('.d3-five').forEach(f => { const h = f.querySelector('.d3-h'), t = f.querySelector('.d3-tm.ws-tm'); if (!h || !t) return;
    const px = h.offsetHeight + 'px'; if (t.style.height !== px) t.style.height = px; });
  // v31 (дирижёр 04.11: «шапка сайта при прокрутке не двигается — всегда на экране»; DECISIONS 04.11): WB_PTFIX — шапка сайта не уезжает вверх (хозяин прячет её классом body.pt-off)
  if (window.WB_PTFIX) document.documentElement.classList.add('wb-ptfix');
  // v32 (дирижёр 04.11: «прокрутки быть не должно»): WB_NOSCR — на компьютере страница не прокручивается: всё в один экран (центр тянется по высоте),
  // правая колонка — своей прокруткой внутри; если окно ниже минимума графика (WS_GMIN) — страница снова прокручивается, как на телефоне
  const NOSCR = !!window.WB_NOSCR;
  const lock = () => { const de = document.documentElement, sv = document.querySelector('.bw .g2-plot svg'), side = document.querySelector('.gm-side');
    const on = document.body.classList.contains('is-desk') && sv && +sv.getAttribute('height') > (window.WS_GMIN || 220) + 1;
    if (de.classList.contains('wb-lock') !== !!on) { de.classList.toggle('wb-lock', !!on); if (on) scrollTo(0, 0); }
    if (side) { const t = Math.round(side.getBoundingClientRect().top + scrollY) + 'px'; if (de.style.getPropertyValue('--wb-top') !== t) de.style.setProperty('--wb-top', t); } };
  if (NOSCR) { addEventListener('resize', lock); setInterval(lock, 1000); }
  // v34 (дирижёр 04.11, телефон: «таббар с картами прокручивается аккуратно; команды обе — как Team Spirit, всё к левому краю; график на всю ширину — по 4 по бокам»):
  // WB_PH — на телефоне табы листаются вбок (без полосы прокрутки, выбранный таб сам доезжает в видимую часть); блок Dire — как Radiant (лого слева, текст влево);
  // график — от краёв окна по 4 (и на компьютере)
  const PH = !!window.WB_PH; if (PH) document.documentElement.classList.add('wb-ph');
  const tabIn = () => document.querySelectorAll('.ws-tabs').forEach(n => { if (n.scrollWidth <= n.clientWidth + 1) return; const on = n.querySelector('.h3-tab.on'); if (!on || n._wbOn === on.dataset.v + (on.dataset.ws || '')) return;
    n._wbOn = on.dataset.v + (on.dataset.ws || ''); const l = on.offsetLeft - 12, r = on.offsetLeft + on.offsetWidth + 12; if (l < n.scrollLeft) n.scrollTo({ left: l, behavior: 'smooth' }); else if (r > n.scrollLeft + n.clientWidth) n.scrollTo({ left: r - n.clientWidth, behavior: 'smooth' }); });
  // v35 (созвон 2.3 + скрин дирижёра 04.11 «ромбы поправь, начальник что-то такое имел в виду»): WB_RH — ромбы драк серые (рамка и метка), число белым;
  // цветными становятся при наведении и у выбранной драки; точки на линии графика и пунктир не трогаем
  if (window.WB_RH) document.documentElement.classList.add('wb-rh');
  // v36 (дирижёр 04.11: «ромбы просто серые, заполняются; при наведении только появляется подсказка, сами ромбы не меняются»): WB_RH2 — ромбы залиты серым, число белым, без цвета и без смены при наведении
  if (window.WB_RH2) document.documentElement.classList.add('wb-rh2');
  // v36 (дирижёр 04.11: «на мобилке кнопки графика перенести ниже»): WB_PHBTN — на телефоне кнопки графика — отдельной строкой под табами, справа
  if (window.WB_PHBTN) document.documentElement.classList.add('wb-phbtn');
  const GT = !!window.WB_GTAG; if (GT) document.documentElement.classList.add('wb-gtag');
  const gtag = () => document.querySelectorAll('.d3-gd').forEach(gd => { const root = gd.closest('.d3') || gd.parentElement.parentElement, side = gd.classList.contains('a') ? 'a' : 'b', val = gd.textContent.trim();
    root.querySelectorAll('.d3-tm.ws-tm').forEach(tm => { const on = tm.classList.contains(side); if (tm.classList.contains('wb-lead') !== on) tm.classList.toggle('wb-lead', on); });
    root.querySelectorAll('.d3-tm .wb-gt').forEach(t => { const show = t.closest('.d3-tm').classList.contains(side); if (t.hidden === show) t.hidden = !show; if (show && t.textContent !== val) t.textContent = val; }); });
  const LAY = window.WB_LAY; if (LAY) document.documentElement.classList.add('wb-lay', 'wb-lay--' + LAY);
  const T = window.GS_TOURNAMENT, D = window.GS_DATA;
  const idOf = (img, name) => { const m = img && /teams\/(\d+)\./.exec(img.getAttribute('src') || ''); if (m) return +m[1];
    const e = D && Object.entries(D.teams).find(([, t]) => t.name === name); return e ? +e[0] : null; };
  // форма: серии команды, закончившиеся до начала текущей серии (её старт — самая свежая серия, где команда сейчас играет), последние 5, старые слева
  const form = id => { if (!T || !id) return []; const now = window.GS_NOW || Date.now() / 1000;
    const mine = T.series.filter(s => s.a === id || s.b === id).sort((x, y) => x.start - y.start);
    const cur = mine.filter(s => s.start <= now).pop();
    return mine.filter(s => s !== cur && s.start + s.maps.reduce((n, m) => n + m.dur, 0) < now).slice(-5).map(s => { const me = s.maps.filter(m => m.win === id).length, op = s.maps.length - me; return { w: me > op, me, op }; }); };
  const html = f => {
    if (!f.length) return '<em class="wb-f wb-f--none">нет серий</em>';
    // v17–v20 (дирижёр 04.11: «зелёный / красный и у формы, и у Radiant / Dire — логика цветов перемешана; форму — иконками, галочка / крестик, другим зелёным, мини-блоками»):
    // icons — ✓ / ✕ значками: галочка мягким мятным, крестик серым · mono — мини-блоки без цвета: победа — светлый, поражение — пустой контур · tiles — мини-плитки 14 с ✓ / ✕ внутри, подложка нейтральная ·
    // ratio — «4–1» за последние 5 и пять тонких делений без цвета
    const CK = '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M2 5.4 4.1 7.5 8 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const CX = '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M3 3l4 4M7 3 3 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    const ttl = `title="Последние ${f.length} серий: ${f.map(r => r.w ? 'победа' : 'поражение').join(', ')}"`;
    if (K === 'icons') return `<span class="wb-f wb-tl wb-tl--bare" ${ttl}>${f.map(r => `<i class="${r.w ? 'w' : 'l'}">${r.w ? CK : CX}</i>`).join('')}</span>`;
    if (K === 'mono') return `<span class="wb-f wb-mono" ${ttl}>${f.map(r => `<i class="${r.w ? 'w' : 'l'}"></i>`).join('')}</span>`;
    if (K === 'tiles') return `<span class="wb-f wb-tl" ${ttl}>${f.map(r => `<i class="${r.w ? 'w' : 'l'}">${r.w ? CK : CX}</i>`).join('')}</span>`;
    if (K === 'ratio') { const w = f.filter(r => r.w).length; return `<span class="wb-f wb-rt" ${ttl}><b class="num">${w}–${f.length - w}</b><span>${f.map(r => `<i class="${r.w ? 'w' : 'l'}"></i>`).join('')}</span></span>`; }
    if (K === 'dots') return `<span class="wb-f wb-dots" title="Последние ${f.length} серий">${f.map(r => `<i class="${r.w ? 'w' : 'l'}"></i>`).join('')}</span>`;
    if (K === 'letters') return `<span class="wb-f wb-let">${f.map(r => `<b class="${r.w ? 'w' : 'l'}">${r.w ? 'W' : 'L'}</b>`).join('')}</span>`;
    if (K === 'bars') return `<span class="wb-f wb-bars">${f.map(r => `<i class="${r.w ? 'w' : 'l'}" style="height:${4 + Math.round(8 * (r.w ? r.me : r.op) / Math.max(1, r.me + r.op))}px" title="${r.me}:${r.op}"></i>`).join('')}</span>`;
    // streak: сколько подряд с конца
    const last = f[f.length - 1]; let n = 0; for (let i = f.length - 1; i >= 0 && f[i].w === last.w; i--) n++;
    return `<span class="wb-f wb-st ${last.w ? 'w' : 'l'}" title="${last.w ? 'Побед' : 'Поражений'} подряд: ${n}">${last.w ? 'W' : 'L'}${n}</span>`; };
  const put = () => document.querySelectorAll('.d3-tm.ws-tm:not(.wb-on)').forEach(t => { const tn = t.querySelector('.ws-tn'), sm = tn && tn.querySelector('small'); if (!sm) return;
    t.classList.add('wb-on'); const f = form(idOf(t.querySelector('img'), t.title)), rad = t.classList.contains('a');
    // v14–v16 (дирижёр 04.11: «за основу v12, но кружки формы — в другое место: сильно сдвигают, под пики не остаётся места»): window.WB_FPOS —
    // side — второй строкой, рядом с Radiant / Dire · logo — под лого, маленькими точками · top — над названием
    const FP = window.WB_FPOS;
    if (LAY) { const b = tn.querySelector('b'); t.classList.add(rad ? 'wb-rad' : 'wb-dire');
      if (GT) { const im = t.querySelector('img'); if (im) im.outerHTML = `<span class="wb-lr">${im.outerHTML}<em class="wb-gt num" hidden></em></span>`; }
      if (FP === 'logo') { const im = t.querySelector('img'); if (im) im.outerHTML = `<span class="wb-lg">${im.outerHTML}${html(f)}</span>`; }
      if (FP === 'top') tn.insertAdjacentHTML('afterbegin', html(f));
      b.outerHTML = FP ? `<b>${b.innerHTML}</b>` : `<span class="wb-nm"><b>${b.innerHTML}</b>${html(f)}</span>`;
      // v33 (дирижёр 04.11: «форму — рядом с аватаркой; перевес по золоту — над формой, друг под другом, а сбоку — лого»): WB_FL2 — у лого столбик: сверху тег золота (если ведёт), под ним форма
      if (window.WB_FL2 && GT) { const lr = t.querySelector('.wb-lr'), gt = lr && lr.querySelector('.wb-gt');
        if (lr && gt) { gt.outerHTML = `<span class="wb-lc">${gt.outerHTML}${html(f)}</span>`; sm.innerHTML = `<span class="wb-side">${sm.textContent}</span>`; return; } }
      if (FP === 'side') { sm.innerHTML = `<span class="wb-side">${LAY === 'dot' ? '<i class="wb-sd"></i>' : ''}${sm.textContent}</span>${html(f)}`; return; } sm.innerHTML = `<span class="wb-side">${LAY === 'dot' ? '<i class="wb-sd"></i>' : ''}${sm.textContent}</span>`; return; }
    sm.innerHTML = `<span class="wb-side">${sm.textContent}</span>${html(f)}`; });
  new MutationObserver(() => { put(); if (GT) gtag(); if (EQH) eqh(); if (NOSCR) lock(); if (PH) tabIn(); }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
