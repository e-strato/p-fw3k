// Лаба «Паки» (дирижёр 05.10): один предмет — фольгированный пак (из лабы «Бустеры» v1 и v5), доводим открытие до идеала.
// Сцена, свет, карты, редкость — движок лабы «Бустеры» (../бустеры/_бустер.js). Здесь — общее для паков:
//   makePack — пак с отделкой (фольга / хром / мат) и швами; Trail — светящийся след курсора; Cutter — разрез по линии
//   (половины — копии пака, обрезанные плоскостями, плоскость едет вместе с куском; можно резать много раз).
import { THREE, RAR, packFace, foil, crimpMat, pillow } from '../бустеры/_бустер.js'
export { THREE, RAR, packFace, foil, crimpMat, pillow }

// Пак: W×H, толщина подушки D, высота шва CH. finish: foil — мятая фольга, chrome — зеркало, matte — бархатный мат
// face — свой рисунок пака (лаба «Свечение» v6, под карту Хайперглитч): (rar, { back }) → текстура
export function makePack(K, { W = 1.6, H = 2.45, D = 0.13, CH = 0.1, flat = 0.92, finish = 'foil', irid, name, sub, face = null } = {}) {
  const g = new THREE.Group(), F = face || ((r, o) => packFace(r, { name, sub, ...o }))
  const front = foil(K.rar, F(K.rar, {}), { irid }), back = foil(K.rar, F(K.rar, { back: true }), { irid })
  for (const m of [front, back]) {
    if (finish === 'chrome') Object.assign(m, { metalness: 0.95, roughness: 0.12, bumpScale: 0.8, clearcoat: 1, clearcoatRoughness: 0.05 })
    if (finish === 'matte') Object.assign(m, { metalness: 0.15, roughness: 0.75, bumpScale: 1.2, clearcoat: 0, sheen: 1, sheenRoughness: 0.5, sheenColor: K.glow() })
  }
  g.add(new THREE.Mesh(pillow(W, H, D, { flat }), front))
  const b = new THREE.Mesh(pillow(W, H, D, { flat, back: true }), back); b.rotation.y = Math.PI; g.add(b)
  const cm = crimpMat(K.rar)
  ;[-1, 1].forEach((s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(W * 1.01, CH, 0.024), cm); m.position.y = s * (H / 2 - CH / 2); g.add(m) })
  return { g, front, back, W, H, D, CH }
}

// След курсора на 2D-холсте поверх сцены: точки живут life мс, два слоя — широкое свечение и белый сердечник
export class Trail {
  constructor(K, { life = 350, width = 14 } = {}) { this.cv = K.trail; this.cx = this.cv.getContext('2d'); this.pts = []; this.life = life; this.width = width; this.col = '#' + K.glow().getHexString(); this.cam = K.camera }
  local(e) { const r = this.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  screen(v) { const p = v.clone().project(this.cam), r = this.cv.getBoundingClientRect(); return { x: (p.x + 1) / 2 * r.width, y: (1 - p.y) / 2 * r.height } }
  push(p) { this.pts.push({ ...p, t: performance.now() }) }
  // Без shadowBlur (он дорогой на холсте во весь экран): свечение — три мазка разной ширины и прозрачности
  draw(now = performance.now()) {
    const { cx, cv, pts, life } = this
    if (!pts.length) { if (this.dirty) { cx.clearRect(0, 0, cv.width, cv.height); this.dirty = false } return }
    cx.clearRect(0, 0, cv.width, cv.height); this.dirty = true
    while (pts.length && now - pts[0].t > life) pts.shift()
    if (pts.length < 2) return
    cx.lineCap = cx.lineJoin = 'round'
    for (const [wd, al, c] of [[this.width * 2.2, 0.12, this.col], [this.width, 0.35, this.col], [this.width * 0.3, 1, '#fff']]) {
      cx.strokeStyle = c
      for (let i = 1; i < pts.length; i++) { const k = 1 - (now - pts[i].t) / life; cx.globalAlpha = al * k; cx.lineWidth = Math.max(0.5, wd * k); cx.beginPath(); cx.moveTo(pts[i - 1].x, pts[i - 1].y); cx.lineTo(pts[i].x, pts[i].y); cx.stroke() }
    }
    cx.globalAlpha = 1
  }
  clear() { this.pts.length = 0; this.cx.clearRect(0, 0, this.cv.width, this.cv.height) }
}

// Многоугольник куска в его локальных координатах (плоскость пака z = 0) — чтобы знать, задел ли разрез кусок
const clipPoly = (poly, n, c) => { // оставить часть, где n·p + c ≥ 0
  const out = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], da = n.x * a.x + n.y * a.y + c, db = n.x * b.x + n.y * b.y + c
    if (da >= 0) out.push(a)
    if ((da >= 0) !== (db >= 0)) { const k = da / (da - db); out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }) }
  }
  return out
}
const area = (p) => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a.x * b.y - b.x * a.y }, 0) / 2)

