import { useState, useEffect } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    supabase
      .from('testimonials')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setTestimonials(data)
        setLoading(false)
      })
  }, [])

  return { testimonials, loading }
}
