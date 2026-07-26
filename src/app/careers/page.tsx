import type { Metadata } from "next";
import CareersList from "@/components/CareersList";
import Reveal from "@/components/Reveal";
import { openJobs } from "@/data/jobs";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles at Sparc Aerotech — computer vision, embedded systems, flight test and mechanical design, working on navigation for GPS-denied airspace.",
};

/** Careers — REVISION_BRIEF §4. Public listings; the admin panel feeds these in Slice 3. */
export default function CareersPage() {
  const jobs = openJobs();

  return (
    <>
      <section className="pt-32">
        <div className="shell grid gap-10 pb-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="t-label mb-6 text-ink-faint">Careers</p>
            <h1 className="t-display-xl text-ink">
              Build India&rsquo;s defence autonomy stack.
            </h1>
          </div>
          <div className="flex flex-col gap-5 md:col-span-4 md:col-start-9 md:self-end">
            <p className="t-body-dim">
              We are a small team working on a genuinely hard problem: fixing an
              aircraft&rsquo;s position when satellite navigation cannot be
              trusted. The work is early, the results get tested in the field,
              and nobody here is insulated from whether it works.
            </p>
            <p className="t-body-dim">
              If that sounds like the job rather than the risk, we should talk.
            </p>
          </div>
        </div>
      </section>

      <CareersList jobs={jobs} />

      <section className="rule-t" aria-label="Speculative applications">
        <Reveal as="div" className="shell flex flex-col items-start gap-6 py-20">
          <p className="t-label text-ink-faint">Nothing that fits?</p>
          <p className="t-display-m max-w-[34ch] text-ink">
            Tell us what you would work on.
          </p>
          <p className="t-body-dim max-w-[52ch]">
            We would rather hear from someone who has thought about the problem
            than fill a slot. Write to us through the contact page and say what
            you would want to build.
          </p>
          <a href="/contact/" className="t-label link-quiet text-ink">
            Get in touch →
          </a>
        </Reveal>
      </section>
    </>
  );
}
