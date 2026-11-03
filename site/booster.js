// FantasyWeb — бустер (страница chest.html, форма по умолчанию; blocks/chest/booster.html, стили — styles.css [=== Бустер ===]).
// Перенос лабы «Свечение» v6 (дирижёр 05.10): фольгированный пак в манере карты «Хайперглитч», один разрез мышью, обе части обёртки
// падают вниз, колода из трёх карт рубашкой раскладывается по местам карт сайта, делает круг, и каждая 3D-карта встаёт ребром —
// дальше доворачивается настоящая карта Хайперглитч (по одной, лучшая — последней). Свет — мягкий CSS-ореол («Свечение» v1).
// Режимы адреса — как у сундука (chest.js): ?mini — превью для виджета главной (парит, клик — открыть страницу), ?embed — онбординг
// (без панелей; когда карты раскрыты — postMessage 'chest-opened' родителю). Three.js — с CDN (importmap в blocks/chest/scene.html).
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const st = document.querySelector('#booster-scene .bs')
const cssVar = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim()
const tok = (t) => new THREE.Color(cssVar(t))
const q = new URLSearchParams(location.search), MINI = q.has('mini'), EMBED = q.has('embed')
if (MINI) document.documentElement.classList.add('cs-mini')
if (EMBED) document.documentElement.classList.add('cs-embed')

// Редкость: цвет света и основной цвет фольги
const RAR = {
  base: { ru: 'Base', glow: '--c-muted', main: '--c-tier-silver' },
  holo: { ru: 'Holo', glow: '--c-rarity-holo-4', main: '--c-rarity-holo-4', irid: 1 },
  prism: { ru: 'Prism', glow: '--c-rarity-holo-5', main: '--c-rarity-holo-5', irid: 1 },
  legend: { ru: 'Legend', glow: '--c-tier-gold', main: '--c-tier-gold' },
}
let rar = 'legend'

// ——— Сцена ———
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.localClippingEnabled = true
st.prepend(renderer.domElement)
let inView = true, shown = !document.hidden
new IntersectionObserver(([e]) => { inView = e.isIntersecting }).observe(renderer.domElement)
document.addEventListener('visibilitychange', () => { shown = !document.hidden })
const scene = new THREE.Scene()
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
camera.position.set(0, 0.25, 8.2); camera.lookAt(0, 0.2, 0)
if (MINI) { camera.position.set(0, 0.2, 6.4); camera.lookAt(0, 0.1, 0) } // превью — крупнее
scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a10, 0.6))
const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(3, 5, 6); scene.add(key)
const rim = new THREE.DirectionalLight(tok('--c-accent'), 2.2); rim.position.set(-5, 3, -4); scene.add(rim)
const rim2 = new THREE.DirectionalLight(0xffffff, 1.2); rim2.position.set(5, -2, -3); scene.add(rim2)

// ——— Анимации: tween по кадрам ———
const tweens = []
const tween = (ms, fn, ease = (k) => 1 - (1 - k) ** 3) => new Promise((res) => tweens.push({ t0: performance.now(), ms, fn, ease, res }))
const back = (k) => { const c = 1.6; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2 }
const wait = (ms) => tween(ms, () => {})

// ——— Холсты: текстуры ———
const canvasTex = (w, h, draw, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
// Мягкая точка (искры): гаусс до нуля к краю
const dotTex = (() => { const N = 128, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), img = g.createImageData(N, N)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const dx = (x + 0.5) / N * 2 - 1, dy = (y + 0.5) / N * 2 - 1, r2 = dx * dx + dy * dy, i = (y * N + x) * 4
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = r2 >= 1 ? 0 : Math.exp(-4.2 * r2) * (1 - r2) ** 2 * 255 }
  g.putImageData(img, 0, 0); return new THREE.CanvasTexture(c) })()
