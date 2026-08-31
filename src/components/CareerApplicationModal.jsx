'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const initialForm = { name: '', email: '', phone: '', portfolioUrl: '', message: '' }

export default function CareerApplicationModal({ isOpen, onClose, role }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [err, setErr] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  // Fresh form each time it's opened for a role.
  useEffect(() => {
    if (isOpen) { setForm(initialForm); setStatus('idle'); setErr('') }
  }, [isOpen, role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErr('')
    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role?.id,
          roleTitle: role?.title,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          portfolioUrl: form.portfolioUrl.trim(),
          message: form.message.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setStatus('done')
    } catch (e) {
      setErr(e.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (!role) return null

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
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-1">Apply</p>
                <h2 className="text-xl font-bold text-white">{role.title}</h2>
                <p className="text-sm text-[#86868B] mt-1">{role.type}</p>
              </div>

              {status === 'done' ? (
                <div className="px-6 py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-base font-bold text-[#1D1D1F] mb-1">Application sent</p>
                  <p className="text-sm text-[#86868B]">We'll review it and get back to you if it's a fit.</p>
                  <button
                    onClick={onClose}
                    type="button"
                    className="mt-6 w-full py-3 text-sm font-semibold bg-[#F5F5F7] text-[#1D1D1F] rounded-xl hover:bg-[#E8E8ED] transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                  {status === 'error' && (
                    <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      {err}
                    </div>
                  )}

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
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors"
                      placeholder="+91 …"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">Portfolio / resume link</label>
                    <input
                      type="url"
                      value={form.portfolioUrl}
                      onChange={(e) => set('portfolioUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors"
                      placeholder="Link to your work, LinkedIn, or resume"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] mb-1.5">Why you're a good fit</label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D2D2D7] rounded-xl outline-none focus:border-[#1D1D1F] transition-colors resize-none"
                      placeholder="A few lines about your experience"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#1D1D1F] hover:bg-[#424245] active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-50 mt-2"
                  >
                    {status === 'loading' ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
