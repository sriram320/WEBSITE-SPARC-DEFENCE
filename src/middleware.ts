import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth/session";

/**
 * First gate on protected routes.
 *
 * IMPORTANT — what this is and is not.
 *
 * Middleware runs on the edge runtime, where `aws-jwt-verify` cannot fetch and
 * cache the pool's JWKS the way it does in Node. So this only checks that a
 * session cookie is PRESENT, and redirects to /login when it is not. That is a
 * routing convenience, not an authorisation decision.
 *
 * The real check — verifying the token signature and reading `cognito:groups`
 * — happens in the page or route handler itself via requireRole(), which runs
 * on Node. Every protected page calls it. Nothing is authorised on the strength
 * of a cookie merely existing, because anyone can set a cookie.
 */
const PROTECTED = ["/admin", "/account"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsSession = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsSession) return NextResponse.next();

  if (!req.cookies.get(ACCESS_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
