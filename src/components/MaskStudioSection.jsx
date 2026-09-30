'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import MaskCard from '@/components/MaskCard'

// Mask Studio is deliberately its own visual world — near-black + a single
// crimson accent, Cinzel serif headings, sharp "framed" corners instead of
// the rounded Y2K-orange treatment used everywhere else on the site. Pulls
// from the existing 'Cosplay' product category (kept as the underlying data
// label per the admin's existing Products section) but is branded as "Mask
// Studio" throughout the UI.

export default function MaskStudioSection({ products = [] }) {
  const masks = products.filter((p) => p.category === 'Cosplay')
  if (masks.length === 0) return null

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0B0B0D 0%, #17141A 100%)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="text-center mb-14">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.4em] mb-4"
            style={{ color: '#C24A5E' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Mask Studio
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl text-white leading-tight mb-4"
            style={{ fontFamily: 'var(--font-cinzel)' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Behind Every Mask, A Story.
          </motion.h2>
          <motion.p
            className="text-white/50 text-sm max-w-md mx-auto"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Hand-finished cosplay and display masks, sculpted and printed one piece at a time.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {masks.map((p, i) => (
            <MaskCard key={p.id} product={p} delay={i * 0.06} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/mask-studio"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white border border-white/30 hover:bg-white hover:text-[#0B0B0D] transition-colors"
          >
            View All Masks →
          </Link>
        </div>
      </div>
    </section>
  )
}
