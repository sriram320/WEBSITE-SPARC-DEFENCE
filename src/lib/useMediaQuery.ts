"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * `useSyncExternalStore` rather than useState + useEffect: a media query IS an
 * external store, and reading it this way avoids the cascading render that
 * setting state synchronously inside an effect would cause. It also returns the
 * correct value on the first client render instead of flashing the default.
 *
 * The server snapshot is always `false`, so markup that depends on a query is
 * rendered in its "no match" form during SSR and corrected on hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/**
 * Boolean derived from scroll position, e.g. "has the page moved past 40px".
 * Same reasoning as above — scroll is an external store. Updates are collapsed
 * onto an animation frame so a flick does not fire a render per event.
 */
export function useScrolledPast(threshold: number): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    let queued = 0;
    const handler = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        onChange();
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
