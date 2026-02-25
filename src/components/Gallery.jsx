import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from '../icons'

const images = [
  {
    url: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?auto=format&fit=crop&w=600&q=80',
    caption: 'Warehouse Marking',
  },
  {
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    caption: 'Industrial Design',
  },
  {
    url: 'https://images.unsplash.com/photo-1565610222536-ef125c59da3c?auto=format&fit=crop&w=600&q=80',
    caption: 'Urban Art',
  },
  {
    url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
    caption: 'Precision Tooling',
  },
]

// Each card gets its own scroll-tracked inner image parallax
function ParallaxCard({ img, i }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Image slides from +8% (entering from below) to -8% (exiting above)
  // The image is h-[120%] so there's always room to move without gaps
  const imgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])

  return (
    <motion.div
      ref={ref}
      className="group relative aspect-square overflow-hidden rounded-xl bg-gray-900 cursor-pointer"
      initial={{ opacity: 0, scale: 0.88 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Image is taller than container so parallax never shows empty space */}
      <motion.img
        src={img.url}
        alt={img.caption}
        style={{ y: imgY }}
        className="absolute inset-0 w-full h-[120%] object-cover opacity-65 group-hover:opacity-100 transition-opacity duration-700 will-change-transform"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div>
          <div className="w-5 h-0.5 bg-red-500 mb-2" />
          <p className="text-white text-sm font-semibold">{img.caption}</p>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-2.5 right-2.5 w-0 h-0 group-hover:w-7 group-hover:h-7 transition-all duration-300 border-t-2 border-r-2 border-red-500/80 rounded-tr pointer-events-none" />
    </motion.div>
  )
}

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 bg-[#0a0a0c] border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">Community</p>
            <h2 className="text-3xl font-bold text-white mb-1">Brander in action</h2>
            <p className="text-gray-400 text-sm">Community submissions and field tests.</p>
          </motion.div>

          <motion.a
            href="#contact"
            className="hidden md:flex items-center gap-2 text-red-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider group"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Submit Yours
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <ParallaxCard key={i} img={img} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
