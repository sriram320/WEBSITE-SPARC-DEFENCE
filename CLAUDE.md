# Sparc Aerotech Website — Project Rules

Frontend-only marketing site, Indian defence-tech.
Concept: haute-horlogerie exploded scroll-scrub on REAL product frames + Sparc HUD.

> `BUILD_BRIEF.md` (the full spec, referenced by section below) and `FRAMES.md`
> (asset provenance and the frame-conditioning pipeline) are kept with the
> project in private storage, not in this public repo. Ask the maintainer if you
> need them.

> **Next.js version:** this project runs Next 16 (App Router, React 19), not the 15
> the brief names — `create-next-app` installs 16 by default and the architecture the
> brief specifies is unchanged. Next 16 removed synchronous `params`: page and layout
> `params` are Promises and must be awaited. See `node_modules/next/dist/docs/` before
> using an unfamiliar API.

## Scope
- Frontend only. No backend/API/DB/CMS/auth/payment. Content in /src/data. Forms validate
  client-side and show success; nothing is sent, and the success copy says so.
- Sitemap: Home, GVL, Products, Company, Shop, Contact; detail at /products/[slug].

## Hero mechanic
- 2D canvas frame sequence per product, pinned via CSS sticky (not GSAP pin — sticky
  introduces no pin-spacer and therefore no CLS), scroll→float frame index, interpolated,
  no snapping, reassembles on scroll-up. Frames + page bg both #060606.
- Switcher SCOUT / GUIDED MUNITION keeps scroll fraction. Scout loads first, Munition
  backfills once Scout is done. Must never stutter.
- Sequence lengths are read from the generated manifest, never hardcoded — Scout and
  Munition have different frame counts.
- 4 per-product overlays fade in/out, alternating sides, serif headlines, from
  src/data/heroOverlays.ts. Munition copy: engagement is human-commanded, never autonomous.

## Video placement
- Scout tracking video → HOMEPAGE field-proof band after the hero.
- 2 terrain videos → SCOUT product page capability section.
- Working videos → their product pages. All with poster frames, no black flash.

## Design
- Tokens BUILD_BRIEF §4.1 as @theme in globals.css. --void #060606, warm --ink.
- Semantic colour (blue/amber/green) ONLY on telemetry rail + live indicators, sparse.
- Type: Fraunces (display serif) + Inter Tight (grotesk) + JetBrains Mono. Never plain
  Inter as display. Persistent 32px telemetry rail every page. Whisper-thin fixed nav.
- Motion slow/eased 0.8–1.2s cubic-bezier(0.65,0,0.35,1), never bouncy. Forbidden:
  centred two-button hero, three-icon rows, gradients as decoration, glassmorphism,
  frosted cards, particle fields, emoji icons, radius>4px, uniform fade-in-on-scroll.

## Assets
- Real frames/videos drop into public/frames, public/video, public/img, public/posters
  (BUILD_BRIEF §11), resolved by convention in src/data/assets.ts against
  src/data/manifest.generated.ts. Adding an asset never needs a code change; missing
  assets fall back cleanly. Regenerate with `npm run manifest` (runs automatically on
  dev/build).
- `npm run frames` reprocesses raw sequences; `npm run posters` re-cuts video posters.
- Scout/Munition have real frames; the other six use the procedural placeholder.

## Copy
- No buildable specs. No pricing on defence products; only CTA "Request a briefing".
  Human authorisation retained for engagement, stated wherever effectors appear.
  Honest stage — never imply a fielded system. Sentence case, plain verbs, no inflation.

## Quality floor
- Responsive 320–2560px, no horizontal scroll. Visible keyboard focus (never bare
  outline:none). Full prefers-reduced-motion (scrub → static frame, overlays → stacked
  static text). aria-labels on every canvas/video; overlay narrative exists as real DOM
  text. No console errors. No layout shift on load.
