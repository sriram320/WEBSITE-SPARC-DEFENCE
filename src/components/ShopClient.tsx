"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS } from "@/data/products";
import { productPhoto } from "@/data/assets";

/**
 * Shop — BUILD_BRIEF §10.
 *
 * Track A (defence): name, one line, category image, single action
 * "Request a briefing". Zero pricing, zero specifications — this is a hard rule
 * from §3, not a styling choice.
 *
 * Track B (consumer): open catalogue with indicative pricing and a
 * "Get in touch" modal that validates client-side and shows success. Nothing is
 * sent anywhere; there is no cart, checkout or payment.
 */
const CONSUMER = [
  {
    name: "GVL Pod (developer unit)",
    blurb:
      "Self-contained vision-navigation module for integrators evaluating GPS-alternative positioning on their own airframe.",
    price: "Indicative — on request",
  },
  {
    name: "GPS-alternative module",
    blurb:
      "Board-level navigation module for research and academic work on position-fixing without satellite reference.",
    price: "Indicative — on request",
  },
  {
    name: "Flight computer",
    blurb:
      "Compute board sized for carrying a vision-navigation workload alongside a standard autopilot.",
    price: "Indicative — on request",
  },
];

export default function ShopClient() {
  const [enquiry, setEnquiry] = useState<string | null>(null);
  const defence = PRODUCTS.filter((p) => p.slug !== "gvl-brain");

  return (
    <>
      <section className="rule-b pt-32">
        <div className="shell grid gap-10 pb-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="t-label mb-6 text-ink-faint">Shop</p>
            <h1 className="t-display-xl text-ink">Two very different lines.</h1>
          </div>
          <p className="t-body-dim md:col-span-4 md:col-start-9 md:self-end">
            Defence platforms are not sold from a web page. They are discussed in
            a briefing, and nothing on this site carries a price or a
            specification. The consumer line is an open catalogue.
          </p>
        </div>
      </section>

      {/* Track A — defence */}
      <section className="shell py-20" aria-label="Defence platforms">
        <p className="t-label mb-10 text-ink-faint">Defence — by briefing only</p>

        <ul className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {defence.map((p) => {
            const photo = productPhoto(p.frameKey ?? p.slug);
            return (
              <li key={p.slug} className="flex flex-col bg-void p-6">
                <div className="relative mb-6 aspect-[16/10] w-full overflow-hidden bg-panel">
                  {photo ? (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover opacity-80"
                    />
                  ) : (
                    <div className="brackets absolute inset-4" aria-hidden="true" />
                  )}
                </div>
                <p className="t-display-m mb-2 text-ink">{p.name}</p>
                <p className="t-body-dim mb-6 flex-1 text-[0.9rem]">{p.oneLiner}</p>
                <p className="t-label mb-4 text-ink-faint">STATUS — {p.status}</p>
                <Link href="/contact" className="t-label link-quiet self-start text-ink">
                  Request a briefing →
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Track B — consumer */}
      <section className="rule-t" aria-label="Consumer line">
        <div className="shell py-20">
          <p className="t-label mb-10 text-ink-faint">Consumer line</p>

          <ul className="border-t border-rule">
            {CONSUMER.map((c) => (
              <li
                key={c.name}
                className="grid gap-4 border-b border-rule py-8 md:grid-cols-12 md:items-center"
              >
                <p className="t-display-m text-ink md:col-span-4">{c.name}</p>
                <p className="t-body-dim text-[0.9rem] md:col-span-4">{c.blurb}</p>
                <p className="t-data text-ink-faint md:col-span-2">{c.price}</p>
                <button
                  type="button"
                  className="t-label link-quiet justify-self-start text-ink md:col-span-2 md:justify-self-end"
                  onClick={() => setEnquiry(c.name)}
                >
                  Get in touch →
                </button>
              </li>
            ))}
          </ul>

          <p className="t-body-dim mt-8 max-w-[56ch] text-[0.9rem]">
            There is no cart and no checkout. Enquiries are handled directly.
          </p>
        </div>
      </section>

      {enquiry && <EnquiryModal item={enquiry} onClose={() => setEnquiry(null)} />}
    </>
  );
}

/* ------------------------------------------------------------------- modal */

function EnquiryModal({ item, onClose }: { item: string; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name") ?? "").trim()) next.name = "Tell us who you are.";
    const email = String(data.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "A valid email address, please.";
    setErrors(next);
    // Frontend only — validated and acknowledged, nothing is transmitted.
    if (!Object.keys(next).length) setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-void/90 p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Enquire about ${item}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={dialogRef} className="w-full max-w-lg border border-rule bg-void p-8">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="t-label mb-3 text-ink-faint">Enquiry</p>
            <p className="t-display-m text-ink">{item}</p>
          </div>
          <button type="button" onClick={onClose} className="t-label text-ink-faint hover:text-ink">
            Close
          </button>
        </div>

        {sent ? (
          <div>
            <p className="t-body text-ink">Noted — thank you.</p>
            <p className="t-body-dim mt-3 text-[0.9rem]">
              This form is a demonstration and does not transmit anything. Use the
              contact page to reach us for real.
            </p>
            <Link href="/contact" className="t-label link-quiet mt-6 inline-block text-ink">
              Contact page →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <Field ref={firstField} name="name" label="Name" error={errors.name} />
            <Field name="email" label="Email" type="email" error={errors.email} />
            <Field name="note" label="Anything we should know" optional />
            <button type="submit" className="t-label link-quiet self-start text-ink">
              Send enquiry →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* Hairline field underlines, not boxes (§10). */
function Field({
  ref,
  name,
  label,
  type = "text",
  error,
  optional,
}: {
  ref?: React.Ref<HTMLInputElement>;
  name: string;
  label: string;
  type?: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`f-${name}`} className="t-label text-ink-faint">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        ref={ref}
        id={`f-${name}`}
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `e-${name}` : undefined}
        className="border-0 border-b border-rule-lit bg-transparent px-0 py-2 text-ink outline-none transition-colors duration-300 focus:border-ink"
      />
      {error && (
        <p id={`e-${name}`} className="t-data text-disrupt">
          {error}
        </p>
      )}
    </div>
  );
}
