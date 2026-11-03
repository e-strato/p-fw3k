// news v4 «Тема как матч» (дирижёр 30.10: «скудновато — бери то, что видели в разборе»). Лента и тема из _ndata.js, плюс что взяли у референсов (Figma стр. 308:389):
//   Particle — коллаж картинок в шапке темы, имена команд и игроков подсвечены в тексте, «Цитаты» каруселью, «Вопросы» с ответом;
//   Ground News — полоса под каждой темой (у нас — трибуны: за кого болеют), «Темы» с подпиской (+); Google News — хронология; X — «Мнения».
// Матч темы — со спарклайном перевеса по золоту (реальные данные карты 3). ‼️ Цитаты, посты, вопросы, трибуны, читатели — пример.
(() => {
  const N = window.NEWS, D = window.GS_DATA, NM = window.GS_NAMES || { NAME: {}, SHORT: {} }, IMG = '../gs-match/';
  const CFG = { view: 'phone', screen: 'feed', id: 'vis-spi', vote: null, follow: { 7119388: true, 'The International 2026': true } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const team = t => typeof t === 'number' ? { id: t, name: NM.NAME[t], short: NM.SHORT[t], logo: (D.teams[t] || {}).logo } : { id: t, name: t, short: t, logo: '' };
  const k = v => (Math.abs(v) / 1000).toFixed(1) + 'k';
  const S = D.series[2], M3 = S.maps[2], T = 2010, RAD = M3.radiant_team_id, DIR = M3.dire_team_id;
  const P = id => D.players[id] || {};
  const HERO = id => D.heroes[id];
  // Particle: имена в тексте подсвечены — команды и игроки матча
  const ENT = [...new Set([...Object.values(NM.NAME), ...Object.values(NM.SHORT), ...M3.players.map(p => P(p.account_id).name), 'OG', 'GamerLegion', 'PARIVISION', '1win', 'RAMZES666', 'ESL', 'Valve', 'Рошан', 'Templar Assassin'])].filter(s => s && s.length > 3).sort((a, b) => b.length - a.length);
  const RE = new RegExp('(' + ENT.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  const hl = s => esc(s).replace(RE, '<a class="r-ent" href="#">$1</a>');

  // ‼️ пример — дополнения к темам: коллаж, трибуны, цитаты, X, вопросы, читатели
  const picks = M3.players.map(p => HERO(p.hero_id).img);
  const pool = Object.values(D.heroes).map(h => h.img);
  const pickN = (seed, n) => Array.from({ length: n }, (_, i) => pool[(seed * 37 + i * 53) % pool.length]);
  const pl = (rad, i) => M3.players.filter(p => p.isRadiant === rad)[i];
  const EXTRA = {
    'vis-spi': { imgs: [picks[5], picks[1], picks[7], picks[2], picks[0]], fans: [61, 39], who: [RAD, DIR], read: '2.4k читают',
      quotes: [[pl(true, 1), 'Мы знали, что вторую карту надо забирать любой ценой. Третья — наша игра.', 'Twitch Spirit', 41], [pl(false, 0), 'Отдали Рошана слишком дёшево. Ещё не конец — у нас лейт.', 'интервью между картами', 23], [pl(true, 2), 'Templar Assassin на мид — это не пик, это заявление.', 'X', 18]],
      x: [['Dota Memes', '@dotamemes', 'Spirit берут Templar Assassin третий раз подряд, а Vision всё ещё не банят 😭', '12.4k'], ['Аналитик NS', '@ns_dota', 'После Рошана у Spirit 8.7k — с таким перевесом на TI карты не отдают. 85% на Spirit.', '3.1k'], ['Vision Fans', '@visionfam', 'Верим до трона. Лейт за нами 💙', '980']],
      qs: [['Сколько длится третья карта?', '33 минуты 30 секунд — Spirit ведут по золоту на 8.7k и забрали Рошана на 31-й минуте.'], ['Кто сыграет в финале верхней сетки?', 'Победитель серии — с Team Falcons. Проигравший уходит в нижнюю сетку.'], ['Как Spirit и Vision играли раньше?', 'В группе Vision выиграли 2:0. До этого счёт личных встреч в сезоне — 3:2 в пользу Spirit.']] },
    'og-gl': { imgs: pickN(3, 4), fans: [44, 56], who: ['OG', 'GamerLegion'], read: '860 читают' },
    'ramzes': { imgs: pickN(7, 3), read: '1.1k читают' },
    'yan-pv': { imgs: pickN(11, 4), fans: [58, 42], who: [9823272, 'PARIVISION'], read: '540 читают' },
    'patch': { imgs: pickN(17, 5), read: '2.0k читают' },
    'bb': { imgs: pickN(21, 3), read: '700 читают' },
    'esl': { imgs: pickN(29, 3), read: '410 читают' },
  };
  const X = x => EXTRA[x.id] || { imgs: pickN(1, 3) };

  // ── куски ─────────────────────────────────────────────────────────────
  const logo = t => { const x = team(t); return x.logo ? `<img src="${IMG + x.logo}" alt="">` : `<i class="r-nol">${esc(x.name[0])}</i>`; };
  const collage = (imgs, big) => `<div class="r-col${big ? ' is-big' : ''}">${imgs.slice(0, big ? 5 : 3).map((s, i) => `<span style="--i:${i}"><img src="${IMG + s}" alt=""></span>`).join('')}</div>`;
  // Ground News: полоса под темой — у нас трибуны: сколько болеют за каждую команду
  const fans = (x, vote) => { const e = X(x); if (!e.fans) return ''; const [a, b] = e.fans, [A, B] = e.who.map(team);
    return `<div class="r-fans"><div class="r-fbar"><i style="width:${a}%"></i><i style="width:${b}%"></i></div><div class="r-fl num"><span>${logo(A.id)}${esc(A.short)} ${a}%</span><span>${b}% ${esc(B.short)}${logo(B.id)}</span></div>
      ${vote ? `<div class="r-vote">${CFG.vote ? `<span>Ты за <b>${esc(team(CFG.vote).short)}</b> — учтено в трибунах</span>` : `<span>За кого ты?</span><button data-vote="${A.id}">${esc(A.short)}</button><button data-vote="${B.id}">${esc(B.short)}</button>`}</div>` : ''}</div>`; };
  const srcs = x => { const u = [...new Set(x.src.map(s => s[0]))]; return `<span class="r-srcs">${u.slice(0, 3).map(s => `<i title="${esc(s)}">${esc(s[0].toUpperCase())}</i>`).join('')}<small>${esc(u[0])}${u.length > 1 ? ' +' + (u.length - 1) : ''}</small></span>`; };
  const meta = x => `<div class="r-meta">${x.live ? '<span class="r-live">LIVE</span>' : ''}<span>${esc([x.tour, x.ago].filter(Boolean).join(' · '))}</span></div>`;
  const ups = x => `${x.ups.length} ${x.ups.length === 1 ? 'обновление' : x.ups.length < 5 ? 'обновления' : 'обновлений'}`;
  // спарклайн перевеса карты 3 до «сейчас»: выше нуля — зелёный, ниже — красный
  function spark(w, h) {
    const a = M3.radiant_gold_adv.slice(0, Math.floor(T / 60) + 1), mx = Math.max(...a.map(Math.abs)), X = i => (i / (a.length - 1)) * w, Y = v => h / 2 - (v / mx) * (h / 2 - 3);
    const d = a.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('L');
    return `<svg class="r-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><clipPath id="su"><rect width="${w}" height="${h / 2}"/></clipPath><clipPath id="sd"><rect y="${h / 2}" width="${w}" height="${h / 2}"/></clipPath></defs>
      <line x1="0" x2="${w}" y1="${h / 2}" y2="${h / 2}" stroke="#3f3f46" stroke-dasharray="2 3"/><path d="M${d}" fill="none" stroke="var(--w-up)" stroke-width="1.6" clip-path="url(#su)"/><path d="M${d}" fill="none" stroke="var(--w-down)" stroke-width="1.6" clip-path="url(#sd)"/>
      <circle cx="${w}" cy="${Y(a[a.length - 1])}" r="3" fill="#fff"/></svg>`;
  }
  function matchCard() {
    const g = M3.radiant_gold_adv[Math.floor(T / 60)], L = g >= 0 ? RAD : DIR;
    return `<a class="r-card r-match" href="#"><div class="r-mh"><span>The International 2026 · Bo3</span><span class="r-live">LIVE</span></div>
      <div class="r-mrow"><span>${logo(RAD)}${esc(NM.SHORT[RAD])}</span><b class="num">1 : 1</b><span>${esc(NM.SHORT[DIR])}${logo(DIR)}</span></div>
      <div class="r-mg">${spark(300, 44)}</div><div class="r-msub num">Карта 3 · 33:30 · <b class="${g >= 0 ? 'up' : 'dn'}">${esc(NM.SHORT[L])} +${k(g)}</b><span>Открыть матч ›</span></div></a>`;
  }

  // ── Лента ─────────────────────────────────────────────────────────────
  const TOPICS = [[7119388, 'Team Spirit'], [9572001, 'Team Vision'], ['The International 2026', 'TI 2026'], ['Патчи', 'Патчи'], ['Трансферы', 'Трансферы']];
  const follow = () => `<div class="r-follow">${TOPICS.map(([k2, l]) => `<button data-fol="${k2}" class="${CFG.follow[k2] ? 'on' : ''}">${typeof k2 === 'number' ? logo(k2) : ''}${esc(l)}<b>${CFG.follow[k2] ? '✓' : '+'}</b></button>`).join('')}</div>`;
  const card = x => `<a class="r-card r-topic" href="#" data-id="${x.id}">${collage(X(x).imgs)}<div class="r-tb">${meta(x)}<h3>${hl(x.title)}</h3>${fans(x)}<div class="r-tf">${srcs(x)}<small>${ups(x)}</small></div></div></a>`;
  function feed() {
    const [h, ...rest] = N, e = X(h), q = e.quotes;
    return `<div class="r-cols"><main><h1 class="r-h1">Новости</h1>${follow()}
      <a class="r-hero" href="#" data-id="${h.id}">${collage(e.imgs, true)}<div class="r-hero-in">${meta(h)}<h2>${hl(h.title)}</h2><p>${hl(h.lede)}</p>
        <div class="r-hero-m num"><span>${logo(RAD)}${esc(NM.SHORT[RAD])}</span><b>1 : 1</b><span>${esc(NM.SHORT[DIR])}${logo(DIR)}</span>${spark(120, 28)}<small>${e.read}</small></div>${fans(h)}</div></a>
      <div class="r-sec">Говорят игроки<small>${q.length} цитаты</small></div><div class="r-quotes">${q.map(quote).join('')}</div>
      <div class="r-sec">Все темы</div><div class="r-grid">${rest.map(card).join('')}</div></main>
      <aside><div class="r-sec">Сейчас идёт</div>${matchCard()}<div class="r-sec">Мнения в X</div>${xposts(e.x.slice(0, 2))}</aside></div>`;
  }
  const quote = ([p, t, where, n]) => { const pp = P(p.account_id), h = HERO(p.hero_id);
    return `<figure class="r-card r-q"><blockquote>«${hl(t)}»</blockquote><figcaption><img src="${IMG + (pp.avatar || h.img)}" alt=""><span><b>${esc(pp.name)}</b><small>${esc(NM.NAME[p.isRadiant ? RAD : DIR])} · ${esc(where)}</small></span><em class="num">${n} источн.</em></figcaption></figure>`; };
  const xposts = a => `<div class="r-card r-x">${a.map(([n, h, t, l]) => `<div class="r-xp"><i>${esc(n[0])}</i><div><b>${esc(n)} <small>${esc(h)}</small></b><p>${hl(t)}</p><small>♡ ${l}</small></div></div>`).join('')}</div>`;

  // ── Тема ──────────────────────────────────────────────────────────────
  const pending = {}; let timer = null;
  function topic() {
    const x = N.find(t => t.id === CFG.id), e = X(x), p = pending[x.id], phone = CFG.view === 'phone';
    const other = N.filter(o => o.id !== x.id).slice(0, 3);
    const side = `${x.match != null ? matchCard() : ''}${e.fans ? `<div class="r-sec">Трибуны</div><div class="r-card r-pad">${fans(x, true)}</div>` : ''}
      <div class="r-sec">Источники · ${x.src.length}</div><div class="r-card r-src">${x.src.map(([s, t, a]) => `<a href="#"><i>${esc(s[0].toUpperCase())}</i><span><small>${esc(s)} · ${esc(a)}</small>${esc(t)}</span></a>`).join('')}</div>`;
    return `<div class="r-cols"><main><button class="r-back" data-back>‹ Новости</button>
      <div class="r-th">${collage(e.imgs, true)}<div class="r-th-in">${meta(x)}<h1>${hl(x.title)}</h1><p>${hl(x.lede)}</p><div class="r-stats num">${srcs(x)}<span>${ups(x)}</span><span>${e.read || ''}</span></div></div></div>
      ${phone ? side : ''}
      <div class="r-sec">Главное</div><ul class="r-main">${x.main.map(m => `<li>${hl(m)}</li>`).join('')}</ul>
      <div class="r-sec">${x.live ? '<span class="r-dot"></span>Хронология · обновляется' : 'Хронология'}</div>${p ? `<button class="r-new" data-new>↑ ${p.length} новое</button>` : ''}
      <ul class="r-tl">${x.ups.map(u => `<li class="${u.key ? 'is-key' : ''}${u.fresh ? ' is-fresh' : ''}"><i class="num">${esc(u.t)}</i><span>${hl(u.text)}</span></li>`).join('')}</ul>
      ${e.quotes ? `<div class="r-sec">Цитаты<small>${e.quotes.length}</small></div><div class="r-quotes">${e.quotes.map(quote).join('')}</div>` : ''}
      ${e.x ? `<div class="r-sec">Мнения в X</div>${xposts(e.x)}` : ''}
      ${e.qs ? `<div class="r-sec">Вопросы<small>ответ — ИИ по источникам</small></div><div class="r-qs">${e.qs.map(([q, a], i) => `<details class="r-card"${i ? '' : ' open'}><summary>${esc(q)}</summary><p>${hl(a)}</p></details>`).join('')}</div>` : ''}
      <div class="r-sec">Ещё темы</div><div class="r-grid">${other.map(card).join('')}</div></main>
      <aside>${phone ? '' : side}</aside></div>`;
  }

  function run() {
    const x = N.find(t => t.id === CFG.id);
    document.body.innerHTML = `<div class="stage is-${CFG.view} s-${CFG.screen}"><header class="pt"><div class="pt-brand"><span class="pt-logo">◆</span>GoatScout</div><button class="pt-in">Войти</button></header>
      <nav class="n-crumbs"><span>‹</span><a href="#" data-back>Новости</a>${CFG.screen === 'topic' ? `<span>›</span><b>${esc(x.title)}</b>` : ''}</nav>
      <div class="n-page">${CFG.screen === 'topic' ? topic() : feed()}</div>${CFG.view === 'phone' ? '<nav class="n-tabbar"><span>Матчи</span><span>Поиск</span><span>Фэнтези</span><span>Войти</span></nav>' : ''}</div>`;
    document.querySelectorAll('[data-id]').forEach(a => a.onclick = e => { e.preventDefault(); CFG.screen = 'topic'; CFG.id = a.dataset.id; go(); });
    document.querySelectorAll('[data-back]').forEach(a => a.onclick = e => { e.preventDefault(); CFG.screen = 'feed'; go(); });
    document.querySelectorAll('[data-fol]').forEach(b => b.onclick = () => { const k2 = isNaN(+b.dataset.fol) ? b.dataset.fol : +b.dataset.fol; CFG.follow[k2] = !CFG.follow[k2]; run(); });
    document.querySelectorAll('[data-vote]').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); CFG.vote = isNaN(+b.dataset.vote) ? b.dataset.vote : +b.dataset.vote; run(); });
    document.querySelectorAll('.r-ent').forEach(a => a.onclick = e => { e.preventDefault(); e.stopPropagation(); });
    const nb = document.querySelector('[data-new]'); if (nb) nb.onclick = () => { const t = N.find(o => o.id === CFG.id); t.ups.forEach(u => delete u.fresh); t.ups.unshift(...pending[t.id].map(u => ({ ...u, fresh: true }))); delete pending[t.id]; run(); };
  }
  function go() {
    clearTimeout(timer); run(); window.scrollTo(0, 0);
    const x = N.find(t => t.id === CFG.id);
    if (CFG.screen === 'topic' && x.live && x.next && x.next.length) timer = setTimeout(() => { pending[x.id] = x.next.splice(0); run(); }, 6000);
  }
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [
      { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
      { key: 'screen', name: 'Экран', value: CFG.screen === 'feed' ? 'feed' : CFG.id, options: [{ v: 'feed', label: 'Лента' }, { v: 'vis-spi', label: 'Тема: Vision — Spirit (live)' }, { v: 'og-gl', label: 'Тема: OG — GamerLegion' }] },
    ],
    set(key, v) { if (key === 'screen') { CFG.screen = v === 'feed' ? 'feed' : 'topic'; if (v !== 'feed') CFG.id = v; } else CFG[key] = v; go(); },
    caption: () => 'Пример данных. Нажми тему; в live-теме через 6 с придёт обновление; «За кого ты?» и подписки на темы — нажимаются',
  };
  go();
})();
