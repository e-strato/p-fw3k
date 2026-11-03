// FantasyWeb — страница «Сундук» (chest.html): 3D-сцена открытия — коробка или сундук, 5 материалов, свет цветом редкости.
// Перенесено из лаборатории «сундук-вид» (v15 — коробки, v16 — сундуки). Разметка — blocks/chest/scene.html, стили — styles.css [=== Сундук 3D ===].
// Three.js — с CDN (importmap в блоке). Сцена рисуется, только когда её видно. Данные и цвета — токены сайта.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const st = document.querySelector('#chest-scene .cs') // на странице есть и сцена бустера (blocks/chest/booster.html)
const cssVar = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim()
const tok = (t) => new THREE.Color(cssVar(t))
const hex = (t) => `#${tok(t).getHexString()}`
const mixHex = (a, b, k) => `#${tok(a).lerp(tok(b), k).getHexString()}`
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
st.prepend(renderer.domElement)
// Рисуем, только когда сцену видно: в лаборатории открыто много вариантов сразу — невидимые не тратят кадры
let inView = true, shown = !document.hidden
new IntersectionObserver(([e]) => { inView = e.isIntersecting }).observe(renderer.domElement)
document.addEventListener('visibilitychange', () => { shown = !document.hidden })
const scene = new THREE.Scene()
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
camera.position.set(0, 2.6, 7.8); camera.lookAt(0, 0.9, 0)
scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a10, 0.5))
const key = new THREE.DirectionalLight(0xffffff, 2.2)
key.position.set(3, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6
Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); scene.add(key)
const rim = new THREE.DirectionalLight(tok('--c-accent'), 2); rim.position.set(-5, 4, -5); scene.add(rim)

// ——— Камень и картон: процедурные карты цвета и рельефа (bump), чтобы материал читался светом, а не только цветом ———
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }
const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5 } return s }
const texFrom = (w, h, px, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, gg, b] = px(x, y), i = (y * w + x) * 4; img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255 }
  g.putImageData(img, 0, 0); return { c, g } }
const toTex = ({ c }, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t }
const rgb = (t) => { const c = tok(t); return [c.r * 255, c.g * 255, c.b * 255] }
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
// F на карте рельефа — вдавлена (тёмное = ниже), с мягким краем
const carveF = (g, depth, blur = 3) => { g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = `rgba(0,0,0,${depth})`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 150px Inter, sans-serif'; g.fillText('F', 256, 260); g.restore() }
function stoneMaps() {
  // Серо-тёплый камень: крупные пятна (fbm), прожилки, крапинки и мелкие каверны
  const dark = lerp3(rgb('--c-card-ink'), rgb('--c-muted'), 0.28), light = lerp3(rgb('--c-muted'), rgb('--c-rarity-foil-3'), 0.12)
  const H2 = new Float32Array(512 * 512)
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const n = fbm(x / 90, y / 90, 5), vein = 1 - Math.abs(fbm(x / 140 + 7, y / 140 + 3, 4) * 2 - 1), spot = hash(x, y) > 0.985 ? -0.25 : hash(x + 3, y) > 0.99 ? 0.15 : 0
    H2[y * 512 + x] = Math.min(1, Math.max(0, n * 0.9 + Math.pow(vein, 14) * 0.25 + spot))
  }
  const col = texFrom(512, 512, (x, y) => { const h = H2[y * 512 + x]; return lerp3(dark, light, 0.25 + h * 0.75) })
  const bmp = texFrom(512, 512, (x, y) => { const v = (0.35 + H2[y * 512 + x] * 0.65) * 255; return [v, v, v] })
  // F — вырезана: в рельефе ниже, в цвете чуть темнее
  carveF(bmp.g, 0.75); carveF(col.g, 0.35, 2)
  return { map: toTex(col), bump: toTex(bmp, false) }
}
function cardMaps(withF = true) {
  // Крафт-картон: тёплый бежевый, волокна, еле заметный гофр (вертикальные полосы), потёртые края
  const base = lerp3(rgb('--c-tier-bronze'), rgb('--c-rarity-foil-3'), 0.42), dark = lerp3(base, rgb('--c-tier-bronze-2'), 0.35)
  const col = texFrom(512, 512, (x, y) => { const n = fbm(x / 40, y / 40, 3), fib = (hash(x, Math.floor(y / 3)) - 0.5) * 0.06, edge = Math.min(x, y, 511 - x, 511 - y) < 10 ? 0.12 : 0
    return lerp3(base, dark, Math.max(0, n * 0.35 - 0.05 + fib + edge)) })
  const bmp = texFrom(512, 512, (x, y) => { const flute = 0.5 + Math.sin(x / 512 * Math.PI * 2 * 64) * 0.08, fib = (hash(x * 3, y) - 0.5) * 0.12; const v = (flute + fib) * 255; return [v, v, v] })
  // Волоконца поверх
  col.g.globalAlpha = 0.07; col.g.strokeStyle = `rgb(${dark.join(',')})`; for (let i = 0; i < 700; i++) { const x = Math.random() * 512, y = Math.random() * 512, a = Math.random() * Math.PI; col.g.beginPath(); col.g.moveTo(x, y); col.g.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); col.g.stroke() } col.g.globalAlpha = 1
  if (withF) {
    // Печать краской: не идеально ровная — пропуски и неравномерная плотность
    const ink = document.createElement('canvas'); ink.width = ink.height = 512; const ig = ink.getContext('2d')
    ig.fillStyle = `rgb(${rgb('--c-tier-bronze-2').join(',')})`; ig.textAlign = 'center'; ig.textBaseline = 'middle'; ig.font = '900 150px Inter, sans-serif'; ig.fillText('F', 256, 260)
    ig.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 1400; i++) { ig.globalAlpha = Math.random() * 0.6; ig.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 3, 1 + Math.random() * 2) }
    col.g.globalAlpha = 0.85; col.g.drawImage(ink, 0, 0); col.g.globalAlpha = 1
  }
  return { map: toTex(col), bump: toTex(bmp, false) }
}
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
const grain = (g, w, h, a, col, n = 1) => { g.globalAlpha = a; g.fillStyle = col; for (let i = 0; i < w * h / 30 * n; i++) g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); g.globalAlpha = 1 }

