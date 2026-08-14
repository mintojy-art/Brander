'use client'

import { useEffect } from 'react'
import { initProtection } from '@/utils/protect'

export default function ContentProtection() {
  useEffect(() => {
    // Right-click / DevTools blocking is a production-only deterrent — it
    // would otherwise stop us from inspecting our own site while developing.
    if (process.env.NODE_ENV === 'production') initProtection()
  }, [])

  return null
}
