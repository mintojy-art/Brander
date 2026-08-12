import { Suspense } from 'react'
import ShopClient from '@/components/ShopClient'
import { getProducts } from '@/lib/data/products'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Buy 3D Printed Figurines, Toys & Parts',
  description:
    "Browse ORIC's 3D printed figurines, toys, custom parts and prototypes. Order online, no minimum quantity, delivered anywhere in India.",
  path: '/shop',
})

export default async function Shop() {
  const products = await getProducts()

  return (
    <Suspense>
      <ShopClient products={products} />
    </Suspense>
  )
}
