/* w-tabs-s — табы серии (созвон 05.11 §4, задачи 05.11 · 4). Только классы на <html>, всё остальное — в _wts.css:
   WTS_LIVE — точка и время live-карты фиолетовым (основной цвет), а не красным;
   WTS_DOT — у «Новостей» вместо числа «88» — точка;
   WTS_MIN — время live минутой «33′»; WTS_FIT — «Стат.» вместо «Статистики», только если табы не влезают; WTS_BLINK — точка live мигает; WTS_MONO — время live моноширинным, чуть мельче;
   WTS_PH = 'num' — на телефоне карты цифрами «1 · 2 · 3», без «Map»; 'short' — ещё «Лента» и «Стат.». */
(function () {
  const H = document.documentElement;
  if (window.WTS_LIVE) H.classList.add('wts-live');
  if (window.WTS_DOT) H.classList.add('wts-dot');
  if (window.WTS_EQ) H.classList.add('wts-eq');   // телефон: табы равной ширины, «Нов.» и «Стат.»
  if (window.WTS_EQFIT) H.classList.add('wts-eqfit');   // телефон: табы равные, «Нов.» и «Стат.» — только если подпись не влезает
  if (window.WTS_TIGHT) H.classList.add('wts-t--' + window.WTS_TIGHT);   // не влезает: 'en' — News / Stat; 'ic' — остаются только иконки
  if (window.WTS_MAPIC) H.classList.add('wts-mapic');   // карты с иконкой: влезает — «Map 1», нет — иконка и номер
  if (window.WTS_V11) H.classList.add('wts-v11', 'wts-mapnum');   // v11: карты без иконки, «Map 1» / номер; иконки мельче, лого крупнее, черта
  if (window.WTS_BLINK) H.classList.add('wts-blink');   // точка live мигает
  if (window.WTS_MONO) H.classList.add('wts-mono');     // время live — моноширинным, чуть мельче
  if (window.WTS_PH) H.classList.add('wts-ph', 'wts-ph--' + window.WTS_PH);
  // v4: «Статистика» → «Стат.» только когда на узком экране табы не влезают
  if (window.WTS_FIT) {
    H.classList.add('wts-fit');
    let raf = 0;
    const fit = () => {
      raf = 0;
      const nav = document.querySelector('.ws-h nav.ws-tabs');
      if (!nav || document.body.classList.contains('is-desk')) { H.classList.remove('wts-tight'); return; }
      const was = H.classList.contains('wts-tight');
      H.classList.remove('wts-tight');
      const tabs = [...nav.querySelectorAll('.h3-tab')];
      const tight = H.classList.contains('wts-eqfit')
        ? tabs.some(b => b.scrollWidth > b.clientWidth + 0.5)   // v7: табы равные — сокращаем, если подпись не влезла в свой таб
        : tabs.reduce((w, b) => w + b.scrollWidth, 0) > nav.clientWidth - 6;
      if (tight) H.classList.add('wts-tight');
      if (tight !== was) window.dispatchEvent(new Event('resize'));   // плашка выбранного таба пересчитает себя
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(fit); };
    window.addEventListener('resize', () => { if (!fit.busy) { fit.busy = 1; ask(); setTimeout(() => fit.busy = 0, 50); } });
    new MutationObserver(ask).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', ask); window.addEventListener('load', ask);
  }
  // v5: время идущей карты — как в футболе, только минута: «33′» вместо «33:30»
  if (window.WTS_MIN) {
    const min = () => document.querySelectorAll('.ws-tabs .h3-tab.is-live small').forEach(el => {
      const m = el.textContent.match(/^(\d+):\d\d$/);
      if (m) el.textContent = m[1] + '′';
    });
    new MutationObserver(min).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    document.addEventListener('DOMContentLoaded', min);
  }
})();
