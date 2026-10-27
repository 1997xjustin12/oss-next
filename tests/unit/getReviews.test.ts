// getReviews() (services/review.service.ts): every review source merged into
// one list. The two live sources are answered by a stubbed fetch, by URL.
import { afterEach, describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

process.env.NEXT_OSS_BACKEND_URL = 'https://backend.test/'
process.env.NEXT_OSS_BACKEND_KEY = 'test-key'

mock.module('next/cache', { namedExports: { cacheLife: () => {}, cacheTag: () => {} } })

const { getReviews } = await import('@/services/review.service')
const { REVIEWS } = await import('@/config/reviews')

const backendFeed = {
  results: [
    { id: 1, rating: 5, comment: 'Backend newest', created_at: '2026-10-20T10:00:00Z', user: { username: 'ann' } },
    { id: 2, rating: 2, comment: 'Too low to show', created_at: '2026-10-19T10:00:00Z', user: { username: 'bob' } },
  ],
}
const reviewsIoFeed = {
  reviews: [
    { store_review_id: 10, rating: 5, comments: 'REVIEWS.io one', date_created: '2026-10-21 09:00:00', reviewer: { first_name: 'Cy' } },
    { store_review_id: 11, rating: 4, comments: 'REVIEWS.io two', date_created: '2026-10-18 09:00:00', reviewer: { first_name: 'Di' } },
  ],
}

const realFetch = globalThis.fetch
function serve({ backend = true, reviewsIo = true } = {}) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.startsWith('https://backend.test/api/reviews/list')) {
      return backend ? Response.json(backendFeed) : new Response('down', { status: 503 })
    }
    if (url.startsWith('https://api.reviews.io/')) {
      return reviewsIo ? Response.json(reviewsIoFeed) : new Response('down', { status: 503 })
    }
    throw new Error(`unexpected fetch ${url}`)
  }) as typeof fetch
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('getReviews', () => {
  it('merges every source, one from each in turn, this site\'s own first', async () => {
    serve()
    const reviews = await getReviews()
    assert.deepEqual(
      reviews.slice(0, 5).map((r) => `${r.source ?? 'google'}:${r.text.slice(0, 14)}`),
      ['onsite:Backend newest', 'reviews.io:REVIEWS.io one', `google:${REVIEWS[0].text.slice(0, 14)}`, 'reviews.io:REVIEWS.io two', `google:${REVIEWS[1].text.slice(0, 14)}`],
    )
    // The 2-star backend review is filtered out; everything else is there.
    assert.equal(reviews.length, 1 + 2 + REVIEWS.length)
  })

  it('takes only the sources asked for, in that order, and a limit', async () => {
    serve()
    const live = await getReviews({ sources: ['reviews.io', 'onsite'] })
    assert.deepEqual(live.map((r) => r.source), ['reviews.io', 'onsite', 'reviews.io'])
    assert.equal((await getReviews({ limit: 4 })).length, 4)
    assert.equal((await getReviews({ limit: 0 })).length, 0)
  })

  it('leaves out a source that fails, and still returns the rest', async () => {
    serve({ backend: false, reviewsIo: false })
    const reviews = await getReviews()
    assert.equal(reviews.length, REVIEWS.length)
    assert.ok(reviews.every((r) => !r.source || r.source === 'google'))
  })
})
