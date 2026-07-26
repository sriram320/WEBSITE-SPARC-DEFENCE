"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The one login form — REVISION_BRIEF auth addendum §4.
 *
 * Built in the site's design system rather than dropped in from a component
 * library: hairline field underlines, mono labels, no filled buttons.
 *
 * It posts credentials to our own route, which talks to Cognito and sets
 * httpOnly cookies. No token ever reaches this component, and there is no
 * client-side notion of "who is signed in" that could be edited — where the
 * user lands next is decided by the server from a verified token.
 */
export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? "Sign-in failed.");
        setBusy(false);
        return;
      }

      // `next` is only honoured when it is a same-site absolute path, so a
      // crafted ?next=https://evil.example cannot turn this into an open
      // redirect off the back of a successful login.
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.replace(safeNext ?? (body.role === "admin" ? "/admin" : "/account"));
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8 border-t border-rule pt-8">
      <Field name="email" label="Email" type="email" autoComplete="username" />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />

      {error && (
        <p className="t-data text-disrupt" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="t-label link-quiet self-start text-ink disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in →"}
      </button>

      <p className="t-data text-ink-faint">
        Passwords are handled by AWS Cognito. This site never stores one.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type,
  autoComplete,
}: {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={`l-${name}`} className="t-label text-ink-faint">
        {label}
      </label>
      <input
        id={`l-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full border-0 border-b border-rule-lit bg-transparent px-0 py-3 text-ink outline-none transition-colors duration-300 focus:border-ink"
      />
    </div>
  );
}
