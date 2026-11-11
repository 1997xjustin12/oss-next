// A page's keywords tag (lib/seoKeywords.ts): the focus keyphrase first, then
// the other keywords, each once, cleaned.
import { it } from 'node:test'
import assert from 'node:assert/strict'

const { metaKeywords, cleanKeyphrase } = await import('@/lib/seoKeywords')

it('the focus keyphrase leads, duplicates go (any case), blanks and invisible characters too', () => {
  assert.deepEqual(metaKeywords('Containers Atlanta​', ['storage', 'containers atlanta', ' ', 'Storage']), ['Containers Atlanta', 'storage'])
  assert.deepEqual(metaKeywords('', ['a', 'b']), ['a', 'b'])
  assert.deepEqual(metaKeywords('only this', undefined), ['only this'])
  assert.equal(metaKeywords(undefined, []), undefined)
  assert.equal(metaKeywords('  ', null), undefined)
})

it('cleanKeyphrase collapses spaces and strips zero-width characters', () => {
  assert.equal(cleanKeyphrase('  portable   storage​ temecula﻿ '), 'portable storage temecula')
  assert.equal(cleanKeyphrase(null), '')
})
