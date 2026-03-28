import { createContext, useContext, useState } from 'react'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [items, setItems]   = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const add = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setIsOpen(true)
  }

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const update = (id, qty) => {
    if (qty <= 0) return remove(id)
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i))
  }

  const clear = () => setItems([])

  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const checkoutWhatsApp = () => {
    if (!items.length) return
    const lines = items.map(
      (i) => `• ${i.name} (x${i.qty}) — ${i.price ? `₹${(i.price * i.qty).toLocaleString()}` : 'Custom Quote'}`
    )
    const totalLine = total > 0 ? `\n\nTotal: ₹${total.toLocaleString()}` : ''
    const msg = `Hi ORIC! I'd like to place an order:\n\n${lines.join('\n')}${totalLine}\n\nPlease confirm availability and payment details.`
    window.open(`https://wa.me/918310194953?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count, isOpen, setIsOpen, checkoutWhatsApp }}>
      {children}
    </CartContext.Provider>
  )
}
