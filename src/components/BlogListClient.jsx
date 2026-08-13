'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { readingTime } from '@/lib/data/blog'
import Y2kIcon from '@/components/Y2kIcon'

function PostCard({ post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="y2k-lift group bg-white rounded-3xl overflow-hidden border border-[#D2D2D7] hover:shadow-xl transition-all duration-500 block h-full flex flex-col"
      >
        <div className="aspect-[16/10] bg-[#F5F5F7] relative overflow-hidden">
          {post.featured_image ? (
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Y2kIcon emoji="📝" size={56} className="text-[#A6ACB8]" /></div>
          )}
          <div className="y2k-lime-glow absolute top-4 left-4 px-3 py-1 bg-[#B6FF3C] text-[#1D1D1F] text-[10px] font-bold tracking-wider rounded-full">
            {post.category}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-base font-semibold text-[#1D1D1F] leading-snug mb-2 group-hover:underline underline-offset-2">{post.title}</h3>
          <p className="text-sm text-[#86868B] mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
          <div className="mt-auto flex items-center gap-2 text-xs text-[#86868B]">
            <span>{new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>·</span>
            <span>{readingTime(post.content_html)} min read</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function BlogListClient({ posts, categories, initialCategory = 'All' }) {
  const router = useRouter()
  // Driven by a prop from the server (page.jsx reads the ?cat= query param
  // itself) rather than useSearchParams() — calling that hook here would
  // force this entire component to bail out of server rendering, which
  // silently made the whole /blog page invisible to non-JS crawlers.
  const [active, setActiveState] = useState(initialCategory)
  useEffect(() => { setActiveState(initialCategory) }, [initialCategory])
  const setActive = (cat) => {
    setActiveState(cat)
    router.push(cat === 'All' ? '/blog' : `/blog?cat=${encodeURIComponent(cat)}`, { scroll: false })
  }
  const filtered = active === 'All' ? posts : posts.filter((p) => p.category === active)

  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Header */}
      <div className="y2k-dark-surface">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-24 text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFA35C] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            ORIC Blog
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Ideas, guides<br /><span className="text-[#FFA35C]">& behind the scenes.</span>
          </motion.h1>
          <motion.p
            className="text-[#86868B] text-base max-w-lg mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            3D printing tips, buying guides, and stories from the ORIC workshop in Bangalore.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                active === cat
                  ? 'y2k-accent-surface'
                  : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED] hover:text-[#1D1D1F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        ) : (
          <div className="y2k-chrome-surface rounded-3xl p-10 md:p-14 text-center">
            <div className="flex justify-center mb-3"><Y2kIcon emoji="📝" size={48} className="text-[#A6ACB8]" /></div>
            <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">
              {posts.length === 0 ? 'No posts yet' : `No posts in "${active}" yet`}
            </h3>
            <p className="text-sm text-[#424245] max-w-sm mx-auto">
              {posts.length === 0 ? 'Check back soon — we\'re working on it.' : 'Try a different category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
