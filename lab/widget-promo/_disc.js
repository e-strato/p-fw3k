// DB_FAKE: если на странице есть выдуманная база (_db/_fake.js) — данные отсюда берутся из неё (одно место для выдумки); нет — как было
// Лаба widget-promo v12–v16 (дирижёр 29.10: «обсуждение; лучшее выделяется, чтобы завлечь в обсуждение; в формате матча — со статистикой; комплексно»;
// «комментарий к моменту матча — хорошая идея; карточка момента — интересно; на графике золота комменты не показывать — может, другой график / таймлайн;
// обсуждение — скорее правая колонка: неважная инфа, тоже сворачивается, но кому-то интересна»).
// Виджет «Обсуждение» в правой колонке (слот promo из ../gs-match/_gs.js, GS_PROMO_AT = 'top'), сворачивается как остальные (../widget-expand WXKey, WX_POS = 'peek2').
// Свёрнут — карточка момента: последнее событие, цифры, лучший коммент к нему, «Обсудить». Раскрыт — по варианту window.DISC:
// groups — комменты, сгруппированные по моментам (v12) · tl — таймлайн моментов, нажал — комменты момента (v13) · chat — лента с чипами-моментами (v14) ·
// pulse — график активности обсуждения по минутам, пики = моменты (v15) · drawer — «Обсудить» открывает шторку поверх страницы справа (v16).
// v17–v19 (дирижёр 29.10: «все одно нарисовал; оставим v15; по три варианта, концептуально разные, супер продуманные»). Логика та же (коммент — к моменту, лучшее — самое залайканное
// к последнему событию, виджет сворачивается), но форма и механика разные, и свёрнутый вид у каждого свой:
// report — «Репортаж трибуны»: текстовая трансляция, строки событий из статистики, в них вплетён лучший коммент как голос трибуны; свёрнут — последняя строка ·
// duel — «Спор момента»: событие превращается в вопрос с двумя сторонами, лучший коммент каждой стороны лоб в лоб, голос → проценты; свёрнут — вопрос и шкала ·
// story — «Сторис моментов»: моменты — карточки во весь виджет с артом героя, полоски сверху, сами листаются; свёрнут — полоса с текущим моментом.
// v20–v22 (дирижёр 29.10: «v17–v19 ближе; ещё в этом роде, без сторис; с точки зрения геймеров — любят писать в чат, как их завлечь»). Три разных крючка:
// tribes — «Стенка на стенку»: две трибуны, выбрал команду — пишешь за неё, шкала «чья трибуна громче», лучший крик каждой (крючок — свои против чужих) ·
// wave — «Волна чата»: после события чат спамит одно слово (GG, F, ОГО) — счётчик волны, кто начал, кнопки в один тап (крючок — быть в толпе, ноль усилий) ·
// prophet — «Пророк»: коммент, написанный ДО события и сбывшийся, — «за 1:20 до Рошана»; звания, топ чата, «напиши, что будет дальше» (крючок — быть правым и признанным).
// v23–v25 (дирижёр 29.10: «нравится v20, но сообщения не будут разделяться; надо показывать выделенное сообщение — самое залайканное, мем или текст; и выбор, за кого болеешь»):
// чат общий, у ника — значок команды, за которую болеет автор; сверху — выделенное сообщение. Разное — как устроены выбор и выделенное:
// pin2 — «Закреп + общий чат»: выделенное сверху (мем или текст), шкала трибун, общий чат со значками; выбор команды — в поле ввода ·
// gate — «Сначала выбери сторону»: пока не выбрал — видно только выделенное и две большие кнопки; выбрал — открывается чат, выделенное — «у своих / у чужих» ·
// board — «Экран трибуны»: выделенное — большой экран, его захватывает трибуна, чьё сообщение набрало больше лайков; «Spirit держат экран 2:14», можно перебить.
// v26 (дирижёр 29.10: «v25 интересно; такую же, только понятнее, меньше по высоте, и в раскрытом; может, как табло — стилизованное, больше иконок, в стиле наших виджетов»):
// board2 — «Табло трибун»: шапка как у наших виджетов; табло — две трибуны как счёт матча (лого, ♡ лучшего сообщения трибуны, у лидера корона, посередине «держит экран 2:14»);
// под табло — выделенное сообщение строкой (мем — миниатюрой, текст — 2 строки); свёрнут — табло + выделенное + выбор команды; раскрыт — ещё «сколько не хватает, чтобы перебить» и общий чат со значками-лого.
// v27–v29 (дирижёр 29.10: «v26 хуже v25; иконками, а не текстами; залайканный коммент — моношрифтом, как телек; визуально красивее»). Логика v25 (экран держит трибуна
// с самым залайканным сообщением, претендент добирает ♡, общий чат со значками), подписи заменены иконками, экран — разной «техникой»:
// led — LED-табло стадиона: точечная матрица, янтарное свечение, коммент бежит строкой · tv — телевизор: кинескоп, полосы развёртки, LIVE, коммент субтитром машинкой ·
// ttx — телетекст: страница P.324, блочные цвета, коммент крупным пиксельным шрифтом.
// v30 (дирижёр 29.10: «очень нравится экран v27; на экране — ник, аватарка и текст коммента или мем; экран квадратный; внизу — легчайшие пояснения, как перебить»):
// led2 — квадратный LED-экран: сверху иконки (держатель, время, ♥), в центре мем (подкрашен под LED) с подписью или текст крупно, внизу аватар и ник; под экраном — три тонкие строки-пояснения.
// v31 (дирижёр 29.10: «v30 не нравится; экран — смесь v27 и v28; нормальное объяснение — это голосование; в раскрытом экран не меняется, под ним комменты и предложение перебить лайками»):
// mix — экран-телевизор (кинескоп, развёртка, LIVE, мем фоном) с LED-строкой янтарём (бежит коммент), аватар и ник; под экраном одна строка — как это работает;
// раскрыт — экран тот же, ниже претенденты: комменты по ♥ с кнопкой ♥ и «до экрана −N»; набрал больше лидера — занимает экран.
// v32 (дирижёр 29.10: «ничего не должно быть бегущей строкой — понравился сам эффект»): как v31, но LED-текст стоит на месте, переносится по строкам (window.MX_STATIC).
// v33 (дирижёр 29.10, скрин v32: «криво, заезжает, нет выпуклости, нет общего бордера»): window.MX_FRAME — корпус телевизора (рамка, стекло с бликом и выпуклостью),
// LED-табло — вставкой с отступами внутри стекла, LIVE — в строке иконок, ник — моноширинным 12 (страница перебивала его в 22).
// v34 (дирижёр 29.10: «v33 — лучший; при открытии открывается именно чат; в сообщении можно написать своё»): window.MX_CHAT — раскрыт: экран тот же, ниже чат матча
// (лого команды автора, ник, текст, ♥ — лайк = голос за экран), внизу настоящее поле ввода: Enter — сообщение в чат со значком твоей команды; команду выбираешь лого у поля.
// v35–v37 (дирижёр 29.10: «разные версии чата; добавить вставку картинок; кнопка лайка меньше; пояснение — под экраном, с крестиком, в раскрытом убрать — ради высоты»):
// window.CH — как выглядит чат под экраном v33: line — плотные строки как Twitch, ♥ мелко справа, картинка миниатюрой · bubble — пузыри как Telegram, свои справа, картинка крупно в пузыре ·
// cards — «Топ / Новые», сообщения карточками, картинки крупно, у каждой ♥. Во всех: 📎 в поле (файл или Ctrl+V), превью перед отправкой; пояснение — строка с ×, в раскрытом — значок «?» в шапке.
// v38 (дирижёр 29.10: «v36 норм, только всё гораздо меньше — пузыри гораздо меньше»): window.CH_SM — мелкие пузыри (текст 11, отступы 3/7, картинка до 120).
// v39–v42 (дирижёр 29.10: «оставляем v35; сделай в стиле Twitch, YouTube… разные стили стрим-чатов»): window.CH_SKIN поверх CH = 'line' —
// twitch — «ник: текст», у каждого свой цвет ника, значок команды как бейдж · yt — круглая аватарка, ник серым, текст рядом, сверху «Топ-чат» ·
// kick — время мелко слева, ник жирным неоново-цветным, плотно, зелёный акцент · vk — VK Play Live: аватарка, ник синим, сообщение подложкой.
// v43 (дирижёр 29.10: «как Twitch и Kick — цветные ники; время одно, супер мелкое, может, при наведении»): CH_SKIN = 'twk' — строка Twitch, ники цветом Kick,
// время 9 px справа — появляется при наведении вместе с ♥.
// v44 (дирижёр 29.10: «оставляем v43; без фиолетового выделения Twitch — наше обычное; выбор команды — переключаемым сегментом»): window.CH_SEG —
// поле ввода с обычной рамкой (--w-border / --w-ring), слева сегмент как в наших виджетах: [лого Spirit | лого Vision], выбранная — подложкой.
// v45 (дирижёр 29.10, скрины v44): window.CH_V45 — кнопка «отправить» (самолётик, а не карандаш); пояснение не закрывается; заголовка нет;
// «👥 2 418» — в самый низ; раскрыт — посередине низа ручка: тянешь — чат выше или компактнее (120–520 px).
// v46 (дирижёр 29.10, скрины v45): window.CH_V46 — низ («👥 2 418» и ручка) — в одной строке со значком «свернуть / развернуть» справа внизу;
// ручка — шесть точек (3 × 2), как перетаскивание, повёрнутое на 90°.
// v47 (дирижёр 29.10, скрин широкой мобилки: «высота остаётся, просто растягивается; на сверхширокой мобилке чат и закреп — в две колонки, на мелкой — как на десктопе»):
// window.CH_V47 — виджет шире 520 px (контейнерный запрос): раскрыт — слева экран и пояснение, справа чат и поле; свёрнут — экран не растягивается (высота 220, картинка обрезается).
// v48 (дирижёр 29.10, скрин v47 свёрнутого на широкой мобилке: «что-то нет»): window.CH_V48 — на широком (> 520) две колонки и в свёрнутом:
// слева экран (4:3) и пояснение, справа чат (высотой как экран) и поле; уже 520 — свёрнут как раньше, только экран.
// v49 (дирижёр 29.10, скрины v48: «в свёрнутом больше, чем в развёрнутом — наоборот должно быть»): window.CH_V49 — свёрнут на широком: справа только 5 последних
// сообщений (с затуханием сверху, без прокрутки) и поле — по высоте не больше экрана; раскрыт: чат 420 px по умолчанию (ручкой — 120–520).
// v50 (дирижёр 29.10: «почти; затемнение с перебором; чат прокручивается, контента побольше»): window.CH_V50 — свёрнут на широком: вся лента (+20 сообщений),
// старые сверху, новые снизу у поля, прокручивается; колонка по высоте ровно с экран (лента — абсолютно внутри колонки); затухание лёгкое, 24 px сверху.
// v51 (дирижёр 29.10: «эти — только в лайве или с актуальным контентом до, немного по-другому»): до матча (data-pre на виджете) — на экране лучший прогноз до матча,
// бейдж «ДО МАТЧА» вместо LIVE, «до старта 1:24» вместо времени держания, подпись — «лучший прогноз»; чат — те же сообщения про предстоящий матч.
// ‼️ Комментариев в данных нет — моменты, тексты, ники, лайки выдуманы под live Vision — Spirit, карта 3.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const HEART = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>';
  const BUB = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  const av = n => `<i class="dc-av" style="--h:${[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 360}">${esc(n[0].toUpperCase())}</i>`;
  const like = n => `<button class="dc-like" data-dc="like">${HEART}<span class="num">${n}</span></button>`;
  const IMG = h => `../gs-match/img/heroes/${h}.png`; // от папки лабы: в style="--art:url()" путь считается от _disc.css, а не от base href

  // Моменты карты 3 (новые сверху): время, что случилось, цифры, сколько комментов, комменты (первый — лучший)
  const MOM = window.DB_FAKE?.moments ?? [
    { t: '31:05', min: 31, ic: 'faceless_void', e: 'Spirit выиграли драку на миду', st: [['Убийства', '4 : 1'], ['Перевес', '+8.7k Spirit'], ['Yatoro', '4/0/—']], n: 86,
      c: [['bkb_timing', 'Collapse на Марсе — лучший инициатор турнира, без вариантов', 655], ['glhf_dota', 'Если Vision не заберут мид сейчас — карта всё', 402], ['nix_pls', 'Миду Vision нужен Блинк, а не третий предмет на ману', 377]] },
    { t: '24:10', min: 24, ic: 'terrorblade', e: 'Spirit забрали Рошана', st: [['Аегис', 'Yatoro'], ['Перевес', '+5.2k Spirit'], ['Vision', '−2 героя']], n: 142,
      c: [['miposhka_fan', 'Третий раз за серию одна и та же ошибка у ямы — смоки на верх, и никто не смотрит на реку', 812], ['roshan_enjoyer', 'Аегис на Yatoro = карта закрыта', 540], ['pos5_life', 'Саппорты Spirit поставили варды за минуту до ямы, красиво', 210]] },
    { t: '17:40', min: 17, ic: 'storm_spirit', e: 'Vision снесли верхние бараки', st: [['Бараки', '1 / 6'], ['Перевес', '+1.1k Vision'], ['Satanic', '5/1/—']], n: 64,
      c: [['ez4ence', 'Vision наконец проснулись', 188], ['volvo_pls', 'Satanic вывез эту линию в одиночку', 150]] },
    { t: '08:20', min: 8, ic: 'crystal_maiden', e: 'Первая кровь — rue', st: [['Первая кровь', 'Vision'], ['Время', '8:20'], ['Убил', 'Satanic']], n: 31,
      c: [['dota_dad', 'rue опять отдал первую кровь, традиция', 96]] },
  ];
  // Активность обсуждения по минутам 0–33 (комментов в минуту), пики — на моментах
  const PULSE = Array.from({ length: 34 }, (_, i) => Math.round(3 + 2 * Math.sin(i) + (MOM.some(m => m.min === i) ? 0 : 0) + MOM.reduce((a, m) => a + Math.max(0, m.n / 3 - Math.abs(i - m.min) * m.n / 9), 0)));

  const cm = ([n, t, l], best) => `<div class="dc-c${best ? ' is-best' : ''}">${av(n)}<p><b>${esc(n)}</b>${esc(t)}</p>${like(l)}</div>`;
  const stats = m => `<div class="dc-st">${m.st.map(([k, v]) => `<div><small>${esc(k)}</small><b class="num">${esc(v)}</b></div>`).join('')}</div>`;
  const evRow = (m, cls = '') => `<div class="dc-ev ${cls}"><img src="${IMG(m.ic)}" alt="" /><p><b>${esc(m.e)}</b><small class="num">${m.t} · карта 3</small></p></div>`;
  const go = (m, label) => `<button class="dc-go" data-dc="go" data-v="${m.t}">${BUB}${label || `Обсудить · ${m.n}`}</button>`;

  // Карточка момента — свёрнутый вид (у всех вариантов одинаковый): событие, цифры, лучший коммент, «Обсудить»
  const card = m => `<div class="dc-card">${evRow(m)}${stats(m)}<div class="dc-bestcap"><small>🔥 Лучший коммент к моменту</small></div>${cm(m.c[0], true)}<div class="dc-cf">${go(m)}<span class="dc-more-n">ещё ${MOM.length - 1} момента</span></div></div>`;

  const ST = { open: null, chip: 'all', vote: {}, si: 0, side: '', wn: 0, combo: 0, last: 0, mine: [], draft: '', nohint: false, sort: 'top', fh: window.CH_V49 ? 420 : 240 };
  // v12 — комменты группами по моментам
  const groups = () => MOM.slice(1).map(m => `<div class="dc-grp">${evRow(m, 'sm')}${m.c.slice(0, 2).map((c, i) => cm(c, i === 0)).join('')}${go(m, `Все ${m.n} комментов`)}</div>`).join('');
  // v13 — таймлайн моментов: точка на линии, событие, 💬, лучший коммент; нажал — раскрываются все комменты момента
  const tl = () => `<div class="dc-tl">${MOM.slice(1).map(m => `<div class="dc-tli${ST.open === m.t ? ' on' : ''}"><i class="dc-dot"></i><button class="dc-tlh" data-dc="tl" data-v="${m.t}"><span class="num">${m.t}</span><b>${esc(m.e)}</b><em>${BUB}${m.n}</em></button>
      ${ST.open === m.t ? m.c.map((c, i) => cm(c, i === 0)).join('') + go(m, 'Написать к моменту') : `<p class="dc-tlq">«${esc(m.c[0][1])}»</p>`}</div>`).join('')}</div>`;
  // v14 — лента с чипами-моментами: Все · 31:05 · 24:10 …; лента — комменты выбранного момента (или всех, новые сверху)
  const chat = () => { const list = ST.chip === 'all' ? MOM.flatMap(m => m.c.map(c => [c, m])) : MOM.filter(m => m.t === ST.chip).flatMap(m => m.c.map(c => [c, m]));
    return `<div class="dc-chips"><button data-dc="chip" data-v="all" class="${ST.chip === 'all' ? 'on' : ''}">Все</button>${MOM.map(m => `<button data-dc="chip" data-v="${m.t}" class="${ST.chip === m.t ? 'on' : ''}"><span class="num">${m.t}</span></button>`).join('')}</div>
      <div class="dc-feed">${list.slice(0, 6).map(([c, m]) => `<div class="dc-fi"><small class="num">${m.t}</small>${cm(c)}</div>`).join('')}</div><button class="dc-inp" data-a="toast" data-v="Написать (демо)">Написать к ${ST.chip === 'all' ? MOM[0].t : ST.chip}…</button>`; };
  // v15 — пульс обсуждения: столбики «комментов в минуту», пики подписаны моментами; нажал на пик — момент ниже
  const pulse = () => { const mx = Math.max(...PULSE), sel = MOM.find(m => m.t === ST.open) || MOM[1];
    return `<div class="dc-pl"><div class="dc-plcap"><small>Обсуждение по минутам</small><small class="num">${MOM.reduce((a, m) => a + m.n, 0)} комментов</small></div>
      <div class="dc-bars">${PULSE.map((v, i) => { const m = MOM.find(q => q.min === i); return `<i class="${m ? 'pk' : ''}${m && m === sel ? ' on' : ''}" style="height:${(v / mx * 100).toFixed(0)}%"${m ? ` data-dc="pk" data-v="${m.t}" title="${esc(m.e)}"` : ''}>${m ? `<u class="num">${m.t}</u>` : ''}</i>`; }).join('')}</div>
      <div class="dc-plsel">${evRow(sel, 'sm')}${cm(sel.c[0], true)}${go(sel)}</div></div>`; };

  // v16 — шторка поверх страницы справа: виджет остаётся карточкой момента, «Обсудить» открывает шторку со всеми моментами
  const drawer = t => { let d = document.querySelector('.dc-dr'); if (!d) { d = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'dc-dr' })); }
    d.innerHTML = `<div class="dc-drp"><div class="dc-drh"><b>Обсуждение матча</b><button data-dc="drx" aria-label="Закрыть">×</button></div><div class="dc-drb">${MOM.map(m => `<div class="dc-grp${m.t === t ? ' on' : ''}">${evRow(m, 'sm')}${stats(m)}${m.c.map((c, i) => cm(c, i === 0)).join('')}</div>`).join('')}</div>
      <button class="dc-inp" data-a="toast" data-v="Написать (демо)">Написать к ${t}…</button></div>`;
    requestAnimationFrame(() => d.classList.add('on')); };

  // ---- v17 «Репортаж трибуны» ----
  // Лента = события карты из статистики (крупные — с цифрами, мелкие — строкой) + у крупных голос трибуны (лучший коммент, ♡, «ещё N»)
  const MINOR = [['29:40', 'Vision купили Black King Bar на Satanic'], ['21:15', 'Spirit снесли две вышки на низу'], ['12:30', 'rue умер во второй раз, Spirit +1.8k']];
  const REP = [...MOM.map(m => ({ t: m.t, m })), ...MINOR.map(([t, e]) => ({ t, e }))].sort((a, b) => b.t.localeCompare(a.t));
  const repRow = (r, first) => r.m ? `<div class="rp-r is-big${first ? ' is-now' : ''}"><span class="rp-t num">${r.t}</span><div class="rp-b"><p class="rp-e"><b>${esc(r.m.e)}.</b> ${r.m.st.map(([k, v]) => `${esc(k)} <b class="num">${esc(v)}</b>`).join(' · ')}</p>
      <div class="rp-q"><i class="rp-qm">“</i><p>${esc(r.m.c[0][1])}</p><div class="rp-qf">${av(r.m.c[0][0])}<span>${esc(r.m.c[0][0])}</span>${like(r.m.c[0][2])}<button class="rp-more" data-dc="go" data-v="${r.m.t}">${BUB}ещё ${r.m.n - 1}</button></div></div></div></div>`
    : `<div class="rp-r"><span class="rp-t num">${r.t}</span><p class="rp-e rp-e--s">${esc(r.e)}</p></div>`;
  const report = () => ({ min: repRow(REP[0], true), full: `${REP.map((r, i) => repRow(r, i === 0)).join('')}<button class="dc-inp" data-a="toast" data-v="Написать (демо)">Твой голос в репортаж к ${MOM[0].t}…</button>`, title: 'Репортаж трибуны' });

  // ---- v18 «Спор момента» ----
  // Каждый крупный момент → вопрос с двумя сторонами; у каждой стороны — свой лучший коммент; проголосовал — видны проценты и куда клонится чат
  const DUEL = [{ m: MOM[0], q: 'Карта решена после драки на миду?', a: ['Да, Spirit не отпустят', 'bkb_timing', 'При +8.7k и аегисе у Yatoro — это gg, Vision нечего ловить', 655, 61], b: ['Нет, Vision вернутся', 'glhf_dota', 'У Vision поздняя пятёрка, на 40-й минуте Satanic переиграет', 402, 39] },
    { m: MOM[1], q: 'Vision зря отдали Рошана?', a: ['Да, ошибка', 'miposhka_fan', 'Третий раз за серию одна и та же ошибка у ямы', 812, 74], b: ['Нет, не успевали', 'volvo_pls', 'Без вардов на реке драться за Рошана — самоубийство', 230, 26] },
    { m: MOM[2], q: 'Satanic — MVP серии?', a: ['Да', 'volvo_pls', 'Вывез линию в одиночку против двоих', 150, 58], b: ['Нет, Yatoro', 'ez4ence', 'Yatoro 4/0 и вся карта на нём', 120, 42] }];
  const side = (d, k) => { const s = d[k], voted = ST.vote[d.m.t];
    return `<button class="du-s du-s--${k}${voted === k ? ' on' : ''}" data-dc="vote" data-v="${d.m.t}|${k}"><b>${esc(s[0])}</b><p>«${esc(s[2])}»</p><span class="du-who">${av(s[1])}${esc(s[1])} · ♡ ${s[3]}</span>${voted ? `<em class="num">${s[4]}%</em>` : ''}</button>`; };
  const bar = d => { const voted = ST.vote[d.m.t]; return `<div class="du-bar${voted ? ' on' : ''}"><i style="width:${voted ? d.a[4] : 50}%"></i><u style="width:${voted ? d.b[4] : 50}%"></u></div>`; };
  const duelHead = d => `<div class="du-ev"><span class="num">${d.m.t}</span>${esc(d.m.e)}</div><p class="du-q">${esc(d.q)}</p>`;
  const duel = () => { const d = DUEL[0], v = ST.vote[d.m.t];
    return { title: 'Спор момента',
      min: `${duelHead(d)}${bar(d)}<div class="du-vs"><button class="du-mini a" data-dc="vote" data-v="${d.m.t}|a">${esc(d.a[0])}${v ? ` · ${d.a[4]}%` : ''}</button><button class="du-mini b" data-dc="vote" data-v="${d.m.t}|b">${esc(d.b[0])}${v ? ` · ${d.b[4]}%` : ''}</button></div>`,
      full: `${duelHead(d)}<div class="du-two">${side(d, 'a')}${side(d, 'b')}</div>${bar(d)}${go(d.m, `Спор · ${d.m.n} комментов`)}
        <div class="du-old"><small>Прошлые споры</small>${DUEL.slice(1).map(o => `<div class="du-o"><span class="num">${o.m.t}</span><p>${esc(o.q)}</p><b class="num">${o.a[4]} / ${o.b[4]}</b></div>`).join('')}</div>` }; };

  // ---- v19 «Сторис моментов» ----
  // Карточка во весь виджет: арт героя момента, полоски сверху (сколько моментов, текущая заполняется 6 с), время и событие крупно, цифры чипами, лучший коммент пузырём; тап слева / справа — листать
  const story = () => { const i = ST.si, m = MOM[i], seg = MOM.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'cur' : ''}"></i>`).join('');
    const card = big => `<div class="sr-c${big ? ' is-big' : ''}" style="--art:url('${IMG(m.ic)}')"><div class="sr-seg">${seg}</div>
      <button class="sr-nav l" data-dc="sr" data-v="-1" aria-label="Назад"></button><button class="sr-nav r" data-dc="sr" data-v="1" aria-label="Дальше"></button>
      <div class="sr-in"><span class="sr-t num">${m.t} · карта 3</span><b class="sr-e">${esc(m.e)}</b>${big ? `<div class="sr-chips">${m.st.map(([k, v]) => `<span><small>${esc(k)}</small><b class="num">${esc(v)}</b></span>`).join('')}</div>` : ''}
        <div class="sr-bub">${av(m.c[0][0])}<p>${big ? '' : ''}${esc(m.c[0][1])}</p><span class="num">♡ ${m.c[0][2]}</span></div>${big ? go(m) : ''}</div></div>`;
    return { title: 'Моменты', min: card(false), full: card(true) }; };

  // ---- v20 «Стенка на стенку» ----
  const TR = window.DB_FAKE?.stands ?? { a: { name: 'Spirit', c: 'var(--w-up)', loud: 58, n: 1402, best: ['yatoro_army', 'Аегис у Yatoro — Vision, собирайте вещи 🐐', 488],
      feed: [['yatoro_army', 'ЭТО НАША КАРТА'], ['larl_fan', 'Ларл красава на миду'], ['spirit4ever', '+8.7k, уже не отдадим'], ['collapse_gg', 'Collapse опять в 5 героев']] },
    b: { name: 'Vision', c: 'var(--w-down)', loud: 42, n: 1016, best: ['satanic_fan', 'Satanic с BKB ещё всем покажет, рано хороните', 402],
      feed: [['satanic_fan', 'Терпим, на 40-й наше'], ['vision_fam', 'рофл, где варды?'], ['nix_pls', 'выкуп и вперёд'], ['tolik_dota', 'верим до последнего']] } };
  const loud = () => `<div class="tb-loud"><span style="color:${TR.a.c}">${TR.a.name} <b class="num">${TR.a.loud}%</b></span><small>чья трибуна громче · за минуту</small><span style="color:${TR.b.c}"><b class="num">${TR.b.loud}%</b> ${TR.b.name}</span></div>
      <div class="du-bar on tb-bar"><i style="width:${TR.a.loud}%"></i><u style="width:${TR.b.loud}%"></u></div>`;
  const shout = (k, one) => { const t = TR[k]; return `<div class="tb-sh tb-sh--${k}${one ? ' one' : ''}"><small>🔥 Громче всех · трибуна ${t.name}</small><p>${av(t.best[0])}<span>${esc(t.best[1])}</span>${like(t.best[2])}</p></div>`; };
  const pick = () => ST.side ? `<button class="dc-inp tb-inp tb-inp--${ST.side}" data-a="toast" data-v="Написать (демо)">Кричать за ${TR[ST.side].name}…</button>`
    : `<div class="du-vs"><button class="du-mini a" data-dc="side" data-v="a">Я за ${TR.a.name}</button><button class="du-mini b" data-dc="side" data-v="b">Я за ${TR.b.name}</button></div>`;
  const tribes = () => ({ title: 'Стенка на стенку',
    min: `${loud()}${shout('a', 1)}${shout('b', 1)}${pick()}`,
    full: `${loud()}<div class="tb-cols">${['a', 'b'].map(k => `<div class="tb-col tb-col--${k}${ST.side === k ? ' is-me' : ''}"><div class="tb-ch"><b>${TR[k].name}</b><small class="num">${TR[k].n} в трибуне</small></div>${TR[k].feed.map(([n, t]) => `<p><b>${esc(n)}</b>${esc(t)}</p>`).join('')}</div>`).join('')}</div>
      ${shout('a')}${shout('b')}${pick()}` });

  // ---- v21 «Волна чата» ----
  const PH = [['GG', '🤝'], ['F', '🫡'], ['ОГО', '😱'], ['+', '➕'], ['🐐', '🐐'], ['ЛОЛ', '😂']];
  const WAVES = [{ m: MOM[0], w: 'GG', n: 1284, by: 'nix_pls' }, { m: MOM[1], w: 'F', n: 2310, by: 'satanic_fan' }, { m: MOM[2], w: 'ОГО', n: 640, by: 'ez4ence' }];
  const wavePill = () => { const w = WAVES[0]; return `<div class="wv-now"><div class="wv-big"><b class="wv-w">${w.w}</b><span class="num" data-wv>×${(w.n + ST.wn).toLocaleString('ru')}</span></div>
      <small>волна после «${esc(w.m.e)}» · начал <b>${esc(w.by)}</b></small>${ST.combo > 1 ? `<em class="wv-combo num">комбо ×${ST.combo}</em>` : ''}</div>`; };
  const taps = () => `<div class="wv-taps">${PH.map(([t, e]) => `<button data-dc="wv" data-v="${t}" class="${t === WAVES[0].w ? 'is-hot' : ''}"><span>${e}</span><b>${t}</b></button>`).join('')}</div>`;
  const wave = () => ({ title: 'Волна чата',
    min: `${wavePill()}${taps()}`,
    full: `${wavePill()}${taps()}<div class="du-old"><small>Волны этой карты</small>${WAVES.slice(1).map(w => `<div class="du-o"><span class="num">${w.m.t}</span><p>${esc(w.m.e)}</p><b class="num">${w.w} ×${w.n.toLocaleString('ru')}</b></div>`).join('')}</div>
      <div class="dc-bestcap"><small>🔥 Лучший коммент на волне</small></div>${cm(MOM[0].c[0], true)}<button class="dc-inp" data-a="toast" data-v="Написать (демо)">Начни свою волну или напиши…</button>` });

  // ---- v22 «Пророк» ----
  const PRO = [{ m: MOM[1], n: 'tinker_main', t: 'Spirit сейчас пойдут на Рошана — смок на верху, а у Vision нет вардов на реке', at: '22:50', ahead: '1:20', l: 930, rank: 'Пророк ×3' },
    { m: MOM[0], n: 'bkb_timing', t: 'Следующая драка на миду — и Vision развалятся', at: '30:10', ahead: '0:55', l: 610, rank: 'Аналитик' },
    { m: MOM[2], n: 'volvo_pls', t: 'Satanic сейчас сломает верхние бараки, Spirit все на низу', at: '16:30', ahead: '1:10', l: 340, rank: 'Новичок' }];
  const LB = [['tinker_main', '🔮 3', 2410], ['bkb_timing', '🔮 2', 1980], ['miposhka_fan', '🔮 1', 1650]];
  const proCard = p => `<div class="pf-c"><div class="pf-top"><span class="pf-b">🔮 Пророк момента</span><small class="num">написал за ${p.ahead} до</small></div>
      <p class="pf-q">«${esc(p.t)}»</p><div class="pf-ft">${av(p.n)}<b>${esc(p.n)}</b><span class="pf-rk">${p.rank}</span>${like(p.l)}</div>
      <div class="pf-ev"><span class="num">${p.at}</span><i></i><span class="num">${p.m.t}</span><b>${esc(p.m.e)}</b> ✓</div></div>`;
  const prophet = () => ({ title: 'Пророки чата',
    min: `${proCard(PRO[0])}<button class="dc-inp" data-a="toast" data-v="Прогноз в чат (демо)">Что будет дальше? Сбудется — получишь 🔮</button>`,
    full: `${proCard(PRO[0])}<div class="du-old"><small>Сбылось на этой карте</small>${PRO.slice(1).map(p => `<div class="du-o"><span class="num">${p.m.t}</span><p>«${esc(p.t)}» — <b>${esc(p.n)}</b></p><b class="num">за ${p.ahead}</b></div>`).join('')}</div>
      <div class="du-old"><small>Ждут проверки · ${'3'} прогноза</small><div class="du-o"><span>⏳</span><p>«Vision выкупятся и заберут мид до 35:00»</p><b class="num">♡ 120</b></div><div class="du-o"><span>⏳</span><p>«Spirit закроют до 38-й»</p><b class="num">♡ 96</b></div></div>
      <div class="du-old"><small>Топ чата матча</small>${LB.map(([n, b, pt], i) => `<div class="du-o"><span class="num">${i + 1}</span><p>${av(n)} ${esc(n)} <em class="pf-lb">${b}</em></p><b class="num">${pt}</b></div>`).join('')}<div class="du-o is-me"><span class="num">214</span><p>Ты · до звания «Аналитик» — один сбывшийся прогноз</p><b class="num">40</b></div></div>
      <button class="dc-inp" data-a="toast" data-v="Прогноз в чат (демо)">Что будет дальше? Сбудется — получишь 🔮</button>` });

  // ---- v23–v25: общий чат со значками команд + выделенное сообщение ----
  const TM = { a: { name: 'Spirit', logo: 'img/teams/7119388.png', c: 'var(--w-up)' }, b: { name: 'Vision', logo: 'img/teams/9572001.png', c: 'var(--w-down)' } };
  const badge = k => `<i class="cx-tb cx-tb--${k}" title="Болеет за ${TM[k].name}">${TM[k].name[0]}</i>`;
  const FEED = window.DB_FAKE?.chat.feed ?? [['a', 'yatoro_army', 'ЭТО НАША КАРТА'], ['b', 'satanic_fan', 'Терпим, на 40-й наше'], ['a', 'larl_fan', 'Ларл красава на миду'], ['b', 'vision_fam', 'рофл, где варды?'],
    ['a', 'spirit4ever', '+8.7k, уже не отдадим'], ['b', 'nix_pls', 'выкуп и вперёд'], ['a', 'collapse_gg', 'Collapse опять в 5 героев'], ['b', 'tolik_dota', 'верим до последнего']];
  // v50: ещё сообщения чата — чтобы ленту было что прокручивать
  const MORE = window.DB_FAKE?.chat.more ?? [['a', 'mid_or_feed', 'Ларл переиграл мид полностью'], ['b', 'rax_down', 'Vision, где смоки?'], ['a', 'ancient_one', 'этот Black Hole 🔥'], ['b', 'dota_dad', 'дайте Dukalis нормальную пятёрку'],
    ['a', 'ez4ence', 'GG'], ['b', 'volvo_pls', 'пауза? чего стоим'], ['a', 'pos5_life', 'саппорты Spirit везде'], ['b', 'ti2026', 'это финал года, без шансов скучать'], ['a', 'yatoro_army', 'аегис наш'],
    ['b', 'vision_fam', 'держимся, ребята'], ['a', 'spirit4ever', 'Collapse — машина'], ['b', 'satanic_fan', 'Satanic, ну давай!'], ['a', 'larl_fan', 'Ларл, ты лучший'], ['b', 'nix_pls', 'выкуп через 10 секунд'],
    ['a', 'bkb_timing', 'BKB у Yatoro прожат идеально'], ['b', 'glhf_dota', 'на мид бы сейчас'], ['a', 'collapse_gg', 'Марс снова в пятерых'], ['b', 'tolik_dota', 'верим, верим'], ['a', 'roshan_enjoyer', 'Рошан наш, ребята'], ['b', 'miposhka_fan', 'варды на реку!!']]
    .map(([k, n, t], i) => ({ k, n, t, l: (i * 7) % 40 }));
  // Выделенное: самое залайканное к моменту — мем (img) или текст; у автора — его команда
  const HL = { a: { k: 'a', n: 'roshan_enjoyer', t: 'Когда Yatoro купил шестой слот на 24-й минуте', img: 'terrorblade', l: 1240 }, b: { k: 'b', n: 'satanic_fan', t: 'Satanic с BKB ещё всем покажет, рано хороните. На 40-й минуте у Vision лучшая пятёрка турнира', l: 402 } };
  const hlCard = (h, big) => `<div class="cx-hl${h.img ? ' is-img' : ''}${big ? ' is-big' : ''}" ${h.img ? `style="--art:url('${IMG(h.img)}')"` : ''}>
      <div class="cx-hlt"><span class="cx-cap">🔥 Самое залайканное · ${MOM[0].t}</span></div>
      ${h.img ? `<b class="cx-meme">${esc(h.t)}</b>` : `<p class="cx-txt">${esc(h.t)}</p>`}
      <div class="cx-hlf">${badge(h.k)}${av(h.n)}<span>${esc(h.n)}</span>${like(h.l)}</div></div>`;
  const feed = (n = 6) => `<div class="cx-feed">${FEED.slice(0, n).map(([k, u, t]) => `<p>${badge(k)}<b>${esc(u)}</b>${esc(t)}</p>`).join('')}</div>`;
  const tribeBar = () => `<div class="tb-loud"><span style="color:${TR.a.c}">${TR.a.name} <b class="num">${TR.a.loud}%</b></span><small>трибуны · кто громче</small><span style="color:${TR.b.c}"><b class="num">${TR.b.loud}%</b> ${TR.b.name}</span></div><div class="du-bar on tb-bar"><i style="width:${TR.a.loud}%"></i><u style="width:${TR.b.loud}%"></u></div>`;
  const inp = () => ST.side ? `<button class="dc-inp cx-inp" data-a="toast" data-v="Написать (демо)">${badge(ST.side)}Написать как фанат ${TM[ST.side].name}…</button>`
    : `<div class="cx-inp2"><span>Ты за кого?</span><button class="du-mini a" data-dc="side" data-v="a">${TM.a.name}</button><button class="du-mini b" data-dc="side" data-v="b">${TM.b.name}</button></div>`;

  // v23 — закреп + общий чат
  const pin2 = () => ({ title: 'Чат матча', min: `${hlCard(HL.a)}${tribeBar()}${inp()}`, full: `${hlCard(HL.a)}${tribeBar()}${feed(8)}${inp()}` });

  // v24 — сначала выбери сторону: до выбора чат под замком; после — свой / чужой лучший
  const gate = () => { const me = ST.side, other = me === 'a' ? 'b' : 'a', show = me ? (ST.hlv === 'them' ? HL[other] : HL[me]) : HL.a;
    const choose = `<div class="cx-gate"><p>За кого болеешь?</p><div class="cx-gb">${['a', 'b'].map(k => `<button class="cx-g cx-g--${k}" data-dc="side" data-v="${k}"><img src="${TM[k].logo}" alt="" /><b>${TM[k].name}</b><small class="num">${TR[k].n} фанатов</small></button>`).join('')}</div><small class="cx-gs">Выберешь — откроется чат, у ника будет значок команды</small></div>`;
    const seg = me ? `<div class="pr-seg cx-seg"><button data-dc="hlv" data-v="me" class="${ST.hlv !== 'them' ? 'on' : ''}">Лучшее у своих</button><button data-dc="hlv" data-v="them" class="${ST.hlv === 'them' ? 'on' : ''}">У чужих</button></div>` : '';
    return { title: 'Чат матча', min: me ? `${seg}${hlCard(show)}${inp()}` : `${hlCard(HL.a)}${choose}`,
      full: me ? `${seg}${hlCard(show)}${tribeBar()}${feed(8)}${inp()}` : `${hlCard(HL.a)}<div class="cx-lock">${feed(4)}</div>${choose}` }; };

  // v25 — экран трибуны: выделенное занимает экран той трибуны, чьё сообщение набрало больше лайков; таймер «держат экран», претендент снизу
  const board = () => { const own = ST.board || 'a', h = HL[own], ch = HL[own === 'a' ? 'b' : 'a'];
    const bd = big => `<div class="cx-bd cx-bd--${own}"><div class="cx-bdh"><img src="${TM[own].logo}" alt="" /><b>Трибуна ${TM[own].name} держит экран</b><span class="num">2:14</span></div>${hlCard(h, big)}</div>`;
    const chal = `<div class="cx-ch"><small>Претендент · трибуна ${TM[ch.k].name}</small><p>${badge(ch.k)}<span>${esc(ch.t)}</span><b class="num">♡ ${ch.l}</b></p><div class="cx-chb"><i style="width:${Math.round(ch.l / h.l * 100)}%"></i></div><small class="num">нужно ещё ${h.l - ch.l + 1} ♡, чтобы перебить</small><button class="du-mini ${ch.k}" data-dc="steal" data-v="${ch.k}">♡ Помочь перебить</button></div>`;
    return { title: 'Экран трибуны', min: `${bd(false)}${inp()}`, full: `${bd(true)}${chal}${feed(6)}${inp()}` }; };

  // ---- v26 «Табло трибун» ----
  const I = { crown: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M3 18h18l-1.5-9-4.5 4-3-6-3 6-4.5-4z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    users: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 12 20 4l-6 16-2.5-6.5z"/></svg>' };
  const lg = (k, z = 16) => `<img class="tb2-lg" src="${TM[k].logo}" alt="" width="${z}" height="${z}" />`;
  const board2 = () => { const own = ST.board || 'a', ch = own === 'a' ? 'b' : 'a', h = HL[own], need = HL[own].l - HL[ch].l + 1;
    const side = k => `<div class="tb2-s tb2-s--${k}${k === own ? ' is-own' : ''}">${k === 'b' ? `<b class="tb2-n num">${HEART}${HL[k].l}</b>` : ''}<span class="tb2-t">${lg(k, 20)}<span>${TM[k].name}</span>${k === own ? `<i class="tb2-cr">${I.crown}</i>` : ''}</span>${k === 'a' ? `<b class="tb2-n num">${HEART}${HL[k].l}</b>` : ''}</div>`;
    const sb = `<div class="tb2-sb">${side('a')}<div class="tb2-mid"><small>держит экран</small><b class="num">${I.clock}2:14</b></div>${side('b')}</div>`;
    const msg = `<div class="tb2-m">${h.img ? `<img class="tb2-th" src="${IMG(h.img)}" alt="" />` : ''}<div class="tb2-mb"><p>${esc(h.t)}</p><span class="tb2-a">${lg(h.k, 14)}${esc(h.n)} · ${MOM[0].t}</span></div>${like(h.l)}</div>`;
    const join = ST.side ? `<button class="tb2-in" data-a="toast" data-v="Написать (демо)">${lg(ST.side, 14)}<span>Написать за ${TM[ST.side].name}</span>${I.send}</button>`
      : `<div class="tb2-pick"><span>Ты за кого?</span>${['a', 'b'].map(k => `<button class="tb2-pb tb2-pb--${k}" data-dc="side" data-v="${k}">${lg(k, 14)}${TM[k].name}</button>`).join('')}</div>`;
    const chal = `<div class="tb2-ch"><div class="tb2-chh"><span>${lg(ch, 14)}${TM[ch].name} перебьют, если наберут ещё <b class="num">${need} ♡</b></span><button class="tb2-help" data-dc="steal" data-v="${ch}">${HEART}Помочь</button></div><div class="tb2-chb"><i class="tb2-chb--${ch}" style="width:${Math.round(HL[ch].l / HL[own].l * 100)}%"></i></div></div>`;
    const chat = `<div class="tb2-feed">${FEED.slice(0, 6).map(([k, u, t]) => `<p>${lg(k, 14)}<b>${esc(u)}</b><span>${esc(t)}</span></p>`).join('')}</div>`;
    return { title: 'Табло трибун', hd: `<span class="tb2-on">${I.users}<b class="num">2 418</b></span>`, min: `${sb}${msg}${join}`, full: `${sb}${msg}${chal}${chat}${join}` }; };

  // ---- v27–v29 «Экран» тремя техниками ----
  const SV = (d, z = 14) => `<svg viewBox="0 0 24 24" width="${z}" height="${z}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = { crown: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 18h18l-1.5-9-4.5 4-3-6-3 6-4.5-4z"/></svg>', clock: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 13),
    heart: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>',
    users: SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>', 13), up: SV('<path d="m6 15 6-6 6 6"/>', 14),
    pen: SV('<path d="M4 20h4L19 9l-4-4L4 16z"/>', 14), q: SV('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>', 15), vs: SV('<path d="M5 5l7 14 7-14"/>', 12) };
  const lgo = (k, z = 16) => `<img class="sc-lg" src="${TM[k].logo}" alt="${TM[k].name}" title="${TM[k].name}" width="${z}" height="${z}" />`;
  const scr = mode => { const own = ST.board || 'a', ch = own === 'a' ? 'b' : 'a', h = HL[own], need = h.l - HL[ch].l + 1, mono = esc(h.t);
    // экран: верхняя строка — иконки (лого держателя + корона, часы, ♡), центр — коммент моношрифтом (у led — бегущей строкой), низ — автор
    const top = `<div class="sc-top">${lgo(own, 18)}<i class="sc-cr">${IC.crown}</i><span class="sc-tm num">${IC.clock}2:14</span><span class="sc-hr num">${IC.heart}${h.l}</span></div>`;
    const by = `<div class="sc-by">${lgo(h.k, 12)}<span>${esc(h.n)}</span><span class="sc-at num">${MOM[0].t}</span></div>`;
    const body = mode === 'led' ? `<div class="sc-led"><div class="sc-run"><span>${mono}</span><span aria-hidden="true">${mono}</span></div></div>`
      : mode === 'tv' ? `<div class="sc-pic" style="--art:url('${IMG(h.img || 'storm_spirit')}')"></div><p class="sc-sub"><span class="sc-type">${mono}</span><i class="sc-cur"></i></p>`
      : `<div class="sc-tth"><b>P.324</b><span>ТРИБУНЫ</span><span class="num">${MOM[0].t}</span></div><p class="sc-ttt">${mono}</p>`;
    const screen = `<div class="sc sc--${mode}">${mode === 'tv' ? '<span class="sc-live">● LIVE</span>' : ''}${top}${body}${by}</div>`;
    // счёт трибун иконками: лого ♡ — VS — ♡ лого; претендент добирает
    const score = `<div class="sc-score"><span class="${own === 'a' ? 'is-own' : ''}">${lgo('a', 18)}<b class="num">${HL.a.l}</b></span><i>${IC.vs}</i><span class="${own === 'b' ? 'is-own' : ''}"><b class="num">${HL.b.l}</b>${lgo('b', 18)}</span></div>`;
    const chal = `<div class="sc-ch">${lgo(ch, 16)}<span class="sc-chb"><i style="width:${Math.round(HL[ch].l / h.l * 100)}%"></i></span><b class="num">−${need}</b><button class="sc-ib sc-ib--${ch}" data-dc="steal" data-v="${ch}" title="Помочь ${TM[ch].name} перебить">${IC.heart}</button></div>`;
    const join = ST.side ? `<button class="sc-in" data-a="toast" data-v="Написать (демо)">${lgo(ST.side, 14)}<span></span>${IC.pen}</button>`
      : `<div class="sc-pick"><i title="За кого болеешь?">${IC.q}</i>${['a', 'b'].map(k => `<button data-dc="side" data-v="${k}" title="Я за ${TM[k].name}">${lgo(k, 20)}</button>`).join('')}</div>`;
    const chat = `<div class="sc-feed">${FEED.slice(0, 6).map(([k, u, t]) => `<p>${lgo(k, 12)}<b>${esc(u)}</b>${esc(t)}</p>`).join('')}</div>`;
    return { title: 'Экран трибун', hd: `<span class="tb2-on">${IC.users}<b class="num">2 418</b></span>`, min: `${screen}${join}`, full: `${screen}${score}${chal}${chat}${join}` }; };
  const led = () => scr('led'), tv = () => scr('tv'), ttx = () => scr('ttx');

  // ---- v30 квадратный LED-экран ----
  const AVA = { roshan_enjoyer: 'img/players/101356886.jpg', satanic_fan: 'img/players/10366616.jpg' };
  const led2 = () => { const own = ST.board || 'a', ch = own === 'a' ? 'b' : 'a', h = HL[own], need = h.l - HL[ch].l + 1;
    const ava = AVA[h.n] ? `<img class="l2-av" src="${AVA[h.n]}" alt="" />` : `<i class="l2-av l2-av--t">${esc(h.n[0].toUpperCase())}</i>`;
    const screen = `<div class="sc sc--led l2"><div class="sc-top">${lgo(own, 18)}<i class="sc-cr">${IC.crown}</i><span class="sc-tm num">${IC.clock}2:14</span><span class="sc-hr num">${IC.heart}${h.l}</span></div>
      <div class="l2-mid">${h.img ? `<div class="l2-img" style="--art:url('${IMG(h.img)}')"></div><p class="l2-cap">${esc(h.t)}</p>` : `<p class="l2-txt">${esc(h.t)}</p>`}</div>
      <div class="l2-by">${ava}<b>${esc(h.n)}</b>${lgo(h.k, 14)}<span class="sc-at num">${MOM[0].t}</span></div></div>`;
    const hints = `<div class="l2-hints"><p>${IC.heart}<span>На экране — самый залайканный коммент матча</span></p>
      <p>${IC.crown}<span>${TM[own].name} держат экран 2:14 · ${TM[ch].name} не хватает <b class="num">${need} ♥</b>, чтобы перебить</span></p>
      <p>${IC.pen}<span>Пиши за свою команду — лайки поставят тебя на экран</span></p></div>`;
    const score = `<div class="sc-score"><span class="${own === 'a' ? 'is-own' : ''}">${lgo('a', 18)}<b class="num">${HL.a.l}</b></span><i>${IC.vs}</i><span class="${own === 'b' ? 'is-own' : ''}"><b class="num">${HL.b.l}</b>${lgo('b', 18)}</span></div>`;
    const chal = `<div class="sc-ch">${lgo(ch, 16)}<span class="sc-chb"><i style="width:${Math.round(HL[ch].l / h.l * 100)}%"></i></span><b class="num">−${need}</b><button class="sc-ib sc-ib--${ch}" data-dc="steal" data-v="${ch}" title="Помочь ${TM[ch].name} перебить">${IC.heart}</button></div>`;
    const join = ST.side ? `<button class="sc-in" data-a="toast" data-v="Написать (демо)">${lgo(ST.side, 14)}<span></span>${IC.pen}</button>`
      : `<div class="sc-pick"><i title="За кого болеешь?">${IC.q}</i>${['a', 'b'].map(k => `<button data-dc="side" data-v="${k}" title="Я за ${TM[k].name}">${lgo(k, 20)}</button>`).join('')}</div>`;
    const chat = `<div class="sc-feed">${FEED.slice(0, 6).map(([k, u, t]) => `<p>${lgo(k, 12)}<b>${esc(u)}</b>${esc(t)}</p>`).join('')}</div>`;
    return { title: 'Экран трибун', hd: `<span class="tb2-on">${IC.users}<b class="num">2 418</b></span>`, min: `${screen}${hints}${join}`, full: `${screen}${hints}${score}${chal}${chat}${join}` }; };

  // ---- v31 экран ТВ + LED, голосование лайками ----
  const CAND = window.DB_FAKE?.memes ?? [{ k: 'a', n: 'roshan_enjoyer', t: 'Когда Yatoro купил шестой слот на 24-й минуте', img: 'terrorblade', l: 1240 },
    { k: 'b', n: 'satanic_fan', t: 'Satanic с BKB ещё всем покажет, рано хороните', img: 'storm_spirit', l: 1235 },
    { k: 'a', n: 'bkb_timing', t: 'Collapse на Марсе — лучший инициатор турнира', l: 655 }, { k: 'b', n: 'glhf_dota', t: 'Если Vision не заберут мид сейчас — карта всё', l: 402 },
    { k: 'b', n: 'nix_pls', t: 'Миду Vision нужен Блинк, а не третий предмет на ману', l: 377 }];
  const CAND_PRE = [{ k: 'a', n: 'yatoro_army', t: 'Spirit заберут серию 2:0 — Yatoro в форме, Vision без шансов', img: 'terrorblade', l: 860 },
    { k: 'b', n: 'satanic_fan', t: 'Vision в сетке ни разу не проиграли первую карту. Ставлю на 2:1 за Vision', img: 'storm_spirit', l: 812 },
    { k: 'a', n: 'collapse_gg', t: 'Collapse на Марсе снова решит первую драку', l: 410 }, { k: 'b', n: 'vision_fam', t: 'Драфт Vision всегда сильнее на первой карте', l: 266 },
    { k: 'a', n: 'pos5_life', t: 'Ждём Рошана на 20-й, как в прошлой встрече', l: 180 }];
  let PREV = false; // до матча — для текущей перерисовки (читаем у виджета data-pre)
  const mix = () => { const by = [...(PREV ? CAND_PRE : CAND)].sort((x, y) => y.l - x.l), h = by[0];
    const ava = AVA[h.n] ? `<img class="l2-av" src="${AVA[h.n]}" alt="" />` : `<i class="l2-av l2-av--t">${esc(h.n[0].toUpperCase())}</i>`;
    const F = window.MX_FRAME, screen = `${F ? '<div class="mx-body">' : ''}<div class="sc sc--tv mx${F ? ' mx--frame' : ''}"><div class="sc-pic" style="--art:url('${IMG(h.img || 'storm_spirit')}')"></div>${F ? '' : '<span class="sc-live">● LIVE</span>'}
      <div class="sc-top mx-top">${lgo(h.k, 18)}<i class="sc-cr">${IC.crown}</i><span class="sc-tm num">${IC.clock}${PREV ? 'до старта 1:24' : '2:14'}</span><span class="sc-hr num">${IC.heart}${h.l}</span>${F ? (PREV ? '<span class="mx-live mx-pre">ДО МАТЧА</span>' : '<span class="mx-live">● LIVE</span>') : ''}</div>
      <div class="mx-led">${window.MX_STATIC ? `<p class="mx-st">${esc(h.t)}</p>` : `<div class="sc-led"><div class="sc-run"><span>${esc(h.t)}</span><span aria-hidden="true">${esc(h.t)}</span></div></div>`}
      <div class="l2-by">${ava}<b>${esc(h.n)}</b><span class="sc-at num">${PREV ? 'прогноз' : MOM[0].t}</span></div></div></div>${F ? '</div>' : ''}`;
    const how = `<p class="mx-how">${IC.heart}<span><b>Голосование лайками:</b> на экране — коммент с наибольшим числом ♥. Лайкай, чтобы перебить.</span></p>`;
    const list = `<div class="mx-list"><div class="mx-lh"><span>Претенденты</span><small>до экрана</small></div>${by.slice(1).map(c => `<div class="mx-c">${lgo(c.k, 14)}<p><b>${esc(c.n)}</b>${esc(c.t)}</p><small class="num">−${h.l - c.l + 1}</small><button class="mx-like" data-dc="vl" data-v="${c.n}">${IC.heart}<span class="num">${c.l}</span></button></div>`).join('')}</div>`;
    const join = ST.side ? `<button class="sc-in" data-a="toast" data-v="Написать (демо)">${lgo(ST.side, 14)}<span>Написать коммент</span>${IC.pen}</button>`
      : `<div class="sc-pick"><i title="За кого болеешь?">${IC.q}</i>${['a', 'b'].map(k => `<button data-dc="side" data-v="${k}" title="Я за ${TM[k].name}">${lgo(k, 20)}</button>`).join('')}</div>`;
    // v34: чат вместо списка претендентов — свои сообщения сверху ленты новых
    const chatX = `<div class="mc-feed">${[...ST.mine.map(t => ({ k: ST.side || 'a', n: 'ты', t, l: 0, me: 1 })), ...CAND.slice(1), ...FEED.map(([k, n, t], i) => ({ k, n, t, l: [48, 12, 31, 7, 22, 3, 15, 9][i] }))].slice(0, 9)
      .map(c => `<div class="mc-m${c.me ? ' is-me' : ''}">${lgo(c.k, 14)}<p><b>${esc(c.n)}</b>${esc(c.t)}</p><button class="mx-like" data-dc="vl" data-v="${esc(c.n)}">${IC.heart}<span class="num">${c.l}</span></button></div>`).join('')}</div>`;
    const field = `<form class="mc-in" data-dc-form>${['a', 'b'].map(k => `<button type="button" class="mc-tm${ST.side === k ? ' on' : ''}" data-dc="side" data-v="${k}" title="Я за ${TM[k].name}">${lgo(k, 16)}</button>`).join('')}<input name="t" placeholder="Написать в чат…" autocomplete="off" /><button class="mc-send" title="Отправить">${IC.pen}</button></form>`;
    // v39–v42: скины стрим-чатов; цвет ника — от ника, как в Twitch
    const NC = { twitch: ['#ff4500', '#1e90ff', '#9acd32', '#ff69b4', '#daa520', '#00ff7f', '#8a2be2', '#5f9ea0'], kick: ['#53fc18', '#ff3cac', '#00e5ff', '#ffd400', '#ff7a00', '#b388ff'], vk: ['#4f9cff'] };
    const ncol = (sk, n) => { const pal = NC[sk] || ['#aaa']; return pal[[...n].reduce((a, ch) => a + ch.charCodeAt(0), 0) % pal.length]; };
    const TT = ['31:12', '31:12', '31:11', '31:10', '31:10', '31:09', '31:08', '31:08', '31:07', '31:06'];
    var skin = (c, pic, lk) => { const sk = window.CH_SKIN, nm = c.own ? 'ты' : c.n, i = (skin.i = (skin.i || 0) + 1) % TT.length;
      if (sk === 'yt') return `<div class="sk-r sk-yt">${av(nm)}<p><b>${esc(nm)}</b>${c.k ? lgo(c.k, 12) : ''} ${esc(c.t)}</p>${pic(c)}${lk(c)}</div>`;
      if (sk === 'kick') return `<div class="sk-r sk-kick"><small class="num">${TT[i]}</small><p>${lgo(c.k, 12)}<b style="color:${ncol('kick', nm)}">${esc(nm)}</b><span>:</span> ${esc(c.t)}</p>${pic(c)}${lk(c)}</div>`;
      if (sk === 'vk') return `<div class="sk-r sk-vk">${av(nm)}<div class="sk-vb"><b>${esc(nm)} ${lgo(c.k, 12)}</b><p>${esc(c.t)}</p>${pic(c)}</div>${lk(c)}</div>`;
      if (sk === 'twk') return `<div class="sk-r sk-tw sk-twk"><p>${lgo(c.k, 14)}<b style="color:${ncol('kick', nm)}">${esc(nm)}</b><span>:</span> ${esc(c.t)}</p>${pic(c)}<small class="sk-t num">${TT[i]}</small>${lk(c)}</div>`;
      return `<div class="sk-r sk-tw"><p>${lgo(c.k, 14)}<b style="color:${ncol('twitch', nm)}">${esc(nm)}</b><span>:</span> ${esc(c.t)}</p>${pic(c)}${lk(c)}</div>`; };
    // v35–v37: чат с картинками; лайк — маленький; пояснение закрывается крестиком, в раскрытом — «?» в шапке
    if (window.CH) { const v = window.CH, IMGS = { satanic_fan: 'storm_spirit', larl_fan: 'puck', nix_pls: 'invoker' };
      const msgs = [...ST.mine.map(m => ({ k: ST.side || 'a', n: 'ты', t: m.t, img: m.img, own: 1, l: 0 })), ...(PREV ? CAND_PRE : CAND).slice(1).map(c => ({ ...c, img: IMGS[c.n] ? IMG(IMGS[c.n]) : '' })),
        ...FEED.map(([k, n, t], i) => ({ k, n, t, l: [48, 12, 31, 7, 22, 3, 15, 9][i], img: IMGS[n] ? IMG(IMGS[n]) : '' }))];
      const list0 = v === 'cards' && ST.sort !== 'new' ? [...msgs].sort((x, y) => y.l - x.l) : msgs, list = window.CH_V50 ? [...list0, ...MORE] : list0;
      const lk = c => `<button class="ch-lk" data-dc="vl" data-v="${esc(c.n)}">${IC.heart}<span class="num">${c.l}</span></button>`;
      const pic = (c, big) => c.img ? `<img class="ch-img${big ? ' is-big' : ''}" src="${c.img}" alt="" />` : '';
      const row = c => v === 'bubble' ? `<div class="ch-b${c.own ? ' is-own' : ''}">${c.own ? '' : lgo(c.k, 16)}<div class="ch-bw"><div class="ch-bb">${c.own ? '' : `<b>${esc(c.n)}</b>`}${pic(c, 1)}${c.t ? `<p>${esc(c.t)}</p>` : ''}</div>${lk(c)}</div></div>`
        : v === 'cards' ? `<div class="ch-c">${pic(c, 1)}<div class="ch-cr">${lgo(c.k, 14)}<p><b>${esc(c.n)}</b>${esc(c.t)}</p>${lk(c)}</div></div>`
        : window.CH_SKIN ? skin(c, pic, lk)
        : `<div class="ch-l${c.own ? ' is-own' : ''}">${lgo(c.k, 12)}<p><b>${esc(c.n)}</b>${esc(c.t)}</p>${pic(c)}${lk(c)}</div>`;
      const top = window.CH_SKIN === 'yt' ? `<div class="sk-ytt"><b>Топ-чат</b>${SV('<path d="m6 9 6 6 6-6"/>', 12)}</div>` : v === 'cards' ? `<div class="pr-seg ch-seg"><button data-dc="sort" data-v="top" class="${ST.sort !== 'new' ? 'on' : ''}">Топ</button><button data-dc="sort" data-v="new" class="${ST.sort === 'new' ? 'on' : ''}">Новые</button></div>` : '';
      const prev = ST.draft ? `<div class="ch-prev"><img src="${ST.draft}" alt="" /><button type="button" data-dc="undraft" aria-label="Убрать">×</button></div>` : '';
      const field = `${prev}<form class="mc-in${window.CH_SEG ? ' mc-in--ours' : ''}" data-dc-form>${window.CH_SEG ? `<span class="mc-seg" role="radiogroup" aria-label="Болею за">${['a', 'b'].map(k => `<button type="button" class="${(ST.side || 'a') === k ? 'on' : ''}" data-dc="side" data-v="${k}" title="Болею за ${TM[k].name}" aria-pressed="${(ST.side || 'a') === k}">${lgo(k, 16)}</button>`).join('')}</span>` : ['a', 'b'].map(k => `<button type="button" class="mc-tm${ST.side === k ? ' on' : ''}" data-dc="side" data-v="${k}" title="Я за ${TM[k].name}">${lgo(k, 16)}</button>`).join('')}
        <input name="t" placeholder="Написать или вставить картинку…" autocomplete="off" /><label class="mc-send ch-clip" title="Картинка">${SV('<path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L14.5 7"/>', 15)}<input type="file" accept="image/*" data-dc-file hidden /></label><button class="mc-send" title="Отправить">${IC.pen}</button></form>`;
      const hint = ST.nohint ? '' : `<p class="mx-how ch-how">${IC.heart}<span><b>Голосование лайками:</b> на экране — сообщение с наибольшим ♥</span><button data-dc="nohint" aria-label="Скрыть">×</button></p>`;
      const q = `<span class="ch-hd">${IC.users}<b class="num">2 418</b><i class="ch-q" title="Голосование лайками: на экране — сообщение с наибольшим ♥. Лайкай, чтобы перебить">${IC.q}</i></span>`;
      if (window.CH_V45) { const SEND = SV('<path d="M4 12 20 4l-6 16-2.5-6.5z"/><path d="m11.5 13.5 3-3"/>', 15);
        const field2 = field.replace(`<button class="mc-send" title="Отправить">${IC.pen}</button>`, `<button class="mc-send" title="Отправить" aria-label="Отправить">${SEND}</button>`);
        const hint2 = `<p class="mx-how">${IC.heart}<span><b>Голосование лайками:</b> на экране — ${PREV ? 'лучший прогноз до матча' : 'сообщение с наибольшим ♥'}</span></p>`;
        const foot = grip => `<div class="ch-foot${window.CH_V46 ? ' ch-foot--v46' : ''}"><span class="ch-on">${IC.users}<b class="num">2 418</b></span>${grip ? `<button class="ch-grip${window.CH_V46 ? ' ch-grip--dots' : ''}" data-dc-grip aria-label="Потяни, чтобы изменить высоту чата">${window.CH_V46 ? '<i></i><i></i><i></i><i></i><i></i><i></i>' : '<i></i>'}</button>` : ''}</div>`;
        return { noHd: true, min: window.CH_V48 ? `<div class="ch2 ch2--min"><div class="ch2-l">${screen}${hint2}</div>${window.CH_V50 ? `<div class="ch2-r ch2-only-wide ch2-r--abs"><div class="ch2-abs"><div class="ch-feed ch-feed--${v} ch-feed--fill ch-feed--soft" data-dc-bottom>${[...list].reverse().map(row).join('')}</div>${field2}</div></div>` : `<div class="ch2-r ch2-only-wide"><div class="ch-feed ch-feed--${v} ch-feed--fill${window.CH_V49 ? ' ch-feed--few' : ''}">${(window.CH_V49 ? list.slice(0, 5).reverse() : list).map(row).join('')}</div>${field2}</div>`}</div>${foot(0)}` : `${screen}${hint2}${foot(0)}`, full: window.CH_V47 ? `<div class="ch2"><div class="ch2-l">${screen}${hint2}</div><div class="ch2-r">${top}<div class="ch-feed ch-feed--${v} ch-feed--rs" style="height:${ST.fh}px">${list.map(row).join('')}</div>${field2}</div></div>${foot(1)}` : `${screen}${hint2}${top}<div class="ch-feed ch-feed--${v} ch-feed--rs" style="height:${ST.fh}px">${list.map(row).join('')}</div>${field2}${foot(1)}` }; }
      return { title: 'Экран трибун', hd: q, min: `${screen}${hint}`, full: `${screen}${top}<div class="ch-feed ch-feed--${v}${window.CH_SM ? ' ch-feed--sm' : ''}">${list.slice(0, 8).map(row).join('')}</div>${field}` }; }
    if (window.MX_CHAT) return { title: 'Экран трибун', hd: `<span class="tb2-on">${IC.users}<b class="num">2 418</b></span>`, min: `${screen}${how}`, full: `${screen}${how}${chatX}${field}` };
    return { title: 'Экран трибун', hd: `<span class="tb2-on">${IC.users}<b class="num">2 418</b></span>`, min: `${screen}${how}`, full: `${screen}${how}${list}${join}` }; };

  const NEW = { report, duel, story, tribes, wave, prophet, pin2, gate, board, board2, led, tv, ttx, led2, mix };
  const body = () => { const v = window.DISC; return v === 'tl' ? tl() : v === 'chat' ? chat() : v === 'pulse' ? pulse() : v === 'groups' ? groups() : ''; };
  const draw = w => { PREV = (w.closest('[data-pre]') || {}).dataset?.pre === '1'; w.className = 'w dc dc--' + window.DISC;
    if (NEW[window.DISC]) { const r = NEW[window.DISC](); w.innerHTML = r.noHd ? `<div class="dc-min">${r.min}</div><div class="dc-full">${r.full}</div>` : `<div class="dc-hd"><b>${r.title}</b>${r.hd || `<small class="num"><i class="dc-live"></i>${MOM.reduce((a, m) => a + m.n, 0)} комментов</small>`}</div><div class="dc-min">${r.min}</div><div class="dc-full">${r.full}</div>`; requestAnimationFrame(() => w.querySelectorAll('[data-dc-bottom]').forEach(f => f.scrollTop = f.scrollHeight)); return; }
    w.innerHTML = `<div class="dc-hd"><b>Обсуждение</b><small class="num"><i class="dc-live"></i>${MOM.reduce((a, m) => a + m.n, 0)} комментов</small></div>${card(MOM[0])}${window.DISC === 'drawer' ? '' : `<div class="dc-body">${body()}</div>`}`; };
  let host;
  window.GS_PROMO = (el, M) => { host = el; el.dataset.pre = M && M.state === 'pre' ? '1' : '0'; el.dataset.wxKey = 'dc'; window.DISC === 'drawer' ? (el.className = '', draw(el)) : WXKey(el, draw, '.dc-hd', false); };
  const redraw = () => { const w = host && (host.querySelector('.wx-p > .w') || host); w && draw(w); };
  // v19: сторис листаются сами каждые 6 с; навёл мышь — пауза; после ручного листания — заново 6 с
  // v21: волна сама растёт — чат продолжает спамить
  if (window.DISC === 'wave') setInterval(() => { ST.wn += 3 + Math.floor(Math.random() * 9); host && host.querySelectorAll('[data-wv]').forEach(x => x.textContent = '×' + (WAVES[0].n + ST.wn).toLocaleString('ru')); }, 700);
  if (window.DISC === 'story') setInterval(() => { if (!host || host.matches(':hover') || Date.now() - (ST.sr || 0) < 6000) return; ST.si = (ST.si + 1) % MOM.length; redraw(); }, 6000);

  // v34: своё сообщение — Enter в поле чата
  // v34–v37: своё сообщение — Enter в поле чата; v35–v37 — с картинкой (📎 или Ctrl+V), mine — { t, img }
  document.addEventListener('submit', e => { const f = e.target.closest('[data-dc-form]'); if (!f) return; e.preventDefault(); const t = f.t.value.trim(); if (!t && !ST.draft) return;
    ST.mine.unshift(window.CH ? { t, img: ST.draft } : t); ST.draft = ''; ST.sort = 'new'; redraw(); host && host.querySelector('.mc-in input[name=t]')?.focus(); });
  // v45: ручка внизу — тянешь вверх / вниз, высота чата 120–520 (без перерисовки, запоминается в ST.fh)
  document.addEventListener('pointerdown', e => { const g = e.target.closest('[data-dc-grip]'); if (!g) return; e.preventDefault();
    const f = g.closest('.dc-full').querySelector('.ch-feed--rs'), y0 = e.clientY, h0 = f.offsetHeight;
    const mv = ev => { ST.fh = Math.max(120, Math.min(520, h0 + ev.clientY - y0)); f.style.height = ST.fh + 'px'; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); document.body.classList.remove('ch-drag'); };
    document.body.classList.add('ch-drag'); addEventListener('pointermove', mv); addEventListener('pointerup', up); });
  const takeImg = file => { if (!file || !file.type.startsWith('image/')) return; ST.draft = URL.createObjectURL(file); redraw(); };
  document.addEventListener('change', e => { if (e.target.matches('[data-dc-file]')) takeImg(e.target.files[0]); });
  document.addEventListener('paste', e => { if (!e.target.closest || !e.target.closest('[data-dc-form]')) return; const it = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/')); if (it) { e.preventDefault(); takeImg(it.getAsFile()); } });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dc]'); if (!b) return;
    const a = b.dataset.dc, v = b.dataset.v;
    if (a === 'like') { b.classList.toggle('on'); const s = b.querySelector('span'); s.textContent = +s.textContent + (b.classList.contains('on') ? 1 : -1); return; }
    if (a === 'drx') return document.querySelector('.dc-dr').classList.remove('on');
    if (a === 'go') {
      if (window.DISC === 'drawer') return drawer(v);
      // раскрыт — момент в своём варианте; свёрнут — раскрыть виджет
      ST.open = v; ST.chip = v; const box = host && host.closest('.wx') || host; if (box && box.classList.contains('is-c')) { box.querySelector('.wx-fl2')?.click(); }
      return setTimeout(redraw, 0);
    }
    if (a === 'tl' || a === 'pk') ST.open = ST.open === v && a === 'tl' ? null : v;
    if (a === 'chip') ST.chip = v;
    if (a === 'side') ST.side = v;
    if (a === 'nohint') ST.nohint = true;
    if (a === 'undraft') ST.draft = '';
    if (a === 'sort') ST.sort = v;
    // v31: лайк претенденту — +1; набрал больше лидера — занимает экран (перерисовка)
    if (a === 'vl') { const c = CAND.find(q => q.n === v); if (!c) { const sp = b.querySelector('span'); b.classList.toggle('on'); sp.textContent = +sp.textContent + (b.classList.contains('on') ? 1 : -1); return; } if (!b.classList.contains('on')) { c.l++; b.classList.add('on'); } }
    if (a === 'hlv') ST.hlv = v;
    if (a === 'steal') ST.board = v;
    // волна: нажал то же слово, что волна, подряд за 2 с — комбо растёт; эмодзи взлетает
    if (a === 'wv') { const now = Date.now(); ST.combo = v === WAVES[0].w && now - ST.last < 2000 ? ST.combo + 1 : v === WAVES[0].w ? 1 : 0; ST.last = now; if (v === WAVES[0].w) ST.wn++;
      const f = document.createElement('i'); f.className = 'pr-fly'; f.textContent = b.querySelector('span').textContent; b.appendChild(f); setTimeout(() => f.remove(), 900);
      const c = host && host.querySelectorAll('[data-wv]'); c && c.forEach(x => x.textContent = '×' + (WAVES[0].n + ST.wn).toLocaleString('ru')); return; }
    if (a === 'vote') { const [t, k] = v.split('|'); ST.vote[t] = k; }
    if (a === 'sr') { ST.si = (ST.si + +v + MOM.length) % MOM.length; ST.sr = Date.now(); }
    redraw();
  });
})();
