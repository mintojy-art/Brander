import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ─── STL + Height map utilities ───────────────────────────────────────────────

function buildHeightMap(imageData, w, h, invert) {
  const map = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const j = i * 4
    const lum = (0.299 * imageData[j] + 0.587 * imageData[j + 1] + 0.114 * imageData[j + 2]) / 255
    map[i] = invert ? lum : 1 - lum   // 0 = thin/bright, 1 = thick/dark
  }
  return map
}

function buildSTL(heightMap, iW, iH, { physW, maxT, minT }) {
  const physH = physW * (iH / iW)
  const xs = physW / (iW - 1)
  const ys = physH / (iH - 1)
  const h = (x, y) => {
    if (x < 0 || x >= iW || y < 0 || y >= iH) return minT
    return minT + heightMap[y * iW + x] * (maxT - minT)
  }
  const T = []
  const face = (a, b, c) => {
    const ux = b[0]-a[0], uy = b[1]-a[1], uz = b[2]-a[2]
    const vx = c[0]-a[0], vy = c[1]-a[1], vz = c[2]-a[2]
    T.push({ n: [uy*vz-uz*vy, uz*vx-ux*vz, ux*vy-uy*vx], v: [a, b, c] })
  }

  for (let y = 0; y < iH - 1; y++) {
    for (let x = 0; x < iW - 1; x++) {
      const [x0,x1,y0,y1] = [x*xs,(x+1)*xs,y*ys,(y+1)*ys]
      const [z00,z10,z01,z11] = [h(x,y),h(x+1,y),h(x,y+1),h(x+1,y+1)]
      // Front face (height mapped)
      face([x0,y0,z00],[x1,y0,z10],[x0,y1,z01])
      face([x1,y0,z10],[x1,y1,z11],[x0,y1,z01])
      // Back face (flat z=0, reversed winding)
      face([x0,y0,0],[x0,y1,0],[x1,y0,0])
      face([x1,y0,0],[x0,y1,0],[x1,y1,0])
    }
  }
  // Left wall
  for (let y = 0; y < iH-1; y++) {
    const [y0,y1,z0,z1] = [y*ys,(y+1)*ys,h(0,y),h(0,y+1)]
    face([0,y0,0],[0,y0,z0],[0,y1,0]); face([0,y1,0],[0,y0,z0],[0,y1,z1])
  }
  // Right wall
  const rX = (iW-1)*xs
  for (let y = 0; y < iH-1; y++) {
    const [y0,y1,z0,z1] = [y*ys,(y+1)*ys,h(iW-1,y),h(iW-1,y+1)]
    face([rX,y0,z0],[rX,y1,0],[rX,y0,0]); face([rX,y0,z0],[rX,y1,z1],[rX,y1,0])
  }
  // Top wall
  for (let x = 0; x < iW-1; x++) {
    const [x0,x1,z0,z1] = [x*xs,(x+1)*xs,h(x,0),h(x+1,0)]
    face([x0,0,z0],[x1,0,0],[x0,0,0]); face([x0,0,z0],[x1,0,z1],[x1,0,0])
  }
  // Bottom wall
  const bY = (iH-1)*ys
  for (let x = 0; x < iW-1; x++) {
    const [x0,x1,z0,z1] = [x*xs,(x+1)*xs,h(x,iH-1),h(x+1,iH-1)]
    face([x0,bY,0],[x0,bY,z0],[x1,bY,0]); face([x1,bY,0],[x0,bY,z0],[x1,bY,z1])
  }

  const buf = new ArrayBuffer(84 + T.length * 50)
  const dv = new DataView(buf)
  const hdr = 'Lithophane by ORIC 3D Print'
  for (let i = 0; i < 80; i++) dv.setUint8(i, i < hdr.length ? hdr.charCodeAt(i) : 0)
  dv.setUint32(80, T.length, true)
  let o = 84
  for (const { n, v } of T) {
    for (const p of [n, ...v]) {
      dv.setFloat32(o, p[0], true); dv.setFloat32(o+4, p[1], true); dv.setFloat32(o+8, p[2], true); o += 12
    }
    dv.setUint16(o, 0, true); o += 2
  }
  return buf
}

