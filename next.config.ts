import type { NextConfig } from "next";

/**
 * Static export.
 *
 * Every route in this site prerenders (17/17) — there are no API routes, no
 * server actions, no middleware and no runtime data, which is exactly what the
 * brief's "frontend only" scope asks for. Exporting to plain files means AWS
 * Amplify serves it from CDN with no Next.js compute layer, so there is no cold
 * start, no per-request cost, and no dependency on Amplify's SSR adapter
 * supporting this Next.js major.
 *
 * Consequences of `export`, handled here:
 *  - `images.unoptimized` is required; there is no server to resize on demand.
 *    The images in public/ are already sized and compressed by the asset
 *    pipeline, so this costs little.
 *  - `headers()` is not supported. Cache-Control for the frame sequences and
 *    video lives in amplify.yml `customHeaders` instead.
 *  - `trailingSlash` makes each route emit `<route>/index.html`, which is what
 *    static hosting resolves cleanly.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
