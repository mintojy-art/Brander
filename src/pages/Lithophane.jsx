import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const PREVIEW_RES = 140

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
const TAB_LABELS = { upload: '① Upload', edit: '② Edit Image', model: '③ Create Model', download: '④ Download' }

// ─── Image Processing ────────────────────────────────────────────────────────
function applyEdits(srcImg, { brightness, contrast, exposure, flipH, flipV, rotation }) {
  const iw = srcImg.naturalWidth || srcImg.width
  const ih = srcImg.naturalHeight || srcImg.height
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

// ─── STL: Plane ──────────────────────────────────────────────────────────────
function stlPlane(hm, iW, iH, { physW, physH, maxT, minT }) {
  const xs = physW/(iW-1), ys = physH/(iH-1)
  const H = (x,y) => minT + hm[Math.max(0,Math.min(iH-1,y))*iW + Math.max(0,Math.min(iW-1,x))] * (maxT-minT)
  const F = []
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    const [x0,x1,y0,y1] = [x*xs,(x+1)*xs,y*ys,(y+1)*ys]
    const [z00,z10,z01,z11] = [H(x,y),H(x+1,y),H(x,y+1),H(x+1,y+1)]
    F.push(tri([x0,y0,z00],[x1,y0,z10],[x0,y1,z01])); F.push(tri([x1,y0,z10],[x1,y1,z11],[x0,y1,z01]))
    F.push(tri([x0,y0,0],[x0,y1,0],[x1,y0,0]));       F.push(tri([x1,y0,0],[x0,y1,0],[x1,y1,0]))
  }
  const rX=(iW-1)*xs, bY=(iH-1)*ys
  for (let y = 0; y < iH-1; y++) {
    const [y0,y1]=[y*ys,(y+1)*ys]
    F.push(tri([0,y0,0],[0,y0,H(0,y)],[0,y1,0]));         F.push(tri([0,y1,0],[0,y0,H(0,y)],[0,y1,H(0,y+1)]))
    F.push(tri([rX,y0,H(iW-1,y)],[rX,y1,0],[rX,y0,0]));   F.push(tri([rX,y0,H(iW-1,y)],[rX,y1,H(iW-1,y+1)],[rX,y1,0]))
  }
  for (let x = 0; x < iW-1; x++) {
    const [x0,x1]=[x*xs,(x+1)*xs]
    F.push(tri([x0,0,H(x,0)],[x1,0,0],[x0,0,0]));         F.push(tri([x0,0,H(x,0)],[x1,0,H(x+1,0)],[x1,0,0]))
    F.push(tri([x0,bY,0],[x0,bY,H(x,iH-1)],[x1,bY,0]));   F.push(tri([x1,bY,0],[x0,bY,H(x,iH-1)],[x1,bY,H(x+1,iH-1)]))
  }
  return writeFaces(F)
}

// ─── STL: Cylinder ───────────────────────────────────────────────────────────
function stlCylinder(hm, iW, iH, { cylH, outerDiam, maxT, minT }) {
  const R = outerDiam / 2
  const F = []
  const pt = (x,y,outer) => {
    const θ=(x/(iW-1))*2*Math.PI, z=(y/(iH-1))*cylH
    const r = outer ? R : R-(minT+hm[Math.min(y,iH-1)*iW+Math.min(x,iW-1)]*(maxT-minT))
    return [r*Math.cos(θ), z, r*Math.sin(θ)]
  }
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    const [i00,i10,i01,i11]=[pt(x,y,false),pt(x+1,y,false),pt(x,y+1,false),pt(x+1,y+1,false)]
    F.push(tri(i00,i01,i10)); F.push(tri(i10,i01,i11))
    const [o00,o10,o01,o11]=[pt(x,y,true),pt(x+1,y,true),pt(x,y+1,true),pt(x+1,y+1,true)]
    F.push(tri(o00,o10,o01)); F.push(tri(o10,o11,o01))
  }
  for (let x = 0; x < iW-1; x++) {
    F.push(tri(pt(x,0,false),pt(x,0,true),pt(x+1,0,false)));         F.push(tri(pt(x+1,0,false),pt(x,0,true),pt(x+1,0,true)))
    F.push(tri(pt(x,iH-1,true),pt(x,iH-1,false),pt(x+1,iH-1,false))); F.push(tri(pt(x+1,iH-1,false),pt(x+1,iH-1,true),pt(x,iH-1,true)))
  }
  return writeFaces(F)
}

