import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/ProductDetailClient'
import { getProductById, getProducts } from '@/lib/data/products'
import { buildMetadata, SITE } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { productId } = await params
  const product = await getProductById(productId)
  const rawDesc = product?.description || product?.tagline || 'Custom 3D printed product from ORIC, Bangalore.'

  return buildMetadata({
    title: product ? `${product.name} — ${product.category}` : 'Product',
    description: rawDesc.length > 155 ? `${rawDesc.slice(0, 154)}…` : rawDesc,
    path: `/shop/${productId}`,
    image: product?.image || undefined,
  })
}

export default async function ProductDetail({ params }) {
  const { productId } = await params
  const [product, products] = await Promise.all([getProductById(productId), getProducts()])

  if (!product) notFound()

  const rawDesc = product.description || product.tagline || 'Custom 3D printed product from ORIC, Bangalore.'
  const related = products.filter((p) => p.id !== product.id && p.image).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: rawDesc,
    image: product.image ? [product.image] : undefined,
    sku: product.id,
    category: product.category,
    brand: { '@type': 'Brand', name: 'ORIC' },
    manufacturer: { '@id': `${SITE}/#business` },
    ...(product.price ? {
      offers: {
        '@type': 'Offer',
        url: `${SITE}/shop/${product.id}`,
        priceCurrency: 'INR',
        price: product.price,
        availability: 'https://schema.org/InStock',
        seller: { '@id': `${SITE}/#business` },
      },
    } : {}),
    ...(product.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 1,
      },
    } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient product={product} related={related} />
    </>
  )
}