// ─── Three.js Preview ─────────────────────────────────────────────────────────

function LithophanePreview({ heightMap, pW, pH, physW, maxT, minT }) {
  const mountRef = useRef(null)
  const refs = useRef({})
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const w = el.clientWidth || 420, h = el.clientHeight || 340
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x111111)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const fill = new THREE.DirectionalLight(0xffffff, 0.4)
    fill.position.set(0, 100, 100); scene.add(fill)

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000)
    camera.position.set(0, 0, 250)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.enabled = false

    let frame
    const animate = () => { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera) }
    animate()

    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth, nh = el.clientHeight
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
    })
    ro.observe(el)

    refs.current = { renderer, scene, camera, controls }

    return () => {
      cancelAnimationFrame(frame); controls.dispose(); renderer.dispose(); ro.disconnect()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const { scene, camera } = refs.current
    if (!scene) return
    // Remove existing mesh
    const old = scene.getObjectByName('litho')
    if (old) { scene.remove(old); old.geometry?.dispose(); old.material?.dispose() }
    if (!heightMap || !pW || !pH) return

    const physH = physW * (pH / pW)
    const geo = new THREE.PlaneGeometry(physW, physH, pW - 1, pH - 1)
    const pos = geo.attributes.position
    const colors = []

    for (let iy = 0; iy < pH; iy++) {
      for (let ix = 0; ix < pW; ix++) {
        const idx = iy * pW + ix
        pos.setZ(idx, minT + heightMap[idx] * (maxT - minT))
        // Simulate backlit: thin (low heightMap) = bright
        const b = 1 - heightMap[idx] * 0.88
        colors.push(b, b, b * 0.92)
      }
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
    )
    mesh.name = 'litho'
    mesh.rotation.x = Math.PI  // correct orientation (image top = visual top)
    scene.add(mesh)

    // Reset camera
    const dist = Math.max(physW, physH) * 1.7
    if (camera) { camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0) }
    if (refs.current.controls) refs.current.controls.target.set(0, 0, 0)
  }, [heightMap, pW, pH, physW, maxT, minT])

  const activate = () => { setActive(true); if (refs.current.controls) refs.current.controls.enabled = true }
  const deactivate = () => { setActive(false); if (refs.current.controls) refs.current.controls.enabled = false }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#111] cursor-pointer" style={{ height: 340 }}
      onClick={activate} onMouseLeave={deactivate}>
      <div ref={mountRef} className="w-full h-full" />
      {!heightMap && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p className="text-sm text-white/30">Upload an image to see the 3D preview</p>
        </div>
      )}
      {heightMap && !active && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <span className="px-3 py-1.5 bg-black/60 text-white/80 text-xs rounded-full backdrop-blur-sm flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 11V6a2 2 0 00-4 0v0M14 10V4a2 2 0 00-4 0v0M10 10.5V6a2 2 0 00-4 0v3"/>
              <path d="M18 11a2 2 0 114 0v3a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15"/>
            </svg>
            Click to rotate &amp; zoom
          </span>
        </div>
      )}
      {heightMap && active && (
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 bg-white/10 text-white/60 text-[10px] rounded-full">Drag · Scroll · Move away to release</span>
        </div>
      )}
    </div>
  )
}

// ─── Generator Tool ────────────────────────────────────────────────────────────

