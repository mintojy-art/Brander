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

// ── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({ label, children, actions }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-3">
          {actions}
          <span className="text-red-500 text-xs select-none">▲</span>
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Toggle button group ───────────────────────────────────────────────────────
function ToggleGroup({ label, options, value, onChange, getActiveClass }) {
  const defaultActive = 'bg-red-600 text-white border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.35)]'
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
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
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
  const [text, setText]         = useState('YourTextHere')
  const [font, setFont]         = useState('Arial')
  const [bold, setBold]         = useState(true)
  const [italic, setItalic]     = useState(false)
  const [fontSize, setFontSize] = useState(130)
  const [scale, setScale]       = useState('1x')

  const [ringSize, setRingSize]   = useState('10 CM')
  const [printMode, setPrintMode] = useState('STANDARD')
  const [bridging, setBridging]   = useState('OFF')

  const [uploadedImage, setUploadedImage] = useState(null)
  const [isDragging, setIsDragging]       = useState(false)
  const [autoRotate, setAutoRotate]       = useState(true)

  const editorCanvasRef = useRef(null)
  const threeCanvasRef  = useRef(null)
  const offscreenRef    = useRef(null)
  const threeRef        = useRef({})
  const autoRotateRef   = useRef(true)
  const fileInputRef    = useRef(null)
  const draggingRef     = useRef(false)

  const isNegative = printMode === 'NEGATIVE'

  // ── Render design to shared offscreen canvas ────────────────────────────────
  const renderToOffscreen = useCallback(() => {
    const canvas = offscreenRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = DESIGN_W, H = DESIGN_H

    ctx.fillStyle = isNegative ? '#000' : '#fff'
    ctx.fillRect(0, 0, W, H)

    const lineColor = isNegative ? '#fff' : '#000'
    if (bridging === 'LINES') {
      ctx.strokeStyle = lineColor; ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(0, 3);      ctx.lineTo(W, 3)
      ctx.moveTo(0, H - 3); ctx.lineTo(W, H - 3)
      ctx.stroke()
    } else if (bridging === 'UNDERLINE') {
      ctx.strokeStyle = lineColor; ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(0, H - 14); ctx.lineTo(W, H - 14)
      ctx.stroke()
    }

    if (uploadedImage) {
      const aspect = uploadedImage.width / uploadedImage.height
      const drawH = H - 20, drawW = drawH * aspect
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
        let x = 20
        while (x < W) { ctx.fillText(displayText, x, H / 2); x += measured + 40 }
      } else {
        ctx.fillText(displayText, measured < W - 40 ? (W - measured) / 2 : 20, H / 2)
      }
    }
  }, [text, font, bold, italic, fontSize, scale, isNegative, bridging, uploadedImage])

  // ── Draw 2D editor canvas (ruler + design preview) ─────────────────────────
  const drawEditor = useCallback(() => {
    const canvas = editorCanvasRef.current
    if (!canvas || !offscreenRef.current) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Ruler — dark themed
    const rulerH = 26
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, W, rulerH)
    ctx.fillStyle = '#9ca3af'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('MM', 5, rulerH / 2)

    for (let mm = 0; mm <= 140; mm += 2) {
      const x = 30 + (mm / 140) * (W - 44)
      const tickH = mm % 10 === 0 ? 10 : mm % 5 === 0 ? 6 : 3
      ctx.fillStyle = '#4b5563'
      ctx.fillRect(x, rulerH - tickH, 1, tickH)
      if (mm % 10 === 0 && mm > 0) {
        ctx.fillStyle = '#6b7280'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(String(mm), x, rulerH / 2 - 2)
      }
    }

    // Design area
    const pad = 10, areaY = rulerH + 6, areaH = H - areaY - pad
    ctx.drawImage(offscreenRef.current, pad, areaY, W - pad * 2, areaH)

    // Red dashed border (brand color)
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 3])
    ctx.strokeRect(pad, areaY, W - pad * 2, areaH)
    ctx.setLineDash([])
  }, [])

  const updateTexture = useCallback(() => {
    if (threeRef.current.texture) threeRef.current.texture.needsUpdate = true
  }, [])

  useEffect(() => {
    renderToOffscreen()
    drawEditor()
    updateTexture()
  }, [renderToOffscreen, drawEditor, updateTexture])

  // ── Initialize Three.js (once) ─────────────────────────────────────────────
  useEffect(() => {
    const offscreen = document.createElement('canvas')
    offscreen.width = DESIGN_W; offscreen.height = DESIGN_H
    offscreenRef.current = offscreen
    renderToOffscreen()
    drawEditor()

    const canvas = threeCanvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    const W = container.clientWidth || 320
    const H = container.clientHeight || 300

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    // Dark background matching site theme
    scene.background = new THREE.Color(0x111318)

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
    camera.position.set(0, 0.9, 3.8)
    camera.lookAt(0, 0, 0)

    // Lights — warm red tint on key light to match brand
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir1 = new THREE.DirectionalLight(0xff8888, 1.1)
    dir1.position.set(4, 6, 5)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.5)
    dir2.position.set(-4, -2, -3)
    scene.add(dir2)

    // Subtle red point light from below for glow effect
    const redPoint = new THREE.PointLight(0xdc2626, 0.6, 8)
    redPoint.position.set(0, -2, 2)
    scene.add(redPoint)

    const texture = new THREE.CanvasTexture(offscreen)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping

    const geo = new THREE.CylinderGeometry(1.1, 1.1, 0.7, 80, 1, true)
    const mat = new THREE.MeshStandardMaterial({
      map: texture, side: THREE.FrontSide, roughness: 0.4, metalness: 0.08,
    })
    const cylinder = new THREE.Mesh(geo, mat)
    scene.add(cylinder)

    const capGeo = new THREE.CircleGeometry(1.1, 64)
    const capMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6 })
    const topCap = new THREE.Mesh(capGeo, capMat)
    topCap.rotation.x = -Math.PI / 2; topCap.position.y = 0.35
    scene.add(topCap)
    const botCap = new THREE.Mesh(capGeo, capMat)
    botCap.rotation.x = Math.PI / 2; botCap.position.y = -0.35
    scene.add(botCap)

    const innerGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.72, 80, 1, true)
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, side: THREE.BackSide })
    scene.add(new THREE.Mesh(innerGeo, innerMat))

    threeRef.current = { renderer, scene, camera, cylinder, texture }

    let prevX = 0
    const onDown = (e) => { draggingRef.current = true; prevX = e.clientX }
    const onMove = (e) => {
      if (!draggingRef.current) return
      cylinder.rotation.y += (e.clientX - prevX) * 0.012
      prevX = e.clientX
    }
    const onUp = () => { draggingRef.current = false }
    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    const onTS = (e) => { draggingRef.current = true; prevX = e.touches[0].clientX }
    const onTM = (e) => {
      if (!draggingRef.current) return
      cylinder.rotation.y += (e.touches[0].clientX - prevX) * 0.012
      prevX = e.touches[0].clientX
    }
    const onTE = () => { draggingRef.current = false }
    canvas.addEventListener('touchstart', onTS, { passive: true })
    canvas.addEventListener('touchmove',  onTM, { passive: true })
    canvas.addEventListener('touchend',   onTE)

    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (autoRotateRef.current && !draggingRef.current) cylinder.rotation.y += 0.007
      renderer.render(scene, camera)
    }
    tick()

    const ro = new ResizeObserver(() => {
      const W2 = container.clientWidth, H2 = container.clientHeight || 300
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
      canvas.removeEventListener('touchstart', onTS)
      canvas.removeEventListener('touchmove',  onTM)
      canvas.removeEventListener('touchend',   onTE)
      ro.disconnect()
      renderer.dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { autoRotateRef.current = autoRotate }, [autoRotate])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const img = new Image()
    img.onload = () => setUploadedImage(img)
    img.src = URL.createObjectURL(file)
  }

  const previewTextStyle = {
    fontFamily: font,
    fontWeight: bold   ? 'bold'   : 'normal',
    fontStyle:  italic ? 'italic' : 'normal',
    fontSize:   `${Math.min(Math.round(fontSize * 0.28), 44)}px`,
    color:      isNegative ? '#fff' : '#000',
  }

  // Shared dark input / select class
  const inputCls = 'bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors'
  const btnBase  = 'w-9 h-9 rounded text-sm border transition-colors font-bold'
  const btnOff   = `${btnBase} bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white`
  const btnOn    = `${btnBase} bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]`

  return (
    <section id="design-lab" className="py-24 bg-[#0a0a0c] border-t border-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Interactive</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Design Lab</h2>
          <p className="text-gray-400 text-sm">Configure your custom roll and preview it live in 3D.</p>
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
                  className="text-[11px] text-red-500 font-bold hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                  Delete All
                </button>
              }
            >
              <canvas
                ref={editorCanvasRef}
                width={700}
                height={165}
                className="w-full block"
                style={{ background: '#111318' }}
              />
            </Panel>

            {/* UNWRAPPED PREVIEW */}
            <Panel label="UNWRAPPED PREVIEW">
              <div
                className="overflow-hidden py-3 border-t border-gray-800"
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
                  className={`w-full ${inputCls}`}
                  placeholder="YourTextHere"
                />
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className={`flex-1 min-w-[130px] ${inputCls}`}
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                    ))}
                  </select>

                  <button onClick={() => setBold((b) => !b)}   className={bold   ? btnOn : btnOff}>B</button>
                  <button onClick={() => setItalic((i) => !i)} className={`${italic ? btnOn : btnOff} italic`}>I</button>
                  <button onClick={() => setFontSize((s) => Math.max(30, s - 10))}  className={btnOff}>A-</button>
                  <button onClick={() => setFontSize((s) => Math.min(200, s + 10))} className={btnOff}>A+</button>

                  <select
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    className={`w-16 ${inputCls}`}
                  >
                    {['1x', '2x', '3x'].map((s) => <option key={s}>{s}</option>)}
                  </select>

                  <button className="px-3 py-2 rounded text-[11px] border border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-500 whitespace-nowrap transition-colors">
                    ↓ Save Text as Object
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
                      ? 'bg-white text-gray-900 border-white'
                      : 'bg-red-600 text-white border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.35)]'
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
                    isDragging
                      ? 'border-red-500 bg-red-900/10'
                      : 'border-gray-700 bg-gray-800/40 hover:border-red-500/50 hover:bg-red-900/5'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-4xl mb-2 select-none">🗂</div>
                  <p className="text-sm text-red-400 font-medium">Upload image or drag &amp; drop here</p>
                  <p className="text-xs text-gray-500 mt-1">Only Black/White recommended (PNG, JPG)</p>
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
                    className="aspect-square flex items-center justify-center rounded border border-gray-700 bg-gray-800 hover:bg-red-900/30 hover:border-red-500/60 text-gray-300 hover:text-white text-lg transition-colors"
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </Panel>

          </div>

          {/* ── RIGHT: 3D Rendering ── */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden sticky top-24">
              <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">3D RENDERING</span>
              </div>

              {/* Three.js canvas */}
              <div className="relative" style={{ height: 300, background: '#111318' }}>
                <canvas
                  ref={threeCanvasRef}
                  className="w-full h-full block"
                  style={{ cursor: 'grab' }}
                />
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-600 pointer-events-none select-none">
                  Drag to rotate
                </p>
              </div>

              {/* Auto-rotation toggle */}
              <div className="px-4 py-3 border-t border-gray-800 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRotate"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="w-4 h-4 accent-red-500 cursor-pointer"
                />
                <label htmlFor="autoRotate" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none">
                  AUTO ROTATION
                </label>
              </div>

              {/* Ring info */}
              <div className="px-4 py-2 border-t border-gray-800 bg-gray-950">
                <p className="text-[11px] text-gray-600">
                  Ring: <span className="font-bold text-gray-300">{ringSize}</span>
                  &nbsp;|&nbsp;
                  Mode: <span className="font-bold text-gray-300">{printMode}</span>
                </p>
              </div>

              {/* Add to cart */}
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={onAddToCart}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm rounded-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
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
