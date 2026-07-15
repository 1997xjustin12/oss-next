import { getRedisClient } from '@/lib/redis'

// Same Redis instance as the reference app, different key namespace — do
// not drop this prefix, it's the only thing preventing collisions with the
// reference app's own `abandoned:{cartId}` keys in that shared instance.
const KEY_PREFIX = 'oss-next:abandoned:'

function abandonedCartKey(cartId: string): string {
  return `${KEY_PREFIX}${cartId}`
}

// Plain SET, no TTL — persists until overwritten by a fresh cart (see
// resetAbandonedCart-equivalent logic once cart create/update/close is
// wired) or deleted. Matches the reference app's behavior of never
// explicitly deleting old flags — they're just orphaned once nothing
// references that cart_id anymore.
export async function setAbandonedCartFlag(cartId: string): Promise<string> {
  const redis = getRedisClient()
  const timestamp = new Date().toISOString()
  await redis.set(abandonedCartKey(cartId), timestamp)
  return timestamp
}

export async function getAbandonedCartFlag(cartId: string): Promise<string | null> {
  const redis = getRedisClient()
  const value = await redis.get<string>(abandonedCartKey(cartId))
  return value ?? null
}
