'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { UploadCloud, ClipboardCheck, PackageCheck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Y2kIcon from '@/components/Y2kIcon'
import ProductCarousel from '@/components/ProductCarousel'
import TrustBadgeRow from '@/components/TrustBadgeRow'
import BobbleheadCollections from '@/components/BobbleheadCollections'
import Testimonials from '@/components/Testimonials'
import InstagramFeed from '@/components/InstagramFeed'
import FAQSection from '@/components/FAQSection'

const PrintConfigurator = dynamic(() => import('@/components/PrintConfigurator'), { ssr: false })

const services = [
  { icon: '⚙️', title: 'Small Batch Manufacturing', desc: 'From 5 to 500 units — consistent quality, no MOQ.',   href: '/services#manufacturing' },
  { icon: '🧸', title: '3D Printed Toys',           desc: 'Safe, colourful, custom articulated toys and playsets.', href: '/services#toys'          },
  { icon: '🖨️', title: 'Custom 3D Prints',          desc: 'Upload your file. We print, post-process, and deliver.', href: '/services#custom'        },
  { icon: '🔬', title: 'Prototyping',                desc: 'CAD to hand in 3–5 days. Functional, tight tolerances.', href: '/services#prototyping'   },
  { icon: '🗿', title: 'Figurines',                  desc: 'Characters, miniatures, collectibles — printed to life.',  href: '/services#figurines'    },
  { icon: '🎎', title: 'Bobbleheads',                desc: 'Custom bobbleheads of you, your pet, or anyone.',          href: '/services#bobbleheads'   },
  { icon: '🪔', title: 'Idols & Models',             desc: 'Sacred deity models and detailed decor pieces.',          href: '/services#idols'         },
  { icon: '🧲', title: 'Accessories',                desc: 'Clips, mounts, brackets, organizers — any geometry.',    href: '/services#accessories'   },
  { icon: '➕', title: 'And More',                   desc: "Have a unique project? We'll figure it out together.",    href: '/services'               },
]

const process = [
  { step: '01', icon: UploadCloud,    title: 'Share Your Idea',   desc: 'Upload your file or describe what you need via WhatsApp or our form.' },
  { step: '02', icon: ClipboardCheck, title: 'We Review & Quote', desc: 'Within 24 hours we confirm specs, material, and price.' },
  { step: '03', icon: PackageCheck,   title: 'Print & Deliver',   desc: 'We print to spec and ship anywhere in India.' },
]

function ProductCard({ product }) {
  const { add } = useCart()
  const CardWrapper = product.href ? Link : 'div'
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <CardWrapper
        href={product.href}
        className="group bg-white rounded-3xl overflow-hidden border border-[#D2D2D7] hover:shadow-xl transition-all duration-500 block cursor-pointer"
      >
        {/* Image */}
        <div className="aspect-square bg-[#F5F5F7] relative overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Y2kIcon emoji="🖨️" size={64} className="text-[#A6ACB8]" />
              <span className="text-xs font-medium text-[#86868B] uppercase tracking-widest">Custom Order</span>
            </div>
          )}
          {product.badge && (
            <div className="y2k-lime-glow absolute top-4 left-4 px-3 py-1 bg-[#B6FF3C] text-[#1D1D1F] text-[10px] font-bold tracking-wider rounded-full">
              {product.badge}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-1">{product.category}</p>
          <h3 className="text-base font-semibold text-[#1D1D1F] leading-snug mb-1">{product.name}</h3>
          <p className="text-sm text-[#86868B] mb-4 leading-relaxed">{product.tagline}</p>

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
            <button
              onClick={(e) => { e.preventDefault(); add(product) }}
              className="y2k-accent-surface y2k-shine px-3 py-1.5 text-xs font-semibold text-white rounded-full transition-all overflow-hidden"
            >
              {product.price ? 'Add to Cart' : 'Get Quote'}
            </button>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  )
}

