"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

type Props = {
  children: React.ReactNode;
  /** which descendants stagger in; defaults to direct children */
  selector?: string;
  /** px the block rises from */
  distance?: number;
  /** ms between children */
  gap?: number;
  /** ms before the first child moves */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "ul" | "li";
};

/**
 * Scroll-triggered reveal — REVISION_BRIEF §3.1.
 *
 * anime.js handles one-shot reveals fired by IntersectionObserver; GSAP
 * ScrollTrigger stays on the scroll-*scrubbed* hero. The two do not overlap.
 *
 * Only `opacity` and `transform` are animated, so this stays off the layout and
 * paint path. Under `prefers-reduced-motion` nothing animates at all — children
 * are simply left visible, which is the correct behaviour rather than a faster
 * animation.
 *
 * The observer fires once and disconnects: a reveal that replays every time you
 * scroll past reads as noise on a long page.
 */
export default function Reveal({
  children,
  selector = ":scope > *",
  distance = 24,
  gap = 70,
  delay = 0,
  className,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const kids = Array.from(el.querySelectorAll<HTMLElement>(selector));
    if (!kids.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // rendered visible already — leave it alone

    // Hide only once we know we will animate, so a failed observer or a
    // JS error can never leave the section permanently invisible.
    for (const k of kids) {
      k.style.opacity = "0";
      k.style.willChange = "opacity, transform";
    }

    let animation: ReturnType<typeof animate> | null = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        animation = animate(kids, {
          opacity: [0, 1],
          translateY: [distance, 0],
          delay: stagger(gap, { start: delay }),
          duration: 760,
          ease: "outCubic",
          onComplete: () => {
            for (const k of kids) {
              k.style.willChange = "";
              k.style.opacity = "";
              k.style.transform = "";
            }
          },
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);

    return () => {
      io.disconnect();
      animation?.pause();
      for (const k of kids) {
        k.style.willChange = "";
      }
    };
  }, [selector, distance, gap, delay]);

  return (
    // @ts-expect-error — polymorphic tag, ref type widens correctly at runtime
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
