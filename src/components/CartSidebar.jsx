import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function CartSidebar() {
  const { items, remove, update, total, count, isOpen, setIsOpen, checkoutWhatsApp } = useCart()

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
                <h2 className="text-lg font-semibold text-[#1D1D1F]">Your Cart</h2>
                <p className="text-xs text-[#86868B] mt-0.5">{count} item{count !== 1 ? 's' : ''}</p>
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
                  <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4 text-2xl">
                    🛒
                  </div>
                  <p className="text-[#1D1D1F] font-medium mb-1">Your cart is empty</p>
                  <p className="text-[#86868B] text-sm">Browse our shop to add products</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-[#F5F5F7] last:border-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-[#F5F5F7] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🖨️</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1D1D1F] leading-snug">{item.name}</p>
                      <p className="text-xs text-[#86868B] mt-0.5">{item.priceDisplay}</p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => update(item.id, item.qty - 1)}
                          className="w-6 h-6 rounded-full border border-[#D2D2D7] flex items-center justify-center text-[#424245] hover:bg-[#F5F5F7] text-sm transition-colors"
                        >−</button>
                        <span className="text-sm font-medium text-[#1D1D1F] w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => update(item.id, item.qty + 1)}
                          className="w-6 h-6 rounded-full border border-[#D2D2D7] flex items-center justify-center text-[#424245] hover:bg-[#F5F5F7] text-sm transition-colors"
                        >+</button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => remove(item.id)}
                      className="text-[#86868B] hover:text-[#1D1D1F] transition-colors self-start mt-1"
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
                {total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#86868B]">Subtotal</span>
                    <span className="font-semibold text-[#1D1D1F]">₹{total.toLocaleString()}</span>
                  </div>
                )}
                <p className="text-[10px] text-[#86868B]">
                  Custom items are priced after review. Final quote sent via WhatsApp.
                </p>
                <button
                  onClick={checkoutWhatsApp}
                  className="w-full py-3.5 bg-[#1D1D1F] hover:bg-[#424245] text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Order via WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
