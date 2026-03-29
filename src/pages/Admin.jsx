import { useState, useEffect, useCallback } from 'react'
import { supabase, isConfigured } from '../lib/supabase'
import { products as STATIC_PRODUCTS } from '../data/products'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'oric@admin'
const CATEGORIES = ['Tools', 'Figurines', 'Cosplay', 'Accessories', 'Custom', 'Idols', 'Prototyping', 'Manufacturing', 'Toys']

// ── utils ─────────────────────────────────────────────────────────────────────
const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const parseLines = (s) => (s || '').split('\n').map(l => l.trim()).filter(Boolean)
const parseSpecs = (s) => {
  const o = {}
  ;(s || '').split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) o[l.slice(0,i).trim()] = l.slice(i+1).trim() })
  return o
}
const serializeLines = (a) => Array.isArray(a) ? a.join('\n') : ''
const serializeSpecs = (o) => o && typeof o === 'object' ? Object.entries(o).map(([k,v]) => `${k}: ${v}`).join('\n') : ''

// Map static product → DB row
const toRow = (p, idx) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline || '',
  description: p.description || '',
  price: p.price || null,
  price_display: p.priceDisplay || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : 'Get Quote'),
  category: p.category || 'Custom',
  image: p.image || null,
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
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  store: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  img: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
}

// ── Reusable form elements ────────────────────────────────────────────────────
const Label = ({ children, hint }) => (
  <label className="block text-xs font-semibold text-[#202223] mb-1">
    {children}{hint && <span className="ml-1 font-normal text-[#6D7175]">{hint}</span>}
  </label>
)
const Input = ({ className = '', ...p }) => (
  <input className={`w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 transition-all text-[#202223] bg-white ${className}`} {...p} />
)
const Textarea = ({ className = '', ...p }) => (
  <textarea className={`w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 transition-all text-[#202223] bg-white resize-none ${className}`} {...p} />
)
const Select = ({ className = '', children, ...p }) => (
  <select className={`w-full px-3 py-2.5 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] bg-white text-[#202223] ${className}`} {...p}>{children}</select>
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

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    pw === ADMIN_PASSWORD ? (sessionStorage.setItem('oric_admin','1'), onLogin()) : setErr('Incorrect password')
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
          <Input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr('')}} placeholder="Password" autoFocus />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button className="w-full py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors">Sign In</button>
        </form>
        <p className="text-xs text-[#6D7175] text-center mt-5">Default: <code className="bg-[#F6F6F7] px-1.5 py-0.5 rounded font-mono">oric@admin</code></p>
      </div>
    </div>
  )
}

