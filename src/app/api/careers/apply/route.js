import { createClient } from '@supabase/supabase-js'

// Sends the application to oricprint3d@gmail.com via Resend and, separately,
// saves it to Supabase as a backup record visible in the admin dashboard.
// Neither step is required for the other to succeed — if the applications
// table isn't set up yet, or Resend isn't configured yet, this still
// delivers whichever channel *is* available rather than failing outright.
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { roleId, roleTitle, name, email, phone, portfolioUrl, message } = body || {}

  if (!roleTitle || !String(name || '').trim() || !String(email || '').trim()) {
    return Response.json({ error: 'Name, email, and role are required.' }, { status: 400 })
  }

  const cleanName = String(name).trim()
  const cleanEmail = String(email).trim()
  const cleanPhone = String(phone || '').trim()
  const cleanPortfolio = String(portfolioUrl || '').trim()
  const cleanMessage = String(message || '').trim()

  // ── Save to Supabase (best effort) ──
  let savedToDb = false
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { error } = await supabase.from('job_applications').insert({
      role_id: roleId || null,
      role_title: roleTitle,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || null,
      portfolio_url: cleanPortfolio || null,
      message: cleanMessage || null,
    })
    savedToDb = !error
  }

  // ── Email via Resend (best effort) ──
  let emailSent = false
  if (process.env.RESEND_API_KEY) {
    const lines = [
      `New application: ${roleTitle}`,
      '',
      `Name: ${cleanName}`,
      `Email: ${cleanEmail}`,
      cleanPhone ? `Phone: ${cleanPhone}` : null,
      cleanPortfolio ? `Portfolio/Resume: ${cleanPortfolio}` : null,
      cleanMessage ? `\nWhy they're a fit:\n${cleanMessage}` : null,
    ].filter(Boolean)

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'ORIC Careers <onboarding@resend.dev>',
          to: 'oricprint3d@gmail.com',
          reply_to: cleanEmail,
          subject: `New Application — ${roleTitle}`,
          text: lines.join('\n'),
        }),
      })
      emailSent = res.ok
    } catch {
      emailSent = false
    }
  }

  if (!savedToDb && !emailSent) {
    return Response.json(
      { error: 'Could not send your application right now. Please try again shortly.' },
      { status: 502 }
    )
  }

  return Response.json({ ok: true, savedToDb, emailSent })
}