// ——— Общее: свет изнутри, столб, ядро, искры, пьедестал ———
const glow = new THREE.MeshBasicMaterial({ color: tok('--c-rarity-foil-1') })
const root = new THREE.Group(); scene.add(root)
const fx = new THREE.Group(); root.add(fx)
const inner = new THREE.PointLight(glow.color, 0, 10, 1.4); inner.position.set(0, 0.9, 0); fx.add(inner)
// Свет изнутри — не твёрдый шар и не столб-цилиндр, а мягкое сияние: пятно-вспышка над сундуком и лучи из перекрещенных плоскостей,
// мягкие по краям и гаснущие кверху. Всё складывается светом (additive) и красится цветом редкости
const softTex = canvasTex(256, 256, (g) => { const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.55)'); r.addColorStop(0.6, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256) })
// Луч гаснет к краям ровно до нуля (гаусс × окно), к низу тоже мягко — у плоскостей не видно краёв ни сбоку, ни у пола
const rayTex = canvasTex(128, 256, (g) => { for (let x = 0; x < 128; x++) { const d = (x - 63.5) / 64, e = Math.exp(-((d / 0.42) ** 2)) * (1 - d * d) ** 2; const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${(0.3 * e).toFixed(3)})`); gr.addColorStop(0.9, `rgba(255,255,255,${e.toFixed(3)})`); gr.addColorStop(1, `rgba(255,255,255,${(0.4 * e).toFixed(3)})`); g.fillStyle = gr; g.fillRect(x, 0, 1, 256) } })
const glowSoft = new THREE.MeshBasicMaterial({ color: glow.color, map: softTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
const core = new THREE.Sprite(new THREE.SpriteMaterial({ color: glow.color, map: softTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
core.position.y = 1.1; core.scale.setScalar(0.01); fx.add(core)
const beamTex = canvasTex(4, 128, (g) => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128) })
const beamMat = new THREE.MeshBasicMaterial({ color: glow.color, map: rayTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
const beam = new THREE.Group(); beam.material = beamMat
;[0, 1, 2].forEach((k) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(3, 7), beamMat); p.rotation.y = k * Math.PI / 3; beam.add(p) })
beam.position.y = 4; fx.add(beam)
const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.62, 96), new THREE.MeshBasicMaterial({ color: glow.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring)
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.5 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)
const NS = 600, spos = new Float32Array(NS * 3), svel = new Float32Array(NS * 3)
const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(spos, 3))
const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ color: glow.color, size: 0.06, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); fx.add(sparks)
const burst = (power = 1) => { for (let i = 0; i < NS; i++) { spos.set([(Math.random() - 0.5) * 0.8, 0.8, (Math.random() - 0.5) * 0.8], i * 3); const a = Math.random() * Math.PI * 2, s = Math.random() * 3 * power; svel.set([Math.cos(a) * s, (2 + Math.random() * 5) * power, Math.sin(a) * s], i * 3) } sparks.material.opacity = 1 }
const lightUp = (k, strength = 1) => { inner.intensity = 50 * k * strength; beam.material.opacity = 0.5 * k * strength; core.scale.setScalar(0.01 + k * strength * 3.4) }

const tweens = []
const tween = (ms, fn, ease = (k) => 1 - (1 - k) ** 3) => new Promise((res) => tweens.push({ t0: performance.now(), ms, fn, ease, res }))
const back = (k) => { const c = 1.6; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2 }
const mesh = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m }
// Сундук: ширина, глубина, высота корпуса, радиус крышки (= половина глубины). S, H — для частиц
const S = 1.7, H = S / 2, T = 0.09, TH = T
const edgeMats = []
const glowEdges = (geo, parent) => { const m = new THREE.LineBasicMaterial({ color: glow.color, transparent: true, opacity: 0.9 }); edgeMats.push(m); parent.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), m)) }
const ink = new THREE.MeshStandardMaterial({ color: tok('--c-card-ink'), roughness: 0.9 })

const ND = 360, dpos = new Float32Array(ND * 3), dvel = new Float32Array(ND * 3)
const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3))
const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: tok('--c-muted'), size: 0.07, transparent: true, opacity: 0, depthWrite: false })); fx.add(dust)
const dustUp = () => { for (let i = 0; i < ND; i++) { dpos.set([(Math.random() - 0.5) * S, Math.random() * S, (Math.random() - 0.5) * S], i * 3); dvel.set([(Math.random() - 0.5) * 1.2, Math.random() * 0.8, (Math.random() - 0.5) * 1.2], i * 3) } dust.material.opacity = 0.55 }

// Коробка всегда стоит на полу — опускать нечего
const lower = () => Promise.resolve()
const NP = 260, ppos = new Float32Array(NP * 3), pvel = new Float32Array(NP * 3)
const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(ppos, 3))
const chips = new THREE.Points(pg, new THREE.PointsMaterial({ color: tok('--c-tier-bronze'), size: 0.05, transparent: true, opacity: 0, depthWrite: false })); fx.add(chips)
const splinters = () => { for (let i = 0; i < NP; i++) { ppos.set([(Math.random() - 0.5) * S, Math.random() * S, (Math.random() - 0.5) * S], i * 3); const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 4; pvel.set([Math.cos(a) * sp, 1 + Math.random() * 4, Math.sin(a) * sp], i * 3) } chips.material.opacity = 1 }

// ——— Коробка (из v15): куб, пять материалов ———
function boxKit() {
// ——— Грань с эмблемой F: фон — материал, кольцо и F — в манере материала ———
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
const grain = (g, w, h, a, col, n = 1) => { g.globalAlpha = a; g.fillStyle = col; for (let i = 0; i < w * h / 30 * n; i++) g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); g.globalAlpha = 1 }
// F вдавлена в материал: светлая кромка снизу-справа, тёмная — сверху-слева, сама буква — цветом материала потемнее/посветлее
const emblem = (g, ring, f, style) => {
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 150px Inter, sans-serif'
  if (style !== 'print') { g.fillStyle = 'rgba(255,255,255,.14)'; g.fillText('F', 259, 263); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillText('F', 253, 257) }
  g.fillStyle = f; g.fillText('F', 256, 260)
}
const FACE = {
  legend: () => canvasTex(512, 512, (g) => {
    const bg = g.createLinearGradient(0, 0, 512, 512); bg.addColorStop(0, hex('--c-card-ink-2')); bg.addColorStop(1, hex('--c-card-ink')); g.fillStyle = bg; g.fillRect(0, 0, 512, 512)
    grain(g, 512, 512, 0.06, hex('--c-muted'))
    emblem(g, null, hex('--c-rarity-foil-2'))
  }),
  epic: () => canvasTex(512, 512, (g) => {
    g.fillStyle = mixHex('--c-tier-silver-2', '--c-tier-silver', 0.25); g.fillRect(0, 0, 512, 512)
    g.globalAlpha = 0.22; for (let y = 0; y < 512; y += 2) { g.fillStyle = Math.random() > 0.5 ? hex('--c-tier-silver-hi') : hex('--c-card-ink'); g.fillRect(0, y, 512, 1) } g.globalAlpha = 1
    emblem(g, hex('--c-tier-silver'), hex('--c-card-ink-2'), 'carve')
  }),
  stone: () => canvasTex(512, 512, (g) => {
    g.fillStyle = mixHex('--c-muted', '--c-card-ink', 0.55); g.fillRect(0, 0, 512, 512)
    grain(g, 512, 512, 0.4, hex('--c-card-ink'), 1.4); grain(g, 512, 512, 0.2, hex('--c-muted'))
    emblem(g, hex('--c-card-ink'), hex('--c-card-ink'), 'carve')
  }),
  wood: () => canvasTex(512, 512, (g) => {
    for (let i = 0; i < 6; i++) { g.fillStyle = mixHex('--c-tier-bronze-2', '--c-tier-bronze', 0.25 + (i % 2) * 0.1); g.fillRect(0, i * 86, 512, 86); g.globalAlpha = 0.6; g.fillStyle = hex('--c-card-ink'); g.fillRect(0, i * 86 + 83, 512, 3); g.globalAlpha = 1 }
    g.globalAlpha = 0.25; g.strokeStyle = hex('--c-tier-bronze-2'); for (let j = 0; j < 90; j++) { const y = Math.random() * 512; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y + 8, 340, y - 8, 512, y); g.stroke() } g.globalAlpha = 1
    g.globalAlpha = 0.85; emblem(g, hex('--c-tier-bronze-2'), hex('--c-tier-bronze-2')); g.globalAlpha = 1
  }),
  card: () => canvasTex(512, 512, (g) => {
    g.fillStyle = mixHex('--c-tier-bronze', '--c-rarity-foil-3', 0.35); g.fillRect(0, 0, 512, 512)
    grain(g, 512, 512, 0.12, hex('--c-tier-bronze-2'))
    g.globalAlpha = 0.7; emblem(g, hex('--c-tier-bronze-2'), hex('--c-tier-bronze-2'), 'print'); g.globalAlpha = 1
  }),
}
// ——— Камень и картон: процедурные карты цвета и рельефа (bump), чтобы материал читался светом, а не только цветом ———
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }
const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5 } return s }
const texFrom = (w, h, px, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, gg, b] = px(x, y), i = (y * w + x) * 4; img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255 }
  g.putImageData(img, 0, 0); return { c, g } }
const toTex = ({ c }, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t }
const rgb = (t) => { const c = tok(t); return [c.r * 255, c.g * 255, c.b * 255] }
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
// F на карте рельефа — вдавлена (тёмное = ниже), с мягким краем
const carveF = (g, depth, blur = 3) => { g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = `rgba(0,0,0,${depth})`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 150px Inter, sans-serif'; g.fillText('F', 256, 260); g.restore() }
function stoneMaps() {
  // Серо-тёплый камень: крупные пятна (fbm), прожилки, крапинки и мелкие каверны
  const dark = lerp3(rgb('--c-card-ink'), rgb('--c-muted'), 0.28), light = lerp3(rgb('--c-muted'), rgb('--c-rarity-foil-3'), 0.12)
  const H2 = new Float32Array(512 * 512)
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const n = fbm(x / 90, y / 90, 5), vein = 1 - Math.abs(fbm(x / 140 + 7, y / 140 + 3, 4) * 2 - 1), spot = hash(x, y) > 0.985 ? -0.25 : hash(x + 3, y) > 0.99 ? 0.15 : 0
    H2[y * 512 + x] = Math.min(1, Math.max(0, n * 0.9 + Math.pow(vein, 14) * 0.25 + spot))
  }
  const col = texFrom(512, 512, (x, y) => { const h = H2[y * 512 + x]; return lerp3(dark, light, 0.25 + h * 0.75) })
  const bmp = texFrom(512, 512, (x, y) => { const v = (0.35 + H2[y * 512 + x] * 0.65) * 255; return [v, v, v] })
  // F — вырезана: в рельефе ниже, в цвете чуть темнее
  carveF(bmp.g, 0.75); carveF(col.g, 0.35, 2)
  return { map: toTex(col), bump: toTex(bmp, false) }
}
function cardMaps(withF = true) {
  // Крафт-картон: тёплый бежевый, волокна, еле заметный гофр (вертикальные полосы), потёртые края
  const base = lerp3(rgb('--c-tier-bronze'), rgb('--c-rarity-foil-3'), 0.42), dark = lerp3(base, rgb('--c-tier-bronze-2'), 0.35)
  const col = texFrom(512, 512, (x, y) => { const n = fbm(x / 40, y / 40, 3), fib = (hash(x, Math.floor(y / 3)) - 0.5) * 0.06, edge = Math.min(x, y, 511 - x, 511 - y) < 10 ? 0.12 : 0
    return lerp3(base, dark, Math.max(0, n * 0.35 - 0.05 + fib + edge)) })
  const bmp = texFrom(512, 512, (x, y) => { const flute = 0.5 + Math.sin(x / 512 * Math.PI * 2 * 64) * 0.08, fib = (hash(x * 3, y) - 0.5) * 0.12; const v = (flute + fib) * 255; return [v, v, v] })
  // Волоконца поверх
  col.g.globalAlpha = 0.07; col.g.strokeStyle = `rgb(${dark.join(',')})`; for (let i = 0; i < 700; i++) { const x = Math.random() * 512, y = Math.random() * 512, a = Math.random() * Math.PI; col.g.beginPath(); col.g.moveTo(x, y); col.g.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); col.g.stroke() } col.g.globalAlpha = 1
  if (withF) {
    // Печать краской: не идеально ровная — пропуски и неравномерная плотность
    const ink = document.createElement('canvas'); ink.width = ink.height = 512; const ig = ink.getContext('2d')
    ig.fillStyle = `rgb(${rgb('--c-tier-bronze-2').join(',')})`; ig.textAlign = 'center'; ig.textBaseline = 'middle'; ig.font = '900 150px Inter, sans-serif'; ig.fillText('F', 256, 260)
    ig.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 1400; i++) { ig.globalAlpha = Math.random() * 0.6; ig.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 3, 1 + Math.random() * 2) }
    col.g.globalAlpha = 0.85; col.g.drawImage(ink, 0, 0); col.g.globalAlpha = 1
  }
  return { map: toTex(col), bump: toTex(bmp, false) }
}
const stoneMat = (() => { let m; return () => m || (m = (() => { const t = stoneMaps(); return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 3.5, roughness: 0.96 }) })()) })()
const woodBoardTex = (() => { let t; return () => t || (t = canvasTex(512, 512, (g) => {
  g.fillStyle = mixHex('--c-tier-bronze-2', '--c-tier-bronze', 0.32); g.fillRect(0, 0, 512, 512)
  g.globalAlpha = 0.28; g.strokeStyle = hex('--c-tier-bronze-2'); g.lineWidth = 1.2
  for (let j = 0; j < 140; j++) { const y = Math.random() * 512; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y + 6 - Math.random() * 12, 340, y - 6 + Math.random() * 12, 512, y); g.stroke() }
  g.globalAlpha = 0.18; g.strokeStyle = hex('--c-tier-bronze'); for (let j = 0; j < 60; j++) { const y = Math.random() * 512; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y + 4, 340, y - 4, 512, y); g.stroke() } g.globalAlpha = 1
  g.globalAlpha = 0.85; emblem(g, null, hex('--c-tier-bronze-2')); g.globalAlpha = 1
})) })()
const MAT = {
  legend: () => ({ face: new THREE.MeshStandardMaterial({ map: FACE.legend(), roughness: 0.18, metalness: 0.2 }), trim: null }),
  epic: () => ({ face: new THREE.MeshStandardMaterial({ map: FACE.epic(), roughness: 0.32, metalness: 0.85 }), trim: null }),
  // Камень: одна процедурная карта на все грани и на обломки; стенки толще, фаска крупнее — как у тёсаного блока
  stone: () => ({ face: stoneMat(), inner: stoneMat(), trim: null, bevel: 0.05 }),
  wood: () => ({ face: new THREE.MeshStandardMaterial({ map: FACE.wood(), roughness: 0.8 }), trim: null }),
  // Картон: тонкие стенки, внутри — тот же крафт без печати, острые рёбра
  card: () => { const out = cardMaps(true), inn = cardMaps(false); return { face: new THREE.MeshStandardMaterial({ map: out.map, bumpMap: out.bump, bumpScale: 0.6, roughness: 1 }),
    inner: new THREE.MeshStandardMaterial({ map: inn.map, bumpMap: inn.bump, bumpScale: 0.6, roughness: 1, color: tok('--c-rarity-foil-3') }), trim: null, t: 0.022, bevel: 0.004 } },
}
// Трещины каменной: три стадии на одном холсте, светятся цветом редкости
const crackCanvas = document.createElement('canvas'); crackCanvas.width = crackCanvas.height = 512
const crackTex = new THREE.CanvasTexture(crackCanvas)
const CRACKS = [[[256, 30, 236, 120, 262, 190, 240, 280]], [[40, 140, 130, 190, 122, 290, 40, 380], [262, 190, 372, 226, 470, 170]], [[240, 280, 300, 390, 276, 490], [130, 190, 220, 250, 330, 330, 440, 470], [372, 226, 400, 90, 480, 40]]]
const drawCracks = (n) => { const g = crackCanvas.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#fff'; g.lineJoin = 'round'; for (let s = 0; s < n; s++) CRACKS[s].forEach((p) => { g.lineWidth = 7 - s; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke() }); crackTex.needsUpdate = true }

// ——— Одна коробка на все материалы: дно, 4 стенки на петлях у дна, крышка (у картона — клапаны) ———
const MATC = {}
const mat = (id) => MATC[id] || (MATC[id] = MAT[id]())
function buildBox(m, { flaps = false } = {}) {
  const g = new THREE.Group(), T = m.t ?? TH, inside = m.inner || ink
  const panel = (parent, w = S) => {
    const p = new THREE.Group(); parent.add(p)
    mesh(new RoundedBoxGeometry(w, S, T, 3, m.bevel ?? 0.03), [inside, inside, inside, inside, m.face, inside], p)
    if (m.trim) { const f = 0.07; [[0, H - f / 2, w, f], [0, -H + f / 2, w, f], [w / 2 - f / 2, 0, f, S], [-w / 2 + f / 2, 0, f, S]].forEach(([x, y, bw, bh]) => mesh(new THREE.BoxGeometry(bw, bh, T + 0.03), m.trim, p, x, y, 0.005)) }
    if (m.edges) glowEdges(new THREE.BoxGeometry(w + 0.02, S + 0.02, T + 0.05), p)
    return p
  }
  const bottom = panel(g); bottom.rotation.x = -Math.PI / 2; bottom.position.y = T / 2
  const floorGlow = mesh(new THREE.PlaneGeometry(S * 1.3, S * 1.3), glowSoft, g, 0, T + 0.01, 0); floorGlow.rotation.x = -Math.PI / 2; floorGlow.castShadow = false
  // Передняя и задняя — во всю ширину, боковые — между ними
  const walls = [0, 1, 2, 3].map((k) => { const pv = new THREE.Group(); pv.rotation.y = k * Math.PI / 2; g.add(pv); const h = new THREE.Group(); h.position.set(0, T, H - T / 2); pv.add(h); panel(h, k % 2 ? S - 2 * T : S).position.y = H; return h })
  const lid = new THREE.Group(); lid.position.y = S + T / 2; g.add(lid)
  const fl = []
  if (!flaps) panel(lid).rotation.x = -Math.PI / 2
  // Клапаны картона — на верхних кромках стенок (петля — наружная кромка): раскладываются вместе со стенкой
  else [[0, 0], [2, 0], [1, 1], [3, 1]].forEach(([k, short]) => {
    const h = new THREE.Group(); h.position.set(0, S + T / 2 + (short ? -0.005 : T - 0.005), T / 2); walls[k].add(h)
    const len = short ? H * 0.9 : H
    const flap = mesh(new RoundedBoxGeometry(short ? S - 2 * T : S - 0.006, T, len - 0.004, 2, 0.003), inside, h, 0, 0, -len / 2)
    fl.push({ h, short, flap, len })
  })
  if (m.trim && m.edges) [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => [T, S + T].forEach((y) => mesh(new THREE.SphereGeometry(0.1, 20, 16), m.trim, g, sx * H, y, sz * H)))
  return { g, walls, lid, flaps: fl, T }
}

// ——— Каменная: обломки по Вороному — неровные выпуклые куски разного размера, мельче у места удара ———
function stoneChunks(color) {
  const seeds = [...Array.from({ length: 14 }, () => new THREE.Vector3((Math.random() - 0.5) * S, Math.random() * S, (Math.random() - 0.5) * S)),
    ...Array.from({ length: 8 }, () => new THREE.Vector3((Math.random() - 0.5) * S * 0.7, S * (0.45 + Math.random() * 0.5), H - Math.random() * 0.5))]
  const cells = seeds.map(() => []), n = 16
  for (let x = 0; x <= n; x++) for (let y = 0; y <= n; y++) for (let z = 0; z <= n; z++) {
    const p = new THREE.Vector3(-H + S * x / n, S * y / n, -H + S * z / n)
    let best = 0, bd = Infinity
    seeds.forEach((s, i) => { const d = s.distanceToSquared(p); if (d < bd) { bd = d; best = i } })
    cells[best].push(p)
  }
  const base = new THREE.Color(color)
  return cells.filter((c) => c.length >= 8).map((pts) => {
    const geo = new ConvexGeometry(pts); geo.computeBoundingSphere()
    const P = geo.attributes.position, Nn = geo.attributes.normal, uv = new Float32Array(P.count * 2)
    for (let i = 0; i < P.count; i++) { const ax = Math.abs(Nn.getX(i)), ay = Math.abs(Nn.getY(i)), az = Math.abs(Nn.getZ(i)); const [u, v] = ax >= ay && ax >= az ? [P.getZ(i), P.getY(i)] : ay >= az ? [P.getX(i), P.getZ(i)] : [P.getX(i), P.getY(i)]; uv[i * 2] = u / S + 0.5; uv[i * 2 + 1] = v / S }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const c = geo.boundingSphere.center.clone(); geo.translate(-c.x, -c.y, -c.z); geo.scale(0.975, 0.975, 0.975); geo.computeBoundingSphere()
    const mat = stoneMat().clone(); mat.flatShading = true; mat.color = new THREE.Color(1, 1, 1).offsetHSL(0, 0, -Math.random() * 0.08)
    const m = new THREE.Mesh(geo, mat); m.position.copy(c); m.castShadow = m.receiveShadow = true
    m.userData = { v: new THREE.Vector3(), w: new THREE.Vector3(), r: geo.boundingSphere.radius }
    return m
  })
}
const TYPES = {
  legend: {
    name: 'Обсидиан и золото', note: 'Тёмный полированный камень, F — золотом. Крышка улетает, стенки раскрываются лепестками, встаёт столб света.',
    build() {
      const b = buildBox(mat('legend'))
      return { g: b.g, async open() {
        await lower()
        await tween(260, (k) => { b.g.position.y = Math.sin(k * Math.PI) * 0.45 })
        await tween(420, (k) => { b.g.rotation.z = Math.sin(k * 44) * 0.05 * (1 - k) }, (k) => k)
        burst(1.1)
        tween(700, (k) => { b.lid.position.y = S + T / 2 + k * 3.5; b.lid.rotation.x = k * 1.4; b.lid.rotation.z = k * 0.6 })
        tween(900, (k) => b.walls.forEach((h) => { h.rotation.x = k * 1.75 }), back)
        await tween(800, (k) => lightUp(k))
      } }
    },
  },
  epic: {
    name: 'Сталь', note: 'Шлифованная сталь, F — гравировкой, под крышкой светится шов. Крышка поднимается и крутится, стенки падают наружу и пружинят, крышка ложится позади.',
    build() {
      const b = buildBox(mat('epic'))
      const seam = mesh(new THREE.BoxGeometry(S + 0.04, 0.03, S + 0.04), glow, b.g, 0, S, 0); seam.castShadow = false
      return { g: b.g, async open() {
        await lower()
        await tween(420, (k) => { b.g.rotation.z = Math.sin(k * 40) * 0.04 * (1 - k) }, (k) => k)
        seam.visible = false; burst(0.9)
        tween(800, (k) => lightUp(k, 0.9))
        await tween(800, (k) => { b.lid.position.y = S + T / 2 + k * 1.5; b.lid.rotation.y = k * Math.PI * 1.25; b.lid.rotation.x = Math.sin(k * Math.PI) * 0.25 }, back)
        // Стенки падают наружу и пружинят от пола, как металл
        const fall = (k) => { const t = Math.min(1, k * 1.35); return t < 1 ? t * t : 1 - Math.sin((k - 0.74) / 0.26 * Math.PI) * 0.06 * (1 - (k - 0.74) / 0.26) }
        b.walls.forEach((h, i) => tween(760 + i * 60, (k) => { h.rotation.x = fall(k) * Math.PI / 2 }, (k) => k))
        await tween(700, (k) => { b.lid.position.set(0, S + T / 2 + 1.5 - k * (S + 1.5), -k * 2.3); b.lid.rotation.x = k * 0.02 }, (k) => k * k)
        await tween(260, (k) => { b.lid.position.y = T / 2 + Math.sin(k * Math.PI) * 0.12 }, (k) => k)
      } }
    },
  },
  stone: {
    name: 'Камень', note: 'Тёсаный камень с прожилками и кавернами, F — вырезана. Один удар — трещины вспыхивают цветом лучшей карты, и куб сразу колется на неровные обломки: они падают под своим весом, отскакивают и ложатся на пол, оседает пыль.',
    build() {
      const b = buildBox(mat('stone'))
      const crackMat = new THREE.MeshBasicMaterial({ color: glow.color, alphaMap: crackTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      const cracks = new THREE.Group(); b.g.add(cracks)
      ;[[0, H + T / 2, H + 0.006, 0, 0], [0, H + T / 2, -H - 0.006, 0, Math.PI], [H + 0.006, H + T / 2, 0, 0, Math.PI / 2], [-H - 0.006, H + T / 2, 0, 0, -Math.PI / 2], [0, S + T + 0.006, 0, -Math.PI / 2, 0]].forEach(([x, y, z, rx, ry]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(S, S), crackMat); p.position.set(x, y, z); p.rotation.set(rx, ry, 0); cracks.add(p) })
      let hits = 0, chunks = [], falling = false
      drawCracks(0)
      const self = {
        g: b.g, hits: () => hits,
        hit() {
          if (hits >= 3) return true
          hits++; drawCracks(hits)
          tween(260, (k) => { b.g.rotation.z = Math.sin(k * 36) * 0.035 * (1 - k); b.g.position.x = Math.sin(k * 50) * 0.02 * (1 - k) }, (k) => k)
          return hits >= 3
        },
        async open() {
          // С первого удара: трещины вспыхивают разом — и сразу раскол
          hits = 3; drawCracks(3); await tween(180, (k) => { b.g.rotation.z = Math.sin(k * 36) * 0.03 * (1 - k) }, (k) => k)
          await lower()
          // Подмена целого куба на обломки; сначала — миг света сквозь щели
          chunks = stoneChunks(mixHex('--c-muted', '--c-card-ink', 0.55))
          b.g.children.slice().forEach((c) => { if (c !== cracks) c.visible = false })
          chunks.forEach((m) => b.g.add(m))
          lightUp(0.4, 0.8)
          await tween(160, () => {})
          cracks.visible = false
          const hitAt = new THREE.Vector3(0, S * 0.6, H + 0.3)
          chunks.forEach((m) => {
            const d = m.position.clone().sub(hitAt), dist = d.length(); d.normalize()
            const push = 1.6 / (0.5 + dist)
            m.userData.v.set(d.x * push + (Math.random() - 0.5) * 0.4, Math.random() * 0.8, d.z * push * 0.6 + (Math.random() - 0.5) * 0.4)
            m.userData.w.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 4)
          })
          falling = true; dustUp(); burst(0.5)
          await tween(900, (k) => lightUp(0.4 + k * 0.6, 0.85))
        },
        tick(dt) {
          if (!falling) return
          chunks.forEach((m) => {
            const u = m.userData, low = u.r * 0.62
            u.v.y -= 9.8 * dt
            m.position.addScaledVector(u.v, dt)
            m.rotation.x += u.w.x * dt; m.rotation.y += u.w.y * dt; m.rotation.z += u.w.z * dt
            if (m.position.y < low) {
              m.position.y = low
              u.v.y = Math.abs(u.v.y) > 0.6 ? -u.v.y * 0.28 : 0
              u.v.x *= 0.82; u.v.z *= 0.82; u.w.multiplyScalar(0.72)
            }
          })
        },
      }
      return self
    },
  },
  wood: {
    name: 'Дерево', note: 'Ящик из досок, F — выжжена. Удар — ящик разлетается на доски: они падают, отскакивают и ложатся на пол, летят щепки.',
    build() {
      const g = new THREE.Group(), N = 5, gap = 0.012, boards = []
      // Доска: кусок той же текстуры (F собирается из досок), тёмная изнанка
      const board = (w, i, place) => {
        const tex = woodBoardTex().clone(); tex.repeat.set(1, 1 / N); tex.offset.set(0, i / N); tex.needsUpdate = true
        // У каждой доски свой оттенок — как у настоящих досок из разных кусков
        const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, color: new THREE.Color(1, 1, 1).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12) }), side = new THREE.MeshStandardMaterial({ color: tok('--c-tier-bronze-2'), roughness: 0.9 })
        const b = mesh(new RoundedBoxGeometry(w, S / N - gap, T, 2, 0.012), [side, side, side, side, face, side], g); place(b); b.geometry.computeBoundingBox()
        b.userData = { v: new THREE.Vector3(), w: new THREE.Vector3() }; boards.push(b); return b
      }
      for (let i = 0; i < N; i++) {
        const y = T + (i + 0.5) * S / N
        board(S, i, (b) => b.position.set(0, y, H - T / 2))
        board(S, i, (b) => { b.position.set(0, y, -H + T / 2); b.rotation.y = Math.PI })
        board(S - 2 * T, i, (b) => { b.position.set(H - T / 2, y, 0); b.rotation.y = Math.PI / 2 })
        board(S - 2 * T, i, (b) => { b.position.set(-H + T / 2, y, 0); b.rotation.y = -Math.PI / 2 })
        const z = -H + (i + 0.5) * S / N
        board(S, i, (b) => { b.position.set(0, S + T + T / 2, z); b.rotation.x = -Math.PI / 2 })
        board(S, i, (b) => { b.position.set(0, T / 2, z); b.rotation.x = -Math.PI / 2 })
      }
      const floorGlow = mesh(new THREE.PlaneGeometry(S * 1.3, S * 1.3), glowSoft, g, 0, T + 0.01, 0); floorGlow.rotation.x = -Math.PI / 2; floorGlow.castShadow = false
      let flying = false
      const zAxis = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0), qd = new THREE.Quaternion(), qt = new THREE.Quaternion()
      const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
      return {
        g,
        async open() {
          await tween(420, (k) => { g.rotation.z = Math.sin(k * 34) * 0.03 * (1 - k); g.position.x = Math.sin(k * 46) * 0.015 * (1 - k) }, (k) => k)
          const c = new THREE.Vector3(0, S * 0.45, 0)
          boards.forEach((b) => {
            const d = b.position.clone().sub(c); const up = b.position.y > S ? 1 : 0
            d.normalize()
            b.userData.v.set(d.x * (1.2 + Math.random() * 1.2), 1 + Math.random() * 2 + up * 2, d.z * (1.2 + Math.random() * 1.2))
            b.userData.w.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 6)
          })
          flying = true; floorGlow.visible = false; splinters(); burst(0.7)
          await tween(800, (k) => lightUp(k, 0.8))
        },
        tick(dt) {
          if (!flying) return
          boards.forEach((b) => {
            const u = b.userData
            u.v.y -= 9.8 * dt
            b.position.addScaledVector(u.v, dt)
            b.rotation.x += u.w.x * dt; b.rotation.y += u.w.y * dt; b.rotation.z += u.w.z * dt
            // Пол: самая низкая вершина доски не уходит ниже нуля
            b.updateMatrix()
            const bb = b.geometry.boundingBox, A = u.box || (u.box = new THREE.Box3()); A.makeEmpty()
            corners.forEach((p, i) => { A.expandByPoint(p.set(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).applyMatrix4(b.matrix)) })
            const low = A.min.y
            // Опора: пол или уже лежащие доски под ней — так доски ложатся стопкой, а не проходят друг сквозь друга
            let base = 0
            boards.forEach((o) => { const ob = o.userData.box; if (o === b || !o.userData.rest || !ob) return; if (A.max.x > ob.min.x && A.min.x < ob.max.x && A.max.z > ob.min.z && A.min.z < ob.max.z && ob.max.y <= low + 0.05) base = Math.max(base, ob.max.y) })
            u.rest = false
            if (low < base) {
              u.rest = true
              b.position.y += base - low
              u.v.y = Math.abs(u.v.y) > 0.7 ? -u.v.y * 0.32 : 0
              u.v.x *= 0.78; u.v.z *= 0.78; u.w.multiplyScalar(0.62)
              // На полу доска заваливается плашмя: широкая грань (локальная ось z) поворачивается к вертикали — ни на ребре, ни на торце не стоит
              if (u.v.y === 0) {
                zAxis.set(0, 0, 1).applyQuaternion(b.quaternion)
                qd.setFromUnitVectors(zAxis, zAxis.y >= 0 ? UP : DOWN)
                b.quaternion.slerp(qt.copy(qd).multiply(b.quaternion), 0.14)
                u.w.multiplyScalar(0.5)
              }
            }
          })
        },
      }
    },
  },
  card: {
    name: 'Картон', note: 'Крафт-картон с гофром и волокнами, F — печатью. Скотч режется по шву, клапаны раскрываются, коробка раскладывается в плоский крест.',
    build() {
      const b = buildBox(mat('card'), { flaps: true })
      // Коричневый упаковочный скотч: полупрозрачный, с глянцем
      const tapeMat = new THREE.MeshPhysicalMaterial({ color: tok('--c-tier-bronze'), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, transparent: true, opacity: 0.72 })
      const tw = 0.3, TT = b.T
      // Полоса по шву: две половины, каждая приклеена к своему длинному клапану — при открытии уходят вместе с ним
      b.flaps.filter((f) => !f.short).forEach((f) => { const t = mesh(new THREE.BoxGeometry(S + 0.004, 0.004, tw / 2), tapeMat, f.flap, 0, TT / 2 + 0.003, -f.len / 2 + tw / 4 + 0.002); t.castShadow = false })
      // Концы скотча свисают на боковые стенки
      ;[1, 3].forEach((k) => { const t = mesh(new THREE.BoxGeometry(tw, 0.42, 0.004), tapeMat, b.walls[k], 0, S + TT - 0.21, TT / 2 + 0.003); t.castShadow = false })
      return { g: b.g, async open() {
        await lower()
        await tween(300, (k) => { b.g.rotation.z = Math.sin(k * 30) * 0.03 * (1 - k) }, (k) => k)
        burst(0.6)
        b.flaps.filter((f) => !f.short).concat(b.flaps.filter((f) => f.short)).forEach((f, i) => tween(560 + i * 140, (k) => { f.h.rotation.x = k * 2.2 }, back))
        tween(700, (k) => lightUp(k, 0.6))
        await tween(900, () => {})
        // Раскладывается в плоский крест: стенки ложатся наружу, клапаны выпрямляются продолжением стенок
        b.walls.forEach((h, i) => tween(700 + i * 90, (k) => { h.rotation.x = k * Math.PI / 2 }, back))
        await tween(820, (k) => b.flaps.forEach((f) => { f.h.rotation.x = 2.2 + (Math.PI / 2 - 2.2) * k }))
      } }
    },
  },
}
  return TYPES
}

// ——— Сундук (из v16): корпус и полукруглая крышка, пять материалов ———
function chestKit() {
  const W = 2.2, D = 1.4, HB = 1.0, R = D / 2
// ——— Текстуры под размер грани: эмблема F — в манере материала, не растягивается на широкой стенке ———
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
const grain = (g, w, h, a, col, n = 1) => { g.globalAlpha = a; g.fillStyle = col; for (let i = 0; i < w * h / 30 * n; i++) g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); g.globalAlpha = 1 }
const PX = 300 // пикселей на метр грани
const fAt = (g, w, h, fill, style, blur = 0) => {
  const size = Math.round(h * 0.52); g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${size}px Inter, sans-serif`
  if (blur) g.filter = `blur(${blur}px)`
  if (style === 'carve') { g.fillStyle = 'rgba(255,255,255,.14)'; g.fillText('F', w / 2 + 3, h / 2 + 5); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillText('F', w / 2 - 3, h / 2 - 1) }
  g.fillStyle = fill; g.fillText('F', w / 2, h / 2 + 2); g.restore()
}
const planks = (g, w, h, rows) => {
  for (let i = 0; i < rows; i++) { g.fillStyle = mixHex('--c-tier-bronze-2', '--c-tier-bronze', 0.25 + (i % 2) * 0.1); g.fillRect(0, i * h / rows, w, h / rows) }
  g.globalAlpha = 0.25; g.strokeStyle = hex('--c-tier-bronze-2'); for (let j = 0; j < w * h / 1500; j++) { const y = Math.random() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + 6 - Math.random() * 12, w * 2 / 3, y - 6 + Math.random() * 12, w, y); g.stroke() } g.globalAlpha = 1
}
// Камень и картон — процедурные карты (цвет + рельеф) нужного размера
const stoneMapsSized = (w, h, withF) => {
  const dark = lerp3(rgb('--c-card-ink'), rgb('--c-muted'), 0.28), light = lerp3(rgb('--c-muted'), rgb('--c-rarity-foil-3'), 0.12), Hh = new Float32Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = fbm(x / 90, y / 90, 5), vein = 1 - Math.abs(fbm(x / 140 + 7, y / 140 + 3, 4) * 2 - 1), spot = hash(x, y) > 0.985 ? -0.25 : hash(x + 3, y) > 0.99 ? 0.15 : 0; Hh[y * w + x] = Math.min(1, Math.max(0, n * 0.9 + Math.pow(vein, 14) * 0.25 + spot)) }
  const col = texFrom(w, h, (x, y) => lerp3(dark, light, 0.25 + Hh[y * w + x] * 0.75)), bmp = texFrom(w, h, (x, y) => { const v = (0.35 + Hh[y * w + x] * 0.65) * 255; return [v, v, v] })
  if (withF) { fAt(bmp.g, w, h, 'rgba(0,0,0,.75)', null, 3); fAt(col.g, w, h, 'rgba(0,0,0,.35)', null, 2) }
  return { map: toTex(col), bump: toTex(bmp, false) }
}
const cardMapsSized = (w, h, withF) => {
  const base = lerp3(rgb('--c-tier-bronze'), rgb('--c-rarity-foil-3'), 0.42), dark = lerp3(base, rgb('--c-tier-bronze-2'), 0.35)
  const col = texFrom(w, h, (x, y) => { const n = fbm(x / 40, y / 40, 3), fib = (hash(x, Math.floor(y / 3)) - 0.5) * 0.06, edge = Math.min(x, y, w - 1 - x, h - 1 - y) < 8 ? 0.12 : 0; return lerp3(base, dark, Math.max(0, n * 0.35 - 0.05 + fib + edge)) })
  const bmp = texFrom(w, h, (x) => { const v = (0.5 + Math.sin(x / 4) * 0.08) * 255; return [v, v, v] })
  col.g.globalAlpha = 0.07; col.g.strokeStyle = `rgb(${dark.join(',')})`; for (let i = 0; i < w * h / 380; i++) { const x = Math.random() * w, y = Math.random() * h, a = Math.random() * Math.PI; col.g.beginPath(); col.g.moveTo(x, y); col.g.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); col.g.stroke() } col.g.globalAlpha = 1
  if (withF) { const ink = document.createElement('canvas'); ink.width = w; ink.height = h; const ig = ink.getContext('2d'); fAt(ig, w, h, `rgb(${rgb('--c-tier-bronze-2').join(',')})`); ig.globalCompositeOperation = 'destination-out'; for (let i = 0; i < w * h / 180; i++) { ig.globalAlpha = Math.random() * 0.6; ig.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 1 + Math.random() * 2) } col.g.globalAlpha = 0.85; col.g.drawImage(ink, 0, 0); col.g.globalAlpha = 1 }
  return { map: toTex(col), bump: toTex(bmp, false) }
}
// Материал грани заданного размера для типа (с F или без)
const FACEMAT = {
  legend: (w, h, f) => new THREE.MeshStandardMaterial({ roughness: 0.18, metalness: 0.2, map: canvasTex(w, h, (g) => { const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, hex('--c-card-ink-2')); bg.addColorStop(1, hex('--c-card-ink')); g.fillStyle = bg; g.fillRect(0, 0, w, h); grain(g, w, h, 0.06, hex('--c-muted')); if (f) fAt(g, w, h, hex('--c-rarity-foil-2')) }) }),
  epic: (w, h, f) => new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.85, map: canvasTex(w, h, (g) => { g.fillStyle = mixHex('--c-tier-silver-2', '--c-tier-silver', 0.25); g.fillRect(0, 0, w, h); g.globalAlpha = 0.22; for (let y = 0; y < h; y += 2) { g.fillStyle = Math.random() > 0.5 ? hex('--c-tier-silver-hi') : hex('--c-card-ink'); g.fillRect(0, y, w, 1) } g.globalAlpha = 1; if (f) fAt(g, w, h, hex('--c-card-ink-2'), 'carve') }) }),
  stone: (w, h, f) => { const t = stoneMapsSized(w, h, f); return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 3.5, roughness: 0.96 }) },
  wood: (w, h, f) => new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(w, h, (g) => { planks(g, w, h, 1); if (f) { g.globalAlpha = 0.85; fAt(g, w, h, hex('--c-tier-bronze-2')); g.globalAlpha = 1 } }) }),
  card: (w, h, f) => { const t = cardMapsSized(w, h, f); return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 0.6, roughness: 1 }) },
}
const MATC = {}
const mats = (id) => MATC[id] || (MATC[id] = {
  front: FACEMAT[id](Math.round(W * PX), Math.round(HB * PX), true),
  side: FACEMAT[id](Math.round((D - 2 * T) * PX), Math.round(HB * PX), true),
  lid: FACEMAT[id](512, 512, false),
  inner: id === 'card' ? FACEMAT.card(256, 256, false) : id === 'stone' ? FACEMAT.stone(256, 256, false) : ink,
  t: id === 'card' ? 0.022 : T, bevel: id === 'stone' ? 0.05 : id === 'card' ? 0.004 : 0.03,
})
// Трещины каменной
const crackCanvas = document.createElement('canvas'); crackCanvas.width = crackCanvas.height = 512
const crackTex = new THREE.CanvasTexture(crackCanvas)
const CRACKS = [[[256, 30, 236, 120, 262, 190, 240, 280]], [[40, 140, 130, 190, 122, 290, 40, 380], [262, 190, 372, 226, 470, 170]], [[240, 280, 300, 390, 276, 490], [130, 190, 220, 250, 330, 330, 440, 470], [372, 226, 400, 90, 480, 40]]]
const drawCracks = (n) => { const g = crackCanvas.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#fff'; g.lineJoin = 'round'; for (let s = 0; s < n; s++) CRACKS[s].forEach((p) => { g.lineWidth = 7 - s; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke() }); crackTex.needsUpdate = true }

// ——— Один сундук на все материалы: дно, 4 стенки на петлях у дна, полукруглая крышка на петле у задней кромки ———
function buildChest(m) {
  const g = new THREE.Group(), t = m.t, inside = m.inner
  const slab = (parent, w, h, face) => mesh(new RoundedBoxGeometry(w, h, t, 3, m.bevel), [inside, inside, inside, inside, face, inside], parent)
  const bottom = slab(g, W, D, inside); bottom.rotation.x = -Math.PI / 2; bottom.position.y = t / 2
  const floorGlow = mesh(new THREE.PlaneGeometry(W * 1.2, D * 1.3), glowSoft, g, 0, t + 0.01, 0); floorGlow.rotation.x = -Math.PI / 2; floorGlow.castShadow = false
  // Стенки: передняя и задняя — во всю ширину, боковые — между ними
  const walls = [[0, W, D / 2, m.front], [Math.PI, W, D / 2, m.front], [Math.PI / 2, D - 2 * t, W / 2, m.side], [-Math.PI / 2, D - 2 * t, W / 2, m.side]].map(([ry, w, dist, face]) => {
    const pv = new THREE.Group(); pv.rotation.y = ry; g.add(pv)
    const h = new THREE.Group(); h.position.set(0, t, dist - t / 2); pv.add(h)
    slab(h, w, HB, face).position.y = HB / 2
    return h
  })
  // Крышка: полуцилиндр (снаружи — материал, внутри — изнанка), торцы-полукруги, дно-обшивка
  const lid = new THREE.Group(); lid.position.set(0, t + HB, -D / 2); g.add(lid)
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R, W, 48, 1, true, 0, Math.PI), m.lid); outer.rotation.z = Math.PI / 2; outer.position.z = R; outer.castShadow = outer.receiveShadow = true; lid.add(outer)
  const innerSkin = new THREE.Mesh(new THREE.CylinderGeometry(R - t, R - t, W - 0.01, 48, 1, true, 0, Math.PI), inside.clone()); innerSkin.material.side = THREE.BackSide; innerSkin.rotation.z = Math.PI / 2; innerSkin.position.z = R; lid.add(innerSkin)
  ;[-1, 1].forEach((s) => { const cap = mesh(new THREE.CircleGeometry(R, 48, 0, Math.PI), m.lid.clone(), lid, s * W / 2, 0, R); cap.material.side = THREE.DoubleSide; cap.rotation.y = s * Math.PI / 2 })
  const lining = mesh(new THREE.PlaneGeometry(W, D), inside.clone(), lid, 0, 0.003, R); lining.material.side = THREE.DoubleSide; lining.rotation.x = Math.PI / 2
  return { g, walls, lid, floorGlow, t }
}
// Металлический отскок в конце падения
const bounceIn = (k) => { const t = Math.min(1, k * 1.35); return t < 1 ? t * t : 1 - Math.sin((k - 0.74) / 0.26 * Math.PI) * 0.06 * (1 - (k - 0.74) / 0.26) }
// Крышка ложится на пол куполом вверх: петлевая кромка — точка отсчёта группы
const lidLand = (b, x, z, ry, ms = 700) => { const y0 = b.lid.position.y, x0 = b.lid.position.x, z0 = b.lid.position.z, r0 = b.lid.rotation.y, rx0 = b.lid.rotation.x
  return tween(ms, (k) => { b.lid.position.set(x0 + (x - x0) * k, y0 * (1 - k) + Math.sin(k * Math.PI) * 0.8, z0 + (z - z0) * k); b.lid.rotation.y = r0 + (ry - r0) * k; b.lid.rotation.x = rx0 * (1 - k) }, (k) => k) }

