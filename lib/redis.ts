import { Redis } from '@upstash/redis'

// Same Upstash instance as the reference app — every key this app writes
// must stay under its own prefix (see services/abandonedCart.service.ts)
// so it can't collide with the reference app's own keys in that instance.
let client: Redis | null = null

export function getRedisClient(): Redis {
  const url = process.env.NEXT_UPSTASH_REDIS_REST_URL
  const token = process.env.NEXT_UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error('Upstash Redis is not configured — missing NEXT_UPSTASH_REDIS_REST_URL/NEXT_UPSTASH_REDIS_REST_TOKEN.')
  }

  client ??= new Redis({ url, token })
  return client
}
