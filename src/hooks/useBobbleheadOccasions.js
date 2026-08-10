import { useState, useEffect } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

export function useBobbleheadOccasions() {
  const [occasions, setOccasions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    supabase
      .from('bobblehead_occasions')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setOccasions(data)
        setLoading(false)
      })
  }, [])

  return { occasions, loading }
}
