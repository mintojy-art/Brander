import { useEffect } from 'react'

// Injects a page-specific JSON-LD <script> into <head>, replacing it when
// `data` changes and removing it on unmount. `key` lets a page host more
// than one block (e.g. Product + BreadcrumbList) without clobbering others.
export function useJsonLd(data, key = 'page-jsonld') {
  useEffect(() => {
    if (!data) return
    let tag = document.getElementById(key)
    if (!tag) {
      tag = document.createElement('script')
      tag.id = key
      tag.type = 'application/ld+json'
      document.head.appendChild(tag)
    }
    tag.textContent = JSON.stringify(data)
    return () => { tag?.remove() }
  }, [data, key])
}
