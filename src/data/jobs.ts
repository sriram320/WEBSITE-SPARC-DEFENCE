/**
 * Open roles — REVISION_BRIEF §4.
 *
 * A typed stub so /careers is real immediately. In Slice 3 the admin panel
 * becomes the source of these records and this file is replaced by an API read;
 * the shape below is deliberately the shape a `jobs` table row would have, so
 * swapping the data source does not change the page.
 *
 * Copy discipline from BUILD_BRIEF §3 still applies — describe the work
 * honestly, claim no fielded systems, and publish no specifications.
 */

export type JobStatus = "open" | "closed";

export type Job = {
  id: string;
  title: string;
  team: string;
  location: string;
  /** on-site / hybrid / remote */
  mode: string;
  status: JobStatus;
  summary: string;
  responsibilities: string[];
  looking: string[];
};

export const JOBS: Job[] = [
  {
    id: "cv-engineer",
    title: "Computer vision engineer",
    team: "GVL",
    location: "Bengaluru",
    mode: "On-site",
    status: "open",
    summary:
      "Work on the matching layer at the centre of GVL — comparing live imagery against geo-visual reference data well enough to fix an aircraft's position without a satellite.",
    responsibilities: [
      "Build and evaluate image-matching approaches against real flight footage.",
      "Work out where the method degrades — lighting, season, altitude, terrain — and make that behaviour predictable.",
      "Take promising results from notebook to something that runs on the aircraft's compute budget.",
    ],
    looking: [
      "Strong fundamentals in geometry and classical vision, not only deep learning.",
      "Comfort working with messy real-world imagery rather than clean benchmarks.",
      "Willingness to be measured on whether it works in the field.",
    ],
  },
  {
    id: "embedded-engineer",
    title: "Embedded systems engineer",
    team: "Platforms",
    location: "Bengaluru",
    mode: "On-site",
    status: "open",
    summary:
      "Own the software that runs on the airframe — flight-controller integration, sensor plumbing, and getting the navigation core the inputs it needs when it needs them.",
    responsibilities: [
      "Integrate the navigation core with autopilot stacks and onboard sensors.",
      "Keep timing, power and thermal behaviour honest on constrained hardware.",
      "Build the logging and replay tooling that makes flight failures diagnosable.",
    ],
    looking: [
      "Real experience with embedded Linux or an RTOS on flying or moving hardware.",
      "C/C++ and Python, and the judgement to know which belongs where.",
      "Care about what happens when a subsystem fails mid-flight.",
    ],
  },
  {
    id: "flight-test",
    title: "Flight test engineer",
    team: "Platforms",
    location: "Bengaluru",
    mode: "On-site + field",
    status: "open",
    summary:
      "Design and run the tests that tell us whether any of this actually works, and report the results without flattering them.",
    responsibilities: [
      "Plan test campaigns that isolate one variable at a time.",
      "Run field trials safely and within the applicable regulations.",
      "Turn flight data into conclusions the engineering team can act on.",
    ],
    looking: [
      "Hands-on UAV operation experience and a serious approach to safety.",
      "Rigour about instrumentation and repeatability.",
      "Comfort saying a result was inconclusive when it was.",
    ],
  },
  {
    id: "mechanical-design",
    title: "Mechanical design engineer",
    team: "Platforms",
    location: "Bengaluru",
    mode: "On-site",
    status: "open",
    summary:
      "Design airframes and mounts around a navigation core that has real optical and vibration requirements.",
    responsibilities: [
      "Take airframe and payload mounts from CAD through fabrication to flight.",
      "Solve for stiffness, vibration isolation and serviceability together.",
      "Work directly with the vision team on where optics sit and how steady they stay.",
    ],
    looking: [
      "Fluent CAD and a track record of parts that were actually manufactured.",
      "Composites or carbon-fibre structures experience is useful.",
      "Interest in the whole aircraft, not only the bracket in front of you.",
    ],
  },
];

export function openJobs(): Job[] {
  return JOBS.filter((j) => j.status === "open");
}

export function jobById(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
