'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { categoryIcons } from '@/data/products'
import Y2kIcon from '@/components/Y2kIcon'

function StarMini({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-3 h-3" viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#FFA41C' : 'none'} stroke={i <= Math.round(rating) ? 'none' : '#D2D2D7'} strokeWidth="1">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ProductCard({ product }) {
  const { add } = useCart()

  return (
    <motion.div
      className="y2k-lift group bg-white rounded-3xl overflow-hidden border border-[#D2D2D7] hover:shadow-2xl transition-all duration-500 flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Image */}
      <Link href={product.href} className="block aspect-square bg-[#F5F5F7] relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Y2kIcon emoji="🖨️" size={56} className="text-[#A6ACB8]" />
            <span className="text-xs font-medium text-[#86868B] uppercase tracking-widest">Custom Order</span>
          </div>
        )}
        {product.badge && (
          <div className="y2k-lime-glow absolute top-4 left-4 px-3 py-1 bg-[#B6FF3C] text-[#1D1D1F] text-[10px] font-bold tracking-wider rounded-full">
            {product.badge}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-1">{product.category}</p>
        <Link href={product.href} className="block">
          <h3 className="text-sm font-semibold text-[#1D1D1F] mb-1 leading-snug hover:underline underline-offset-2">{product.name}</h3>
        </Link>
        <p className="text-xs text-[#86868B] leading-relaxed mb-2 line-clamp-2">{product.tagline}</p>

        {/* First reviewer nudge for pre-order items */}
        {product.preOrder && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded-full">Be our first reviewer</span>
          </div>
        )}

        <p className="text-xs text-[#86868B] mb-4">Lead time: {product.lead}</p>

        <div className="mt-auto border-t border-[#F5F5F7] pt-4 flex items-center justify-between">
          <span className="text-base font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
          <div className="flex gap-2">
            <Link
              href={product.href}
              className="px-3 py-1.5 text-xs font-medium text-[#424245] border border-[#D2D2D7] rounded-full hover:bg-[#F5F5F7] transition-all"
            >
              Details
            </Link>
            <button
              onClick={() => add(product)}
              className="y2k-accent-surface y2k-shine px-3.5 py-1.5 text-xs font-semibold text-white rounded-full transition-all overflow-hidden"
            >
              {product.price ? 'Add' : 'Quote'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ShopClient({ products, initialCategory = 'All' }) {
  const router = useRouter()
  // Driven by a prop from the server (page.jsx reads the ?cat= query param
  // itself) rather than useSearchParams() — calling that hook here would
  // force this entire component to bail out of server rendering, which
  // silently made the whole /shop page invisible to non-JS crawlers.
  const [active, setActiveState] = useState(initialCategory)
  useEffect(() => { setActiveState(initialCategory) }, [initialCategory])
  const setActive = (cat) => {
    setActiveState(cat)
    router.push(cat === 'All' ? '/shop' : `/shop?cat=${encodeURIComponent(cat)}`, { scroll: false })
  }
  const categories = ['All', ...new Set(products.map((p) => p.category))]
  const filtered = active === 'All' ? products : products.filter((p) => p.category === active)

  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Header */}
      <div className="border-b border-[#D2D2D7] bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F37121] mb-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            ORIC Shop
          </motion.p>
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-[#1D1D1F] leading-tight"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Shop All Products
          </motion.h1>
          <motion.p
            className="text-[#86868B] mt-3 max-w-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Custom 3D prints, tools, figurines, and more. All made on-demand.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12">

        {/* Popular categories */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#86868B] mb-4">
            Popular Categories
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.filter((c) => c !== 'All').map((cat) => {
              const itemCount = products.filter((p) => p.category === cat).length
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`y2k-lift y2k-shine flex flex-col items-center gap-2 p-4 rounded-3xl transition-all overflow-hidden ${
                    active === cat ? 'y2k-accent-surface' : 'y2k-chrome-surface'
                  }`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Y2kIcon emoji={categoryIcons[cat] || '🖨️'} size={28} className={active === cat ? 'text-white' : 'text-[#F37121]'} />
                  <span className={`text-xs font-semibold ${active === cat ? 'text-white' : 'text-[#1D1D1F]'}`}>
                    {cat}
                  </span>
                  <span className={`text-[10px] ${active === cat ? 'text-white/70' : 'text-[#86868B]'}`}>
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative y2k-shine px-4 py-2 text-sm font-medium rounded-full transition-all overflow-hidden ${
                active === cat
                  ? 'y2k-accent-surface'
                  : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED] hover:text-[#1D1D1F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 'Got a photo?' banner */}
        <motion.a
          href="https://wa.me/918310194953"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 flex flex-col sm:flex-row items-center gap-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-6 py-5 hover:border-[#EA580C]/40 transition-colors overflow-hidden"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <Y2kIcon emoji="🖼️" size={44} className="flex-shrink-0 text-[#F37121]" />
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EA580C]">Most Popular Request</span>
            <p className="text-sm font-bold text-[#1D1D1F] mt-0.5">Have a photo? We'll turn it into a 3D figurine.</p>
            <p className="text-xs text-[#424245] mt-0.5">Send any image on WhatsApp — pet, person, character, idol. Quote in 24 hours. No file needed.</p>
          </div>
          <span className="text-xs font-semibold text-[#EA580C] flex-shrink-0">Send Your Photo →</span>
        </motion.a>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Shipping info banner */}
        <div className="y2k-chrome-surface mt-14 mb-2 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <div>
              <p className="text-sm font-semibold text-[#1D1D1F]">Shipping across India</p>
              <p className="text-xs text-[#424245] mt-0.5">Bangalore: ₹40–80 · Rest of India: ₹80–150 · Delivered via Shiprocket / Delhivery</p>
            </div>
          </div>
          <p className="text-xs text-[#424245] sm:text-right">Print time + 2–4 days transit.<br />Exact cost confirmed at order.</p>
        </div>

        {/* Custom order CTA */}
        <motion.div
          className="y2k-dark-surface mt-16 rounded-3xl p-10 md:p-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFA35C] mb-3">Can't find it?</p>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-orbitron)' }}>
            We print anything.<br />
            <span className="text-[#86868B]">Just ask.</span>
          </h3>
          <p className="text-[#86868B] text-sm max-w-sm mx-auto mb-8">
            Send us your STL, reference image, or idea. We'll quote within 24 hours.
          </p>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="y2k-chrome-surface y2k-shine inline-flex items-center gap-2 px-8 py-4 text-[#1D1D1F] text-sm font-semibold rounded-full transition-all overflow-hidden"
          >
            Start a Custom Order
          </a>
        </motion.div>
      </div>
    </div>
  )
}
