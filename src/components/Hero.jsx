import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from '../icons'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const item = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

export default function Hero({ onJoinWaitlist }) {
  const [imgError, setImgError] = useState(false)

  const userLink    = 'https://photos.google.com/album/AF1QipP3HG_6igBufvLK9z4mqH0zwPXXH_4-XNd60c2C/photo/AF1QipPkHC4J38q40J7zb2oLcegDg8nIev38Rq65e8Gz'
  const fallbackLink = '/product.jpg'

  return (
    <div id="product" className="bg-[#FAFAF8] pt-24 pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top label row ── */}
        <motion.div
          className="flex items-center justify-between border-b border-stone-200 pb-5 mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            Pre-Launch · 2026
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            Made in India
          </p>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-end">

          {/* ── Text column ── */}
          <motion.div
            className="lg:col-span-5 pb-16"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.p variants={item} className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-6">
              The Brander Roller
            </motion.p>

            <motion.h1
              variants={item}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#111111] leading-[0.95] tracking-tight mb-8"
            >
              Brand any<br />
              surface.<br />
              By hand.
            </motion.h1>

            <motion.p variants={item} className="text-base text-stone-500 leading-relaxed max-w-sm mb-10">
              No printer. No minimum order. Load your custom roll and stamp wood,
              concrete, cardboard, metal — anything flat. In seconds.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#111111] hover:bg-[#333] text-white text-sm font-semibold rounded transition-all"
              >
                Join the Waitlist — Free
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <a
                href="#design-lab"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-stone-300 hover:border-stone-400 text-[#111111] text-sm font-semibold rounded transition-all bg-white"
              >
                Design Your Roll →
              </a>
            </motion.div>

            <motion.div variants={item} className="flex items-center gap-2 text-sm text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
              Early bird: <span className="text-[#111111] font-semibold ml-1">RS 1080/-</span>
              <span className="text-stone-300 mx-1">·</span>
              <span>Price increases at launch</span>
            </motion.div>
          </motion.div>

          {/* ── Image column ── */}
          <motion.div
            className="lg:col-span-7 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Product image — extends to viewport edge on large screens */}
            <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-tl-3xl rounded-tr-3xl bg-stone-100">
              <img
                src={imgError ? fallbackLink : userLink}
                onError={() => setImgError(true)}
                alt="Brander Roller"
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay with spec tag */}
              <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-stone-200/80 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Print Width</p>
                <p className="text-sm font-bold text-[#111111]">15 mm · PLA Fiber Body</p>
              </div>
              <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-stone-200/80 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-[#111111]">Pre-Launch Open</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
