// w-header v5–v7 — шапка матча без лишнего (дирижёр 26.10: «счёт и название очень важны; два состояния — вверху и при скролле; не выёбываемся;
// карты ниже будут, их не надо сюда впихивать»). Начальник [1 · 02:40–04:25]: маленькая строка, по которой узнаёшь матч, + навигация
// «Обзор / Карты / События / Новости / Статистика» в эту строку; колокольчик — на месте; пилюль времени карт нет; «Завершён» + счёт не дублировать.
// В шапке: турнир и стадия, формат серии (Bo3), команды с названиями, счёт серии, что сейчас (до — время начала, идёт — точка, карта и время), колокольчик, вкладки.
// Вверху — развёрнутая; прокрутил — сжимается в одну строку и прилипает. Данные — реальные: TI 2026, Vision — Spirit, «сейчас» карта 3, 33:30.
(() => {
  const D = window.GS_DATA, S = D.series[2], IMG = '../gs-match/';
  const A = S.maps[0].radiant_team_id, B = S.maps[0].dire_team_id; // Vision, Spirit
  const NAME = { [A]: 'Team Vision', [B]: 'Team Spirit' }, SHORT = { [A]: 'Vision', [B]: 'Spirit' };
  const V = window.WH_V || 'v5';
  const CFG = { view: 'desk', state: 'live', hd: 'auto', bell: false, tab: 'Обзор' };
  const TABS = ['Обзор', 'Карты', 'События', 'Новости', 'Статистика'];
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const hhmm = s => new Date(s * 1000).toLocaleTimeString('ru', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
  const logo = (id, cls = '') => `<img class="lg ${cls}" src="${IMG + D.teams[id].logo}" alt="">`;

  // счёт серии и что сейчас: до — время начала; идёт — 1:1 и «карта 3 · 33:30»; после — 2:1 (реальный итог), победитель ярче
  function now() {
    if (CFG.state === 'pre') return { a: null, b: null, st: `Начало в ${hhmm(S.maps[0].start_time)}`, live: false };
    const ms = CFG.state === 'live' ? S.maps.slice(0, 2) : S.maps, win = m => (m.radiant_win ? m.radiant_team_id : m.dire_team_id);
    const a = ms.filter(m => win(m) === A).length, b = ms.filter(m => win(m) === B).length;
    return CFG.state === 'live' ? { a, b, st: `Карта 3 · ${mmss(2010)}`, live: true } : { a, b, st: '', live: false, win: a > b ? A : B };
  }

  function render() {
    const n = now(), DESK = CFG.view === 'desk';
    const meta = `TI 2026 · плей-офф · Bo3`;
    const sc = n.a == null ? '<span class="sc sc--pre">—</span>' : `<span class="sc num"><b class="${n.win === A ? 'w' : ''}">${n.a}</b><i>:</i><b class="${n.win === B ? 'w' : ''}">${n.b}</b></span>`;
    const st = n.st ? `<span class="st${n.live ? ' st--live' : ''}">${n.st}</span>` : '';
    const nm = (id, full) => `<span class="nm${n.win === id ? ' w' : ''}">${full ? NAME[id] : SHORT[id]}</span>`;
    const bell = `<button class="bell${CFG.bell ? ' on' : ''}" data-bell title="Напомнить о матче">${BELL}</button>`;
    const tabs = `<nav class="tabs">${TABS.map(t => `<button class="tab${t === CFG.tab ? ' on' : ''}" data-tab="${t}">${t}</button>`).join('')}</nav>`;
    // развёрнутая
    let full;
    if (V === 'v5') // команды по краям, счёт и что сейчас — по центру
      full = `<div class="f5"><div class="meta">${meta}${bell}</div>
        <div class="f5-row"><div class="f5-t">${logo(A, 'lg--l')}${nm(A, DESK)}</div><div class="f5-c">${sc}${st}</div><div class="f5-t f5-t--b">${nm(B, DESK)}${logo(B, 'lg--l')}</div></div></div>`;
    else if (V === 'v6') // табло слева: команда и её счёт строками, справа — что сейчас
      full = `<div class="f6"><div class="f6-l"><div class="meta">${meta}</div>
          <div class="f6-r">${logo(A)}${nm(A, true)}<b class="num${n.win === A ? ' w' : ''}">${n.a ?? ''}</b></div>
          <div class="f6-r">${logo(B)}${nm(B, true)}<b class="num${n.win === B ? ' w' : ''}">${n.b ?? ''}</b></div></div>
        <div class="f6-s">${st}${bell}</div></div>`;
    else // v7: одна строка, крупно — уже почти сжатая, разница только в размере
      full = `<div class="f7"><div class="meta">${meta}</div><div class="f7-row">${logo(A, 'lg--l')}${nm(A, false)}${sc}${nm(B, false)}${logo(B, 'lg--l')}${st}<span class="sp"></span>${bell}</div></div>`;
    // сжатая (при скролле): одна строка — логотипы, короткие названия, счёт, что сейчас; на компьютере вкладки в той же строке
    const mini = `<div class="mini">${logo(A)}${nm(A, false)}${sc}${nm(B, false)}${logo(B)}${n.live ? `<span class="st st--live">${mmss(2010)}</span>` : ''}${DESK ? tabs : ''}<span class="sp"></span>${bell}</div>`;
    const stage = document.querySelector('.stage');
    const y = stage ? stage.querySelector('.scroll').scrollTop : 0;
    document.body.innerHTML = `<div class="stage is-${CFG.view} ${V}"><div class="scroll">
      <header class="mh"><div class="mh-full">${full}${tabs}</div><div class="mh-mini">${mini}${DESK ? '' : tabs}</div></header>
      <div class="body">${CFG.tab} — ниже виджеты: график, драфт, игроки, карты серии…<br><small>Листай вниз — шапка сожмётся</small></div>${'<div class="ph"></div>'.repeat(8)}</div></div>`;
    const sc0 = document.querySelector('.scroll'); sc0.scrollTop = y;
    const upd = () => document.querySelector('.mh').classList.toggle('is-mini', CFG.hd === 'mini' || (CFG.hd === 'auto' && sc0.scrollTop > 60));
    sc0.onscroll = upd; upd();
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { CFG.tab = b.dataset.tab; render(); });
    document.querySelectorAll('[data-bell]').forEach(b => b.onclick = () => { CFG.bell = !CFG.bell; render(); });
  }

  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'state', name: 'Состояние', value: CFG.state, options: [{ v: 'pre', label: 'До матча' }, { v: 'live', label: 'Идёт' }, { v: 'post', label: 'После' }] },
      { key: 'hd', name: 'Шапка', value: CFG.hd, options: [{ v: 'auto', label: 'Как при скролле' }, { v: 'full', label: 'Вверху' }, { v: 'mini', label: 'Прокручено' }] },
    ],
    set(key, v) { CFG[key] = v; render(); },
    caption: () => 'Vision — Spirit, TI 2026 (реальные данные). Листай страницу — шапка сжимается в одну строку',
  };
  render();
})();
