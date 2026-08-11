// Regenerates public/sitemap.xml from a single source of truth so it can
// never silently drift out of sync with the real routes again. Runs as a
// "prebuild" npm script — see package.json.
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { STATIC_ROUTES } from './routes.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const today = new Date().toISOString().slice(0, 10)
const base = 'https://www.oric3d.com'

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_ROUTES.map(({ path, freq, priority }) => `  <url>
    <loc>${base}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), xml)
console.log(`sitemap.xml written — ${STATIC_ROUTES.length} urls, ${today}`)
