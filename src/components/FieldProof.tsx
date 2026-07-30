"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate } from "animejs";
import { posterUrl, videoUrl } from "@/data/assets";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

type Props = {
  name: string;
  label: string;
  line?: string;
  /** full-bleed band (homepage Act III) vs. inset panel (product pages) */
  bleed?: boolean;
  caption?: string;
  /**
   * Marks this as a standout beat: draws a thin live-indicator rule beneath
   * the caption once, on first approach. Sparse by design (§4.1 semantic
   * colour rule) — at most one beat per page should carry this.
   */
  accent?: boolean;
};

/**
 * A video band — BUILD_BRIEF §6.4, §8.
 *
 * Muted, looped, autoplays only once scrolled into view, and always carries a
 * poster so the band never flashes black. If the file is absent the section
 * renders nothing rather than a broken player (§11).
 *
 * Under prefers-reduced-motion, autoplay is withheld entirely: the poster
 * holds and a control lets the viewer start playback on their own terms.
 */
export default function FieldProof({
  name,
  label,
  line,
  bleed = true,
  caption,
  accent = false,
}: Props) {
  const src = videoUrl(name);
  const poster = posterUrl(name) ?? undefined;
  const ref = useRef<HTMLVideoElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<SVGLineElement>(null);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) {
          void el.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          el.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src, reduced]);

  const tapToPlay = () => {
    const el = ref.current;
    if (!el) return;
    void el.play().then(() => setPlaying(true)).catch(() => {});
  };

  // Band reveal (REVISION_BRIEF §3.2): the footage lifts out of the poster and
  // the mono readout slides in from the left, once, on first approach.
  useEffect(() => {
    const video = ref.current;
    const captionEl = captionRef.current;
    if (!video || !captionEl || reduced) return;

    video.style.opacity = "0.6";
    captionEl.style.opacity = "0";

    let a: ReturnType<typeof animate> | null = null;
    let b: ReturnType<typeof animate> | null = null;
    let c: ReturnType<typeof animate> | null = null;

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        a = animate(video, { opacity: [0.6, 1], duration: 900, ease: "outCubic" });
        b = animate(captionEl, {
          opacity: [0, 1],
          translateX: [-24, 0],
          duration: 800,
          delay: 180,
          ease: "outCubic",
          onComplete: () => {
            captionEl.style.opacity = "";
            captionEl.style.transform = "";
          },
        });
        if (accent && ruleRef.current) {
          c = animate(ruleRef.current, {
            strokeDashoffset: [1, 0],
            duration: 700,
            delay: 260,
            ease: "outCubic",
          });
        }
      },
      { threshold: 0.2 },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      a?.pause();
      b?.pause();
      c?.pause();
    };
  }, [src, reduced, accent]);

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

        {reduced && !playing && (
          <button
            type="button"
            onClick={tapToPlay}
            className="brackets absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 bg-void/70 px-6 py-4"
            aria-describedby={titleId}
          >
            <span className="t-label text-ink">▸ Play</span>
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div
            ref={captionRef}
            className="shell flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <p id={titleId} className="t-label text-ink-faint">
              <span className={accent ? "text-autonomous" : "text-ink"}>▸</span> {label}
              {!inView && !reduced && <span className="ml-3 text-ink-faint">PAUSED</span>}
              {reduced && !playing && <span className="ml-3 text-ink-faint">PAUSED</span>}
            </p>
            {line && (
              <p className="t-display-m max-w-[24ch] text-ink md:text-right">{line}</p>
            )}
          </div>
          {accent && (
            <svg
              className="shell mt-3 h-px w-full"
              style={{ overflow: "visible" }}
              aria-hidden="true"
            >
              <line
                ref={ruleRef}
                x1="0"
                y1="0.5"
                x2="100%"
                y2="0.5"
                stroke="var(--color-autonomous)"
                strokeWidth="1"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={reduced ? 0 : 1}
              />
            </svg>
          )}
        </div>
      </div>
      {caption && (
        <p className="t-label mt-3 text-ink-faint">{caption}</p>
      )}
    </section>
  );
}
