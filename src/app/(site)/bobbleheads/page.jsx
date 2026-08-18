import BobbleheadsClient from '@/components/BobbleheadsClient'
import { getProducts } from '@/lib/data/products'
import { getBobbleheadOccasions } from '@/lib/data/bobbleheadOccasions'
import { buildMetadata } from '@/lib/seo'

// Without this, Next.js statically generates this page once at build/deploy
// time and serves that snapshot to every visitor until the next deploy —
// admin-added products/occasions wouldn't show up here.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Custom Bobbleheads, Made in Bangalore',
  description:
    'Hand-sculpted custom bobbleheads for weddings, birthdays and corporate gifts. Send a photo on WhatsApp, we print and ship across India.',
  path: '/bobbleheads',
  keywords: [
    'custom bobblehead near me',
    'best bobblehead store in Bangalore',
    'custom bobblehead Bangalore',
    'bobblehead maker near me',
  ],
})

export default async function Bobbleheads() {
  const [products, occasions] = await Promise.all([getProducts(), getBobbleheadOccasions()])

  return <BobbleheadsClient products={products} occasions={occasions} />
}
