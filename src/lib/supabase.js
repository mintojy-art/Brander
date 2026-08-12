import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = (url && key) ? createClient(url, key) : null
export const isConfigured = !!(url && key)

// Upload a file to a Supabase Storage bucket → returns public URL
async function uploadToBucket(file, bucket, { maxBytes } = {}) {
  if (!supabase) throw new Error('Supabase not configured')
  if (maxBytes && file.size > maxBytes) throw new Error('FILE_TOO_LARGE')
  const ext = file.name.split('.').pop()
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from(bucket)
    .upload(name, file, { cacheControl: '3600', upsert: false })
  if (error) {
    if (error.message?.toLowerCase().includes('bucket') || error.statusCode === '404' || error.error === 'Bucket not found') {
      throw new Error('BUCKET_MISSING')
    }
    throw error
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(name)
  return data.publicUrl
}

// Delete a file from a Supabase Storage bucket by its public URL
async function deleteFromBucket(url, bucket) {
  if (!supabase || !url) return
  const path = url.split(`/${bucket}/`)[1]
  if (path) await supabase.storage.from(bucket).remove([path])
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50MB — matches Supabase's default storage upload limit

export const uploadImage = (file) => uploadToBucket(file, 'product-images')
export const deleteImage = (url) => deleteFromBucket(url, 'product-images')

export const uploadVideo = (file) => uploadToBucket(file, 'testimonial-media', { maxBytes: MAX_VIDEO_BYTES })
export const deleteVideo = (url) => deleteFromBucket(url, 'testimonial-media')

export const uploadOccasionImage = (file) => uploadToBucket(file, 'bobblehead-media')
export const deleteOccasionImage = (url) => deleteFromBucket(url, 'bobblehead-media')