// Физика кусков (доски, обломки): гравитация, пол и стопка — кусок ложится на уже лежащие под ним
const corners = Array.from({ length: 8 }, () => new THREE.Vector3())
const zAxis = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0), qd = new THREE.Quaternion(), qt = new THREE.Quaternion()
function settle(pieces, dt, flat, stack = true) {
  pieces.forEach((b) => {
    const u = b.userData
    u.v.y -= 9.8 * dt
    b.position.addScaledVector(u.v, dt)
    b.rotation.x += u.w.x * dt; b.rotation.y += u.w.y * dt; b.rotation.z += u.w.z * dt
    b.updateMatrix()
    const bb = b.geometry.boundingBox, A = u.box || (u.box = new THREE.Box3()); A.makeEmpty()
    corners.forEach((p, i) => A.expandByPoint(p.set(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).applyMatrix4(b.matrix)))
    let base = 0
    if (stack) pieces.forEach((o) => { const ob = o.userData.box; if (o === b || !o.userData.rest || !ob) return; if (A.max.x > ob.min.x && A.min.x < ob.max.x && A.max.z > ob.min.z && A.min.z < ob.max.z && ob.max.y <= A.min.y + 0.05) base = Math.max(base, ob.max.y) })
    u.rest = false
    if (A.min.y < base) {
      u.rest = true; b.position.y += base - A.min.y
      u.v.y = Math.abs(u.v.y) > 0.7 ? -u.v.y * 0.3 : 0
      u.v.x *= 0.78; u.v.z *= 0.78; u.w.multiplyScalar(0.62)
      // Плоские куски (доски, рейки) заваливаются плашмя
      if (flat && u.v.y === 0) { zAxis.set(0, 0, 1).applyQuaternion(b.quaternion); qd.setFromUnitVectors(zAxis, zAxis.y >= 0 ? UP : DOWN); b.quaternion.slerp(qt.copy(qd).multiply(b.quaternion), 0.14); u.w.multiplyScalar(0.5) }
    }
  })
}
const piece = (m) => { m.geometry.computeBoundingBox(); m.userData = { v: new THREE.Vector3(), w: new THREE.Vector3() }; return m }
const scatter = (pieces, center, spread = 1) => pieces.forEach((b) => {
  const d = b.position.clone().sub(center); const up = b.position.y > HB ? 1 : 0; d.normalize()
  b.userData.v.set(d.x * (1.2 + Math.random() * 1.2) * spread, 1 + Math.random() * 2 + up * 2, d.z * (1.2 + Math.random() * 1.2) * spread)
  b.userData.w.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 6)
})

