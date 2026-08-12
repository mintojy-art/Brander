'use client'

import dynamic from 'next/dynamic'

const LithophaneClient = dynamic(() => import('@/components/LithophaneClient'), { ssr: false })

export default function LithophaneDynamic() {
  return <LithophaneClient />
}
