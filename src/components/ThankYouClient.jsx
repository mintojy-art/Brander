'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { THANK_YOU_CONTENT } from '@/lib/thankYouContent'

export default function ThankYouClient() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const content = THANK_YOU_CONTENT[type] || THANK_YOU_CONTENT.default

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { event_category: content.conversionLabel })
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: content.conversionLabel })
    }
  }, [content.conversionLabel])

  return (
    <div className="pt-[100px] min-h-screen flex items-center justify-center px-5 py-20" style={{ background: 'linear-gradient(180deg, #F7F8FA 0%, #ECEFF3 100%)' }}>
      <motion.div
        className="y2k-chrome-surface text-center max-w-md rounded-3xl p-10 sm:p-12"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="y2k-lime-glow w-16 h-16 rounded-full bg-[#B6FF3C] text-[#1D1D1F] flex items-center justify-center mx-auto mb-6 text-2xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15, type: 'spring', stiffness: 200 }}
        >
          ✓
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-3" style={{ fontFamily: 'var(--font-orbitron)' }}>{content.heading}</h1>
        <p className="text-sm text-[#424245] leading-relaxed mb-8">{content.message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href={content.primary.to}
            className="y2k-accent-surface y2k-shine px-6 py-3 text-white text-sm font-semibold rounded-full transition-all overflow-hidden"
          >
            {content.primary.label} →
          </Link>
          <Link
            href={content.secondary.to}
            className="px-6 py-3 border border-[#D2D2D7] text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-white/60 transition-all"
          >
            {content.secondary.label}
          </Link>
        </div>

        <div className="pt-6 border-t border-black/5">
          <p className="text-xs text-[#424245]">
            Questions in the meantime?{' '}
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F37121] font-semibold hover:underline underline-offset-2"
            >
              WhatsApp us directly
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
