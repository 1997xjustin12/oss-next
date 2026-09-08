/**
 * Renders the security-remediation batches into a single PDF.
 *
 *   node scripts/security-report.mjs
 *
 * Reads every `docs/security_audit/batches/batch-*.json` and writes
 * `docs/security_audit/remediation-report.pdf`. Each batch file is the durable
 * record of one round of fixes — findings quoted as the scanner reported them,
 * plus what was actually done about each. Adding batch 2 means dropping in
 * `batch-2.json` and re-running this; nothing here needs editing.
 *
 * The PDF writer itself lives in scripts/lib/pdf.mjs, shared with the changelog
 * report — hand-rolled because no PDF library is installed and a report
 * generator is not worth a production dependency.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { Doc, RGB, writePdf } from './lib/pdf.mjs'

const SEVERITY = { critical: RGB.red, high: RGB.red, moderate: RGB.amber, low: RGB.muted }

const BATCH_DIR = 'docs/security_audit/batches'
const OUT = 'docs/security_audit/remediation-report.pdf'

// ── content ─────────────────────────────────────────────────────────────────
const batches = readdirSync(BATCH_DIR)
  .filter((f) => /^batch-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((f) => JSON.parse(readFileSync(join(BATCH_DIR, f), 'utf8')))

if (batches.length === 0) throw new Error(`no batch files in ${BATCH_DIR}`)

const d = new Doc()

d.text('Security remediation report', { size: 21, bold: true })
d.space(2)
d.text('oss_pages storefront', { size: 11, colour: RGB.mid })
d.rule()

const latest = batches[batches.length - 1]
d.pair('Generated', new Date(latest.generated).toISOString().replace('T', ' ').slice(0, 16) + ' UTC')
/**
 * Rolled up by package, latest batch wins.
 *
 * Summing the batches would double-count anything deferred in one and fixed in
 * a later one — next, postcss and sharp appear in both — and would report three
 * findings still outstanding when none are. The per-batch sections below still
 * show each batch's own before/after, which is where the history lives.
 */
const current = new Map()
for (const b of batches) for (const f of b.findings) current.set(f.package, f.status)
const outstanding = [...current.values()].filter((s) => s !== 'FIXED').length

d.pair('Batches in this report', batches.map((b) => `#${b.batch}`).join(', '))
d.pair('Distinct findings', String(current.size))
d.pair('Fixed', String(current.size - outstanding))
d.pair('Still outstanding', String(outstanding))

d.rule()
d.text('Provenance', { size: 13, bold: true })
d.space(3)
d.text(
  'This report does not follow docs/security_audit/secsuite-run-40.pdf. That scan was run against a ' +
  'different codebase: every file it cites is rooted at /Users/johndenvercontaoi/Documents/OSS/frontend/, ' +
  'it reports next 15.0.3 against a pnpm-lock.yaml, and it flags packages (js-cookie, searchkit) and ' +
  'directories (src/, the menu-builder admin, the bbq-design and oko-design component sets) that do not ' +
  'exist in this repository. Its 22 semgrep and 3 gitleaks findings name source files that are not here, ' +
  'so applying them was not possible and reproducing them as if they were would have made this document ' +
  'wrong.',
  { colour: RGB.mid },
)
d.space(5)
d.text(
  'The findings below come from npm audit run against this repository instead, which is the same class of ' +
  'check (dependency CVEs) against the right target. Two items from the original report do still warrant ' +
  'action wherever they live, and are recorded at the end.',
  { colour: RGB.mid },
)

for (const batch of batches) {
  d.rule({ gap: 14 })
  d.text(`Batch ${batch.batch} — ${batch.title}`, { size: 15, bold: true })
  d.space(4)
  d.text(`Source: ${batch.source.tool}`, { size: 9, colour: RGB.muted })
  d.space(6)

  const t = batch.totals
  d.text(
    `Before: ${t.before.total} vulnerabilities (${t.before.critical} critical, ${t.before.high} high, ` +
    `${t.before.moderate} moderate, ${t.before.low} low).   ` +
    `After: ${t.after.total} (${t.after.critical} critical, ${t.after.high} high, ` +
    `${t.after.moderate} moderate, ${t.after.low} low).`,
    { bold: true },
  )

  // A dependency bump that nobody checked is a claim, not a fix. Where a batch
  // records how it was verified, the report carries it — that is the part a
  // reader needs in six months when something breaks and they are working out
  // whether this was to blame.
  if (batch.verification?.length) {
    d.space(8)
    d.text('Verification', { size: 10, bold: true, colour: RGB.mid })
    d.space(3)
    for (const v of batch.verification) {
      d.text(`•  ${v}`, { size: 9, colour: RGB.ink, indent: 8 })
      d.space(1)
    }
  }

  for (const f of batch.findings) {
    d.rule({ gap: 11 })
    d.chip(f.severity, `${f.package}   ${f.range}`, { colour: SEVERITY[f.severity] ?? RGB.muted })

    d.text(
      `${f.direct ? 'Direct dependency' : 'Transitive dependency'}` +
      (f.versionBefore ? `   ·   installed: ${f.versionBefore}` : ''),
      { size: 8.5, colour: RGB.muted },
    )
    d.space(4)

    d.text('Reported', { size: 9, bold: true, colour: RGB.mid })
    d.space(2)
    for (const a of f.advisories) {
      d.text(`•  ${a.title}`, { size: 9, colour: RGB.ink, indent: 8 })
      d.text(`${a.cwe ? a.cwe + '   ·   ' : ''}${a.url}`, { size: 8, colour: RGB.muted, indent: 18 })
      d.space(2)
    }

    d.space(3)
    d.text(f.status === 'FIXED' ? 'Fixed' : 'Deferred', {
      size: 9, bold: true, colour: f.status === 'FIXED' ? RGB.green : RGB.amber,
    })
    d.space(2)
    d.text(f.fix, { size: 9, colour: RGB.ink, indent: 8 })
    if (f.status === 'FIXED' && f.versionAfter) {
      d.space(2)
      d.text(`Now installed: ${f.versionAfter}`, { size: 8.5, colour: RGB.muted, indent: 8 })
    }
  }
}

d.rule({ gap: 14 })
d.text('Carried over from secsuite-run-40.pdf', { size: 13, bold: true })
d.space(4)
d.text(
  'Two findings in that report are credentials committed to source. The files are not in this repository, ' +
  'but a leaked key is leaked wherever it was committed, and deleting the line does not help because it ' +
  'remains in git history. Both need rotating at the provider, and this repository depends on braintree ' +
  '(^3.38.0), so if that gateway is shared the exposure reaches this app too.',
  { colour: RGB.mid },
)
d.space(6)
d.text('•  Braintree private key — src/app/lib/braintree.js:7', { size: 9, indent: 8 })
d.text('•  Elasticsearch API key — src/pages/api/es/searchkit.js:8 and :43', { size: 9, indent: 8 })
d.space(6)
d.text('Reported fix, verbatim: "Rotate the credential, remove it from source, and load from a secret manager."',
  { size: 9, colour: RGB.muted, indent: 8 })

// ── write ──────────────────────────────────────────────────────────────────
const bytes = writePdf(d, OUT, 'oss_pages security remediation')
console.log(`${OUT} — ${d.pages.length} pages, ${(bytes / 1024).toFixed(1)} KB`)
