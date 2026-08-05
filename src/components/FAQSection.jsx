import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const FAQS = [
  {
    q: 'How do I place an order?',
    a: "Browse the Shop or send us a photo/file directly on WhatsApp. Add items to your cart and tap \"Order via WhatsApp\" to send us an itemized message — we confirm final pricing and payment details there. There's no separate online checkout; every order is confirmed personally over WhatsApp.",
  },
  {
    q: 'What file formats do you accept?',
    a: 'We accept STL, STEP, and OBJ files for custom prints. No file? No problem — send a reference photo or describe your idea on WhatsApp and we\'ll help design it or quote it directly.',
  },
  {
    q: 'How is pricing calculated?',
    a: "For custom STL uploads, use the instant price configurator on our homepage — it factors in material, print quality, infill strength, and scale. For figurines, idols, and other \"Get Quote\" items, we review your request and send a fixed price within 24 hours.",
  },
  {
    q: 'Do you ship across India?',
    a: 'Yes — we deliver pan-India via Shiprocket/Delhivery. Bangalore orders typically cost ₹40–80 to ship; the rest of India ₹80–150. Exact shipping cost is confirmed at order time.',
  },
  {
    q: "What's your refund policy?",
    a: (
      <>
        Defective or damaged prints are reprinted free of charge. See our full{' '}
        <Link to="/refund-policy" className="underline underline-offset-2 font-semibold text-[#1D1D1F]">
          Refund & Reprint Policy
        </Link>{' '}
        for what qualifies and how to raise a request.
      </>
    ),
  },
]

function Item({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-[#D2D2D7] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
      >
        <span className="text-[#1D1D1F] text-sm md:text-base font-semibold leading-snug group-hover:text-[#424245] transition-colors">
          {faq.q}
        </span>
        <span
          className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all mt-0.5 ${
            isOpen
              ? 'bg-[#1D1D1F] border-[#1D1D1F] text-white'
              : 'border-[#D2D2D7] text-[#86868B] group-hover:border-[#86868B]'
          }`}
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-[#86868B] text-sm leading-relaxed pb-6 max-w-2xl">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [open, setOpen] = useState(0)
  const toggle = (i) => setOpen((prev) => (prev === i ? null : i))

  return (
    <section id="faq" className="py-28 bg-[#F5F5F7]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">

        <div className="text-center mb-16">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Help
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-[#1D1D1F]"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Questions, answered.
          </motion.h2>
        </div>

        <motion.div
          className="bg-white rounded-2xl border border-[#D2D2D7] px-6 md:px-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {FAQS.map((faq, i) => (
            <Item key={i} faq={faq} isOpen={open === i} onToggle={() => toggle(i)} />
          ))}
        </motion.div>

        <motion.p
          className="text-center text-[#86868B] text-sm mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Still have a question?{' '}
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D1D1F] font-semibold hover:underline underline-offset-2 transition-colors"
          >
            WhatsApp us directly
          </a>
          .
        </motion.p>

      </div>
    </section>
  )
}
