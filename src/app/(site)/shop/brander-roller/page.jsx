import BranderRollerClient from '@/components/BranderRollerClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Brander Roller — Hand-Held Stamp Roller',
  description:
    'The Brander Roller is a 15mm hand-held stamp roller for repeat ink marking on packaging, wood, fabric and more. Custom-engraved, made in India.',
  path: '/shop/brander-roller',
})

export default function BranderRollerPage() {
  return <BranderRollerClient />
}
