import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function VideoSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Heading drifts up slightly as section scrolls into / out of view
  const headingY = useTransform(scrollYProgress, [0, 1], [40, -40])
  // Video container has a subtler drift for depth
  const videoY   = useTransform(scrollYProgress, [0, 1], [25, -25])

  return (
    <section
      ref={sectionRef}
      id="video"
      className="py-24 bg-[#0a0a0c] border-b border-gray-900 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4">

        {/* Heading – parallax layer */}
        <motion.div
          className="text-center mb-12"
          style={{ y: headingY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">In Action</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">See It In Action</h2>
          <p className="text-gray-400">High-speed application on vertical surfaces.</p>
        </motion.div>

        {/* Video – parallax layer */}
        <motion.div
          className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_60px_rgba(220,38,38,0.08)]"
          style={{ y: videoY }}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/lzlw8EM95Bo?autoplay=1&mute=1&loop=1&playlist=lzlw8EM95Bo"
            title="Brander 15mm Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Four corner accents */}
          {[
            'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
            'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
            'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
            'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-14 h-14 border-red-600/60 pointer-events-none ${cls}`}
            />
          ))}
        </motion.div>

      </div>
    </section>
  )
}
