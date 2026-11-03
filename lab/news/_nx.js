// news — общие куски для вариантов «как у референса» (v5+, дирижёр 30.10: «несколько разных — как сделано у тех и у тех, но в нашей стилистике»).
// window.NX: данные тем (_ndata.js) + дополнения (‼️ пример: цитаты, X, вопросы, трибуны, клипы, статьи), подсветка имён, коллаж, матч со спарклайном, шапка страницы, LAB.
(() => {
  const N = window.NEWS, D = window.GS_DATA, NM = window.GS_NAMES || { NAME: {}, SHORT: {} }, IMG = '../gs-match/';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const team = t => typeof t === 'number' ? { id: t, name: NM.NAME[t], short: NM.SHORT[t], logo: (D.teams[t] || {}).logo } : { id: t, name: t, short: t, logo: '' };
  const kk = v => (Math.abs(v) / 1000).toFixed(1) + 'k';
  const M3 = D.series[2].maps[2], T = 2010, RAD = M3.radiant_team_id, DIR = M3.dire_team_id, P = id => D.players[id] || {}, HERO = id => D.heroes[id];
  const ENT = [...new Set([...Object.values(NM.NAME), ...Object.values(NM.SHORT), ...M3.players.map(p => P(p.account_id).name), 'OG', 'GamerLegion', 'PARIVISION', '1win', 'RAMZES666', 'ESL', 'Valve', 'Рошан', 'Templar Assassin', 'LEGION', 'Team Liquid', 'Pure~', 'Stariy bog', 'Save-', 'Topson', 'Collapse', 'Bignum', 'Cr1t-', 'Niku', 'NAVI', 'BetBoom', 'Petushara', 'SyndereN', 'Execration', 'Wisper', 'Kaffs', 'Misha', 'Lelis', 'Dyrachyo', 'PlayTime', 'ESSENCE III', 'UNIVERSE by FISSURE', 'GpK~'])].filter(s => s && s.length > 3).sort((a, b) => b.length - a.length);
  const RE = new RegExp('(' + ENT.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  const hl = s => esc(s).replace(RE, '<a class="r-ent" href="#">$1</a>');
  const picks = M3.players.map(p => HERO(p.hero_id).img), pool = Object.values(D.heroes).map(h => h.img);
  const pickN = (seed, n) => Array.from({ length: n }, (_, i) => pool[(seed * 37 + i * 53) % pool.length]);
  const pl = (rad, i) => M3.players.filter(p => p.isRadiant === rad)[i];
  // источники: имя, тип (СМИ / команда / блогер / база), страна
  const SRC = { 'cybersport.ru': ['СМИ', 'RU'], 'hawk.live': ['СМИ', 'EN'], 'Liquipedia': ['база', 'EN'], 'dota2.ru': ['СМИ', 'RU'], 'Team Spirit': ['команда', 'RU'], 'Team Vision': ['команда', 'EN'], 'Dota Memes': ['блогер', 'EN'], 'Аналитик NS': ['блогер', 'RU'], 'egamersworld': ['СМИ', 'EN'], 'esports.gg': ['СМИ', 'EN'] };
  const EXTRA = {
    'vis-spi': { imgs: [picks[5], picks[1], picks[7], picks[2], picks[0]], fans: [61, 39], who: [RAD, DIR], read: '2.4k читают',
      quotes: [[pl(true, 1), 'Мы знали, что вторую карту надо забирать любой ценой. Третья — наша игра.', 'Twitch Spirit', 41], [pl(false, 0), 'Отдали Рошана слишком дёшево. Ещё не конец — у нас лейт.', 'интервью между картами', 23], [pl(true, 2), 'Templar Assassin на мид — это не пик, это заявление.', 'X', 18]],
      x: [['Dota Memes', '@dotamemes', 'Spirit берут Templar Assassin третий раз подряд, а Vision всё ещё не банят 😭', '12.4k'], ['Аналитик NS', '@ns_dota', 'После Рошана у Spirit 8.7k — с таким перевесом на TI карты не отдают. 85% на Spirit.', '3.1k'], ['Vision Fans', '@visionfam', 'Верим до трона. Лейт за нами 💙', '980']],
      qs: [['Сколько длится третья карта?', '33 минуты 30 секунд — Spirit ведут по золоту на 8.7k и забрали Рошана на 31-й минуте.'], ['Кто сыграет в финале верхней сетки?', 'Победитель серии — с Team Falcons. Проигравший уходит в нижнюю сетку.'], ['Как Spirit и Vision играли раньше?', 'В группе Vision выиграли 2:0. В сезоне личные встречи — 3:2 в пользу Spirit.']],
      clips: [[picks[1], 'Рошан на 31-й: Spirit забирают Аегис', '0:42', 'Twitch Spirit'], [picks[5], 'Драка 4 на 2 у нижнего лейна', '1:05', 'GoatScout клипы'], [picks[7], 'Как Vision выиграли первую карту', '3:12', 'hawk.live']],
      arts: [['cybersport.ru', 'Spirit сравняли счёт в серии с Vision', '20 мин'], ['hawk.live', 'Vision vs Spirit: live-разбор третьей карты', '30 мин'], ['dota2.ru', 'Spirit против Vision: Templar Assassin снова в пике', '45 мин'], ['Team Spirit', 'Мы в шаге от финала верхней сетки', '1 ч'], ['esports.gg', 'TI 2026 playoffs: Spirit force a decider', '1 ч'], ['Liquipedia', 'The International 2026 — плей-офф', '2 ч'], ['Аналитик NS', 'Почему Vision не банят Templar Assassin', '2 ч']] },
    'og-gl': { imgs: pickN(3, 4), fans: [44, 56], who: ['OG', 'GamerLegion'], read: '860 читают', arts: [['cybersport.ru', 'OG проиграла GamerLegion в плей-офф UNIVERSE', '2 ч'], ['egamersworld', 'GamerLegion eliminate OG', '2 ч'], ['hawk.live', 'OG vs GamerLegion — итоги', '3 ч']] },
    'ramzes': { imgs: pickN(7, 3), read: '1.1k читают' },
    'yan-pv': { imgs: pickN(11, 4), fans: [58, 42], who: [9823272, 'PARIVISION'], read: '540 читают' },
    'patch': { imgs: pickN(17, 5), read: '2.0k читают' },
    'bb': { imgs: pickN(21, 3), read: '700 читают' },
    'esl': { imgs: pickN(29, 3), read: '410 читают' },
  };
  // настоящие новости (_real.js, v10+): фото, источники и цитаты — из самих статей; без фото — тема только текстом
  const Q = window.NEWS_QUOTES, REAL = !!Q;
  const X = x => { if (REAL) return x._x ||= { imgs: x.imgs || [], arts: x.src, quotes: Q.filter(q => (x.imgs || []).includes(q.img)) };
    const e = EXTRA[x.id] || { imgs: pickN(1, 3) }; e.arts ||= x.src; return e; };

  const logo = (t, c = '') => { const x = team(t); return x.logo ? `<img class="${c}" src="${IMG + x.logo}" alt="">` : `<i class="r-nol ${c}">${esc(x.name[0])}</i>`; };
  const img = s => s ? `<img src="${IMG + s}" alt="">` : '';
  const collage = (imgs, big) => !imgs.length ? '' : `<div class="r-col${big ? ' is-big' : ''}${imgs.length < 3 ? ' is-few' : ''}">${imgs.slice(0, big ? 5 : 3).map((s, i) => `<span style="--i:${i}">${img(s)}</span>`).join('')}</div>`;
  const fav = s => `<i class="x-fav" data-t="${esc((SRC[s] || ['СМИ'])[0])}">${esc(s.replace(/^(Team |Аналитик )/, '')[0].toUpperCase())}</i>`;
  const srcs = x => { const u = [...new Set(X(x).arts.map(s => s[0]))]; return `<span class="r-srcs">${u.slice(0, 3).map(fav).join('')}<small>${esc(u[0])}${u.length > 1 ? ' +' + (u.length - 1) : ''}</small></span>`; };
  const meta = x => `<div class="r-meta">${x.live ? '<span class="r-live">LIVE</span>' : ''}<span>${esc([x.tour, x.ago].filter(Boolean).join(' · '))}</span></div>`;
  const plural = (n, a, b, c) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c}`;
  const ups = x => plural(x.ups.length, 'обновление', 'обновления', 'обновлений');
  const arts = x => plural(X(x).arts.length, 'статья', 'статьи', 'статей');
  const fans = (x, vote, CFG) => { const e = X(x); if (!e.fans) return ''; const [a, b] = e.fans, [A, B] = e.who.map(team);
    return `<div class="r-fans"><div class="r-fbar"><i style="width:${a}%"></i><i style="width:${b}%"></i></div><div class="r-fl num"><span>${logo(A.id)}${esc(A.short)} ${a}%</span><span>${b}% ${esc(B.short)}${logo(B.id)}</span></div>
      ${vote ? `<div class="r-vote">${CFG.vote ? `<span>Ты за <b>${esc(team(CFG.vote).short)}</b> — учтено в трибунах</span>` : `<span>За кого ты?</span><button data-vote="${A.id}">${esc(A.short)}</button><button data-vote="${B.id}">${esc(B.short)}</button>`}</div>` : ''}</div>`; };
  function spark(w, h) {
    const a = M3.radiant_gold_adv.slice(0, Math.floor(T / 60) + 1), mx = Math.max(...a.map(Math.abs)), Xf = i => (i / (a.length - 1)) * w, Y = v => h / 2 - (v / mx) * (h / 2 - 3);
    const d = a.map((v, i) => `${Xf(i).toFixed(1)},${Y(v).toFixed(1)}`).join('L'), id = 's' + Math.random().toString(36).slice(2, 7);
    return `<svg class="r-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><clipPath id="${id}u"><rect width="${w}" height="${h / 2}"/></clipPath><clipPath id="${id}d"><rect y="${h / 2}" width="${w}" height="${h / 2}"/></clipPath></defs>
      <line x1="0" x2="${w}" y1="${h / 2}" y2="${h / 2}" stroke="#3f3f46" stroke-dasharray="2 3"/><path d="M${d}" fill="none" stroke="var(--w-up)" stroke-width="1.6" clip-path="url(#${id}u)"/><path d="M${d}" fill="none" stroke="var(--w-down)" stroke-width="1.6" clip-path="url(#${id}d)"/>
      <circle cx="${w}" cy="${Y(a[a.length - 1])}" r="3" fill="#fff"/></svg>`;
  }
  const g = () => M3.radiant_gold_adv[Math.floor(T / 60)];
  // матч темы (настоящие новости): до начала / идёт — без графика, с коэффициентами
  const realMatch = m => `<a class="r-card r-match" href="#"><div class="r-mh"><span>UNIVERSE by FISSURE · Bo${m.bo}</span><span class="r-live">LIVE</span></div>
      <div class="r-mrow"><span>${logo(m.a)}${esc(team(m.a).short)}</span><b class="num">0 : 0</b><span>${esc(team(m.b).short)}${logo(m.b)}</span></div>
      <div class="r-msub num">${esc(m.when)} · карта 1 · кф ${m.odds[0]} / ${m.odds[1]}<span>Открыть матч ›</span></div></a>`;
  const matchCard = x => { if (REAL) { const m = (x && x.match) || (N.find(t => t.match) || {}).match; return m ? realMatch(m) : ''; } const L = g() >= 0 ? RAD : DIR;
    return `<a class="r-card r-match" href="#"><div class="r-mh"><span>The International 2026 · Bo3</span><span class="r-live">LIVE</span></div>
      <div class="r-mrow"><span>${logo(RAD)}${esc(NM.SHORT[RAD])}</span><b class="num">1 : 1</b><span>${esc(NM.SHORT[DIR])}${logo(DIR)}</span></div>
      <div class="r-mg">${spark(300, 44)}</div><div class="r-msub num">Карта 3 · 33:30 · <b class="${g() >= 0 ? 'up' : 'dn'}">${esc(NM.SHORT[L])} +${kk(g())}</b><span>Открыть матч ›</span></div></a>`; };
  const quote = q => { if (!Array.isArray(q)) return `<figure class="r-card r-q"><blockquote>«${hl(q.text)}»</blockquote><figcaption><img src="${IMG + q.img}" alt=""><span><b>${esc(q.name)}</b><small>${esc(q.role)} · ${esc(q.src)}</small></span><em class="num">${esc(q.t)}</em></figcaption></figure>`;
    const [p, t, where, n] = q, pp = P(p.account_id), h = HERO(p.hero_id);
    return `<figure class="r-card r-q"><blockquote>«${hl(t)}»</blockquote><figcaption><img src="${IMG + (pp.avatar || h.img)}" alt=""><span><b>${esc(pp.name)}</b><small>${esc(NM.NAME[p.isRadiant ? RAD : DIR])} · ${esc(where)}</small></span><em class="num">${n} источн.</em></figcaption></figure>`; };
  const xposts = a => `<div class="r-card r-x">${a.map(([n, h, t, l]) => `<div class="r-xp"><i>${esc(n[0])}</i><div><b>${esc(n)} <small>${esc(h)}</small></b><p>${hl(t)}</p><small>♡ ${l}</small></div></div>`).join('')}</div>`;
  const clip = ([s, t, d, ch]) => `<a class="r-card x-clip" href="#"><span class="x-thumb">${img(s)}<b class="num">${d}</b><i>▶</i></span><span class="x-ct"><b>${esc(t)}</b><small>${esc(ch)}</small></span></a>`;

  // страница: шапка как на странице матча, путь, на телефоне нижний бар; лаба — вид и экран; live-тема — через 6 с новое обновление
  function page(render, title) {
    const CFG = { view: 'phone', screen: 'feed', id: N[0].id, vote: null, follow: { 7119388: true, 'The International 2026': true }, tab: 0 };
    const pending = {}; let timer = null;
    function run() {
      const x = N.find(t => t.id === CFG.id);
      document.body.innerHTML = `<div class="stage is-${CFG.view} s-${CFG.screen}"><header class="pt"><div class="pt-brand"><span class="pt-logo">◆</span>GoatScout</div><button class="pt-in">Войти</button></header>
        <nav class="n-crumbs"><span>‹</span><a href="#" data-back>Новости</a>${CFG.screen === 'topic' ? `<span>›</span><b>${esc(x.title)}</b>` : ''}</nav>
        <div class="n-page">${render(CFG, x, pending)}</div>${CFG.view === 'phone' ? '<nav class="n-tabbar"><span>Матчи</span><span>Поиск</span><span>Фэнтези</span><span>Войти</span></nav>' : ''}</div>`;
      const on = (sel, f) => document.querySelectorAll(sel).forEach(a => a.onclick = e => { e.preventDefault(); e.stopPropagation(); f(a); });
      on('[data-id]', a => { CFG.screen = 'topic'; CFG.id = a.dataset.id; go(); });
      on('[data-back]', () => { CFG.screen = 'feed'; go(); });
      on('[data-fol]', b => { const k = isNaN(+b.dataset.fol) ? b.dataset.fol : +b.dataset.fol; CFG.follow[k] = !CFG.follow[k]; run(); });
      on('[data-vote]', b => { CFG.vote = isNaN(+b.dataset.vote) ? b.dataset.vote : +b.dataset.vote; run(); });
      on('[data-tab]', b => { CFG.tab = +b.dataset.tab; run(); });
      on('.r-ent', () => {});
      on('[data-new]', () => { const t = N.find(o => o.id === CFG.id); t.ups.forEach(u => delete u.fresh); t.ups.unshift(...pending[t.id].map(u => ({ ...u, fresh: true }))); delete pending[t.id]; run(); });
    }
    function go() {
      clearTimeout(timer); CFG.tab = 0; run(); window.scrollTo(0, 0);
      const x = N.find(t => t.id === CFG.id);
      if (CFG.screen === 'topic' && x.live && x.next && x.next.length) timer = setTimeout(() => { pending[x.id] = x.next.splice(0); run(); }, 6000);
    }
    window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
      axes: () => [
        { key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] },
        { key: 'screen', name: 'Экран', value: CFG.screen === 'feed' ? 'feed' : CFG.id, options: [{ v: 'feed', label: 'Лента' }, ...N.filter(t => REAL ? true : ['vis-spi', 'og-gl'].includes(t.id)).slice(0, REAL ? 4 : 2).map(t => ({ v: t.id, label: 'Тема: ' + t.title.slice(0, 40) + (t.title.length > 40 ? '…' : '') })), ...(REAL ? [{ v: N[N.length - 1].id, label: 'Новость без фото' }] : [])] },
      ],
      set(key, v) { if (key === 'screen') { CFG.screen = v === 'feed' ? 'feed' : 'topic'; if (v !== 'feed') CFG.id = v; } else CFG[key] = v; go(); },
      caption: () => `${title}. ${REAL ? 'Настоящие новости 29–30.10 (cybersport.ru, hawk.live)' : 'Пример данных'}; нажми тему, в live-теме через 6 с придёт обновление`,
    };
    go();
  }
  const newBtn = (x, pending) => pending[x.id] ? `<button class="r-new" data-new>↑ ${pending[x.id].length} новое</button>` : '';
  const timeline = x => `<ul class="r-tl">${x.ups.map(u => `<li class="${u.key ? 'is-key' : ''}${u.fresh ? ' is-fresh' : ''}"><i class="num">${esc(u.t)}</i><span>${hl(u.text)}</span></li>`).join('')}</ul>`;

  window.NX = { REAL, N, D, NM, IMG, esc, team, kk, M3, RAD, DIR, hl, X, SRC, logo, img, collage, fav, srcs, meta, plural, ups, arts, fans, spark, g, matchCard, quote, xposts, clip, page, newBtn, timeline };
})();
