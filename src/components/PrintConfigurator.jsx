import { useState, useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useCart } from '../context/CartContext'

// ── Data ────────────────────────────────────────────────────────────────────
const MATERIALS = [
  { id: 'PLA',  label: 'PLA',  ppg: 1.5,  density: 1.24, note: 'General purpose'   },
  { id: 'PETG', label: 'PETG', ppg: 2.0,  density: 1.27, note: 'Strong & flexible' },
  { id: 'TPU',  label: 'TPU',  ppg: 3.0,  density: 1.21, note: 'Flexible'          },
  { id: 'ABS',  label: 'ABS',  ppg: 1.8,  density: 1.05, note: 'Heat resistant'    },
  { id: 'ASA',  label: 'ASA',  ppg: 2.5,  density: 1.07, note: 'UV resistant'      },
]

const COLORS_LIST = [
  { id: 'Black',  hex: '#1a1a1a' },
  { id: 'White',  hex: '#f0f0f0' },
  { id: 'Grey',   hex: '#888888' },
  { id: 'Red',    hex: '#dc2626' },
  { id: 'Blue',   hex: '#2563eb' },
  { id: 'Green',  hex: '#16a34a' },
  { id: 'Orange', hex: '#ea580c' },
  { id: 'Yellow', hex: '#ca8a04' },
]

const QUALITIES = [
  { id: 'Draft (0.3mm)',     label: 'Draft (0.3mm) — Fast print',       timeMul: 0.7 },
  { id: 'Standard (0.2mm)', label: 'Standard (0.2mm) — Balanced quality', timeMul: 1.0 },
  { id: 'Fine (0.1mm)',     label: 'Fine (0.1mm) — High detail',        timeMul: 1.8 },
  { id: 'Ultra (0.05mm)',   label: 'Ultra Fine (0.05mm) — Max detail',  timeMul: 3.2 },
]