// Камень: обломки по Вороному внутри объёма сундука (корпус + купол), мельче у места удара
function stoneChunks(mat) {
  const Y0 = T + HB, inside = (p) => p.y <= Y0 || p.z * p.z + (p.y - Y0) ** 2 <= R * R
  const rnd = () => new THREE.Vector3((Math.random() - 0.5) * W, Math.random() * (Y0 + R), (Math.random() - 0.5) * D)
  const seeds = []; while (seeds.length < 18) { const p = rnd(); if (inside(p)) seeds.push(p) }
  for (let i = 0; i < 8; i++) seeds.push(new THREE.Vector3((Math.random() - 0.5) * W * 0.6, Y0 * (0.4 + Math.random() * 0.6), D / 2 - Math.random() * 0.4))
  const cells = seeds.map(() => [])
  for (let x = 0; x <= 20; x++) for (let y = 0; y <= 16; y++) for (let z = 0; z <= 12; z++) {
    const p = new THREE.Vector3(-W / 2 + W * x / 20, (Y0 + R) * y / 16, -D / 2 + D * z / 12); if (!inside(p)) continue
    let best = 0, bd = Infinity; seeds.forEach((s, i) => { const d = s.distanceToSquared(p); if (d < bd) { bd = d; best = i } }); cells[best].push(p)
  }
  return cells.filter((c) => c.length >= 8).map((pts) => {
    const geo = new ConvexGeometry(pts); geo.computeBoundingSphere()
    const P = geo.attributes.position, Nn = geo.attributes.normal, uv = new Float32Array(P.count * 2)
    for (let i = 0; i < P.count; i++) { const ax = Math.abs(Nn.getX(i)), ay = Math.abs(Nn.getY(i)), az = Math.abs(Nn.getZ(i)); const [u, v] = ax >= ay && ax >= az ? [P.getZ(i), P.getY(i)] : ay >= az ? [P.getX(i), P.getZ(i)] : [P.getX(i), P.getY(i)]; uv[i * 2] = u / 2 + 0.5; uv[i * 2 + 1] = v / 2 }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const c = geo.boundingSphere.center.clone(); geo.translate(-c.x, -c.y, -c.z); geo.scale(0.975, 0.975, 0.975)
    const mm = mat.clone(); mm.flatShading = true; mm.color = new THREE.Color(1, 1, 1).offsetHSL(0, 0, -Math.random() * 0.08)
    const ch = new THREE.Mesh(geo, mm); ch.castShadow = ch.receiveShadow = true; ch.position.copy(c); return piece(ch)
  })
}

