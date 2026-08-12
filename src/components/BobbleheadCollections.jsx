'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

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
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">
            {o.icon || '🎎'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />

        <div className="relative flex items-start justify-between">
          {o.badge && (
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/15 text-white border border-white/25 backdrop-blur-sm">
              {o.badge}
            </span>
          )}
          {image && o.icon && <span className="text-3xl ml-auto">{o.icon}</span>}
        </div>

        <div className="relative">
          <h3 className="text-2xl font-bold mb-1 text-white">{o.title}</h3>
          {o.tagline && <p className="text-sm mb-4 text-white/75">{o.tagline}</p>}
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-white text-[#1D1D1F] group-hover:bg-[#F5F5F7] transition-all">
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all"
          >
            All Bobbleheads
          </Link>
        </div>
      </div>
    </section>
  )
}
