import { motion } from 'framer-motion'

// TODO: replace these placeholder quotes with real customer testimonials before shipping.
const testimonials = [
  {
    quote: 'PLACEHOLDER — swap in a real customer quote here.',
    name: 'Customer Name',
    detail: 'Ordered: Product Name',
  },
  {
    quote: 'PLACEHOLDER — swap in a real customer quote here.',
    name: 'Customer Name',
    detail: 'Ordered: Product Name',
  },
  {
    quote: 'PLACEHOLDER — swap in a real customer quote here.',
    name: 'Customer Name',
    detail: 'Ordered: Product Name',
  },
]

function Stars() {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#FFA41C">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-28 bg-[#1D1D1F]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="text-center mb-16">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            What Customers Say
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Loved by our customers.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Stars />
              <p className="text-white/80 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-[#86868B] mt-0.5">{t.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
