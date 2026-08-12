import { STATIC_ROUTES } from '@/lib/routes'
import { SITE } from '@/lib/seo'
import { getBlogPosts } from '@/lib/data/blog'

export default async function sitemap() {
  const now = new Date()
  const staticEntries = STATIC_ROUTES.map(({ path, freq, priority }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority: Number(priority),
  }))

  const posts = await getBlogPosts()
  const postEntries = posts.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: p.updated_at || p.published_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries]
}
