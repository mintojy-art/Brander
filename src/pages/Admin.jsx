import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isConfigured, uploadImage, deleteImage } from '../lib/supabase'
import { products as STATIC_PRODUCTS } from '../data/products'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'oric@admin'
const CATEGORIES = ['Tools', 'Figurines', 'Cosplay', 'Accessories', 'Custom', 'Idols', 'Prototyping', 'Manufacturing', 'Toys']

// ── utils ─────────────────────────────────────────────────────────────────────
const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const parseLines = (s) => (s || '').split('\n').map(l => l.trim()).filter(Boolean)
const parseSpecs = (s) => {
  const o = {}
  ;(s || '').split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) o[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
  return o
}
const serializeLines = (a) => Array.isArray(a) ? a.join('\n') : ''
const serializeSpecs = (o) => o && typeof o === 'object' ? Object.entries(o).map(([k, v]) => `${k}: ${v}`).join('\n') : ''
const autoPrice = (price) => price ? `₹${parseInt(price).toLocaleString('en-IN')}` : 'Get Quote'

const toRow = (p, idx) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline || '',
  description: p.description || '',
  price: p.price || null,
  price_display: p.priceDisplay || autoPrice(p.price),
  category: p.category || 'Custom',
  image: p.image || null,
  images: p.images || (p.image ? [p.image] : []),
  badge: p.badge || null,
  href: p.href || `/shop/${p.id}`,
  material: p.material || '',
  lead: p.lead || '',
  rating: p.rating || null,
  reviews: p.reviews || null,
  highlights: p.highlights || [],
  specs: p.specs || {},
  pre_order: p.preOrder || false,
  active: true,
  sort_order: idx,
})

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = {
  plus:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  back:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  store:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  logout:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  upload:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  x:       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  xLg:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  star:    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  check:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  import:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  warn:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

// ── Toast System ──────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  return { toasts, toast: push }
}

