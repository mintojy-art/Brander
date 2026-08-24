'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()
export const useWishlist = () => useContext(WishlistContext)

const STORAGE_KEY = 'oric_wishlist'

// Unlike the cart (session-only, cleared on checkout), a wishlist only
// means something if it survives a closed tab and a return visit days
// later — so this one persists to localStorage. There's no customer
// account system on this site, so per-device local storage is the only
// realistic option without a much bigger auth project.
export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  // Skipped until after the load above runs, so we never clobber a saved
  // wishlist with the empty array this state starts as.
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items, hydrated])

  const isWishlisted = (id) => items.some((i) => i.id === id)

  const toggle = (product) => {
    setItems((prev) =>
      prev.some((i) => i.id === product.id)
        ? prev.filter((i) => i.id !== product.id)
        : [...prev, product]
    )
  }

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clear = () => setItems([])

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, remove, clear, count: items.length, isOpen, setIsOpen }}>
      {children}
    </WishlistContext.Provider>
  )
}
