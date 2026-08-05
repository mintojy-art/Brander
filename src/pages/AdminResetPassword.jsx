import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase'

const Input = ({ className = '', ...p }) => (
  <input className={`w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 transition-all text-[#202223] bg-white ${className}`} {...p} />
)

export default function AdminResetPassword() {
  const [ready, setReady] = useState(false)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!supabase) return
    // Supabase parses the recovery token from the URL on load and fires this event
    // once a temporary recovery session is established.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // If we already have a session by the time this mounts (fast token parse), allow it too.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (pw.length < 6) return setErr('Password must be at least 6 characters.')
    if (pw !== pw2) return setErr('Passwords do not match.')
    setBusy(true); setErr('')
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (error) setErr(error.message)
    else setDone(true)
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E1E3E5] w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-black text-xl">O</div>
          <h1 className="text-xl font-bold text-[#202223]">Reset Password</h1>
          <p className="text-sm text-[#6D7175] mt-1">ORIC Admin</p>
        </div>

        {!isConfigured ? (
          <p className="text-sm text-red-600 text-center">Supabase isn't configured.</p>
        ) : done ? (
          <div className="text-center py-2 space-y-4">
            <p className="text-sm font-semibold text-green-700">✓ Password updated</p>
            <Link to="/admin" className="inline-block w-full py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
              Go to sign in
            </Link>
          </div>
        ) : !ready ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-[#6D7175]">
              This link is invalid or has expired. Request a new one from the login screen.
            </p>
            <Link to="/admin" className="text-sm font-semibold text-[#1D1D1F] hover:underline underline-offset-2">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr('') }}
              placeholder="New password" autoFocus autoComplete="new-password" />
            <Input type="password" value={pw2} onChange={e => { setPw2(e.target.value); setErr('') }}
              placeholder="Confirm new password" autoComplete="new-password" />
            {err && <p className="text-xs text-red-500 flex items-center gap-1">✕ {err}</p>}
            <button disabled={busy} className="w-full py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {busy ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</> : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
