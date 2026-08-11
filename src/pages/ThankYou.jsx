import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSEO } from '../hooks/useSEO'

const CONTENT = {
  waitlist: {
    heading: "You're on the list!",
    message: "Thanks for joining the Brander Roller waitlist. We'll reach out personally before launch — keep an eye on your inbox and WhatsApp.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop/brander-roller', label: 'Back to Brander Roller' },
    conversionLabel: 'waitlist_signup',
  },
  order: {
    heading: 'Thanks for your order!',
    message: "We've received your details and will confirm pricing and next steps over WhatsApp shortly.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop', label: 'Keep Browsing' },
    conversionLabel: 'order_submitted',
  },
  contact: {
    heading: 'Message received!',
    message: "Thanks for reaching out — we'll get back to you within 24 hours.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop', label: 'Browse Shop' },
    conversionLabel: 'contact_form',
  },
  default: {
    heading: 'Thank you!',
    message: "We've received your submission and will be in touch shortly.",
    primary: { to: '/', label: 'Back to Home' },
    secondary: { to: '/shop', label: 'Browse Shop' },
    conversionLabel: 'form_submitted',
  },
}

export default function ThankYou() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const content = CONTENT[type] || CONTENT.default

  useSEO({ title: 'Thank You', description: content.message, path: '/thank-you' })

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
            to={content.primary.to}
            className="px-6 py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all"
          >
            {content.primary.label} →
          </Link>
          <Link
            to={content.secondary.to}
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
