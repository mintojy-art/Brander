'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Y2kIcon from '@/components/Y2kIcon'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'

// Falls back to these exact values if the table isn't set up yet, or a
// field is missing — kept in sync with BOBBLEHEAD_PRICING_DEFAULTS in
// AdminClient.jsx.
const DEFAULT_BOBBLEHEAD_PRICING = {
  small: 1999, medium: 2999, large: 3999, xl: 4999,
  extraPersonFee: 1500,
  bobbleHeadFee: 500,
}

const SIZES = [
  { id: 'small',  label: 'Small',  hint: '6"'  },
  { id: 'medium', label: 'Medium', hint: '8"'  },
  { id: 'large',  label: 'Large',  hint: '10"' },
  { id: 'xl',     label: 'XL',     hint: '12"' },
]

const HEAD_TYPES = [
  { id: 'bobble',     label: 'Bobble Head' },
  { id: 'stationary', label: 'Stationary Head' },
]

const PERSON_COUNTS = [
  { id: 1, label: 'Single Person' },
  { id: 2, label: 'Couple (2 People)' },
  { id: 3, label: 'Family (3 People)' },
  { id: 4, label: 'Group (4 People)' },
]

export default function BobbleheadDetailClient({ occasion, related }) {
  const [activeImg, setActiveImg] = useState(0)
  const images = (occasion.images || []).filter(Boolean)
  const { add } = useCart()

  const [pricing, setPricing]         = useState(DEFAULT_BOBBLEHEAD_PRICING)
  const [headType, setHeadType]       = useState('bobble')
  const [size, setSize]               = useState('small')
  const [personCount, setPersonCount] = useState(1)
  const [proofRequest, setProofRequest] = useState(false)
  const [added, setAdded]             = useState(false)

  // Live pricing from the admin dashboard — falls back to
  // DEFAULT_BOBBLEHEAD_PRICING (silently) if Supabase isn't configured or
  // the table isn't set up yet.
  useEffect(() => {
    if (!supabase) return
    supabase.from('bobblehead_pricing').select('*').eq('id', 1).single().then(({ data }) => {
      if (!data) return
      setPricing({
        small: data.small_price ?? DEFAULT_BOBBLEHEAD_PRICING.small,
        medium: data.medium_price ?? DEFAULT_BOBBLEHEAD_PRICING.medium,
        large: data.large_price ?? DEFAULT_BOBBLEHEAD_PRICING.large,
        xl: data.xl_price ?? DEFAULT_BOBBLEHEAD_PRICING.xl,
        extraPersonFee: data.extra_person_fee ?? DEFAULT_BOBBLEHEAD_PRICING.extraPersonFee,
        bobbleHeadFee: data.bobble_head_fee ?? DEFAULT_BOBBLEHEAD_PRICING.bobbleHeadFee,
      })
    })
  }, [])

  const totalPrice = pricing[size]
    + (personCount - 1) * pricing.extraPersonFee
    + (headType === 'bobble' ? pricing.bobbleHeadFee : 0)

  const sizeInfo = SIZES.find((s) => s.id === size)
  const headInfo = HEAD_TYPES.find((h) => h.id === headType)
  const personInfo = PERSON_COUNTS.find((p) => p.id === personCount)

  const configLines = [
    `Occasion: ${occasion.title}`,
    `Size: ${sizeInfo.label} (${sizeInfo.hint})`,
    `Head: ${headInfo.label}`,
    `People: ${personInfo.label}`,
    proofRequest ? 'Proof requested before printing' : null,
  ].filter(Boolean)

  const waMsg = encodeURIComponent(
    `Hi ORIC! I'd like to order a custom bobblehead:\n\n${configLines.join('\n')}\nEstimated price: ₹${totalPrice.toLocaleString()}\n\n` +
    `(Attaching my reference photo here)\n\nPlease confirm final pricing and next steps.`
  )

  const handleAddToCart = () => {
    add({
      id: `bobblehead-${occasion.id}-${size}-${personCount}-${headType}`,
      name: `Custom Bobblehead — ${occasion.title}`,
      tagline: configLines.join(' · '),
      price: totalPrice,
      priceDisplay: `₹${totalPrice.toLocaleString()}`,
      category: 'Bobbleheads',
      image: images[0] || null,
      badge: 'Custom Order',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="bg-[#F5F5F7] border-b border-[#D2D2D7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#86868B]">
            <Link href="/" className="hover:text-[#1D1D1F] transition-colors">Home</Link>
            <span>›</span>
            <span className="text-[#1D1D1F] font-medium">{occasion.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left — image */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24">
              <div className="aspect-square rounded-3xl overflow-hidden bg-[#1D1D1F] border border-[#D2D2D7] relative">
                {images.length > 0 ? (
                  <img src={images[activeImg]} alt={occasion.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-80">
                    <Y2kIcon emoji={occasion.icon || '🎎'} size={120} className="text-white" />
                  </div>
                )}
                {occasion.badge && (
                  <div className="y2k-lime-glow absolute top-4 left-4 px-3 py-1 bg-[#B6FF3C] text-[#1D1D1F] text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {occasion.badge}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                        i === activeImg
                          ? 'border-[#F37121] ring-1 ring-[#F37121]'
                          : 'border-[#D2D2D7] hover:border-[#86868B]'
                      }`}
                    >
                      <img src={img} alt={`${occasion.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right — configurator */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#86868B] mb-2">
              ORIC · Bobbleheads
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] leading-tight mb-3">
              {occasion.title}
            </h1>
            {occasion.tagline && <p className="text-base text-[#86868B] mb-4">{occasion.tagline}</p>}

            {occasion.description && (
              <p className="text-sm text-[#424245] leading-relaxed mb-6 whitespace-pre-line">{occasion.description}</p>
            )}

            {/* Configurator card */}
            <div className="y2k-chrome-surface rounded-2xl p-5 sm:p-6 mb-6">
              <div className="flex items-center gap-2 mb-5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <h3 className="text-base font-semibold text-[#1D1D1F]">Configure Your Bobblehead</h3>
              </div>

              {/* Head connection */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Head Connection</label>
                <div className="grid grid-cols-2 gap-2">
                  {HEAD_TYPES.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHeadType(h.id)}
                      className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border transition-all ${
                        headType === h.id
                          ? 'border-[#F37121] bg-[#FFF7ED] text-[#1D1D1F]'
                          : 'border-[#D2D2D7] text-[#424245] hover:border-[#86868B]'
                      }`}
                    >
                      <span className="text-sm font-medium">{h.label}</span>
                      {h.id === 'bobble' && pricing.bobbleHeadFee > 0 && (
                        <span className="text-[10px] text-[#86868B]">+₹{pricing.bobbleHeadFee.toLocaleString()}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id)}
                      className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border transition-all ${
                        size === s.id
                          ? 'border-[#F37121] bg-[#FFF7ED]'
                          : 'border-[#D2D2D7] hover:border-[#86868B]'
                      }`}
                    >
                      <span className="text-sm font-semibold text-[#1D1D1F]">{s.label}</span>
                      <span className="text-[10px] text-[#86868B]">{s.hint}</span>
                      <span className="text-xs font-bold text-[#1D1D1F]">₹{pricing[s.id].toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Person in frame */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Person in Frame</label>
                <div className="relative">
                  <select
                    value={personCount}
                    onChange={(e) => setPersonCount(Number(e.target.value))}
                    className="w-full text-sm text-[#1D1D1F] bg-white border border-[#D2D2D7] rounded-xl px-3 py-2.5 pr-8 outline-none focus:border-[#1D1D1F] transition-colors appearance-none cursor-pointer"
                  >
                    {PERSON_COUNTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}{p.id > 1 ? ` (+₹${(pricing.extraPersonFee * (p.id - 1)).toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              {/* Reference photo */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">Reference Photo</label>
                <div className="flex items-center gap-3 border border-dashed border-[#D2D2D7] rounded-xl px-4 py-3">
                  <span className="w-8 h-8 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
                    <Y2kIcon emoji="🖼️" size={18} className="text-[#F37121]" />
                  </span>
                  <span className="text-sm text-[#424245]">You'll attach your reference photo directly in WhatsApp after tapping below</span>
                </div>
              </div>

              {/* Proof request */}
              <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Request a proof before printing?</label>
                <button
                  type="button"
                  onClick={() => setProofRequest((v) => !v)}
                  className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${proofRequest ? 'bg-[#1D1D1F]' : 'bg-[#D2D2D7]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${proofRequest ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Price + actions */}
              <div className="border-t border-[#F5F5F7] pt-5">
                <div className="rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] p-4 mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-1">Estimated Price</p>
                  <p className="text-2xl font-bold text-[#1D1D1F]">₹{totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] text-[#86868B] mt-0.5">Inclusive of all taxes · Confirmed at order</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 rounded-full text-sm font-bold transition-all duration-200 ${
                      added ? 'bg-green-600 text-white' : 'y2k-chrome-surface y2k-shine text-[#1D1D1F] overflow-hidden'
                    }`}
                  >
                    {added ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                  <a
                    href={`https://wa.me/918310194953?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="y2k-accent-surface y2k-shine flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-white text-sm font-bold rounded-full transition-all overflow-hidden"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Order via WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Y2kIcon emoji="🛡️" size={20} className="shrink-0 mt-0.5 text-[#F37121]" />
                <span className="text-xs text-[#424245] leading-snug">Quality guaranteed — full refund if not satisfied</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Y2kIcon emoji="📦" size={20} className="shrink-0 mt-0.5 text-[#F37121]" />
                <span className="text-xs text-[#424245] leading-snug">Ships in protective foam packaging</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Y2kIcon emoji="🇮🇳" size={20} className="shrink-0 mt-0.5 text-[#F37121]" />
                <span className="text-xs text-[#424245] leading-snug">Designed &amp; printed in India by ORIC</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Other occasions */}
        {related.length > 0 && (
          <motion.div
            className="mt-16 border-t border-[#D2D2D7] pt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">Other Occasions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((o) => {
                const img = (o.images || []).filter(Boolean)[0]
                return (
                  <Link key={o.id} href={`/bobbleheads/${o.id}`} className="y2k-lift group block">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#1D1D1F] mb-3 border border-[#D2D2D7] flex items-center justify-center">
                      {img
                        ? <img src={img} alt={o.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <Y2kIcon emoji={o.icon || '🎎'} size={56} className="opacity-80 text-white" />
                      }
                    </div>
                    <p className="text-sm font-semibold text-[#1D1D1F] leading-snug group-hover:underline underline-offset-2">
                      {o.title}
                    </p>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* CTA banner */}
        <motion.div
          className="y2k-dark-surface mt-16 rounded-3xl px-10 py-12 md:px-16 md:py-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFA35C] mb-3">Not sure what you need?</p>
          <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-orbitron)' }}>Just send us a photo.<br /><span className="text-[#86868B]">We'll take it from there.</span></h3>
          <p className="text-[#86868B] text-sm max-w-xs mx-auto mb-7">No file needed. We'll quote within 24 hours.</p>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="y2k-chrome-surface y2k-shine inline-flex items-center gap-2 px-8 py-3.5 text-[#1D1D1F] text-sm font-bold rounded-full transition-all overflow-hidden"
          >
            Message Us on WhatsApp →
          </a>
        </motion.div>
      </div>
    </div>
  )
}
