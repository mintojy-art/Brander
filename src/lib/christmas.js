// Christmas decor = every product in a home page "products" section whose
// heading mentions Christmas (admin-controlled via the product form's
// "Home page sections" ticks), plus any product with Christmas/Xmas in its
// name. Drives /christmas-decor and the Christmas-specific product SEO.
const XMAS = /christmas|xmas/i

export function christmasProducts(products = [], sections = []) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const ids = sections
    .filter((s) => s.kind === 'products' && s.visible !== false && XMAS.test(s.title || ''))
    .flatMap((s) => s.product_ids || [])
  for (const p of products) if (XMAS.test(p.name || '')) ids.push(p.id)
  return [...new Set(ids)].map((id) => byId.get(id)).filter(Boolean)
}

export const isChristmasProduct = (product, products, sections) =>
  !!product && christmasProducts(products, sections).some((p) => p.id === product.id)
