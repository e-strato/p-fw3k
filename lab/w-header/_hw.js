// w-header v5 — обвязка лабы: панель песочницы (вид, состояние, шапка) и страница-заглушка со скроллом. Сам виджет — _wheader.js (WHEADER), его же рисует страница матча (gs-match v22).
// Данные — реальные: TI 2026, Vision — Spirit, «сейчас» карта 3, 33:30.
(() => {
  const D = window.GS_DATA, S = D.series[2], A = S.maps[0].radiant_team_id, B = S.maps[0].dire_team_id;
  const CFG = { view: 'desk', state: 'live', hd: 'auto', bell: false, tab: 'Обзор' };
  const TABS = ['Обзор', 'Карты', 'События', 'Новости', 'Статистика'];
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const hhmm = s => new Date(s * 1000).toLocaleTimeString('ru', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const win = m => (m.radiant_win ? m.radiant_team_id : m.dire_team_id);
  function data() {
    const ms = CFG.state === 'live' ? S.maps.slice(0, 2) : S.maps, sa = ms.filter(m => win(m) === A).length, sb = ms.filter(m => win(m) === B).length, pre = CFG.state === 'pre';
    const tm = (id, name, short) => ({ name, short, logo: D.teams[id].logo });
    return { a: tm(A, 'Team Vision', 'Vision'), b: tm(B, 'Team Spirit', 'Spirit'), meta: 'TI 2026 · Bo3', base: '../gs-match/',
      sa: pre ? null : sa, sb: pre ? null : sb, win: CFG.state === 'post' ? (sa > sb ? 'a' : 'b') : null,
      st: pre ? `Сегодня, ${hhmm(S.maps[0].start_time)}` : CFG.state === 'live' ? `Карта 3 · ${mmss(2010)}` : '', live: CFG.state === 'live', stShort: mmss(2010),
      bell: CFG.bell, tabs: TABS.map(t => ({ t, on: t === CFG.tab, a: 'mtab', v: t, n: t === 'Карты' && !pre ? ms.length + (CFG.state === 'live' ? 1 : 0) : 0 })),
      force: CFG.hd === 'auto' ? null : CFG.hd };
  }
  function render() {
    const y = document.querySelector('.scroll')?.scrollTop || 0;
    document.body.innerHTML = `<div class="stage is-${CFG.view}"><div class="scroll"><div data-wh-sec><div class="hd" id="hd"></div>
      <div class="body">${CFG.tab} — ниже виджеты: график, драфт, игроки, карты серии…<br><small>Листай вниз — шапка сожмётся</small></div>${'<div class="ph"></div>'.repeat(8)}</div></div></div>`;
    document.querySelector('.scroll').scrollTop = y;
    WHEADER.render(document.querySelector('#hd'), data());
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b) return; e.preventDefault();
    if (b.dataset.a === 'mtab') CFG.tab = b.dataset.v; if (b.dataset.a === 'bell') CFG.bell = !CFG.bell; render(); });
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'pre', label: 'До матча' }, { v: 'live', label: 'Идёт' }, { v: 'post', label: 'После' }] },
      { key: 'hd', name: 'Шапка', value: CFG.hd, options: [{ v: 'auto', label: 'Как при скролле' }, { v: 'full', label: 'Вверху' }, { v: 'mini', label: 'Прокручено' }] },
    ],
    set(key, v) { CFG[key] = v; render(); },
    caption: () => 'Vision — Spirit, TI 2026 (реальные данные). Листай страницу — шапка сжимается в одну строку. Этот же код — на странице матча v22',
  };
  render();
})();
