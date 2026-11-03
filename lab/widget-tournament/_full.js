// Кнопка «На весь экран ↗» в углу варианта: в песочнице вариант сидит в iframe 1440 — открываем его отдельной вкладкой
// (как в лабе «Сайт в одном стиле»). Вне iframe кнопки нет.
if (window.top !== window) {
  const a = document.createElement('a')
  a.className = 'lab-full'; a.href = location.href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'На весь экран ↗'
  document.body.appendChild(a)
}
