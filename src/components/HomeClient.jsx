'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { UploadCloud, ClipboardCheck, PackageCheck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Y2kIcon from '@/components/Y2kIcon'
import WishlistButton from '@/components/WishlistButton'
import ProductCarousel from '@/components/ProductCarousel'
import TrustBadgeRow from '@/components/TrustBadgeRow'
import BobbleheadCollections from '@/components/BobbleheadCollections'
import MaskStudioSection from '@/components/MaskStudioSection'
import Testimonials from '@/components/Testimonials'
import InstagramFeed from '@/components/InstagramFeed'
import FAQSection from '@/components/FAQSection'
import PhotoQuoteModal from '@/components/PhotoQuoteModal'
import MultiLine from '@/components/MultiLine'
import { defaultSections, sectionText, safeHref } from '@/lib/homeSections'

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
          <WishlistButton product={product} className="absolute top-4 right-4" />
        </div>

        {/* Info */}
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-1">{product.category}</p>
          <h3 className="text-base font-semibold text-[#1D1D1F] leading-snug mb-1">{product.name}</h3>
          <p className="text-sm text-[#86868B] mb-4 leading-relaxed">{product.tagline}</p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm sm:text-base font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
            <button
              onClick={(e) => { e.preventDefault(); add(product) }}
              className="y2k-accent-surface y2k-shine px-3 py-1.5 text-xs font-semibold text-white rounded-full transition-all overflow-hidden whitespace-nowrap shrink-0"
            >
              {/* Shorter label below `sm` — the mobile 2-col grid gives each
                  card less width than the desktop carousel, and "Add to
                  Cart" was wrapping/overflowing the button there. */}
              <span className="sm:hidden">{product.price ? 'Add' : 'Quote'}</span>
              <span className="hidden sm:inline">{product.price ? 'Add to Cart' : 'Get Quote'}</span>
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

const SECTION_BG = {
  light: 'bg-white',
  grey: 'bg-[#F5F5F7]',
  dark: 'y2k-dark-surface',
}

function Eyebrow({ children, dark }) {
  if (!children) return null
  return (
    <motion.p
      className={`text-[11px] font-semibold uppercase tracking-[0.3em] mb-3 ${dark ? 'text-[#FFA35C]' : 'text-[#F37121]'}`}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
    >
      {children}
    </motion.p>
  )
}

function Heading({ children, dark, className = '' }) {
  return (
    <motion.h2
      className={`text-4xl md:text-5xl font-bold leading-tight ${dark ? 'text-white' : 'text-[#1D1D1F]'} ${className}`}
      style={{ fontFamily: 'var(--font-orbitron)' }}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.h2>
  )
}

function BestSellersSection({ text, products }) {
  const bestSellers = products.filter((p) => p.badge === 'Popular')
  const newArrivals = products.filter((p) => p.badge === 'New')
  const [quoteOpen, setQuoteOpen] = useState(false)

  return (
    <section className="py-28 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        <div className="mb-14">
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <Heading><MultiLine text={text.title} /></Heading>
        </div>

        {/* 'Got a photo?' banner */}
        <motion.button
          type="button"
          onClick={() => setQuoteOpen(true)}
          className="mb-6 flex flex-col sm:flex-row items-center gap-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-6 py-5 hover:border-[#EA580C]/40 transition-colors overflow-hidden text-left w-full"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <Y2kIcon emoji="🖼️" size={44} className="flex-shrink-0 text-[#F37121]" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-[#1D1D1F]">Have a photo? We'll turn it into a 3D figurine.</p>
            <p className="text-xs text-[#424245] mt-0.5">Send any image on WhatsApp — pet, person, character, idol. Quote in 24 hours. No file needed.</p>
          </div>
          <span className="text-xs font-semibold text-[#EA580C] flex-shrink-0">Send Your Photo →</span>
        </motion.button>
        <PhotoQuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} context="a 3D figurine" />

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
              {text.title2}
            </motion.h3>
            <ProductCarousel>
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
              <ShopAllCard />
            </ProductCarousel>
          </div>
        )}

      </div>
    </section>
  )
}

function ServicesSection({ text }) {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div>
            <Eyebrow>{text.eyebrow}</Eyebrow>
            <Heading><MultiLine text={text.title} /></Heading>
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
              className="y2k-chrome-surface y2k-lift group rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 cursor-pointer overflow-hidden"
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
  )
}

function ProcessSection({ text }) {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="text-center mb-16">
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <Heading><MultiLine text={text.title} /></Heading>
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
  )
}

function ConfiguratorSection({ text }) {
  return (
    <section className="py-20 border-b border-[#D2D2D7] bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="mb-12">
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <Heading><MultiLine text={text.title} /></Heading>
          {text.subtitle && (
            <motion.p
              className="text-[#86868B] text-base mt-3 max-w-lg"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {text.subtitle}
            </motion.p>
          )}
        </div>
        <PrintConfigurator />
      </div>
    </section>
  )
}

function StatementSection({ text }) {
  return (
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
          <MultiLine text={text.title} />
          {text.title2 && <><br /><span className="text-[#FFA35C]"><MultiLine text={text.title2} /></span></>}
        </motion.h2>
        {text.subtitle && (
          <motion.p
            className="text-[#86868B] text-base md:text-lg max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {text.subtitle}
          </motion.p>
        )}
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
  )
}

