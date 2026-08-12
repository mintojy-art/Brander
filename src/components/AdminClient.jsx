'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { supabase, isConfigured, uploadImage, deleteImage, uploadVideo, deleteVideo, uploadOccasionImage, deleteOccasionImage, uploadBlogImage, deleteBlogImage } from '@/lib/supabase'
import { products as STATIC_PRODUCTS } from '@/data/products'
import { getCroppedImg } from '@/utils/cropImage'
import { BLOG_CATEGORIES } from '@/data/blogCategories'
import BlogEditor from '@/components/BlogEditor'

const CATEGORIES = ['Tools', 'Figurines', 'Bobbleheads', 'Cosplay', 'Accessories', 'Custom', 'Idols', 'Prototyping', 'Manufacturing', 'Toys']

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
  eye:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.3 20.3 0 015.06-6.06M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a20.29 20.29 0 01-3.22 4.44M14.12 14.12a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
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
function DeleteModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
          {Ico.trash}
        </div>
        <h3 className="text-base font-bold text-[#202223] mb-2">{title}</h3>
        <p className="text-sm text-[#6D7175] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#C9CCCF] rounded-lg text-sm font-medium text-[#202223] hover:bg-[#F6F6F7] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
            {confirmLabel}
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
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "Allow delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');`

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
drop policy if exists "Public read products" on products;
drop policy if exists "Admin write products" on products;
create policy "Public read products" on products
  for select using (true);
create policy "Admin write products" on products
  for all to authenticated using (true) with check (true);`

// ── Image Crop Modal ──────────────────────────────────────────────────────────
const RESIZE_OPTIONS = [
  { label: 'Resize to 1600px', value: 1600 },
  { label: 'Resize to 1200px', value: 1200 },
  { label: 'Resize to 800px', value: 800 },
  { label: 'Original size', value: 'original' },
]

function ImageCropModal({ queue, onFinish, onCancel, toast }) {
  const [index, setIndex] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [naturalAspect, setNaturalAspect] = useState(1)
  const [aspectMode, setAspectMode] = useState('square') // 'square' | 'original'
  const [maxSize, setMaxSize] = useState(1600)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processing, setProcessing] = useState(false)
  const resultsRef = useRef([])

  const current = queue[index]

  useEffect(() => {
    if (!current) return
    const url = URL.createObjectURL(current)
    setPreviewUrl(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setAspectMode('square')
    setCroppedAreaPixels(null)
    return () => URL.revokeObjectURL(url)
  }, [current])

  if (!current) return null

  const aspect = aspectMode === 'original' ? naturalAspect : 1

  const advance = (fileToUse) => {
    resultsRef.current = [...resultsRef.current, fileToUse]
    if (index + 1 >= queue.length) onFinish(resultsRef.current)
    else setIndex(i => i + 1)
  }

  const handleSkip = () => advance(current)

  const handleSkipAll = () => {
    onFinish([...resultsRef.current, ...queue.slice(index)])
  }

  const handleApply = async () => {
    if (!croppedAreaPixels) { handleSkip(); return }
    setProcessing(true)
    try {
      const blob = await getCroppedImg(previewUrl, croppedAreaPixels, maxSize === 'original' ? null : maxSize)
      const name = current.name.replace(/\.[^.]+$/, '') + '.jpg'
      advance(new File([blob], name, { type: 'image/jpeg' }))
    } catch (e) {
      toast?.('Crop failed — using original image', 'error')
      advance(current)
    }
    setProcessing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1E3E5]">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#202223]">Crop image {index + 1} of {queue.length}</p>
            <p className="text-xs text-[#6D7175] truncate max-w-[280px]">{current.name}</p>
          </div>
          <button onClick={onCancel} className="text-[#6D7175] hover:text-[#202223] shrink-0">{Ico.xLg}</button>
        </div>

        {previewUrl && (
          <div className="relative bg-[#111] h-[340px] sm:h-[420px]">
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape="rect"
              showGrid
              onMediaLoaded={({ width, height }) => setNaturalAspect(width / height)}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
            />
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex border border-[#C9CCCF] rounded-lg overflow-hidden shrink-0">
              {[['Square', 'square'], ['Original ratio', 'original']].map(([lbl, val]) => (
                <button key={lbl} onClick={() => setAspectMode(val)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${aspectMode === val ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#6D7175] hover:bg-[#F6F6F7]'}`}>
                  {lbl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
              <span className="text-xs text-[#6D7175] shrink-0">Zoom</span>
              <input type="range" min={1} max={3} step={0.05} value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full accent-[#1D1D1F]" />
            </div>

            <div className="w-44 shrink-0">
              <Select value={maxSize} onChange={e => setMaxSize(e.target.value === 'original' ? 'original' : Number(e.target.value))}>
                {RESIZE_OPTIONS.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button onClick={handleSkipAll} className="text-xs font-medium text-[#6D7175] hover:text-[#202223] transition-colors">
              Skip remaining — use originals
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleSkip} disabled={processing}
                className="px-4 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#202223] transition-colors disabled:opacity-40">
                Use original
              </button>
              <button onClick={handleApply} disabled={processing}
                className="px-4 py-2 text-sm font-semibold bg-[#1D1D1F] text-white rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center gap-2">
                {processing ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                ) : index + 1 < queue.length ? 'Apply & Next' : 'Apply & Finish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Image Uploader ────────────────────────────────────────────────────────────
function ImageUploader({ images, onChange, toast, uploadFn = uploadImage, deleteFn = deleteImage, bucketSql = BUCKET_SQL }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [drag, setDrag] = useState(false)
  const [bucketMissing, setBucketMissing] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)
  const [cropQueue, setCropQueue] = useState(null)
  const inputRef = useRef(null)

  const uploadFiles = async (fileArr) => {
    if (!fileArr?.length) return
    setUploading(true)
    setProgress(0)
    setBucketMissing(false)
    const urls = []
    for (let i = 0; i < fileArr.length; i++) {
      try {
        const url = await uploadFn(fileArr[i])
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

  const handleFiles = (files) => {
    const fileArr = Array.from(files || []).filter(f => f.type.startsWith('image/'))
    if (fileArr.length) setCropQueue(fileArr)
  }

  const copySql = () => {
    navigator.clipboard.writeText(bucketSql)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 2000)
  }

  const handleRemove = async (idx) => {
    const url = images[idx]
    if (url?.includes('supabase')) {
      try { await deleteFn(url) } catch {}
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
            <p className="text-xs">JPG, PNG, WebP · Multiple files supported · Crop &amp; resize before upload</p>
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
                <pre className="bg-[#1D1D1F] text-[#86868B] text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre">{bucketSql}</pre>
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

      {cropQueue && (
        <ImageCropModal
          queue={cropQueue}
          toast={toast}
          onCancel={() => setCropQueue(null)}
          onFinish={(files) => { setCropQueue(null); uploadFiles(files) }}
        />
      )}
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'reset' | 'reset-sent'
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)

  const getLock = () => {
    try { return JSON.parse(localStorage.getItem('oric_login') || '{"n":0,"t":0}') }
    catch { return { n: 0, t: 0 } }
  }
  const [lock, setLock] = useState(getLock)
  const locked = lock.t > Date.now()
  const [secs, setSecs] = useState(() => Math.max(0, Math.ceil((lock.t - Date.now()) / 1000)))

  useEffect(() => {
    if (!locked) return
    setSecs(Math.max(0, Math.ceil((lock.t - Date.now()) / 1000)))
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((lock.t - Date.now()) / 1000))
      setSecs(s)
      if (s === 0) { setLock({ n: 0, t: 0 }); localStorage.removeItem('oric_login'); clearInterval(id) }
    }, 1000)
    return () => clearInterval(id)
  }, [lock.t, locked])

  const submit = async (e) => {
    e.preventDefault()
    if (locked || busy || !supabase) return
    setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw })
    setBusy(false)
    if (error) {
      const prev = getLock()
      const n = prev.n + 1
      const t = n >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
      const next = { n, t }
      localStorage.setItem('oric_login', JSON.stringify(next))
      setLock(next)
      if (t) setErr('Too many failed attempts. Locked for 15 minutes.')
      else setErr(`Wrong credentials — ${MAX_LOGIN_ATTEMPTS - n} attempt${MAX_LOGIN_ATTEMPTS - n !== 1 ? 's' : ''} left.`)
      setPw('')
    } else {
      localStorage.removeItem('oric_login')
      onLogin()
    }
  }

  const submitReset = async (e) => {
    e.preventDefault()
    if (resetBusy || !supabase || !email.trim()) return
    setResetBusy(true); setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })
    setResetBusy(false)
    if (error) setErr(error.message)
    else setMode('reset-sent')
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E1E3E5] w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-black text-xl">O</div>
          <h1 className="text-xl font-bold text-[#202223]">ORIC Admin</h1>
          <p className="text-sm text-[#6D7175] mt-1">
            {mode === 'login' ? 'Sign in to manage your shop' : 'Reset your password'}
          </p>
        </div>
        {locked ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm font-semibold text-red-600">Account temporarily locked</p>
            <p className="text-sm text-[#6D7175]">
              Try again in {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
            </p>
          </div>
        ) : mode === 'reset-sent' ? (
          <div className="text-center py-2 space-y-4">
            <p className="text-sm text-[#202223]">
              If an account exists for <span className="font-semibold">{email.trim()}</span>, we've sent a password reset link — check your inbox.
            </p>
            <button
              onClick={() => { setMode('login'); setErr('') }}
              className="text-sm font-semibold text-[#1D1D1F] hover:underline underline-offset-2"
            >
              ← Back to sign in
            </button>
          </div>
        ) : mode === 'reset' ? (
          <form onSubmit={submitReset} className="space-y-3">
            <Input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }}
              placeholder="Admin email" autoFocus autoComplete="email" />
            {err && <p className="text-xs text-red-500 flex items-center gap-1">✕ {err}</p>}
            <button disabled={resetBusy} className="w-full py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {resetBusy ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</> : 'Send reset link'}
            </button>
            <button
              type="button"
              disabled={resetBusy}
              onClick={() => { setMode('login'); setErr('') }}
              className="w-full text-center text-sm font-medium text-[#6D7175] hover:text-[#202223] transition-colors disabled:opacity-40"
            >
              ← Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }}
              placeholder="Admin email" autoFocus autoComplete="email" />
            <div className="relative">
              <Input type={show ? 'text' : 'password'} value={pw}
                onChange={e => { setPw(e.target.value); setErr('') }}
                placeholder="Password" className="pr-10" autoComplete="current-password" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D7175] hover:text-[#202223] text-xs font-medium">
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            {err && <p className="text-xs text-red-500 flex items-center gap-1">✕ {err}</p>}
            <button disabled={busy} className="w-full py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {busy ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('reset'); setErr(''); setPw('') }}
              className="w-full text-center text-sm font-medium text-[#6D7175] hover:text-[#202223] transition-colors"
            >
              Forgot password?
            </button>
          </form>
        )}
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
drop policy if exists "Public read products" on products;
drop policy if exists "Admin write products" on products;
create policy "Public read products" on products
  for select using (true);
