'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { readingTime } from '@/lib/data/blog'

function CommentForm({ slug, onSubmitted }) {
  const [form, setForm] = useState({ name: '', email: '', comment_text: '', website: '' }) // "website" = honeypot
  const [status, setStatus] = useState('idle')
  const [err, setErr] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.website) return // honeypot tripped — silently drop
    if (!form.name.trim() || !form.comment_text.trim()) {
      setErr('Name and comment are required.')
      return
    }
    setStatus('loading')
    setErr('')
    const { error } = await supabase.from('blog_comments').insert({
      post_slug: slug,
      name: form.name.trim(),
      email: form.email.trim() || null,
      comment_text: form.comment_text.trim(),
      status: 'pending',
    })
    if (error) {
      setStatus('idle')
      setErr('Could not submit your comment. Please try again.')
      return
    }
    setStatus('done')
    onSubmitted?.()
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] px-5 py-4 text-sm text-[#166534]">
        ✓ Thanks! Your comment has been submitted and will appear once it's reviewed.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        value={form.website}
        onChange={(e) => set('website', e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-2.5 text-sm border border-[#D2D2D7] rounded-lg outline-none focus:border-[#1D1D1F] transition-colors"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="Email (not shown publicly)"
          className="w-full px-4 py-2.5 text-sm border border-[#D2D2D7] rounded-lg outline-none focus:border-[#1D1D1F] transition-colors"
        />
      </div>
      <textarea
        rows={4}
        value={form.comment_text}
        onChange={(e) => set('comment_text', e.target.value)}
        placeholder="Share your thoughts…"
        className="w-full px-4 py-2.5 text-sm border border-[#D2D2D7] rounded-lg outline-none focus:border-[#1D1D1F] transition-colors resize-none"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all disabled:opacity-50"
      >
        {status === 'loading' ? 'Submitting…' : 'Post Comment'}
      </button>
    </form>
  )
}

export default function BlogPostClient({ post, related, comments }) {
  const [localComments, setLocalComments] = useState(comments)
  const [justSubmitted, setJustSubmitted] = useState(false)

  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="bg-[#F5F5F7] border-b border-[#D2D2D7]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#86868B] flex-wrap">
            <Link href="/" className="hover:text-[#1D1D1F] transition-colors">Home</Link>
            <span>›</span>
            <Link href="/blog" className="hover:text-[#1D1D1F] transition-colors">Blog</Link>
            <span>›</span>
            <Link href={`/blog?cat=${encodeURIComponent(post.category)}`} className="hover:text-[#1D1D1F] transition-colors">{post.category}</Link>
            <span>›</span>
            <span className="text-[#1D1D1F] font-medium truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href={`/blog?cat=${encodeURIComponent(post.category)}`} className="inline-block px-3 py-1 bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold rounded-full mb-4">
            {post.category}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-[#86868B] mb-8">
            <span>{post.author_name}</span>
            <span>·</span>
            <span>{new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <span>{readingTime(post.content_html)} min read</span>
          </div>
        </motion.div>

        {post.featured_image && (
          <motion.div
            className="aspect-[16/9] rounded-3xl overflow-hidden bg-[#F5F5F7] mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Content */}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content_html || '' }} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[#F5F5F7]">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-[#86868B] bg-[#F5F5F7] px-3 py-1 rounded-full">#{tag}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 rounded-3xl bg-[#1D1D1F] px-8 py-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3">Got a project in mind?</p>
          <h3 className="text-2xl font-bold text-white mb-5">Let's bring it to life.</h3>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#1D1D1F] text-sm font-bold rounded-full hover:bg-[#F5F5F7] transition-all"
          >
            Message Us on WhatsApp →
          </a>
        </div>

        {/* Comments */}
        <div className="mt-14 pt-10 border-t border-[#D2D2D7]">
          <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">
            {localComments.length > 0 ? `${localComments.length} Comment${localComments.length !== 1 ? 's' : ''}` : 'Comments'}
          </h2>

          {localComments.length > 0 && (
            <div className="space-y-5 mb-8">
              {localComments.map((c) => (
                <div key={c.id} className="border-b border-[#F5F5F7] pb-5 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#1D1D1F]">{c.name}</span>
                    <span className="text-xs text-[#86868B]">{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-sm text-[#424245] leading-relaxed">{c.comment_text}</p>
                </div>
              ))}
            </div>
          )}

          {!justSubmitted && <CommentForm slug={post.slug} onSubmitted={() => setJustSubmitted(true)} />}
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#D2D2D7]">
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">More in {post.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#F5F5F7] mb-3 border border-[#D2D2D7]">
                    {r.featured_image ? (
                      <img src={r.featured_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📝</div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#1D1D1F] leading-snug group-hover:underline underline-offset-2">{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
