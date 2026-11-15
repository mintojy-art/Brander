import { getProducts } from '@/lib/data/products'
import { getHomeSections } from '@/lib/data/homeSections'
import { christmasProducts } from '@/lib/christmas'
import { SITE } from '@/lib/seo'

// Google Merchant Center product feed (free Shopping listings).
// Add https://www.oric3d.com/merchant-feed.xml in Merchant Center →
// Products → Feeds as a "scheduled fetch". Only active products that have a
// fixed price and a photo are listed — "Get Quote" items can't be shopped.
export const revalidate = 3600

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const abs = (u) => (u?.startsWith('http') ? u : `${SITE}${u?.startsWith('/') ? '' : '/'}${u}`)

export async function GET() {
  const [products, sections] = await Promise.all([getProducts(), getHomeSections()])
  const xmasIds = new Set(christmasProducts(products, sections).map((p) => p.id))

  const items = products
    .filter((p) => p.price && p.image && p.href?.startsWith('/shop/'))
    .map((p) => {
      const xmas = xmasIds.has(p.id)
      const desc = (p.description || p.tagline || `${p.name}, 3D printed and hand-finished by ORIC in Bangalore.`).slice(0, 4900)
      const extra = (p.images || []).filter((u) => u && u !== p.image).slice(0, 10)
      return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name.slice(0, 150))}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(`${SITE}${p.href}`)}</g:link>
      <g:image_link>${esc(abs(p.image))}</g:image_link>
${extra.map((u) => `      <g:additional_image_link>${esc(abs(u))}</g:additional_image_link>`).join('\n')}
      <g:availability>in_stock</g:availability>
      <g:price>${Number(p.price).toFixed(2)} INR</g:price>
      <g:brand>ORIC</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(xmas ? `Christmas Decor > ${p.category}` : p.category)}</g:product_type>
${xmas ? '      <g:google_product_category>Home &amp; Garden &gt; Decor &gt; Seasonal &amp; Holiday Decorations</g:google_product_category>\n' : ''}      <g:custom_label_0>${xmas ? 'christmas' : 'regular'}</g:custom_label_0>
    </item>`
    })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>ORIC — 3D printed products</title>
    <link>${SITE}</link>
    <description>3D printed products from ORIC, Bangalore</description>
${items.join('\n')}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
