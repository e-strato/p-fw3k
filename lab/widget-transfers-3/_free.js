// v3 — пример (дирижёр 23.10: «показать, когда из ниоткуда»): Yuragi пришёл в IC без команды, Senzu ушёл в свободные агенты.
// ‼️ Выдумано для показа — в данных Liquipedia у обоих есть команды
(() => { const L = window.TR_DATA.list, by = n => L.find(p => p.nick === n)
  if (by('Yuragi')) by('Yuragi').from = null
  if (by('Senzu')) by('Senzu').to = null })()
