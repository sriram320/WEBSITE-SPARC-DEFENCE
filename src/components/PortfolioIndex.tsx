"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { PRODUCTS } from "@/data/products";
import { productPhoto } from "@/data/assets";

/**
 * Act IV — the portfolio index (BUILD_BRIEF §6.5).
 *
 * A dense asymmetric editorial list, not eight cards. Hairline-separated rows
 * at 96px; on hover the row opens, a preview fades in on the right, and every
 * other row dims. One disciplined interaction instead of a card grid.
 */
export default function PortfolioIndex({ heading }: { heading?: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Rows stagger in once, on first scroll into view (REVISION_BRIEF §3.2).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("li"));
    if (!rows.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const r of rows) {
      r.style.opacity = "0";
      r.style.willChange = "opacity, transform";
    }

    let anim: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        anim = animate(rows, {
          opacity: [0, 1],
          translateY: [18, 0],
          delay: stagger(70),
          duration: 700,
          ease: "outCubic",
          onComplete: () => {
            // clear inline styles so hover/dim transitions own these again
            for (const r of rows) {
              r.style.willChange = "";
              r.style.opacity = "";
              r.style.transform = "";
            }
          },
        });
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.pause();
    };
  }, []);

  return (
    <section
      className={`shell ${heading ? "py-24 sm:py-32" : "pb-24 pt-12"}`}
      aria-label="Product index"
    >
      {heading && (
        <div className="mb-12 flex items-baseline justify-between gap-6">
          <h2 className="t-display-l text-ink">{heading}</h2>
          <Link href="/products" className="t-label link-quiet text-ink">
            All products →
          </Link>
        </div>
      )}

      <ul
        ref={listRef}
        className="border-t border-rule"
        onMouseLeave={() => setHovered(null)}
      >
        {PRODUCTS.map((p) => {
          const isHovered = hovered === p.slug;
          const dimmed = hovered !== null && !isHovered;
          const photo = productPhoto(p.frameKey ?? p.slug);

          return (
            <li key={p.slug} className="border-b border-rule">
              <Link
                href={`/products/${p.slug}`}
                className="group grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 py-7 no-underline transition-opacity duration-500 md:grid-cols-[4rem_1fr_auto_2rem] md:py-0"
                style={{
                  opacity: dimmed ? 0.4 : 1,
                  minHeight: isHovered ? 200 : 96,
                  transitionProperty: "opacity, min-height",
                  transitionTimingFunction: "var(--ease-slow)",
                }}
                onMouseEnter={() => setHovered(p.slug)}
                onFocus={() => setHovered(p.slug)}
              >
                <span className="t-data text-ink-faint">{p.index}</span>

                <span className="flex flex-col gap-1">
                  <span className="t-display-m text-ink">{p.name}</span>
                  <span className="t-label text-ink-faint">{p.kind}</span>
                </span>

                <span className="col-span-2 flex items-center gap-6 md:col-span-1">
                  {/* preview appears only in the open state, right-aligned */}
                  {photo && (
                    <span
                      className="relative hidden overflow-hidden transition-all duration-700 md:block"
                      style={{
                        width: isHovered ? 168 : 0,
                        height: isHovered ? 94 : 0,
                        opacity: isHovered ? 1 : 0,
                        transitionTimingFunction: "var(--ease-slow)",
                      }}
                      aria-hidden="true"
                    >
                      <Image
                        src={photo}
                        alt=""
                        fill
                        sizes="168px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <span className="t-body-dim max-w-[42ch] text-[0.95rem] md:text-right">
                    {p.oneLiner}
                  </span>
                </span>

                <span
                  className="t-data hidden text-ink-faint transition-transform duration-500 group-hover:translate-x-1 md:block md:text-right"
                  style={{ transitionTimingFunction: "var(--ease-slow)" }}
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