create policy "Admin write products" on products
  for all to authenticated using (true) with check (true);

-- 2. Image storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "Allow upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "Allow delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');`

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
          title={`Delete "${deleteTarget.name}"?`}
          message="This will permanently remove the product from your shop. This action cannot be undone."
          confirmLabel="Delete product"
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
                        <button onClick={() => onToggleActive(p)} title={p.active ? 'Hide from shop' : 'Unhide'}
                          className="p-2 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] active:bg-[#E1E3E5] transition-colors">
                          {p.active ? Ico.eyeOff : Ico.eye}
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
                              <button onClick={() => onToggleActive(p)} title={p.active ? 'Hide from shop' : 'Unhide'}
                                className="p-1.5 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">
                                {p.active ? Ico.eyeOff : Ico.eye}
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

// ── Testimonials: setup SQL ──────────────────────────────────────────────────
const TESTIMONIAL_SETUP_SQL = `-- Run in Supabase → SQL Editor → New query
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text,
  detail text,
  rating numeric(2,1) default 5,
  video_url text,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table testimonials enable row level security;
drop policy if exists "Public read testimonials" on testimonials;
drop policy if exists "Admin write testimonials" on testimonials;
create policy "Public read testimonials" on testimonials
  for select using (true);
create policy "Admin write testimonials" on testimonials
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('testimonial-media', 'testimonial-media', true)
on conflict (id) do nothing;

create policy "Public read testimonial media" on storage.objects
  for select using (bucket_id = 'testimonial-media');
create policy "Allow upload testimonial media" on storage.objects
  for insert to authenticated with check (bucket_id = 'testimonial-media');
create policy "Allow delete testimonial media" on storage.objects
  for delete to authenticated using (bucket_id = 'testimonial-media');`

