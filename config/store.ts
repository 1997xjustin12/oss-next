// Which store this deployment is serving. Every Redis key this app writes is
// namespaced under this value, so one Upstash instance can back all four
// storefronts without their keys colliding (see services/seo.service.ts).
//
// Deliberately NOT derived from NEXT_PUBLIC_STORE_DOMAIN — that value is empty
// on localhost and varies per environment (staging domains, preview URLs), so
// deriving from it would silently point a dev box at the wrong store's keys.
// An explicit env var fails loudly instead.

export const STORE_KEYS = ['onsite', 'bbq', 'solana', 'oko'] as const;

export type StoreKey = (typeof STORE_KEYS)[number];

const DEFAULT_STORE_KEY: StoreKey = 'onsite';

function resolveStoreKey(): StoreKey {
  const raw = process.env.NEXT_PUBLIC_STORE_KEY?.trim().toLowerCase();
  if (!raw) return DEFAULT_STORE_KEY;
  if ((STORE_KEYS as readonly string[]).includes(raw)) return raw as StoreKey;

  // Unknown value is a config mistake, not a reason to crash the storefront —
  // fall back to the default so pages still render, but make it visible.
  console.warn(
    `[store] NEXT_PUBLIC_STORE_KEY="${raw}" is not one of ${STORE_KEYS.join(', ')} — falling back to "${DEFAULT_STORE_KEY}".`,
  );
  return DEFAULT_STORE_KEY;
}

/** The active store slug, e.g. `onsite`. Used as the Redis key namespace. */
export const STORE_KEY: StoreKey = resolveStoreKey();

/** Human label for the admin UI. */
export const STORE_LABELS: Record<StoreKey, string> = {
  onsite: 'On-Site Storage Solutions',
  bbq: 'BBQ Containers',
  solana: 'Solana',
  oko: 'OKO',
};
