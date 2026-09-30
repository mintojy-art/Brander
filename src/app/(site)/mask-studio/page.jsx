import MaskStudioClient from '@/components/MaskStudioClient'
import { getProducts } from '@/lib/data/products'
import { buildMetadata, SITE } from '@/lib/seo'

// Without this, Next.js statically generates this page once at build/deploy
// time and serves that snapshot to every visitor until the next deploy —
// admin-added masks wouldn't show up here.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Custom Mask Design & Cosplay Mask Design in Bangalore, India',
  description:
    'Custom mask design and custom cosplay mask design in Bangalore, India — hand-finished, 3D printed cosplay and display masks. Browse the collection or commission a custom piece, shipped pan-India.',
  path: '/mask-studio',
  keywords: [
    'custom mask design',
    'custom mask design Bangalore',
    'custom cosplay mask design in Bangalore',
    'custom cosplay mask design India',
    'cosplay mask maker Bangalore',
    'cosplay prop maker Bangalore',
    '3d printed cosplay mask',
    'custom mask near me',
  ],
})

// FAQ schema, matched to the exact phrasing people search for — surfaces as
// a rich result in Google and is the kind of clearly-labeled Q&A content AI
// answer engines (ChatGPT, Perplexity, Google AI Overviews) tend to lift
// verbatim when citing a source for "who does custom mask design in X".
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE}/mask-studio#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who does custom mask design in Bangalore, India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ORIC Mask Studio, based in Bangalore, designs and 3D prints custom masks — including custom cosplay mask design — for customers across India. Send a reference photo or sketch on WhatsApp and get a quote within 24 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer custom cosplay mask design in Bangalore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — ORIC's Mask Studio hand-sculpts and 3D prints custom cosplay masks from a photo, sketch, or character reference, finished and painted in Bangalore, then shipped across India.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get a mask 3D printed and shipped anywhere in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — every mask is printed to order in Bangalore and shipped pan-India via Shiprocket/Delhivery. There's no minimum order, whether it's a display piece or a full cosplay mask.",
      },
    },
  ],
}

export default async function MaskStudio() {
  const products = await getProducts()
  const masks = products.filter((p) => p.category === 'Cosplay')

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Custom Cosplay & Display Masks — ORIC Mask Studio, Bangalore',
    itemListElement: masks.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description || p.tagline || 'Custom cosplay mask, hand-finished and 3D printed in Bangalore.',
        image: p.image ? [p.image] : undefined,
        sku: p.id,
        category: 'Custom Cosplay Mask',
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <MaskStudioClient products={products} />
    </>
  )
}
