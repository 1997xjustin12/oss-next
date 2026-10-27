// REVIEWS.io store reviews for the homepage (lib/storeReviews.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatReviewDate, mixReviews, reviewerInitials, toBackendReview, toStoreReview, REVIEWS_IO_STORE_URL } from '@/lib/storeReviews'
import type { Review } from '@/config/reviews'

const raw = {
  store_review_id: 101,
  comments: '  Everything was perfect!!  ',
  rating: 5,
  date_created: '2026-10-19 16:40:38',
  reviewer: { first_name: 'Tommy', last_name: 'Slagle' },
}

describe('toStoreReview', () => {
  it('turns a REVIEWS.io review into a card', () => {
    assert.deepEqual(toStoreReview(raw), {
      id: 'reviews.io-101',
      name: 'Tommy Slagle',
      avatar: '',
      rating: 5,
      date: 'Oct 19, 2026',
      text: 'Everything was perfect!!',
      source: 'reviews.io',
      url: REVIEWS_IO_STORE_URL,
    })
  })

  it('drops what the WordPress slider does not show: under 4 stars, or no text', () => {
    assert.equal(toStoreReview({ ...raw, rating: 3 }), null)
    assert.equal(toStoreReview({ ...raw, rating: '2' }), null)
    assert.equal(toStoreReview({ ...raw, comments: '   ' }), null)
    assert.ok(toStoreReview({ ...raw, rating: '4' }))
  })

  it('names an anonymous reviewer', () => {
    assert.equal(toStoreReview({ ...raw, reviewer: null })?.name, 'Verified customer')
  })
})

describe('helpers', () => {
  it('formats dates like the Google list, empty when unparseable', () => {
    assert.equal(formatReviewDate('2026-02-01 00:10:00'), 'Feb 1, 2026')
    assert.equal(formatReviewDate('soon'), '')
  })

  it('weaves two lists one from each in turn, then the rest', () => {
    const r = (name: string): Review => ({ name, avatar: '', rating: 5, date: '', text: name })
    assert.deepEqual(mixReviews([r('a1'), r('a2'), r('a3')], [r('b1')]).map((x) => x.name), ['a1', 'b1', 'a2', 'a3'])
    assert.deepEqual(mixReviews([], [r('b1')]).map((x) => x.name), ['b1'])
    assert.deepEqual(
      mixReviews([r('a1')], [r('b1'), r('b2')], [r('c1'), r('c2'), r('c3')]).map((x) => x.name),
      ['a1', 'b1', 'c1', 'b2', 'c2', 'c3'],
    )
  })

  it('makes initials for a card with no photo', () => {
    assert.equal(reviewerInitials('Tommy Slagle'), 'TS')
    assert.equal(reviewerInitials('Cher'), 'C')
    assert.equal(reviewerInitials('  '), '?')
  })
})

// Shape from docs/reference/REVIEWS_FLOW.md; the live feed is empty so far.
describe('toBackendReview', () => {
  const backend = {
    id: 7,
    rating: 5,
    title: 'Great container',
    comment: 'Arrived on time, exactly as described.',
    created_at: '2026-10-20T14:03:00Z',
    user: { username: 'jdoe', first_name: 'Jane', last_name: 'Doe' },
  }

  it('turns a backend review into a verified-buyer card', () => {
    assert.deepEqual(toBackendReview(backend), {
      id: 'onsite-7',
      name: 'Jane Doe',
      avatar: '',
      rating: 5,
      date: 'Oct 20, 2026',
      text: 'Arrived on time, exactly as described.',
      source: 'onsite',
    })
  })

  it('never shows an email address as the name', () => {
    assert.equal(toBackendReview({ ...backend, user: { username: 'jane@example.com' } })?.name, 'Verified buyer')
    assert.equal(toBackendReview({ ...backend, user: { username: 'jdoe' } })?.name, 'jdoe')
  })

  it('falls back to the title for text, and drops low ratings and empty reviews', () => {
    assert.equal(toBackendReview({ ...backend, comment: '' })?.text, 'Great container')
    assert.equal(toBackendReview({ ...backend, rating: 3 }), null)
    assert.equal(toBackendReview({ ...backend, comment: '', title: '' }), null)
  })
})
