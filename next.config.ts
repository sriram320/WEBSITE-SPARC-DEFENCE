import type { NextConfig } from "next";

/**
 * Server-rendered, not a static export.
 *
 * The marketing pages are still fully static and prerender at build time — that
 * has not changed. What changed is that the site now needs a server at all:
 * authentication requires verifying a Cognito token's signature and reading its
 * group claim SERVER-side before deciding anything. A static export has no
 * runtime, so the only place that check could run is in the browser, where the
 * user controls it — which is not a check.
 *
 * Requires the Amplify app to be on platform WEB_COMPUTE.
 */
const nextConfig: NextConfig = {
  trailingSlash: true,
  devIndicators: false,

  // Never let a secret reach the browser bundle by accident. Cognito pool and
  // client IDs are not secrets, but they stay server-side too: nothing about
  // auth needs to be public, so nothing about it is.
  serverExternalPackages: ["aws-jwt-verify"],

  async headers() {
    return [
      {
        // Frame sequences, video and posters are addressed by name and never
        // change in place — a new sequence is a new set of files.
        source: "/:dir(frames|video|posters)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Anything behind auth must never be stored by a shared cache.
        source: "/:path(admin|account)/:rest*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
