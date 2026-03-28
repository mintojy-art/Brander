import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function VideoSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const headingY = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <section
      ref={sectionRef}
      id="video"
      className="py-28 bg-[#FAFAF8] border-b border-stone-200 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4">

        <motion.div
          className="mb-14"
          style={{ y: headingY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-4">In Action</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#111111] leading-tight">See It Roll.</h2>
          <p className="text-stone-500 mt-2 text-base">High-speed application on vertical surfaces.</p>
        </motion.div>

        <motion.div
          className="relative aspect-video w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-sm"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/lzlw8EM95Bo?autoplay=1&mute=1&loop=1&playlist=lzlw8EM95Bo"
            title="Brander Roller Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>

      </div>
    </section>
  )
}