function Generator() {
  const [imgEl, setImgEl] = useState(null)
  const [imgURL, setImgURL] = useState(null)
  const [heightMap, setHeightMap] = useState(null)
  const [pW, setPW] = useState(0)
  const [pH, setPH] = useState(0)
  const [settings, setSettings] = useState({ physW: 100, maxT: 3.0, minT: 0.6, invert: false })
  const [generating, setGenerating] = useState(false)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const process = useCallback((img, s) => {
    const MAX = 160
    const ratio = img.naturalHeight / img.naturalWidth
    const w = Math.min(img.naturalWidth, MAX)
    const h = Math.round(w * ratio)
    const c = document.createElement('canvas'); c.width = w; c.height = h
    c.getContext('2d').drawImage(img, 0, 0, w, h)
    const data = c.getContext('2d').getImageData(0, 0, w, h)
    setHeightMap(buildHeightMap(data.data, w, h, s.invert))
    setPW(w); setPH(h)
  }, [])

  const loadImage = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { setImgEl(img); setImgURL(url); process(img, settings) }
    img.src = url
  }, [settings, process])

  const set = (k, v) => {
    const next = { ...settings, [k]: v }
    setSettings(next)
    if (imgEl) process(imgEl, next)
  }

  const downloadSTL = () => {
    if (!imgEl) return
    setGenerating(true)
    setTimeout(() => {
      const MAX = 260
      const ratio = imgEl.naturalHeight / imgEl.naturalWidth
      const sw = Math.min(imgEl.naturalWidth, MAX), sh = Math.round(sw * ratio)
      const c = document.createElement('canvas'); c.width = sw; c.height = sh
      c.getContext('2d').drawImage(imgEl, 0, 0, sw, sh)
      const d = c.getContext('2d').getImageData(0, 0, sw, sh)
      const map = buildHeightMap(d.data, sw, sh, settings.invert)
      const buf = buildSTL(map, sw, sh, settings)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([buf], { type: 'model/stl' }))
      a.download = 'lithophane-oric.stl'
      a.click()
      setGenerating(false)
    }, 30)
  }

  const Slider = ({ label, unit, value, min, max, step, onChange }) => {
    const pct = ((value - min) / (max - min)) * 100
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-[#1D1D1F]">{label}</span>
          <span className="text-xs font-bold text-[#1D1D1F] bg-white px-2 py-0.5 rounded-md border border-[#E5E5EA]">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right,#1D1D1F ${pct}%,#D2D2D7 ${pct}%)` }}
        />
        <div className="flex justify-between text-[10px] text-[#86868B] mt-1"><span>{min}{unit}</span><span>{max}{unit}</span></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Upload zone */}
      <div
        onDrop={e => { e.preventDefault(); setDrag(false); loadImage(e.dataTransfer.files[0]) }}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        className={`relative border-2 border-dashed rounded-2xl transition-all mb-6 ${drag ? 'border-[#1D1D1F] bg-[#F0F0F0]' : imgURL ? 'border-transparent' : 'border-[#D2D2D7] hover:border-[#86868B] cursor-pointer'}`}
        onClick={() => !imgURL && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => loadImage(e.target.files[0])} />
        {imgURL ? (
          <div className="relative">
            <img src={imgURL} alt="preview" className="w-full max-h-60 object-contain rounded-2xl bg-[#F5F5F7]" />
            <button onClick={e => { e.stopPropagation(); setImgEl(null); setImgURL(null); setHeightMap(null) }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full text-sm flex items-center justify-center hover:bg-black/80">✕</button>
            <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 text-white text-xs rounded-full hover:bg-black/80">Change image</button>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center gap-3 text-[#86868B]">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2.5"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p className="text-base font-semibold text-[#1D1D1F]">Drop your image here</p>
            <p className="text-sm text-[#86868B]">or click to browse · JPG, PNG, WebP supported</p>
            <p className="text-xs bg-[#F5F5F7] px-3 py-1.5 rounded-full mt-1 text-[#86868B]">
              Best results: high contrast portraits, pets, landscapes
            </p>
          </div>
        )}
      </div>

      {/* Settings + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Settings */}
        <div className="bg-[#F5F5F7] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
            <h3 className="text-sm font-bold text-[#1D1D1F]">Print Settings</h3>
          </div>

          <Slider label="Width" unit=" mm" value={settings.physW} min={50} max={200} step={5} onChange={v => set('physW', v)} />
          <Slider label="Max thickness (dark areas)" unit=" mm" value={settings.maxT} min={1.5} max={5.0} step={0.1} onChange={v => set('maxT', v)} />
          <Slider label="Min thickness (bright areas)" unit=" mm" value={settings.minT} min={0.4} max={1.5} step={0.1} onChange={v => set('minT', v)} />

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-semibold text-[#1D1D1F]">Invert tones</p>
              <p className="text-[10px] text-[#86868B] mt-0.5">Flip which areas are thick vs thin</p>
            </div>
            <button type="button" onClick={() => set('invert', !settings.invert)}
              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${settings.invert ? 'bg-[#1D1D1F]' : 'bg-[#C9CCCF]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.invert ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#E5E5EA]">
            <p className="text-[11px] text-[#424245] leading-relaxed">
              <span className="font-semibold text-[#1D1D1F]">Print tip:</span> Use PLA or PETG at 0.1–0.15 mm layer height for best detail. Print slowly (30–40 mm/s). Place against a window or LED panel to reveal the image.
            </p>
          </div>
        </div>

        {/* 3D Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <h3 className="text-sm font-bold text-[#1D1D1F]">3D Preview</h3>
            </div>
            <span className="text-[10px] text-[#86868B] bg-[#F5F5F7] px-2.5 py-1 rounded-full">Simulates backlit appearance</span>
          </div>
          <LithophanePreview heightMap={heightMap} pW={pW} pH={pH} physW={settings.physW} maxT={settings.maxT} minT={settings.minT} />
          <div className="flex gap-2 text-[10px] text-[#86868B] justify-center">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#D2D2D7] inline-block"/> Thin = bright (lets light through)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#888] inline-block"/> Thick = dark (blocks light)
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={downloadSTL} disabled={!imgEl || generating}
          className="flex-1 py-4 bg-[#1D1D1F] text-white text-sm font-bold rounded-full hover:bg-[#424245] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
          {generating
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating STL…</>
            : <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download STL File
              </>
          }
        </button>
        <a href={`https://wa.me/918310194953?text=${encodeURIComponent("Hi ORIC! I'd like to order a printed lithophane. Can you help with the settings and pricing?")}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 py-4 bg-[#25D366] text-white text-sm font-bold rounded-full hover:bg-[#1ebe57] transition-all flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Order Print via WhatsApp
        </a>
      </div>
      {!imgEl && (
        <p className="text-center text-xs text-[#86868B] mt-3">Upload an image to unlock the download button</p>
      )}
    </div>
  )
}

// ─── Gallery data ─────────────────────────────────────────────────────────────

const GALLERY = [
  {
    title: 'Portrait',
    desc: 'Faces rendered in stunning depth — ideal as a personalised gift',
    grad: 'from-[#e8e8e8] via-[#f5f5f5] to-[#d0d0d0]',
    icon: '👤',
  },
  {
    title: 'Pet Photo',
    desc: 'Capture your furry friend forever in glowing 3D detail',
    grad: 'from-[#dce8dc] via-[#f0f5f0] to-[#c8d8c8]',
    icon: '🐾',
  },
  {
    title: 'Landscape',
    desc: 'Mountains, skylines, sunsets — dramatic depth and contrast',
    grad: 'from-[#dce4f0] via-[#eef3fa] to-[#c8d4e8]',
    icon: '🏔️',
  },
  {
    title: 'Baby Milestone',
    desc: 'First photo, first smile — preserved as a glowing keepsake',
    grad: 'from-[#f0e8f0] via-[#faf0fa] to-[#e0d0e0]',
    icon: '👶',
  },
  {
    title: 'Logo / Brand Art',
    desc: 'High-contrast logos turn into striking illuminated displays',
    grad: 'from-[#f0e8dc] via-[#faf5f0] to-[#e0d0c0]',
    icon: '✦',
  },
  {
    title: 'Wedding Memory',
    desc: 'An unforgettable anniversary gift with timeless elegance',
    grad: 'from-[#f0e8e8] via-[#faf5f5] to-[#e0d0d0]',
    icon: '💍',
  },
]

const HOW = [
  {
    n: '01',
    title: 'Upload your image',
    desc: 'Choose any JPG, PNG or WebP. High-contrast photos — portraits, pets, landscapes — produce the most striking results.',
  },
  {
    n: '02',
    title: 'Configure & preview',
    desc: 'Set the physical size and thickness. The 3D preview updates instantly to show you exactly what the backlit piece will look like.',
  },
  {
    n: '03',
    title: 'Download STL & print',
    desc: 'Download the ready-to-print STL file, or send it to us via WhatsApp and we\'ll handle the printing and delivery.',
  },
]

const FAQS = [
  { q: 'What material should I use?', a: 'PLA works best for its translucency. White or natural-coloured filament produces the clearest image when backlit.' },
  { q: 'What layer height gives the best detail?', a: '0.10–0.15 mm layer height. Slower print speed (30–40 mm/s) helps smooth out layer lines on the flat back surface.' },
  { q: 'How do I display the lithophane?', a: 'Place it against a window (daylight works brilliantly), or mount it in front of an LED strip or light box. The brighter the light behind it, the more dramatic the effect.' },
  { q: 'What image works best?', a: 'High-contrast images with clear light and dark areas. Portraits and pet photos are ideal. Very busy or low-contrast images may not produce sharp results.' },
  { q: 'Can ORIC print it for me?', a: "Yes — click 'Order Print via WhatsApp' to send us your file and we'll quote you within a few hours." },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Lithophane() {
  const [openFaq, setOpenFaq] = useState(null)

  const scrollToTool = () => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="pt-16">

      {/* ── HERO ── */}
      <section className="relative bg-[#1D1D1F] min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)',
        }} />
        {/* Animated glow */}
        <div className="absolute right-0 top-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#86868B] mb-6"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              ORIC · 3D Print on Demand · Made in India
            </motion.p>
            <motion.h1 className="text-5xl md:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              Turn Photos<br />Into<br /><span className="text-[#86868B]">3D Art.</span>
            </motion.h1>
            <motion.p className="text-base md:text-lg text-[#86868B] leading-relaxed mb-10 max-w-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.25 }}>
              Lithophanes are 3D-printed panels that reveal a photograph when held up to light.
              Upload your image, configure settings, download the STL — or let us print and deliver it.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
              <button onClick={scrollToTool}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-sm font-bold rounded-full transition-all">
                Try the Generator →
              </button>
              <a href={`https://wa.me/918310194953?text=${encodeURIComponent("Hi ORIC! I'd like to order a lithophane print.")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#424245] hover:border-white text-white text-sm font-semibold rounded-full transition-all">
                Order a Print
              </a>
            </motion.div>
          </div>

          {/* Hero visual — simulated lithophane panel */}
          <motion.div className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }}>
            <div className="relative w-72 h-80">
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
                style={{ background: 'radial-gradient(ellipse, #ffffff 0%, transparent 70%)' }} />
              {/* Panel */}
              <div className="relative w-full h-full rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.09) 100%)' }}>
                {/* Simulated depth pattern */}
                {Array.from({ length: 12 }).map((_, r) => (
                  <div key={r} className="flex">
                    {Array.from({ length: 10 }).map((_, c) => {
                      const v = (Math.sin(r * 0.7 + c * 0.9) + 1) / 2
                      return (
                        <div key={c} style={{ flex: 1, height: 26, opacity: 0.04 + v * 0.14,
                          background: `rgba(255,255,255,${0.3 + v * 0.7})` }} />
                      )
                    })}
                  </div>
                ))}
                <div className="absolute inset-0 flex items-end justify-center pb-6">
                  <span className="text-white/30 text-[10px] font-medium tracking-widest uppercase">Lithophane</span>
                </div>
              </div>
              {/* Light source dot */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-3 rounded-full blur-lg opacity-40"
                style={{ background: 'white' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT IS A LITHOPHANE ── */}
      <section className="py-16 bg-white border-b border-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '💡', title: 'Light-Activated Art', desc: 'When held up to any light source, the varying thickness of the plastic creates a detailed photograph-like image.' },
              { icon: '🖨️', title: 'FDM Printed', desc: 'Printed in white or translucent PLA at fine 0.1mm layer heights for smooth gradients and sharp detail.' },
              { icon: '🎁', title: 'Perfect Gift', desc: 'A deeply personal, one-of-a-kind gift. We ship printed lithophanes anywhere across India.' },
            ].map((item, i) => (
              <motion.div key={i} className="flex gap-4 p-6 rounded-2xl bg-[#F5F5F7]"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <span className="text-3xl shrink-0">{item.icon}</span>
                <div>
                  <p className="font-bold text-[#1D1D1F] text-sm mb-1.5">{item.title}</p>
                  <p className="text-sm text-[#86868B] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-14">
            <motion.p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Simple Process
            </motion.p>
            <motion.h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F]"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              Three steps to your lithophane
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW.map((step, i) => (
              <motion.div key={i} className="text-center"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="w-14 h-14 rounded-full bg-[#1D1D1F] text-white text-sm font-bold flex items-center justify-center mx-auto mb-5">
                  {step.n}
                </div>
                <h3 className="text-base font-bold text-[#1D1D1F] mb-3">{step.title}</h3>
                <p className="text-sm text-[#86868B] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GENERATOR ── */}
      <section id="generator" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-12">
            <motion.p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Free Tool
            </motion.p>
            <motion.h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-4"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              Lithophane Generator
            </motion.h2>
            <motion.p className="text-[#86868B] text-base max-w-lg mx-auto"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              Upload any image, configure the size and thickness, and download a print-ready STL file — completely free.
            </motion.p>
          </div>
          <Generator />
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-24 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-14">
            <motion.p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Ideas & Inspiration
            </motion.p>
            <motion.h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F]"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              What can you make?
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GALLERY.map((item, i) => (
              <motion.div key={i} className="group relative rounded-3xl overflow-hidden bg-white border border-[#D2D2D7] hover:shadow-xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                {/* Simulated lithophane visual */}
                <div className={`h-52 bg-gradient-to-br ${item.grad} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Panel glow effect */}
                      <div className="absolute inset-0 blur-xl opacity-60"
                        style={{ background: 'radial-gradient(circle, white 30%, transparent 70%)' }} />
                      <div className="relative w-28 h-36 rounded-xl border border-white/60 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))' }}>
                        <span className="text-4xl">{item.icon}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-white/50 bg-black/10 px-2 py-0.5 rounded-full">
                      Lithophane
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#1D1D1F] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#86868B] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <motion.h2 className="text-4xl font-bold text-[#1D1D1F]"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              Common questions
            </motion.h2>
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left gap-4">
                  <span className="text-sm font-semibold text-[#1D1D1F]">{faq.q}</span>
                  <span className={`text-[#86868B] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                </button>
                {openFaq === i && (
                  <p className="pb-5 text-sm text-[#86868B] leading-relaxed">{faq.a}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[#1D1D1F]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <motion.h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            We'll print it<br /><span className="text-[#86868B]">and ship it.</span>
          </motion.h2>
          <motion.p className="text-[#86868B] text-base mb-10 max-w-sm mx-auto"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            Don't have a printer? Send us your image and we'll produce a high-quality lithophane and deliver it anywhere in India.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <a href={`https://wa.me/918310194953?text=${encodeURIComponent("Hi ORIC! I'd like to order a lithophane print. Please share pricing details.")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white text-sm font-bold rounded-full hover:bg-[#1ebe57] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Order via WhatsApp
            </a>
            <button onClick={scrollToTool}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#424245] hover:border-white text-white text-sm font-semibold rounded-full transition-all">
              Try the Generator Free
            </button>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
