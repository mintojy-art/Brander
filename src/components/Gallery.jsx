import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

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

function ParallaxCard({ img, i }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <motion.div
      ref={ref}
      className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100 cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
    >
      <motion.img
        src={img.url}
        alt={img.caption}
        style={{ y: imgY }}
        className="absolute inset-0 w-full h-[115%] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 will-change-transform"
      />
      {/* Caption overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div>
          <div className="w-4 h-px bg-white mb-2" />
          <p className="text-white text-sm font-semibold">{img.caption}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Gallery() {
  return (
    <section id="gallery" className="py-28 bg-[#F5F2EE] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-4">Community</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111111] leading-tight">
              Brander<br />in action.
            </h2>
          </motion.div>
          <motion.p
            className="text-stone-400 text-sm max-w-xs"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Field tests and community submissions.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <ParallaxCard key={i} img={img} i={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
