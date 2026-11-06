/* w-bottom-2 — нижняя строка (созвон 05.11 §2, задачи 05.11 · 2). Раскладка — в _wb2.css (CSS grid поверх разметки w-bottom).
   WB2 = true — v1: команда строкой над героями, перевес по центру, счёт мельче, форма точками, лого 40 без обводки.
   WB2_NW = true — v2 «табло»: у каждой команды своя колонка золота (сумма net worth пятёрки на текущей минуте) рядом с героями,
   по центру — счёт; шапка команды — над героями и её золотом, подчёркнута цветом стороны.
   Порядок: шапка · 5 героев · золото · счёт · золото · 5 героев · шапка (начальник 05.11). */
(function () {
  const H = document.documentElement;
  if (!window.WB2) return;
  H.classList.add('wb2');
  if (!window.WB2_NW) return;
  H.classList.add('wb2-nw');
  if (window.WB2_LOOK) H.classList.add('wb2-l--' + window.WB2_LOOK);
  if (window.WB2_K) H.classList.add('wb2-k--' + window.WB2_K);
  if (window.WB2_V) H.classList.add('wb2-v--' + window.WB2_V);
  if (window.WB2_CMP) H.classList.add('wb2-cmp');
  if (window.WB2_SCP) H.classList.add('wb2-scp');   // счёт — такой же плашкой на оси, как перевес
  if (window.WB2_SCT) H.classList.add('wb2-sct');   // v20: счёт — как перевес, текстом на оси
  if (window.WB2_PH) H.classList.add('wb2-ph');   // v21: телефон — та же логика: шапка с золотом, пики, по центру перевес и счёт на линии
  if (window.WB2_EQ) H.classList.add('wb2-eq');   // ровные отступы: сверху, между шапкой и пиками, снизу — одинаковые
  if (window.WB2_MARK) H.classList.add('wb2-mark');   // v28: метка момента графика
  if (window.WB2_HL) H.classList.add('wb2-hl', 'wb2-hl--' + window.WB2_HL);
  if (window.WB2_HL === 'soft' || window.WB2_HL === 'at') H.classList.add('wb2-quiet');   // v34–v35: подложка градиентом, без фиолетового   // v30–v33: вид выделения момента
  if (window.WB2_ATV) H.classList.add('wb2-atv');   // v36: K/D/A и счёт — на момент и не приглушаются, тише только герои, ники, линии
  if (window.WB2_CHIP2) H.classList.add('wb2-chip2');   // v37: «LIVE» — та же серая плашка, что и время; скругление меньше
  if (window.WB2_CHIPW) H.classList.add('wb2-chipw');   // v39: плашка одной ширины — что время, что «LIVE»
  if (window.WB2_SCBD) H.classList.add('wb2-scbd');   // v40: у счёта такая же рамка, как у перевеса золота
  if (window.WB2_PHCHIP) H.classList.add('wb2-phchip');   // v41: телефон — плашка времени / «LIVE» в средней строке слева, подложка тоже
  if (window.WB2_NOXB) H.classList.add('wb2-noxb');   // v36: время под осью графика убрано — оно теперь в плашке над перевесом
  if (window.WB2_NOAT) H.classList.add('wb2-noat');   // v29: выделение момента без времени
  if (window.WB2_FIX) H.classList.add('wb2-fix');   // v28: цифры фиксированной ширины — 9.9k и 100.0k занимают одно место
  if (window.WB2_CD) H.classList.add('wb2-cd--' + window.WB2_CD);   // перевес цветом стороны лидера: 'near' — у суммы лидера; 'mid' — по центру на оси; 'pill' — по центру плашкой с лого   // вся строка компактнее   // от v6: 'chip' | 'tight' | 'axis'   // золото в строке команды, в строке пиков — счёт: 'row' | 'card' | 'tug'   // вид табло: 'plain' | 'bar' | 'split'
  const k = v => (v / 1000).toFixed(1) + 'k';
  // v24: цифры не прыгают, а плавно докручиваются до нового значения (~0,3 с, замедление к концу)
  // v24–v27: как меняются цифры — WB2_ANIM: 'count' (v24, докрутка), 'slide' (v25, новое въезжает снизу / сверху),
  // 'fade' (v26, мягкая вспышка), 'odo' (v27, меняются только разряды, каждый своим барабаном)
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANIM = RM ? '' : (window.WB2_ANIM === true ? 'count' : window.WB2_ANIM || '');
  function setNum(el, v, fmt) {
    const t = fmt(v);
    if (ANIM === 'count') {
      if (el.__to === v) return;
      const from = el.__v ?? v, t0 = performance.now(), D = 300; el.__to = v;
      cancelAnimationFrame(el.__raf);
      const step = n => { const q = Math.min(1, (n - t0) / D), e = 1 - Math.pow(1 - q, 3); el.__v = from + (v - from) * e; el.textContent = fmt(el.__v); if (q < 1) el.__raf = requestAnimationFrame(step); };
      el.__raf = requestAnimationFrame(step); return;
    }
    if (el.__t === t) return;
    const prev = el.__t, up = el.__n == null || v >= el.__n; el.__t = t; el.__n = v;
    if (!ANIM || prev == null) { el.textContent = t; return; }
    if (ANIM === 'slide') {
      el.textContent = t;
      el.animate([{ transform: `translateY(${up ? 55 : -55}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' });
    } else if (ANIM === 'fade') {
      el.textContent = t;
      el.animate([{ opacity: .3, filter: 'blur(1.5px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 180, easing: 'ease-out' });
    } else if (ANIM === 'odo') {
      const a = [...t], b = [...prev];
      el.innerHTML = a.map(c => `<span class="wb2-od"><span>${c}</span></span>`).join('');
      // разряды выравниваем по правому краю: сравниваем с конца
      [...el.children].forEach((w, i) => { const j = i - (a.length - b.length); if (b[j] !== a[i] && /\d/.test(a[i])) w.firstChild.animate([{ transform: `translateY(${up ? 100 : -100}%)` }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
    } else el.textContent = t;
  }
  // v23: привязка к графику — минута под курсором графика (наведение / палец), иначе «сейчас»; перевес — тот же ряд, что рисует график (radiant_gold_adv)
  function graphAt() {
    const g = document.querySelector('.g2'), S = g && g.parentElement && g.parentElement._g2;
    if (!S || !S.o || !S.o.m) return null;
    const m = S.o.m, now = S.o.state === 'post' ? m.duration : Math.min(S.o.t, m.duration);
    const t = S.sc != null && S.sc <= now ? S.sc : now;
    const a = m.radiant_gold_adv || [0], i = Math.min(Math.floor(t / 60), a.length - 1), f = t / 60 - i;
    const adv = a[i] + ((a[i + 1] ?? a[i]) - a[i]) * Math.min(1, f);
    const nw = p => { const n = p.nw_t || [], j = Math.min(Math.floor(t / 60), n.length - 1); return j < 0 ? 0 : n[j] + ((n[j + 1] ?? n[j]) - n[j]) * Math.min(1, t / 60 - j); };
    let r = m.players.filter(p => p.isRadiant).reduce((s, p) => s + nw(p), 0), d = m.players.filter(p => !p.isRadiant).reduce((s, p) => s + nw(p), 0);
    if (adv >= 0) r = d + adv; else d = r - adv;   // суммы сходятся с перевесом на графике: лидер = отстающий + перевес
    window.WB2_AT = t < now ? t : null; window.WB2_M = m; window.WB2_LIVE = S.o.state === 'live';   // v28 (дирижёр 06.11): момент под курсором графика — для метки «на 23:40» здесь и в колонке
    return { r, d };
  }
  function teamGold() {
    if (window.WB2_SYNC) { const g = graphAt(); if (g) return g; }
    const h = document.querySelector('.d3-row .d3-h[data-hc]'); if (!h || !window.GS_DATA) return null;
    const mid = +h.dataset.hc.split('|')[0];
    let map = null; for (const s of GS_DATA.series || []) for (const m of s.maps || []) if (m.match_id === mid) map = m;
    if (!map) return null;
    const live = document.querySelector('.ws-tabs .h3-tab.is-live small, .ws-tabs .h3-tab.on small');
    const mm = live ? parseInt(live.textContent, 10) : NaN;
    const at = p => { const t = p.nw_t || []; const i = Number.isFinite(mm) ? Math.min(mm, t.length - 1) : t.length - 1; return t[i] ?? p.net_worth ?? 0; };
    const r = map.players.filter(p => p.isRadiant).reduce((s, p) => s + at(p), 0);
    const d = map.players.filter(p => !p.isRadiant).reduce((s, p) => s + at(p), 0);
    return { r, d };
  }
  function paint() {
    const row = document.querySelector('.d3-row'); if (!row) return;
    const g = teamGold(); if (!g) return;
    // команда a — Radiant или Dire: по классу стороны у её блока
    const aRad = !!row.querySelector('.d3-tm.a.wb-rad');
    let ga = aRad ? g.r : g.d, gb = aRad ? g.d : g.r;
    // перевес — тот же, что на графике и в «+8.7k» страницы (.d3-gd); сумма лидера = сумма отстающего + перевес (иначе цифры расходятся)
    const gd = row.querySelector('.d3-gd'), gdv = gd && parseFloat((gd.textContent.match(/[\d.]+/) || [])[0]) * 1000;
    const gdLead = gd ? (gd.querySelector('img') && row.querySelector('.d3-tm.a img') && gd.querySelector('img').getAttribute('src') === row.querySelector('.d3-tm.a img').getAttribute('src') ? 'a' : 'b') : '';
    if (!window.WB2_SYNC && gdv && gdLead) { if (gdLead === 'a') ga = gb + gdv; else gb = ga + gdv; }
    const lead = Math.abs(ga - gb) < 50 ? '' : ga > gb ? 'a' : 'b'; // дирижёр 05.11: «+0.0k» (до матча) — не цветом стороны, а белым
    const diff = Math.abs(ga - gb);
    const coin = window.WB2_COIN ? '<img class="wb2-coin" src="../w-bottom-2/gold.png" alt="">' : '';   // значок золота из Доты (Steam CDN, dota_react/icons/gold.png)
    const cell = (side, v) => `<span class="wb2-nv num">${coin}${k(v)}</span>${lead === side ? `<span class="wb2-dv num">+${k(diff)}</span>` : '<span class="wb2-dv wb2-dv--0"></span>'}<small>золото</small>`;
    // ячейки строим один раз, дальше меняем только текст — значок золота не перерисовывается (не мигает)
    for (const [side, v] of [['a', ga], ['b', gb]]) {
      let el = row.querySelector(':scope > .wb2-g.' + side);
      if (!el) {
        el = document.createElement('div'); el.className = 'wb2-g ' + side;
        el.innerHTML = `<span class="wb2-nv num">${coin}<span class="wb2-nt"></span></span><span class="wb2-dv"></span><small>золото</small>`;
        row.appendChild(el);
      }
      el.classList.toggle('is-lead', lead === side);
      const nt = el.querySelector('.wb2-nt'), dv = el.querySelector('.wb2-dv');
      setNum(nt, v, k);
      if (lead === side) setNum(dv, diff, x => '+' + k(x)); else { dv.textContent = ''; dv.__v = dv.__to = undefined; }
      dv.classList.toggle('wb2-dv--0', lead !== side);
    }
    let sp = row.querySelector(':scope > .wb2-sp');   // 'split': полоса долей золота под счётом
    if (!sp) { sp = document.createElement('div'); sp.className = 'wb2-sp'; row.appendChild(sp); }
    const pa = Math.round(ga / (ga + gb) * 100), sh = `<i class="a" style="width:${pa}%"></i><i class="b" style="width:${100 - pa}%"></i>`;
    if (sp.__h !== sh) { sp.innerHTML = sh; sp.__h = sh; }
    for (const side of ['a', 'b']) {   // 'card': подложка карточки команды (шапка + золото + пики)
      if (!row.querySelector(':scope > .wb2-bg.' + side)) { const bg = document.createElement('i'); bg.className = 'wb2-bg ' + side; row.prepend(bg); }
    }
    // перевес по центру (на оси), цветом стороны лидера
    let cd = row.querySelector(':scope > .wb2-cd');
    if (!cd) { cd = document.createElement('div'); cd.className = 'wb2-cd'; row.appendChild(cd); }
    const leadTm = lead && row.querySelector('.d3-tm.' + lead), leadRad = leadTm && leadTm.classList.contains('wb-rad');
    cd.classList.toggle('is-rad', !!leadRad); cd.classList.toggle('is-dire', !!leadTm && !leadRad);
    const lg = leadTm && leadTm.querySelector('img');
    const ico = window.WB2_CDCOIN ? '<img class="wb2-cc" src="../w-bottom-2/gold.png" alt="">' : window.WB2_CDNOICO ? '' : (lg ? '<img src="' + lg.getAttribute('src') + '" alt="">' : '');   // v19: значок золота вместо лого лидера
    if (cd.__ico !== ico) { cd.innerHTML = ico + '<b class="num"></b>'; cd.__ico = ico; }
    const cb = cd.querySelector('b');
    if (lead) setNum(cb, diff, x => '+' + k(x)); else setNum(cb, 0, k); // поровну — «0.0k» белым (дирижёр 05.11)
    cd.style.visibility = '';
    // v28 (дирижёр 06.11, созвон с Антоном): водишь по графику — золото показано на тот момент; помечаем это у самих цифр:
    // ячейки золота и перевес подсвечены основным цветом, над перевесом — время момента. Отпустил — снова «сейчас»
    if (window.WB2_MARK) { const at = window.WB2_AT, on = at != null;
      row.classList.toggle('wb2-at-on', on);
      let ch = row.querySelector(':scope > .wb2-at');
      if (!ch) { ch = document.createElement('small'); ch.className = 'wb2-at num'; row.appendChild(ch); }
      // v36 (дирижёр 06.11): не наведено и карта идёт — на том же месте «LIVE» с мигающей фиолетовой точкой (WB2_LIVECHIP)
      const lv = !on && window.WB2_LIVECHIP && window.WB2_LIVE; row.classList.toggle('wb2-live-on', !!lv); ch.classList.toggle('is-live', !!lv);
      const tx = on ? Math.floor(at / 60) + ':' + String(Math.floor(at % 60)).padStart(2, '0') : lv ? 'LIVE' : '';
      if (ch.__t !== tx) { ch.__t = tx; if (lv) ch.innerHTML = '<i></i>LIVE'; else ch.textContent = tx; } }
    // v35 'at': K/D/A и счёт на момент под курсором — убийства игрока по его журналу, смерти — по журналам соперников (ключ — герой); отпустил — как было
    if (window.WB2_HL === 'at' || window.WB2_ATV) { const on = window.WB2_AT != null, m = window.WB2_M, t = window.WB2_AT, HS = window.GS_DATA && GS_DATA.heroes;
      const rows = [...row.querySelectorAll('.d3-h[data-hc]')], sc = row.querySelectorAll('.d3-sc b'), aRad = !!row.querySelector('.d3-tm.a.wb-rad');
      const put = (el, v) => { if (!el) return; if (on) { if (el.__o == null) el.__o = el.textContent; if (el.textContent !== String(v)) el.textContent = v; } else if (el.__o != null) { el.textContent = el.__o; el.__o = null; } };
      if (m) { const kl = p => (p.kills_log || []).filter(l => l.time <= t).length;
        rows.forEach(h => { const p = m.players.find(x => x.account_id === +h.dataset.hc.split('|')[1]); if (!p) return; const key = 'npc_dota_hero_' + ((HS && HS[p.hero_id] || {}).short || '');
          const d = m.players.filter(x => x.isRadiant !== p.isRadiant).reduce((a, x) => a + (x.kills_log || []).filter(l => l.key === key && l.time <= t).length, 0);
          put(h.querySelector('.kk'), on ? kl(p) : 0); put(h.querySelector('.kd'), on ? d : 0); });
        const kr = m.players.filter(x => x.isRadiant).reduce((a, x) => a + kl(x), 0), kd = m.players.filter(x => !x.isRadiant).reduce((a, x) => a + kl(x), 0);
        put(sc[0], on ? (aRad ? kr : kd) : 0); put(sc[1], on ? (aRad ? kd : kr) : 0); } }
    // v32 'line': вертикаль курсора графика (та же, что рисует график, с привязкой к точкам) продолжается сквозь строку
    if (window.WB2_HL === 'line') { const vl = window.WB2_AT != null && document.querySelector('.g2 svg line[stroke="#a1a1aa"]'); if (vl) row.style.setProperty('--wb2-x', (vl.getBoundingClientRect().left - row.getBoundingClientRect().left) + 'px'); }
    for (const g2 of row.querySelectorAll(':scope > .wb2-g')) g2.classList.toggle('lead-rad', g2.classList.contains('is-lead') && !!leadRad), g2.classList.toggle('lead-dire', g2.classList.contains('is-lead') && !leadRad);
    let lb = row.querySelector(':scope > .wb2-sl');
    if (!lb) { lb = document.createElement('small'); lb.className = 'wb2-sl'; lb.textContent = 'убийства'; row.appendChild(lb); }
  }
  let raf = 0;
  const ask = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };
  new MutationObserver(ask).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', ask); window.addEventListener('load', ask);
})();
