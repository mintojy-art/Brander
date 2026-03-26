import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

const FONTS = [
  'Arial', 'Impact', 'Georgia', 'Courier New', 'Verdana',
  'Tahoma', 'Times New Roman', 'Arial Black', 'Trebuchet MS',
]

const SHAPES = ['■', '●', '▲', '▼', '◆', '★', '✓', '♥', '⚙', '✚', '✕', '+', '◉', '↩', '♪', '✂']

// 19 CM is available; others are upon request
const RING_OPTIONS = [
  { label: '10 CM', available: false },
  { label: '19 CM', available: true  },
  { label: '30 CM', available: false },
]

const DESIGN_W = 1024
const DESIGN_H = 220

// ── Divider with red gradient ──────────────────────────────────────────────────
function RedDivider() {
  return (
    <div className="h-px w-full"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.4), transparent)' }} />
  )
}

// ── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-1 h-4 rounded-full bg-red-500 shrink-0" />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{children}</span>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DesignLab({ onAddToCart }) {
  const [text, setText]         = useState('YourTextHere')
  const [font, setFont]         = useState('Arial')
  const [bold, setBold]         = useState(true)
  const [italic, setItalic]     = useState(false)
  const [fontSize, setFontSize] = useState(130)
  const [scale, setScale]       = useState('1x')

  const [ringSize, setRingSize]   = useState('19 CM')
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

  // ── Persist design snapshot to localStorage on every change ────────────────
  useEffect(() => {
    localStorage.setItem('brander_design', JSON.stringify({
      text:          text || '',
      font,
      style:         [bold && 'Bold', italic && 'Italic'].filter(Boolean).join(' + ') || 'Normal',
      scale,
      ringSize,
      printMode,
      bridging,
      hasCustomImage: !!uploadedImage,
    }))
  }, [text, font, bold, italic, scale, ringSize, printMode, bridging, uploadedImage])

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

  // ── Draw 2D editor canvas ──────────────────────────────────────────────────
  const drawEditor = useCallback(() => {
    const canvas = editorCanvasRef.current
    if (!canvas || !offscreenRef.current) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const rulerH = 28
    // Ruler background
    ctx.fillStyle = '#1a1d24'
    ctx.fillRect(0, 0, W, rulerH)

    // MM label
    ctx.fillStyle = '#6b7280'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('MM', 6, rulerH / 2)

    // Ticks
    for (let mm = 0; mm <= 190; mm += 2) {
      const x = 30 + (mm / 190) * (W - 44)
      const tickH = mm % 10 === 0 ? 11 : mm % 5 === 0 ? 6 : 3
      ctx.fillStyle = mm % 10 === 0 ? '#4b5563' : '#374151'
      ctx.fillRect(x, rulerH - tickH, 1, tickH)
      if (mm % 10 === 0 && mm > 0) {
        ctx.fillStyle = '#6b7280'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(String(mm), x, rulerH / 2 - 2)
      }
    }

    // Bottom line of ruler
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(0, rulerH - 1, W, 1)

    // Design area
    const pad = 12, areaY = rulerH + 8, areaH = H - areaY - pad
    // Dark backing so white designs are visible
    ctx.fillStyle = '#0f1012'
    ctx.fillRect(pad, areaY, W - pad * 2, areaH)
    ctx.drawImage(offscreenRef.current, pad, areaY, W - pad * 2, areaH)

    // Red dashed border
    ctx.strokeStyle = 'rgba(220,38,38,0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 4])
    ctx.strokeRect(pad, areaY, W - pad * 2, areaH)
    ctx.setLineDash([])
  }, [])

  const updateTexture = useCallback(() => {
    if (threeRef.current.texture) threeRef.current.texture.needsUpdate = true
  }, [])

  // Save a small JPEG thumbnail of the design to localStorage so the
  // WaitlistSection can include it in the Google Sheets submission
  const saveThumb = useCallback(() => {
    if (!offscreenRef.current) return
    const thumb = document.createElement('canvas')
    thumb.width = 200; thumb.height = 44
    thumb.getContext('2d').drawImage(offscreenRef.current, 0, 0, 200, 44)
    localStorage.setItem('brander_design_preview', thumb.toDataURL('image/jpeg', 0.3))
  }, [])

  useEffect(() => {
    renderToOffscreen(); drawEditor(); updateTexture(); saveThumb()
  }, [renderToOffscreen, drawEditor, updateTexture, saveThumb])

  // ── Initialize Three.js ────────────────────────────────────────────────────
  useEffect(() => {
    const offscreen = document.createElement('canvas')
    offscreen.width = DESIGN_W; offscreen.height = DESIGN_H
    offscreenRef.current = offscreen
    renderToOffscreen(); drawEditor()

    const canvas = threeCanvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    const W = container.clientWidth || 320
    const H = container.clientHeight || 340

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0d0f14)

    // Subtle fog for depth
    scene.fog = new THREE.Fog(0x0d0f14, 8, 18)

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100)
    camera.position.set(0, 1.1, 4.2)
    camera.lookAt(0, 0, 0)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const key = new THREE.DirectionalLight(0xfff0f0, 1.4)
    key.position.set(5, 7, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.4)
    fill.position.set(-4, -2, -2)
    scene.add(fill)
    const redPoint = new THREE.PointLight(0xdc2626, 1.2, 7)
    redPoint.position.set(0, -2.5, 2.5)
    scene.add(redPoint)
    const rimLight = new THREE.PointLight(0xff4444, 0.5, 6)
    rimLight.position.set(-3, 2, -2)
    scene.add(rimLight)

    const texture = new THREE.CanvasTexture(offscreen)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping

    // Cylinder
    const geo = new THREE.CylinderGeometry(1.1, 1.1, 0.7, 96, 1, true)
    const mat = new THREE.MeshStandardMaterial({
      map: texture, side: THREE.FrontSide, roughness: 0.35, metalness: 0.1,
    })
    const cylinder = new THREE.Mesh(geo, mat)
    scene.add(cylinder)

    // Caps
    const capGeo = new THREE.CircleGeometry(1.1, 64)
    const capMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.55, metalness: 0.2 })
    const topCap = new THREE.Mesh(capGeo, capMat)
    topCap.rotation.x = -Math.PI / 2; topCap.position.y = 0.35
    scene.add(topCap)
    const botCap = new THREE.Mesh(capGeo, capMat)
    botCap.rotation.x = Math.PI / 2; botCap.position.y = -0.35
    scene.add(botCap)

    // Inner
    const innerGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.72, 80, 1, true)
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, side: THREE.BackSide })
    scene.add(new THREE.Mesh(innerGeo, innerMat))

    threeRef.current = { renderer, scene, camera, cylinder, texture }

    // Ground reflection plane (subtle)
    const planeGeo = new THREE.PlaneGeometry(6, 6)
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x0d0f14, roughness: 1, metalness: 0,
      transparent: true, opacity: 0.6,
    })
    const plane = new THREE.Mesh(planeGeo, planeMat)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -0.8
    scene.add(plane)

    // Drag to rotate
    let prevX = 0
    const onDown = (e) => { draggingRef.current = true; prevX = e.clientX; canvas.style.cursor = 'grabbing' }
    const onMove = (e) => {
      if (!draggingRef.current) return
      cylinder.rotation.y += (e.clientX - prevX) * 0.012; prevX = e.clientX
    }
    const onUp = () => { draggingRef.current = false; canvas.style.cursor = 'grab' }
    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    const onTS = (e) => { draggingRef.current = true; prevX = e.touches[0].clientX }
    const onTM = (e) => {
      if (!draggingRef.current) return
      cylinder.rotation.y += (e.touches[0].clientX - prevX) * 0.012; prevX = e.touches[0].clientX
    }
    const onTE = () => { draggingRef.current = false }
    canvas.addEventListener('touchstart', onTS, { passive: true })
    canvas.addEventListener('touchmove',  onTM, { passive: true })
    canvas.addEventListener('touchend',   onTE)

    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (autoRotateRef.current && !draggingRef.current) cylinder.rotation.y += 0.006
      renderer.render(scene, camera)
    }
    tick()

    const ro = new ResizeObserver(() => {
      const W2 = container.clientWidth, H2 = container.clientHeight || 340
      renderer.setSize(W2, H2, false); camera.aspect = W2 / H2; camera.updateProjectionMatrix()
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
      ro.disconnect(); renderer.dispose()
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

  return (
    <section
      id="design-lab"
      className="py-28 border-t border-gray-900 overflow-hidden relative"
      style={{ background: 'linear-gradient(180deg, #0a0a0c 0%, #0d0f14 60%, #0a0a0c 100%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,38,38,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/20 border border-red-500/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Interactive Design Lab</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Design Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-600">
              Custom Roll
            </span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Build your stamp pattern in real time. Every change reflects instantly on the live 3D preview.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── LEFT: Editor + Controls (3 cols) ── */}
          <motion.div
            className="lg:col-span-3 space-y-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >

            {/* EDITOR CANVAS */}
            <div
              className="rounded-2xl overflow-hidden border border-gray-800/80"
              style={{ background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)' }}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.18em]">Editor & Analysis</span>
                </div>
                <button
                  onClick={() => { setText(''); setUploadedImage(null) }}
                  className="text-[10px] font-bold text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors px-2 py-1 rounded border border-transparent hover:border-red-800/50"
                >
                  Clear All
                </button>
              </div>
              <canvas
                ref={editorCanvasRef}
                width={700}
                height={170}
                className="w-full block"
                style={{ background: '#0d0f14' }}
              />
            </div>

            {/* UNWRAPPED PREVIEW */}
            <div className="rounded-2xl overflow-hidden border border-gray-800/80"
              style={{ background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)' }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800/60">
                <span className="w-2 h-2 rounded-full bg-gray-600" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.18em]">Unwrapped Preview</span>
              </div>
              <div className="overflow-hidden py-4" style={{ background: isNegative ? '#000' : '#fff' }}>
                <div className="rolling-text">
                  {Array(8).fill(null).map((_, i) => (
                    <span key={i} className="mx-10 inline-block whitespace-nowrap" style={previewTextStyle}>
                      {text || 'YourTextHere'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTROLS CARD */}
            <div
              className="rounded-2xl border border-gray-800/80 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)' }}
            >
              <div className="p-6 space-y-7">

                {/* TEXT */}
                <div>
                  <SectionLabel>Text & Typography</SectionLabel>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full bg-black/40 border border-gray-700/60 hover:border-gray-600 focus:border-red-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition-colors placeholder-gray-600"
                      placeholder="Enter your text…"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        value={font}
                        onChange={(e) => setFont(e.target.value)}
                        className="flex-1 min-w-[130px] bg-black/40 border border-gray-700/60 hover:border-gray-600 focus:border-red-500 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none transition-colors"
                      >
                        {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                      </select>

                      {/* Bold */}
                      <button
                        onClick={() => setBold((b) => !b)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold border transition-all ${
                          bold
                            ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                            : 'bg-black/40 border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >B</button>

                      {/* Italic */}
                      <button
                        onClick={() => setItalic((i) => !i)}
                        className={`w-9 h-9 rounded-lg text-sm italic border transition-all ${
                          italic
                            ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                            : 'bg-black/40 border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >I</button>

                      {/* Size */}
                      <button
                        onClick={() => setFontSize((s) => Math.max(30, s - 10))}
                        className="w-9 h-9 rounded-lg text-sm font-bold border border-gray-700/60 bg-black/40 text-gray-400 hover:border-gray-500 hover:text-white transition-all"
                      >A-</button>
                      <button
                        onClick={() => setFontSize((s) => Math.min(200, s + 10))}
                        className="w-9 h-9 rounded-lg text-sm font-bold border border-gray-700/60 bg-black/40 text-gray-400 hover:border-gray-500 hover:text-white transition-all"
                      >A+</button>

                      {/* Scale */}
                      <select
                        value={scale}
                        onChange={(e) => setScale(e.target.value)}
                        className="w-16 bg-black/40 border border-gray-700/60 hover:border-gray-600 text-gray-300 text-sm rounded-lg px-2 py-2 outline-none transition-colors"
                      >
                        {['1x', '2x', '3x'].map((s) => <option key={s}>{s}</option>)}
                      </select>

                      <button className="px-3 py-2 rounded-lg text-[11px] border border-gray-700/60 bg-black/40 text-gray-500 hover:text-gray-300 hover:border-gray-600 whitespace-nowrap transition-all">
                        ↓ Save Object
                      </button>
                    </div>
                  </div>
                </div>

                <RedDivider />

                {/* SETTINGS */}
                <div>
                  <SectionLabel>Configuration</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Ring Size */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
                        Ring Circumference
                      </p>
                      <div className="flex gap-2">
                        {RING_OPTIONS.map(({ label, available }) => (
                          <button
                            key={label}
                            onClick={() => available && setRingSize(label)}
                            title={!available ? 'Available upon request' : undefined}
                            className={`flex-1 py-2.5 rounded-lg border text-[11px] font-bold transition-all relative ${
                              !available
                                ? 'bg-transparent border-gray-800 text-gray-700 cursor-not-allowed'
                                : ringSize === label
                                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                                  : 'bg-black/40 border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-white cursor-pointer'
                            }`}
                          >
                            {label}
                            {!available && (
                              <span className="block text-[9px] font-normal text-gray-700 mt-0.5 leading-none">
                                on request
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Print Mode */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
                        Print Mode
                      </p>
                      <div className="flex gap-2">
                        {['STANDARD', 'NEGATIVE'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setPrintMode(mode)}
                            className={`flex-1 py-2.5 rounded-lg border text-[11px] font-bold transition-all ${
                              printMode === mode
                                ? mode === 'NEGATIVE'
                                  ? 'bg-white border-white text-gray-900'
                                  : 'bg-red-600 border-red-500 text-white shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                                : 'bg-black/40 border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-white'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Bridging */}
                  <div className="mt-5">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Bridging</p>
                    <div className="flex gap-2">
                      {['OFF', 'LINES', 'UNDERLINE'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setBridging(mode)}
                          className={`flex-1 py-2.5 rounded-lg border text-[11px] font-bold transition-all ${
                            bridging === mode
                              ? 'bg-red-600 border-red-500 text-white shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                              : 'bg-black/40 border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <RedDivider />

                {/* UPLOAD */}
                <div>
                  <SectionLabel>Custom Graphic</SectionLabel>
                  <div
                    className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-red-500/70 bg-red-900/10'
                        : 'border-gray-700/60 bg-black/20 hover:border-red-500/30 hover:bg-red-900/5'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-3xl mb-2 select-none opacity-70">🗂</div>
                    <p className="text-sm text-gray-400 font-medium">
                      Drag &amp; drop or <span className="text-red-400">browse file</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">PNG / JPG — Black &amp; White recommended</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])} />
                  {uploadedImage && (
                    <button onClick={() => setUploadedImage(null)}
                      className="mt-2 text-xs text-red-500 hover:text-red-400 underline transition-colors">
                      Remove image
                    </button>
                  )}
                </div>

                <RedDivider />

                {/* SHAPES */}
                <div>
                  <SectionLabel>Standard Shapes</SectionLabel>
                  <div className="grid grid-cols-8 gap-1.5">
                    {SHAPES.map((shape) => (
                      <button
                        key={shape}
                        onClick={() => setText((t) => t + shape)}
                        className="aspect-square flex items-center justify-center rounded-lg border border-gray-800 bg-black/30 hover:bg-red-900/25 hover:border-red-500/50 text-gray-500 hover:text-white text-base transition-all"
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: 3D Rendering (2 cols) ── */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="sticky top-24 rounded-2xl border border-gray-800/80 overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #111318 0%, #0d0f14 100%)' }}>

              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-800/60">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.18em]">Live 3D Preview</span>
              </div>

              {/* Canvas */}
              <div className="relative" style={{ height: 340 }}>
                <canvas
                  ref={threeCanvasRef}
                  className="w-full h-full block"
                  style={{ cursor: 'grab' }}
                />
                {/* Drag hint */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                  <span className="text-[10px] text-gray-700 bg-black/40 px-3 py-1 rounded-full border border-gray-800/50">
                    ⟵ drag to rotate ⟶
                  </span>
                </div>
              </div>

              {/* Auto-rotate */}
              <div className="px-5 py-3 border-t border-gray-800/60 flex items-center justify-between">
                <label htmlFor="autoRotate" className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setAutoRotate((r) => !r)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${autoRotate ? 'bg-red-600' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoRotate ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Auto Rotation</span>
                </label>
              </div>

              {/* Ring info strip */}
              <div className="px-5 py-3 border-t border-gray-800/60 bg-black/20 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Circumference</p>
                  <p className="text-sm font-bold text-white">{ringSize}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Mode</p>
                  <p className="text-sm font-bold text-white">{printMode}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Text Length</p>
                  <p className="text-sm font-bold text-red-400">30 cm</p>
                </div>
              </div>

              {/* CTA */}
              <div className="p-5 border-t border-gray-800/60">
                <button
                  onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group w-full py-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_24px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.55)] flex items-center justify-center gap-2"
                >
                  Join the Waitlist — Free
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
                </button>
                <p className="text-center text-[10px] text-gray-600 mt-3">
                  Lock in your early bird price today
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
