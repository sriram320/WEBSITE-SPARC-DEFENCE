"use client";

import { useEffect, useRef, useState } from "react";
import { posterUrl, videoUrl } from "@/data/assets";

type Props = {
  name: string;
  label: string;
  line?: string;
  /** full-bleed band (homepage Act III) vs. inset panel (product pages) */
  bleed?: boolean;
  caption?: string;
};

/**
 * A video band — BUILD_BRIEF §6.4, §8.
 *
 * Muted, looped, autoplays only once scrolled into view, and always carries a
 * poster so the band never flashes black. If the file is absent the section
 * renders nothing rather than a broken player (§11).
 */
export default function FieldProof({
  name,
  label,
  line,
  bleed = true,
  caption,
}: Props) {
  const src = videoUrl(name);
  const poster = posterUrl(name) ?? undefined;
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  if (!src) return null;

  return (
    <section
      className={bleed ? "relative w-full bg-void" : "relative w-full"}
      aria-label={label}
    >
      <div className={bleed ? "relative h-[70svh] min-h-[420px] w-full overflow-hidden" : "relative aspect-video w-full overflow-hidden"}>
        <video
          ref={ref}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
        />

        {/* readable floor for the mono readout, not a decorative gradient */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{ background: "linear-gradient(to top, #060606 0%, transparent 100%)" }}
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="shell flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <p className="t-label text-ink-faint">
              <span className="text-ink">▸</span> {label}
              {!inView && <span className="ml-3 text-ink-faint">PAUSED</span>}
            </p>
            {line && (
              <p className="t-display-m max-w-[24ch] text-ink md:text-right">{line}</p>
            )}
          </div>
        </div>
      </div>
      {caption && (
        <p className="t-label mt-3 text-ink-faint">{caption}</p>
      )}
    </section>
  );
}
