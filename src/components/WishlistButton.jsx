'use client'

import { useWishlist } from '@/context/WishlistContext'

// A circular heart toggle, meant to overlay a product card's image (caller
// positions it via className, e.g. "absolute top-4 right-4"). Always calls
// preventDefault/stopPropagation since it's typically nested inside a
// product-card <Link>.
export default function WishlistButton({ product, className = '', size = 16 }) {
  const { isWishlisted, toggle } = useWishlist()
  const active = isWishlisted(product.id)

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product) }}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      // .y2k-chrome-surface sets `position: relative` as an unlayered CSS
      // rule, which beats Tailwind's `absolute` utility (layered) in the
      // cascade regardless of source order — force it via inline style,
      // which always wins, instead of relying on the className.
      style={{ position: 'absolute' }}
      className={`y2k-chrome-surface w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${className}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? '#F37121' : 'none'} stroke={active ? '#F37121' : '#424245'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    </button>
  )
}
