'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

// Initializes PostHog once on the client. Renders nothing — mirrors
// ContentProtection's standalone-mount pattern in layout.js rather than
// wrapping {children}, so it can never affect page rendering. No-ops
// entirely (including autocapture/session-replay) until
// NEXT_PUBLIC_POSTHOG_KEY is set, so it's safe to ship ahead of that.
export default function PostHogInit() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || posthog.__loaded) return
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
    })
  }, [])

  return null
}