// Мятая фольга (рельеф) и рифлёный шов
const crinkle = canvasTex(512, 768, (g, w, h) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 260; i++) { const x = Math.random() * w, y = Math.random() * h, a = (Math.random() - 0.5) * 1.2 + (Math.random() < 0.5 ? 0 : Math.PI / 2), l = 20 + Math.random() * 120
    g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.22)'; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke() }
  g.filter = 'blur(1.5px)'; g.drawImage(g.canvas, 0, 0); g.filter = 'none'
}, false)
const crimpTex = canvasTex(512, 32, (g, w, h) => { for (let x = 0; x < w; x += 8) { const gr = g.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, '#202020'); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#202020'); g.fillStyle = gr; g.fillRect(x, 0, 8, h) } }, false)

// Манера Хайперглитча: срезанные углы (полигон .g1__frame 220×308), глитч-срезы, разведённые каналы
const cutPath = (g, w, h, k = 0) => { const sx = w / 220, sy = h / 308; g.beginPath(); [[18, 1], [219, 1], [219, 284], [196, 307], [1, 307], [1, 18]].forEach(([x, y], i) => { const X = x * sx + (x < 110 ? k : -k), Y = y * sy + (y < 154 ? k : -k); i ? g.lineTo(X, Y) : g.moveTo(X, Y) }); g.closePath() }
const glitch = (g, w, h, n, amp) => {
  for (let i = 0; i < n; i++) { const y = Math.random() * h, hh = 2 + Math.random() * 10, dx = (Math.random() - 0.5) * amp
    g.globalAlpha = 0.22; g.fillStyle = cssVar(Math.random() < 0.5 ? '--c-rarity-holo-4' : '--c-rarity-holo-1'); g.fillRect(dx, y, w, hh) }
  g.globalAlpha = 0.08; g.fillStyle = '#fff'; for (let i = 0; i < n * 6; i++) { const s = 2 + Math.floor(Math.random() * 4); g.fillRect(Math.floor(Math.random() * w / s) * s, Math.floor(Math.random() * h / s) * s, s, s) }
  g.globalAlpha = 1
}
const glitchText = (g, t, x, y, font, ink, off) => {
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.75
  g.fillStyle = cssVar('--c-rarity-holo-4'); g.fillText(t, x - off, y); g.fillStyle = cssVar('--c-rarity-holo-1'); g.fillText(t, x + off, y)
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = ink; g.fillText(t, x, y)
}
const scanlines = (g, w, h, a) => { g.globalAlpha = a; g.fillStyle = '#fff'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); g.globalAlpha = 1 }
// Рисунок пака: тёмная основа, цвет редкости за эмблемой, срезанная рамка, F со сбоем, имя редкости
const packFace = (r, backSide) => canvasTex(512, 768, (g, w, h) => {
  const main = cssVar(RAR[r].glow)
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, cssVar('--c-card-ink-2')); bg.addColorStop(0.55, cssVar('--c-card-ink')); bg.addColorStop(1, cssVar('--c-card-ink-2')); g.fillStyle = bg; g.fillRect(0, 0, w, h)
  const rg = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.7); rg.addColorStop(0, main + '66'); rg.addColorStop(1, main + '00'); g.fillStyle = rg; g.fillRect(0, 0, w, h)
  scanlines(g, w, h, 0.07); glitch(g, w, h, 26, 70)
  g.save(); g.translate(40, 70); cutPath(g, w - 80, h - 140); g.strokeStyle = main; g.lineWidth = 3; g.globalAlpha = 0.9; g.stroke(); g.restore(); g.globalAlpha = 1
  g.textAlign = 'center'; g.textBaseline = 'middle'
  if (backSide) {
    g.fillStyle = cssVar('--c-muted'); g.font = '600 24px Inter, sans-serif'; g.fillText('Fantasy · Dota 2', w / 2, h * 0.22)
    g.font = '500 20px Inter, sans-serif'; ['3 карты Хайперглитч', 'Одна — редкости ' + RAR[r].ru, 'Сезон 1'].forEach((t, i) => g.fillText(t, w / 2, h * (0.58 + i * 0.06)))
  } else {
    glitchText(g, 'F', w / 2, h * 0.4, '900 230px Inter, sans-serif', '#fff', 9)
    g.fillStyle = cssVar('--c-muted'); g.font = '600 24px Inter, sans-serif'; g.fillText('Fantasy · Dota 2', w / 2, h * 0.15)
    glitchText(g, RAR[r].ru, w / 2, h * 0.69, '800 76px Archivo, Inter, sans-serif', main, 4)
    g.fillStyle = cssVar('--c-caption'); g.font = '600 22px Inter, sans-serif'; g.fillText('3 карты игроков', w / 2, h * 0.78)
  }
})
// Рубашка 3D-карты в манере Хайперглитча; кант — цветом редкости
const cardBack = (r) => { const t = canvasTex(340, 476, (g, w, h) => {
  const glow = cssVar(RAR[r].glow)
  cutPath(g, w, h); g.save(); g.clip()
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, cssVar('--c-card-ink-2')); bg.addColorStop(1, cssVar('--c-card-ink')); g.fillStyle = bg; g.fillRect(0, 0, w, h)
  scanlines(g, w, h, 0.06); glitch(g, w, h, 14, 40)
  const rg = g.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, w * 0.5); rg.addColorStop(0, glow + '55'); rg.addColorStop(1, glow + '00'); g.fillStyle = rg; g.fillRect(0, 0, w, h)
  glitchText(g, 'F', w / 2, h * 0.47, '900 150px Inter, sans-serif', '#fff', 6)
  g.fillStyle = cssVar('--c-caption'); g.font = '600 18px Inter, sans-serif'; g.fillText('Fantasy · Dota 2', w / 2, h * 0.86)
  g.restore(); cutPath(g, w, h, 2); g.strokeStyle = glow; g.lineWidth = 4; g.stroke()
}); return t }

