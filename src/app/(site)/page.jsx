import HomeClient from '@/components/HomeClient'
import { getProducts } from '@/lib/data/products'
import { getTestimonials } from '@/lib/data/testimonials'
import { getBobbleheadOccasions } from '@/lib/data/bobbleheadOccasions'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: '3D Printing Service in Bangalore — Custom Prints',
  description:
    "Bangalore's 3D print-on-demand studio. Custom figurines, prototypes, parts and idols with FDM precision, no minimum order. Get a quote on WhatsApp.",
  path: '/',
})

export default async function Home() {
  const [products, testimonials, occasions] = await Promise.all([
    getProducts(),
    getTestimonials(),
    getBobbleheadOccasions(),
  ])

  return <HomeClient products={products} testimonials={testimonials} occasions={occasions} />
}
