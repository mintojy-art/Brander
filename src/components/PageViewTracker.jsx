'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// One id per browser session (cleared when the tab/browser closes) — lets
// the admin dashboard tell "5 page views" apart from "2 visitors, 5 views".
function getSessionId() {
  try {
    let id = sessionStorage.getItem('oric_session_id')
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem('oric_session_id', id)
    }
    return id
  } catch {
    return null // sessionStorage unavailable (private mode, etc.) — skip tracking
  }
}

export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!supabase) return
    const sessionId = getSessionId()
    if (!sessionId) return

    supabase.from('page_views').insert({
      path: pathname,
      referrer: document.referrer || null,
      session_id: sessionId,
    }).then(({ error }) => {
      // Table not set up yet, or any other issue — never let analytics
      // logging affect the actual site, just drop it silently.
      if (error) return
    })
  }, [pathname])

  return null
}
