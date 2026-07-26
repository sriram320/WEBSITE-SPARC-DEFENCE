"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import { frameCount, frameUrl, productPhoto } from "@/data/assets";

/**
 * Section 4 of the product template (BUILD_BRIEF §8.4).
 * Three to five `+` markers over the last frame, naming subsystems in plain
 * language. Names and functions only — no specifications, per §3.
 */
export default function Hotspots({ product }: { product: Product }) {
  const [open, setOpen] = useState<number | null>(null);

  const key = product.frameKey;
  const still = key && frameCount(key) ? frameUrl(key, frameCount(key)) : productPhoto(key ?? product.slug);

  if (!still || !product.hotspots.length) return null;

  return (
    <section className="rule-t" aria-label="Subsystems">
      <div className="shell py-20">
        <p className="t-label mb-8 text-ink-faint">Subsystems</p>

        <div className="relative aspect-video w-full overflow-hidden bg-void">
          <Image
            src={still}
            alt={`${product.name}, shown with its major subsystems marked.`}
            fill
            sizes="(max-width: 1024px) 100vw, 88rem"
            className="object-contain"
          />

          {product.hotspots.map((h, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="absolute"
                style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%,-50%)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex h-7 w-7 items-center justify-center border border-rule-lit bg-void/70 transition-colors duration-300 hover:border-ink"
                >
                  <span className="t-data leading-none text-ink" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                  <span className="sr-only">{h.name}</span>
                </button>

                {isOpen && (
                  <div className="absolute left-9 top-0 w-56 border border-rule bg-void/95 p-4">
                    <p className="t-label mb-2 text-ink">{h.name}</p>
                    <p className="t-body-dim text-[0.85rem] leading-relaxed">{h.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* the same information as plain DOM text, so it is available without
            interacting with the markers */}
        <ul className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {product.hotspots.map((h, i) => (
            <li key={i} className="border-t border-rule pt-4">
              <p className="t-label mb-2 text-ink">{h.name}</p>
              <p className="t-body-dim text-[0.9rem]">{h.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