// ─── STL: Arc ────────────────────────────────────────────────────────────────
function stlArc(hm, iW, iH, { physW, physH, arcDeg, maxT, minT }) {
  const arcR = arcDeg*Math.PI/180, R = physW/arcR
  const F = []
  const pt = (x,y,back) => {
    const θ=((x/(iW-1))-0.5)*arcR, z=(y/(iH-1))*physH
    const hv = back ? 0 : minT+hm[Math.min(y,iH-1)*iW+Math.min(x,iW-1)]*(maxT-minT)
    const r = R+hv
    return [r*Math.sin(θ), z, R-r*Math.cos(θ)]
  }
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    const [f00,f10,f01,f11]=[pt(x,y,false),pt(x+1,y,false),pt(x,y+1,false),pt(x+1,y+1,false)]
    F.push(tri(f00,f10,f01)); F.push(tri(f10,f11,f01))
    const [b00,b10,b01,b11]=[pt(x,y,true),pt(x+1,y,true),pt(x,y+1,true),pt(x+1,y+1,true)]
    F.push(tri(b00,b01,b10)); F.push(tri(b10,b01,b11))
  }
  for (let y = 0; y < iH-1; y++) {
    F.push(tri(pt(0,y,false),pt(0,y,true),pt(0,y+1,false)));         F.push(tri(pt(0,y+1,false),pt(0,y,true),pt(0,y+1,true)))
    F.push(tri(pt(iW-1,y,true),pt(iW-1,y,false),pt(iW-1,y+1,false))); F.push(tri(pt(iW-1,y+1,false),pt(iW-1,y+1,true),pt(iW-1,y,true)))
  }
  for (let x = 0; x < iW-1; x++) {
    F.push(tri(pt(x,0,true),pt(x,0,false),pt(x+1,0,false)));         F.push(tri(pt(x+1,0,false),pt(x+1,0,true),pt(x,0,true)))
    F.push(tri(pt(x,iH-1,false),pt(x,iH-1,true),pt(x+1,iH-1,false))); F.push(tri(pt(x+1,iH-1,false),pt(x,iH-1,true),pt(x+1,iH-1,true)))
  }
  return writeFaces(F)
}

// ─── STL: Sphere ─────────────────────────────────────────────────────────────
function stlSphere(hm, iW, iH, { diameter, angH, angW, maxT, minT }) {
  const R=diameter/2
  const φ0=(Math.PI-angH*Math.PI/180)/2, φ1=Math.PI-φ0
  const θR=angW*Math.PI/180, θ0=-θR/2
  const F = []
  const pt = (x,y,back) => {
    const θ=θ0+(x/(iW-1))*θR, φ=φ0+(y/(iH-1))*(φ1-φ0)
    const hv = back ? 0 : minT+hm[Math.min(y,iH-1)*iW+Math.min(x,iW-1)]*(maxT-minT)
    const r=R-hv
    return [r*Math.sin(φ)*Math.cos(θ), r*Math.cos(φ), r*Math.sin(φ)*Math.sin(θ)]
  }
  for (let y = 0; y < iH-1; y++) for (let x = 0; x < iW-1; x++) {
    const [f00,f10,f01,f11]=[pt(x,y,false),pt(x+1,y,false),pt(x,y+1,false),pt(x+1,y+1,false)]
    F.push(tri(f00,f01,f10)); F.push(tri(f10,f01,f11))
    const [b00,b10,b01,b11]=[pt(x,y,true),pt(x+1,y,true),pt(x,y+1,true),pt(x+1,y+1,true)]
    F.push(tri(b00,b10,b01)); F.push(tri(b10,b11,b01))
  }
  return writeFaces(F)
}

