"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    // Revokes the tokens at Cognito and clears the cookies. Navigate whatever
    // the outcome — the cookies are cleared either way.
    await fetch("/api/auth/logout/", { method: "POST" }).catch(() => {});
    router.replace("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="t-label link-quiet text-ink-faint hover:text-ink disabled:opacity-50"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
