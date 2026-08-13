'use client'

import { motion } from 'framer-motion'
import Y2kIcon from '@/components/Y2kIcon'

const BADGES = [
  { icon: '🛡️', text: 'Quality guaranteed — full refund if not satisfied' },
  { icon: '📦', text: 'Ships in protective foam packaging' },
  { icon: '🚚', text: 'Delivery across pan India' },
  { icon: '🇮🇳', text: 'Designed & printed in India by ORIC' },
]

export default function TrustBadgeRow() {
  return (
    <section className="py-14 border-y border-[#D2D2D7] bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map((b, i) => (
            <motion.div
              key={b.text}
              className="y2k-chrome-surface y2k-lift flex flex-col items-center text-center gap-3 rounded-2xl px-4 py-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(180deg, #FFA35C 0%, #F37121 55%, #C94E00 100%)' }}
              >
                <Y2kIcon emoji={b.icon} size={30} className="text-white" />
              </div>
              <span className="text-xs text-[#424245] leading-snug font-medium">{b.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