const TYPES = {
  legend: {
    name: 'Обсидиан и золото', note: 'Тёмный полированный камень, F — золотом. Крышка улетает, стенки раскрываются лепестками, встаёт столб света.',
    build() {
      const b = buildChest(mats('legend'))
      return { g: b.g, async open() {
        await tween(260, (k) => { b.g.position.y = Math.sin(k * Math.PI) * 0.4 })
        await tween(420, (k) => { b.g.rotation.z = Math.sin(k * 44) * 0.04 * (1 - k) }, (k) => k)
        burst(1.1)
        tween(800, (k) => { b.lid.position.y = T + HB + k * 3.6; b.lid.rotation.x = -k * 1.2; b.lid.rotation.z = k * 0.5 })
        tween(900, (k) => b.walls.forEach((h) => { h.rotation.x = k * 1.75 }), back)
        await tween(800, (k) => lightUp(k))
      } }
    },
  },
  epic: {
    name: 'Сталь', note: 'Шлифованная сталь, F — гравировкой, под крышкой светится шов. Крышка взлетает и ложится позади куполом вверх, стенки падают наружу и пружинят.',
    build() {
      const b = buildChest(mats('epic'))
      const seam = mesh(new THREE.BoxGeometry(W + 0.04, 0.03, D + 0.04), glow, b.g, 0, T + HB, 0); seam.castShadow = false
      return { g: b.g, async open() {
        await tween(420, (k) => { b.g.rotation.z = Math.sin(k * 40) * 0.035 * (1 - k) }, (k) => k)
        seam.visible = false; burst(0.9); tween(800, (k) => lightUp(k, 0.9))
        await tween(700, (k) => { b.lid.position.y = T + HB + k * 1.4; b.lid.rotation.y = k * Math.PI * 1.25 }, back)
        b.walls.forEach((h, i) => tween(760 + i * 60, (k) => { h.rotation.x = bounceIn(k) * Math.PI / 2 }, (k) => k))
        await lidLand(b, 0, -D / 2 - 1.9, Math.PI * 2)
      } }
    },
  },
  stone: {
    name: 'Камень', note: 'Тёсаный камень с прожилками, F — вырезана. Один удар — трещины вспыхивают цветом лучшей карты, и сундук сразу колется на неровные обломки: они падают, ложатся на пол, оседает пыль.',
    build() {
      const m = mats('stone'), b = buildChest(m)
      const crackMat = new THREE.MeshBasicMaterial({ color: glow.color, alphaMap: crackTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      const cracks = new THREE.Group(); b.g.add(cracks)
      ;[[0, T + HB / 2, D / 2 + 0.006, 0, W], [Math.PI, T + HB / 2, D / 2 + 0.006, 0, W], [Math.PI / 2, T + HB / 2, W / 2 + 0.006, 0, D], [-Math.PI / 2, T + HB / 2, W / 2 + 0.006, 0, D]].forEach(([ry, y, dist, , w]) => { const pv = new THREE.Group(); pv.rotation.y = ry; cracks.add(pv); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, HB), crackMat); p.position.set(0, y, dist); pv.add(p) })
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.006, R + 0.006, W, 48, 1, true, 0, Math.PI), crackMat); shell.rotation.z = Math.PI / 2; shell.position.set(0, T + HB, 0); cracks.add(shell)
      let hits = 0, chunks = [], falling = false
      drawCracks(0)
      const self = {
        g: b.g, hits: () => hits,
        hit() { if (hits >= 3) return true; hits++; drawCracks(hits); tween(260, (k) => { b.g.rotation.z = Math.sin(k * 36) * 0.03 * (1 - k); b.g.position.x = Math.sin(k * 50) * 0.02 * (1 - k) }, (k) => k); return hits >= 3 },
        async open() {
          // С первого удара: трещины вспыхивают разом — и сразу раскол
          hits = 3; drawCracks(3); await tween(180, (k) => { b.g.rotation.z = Math.sin(k * 36) * 0.03 * (1 - k) }, (k) => k)
          chunks = stoneChunks(m.side)
          b.g.children.slice().forEach((c) => { if (c !== cracks) c.visible = false })
          chunks.forEach((c) => b.g.add(c))
          lightUp(0.4, 0.8); await tween(160, () => {}); cracks.visible = false
          const hitAt = new THREE.Vector3(0, HB * 0.8, D / 2 + 0.3)
          chunks.forEach((c) => { const d = c.position.clone().sub(hitAt), dist = d.length(); d.normalize(); const push = 2.2 / (0.5 + dist)
            c.userData.v.set(d.x * push + (Math.random() - 0.5) * 0.4, Math.random() * 0.8, d.z * push * 0.6 + (Math.random() - 0.5) * 0.4); c.userData.w.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 4) })
          falling = true; dustUp(); burst(0.5)
          await tween(900, (k) => lightUp(0.4 + k * 0.6, 0.85))
        },
        // Обломки не держат друг друга стопкой — сундук именно осыпается
        tick(dt) { if (falling) settle(chunks, dt, false, false) },
      }
      return self
    },
  },
  wood: {
    name: 'Дерево', note: 'Сундук из досок, крышка — из реек, F — выжжена. Удар — сундук разлетается на доски и рейки: они падают, отскакивают и ложатся стопкой, летят щепки.',
    build() {
      const g = new THREE.Group(), N = 4, gap = 0.012, boards = []
      const side = new THREE.MeshStandardMaterial({ color: tok('--c-tier-bronze-2'), roughness: 0.9 })
      // Доска — кусок общей текстуры грани (F собирается из досок), у каждой свой оттенок
      const texFront = FACEMAT.wood(Math.round(W * PX), Math.round(HB * PX), true).map, texSide = FACEMAT.wood(Math.round(D * PX), Math.round(HB * PX), true).map, texPlain = FACEMAT.wood(512, 128, false).map
      const board = (w, h, tex, i, n, place) => {
        const tx = tex.clone(); tx.repeat.set(1, 1 / n); tx.offset.set(0, i / n); tx.needsUpdate = true
        const face = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8, color: new THREE.Color(1, 1, 1).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12) })
        const b = mesh(new RoundedBoxGeometry(w, h, T, 2, 0.012), [side, side, side, side, face, side], g); place(b); boards.push(piece(b)); return b
      }
      for (let i = 0; i < N; i++) {
        const y = T + (i + 0.5) * HB / N, h = HB / N - gap
        board(W, h, texFront, i, N, (b) => b.position.set(0, y, D / 2 - T / 2))
        board(W, h, texFront, i, N, (b) => { b.position.set(0, y, -D / 2 + T / 2); b.rotation.y = Math.PI })
        board(D - 2 * T, h, texSide, i, N, (b) => { b.position.set(W / 2 - T / 2, y, 0); b.rotation.y = Math.PI / 2 })
        board(D - 2 * T, h, texSide, i, N, (b) => { b.position.set(-W / 2 + T / 2, y, 0); b.rotation.y = -Math.PI / 2 })
        board(W, D / N - gap, texPlain, 0, 1, (b) => { b.position.set(0, T / 2, -D / 2 + (i + 0.5) * D / N); b.rotation.x = -Math.PI / 2 })
      }
      // Крышка — 7 реек по дуге (тонкая сторона — наружу) и два торца-полукруга
      const M = 7, arc = Math.PI * R / M
      for (let k = 0; k < M; k++) { const f = -Math.PI / 2 + (k + 0.5) * Math.PI / M; board(W, arc - gap, texPlain, 0, 1, (b) => { b.position.set(0, T + HB + (R - T / 2) * Math.cos(f), (R - T / 2) * Math.sin(f)); b.rotation.x = f - Math.PI / 2 }) }
      const half = new THREE.Shape(); half.absarc(0, 0, R, 0, Math.PI, false); half.lineTo(R, 0)
      ;[-1, 1].forEach((s) => { const geo = new THREE.ExtrudeGeometry(half, { depth: T, bevelEnabled: false }); geo.translate(0, 0, -T / 2); const cap = mesh(geo, new THREE.MeshStandardMaterial({ map: texPlain, roughness: 0.8 }), g, s * (W / 2 - T / 2), T + HB, 0); cap.rotation.y = Math.PI / 2; boards.push(piece(cap)) })
      const floorGlow = mesh(new THREE.PlaneGeometry(W * 1.2, D * 1.3), glowSoft, g, 0, T + 0.01, 0); floorGlow.rotation.x = -Math.PI / 2; floorGlow.castShadow = false
      let flying = false
      return {
        g,
        async open() {
          await tween(420, (k) => { g.rotation.z = Math.sin(k * 34) * 0.03 * (1 - k); g.position.x = Math.sin(k * 46) * 0.015 * (1 - k) }, (k) => k)
          scatter(boards, new THREE.Vector3(0, HB * 0.5, 0))
          flying = true; floorGlow.visible = false; splinters(); burst(0.7)
          await tween(800, (k) => lightUp(k, 0.8))
        },
        tick(dt) { if (flying) settle(boards, dt, true) },
      }
    },
  },
  card: {
    name: 'Картон', note: 'Крафт-картон с гофром, F — печатью. Крышку сбрасывает вбок, корпус раскладывается в плоский крест.',
    build() {
      const b = buildChest(mats('card'))
      return { g: b.g, async open() {
        await tween(300, (k) => { b.g.rotation.z = Math.sin(k * 30) * 0.03 * (1 - k) }, (k) => k)
        burst(0.6); tween(700, (k) => lightUp(k, 0.6))
        await tween(380, (k) => { b.lid.rotation.x = -k * 0.9 }, back)
        await lidLand(b, W / 2 + 1.6, -0.3, -Math.PI / 2, 650)
        b.walls.forEach((h, i) => tween(700 + i * 90, (k) => { h.rotation.x = k * Math.PI / 2 }, back))
        await tween(820, () => {})
      } }
    },
  },
}
  return TYPES
}
const KITS = { box: boxKit(), chest: chestKit() }

