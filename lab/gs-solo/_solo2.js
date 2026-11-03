// gs-solo v34 — раздел «Виджеты» песочницы по нынешней странице матча (v53; дирижёр 03.11: в «Виджетах» висела старая страница —
// плавающая панель, шапка во всю ширину, виджеты, которых на странице уже нет).
// Не копия, как в v33 (_solo.js): страница v53 строится как есть, ?w=<id> оставляет на экране один виджет — на своём месте и живым
// (нажатия, вкладки, «Разбор» работают). Остальное прячется: соседи по колонкам — невидимы (место держат), прочее — убрано.
// ?cols=0 — без подписей колонок. Виджета нет в этом состоянии — надпись.
(() => {
  const Q = new URLSearchParams(location.search), W = Q.get('w'); if (!W) return;
  const sec = () => document.querySelector('#feed section.gm');
  const q = (s) => sec()?.querySelector(s);
  const side = (f) => () => [...(sec()?.querySelectorAll('.gm-side > .gm-wd') || [])].filter(f);
  const has = (s) => (e) => e.querySelector(':scope > ' + s);
  const page = () => q('.bw-page');
  // карточка карты — когда открыта вкладка карты (во «Превью» есть «Составы»)
  const notPreview = () => page() && !page().querySelector(':scope > .ws24-cd');
  // id → что оставить на экране; место: all — во всю ширину, main — главная колонка, side — правая
  const LIST = {
    'site-header': { place: 'all', get: () => [document.querySelector('#portal')] },
    header: { place: 'main', get: () => [q('.bw-bar'), q('.h3-tabrow')] },
    map: { place: 'main', get: () => (notPreview() ? [page().firstElementChild] : []) },
    about: { place: 'main', get: () => [q('.bw-page > .cd:has(> .top-bd.ws2)')] },
    lineups: { place: 'main', get: () => [q('.bw-page > .ws24-cd')] },
    stat: { place: 'main', get: () => [q('.bw-page > .ws-cd')] },
    drill: { place: 'side', get: side(has('.rz-host')) },
    stream: { place: 'side', get: side(has('.dc2-host')) },
    predict: { place: 'side', get: side(has('.pq-host')) },
    mvp: { place: 'side', get: side((e) => /^MVP/.test((e.innerText || '').trim())) },
  };
  const it = LIST[W]; if (!it) return;
  document.documentElement.classList.add('so2'); if (Q.get('cols') === '0') document.documentElement.classList.add('so2-nocol');
  const NAMES = { all: 'во всю ширину', main: 'главная колонка', side: 'правая колонка' };
  let busy = false;
  function apply() {
    busy = true;
    document.querySelectorAll('.so-k, .so-t, .so-v').forEach((e) => e.classList.remove('so-k', 'so-t', 'so-v'));
    const els = (it.get() || []).filter(Boolean), one = innerWidth < 800; // одна колонка: вторая убирается, виджет — сверху
    document.documentElement.classList.toggle('so2-none', !els.length);
    els.forEach((e) => { e.classList.add('so-t'); for (let x = e.parentElement; x && x !== document.documentElement; x = x.parentElement) x.classList.add('so-k'); });
    // две колонки: соседняя — невидимой, но с местом; у обеих рамка-подпись
    const cols = it.place === 'all' ? [] : [q('.gm-main'), q('.gm-side')].filter(Boolean);
    cols.forEach((c) => { if (!c.classList.contains('so-k') && !one) c.classList.add('so-v'); c.dataset.so = `${one ? 'одна колонка' : NAMES[c.matches('.gm-side') ? 'side' : 'main']} · ${Math.round(c.getBoundingClientRect().width)} px`; });
    const pt = document.querySelector('#portal'); if (pt) pt.dataset.so = `${NAMES.all} · ${Math.round(pt.getBoundingClientRect().width)} px`;
    queueMicrotask(() => { busy = false; });
  }
  let t = 0;
  const later = () => { if (!busy && !t) t = setTimeout(() => { t = 0; apply(); }, 30); };
  addEventListener('DOMContentLoaded', () => { apply(); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); });
  // вид страницы — по ширине окна, как в v33: уже 800 — телефон (сама страница по ширине его не включает)
  const view = () => { const L = window.LAB, v = innerWidth < 800 ? 'phone' : 'desk', a = L?.axes?.().find((x) => x.key === 'view'); if (a && a.value !== v) L.set('view', v); };
  addEventListener('load', () => { view(); apply(); }); addEventListener('resize', () => { view(); later(); });
})();
