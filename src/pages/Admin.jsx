import { useState, useEffect } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'oric@admin'

const CATEGORIES = ['Tools', 'Figurines', 'Cosplay', 'Accessories', 'Custom', 'Idols', 'Prototyping', 'Manufacturing', 'Toys']

const EMPTY_PRODUCT = {
  id: '', name: '', tagline: '', description: '', price: '',
  price_display: '', category: 'Custom', image: '', badge: '',
  material: '', lead: '', rating: '', reviews: '',
  highlights: '', specs: '', pre_order: false, active: true, sort_order: 0,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function parseHighlights(str) {
  return str.split('\n').map(s => s.trim()).filter(Boolean)
}

function parseSpecs(str) {
  const obj = {}
  str.split('\n').forEach(line => {
    const i = line.indexOf(':')
    if (i > 0) obj[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  })
  return obj
}

function serializeHighlights(arr) {
  return Array.isArray(arr) ? arr.join('\n') : (arr || '')
}

function serializeSpecs(obj) {
  if (!obj || typeof obj !== 'object') return ''
  return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n')
}

// ── Icon components ───────────────────────────────────────────────────────────
function IconPlus() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IconEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
}
function IconLogout() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('oric_admin', '1')
      onLogin()
    } else {
      setError('Incorrect password. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#D2D2D7] w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1D1D1F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <h1 className="text-xl font-bold text-[#1D1D1F]">ORIC Admin</h1>
          <p className="text-sm text-[#86868B] mt-1">Sign in to manage your shop</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError('') }}
            placeholder="Admin password"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] text-sm text-[#1D1D1F] outline-none focus:border-[#1D1D1F] transition-colors"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-xl hover:bg-[#424245] transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="text-xs text-[#86868B] text-center mt-6">
          Default password: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded font-mono">oric@admin</code>
        </p>
      </div>
    </div>
  )
}

