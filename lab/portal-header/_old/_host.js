// Страница варианта (только десктоп, дирижёр 15.10): рамки 1440 уменьшаются под ширину окна; «Гость / Играет в фэнтези» уходит во все рамки без перезагрузки
const fit = () => document.querySelectorAll('.p-desk').forEach(d => { d.style.zoom = Math.min(1, d.parentElement.clientWidth / 1440) })
fit(); addEventListener('resize', fit)
document.querySelectorAll('[data-user-seg] button').forEach(b => b.addEventListener('click', () => {
  b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b))
  document.querySelectorAll('iframe').forEach(f => f.contentWindow.postMessage({ ph: { user: b.dataset.v } }, '*'))
}))
