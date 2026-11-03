// w-header — шапка матча, слитая с вкладками серии (задачи-по-виджетам.md §4, созвон 26.10 [1 · 02:40–07:16], [2 · 14:45–15:16]).
// Одна маленькая строка, по которой узнаёшь матч (турнир · логотипы и теги · счёт серии) + колокольчик; пилюль времени карт нет; «Завершён» не пишем —
// что серия кончилась, видно по вкладкам (ни одной live). Вкладки: «Превью» + карты серии; у карты — прошла (логотип победителя) / идёт (точка + время) / впереди.
// Данные — реальные (gs-match/data): TI 2026, Vision — Spirit, Bo3, «сейчас» карта 3, 33:30. Bo5 — пример: карты 4–5 дописаны (в данных Bo3).
(() => {
  const D = window.GS_DATA, S = D.series[2], NOW = S.maps[2].start_time + 2010;
  const IMG = '../gs-match/';
  const A = S.maps[0].radiant_team_id, B = S.maps[0].dire_team_id; // Vision, Spirit
  const team = id => D.teams[id];
  const SHORT = { 9572001: 'Vision', 7119388: 'Spirit' };
  const CFG = { view: 'desk', state: 'live', bo: 3, tab: null, bell: false };
  // v2–v4 (дирижёр 26.10: «ещё версии») — тот же смысл, другая форма: WH_V в странице варианта
  const V = window.WH_V || 'v1';
  const $ = s => document.querySelector(s);
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const hhmm = s => new Date(s * 1000).toLocaleTimeString('ru', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';

  // карты серии в выбранном состоянии: done (win — id победителя) / live (t) / next / skip (не понадобилась)
  function maps() {
    const real = S.maps.map(m => ({ win: m.radiant_win ? m.radiant_team_id : m.dire_team_id }));
    const out = [];
    for (let i = 0; i < CFG.bo; i++) {
      if (CFG.state === 'pre') out.push({ st: 'next' });
      else if (CFG.state === 'live') out.push(i < 2 ? { st: 'done', ...real[i] } : i === 2 ? { st: 'live', t: NOW - S.maps[2].start_time } : { st: 'next' });
      else if (i < 3) out.push({ st: 'done', ...real[i] });
      else if (i === 3) out.push({ st: 'done', win: A }); // пример: Bo5, 4-я карта — Vision, 3:1
      else out.push({ st: 'skip' });
    }
    return out;
  }

  // килы карты i за A и B: сыгранная — итог, идущая — на момент t; пример-карты (4–5) — без килов
  function kills(i, m) {
    const x = S.maps[i]; if (!x || m.st === 'next' || m.st === 'skip') return null;
    const t = m.st === 'live' ? m.t : x.duration, rad = x.players.filter(p => p.isRadiant).reduce((n, p) => n + p.kills_log.filter(l => l.time <= t).length, 0),
      dire = x.players.filter(p => !p.isRadiant).reduce((n, p) => n + p.kills_log.filter(l => l.time <= t).length, 0);
    return x.radiant_team_id === A ? [rad, dire] : [dire, rad];
  }

  function render() {
    const ms = maps(), wA = ms.filter(m => m.win === A).length, wB = ms.filter(m => m.win === B).length;
    const over = CFG.state === 'post', live = ms.findIndex(m => m.st === 'live');
    if (CFG.tab == null || CFG.tab > CFG.bo) CFG.tab = CFG.state === 'pre' ? 0 : live >= 0 ? live + 1 : ms.filter(m => m.st === 'done').length;
    const side = id => `<img src="${IMG + team(id).logo}" alt=""><span class="t${over && ((id === A && wA > wB) || (id === B && wB > wA)) ? ' win' : ''}">${SHORT[id]}</span>`;
    const score = CFG.state === 'pre' ? `<span class="mh-sc num"><small>${hhmm(S.maps[0].start_time)}</small></span>` : `<span class="mh-sc num">${wA}:${wB}</span>`;
    const tab = (i, label, extra = '', cls = '') => `<button class="tab${CFG.tab === i ? ' on' : ''}${cls}" data-t="${i}">${label}${extra}</button>`;
    const tabs = `<nav class="tabs">${tab(0, 'Превью')}${ms.map((m, i) => tab(i + 1, `Карта ${i + 1}`,
      m.st === 'done' ? `<img src="${IMG + team(m.win).logo}" alt="" title="Победа ${SHORT[m.win]}">` : m.st === 'live' ? `<span class="live num">${mmss(m.t)}</span>` : m.st === 'skip' ? '' : '',
      m.st === 'skip' ? ' skip' : '')).join('')}</nav>`;
    const bell = `<button class="bell${CFG.bell ? ' on' : ''}" id="bell" title="Напомнить о матче">${BELL}</button>`;
    const DESK = CFG.view === 'desk';
    let head;
    if (V === 'v2') {
      // v2 «Табло»: команды и счёт по центру, под ними — карты карточками: кто взял и килы, у идущей — время
      const card = (m, i) => { const kk = kills(i, m), on = CFG.tab === i + 1 ? ' on' : '';
        const sub = m.st === 'done' ? `<span><img src="${IMG + team(m.win).logo}" alt="">${SHORT[m.win]}${kk ? ` · <b class="num">${kk[0]}:${kk[1]}</b>` : ''}</span>`
          : m.st === 'live' ? `<span class="live num">${mmss(m.t)}${kk ? ` · ${kk[0]}:${kk[1]}` : ''}</span>` : m.st === 'skip' ? '<span>не понадобилась</span>' : '<span>впереди</span>';
        return `<button class="c2${on}${m.st === 'skip' ? ' skip' : ''}" data-t="${i + 1}"><b>Карта ${i + 1}</b>${sub}</button>`; };
      head = `<div class="h2-top"><span class="mh-lg">TI 2026 · плей-офф</span><div class="h2-vs">${side(A)}${score}${side(B)}</div>${bell}</div>
        <nav class="h2-maps"><button class="c2${CFG.tab === 0 ? ' on' : ''}" data-t="0"><b>Превью</b><span>до серии</span></button>${ms.map(card).join('')}</nav>`;
    } else if (V === 'v3') {
      // v3 «Счёт — это вкладки»: между командами вместо одного счёта — карты, у каждой килы; выигравшая сторона карты — ярче. Счёт серии — точками у команды
      const dots = id => `<span class="h3-dots">${ms.map(m => `<i class="${m.win === id ? 'on' : ''}"></i>`).join('')}</span>`;
      const cell = (m, i) => { const kk = kills(i, m), on = CFG.tab === i + 1 ? ' on' : '';
        const v = kk ? `<span class="num"><b class="${m.st === 'done' && m.win === A ? 'w' : ''}">${kk[0]}</b>:<b class="${m.st === 'done' && m.win === B ? 'w' : ''}">${kk[1]}</b></span>` : '<span class="num">—</span>';
        return `<button class="c3${on}${m.st === 'live' ? ' is-live' : ''}${m.st === 'skip' ? ' skip' : ''}" data-t="${i + 1}"><small>${m.st === 'live' ? `<i class="dot"></i>${mmss(m.t)}` : `К${i + 1}`}</small>${v}</button>`; };
      head = `<div class="h3"><div class="h3-t">${side(A)}${dots(A)}</div><nav class="h3-maps"><button class="c3${CFG.tab === 0 ? ' on' : ''}" data-t="0"><small>&nbsp;</small><span>Превью</span></button>${ms.map(cell).join('')}</nav>
        <div class="h3-t h3-t--b">${dots(B)}${side(B)}</div>${DESK ? `<span class="mh-sp"></span><span class="mh-lg">TI 2026</span>` : ''}${bell}</div>`;
    } else if (V === 'v4') {
      // v4 «Полоска серии»: строка матча как v1, под ней — полоса карт во всю ширину: сыгранная — цветом победителя, идущая — заполняется по времени
      const seg = (m, i) => { const kk = kills(i, m), on = CFG.tab === i + 1 ? ' on' : '', fill = m.st === 'live' ? Math.min(100, m.t / 2700 * 100) : 0;
        const c = m.st === 'done' ? (m.win === A ? 'a' : 'b') : '';
        return `<button class="s4 ${c}${on}${m.st === 'skip' ? ' skip' : ''}" data-t="${i + 1}"><i class="bar"><i style="width:${m.st === 'done' ? 100 : fill}%"></i></i>
          <span>Карта ${i + 1}${m.st === 'done' ? ` · ${SHORT[m.win]}` : m.st === 'live' ? ` · <em class="num">${mmss(m.t)}</em>` : ''}${kk ? ` <small class="num">${kk[0]}:${kk[1]}</small>` : ''}</span></button>`; };
      head = `<div class="mh-row">${DESK ? `<span class="mh-lg">TI 2026</span>` : ''}<div class="mh-vs">${side(A)}${score}${side(B)}</div><span class="mh-sp"></span>${bell}</div>
        <nav class="h4">${`<button class="s4 pv${CFG.tab === 0 ? ' on' : ''}" data-t="0"><i class="bar"><i style="width:${CFG.state === 'pre' ? 0 : 100}%"></i></i><span>Превью</span></button>`}${ms.map(seg).join('')}</nav>`;
    }
    const row = `<div class="mh-row">${DESK ? `<span class="mh-lg">TI 2026</span>` : ''}<div class="mh-vs">${side(A)}${score}${side(B)}</div>${DESK ? tabs : ''}<span class="mh-sp"></span>${bell}</div>`;
    const m = ms[CFG.tab - 1];
    const body = CFG.tab === 0 ? 'Превью серии — лаба «Виджет · Превью серии»'
      : m.st === 'skip' ? `Карта ${CFG.tab} не понадобилась — серия закончилась`
      : m.st === 'next' ? `Карта ${CFG.tab} впереди — здесь будет драфт, когда начнётся`
      : `Карта ${CFG.tab} — виджеты главной колонки: драфт, перевес по золоту, игроки`;
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><header class="mh mh--${V}">${head || row + (DESK ? '' : tabs)}</header><div class="body">${body}</div></div>`;
    document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { CFG.tab = +b.dataset.t; render(); });
    $('#bell').onclick = () => { CFG.bell = !CFG.bell; render(); };
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'pre', label: 'До матча' }, { v: 'live', label: 'Идёт' }, { v: 'post', label: 'После' }] },
      { key: 'bo', name: 'Серия', value: 'bo' + CFG.bo, options: [{ v: 'bo3', label: 'Bo3' }, { v: 'bo5', label: 'Bo5 (пример)' }] },
    ],
    set(key, v) { if (key === 'bo') CFG.bo = +v.slice(2); else CFG[key] = v; if (key !== 'view') CFG.tab = null; render(); },
    caption: () => 'Vision — Spirit, TI 2026 (реальные данные). Bo5 — пример: карты 4–5 дописаны',
  };
  render();
})();
