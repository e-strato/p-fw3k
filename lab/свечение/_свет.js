// Лаба «Свечение» (дирижёр 05.10: «свечение стрёмное — отдельная лаба, разные свечения»). Сцена — «Обёртка» v5 «Чехол 2.0»
// (обе части вниз, те же карты становятся настоящими), меняется только свет: play из ../обёртка с V.glow.
// Свет варианта — объект { deck(k), light(pos, k, size), rays(pos, k), shock(pos, size), flash(x) }.
import { play, THREE } from '../обёртка/_обёртка.js'
export { THREE }

// Обёртка из «Чехла 2.0»: верх кувырком к зрителю и вниз, низ съезжает и падает
const chehol = async ({ K, A, B }) => {
  const top = A.n.y > 0 ? A : B, low = top === A ? B : A
  K.tween(1300, (k) => { top.h.position.set(k * 0.5, Math.sin(k * Math.PI) * 0.7 - k * k * 5.5, 0.2 + k * 1.6); top.h.rotation.set(k * 4.2, k * 0.6, k * 0.8) }, (k) => k)
  K.tween(1400, (k) => { low.h.position.y = -(k < 0.3 ? k * 0.5 + Math.sin(k * 40) * 0.01 : 0.15 + (k - 0.3) ** 2 * 10); low.h.position.z = 0.15 * Math.min(1, k * 4); low.h.rotation.set(-k * k * 1.2, 0, Math.sin(k * 9) * 0.03 * (1 - k) - k * k * 0.4) }, (k) => k)
  await K.wait(450)
}
import { hgCards, hgBack } from './_хг.js'
// Карты — Хайперглитч (карта финала), рубашка — в её манере, пропорция 5:7; extra — например, свой рисунок пака (v6)
export const run = (name, note, glow, extra = {}) => play({ name, note, swap: true, remove: chehol, glow, cards: hgCards, back: hgBack, aspect: 5 / 7, ...extra })
const none = () => {}

// ——— Общее: мягкий CSS-ореол позади сцены. CSS-градиент браузер рисует без ступенек, в отличие от света в WebGL ———
export function cssHalo(K, { size = 70, strength = 0.9 } = {}) {
  const el = K.host.querySelector('.glow-css') || K.host.insertBefore(Object.assign(document.createElement('i'), { className: 'glow-css' }), K.host.firstChild)
  el.style.opacity = 0
  return (pos, k, sz = 1) => {
    const p = pos.clone().project(K.camera)
    el.style.left = (p.x + 1) / 2 * 100 + '%'; el.style.top = (1 - p.y) / 2 * 100 + '%'
    el.style.setProperty('--s', size * sz + 'vmin'); el.style.opacity = Math.min(1, k * strength)
  }
}

// v1 · Ореол CSS: только мягкий ореол позади карт, без пятен, лучей и волны
export const glowCss = (K) => {
  const halo = cssHalo(K, { strength: 1.2 })
  return { deck: (k) => halo(new THREE.Vector3(0, 0.3, 1), k * 0.6, 0.8), light: halo, rays: none, shock: none, flash: (x) => K.flash(x * 0.5) }
}

// v2 · Контур карт: у каждой карты своё свечение по краю (размытый прямоугольник позади) — как у карт сайта после переворота
export const glowRim = (K, { cards, CH3 }) => {
  // Гаусс от расстояния до карты, к краю холста — ноль (blur на холсте обрезался краем — была «ступенька»)
  const RW = 320, RH = 384, RCW = 128, RCH = 179
  const tex = (() => { const c = document.createElement('canvas'); c.width = RW; c.height = RH; const x = c.getContext('2d'), img = x.createImageData(RW, RH)
    for (let j = 0; j < RH; j++) for (let i = 0; i < RW; i++) { const dx = Math.max(0, Math.abs(i + 0.5 - RW / 2) - RCW / 2), dy = Math.max(0, Math.abs(j + 0.5 - RH / 2) - RCH / 2), d = Math.hypot(dx, dy), q = (j * RW + i) * 4
      img.data[q] = img.data[q + 1] = img.data[q + 2] = 255; img.data[q + 3] = Math.max(0, Math.min(255, Math.exp(-((d / 38) ** 2) * 1.5) * 190 + (Math.random() - 0.5) * 1.5)) }
    x.putImageData(img, 0, 0); return new THREE.CanvasTexture(c) })()
  const mat = new THREE.MeshBasicMaterial({ color: K.glow(), map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }) // обычное смешивание — без пересвета
  cards.forEach((m) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(1.1 * RW / RCW, CH3 * RH / RCH), mat); r.position.z = -0.02; m.add(r) })
  const halo = cssHalo(K, { size: 55, strength: 0.35 })
  return { deck: (k) => { mat.opacity = k * 0.6 }, light: (p, k, sz) => { mat.opacity = Math.max(mat.opacity * 0.9, Math.min(0.7, k * 0.7)); halo(p, k, sz) }, rays: none, shock: none, flash: none }
}

