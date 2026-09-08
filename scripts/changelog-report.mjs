/**
 * Renders a dated list of updates into a PDF.
 *
 *   node scripts/changelog-report.mjs [since] [until]
 *   node scripts/changelog-report.mjs 2026-09-02
 *
 * Reads git directly rather than a hand-maintained list, so the document cannot
 * drift from what was actually shipped. Each entry carries its subject, the
 * first paragraph of its body — which is where the reason lives, not the
 * mechanics — and the files it touched.
 *
 * Branches other than the shipping one are reported separately and labelled as
 * unshipped, because a reader scanning this for "what is live" should not have
 * to work out which commits reached production.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Doc, RGB, writePdf } from './lib/pdf.mjs'

const SINCE = process.argv[2] ?? '2026-09-02'
const UNTIL = process.argv[3] ?? new Date().toISOString().slice(0, 10)
const SHIPPING = 'integrate-wp-render'
const OUT = `docs/updates/updates-${SINCE}-to-${UNTIL}.pdf`

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trimEnd()

const SEP = ''
const REC = ''

function commits(range) {
  const raw = git(
    'log', `--since=${SINCE}`, `--until=${UNTIL} 23:59:59`,
    '--date=short', `--format=${REC}%H${SEP}%h${SEP}%ad${SEP}%s${SEP}%b`, range,
  )
  return raw
    .split(REC)
    .filter((c) => c.trim())
    .map((chunk) => {
      const [sha, short, date, subject, body = ''] = chunk.split(SEP)
      return { sha: sha.trim(), short, date, subject, body }
    })
}

/**
 * The first paragraph of the body.
 *
 * That is where a commit says *why*; the rest is usually mechanism, which a
 * reader of a summary does not need. Trailers are dropped.
 */
function summary(body) {
  const cleaned = body
    .split('\n')
    .filter((l) => !/^(Co-Authored-By|Signed-off-by):/i.test(l.trim()))
    .join('\n')
    .trim()
  if (!cleaned) return ''
  const para = cleaned.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ' ').trim()
  // Strip the markdown emphasis commit bodies use for their lead-ins.
  return para.replace(/\*\*(.+?)\*\*/g, '$1')
}

function files(sha) {
  const out = git('show', '--stat=100', '--format=', sha)
  const rows = out.split('\n').map((l) => l.trim()).filter(Boolean)
  const total = rows.at(-1) ?? ''
  const names = rows.slice(0, -1).map((r) => r.split('|')[0].trim()).filter(Boolean)
  return { names, total }
}

const shipped = commits(SHIPPING)

// Anything on another local branch that has not reached the shipping branch.
const branches = git('for-each-ref', '--format=%(refname:short)', 'refs/heads/')
  .split('\n')
  .map((b) => b.trim())
  .filter((b) => b && b !== SHIPPING)
const unshipped = branches.flatMap((b) =>
  commits(`${SHIPPING}..${b}`).map((c) => ({ ...c, branch: b })),
)

const d = new Doc()

d.text('Updates', { size: 22, bold: true })
d.space(2)
d.text('oss_pages storefront', { size: 11, colour: RGB.mid })
d.rule()
d.pair('Period', `${SINCE} to ${UNTIL}`)
d.pair('Shipped to production', String(shipped.length))
if (unshipped.length) d.pair('On branches, not shipped', String(unshipped.length))
d.pair('Generated', new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC')

function section(title, list, { note } = {}) {
  if (!list.length) return
  d.rule({ gap: 14 })
  d.text(title, { size: 15, bold: true })
  if (note) { d.space(4); d.text(note, { size: 9, colour: RGB.muted }) }
  d.space(6)

  // Newest last reads as a story; newest first reads as a feed. A change log
  // covering a week is read as a story.
  for (const c of [...list].reverse()) {
    d.rule({ gap: 11 })
    d.chip(c.date, c.subject, { colour: c.branch ? RGB.amber : RGB.navy })
    d.text(c.branch ? `${c.short}   ·   branch: ${c.branch}` : c.short, {
      size: 8.5, colour: RGB.muted,
    })

    const why = summary(c.body)
    if (why) { d.space(4); d.text(why, { size: 9, colour: RGB.ink }) }

    const { names, total } = files(c.sha)
    if (names.length) {
      d.space(4)
      const shown = names.slice(0, 8)
      d.text(shown.join(',  ') + (names.length > shown.length ? `,  +${names.length - shown.length} more` : ''), {
        size: 8, colour: RGB.muted, indent: 8,
      })
      if (total) d.text(total, { size: 8, colour: RGB.muted, indent: 8 })
    }
  }
}

section('Shipped', shipped, {
  note: `On ${SHIPPING}, mirrored to oss-next/main. These are live.`,
})
section('Not yet shipped', unshipped, {
  note: 'Committed on a branch and not merged. Not on production.',
})

mkdirSync(dirname(OUT), { recursive: true })
const bytes = writePdf(d, OUT, `oss_pages updates ${SINCE} to ${UNTIL}`)
console.log(`${OUT} — ${d.pages.length} pages, ${(bytes / 1024).toFixed(1)} KB, ${shipped.length + unshipped.length} entries`)
