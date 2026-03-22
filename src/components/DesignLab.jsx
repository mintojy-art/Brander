import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

const FONTS = [
  'Arial', 'Impact', 'Georgia', 'Courier New', 'Verdana',
  'Tahoma', 'Times New Roman', 'Arial Black', 'Trebuchet MS',
]

const SHAPES = ['■', '●', '▲', '▼', '◆', '★', '✓', '♥', '⚙', '✚', '✕', '+', '◉', '↩', '♪', '✂']

const RING_SIZES = ['10 CM', '20 CM', '30 CM']

const DESIGN_W = 1024
const DESIGN_H = 220

// ── Small reusable panel wrapper ──────────────────────────────────────────────
function Panel({ label, children, actions }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-3">
          {actions}
          <span className="text-blue-400 text-xs select-none">▲</span>
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Toggle button group ───────────────────────────────────────────────────────
function ToggleGroup({ label, options, value, onChange, getActiveClass }) {
  const defaultActive = 'bg-blue-500 text-white border-blue-500'
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 py-2 rounded text-[11px] font-bold border transition-all ${
              value === opt
                ? (getActiveClass ? getActiveClass(opt) : defaultActive)
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DesignLab({ onAddToCart }) {
  // Text controls
  const [text, setText]       = useState('YourTextHere')
  const [font, setFont]       = useState('Arial')
  const [bold, setBold]       = useState(true)
  const [italic, setItalic]   = useState(false)
  const [fontSize, setFontSize] = useState(130)
  const [scale, setScale]     = useState('1x')

  // Settings
  const [ringSize, setRingSize]   = useState('10 CM')
  const [printMode, setPrintMode] = useState('STANDARD')
  const [bridging, setBridging]   = useState('OFF')

  // Upload
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isDragging, setIsDragging]       = useState(false)

  // 3D
  const [autoRotate, setAutoRotate] = useState(true)

  // Refs
  const editorCanvasRef  = useRef(null)
  const threeCanvasRef   = useRef(null)
  const offscreenRef     = useRef(null)   // shared design canvas (texture source)
  const threeRef         = useRef({})
  const autoRotateRef    = useRef(true)
  const fileInputRef     = useRef(null)
  const draggingRef      = useRef(false)

  const isNegative = printMode === 'NEGATIVE'

  // ── Render design onto the shared offscreen canvas ─────────────────────────
  const renderToOffscreen = useCallback(() => {
    const canvas = offscreenRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const W = DESIGN_W
    const H = DESIGN_H

    // Background
    ctx.fillStyle = isNegative ? '#000' : '#fff'
    ctx.fillRect(0, 0, W, H)

    // Bridging
    const lineColor = isNegative ? '#fff' : '#000'
    if (bridging === 'LINES') {
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(0, 3);        ctx.lineTo(W, 3)
      ctx.moveTo(0, H - 3);   ctx.lineTo(W, H - 3)
      ctx.stroke()
    } else if (bridging === 'UNDERLINE') {
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(0, H - 14); ctx.lineTo(W, H - 14)
      ctx.stroke()
    }

    if (uploadedImage) {
      // Draw image with high contrast (greyscale + contrast)
      const aspect = uploadedImage.width / uploadedImage.height
      const drawH = H - 20
      const drawW = drawH * aspect
      const xOff = Math.max(0, (W - drawW) / 2)
      ctx.filter = 'grayscale(1) contrast(3) brightness(0.9)'
      ctx.drawImage(uploadedImage, xOff, 10, Math.min(drawW, W - 40), drawH)
      ctx.filter = 'none'
    } else {
      const repeatCount = parseInt(scale) || 1
      const fs = Math.round(fontSize / repeatCount)
      ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fs}px "${font}"`
      ctx.fillStyle = lineColor
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'

      const displayText = text || 'YourTextHere'
      const measured = ctx.measureText(displayText).width

      if (repeatCount > 1) {
        // Tile the text across the canvas
        let x = 20
        while (x < W) {
          ctx.fillText(displayText, x, H / 2)
          x += measured + 40
        }
      } else {
        const x = measured < W - 40 ? (W - measured) / 2 : 20
        ctx.fillText(displayText, x, H / 2)
      }
    }
  }, [text, font, bold, italic, fontSize, scale, isNegative, bridging, uploadedImage])

  // ── Draw the 2D editor canvas (ruler + design preview) ─────────────────────
  const drawEditor = useCallback(() => {
    const canvas = editorCanvasRef.current
    if (!canvas || !offscreenRef.current) return

    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Ruler strip
    const rulerH = 26
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, W, rulerH)

    ctx.fillStyle = '#374151'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('MM', 5, rulerH / 2)

    for (let mm = 0; mm <= 140; mm += 2) {
      const x = 30 + (mm / 140) * (W - 44)
      const tickH = mm % 10 === 0 ? 10 : mm % 5 === 0 ? 6 : 3
      ctx.fillStyle = '#9ca3af'
      ctx.fillRect(x, rulerH - tickH, 1, tickH)
      if (mm % 10 === 0 && mm > 0) {
        ctx.fillStyle = '#6b7280'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(String(mm), x, rulerH / 2 - 2)
      }
    }

    // Design area
    const pad = 10
    const areaY = rulerH + 6
    const areaH = H - areaY - pad
    ctx.drawImage(offscreenRef.current, pad, areaY, W - pad * 2, areaH)

    // Dashed blue border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 3])
    ctx.strokeRect(pad, areaY, W - pad * 2, areaH)
    ctx.setLineDash([])
  }, [])

  // ── Update Three.js texture ────────────────────────────────────────────────
  const updateTexture = useCallback(() => {
    if (threeRef.current.texture) {
      threeRef.current.texture.needsUpdate = true
    }
  }, [])

  // ── Re-render whenever design state changes ────────────────────────────────
  useEffect(() => {
    renderToOffscreen()
    drawEditor()
    updateTexture()
  }, [renderToOffscreen, drawEditor, updateTexture])

  // ── Initialize Three.js (once on mount) ───────────────────────────────────
  useEffect(() => {
    // Create shared offscreen canvas
    const offscreen = document.createElement('canvas')
    offscreen.width  = DESIGN_W
    offscreen.height = DESIGN_H
    offscreenRef.current = offscreen

    // Initial draw
    renderToOffscreen()
    drawEditor()

    const canvas = threeCanvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    const W = container.clientWidth  || 320
    const H = container.clientHeight || 280

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xf3f4f6, 1)

    // Scene & camera
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf3f4f6)
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
    camera.position.set(0, 0.9, 3.8)
    camera.lookAt(0, 0, 0)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.85))
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.3)
    dir1.position.set(4, 6, 5)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.35)
    dir2.position.set(-4, -2, -3)
    scene.add(dir2)

    // Design texture from offscreen canvas
    const texture = new THREE.CanvasTexture(offscreen)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(1, 1)

    // Main cylinder (the ring band)
    const geo = new THREE.CylinderGeometry(1.1, 1.1, 0.7, 80, 1, true)
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.FrontSide,
      roughness: 0.45,
      metalness: 0.05,
    })
    const cylinder = new THREE.Mesh(geo, mat)
    scene.add(cylinder)

    // Caps (solid discs top & bottom)
    const capGeo = new THREE.CircleGeometry(1.1, 64)
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.65 })
    const topCap = new THREE.Mesh(capGeo, capMat)
    topCap.rotation.x = -Math.PI / 2
    topCap.position.y = 0.35
    scene.add(topCap)
    const botCap = new THREE.Mesh(capGeo, capMat)
    botCap.rotation.x = Math.PI / 2
    botCap.position.y = -0.35
    scene.add(botCap)

    // Inner surface (visible through open top/bottom)
    const innerGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.72, 80, 1, true)
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, side: THREE.BackSide })
    scene.add(new THREE.Mesh(innerGeo, innerMat))

    // Store refs
    threeRef.current = { renderer, scene, camera, cylinder, topCap, botCap, texture }

    // Mouse drag to rotate manually
    let prevX = 0
    const onDown = (e) => { draggingRef.current = true; prevX = e.clientX }
    const onMove = (e) => {
      if (!draggingRef.current) return
      const dx = e.clientX - prevX
      cylinder.rotation.y += dx * 0.012
      prevX = e.clientX
    }
    const onUp = () => { draggingRef.current = false }

    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    // Touch support
    const onTouchStart = (e) => { draggingRef.current = true; prevX = e.touches[0].clientX }
    const onTouchMove  = (e) => {
      if (!draggingRef.current) return
      const dx = e.touches[0].clientX - prevX
      cylinder.rotation.y += dx * 0.012
      prevX = e.touches[0].clientX
    }
    const onTouchEnd = () => { draggingRef.current = false }
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: true })
    canvas.addEventListener('touchend',   onTouchEnd)

    // Animation loop
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (autoRotateRef.current && !draggingRef.current) {
        cylinder.rotation.y += 0.007
      }
      renderer.render(scene, camera)
    }
    tick()

    // Resize observer
    const ro = new ResizeObserver(() => {
      const W2 = container.clientWidth
      const H2 = container.clientHeight || 280
      renderer.setSize(W2, H2, false)
      camera.aspect = W2 / H2
      camera.updateProjectionMatrix()
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
      canvas.removeEventListener('touchend',   onTouchEnd)
      ro.disconnect()
      renderer.dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync autoRotate to ref so the animation loop can read it without re-init
  useEffect(() => { autoRotateRef.current = autoRotate }, [autoRotate])

  // ── File upload helpers ────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const img = new Image()
    img.onload = () => setUploadedImage(img)
    img.src = URL.createObjectURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const previewTextStyle = {
    fontFamily: font,
    fontWeight: bold   ? 'bold'   : 'normal',
    fontStyle:  italic ? 'italic' : 'normal',
    fontSize:   `${Math.min(Math.round(fontSize * 0.28), 44)}px`,
    color:      isNegative ? '#fff' : '#000',
  }

  return (
    <section id="design-lab" className="py-24 bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">Interactive</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Design Lab</h2>
          <p className="text-gray-500 mt-2 text-sm">Configure your custom roll and preview it live in 3D.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* ── LEFT: Editor + Controls ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* EDITOR & ANALYSIS */}
            <Panel
              label="EDITOR & ANALYSIS"
              actions={
                <button
                  onClick={() => { setText(''); setUploadedImage(null) }}
                  className="text-[11px] text-red-500 font-bold hover:text-red-400 transition-colors"
                >
                  DELETE ALL
                </button>
              }
            >
              <canvas
                ref={editorCanvasRef}
                width={700}
                height={165}
                className="w-full block"
                style={{ background: '#fff' }}
              />
            </Panel>

            {/* UNWRAPPED PREVIEW */}
            <Panel label="UNWRAPPED PREVIEW">
              <div
                className="overflow-hidden py-3 border-t border-gray-100"
                style={{ background: isNegative ? '#000' : '#fff' }}
              >
                <div className="rolling-text">
                  {Array(8).fill(null).map((_, i) => (
                    <span key={i} className="mx-10 inline-block whitespace-nowrap" style={previewTextStyle}>
                      {text || 'YourTextHere'}
                    </span>
                  ))}
                </div>
              </div>
            </Panel>

            {/* TEXT */}
            <Panel label="TEXT">
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white transition-colors"
                  placeholder="YourTextHere"
                />
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Font selector */}
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 flex-1 min-w-[130px] bg-white outline-none focus:border-blue-400"
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                    ))}
                  </select>

                  {/* Bold */}
                  <button
                    onClick={() => setBold((b) => !b)}
                    className={`w-9 h-9 rounded text-sm border font-bold transition-colors ${
                      bold ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >B</button>

                  {/* Italic */}
                  <button
                    onClick={() => setItalic((i) => !i)}
                    className={`w-9 h-9 rounded text-sm border italic transition-colors ${
                      italic ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >I</button>

                  {/* Font size */}
                  <button
                    onClick={() => setFontSize((s) => Math.max(30, s - 10))}
                    className="w-9 h-9 rounded text-sm border border-gray-300 bg-white text-gray-700 hover:border-blue-400 font-bold transition-colors"
                  >A-</button>
                  <button
                    onClick={() => setFontSize((s) => Math.min(200, s + 10))}
                    className="w-9 h-9 rounded text-sm border border-gray-300 bg-white text-gray-700 hover:border-blue-400 font-bold transition-colors"
                  >A+</button>

                  {/* Scale (repeat) */}
                  <select
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    className="w-14 border border-gray-300 rounded px-1 py-1.5 text-sm text-gray-700 bg-white outline-none focus:border-blue-400"
                  >
                    {['1x', '2x', '3x'].map((s) => <option key={s}>{s}</option>)}
                  </select>

                  {/* Save as object (placeholder) */}
                  <button className="px-3 py-1.5 rounded text-[11px] border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors">
                    ↓ SAVE TEXT AS OBJECT
                  </button>
                </div>
              </div>
            </Panel>

            {/* SETTINGS */}
            <Panel label="SETTINGS">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <ToggleGroup
                  label="RING SIZE (CIRCUMFERENCE)"
                  options={RING_SIZES}
                  value={ringSize}
                  onChange={setRingSize}
                />
                <ToggleGroup
                  label="PRINT MODE"
                  options={['STANDARD', 'NEGATIVE']}
                  value={printMode}
                  onChange={setPrintMode}
                  getActiveClass={(o) =>
                    o === 'NEGATIVE'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-blue-500 text-white border-blue-500'
                  }
                />
                <ToggleGroup
                  label="BRIDGING"
                  options={['OFF', 'LINES', 'UNDERLINE']}
                  value={bridging}
                  onChange={setBridging}
                />
              </div>
            </Panel>

            {/* UPLOAD CUSTOM GRAPHIC */}
            <Panel label="UPLOAD CUSTOM GRAPHIC">
              <div className="p-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-4xl mb-2 select-none">🗂</div>
                  <p className="text-sm text-blue-500 font-medium">Upload image or drag &amp; drop here</p>
                  <p className="text-xs text-gray-400 mt-1">Only Black/White recommended (PNG, JPG)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {uploadedImage && (
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="mt-2 text-xs text-red-500 hover:text-red-400 underline transition-colors"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </Panel>

            {/* STANDARD SHAPES */}
            <Panel label="STANDARD SHAPES">
              <div className="p-4 grid grid-cols-8 gap-2">
                {SHAPES.map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setText((t) => t + shape)}
                    className="aspect-square flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-400 text-gray-700 text-lg transition-colors"
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </Panel>

          </div>

          {/* ── RIGHT: 3D Rendering ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">3D RENDERING</span>
              </div>

              {/* Three.js canvas */}
              <div className="relative bg-gray-100" style={{ height: 300 }}>
                <canvas
                  ref={threeCanvasRef}
                  className="w-full h-full block"
                  style={{ cursor: 'grab' }}
                />
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-400 pointer-events-none select-none">
                  Drag to rotate
                </p>
              </div>

              {/* Auto-rotation toggle */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRotate"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <label htmlFor="autoRotate" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider cursor-pointer select-none">
                  AUTO ROTATION
                </label>
              </div>

              {/* Ring info */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <p className="text-[11px] text-gray-500">
                  Ring: <span className="font-bold text-gray-700">{ringSize}</span> &nbsp;|&nbsp;
                  Mode: <span className="font-bold text-gray-700">{printMode}</span>
                </p>
              </div>

              {/* Add to cart */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={onAddToCart}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors shadow-md"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
