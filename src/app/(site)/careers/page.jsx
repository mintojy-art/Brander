import CareersClient from '@/components/CareersClient'
import { getCareerRoles } from '@/lib/data/careers'
import { buildMetadata } from '@/lib/seo'

// Without this, an admin-added/edited role wouldn't show up here until the
// next deploy — same reasoning as the other Supabase-backed listing pages.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Careers at ORIC',
  description:
    'Open freelance consultant roles at ORIC — a Bangalore 3D print-on-demand studio. Design, marketing, and print specialist positions.',
  path: '/careers',
})

export default async function Careers() {
  const roles = await getCareerRoles()

  return <CareersClient roles={roles} />
}
