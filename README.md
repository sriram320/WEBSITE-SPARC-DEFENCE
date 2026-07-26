# Sparc Aerotech — website

Marketing site for Sparc Aerotech Pvt Ltd. Frontend only: no backend, API,
database, CMS, auth or payment. Forms validate client-side and show a success
state without transmitting anything.

**Stack** — Next.js (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
GSAP ScrollTrigger · Lenis · Framer Motion · three.js (placeholder models only)

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # static export into out/
npx serve out        # serve the exported site exactly as hosting will
```

---

## Deployment — AWS Amplify

The site is a **static export** (`output: "export"` in `next.config.ts`). Every
route prerenders, so Amplify serves plain files from CDN with no Next.js compute
layer — no cold starts, no per-request cost.

`amplify.yml` in the repo root is picked up automatically and defines:

- build: `npm ci` then `npm run build`
- artifact directory: `out`
- long-lived immutable caching for `/frames`, `/video`, `/posters`, `/_next/static`
- baseline security headers

### Connecting the app

1. Amplify console → **Create new app** → **Host web app** → GitHub → this repo,
   branch `main`.
2. Amplify reads `amplify.yml`; the detected settings should need no edits.
   Confirm the build output directory shows `out`.
3. No environment variables are required.
4. Deploy.

Every push to `main` triggers a rebuild.

> **Build image note** — the build needs Node 20 or newer. If Amplify's default
> image is older, set it under *App settings → Build settings → Build image
> settings*, or add `nvm use 20` as a preBuild command.

---

## Content

All copy and structure live in typed files under `src/data/` — no CMS:

| File | Holds |
|---|---|
| `products.ts` | The eight product records, status lines, subsystem notes |
| `heroOverlays.ts` | The four narrative beats per product on the homepage hero |
| `assets.ts` | Asset resolver — maps names to files by convention |
| `manifest.generated.ts` | Generated; what is actually present in `public/` |

### Copy rules — these are not stylistic

- No buildable specifications, no manufacturing detail, no certified
  performance numbers. Capability reads as design intent.
- No pricing on any defence product. The only defence CTA is
  *"Request a briefing"*.
- **Human authorisation is retained for every engagement decision**, stated
  plainly wherever an effector appears.
- Honest development stage — never imply a fielded or combat-proven system.

---

## Assets

Drop a file into `public/` following the naming convention and it appears on the
site. Nothing needs a code change; missing assets fall back cleanly.

```
public/
  frames/
    scout/       scout_0001.webp … scout_NNNN.webp
    munition/    munition_0001.webp … munition_NNNN.webp
  video/
    scout-tracking.mp4     -> homepage field-proof band
    scout-terrain-1.mp4    -> Scout product page, capability section
    scout-terrain-2.mp4    -> Scout product page, capability section
    scout-working.mp4      -> Scout product page, "see it work"
    munition-working.mp4   -> Munition product page (not yet supplied)
  posters/       one .jpg per video, same base name
  img/           photo-scout.jpg, photo-munition.jpg
```

Frame sequences may be **any length** — the count is read from the generated
manifest, never hardcoded, and the two products differ. Frame 1 must be the
assembled state and the last frame fully exploded.

`npm run manifest` regenerates the manifest; it also runs automatically before
every `dev` and `build`, so pushing a new asset is enough.

`npm run posters` re-cuts poster frames from the videos.

> `npm run frames` reprocesses raw source sequences into `public/frames`. That
> script and the raw sources are kept outside this repo — the processed WebP is
> committed, so building and deploying never needs them.

---

## Structure

```
src/
  app/                     routes: /, /gvl, /products, /products/[slug],
                           /company, /shop, /contact
  components/
    ExplodedHero.tsx       pinned hero: switcher, overlays, hand-off
    ExplodedScrubber.tsx   the canvas that blits the frame sequence
    Telemetry.tsx          persistent bottom rail
    ...
  lib/
    useFrameSequence.ts    progressive frame loading and decode
    useMediaQuery.ts       reduced-motion / breakpoint subscriptions
  data/                    all content
scripts/
  build-manifest.cjs       scans public/, writes the manifest (runs on build)
  build-posters.cjs        cuts poster frames from the videos
```

---

## License

The **source code** in this repository is released under the MIT License — see
[`LICENSE`](./LICENSE).

MIT deliberately covers the code only. It does **not** grant any right to the
brand or to the media in this repository:

- the Sparc Aerotech name, wordmark and visual identity;
- everything under `public/frames/`, `public/video/`, `public/posters/` and
  `public/img/` — product imagery, frame sequences and footage;
- the marketing copy in `src/data/` and in the page components.

All of the above are © Sparc Aerotech Pvt Ltd, all rights reserved. Reuse the
code freely; replace the assets and copy with your own.

---

## Quality floor

Verified on the production build:

- Lighthouse desktop **99–100** performance, **100** accessibility,
  **100** best practices, **100** SEO
- **CLS 0**, no console errors
- axe-core clean (WCAG 2.1 AA) on all nine routes
- Responsive 320–2560px, no horizontal scroll
- Visible keyboard focus throughout
- Full `prefers-reduced-motion`: the scrub becomes a static exploded frame and
  the hero narrative becomes ordinary stacked prose
