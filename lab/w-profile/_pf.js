// w-profile — созвон 05.11, задача 9.1 (начальник 10:00: «где вот профиль — покажем, как будто пользователь вошёл, и покажем его кошелёк с баллами, которые он за прогнозы получил»).
// Логика не работает — пример: баланс, «в игре» и история — числа-заглушки. Вошёл по умолчанию: нет ?auth= — ставим auth=in (переключатель «Зритель» песочницы работает как раньше).
// PF — вид в шапке сайта (вместо кружка «Я»):
//   chip — кошелёк «◎ 1 240» отдельной кнопкой + аватар · pill — одна капсула: аватар, ник, баллы под ником ·
//   pm — как Polymarket: «Баллы» и «В игре» колонками, потом аватар · pop — как chip, по клику — карточка: баланс, этот матч, последние прогнозы
(() => {
  const u = new URL(location.href); if (!u.searchParams.has('auth')) { u.searchParams.set('auth', 'in'); history.replaceState(history.state, '', u); }
  const PF = window.PF || 'chip', ME = { nick: 'goat_fan', bal: 1240, live: 150, match: 80 };
  const n = v => v.toLocaleString('ru-RU').replace(/ /g, ' ');
  const COIN = '<svg class="pf-coin" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7"/><circle cx="8" cy="8" r="4"/></svg>';
  // дирижёр 06.11 (финальная проверка): аватар — картинка «из доты, доброе» — Snapfire (бабушка с печеньем), вместо буквы
  const AV = `<span class="pf-av pf-av--img"><img src="../gs-match/img/heroes/snapfire.png" alt=""></span>`;
  const WAL = `<span class="pf-w">${COIN}<b class="num">${n(ME.bal)}</b></span>`;
  const team = s => { const t = document.querySelector(`.d3-five.${s} .d3-tm`); return t ? t.title : s === 'a' ? 'Команда 1' : 'Команда 2'; };
  const html = () => {
    if (PF === 'pill') return `<button class="pf pf--pill" data-a="toast" data-v="Профиль (демо)" aria-label="Профиль · ${n(ME.bal)} баллов">${AV}<span class="pf-tx"><b>${ME.nick}</b><small>${COIN}<span class="num">${n(ME.bal)}</span> баллов</small></span></button>`;
    if (PF === 'pm') return `<span class="pf pf--pm"><button class="pf-st" data-a="toast" data-v="Баллы за прогнозы (демо)"><small>Баллы</small><b class="num">${n(ME.bal)}</b></button><button class="pf-st" data-a="toast" data-v="Баллы в открытых прогнозах (демо)"><small>В игре</small><b class="num">${n(ME.live)}</b></button><button class="pf-me" data-a="toast" data-v="Профиль (демо)" aria-label="Профиль">${AV}</button></span>`;
    if (PF === 'pop') return `<span class="pf pf--chip pf--pop"><button class="pf-btn" data-pf="open" aria-expanded="false" aria-label="Кошелёк и профиль">${WAL}${AV}</button>
      <div class="pf-card" role="dialog" aria-label="Кошелёк">
        <div class="pf-hd">${AV}<span><b>${ME.nick}</b><small>вошёл через Telegram</small></span></div>
        <div class="pf-bal"><small>Баллы за прогнозы</small><b class="num">${COIN}${n(ME.bal)}</b></div>
        <div class="pf-row"><span>Этот матч</span><b class="num pf-up">+${ME.match}</b></div>
        <div class="pf-row"><span>В игре — ждут итога</span><b class="num">${ME.live}</b></div>
        <ul class="pf-ls">
          <li><span>Map 1 — победа ${team('a')}</span><b class="num pf-up">+50</b></li>
          <li><span>Первая кровь до 3′</span><b class="num pf-up">+30</b></li>
          <li><span>Рошан до 20′</span><b class="num pf-wait">ждёт · 150</b></li>
        </ul>
        <div class="pf-ft"><button data-a="toast" data-v="История баллов (демо)">История баллов</button><button data-a="toast" data-v="Выход (демо)">Выйти</button></div>
      </div></span>`;
    return `<span class="pf pf--chip"><button class="pf-btn" data-a="toast" data-v="Кошелёк: баллы за прогнозы (демо)" aria-label="${n(ME.bal)} баллов">${WAL}</button><button class="pf-me" data-a="toast" data-v="Профиль (демо)" aria-label="Профиль">${AV}</button></span>`;
  };
  // v5–v8 (дирижёр 05.11: «более интересные решения… подумаем над всем хедером») — PF_HD, вся шапка сайта:
  //   bet — как Polymarket / Kalshi: бренд · разделы · поиск полем · кошелёк · «Мои прогнозы 3» · аватар ·
  //   fly — живой кошелёк: ответил на прогноз в колонке — «+N» летит в кошелёк и висит «в игре», через 6 с «угадал» — баланс досчитывает ·
  //   lvl — уровень и серия: кольцо уровня вокруг аватара, огонёк «3» — угадано подряд, по наведению — подсказка ·
  //   tick — над шапкой строка матчей (как ESPN): идущие, ближайшие и последние, этот — подсвечен
  const HD = window.PF_HD || '', DESK = () => document.body.classList.contains('is-desk');
  // дирижёр 06.11 (финальная проверка): шапка как на матче — и на страницах турнира и новостей (header.portal); раздел — тот, что был выделен в шапке страницы
  const navH = (cur = 'Матчи') => ['Матчи', 'Турниры', 'Фэнтези', 'Новости'].map(x => `<a href="#" ${x === cur ? `class="is-on" aria-current="page"${x === 'Матчи' ? ' data-a="back"' : ''}` : `data-a="toast" data-v="${x} — отдельный раздел (демо)"`}>${x}</a>`).join('');
  const NAV = navH();
  const SRCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>';
  const FIRE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5c.4 2.2 3.5 3.6 3.5 7.2A3.5 3.5 0 0 1 8 12.2a3.5 3.5 0 0 1-3.5-3.5c0-1.6.8-2.6 1.6-3.4.2 1.2.9 1.9 1.6 2.1C7.4 5.6 7.3 3.4 8 1.5z"/></svg>';
  const LV = { n: 6, cur: 1240, from: 1000, to: 1500, streak: 3 }, ring = () => { const r = 17, c = 2 * Math.PI * r, f = (LV.cur - LV.from) / (LV.to - LV.from);
    return `<span class="pf-lv"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${r}"/><circle cx="20" cy="20" r="${r}" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}"/></svg>${AV}<em class="num">${LV.n}</em></span>`; };
  const right = () => {
    if (HD === 'bet') return `<span class="pf pf--chip pf--bet"><button class="pf-btn" data-a="toast" data-v="Кошелёк: баллы за прогнозы (демо)">${WAL}</button><button class="pf-my" data-a="toast" data-v="Мои прогнозы: 3 ждут итога (демо)">Мои прогнозы<em class="num">3</em></button><button class="pf-me" data-a="toast" data-v="Профиль (демо)" aria-label="Профиль">${AV}</button></span>`;
    if (HD === 'lvl') return `<span class="pf pf--chip pf--lvl"><span class="pf-str" tabindex="0">${FIRE}<b class="num">${LV.streak}</b><span class="pf-tip">Угадано подряд — ${LV.streak}. Ещё один — ×1,5 к баллам</span></span><button class="pf-btn" data-a="toast" data-v="Кошелёк: баллы за прогнозы (демо)">${WAL}</button><span class="pf-me" tabindex="0">${ring()}<span class="pf-tip"><b>${ME.nick} · уровень ${LV.n}</b>До ${LV.n + 1}-го — ${n(LV.to - LV.cur)} баллов</span></span></span>`;
    // v9 (дирижёр 05.11: «берём живой кошелёк; при нажатии — карточка, только ровнее, не как v4; и строку поиска как v5»): fly2 — шапка v5 без «Мои прогнозы», кошелёк v6, по клику — ровная карточка
    if (HD === 'fly2') return `<span class="pf pf--chip pf--fly pf--pop pf--c2${INM ? ' pf-in--' + INM : ''}${window.PF_MONO ? ' pf-mono' : ''}"><button class="pf-btn" data-pf="open" aria-expanded="false" aria-label="Кошелёк"><span class="pf-w">${COIN}<b class="num pf-n">${n(BAL)}</b>${BOX ? '' : '<small class="pf-in num"></small>'}</span>${BOX ? '<small class="pf-in num"></small>' : ''}</button><button class="pf-me" data-a="toast" data-v="Профиль (демо)" aria-label="Профиль">${AV}</button><div class="pf-c2" role="dialog" aria-label="Кошелёк"></div></span>`;
    if (HD === 'fly') return `<span class="pf pf--chip pf--fly"><button class="pf-btn" data-a="toast" data-v="Кошелёк: баллы за прогнозы (демо)"><span class="pf-w">${COIN}<b class="num pf-n">${n(ME.bal)}</b><small class="pf-in num"></small></span></button><button class="pf-me" data-a="toast" data-v="Профиль (демо)" aria-label="Профиль">${AV}</button></span>`;
    return html(); };
  const tick = () => { const D = window.DB; if (!D || !D.matches) return ''; const all = D.matches(), cur = (window.GS_TOURNAMENT && 0) || '';
    const live = all.filter(m => m.state === 'live'), pre = all.filter(m => m.state === 'pre'), post = all.filter(m => m.state === 'post').reverse();
    const L = [...live, ...pre, ...post].slice(0, 10), nm = id => esc(D.name(id, 'tag') || D.name(id)), lg = id => `<img src="${esc(D.logo(id) || '')}" alt="" loading="lazy">`;
    const st = m => m.state === 'live' ? `<i class="pf-dot"></i>${esc(m.live || 'идёт')}` : m.state === 'pre' ? esc(new Date(m.start).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·')) : 'завершён';
    return `<div class="pf-tk" aria-label="Матчи"><span class="pf-tkh">Dota 2</span>${L.map((m, i) => `<a href="#" class="pf-tkm${i === 0 && m.state === 'live' ? ' on' : ''}" ${i === 0 && m.state === 'live' ? 'data-a="back"' : 'data-a="toast" data-v="Другой матч (демо)"'}>
      <span class="pf-tks">${st(m)}</span><span class="pf-tkr">${lg(m.a)}${nm(m.a)}<b class="num">${m.score ? m.score[0] : ''}</b></span><span class="pf-tkr">${lg(m.b)}${nm(m.b)}<b class="num">${m.score ? m.score[1] : ''}</b></span></a>`).join('')}</div>`; };
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // дирижёр 06.11: у гостя шапка та же (разделы, поиск), только вместо кошелька и аватара — «Войти»
  const full = pt => { const inb = pt.querySelector('.pt-in'), other = !pt.matches('#portal'); if (pt.querySelector('.pf') || (!pt.querySelector('.pt-me') && !inb)) return;
    const guest = other ? new URLSearchParams(location.search).get('auth') === 'guest' : inb && !pt.querySelector('.pt-me');
    const R = guest ? `<span class="pf pf--guest">${other ? '<button class="pt-in">Войти</button>' : inb.outerHTML}</span>` : null;
    const NV = other ? navH((pt.querySelector('.pt-nav .is-on') || {}).textContent || 'Матчи') : NAV;
    if (R && !(HD === 'bet' || HD === 'fly2')) return;
    if (HD === 'bet' || HD === 'fly2') pt.innerHTML = `<a class="pt-brand" href="#" data-a="toast" data-v="Главная GoatScout (демо)"><span class="pt-logo">◆</span>GoatScout</a>${DESK() ? `<nav class="pt-nav" aria-label="Разделы">${NV}</nav>` : ''}
      <button class="pf-q" data-a="toast" data-v="Поиск (демо)">${SRCH}<span>Матчи, команды, игроки</span>${DESK() ? '<kbd>/</kbd>' : ''}</button>${R || right()}`;
    else { const me = pt.querySelector('.pt-me'); me.insertAdjacentHTML('afterend', right()); me.remove(); }
    if (HD === 'tick' && !document.querySelector('.pf-tk')) pt.insertAdjacentHTML('beforebegin', tick()); };
  // MY — прогнозы для карточки: пример + те, что дал в колонке (ждут итога → через 6 с угадал)
  const MY = [{ q: 'Первая кровь до 3′', v: 30, ok: true }, { q: 'Map 1 — победа ' + 'Radiant', v: 50, ok: true, a: 1 }];
  const card2 = () => { const tA = team('a'); MY.forEach(x => { if (x.a) x.q = 'Map 1 — победа ' + tA; });
    const won = MY.filter(x => x.ok).reduce((a, x) => a + x.v, 0), rows = [...MY].reverse().slice(0, 4);
    return `<div class="pf-c2-top"><span><small>Баллы за прогнозы</small><b class="num">${COIN}${n(BAL)}</b></span></div>
      <div class="pf-c2-sum"><span><small>Этот матч</small><b class="num pf-up">+${won}</b></span><span><small>${INM ? INI + 'Зарезервировано' : 'В игре'}</small><b class="num">${n(IN)}</b></span></div>
      <div class="pf-c2-hd">Последние прогнозы</div>
      <ul class="pf-c2-ls">${rows.map(x => `<li><span>${esc(x.q)}</span>${x.ok ? `<b class="num pf-up">+${x.v}</b>` : `<b class="num pf-wait">ждёт · ${x.v}</b>`}</li>`).join('')}</ul>
      <button class="pf-c2-ft" data-a="toast" data-v="История баллов (демо)"><span>Вся история баллов</span><i>›</i></button>`; };
  const c2Paint = () => { const c = document.querySelector('.pf--c2.on .pf-c2'); if (c) c.innerHTML = card2(); };
  const paint = () => document.querySelectorAll('#portal, header.portal').forEach(full);
  // дирижёр 06.11: шапка «съехала» на телефоне — страница матча на телефоне сверстана на 412 px и ужата до ширины экрана (zoom у <html>),
  // турнир и новости — нет; их шапку делаем так же: 412 px и тот же коэффициент — размеры и места кнопок совпадают
  const zoomH = () => document.querySelectorAll('header.portal').forEach(h => { const ph = !DESK(), z = innerWidth / 412; h.style.zoom = ph && z < 1 ? z : ''; h.style.width = ph && z < 1 ? '412px' : ''; });
  addEventListener('resize', zoomH); new MutationObserver(zoomH).observe(document.body, { attributes: true, attributeFilter: ['class'] }); addEventListener('load', zoomH); zoomH();
  // fly: «+N» с кнопки прогноза в кошелёк
  // v10–v13 (дирижёр 05.11: «не „в игре“, а иконкой — средства зарезервированы, мелко; через слэш, отдельным боксом, иконкой „плэй“»): PF_IN — как показать баллы в открытых прогнозах
  //   slash — «1 240 / 150» · box — отдельный маленький бокс рядом с кошельком · play — значок ▶ и число внутри кошелька · lock — значок замка и число бейджем в углу кошелька
  const INM = window.PF_IN || '', PLAY = '<svg class="pf-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z"/></svg>', LOCK = '<svg class="pf-ic" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  // v14–v17 (дирижёр 05.11: «зарезервированное — наоборот радостнее, обводку, не плэй, а замочек; на основе v11 и v12»):
  //   box2 — бокс v11 с золотой обводкой и замком · box3 — бокс v11, обводка градиентом и песочные часы («ждёт итога») ·
  //   in2 — как v12, но правая часть кошелька — золотой сегмент с замком · in3 — как v12, стопка монет, золотым; добавилось — сегмент подпрыгивает
  // v18 (дирижёр 05.11: «v14 нравится, но ширина не должна прыгать от ширины цифр — может, моноширинные цифры»): PF_MONO — все цифры кошелька и карточки моноширинные (JetBrains Mono): ширина меняется только при новом разряде
  const HOUR = '<svg class="pf-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h8M4 14h8M5 2c0 3 6 3.5 6 6s-6 3-6 6M11 2c0 3-6 3.5-6 6s6 3 6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const STACK = '<svg class="pf-ic" viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="4" rx="5" ry="2"/><path d="M3 6.5c0 1.1 2.2 2 5 2s5-.9 5-2v2c0 1.1-2.2 2-5 2s-5-.9-5-2zM3 10.5c0 1.1 2.2 2 5 2s5-.9 5-2v2c0 1.1-2.2 2-5 2s-5-.9-5-2z"/></svg>';
  const BOX = ['box', 'box2', 'box3'].includes(INM), INI = { lock: LOCK, box2: LOCK, in2: LOCK, box3: HOUR, in3: STACK }[INM] || PLAY;
  let BAL = ME.bal, IN = INM ? ME.live : 0; let IN0 = IN; const setIn = () => { const el = document.querySelector('.pf--fly .pf-in'); if (!el) return; el.classList.toggle('on', !!IN);
    if (IN > IN0) { el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); } IN0 = IN;
    el.innerHTML = !IN ? '' : INM === 'slash' ? `<i>/</i>${n(IN)}` : INM ? `${INI}${n(IN)}` : `+${IN} в игре`; el.title = IN ? `${n(IN)} баллов в открытых прогнозах — вернутся с выигрышем или сгорят` : ''; };
  const count = (to) => { const el = document.querySelector('.pf--fly .pf-n'); if (!el) return; const from = BAL, t0 = performance.now(); BAL = to; const w = el.closest('.pf-w'); w.classList.add('is-up');
    const step = t => { const k = Math.max(0, Math.min(1, (t - t0) / 900)); /* rAF может дать время раньше t0 — без max баланс уходил в минус */ el.textContent = n(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); else setTimeout(() => w.classList.remove('is-up'), 600); }; requestAnimationFrame(step); };
  if (HD === 'fly' || HD === 'fly2') document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.w.pc [data-pc], .w.pc [data-conf]'); if (!b || b._pf) return;
    const m = (b.textContent.match(/\+\s?(\d+)/) || [])[1], pts = +(m || 30), to = document.querySelector('.pf--fly .pf-w'); if (!to) return; b._pf = 1;
    const a = b.getBoundingClientRect(), z = to.getBoundingClientRect(), f = document.createElement('span'); f.className = 'pf-fl num'; f.innerHTML = `${COIN}+${pts}`;
    f.style.left = a.left + a.width / 2 + 'px'; f.style.top = a.top + a.height / 2 + 'px'; document.body.append(f);
    requestAnimationFrame(() => { f.style.transform = `translate(${z.left + z.width / 2 - a.left - a.width / 2}px, ${z.top + z.height / 2 - a.top - a.height / 2}px) scale(.6)`; f.style.opacity = '.2'; });
    const qq = b.closest('.w.pc'), qt = qq && qq.querySelector('.pc-q b, .pc-bbh b'), it = { q: qt ? qt.textContent.trim() : 'Прогноз', v: pts, ok: false }; MY.push(it);
    setTimeout(() => { f.remove(); IN += pts; setIn(); c2Paint(); }, 700);
    setTimeout(() => { IN = Math.max(0, IN - pts); it.ok = true; setIn(); count(BAL + pts); c2Paint(); }, 6700); }, true);
  let q = 0; new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; paint(); setIn(); }); }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pf="open"]'), box = document.querySelector('.pf--pop');
    if (t) { const on = !box.classList.contains('on'); box.classList.toggle('on', on); c2Paint(); t.setAttribute('aria-expanded', on); return; }
    if (box && !e.target.closest('.pf-card, .pf-c2')) { box.classList.remove('on'); const b = box.querySelector('[data-pf]'); b && b.setAttribute('aria-expanded', false); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const box = document.querySelector('.pf--pop.on'); box && box.classList.remove('on'); } });
})();
