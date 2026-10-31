import { unstable_cache } from 'next/cache'
import { supabase, isConfigured } from '@/lib/supabase'
import { products as staticProducts } from '@/data/products'

function mapRow(row) {
  const imgs = (row.images || []).filter(Boolean)
  if (!imgs.length && row.image) imgs.push(row.image)
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    price: row.price || null,
    priceDisplay: row.price_display || (row.price ? `₹${Number(row.price).toLocaleString('en-IN')}` : 'Get Quote'),
    category: row.category || 'Custom',
    image: imgs[0] || null,
    images: imgs,
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

// Ensure static products have an images array
const staticWithImages = staticProducts.map((p) => ({
  ...p,
  images: p.images || (p.image ? [p.image] : []),
}))

// /shop and /shop/[id] render per request (they read searchParams/params), so
// without this every visit waited on a fresh Supabase round trip (~2s live).
// 60s matches the revalidate window the statically generated pages use.
export const getProducts = unstable_cache(
  async () => {
    if (!isConfigured) return staticWithImages

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error || !data?.length) return staticWithImages
    return data.map(mapRow)
  },
  ['products'],
  { revalidate: 60, tags: ['products'] }
)

export async function getProductById(id) {
  const products = await getProducts()
  return products.find((p) => p.id === id) || null
}
