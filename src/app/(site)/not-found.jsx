import NotFoundContent from '@/components/NotFoundContent'

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
}

export default function SiteNotFound() {
  return <NotFoundContent />
}