function Toasts({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 340 }}>
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto animate-slideIn ${
          t.type === 'error' ? 'bg-red-600 text-white' :
          t.type === 'warn'  ? 'bg-amber-500 text-white' :
                               'bg-[#1D1D1F] text-white'
        }`}>
          {t.type === 'success' && <span className="shrink-0">{Ico.check}</span>}
          {t.type === 'error'   && <span className="shrink-0">✕</span>}
          {t.type === 'warn'    && <span className="shrink-0">⚠</span>}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Label = ({ children, hint }) => (
  <label className="block text-xs font-semibold text-[#202223] mb-1.5">
    {children}{hint && <span className="ml-1 font-normal text-[#6D7175]">{hint}</span>}
  </label>
)
const Input = ({ className = '', ...p }) => (
  <input className={`w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 transition-all text-[#202223] bg-white ${className}`} {...p} />
)
const Textarea = ({ className = '', ...p }) => (
  <textarea className={`w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 transition-all text-[#202223] bg-white resize-none ${className}`} {...p} />
)
const Select = ({ children, ...p }) => (
  <select className="w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] bg-white text-[#202223] cursor-pointer" {...p}>{children}</select>
)
const Toggle = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-[#202223]">{label}</span>
    <button type="button" onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-[#1D1D1F]' : 'bg-[#C9CCCF]'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
    </button>
  </div>
)
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-[#E1E3E5] rounded-xl p-5 ${className}`}>{children}</div>
)
const CardTitle = ({ children }) => <p className="text-sm font-bold text-[#202223] mb-4">{children}</p>

// ── Schema Error Banner ───────────────────────────────────────────────────────
function SchemaErrorBanner({ onDismiss }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(SCHEMA_FIX_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mx-6 mt-4 border border-red-200 bg-red-50 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <span className="text-red-500 shrink-0 mt-0.5">{Ico.warn}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-red-800">Database schema is incomplete</p>
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600 shrink-0">{Ico.xLg}</button>
          </div>
          <p className="text-xs text-red-700 mb-3">
            Your <code className="bg-red-100 px-1 rounded font-mono">products</code> table is missing columns (like <code className="bg-red-100 px-1 rounded font-mono">images</code>, <code className="bg-red-100 px-1 rounded font-mono">highlights</code>, <code className="bg-red-100 px-1 rounded font-mono">specs</code>).
            Run this SQL in <strong>Supabase → SQL Editor → New query</strong> to add them, then try saving again.
          </p>
          <div className="relative">
            <pre className="bg-[#1D1D1F] text-[#86868B] text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre max-h-48">{SCHEMA_FIX_SQL}</pre>
            <button onClick={copy}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold rounded transition-colors">
              {copied ? <>{Ico.check} Copied!</> : 'Copy SQL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
          {Ico.trash}
        </div>
        <h3 className="text-base font-bold text-[#202223] mb-2">Delete "{product.name}"?</h3>
        <p className="text-sm text-[#6D7175] mb-6">This will permanently remove the product from your shop. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#C9CCCF] rounded-lg text-sm font-medium text-[#202223] hover:bg-[#F6F6F7] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
            Delete product
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Discard Warning Modal ─────────────────────────────────────────────────────
function DiscardModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
          {Ico.warn}
        </div>
        <h3 className="text-base font-bold text-[#202223] mb-2">Discard changes?</h3>
        <p className="text-sm text-[#6D7175] mb-6">You have unsaved changes. If you leave now, your changes will be lost.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#C9CCCF] rounded-lg text-sm font-medium text-[#202223] hover:bg-[#F6F6F7] transition-colors">
            Keep editing
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#202223] text-white rounded-lg text-sm font-semibold hover:bg-[#424245] transition-colors">
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}

const BUCKET_SQL = `-- Run in Supabase → SQL Editor → New query
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "Allow upload" on storage.objects
  for insert to anon with check (bucket_id = 'product-images');
create policy "Allow delete" on storage.objects
  for delete to anon using (bucket_id = 'product-images');`

const SCHEMA_FIX_SQL = `-- Run in Supabase → SQL Editor → New query
-- Adds any missing columns to your products table
alter table products add column if not exists tagline text;
alter table products add column if not exists description text;
alter table products add column if not exists price integer;
alter table products add column if not exists price_display text;
alter table products add column if not exists category text default 'Custom';
alter table products add column if not exists image text;
alter table products add column if not exists images text[];
alter table products add column if not exists badge text;
alter table products add column if not exists href text;
alter table products add column if not exists material text;
alter table products add column if not exists lead text;
alter table products add column if not exists rating numeric(2,1);
alter table products add column if not exists reviews integer;
alter table products add column if not exists highlights text[];
alter table products add column if not exists specs jsonb;
alter table products add column if not exists pre_order boolean default false;
alter table products add column if not exists active boolean default true;
alter table products add column if not exists sort_order integer default 0;
alter table products add column if not exists created_at timestamptz default now();

-- Ensure RLS allows writes
alter table products enable row level security;
drop policy if exists "Allow all" on products;
create policy "Allow all" on products for all to anon
  using (true) with check (true);`

// ── Image Uploader ────────────────────────────────────────────────────────────
function ImageUploader({ images, onChange, toast }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [drag, setDrag] = useState(false)
  const [bucketMissing, setBucketMissing] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files?.length) return
    setUploading(true)
    setProgress(0)
    setBucketMissing(false)
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const urls = []
    for (let i = 0; i < fileArr.length; i++) {
      try {
        const url = await uploadImage(fileArr[i])
        urls.push(url)
        setProgress(Math.round(((i + 1) / fileArr.length) * 100))
      } catch (e) {
        if (e.message === 'BUCKET_MISSING') {
          setBucketMissing(true)
          toast?.('Storage bucket not set up yet — see instructions below', 'warn')
          setUploading(false)
          setProgress(0)
          return
        }
        toast?.('Upload failed: ' + e.message, 'error')
      }
    }
    if (urls.length) onChange([...images, ...urls])
    setUploading(false)
    setProgress(0)
  }

  const copySql = () => {
    navigator.clipboard.writeText(BUCKET_SQL)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 2000)
  }

  const handleRemove = async (idx) => {
    const url = images[idx]
    if (url?.includes('supabase')) {
      try { await deleteImage(url) } catch {}
    }
    onChange(images.filter((_, i) => i !== idx))
  }

  const makePrimary = (idx) => {
    const reordered = [...images]
    const [item] = reordered.splice(idx, 1)
    reordered.unshift(item)
    onChange(reordered)
  }

  return (
    <div>
      <div
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          drag ? 'border-[#1D1D1F] bg-[#F0F0F0]' : 'border-[#C9CCCF] hover:border-[#1D1D1F] hover:bg-[#F6F6F7]'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D7175]">Uploading… {progress}%</p>
            <div className="w-full max-w-[160px] h-1 bg-[#E1E3E5] rounded-full overflow-hidden">
              <div className="h-full bg-[#1D1D1F] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#6D7175]">
            {Ico.upload}
            <p className="text-sm font-medium text-[#202223] mt-1">Drop images here or click to upload</p>
            <p className="text-xs">JPG, PNG, WebP · Multiple files supported</p>
          </div>
        )}
      </div>

      {/* Bucket missing — show fix instructions inline */}
      {bucketMissing && (
        <div className="mt-4 border border-amber-200 bg-amber-50 rounded-xl overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <span className="text-amber-500 shrink-0 mt-0.5">{Ico.warn}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Storage bucket not created yet</p>
              <p className="text-xs text-amber-700 mt-1 mb-3">
                Go to <strong>Supabase → SQL Editor → New query</strong>, paste the SQL below, and click Run.
                Then try uploading again.
              </p>
              <div className="relative">
                <pre className="bg-[#1D1D1F] text-[#86868B] text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre">{BUCKET_SQL}</pre>
                <button onClick={copySql}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold rounded transition-colors">
                  {sqlCopied ? <>{Ico.check} Copied</> : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 bg-[#F6F6F7] transition-all"
              style={{ borderColor: idx === 0 ? '#1D1D1F' : '#E1E3E5' }}>
              <img src={url} alt="" className="w-full h-full object-cover" />

              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 bg-[#1D1D1F] text-white text-[9px] font-bold rounded-full">
                  {Ico.star} Primary
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 active:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                {idx !== 0 && (
                  <button onClick={() => makePrimary(idx)}
                    className="w-full py-1.5 bg-white text-[#202223] text-[10px] font-semibold rounded-lg hover:bg-[#F6F6F7] transition-colors">
                    Set primary
                  </button>
                )}
                <button onClick={() => handleRemove(idx)}
                  className="w-full py-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-lg hover:bg-red-600 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-[#C9CCCF] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#1D1D1F] hover:bg-[#F6F6F7] transition-all text-[#6D7175]"
          >
            {Ico.plus}
            <span className="text-xs">Add more</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [show, setShow] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { sessionStorage.setItem('oric_admin', '1'); onLogin() }
    else { setErr('Incorrect password'); setPw('') }
  }
  return (
    <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E1E3E5] w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-black text-xl">O</div>
          <h1 className="text-xl font-bold text-[#202223]">ORIC Admin</h1>
          <p className="text-sm text-[#6D7175] mt-1">Sign in to manage your shop</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Input type={show ? 'text' : 'password'} value={pw}
              onChange={e => { setPw(e.target.value); setErr('') }}
              placeholder="Password" autoFocus className="pr-10" />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D7175] hover:text-[#202223] text-xs font-medium">
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          {err && <p className="text-xs text-red-500 flex items-center gap-1">✕ {err}</p>}
          <button className="w-full py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Setup Guide ───────────────────────────────────────────────────────────────
function SetupGuide() {
  const [copied, setCopied] = useState(false)
  const sql = `-- 1. Products table
create table if not exists products (
  id text primary key, name text not null,
  tagline text, description text,
  price integer, price_display text,
  category text, image text, images text[],
  badge text, href text, material text, lead text,
  rating numeric(2,1), reviews integer,
  highlights text[], specs jsonb,
  pre_order boolean default false,
  active boolean default true, sort_order integer default 0,
  created_at timestamptz default now()
);
alter table products enable row level security;
drop policy if exists "Allow all" on products;
create policy "Allow all" on products for all to anon
  using (true) with check (true);

-- 2. Image storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "Allow upload" on storage.objects
  for insert to anon with check (bucket_id = 'product-images');
create policy "Allow delete" on storage.objects
  for delete to anon using (bucket_id = 'product-images');`

  const copy = () => {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-amber-500 shrink-0 mt-0.5">{Ico.warn}</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Database not connected</p>
            <p className="text-xs text-amber-700 mt-0.5">Add your Supabase env vars to Vercel, then run this SQL in Supabase → SQL Editor → New query.</p>
          </div>
        </div>
        <div className="bg-white border border-[#E1E3E5] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E1E3E5]">
            <p className="text-sm font-bold text-[#202223]">Supabase setup SQL</p>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-[#6D7175] hover:text-[#202223] transition-colors font-medium">
              {copied ? <>{Ico.check} Copied!</> : 'Copy SQL'}
            </button>
          </div>
          <pre className="bg-[#1D1D1F] text-[#86868B] text-xs p-5 overflow-x-auto leading-relaxed whitespace-pre">{sql}</pre>
        </div>
      </div>
    </div>
  )
}

// ── Product Form ──────────────────────────────────────────────────────────────
function ProductForm({ product, onSave, onBack, toast }) {
  const isNew = !product?.id || !!product?._new
  const topRef = useRef(null)

  const initForm = () => {
    if (!product || product._new) return {
      id: '', name: '', tagline: '', description: '',
      price: '', price_display: '', category: 'Custom',
      images: [], badge: '', material: '', lead: '',
      rating: '', reviews: '', highlights: '', specs: '',
      pre_order: false, active: true, sort_order: 0,
    }
    const imgs = (product.images || []).filter(Boolean)
    if (!imgs.length && product.image) imgs.push(product.image)
    return {
      ...product,
      price: product.price ?? '',
      price_display: product.price_display || autoPrice(product.price),
      images: imgs,
      highlights: serializeLines(product.highlights),
      specs: serializeSpecs(product.specs),
    }
  }

  const [form, setForm] = useState(initForm)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [schemaError, setSchemaError] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)

  const set = (k, v) => {
    setIsDirty(true)
    setForm(f => {
      const next = { ...f, [k]: v }
      // Auto-fill price_display when price changes (only if display is auto-generated or empty)
      if (k === 'price') {
        const isAutoDisplay = !f.price_display || f.price_display === autoPrice(f.price)
        if (isAutoDisplay) next.price_display = autoPrice(v)
      }
      return next
    })
  }

  const handleBack = () => {
    if (isDirty) setShowDiscard(true)
    else onBack()
  }

  const handleSave = async (stayOnPage = false) => {
    if (!form.name.trim()) {
      setErr('Product name is required.')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setSaving(true)
    setErr('')

    const id = isNew ? slugify(form.name) : form.id
    const imgs = form.images.filter(Boolean)
    const payload = {
      name: form.name.trim(),
      tagline: form.tagline?.trim() || '',
      description: form.description?.trim() || '',
      price: form.price !== '' && form.price !== null ? parseInt(form.price) : null,
      price_display: form.price_display?.trim() || autoPrice(form.price),
      category: form.category || 'Custom',
      image: imgs[0] || null,
      images: imgs,
      badge: form.badge?.trim() || null,
      href: `/shop/${id}`,
      material: form.material?.trim() || '',
      lead: form.lead?.trim() || '',
      rating: form.rating !== '' && form.rating !== null ? parseFloat(form.rating) : null,
      reviews: form.reviews !== '' && form.reviews !== null ? parseInt(form.reviews) : null,
      highlights: parseLines(form.highlights),
      specs: parseSpecs(form.specs),
      pre_order: !!form.pre_order,
      active: !!form.active,
      sort_order: parseInt(form.sort_order) || 0,
    }

    let error
    if (isNew) {
      const res = await supabase.from('products').insert({ id, ...payload })
      error = res.error
    } else {
      const res = await supabase.from('products').update(payload).eq('id', id)
      error = res.error
    }

    setSaving(false)
    if (error) {
      const msg = error.message || ''
      if (msg.includes('schema cache') || msg.includes('column')) {
        setSchemaError(true)
        setErr('')
      } else {
        setErr(msg)
      }
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      toast('Save failed — see instructions above', 'error')
      return
    }
    setSchemaError(false)

    toast(`"${form.name}" ${isNew ? 'created' : 'saved'} successfully`)
    setIsDirty(false)

    if (stayOnPage) {
      // If new product, update form.id so subsequent saves are updates not inserts
      if (isNew) setForm(f => ({ ...f, id }))
    } else {
      onSave()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F7]">
      {showDiscard && (
        <DiscardModal
          onConfirm={() => { setShowDiscard(false); onBack() }}
          onCancel={() => setShowDiscard(false)}
        />
      )}

      {/* Top bar */}
      <div ref={topRef} className="bg-white border-b border-[#E1E3E5] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={handleBack} className="flex items-center gap-1 text-sm text-[#6D7175] hover:text-[#202223] transition-colors shrink-0">
            {Ico.back} Products
          </button>
          <span className="text-[#C9CCCF]">/</span>
          <span className="text-sm font-semibold text-[#202223] truncate">
            {isNew ? 'Add product' : (form.name || 'Edit product')}
          </span>
          {isDirty && <span className="text-xs text-[#6D7175] bg-[#F6F6F7] px-2 py-0.5 rounded-full shrink-0">Unsaved</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button onClick={handleBack} className="px-4 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#202223] transition-colors hidden sm:block">
            Discard
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="px-4 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#202223] transition-colors disabled:opacity-40 hidden md:block">
            Save & continue
          </button>
          <button onClick={() => handleSave(false)} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-[#1D1D1F] text-white rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center gap-2">
            {saving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <>{Ico.check} Save</>
            )}
          </button>
        </div>
      </div>

      {schemaError && (
        <SchemaErrorBanner onDismiss={() => setSchemaError(false)} />
      )}
      {err && !schemaError && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <span className="shrink-0 mt-0.5 font-bold">✕</span>
          <span>{err}</span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-6xl mx-auto w-full">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          <Card>
            <CardTitle>Product details</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Batman Figurine" />
              </div>
              <div>
                <Label hint="(shown on product cards)">Tagline</Label>
                <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Collector-grade. Fan-approved." />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full product description — what makes it special, who it's for, and what they'll receive." />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Product images</CardTitle>
            <p className="text-xs text-[#6D7175] mb-3">
              First image is used in shop listings. Hover any image to set it as primary or remove it. Drag and drop or click to upload.
            </p>
            <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} toast={toast} />
          </Card>

          <Card>
            <CardTitle>About this item</CardTitle>
            <Label hint="— one bullet point per line">Key highlights</Label>
            <Textarea rows={6} value={form.highlights} onChange={e => set('highlights', e.target.value)}
              placeholder={"Fine 0.1mm layer height for maximum detail\nPre-sanded and primed finish\nStable display base included\nShips in protective foam packaging"} />
            <p className="text-xs text-[#6D7175] mt-2">Each line becomes one bullet point on the product page.</p>
          </Card>

          <Card>
            <CardTitle>Technical specifications</CardTitle>
            <Label hint="— format: Label: Value, one per line">Specs</Label>
            <Textarea rows={7} value={form.specs} onChange={e => set('specs', e.target.value)}
              placeholder={"Height: 18cm\nMaterial: PLA\nLayer Height: 0.1mm\nFinish: Sanded + primed\nLead Time: 5–7 business days"} />
            <p className="text-xs text-[#6D7175] mt-2">Shown in the specs table on the product detail page.</p>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          <Card>
            <CardTitle>Status</CardTitle>
            <div className="space-y-4">
              <Toggle value={form.active} onChange={v => set('active', v)} label="Active (visible in shop)" />
              <Toggle value={form.pre_order} onChange={v => set('pre_order', v)} label="Pre-Order" />
              <div>
                <Label hint="(lower number = shows first)">Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="0" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Pricing</CardTitle>
            <div className="space-y-3">
              <div>
                <Label hint="(leave blank for 'Get Quote')">Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="899" />
              </div>
              <div>
                <Label hint="(auto-filled from price)">Display text</Label>
                <Input value={form.price_display} onChange={e => set('price_display', e.target.value)} placeholder="₹899" />
                <p className="text-xs text-[#6D7175] mt-1">Override if you want custom text like "From ₹499".</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Organisation</CardTitle>
            <div className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label hint="(optional — shows as a pill badge)">Badge label</Label>
                <Input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="New / Popular / Pre-Order" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Shipping & material</CardTitle>
            <div className="space-y-3">
              <div>
                <Label>Material</Label>
                <Input value={form.material} onChange={e => set('material', e.target.value)} placeholder="PLA / PETG / TPU" />
              </div>
              <div>
                <Label>Lead time</Label>
                <Input value={form.lead} onChange={e => set('lead', e.target.value)} placeholder="5–7 business days" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Ratings</CardTitle>
            <div className="space-y-3">
              <div>
                <Label hint="(0–5, e.g. 4.8)">Rating</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.8" />
              </div>
              <div>
                <Label>Review count</Label>
                <Input type="number" value={form.reviews} onChange={e => set('reviews', e.target.value)} placeholder="28" />
              </div>
            </div>
          </Card>

          {/* Save shortcut at bottom of right column */}
          <div className="flex flex-col gap-2">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="w-full py-3 text-sm font-semibold bg-[#1D1D1F] text-white rounded-xl hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : <>{Ico.check} Save product</>}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="w-full py-2.5 text-sm font-medium border border-[#C9CCCF] rounded-xl hover:bg-[#F6F6F7] text-[#202223] transition-colors disabled:opacity-40">
              Save &amp; continue editing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Products List ─────────────────────────────────────────────────────────────
function ProductsList({ products, loading, onAdd, onEdit, onToggleActive, onRefresh, onSeed, seeding, toast }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const counts = {
    all: products.length,
    active: products.filter(p => p.active).length,
    hidden: products.filter(p => !p.active).length,
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    const matchTab = tab === 'all' || (tab === 'active' && p.active) || (tab === 'hidden' && !p.active)
    return matchQ && matchTab
  })

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id)
    if (error) { toast('Delete failed: ' + error.message, 'error'); }
    else { toast(`"${deleteTarget.name}" deleted`) }
    setDeleteTarget(null)
    onRefresh()
  }

  return (
    <div className="flex-1 flex flex-col">
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header — hidden on mobile (handled by top bar) */}
      <div className="hidden md:flex bg-white border-b border-[#E1E3E5] px-6 py-4 items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-[#202223]">Products</h1>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} title="Refresh" disabled={loading}
            className="p-2 border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#6D7175] disabled:opacity-40 transition-colors">
            <span className={loading ? 'animate-spin inline-block' : ''}>{Ico.refresh}</span>
          </button>
          <button onClick={onSeed} disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#202223] disabled:opacity-50 transition-colors">
            {Ico.import}
            <span className="hidden sm:inline">{seeding ? 'Importing…' : 'Import defaults'}</span>
          </button>
          <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
            {Ico.plus} <span>Add product</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Total', value: counts.all },
            { label: 'Active', value: counts.active, color: 'text-green-700' },
            { label: 'Hidden', value: counts.hidden, color: 'text-[#6D7175]' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E1E3E5] rounded-xl px-5 py-4">
              <p className="text-xs text-[#6D7175] font-medium mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color || 'text-[#202223]'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E1E3E5] rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="px-3 sm:px-4 py-3 border-b border-[#E1E3E5] flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D7175]">{Ico.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] bg-white text-[#202223]" />
            </div>
            <div className="flex border border-[#C9CCCF] rounded-lg overflow-hidden">
              {[['all', 'All'], ['active', 'Active'], ['hidden', 'Hidden']].map(([val, lbl]) => (
                <button key={val} onClick={() => setTab(val)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === val ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#6D7175] hover:bg-[#F6F6F7]'}`}>
                  {lbl} <span className="opacity-60">{counts[val] ?? counts.all}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#6D7175]">Loading products…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center px-8">
              {products.length === 0 ? (
                <>
                  <p className="text-2xl mb-3">📦</p>
                  <p className="text-base font-semibold text-[#202223] mb-1">No products yet</p>
                  <p className="text-sm text-[#6D7175] mb-5">Add your first product or import your default catalogue.</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button onClick={onSeed} disabled={seeding}
                      className="px-5 py-2.5 border border-[#C9CCCF] text-[#202223] text-sm font-semibold rounded-lg hover:bg-[#F6F6F7] transition-colors disabled:opacity-50">
                      {seeding ? 'Importing…' : 'Import default products'}
                    </button>
                    <button onClick={onAdd} className="px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
                      Add first product
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#6D7175]">No products match "{search}".</p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-[#F1F1F1]">
                {filtered.map(p => {
                  const imgs = (p.images || []).filter(Boolean)
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0">
                        {imgs[0]
                          ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🖨️</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#202223] truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#6D7175]">{p.price_display || (p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Get Quote')}</span>
                          <span className="text-[#C9CCCF]">·</span>
                          <button onClick={() => onToggleActive(p)} className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                            <span className={`text-xs ${p.active ? 'text-green-700' : 'text-[#6D7175]'}`}>{p.active ? 'Active' : 'Hidden'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => onEdit(p)}
                          className="p-2 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] active:bg-[#E1E3E5] transition-colors">
                          {Ico.edit}
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="p-2 rounded-lg text-[#6D7175] hover:bg-red-50 active:bg-red-50 hover:text-red-600 active:text-red-600 transition-colors">
                          {Ico.trash}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-[#F6F6F7] border-b border-[#E1E3E5]">
                      {['Product', 'Category', 'Price', 'Images', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F1F1]">
                    {filtered.map(p => {
                      const imgs = (p.images || []).filter(Boolean)
                      return (
                        <tr key={p.id} className="hover:bg-[#F9F9F9] transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0">
                                {imgs[0]
                                  ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                                  : <div className="w-full h-full flex items-center justify-center text-base">🖨️</div>
                                }
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#202223] truncate">{p.name}</p>
                                <p className="text-xs text-[#6D7175] truncate max-w-[200px]">{p.tagline || <span className="italic opacity-50">No tagline</span>}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2.5 py-1 bg-[#F1F1F1] text-[#6D7175] rounded-full font-medium whitespace-nowrap">{p.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-[#202223] whitespace-nowrap">
                              {p.price_display || (p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Get Quote')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {imgs.length === 0
                                ? <span className="text-xs text-[#C9CCCF]">None</span>
                                : <>
                                    {imgs.slice(0, 3).map((img, i) => (
                                      <div key={i} className="w-7 h-7 rounded-lg overflow-hidden border border-[#E1E3E5] bg-[#F6F6F7]">
                                        <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                                      </div>
                                    ))}
                                    {imgs.length > 3 && <span className="text-xs text-[#6D7175] ml-1">+{imgs.length - 3}</span>}
                                  </>
                              }
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => onToggleActive(p)} className="flex items-center gap-1.5 group/toggle">
                              <span className={`w-2 h-2 rounded-full transition-colors ${p.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                              <span className={`text-xs font-medium transition-colors ${p.active ? 'text-green-700 group-hover/toggle:text-green-900' : 'text-[#6D7175] group-hover/toggle:text-[#202223]'}`}>
                                {p.active ? 'Active' : 'Hidden'}
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => onEdit(p)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">
                                {Ico.edit} Edit
                              </button>
                              <button onClick={() => setDeleteTarget(p)}
                                className="p-1.5 rounded-lg text-[#6D7175] hover:bg-red-50 hover:text-red-600 transition-colors">
                                {Ico.trash}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('oric_admin') === '1')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [view, setView] = useState('list')   // 'list' | 'form'
  const [editProduct, setEditProduct] = useState(null)
  const { toasts, toast } = useToast()

  const fetchProducts = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true })
    if (error) toast('Failed to load products: ' + error.message, 'error')
    setProducts(data || [])
    setLoading(false)
  }, [toast])

  useEffect(() => { if (authed && isConfigured) fetchProducts() }, [authed, fetchProducts])

  const handleSeed = async () => {
    setSeeding(true)
    const rows = STATIC_PRODUCTS.map(toRow)
    const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' })
    if (error) toast('Import failed: ' + error.message, 'error')
    else toast(`${rows.length} products imported`)
    await fetchProducts()
    setSeeding(false)
  }

  const handleToggleActive = async (p) => {
    const { error } = await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    if (error) { toast('Update failed: ' + error.message, 'error'); return }
    toast(`"${p.name}" ${!p.active ? 'activated' : 'hidden'}`)
    fetchProducts()
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1D1D1F] font-black text-sm">O</div>
            <div>
              <p className="text-white text-sm font-bold leading-none">ORIC</p>
              <p className="text-white/40 text-[10px] mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <button
          onClick={() => { setEditProduct({ _new: true }); setView('form'); setMobileOpen(false) }}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm bg-white text-[#1D1D1F] font-bold hover:bg-white/90 transition-colors mb-3"
        >
          {Ico.plus} Add product
        </button>
        <button onClick={() => { setView('list'); setMobileOpen(false) }}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${view === 'list' ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <span className="flex items-center gap-2">📦 Products</span>
          {products.length > 0 && (
            <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full font-semibold">{products.length}</span>
          )}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          {Ico.store} View store ↗
        </a>
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={() => { sessionStorage.removeItem('oric_admin'); setAuthed(false) }}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          {Ico.logout} Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-[#F6F6F7]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Toasts toasts={toasts} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — fixed on desktop, slide-in drawer on mobile */}
      <div className={`w-56 bg-[#1D1D1F] flex flex-col fixed h-full z-40 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1D1D1F] sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#1D1D1F] font-black text-xs">O</div>
            <p className="text-white text-sm font-bold">ORIC Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditProduct({ _new: true }); setView('form') }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#1D1D1F] text-xs font-bold rounded-lg"
            >
              {Ico.plus} Add
            </button>
            <button onClick={() => setMobileOpen(true)} className="text-white p-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>

        {!isConfigured ? <SetupGuide /> :
         view === 'list' ? (
           <ProductsList
             products={products}
             loading={loading}
             seeding={seeding}
             toast={toast}
             onAdd={() => { setEditProduct({ _new: true }); setView('form') }}
             onEdit={p => { setEditProduct(p); setView('form') }}
             onToggleActive={handleToggleActive}
             onRefresh={fetchProducts}
             onSeed={handleSeed}
           />
         ) : (
           <ProductForm
             product={editProduct}
             toast={toast}
             onSave={() => { setView('list'); fetchProducts() }}
             onBack={() => setView('list')}
           />
         )
        }
      </div>
    </div>
  )
}
