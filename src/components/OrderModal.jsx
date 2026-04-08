import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WA_NUMBER = '918310194953'

function StepRow({ num, done, icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
        done ? 'bg-[#22C55E] text-white' : 'bg-[#1D1D1F] text-white'
      }`}>
        {done
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          : num}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1D1D1F] leading-snug">{title}</p>
        {desc && <p className="text-xs text-[#86868B] mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className="text-lg flex-shrink-0 mt-0.5">{icon}</div>
    </div>
  )
}

export default function OrderModal({
  isOpen,
  onClose,
  type = 'print',        // 'lithophane' | 'print'
  summary = [],
  filename = '',
  whatsappMsg = '',      // pre-encoded text for the wa.me link
  stlBuf = null,         // ArrayBuffer for direct download link inside modal
  imageFile = null,      // original File uploaded by user (lithophane only)
}) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  // Download handler: create blob + click synchronously inside user gesture (works on all real browsers)
  const handleDownload = () => {
    if (!stlBuf) return
    const url = URL.createObjectURL(new Blob([stlBuf], { type: 'application/octet-stream' }))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 300)
  }

  const handleDownloadPhoto = () => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    const a = document.createElement('a')
    a.href = url
    a.download = imageFile.name || 'lithophane-photo'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 300)
  }

  // Detect in-app browsers (Google app, Instagram, Facebook, etc.) — WebViews block downloads
  const isInAppBrowser = /GSA\/|FBAN|FBAV|Instagram|LinkedInApp|Twitter|Line\/|MicroMessenger|Snapchat/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  )

  const isLitho = type === 'lithophane'

  const steps = isLitho
    ? [
        {
          num: 1, done: false,
          title: 'Download the STL file & your photo',
          desc: 'Tap both download buttons below — you\'ll attach them in WhatsApp.',
          icon: '📥',
        },
        {
          num: 2, done: false,
          title: 'Tap the WhatsApp button below',
          desc: 'It opens a chat with us — your order details are already typed.',
          icon: '💬',
        },
        {
          num: 3, done: false,
          title: 'Attach the STL + photo and send',
          desc: 'In WhatsApp tap 📎 → Files → select both the STL and the photo → Send.',
          icon: '📎',
        },
      ]
    : [
        {
          num: 1, done: false,
          title: 'Tap the WhatsApp button below',
          desc: 'It opens a chat with us — your print specs are already typed.',
          icon: '💬',
        },
        {
          num: 2, done: false,
          title: 'Attach your STL file',
          desc: 'In WhatsApp tap 📎 → Files — select the STL file you uploaded.',
          icon: '📎',
        },
        {
          num: 3, done: false,
          title: 'Send to place your order',
          desc: "We'll confirm your specs and price within 24 hours.",
          icon: '✅',
        },
      ]

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${whatsappMsg}`

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
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-1">
                  {isLitho ? 'Lithophane Order' : 'Custom Print Order'}
                </p>
                <h2 className="text-xl font-bold text-white">
                  {isLitho ? 'Your STL is ready!' : 'Almost there!'}
                </h2>
                <p className="text-sm text-[#86868B] mt-1">
                  Complete your order on WhatsApp in 3 steps.
                </p>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Order summary */}
                {summary.length > 0 && (
                  <div className="bg-[#F5F5F7] rounded-2xl px-4 py-3.5 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868B] mb-2.5">Order Details</p>
                    {summary.map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#86868B]">{label}</span>
                        <span className="text-xs font-semibold text-[#1D1D1F] text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Steps */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868B]">How to complete</p>
                  {steps.map((s) => <StepRow key={s.num} {...s} />)}
                </div>

                {/* Step 1 download buttons for lithophane */}
                {isLitho && stlBuf && (
                  isInAppBrowser ? (
                    <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-4 py-3.5 flex gap-3 items-start">
                      <span className="text-lg flex-shrink-0">⚠️</span>
                      <div>
                        <p className="text-xs font-semibold text-[#92400E]">Open in Chrome or Safari</p>
                        <p className="text-xs text-[#B45309] mt-0.5 leading-relaxed">
                          This browser can't download files. Tap the <strong>⋮ menu → Open in Chrome</strong> (Android) or <strong>Open in Safari</strong> (iPhone) to download your STL and photo.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#1D1D1F] hover:bg-[#424245] active:scale-[0.98] text-white text-sm font-semibold rounded-2xl transition-all"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download STL File
                      </button>
                      {imageFile && (
                        <button
                          onClick={handleDownloadPhoto}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] active:scale-[0.98] text-[#1D1D1F] text-sm font-semibold rounded-2xl transition-all border border-[#D2D2D7]"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          Download Photo
                        </button>
                      )}
                    </div>
                  )
                )}

                {/* WhatsApp button — opens directly to owner's chat */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#25D366] hover:bg-[#1DAA54] active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Open WhatsApp to Order
                </a>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
