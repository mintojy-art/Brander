import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { products, categories } from '../data/products'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { add } = useCart()

  return (
    <motion.div
      className="group bg-white rounded-3xl overflow-hidden border border-[#D2D2D7] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Image */}
      <div className="aspect-square bg-[#F5F5F7] relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-[#E8E8ED] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
            </div>
            <span className="text-xs font-medium text-[#86868B] uppercase tracking-widest">Custom Order</span>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#1D1D1F] text-white text-[10px] font-semibold tracking-wider rounded-full">
            {product.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-1">{product.category}</p>
        <h3 className="text-base font-semibold text-[#1D1D1F] mb-1 leading-snug">{product.name}</h3>
        <p className="text-sm text-[#86868B] leading-relaxed mb-1">{product.tagline}</p>
        <p className="text-xs text-[#86868B] mb-5">Lead time: {product.lead}</p>

        <div className="border-t border-[#F5F5F7] pt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
          <div className="flex gap-2">
            {product.href && (
              <Link
                to={product.href}
                className="px-3.5 py-1.5 text-xs font-medium text-[#424245] border border-[#D2D2D7] rounded-full hover:bg-[#F5F5F7] transition-all"
              >
                Details
              </Link>
            )}
            <button
              onClick={() => add(product)}
              className="px-4 py-1.5 text-xs font-semibold bg-[#1D1D1F] text-white rounded-full hover:bg-[#424245] transition-all"
            >
              {product.price ? 'Add to Cart' : 'Get Quote'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Shop() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? products : products.filter((p) => p.category === active)

  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Header */}
      <div className="bg-[#F5F5F7] border-b border-[#D2D2D7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            ORIC Shop
          </motion.p>
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-[#1D1D1F] leading-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Shop All Products
          </motion.h1>
          <motion.p
            className="text-[#86868B] mt-3 max-w-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Custom 3D prints, tools, figurines, and more. All made on-demand.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                active === cat
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED] hover:text-[#1D1D1F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Custom order CTA */}
        <motion.div
          className="mt-16 rounded-3xl bg-[#1D1D1F] p-10 md:p-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3">Can't find it?</p>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            We print anything.<br />
            <span className="text-[#86868B]">Just ask.</span>
          </h3>
          <p className="text-[#86868B] text-sm max-w-sm mx-auto mb-8">
            Send us your STL, reference image, or idea. We'll quote within 24 hours.
          </p>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-[#F5F5F7] transition-all"
          >
            Start a Custom Order
          </a>
        </motion.div>
      </div>
    </div>
  )
}
