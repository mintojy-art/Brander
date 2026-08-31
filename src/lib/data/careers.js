import { supabase, isConfigured } from '@/lib/supabase'
import { careerRoles as staticCareerRoles } from '@/data/careers'

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type || 'Freelance Consultant',
    summary: row.summary || '',
    description: row.description || '',
    responsibilities: row.responsibilities || [],
    requirements: row.requirements || [],
    active: row.active,
    sort_order: row.sort_order ?? 0,
  }
}

export async function getCareerRoles() {
  if (!isConfigured) return staticCareerRoles

  const { data, error } = await supabase
    .from('career_roles')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error || !data?.length) return staticCareerRoles
  return data.map(mapRow)
}

export async function getCareerRoleById(id) {
  const roles = await getCareerRoles()
  return roles.find((r) => String(r.id) === String(id)) || null
}
