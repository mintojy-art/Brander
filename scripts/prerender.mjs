// Prerenders every static route into real HTML files under dist/, so
// non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) see actual page
// content instead of an empty <div id="root">.
//
// NOT wired into the automatic Vercel build (see package.json — this is
// "npm run prerender", not "postbuild"). Vercel's build image can't reliably
// run headless Chromium (playwright install --with-deps needs apt-get,
// which isn't available there), so this is a deliberate manual/local step
// for now: run it locally, commit the generated dist/ output is NOT how
// this is meant to be used long-term — see the README note this script
// prints at the end for the real options.
//
// Usage: npm run build && npm run prerender
import { createServer } from 'http'
import { chromium } from 'playwright'
import handler from 'serve-handler'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { STATIC_ROUTES } from './routes.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const PORT = 4173

if (!existsSync(distDir)) {
  console.error('dist/ not found — run "npm run build" first.')
  process.exit(1)
}

const server = createServer((req, res) =>
  handler(req, res, { public: distDir, rewrites: [{ source: '**', destination: '/index.html' }] })
)

await new Promise((resolve) => server.listen(PORT, resolve))
console.log(`Serving dist/ at http://localhost:${PORT}`)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

let ok = 0
for (const { path } of STATIC_ROUTES) {
  try {
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle', timeout: 30000 })
    // Let any post-networkidle async state settle (e.g. Supabase data merge).
    await page.waitForTimeout(400)
    const html = await page.content()

    const outDir = path === '/' ? distDir : join(distDir, path.replace(/^\//, ''))
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.html'), html)
    console.log(`✓ ${path} → ${join(outDir, 'index.html').replace(distDir, 'dist')}`)
    ok++
  } catch (err) {
    console.error(`✗ ${path} — ${err.message}`)
  }
}

await browser.close()
server.close()

console.log(`\nPrerendered ${ok}/${STATIC_ROUTES.length} routes.`)
console.log(`
Note: this only updates your local dist/ folder. Vercel rebuilds from git
on every push and does NOT run this script automatically — see the
package.json "prerender" script comment for why, and ask before wiring it
into "postbuild" so a failed Chromium launch on Vercel's build image can't
block deploys.
`)
