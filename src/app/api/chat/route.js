import Anthropic from '@anthropic-ai/sdk'
import { supabase, isConfigured } from '@/lib/supabase'
import { buildSystemPrompt, WHATSAPP_LINK } from '@/lib/chatbot/knowledge'

// Website chat assistant. The browser sends the conversation so far; this
// route adds ORIC's knowledge (system prompt), asks Claude, and streams the
// reply back as plain text. The API key never leaves the server.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Haiku 5.5: Anthropic's smallest, fastest model — about ₹0.05 per answer.
const MODEL = 'claude-haiku-5-5'
const MAX_HISTORY = 16          // messages sent to the model per request
const MAX_TURNS = 30            // customer messages per conversation
const MAX_CHARS = 1200          // per customer message
const RATE = { windowMs: 10 * 60 * 1000, max: 25 } // per IP

const FALLBACK_REPLY = `Sorry, I can't help with that one here. Please message us on WhatsApp and the team will help: [Chat on WhatsApp](${WHATSAPP_LINK})`
const ERROR_REPLY = `Sorry, I'm having trouble right now. Please message us on WhatsApp instead: [Chat on WhatsApp](${WHATSAPP_LINK})`

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null

// Best-effort per-instance limiter: stops one visitor from running up the
// bill. (Serverless instances don't share memory, so it's not exact.)
const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > RATE.max
}

function validate(body) {
  const { messages, sessionId, page } = body || {}
  if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(sessionId)) return null
  if (!Array.isArray(messages) || messages.length === 0) return null
  const clean = []
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return null
    const content = m.content.trim().slice(0, m.role === 'user' ? MAX_CHARS : 4000)
    if (!content) return null
    clean.push({ role: m.role, content })
  }
  if (clean[clean.length - 1].role !== 'user') return null
  if (clean.filter((m) => m.role === 'user').length > MAX_TURNS) return 'too-long'
  // Keep the most recent messages, starting on a customer message.
  let recent = clean.slice(-MAX_HISTORY)
  while (recent.length && recent[0].role !== 'user') recent = recent.slice(1)
  const safePage = typeof page === 'string' && /^\/[\w\-/]*$/.test(page) ? page.slice(0, 200) : '/'
  return { messages: recent, sessionId, page: safePage }
}

async function logTurn(sessionId, page, userText, reply) {
  if (!isConfigured) return
  try {
    await supabase.from('chat_messages').insert([
      { session_id: sessionId, role: 'user', content: userText.slice(0, 4000), page },
      { session_id: sessionId, role: 'assistant', content: reply.slice(0, 8000), page },
    ])
  } catch {
    // Logging must never break the chat.
  }
}

export async function POST(request) {
  if (!client) return Response.json({ error: 'Chat is not configured' }, { status: 503 })

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    return new Response(`You're sending messages quickly — please wait a few minutes, or [chat on WhatsApp](${WHATSAPP_LINK}).`, {
      status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Bad request' }, { status: 400 }) }
  const input = validate(body)
  if (input === 'too-long') {
    return new Response(`This chat is getting long — please continue on WhatsApp so the team can help: [Chat on WhatsApp](${WHATSAPP_LINK})`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
  if (!input) return Response.json({ error: 'Bad request' }, { status: 400 })

  const system = await buildSystemPrompt()
  const userText = input.messages[input.messages.length - 1].content

  // The page the customer is on goes in as a separate block so their own
  // words stay untouched (and the logged text is exactly what they typed).
  const apiMessages = input.messages.map((m, i) =>
    i === input.messages.length - 1
      ? { role: 'user', content: [{ type: 'text', text: m.content }, { type: 'text', text: `(Customer is currently viewing the page: ${input.page})` }] }
      : m
  )

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let reply = ''
      const send = (t) => { reply += t; controller.enqueue(encoder.encode(t)) }
      try {
        const s = client.messages.stream({
          model: MODEL,
          max_tokens: 2048,
          output_config: { effort: 'low' },
          cache_control: { type: 'ephemeral' },
          system,
          messages: apiMessages,
        })
        for await (const event of s) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') send(event.delta.text)
        }
        const final = await s.finalMessage()
        if (final.stop_reason === 'refusal') {
          // A decline can arrive mid-reply; replace whatever was shown.
          if (reply) send('\n\n')
          send(FALLBACK_REPLY)
        } else if (!reply.trim()) {
          send(ERROR_REPLY)
        }
      } catch (err) {
        console.error('chat error', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err)
        send(reply ? `\n\n${ERROR_REPLY}` : ERROR_REPLY)
      }
      await logTurn(input.sessionId, input.page, userText, reply)
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
