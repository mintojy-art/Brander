import ChristmasDecorClient from '@/components/ChristmasDecorClient'
import { getProducts } from '@/lib/data/products'
import { getHomeSections } from '@/lib/data/homeSections'
import { christmasProducts } from '@/lib/christmas'
import { buildMetadata, SITE } from '@/lib/seo'

// Admin-added Christmas products appear here within a minute, no deploy needed.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Christmas Decor Online — 3D Printed Christmas Decorations, Bangalore',
  description:
    'Shop Christmas decor online: mini Christmas trees, reindeer figurines and festive table decorations, 3D printed and hand-finished in Bangalore. Shipped across India — order by 15 December.',
  path: '/christmas-decor',
  keywords: [
    'christmas decor online',
    'christmas decorations online India',
    'christmas decor Bangalore',
    'christmas decorations Bangalore',
    '3d printed christmas decorations',
    'mini christmas tree for table',
    'christmas table decor',
    'reindeer figurine for christmas',
    'christmas gifts Bangalore',
    'christmas home decor India',
  ],
})

export default async function ChristmasDecor() {
  const [products, sections] = await Promise.all([getProducts(), getHomeSections()])
  const items = christmasProducts(products, sections)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Christmas Decor — 3D Printed in Bangalore by ORIC',
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description || p.tagline || 'Christmas decoration, 3D printed and hand-finished in Bangalore.',
        image: p.image ? [p.image] : undefined,
        sku: p.id,
        category: 'Christmas Decor',
        brand: { '@type': 'Brand', name: 'ORIC' },
        manufacturer: { '@id': `${SITE}/#business` },
        ...(p.price ? {
          offers: {
            '@type': 'Offer',
            url: `${SITE}${p.href}`,
            priceCurrency: 'INR',
            price: p.price,
            availability: 'https://schema.org/InStock',
            seller: { '@id': `${SITE}/#business` },
          },
        } : {}),
      },
    })),
  }

  // No FAQPage schema here: the root layout already emits one site-wide, and
  // two FAQPage blocks on one page is a Search Console error. The visible FAQ
  // below still gets read by Google and AI answer engines.
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Christmas Decor', item: `${SITE}/christmas-decor` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ChristmasDecorClient products={items} />
    </>
  )
}
