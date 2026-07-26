/**
 * Hero narrative overlays — BUILD_BRIEF §6.2.
 *
 * Four beats per product, fading in and out across their scroll range,
 * alternating sides. Serif headline, mono/grotesk sub.
 *
 * COPY DISCIPLINE (§3): no buildable specifications, no performance numbers,
 * honest development stage. For the Guided Munition the human-in-the-loop line
 * is not optional — the copy must never imply autonomous engagement.
 */

export type OverlaySide = "left" | "right" | "center";

export type HeroBeat = {
  /** scroll fraction through the pin, 0..1 */
  from: number;
  to: number;
  side: OverlaySide;
  headline: string;
  sub: string;
  cta?: { label: string; href: string };
};

export type HeroProduct = {
  key: string;
  /** switcher label */
  label: string;
  /** spoken name used in the telemetry rail */
  railName: string;
  ariaLabel: string;
  beats: HeroBeat[];
};

export const HERO_PRODUCTS: HeroProduct[] = [
  {
    key: "scout",
    label: "Scout",
    railName: "SCOUT / ISR",
    ariaLabel:
      "Scout ISR quadcopter, shown disassembling into its component modules as the page scrolls.",
    beats: [
      {
        from: 0,
        to: 0.2,
        side: "center",
        headline: "Scout / ISR",
        sub: "Persistent eyes. No blind spots.",
      },
      {
        from: 0.2,
        to: 0.45,
        side: "left",
        headline: "The payload, exposed.",
        sub: "Stabilised camera core. Sensing only — never an effector.",
      },
      {
        from: 0.45,
        to: 0.7,
        side: "right",
        headline: "The brain inside.",
        sub: "GVL navigation holds position when GPS is denied.",
      },
      {
        from: 0.7,
        to: 1,
        side: "center",
        headline: "Every part accounted for.",
        sub: "Designed and integrated in India.",
        cta: { label: "Request a briefing", href: "/contact" },
      },
    ],
  },
  {
    key: "munition",
    label: "Guided Munition",
    railName: "GUIDED MUNITION",
    ariaLabel:
      "Guided munition airframe, shown disassembling into its component modules as the page scrolls.",
    beats: [
      {
        from: 0,
        to: 0.2,
        side: "center",
        headline: "Guided Munition",
        sub: "Precision, under human command.",
      },
      {
        from: 0.2,
        to: 0.45,
        side: "left",
        headline: "Guidance, laid bare.",
        sub: "Correction is automated. The decision to engage is not.",
      },
      {
        from: 0.45,
        to: 0.7,
        side: "right",
        headline: "The brain inside.",
        sub: "GVL guidance through jammed, GPS-denied approaches.",
      },
      {
        from: 0.7,
        to: 1,
        side: "center",
        headline: "Assembled with intent.",
        sub: "An operator authorises every engagement.",
        cta: { label: "Request a briefing", href: "/contact" },
      },
    ],
  },
];

export function heroProduct(key: string): HeroProduct {
  return HERO_PRODUCTS.find((p) => p.key === key) ?? HERO_PRODUCTS[0];
}
