import { motion } from 'framer-motion'

const specs = [
  { label: 'Dimensions',    value: '200mm × 85mm × 65mm (Device)'                      },
  { label: 'Print Area',    value: '58mm (Height) × Continuous (Width)'                },
  { label: 'Weight',        value: '210g (Empty) / 350g (Loaded)'                      },
  { label: 'Material',      value: 'PLA'                                               },
  { label: 'Compatibility', value: '15mm Marker & Empty 711EM'                         },
  { label: 'In The Box',    value: 'Housing (Front/Back), Personalized Scroll, Bearing'},
]

export default function Specs() {
  return (
    <section id="specs" className="py-24 bg-[#0a0a0c] border-t border-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Details</p>
          <h2 className="text-3xl font-bold text-white">Technical Specifications</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {specs.map((spec, i) => (
            <motion.div
              key={spec.label}
              className="group p-5 rounded-xl border border-gray-800 hover:border-red-500/40 bg-gray-900/30 hover:bg-gray-900/70 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{spec.label}</p>
              <p className="text-white font-mono text-sm group-hover:text-red-300 transition-colors duration-300">
                {spec.value}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-10 p-5 bg-yellow-900/15 border border-yellow-700/40 rounded-xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-yellow-400/90 text-sm">
            <span className="font-bold text-yellow-400">Note:</span> Markers are sold separately.
            B-Stock units ("Minor Visual Imperfections") available at reduced rates.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
