import { motion } from 'framer-motion'

export default function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      className="relative bg-gray-900/50 border border-gray-800 p-8 rounded-2xl group cursor-default overflow-hidden"
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.15, duration: 0.65, ease: 'easeOut' }}
      whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(220,38,38,0.12)' }}
    >
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl border border-red-500/0 group-hover:border-red-500/40 transition-all duration-400 pointer-events-none" />

      {/* Icon */}
      <div className="w-12 h-12 bg-gray-800 group-hover:bg-red-600 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 shadow-md group-hover:shadow-[0_0_24px_rgba(220,38,38,0.5)]">
        <Icon className="text-white" size={22} />
      </div>

      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>

      {/* Decorative bottom-right corner mark */}
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gray-700 group-hover:border-red-500/50 transition-colors duration-300 rounded-br-md" />
    </motion.div>
  )
}
