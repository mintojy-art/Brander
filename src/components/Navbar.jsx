import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from '../icons'

const links = [
  { href: '#product',    label: 'Product'    },
  { href: '#video',      label: 'Video'      },
  { href: '#features',   label: 'Features'   },
  { href: '#gallery',    label: 'Gallery'    },
  { href: '#design-lab', label: 'Design Lab' },
]

export default function Navbar({ onJoinWaitlist }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleWaitlist = () => {
    setMobileOpen(false)
    onJoinWaitlist?.()
  }

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#FAFAF8]/95 backdrop-blur-md border-b border-stone-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-7 h-7 bg-[#111111] rounded flex items-center justify-center">
              <span className="font-stencil font-bold text-white text-sm leading-none">B</span>
            </div>
            <span className="font-stencil text-xl tracking-tight text-[#111111]">BRANDER</span>
          </motion.div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-stone-500 hover:text-[#111111] transition-colors group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.1 }}
              >
                {link.label}
                <span className="absolute bottom-0.5 left-3 right-3 h-px bg-[#111111] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.a>
            ))}
          </div>

          {/* Waitlist CTA + hamburger */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleWaitlist}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333] text-white text-sm font-semibold rounded transition-all"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Join Waitlist
            </motion.button>

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 text-stone-500 hover:text-[#111111] transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#FAFAF8] border-b border-stone-200"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 rounded text-base font-medium text-stone-600 hover:text-[#111111] hover:bg-stone-100 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={handleWaitlist}
                className="w-full mt-2 py-3 bg-[#111111] hover:bg-[#333] text-white font-semibold rounded transition-all text-sm"
              >
                Join Waitlist — Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
