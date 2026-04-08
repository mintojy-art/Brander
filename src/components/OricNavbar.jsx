import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

const navLinks = [
  { to: '/',             label: 'Home'        },
  { to: '/shop',         label: 'Shop'        },
  { to: '/services',     label: 'Services'    },
  { to: '/about',        label: 'About'       },
  { to: '/lithophanes',  label: 'Lithophane' },
]

export default function OricNavbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobile]   = useState(false)
  const { count, setIsOpen }      = useCart()
  const location                  = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMobile(false), [location.pathname])

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-[#D2D2D7]' : 'bg-white/70 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center select-none">
            <img src="/oriclogo1.svg" alt="ORIC" className="h-8 w-auto" style={{ display: 'block' }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isActive(link.to)
                    ? 'bg-[#1D1D1F] text-white'
                    : 'text-[#424245] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Cart + CTA */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-[#424245] hover:text-[#1D1D1F] transition-colors rounded-full hover:bg-[#F5F5F7]"
              aria-label="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1D1D1F] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            {/* CTA */}
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] hover:bg-[#424245] text-white text-sm font-medium rounded-full transition-all"
            >
              Order Now
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobile((o) => !o)}
              className="md:hidden p-2 text-[#424245] hover:text-[#1D1D1F] rounded-full hover:bg-[#F5F5F7] transition-colors"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
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
            className="md:hidden overflow-hidden bg-white border-b border-[#D2D2D7]"
          >
            <div className="px-5 pt-2 pb-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-[#1D1D1F] text-white'
                      : 'text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://wa.me/918310194953"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center mt-3 px-4 py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-xl"
              >
                Order via WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
