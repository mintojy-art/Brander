import BobbleheadsClient from '@/components/BobbleheadsClient'
import { getProducts } from '@/lib/data/products'
import { getBobbleheadOccasions } from '@/lib/data/bobbleheadOccasions'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Custom Bobbleheads, Made in Bangalore',
  description:
    'Hand-sculpted custom bobbleheads for weddings, birthdays and corporate gifts. Send a photo on WhatsApp, we print and ship across India.',
  path: '/bobbleheads',
})

export default async function Bobbleheads() {
  const [products, occasions] = await Promise.all([getProducts(), getBobbleheadOccasions()])

  return <BobbleheadsClient products={products} occasions={occasions} />
}
