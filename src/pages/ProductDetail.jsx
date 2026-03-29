import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarIcon({ fill = 'full', className }) {
  if (fill === 'empty') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="none">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" stroke="#D2D2D7" strokeWidth="1"/>
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 20 20" fill="#FFA41C">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  )
}

function Stars({ rating, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} fill={i <= Math.round(rating) ? 'full' : 'empty'} className={cls} />
      ))}
    </div>
  )
}

// ── Trust Badge ───────────────────────────────────────────────────────────────
function TrustBadge({ icon, text }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <span className="text-xs text-[#424245] leading-snug">{text}</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { productId } = useParams()
  const { products } = useProducts()
  const product = products.find((p) => p.id === productId)
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="pt-40 text-center min-h-screen">
        <p className="text-[#86868B] text-lg mb-4">Product not found.</p>
        <Link to="/shop" className="text-sm font-semibold text-[#1D1D1F] underline underline-offset-4">
          ← Back to Shop
        </Link>
      </div>
    )
  }

  const related = products.filter((p) => p.id !== product.id && p.image).slice(0, 4)

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) add(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const waMsg = encodeURIComponent(
    `Hi ORIC! I'd like to order ${qty}x ${product.name} (${product.priceDisplay}).\nPlease confirm availability and payment details.`
  )

  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* ── Breadcrumb ── */}
      <div className="bg-[#F5F5F7] border-b border-[#D2D2D7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#86868B]">
            <Link to="/" className="hover:text-[#1D1D1F] transition-colors">Home</Link>
            <span>›</span>
            <Link to="/shop" className="hover:text-[#1D1D1F] transition-colors">Shop</Link>
            <span>›</span>
            <Link to={`/shop?cat=${product.category}`} className="hover:text-[#1D1D1F] transition-colors">{product.category}</Link>
            <span>›</span>
            <span className="text-[#1D1D1F] font-medium truncate max-w-[160px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left — image */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24">
              <div className="aspect-square rounded-3xl overflow-hidden bg-[#F5F5F7] border border-[#D2D2D7]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <span className="text-8xl">🖨️</span>
                    <span className="text-xs font-medium text-[#86868B] uppercase tracking-widest">Custom Order</span>
                  </div>
                )}
              </div>
              {product.badge && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 bg-[#1D1D1F] text-white text-[10px] font-semibold tracking-wider rounded-full">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Middle — product info */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#86868B] mb-2">
              ORIC · {product.category}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-sm text-[#86868B] mb-4">{product.tagline}</p>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#F5F5F7]">
                <Stars rating={product.rating} />
                <span className="text-sm text-[#007185] font-medium">
                  {product.rating} · {product.reviews} ratings
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
                {product.preOrder && (
                  <span className="text-xs font-semibold text-[#CC0C39] bg-[#FFF3F3] px-2.5 py-1 rounded-full">
                    Early Bird Price
                  </span>
                )}
              </div>
              <p className="text-xs text-[#86868B]">Inclusive of all taxes · Free delivery across India</p>
            </div>

            {/* Stock + Delivery */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm font-semibold text-green-700">
                  {product.preOrder ? 'Pre-Order Open' : 'In Stock'}
                </span>
              </div>
              <p className="text-sm text-[#424245]">
                <span className="font-medium">Estimated delivery:</span> {product.lead} · Ships pan India
              </p>
              <p className="text-sm text-[#424245]">
                <span className="font-medium">Material:</span> {product.material}
              </p>
            </div>

            {/* About this item */}
            {product.highlights && (
              <div className="mb-6">
                <p className="text-sm font-bold text-[#1D1D1F] mb-3">About this item</p>
                <ul className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#424245] leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D1D1F] mt-1.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-[#F5F5F7] pt-5">
              <p className="text-sm font-bold text-[#1D1D1F] mb-2">Product Description</p>
              <p className="text-sm text-[#424245] leading-relaxed">{product.description}</p>
            </div>
          </motion.div>

          {/* Right — buy box */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="sticky top-24 border border-[#D2D2D7] rounded-2xl p-5 shadow-sm bg-white">

              {/* Price */}
              <p className="text-2xl font-bold text-[#1D1D1F] mb-0.5">{product.priceDisplay}</p>
              <p className="text-xs text-[#86868B] mb-4">Free delivery · All taxes included</p>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm font-semibold text-green-700">
                  {product.preOrder ? 'Pre-Order Open' : 'In Stock'}
                </span>
              </div>

              {/* Qty selector */}
              {product.price && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-[#424245] font-medium">Qty:</span>
                  <div className="flex items-center border border-[#D2D2D7] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-[#1D1D1F] hover:bg-[#F5F5F7] text-sm font-semibold transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-[#1D1D1F] border-x border-[#D2D2D7] min-w-[40px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="px-3 py-1.5 text-[#1D1D1F] hover:bg-[#F5F5F7] text-sm font-semibold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-full text-sm font-bold mb-3 transition-all duration-200 ${
                  added
                    ? 'bg-green-600 text-white scale-95'
                    : product.price
                    ? 'bg-[#FFD814] text-[#1D1D1F] hover:bg-[#F7CA00] active:scale-95'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              >
                {added ? '✓ Added to Cart' : product.price ? 'Add to Cart' : 'Get Quote'}
              </button>

              {/* WhatsApp order */}
              <a
                href={`https://wa.me/918310194953?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full text-sm font-bold bg-[#FFA41C] text-white hover:bg-[#FA8900] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order via WhatsApp
              </a>

              {/* Trust badges */}
              <div className="mt-5 pt-5 border-t border-[#F5F5F7] space-y-3">
                <TrustBadge icon="🛡️" text="Quality guaranteed — full refund if not satisfied" />
                <TrustBadge icon="📦" text="Ships in protective foam packaging" />
                <TrustBadge icon="🚚" text="Free delivery anywhere in India" />
                <TrustBadge icon="🇮🇳" text="Designed & printed in India by ORIC" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Technical Specifications ── */}
        {product.specs && (
          <motion.div
            className="mt-16 border-t border-[#D2D2D7] pt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">Technical Specifications</h2>
            <div className="max-w-3xl overflow-hidden rounded-2xl border border-[#D2D2D7]">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specs).map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-[#F5F5F7]' : 'bg-white'}>
                      <td className="px-6 py-3.5 text-sm font-semibold text-[#1D1D1F] w-2/5 border-r border-[#D2D2D7]">
                        {key}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-[#424245]">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Customers Also Viewed ── */}
        {related.length > 0 && (
          <motion.div
            className="mt-16 border-t border-[#D2D2D7] pt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">Customers Also Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={p.href}
                  className="group block"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F5F7] mb-3 border border-[#D2D2D7]">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🖨️</div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#1D1D1F] leading-snug group-hover:underline underline-offset-2 mb-1">
                    {p.name}
                  </p>
                  {p.rating && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Stars rating={p.rating} />
                      <span className="text-xs text-[#86868B]">{p.reviews}</span>
                    </div>
                  )}
                  <p className="text-sm font-bold text-[#1D1D1F]">{p.priceDisplay}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CTA Banner ── */}
        <motion.div
          className="mt-16 rounded-3xl bg-[#1D1D1F] px-10 py-12 md:px-16 md:py-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3">Need something different?</p>
          <h3 className="text-3xl font-bold text-white mb-4">We print anything.<br /><span className="text-[#86868B]">Just ask.</span></h3>
          <p className="text-[#86868B] text-sm max-w-xs mx-auto mb-7">Send your file or idea. We'll quote within 24 hours.</p>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#1D1D1F] text-sm font-bold rounded-full hover:bg-[#F5F5F7] transition-all"
          >
            Start a Custom Order →
          </a>
        </motion.div>
      </div>
    </div>
  )
}
