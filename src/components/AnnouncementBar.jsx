import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const MESSAGES = [
  'Designed & Printed in Bangalore, India',
  'Delivery Across India',
]

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-[#1D1D1F] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="text-[11px] font-medium tracking-wide text-white/90 px-4 text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
