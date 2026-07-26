"use client";

import { useEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";

/**
 * Act V — the stack (BUILD_BRIEF §6.6, motion per REVISION_BRIEF §3.2).
 *
 * An SVG structural diagram: the GVL core at centre, feeding six platforms. The
 * connector paths draw in sequence via an anime.js timeline, the node labels
 * fade up behind them, then the core pulses once in --autonomous. That pulse is
 * the only place a state colour animates anywhere on the page, which is what
 * keeps it meaning something.
 *
 * Labels sit centred beneath their node rather than flying off to the side, so
 * a long one like "Guided Munition" cannot run past the edge of the viewBox.
 */
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

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const paths = Array.from(root.querySelectorAll<SVGPathElement>("path[data-line]"));
    const nodes = Array.from(root.querySelectorAll<SVGGElement>("g[data-node]"));
    const core = root.querySelector<SVGGElement>("g[data-core]");
    const coreDot = root.querySelector<SVGCircleElement>("circle[data-core-dot]");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: present the finished diagram, no drawing, no pulse.
    if (reduce) {
      for (const p of paths) p.style.strokeDashoffset = "0";
      for (const n of nodes) n.style.opacity = "1";
      if (core) core.style.opacity = "1";
      return;
    }

    for (const p of paths) {
      p.style.strokeDasharray = "1";
      p.style.strokeDashoffset = "1";
    }
    for (const n of nodes) n.style.opacity = "0";
    if (core) core.style.opacity = "0";

    let tl: ReturnType<typeof createTimeline> | null = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        tl = createTimeline({ defaults: { ease: "outCubic" } })
          .add(paths, { strokeDashoffset: 0, duration: 1100, delay: stagger(120) }, 0)
          .add(nodes, { opacity: 1, duration: 700, delay: stagger(120, { start: 260 }) }, 0);

        if (core) tl.add(core, { opacity: 1, duration: 800 }, 700);

        // one pulse on the core once the structure has resolved — not a loop
        if (coreDot) {
          tl.add(
            coreDot,
            { r: [1.1, 2.2, 1.1], opacity: [1, 0.55, 1], duration: 1200, ease: "inOutSine" },
            1500,
          );
        }
      },
      { threshold: 0.3 },
    );

    io.observe(root);
    return () => {
      io.disconnect();
      tl?.pause();
    };
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
            aria-label="Diagram: the GVL navigation core at centre, connected to six platforms — Scout ISR, Loitering, Guided Munition, Interceptor, LegionNet and Microjet."
            preserveAspectRatio="xMidYMid meet"
          >
            {NODES.map((n, i) => {
              const dir = n.x < 50 ? 1 : -1;
              const d = `M ${n.x + dir * 3} ${n.y} L ${50 - dir * 16} ${n.y} L ${50 - dir * 9} 50 L ${50 - dir * 8} 50`;
              return (
                <path
                  key={i}
                  data-line
                  d={d}
                  fill="none"
                  stroke="var(--color-rule-lit)"
                  strokeWidth="0.25"
                  pathLength={1}
                />
              );
            })}

            {NODES.map((n, i) => (
              <g key={`n-${i}`} data-node>
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

            <g data-core>
              <rect x="42" y="44" width="16" height="12" fill="none" stroke="var(--color-autonomous)" strokeWidth="0.25" />
              <circle data-core-dot cx="50" cy="48.5" r="1.1" fill="var(--color-autonomous)" />
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
