import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxAXWbtjWvWXQTTVIR8pilVJaOgyvRrcjx0W4Kwo_ufDc1qPNZgynLeKRvl2kpnV6AK/exec'

const PERKS = [
  { label: 'Locked-in early bird price — RS 1080/-' },
  { label: 'Priority dispatch on launch day' },
  { label: 'Direct line to the founder' },
  { label: 'Custom roll design assistance included' },
]

function getDesign() {
  try { return JSON.parse(localStorage.getItem('brander_design') || '{}') } catch { return {} }
}

export default function WaitlistSection() {
  const [form, setForm]           = useState({ name: '', email: '', phone: '' })
  const [readyToPay, setReadyToPay] = useState(null)
  const [status, setStatus]       = useState('idle')
  const [errors, setErrors]       = useState({})
  const [design, setDesign]       = useState({})

  useEffect(() => {
    const refresh = () => setDesign(getDesign())
    refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('scroll', refresh, { passive: true })
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('scroll', refresh)
    }
  }, [])

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                       e.name      = 'Name is required'
    if (!form.email.trim())                      e.email     = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email     = 'Enter a valid email'
    if (!form.phone.trim())                      e.phone     = 'WhatsApp number is required'
    if (!readyToPay)                             e.readyToPay = 'Please select an option'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('loading')
    try {
      const latest = getDesign()
      const params = new URLSearchParams({
        name:       form.name.trim(),
        email:      form.email.trim(),
        phone:      form.phone.trim(),
        readyToPay: readyToPay === 'yes' ? 'Yes — Ready to pay' : 'Not yet',
        designText:      latest.text          || '(none)',
        designFont:      latest.font          || '',
        designStyle:     latest.style         || '',
        designScale:     latest.scale         || '',
        designRingSize:  latest.ringSize      || '',
        designPrintMode: latest.printMode     || '',
        designBridging:  latest.bridging      || '',
        designHasImage:  latest.hasCustomImage ? 'Yes' : 'No',
        designPreview:   localStorage.getItem('brander_design_preview') || '',
      })
      await fetch(`${SHEET_URL}?${params.toString()}`, { method: 'GET', mode: 'no-cors' })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = (field) =>
    `w-full bg-white border ${errors[field] ? 'border-red-400' : 'border-stone-200'} hover:border-stone-400 focus:border-[#111111] text-[#111111] rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder-stone-300`

  return (
    <section
      id="waitlist"
      className="py-28 bg-[#FAFAF8] border-b border-stone-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* ── LEFT: Pitch ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-6">Limited Early Access</p>

            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight leading-tight mb-6">
              Be First.<br />Get Yours.
            </h2>

            <p className="text-stone-500 text-base leading-relaxed mb-10 max-w-sm">
              The Brander Roller is in its pre-launch phase. Join the waitlist to
              lock in your early bird price and be first in line when we ship.
            </p>

            {/* Perks */}
            <ul className="space-y-4 mb-12">
              {PERKS.map((perk) => (
                <li key={perk.label} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#111111] mt-2 shrink-0" />
                  <span className="text-stone-600 text-sm leading-relaxed">{perk.label}</span>
                </li>
              ))}
            </ul>

            {/* Counter */}
            <div className="inline-flex items-center gap-4 py-4 border-t border-stone-200 w-full">
              <div className="flex -space-x-2">
                {['bg-stone-700', 'bg-stone-500', 'bg-stone-400', 'bg-stone-300'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#FAFAF8] flex items-center justify-center text-[10px] font-bold text-white`}>
                    {['M','A','K','S'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[#111111] text-sm font-bold">47 people already joined</p>
                <p className="text-stone-400 text-xs">Growing fast — spots are limited</p>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="px-7 pt-7 pb-5 border-b border-stone-100">
                <h3 className="text-xl font-bold text-[#111111] mb-1">Secure Your Spot</h3>
                <p className="text-stone-400 text-sm">Takes 30 seconds. No spam — ever.</p>
              </div>

              <AnimatePresence mode="wait">
                {status === 'done' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-7 py-12 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-5 text-2xl text-[#111111] font-bold">
                      ✓
                    </div>
                    <h4 className="text-2xl font-bold text-[#111111] mb-2">You're on the list!</h4>
                    <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed">
                      We'll reach out personally before launch. Keep an eye on your inbox.
                    </p>
                    <div className="mt-6 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-400">
                      Your details have been saved. We'll contact you via email &amp; WhatsApp.
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} className="px-7 py-6 space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Full Name</label>
                      <input type="text" value={form.name} onChange={set('name')} placeholder="Minto Joy" className={inputCls('name')} />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Email Address</label>
                      <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls('email')} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">WhatsApp Number</label>
                      <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className={inputCls('phone')} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Ready to pay */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">
                        Ready to pre-order at RS 1080/-?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => { setReadyToPay('yes'); setErrors((er) => ({ ...er, readyToPay: '' })) }}
                          className={`py-3 rounded-lg border text-sm font-semibold transition-all ${
                            readyToPay === 'yes'
                              ? 'bg-[#111111] border-[#111111] text-white'
                              : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-[#111111]'
                          }`}
                        >
                          ✓ Yes, I'm in
                        </button>
                        <button
                          type="button"
                          onClick={() => { setReadyToPay('not-yet'); setErrors((er) => ({ ...er, readyToPay: '' })) }}
                          className={`py-3 rounded-lg border text-sm font-semibold transition-all ${
                            readyToPay === 'not-yet'
                              ? 'bg-stone-800 border-stone-700 text-white'
                              : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-[#111111]'
                          }`}
                        >
                          Not yet
                        </button>
                      </div>
                      {errors.readyToPay && <p className="text-red-500 text-xs mt-1">{errors.readyToPay}</p>}
                    </div>

                    {status === 'error' && (
                      <p className="text-red-500 text-xs text-center">
                        Something went wrong. Please try again or WhatsApp us directly.
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="group w-full py-4 bg-[#111111] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {status === 'loading' ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving your spot…
                        </span>
                      ) : (
                        <>
                          Secure My Spot
                          <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-stone-400">
                      No payment now. We'll reach out before launch.
                    </p>

                    {/* Design snapshot badge */}
                    {design.text || design.hasCustomImage ? (
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 mt-1">
                        <span className="text-[#111111] text-base shrink-0">✓</span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">Design captured</p>
                          <p className="text-[10px] text-stone-400 truncate">
                            {design.hasCustomImage
                              ? `Custom image · ${design.ringSize} · ${design.printMode}`
                              : `"${design.text}" · ${design.font} · ${design.ringSize}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 mt-1">
                        <span className="text-stone-300 text-base shrink-0">◎</span>
                        <p className="text-[11px] text-stone-400">
                          Build your stamp in the <a href="#design-lab" className="text-[#111111] font-semibold hover:underline">Design Lab</a> above to attach your pattern
                        </p>
                      </div>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
