import { STATIC_ROUTES } from '@/lib/routes'
import { SITE } from '@/lib/seo'
import { getBlogPosts } from '@/lib/data/blog'
import { getProducts } from '@/lib/data/products'
import { getBobbleheadOccasions } from '@/lib/data/bobbleheadOccasions'

export default async function sitemap() {
  const now = new Date()
  const staticEntries = STATIC_ROUTES.map(({ path, freq, priority }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority: Number(priority),
  }))
  const staticPaths = new Set(STATIC_ROUTES.map((r) => r.path))

  const [posts, products, occasions] = await Promise.all([
    getBlogPosts(),
    getProducts(),
    getBobbleheadOccasions(),
  ])

  const postEntries = posts.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: p.updated_at || p.published_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const productEntries = [...new Set(products.map((p) => p.href))]
    .filter((href) => href?.startsWith('/shop/') && !staticPaths.has(href))
    .map((href) => ({ url: `${SITE}${href}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 }))

  const occasionEntries = occasions.map((o) => ({
    url: `${SITE}/bobbleheads/${o.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...productEntries, ...occasionEntries, ...postEntries]
}