// Резак: держит куски пака. cut(p1, p2) в мировых координатах — каждый задетый кусок делится на два.
// Кусок: { h — группа (копия пака), planes: [{ lp — плоскость в координатах куска, wp — она же в мире }], poly, n — нормаль последнего разреза, s — сторона }
export class Cutter {
  constructor(parent, pack, W, H) {
    this.parent = parent; this.W = W; this.H = H
    const h = pack; this.pieces = [{ h, planes: [], poly: [{ x: -W / 2, y: -H / 2 }, { x: W / 2, y: -H / 2 }, { x: W / 2, y: H / 2 }, { x: -W / 2, y: H / 2 }] }]
  }
  // Вернёт новые пары кусков [[a, b], …] — по ним вариант анимирует разлёт
  cut(p1w, p2w) {
    const pairs = [], next = []
    for (const pc of this.pieces) {
      pc.h.updateWorldMatrix(true, false)
      const p1 = pc.h.worldToLocal(p1w.clone()), p2 = pc.h.worldToLocal(p2w.clone())
      const d = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y).normalize(), n = new THREE.Vector2(-d.y, d.x), c = -(n.x * p1.x + n.y * p1.y)
      const A = clipPoly(pc.poly, n, c), B = clipPoly(pc.poly, n.clone().negate(), -c)
      if (area(A) < 0.02 || area(B) < 0.02) { next.push(pc); continue }
      const mk = (s, poly) => {
        const h = pc.h.clone(true), planes = pc.planes.map((p) => ({ lp: p.lp.clone(), wp: new THREE.Plane() }))
        planes.push({ lp: new THREE.Plane(new THREE.Vector3(n.x * s, n.y * s, 0), c * s), wp: new THREE.Plane() })
        h.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.side = THREE.DoubleSide; m.material.clippingPlanes = planes.map((p) => p.wp) } })
        this.parent.add(h)
        return { h, planes, poly, n: new THREE.Vector3(n.x * s, n.y * s, 0), mid: new THREE.Vector3(-n.x * c, -n.y * c, 0), dir: new THREE.Vector3(d.x, d.y, 0) }
      }
      const a = mk(1, A), b = mk(-1, B)
      this.parent.remove(pc.h)
      next.push(a, b); pairs.push([a, b])
    }
    this.pieces = next
    this.update()
    return pairs
  }
  // Плоскости в мир — каждый кадр, после того как куски сдвинули
  update() { for (const pc of this.pieces) { pc.h.updateWorldMatrix(true, false); for (const p of pc.planes) p.wp.copy(p.lp).applyMatrix4(pc.h.matrixWorld) } }
  // Прогрев против подвисания в момент разреза: у материалов пака заранее одна плоскость отсечения, которая ничего не режет,
  // и двусторонность — тогда копии после первого разреза используют уже собранный шейдер
  static prewarm(pack) { pack.traverse((m) => { if (m.isMesh) { m.material.side = THREE.DoubleSide; m.material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, 1), 1e4)] } }) }
  // Линия проходит через весь пак (оба конца снаружи прямоугольника, линия близко к центру)
  static crosses(p1, p2, W, H) {
    const inside = (p) => Math.abs(p.x) < W / 2 && Math.abs(p.y) < H / 2
    if (inside(p1) || inside(p2) || p1.distanceTo(p2) < 1) return false
    const d = p2.clone().sub(p1), n = new THREE.Vector3(-d.y, d.x, 0).normalize()
    return Math.abs(n.dot(p1)) < Math.min(W, H) / 2 * 0.92
  }
}
