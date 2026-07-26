import "server-only";

import { cookies } from "next/headers";
import { verifyAccessToken, verifyIdToken, type Role, type Session } from "./cognito";

/**
 * Session cookies.
 *
 * Tokens live in httpOnly cookies, never in localStorage or a JS-readable
 * cookie. That is the difference between an XSS bug leaking a token and an XSS
 * bug being contained: script on the page cannot read httpOnly cookies at all.
 *
 * SameSite=Lax blocks the cookie on cross-site POSTs, which removes the CSRF
 * class for state-changing requests without needing a token on every form.
 */
export const ACCESS_COOKIE = "sparc_at";
export const ID_COOKIE = "sparc_it";
export const REFRESH_COOKIE = "sparc_rt";

/**
 * A UI-only hint, readable by script — deliberately NOT httpOnly.
 *
 * It carries no authority whatsoever. It exists so the nav can render "Account"
 * instead of "Log in" without the root layout reading a token, which would make
 * every marketing page dynamic and cost us the static build. Forging it changes
 * a link label and nothing else: the server never reads it, and every protected
 * page re-verifies the real token regardless.
 */
export const HINT_COOKIE = "sparc_si";

const isProd = process.env.NODE_ENV === "production";

export const cookieOptions = {
  httpOnly: true,
  // Secure would break http://localhost in development, where there is no TLS.
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

/**
 * The current session, or null.
 *
 * Every call re-verifies the token signature rather than trusting a decoded
 * copy — cheap, because aws-jwt-verify caches the JWKS in memory, and it means
 * a revoked or expired token stops working the moment it should.
 */
export async function getSession(): Promise<(Session & { email?: string }) | null> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const session = await verifyAccessToken(accessToken);
  if (!session) return null;

  // Profile claims are display-only and must never gate anything, so a failure
  // to read them degrades the greeting rather than the session.
  const idToken = jar.get(ID_COOKIE)?.value;
  const profile = idToken ? await verifyIdToken(idToken) : null;

  return { ...session, email: profile?.email };
}

/** True only for a verified session carrying the admin group. */
export async function requireRole(role: Role): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;
  if (role === "admin" && session.role !== "admin") return null;
  return session;
}
