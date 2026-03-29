import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useProducts } from '../hooks/useProducts'
import PrintConfigurator from '../components/PrintConfigurator'

const services = [
  { icon: '⚙️', title: 'Small Batch Manufacturing', desc: 'From 5 to 500 units — consistent quality, no MOQ.',   href: '/services#manufacturing' },
  { icon: '🧸', title: '3D Printed Toys',           desc: 'Safe, colourful, custom articulated toys and playsets.', href: '/services#toys'          },
  { icon: '🖨️', title: 'Custom 3D Prints',          desc: 'Upload your file. We print, post-process, and deliver.', href: '/services#custom'        },
  { icon: '🔬', title: 'Prototyping',                desc: 'CAD to hand in 3–5 days. Functional, tight tolerances.', href: '/services#prototyping'   },
  { icon: '🗿', title: 'Figurines',                  desc: 'Characters, miniatures, collectibles — printed to life.',  href: '/services#figurines'    },
  { icon: '🪔', title: 'Idols & Models',             desc: 'Sacred deity models and detailed decor pieces.',          href: '/services#idols'         },
  { icon: '🧲', title: 'Accessories',                desc: 'Clips, mounts, brackets, organizers — any geometry.',    href: '/services#accessories'   },
  { icon: '➕', title: 'And More',                   desc: "Have a unique project? We'll figure it out together.",    href: '/services'               },
]

const process = [
  { step: '01', title: 'Share Your Idea',   desc: 'Upload your file or describe what you need via WhatsApp or our form.' },
  { step: '02', title: 'We Review & Quote', desc: 'Within 24 hours we confirm specs, material, and price.' },
  { step: '03', title: 'Print & Deliver',   desc: 'We print to spec and ship anywhere in India.' },
]

function ProductCard({ product }) {
  const { add } = useCart()
  return (
    <motion.div
      className="group bg-white rounded-3xl overflow-hidden border border-[#D2D2D7] hover:shadow-xl transition-all duration-500"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Image */}
      <div className="aspect-square bg-[#F5F5F7] relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span className="text-6xl">🖨️</span>
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
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-1">{product.category}</p>
        <h3 className="text-base font-semibold text-[#1D1D1F] leading-snug mb-1">{product.name}</h3>
        <p className="text-sm text-[#86868B] mb-4 leading-relaxed">{product.tagline}</p>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-[#1D1D1F]">{product.priceDisplay}</span>
          <div className="flex gap-2">
            {product.href && (
              <Link
                to={product.href}
                className="px-3 py-1.5 text-xs font-medium text-[#424245] border border-[#D2D2D7] rounded-full hover:bg-[#F5F5F7] transition-all"
              >
                Details
              </Link>
            )}
            <button
              onClick={() => add(product)}
              className="px-3 py-1.5 text-xs font-medium bg-[#1D1D1F] text-white rounded-full hover:bg-[#424245] transition-all"
            >
              {product.price ? 'Add to Cart' : 'Get Quote'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const { products } = useProducts()
  const featured = products.slice(0, 4)

  return (
    <div className="pt-16">

      {/* ── HERO ── */}
      <section className="relative bg-[#1D1D1F] min-h-[92vh] flex items-center overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full py-28">
          <div className="max-w-4xl">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#86868B] mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              ORIC · 3D Print on Demand · Made in India
            </motion.p>

            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.92] tracking-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
            >
              Print.<br />
              Create.<br />
              <span className="text-[#86868B]">Deliver.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-[#86868B] leading-relaxed max-w-xl mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              From figurines to functional parts — we 3D print what you imagine.
              FDM precision. Fast turnaround. No minimum order.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-sm font-semibold rounded-full transition-all"
              >
                Browse Shop →
              </Link>
              <a
                href="https://wa.me/918310194953"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#424245] hover:border-white text-white text-sm font-semibold rounded-full transition-all"
              >
                Get a Quote
              </a>
            </motion.div>
          </div>
        </div>


      </section>

      {/* ── 3D PRINT CONFIGURATOR ── */}
      <section className="py-20 bg-[#F5F5F7] border-b border-[#D2D2D7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="mb-12">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Instant Quote
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
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

      {/* ── SERVICES GRID ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
            <div>
              <motion.p
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              >
                What We Make
              </motion.p>
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                8 Services.<br />One Workshop.
              </motion.h2>
            </div>
            <Link to="/services" className="text-sm font-medium text-[#424245] hover:text-[#1D1D1F] transition-colors underline underline-offset-4">
              View all services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc, i) => (
              <motion.a
                key={svc.title}
                href={svc.href}
                className="group p-6 bg-[#F5F5F7] hover:bg-[#1D1D1F] rounded-2xl transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <div className="text-3xl mb-4">{svc.icon}</div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] group-hover:text-white mb-2 transition-colors leading-snug">
                  {svc.title}
                </h3>
                <p className="text-xs text-[#86868B] group-hover:text-[#86868B] leading-relaxed">
                  {svc.desc}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-28 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div>
              <motion.p
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              >
                From Our Workshop
              </motion.p>
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Featured Products
              </motion.h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-[#424245] hover:text-[#1D1D1F] transition-colors underline underline-offset-4">
              Shop all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              The Process
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#1D1D1F]"
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
                <div className="w-14 h-14 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center text-sm font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-3">{step.title}</h3>
                <p className="text-sm text-[#86868B] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATEMENT BANNER ── */}
      <section className="py-28 bg-[#1D1D1F]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Every print.<br />
            <span className="text-[#86868B]">Crafted to spec.</span>
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
              className="px-8 py-4 bg-white text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-[#F5F5F7] transition-all"
            >
              Start Your Order →
            </a>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
