// news — НАСТОЯЩИЕ новости Dota 2 за 29–30.10.2026 (дирижёр 30.10: «возьми реальные новости из киберспорта, нормальные картинки; больше будет новостей без картинок»).
// Источники — cybersport.ru и hawk.live (снято 30.10, внутренняя документация/figma-разбор/11-новости/news-real.json). Фото — og:image этих статей (news/img/nN.jpg).
// Наша «обработка»: заголовок и суть темы переписаны коротко; темы = несколько материалов об одном (кластер), у них фото; одиночные новости — только текст (их большинство).
// «Сейчас» — 30.10 13:30 мск. ‼️ Пример: обновление «Матч начался» (next) и счётчики читателей — придуманы, чтобы показать, как приходят новости.
window.NEWS = [
{
"id": "spi-pv",
"tour": "UNIVERSE by FISSURE",
"teams": [
"PARIVISION",
7119388
],
"title": "PARIVISION и Team Spirit сыграют в нижней сетке UNIVERSE",
"lede": "Матч сегодня в 13:00 мск, Bo3. Букмекеры чуть больше верят в PARIVISION: 1.75 против 2.10 на Spirit.",
"main": [
"Spirit вчера выбили LEGION — 2:0 в первом раунде нижней сетки",
"PARIVISION опустились в нижнюю сетку после 1:2 от Team Yandex",
"SyndereN: «Возможно, PARIVISION и Spirit не настолько хороши, как кажется»"
],
"ups": [
{
"t": "10:59",
"text": "Прогноз БК: 1.75 на PARIVISION, 2.10 на Team Spirit",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/smozhet-li-parivision-prervat-seriyu-porazhenii-protiv-spirit-v-matche-na"
},
{
"t": "вчера, 21:37",
"text": "PARIVISION уступили Team Yandex 1:2 и ушли в нижнюю сетку",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/parivision-ustupila-team-yandex-na-universe-by-fissure"
},
{
"t": "вчера, 17:39",
"text": "Team Spirit обыграли LEGION 2:0 в нижней сетке",
"key": false,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/team-spirit-vybila-kollektiv-saberlight-i-darklord-iz-universe-by-fissure"
},
{
"t": "вчера, 17:09",
"text": "SyndereN усомнился в силе PARIVISION и Spirit",
"key": false,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/synderen-vpolne-vozmozhno-chto-parivision-i-spirit-na-samom-dele-ne-nastolko"
}
],
"imgs": [
"../news/img/n1.jpg",
"../news/img/n16.jpg",
"../news/img/n4.jpg",
"../news/img/n18.jpg"
],
"match": {
"a": "PARIVISION",
"b": 7119388,
"when": "Сегодня, 13:00",
"bo": 3,
"odds": [
1.75,
2.1
]
},
"live": true,
"next": [
{
"t": "13:02",
"text": "Матч начался — первая карта (пример, как приходит обновление)"
}
],
"ago": "2 ч",
"src": [
[
"cybersport.ru",
"PARIVISION против Team Spirit — ставки на матч Dota 2",
"2 ч",
"https://www.cybersport.ru/tags/dota-2/smozhet-li-parivision-prervat-seriyu-porazhenii-protiv-spirit-v-matche-na"
],
[
"cybersport.ru",
"PARIVISION уступила Team Yandex на UNIVERSE by FISSURE",
"вчера",
"https://www.cybersport.ru/tags/dota-2/parivision-ustupila-team-yandex-na-universe-by-fissure"
],
[
"cybersport.ru",
"Team Spirit выбила коллектив SabeRLight- и DarkLord^ из UNIVERSE by FISSURE",
"вчера",
"https://www.cybersport.ru/tags/dota-2/team-spirit-vybila-kollektiv-saberlight-i-darklord-iz-universe-by-fissure"
],
[
"cybersport.ru",
"SyndereN: «Вполне возможно, что PARIVISION и Spirit на самом деле не настолько хороши, как кажется»",
"вчера",
"https://www.cybersport.ru/tags/dota-2/synderen-vpolne-vozmozhno-chto-parivision-i-spirit-na-samom-dele-ne-nastolko"
]
]
},
{
"id": "universe",
"tour": "UNIVERSE by FISSURE",
"teams": [
9823272,
"GamerLegion"
],
"title": "Финал виннеров UNIVERSE: Team Yandex против GamerLegion",
"lede": "Матч 31 октября в 16:00 мск. GamerLegion обыграли OG 2:0, Team Yandex — PARIVISION 2:1.",
"main": [
"OG и PARIVISION продолжат в нижней сетке",
"Турнир онлайн, 22 октября — 1 ноября, призовой фонд $250 тыс.",
"Fishman: «Бигнум рвётся в тир-1, не ожидал от него таких результатов»"
],
"ups": [
{
"t": "10:38",
"text": "hawk.live обновил сетку и результаты турнира",
"key": false,
"src": "hawk.live",
"url": "https://hawk.live/posts/pari-universe-schedule-standings-results"
},
{
"t": "10:34",
"text": "Fishman поздравил Bignum с победами GamerLegion",
"key": false,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/fishman-bignum-rvet-sya-v-tir-1-krasava-ne-ozhidal-ot-nego-takikh-rezultatov"
},
{
"t": "00:11",
"text": "GamerLegion обыграли OG 2:0 и вышли в финал виннеров",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/og-proigrala-gamerlegion-v-plei-off-universe-by-fissure"
},
{
"t": "вчера, 21:37",
"text": "Team Yandex обыграли PARIVISION 2:1",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/parivision-ustupila-team-yandex-na-universe-by-fissure"
}
],
"imgs": [
"../news/img/n3.jpg",
"../news/img/n22.jpg",
"../news/img/n7.jpg",
"../news/img/n17.jpg"
],
"ago": "13 ч",
"src": [
[
"hawk.live",
"PARI Universe: Schedule, Standings, Results",
"2 ч",
"https://hawk.live/posts/pari-universe-schedule-standings-results"
],
[
"cybersport.ru",
"Fishman поздравил Bignum с победами на тир-1 сцене",
"2 ч",
"https://www.cybersport.ru/tags/dota-2/fishman-bignum-rvet-sya-v-tir-1-krasava-ne-ozhidal-ot-nego-takikh-rezultatov"
],
[
"cybersport.ru",
"OG проиграла GamerLegion в плей-офф UNIVERSE by FISSURE",
"13 ч",
"https://www.cybersport.ru/tags/dota-2/og-proigrala-gamerlegion-v-plei-off-universe-by-fissure"
],
[
"cybersport.ru",
"PARIVISION уступила Team Yandex на UNIVERSE by FISSURE",
"вчера",
"https://www.cybersport.ru/tags/dota-2/parivision-ustupila-team-yandex-na-universe-by-fissure"
]
]
},
{
"id": "1w",
"teams": [
"1w Team"
],
"title": "1w Team: скандал с Pure~, споры о заменах и Stariy bog на ESSENCE III",
"lede": "Стример Stariy bog сыграет за 1w Team на ESSENCE III. До этого y0nd раскритиковал керри Pure~ за концерт до 5 утра перед официальной игрой.",
"main": [
"RAMZES666: полного роспуска не будет, контракты до конца сезона",
"RAMZES666: GpK~ вместо bzm «жёстко бы их усилил»",
"y0nd: «Считаю это максимально неспортивным и дурацким решением»"
],
"ups": [
{
"t": "12:57",
"text": "Stariy bog объявил, что сыграет за 1w Team на ESSENCE III",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/stariy-bog-mozhet-sygrat-na-essence-iii"
},
{
"t": "12:15",
"text": "RAMZES666: 1w Team сохранит ядро состава",
"key": false,
"src": "hawk.live",
"url": "https://hawk.live/posts/ramzes666-discusses-future-1win-team-roster-amid-recent-losses"
},
{
"t": "11:51",
"text": "y0nd раскритиковал Pure~ за концерт перед игрой",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/y0nd-pure-po-slukham-byl-do-5-utra-na-kontserte-a-v-11-utra-byla-ofitsialnaya"
},
{
"t": "вчера, 17:45",
"text": "RAMZES666 о возможных заменах в 1w Team",
"key": false,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/ramzes666-o-vozmozhnoi-zamene-bzm-na-gpk-v-1w-team-dumayu-yeto-by-zhestko-ikh"
}
],
"imgs": [
"../news/img/n0.jpg",
"../news/img/n5.jpg",
"../news/img/n23.jpg",
"../news/img/n15.jpg"
],
"ago": "33 мин",
"src": [
[
"cybersport.ru",
"Stariy bog может сыграть на ESSENCE III",
"33 мин",
"https://www.cybersport.ru/tags/dota-2/stariy-bog-mozhet-sygrat-na-essence-iii"
],
[
"hawk.live",
"RAMZES666 Discusses the Future of the 1win Team Roster Amid Recent Losses",
"1 ч",
"https://hawk.live/posts/ramzes666-discusses-future-1win-team-roster-amid-recent-losses"
],
[
"cybersport.ru",
"Y0nd: «Pure~, по слухам, был до 5 утра на концерте, а в 11 утра была официальная игра. Считаю это максимально неспортивным и дурацким решением»",
"1 ч",
"https://www.cybersport.ru/tags/dota-2/y0nd-pure-po-slukham-byl-do-5-utra-na-kontserte-a-v-11-utra-byla-ofitsialnaya"
],
[
"cybersport.ru",
"RAMZES666 высказался о возможных заменах в 1w Team",
"вчера",
"https://www.cybersport.ru/tags/dota-2/ramzes666-o-vozmozhnoi-zamene-bzm-na-gpk-v-1w-team-dumayu-yeto-by-zhestko-ikh"
]
]
},
{
"id": "og",
"tour": "UNIVERSE by FISSURE",
"teams": [
"OG"
],
"title": "OG обыграли Spirit и проиграли GamerLegion: что говорят о новом составе",
"lede": "Topson на Magnus — 13/3/20 в победе над Spirit 2:1. Adekvat считает, что OG уверенно идут к статусу тир-1.",
"main": [
"Ceb: «Collapse вернулся из отпуска и присоединился к OG» — о Topson на Magnus",
"Adekvat: «Ceb не обманывал, когда анонсировал тир-1 команду»",
"В верхней сетке OG проиграли GamerLegion 0:2, дальше — Team Liquid"
],
"ups": [
{
"t": "00:11",
"text": "OG проиграли GamerLegion 0:2 и ушли в нижнюю сетку",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/og-proigrala-gamerlegion-v-plei-off-universe-by-fissure"
},
{
"t": "вчера, 18:20",
"text": "Adekvat: OG приближаются к топу",
"key": false,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/adekvat-ob-og-ceb-ne-obmanyval-kogda-anonsiroval-tir-1-komandu"
},
{
"t": "вчера, 14:41",
"text": "OG обыграли Team Spirit 2:1, Topson — на Magnus",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/ceb-o-topson-na-magnus-collapse-vernulsya-iz-otpuska-i-prisoyedinilsya-k-og"
}
],
"imgs": [
"../news/img/n21.jpg",
"../news/img/n13.jpg",
"../news/img/n3.jpg"
],
"ago": "вчера",
"src": [
[
"cybersport.ru",
"OG проиграла GamerLegion в плей-офф UNIVERSE by FISSURE",
"13 ч",
"https://www.cybersport.ru/tags/dota-2/og-proigrala-gamerlegion-v-plei-off-universe-by-fissure"
],
[
"cybersport.ru",
"Adekvat об OG: «Ceb не обманывал, когда анонсировал тир-1 команду»",
"вчера",
"https://www.cybersport.ru/tags/dota-2/adekvat-ob-og-ceb-ne-obmanyval-kogda-anonsiroval-tir-1-komandu"
],
[
"cybersport.ru",
"Ceb о Topson на Magnus: «Collapse вернулся из отпуска и присоединился к OG»",
"вчера",
"https://www.cybersport.ru/tags/dota-2/ceb-o-topson-na-magnus-collapse-vernulsya-iz-otpuska-i-prisoyedinilsya-k-og"
]
]
},
{
"id": "save",
"teams": [
8255888
],
"title": "Save- на миде: зачем BetBoom переставили игроков",
"lede": "RAMZES666 считает, что Save- ушёл на мид за мотивацией. Petushara уверен: к середине сезона всё вернут.",
"main": [
"RAMZES666: «Save- мог устать от четвёртой позиции»",
"Petushara: «Save- на 4-й гораздо комфортнее»"
],
"ups": [
{
"t": "вчера, 22:40",
"text": "Petushara: BetBoom вернёт игроков на свои позиции",
"key": false,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/petushara-blizhe-k-seredine-sezona-betboom-team-vernet-igrokov-na-svoi-pozitsii"
},
{
"t": "вчера, 22:32",
"text": "RAMZES666 о переходе Save- на мид",
"key": false,
"src": "hawk.live",
"url": "https://hawk.live/posts/ramzes666-reveals-real-reason-behind-saves-move-mid"
}
],
"imgs": [
"../news/img/n25.jpg",
"../news/img/n9.jpg"
],
"ago": "вчера",
"src": [
[
"cybersport.ru",
"Petushara: «Ближе к середине сезона BETBOOM TEAM вернет игроков на свои позиции»",
"вчера",
"https://www.cybersport.ru/tags/dota-2/petushara-blizhe-k-seredine-sezona-betboom-team-vernet-igrokov-na-svoi-pozitsii"
],
[
"hawk.live",
"RAMZES666 Reveals the Real Reason Behind Save's Move to Mid",
"вчера",
"https://hawk.live/posts/ramzes666-reveals-real-reason-behind-saves-move-mid"
]
]
},
{
"id": "cr1t",
"teams": [],
"title": "Cr1t-: мид — «безмозглая роль», а по про-сцене он не скучает",
"lede": "Бывший саппорт считает мид проще оффлейна и лишь немного сложнее керри.",
"main": [
"«Мид — это не тяжёлая роль. Она сложнее керри, но на этом всё»",
"«Я совсем не скучаю по про-сцене. Может, в следующем году»"
],
"ups": [
{
"t": "вчера, 20:14",
"text": "Cr1t- не скучает по про-сцене",
"key": false,
"src": "hawk.live",
"url": "https://hawk.live/posts/cr1t-gave-honest-answer-whether-misses-dota-2-pro-scene"
},
{
"t": "вчера, 16:47",
"text": "Cr1t- о сложности ролей",
"key": false,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/cr1t-mid-yeto-bezmozglaya-rol-eto-ne-tyazhelaya-pozitsiya"
}
],
"imgs": [
"../news/img/n19.jpg",
"../news/img/n26.jpg"
],
"ago": "вчера",
"src": [
[
"hawk.live",
"Cr1t gave an honest answer about whether he misses the Dota 2 pro scene",
"вчера",
"https://hawk.live/posts/cr1t-gave-honest-answer-whether-misses-dota-2-pro-scene"
],
[
"cybersport.ru",
"Cr1t-: «Мид — это безмозглая роль. Это не тяжелая позиция»",
"вчера",
"https://www.cybersport.ru/tags/dota-2/cr1t-mid-yeto-bezmozglaya-rol-eto-ne-tyazhelaya-pozitsiya"
]
]
},
{
"id": "s2",
"title": "NS: крупного патча не будет ещё пару месяцев",
"lede": "Сначала Valve выпустит продолжение «Тёмного карнавала» — через 15–45 дней, потом патч.",
"ago": "3 ч",
"ups": [
{
"t": "09:42",
"text": "NS: крупного патча не будет ещё пару месяцев",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/ns-nikakogo-krupnogo-patcha-yeshche-paru-mesyatsev-tochno-ne-budet"
}
],
"src": [
[
"cybersport.ru",
"NS: «Никакого крупного патча еще пару месяцев точно не будет»",
"3 ч",
"https://www.cybersport.ru/tags/dota-2/ns-nikakogo-krupnogo-patcha-yeshche-paru-mesyatsev-tochno-ne-budet"
]
],
"main": [
"Сначала Valve выпустит продолжение «Тёмного карнавала» — через 15–45 дней, потом патч."
],
"imgs": [],
"teams": []
},
{
"id": "s6",
"title": "Весь состав PlayTime по Dota 2 ушёл в инактив",
"lede": "Abed, Elmisho и FCR приостановили карьеру — в команде не осталось игроков.",
"ago": "1 ч",
"ups": [
{
"t": "12:27",
"text": "Весь состав PlayTime по Dota 2 ушёл в инактив",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/ves-sostav-playtime-po-dota-2-ushel-v-inaktiv"
}
],
"src": [
[
"cybersport.ru",
"Весь состав PlayTime по Dota 2 ушел в инактив",
"1 ч",
"https://www.cybersport.ru/tags/dota-2/ves-sostav-playtime-po-dota-2-ushel-v-inaktiv"
]
],
"main": [
"Abed, Elmisho и FCR приостановили карьеру — в команде не осталось игроков."
],
"imgs": [],
"teams": []
},
{
"id": "s24",
"title": "Dyrachyo: до про-сцены у меня была порядочность 1",
"lede": "Игрок признался, что получал бан на полгода и постоянные муты в рейтинге.",
"ago": "3 ч",
"ups": [
{
"t": "10:18",
"text": "Dyrachyo: до про-сцены у меня была порядочность 1",
"key": true,
"src": "hawk.live",
"url": "https://hawk.live/posts/dyrachyo-discussed-strict-restrictions-account-due-behavior-matchmaking"
}
],
"src": [
[
"hawk.live",
"Dyrachyo Discussed the Strict Restrictions on His Account Due to His Behavior in Matchmaking",
"3 ч",
"https://hawk.live/posts/dyrachyo-discussed-strict-restrictions-account-due-behavior-matchmaking"
]
],
"main": [
"Игрок признался, что получал бан на полгода и постоянные муты в рейтинге."
],
"imgs": [],
"teams": []
},
{
"id": "s8",
"title": "Niku: уйду из NAVI только в команду того же уровня",
"lede": "Даже за зарплату в три раза выше — нет, если команда слабее.",
"ago": "12 ч",
"ups": [
{
"t": "00:40",
"text": "Niku: уйду из NAVI только в команду того же уровня",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/mider-navi-o-potentsialnoi-smene-kluba-perekhodit-v-boleye-slabuyu-komandu-net"
}
],
"src": [
[
"cybersport.ru",
"Niku рассказал, при каких условиях готов уйти из NAVI",
"12 ч",
"https://www.cybersport.ru/tags/dota-2/mider-navi-o-potentsialnoi-smene-kluba-perekhodit-v-boleye-slabuyu-komandu-net"
]
],
"main": [
"Даже за зарплату в три раза выше — нет, если команда слабее."
],
"imgs": [],
"teams": []
},
{
"id": "s10",
"title": "RAMZES666: про-сцену Dota 2 через пару лет ждут большие перемены",
"lede": "«Этот год, следующий, а дальше как будто что-то будет очень сильно меняться».",
"ago": "вчера",
"ups": [
{
"t": "вчера, 19:30",
"text": "RAMZES666: про-сцену Dota 2 через пару лет ждут большие перемены",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/ramzes666-o-professionalnoi-stsene-dota-2-dumayu-yetot-god-sleduyushchii-a"
}
],
"src": [
[
"cybersport.ru",
"RAMZES666 порассуждал о будущем профессиональной сцены Dota 2",
"вчера",
"https://www.cybersport.ru/tags/dota-2/ramzes666-o-professionalnoi-stsene-dota-2-dumayu-yetot-god-sleduyushchii-a"
]
],
"main": [
"«Этот год, следующий, а дальше как будто что-то будет очень сильно меняться»."
],
"imgs": [],
"teams": []
},
{
"id": "s11",
"title": "Lelis: без русского языка попасть в команду гораздо труднее",
"lede": "Сцена сосредоточена в Европе, многие составы — из Восточной Европы.",
"ago": "вчера",
"ups": [
{
"t": "вчера, 18:55",
"text": "Lelis: без русского языка попасть в команду гораздо труднее",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/lelis-esli-ty-ne-govorish-po-russki-popast-v-komandu-gorazdo-trudneye"
}
],
"src": [
[
"cybersport.ru",
"Lelis: «Eсли ты не говоришь по-русски, попасть в команду гораздо труднее»",
"вчера",
"https://www.cybersport.ru/tags/dota-2/lelis-esli-ty-ne-govorish-po-russki-popast-v-komandu-gorazdo-trudneye"
]
],
"main": [
"Сцена сосредоточена в Европе, многие составы — из Восточной Европы."
],
"imgs": [],
"teams": []
},
{
"id": "s12",
"title": "На reddit просят Valve проверить Execration на договорные матчи",
"lede": "Автор поста подозревает стак Kukuys, но доказательств не приводит.",
"ago": "вчера",
"ups": [
{
"t": "вчера, 18:22",
"text": "На reddit просят Valve проверить Execration на договорные матчи",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/kuku-armel-i-gabbi-zapodozrili-v-322-polzovatel-reddit-prizval-valve-razobrat"
}
],
"src": [
[
"cybersport.ru",
"На reddit призвали Valve расследовать возможное 322 в Execration по Dota 2",
"вчера",
"https://www.cybersport.ru/tags/dota-2/kuku-armel-i-gabbi-zapodozrili-v-322-polzovatel-reddit-prizval-valve-razobrat"
]
],
"main": [
"Автор поста подозревает стак Kukuys, но доказательств не приводит."
],
"imgs": [],
"teams": []
},
{
"id": "s14",
"title": "ESL One 2027 пройдёт в Мюнхене на LAN",
"lede": "4–11 апреля, 16 команд, $1 млн, финальные дни — на арене BMW Park со зрителями.",
"ago": "вчера",
"ups": [
{
"t": "вчера, 18:10",
"text": "ESL One 2027 пройдёт в Мюнхене на LAN",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/esl-provedet-lan-po-dota-2-v-myunkhene-v-2027-godu"
}
],
"src": [
[
"cybersport.ru",
"ESL проведёт LAN по Dota 2 в Мюнхене в 2027 году",
"вчера",
"https://www.cybersport.ru/tags/dota-2/esl-provedet-lan-po-dota-2-v-myunkhene-v-2027-godu"
]
],
"main": [
"4–11 апреля, 16 команд, $1 млн, финальные дни — на арене BMW Park со зрителями."
],
"imgs": [],
"teams": []
},
{
"id": "s20",
"title": "Kaffs о словах Misha про Wisper: «Это абсолютная ложь»",
"lede": "Тренер OG заступился за оффлейнера Liquid: Wisper хорошо говорит по-английски.",
"ago": "вчера",
"ups": [
{
"t": "вчера, 15:35",
"text": "Kaffs о словах Misha про Wisper: «Это абсолютная ложь»",
"key": true,
"src": "cybersport.ru",
"url": "https://www.cybersport.ru/tags/dota-2/kaffs-o-slovakh-misha-pro-wisper-eto-absolyutnaya-lozh-yeshche-kogda-my-byli-v"
}
],
"src": [
[
"cybersport.ru",
"Каffs о словах Misha про Wisper: «Это абсолютная ложь. Ещё когда мы были в Heroic, он уже очень хорошо говорил на английском»",
"вчера",
"https://www.cybersport.ru/tags/dota-2/kaffs-o-slovakh-misha-pro-wisper-eto-absolyutnaya-lozh-yeshche-kogda-my-byli-v"
]
],
"main": [
"Тренер OG заступился за оффлейнера Liquid: Wisper хорошо говорит по-английски."
],
"imgs": [],
"teams": []
}
];
window.NEWS_QUOTES = [
{
"name": "y0nd",
"role": "кастер",
"text": "Pure~, по слухам, был до 5 утра на концерте, а в 11 утра была официальная игра. Считаю это максимально неспортивным и дурацким решением.",
"src": "cybersport.ru",
"t": "11:51",
"img": "../news/img/n5.jpg"
},
{
"name": "NS",
"role": "аналитик",
"text": "Никакого крупного патча игры не будет ещё пару месяцев точно. Сначала выйдет продолжение ивента, потом уже патч.",
"src": "cybersport.ru",
"t": "09:42",
"img": "../news/img/n2.jpg"
},
{
"name": "Fishman",
"role": "экс-игрок",
"text": "Бигнум рвётся в тир-1, красава, не ожидал от него таких результатов.",
"src": "cybersport.ru",
"t": "10:34",
"img": "../news/img/n7.jpg"
},
{
"name": "Niku",
"role": "мидер NAVI",
"text": "Очевидно, что я согласился бы на зарплату в три раза выше, если бы оказался в команде того же уровня.",
"src": "cybersport.ru",
"t": "00:40",
"img": "../news/img/n8.jpg"
},
{
"name": "Cr1t-",
"role": "игрок",
"text": "Мид — это безмозглая роль. Это не тяжёлая позиция.",
"src": "cybersport.ru",
"t": "вчера, 16:47",
"img": "../news/img/n19.jpg"
}
];
