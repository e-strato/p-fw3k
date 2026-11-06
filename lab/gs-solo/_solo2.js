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
    map: { place: 'main', get: () => (q('.bw-page > .wl-pre') ? [q('.bw-page > .wl-pre')] : notPreview() ? [page().firstElementChild] : []) }, // v35: до матча (Драфт, Пики готовы) карта — блок w-lane .wl-pre
    about: { place: 'main', tab: '0', get: () => [q('.bw-page > .cd:has(> .top-bd.ws2)')] },
    lineups: { place: 'main', tab: '0', get: () => [q('.bw-page > .ws24-cd')] },
    stat: { place: 'main', tab: '0', get: () => [q('.bw-page > .ws-cd')] },
    drill: { place: 'side', get: side(has('.rz-host')) },
    stream: { place: 'side', get: side(has('.dc2-host')) },
    predict: { place: 'side', get: side((e) => e.querySelector(':scope > .pq-host, .pc-host')) },
    // v35 (дирижёр 06.11, финальная проверка: «только актуальные виджеты») — по странице матча v84; tab: '0' — открыть вкладку «Статистика» один раз при загрузке
    series: { place: 'main', tab: '0', get: () => [q('.bw-page > .wsg')] },
    before: { place: 'main', tab: '0', get: () => [q('.bw-page > .wmp-past')] },
    news: { place: 'side', get: side((e) => e.matches('.mn-side')) },
    mvp: { place: 'side', get: side((e) => /^MVP/.test((e.innerText || '').trim()) || !!e.querySelector('[data-wd="mvp"]') || e.matches('[data-wd="mvp"]')) },
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
  let tabbed = false; const tab = () => { if (tabbed || !it.tab) return; const b = document.querySelector(`.ws-tabs [data-a="mseg"][data-v="${it.tab}"]`); if (b && !b.classList.contains('on')) { tabbed = true; b.click(); } else if (b) tabbed = true; };
  addEventListener('load', () => { view(); tab(); setTimeout(() => { tab(); apply(); }, 400); apply(); }); addEventListener('resize', () => { view(); later(); });
})();
