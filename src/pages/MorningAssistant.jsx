import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'morning_assistant_v1'

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = {
  plus:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  check:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  edit:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  play:    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause:   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  reset:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>,
  sun:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  focus:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  list:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  timer:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6M12 2v3"/></svg>,
}

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "One task done well beats ten tasks started.",
  "Today's preparation determines tomorrow's achievement.",
  "Small steps every day lead to big results.",
  "Your morning sets the tone for the whole day.",
  "Clarity of mind brings clarity of action.",
  "Do the hard thing first.",
]

const pad = (n) => String(n).padStart(2, '0')

// ── Clock & Greeting ──────────────────────────────────────────────────────────
function ClockSection() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const h = now.getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const Icon = h >= 6 && h < 20 ? Ico.sun : Ico.moon
  const quote = QUOTES[now.getDate() % QUOTES.length]

  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = `${pad(h % 12 || 12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${h < 12 ? 'AM' : 'PM'}`

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 text-amber-400 mb-3">
        {Icon}
        <span className="text-sm font-semibold uppercase tracking-widest text-amber-400/80">{greeting}</span>
      </div>
      <div className="text-6xl font-black text-white tracking-tight mb-1 tabular-nums">{timeStr}</div>
      <div className="text-white/50 text-sm">{weekday}, {dateStr}</div>
      <p className="mt-4 text-white/30 text-xs italic max-w-xs mx-auto leading-relaxed">"{quote}"</p>
    </div>
  )
}

// ── Focus Card ────────────────────────────────────────────────────────────────
function FocusCard({ focus, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(focus)
  const inputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => {
    onSave(draft.trim())
    setEditing(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setDraft(focus); setEditing(false) }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400">{Ico.focus}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Today's Focus</span>
      </div>
      {editing ? (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={commit}
            placeholder="What's your main goal today?"
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm outline-none focus:border-amber-400/50 focus:bg-white/15 transition-all"
          />
        </div>
      ) : (
        <button
          onClick={() => { setDraft(focus); setEditing(true) }}
          className="w-full text-left group"
        >
          {focus ? (
            <div className="flex items-start justify-between gap-3">
              <p className="text-white font-semibold text-base leading-snug">{focus}</p>
              <span className="text-white/20 group-hover:text-white/50 shrink-0 mt-0.5 transition-colors">{Ico.edit}</span>
            </div>
          ) : (
            <p className="text-white/25 text-sm italic">Tap to set your main focus for today…</p>
          )}
        </button>
      )}
    </div>
  )
}

// ── Todo List ─────────────────────────────────────────────────────────────────
function TodoList({ todos, onAdd, onToggle, onDelete }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    onAdd(text)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleAdd() }

  const done = todos.filter(t => t.done).length
  const total = todos.length

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">{Ico.list}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Tasks</span>
        </div>
        {total > 0 && (
          <span className="text-xs text-white/30 font-medium">{done}/{total} done</span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      {/* Add input */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add a task…"
          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm outline-none focus:border-amber-400/50 focus:bg-white/15 transition-all"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl transition-colors font-semibold"
        >
          {Ico.plus}
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {todos.length === 0 && (
          <p className="text-white/20 text-sm text-center py-4 italic">No tasks yet — add one above</p>
        )}
        {todos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all ${
              todo.done ? 'bg-white/3 opacity-50' : 'bg-white/8 hover:bg-white/12'
            }`}
          >
            <button
              onClick={() => onToggle(todo.id)}
              className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                todo.done
                  ? 'bg-amber-400 border-amber-400 text-black'
                  : 'border-white/30 hover:border-amber-400/60'
              }`}
            >
              {todo.done && Ico.check}
            </button>
            <span className={`flex-1 text-sm leading-snug transition-all ${
              todo.done ? 'line-through text-white/30' : 'text-white/85'
            }`}>
              {todo.text}
            </span>
            <button
              onClick={() => onDelete(todo.id)}
              className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition-colors p-0.5 shrink-0"
            >
              {Ico.trash}
            </button>
          </div>
        ))}
      </div>

      {done > 0 && done === total && total > 0 && (
        <div className="mt-4 text-center text-amber-400 text-xs font-semibold tracking-wide animate-pulse">
          All done! Great work today.
        </div>
      )}
    </div>
  )
}

