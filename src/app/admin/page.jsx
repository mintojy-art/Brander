'use client'

import dynamic from 'next/dynamic'

const AdminClient = dynamic(() => import('@/components/AdminClient'), { ssr: false })

export default function Admin() {
  return <AdminClient />
}
