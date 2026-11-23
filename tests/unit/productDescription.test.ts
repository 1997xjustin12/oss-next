import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { productDescriptionHtml } from '@/lib/productDescription'

describe('productDescriptionHtml (an accessory\'s backend description)', () => {
  it('keeps the words and formatting, drops WordPress\'s styled spans', () => {
    const html = '<p><span style="font-weight: 400;">Heavy-duty <strong>60,000 lbs</strong> ramp.</span></p><ul><li class="x">Reflective</li></ul>'
    assert.equal(productDescriptionHtml(html), '<p>Heavy-duty <strong>60,000 lbs</strong> ramp.</p><ul><li>Reflective</li></ul>')
  })

  it('removes scripts, embeds, event handlers and unsafe links', () => {
    const out = productDescriptionHtml(
      '<p onclick="steal()">Hi<script>alert(1)</script></p><iframe src="https://x.test"></iframe>' +
        '<a href="javascript:alert(1)">bad</a> <a href="https://onsitestorage.com/x" onmouseover="x()">good</a>' +
        '<img src="http://insecure.test/a.jpg" onerror="x()"><style>p{}</style>',
    )
    assert.ok(!/script|iframe|onclick|onmouseover|onerror|javascript:|<style|insecure/i.test(out), out)
    assert.ok(out.includes('<a>bad</a>'), out)
    assert.ok(out.includes('<a href="https://onsitestorage.com/x" rel="noopener">good</a>'), out)
  })

  it('makes an h1 an h2 (the page has its own h1) and drops empty spacer paragraphs', () => {
    assert.equal(productDescriptionHtml('<h1>Specs</h1><p>&nbsp;</p><p>Steel.</p>'), '<h2>Specs</h2><p>Steel.</p>')
  })

  it('is empty when there is nothing to show', () => {
    for (const empty of [undefined, null, 42, '', '   ', '<p>&nbsp;</p>', '<script>x()</script>']) {
      assert.equal(productDescriptionHtml(empty), '', String(empty))
    }
  })
})
