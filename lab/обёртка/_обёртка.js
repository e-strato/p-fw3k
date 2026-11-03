// Лаба «Обёртка» (дирижёр 05.10): основа — «Паки» v3 «Срез и колода внутри» (матовый пак, один разрез, колода рубашкой внутри,
// веер, круг, карты сайта переворачиваются). Варианты отличаются только тем, как уходит обёртка — им отдаётся remove(ctx).
//   play({ name, note, remove }) — remove получает { K, g, cutter, A, B, deck, c } и возвращает промис «колода свободна».
// Шейдерные крючки (горение, смятие) вешаются на материалы пака заранее — шейдер собран до разреза, без подвисания.
import { start } from '../бустеры/_бустер.js'
import { THREE, RAR, makePack, Trail, Cutter } from '../паки/_пак.js'
export { THREE }
const W = 1.6, H = 2.45
const css = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim()

// ——— Крючок шейдера: горение от линии (uBurn — радиус выгорания, края светятся) и смятие (uCrush 0..1) ———
// Одна функция на все материалы (кэш программы по её тексту); униформы — свои у каждого материала в userData.U
function hook(sh) {
  Object.assign(sh.uniforms, this.userData.U)
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vLoc;\nuniform float uCrush; uniform vec3 uCtr;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      vLoc = transformed;
      // Смятие: сначала морщины, потом лист стягивается в комок — бугристый шар вокруг центра куска
      float cr = uCrush;
      float fold = sin(transformed.x * 17.0 + transformed.y * 5.0) * sin(transformed.y * 13.0 - transformed.x * 7.0);
      vec3 d = transformed - uCtr;
      vec3 dd = vec3(d.xy, d.z + fold * 0.6 * length(d.xy));
      vec3 nd = normalize(dd + vec3(0.0, 0.0, 0.001));
      vec3 ball = uCtr + nd * (0.3 + fold * 0.1 + sin(nd.x * 23.0 + nd.z * 9.0) * sin(nd.y * 19.0 - nd.z * 7.0) * 0.07);
      transformed += normal * fold * 0.02 * sin(cr * 3.1416);
      transformed = mix(transformed, ball, smoothstep(0.15, 1.0, cr));`)
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', `#include <common>
      varying vec3 vLoc; uniform float uBurn; uniform vec3 uP; uniform vec3 uN; uniform vec3 uGlow;
      float hsh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hsh(i), hsh(i + vec2(1, 0)), f.x), mix(hsh(i + vec2(0, 1)), hsh(i + vec2(1, 1)), f.x), f.y); }`)
    .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      float bd = abs(dot(vLoc.xy - uP.xy, uN.xy)) + (vn(vLoc.xy * 7.0) * 0.5 + vn(vLoc.xy * 19.0) * 0.25) * 0.45;
      if (bd < uBurn) discard;`)
    .replace('#include <dithering_fragment>', `#include <dithering_fragment>
      float edge = 1.0 - smoothstep(0.0, 0.09, bd - uBurn);
      if (uBurn > 0.0) gl_FragColor.rgb = mix(gl_FragColor.rgb, uGlow * 3.0, edge) + uGlow * edge * edge * 2.0;`)
}
const U = (K) => ({ uBurn: { value: -1 }, uP: { value: new THREE.Vector3() }, uN: { value: new THREE.Vector3(0, 1, 0) }, uGlow: { value: K.glow() }, uCrush: { value: 0 }, uCtr: { value: new THREE.Vector3() } })
const arm = (obj, u) => obj.traverse((m) => { if (m.isMesh) { m.material.userData.U = u; m.material.onBeforeCompile = hook; m.material.customProgramCacheKey = () => 'обёртка' } })
// Крючок после разреза: у копий куска свои униформы (Cutter клонирует материалы, а clone() крючок не переносит)
export const armPiece = (K, pc) => { const u = U(K); arm(pc.h, u); pc.U = u; return u }

