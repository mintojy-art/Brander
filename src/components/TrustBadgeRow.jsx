import { motion } from 'framer-motion'

const BADGES = [
  { icon: '🛡️', text: 'Quality guaranteed — full refund if not satisfied' },
  { icon: '📦', text: 'Ships in protective foam packaging' },
  { icon: '🚚', text: 'Free delivery anywhere in India' },
  { icon: '🇮🇳', text: 'Designed & printed in India by ORIC' },
]

export default function TrustBadgeRow() {
  return (
    <section className="py-10 bg-[#F5F5F7] border-y border-[#D2D2D7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {BADGES.map((b, i) => (
            <motion.div
              key={b.text}
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <span className="text-lg shrink-0 mt-0.5">{b.icon}</span>
              <span className="text-xs text-[#424245] leading-snug">{b.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