// ── Setup Guide (when Supabase not configured) ────────────────────────────────
function SetupGuide() {
  const sql = `create table products (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  price integer,
  price_display text,
  category text,
  image text,
  badge text,
  href text,
  material text,
  lead text,
  rating numeric(2,1),
  reviews integer,
  highlights text[],
  specs jsonb,
  pre_order boolean default false,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Allow public read
alter table products enable row level security;
create policy "Public read" on products for select using (true);
create policy "Authenticated write" on products for all using (auth.role() = 'authenticated');`

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-xl font-bold text-[#1D1D1F] mb-2">Connect to Supabase</h2>
      <p className="text-sm text-[#86868B] mb-6">Follow these steps to enable the live database for your shop.</p>

      <div className="space-y-6">
        {[
          { n: 1, title: 'Create a free Supabase project', body: 'Go to supabase.com → New project. It\'s free for small projects.' },
          { n: 2, title: 'Run this SQL in the SQL Editor', body: null, code: sql },
          { n: 3, title: 'Copy your project URL and anon key', body: 'Go to Settings → API → copy the Project URL and anon public key.' },
          { n: 4, title: 'Add to Vercel environment variables', body: 'In Vercel → Your project → Settings → Environment Variables, add:' , env: true },
        ].map(step => (
          <div key={step.n} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white text-sm font-bold flex items-center justify-center shrink-0">
              {step.n}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1D1D1F] mb-1">{step.title}</p>
              {step.body && <p className="text-xs text-[#86868B]">{step.body}</p>}
              {step.code && (
                <pre className="mt-2 bg-[#1D1D1F] text-[#86868B] text-xs p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre">
                  {step.code}
                </pre>
              )}
              {step.env && (
                <div className="mt-2 space-y-1">
                  <code className="block bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 rounded-lg font-mono">VITE_SUPABASE_URL = https://xxxx.supabase.co</code>
                  <code className="block bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 rounded-lg font-mono">VITE_SUPABASE_ANON_KEY = eyJhbGciOi...</code>
                  <code className="block bg-[#F5F5F7] text-[#1D1D1F] text-xs px-3 py-2 rounded-lg font-mono">VITE_ADMIN_PASSWORD = your_password</code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-[#F5F5F7] rounded-2xl">
        <p className="text-xs text-[#86868B]">
          After adding env vars, redeploy on Vercel and refresh this page. Your shop will then pull products live from the database.
        </p>
      </div>
    </div>
  )
}

// ── Product Form (slide-over) ─────────────────────────────────────────────────
function ProductForm({ product, onSave, onClose }) {
  const isNew = !product?.id || product._isNew
  const [form, setForm] = useState(() => {
    if (!product || product._isNew) return { ...EMPTY_PRODUCT }
    return {
      ...product,
      price: product.price ?? '',
      highlights: serializeHighlights(product.highlights),
      specs: serializeSpecs(product.specs),
    }
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Name is required'); return }
    setSaving(true)
    setErr('')

    const id = isNew ? slugify(form.name) : form.id
    const payload = {
      id,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      price: form.price !== '' ? parseInt(form.price) : null,
      price_display: form.price_display.trim() || (form.price ? `₹${parseInt(form.price).toLocaleString('en-IN')}` : 'Get Quote'),
      category: form.category,
      image: form.image.trim() || null,
      badge: form.badge.trim() || null,
      href: form.href?.trim() || `/shop/${id}`,
      material: form.material.trim(),
      lead: form.lead.trim(),
      rating: form.rating !== '' ? parseFloat(form.rating) : null,
      reviews: form.reviews !== '' ? parseInt(form.reviews) : null,
      highlights: parseHighlights(form.highlights),
      specs: parseSpecs(form.specs),
      pre_order: form.pre_order,
      active: form.active,
      sort_order: parseInt(form.sort_order) || 0,
    }

    const { error } = isNew
      ? await supabase.from('products').insert(payload)
      : await supabase.from('products').update(payload).eq('id', id)

    setSaving(false)
    if (error) { setErr(error.message); return }
    onSave()
  }

  const Field = ({ label, hint, children }) => (
    <div>
      <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">{label}
        {hint && <span className="ml-1 text-[#86868B] font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  )

  const Input = (props) => (
    <input
      {...props}
      className="w-full px-3 py-2 text-sm border border-[#D2D2D7] rounded-lg outline-none focus:border-[#1D1D1F] transition-colors text-[#1D1D1F] bg-white"
    />
  )

  const Textarea = (props) => (
    <textarea
      {...props}
      className="w-full px-3 py-2 text-sm border border-[#D2D2D7] rounded-lg outline-none focus:border-[#1D1D1F] transition-colors text-[#1D1D1F] bg-white resize-none"
    />
  )

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2D2D7] sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-[#1D1D1F]">{isNew ? 'Add New Product' : 'Edit Product'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center text-[#86868B] text-lg">×</button>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-6 space-y-5">
          {/* Basic info */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Basic Info</p>

            <Field label="Product Name *">
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Batman Figurine" />
            </Field>

            <Field label="Tagline" hint="(short one-liner)">
              <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Collector-grade. Fan-approved." />
            </Field>

            <Field label="Description">
              <Textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full product description..." />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D2D2D7] rounded-lg outline-none focus:border-[#1D1D1F] text-[#1D1D1F] bg-white"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Badge" hint="(optional)">
                <Input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="e.g. New" />
              </Field>
            </div>
          </div>

          <div className="border-t border-[#F5F5F7]" />

          {/* Pricing */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Pricing</p>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₹)" hint="(leave blank for quote)">
                <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 899" />
              </Field>
              <Field label="Display Text" hint="(auto if blank)">
                <Input value={form.price_display} onChange={e => set('price_display', e.target.value)} placeholder="e.g. ₹899" />
              </Field>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('pre_order', !form.pre_order)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.pre_order ? 'bg-[#1D1D1F]' : 'bg-[#D2D2D7]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.pre_order ? 'left-5' : 'left-0.5'}`} />
              </button>
              <span className="text-sm text-[#424245]">Pre-Order</span>
            </div>
          </div>

          <div className="border-t border-[#F5F5F7]" />

          {/* Media & Details */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Media & Details</p>

            <Field label="Image filename" hint="(put file in /public folder)">
              <Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="e.g. /batman-figurine.jpg" />
              {form.image && (
                <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-[#F5F5F7] border border-[#D2D2D7]">
                  <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                </div>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Material">
                <Input value={form.material} onChange={e => set('material', e.target.value)} placeholder="e.g. PLA" />
              </Field>
              <Field label="Lead Time">
                <Input value={form.lead} onChange={e => set('lead', e.target.value)} placeholder="e.g. 5–7 business days" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating" hint="(e.g. 4.8)">
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.8" />
              </Field>
              <Field label="Review count">
                <Input type="number" value={form.reviews} onChange={e => set('reviews', e.target.value)} placeholder="28" />
              </Field>
            </div>
          </div>

          <div className="border-t border-[#F5F5F7]" />

          {/* Highlights */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Highlights</p>
            <Field label="One highlight per line">
              <Textarea
                rows={5}
                value={form.highlights}
                onChange={e => set('highlights', e.target.value)}
                placeholder={"Fine 0.1mm layer height\nPre-sanded finish\nIncludes display base"}
              />
            </Field>
          </div>

          <div className="border-t border-[#F5F5F7]" />

          {/* Specs */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Specifications</p>
            <Field label="Format: Label: Value (one per line)">
              <Textarea
                rows={6}
                value={form.specs}
                onChange={e => set('specs', e.target.value)}
                placeholder={"Height: 18cm\nMaterial: PLA\nLayer Height: 0.1mm\nLead Time: 5–7 business days"}
              />
            </Field>
          </div>

          <div className="border-t border-[#F5F5F7]" />

          {/* Settings */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Settings</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sort Order" hint="(lower = first)">
                <Input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="0" />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('active', !form.active)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-[#1D1D1F]' : 'bg-[#D2D2D7]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
              </button>
              <span className="text-sm text-[#424245]">Active (visible in shop)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D2D2D7] sticky bottom-0 bg-white">
          {err && <p className="text-xs text-red-500 mb-3">{err}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#D2D2D7] text-sm font-medium text-[#424245] rounded-xl hover:bg-[#F5F5F7] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-xl hover:bg-[#424245] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isNew ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Products Table ────────────────────────────────────────────────────────────
function ProductsTable({ products, onEdit, onToggleActive, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#D2D2D7]">
            <th className="px-4 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Product</th>
            <th className="px-4 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Price</th>
            <th className="px-4 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5F5F7]">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-[#F5F5F7] transition-colors">
              {/* Product */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#E8E8ED] shrink-0">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🖨️</div>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1D1D1F] leading-snug">{p.name}</p>
                    <p className="text-xs text-[#86868B] truncate max-w-[200px]">{p.tagline}</p>
                  </div>
                </div>
              </td>
              {/* Category */}
              <td className="px-4 py-3">
                <span className="text-xs px-2.5 py-1 bg-[#F5F5F7] rounded-full text-[#424245] font-medium">{p.category}</span>
              </td>
              {/* Price */}
              <td className="px-4 py-3">
                <span className="text-sm font-semibold text-[#1D1D1F]">{p.price_display || (p.price ? `₹${p.price}` : 'Get Quote')}</span>
              </td>
              {/* Status */}
              <td className="px-4 py-3">
                <button onClick={() => onToggleActive(p)} className="flex items-center gap-1.5 group">
                  <span className={`w-2 h-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-[#D2D2D7]'}`} />
                  <span className={`text-xs font-medium ${p.active ? 'text-green-700' : 'text-[#86868B]'}`}>
                    {p.active ? 'Active' : 'Hidden'}
                  </span>
                </button>
              </td>
              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(p)}
                    className="p-2 rounded-lg text-[#424245] hover:bg-[#E8E8ED] hover:text-[#1D1D1F] transition-colors"
                    title="Edit"
                  >
                    <IconEdit />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="p-2 rounded-lg text-[#424245] hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <IconTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-sm">No products yet. Add your first product above.</p>
        </div>
      )}
    </div>
  )
}

// ── Stats Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5">
      <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#1D1D1F]">{value}</p>
      {sub && <p className="text-xs text-[#86868B] mt-1">{sub}</p>}
    </div>
  )
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('oric_admin') === '1')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchProducts = async () => {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (authed && isConfigured) fetchProducts()
  }, [authed])

  const handleLogout = () => {
    sessionStorage.removeItem('oric_admin')
    setAuthed(false)
  }

  const handleEdit = (p) => { setEditProduct(p); setShowForm(true) }
  const handleAdd = () => { setEditProduct({ _isNew: true }); setShowForm(true) }

  const handleSaved = () => { setShowForm(false); fetchProducts() }

  const handleToggleActive = async (p) => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    fetchProducts()
  }

  const handleDelete = async (p) => {
    if (deleteConfirm?.id === p.id) {
      await supabase.from('products').delete().eq('id', p.id)
      setDeleteConfirm(null)
      fetchProducts()
    } else {
      setDeleteConfirm(p)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const activeCount = products.filter(p => p.active).length
  const pricedCount = products.filter(p => p.price).length

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">

      {/* ── Sidebar ── */}
      <div className="w-56 bg-[#1D1D1F] flex flex-col shrink-0 fixed h-full z-10">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#1D1D1F] font-bold text-sm">O</span>
            </div>
            <span className="text-white font-bold text-sm">ORIC Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 py-2 rounded-xl bg-white/10">
            <span className="text-white text-sm font-medium">📦 Products</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm transition-colors"
          >
            🌐 View Live Site
          </a>
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm transition-colors"
          >
            <IconLogout /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 ml-56">
        {!isConfigured ? (
          <div className="p-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <span className="text-amber-500 text-lg shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Supabase not connected</p>
                <p className="text-xs text-amber-700 mt-0.5">Connect a database to manage products live. Follow the setup guide below.</p>
              </div>
            </div>
            <SetupGuide />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-[#D2D2D7] px-8 py-5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1D1D1F]">Products</h1>
                <p className="text-xs text-[#86868B] mt-0.5">{products.length} total · {activeCount} active</p>
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-xl hover:bg-[#424245] transition-colors"
              >
                <IconPlus /> Add Product
              </button>
            </div>

            {/* Stats */}
            <div className="px-8 py-6 grid grid-cols-3 gap-4">
              <StatCard label="Total Products" value={products.length} sub="in database" />
              <StatCard label="Active in Shop" value={activeCount} sub="visible to customers" />
              <StatCard label="Priced Items" value={pricedCount} sub={`${products.length - pricedCount} on quote`} />
            </div>

            {/* Delete confirm banner */}
            {deleteConfirm && (
              <div className="mx-8 mb-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-center justify-between">
                <p className="text-sm text-red-700">Click delete again to confirm removing <strong>{deleteConfirm.name}</strong></p>
                <button onClick={() => setDeleteConfirm(null)} className="text-xs text-red-500 underline">Cancel</button>
              </div>
            )}

            {/* Table */}
            <div className="mx-8 mb-8 bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
              {loading ? (
                <div className="py-20 text-center text-[#86868B] text-sm">Loading products…</div>
              ) : (
                <ProductsTable
                  products={products}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Slide-over form ── */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onSave={handleSaved}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
