import MaskStudioClient from '@/components/MaskStudioClient'
import { getProducts } from '@/lib/data/products'
import { buildMetadata } from '@/lib/seo'

// Without this, Next.js statically generates this page once at build/deploy
// time and serves that snapshot to every visitor until the next deploy —
// admin-added masks wouldn't show up here.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Mask Studio — Custom Cosplay & Display Masks',
  description:
    'Hand-finished cosplay and display masks, sculpted and 3D printed in Bangalore. Browse the collection or commission a custom piece.',
  path: '/mask-studio',
  keywords: ['custom cosplay mask', 'cosplay prop maker Bangalore', '3d printed mask'],
})

export default async function MaskStudio() {
  const products = await getProducts()
  return <MaskStudioClient products={products} />
}
