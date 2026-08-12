import { notFound } from 'next/navigation'
import BobbleheadDetailClient from '@/components/BobbleheadDetailClient'
import { getBobbleheadOccasionById, getBobbleheadOccasions } from '@/lib/data/bobbleheadOccasions'
import { buildMetadata, SITE } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { id } = await params
  const occasion = await getBobbleheadOccasionById(id)
  if (!occasion) return buildMetadata({ title: 'Bobbleheads', path: `/bobbleheads/${id}` })

  const occasionImage = (occasion.images || []).filter(Boolean)[0]
  const rawDescription = occasion.description || 'Custom bobbleheads made in Bangalore, India.'

  return buildMetadata({
    title: `${occasion.title} Bobbleheads`,
    description: rawDescription.length > 155 ? `${rawDescription.slice(0, 154)}…` : rawDescription,
    path: `/bobbleheads/${id}`,
    image: occasionImage,
  })
}

export default async function BobbleheadDetail({ params }) {
  const { id } = await params
  const [occasion, occasions] = await Promise.all([
    getBobbleheadOccasionById(id),
    getBobbleheadOccasions(),
  ])

  if (!occasion) notFound()

  const occasionImage = (occasion.images || []).filter(Boolean)[0]
  const rawDescription = occasion.description || 'Custom bobbleheads made in Bangalore, India.'
  const related = occasions.filter((o) => o.id !== occasion.id).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${occasion.title} Bobbleheads`,
    description: rawDescription,
    image: occasionImage ? [occasionImage] : undefined,
    category: 'Bobbleheads',
    brand: { '@type': 'Brand', name: 'ORIC' },
    manufacturer: { '@id': `${SITE}/#business` },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BobbleheadDetailClient occasion={occasion} related={related} />
    </>
  )
}