// ─── Three.js Preview ────────────────────────────────────────────────────────
function LithophanePreview({ processedCanvas, shape, shapeParams, backlight, maxT, minT, greyscale, invert }) {
  const mountRef = useRef(null)
  const r3 = useRef({})
  const [hasModel, setHasModel] = useState(false)

  useEffect(() => {
    const el = mountRef.current; if (!el) return
    const w = el.clientWidth || 500, h = el.clientHeight || 420
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 5000)
    camera.position.set(0, 0, 300)
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(1,1,2); scene.add(dl)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false; controls.enableDamping = true; controls.dampingFactor = 0.06
    r3.current = { renderer, scene, camera, controls, mesh: null }
    let id
    const loop = () => { id = requestAnimationFrame(loop); if (controls.enabled) controls.update(); renderer.render(scene, camera) }
    loop()
    const onResize = () => {
      const nw=el.clientWidth, nh=el.clientHeight
      camera.aspect=nw/nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(id); window.removeEventListener('resize', onResize)
      controls.dispose(); renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const { scene, camera, controls } = r3.current
    if (!scene || !processedCanvas) return
    if (r3.current.mesh) { scene.remove(r3.current.mesh); r3.current.mesh.geometry.dispose(); r3.current.mesh.material.dispose() }
    const bl = BACKLIGHTS[backlight] || BACKLIGHTS.white
    scene.background = new THREE.Color(bl.hex).multiplyScalar(0.13)
    const aspect = processedCanvas.width / processedCanvas.height
    const pW = Math.min(PREVIEW_RES, processedCanvas.width)
    const pH = Math.max(2, Math.round(pW / aspect))
    const hm = canvasToHeightMap(processedCanvas, pW, pH, greyscale, invert)
    const blC = new THREE.Color(bl.hex)
    const pos = [], cols = [], idx = []
    let vi = 0
    const addV = (x,y,z,bright) => { pos.push(x,y,z); cols.push(blC.r*bright,blC.g*bright,blC.b*bright); return vi++ }
    const quad = (i00,i10,i01,i11,flip=false) => {
      if(flip) { idx.push(i00,i01,i10,i10,i01,i11) } else { idx.push(i00,i10,i01,i10,i11,i01) }
    }
    if (shape === 'plane') {
      const { physW=100 } = shapeParams, physH=physW/aspect
      const xs=physW/(pW-1), ys=physH/(pH-1)
      for (let y=0;y<pH;y++) for (let x=0;x<pW;x++) {
        const hv=hm[y*pW+x]; addV(x*xs-physW/2, -(y*ys-physH/2), minT+hv*(maxT-minT), Math.max(0.04,1-hv))
      }
      for (let y=0;y<pH-1;y++) for (let x=0;x<pW-1;x++) { const i=y*pW+x; quad(i,i+1,i+pW,i+pW+1) }
    } else if (shape === 'cylinder') {
      const { cylH=100, outerDiam=80 } = shapeParams, R=outerDiam/2
      for (let y=0;y<pH;y++) for (let x=0;x<pW;x++) {
        const θ=(x/(pW-1))*2*Math.PI, zp=(y/(pH-1))*cylH-cylH/2
        const hv=hm[y*pW+x], r=R-(minT+hv*(maxT-minT))
        addV(r*Math.cos(θ), zp, r*Math.sin(θ), Math.max(0.04,1-hv))
      }
      for (let y=0;y<pH-1;y++) for (let x=0;x<pW-1;x++) { const i=y*pW+x; quad(i,i+1,i+pW,i+pW+1,true) }
    } else if (shape === 'arc') {
      const { physW:aW=100, arcDeg=60 } = shapeParams, aH=aW/aspect
      const arcR2=arcDeg*Math.PI/180, R2=aW/arcR2
      for (let y=0;y<pH;y++) for (let x=0;x<pW;x++) {
        const θ=((x/(pW-1))-0.5)*arcR2, zp=(y/(pH-1))*aH-aH/2
        const hv=hm[y*pW+x], r=R2+(minT+hv*(maxT-minT))
        addV(r*Math.sin(θ), zp, R2-r*Math.cos(θ), Math.max(0.04,1-hv))
      }
      for (let y=0;y<pH-1;y++) for (let x=0;x<pW-1;x++) { const i=y*pW+x; quad(i,i+1,i+pW,i+pW+1) }
    } else if (shape === 'sphere') {
      const { diameter=100, angH:sAH=120, angW:sAW=240 } = shapeParams, R=diameter/2
      const φ0=(Math.PI-sAH*Math.PI/180)/2, φ1=Math.PI-φ0, θR2=sAW*Math.PI/180, θ02=-θR2/2
      for (let y=0;y<pH;y++) for (let x=0;x<pW;x++) {
        const θ=θ02+(x/(pW-1))*θR2, φ=φ0+(y/(pH-1))*(φ1-φ0)
        const hv=hm[y*pW+x], r=R-(minT+hv*(maxT-minT))
        addV(r*Math.sin(φ)*Math.cos(θ), r*Math.cos(φ), r*Math.sin(φ)*Math.sin(θ), Math.max(0.04,1-hv))
      }
      for (let y=0;y<pH-1;y++) for (let x=0;x<pW-1;x++) { const i=y*pW+x; quad(i,i+1,i+pW,i+pW+1,true) }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
    geo.setIndex(idx); geo.computeVertexNormals()
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh); r3.current.mesh = mesh; setHasModel(true)
    const box = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    const sz = box.getSize(new THREE.Vector3())
    const dist = Math.max(sz.x, sz.y, sz.z) * 1.9
    camera.position.copy(center).add(new THREE.Vector3(0, 0, dist))
    camera.lookAt(center); controls.target.copy(center); controls.update()
  }, [processedCanvas, shape, shapeParams, backlight, maxT, minT, greyscale, invert])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#111]"
      onClick={() => { if(r3.current.controls) r3.current.controls.enabled = true }}
      onMouseLeave={() => { if(r3.current.controls) r3.current.controls.enabled = false }}
    >
      <div ref={mountRef} className="w-full h-full" />
      {!processedCanvas && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="text-6xl opacity-10">🪨</div>
          <p className="text-[#555] text-sm">Upload an image to preview</p>
        </div>
      )}
      {hasModel && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white/70 text-[10px] rounded-full backdrop-blur-sm pointer-events-none whitespace-nowrap">
          Click · Drag to rotate · Scroll to zoom
        </div>
      )}
    </div>
  )
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step=1, unit='', onChange }) {
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
  return <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-3 mt-5 first:mt-0">{children}</p>
}

