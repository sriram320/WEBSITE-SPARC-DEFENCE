import type { Metadata } from "next";
import Link from "next/link";
import GvlStatusStrip from "@/components/GvlStatusStrip";

export const metadata: Metadata = {
  title: "GVL",
  description:
    "GVL is vision-based navigation for airspace where GPS is jammed, spoofed or denied. It fixes position by matching onboard camera imagery to known geo-visual reference data.",
};

/** The flagship deep-dive — BUILD_BRIEF §7. */
export default function GvlPage() {
  return (
    <>
      <section className="relative flex min-h-[86svh] items-end pt-32" aria-label="GVL">
        <div className="shell grid w-full gap-10 pb-20 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="t-label mb-6 text-ink-faint">Geo-Visual Localization</p>
            <h1 className="t-display-xl text-ink">
              Navigation that does not ask the sky for permission.
            </h1>
          </div>
          <div className="flex flex-col gap-8 md:col-span-4 md:col-start-9 md:self-end">
            <p className="t-body-dim">
              GVL fixes an aircraft&rsquo;s position from what its camera can see,
              by matching that imagery against known geo-visual reference data.
              It is designed for airspace where satellite navigation is jammed,
              spoofed, or simply absent.
            </p>
            <GvlStatusStrip />
          </div>
        </div>
      </section>

      <section className="rule-t" aria-label="The problem">
        <div className="shell grid gap-10 py-24 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="t-label text-ink-faint">The problem</p>
          </div>
          <div className="flex flex-col gap-6 md:col-span-7 md:col-start-5">
            <h2 className="t-display-l text-ink">GPS is jammable.</h2>
            <p className="t-body">
              Satellite navigation is a weak signal arriving from a very long way
              away. Overpowering it locally is cheap, and convincing a receiver
              of a false position is not much harder. Any platform whose
              navigation rests on that single source inherits the weakness — and
              tends to fail exactly where the task matters most.
            </p>
            <p className="t-body-dim">
              This is not a hypothetical. It is the ordinary condition of
              contested airspace, and it is why we treat position-fixing as the
              hard problem rather than as a solved input.
            </p>
          </div>
        </div>
      </section>

      <section className="rule-t" aria-label="How it works">
        <div className="shell grid gap-10 py-24 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="t-label text-ink-faint">How it works</p>
          </div>
          <div className="flex flex-col gap-6 md:col-span-7 md:col-start-5">
            <h2 className="t-display-l text-ink">It looks, and it recognises.</h2>
            <p className="t-body">
              The aircraft already carries a camera. GVL compares what that
              camera sees against reference data describing what the ground in
              that area looks like, and works out where the aircraft must be for
              the two to agree. The result is a position fix that owes nothing to
              a satellite constellation.
            </p>
            <p className="t-body-dim">
              We describe it at this level deliberately. How the matching is done,
              how the reference data is prepared, and how the system behaves at
              the edges are matters for a briefing, not a public page.
            </p>
          </div>
        </div>
      </section>

      <section className="rule-t" aria-label="Where it fits">
        <div className="shell grid gap-10 py-24 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="t-label text-ink-faint">Where it fits</p>
          </div>
          <div className="flex flex-col items-start gap-6 md:col-span-7 md:col-start-5">
            <p className="t-body">
              Every platform in the catalogue is a body GVL can inhabit — an
              observation platform that has to hold a frame, an effector that has
              to hold an approach, a coordination layer that has to keep a group
              honest about where its members are.
            </p>
            <Link href="/products" className="t-label link-quiet text-ink">
              See the platforms →
            </Link>
          </div>
        </div>
      </section>

      <section className="rule-t" aria-label="Status">
        <div className="shell flex flex-col gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <p className="t-label text-ink-faint">
              STATUS — <span className="text-ink">IN ACTIVE DEVELOPMENT</span>
            </p>
            <p className="t-body-dim max-w-[52ch]">
              GVL is being built and tested. It is not a fielded system and we
              publish no certified performance figures for it.
            </p>
          </div>
          <Link href="/contact" className="t-label link-quiet text-ink">
            Request a briefing →
          </Link>
        </div>
      </section>
    </>
  );
}
