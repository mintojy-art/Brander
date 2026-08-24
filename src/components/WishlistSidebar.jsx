'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import Y2kIcon from '@/components/Y2kIcon'

export default function WishlistSidebar() {
  const { items, remove, count, isOpen, setIsOpen } = useWishlist()
  const { add, setIsOpen: setCartOpen } = useCart()

  const moveToCart = (item) => {
    add(item)
    setIsOpen(false)
    setCartOpen(true)
  }

  const addAllToCart = () => {
    items.forEach((item) => add(item))
    setIsOpen(false)
    setCartOpen(true)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#D2D2D7]">
              <div>
                <h2 className="text-lg font-semibold text-[#1D1D1F]">Your Wishlist</h2>
                <p className="text-xs text-[#86868B] mt-0.5">{count} item{count !== 1 ? 's' : ''} saved</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="y2k-chrome-surface w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
                  <p className="text-[#1D1D1F] font-medium mb-1">Your wishlist is empty</p>
                  <p className="text-[#86868B] text-sm">Tap the heart on any product to save it here</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-[#F5F5F7] last:border-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-[#F5F5F7] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Y2kIcon emoji="🖨️" size={28} className="text-[#A6ACB8]" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1D1D1F] leading-snug">{item.name}</p>
                      <p className="text-xs text-[#86868B] mt-0.5 mb-2">{item.priceDisplay}</p>
                      <button
                        onClick={() => moveToCart(item)}
                        className="y2k-accent-surface y2k-shine px-3 py-1 text-[11px] font-semibold text-white rounded-full transition-all overflow-hidden"
                      >
                        Add to Cart
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => remove(item.id)}
                      className="text-[#86868B] hover:text-[#1D1D1F] transition-colors self-start mt-1"
                      aria-label="Remove from wishlist"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[#D2D2D7] space-y-3">
                <p className="text-[10px] text-[#86868B]">
                  Saved on this device. Move items to your cart to order them.
                </p>
                <button
                  onClick={addAllToCart}
                  className="y2k-chrome-surface y2k-shine w-full py-3.5 text-[#1D1D1F] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 overflow-hidden"
                >
                  Add All to Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