// ——— Пак: подушка из фольги (выпуклая середина, сплющенные края) и рифлёные швы ———
const W = 1.6, H = 2.45, D = 0.15, CH = 0.1
function pillow(backSide) {
  const geo = new THREE.PlaneGeometry(W, H, 48, 72), p = geo.attributes.position, uv = geo.attributes.uv
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), u = x / (W / 2), v = y / (H / 2)
    const by = 1 - THREE.MathUtils.smoothstep(Math.abs(v), 0.76, 0.92), wr = (Math.sin(x * 23 + y * 7) + Math.sin(x * 9 - y * 31)) * 0.004
    p.setXYZ(i, x, y, (D * Math.pow(Math.max(0, 1 - u * u), 0.55) + wr) * by)
    uv.setXY(i, backSide ? 1 - (x + W / 2) / W : (x + W / 2) / W, (y + H / 2) / H)
  }
  geo.computeVertexNormals(); return geo
}
// Материалы с одной «пустой» плоскостью отсечения и двусторонние сразу — шейдер собран до разреза, без подвисания
const keepAll = () => [new THREE.Plane(new THREE.Vector3(0, 0, 1), 1e4)]
function makePack() {
  const g = new THREE.Group(), R = RAR[rar]
  const foil = (map) => new THREE.MeshPhysicalMaterial({ map, metalness: 0.55, roughness: 0.3, bumpMap: crinkle, bumpScale: 2.2, clearcoat: 0.8, clearcoatRoughness: 0.25,
    iridescence: R.irid || 0, iridescenceIOR: 1.5, iridescenceThicknessRange: [180, 700], side: THREE.DoubleSide, clippingPlanes: keepAll() })
  g.add(new THREE.Mesh(pillow(false), foil(packFace(rar, false))))
  const b = new THREE.Mesh(pillow(true), foil(packFace(rar, true))); b.rotation.y = Math.PI; g.add(b)
  const cm = new THREE.MeshStandardMaterial({ color: rar === 'legend' ? tok('--c-tier-gold') : tok('--c-tier-silver'), metalness: 1, roughness: 0.35, bumpMap: crimpTex, bumpScale: 4, side: THREE.DoubleSide, clippingPlanes: keepAll() })
  ;[-1, 1].forEach((s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(W * 1.01, CH, 0.024), cm); m.position.y = s * (H / 2 - CH / 2); g.add(m) })
  return g
}

