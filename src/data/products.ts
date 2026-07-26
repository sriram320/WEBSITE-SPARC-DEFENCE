/**
 * The eight product records — BUILD_BRIEF §3, §8.
 *
 * COPY DISCIPLINE, enforced here because this file is where it would slip:
 *  - No buildable specifications. No propellant chemistry, no manufacturing
 *    detail, no certified performance numbers. Capability reads as design
 *    intent, never as verified spec.
 *  - No pricing on any defence product; the only defence CTA is
 *    "Request a briefing".
 *  - Human authorisation is retained for every engagement decision, stated
 *    plainly wherever an effector appears.
 *  - Honest development stage — never imply a fielded, combat-proven system.
 */

export type ProductStatus = "IN DEVELOPMENT" | "DEMONSTRATOR" | "ROADMAP";

export type Hotspot = {
  /** percentage position over the still, 0..100 */
  x: number;
  y: number;
  name: string;
  note: string;
};

export type Product = {
  slug: string;
  index: string;
  name: string;
  kind: string;
  oneLiner: string;
  status: ProductStatus;
  /** true when the product carries an effector — forces the human-in-loop line */
  effector: boolean;
  /** frame sequence key, when the product has real exploded frames */
  frameKey?: string;
  solves: string;
  brain: string;
  hotspots: Hotspot[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "gvl-brain",
    index: "01",
    name: "GVL Brain",
    kind: "Navigation core",
    oneLiner: "Vision-based position fixing where satellite navigation cannot be trusted.",
    status: "IN DEVELOPMENT",
    effector: false,
    solves:
      "Satellite navigation is the softest part of most airframes. It can be jammed with inexpensive equipment and spoofed with only slightly more, and a platform that cannot fix its own position is a platform that cannot finish its task. GVL removes that single point of failure by fixing position from what the aircraft can see rather than what it is told.",
    brain:
      "GVL is the brain itself. It matches imagery from the onboard camera against known geo-visual reference data to work out where the aircraft is, and keeps doing so while the satellite picture is degraded or absent. Every other platform in this catalogue is an airframe the brain inhabits.",
    hotspots: [
      { x: 50, y: 34, name: "Reference matcher", note: "Compares live imagery to stored geo-visual data." },
      { x: 32, y: 58, name: "Camera interface", note: "Takes the feed from the platform's existing optics." },
      { x: 68, y: 62, name: "Flight-controller link", note: "Publishes a position fix the autopilot can use." },
    ],
  },
  {
    slug: "retrofit-pod",
    index: "02",
    name: "Retrofit Pod",
    kind: "Add-on module",
    oneLiner: "Brings GVL navigation to airframes already in service.",
    status: "ROADMAP",
    effector: false,
    solves:
      "Most operators cannot replace a fleet to gain one capability. The pod is intended to add vision-based navigation to platforms that already fly, without redesigning them around it.",
    brain:
      "The pod carries the GVL core, its own optics and its own power, and presents a position fix to the host aircraft. It is designed to be additive rather than invasive.",
    hotspots: [
      { x: 42, y: 40, name: "Optics", note: "Self-contained camera so the host aircraft needs no change." },
      { x: 58, y: 66, name: "Mounting interface", note: "Common hardpoint fit." },
    ],
  },
  {
    slug: "legionnet",
    index: "03",
    name: "LegionNet",
    kind: "Coordination layer",
    oneLiner: "Keeps a group of aircraft working to one picture.",
    status: "ROADMAP",
    effector: false,
    solves:
      "Several aircraft over the same ground can easily duplicate each other's work or lose each other entirely once the link degrades. LegionNet is the layer that keeps a group coherent.",
    brain:
      "Each aircraft carries its own GVL fix, so the group stays organised around positions the aircraft worked out themselves rather than positions handed to them.",
    hotspots: [
      { x: 50, y: 44, name: "Group state", note: "Shared picture of who is where." },
      { x: 66, y: 60, name: "Link manager", note: "Degrades gracefully as the link weakens." },
    ],
  },
  {
    slug: "scout-isr",
    index: "04",
    name: "Scout / ISR",
    kind: "Observation platform",
    oneLiner: "Persistent observation with a stabilised camera core. Sensing only.",
    status: "DEMONSTRATOR",
    effector: false,
    frameKey: "scout",
    solves:
      "Holding a useful picture over an area for a sustained period is difficult when the aircraft cannot rely on satellite positioning. Scout is built around holding position and holding the frame, so an operator gets continuity rather than snapshots.",
    brain:
      "GVL keeps the aircraft's position honest when the satellite picture is denied, which is what lets the camera stay on the thing that matters instead of drifting off it.",
    hotspots: [
      { x: 50, y: 30, name: "GPS module", note: "Used when available; not depended on." },
      { x: 30, y: 46, name: "Carbon airframe", note: "Rigid platform for a stable image." },
      { x: 52, y: 72, name: "Stabilised camera core", note: "Sensing only. Never an effector." },
      { x: 70, y: 40, name: "Flight controller", note: "Holds attitude and position." },
    ],
  },
  {
    slug: "loitering",
    index: "05",
    name: "Loitering Platform",
    kind: "Effector platform",
    oneLiner: "Holds over an area under operator control. Engagement is human-commanded.",
    status: "ROADMAP",
    effector: true,
    solves:
      "A platform that can hold over an area for a useful period gives an operator time to decide. The design intent is to widen that decision window, not to remove the person from it.",
    brain:
      "GVL holds the platform's position through the loiter, including where the satellite picture is degraded, so the operator keeps a stable picture to decide from.",
    hotspots: [
      { x: 50, y: 36, name: "Navigation core", note: "Holds position through the loiter." },
      { x: 44, y: 64, name: "Seeker optics", note: "Provides the operator's picture." },
      { x: 62, y: 70, name: "Payload interface", note: "Armed and released only on operator command." },
    ],
  },
  {
    slug: "guided-munition",
    index: "06",
    name: "Guided Munition",
    kind: "Effector platform",
    oneLiner: "Terminal guidance through jammed approaches. The operator authorises every engagement.",
    status: "ROADMAP",
    effector: true,
    frameKey: "munition",
    solves:
      "An approach that depends on satellite navigation can be broken by jamming at exactly the moment accuracy matters most. The design intent is to keep guidance working through a denied approach so that accuracy does not collapse — which is itself a safety property, because a guided round that loses its reference is the dangerous one.",
    brain:
      "GVL provides the positional reference through the approach. Correction is automated; the decision to engage is not, and is not designed to be. An operator authorises the engagement and retains that authority throughout.",
    hotspots: [
      { x: 50, y: 28, name: "Navigation core", note: "Positional reference through a denied approach." },
      { x: 50, y: 52, name: "Control section", note: "Applies correction to the flight path." },
      { x: 50, y: 76, name: "Payload section", note: "Inert until an operator authorises the engagement." },
    ],
  },
  {
    slug: "interceptor",
    index: "07",
    name: "Interceptor",
    kind: "Counter-air platform",
    oneLiner: "Intended to meet small uncrewed aircraft under operator direction.",
    status: "ROADMAP",
    effector: true,
    solves:
      "Small uncrewed aircraft are cheap to field and awkward to answer. The intent is a proportionate response that an operator directs.",
    brain:
      "GVL keeps the interceptor's own navigation working in the same contested airspace it is being sent into.",
    hotspots: [
      { x: 50, y: 40, name: "Navigation core", note: "Works in the airspace it is sent into." },
      { x: 54, y: 66, name: "Engagement interface", note: "Directed by an operator." },
    ],
  },
  {
    slug: "microjet",
    index: "08",
    name: "Microjet",
    kind: "High-speed platform",
    oneLiner: "A faster airframe for the same navigation problem.",
    status: "ROADMAP",
    effector: false,
    solves:
      "Some tasks are bounded by how quickly an aircraft can cover ground. Microjet is the high-speed end of the platform range.",
    brain:
      "Higher speed shortens the time available to resolve a position, which makes a navigation source that does not depend on satellites more valuable, not less.",
    hotspots: [
      { x: 44, y: 44, name: "Navigation bay", note: "Carries the GVL core." },
      { x: 62, y: 58, name: "Propulsion", note: "High-speed airframe." },
    ],
  },
];

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function adjacent(slug: string): { prev: Product; next: Product } {
  const i = PRODUCTS.findIndex((p) => p.slug === slug);
  const n = PRODUCTS.length;
  return {
    prev: PRODUCTS[(i - 1 + n) % n],
    next: PRODUCTS[(i + 1) % n],
  };
}