// v3 · Мягкие лучи: тонкие длинные лучи веером из-за колоды, медленно вращаются; без пятна в центре
export const glowRays = (K, { g }) => {
  const tex = (() => { const N = 64, M = 512, c = document.createElement('canvas'); c.width = N; c.height = M; const x = c.getContext('2d'), img = x.createImageData(N, M)
    for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) { const u = (i + 0.5) / N * 2 - 1, v = j / M, a = Math.exp(-((u / 0.35) ** 2)) * (1 - u * u) * Math.sin(Math.PI * Math.min(1, v * 1.15)) ** 1.5 * (1 - v * 0.6), q = (j * N + i) * 4
      img.data[q] = img.data[q + 1] = img.data[q + 2] = 255; img.data[q + 3] = a * 255 + (Math.random() - 0.5) * 1.5 }
    x.putImageData(img, 0, 0); return new THREE.CanvasTexture(c) })()
  const mat = new THREE.MeshBasicMaterial({ color: K.glow(), map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  const fan = new THREE.Group(); g.add(fan) // в группе варианта — уходит вместе с ней при «Ещё раз»
  for (let i = 0; i < 22; i++) { const L = 3.5 + Math.random() * 3, m = new THREE.Mesh(new THREE.PlaneGeometry(0.12 + Math.random() * 0.22, L), mat); m.geometry.translate(0, L / 2, 0); m.rotation.z = i / 22 * Math.PI * 2 + Math.random() * 0.15; fan.add(m) }
  fan.position.set(0, 0.4, 0.4)
  K.frame.push((dt) => { fan.rotation.z += dt * 0.12 })
  const halo = cssHalo(K, { size: 45, strength: 0.4 })
  const ray = (p, k) => { fan.position.copy(g.worldToLocal(p.clone())).setZ(p.z - 0.6); mat.opacity = Math.min(0.45, k * 0.5) }
  return { deck: (k) => ray(new THREE.Vector3(0, 0.3, 0.4), k * 0.5), light: (p, k, sz) => { ray(p, k); halo(p, k, sz) }, rays: none, shock: none, flash: none }
}

// v4 · Пыль-боке: мягкие светящиеся пылинки трёх размеров плывут вверх вокруг колоды, плюс лёгкий CSS-ореол
export const glowBokeh = (K, { g }) => {
  const dot = (() => { const N = 128, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), img = x.createImageData(N, N)
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const dx = (i + 0.5) / N * 2 - 1, dy = (j + 0.5) / N * 2 - 1, r2 = dx * dx + dy * dy, q = (j * N + i) * 4, a = r2 >= 1 ? 0 : Math.exp(-3.2 * r2) * (1 - r2)
      img.data[q] = img.data[q + 1] = img.data[q + 2] = 255; img.data[q + 3] = a * 255 }
    x.putImageData(img, 0, 0); return new THREE.CanvasTexture(c) })()
  const layers = [[110, 0.07], [45, 0.16], [16, 0.32]].map(([n, size]) => {
    const pos = new Float32Array(n * 3), sp = new Float32Array(n)
    for (let i = 0; i < n; i++) { pos.set([(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3.6, (Math.random() - 0.5) * 2 + 0.6], i * 3); sp[i] = 0.08 + Math.random() * 0.2 }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: K.glow(), map: dot, size, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    const pts = new THREE.Points(geo, mat); g.add(pts); return { pos, sp, geo, mat, n }
  })
  K.frame.push((dt, t) => layers.forEach(({ pos, sp, geo, n }) => { for (let i = 0; i < n; i++) { pos[i * 3 + 1] += sp[i] * dt; pos[i * 3] += Math.sin(t * 0.7 + i) * 0.002; if (pos[i * 3 + 1] > 2) pos[i * 3 + 1] = -1.8 } geo.attributes.position.needsUpdate = true }))
  const halo = cssHalo(K, { size: 60, strength: 0.45 })
  const lvl = (k) => layers.forEach(({ mat }, i) => { mat.opacity = Math.min(1, k) * [1, 0.85, 0.6][i] })
  return { deck: (k) => lvl(k), light: (p, k, sz) => { lvl(Math.max(k, 0.5)); halo(p, k, sz) }, rays: none, shock: none, flash: none }
}
