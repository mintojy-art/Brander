import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import OrderModal from '../components/OrderModal'
import { useSEO } from '../hooks/useSEO'

// ─── Constants ────────────────────────────────────────────────────────────────
const PREVIEW_RES = 130

const BACKLIGHTS = {
  white:  { label: 'White',  hex: '#ffffff' },
  warm:   { label: 'Warm',   hex: '#ffd97d' },
  blue:   { label: 'Blue',   hex: '#a8d4ff' },
  purple: { label: 'Purple', hex: '#d4a8ff' },
  green:  { label: 'Green',  hex: '#a8ffc4' },
  red:    { label: 'Red',    hex: '#ffa8a8' },
}

const SHAPES = [
  { id: 'plane',    label: 'Plane' },
  { id: 'cylinder', label: 'Cylinder' },
  { id: 'arc',      label: 'Arc' },
  { id: 'sphere',   label: 'Sphere' },
]

const TABS = ['upload', 'edit', 'model', 'download']
const TAB_LABELS = { upload: '① Upload', edit: '② Edit', model: '③ Model', download: '④ Download' }

// ─── Image Processing ────────────────────────────────────────────────────────
function applyEdits(srcImg, { brightness, contrast, exposure, flipH, flipV, rotation }) {
  const iw = srcImg.naturalWidth || srcImg.width
  const ih = srcImg.naturalHeight || srcImg.height
  if (!iw || !ih) return null
  const swap = rotation === 90 || rotation === 270
  const cw = swap ? ih : iw
  const ch = swap ? iw : ih
  const c = document.createElement('canvas')
  c.width = cw; c.height = ch
  const ctx = c.getContext('2d')
  ctx.save()
  ctx.translate(cw / 2, ch / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  ctx.drawImage(srcImg, -iw / 2, -ih / 2)
  ctx.restore()
  if (brightness !== 0 || contrast !== 0 || exposure !== 0) {
    const id = ctx.getImageData(0, 0, cw, ch)
    const d = id.data
    const em = Math.pow(2, exposure)
    const cf = contrast !== 0 ? (259 * (contrast + 255)) / (255 * (259 - contrast)) : 1
    for (let i = 0; i < d.length; i += 4) {
      for (let k = 0; k < 3; k++) {
        let v = d[i + k] * em
        if (contrast !== 0) v = cf * (v - 128) + 128
        v += brightness
        d[i + k] = Math.max(0, Math.min(255, v | 0))
      }
    }
    ctx.putImageData(id, 0, 0)
  }
  return c
}

function canvasToHeightMap(canvas, tw, th, greyscale, invert) {
  if (!canvas || tw < 2 || th < 2) return new Float32Array(tw * th)
  const sc = document.createElement('canvas')
  sc.width = tw; sc.height = th
  const ctx = sc.getContext('2d')
  ctx.drawImage(canvas, 0, 0, tw, th)
  const { data } = ctx.getImageData(0, 0, tw, th)
  const map = new Float32Array(tw * th)
  for (let i = 0; i < tw * th; i++) {
    const j = i * 4, r = data[j], g = data[j+1], b = data[j+2]
    let v
    if (greyscale === 'average') v = (r + g + b) / (3 * 255)
    else if (greyscale === 'bw') v = (r + g + b) / 3 > 127 ? 1 : 0
    else v = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    map[i] = invert ? v : 1 - v
  }
  return map
}

// ─── STL Helpers ─────────────────────────────────────────────────────────────
function tri(a, b, c) {
  const ux = b[0]-a[0], uy = b[1]-a[1], uz = b[2]-a[2]
  const vx = c[0]-a[0], vy = c[1]-a[1], vz = c[2]-a[2]
  return { n: [uy*vz-uz*vy, uz*vx-ux*vz, ux*vy-uy*vx], v: [a, b, c] }
}

function writeFaces(F) {
  const buf = new ArrayBuffer(84 + F.length * 50)
  const dv = new DataView(buf)
  const hdr = 'Lithophane by ORIC 3D Print'
  for (let i = 0; i < 80; i++) dv.setUint8(i, i < hdr.length ? hdr.charCodeAt(i) : 0)
  dv.setUint32(80, F.length, true)
  let o = 84
  for (const { n, v } of F) {
    for (const p of [n, ...v]) { dv.setFloat32(o,p[0],true); dv.setFloat32(o+4,p[1],true); dv.setFloat32(o+8,p[2],true); o+=12 }
    dv.setUint16(o, 0, true); o += 2
  }
  return buf
}

function clampIdx(v, max) { return Math.max(0, Math.min(max, v)) }

// ─── STL: Plane ──────────────────────────────────────────────────────────────
// Image y=0 (top) → model y=physH (top), y=iH-1 → model y=0 (bottom)
function stlPlane(hm, iW, iH, { physW, physH, maxT, minT }) {
  if (iW < 2 || iH < 2) return new ArrayBuffer(84)
  const xs = physW / (iW-1), ys = physH / (iH-1)
  // Flip y so image top = model top
  const H = (x, y) => minT + hm[clampIdx(iH-1-y, iH-1)*iW + clampIdx(x, iW-1)] * (maxT-minT)
  const F = []
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    const [x0,x1,y0,y1] = [x*xs,(x+1)*xs,y*ys,(y+1)*ys]
    const [z00,z10,z01,z11] = [H(x,y),H(x+1,y),H(x,y+1),H(x+1,y+1)]
    // Front face (lithophane surface, facing +Z)
    F.push(tri([x0,y0,z00],[x1,y0,z10],[x0,y1,z01])); F.push(tri([x1,y0,z10],[x1,y1,z11],[x0,y1,z01]))
    // Back face (flat at z=0, facing -Z)
    F.push(tri([x0,y0,0],[x0,y1,0],[x1,y0,0]));       F.push(tri([x1,y0,0],[x0,y1,0],[x1,y1,0]))
  }
  const rX=(iW-1)*xs, bY=(iH-1)*ys
  // Left wall (x=0)
  for (let y = 0; y < iH-1; y++) {
    const [y0,y1]=[y*ys,(y+1)*ys]
    F.push(tri([0,y0,0],[0,y0,H(0,y)],[0,y1,0])); F.push(tri([0,y1,0],[0,y0,H(0,y)],[0,y1,H(0,y+1)]))
  }
  // Right wall (x=iW-1)
  for (let y = 0; y < iH-1; y++) {
    const [y0,y1]=[y*ys,(y+1)*ys]
    F.push(tri([rX,y0,H(iW-1,y)],[rX,y1,0],[rX,y0,0])); F.push(tri([rX,y0,H(iW-1,y)],[rX,y1,H(iW-1,y+1)],[rX,y1,0]))
  }
  // Bottom wall (y=0)
  for (let x = 0; x < iW-1; x++) {
    const [x0,x1]=[x*xs,(x+1)*xs]
    F.push(tri([x0,0,H(x,0)],[x1,0,0],[x0,0,0])); F.push(tri([x0,0,H(x,0)],[x1,0,H(x+1,0)],[x1,0,0]))
  }
  // Top wall (y=iH-1)
  for (let x = 0; x < iW-1; x++) {
    const [x0,x1]=[x*xs,(x+1)*xs]
    F.push(tri([x0,bY,0],[x0,bY,H(x,iH-1)],[x1,bY,0])); F.push(tri([x1,bY,0],[x0,bY,H(x,iH-1)],[x1,bY,H(x+1,iH-1)]))
  }
  return writeFaces(F)
}