// ——— Интерфейс: форма, материал, редкость, «Открыть», «Ещё раз», карты ———
const RAR = { base: '--c-muted', holo: '--c-rarity-holo-4', prism: '--c-rarity-holo-5', legend: '--c-tier-gold' }
// Параметры адреса: ?form=box|chest&type=<материал> — стартовый вид; ?mini — превью для виджета главной (blocks/app/chest.html, в iframe):
// без интерфейса, медленно вращается, клик — перейти на эту страницу открывать (открытие — только здесь, решение дирижёра 29.09)
// ?embed — встроенная сцена (онбординг, лаба «онбординг-главная»): без выбора формы и материала, открывается кликом; когда карты раскрыты — postMessage 'chest-opened' родителю
const q = new URLSearchParams(location.search), MINI = q.has('mini'), EMBED = q.has('embed')
let form = ['box', 'chest'].includes(q.get('form')) ? q.get('form') : 'box', type = q.get('type') || 'legend', rar = 'legend', cur = null, open = false, busy = false
if (EMBED) document.documentElement.classList.add('cs-embed')
if (MINI) { document.documentElement.classList.add('cs-mini'); camera.position.set(0, 2.1, 5.4); camera.lookAt(0, 0.75, 0) } // превью — крупнее
// Карты: переворот по очереди, лучшая (центр) — последней; её редкость = выбранное свечение
const RU = { base: 'Base', holo: 'Holo', prism: 'Prism', legend: 'Legend' }
const cards = [...st.querySelectorAll('.cs__card')], order = [0, 2, 1]
let flipT = []
const bestRarity = () => { const pc = st.querySelector('.cs__card--best .player-card'); Object.keys(RU).forEach((r) => pc.classList.toggle(`player-card--${r}`, r === rar)); pc.querySelector('.player-card__rarity').textContent = RU[rar] }
const unflip = () => { flipT.forEach(clearTimeout); flipT = []; cards.forEach((c) => c.classList.remove('is-flip')) }
const flipAll = () => { order.forEach((n, k) => flipT.push(setTimeout(() => cards[n].classList.add('is-flip'), 750 + k * 480 + (k === 2 ? 260 : 0)))) }
const target = { ry: 0 }
const hint = (t) => { st.querySelector('.cs__hint').textContent = t }
const press = (sel, val, attr) => st.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[attr] === val)))
const setColor = () => { const c = tok(RAR[rar]); st.style.setProperty('--rc', `var(${RAR[rar]})`); [glow.color, glowSoft.color, core.material.color, ring.material.color, inner.color, beamMat.color, sparks.material.color].forEach((x) => x.copy(c)); edgeMats.forEach((m) => m.color.copy(c)) }
const mount = () => {
  if (cur) root.remove(cur.g)
  edgeMats.length = 0; tweens.length = 0
  if (!KITS[form][type]) type = 'legend'
  const T_ = KITS[form][type]
  cur = T_.build(); root.add(cur.g)
  open = false; busy = false; st.classList.remove('is-open', 'is-cards'); unflip(); bestRarity()
  lightUp(0); sparks.material.opacity = 0; dust.material.opacity = 0; chips.material.opacity = 0; root.position.set(0, 0, 0); root.rotation.z = 0
  setColor()
  st.querySelector('.cs__name').textContent = T_.name
  st.querySelector('.cs__note').textContent = T_.note
  press('[data-form]', form, 'form'); press('[data-type]', type, 'type'); press('[data-rar]', rar, 'rar')
  hint(type === 'stone' ? 'Нажми — камень разлетится' : `Нажми на ${form === 'box' ? 'коробку' : 'сундук'}`)
}
const doOpen = async () => {
  if (open || busy) return
  busy = true; open = true; st.classList.add('is-open'); hint('')
  await cur.open()
  st.classList.add('is-cards'); flipAll(); busy = false
  if (EMBED) setTimeout(() => parent.postMessage('chest-opened', '*'), 2400)
}
st.addEventListener('click', (e) => {
  const b = e.target.closest('[data-form], [data-type], [data-rar], [data-act]')
  if (!b) return
  if (b.dataset.form) { form = b.dataset.form; mount() }
  if (b.dataset.type) { type = b.dataset.type; mount() }
  if (b.dataset.rar) { rar = b.dataset.rar; press('[data-rar]', rar, 'rar'); setColor(); bestRarity() }
  if (b.dataset.act === 'open') doOpen()
  if (b.dataset.act === 'reset') mount()
})
renderer.domElement.addEventListener('click', () => { if (MINI) window.top.location.href = `chest.html?form=${form}&type=${type}`; else doOpen() })
addEventListener('pointermove', (e) => { target.ry = (e.clientX / innerWidth - 0.5) * 1.2 })
const fit = () => { const w = st.clientWidth, h = st.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix() }
addEventListener('resize', fit); fit()
mount()

