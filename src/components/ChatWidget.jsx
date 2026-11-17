'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'

const WHATSAPP = 'https://wa.me/918310194953'
const STORE_KEY = 'oric-chat-v1'
const GREETING = "Hi! I'm ORIC, the studio's AI assistant 👋 Ask me about products, custom bobbleheads, prices, delivery or anything 3D printing."
const AVATAR = '/oriclogofav.svg'
const SUGGESTIONS = [
  'Gift ideas under ₹1000',
  'How much is a custom bobblehead?',
  'Christmas decor',
  'Delivery time & shipping cost',
]

function newSessionId() {
  try { return crypto.randomUUID() } catch { return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` }
}

// Only links the assistant is allowed to produce: site pages, WhatsApp,
// email, and ORIC's Instagram. Anything else renders as plain text.
function safeLink(href) {
  if (/^\/(?!\/)[\w\-/?=&#.%]*$/.test(href)) return { href, internal: true }
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com|(www\.)?oric3d\.com|(www\.)?instagram\.com)\//i.test(href)) return { href, internal: false }
  if (/^mailto:[^\s]+$/i.test(href)) return { href, internal: false }
  return null
}

// Tiny markdown subset: [text](url), **bold**, "- " bullets, line breaks.
function Rich({ text, onNavigate }) {
  const lines = text.split('\n')
  return lines.map((line, li) => {
    const bullet = /^\s*[-*•]\s+/.test(line)
    const body = bullet ? line.replace(/^\s*[-*•]\s+/, '') : line
    const parts = []
    const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g
    let last = 0, m, k = 0
    while ((m = re.exec(body))) {
      if (m.index > last) parts.push(body.slice(last, m.index))
      if (m[1]) {
        const link = safeLink(m[2])
        if (!link) parts.push(m[1])
        else if (link.internal) parts.push(<Link key={k++} href={link.href} onClick={onNavigate} className="font-semibold text-[#C94E00] underline underline-offset-2">{m[1]}</Link>)
        else parts.push(<a key={k++} href={link.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C94E00] underline underline-offset-2">{m[1]}</a>)
      } else {
        parts.push(<strong key={k++}>{m[3]}</strong>)
      }
      last = re.lastIndex
    }
    if (last < body.length) parts.push(body.slice(last))
    if (!body.trim()) return <div key={li} className="h-2" />
    return (
      <div key={li} className={bullet ? 'flex gap-2' : ''}>
        {bullet && <span className="text-[#F37121]">•</span>}
        <span>{parts}</span>
      </div>
    )
  })
}

export default function ChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const sessionRef = useRef(null)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Restore this tab's conversation (survives page navigation and refresh).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null')
      if (saved?.sessionId) {
        sessionRef.current = saved.sessionId
        setMessages(Array.isArray(saved.messages) ? saved.messages : [])
        return
      }
    } catch {}
    sessionRef.current = newSessionId()
  }, [])

  useEffect(() => {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ sessionId: sessionRef.current, messages })) } catch {}
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150) }, [open])

  const closeOnMobile = () => { if (window.innerWidth < 640) setOpen(false) }

  async function send(textArg) {
    const text = (textArg ?? input).trim()
    if (!text || busy) return
    setInput('')
    const history = [...messages, { role: 'user', content: text }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          page: pathname,
          messages: history.filter((m) => m.content),
        }),
      })
      if (!res.ok && res.status !== 429) throw new Error(String(res.status))
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let reply = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        reply += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: reply }])
      }
      if (!reply.trim()) throw new Error('empty')
    } catch {
      setMessages([...history, { role: 'assistant', content: `Sorry, I couldn't connect. Please message us on WhatsApp: [Chat on WhatsApp](${WHATSAPP})` }])
    } finally {
      setBusy(false)
    }
  }

  const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')?.content
  const waHref = `${WHATSAPP}?text=${encodeURIComponent(lastQuestion ? `Hi ORIC! ${lastQuestion}` : 'Hi ORIC!')}`

  return (
    <>
      <AnimatePresence>
        {!open && (
          // Wrapper holds the position: .y2k-accent-surface sets position:relative,
          // which would override `fixed` on the button itself.
          <motion.div
            className="fixed bottom-5 right-5 z-40"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="y2k-accent-surface flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full text-white text-sm font-semibold shadow-xl"
              aria-label="Chat with ORIC"
            >
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center -ml-1"><img src={AVATAR} alt="" className="w-5 h-5" /></span>
              Ask ORIC
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with ORIC"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 inset-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[380px] sm:h-[600px] sm:max-h-[calc(100vh-40px)] bg-white sm:rounded-3xl shadow-2xl border border-[#D2D2D7] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="y2k-dark-surface flex items-center justify-between px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <Avatar size="w-9 h-9" />
                <div>
                  <p className="text-sm font-bold">ORIC</p>
                  <p className="whitespace-nowrap text-[11px] text-white/60 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />AI assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[#25D366] text-white">
                  WhatsApp us
                </a>
                <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/10" aria-label="Close chat">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F5F5F7]">
              <Bubble role="assistant"><Rich text={GREETING} /></Bubble>
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#D2D2D7] bg-white text-[#1D1D1F] hover:border-[#F37121]">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role}>
                  {m.content
                    ? (m.role === 'assistant' ? <Rich text={m.content} onNavigate={closeOnMobile} /> : m.content)
                    : <span className="inline-flex gap-1 py-1"><Dot /><Dot d={0.15} /><Dot d={0.3} /></span>}
                </Bubble>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); send() }} className="border-t border-[#E5E5EA] p-3 bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 1200))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  rows={1}
                  placeholder="Type your question…"
                  className="flex-1 resize-none max-h-28 px-4 py-2.5 text-[16px] sm:text-sm rounded-2xl border border-[#D2D2D7] focus:outline-none focus:border-[#F37121]"
                />
                <button type="submit" disabled={busy || !input.trim()}
                  className="y2k-accent-surface p-3 rounded-full text-white disabled:opacity-40" aria-label="Send">
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-[#86868B] mt-2 text-center">AI assistant — can make mistakes. Chats are saved so our team can follow up.</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Avatar({ size = 'w-7 h-7' }) {
  return (
    <span className={`${size} shrink-0 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center overflow-hidden`}>
      <img src={AVATAR} alt="ORIC" className="w-[70%] h-[70%] object-contain" />
    </span>
  )
}

function Bubble({ role, children }) {
  const mine = role === 'user'
  return (
    <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
      {!mine && <Avatar />}
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
        mine ? 'bg-[#1D1D1F] text-white rounded-br-md' : 'bg-white text-[#1D1D1F] border border-[#E5E5EA] rounded-bl-md'
      }`}>
        {children}
      </div>
    </div>
  )
}

function Dot({ d = 0 }) {
  return (
    <motion.span className="w-1.5 h-1.5 rounded-full bg-[#86868B] inline-block"
      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d }} />
  )
}