function SectionButton({ label, url, dark }) {
  const href = safeHref(url)
  if (!label || !href) return null
  const cls = `${dark ? 'y2k-chrome-surface text-[#1D1D1F]' : 'y2k-accent-surface text-white'} y2k-shine inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-full transition-all overflow-hidden`
  if (href.startsWith('/')) return <Link href={href} className={cls}>{label}</Link>
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
}

function ProductCollectionSection({ section, products }) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const picked = (section.product_ids || []).map((id) => byId.get(id)).filter(Boolean)
  if (picked.length === 0) return null
  const dark = section.background === 'dark'
  // A Christmas collection links to /christmas-decor unless the admin set its own button.
  const isXmas = /christmas|xmas/i.test(section.title || '')

  return (
    <section className={`py-28 ${SECTION_BG[section.background] || SECTION_BG.light}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>
            {section.title && <Heading dark={dark}><MultiLine text={section.title} /></Heading>}
            {section.subtitle && (
              <p className={`text-base mt-3 ${dark ? 'text-[#A1A1A6]' : 'text-[#86868B]'}`}>{section.subtitle}</p>
            )}
          </div>
          <SectionButton
            label={section.button_label || (isXmas ? 'View all Christmas decor' : '')}
            url={section.button_url || (isXmas ? '/christmas-decor' : '')}
            dark={dark}
          />
        </div>
        <ProductCarousel>
          {picked.map((p) => <ProductCard key={p.id} product={p} />)}
        </ProductCarousel>
      </div>
    </section>
  )
}

function ContentBlockSection({ section }) {
  const dark = section.background === 'dark'
  const imageLeft = section.layout === 'image-left'
  const hasImage = !!section.image_url

  const textCol = (
    <div className={hasImage ? '' : 'max-w-3xl mx-auto text-center'}>
      <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>
      {section.title && <Heading dark={dark}><MultiLine text={section.title} /></Heading>}
      {section.body && (
        <p className={`text-base md:text-lg leading-relaxed mt-5 whitespace-pre-line ${dark ? 'text-[#A1A1A6]' : 'text-[#424245]'}`}>
          {section.body}
        </p>
      )}
      {section.button_label && safeHref(section.button_url) && (
        <div className="mt-8">
          <SectionButton label={section.button_label} url={section.button_url} dark={dark} />
        </div>
      )}
    </div>
  )

  return (
    <section className={`py-28 ${SECTION_BG[section.background] || SECTION_BG.light}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {hasImage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              className={`rounded-3xl overflow-hidden ${imageLeft ? '' : 'md:order-2'}`}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src={section.image_url} alt={section.title || ''} className="w-full h-auto object-cover" />
            </motion.div>
            <div className={imageLeft ? '' : 'md:order-1'}>{textCol}</div>
          </div>
        ) : textCol}
      </div>
    </section>
  )
}

function HomeSection({ section, products, testimonials, occasions }) {
  if (section.kind === 'products') return <ProductCollectionSection section={section} products={products} />
  if (section.kind === 'content') return <ContentBlockSection section={section} />

  const text = sectionText(section)
  switch (section.builtin_key) {
    case 'trust': return <TrustBadgeRow />
    case 'bestsellers': return <BestSellersSection text={text} products={products} />
    case 'bobbleheads': return <BobbleheadCollections occasions={occasions} eyebrow={text.eyebrow} title={text.title} />
    case 'mask': return <MaskStudioSection products={products} eyebrow={text.eyebrow} title={text.title} subtitle={text.subtitle} />
    case 'services': return <ServicesSection text={text} />
    case 'process': return <ProcessSection text={text} />
    case 'configurator': return <ConfiguratorSection text={text} />
    case 'testimonials': return <Testimonials testimonials={testimonials} eyebrow={text.eyebrow} title={text.title} />
    case 'instagram': return <InstagramFeed eyebrow={text.eyebrow} title={text.title} />
    case 'faq': return <FAQSection eyebrow={text.eyebrow} title={text.title} />
    case 'statement': return <StatementSection text={text} />
    default: return null
  }
}

// Browsers download autoplay videos even inside display:none containers, so
// rendering both hero videos cost every visitor ~9MB for one visible video.
// null on the server/first paint → neither src is set until we know the viewport.
const MOBILE_QUERY = '(max-width: 639px)'
const subscribeViewport = (cb) => {
  const mq = window.matchMedia(MOBILE_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useIsMobile = () =>
  useSyncExternalStore(subscribeViewport, () => window.matchMedia(MOBILE_QUERY).matches, () => null)

export default function HomeClient({ products, testimonials, occasions, sections = defaultSections() }) {
  const isMobile = useIsMobile()

  return (
    <div className="pt-[100px]">

      {/* ── HERO MOBILE: video on top, text below ── */}
      <div className="block sm:hidden bg-[#1D1D1F]">
        <video className="w-full block aspect-[1080/1700] bg-[#1D1D1F]" src={isMobile === true ? '/3DPRINTING02.mp4' : undefined} autoPlay loop muted playsInline />
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
          src={isMobile === false ? '/3DPRINTING.mp4' : undefined}
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

      {sections.filter((s) => s.visible !== false).map((section) => (
        <HomeSection key={section.id} section={section} products={products} testimonials={testimonials} occasions={occasions} />
      ))}

    </div>
  )
}
