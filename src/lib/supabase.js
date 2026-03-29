import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = (url && key) ? createClient(url, key) : null
export const isConfigured = !!(url && key)

// Upload an image file to Supabase Storage → returns public URL
export async function uploadImage(file) {
  if (!supabase) throw new Error('Supabase not configured')
  const ext = file.name.split('.').pop()
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(name, file, { cacheControl: '3600', upsert: false })
  if (error) {
    if (error.message?.toLowerCase().includes('bucket') || error.statusCode === '404' || error.error === 'Bucket not found') {
      throw new Error('BUCKET_MISSING')
    }
    throw error
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(name)
  return data.publicUrl
}

// Delete an image from Supabase Storage by its public URL
export async function deleteImage(url) {
  if (!supabase || !url) return
  const path = url.split('/product-images/')[1]
  if (path) await supabase.storage.from('product-images').remove([path])
}
