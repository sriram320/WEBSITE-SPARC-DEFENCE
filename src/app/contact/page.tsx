import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { productBySlug } from "@/data/products";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a briefing on GVL and the platforms built around it. Sparc Aerotech, Bengaluru, India.",
};

/** Contact — BUILD_BRIEF §10. The briefing destination. */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productSlug } = await searchParams;
  const product = productSlug ? productBySlug(productSlug) : undefined;

  return (
    <>
      <section className="rule-b pt-32">
        <div className="shell grid gap-10 pb-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="t-label mb-6 text-ink-faint">Contact</p>
            <h1 className="t-display-xl text-ink">Request a briefing.</h1>
          </div>
          <p className="t-body-dim md:col-span-4 md:col-start-9 md:self-end">
            Tell us the problem you are working on. We will tell you honestly
            whether GVL is relevant to it yet, and what stage the work is
            actually at.
          </p>
        </div>
      </section>

      <section className="shell grid gap-16 py-20 md:grid-cols-12">
        <div className="md:col-span-6">
          <ContactForm productSlug={product?.slug} productName={product?.name} />
        </div>

        <div className="flex flex-col gap-10 md:col-span-4 md:col-start-9">
          <div className="border-t border-rule pt-6">
            <p className="t-label mb-3 text-ink-faint">Office</p>
            <p className="t-body-dim text-[0.95rem]">
              Sparc Aerotech Pvt Ltd
              <br />
              Bengaluru, Karnataka
              <br />
              India
            </p>
          </div>

          <div className="border-t border-rule pt-6">
            <p className="t-label mb-3 text-ink-faint">What we will not send</p>
            <p className="t-body-dim text-[0.95rem]">
              We do not publish or circulate specifications, performance figures
              or manufacturing detail. A briefing is a conversation, not a
              datasheet.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
