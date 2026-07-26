/**
 * Asset resolver — BUILD_BRIEF §11.
 *
 * Everything resolves by naming convention against the build-time manifest.
 * Dropping a file into public/ makes it appear; removing one makes the site
 * fall back cleanly. No code change either way.
 */
import {
  FRAME_SEQUENCES,
  VIDEOS,
  POSTERS,
  IMAGES,
  type FrameSequence,
} from "./manifest.generated";

export type ProductKey = string;

/** How many frames a product's sequence actually has, or 0 if it has none. */
export function frameCount(product: ProductKey): number {
  return FRAME_SEQUENCES[product]?.count ?? 0;
}

export function hasFrames(product: ProductKey): boolean {
  return frameCount(product) > 0;
}

export function frameSequence(product: ProductKey): FrameSequence | null {
  return FRAME_SEQUENCES[product] ?? null;
}

/**
 * URL for one frame. `index` is 1-based.
 *
 * Resolved from the manifest's real file list rather than rebuilt from a naming
 * pattern, so a renamed, added or missing frame can never become an unreachable
 * index or a 404.
 */
export function frameUrl(product: ProductKey, index: number): string {
  const seq = FRAME_SEQUENCES[product];
  if (!seq || !seq.count) return "";
  const clamped = Math.min(Math.max(index, 1), seq.count);
  return `/frames/${product}/${seq.files[clamped - 1]}`;
}

/** All frame URLs for a product, in order. */
export function frameUrls(product: ProductKey): string[] {
  const seq = FRAME_SEQUENCES[product];
  if (!seq) return [];
  return seq.files.map((f) => `/frames/${product}/${f}`);
}

/** Video by base name, e.g. "scout-tracking" -> "/video/scout-tracking.mp4". */
export function videoUrl(name: string): string | null {
  return VIDEOS.includes(name) ? `/video/${name}.mp4` : null;
}

export function hasVideo(name: string): boolean {
  return VIDEOS.includes(name);
}

/** Poster for a video, so bands never flash black (§6.4). */
export function posterUrl(name: string): string | null {
  return POSTERS.includes(name) ? `/posters/${name}.jpg` : null;
}

/** Design photo by file name, e.g. "photo-scout.jpg". */
export function imageUrl(name: string): string | null {
  return IMAGES.includes(name) ? `/img/${name}` : null;
}

export function productPhoto(slug: string): string | null {
  const candidates = [`photo-${slug}.jpg`, `photo-${slug}.png`, `photo-${slug}.webp`];
  for (const c of candidates) {
    if (IMAGES.includes(c)) return `/img/${c}`;
  }
  return null;
}

/**
 * The hero opening plate — the product photo conformed to the frame sequence's
 * aspect, grade and edge feather by `npm run openers`, so it cross-dissolves
 * into the scrub without a letterbox or colour jump. Falls back to the raw
 * photo, and then to nothing, so a missing file only costs the effect.
 */
export function openingPlate(product: ProductKey): string | null {
  const conformed = `opening-${product}.webp`;
  if (IMAGES.includes(conformed)) return `/img/${conformed}`;
  return productPhoto(product);
}
