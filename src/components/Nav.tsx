"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useScrolledPast } from "@/lib/useMediaQuery";
import { useSignedInHint } from "@/lib/useSignedInHint";

/**
 * Whisper-thin fixed nav — BUILD_BRIEF §6.1.
 * Transparent at the top; after ~40px it gains a 1px --rule bottom border and a
 * --void/85 backdrop. No shadow, no glass.
 */
const LINKS = [
  { href: "/gvl", label: "GVL" },
  { href: "/products", label: "Products" },
  { href: "/company", label: "Company" },
  { href: "/careers", label: "Careers" },
  { href: "/shop", label: "Shop" },
];

export default function Nav() {
  const scrolled = useScrolledPast(40);
  const pathname = usePathname();
  // Read from the UI-only hint cookie rather than a session lookup on the
  // server: reading a token in the root layout would make every marketing page
  // dynamic. This only decides a link label — it grants nothing.
  const signedIn = useSignedInHint();
  // Remember which route the menu was opened on, so navigating closes it
  // without needing an effect to chase the pathname.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (v: boolean) => setOpenedOn(v ? pathname : null);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500",
        scrolled
          ? "border-b border-rule bg-void/85 backdrop-blur-[3px]"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
      style={{ transitionTimingFunction: "var(--ease-slow)" }}
    >
      <nav className="shell flex h-14 items-center justify-between" aria-label="Primary">
        <Link href="/" className="t-label text-ink no-underline">
          SPARC<span className="text-ink-faint"> AEROTECH</span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "t-label no-underline transition-colors duration-200",
                pathname.startsWith(l.href) ? "text-ink" : "text-ink-faint hover:text-ink",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="t-label text-ink no-underline link-quiet">
            Request a briefing
          </Link>
          <Link
            href={signedIn ? "/account" : "/login"}
            className="t-label text-ink-faint no-underline transition-colors duration-200 hover:text-ink"
          >
            {signedIn ? "Account" : "Log in"}
          </Link>
        </div>

        <button
          type="button"
          className="t-label text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-rule bg-void md:hidden">
          <div className="shell flex flex-col gap-5 py-6">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="t-label text-ink no-underline">
                {l.label}
              </Link>
            ))}
            <Link href="/contact" className="t-label text-ink no-underline link-quiet self-start">
              Request a briefing
            </Link>
            <Link href={signedIn ? "/account" : "/login"} className="t-label text-ink-faint no-underline">
              {signedIn ? "Account" : "Log in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
