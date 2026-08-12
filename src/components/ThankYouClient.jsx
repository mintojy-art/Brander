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
    <div className="pt-[100px] min-h-screen bg-[#F5F5F7] flex items-center justify-center px-5 py-20">
      <motion.div
        className="text-center max-w-md bg-white rounded-3xl border border-[#D2D2D7] p-10 sm:p-12"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15, type: 'spring', stiffness: 200 }}
        >
          ✓
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-3">{content.heading}</h1>
        <p className="text-sm text-[#86868B] leading-relaxed mb-8">{content.message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href={content.primary.to}
            className="px-6 py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all"
          >
            {content.primary.label} →
          </Link>
          <Link
            href={content.secondary.to}
            className="px-6 py-3 border border-[#D2D2D7] text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-[#F5F5F7] transition-all"
          >
            {content.secondary.label}
          </Link>
        </div>

        <div className="pt-6 border-t border-[#F5F5F7]">
          <p className="text-xs text-[#86868B]">
            Questions in the meantime?{' '}
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1D1D1F] font-semibold hover:underline underline-offset-2"
            >
              WhatsApp us directly
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
