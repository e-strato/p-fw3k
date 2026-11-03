// Лаба «Бустеры» (дирижёр 05.10, референс — видео открытия фольгированного пака): общий движок сцены.
// Как страница «Сундук» (website/chest.js): Three.js с CDN, свет цветом редкости, карты сайта выходят и переворачиваются,
// внизу — Base / Holo / Prism / Legend, «Открыть», «Ещё раз». Вариант даёт только сам бустер и своё открытие:
//   start({ name, note, hint, build(K) → { g, open(), tick(dt), down(e), move(e), up(e) } })
// K — набор движка: материалы и текстуры бустера, вспышки, лучи, ударная волна, искры, конфетти, tween, раскрытие карт.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export { THREE }
const cssVar = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim()
const tok = (t) => new THREE.Color(cssVar(t))
const hexMix = (a, b, k) => `#${tok(a).lerp(tok(b), k).getHexString()}`

// Редкость: цвет свечения, цвета фольги (основной, тёмный, акцент), палитра конфетти, переливы
export const RAR = {
  base: { ru: 'Base', glow: '--c-muted', main: '--c-tier-silver', dark: '--c-tier-silver-2', acc: '--c-white', conf: ['--c-tier-silver', '--c-white', '--c-muted'], irid: 0 },
  holo: { ru: 'Holo', glow: '--c-rarity-holo-4', main: '--c-rarity-holo-4', dark: '--c-flag-ru-blue', acc: '--c-rarity-holo-1', conf: ['--c-rarity-holo-1', '--c-rarity-holo-2', '--c-rarity-holo-3', '--c-rarity-holo-4', '--c-rarity-holo-5'], irid: 1 },
  prism: { ru: 'Prism', glow: '--c-rarity-holo-5', main: '--c-rarity-holo-5', dark: '--c-card-to', acc: '--c-rarity-holo-3', conf: ['--c-rarity-holo-5', '--c-rarity-holo-1', '--c-rarity-holo-3', '--c-white'], irid: 1 },
  legend: { ru: 'Legend', glow: '--c-tier-gold', main: '--c-tier-gold', dark: '--c-card-ink', acc: '--c-tier-gold-hi', conf: ['--c-tier-gold', '--c-tier-gold-hi', '--c-rarity-foil-2', '--c-white'], irid: 0 },
}

// Карты, которые выходят из бустера: две по бокам и лучшая в центре (её редкость = выбранная)
const CARDS = [
  { nick: 'Yatoro', img: 'yatoro', tier: 'gold', rar: 'holo', ovr: 88, team: 'TS', pos: 1, flag: 'ua', heroes: ['faceless_void', 'terrorblade', 'morphling'], cc: '--c-rarity-holo-4' },
  { nick: '9Class', img: '9class', tier: 'elite', rar: 'legend', ovr: 95, team: 'PV', pos: 4, flag: 'ru', heroes: ['tusk', 'rubick', 'hoodwink'], best: true },
  { nick: 'Pure', img: 'pure', tier: 'elite', rar: 'prism', ovr: 93, team: 'TUN', pos: 1, flag: 'ru', heroes: ['terrorblade', 'morphling', 'faceless_void'], cc: '--c-rarity-holo-5' },
]
const cardHTML = (c, i) => `
<div class="cs__card${c.best ? ' cs__card--best' : ''}" style="--i: ${i}${c.cc ? `; --cc: var(${c.cc})` : ''}">
  <div class="cs__flip"><i class="cs__back" aria-hidden="true"><b>F</b></i>
  <div class="cs__front"><div class="player-card player-card--f player-card--${c.tier} player-card--${c.rar}"><div class="player-card__in">
    <div class="player-card__body"></div>
    <div class="player-card__f-art"><i class="player-card__shine"></i><i class="player-card__spark"><b></b><b></b><b></b><b></b><b></b><b></b></i>
      <span class="player-card__big">${c.ovr}</span><img class="player-card__ph" src="/p-fw3k/site/img/players/${c.img}.webp" alt="${c.nick}" /></div>
    <img class="player-card__ph player-card__ph--pop" src="/p-fw3k/site/img/players/${c.img}.webp" alt="" aria-hidden="true" />
    <div class="player-card__f-info"><b class="player-card__rarity">${RAR[c.rar].ru}</b>
      <div class="player-card__f-ic">${c.heroes.map((h, k) => `<span${k === 2 ? ' class="player-card__hero--best"' : ''}><img src="/p-fw3k/site/img/heroes/${h}.webp" alt="" /></span>`).join('')}</div>
      <div class="player-card__f-team"><i class="player-card__flag player-card__flag--${c.flag}"></i><span>${c.team} · <b>POS ${c.pos}</b></span></div></div>
    <div class="player-card__f-strip"><b class="player-card__f-nick">${c.nick}</b><span class="player-card__ovr"><b>${c.ovr}</b><small>OVR</small></span></div>
    <i class="player-card__glare"></i></div></div></div></div>
</div>`

