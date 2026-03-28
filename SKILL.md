---
name: brander
description: Use when making any changes to the Brander Roller pre-launch waitlist website — components, copy, stats, design lab, form, FAQ, or deployment. Activates full project context.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Brander Roller — Pre-Launch Waitlist Website

You are working on the pre-launch website for the **Brander Roller** — a 15mm handheld stamp roller product made in India. The site collects waitlist signups via Google Sheets. Apply these rules to every change.

## Product Specs
- **Product:** Brander Roller — handheld stamp roller
- **Print mechanism:** 15mm rubber roller, laser-etched custom pattern
- **Text length:** 30cm
- **Ring size available:** 19 CM (circumference) — 10 CM and 30 CM are "upon request"
- **Surface types:** 6+ (cardboard, kraft paper, fabric, wood, painted walls, plastic)
- **Empty weight:** 210g
- **Custom response time:** 24h
- **Early bird price:** RS 1080/- (price increases at launch)
- **Made in:** India
- **WhatsApp contact:** +91 83101 94953 → `https://wa.me/918310194953`

## Project Stack
- **React 18 + Vite** (JSX, no TypeScript)
- **Tailwind CSS** for styling
- **Framer Motion** for animations and scroll-triggered reveals
- **Three.js** for 3D cylinder preview in Design Lab
- **GitHub repo:** `mintojy-art/Brander` (branch: `main`)
- **Hosting:** Vercel (auto-deploy on push to main)

## Brand Theme
| Use | Value |
|-----|-------|
| Primary bg | `#0d0f14` / `#0a0a0c` / `bg-[#0f1012]` |
| Dark card bg | `#111318` |
| Accent / CTA | `red-600` / `#dc2626` |
| Accent text | `red-400` / `red-500` |
| Body text | `gray-400` / `gray-300` |
| Muted text | `gray-500` / `gray-600` |
| Borders | `border-gray-800` / `border-gray-900` |
| Red glow | `shadow-[0_0_24px_rgba(220,38,38,0.3)]` |

**No light mode.** All backgrounds are dark. Accent is always red, never amber or blue.

## Component Map (src/components/)
| File | Purpose |
|------|---------|
| [Navbar.jsx](src/components/Navbar.jsx) | Nav with "Join Waitlist" red CTA, #design-lab link. Accepts `onJoinWaitlist` prop |
| [Hero.jsx](src/components/Hero.jsx) | Hero section. CTA scrolls to #waitlist. Accepts `onJoinWaitlist` prop |
| [StatsBar.jsx](src/components/StatsBar.jsx) | 4 animated count-up stats: 30cm Text Length, 6+ Surface Types, 210g Weight, 24h Response |
| [MarqueeTicker.jsx](src/components/MarqueeTicker.jsx) | Scrolling ticker. Pass `reverse` prop for second instance |
| [VideoSection.jsx](src/components/VideoSection.jsx) | YouTube embed with autoplay + loop |
| [Features.jsx](src/components/Features.jsx) | Product feature highlights |
| [WhoItsFor.jsx](src/components/WhoItsFor.jsx) | 3 audience tiles: Manufacturers, Small Businesses, Artists |
| [Gallery.jsx](src/components/Gallery.jsx) | 4-column parallax image grid (currently stock photos — needs real product images) |
| [DesignLab.jsx](src/components/DesignLab.jsx) | Interactive stamp design tool with Three.js 3D preview |
| [Specs.jsx](src/components/Specs.jsx) | Technical specifications section |
| [FAQ.jsx](src/components/FAQ.jsx) | 5-question accordion FAQ. WhatsApp CTA at bottom |
| [WaitlistSection.jsx](src/components/WaitlistSection.jsx) | Google Sheets waitlist form with design data capture |
| [Footer.jsx](src/components/Footer.jsx) | Footer — "Made in India" |

