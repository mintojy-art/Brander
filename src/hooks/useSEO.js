import { useEffect } from 'react'

const SITE = 'https://www.oric3d.com'
const SUFFIX = ' | ORIC'
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`

function setMeta(attr, key, content) {
  if (!content) return
  let tag = document.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setLink(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

// path: route path (e.g. "/services") used to build the canonical + OG URL.
// image: absolute path to a page-specific OG image (e.g. "/og-lithophane.jpg");
//        falls back to the site default when omitted.
export function useSEO({ title, description, path = '', image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title}${SUFFIX}` : 'ORIC · 3D Printing Bangalore'
    document.title = fullTitle

    const url = `${SITE}${path}`
    const ogImage = image ? `${SITE}${image}` : DEFAULT_IMAGE

    if (description) setMeta('name', 'description', description)
    setLink('canonical', url)

    setMeta('property', 'og:url', url)
    setMeta('property', 'og:title', fullTitle)
    if (description) setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', ogImage)

    setMeta('name', 'twitter:title', fullTitle)
    if (description) setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', ogImage)
  }, [title, description, path, image])
}
