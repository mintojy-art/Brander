import BlogListClient from '@/components/BlogListClient'
import { getBlogPosts } from '@/lib/data/blog'
import { BLOG_CATEGORIES } from '@/data/blogCategories'
import { buildMetadata } from '@/lib/seo'

// Without this, Next.js statically generates this page once at build/deploy
// time and serves that snapshot to every visitor until the next deploy —
// new/edited posts saved in the admin dashboard wouldn't show up here.
export const revalidate = 60

export const metadata = buildMetadata({
  title: 'Blog — 3D Printing Tips & Guides from ORIC',
  description:
    '3D printing tips, buying guides, and behind-the-scenes stories from the ORIC workshop in Bangalore.',
  path: '/blog',
})

export default async function Blog({ searchParams }) {
  const params = await searchParams
  const posts = await getBlogPosts()

  return <BlogListClient posts={posts} categories={BLOG_CATEGORIES} initialCategory={params?.cat || 'All'} />
}
