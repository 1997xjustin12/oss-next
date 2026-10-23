// The converted WordPress markup gets the accessibility repairs Lighthouse
// asked for: form fields named by their (theme-hidden) labels, and
// `role="heading"` without a level removed.
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

process.env.NEXT_OSS_BACKEND_URL = 'https://backend.test'
process.env.NEXT_OSS_BACKEND_KEY = 'test-key'

mock.module('next/cache', { namedExports: { cacheLife: () => {}, cacheTag: () => {} } })

const { fetchWpPage } = await import('@/services/wp-pages.service')

// The shape of the embedded Zoho lead form, cut down.
const HTML = `
<form>
  <div class="zcwf_row"><div class="zcwf_col_lab"><label for="First_Name">First Name<span>*</span></label></div>
    <div class="zcwf_col_fld"><input type="text" id="First_Name" name="First Name"></div></div>
  <div class="zcwf_row"><label for="CONTACTCF23">Container Size*</label>
    <select id="CONTACTCF23"><option>20ft</option></select></div>
  <div class="zcwf_row"><label for="Named">Ignored</label><input id="Named" aria-label="Already named"></div>
  <div class="zcwf_row">I agree to the Privacy Policy
    <div class="dIB"><label class="newCustomchkbox-md"><input type="checkbox" id="privacyTool1"></label></div></div>
</form>
<ul><li><strong role="heading" style="color:#c60c29">$1,350</strong></li></ul>
<h4 role="heading" aria-level="4">Kept</h4>`

describe('WordPress page accessibility repairs', async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ title: 'T', html: HTML, css: '', global_css: '' }), { status: 200 })) as unknown as typeof fetch
  const page = await fetchWpPage(['some-page'])
  const html = page?.content ?? ''

  it('names fields from their label text, without the asterisk', () => {
    assert.match(html, /id="First_Name"[^>]*aria-label="First Name"|aria-label="First Name"[^>]*id="First_Name"/)
    assert.match(html, /aria-label="Container Size"/)
  })

  it('leaves a field that already has a name alone', () => {
    assert.match(html, /aria-label="Already named"/)
    assert.doesNotMatch(html, /aria-label="Ignored"/)
  })

  it('names a checkbox in an empty label from its row', () => {
    assert.match(html, /id="privacyTool1"[^>]*aria-label="I agree to the Privacy Policy"|aria-label="I agree to the Privacy Policy"[^>]*id="privacyTool1"/)
  })

  it('drops role="heading" without aria-level, keeps it with one', () => {
    assert.doesNotMatch(html, /<strong role="heading"/)
    assert.match(html, /<h4 role="heading" aria-level="4">Kept<\/h4>/)
  })
})
