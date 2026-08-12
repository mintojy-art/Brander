import { notFound } from 'next/navigation'
import BlogPostClient from '@/components/BlogPostClient'
import { getBlogPostBySlug, getRelatedPosts, getApprovedComments } from '@/lib/data/blog'
import { buildMetadata, SITE } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return buildMetadata({ title: 'Blog', path: `/blog/${slug}` })

  const rawDescription = post.meta_description || post.excerpt || 'ORIC blog post.'

  return buildMetadata({
    title: post.meta_title || post.title,
    description: rawDescription.length > 155 ? `${rawDescription.slice(0, 154)}…` : rawDescription,
    path: `/blog/${slug}`,
    image: post.featured_image,
  })
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) notFound()

  const [related, comments] = await Promise.all([
    getRelatedPosts(post.category, post.slug),
    getApprovedComments(post.slug),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.meta_description || '',
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: post.author_name || 'ORIC' },
    publisher: { '@id': `${SITE}/#business` },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPostClient post={post} related={related} comments={comments} />
    </>
  )
}
