import "server-only";

import { CognitoJwtVerifier } from "aws-jwt-verify";

/**
 * Cognito configuration and token verification — REVISION_BRIEF auth addendum §5.
 *
 * `server-only` at the top is load-bearing: importing this file from a client
 * component becomes a build error rather than a silent leak of auth logic into
 * the browser bundle.
 *
 * The pool and client IDs are not secrets, but they are read from server env
 * and never exposed through NEXT_PUBLIC_, because nothing in the browser needs
 * them — the whole OIDC exchange happens server-side.
 */
function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing ${name}. Auth cannot start without it — set it in .env.local locally and in Amplify environment variables for deploys.`,
    );
  }
  return v;
}

export const cognitoConfig = {
  get region() {
    return required("COGNITO_REGION");
  },
  get userPoolId() {
    return required("COGNITO_USER_POOL_ID");
  },
  get clientId() {
    return required("COGNITO_CLIENT_ID");
  },
};

/** Roles are Cognito groups. The pool already uses these names. */
export const GROUP_ADMIN = "hosts";
export const GROUP_CUSTOMER = "members";

export type Role = "admin" | "customer";

export type Session = {
  /** Cognito `sub` — the stable user id application rows should key on */
  userId: string;
  email?: string;
  username: string;
  groups: string[];
  role: Role;
  /** unix seconds */
  expiresAt: number;
};

/**
 * Verifiers are cached by the library (it fetches and caches the pool's JWKS),
 * so these are created once per server instance rather than per request.
 *
 * The access token carries `cognito:groups`, which is what authorisation reads.
 * The id token carries the profile claims we show in the UI.
 */
let accessVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;
let idVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getAccessVerifier() {
  if (!accessVerifier) {
    accessVerifier = CognitoJwtVerifier.create({
      userPoolId: cognitoConfig.userPoolId,
      tokenUse: "access",
      clientId: cognitoConfig.clientId,
    });
  }
  return accessVerifier;
}

function getIdVerifier() {
  if (!idVerifier) {
    idVerifier = CognitoJwtVerifier.create({
      userPoolId: cognitoConfig.userPoolId,
      tokenUse: "id",
      clientId: cognitoConfig.clientId,
    });
  }
  return idVerifier;
}

/** A group list maps to exactly one role; admin wins if somehow both are present. */
export function roleFromGroups(groups: string[]): Role {
  return groups.includes(GROUP_ADMIN) ? "admin" : "customer";
}

/**
 * Verify an access token's SIGNATURE and claims against the pool's JWKS.
 *
 * This is the only thing that may be trusted for authorisation. A decoded but
 * unverified token is attacker-controlled: anyone can craft one claiming
 * `cognito:groups: ["hosts"]`. Signature verification is what makes the claim
 * mean something.
 */
export async function verifyAccessToken(token: string): Promise<Session | null> {
  try {
    const payload = await getAccessVerifier().verify(token);
    const groups = (payload["cognito:groups"] as string[] | undefined) ?? [];
    return {
      userId: String(payload.sub),
      username: String(payload.username ?? payload.sub),
      groups,
      role: roleFromGroups(groups),
      expiresAt: Number(payload.exp),
    };
  } catch {
    // Expired, tampered, wrong pool, wrong client, wrong token_use — all of it
    // lands here and all of it means "not authenticated".
    return null;
  }
}

/** Profile claims for display only. Never used for authorisation. */
export async function verifyIdToken(
  token: string,
): Promise<{ email?: string; name?: string } | null> {
  try {
    const payload = await getIdVerifier().verify(token);
    return {
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}