// ─── STL: Cylinder ───────────────────────────────────────────────────────────
// Image y=0 (top) → z=cylH (top of cylinder). FIXED: was inverted before.
function stlCylinder(hm, iW, iH, { cylH, outerDiam, maxT, minT }) {
  if (iW < 2 || iH < 2) return new ArrayBuffer(84)
  const R = outerDiam / 2
  const F = []
  const pt = (x, y, outer) => {
    const θ = (x / (iW-1)) * 2 * Math.PI
    // Flip: y=0 → z=cylH (top), y=iH-1 → z=0 (bottom)
    const z = (1 - y / (iH-1)) * cylH
    const hv = hm[clampIdx(y, iH-1)*iW + clampIdx(x, iW-1)]
    const r = outer ? R : R - (minT + hv * (maxT-minT))
    return [r * Math.cos(θ), z, r * Math.sin(θ)]
  }
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    // Inner (lithophane) surface
    const [i00,i10,i01,i11] = [pt(x,y,false),pt(x+1,y,false),pt(x,y+1,false),pt(x+1,y+1,false)]
    F.push(tri(i00,i01,i10)); F.push(tri(i10,i01,i11))
    // Outer (smooth) surface
    const [o00,o10,o01,o11] = [pt(x,y,true),pt(x+1,y,true),pt(x,y+1,true),pt(x+1,y+1,true)]
    F.push(tri(o00,o10,o01)); F.push(tri(o10,o11,o01))
  }
  // Top cap (y=0)
  for (let x = 0; x < iW-1; x++) {
    F.push(tri(pt(x,0,false),pt(x,0,true),pt(x+1,0,false))); F.push(tri(pt(x+1,0,false),pt(x,0,true),pt(x+1,0,true)))
  }
  // Bottom cap (y=iH-1)
  for (let x = 0; x < iW-1; x++) {
    F.push(tri(pt(x,iH-1,true),pt(x,iH-1,false),pt(x+1,iH-1,false))); F.push(tri(pt(x+1,iH-1,false),pt(x+1,iH-1,true),pt(x,iH-1,true)))
  }
  return writeFaces(F)
}

// ─── STL: Arc ────────────────────────────────────────────────────────────────
// Image y=0 (top) → z=physH (top of arc). FIXED: was inverted before.
function stlArc(hm, iW, iH, { physW, physH, arcDeg, maxT, minT }) {
  if (iW < 2 || iH < 2) return new ArrayBuffer(84)
  const arcR = arcDeg * Math.PI / 180
  const R = physW / arcR
  const F = []
  const pt = (x, y, back) => {
    const θ = ((x / (iW-1)) - 0.5) * arcR
    // Flip: y=0 → z=physH (top), y=iH-1 → z=0 (bottom)
    const z = (1 - y / (iH-1)) * physH
    const hv = back ? 0 : minT + hm[clampIdx(y,iH-1)*iW + clampIdx(x,iW-1)] * (maxT-minT)
    const r = R + hv
    return [r * Math.sin(θ), z, R - r * Math.cos(θ)]
  }
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    const [f00,f10,f01,f11] = [pt(x,y,false),pt(x+1,y,false),pt(x,y+1,false),pt(x+1,y+1,false)]
    F.push(tri(f00,f10,f01)); F.push(tri(f10,f11,f01))
    const [b00,b10,b01,b11] = [pt(x,y,true),pt(x+1,y,true),pt(x,y+1,true),pt(x+1,y+1,true)]
    F.push(tri(b00,b01,b10)); F.push(tri(b10,b01,b11))
  }
  // Side edges
  for (let y = 0; y < iH-1; y++) {
    F.push(tri(pt(0,y,false),pt(0,y,true),pt(0,y+1,false)));             F.push(tri(pt(0,y+1,false),pt(0,y,true),pt(0,y+1,true)))
    F.push(tri(pt(iW-1,y,true),pt(iW-1,y,false),pt(iW-1,y+1,false)));   F.push(tri(pt(iW-1,y+1,false),pt(iW-1,y+1,true),pt(iW-1,y,true)))
  }
  // Top / bottom edges
  for (let x = 0; x < iW-1; x++) {
    F.push(tri(pt(x,0,true),pt(x,0,false),pt(x+1,0,false)));             F.push(tri(pt(x+1,0,false),pt(x+1,0,true),pt(x,0,true)))
    F.push(tri(pt(x,iH-1,false),pt(x,iH-1,true),pt(x+1,iH-1,false)));   F.push(tri(pt(x+1,iH-1,false),pt(x,iH-1,true),pt(x+1,iH-1,true)))
  }
  return writeFaces(F)
}

// ─── STL: Sphere ─────────────────────────────────────────────────────────────
// Image y=0 (top) → φ near north pole (top). Already correct.
function stlSphere(hm, iW, iH, { diameter, angH, angW, maxT, minT }) {
  if (iW < 2 || iH < 2) return new ArrayBuffer(84)
  const R = diameter / 2
  const φ0 = (Math.PI - angH*Math.PI/180) / 2
  const φ1 = Math.PI - φ0
  const θR = angW * Math.PI / 180
  const θ0 = -θR / 2
  const F = []
  const pt = (x, y, back) => {
    const θ = θ0 + (x / (iW-1)) * θR
    const φ = φ0 + (y / (iH-1)) * (φ1-φ0)
    const hv = back ? 0 : minT + hm[clampIdx(y,iH-1)*iW + clampIdx(x,iW-1)] * (maxT-minT)
    const r = R - hv
    return [r*Math.sin(φ)*Math.cos(θ), r*Math.cos(φ), r*Math.sin(φ)*Math.sin(θ)]
  }
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    const [f00,f10,f01,f11] = [pt(x,y,false),pt(x+1,y,false),pt(x,y+1,false),pt(x+1,y+1,false)]
    F.push(tri(f00,f01,f10)); F.push(tri(f10,f01,f11))
    const [b00,b10,b01,b11] = [pt(x,y,true),pt(x+1,y,true),pt(x,y+1,true),pt(x+1,y+1,true)]
    F.push(tri(b00,b10,b01)); F.push(tri(b10,b11,b01))
  }
  return writeFaces(F)
}

