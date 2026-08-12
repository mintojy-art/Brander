import { Suspense } from 'react'
import BlogListClient from '@/components/BlogListClient'
import { getBlogPosts } from '@/lib/data/blog'
import { BLOG_CATEGORIES } from '@/data/blogCategories'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Blog — 3D Printing Tips & Guides from ORIC',
  description:
    '3D printing tips, buying guides, and behind-the-scenes stories from the ORIC workshop in Bangalore.',
  path: '/blog',
})

export default async function Blog() {
  const posts = await getBlogPosts()

  return (
    <Suspense>
      <BlogListClient posts={posts} categories={BLOG_CATEGORIES} />
    </Suspense>
  )
}
