import { useState, useEffect } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    supabase
      .from('jobs')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => { setJobs(data || []); setLoading(false) })
  }, [])

  return { jobs, loading }
}
