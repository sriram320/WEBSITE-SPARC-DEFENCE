"use client";

import { useEffect, useState } from "react";
import { frameCount, frameUrl } from "@/data/assets";

export type SequenceState = {
  /** decoded, ready-to-blit frames, index 0 = frame 1 */
  frames: HTMLImageElement[];
  count: number;
  loaded: number;
  ready: boolean;
  /** true once at least the opening frames can be drawn */
  primed: boolean;
};

/** enough frames to start drawing without waiting for the whole sequence */
const PRIME_AT = 12;

const NO_FRAMES: HTMLImageElement[] = [];

/**
 * Progressive frame loader.
 *
 * Decoding strategy — BUILD_BRIEF §6.2 asks for `createImageBitmap` so decode
 * happens off the main thread. We use `HTMLImageElement.decode()`, which also
 * decodes off the main thread but leaves the decoded surface under the
 * browser's own memory manager. That matters here: at 1600px a decoded RGBA
 * frame is ~5.7 MB, so retaining ImageBitmaps for a 150-frame sequence would
 * cost ~860 MB and a 250-frame one ~1.4 GB. The brief anticipates exactly this
 * ("never hold all bitmaps if memory is tight… evictable"); handing eviction to
 * the browser is the version of that which cannot leak. Network payload stays
 * small (~37 KB/frame WebP), so re-decode after eviction is cheap.
 *
 * `priority` sequences load immediately; non-priority ones wait until the
 * priority sequence is done, so the visible product is never starved.
 *
 * State is keyed by product and progress is only ever published from async
 * callbacks — nothing is set synchronously inside the effect, which would force
 * a cascading re-render on every product switch.
 */
export function useFrameSequence(
  product: string,
  { priority = true, start = false }: { priority?: boolean; start?: boolean } = {},
): SequenceState {
  // The frames array lives in state and is mutated in place as frames land;
  // re-renders are driven by `loaded`. Keeping it in state rather than a ref
  // means render can read it legally.
  const [seq, setSeq] = useState<{
    product: string;
    frames: HTMLImageElement[];
    loaded: number;
  }>(() => ({ product: "", frames: [], loaded: 0 }));

  useEffect(() => {
    if (!start) return;

    const count = frameCount(product);
    if (!count) return;

    const frames: HTMLImageElement[] = new Array(count);

    let cancelled = false;
    let loaded = 0;
    let next = 0;
    let live = 0;
    // a modest window keeps the network from thrashing on slow links
    const concurrency = priority ? 8 : 3;

    const publish = () => {
      if (!cancelled) setSeq({ product, frames, loaded });
    };

    const pump = () => {
      while (live < concurrency && next < count) {
        const i = next++;
        live++;
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(product, i + 1);

        const settle = (ok: boolean) => {
          if (cancelled) return;
          // a frame that fails is skipped rather than fatal — the scrubber
          // falls back to the nearest frame it does have
          if (ok) frames[i] = img;
          loaded++;
          live--;
          if (loaded === Math.min(PRIME_AT, count) || loaded === count || loaded % 6 === 0) {
            publish();
          }
          pump();
        };

        // decode() resolves once the frame can be painted without blocking
        img.decode().then(() => settle(true), () => settle(false));
      }
    };

    pump();

    return () => {
      cancelled = true;
    };
  }, [product, priority, start]);

  const count = frameCount(product);
  // Until the new product's first frames land, report empty rather than showing
  // the previous product's sequence.
  const stale = seq.product !== product;
  const loaded = stale ? 0 : seq.loaded;
  const frames = stale ? NO_FRAMES : seq.frames;

  return {
    frames,
    count,
    loaded,
    ready: count > 0 && loaded >= count,
    primed: loaded >= Math.min(PRIME_AT, count),
  };
}
