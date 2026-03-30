import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useProducts } from '../hooks/useProducts'
import { categories as staticCategories } from '../data/products'
import { useSEO } from '../hooks/useSEO'

function StarMini({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-3 h-3" viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#FFA41C' : 'none'} stroke={i <= Math.round(rating) ? 'none' : '#D2D2D7'} strokeWidth="1">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ProductCard({ product }) {
  const { add } = useCart()

  return (
    <motion.div
      className="group bg-white rounded-3xl overflow-hidden border border-[#D2D2D7] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Image */}
      <Link to={product.href} className="block aspect-square bg-[#F5F5F7] relative overflow-hidden">
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
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-1">{product.category}</p>
        <Link to={product.href} className="block">
          <h3 className="text-sm font-semibold text-[#1D1D1F] mb-1 leading-snug hover:underline underline-offset-2">{product.name}</h3>
        </Link>
        <p className="text-xs text-[#86868B] leading-relaxed mb-2 line-clamp-2">{product.tagline}</p>

        {/* First reviewer nudge for pre-order items */}
        {product.preOrder && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded-full">Be our first reviewer</span>
          </div>
        )}

        <p className="text-xs text-[#86868B] mb-4">Lead time: {product.lead}</p>

        <div className="mt-auto border-t border-[#F5F5F7] pt-4 flex items-center justify-between">
          <span className="text-base font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
          <div className="flex gap-2">
            <Link
              to={product.href}
              className="px-3 py-1.5 text-xs font-medium text-[#424245] border border-[#D2D2D7] rounded-full hover:bg-[#F5F5F7] transition-all"
            >
              Details
            </Link>
            <button
              onClick={() => add(product)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#1D1D1F] text-white rounded-full hover:bg-[#424245] transition-all"
            >
              {product.price ? 'Add' : 'Quote'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Shop() {
  const { products, loading } = useProducts()
  const [active, setActive] = useState('All')
  const categories = ['All', ...new Set(products.map(p => p.category))]
  const filtered = active === 'All' ? products : products.filter((p) => p.category === active)

  useSEO({
    title: 'Shop — 3D Printed Products Bangalore',
    description: 'Browse ORIC\'s shop of 3D printed figurines, prototypes, custom parts, toys and more. Order online and get delivered anywhere in India.',
  })

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

        {/* 'Got a photo?' banner */}
        <motion.div
          className="mb-8 rounded-3xl overflow-hidden border border-[#D2D2D7] flex flex-col sm:flex-row items-stretch"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <div className="flex-1 bg-[#FFF7ED] px-7 py-7 flex flex-col justify-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EA580C]">Most Popular Request</span>
            <h3 className="text-lg font-bold text-[#1D1D1F] leading-snug">Have a photo?<br />We'll turn it into a 3D figurine.</h3>
            <p className="text-sm text-[#424245]">Send us any image on WhatsApp — pet, person, character, idol — and we'll quote within 24 hours. No STL file needed.</p>
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 self-start inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all"
            >
              Send Your Photo →
            </a>
          </div>
          <div className="bg-[#FEF3C7] flex items-center justify-center px-8 py-6 sm:py-0">
            <span className="text-6xl">🖼️</span>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Shipping info banner */}
        <div className="mt-14 mb-2 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <div>
              <p className="text-sm font-semibold text-[#1D1D1F]">Shipping across India</p>
              <p className="text-xs text-[#86868B] mt-0.5">Bangalore: ₹40–80 · Rest of India: ₹80–150 · Delivered via Shiprocket / Delhivery</p>
            </div>
          </div>
          <p className="text-xs text-[#86868B] sm:text-right">Print time + 2–4 days transit.<br />Exact cost confirmed at order.</p>
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