// ——— Холсты: текстуры бустера ———
const canvasTex = (w, h, draw, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
// Мягкое пятно света: гаусс, гаснущий ровно в ноль к краю, с лёгким шумом против ступенек (было — 4 стопа градиента, край рвался)
const softTex = (() => { const N = 512, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), img = g.createImageData(N, N)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const dx = (x + 0.5) / N * 2 - 1, dy = (y + 0.5) / N * 2 - 1, r2 = dx * dx + dy * dy, i = (y * N + x) * 4
    const a = r2 >= 1 ? 0 : Math.exp(-4.2 * r2) * (1 - r2) ** 2
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.max(0, Math.min(255, a * 255 + (Math.random() - 0.5) * 1.5)) }
  g.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t })()
const rayTex = canvasTex(64, 512, (g) => { for (let x = 0; x < 64; x++) { const d = (x - 31.5) / 32, e = Math.exp(-((d / 0.4) ** 2)) * (1 - d * d) ** 2; const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, `rgba(255,255,255,${(0.35 * e).toFixed(3)})`); gr.addColorStop(1, `rgba(255,255,255,${e.toFixed(3)})`); g.fillStyle = gr; g.fillRect(x, 0, 1, 512) } })
const ringTex = canvasTex(512, 512, (g) => { const r = g.createRadialGradient(256, 256, 150, 256, 256, 256); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.72, 'rgba(255,255,255,.15)'); r.addColorStop(0.86, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 512, 512) })

