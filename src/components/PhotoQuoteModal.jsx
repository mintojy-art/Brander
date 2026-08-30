'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WA_NUMBER = '918310194953'

const PURPOSES = ['Gift', 'Personal', 'Display', 'Business']

// Shared by every "Send Your Photo" / "Order this service" CTA — collects a
// short brief, then hands the customer off to WhatsApp with it pre-filled
// rather than opening straight to a blank chat.
export default function PhotoQuoteModal({ isOpen, onClose, context = '' }) {
  const [form, setForm] = useState({ name: '', whatMade: '', size: '', purpose: '', needBy: '' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  // Fresh form each time it's opened, so a previous submission doesn't linger.
  useEffect(() => {
    if (isOpen) setForm({ name: '', whatMade: '', size: '', purpose: '', needBy: '' })
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const lines = [
      `Hi ORIC! I'd like a quote${context ? ` for ${context}` : ''}:`,
      '',
      `Name: ${form.name}`,
      `What I want made: ${form.whatMade}`,
      form.size ? `Approximate size: ${form.size} cm` : null,
      form.purpose ? `Purpose: ${form.purpose}` : null,
      form.needBy
        ? `Needed by: ${new Date(form.needBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : null,
      '',
      "I'll attach a reference photo here.",
    ].filter(Boolean)

    const msg = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden my-auto"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#1D1D1F] px-6 pt-6 pb-5 relative">
                <button
                  onClick={onClose}
                  type="button"
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-1">Get a Quote</p>
                <h2 className="text-xl font-bold text-white">Tell us what you need</h2>
                <p className="text-sm text-[#86868B] mt-1">We'll open WhatsApp with your answers filled in.</p>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">Name</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">What do you want made?</label>
                  <input
                    required
                    type="text"
                    value={form.whatMade}
                    onChange={(e) => set('whatMade', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors"
                    placeholder="e.g. a figurine of my dog"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">Approximate size (cm)</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => set('size', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors"
                    placeholder="e.g. 15"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">Is it a gift, personal, display, or for a business?</label>
                  <div className="relative">
                    <select
                      value={form.purpose}
                      onChange={(e) => set('purpose', e.target.value)}
                      className="w-full text-sm text-[#1D1D1F] bg-white border border-[#D2D2D7] rounded-xl px-3.5 py-2.5 pr-8 outline-none focus:border-[#1D1D1F] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select one</option>
                      {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">When do you need it?</label>
                  <input
                    type="date"
                    value={form.needBy}
                    onChange={(e) => set('needBy', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 text-sm text-[#1D1D1F] border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#25D366] hover:bg-[#1DAA54] active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all shadow-sm mt-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Continue on WhatsApp
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
