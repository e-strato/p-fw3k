// w-barst v3–v5 — нижний бар во всех состояниях друг под другом. Вид острова — window.BS_LOOK (ic / ring / chip, код — _wbar.js, тот же на странице).
// ‼️ Пример: событий-вопросов, процентов и типов событий (Рошан / Убит / Башня) в данных нет
(() => {
  const BB = { name: 'BetBoom', logo: 'img/teams/8255888.png' }, IW = { name: 'Iron Wing', logo: 'img/teams/10150413.png' };
  const E = (short, ic, what) => ({ id: 'ev', match: 'BetBoom — Iron Wing', what, short, ic, who: 'BetBoom', at: '41:25', q: 'Кто возьмёт следующую башню?', a: BB, b: IW, pa: 62, votes: 1240, talk: 84, T: 45 });
  const rosh = E('Рошан', 'rosh', 'Рошан убит'), kill = E('Убит', 'kill', 'Убит Yatoro'), tower = E('Башня', 'tower', 'Пала башня');
  const pill = p => ({ a: BB, b: IW, ...p }), live = { kind: 'live', time: '41:43' };
  const S = [
    ['Матч идёт', [
      ['Live · команда впереди', 'время карты, логотип того, кто впереди по золоту, перевес', pill({ ...live, leadTeam: BB, leadBy: '9,9k' })],
      ['Live · золото поровну', 'перевеса нет', pill({ kind: 'live', time: '12:05' })],
      ['Live · счёт скрыт', 'анти-спойлер: перевес не показываем', pill({ ...live, hid: true })],
      ['Live · пауза', 'игра остановлена, время стоит', pill({ kind: 'live', time: '33:30', paused: true })],
      ['Live · нет данных', 'карта идёт, но данных с неё нет', pill({ kind: 'live', time: 'Карта 3', nodata: true })],
    ]],
    ['Вопрос по событию', [
      ['Событие · Рошан', 'одно слово и значок; нажал — карточка с вопросом и подробностями', pill(live), { event: rosh, left: 45 }],
      ['Событие · Убит', 'то же для убийства', pill(live), { event: kill, left: 38 }],
      ['Событие · Башня', 'то же для башни', pill(live), { event: tower, left: 30 }],
      ['Таймер на исходе', 'осталось 5 секунд — красным', pill(live), { event: rosh, left: 5 }],
      ['Ответил', 'галочка, логотип выбранной команды, сколько ответили так же', pill(live), { event: rosh, ans: 'a' }],
    ]],
    ['До и после матча', [
      ['До матча', 'логотипы и время начала', pill({ kind: 'pre', start: '18:00' })],
      ['Время уточняется', 'начала пока нет', pill({ kind: 'pre', start: '—', why: 'announce' })],
      ['Перенос', 'новое время начала', pill({ kind: 'pre', start: '20:30', why: 'delayed' })],
      ['Отменён', 'матча не будет', pill({ kind: 'pre', start: '—', why: 'cancel' })],
      ['После матча', 'логотипы и счёт серии', pill({ kind: 'post', score: '2:1' })],
      ['После · счёт скрыт', 'анти-спойлер', pill({ kind: 'post', score: 'скрыт', hid: true })],
    ]],
    ['Прокрутка и зритель', [
      ['Листаешь вниз', 'кнопки прячутся, остров остаётся', pill({ ...live, leadTeam: BB, leadBy: '9,9k' }), { off: true }],
      ['Листаешь вниз · событие', 'остров со светом поверх страницы', pill(live), { event: rosh, left: 45, off: true }],
      ['Вошёл', 'справа «Я» вместо «Войти»', pill({ ...live, leadTeam: BB, leadBy: '9,9k' }), { auth: true }],
    ]],
  ];
  const look = window.BS_LOOK;
  const bar = (p, x = {}) => { const tb = WBAR.tabs({ auth: x.auth, look: 'svg' });
    tb.splice(2, 0, WBAR.still({ pill: p, event: x.event || null, look, base: '' }, { ans: x.ans, left: x.left }));
    return `<div class="bs-ph${x.off ? ' bh-island bar-off' : ''}"><div class="bs-bg"><i></i></div><nav class="tabbar wb-on tb-svg">${tb.join('')}</nav></div>`; };
  let n = 0; // сквозной номер — чтобы обсуждать: «в 6-м обрезается»
  document.getElementById('bs').innerHTML = S.map(([h, rows]) => `<section class="bs-sec"><h2>${h}</h2>${rows.map(([t, d, p, x]) =>
    `<div class="bs-t"><p><b><span class="bs-n">${++n}.</span>${t}</b>${d}</p>${bar(p, x)}</div>`).join('')}</section>`).join('');
  document.addEventListener('click', e => { if (e.target.closest('a, [data-wb]')) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
})();
