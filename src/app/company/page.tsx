import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { productPhoto } from "@/data/assets";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Sparc Aerotech is an Indian defence technology company building GVL, vision-based navigation for GPS-denied airspace, and the platforms it flies on.",
};

/**
 * Company — BUILD_BRIEF §9.
 * Real milestones only. No invented funding rounds, customers or partnerships.
 */
const TIMELINE = [
  {
    when: "Company",
    what: "Sparc Aerotech Pvt Ltd founded in India, with an India-first mandate for defence navigation technology.",
  },
  {
    when: "GVL",
    what: "Geo-Visual Localization enters active development as the company's flagship programme.",
  },
  {
    when: "Platforms",
    what: "Observation and effector airframes built as demonstrators for the navigation core, with further platforms on the roadmap.",
  },
];

export default function CompanyPage() {
  const macro = productPhoto("munition");

  return (
    <>
      <section className="rule-b pt-32">
        <div className="shell grid gap-10 pb-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="t-label mb-6 text-ink-faint">Company</p>
            <h1 className="t-display-xl text-ink">
              Built in India, for airspace nobody can guarantee.
            </h1>
          </div>
          <p className="t-body-dim md:col-span-4 md:col-start-9 md:self-end">
            Sparc Aerotech is a defence technology company. Our flagship is GVL —
            navigation that works when satellite positioning does not — and the
            platforms we build exist to carry it.
          </p>
        </div>
      </section>

      <section aria-label="Thesis">
        <div className="shell grid gap-10 py-24 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="t-label text-ink-faint">Thesis</p>
          </div>
          <div className="flex flex-col gap-6 md:col-span-7 md:col-start-5">
            <h2 className="t-display-l text-ink">
              The hard part is knowing where you are.
            </h2>
            <p className="t-body">
              A great deal of autonomy research assumes a reliable position fix
              and builds upward from there. In contested airspace that assumption
              is the first thing to go. We took the opposite starting point:
              solve position-fixing without satellites, then design airframes
              around a navigation core that holds.
            </p>
            <p className="t-body-dim">
              India-first is a design constraint, not a slogan. Building here
              means we own the integration end to end and can be accountable for
              it in front of the people who would have to rely on it.
            </p>
          </div>
        </div>
      </section>

      {macro && (
        <div className="relative h-[56svh] min-h-[340px] w-full overflow-hidden">
          <Image
            src={macro}
            alt="A Sparc Aerotech platform in flight, carrying a payload pouch."
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, #060606 0%, transparent 24%, transparent 72%, #060606 100%)",
            }}
            aria-hidden="true"
          />
        </div>
      )}

      <section className="rule-t" aria-label="Where the work stands">
        <div className="shell py-24">
          <p className="t-label mb-12 text-ink-faint">Where the work stands</p>
          <ol className="border-t border-rule">
            {TIMELINE.map((t) => (
              <li key={t.when} className="grid gap-4 border-b border-rule py-8 md:grid-cols-12">
                <p className="t-label text-ink md:col-span-3">{t.when}</p>
                <p className="t-body-dim md:col-span-8 md:col-start-5">{t.what}</p>
              </li>
            ))}
          </ol>
          <p className="t-body-dim mt-10 max-w-[60ch]">
            We list only what is true today. There are no customer names,
            contracts or funding announcements on this page because there are
            none we are in a position to publish.
          </p>
        </div>
      </section>

      <section className="rule-t" aria-label="Next step">
        <div className="shell flex flex-col gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <p className="t-display-m max-w-[28ch] text-ink">
            If this is relevant to your problem, talk to us.
          </p>
          <Link href="/contact" className="t-label link-quiet text-ink">
            Request a briefing →
          </Link>
        </div>
      </section>
    </>
  );
}
