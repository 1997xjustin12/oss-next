// The /all-city index builds every state's lists at once. Each state used to
// read every edited page itself (one identical read per state), which overran the
// prerender's cache-fill limit on a slow link and failed the build
// (2026-11-23). Concurrent callers now share one read; a later call reads again.
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

mock.module('next/cache', { namedExports: { cacheLife: () => {}, cacheTag: () => {} } })

let setReads = 0
mock.module('@/lib/redis', {
  namedExports: {
    getRedisClient: () => ({
      smembers: async () => {
        setReads++
        await new Promise((resolve) => setTimeout(resolve, 20))
        return []
      },
      mget: async (...keys: string[]) => keys.map(() => null),
      get: async () => null,
    }),
  },
})

const { getAllCityDirectory } = await import('@/services/allCity.service')

describe('the edited city pages, read for the /all-city lists', () => {
  it('one read for every state at once, and a fresh one afterwards', async () => {
    const states = await getAllCityDirectory()
    assert.ok(states.length > 1, `${states.length} states`)
    assert.equal(setReads, 1)
    await getAllCityDirectory()
    assert.equal(setReads, 2)
  })
})
