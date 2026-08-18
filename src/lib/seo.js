export const SITE = 'https://www.oric3d.com'
const DEFAULT_IMAGE = '/og-image.jpg'

// Builds a Next.js `generateMetadata()` return value from the same
// { title, description, path, image } shape the old useSEO() hook took.
// Root layout's title template ('%s | ORIC') appends the suffix automatically.
export function buildMetadata({ title, description, path = '', image, keywords }) {
  const url = `${SITE}${path}`
  const ogImage = image || DEFAULT_IMAGE

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path || '/' },
    openGraph: {
      url,
      title,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      title,
      description,
      images: [ogImage],
    },
  }
}
