import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/ProductDetailClient'
import { getProductById, getProducts } from '@/lib/data/products'
import { buildMetadata, SITE } from '@/lib/seo'
import { getHomeSections } from '@/lib/data/homeSections'
import { isChristmasProduct } from '@/lib/christmas'

export async function generateMetadata({ params }) {
  const { productId } = await params
  const [product, products, sections] = await Promise.all([getProductById(productId), getProducts(), getHomeSections()])
  const rawDesc = product?.description || product?.tagline || 'Custom 3D printed product from ORIC, Bangalore.'
  // Christmas products get a seasonal title; every other product keeps its
  // existing "Name — Category" title untouched.
  const xmas = isChristmasProduct(product, products, sections)

  return buildMetadata({
    title: product ? (xmas ? `${product.name} — Christmas Decor, Bangalore` : `${product.name} — ${product.category}`) : 'Product',
    description: rawDesc.length > 155 ? `${rawDesc.slice(0, 154)}…` : rawDesc,
    path: `/shop/${productId}`,
    image: product?.image || undefined,
    ...(xmas ? { keywords: ['christmas decor', 'christmas decorations online India', 'christmas decor Bangalore', '3d printed christmas decoration', product.name] } : {}),
  })
}

export default async function ProductDetail({ params }) {
  const { productId } = await params
  const [product, products, sections] = await Promise.all([getProductById(productId), getProducts(), getHomeSections()])

  if (!product) notFound()
  const xmas = isChristmasProduct(product, products, sections)

  const rawDesc = product.description || product.tagline || 'Custom 3D printed product from ORIC, Bangalore.'
  const related = products.filter((p) => p.id !== product.id && p.image).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: rawDesc,
    image: product.image ? [product.image] : undefined,
    sku: product.id,
    category: xmas ? 'Christmas Decor' : product.category,
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

  // Tells Google this product belongs under /christmas-decor (breadcrumb trail
  // in search results). Only added for Christmas products.
  const breadcrumbJsonLd = xmas ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Christmas Decor', item: `${SITE}/christmas-decor` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE}/shop/${product.id}` },
    ],
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {breadcrumbJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />}
      <ProductDetailClient product={product} related={related} />
    </>
  )
}
