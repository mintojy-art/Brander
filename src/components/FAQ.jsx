import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'What ink or marker does the Brander Roller use?',
    a: 'The Brander Roller is designed to work with standard paint markers and ink rollers — no proprietary consumables. Any permanent marker refill or fabric/surface ink that fits the 15mm roller core works. We recommend oil-based paint markers for hard surfaces (cardboard, wood, metal) and textile ink for fabric. Replacement refills are widely available in most stationery and art supply stores.',
  },
  {
    q: 'How do I load a custom design onto the roller?',
    a: 'Your custom design is laser-etched directly onto the rubber roller sleeve — it arrives ready to roll. You use the Design Lab on this page to configure your text, font, and layout, then submit your details via the waitlist. Once we confirm your order, we produce the roller with your exact pattern. No extra tools or assembly required — just load your ink and roll.',
  },
  {
    q: 'Does it work on different surfaces?',
    a: 'Yes. The Brander Roller is tested on 6+ surface types: cardboard boxes, kraft paper, fabric, wood, painted walls, and plastic sheeting. Surfaces should be relatively flat for clean imprints — highly textured or uneven surfaces may reduce sharpness. For porous surfaces like fabric or raw wood, a slightly thicker ink gives the best results.',
  },
  {
    q: 'How long until I receive it after ordering?',
    a: 'We are currently in pre-launch. Once we open orders, standard turnaround is 7–10 business days for custom-engraved rollers within India, including production and dispatch. Early waitlist members get priority dispatch — meaning your order goes into production before the general queue. We will send you a personal update via WhatsApp when your roller ships.',
  },
  {
    q: 'What if I want a pattern that is different from the standard options?',
    a: 'Fully custom patterns — logos, icons, borders, or anything beyond text — are available upon request. Use the Design Lab to upload your artwork or describe what you need, and we will review it before confirming your order. Custom graphic rollers may have a slightly longer production window. Reach out directly via WhatsApp after joining the waitlist and we will work it out with you personally.',
  },
]

function Item({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-800/70 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
      >
        <span className="text-white text-sm md:text-base font-semibold leading-snug group-hover:text-red-400 transition-colors">
          {faq.q}
        </span>
        <span
          className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all mt-0.5 ${
            isOpen
              ? 'bg-red-600 border-red-500 text-white'
              : 'border-gray-700 text-gray-500 group-hover:border-red-500/50 group-hover:text-red-400'
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
            <p className="text-gray-400 text-sm leading-relaxed pb-6 max-w-2xl">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)

  const toggle = (i) => setOpen((prev) => (prev === i ? null : i))

  return (
    <section id="faq" className="py-24 bg-[#0a0a0c] border-t border-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Before You Join</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Questions answered.
          </h2>
          <p className="text-gray-500 text-sm mt-3">Everything you need to know before committing.</p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          className="rounded-2xl border border-gray-800/60 px-6 md:px-8"
          style={{ background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {FAQS.map((faq, i) => (
            <Item key={i} faq={faq} isOpen={open === i} onToggle={() => toggle(i)} />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.p
          className="text-center text-gray-600 text-sm mt-8"
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
            className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            WhatsApp us directly
          </a>
          .
        </motion.p>

      </div>
    </section>
  )
}
