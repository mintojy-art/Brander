'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MaskCard from '@/components/MaskCard'
import PhotoQuoteModal from '@/components/PhotoQuoteModal'

// Dedicated Mask Studio hub page — deliberately its own dark/theatrical
// visual world (see MaskCard/MaskStudioSection), distinct from the rest of
// the site's Y2K-orange look. Pulls every 'Cosplay'-category product.
export default function MaskStudioClient({ products = [] }) {
  const masks = products.filter((p) => p.category === 'Cosplay')
  const [quoteOpen, setQuoteOpen] = useState(false)

  return (
    <div className="pt-[100px] min-h-screen" style={{ background: '#0B0B0D' }}>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #17141A 0%, #0B0B0D 100%)' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-24 text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.4em] mb-4"
            style={{ color: '#C24A5E' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Mask Studio
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Wear The Character.
          </motion.h1>
          <motion.p
            className="text-white/50 text-base max-w-lg mx-auto mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Custom mask design and custom cosplay mask design in Bangalore, India — hand-finished, sculpted, and 3D printed one piece at a time.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a
              href="#collection"
              className="px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white border border-white/30 hover:bg-white hover:text-[#0B0B0D] transition-colors"
            >
              Browse Collection
            </a>
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white border border-[#A32638] bg-[#A32638]/20 hover:bg-[#A32638] transition-colors"
            >
              Commission a Custom Mask
            </button>
          </motion.div>
        </div>
      </div>

      {/* Full collection */}
      <section id="collection" className="py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-14">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.4em] mb-3"
              style={{ color: '#C24A5E' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              The Collection
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-extrabold text-white leading-tight"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Every Mask We've Made.
            </motion.h2>
          </div>

          {masks.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {masks.map((p, i) => (
                <MaskCard key={p.id} product={p} delay={i * 0.06} />
              ))}
            </div>
          ) : (
            <div className="border border-white/10 p-10 md:p-14 text-center">
              <div className="text-5xl mb-3">🎭</div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                No masks listed yet
              </h3>
              <p className="text-sm text-white/50 max-w-sm mx-auto mb-6">
                Every mask we make is custom. Send us a reference photo on WhatsApp and we'll quote your one-of-a-kind piece within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white border border-[#A32638] bg-[#A32638]/20 hover:bg-[#A32638] transition-colors"
              >
                Start Your Order →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ — visible copy matching the FAQPage schema on the page (server) component */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-12">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.4em] mb-3"
              style={{ color: '#C24A5E' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Questions
            </motion.p>
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold text-white leading-tight"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Custom Mask Design, Answered.
            </motion.h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white mb-1.5">Who does custom mask design in Bangalore, India?</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                ORIC Mask Studio, based in Bangalore, designs and 3D prints custom masks — including custom cosplay mask design — for customers across India. Send a reference photo or sketch on WhatsApp and get a quote within 24 hours.
              </p>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white mb-1.5">Do you offer custom cosplay mask design in Bangalore?</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Yes — ORIC's Mask Studio hand-sculpts and 3D prints custom cosplay masks from a photo, sketch, or character reference, finished and painted in Bangalore, then shipped across India.
              </p>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white mb-1.5">Can I get a mask 3D printed and shipped anywhere in India?</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Yes — every mask is printed to order in Bangalore and shipped pan-India via Shiprocket/Delhivery. There's no minimum order, whether it's a display piece or a full cosplay mask.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-28 border-t border-white/10" style={{ background: '#111014' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <motion.h2
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Have a character<br />
            <span style={{ color: '#C24A5E' }}>only you can see?</span>
          </motion.h2>
          <motion.p
            className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Send a reference photo or sketch and we'll sculpt, print, and finish it by hand.
          </motion.p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white border border-white/30 hover:bg-white hover:text-[#0B0B0D] transition-colors"
            >
              Commission a Custom Mask →
            </button>
          </motion.div>
        </div>
      </section>

      <PhotoQuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} context="a custom mask" />
    </div>
  )
}
