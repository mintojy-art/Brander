import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS
// 1. Go to https://sheets.google.com → create a new sheet named "Waitlist"
// 2. Click Extensions → Apps Script
// 3. Delete existing code and paste the script from the README / dev notes
// 4. Click Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the Web App URL and paste it below
// ─────────────────────────────────────────────────────────────────────────────
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxAXWbtjWvWXQTTVIR8pilVJaOgyvRrcjx0W4Kwo_ufDc1qPNZgynLeKRvl2kpnV6AK/exec'

const PERKS = [
  { icon: '🔒', text: 'Locked-in early bird price — RS 1080/-' },
  { icon: '🚀', text: 'Priority dispatch on launch day' },
  { icon: '📞', text: 'Direct line to the founder' },
  { icon: '🎨', text: 'Custom roll design assistance included' },
]

// Read the latest design the user built in Design Lab
function getDesign() {
  try { return JSON.parse(localStorage.getItem('brander_design') || '{}') } catch { return {} }
}

export default function WaitlistSection() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '' })
  const [readyToPay, setReadyToPay] = useState(null)   // 'yes' | 'not-yet' | null
  const [status, setStatus]   = useState('idle')       // idle | loading | done | error
  const [errors, setErrors]   = useState({})
  const [design, setDesign]   = useState({})

  // Refresh design snapshot on mount + whenever window gets focus (user scrolls back up, edits, scrolls down)
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
    if (!form.name.trim())                        e.name  = 'Name is required'
    if (!form.email.trim())                       e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))   e.email = 'Enter a valid email'
    if (!form.phone.trim())                       e.phone = 'WhatsApp number is required'
    if (!readyToPay)                              e.readyToPay = 'Please select an option'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setStatus('loading')
    try {
      // GET + URL params is the most reliable approach for Google Apps Script
      // (POST with no-cors can be silently dropped due to redirect handling)
      const latest = getDesign()   // always grab freshest snapshot at submit time
      const params = new URLSearchParams({
        name:       form.name.trim(),
        email:      form.email.trim(),
        phone:      form.phone.trim(),
        readyToPay: readyToPay === 'yes' ? 'Yes — Ready to pay' : 'Not yet',
        // design data
        designText:      latest.text          || '(none)',
        designFont:      latest.font          || '',
        designStyle:     latest.style         || '',
        designScale:     latest.scale         || '',
        designRingSize:  latest.ringSize      || '',
        designPrintMode: latest.printMode     || '',
        designBridging:  latest.bridging      || '',
        designHasImage:  latest.hasCustomImage ? 'Yes' : 'No',
      })
      await fetch(`${SHEET_URL}?${params.toString()}`, {
        method: 'GET',
        mode:   'no-cors',
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = (field) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500' : 'border-gray-700/60'} hover:border-gray-500 focus:border-red-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-gray-600`

  return (
    <section
      id="waitlist"
      className="py-28 border-t border-gray-900 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d0f14 0%, #0a0a0c 50%, #0d0f14 100%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Red glow from bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(220,38,38,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT: Pitch ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/20 border border-red-500/25 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Limited Early Access</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
              Be First.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-600">
                Get Yours.
              </span>
            </h2>

            <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-md">
              The Brander 15 is in its pre-launch phase. Join the waitlist now to
              lock in your early bird price and be first in line when we ship.
            </p>

            {/* Perks */}
            <ul className="space-y-4 mb-10">
              {PERKS.map((perk) => (
                <li key={perk.text} className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{perk.icon}</span>
                  <span className="text-gray-300 text-sm leading-relaxed">{perk.text}</span>
                </li>
              ))}
            </ul>

            {/* Counter pill */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-gray-800 bg-white/[0.03]">
              <div className="flex -space-x-2">
                {['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-red-700'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white`}>
                    {['M','A','K','S'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-bold">47 people already joined</p>
                <p className="text-gray-600 text-xs">Growing fast — spots are limited</p>
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
            <div
              className="rounded-2xl border border-gray-800/80 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)' }}
            >
              {/* Card header */}
              <div className="px-7 pt-7 pb-5 border-b border-gray-800/60">
                <h3 className="text-xl font-bold text-white mb-1">Secure Your Spot</h3>
                <p className="text-gray-500 text-sm">Takes 30 seconds. No spam — ever.</p>
              </div>

              <AnimatePresence mode="wait">
                {status === 'done' ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-7 py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-3xl">
                      ✓
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">You're on the list!</h4>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                      We'll reach out personally before launch. Keep an eye on your inbox.
                    </p>
                    <div className="mt-6 px-4 py-3 rounded-xl bg-white/[0.04] border border-gray-800 text-xs text-gray-500">
                      Your details have been saved. We'll contact you via email &amp; WhatsApp.
                    </div>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    className="px-7 py-6 space-y-4"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Minto Joy"
                        className={inputCls('name')}
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@example.com"
                        className={inputCls('email')}
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="+91 98765 43210"
                        className={inputCls('phone')}
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Ready to pay */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">
                        Ready to pre-order at RS 1080/-?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => { setReadyToPay('yes'); setErrors((er) => ({ ...er, readyToPay: '' })) }}
                          className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                            readyToPay === 'yes'
                              ? 'bg-red-600 border-red-500 text-white shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                              : 'bg-white/5 border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-white'
                          }`}
                        >
                          ✓ Yes, I'm in
                        </button>
                        <button
                          type="button"
                          onClick={() => { setReadyToPay('not-yet'); setErrors((er) => ({ ...er, readyToPay: '' })) }}
                          className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                            readyToPay === 'not-yet'
                              ? 'bg-gray-700 border-gray-500 text-white'
                              : 'bg-white/5 border-gray-700/60 text-gray-400 hover:border-gray-500 hover:text-white'
                          }`}
                        >
                          Not yet
                        </button>
                      </div>
                      {errors.readyToPay && <p className="text-red-400 text-xs mt-1">{errors.readyToPay}</p>}
                    </div>

                    {/* Error message */}
                    {status === 'error' && (
                      <p className="text-red-400 text-xs text-center">
                        Something went wrong. Please try again or WhatsApp us directly.
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="group w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_24px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.55)] flex items-center justify-center gap-2 mt-2"
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

                    <p className="text-center text-[11px] text-gray-600">
                      No payment now. We'll reach out before launch.
                    </p>

                    {/* Design snapshot badge */}
                    {design.text || design.hasCustomImage ? (
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-green-500/20 bg-green-900/10 mt-1">
                        <span className="text-green-400 text-base shrink-0">✓</span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Design captured</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {design.hasCustomImage
                              ? `Custom image · ${design.ringSize} · ${design.printMode}`
                              : `"${design.text}" · ${design.font} · ${design.ringSize}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-800 bg-white/[0.02] mt-1">
                        <span className="text-gray-600 text-base shrink-0">🎨</span>
                        <p className="text-[11px] text-gray-600">
                          Build your stamp in the <a href="#design-lab" className="text-red-400 hover:underline">Design Lab</a> above to attach your pattern
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
