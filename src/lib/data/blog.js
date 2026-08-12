import { supabase, isConfigured } from '@/lib/supabase'

export function readingTime(html) {
  const text = (html || '').replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

// Published posts only — status='published' AND published_at has passed
// (a future published_at is how "Scheduled" is represented; it simply
// won't match this filter until its time comes).
export async function getBlogPosts({ category } = {}) {
  if (!isConfigured) return []

  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error || !data) return []
  return data
}

export async function getBlogPostBySlug(slug) {
  if (!isConfigured) return null

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null
  return data
}

export async function getRelatedPosts(category, excludeSlug, limit = 3) {
  if (!isConfigured) return []

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data
}

export async function getApprovedComments(slug) {
  if (!isConfigured) return []

  const { data, error } = await supabase
    .from('blog_comments')
    .select('id, name, comment_text, created_at')
    .eq('post_slug', slug)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data
}
