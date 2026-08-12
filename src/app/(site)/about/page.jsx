import AboutClient from '@/components/AboutClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'About Our Bangalore 3D Print Studio',
  description:
    'Meet ORIC, the Bangalore studio behind the prints. See our FDM setup, how we work, and why we take on jobs with no minimum order.',
  path: '/about',
})

export default function About() {
  return <AboutClient />
}
