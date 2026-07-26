import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  type InitiateAuthCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoConfig, verifyAccessToken } from "@/lib/auth/cognito";
import {
  ACCESS_COOKIE,
  ID_COOKIE,
  REFRESH_COOKIE,
  HINT_COOKIE,
  cookieOptions,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sign-in — REVISION_BRIEF auth addendum §3, §5.
 *
 * The credentials go browser -> our server -> Cognito, and the tokens come back
 * the same way and are written straight into httpOnly cookies. The browser
 * never holds a token in readable storage, so script on the page has nothing to
 * steal.
 *
 * Cognito owns the password: hashing, reset, verification and MFA are its job,
 * and there is no local password table anywhere in this codebase.
 */

const client = new CognitoIdentityProviderClient({ region: cognitoConfig.region });

/**
 * Deliberately identical for "no such user" and "wrong password". Telling the
 * two apart hands an attacker a way to enumerate valid accounts.
 */
const GENERIC_ERROR = "Those credentials were not accepted.";

/**
 * Rate limiting — in-memory, per instance.
 *
 * This is a floor, not the finished control: a serverless deployment runs many
 * instances and each keeps its own counter, so a determined attacker gets more
 * attempts than the number below implies. Slice 4 replaces this with Upstash so
 * the limit is shared. It is here now because shipping a login endpoint with no
 * throttle at all is worse than shipping an imperfect one.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now > rec.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "unknown").trim();
}

export async function POST(req: Request) {
  let email = "";
  let password = "";

  try {
    const body = await req.json();
    email = typeof body.email === "string" ? body.email.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  if (rateLimited(`${clientKey(req)}:${email.toLowerCase()}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in fifteen minutes." },
      { status: 429 },
    );
  }

  let result: InitiateAuthCommandOutput;
  try {
    result = await client.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: cognitoConfig.clientId,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }),
    );
  } catch {
    // Never surface Cognito's own message — it distinguishes UserNotFound from
    // NotAuthorized, which is exactly the leak we are avoiding.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // MFA or a forced password change comes back as a challenge rather than
  // tokens. Not yet handled end to end; say so plainly instead of failing in a
  // way that looks like wrong credentials.
  if (result.ChallengeName) {
    return NextResponse.json(
      {
        error:
          "This account needs an additional step to sign in that is not built yet.",
        challenge: result.ChallengeName,
      },
      { status: 501 },
    );
  }

  const auth = result.AuthenticationResult;
  if (!auth?.AccessToken || !auth.IdToken) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // Verify what we just received before trusting it enough to route on. If this
  // fails, something is wrong with the pool configuration, not the password.
  const session = await verifyAccessToken(auth.AccessToken);
  if (!session) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const res = NextResponse.json({ role: session.role });

  const maxAge = auth.ExpiresIn ?? 3600;
  res.cookies.set(ACCESS_COOKIE, auth.AccessToken, { ...cookieOptions, maxAge });
  res.cookies.set(ID_COOKIE, auth.IdToken, { ...cookieOptions, maxAge });
  if (auth.RefreshToken) {
    res.cookies.set(REFRESH_COOKIE, auth.RefreshToken, {
      ...cookieOptions,
      maxAge: 5 * 24 * 60 * 60, // matches the pool's 5-day refresh expiry
    });
  }

  // UI-only, script-readable, carries no authority (see HINT_COOKIE).
  res.cookies.set(HINT_COOKIE, "1", { ...cookieOptions, httpOnly: false, maxAge });

  return res;
}
