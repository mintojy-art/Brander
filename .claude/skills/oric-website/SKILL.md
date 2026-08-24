---
name: oric-website
description: Use when making any changes to oric3d.com (Bangalore 3D-printing studio) — the main public site, admin dashboard, pricing, or design system. This repo is named "brander" for legacy reasons but IS oric3d.com; only /shop/brander-roller is the actual legacy Brander Roller product page. Activates full project context.
---

# oric3d.com — ORIC 3D Printing Studio

This repo (confusingly named "brander") is the Next.js App Router site for **oric3d.com**, a Bangalore 3D-printing studio. The name is historical: an earlier standalone "Brander Roller" stamp-roller product got merged in as one page, `/shop/brander-roller`, which **keeps its own separate dark/red visual identity** and is explicitly out of scope for the main site's design system (see below). Everything else is ORIC.

## Architecture conventions

- Server Components in `src/app/(site)/**/page.jsx` call async loaders in `src/lib/data/*.js`, then pass data as props to a paired Client Component (e.g. `HomeClient.jsx`, `ShopClient.jsx`).
- Admin dashboard lives entirely in one file, `src/components/AdminClient.jsx` (~4000 lines) — a single `view` state string drives which section renders (`'list'`, `'pricing'`, `'insights'`, etc.), no router. Shared UI atoms (`Label`, `Input`, `Textarea`, `Select`, `Toggle`, `Card`, `CardTitle`, `Ico` icon map) are defined once near the top of that file.
- **Critical SSR gotcha**: never call `useSearchParams()` in a Client Component that needs to render on the server for a URL-filtered page (e.g. `?cat=`) — it forces the whole component to bail to client-only rendering via Suspense, making the page nearly empty to crawlers even though it looks fine in a browser. Read the query param server-side in `page.jsx` via the (Promise-typed, must-be-awaited) `searchParams` prop, pass it down as a plain prop, and only use `useRouter().push()` to update the URL on interaction. This bit us for real on `/shop` and `/blog` once already.
- Verify a page is actually server-rendering real content (not just an RSC hydration payload) by stripping `<script>` tags before counting/inspecting text — the inline RSC JSON payload will otherwise fool a naive `curl | grep`.

## Y2K "Millennium Silver" design system

The whole public site (not admin, not `/shop/brander-roller`) uses a chrome/glossy Y2K aesthetic with one bold orange accent. Defined in `src/app/globals.css` under `@theme inline` + a dedicated utility-class block:

- Color tokens: `--color-chrome-100..400` (silver gradient stops), `--color-electric-400/500/600` (the accent — despite the "electric" name these are now orange hexes, `#FFA35C`/`#F37121`/`#C94E00`), `--color-lime-400/500` (badge accent).
- `.y2k-chrome-surface` / `.y2k-accent-surface` / `.y2k-dark-surface` — the three glossy gradient-fill surface treatments (light/orange/dark). Apply directly to buttons, cards, panels.
- `.y2k-lift` — translateY on hover, safe on any card.
- `.y2k-lime-glow` — thin lime ring, for "Popular"/"New" style badges.
- `.y2k-shine` — a diagonal shine-sweep pseudo-element on `:hover`/`:focus-visible`. **Only ever put this on actual small buttons/pills, never on cards, banners, or large tiles.** Root-caused bug: since `:hover` fires whenever the cursor's screen position ends up over an element — including when the *page scrolls* a large element under a stationary cursor — putting `.y2k-shine` on big elements caused a diagonal "glow" to flash across the screen mid-scroll, which took a long debugging session (video-pixel extraction, DOM instrumentation, a temporary CSS bisect via a disabled `@media` block) to actually pin down. Small buttons are far less likely to be under the cursor during a scroll, which is why the fix was scoping it down rather than removing it.
- Orbitron (`next/font/google`, `--font-orbitron`) for hero/display headlines, applied via inline `style={{ fontFamily: 'var(--font-orbitron)' }}` — not a Tailwind utility class (confirmed this codebase's custom font tokens don't reliably generate Tailwind utilities).
- Icons: `<Y2kIcon emoji="🖨️" size={24} className="text-[#F37121]" />` (`src/components/Y2kIcon.jsx` + `src/data/y2kIcons.js`) maps plain-emoji characters to **Lucide** icon components (not literal emoji glyphs, not raster images — an earlier Fluent-Emoji-3D-image version was replaced with Lucide per explicit user request). Since Lucide icons use `currentColor`/`stroke`, always pass an explicit `className` with a text color — the fallback for an unmapped emoji is the literal character, sized via inline `fontSize`.

## Admin-editable pricing pattern

Established for both the print configurator and the bobblehead configurator (`src/components/AdminClient.jsx`, "💰 Pricing" section): a **singleton row** table (`id int primary key default 1`, one row only) holding the actual ₹ figures, RLS = public `select`, admin (`to authenticated`) `write`. The consuming public component (`PrintConfigurator.jsx`, `BobbleheadDetailClient.jsx`) fetches it client-side on mount with a hardcoded `DEFAULT_*` fallback object that's kept byte-for-byte in sync with the admin form's own defaults — the calculator must never break just because the table doesn't exist yet or Supabase is unreachable. New tables follow the same "setup SQL banner" pattern (see below) rather than a migration tool.

## No-migration-tool convention

There's no formal DB migration system. Schema changes ship as a `*_SETUP_SQL` template-literal constant + a matching `*SetupBanner` component in `AdminClient.jsx`, shown when a fetch/save errors in a way that indicates the table's missing. **The real error message Supabase/PostgREST returns for a missing table is `"Could not find the table '...' in the schema cache"` — check for `'schema cache'`, not `'does not exist'`** (confirmed empirically against the live project; an early version of this check used only `'does not exist'` and silently never fired). The banner has a "Copy SQL" button; the admin pastes it into Supabase → SQL Editor once. RLS pattern: `for select using (true)` for public-read tables, `for insert with check (true)` (no `to authenticated`) for public-write-only tables like comments/page-view logs, `for all to authenticated using (true) with check (true)` for admin-managed tables.

## Git workflow

Never `git add -A`. Stage only the specific files actually touched (check `git status` first — this repo has several long-lived untracked files at the root, like an unrelated uploader app, that must never get swept in). Never push without an explicit instruction (e.g. "push it") — implementing/building doesn't imply permission to push. Commit messages end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## Testing limitations & verification workflow

No `/admin` login credentials are available — admin-only flows can't be click-tested end-to-end in a browser. Compensate by: `npm run build` (must be clean), and — since `playwright` isn't a project dependency — `npm install --no-save playwright && npx playwright install chromium` for a one-off local verification server (`npm run start` on port 3000, or a second port if the user's own `npm run dev` is already running there), then `npm uninstall playwright --no-save` afterward to leave `package.json`/`package-lock.json` untouched. For public-facing Supabase-backed features, you *can* verify real backend behavior directly — this project's `.env` has working `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, so a quick `node -e "..."` script against the live Supabase project (table contents, actual error messages) is legitimate and has caught real bugs (e.g. the schema-cache error-message mismatch above).

## Local preview

The user prefers to run `npm run dev` themselves rather than have a background dev server started on their behalf for their own review — offer plain terminal instructions instead. Starting a temporary server for *your own* automated verification (screenshots, Supabase checks) is a different, already-established thing and is fine.
