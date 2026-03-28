import { motion } from 'framer-motion'

const specGroups = [
  {
    category: 'Dimensions & Weight',
    items: [
      { label: 'Device Size',    value: '200mm × 85mm × 65mm' },
      { label: 'Empty Weight',   value: '210g' },
      { label: 'Loaded Weight',  value: '350g' },
    ],
  },
  {
    category: 'Print & Materials',
    items: [
      { label: 'Print Area',    value: '58mm height × continuous width' },
      { label: 'Material',      value: 'PLA Fiber Body' },
      { label: 'Text Length',   value: '30cm per scroll' },
    ],
  },
  {
    category: 'Compatibility',
    items: [
      { label: 'Marker Type',   value: '15mm Marker & Empty 711EM' },
      { label: 'Ring Size',     value: '19 CM circumference (standard)' },
      { label: 'Surface Types', value: '6+ (wood, concrete, cardboard, metal, fabric, plastic)' },
    ],
  },
  {
    category: 'In the Box',
    items: [
      { label: 'Contents',      value: 'Housing (Front/Back), Personalized Scroll, Bearing' },
      { label: 'Note',          value: 'Markers sold separately' },
      { label: 'B-Stock',       value: 'Available at reduced rate (minor visual imperfections)' },
    ],
  },
]

export default function Specs() {
  return (
    <section id="specs" className="py-28 bg-[#FAFAF8] border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4">

        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-4">Details</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#111111]">Technical Specifications.</h2>
        </motion.div>

        <div className="space-y-12">
          {specGroups.map((group, gi) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: gi * 0.08 }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-5 pb-3 border-b border-stone-200">
                {group.category}
              </p>
              <div className="space-y-0 divide-y divide-stone-100">
                {group.items.map((spec, i) => (
                  <div key={spec.label} className="flex items-baseline justify-between py-3.5 gap-8">
                    <span className="text-sm text-stone-400 shrink-0 w-36">{spec.label}</span>
                    <span className="text-sm font-medium text-[#111111] text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
