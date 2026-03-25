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
    <section id="features" className="py-24 bg-[#0f1012]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Why Brander</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">Engineered for Extremes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            The Brander Roller isn't just a marker—it's a precision instrument designed for
            workshops, construction sites, and urban artists.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
