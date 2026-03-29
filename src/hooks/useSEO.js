import { useEffect } from 'react'

const BASE = 'ORIC · 3D Printing Bangalore'

export function useSEO({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : BASE

    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (tag) tag.setAttribute('content', description)
    }
  }, [title, description])
}
