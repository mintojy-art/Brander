'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { services } from '@/data/services'
import Y2kIcon from '@/components/Y2kIcon'

export default function ServicesClient() {
  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Header */}
      <div className="y2k-dark-surface">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-24">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFA35C] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            ORIC Services
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Everything<br />
            <span className="text-[#FFA35C]">we print.</span>
          </motion.h1>
          <motion.p
            className="text-[#86868B] text-base max-w-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            9 service categories. FDM precision. Fast turnaround. Delivered across India.
          </motion.p>
        </div>
      </div>

      {/* Services list */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
        {services.map((svc, i) => (
          <motion.div
            key={svc.id}
            id={svc.id}
            className="border-b border-[#D2D2D7] py-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left */}
              <div className="md:col-span-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(180deg, #FFA35C 0%, #F37121 55%, #C94E00 100%)' }}
                  >
                    <Y2kIcon emoji={svc.icon} size={24} className="text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#86868B] tracking-widest uppercase">{svc.number}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] leading-tight mb-2">{svc.title}</h2>
                <p className="text-[#86868B] text-sm font-medium mb-4">{svc.tagline}</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F37121] hover:text-[#C94E00] transition-colors underline underline-offset-4"
                >
                  Order this service →
                </Link>
              </div>

              {/* Right */}
              <div className="md:col-span-7">
                <p className="text-[#424245] text-sm leading-relaxed mb-6">{svc.description}</p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {svc.specs.map((spec) => (
                    <div key={spec} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#86868B] mt-2 shrink-0" />
                      <span className="text-xs text-[#86868B]">{spec}</span>
                    </div>
                  ))}
                </div>

                {/* Use case */}
                <div className="mt-4 px-4 py-3 bg-[#F5F5F7] rounded-xl">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#86868B]">Best for: </span>
                  <span className="text-xs text-[#424245]">{svc.useCase}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="border-t border-[#D2D2D7] py-24 bg-[#F5F5F7]">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-4xl font-bold text-[#1D1D1F] mb-4" style={{ fontFamily: 'var(--font-orbitron)' }}>Ready to start?</h2>
          <p className="text-[#424245] text-base mb-8 max-w-md mx-auto">
            Send your file or idea. We'll quote within 24 hours and get it printed fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="y2k-accent-surface y2k-shine px-8 py-4 text-white text-sm font-semibold rounded-full transition-all overflow-hidden"
            >
              Order via WhatsApp
            </a>
            <Link
              href="/shop"
              className="y2k-chrome-surface y2k-shine px-8 py-4 text-[#1D1D1F] text-sm font-semibold rounded-full transition-all overflow-hidden"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
