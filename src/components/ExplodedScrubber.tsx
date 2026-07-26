"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SequenceState } from "@/lib/useFrameSequence";

type Props = {
  seq: SequenceState;
  /** 0..1 through the pin */
  progress: number;
  /** reduced motion: park on a single exploded frame instead of scrubbing */
  staticFrame?: boolean;
  ariaLabel: string;
  className?: string;
  /** shrink the plate inside the canvas to leave a quiet margin for the copy */
  fitScale?: number;
  /** nudge the plate off-centre, as a fraction of canvas height */
  offsetY?: number;
};

/**
 * The canvas half of the exploded view — BUILD_BRIEF §6.2.
 *
 * Blits a pre-rendered frame sequence. Scroll fraction maps to a FLOAT frame
 * index which is rounded only at draw time, so there is no snapping between
 * beats; the sequence reassembles on scroll-up because progress simply runs
 * backwards. Frames are composited on #060606 and the page is the same value,
 * so the canvas has no visible edge.
 *
 * Drawing is decoupled from scroll: scroll events set a target, and a rAF loop
 * draws at most once per frame. That keeps a fast flick from queueing dozens of
 * redundant draws, which is what causes visible stutter.
 */
export default function ExplodedScrubber({
  seq,
  progress,
  staticFrame = false,
  ariaLabel,
  className,
  fitScale = 1,
  offsetY = 0,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(0);
  const drawn = useRef(-1);
  const rafId = useRef<number>(0);
  const dims = useRef({ w: 0, h: 0, dpr: 1 });

  // Scroll progress is mirrored into a ref rather than read from state inside
  // the draw loop: the rAF loop reads it every frame and must not re-subscribe
  // on each scroll tick. Written in an effect, never during render.
  useEffect(() => {
    target.current = staticFrame ? 1 : progress;
  }, [progress, staticFrame]);

  /** Nearest frame at or before `i` that has actually loaded. */
  const resolveFrame = useCallback(
    (i: number): HTMLImageElement | null => {
      const { frames, count } = seq;
      if (!count) return null;
      const idx = Math.min(Math.max(Math.round(i), 0), count - 1);
      if (frames[idx]) return frames[idx];
      for (let d = 1; d < count; d++) {
        if (frames[idx - d]) return frames[idx - d];
        if (frames[idx + d]) return frames[idx + d];
      }
      return null;
    },
    [seq],
  );

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { count } = seq;
    if (!count) return;

    // float index, rounded only here — no snapping in the mapping itself
    const f = target.current * (count - 1);
    const img = resolveFrame(f);
    if (!img) return;

    const { w, h } = dims.current;
    if (!w || !h) return;

    // Contain-fit, not cover. The plate's edges are feathered to #060606 in the
    // frame pipeline, so letterboxing is invisible against the page — and
    // containing means the exploded parts are never cropped off at a narrow
    // viewport, which cover-fit would do badly on phones.
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight) * fitScale;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    ctx.fillStyle = "#060606";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2 + offsetY * h, dw, dh);
    drawn.current = f;
  }, [seq, resolveFrame, fitScale, offsetY]);

  // Single rAF loop; redraws only when the target has actually moved.
  useEffect(() => {
    const tick = () => {
      const f = target.current * Math.max(seq.count - 1, 1);
      if (Math.abs(f - drawn.current) >= 0.5 || drawn.current < 0) paint();
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [paint, seq.count]);

  // Repaint when new frames land, so the picture sharpens as loading proceeds.
  useEffect(() => {
    drawn.current = -1;
  }, [seq.loaded, seq.count]);

  // Size the backing store to the element, with DPR capped so we stay crisp
  // without paying for a 3x buffer on a phone (§6.2).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (w === dims.current.w && h === dims.current.h) return;
      canvas.width = w;
      canvas.height = h;
      dims.current = { w, h, dpr };
      drawn.current = -1;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