## App.jsx Section Order
1. Navbar
2. Hero
3. StatsBar
4. MarqueeTicker
5. VideoSection
6. Features
7. WhoItsFor
8. MarqueeTicker (reverse)
9. Gallery
10. DesignLab
11. Specs
12. FAQ
13. WaitlistSection
14. Footer

## StatsBar — current values
```js
{ value: 30,  unit: 'cm', label: 'Text Length'   }
{ value: 6,   unit: '+',  label: 'Surface Types'  }
{ value: 210, unit: 'g',  label: 'Empty Weight'   }
{ value: 24,  unit: 'h',  label: 'Custom Response'}
```
**Bug fixed:** initialize `useState(value)` not `useState(0)` so numbers always show. Reset to 0 inside `useInView` effect before animation.

## DesignLab (DesignLab.jsx)
- Single **offscreen canvas** (1024×220px) shared between 2D editor and Three.js `CanvasTexture`
- Call `texture.needsUpdate = true` on every design state change
- Three.js scene: bg `#0d0f14`, red point light, fog, rim light
- Ring sizes: `[{label:'10 CM', available:false}, {label:'19 CM', available:true}, {label:'30 CM', available:false}]`
  - Unavailable sizes shown greyed with "on request" label
- Saves design state to `localStorage('brander_design')` as JSON on every change
- Thumbnail saved to `localStorage('brander_design_preview')` as 200×44px base64 JPEG
- CTA button scrolls to `#waitlist`
- Spec panel shows: **Text Length · 30 cm**

## WaitlistSection — Google Sheets Integration
- **Google Apps Script URL:** `https://script.google.com/macros/s/AKfycbxAXWbtjWvWXQTTVIR8pilVJaOgyvRrcjx0W4Kwo_ufDc1qPNZgynLeKRvl2kpnV6AK/exec`
- **Method:** GET + URLSearchParams (NOT POST — Google Apps Script 302 redirect strips POST body)
- **Mode:** `no-cors`
- **Fields sent:** name, email, phone, readyToPay, designText, designFont, designStyle, designScale, designRingSize, designPrintMode, designBridging, designHasImage, designPreview (base64 JPEG)
- Design data read from `localStorage` at submit time (bridge between DesignLab and WaitlistSection — no prop drilling)
- Shows "Design captured ✓" badge if localStorage has design data
- Apps Script uses `sheet.insertImage(blob, col, row)` — does NOT need Drive scope, only Spreadsheet scope

## FAQ Section (FAQ.jsx)
5 questions — accordion with AnimatePresence:
1. What ink/marker does it use?
2. How do I load a custom design?
3. Does it work on different surfaces?
4. How long until I receive it?
5. What if I want a different pattern?

WhatsApp link: `https://wa.me/918310194953`

## Hero Image
- File: `public/product.jpg` (in `public/` folder, NOT project root)
- Served as `/product.jpg` — fallback path must start with `/`

## Key Patterns

### Scroll to waitlist
```jsx
const scrollToWaitlist = () =>
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
```
Pass as `onJoinWaitlist` prop to Navbar and Hero.

### Section header pattern
```jsx
<p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Label</p>
<h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Heading</h2>
```

### Card style
```jsx
<div className="rounded-2xl border border-gray-800/80 overflow-hidden"
  style={{ background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)' }}>
```

### Background grid overlay
```jsx
<div className="absolute inset-0 pointer-events-none" style={{
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
}} />
```

### Red glow radial bg
```jsx
style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(220,38,38,0.07) 0%, transparent 70%)' }}
```

## Deployment
- **Auto-deploy:** Push to `main` → Vercel redeploys automatically
- **Build check:** `npm run build` — must show `✓ built in X.XXs` with no errors before pushing
- **Image location:** All static assets go in `public/` — referenced as `/filename` in JSX

## When Making Changes
1. Always read the target file before editing
2. Keep changes minimal — don't refactor unrelated code
3. Match existing dark theme patterns exactly
4. Run `npm run build` to verify no errors before committing
5. Commit with clear message, then `git push origin main`
6. Vercel auto-deploys — no manual trigger needed
