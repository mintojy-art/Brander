'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { readingTime } from '@/lib/data/blog'
import { SITE } from '@/lib/seo'
import Y2kIcon from '@/components/Y2kIcon'

function ShareButtons({ title, slug }) {
  const [copied, setCopied] = useState(false)
  const url = `${SITE}/blog/${slug}`

  const links = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    },
  ]

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mr-1">Share</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.label}`}
          title={`Share on ${l.label}`}
          className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#F37121] text-[#1D1D1F] hover:text-white flex items-center justify-center transition-colors"
        >
          {l.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        title="Copy link"
        className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#F37121] text-[#1D1D1F] hover:text-white flex items-center justify-center transition-colors"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07l1.5-1.5"/></svg>
        )}
      </button>
    </div>
  )
}

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
        className="y2k-accent-surface y2k-shine px-6 py-2.5 text-white text-sm font-semibold rounded-full transition-all disabled:opacity-50 overflow-hidden"
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
          <ShareButtons title={post.title} slug={post.slug} />
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
        <div className="y2k-dark-surface mt-10 rounded-3xl px-8 py-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFA35C] mb-3">Got a project in mind?</p>
          <h3 className="text-2xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-orbitron)' }}>Let's bring it to life.</h3>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="y2k-chrome-surface y2k-shine inline-flex items-center gap-2 px-7 py-3.5 text-[#1D1D1F] text-sm font-bold rounded-full transition-all overflow-hidden"
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
                <Link key={r.slug} href={`/blog/${r.slug}`} className="y2k-lift group block">
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#F5F5F7] mb-3 border border-[#D2D2D7]">
                    {r.featured_image ? (
                      <img src={r.featured_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Y2kIcon emoji="📝" size={32} className="text-[#A6ACB8]" /></div>
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
