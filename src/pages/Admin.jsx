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

const toRow = (p, idx) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline || '',
  description: p.description || '',
  price: p.price || null,
  price_display: p.priceDisplay || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : 'Get Quote'),
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
  plus:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  back:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  store:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  x:      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  star:   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
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
  <select className="w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] bg-white text-[#202223]" {...p}>{children}</select>
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

// ── Image Uploader ────────────────────────────────────────────────────────────
function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files?.length) return
    setUploading(true)
    const urls = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        const url = await uploadImage(file)
        urls.push(url)
      } catch (e) {
        alert('Upload failed: ' + e.message)
      }
    }
    onChange([...images, ...urls])
    setUploading(false)
  }

  const handleRemove = async (idx) => {
    const url = images[idx]
    // Only delete from storage if it's a Supabase URL
    if (url?.includes('supabase')) await deleteImage(url)
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
      {/* Upload zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${drag ? 'border-[#1D1D1F] bg-[#F0F0F0]' : 'border-[#C9CCCF] hover:border-[#1D1D1F] hover:bg-[#F6F6F7]'}`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D7175]">Uploading images…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#6D7175]">
            {Ico.upload}
            <p className="text-sm font-medium text-[#202223] mt-1">Drop images here or click to upload</p>
            <p className="text-xs">JPG, PNG, WebP — multiple files supported</p>
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#E1E3E5] bg-[#F6F6F7]">
              <img src={url} alt="" className="w-full h-full object-cover" />

              {/* Primary badge */}
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 bg-[#1D1D1F] text-white text-[9px] font-bold rounded-full">
                  {Ico.star} Primary
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx !== 0 && (
                  <button onClick={() => makePrimary(idx)} title="Set as primary"
                    className="px-2 py-1 bg-white text-[#202223] text-[10px] font-semibold rounded-lg hover:bg-[#F6F6F7]">
                    Set primary
                  </button>
                )}
                <button onClick={() => handleRemove(idx)} title="Remove"
                  className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  {Ico.x}
                </button>
              </div>
            </div>
          ))}

          {/* Add more tile */}
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
  const submit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { sessionStorage.setItem('oric_admin', '1'); onLogin() }
    else setErr('Incorrect password')
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
          <Input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr('') }} placeholder="Password" autoFocus />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button className="w-full py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">Sign In</button>
        </form>
        <p className="text-xs text-[#6D7175] text-center mt-5">Default: <code className="bg-[#F6F6F7] px-1.5 py-0.5 rounded font-mono">oric@admin</code></p>
      </div>
    </div>
  )
}

// ── Setup Guide ───────────────────────────────────────────────────────────────
function SetupGuide() {
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-amber-500 shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Database not connected</p>
            <p className="text-xs text-amber-700 mt-0.5">Add your Supabase env vars to Vercel, then run the SQL below in Supabase → SQL Editor.</p>
          </div>
        </div>
        <div className="bg-white border border-[#E1E3E5] rounded-xl p-6">
          <p className="text-sm font-bold text-[#202223] mb-3">Run in Supabase → SQL Editor → New query:</p>
          <pre className="bg-[#1D1D1F] text-[#86868B] text-xs p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre">{sql}</pre>
        </div>
      </div>
    </div>
  )
}

