import { Suspense } from 'react'
import ThankYouClient from '@/components/ThankYouClient'
import { THANK_YOU_CONTENT } from '@/lib/thankYouContent'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const content = THANK_YOU_CONTENT[params?.type] || THANK_YOU_CONTENT.default
  return buildMetadata({ title: 'Thank You', description: content.message, path: '/thank-you' })
}

export default function ThankYou() {
  return (
    <Suspense>
      <ThankYouClient />
    </Suspense>
  )
}