function TestimonialSetupBanner({ onDismiss }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(TESTIMONIAL_SETUP_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mx-6 mt-4 border border-red-200 bg-red-50 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <span className="text-red-500 shrink-0 mt-0.5">{Ico.warn}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-red-800">Testimonials table not set up yet</p>
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600 shrink-0">{Ico.xLg}</button>
          </div>
          <p className="text-xs text-red-700 mb-3">
            Run this SQL in <strong>Supabase → SQL Editor → New query</strong> to create the <code className="bg-red-100 px-1 rounded font-mono">testimonials</code> table and storage bucket, then try saving again.
          </p>
          <div className="relative">
            <pre className="bg-[#1D1D1F] text-[#86868B] text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre max-h-48">{TESTIMONIAL_SETUP_SQL}</pre>
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

// ── Video Uploader ────────────────────────────────────────────────────────────
function VideoUploader({ videoUrl, onChange, toast }) {
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [bucketMissing, setBucketMissing] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (files) => {
    const file = files?.[0]
    if (!file || !file.type.startsWith('video/')) return
    setUploading(true)
    setBucketMissing(false)
    try {
      const url = await uploadVideo(file)
      onChange(url)
    } catch (e) {
      if (e.message === 'BUCKET_MISSING') {
        setBucketMissing(true)
        toast?.('Storage bucket not set up yet — see instructions below', 'warn')
      } else if (e.message === 'VIDEO_TOO_LARGE') {
        toast?.('Video is too large — max 50MB', 'error')
      } else {
        toast?.('Upload failed: ' + e.message, 'error')
      }
    }
    setUploading(false)
  }

  const copySql = () => {
    navigator.clipboard.writeText(TESTIMONIAL_SETUP_SQL)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 2000)
  }

  const handleRemove = async () => {
    if (videoUrl?.includes('supabase')) {
      try { await deleteVideo(videoUrl) } catch {}
    }
    onChange(null)
  }

  if (videoUrl) {
    return (
      <div>
        <div className="rounded-xl overflow-hidden border border-[#E1E3E5] bg-black">
          <video src={videoUrl} controls className="w-full max-h-64" />
        </div>
        <button onClick={handleRemove} className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
          Remove video
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files) }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          drag ? 'border-[#1D1D1F] bg-[#F0F0F0]' : 'border-[#C9CCCF] hover:border-[#1D1D1F] hover:bg-[#F6F6F7]'
        }`}
      >
        <input ref={inputRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => handleFile(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D7175]">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#6D7175]">
            {Ico.upload}
            <p className="text-sm font-medium text-[#202223] mt-1">Drop a video here or click to upload</p>
            <p className="text-xs">MP4, MOV, WebM · Max 50MB · Optional</p>
          </div>
        )}
      </div>

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
                <pre className="bg-[#1D1D1F] text-[#86868B] text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre">{TESTIMONIAL_SETUP_SQL}</pre>
                <button onClick={copySql}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold rounded transition-colors">
                  {sqlCopied ? <>{Ico.check} Copied</> : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Testimonial Form ──────────────────────────────────────────────────────────
function TestimonialForm({ testimonial, onSave, onBack, toast }) {
  const isNew = !testimonial?.id || !!testimonial?._new
  const topRef = useRef(null)

  const initForm = () => {
    if (!testimonial || testimonial._new) return {
      name: '', quote: '', detail: '', rating: '5', video_url: null,
      active: true, sort_order: 0,
    }
    return { ...testimonial, rating: testimonial.rating ?? '5' }
  }

  const [form, setForm] = useState(initForm)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [schemaError, setSchemaError] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)

  const set = (k, v) => { setIsDirty(true); setForm(f => ({ ...f, [k]: v })) }

  const handleBack = () => {
    if (isDirty) setShowDiscard(true)
    else onBack()
  }

  const handleSave = async (stayOnPage = false) => {
    if (!form.name.trim()) {
      setErr('Customer name is required.')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setSaving(true)
    setErr('')

    const payload = {
      name: form.name.trim(),
      quote: form.quote?.trim() || '',
      detail: form.detail?.trim() || '',
      rating: form.rating !== '' && form.rating !== null ? parseFloat(form.rating) : 5,
      video_url: form.video_url || null,
      active: !!form.active,
      sort_order: parseInt(form.sort_order) || 0,
    }

    let error, data
    if (isNew) {
      const res = await supabase.from('testimonials').insert(payload).select().single()
      error = res.error; data = res.data
    } else {
      const res = await supabase.from('testimonials').update(payload).eq('id', form.id)
      error = res.error
    }

    setSaving(false)
    if (error) {
      const msg = error.message || ''
      if (msg.includes('schema cache') || msg.includes('column') || msg.includes('does not exist') || msg.includes('relation')) {
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

    toast(`Testimonial from "${form.name}" ${isNew ? 'created' : 'saved'} successfully`)
    setIsDirty(false)

    if (stayOnPage) {
      if (isNew && data) setForm(f => ({ ...f, id: data.id }))
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

      <div ref={topRef} className="bg-white border-b border-[#E1E3E5] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={handleBack} className="flex items-center gap-1 text-sm text-[#6D7175] hover:text-[#202223] transition-colors shrink-0">
            {Ico.back} Testimonials
          </button>
          <span className="text-[#C9CCCF]">/</span>
          <span className="text-sm font-semibold text-[#202223] truncate">
            {isNew ? 'Add testimonial' : (form.name || 'Edit testimonial')}
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
        <TestimonialSetupBanner onDismiss={() => setSchemaError(false)} />
      )}
      {err && !schemaError && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <span className="shrink-0 mt-0.5 font-bold">✕</span>
          <span>{err}</span>
        </div>
      )}

      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-6xl mx-auto w-full">

        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardTitle>Customer details</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Customer name <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Priya Sharma" />
              </div>
              <div>
                <Label hint="(the quote shown on the site)">Testimonial text</Label>
                <Textarea rows={5} value={form.quote} onChange={e => set('quote', e.target.value)} placeholder="What did they say about their order?" />
              </div>
              <div>
                <Label hint='(e.g. "Ordered: Custom Figurine")'>Detail line</Label>
                <Input value={form.detail} onChange={e => set('detail', e.target.value)} placeholder="Ordered: Custom Figurine" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Video testimonial</CardTitle>
            <p className="text-xs text-[#6D7175] mb-3">
              Optional — a short video of the customer talking about their order.
            </p>
            <VideoUploader videoUrl={form.video_url} onChange={url => set('video_url', url)} toast={toast} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>Status</CardTitle>
            <div className="space-y-4">
              <Toggle value={form.active} onChange={v => set('active', v)} label="Active (visible on site)" />
              <div>
                <Label hint="(lower number = shows first)">Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="0" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Rating</CardTitle>
            <Label hint="(0–5, e.g. 5)">Star rating</Label>
            <Input type="number" step="0.5" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="5" />
          </Card>

          <div className="flex flex-col gap-2">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="w-full py-3 text-sm font-semibold bg-[#1D1D1F] text-white rounded-xl hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : <>{Ico.check} Save testimonial</>}
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

// ── Testimonials List ─────────────────────────────────────────────────────────
function TestimonialsList({ testimonials, loading, onAdd, onEdit, onToggleActive, onRefresh, toast }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const counts = {
    all: testimonials.length,
    active: testimonials.filter(t => t.active).length,
    hidden: testimonials.filter(t => !t.active).length,
  }

  const filtered = testimonials.filter(t => {
    const q = search.toLowerCase()
    const matchQ = !q || t.name.toLowerCase().includes(q) || (t.quote || '').toLowerCase().includes(q)
    const matchTab = tab === 'all' || (tab === 'active' && t.active) || (tab === 'hidden' && !t.active)
    return matchQ && matchTab
  })

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    if (deleteTarget.video_url) { try { await deleteVideo(deleteTarget.video_url) } catch {} }
    const { error } = await supabase.from('testimonials').delete().eq('id', deleteTarget.id)
    if (error) { toast('Delete failed: ' + error.message, 'error') }
    else { toast(`Testimonial from "${deleteTarget.name}" deleted`) }
    setDeleteTarget(null)
    onRefresh()
  }

  return (
    <div className="flex-1 flex flex-col">
      {deleteTarget && (
        <DeleteModal
          title={`Delete testimonial from "${deleteTarget.name}"?`}
          message="This will permanently remove this testimonial from your site. This action cannot be undone."
          confirmLabel="Delete testimonial"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header — hidden on mobile (handled by top bar) */}
      <div className="hidden md:flex bg-white border-b border-[#E1E3E5] px-6 py-4 items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-[#202223]">Testimonials</h1>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} title="Refresh" disabled={loading}
            className="p-2 border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#6D7175] disabled:opacity-40 transition-colors">
            <span className={loading ? 'animate-spin inline-block' : ''}>{Ico.refresh}</span>
          </button>
          <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
            {Ico.plus} <span>Add testimonial</span>
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
          <div className="px-3 sm:px-4 py-3 border-b border-[#E1E3E5] flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D7175]">{Ico.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search testimonials…"
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
              <p className="text-sm text-[#6D7175]">Loading testimonials…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center px-8">
              {testimonials.length === 0 ? (
                <>
                  <p className="text-2xl mb-3">💬</p>
                  <p className="text-base font-semibold text-[#202223] mb-1">No testimonials yet</p>
                  <p className="text-sm text-[#6D7175] mb-5">Add your first customer testimonial to show it on the homepage.</p>
                  <button onClick={onAdd} className="px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
                    Add first testimonial
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#6D7175]">No testimonials match "{search}".</p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-[#F1F1F1]">
                {filtered.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0 flex items-center justify-center text-lg">
                      {t.video_url ? '🎬' : '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#202223] truncate">{t.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#6D7175] truncate max-w-[140px]">{t.quote || <span className="italic opacity-50">No quote</span>}</span>
                        <span className="text-[#C9CCCF]">·</span>
                        <button onClick={() => onToggleActive(t)} className="flex items-center gap-1 shrink-0">
                          <span className={`w-1.5 h-1.5 rounded-full ${t.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                          <span className={`text-xs ${t.active ? 'text-green-700' : 'text-[#6D7175]'}`}>{t.active ? 'Active' : 'Hidden'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => onEdit(t)}
                        className="p-2 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] active:bg-[#E1E3E5] transition-colors">
                        {Ico.edit}
                      </button>
                      <button onClick={() => onToggleActive(t)} title={t.active ? 'Hide from site' : 'Unhide'}
                        className="p-2 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] active:bg-[#E1E3E5] transition-colors">
                        {t.active ? Ico.eyeOff : Ico.eye}
                      </button>
                      <button onClick={() => setDeleteTarget(t)}
                        className="p-2 rounded-lg text-[#6D7175] hover:bg-red-50 active:bg-red-50 hover:text-red-600 active:text-red-600 transition-colors">
                        {Ico.trash}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-[#F6F6F7] border-b border-[#E1E3E5]">
                      {['Customer', 'Quote', 'Video', 'Rating', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F1F1]">
                    {filtered.map(t => (
                      <tr key={t.id} className="hover:bg-[#F9F9F9] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#202223] truncate">{t.name}</p>
                            <p className="text-xs text-[#6D7175] truncate max-w-[200px]">{t.detail || <span className="italic opacity-50">No detail</span>}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#6D7175] truncate max-w-[240px]">{t.quote || <span className="italic opacity-50">No quote</span>}</p>
                        </td>
                        <td className="px-4 py-3">
                          {t.video_url
                            ? <span className="text-xs px-2 py-1 bg-[#F1F1F1] text-[#202223] rounded-full font-medium">🎬 Yes</span>
                            : <span className="text-xs text-[#C9CCCF]">None</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#202223] whitespace-nowrap">{t.rating ?? '—'} {Ico.star}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => onToggleActive(t)} className="flex items-center gap-1.5 group/toggle">
                            <span className={`w-2 h-2 rounded-full transition-colors ${t.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                            <span className={`text-xs font-medium transition-colors ${t.active ? 'text-green-700 group-hover/toggle:text-green-900' : 'text-[#6D7175] group-hover/toggle:text-[#202223]'}`}>
                              {t.active ? 'Active' : 'Hidden'}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(t)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">
                              {Ico.edit} Edit
                            </button>
                            <button onClick={() => onToggleActive(t)} title={t.active ? 'Hide from site' : 'Unhide'}
                              className="p-1.5 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">
                              {t.active ? Ico.eyeOff : Ico.eye}
                            </button>
                            <button onClick={() => setDeleteTarget(t)}
                              className="p-1.5 rounded-lg text-[#6D7175] hover:bg-red-50 hover:text-red-600 transition-colors">
                              {Ico.trash}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

// ── Bobblehead Occasions: setup SQL ──────────────────────────────────────────
const OCCASION_SETUP_SQL = `-- Run in Supabase → SQL Editor → New query
create table if not exists bobblehead_occasions (
  id text primary key,
  title text not null,
  tagline text,
  description text,
  badge text,
  icon text,
  images text[],
  price_display text,
  cta_text text default 'Get a Quote',
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table bobblehead_occasions enable row level security;
drop policy if exists "Public read occasions" on bobblehead_occasions;
drop policy if exists "Admin write occasions" on bobblehead_occasions;
create policy "Public read occasions" on bobblehead_occasions
  for select using (true);
create policy "Admin write occasions" on bobblehead_occasions
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('bobblehead-media', 'bobblehead-media', true)
on conflict (id) do nothing;

create policy "Public read bobblehead media" on storage.objects
  for select using (bucket_id = 'bobblehead-media');
create policy "Allow upload bobblehead media" on storage.objects
  for insert to authenticated with check (bucket_id = 'bobblehead-media');
create policy "Allow delete bobblehead media" on storage.objects
  for delete to authenticated using (bucket_id = 'bobblehead-media');`

function OccasionSetupBanner({ onDismiss }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(OCCASION_SETUP_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mx-6 mt-4 border border-red-200 bg-red-50 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <span className="text-red-500 shrink-0 mt-0.5">{Ico.warn}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-red-800">Bobblehead occasions table not set up yet</p>
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600 shrink-0">{Ico.xLg}</button>
          </div>
          <p className="text-xs text-red-700 mb-3">
            Run this SQL in <strong>Supabase → SQL Editor → New query</strong> to create the <code className="bg-red-100 px-1 rounded font-mono">bobblehead_occasions</code> table and storage bucket, then try saving again.
          </p>
          <div className="relative">
            <pre className="bg-[#1D1D1F] text-[#86868B] text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre max-h-48">{OCCASION_SETUP_SQL}</pre>
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

// Seed content — 5 starter occasions the admin can edit/add to via the dashboard
const DEFAULT_OCCASIONS = [
  {
    title: 'Corporate Gifts',
    tagline: 'Bulk orders for your team, client, or boss.',
    description: 'Custom bobbleheads for corporate milestones, client appreciation, and team celebrations. Order in bulk with consistent quality across every figure — a gift your colleagues will actually keep on their desk.',
    badge: 'Popular',
    icon: '🎁',
    cta_text: 'Get a Quote',
  },
  {
    title: 'Gifts for Doctor',
    tagline: "A thank-you they'll display forever.",
    description: 'A one-of-a-kind thank-you for the doctor, nurse, or caregiver who went above and beyond. Sculpted in full scrubs or coat, with their exact likeness.',
    badge: 'New',
    icon: '🩺',
    cta_text: 'Get a Quote',
  },
  {
    title: 'Birthday Gifts',
    tagline: 'A gift as one-of-a-kind as they are.',
    description: "Mark a birthday with a custom bobblehead capturing exactly who they are — hobbies, outfit, expression and all. A gift they won't get from anyone else.",
    badge: 'Trending',
    icon: '🎂',
    cta_text: 'Get a Quote',
  },
  {
    title: 'Wedding',
    tagline: 'Immortalize your big day, mini-me style.',
    description: 'Custom bride-and-groom bobbleheads sculpted from your wedding photos — perfect as a cake topper, guestbook centerpiece, or anniversary keepsake.',
    badge: 'Best Seller',
    icon: '💍',
    cta_text: 'Get a Quote',
  },
  {
    title: 'Funny Gifts',
    tagline: 'Because they can take a joke.',
    description: 'Novelty bobbleheads built for laughs — surprise photos, exaggerated expressions, inside jokes brought to life in 3D. The gift that gets opened first.',
    badge: 'Hot',
    icon: '😂',
    cta_text: 'Get a Quote',
  },
]

// ── Occasion Form ─────────────────────────────────────────────────────────────
function OccasionForm({ occasion, onSave, onBack, toast }) {
  const isNew = !occasion?.id || !!occasion?._new
  const topRef = useRef(null)

  const initForm = () => {
    if (!occasion || occasion._new) return {
      id: '', title: '', tagline: '', description: '', badge: '', icon: '',
      images: [], price_display: '', cta_text: 'Get a Quote', active: true, sort_order: 0,
    }
    return { ...occasion, images: occasion.images || [] }
  }

  const [form, setForm] = useState(initForm)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [schemaError, setSchemaError] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)

  const set = (k, v) => { setIsDirty(true); setForm(f => ({ ...f, [k]: v })) }

  const handleBack = () => {
    if (isDirty) setShowDiscard(true)
    else onBack()
  }

  const handleSave = async (stayOnPage = false) => {
    if (!form.title.trim()) {
      setErr('Occasion title is required.')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setSaving(true)
    setErr('')

    const id = isNew ? slugify(form.title) : form.id
    const payload = {
      title: form.title.trim(),
      tagline: form.tagline?.trim() || '',
      description: form.description?.trim() || '',
      badge: form.badge?.trim() || null,
      icon: form.icon?.trim() || null,
      images: form.images.filter(Boolean),
      price_display: form.price_display?.trim() || null,
      cta_text: form.cta_text?.trim() || 'Get a Quote',
      active: !!form.active,
      sort_order: parseInt(form.sort_order) || 0,
    }

    let error
    if (isNew) {
      const res = await supabase.from('bobblehead_occasions').insert({ id, ...payload })
      error = res.error
    } else {
      const res = await supabase.from('bobblehead_occasions').update(payload).eq('id', id)
      error = res.error
    }

    setSaving(false)
    if (error) {
      const msg = error.message || ''
      if (msg.includes('schema cache') || msg.includes('column') || msg.includes('does not exist') || msg.includes('relation')) {
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

    toast(`"${form.title}" ${isNew ? 'created' : 'saved'} successfully`)
    setIsDirty(false)

    if (stayOnPage) {
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

      <div ref={topRef} className="bg-white border-b border-[#E1E3E5] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={handleBack} className="flex items-center gap-1 text-sm text-[#6D7175] hover:text-[#202223] transition-colors shrink-0">
            {Ico.back} Bobbleheads
          </button>
          <span className="text-[#C9CCCF]">/</span>
          <span className="text-sm font-semibold text-[#202223] truncate">
            {isNew ? 'Add occasion' : (form.title || 'Edit occasion')}
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
        <OccasionSetupBanner onDismiss={() => setSchemaError(false)} />
      )}
      {err && !schemaError && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <span className="shrink-0 mt-0.5 font-bold">✕</span>
          <span>{err}</span>
        </div>
      )}

      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-6xl mx-auto w-full">

        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardTitle>Occasion details</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Corporate Gifts" />
              </div>
              <div>
                <Label hint="(short line shown on the homepage card)">Tagline</Label>
                <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Bulk orders for your team, client, or boss." />
              </div>
              <div>
                <Label hint="(shown on the full occasion page)">Description</Label>
                <Textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What makes this occasion special, what customers get, how it works." />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Images</CardTitle>
            <p className="text-xs text-[#6D7175] mb-3">
              First image is used as the homepage card background and page hero. Additional images appear in the gallery on the occasion page.
            </p>
            <ImageUploader
              images={form.images}
              onChange={imgs => set('images', imgs)}
              toast={toast}
              uploadFn={uploadOccasionImage}
              deleteFn={deleteOccasionImage}
              bucketSql={OCCASION_SETUP_SQL}
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>Status</CardTitle>
            <div className="space-y-4">
              <Toggle value={form.active} onChange={v => set('active', v)} label="Active (visible on site)" />
              <div>
                <Label hint="(lower number = shows first)">Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="0" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Card details</CardTitle>
            <div className="space-y-3">
              <div>
                <Label hint="(optional — shows as a pill badge)">Badge label</Label>
                <Input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="Popular / New / Hot" />
              </div>
              <div>
                <Label hint="(shown if no image is uploaded)">Icon (emoji)</Label>
                <Input value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🎁" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Pricing & CTA</CardTitle>
            <div className="space-y-3">
              <div>
                <Label hint="(optional — leave blank to hide)">Price display</Label>
                <Input value={form.price_display} onChange={e => set('price_display', e.target.value)} placeholder="From ₹1,999" />
              </div>
              <div>
                <Label>Button text</Label>
                <Input value={form.cta_text} onChange={e => set('cta_text', e.target.value)} placeholder="Get a Quote" />
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-2">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="w-full py-3 text-sm font-semibold bg-[#1D1D1F] text-white rounded-xl hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : <>{Ico.check} Save occasion</>}
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

// ── Occasions List ────────────────────────────────────────────────────────────
function OccasionsList({ occasions, loading, seeding, onAdd, onEdit, onToggleActive, onRefresh, onSeed, toast }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const counts = {
    all: occasions.length,
    active: occasions.filter(o => o.active).length,
    hidden: occasions.filter(o => !o.active).length,
  }

  const filtered = occasions.filter(o => {
    const q = search.toLowerCase()
    const matchQ = !q || o.title.toLowerCase().includes(q)
    const matchTab = tab === 'all' || (tab === 'active' && o.active) || (tab === 'hidden' && !o.active)
    return matchQ && matchTab
  })

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('bobblehead_occasions').delete().eq('id', deleteTarget.id)
    if (error) { toast('Delete failed: ' + error.message, 'error') }
    else { toast(`"${deleteTarget.title}" deleted`) }
    setDeleteTarget(null)
    onRefresh()
  }

  return (
    <div className="flex-1 flex flex-col">
      {deleteTarget && (
        <DeleteModal
          title={`Delete "${deleteTarget.title}"?`}
          message="This will permanently remove this occasion from your site. This action cannot be undone."
          confirmLabel="Delete occasion"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header — hidden on mobile (handled by top bar) */}
      <div className="hidden md:flex bg-white border-b border-[#E1E3E5] px-6 py-4 items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-[#202223]">Bobbleheads — Shop by Occasion</h1>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} title="Refresh" disabled={loading}
            className="p-2 border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#6D7175] disabled:opacity-40 transition-colors">
            <span className={loading ? 'animate-spin inline-block' : ''}>{Ico.refresh}</span>
          </button>
          <button onClick={onSeed} disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#202223] disabled:opacity-50 transition-colors">
            {Ico.import}
            <span className="hidden sm:inline">{seeding ? 'Importing…' : 'Import default occasions'}</span>
          </button>
          <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
            {Ico.plus} <span>Add occasion</span>
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
          <div className="px-3 sm:px-4 py-3 border-b border-[#E1E3E5] flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D7175]">{Ico.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search occasions…"
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
              <p className="text-sm text-[#6D7175]">Loading occasions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center px-8">
              {occasions.length === 0 ? (
                <>
                  <p className="text-2xl mb-3">🎎</p>
                  <p className="text-base font-semibold text-[#202223] mb-1">No occasions yet</p>
                  <p className="text-sm text-[#6D7175] mb-5">Import the 5 starter occasions or add your own to populate the homepage grid.</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button onClick={onSeed} disabled={seeding}
                      className="px-5 py-2.5 border border-[#C9CCCF] text-[#202223] text-sm font-semibold rounded-lg hover:bg-[#F6F6F7] transition-colors disabled:opacity-50">
                      {seeding ? 'Importing…' : 'Import default occasions'}
                    </button>
                    <button onClick={onAdd} className="px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
                      Add first occasion
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#6D7175]">No occasions match "{search}".</p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-[#F1F1F1]">
                {filtered.map(o => {
                  const imgs = (o.images || []).filter(Boolean)
                  return (
                    <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0 flex items-center justify-center text-lg">
                        {imgs[0]
                          ? <img src={imgs[0]} alt={o.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                          : (o.icon || '🎎')
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#202223] truncate">{o.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#6D7175] truncate max-w-[140px]">{o.tagline || <span className="italic opacity-50">No tagline</span>}</span>
                          <span className="text-[#C9CCCF]">·</span>
                          <button onClick={() => onToggleActive(o)} className="flex items-center gap-1 shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${o.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                            <span className={`text-xs ${o.active ? 'text-green-700' : 'text-[#6D7175]'}`}>{o.active ? 'Active' : 'Hidden'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => onEdit(o)}
                          className="p-2 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] active:bg-[#E1E3E5] transition-colors">
                          {Ico.edit}
                        </button>
                        <button onClick={() => onToggleActive(o)} title={o.active ? 'Hide from site' : 'Unhide'}
                          className="p-2 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] active:bg-[#E1E3E5] transition-colors">
                          {o.active ? Ico.eyeOff : Ico.eye}
                        </button>
                        <button onClick={() => setDeleteTarget(o)}
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
                      {['Occasion', 'Tagline', 'Images', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F1F1]">
                    {filtered.map(o => {
                      const imgs = (o.images || []).filter(Boolean)
                      return (
                        <tr key={o.id} className="hover:bg-[#F9F9F9] transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0 flex items-center justify-center text-base">
                                {imgs[0]
                                  ? <img src={imgs[0]} alt={o.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                                  : (o.icon || '🎎')
                                }
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#202223] truncate">{o.title}</p>
                                {o.badge && <span className="text-xs px-2 py-0.5 bg-[#F1F1F1] text-[#6D7175] rounded-full font-medium">{o.badge}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-[#6D7175] truncate max-w-[240px]">{o.tagline || <span className="italic opacity-50">No tagline</span>}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#6D7175]">{imgs.length > 0 ? `${imgs.length} image${imgs.length !== 1 ? 's' : ''}` : 'None'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => onToggleActive(o)} className="flex items-center gap-1.5 group/toggle">
                              <span className={`w-2 h-2 rounded-full transition-colors ${o.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                              <span className={`text-xs font-medium transition-colors ${o.active ? 'text-green-700 group-hover/toggle:text-green-900' : 'text-[#6D7175] group-hover/toggle:text-[#202223]'}`}>
                                {o.active ? 'Active' : 'Hidden'}
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => onEdit(o)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">
                                {Ico.edit} Edit
                              </button>
                              <button onClick={() => onToggleActive(o)} title={o.active ? 'Hide from site' : 'Unhide'}
                                className="p-1.5 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">
                                {o.active ? Ico.eyeOff : Ico.eye}
                              </button>
                              <button onClick={() => setDeleteTarget(o)}
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
// ── Blog setup SQL ────────────────────────────────────────────────────────────
const BLOG_SETUP_SQL = `-- Run in Supabase → SQL Editor → New query
create table if not exists blog_posts (
  slug text primary key,
  title text not null,
  excerpt text,
  content_html text,
  featured_image text,
  category text,
  tags text[],
  author_name text default 'ORIC Team',
  status text default 'draft',
  published_at timestamptz,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table blog_posts enable row level security;
drop policy if exists "Public read published posts" on blog_posts;
drop policy if exists "Admin write posts" on blog_posts;
create policy "Public read published posts" on blog_posts
  for select using (status = 'published' and published_at <= now());
create policy "Admin write posts" on blog_posts
  for all to authenticated using (true) with check (true);

create table if not exists blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text references blog_posts(slug) on delete cascade,
  name text not null,
  email text,
  comment_text text not null,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table blog_comments enable row level security;
drop policy if exists "Public read approved comments" on blog_comments;
drop policy if exists "Public submit comments" on blog_comments;
drop policy if exists "Admin manage comments" on blog_comments;
create policy "Public read approved comments" on blog_comments
  for select using (status = 'approved');
create policy "Public submit comments" on blog_comments
  for insert with check (status = 'pending');
create policy "Admin manage comments" on blog_comments
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "Public read blog images" on storage.objects
  for select using (bucket_id = 'blog-images');
create policy "Allow upload blog images" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images');
create policy "Allow delete blog images" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-images');`

function BlogSetupBanner({ onDismiss }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(BLOG_SETUP_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mx-6 mt-4 border border-red-200 bg-red-50 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <span className="text-red-500 shrink-0 mt-0.5">{Ico.warn}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-red-800">Blog tables not set up yet</p>
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600 shrink-0">{Ico.xLg}</button>
          </div>
          <p className="text-xs text-red-700 mb-3">
            Run this SQL in <strong>Supabase → SQL Editor → New query</strong> to create the <code className="bg-red-100 px-1 rounded font-mono">blog_posts</code> and <code className="bg-red-100 px-1 rounded font-mono">blog_comments</code> tables plus the <code className="bg-red-100 px-1 rounded font-mono">blog-images</code> storage bucket, then try saving again.
          </p>
          <div className="relative">
            <pre className="bg-[#1D1D1F] text-[#86868B] text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre max-h-48">{BLOG_SETUP_SQL}</pre>
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

function toLocalDatetimeInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const blogStatusOf = (p) => {
  if (p.status !== 'published') return 'draft'
  return p.published_at && new Date(p.published_at) > new Date() ? 'scheduled' : 'published'
}

// ── Blog Form ──────────────────────────────────────────────────────────────────
function BlogForm({ post, onSave, onBack, toast }) {
  const isNew = !post?.slug || !!post?._new
  const topRef = useRef(null)

  const initForm = () => {
    if (!post || post._new) return {
      slug: '', title: '', excerpt: '', content_html: '',
      featuredImages: [], category: BLOG_CATEGORIES[0], tags: '',
      author_name: 'ORIC Team', meta_title: '', meta_description: '',
    }
    return {
      ...post,
      featuredImages: post.featured_image ? [post.featured_image] : [],
      tags: (post.tags || []).join(', '),
      category: post.category || BLOG_CATEGORIES[0],
      published_at: post.published_at ? toLocalDatetimeInput(post.published_at) : '',
    }
  }

  const [form, setForm] = useState(initForm)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [schemaError, setSchemaError] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const [publishMode, setPublishMode] = useState(() => {
    const status = !post || post._new ? 'draft' : blogStatusOf(post)
    return status === 'scheduled' ? 'schedule' : status === 'published' ? 'publish' : 'draft'
  })

  const set = (k, v) => { setIsDirty(true); setForm(f => ({ ...f, [k]: v })) }

  const handleBack = () => {
    if (isDirty) setShowDiscard(true)
    else onBack()
  }

  const handleSave = async (stayOnPage = false) => {
    if (!form.title.trim()) {
      setErr('Post title is required.')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (publishMode === 'schedule' && !form.published_at) {
      setErr('Pick a date and time to schedule this post.')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setSaving(true)
    setErr('')

    const slug = isNew ? slugify(form.title) : form.slug
    const status = publishMode === 'draft' ? 'draft' : 'published'
    const published_at =
      publishMode === 'draft' ? null :
      publishMode === 'schedule' ? new Date(form.published_at).toISOString() :
      new Date().toISOString()

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt?.trim() || '',
      content_html: form.content_html || '',
      featured_image: form.featuredImages[0] || null,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      author_name: form.author_name?.trim() || 'ORIC Team',
      status,
      published_at,
      meta_title: form.meta_title?.trim() || null,
      meta_description: form.meta_description?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (isNew) {
      const res = await supabase.from('blog_posts').insert({ slug, ...payload })
      error = res.error
    } else {
      const res = await supabase.from('blog_posts').update(payload).eq('slug', slug)
      error = res.error
    }

    setSaving(false)
    if (error) {
      const msg = error.message || ''
      if (msg.includes('schema cache') || msg.includes('column') || msg.includes('does not exist') || msg.includes('relation')) {
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

    toast(`"${form.title}" ${isNew ? 'created' : 'saved'} successfully`)
    setIsDirty(false)

    if (stayOnPage) {
      if (isNew) setForm(f => ({ ...f, slug }))
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

      <div ref={topRef} className="bg-white border-b border-[#E1E3E5] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={handleBack} className="flex items-center gap-1 text-sm text-[#6D7175] hover:text-[#202223] transition-colors shrink-0">
            {Ico.back} Blog
          </button>
          <span className="text-[#C9CCCF]">/</span>
          <span className="text-sm font-semibold text-[#202223] truncate">
            {isNew ? 'Add post' : (form.title || 'Edit post')}
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
        <BlogSetupBanner onDismiss={() => setSchemaError(false)} />
      )}
      {err && !schemaError && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <span className="shrink-0 mt-0.5 font-bold">✕</span>
          <span>{err}</span>
        </div>
      )}

      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-6xl mx-auto w-full">

        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardTitle>Post details</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. PLA vs PETG vs ABS — Which Should You Print With?" />
              </div>
              {!isNew && (
                <div>
                  <Label hint="(the URL — /blog/your-slug)">Slug</Label>
                  <Input value={form.slug} onChange={e => set('slug', slugify(e.target.value))} />
                </div>
              )}
              <div>
                <Label hint="(shown on blog cards and used as the fallback meta description)">Excerpt</Label>
                <Textarea rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="One or two sentences summarizing the post." />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Content</CardTitle>
            <BlogEditor value={form.content_html} onChange={html => set('content_html', html)} toast={toast} />
          </Card>

          <Card>
            <CardTitle>Featured image</CardTitle>
            <p className="text-xs text-[#6D7175] mb-3">Used on the blog listing card, the post hero, and social share previews.</p>
            <ImageUploader
              images={form.featuredImages}
              onChange={imgs => set('featuredImages', imgs.slice(-1))}
              toast={toast}
              uploadFn={uploadBlogImage}
              deleteFn={deleteBlogImage}
              bucketSql={BLOG_SETUP_SQL}
            />
          </Card>

          <Card>
            <CardTitle>SEO</CardTitle>
            <div className="space-y-4">
              <div>
                <Label hint={`(${(form.meta_title || '').length}/60 chars — leave blank to use the title)`}>Meta title</Label>
                <Input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder={form.title} />
              </div>
              <div>
                <Label hint={`(${(form.meta_description || '').length}/155 chars — leave blank to use the excerpt)`}>Meta description</Label>
                <Textarea rows={2} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} placeholder={form.excerpt} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>Publish</CardTitle>
            <div className="space-y-2">
              {[
                ['draft', 'Save as draft'],
                ['publish', 'Publish now'],
                ['schedule', 'Schedule for later'],
              ].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => { setIsDirty(true); setPublishMode(val) }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    publishMode === val ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white' : 'border-[#C9CCCF] text-[#202223] hover:bg-[#F6F6F7]'
                  }`}>
                  {lbl}
                </button>
              ))}
              {publishMode === 'schedule' && (
                <Input type="datetime-local" value={form.published_at} onChange={e => set('published_at', e.target.value)} className="mt-2" />
              )}
              {!isNew && post?.published_at && (
                <p className="text-xs text-[#6D7175] pt-1">
                  {blogStatusOf(post) === 'published' ? 'Published' : blogStatusOf(post) === 'scheduled' ? 'Scheduled for' : ''} {post.published_at && new Date(post.published_at).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Organization</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onChange={e => set('category', e.target.value)}>
                  {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label hint="(comma separated)">Tags</Label>
                <Input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="pla, printing tips, beginner" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Author</CardTitle>
            <Input value={form.author_name} onChange={e => set('author_name', e.target.value)} placeholder="ORIC Team" />
          </Card>

          <div className="flex flex-col gap-2">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="w-full py-3 text-sm font-semibold bg-[#1D1D1F] text-white rounded-xl hover:bg-[#424245] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : <>{Ico.check} Save post</>}
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

// ── Blog List ──────────────────────────────────────────────────────────────────
function BlogsList({ posts, loading, onAdd, onEdit, onRefresh, toast }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const counts = {
    all: posts.length,
    draft: posts.filter(p => blogStatusOf(p) === 'draft').length,
    scheduled: posts.filter(p => blogStatusOf(p) === 'scheduled').length,
    published: posts.filter(p => blogStatusOf(p) === 'published').length,
  }

  const filtered = posts.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.title.toLowerCase().includes(q)
    const matchTab = tab === 'all' || blogStatusOf(p) === tab
    return matchQ && matchTab
  })

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('blog_posts').delete().eq('slug', deleteTarget.slug)
    if (error) toast('Delete failed: ' + error.message, 'error')
    else toast(`"${deleteTarget.title}" deleted`)
    setDeleteTarget(null)
    onRefresh()
  }

  const StatusBadge = ({ status }) => {
    const map = {
      draft:     { text: 'Draft',     cls: 'bg-[#F1F1F1] text-[#6D7175]' },
      scheduled: { text: 'Scheduled', cls: 'bg-amber-100 text-amber-700' },
      published: { text: 'Published', cls: 'bg-green-100 text-green-700' },
    }
    const s = map[status]
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.text}</span>
  }

  return (
    <div className="flex-1 flex flex-col">
      {deleteTarget && (
        <DeleteModal
          title={`Delete "${deleteTarget.title}"?`}
          message="This will permanently remove this post from your site. This action cannot be undone."
          confirmLabel="Delete post"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="hidden md:flex bg-white border-b border-[#E1E3E5] px-6 py-4 items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-[#202223]">Blog</h1>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} title="Refresh" disabled={loading}
            className="p-2 border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#6D7175] disabled:opacity-40 transition-colors">
            <span className={loading ? 'animate-spin inline-block' : ''}>{Ico.refresh}</span>
          </button>
          <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
            {Ico.plus} <span>Add post</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total', value: counts.all },
            { label: 'Draft', value: counts.draft },
            { label: 'Scheduled', value: counts.scheduled, color: 'text-amber-700' },
            { label: 'Published', value: counts.published, color: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E1E3E5] rounded-xl px-5 py-4">
              <p className="text-xs text-[#6D7175] font-medium mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color || 'text-[#202223]'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E1E3E5] rounded-xl overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-[#E1E3E5] flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D7175]">{Ico.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] bg-white text-[#202223]" />
            </div>
            <div className="flex border border-[#C9CCCF] rounded-lg overflow-hidden">
              {[['all', 'All'], ['draft', 'Draft'], ['scheduled', 'Scheduled'], ['published', 'Published']].map(([val, lbl]) => (
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
              <p className="text-sm text-[#6D7175]">Loading posts…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center px-8">
              {posts.length === 0 ? (
                <>
                  <p className="text-2xl mb-3">📝</p>
                  <p className="text-base font-semibold text-[#202223] mb-1">No posts yet</p>
                  <p className="text-sm text-[#6D7175] mb-5">Write your first post — save it as a draft, publish immediately, or schedule it for later.</p>
                  <button onClick={onAdd} className="px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
                    Write first post
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#6D7175]">No posts match "{search}".</p>
              )}
            </div>
          ) : (
            <>
              <div className="md:hidden divide-y divide-[#F1F1F1]">
                {filtered.map(p => (
                  <div key={p.slug} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0 flex items-center justify-center text-lg">
                      {p.featured_image
                        ? <img src={p.featured_image} alt={p.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                        : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#202223] truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#6D7175] truncate max-w-[120px]">{p.category}</span>
                        <StatusBadge status={blogStatusOf(p)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] active:bg-[#E1E3E5] transition-colors">
                        {Ico.edit}
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg text-[#6D7175] hover:bg-red-50 active:bg-red-50 hover:text-red-600 active:text-red-600 transition-colors">
                        {Ico.trash}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-[#F6F6F7] border-b border-[#E1E3E5]">
                      {['Post', 'Category', 'Status', 'Date', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F1F1]">
                    {filtered.map(p => {
                      const status = blogStatusOf(p)
                      return (
                        <tr key={p.slug} className="hover:bg-[#F9F9F9] transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0 flex items-center justify-center text-base">
                                {p.featured_image
                                  ? <img src={p.featured_image} alt={p.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                                  : '📝'}
                              </div>
                              <p className="text-sm font-semibold text-[#202223] truncate max-w-[240px]">{p.title}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs text-[#6D7175]">{p.category}</span></td>
                          <td className="px-4 py-3"><StatusBadge status={status} /></td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#6D7175]">
                              {p.published_at ? new Date(p.published_at).toLocaleDateString('en-IN') : '—'}
                            </span>
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

// ── Comments List (moderation) ──────────────────────────────────────────────────
function CommentsList({ comments, loading, onRefresh, toast }) {
  const [tab, setTab] = useState('pending')

  const counts = {
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
  }
  const filtered = comments.filter(c => c.status === tab)

  const setStatus = async (c, status) => {
    const { error } = await supabase.from('blog_comments').update({ status }).eq('id', c.id)
    if (error) { toast('Update failed: ' + error.message, 'error'); return }
    toast(status === 'approved' ? 'Comment approved' : status === 'rejected' ? 'Comment rejected' : 'Comment updated')
    onRefresh()
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="hidden md:flex bg-white border-b border-[#E1E3E5] px-6 py-4 items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-[#202223]">Comments</h1>
        <button onClick={onRefresh} title="Refresh" disabled={loading}
          className="p-2 border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#6D7175] disabled:opacity-40 transition-colors">
          <span className={loading ? 'animate-spin inline-block' : ''}>{Ico.refresh}</span>
        </button>
      </div>

      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-5">
        <div className="flex border border-[#C9CCCF] rounded-lg overflow-hidden w-fit mb-5">
          {[['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, lbl]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${tab === val ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#6D7175] hover:bg-[#F6F6F7]'}`}>
              {lbl} <span className="opacity-60">{counts[val] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#6D7175]">Loading comments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center px-8">
            <p className="text-2xl mb-3">💬</p>
            <p className="text-sm text-[#6D7175]">No {tab} comments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-white border border-[#E1E3E5] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#202223]">{c.name}</p>
                    <p className="text-xs text-[#6D7175]">
                      on <span className="font-medium">{c.blog_posts?.title || c.post_slug}</span> · {new Date(c.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {c.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setStatus(c, 'approved')}
                        className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => setStatus(c, 'rejected')}
                        className="px-3 py-1.5 text-xs font-semibold border border-[#C9CCCF] text-[#202223] rounded-lg hover:bg-[#F6F6F7] transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#424245] leading-relaxed">{c.comment_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminClient() {
  const [authed, setAuthed] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(false)
  const [occasions, setOccasions] = useState([])
  const [occasionsLoading, setOccasionsLoading] = useState(false)
  const [occasionSeeding, setOccasionSeeding] = useState(false)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [view, setView] = useState('list')
  const [editProduct, setEditProduct] = useState(null)
  const [editTestimonial, setEditTestimonial] = useState(null)
  const [editOccasion, setEditOccasion] = useState(null)
  const [editPost, setEditPost] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toasts, toast } = useToast()
  const inTestimonials = view === 'testimonials-list' || view === 'testimonials-form'
  const inOccasions = view === 'occasions-list' || view === 'occasions-form'
  const inBlog = view === 'blog-list' || view === 'blog-form'
  const inComments = view === 'comments-list'

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProducts = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true })
    if (error) toast('Failed to load products: ' + error.message, 'error')
    setProducts(data || [])
    setLoading(false)
  }, [toast])

  useEffect(() => { if (authed && isConfigured) fetchProducts() }, [authed, fetchProducts])

  const fetchTestimonials = useCallback(async () => {
    if (!supabase) return
    setTestimonialsLoading(true)
    const { data, error } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true })
    if (error && !error.message.includes('does not exist')) toast('Failed to load testimonials: ' + error.message, 'error')
    setTestimonials(data || [])
    setTestimonialsLoading(false)
  }, [toast])

  useEffect(() => { if (authed && isConfigured) fetchTestimonials() }, [authed, fetchTestimonials])

  const fetchOccasions = useCallback(async () => {
    if (!supabase) return
    setOccasionsLoading(true)
    const { data, error } = await supabase.from('bobblehead_occasions').select('*').order('sort_order', { ascending: true })
    if (error && !error.message.includes('does not exist')) toast('Failed to load occasions: ' + error.message, 'error')
    setOccasions(data || [])
    setOccasionsLoading(false)
  }, [toast])

  useEffect(() => { if (authed && isConfigured) fetchOccasions() }, [authed, fetchOccasions])

  const fetchPosts = useCallback(async () => {
    if (!supabase) return
    setPostsLoading(true)
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    if (error && !error.message.includes('does not exist')) toast('Failed to load posts: ' + error.message, 'error')
    setPosts(data || [])
    setPostsLoading(false)
  }, [toast])

  useEffect(() => { if (authed && isConfigured) fetchPosts() }, [authed, fetchPosts])

  const fetchComments = useCallback(async () => {
    if (!supabase) return
    setCommentsLoading(true)
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*, blog_posts(title)')
      .order('created_at', { ascending: false })
    if (error && !error.message.includes('does not exist')) toast('Failed to load comments: ' + error.message, 'error')
    setComments(data || [])
    setCommentsLoading(false)
  }, [toast])

  useEffect(() => { if (authed && isConfigured) fetchComments() }, [authed, fetchComments])

  const handleSeedOccasions = async () => {
    setOccasionSeeding(true)
    const rows = DEFAULT_OCCASIONS.map((o, i) => ({ id: slugify(o.title), images: [], price_display: null, active: true, sort_order: i, ...o }))
    const { error } = await supabase.from('bobblehead_occasions').upsert(rows, { onConflict: 'id' })
    if (error) toast('Import failed: ' + error.message, 'error')
    else toast(`${rows.length} occasions imported`)
    await fetchOccasions()
    setOccasionSeeding(false)
  }

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

  const handleToggleActiveTestimonial = async (t) => {
    const { error } = await supabase.from('testimonials').update({ active: !t.active }).eq('id', t.id)
    if (error) { toast('Update failed: ' + error.message, 'error'); return }
    toast(`Testimonial from "${t.name}" ${!t.active ? 'activated' : 'hidden'}`)
    fetchTestimonials()
  }

  const handleToggleActiveOccasion = async (o) => {
    const { error } = await supabase.from('bobblehead_occasions').update({ active: !o.active }).eq('id', o.id)
    if (error) { toast('Update failed: ' + error.message, 'error'); return }
    toast(`"${o.title}" ${!o.active ? 'activated' : 'hidden'}`)
    fetchOccasions()
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F6F6F7]"><div className="w-8 h-8 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" /></div>
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const SidebarContent = () => (
    <>
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/oriclogo1.svg" alt="ORIC" className="h-8 w-auto" style={{ display: 'block', filter: 'brightness(0) invert(1)' }} />
            <p className="text-white/40 text-[10px]">Admin Dashboard</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <button
          onClick={() => {
            if (inOccasions) { setEditOccasion({ _new: true }); setView('occasions-form') }
            else if (inTestimonials) { setEditTestimonial({ _new: true }); setView('testimonials-form') }
            else if (inBlog) { setEditPost({ _new: true }); setView('blog-form') }
            else if (inComments) { /* no "add" action for comments */ }
            else { setEditProduct({ _new: true }); setView('form') }
            setMobileOpen(false)
          }}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm bg-white text-[#1D1D1F] font-bold hover:bg-white/90 transition-colors mb-3 ${inComments ? 'hidden' : ''}`}
        >
          {Ico.plus} {inOccasions ? 'Add occasion' : inTestimonials ? 'Add testimonial' : inBlog ? 'Add post' : 'Add product'}
        </button>
        <button onClick={() => { setView('list'); setMobileOpen(false) }}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${view === 'list' || view === 'form' ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <span className="flex items-center gap-2">📦 Products</span>
          {products.length > 0 && (
            <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full font-semibold">{products.length}</span>
          )}
        </button>
        <button onClick={() => { setView('testimonials-list'); setMobileOpen(false) }}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${inTestimonials ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <span className="flex items-center gap-2">💬 Testimonials</span>
          {testimonials.length > 0 && (
            <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full font-semibold">{testimonials.length}</span>
          )}
        </button>
        <button onClick={() => { setView('occasions-list'); setMobileOpen(false) }}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${inOccasions ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <span className="flex items-center gap-2">🎎 Bobbleheads</span>
          {occasions.length > 0 && (
            <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full font-semibold">{occasions.length}</span>
          )}
        </button>
        <button onClick={() => { setView('blog-list'); setMobileOpen(false) }}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${inBlog ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <span className="flex items-center gap-2">📝 Blog</span>
          {posts.length > 0 && (
            <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full font-semibold">{posts.length}</span>
          )}
        </button>
        <button onClick={() => { setView('comments-list'); setMobileOpen(false) }}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${inComments ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <span className="flex items-center gap-2">🗨️ Comments</span>
          {comments.filter(c => c.status === 'pending').length > 0 && (
            <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full font-semibold">{comments.filter(c => c.status === 'pending').length}</span>
          )}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          {Ico.store} View store ↗
        </a>
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={() => supabase.auth.signOut()}
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
            <img src="/oriclogo1.svg" alt="ORIC" className="h-7 w-auto" style={{ display: 'block', filter: 'brightness(0) invert(1)' }} />
            <p className="text-white text-sm font-bold">Admin</p>
          </div>
          <div className="flex items-center gap-2">
            {!inComments && (
              <button
                onClick={() => {
                  if (inOccasions) { setEditOccasion({ _new: true }); setView('occasions-form') }
                  else if (inTestimonials) { setEditTestimonial({ _new: true }); setView('testimonials-form') }
                  else if (inBlog) { setEditPost({ _new: true }); setView('blog-form') }
                  else { setEditProduct({ _new: true }); setView('form') }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#1D1D1F] text-xs font-bold rounded-lg"
              >
                {Ico.plus} Add
              </button>
            )}
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
         ) : view === 'form' ? (
           <ProductForm
             product={editProduct}
             toast={toast}
             onSave={() => { setView('list'); fetchProducts() }}
             onBack={() => setView('list')}
           />
         ) : view === 'testimonials-list' ? (
           <TestimonialsList
             testimonials={testimonials}
             loading={testimonialsLoading}
             toast={toast}
             onAdd={() => { setEditTestimonial({ _new: true }); setView('testimonials-form') }}
             onEdit={t => { setEditTestimonial(t); setView('testimonials-form') }}
             onToggleActive={handleToggleActiveTestimonial}
             onRefresh={fetchTestimonials}
           />
         ) : view === 'testimonials-form' ? (
           <TestimonialForm
             testimonial={editTestimonial}
             toast={toast}
             onSave={() => { setView('testimonials-list'); fetchTestimonials() }}
             onBack={() => setView('testimonials-list')}
           />
         ) : view === 'occasions-list' ? (
           <OccasionsList
             occasions={occasions}
             loading={occasionsLoading}
             seeding={occasionSeeding}
             toast={toast}
             onAdd={() => { setEditOccasion({ _new: true }); setView('occasions-form') }}
             onEdit={o => { setEditOccasion(o); setView('occasions-form') }}
             onToggleActive={handleToggleActiveOccasion}
             onRefresh={fetchOccasions}
             onSeed={handleSeedOccasions}
           />
         ) : view === 'occasions-form' ? (
           <OccasionForm
             occasion={editOccasion}
             toast={toast}
             onSave={() => { setView('occasions-list'); fetchOccasions() }}
             onBack={() => setView('occasions-list')}
           />
         ) : view === 'blog-list' ? (
           <BlogsList
             posts={posts}
             loading={postsLoading}
             toast={toast}
             onAdd={() => { setEditPost({ _new: true }); setView('blog-form') }}
             onEdit={p => { setEditPost(p); setView('blog-form') }}
             onRefresh={fetchPosts}
           />
         ) : view === 'blog-form' ? (
           <BlogForm
             post={editPost}
             toast={toast}
             onSave={() => { setView('blog-list'); fetchPosts() }}
             onBack={() => setView('blog-list')}
           />
         ) : (
           <CommentsList
             comments={comments}
             loading={commentsLoading}
             toast={toast}
             onRefresh={fetchComments}
           />
         )
        }
      </div>
    </div>
  )
}