// ── Product Form ──────────────────────────────────────────────────────────────
function ProductForm({ product, onSave, onBack }) {
  const isNew = !product?.id || product?._new
  const [form, setForm] = useState(() => {
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
      images: imgs,
      highlights: serializeLines(product.highlights),
      specs: serializeSpecs(product.specs),
    }
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Product name is required.'); return }
    setSaving(true); setErr('')
    const id = isNew ? slugify(form.name) : form.id
    const imgs = form.images.filter(Boolean)
    const payload = {
      id, name: form.name.trim(), tagline: form.tagline.trim(), description: form.description.trim(),
      price: form.price !== '' ? parseInt(form.price) : null,
      price_display: form.price_display.trim() || (form.price ? `₹${parseInt(form.price).toLocaleString('en-IN')}` : 'Get Quote'),
      category: form.category, image: imgs[0] || null, images: imgs,
      badge: form.badge.trim() || null, href: `/shop/${id}`,
      material: form.material.trim(), lead: form.lead.trim(),
      rating: form.rating !== '' ? parseFloat(form.rating) : null,
      reviews: form.reviews !== '' ? parseInt(form.reviews) : null,
      highlights: parseLines(form.highlights), specs: parseSpecs(form.specs),
      pre_order: form.pre_order, active: form.active, sort_order: parseInt(form.sort_order) || 0,
    }
    const { error } = isNew
      ? await supabase.from('products').insert(payload)
      : await supabase.from('products').update(payload).eq('id', id)
    setSaving(false)
    if (error) { setErr(error.message); return }
    onSave()
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F7]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E1E3E5] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#6D7175] hover:text-[#202223] transition-colors">
            {Ico.back} Products
          </button>
          <span className="text-[#C9CCCF]">/</span>
          <span className="text-sm font-semibold text-[#202223]">{isNew ? 'Add product' : form.name || 'Edit product'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#202223] transition-colors">Discard</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-[#1D1D1F] text-white rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </div>

      {err && <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{err}</div>}

      {/* Two-column layout */}
      <div className="flex-1 px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-6xl mx-auto w-full">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          <Card>
            <CardTitle>Product details</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Batman Figurine" />
              </div>
              <div>
                <Label hint="(shown on product cards)">Tagline</Label>
                <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Collector-grade. Fan-approved." />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full product description…" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Product images</CardTitle>
            <p className="text-xs text-[#6D7175] mb-3">Upload multiple images. The first image is the primary (shown in listings). Hover an image to set it as primary or remove it.</p>
            <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />
          </Card>

          <Card>
            <CardTitle>Highlights</CardTitle>
            <Label hint="— one bullet point per line">About this item</Label>
            <Textarea rows={6} value={form.highlights} onChange={e => set('highlights', e.target.value)}
              placeholder={"Fine 0.1mm layer height for maximum detail\nPre-sanded and primed finish\nStable display base included\nShips in protective foam packaging"} />
          </Card>

          <Card>
            <CardTitle>Specifications</CardTitle>
            <Label hint="— format: Label: Value, one per line">Technical specs</Label>
            <Textarea rows={7} value={form.specs} onChange={e => set('specs', e.target.value)}
              placeholder={"Height: 18cm\nMaterial: PLA\nLayer Height: 0.1mm\nFinish: Sanded + primed\nLead Time: 5–7 business days"} />
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
                <Label hint="(lower shows first)">Sort order</Label>
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
                <Label hint="(auto-filled if blank)">Display text</Label>
                <Input value={form.price_display} onChange={e => set('price_display', e.target.value)} placeholder="₹899" />
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
                <Label hint="(optional)">Badge label</Label>
                <Input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="New / Popular / Pre-Order" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Shipping & Material</CardTitle>
            <div className="space-y-3">
              <div>
                <Label>Material</Label>
                <Input value={form.material} onChange={e => set('material', e.target.value)} placeholder="PLA" />
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
        </div>
      </div>
    </div>
  )
}