// ——— Разрез: две копии пака, каждая обрезана своей стороной плоскости; плоскость едет вместе с куском ———
function cutPack(parent, pack, p1w, p2w) {
  pack.updateWorldMatrix(true, false)
  const p1 = pack.worldToLocal(p1w.clone()), p2 = pack.worldToLocal(p2w.clone())
  const d = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, 0).normalize(), n = new THREE.Vector3(-d.y, d.x, 0), c = -(n.x * p1.x + n.y * p1.y)
  const halves = [1, -1].map((s) => {
    const h = pack.clone(true), lp = new THREE.Plane(n.clone().multiplyScalar(s), c * s), wp = new THREE.Plane()
    h.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.clippingPlanes = [wp] } })
    parent.add(h); return { h, lp, wp, n: n.clone().multiplyScalar(s) }
  })
  parent.remove(pack)
  return halves
}
const crosses = (p1, p2) => {
  const inside = (p) => Math.abs(p.x) < W / 2 && Math.abs(p.y) < H / 2
  if (inside(p1) || inside(p2) || p1.distanceTo(p2) < 1) return false
  const d = p2.clone().sub(p1), n = new THREE.Vector3(-d.y, d.x, 0).normalize()
  return Math.abs(n.dot(p1)) < Math.min(W, H) / 2 * 0.92
}

// ——— След курсора на 2D-холсте (без shadowBlur — он дорогой): три мазка разной ширины ———
const trailCv = st.querySelector('.bs__trail'), tcx = trailCv.getContext('2d'), pts = []
let dirty = false
const drawTrail = (now) => {
  if (!pts.length) { if (dirty) { tcx.clearRect(0, 0, trailCv.width, trailCv.height); dirty = false } return }
  tcx.clearRect(0, 0, trailCv.width, trailCv.height); dirty = true
  while (pts.length && now - pts[0].t > 320) pts.shift()
  if (pts.length < 2) return
  const col = cssVar(RAR[rar].glow); tcx.lineCap = tcx.lineJoin = 'round'
  for (const [wd, al, c] of [[24, 0.12, col], [11, 0.35, col], [3.3, 1, '#fff']]) {
    tcx.strokeStyle = c
    for (let i = 1; i < pts.length; i++) { const k = 1 - (now - pts[i].t) / 320; tcx.globalAlpha = al * k; tcx.lineWidth = Math.max(0.5, wd * k); tcx.beginPath(); tcx.moveTo(pts[i - 1].x, pts[i - 1].y); tcx.lineTo(pts[i].x, pts[i].y); tcx.stroke() }
  }
  tcx.globalAlpha = 1
}
const local = (e) => { const r = trailCv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() } }
const toScreen = (v) => { const p = v.clone().project(camera), r = trailCv.getBoundingClientRect(); return { x: (p.x + 1) / 2 * r.width, y: (1 - p.y) / 2 * r.height, t: performance.now() } }
const onPlane = (e, z0 = 0) => { const r = renderer.domElement.getBoundingClientRect(), rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera); const p = new THREE.Vector3(); rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -z0), p); return p }

// ——— Искры цветом редкости ———
const NS = 500, spos = new Float32Array(NS * 3), svel = new Float32Array(NS * 3), sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(spos, 3))
const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ map: dotTex, size: 0.045, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(sparks)
const burst = (pos, power = 1, up = 0) => { for (let i = 0; i < NS; i++) { spos.set([pos.x + (Math.random() - 0.5) * 0.4, pos.y + (Math.random() - 0.5) * 0.3, pos.z], i * 3); const a = Math.random() * Math.PI * 2, s = (0.6 + Math.random() * 3.4) * power; svel.set([Math.cos(a) * s, Math.sin(a) * s + up * (1 + Math.random() * 3), (Math.random() - 0.2) * 2 * power], i * 3) } sparks.material.opacity = 1 }

// ——— Ореол позади сцены (CSS) ———
const halo = st.querySelector('.bs__halo')
// Свет бустера — только этот ореол (дирижёр 05.10: «как в v1» лабы «Свечение»), без свечения вокруг карт
const haloAt = (pos, k, size = 1) => { const p = pos.clone().project(camera); halo.style.left = (p.x + 1) / 2 * 100 + '%'; halo.style.top = (1 - p.y) / 2 * 100 + '%'; halo.style.setProperty('--s', 70 * size + 'vmin'); halo.style.opacity = Math.min(1, k * 0.9) }

