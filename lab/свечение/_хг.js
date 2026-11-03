// Лаба «Свечение» под карту «Хайперглитч» (дирижёр 05.10: «мы выбрали карту — подправь под её вид»).
// Карты сайта — разметка blocks/shared/card-hg.html (стили — /p-fw3k/site/styles.css [=== Карта «Хайперглитч» ===]), три игрока;
// рубашка 3D-карт и рисунок пака — в её манере: срезанные углы, тёмная основа, глитч-срезы, разведённые цвета, пиксели.
import { THREE, RAR } from '../паки/_пак.js'
const css = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim()

const P = [
  { nick: 'Yatoro', name: 'Илья Мулярчук', flag: 'ua', team: 'Team Spirit', t: 'ts', img: 'yatoro', ovr: 88, role: '<b>Pos 1</b> · Carry', tier: 'gold', rar: 'holo', heroes: [['faceless_void', 'Faceless Void', 120, 71], ['terrorblade', 'Terrorblade', 88, 66], ['morphling', 'Morphling', 64, 62]], st: [91, 74, 66, 58, 41, 84], serial: '#044 / 400' },
  { nick: '9Class', name: 'Эдгар Налтакян', flag: 'ru', team: 'PARIVISION', t: 'pv', img: '9class', ovr: 95, role: '<b>Pos 4</b> · Support', tier: 'elite', best: true, heroes: [['rubick', 'Rubick', 95, 67], ['hoodwink', 'Hoodwink', 73, 67], ['tusk', 'Tusk', 72, 65]], st: [82, 60, 47, 91, 36, 67], serial: '#012 / 400' },
  { nick: 'Pure', name: 'Иван Москаленко', flag: 'ru', team: 'Tundra Esports', t: 'tun', img: 'pure', ovr: 93, role: '<b>Pos 1</b> · Carry', tier: 'elite', rar: 'prism', heroes: [['terrorblade', 'Terrorblade', 104, 69], ['morphling', 'Morphling', 77, 64], ['faceless_void', 'Faceless Void', 70, 61]], st: [88, 79, 52, 63, 44, 90], serial: '#027 / 400' },
]
const LBL = ['FRM', 'FGT', 'POOL', 'SUR', 'VIS', 'FORM'], lvl = (v) => (v >= 80 ? 'hi' : v >= 55 ? 'mid' : 'lo')
const hg = (p, rar) => {
  const logo = `/p-fw3k/site/img/teams/${p.t}.png`
  return `<div class="hg"><div class="kc kc--${p.tier} kc--${rar} g1"><div class="kc__in"><div class="kc__flip"><div class="kc__face">
<div class="g1__face">
  <div class="g1__plate" data-l="1"><div class="g1__bg" data-l="2">
    <i class="logo-mask g1__logo" style="--logo: url('${logo}')"></i>
    <i data-deco="2" class="logo-mask g1__logo g1__logo--a" style="--logo: url('${logo}')"></i>
    <i data-deco="2" class="logo-mask g1__logo g1__logo--b" style="--logo: url('${logo}')"></i>
    <i class="g1__pix" data-deco="1"></i></div>
    <i class="g1__halo"></i><img class="ph" src="/p-fw3k/site/img/players/${p.img}.webp" alt="${p.nick}">
    <i class="g1__slices" data-deco="2"></i><i class="g1__scan" data-deco="3"></i><div class="g1__panel"></div>
    <i class="fx fx-shine"></i><i class="fx fx-spark"><b></b><b></b><b></b><b></b><b></b><b></b></i></div>
  <svg class="g1__frame" viewBox="0 0 220 308" preserveAspectRatio="none" aria-hidden="true"><polygon class="out" points="18,1 219,1 219,284 196,307 1,307 1,18"></polygon></svg>
  <div class="g1__tab"><span><img class="logo" src="${logo}" alt="${p.team}"></span><hr><span class="g1__serial"><b>${p.serial}</b><small>Сезон 1</small></span></div>
  <div class="g1__ovr"><b>${p.ovr}</b></div>
  <div class="g1__heroes">${p.heroes.map(([h, n, m, w]) => `<div><img class="hero-ic" src="/p-fw3k/site/img/heroes/${h}.webp" alt="${n}"><small><b>${m} М</b><br>${w}%</small></div>`).join('')}</div>
  <span class="g1__role">${p.role}</span>
  <div class="g1__who"><div class="g1__nick">${p.nick}</div><div class="g1__name"><i class="flag flag--${p.flag}"></i>${p.name}</div></div>
  <div class="g1__stats">${p.st.map((v, i) => `<span><b data-v="${lvl(v)}">${v}</b><small>${LBL[i]}</small></span>`).join('')}</div>
  <div class="g1__team"><img class="logo" src="${logo}" alt="">${p.team}</div>
</div><i class="fx fx-glare"></i></div></div></div></div></div>`
}
// Карты сайта: те же места (.cs__card), внутри — Хайперглитч; лучшая (центр) — выбранной редкости
export function hgCards(K) {
  K.host.querySelector('.cs__cards').innerHTML = P.map((p, i) => `<div class="cs__card${p.best ? ' cs__card--best' : ''}" style="--i: ${i}"><div class="cs__flip"><div class="cs__front">${hg(p, p.best ? K.rar : p.rar)}</div></div></div>`).join('')
}

