import { STATIC_ROUTES } from '@/lib/routes'
import { SITE } from '@/lib/seo'

export default function sitemap() {
  const now = new Date()
  return STATIC_ROUTES.map(({ path, freq, priority }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority: Number(priority),
  }))
}
