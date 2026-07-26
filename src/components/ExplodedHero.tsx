"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ExplodedScrubber from "./ExplodedScrubber";
import { useFrameSequence } from "@/lib/useFrameSequence";
import { useRailReadout } from "./Telemetry";
import { HERO_PRODUCTS, type HeroBeat, type HeroProduct } from "@/data/heroOverlays";
import { hasFrames } from "@/data/assets";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/useMediaQuery";

type Props = {
  /** how much scroll the pin consumes */
  pinVh?: number;
  /** homepage shows the switcher; product pages pin a single sequence */
  products?: HeroProduct[];
  showSwitcher?: boolean;
  compact?: boolean;
};

/**
 * Act I — the exploded hero (BUILD_BRIEF §6.2).
 *
 * A full-viewport canvas held for `pinVh` of scroll. The pin is CSS sticky
 * rather than a GSAP pin: sticky introduces no pin-spacer and therefore no
 * layout shift on load (§12 requires zero CLS), while ScrollTrigger still owns
 * the progress value that drives the scrub.
 *
 * The switcher swaps which sequence is scrubbing while KEEPING the current
 * scroll fraction, so the exploded state carries across — it reads like
 * X-raying the same view across two machines.
 */
export default function ExplodedHero({
  pinVh = 340,
  products = HERO_PRODUCTS,
  showSwitcher = true,
  compact = false,
}: Props) {
  const available = products.filter((p) => hasFrames(p.key));
  const list = available.length ? available : products;

  const [activeKey, setActiveKey] = useState(list[0]?.key ?? "scout");
  const [progress, setProgress] = useState(0);
  /** 0..1 as the section clears the viewport after the pin releases */
  const [exit, setExit] = useState(0);
  const reduced = usePrefersReducedMotion();
  // Narrow viewports get a shorter pin and a tighter crop: a 16:9 plate
  // contained in a portrait viewport is too small to read, and the explode axis
  // is mostly vertical, so cropping the sides costs little (§6.2, mobile).
  const narrow = useMediaQuery("(max-width: 767px)");
  const sectionRef = useRef<HTMLElement>(null);

  const active = list.find((p) => p.key === activeKey) ?? list[0];
  const inactive = list.find((p) => p.key !== activeKey);

  // Scout loads immediately; the other sequence backfills once it is done, so
  // the visible product is never starved of bandwidth (§6.2).
  const activeSeq = useFrameSequence(activeKey, { priority: true, start: true });
  const inactiveSeq = useFrameSequence(inactive?.key ?? "", {
    priority: false,
    start: Boolean(inactive) && activeSeq.ready,
  });

  // Scroll fraction through the pin.
  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    // The scrub itself: runs while the sticky child is actually pinned.
    const scrub = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => setProgress(self.progress),
    });

    // The hand-off: once the child unpins it still has a viewport-height to
    // travel before the section clears. This second trigger covers exactly that
    // stretch, so the canvas dissolves as the field-proof band rises into it
    // rather than going black while the section is still on screen.
    const exit = ScrollTrigger.create({
      trigger: el,
      start: "bottom bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => setExit(self.progress),
    });

    return () => {
      scrub.kill();
      exit.kill();
    };
  }, [reduced, pinVh]);

  const pct = Math.round(progress * 100);
  useRailReadout(
    { view: `VIEW ▸ EXPLODED ${String(pct).padStart(2, "0")}%`, name: active?.railName, link: "operator" },
    [pct, active?.railName],
  );

  const loading = !activeSeq.primed && activeSeq.count > 0;
  const noFrames = activeSeq.count === 0;

  const effectivePin = narrow ? Math.round(pinVh * 0.76) : pinVh;

  // Act II — the hand-off (§6.3). The machine on the bench becomes the machine
  // at work in one continuous movement: the canvas fades over the first part of
  // the section's exit, finishing before it leaves the viewport.
  const canvasOpacity = reduced ? 1 : Math.max(0, 1 - exit / 0.7);

  return (
    <section
      ref={sectionRef}
      style={{ height: reduced ? "auto" : `${effectivePin}vh` }}
      aria-label="Exploded product view"
    >
      <div
        className={[
          "sticky top-0 flex w-full flex-col overflow-hidden bg-void",
          reduced ? "h-auto" : "h-[100svh]",
        ].join(" ")}
      >
        {/* The canvas fills the viewport; frames are composited on #060606 so
            there is no edge against the page. Under reduced motion the section
            is not pinned, so the canvas needs its own height or it collapses to
            nothing and the static frame never appears. */}
        <div
          className={reduced ? "relative h-[62svh] min-h-[320px]" : "relative flex-1"}
          style={{ opacity: canvasOpacity }}
        >
          {noFrames ? (
            <ProceduralFallback label={active?.ariaLabel ?? ""} />
          ) : (
            <ExplodedScrubber
              seq={activeSeq}
              progress={progress}
              staticFrame={reduced}
              ariaLabel={active?.ariaLabel ?? ""}
              className="absolute inset-0 h-full w-full"
              fitScale={narrow ? 1.7 : compact ? 0.9 : 0.84}
              offsetY={narrow ? -0.06 : compact ? 0 : -0.05}
            />
          )}

          {showSwitcher && list.length > 1 && (
            <Switcher
              products={list}
              activeKey={activeKey}
              onSelect={setActiveKey}
              inactiveReady={inactiveSeq.ready}
              inactiveLoaded={inactiveSeq.loaded}
              inactiveCount={inactiveSeq.count}
            />
          )}

          {loading && (
            <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center">
              <p className="t-data text-ink-faint">
                LOADING {active?.label.toUpperCase()} SEQUENCE ▸{" "}
                {String(activeSeq.loaded).padStart(3, "0")} / {activeSeq.count}
              </p>
            </div>
          )}

          {!reduced && (
            <Overlays beats={active?.beats ?? []} progress={progress} compact={compact} />
          )}
        </div>

        {/* Reduced motion: the four beats become ordinary stacked prose beneath
            the static frame, so the whole narrative is readable without any
            scroll-linked animation at all (§4.3). */}
        {reduced && (
          <div className="shell flex flex-col gap-12 py-16">
            {(active?.beats ?? []).map((b, i) => (
              <div key={i} className="max-w-[52ch]">
                <h2 className="t-display-m text-ink">{b.headline}</h2>
                <p className="t-body-dim mt-3">{b.sub}</p>
                {b.cta && (
                  <Link href={b.cta.href} className="t-label link-quiet mt-5 inline-block text-ink">
                    {b.cta.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ switcher */

function Switcher({
  products,
  activeKey,
  onSelect,
  inactiveReady,
  inactiveLoaded,
  inactiveCount,
}: {
  products: HeroProduct[];
  activeKey: string;
  onSelect: (k: string) => void;
  inactiveReady: boolean;
  inactiveLoaded: number;
  inactiveCount: number;
}) {
  return (
    <div className="absolute inset-x-0 top-20 z-10 flex justify-center px-5">
      {/* full-width segmented control on mobile, quiet centred labels above (§6.2) */}
      <div
        className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-center sm:gap-12"
        role="group"
        aria-label="Choose which product to inspect"
      >
        {products.map((p) => {
          const isActive = p.key === activeKey;
          const pending = !isActive && !inactiveReady && inactiveCount > 0;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelect(p.key)}
              aria-pressed={isActive}
              className="group relative flex-1 pb-2 text-center sm:flex-none"
            >
              <span
                className={[
                  "t-label transition-colors duration-300",
                  isActive ? "text-ink" : "text-ink-faint group-hover:text-ink",
                ].join(" ")}
              >
                {p.label}
              </span>
              {!isActive && (
                <span className="t-data ml-2 text-ink-faint">
                  {pending
                    ? `${String(inactiveLoaded).padStart(3, "0")}/${inactiveCount}`
                    : "● READY"}
                </span>
              )}
              {/* 1px underbracket marks the active sequence */}
              <span
                className={[
                  "absolute inset-x-0 bottom-0 h-px origin-left bg-ink transition-transform duration-500",
                  isActive ? "scale-x-100" : "scale-x-0",
                ].join(" ")}
                style={{ transitionTimingFunction: "var(--ease-slow)" }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ overlays */

function Overlays({
  beats,
  progress,
  compact,
}: {
  beats: HeroBeat[];
  progress: number;
  compact?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {beats.map((b, i) => (
        <Overlay key={i} beat={b} progress={progress} compact={compact} />
      ))}
    </div>
  );
}

/**
 * Placement keeps the copy clear of the machine rather than on top of it: the
 * plate is scaled down and held slightly high in the canvas, so `center` beats
 * land in the quiet band beneath it and the side beats sit over the feathered
 * edges where the plate has already gone to void.
 */
const ALIGN: Record<HeroBeat["side"], string> = {
  left: "justify-start items-center",
  right: "justify-end items-center",
  center: "justify-center items-end",
};

const BLOCK: Record<HeroBeat["side"], string> = {
  left: "text-left max-w-[30ch] md:pl-[3vw] lg:pl-[5vw]",
  right: "text-left md:text-right items-start md:items-end max-w-[30ch] md:pr-[3vw] lg:pr-[5vw]",
  center: "text-center items-center max-w-[46ch] mx-auto pb-[9vh]",
};

function Overlay({
  beat,
  progress,
  compact,
}: {
  beat: HeroBeat;
  progress: number;
  compact?: boolean;
}) {
  // Fades happen INSIDE each beat's own range — in over the first slice, out
  // over the last — so consecutive beats hand off cleanly at the boundary
  // instead of both sitting on screen at once. Overlapping the windows reads as
  // two competing headlines rather than as a dissolve.
  // The first beat is already on screen at rest and the last must still be
  // there (with its CTA) at full explode, so neither fades at the outer edge.
  const FADE = 0.05;
  const fadesIn = beat.from > 0;
  const fadesOut = beat.to < 1;

  let opacity: number;
  if (progress < beat.from || progress > beat.to) {
    opacity = 0;
  } else if (fadesIn && progress < beat.from + FADE) {
    opacity = (progress - beat.from) / FADE;
  } else if (fadesOut && progress > beat.to - FADE) {
    opacity = (beat.to - progress) / FADE;
  } else {
    opacity = 1;
  }
  opacity = Math.max(0, Math.min(1, opacity));

  // an 8px rise, eased — no slides, no bounces (§4.3)
  const rise = (1 - opacity) * 8;

  return (
    <div
      className={`absolute inset-0 flex px-5 pb-16 pt-32 ${ALIGN[beat.side]}`}
      style={{ opacity, visibility: opacity <= 0.01 ? "hidden" : "visible" }}
      aria-hidden={opacity < 0.5}
    >
      <div
        className={`flex flex-col gap-3 ${BLOCK[beat.side]}`}
        style={{ transform: `translateY(${rise}px)` }}
      >
        <h2
          className={compact ? "t-display-m text-ink" : "t-display-l text-ink"}
          style={{ textShadow: "0 2px 28px rgba(6,6,6,0.85)" }}
        >
          {beat.headline}
        </h2>
        <p
          className="t-body max-w-[34ch] text-[0.95rem]"
          style={{ textShadow: "0 1px 18px rgba(6,6,6,0.9)" }}
        >
          {beat.sub}
        </p>
        {beat.cta && (
          <Link
            href={beat.cta.href}
            className="pointer-events-auto t-label link-quiet mt-3 inline-block text-ink"
          >
            {beat.cta.label} →
          </Link>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------- procedural fallback (§11) */

function ProceduralFallback({ label }: { label: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-void"
      role="img"
      aria-label={label || "Product placeholder"}
    >
      <div className="brackets p-12">
        <p className="t-label text-ink-faint">Sequence not present</p>
      </div>
    </div>
  );
}
