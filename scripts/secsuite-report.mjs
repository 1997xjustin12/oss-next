/**
 * Renders a secsuite remediation run into a PDF.
 *
 *   node scripts/secsuite-report.mjs
 *
 * Reads every `docs/security_audit/runs/run-*.json` and writes one PDF per run
 * to `docs/security_audit/secsuite-run-<n>-remediation.pdf`. Each run file is
 * the durable record of one audit and what was done about it — findings quoted
 * as the scanner reported them, the fixes, and the items that needed a decision
 * rather than a patch. Adding run 7 means dropping in `run-7.json` and
 * re-running this; nothing here needs editing.
 *
 * Deliberately separate from scripts/security-report.mjs. That one is shaped
 * around dependency CVEs — every finding has a package, a version range and a
 * list of advisories. A secsuite run is mostly code findings from semgrep,
 * madge, lizard and jscpd, which have none of those fields; forcing them into
 * that schema would have meant inventing package names for them.
 *
 * The PDF writer itself lives in scripts/lib/pdf.mjs, shared with the changelog
 * and dependency reports — hand-rolled because no PDF library is installed and
 * a report generator is not worth a production dependency.
 */

import { readFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Doc, RGB, writePdf } from './lib/pdf.mjs'

const SEVERITY = { critical: RGB.red, high: RGB.red, medium: RGB.amber, moderate: RGB.amber, low: RGB.muted }

const RUN_DIR = 'docs/security_audit/runs'
const OUT_DIR = 'docs/security_audit'

mkdirSync(RUN_DIR, { recursive: true })

const runs = readdirSync(RUN_DIR)
  .filter((f) => /^run-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((f) => JSON.parse(readFileSync(join(RUN_DIR, f), 'utf8')))

if (runs.length === 0) throw new Error(`no run files in ${RUN_DIR}`)

for (const run of runs) {
  const d = new Doc()

  // ── masthead ──────────────────────────────────────────────────────────────
  d.text(run.title, { size: 20, bold: true })
  d.space(3)
  d.text('On-Site Storage Solutions storefront  ·  oss_pages', { size: 10.5, colour: RGB.mid })
  d.rule()

  const s = run.source
  d.pair('Scanner', s.tool)
  d.pair('Source report', s.report)
  d.pair('Scanned', s.scanned)
  d.pair('Scan duration', s.duration)
  d.pair('Gate threshold', `${s.gate}  —  ${s.gateStatus}`)
  d.pair('Remediated', s.remediated)
  d.pair('Branch / commit', `${s.branch}  ·  ${s.commits}`)

  d.rule()
  const t = run.totals
  const o = run.outcome
  d.text(
    `${t.total} findings: ${t.critical} critical, ${t.medium} medium, ${t.low} low.   ` +
    `${o.fixed} fixed, ${o.safe} verified already safe, ${o.deferred} carried to tasks.`,
    { bold: true, size: 10.5 },
  )
  d.space(8)
  for (const p of run.lede) {
    d.text(p, { colour: RGB.mid })
    d.space(5)
  }

  // ── per-tool table ────────────────────────────────────────────────────────
  d.rule({ gap: 12 })
  d.text('What the audit found', { size: 14, bold: true })
  d.space(6)
  for (const row of run.tools) {
    const counts = [
      row.critical ? `${row.critical} critical` : null,
      row.medium ? `${row.medium} medium` : null,
      row.low ? `${row.low} low` : null,
    ].filter(Boolean).join(', ') || 'none'
    d.text(`${row.name}  —  ${row.checks}`, { size: 9.5, bold: true })
    d.text(`${counts}   ·   ${row.outcome}`, { size: 8.5, colour: RGB.muted, indent: 10 })
    d.space(4)
  }

  // ── fixed ─────────────────────────────────────────────────────────────────
  d.rule({ gap: 14 })
  d.text('Fixed', { size: 15, bold: true })
  d.space(2)
  d.text(
    'Every security-relevant finding in the report. Counts are the number of individual findings each item closes.',
    { size: 9, colour: RGB.muted },
  )

  for (const f of run.fixed) {
    d.rule({ gap: 11 })
    d.chip(f.severity, f.title, { colour: SEVERITY[f.severity] ?? RGB.muted })
    d.text(
      `${f.tool}   ·   ${f.ref}   ·   ${f.count} finding${f.count === 1 ? '' : 's'}`,
      { size: 8.5, colour: RGB.muted },
    )
    d.space(5)
    for (const p of f.body) {
      d.text(p, { size: 9.5 })
      d.space(4)
    }
  }

  // ── reviewed, already safe ────────────────────────────────────────────────
  d.rule({ gap: 14 })
  d.text('Reviewed, already safe', { size: 15, bold: true })
  d.space(5)
  d.text(run.safe.intro, { size: 9.5, colour: RGB.mid })
  d.space(7)
  for (const [where, why] of run.safe.rows) {
    d.text(where, { size: 9, bold: true, indent: 8 })
    d.text(why, { size: 9, colour: RGB.mid, indent: 18 })
    d.space(4)
  }
  d.space(2)
  d.text(run.safe.residual, { size: 9, colour: RGB.amber, indent: 8 })

  // ── tasks ─────────────────────────────────────────────────────────────────
  d.rule({ gap: 14 })
  d.text('Tasks — decisions, not fixes', { size: 15, bold: true })
  d.space(2)
  d.text(
    'These were not patched. Each one needs a judgement call, a schedule, or both.',
    { size: 9, colour: RGB.muted },
  )

  for (const task of run.tasks) {
    d.rule({ gap: 11 })
    d.chip(task.id, task.title, { colour: RGB.amber })
    d.text(`Owner: ${task.owner}   ·   Source: ${task.source}`, { size: 8.5, colour: RGB.muted })
    d.space(5)
    for (const p of task.body) {
      d.text(p, { size: 9.5 })
      d.space(4)
    }
    for (const b of task.bullets ?? []) {
      d.text(`•  ${b}`, { size: 9, indent: 8 })
      d.space(1)
    }
    if (task.bullets?.length) d.space(4)
    for (const p of task.after ?? []) {
      d.text(p, { size: 9.5 })
      d.space(4)
    }
  }

  // ── verification ──────────────────────────────────────────────────────────
  d.rule({ gap: 14 })
  d.text('Verification', { size: 15, bold: true })
  d.space(2)
  d.text(
    'A fix nobody checked is a claim. Each row is a check that was actually run, before and after.',
    { size: 9, colour: RGB.muted },
  )
  d.space(8)
  for (const [check, before, after] of run.verification) {
    d.text(check, { size: 9.5, bold: true })
    d.text(`before: ${before}`, { size: 8.5, colour: RGB.muted, indent: 10 })
    d.text(`after:  ${after}`, { size: 8.5, colour: RGB.green, indent: 10 })
    d.space(4)
  }

  if (run.notes?.length) {
    d.rule({ gap: 12 })
    d.text('Notes', { size: 13, bold: true })
    d.space(5)
    for (const n of run.notes) {
      d.text(n, { size: 9, colour: RGB.mid })
      d.space(5)
    }
  }

  const out = join(OUT_DIR, `secsuite-run-${run.run}-remediation.pdf`)
  const bytes = writePdf(d, out, `oss_pages secsuite run ${run.run} remediation`)
  console.log(`${out} — ${d.pages.length} pages, ${(bytes / 1024).toFixed(1)} KB`)
}
