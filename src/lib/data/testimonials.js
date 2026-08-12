import { supabase, isConfigured } from '@/lib/supabase'

export async function getTestimonials() {
  if (!isConfigured) return []

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data
}
