'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Y2kIcon from '@/components/Y2kIcon'

function CollectionCard({ o, span, delay }) {
  const image = (o.images || []).filter(Boolean)[0]

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-3xl min-h-[220px] bg-[#1D1D1F] ${span}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={`/bobbleheads/${o.id}`} className="absolute inset-0 flex flex-col justify-between p-6">
        {image ? (
          <img
            src={image}
            alt={o.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-60">
            <Y2kIcon emoji={o.icon || '🎎'} size={72} className="text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />

        <div className="relative flex items-start justify-between">
          {o.badge && (
            <span className="y2k-lime-glow px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#B6FF3C] text-[#1D1D1F]">
              {o.badge}
            </span>
          )}
          {image && o.icon && <Y2kIcon emoji={o.icon} size={34} className="ml-auto text-white" />}
        </div>

        <div className="relative">
          <h3 className="text-2xl font-bold mb-1 text-white">{o.title}</h3>
          {o.tagline && <p className="text-sm mb-4 text-white/75">{o.tagline}</p>}
          <span className="y2k-chrome-surface y2k-shine inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full text-[#1D1D1F] transition-all overflow-hidden">
            {o.cta_text || 'Get a Quote'} →
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

// First occasion is the tall hero card; the rest fill the remaining columns
// two-per-row (12-col grid, hero takes 4 cols × 2 rows, rest take 4 cols each).
function spanFor(index) {
  if (index === 0) return 'md:col-span-4 md:row-span-2'
  return 'md:col-span-4'
}

export default function BobbleheadCollections({ occasions = [] }) {
  if (occasions.length === 0) return null

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="text-center mb-14">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Bobbleheads
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-[#1D1D1F]"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Shop by Occasion
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:auto-rows-fr gap-4">
          {occasions.map((o, i) => (
            <CollectionCard key={o.id} o={o} span={spanFor(i)} delay={Math.min(i, 5) * 0.05} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/bobbleheads"
            className="y2k-accent-surface y2k-shine inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold rounded-full transition-all overflow-hidden"
          >
            All Bobbleheads
          </Link>
        </div>
      </div>
    </section>
  )
}
