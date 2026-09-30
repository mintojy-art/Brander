'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import WishlistButton from '@/components/WishlistButton'

// Shared between MaskStudioSection (Home) and the /mask-studio page, so the
// two never drift apart. Portrait "framed" card with a spotlight vignette —
// the visual signature of the Mask Studio identity.
export default function MaskCard({ product, delay = 0 }) {
  const { add } = useCart()

  return (
    <motion.div
      className="group relative aspect-[3/4] overflow-hidden border border-white/10 bg-[#0B0B0D]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={product.href} className="absolute inset-0 block">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-5xl">🎭</div>
        )}
        <div
          className="absolute inset-0 transition-opacity duration-500 opacity-90 group-hover:opacity-70"
          style={{ background: 'radial-gradient(ellipse at 50% 35%, transparent 30%, rgba(0,0,0,0.75) 100%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
      </Link>

      <WishlistButton product={product} className="top-3 right-3" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3
          className="text-lg text-white leading-snug mb-1"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/70">{product.priceDisplay}</span>
          <button
            onClick={(e) => { e.preventDefault(); add(product) }}
            className="shrink-0 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white border border-[#A32638] bg-[#A32638]/20 hover:bg-[#A32638] transition-colors"
          >
            {product.price ? 'Add to Cart' : 'Get Quote'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