export function play(V) {
  start({
    name: V.name, note: V.note, hint: 'Проведи через пак — разрежь',
    build(K) {
      const g = new THREE.Group(), P = makePack(K, { W, H, finish: 'matte', name: RAR[K.rar].ru, D: 0.15, ...(V.pack || {}) }); g.add(P.g)
      Cutter.prewarm(P.g); arm(P.g, U(K))
      // Колода внутри: три рубашки, край светится цветом редкости
      const col = '#' + K.glow().getHexString()
      // Рубашка: своя у варианта (V.back — рисует на холсте 340×468) или общая
      const backTex = V.back ? (() => { const c = document.createElement('canvas'); c.width = 340; c.height = 468; V.back(c.getContext('2d'), K); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })() : (() => { const c = document.createElement('canvas'); c.width = 340; c.height = 468; const x = c.getContext('2d')
        x.fillStyle = css('--c-ui-panel'); x.beginPath(); x.roundRect(0, 0, 340, 468, 22); x.fill()
        x.strokeStyle = col; x.lineWidth = 8; x.beginPath(); x.roundRect(6, 6, 328, 456, 18); x.stroke()
        for (let i = -468; i < 468; i += 16) { x.strokeStyle = 'rgba(255,255,255,.03)'; x.lineWidth = 6; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 468, 468); x.stroke() }
        x.fillStyle = css('--c-ui-item'); x.beginPath(); x.arc(170, 234, 70, 0, 6.28); x.fill(); x.fillStyle = css('--c-caption'); x.font = '800 70px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('F', 170, 238)
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })()
      const deck = new THREE.Group(); g.add(deck)
      const CH3 = 1.1 / (V.aspect || 340 / 468) // высота 3D-карты по пропорции карты сайта (Хайперглитч — 5:7)
      if (V.cards) V.cards(K) // свои карты сайта (Хайперглитч) — до того, как их найдёт swap
      const cards = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, CH3), new THREE.MeshBasicMaterial({ map: backTex, transparent: true, alphaTest: V.back ? 0.5 : 0, side: THREE.DoubleSide })); m.position.z = (i - 1) * 0.012; deck.add(m); return m })
      deck.position.y = -0.1
      const deckGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: K.glow(), map: K.softTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); deckGlow.scale.set(2.2, 2.6, 1); deckGlow.position.z = -0.2; deck.add(deckGlow)

      const trail = new Trail(K), cutter = new Cutter(g, P.g, W, H)
      // Свет: по умолчанию — общий движка (пятно, ореол, лучи, волна); лаба «Свечение» подставляет свой через V.glow
      const G = V.glow ? V.glow(K, { g, deck, cards, CH3 }) : {
        deck: (k) => { deckGlow.material.opacity = k }, light: (p, k, sz) => K.lightAt(p, k, sz), rays: (p, k) => K.rays(p, k),
        shock: (p, sz) => K.shock(p, sz), flash: (x) => K.flash(x),
      }
      let a = null, drawing = false, done = false
      const run = async (p1, p2) => {
        done = true; K.hint('')
        const [[A, B]] = cutter.cut(p1, p2)
        armPiece(K, A); armPiece(K, B)
        const c = g.localToWorld(A.mid.clone()).setZ(0.3)
        K.sparks(c, 0.5, 0.6)
        // Обёртка уходит по-своему; колода светится и ждёт
        K.tween(700, (k) => { G.deck(k * 0.8); G.light(c, k * 0.4, 1) })
        await V.remove({ K, g, cutter, A, B, deck, c, W, H, G })
        // Колода поднимается, веер, круг — как в «Паки» v3
        await K.tween(600, (k) => { deck.position.set(0, -0.1 + k * 0.55, k * 1.2) }, K.back)
        const dp = () => deck.getWorldPosition(new THREE.Vector3())
        G.flash(0.4); G.shock(dp(), 6); K.confetti(dp(), 0.9, 3)
        if (V.swap) return swap()
        await K.tween(700, (k) => cards.forEach((m, i) => { const s = i - 1; m.position.set(s * k * 1.15, -Math.abs(s) * k * 0.12, (i - 1) * 0.012 + k * 0.2); m.rotation.z = -s * k * 0.22 }), K.back)
        await K.tween(700, (k) => { deck.rotation.y = k * Math.PI * 2; G.light(dp(), 0.6 + k * 0.4, 1.2); G.rays(dp(), k * 0.5) }, (k) => k * k * (3 - 2 * k))
        K.reveal(44)
        await K.tween(260, (k) => cards.forEach((m) => { m.material.opacity = 1 - k }))
        deck.visible = false
        await K.tween(1500, (k) => { G.light(new THREE.Vector3(0, 0.45, 1.2), 1 - k * 0.7, 1.2); G.rays(new THREE.Vector3(0, 0.45, 1.2), 0.5 * (1 - k)) })
      }
      // swap: те же карты становятся настоящими. Веер раскладывает их ровно по местам карт сайта, круг — и по одной:
      // ребром → подмена на карту сайта, которая доворачивается лицом. Лучшая — последней.
      const html = [...K.host.querySelectorAll('.cs__card')]
      html.forEach((c) => c.classList.remove('is-in', 'is-flip')); K.host.classList.remove('is-done')
      const slot = (el) => {
        const r = el.getBoundingClientRect(), cv = K.renderer.domElement.getBoundingClientRect()
        const p = K.onPlane({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, 1.2)
        const px = (k) => { const a = p.clone().setY(p.y + CH3 * k / 2).project(K.camera), b = p.clone().setY(p.y - CH3 * k / 2).project(K.camera); return (a.y - b.y) / 2 * cv.height }
        // Масштаб — до перевода точки в координаты колоды (worldToLocal меняет сам вектор)
        const sc = el.offsetHeight / px(1)
        return { p: deck.worldToLocal(p), s: sc, rz: -THREE.MathUtils.degToRad((+el.style.getPropertyValue('--i') - 1) * 5) }
      }
      const swap = async () => {
        // Свет — позади карт, чтобы не засвечивал рубашки
        const dp = () => deck.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, -0.8))
        const T = html.map(slot), from = cards.map((m) => m.position.clone())
        await K.tween(750, (k) => cards.forEach((m, i) => { m.position.lerpVectors(from[i], T[i].p, k); m.scale.setScalar(1 + (T[i].s - 1) * k); m.rotation.z = T[i].rz * k }), K.back)
        await K.tween(700, (k) => { deck.rotation.y = k * Math.PI * 2; G.light(dp(), 0.5 + k * 0.3, 1); G.rays(dp(), k * 0.25) }, (k) => k * k * (3 - 2 * k))
        for (const [n, i] of [0, 2, 1].entries()) {
          const best = i === 1
          await K.tween(best ? 220 : 160, (k) => { cards[i].rotation.y = k * Math.PI / 2 }, (k) => k * k)
          cards[i].visible = false
          html[i].classList.add('is-in'); void html[i].offsetWidth; html[i].classList.add('is-flip')
          K.sparks(cards[i].getWorldPosition(new THREE.Vector3()), best ? 0.7 : 0.3, 0.4)
          if (n < 2) await K.wait(260)
        }
        G.deck(0)
        K.host.classList.add('is-done', 'is-open')
        await K.tween(1300, (k) => { G.light(dp(), 0.8 * (1 - k * 0.8), 1); G.rays(dp(), 0.25 * (1 - k)) })
      }
      return {
        g, open: async () => {},
        down(e) { if (done) return; drawing = true; trail.push(trail.local(e)); a = K.onPlane(e) },
        move(e) { if (drawing) trail.push(trail.local(e)) },
        up(e) {
          if (!drawing) return; drawing = false
          const b = K.onPlane(e)
          if (Cutter.crosses(P.g.worldToLocal(a.clone()), P.g.worldToLocal(b.clone()), W, H)) { K.open(); run(a, b) } else K.hint('Режь через весь пак — от края до края')
        },
        auto() {
          if (done) return
          const a0 = P.g.localToWorld(new THREE.Vector3(-W * 0.9, H * 0.16, 0)), b0 = P.g.localToWorld(new THREE.Vector3(W * 0.9, -H * 0.04, 0))
          K.tween(280, (k) => trail.push(trail.screen(a0.clone().lerp(b0, k))), (k) => k).then(() => { K.open(); run(a0, b0) })
        },
        tick(dt, t) { trail.draw(); if (!done) P.g.position.y = Math.sin(t * 1.5) * 0.05; cutter.update() },
      }
    },
  })
}
