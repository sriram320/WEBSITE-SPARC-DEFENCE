"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * The GVL hero status strip (BUILD_BRIEF §7) — cycles blue → amber → green to
 * show the three link states the navigation core moves between. One of the very
 * few places semantic colour is allowed outside the telemetry rail (§4.1), and
 * it is a live indicator, which is exactly the permitted case.
 *
 * Honest by construction: this is labelled as an illustration of states, not a
 * readout from a real aircraft.
 */
const STATES = [
  { key: "operator", label: "LINK ▸ OPERATOR", note: "Satellite fix available", color: "var(--color-link)" },
  { key: "disrupt", label: "LINK ▸ DENIED", note: "Satellite fix lost or spoofed", color: "var(--color-disrupt)" },
  { key: "autonomous", label: "GVL ▸ HOLDING", note: "Position fixed from imagery", color: "var(--color-autonomous)" },
];

export default function GvlStatusStrip() {
  const [i, setI] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((v) => (v + 1) % STATES.length), 2600);
    return () => clearInterval(t);
  }, [reduced]);

  // Under reduced motion the three states are listed rather than cycled.
  if (reduced) {
    return (
      <ul className="flex flex-col gap-3 border-t border-rule pt-5">
        {STATES.map((s) => (
          <li key={s.key} className="flex items-center gap-3">
            <span
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: s.color }}
              aria-hidden="true"
            />
            <span className="t-data text-ink">{s.label}</span>
            <span className="t-data text-ink-faint">{s.note}</span>
          </li>
        ))}
      </ul>
    );
  }

  const s = STATES[i];
  return (
    <div className="border-t border-rule pt-5" aria-live="polite">
      <div className="flex items-center gap-3">
        <span
          className="inline-block h-[6px] w-[6px] rounded-full transition-colors duration-700"
          style={{ background: s.color, transitionTimingFunction: "var(--ease-slow)" }}
          aria-hidden="true"
        />
        <span className="t-data text-ink">{s.label}</span>
      </div>
      <p className="t-data mt-3 text-ink-faint">{s.note}</p>
    </div>
  );
}
