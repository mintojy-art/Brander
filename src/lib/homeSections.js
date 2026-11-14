// Shared by the home page (rendering) and the admin dashboard (editing).
// Built-in sections keep their layout in code; only their wording, order and
// visibility come from the `home_sections` table. Empty text fields fall back
// to these defaults, so clearing a field in the admin restores the original.

export const BUILTIN_SECTIONS = {
  trust: {
    label: 'Trust badges strip',
    fields: [],
    defaults: {},
  },
  bestsellers: {
    label: 'Best Sellers & New Arrivals',
    fields: ['eyebrow', 'title', 'title2'],
    fieldLabels: { title2: 'New Arrivals heading' },
    defaults: { eyebrow: 'From Our Workshop', title: 'Best Sellers', title2: 'New Arrivals' },
  },
  bobbleheads: {
    label: 'Bobbleheads — Shop by Occasion',
    fields: ['eyebrow', 'title'],
    defaults: { eyebrow: 'Bobbleheads', title: 'Shop by Occasion' },
  },
  mask: {
    label: 'Mask Studio',
    fields: ['eyebrow', 'title', 'subtitle'],
    defaults: {
      eyebrow: 'Mask Studio',
      title: 'Behind Every Mask, A Story.',
      subtitle: 'Hand-finished cosplay and display masks, sculpted and printed one piece at a time.',
    },
  },
  services: {
    label: 'Services grid',
    fields: ['eyebrow', 'title'],
    defaults: { eyebrow: 'What We Make', title: '9 Services.\nOne Workshop.' },
  },
  process: {
    label: 'How It Works',
    fields: ['eyebrow', 'title'],
    defaults: { eyebrow: 'The Process', title: 'How It Works' },
  },
  configurator: {
    label: '3D print price calculator',
    fields: ['eyebrow', 'title', 'subtitle'],
    defaults: {
      eyebrow: 'Instant Quote',
      title: 'Configure Your Print',
      subtitle: 'Upload your STL, pick your material and settings, get an instant price estimate.',
    },
  },
  testimonials: {
    label: 'Customer testimonials',
    fields: ['eyebrow', 'title'],
    defaults: { eyebrow: 'What Customers Say', title: 'Loved by our customers.' },
  },
  instagram: {
    label: 'Instagram feed',
    fields: ['eyebrow', 'title'],
    defaults: { eyebrow: 'Follow Along', title: '@oric3d on Instagram' },
  },
  faq: {
    label: 'FAQ',
    fields: ['eyebrow', 'title'],
    defaults: { eyebrow: 'Help', title: 'Questions, answered.' },
  },
  statement: {
    label: 'Closing banner',
    fields: ['title', 'title2', 'subtitle'],
    fieldLabels: { title: 'Heading (white line)', title2: 'Heading (orange line)' },
    defaults: {
      title: 'Every print.',
      title2: 'Crafted to spec.',
      subtitle: 'FDM printing with precision-tuned profiles. Post-processed and quality-checked before dispatch. No exceptions.',
    },
  },
}

export const DEFAULT_ORDER = [
  'trust', 'bestsellers', 'bobbleheads', 'mask', 'services', 'process',
  'configurator', 'testimonials', 'instagram', 'faq', 'statement',
]

export const FIELD_LABELS = {
  eyebrow: 'Small label above heading',
  title: 'Heading',
  title2: 'Second heading',
  subtitle: 'Description',
}

export const BACKGROUNDS = [
  { value: 'light', label: 'White' },
  { value: 'grey', label: 'Light grey' },
  { value: 'dark', label: 'Dark' },
]

export const defaultSections = () =>
  DEFAULT_ORDER.map((key, i) => ({
    id: key,
    kind: 'builtin',
    builtin_key: key,
    visible: true,
    sort_order: i,
  }))

// Merges a built-in row's overrides onto its defaults; blank → default.
export function sectionText(section) {
  const defaults = BUILTIN_SECTIONS[section.builtin_key]?.defaults || {}
  const pick = (k) => (section[k] && String(section[k]).trim()) || defaults[k] || ''
  return { eyebrow: pick('eyebrow'), title: pick('title'), title2: pick('title2'), subtitle: pick('subtitle') }
}

// Button links are admin-entered and rendered as hrefs, so only allow web
// links, site-relative paths and WhatsApp/phone/email — never javascript:.
export function safeHref(url) {
  const u = String(url || '').trim()
  if (/^https?:\/\//i.test(u)) return u
  if (/^\/(?!\/)/.test(u)) return u
  if (/^(mailto:|tel:)/i.test(u)) return u
  return null
}
