"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Act V — the stack (BUILD_BRIEF §6.6).
 * An SVG structural diagram: the GVL brain at centre, plugging into airframes
 * and LegionNet. Lines draw in on scroll via stroke-dasharray, hairline, slow
 * and eased. The brain node is the one place --autonomous appears on this page.
 */
// Labels sit centred beneath their node rather than flying off to the side, so
// a long one like "Guided Munition" cannot run past the edge of the viewBox.
const NODES = [
  { x: 17, y: 16, label: "Scout / ISR" },
  { x: 17, y: 50, label: "Loitering" },
  { x: 17, y: 84, label: "Guided Munition" },
  { x: 83, y: 16, label: "Interceptor" },
  { x: 83, y: 50, label: "LegionNet" },
  { x: 83, y: 84, label: "Microjet" },
];

export default function StackDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setDrawn(true),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="rule-t" aria-label="How the system fits together">
      <div className="shell py-24 sm:py-32" ref={ref}>
        <div className="mb-14 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="t-label mb-6 text-ink-faint">The stack</p>
            <h2 className="t-display-l text-ink">One brain, many airframes.</h2>
          </div>
          <p className="t-body-dim md:col-span-6 md:col-start-7">
            GVL is the part that is genuinely hard. Everything else in the
            catalogue is a body it can inhabit — which is why the same
            navigation core turns up on an observation platform, an effector and
            a coordination layer without being redesigned each time.
          </p>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox="0 0 100 100"
            className="h-auto w-full min-w-[560px]"
            role="img"
            aria-label="Diagram: the GVL navigation core at centre, connected to six platforms."
            preserveAspectRatio="xMidYMid meet"
          >
            {NODES.map((n, i) => {
              const dir = n.x < 50 ? 1 : -1;
              const d = `M ${n.x + dir * 3} ${n.y} L ${50 - dir * 16} ${n.y} L ${50 - dir * 9} 50 L ${50 - dir * 8} 50`;
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="var(--color-rule-lit)"
                  strokeWidth="0.25"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: drawn ? 0 : 1,
                    transition: `stroke-dashoffset 1100ms var(--ease-slow) ${i * 90}ms`,
                  }}
                />
              );
            })}

            {NODES.map((n, i) => (
              <g key={`n-${i}`} style={{ opacity: drawn ? 1 : 0, transition: `opacity 900ms var(--ease-slow) ${i * 90 + 200}ms` }}>
                <circle cx={n.x} cy={n.y} r="0.9" fill="var(--color-ink-faint)" />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fill="var(--color-ink-faint)"
                  style={{ font: "500 2.4px var(--font-mono)", letterSpacing: "0.1px" }}
                >
                  {n.label.toUpperCase()}
                </text>
              </g>
            ))}

            {/* the brain */}
            <g style={{ opacity: drawn ? 1 : 0, transition: "opacity 900ms var(--ease-slow) 700ms" }}>
              <rect x="42" y="44" width="16" height="12" fill="none" stroke="var(--color-autonomous)" strokeWidth="0.25" />
              <circle cx="50" cy="48.5" r="1.1" fill="var(--color-autonomous)" />
              <text
                x="50"
                y="54"
                textAnchor="middle"
                fill="var(--color-ink)"
                style={{ font: "500 3px var(--font-mono)", letterSpacing: "0.2px" }}
              >
                GVL
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
