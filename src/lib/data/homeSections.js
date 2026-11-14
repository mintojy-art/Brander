import { supabase, isConfigured } from '@/lib/supabase'
import { BUILTIN_SECTIONS, defaultSections } from '@/lib/homeSections'

// Falls back to the built-in layout if the table doesn't exist yet (setup SQL
// not run) or Supabase is unreachable, so the home page never renders empty.
export async function getHomeSections() {
  if (!isConfigured) return defaultSections()

  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data) return defaultSections()

  return data.filter((s) =>
    s.kind === 'builtin' ? !!BUILTIN_SECTIONS[s.builtin_key] : s.kind === 'products' || s.kind === 'content'
  )
}
