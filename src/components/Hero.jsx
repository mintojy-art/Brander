import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Youtube } from '../icons'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}
const item = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const tags = ['PLA Fiber Body', 'Works on Concrete', 'Rapid Swap System']

export default function Hero({ onAddToCart }) {
  const [imgError, setImgError] = useState(false)

  // ── Parallax transforms (all driven by global scrollY) ──────────────────
  const { scrollY } = useScroll()
  //  background grid  → moves DOWN (+) so it "lags" behind scroll = depth layer
  const bgGridY = useTransform(scrollY, [0, 800], [0, 200])
  //  glow blob        → slightly faster than grid
  const glowY   = useTransform(scrollY, [0, 800], [0, 160])
  //  decorative rings → even slightly faster
  const ringsY  = useTransform(scrollY, [0, 800], [0, 100])
  //  product image    → moves UP (−) faster than page = "pops forward"
  const imageY  = useTransform(scrollY, [0, 800], [0, -90])

  const userLink =
    'https://photos.google.com/album/AF1QipP3HG_6igBufvLK9z4mqH0zwPXXH_4-XNd60c2C/photo/AF1QipPkHC4J38q40J7zb2oLcegDg8nIev38Rq65e8Gz'
  const fallbackLink = '/product.jpg'

  return (
    <div id="product" className="relative pt-20 pb-16 md:pt-32 md:pb-28 overflow-hidden">

      {/* Layer 1 – slowest: background grid */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: bgGridY,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Layer 2 – static radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #0f1012 80%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

          {/* ── Text column – normal scroll speed ── */}
          <motion.div
            className="lg:col-span-6"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/30 border border-red-500/30 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-semibold tracking-widest uppercase text-xs">
                Pre-Launch Version Available
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none mb-6"
            >
              BRANDER
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-700">
                15
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-lg text-gray-400 leading-relaxed max-w-lg">
              Record-breaking 15mm print width. The ultimate handheld tool for large-scale
              industrial marking, logos, and striking designs on any surface.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onAddToCart}
                className="group px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.7)] flex items-center justify-center gap-2"
              >
                Pre-Order Now — RS 1080/-
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>
              <a
                href="#video"
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Watch Demo <Youtube size={18} />
              </a>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500"
            >
              {tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {tag}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Image column – multi-layer parallax ── */}
          <div className="lg:col-span-6 mt-16 lg:mt-0 relative flex justify-center">

            {/* Layer 3 – glow blob, moves with parallax */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ y: glowY }}
            >
              <div className="w-[480px] h-[480px] bg-red-600/10 rounded-full blur-3xl glow-pulse" />
            </motion.div>

            {/* Layer 4 – decorative rings, slightly faster than glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ y: ringsY }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-red-500/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] border border-red-500/10 rounded-full" />
            </motion.div>

            {/* Layer 5 – product card, fastest (pops forward) */}
            <motion.div
              className="relative z-10 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.25, ease: 'easeOut' }}
              style={{ y: imageY }}
            >
              {/* float-animation bobbing is on inner div so it composes with the parallax */}
              <div className="float-animation">
                <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden group cursor-pointer carbon-pattern glow-pulse">
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-gray-300 border border-gray-700 z-20 font-mono">
                    58mm × 116mm Print Area
                  </div>
                  <img
                    src={imgError ? fallbackLink : userLink}
                    onError={() => setImgError(true)}
                    alt="Brander 15"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent p-6 text-center z-20">
                    <p className="text-gray-300 font-mono text-sm tracking-widest uppercase">
                      Industrial Grade // PLA Fiber
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