// ── Product Form (full page, Shopify-style) ───────────────────────────────────
function ProductForm({ product, onSave, onBack }) {
  const isNew = !product?.id || product?._new
  const [form, setForm] = useState(() => {
    if (!product || product._new) return {
      id:'', name:'', tagline:'', description:'', price:'', price_display:'',
      category:'Custom', image:'', badge:'', material:'', lead:'',
      rating:'', reviews:'', highlights:'', specs:'', pre_order:false, active:true, sort_order:0
    }
    return {
      ...product,
      price: product.price ?? '',
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
    const payload = {
      id, name: form.name.trim(), tagline: form.tagline.trim(), description: form.description.trim(),
      price: form.price !== '' ? parseInt(form.price) : null,
      price_display: form.price_display.trim() || (form.price ? `₹${parseInt(form.price).toLocaleString('en-IN')}` : 'Get Quote'),
      category: form.category, image: form.image.trim() || null,
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#F6F6F7]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E1E3E5] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6D7175] hover:text-[#202223] transition-colors">
            {Ico.back} Back
          </button>
          <span className="text-[#C9CCCF]">/</span>
          <span className="text-sm font-semibold text-[#202223]">{isNew ? 'Add product' : form.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] transition-colors text-[#202223]">Discard</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-[#1D1D1F] text-white rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </div>

      {err && <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{err}</div>}

      {/* Form body */}
      <div className="flex-1 px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-6xl mx-auto w-full">

        {/* Left — main fields */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardTitle>Product details</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Batman Figurine" />
              </div>
              <div>
                <Label hint="(short one-liner shown on cards)">Tagline</Label>
                <Input value={form.tagline} onChange={e=>set('tagline',e.target.value)} placeholder="e.g. Collector-grade. Fan-approved." />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Full product description..." />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Media</CardTitle>
            <div>
              <Label hint="(filename — put image in /public folder)">Image path</Label>
              <Input value={form.image} onChange={e=>set('image',e.target.value)} placeholder="/batman-figurine.jpg" />
              {form.image && (
                <div className="mt-3 flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover"
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                    <div className="w-full h-full items-center justify-center text-[#6D7175] hidden">{Ico.img}</div>
                  </div>
                  <p className="text-xs text-[#6D7175] mt-1">Preview. If blank, image path may be wrong.</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Highlights</CardTitle>
            <Label hint="(one bullet point per line)">About this item</Label>
            <Textarea rows={6} value={form.highlights} onChange={e=>set('highlights',e.target.value)}
              placeholder={"Fine 0.1mm layer height for maximum detail\nPre-sanded and primed finish\nStable display base included\nShips in protective foam packaging"} />
          </Card>

          <Card>
            <CardTitle>Specifications</CardTitle>
            <Label hint="(format: Label: Value — one per line)">Technical specs</Label>
            <Textarea rows={7} value={form.specs} onChange={e=>set('specs',e.target.value)}
              placeholder={"Height: 18cm\nMaterial: PLA\nLayer Height: 0.1mm\nFinish: Sanded + primed\nLead Time: 5–7 business days"} />
          </Card>
        </div>

        {/* Right — settings */}
        <div className="space-y-5">
          <Card>
            <CardTitle>Status</CardTitle>
            <div className="space-y-4">
              <Toggle value={form.active} onChange={v=>set('active',v)} label="Active (visible in shop)" />
              <Toggle value={form.pre_order} onChange={v=>set('pre_order',v)} label="Pre-Order" />
              <div>
                <Label hint="(lower shows first)">Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={e=>set('sort_order',e.target.value)} placeholder="0" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Pricing</CardTitle>
            <div className="space-y-3">
              <div>
                <Label hint="(leave blank for 'Get Quote')">Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="899" />
              </div>
              <div>
                <Label hint="(auto if blank)">Display text</Label>
                <Input value={form.price_display} onChange={e=>set('price_display',e.target.value)} placeholder="₹899" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Organisation</CardTitle>
            <div className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onChange={e=>set('category',e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label hint="(optional)">Badge</Label>
                <Input value={form.badge} onChange={e=>set('badge',e.target.value)} placeholder="Popular" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Shipping & Material</CardTitle>
            <div className="space-y-3">
              <div>
                <Label>Material</Label>
                <Input value={form.material} onChange={e=>set('material',e.target.value)} placeholder="PLA" />
              </div>
              <div>
                <Label>Lead time</Label>
                <Input value={form.lead} onChange={e=>set('lead',e.target.value)} placeholder="5–7 business days" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Ratings</CardTitle>
            <div className="space-y-3">
              <div>
                <Label>Rating (out of 5)</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e=>set('rating',e.target.value)} placeholder="4.8" />
              </div>
              <div>
                <Label>Number of reviews</Label>
                <Input type="number" value={form.reviews} onChange={e=>set('reviews',e.target.value)} placeholder="28" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Products List ─────────────────────────────────────────────────────────────
function ProductsList({ products, onEdit, onAdd, onToggleActive, onDelete, onSeed, seeding, loading }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.category||'').toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || (tab === 'active' && p.active) || (tab === 'draft' && !p.active)
    return matchSearch && matchTab
  })

  const handleDelete = async (p) => {
    if (deleteId === p.id) {
      await supabase.from('products').delete().eq('id', p.id)
      setDeleteId(null)
      onSeed() // refresh
    } else {
      setDeleteId(p.id)
      setTimeout(() => setDeleteId(null), 3000)
    }
  }

  const counts = { all: products.length, active: products.filter(p=>p.active).length, draft: products.filter(p=>!p.active).length }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page header */}
      <div className="bg-white border-b border-[#E1E3E5] px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#202223]">Products</h1>
        <div className="flex items-center gap-2">
          {products.length === 0 && (
            <button onClick={onSeed} disabled={seeding}
              className="px-4 py-2 text-sm font-medium border border-[#C9CCCF] rounded-lg hover:bg-[#F6F6F7] transition-colors text-[#202223] disabled:opacity-50">
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
          {[
            { label: 'Total products', value: products.length },
            { label: 'Active', value: counts.active, color: 'text-green-700' },
            { label: 'Hidden / Draft', value: counts.draft },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E1E3E5] rounded-xl px-5 py-4">
              <p className="text-xs text-[#6D7175] font-medium mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color || 'text-[#202223]'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white border border-[#E1E3E5] rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-[#E1E3E5] flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D7175]">{Ico.search}</span>
              <input
                value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#C9CCCF] rounded-lg outline-none focus:border-[#1D1D1F] bg-white text-[#202223]"
              />
            </div>
            <div className="flex border border-[#C9CCCF] rounded-lg overflow-hidden">
              {[['all','All'],['active','Active'],['draft','Hidden']].map(([val, lbl]) => (
                <button key={val} onClick={()=>setTab(val)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab===val ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#6D7175] hover:bg-[#F6F6F7]'}`}>
                  {lbl} <span className="ml-1 opacity-60">{counts[val]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delete confirm bar */}
          {deleteId && (
            <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <p className="text-sm text-red-700">Click <strong>Delete</strong> again to confirm permanent removal.</p>
              <button onClick={()=>setDeleteId(null)} className="text-xs text-red-500 underline">Cancel</button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center text-[#6D7175] text-sm">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#6D7175] text-sm mb-3">{products.length === 0 ? 'No products yet.' : 'No products match your search.'}</p>
              {products.length === 0 && (
                <button onClick={onSeed} disabled={seeding}
                  className="px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-lg hover:bg-[#424245] transition-colors disabled:opacity-50">
                  {seeding ? 'Importing…' : 'Import existing products'}
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E3E5] bg-[#F6F6F7]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D7175] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F1]">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#F9F9F9] transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#F6F6F7] border border-[#E1E3E5] shrink-0">
                          {p.image
                            ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🖨️</div>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#202223]">{p.name}</p>
                          <p className="text-xs text-[#6D7175] truncate max-w-[220px]">{p.tagline}</p>
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
                      <button onClick={()=>onToggleActive(p)} className="flex items-center gap-1.5 group/status">
                        <span className={`w-2 h-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-[#C9CCCF]'}`} />
                        <span className={`text-xs font-medium ${p.active ? 'text-green-700' : 'text-[#6D7175]'} group-hover/status:underline`}>
                          {p.active ? 'Active' : 'Hidden'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>onEdit(p)} title="Edit"
                          className="p-1.5 rounded-lg text-[#6D7175] hover:bg-[#E1E3E5] hover:text-[#202223] transition-colors">{Ico.edit}</button>
                        <button onClick={()=>handleDelete(p)} title={deleteId===p.id ? 'Confirm delete' : 'Delete'}
                          className={`p-1.5 rounded-lg transition-colors ${deleteId===p.id ? 'bg-red-100 text-red-600' : 'text-[#6D7175] hover:bg-red-50 hover:text-red-600'}`}>
                          {Ico.trash}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Setup Guide ───────────────────────────────────────────────────────────────
function SetupGuide() {
  const sql = `-- Run this in Supabase → SQL Editor → New Query

create table if not exists products (
  id text primary key,
  name text not null,
  tagline text, description text,
  price integer, price_display text,
  category text, image text, badge text, href text,
  material text, lead text,
  rating numeric(2,1), reviews integer,
  highlights text[], specs jsonb,
  pre_order boolean default false,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table products enable row level security;
drop policy if exists "Allow all" on products;
create policy "Allow all" on products for all to anon using (true) with check (true);`

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <span className="text-amber-500 text-lg shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Database not connected</p>
            <p className="text-xs text-amber-700 mt-0.5">Add your Supabase environment variables to Vercel, then run the SQL below.</p>
          </div>
        </div>
        <div className="bg-white border border-[#E1E3E5] rounded-xl p-6">
          <h2 className="text-base font-bold text-[#202223] mb-4">Run this SQL in Supabase</h2>
          <pre className="bg-[#1D1D1F] text-[#86868B] text-xs p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre">{sql}</pre>
          <p className="text-xs text-[#6D7175] mt-4">Go to <strong>Supabase → SQL Editor → New query</strong>, paste the above, and click <strong>Run</strong>.</p>
        </div>
      </div>
    </div>
  )
}

// ── Root Admin ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('oric_admin') === '1')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'add' | 'edit'
  const [editProduct, setEditProduct] = useState(null)

  const fetchProducts = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true })
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (authed && isConfigured) fetchProducts() }, [authed, fetchProducts])

  // Seed Supabase with static products
  const handleSeed = async () => {
    setSeeding(true)
    const rows = STATIC_PRODUCTS.map(toRow)
    const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' })
    if (error) alert('Seed failed: ' + error.message)
    await fetchProducts()
    setSeeding(false)
  }

  const handleToggleActive = async (p) => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    fetchProducts()
  }

  const handleSaved = () => { setView('list'); fetchProducts() }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div className="min-h-screen flex bg-[#F6F6F7]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-56 bg-[#1D1D1F] flex flex-col fixed h-full z-20 shrink-0">
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
          <button onClick={()=>setView('list')}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${view!=='list' ? 'text-white/60 hover:text-white hover:bg-white/10' : 'bg-white/15 text-white font-medium'}`}>
            📦 Products
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            {Ico.store} View store
          </a>
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={()=>{sessionStorage.removeItem('oric_admin');setAuthed(false)}}
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
            onDelete={fetchProducts}
            onSeed={products.length === 0 ? handleSeed : fetchProducts}
          />
         ) : (
          <ProductForm
            product={editProduct}
            onSave={handleSaved}
            onBack={() => setView('list')}
          />
         )
        }
      </div>
    </div>
  )
}
