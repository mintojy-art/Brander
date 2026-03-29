import { useState, useEffect } from 'react'
import { supabase, isConfigured } from '../lib/supabase'
import { products as staticProducts } from '../data/products'

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    price: row.price || null,
    priceDisplay: row.price_display || (row.price ? `₹${Number(row.price).toLocaleString('en-IN')}` : 'Get Quote'),
    category: row.category || 'Custom',
    image: row.image || null,
    badge: row.badge || null,
    href: row.href || `/shop/${row.id}`,
    material: row.material || '',
    lead: row.lead || '',
    rating: row.rating || null,
    reviews: row.reviews || null,
    highlights: row.highlights || [],
    specs: row.specs || {},
    preOrder: row.pre_order || false,
  }
}

export function useProducts() {
  const [products, setProducts] = useState(staticProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) { setError(error.message) }
        else if (data?.length) { setProducts(data.map(mapRow)) }
        setLoading(false)
      })
  }, [])

  return { products, loading, error }
}
