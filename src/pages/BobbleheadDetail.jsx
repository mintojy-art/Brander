import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBobbleheadOccasions } from '../hooks/useBobbleheadOccasions'
import { useSEO } from '../hooks/useSEO'

export default function BobbleheadDetail() {
  const { id } = useParams()
  const { occasions } = useBobbleheadOccasions()
  const occasion = occasions.find((o) => o.id === id)
  const [activeImg, setActiveImg] = useState(0)

  useSEO({
    title: occasion ? `${occasion.title} Bobbleheads — ORIC` : 'Bobbleheads — ORIC',
    description: occasion?.description || 'Custom bobbleheads made in Bangalore, India.',
  })

  if (!occasion) {
    return (
      <div className="pt-[140px] pb-28 text-center min-h-screen">
        <p className="text-[#86868B] text-lg mb-4">Occasion not found.</p>
        <Link to="/" className="text-sm font-semibold text-[#1D1D1F] underline underline-offset-4">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const images = (occasion.images || []).filter(Boolean)
  const related = occasions.filter((o) => o.id !== occasion.id).slice(0, 4)

  const waMsg = encodeURIComponent(
    `Hi ORIC! I'd like a custom bobblehead for ${occasion.title}. Can you share pricing and next steps?`
  )

  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="bg-[#F5F5F7] border-b border-[#D2D2D7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#86868B]">
            <Link to="/" className="hover:text-[#1D1D1F] transition-colors">Home</Link>
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
                  <div className="w-full h-full flex items-center justify-center text-8xl opacity-60">
                    {occasion.icon || '🎎'}
                  </div>
                )}
                {occasion.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/15 border border-white/25 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
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
                          ? 'border-[#1D1D1F] ring-1 ring-[#1D1D1F]'
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

          {/* Right — info + CTA */}
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
            {occasion.tagline && <p className="text-base text-[#86868B] mb-6">{occasion.tagline}</p>}

            {occasion.price_display && (
              <p className="text-2xl font-bold text-[#1D1D1F] mb-6">{occasion.price_display}</p>
            )}

            {occasion.description && (
              <p className="text-sm text-[#424245] leading-relaxed mb-8 whitespace-pre-line">{occasion.description}</p>
            )}

            <a
              href={`https://wa.me/918310194953?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1D1D1F] text-white text-sm font-bold rounded-full hover:bg-[#424245] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {occasion.cta_text || 'Get a Quote'}
            </a>

            <div className="mt-8 pt-8 border-t border-[#F5F5F7] space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">🛡️</span>
                <span className="text-xs text-[#424245] leading-snug">Quality guaranteed — full refund if not satisfied</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">📦</span>
                <span className="text-xs text-[#424245] leading-snug">Ships in protective foam packaging</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">🇮🇳</span>
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
                  <Link key={o.id} to={`/bobbleheads/${o.id}`} className="group block">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#1D1D1F] mb-3 border border-[#D2D2D7] flex items-center justify-center">
                      {img
                        ? <img src={img} alt={o.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <span className="text-5xl opacity-60">{o.icon || '🎎'}</span>
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
          className="mt-16 rounded-3xl bg-[#1D1D1F] px-10 py-12 md:px-16 md:py-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3">Not sure what you need?</p>
          <h3 className="text-3xl font-bold text-white mb-4">Just send us a photo.<br /><span className="text-[#86868B]">We'll take it from there.</span></h3>
          <p className="text-[#86868B] text-sm max-w-xs mx-auto mb-7">No file needed. We'll quote within 24 hours.</p>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#1D1D1F] text-sm font-bold rounded-full hover:bg-[#F5F5F7] transition-all"
          >
            Message Us on WhatsApp →
          </a>
        </motion.div>
      </div>
    </div>
  )
}