// ——— Сборка сцены ———
const html = [...st.querySelectorAll('.cs__card')]
const hint = (t) => { st.querySelector('.cs__hint').textContent = t }
const CW = 1.1, CHt = 1.1 * 7 / 5
let root = null, pack = null, halves = [], deck = null, cards = [], done = false, busy = false
const target = { x: 0, y: 0 }
function mount() {
  if (root) scene.remove(root)
  tweens.length = 0; done = false; busy = false; pts.length = 0
  root = new THREE.Group(); scene.add(root)
  pack = makePack(); root.add(pack); halves = []
  const glow = tok(RAR[rar].glow)
  st.style.setProperty('--rc', `var(${RAR[rar].glow})`)
  // Колода внутри пака: три рубашки
  deck = new THREE.Group(); root.add(deck); deck.position.y = -0.1
  const backMat = new THREE.MeshBasicMaterial({ map: cardBack(rar), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })
  // Обычное смешивание, не сложение: свечение не пересвечивается в жёлто-белую полосу на ярком экране, а остаётся мягкой дымкой цвета редкости
  cards = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(CW, CHt), backMat); m.position.z = (i - 1) * 0.012; deck.add(m); return m })
  sparks.material.color.copy(glow); sparks.material.opacity = 0
  halo.style.opacity = 0
  // Карты сайта: спрятаны на своих местах; лучшая — выбранной редкости
  st.classList.remove('is-done', 'is-open')
  html.forEach((c) => c.classList.remove('is-in', 'is-flip'))
  const best = st.querySelector('.cs__card--best .kc'); Object.keys(RAR).forEach((r) => best.classList.toggle(`kc--${r}`, r === rar))
  st.querySelectorAll('[data-rar]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rar === rar)))
  hint('Проведи через бустер — разрежь')
}

// Место карты сайта → точка и масштаб 3D-карты в колоде (масштаб — до worldToLocal: он меняет сам вектор)
const slot = (el) => {
  const r = el.getBoundingClientRect(), cv = renderer.domElement.getBoundingClientRect()
  const p = onPlane({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, 1.2)
  const a = p.clone().setY(p.y + CHt / 2).project(camera), b = p.clone().setY(p.y - CHt / 2).project(camera)
  const s = el.offsetHeight / ((a.y - b.y) / 2 * cv.height)
  return { p: deck.worldToLocal(p), s, rz: -THREE.MathUtils.degToRad((+el.style.getPropertyValue('--i') - 1) * 5) }
}

async function open(p1, p2) {
  done = busy = true; hint('')
  halves = cutPack(root, pack, p1, p2)
  const top = halves[0].n.y > 0 ? halves[0] : halves[1], low = top === halves[0] ? halves[1] : halves[0]
  const c = root.localToWorld(new THREE.Vector3(0, 0, 0.3))
  burst(c, 0.5, 0.6)
  tween(700, (k) => { haloAt(c, k * 0.4) })
  // Обёртка: верх кувырком к зрителю и вниз, низ съезжает с трением и падает
  tween(1300, (k) => { top.h.position.set(k * 0.5, Math.sin(k * Math.PI) * 0.7 - k * k * 5.5, 0.2 + k * 1.6); top.h.rotation.set(k * 4.2, k * 0.6, k * 0.8) }, (k) => k)
  tween(1400, (k) => { low.h.position.y = -(k < 0.3 ? k * 0.5 + Math.sin(k * 40) * 0.01 : 0.15 + (k - 0.3) ** 2 * 10); low.h.position.z = 0.15 * Math.min(1, k * 4); low.h.rotation.set(-k * k * 1.2, 0, Math.sin(k * 9) * 0.03 * (1 - k) - k * k * 0.4) }, (k) => k)
  await wait(450)
  // Колода поднимается к зрителю
  await tween(600, (k) => { deck.position.set(0, -0.1 + k * 0.55, k * 1.2) }, back)
  const dp = () => deck.getWorldPosition(new THREE.Vector3())
  // Веер — ровно по местам карт сайта, круг, и подмена по одной
  const T = html.map(slot), from = cards.map((m) => m.position.clone())
  await tween(750, (k) => cards.forEach((m, i) => { m.position.lerpVectors(from[i], T[i].p, k); m.scale.setScalar(1 + (T[i].s - 1) * k); m.rotation.z = T[i].rz * k }), back)
  await tween(700, (k) => { deck.rotation.y = k * Math.PI * 2; haloAt(dp(), 0.5 + k * 0.3) }, (k) => k * k * (3 - 2 * k))
  for (const [n, i] of [0, 2, 1].entries()) {
    const best = i === 1
    await tween(best ? 220 : 160, (k) => { cards[i].rotation.y = k * Math.PI / 2 }, (k) => k * k)
    cards[i].visible = false
    html[i].classList.add('is-in'); void html[i].offsetWidth; html[i].classList.add('is-flip')
    burst(cards[i].getWorldPosition(new THREE.Vector3()), best ? 0.7 : 0.3, 0.4)
    if (n < 2) await wait(260)
  }
  st.classList.add('is-done', 'is-open'); busy = false
  if (EMBED) setTimeout(() => parent.postMessage('chest-opened', '*'), 900)
  await tween(1300, (k) => haloAt(dp(), 0.8 * (1 - k * 0.8)))
}

// ——— Ввод: разрез мышью, «Открыть» — клинок по диагонали, редкость, «Ещё раз» ———
let a0 = null, drawing = false
const cv = renderer.domElement
cv.addEventListener('pointerdown', (e) => {
  if (MINI) { window.top.location.href = 'chest.html?form=booster'; return }
  if (done) return
  cv.setPointerCapture(e.pointerId); drawing = true; pts.push(local(e)); a0 = onPlane(e)
})
cv.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); target.x = (e.clientX - r.left) / r.width - 0.5; target.y = (e.clientY - r.top) / r.height - 0.5; if (drawing) pts.push(local(e)) })
cv.addEventListener('pointerup', (e) => {
  if (!drawing) return; drawing = false
  const b = onPlane(e)
  if (crosses(pack.worldToLocal(a0.clone()), pack.worldToLocal(b.clone()))) open(a0, b); else hint('Режь через весь бустер — от края до края')
})
const auto = () => {
  if (done) return
  const p1 = pack.localToWorld(new THREE.Vector3(-W * 0.9, H * 0.16, 0)), p2 = pack.localToWorld(new THREE.Vector3(W * 0.9, -H * 0.04, 0))
  done = true
  tween(280, (k) => pts.push(toScreen(p1.clone().lerp(p2, k))), (k) => k).then(() => open(p1, p2))
}
st.addEventListener('click', (e) => {
  const b = e.target.closest('[data-rar], [data-act]'); if (!b || busy) return
  if (b.dataset.rar) { rar = b.dataset.rar; mount() }
  if (b.dataset.act === 'open') auto()
  if (b.dataset.act === 'reset') mount()
})
const fit = () => { const w = st.clientWidth, h = st.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); trailCv.width = w; trailCv.height = h }
addEventListener('resize', fit); fit()

