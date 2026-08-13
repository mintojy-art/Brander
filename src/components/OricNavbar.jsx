'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { categoryIcons } from '@/data/products'
import Y2kIcon from '@/components/Y2kIcon'

const navLinks = [
  { to: '/services',     label: 'Services'    },
  { to: '/blog',         label: 'Blog'        },
  { to: '/about',        label: 'About'       },
  { to: '/lithophanes',  label: 'Lithophane' },
]

// Bobbleheads has its own dedicated hub page (occasions + products together)
// instead of the generic category-filtered shop view.
const categoryHref = (cat) => cat === 'Bobbleheads' ? '/bobbleheads' : `/shop?cat=${encodeURIComponent(cat)}`

export default function OricNavbar({ categories = [] }) {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobile]     = useState(false)
  const [shopMenuOpen, setShopMenu] = useState(false)
  const [mobileShopOpen, setMShop]  = useState(false)
  const { count, setIsOpen }      = useCart()
  const pathname                  = usePathname()
  const shopCategories            = categories

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMobile(false), [pathname])

  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <header
      className={`fixed top-9 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-[#D2D2D7]' : 'bg-white/70 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center select-none">
            <img src="/oriclogo1.svg" alt="ORIC" className="h-8 w-auto" style={{ display: 'block' }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              key="/"
              href="/"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all overflow-hidden ${
                isActive('/')
                  ? 'y2k-accent-surface y2k-shine text-white'
                  : 'text-[#424245] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              Home
            </Link>

            {/* Shop mega-menu trigger */}
            <div
              className="relative"
              onMouseEnter={() => setShopMenu(true)}
              onMouseLeave={() => setShopMenu(false)}
            >
              <Link
                href="/shop"
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all overflow-hidden ${
                  isActive('/shop')
                    ? 'y2k-accent-surface y2k-shine text-white'
                    : 'text-[#424245] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                Shop
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </Link>

              <AnimatePresence>
                {shopMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[560px]"
                  >
                    <div className="y2k-chrome-surface rounded-2xl p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-3 px-1">
                        Shop by Category
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 mb-3">
                        {shopCategories.map((cat) => (
                          <Link
                            key={cat}
                            href={categoryHref(cat)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/70 transition-colors"
                          >
                            <Y2kIcon emoji={categoryIcons[cat] || '🖨️'} size={22} className="text-[#F37121]" />
                            <span className="text-sm text-[#1D1D1F] font-medium">{cat}</span>
                          </Link>
                        ))}
                      </div>
                      <a
                        href="https://wa.me/918310194953"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-white/70 rounded-xl hover:bg-white transition-colors"
                      >
                        <Y2kIcon emoji="🖼️" size={26} className="text-[#F37121]" />
                        <span className="flex-1 text-sm text-[#1D1D1F]">
                          <span className="font-semibold">Have a photo?</span> Get a custom quote →
                        </span>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all overflow-hidden ${
                  isActive(link.to)
                    ? 'y2k-accent-surface y2k-shine text-white'
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
                <span className="y2k-lime-glow absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#9AE619] text-[#1D1D1F] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            {/* CTA */}
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="y2k-accent-surface y2k-shine hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-full transition-all overflow-hidden"
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
              <Link
                href="/"
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all overflow-hidden ${
                  isActive('/')
                    ? 'y2k-accent-surface text-white'
                    : 'text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                }`}
              >
                Home
              </Link>

              {/* Shop — expandable category list */}
              <div>
                <div className="flex items-center">
                  <Link
                    href="/shop"
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all overflow-hidden ${
                      isActive('/shop')
                        ? 'y2k-accent-surface text-white'
                        : 'text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                    }`}
                  >
                    Shop
                  </Link>
                  <button
                    onClick={() => setMShop((o) => !o)}
                    className="p-3 text-[#86868B]"
                    aria-label="Toggle shop categories"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transform: mobileShopOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
                <AnimatePresence>
                  {mobileShopOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-4"
                    >
                      <div className="grid grid-cols-2 gap-1 py-1">
                        {shopCategories.map((cat) => (
                          <Link
                            key={cat}
                            href={categoryHref(cat)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
                          >
                            <Y2kIcon emoji={categoryIcons[cat] || '🖨️'} size={16} className="text-[#F37121]" />
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all overflow-hidden ${
                    isActive(link.to)
                      ? 'y2k-accent-surface text-white'
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
                className="y2k-accent-surface block w-full text-center mt-3 px-4 py-3 text-white text-sm font-semibold rounded-xl overflow-hidden"
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
