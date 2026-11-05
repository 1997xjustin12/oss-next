// The certificate upload's limits (lib/taxExemptionFiles.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_CERTIFICATE_TOTAL_BYTES, certificateFilesError } from '@/lib/taxExemptionFiles'

const file = (size: number) => ({ size })

describe('certificateFilesError', () => {
  it('accepts no files, since the upload is optional', () => {
    assert.equal(certificateFilesError([]), '')
  })

  it('accepts three files at exactly the size limit', () => {
    assert.equal(certificateFilesError([file(MAX_CERTIFICATE_TOTAL_BYTES - 2), file(1), file(1)]), '')
  })

  it('refuses a fourth file, however small', () => {
    assert.match(certificateFilesError([file(1), file(1), file(1), file(1)]), /maximum of three/)
  })

  it('refuses files over the limit in total, not just one at a time', () => {
    const half = MAX_CERTIFICATE_TOTAL_BYTES / 2
    assert.match(certificateFilesError([file(half), file(half), file(1)]), /20MB/)
  })
})
