// Реальные замены (stand-in) и уходы / трансферы Dota 2 за месяц до 21.10.2026. Собрано 21.10.2026: Liquipedia закрыла доступ (429 / капча),
// источники — cybersport.ru, dota2.ru (страницы команд и турниров). pos — позиция 1–5 (null — не нашлась). from / to — dd.mm, to: null — срок не объявлен.
// Замены старше месяца (апрель, август) не берём. Статус «проверено» — состояние лабы, в данных его нет.
window.SUBS_DATA = {
  asOf: '21.10',
  at: '14:32', // время последнего обновления ленты (лаба)
  // Лаба (v13): замена этой команды появляется только после «Найти новые» — показать, как поиск что-то находит. Замена настоящая
  later: ['Team Synapse'],
  subs: [
    // ВЫДУМАНО для лабы (дирижёр 21.10: «пофиг на правдивость, выдумай данные») — замены на сегодняшние матчи, чтобы лента была гуще
    {team: "Dawn Bulls", out: "Kiritych", in: "Sonneiko", pos: 3, from: "21.10", to: null, event: "EPL Masters III", rel: 64, src: "https://x.com/dawnbullsgg", text: "Dawn Bulls сыграют против Zero Tenacity с заменой: Sonneiko выйдет на третью позицию вместо Kiritych, у которого проблемы с визой."},
    {team: "Zero Tenacity", out: "Lorenof", in: "Ramzes666", pos: 2, from: "21.10", to: "21.10", event: "EPL Masters III", rel: 41, src: "https://t.me/dota2insider", text: "По слухам, Zero Tenacity на сегодняшний матч позовут Ramzes666 — Lorenof не успевает на игру."},
    {team: "Yellow Submarine", out: "Malik", in: "Daxak", pos: 4, from: "21.10", to: null, event: "EPL Masters III", rel: 88, src: "https://x.com/yellowsubmarine", text: "Yellow Submarine: Daxak сыграет вместо Malik на EPL Masters III. Malik взял паузу по личным причинам."},
    {type: "transfer", team: "Power Rangers", out: "Dukalis", in: null, toTeam: null, pos: 5, from: "21.10", to: null, event: "EPL Masters III", rel: 70, src: "https://www.cybersport.ru/tags/dota-2", text: "Dukalis покинул Power Rangers прямо по ходу группового этапа. Замену команда пока не объявила."},
    {team: "Cloud Dawning", out: "Ahjit", in: "Nikobaby", pos: 1, from: "21.10", to: "21.10", event: "EPL World Series: SEA S19", rel: 55, src: "https://dota2.ru/esport/team/", text: "На матч с Nemesis Academy Cloud Dawning заявили Nikobaby вместо Ahjit — замена отмечена в базе турнира."},
    // type: transfer — команда объявила уход игрока (сам по себе, без замены); toTeam — куда перешёл
    {type: "transfer", team: "Team Synapse", out: "TA2000", in: null, toTeam: "HULIGANI", pos: 1, from: "18.10", rel: 92, text: "Айбек TA2000 Токаев перестал быть участником основного состава Team Synapse. Информацией об этом представители организации поделились в X.", to: null, event: "EPL Masters III", src: "https://www.cybersport.ru/tags/dota-2/ta2000-pokinul-team-synapse"},
    {team: "Team Synapse", out: "TA2000", in: "rubikon155", pos: 1, from: "18.10", to: null, event: "EPL Masters III", src: "https://www.cybersport.ru/tags/dota-2/ta2000-pokinul-team-synapse"},
    {team: "HULIGANI", out: "ssnovv1", in: "TA2000", pos: 1, from: "18.10", rel: 78, text: "HULIGANI представила состав на EPL Masters III. В команде одна замена по сравнению с ростером, выступившим в отборочных на DreamLeague Season 30.", to: null, event: "EPL Masters III", src: "https://www.cybersport.ru/tags/dota-2/ta2000-sygrayet-za-huligani-na-epl-masters-iii"},
    {team: "Xtreme Gaming", out: "Xm", in: "Moon", pos: 2, from: "29.09", to: "11.10", event: "BLAST SLAM VIII", src: "https://dota2.ru/esport/tournament/1007-blast-slam-viii/"},
    {team: "1w Team", out: "Pure", in: "Shad", pos: 1, from: "19.09", to: "27.09", event: "PGL Wallachia Season 9", src: "https://www.dota2.ru/esport/tournament/1114-pgl-wallachia-season-9/"},
    {team: "Aurora Gaming", out: "Mikoto", in: "Stojkov", pos: 2, from: "19.09", to: "27.09", event: "PGL Wallachia Season 9", src: "https://www.dota2.ru/esport/tournament/1114-pgl-wallachia-season-9/"},
    {team: "Team Nemesis", out: "Jabz", in: "SabeRLighT-", pos: null, from: "19.09", to: "27.09", event: "PGL Wallachia Season 9", src: "https://www.dota2.ru/esport/tournament/1114-pgl-wallachia-season-9/"},
    {team: "Team Nemesis", out: "Ken", in: "Mo13ei", pos: null, from: "19.09", to: "27.09", event: "PGL Wallachia Season 9", src: "https://www.dota2.ru/esport/tournament/1114-pgl-wallachia-season-9/"}
  ]
}
