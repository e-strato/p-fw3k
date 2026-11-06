// Финальная проверка 06.11 (дирижёр: «на телефоне hover-эффект отключить, когда переключается на телефон, — на трёх страницах»).
// В песочнице вид «Телефон» — узкое окно в браузере с мышью, :hover срабатывает. Здесь каждое правило с :hover во всех стилях страницы
// переписывается так, что работает только на компьютере (body.is-desk): «X:hover» → «X:is(body.is-desk *):hover». Подключается последним скриптом страницы.
(() => {
  const fix = (rules) => { for (const r of rules) { try {
    if (r.selectorText && r.selectorText.includes(':hover') && !r.selectorText.includes('body.is-desk *)')) r.selectorText = r.selectorText.replace(/:hover/g, ':is(body.is-desk *):hover');
    if (r.cssRules) fix(r.cssRules); } catch (e) { /* чужой домен — пропускаем */ } } };
  const run = () => { for (const s of document.styleSheets) { try { fix(s.cssRules); } catch (e) {} } };
  run(); addEventListener('load', run);
  // стили, что дописываются позже (виджеты вставляют <style>/<link>) — тоже
  new MutationObserver((m) => { if (m.some((x) => [...x.addedNodes].some((n) => n.nodeName === 'STYLE' || n.nodeName === 'LINK'))) setTimeout(run, 50); }).observe(document.documentElement, { childList: true, subtree: true });
})();
