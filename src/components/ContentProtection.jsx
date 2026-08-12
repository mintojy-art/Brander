'use client'

import { useEffect } from 'react'
import { initProtection } from '@/utils/protect'

export default function ContentProtection() {
  useEffect(() => {
    initProtection()
  }, [])

  return null
}