// Срезанные углы карты (как polygon .g1__frame, 220×308) на холсте w×h
const cutPath = (g, w, h, k = 0) => { const sx = w / 220, sy = h / 308; g.beginPath(); [[18, 1], [219, 1], [219, 284], [196, 307], [1, 307], [1, 18]].forEach(([x, y], i) => { const X = x * sx + (x < 110 ? k : -k), Y = y * sy + (y < 154 ? k : -k); i ? g.lineTo(X, Y) : g.moveTo(X, Y) }); g.closePath() }
// Глитч: горизонтальные срезы со сдвигом и разведёнными цветами + пиксели
const glitch = (g, w, h, n, amp) => {
  for (let i = 0; i < n; i++) { const y = Math.random() * h, hh = 2 + Math.random() * 10, dx = (Math.random() - 0.5) * amp
    g.globalAlpha = 0.22; g.fillStyle = css(Math.random() < 0.5 ? '--c-rarity-holo-4' : '--c-rarity-holo-1'); g.fillRect(dx, y, w, hh) }
  g.globalAlpha = 0.08; g.fillStyle = '#fff'; for (let i = 0; i < n * 6; i++) { const s = 2 + Math.floor(Math.random() * 4); g.fillRect(Math.floor(Math.random() * w / s) * s, Math.floor(Math.random() * h / s) * s, s, s) }
  g.globalAlpha = 1
}
// F с разведёнными каналами (голубой влево, розовый вправо), как сбой изображения
const glitchF = (g, x, y, size, ink) => {
  g.font = `900 ${size}px Inter, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.8
  g.fillStyle = css('--c-rarity-holo-4'); g.fillText('F', x - size * 0.04, y); g.fillStyle = css('--c-rarity-holo-1'); g.fillText('F', x + size * 0.04, y)
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = ink; g.fillText('F', x, y)
}

// Рубашка 3D-карты: тёмная основа со срезанными углами, сканлайны, глитч, F со сбоем, кант цвета редкости
export function hgBack(g, K) {
  const w = 340, h = 468, glow = '#' + K.glow().getHexString()
  cutPath(g, w, h); g.save(); g.clip()
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, css('--c-card-ink-2')); bg.addColorStop(1, css('--c-card-ink')); g.fillStyle = bg; g.fillRect(0, 0, w, h)
  g.globalAlpha = 0.06; g.fillStyle = '#fff'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); g.globalAlpha = 1
  glitch(g, w, h, 14, 40)
  const r = g.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, w * 0.5); r.addColorStop(0, glow + '55'); r.addColorStop(1, glow + '00'); g.fillStyle = r; g.fillRect(0, 0, w, h)
  glitchF(g, w / 2, h * 0.47, 150, '#fff')
  g.fillStyle = css('--c-caption'); g.font = '600 18px Inter, sans-serif'; g.fillText('Fantasy · Dota 2', w / 2, h * 0.86)
  g.restore()
  cutPath(g, w, h, 2); g.strokeStyle = glow; g.lineWidth = 4; g.stroke()
}

// Рисунок пака под Хайперглитч (только v6): тёмный глитч, срезанная рамка, F со сбоем, имя редкости со сдвигом
export function hgPackFace(r, { back = false } = {}) {
  const w = 512, h = 768, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')
  const R = RAR[r], main = css(R.glow)
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, css('--c-card-ink-2')); bg.addColorStop(0.55, css('--c-card-ink')); bg.addColorStop(1, css('--c-card-ink-2')); g.fillStyle = bg; g.fillRect(0, 0, w, h)
  // Цвет редкости — снизу и сзади эмблемы
  const rg = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.7); rg.addColorStop(0, main + '66'); rg.addColorStop(1, main + '00'); g.fillStyle = rg; g.fillRect(0, 0, w, h)
  g.globalAlpha = 0.07; g.fillStyle = '#fff'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); g.globalAlpha = 1
  glitch(g, w, h, 26, 70)
  // Срезанная рамка внутри
  g.save(); g.translate(40, 70); cutPath(g, w - 80, h - 140); g.strokeStyle = main; g.lineWidth = 3; g.globalAlpha = 0.9; g.stroke(); g.restore(); g.globalAlpha = 1
  g.textAlign = 'center'; g.textBaseline = 'middle'
  if (back) {
    g.fillStyle = css('--c-muted'); g.font = '600 24px Inter, sans-serif'; g.fillText('Fantasy · Dota 2', w / 2, h * 0.22)
    g.font = '500 20px Inter, sans-serif'; ['3 карты Хайперглитч', 'Одна — редкости ' + R.ru, 'Сезон 1'].forEach((t, i) => g.fillText(t, w / 2, h * (0.58 + i * 0.06)))
  } else {
    glitchF(g, w / 2, h * 0.4, 230, '#fff')
    g.fillStyle = css('--c-muted'); g.font = '600 24px Inter, sans-serif'; g.fillText('Fantasy · Dota 2', w / 2, h * 0.15)
    // Имя редкости со сдвигом каналов
    g.font = '800 76px Archivo, Inter, sans-serif'
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7; g.fillStyle = css('--c-rarity-holo-4'); g.fillText(R.ru, w / 2 - 4, h * 0.69); g.fillStyle = css('--c-rarity-holo-1'); g.fillText(R.ru, w / 2 + 4, h * 0.69)
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = main; g.fillText(R.ru, w / 2, h * 0.69)
    g.fillStyle = css('--c-caption'); g.font = '600 22px Inter, sans-serif'; g.fillText('3 карты игроков', w / 2, h * 0.78)
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t
}