// ── Pomodoro Timer ────────────────────────────────────────────────────────────
const MODES = [
  { label: 'Focus', mins: 25, color: 'text-amber-400', ring: 'stroke-amber-400' },
  { label: 'Short Break', mins: 5, color: 'text-emerald-400', ring: 'stroke-emerald-400' },
  { label: 'Long Break', mins: 15, color: 'text-sky-400', ring: 'stroke-sky-400' },
]

function PomodoroTimer() {
  const [modeIdx, setModeIdx] = useState(0)
  const [secs, setSecs] = useState(MODES[0].mins * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const mode = MODES[modeIdx]
  const total = mode.mins * 60
  const pct = (secs / total) * 100

  const reset = useCallback((idx = modeIdx) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSecs(MODES[idx].mins * 60)
  }, [modeIdx])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (modeIdx === 0) setSessions(n => n + 1)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, modeIdx])

  const switchMode = (idx) => {
    setModeIdx(idx)
    reset(idx)
  }

  const r = 52
  const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400">{Ico.timer}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Focus Timer</span>
        {sessions > 0 && (
          <span className="ml-auto text-xs text-white/30">{sessions} session{sessions !== 1 ? 's' : ''} today</span>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1">
        {MODES.map((m, i) => (
          <button
            key={m.label}
            onClick={() => switchMode(i)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              modeIdx === i ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/60'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="132" height="132" className="rotate-[-90deg]">
            <circle cx="66" cy="66" r={r} strokeWidth="6" stroke="rgba(255,255,255,0.08)" fill="none" />
            <circle
              cx="66" cy="66" r={r}
              strokeWidth="6" fill="none"
              className={`${mode.ring} transition-all duration-1000`}
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black tabular-nums ${mode.color}`}>
              {pad(Math.floor(secs / 60))}:{pad(secs % 60)}
            </span>
            <span className="text-white/30 text-[10px] font-semibold mt-0.5">{mode.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="p-3 rounded-xl bg-white/8 hover:bg-white/15 text-white/50 hover:text-white transition-all"
          >
            {Ico.reset}
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              running
                ? 'bg-white/15 hover:bg-white/20 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-black'
            }`}
          >
            {running ? <>{Ico.pause} Pause</> : <>{Ico.play} Start</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Project Notes ─────────────────────────────────────────────────────────────
function ProjectNotes({ notes, onSave }) {
  const [draft, setDraft] = useState(notes)
  const timerRef = useRef(null)

  const handleChange = (val) => {
    setDraft(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSave(val), 800)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Project Notes</span>
        <span className="ml-auto text-[10px] text-white/20">auto-saved</span>
      </div>
      <textarea
        value={draft}
        onChange={e => handleChange(e.target.value)}
        placeholder="Jot down thoughts, blockers, or ideas for today's projects…"
        rows={5}
        className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm outline-none focus:border-amber-400/40 focus:bg-white/12 transition-all resize-none leading-relaxed"
      />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function MorningAssistant() {
  const [data, setData] = useState(() => {
    const d = load()
    const todayKey = new Date().toDateString()
    if (d.dateKey !== todayKey) {
      return {
        dateKey: todayKey,
        focus: '',
        todos: [],
        notes: d.notes || '',
      }
    }
    return d
  })

  const persist = (next) => {
    setData(next)
    save(next)
  }

  const setFocus = (focus) => persist({ ...data, focus })
  const setNotes = (notes) => persist({ ...data, notes })

  const addTodo = (text) => persist({
    ...data,
    todos: [...data.todos, { id: Date.now(), text, done: false }],
  })

  const toggleTodo = (id) => persist({
    ...data,
    todos: data.todos.map(t => t.id === id ? { ...t, done: !t.done } : t),
  })

  const deleteTodo = (id) => persist({
    ...data,
    todos: data.todos.filter(t => t.id !== id),
  })

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        <ClockSection />

        <div className="space-y-4">
          <FocusCard focus={data.focus} onSave={setFocus} />
          <TodoList
            todos={data.todos}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PomodoroTimer />
            <ProjectNotes notes={data.notes} onSave={setNotes} />
          </div>
        </div>

        <p className="text-center text-white/15 text-[10px] mt-8 tracking-wide">
          Data saved locally · Resets each morning
        </p>
      </div>
    </div>
  )
}