// ─── Trigger download safely (works in all browsers) ─────────────────────────
function triggerDownload(buf, filename) {
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/octet-stream' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 300)
}

async function shareSTLToWhatsApp(buf, filename) {
  const msg = 'Hi! I want to order a lithophane print from ORIC.'
  const stlFile = new File([buf], filename, { type: 'model/stl' })
  if (navigator.canShare?.({ files: [stlFile] })) {
    try {
      await navigator.share({ files: [stlFile], text: msg })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
    }
  }
  // Desktop fallback: download the file, then open WhatsApp with instructions
  triggerDownload(buf, filename)
  window.open(
    `https://wa.me/918310194953?text=${encodeURIComponent(msg + ' (STL file downloaded — please attach it to this chat)')}`,
    '_blank'
  )
}

// ─── Three.js Preview ────────────────────────────────────────────────────────
function LithophanePreview({ processedCanvas, shape, shapeParams, backlight, maxT, minT, greyscale, invert }) {
  const mountRef = useRef(null)
  const r3 = useRef({})
  const [hasModel, setHasModel] = useState(false)

  // Init renderer once
  useEffect(() => {
    const el = mountRef.current; if (!el) return
    const w = el.clientWidth || 500, h = el.clientHeight || 440
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 10000)
    camera.position.set(0, 0, 300)
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(1, 1, 2); scene.add(dl)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false; controls.enableDamping = true; controls.dampingFactor = 0.06
    r3.current = { renderer, scene, camera, controls, mesh: null }
    let id
    const loop = () => { id = requestAnimationFrame(loop); if (controls.enabled) controls.update(); renderer.render(scene, camera) }
    loop()
    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight
      if (!nw || !nh) return
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(id); window.removeEventListener('resize', onResize)
      controls.dispose(); renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // Rebuild mesh when any input changes
  useEffect(() => {
    const { scene, camera, controls } = r3.current
    if (!scene) return
    // Remove old mesh
    if (r3.current.mesh) {
      scene.remove(r3.current.mesh)
      r3.current.mesh.geometry.dispose()
      r3.current.mesh.material.dispose()
      r3.current.mesh = null
    }
    if (!processedCanvas) {
      scene.background = new THREE.Color(0x111111)
      return
    }
    const bl = BACKLIGHTS[backlight] || BACKLIGHTS.white
    scene.background = new THREE.Color(bl.hex).multiplyScalar(0.12)

    const aspect = processedCanvas.width / processedCanvas.height
    const pW = Math.min(PREVIEW_RES, processedCanvas.width)
    const pH = Math.max(2, Math.round(pW / aspect))
    if (pW < 2 || pH < 2) return

    const hm = canvasToHeightMap(processedCanvas, pW, pH, greyscale, invert)
    const blC = new THREE.Color(bl.hex)
    const pos = [], cols = [], idx = []
    let vi = 0

    const addV = (x, y, z, bright) => {
      pos.push(x, y, z)
      const b = Math.max(0.05, Math.min(1, bright))
      cols.push(blC.r * b, blC.g * b, blC.b * b)
      return vi++
    }
    const quad = (a, b, c, d, ccw = false) => {
      if (ccw) { idx.push(a, c, b, b, c, d) } else { idx.push(a, b, c, b, d, c) }
    }

    if (shape === 'plane') {
      const physW = shapeParams.physW || 100
      const physH = physW / aspect
      const xs = physW / (pW-1), ys = physH / (pH-1)
      for (let y = 0; y < pH; y++) for (let x = 0; x < pW; x++) {
        const hv = hm[y * pW + x]
        addV(x*xs - physW/2, -(y*ys - physH/2), minT + hv*(maxT-minT), 1 - hv)
      }
      for (let y = 0; y < pH-1; y++) for (let x = 0; x < pW-1; x++) {
        const i = y*pW+x; quad(i, i+1, i+pW, i+pW+1)
      }
    } else if (shape === 'cylinder') {
      const { cylH = 100, outerDiam = 80 } = shapeParams
      const R = outerDiam / 2
      for (let y = 0; y < pH; y++) for (let x = 0; x < pW; x++) {
        const θ = (x / (pW-1)) * 2 * Math.PI
        // Flip: y=0 (image top) → +Y (3D top)
        const yp = cylH/2 - (y / (pH-1)) * cylH
        const hv = hm[y * pW + x]
        const r = R - (minT + hv*(maxT-minT))
        addV(r * Math.cos(θ), yp, r * Math.sin(θ), 1 - hv)
      }
      for (let y = 0; y < pH-1; y++) for (let x = 0; x < pW-1; x++) {
        const i = y*pW+x; quad(i, i+1, i+pW, i+pW+1, true)
      }
    } else if (shape === 'arc') {
      const { physW: aW = 100, arcDeg = 60 } = shapeParams
      const aH = aW / aspect
      const arcR2 = arcDeg * Math.PI / 180
      const R2 = aW / arcR2
      for (let y = 0; y < pH; y++) for (let x = 0; x < pW; x++) {
        const θ = ((x / (pW-1)) - 0.5) * arcR2
        // Flip: y=0 (image top) → +Y (3D top)
        const yp = aH/2 - (y / (pH-1)) * aH
        const hv = hm[y * pW + x]
        const r = R2 + (minT + hv*(maxT-minT))
        addV(r * Math.sin(θ), yp, R2 - r * Math.cos(θ), 1 - hv)
      }
      for (let y = 0; y < pH-1; y++) for (let x = 0; x < pW-1; x++) {
        const i = y*pW+x; quad(i, i+1, i+pW, i+pW+1)
      }
    } else if (shape === 'sphere') {
      const { diameter = 100, angH: sAH = 120, angW: sAW = 240 } = shapeParams
      const R = diameter / 2
      const φ0 = (Math.PI - sAH*Math.PI/180) / 2
      const φ1 = Math.PI - φ0
      const θR2 = sAW * Math.PI / 180
      const θ02 = -θR2 / 2
      for (let y = 0; y < pH; y++) for (let x = 0; x < pW; x++) {
        const θ = θ02 + (x / (pW-1)) * θR2
        const φ = φ0 + (y / (pH-1)) * (φ1 - φ0)
        const hv = hm[y * pW + x]
        const r = R - (minT + hv*(maxT-minT))
        addV(r*Math.sin(φ)*Math.cos(θ), r*Math.cos(φ), r*Math.sin(φ)*Math.sin(θ), 1 - hv)
      }
      for (let y = 0; y < pH-1; y++) for (let x = 0; x < pW-1; x++) {
        const i = y*pW+x; quad(i, i+1, i+pW, i+pW+1, true)
      }
    }

    if (pos.length === 0) return

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()

    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh); r3.current.mesh = mesh; setHasModel(true)

    // Fit camera to object
    const box = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    const sz = box.getSize(new THREE.Vector3())
    const dist = Math.max(sz.x, sz.y, sz.z) * 2.0
    camera.position.copy(center).add(new THREE.Vector3(0, 0, dist))
    camera.lookAt(center)
    if (controls) { controls.target.copy(center); controls.update() }
  }, [processedCanvas, shape, shapeParams, backlight, maxT, minT, greyscale, invert])

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0f0f0f] cursor-grab active:cursor-grabbing select-none"
      onClick={() => { if (r3.current.controls) r3.current.controls.enabled = true }}
      onMouseLeave={() => { if (r3.current.controls) r3.current.controls.enabled = false }}
    >
      <div ref={mountRef} className="w-full h-full" />
      {!processedCanvas && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="text-5xl opacity-10">🪨</div>
          <p className="text-[#444] text-sm">Upload an image to preview</p>
        </div>
      )}
      {hasModel && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white/60 text-[10px] rounded-full pointer-events-none whitespace-nowrap">
          Click · Drag to rotate · Scroll to zoom
        </div>
      )}
    </div>
  )
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#555]">{label}</span>
        <span className="text-xs font-semibold text-[#1D1D1F] tabular-nums">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#1D1D1F] bg-[#D2D2D7]"
      />
    </div>
  )
}

