// Gate for the app/admin section.
//
// "Dev environment" covers both a local `next dev` box and a deployed preview /
// staging build — the latter runs with NODE_ENV=production, so NODE_ENV alone
// would lock you out of exactly the deployed environment you want to configure
// from. VERCEL_ENV distinguishes a preview deploy from the real one.
//
// Production is off, full stop: there is no token or bypass, because the admin
// has no authentication yet. Give it real auth before relaxing this.

export function isAdminEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;

  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv === 'preview' || vercelEnv === 'development';
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
