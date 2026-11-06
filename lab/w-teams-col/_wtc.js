// w-teams-col — задача 5.3 (созвон 05.11, 14:00): на компьютере команды, счёт и игроки — первым виджетом правой колонки, нижняя строка под графиком уходит; на телефоне — как сейчас
// начальник: «никнейм, счёт… справа… больше инфо вместится… статичная инфа для идентификации игрока, динамичный KDA… ещё динамичный показатель — или золото, или поинты»
// WTC_V: 'list' — две команды друг под другом, счёт между ними · 'table' — счёт сверху, одна таблица с заголовками колонок · 'pts' — как list, но вместо золота игрока — очки (‼️ пример)
// Данные — из нижней строки страницы (она остаётся в разметке, на компьютере скрыта) и из карты графика (золото игрока по минутам)
// v4–v6 (дирижёр 05.11: «слабоватая… может быть именно золото показывать, без пиков; пики оставим на месте»): WTC_KEEP — нижняя строка остаётся; в колонке только золото команд
//   WTC_V: 'gold' — две команды строками, суммы золота и перевес · 'split' — доли золота полосой · 'pos' — золото по позициям: 1 против 1 … 5 против 5
(() => { if (!window.WTC) return; const H = document.documentElement, V = window.WTC_V || 'list'; H.classList.add('wtc', 'wtc--' + V); if (window.WTC_KEEP) H.classList.add('wtc-keep'); if (window.WTC_BR) H.classList.add('wtc-br'); if (window.WTC_FIX) H.classList.add('wtc-fix'); if (window.WTC_NOAT) H.classList.add('wtc-noat'); if (window.WTC_SOFT) H.classList.add('wtc-soft');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const k = v => (v / 1000).toFixed(1) + 'k';
  const team = (row, side) => { const t = row.querySelector(`.d3-five.${side} .d3-tm`) || {}, im = t.querySelector && t.querySelector('img'), sm = t.querySelector && t.querySelector('small');
    return { name: (t.querySelector && (t.querySelector('b') || {}).textContent) || t.title || '', logo: im ? im.getAttribute('src') : '', rad: t.classList ? t.classList.contains('wb-rad') : side === 'a', gold: ((row.querySelector(`.wb2-g.${side} .wb2-nt`) || {}).textContent || '').trim() }; };
  const players = (row, side, m, t) => [...row.querySelectorAll(`.d3-five.${side} .d3-h`)].map(h => { const im = h.querySelector('.d3-i img'), acc = +((h.dataset.hc || '').split('|')[1]), p = m && m.players.find(x => x.account_id === acc);
    const kk = +(h.querySelector('.kk') || {}).textContent || 0, kd = +(h.querySelector('.kd') || {}).textContent || 0, ka = (h.querySelector('.ka') || {}).textContent || '—';
    const nw = p && p.nw_t ? p.nw_t[Math.max(0, Math.min(p.nw_t.length - 1, Math.floor(t / 60)))] || 0 : 0;
    return { img: im ? im.getAttribute('src').replace('/icon/', '/') : '', pos: (h.querySelector('.d3-i b') || {}).textContent || '', nick: (h.querySelector('.d3-n') || {}).textContent || '', hero: (h.title || '').split(' · ')[0], kk, kd, ka, nw,
      pts: Math.round((kk * 3 - kd + nw / 2000) * 10) / 10 }; });   // ‼️ очки — пример: 3 за убийство, −1 за смерть, +0.5 за каждые 1000 золота
  const prow = (p, metric) => `<div class="wtc-p"><span class="wtc-h"><img src="${esc(p.img)}" alt="" title="${esc(p.hero)}"><b>${esc(p.pos)}</b></span><span class="wtc-n">${esc(p.nick)}</span><span class="wtc-k num"><i class="kk">${p.kk}</i>/<i class="kd">${p.kd}</i>/<i>${esc(p.ka)}</i></span><span class="wtc-v num">${metric(p)}</span></div>`;
  const thd = (T, side) => `<div class="wtc-t ${side}"><img src="${esc(T.logo)}" alt=""><span class="wtc-tn"><b>${esc(T.name)}</b><small class="${T.rad ? 'rad' : 'dire'}">${T.rad ? 'Radiant' : 'Dire'}</small></span>${V !== 'table' && T.gold ? `<span class="wtc-g num"><img src="../w-bottom-2/gold.png" alt="">${esc(T.gold)}</span>` : ''}</div>`;
  const build = () => { const row = document.querySelector('.bw .d3-row'), g = document.querySelector('.g2'), S = g && g.parentElement._g2; if (!row) return '';
    const m = S && S.o && S.o.m, t = S && S.o ? S.o.t || 0 : 0, A = team(row, 'a'), B = team(row, 'b'), PA = players(row, 'a', m, t), PB = players(row, 'b', m, t);
    const sc = [...row.querySelectorAll('.d3-sc b')].map(b => b.textContent), cd = row.querySelector('.wb2-cd'), dv = cd ? cd.textContent.trim() : '', dc = cd ? (cd.classList.contains('is-rad') ? 'rad' : cd.classList.contains('is-dire') ? 'dire' : '') : '';
    const metric = V === 'pts' ? p => `${p.pts}` : p => k(p.nw);
    const mid = `<div class="wtc-sc"><span class="num">${esc(sc[0] || 0)}<i>:</i>${esc(sc[1] || 0)}</span>${dv ? `<em class="num ${dc}">${esc(dv)}</em>` : ''}</div>`;
    // v7–v9 (дирижёр 05.11: «надо показывать, кто Radiant, кто Dire… сюда переходит счёт, перевес, золото и мини-графики… пока непонятно, кто и где выигрывает»)
    //   'board' — табло: команды со сторонами, счёт, суммы, «ведёт …», мини-график перевеса · 'two' — то же, мини-графики перевеса и убийств · 'lead' — сверху крупно, кто ведёт и на сколько
    if (V === 'board' || V === 'two' || V === 'lead') { const pk = x => parseFloat(x) * 1000 || 0, gA = pk(A.gold), gB = pk(B.gold), diff = Math.abs(gA - gB), lead = diff < 50 ? '' : gA > gB ? 'a' : 'b', LT = lead ? (lead === 'a' ? A : B) : null;
      const sd = T => `<small class="${T.rad ? 'rad' : 'dire'}">${T.rad ? 'Radiant' : 'Dire'}</small>`, coin = '<img class="wtc-c" src="../w-bottom-2/gold.png" alt="">', cls = T => T && T.rad ? 'rad' : 'dire';
      const top = `<div class="wtc-bd"><span class="wtc-bt a"><img src="${esc(A.logo)}" alt=""><b>${esc(A.name)}</b>${sd(A)}</span><span class="wtc-bs num"><b${lead === 'a' ? ' class="on"' : ''}><span data-n>${esc(sc[0] || 0)}</span></b><i>:</i><b${lead === 'b' ? ' class="on"' : ''}><span data-n>${esc(sc[1] || 0)}</span></b><small>убийства</small></span><span class="wtc-bt b"><img src="${esc(B.logo)}" alt=""><b>${esc(B.name)}</b>${sd(B)}</span></div>`;
      const gl = `<div class="wtc-bg num"><span class="${lead === 'a' ? 'on' : ''}">${coin}<span data-n>${k(gA)}</span></span><small>золото</small><span class="${lead === 'b' ? 'on' : ''}"><span data-n>${k(gB)}</span>${coin}</span></div>`;
      const ld = `<div class="wtc-ld ${LT ? cls(LT) : ''}">${LT ? `<img src="${esc(LT.logo)}" alt=""><span>Ведёт <b>${esc(LT.name)}</b></span><em class="num"><span data-n>+${k(diff)}</span></em>` : '<span>Поровну по золоту</span>'}</div>`;
      // мини-графики: перевес Radiant по минутам (выше нуля — Radiant, ниже — Dire) и убийства команд по минутам
      const W = 288, Hh = 56, mins = Math.max(1, Math.floor(t / 60)), adv = m ? [...m.radiant_gold_adv.slice(0, mins + 1)] : [0], mxA = Math.max(500, ...adv.map(Math.abs));
      const X = i => (i / Math.max(1, adv.length - 1) * W).toFixed(1), Y = v => (Hh / 2 - v / mxA * (Hh / 2 - 3)).toFixed(1);
      const area = sgn => `M0,${Hh / 2} ` + adv.map((v, i) => `L${X(i)},${Y(sgn > 0 ? Math.max(0, v) : Math.min(0, v))}`).join(' ') + ` L${W},${Hh / 2} Z`;
      let spark = `<div class="wtc-mg"><div class="wtc-mh"><span>Перевес по золоту</span><small>0–<span data-n>${mins}</span>′</small></div><svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><line x1="0" x2="${W}" y1="${Hh / 2}" y2="${Hh / 2}"/><path class="rad" d="${area(1)}"/><path class="dire" d="${area(-1)}"/><polyline points="${adv.map((v, i) => X(i) + ',' + Y(v)).join(' ')}"/></svg><div class="wtc-ml"><small class="rad">▲ Radiant</small><small class="dire">▼ Dire</small></div></div>`;
      let kills = '';
      if (V === 'two' && m) { const kl = rad => { const ts = m.players.filter(p => p.isRadiant === rad).flatMap(p => p.kills_log.map(l => l.time)).filter(x => x <= t).sort((a, b) => a - b); return [...Array(mins + 1)].map((_, i) => ts.filter(x => x <= i * 60).length); };
        const kr = kl(true), kd = kl(false), mk = Math.max(1, kr[kr.length - 1], kd[kd.length - 1]), Yk = v => (Hh - 3 - v / mk * (Hh - 8)).toFixed(1), Xk = i => (i / Math.max(1, mins) * W).toFixed(1);
        const ln = a => a.map((v, i) => `${Xk(i)},${Yk(v)}`).join(' ');
        kills = `<div class="wtc-mg"><div class="wtc-mh"><span>Убийства</span><small><b class="rad"><span data-n>${kr[kr.length - 1]}</span></b> : <b class="dire"><span data-n>${kd[kd.length - 1]}</span></b></small></div><svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><polyline data-p class="rad" points="${ln(kr)}"/><polyline data-p class="dire" points="${ln(kd)}"/></svg></div>`; }
      if (window.WTC_NOSP) spark = ''; // v10–v12 (дирижёр 05.11: «дублирование графика по золоту нам ни к чему»)
      if (V === 'lead') return `<div class="wtc-big ${LT ? cls(LT) : ''}">${LT ? `<img src="${esc(LT.logo)}" alt=""><span><b>${esc(LT.name)}</b><small>ведёт · ${LT.rad ? 'Radiant' : 'Dire'}</small></span><em class="num"><span data-n>+${k(diff)}</span></em>` : '<span><b>Поровну</b></span>'}</div>` + top + gl + spark;
      return top + gl + ld + spark + kills; }
    if (V === 'gold' || V === 'split' || V === 'pos') { const pk = x => parseFloat(x) * 1000 || 0, gA = A.gold ? pk(A.gold) : PA.reduce((s, p) => s + p.nw, 0), gB = B.gold ? pk(B.gold) : PB.reduce((s, p) => s + p.nw, 0), /* суммы — те же, что в нижней строке (по графику) */ lead = Math.abs(gA - gB) < 50 ? '' : gA > gB ? 'a' : 'b', diff = Math.abs(gA - gB);
      const dcl = lead ? ((lead === 'a' ? A : B).rad ? 'rad' : 'dire') : '', coin = '<img class="wtc-c" src="../w-bottom-2/gold.png" alt="">';
      const hd = `<div class="wtc-hd"><b>Золото</b><small>${t ? Math.floor(t / 60) + '′' : 'до матча'}</small></div>`;
      const trow = (T, g, side) => `<div class="wtc-gr${lead === side ? ' is-lead' : ''}"><img src="${esc(T.logo)}" alt=""><span class="wtc-tn"><b>${esc(T.name)}</b><small class="${T.rad ? 'rad' : 'dire'}">${T.rad ? 'Radiant' : 'Dire'}</small></span><span class="wtc-gv num">${coin}${k(g)}</span></div>`;
      const adv = `<div class="wtc-adv"><span>Перевес</span><b class="num ${dcl}">${lead ? '+' + k(diff) : '0.0k'}</b></div>`;
      if (V === 'gold') return hd + trow(A, gA, 'a') + trow(B, gB, 'b') + adv;
      if (V === 'split') { const pa = gA + gB ? Math.round(gA / (gA + gB) * 100) : 50;
        return hd + `<div class="wtc-sp-t"><span class="a"><img src="${esc(A.logo)}" alt=""><b>${esc(A.name)}</b></span><span class="b"><b>${esc(B.name)}</b><img src="${esc(B.logo)}" alt=""></span></div>
          <div class="wtc-sp-v num"><span>${coin}${k(gA)}</span><em class="${dcl}">${lead ? '+' + k(diff) : '0.0k'}</em><span>${k(gB)}${coin}</span></div>
          <div class="wtc-sp"><i class="${A.rad ? 'rad' : 'dire'}" style="width:${pa}%"></i><i class="${B.rad ? 'rad' : 'dire'}" style="width:${100 - pa}%"></i></div><div class="wtc-sp-p num"><span>${pa}%</span><span>${100 - pa}%</span></div>`; }
      const mx = Math.max(1, ...PA.map(p => p.nw), ...PB.map(p => p.nw));
      return hd + `<div class="wtc-sp-t"><span class="a"><img src="${esc(A.logo)}" alt=""><b>${esc(A.name)}</b></span><span class="b"><b>${esc(B.name)}</b><img src="${esc(B.logo)}" alt=""></span></div>
        <div class="wtc-sp-v num"><span>${coin}${k(gA)}</span><em class="${dcl}">${lead ? '+' + k(diff) : '0.0k'}</em><span>${k(gB)}${coin}</span></div>
        ${[0, 1, 2, 3, 4].map(i => { const a = PA[i] || {}, b = PB[i] || {}, w = (a.nw || 0) >= (b.nw || 0);
          return `<div class="wtc-ps"><span class="num${w ? ' on' : ''}">${k(a.nw || 0)}</span><span class="wtc-pb a"><i class="${A.rad ? 'rad' : 'dire'}" style="width:${(a.nw || 0) / mx * 100}%"></i></span><b>${i + 1}</b><span class="wtc-pb b"><i class="${B.rad ? 'rad' : 'dire'}" style="width:${(b.nw || 0) / mx * 100}%"></i></span><span class="num${!w ? ' on' : ''}">${k(b.nw || 0)}</span></div>`; }).join('')}
        <div class="wtc-ft">Позиции 1–5 · золото игрока</div>`; }
    if (V === 'table') return `<div class="wtc-top"><span class="wtc-tt a"><img src="${esc(A.logo)}" alt=""><b>${esc(A.name)}</b></span>${mid}<span class="wtc-tt b"><b>${esc(B.name)}</b><img src="${esc(B.logo)}" alt=""></span></div>
      <div class="wtc-gl"><span class="num"><img src="../w-bottom-2/gold.png" alt="">${esc(A.gold)}</span><span class="num">${esc(B.gold)}<img src="../w-bottom-2/gold.png" alt=""></span></div>
      <div class="wtc-th"><span>Игрок</span><span>K / D / A</span><span>Золото</span></div>${thd(A, 'a')}${PA.map(p => prow(p, metric)).join('')}${thd(B, 'b')}${PB.map(p => prow(p, metric)).join('')}`;
    return `<div class="wtc-hd"><b>Команды</b><small>${V === 'pts' ? 'K / D / A · очки' : 'K / D / A · золото'}</small></div>${thd(A, 'a')}${PA.map(p => prow(p, metric)).join('')}${mid}${thd(B, 'b')}${PB.map(p => prow(p, metric)).join('')}${V === 'pts' ? '<div class="wtc-ft">Очки — пример</div>' : ''}`; };
  const tick = () => { const col = document.querySelector('aside.gm-side'); if (!col) return; let w = col.querySelector(':scope > .wtc-w');
    if (!w) { w = document.createElement('div'); w.className = 'wtc-w'; col.prepend(w); } else if (col.firstElementChild !== w) col.prepend(w);
    // v13 (дирижёр 06.11, созвон с Антоном): водишь по графику — золото и перевес тут на момент под курсором (берутся из нижней строки);
    // помечаем: рамка и цифры основным цветом, в углу — время момента. Отпустил — снова «сейчас»
    if (window.WTC_MARK) { const at = window.WB2_AT, on = at != null; w.classList.toggle('is-at', on);
      let c = w.querySelector(':scope > .wtc-at'); if (!c) { c = document.createElement('small'); c.className = 'wtc-at num'; w.appendChild(c); }
      // v28 (дирижёр 06.11: «v12 как v27»): WTC_SOFT — без фиолетового: подложка градиентом, плашка серая; не наведено и карта идёт — «LIVE» с мигающей точкой
      const lv = !on && window.WTC_SOFT && window.WB2_LIVE; w.classList.toggle('is-live', !!lv); c.classList.toggle('is-live', !!lv);
      const tx = on ? Math.floor(at / 60) + ':' + String(Math.floor(at % 60)).padStart(2, '0') : lv ? 'LIVE' : ''; if (c.__t !== tx) { c.__t = tx; if (lv) c.innerHTML = '<i></i>LIVE'; else c.textContent = tx; } }
    const h = build(); if (w.__h === h) return; w.__h = h;
    // дирижёр 05.11: «убери мигание… показывай обновление нормально» — разметку не пересобираем: если устроена так же, меняем только числа (табло, как в нижней строке) и точки мини-графика
    const sk = x => x.replace(/(<span data-n>)[^<]*/g, '$1').replace(/(data-p[^>]*points=")[^"]*/g, '$1');
    if (w.__sk !== sk(h)) { w.__sk = sk(h); const keep = w.querySelector(':scope > .wtc-at'); w.innerHTML = h; if (keep) w.appendChild(keep); w.querySelectorAll('[data-n]').forEach(e => { e.__t = e.textContent; }); return; }
    const tp = document.createElement('div'); tp.innerHTML = h;
    const nn = tp.querySelectorAll('[data-n]'), on = w.querySelectorAll('[data-n]'); nn.forEach((n, i) => on[i] && odo(on[i], n.textContent));
    const np = tp.querySelectorAll('[data-p]'), op = w.querySelectorAll('[data-p]'); np.forEach((n, i) => op[i] && op[i].setAttribute('points', n.getAttribute('points'))); };
  // табло: крутятся только изменившиеся цифры (как в нижней строке, w-bottom-2 v27)
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const odo = (el, t) => { const prev = el.__t; if (prev === t) return; el.__t = t; if (RM || prev == null) { el.textContent = t; return; }
    const up = (parseFloat(String(t).replace(/[^\d.−-]/g, '')) || 0) >= (parseFloat(String(prev).replace(/[^\d.−-]/g, '')) || 0), a = [...t], b = [...prev];
    el.innerHTML = a.map(c => `<span class="wtc-od"><span>${c}</span></span>`).join('');
    [...el.children].forEach((x, i) => { const jj = i - (a.length - b.length); if (b[jj] !== a[i] && /\d/.test(a[i])) x.firstChild.animate([{ transform: `translateY(${up ? 100 : -100}%)` }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }); }); };
  setInterval(tick, 250); document.addEventListener('DOMContentLoaded', tick);
})();