function SectionHead({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868B] mb-3 mt-5 first:mt-0">{children}</p>
}

function Divider() { return <div className="border-t border-[#E8E8ED] my-4" /> }

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Lithophane() {
  useSEO({
    title: 'Lithophane Generator — Free 3D Lithophane Maker',
    description: 'Free online lithophane generator. Turn any photo into a 3D-printable STL lithophane. Plane, cylinder, arc and sphere shapes. Download instantly. Order prints from Bangalore.',
  })

  const [rawImg, setRawImg]           = useState(null)
  const [processedCanvas, setPCanvas] = useState(null)
  const [tab, setTab]                 = useState('upload')
  const [dragging, setDragging]       = useState(false)
  const [generating, setGenerating]   = useState(false)
  const [ordering, setOrdering]       = useState(false)
  const [orderModal, setOrderModal]   = useState({ open: false, filename: '', buf: null, stlFile: null, canShare: false, summary: [] })
  const [genError, setGenError]       = useState('')
  const fileRef                       = useRef(null)

  // Edit settings
  const [edit, setEdit] = useState({
    brightness: 0, contrast: 0, exposure: 0,
    flipH: false, flipV: false, rotation: 0,
    greyscale: 'luminance', invert: false,
  })
  const setE = (key, val) => setEdit(p => ({ ...p, [key]: val }))

  // Shape & params
  const [shape, setShape] = useState('plane')
  const [planeP, setPlaneP] = useState({ physW: 100, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })
  const [cylP,   setCylP]   = useState({ cylH: 100, outerDiam: 80, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })
  const [arcP,   setArcP]   = useState({ physW: 120, arcDeg: 60, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })
  const [sphP,   setSphP]   = useState({ diameter: 100, angH: 120, angW: 240, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })

  const setP = useCallback((key, val) => {
    const fn = p => {
      const next = { ...p, [key]: val }
      // Keep minT < maxT automatically
      if (key === 'minT' && val >= next.maxT) next.maxT = Math.min(5, val + 0.5)
      if (key === 'maxT' && val <= next.minT) next.minT = Math.max(0.3, val - 0.5)
      return next
    }
    if (shape === 'plane')    setPlaneP(fn)
    else if (shape === 'cylinder') setCylP(fn)
    else if (shape === 'arc') setArcP(fn)
    else setSphP(fn)
  }, [shape])

  const curP = shape === 'plane' ? planeP : shape === 'cylinder' ? cylP : shape === 'arc' ? arcP : sphP

  // Backlight
  const [backlight, setBacklight] = useState('white')

  // Memoised edit-tab thumbnail (avoid calling toDataURL on every render)
  const editThumbnail = useMemo(() => {
    if (!processedCanvas) return ''
    try { return processedCanvas.toDataURL('image/jpeg', 0.7) } catch { return '' }
  }, [processedCanvas])

  // Recompute processed canvas when raw image or edit settings change
  useEffect(() => {
    if (!rawImg) return
    const c = applyEdits(rawImg, edit)
    if (c) setPCanvas(c)
  }, [rawImg, edit])

  // Load image from file
  const loadFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setRawImg(img)
      setTab('edit')
      URL.revokeObjectURL(url)
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    loadFile(e.dataTransfer?.files[0])
  }, [loadFile])

  // Generate & download STL
  const downloadSTL = useCallback(async () => {
    if (!processedCanvas || generating) return
    setGenerating(true)
    setGenError('')
    // Yield to browser to show loading state before heavy computation
    await new Promise(r => setTimeout(r, 50))
    try {
      const aspect = processedCanvas.width / processedCanvas.height
      let buf, fname

      if (shape === 'plane') {
        const { physW, maxT, minT, mmPerPixel } = planeP
        const physH = physW / aspect
        const W = Math.max(2, Math.round(physW / mmPerPixel))
        const H = Math.max(2, Math.round(physH / mmPerPixel))
        const hm = canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert)
        buf = stlPlane(hm, W, H, { physW, physH, maxT, minT })
        fname = 'lithophane-plane.stl'
      } else if (shape === 'cylinder') {
        const { cylH, outerDiam, maxT, minT, mmPerPixel } = cylP
        const circ = Math.PI * outerDiam
        const W = Math.max(2, Math.round(circ / mmPerPixel))
        const H = Math.max(2, Math.round(cylH / mmPerPixel))
        const hm = canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert)
        buf = stlCylinder(hm, W, H, { cylH, outerDiam, maxT, minT })
        fname = 'lithophane-cylinder.stl'
      } else if (shape === 'arc') {
        const { physW, arcDeg, maxT, minT, mmPerPixel } = arcP
        const physH = physW / aspect
        const W = Math.max(2, Math.round(physW / mmPerPixel))
        const H = Math.max(2, Math.round(physH / mmPerPixel))
        const hm = canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert)
        buf = stlArc(hm, W, H, { physW, physH, arcDeg, maxT, minT })
        fname = 'lithophane-arc.stl'
      } else {
        const { diameter, angH, angW, maxT, minT, mmPerPixel } = sphP
        const W = Math.max(2, Math.round((angW/360) * Math.PI * diameter / mmPerPixel))
        const H = Math.max(2, Math.round((angH/180) * Math.PI * (diameter/2) / mmPerPixel))
        const hm = canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert)
        buf = stlSphere(hm, W, H, { diameter, angH, angW, maxT, minT })
        fname = 'lithophane-sphere.stl'
      }

      triggerDownload(buf, fname)
    } catch (err) {
      console.error('STL generation error:', err)
      setGenError('Generation failed. Try a lower resolution (Draft) and try again.')
    } finally {
      setGenerating(false)
    }
  }, [processedCanvas, generating, shape, planeP, cylP, arcP, sphP, edit])

  const orderPrint = useCallback(async () => {
    if (!processedCanvas || ordering) return
    setOrdering(true)
    setGenError('')
    await new Promise(r => setTimeout(r, 50))
    try {
      const aspect = processedCanvas.width / processedCanvas.height
      let buf, fname, summaryRows

      if (shape === 'plane') {
        const { physW, maxT, minT, mmPerPixel } = planeP
        const physH = physW / aspect
        const W = Math.max(2, Math.round(physW / mmPerPixel))
        const H = Math.max(2, Math.round(physH / mmPerPixel))
        buf = stlPlane(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { physW, physH, maxT, minT })
        fname = 'lithophane-plane.stl'
        summaryRows = [
          { label: 'Shape', value: 'Flat Plane' },
          { label: 'Size', value: `${physW} × ${Math.round(physH)}mm` },
          { label: 'Thickness', value: `${minT}–${maxT}mm` },
        ]
      } else if (shape === 'cylinder') {
        const { cylH, outerDiam, maxT, minT } = cylP
        const circ = Math.PI * cylP.outerDiam
        const W = Math.max(2, Math.round(circ / cylP.mmPerPixel))
        const H = Math.max(2, Math.round(cylH / cylP.mmPerPixel))
        buf = stlCylinder(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { cylH, outerDiam, maxT, minT })
        fname = 'lithophane-cylinder.stl'
        summaryRows = [
          { label: 'Shape', value: 'Cylinder' },
          { label: 'Diameter × Height', value: `⌀${outerDiam} × ${cylH}mm` },
          { label: 'Thickness', value: `${minT}–${maxT}mm` },
        ]
      } else if (shape === 'arc') {
        const { physW, arcDeg, maxT, minT } = arcP
        const physH = physW / aspect
        const W = Math.max(2, Math.round(physW / arcP.mmPerPixel))
        const H = Math.max(2, Math.round(physH / arcP.mmPerPixel))
        buf = stlArc(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { physW, physH, arcDeg, maxT, minT })
        fname = 'lithophane-arc.stl'
        summaryRows = [
          { label: 'Shape', value: 'Arc' },
          { label: 'Width × Arc', value: `${physW}mm · ${arcDeg}°` },
          { label: 'Thickness', value: `${minT}–${maxT}mm` },
        ]
      } else {
        const { diameter, angH, angW, maxT, minT } = sphP
        const W = Math.max(2, Math.round((angW/360) * Math.PI * diameter / sphP.mmPerPixel))
        const H = Math.max(2, Math.round((angH/180) * Math.PI * (diameter/2) / sphP.mmPerPixel))
        buf = stlSphere(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { diameter, angH, angW, maxT, minT })
        fname = 'lithophane-sphere.stl'
        summaryRows = [
          { label: 'Shape', value: 'Sphere' },
          { label: 'Diameter', value: `⌀${diameter}mm` },
          { label: 'Thickness', value: `${minT}–${maxT}mm` },
        ]
      }

      const stlFile = new File([buf], fname, { type: 'model/stl' })
      const canShare = !!(navigator.canShare?.({ files: [stlFile] }))

      // Desktop only: auto-download the file so it's ready to attach
      if (!canShare) triggerDownload(buf, fname)

      // Always show the modal on ALL devices so customers see the summary + steps
      setOrderModal({ open: true, filename: fname, buf, stlFile, canShare, summary: summaryRows })
    } catch (err) {
      console.error('Order STL error:', err)
      setGenError('Could not generate STL. Try Draft quality and try again.')
    } finally {
      setOrdering(false)
    }
  }, [processedCanvas, ordering, shape, planeP, cylP, arcP, sphP, edit])

  // ── Tab content ──────────────────────────────────────────────────────────────
  const renderTab = () => {
    // ── UPLOAD TAB ──
    if (tab === 'upload') return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer min-h-[180px] ${
            dragging ? 'border-[#1D1D1F] bg-[#F0F0F5]' : 'border-[#D2D2D7] hover:border-[#AEAEB2] hover:bg-[#F9F9FB]'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7] flex items-center justify-center text-2xl">🖼️</div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1D1D1F]">{dragging ? 'Drop to upload' : 'Drop your photo here'}</p>
            <p className="text-xs text-[#86868B] mt-1">or click to browse · JPG, PNG, WEBP</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { loadFile(e.target.files?.[0]); e.target.value = '' }} />
        </div>

        {rawImg && (
          <div className="flex items-center gap-3 p-3 bg-[#F0FFF4] border border-[#86EFAC] rounded-xl">
            <img src={rawImg.src} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" alt="loaded" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#166534]">✓ Image loaded</p>
              <p className="text-[10px] text-[#166534]/70 truncate">{rawImg.naturalWidth} × {rawImg.naturalHeight}px</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setTab('edit') }}
              className="ml-auto flex-shrink-0 text-xs font-bold text-[#166534] bg-white border border-[#86EFAC] px-3 py-1.5 rounded-lg hover:bg-[#F0FFF4] transition-colors">
              Edit →
            </button>
          </div>
        )}

        <div className="bg-[#F5F5F7] rounded-xl p-3">
          <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider mb-2">Best results with</p>
          <div className="grid grid-cols-3 gap-1.5">
            {['Portraits', 'Landscapes', 'Pets', 'Babies', 'Couples', 'Logos'].map(s => (
              <div key={s} className="p-2 bg-white rounded-lg text-[10px] text-center text-[#555] border border-[#E8E8ED]">{s}</div>
            ))}
          </div>
          <p className="text-[10px] text-[#86868B] mt-2 text-center">High contrast photos produce the best results</p>
        </div>
      </div>
    )

    // ── EDIT TAB ──
    if (tab === 'edit') return (
      <div className="space-y-4">
        {editThumbnail && (
          <div className="rounded-xl overflow-hidden bg-[#111] flex items-center justify-center" style={{ maxHeight: 180 }}>
            <img src={editThumbnail} className="max-w-full max-h-[180px] object-contain" alt="preview" />
          </div>
        )}

        <SectionHead>Tone Adjustments</SectionHead>
        <div className="space-y-3">
          <Slider label="Brightness" value={edit.brightness} min={-100} max={100} onChange={v => setE('brightness', v)} />
          <Slider label="Contrast"   value={edit.contrast}   min={-100} max={100} onChange={v => setE('contrast', v)} />
          <Slider label="Exposure"   value={edit.exposure}   min={-2}   max={2}   step={0.1} unit=" EV" onChange={v => setE('exposure', v)} />
        </div>

        <Divider />
        <SectionHead>Rotation</SectionHead>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 90, 180, 270].map(deg => (
            <button key={deg} onClick={() => setE('rotation', deg)}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${edit.rotation === deg ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
              {deg}°
            </button>
          ))}
        </div>

        <SectionHead>Flip</SectionHead>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setE('flipH', !edit.flipH)}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${edit.flipH ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
            ↔ Horizontal
          </button>
          <button onClick={() => setE('flipV', !edit.flipV)}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${edit.flipV ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
            ↕ Vertical
          </button>
        </div>

        <Divider />
        <SectionHead>Greyscale Conversion</SectionHead>
        <div className="space-y-1.5">
          {[
            { id: 'luminance', label: 'Luminance', desc: 'Perceptually weighted · best for photos' },
            { id: 'average',   label: 'Average',   desc: 'Equal RGB weighting · neutral' },
            { id: 'bw',        label: 'Black & White', desc: 'Binary tones · high contrast' },
          ].map(m => (
            <button key={m.id} onClick={() => setE('greyscale', m.id)}
              className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${edit.greyscale === m.id ? 'bg-[#1D1D1F]' : 'bg-[#F5F5F7] hover:bg-[#E8E8ED]'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${edit.greyscale === m.id ? 'border-white' : 'border-[#AEAEB2]'}`}>
                {edit.greyscale === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className={`text-xs font-semibold ${edit.greyscale === m.id ? 'text-white' : 'text-[#1D1D1F]'}`}>{m.label}</p>
                <p className={`text-[10px] ${edit.greyscale === m.id ? 'text-white/60' : 'text-[#86868B]'}`}>{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <Divider />
        <button onClick={() => setE('invert', !edit.invert)}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${edit.invert ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
          {edit.invert ? '✓ Inverted ON' : '⊘ Invert Image (Negative)'}
        </button>

        <button onClick={() => setEdit({ brightness: 0, contrast: 0, exposure: 0, flipH: false, flipV: false, rotation: 0, greyscale: 'luminance', invert: false })}
          className="w-full py-2 text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors">
          Reset all edits
        </button>
      </div>
    )

    // ── MODEL TAB ──
    if (tab === 'model') return (
      <div className="space-y-3">
        <SectionHead>Shape</SectionHead>
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map(s => (
            <button key={s.id} onClick={() => setShape(s.id)}
              className={`py-3 rounded-xl text-[11px] font-bold transition-colors ${shape === s.id ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <Divider />

        {shape === 'plane' && (
          <>
            <SectionHead>Dimensions</SectionHead>
            <div className="space-y-3">
              <Slider label="Width" value={planeP.physW} min={30} max={300} unit=" mm" onChange={v => setPlaneP(p => ({ ...p, physW: v }))} />
              <p className="text-[10px] text-[#86868B]">Height calculated automatically from image aspect ratio</p>
            </div>
          </>
        )}

        {shape === 'cylinder' && (
          <>
            <SectionHead>Dimensions</SectionHead>
            <div className="space-y-3">
              <Slider label="Height"         value={cylP.cylH}      min={30} max={300} unit=" mm" onChange={v => setCylP(p => ({ ...p, cylH: v }))} />
              <Slider label="Outer Diameter" value={cylP.outerDiam} min={20} max={200} unit=" mm" onChange={v => setCylP(p => ({ ...p, outerDiam: v }))} />
            </div>
          </>
        )}

        {shape === 'arc' && (
          <>
            <SectionHead>Dimensions</SectionHead>
            <div className="space-y-3">
              <Slider label="Width"     value={arcP.physW}  min={30} max={300} unit=" mm" onChange={v => setArcP(p => ({ ...p, physW: v }))} />
              <Slider label="Arc Angle" value={arcP.arcDeg} min={10} max={170} unit="°"  onChange={v => setArcP(p => ({ ...p, arcDeg: v }))} />
            </div>
          </>
        )}

        {shape === 'sphere' && (
          <>
            <SectionHead>Dimensions</SectionHead>
            <div className="space-y-3">
              <Slider label="Sphere Diameter"     value={sphP.diameter} min={30} max={250} unit=" mm" onChange={v => setSphP(p => ({ ...p, diameter: v }))} />
              <Slider label="Vertical Coverage"   value={sphP.angH}     min={30} max={180} unit="°"  onChange={v => setSphP(p => ({ ...p, angH: v }))} />
              <Slider label="Horizontal Coverage" value={sphP.angW}     min={30} max={360} unit="°"  onChange={v => setSphP(p => ({ ...p, angW: v }))} />
            </div>
          </>
        )}

        <Divider />
        <SectionHead>Thickness</SectionHead>
        <div className="space-y-3">
          <Slider label="Maximum Thickness" value={curP.maxT} min={1.5} max={5}   step={0.1} unit=" mm" onChange={v => setP('maxT', v)} />
          <Slider label="Minimum Thickness" value={curP.minT} min={0.3} max={2.5} step={0.1} unit=" mm" onChange={v => setP('minT', v)} />
        </div>
        {curP.minT >= curP.maxT && (
          <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Min thickness must be less than max — auto-adjusted.
          </p>
        )}
        <p className="text-[10px] text-[#86868B]">Recommended: max 3–4 mm · min 0.6–1 mm for FDM</p>

        <Divider />
        <SectionHead>Print Resolution</SectionHead>
        <div className="space-y-3">
          <Slider label="MM per Pixel" value={curP.mmPerPixel} min={0.1} max={0.5} step={0.05} unit=" mm/px" onChange={v => setP('mmPerPixel', v)} />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ l: 'Draft', v: 0.4 }, { l: 'Normal', v: 0.2 }, { l: 'Fine', v: 0.1 }].map(q => (
            <button key={q.l} onClick={() => setP('mmPerPixel', q.v)}
              className={`py-2 text-xs rounded-xl font-semibold transition-colors ${curP.mmPerPixel === q.v ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
              {q.l}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#86868B]">Fine = more detail, larger file · Draft = faster preview</p>
      </div>
    )

    // ── DOWNLOAD TAB ──
    if (tab === 'download') return (
      <div className="space-y-4">
        <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-2.5">
          <p className="text-xs font-bold text-[#1D1D1F] mb-3">Model Summary</p>
          {[
            ['Shape', SHAPES.find(s => s.id === shape)?.label],
            ['Greyscale', { luminance: 'Luminance', average: 'Average', bw: 'Black & White' }[edit.greyscale]],
            ['Inverted', edit.invert ? 'Yes' : 'No'],
            ['Max Thickness', `${curP.maxT} mm`],
            ['Min Thickness', `${curP.minT} mm`],
            ['Resolution', `${curP.mmPerPixel} mm/px`],
            ...(shape === 'plane' ? [['Width', `${planeP.physW} mm`]] : []),
            ...(shape === 'cylinder' ? [['Height', `${cylP.cylH} mm`], ['Outer Diameter', `${cylP.outerDiam} mm`]] : []),
            ...(shape === 'arc' ? [['Width', `${arcP.physW} mm`], ['Arc Angle', `${arcP.arcDeg}°`]] : []),
            ...(shape === 'sphere' ? [['Diameter', `${sphP.diameter} mm`], ['V Coverage', `${sphP.angH}°`], ['H Coverage', `${sphP.angW}°`]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-[#86868B]">{k}</span>
              <span className="font-semibold text-[#1D1D1F]">{v}</span>
            </div>
          ))}
        </div>

        {!processedCanvas && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center gap-2">
            <span>⚠</span> Upload an image first to generate your STL file.
          </div>
        )}

        {genError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {genError}
          </div>
        )}

        <button
          onClick={downloadSTL}
          disabled={!processedCanvas || generating}
          className={`w-full py-4 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
            generating
              ? 'bg-[#86868B] text-white cursor-wait'
              : !processedCanvas
              ? 'bg-[#D2D2D7] text-[#86868B] cursor-not-allowed'
              : 'bg-[#1D1D1F] text-white hover:bg-[#424245] active:scale-[0.98]'
          }`}
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Generating STL…
            </>
          ) : (
            <>⬇ Download STL File</>
          )}
        </button>

        <button
          onClick={orderPrint}
          disabled={!processedCanvas || ordering}
          className={`w-full py-3.5 border-2 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
            ordering ? 'border-[#86868B] text-[#86868B] cursor-wait'
            : !processedCanvas ? 'border-[#D2D2D7] text-[#86868B] cursor-not-allowed'
            : 'border-[#1D1D1F] text-[#1D1D1F] hover:bg-[#1D1D1F] hover:text-white'
          }`}
        >
          {ordering ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Preparing…</>
          ) : (
            <>Order Print via WhatsApp →</>
          )}
        </button>

        <div className="p-4 bg-[#F5F5F7] rounded-xl space-y-2">
          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">Slicer Tips</p>
          {[
            'Layer height: 0.1–0.15 mm',
            'Print vertically (flat side down on build plate)',
            'No supports needed',
            '100% infill for best tonal range',
            'Use translucent white or natural PLA',
            'Slow down to 30–40 mm/s for crisp detail',
          ].map(t => (
            <p key={t} className="text-[11px] text-[#424245] flex items-start gap-2">
              <span className="text-[#86868B] mt-px flex-shrink-0">·</span>{t}
            </p>
          ))}
        </div>
      </div>
    )
  }

  // ── Page layout ──────────────────────────────────────────────────────────────
  const lithoWaMsg = orderModal.summary.length > 0
    ? encodeURIComponent(
        `Hi! I want to order a lithophane print from ORIC.\n` +
        orderModal.summary.map(r => `${r.label}: ${r.value}`).join('\n') +
        `\n(STL file: ${orderModal.filename} — attached)`
      )
    : encodeURIComponent('Hi! I want to order a lithophane print from ORIC.')

  return (
    <>
    <OrderModal
      isOpen={orderModal.open}
      onClose={() => setOrderModal(p => ({ ...p, open: false }))}
      type="lithophane"
      filename={orderModal.filename}
      summary={orderModal.summary}
      whatsappMsg={lithoWaMsg}
      canShareFiles={orderModal.canShare}
      onWhatsApp={orderModal.stlFile ? async () => {
        if (orderModal.canShare) {
          try {
            await navigator.share({ files: [orderModal.stlFile], text: `Hi! I want to order a lithophane print from ORIC.\n${orderModal.summary.map(r => `${r.label}: ${r.value}`).join('\n')}` })
          } catch (e) {
            if (e.name !== 'AbortError') window.open(`https://wa.me/918310194953?text=${lithoWaMsg}`, '_blank')
          }
        } else {
          window.open(`https://wa.me/918310194953?text=${lithoWaMsg}`, '_blank')
        }
      } : null}
      onRedownload={orderModal.buf ? () => triggerDownload(orderModal.buf, orderModal.filename) : null}
    />
    <div className="pt-16 bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-[#1D1D1F] py-20 px-5 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#86868B] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            Free Tool · No Sign-up · Instant STL
          </motion.p>
          <motion.h1 className="text-5xl md:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            Lithophane<br /><span className="text-[#86868B]">Generator</span>
          </motion.h1>
          <motion.p className="text-[#86868B] text-base max-w-lg mx-auto mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
            Turn any photo into a 3D-printable lithophane. Plane, cylinder, arc, and sphere. Download STL instantly.
          </motion.p>
          <motion.a href="#generator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1D1D1F] text-sm font-bold rounded-full hover:bg-[#F5F5F7] transition-all"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
            Start Creating →
          </motion.a>
        </div>
      </section>

      {/* ── GENERATOR APP ── */}
      <section id="generator" className="py-10 bg-[#F5F5F7] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Tab bar */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-6 shadow-sm max-w-xl mx-auto">
            {TABS.map(t => {
              const locked = (t === 'edit' || t === 'model' || t === 'download') && !rawImg
              return (
                <button key={t}
                  onClick={() => !locked && setTab(t)}
                  disabled={locked}
                  className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                    tab === t ? 'bg-[#1D1D1F] text-white shadow' : locked ? 'text-[#C7C7CC] cursor-not-allowed' : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}>
                  {TAB_LABELS[t]}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Left: controls panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-5 max-h-[78vh] overflow-y-auto">
                {renderTab()}

                {/* Next step button (not on download tab) */}
                {tab !== 'download' && (
                  <div className="mt-5 pt-4 border-t border-[#E8E8ED]">
                    {tab === 'upload' && !rawImg && (
                      <p className="text-xs text-center text-[#86868B]">Upload a photo to continue</p>
                    )}
                    {(tab !== 'upload' || rawImg) && (
                      <button
                        onClick={() => {
                          const next = TABS[TABS.indexOf(tab) + 1]
                          if (next) setTab(next)
                        }}
                        disabled={tab === 'upload' && !rawImg}
                        className="w-full py-3 bg-[#1D1D1F] text-white text-sm font-bold rounded-2xl hover:bg-[#424245] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {tab === 'model' ? 'Proceed to Download →' : 'Next Step →'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: 3D preview */}
            <div className="lg:col-span-3 flex flex-col gap-3">

              {/* Backlight selector */}
              <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Backlight</span>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(BACKLIGHTS).map(([id, bl]) => (
                    <button key={id} onClick={() => setBacklight(id)} title={bl.label}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${backlight === id ? 'border-[#1D1D1F] scale-110 shadow-md' : 'border-transparent hover:border-[#D2D2D7]'}`}
                      style={{ background: bl.hex }}
                    />
                  ))}
                </div>
                <span className="ml-auto text-[10px] text-[#86868B]">{BACKLIGHTS[backlight]?.label}</span>
              </div>

              {/* 3D viewport */}
              <div className="bg-[#0f0f0f] rounded-2xl shadow-sm overflow-hidden" style={{ height: 500 }}>
                <LithophanePreview
                  processedCanvas={processedCanvas}
                  shape={shape}
                  shapeParams={curP}
                  backlight={backlight}
                  maxT={curP.maxT}
                  minT={curP.minT}
                  greyscale={edit.greyscale}
                  invert={edit.invert}
                />
              </div>

              {/* Quick action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadSTL}
                  disabled={!processedCanvas || generating}
                  className={`py-3.5 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    generating ? 'bg-[#86868B] text-white cursor-wait'
                    : !processedCanvas ? 'bg-[#D2D2D7] text-[#86868B] cursor-not-allowed'
                    : 'bg-[#1D1D1F] text-white hover:bg-[#424245] active:scale-[0.98]'
                  }`}
                >
                  {generating ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Generating…</>
                  ) : (
                    <>⬇ Download STL</>
                  )}
                </button>
                <button
                  onClick={orderPrint}
                  disabled={!processedCanvas || ordering}
                  className={`py-3.5 border-2 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    ordering ? 'border-[#86868B] text-[#86868B] cursor-wait'
                    : !processedCanvas ? 'border-[#D2D2D7] text-[#86868B] cursor-not-allowed'
                    : 'border-[#1D1D1F] text-[#1D1D1F] hover:bg-[#1D1D1F] hover:text-white'
                  }`}
                >
                  {ordering ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Preparing…</>
                  ) : <>Order Print →</>}
                </button>
              </div>

              {genError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{genError}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3">Inspiration</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F]">Gallery</h2>
            <p className="text-[#86868B] text-base mt-3 max-w-md mx-auto">Portraits, pets, landscapes — lithophanes come to life when backlit.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: 'Portrait',  bg: 'linear-gradient(135deg,#e0cba8,#c4a06a)', desc: 'Family & friends' },
              { title: 'Pet',       bg: 'linear-gradient(135deg,#b8d4e0,#7aa8c0)', desc: 'Cats, dogs, birds' },
              { title: 'Landscape', bg: 'linear-gradient(135deg,#c0dab0,#88b878)', desc: 'Mountains, sunsets' },
              { title: 'Baby',      bg: 'linear-gradient(135deg,#f0d0e0,#d8a0c0)', desc: 'Newborn memories' },
              { title: 'Logo',      bg: 'linear-gradient(135deg,#d0d0e8,#9090c0)', desc: 'Business branding' },
              { title: 'Wedding',   bg: 'linear-gradient(135deg,#f8e8c0,#e0c080)', desc: 'Special moments' },
            ].map((g, i) => (
              <motion.div key={g.title}
                className="rounded-2xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-end p-4 relative"
                style={{ background: g.bg }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.25) 3px,rgba(255,255,255,0.25) 4px)' }} />
                <div className="relative text-center">
                  <p className="text-sm font-bold text-white drop-shadow-sm">{g.title}</p>
                  <p className="text-[10px] text-white/70">{g.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3">Process</p>
          <h2 className="text-4xl font-bold text-[#1D1D1F] mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: '01', t: 'Upload Photo',   d: 'Drop any JPG, PNG, or WEBP — portraits, pets, landscapes.' },
              { n: '02', t: 'Edit & Adjust',  d: 'Tune brightness, contrast, rotation, and greyscale method.' },
              { n: '03', t: 'Configure Shape', d: 'Choose plane, cylinder, arc, or sphere with your dimensions.' },
              { n: '04', t: 'Download & Print', d: 'Get your STL instantly, or let ORIC print and ship it.' },
            ].map((s, i) => (
              <motion.div key={s.n} className="text-center"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-full bg-[#1D1D1F] text-white text-sm font-bold flex items-center justify-center mx-auto mb-4">{s.n}</div>
                <h3 className="text-sm font-bold text-[#1D1D1F] mb-2">{s.t}</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl font-bold text-[#1D1D1F] text-center mb-10">FAQ</h2>
          <div className="space-y-2">
            {[
              { q: 'What is a lithophane?', a: 'A lithophane is a 3D-printed tile where thin areas allow more light through (bright) and thick areas block light (dark), creating a photo-realistic image when backlit. They look plain in daylight and beautiful when held up to a window or placed over a light source.' },
              { q: 'What filament should I use?', a: 'Translucent white or natural PLA produces the best results. Avoid opaque or coloured filaments — they block the light needed to see the image. PETG also works well.' },
              { q: 'What slicer settings should I use?', a: 'Layer height 0.1–0.15 mm, 100% infill, no supports. Orient the lithophane vertically on the build plate (flat face down). Slow print speed to 30–40 mm/s for sharper detail.' },
              { q: 'Which shape should I choose?', a: 'Plane is the simplest and ideal for framed wall art. Cylinder wraps around a lamp or nightlight. Arc curves gently for display stands. Sphere creates a globe ornament for Christmas or Valentines gifts.' },
              { q: 'What resolution gives the best result?', a: '0.2 mm/px (Normal) is the sweet spot for most prints. Use 0.1 mm (Fine) for portrait close-ups where detail matters. Use 0.3–0.4 mm for large landscape pieces where fine detail matters less.' },
              { q: 'Can ORIC print it for me?', a: "Yes! Click 'Order Print via WhatsApp' and we'll quote, print, and ship anywhere in India. Send us the STL or just the photo — we handle everything." },
            ].map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-[#1D1D1F] text-center">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Don't have a 3D printer?</h2>
          <p className="text-[#86868B] text-base mb-8">Send us your photo — or the STL. We print, post-process, and ship anywhere in India.</p>
          <a href="https://wa.me/918310194953?text=Hi!%20I%20want%20to%20order%20a%20custom%20lithophane%20print"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1D1D1F] text-sm font-bold rounded-full hover:bg-[#F5F5F7] transition-all">
            Order via WhatsApp →
          </a>
        </div>
      </section>

    </div>
    </>
  )
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${open ? 'border-[#1D1D1F]' : 'border-[#D2D2D7]'}`}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F5F5F7] transition-colors"
        onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-semibold text-[#1D1D1F] pr-4">{q}</span>
        <span className={`text-[#86868B] text-xl leading-none transition-transform flex-shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#555] leading-relaxed border-t border-[#E8E8ED]">{a}</div>
      )}
    </div>
  )
}
