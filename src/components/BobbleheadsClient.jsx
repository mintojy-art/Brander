'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import BobbleheadCollections from '@/components/BobbleheadCollections'
import Y2kIcon from '@/components/Y2kIcon'
import WishlistButton from '@/components/WishlistButton'

function ProductCard({ product }) {
  const { add } = useCart()
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href={product.href}
        className="y2k-lift group bg-white rounded-3xl overflow-hidden border border-[#D2D2D7] hover:shadow-xl transition-all duration-500 block cursor-pointer"
      >
        <div className="aspect-square bg-[#F5F5F7] relative overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Y2kIcon emoji="🎎" size={56} className="text-[#A6ACB8]" />
              <span className="text-xs font-medium text-[#86868B] uppercase tracking-widest">Custom Order</span>
            </div>
          )}
          {product.badge && (
            <div className="y2k-lime-glow absolute top-4 left-4 px-3 py-1 bg-[#B6FF3C] text-[#1D1D1F] text-[10px] font-bold tracking-wider rounded-full">
              {product.badge}
            </div>
          )}
          <WishlistButton product={product} className="absolute top-4 right-4" />
        </div>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-1">{product.category}</p>
          <h3 className="text-base font-semibold text-[#1D1D1F] leading-snug mb-1">{product.name}</h3>
          <p className="text-sm text-[#86868B] mb-4 leading-relaxed">{product.tagline}</p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
            <button
              onClick={(e) => { e.preventDefault(); add(product) }}
              className="y2k-accent-surface y2k-shine px-3 py-1.5 text-xs font-semibold text-white rounded-full transition-all overflow-hidden"
            >
              {product.price ? 'Add to Cart' : 'Get Quote'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function BobbleheadsClient({ products, occasions }) {
  const bobbleheadProducts = products.filter((p) => p.category === 'Bobbleheads')

  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Header */}
      <div className="y2k-dark-surface">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-24 text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFA35C] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            ORIC Bobbleheads
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Custom Bobbleheads.<br />
            <span className="text-[#FFA35C]">Made for you.</span>
          </motion.h1>
          <motion.p
            className="text-[#86868B] text-base max-w-lg mx-auto mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Hand-sculpted likeness, any occasion. Browse by theme, shop a finished piece, or send us a photo and we'll build it from scratch.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a href="#products" className="y2k-chrome-surface y2k-shine px-8 py-4 text-[#1D1D1F] text-sm font-semibold rounded-full transition-all overflow-hidden">
              Browse Products
            </a>
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="y2k-accent-surface y2k-shine px-8 py-4 text-white text-sm font-semibold rounded-full transition-all overflow-hidden"
            >
              Get a Quote
            </a>
          </motion.div>
        </div>
      </div>

      {/* Shop by Occasion */}
      <BobbleheadCollections occasions={occasions} />

      {/* All Bobblehead Products */}
      <section id="products" className="py-28 scroll-mt-24 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="mb-10">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F37121] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              The Full Range
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
              style={{ fontFamily: 'var(--font-orbitron)' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              All Bobblehead Products
            </motion.h2>
          </div>

          {/* 'Got a photo?' banner */}
          <motion.a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 flex flex-col sm:flex-row items-center gap-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-6 py-5 hover:border-[#EA580C]/40 transition-colors overflow-hidden"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Y2kIcon emoji="🖼️" size={40} className="flex-shrink-0 text-[#F37121]" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-[#1D1D1F]">Have a photo? We'll turn it into a bobblehead.</p>
              <p className="text-xs text-[#424245] mt-0.5">Send any image on WhatsApp — yourself, a couple, a pet, anyone. Quote in 24 hours. No file needed.</p>
            </div>
            <span className="text-xs font-semibold text-[#EA580C] flex-shrink-0">Send Your Photo →</span>
          </motion.a>

          {bobbleheadProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bobbleheadProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="y2k-chrome-surface rounded-3xl p-10 md:p-14 text-center">
              <div className="flex justify-center mb-3"><Y2kIcon emoji="🎎" size={48} className="text-[#A6ACB8]" /></div>
              <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">No finished bobbleheads listed yet</h3>
              <p className="text-sm text-[#424245] max-w-sm mx-auto mb-6">
                Every bobblehead we make is custom. Send us a reference photo on WhatsApp and we'll quote your one-of-a-kind figure within 24 hours.
              </p>
              <a
                href="https://wa.me/918310194953"
                target="_blank"
                rel="noopener noreferrer"
                className="y2k-accent-surface y2k-shine inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-full transition-all overflow-hidden"
              >
                Start Your Order →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-28 y2k-dark-surface">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-8"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Your likeness.<br />
            <span className="text-[#FFA35C]">In 3D, on your desk.</span>
          </motion.h2>
          <motion.p
            className="text-[#86868B] text-base md:text-lg max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Every bobblehead is sculpted, printed, and quality-checked by hand in Bangalore.
          </motion.p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="y2k-chrome-surface y2k-shine px-8 py-4 text-[#1D1D1F] text-sm font-semibold rounded-full transition-all overflow-hidden"
            >
              Start Your Order →
            </a>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