// ── Products List ─────────────────────────────────────────────────────────────
function ProductsList({ products, loading, seeding, onAdd, onEdit, onToggleActive, onRefresh }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  const counts = { all: products.length, active: products.filter(p => p.active).length, draft: products.filter(p => !p.active).length }
  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    return (!q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))
      && (tab === 'all' || (tab === 'active' && p.active) || (tab === 'draft' && !p.active))
  })

  const handleDelete = async (p) => {
    if (deleteId === p.id) {
      await supabase.from('products').delete().eq('id', p.id)
      setDeleteId(null); onRefresh()
    } else {
      setDeleteId(p.id)
      setTimeout(() => setDeleteId(null), 3000)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E1E3E5] px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#202223]">Products</h1>
        <div className="flex items-center gap-2">
          {products.length === 0 && (
            <button onClick={onRefresh} disabled={seeding}
              className="px-4 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] text-[#202223] disabled:opacity-50">
              {seeding ? 'Importing…' : '⬇ Import existing products'}
            </button>
          )}
          <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">
            {Ico.plus} Add product
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[{ label: 'Total products', value: counts.all }, { label: 'Active', value: counts.active, color: 'text-green-700' }, { label: 'Hidden', value: counts.draft }].map(s => (
            <div key={s.label} className="bg-white border border-[#E1E3E5] rounded-xl px-5 py-4">
              <p className="text-xs text-[#6D7175] font-medium mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color || 'text-[#202223]'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E1E3E5] rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-[#E1E3E5] flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D7175]">{Ico.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] bg-white text-[#202223]" />
            </div>
            <div className="flex border border-[#C9CCCF] rounded-lg overflow-hidden">
              {[['all', 'All'], ['active', 'Active'], ['draft', 'Hidden']].map(([val, lbl]) => (
                <button key={val} onClick={() => setTab(val)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === val ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#6D7175] hover:bg-[#F6F6F7]'}`}>
                  {lbl} <span className="opacity-60">{counts[val]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delete confirm bar */}
          {deleteId && (
            <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <p className="text-sm text-red-700">Click <strong>Delete</strong> again on the same row to confirm removal.</p>
              <button onClick={() => setDeleteId(null)} className="text-xs text-red-500 underline ml-4">Cancel</button>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-sm text-[#6D7175]">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#6D7175] text-sm mb-4">{products.length === 0 ? 'No products yet.' : 'No products match your search.'}</p>
              {products.length === 0 && (
                <button onClick={onRefresh} disabled={seeding}
                  className="px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-50">
                  {seeding ? 'Importing…' : 'Import existing products'}
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#F6F6F7] border-b border-[#E1E3E5]">
                  {['Product', 'Category', 'Price', 'Images', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F1]">
                {filtered.map(p => {
                  const imgs = (p.images || []).filter(Boolean)
                  return (
                    <tr key={p.id} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Primary image */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0">
                            {imgs[0]
                              ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                              : <div className="w-full h-full flex items-center justify-center text-lg">🖨️</div>
                            }
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#202223]">{p.name}</p>
                            <p className="text-xs text-[#6D7175] truncate max-w-[180px]">{p.tagline}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 bg-[#F1F1F1] text-[#6D7175] rounded-full font-medium">{p.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-[#202223]">
                          {p.price_display || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : 'Get Quote')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {imgs.slice(0, 3).map((img, i) => (
                            <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border border-[#E1E3E5] bg-[#F6F6F7]">
                              <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                            </div>
                          ))}
                          {imgs.length > 3 && <span className="text-xs text-[#6D7175] ml-1">+{imgs.length - 3}</span>}
                          {imgs.length === 0 && <span className="text-xs text-[#C9CCCF]">No images</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => onToggleActive(p)} className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                          <span className={`text-xs font-medium ${p.active ? 'text-green-700' : 'text-[#6D7175]'} hover:underline`}>
                            {p.active ? 'Active' : 'Hidden'}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">{Ico.edit}</button>
                          <button onClick={() => handleDelete(p)}
                            className={`p-1.5 rounded-lg transition-colors ${deleteId === p.id ? 'bg-red-100 text-red-600' : 'text-[#6D7175] hover:bg-red-50 hover:text-red-600'}`}>
                            {Ico.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
  const [view, setView] = useState('list')
  const [editProduct, setEditProduct] = useState(null)

  const fetchProducts = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true })
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (authed && isConfigured) fetchProducts() }, [authed, fetchProducts])

  const handleSeed = async () => {
    setSeeding(true)
    const rows = STATIC_PRODUCTS.map(toRow)
    const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' })
    if (error) alert('Import failed: ' + error.message)
    await fetchProducts()
    setSeeding(false)
  }

  const handleToggleActive = async (p) => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    fetchProducts()
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div className="min-h-screen flex bg-[#F6F6F7]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-56 bg-[#1D1D1F] flex flex-col fixed h-full z-20">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1D1D1F] font-black text-sm">O</div>
            <div>
              <p className="text-white text-sm font-bold leading-none">ORIC</p>
              <p className="text-white/40 text-[10px] mt-0.5">Admin Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button onClick={() => setView('list')}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${view === 'list' ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
            📦 Products
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            {Ico.store} View store
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={() => { sessionStorage.removeItem('oric_admin'); setAuthed(false) }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            {Ico.logout} Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        {!isConfigured ? <SetupGuide /> :
         view === 'list' ? (
           <ProductsList
             products={products} loading={loading} seeding={seeding}
             onAdd={() => { setEditProduct({ _new: true }); setView('add') }}
             onEdit={p => { setEditProduct(p); setView('edit') }}
             onToggleActive={handleToggleActive}
             onRefresh={products.length === 0 ? handleSeed : fetchProducts}
           />
         ) : (
           <ProductForm product={editProduct} onSave={() => { setView('list'); fetchProducts() }} onBack={() => setView('list')} />
         )
        }
      </div>
    </div>
  )
}
