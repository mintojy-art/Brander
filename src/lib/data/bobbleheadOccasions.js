import { supabase, isConfigured } from '@/lib/supabase'

export async function getBobbleheadOccasions() {
  if (!isConfigured) return []

  const { data, error } = await supabase
    .from('bobblehead_occasions')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data
}

export async function getBobbleheadOccasionById(id) {
  const occasions = await getBobbleheadOccasions()
  return occasions.find((o) => String(o.id) === String(id)) || null
}
