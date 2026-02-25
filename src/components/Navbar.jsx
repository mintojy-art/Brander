import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X } from '../icons'

const links = [
  { href: '#product',  label: 'Product'    },
  { href: '#video',    label: 'Video'      },
  { href: '#features', label: 'Features'   },
  { href: '#gallery',  label: 'Gallery'    },
  { href: '#preview',  label: 'Design Lab' },
  { href: '#contact',  label: 'Contact'    },
]

export default function Navbar({ cartCount }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-lg border-b border-gray-800/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-[0_0_14px_rgba(220,38,38,0.6)]">
              <span className="font-stencil font-bold text-white text-lg leading-none">B</span>
            </div>
            <span className="font-stencil text-2xl tracking-tight text-white">BRANDER</span>
          </motion.div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.1 }}
              >
                {link.label}
                <span className="absolute bottom-0.5 left-3 right-3 h-px bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.a>
            ))}
          </div>

          {/* Cart + hamburger */}
          <div className="flex items-center gap-3">
            <motion.button
              className="relative p-2 hover:bg-gray-800 rounded-full transition-colors group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingCart size={22} className="text-gray-300 group-hover:text-white transition-colors" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.7)]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="md:hidden overflow-hidden bg-black/95 backdrop-blur-md border-b border-gray-800"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-900 hover:text-red-400 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
