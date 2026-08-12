import ServicesClient from '@/components/ServicesClient'
import { services } from '@/data/services'
import { buildMetadata, SITE } from '@/lib/seo'

export const metadata = buildMetadata({
  title: '3D Printing & Prototyping Services, Bangalore',
  description:
    'Nine 3D printing services in Bangalore — small batch manufacturing, prototyping, figurines, bobbleheads, toys and idols. Request a quote today.',
  path: '/services',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '3D Printing Services — ORIC Bangalore',
  itemListElement: services.map((svc, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: svc.title,
      description: svc.description,
      provider: { '@id': `${SITE}/#business` },
      areaServed: 'IN',
    },
  })),
}

export default function Services() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicesClient />
    </>
  )
}
