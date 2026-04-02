import { useState } from 'react'
import { motion } from 'framer-motion'
import { PenTool } from '../icons'

const surfaces = {
  concrete:  { bg: 'bg-gray-700',    label: 'Concrete Wall', textColor: 'text-red-500'      },
  wood:      { bg: 'bg-amber-900',   label: 'Plywood',       textColor: 'text-amber-100/80' },
  cardboard: { bg: 'bg-orange-200',  label: 'Cardboard Box', textColor: 'text-black/80'     },
  metal:     { bg: 'bg-slate-400',   label: 'Sheet Metal',   textColor: 'text-gray-900'     },
}

export default function PreviewTool() {
  const [text, setText] = useState('BRANDER 15')
  const [surface, setSurface] = useState('concrete')

  const cur = surfaces[surface]
  // Repeat 8× so the rolling animation always has content to show
  const repeated = Array(8).fill(null)

  return (
    <section id="preview" className="py-24 bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          {/* ── Controls ── */}
          <motion.div
            className="lg:col-span-5 mb-12 lg:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Interactive</p>
            <h2 className="text-3xl font-bold text-white mb-4">Design Lab</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Visualize your custom text roll before you buy. Our preview tool simulates the
              Brander output on different materials.
            </p>

            <div className="space-y-6">
              {/* Text input */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Your Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value.toUpperCase())}
                  maxLength={15}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-red-500 rounded-lg px-4 py-3 text-white outline-none transition-colors font-stencil tracking-widest uppercase text-lg"
                  placeholder="ENTER TEXT"
                />
                <p className="text-xs text-gray-600 mt-1.5">Max 15 characters for optimal roll width.</p>
              </div>

              {/* Surface selector */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Surface Material
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(surfaces).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSurface(key)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                        surface === key
                          ? 'bg-red-600/15 border-red-500 text-red-400 shadow-[0_0_12px_rgba(220,38,38,0.2)]'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip box */}
              <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800">
                <div className="flex items-start gap-3">
                  <PenTool className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">Design Tip</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      For continuous "Non-Stop" rolling, avoid spaces. Use symbols like{' '}
                      <span className="text-red-400 font-mono">/</span> or{' '}
                      <span className="text-red-400 font-mono">•</span> to fill gaps and ensure
                      smooth marker pressure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Preview ── */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="lg:sticky lg:top-24">
              <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl flex flex-col aspect-video">
                {/* Title bar */}
                <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800 flex justify-between items-center shrink-0">
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Live Preview: {cur.label}
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/60" />
                  </div>
                </div>

                {/* Surface */}
                <div
                  className={`flex-1 relative overflow-hidden flex items-center transition-colors duration-500 ${cur.bg}`}
                  style={{ touchAction: 'pan-y' }}
                >
                  {/* Texture overlay */}
                  <div
                    className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage:
                        "url(https://www.transparenttextures.com/patterns/concrete-wall.png)",
                    }}
                  />

                  {/* Rolling text */}
                  <div className="w-full overflow-hidden py-8">
                    <div className="rolling-text">
                      {repeated.map((_, i) => (
                        <span
                          key={i}
                          className={`font-stencil text-6xl md:text-8xl font-black tracking-tighter mx-6 whitespace-nowrap ${cur.textColor}`}
                          style={{
                            textShadow:
                              surface === 'concrete' ? '3px 3px 10px rgba(0,0,0,0.5)' : 'none',
                          }}
                        >
                          {text || 'PREVIEW'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-between items-center px-1">
                <div>
                  <p className="text-white text-sm font-semibold">
                    Total Width: <span className="text-red-500 font-bold">15mm</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">Compatible with 15mm Marker</p>
                </div>
                <button className="text-xs text-gray-500 underline hover:text-gray-300 transition-colors">
                  Download SVG Template
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
