// Лаба w-subhead (дирижёр 29.10: «кнопку назад из заголовка турнира — в подзаголовок хедера: вторая строка с турниром, назад, может, хлебные крошки»).
// Вторая строка в шапке портала (#portal). Данные берёт из окна матча, который сейчас на экране (.bj-t: «турнир · стадия, день · Bo3» и команды).
// window.SBH: back — назад и турнир · crumbs — путь «Матчи › турнир › стадия › матч» · tour — турнир и его разделы справа.
// «Назад» и строка турнира в окне матча прячутся (CSS, body.sbh-on) — там остаются матч, счёт и «Поделиться».
(() => {
  const K = window.SBH || 'back';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const CUP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>';
  const bk = '<button class="sbh-bk" data-a="back" aria-label="Назад к расписанию">' + BACK + '</button>';
  const go = (t, v) => `<a href="#" data-a="toast" data-v="${esc(v)}">${t}</a>`;

  // матч на экране — последнее окно, чей верх уже выше середины шапки
  const cur = () => { const all = [...document.querySelectorAll('#feed .bj-t')]; let el = all[0];
    for (const x of all) if (x.getBoundingClientRect().top < 160) el = x; return el; };
  const data = el => { if (!el) return null;
    const [league = '', stage = '', bo = ''] = (el.querySelector('small') || {}).textContent.split(' · ');
    const tm = [...el.querySelectorAll('.h2-tm > span')].map(s => s.textContent);
    return { league, stage, bo, match: tm.join(' — ') }; };

  const html = d => {
    // w-header-3 v10 (дирижёр 02.11: «из хлебной крошки брать день турнира, а не дублировать заголовок»): SBH_DAY — последний шаг — день стадии, матча нет
    if (K === 'crumbs' && window.SBH_DAY) { const [stg, dy = ''] = d.stage.split(', ');
      return `${bk}<nav class="sbh-cr" aria-label="Путь"><a href="#" data-a="back">Матчи</a><i>›</i>${go(esc(d.league), 'Страница турнира (демо)')}<i>›</i>${dy ? `${go(esc(stg), 'Стадия турнира (демо)')}<i>›</i><b>${esc(dy[0].toUpperCase() + dy.slice(1))}</b>` : `<b>${esc(stg)}</b>`}</nav>`; }
    if (K === 'crumbs') return `${bk}<nav class="sbh-cr" aria-label="Путь"><a href="#" data-a="back">Матчи</a><i>›</i>${go(esc(d.league), 'Страница турнира (демо)')}<i>›</i>${go(esc(d.stage), 'Стадия турнира (демо)')}<i>›</i><b>${esc(d.match)}</b></nav>`;
    if (K === 'tour') return `${bk}${go(`<span class="sbh-cup">${CUP}</span><b>${esc(d.league)}</b>`, 'Страница турнира (демо)').replace('<a ', '<a class="sbh-tt" ')}<span class="sbh-st">${esc(d.stage)} · ${esc(d.bo)}</span>
      <nav class="sbh-tn" aria-label="Турнир">${['Обзор', 'Матчи', 'Сетка', 'Участники', 'Новости'].map(n => n === 'Матчи' ? `<a href="#" aria-current="page" data-a="back">${n}</a>` : go(n, `${n} турнира (демо)`)).join('')}</nav>`;
    return `${bk}<b class="sbh-t">${esc(d.league)}</b><span class="sbh-st">${esc(d.stage)} · ${esc(d.bo)}</span>`;
  };

  let last = '';
  const draw = () => { const pt = document.getElementById('portal'), d = data(cur()); if (!pt || !d) return;
    let row = pt.querySelector('.sbh'); const h = html(d);
    if (row && h === last) return;
    if (!row) { row = document.createElement('div'); row.className = `sbh sbh--${K}`; pt.append(row); }
    row.innerHTML = h; last = h; };

  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('sbh-on', 'sbh-k-' + K);
    if (window.SBH_LINE === false) document.body.classList.add('sbh-noline'); // gs-match-2 v40: без линии под шапкой
    if (window.SBH_GAP) document.body.classList.add('sbh-gap'); // gs-match-2 v41: отступ 4 под шапкой — верх окна матча не обрезается
    const pt = document.getElementById('portal');
    // шапку портала хозяин перерисовывает (вход и т. п.) — возвращаем строку
    new MutationObserver(() => { if (!pt.querySelector('.sbh')) { last = ''; draw(); } }).observe(pt, { childList: true });
    new MutationObserver(() => draw()).observe(document.getElementById('feed'), { childList: true, subtree: true });
    addEventListener('scroll', draw, { passive: true });
    draw();
  });
})();
