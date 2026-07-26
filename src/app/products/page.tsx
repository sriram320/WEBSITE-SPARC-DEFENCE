import type { Metadata } from "next";
import PortfolioIndex from "@/components/PortfolioIndex";

export const metadata: Metadata = {
  title: "Products",
  description:
    "The GVL navigation core and the platforms it flies on — observation, coordination, effector and high-speed airframes.",
};

export default function ProductsPage() {
  return (
    <>
      <section className="pt-32">
        <div className="shell grid gap-10 pb-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="t-label mb-6 text-ink-faint">Products</p>
            <h1 className="t-display-xl text-ink">One brain, many airframes.</h1>
          </div>
          <p className="t-body-dim md:col-span-5 md:col-start-8 md:self-end">
            GVL is the navigation core. Everything else here is a platform it
            inhabits. Development stage is stated on every page — none of these
            are fielded systems.
          </p>
        </div>
      </section>

      <PortfolioIndex />
    </>
  );
}
