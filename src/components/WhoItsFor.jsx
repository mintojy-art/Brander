import { motion } from 'framer-motion'

const audiences = [
  {
    number: '01',
    title: 'Manufacturers & Workshops',
    description:
      'Mark batches, parts, crates, and tools with your brand or lot number — fast, consistent, no ink pad setup.',
    tags: ['Batch marking', 'Part labelling', 'QC stamps'],
  },
  {
    number: '02',
    title: 'Small Businesses & Packagers',
    description:
      'Brand your packaging, boxes, and mailers by hand without a label printer or minimum order quantity.',
    tags: ['Custom packaging', 'Brand stamps', 'No MOQ'],
  },
  {
    number: '03',
    title: 'Artists & Creatives',
    description:
      'Roll repeating patterns on fabric, paper, wood, and walls. Create textures no brush or stencil can replicate.',
    tags: ['Pattern making', 'Mixed media', 'Surface art'],
  },
]

export default function WhoItsFor() {
  return (
    <section className="py-28 bg-[#FAFAF8] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-4">Built For You</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111111] leading-tight">
              One tool.<br />Three people.
            </h2>
          </motion.div>
          <motion.p
            className="text-stone-500 max-w-xs text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Which one are you?
          </motion.p>
        </div>

        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-10 hover:bg-stone-50/70 transition-colors duration-300 px-2"
            >
              {/* Number */}
              <div className="md:col-span-1">
                <span className="text-[11px] font-bold text-stone-300 tracking-widest">{a.number}</span>
              </div>

              {/* Title */}
              <div className="md:col-span-4">
                <h3 className="text-lg font-bold text-[#111111] leading-snug group-hover:underline underline-offset-4 decoration-stone-300 transition-all">
                  {a.title}
                </h3>
              </div>

              {/* Description */}
              <div className="md:col-span-5">
                <p className="text-stone-500 text-sm leading-relaxed">{a.description}</p>
              </div>

              {/* Tags */}
              <div className="md:col-span-2 flex flex-wrap gap-2 md:justify-end items-start">
                {a.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-stone-200 text-stone-400 bg-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
