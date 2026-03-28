import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 30,  unit: 'cm', label: 'Text Length'    },
  { value: 6,   unit: '+',  label: 'Surface Types'  },
  { value: 210, unit: 'g',  label: 'Empty Weight'   },
  { value: 24,  unit: 'h',  label: 'Custom Response'},
]

function CountUp({ value, unit }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const [count, setCount] = useState(value)

  useEffect(() => {
    if (!inView) return
    const steps = 50
    const increment = value / steps
    let cur = 0
    setCount(0)
    const id = setInterval(() => {
      cur += increment
      if (cur >= value) { setCount(value); clearInterval(id) }
      else              { setCount(Math.floor(cur)) }
    }, 1200 / steps)
    return () => clearInterval(id)
  }, [inView, value])

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold text-[#111111] tabular-nums">
      {count}
      <span className="text-2xl ml-0.5 text-stone-400">{unit}</span>
    </span>
  )
}

export default function StatsBar() {
  return (
    <section className="py-16 bg-[#F5F2EE] border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-stone-200">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center px-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <CountUp value={s.value} unit={s.unit} />
              <p className="text-stone-400 text-xs mt-2 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
