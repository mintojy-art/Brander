import LithophaneDynamic from '@/components/LithophaneDynamic'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Free Lithophane Generator — Photo to STL',
  description:
    'Free lithophane generator — turn any photo into a 3D-printable STL in plane, cylinder, arc or sphere. Download free or order the print from us.',
  path: '/lithophanes',
})

export default function Lithophane() {
  return <LithophaneDynamic />
}
