// Single source of truth for static (non-catalogue-dependent) public routes.
// Used by both gen-sitemap.mjs and prerender.mjs so they can't drift apart.
export const STATIC_ROUTES = [
  { path: '/', freq: 'weekly', priority: '1.0' },
  { path: '/shop', freq: 'weekly', priority: '0.9' },
  { path: '/services', freq: 'monthly', priority: '0.9' },
  { path: '/bobbleheads', freq: 'monthly', priority: '0.8' },
  { path: '/lithophanes', freq: 'monthly', priority: '0.8' },
  { path: '/shop/brander-roller', freq: 'monthly', priority: '0.7' },
  { path: '/about', freq: 'yearly', priority: '0.6' },
  { path: '/refund-policy', freq: 'yearly', priority: '0.4' },
]
