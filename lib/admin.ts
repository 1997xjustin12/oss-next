// Gate for the app/admin section.
//
// Two independent conditions, and a request needs one of them:
//
//   1. isAdminOpenEnv() — a local `next dev` box, where admin is open. There is
//      no meaningful boundary to defend on localhost, and requiring a login for
//      every fresh dev session buys nothing.
//   2. A valid admin session cookie — everywhere else, including preview
//      deploys and production. Issued by /api/auth/login only after the backend
//      authenticated the credentials and the returned identity matched
//      ADMIN_USERNAMES. See lib/adminSession.ts.
//
// Enforced in three places, and all three are load-bearing:
//   - proxy.ts, which is what a visitor actually hits and the only layer that
//     can return a real 404 status before anything renders;
//   - app/admin/layout.tsx, so no admin markup or data can reach a response
//     even if a route somehow bypassed the proxy;
//   - each admin Server Action, because a form's POST target is its own
//     endpoint and a layout gate does not cover it.
//
// Before this existed the section was hard-404'd in production because it had
// no authentication. It has authentication now; that is what changed.

import { ADMIN_USERNAMES } from '@/config/admin';

/**
 * True only where /admin needs no login: a local development box.
 *
 * Preview deploys run with NODE_ENV=production, so they land on the cookie path
 * along with the real site. That is deliberate — a preview URL is reachable by
 * anyone who has the link, which makes it exactly the environment where an open
 * admin is most likely to be found by someone who should not have it.
 */
export function isAdminOpenEnv(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * True on a dev box or a Vercel preview/development deploy — never on the real
 * site. Not an admin check: this is for dev-only conveniences elsewhere, such
 * as forcing a specific A/B variant from a query parameter.
 */
export function isPreviewOrDev(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;

  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv === 'preview' || vercelEnv === 'development';
}

/**
 * Does any of these identities appear on the allowlist?
 *
 * Callers pass every identity the backend gave them — typically username and
 * email — because the list holds both kinds and we do not know which one a
 * given account was entered under.
 *
 * Compared case-insensitively: email addresses are not case-sensitive in
 * practice, and an admin who types `Denver@…` should not silently be treated as
 * a stranger. This does assume the backend will not issue two distinct accounts
 * whose usernames differ only in case.
 */
export function isAdminIdentity(...identities: (string | null | undefined)[]): boolean {
  const allowed = ADMIN_USERNAMES.map((name) => name.trim().toLowerCase());

  return identities.some((identity) => {
    const value = identity?.trim().toLowerCase();
    return !!value && allowed.includes(value);
  });
}

/**
 * Path prefixes served by the admin section, for the proxy's gate.
 *
 * One prefix covers every current and future admin route — which is the whole
 * reason the section lives under a real `/admin` segment rather than a route
 * group. A new admin page can't accidentally ship ungated.
 */
export const ADMIN_PATHS: readonly string[] = ['/admin'];

export function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
