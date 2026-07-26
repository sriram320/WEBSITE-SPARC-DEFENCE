import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExplodedHero from "@/components/ExplodedHero";
import FieldProof from "@/components/FieldProof";
import Hotspots from "@/components/Hotspots";
import ProceduralModel from "@/components/ProceduralModel";
import { PRODUCTS, adjacent, productBySlug } from "@/data/products";
import { hasFrames, hasVideo } from "@/data/assets";
import { HERO_PRODUCTS } from "@/data/heroOverlays";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.oneLiner };
}

/**
 * Product detail — one template, eight instances (BUILD_BRIEF §8).
 *
 * Scout and Guided Munition reuse the exploded scrubber as a shorter pinned
 * section with their own frames; the other six get the procedural placeholder
 * until real assets exist. Sections without assets are omitted rather than
 * rendered empty.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const { prev, next } = adjacent(slug);
  const heroProduct = HERO_PRODUCTS.find((h) => h.key === product.frameKey);
  const useScrubber = Boolean(product.frameKey && hasFrames(product.frameKey));
  const isScout = slug === "scout-isr";
  const workingVideo = `${product.frameKey ?? slug}-working`;

  return (
    <>
      {/* 1 — hero */}
      {useScrubber && heroProduct ? (
        <ExplodedHero
          pinVh={200}
          products={[heroProduct]}
          showSwitcher={false}
          compact
        />
      ) : (
        <section className="relative h-[70svh] min-h-[420px] w-full" aria-label={`${product.name} model`}>
          <ProceduralModel seed={product.index} ariaLabel={`${product.name}, stylised placeholder model.`} />
        </section>
      )}

      {/* The name is set once, here. The scrubber hero carries only its narrative
          overlays, and the procedural hero carries none, so neither repeats it. */}
      <header className="rule-t rule-b">
        <div className="shell flex flex-col gap-4 py-12 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="t-label mb-4 text-ink-faint">{product.kind}</p>
            <h1 className="t-display-l text-ink">{product.name}</h1>
          </div>
          <p className="t-body-dim max-w-[46ch] md:text-right">{product.oneLiner}</p>
        </div>
      </header>

      {/* 2 — see it work */}
      {hasVideo(workingVideo) && (
        <section className="shell py-20" aria-label="See it work">
          <p className="t-label mb-6 text-ink-faint">See it work</p>
          <FieldProof
            name={workingVideo}
            label={`FIELD RECORD ▸ ${product.name.toUpperCase()}`}
            bleed={false}
          />
        </section>
      )}

      {/* 3 — capability: the terrain-mapping pair, Scout only (§8.3) */}
      {isScout && (hasVideo("scout-terrain-1") || hasVideo("scout-terrain-2")) && (
        <section className="rule-t" aria-label="Capability — terrain mapping">
          <div className="shell py-20">
            <div className="mb-10 grid gap-6 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="t-label mb-5 text-ink-faint">Capability</p>
                <h2 className="t-display-m text-ink">Reading the ground it flies over.</h2>
              </div>
              <p className="t-body-dim md:col-span-6 md:col-start-7">
                Both records show the platform building a picture of the terrain
                beneath it. This is the same class of information GVL uses to fix
                position when the satellite picture is unavailable — which is why
                it sits on this page rather than in a separate demo.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <FieldProof
                name="scout-terrain-1"
                label="TERRAIN MAP ▸ TYPE A"
                bleed={false}
                caption="TERRAIN MAP ▸ TYPE A"
              />
              <FieldProof
                name="scout-terrain-2"
                label="TERRAIN MAP ▸ TYPE B"
                bleed={false}
                caption="TERRAIN MAP ▸ TYPE B"
              />
            </div>
          </div>
        </section>
      )}

      {/* 4 — hotspots */}
      <Hotspots product={product} />

      {/* 5 — what it solves */}
      <section className="rule-t" aria-label="What it solves">
        <div className="shell grid gap-10 py-20 md:grid-cols-12">
          <div className="md:col-span-2">
            <p className="t-label text-ink-faint">What it solves</p>
          </div>
          <p className="t-body md:col-span-6 md:col-start-3">{product.solves}</p>
        </div>
      </section>

      {/* 6 — how the brain fits, offset (§8.6) */}
      <section aria-label="How the brain fits">
        <div className="shell grid gap-10 pb-20 md:grid-cols-12">
          <div className="md:col-span-2 md:col-start-6">
            <p className="t-label text-ink-faint">The brain</p>
          </div>
          <div className="flex flex-col gap-6 md:col-span-6 md:col-start-6">
            <p className="t-body">{product.brain}</p>
            {product.effector && (
              <p className="t-body border-l border-rule-lit pl-5 text-ink">
                An operator authorises every engagement. Guidance and correction
                are automated; the decision to engage is not, and is not designed
                to be.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 7 — status, 8 — CTA */}
      <section className="rule-t" aria-label="Status and next step">
        <div className="shell flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between">
          <p className="t-label text-ink-faint">
            STATUS — <span className="text-ink">{product.status}</span>
          </p>
          <Link href="/contact" className="t-label link-quiet text-ink">
            Request a briefing →
          </Link>
        </div>
      </section>

      {/* 9 — adjacent products */}
      <nav className="rule-t" aria-label="Adjacent products">
        {[prev, next].map((p, i) => (
          <Link
            key={p.slug}
            href={`/products/${p.slug}`}
            className="group flex items-center justify-between gap-6 border-b border-rule py-8 no-underline"
          >
            <div className="shell flex w-full items-center justify-between gap-6">
              <span className="flex items-center gap-6">
                <span className="t-label text-ink-faint">
                  {i === 0 ? "Previous" : "Next"}
                </span>
                <span className="t-display-m text-ink">{p.name}</span>
              </span>
              <span
                className="t-data text-ink-faint transition-transform duration-500 group-hover:translate-x-1"
                style={{ transitionTimingFunction: "var(--ease-slow)" }}
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </>
  );
}
