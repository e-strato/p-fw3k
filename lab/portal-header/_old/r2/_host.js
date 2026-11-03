// Страница варианта: рамки 1440 уменьшаются под ширину окна
const fit = () => document.querySelectorAll('.p-desk').forEach((d) => { d.style.zoom = Math.min(1, d.parentElement.clientWidth / 1440) })
fit(); addEventListener('resize', fit)
