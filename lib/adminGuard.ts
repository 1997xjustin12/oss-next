// The admin gate as seen from a Server Component or Server Action.
//
// Split out from lib/admin.ts because this reads `cookies()` from next/headers,
// which is unavailable in the Edge runtime the proxy runs in. The proxy uses
// lib/admin.ts + lib/adminSession.ts directly and stays clear of this file.

import { cookies } from 'next/headers';
import { isAdminOpenEnv } from './admin';
import { ADMIN_COOKIE, verifyAdminToken } from './adminSession';

/**
 * The identity of the admin behind this request, or null.
 *
 * Returns a placeholder on an open dev box so callers can log or display
 * something without special-casing the environment.
 */
export async function currentAdminUser(): Promise<string | null> {
  if (isAdminOpenEnv()) return 'local-dev';

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

/** May this request use the admin section? */
export async function hasAdminAccess(): Promise<boolean> {
  return (await currentAdminUser()) !== null;
}
