import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const services = [
  {
    id: 'manufacturing',
    number: '01',
    title: 'Small Batch Manufacturing',
    tagline: '5 to 500 units. Consistent quality. No MOQ.',
    description: 'Short-run production for startups, hardware companies, and packagers. We maintain tight tolerances and consistent surface finish across the batch. Ideal for product launches, trial runs, and production bridges.',
    specs: ['Material: PLA, PETG, ASA', 'Lead time: Quote-based', 'Min. qty: 5 units', 'Max. qty: 500 units per run'],
    useCase: 'Hardware startups, product packaging, replacement parts',
    icon: '⚙️',
  },
  {
    id: 'toys',
    number: '02',
    title: '3D Printed Toys',
    tagline: 'Safe. Colourful. One of a kind.',
    description: 'Custom articulated toys, snap-fit puzzles, figurines, and playsets printed in child-safe PLA. We design or print from your files — vibrant multi-color available on request.',
    specs: ['Material: PLA (child-safe grade)', 'Lead time: 5–7 business days', 'Finish: Sanded or as-printed', 'Colors: Wide range available'],
    useCase: 'Gifts, educational toys, custom collectibles',
    icon: '🧸',
  },
  {
    id: 'custom',
    number: '03',
    title: 'Custom 3D Prints',
    tagline: "Got a file? We'll print it.",
    description: 'Upload your STL or STEP file and we handle everything — slicing, support optimization, printing, post-processing, and delivery. Any geometry, any scale (within build volume).',
    specs: ['Formats: STL, STEP, OBJ', 'Lead time: 3–7 business days', 'Layer height: 0.1–0.3mm', 'Max build: 220×220×250mm'],
    useCase: 'Engineers, designers, hobbyists, students',
    icon: '🖨️',
  },
  {
    id: 'prototyping',
    number: '04',
    title: 'Rapid Prototyping',
    tagline: 'From CAD to hand in 3–5 days.',
    description: 'Functional prototypes for product development, investor demos, and engineering validation. We optimize print orientation for strength and accuracy. Available in rigid, flexible, or high-temp materials.',
    specs: ['Materials: PLA, PETG, TPU, ASA', 'Lead time: 3–5 business days', 'Tolerance: ±0.3mm', 'Finish: Raw, sanded, or primed'],
    useCase: 'Product dev, investor presentations, UX testing',
    icon: '🔬',
  },
  {
    id: 'figurines',
    number: '05',
    title: 'Figurines',
    tagline: 'Characters. Miniatures. Printed to life.',
    description: 'Full-detail figurines from your design files or reference images. Ideal for D&D miniatures, anime characters, wedding toppers, and custom collectibles. Fine 0.1mm layers for crisp detail.',
    specs: ['Material: PLA / PETG', 'Lead time: 5–7 business days', 'Layer height: 0.1mm', 'Scale: 1:12 to 1:1'],
    useCase: 'Tabletop gaming, gifts, character art, displays',
    icon: '🗿',
  },
  {
    id: 'idols',
    number: '06',
    title: 'Idol & Deity Models',
    tagline: 'Detailed sacred figurines, printed with care.',
    description: 'High-detail idol and deity models at multiple scales. Suitable for home shrines, gifting, and architectural decor. Printed with fine layer resolution and available with smooth post-processing.',
    specs: ['Material: PLA / Smooth-finish PLA', 'Lead time: 7–10 business days', 'Finish: Raw, smoothed, or primer-ready', 'Custom scale available'],
    useCase: 'Home shrines, gifts, cultural decor, architects',
    icon: '🪔',
  },
  {
    id: 'accessories',
    number: '07',
    title: 'Accessories',
    tagline: 'Clips, mounts, brackets — any geometry.',
    description: 'Functional accessories printed to your exact spec. Desk organizers, cable management clips, camera mounts, wall brackets, replacement knobs — if it can be modelled, we can print it.',
    specs: ['Material: PLA, PETG, TPU', 'Lead time: 3–5 business days', 'Flexible options (TPU) available', 'Threaded inserts available'],
    useCase: 'Office, workshop, home, industrial',
    icon: '🧲',
  },
  {
    id: 'more',
    number: '08',
    title: 'And More',
    tagline: 'Have a unique project? Let\'s build it.',
    description: "Architecture models, educational aids, cosplay props, electronic enclosures, jigs and fixtures — if you can imagine it and we can print it, it's on the table. Reach out with your project details.",
    specs: ['Consultation: Free', 'Response time: Within 24h', 'Custom quote: Within 24–48h', 'Delivery: Pan India'],
    useCase: 'Architects, educators, cosplayers, engineers',
    icon: '➕',
  },
]

export default function Services() {
  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Header */}
      <div className="bg-[#1D1D1F]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-24">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            ORIC Services
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Everything<br />
            <span className="text-[#86868B]">we print.</span>
          </motion.h1>
          <motion.p
            className="text-[#86868B] text-base max-w-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            8 service categories. FDM precision. Fast turnaround. Delivered across India.
          </motion.p>
        </div>
      </div>

      {/* Services list */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
        {services.map((svc, i) => (
          <motion.div
            key={svc.id}
            id={svc.id}
            className="border-b border-[#D2D2D7] py-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left */}
              <div className="md:col-span-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{svc.icon}</span>
                  <span className="text-[11px] font-semibold text-[#86868B] tracking-widest uppercase">{svc.number}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] leading-tight mb-2">{svc.title}</h2>
                <p className="text-[#86868B] text-sm font-medium mb-4">{svc.tagline}</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D1D1F] hover:text-[#424245] transition-colors underline underline-offset-4"
                >
                  Order this service →
                </Link>
              </div>

              {/* Right */}
              <div className="md:col-span-7">
                <p className="text-[#424245] text-sm leading-relaxed mb-6">{svc.description}</p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {svc.specs.map((spec) => (
                    <div key={spec} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#86868B] mt-2 shrink-0" />
                      <span className="text-xs text-[#86868B]">{spec}</span>
                    </div>
                  ))}
                </div>

                {/* Use case */}
                <div className="mt-4 px-4 py-3 bg-[#F5F5F7] rounded-xl">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#86868B]">Best for: </span>
                  <span className="text-xs text-[#424245]">{svc.useCase}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#F5F5F7] border-t border-[#D2D2D7] py-24">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-4xl font-bold text-[#1D1D1F] mb-4">Ready to start?</h2>
          <p className="text-[#86868B] text-base mb-8 max-w-md mx-auto">
            Send your file or idea. We'll quote within 24 hours and get it printed fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all"
            >
              Order via WhatsApp
            </a>
            <Link
              to="/shop"
              className="px-8 py-4 border border-[#D2D2D7] text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-white transition-all"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
