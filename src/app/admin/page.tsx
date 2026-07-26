import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Admin shell — REVISION_BRIEF §6.
 *
 * THIS is the authorisation boundary, not the middleware. The session is
 * re-verified here against the pool's JWKS on every request, and a customer
 * gets 403 rather than a redirect: redirecting would confirm the route exists
 * and is worth attacking.
 *
 * The sections below are scaffolding — the shell and the gate are real, the
 * features behind them are Slice 3.
 */
const SECTIONS = [
  { href: "/admin/jobs", label: "Jobs & applications", note: "Post roles, review applicants" },
  { href: "/admin/content", label: "Content", note: "Page copy and hero overlay text" },
  { href: "/admin/assets", label: "Assets", note: "Frame sequences, 3D and CAD files" },
  { href: "/admin/queries", label: "Queries", note: "Contact and shop enquiries" },
  { href: "/admin/orders", label: "Orders", note: "Briefing requests and consumer enquiries" },
  { href: "/admin/users", label: "Users", note: "Customer and admin accounts" },
];

export default async function AdminPage() {
  const session = await getSession();

  // Not signed in at all — send them to sign in.
  if (!session) redirect("/login?next=%2Fadmin");

  // Signed in but not an admin. 403, and say nothing about what is here.
  if (session.role !== "admin") {
    return (
      <section className="pt-32">
        <div className="shell flex flex-col items-start gap-6 py-24">
          <p className="t-label text-ink-faint">403</p>
          <h1 className="t-display-l text-ink">Not available to this account.</h1>
          <p className="t-body-dim max-w-[46ch]">
            You are signed in, but this area is not part of your access.
          </p>
          <a href="/account/" className="t-label link-quiet text-ink">
            Go to your account →
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32">
      <div className="shell pb-24">
        <div className="mb-14 flex flex-col gap-6 border-b border-rule pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-label mb-5 text-ink-faint">Admin</p>
            <h1 className="t-display-l text-ink">Control</h1>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="t-data text-ink-faint">
              {session.email ?? session.username} · GROUP{" "}
              <span className="text-ink">{session.groups.join(", ") || "—"}</span>
            </p>
            <SignOutButton />
          </div>
        </div>

        <ul className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <li key={s.href} className="bg-void p-8">
              <p className="t-display-m mb-2 text-ink">{s.label}</p>
              <p className="t-body-dim mb-6 text-[0.9rem]">{s.note}</p>
              <p className="t-label text-ink-faint">Not built yet</p>
            </li>
          ))}
        </ul>

        <p className="t-body-dim mt-12 max-w-[60ch] text-[0.9rem]">
          The gate is live: this page verifies your Cognito token server-side on
          every request and reads your group from it. The sections themselves
          are the next slice of work.
        </p>
      </div>
    </section>
  );
}
