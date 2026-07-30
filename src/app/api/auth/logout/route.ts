import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoConfig } from "@/lib/auth/cognito";
import {
  ACCESS_COOKIE,
  ID_COOKIE,
  REFRESH_COOKIE,
  HINT_COOKIE,
  cookieOptions,
} from "@/lib/auth/session";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let client: CognitoIdentityProviderClient | null = null;
function getClient() {
  if (!client) {
    client = new CognitoIdentityProviderClient({ region: cognitoConfig.region });
  }
  return client;
}

/**
 * Sign-out.
 *
 * Clearing our cookies ends the session in this browser, but the tokens
 * themselves would remain valid until they expire. GlobalSignOut revokes them
 * at Cognito, so a token captured before logout cannot be replayed afterwards.
 * The pool has token revocation enabled, which is what makes this effective.
 *
 * Cookies are cleared whether or not the revocation succeeds — a failed revoke
 * must never leave the user apparently signed in.
 */
export async function POST() {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    try {
      await getClient().send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    } catch {
      // Already expired or revoked. Nothing to do; still clear the cookies.
    }
  }

  const res = NextResponse.json({ ok: true });
  for (const name of [ACCESS_COOKIE, ID_COOKIE, REFRESH_COOKIE, HINT_COOKIE]) {
    res.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
  }
  return res;
}
