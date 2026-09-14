'use client'

import { createContext, useContext, useState } from 'react'
import posthog from 'posthog-js'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [items, setItems]   = useState([])
  const [isOpen, setIsOpen] = useState(false)

  // Central add() — every "Add to Cart" button site-wide funnels through
  // here, so this one capture() covers the whole product-card surface
  // rather than needing to be sprinkled into every ProductCard variant.
  const add = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setIsOpen(true)
    posthog.capture('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price ?? null,
      category: product.category ?? null,
    })
  }

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const update = (id, qty) => {
    if (qty <= 0) return remove(id)
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i))
  }

  const clear = () => setItems([])

  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  // The site's real "purchase" event — there's no checkout page, this
  // WhatsApp handoff is the actual conversion.
  const checkoutWhatsApp = () => {
    if (!items.length) return
    const lines = items.map((i) => {
      const head = `• ${i.name} (x${i.qty}) — ${i.price ? `₹${(i.price * i.qty).toLocaleString()}` : 'Custom Quote'}`
      return i.tagline ? `${head}\n   ${i.tagline}` : head
    })
    const totalLine = total > 0 ? `\n\nTotal: ₹${total.toLocaleString()}` : ''
    const msg = `Hi ORIC! I'd like to place an order:\n\n${lines.join('\n')}${totalLine}\n\nPlease confirm availability and payment details.`
    posthog.capture('whatsapp_checkout_clicked', {
      item_count: count,
      total_value: total,
      product_ids: items.map((i) => i.id),
    })
    window.open(`https://wa.me/918310194953?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count, isOpen, setIsOpen, checkoutWhatsApp }}>
      {children}
    </CartContext.Provider>
  )
}
