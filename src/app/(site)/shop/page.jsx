import ShopClient from '@/components/ShopClient'
import { getProducts } from '@/lib/data/products'
import { buildMetadata } from '@/lib/seo'

// Without this, Next.js statically generates this page once at build/deploy
// time and serves that snapshot to every visitor until the next deploy —
// admin-added products wouldn't show up here.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Buy 3D Printed Figurines, Toys & Parts',
  description:
    "Browse ORIC's 3D printed figurines, toys, custom parts and prototypes. Order online, no minimum quantity, delivered anywhere in India.",
  path: '/shop',
})

export default async function Shop({ searchParams }) {
  const params = await searchParams
  const products = await getProducts()

  return <ShopClient products={products} initialCategory={params?.cat || 'All'} />
}