// Мятая фольга: рельеф — складки (длинные тонкие линии), мелкая рябь и вертикальные защипы у краёв
export const crinkleTex = (() => { let t; return () => t || (t = canvasTex(512, 768, (g, w, h) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 260; i++) { const x = Math.random() * w, y = Math.random() * h, a = (Math.random() - 0.5) * 1.2 + (Math.random() < 0.5 ? 0 : Math.PI / 2), l = 20 + Math.random() * 120
    g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.22)'; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke() }
  g.filter = 'blur(1.5px)'; g.drawImage(g.canvas, 0, 0); g.filter = 'none'
  for (const [y0, y1] of [[0, 90], [h - 90, h]]) for (let x = 0; x < w; x += 6) { const gr = g.createLinearGradient(0, y0, 0, y1); const a = (0.12 + Math.random() * 0.2).toFixed(2); gr.addColorStop(y0 ? 0 : 1, 'rgba(0,0,0,0)'); gr.addColorStop(y0 ? 1 : 0, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(x, y0, 2, y1 - y0) }
}, false)) })()
// Рифлёный шов: частые вертикальные гребни
export const crimpTex = (() => { let t; return () => t || (t = canvasTex(512, 32, (g, w, h) => { for (let x = 0; x < w; x += 8) { const gr = g.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, '#202020'); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#202020'); g.fillStyle = gr; g.fillRect(x, 0, 8, h) } }, false)) })()

// Лицо бустера: фон цветом редкости, веер лучей, переливы, кольцо с F, название; без капса
export function packFace(r, { title = 'Fantasy · Dota 2', name, sub = '5 карт игроков', back = false, w = 512, h = 768 } = {}) {
  const R = RAR[r], main = cssVar(R.main), acc = cssVar(R.acc)
  return canvasTex(w, h, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, h)
    if (r === 'legend') { bg.addColorStop(0, hexMix('--c-card-ink', '--c-tier-gold', 0.12)); bg.addColorStop(0.5, cssVar('--c-card-ink')); bg.addColorStop(1, hexMix('--c-card-ink', '--c-tier-gold-2', 0.5)) }
    else { bg.addColorStop(0, hexMix(R.main, '--c-white', 0.15)); bg.addColorStop(0.45, main); bg.addColorStop(1, hexMix(R.main, R.dark, 0.75)) }
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    // Веер лучей из центра эмблемы
    g.save(); g.translate(w / 2, h * 0.42); g.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 36; i++) { g.rotate(Math.PI * 2 / 36); g.fillStyle = `rgba(255,255,255,${i % 2 ? 0.035 : 0.07})`; g.beginPath(); g.moveTo(0, 0); g.lineTo(-18, -h); g.lineTo(18, -h); g.fill() }
    g.restore()
    // Переливы для Holo / Prism — диагональные цветные полосы
    if (R.irid) { g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.5; const ir = g.createLinearGradient(0, 0, w, h); ['--c-rarity-holo-1', '--c-rarity-holo-2', '--c-rarity-holo-3', '--c-rarity-holo-4', '--c-rarity-holo-5', '--c-rarity-holo-1'].forEach((t, i, a) => ir.addColorStop(i / (a.length - 1), cssVar(t))); g.fillStyle = ir; g.fillRect(0, 0, w, h); g.restore() }
    // Свет в центре
    const glow = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.6); glow.addColorStop(0, 'rgba(255,255,255,.35)'); glow.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h)
    const ink = r === 'legend' ? acc : '#ffffff'
    g.textAlign = 'center'; g.textBaseline = 'middle'
    if (back) {
      g.fillStyle = ink; g.globalAlpha = 0.85; g.font = '600 26px Inter, sans-serif'; g.fillText(title, w / 2, h * 0.2)
      g.globalAlpha = 0.55; g.font = '500 20px Inter, sans-serif'; ['3 карты · одна редкости ' + R.ru, 'Шанс Legend — 1%', 'Сезон 2026/27'].forEach((t, i) => g.fillText(t, w / 2, h * (0.6 + i * 0.06)))
      g.globalAlpha = 1
    } else {
      g.strokeStyle = ink; g.globalAlpha = 0.9; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h * 0.42, 104, 0, Math.PI * 2); g.stroke()
      g.globalAlpha = 1; g.fillStyle = ink; g.shadowColor = r === 'legend' ? main : 'rgba(255,255,255,.6)'; g.shadowBlur = 24
      g.font = '900 150px Inter, sans-serif'; g.fillText('F', w / 2, h * 0.43)
      g.shadowBlur = 0; g.font = '600 24px Inter, sans-serif'; g.globalAlpha = 0.85; g.fillText(title, w / 2, h * 0.13)
      g.globalAlpha = 1; g.font = `800 ${name && name.length > 8 ? 64 : 84}px Archivo, Inter, sans-serif`; g.fillText(name || R.ru, w / 2, h * 0.68)
      g.font = '600 22px Inter, sans-serif'; g.globalAlpha = 0.7; g.fillText(sub, w / 2, h * 0.77); g.globalAlpha = 1
    }
  })
}

// Фольга: металл с рисунком, мятый рельеф, переливы у Holo / Prism; emissive — для «налился светом»
export function foil(r, map, { irid } = {}) {
  const R = RAR[r]
  return new THREE.MeshPhysicalMaterial({ map, metalness: 0.55, roughness: 0.3, bumpMap: crinkleTex(), bumpScale: 2.2, clearcoat: 0.8, clearcoatRoughness: 0.25,
    iridescence: irid ?? R.irid, iridescenceIOR: 1.5, iridescenceThicknessRange: [180, 700], emissive: tok(R.glow), emissiveIntensity: 0, side: THREE.FrontSide })
}
export const crimpMat = (r) => new THREE.MeshStandardMaterial({ color: r === 'legend' ? tok('--c-tier-gold') : tok('--c-tier-silver'), metalness: 1, roughness: 0.35, bumpMap: crimpTex(), bumpScale: 4 })

// Подушка пака: плоскость с выпуклостью по центру и сплющенными краями (как надутая фольга).
// y0..y1 — какая часть пака (для отрыва верха), zig0/zig1 — рваная кромка снизу/сверху куска, back — задняя сторона
export function pillow(W, H, D, { y0 = -H / 2, y1 = H / 2, zig0 = null, zig1 = null, back = false, sx = 48, sy = 72, flat = 0.9 } = {}) {
  const geo = new THREE.PlaneGeometry(W, y1 - y0, sx, Math.max(4, Math.round(sy * (y1 - y0) / H)))
  geo.translate(0, (y0 + y1) / 2, 0)
  const p = geo.attributes.position, uv = geo.attributes.uv, eps = 1e-5
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i)
    const xs = back ? -x : x
    if (zig0 && Math.abs(y - y0) < eps) y += zig0(xs)
    if (zig1 && Math.abs(y - y1) < eps) y += zig1(xs)
    const u = x / (W / 2), v = y / (H / 2)
    const bx = Math.pow(Math.max(0, 1 - u * u), 0.55)
    const by = 1 - THREE.MathUtils.smoothstep(Math.abs(v), flat - 0.16, flat)
    const wr = (Math.sin(x * 23 + y * 7) + Math.sin(x * 9 - y * 31)) * 0.004
    p.setXYZ(i, x, y, (D * bx + wr) * by)
    uv.setXY(i, back ? 1 - (x + W / 2) / W : (x + W / 2) / W, (y + H / 2) / H)
  }
  geo.computeVertexNormals()
  return geo
}

