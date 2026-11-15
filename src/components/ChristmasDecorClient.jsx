'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/ShopClient'
import PhotoQuoteModal from '@/components/PhotoQuoteModal'
import { CHRISTMAS_FAQS } from '@/data/christmasFaqs'

// Seasonal landing page. Products come from the server (see lib/christmas.js);
// the copy here is written for the searches people actually make in Nov–Dec.
export default function ChristmasDecorClient({ products = [] }) {
  const [quoteOpen, setQuoteOpen] = useState(false)

  return (
    <div className="pt-[100px] min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#F5F5F7]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-20 text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F37121] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Festive Picks · Orders open until 15 December
          </motion.p>
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-[#1D1D1F] leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Christmas Decor, 3D Printed in Bangalore
          </motion.h1>
          <motion.p
            className="text-[#424245] text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            Mini Christmas trees, reindeer figurines and festive table decorations — designed, 3D printed and
            hand-finished in our Bangalore workshop, and shipped across India. Ideal for your shelf, desk,
            dining table or as a Christmas gift.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#collection"
              className="y2k-accent-surface y2k-shine px-7 py-3.5 text-sm font-semibold text-white rounded-full overflow-hidden"
            >
              Shop Christmas Decor
            </a>
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="px-7 py-3.5 text-sm font-semibold text-[#1D1D1F] border border-[#D2D2D7] bg-white rounded-full hover:bg-[#F5F5F7] transition-colors"
            >
              Custom or bulk order
            </button>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-2">Christmas decorations</h2>
          <p className="text-sm text-[#86868B] mb-10">Each piece is printed to order, so order early for delivery before Christmas.</p>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-[#424245]">
              New Christmas pieces are on their way. Meanwhile, browse the <Link href="/shop" className="underline">full shop</Link>.
            </p>
          )}
        </div>
      </section>

      {/* Why / custom */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-5">Christmas gifts and decor for homes, offices and cafés</h2>
          <div className="space-y-4 text-[#424245] leading-relaxed">
            <p>
              Looking for Christmas decorations that aren&apos;t the same mass-made pieces everyone has? Every ORIC
              decoration is 3D printed in small batches in Bangalore and finished by hand, so it looks good on a
              table up close.
            </p>
            <p>
              Decorating an office, café or shop, or sending Christmas gifts to clients and staff? We take bulk and
              corporate orders, and can design a custom piece — a name ornament, a logo decoration or a festive
              figurine — from your photo or idea.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="y2k-accent-surface y2k-shine px-6 py-3 text-sm font-semibold text-white rounded-full overflow-hidden"
            >
              Get a quote
            </button>
            <Link href="/bobbleheads" className="px-6 py-3 text-sm font-semibold text-[#1D1D1F] border border-[#D2D2D7] bg-white rounded-full hover:bg-white/60">
              Custom bobblehead gifts
            </Link>
            <Link href="/shop" className="px-6 py-3 text-sm font-semibold text-[#1D1D1F] border border-[#D2D2D7] bg-white rounded-full hover:bg-white/60">
              Browse all products
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ — the same text feeds the FAQPage schema */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-8">Christmas decor — questions answered</h2>
          <div className="divide-y divide-[#E5E5EA] border-y border-[#E5E5EA]">
            {CHRISTMAS_FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-semibold text-[#1D1D1F]">
                  {f.q}
                  <span className="text-[#F37121] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-[#424245] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <PhotoQuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} context="Christmas decor" />
    </div>
  )
}