function ShopAllCard() {
  return (
    <Link
      href="/shop"
      className="y2k-dark-surface y2k-lift group flex flex-col items-center justify-center gap-4 rounded-3xl transition-all duration-300 cursor-pointer h-full min-h-[280px] p-6 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
        <Y2kIcon emoji="🛍️" size={30} className="text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FFA35C] mb-2">Browse Everything</p>
        <p className="text-lg font-bold text-white leading-snug">Shop All Products</p>
      </div>
      <div className="y2k-chrome-surface y2k-shine flex items-center gap-2 px-4 py-2 text-[#1D1D1F] text-xs font-semibold rounded-full transition-all duration-300 overflow-hidden">
        View All <span className="text-base leading-none">→</span>
      </div>
    </Link>
  )
}

export default function HomeClient({ products, testimonials, occasions }) {
  const bestSellers = products.filter((p) => p.badge === 'Popular')
  const newArrivals  = products.filter((p) => p.badge === 'New')

  return (
    <div className="pt-[100px]">

      {/* ── HERO MOBILE: video on top, text below ── */}
      <div className="block sm:hidden bg-[#1D1D1F]">
        <video className="w-full block" src="/3DPRINTING02.mp4" autoPlay loop muted playsInline />
        <div className="px-6 py-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#86868B] mb-4">
            ORIC · 3D Print on Demand · Made in India
          </p>
          <h1 className="text-5xl font-bold text-white leading-[0.92] tracking-tight mb-5" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Print.<br />Create.<br /><span className="text-[#FFA35C]">Deliver.</span>
          </h1>
          <p className="text-base text-[#86868B] leading-relaxed mb-8">
            From figurines to functional parts — we 3D print what you imagine.
            FDM precision. Fast turnaround. No minimum order.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/shop" className="y2k-chrome-surface y2k-shine inline-flex items-center justify-center px-8 py-4 text-[#1D1D1F] text-sm font-semibold rounded-full overflow-hidden">
              Browse Shop →
            </Link>
            <a href="https://wa.me/918310194953" target="_blank" rel="noopener noreferrer"
              className="y2k-accent-surface y2k-shine inline-flex items-center justify-center px-8 py-4 text-white text-sm font-semibold rounded-full overflow-hidden">
              Get a Quote
            </a>
          </div>
        </div>
      </div>

      {/* ── HERO DESKTOP: video background + overlay + text on top ── */}
      <section className="hidden sm:flex relative bg-[#1D1D1F] min-h-[92vh] items-center overflow-hidden">
        <video
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', zIndex: 0 }}
          src="/3DPRINTING.mp4"
          autoPlay loop muted playsInline
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,31,0.70)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2 }} className="max-w-7xl mx-auto px-8 lg:px-10 w-full py-28">
          <div className="max-w-4xl">
            <motion.p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#86868B] mb-8"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              ORIC · 3D Print on Demand · Made in India
            </motion.p>
            <motion.h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.92] tracking-tight mb-8"
              style={{ fontFamily: 'var(--font-orbitron)' }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}>
              Print.<br />Create.<br /><span className="text-[#FFA35C]">Deliver.</span>
            </motion.h1>
            <motion.p className="text-lg md:text-xl text-[#86868B] leading-relaxed max-w-xl mb-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              From figurines to functional parts — we 3D print what you imagine.
              FDM precision. Fast turnaround. No minimum order.
            </motion.p>
            <motion.div className="flex flex-row gap-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <Link href="/shop" className="y2k-chrome-surface y2k-shine inline-flex items-center justify-center gap-2 px-8 py-4 text-[#1D1D1F] text-sm font-semibold rounded-full transition-all overflow-hidden">
                Browse Shop →
              </Link>
              <a href="https://wa.me/918310194953" target="_blank" rel="noopener noreferrer"
                className="y2k-accent-surface y2k-shine inline-flex items-center justify-center gap-2 px-8 py-4 text-white text-sm font-semibold rounded-full transition-all overflow-hidden">
                Get a Quote
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <TrustBadgeRow />

      {/* ── BEST SELLERS + NEW ARRIVALS ── */}
      <section className="py-28 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

          <div className="mb-14">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F37121] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              From Our Workshop
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
              style={{ fontFamily: 'var(--font-orbitron)' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Best Sellers
            </motion.h2>
          </div>

          {/* 'Got a photo?' banner */}
          <motion.a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="y2k-shine mb-6 flex flex-col sm:flex-row items-center gap-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-6 py-5 hover:border-[#EA580C]/40 transition-colors overflow-hidden"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Y2kIcon emoji="🖼️" size={44} className="flex-shrink-0 text-[#F37121]" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-[#1D1D1F]">Have a photo? We'll turn it into a 3D figurine.</p>
              <p className="text-xs text-[#424245] mt-0.5">Send any image on WhatsApp — pet, person, character, idol. Quote in 24 hours. No file needed.</p>
            </div>
            <span className="text-xs font-semibold text-[#EA580C] flex-shrink-0">Send Your Photo →</span>
          </motion.a>

          {bestSellers.length > 0 && (
            <ProductCarousel>
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
              <ShopAllCard />
            </ProductCarousel>
          )}

          {newArrivals.length > 0 && (
            <div className="mt-20">
              <motion.h3
                className="text-2xl font-bold text-[#1D1D1F] mb-6"
                style={{ fontFamily: 'var(--font-orbitron)' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              >
                New Arrivals
              </motion.h3>
              <ProductCarousel>
                {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
                <ShopAllCard />
              </ProductCarousel>
            </div>
          )}

        </div>
      </section>

      <BobbleheadCollections occasions={occasions} />

      {/* ── SERVICES GRID ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
            <div>
              <motion.p
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F37121] mb-3"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              >
                What We Make
              </motion.p>
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
                style={{ fontFamily: 'var(--font-orbitron)' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                9 Services.<br />One Workshop.
              </motion.h2>
            </div>
            <Link href="/services" className="text-sm font-medium text-[#424245] hover:text-[#1D1D1F] transition-colors underline underline-offset-4">
              View all services →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {services.map((svc, i) => (
              <motion.a
                key={svc.title}
                href={svc.href}
                className="y2k-chrome-surface y2k-lift y2k-shine group rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 cursor-pointer overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #FFA35C 0%, #F37121 55%, #C94E00 100%)' }}
                >
                  <Y2kIcon emoji={svc.icon} size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1D1D1F] mb-1.5 leading-snug">{svc.title}</h3>
                  <p className="text-sm text-[#424245] leading-relaxed">{svc.desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F37121] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              The Process
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#1D1D1F]"
              style={{ fontFamily: 'var(--font-orbitron)' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {process.map((step, i) => (
              <motion.div
                key={step.step}
                className="text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="y2k-accent-surface w-16 h-16 rounded-full text-white flex items-center justify-center">
                    <step.icon size={26} strokeWidth={2} />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#1D1D1F] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-3">{step.title}</h3>
                <p className="text-sm text-[#86868B] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3D PRINT CONFIGURATOR ── */}
      <section className="py-20 border-b border-[#D2D2D7] bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="mb-12">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F37121] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Instant Quote
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
              style={{ fontFamily: 'var(--font-orbitron)' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Configure Your Print
            </motion.h2>
            <motion.p
              className="text-[#86868B] text-base mt-3 max-w-lg"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Upload your STL, pick your material and settings, get an instant price estimate.
            </motion.p>
          </div>
          <PrintConfigurator />
        </div>
      </section>

      <Testimonials testimonials={testimonials} />

      <InstagramFeed />

      <FAQSection />

      {/* ── STATEMENT BANNER ── */}
      <section className="py-28 y2k-dark-surface">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-8"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Every print.<br />
            <span className="text-[#FFA35C]">Crafted to spec.</span>
          </motion.h2>
          <motion.p
            className="text-[#86868B] text-base md:text-lg max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            FDM printing with precision-tuned profiles. Post-processed and quality-checked before dispatch. No exceptions.
          </motion.p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="y2k-chrome-surface y2k-shine px-8 py-4 text-[#1D1D1F] text-sm font-semibold rounded-full transition-all overflow-hidden"
            >
              Start Your Order →
            </a>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