// ── Price estimation ────────────────────────────────────────────────────────
function estimatePrice(dims, strength, materialId, qualityId) {
  const mat  = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0]
  const qual = QUALITIES.find((q) => q.id === qualityId) || QUALITIES[1]
  const infill = strength / 100

  const bboxVol     = (dims.x * dims.y * dims.z) / 1000        // mm³ → cm³
  const filamentVol = bboxVol * (0.018 + infill * 0.05)        // realistic shell+infill fraction
  const weight      = filamentVol * mat.density                 // grams
  const matCost     = weight * mat.ppg
  const timeCost    = (filamentVol / 15) * 50 * qual.timeMul   // ₹50/hr print rate
  const base        = 65                                        // handling fee

  return Math.max(Math.round(base + matCost + timeCost), 150)
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtBytes = (b) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(2)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`

// ── Component ───────────────────────────────────────────────────────────────
export default function PrintConfigurator() {
  const [file, setFile]           = useState(null)
  const [dims, setDims]           = useState(null)
  const [material, setMaterial]   = useState('PLA')
  const [printColor, setPrintColor] = useState('Black')
  const [quality, setQuality]     = useState('Standard (0.2mm)')
  const [strength, setStrength]   = useState(50)
  const [price, setPrice]         = useState(null)
  const [calculating, setCalc]    = useState(false)
  const [isDragging, setDrag]     = useState(false)
  const [canvasActive, setCanvasActive] = useState(false)

  const mountRef    = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef    = useRef(null)
  const cameraRef   = useRef(null)
  const controlsRef = useRef(null)
  const frameRef    = useRef(null)
  const meshRef     = useRef(null)

  const { add } = useCart()

  // ── Init Three.js ──
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const w = el.clientWidth || 400
    const h = el.clientHeight || 300

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xF5F5F7)
    el.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000)
    camera.position.set(200, 180, 280)
    cameraRef.current = camera

    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(300, 400, 300)
    scene.add(dir)
    const rim = new THREE.DirectionalLight(0xffffff, 0.25)
    rim.position.set(-200, -100, -200)
    scene.add(rim)

    const grid = new THREE.GridHelper(600, 40, 0xD2D2D7, 0xD2D2D7)
    scene.add(grid)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance   = 5
    controls.maxDistance   = 3000
    controls.enabled       = false   // disabled until user clicks canvas
    controlsRef.current    = controls

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const ro = new ResizeObserver(() => {
      if (!el) return
      const nw = el.clientWidth
      const nh = el.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(frameRef.current)
      controls.dispose()
      renderer.dispose()
      ro.disconnect()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // ── Update model color live ──
  useEffect(() => {
    if (!meshRef.current) return
    const c = COLORS_LIST.find((c) => c.id === printColor) || COLORS_LIST[0]
    meshRef.current.material.color.set(c.hex)
  }, [printColor])

  // ── Load STL geometry ──
  const loadSTL = useCallback((buffer) => {
    const loader   = new STLLoader()
    const geometry = loader.parse(buffer)

    geometry.computeBoundingBox()
    const bb = geometry.boundingBox
    const dx = +(bb.max.x - bb.min.x).toFixed(1)
    const dy = +(bb.max.y - bb.min.y).toFixed(1)
    const dz = +(bb.max.z - bb.min.z).toFixed(1)
    setDims({ x: dx, y: dy, z: dz })
    setPrice(null)

    geometry.center()

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current)
      meshRef.current.geometry.dispose()
      meshRef.current.material.dispose()
    }

    const c   = COLORS_LIST.find((c) => c.id === printColor) || COLORS_LIST[0]
    const mat = new THREE.MeshPhongMaterial({ color: c.hex, specular: 0x444444, shininess: 60 })
    const mesh = new THREE.Mesh(geometry, mat)

    geometry.computeBoundingBox()
    mesh.position.y = -geometry.boundingBox.min.y
    sceneRef.current.add(mesh)
    meshRef.current = mesh

    const maxDim   = Math.max(dx, dy, dz)
    const dist     = maxDim * 2.2
    cameraRef.current.position.set(dist * 0.8, dist * 0.6, dist)
    cameraRef.current.lookAt(0, 0, 0)
    controlsRef.current.target.set(0, 0, 0)
    controlsRef.current.update()
  }, [printColor])

  // ── File handling ──
  const handleFile = useCallback((f) => {
    if (!f || !f.name.toLowerCase().endsWith('.stl')) return alert('Please upload an STL file.')
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => loadSTL(e.target.result)
    reader.readAsArrayBuffer(f)
  }, [loadSTL])

  const clearFile = () => {
    setFile(null)
    setDims(null)
    setPrice(null)
    if (meshRef.current && sceneRef.current) {
      sceneRef.current.remove(meshRef.current)
      meshRef.current.geometry.dispose()
      meshRef.current.material.dispose()
      meshRef.current = null
    }
  }

  const calcPrice = () => {
    if (!dims) return
    setCalc(true)
    setTimeout(() => {
      setPrice(estimatePrice(dims, strength, material, quality))
      setCalc(false)
    }, 700)
  }

  const handleAddToCart = () => {
    if (!file) return
    const c = COLORS_LIST.find((c) => c.id === printColor) || COLORS_LIST[0]
    add({
      id:           `custom-${Date.now()}`,
      name:         `Custom Print — ${file.name.replace('.stl', '')}`,
      tagline:      `${material} · ${printColor} · ${quality} · ${strength}% infill`,
      price:        price || null,
      priceDisplay: price ? `₹${price.toLocaleString()}` : 'Get Quote',
      category:     'Custom',
      image:        null,
      badge:        'Custom Print',
    })
  }

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* ════ LEFT PANEL ════ */}
      <div className="flex flex-col gap-5">

        {/* Upload Model */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span className="text-sm font-semibold text-[#1D1D1F]">Upload Model</span>
          </div>

          {file ? (
            <div className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-xl border border-[#D2D2D7]">
              <div className="w-10 h-10 bg-[#E8E8ED] rounded-xl flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#424245" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1D1D1F] truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#86868B]">{fmtBytes(file.size)}</span>
                  <span className="px-1.5 py-0.5 bg-[#1D1D1F] text-white text-[9px] font-bold rounded tracking-wider">STL</span>
                </div>
              </div>
              <button onClick={clearFile} className="text-[#86868B] hover:text-[#1D1D1F] transition-colors p-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragging ? 'border-[#1D1D1F] bg-[#F5F5F7]' : 'border-[#D2D2D7] hover:border-[#86868B] hover:bg-[#FAFAFA]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1D1D1F]">Drop your STL file here</p>
                <p className="text-xs text-[#86868B] mt-1">or click to browse · .STL files only</p>
              </div>
              <input type="file" accept=".stl" className="hidden" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]) }} />
            </label>
          )}
        </div>

        {/* 3D Preview */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden flex-1">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F5F5F7]">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span className="text-sm font-semibold text-[#1D1D1F]">3D Preview</span>
            </div>
            <span className="px-2.5 py-1 bg-[#F5F5F7] text-[#86868B] text-[10px] font-semibold tracking-wider rounded-full">STL</span>
          </div>

          <div
            className="relative"
            onClick={() => {
              if (!canvasActive) {
                setCanvasActive(true)
                if (controlsRef.current) controlsRef.current.enabled = true
              }
            }}
            onMouseLeave={() => {
              setCanvasActive(false)
              if (controlsRef.current) controlsRef.current.enabled = false
            }}
          >
            {/* Three.js mount */}
            <div ref={mountRef} style={{ width: '100%', height: '300px' }} />

            {/* Empty state overlay */}
            {!file && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none" style={{ background: '#F5F5F7' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D2D2D7" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <p className="text-xs text-[#86868B]">Upload an STL to preview</p>
              </div>
            )}

            {/* Click-to-interact overlay — shown when file loaded but canvas not active */}
            {file && !canvasActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v0M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v3"/><path d="M18 11a2 2 0 114 0v3a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15"/></svg>
                  Click to interact
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-2.5 border-t border-[#F5F5F7]">
            <p className="text-[10px] text-[#86868B] text-center">
              {canvasActive ? 'Drag to rotate · Scroll to zoom · Move away to release' : 'Click the preview to rotate & zoom'}
            </p>
          </div>
        </div>
      </div>

      {/* ════ RIGHT PANEL ════ */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <h3 className="text-base font-semibold text-[#1D1D1F]">Configure Your Print</h3>
        </div>

        {/* Material + Color */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Material</label>
            <div className="relative">
              <select
                value={material}
                onChange={(e) => { setMaterial(e.target.value); setPrice(null) }}
                className="w-full text-sm text-[#1D1D1F] bg-white border border-[#D2D2D7] rounded-xl px-3 py-2.5 pr-8 outline-none focus:border-[#1D1D1F] transition-colors appearance-none cursor-pointer"
              >
                {MATERIALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <p className="text-[10px] text-[#86868B] mt-1">{MATERIALS.find((m) => m.id === material)?.note}</p>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Color</label>
            <div className="relative">
              <select
                value={printColor}
                onChange={(e) => setPrintColor(e.target.value)}
                className="w-full text-sm text-[#1D1D1F] bg-white border border-[#D2D2D7] rounded-xl px-3 py-2.5 pr-8 outline-none focus:border-[#1D1D1F] transition-colors appearance-none cursor-pointer"
              >
                {COLORS_LIST.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {/* Color swatch */}
            <div className="flex items-center gap-1 mt-2">
              {COLORS_LIST.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPrintColor(c.id)}
                  title={c.id}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${printColor === c.id ? 'border-[#1D1D1F] scale-125' : 'border-transparent hover:scale-110'}`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Quality</label>
          <div className="relative">
            <select
              value={quality}
              onChange={(e) => { setQuality(e.target.value); setPrice(null) }}
              className="w-full text-sm text-[#1D1D1F] bg-white border border-[#D2D2D7] rounded-xl px-3 py-2.5 pr-8 outline-none focus:border-[#1D1D1F] transition-colors appearance-none cursor-pointer"
            >
              {QUALITIES.map((q) => <option key={q.id} value={q.id}>{q.label}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {/* Strength slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Strength (Infill)</label>
            <span className="text-sm font-bold text-[#1D1D1F]">{strength}%</span>
          </div>
          <input
            type="range"
            min={10} max={100} step={5}
            value={strength}
            onChange={(e) => { setStrength(+e.target.value); setPrice(null) }}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #1D1D1F ${(strength-10)/90*100}%, #D2D2D7 ${(strength-10)/90*100}%)` }}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-[#86868B]">Light (10%)</span>
            <span className="text-[10px] text-[#86868B]">Medium (50%)</span>
            <span className="text-[10px] text-[#86868B]">Solid (100%)</span>
          </div>
        </div>

        {/* Price box */}
        <div className="rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Total Price</p>
          {price ? (
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-[#1D1D1F]">₹{price.toLocaleString()}</span>
              <span className="text-xs text-[#86868B] mb-1">estimate · excl. delivery</span>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[#86868B] mb-3">
                {!file ? 'Upload a model to calculate price' : 'Click Calculate to get a price estimate'}
              </p>
              <button
                onClick={calcPrice}
                disabled={!file || calculating}
                className="flex items-center gap-2 px-4 py-2 bg-[#1D1D1F] hover:bg-[#424245] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-full transition-all"
              >
                {calculating ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="6" x2="12" y2="6"/></svg>
                )}
                {calculating ? 'Calculating…' : 'Calculate Price'}
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!file}
            className="flex items-center justify-center gap-2 py-3.5 border border-[#D2D2D7] hover:bg-[#F5F5F7] disabled:opacity-40 disabled:cursor-not-allowed text-[#1D1D1F] text-sm font-semibold rounded-xl transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Add to Cart
          </button>
          <button
            onClick={calcPrice}
            disabled={!file || calculating}
            className="py-3.5 bg-[#1D1D1F] hover:bg-[#424245] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
          >
            {calculating ? 'Calculating…' : 'Calculate'}
          </button>
        </div>

        {/* Model stats */}
        {dims && (
          <div className="rounded-xl border border-[#D2D2D7] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F7]">
              <div className="flex items-center gap-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                <span className="text-xs font-semibold text-[#424245]">Model Stats</span>
              </div>
              <span className="text-xs text-[#86868B]">{dims.x} × {dims.y} × {dims.z} mm</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#D2D2D7] px-0">
              {[['Width', dims.x],['Depth', dims.y],['Height', dims.z]].map(([label, val]) => (
                <div key={label} className="py-3 text-center">
                  <p className="text-[10px] text-[#86868B] mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-[#1D1D1F]">{val}mm</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload another */}
        {file && (
          <label className="flex items-center justify-center w-full py-3 border border-[#D2D2D7] rounded-xl text-sm font-medium text-[#424245] hover:bg-[#F5F5F7] cursor-pointer transition-all">
            <input type="file" accept=".stl" className="hidden" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]) }} />
            Upload Another File
          </label>
        )}
      </div>
    </div>
  )
}
