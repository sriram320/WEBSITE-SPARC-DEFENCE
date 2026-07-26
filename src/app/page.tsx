import Link from "next/link";
import Image from "next/image";
import ExplodedHero from "@/components/ExplodedHero";
import FieldProof from "@/components/FieldProof";
import PortfolioIndex from "@/components/PortfolioIndex";
import StackDiagram from "@/components/StackDiagram";
import Reveal from "@/components/Reveal";
import { productPhoto } from "@/data/assets";

/**
 * Homepage — BUILD_BRIEF §6.
 * One arc: here is the machine (exploded scrub) → here it is working (field
 * proof) → here is the portfolio → here is why it holds together (the brain) →
 * request a briefing.
 */
export default function Home() {
  const macro = productPhoto("scout");

  return (
    <>
      {/* Act I — the exploded hero */}
      <ExplodedHero pinVh={340} />

      {/* Act II/III — reassembly hands off to the field record */}
      <FieldProof
        name="scout-tracking"
        label="FIELD RECORD ▸ SCOUT / PERSISTENT TRACK"
        line="It finds the target. It keeps it."
      />

      {/* Act IV — portfolio index */}
      <PortfolioIndex heading="The range" />

      {/* Act V — the stack */}
      <StackDiagram />

      {/* Act VI — craftsmanship / editorial band */}
      <section className="rule-t" aria-label="Engineering philosophy">
        <Reveal
          as="div"
          className="shell grid gap-12 py-24 sm:py-32 md:grid-cols-12"
          distance={28}
        >
          <div className="md:col-span-5">
            <p className="t-label mb-6 text-ink-faint">Engineering</p>
            <h2 className="t-display-l text-ink">Accountable, end to end.</h2>
          </div>
          <div className="flex flex-col gap-6 md:col-span-6 md:col-start-7">
            <p className="t-body">
              Building navigation that works without satellites is not a feature
              you add late. It changes what the airframe has to carry, what the
              optics have to see, and how much the autopilot is allowed to
              assume. So we design the brain and the platforms it flies on
              together, in India, and we hold responsibility for both.
            </p>
            <p className="t-body-dim">
              That also sets the honest limit of what we will claim. GVL is in
              active development. The platforms around it are demonstrators and
              roadmap items. We would rather show you where the work actually
              stands than publish numbers we cannot stand behind in a briefing
              room.
            </p>
          </div>
        </Reveal>

        {macro && (
          <div className="relative h-[52svh] min-h-[340px] w-full overflow-hidden">
            <Image
              src={macro}
              alt="A Sparc Aerotech observation platform on the ground with its camera core mounted."
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, #060606 0%, transparent 22%, transparent 70%, #060606 100%)",
              }}
              aria-hidden="true"
            />
          </div>
        )}
      </section>

      {/* Act VII — close */}
      <section className="rule-t" aria-label="Request a briefing">
        <Reveal
          as="div"
          className="shell flex flex-col items-start gap-8 py-32 sm:py-40"
          gap={90}
        >
          <p className="t-label text-ink-faint">Next step</p>
          <h2 className="t-display-xl max-w-[16ch] text-ink">
            Request a briefing.
          </h2>
          <p className="t-body-dim max-w-[52ch]">
            We will talk about where GVL actually is, what it does and does not
            do yet, and whether it is relevant to the problem in front of you.
          </p>
          <Link href="/contact" className="t-label link-quiet text-ink">
            Contact Sparc Aerotech →
          </Link>
        </Reveal>
      </section>
    </>
  );
}
