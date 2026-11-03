// Пример для лабы (дирижёр 22.10: «показать, когда не гранд-финал, а текущий ближайший матч»): BLAST SLAM VIII в середине плей-офф —
// идёт финал нижней сетки, гранд-финал ждёт победителя. Счёт и время выдуманы; в списке турниров не показываем (hidden).
(() => { const D = window.T4_DATA, src = D.tours.find(t => t.id === 'blast-slam-8')
  const b = JSON.parse(JSON.stringify(src.bracket))
  b.lower[2][1][0] = ['Team Spirit', null, 'PARIVISION', null, 'live']
  b.final[0][1][0] = ['Team Yandex', null, 'Победитель финала НС', null, '11.10, 17:00']
  D.tours.push({ ...src, id: 'blast-slam-8-live', hidden: true, stage: 'Плей-офф · финальный день', bracket: b })
})()
// Пример (дирижёр 22.10: «чтобы показать, что есть Tier 2»): в данных нет турниров tier 2 — PARI Universe и BLAST SLAM IX условно ставим tier 2
window.T4_DATA.tours.forEach(t => { if (t.id === 'pari-universe' || t.id === 'blast-slam-9') t.tier = 'A' })
