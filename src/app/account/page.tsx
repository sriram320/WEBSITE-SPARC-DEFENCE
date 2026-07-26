import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Customer area. Any verified session may see this; admins land here too. */
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount");

  return (
    <section className="pt-32">
      <div className="shell pb-24">
        <div className="mb-14 flex flex-col gap-6 border-b border-rule pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-label mb-5 text-ink-faint">Account</p>
            <h1 className="t-display-l text-ink">
              {session.email ?? session.username}
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            {session.role === "admin" && (
              <Link href="/admin" className="t-label link-quiet text-ink">
                Admin panel →
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="t-label mb-4 text-ink-faint">Briefing requests</p>
            <p className="t-body-dim text-[0.9rem]">
              Requests you have sent will appear here once the backend is
              connected.
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="t-label mb-4 text-ink-faint">Enquiries</p>
            <p className="t-body-dim text-[0.9rem]">
              Consumer-line enquiries and their status.
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="t-label mb-4 text-ink-faint">Profile</p>
            <p className="t-body-dim text-[0.9rem]">
              Passwords and multi-factor settings are managed by AWS Cognito, not
              by this site.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
