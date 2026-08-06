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

const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50MB — matches Supabase's default storage upload limit

// Upload a testimonial video to Supabase Storage → returns public URL
export async function uploadVideo(file) {
  if (!supabase) throw new Error('Supabase not configured')
  if (file.size > MAX_VIDEO_BYTES) throw new Error('VIDEO_TOO_LARGE')
  const ext = file.name.split('.').pop()
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('testimonial-media')
    .upload(name, file, { cacheControl: '3600', upsert: false })
  if (error) {
    if (error.message?.toLowerCase().includes('bucket') || error.statusCode === '404' || error.error === 'Bucket not found') {
      throw new Error('BUCKET_MISSING')
    }
    throw error
  }
  const { data } = supabase.storage.from('testimonial-media').getPublicUrl(name)
  return data.publicUrl
}

// Delete a testimonial video from Supabase Storage by its public URL
export async function deleteVideo(url) {
  if (!supabase || !url) return
  const path = url.split('/testimonial-media/')[1]
  if (path) await supabase.storage.from('testimonial-media').remove([path])
}
