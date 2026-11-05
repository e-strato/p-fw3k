/* w-top — строка над табами серии (созвон 05.11 §1, задачи 05.11 · 1).
   Над табами — тонкая строка ~32 px с дивайдером: лого игры · «Сегодня, 17:00» · турнир полностью · Bo3;
   «назад» — в начале строки, «Поделиться» — в конце. Кнопки в строке нажимают исходные (они спрятаны в табах),
   поэтому логика _ws.js не меняется. Флаги:
   WT = true — строка; WT_TABS = 'center' (строка над табами, табы по центру) | 'row' (одна строка: инфо слева, табы справа);
   WT_SHIN — «Поделиться» в строке инфо, сразу после Bo3; WT_SM — строка инфо мельче. */
(function () {
  if (!window.WT) return;
  const H = document.documentElement;
  H.classList.add('wt');
  const ROW = window.WT_TABS === 'row';
  if (ROW) H.classList.add('wt-row1');
  const SHIN = !!window.WT_SHIN;
  if (SHIN) H.classList.add('wt-shin');
  if (window.WT_SM) H.classList.add('wt-sm');
  if (window.WT_STK) H.classList.add('wt-stk');
  if (window.WT_PH5) H.classList.add('wt-ph5');
  const LOOK = window.WT_LOOK || '';   // вид всей строки: '' | 'chips' | '2l' | 'tour'
  if (LOOK) H.classList.add('wt-look--' + LOOK);
  const DLOGO = !!window.WT_DLOGO, TTAG = !!window.WT_TTAG;   // лого Dota цветное · турнир — тегом, как в новостях
  if (TTAG) H.classList.add('wt-ttag');
  if (window.WT_TB40) H.classList.add('wt-tb40');   // телефон: таббар 40 по гайдлайнам
  const SCR = !!window.WT_SCR;   // телефон: при прокрутке уходят шапка сайта и строка инфо, липнут только табы
  if (SCR) H.classList.add('wt-scr');
  if (window.WT_TOP8) H.classList.add('wt-top8');   // телефон: прилипшие табы — с отступом 8 сверху
  // v17: телефон — табы прилипают ко всей странице, а не только к блоку матча (ниже — эфир, прогнозы и т. д.)
  if (window.WT_PIN) {
    H.classList.add('wt-pin');
    const pin = () => {
      const bar = document.querySelector('.bw-bar.ws-h'), bw = bar && bar.closest('.bw');
      if (!bar || !bw) return;
      const fixed = bar.classList.contains('wt-fixed');
      const end = bw.getBoundingClientRect().bottom - parseFloat(getComputedStyle(bw).paddingBottom || 0);   // где липкая полоса упирается в низ блока
      // закрепляем ровно в момент, когда липкая полоса начала бы уезжать вверх, — без скачка
      const on = !document.body.classList.contains('is-desk') && (fixed ? end < bar.offsetHeight : bar.getBoundingClientRect().top < -0.5);
      if (on === fixed) return;
      if (on) {
        // место полосы держим отступом самого блока матча (вставку перерисовка страницы удаляет) — страница не прыгает
        const cs = getComputedStyle(bar), h = bar.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
        bw.dataset.wtPad = bw.style.paddingTop; bw.style.paddingTop = (parseFloat(getComputedStyle(bw).paddingTop) + h) + 'px';
        const r = bw.getBoundingClientRect(); bar.style.left = r.left + 'px'; bar.style.width = r.width + 'px';
        bar.style.background = getComputedStyle(bw).backgroundColor;   // фон как у блока матча — сквозь отступ ничего не видно
        bar.classList.add('wt-fixed');
      } else {
        bar.classList.remove('wt-fixed'); bar.style.left = bar.style.width = bar.style.background = '';
        bw.style.paddingTop = bw.dataset.wtPad || ''; delete bw.dataset.wtPad;
      }
    };
    window.addEventListener('scroll', pin, { passive: true }); window.addEventListener('resize', pin);
  }
  if (window.WT_FLOW) H.classList.add('wt-flow');   // телефон: табы, блок матча и виджеты — один поток, табы липнут до конца страницы
  if (window.WT_SIDEW) H.classList.add('wt-sidew');   // телефон: виджеты — на всю ширину
  if (window.WT_SH44) H.classList.add('wt-sh44--' + window.WT_SH44);   // телефон: «Поделиться» 44 px — 'hit' | 'end' | 'pill'   // телефон: без черты между инфо и табами, без «назад»   // узко — инфо и табы друг под другом
  const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  let logo = null;
  fetch('../portal-header/games/dota.svg').then(r => r.text()).then(t => { logo = t.replace(/<title>.*?<\/title>/, ''); paint(); }).catch(() => {});
  const ids = () => [...document.querySelectorAll('.ws-tabs img[src*="img/teams/"]')].map(i => (i.getAttribute('src').match(/(\d+)\.png/) || [])[1]).filter(Boolean);
  function series() {
    const S = (window.GS_DATA && GS_DATA.series) || [];
    const t = ids();
    return S.find(s => t.length && t.every(id => JSON.stringify(s.maps).includes('"' + id + '"'))) || S[S.length - 1];
  }
  function info() {
    const s = series();
    const n = document.querySelectorAll('.ws-tabs [data-a="mseg"]:not([data-v="0"])').length || 3;
    const bo = s && s.series_type === 2 ? 'Bo5' : s && s.series_type === 0 ? 'Bo1' : 'Bo' + (n || 3);
    const st = s && s.maps && s.maps[0] && s.maps[0].start_time;
    const tm = st ? new Date(st * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '17:00';
    const lg = (s && s.league) || (window.GS_TOURNAMENT && GS_TOURNAMENT.league) || '';
    return { bo, tm: 'Сегодня, ' + tm, lg };   // день — «Сегодня» (как у начальника); в данных матч в прошлом
  }
  function paint() {
    const bar = document.querySelector('.bw-bar.ws-h');
    if (!bar) return;
    const inBar = ROW && !(SCR && !document.body.classList.contains('is-desk'));   // v15: на телефоне строка — над табами, вне липкой полосы
    let el = document.querySelector('.wt-row');
    if (el && (el.parentNode === bar) !== inBar) { inBar ? bar.insertBefore(el, bar.firstChild) : bar.parentNode.insertBefore(el, bar); }
    if (!el) {
      el = document.createElement('div'); el.className = 'wt-row';
      inBar ? bar.insertBefore(el, bar.firstChild) : bar.parentNode.insertBefore(el, bar);
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-wt]'); if (!b) return;
        const o = b.dataset.wt === 'back' ? document.querySelector('.bw-bar .ws-b') : document.querySelector('.bw-bar .ws-ib[data-src="share"]');
        o && o.click();
      });
    }
    const i = info();
    if (TTAG) i.lg = `<img src="img/items/aegis.png" alt="">${i.lg}`;   // как .np3-e в новостях: значок турнира + название на подложке
    const back = document.querySelector('.bw-bar .ws-b'), share = document.querySelector('.bw-bar .ws-ib[data-src="share"]');
    const html = (back ? `<button class="wt-b" data-wt="back" title="К расписанию" aria-label="Назад к расписанию">${back.innerHTML}</button>` : '')
      + (DLOGO ? `<span class="wt-g wt-g--c" title="Dota 2"><img src="../widget-tournament-4/logos/dota2.png" alt=""></span>` : `<span class="wt-g" title="Dota 2">${logo || ''}</span>`)
      + (LOOK === '2l'
        ? `<span class="wt-tx"><span class="wt-i wt-lg">${i.lg}</span><span class="wt-sub"><span class="wt-i num">${i.tm}</span><i class="wt-s"></i><span class="wt-i">${i.bo}</span></span></span>`
        : LOOK === 'tour'
        ? `<span class="wt-i wt-lg">${i.lg}</span><span class="wt-i wt-bo">${i.bo}</span><span class="wt-i wt-tm num">${CLOCK}${i.tm}</span>`
        : `<span class="wt-i num">${i.tm}</span><i class="wt-s"></i><span class="wt-i wt-lg">${i.lg}</span><i class="wt-s"></i><span class="wt-i">${i.bo}</span>`)
      + (share && (!ROW || SHIN) ? `<button class="wt-b wt-sh" data-wt="share" title="Поделиться" aria-label="Поделиться">${share.innerHTML}<span class="wt-shl">Поделиться</span></button>` : '');
    if (el.__h !== html) { el.innerHTML = html; el.__h = html; }
  }
  const mo = new MutationObserver(() => { mo.disconnect(); paint(); start(); });
  const start = () => mo.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => { paint(); start(); });
  window.addEventListener('load', paint);
  window.addEventListener('resize', paint);
})();