function Divider() { return <div className="border-t border-[#E8E8ED] my-4" /> }

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Lithophane() {
  const [rawImg, setRawImg]         = useState(null)
  const [processedCanvas, setPCanvas] = useState(null)
  const [tab, setTab]               = useState('upload')
  const [dragging, setDragging]     = useState(false)
  const fileRef                     = useRef(null)

  // Edit settings
  const [edit, setEdit] = useState({
    brightness: 0, contrast: 0, exposure: 0,
    flipH: false, flipV: false, rotation: 0,
    greyscale: 'luminance', invert: false,
  })
  const setE = (key, val) => setEdit(p => ({ ...p, [key]: val }))

  // Shape
  const [shape, setShape] = useState('plane')
  const [planeP, setPlaneP] = useState({ physW: 100, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })
  const [cylP,   setCylP]   = useState({ cylH: 100, outerDiam: 80, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })
  const [arcP,   setArcP]   = useState({ physW: 120, arcDeg: 60, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })
  const [sphP,   setSphP]   = useState({ diameter: 100, angH: 120, angW: 240, maxT: 3.5, minT: 0.8, mmPerPixel: 0.2 })
  const setP = useCallback((key, val) => {
    const fn = p => ({ ...p, [key]: val })
    if (shape==='plane') setPlaneP(fn)
    else if (shape==='cylinder') setCylP(fn)
    else if (shape==='arc') setArcP(fn)
    else setSphP(fn)
  }, [shape])
  const curP = shape==='plane' ? planeP : shape==='cylinder' ? cylP : shape==='arc' ? arcP : sphP

  // Backlight
  const [backlight, setBacklight] = useState('white')

  // Recompute processed canvas
  useEffect(() => {
    if (!rawImg) return
    setPCanvas(applyEdits(rawImg, edit))
  }, [rawImg, edit])

  // Load image
  const loadFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { setRawImg(img); setTab('edit') }
    img.src = url
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    loadFile(e.dataTransfer?.files[0])
  }, [loadFile])

  // Download STL
  const downloadSTL = useCallback(() => {
    if (!processedCanvas) return
    const aspect = processedCanvas.width / processedCanvas.height
    let buf, fname
    if (shape === 'plane') {
      const { physW, maxT, minT, mmPerPixel } = planeP
      const physH = physW / aspect
      const W = Math.max(2, Math.round(physW/mmPerPixel)), H = Math.max(2, Math.round(physH/mmPerPixel))
      buf = stlPlane(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { physW, physH, maxT, minT })
      fname = 'lithophane-plane.stl'
    } else if (shape === 'cylinder') {
      const { cylH, outerDiam, maxT, minT, mmPerPixel } = cylP
      const W = Math.max(2, Math.round(Math.PI*outerDiam/mmPerPixel)), H = Math.max(2, Math.round(cylH/mmPerPixel))
      buf = stlCylinder(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { cylH, outerDiam, maxT, minT })
      fname = 'lithophane-cylinder.stl'
    } else if (shape === 'arc') {
      const { physW, arcDeg, maxT, minT, mmPerPixel } = arcP
      const physH = physW / aspect
      const W = Math.max(2, Math.round(physW/mmPerPixel)), H = Math.max(2, Math.round(physH/mmPerPixel))
      buf = stlArc(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { physW, physH, arcDeg, maxT, minT })
      fname = 'lithophane-arc.stl'
    } else {
      const { diameter, angH, angW, maxT, minT, mmPerPixel } = sphP
      const W = Math.max(2, Math.round((angW/360)*Math.PI*diameter/mmPerPixel))
      const H = Math.max(2, Math.round((angH/180)*Math.PI*(diameter/2)/mmPerPixel))
      buf = stlSphere(canvasToHeightMap(processedCanvas, W, H, edit.greyscale, edit.invert), W, H, { diameter, angH, angW, maxT, minT })
      fname = 'lithophane-sphere.stl'
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/octet-stream' }))
    a.download = fname; a.click()
  }, [processedCanvas, shape, planeP, cylP, arcP, sphP, edit])

  // ── Render tab content ──
  const renderTab = () => {
    if (tab === 'upload') return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${dragging ? 'border-[#1D1D1F] bg-[#F5F5F7]' : 'border-[#D2D2D7] hover:border-[#AEAEB2] hover:bg-[#F9F9FB]'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-2xl">🖼️</div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1D1D1F]">Drop your photo here</p>
            <p className="text-xs text-[#86868B] mt-1">or click to browse · JPG, PNG, WEBP</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => loadFile(e.target.files?.[0])} />
        </div>
        {rawImg && (
          <div className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-xl">
            <img src={rawImg.src} className="w-12 h-12 object-cover rounded-lg" alt="loaded" />
            <div>
              <p className="text-xs font-medium text-[#1D1D1F]">Image loaded</p>
              <p className="text-[10px] text-[#86868B]">{rawImg.naturalWidth} × {rawImg.naturalHeight}px</p>
            </div>
            <button onClick={() => setTab('edit')} className="ml-auto text-xs font-semibold text-[#1D1D1F] underline">Edit →</button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 text-center">
          {['Portrait', 'Landscape', 'Pet Photo', 'Baby', 'Couple', 'Logo'].map(s => (
            <div key={s} className="p-2 bg-[#F5F5F7] rounded-lg text-[10px] text-[#86868B]">{s}</div>
          ))}
        </div>
        <p className="text-[10px] text-[#86868B] text-center">High contrast images produce the best lithophanes</p>
      </div>
    )

    if (tab === 'edit') return (
      <div className="space-y-4">
        {processedCanvas && (
          <div className="rounded-xl overflow-hidden bg-[#111] aspect-video flex items-center justify-center">
            <img src={processedCanvas.toDataURL()} className="max-w-full max-h-full object-contain" alt="preview" />
          </div>
        )}

        <SectionHead>Tone</SectionHead>
        <div className="space-y-3">
          <Slider label="Brightness" value={edit.brightness} min={-100} max={100} onChange={v => setE('brightness', v)} />
          <Slider label="Contrast"   value={edit.contrast}   min={-100} max={100} onChange={v => setE('contrast', v)} />
          <Slider label="Exposure"   value={edit.exposure}   min={-2}   max={2}   step={0.1} unit=" EV" onChange={v => setE('exposure', v)} />
        </div>

        <Divider />
        <SectionHead>Transform</SectionHead>
        <div className="grid grid-cols-2 gap-2">
          {[0,90,180,270].map(deg => (
            <button key={deg} onClick={() => setE('rotation', deg)}
              className={`py-2 rounded-xl text-xs font-medium transition-colors ${edit.rotation===deg ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
              {deg}°
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setE('flipH', !edit.flipH)}
            className={`py-2 rounded-xl text-xs font-medium transition-colors ${edit.flipH ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
            ↔ Flip Horizontal
          </button>
          <button onClick={() => setE('flipV', !edit.flipV)}
            className={`py-2 rounded-xl text-xs font-medium transition-colors ${edit.flipV ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
            ↕ Flip Vertical
          </button>
        </div>

        <Divider />
        <SectionHead>Greyscale Method</SectionHead>
        <div className="space-y-1.5">
          {[
            { id:'luminance', label:'Luminance', desc:'Best for photos — weighted RGB' },
            { id:'average',   label:'Average',   desc:'Equal RGB weighting' },
            { id:'bw',        label:'Black & White', desc:'High contrast, binary tones' },
          ].map(m => (
            <button key={m.id} onClick={() => setE('greyscale', m.id)}
              className={`w-full text-left p-3 rounded-xl transition-colors flex items-start gap-3 ${edit.greyscale===m.id ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] hover:bg-[#E8E8ED]'}`}>
              <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 flex-shrink-0 ${edit.greyscale===m.id ? 'border-white bg-white' : 'border-[#86868B]'}`} />
              <div>
                <p className={`text-xs font-medium ${edit.greyscale===m.id ? 'text-white' : 'text-[#1D1D1F]'}`}>{m.label}</p>
                <p className={`text-[10px] ${edit.greyscale===m.id ? 'text-white/60' : 'text-[#86868B]'}`}>{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <Divider />
        <button onClick={() => setE('invert', !edit.invert)}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${edit.invert ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
          {edit.invert ? '✓ Negative / Inverted ON' : 'Negative / Invert Image'}
        </button>

        <button onClick={() => setEdit({ brightness:0,contrast:0,exposure:0,flipH:false,flipV:false,rotation:0,greyscale:'luminance',invert:false })}
          className="w-full py-2 text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors">
          Reset all edits
        </button>
      </div>
    )

    if (tab === 'model') return (
      <div className="space-y-3">
        <SectionHead>Shape</SectionHead>
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map(s => (
            <button key={s.id} onClick={() => setShape(s.id)}
              className={`py-2.5 rounded-xl text-[11px] font-semibold transition-colors ${shape===s.id ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <Divider />

        {shape === 'plane' && <>
          <SectionHead>Dimensions</SectionHead>
          <div className="space-y-3">
            <Slider label="Width" value={planeP.physW} min={30} max={300} unit=" mm" onChange={v => setPlaneP(p=>({...p,physW:v}))} />
          </div>
        </>}

        {shape === 'cylinder' && <>
          <SectionHead>Dimensions</SectionHead>
          <div className="space-y-3">
            <Slider label="Height"       value={cylP.cylH}      min={30} max={250} unit=" mm" onChange={v=>setCylP(p=>({...p,cylH:v}))} />
            <Slider label="Outer Diameter" value={cylP.outerDiam} min={20} max={200} unit=" mm" onChange={v=>setCylP(p=>({...p,outerDiam:v}))} />
          </div>
        </>}

        {shape === 'arc' && <>
          <SectionHead>Dimensions</SectionHead>
          <div className="space-y-3">
            <Slider label="Width"      value={arcP.physW}  min={30} max={300} unit=" mm" onChange={v=>setArcP(p=>({...p,physW:v}))} />
            <Slider label="Arc Angle"  value={arcP.arcDeg} min={10} max={170} unit="°"  onChange={v=>setArcP(p=>({...p,arcDeg:v}))} />
          </div>
        </>}

        {shape === 'sphere' && <>
          <SectionHead>Dimensions</SectionHead>
          <div className="space-y-3">
            <Slider label="Sphere Diameter"    value={sphP.diameter} min={30} max={250} unit=" mm" onChange={v=>setSphP(p=>({...p,diameter:v}))} />
            <Slider label="Vertical Coverage"  value={sphP.angH}     min={30} max={180} unit="°"  onChange={v=>setSphP(p=>({...p,angH:v}))} />
            <Slider label="Horizontal Coverage" value={sphP.angW}    min={30} max={360} unit="°"  onChange={v=>setSphP(p=>({...p,angW:v}))} />
          </div>
        </>}

        <Divider />
        <SectionHead>Thickness</SectionHead>
        <div className="space-y-3">
          <Slider label="Maximum Thickness" value={curP.maxT} min={1.5} max={5} step={0.1} unit=" mm" onChange={v=>setP('maxT',v)} />
          <Slider label="Minimum Thickness" value={curP.minT} min={0.3} max={2} step={0.1} unit=" mm" onChange={v=>setP('minT',v)} />
        </div>
        <p className="text-[10px] text-[#86868B]">Recommended: max 3–4mm, min 0.6–1mm for FDM printing</p>

        <Divider />
        <SectionHead>Resolution</SectionHead>
        <div className="space-y-3">
          <Slider label="MM per Pixel" value={curP.mmPerPixel} min={0.1} max={0.5} step={0.05} unit=" mm/px" onChange={v=>setP('mmPerPixel',v)} />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[{l:'Draft',v:0.4},{l:'Normal',v:0.2},{l:'Fine',v:0.1}].map(q=>(
            <button key={q.l} onClick={()=>setP('mmPerPixel',q.v)}
              className={`py-1.5 text-[11px] rounded-lg font-medium transition-colors ${curP.mmPerPixel===q.v ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'}`}>
              {q.l}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#86868B]">Fine = larger file, higher detail · Draft = faster print preview</p>
      </div>
    )

    if (tab === 'download') return (
      <div className="space-y-4">
        <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-2">
          <p className="text-xs font-semibold text-[#1D1D1F] mb-3">Model Summary</p>
          {[
            ['Shape', SHAPES.find(s=>s.id===shape)?.label],
            ['Greyscale', edit.greyscale.charAt(0).toUpperCase()+edit.greyscale.slice(1)],
            ['Max Thickness', `${curP.maxT} mm`],
            ['Min Thickness', `${curP.minT} mm`],
            ['Resolution', `${curP.mmPerPixel} mm/px`],
            ...(shape==='plane' ? [['Width', `${planeP.physW} mm`]] : []),
            ...(shape==='cylinder' ? [['Height', `${cylP.cylH} mm`],['Diameter', `${cylP.outerDiam} mm`]] : []),
            ...(shape==='arc' ? [['Width', `${arcP.physW} mm`],['Arc', `${arcP.arcDeg}°`]] : []),
            ...(shape==='sphere' ? [['Diameter', `${sphP.diameter} mm`]] : []),
          ].map(([k,v])=>(
            <div key={k} className="flex justify-between text-xs">
              <span className="text-[#86868B]">{k}</span>
              <span className="font-medium text-[#1D1D1F]">{v}</span>
            </div>
          ))}
        </div>

        {!processedCanvas && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            Upload an image first to generate your STL
          </div>
        )}

        <button onClick={downloadSTL} disabled={!processedCanvas}
          className="w-full py-4 bg-[#1D1D1F] text-white text-sm font-semibold rounded-2xl hover:bg-[#424245] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span>⬇</span> Download STL File
        </button>

        <a href="https://wa.me/918310194953?text=Hi!%20I%20want%20to%20order%20a%20lithophane%20print"
          target="_blank" rel="noopener noreferrer"
          className="w-full py-3.5 border-2 border-[#1D1D1F] text-[#1D1D1F] text-sm font-semibold rounded-2xl hover:bg-[#1D1D1F] hover:text-white transition-all flex items-center justify-center gap-2">
          Order Print via WhatsApp →
        </a>

        <div className="p-4 bg-[#F5F5F7] rounded-xl space-y-2">
          <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">Slicer Tips</p>
          {['Layer height: 0.1–0.15mm','Print vertically (flat side down)','No supports needed','100% infill','Translucent white or natural PLA'].map(t=>(
            <p key={t} className="text-[11px] text-[#424245] flex items-start gap-2"><span className="text-[#86868B]">·</span>{t}</p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-[#1D1D1F] py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#86868B] mb-4"
            initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}}>
            Free Online Tool · No Sign-up
          </motion.p>
          <motion.h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1}}>
            Lithophane<br /><span className="text-[#86868B]">Generator</span>
          </motion.h1>
          <motion.p className="text-[#86868B] text-base max-w-lg mx-auto mb-8"
            initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.7,delay:0.2}}>
            Turn any photo into a 3D-printable lithophane. Plane, cylinder, arc, and sphere shapes. Download STL instantly.
          </motion.p>
          <motion.a href="#generator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-[#F5F5F7] transition-all"
            initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6,delay:0.3}}>
            Start Creating →
          </motion.a>
        </div>
      </section>

      {/* ── GENERATOR APP ── */}
      <section id="generator" className="py-12 bg-[#F5F5F7] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Tab bar */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-6 shadow-sm max-w-2xl mx-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => { if(t==='edit'&&!rawImg) return; setTab(t) }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab===t ? 'bg-[#1D1D1F] text-white shadow' : 'text-[#86868B] hover:text-[#1D1D1F]'} ${t==='edit'&&!rawImg ? 'opacity-30 cursor-not-allowed' : ''}`}>
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left: controls */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-5 max-h-[75vh] overflow-y-auto">
                {renderTab()}
                {tab !== 'download' && processedCanvas && (
                  <button onClick={() => setTab(TABS[TABS.indexOf(tab)+1])}
                    className="w-full mt-5 py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-2xl hover:bg-[#424245] transition-all">
                    {tab === 'model' ? 'Proceed to Download →' : 'Next Step →'}
                  </button>
                )}
              </div>
            </div>

            {/* Right: 3D preview */}
            <div className="lg:col-span-3 flex flex-col gap-3">

              {/* Backlight selector */}
              <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Backlight</span>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(BACKLIGHTS).map(([id, bl]) => (
                    <button key={id} onClick={() => setBacklight(id)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${backlight===id ? 'border-[#1D1D1F] scale-110' : 'border-transparent hover:border-[#D2D2D7]'}`}
                      style={{ background: bl.hex }}
                      title={bl.label}
                    />
                  ))}
                </div>
                <span className="ml-auto text-[10px] text-[#86868B]">{BACKLIGHTS[backlight]?.label}</span>
              </div>

              {/* 3D viewport */}
              <div className="bg-[#111] rounded-2xl shadow-sm flex-1" style={{ height: '520px' }}>
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

              {/* Quick actions */}
              {processedCanvas && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={downloadSTL}
                    className="py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-2xl hover:bg-[#424245] transition-all flex items-center justify-center gap-2">
                    ⬇ Download STL
                  </button>
                  <a href="https://wa.me/918310194953?text=Hi!%20I%20want%20to%20order%20a%20lithophane%20print"
                    target="_blank" rel="noopener noreferrer"
                    className="py-3 border-2 border-[#1D1D1F] text-[#1D1D1F] text-sm font-semibold rounded-2xl hover:bg-[#1D1D1F] hover:text-white transition-all flex items-center justify-center gap-2">
                    Order Print →
                  </a>
                </div>
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
            <p className="text-[#86868B] text-base mt-3 max-w-md mx-auto">Explore what others have made — portraits, pets, landscapes, and more.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title:'Portrait',  bg:'linear-gradient(135deg,#e0cba8,#c4a06a)', desc:'Family & friends' },
              { title:'Pet',       bg:'linear-gradient(135deg,#b8d4e0,#7aa8c0)', desc:'Cats, dogs, birds' },
              { title:'Landscape', bg:'linear-gradient(135deg,#c0dab0,#88b878)', desc:'Mountains, sunsets' },
              { title:'Baby',      bg:'linear-gradient(135deg,#f0d0e0,#d8a0c0)', desc:'Newborn memories' },
              { title:'Logo',      bg:'linear-gradient(135deg,#d0d0e8,#9090c0)', desc:'Business branding' },
              { title:'Wedding',   bg:'linear-gradient(135deg,#f8e8c0,#e0c080)', desc:'Special moments' },
            ].map((g,i) => (
              <motion.div key={g.title}
                className="rounded-2xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-end p-4 relative cursor-pointer hover:scale-105 transition-transform"
                style={{ background: g.bg }}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.07 }}
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.3) 3px,rgba(255,255,255,0.3) 4px)', backgroundSize:'4px 4px' }} />
                <div className="relative text-center">
                  <p className="text-sm font-bold text-white drop-shadow">{g.title}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n:'01', t:'Upload Photo', d:'Drop any JPG or PNG — portraits, pets, landscapes.' },
              { n:'02', t:'Edit & Adjust', d:'Tune brightness, contrast, flip, rotate, and greyscale method.' },
              { n:'03', t:'Configure Shape', d:'Choose plane, cylinder, arc, or sphere with custom dimensions.' },
              { n:'04', t:'Download & Print', d:'Get your STL file. Print it or let ORIC do it for you.' },
            ].map((s,i) => (
              <motion.div key={s.n} className="text-center"
                initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}>
                <div className="w-12 h-12 rounded-full bg-[#1D1D1F] text-white text-sm font-bold flex items-center justify-center mx-auto mb-4">{s.n}</div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-2">{s.t}</h3>
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
              { q:'What is a lithophane?', a:'A lithophane is a 3D-printed object designed to be backlit. Thin areas allow more light through (brighter), thick areas block light (darker), creating a photographic image when illuminated.' },
              { q:'What filament should I use?', a:'Translucent white or natural PLA works best. Avoid opaque or coloured filaments. 0.8–4mm wall range gives the best tonal range.' },
              { q:'What slicer settings do I use?', a:'Layer height 0.1–0.15mm, 100% infill, no supports. Print standing vertically (flat face down) for best results. Slow speed (30–40 mm/s).' },
              { q:'Which shape should I choose?', a:'Plane is simplest and works for framed prints. Cylinder wraps around a lampshade or light. Arc is a gentle curve, great for wall displays. Sphere creates a globe ornament.' },
              { q:'What resolution should I pick?', a:'0.2mm/px (Normal) is a great balance. Use 0.1mm for portraits you want ultra-detailed. Use 0.3–0.4mm for large flat lithophanes where detail matters less.' },
              { q:'Can ORIC print it for me?', a:'Yes! Click "Order Print via WhatsApp" and we will quote, print, and ship anywhere in India.' },
            ].map((f,i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-[#1D1D1F] text-center">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Don't have a printer?</h2>
          <p className="text-[#86868B] mb-8">Send us your file — or just the photo. We handle the rest.</p>
          <a href="https://wa.me/918310194953?text=Hi!%20I%20want%20to%20order%20a%20custom%20lithophane"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-[#F5F5F7] transition-all">
            Order via WhatsApp →
          </a>
        </div>
      </section>

    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#D2D2D7] rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F5F5F7] transition-colors"
        onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-semibold text-[#1D1D1F]">{q}</span>
        <span className={`text-[#86868B] transition-transform text-lg leading-none ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-[#86868B] leading-relaxed border-t border-[#D2D2D7]">{a}</div>}
    </div>
  )
}
