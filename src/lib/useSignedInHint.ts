"use client";

import { useEffect, useState } from "react";

/**
 * Whether to render "Account" or "Log in" in the nav.
 *
 * Reads the script-readable hint cookie set alongside the real session. This is
 * presentation only and carries no authority: forging it changes a link label,
 * and following that link lands on a page that verifies the actual token
 * server-side and redirects you straight back to /login.
 *
 * Deliberately starts false and settles after mount, so the server-rendered
 * markup is identical for everyone and the marketing pages stay static.
 */
export function useSignedInHint(): boolean {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const read = () =>
      setSignedIn(
        document.cookie.split(";").some((c) => c.trim().startsWith("sparc_si=1")),
      );
    read();
    // Re-check when the tab regains focus, so signing out in another tab is
    // reflected here rather than showing a stale "Account".
    window.addEventListener("focus", read);
    return () => window.removeEventListener("focus", read);
  }, []);

  return signedIn;
}