let last = performance.now()
renderer.setAnimationLoop((now) => {
  if (!inView || !shown) { last = now; return }
  const dt = Math.min(0.033, (now - last) / 1000); last = now
  for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.ms); tw.fn(tw.ease(k)); if (k === 1) { tweens.splice(i, 1); tw.res() } }
  // Предмет стоит на полу и поворачивается только за курсором
  if (MINI) root.rotation.y += dt * 0.35 // превью — медленно вращается само
  else root.rotation.y += (target.ry + 0.6 - root.rotation.y) * 0.08
  const pulse = 0.55 + Math.sin(now / 400) * 0.35
  edgeMats.forEach((m) => { m.opacity = open ? 1 : pulse })
  ring.material.opacity = open ? 0.9 : 0.2 + pulse * 0.3
  cur.tick?.(dt)
  if (sparks.material.opacity > 0) { for (let i = 0; i < NS; i++) { svel[i * 3 + 1] -= 5 * dt; for (let a = 0; a < 3; a++) spos[i * 3 + a] += svel[i * 3 + a] * dt } sg.attributes.position.needsUpdate = true; sparks.material.opacity = Math.max(0, sparks.material.opacity - dt * 0.4) }
  if (chips.material.opacity > 0) { for (let i = 0; i < NP; i++) { pvel[i * 3 + 1] -= 9.8 * dt; for (let a = 0; a < 3; a++) ppos[i * 3 + a] += pvel[i * 3 + a] * dt; if (ppos[i * 3 + 1] < 0.01) { ppos[i * 3 + 1] = 0.01; pvel[i * 3] *= 0.6; pvel[i * 3 + 2] *= 0.6; pvel[i * 3 + 1] = 0 } } pg.attributes.position.needsUpdate = true; chips.material.opacity = Math.max(0, chips.material.opacity - dt * 0.3) }
  if (dust.material.opacity > 0) { for (let i = 0; i < ND; i++) { dvel[i * 3] *= 0.985; dvel[i * 3 + 2] *= 0.985; dvel[i * 3 + 1] -= 0.25 * dt; for (let a = 0; a < 3; a++) dpos[i * 3 + a] += dvel[i * 3 + a] * dt; if (dpos[i * 3 + 1] < 0.02) dpos[i * 3 + 1] = 0.02 } dg.attributes.position.needsUpdate = true; dust.material.opacity = Math.max(0, dust.material.opacity - dt * 0.18) }
  renderer.render(scene, camera)
})
