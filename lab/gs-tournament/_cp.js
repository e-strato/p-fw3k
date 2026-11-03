// Копия Liquipedia PARI Universe/1 (лаба gs-tournament, v0). Текст и цифры — Liquipedia API (parse, 28.10); составы — ../widget-participants/_data.js (Claude-B).
(() => {
  const $ = s => document.querySelector(s);
  const PI = '../widget-participants/';
  const P = new URLSearchParams(location.search), FIT = P.has('fit');
  const fitView = () => (innerWidth < 800 ? 'phone' : 'desk');
  const CFG = { view: FIT ? fitView() : 'desk', subs: {}, rosters: true, talent: 'en', open: { October_26: true } };

  // ——— Команды: полное имя → тег, лого (img/ Claude-B) ———
  const TEAMS = window.PU_TEAMS || [];
  const SHORT = { 'Team Yandex': 'Yandex', GamerLegion: 'GL', OG: 'OG', 'Team Liquid': 'Liquid', '1w Team': '1w', 'Team Spirit': 'TSpirit', PARIVISION: 'PARI', LEGION: 'LEGION', 'Astra Invicta': 'Astra', 'BetBoom Team': 'BB' };
  const logoSrc = n => PI + 'img/team-' + n.toLowerCase().replace(/\s+/g, '') + '.png';
  const ico = n => n && n !== 'TBD' ? `<img class="ti" src="${logoSrc(n)}" alt="" />` : '<span class="ti ti--tbd">👥</span>';
  const team = (n, short) => `<span class="tm">${ico(n)}<a href="#" class="${n === 'LEGION' ? 'red' : ''}">${n === 'TBD' || !n ? 'TBD' : short ? SHORT[n] : n}</a></span>`;
  const FLAG = { Russia: 'ru', Ukraine: 'ua', Kazakhstan: 'kz', 'United States': 'us', Lebanon: 'lb', 'North Macedonia': 'mk', Philippines: 'ph', Sweden: 'se', Belarus: 'by', Bolivia: 'bo',
    Bulgaria: 'bg', Czechia: 'cz', Finland: 'fi', Germany: 'de', Indonesia: 'id', Israel: 'il', Jordan: 'jo', Moldova: 'md', Nicaragua: 'ni', 'United Kingdom': 'gb' };
  const flag = c => `<img class="fl" src="${PI}img/flag-${FLAG[c] || c}.png" alt="" />`;
  const edit = '<span class="ed">[<a href="#">edit</a>]</span>';
  const share = '<a class="sh" href="#">⤴ Share</a>';
  const h2 = (id, t, sh) => `<h2 id="${id}">${t} ${edit}${sh ? share : ''}</h2>`;
  const h3 = (id, t, sh) => `<h3 id="${id}">${t} ${edit}${sh ? share : ''}</h3>`;

  // ——— Шапка вики, навбокс, вкладки ———
  const wikiHeader = () => `<header class="wh"><div class="wh-row"><a class="wh-logo" href="#"><span class="wh-mark">🦄</span><span><b>liquipedia ▾</b><small>Dota 2</small></span></a>
      <nav class="wh-nav"><a href="#">🔥 Trending ▾</a><a href="#">🏆 Tournaments ▾</a><a href="#">✚ Contribute ▾</a></nav>
      <div class="wh-search"><span>Search</span><b>⌕</b></div><div class="wh-ic"><a href="#">👤</a><a href="#">➜</a></div><a class="wh-burger" href="#">☰</a></div>
    <div class="wh-sub"><nav><a href="#">📄 Page</a><a href="#">💬 Talk</a><a href="#">✎ Edit</a><a href="#">↺ History</a></nav><nav class="wh-r"><a href="#">🖥 Auto ▾</a><a href="#">⤴ Share ▾</a><a href="#">🔧 Tools ▾</a></nav></div></header>`;
  const navbox = () => `<div class="nb"><div class="nb-hd"><span class="nb-e">[e]</span><b><a href="#" class="red">FISSURE</a> Events</b><button class="btn-s">⊘ Hide</button></div>
    <div class="nb-row"><b>2026</b><span><a href="#">FISSURE Universe</a> <a href="#" class="mut">(#8)</a> • <b>PARI Universe <span class="mut">(#1)</span></b></span></div>
    <div class="nb-hd nb-hd--all"><b>All events</b><button class="btn-s">👁 Show</button></div></div>`;
  const tabs = () => `<div class="tabs"><a class="is-on" href="#">Overview</a><a href="#">Qualifier</a><a href="#">Statistics</a></div>`;

  // ——— Инфобокс ———
  const infobox = () => `<div class="ib"><div class="ib-hd">PARI Universe <span class="ib-e">[e][h]</span></div><div class="ib-logo"><img src="img/pari-universe.png" alt="PARI Universe" /></div>
    <div class="ib-hd">League Information</div>
    ${[['Series', '<a href="#">PARI Universe</a>'], ['Organizer', '<a href="#">FISSURE</a>'], ['Sponsor(s)', '<button class="btn-s">Expand ⌄</button>'], ['Server', 'Europe West'], ['Type', 'Online'],
      ['Location', '🇪🇺 <a href="#">Europe</a>'], ['Format', 'Round-robin group stage<br>Double-elimination playoffs'], ['Prize Pool', '$250,000 <u>USD</u>'], ['Start Date', '2026-10-22'], ['End Date', '2026-11-01'],
      ['Game', '<a href="#">Dota 2</a>'], ['Version', '<a href="#">7.41f</a>'], ['Teams', '10'], ['Liquipedia Tier', '<a href="#">Tier 1</a>']].map(([a, b]) => `<div class="ib-r"><b>${a}:</b><span>${b}</span></div>`).join('')}
    <div class="ib-hd">Links</div><div class="ib-links">${['δ', 'D', '♜', '▦', '▤', '◎', '✈', '𝕏', 'vk', '▶', '⚑'].map(x => `<a href="#">${x}</a>`).join('')}</div>
    <div class="ib-hd">Chronology</div><div class="ib-chr"><span></span><a href="#">#2 ›</a></div></div>`;

  // ——— Ближайшие матчи ———
  const upcoming = () => {
    const U = [['Oct 28 - 10:05 CET', 'Watch now', 'PARIVISION', 'Team Liquid', '1', '1', 1], ['Oct 28 - 14:00 CET', 'Watch here', 'Team Yandex', 'Astra Invicta'], ['Oct 28 - 16:00 CET', '', 'Team Spirit', 'OG'],
      ['Oct 28 - 19:00 CET', '', 'GamerLegion', 'LEGION'], ['Oct 29 - 10:00 CET', '', 'TBD', 'TBD', '', '', 0, 'Lower Bracket Round 1']];
    return `${h2('Upcoming_Matches', 'Upcoming Matches')}<label class="tg"><i class="on"></i>Show countdown</label>
      <div class="ups">${U.map(u => `<div class="up"><div class="up-t">${u[6] ? '<span class="live">LIVE</span>' : `<span class="cd">${u[0]}</span>`}${u[1] ? `<a href="#" class="up-w">${u[1]}</a>` : ''}</div>
        <div class="up-r">${u[7] || 'Upper Bracket Quarterfinals'}</div>
        <div class="up-o">${team(u[2], 1)}<b>${u[4] || ''}</b></div><div class="up-o">${team(u[3], 1)}<b>${u[5] || ''}</b></div></div>`).join('')}</div>`;
  };

  const toc = () => {
    const L = [['1', 'Upcoming Matches'], ['2', 'Format'], ['3', 'Prize Pool'], ['4', 'Participants'], ['5', 'Group Stage', [['5.1', 'Group A'], ['5.2', 'Group B'], ['5.3', 'Matches',
      [22, 23, 24, 25, 26, 27].map((d, i) => [`5.3.${i + 1}`, `October ${d}`])]]], ['6', 'Playoffs'], ['7', 'Additional Content', [['7.1', 'Broadcast', [['7.1.1', 'Streams'], ['7.1.2', 'Talent']]],
      ['7.2', 'Miscellaneous'], ['7.3', 'Statistics Overview', [['7.3.1', 'Hero Stats'], ['7.3.2', 'Country Representation']]]]], ['8', 'References']];
    const li = a => `<ul>${a.map(([n, t, sub]) => `<li><a href="#"><span class="tn">${n}</span> ${t}</a>${sub ? li(sub) : ''}</li>`).join('')}</ul>`;
    return `<div class="toc"><div class="toc-t"><b>Contents</b> <span>[<a href="#">hide</a>]</span></div>${li(L)}</div>`;
  };

  const format = () => `${h2('Format', 'Format')}<ul class="ul">
    <li><b>Group Stage</b> <i>(October 22 - October 26)</i><ul><li>Two single round-robin groups of five teams each</li><li>All series are <u>Bo3</u></li><li><span class="hl-up">Top four teams</span> proceed to playoffs</li>
      <li>Remaining teams are eliminated</li><li><i><a href="#">Click here for tiebreaker rules</a></i></li></ul></li>
    <li><b>Playoffs</b> <i>(October 28 - November 1)</i><ul><li>Double-elimination bracket</li><li>Grand Final is <u>Bo5</u>, all other series are <u>Bo3</u></li></ul></li></ul>`;

  const prize = () => {
    const R = [['1', '$125,000', '$80,000', '$45,000'], ['2', '$50,000', '$32,000', '$18,000'], ['3', '$30,000', '$20,000', '$10,000'], ['4', '$15,000', '$10,000', '$5,000']];
    const R2 = [['5-6', '$10,000', '$10,000', '$0', ['TBD', 'TBD']], ['7-8', '$5,000', '$5,000', '$0', ['TBD', 'TBD']], ['9-10', '-', '-', '-', ['1w Team', 'BetBoom Team']]];
    const row = (p, a, b, c, ts, cls) => `<tr class="${cls}"><td class="pl"><span class="plc">${p}</span></td><td>${ts.map(t => team(t)).join('')}</td><td class="r">${a}</td><td class="r">${b}</td><td class="r">${c}</td></tr>`;
    return `${h2('Prize_Pool', 'Prize Pool', 1)}<p>$250,000 <u>USD</u> are spread among the participants as seen below:</p>
      <table class="pz"><tr><th>Place</th><th>Participant</th><th class="r">$ <u>USD</u></th><th class="r">Player Prize</th><th class="r">Club Share</th></tr>
      ${R.map(r => row(r[0], r[1], r[2], r[3], ['TBD'], 'p' + r[0])).join('')}
      ${CFG.pz ? R2.map(r => row(r[0], r[1], r[2], r[3], r[4], 'px')).join('') : ''}
      <tr><td colspan="5" class="pz-more"><button data-a="pz">place 5 to 10 ${CFG.pz ? '⌃' : '⌄'}</button></td></tr></table>`;
  };

  const participants = () => `${h2('Participants', 'Participants', 1)}<div class="pc-ctl"><a class="pi" href="#">🔗 Player Info</a>
      <label class="tg" data-a="rosters"><i class="${CFG.rosters ? 'on' : ''}"></i>Show rosters</label><label class="tg"><i class="on"></i>Compact view</label><label class="tg"><i class="on"></i>Enable hover</label></div>
    <div class="pcs">${TEAMS.map((t, k) => { const tab = t.tabs[CFG.subs[k] && t.tabs[1] ? 1 : 0];
      return `<div class="pc"><div class="pc-hd"><img src="${PI + t.logo}" alt="" /><a href="#" class="${t.name === 'LEGION' ? 'red' : ''}">${t.name}</a><span class="st">${t.st}</span><span class="car">⌃</span></div>
      ${CFG.rosters ? `${t.q ? `<div class="pc-q"><span><img src="img/pari-universe.png" alt="" /> ${t.q[0]}</span><b>${t.q[1]}</b></div>` : ''}
      ${t.tabs.length > 1 ? `<div class="pc-tabs" data-k="${k}">${t.tabs.map((x, i) => `<button class="${tab === x ? 'is-on' : ''}" data-i="${i}">${x.tab}</button>`).join('')}</div>` : ''}
      ${tab.m.map(m => `<div class="pc-m"><img class="fl" src="${PI + m.fsrc}" alt="" /><a href="#">${m.nick}</a>${m.team ? `<img class="pc-from" src="${PI + m.team[1]}" alt="" title="${m.team[0]}" />` : ''}<span class="${m.role === 'Coach' ? 'coach' : ''}">${m.role}</span></div>`).join('')}` : ''}</div>`;
    }).join('')}</div>`;

  // ——— Группы ———
  const G = [
    { id: 'Group_A', name: 'Group A', st: [['Team Yandex', '4 - 0', '8 - 1'], ['GamerLegion', '3 - 1', '6 - 3'], ['OG', '2 - 2', '5 - 5'], ['Team Liquid', '1 - 3', '4 - 6'], ['1w Team', '0 - 4', '0 - 8']],
      order: ['1w Team', 'GamerLegion', 'OG', 'Team Liquid', 'Team Yandex'],
      x: '0-2 Oct 24|0-2 Oct 23|0-2 Oct 22|0-2 Oct 25|2-0 Oct 24|2-1 Oct 26|2-0 Oct 23|0-2 Oct 22|2-0 Oct 23|1-2 Oct 26|2-1 Oct 25|0-2 Oct 24|2-0 Oct 22|0-2 Oct 23|1-2 Oct 25|1-2 Oct 26|2-0 Oct 25|2-0 Oct 22|2-0 Oct 24|2-1 Oct 26' },
    { id: 'Group_B', name: 'Group B', st: [['Team Spirit', '4 - 0', '8 - 1'], ['PARIVISION', '3 - 1', '7 - 2'], ['LEGION', '1 - 3', '2 - 7'], ['Astra Invicta', '1 - 3', '3 - 6'], ['BetBoom Team', '1 - 3', '2 - 6']],
      order: ['Astra Invicta', 'BetBoom Team', 'PARIVISION', 'Team Spirit', 'LEGION'],
      x: '2-0 Oct 23|0-2 Oct 22|0-2 Oct 25|1-2 Oct 24|0-2 Oct 23|0-2 Oct 25|0-2 Oct 24|2-0 Oct 26|2-0 Oct 22|2-0 Oct 25|1-2 Oct 26|2-0 Oct 23|2-0 Oct 25|2-0 Oct 24|2-1 Oct 26|2-0 Oct 22|2-1 Oct 24|0-2 Oct 26|0-2 Oct 23|0-2 Oct 22' },
  ];
  const group = g => {
    const cells = g.x.split('|'); let n = 0;
    const grid = g.order.map((r, i) => `<tr><td class="cx-h">${ico(r)}</td>${g.order.map((c, j) => { if (i === j) return '<td class="cx-x"></td>';
      const [s, , d] = cells[n++].split(' '), [a, b] = s.split('-').map(Number); return `<td class="${a > b ? 'cx-w' : 'cx-l'}"><b>${s}</b><small>Oct ${d}</small></td>`; }).join('')}</tr>`).join('');
    return `${h3(g.id, g.name, 1)}<div class="grp"><table class="gt"><tr><th colspan="4" class="gt-t">Standings</th></tr><tr><th>#</th><th>Participant</th><th>Matches</th><th>Games</th></tr>
      ${g.st.map((s, i) => `<tr class="${i < 4 ? 'up' : 'dn'}"><td><span class="plc">${i + 1}</span></td><td>${team(s[0])}</td><td class="c">${s[1]}</td><td class="c">${s[2]}</td></tr>`).join('')}</table>
      <div class="scr"><table class="cx">${grid}<tr><td></td>${g.order.map(c => `<td class="cx-h">${ico(c)}</td>`).join('')}</tr></table></div></div>`;
  };

  // ——— Матчи по дням (matchlist) ———
  const DAYS = { October_22: [['Team Yandex', 'GamerLegion', 2, 0], ['Team Spirit', 'LEGION', 2, 0], ['Team Liquid', '1w Team', 2, 0], ['PARIVISION', 'Astra Invicta', 2, 0]],
    October_23: [['1w Team', 'OG', 0, 2], ['Team Liquid', 'GamerLegion', 0, 2], ['BetBoom Team', 'Astra Invicta', 0, 2], ['PARIVISION', 'LEGION', 2, 0]],
    October_24: [['1w Team', 'GamerLegion', 0, 2], ['Team Yandex', 'OG', 2, 0], ['Team Spirit', 'BetBoom Team', 2, 0], ['Astra Invicta', 'LEGION', 1, 2]],
    October_25: [['Team Liquid', 'OG', 1, 2], ['Team Yandex', '1w Team', 2, 0], ['Team Spirit', 'Astra Invicta', 2, 0], ['PARIVISION', 'BetBoom Team', 2, 0]],
    October_26: [['OG', 'GamerLegion', 1, 2], ['Team Yandex', 'Team Liquid', 2, 1], ['Team Spirit', 'PARIVISION', 2, 1], ['BetBoom Team', 'LEGION', 2, 0]],
    October_27: [['Astra Invicta', 'LEGION', 0, 1], ['Astra Invicta', 'BetBoom Team', 1, 0], ['LEGION', 'BetBoom Team', 1, 0]] };
  const matches = () => `${h3('Matches', 'Matches')}<div class="mls">${Object.entries(DAYS).map(([d, ms]) => { const on = CFG.open[d];
    return `<div class="ml"><div class="ml-t" data-d="${d}"><span>${d.replace('_', ' ')}</span><button class="btn-s">${on ? 'Hide' : 'Show'}</button></div>
      ${on ? ms.map(([a, b, x, y]) => `<div class="ml-m"><div class="ml-o ${x > y ? 'w' : ''}">${team(a)}</div><div class="ml-s ${x > y ? 'w' : ''}">${x}</div><div class="ml-s ${y > x ? 'w' : ''}">${y}</div>
        <div class="ml-o ml-o--r ${y > x ? 'w' : ''}">${team(b)}</div><span class="ml-i">ⓘ</span></div>`).join('') : ''}</div>`; }).join('')}</div>`;

  // ——— Плей-офф (сетка) ———
  const playoffs = () => {
    const m = (a = 'TBD', b = 'TBD', sa = '', sb = '') => `<div class="bm"><div class="bo">${team(a, 1)}<b>${sa}</b></div><div class="bo">${team(b, 1)}<b>${sb}</b></div></div>`;
    const col = (h, ms, cls = '') => `<div class="bcol ${cls}"><div class="bh">${h}</div><div class="bms">${ms.join('')}</div></div>`;
    return `${h2('Playoffs', 'Playoffs')}<div class="scr"><div class="br">
      <div class="brow">${col('Upper Bracket Quarterfinals', [m('PARIVISION', 'Team Liquid', 1, 1), m('Team Yandex', 'Astra Invicta'), m('Team Spirit', 'OG'), m('GamerLegion', 'LEGION')])}
        ${col('Upper Bracket Semifinals', [m(), m()])}${col('Upper Bracket Final', [m()])}${col('Grand Final', [m()], 'gf')}</div>
      <div class="brow">${col('Lower Bracket Round 1', [m(), m()])}${col('Lower Bracket Quarterfinals', [m(), m()])}${col('Lower Bracket Semifinals', [m()])}${col('Lower Bracket Final', [m()])}</div></div></div>`;
  };

  // ——— Трансляции, таланты, разное ———
  const broadcast = () => {
    const P = n => `<li>🎙 <a href="#">${n[0]}</a> (${n[1]})</li>`;
    const EN = `<p>The English broadcast talent was announced on October 21, 2026.<sup>[6]</sup></p><p><b>Casters:</b></p><ul class="ul tl">${[['Bkop', 'Benjamin Kopilow'], ['Gunnar', 'Nicolas Lopez'], ['Jenkins', 'Andrew Jenkins'], ['Lacoste', 'Dominik Stipić'], ['lizZard', 'Admir Salkanović'], ['Nomad', 'Jared Bajina']].map(P).join('')}</ul>`;
    const RU = `<p>The Russian broadcast talent was announced on October 21, 2026.<sup>[7]</sup></p><p><b>Hosts:</b></p><ul class="ul tl">${[['Fervian', 'Evgeniy Aksyonov'], ['Toll', 'Pavel Grigoriev']].map(P).join('')}</ul>
      <p><b>Analysts:</b></p><ul class="ul tl">${[['alberkaaa', 'Albert Chernoivanov'], ['asdekor_r', 'Vyacheslav Ignatev'], ['bb3px', 'Nikolai Evdokimychev'], ['selfhate', 'Nikita Ozhiganov']].map(P).join('')}</ul>
      <p><b>Casters:</b></p><ul class="ul tl">${[['BLACKARXANGEL', 'Vladislav Ivachshenko'], ['Eiritel', 'Dariya Morozova'], ['Lex', 'Alexey Filippov'], ['Shachlo', 'Maxim Abramovskikh']].map(P).join('')}</ul>`;
    return `${h2('Additional_Content', 'Additional Content')}${h3('Broadcast', 'Broadcast')}<h4>Streams ${edit}</h4>
      <table class="wt st-t"><tr><th colspan="2">Primary Language Streams</th></tr><tr><td><img class="fl" src="${PI}img/flag-gb.png" alt="" title="English Speaking" /></td><td><a href="#">Kick</a></td></tr><tr><td><img class="fl" src="${PI}img/flag-ru.png" alt="" title="Russian Speaking" /></td><td><a href="#">Twitch</a> • <a href="#">YouTube</a></td></tr></table>
      <h4>Talent ${edit}</h4><div class="tt"><div class="tt-tabs" id="talent">${[['en', 'English'], ['ru', 'Russian'], ['all', 'Show All']].map(([k, t]) => `<button data-t="${k}" class="${CFG.talent === k ? 'is-on' : ''}">${t}</button>`).join('')}</div>
      <div class="tt-b">${CFG.talent === 'en' ? EN : CFG.talent === 'ru' ? RU : EN + RU}</div></div>
      ${h3('Miscellaneous', 'Miscellaneous')}<ul class="ul"><li>Tournament Announcement: <a href="#">Telegram</a> • <a href="#">X</a></li></ul>`;
  };

  const heroes = () => {
    const H = [['Witch Doctor', 'witch-doctor', '25 16 9 64.00% 50.00% 13 10 3 76.92% 12 6 6 50.00% 8 16.00% 33 66.00%'], ['Techies', 'techies', '24 11 13 45.83% 48.00% 12 7 5 58.33% 12 4 8 33.33% 20 40.00% 44 88.00%'],
      ['Dark Willow', 'dark-willow', '21 12 9 57.14% 42.00% 11 8 3 72.73% 10 4 6 40.00% 9 18.00% 30 60.00%'], ['Hoodwink', 'hoodwink', '20 7 13 35.00% 40.00% 9 3 6 33.33% 11 4 7 36.36% 7 14.00% 27 54.00%'],
      ['Windranger', 'windranger', '19 8 11 42.11% 38.00% 8 3 5 37.50% 11 5 6 45.45% 11 22.00% 30 60.00%']];
    const s = '<span class="srt">⇕</span>';
    return `${h3('Statistics_Overview', 'Statistics Overview')}<h4>Hero Stats ${edit}</h4><div class="scr"><table class="wt hs">
      <tr><th></th><th></th><th colspan="5">Picks</th><th colspan="4">Radiant Side</th><th colspan="4">Dire Side</th><th colspan="2">Bans</th><th colspan="2">Picks &amp; Bans</th><th></th></tr>
      <tr><th>${s}</th><th>Hero ${s}</th>${['∑', 'W', 'L', 'WR', '%T', '∑', 'W', 'L', 'WR', '∑', 'W', 'L', 'WR', '∑', '%T', '∑', '%T'].map(x => `<th>${x} ${s}</th>`).join('')}<th>Details</th></tr>
      ${H.map((h, i) => `<tr><td>${i + 1}</td><td class="hr"><img src="img/h-${h[1]}.png" alt="" /><a href="#">${h[0]}</a></td>${h[2].split(' ').map((v, j) => `<td class="${[0, 5, 9, 13, 15].includes(j) ? 'b' : ''}">${v}</td>`).join('')}<td><button class="btn-s">Show</button></td></tr>`).join('')}
      <tr class="tot"><td colspan="2"></td><td colspan="5"><b>50 games played</b></td><td colspan="4" class="rad"><b>27W - 23L (54.00%)</b></td><td colspan="4" class="dire"><b>23W - 27L (46.00%)</b></td><td colspan="5"></td></tr>
      <tr><td colspan="20" class="c"><a href="#">Click here for complete statistics table</a></td></tr></table></div>`;
  };

  const countries = () => {
    const C = [['1', 'Russia', 17, '9Class, CHIRA_JUNIOR, DM, Dukalis, Kataomi, Kiritych, Larl, Malr1ne, MieRo, Nightfall, not me, Noticed, Pure, rue, Satanic, SSS, swedenstrong'], ['2', 'Ukraine', 7, 'Batyuk, Bignum, Darklord^, Kidaro, lorenof, No[o]ne-, Yatoro'],
      ['3', 'Kazakhstan', 3, 'Malady, watson, xsvampire'], ['3', 'United States', 3, 'Fayde, RCY, Speeed'], ['5', 'Lebanon', 2, 'GH, OmaR'], ['5', 'North Macedonia', 2, 'Saksa, Stojkov'], ['5', 'Philippines', 2, 'Natsumi, skem'], ['5', 'Sweden', 2, 'Boxi, m1CKe'],
      ['9', 'Belarus', 1, 'OneJey'], ['9', 'Bolivia', 1, 'Wisper'], ['9', 'Bulgaria', 1, 'bzm'], ['9', 'Czechia', 1, 'SaberLight'], ['9', 'Finland', 1, 'Topson'], ['9', 'Germany', 1, 'tOfu'], ['9', 'Indonesia', 1, 'Whitemon'], ['9', 'Israel', 1, '33'],
      ['9', 'Jordan', 1, 'ATF'], ['9', 'Moldova', 1, 'Save-'], ['9', 'Nicaragua', 1, 'Yuma'], ['9', 'United Kingdom', 1, 'Ari']];
    return `${h4('Country Representation')}<div class="scr"><table class="wt cr"><tr><th>#</th><th>Country / Region ⇕</th><th>Representation ⇕</th><th>Players</th></tr>
      ${C.map(c => `<tr><td>${c[0]}</td><td>${flag(c[1])} ${c[1]}</td><td>${c[2]} / 50 (${c[2] * 2}%)</td><td>${c[3].split(', ').map(n => `<a href="#">${n}</a>`).join(', ')}</td></tr>`).join('')}</table></div>`;
  };
  const h4 = t => `<h4>${t} ${edit}</h4>`;

  const refs = () => `${h2('References', 'References')}<ol class="refs">${[
    'Team Yandex (2026-10-22). <a href="#">"Ammar "ATF" will miss the first matches of the tournament due to some minor health issues. He\'ll be back in action as soon as he\'s recovered! Andreas "Xibbe" Ragnemalm will be standing in for Ammar during his absence."</a>',
    'FISSURE Dota 2 (2026-10-22). <a href="#">"ЗАМЕНЫ В СОСТАВАХ НА PARI UNIVERSE [ROSTER CHANGES AT PARI UNIVERSE]"</a> (in Russian).',
    '1win Dota 2 (2026-10-23). <a href="#">"Can we still crush them with Mikoto? For personal reasons, Bozhidar won’t be able to start the match with the boys."</a>',
    'FISSURE Dota 2 (2026-10-22). <a href="#">"ЗАМЕНА В TEAM LIQUID! [REPLACEMENT IN TEAM LIQUID!]"</a> (in Russian).',
    'FISSURE Dota 2 (2026-10-23). <a href="#">"И еще одна замена на сегодня! [And another replacement for today!]"</a> (in Russian).',
    'FISSURE (2026-10-21). <a href="#">"PARI UNIVERSE TALENT LINEUP REVEALED!"</a>', 'FISSURE (2026-10-21). <a href="#">"Встречаем таланты PARI Universe by FISSURE!"</a> (in Russian).'].map(r => `<li>↑ ${r}</li>`).join('')}</ol>`;

  // ——— Сборка ———
  function render() {
    document.body.classList.toggle('is-phone', CFG.view === 'phone');
    // v1 (CP_CUT, созвон 28.10 §1): только то, что нужно начальнику — инфо (тир, даты), формат, участники, групповая стадия, статистика героев.
    // Без ближайших матчей, оглавления, призовых, матчей по дням, плей-офф, трансляций, разного, стран и источников
    $('#lp').innerHTML = window.CP_CUT
      ? `${wikiHeader()}<div class="pg"><h1>PARI Universe</h1>${navbox()}${tabs()}
      <div class="top"><div class="top-l">${format()}</div><aside class="top-r">${infobox()}</aside></div>
      ${participants()}${h2('Group_Stage', 'Group Stage')}${G.map(group).join('')}${heroes()}</div>`
      : `${wikiHeader()}<div class="pg"><h1>PARI Universe</h1>${navbox()}${tabs()}
      <div class="top"><div class="top-l">${upcoming()}${toc()}</div><aside class="top-r">${infobox()}</aside></div>
      ${format()}${prize()}${participants()}${h2('Group_Stage', 'Group Stage')}${G.map(group).join('')}${matches()}${playoffs()}${broadcast()}${heroes()}${countries()}${refs()}</div>`;
  }
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('a[href="#"]')) e.preventDefault();
    const pt = t.closest('.pc-tabs button'); if (pt) { CFG.subs[pt.parentNode.dataset.k] = pt.dataset.i === '1'; render(); return; }
    const ml = t.closest('.ml-t'); if (ml) { CFG.open[ml.dataset.d] = !CFG.open[ml.dataset.d]; render(); return; }
    const tl = t.closest('#talent button'); if (tl) { CFG.talent = tl.dataset.t; render(); return; }
    const a = t.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'pz') { CFG.pz = !CFG.pz; render(); }
    if (a.dataset.a === 'rosters') { e.preventDefault(); CFG.rosters = !CFG.rosters; render(); }
  });

  // Панель песочницы (window.LAB, view 'toolbar' — см. sandbox-project/lab.tsx)
  window.LAB = { view: 'toolbar', flows: () => [], go() {}, cur: () => ({ f: 0, i: 0 }),
    axes: () => [{ key: 'view', name: 'Вид', value: CFG.view, options: [{ v: 'phone', label: 'Телефон 390' }, { v: 'desk', label: 'Компьютер 1440' }] }],
    set(key, v) { if (key === 'view') { CFG.view = v; render(); } },
    toggles: () => [], toggle() {},
    caption: () => window.CP_CUT ? 'v0 без виджетов, которые начальнику не нужны (созвон 28.10)' : 'Liquipedia PARI Universe/1 — копия 1:1, данные на 28.10',
  };
  render();
  if (FIT) addEventListener('resize', () => { if (fitView() !== CFG.view) { CFG.view = fitView(); render(); } });
})();
