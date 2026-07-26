import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** One login for everyone; the redirect after it is decided by role. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/account");

  const { next } = await searchParams;

  return (
    <section className="pt-32">
      <div className="shell grid gap-16 pb-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="t-label mb-6 text-ink-faint">Account</p>
          <h1 className="t-display-l text-ink">Sign in.</h1>
          <p className="t-body-dim mt-6 max-w-[38ch]">
            Access is by invitation. If you are expecting an account and cannot
            get in, contact us rather than trying repeatedly.
          </p>
        </div>

        <div className="md:col-span-5 md:col-start-7">
          <LoginForm next={next} />
        </div>
      </div>
    </section>
  );
}
