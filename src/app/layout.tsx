import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import { TelemetryProvider } from "@/components/Telemetry";

/* Type — BUILD_BRIEF §4.2. A high-contrast display serif is what makes the page
   read as a maison rather than a SaaS template; a restrained grotesk carries
   the prose (never plain Inter); mono carries every readout. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const grotesk = Inter_Tight({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const monoData = JetBrains_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sparc Aerotech — navigation for GPS-denied airspace",
    template: "%s — Sparc Aerotech",
  },
  description:
    "Sparc Aerotech builds GVL, a vision-based navigation system for airspace where GPS is jammed, spoofed or denied, and the platforms it flies on. Designed and integrated in India.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${grotesk.variable} ${monoData.variable} antialiased`}
    >
      <body className="bg-void text-ink">
        <SmoothScroll />
        <TelemetryProvider>
          <a
            href="#main"
            className="t-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-panel focus:px-4 focus:py-3 focus:text-ink"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main" className="pb-8">
            {children}
          </main>
          <SiteFooter />
        </TelemetryProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="rule-t">
      <div className="shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="t-label text-ink-faint">
          Sparc Aerotech Pvt Ltd · Bengaluru, India
        </p>
        <p className="t-label max-w-md text-ink-faint">
          Capability shown reflects design intent and development status, not
          certified performance.
        </p>
      </div>
    </footer>
  );
}
