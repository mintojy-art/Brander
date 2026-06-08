import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('https://formsubmit.co/ajax/mintojy@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(e.target),
      })
      const json = await res.json()
      if (json.success === 'true' || json.success === true) {
        setStatus('success')
        e.target.reset()
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 4000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-[#0f1012] to-black">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Get In Touch</p>
          <h2 className="text-3xl font-bold text-white mb-4">Custom Orders & Inquiries</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
            Need a custom logo scroll or bulk order for your team? Send us your SVG file and we'll
            check feasibility within 24 hours.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gray-900/40 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Name',  type: 'text',  placeholder: 'Your name',      name: 'name'  },
              { label: 'Email', type: 'email', placeholder: 'your@email.com', name: 'email' },
            ].map(({ label, type, placeholder, name }) => (
              <div key={label}>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <input
                  required
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  className="w-full bg-gray-800/80 border border-gray-700 focus:border-red-500 rounded-lg px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-600 text-sm"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
              Message / SVG Link
            </label>
            <textarea
              required
              rows="4"
              name="message"
              placeholder="Describe your project or paste an SVG link..."
              className="w-full bg-gray-800/80 border border-gray-700 focus:border-red-500 rounded-lg px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-600 text-sm resize-none"
            />
          </div>

          <motion.button
            type="submit"
            disabled={status !== 'idle'}
            className={`w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
              status === 'success'
                ? 'bg-green-600 text-white cursor-default'
                : status === 'error'
                ? 'bg-red-600 text-white cursor-default'
                : status === 'submitting'
                ? 'bg-gray-700 text-gray-400 cursor-wait'
                : 'bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]'
            }`}
            whileTap={{ scale: status === 'idle' ? 0.98 : 1 }}
          >
            {status === 'idle'       && 'Send Inquiry'}
            {status === 'submitting' && 'Processing…'}
            {status === 'success'    && '✓  Message Sent!'}
            {status === 'error'      && '✕  Failed — Try Again'}
          </motion.button>
        </motion.form>
      </div>
    </section>
  )
}
