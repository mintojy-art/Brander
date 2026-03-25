import { motion } from 'framer-motion'

const audiences = [
  {
    icon: '🏭',
    title: 'Manufacturers & Workshops',
    description:
      'Mark batches, parts, crates, and tools with your brand or lot number — fast, consistent, no ink pad setup.',
    tags: ['Batch marking', 'Part labelling', 'QC stamps'],
  },
  {
    icon: '📦',
    title: 'Small Businesses & Packagers',
    description:
      'Brand your packaging, boxes, and mailers by hand without a label printer or minimum order quantity.',
    tags: ['Custom packaging', 'Brand stamps', 'No MOQ'],
  },
  {
    icon: '🎨',
    title: 'Artists & Creatives',
    description:
      'Roll repeating patterns on fabric, paper, wood, and walls. Create textures no brush or stencil can replicate.',
    tags: ['Pattern making', 'Mixed media', 'Surface art'],
  },
]

export default function WhoItsFor() {
  return (
    <section className="py-24 bg-[#0a0a0c] border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Built For You</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Who It's For</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
            One tool. Three very different people. Which one are you?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative rounded-2xl border border-gray-800/80 p-7 overflow-hidden transition-all duration-300 hover:border-red-500/30"
              style={{ background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)' }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(220,38,38,0.06) 0%, transparent 70%)' }} />

              {/* Icon */}
              <div className="text-4xl mb-5">{a.icon}</div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-3 leading-tight">{a.title}</h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-5">{a.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {a.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-700/60 text-gray-500 bg-white/[0.03]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom red accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.5), transparent)' }} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
