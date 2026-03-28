import { motion } from 'framer-motion'

export default function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      className="group p-8 bg-white border border-stone-200 rounded-2xl cursor-default hover:border-stone-300 hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: 'easeOut' }}
    >
      {/* Icon */}
      <div className="w-11 h-11 bg-stone-100 group-hover:bg-[#111111] rounded-xl flex items-center justify-center mb-6 transition-all duration-300">
        <Icon className="text-stone-600 group-hover:text-white transition-colors duration-300" size={20} />
      </div>

      <h3 className="text-lg font-bold text-[#111111] mb-3 leading-snug">{title}</h3>
      <p className="text-stone-500 leading-relaxed text-sm">{description}</p>

      {/* Bottom accent line */}
      <div className="mt-6 w-8 h-px bg-stone-200 group-hover:bg-[#111111] group-hover:w-12 transition-all duration-300" />
    </motion.div>
  )
}