;(document.fonts?.ready ?? Promise.resolve()).then(() => {
  mount()
  let last = performance.now()
  renderer.setAnimationLoop((now) => {
    if (!inView || !shown) { last = now; return }
    const dt = Math.min(0.033, (now - last) / 1000); last = now
    for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.ms); tw.fn(tw.ease(k)); if (k === 1) { tweens.splice(i, 1); tw.res() } }
    const t = now / 1000
    if (!done) {
      // Пак парит; на странице — следует за курсором, в превью — медленно поворачивается
      pack.position.y = Math.sin(t * 1.5) * 0.05
      if (MINI) root.rotation.y = Math.sin(t * 0.6) * 0.5
      else { root.rotation.y += (target.x * 0.6 - root.rotation.y) * 0.06; root.rotation.x += (target.y * 0.25 - root.rotation.x) * 0.06 }
    }
    for (const hf of halves) { hf.h.updateWorldMatrix(true, false); hf.wp.copy(hf.lp).applyMatrix4(hf.h.matrixWorld) }
    if (sparks.material.opacity > 0) { for (let i = 0; i < NS; i++) { svel[i * 3] *= 0.985; svel[i * 3 + 1] = svel[i * 3 + 1] * 0.985 - 2.2 * dt; for (let k = 0; k < 3; k++) spos[i * 3 + k] += svel[i * 3 + k] * dt } sg.attributes.position.needsUpdate = true; sparks.material.opacity = Math.max(0, sparks.material.opacity - dt * 0.45) }
    drawTrail(now)
    renderer.render(scene, camera)
  })
})
