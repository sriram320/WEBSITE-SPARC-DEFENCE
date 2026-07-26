import type { Metadata } from "next";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Defence platforms are available by briefing only, with no pricing. The consumer line covers navigation modules and flight computers.",
};

/** Shop — BUILD_BRIEF §10. Two tracks, one page. No cart, no checkout. */
export default function ShopPage() {
  return <ShopClient />;
}
