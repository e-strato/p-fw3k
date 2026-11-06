// w-lane-2 — состояния карты (созвон 05.11 §7.4); ставится ДО _gs.js (после _wfit.js)
// 06.11 (дирижёр, 6 шагов хода матча): pre0 «До матча» — матч не начался, драфта ещё нет (как draft, но без хода драфта) · draft «Драфт» — драфт идёт, пиков нет · pre «Пики готовы» — драфт прошёл, до начала: пики известны, 0:0, прогноз до 12′ · live12 «Первые 12′» — идёт, 8′: прогноз + реальный · live — идёт, 33′: обычный график
// лаба: ?st= (по умолчанию pre) · страница матча (WLS_PROD): ?state= из панели песочницы — draft и live12 _gs.js не знает: подменяем на pre / live до того, как он прочтёт ссылку
(() => { const q = new URLSearchParams(location.search);
  if (window.WLS_PROD) { const s = q.get('state'); window.WLS_ST = s === 'pre0' ? 'pre0' : s === 'draft' ? 'draft' : s === 'live12' ? 'live12' : s === 'pre' ? 'pre' : s === 'live' ? 'live' : '';
    if (s === 'pre0' || s === 'draft' || s === 'live12') { q.set('state', s === 'live12' ? 'live' : 'pre'); history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash); }
    if (s === 'live12') window.GS_NOW -= 1500; return; }
  const st = q.get('st') || window.WLS_DEF || 'pre'; window.WLS_ST = st;
  window.GS_STATE = st === 'pre0' || st === 'draft' || st === 'pre' ? 'pre' : 'live'; if (st === 'live12') window.GS_NOW -= 1500; })();
