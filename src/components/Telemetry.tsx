"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * The telemetry rail — BUILD_BRIEF §4.4.
 *
 * Persistent 32px bottom rail on every page. Mono, --ink-faint, with a state
 * dot in the semantic colours. On the hero it reads the scrub
 * (`VIEW ▸ EXPLODED 42%`) and the active product; elsewhere it tracks scroll
 * and climbs altitude. Collapses to dot + percent below 768px.
 *
 * This is the one place besides live indicators where semantic colour is
 * allowed to appear at all (§4.1).
 */

export type LinkState = "operator" | "disrupt" | "autonomous";

type RailOverride = {
  /** replaces the VIEW readout, e.g. "EXPLODED 42%" */
  view?: string;
  /** replaces the product/section name */
  name?: string;
  link?: LinkState;
};

type Ctx = {
  setOverride: (o: RailOverride | null) => void;
};

const TelemetryCtx = createContext<Ctx>({ setOverride: () => {} });

export function useTelemetry() {
  return useContext(TelemetryCtx);
}

/**
 * Push a rail override for as long as the calling component is mounted.
 * The hero uses this to show the live scrub percentage.
 */
export function useRailReadout(o: RailOverride | null, deps: unknown[] = []) {
  const { setOverride } = useTelemetry();
  useEffect(() => {
    setOverride(o);
    return () => setOverride(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const DOT: Record<LinkState, string> = {
  operator: "var(--color-link)",
  disrupt: "var(--color-disrupt)",
  autonomous: "var(--color-autonomous)",
};

const LABEL: Record<LinkState, string> = {
  operator: "OPERATOR",
  disrupt: "DENIED",
  autonomous: "AUTONOMOUS",
};

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverrideState] = useState<RailOverride | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const raf = useRef(0);

  const setOverride = useCallback((o: RailOverride | null) => {
    setOverrideState(o);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollPct(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const value = useMemo(() => ({ setOverride }), [setOverride]);

  const link = override?.link ?? "operator";
  const pct = Math.round(scrollPct * 100);
  // altitude climbs with scroll — the rail behaves like an instrument, not a
  // progress bar, so the number reads as state rather than decoration
  const alt = String(Math.round(scrollPct * 400)).padStart(3, "0");
  const view = override?.view ?? `SCROLL ${String(pct).padStart(2, "0")}%`;
  const name = override?.name ?? "SPARC AEROTECH";

  return (
    <TelemetryCtx.Provider value={value}>
      {children}
      {/* Ambient instrumentation, not a status message. It mirrors scroll and
          the active product, both of which a screen reader already gets from the
          headings and the switcher's pressed state — announcing "EXPLODED 42%"
          on every scroll tick would be noise, so the rail is hidden from the
          accessibility tree rather than made into a live region. */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 h-8 border-t border-rule bg-void/92 backdrop-blur-[2px]"
        aria-hidden="true"
      >
        <div className="shell flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            <span className="t-data hidden text-ink-faint sm:inline">GVL · v0.4</span>
            <span className="flex items-center gap-2 t-data text-ink-faint">
              <span
                className="inline-block h-[5px] w-[5px] rounded-full"
                style={{ background: DOT[link] }}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">LINK {LABEL[link]}</span>
            </span>
            <span className="t-data hidden truncate text-ink-faint lg:inline">
              LAT 12.9716 LON 77.5946
            </span>
          </div>

          <div className="flex items-center gap-5">
            <span className="t-data hidden text-ink-faint md:inline">
              ALT ▲ {alt}M
            </span>
            <span className="t-data hidden truncate text-ink-faint md:inline">
              {name}
            </span>
            <span className="t-data text-ink">{view}</span>
          </div>
        </div>
      </div>
    </TelemetryCtx.Provider>
  );
}