// ——— Сцена ———
export function start(V) {
  const host = document.querySelector('.bs')
  host.classList.add('cs')
  host.innerHTML = `
    <div class="cs__cap"><h1 class="cs__name">${V.name}</h1><p class="cs__note">${V.note}</p></div>
    <canvas class="bs__trail" aria-hidden="true"></canvas>
    <i class="bs__flash" aria-hidden="true"></i>
    <div class="cs__cards">${CARDS.map(cardHTML).join('')}</div>
    <p class="cs__hint"></p>
    <div class="cs__bar">
      <div class="btn-row" role="group" aria-label="Редкость">${Object.entries(RAR).map(([k, r]) => `<button class="btn btn--quiet btn--sm" type="button" aria-pressed="false" data-rar="${k}">${r.ru}</button>`).join('')}</div>
      <i class="cs__sep"></i>
      <button class="btn btn--sm" type="button" data-act="open">Открыть</button>
      <button class="btn btn--quiet btn--sm" type="button" data-act="reset">Ещё раз</button>
    </div>`

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.localClippingEnabled = true
  host.prepend(renderer.domElement)
  let inView = true, shown = !document.hidden
  new IntersectionObserver(([e]) => { inView = e.isIntersecting }).observe(renderer.domElement)
  document.addEventListener('visibilitychange', () => { shown = !document.hidden })

  const scene = new THREE.Scene()
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0.25, 8.2); camera.lookAt(0, 0.2, 0)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a10, 0.6))
  const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(3, 5, 6); scene.add(key)
  const rim = new THREE.DirectionalLight(tok('--c-accent'), 2.2); rim.position.set(-5, 3, -4); scene.add(rim)
  const rim2 = new THREE.DirectionalLight(0xffffff, 1.2); rim2.position.set(5, -2, -3); scene.add(rim2)

  // Общие эффекты: ядро-вспышка, лучи веером, ударная волна, искры, конфетти, свет изнутри
  const glowCol = new THREE.Color()
  const fx = new THREE.Group(); scene.add(fx)
  const add = (o) => (fx.add(o), o)
  const core = add(new THREE.Sprite(new THREE.SpriteMaterial({ color: glowCol, map: softTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })))
  const halo = add(new THREE.Sprite(new THREE.SpriteMaterial({ color: glowCol, map: softTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })))
  halo.position.z = -0.4
  const rays = add(new THREE.Group())
  const rayMat = new THREE.MeshBasicMaterial({ color: glowCol, map: rayTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  for (let i = 0; i < 14; i++) { const len = 4 + Math.random() * 4, m = new THREE.Mesh(new THREE.PlaneGeometry(0.35 + Math.random() * 0.5, len), rayMat); m.geometry.translate(0, -len / 2, 0); m.rotation.z = (i / 14) * Math.PI * 2 + Math.random() * 0.2; m.rotation.x = Math.PI; const p = new THREE.Group(); p.add(m); rays.add(p) }
  rays.position.z = -0.6
  const shock = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: glowCol, map: ringTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })))
  const light = add(new THREE.PointLight(glowCol, 0, 8, 1.6)); light.position.z = 1
  const NS = 700, spos = new Float32Array(NS * 3), svel = new Float32Array(NS * 3)
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(spos, 3))
  const sparks = add(new THREE.Points(sg, new THREE.PointsMaterial({ color: glowCol, size: 0.045, map: softTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })))
  const NC = 260, conf = add(new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.11), new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0.15 }), NC))
  conf.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  const cs = Array.from({ length: NC }, () => ({ p: new THREE.Vector3(0, -99, 0), v: new THREE.Vector3(), r: new THREE.Euler(), w: new THREE.Vector3(), life: 0 }))
  const dummy = new THREE.Object3D()
  dummy.scale.setScalar(0); dummy.updateMatrix(); for (let i = 0; i < NC; i++) conf.setMatrixAt(i, dummy.matrix)

  const tweens = []
  const tween = (ms, fn, ease = (k) => 1 - (1 - k) ** 3) => new Promise((res) => tweens.push({ t0: performance.now(), ms, fn, ease, res }))
  const back = (k) => { const c = 1.6; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2 }
  const wait = (ms) => tween(ms, () => {})
  const flash = host.querySelector('.bs__flash')

  const K = {
    THREE, scene, camera, renderer, host, tok, tween, back, wait, rar: 'legend', softTex, timeScale: 1, frame: [], render: null,
    col: (t) => tok(t), glow: () => glowCol.clone(),
    // Свет у точки: ядро + ореол + свет; k 0..1
    lightAt(pos, k, size = 1) { core.position.copy(pos); halo.position.set(pos.x, pos.y, pos.z - 0.4); light.position.set(pos.x, pos.y, pos.z + 0.8)
      core.material.opacity = Math.min(1, k * 1.2); core.scale.setScalar(0.01 + k * 2.6 * size); halo.material.opacity = k * 0.7; halo.scale.setScalar(0.01 + k * 7 * size); light.intensity = 30 * k },
    rays(pos, k) { rays.position.set(pos.x, pos.y, pos.z - 0.6); rayMat.opacity = k * 0.55; rays.scale.setScalar(0.4 + k * 0.8) },
    shock(pos, size = 7, ms = 900) { shock.position.copy(pos); return tween(ms, (k) => { shock.scale.setScalar(0.3 + k * size); shock.material.opacity = (1 - k) * 0.95 }) },
    sparks(pos, power = 1, up = 0) { for (let i = 0; i < NS; i++) { spos.set([pos.x + (Math.random() - 0.5) * 0.4, pos.y + (Math.random() - 0.5) * 0.3, pos.z], i * 3); const a = Math.random() * Math.PI * 2, s = (0.6 + Math.random() * 3.4) * power; svel.set([Math.cos(a) * s, Math.sin(a) * s + up * (1 + Math.random() * 3), (Math.random() - 0.2) * 2 * power], i * 3) } sparks.material.opacity = 1 },
    confetti(pos, power = 1, up = 3) { const pal = RAR[K.rar].conf.map(tok); cs.forEach((c, i) => { c.p.set(pos.x + (Math.random() - 0.5) * 0.5, pos.y, pos.z + (Math.random() - 0.5) * 0.3); const a = Math.random() * Math.PI * 2, s = (0.5 + Math.random() * 2.6) * power; c.v.set(Math.cos(a) * s, up * (0.6 + Math.random()) * power, Math.sin(a) * s * 0.6 + 0.6); c.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); c.w.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18); c.life = 3 + Math.random() * 2; conf.setColorAt(i, pal[i % pal.length]) }); conf.instanceColor.needsUpdate = true },
    flash(strength = 0.85) { flash.animate([{ opacity: strength }, { opacity: 0 }], { duration: 700, easing: 'ease-out' }) },
    hint(t) { host.querySelector('.cs__hint').textContent = t },
    // Позиция точки на плоскости z = z0 под курсором (для разреза, кручения)
    onPlane(e, z0 = 0) { const r = renderer.domElement.getBoundingClientRect(), v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); const rc = new THREE.Raycaster(); rc.setFromCamera(v, camera); const p = new THREE.Vector3(); rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -z0), p); return p },
    hit(e, obj) { const r = renderer.domElement.getBoundingClientRect(), v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); const rc = new THREE.Raycaster(); rc.setFromCamera(v, camera); return rc.intersectObject(obj, true)[0] },
    trail: host.querySelector('.bs__trail'),
    // Раскрыть карты: выходят из точки бустера (y экрана в %), переворачиваются по очереди, лучшая — последней
    reveal(fromY = 50) { host.style.setProperty('--from', fromY + '%'); host.classList.add('is-open', 'is-cards'); [0, 2, 1].forEach((n, k) => flipT.push(setTimeout(() => cards[n].classList.add('is-flip'), 650 + k * 460 + (k === 2 ? 280 : 0)))); if (V.onOpened) V.onOpened() },
  }

  // ——— Интерфейс ———
  const cards = [...host.querySelectorAll('.cs__card')]
  let flipT = [], cur = null, busy = false, opened = false
  const target = { x: 0, y: 0 }
  const press = () => host.querySelectorAll('[data-rar]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rar === K.rar)))
  const bestRarity = () => { const pc = host.querySelector('.cs__card--best .player-card'); if (!pc) return; Object.keys(RAR).forEach((r) => pc.classList.toggle(`player-card--${r}`, r === K.rar)); pc.querySelector('.player-card__rarity').textContent = RAR[K.rar].ru }
  const mount = () => {
    if (cur) scene.remove(cur.g)
    tweens.length = 0; flipT.forEach(clearTimeout); flipT = []
    cards.forEach((c) => c.classList.remove('is-flip')); host.classList.remove('is-open', 'is-cards')
    glowCol.copy(tok(RAR[K.rar].glow)); host.style.setProperty('--rc', `var(${RAR[K.rar].glow})`)
    core.material.opacity = halo.material.opacity = rayMat.opacity = shock.material.opacity = sparks.material.opacity = 0; light.intensity = 0
    cs.forEach((c) => { c.life = 0 })
    busy = false; opened = false; K.timeScale = 1; K.frame = []; K.render = null
    cur = V.build(K); scene.add(cur.g)
    press(); bestRarity(); K.hint(V.hint)
  }
  // Открыть: вариант сам решает, как (у некоторых «Открыть» запускает тот же жест автоматически)
  K.open = async () => { if (busy || opened) return; busy = true; opened = true; await cur.open(); busy = false }
  K.isBusy = () => busy || opened
  host.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rar], [data-act]'); if (!b) return
    if (b.dataset.rar) { K.rar = b.dataset.rar; mount() }
    if (b.dataset.act === 'open') (cur.auto ? (!busy && !opened && cur.auto()) : K.open())
    if (b.dataset.act === 'reset') mount()
  })
  const cv = renderer.domElement
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); cur.down ? cur.down(e) : K.open() })
  cv.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); target.x = (e.clientX - r.left) / r.width - 0.5; target.y = (e.clientY - r.top) / r.height - 0.5; cur.move?.(e) })
  ;['pointerup', 'pointercancel'].forEach((ev) => cv.addEventListener(ev, (e) => cur.up?.(e)))
  const trail = K.trail
  const fit = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); trail.width = w; trail.height = h }
  addEventListener('resize', fit); fit()

  const ready = document.fonts?.ready ?? Promise.resolve()
  ready.then(() => {
    mount()
    let last = performance.now()
    renderer.setAnimationLoop((now) => {
      if (!inView || !shown) { last = now; return }
      // timeScale — замедление времени (лаба «Паки», v2): физика искр и конфетти и tick варианта; tween идут в реальном времени
      const dt = Math.min(0.033, (now - last) / 1000) * K.timeScale; last = now
      for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.ms); tw.fn(tw.ease(k)); if (k === 1) { tweens.splice(i, 1); tw.res() } }
      // Бустер слегка следует за курсором, пока не открыт
      if (!opened) { cur.g.rotation.y += (target.x * 0.6 - cur.g.rotation.y) * 0.06; cur.g.rotation.x += (target.y * 0.25 - cur.g.rotation.x) * 0.06 }
      cur.tick?.(dt, now / 1000)
      rays.rotation.z += dt * 0.15
      if (sparks.material.opacity > 0) { for (let i = 0; i < NS; i++) { svel[i * 3] *= 0.985; svel[i * 3 + 1] = svel[i * 3 + 1] * 0.985 - 2.2 * dt; for (let a = 0; a < 3; a++) spos[i * 3 + a] += svel[i * 3 + a] * dt } sg.attributes.position.needsUpdate = true; sparks.material.opacity = Math.max(0, sparks.material.opacity - dt * 0.45) }
      let live = false
      cs.forEach((c, i) => {
        if (c.life > 0) { live = true; c.life -= dt; c.v.y -= 3.2 * dt; c.v.multiplyScalar(0.986); c.p.addScaledVector(c.v, dt); c.r.x += c.w.x * dt; c.r.y += c.w.y * dt; c.r.z += c.w.z * dt }
        dummy.position.copy(c.life > 0 ? c.p : new THREE.Vector3(0, -99, 0)); dummy.rotation.copy(c.r); dummy.scale.setScalar(c.life > 0 ? Math.min(1, c.life) : 0); dummy.updateMatrix(); conf.setMatrixAt(i, dummy.matrix)
      })
      if (live || conf.userData.live) conf.instanceMatrix.needsUpdate = true
      conf.userData.live = live
      // Лаба «Свечение»: свои покадровые эффекты и своя отрисовка (bloom)
      K.frame.forEach((f) => f(dt, now / 1000))
      K.render ? K.render(dt) : renderer.render(scene, camera)
    })
  })
  return K
}
