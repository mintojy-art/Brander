import { motion } from 'framer-motion'
import FeatureCard from './FeatureCard'
import { Box, Layers, Zap } from '../icons'

const features = [
  {
    icon: Box,
    title: 'Massive Print Area',
    description:
      'With a 58 × 116 mm print area, get your statement across clearly. Perfect for large-scale lettering, box labeling, and striking wall designs.',
  },
  {
    icon: Layers,
    title: 'Multi-Surface Mastery',
    description:
      'Works reliably on wood, glass, cardboard, concrete, metal, and plastic. The specialized ink transfer system handles porous and smooth surfaces alike.',
  },
  {
    icon: Zap,
    title: 'Rapid Swap System',
    description:
      'Switch between markers and text scrolls in seconds. Use the 15mm Marker or fill your own empty markers for custom colors.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-28 bg-[#F5F2EE] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-4">Why Brander</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111111] leading-tight">
              Engineered<br />for Extremes.
            </h2>
          </motion.div>
          <motion.p
            className="text-stone-500 max-w-xs text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The Brander Roller isn't just a marker — it's a precision instrument designed for
            workshops, construction sites, and urban artists.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
