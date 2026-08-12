import RefundPolicyClient from '@/components/RefundPolicyClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Refund & Reprint Policy',
  description:
    "ORIC's return, refund, and reprint policy. Defective or damaged prints are reprinted free. Learn how to raise a request.",
  path: '/refund-policy',
})

export default function RefundPolicy() {
  return <RefundPolicyClient />
}
